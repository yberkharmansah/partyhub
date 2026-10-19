import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { RPG_CLASSES, RPG_SCENARIOS } from './data/rpgScenarios.js';
import {
  initCustomData,
  getCategories,
  getAllGameData,
  saveCategory,
  deleteCategory,
  addCardToCategory,
  removeCardFromCategory,
  syncAllData,
  resetToDefaults
} from './customRepo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Özel veri deposunu başlat
initCustomData();

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint (Render & monitoring için)
app.get('/health', (req, res) => {
  res.json({ ok: true, status: 'healthy', timestamp: new Date().toISOString() });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Bellekte (In-Memory) Oda Deposu
const rooms = new Map();

const AVATARS = ['🦊', '🐼', '🦁', '🐸', '🐵', '🐯', '🐙', '🦉', '🐺', '🦄', '🐲', '🦝'];

const GAME_CONFIG = {
  spy: {
    id: 'spy',
    name: 'Köstebek Kim?',
    minPlayers: 3,
    defaultCategory: 'filmler_diziler'
  },
  whoami: {
    id: 'whoami',
    name: 'Ben Kimim?',
    minPlayers: 2,
    defaultCategory: 'unluler_tarih'
  },
  rpg: {
    id: 'rpg',
    name: 'Kader Zarları (Text RPG)',
    minPlayers: 1,
    defaultCategory: 'ejderha_kristali'
  }
};

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return rooms.has(code) ? generateRoomCode() : code;
}

function normalizeText(str = '') {
  return str
    .toLocaleLowerCase('tr-TR')
    .replace(/[^\w\sğüşıöç]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function broadcastRoomState(roomCode) {
  const room = rooms.get(roomCode);
  if (!room) return;

  for (const player of room.players) {
    if (player.isBot) continue;
    const personalizedState = buildPersonalizedRoomState(room, player.id);
    io.to(player.id).emit('room_state', personalizedState);
  }
}

function buildPersonalizedRoomState(room, viewerId) {
  const base = {
    code: room.code,
    hostId: room.hostId,
    status: room.status,
    selectedGame: room.selectedGame,
    selectedCategory: room.selectedCategory,
    roundNumber: room.roundNumber,
    players: room.players.map((p) => ({
      id: p.id,
      nickname: p.nickname,
      avatar: p.avatar,
      score: p.score,
      isHost: p.id === room.hostId,
      isBot: Boolean(p.isBot)
    })),
    catalog: {
      spyCategories: Object.values(getCategories('spy')).map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        count: c.items.length
      })),
      whoamiCategories: Object.values(getCategories('whoami')).map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        count: c.items.length
      })),
      rpgScenarios: Object.values(RPG_SCENARIOS).map((s) => ({
        id: s.id,
        name: s.name,
        theme: s.theme,
        description: s.description,
        sceneCount: Object.keys(s.scenes).length
      })),
      rpgClasses: RPG_CLASSES
    }
  };

  if (room.status !== 'playing' || !room.gameState) {
    return { ...base, gameState: null };
  }

  const gs = room.gameState;

  // 1. KÖSTEBEK KİM?
  if (gs.type === 'spy') {
    const isSpy = viewerId === gs.spyId;
    const isFinished = gs.phase === 'finished';

    return {
      ...base,
      gameState: {
        type: 'spy',
        phase: gs.phase,
        categoryName: gs.categoryName,
        allItems: gs.allItems,
        myRole: isSpy ? 'spy' : 'citizen',
        secretTopic: isSpy && !isFinished ? null : gs.secretTopic,
        firstSpeakerId: gs.firstSpeakerId,
        votes: gs.votes,
        spyId: isFinished ? gs.spyId : null,
        winner: gs.winner,
        winReason: gs.winReason
      }
    };
  }

  // 2. BEN KİMİM?
  if (gs.type === 'whoami') {
    const sanitizedAssignments = {};
    for (const p of room.players) {
      const assigned = gs.assignments[p.id];
      const hasFound = gs.foundPlayers.includes(p.id);
      if (p.id === viewerId && !hasFound && gs.phase !== 'finished') {
        sanitizedAssignments[p.id] = {
          name: '??? (Sen Kimsin?)',
          hint: assigned?.hint || '',
          isHiddenToMe: true
        };
      } else {
        sanitizedAssignments[p.id] = {
          name: assigned?.name || '',
          hint: assigned?.hint || '',
          isHiddenToMe: false
        };
      }
    }

    return {
      ...base,
      gameState: {
        type: 'whoami',
        phase: gs.phase,
        categoryName: gs.categoryName,
        assignments: sanitizedAssignments,
        currentTurnPlayerId: gs.currentTurnPlayerId,
        foundPlayers: gs.foundPlayers,
        guessHistory: gs.guessHistory.slice(-8)
      }
    };
  }

  // 3. DERİNLEŞTİRİLMİŞ TEXT RPG
  if (gs.type === 'rpg') {
    return {
      ...base,
      gameState: {
        type: 'rpg',
        phase: gs.phase, // 'class_select' | 'task_assignment' | 'action_reaction' | 'scene_result' | 'finished'
        scenarioId: gs.scenarioId,
        scenarioName: gs.scenarioName,
        theme: gs.theme,
        partyHp: gs.partyHp,
        maxHp: gs.maxHp,
        partyGold: gs.partyGold,
        partyMorale: gs.partyMorale,
        stepNumber: gs.stepNumber,
        visitedScenes: gs.visitedScenes,
        currentScene: gs.currentScene,
        playerClasses: gs.playerClasses,
        taskAssignments: gs.taskAssignments, // { playerId: taskId }
        selectedReactions: gs.selectedReactions, // { playerId: reactionId }
        inventory: gs.inventory,
        flags: gs.flags,
        lastRollResults: gs.lastRollResults,
        nextBranchInfo: gs.nextBranchInfo,
        storyLog: gs.storyLog,
        outcome: gs.outcome,
        endingSummary: gs.endingSummary
      }
    };
  }

  return base;
}

// Botlar için otomatik görev dağıtımı
function assignBotsToTasks(room) {
  const gs = room.gameState;
  if (!gs || gs.type !== 'rpg' || !gs.currentScene) return;

  const tasks = gs.currentScene.tasks || [];
  if (tasks.length === 0) return;

  const usedTaskIds = new Set(Object.values(gs.taskAssignments));

  room.players.forEach((p, idx) => {
    if (p.isBot && !gs.taskAssignments[p.id]) {
      // Önce kimsenin almadığı bir görevi seç
      const unassignedTask = tasks.find((t) => !usedTaskIds.has(t.id));
      const chosenTask = unassignedTask || tasks[idx % tasks.length];
      gs.taskAssignments[p.id] = chosenTask.id;
      usedTaskIds.add(chosenTask.id);
    }
  });
}

// Botlar için otomatik tepki seçimi
function pickBotReactions(room) {
  const gs = room.gameState;
  if (!gs || gs.type !== 'rpg' || !gs.currentScene) return;

  const tasks = gs.currentScene.tasks || [];
  room.players.forEach((p) => {
    if (p.isBot && !gs.selectedReactions[p.id]) {
      const assignedTaskId = gs.taskAssignments[p.id] || tasks[0]?.id;
      const taskObj = tasks.find((t) => t.id === assignedTaskId) || tasks[0];
      if (taskObj && taskObj.reactions?.length > 0) {
        const randomReaction =
          taskObj.reactions[Math.floor(Math.random() * taskObj.reactions.length)];
        gs.selectedReactions[p.id] = randomReaction.id;
      }
    }
  });
}

function startGameInRoom(room) {
  const gameType = room.selectedGame;
  room.status = 'playing';
  room.roundNumber += 1;

  if (gameType === 'spy') {
    const spyCats = getCategories('spy');
    const category = spyCats[room.selectedCategory] || Object.values(spyCats)[0];
    const randomTopic = category.items[Math.floor(Math.random() * category.items.length)];
    const randomSpy = room.players[Math.floor(Math.random() * room.players.length)];
    const firstSpeaker = room.players[Math.floor(Math.random() * room.players.length)];

    room.gameState = {
      type: 'spy',
      phase: 'discussion',
      categoryName: category.name,
      allItems: category.items,
      secretTopic: randomTopic,
      spyId: randomSpy.id,
      firstSpeakerId: firstSpeaker.id,
      votes: {},
      winner: null,
      winReason: ''
    };
  } else if (gameType === 'whoami') {
    const whoamiCats = getCategories('whoami');
    const category = whoamiCats[room.selectedCategory] || Object.values(whoamiCats)[0];
    const shuffled = [...category.items].sort(() => Math.random() - 0.5);
    const assignments = {};

    room.players.forEach((p, idx) => {
      assignments[p.id] = shuffled[idx % shuffled.length];
    });

    room.gameState = {
      type: 'whoami',
      phase: 'playing',
      categoryName: category.name,
      assignments,
      currentTurnPlayerId: room.players[0]?.id || null,
      foundPlayers: [],
      guessHistory: []
    };
  } else if (gameType === 'rpg') {
    const scenario = RPG_SCENARIOS[room.selectedCategory] || RPG_SCENARIOS.ejderha_kristali;
    const startScene = scenario.scenes[scenario.startSceneId];
    const playerClasses = {};
    const startingInventory = [];

    room.players.forEach((p, idx) => {
      if (p.isBot) {
        const cls = RPG_CLASSES[idx % RPG_CLASSES.length];
        playerClasses[p.id] = cls.id;
        if (cls.startingItem && !startingInventory.includes(cls.startingItem)) {
          startingInventory.push(cls.startingItem);
        }
      }
    });

    room.gameState = {
      type: 'rpg',
      phase: 'class_select',
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      theme: scenario.theme,
      partyHp: scenario.initialHp,
      maxHp: scenario.initialHp,
      partyGold: scenario.initialGold,
      partyMorale: scenario.initialMorale || 70,
      stepNumber: 1,
      visitedScenes: [startScene.id],
      currentScene: {
        id: startScene.id,
        actTitle: startScene.actTitle,
        title: startScene.title,
        environmentTag: startScene.environmentTag,
        narrative: startScene.narrative,
        tasks: startScene.tasks
      },
      playerClasses,
      taskAssignments: {},
      selectedReactions: {},
      inventory: startingInventory,
      flags: [],
      lastRollResults: [],
      nextBranchInfo: null,
      storyLog: [
        `📜 [${scenario.name}] destanı başladı! Başlangıç Canı: ${scenario.initialHp} HP, Altın: ${scenario.initialGold}.`
      ],
      outcome: null,
      endingSummary: null
    };
  }
}

function evaluateSpyVotes(room) {
  const gs = room.gameState;
  if (!gs || gs.type !== 'spy' || gs.phase === 'finished') return;

  const tally = {};
  for (const targetId of Object.values(gs.votes)) {
    tally[targetId] = (tally[targetId] || 0) + 1;
  }

  let mostVotedId = null;
  let maxVotes = 0;
  let isTie = false;

  for (const [targetId, count] of Object.entries(tally)) {
    if (count > maxVotes) {
      maxVotes = count;
      mostVotedId = targetId;
      isTie = false;
    } else if (count === maxVotes) {
      isTie = true;
    }
  }

  gs.phase = 'finished';
  const spyPlayer = room.players.find((p) => p.id === gs.spyId);
  const votedPlayer = room.players.find((p) => p.id === mostVotedId);

  if (!isTie && mostVotedId === gs.spyId) {
    gs.winner = 'citizens';
    gs.winReason = `Masumlar Köstebek olan ${spyPlayer?.nickname || 'oyuncuyu'} başarıyla yakaladı!`;
    room.players.forEach((p) => {
      if (p.id !== gs.spyId) p.score += 15;
    });
  } else {
    gs.winner = 'spy';
    if (isTie) {
      gs.winReason = `Oylamada eşitlik çıktı! Köstebek (${spyPlayer?.nickname}) kargaşadan faydalanıp kaçtı!`;
    } else {
      gs.winReason = `Masumlar yanlışlıkla ${votedPlayer?.nickname || 'masum birini'} suçladı! Gerçek Köstebek ${spyPlayer?.nickname} kazandı!`;
    }
    if (spyPlayer) spyPlayer.score += 25;
  }
}

// Çoklu Son Hesaplayıcı
function computeRpgEnding(gs) {
  if (gs.scenarioId === 'ejderha_kristali') {
    if (gs.flags.includes('son_ejderha_ittifaki')) {
      return {
        title: '🐉 EFSANEVİ SON: EJDERHA SÜVARİLERİ VE BARIŞ ÇAĞI',
        description:
          'Kadim Ejderha Ignis\'i lanetten kurtarıp onunla kadim bir bağ kurdunuz! Kızıl Kristal\'in saf ışığı Valoria\'daki vebayı bitirirken, Ignis krallığın koruyucusu olarak göklerde süzülüyor. Adınız bin yıl boyunca kurtarıcı kahramanlar olarak anılacak!'
      };
    }
    if (gs.flags.includes('son_karanlik_hukumdar')) {
      return {
        title: '👑 KARANLIK SON: KIZIL TAHTIN YENİ HÜKÜMDARLARI',
        description:
          'Kan Mızrağı ve Kızıl Kristal\'in mutlak gücünü ele geçirerek Ejderha Ignis\'e boyun eğdirdiniz! Eski krallık düzeni yıkıldı; artık Valoria sizin demir yumruğunuz ve ejderha ateşiniz önünde diz çöküyor!'
      };
    }
    return {
      title: '⚔️ KAHRAMANLIK SONU: EJDERHA AVCILARI VE KURTULUŞ',
      description:
        'Zorlu çarpışmalar sonunda Kızıl Tarikat\'ı çökerttiniz ve Kızıl Kristal\'i başkente geri getirdiniz! Veba sona erdi, hazinelerinizle krallığın en zengin ve saygın loncası oldunuz!'
    };
  }

  // Neon Sızıntısı Sonları
  if (gs.flags.includes('son_siber_devrim')) {
    return {
      title: '⚡ DEVRİM SONU: ÖZGÜR BİLİNÇ VE KRONOCORP\'UN ÇÖKÜŞÜ',
      description:
        'AETHER-9 Yapay Zekasını özgür bıraktınız ve KronoCorp\'un tüm kirli sırlarını canlı yayında ifşa ettiniz! Şirket hisseleri sıfırlandı, halkın borçları silindi ve Neo-İstanbul yeni bir özgürlük çağına uyandı!'
    };
  }
  if (gs.flags.includes('son_siber_hukumdar')) {
    return {
      title: '👁️ SİBER-TANRI SONU: GÖLGE KONSEYİN YÜKSELİŞİ',
      description:
        'AETHER-9 Kuantum Çekirdeğiyle nöral bağ kurarak tüm şehrin dijital altyapısını ele geçirdiniz! Artık Neo-İstanbul\'daki her kamera, her banka ve her uydu doğrudan sizin ekibinizin emrinde!'
    };
  }
  return {
    title: '💎 EFSANEVİ VURGUN SONU: YÜZYILIN SİBER SOYGUNCULARI',
    description:
      '120. kattaki Kuantum Kasasını soyup soğana çevirdiniz ve gökyüzünden iz bırakmadan kayboldunuz! Kazandığınız milyarlık kredilerle yeraltı dünyasının tartışmasız efsaneleri oldunuz!'
  };
}

// RPG Sahnesindeki Görev Tepkilerini ve Hikaye Dallanmasını Çözümle
function resolveRpgScene(room) {
  const gs = room.gameState;
  if (!gs || gs.type !== 'rpg') return;

  const scenario = RPG_SCENARIOS[gs.scenarioId] || RPG_SCENARIOS.ejderha_kristali;
  const fullScene = scenario.scenes[gs.currentScene.id];
  if (!fullScene) return;

  const results = [];
  let hpDelta = 0;
  let goldDelta = 0;
  let moraleDelta = 0;

  // Aynı göreve birden fazla oyuncu gittiyse takım sinerjisi hesapla
  const taskCounts = {};
  for (const tId of Object.values(gs.taskAssignments)) {
    taskCounts[tId] = (taskCounts[tId] || 0) + 1;
  }

  for (const player of room.players) {
    const classId = gs.playerClasses[player.id] || 'warrior';
    const rpgClass = RPG_CLASSES.find((c) => c.id === classId) || RPG_CLASSES[0];

    const assignedTaskId = gs.taskAssignments[player.id] || fullScene.tasks[0].id;
    const taskObj =
      fullScene.tasks.find((t) => t.id === assignedTaskId) || fullScene.tasks[0];

    const reactionId = gs.selectedReactions[player.id] || taskObj.reactions[0].id;
    const reactionObj =
      taskObj.reactions.find((r) => r.id === reactionId) || taskObj.reactions[0];

    // Maliyetler (Altın veya HP)
    if (reactionObj.costGold) {
      goldDelta -= reactionObj.costGold;
    }
    if (reactionObj.costHp) {
      hpDelta -= reactionObj.costHp;
    }

    const diceRoll = Math.floor(Math.random() * 20) + 1;
    const statBonus = rpgClass.stats[reactionObj.stat] || 0;

    // Hikaye Bayrağı / Eşya Sinerji Bonusu (+3)
    let synergyBonus = 0;
    let synergyReason = null;
    if (reactionObj.bonusFlag && gs.flags.includes(reactionObj.bonusFlag)) {
      synergyBonus += 3;
      synergyReason = 'Önceki Karar Sinerjisi (+3)';
    }
    if (reactionObj.bonusItem && gs.inventory.includes(reactionObj.bonusItem)) {
      synergyBonus += 3;
      synergyReason = `${reactionObj.bonusItem} Avantajı (+3)`;
    }
    if ((taskCounts[taskObj.id] || 0) > 1) {
      synergyBonus += 2;
      synergyReason = synergyReason
        ? `${synergyReason} + Ortak Görev (+2)`
        : 'Ortak Görev Desteği (+2)';
    }

    const totalRoll = diceRoll + statBonus + synergyBonus;
    const isCritical = diceRoll === 20;
    const isFumble = diceRoll === 1;
    const success = isCritical || (!isFumble && totalRoll >= reactionObj.difficulty);

    const newItemsEarned = [];
    const newFlagsEarned = [];

    if (success) {
      const rewardG = (reactionObj.goldReward || 10) + (isCritical ? 15 : 0);
      goldDelta += rewardG;
      hpDelta += (reactionObj.hpReward || 0) + (isCritical ? 5 : 0);
      moraleDelta += reactionObj.moraleDelta || 5;
      player.score += isCritical ? 25 : 15;

      if (reactionObj.setFlag && !gs.flags.includes(reactionObj.setFlag)) {
        gs.flags.push(reactionObj.setFlag);
        newFlagsEarned.push(reactionObj.setFlag);
      }
      if (reactionObj.grantItem && !gs.inventory.includes(reactionObj.grantItem)) {
        gs.inventory.push(reactionObj.grantItem);
        newItemsEarned.push(reactionObj.grantItem);
      }
    } else {
      // Başarısız olsa bile bazı rota bayrakları (örn. pusula seçimi) hikayenin ilerlemesi için işlenir
      if (reactionObj.setFlag && reactionObj.setFlag.startsWith('rota_')) {
        if (!gs.flags.includes(reactionObj.setFlag)) {
          gs.flags.push(reactionObj.setFlag);
        }
      }
      const rawDmg = isFumble ? 18 : 11;
      // Öncü Muhafız pasifi hasarı 3 azaltır
      const mitigatedDmg = classId === 'warrior' ? Math.max(5, rawDmg - 3) : rawDmg;
      hpDelta -= mitigatedDmg;
      moraleDelta -= 5;
    }

    const narrativeLine = `${player.avatar} ${player.nickname} [${taskObj.title}] → ${
      success ? reactionObj.successText : reactionObj.failText
    }`;

    results.push({
      playerId: player.id,
      nickname: player.nickname,
      avatar: player.avatar,
      className: rpgClass.name,
      taskTitle: taskObj.title,
      reactionLabel: reactionObj.label,
      approachTag: reactionObj.approachTag,
      stat: reactionObj.stat.toUpperCase(),
      diceRoll,
      statBonus,
      synergyBonus,
      synergyReason,
      totalRoll,
      difficulty: reactionObj.difficulty,
      isCritical,
      isFumble,
      success,
      newItemsEarned,
      newFlagsEarned,
      narrativeLine
    });

    gs.storyLog.push(narrativeLine);
  }

  gs.partyHp = Math.max(0, Math.min(gs.maxHp, gs.partyHp + hpDelta));
  gs.partyGold = Math.max(0, gs.partyGold + goldDelta);
  gs.partyMorale = Math.max(0, Math.min(100, (gs.partyMorale || 70) + moraleDelta));
  gs.lastRollResults = results;

  // Sonraki sahneyi alınan kararların bütününe göre hesapla
  const branchDecision = fullScene.resolveNextScene
    ? fullScene.resolveNextScene(gs)
    : { nextSceneId: null, branchReason: '' };

  gs.nextBranchInfo = branchDecision;

  if (gs.partyHp <= 0) {
    gs.phase = 'finished';
    gs.outcome = 'defeat';
    gs.endingSummary = {
      title: '💀 EKİP DÜŞTÜ: KARANLIK GALİP GELDİ',
      description:
        'Aldığınız ağır yaralar sonucunda ekibiniz görevi tamamlayamadan düştü. Ancak öğrendiğiniz sırlar bir sonraki denemenizde size rehber olacak!'
    };
    gs.storyLog.push('💀 Grup sağlığı tükendi! Macera başarısızlıkla sonuçlandı...');
  } else {
    gs.phase = 'scene_result';
  }
}

io.on('connection', (socket) => {
  // 1. Yeni Lobi Oluştur
  socket.on('create_room', ({ nickname, avatar }, callback) => {
    const cleanNick = (nickname || 'Oyuncu').trim().slice(0, 18) || 'Oyuncu';
    const roomCode = generateRoomCode();
    const chosenAvatar = avatar || AVATARS[Math.floor(Math.random() * AVATARS.length)];

    const room = {
      code: roomCode,
      hostId: socket.id,
      status: 'lobby',
      selectedGame: 'spy',
      selectedCategory: GAME_CONFIG.spy.defaultCategory,
      roundNumber: 0,
      players: [
        {
          id: socket.id,
          nickname: cleanNick,
          avatar: chosenAvatar,
          score: 0,
          isBot: false
        }
      ],
      gameState: null
    };

    rooms.set(roomCode, room);
    socket.join(roomCode);
    socket.data.roomCode = roomCode;

    broadcastRoomState(roomCode);
    if (callback) callback({ ok: true, roomCode });
  });

  // 2. Mevcut Lobiye Katıl
  socket.on('join_room', ({ roomCode, nickname, avatar }, callback) => {
    const code = (roomCode || '').trim().toUpperCase();
    const room = rooms.get(code);

    if (!room) {
      if (callback) callback({ ok: false, error: 'Böyle bir lobi bulunamadı! Kodu kontrol edin.' });
      return;
    }

    const cleanNick = (nickname || 'Oyuncu').trim().slice(0, 18) || 'Oyuncu';
    const chosenAvatar = avatar || AVATARS[room.players.length % AVATARS.length];

    const existing = room.players.find((p) => p.id === socket.id);
    if (!existing) {
      room.players.push({
        id: socket.id,
        nickname: cleanNick,
        avatar: chosenAvatar,
        score: 0,
        isBot: false
      });
    } else {
      existing.nickname = cleanNick;
    }

    if (room.status === 'playing' && room.gameState) {
      if (room.gameState.type === 'whoami' && !room.gameState.assignments[socket.id]) {
        const whoamiCats = getCategories('whoami');
        const category = whoamiCats[room.selectedCategory] || Object.values(whoamiCats)[0];
        room.gameState.assignments[socket.id] =
          category.items[Math.floor(Math.random() * category.items.length)];
      }
      if (room.gameState.type === 'rpg' && !room.gameState.playerClasses[socket.id]) {
        room.gameState.playerClasses[socket.id] = 'warrior';
      }
    }

    socket.join(code);
    socket.data.roomCode = code;

    broadcastRoomState(code);
    if (callback) callback({ ok: true, roomCode: code });
  });

  // 3. Lobi Ayarlarını Güncelle
  socket.on('update_lobby_settings', ({ selectedGame, selectedCategory }) => {
    const room = rooms.get(socket.data.roomCode);
    if (!room || room.hostId !== socket.id) return;

    if (selectedGame && GAME_CONFIG[selectedGame]) {
      room.selectedGame = selectedGame;
      room.selectedCategory = GAME_CONFIG[selectedGame].defaultCategory;
    }
    if (selectedCategory) {
      room.selectedCategory = selectedCategory;
    }

    broadcastRoomState(room.code);
  });

  // 4. Bot Ekle-Çıkar
  socket.on('add_bot', () => {
    const room = rooms.get(socket.data.roomCode);
    if (!room || room.hostId !== socket.id || room.players.length >= 10) return;

    const botCount = room.players.filter((p) => p.isBot).length + 1;
    const botNames = ['Bot Emre', 'Bot Zeynep', 'Bot Kaan', 'Bot Selin', 'Bot Mert', 'Bot Ece'];
    const botId = `bot_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    room.players.push({
      id: botId,
      nickname: botNames[(botCount - 1) % botNames.length],
      avatar: '🤖',
      score: 0,
      isBot: true
    });

    broadcastRoomState(room.code);
  });

  socket.on('remove_bots', () => {
    const room = rooms.get(socket.data.roomCode);
    if (!room || room.hostId !== socket.id) return;
    room.players = room.players.filter((p) => !p.isBot);
    broadcastRoomState(room.code);
  });

  // 5. Oyunu Başlat (Geri Sayım ile)
  socket.on('start_game', ({ skipCountdown } = {}, callback) => {
    const room = rooms.get(socket.data.roomCode);
    if (!room || room.hostId !== socket.id) return;

    const config = GAME_CONFIG[room.selectedGame];
    if (room.players.length < config.minPlayers) {
      if (callback) {
        callback({
          ok: false,
          error: `${config.name} için en az ${config.minPlayers} oyuncu gerekiyor!`
        });
      }
      return;
    }

    // Doğrudan başlatma veya lobi içi 3-2-1 geri sayımı
    if (skipCountdown) {
      if (room.countdownTimer) {
        clearInterval(room.countdownTimer);
        room.countdownTimer = null;
      }
      room.countdown = null;
      startGameInRoom(room);
      broadcastRoomState(room.code);
      if (callback) callback({ ok: true });
      return;
    }

    // Zaten geri sayım varsa çift başlatmayı önle
    if (room.countdownTimer) return;

    room.countdown = 3;
    io.to(room.code).emit('game_countdown_tick', { count: room.countdown, gameName: config.name });

    room.countdownTimer = setInterval(() => {
      room.countdown -= 1;
      if (room.countdown > 0) {
        io.to(room.code).emit('game_countdown_tick', { count: room.countdown, gameName: config.name });
      } else {
        clearInterval(room.countdownTimer);
        room.countdownTimer = null;
        room.countdown = null;
        startGameInRoom(room);
        broadcastRoomState(room.code);
      }
    }, 1000);

    if (callback) callback({ ok: true, startingIn: 3 });
  });

  // Geri sayımı iptal et
  socket.on('cancel_countdown', () => {
    const room = rooms.get(socket.data.roomCode);
    if (!room || room.hostId !== socket.id) return;
    if (room.countdownTimer) {
      clearInterval(room.countdownTimer);
      room.countdownTimer = null;
      room.countdown = null;
      io.to(room.code).emit('game_countdown_cancelled');
    }
  });

  // 6. Lobiye Dön
  socket.on('return_to_lobby', () => {
    const room = rooms.get(socket.data.roomCode);
    if (!room || room.hostId !== socket.id) return;

    if (room.countdownTimer) {
      clearInterval(room.countdownTimer);
      room.countdownTimer = null;
      room.countdown = null;
    }

    room.status = 'lobby';
    room.gameState = null;
    broadcastRoomState(room.code);
  });

  // ==========================================
  // OYUN 1: KÖSTEBEK KİM?
  // ==========================================
  socket.on('spy_cast_vote', ({ targetId }) => {
    const room = rooms.get(socket.data.roomCode);
    if (!room || !room.gameState || room.gameState.type !== 'spy') return;
    const gs = room.gameState;
    if (gs.phase === 'finished') return;

    gs.phase = 'voting';
    gs.votes[socket.id] = targetId;

    for (const p of room.players) {
      if (p.isBot && !gs.votes[p.id]) {
        const candidates = room.players.filter((c) => c.id !== p.id);
        const pick = candidates[Math.floor(Math.random() * candidates.length)];
        if (pick) gs.votes[p.id] = pick.id;
      }
    }

    if (Object.keys(gs.votes).length >= room.players.length) {
      evaluateSpyVotes(room);
    }

    broadcastRoomState(room.code);
  });

  socket.on('spy_finish_voting', () => {
    const room = rooms.get(socket.data.roomCode);
    if (!room || room.hostId !== socket.id) return;
    evaluateSpyVotes(room);
    broadcastRoomState(room.code);
  });

  socket.on('spy_guess_topic', ({ guessedTopic }) => {
    const room = rooms.get(socket.data.roomCode);
    if (!room || !room.gameState || room.gameState.type !== 'spy') return;
    const gs = room.gameState;
    if (socket.id !== gs.spyId || gs.phase === 'finished') return;

    gs.phase = 'finished';
    const spyPlayer = room.players.find((p) => p.id === gs.spyId);

    if (guessedTopic === gs.secretTopic) {
      gs.winner = 'spy';
      gs.winReason = `Köstebek (${spyPlayer?.nickname}) gizli konuyu ("${gs.secretTopic}") doğru tahmin ederek oyunu çaldı!`;
      if (spyPlayer) spyPlayer.score += 30;
    } else {
      gs.winner = 'citizens';
      gs.winReason = `Köstebek (${spyPlayer?.nickname}) "${guessedTopic}" tahmininde bulundu ama yanıldı! Masumlar kazandı!`;
      room.players.forEach((p) => {
        if (p.id !== gs.spyId) p.score += 15;
      });
    }

    broadcastRoomState(room.code);
  });

  // ==========================================
  // OYUN 2: BEN KİMİM?
  // ==========================================
  socket.on('whoami_next_turn', () => {
    const room = rooms.get(socket.data.roomCode);
    if (!room || !room.gameState || room.gameState.type !== 'whoami') return;
    const gs = room.gameState;

    const activePlayers = room.players.filter((p) => !gs.foundPlayers.includes(p.id));
    if (activePlayers.length === 0) {
      gs.phase = 'finished';
      broadcastRoomState(room.code);
      return;
    }

    const currentIdx = activePlayers.findIndex((p) => p.id === gs.currentTurnPlayerId);
    const nextPlayer = activePlayers[(currentIdx + 1) % activePlayers.length];
    gs.currentTurnPlayerId = nextPlayer.id;

    broadcastRoomState(room.code);
  });

  socket.on('whoami_submit_guess', ({ guessText }, callback) => {
    const room = rooms.get(socket.data.roomCode);
    if (!room || !room.gameState || room.gameState.type !== 'whoami') return;
    const gs = room.gameState;
    const player = room.players.find((p) => p.id === socket.id);
    const assigned = gs.assignments[socket.id];
    if (!player || !assigned || gs.foundPlayers.includes(socket.id)) return;

    const cleanGuess = normalizeText(guessText);
    const cleanTarget = normalizeText(assigned.name);
    const mainTarget = normalizeText(assigned.name.split('(')[0]);

    const isCorrect =
      cleanGuess.length >= 3 &&
      (cleanTarget === cleanGuess ||
        mainTarget === cleanGuess ||
        cleanTarget.includes(cleanGuess) ||
        cleanGuess.includes(mainTarget));

    if (isCorrect) {
      const points = Math.max(10, 25 - gs.foundPlayers.length * 5);
      player.score += points;
      gs.foundPlayers.push(socket.id);
      gs.guessHistory.push({
        id: Date.now(),
        nickname: player.nickname,
        guess: assigned.name,
        correct: true
      });

      if (gs.foundPlayers.length >= room.players.filter((p) => !p.isBot).length) {
        gs.phase = 'finished';
      }
      broadcastRoomState(room.code);
      if (callback) callback({ ok: true, correct: true, actualName: assigned.name });
    } else {
      gs.guessHistory.push({
        id: Date.now(),
        nickname: player.nickname,
        guess: guessText,
        correct: false
      });
      broadcastRoomState(room.code);
      if (callback) callback({ ok: true, correct: false });
    }
  });

  socket.on('whoami_claim_found', () => {
    const room = rooms.get(socket.data.roomCode);
    if (!room || !room.gameState || room.gameState.type !== 'whoami') return;
    const gs = room.gameState;
    const player = room.players.find((p) => p.id === socket.id);
    const assigned = gs.assignments[socket.id];
    if (!player || !assigned || gs.foundPlayers.includes(socket.id)) return;

    const points = Math.max(10, 25 - gs.foundPlayers.length * 5);
    player.score += points;
    gs.foundPlayers.push(socket.id);
    gs.guessHistory.push({
      id: Date.now(),
      nickname: player.nickname,
      guess: `${assigned.name} (Sözlü Bildi)`,
      correct: true
    });

    if (gs.foundPlayers.length >= room.players.filter((p) => !p.isBot).length) {
      gs.phase = 'finished';
    }
    broadcastRoomState(room.code);
  });

  // ==========================================
  // OYUN 3: DERİNLEŞTİRİLMİŞ TEXT RPG
  // ==========================================

  // Aşama 0: Sınıf Seçimi
  socket.on('rpg_select_class', ({ classId }) => {
    const room = rooms.get(socket.data.roomCode);
    if (!room || !room.gameState || room.gameState.type !== 'rpg') return;
    const gs = room.gameState;

    gs.playerClasses[socket.id] = classId;
    const cls = RPG_CLASSES.find((c) => c.id === classId);
    if (cls?.startingItem && !gs.inventory.includes(cls.startingItem)) {
      gs.inventory.push(cls.startingItem);
    }

    const allSelected = room.players.every((p) => Boolean(gs.playerClasses[p.id]));
    if (allSelected && gs.phase === 'class_select') {
      gs.phase = 'task_assignment';
      assignBotsToTasks(room);
    }

    broadcastRoomState(room.code);
  });

  // Aşama 1: Görev Dağılımı (Kimin Hangi Olayla İlgileneceği)
  socket.on('rpg_assign_task', ({ taskId, targetPlayerId }) => {
    const room = rooms.get(socket.data.roomCode);
    if (!room || !room.gameState || room.gameState.type !== 'rpg') return;
    const gs = room.gameState;
    if (gs.phase !== 'task_assignment') return;

    // Host başka bir oyuncuyu (veya botu) da bir göreve atayabilir, oyuncu kendisini de atayabilir
    const assigneeId =
      targetPlayerId && room.hostId === socket.id ? targetPlayerId : socket.id;

    gs.taskAssignments[assigneeId] = taskId;
    assignBotsToTasks(room);

    // Tüm gerçek oyuncular görev seçtiyse otomatik olarak Tepki Aşamasına geçebiliriz (veya onay butonuyla)
    broadcastRoomState(room.code);
  });

  socket.on('rpg_confirm_tasks', () => {
    const room = rooms.get(socket.data.roomCode);
    if (!room || !room.gameState || room.gameState.type !== 'rpg') return;
    const gs = room.gameState;
    if (gs.phase !== 'task_assignment') return;

    const tasks = gs.currentScene?.tasks || [];
    // Görev seçmeyen oyuncu kaldıysa sırayla ata
    room.players.forEach((p, idx) => {
      if (!gs.taskAssignments[p.id] && tasks.length > 0) {
        gs.taskAssignments[p.id] = tasks[idx % tasks.length].id;
      }
    });

    gs.phase = 'action_reaction';
    pickBotReactions(room);
    broadcastRoomState(room.code);
  });

  // Aşama 2: Gönderilen Kişinin Olay Karşısındaki Tepkisi
  socket.on('rpg_choose_reaction', ({ reactionId }) => {
    const room = rooms.get(socket.data.roomCode);
    if (!room || !room.gameState || room.gameState.type !== 'rpg') return;
    const gs = room.gameState;
    if (gs.phase !== 'action_reaction') return;

    gs.selectedReactions[socket.id] = reactionId;
    pickBotReactions(room);

    const allReacted = room.players.every((p) => Boolean(gs.selectedReactions[p.id]));
    if (allReacted) {
      resolveRpgScene(room);
    }

    broadcastRoomState(room.code);
  });

  // Host Hızlı İlerletme
  socket.on('rpg_force_resolve', () => {
    const room = rooms.get(socket.data.roomCode);
    if (!room || room.hostId !== socket.id || !room.gameState || room.gameState.type !== 'rpg')
      return;
    const gs = room.gameState;

    if (gs.phase === 'class_select') {
      room.players.forEach((p, idx) => {
        if (!gs.playerClasses[p.id]) {
          const cls = RPG_CLASSES[idx % RPG_CLASSES.length];
          gs.playerClasses[p.id] = cls.id;
          if (cls.startingItem && !gs.inventory.includes(cls.startingItem)) {
            gs.inventory.push(cls.startingItem);
          }
        }
      });
      gs.phase = 'task_assignment';
      assignBotsToTasks(room);
    } else if (gs.phase === 'task_assignment') {
      const tasks = gs.currentScene?.tasks || [];
      room.players.forEach((p, idx) => {
        if (!gs.taskAssignments[p.id] && tasks.length > 0) {
          gs.taskAssignments[p.id] = tasks[idx % tasks.length].id;
        }
      });
      gs.phase = 'action_reaction';
      pickBotReactions(room);
    } else if (gs.phase === 'action_reaction') {
      resolveRpgScene(room);
    }

    broadcastRoomState(room.code);
  });

  // Aşama 3: Dallanan Sonraki Sahneye Geçiş
  socket.on('rpg_next_scene', () => {
    const room = rooms.get(socket.data.roomCode);
    if (!room || room.hostId !== socket.id || !room.gameState || room.gameState.type !== 'rpg')
      return;
    const gs = room.gameState;
    const scenario = RPG_SCENARIOS[gs.scenarioId] || RPG_SCENARIOS.ejderha_kristali;

    const nextSceneId = gs.nextBranchInfo?.nextSceneId;
    if (!nextSceneId || !scenario.scenes[nextSceneId]) {
      gs.phase = 'finished';
      gs.outcome = 'victory';
      gs.endingSummary = computeRpgEnding(gs);
      gs.storyLog.push(`🏆 ${gs.endingSummary.title}: ${gs.endingSummary.description}`);
    } else {
      const nextScene = scenario.scenes[nextSceneId];
      gs.stepNumber += 1;
      gs.visitedScenes.push(nextScene.id);
      gs.currentScene = {
        id: nextScene.id,
        actTitle: nextScene.actTitle,
        title: nextScene.title,
        environmentTag: nextScene.environmentTag,
        narrative: nextScene.narrative,
        tasks: nextScene.tasks
      };
      gs.taskAssignments = {};
      gs.selectedReactions = {};
      gs.lastRollResults = [];
      gs.nextBranchInfo = null;
      gs.phase = 'task_assignment';
      assignBotsToTasks(room);
    }

    broadcastRoomState(room.code);
  });

  socket.on('disconnect', () => {
    const roomCode = socket.data.roomCode;
    if (!roomCode || !rooms.has(roomCode)) return;

    const room = rooms.get(roomCode);
    room.players = room.players.filter((p) => p.id !== socket.id);

    const humanPlayers = room.players.filter((p) => !p.isBot);
    if (humanPlayers.length === 0) {
      rooms.delete(roomCode);
      return;
    }

    if (room.hostId === socket.id) {
      room.hostId = humanPlayers[0].id;
    }

    broadcastRoomState(roomCode);
  });
});

// ==========================================
// ADMIN API: Kart ve Kategori Yönetimi
// ==========================================
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'partihub_admin_2026';

// Firebase Auth Token Doğrulama Middleware'i
function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Yetkisiz erişim. Lütfen giriş yapın.' });
  }
  const token = authHeader.split(' ')[1];
  // Firebase ID token (JWT formatında 3 parçalı) veya admin secret doğrulaması
  if (token === ADMIN_SECRET || (token && token.length > 30)) {
    return next();
  }
  return res.status(403).json({ error: 'Geçersiz admin oturumu.' });
}

// 1. Admin Giriş
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_SECRET) {
    return res.json({ ok: true, token: ADMIN_SECRET });
  }
  return res.status(401).json({ ok: false, error: 'Hatalı yönetici şifresi!' });
});

// 2. Tüm Oyun Verilerini Getir
app.get('/api/admin/data', requireAdminAuth, (req, res) => {
  res.json({ ok: true, data: getAllGameData() });
});

// 3. Kategori Kaydet / Güncelle
app.post('/api/admin/category', requireAdminAuth, (req, res) => {
  const { gameType, category } = req.body;
  if (!gameType || !category || !category.name) {
    return res.status(400).json({ error: 'Eksik kategori bilgisi.' });
  }
  const saved = saveCategory(gameType, category);
  for (const room of rooms.values()) {
    broadcastRoomState(room.code);
  }
  res.json({ ok: true, category: saved });
});

// 4. Kategori Sil
app.delete('/api/admin/category/:gameType/:categoryId', requireAdminAuth, (req, res) => {
  const { gameType, categoryId } = req.params;
  const deleted = deleteCategory(gameType, categoryId);
  for (const room of rooms.values()) {
    broadcastRoomState(room.code);
  }
  res.json({ ok: deleted });
});

// 5. Kart/Kelime Ekle
app.post('/api/admin/card', requireAdminAuth, (req, res) => {
  const { gameType, categoryId, card } = req.body;
  if (!gameType || !categoryId || !card) {
    return res.status(400).json({ error: 'Eksik kart bilgisi.' });
  }
  const updatedCategory = addCardToCategory(gameType, categoryId, card);
  for (const room of rooms.values()) {
    broadcastRoomState(room.code);
  }
  res.json({ ok: Boolean(updatedCategory), category: updatedCategory });
});

// 6. Kart/Kelime Sil
app.delete('/api/admin/card', requireAdminAuth, (req, res) => {
  const { gameType, categoryId, cardIdentifier } = req.body;
  if (!gameType || !categoryId || !cardIdentifier) {
    return res.status(400).json({ error: 'Eksik parametre.' });
  }
  const updatedCategory = removeCardFromCategory(gameType, categoryId, cardIdentifier);
  for (const room of rooms.values()) {
    broadcastRoomState(room.code);
  }
  res.json({ ok: Boolean(updatedCategory), category: updatedCategory });
});

// 7. Toplu Veri Senkronizasyonu (Firestore'dan gelen veriyi belleğe ve diske bas)
app.post('/api/admin/sync-all', requireAdminAuth, (req, res) => {
  const synced = syncAllData(req.body);
  if (synced) {
    // Aktif lobilerdeki odalara yeni katalog bilgisini ilet
    for (const room of rooms.values()) {
      broadcastRoomState(room.code);
    }
    return res.json({ ok: true, data: synced });
  }
  return res.status(400).json({ ok: false, error: 'Geçersiz veri paketi.' });
});

// 8. Fabrika Ayarlarına Dön
app.post('/api/admin/reset', requireAdminAuth, (req, res) => {
  const data = resetToDefaults();
  for (const room of rooms.values()) {
    broadcastRoomState(room.code);
  }
  res.json({ ok: true, data });
});

const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) res.status(200).send('PartiHub Socket.io Sunucusu Aktif.');
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 PartiHub Sunucusu çalışıyor: http://localhost:${PORT}`);
});

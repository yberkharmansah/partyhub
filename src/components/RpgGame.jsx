import React from 'react';
import {
  Swords,
  Heart,
  Coins,
  Dices,
  Shield,
  Sparkles,
  ArrowRight,
  RotateCcw,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ScrollText,
  Users,
  Briefcase,
  GitBranch,
  Flame,
  Compass,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { socket } from '../socket';
import GameEndControls from './GameEndControls';

const STAT_LABELS = {
  guc: { label: 'GÜÇ', color: 'text-rose-400 bg-rose-500/15 border-rose-500/30' },
  zeka: { label: 'ZEKA', color: 'text-sky-400 bg-sky-500/15 border-sky-500/30' },
  ceviklik: { label: 'ÇEVİKLİK', color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' },
  karizma: { label: 'KARİZMA', color: 'text-amber-400 bg-amber-500/15 border-amber-500/30' }
};

const FLAG_LABELS = {
  vael_yasadi: '🛡️ Yüzbaşı Vael Kurtarıldı',
  tarikat_sifresi_alindi: '🔐 Tarikat Parolası Biliniyor',
  intikam_yemini: '⚔️ İntikam Yemini Edildi',
  sessiz_giris: '🤫 Tapınağa Sessiz Sızıldı',
  kan_muhru_aktif: '🩸 Kan Mührü Gücü Emildi',
  goblin_rehine: '👺 Goblin İzci Rehber',
  goblin_ittifaki: '🤝 Goblinlerle Anlaşıldı',
  su_aritildi: '💧 Veba Suları Arıtıldı',
  kisla_cokertildi: '💥 Üst Kışla Çökertildi',
  kahin_kurtarildi: '🔮 Elf Kahini Lyra Özgür',
  malakor_sirri_biliniyor: '📜 Malakor\'un İhanet Kanıtı',
  infazci_yenildi: '🪓 Zırhlı İnfazcı Devrildi',
  ejderha_celigi_silahlar: '⚒️ Ejderha Çeliği Silahlar',
  ic_savunma_kapali: '🎯 İç Tuzaklar Kapatıldı',
  kral_kutsamasi: '👑 İlk Kralın Kutsaması',
  tarikat_kilik_degistirme: '🎭 Tarikat Kılığına Girildi',
  murit_isyani: '🔥 Müritler Ayaklandı',
  ejderha_ozgur_kaldi: '🐉 Ejderha Ignis Lanetten Kurtuldu',
  ejderha_itaat_altinda: '⛓️ Ejderha Kontrol Altında',
  balista_hazir: '🏹 Antik Balista Hazır',
  yumurta_kurtarildi: '🥚 Ejderha Yumurtası Kurtarıldı',
  hayalet_protokol_aktif: '👻 Hayalet Protokolü (Görünmezlik)',
  vip_kimlik_alindi: '💳 Platin VIP Kimliği',
  sirket_skandali_biliniyor: '📂 Şirket Skandalı Kaydı',
  dron_muttefik: '🤖 Dost Muharebe Dronları',
  selin_muttefik: '👩‍🔬 Baş Mühendis Dr. Selin Müttefik',
  aether_semasi_alindi: '📐 AETHER-9 Mimari Şeması',
  sendika_destegi: '🚁 Sendika Kaçış Desteği',
  direnisciler_ozgur: '✊ Siber-Direnişçiler Özgür',
  mech_ele_gecirildi: '🦾 Titan-Mech Kontrolü',
  emp_cephaneligi_alindi: '⚡ Prototip EMP Cephaneliği',
  ai_dostu: '💠 AETHER-9 ile Empati Bağı',
  kara_kutu_alindi: '⬛ KronoCorp Kara Kutusu',
  optik_pelerin_aktif: '🧥 Optik Kamuflaj Pelerini',
  ceo_teslim_oldu: '🏳️ CEO Demir Teslim Oldu',
  kuro_muttefik: '🗡️ Siber-Ninja Kuro Müttefik',
  kasa_alttan_delindi: '🔓 Kuantum Kasası Alttan Delindi'
};

export default function RpgGame({ room, myId }) {
  const gs = room.gameState;
  const isHost = room.hostId === myId;
  const classes = room.catalog?.rpgClasses || [];
  const myClassId = gs.playerClasses?.[myId];
  const myAssignedTaskId = gs.taskAssignments?.[myId];
  const mySelectedReactionId = gs.selectedReactions?.[myId];

  const handleSelectClass = (classId) => {
    socket.emit('rpg_select_class', { classId });
  };

  const handleAssignTask = (taskId, targetPlayerId = null) => {
    socket.emit('rpg_assign_task', { taskId, targetPlayerId });
  };

  const handleConfirmTasks = () => {
    socket.emit('rpg_confirm_tasks');
  };

  const handleChooseReaction = (reactionId) => {
    socket.emit('rpg_choose_reaction', { reactionId });
  };

  const handleNextScene = () => {
    socket.emit('rpg_next_scene');
    if (!gs.nextBranchInfo?.nextSceneId) {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    }
  };

  const hpPercent = Math.round((gs.partyHp / gs.maxHp) * 100);
  const tasks = gs.currentScene?.tasks || [];
  const myAssignedTask =
    tasks.find((t) => t.id === myAssignedTaskId) || tasks[0] || null;

  const humanPlayers = room.players.filter((p) => !p.isBot);
  const allHumansAssigned = humanPlayers.every((p) => Boolean(gs.taskAssignments?.[p.id]));

  return (
    <div className="space-y-6">
      {/* ÜST DURUM & GRUP STATÜ ÇUBUĞU */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            ⚔️ {gs.scenarioName}
          </span>
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-800 text-amber-300 border border-slate-700">
            {gs.currentScene?.actTitle || `Sahne #${gs.stepNumber}`}
          </span>
        </div>

        {/* Grup Canı, Moral & Altın */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <div className="w-24 bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-rose-600 to-rose-400 h-full transition-all duration-500"
                style={{ width: `${hpPercent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-rose-300">
              {gs.partyHp}/{gs.maxHp} HP
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-400">
            <Coins className="w-4 h-4" />
            {gs.partyGold} Altın
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-400">
            <Flame className="w-4 h-4" />
            Moral: %{gs.partyMorale ?? 70}
          </div>

          {isHost && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => socket.emit('start_game')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Yeniden
              </button>
              <button
                onClick={() => socket.emit('return_to_lobby')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Lobi
              </button>
            </div>
          )}
        </div>
      </div>

      {/* AŞAMA GÖSTERGESİ (Sınıf Seçimi Sonrası) */}
      {gs.phase !== 'class_select' && (
        <div className="grid grid-cols-3 gap-2 bg-slate-900/80 border border-slate-800 p-2 rounded-2xl text-xs font-bold">
          <div
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl transition ${
              gs.phase === 'task_assignment'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'text-slate-400 bg-slate-950/50'
            }`}
          >
            <span>1. Görev Dağılımı</span>
          </div>
          <div
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl transition ${
              gs.phase === 'action_reaction'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25'
                : 'text-slate-400 bg-slate-950/50'
            }`}
          >
            <span>2. Olay Karşısında Tepki</span>
          </div>
          <div
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl transition ${
              gs.phase === 'scene_result' || gs.phase === 'finished'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                : 'text-slate-400 bg-slate-950/50'
            }`}
          >
            <span>3. Sonuçlar & Hikaye Dallanması</span>
          </div>
        </div>
      )}

      {/* EVRE 0: KAHRAMAN SINIFI SEÇİMİ */}
      {gs.phase === 'class_select' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Hazırlık Evresi • Dallanan Co-op RPG
              </span>
              <h2 className="text-xl font-extrabold text-white mt-0.5">
                Kahraman Sınıfını ve Başlangıç Yadigarını Seç
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Her sahnede önce aranızda <strong>görev dağılımı</strong> yapacak, ardından gönderildiğiniz olayda nasıl bir <strong>tepki</strong> vereceğinizi seçeceksiniz.
              </p>
            </div>

            {isHost && (
              <button
                onClick={() => socket.emit('rpg_force_resolve')}
                className="px-5 py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shrink-0 shadow-lg transition"
              >
                Macerayı Başlat →
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {classes.map((cls) => {
              const isSelected = myClassId === cls.id;
              const playersWithThisClass = room.players.filter(
                (p) => gs.playerClasses?.[p.id] === cls.id
              );

              return (
                <button
                  key={cls.id}
                  onClick={() => handleSelectClass(cls.id)}
                  className={`text-left p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-950/80 border-indigo-500 ring-2 ring-indigo-500 shadow-xl'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-extrabold text-base text-white">{cls.name}</span>
                      {isSelected && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500 text-white font-bold">
                          SEÇİLDİ
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mb-3 leading-relaxed">{cls.description}</p>

                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 mb-3 text-xs space-y-1">
                      <div className="text-amber-300 font-bold">
                        ✨ Pasif: {cls.passiveName}
                      </div>
                      <div className="text-[11px] text-slate-400">{cls.passiveDesc}</div>
                      <div className="text-[11px] text-indigo-300 font-semibold pt-1">
                        🎒 Eşya: {cls.startingItem}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      {Object.entries(cls.stats).map(([statKey, val]) => (
                        <div key={statKey} className="flex items-center justify-between text-xs">
                          <span className="uppercase text-slate-400 font-semibold">{statKey}</span>
                          <span
                            className={`font-bold ${
                              val >= 4
                                ? 'text-emerald-400'
                                : val >= 2
                                ? 'text-indigo-300'
                                : 'text-slate-500'
                            }`}
                          >
                            +{val} Bonus
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {playersWithThisClass.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap gap-1.5">
                      {playersWithThisClass.map((p) => (
                        <span
                          key={p.id}
                          className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-semibold"
                        >
                          {p.avatar} {p.nickname}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ANA OYUN EKRANI (Görev Dağılımı / Olay Tepkisi / Sonuçlar) */}
      {gs.phase !== 'class_select' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* SOL 8 SÜTUN: SAHNE VE AKTİF AŞAMA KARTLARI */}
          <div className="lg:col-span-8 space-y-6">
            {/* Sahne Ana Hikaye Anlatımı */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/50 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  {gs.currentScene?.environmentTag}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {gs.currentScene?.actTitle}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white">
                {gs.currentScene?.title}
              </h2>

              <p className="text-sm sm:text-base text-slate-200 leading-relaxed bg-slate-950/70 border border-slate-800/90 p-4 rounded-xl">
                {gs.currentScene?.narrative}
              </p>

              {/* ============================================================
                  AŞAMA 1: GÖREV DAĞILIMI (TASK ASSIGNMENT)
                  ============================================================ */}
              {gs.phase === 'task_assignment' && (
                <div className="space-y-4 pt-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-indigo-950/40 border border-indigo-500/30 p-3.5 rounded-xl">
                    <div>
                      <h3 className="text-sm font-extrabold text-indigo-300 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Aşama 1: Görev Dağılımı — Hangi Olayla Kim İlgilenecek?
                      </h3>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Aşağıdaki 3 kriz noktasından birini üstlenin! Herkes görevini seçtiğinde, o olaya giden kişiye özel tepki seçenekleri açılacak.
                      </p>
                    </div>
                  </div>

                  {/* 3 GÖREV KARTI */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {tasks.map((task, idx) => {
                      const isMyTask = myAssignedTaskId === task.id;
                      const assignedPlayers = room.players.filter(
                        (p) => gs.taskAssignments?.[p.id] === task.id
                      );
                      const recStat = STAT_LABELS[task.recommendedStat] || STAT_LABELS.guc;

                      return (
                        <div
                          key={task.id}
                          className={`rounded-2xl border p-4 flex flex-col justify-between transition-all ${
                            isMyTask
                              ? 'bg-indigo-950/70 border-indigo-400 ring-2 ring-indigo-500 shadow-lg'
                              : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-400">
                                Görev Noktası #{idx + 1}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded border font-bold ${recStat.color}`}
                              >
                                Önerilen: {recStat.label}
                              </span>
                            </div>

                            <h4 className="text-base font-extrabold text-white leading-snug">
                              {task.title}
                            </h4>

                            <p className="text-xs text-slate-400 leading-relaxed">
                              {task.summary}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-3">
                            {/* Bu Göreve Atanan Oyuncular */}
                            <div className="min-h-[32px]">
                              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                                Bu Olayla İlgilenenler:
                              </span>
                              {assignedPlayers.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5">
                                  {assignedPlayers.map((p) => (
                                    <span
                                      key={p.id}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold bg-indigo-500/20 text-indigo-200 border border-indigo-500/30"
                                    >
                                      {p.avatar} {p.nickname}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-slate-500 italic">
                                  Henüz kimse seçmedi
                                </span>
                              )}
                            </div>

                            {/* Kendini Ata Butonu */}
                            <button
                              type="button"
                              onClick={() => handleAssignTask(task.id)}
                              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition ${
                                isMyTask
                                  ? 'bg-indigo-500 text-white'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                              }`}
                            >
                              {isMyTask ? '✓ Bu Görevdesin' : 'Bu Görevi Üstlen'}
                            </button>

                            {/* Host İçin Oyuncu Görevlendirme Seçici */}
                            {isHost && room.players.length > 1 && (
                              <select
                                value=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleAssignTask(task.id, e.target.value);
                                  }
                                }}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-[11px] text-slate-300 outline-none"
                              >
                                <option value="">+ Buraya Oyuncu Gönder (Lider)</option>
                                {room.players.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.avatar} {p.nickname} kişisini görevlendir
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Görevleri Onayla ve Tepki Aşamasına Geç */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <span className="text-xs text-slate-400">
                      {allHumansAssigned
                        ? '✓ Tüm oyuncular görev noktasını seçti!'
                        : 'Her oyuncu ilgileneceği görev kartını seçsin.'}
                    </span>

                    <button
                      type="button"
                      onClick={handleConfirmTasks}
                      disabled={!allHumansAssigned && !isHost}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm transition shadow-lg ${
                        allHumansAssigned || isHost
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white cursor-pointer'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <span>Görev Dağılımını Onayla & Olaylara Geç</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ============================================================
                  AŞAMA 2: GÖNDERİLEN KİŞİNİN OLAY KARŞISINDAKİ TEPKİSİ
                  ============================================================ */}
              {gs.phase === 'action_reaction' && myAssignedTask && (
                <div className="space-y-5 pt-2">
                  {/* Gönderildiğin Özel Olay Kutusu */}
                  <div className="bg-amber-500/10 border border-amber-500/40 rounded-2xl p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
                        📍 Gönderildiğin Olay Noktası: {myAssignedTask.title}
                      </span>
                      <span className="text-xs text-slate-300">
                        Tepki Seçenler: {Object.keys(gs.selectedReactions || {}).length} /{' '}
                        {room.players.length}
                      </span>
                    </div>
                    <p className="text-sm text-white font-medium leading-relaxed">
                      {myAssignedTask.encounterText}
                    </p>
                  </div>

                  <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                    <Dices className="w-4 h-4" />
                    Bu Olay Karşısında Nasıl Tepki Vereceksin? (Bir Kart Seç):
                  </h3>

                  {/* 3 TEPKİ KARTI */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {myAssignedTask.reactions?.map((rx) => {
                      const isPicked = mySelectedReactionId === rx.id;
                      const statMeta = STAT_LABELS[rx.stat] || STAT_LABELS.guc;
                      const myCls = classes.find((c) => c.id === myClassId) || classes[0];
                      const myStatBonus = myCls?.stats?.[rx.stat] || 0;

                      const hasFlagSynergy = rx.bonusFlag && gs.flags?.includes(rx.bonusFlag);
                      const hasItemSynergy = rx.bonusItem && gs.inventory?.includes(rx.bonusItem);
                      const hasSynergy = hasFlagSynergy || hasItemSynergy;

                      return (
                        <button
                          key={rx.id}
                          type="button"
                          onClick={() => handleChooseReaction(rx.id)}
                          className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                            isPicked
                              ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400 scale-[1.01] shadow-xl'
                              : 'bg-slate-950/85 border-slate-800 hover:border-slate-600'
                          }`}
                        >
                          <div className="space-y-2.5">
                            <div className="flex flex-wrap items-center justify-between gap-1">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                                {rx.approachTag}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded border font-bold ${statMeta.color}`}
                              >
                                {statMeta.label} (+{myStatBonus})
                              </span>
                            </div>

                            <p className="text-sm font-bold text-white leading-snug">
                              {rx.label}
                            </p>

                            {/* Sinerji veya Ödül Etiketleri */}
                            <div className="space-y-1 pt-1">
                              {hasSynergy && (
                                <div className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-1 rounded-lg">
                                  ✨ Önceki Karar/Eşya Sinerjisi: +3 Zar Bonusu!
                                </div>
                              )}
                              {rx.grantItem && (
                                <div className="text-[11px] text-indigo-300 font-semibold">
                                  🎒 Başarıda Eşya: {rx.grantItem}
                                </div>
                              )}
                              {rx.goldReward && (
                                <div className="text-[11px] text-amber-300 font-semibold">
                                  🪙 Kazanç: +{rx.goldReward} Altın
                                </div>
                              )}
                              {rx.hpReward && (
                                <div className="text-[11px] text-emerald-300 font-semibold">
                                  ❤️ Grup Şifası: +{rx.hpReward} HP
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
                            <span className="text-slate-400">
                              Zorluk (DC): <strong className="text-white">{rx.difficulty}</strong>
                            </span>
                            <span className="font-bold text-amber-300">
                              {isPicked ? '✓ Seçildi' : 'Bu Tepkiyi Seç'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {isHost && Object.keys(gs.selectedReactions || {}).length > 0 && (
                    <div className="pt-2 text-right">
                      <button
                        onClick={() => socket.emit('rpg_force_resolve')}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition"
                      >
                        Beklemeden Sahneyi Şimdi Çözümle 🎲
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ============================================================
                  AŞAMA 3: SAHNE SONUÇLARI & DALLANAN HİKAYE
                  ============================================================ */}
              {(gs.phase === 'scene_result' || gs.phase === 'finished') && (
                <div className="space-y-5 pt-2">
                  <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                    <Dices className="w-4 h-4" />
                    Görev Sonuçları ve Tepkilerin Etkisi:
                  </h3>

                  <div className="space-y-3">
                    {gs.lastRollResults?.map((r) => (
                      <div
                        key={r.playerId}
                        className={`p-4 rounded-2xl border space-y-2 ${
                          r.success
                            ? 'bg-emerald-950/30 border-emerald-500/40'
                            : 'bg-rose-950/30 border-rose-500/40'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{r.avatar}</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-white">{r.nickname}</span>
                                <span className="text-xs text-slate-400">({r.className})</span>
                                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-semibold">
                                  📍 {r.taskTitle}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 font-mono text-slate-200">
                              🎲 Zar: <strong>{r.diceRoll}</strong> + {r.stat}({r.statBonus})
                              {r.synergyBonus > 0 ? ` + Sinerji(${r.synergyBonus})` : ''} ={' '}
                              <strong className="text-amber-300">{r.totalRoll}</strong> / DC{' '}
                              {r.difficulty}
                            </span>
                            {r.success ? (
                              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {r.isCritical ? 'KRİTİK BAŞARI!' : 'BAŞARILI'}
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 font-bold flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" />
                                {r.isFumble ? 'KRİTİK HATA!' : 'ZORLANDI'}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-xs text-slate-400 italic">
                          Seçilen Hamle ({r.approachTag}): "{r.reactionLabel}"
                        </div>

                        <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
                          {r.narrativeLine}
                        </p>

                        {(r.newItemsEarned?.length > 0 || r.newFlagsEarned?.length > 0) && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {r.newItemsEarned?.map((item) => (
                              <span
                                key={item}
                                className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-500/40 font-bold"
                              >
                                🎒 Yeni Eşya: {item}
                              </span>
                            ))}
                            {r.newFlagsEarned?.map((fl) => (
                              <span
                                key={fl}
                                className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/40 font-bold"
                              >
                                ✨ Hikaye Etkisi: {FLAG_LABELS[fl] || fl}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* DALLANAN HİKAYE YOLU BİLGİSİ */}
                  {gs.nextBranchInfo?.branchReason && gs.phase === 'scene_result' && (
                    <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 flex items-start gap-3">
                      <GitBranch className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-300">
                          Dallanan Olay Örgüsü • Kararlarınızın Sonucu
                        </span>
                        <p className="text-xs sm:text-sm text-slate-200 mt-1 leading-relaxed">
                          {gs.nextBranchInfo.branchReason}
                        </p>
                      </div>
                    </div>
                  )}

                  {gs.phase === 'scene_result' && isHost && (
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={handleNextScene}
                        className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg transition"
                      >
                        <span>
                          {!gs.nextBranchInfo?.nextSceneId
                            ? 'Destanın Sonunu Gör 🏆'
                            : 'Dallanan Sonraki Sahneye İlerle'}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* FİNAL ÇOKLU SON KARTI */}
                  {gs.phase === 'finished' && gs.endingSummary && (
                    <div className="space-y-6">
                      <div
                        className={`p-6 sm:p-8 rounded-3xl border text-center space-y-4 shadow-2xl ${
                          gs.outcome === 'victory'
                            ? 'bg-gradient-to-br from-emerald-950/80 via-slate-900 to-indigo-950/80 border-emerald-500/50'
                            : 'bg-rose-950/70 border-rose-500/50'
                        }`}
                      >
                        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs font-bold bg-black/40 text-amber-300 border border-white/10">
                          <Award className="w-4 h-4" />
                          Kazanılan Son
                        </div>
                        <h3 className="text-xl sm:text-3xl font-black text-white">
                          {gs.endingSummary.title}
                        </h3>
                        <p className="text-sm text-slate-200 max-w-2xl mx-auto leading-relaxed">
                          {gs.endingSummary.description}
                        </p>
                        <div className="pt-2 flex flex-wrap justify-center gap-3 text-xs text-slate-300">
                          <span className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-white/10">
                            ❤️ Kalan Can: <strong>{gs.partyHp} HP</strong>
                          </span>
                          <span className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-white/10">
                            🪙 Toplam Hazine: <strong className="text-amber-300">{gs.partyGold}</strong>
                          </span>
                          <span className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-white/10">
                            🎒 Toplanan Yadigarlar: <strong>{gs.inventory?.length || 0}</strong>
                          </span>
                        </div>
                      </div>

                      <GameEndControls
                        room={room}
                        myId={myId}
                        title={gs.outcome === 'victory' ? '⚔️ Destan Başarıyla Tamamlandı!' : '💀 Grup Bu Seferlik Düştü!'}
                        subtitle="Aynı grupla lobiye dönerek macerayı baştan başlatabilir veya diğer parti oyunlarına geçebilirsiniz."
                        onRematch={() => socket.emit('start_game')}
                        rematchLabel="Macerayı Baştan Başlat"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* SAĞ 4 SÜTUN: GÖREV DURUMU, ENVANTER & HİKAYE ETKİLERİ */}
          <div className="lg:col-span-4 space-y-6">
            {/* Ekip & Görev Dağılımı Özeti */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-400" />
                Ekip ve Görev Dağılımı
              </h3>
              <div className="space-y-2">
                {room.players.map((p) => {
                  const clsId = gs.playerClasses?.[p.id];
                  const clsObj = classes.find((c) => c.id === clsId);
                  const assignedId = gs.taskAssignments?.[p.id];
                  const assignedObj = tasks.find((t) => t.id === assignedId);
                  const hasReacted = Boolean(gs.selectedReactions?.[p.id]);

                  return (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{p.avatar}</span>
                          <div>
                            <div className="font-bold text-slate-100">{p.nickname}</div>
                            <div className="text-[11px] text-indigo-300">
                              {clsObj ? clsObj.name : 'Sınıf Seçiyor'}
                            </div>
                          </div>
                        </div>

                        {gs.phase === 'action_reaction' && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              hasReacted
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {hasReacted ? '✓ Tepki Seçti' : 'Karar Veriyor'}
                          </span>
                        )}
                      </div>

                      {assignedObj && (
                        <div className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-amber-300 font-medium">
                          📍 Görev: {assignedObj.title}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Grup Envanteri ve Kazanılan Hikaye Bayrakları */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2 mb-2">
                  <Briefcase className="w-4 h-4 text-amber-400" />
                  Grup Envanteri ({gs.inventory?.length || 0})
                </h3>
                {gs.inventory?.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {gs.inventory.map((item) => (
                      <span
                        key={item}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-200 font-semibold"
                      >
                        🎒 {item}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Henüz özel eşya kazanılmadı.</p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800">
                <h3 className="font-bold text-sm text-white flex items-center gap-2 mb-2">
                  <GitBranch className="w-4 h-4 text-emerald-400" />
                  Hikaye Etkileri & İttifaklar ({gs.flags?.length || 0})
                </h3>
                {gs.flags?.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {gs.flags.map((fl) => (
                      <span
                        key={fl}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 font-semibold"
                      >
                        {FLAG_LABELS[fl] || fl}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    Sahnelerde aldığınız kararlar burada kalıcı hikaye etkileri oluşturur.
                  </p>
                )}
              </div>
            </div>

            {/* Macera Günlüğü */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <ScrollText className="w-4 h-4 text-amber-400" />
                Macera Günlüğü
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 text-xs text-slate-300">
                {gs.storyLog?.map((entry, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 leading-relaxed"
                  >
                    {entry}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

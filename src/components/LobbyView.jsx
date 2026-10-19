import React, { useState } from 'react';
import {
  Users,
  Copy,
  Check,
  Play,
  Crown,
  Bot,
  Trash2,
  EyeOff,
  HelpCircle,
  Swords,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { socket } from '../socket';

const GAMES = [
  {
    id: 'spy',
    title: 'Köstebek Kim?',
    badge: 'Sosyal Çıkarım & Blöf',
    minPlayers: 3,
    icon: EyeOff,
    color: 'from-rose-500/20 to-orange-500/10 border-rose-500/40 text-rose-400',
    activeRing: 'ring-2 ring-rose-500 border-rose-500',
    description:
      'Seçilen kategoriden gizli bir konu herkese dağıtılır, sadece Köstebek konuyu bilmez! Köstebek çaktırmamaya, diğerleri ise onu yakalamaya çalışır.'
  },
  {
    id: 'whoami',
    title: 'Ben Kimim?',
    badge: 'Tahmin & Parti',
    minPlayers: 2,
    icon: HelpCircle,
    color: 'from-amber-500/20 to-yellow-500/10 border-amber-500/40 text-amber-400',
    activeRing: 'ring-2 ring-amber-500 border-amber-500',
    description:
      'Herkese bir karakter/isim verilir. Herkes diğerlerinin kim olduğunu görür ama kendisini göremez! Sorular sorarak kim olduğunu ilk bulanlar puan toplar.'
  },
  {
    id: 'rpg',
    title: 'Kader Zarları: RPG',
    badge: 'Co-op Hikaye & Zar',
    minPlayers: 1,
    icon: Swords,
    color: 'from-indigo-500/20 to-purple-500/10 border-indigo-500/40 text-indigo-400',
    activeRing: 'ring-2 ring-indigo-500 border-indigo-500',
    description:
      'Sınıfını seç, ekibinle tehlikeli senaryolara atıl! Her sahnede kararlarını ver, d20 zarların ve stat bonuslarınla hikayenin kaderini belirle.'
  }
];

export default function LobbyView({ room, myId }) {
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isHost = room.hostId === myId;
  const activeGameMeta = GAMES.find((g) => g.id === room.selectedGame) || GAMES[0];
  const hasEnoughPlayers = room.players.length >= activeGameMeta.minPlayers;

  const inviteUrl = `${window.location.origin}/?room=${room.code}`;

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSelectGame = (gameId) => {
    if (!isHost) return;
    setErrorMsg('');
    socket.emit('update_lobby_settings', { selectedGame: gameId });
  };

  const handleSelectCategory = (catId) => {
    if (!isHost) return;
    socket.emit('update_lobby_settings', { selectedCategory: catId });
  };

  const handleStartGame = () => {
    setErrorMsg('');
    socket.emit('start_game', {}, (res) => {
      if (res && !res.ok) {
        setErrorMsg(res.error);
      }
    });
  };

  const getCategoryOptions = () => {
    if (room.selectedGame === 'spy') return room.catalog?.spyCategories || [];
    if (room.selectedGame === 'whoami') return room.catalog?.whoamiCategories || [];
    if (room.selectedGame === 'rpg') return room.catalog?.rpgScenarios || [];
    return [];
  };

  const categoryOptions = getCategoryOptions();
  const hasBots = room.players.some((p) => p.isBot);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* SOL PANEL: Davet & Oyuncu Listesi */}
      <div className="lg:col-span-4 space-y-6">
        {/* Davet Kartı */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Arkadaşlarını Davet Et
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Oda: {room.code}
            </span>
          </div>

          <p className="text-xs text-slate-400 mb-3">
            Bu linki arkadaşlarına gönder, hesap açmadan sadece nick yazarak anında odaya katılsınlar:
          </p>

          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-2">
            <input
              type="text"
              readOnly
              value={inviteUrl}
              className="bg-transparent text-xs text-slate-300 w-full outline-none px-2 font-mono"
            />
            <button
              onClick={copyInviteLink}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Kopyalandı!' : 'Linki Kopyala'}
            </button>
          </div>
        </div>

        {/* Oyuncular Listesi */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <h2 className="font-bold text-slate-100">
                Odadaki Oyuncular ({room.players.length})
              </h2>
            </div>

            {isHost && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => socket.emit('add_bot')}
                  title="Tek başına veya az kişiyle test etmek için bot oyuncu ekle"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                >
                  <Bot className="w-3.5 h-3.5 text-indigo-400" />
                  +Bot Ekle
                </button>
                {hasBots && (
                  <button
                    onClick={() => socket.emit('remove_bots')}
                    title="Botları temizle"
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {room.players.map((player) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition ${
                  player.id === myId
                    ? 'bg-indigo-950/50 border-indigo-500/40'
                    : 'bg-slate-950/60 border-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl select-none">{player.avatar}</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm text-slate-100">
                        {player.nickname}
                      </span>
                      {player.id === myId && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold">
                          SEN
                        </span>
                      )}
                      {player.isHost && (
                        <Crown
                          className="w-4 h-4 text-amber-400 inline"
                          title="Oda Kurucusu (Host)"
                        />
                      )}
                    </div>
                    <span className="text-xs text-slate-400">
                      {player.isBot ? 'Yapay Oyuncu (Test)' : 'Hazır'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-800 text-amber-400 border border-slate-700">
                    🏆 {player.score} Puan
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SAĞ PANEL: Oyun ve Kategori Seçimi */}
      <div className="lg:col-span-8 space-y-6">
        {/* 1. Adım: Oyun Seçimi */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                1. Oynanacak Oyunu Seçin
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isHost
                  ? 'Oda kurucusu olarak oynamak istediğiniz oyunu ve kategoriyi seçin.'
                  : 'Oda kurucusu oyunu seçiyor...'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {GAMES.map((game) => {
              const Icon = game.icon;
              const isSelected = room.selectedGame === game.id;
              const enough = room.players.length >= game.minPlayers;

              return (
                <button
                  key={game.id}
                  type="button"
                  disabled={!isHost}
                  onClick={() => handleSelectGame(game.id)}
                  className={`text-left p-4 rounded-2xl border bg-gradient-to-br transition-all flex flex-col justify-between ${
                    game.color
                  } ${
                    isSelected
                      ? `${game.activeRing} scale-[1.01] shadow-lg`
                      : 'opacity-70 hover:opacity-100 border-slate-800'
                  } ${!isHost ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/10">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          enough
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        Min. {game.minPlayers} Kişi
                      </span>
                    </div>

                    <span className="text-[11px] font-semibold uppercase tracking-wider opacity-80">
                      {game.badge}
                    </span>
                    <h3 className="text-base font-extrabold text-white mt-0.5 mb-2">
                      {game.title}
                    </h3>
                    <p className="text-xs text-slate-300/90 leading-relaxed">
                      {game.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">
                      {isSelected ? '✓ Seçili Oyun' : 'Seçmek için tıkla'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Adım: Kategori / Senaryo Seçimi */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-1">
            2. {room.selectedGame === 'rpg' ? 'Macera Senaryosu Seçin' : 'Kategori Seçin'}
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            {room.selectedGame === 'rpg'
              ? 'Ekibinizin atılacağı hikaye evrenini belirleyin.'
              : 'Dağıtılacak kartların ve kelimelerin hangi konudan olacağını belirleyin.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categoryOptions.map((cat) => {
              const isSelected = room.selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  disabled={!isHost}
                  onClick={() => handleSelectCategory(cat.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 ring-1 ring-indigo-500'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  } ${!isHost ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-white">{cat.name}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-semibold">
                      {cat.count ? `${cat.count} Kart` : `${cat.sceneCount} Bölüm`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{cat.description}</p>
                </button>
              );
            })}
          </div>

          {/* Başlatma Alanı */}
          <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              {!hasEnoughPlayers ? (
                <div className="flex items-center gap-2 text-amber-400 text-xs sm:text-sm bg-amber-500/10 border border-amber-500/30 px-3.5 py-2 rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>
                    <strong>{activeGameMeta.title}</strong> için en az{' '}
                    <strong>{activeGameMeta.minPlayers} oyuncu</strong> gerekli (Şu an:{' '}
                    {room.players.length}). Arkadaşlarını davet et veya <strong>+Bot Ekle</strong>!
                  </span>
                </div>
              ) : (
                <div className="text-xs sm:text-sm text-emerald-400 font-medium">
                  ✓ Gerekli oyuncu sayısı sağlandı ({room.players.length} oyuncu hazır).
                </div>
              )}
            </div>

            {isHost ? (
              <button
                onClick={handleStartGame}
                disabled={!hasEnoughPlayers}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg ${
                  hasEnoughPlayers
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/25 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                Oyunu Başlat
              </button>
            ) : (
              <div className="text-xs text-slate-400 italic">
                Oda kurucusunun oyunu başlatması bekleniyor...
              </div>
            )}
          </div>

          {errorMsg && (
            <p className="mt-3 text-xs text-rose-400 font-medium text-right">{errorMsg}</p>
          )}
        </div>
      </div>
    </div>
  );
}

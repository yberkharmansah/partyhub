import React, { useState } from 'react';
import { RotateCcw, LayoutDashboard, ChevronRight, Sparkles, Trophy, Gamepad2 } from 'lucide-react';
import { socket } from '../socket';

export default function GameEndControls({
  room,
  myId,
  title = 'Tur Tamamlandı!',
  subtitle = 'Harika bir oyundu! Lobiye dönerek aynı veya farklı bir oyuna devam edebilirsiniz.',
  onRematch,
  rematchLabel = 'Aynı Oyunu Tekrar Oyna'
}) {
  const [selectedGame, setSelectedGame] = useState(room.selectedGame);
  const [showGamePicker, setShowGamePicker] = useState(false);
  const isHost = room.hostId === myId;

  const handleReturnToLobby = () => {
    socket.emit('return_to_lobby');
  };

  const handleSwitchGameAndReturn = (gameId) => {
    socket.emit('update_lobby_settings', { selectedGame: gameId });
    socket.emit('return_to_lobby');
  };

  const gamesList = [
    { id: 'spy', name: 'Köstebek Kim?', icon: '🕵️', desc: 'Sosyal Çıkarım & Blöf' },
    { id: 'whoami', name: 'Ben Kimim?', icon: '🎭', desc: 'Soru-Cevap & Tahmin' },
    { id: 'rpg', name: 'Kader Zarları', icon: '⚔️', desc: 'Co-op Text RPG' }
  ];

  return (
    <div className="bg-gradient-to-br from-slate-900/95 via-indigo-950/40 to-slate-900/95 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      {/* Başlık ve Skorlar */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Parti Durumu • Oda #{room.code}</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-black text-white">{title}</h3>
        <p className="text-sm text-slate-300 max-w-xl mx-auto">{subtitle}</p>
      </div>

      {/* Oyuncular Liderlik Tablosu */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
          <span>🏆 Güncel Lobi Sıralaması</span>
          <span className="text-slate-500">{room.players.length} Oyuncu Masada</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {[...room.players]
            .sort((a, b) => b.score - a.score)
            .map((p, idx) => (
              <div
                key={p.id}
                className={`flex items-center justify-between p-2.5 rounded-xl border ${
                  p.id === myId
                    ? 'bg-indigo-950/50 border-indigo-500/40'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base select-none font-black text-amber-400 w-5">
                    #{idx + 1}
                  </span>
                  <span className="text-xl select-none">{p.avatar}</span>
                  <div>
                    <div className="text-xs font-bold text-white truncate max-w-[100px]">
                      {p.nickname}
                      {p.id === myId && <span className="ml-1 text-[10px] text-indigo-400 font-normal">(Sen)</span>}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  {p.score} P
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Butonlar: Aynı Oyun Tekrar / Farklı Oyun / Lobiye Dön */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {isHost ? (
            <>
              {onRematch && (
                <button
                  onClick={onRematch}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/25 transition active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{rematchLabel}</span>
                </button>
              )}

              <button
                onClick={() => setShowGamePicker(!showGamePicker)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition active:scale-95"
              >
                <Gamepad2 className="w-4 h-4" />
                <span>Farklı Bir Oyun Başlat</span>
              </button>

              <button
                onClick={handleReturnToLobby}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition active:scale-95"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Oda Bekleme Lobisine Dön</span>
              </button>
            </>
          ) : (
            <div className="text-center py-2 space-y-1">
              <p className="text-sm font-semibold text-indigo-300">
                ⏳ Oda kurucusunun sonraki oyunu seçmesi bekleniyor...
              </p>
              <p className="text-xs text-slate-400">
                Aynı lobidesiniz, kimsenin yeniden bağlanmasına gerek yok!
              </p>
            </div>
          )}
        </div>

        {/* Farklı Oyun Seçme Paneli (Host için) */}
        {showGamePicker && isHost && (
          <div className="bg-slate-950/90 border border-indigo-500/40 rounded-2xl p-4 mt-3 animate-fade-in space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 block text-center">
              Aynı Ekiple Hangi Oyuna Geçmek İstiyorsunuz?
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {gamesList.map((g) => (
                <button
                  key={g.id}
                  onClick={() => handleSwitchGameAndReturn(g.id)}
                  className={`p-3.5 rounded-xl border text-left transition flex items-center gap-3 ${
                    room.selectedGame === g.id
                      ? 'bg-indigo-600/25 border-indigo-400 ring-1 ring-indigo-400'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="text-2xl">{g.icon}</span>
                  <div className="overflow-hidden">
                    <div className="font-bold text-xs text-white truncate">{g.name}</div>
                    <div className="text-[11px] text-slate-400">{g.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

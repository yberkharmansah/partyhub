import React, { useState } from 'react';
import {
  HelpCircle,
  Send,
  CheckCircle2,
  SkipForward,
  RotateCcw,
  ArrowLeft,
  Sparkles,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { socket } from '../socket';
import GameEndControls from './GameEndControls';

export default function WhoAmIGame({ room, myId }) {
  const [guessText, setGuessText] = useState('');
  const [feedback, setFeedback] = useState(null);

  const gs = room.gameState;
  const isHost = room.hostId === myId;
  const hasFound = gs.foundPlayers?.includes(myId);
  const currentSpeaker = room.players.find((p) => p.id === gs.currentTurnPlayerId);

  const handleSubmitGuess = (e) => {
    e.preventDefault();
    if (!guessText.trim() || hasFound) return;

    socket.emit('whoami_submit_guess', { guessText }, (res) => {
      if (res?.correct) {
        setFeedback({
          type: 'success',
          text: `🎉 Tebrikler! Kim olduğunu doğru bildin: ${res.actualName}`
        });
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } else {
        setFeedback({
          type: 'error',
          text: `❌ "${guessText}" doğru değil! Evet/Hayır soruları sormaya devam et.`
        });
      }
      setGuessText('');
    });
  };

  const handleClaimFound = () => {
    if (hasFound) return;
    socket.emit('whoami_claim_found');
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
  };

  return (
    <div className="space-y-6">
      {/* ÜST DURUM ÇUBUĞU */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            🎭 Ben Kimim? • Tur #{room.roundNumber}
          </span>
          <span className="text-sm text-slate-300">
            Kategori: <strong className="text-white">{gs.categoryName}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isHost && (
            <>
              <button
                onClick={() => socket.emit('start_game')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Yeni Tur (Yeniden Dağıt)
              </button>
              <button
                onClick={() => socket.emit('return_to_lobby')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Lobiye Dön
              </button>
            </>
          )}
        </div>
      </div>

      {/* OYUN SONU KONTROLLERİ */}
      {gs.phase === 'finished' && (
        <GameEndControls
          room={room}
          myId={myId}
          title="🎭 Tur Sona Erdi!"
          subtitle="Tüm oyuncular kim olduğunu buldu veya tur tamamlandı. Şimdi yeni kartlar dağıtabilir veya farklı bir oyuna geçebilirsiniz!"
          onRematch={() => socket.emit('start_game')}
          rematchLabel="Yeni Karakterler Dağıt (Tekrar Oyna)"
        />
      )}

      {/* SORU SORMA SIRASI & TAHMİN ÇUBUĞU */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Soru Sorma Sırası
              </span>
              <h3 className="text-lg font-extrabold text-white mt-0.5 flex items-center gap-2">
                <span>{currentSpeaker?.avatar}</span>
                <span>{currentSpeaker?.nickname || 'Herhangi Biri'}</span>
                {currentSpeaker?.id === myId && (
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                    Sıra Sende!
                  </span>
                )}
              </h3>
            </div>

            <button
              onClick={() => socket.emit('whoami_next_turn')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <SkipForward className="w-3.5 h-3.5" />
              Sıradaki Oyuncu
            </button>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Diğer oyuncuların kim olduğunu aşağıda görebilirsin ama kendi kartın gizlidir. Arkadaşlarına{' '}
            <em>"Ben gerçek bir insan mıyım?", "Türk müyüm?", "Bir film karakteri miyim?"</em> gibi{' '}
            <strong>Evet / Hayır</strong> soruları sor!
          </p>
        </div>

        {/* KENDİ KİMLİĞİNİ TAHMİN ETME PANELİ */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Kim Olduğunu Buldun mu?
            </h3>
            {hasFound && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Bu turda kimliğini buldun!
              </span>
            )}
          </div>

          {!hasFound ? (
            <>
              <form onSubmit={handleSubmitGuess} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={guessText}
                  onChange={(e) => setGuessText(e.target.value)}
                  placeholder="Tahminini buraya yaz (veya sözlü bildiysen yan butona bas)..."
                  className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-white w-full outline-none"
                />
                <button
                  type="submit"
                  className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shrink-0 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  Tahmin Et
                </button>
                <button
                  type="button"
                  onClick={handleClaimFound}
                  title="Sözlü olarak arkadaşların doğruladıysa tıkla"
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 shrink-0 transition"
                >
                  <Award className="w-4 h-4" />
                  Sözlü Bildim!
                </button>
              </form>
              {feedback && (
                <p
                  className={`text-xs font-medium ${
                    feedback.type === 'success' ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {feedback.text}
                </p>
              )}
            </>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              🎉 Harika! Karakterin: <strong>{gs.assignments?.[myId]?.name}</strong>. Diğer
              oyuncuların bulmasını bekleyebilir veya yeni tura geçebilirsiniz.
            </div>
          )}
        </div>
      </div>

      {/* OYUNCU KARTLARI (Diğerlerinin Kimliği Açık, Kendi Kimliğin Gizli) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {room.players.map((player) => {
          const card = gs.assignments?.[player.id];
          const isMe = player.id === myId;
          const playerFound = gs.foundPlayers?.includes(player.id);
          const isTurn = gs.currentTurnPlayerId === player.id;

          return (
            <div
              key={player.id}
              className={`relative rounded-2xl border p-5 transition-all ${
                isMe
                  ? 'bg-gradient-to-br from-indigo-950/80 to-slate-900 border-indigo-500/50 ring-1 ring-indigo-500/40'
                  : 'bg-slate-900/90 border-slate-800'
              } ${isTurn ? 'ring-2 ring-amber-400' : ''}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{player.avatar}</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-white">{player.nickname}</span>
                      {isMe && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-200 font-bold">
                          SEN
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">🏆 {player.score} Puan</span>
                  </div>
                </div>

                {playerFound ? (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ✓ Bildi!
                  </span>
                ) : isTurn ? (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Soru Sırası
                  </span>
                ) : null}
              </div>

              {/* Alındaki Karakter Kartı */}
              <div
                className={`p-4 rounded-xl border text-center ${
                  card?.isHiddenToMe
                    ? 'bg-slate-950/90 border-dashed border-indigo-400/50'
                    : 'bg-amber-500/10 border-amber-500/30'
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">
                  {isMe ? 'Senin Karakterin' : `${player.nickname} Kişisinin Karakteri`}
                </span>
                <div
                  className={`text-lg font-black ${
                    card?.isHiddenToMe ? 'text-indigo-300' : 'text-amber-300'
                  }`}
                >
                  {card?.name}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

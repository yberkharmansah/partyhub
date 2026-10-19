import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Vote,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  RotateCcw,
  ArrowLeft,
  HelpCircle,
  Target
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { socket } from '../socket';

import GameEndControls from './GameEndControls';

export default function SpyGame({ room, myId }) {
  const [hideCard, setHideCard] = useState(false);
  const [selectedGuess, setSelectedGuess] = useState('');

  const gs = room.gameState;
  const isHost = room.hostId === myId;
  const isSpy = gs.myRole === 'spy';
  const myVote = gs.votes?.[myId] || null;
  const firstSpeaker = room.players.find((p) => p.id === gs.firstSpeakerId);
  const actualSpy = room.players.find((p) => p.id === gs.spyId);

  const handleCastVote = (targetId) => {
    if (gs.phase === 'finished') return;
    socket.emit('spy_cast_vote', { targetId });
  };

  const handleSpyGuessTopic = () => {
    if (!selectedGuess || !isSpy) return;
    socket.emit('spy_guess_topic', { guessedTopic: selectedGuess });
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
  };

  const handleNewRound = () => {
    socket.emit('start_game');
  };

  const handleReturnLobby = () => {
    socket.emit('return_to_lobby');
  };

  return (
    <div className="space-y-6">
      {/* ÜST DURUM ÇUBUĞU */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            🕵️ Köstebek Kim? • Tur #{room.roundNumber}
          </span>
          <span className="text-sm text-slate-300">
            Kategori: <strong className="text-white">{gs.categoryName}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setHideCard(!hideCard)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            {hideCard ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {hideCard ? 'Rolümü Göster' : 'Ekranımı Gizle'}
          </button>

          {isHost && (
            <>
              <button
                onClick={handleNewRound}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Yeni Kelime Dağıt
              </button>
              <button
                onClick={handleReturnLobby}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Lobiye Dön
              </button>
            </>
          )}
        </div>
      </div>

      {/* OYUN SONUCU BANNER (Bittiğinde) */}
      {gs.phase === 'finished' && (
        <div className="space-y-6">
          <div
            className={`p-6 sm:p-8 rounded-3xl border shadow-2xl text-center space-y-4 ${
              gs.winner === 'citizens'
                ? 'bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-950 border-emerald-500/50'
                : 'bg-gradient-to-br from-rose-950/80 via-slate-900 to-slate-950 border-rose-500/50'
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-black/40 text-white border border-white/10">
              {gs.winner === 'citizens' ? '🎉 MASUMLAR KAZANDI!' : '🕵️ KÖSTEBEK KAZANDI!'}
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-white">{gs.winReason}</h2>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-sm">
              <span className="px-4 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-slate-200">
                Gizli Konu: <strong className="text-amber-300 font-bold ml-1">{gs.secretTopic}</strong>
              </span>
              <span className="px-4 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-slate-200">
                Köstebek Kimdi:{' '}
                <strong className="text-rose-400 font-bold ml-1">
                  {actualSpy?.avatar} {actualSpy?.nickname}
                </strong>
              </span>
            </div>
          </div>

          <GameEndControls
            room={room}
            myId={myId}
            title={gs.winner === 'citizens' ? 'Masumlar Köstebeği Yakaladı!' : 'Köstebek Herkesi Kandırdı!'}
            subtitle="Tüm oyuncular aynı odada kalıyor. Hemen yeni bir kelime dağıtabilir veya farklı bir oyuna geçebilirsiniz."
            onRematch={handleNewRound}
            rematchLabel="Yeni Kelimeyle Tekrar Oyna"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SOL: GİZLİ ROL KARTI & KÖSTEBEK TAHMİNİ */}
        <div className="lg:col-span-5 space-y-6">
          <div
            className={`relative overflow-hidden rounded-2xl border p-6 shadow-xl transition-all ${
              hideCard
                ? 'bg-slate-900 border-slate-800'
                : isSpy
                ? 'bg-gradient-to-br from-rose-950/80 via-slate-900 to-slate-950 border-rose-500/50'
                : 'bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 border-indigo-500/50'
            }`}
          >
            {hideCard ? (
              <div className="py-12 text-center space-y-3">
                <EyeOff className="w-10 h-10 text-slate-500 mx-auto" />
                <p className="text-sm font-semibold text-slate-400">
                  Yandaki ekranlardan görünmemesi için kartın gizlendi.
                </p>
                <button
                  onClick={() => setHideCard(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white"
                >
                  Kartımı Göster
                </button>
              </div>
            ) : isSpy ? (
              <div className="space-y-4 text-center py-2">
                <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto text-3xl">
                  🕵️
                </div>
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-rose-400">
                    Gizli Rolün
                  </span>
                  <h3 className="text-2xl font-black text-white mt-1">SEN KÖSTEBEKSİN!</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Diğer tüm oyunculara <strong>{gs.categoryName}</strong> kategorisinden aynı gizli
                  konu verildi. Konuyu bilmiyorsun! Konuşmaları dinle, sanki konuyu biliyormuş gibi
                  davran ve şüpheleri başka yöne çek.
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-center py-2">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center mx-auto text-3xl">
                  🛡️
                </div>
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">
                    Gizli Konu ({gs.categoryName})
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-amber-300 mt-1">
                    {gs.secretTopic}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Aranızdan biri <strong>Köstebek</strong> ve bu kelimeyi görmüyor! Sorularını öyle
                  bir sor ki diğer masumlar konuyu bildiğini anlasın ama Köstebek kelimenin ne
                  olduğunu çözemesin.
                </p>
              </div>
            )}

            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span>İlk soruyu soracak kişi:</span>
              <span className="font-bold text-white">
                {firstSpeaker?.avatar} {firstSpeaker?.nickname}
              </span>
            </div>
          </div>

          {/* KÖSTEBEĞİN SON ŞANSI: Konuyu Tahmin Et */}
          {isSpy && gs.phase !== 'finished' && (
            <div className="bg-slate-900/90 border border-rose-500/30 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <Target className="w-4 h-4" />
                Köstebek Hamlesi: Gizli Konuyu Tahmin Et!
              </div>
              <p className="text-xs text-slate-400">
                Konuşmalardan gizli kelimenin ne olduğunu çözdüysen veya yakalanacağını
                hissediyorsan doğru konuyu seçip oyunu anında kazanabilirsin (+30 Puan). Ama
                yanılırsan anında kaybedersin!
              </p>
              <div className="flex gap-2">
                <select
                  value={selectedGuess}
                  onChange={(e) => setSelectedGuess(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white w-full outline-none"
                >
                  <option value="">-- Kategoriden Konu Seç --</option>
                  {gs.allItems?.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleSpyGuessTopic}
                  disabled={!selectedGuess}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-500 text-white shrink-0 transition"
                >
                  Tahmin Et!
                </button>
              </div>
            </div>
          )}

          {/* OYLAMA PANELİ */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Vote className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-sm">Köstebek Oylaması</h3>
              </div>
              <span className="text-xs text-slate-400">
                Oy Verenler: {Object.keys(gs.votes || {}).length} / {room.players.length}
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Herkes sözlü olarak sorularını sorduktan sonra Köstebek olduğunu düşündüğünüz oyuncuya
              oy verin:
            </p>

            <div className="space-y-2">
              {room.players.map((p) => {
                const votesForThisPlayer = Object.entries(gs.votes || {})
                  .filter(([, targetId]) => targetId === p.id)
                  .map(([voterId]) => room.players.find((pl) => pl.id === voterId)?.nickname);

                const isMyChoice = myVote === p.id;

                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition ${
                      isMyChoice
                        ? 'bg-amber-500/15 border-amber-500/50'
                        : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{p.avatar}</span>
                      <div>
                        <span className="text-sm font-semibold text-white">{p.nickname}</span>
                        {votesForThisPlayer.length > 0 && (
                          <div className="text-[11px] text-amber-400">
                            Oylar ({votesForThisPlayer.length}): {votesForThisPlayer.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>

                    {gs.phase !== 'finished' && p.id !== myId && (
                      <button
                        onClick={() => handleCastVote(p.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          isMyChoice
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        }`}
                      >
                        {isMyChoice ? '✓ Oy Verildi' : 'Şüphelen / Oy Ver'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {isHost && gs.phase !== 'finished' && Object.keys(gs.votes || {}).length > 0 && (
              <button
                onClick={() => socket.emit('spy_finish_voting')}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition"
              >
                Oylamayı Şimdi Sonuçlandır
              </button>
            )}
          </div>
        </div>

        {/* SAĞ: KATEGORİDEKİ OLASI KONULAR TABLOSU */}
        <div className="lg:col-span-7">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  Kategorideki Olası Konular ({gs.categoryName})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Gizli konu aşağıdaki {gs.allItems?.length} seçenekten biridir. Köstebek buradaki
                  seçeneklere bakarak blöf yapabilir!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {gs.allItems?.map((item) => {
                const isSecretAndVisible = !hideCard && gs.secretTopic === item;
                return (
                  <div
                    key={item}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition ${
                      isSecretAndVisible
                        ? 'bg-indigo-600/25 border-indigo-400 text-amber-300 ring-1 ring-indigo-400'
                        : 'bg-slate-950/60 border-slate-800/90 text-slate-300'
                    }`}
                  >
                    <span>{item}</span>
                    {isSecretAndVisible && (
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

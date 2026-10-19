import React from 'react';
import { Sparkles, X, Swords, EyeOff, HelpCircle } from 'lucide-react';
import { socket } from '../socket';

export default function CountdownOverlay({ countdown, isHost }) {
  if (!countdown) return null;

  const { count, gameName } = countdown;

  const getGameIcon = () => {
    if (gameName?.toLowerCase().includes('köstebek')) return <EyeOff className="w-8 h-8 text-rose-400" />;
    if (gameName?.toLowerCase().includes('kimim')) return <HelpCircle className="w-8 h-8 text-amber-400" />;
    return <Swords className="w-8 h-8 text-indigo-400" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative text-center p-8 sm:p-12 max-w-md w-full mx-4 rounded-3xl bg-slate-900/95 border border-indigo-500/40 shadow-2xl shadow-indigo-500/20 space-y-6">
        {/* Oyun Başlığı */}
        <div className="space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center mx-auto shadow-inner">
            {getGameIcon()}
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
            Oyun Başlıyor
          </span>
          <h2 className="text-2xl font-black text-white">{gameName || 'Parti Oyunu'}</h2>
        </div>

        {/* 3-2-1 Animasyonlu Sayı */}
        <div className="relative py-4 flex items-center justify-center">
          <div className="absolute w-32 h-32 rounded-full bg-indigo-500/10 animate-ping" />
          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-600/40 border-4 border-indigo-400/40">
            <span
              key={count}
              className="text-6xl font-black text-white animate-scale-bounce select-none"
            >
              {count}
            </span>
          </div>
        </div>

        <p className="text-sm font-semibold text-slate-300">
          Roller dağıtılıyor, hazır olun!
        </p>

        {/* Host İptal Butonu */}
        {isHost && (
          <div className="pt-2">
            <button
              onClick={() => socket.emit('cancel_countdown')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-rose-400 hover:text-rose-300 border border-slate-700 transition"
            >
              <X className="w-3.5 h-3.5" />
              <span>Geri Sayımı İptal Et</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

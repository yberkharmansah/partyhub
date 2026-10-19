import React, { useState, useEffect } from 'react';
import {
  Gamepad2,
  Sparkles,
  Users,
  ArrowRight,
  LogOut,
  Copy,
  Check,
  EyeOff,
  HelpCircle,
  Swords
} from 'lucide-react';
import { socket } from './socket';
import LobbyView from './components/LobbyView';
import SpyGame from './components/SpyGame';
import WhoAmIGame from './components/WhoAmIGame';
import RpgGame from './components/RpgGame';

import CountdownOverlay from './components/CountdownOverlay';
import AdminPanel from './components/AdminPanel';

const AVATAR_OPTIONS = ['🦊', '🐼', '🦁', '🐸', '🐵', '🐯', '🐙', '🦉', '🐺', '🦄', '🐲', '🦝'];

export default function App() {
  const [myId, setMyId] = useState(socket.id);
  const [nickname, setNickname] = useState(() => localStorage.getItem('partihub_nick') || '');
  const [avatar, setAvatar] = useState(
    () => localStorage.getItem('partihub_avatar') || AVATAR_OPTIONS[0]
  );
  const [joinCode, setJoinCode] = useState('');
  const [room, setRoom] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [headerCopied, setHeaderCopied] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [isAdminView, setIsAdminView] = useState(() => {
    return window.location.pathname.startsWith('/admin') || window.location.hash.includes('admin');
  });

  // URL rotasını dinle
  useEffect(() => {
    const checkPath = () => {
      setIsAdminView(window.location.pathname.startsWith('/admin') || window.location.hash.includes('admin'));
    };
    window.addEventListener('popstate', checkPath);
    return () => window.removeEventListener('popstate', checkPath);
  }, []);

  // URL'de ?room=KOD varsa otomatik doldur
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setJoinCode(roomParam.toUpperCase());
    }
  }, []);

  useEffect(() => {
    const onConnect = () => {
      setMyId(socket.id);
      setError('');
    };
    const onConnectError = (err) => {
      console.warn('Socket bağlantı hatası:', err.message);
      setLoading(false);
      setError('Oyun sunucusuna bağlanılamadı. Sunucu uykuda veya başlatılıyor olabilir, lütfen birkaç saniye sonra tekrar deneyin.');
    };
    const onRoomState = (newState) => {
      setRoom(newState);
      setMyId(socket.id);
      // Oyun başladığında veya lobiye dönüldüğünde geri sayımı temizle
      setCountdown(null);
      // URL'yi oda koduyla senkronize tut (sayfa yenilenirse veya kopyalanırsa kolaylık sağlar)
      if (newState?.code && !window.location.pathname.startsWith('/admin')) {
        const url = new URL(window.location.href);
        url.searchParams.set('room', newState.code);
        window.history.replaceState({}, '', url.toString());
      }
    };

    const onCountdownTick = (data) => {
      setCountdown(data);
    };

    const onCountdownCancelled = () => {
      setCountdown(null);
    };

    socket.on('connect', onConnect);
    socket.on('connect_error', onConnectError);
    socket.on('room_state', onRoomState);
    socket.on('game_countdown_tick', onCountdownTick);
    socket.on('game_countdown_cancelled', onCountdownCancelled);

    return () => {
      socket.off('connect', onConnect);
      socket.off('connect_error', onConnectError);
      socket.off('room_state', onRoomState);
      socket.off('game_countdown_tick', onCountdownTick);
      socket.off('game_countdown_cancelled', onCountdownCancelled);
    };
  }, []);

  const saveProfile = () => {
    localStorage.setItem('partihub_nick', nickname.trim());
    localStorage.setItem('partihub_avatar', avatar);
  };

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setError('Lütfen oyunda görünecek bir takma ad (nick) girin!');
      return;
    }
    setError('');
    setLoading(true);
    saveProfile();

    socket.emit('create_room', { nickname: nickname.trim(), avatar }, (res) => {
      setLoading(false);
      if (!res?.ok) {
        setError(res?.error || 'Lobi oluşturulamadı.');
      }
    });
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setError('Lütfen oyunda görünecek bir takma ad (nick) girin!');
      return;
    }
    if (!joinCode.trim()) {
      setError('Katılmak için 6 haneli lobi kodunu girin!');
      return;
    }
    setError('');
    setLoading(true);
    saveProfile();

    socket.emit(
      'join_room',
      { roomCode: joinCode.trim().toUpperCase(), nickname: nickname.trim(), avatar },
      (res) => {
        setLoading(false);
        if (!res?.ok) {
          setError(res?.error || 'Lobiye katılınamadı.');
        }
      }
    );
  };

  const handleLeaveRoom = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('room');
    window.location.href = url.toString();
  };

  const copyHeaderInvite = () => {
    if (!room?.code) return;
    const inviteUrl = `${window.location.origin}/?room=${room.code}`;
    navigator.clipboard.writeText(inviteUrl);
    setHeaderCopied(true);
    setTimeout(() => setHeaderCopied(false), 2000);
  };

  const handleBackFromAdmin = () => {
    setIsAdminView(false);
    window.history.pushState({}, '', '/');
  };

  // EKRAN 0: YÖNETİCİ PANELİ (/admin)
  if (isAdminView) {
    return <AdminPanel onBackToLobby={handleBackFromAdmin} />;
  }

  // EKRAN 1: GİRİŞ & LOBİ OLUŞTUR / KATIL
  if (!room) {
    const isInvited = Boolean(new URLSearchParams(window.location.search).get('room'));

    return (
      <div className="min-h-screen flex flex-col justify-between p-4 sm:p-8 max-w-5xl mx-auto">
        {/* Üst Logo */}
        <header className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-white">PartiHub</span>
              <span className="ml-2 text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Hızlı Parti & RPG
              </span>
            </div>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Üyelik Yok • Linkle Davet Et • Anında Oyna
          </span>
        </header>

        {/* Ana Karşılama & Form */}
        <main className="my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Sol Tanıtım */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-4 h-4" />
              Arkadaşlarınla Saniyeler İçinde Lobi Kur
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
              Hesap Açmadan{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                3 Efsane Oyun
              </span>{' '}
              Tek Platformda!
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Takma adını seç, lobini oluştur ve davet linkini arkadaşlarına gönder. Minimum oyuncu
              sayısı tamamlandığında hemen oyuna başlayın!
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                <EyeOff className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-white">1. Köstebek Kim? (Min. 3 Kişi)</h3>
                  <p className="text-xs text-slate-400">
                    Kategoriden gizli bir film/oyun/konu herkese dağıtılır. Köstebek konuyu bilmez ama
                    biliyormuş gibi rol yapar!
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                <HelpCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-white">2. Ben Kimim? (Min. 2 Kişi)</h3>
                  <p className="text-xs text-slate-400">
                    Herkes diğerlerinin kim olduğunu görür ama kendi karakterini göremez. Sorularla
                    kim olduğunu ilk bulan puanı kapar!
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                <Swords className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-white">3. Kader Zarları: Text RPG</h3>
                  <p className="text-xs text-slate-400">
                    Sınıfını seç, hayali senaryolarda ekibinle kararlar al! d20 zarların ve statlarınla
                    hikayeyi yönlendir.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sağ Giriş Kartı */}
          <div className="lg:col-span-6">
            <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-white">
                  {isInvited ? `🎉 #${joinCode} Lobisine Davet Edildin!` : 'Hızlı Oyuncu Girişi'}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Oturum açmana gerek yok. Sadece oyunda görünecek nickini ve avatarını seç:
                </p>
              </div>

              {/* Nickname & Avatar Seçimi */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Takma Adın (Nickname)
                  </label>
                  <input
                    type="text"
                    maxLength={18}
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Örn: Berk, GölgeAvcısı, Kaptan..."
                    className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-white outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Avatar Seç
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {AVATAR_OPTIONS.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setAvatar(item)}
                        className={`p-2 text-2xl rounded-xl border transition flex items-center justify-center ${
                          avatar === item
                            ? 'bg-indigo-600/30 border-indigo-400 scale-105'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                  {error}
                </div>
              )}

              {/* Davet Linkiyle Geldiyse Önce Katıl Butonu */}
              {isInvited ? (
                <div className="space-y-3 pt-2">
                  <button
                    onClick={handleJoinRoom}
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition"
                  >
                    <span>#{joinCode} Lobisine Hemen Katıl</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCreateRoom}
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  >
                    Veya Yeni Bir Lobi Oluştur
                  </button>
                </div>
              ) : (
                <div className="space-y-5 pt-2">
                  <button
                    onClick={handleCreateRoom}
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition"
                  >
                    <Users className="w-4 h-4" />
                    <span>Yeni Lobi Oluştur</span>
                  </button>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-800"></div>
                    <span className="flex-shrink mx-3 text-xs text-slate-500 uppercase font-semibold">
                      veya kod ile katıl
                    </span>
                    <div className="flex-grow border-t border-slate-800"></div>
                  </div>

                  <form onSubmit={handleJoinRoom} className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      placeholder="LOBİ KODU (Örn: AB12CD)"
                      className="bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-white font-mono uppercase tracking-widest w-full outline-none"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-5 py-3 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 shrink-0 transition"
                    >
                      Katıl
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </main>

        <footer className="text-center text-xs text-slate-500 py-4">
          PartiHub — Gerçek Zamanlı Çok Oyunculu Web Oyun Platformu
        </footer>
      </div>
    );
  }

  // EKRAN 2: ODA İÇİ (LOBİ VEYA AKTİF OYUN)
  return (
    <div className="min-h-screen flex flex-col max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Üst Oda Barı */}
      <header className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center">
            <Gamepad2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-base text-white">PartiHub</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-indigo-300 font-mono font-bold">
                #{room.code}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={copyHeaderInvite}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition"
          >
            {headerCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {headerCopied ? 'Link Kopyalandı' : 'Davet Linki'}
          </button>

          <button
            onClick={handleLeaveRoom}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            Odadan Çık
          </button>
        </div>
      </header>

      {/* Geri Sayım Katmanı */}
      <CountdownOverlay
        countdown={countdown}
        isHost={room.hostId === myId}
      />

      {/* İçerik: Lobi ya da Seçilen Oyun (Canlı Sahne Geçiş Animasyonlu) */}
      <main className="flex-grow">
        {room.status === 'lobby' && (
          <div key="lobby" className="animate-fade-in">
            <LobbyView room={room} myId={myId} />
          </div>
        )}
        {room.status === 'playing' && room.gameState?.type === 'spy' && (
          <div key={`spy-${room.roundNumber}`} className="animate-slide-up">
            <SpyGame room={room} myId={myId} />
          </div>
        )}
        {room.status === 'playing' && room.gameState?.type === 'whoami' && (
          <div key={`whoami-${room.roundNumber}`} className="animate-slide-up">
            <WhoAmIGame room={room} myId={myId} />
          </div>
        )}
        {room.status === 'playing' && room.gameState?.type === 'rpg' && (
          <div key={`rpg-${room.roundNumber}`} className="animate-slide-up">
            <RpgGame room={room} myId={myId} />
          </div>
        )}
      </main>
    </div>
  );
}

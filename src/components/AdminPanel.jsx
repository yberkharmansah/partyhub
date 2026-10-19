import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  Plus,
  Trash2,
  RefreshCw,
  X,
  EyeOff,
  HelpCircle,
  ArrowLeft,
  UserCheck,
  LogOut,
  Sparkles,
  Database,
  UploadCloud,
  CheckCircle2
} from 'lucide-react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { SERVER_URL } from '../config';

export default function AdminPanel({ onBackToLobby }) {
  // Firebase Auth State
  const [currentUser, setCurrentUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Veri Yönetim State
  const [token, setToken] = useState('');
  const [activeTab, setActiveTab] = useState('spy'); // 'spy' | 'whoami'
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [isSyncingFirestore, setIsSyncingFirestore] = useState(false);

  // Yeni Kart Ekleme State
  const [selectedCatId, setSelectedCatId] = useState('');
  const [newCardName, setNewCardName] = useState('');

  // Yeni Kategori Ekleme State
  const [showNewCatModal, setShowNewCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const idToken = await user.getIdToken();
        setToken(idToken);
        loadDataFromAllSources(idToken);
      } else {
        setCurrentUser(null);
        setToken('');
        setGameData(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Hem sunucudan hem Firestore'dan veri yükleme & gerekirse senkronize etme
  const loadDataFromAllSources = async (authToken) => {
    setLoading(true);
    setStatusMsg('');
    try {
      // 1. Önce sunucudan veriyi çek
      const res = await fetch(`${SERVER_URL}/api/admin/data`, {
        headers: { Authorization: `Bearer ${authToken || token}` }
      });
      const json = await res.json();
      
      let currentData = null;
      if (json.ok && json.data) {
        currentData = json.data;
        setGameData(json.data);
      }

      // 2. Firestore'u kontrol et
      try {
        const docRef = doc(db, 'game_settings', 'active_pool');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const fsData = docSnap.data();
          if (fsData.spy && fsData.whoami) {
            // Firestore'da daha güncel/mevcut veri varsa onu esas al ve sunucuya gönder
            setGameData({ spy: fsData.spy, whoami: fsData.whoami });
            await fetch(`${SERVER_URL}/api/admin/sync-all`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken || token}`
              },
              body: JSON.stringify({ spy: fsData.spy, whoami: fsData.whoami })
            });
            setStatusMsg('✓ Veriler Firestore veritabanından başarıyla yüklendi.');
            return;
          }
        } else if (currentData) {
          // Firestore boşsa sunucudaki zengin default verileri Firestore'a otomatik kaydet (Seed)
          await setDoc(docRef, {
            spy: currentData.spy,
            whoami: currentData.whoami,
            updatedAt: new Date().toISOString(),
            updatedBy: auth.currentUser?.email || 'admin'
          });
          setStatusMsg('✓ Mevcut zengin oyun kartları Firestore veritabanına otomatik aktarıldı (Seeded)!');
        }
      } catch (fsErr) {
        console.warn('Firestore erişim bildirimi:', fsErr);
      }
    } catch (err) {
      console.error(err);
      setAuthError('Veriler yüklenirken sunucu veya ağ hatası oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async (authToken) => {
    setLoading(true);
    try {
      const res = await fetch(`${SERVER_URL}/api/admin/data`, {
        headers: { Authorization: `Bearer ${authToken || token}` }
      });
      const json = await res.json();
      if (json.ok) {
        setGameData(json.data);
      }
    } catch {
      setAuthError('Sunucuya bağlanılamadı.');
    } finally {
      setLoading(false);
    }
  };

  // Firebase Mail/Şifre ile Giriş
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      if (isRegisterMode) {
        const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        setCurrentUser(userCred.user);
      } else {
        const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
        setCurrentUser(userCred.user);
      }
    } catch (err) {
      let msg = 'Giriş yapılamadı.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        msg = 'Hatalı e-posta veya şifre!';
      } else if (err.code === 'auth/user-not-found') {
        msg = 'Bu e-posta ile kayıtlı kullanıcı bulunamadı. "Yeni Admin Hesabı Oluştur" ile kayıt olabilirsiniz.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'Bu e-posta zaten kullanımda, lütfen giriş yapın.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Şifre en az 6 karakter olmalıdır.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Geçerli bir e-posta adresi girin.';
      } else {
        msg = err.message || 'Firebase Auth hatası oluştu.';
      }
      setAuthError(msg);
    } finally {
      setAuthLoading(false);
    }
  };

  // Çıkış Yap
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setToken('');
      setEmail('');
      setPassword('');
    } catch (err) {
      console.error(err);
    }
  };

  // Firestore Veritabanına Anlık Senkronizasyon
  const syncWithFirestore = async (dataToSync) => {
    if (!dataToSync) return;
    try {
      setIsSyncingFirestore(true);
      const docRef = doc(db, 'game_settings', 'active_pool');
      await setDoc(docRef, {
        spy: dataToSync.spy,
        whoami: dataToSync.whoami,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser?.email || 'admin'
      });
      setIsSyncingFirestore(false);
      setStatusMsg('✓ Değişiklikler Firestore veritabanına ve sunucuya senkronize edildi.');
    } catch (err) {
      console.warn('Firestore senkronizasyon bildirimi:', err);
      setIsSyncingFirestore(false);
    }
  };

  // Manuel "Veritabanını Firestore'a Bas / Senkronize Et" Butonu
  const handleManualFirestoreSeed = async () => {
    if (!gameData) return;
    try {
      setIsSyncingFirestore(true);
      const docRef = doc(db, 'game_settings', 'active_pool');
      await setDoc(docRef, {
        spy: gameData.spy,
        whoami: gameData.whoami,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser?.email || 'admin'
      });
      setIsSyncingFirestore(false);
      setStatusMsg('✓ Tüm kategoriler ve kartlar başarıyla Firestore Veritabanına yazıldı!');
    } catch (err) {
      setIsSyncingFirestore(false);
      setStatusMsg('Firestore veritabanına yazılırken hata: ' + (err.message || ''));
    }
  };

  // Kart Ekle
  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!selectedCatId || !newCardName.trim()) return;

    const cardToAdd = newCardName.trim();
    setNewCardName('');

    try {
      const res = await fetch(`${SERVER_URL}/api/admin/card`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          gameType: activeTab,
          categoryId: selectedCatId,
          card: cardToAdd
        })
      });
      const json = await res.json();
      if (json.ok && json.category) {
        setStatusMsg(`✓ "${cardToAdd}" kartı başarıyla eklendi!`);
        
        // Yerel state'i anında güncelle
        setGameData((prev) => {
          if (!prev) return prev;
          const nextData = {
            ...prev,
            [activeTab]: {
              ...prev[activeTab],
              [selectedCatId]: json.category
            }
          };
          syncWithFirestore(nextData);
          return nextData;
        });
      }
    } catch {
      setStatusMsg('Kart eklenirken hata oluştu.');
    }
  };

  // Kart Sil
  const handleDeleteCard = async (categoryId, cardIdentifier) => {
    if (!window.confirm(`"${cardIdentifier}" kartını silmek istediğinize emin misiniz?`)) return;

    try {
      const res = await fetch(`${SERVER_URL}/api/admin/card`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          gameType: activeTab,
          categoryId,
          cardIdentifier
        })
      });
      const json = await res.json();
      if (json.ok && json.category) {
        setStatusMsg(`✓ "${cardIdentifier}" kartı silindi.`);
        
        // Yerel state'i anında güncelle
        setGameData((prev) => {
          if (!prev) return prev;
          const nextData = {
            ...prev,
            [activeTab]: {
              ...prev[activeTab],
              [categoryId]: json.category
            }
          };
          syncWithFirestore(nextData);
          return nextData;
        });
      }
    } catch {
      setStatusMsg('Kart silinemedi.');
    }
  };

  // Kategori Ekle
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const catName = newCatName.trim();
    const catDesc = newCatDesc.trim();

    try {
      const res = await fetch(`${SERVER_URL}/api/admin/category`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          gameType: activeTab,
          category: {
            name: catName,
            description: catDesc,
            items: []
          }
        })
      });
      const json = await res.json();
      if (json.ok && json.category) {
        setNewCatName('');
        setNewCatDesc('');
        setShowNewCatModal(false);
        setSelectedCatId(json.category.id);
        setStatusMsg(`✓ "${catName}" kategorisi başarıyla oluşturuldu!`);

        // Yerel state'i anında güncelle
        setGameData((prev) => {
          if (!prev) return prev;
          const nextData = {
            ...prev,
            [activeTab]: {
              ...prev[activeTab],
              [json.category.id]: json.category
            }
          };
          syncWithFirestore(nextData);
          return nextData;
        });
      }
    } catch {
      setStatusMsg('Kategori oluşturulamadı.');
    }
  };

  // Kategori Sil
  const handleDeleteCategory = async (catId, catName) => {
    if (
      !window.confirm(
        `"${catName}" kategorisini ve içindeki tüm kartları silmek istediğinize emin misiniz?`
      )
    )
      return;

    try {
      const res = await fetch(`${SERVER_URL}/api/admin/category/${activeTab}/${catId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.ok) {
        setStatusMsg(`✓ "${catName}" kategorisi silindi.`);
        if (selectedCatId === catId) setSelectedCatId('');

        // Yerel state'i anında güncelle
        setGameData((prev) => {
          if (!prev) return prev;
          const nextTabObj = { ...prev[activeTab] };
          delete nextTabObj[catId];
          const nextData = {
            ...prev,
            [activeTab]: nextTabObj
          };
          syncWithFirestore(nextData);
          return nextData;
        });
      }
    } catch {
      setStatusMsg('Kategori silinemedi.');
    }
  };

  const handleResetDefaults = async () => {
    if (
      !window.confirm(
        'TÜM özel kartlar ve kategoriler sıfırlanıp fabrika ayarlarına döndürülecek. Onaylıyor musunuz?'
      )
    )
      return;

    try {
      const res = await fetch(`${SERVER_URL}/api/admin/reset`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.ok) {
        setGameData(json.data);
        syncWithFirestore(json.data);
        setStatusMsg('✓ Fabrika ayarlarına başarıyla döndürüldü ve Firestore güncellendi.');
      }
    } catch {
      setStatusMsg('Sıfırlama başarısız.');
    }
  };

  // ==========================================
  // EKRAN 1: FİREBASE AUTH GİRİŞ / KAYIT EKRANI
  // ==========================================
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900/95 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-indigo-600/20 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-white">PartiHub Admin</h2>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
              <Database className="w-3 h-3" />
              <span>Firebase Auth & Firestore</span>
            </div>
            <p className="text-xs text-slate-400">
              {isRegisterMode
                ? 'Yeni bir yetkili yönetici hesabı oluşturun'
                : 'Yönetici e-posta ve şifrenizle giriş yapın'}
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Yönetici E-Posta
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@partyhub.com"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white outline-none pl-10"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Şifre
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white outline-none pl-10"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold leading-relaxed">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-lg shadow-amber-500/20 transition active:scale-95 disabled:opacity-50"
            >
              {authLoading
                ? 'Doğrulanıyor...'
                : isRegisterMode
                ? 'Firebase Admin Hesabı Oluştur'
                : 'Firebase ile Giriş Yap'}
            </button>
          </form>

          <div className="pt-2 text-center space-y-3">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setAuthError('');
              }}
              className="text-xs text-amber-400 hover:underline block mx-auto font-medium"
            >
              {isRegisterMode
                ? 'Zaten bir hesabınız var mı? Giriş yapın'
                : 'İlk defa mı giriyorsunuz? Yeni Admin Hesabı Oluşturun'}
            </button>

            <button
              type="button"
              onClick={onBackToLobby}
              className="text-xs text-slate-400 hover:text-white transition flex items-center justify-center gap-1 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Oyun Hubuna Geri Dön</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // EKRAN 2: FİREBASE İLE YETKİLENDİRİLMİŞ ADMIN PANELİ
  // ==========================================
  const currentCategories = gameData ? gameData[activeTab] || {} : {};
  const currentCategoryList = Object.values(currentCategories);
  const activeSelectedCategory =
    currentCategories[selectedCatId] || currentCategoryList[0] || null;

  return (
    <div className="min-h-screen max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Üst Bar */}
      <header className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl px-6 py-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-lg text-white">PartiHub Admin Paneli</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <UserCheck className="w-3 h-3" />
                {currentUser?.email}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Firebase Auth ile giriş yapıldı • Kodsuz kategori ve kart yönetimi aktif
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleManualFirestoreSeed}
            disabled={isSyncingFirestore}
            title="Mevcut havuzu doğrudan Firestore veritabanına yaz ve yedekle"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition disabled:opacity-50"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isSyncingFirestore ? 'Firestore’a Yazılıyor...' : 'Firestore’a Bas'}
            </span>
          </button>

          <button
            onClick={handleResetDefaults}
            title="Orijinal veri havuzuna sıfırla"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Fabrika Ayarlarına Dön</span>
          </button>

          <button
            onClick={onBackToLobby}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Oyuna Dön</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition shadow-sm"
            title="Firebase Oturumunu Kapat"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </header>

      {statusMsg && (
        <div className="p-3.5 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-200 text-xs font-bold flex items-center justify-between">
          <span>{statusMsg}</span>
          <button onClick={() => setStatusMsg('')} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Oyun Seçim Sekmeleri */}
      <div className="flex gap-3 border-b border-slate-800 pb-2">
        <button
          onClick={() => {
            setActiveTab('spy');
            setSelectedCatId('');
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition ${
            activeTab === 'spy'
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          <EyeOff className="w-4 h-4" />
          <span>Köstebek Kim? (Kelime Havuzu)</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('whoami');
            setSelectedCatId('');
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition ${
            activeTab === 'whoami'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Ben Kimim? (Karakter Kartları)</span>
        </button>
      </div>

      {/* Ana Yönetim Alanı */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SOL PANEL: KATEGORİLER */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">
                Kategoriler ({currentCategoryList.length})
              </h3>
              <button
                onClick={() => setShowNewCatModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Yeni Kategori</span>
              </button>
            </div>

            {/* Kategori Listesi */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {currentCategoryList.map((cat) => {
                const isSelected = (selectedCatId || currentCategoryList[0]?.id) === cat.id;

                return (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedCatId(cat.id)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-600/25 border-indigo-400 ring-1 ring-indigo-400'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-white">{cat.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {cat.items?.length || 0} Kart • {cat.description || 'Açıklama yok'}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(cat.id, cat.name);
                      }}
                      title="Kategoriyi Sil"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SAĞ PANEL: SEÇİLİ KATEGORİNİN KARTLARI VE KART EKLEME */}
        <div className="lg:col-span-7 space-y-4">
          {activeSelectedCategory ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-base text-white">
                    {activeSelectedCategory.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Toplam {activeSelectedCategory.items?.length || 0} kart bulunuyor
                  </p>
                </div>
              </div>

              {/* Yeni Kart Ekleme Formu */}
              <form onSubmit={handleAddCard} className="flex gap-2">
                <input
                  type="text"
                  value={newCardName}
                  onChange={(e) => setNewCardName(e.target.value)}
                  placeholder={
                    activeTab === 'spy'
                      ? 'Yeni gizli kelime/konu yaz (Örn: Matrix, Çiğ Köfte)...'
                      : 'Yeni karakter/kişi adı yaz (Örn: Batman, Barış Manço)...'
                  }
                  className="bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white w-full outline-none"
                />
                <button
                  type="submit"
                  disabled={!newCardName.trim()}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white shrink-0 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ekle</span>
                </button>
              </form>

              {/* Kartlar Tablosu */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[420px] overflow-y-auto pr-1">
                {activeSelectedCategory.items?.map((item, idx) => {
                  const cardLabel = typeof item === 'string' ? item : item.name;

                  return (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-semibold text-slate-200 flex items-center justify-between group"
                    >
                      <span className="truncate mr-1">{cardLabel}</span>
                      <button
                        onClick={() =>
                          handleDeleteCard(activeSelectedCategory.id, cardLabel)
                        }
                        title="Kartı Sil"
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
              Lütfen soldan bir kategori seçin veya yeni kategori oluşturun.
            </div>
          )}
        </div>
      </div>

      {/* YENİ KATEGORİ EKLEME MODALI */}
      {showNewCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-white">Yeni Kategori Oluştur</h3>
              <button
                onClick={() => setShowNewCatModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Kategori Adı
                </label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Örn: Marvel Sinematik Evreni, Türk Dizileri..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Açıklama (İsteğe bağlı)
                </label>
                <input
                  type="text"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Kategoriyi tanıtan kısa cümle..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewCatModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={!newCatName.trim()}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white transition"
                >
                  Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

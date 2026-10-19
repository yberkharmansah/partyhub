import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SPY_CATEGORIES, WHOAMI_CATEGORIES } from './data/gameData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'data', 'customData.json');

// Varsayılan bellek içi veri deposu
let categoriesData = {
  spy: JSON.parse(JSON.stringify(SPY_CATEGORIES)),
  whoami: JSON.parse(JSON.stringify(WHOAMI_CATEGORIES))
};

// Varsa diske kaydedilmiş özel kart/kategori dosyasını yükle
export function initCustomData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed.spy && parsed.whoami) {
        categoriesData = parsed;
        console.log('📦 Kayıtlı özel oyun verileri başarıyla yüklendi.');
      }
    }
  } catch (err) {
    console.error('Özel veri yüklenirken hata oluştu:', err);
  }
}

// Değişiklikleri diske kaydet
function persistData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(categoriesData, null, 2), 'utf-8');
  } catch (err) {
    console.error('Özel veri kaydedilirken hata oluştu:', err);
  }
}

export function getCategories(gameType) {
  return categoriesData[gameType] || {};
}

export function getAllGameData() {
  return categoriesData;
}

// 1. Yeni Kategori Ekle veya Mevcut Olanı Düzenle
export function saveCategory(gameType, { id, name, description, icon = 'Sparkles', items = [] }) {
  if (!categoriesData[gameType]) categoriesData[gameType] = {};

  const cleanId = (id || name.toLowerCase().replace(/[^a-z0-9_]/g, '_')).trim();

  // Mevcutsa güncelle, değilse oluştur
  const existing = categoriesData[gameType][cleanId];
  categoriesData[gameType][cleanId] = {
    id: cleanId,
    name: name.trim(),
    description: description ? description.trim() : (existing?.description || ''),
    icon: icon || existing?.icon || 'Sparkles',
    items: items && items.length > 0 ? items : (existing?.items || [])
  };

  persistData();
  return categoriesData[gameType][cleanId];
}

// 2. Kategoriyi Sil
export function deleteCategory(gameType, categoryId) {
  if (categoriesData[gameType] && categoriesData[gameType][categoryId]) {
    delete categoriesData[gameType][categoryId];
    persistData();
    return true;
  }
  return false;
}

// 3. Kategoriye Yeni Kart/Kelime Ekle
export function addCardToCategory(gameType, categoryId, cardItem) {
  const cat = categoriesData[gameType]?.[categoryId];
  if (!cat) return null;

  if (gameType === 'spy') {
    // string kelime
    const word = typeof cardItem === 'string' ? cardItem.trim() : cardItem.name.trim();
    if (!cat.items.includes(word)) {
      cat.items.push(word);
    }
  } else if (gameType === 'whoami') {
    // { name: '...' }
    const name = typeof cardItem === 'string' ? cardItem.trim() : cardItem.name.trim();
    const existing = cat.items.find((i) => (typeof i === 'string' ? i : i.name) === name);
    if (!existing) {
      cat.items.push({ name });
    }
  }

  persistData();
  return cat;
}

// 4. Kart/Kelimeyi Sil
export function removeCardFromCategory(gameType, categoryId, cardIdentifier) {
  const cat = categoriesData[gameType]?.[categoryId];
  if (!cat) return null;

  if (gameType === 'spy') {
    cat.items = cat.items.filter((item) => item !== cardIdentifier);
  } else if (gameType === 'whoami') {
    cat.items = cat.items.filter((item) => {
      const name = typeof item === 'string' ? item : item.name;
      return name !== cardIdentifier;
    });
  }

  persistData();
  return cat;
}

// 5. Tüm Verileri Senkronize Et (Firestore veya istemci kaynağından gelen toplu veri)
export function syncAllData(allData) {
  if (allData && allData.spy && allData.whoami) {
    categoriesData = {
      spy: allData.spy,
      whoami: allData.whoami
    };
    persistData();
    return categoriesData;
  }
  return null;
}

// 6. Verileri Fabrika Ayarlarına Döndür
export function resetToDefaults() {
  categoriesData = {
    spy: JSON.parse(JSON.stringify(SPY_CATEGORIES)),
    whoami: JSON.parse(JSON.stringify(WHOAMI_CATEGORIES))
  };
  persistData();
  return categoriesData;
}

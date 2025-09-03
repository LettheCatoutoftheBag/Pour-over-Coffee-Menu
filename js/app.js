//============================================================
// File: js/app.js (v2.0 - 根據新需求全面更新)
//============================================================
'use strict';

// --- 全域常數與變數 ---

/**
 * @constant {string} LANG_KEY
 * 用於在 localStorage 中儲存和讀取使用者語言偏好的鍵名。
 */
const LANG_KEY = 'menu_lang';

/**
 * @constant {string[]} SUPPORTED_LANGS
 * 應用程式支援的語言代碼列表。
 */
const SUPPORTED_LANGS = ['zh', 'en', 'yue', 'ko', 'ja'];

/**
 * @let {string} LANG
 * 當前應用的語言。從 localStorage 初始化，預設為 null。
 */
let LANG = localStorage.getItem(LANG_KEY);

/**
 * @let {string} CURRENT_TAB
 * 當前選中的咖啡豆分類標籤，預設為 'all' (全部)。
 */
let CURRENT_TAB = 'all';

/**
 * @let {Array<Object>} ALL_BEANS
 * 從 CSV 文件載入並解析後的所有咖啡豆資料陣列。
 */
let ALL_BEANS = [];

// --- DOM 操作輔助函式 ---

/**
 * querySelector 的簡寫版。
 * @param {string} sel - CSS 選擇器。
 * @param {Element} [root=document] - 查詢的根元素，預設為 document。
 * @returns {Element|null} 匹配的第一個元素。
 */
const $ = (sel, root = document) => root.querySelector(sel);

/**
 * querySelectorAll 的簡寫版，並將結果轉為真實陣列。
 * @param {string} sel - CSS 選擇器。
 * @param {Element} [root=document] - 查詢的根元素，預設為 document。
 * @returns {Element[]} 匹配的所有元素的陣列。
 */
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// --- UI 文本與國際化 (i18n) ---

/**
 * @constant {Object} UI
 * 儲存所有支援語言的 UI 文本。
 * 【需求 5】: 全面更新所有語言的文本，與中文版同步。
 */
const UI = {
  zh: {
    title: '手沖豆單',
    subtitle: '1. 莊園級咖啡 $150，競賽級咖啡 $200，瑰夏 Geisha $300，限量版價格請至櫃檯詢問。\n2. 手沖比率皆為 1 : 16，若有濃淡度需求請於點餐時告知。',
    search_placeholder: '搜尋：品名、產區、風味、焙度…',
    tabs: { all: '全部', estate: '莊園級咖啡', competition: '競賽級咖啡', geisha: '瑰夏 Geisha', limited: '限量版' },
    badge: { featured: '本日推薦' }, // 'soldout' 已不再需要，因為售完商品會被隱藏
    empty: '沒有符合的品項。',
    gate_title: '選擇語言 / Choose Language',
    gate_note: '此偏好會儲存在本機裝置，可隨時更改。',
    gate_change: '可在頁面右上角再次更改語言'
  },
  en: {
    title: 'Pour-Over Menu',
    subtitle: '1. Estate $150, Competition $200, Geisha $300. For limited editions, please ask at the counter.\n2. The default pour-over ratio is 1:16. Please inform us if you have other preferences.',
    search_placeholder: 'Search: name, origin, flavors, roast…',
    tabs: { all: 'All', estate: 'Estate Coffee', competition: 'Competition Coffee', geisha: 'Geisha', limited: 'Limited Edition' },
    badge: { featured: 'Featured' },
    empty: 'No items found.',
    gate_title: 'Choose Language',
    gate_note: 'This preference is saved on your device and can be changed anytime.',
    gate_change: 'You can change the language again from the top-right corner'
  },
  yue: {
    title: '手沖豆單',
    subtitle: '1. 莊園級咖啡 $150，競賽級咖啡 $200，瑰夏 Geisha $300，限量版價格請到櫃檯查詢。\n2. 手沖比例係 1:16，如果對濃度有要求，落單時請話我哋知。',
    search_placeholder: '搜尋：品名、產區、風味、焙度…',
    tabs: { all: '全部', estate: '莊園級咖啡', 'competition': '競賽級咖啡', geisha: '瑰夏 Geisha', limited: '限量版' },
    badge: { featured: '今日推介' },
    empty: '冇搵到相符嘅品項。',
    gate_title: '選擇語言 / Choose Language',
    gate_note: '呢個偏好會儲存喺你嘅裝置，可以隨時更改。',
    gate_change: '可以喺頁面右上角再次更改語言'
  },
  ko: {
    title: '푸어오버 메뉴',
    subtitle: '1. 에스테이트 커피 ₩150, 대회용 커피 ₩200, 게이샤 ₩300. 한정판 가격은 카운터에 문의해주세요.\n2. 푸어오버 비율은 1:16입니다. 농도 조절이 필요하시면 주문 시 말씀해주세요.',
    search_placeholder: '검색: 이름, 원산지, 풍미, 로스팅 정도…',
    tabs: { all: '전체', estate: '에스테이트 커피', competition: '대회급 커피', geisha: '게이샤', limited: '한정판' },
    badge: { featured: '추천' },
    empty: '해당하는 항목이 없습니다.',
    gate_title: '언어 선택 / Choose Language',
    gate_note: '이 설정은 기기에 저장되며 언제든지 변경할 수 있습니다.',
    gate_change: '페이지 오른쪽 상단에서 언어를 다시 변경할 수 있습니다'
  },
  ja: {
    title: 'ハンドドリップメニュー',
    subtitle: '1. エステート ¥150, コンペティション ¥200, ゲイシャ ¥300. 限定版の価格はカウンターでお尋ねください。\n2. ハンドドリップの比率は1:16です。濃さのご要望はご注文時にお知らせください。',
    search_placeholder: '検索：品名、産地、風味、焙煎度…',
    tabs: { all: 'すべて', estate: 'エステート', competition: 'コンペ', geisha: 'ゲイシャ', limited: '限定版' },
    badge: { featured: 'おすすめ' },
    empty: '該当する品目がありません。',
    gate_title: '言語を選択 / Choose Language',
    gate_note: 'この設定はデバイスに保存され、いつでも変更できます。',
    gate_change: 'ページの右上隅で再度言語を変更できます'
  }
};

/**
 * @constant {Object} ROAST_TRANSLATIONS
 * 英文焙度與中文的對照表。
 */
const ROAST_TRANSLATIONS = {
  'Light': '淺',
  'Light-Medium': '淺中',
  'Medium': '中',
  'Medium-Dark': '中深',
  'Dark': '深'
};

// --- 資料處理 ---

/**
 * 自製的簡易 CSV 解析函式。
 * @param {string} text - CSV 格式的原始字串。
 * @returns {Array<Array<string>>} - 解析後的二維陣列。
 */
function parseCSV(text) {
  const rows = [];
  let i = 0, field = '', row = [], inQuotes = false;
  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"'; i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ',') {
        row.push(field); field = '';
      } else if (c === '\n' || c === '\r') {
        if (field !== '' || row.length) {
          row.push(field);
          rows.push(row.map(s => s.trim()));
          row = []; field = '';
        }
      } else {
        field += c;
      }
    }
    i++;
  }
  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row.map(s => s.trim()));
  }
  return rows.filter(r => r.length && !r[0].startsWith('#'));
}

/**
 * 異步載入並解析 beans.csv 檔案。
 * @returns {Promise<Array<Object>>} - 解析完成的咖啡豆物件陣列。
 */
async function loadBeans() {
  // 【修改點】: 將資料來源指向 Google Sheets 發佈的 CSV 網址
  const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR6Zx5IKqnxZH3cyWCusoxwvAejqgVPZqnUVyo-4Xhs-kdOkFKoh0V9W5qi-12hB9BRMvOHzVlLzDNC/pub?gid=1947339755&single=true&output=csv'; // <--- 請貼上您自己的網址

  try {
    // 加上 { cache: 'no-store' } 確保每次都能抓到最新的資料，避免被快取
    const res = await fetch(GOOGLE_SHEET_CSV_URL, { cache: 'no-store' });
    const txt = await res.text();
    const rows = parseCSV(txt);
    const header = rows.shift();
    return rows.map(r => Object.fromEntries(header.map((h, i) => [h, r[i] || ''])));
  } catch (err) {
    console.error('Failed to load or parse Google Sheet CSV:', err);
    return [];
  }
}

/**
 * 根據當前語言設定，從物件中選擇對應的語言欄位，並具備回退機制。
 * @param {Object} obj - 資料物件。
 * @param {string} base - 欄位的基礎名稱。
 * @returns {string} - 找到的最適合的語言字串。
 */
function pickLang(obj, base) {
  const prefer = `${base}_${LANG}`;
  const fallbacks = [prefer, `${base}_en`, `${base}_zh`];
  for (const k of fallbacks) {
    if (obj[k] && obj[k].trim()) return obj[k].trim();
  }
  return '';
}

// --- UI 渲染 ---

/**
 * 將咖啡豆項目陣列渲染到畫面上。
 * @param {Array<Object>} items - 要顯示的咖啡豆物件陣列。
 */
function renderList(items) {
  const dict = UI[LANG] || UI.zh;
  const list = $('#list');
  list.innerHTML = '';

  if (!items.length) {
    list.innerHTML = `<p class="text-sm text-slate-500 text-center">${dict.empty}</p>`;
    return;
  }

  for (const it of items) {
    // --- 資料準備 ---
    const featured = (it.is_featured || '').toLowerCase() === 'true';
    const flavorTags = pickLang(it, 'flavor_tags').split('|').map(s => s.trim()).filter(Boolean);
    const roastZh = ROAST_TRANSLATIONS[it.roast] || it.roast;
    const roastText = `${roastZh}焙 ${it.roast}`;
    const tasteTextHTML = (it.taste || '').replace(/\\n|\n/g, '<br>');

    // 【需求 1】: 如果是推薦商品，就準備一個星號圖標的 HTML。
    const featuredIconHTML = featured ? '<span class="featured-star" title="本日推薦">⭐</span>' : '';

    // 【需求 4】: 根據焙度決定要套用的 CSS class。
    const roastClass = (it.roast || '').toLowerCase().replace('-', ''); // e.g., 'light-medium' -> 'lightmedium'

    const details = document.createElement('details');
    // 如果是推薦商品，也為卡片本身添加 'featured' class 以便提供額外樣式。
    details.className = `card ${featured ? 'featured' : ''}`;

    details.innerHTML = `
      <summary class="flex items-center justify-between p-4 cursor-pointer">
        <div class="flex-1 min-w-0">
          <div class="flex items-baseline justify-between mb-1">
            <h3 class="title font-bold text-base md:text-lg flex-grow min-w-0">
              ${featuredIconHTML}
              ${it.name_zh}
            </h3>
            <div class="roast-badge text-xs font-semibold px-2 py-1 rounded-full ml-4 flex-none ${roastClass}">${roastText}</div>
          </div>
          <p class="meta text-sm text-slate-500">${it.name_en}</p>
          <div class="mt-2 flex flex-wrap gap-1 tag-container">
            ${flavorTags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
        </div>
        <div class="ml-4 flex-none self-center">
          <div class="text-slate-400 text-2xl transition-transform duration-200 chev">▶</div>
        </div>
      </summary>
      <div class="content p-4 pt-0 text-sm">
        <div class="grid gap-2">
          <div class="leading-relaxed"><strong>風味 / Taste:</strong><br>${tasteTextHTML}</div>
        </div>
        </div>`;
    list.appendChild(details);
  }
}

/**
 * 根據篩選條件過濾咖啡豆列表並重新渲染。
 */
function applyFilterAndRender() {
  const q = ($('#searchInput').value || '').trim().toLowerCase();

  // 從所有咖啡豆開始進行過濾
  let filteredItems = ALL_BEANS;

  // 【需求 2】: 在所有其他篩選之前，先過濾掉已售完的商品。
  filteredItems = filteredItems.filter(it => (it.is_sold_out || '').toLowerCase() !== 'true');

  // 根據分類標籤篩選
  if (CURRENT_TAB !== 'all') {
    filteredItems = filteredItems.filter(it => (it.category || '').toLowerCase() === CURRENT_TAB);
  }

  // 根據搜尋關鍵字篩選
  if (q) {
    filteredItems = filteredItems.filter(it => {
      const hay = [
        it.name_zh, it.name_en, it.origin, it.region, it.process, it.roast,
        it.flavor_tags_zh, it.flavor_tags_en, it.taste, ROAST_TRANSLATIONS[it.roast]
      ].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }

  renderList(filteredItems);
}


// --- 狀態管理 ---

/**
 * 設定應用程式的語言。
 * @param {string} lang - 要設定的語言代碼。
 */
function setLanguage(lang) {
  if (SUPPORTED_LANGS.includes(lang)) {
    LANG = lang;
    localStorage.setItem(LANG_KEY, lang);
    i18nUI();
    applyFilterAndRender();
  }
}

/**
 * 將介面上的靜態文本更新為當前語言。
 */
function i18nUI() {
  const dict = UI[LANG] || UI.zh;
  document.documentElement.lang = (LANG === 'zh' ? 'zh-Hant' : LANG);

  $('#title').textContent = dict.title;
  $('p', document.querySelector('header')).innerHTML = dict.subtitle.replace(/\n/g, '<br>');
  $('#searchInput').placeholder = dict.search_placeholder;

  Object.entries(dict.tabs).forEach(([key, text]) => {
    const tabBtn = $(`[data-tab="${key}"]`);
    if (tabBtn) tabBtn.textContent = text;
  });
}

/**
 * 設定當前選中的分類標籤。
 * @param {string} tab - 要設定的標籤 ID。
 */
function setTab(tab) {
  CURRENT_TAB = tab;
  $$('.tab').forEach(btn => {
    btn.setAttribute('aria-selected', String(btn.dataset.tab === tab));
  });
  applyFilterAndRender();
}


// --- 初始化與事件監聽 ---

/**
 * 應用程式初始化函式。
 */
async function init() {
  ALL_BEANS = await loadBeans();

  if (!LANG) {
    $('#langGate').style.display = 'grid';
    $('#app').hidden = true;
  } else {
    $('#langGate').style.display = 'none';
    $('#app').hidden = false;
    i18nUI();
    setTab('all');
  }

  $('#langGate').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-lang]');
    if (btn) {
      setLanguage(btn.dataset.lang);
      $('#langGate').style.display = 'none';
      $('#app').hidden = false;
    }
  });

  $('#langBtn').addEventListener('click', () => {
    $('#langGate').style.display = 'grid';
    $('#app').hidden = true;
  });

  $$('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      setTab(btn.dataset.tab);
    });
  });

  $('#searchInput').addEventListener('input', applyFilterAndRender);
}

/**
 * 當 DOM 內容完全載入後，執行初始化函式。
 */
document.addEventListener('DOMContentLoaded', init);
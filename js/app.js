/*============================================================
File: js/app.js (v4.2 - RWD 卡片佈局優化)
註解版本：v1.1
============================================================*/
"use strict";

// --- 全域常數與變數 ---
// 目的：定義整個應用程式共享的狀態和設定。

const LANG_KEY = "menu_lang"; // 在瀏覽器 localStorage 中儲存語言偏好的鍵名
const SUPPORTED_LANGS = ["zh", "en", "yue", "ko", "ja"]; // 支援的語言列表
let LANG = localStorage.getItem(LANG_KEY); // 當前語言，從 localStorage 讀取
let CURRENT_TAB = "all"; // 當前選中的分類頁籤，預設為 'all'
let ALL_BEANS = []; // 用於儲存從 Google Sheets 載入的所有咖啡豆資料

// --- DOM 操作輔助函式 ---
// 目的：簡化選擇 DOM 元素的語法。

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// --- UI 文本與國際化 (i18n) ---
// 目的：集中管理所有介面上的文字，方便多國語言切換。
// 規則：每個語言代碼 (zh, en...) 對應一個物件，其中包含所有 UI 上會用到的字串。
const UI = {
  zh: {
    title: "本日手沖豆單",
    subtitle:
      "· 莊園級咖啡 $150/杯。\n· 競賽級咖啡 $200/杯。\n· 瑰夏 Geisha $300/杯。\n· 限量版價格請至櫃檯詢問。\n· 若有濃淡度需求請於點餐時告知。",
    search_placeholder: "搜尋：品名、產區、風味、焙度…",
    tabs: {
      all: "全部",
      estate: "莊園級咖啡",
      competition: "競賽級咖啡",
      geisha: "瑰夏 Geisha",
      limited: "限量版",
    },
    badge: { featured: "本日推薦" },
    empty: "沒有符合的品項。",
    gate_title: "選擇語言 / Choose Language",
    gate_note: "此偏好會儲存在本機裝置，可隨時更改。",
    gate_change: "可在頁面右上角再次更改語言",
  },
  en: {
    title: "Pour-Over Menu",
    subtitle:
      "· Estate NT$150.\n· Competition NT$200/cup.\n· Geisha NT$300/cup.\n· For limited editions, please ask at the counter.\n· Please inform us if you have other preferences.",
    search_placeholder: "Search: name, origin, flavors, roast…",
    tabs: {
      all: "All",
      estate: "Estate Coffee",
      competition: "Competition Coffee",
      geisha: "Geisha",
      limited: "Limited Edition",
    },
    badge: { featured: "Recommendation" },
    empty: "No items found.",
    gate_title: "Choose Language",
    gate_note:
      "This preference is saved on your device and can be changed anytime.",
    gate_change: "You can change the language again from the top-right corner",
  },
  yue: {
    title: "手沖豆單",
    subtitle:
      "· 莊園級咖啡 $150/杯。\n· 競賽級咖啡 $200/杯。\n· 瑰夏 Geisha $300/杯。\n· 限量版價格請至櫃檯查詢。\n· 如果對濃度有要求，落單時請話我哋知。",
    search_placeholder: "搜尋：品名、產區、風味、焙度…",
    tabs: {
      all: "全部",
      estate: "莊園級咖啡",
      competition: "競賽級咖啡",
      geisha: "瑰夏 Geisha",
      limited: "限量版",
    },
    badge: { featured: "今日推介" },
    empty: "冇搵到相符嘅品項。",
    gate_title: "選擇語言 / Choose Language",
    gate_note: "呢個偏好會儲存喺你嘅裝置，可以隨時更改。",
    gate_change: "可以喺頁面右上角再次更改語言",
  },
  ko: {
    title: "푸어오버 메뉴",
    subtitle:
      "· 에스테이트 커피 NT$150/한.\n· 대회용 커피 NT$200/한.\n· 게이샤 NT$300/한.\n· 한정판 가격은 카운터에 문의해주세요.\n· 농도 조절이 필요하시면 주문 시 말씀해주세요.",
    search_placeholder: "검색: 이름, 원산지, 풍미, 로스팅 정도…",
    tabs: {
      all: "전체",
      estate: "에스테이트 커피",
      competition: "대회급 커피",
      geisha: "게이샤",
      limited: "한정판",
    },
    badge: { featured: "추천" },
    empty: "해당하는 항목이 없습니다.",
    gate_title: "언어 선택 / Choose Language",
    gate_note: "이 설정은 기기에 저장되며 언제든지 변경할 수 있습니다.",
    gate_change: "페이지 오른쪽 상단에서 언어를 다시 변경할 수 있습니다",
  },
  ja: {
    title: "ハンドドリップメニュー",
    subtitle:
      "· エステート NT$150/はい.\n· コンペティション NT$200/はい.\n· ゲイシャ NT$300/はい.\n· 限定版の価格はカウンターでお尋ねください。\n· 濃さのご要望はご注文時にお知らせください。",
    search_placeholder: "検索：品名、産地、風味、焙煎度…",
    tabs: {
      all: "すべて",
      estate: "エステート",
      competition: "コンペ",
      geisha: "ゲイシャ",
      limited: "限定版",
    },
    badge: { featured: "おすすめ" },
    empty: "該当する品目がありません。",
    gate_title: "言語を選択 / Choose Language",
    gate_note: "この設定はデバイスに保存され、いつでも変更できます。",
    gate_change: "ページの右上隅で再度言語を変更できます",
  },
};

// --- 資料對照表 ---
// 目的：將資料中的英文代碼轉換為使用者易於理解的中文，主要用於搜尋功能。
const ROAST_TRANSLATIONS = {
  Light: "淺",
  "Light-Medium": "淺中",
  Medium: "中",
  "Medium-Dark": "中深",
  Dark: "深",
};

/**
 * @function parseCSV
 * @description 自製的簡易 CSV 解析器，能處理引號和換行。
 * @param {string} text - CSV 格式的純文字。
 * @returns {Array<Array<string>>} - 回傳二維陣列，代表所有資料行。
 */
function parseCSV(text) {
  const rows = [];
  let i = 0,
    field = "",
    row = [],
    inQuotes = false;
  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ",") {
        row.push(field);
        field = "";
      } else if (c === "\n" || c === "\r") {
        if (field !== "" || row.length) {
          row.push(field);
          rows.push(row.map((s) => s.trim()));
          row = [];
          field = "";
        }
      } else {
        field += c;
      }
    }
    i++;
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row.map((s) => s.trim()));
  }
  return rows.filter((r) => r.length && !r[0].startsWith("#"));
}

/**
 * @function loadBeans
 * @description 從 Google Sheets 異步載入並解析咖啡豆資料。
 * @returns {Promise<Array<Object>>} - 解析完成的咖啡豆物件陣列。
 */
async function loadBeans() {
  // 規則：此 URL 是您發佈到網路的 Google Sheets CSV 連結，是整個菜單的資料來源核心。
  const GOOGLE_SHEET_CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vR6Zx5IKqnxZH3cyWCusoxwvAejqgVPZqnUVyo-4Xhs-kdOkFKoh0V9W5qi-12hB9BRMvOHzVlLzDNC/pub?gid=1947339755&single=true&output=csv";
  try {
    // 規則：使用 { cache: 'no-store' } 確保每次都抓取最新資料，避免瀏覽器快取。
    const res = await fetch(GOOGLE_SHEET_CSV_URL, { cache: "no-store" });
    const txt = await res.text();
    const rows = parseCSV(txt);
    const header = rows.shift(); // 取出第一行作為標頭
    return rows.map((r) =>
      Object.fromEntries(header.map((h, i) => [h, r[i] || ""]))
    );
  } catch (err) {
    console.error("Failed to load or parse Google Sheet CSV:", err);
    return [];
  }
}

/**
 * @function pickLang
 * @description 根據當前語言設定，從資料物件中選擇對應的欄位，並具備回退機制。
 * @param {Object} obj - 單一咖啡豆資料物件。
 * @param {string} base - 欄位的基礎名稱 (如 'flavor_tags')。
 * @returns {string} - 回傳最適合的語言字串。
 */
function pickLang(obj, base) {
  const prefer = `${base}_${LANG}`;
  const fallbacks = [prefer, `${base}_en`, `${base}_zh`];
  for (const k of fallbacks) {
    if (obj[k] && obj[k].trim()) return obj[k].trim();
  }
  return "";
}

/**
 * @function renderList
 * @description 將咖啡豆項目陣列渲染成 HTML 並顯示在頁面上。
 * @param {Array<Object>} items - 要顯示的咖啡豆物件陣列。
 */
function renderList(items) {
  const dict = UI[LANG] || UI.zh;
  const list = $("#list");
  list.innerHTML = ""; // 先清空列表
  if (!items.length) {
    list.innerHTML = `<p class="text-sm text-slate-500 text-center">${dict.empty}</p>`;
    return;
  }

  // --- 區塊：迴圈生成卡片 ---
  for (const it of items) {
    // --- 子區塊：資料準備 ---
    const featured = (it.is_featured || "").toLowerCase() === "true";
    const flavorTags = pickLang(it, "flavor_tags")
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean);
    const roastZh = ROAST_TRANSLATIONS[it.roast] || it.roast;
    const roastText = `${roastZh}焙 ${it.roast}`;
    const tasteTextHTML = (it.taste || "").replace(/\\n|\n/g, "<br>");
    const featuredIconHTML = featured
      ? '<span class="featured-star" title="本日推薦">⭐</span>'
      : "";
    const roastClass = (it.roast || "").toLowerCase().replace("-", "");

    const priceOverlayHTML = it.price
      ? `<div class="price-overlay">$${it.price}</div>`
      : "";

    // START: 新增的互動邏輯
    // 如果品項沒有價格，就賦予 'no-price' class，稍後用 CSS 來禁用互動
    const cardInteractionClass = it.price ? "" : "no-price";
    // END: 新增的互動邏輯

    const details = document.createElement("details");
    // 將互動 class 加入到 details 元素上
    details.className = `card ${
      featured ? "featured" : ""
    } ${cardInteractionClass}`;

    // --- 子區塊：卡片 HTML 結構 ---
    details.innerHTML = `
      <summary class="flex items-center justify-between p-4 cursor-pointer">
        <div class="flex-1 min-w-0">

          <div class="card-header">
            <div class="info-group">
              <h3 class="title">
                ${featuredIconHTML}
                ${it.name_zh}
              </h3>
              <p class="meta">${it.name_en}</p>
            </div>
            <div class="roast-badge ${roastClass}">${roastText}</div>
          </div>

          <div class="mt-2 flex flex-wrap gap-1 tag-container">
            ${flavorTags
              .map((tag) => `<span class="tag">${tag}</span>`)
              .join("")}
          </div>
        </div>
        <div class="ml-4 flex-none self-center">
          <div class="text-slate-400 text-2xl transition-transform duration-200 chev">▶</div>
        </div>

        ${priceOverlayHTML}

      </summary>
      <div class="content p-4 pt-0 text-sm">
        <div class="grid gap-3">
          <div class="leading-relaxed"><strong>風味 / Taste:</strong><br>${tasteTextHTML}</div>
          <div class="border-t border-slate-200 pt-3 grid grid-cols-2 gap-2 text-xs">
            <div><strong class="text-slate-600 block">產區 / Origin</strong><span>${
              it.origin || "N/A"
            }</span></div>
            <div><strong class="text-slate-600 block">品種 / Variety</strong><span>${
              it.variety || "N/A"
            }</span></div>
            <div><strong class="text-slate-600 block">海拔 / Altitude</strong><span>${
              it.altitude || "N/A"
            }</span></div>
          </div>
        </div>
      </div>`;
    list.appendChild(details);
  }
}

/**
 * @function applyFilterAndRender
 * @description 套用目前的篩選條件（分類頁籤、搜尋關鍵字）並重新渲染列表。
 */
function applyFilterAndRender() {
  const q = ($("#searchInput").value || "").trim().toLowerCase();
  let filteredItems = ALL_BEANS;

  // 規則 1：過濾掉所有 "is_sold_out" 為 "true" 的品項。
  filteredItems = filteredItems.filter(
    (it) => (it.is_sold_out || "").toLowerCase() !== "true"
  );

  // 規則 2：如果當前頁籤不是 "all"，則只顯示該分類的品項。
  if (CURRENT_TAB !== "all") {
    filteredItems = filteredItems.filter(
      (it) => (it.category || "").toLowerCase() === CURRENT_TAB
    );
  }

  // 規則 3：如果搜尋框有內容，則根據關鍵字進行模糊搜尋。
  if (q) {
    filteredItems = filteredItems.filter((it) => {
      const hay = [
        it.name_zh,
        it.name_en,
        it.origin,
        it.region,
        it.price, // <-- 修改：將 it.process 改為 it.price
        it.roast,
        it.flavor_tags_zh,
        it.flavor_tags_en,
        it.taste,
        ROAST_TRANSLATIONS[it.roast],
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }

  renderList(filteredItems);
}

/**
 * @function setLanguage
 * @description 設定、儲存並套用新的語言。
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
 * @function i18nUI
 * @description 將頁面上的靜態 UI 元素（標題、按鈕文字等）更新為當前語言。
 */
function i18nUI() {
  const dict = UI[LANG] || UI.zh;
  document.documentElement.lang = LANG === "zh" ? "zh-Hant" : LANG;
  $("#title").textContent = dict.title;
  $("p", document.querySelector("header")).innerHTML = dict.subtitle.replace(
    /\n/g,
    "<br>"
  );
  $("#searchInput").placeholder = dict.search_placeholder;
  Object.entries(dict.tabs).forEach(([key, text]) => {
    const tabBtn = $(`[data-tab="${key}"]`);
    if (tabBtn) tabBtn.textContent = text;
  });
}

/**
 * @function setTab
 * @description 設定當前選中的分類頁籤，並觸發重新渲染。
 */
function setTab(tab) {
  CURRENT_TAB = tab;
  $$(".tab").forEach((btn) => {
    btn.setAttribute("aria-selected", String(btn.dataset.tab === tab));
  });
  applyFilterAndRender();
}

/**
 * @function init
 * @description 應用程式初始化函式，在頁面載入完成後執行。
 */
async function init() {
  ALL_BEANS = await loadBeans(); // 1. 載入資料

  // 2. 判斷是否需要顯示語言選擇畫面
  if (!LANG) {
    $("#langGate").style.display = "grid";
    $("#app").hidden = true;
  } else {
    $("#langGate").style.display = "none";
    $("#app").hidden = false;
    i18nUI();
    setTab("all");
  }

  // 3. 綁定所有事件監聽器（語言按鈕、頁籤、搜尋框）
  $("#langGate").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-lang]");
    if (btn) {
      setLanguage(btn.dataset.lang);
      $("#langGate").style.display = "none";
      $("#app").hidden = false;
    }
  });
  $("#langBtn").addEventListener("click", () => {
    $("#langGate").style.display = "grid";
    $("#app").hidden = true;
  });
  $$(".tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      setTab(btn.dataset.tab);
    });
  });
  $("#searchInput").addEventListener("input", applyFilterAndRender);
}

// --- 程式進入點 ---
document.addEventListener("DOMContentLoaded", init);

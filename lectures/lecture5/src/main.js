/**
 * IdeaVenn — Main Application Logic
 * アイデア管理 & Gemini AI ベン図化ツール
 */

import './style.css';

// ============================================================
// 状態管理 (State)
// ============================================================

const STORAGE_KEYS = {
  IDEAS: 'ideavenn_ideas',
  API_KEY: 'ideavenn_api_key',
};

let ideas = loadIdeas();
let draggedId = null;

// ブレストタイマーの状態
let timerInterval = null;
let timerRemaining = 0;
let timerDuration = 0;
let timerAddedCount = 0;

// ============================================================
// DOM 要素の取得
// ============================================================

const $ = (id) => document.getElementById(id);

const inputIdeaEl = $('input-idea');
const btnAddEl = $('btn-add-idea');
const btnApiKeyEl = $('btn-api-key');
const apiStatusEl = $('api-status');
const modalApiEl = $('modal-api');
const modalBackdropEl = $('modal-backdrop');
const modalCloseEl = $('modal-close');
const inputApiKeyEl = $('input-api-key');
const btnToggleVisEl = $('btn-toggle-key-visibility');
const btnSaveKeyEl = $('btn-save-key');
const btnClearKeyEl = $('btn-clear-key');
const btnVennEl = $('btn-venn');
const vennLoadingEl = $('venn-loading');
const vennErrorEl = $('venn-error');
const vennErrorMsgEl = $('venn-error-msg');
const vennResultEl = $('venn-result');
const vennResultSubtitleEl = $('venn-result-subtitle');
const vennSvgEl = $('venn-svg');
const vennDetailsEl = $('venn-details');

// 追加機能用の DOM
const timerContainerEl = $('timer-container');
const timerDisplayEl = $('timer-display');
const selectTimerDurationEl = $('select-timer-duration');
const btnTimerControlEl = $('btn-timer-control');
const timerProgressContainerEl = $('timer-progress-container');
const timerProgressBarEl = $('timer-progress-bar');
const ideaInputAreaWrapperEl = $('idea-input-area-wrapper');
const recommendedToolsContainerEl = $('recommended-tools-container');
const toolsGridEl = $('tools-grid');

// ============================================================
// アイデアの永続化ユーティリティ
// ============================================================

function loadIdeas() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.IDEAS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveIdeas() {
  localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(ideas));
}

function loadApiKey() {
  return localStorage.getItem(STORAGE_KEYS.API_KEY) || '';
}

function saveApiKey(key) {
  if (key) {
    localStorage.setItem(STORAGE_KEYS.API_KEY, key);
  } else {
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
  }
}

// ============================================================
// アイデアの CRUD
// ============================================================

function createIdea(text) {
  return {
    id: `idea-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    text: text.trim(),
    status: 'pending',   // adopted | pending | rejected
    createdAt: Date.now(),
  };
}

function addIdea(text) {
  if (!text.trim()) return;
  const idea = createIdea(text);
  ideas.unshift(idea);
  saveIdeas();
  renderAll();
  
  if (timerInterval) {
    timerAddedCount++;
  }
}

function deleteIdea(id) {
  ideas = ideas.filter((i) => i.id !== id);
  saveIdeas();
  renderAll();
}

function moveIdea(id, newStatus) {
  const idea = ideas.find((i) => i.id === id);
  if (!idea) return;
  idea.status = newStatus;
  saveIdeas();
  renderAll();
}

// ============================================================
// レンダリング
// ============================================================

const STATUSES = ['adopted', 'pending', 'rejected'];

const STATUS_LABELS = {
  adopted: '採用',
  pending: '検討中',
  rejected: '不採用',
};

const MOVE_TARGETS = {
  adopted: ['pending', 'rejected'],
  pending: ['adopted', 'rejected'],
  rejected: ['adopted', 'pending'],
};

function renderAll() {
  STATUSES.forEach((status) => {
    const container = $(`cards-${status}`);
    const countEl = $(`count-${status}`);
    const emptyEl = $(`empty-${status}`);
    const filtered = ideas.filter((i) => i.status === status);

    countEl.textContent = filtered.length;

    // 既存のカードを全削除（empty を除く）
    Array.from(container.children).forEach((child) => {
      if (!child.classList.contains('lane-empty')) container.removeChild(child);
    });

    if (filtered.length === 0) {
      emptyEl.style.display = '';
    } else {
      emptyEl.style.display = 'none';
      filtered.forEach((idea) => {
        container.appendChild(createCardEl(idea));
      });
    }
  });
}

function createCardEl(idea) {
  const targets = MOVE_TARGETS[idea.status];
  const moveBtnsHtml = targets
    .map(
      (t) =>
        `<button class="btn-move" data-id="${idea.id}" data-status="${t}">→ ${STATUS_LABELS[t]}</button>`
    )
    .join('');

  const div = document.createElement('div');
  div.className = 'idea-card';
  div.setAttribute('draggable', 'true');
  div.dataset.id = idea.id;
  div.innerHTML = `
    <div class="idea-card-body">${escapeHtml(idea.text)}</div>
    <div class="idea-card-footer">
      <div class="idea-card-move">${moveBtnsHtml}</div>
      <button class="btn-delete" data-id="${idea.id}" title="削除">削除</button>
    </div>
  `;

  // ドラッグイベント
  div.addEventListener('dragstart', (e) => {
    draggedId = idea.id;
    setTimeout(() => div.classList.add('dragging'), 0);
    e.dataTransfer.effectAllowed = 'move';
  });
  div.addEventListener('dragend', () => {
    draggedId = null;
    div.classList.remove('dragging');
  });

  // 移動ボタン
  div.querySelectorAll('.btn-move').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      moveIdea(btn.dataset.id, btn.dataset.status);
    });
  });

  // 削除ボタン
  div.querySelector('.btn-delete').addEventListener('click', (e) => {
    e.stopPropagation();
    if (confirm('このアイデアを削除しますか？')) deleteIdea(idea.id);
  });

  return div;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\n/g, '<br>');
}

// ============================================================
// ドラッグ & ドロップ (レーン)
// ============================================================

STATUSES.forEach((status) => {
  const body = $(`cards-${status}`);

  body.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    body.closest('.lane').classList.add('drag-over');
  });
  body.addEventListener('dragleave', () => {
    body.closest('.lane').classList.remove('drag-over');
  });
  body.addEventListener('drop', (e) => {
    e.preventDefault();
    body.closest('.lane').classList.remove('drag-over');
    if (draggedId) moveIdea(draggedId, status);
  });
});

// ============================================================
// アイデア追加イベント
// ============================================================

btnAddEl.addEventListener('click', () => {
  addIdea(inputIdeaEl.value);
  inputIdeaEl.value = '';
  inputIdeaEl.focus();
});

inputIdeaEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    addIdea(inputIdeaEl.value);
    inputIdeaEl.value = '';
  }
});

// ============================================================
// API キー モーダル
// ============================================================

function updateApiStatus() {
  const key = loadApiKey();
  if (key) {
    apiStatusEl.textContent = 'APIキー設定済み';
    apiStatusEl.className = 'api-status api-status--set';
  } else {
    apiStatusEl.textContent = 'APIキー未設定（デモモード）';
    apiStatusEl.className = 'api-status api-status--none';
  }
}

function openModal() {
  modalApiEl.classList.remove('hidden');
  inputApiKeyEl.value = loadApiKey();
}

function closeModal() {
  modalApiEl.classList.add('hidden');
}

btnApiKeyEl.addEventListener('click', openModal);
modalCloseEl.addEventListener('click', closeModal);
modalBackdropEl.addEventListener('click', closeModal);

btnToggleVisEl.addEventListener('click', () => {
  inputApiKeyEl.type = inputApiKeyEl.type === 'password' ? 'text' : 'password';
});

btnSaveKeyEl.addEventListener('click', () => {
  saveApiKey(inputApiKeyEl.value.trim());
  updateApiStatus();
  closeModal();
});

btnClearKeyEl.addEventListener('click', () => {
  saveApiKey('');
  inputApiKeyEl.value = '';
  updateApiStatus();
  closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// ============================================================
// Gemini API 呼び出し
// ============================================================

async function callGemini(prompt, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.5,
      },
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${res.status}`);
  }
  const data = await res.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new Error('APIから応答を取得できませんでした');
  return JSON.parse(raw);
}

// ============================================================
// デモ用モックデータ生成
// ============================================================

function generateMockVennData(adoptedIdeas, pendingIdeas) {
  return {
    adoptedOnly: [
      'AI壁打ちでの思考整理',
      '採用候補の優先度付け',
    ],
    common: [
      'アイデアの言語化',
      '比較・分類の視点',
      'ツール活用による効率化',
    ],
    pendingOnly: [
      'さらなるアイデアの発散',
      '未検討の可能性の探索',
    ],
    summary: `「採用」と「検討中」両群に共通するテーマは「アイデアの構造化と比較」です（デモモード）`,
    recommendedTools: [
      {
        name: 'Vite + React',
        category: 'frontend',
        reason: '高速なフロントエンド構築とSPA開発に適しており、今回のアイデアのUI部分を素早く形にできます。'
      },
      {
        name: 'Supabase',
        category: 'database',
        reason: 'Firebaseに代わる使いやすいOSSのBaaSで、アイデアデータの永続化や認証機能を簡単に実装できます。'
      },
      {
        name: 'Glide',
        category: 'nocode',
        reason: 'スプレッドシートからPWAアプリを即座に自動生成できるため、プロトタイプを爆速で検証するのに最適です。'
      }
    ]
  };
}

// ============================================================
// ベン図化ボタン
// ============================================================

btnVennEl.addEventListener('click', async () => {
  const adoptedIdeas = ideas.filter((i) => i.status === 'adopted');
  const pendingIdeas = ideas.filter((i) => i.status === 'pending');

  if (adoptedIdeas.length === 0 && pendingIdeas.length === 0) {
    showVennError('「採用」または「検討中」にアイデアがありません。まずアイデアを追加してください。');
    return;
  }

  showVennLoading();
  btnVennEl.disabled = true;

  try {
    let vennData;
    const apiKey = loadApiKey();

    if (apiKey) {
      const prompt = buildVennPrompt(adoptedIdeas, pendingIdeas);
      vennData = await callGemini(prompt, apiKey);
    } else {
      // デモモード: モックデータ
      await new Promise((r) => setTimeout(r, 1500)); // 疑似待機
      vennData = generateMockVennData(adoptedIdeas, pendingIdeas);
    }

    renderVennDiagram(vennData, adoptedIdeas.length, pendingIdeas.length);
  } catch (err) {
    showVennError(`分析に失敗しました: ${err.message}`);
  } finally {
    btnVennEl.disabled = false;
  }
});

function buildVennPrompt(adoptedIdeas, pendingIdeas) {
  const adoptedList = adoptedIdeas.map((i, n) => `${n + 1}. ${i.text}`).join('\n');
  const pendingList = pendingIdeas.map((i, n) => `${n + 1}. ${i.text}`).join('\n');

  return `
あなたはアイデア分析の専門家です。以下の2グループのアイデアを分析し、ベン図の3領域（採用のみ・共通・検討中のみ）に分類してください。
また、特に「採用アイデア」および「共通要素」を実現するのに適した、具体的な開発ツールや技術スタック（Webサービス、フレームワーク、ライブラリ、データベース、ノーコードツールなど）を3つ推薦してください。

## 採用アイデア
${adoptedList || '（なし）'}

## 検討中アイデア
${pendingList || '（なし）'}

## 指示
1. 各アイデアを大まかなテーマ・キーワードに要約して分類してください。
   - 共通する要素は「common」（2〜4個）に入れてください。
   - それぞれ固有の要素は「adoptedOnly」「pendingOnly」に入れてください（各2〜4個）。
   - 日本語で、短い名詞句で書いてください（15文字いない推奨）。
2. summaryには全体の分析コメントを1〜2文で書いてください。
3. 採用アイデアおよび共通要素を実現するのにおすすめの実現ツールや技術スタック（具体名、例えば Firebase, React, LINE Bot API, Glide, Notion など）を3個、カテゴリと具体的な推薦理由を含めて提案してください。
   - categoryは "frontend", "backend", "database", "nocode", "other" のいずれか一つを指定してください。
   - reason（推薦理由）は簡潔に日本語で書いてください。

## 出力形式（必ずこの JSON のみ返す）
{
  "adoptedOnly": ["キーワード1", "キーワード2"],
  "common": ["共通キーワード1", "共通キーワード2", "共通キーワード3"],
  "pendingOnly": ["キーワードA", "キーワードB"],
  "summary": "全体のコメント",
  "recommendedTools": [
    {
      "name": "ツール名",
      "category": "frontend | backend | database | nocode | other",
      "reason": "推薦理由"
    }
  ]
}
`.trim();
}

// ============================================================
// UI 状態の切り替え
// ============================================================

function showVennLoading() {
  vennLoadingEl.classList.remove('hidden');
  vennErrorEl.classList.add('hidden');
  vennResultEl.classList.add('hidden');
}

function showVennError(msg) {
  vennLoadingEl.classList.add('hidden');
  vennResultEl.classList.add('hidden');
  vennErrorEl.classList.remove('hidden');
  vennErrorMsgEl.textContent = msg;
}

function hideVennLoading() {
  vennLoadingEl.classList.add('hidden');
}

// ============================================================
// SVG ベン図のレンダリング
// ============================================================

function renderVennDiagram(data, adoptedCount, pendingCount) {
  hideVennLoading();
  vennErrorEl.classList.add('hidden');
  vennResultEl.classList.remove('hidden');

  const apiKey = loadApiKey();
  const modeLabel = apiKey ? 'Gemini AIが分析' : 'デモモード';
  vennResultSubtitleEl.textContent = `採用 ${adoptedCount}件 × 検討中 ${pendingCount}件 — ${modeLabel}`;

  // SVG描画
  drawVennSvg(data);

  // テキスト詳細
  renderVennDetails(data);

  // 推奨ツールの描画
  renderRecommendedTools(data.recommendedTools);
}

function drawVennSvg(data) {
  const adoptedItems = data.adoptedOnly || [];
  const commonItems = data.common || [];
  const pendingItems = data.pendingOnly || [];

  // SVG クリア（defs は残す）
  const defs = vennSvgEl.querySelector('defs');
  while (vennSvgEl.firstChild) vennSvgEl.removeChild(vennSvgEl.firstChild);
  if (defs) vennSvgEl.appendChild(defs);

  const W = 800, H = 420;
  const cx1 = 290, cx2 = 510, cy = 210, r = 180;

  const ns = 'http://www.w3.org/2000/svg';

  const makeSvgEl = (tag, attrs = {}) => {
    const el = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  };

  // 背景グロー
  const glow1 = makeSvgEl('circle', { cx: cx1, cy, r: r + 20, fill: 'url(#grad-adopted)', filter: 'url(#glow-blur)' });
  const glow2 = makeSvgEl('circle', { cx: cx2, cy, r: r + 20, fill: 'url(#grad-pending)', filter: 'url(#glow-blur)' });
  vennSvgEl.appendChild(glow1);
  vennSvgEl.appendChild(glow2);

  // 円 1（採用）
  const circle1 = makeSvgEl('circle', {
    cx: cx1, cy, r,
    fill: 'url(#grad-adopted)',
    stroke: 'rgba(129,140,248,0.7)',
    'stroke-width': '2',
  });
  vennSvgEl.appendChild(circle1);

  // 円 2（検討中）
  const circle2 = makeSvgEl('circle', {
    cx: cx2, cy, r,
    fill: 'url(#grad-pending)',
    stroke: 'rgba(52,211,153,0.7)',
    'stroke-width': '2',
  });
  vennSvgEl.appendChild(circle2);

  // ラベル
  const addLabel = (x, y, text, color, size = 14, weight = '700') => {
    const t = makeSvgEl('text', {
      x, y,
      'text-anchor': 'middle',
      'dominant-baseline': 'middle',
      fill: color,
      'font-size': size,
      'font-weight': weight,
      'font-family': 'Outfit, Inter, sans-serif',
    });
    t.textContent = text;
    vennSvgEl.appendChild(t);
  };

  // 円ラベル
  addLabel(cx1 - 70, cy - r + 30, '採用', '#818cf8', 16, '800');
  addLabel(cx2 + 70, cy - r + 30, '検討中', '#34d399', 16, '800');
  addLabel((cx1 + cx2) / 2, cy - r + 18, '共通', '#c084fc', 14, '700');

  // テキストをSVGに配置するユーティリティ
  const addItems = (items, cx, cy, color) => {
    const lineH = 26;
    const startY = cy - ((items.length - 1) * lineH) / 2;
    items.forEach((item, i) => {
      const truncated = item.length > 14 ? item.slice(0, 13) + '…' : item;
      const bg = makeSvgEl('rect', {
        x: cx - 70,
        y: startY + i * lineH - 11,
        width: 140,
        height: 22,
        rx: 11,
        fill: `${color}22`,
        stroke: `${color}55`,
        'stroke-width': 1,
      });
      vennSvgEl.appendChild(bg);
      addLabel(cx, startY + i * lineH + 0, truncated, color, 12, '500');
    });
  };

  // 採用のみ（左）
  addItems(adoptedItems, cx1 - 80, cy + 10, '#818cf8');

  // 共通（中央）
  const midX = (cx1 + cx2) / 2;
  addItems(commonItems, midX, cy + 20, '#c084fc');

  // 検討中のみ（右）
  addItems(pendingItems, cx2 + 80, cy + 10, '#34d399');

  // アニメーション
  [circle1, circle2].forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transition = `opacity 0.6s ease ${i * 0.2}s`;
    requestAnimationFrame(() => { el.style.opacity = '1'; });
  });
}

function renderVennDetails(data) {
  vennDetailsEl.innerHTML = `
    <div class="venn-detail-col">
      <div class="venn-detail-title venn-detail-title--adopted">✅ 採用のみ</div>
      <ul class="venn-detail-list">
        ${(data.adoptedOnly || []).map((t) => `<li>${escapeHtml(t)}</li>`).join('')}
      </ul>
    </div>
    <div class="venn-detail-col">
      <div class="venn-detail-title venn-detail-title--common">🔵 共通</div>
      <ul class="venn-detail-list">
        ${(data.common || []).map((t) => `<li>${escapeHtml(t)}</li>`).join('')}
      </ul>
      ${data.summary ? `<p style="margin-top:12px;font-size:12px;color:var(--text-secondary);line-height:1.6;">${escapeHtml(data.summary)}</p>` : ''}
    </div>
    <div class="venn-detail-col">
      <div class="venn-detail-title venn-detail-title--pending">🔄 検討中のみ</div>
      <ul class="venn-detail-list">
        ${(data.pendingOnly || []).map((t) => `<li>${escapeHtml(t)}</li>`).join('')}
      </ul>
    </div>
  `;
}

// ============================================================
// AI推奨ツールのレンダリング
// ============================================================

function renderRecommendedTools(tools) {
  toolsGridEl.innerHTML = '';
  
  if (!tools || tools.length === 0) {
    recommendedToolsContainerEl.classList.add('hidden');
    return;
  }
  
  recommendedToolsContainerEl.classList.remove('hidden');
  
  tools.forEach(tool => {
    const card = document.createElement('div');
    card.className = 'tool-card';
    
    // カテゴリの日本語化とクラス名のマッピング
    const categoryClass = `tool-category--${tool.category || 'other'}`;
    const categoryLabels = {
      frontend: 'フロントエンド',
      backend: 'バックエンド',
      database: 'データベース',
      nocode: 'ノーコード',
      other: 'その他'
    };
    const categoryLabel = categoryLabels[tool.category] || tool.category || 'その他';
    
    card.innerHTML = `
      <div class="tool-card-header">
        <span class="tool-name">${escapeHtml(tool.name)}</span>
        <span class="tool-category ${categoryClass}">${escapeHtml(categoryLabel)}</span>
      </div>
      <p class="tool-reason">${escapeHtml(tool.reason)}</p>
    `;
    
    toolsGridEl.appendChild(card);
  });
}

// ============================================================
// ブレストタイマーのロジック
// ============================================================

function updateTimerUI() {
  if (timerInterval) {
    const minutes = Math.floor(timerRemaining / 60);
    const seconds = timerRemaining % 60;
    timerDisplayEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    // プログレスバーの更新
    const progress = (timerRemaining / timerDuration) * 100;
    timerProgressBarEl.style.transform = `scaleX(${progress / 100})`;
  } else {
    timerDisplayEl.textContent = '未作動';
    timerProgressContainerEl.classList.add('hidden');
  }
}

function startTimer() {
  if (timerInterval) return;
  
  const duration = parseInt(selectTimerDurationEl.value, 10);
  timerDuration = duration;
  timerRemaining = duration;
  timerAddedCount = 0;
  
  timerContainerEl.classList.add('active');
  timerProgressContainerEl.classList.remove('hidden');
  timerProgressBarEl.style.transform = 'scaleX(1)';
  
  // 入力エリアを強調
  ideaInputAreaWrapperEl.classList.add('timer-active');
  inputIdeaEl.placeholder = '思いつくものをどんどん入力して Enter！ (制限時間内はフォーカスが維持されます)';
  inputIdeaEl.focus();
  
  btnTimerControlEl.textContent = 'ストップ';
  selectTimerDurationEl.disabled = true;
  
  updateTimerUI();
  
  timerInterval = setInterval(tick, 1000);
}

function stopTimer() {
  if (!timerInterval) return;
  
  clearInterval(timerInterval);
  timerInterval = null;
  
  timerContainerEl.classList.remove('active');
  ideaInputAreaWrapperEl.classList.remove('timer-active');
  inputIdeaEl.placeholder = 'アイデアを入力して Enter… (Shift+Enter で改行)';
  
  btnTimerControlEl.textContent = 'スタート';
  selectTimerDurationEl.disabled = false;
  
  updateTimerUI();
  
  alert(`制限時間が終了しました！\nこのタイマー中に ${timerAddedCount} 個のアイデアが出ました！🎉`);
}

function tick() {
  timerRemaining--;
  updateTimerUI();
  
  if (timerRemaining <= 0) {
    stopTimer();
  }
}

// ============================================================
// 初期化
// ============================================================

function init() {
  updateApiStatus();
  renderAll();
  
  // タイマーイベントの初期化
  btnTimerControlEl.addEventListener('click', () => {
    if (timerInterval) {
      stopTimer();
    } else {
      startTimer();
    }
  });
  
  // タイマー動作中にフォーカスが外れた場合、自動で戻す（入力しやすくするためのUX）
  inputIdeaEl.addEventListener('blur', () => {
    if (timerInterval) {
      // わずかな遅延を入れないと他のボタン操作が効かなくなるため setTimeout を使用
      setTimeout(() => {
        if (timerInterval) inputIdeaEl.focus();
      }, 100);
    }
  });
}

init();

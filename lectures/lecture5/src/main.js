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

## 採用アイデア
${adoptedList || '（なし）'}

## 検討中アイデア
${pendingList || '（なし）'}

## 指示
- 各アイデアを大まかなテーマ・キーワードに要約して分類してください
- 共通する要素は「common」（2〜4個）に入れてください
- それぞれ固有の要素は「adoptedOnly」「pendingOnly」に入れてください（各2〜4個）
- 日本語で、短い名詞句で書いてください（15文字以内推奨）
- summaryには全体の分析コメントを1〜2文で書いてください

## 出力形式（必ずこの JSON のみ返す）
{
  "adoptedOnly": ["キーワード1", "キーワード2"],
  "common": ["共通キーワード1", "共通キーワード2", "共通キーワード3"],
  "pendingOnly": ["キーワードA", "キーワードB"],
  "summary": "全体のコメント"
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
// 初期化
// ============================================================

function init() {
  updateApiStatus();
  renderAll();
}

init();

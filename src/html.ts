export function getHTML(): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>英文长难句拆解</title>
<script src="https://cdn.tailwindcss.com"></script>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  * { font-family: 'Inter', system-ui, -apple-system, sans-serif; }

  :root {
    --bg: #0f172a;
    --card: #1e293b;
    --card-hover: #263548;
    --border: #334155;
    --text: #e2e8f0;
    --text-dim: #94a3b8;
    --text-muted: #64748b;
    --accent: #3b82f6;
    --accent-glow: rgba(59, 130, 246, 0.15);
    --green: #22c55e;
    --amber: #f59e0b;
    --purple: #a855f7;
    --pink: #ec4899;
    --red: #ef4444;
  }

  body { background: var(--bg); color: var(--text); min-height: 100vh; }

  .fade-in { animation: fadeIn 0.5s ease-out both; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

  .stagger-1 { animation-delay: 0.05s; }
  .stagger-2 { animation-delay: 0.1s; }
  .stagger-3 { animation-delay: 0.15s; }
  .stagger-4 { animation-delay: 0.2s; }
  .stagger-5 { animation-delay: 0.25s; }
  .stagger-6 { animation-delay: 0.3s; }

  .stream-cursor::after {
    content: '';
    display: inline-block;
    width: 2px; height: 1em;
    background: var(--accent);
    margin-left: 2px;
    vertical-align: text-bottom;
    animation: blink 0.8s infinite;
  }
  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

  .card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 20px;
  }

  .card-glow {
    box-shadow: 0 0 0 1px var(--border), 0 4px 24px rgba(0,0,0,0.2);
  }

  .hl-subject { background: rgba(34,197,94,0.15); color: #86efac; border-radius: 6px; padding: 2px 8px; font-weight: 600; }
  .hl-predicate { background: rgba(59,130,246,0.15); color: #93c5fd; border-radius: 6px; padding: 2px 8px; font-weight: 600; }
  .hl-object { background: rgba(245,158,11,0.15); color: #fcd34d; border-radius: 6px; padding: 2px 8px; font-weight: 600; }
  .hl-complement { background: rgba(168,85,247,0.15); color: #c4b5fd; border-radius: 6px; padding: 2px 8px; font-weight: 600; }
  .hl-clause { background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.2); border-radius: 8px; padding: 8px 12px; color: #fde68a; font-size: 13px; line-height: 1.6; }
  .hl-modifier { background: rgba(168,85,247,0.08); border: 1px solid rgba(168,85,247,0.2); border-radius: 8px; padding: 8px 12px; color: #c4b5fd; font-size: 13px; line-height: 1.6; }

  .tag {
    display: inline-flex; align-items: center;
    padding: 3px 10px; border-radius: 8px;
    font-size: 11px; font-weight: 600; letter-spacing: 0.03em;
  }
  .tag-blue { background: rgba(59,130,246,0.15); color: #93c5fd; }
  .tag-amber { background: rgba(245,158,11,0.15); color: #fcd34d; }
  .tag-purple { background: rgba(168,85,247,0.15); color: #c4b5fd; }
  .tag-pink { background: rgba(236,72,153,0.15); color: #f9a8d4; }
  .tag-green { background: rgba(34,197,94,0.15); color: #86efac; }
  .tag-red { background: rgba(239,68,68,0.15); color: #fca5a5; }
  .tag-teal { background: rgba(20,184,166,0.15); color: #5eead4; }
  .tag-gray { background: rgba(148,163,184,0.1); color: #94a3b8; }

  .clause-tree {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .clause-node {
    position: relative;
    margin-top: 12px;
  }

  .clause-node-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 2px 0;
    margin-bottom: 6px;
  }

  .clause-connector {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }

  .clause-connector-line {
    width: 20px;
    height: 2px;
    border-radius: 1px;
  }

  .clause-connector-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .clause-body {
    position: relative;
    border-radius: 14px;
    padding: 16px 18px;
    overflow: hidden;
    transition: all 0.2s;
  }

  .clause-body:hover {
    filter: brightness(1.08);
  }

  .clause-body::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 4px;
    border-radius: 14px 0 0 14px;
  }

  .clause-children {
    padding-left: 24px;
    position: relative;
    margin-top: 4px;
  }

  .clause-children::before {
    content: '';
    position: absolute;
    left: 14px; top: 0; bottom: 12px;
    width: 2px;
    border-radius: 1px;
    opacity: 0.3;
  }

  .clause-children > .clause-node::after {
    content: '';
    position: absolute;
    left: -10px; top: 22px;
    width: 14px;
    height: 2px;
    border-radius: 1px;
    opacity: 0.3;
  }

  .clause-depth-indicator {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 2px 8px;
    border-radius: 6px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
  }

  .clause-structure-box {
    border-radius: 10px;
    padding: 10px 14px;
    margin-top: 10px;
    backdrop-filter: blur(4px);
  }

  .compare-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  .compare-panel {
    border-radius: 14px;
    padding: 20px;
    position: relative;
    overflow: hidden;
  }
  .compare-panel::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 4px;
    border-radius: 14px 0 0 14px;
  }
  .compare-original {
    background: rgba(239,68,68,0.04);
    border: 1px solid rgba(239,68,68,0.12);
  }
  .compare-original::before { background: #ef4444; }
  .compare-clean {
    background: rgba(34,197,94,0.04);
    border: 1px solid rgba(34,197,94,0.12);
  }
  .compare-clean::before { background: #22c55e; }

  .seg-main { color: #86efac; font-weight: 600; }
  .seg-mod { color: var(--text-muted); text-decoration: line-through; opacity: 0.45; }
  .seg-punct { color: var(--text-muted); }

  .compare-text {
    font-size: 16px;
    line-height: 2;
    letter-spacing: 0.01em;
  }

  .depth-0 { --depth-color: #3b82f6; }
  .depth-1 { --depth-color: #f59e0b; }
  .depth-2 { --depth-color: #a855f7; }
  .depth-3 { --depth-color: #ec4899; }
  .depth-4 { --depth-color: #14b8a6; }

  .btn-primary {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white; border: none;
    padding: 10px 24px; border-radius: 12px;
    font-weight: 600; font-size: 14px;
    cursor: pointer; transition: all 0.2s;
    box-shadow: 0 2px 8px rgba(59,130,246,0.3);
  }
  .btn-primary:hover { box-shadow: 0 4px 16px rgba(59,130,246,0.4); transform: translateY(-1px); }
  .btn-primary:active { transform: translateY(0); }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

  .btn-ghost {
    background: transparent; color: var(--text-dim);
    border: 1px solid var(--border);
    padding: 8px 16px; border-radius: 12px;
    font-weight: 500; font-size: 13px;
    cursor: pointer; transition: all 0.2s;
  }
  .btn-ghost:hover { background: var(--card); border-color: #475569; color: var(--text); }

  .input-field {
    width: 100%; padding: 12px 16px;
    background: var(--bg); border: 1.5px solid var(--border);
    border-radius: 12px; font-size: 15px; color: var(--text);
    transition: all 0.2s;
  }
  .input-field::placeholder { color: var(--text-muted); }
  .input-field:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); }

  textarea.input-field { resize: none; line-height: 1.7; }

  .structure-row {
    display: flex; align-items: baseline; gap: 12px;
    padding: 8px 0;
    border-bottom: 1px solid rgba(51,65,85,0.5);
  }
  .structure-row:last-child { border-bottom: none; }
  .structure-label {
    width: 36px; font-size: 11px; font-weight: 700;
    color: var(--text-muted); text-transform: uppercase;
    letter-spacing: 0.08em; flex-shrink: 0;
  }

  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);
    z-index: 50; display: none;
    align-items: center; justify-content: center;
  }
  .modal-overlay.active { display: flex; }

  .modal {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 20px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.5);
    width: 100%; max-width: 460px;
    margin: 16px;
    overflow: hidden;
  }

  #result-container { display: none; }
  #history-panel { display: none; }

  .section-icon {
    width: 28px; height: 28px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .history-item {
    padding: 14px 16px;
    border-radius: 12px;
    cursor: pointer; transition: all 0.15s;
    border: 1px solid transparent;
  }
  .history-item:hover {
    background: var(--card-hover);
    border-color: var(--border);
  }
  .delete-btn {
    opacity: 0.6;
    flex-shrink: 0;
  }
  .delete-btn:hover {
    color: #ef4444 !important;
    background: rgba(239,68,68,0.1);
    opacity: 1;
  }
  .history-item:hover .delete-btn {
    opacity: 1;
  }

  .grammar-card {
    background: rgba(245,158,11,0.05);
    border: 1px solid rgba(245,158,11,0.15);
    border-radius: 12px;
    padding: 14px 16px;
  }

  .word-item {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    padding: 4px 2px;
    border-radius: 8px;
    transition: all 0.15s;
    cursor: default;
  }
  .word-item:hover {
    background: rgba(255,255,255,0.05);
    transform: translateY(-2px);
  }
  .word-text {
    font-size: 15px;
    font-weight: 600;
    line-height: 1.3;
    color: var(--text);
  }
  .word-pos {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.04em;
    padding: 1px 6px;
    border-radius: 4px;
    white-space: nowrap;
  }

  .pos-noun { background: rgba(59,130,246,0.15); color: #93c5fd; }
  .pos-verb { background: rgba(34,197,94,0.15); color: #86efac; }
  .pos-adj { background: rgba(168,85,247,0.15); color: #c4b5fd; }
  .pos-adv { background: rgba(236,72,153,0.15); color: #f9a8d4; }
  .pos-prep { background: rgba(20,184,166,0.15); color: #5eead4; }
  .pos-conj { background: rgba(245,158,11,0.15); color: #fcd34d; }
  .pos-det { background: rgba(239,68,68,0.12); color: #fca5a5; }
  .pos-pron { background: rgba(99,102,241,0.15); color: #a5b4fc; }
  .pos-modal { background: rgba(34,197,94,0.2); color: #4ade80; }
  .pos-aux { background: rgba(34,197,94,0.12); color: #86efac; }
  .pos-inf { background: rgba(245,158,11,0.1); color: #fde68a; }
  .pos-rel { background: rgba(168,85,247,0.12); color: #d8b4fe; }
  .pos-punct { background: transparent; color: var(--text-muted); }
  .pos-num { background: rgba(236,72,153,0.12); color: #f9a8d4; }
  .pos-part { background: rgba(20,184,166,0.12); color: #5eead4; }
  .pos-intj { background: rgba(245,158,11,0.15); color: #fcd34d; }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
</style>
</head>
<body>

<div class="max-w-4xl mx-auto px-6 py-10">

  <!-- Header -->
  <header class="mb-10 flex justify-between items-start">
    <div>
      <h1 class="text-2xl font-bold tracking-tight mb-1">英文长难句拆解</h1>
      <p class="text-sm" style="color:var(--text-muted)">输入英文长难句，AI 帮你逐层拆解主干、从句、修饰成分</p>
    </div>
    <button id="btn-settings" class="btn-ghost flex items-center gap-2">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
      设置
    </button>
  </header>

  <!-- Config Notice -->
  <div id="config-notice" class="hidden mb-6 card" style="border-color:rgba(245,158,11,0.3);background:rgba(245,158,11,0.05)">
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-3">
        <div class="section-icon" style="background:rgba(245,158,11,0.15)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
        </div>
        <span class="text-sm" style="color:#fcd34d">尚未配置 AI API，请先完成配置</span>
      </div>
      <button onclick="openSettings()" class="btn-primary" style="font-size:12px;padding:6px 16px">去设置</button>
    </div>
  </div>

  <!-- Input -->
  <div class="mb-8">
    <textarea id="sentence-input" class="input-field" rows="3"
      placeholder="输入英文长难句，例如：The fact that he left surprised everyone who knew him."
      maxlength="2000"></textarea>
    <div class="flex justify-between items-center mt-3">
      <div class="flex items-center gap-4">
        <span id="char-count" class="text-xs" style="color:var(--text-muted);font-variant-numeric:tabular-nums">0 / 2000</span>
        <span class="text-xs" style="color:var(--text-muted)">Ctrl + Enter 快速拆解</span>
      </div>
      <div class="flex gap-2">
        <button id="btn-history" class="btn-ghost flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          历史
        </button>
        <button id="btn-analyze" class="btn-primary flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 7h16M4 12h10M4 17h14"/></svg>
          开始拆解
        </button>
      </div>
    </div>
  </div>

  <!-- Error -->
  <div id="error-box" class="hidden mb-6 card" style="border-color:rgba(239,68,68,0.3);background:rgba(239,68,68,0.05)">
    <div class="flex items-center gap-3">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
      <span id="error-text" class="text-sm" style="color:#fca5a5"></span>
    </div>
  </div>

  <!-- Results -->
  <div id="result-container" class="space-y-4">

    <div id="streaming-text" class="hidden card fade-in">
      <div class="flex items-center gap-2 mb-3">
        <div class="w-2 h-2 rounded-full animate-pulse" style="background:var(--accent)"></div>
        <span class="text-xs font-semibold" style="color:var(--text-muted)">AI 分析中</span>
      </div>
      <pre id="stream-content" class="whitespace-pre-wrap text-sm font-mono leading-relaxed" style="color:var(--text-dim)"></pre>
    </div>

    <div id="parsed-result" class="hidden">

      <div id="original-sentence" class="hidden card fade-in stagger-1 mb-6">
        <div class="text-xs font-bold mb-3" style="color:var(--text-muted);letter-spacing:0.08em">原句 · 词性标注</div>
        <div id="word-annotations" class="flex flex-wrap gap-x-1 gap-y-3 mb-3"></div>
        <p id="original-text" class="text-sm leading-relaxed mt-3 pt-3" style="color:var(--text-dim);border-top:1px solid var(--border)"></p>
      </div>

      <div id="compare-section" class="hidden fade-in stagger-2 mb-6">
        <div id="compare-loading" class="hidden card p-4 mb-3">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full animate-pulse" style="background:var(--accent)"></div>
            <span class="text-xs" style="color:var(--text-muted)">AI 正在识别主干和修饰成分...</span>
          </div>
        </div>
        <div id="compare-result" class="hidden compare-container">
          <div class="compare-panel compare-original">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-2 h-2 rounded-full" style="background:#ef4444"></div>
              <span class="text-xs font-bold" style="color:#fca5a5;letter-spacing:0.06em">原文 · 修饰删除线</span>
            </div>
            <div id="compare-with-strikethrough" class="compare-text"></div>
          </div>
          <div class="compare-panel compare-clean">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-2 h-2 rounded-full" style="background:#22c55e"></div>
              <span class="text-xs font-bold" style="color:#86efac;letter-spacing:0.06em">仅主干</span>
            </div>
            <div id="compare-clean-text" class="compare-text"></div>
          </div>
        </div>
      </div>

      <div class="card fade-in stagger-3 mb-4 card-glow" style="border-left:3px solid var(--green)">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="section-icon" style="background:rgba(34,197,94,0.15)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5"><path d="M4 7h16M4 12h10"/></svg>
            </div>
            <h3 class="text-sm font-bold" style="letter-spacing:0.06em;color:var(--text)">句子主干</h3>
          </div>
          <button id="btn-simplify" class="btn-ghost text-xs flex items-center gap-1.5" style="padding:6px 14px">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>
            去掉修饰
          </button>
        </div>
        <div id="main-structure"></div>
      </div>

      <div id="clauses-section" class="hidden card fade-in stagger-3 mb-4 card-glow" style="border-left:3px solid var(--amber)">
        <div class="flex items-center gap-3 mb-4">
          <div class="section-icon" style="background:rgba(245,158,11,0.15)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><path d="M6 3v18M18 3v18M3 12h18"/></svg>
          </div>
          <h3 class="text-sm font-bold" style="letter-spacing:0.06em;color:var(--text)">从句分析</h3>
        </div>
        <div id="clauses-list"></div>
      </div>

      <div id="modifiers-section" class="hidden card fade-in stagger-3 mb-4 card-glow" style="border-left:3px solid var(--purple)">
        <div class="flex items-center gap-3 mb-4">
          <div class="section-icon" style="background:rgba(168,85,247,0.15)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2.5"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4"/></svg>
          </div>
          <h3 class="text-sm font-bold" style="letter-spacing:0.06em;color:var(--text)">修饰成分</h3>
        </div>
        <div id="modifiers-list" class="space-y-2"></div>
      </div>

      <div class="card fade-in stagger-4 mb-4" style="border-left:3px solid var(--accent)">
        <div class="flex items-center gap-3 mb-3">
          <div class="section-icon" style="background:var(--accent-glow)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5"><path d="M5 12h14"/></svg>
          </div>
          <h3 class="text-sm font-bold" style="letter-spacing:0.06em;color:var(--text)">翻译</h3>
        </div>
        <p id="translation" class="leading-relaxed" style="color:var(--text-dim)"></p>
      </div>

      <div id="grammar-section" class="hidden card fade-in stagger-5 mb-4" style="border-left:3px solid var(--amber)">
        <div class="flex items-center gap-3 mb-4">
          <div class="section-icon" style="background:rgba(245,158,11,0.15)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <h3 class="text-sm font-bold" style="letter-spacing:0.06em;color:var(--text)">语法要点</h3>
        </div>
        <div id="grammar-list" class="space-y-3"></div>
      </div>

      <div id="restructure-section" class="hidden card fade-in stagger-6 mb-4" style="border-left:3px solid var(--green)">
        <div class="flex items-center gap-3 mb-3">
          <div class="section-icon" style="background:rgba(34,197,94,0.15)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h3 class="text-sm font-bold" style="letter-spacing:0.06em;color:var(--text)">简化版本</h3>
        </div>
        <div id="restructure-content"></div>
      </div>
    </div>
  </div>

  <!-- History -->
  <div id="history-panel" class="card fade-in">
    <div class="flex justify-between items-center mb-5">
      <div class="flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <h3 class="text-sm font-bold" style="letter-spacing:0.06em;color:var(--text)">历史记录</h3>
      </div>
      <button id="btn-close-history" class="w-8 h-8 rounded-lg flex items-center justify-center transition" style="color:var(--text-muted)" onmouseover="this.style.background='var(--card-hover)'" onmouseout="this.style.background='transparent'">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div id="history-list" class="space-y-1"></div>
    <div id="history-empty" class="hidden text-center py-12">
      <div class="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style="background:var(--bg)">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      </div>
      <p class="text-sm" style="color:var(--text-muted)">暂无历史记录</p>
    </div>
  </div>

</div>

<!-- Settings Modal -->
<div id="settings-modal" class="modal-overlay">
  <div class="modal">
    <div class="px-6 pt-6 pb-4" style="border-bottom:1px solid var(--border)">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-3">
          <div class="section-icon" style="background:var(--accent-glow)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
          </div>
          <h3 class="text-base font-bold" style="color:var(--text)">AI API 设置</h3>
        </div>
        <button id="btn-close-settings" class="w-8 h-8 rounded-lg flex items-center justify-center transition" style="color:var(--text-muted)" onmouseover="this.style.background='var(--card-hover)'" onmouseout="this.style.background='transparent'">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>

    <div class="px-6 py-5 space-y-5">
      <div>
        <label class="block text-xs font-bold mb-2" style="color:var(--text-dim);letter-spacing:0.08em">API 地址</label>
        <input id="setting-url" type="text" class="input-field" placeholder="https://api.openai.com/v1">
        <p class="text-xs mt-2" style="color:var(--text-muted)">OpenAI 兼容接口地址，自动处理 /v1 和 /chat/completions 后缀</p>
      </div>

      <div>
        <label class="block text-xs font-bold mb-2" style="color:var(--text-dim);letter-spacing:0.08em">API Key</label>
        <div class="relative">
          <input id="setting-key" type="password" class="input-field" style="padding-right:56px" placeholder="sk-...">
          <button id="btn-toggle-key" class="absolute right-3 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded-lg transition" style="color:var(--text-muted)" onmouseover="this.style.color='var(--text)'" onmouseout="this.style.color='var(--text-muted)'">显示</button>
        </div>
        <p id="key-status" class="text-xs mt-2" style="color:var(--text-muted)"></p>
      </div>

      <div>
        <label class="block text-xs font-bold mb-2" style="color:var(--text-dim);letter-spacing:0.08em">模型名称</label>
        <input id="setting-model" type="text" class="input-field" placeholder="gpt-4o-mini">
      </div>
    </div>

    <div class="px-6 py-4 flex justify-between items-center" style="background:var(--bg);border-top:1px solid var(--border)">
      <button id="btn-test" class="btn-ghost text-xs flex items-center gap-1.5">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        测试连接
      </button>
      <div class="flex gap-2">
        <button id="btn-cancel-settings" class="btn-ghost text-xs">取消</button>
        <button id="btn-save-settings" class="btn-primary text-xs" style="padding:8px 20px">保存</button>
      </div>
    </div>

    <div id="settings-msg" class="hidden mx-6 mb-4 p-3 rounded-xl text-sm"></div>
  </div>
</div>

<script>
const $ = id => document.getElementById(id);
const input = $('sentence-input');
const btnAnalyze = $('btn-analyze');
const btnHistory = $('btn-history');
const btnCloseHistory = $('btn-close-history');
const charCount = $('char-count');
const errorBox = $('error-box');
const errorText = $('error-text');
const resultContainer = $('result-container');
const streamingText = $('streaming-text');
const streamContent = $('stream-content');
const parsedResult = $('parsed-result');
const historyPanel = $('history-panel');
const settingsModal = $('settings-modal');

let configLoaded = false;

input.addEventListener('input', () => {
  charCount.textContent = input.value.length + ' / 2000';
});
btnAnalyze.addEventListener('click', () => analyze());
input.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) analyze(); });

$('btn-settings').addEventListener('click', openSettings);
$('btn-close-settings').addEventListener('click', closeSettings);
$('btn-cancel-settings').addEventListener('click', closeSettings);
$('btn-save-settings').addEventListener('click', saveSettings);
$('btn-simplify').addEventListener('click', simplifySentence);
$('btn-test').addEventListener('click', testConnection);
$('btn-toggle-key').addEventListener('click', () => {
  const k = $('setting-key');
  if (k.type === 'password') { k.type = 'text'; $('btn-toggle-key').textContent = '隐藏'; }
  else { k.type = 'password'; $('btn-toggle-key').textContent = '显示'; }
});

btnHistory.addEventListener('click', () => toggleHistory());
btnCloseHistory.addEventListener('click', () => { historyPanel.style.display = 'none'; resultContainer.style.display = 'block'; });

async function checkConfig() {
  try {
    const r = await fetch('/api/settings'); const d = await r.json();
    configLoaded = !!(d.ai_base_url && d.has_api_key && d.ai_model);
    $('config-notice').classList.toggle('hidden', configLoaded);
    btnAnalyze.disabled = !configLoaded;
  } catch {}
}
checkConfig();

function openSettings() { settingsModal.classList.add('active'); loadSettings(); }
function closeSettings() { settingsModal.classList.remove('active'); $('settings-msg').classList.add('hidden'); }

async function loadSettings() {
  try {
    const r = await fetch('/api/settings'); const d = await r.json();
    $('setting-url').value = d.ai_base_url || '';
    $('setting-model').value = d.ai_model || '';
    $('setting-key').value = '';
    $('key-status').textContent = d.has_api_key ? '已设置 API Key' : '未设置';
    $('key-status').style.color = d.has_api_key ? '#22c55e' : 'var(--text-muted)';
  } catch {}
}

async function saveSettings() {
  const url = $('setting-url').value.trim();
  const key = $('setting-key').value.trim();
  const model = $('setting-model').value.trim();
  if (!url) { showSettingsMsg('请输入 API 地址', 'error'); return; }
  if (!model) { showSettingsMsg('请输入模型名称', 'error'); return; }
  const body = { ai_base_url: url, ai_model: model };
  if (key) body.ai_api_key = key;
  try {
    const r = await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const d = await r.json();
    if (!r.ok) { showSettingsMsg(d.error, 'error'); return; }
    showSettingsMsg('保存成功', 'success');
    setTimeout(() => { closeSettings(); checkConfig(); }, 800);
  } catch (e) { showSettingsMsg('保存失败', 'error'); }
}

async function testConnection() {
  $('btn-test').disabled = true;
  $('btn-test').innerHTML = '<span style="display:inline-block;width:12px;height:12px;border:2px solid var(--text-muted);border-top-color:transparent;border-radius:50%;animation:spin 0.6s linear infinite"></span> 测试中';
  try {
    const r = await fetch('/api/settings/test', { method: 'POST' }); const d = await r.json();
    showSettingsMsg(d.success ? '连接成功' : '连接失败: ' + d.error, d.success ? 'success' : 'error');
  } catch (e) { showSettingsMsg('测试失败', 'error'); }
  finally { $('btn-test').disabled = false; $('btn-test').innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> 测试连接'; }
}

function showSettingsMsg(msg, type) {
  const el = $('settings-msg');
  el.textContent = msg;
  el.style.background = type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)';
  el.style.color = type === 'success' ? '#86efac' : '#fca5a5';
  el.style.border = '1px solid ' + (type === 'success' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)');
  el.classList.remove('hidden');
}

async function analyze() {
  const sentence = input.value.trim();
  if (!sentence) { showError('请输入英文句子'); return; }
  if (sentence.length > 2000) { showError('句子长度不能超过 2000 字符'); return; }

  hideError();
  btnAnalyze.disabled = true;
  btnAnalyze.innerHTML = '<span style="display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:spin 0.6s linear infinite"></span> 分析中';
  resultContainer.style.display = 'block';
  streamingText.classList.remove('hidden');
  parsedResult.classList.add('hidden');
  streamContent.textContent = '';
  streamContent.classList.add('stream-cursor');
  historyPanel.style.display = 'none';

  try {
    const res = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sentence }) });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error || '请求失败'); }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '', buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split('\\n\\n');
      buffer = parts.pop() || '';
      for (const part of parts) {
        const dl = part.split('\\n').find(l => l.startsWith('data:'));
        if (!dl) continue;
        const d = dl.slice(5).trim();
        if (d === '[DONE]') continue;
        try {
          const msg = JSON.parse(d);
          if (msg.type === 'token') { fullText += msg.content; streamContent.textContent = fullText; }
          else if (msg.type === 'result') renderResult(msg.data);
          else if (msg.type === 'error') throw new Error(msg.message);
        } catch(e) { if (e.message && !e.message.includes('JSON')) throw e; }
      }
    }
    streamContent.classList.remove('stream-cursor');
  } catch (err) {
    showError(err.message);
    streamingText.classList.add('hidden');
  } finally {
    btnAnalyze.disabled = false;
    btnAnalyze.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 7h16M4 12h10M4 17h14"/></svg> 开始拆解';
  }
}

function structureRow(label, text, cls) {
  if (!text) return '';
  return '<div class="structure-row"><span class="structure-label">' + label + '</span><span class="' + cls + '">' + esc(text) + '</span></div>';
}

const DEPTH_COLORS = ['#3b82f6', '#f59e0b', '#a855f7', '#ec4899', '#14b8a6', '#ef4444'];
const DEPTH_BG = ['rgba(59,130,246,0.06)', 'rgba(245,158,11,0.06)', 'rgba(168,85,247,0.06)', 'rgba(236,72,153,0.06)', 'rgba(20,184,166,0.06)', 'rgba(239,68,68,0.06)'];
const DEPTH_LABELS = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6'];
const DEPTH_TAG_CLS = ['tag-blue', 'tag-amber', 'tag-purple', 'tag-pink', 'tag-teal', 'tag-red'];

function renderClause(c, depth, path) {
  const color = DEPTH_COLORS[depth % 6];
  const bg = DEPTH_BG[depth % 6];
  const tagCls = DEPTH_TAG_CLS[depth % 6];
  const label = DEPTH_LABELS[depth % 6] || 'L' + (depth + 1);
  const hasChildren = c.clauses && c.clauses.length > 0;
  const currentPath = path ? path + ' → ' + c.type : c.type;

  let html = '<div class="clause-node">';

  // Header: connector dot + line + type label
  html += '<div class="clause-node-header">';
  html += '<div class="clause-connector">';
  html += '<div class="clause-connector-dot" style="background:' + color + '"></div>';
  html += '<div class="clause-connector-line" style="background:' + color + ';opacity:0.4"></div>';
  html += '</div>';
  html += '<span class="clause-depth-indicator" style="background:' + color + '22;color:' + color + '">' + label + '</span>';
  html += '<span class="tag ' + tagCls + '">' + esc(c.type) + '</span>';
  if (c.belongs_to) html += '<span class="tag tag-gray">属于: ' + esc(c.belongs_to) + '</span>';
  html += '</div>';

  // Body card
  html += '<div class="clause-body" style="background:' + bg + '">';
  html += '<div style="position:absolute;left:0;top:0;bottom:0;width:4px;border-radius:14px 0 0 14px;background:' + color + '"></div>';

  // Content
  html += '<div class="hl-clause mb-2" style="border-color:' + color + '33">' + esc(c.content) + '</div>';
  html += '<div class="text-sm mb-3" style="color:var(--text-dim)">' + esc(c.function) + '</div>';

  // Structure
  if (c.structure && (c.structure.subject || c.structure.predicate || c.structure.object || c.structure.complement)) {
    const s = c.structure;
    html += '<div class="clause-structure-box" style="background:rgba(15,23,42,0.4)">';
    html += structureRow('主语', s.subject, 'hl-subject');
    html += structureRow('谓语', s.predicate, 'hl-predicate');
    html += structureRow('宾语', s.object, 'hl-object');
    html += structureRow('补语', s.complement, 'hl-complement');
    html += '</div>';
  }

  // Modifiers
  if (c.modifiers && c.modifiers.length > 0) {
    html += '<div class="mt-3 space-y-1.5">';
    for (const m of c.modifiers) {
      html += '<div class="flex items-start gap-2 text-xs">';
      html += '<span class="tag tag-purple" style="flex-shrink:0">' + esc(m.type) + '</span>';
      html += '<span class="hl-modifier" style="padding:4px 8px">' + esc(m.content) + '</span>';
      html += '<span style="color:var(--text-muted)">→ ' + esc(m.modifies) + '</span>';
      html += '</div>';
    }
    html += '</div>';
  }

  html += '</div>';

  // Children
  if (hasChildren) {
    html += '<div class="clause-children" style="--child-color:' + color + '">';
    html += '<div style="position:absolute;left:14px;top:0;bottom:12px;width:2px;border-radius:1px;background:' + color + ';opacity:0.15"></div>';
    for (const sub of c.clauses) {
      html += renderClause(sub, depth + 1, currentPath);
    }
    html += '</div>';
  }

  html += '</div>';
  return html;
}

function renderResult(data) {
  streamingText.classList.add('hidden');
  parsedResult.classList.remove('hidden');
  $('compare-section').classList.add('hidden');

  if (data.original) {
    currentSentence = data.original;
    $('original-sentence').classList.remove('hidden');
    $('original-text').textContent = data.original;
    if (data.word_annotations && data.word_annotations.length > 0) {
      $('word-annotations').innerHTML = data.word_annotations.map(w => {
        const posClass = getPosClass(w.pos);
        return '<div class="word-item"><span class="word-text">' + esc(w.word) + '</span><span class="word-pos ' + posClass + '">' + esc(w.pos) + '</span></div>';
      }).join('');
    } else {
      $('word-annotations').innerHTML = '';
    }
  }

  const ms = data.main_structure;
  let msHtml = '';
  msHtml += structureRow('主语', ms.subject, 'hl-subject');
  msHtml += structureRow('谓语', ms.predicate, 'hl-predicate');
  msHtml += structureRow('宾语', ms.object, 'hl-object');
  msHtml += structureRow('补语', ms.complement, 'hl-complement');
  $('main-structure').innerHTML = msHtml;

  if (data.clauses && data.clauses.length > 0) {
    $('clauses-section').classList.remove('hidden');
    $('clauses-list').innerHTML = '<div class="clause-tree">' + data.clauses.map(c => renderClause(c, 0, '')).join('') + '</div>';
  } else { $('clauses-section').classList.add('hidden'); }

  if (data.modifiers && data.modifiers.length > 0) {
    $('modifiers-section').classList.remove('hidden');
    $('modifiers-list').innerHTML = data.modifiers.map(m =>
      '<div class="flex items-start gap-3 p-3" style="background:rgba(168,85,247,0.05);border:1px solid rgba(168,85,247,0.12);border-radius:12px">' +
      '<span class="tag tag-purple" style="flex-shrink:0">' + esc(m.type) + '</span>' +
      '<div class="flex-1 min-w-0"><div class="hl-modifier mb-1" style="padding:4px 8px">' + esc(m.content) + '</div>' +
      '<div class="text-xs" style="color:var(--text-muted)">修饰: ' + esc(m.modifies) + '</div></div></div>'
    ).join('');
  } else { $('modifiers-section').classList.add('hidden'); }

  $('translation').textContent = data.translation;

  if (data.grammar_points && data.grammar_points.length > 0) {
    $('grammar-section').classList.remove('hidden');
    $('grammar-list').innerHTML = data.grammar_points.map(g =>
      '<div class="grammar-card">' +
      '<div class="font-semibold text-sm mb-1" style="color:#fcd34d">' + esc(g.point) + '</div>' +
      '<div class="text-sm mb-2 leading-relaxed" style="color:var(--text-dim)">' + esc(g.explanation) + '</div>' +
      '<div class="text-xs font-mono" style="color:var(--text-muted);background:rgba(15,23,42,0.5);padding:6px 10px;border-radius:8px">例: ' + esc(g.example) + '</div></div>'
    ).join('');
  } else { $('grammar-section').classList.add('hidden'); }

  if (data.restructuring) {
    $('restructure-section').classList.remove('hidden');
    $('restructure-content').innerHTML =
      '<div class="hl-subject" style="padding:12px 16px;margin-bottom:8px;line-height:1.7">' + esc(data.restructuring.simple_version) + '</div>' +
      '<div class="text-sm leading-relaxed" style="color:var(--text-dim)">' + esc(data.restructuring.explanation) + '</div>';
  } else { $('restructure-section').classList.add('hidden'); }
}

let currentSentence = '';

async function simplifySentence() {
  if (!currentSentence) return;
  const btn = $('btn-simplify');
  const loading = $('compare-loading');
  const result = $('compare-result');
  const section = $('compare-section');

  section.classList.remove('hidden');
  loading.classList.remove('hidden');
  result.classList.add('hidden');
  btn.disabled = true;
  btn.innerHTML = '<span style="display:inline-block;width:12px;height:12px;border:2px solid var(--text-muted);border-top-color:transparent;border-radius:50%;animation:spin 0.6s linear infinite"></span> 分析中';

  try {
    const res = await fetch('/api/simplify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sentence: currentSentence })
    });

    if (!res.ok) { const e = await res.json(); throw new Error(e.error || '请求失败'); }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split('\\n\\n');
      buffer = parts.pop() || '';
      for (const part of parts) {
        const dl = part.split('\\n').find(l => l.startsWith('data:'));
        if (!dl) continue;
        const d = dl.slice(5).trim();
        if (d === '[DONE]') continue;
        try {
          const msg = JSON.parse(d);
          if (msg.type === 'result') {
            renderSimplifyResult(msg.data.segments);
          } else if (msg.type === 'error') {
            throw new Error(msg.message);
          }
        } catch(e) { if (e.message && !e.message.includes('JSON')) throw e; }
      }
    }
  } catch (err) {
    showError(err.message);
    section.classList.add('hidden');
  } finally {
    loading.classList.add('hidden');
    btn.disabled = false;
    btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg> 去掉修饰';
  }
}

function renderSimplifyResult(segments) {
  const result = $('compare-result');
  result.classList.remove('hidden');

  // Left: original with strikethrough on modifiers
  let strikethroughHtml = '';
  for (const seg of segments) {
    if (seg.role === 'main') {
      strikethroughHtml += '<span class="seg-main">' + esc(seg.text) + '</span>';
    } else if (seg.role === 'mod') {
      strikethroughHtml += '<span class="seg-mod">' + esc(seg.text) + '</span>';
    } else {
      strikethroughHtml += '<span class="seg-punct">' + esc(seg.text) + '</span>';
    }
  }
  $('compare-with-strikethrough').innerHTML = strikethroughHtml;

  // Right: only main structure
  let cleanHtml = '';
  for (const seg of segments) {
    if (seg.role === 'main') {
      cleanHtml += '<span class="seg-main">' + esc(seg.text) + '</span>';
    } else if (seg.role === 'punct') {
      cleanHtml += '<span class="seg-punct">' + esc(seg.text) + '</span>';
    }
  }
  $('compare-clean-text').innerHTML = cleanHtml;
}

async function toggleHistory() {
  resultContainer.style.display = 'none';
  historyPanel.style.display = 'block';
  $('history-list').innerHTML = '';
  $('history-empty').classList.add('hidden');
  try {
    const r = await fetch('/api/history'); const d = await r.json();
    if (d.items.length === 0) { $('history-empty').classList.remove('hidden'); return; }
    $('history-list').innerHTML = d.items.map(item =>
      '<div class="history-item flex justify-between items-start group" data-id="' + item.id + '">' +
      '<div class="flex-1 min-w-0 history-text" style="cursor:pointer">' +
      '<div class="text-sm truncate" style="color:var(--text)">' + esc(item.sentence) + '</div>' +
      '<div class="text-xs mt-1 font-mono" style="color:var(--text-muted)">' + item.created_at + '</div></div>' +
      '<button class="ml-3 delete-btn p-1.5 rounded-lg transition" style="color:var(--text-muted)" data-delete="' + item.id + '">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button></div>'
    ).join('');

    $('history-list').querySelectorAll('.history-text').forEach(el => {
      el.addEventListener('click', () => loadHistory(Number(el.closest('[data-id]').dataset.id)));
    });
    $('history-list').querySelectorAll('.delete-btn').forEach(el => {
      el.addEventListener('click', e => { e.stopPropagation(); deleteHistory(Number(el.dataset.delete)); });
    });
  } catch { showError('加载历史记录失败'); }
}

async function loadHistory(id) {
  try {
    const r = await fetch('/api/history/' + id); const d = await r.json();
    input.value = d.sentence;
    charCount.textContent = d.sentence.length + ' / 2000';
    historyPanel.style.display = 'none';
    resultContainer.style.display = 'block';
    renderResult(JSON.parse(d.result));
  } catch { showError('加载记录失败'); }
}

async function deleteHistory(id) {
  try { await fetch('/api/history/' + id, { method: 'DELETE' }); toggleHistory(); }
  catch { showError('删除失败'); }
}

function showError(msg) { errorText.textContent = msg; errorBox.classList.remove('hidden'); }
function hideError() { errorBox.classList.add('hidden'); }
function esc(s) { if (!s) return ''; const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

const POS_MAP = {
  '名词': 'pos-noun', '动词': 'pos-verb', '形容词': 'pos-adj', '副词': 'pos-adv',
  '介词': 'pos-prep', '连词': 'pos-conj', '冠词': 'pos-det', '代词': 'pos-pron',
  '情态动词': 'pos-modal', '助动词': 'pos-aux', '不定式标记': 'pos-inf',
  '关系代词': 'pos-rel', '关系副词': 'pos-rel', '感叹词': 'pos-intj',
  '标点': 'pos-punct', '数词': 'pos-num', '分词': 'pos-part', '限定词': 'pos-det',
};
function getPosClass(pos) { return POS_MAP[pos] || 'pos-noun'; }
</script>
<style>@keyframes spin{to{transform:rotate(360deg)}}</style>
</body>
</html>`;
}

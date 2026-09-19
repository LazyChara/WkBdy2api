/**
 * Embedded admin panel — single HTML page, no build step, no external assets.
 * Design follows the apple-design skill: platform system font with
 * size-specific tracking, translucent chrome (backdrop blur) with material
 * weight encoding hierarchy, tabular numerals for data, 200ms cross-fade
 * section transitions with full reduced-motion support, instant press
 * feedback on every control.
 */

export function adminPanelHtml(): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Wkbdy2api Console</title>
<style>
:root {
  color-scheme: light dark;
  --bg: #f5f5f7;
  --bg-raised: rgba(255, 255, 255, 0.72);
  --bg-sidebar: rgba(240, 240, 243, 0.82);
  --chrome-border: rgba(0, 0, 0, 0.08);
  --card-border: rgba(0, 0, 0, 0.06);
  --text: #1d1d1f;
  --text-secondary: #6e6e73;
  --text-tertiary: #8e8e93;
  --accent: #0071e3;
  --accent-pressed: #0060c9;
  --ok: #34c759;
  --warn: #ff9f0a;
  --error: #ff3b30;
  --row-hover: rgba(0, 0, 0, 0.03);
  --divider: rgba(0, 0, 0, 0.07);
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: #1c1c1e;
    --bg-raised: rgba(44, 44, 46, 0.72);
    --bg-sidebar: rgba(28, 28, 30, 0.86);
    --chrome-border: rgba(255, 255, 255, 0.08);
    --card-border: rgba(255, 255, 255, 0.09);
    --text: #f5f5f7;
    --text-secondary: #98989d;
    --text-tertiary: #77777c;
    --accent: #0a84ff;
    --accent-pressed: #409cff;
    --ok: #30d158;
    --warn: #ff9f0a;
    --error: #ff453a;
    --row-hover: rgba(255, 255, 255, 0.04);
    --divider: rgba(255, 255, 255, 0.08);
  }
}

* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  font: 100%/1.5 -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro SC",
        "PingFang SC", "Segoe UI", "Microsoft YaHei", system-ui, sans-serif;
  font-optical-sizing: auto;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
}

/* ---- layout: settings-style sidebar + content ---- */
.shell {
  display: flex;
  min-height: 100vh;
}
.sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  width: 220px;
  flex-shrink: 0;
  padding: 20px 12px;
  background: var(--bg-sidebar);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  backdrop-filter: blur(24px) saturate(180%);
  border-right: 1px solid var(--chrome-border);
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.main {
  flex: 1;
  min-width: 0;
  padding: 32px clamp(20px, 4vw, 48px) 64px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 2px 8px 12px;
}
.brand-dot {
  width: 10px; height: 10px;
  border-radius: 50%;
  background: var(--ok);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--ok) 20%, transparent);
  flex-shrink: 0;
}
.brand-dot.down { background: var(--error); box-shadow: 0 0 0 3px color-mix(in srgb, var(--error) 20%, transparent); }
.brand h1 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.01em;
}
.brand small { display: block; font-size: 11px; color: var(--text-tertiary); font-weight: 400; letter-spacing: 0; }

.nav { display: flex; flex-direction: column; gap: 2px; }
.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 7px 10px;
  border: none;
  border-radius: 7px;
  background: transparent;
  color: var(--text);
  font: inherit;
  font-size: 13px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: background 130ms ease-out;
}
.nav-item:active { background: var(--row-hover); transform: scale(0.985); }
.nav-item[aria-current="true"] { background: var(--accent); color: #fff; }
.nav-item svg { width: 16px; height: 16px; flex-shrink: 0; opacity: 0.85; }

.sidebar-footer {
  margin-top: auto;
  padding: 10px 8px 0;
  border-top: 1px solid var(--divider);
  font-size: 11px;
  color: var(--text-tertiary);
  letter-spacing: 0.02em;
}

/* ---- content ---- */
.section { animation: fadeIn 200ms ease-out; max-width: 920px; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) {
  .section { animation: none; }
  * { transition: none !important; }
}
.section[hidden] { display: none; }

h2 {
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.page-sub { margin: 0 0 24px; color: var(--text-secondary); font-size: 13px; }

/* ---- stat tiles ---- */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}
.stat {
  background: var(--bg-raised);
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  padding: 14px 16px;
}
.stat-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.stat-value {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  margin-top: 4px;
  line-height: 1.1;
}
.stat-value.ok { color: var(--ok); }
.stat-value.bad { color: var(--error); }
.stat-value small { font-size: 14px; font-weight: 500; color: var(--text-secondary); }

/* ---- cards (grouped lists, settings style) ---- */
.card {
  background: var(--bg-raised);
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 24px;
}
.card-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px 10px;
}
.card-title { font-size: 15px; font-weight: 650; letter-spacing: -0.01em; margin: 0; }
.card-note { font-size: 12px; color: var(--text-tertiary); }

.rows { display: flex; flex-direction: column; }
.row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 11px 18px;
  border-top: 1px solid var(--divider);
  min-height: 44px;
}
.row:first-child { border-top: none; }
.row:hover { background: var(--row-hover); }
.row-main { flex: 1; min-width: 0; }
.row-title { font-size: 13px; font-weight: 550; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.row-sub { font-size: 12px; color: var(--text-secondary); margin-top: 1px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.row-value { font-size: 13px; color: var(--text-secondary); font-variant-numeric: tabular-nums; flex-shrink: 0; }
.context-picker { display: inline-flex; align-items: center; gap: 7px; margin-top: 8px; font-size: 11px; font-weight: 600; letter-spacing: .01em; color: var(--text-tertiary); }
.context-select { appearance: none; border: 1px solid var(--card-border); border-radius: 8px; background: var(--bg-raised); color: var(--text-primary); padding: 6px 28px 6px 10px; font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; transition: transform 120ms ease-out, border-color 160ms ease, background 160ms ease; background-image: linear-gradient(45deg, transparent 50%, currentColor 50%), linear-gradient(135deg, currentColor 50%, transparent 50%); background-position: calc(100% - 13px) 10px, calc(100% - 9px) 10px; background-size: 4px 4px, 4px 4px; background-repeat: no-repeat; }
.context-select:hover { border-color: var(--accent); background-color: var(--row-hover); }
.context-select:active { transform: scale(.97); }
.context-select:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) { .context-select { transition: none; } }

/* ---- pills / badges ---- */
.pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 99px;
  flex-shrink: 0;
  letter-spacing: 0.01em;
}
.pill::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.pill.ok { color: var(--ok); background: color-mix(in srgb, var(--ok) 12%, transparent); }
.pill.warn { color: var(--warn); background: color-mix(in srgb, var(--warn) 14%, transparent); }
.pill.error { color: var(--error); background: color-mix(in srgb, var(--error) 12%, transparent); }
.pill.neutral { color: var(--text-secondary); background: var(--row-hover); }
.pill.neutral::before { display: none; }

/* ---- request log table ---- */
.log-scroll { overflow-x: auto; }
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12.5px;
  font-variant-numeric: tabular-nums;
}
th {
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 10px 18px;
  border-bottom: 1px solid var(--divider);
  white-space: nowrap;
}
td { padding: 9px 18px; border-top: 1px solid var(--divider); white-space: nowrap; }
td.path { font-family: ui-monospace, "SF Mono", "Cascadia Code", Consolas, monospace; font-size: 11.5px; }
td .muted { color: var(--text-tertiary); }

/* ---- controls ---- */
.controls { display: flex; gap: 10px; align-items: center; }
.btn {
  appearance: none;
  border: none;
  border-radius: 8px;
  padding: 7px 14px;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  color: #fff;
  background: var(--accent);
  transition: background 130ms ease-out, transform 80ms ease-out;
}
.btn:active { background: var(--accent-pressed); transform: scale(0.97); }
.btn.secondary {
  color: var(--text);
  background: var(--row-hover);
  border: 1px solid var(--card-border);
}
.btn.secondary:active { background: var(--divider); }

/* ---- segmented control (strategy switch) ---- */
.seg {
  display: inline-flex;
  background: var(--row-hover);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  padding: 2px;
  gap: 2px;
}
.seg-btn {
  appearance: none;
  border: none;
  border-radius: 6px;
  padding: 5px 12px;
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  background: transparent;
  cursor: pointer;
  transition: background 130ms ease-out, color 130ms ease-out;
}
.seg-btn:active { transform: scale(0.96); }
.seg-btn.active { background: var(--accent); color: #fff; }

/* ---- login form ---- */
.login-form { padding: 4px 18px 16px; display: flex; flex-direction: column; gap: 10px; }
.form-label {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
}
.login-form .key-input { font-size: 12.5px; }
.form-hint {
  margin: 10px 0 2px;
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.55;
}
.form-hint code {
  font-family: ui-monospace, "SF Mono", Consolas, monospace;
  font-size: 11px;
  background: var(--row-hover);
  padding: 1px 5px;
  border-radius: 4px;
}
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 18px;
  border-top: 1px solid var(--divider);
}
.footer-note { font-size: 12px; color: var(--text-secondary); }

/* ---- unlock view ---- */
.unlock {
  max-width: 420px;
  margin: 18vh auto 0;
  background: var(--bg-raised);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.08);
  animation: fadeIn 200ms ease-out;
}
.unlock h2 { font-size: 18px; }
.unlock p { font-size: 13px; color: var(--text-secondary); margin: 4px 0 18px; }
.key-input {
  width: 100%;
  padding: 10px 12px;
  font: inherit;
  font-size: 13px;
  border: 1px solid var(--chrome-border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text);
  outline: none;
  transition: border-color 130ms ease-out;
}
.key-input:focus { border-color: var(--accent); }
.key-error { color: var(--error); font-size: 12px; min-height: 16px; margin: 8px 0 2px; }

/* ---- model bars (per-model usage) ---- */
.bar-track {
  height: 4px;
  border-radius: 2px;
  background: var(--divider);
  overflow: hidden;
  min-width: 80px;
}
.bar-fill { height: 100%; border-radius: 2px; background: var(--accent); }

/* responsive: sidebar collapses to top bar */
@media (max-width: 720px) {
  .shell { flex-direction: column; }
  .sidebar {
    position: static;
    height: auto;
    width: 100%;
    flex-direction: row;
    align-items: center;
    padding: 10px 16px;
    border-right: none;
    border-bottom: 1px solid var(--chrome-border);
    gap: 10px;
  }
  .brand { padding: 0; }
  .brand h1 { font-size: 14px; }
  .brand small { display: none; }
  .nav { flex-direction: row; overflow-x: auto; flex: 1; }
  .nav-item { width: auto; white-space: nowrap; }
  .nav-item span { display: none; }
  .sidebar-footer { display: none; }
  .main { padding: 20px 16px 48px; }
  .stat-grid { grid-template-columns: repeat(2, 1fr); }
}
/* Apple Design refresh */
:root { --bg: #f5f5f7; --bg-raised: rgba(255,255,255,.72); --bg-sidebar: rgba(255,255,255,.64); --bg-elevated: rgba(255,255,255,.9); --chrome-border: rgba(0,0,0,.08); --card-border: rgba(0,0,0,.07); --text: #1d1d1f; --text-primary: #1d1d1f; --text-secondary: #6e6e73; --text-tertiary: #86868b; --accent: #0071e3; --accent-pressed: #0060c9; --ok: #34c759; --warn: #ff9f0a; --error: #ff3b30; --row-hover: rgba(0,0,0,.035); --divider: rgba(0,0,0,.07); --shadow: 0 18px 50px rgba(0,0,0,.07); }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg:#1c1c1e; --bg-raised:rgba(44,44,46,.76); --bg-sidebar:rgba(28,28,30,.8); --bg-elevated:#2c2c2e; --chrome-border:rgba(255,255,255,.1); --card-border:rgba(255,255,255,.1); --text:#f5f5f7; --text-primary:#f5f5f7; --text-secondary:#98989d; --text-tertiary:#8e8e93; --accent:#0a84ff; --accent-pressed:#409cff; --ok:#30d158; --warn:#ff9f0a; --error:#ff453a; --row-hover:rgba(255,255,255,.06); --divider:rgba(255,255,255,.1); --shadow:0 18px 50px rgba(0,0,0,.3); } }
body { background: radial-gradient(circle at 12% 0%, color-mix(in srgb,var(--accent) 5%,transparent), transparent 34rem), var(--bg); }
.shell { min-height:100vh; }
.app-content { min-width:0; flex:1; }
.app-toolbar { position:sticky; top:0; z-index:5; min-height:72px; padding:16px clamp(20px,4vw,52px); display:flex; align-items:center; justify-content:space-between; gap:20px; background:color-mix(in srgb,var(--bg) 74%,transparent); backdrop-filter:blur(24px) saturate(180%); border-bottom:1px solid var(--divider); }
.eyebrow,.setting-kicker { color:var(--text-tertiary); font-size:10px; font-weight:750; letter-spacing:.12em; text-transform:uppercase; }
.toolbar-title { font-size:20px; font-weight:720; letter-spacing:-.025em; line-height:1.1; }
.toolbar-actions { display:flex; align-items:center; gap:12px; }
.toolbar-status { display:inline-flex; align-items:center; gap:7px; color:var(--text-secondary); font-size:12px; font-weight:600; }
.status-dot { width:7px; height:7px; border-radius:50%; background:var(--ok); box-shadow:0 0 0 4px color-mix(in srgb,var(--ok) 15%,transparent); }
.main { padding:36px clamp(20px,4vw,56px) 72px; }
.section { max-width:1040px; animation:fadeIn 180ms ease-out; }
.view-header { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:26px; }
h2 { font-size:30px; letter-spacing:-.04em; line-height:1.08; margin:4px 0 8px; }
.page-sub { margin:0; max-width:620px; line-height:1.55; }
.stat-grid { gap:14px; margin-bottom:28px; }
.stat,.card,.surface-card { border-radius:18px; box-shadow:var(--shadow); }
.stat { padding:20px; }
.stat-label { letter-spacing:.03em; }
.stat-value { font-size:32px; }
.card-header { padding:18px 20px 12px; }
.card-title { font-size:16px; }
.row { padding:14px 20px; min-height:56px; }
.row-title { font-size:14px; }
.row-sub { line-height:1.45; }
.btn { min-height:40px; border-radius:11px; padding:9px 16px; }
.btn.secondary { background:var(--bg-elevated); }
.model-list { display:grid; gap:12px; }
.model-card { display:flex; gap:24px; align-items:center; justify-content:space-between; padding:20px 22px; border:1px solid var(--card-border); border-radius:18px; background:var(--bg-raised); box-shadow:0 8px 24px color-mix(in srgb,var(--text) 5%,transparent); transition:transform 140ms ease-out, border-color 160ms ease, box-shadow 160ms ease; }
.model-card:hover { transform:translateY(-1px); border-color:color-mix(in srgb,var(--accent) 30%,var(--card-border)); box-shadow:0 14px 32px color-mix(in srgb,var(--text) 9%,transparent); }
.model-card-main { min-width:0; flex:1; }
.model-heading { display:flex; align-items:center; gap:12px; justify-content:space-between; }
.model-name { font-size:16px; font-weight:700; letter-spacing:-.018em; }
.model-id { margin-top:3px; color:var(--text-tertiary); font:12px ui-monospace,SFMono-Regular,Consolas,monospace; }
.model-tags { display:flex; flex-wrap:wrap; gap:6px; margin-top:10px; }
.model-context { display:flex; flex-wrap:wrap; align-items:center; gap:8px; margin-top:12px; color:var(--text-secondary); font-size:12px; }
.context-effective { color:var(--text-tertiary); }
.model-limits { display:flex; gap:20px; padding-left:20px; border-left:1px solid var(--divider); flex-shrink:0; }
.model-limits div { display:flex; flex-direction:column; gap:3px; align-items:flex-end; }
.model-limits span { color:var(--text-tertiary); font-size:10px; letter-spacing:.08em; text-transform:uppercase; }
.model-limits strong { font-size:14px; font-variant-numeric:tabular-nums; }
.price { white-space:nowrap; color:var(--text); font-size:13px; font-weight:700; }
.price small { color:var(--text-tertiary); font-size:10px; font-weight:600; }
.context-card { padding:0; margin-bottom:20px; }
.context-setting { display:flex; align-items:center; justify-content:space-between; gap:24px; padding:22px 24px; }
.setting-title { margin-top:3px; font-size:17px; font-weight:700; letter-spacing:-.015em; }
.setting-description { margin-top:5px; color:var(--text-secondary); font-size:12px; line-height:1.5; }
.setting-control { display:flex; align-items:center; gap:10px; flex-shrink:0; }
.global-context-select { min-width:130px; font-size:13px; padding:10px 32px 10px 13px; border-radius:11px; }
.save-state { color:var(--text-tertiary); font-size:11px; min-width:54px; }
.sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
@media (prefers-reduced-transparency: reduce) { .app-toolbar,.sidebar,.card,.stat,.surface-card,.model-card { backdrop-filter:none; background:var(--bg-elevated); } }
@media (prefers-contrast: more) { .card,.stat,.surface-card,.model-card,.context-select { border-color:var(--text-secondary); } }
@media (prefers-reduced-motion: reduce) { .model-card { transition:none; } }
@media (max-width:720px) { .app-toolbar { padding:14px 16px; min-height:64px; } .toolbar-status { display:none; } .main { padding:24px 16px 56px; } .sidebar { padding:10px 14px; } .nav-item span { display:inline; } .model-card { align-items:flex-start; flex-direction:column; gap:16px; } .model-limits { width:100%; justify-content:space-between; padding:12px 0 0; border-left:0; border-top:1px solid var(--divider); } .model-limits div { align-items:flex-start; } .context-setting { align-items:flex-start; flex-direction:column; gap:16px; } .setting-control { width:100%; } .global-context-select { flex:1; } }
:focus-visible { outline:2px solid var(--accent); outline-offset:3px; border-radius:8px; }
.lang-seg { margin-left: 4px; flex-shrink: 0; }
.lang-seg .seg-btn { padding: 5px 10px; }
.unlock-lang { display: flex; justify-content: center; margin-bottom: 16px; }
</style>
</head>
<body>

<div id="app"></div>

<script>
(function () {
  'use strict';

  var KEY_STORAGE = 'wkb2api-admin-key';
  var contextPending = new Set();
  var contextRevision = 0;
  var state = {
    key: null,
    overview: null,
    view: 'overview',
    timer: null,
    unlockError: null,
    oauth: null,
    oauthTimer: null,
    oauthBusy: false,
    oauthMessage: '',
    oauthUrl: '',
    overviewPending: false,
    importBusy: false,
    lang: 'en',
  };

  var $ = function (sel, root) { return (root || document).querySelector(sel); };

  // ---------- i18n (default EN; RU and ZH via switcher, persisted) ----------
  var LANG_STORAGE = 'wkb2api-lang';
  var I18N = {
    ru: {
      '概览': 'Обзор',
      '模型': 'Модели',
      '请求记录': 'Запросы',
      '上游与凭据': 'Апстрим и доступ',
      'Key 无效，请检查后重试。': 'Недействительный ключ, проверьте и попробуйте снова.',
      '请求失败（HTTP ': 'Ошибка запроса (HTTP ',
      '）': ')',
      ' 次 · ': ' · ',
      ' tok': ' ток.',
      '保存中…': 'Сохранение…',
      '保存失败': 'Не сохранено',
      '已保存': 'Сохранено',
      '已保存 · 所有账号生效': 'Сохранено · применяется ко всем аккаунтам',
      '保存失败：': 'Не сохранено: ',
      '服务端未确认所选档位': 'Сервер не подтвердил выбранный размер контекста',
      ' 小时 ': ' ч ',
      ' 分': ' мин',
      ' 秒': ' с',
      'Wkbdy2api 控制台': 'Консоль Wkbdy2api',
      '输入网关的本地 API Key（与调用 /v1 接口使用的 Bearer Key 相同）。Key 只保存在此浏览器。': 'Введите локальный API-ключ шлюза (тот же Bearer-ключ, что для /v1). Ключ хранится только в этом браузере.',
      '解锁': 'Разблокировать',
      '请输入 Key。': 'Введите ключ.',
      '正在验证…': 'Проверка…',
      '无法连接网关，请重试。': 'Не удалось подключиться к шлюзу, попробуйте снова.',
      'WorkBuddy → OpenAI 网关': 'WorkBuddy → OpenAI-шлюз',
      '主导航': 'Основная навигация',
      '本地运行': 'локально',
      'LOCAL GATEWAY': 'ЛОКАЛЬНЫЙ ШЛЮЗ',
      '运行正常': 'Работает',
      '刷新': 'Обновить',
      '刷新当前数据': 'Обновить текущие данные',
      '尚无请求': 'Пока нет запросов',
      '网关运行 ': 'Шлюз работает ',
      '，数据每 5 秒自动刷新。': ', данные обновляются каждые 5 с.',
      '总请求': 'Всего запросов',
      '错误率': 'Ошибки',
      'P95 延迟': 'Задержка P95',
      'Token 用量': 'Токены',
      '模型调用量': 'Вызовы моделей',
      '累计请求 · 最近 200 条窗口': 'Всего · окно последних 200',
      '默认': 'по умолч.',
      '工具': 'инструменты',
      '视觉': 'зрение',
      '推理': 'рассуждения',
      '支持 ': 'Поддерживает ',
      '未提供价格': 'цена не указана',
      'MODEL CATALOG': 'КАТАЛОГ МОДЕЛЕЙ',
      ' 个模型 · 每个模型的上下文设置会应用到账号池中的所有账号。': ' моделей · настройка контекста применяется ко всем аккаунтам пула.',
      '最近 ': 'Последние ',
      ' 条请求（重启后清零）。': ' запросов (сбрасывается при рестарте).',
      '加载中…': 'Загрузка…',
      '尚无请求记录。': 'Пока нет записей.',
      '时间': 'Время',
      '请求': 'Запрос',
      '状态': 'Статус',
      'tok 入/出': 'Ток. вх/вых',
      '耗时': 'Длит.',
      '随机': 'Случайно',
      '轮询': 'По очереди',
      '可用': 'Доступен',
      '冷却中': 'Остывает',
      '不可用': 'Недоступен',
      '移除': 'Удалить',
      '账号池为空 — 使用本机凭据文件的单账号': 'Пул пуст — добавьте аккаунт ниже',
      '账号池': 'Пул аккаунтов',
      '账号池内的凭据按请求轮流使用；池为空时回落到本机凭据文件。凭据值永不显示、不落盘。': 'Учётные данные пула используются по очереди. Если пул пуст, запросы завершаются ошибкой — добавьте аккаунт ниже. Значения никогда не показываются и не сохраняются.',
      '账号池状态': 'Статус пула',
      ' 个账号 · ': ' ак. · ',
      '调度 · 401 的账号自动冷却后重试': ' · аккаунты с 401 остывают и повторяются',
      '网页登录 · 仅保存在服务内存中': 'Вход через сайт · только в памяти сервиса',
      '需要重新网页登录': 'Требуется повторный вход',
      '已导入凭据': 'Учётные данные импортированы',
      '添加账号': 'Добавить аккаунт',
      '官方网页登录': 'Вход через сайт',
      '点击后在 WorkBuddy 官方网页完成登录，网关会自动将账号加入池中。不需要安装桌面客户端，也不用复制 Token。密码和验证码只在官方页面输入。': 'Нажмите и войдите на официальном сайте WorkBuddy, шлюз сам добавит аккаунт в пул. Десктопный клиент не нужен, токен копировать не надо. Пароль и код — только на официальной странице.',
      '账号备注（可选）': 'Заметка (необязательно)',
      '例如：工作账号': 'Например: рабочий',
      '登录 WorkBuddy': 'Войти в WorkBuddy',
      '取消登录': 'Отменить вход',
      '登录结果会自动显示，无需刷新。': 'Результат входа появится автоматически, обновлять не нужно.',
      '打开官方登录页面': 'Открыть страницу входа',
      '账号会加密保存；重启网关后自动恢复，无需重新登录。': 'Аккаунт хранится в шифрованном виде и восстанавливается после рестарта, вход повторять не нужно.',
      '来源': 'Источник',
      '凭据状态': 'Статус доступа',
      '账号池为空，请登录 WorkBuddy': 'Пул пуст, войдите в WorkBuddy',
      '上游端点': 'Апстрим',
      '立即刷新': 'Обновить сейчас',
      '账号池为空，点击下方按钮登录账号。': 'Пул пуст — войдите или импортируйте аккаунт ниже.',
      '从文件导入': 'Импорт из файла',
      '从本机 WorkBuddy 凭据文件导入账号。': 'Импорт аккаунтов из локального файла учётных данных WorkBuddy.',
      '正在导入…': 'Импортирую…',
      '已导入 ': 'Импортировано ',
      ' 个账号。': ' аккаунтов.',
      '未找到可导入的账号。': 'Импортировать нечего.',
      '未找到凭据文件：': 'Файл учётных данных не найден: ',
      '无法读取凭据文件：': 'Не удалось прочитать файл учётных данных: ',
      '凭据文件格式不支持：': 'Неподдерживаемый формат файла: ',
      'Local file · UID': 'Локальный файл · UID',
      '等待恢复': 'Ожидает',
      '正在准备登录…': 'Готовлю вход…',
      '登录成功，': 'Вход успешен, ',
      ' 已加入账号池。': ' добавлен в пул.',
      '登录已超时，请重新开始。': 'Время входа истекло, начните заново.',
      '已取消登录。': 'Вход отменён.',
      '登录失败：': 'Ошибка входа: ',
      '请重试': 'попробуйте снова',
      '等待你在官方网页完成登录…': 'Ожидаю завершения входа на официальном сайте…',
      '授权已完成，正在确认账号…': 'Авторизация завершена, подтверждаю аккаунт…',
      '正在打开官方登录页': 'Открываю страницу входа',
      '正在准备 WorkBuddy 登录，请稍候。': 'Готовлю вход WorkBuddy, подождите.',
      '正在申请官方登录链接…': 'Запрашиваю ссылку для входа…',
      '请在新打开的官方网页完成登录；未弹出时点击下方链接。': 'Завершите вход на открывшейся официальной странице; если не открылась — нажмите ссылку ниже.',
      '此浏览器已有登录正在进行，请完成它或等待过期。': 'В этом браузере уже идёт вход, завершите его или дождитесь истечения.',
      '账号已登录并加入池中。': 'Аккаунт добавлен в пул.',
      '上下文': 'Контекст',
      '输入': 'Ввод',
      '输出': 'Вывод'
    },
    en: {
      '概览': 'Overview',
      '模型': 'Models',
      '请求记录': 'Requests',
      '上游与凭据': 'Upstream & credentials',
      'Key 无效，请检查后重试。': 'Invalid key, check and retry.',
      '请求失败（HTTP ': 'Request failed (HTTP ',
      '）': ')',
      ' 次 · ': ' req · ',
      ' tok': ' tok',
      '保存中…': 'Saving…',
      '保存失败': 'Save failed',
      '已保存': 'Saved',
      '已保存 · 所有账号生效': 'Saved · applies to all accounts',
      '保存失败：': 'Save failed: ',
      '服务端未确认所选档位': 'Server did not confirm the selected context tier',
      ' 小时 ': ' h ',
      ' 分': ' min',
      ' 秒': ' s',
      'Wkbdy2api 控制台': 'Wkbdy2api Console',
      '输入网关的本地 API Key（与调用 /v1 接口使用的 Bearer Key 相同）。Key 只保存在此浏览器。': 'Enter the gateway local API key (same Bearer key as for /v1). The key stays in this browser only.',
      '解锁': 'Unlock',
      '请输入 Key。': 'Enter the key.',
      '正在验证…': 'Verifying…',
      '无法连接网关，请重试。': 'Cannot reach the gateway, retry.',
      'WorkBuddy → OpenAI 网关': 'WorkBuddy → OpenAI gateway',
      '主导航': 'Primary navigation',
      '本地运行': 'local',
      'LOCAL GATEWAY': 'LOCAL GATEWAY',
      '运行正常': 'Healthy',
      '刷新': 'Refresh',
      '刷新当前数据': 'Refresh current data',
      '尚无请求': 'No requests yet',
      '网关运行 ': 'Gateway up ',
      '，数据每 5 秒自动刷新。': ', auto-refresh every 5 s.',
      '总请求': 'Total requests',
      '错误率': 'Error rate',
      'P95 延迟': 'P95 latency',
      'Token 用量': 'Token usage',
      '模型调用量': 'Model calls',
      '累计请求 · 最近 200 条窗口': 'Total · last-200 window',
      '默认': 'default',
      '工具': 'tools',
      '视觉': 'vision',
      '推理': 'reasoning',
      '支持 ': 'Supports ',
      '未提供价格': 'no price',
      'MODEL CATALOG': 'MODEL CATALOG',
      ' 个模型 · 每个模型的上下文设置会应用到账号池中的所有账号。': ' models · per-model context applies to every pool account.',
      '最近 ': 'Last ',
      ' 条请求（重启后清零）。': ' requests (cleared on restart).',
      '加载中…': 'Loading…',
      '尚无请求记录。': 'No records yet.',
      '时间': 'Time',
      '请求': 'Request',
      '状态': 'Status',
      'tok 入/出': 'tok in/out',
      '耗时': 'Duration',
      '随机': 'Random',
      '轮询': 'Round-robin',
      '可用': 'Available',
      '冷却中': 'Cooling down',
      '不可用': 'Unavailable',
      '移除': 'Remove',
      '账号池为空 — 使用本机凭据文件的单账号': 'Pool empty — add an account below',
      '账号池': 'Account pool',
      '账号池内的凭据按请求轮流使用；池为空时回落到本机凭据文件。凭据值永不显示、不落盘。': 'Pool credentials are used in rotation. If the pool is empty, requests fail with an error — add an account below. Values are never shown or stored.',
      '账号池状态': 'Pool status',
      ' 个账号 · ': ' accounts · ',
      '调度 · 401 的账号自动冷却后重试': ' · 401 accounts cool down and retry',
      '网页登录 · 仅保存在服务内存中': 'Web sign-in · kept in service memory only',
      '需要重新网页登录': 'Re-auth required',
      '已导入凭据': 'Imported credentials',
      '添加账号': 'Add account',
      '官方网页登录': 'Official website login',
      '点击后在 WorkBuddy 官方网页完成登录，网关会自动将账号加入池中。不需要安装桌面客户端，也不用复制 Token。密码和验证码只在官方页面输入。': 'Click to sign in on the official WorkBuddy website; the gateway joins the account to the pool automatically. No desktop client, no token copy. Password and code only on the official page.',
      '账号备注（可选）': 'Note (optional)',
      '例如：工作账号': 'e.g. work',
      '登录 WorkBuddy': 'Sign in with WorkBuddy',
      '取消登录': 'Cancel sign-in',
      '登录结果会自动显示，无需刷新。': 'The result appears automatically, no refresh needed.',
      '打开官方登录页面': 'Open the official sign-in page',
      '账号会加密保存；重启网关后自动恢复，无需重新登录。': 'Accounts are stored encrypted and restored after restart, no re-login.',
      '来源': 'Source',
      '凭据状态': 'Credential status',
      '账号池为空，请登录 WorkBuddy': 'Pool is empty, sign in with WorkBuddy',
      '上游端点': 'Upstream endpoint',
      '立即刷新': 'Refresh now',
      '账号池为空，点击下方按钮登录账号。': 'Pool is empty — sign in or import an account below.',
      '从文件导入': 'Import from file',
      '从本机 WorkBuddy 凭据文件导入账号。': 'Import accounts from the local WorkBuddy credential file.',
      '正在导入…': 'Importing…',
      '已导入 ': 'Imported ',
      ' 个账号。': ' accounts.',
      '未找到可导入的账号。': 'Nothing to import.',
      '未找到凭据文件：': 'Credential file not found: ',
      '无法读取凭据文件：': 'Cannot read the credential file: ',
      '凭据文件格式不支持：': 'Unsupported credential file format: ',
      '等待恢复': 'Pending recovery',
      '正在准备登录…': 'Preparing sign-in…',
      '登录成功，': 'Signed in, ',
      ' 已加入账号池。': ' joined the pool.',
      '登录已超时，请重新开始。': 'Sign-in expired, start over.',
      '已取消登录。': 'Sign-in cancelled.',
      '登录失败：': 'Sign-in failed: ',
      '请重试': 'retry',
      '等待你在官方网页完成登录…': 'Waiting for you to finish signing in…',
      '授权已完成，正在确认账号…': 'Authorized, confirming the account…',
      '正在打开官方登录页': 'Opening the official sign-in page',
      '正在准备 WorkBuddy 登录，请稍候。': 'Preparing WorkBuddy sign-in, wait.',
      '正在申请官方登录链接…': 'Requesting the official sign-in link…',
      '请在新打开的官方网页完成登录；未弹出时点击下方链接。': 'Finish signing in on the opened official page; if none opened, click the link below.',
      '此浏览器已有登录正在进行，请完成它或等待过期。': 'A sign-in is already pending in this browser, finish it or wait for expiry.',
      '账号已登录并加入池中。': 'Account signed in and joined the pool.',
      '上下文': 'Context',
      '输入': 'Input',
      '输出': 'Output'
    }
  };

  function tr(s) {
    if (state.lang === 'zh') return s;
    var d = I18N[state.lang] || I18N.en;
    return d[s] !== undefined ? d[s] : s;
  }

  function localize(html) {
    if (!html || state.lang === 'zh') return html;
    var d = I18N[state.lang] || I18N.en;
    var keys = Object.keys(d).sort(function (a, b) { return b.length - a.length; });
    var out = html;
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (out.indexOf(k) < 0) continue;
      out = out.split(k).join(d[k]);
    }
    return out;
  }

  function langLocale() { return state.lang === 'en' ? 'en-US' : state.lang === 'zh' ? 'zh-CN' : 'ru-RU'; }

  function langSeg() {
    function b(v, label) {
      return '<button class="seg-btn lang-btn' + (state.lang === v ? ' active' : '') + '" data-lang="' + v + '" aria-pressed="' + (state.lang === v) + '">' + label + '</button>';
    }
    return '<div class="seg lang-seg" role="group" aria-label="Language">' + b('ru', 'RU') + b('en', 'EN') + b('zh', '中文') + '</div>';
  }

  function setLang(l) {
    if (l !== 'ru' && l !== 'en' && l !== 'zh') l = 'en';
    if (state.lang === l) return;
    state.lang = l;
    try { localStorage.setItem(LANG_STORAGE, l); } catch (e) {}
    try { document.documentElement.lang = l === 'zh' ? 'zh-CN' : l; } catch (e) {}
    render();
  }

  function wireLang() {
    var btns = document.querySelectorAll('.lang-btn');
    for (var i = 0; i < btns.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function () { setLang(btn.getAttribute('data-lang')); });
      })(btns[i]);
    }
  }

  // ---------- icons (inline, 16px, stroke-based) ----------
  var icons = {
    overview: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="8" cy="8" r="6.2"/><path d="M8 4.6v3.6l2.3 1.4"/></svg>',
    models: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="2.2" y="2.7" width="11.6" height="4" rx="1.2"/><rect x="2.2" y="9.3" width="11.6" height="4" rx="1.2"/><path d="M4.4 4.7h.01M4.4 11.3h.01"/></svg>',
    requests: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 4.2h11M2.5 8h11M2.5 11.8h7"/></svg>',
    upstream: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13.2 6.4a5.2 5.2 0 1 0-1.6 5.1"/><path d="M13.4 2.9v3.6h-3.6"/></svg>',
  };

  function navLabel(v) {
    return { overview: '概览', models: '模型', requests: '请求记录', upstream: '上游与凭据' }[v];
  }

  // ---------- data ----------
  function api(path, opts) {
    opts = opts || {};
    var headers = Object.assign({}, opts.headers, { 'Authorization': 'Bearer ' + state.key });
    return fetch('/admin/api/' + path, Object.assign({}, opts, { headers: headers, credentials: 'same-origin' })).then(function (res) {
      return res.json().then(function (body) {
        if (res.status === 401 && body.error && body.error.code === 'invalid_api_key') {
          try { localStorage.removeItem(KEY_STORAGE); } catch (e) {}
          state.key = null;
          state.overview = null;
          state.unlockError = tr('Key 无效，请检查后重试。');
          clearTimeout(state.oauthTimer);
          state.oauth = null;
          state.oauthUrl = '';
          stopTimer();
          render();
        }
        if (!res.ok) {
          var error = new Error(body.error && body.error.message || (tr('请求失败（HTTP ') + res.status + tr('）')));
          error.code = body.error && body.error.code;
          error.path = body.error && body.error.param;
          throw error;
        }
        return body;
      });
    });
  }

  function refreshOverview() {
    if (state.overviewPending) return Promise.resolve();
    state.overviewPending = true;
    var revision = contextRevision;
    return api('overview').then(function (d) {
      if (state.overview && (contextPending.size || revision !== contextRevision)) {
        d.pool.context_window = state.overview.pool.context_window;
      }
      state.overview = d;
      if (!$('#main')) return;
      if (!$('#main').firstElementChild) renderMain();
      else if (state.view === 'overview') patchOverview(d);
      else if (state.view === 'upstream') patchAccountPool(d);
    }).finally(function () { state.overviewPending = false; });
  }

  /** In-place update of overview numbers/bars — never rebuilds the section. */
  function patchOverview(d) {
    if (!$('#stat-total') || !$('#stat-errors')) { renderMain(); return; } // not built yet → full render
    var s = d.stats;
    function set(id, text, cls) {
      var el = $('#' + id);
      if (!el) return;
      el.textContent = text;
      el.className = 'stat-value' + (cls ? ' ' + cls : '');
    }
    set('stat-total', fmtInt(s.total_requests));
    set('stat-errors', fmtPct(s.error_rate), s.error_rate > 0.05 ? 'bad' : 'ok');
    set('stat-p95', fmtMs(s.p95_ms));
    set('stat-tokens', fmtInt(s.tokens.prompt + s.tokens.completion));

    var rows = document.querySelectorAll('[data-mkey]');
    if (rows.length !== s.per_model.length) { renderMain(); return; } // shape changed → rebuild once
    var max = 0;
    s.per_model.forEach(function (m) { if (m.count > max) max = m.count; });
    s.per_model.forEach(function (m) {
      var row = document.querySelector('[data-mkey="' + m.model + '"]');
      if (!row) return;
      var fill = row.querySelector('.bar-fill');
      var val = row.querySelector('.row-value');
      if (fill) fill.style.width = (max ? Math.round(m.count / max * 100) : 0) + '%';
      if (val) val.textContent = fmtInt(m.count) + tr(' 次 · ') + fmtInt(m.tokens) + tr(' tok');
    });
  }

  function startTimer() {
    stopTimer();
    state.timer = setInterval(function () { refreshOverview().catch(function () {}); }, 5000);
  }
  function stopTimer() { if (state.timer) { clearInterval(state.timer); state.timer = null; } }

  // ---------- formatting ----------
  function fmtInt(n) { return (n || 0).toLocaleString(); }
  function fmtPct(x) { return (x * 100).toFixed(1) + '%'; }
  function fmtMs(n) { return n == null ? '—' : (n >= 1000 ? (n / 1000).toFixed(1) + ' s' : Math.round(n) + ' ms'); }
  function fmtContextLength(n) {
    return n >= 1000000 ? (n / 1000000).toFixed(n % 1000000 ? 1 : 0) + 'M' : Math.round(n / 1000) + 'K';
  }
  function setContextForModel(select) {
    var model = select.getAttribute('data-context-model');
    if (contextPending.has(model)) return;
    var value = Number(select.value);
    var previous = select.dataset.savedValue;
    var stateText = document.getElementById('context-save-state-' + model);
    contextPending.add(model);
    contextRevision++;
    select.disabled = true;
    if (stateText) stateText.textContent = tr('保存中…');
    api('context-window', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model_id: model, context_window: value }),
    }).then(function (result) {
      if (!result.ok || result.model_id !== model || result.context_window !== value) throw new Error(tr('服务端未确认所选档位'));
      if (state.overview) {
        var settings = Object.assign({}, state.overview.pool.context_window || {});
        settings[model] = result.context_window;
        state.overview.pool.context_window = settings;
      }
      select.dataset.savedValue = String(result.context_window);
      if (stateText) stateText.textContent = tr('已保存 · 所有账号生效');
    }).catch(function (error) {
      select.value = previous;
      if (stateText) stateText.textContent = tr('保存失败：') + error.message;
    }).finally(function () {
      contextPending.delete(model);
      contextRevision++;
      if (state.view === 'models') {
        document.querySelectorAll('.context-select').forEach(function (current) {
          if (current.getAttribute('data-context-model') !== model) return;
          current.disabled = false;
          var settings = state.overview && state.overview.pool.context_window || {};
          current.value = String(Object.prototype.hasOwnProperty.call(settings, model) ? settings[model] : previous);
          current.dataset.savedValue = current.value;
        });
        var currentStatus = document.getElementById('context-save-state-' + model);
        if (currentStatus && stateText) currentStatus.textContent = stateText.textContent;
      }
      select.disabled = false;
    });
  }

  function wireContextSelectors() {
    document.querySelectorAll('.context-select').forEach(function (select) {
      var model = select.getAttribute('data-context-model');
      select.dataset.savedValue = select.value;
      select.disabled = contextPending.has(model);
      select.addEventListener('change', function () { setContextForModel(select); });
    });
  }

  function fmtUptime(ms) {
    var s = Math.floor(ms / 1000);
    var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
    return h > 0 ? h + tr(' 小时 ') + m + tr(' 分') : m + tr(' 分') + ' ' + (s % 60) + tr(' 秒');
  }
  function fmtTime(ts) {
    var d = new Date(ts);
    return d.toLocaleTimeString(langLocale(), { hour12: false }) + '.' + String(d.getMilliseconds()).padStart(3, '0');
  }
  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // ---------- views ----------
  function render() {
    var app = $('#app');
    if (!state.key) { app.innerHTML = localize(unlockView()); wireUnlock(); wireLang(); return; }
    app.innerHTML = localize(shellView());
    wireNav();
    wireLang();
    renderMain();
  }

  function unlockView() {
    return '<div class="unlock">' +
      '<div class="unlock-lang">' + langSeg() + '</div>' +
      '<h2>Wkbdy2api 控制台</h2>' +
      '<p>输入网关的本地 API Key（与调用 /v1 接口使用的 Bearer Key 相同）。Key 只保存在此浏览器。</p>' +
      '<input class="key-input" id="key-input" type="password" placeholder="wkb2api-local-key…" autocomplete="off">' +
      '<div class="key-error" id="key-error">' + (state.unlockError || '') + '</div>' +
      '<button class="btn" id="key-submit" style="width:100%">解锁</button>' +
      '</div>';
  }

  function wireUnlock() {
    var input = $('#key-input'), btn = $('#key-submit'), err = $('#key-error');
    function submit() {
      var v = input.value.trim();
      if (!v) { err.textContent = tr('请输入 Key。'); return; }
      if (btn.disabled) return;
      state.key = v;
      state.overview = null;
      state.unlockError = null;
      btn.disabled = true;
      btn.textContent = tr('正在验证…');
      refreshOverview().then(function () {
        try { localStorage.setItem(KEY_STORAGE, v); } catch (e) {}
        render();
        startTimer();
      }).catch(function () {
        state.key = null;
        state.overview = null;
        state.unlockError = state.unlockError || tr('无法连接网关，请重试。');
        render();
      });
    }
    btn.addEventListener('click', submit);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });
    input.focus();
  }

  function shellView() {
    var items = ['overview', 'models', 'requests', 'upstream'].map(function (v) {
      return '<button class="nav-item" data-view="' + v + '"' +
        (state.view === v ? ' aria-current="true"' : '') + '>' + icons[v] + '<span>' + navLabel(v) + '</span></button>';
    }).join('');
    return '<div class="shell">' +
      '<aside class="sidebar">' +
      '<div class="brand"><span class="brand-dot" id="health-dot"></span><div><h1>Wkbdy2api</h1><small>WorkBuddy → OpenAI 网关</small></div></div>' +
      '<nav class="nav" aria-label="主导航">' + items + '</nav>' +
      '<div class="sidebar-footer">v' + escapeHtml(state.overview ? state.overview.version : '') + ' · 本地运行</div>' +
      '</aside><div class="app-content"><header class="app-toolbar"><div><div class="eyebrow">LOCAL GATEWAY</div><div class="toolbar-title" id="toolbar-title">' + escapeHtml(navLabel(state.view)) + '</div></div><div class="toolbar-actions"><span class="toolbar-status"><span class="status-dot"></span>运行正常</span>' + langSeg() + '<button class="btn secondary toolbar-refresh" id="toolbar-refresh" aria-label="刷新当前数据">刷新</button></div></header><main class="main" id="main"></main></div></div>';
  }

  function renderMain() {
    var main = $('#main');
    if (!main || !state.overview) return;
    var d = state.overview;
    var dot = $('#health-dot');
    if (dot) dot.classList.toggle('down', d.credential.ok === false && !(d.pool && d.pool.accounts.some(function (a) { return a.ok; })));

    if (state.view === 'overview') main.innerHTML = localize(viewOverview(d));
    else if (state.view === 'models') { main.innerHTML = localize(viewModels(d)); wireContextSelectors(); }
    else if (state.view === 'requests') { main.innerHTML = localize(viewRequestsShell()); loadRequests(); }
    else if (state.view === 'upstream') {
      main.innerHTML = localize(viewUpstream(d));
      wireLoginForm();
      wireImport();
      updateOAuthView();
    }
  }

  function statTile(label, value, cls, id) {
    var idAttr = id ? ' id="' + id + '"' : '';
    return '<div class="stat"><div class="stat-label">' + label + '</div><div class="stat-value ' + (cls || '') + '"' + idAttr + '>' + value + '</div></div>';
  }

  function viewOverview(d) {
    var s = d.stats;
    var maxCount = 0;
    s.per_model.forEach(function (m) { if (m.count > maxCount) maxCount = m.count; });
    var modelRows = s.per_model.length === 0
      ? '<div class="row"><div class="row-main"><div class="row-title muted" style="color:var(--text-tertiary)">尚无请求</div></div></div>'
      : s.per_model.map(function (m) {
        return '<div class="row" data-mkey="' + escapeHtml(m.model) + '">' +
          '<div class="row-main"><div class="row-title">' + escapeHtml(m.model) + '</div>' +
          '<div class="bar-track"><div class="bar-fill" style="width:' + (maxCount ? Math.round(m.count / maxCount * 100) : 0) + '%"></div></div></div>' +
          '<div class="row-value">' + fmtInt(m.count) + ' 次 · ' + fmtInt(m.tokens) + ' tok</div></div>';
      }).join('');

    return '<section class="section"><h2>概览</h2>' +
      '<p class="page-sub">网关运行 ' + fmtUptime(s.uptime_ms) + '，数据每 5 秒自动刷新。</p>' +
      '<div class="stat-grid">' +
      statTile('总请求', fmtInt(s.total_requests), '', 'stat-total') +
      statTile('错误率', fmtPct(s.error_rate), s.error_rate > 0.05 ? 'bad' : 'ok', 'stat-errors') +
      statTile('P95 延迟', fmtMs(s.p95_ms), '', 'stat-p95') +
      statTile('Token 用量', fmtInt(s.tokens.prompt + s.tokens.completion), '', 'stat-tokens') +
      '</div>' +
      '<div class="card"><div class="card-header"><h3 class="card-title">模型调用量</h3><span class="card-note">累计请求 · 最近 200 条窗口</span></div>' +
      '<div class="rows">' + modelRows + '</div></div>' +
      '</section>';
  }

  function viewModels(d) {
    var contextOptions = [];
    d.models.forEach(function (m) {
      var lengths = m.x_workbuddy && m.x_workbuddy.context_window && m.x_workbuddy.context_window.supportedLengths || [];
      lengths.forEach(function (length) { if (Number.isInteger(length) && length > 0 && contextOptions.indexOf(length) < 0) contextOptions.push(length); });
    });
    contextOptions.sort(function (a, b) { return a - b; });
    var globalPicker = '';
    var rows = d.models.map(function (m) {
      var x = m.x_workbuddy || {};
      var tags = [];
      if (x.is_default) tags.push('<span class="pill neutral">默认</span>');
      if (x.supports_tool_call) tags.push('<span class="pill neutral">工具</span>');
      if (x.supports_images) tags.push('<span class="pill neutral">视觉</span>');
      if (x.supports_reasoning) tags.push('<span class="pill neutral">推理</span>');
      var maxIn = x.max_input_tokens ? (x.max_input_tokens >= 1000000 ? (x.max_input_tokens / 1000000) + 'M' : Math.round(x.max_input_tokens / 1000) + 'K') : '—';
      var maxOut = x.max_output_tokens ? (x.max_output_tokens >= 1000 ? Math.round(x.max_output_tokens / 1000) + 'K' : x.max_output_tokens) : '—';
      var cw = x.context_window || {};
      var lengths = Array.isArray(cw.supportedLengths) ? cw.supportedLengths.filter(function (length) { return Number.isInteger(length) && length > 0; }).sort(function (a, b) { return a - b; }) : [];
      var selectedContext = lengths.indexOf(d.pool && d.pool.context_window && d.pool.context_window[m.id]) >= 0 ? d.pool.context_window[m.id] : lengths[lengths.length - 1];
      if (lengths.indexOf(selectedContext) < 0 && lengths.length) selectedContext = lengths[lengths.length - 1];
      var context = lengths.length > 1 ? '<div class="model-context"><span>支持 ' + lengths.map(fmtContextLength).join(' / ') + '</span><label class="context-picker">上下文<select class="context-select" data-context-model="' + escapeHtml(m.id) + '">' + lengths.map(function (length) { return '<option value="' + length + '"' + (length === selectedContext ? ' selected' : '') + '>' + fmtContextLength(length) + '</option>'; }).join('') + '</select><span class="save-state" id="context-save-state-' + escapeHtml(m.id) + '" aria-live="polite"></span></label></div>' : '';
      var credits = x.credits ? '<span class="price">' + escapeHtml(x.credits) + ' <small>Credits</small></span>' : '<span class="price muted">未提供价格</span>';
      return '<article class="model-card"><div class="model-card-main"><div class="model-heading"><div class="model-name">' + escapeHtml(x.name || m.id) + '</div>' + credits + '</div><div class="model-id">' + escapeHtml(m.id) + '</div><div class="model-tags">' + tags.join('') + '</div>' + context + '</div><div class="model-limits"><div><span>输入</span><strong>' + maxIn + '</strong></div><div><span>输出</span><strong>' + maxOut + '</strong></div></div></article>';
    }).join('');
    return '<section class="section"><div class="view-header"><div><div class="eyebrow">MODEL CATALOG</div><h2>模型</h2><p class="page-sub">' + d.models.length + ' 个模型 · 每个模型的上下文设置会应用到账号池中的所有账号。</p></div></div><div class="model-list">' + rows + '</div></section>';
  }

  function viewRequestsShell() {
    return '<section class="section"><h2>请求记录</h2>' +
      '<p class="page-sub">最近 ' + 200 + ' 条请求（重启后清零）。</p>' +
      '<div class="card log-scroll" id="req-card"><div id="req-body" class="muted" style="color:var(--text-tertiary);padding:16px 18px;font-size:13px">加载中…</div></div></section>';
  }

  function loadRequests() {
    api('requests').then(function (d) {
      var body = $('#req-body');
      if (!body) return;
      if (!d.recent || d.recent.length === 0) {
        body.innerHTML = localize('尚无请求记录。');
        return;
      }
      var trs = d.recent.map(function (r) {
        var st = '<span class="muted">' + r.status + '</span>';
        if (r.status >= 500) st = '<span style="color:var(--error);font-weight:600">' + r.status + '</span>';
        else if (r.status >= 400) st = '<span style="color:var(--warn);font-weight:600">' + r.status + '</span>';
        else if (r.status < 300) st = '<span style="color:var(--ok);font-weight:600">' + r.status + '</span>';
        var tok = (r.prompt_tokens || r.completion_tokens) ? (r.prompt_tokens || 0) + ' / ' + (r.completion_tokens || 0) : '<span class="muted">—</span>';
        return '<tr><td>' + fmtTime(r.time) + '</td><td class="path">' + escapeHtml(r.method + ' ' + r.path) +
          (r.model ? ' <span class="muted">· ' + escapeHtml(r.model) + (r.stream ? ' · stream' : '') + '</span>' : '') + '</td>' +
          '<td>' + st + '</td><td>' + tok + '</td><td>' + fmtMs(r.duration_ms) + '</td></tr>';
      }).join('');
      $('#req-card').innerHTML = localize('<table><thead><tr><th>时间</th><th>请求</th><th>状态</th><th>tok 入/出</th><th>耗时</th></tr></thead><tbody>' + trs + '</tbody></table>');
    }).catch(function () {});
  }

  function viewUpstream(d) {
    var c = d.credential;
    var u = d.upstream;
    var pool = d.pool || { size: 0, strategy: 'round-robin', accounts: [] };
    var stratName = pool.strategy === 'random' ? '随机' : '轮询';

    var acctRows = pool.accounts.map(function (a) {
      return '<div class="row">' +
        '<div class="row-main"><div class="row-title">' + escapeHtml(a.label) + (a.note ? ' · ' + escapeHtml(a.note) : '') + '</div>' +
        '<div class="row-sub">' + escapeHtml(a.detail) + '</div></div>' +
        '<span class="pill ' + (a.ok ? 'ok' : 'warn') + '">' + (a.ok ? '可用' : '冷却中') + '</span>' +
        '<button class="btn secondary acct-remove" data-label="' + escapeHtml(a.label) + '" style="padding:4px 10px;font-size:12px">移除</button>' +
        '</div>';
    }).join('');
    if (pool.size === 0) {
      acctRows = '<div class="row"><div class="row-main"><div class="row-title" style="color:var(--text-tertiary)">账号池为空 — 使用本机凭据文件的单账号</div></div></div>';
    }

    var isRR = pool.strategy === 'round-robin';
    return '<section class="section"><h2>上游与凭据</h2>' +
      '<p class="page-sub">账号池内的凭据按请求轮流使用；池为空时回落到本机凭据文件。凭据值永不显示、不落盘。</p>' +
      '<div class="card"><div class="card-header"><h3 class="card-title">账号池</h3>' +
      '<div class="controls">' +
      '<div class="seg" role="tablist"><button class="seg-btn' + (isRR ? ' active' : '') + '" data-strategy="round-robin" role="tab" aria-selected="' + isRR + '">轮询</button>' +
      '<button class="seg-btn' + (!isRR ? ' active' : '') + '" data-strategy="random" role="tab" aria-selected="' + !isRR + '">随机</button></div>' +
      '</div></div>' +
      '<div class="rows" id="acct-rows">' + acctRows + '</div>' +
      (pool.size === 0
        ? ''
        : '<div class="card-footer"><div class="footer-note">' + pool.size + ' 个账号 · ' + stratName + '调度 · 401 的账号自动冷却后重试</div></div>') +
      '</div>' +
      '<div class="card"><div class="card-header"><h3 class="card-title">添加账号</h3><span class="card-note">官方网页登录</span></div>' +
      '<div class="login-form">' +
      '<p class="form-hint">点击后在 WorkBuddy 官方网页完成登录，网关会自动将账号加入池中。不需要安装桌面客户端，也不用复制 Token。密码和验证码只在官方页面输入。</p>' +
      '<label class="form-label" for="oauth-note">账号备注（可选）</label><input class="key-input" id="oauth-note" maxlength="64" placeholder="例如：工作账号">' +
      '<div class="controls"><button class="btn" id="oauth-start">登录 WorkBuddy</button><button class="btn secondary" id="oauth-cancel" hidden>取消登录</button></div>' +
      '<p class="form-hint" id="oauth-status" role="status" aria-live="polite">登录结果会自动显示，无需刷新。</p>' +
      '<a id="oauth-link" class="form-hint" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer" hidden>打开官方登录页面</a>' +
      '<p class="form-hint">账号会加密保存；重启网关后自动恢复，无需重新登录。</p>' +
      '</div>' +
      '<div class="controls" style="margin-top:12px"><button class="btn secondary" id="local-import">从文件导入</button></div>' +
      '<p class="form-hint" id="local-import-status" role="status" aria-live="polite">从本机 WorkBuddy 凭据文件导入账号。</p>' +
      '</div>' +
      '<div class="card"><div class="card-header"><h3 class="card-title">账号池状态</h3><span class="pill ' + (c.ok ? 'ok' : 'error') + '">' + (c.ok ? '可用' : '不可用') + '</span></div>' +
      '<div class="rows">' +
      '<div class="row"><div class="row-main"><div class="row-title">来源</div></div><div class="row-value">' + escapeHtml(c.source) + '</div></div>' +
      '<div class="row"><div class="row-main"><div class="row-title">凭据状态</div><div class="row-sub">' + escapeHtml(c.ok ? c.detail : '账号池为空，请登录 WorkBuddy') + '</div></div></div>' +
      '</div></div>' +
      '<div class="card"><div class="card-header"><h3 class="card-title">上游端点</h3></div><div class="rows">' +
      '<div class="row"><div class="row-main"><div class="row-title">URL</div></div><div class="row-value" style="font-family:ui-monospace,Consolas,monospace;font-size:12px">' + escapeHtml(u.url) + '</div></div>' +
      '<div class="row"><div class="row-main"><div class="row-title">User-Agent</div></div><div class="row-value" style="font-family:ui-monospace,Consolas,monospace;font-size:12px">' + escapeHtml(u.user_agent) + '</div></div>' +
      '</div></div>' +
      '<div class="controls"><button class="btn" id="refresh-now">立即刷新</button></div>' +
      '</section>';
  }

  // ---------- nav wiring ----------
  function wireNav() {
    document.querySelectorAll('.nav-item').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.view = btn.getAttribute('data-view');
        var title = $('#toolbar-title');
        if (title) title.textContent = tr(navLabel(state.view));
        document.querySelectorAll('.nav-item').forEach(function (b) {
          b.setAttribute('aria-current', b === btn ? 'true' : 'false');
        });
        renderMain();
      });
    });
    var rf = $('#refresh-now');
    if (rf) rf.addEventListener('click', function () { refreshOverview().catch(function () {}); });
    var refreshBtn = $('#toolbar-refresh');
    if (refreshBtn) refreshBtn.addEventListener('click', function () { refreshOverview().catch(function () {}); });
  }

  function patchAccountPool(d) {
    var rows = $('#acct-rows');
    if (!rows) return;
    var accounts = d.pool.accounts;
    var html = accounts.map(function (a) {
      return '<div class="row"><div class="row-main"><div class="row-title">' + escapeHtml(a.label) + (a.note ? ' · ' + escapeHtml(a.note) : '') + '</div><div class="row-sub">' + escapeHtml(a.detail) + '</div></div><span class="pill ' + (a.ok ? 'ok' : 'warn') + '">' + (a.ok ? '可用' : '等待恢复') + '</span><button class="btn secondary acct-remove" data-label="' + escapeHtml(a.label) + '">移除</button></div>';
    }).join('') || '<div class="row"><div class="row-title">账号池为空，点击下方按钮登录账号。</div></div>';
    if (rows.dataset.snapshot !== html) { rows.innerHTML = localize(html); rows.dataset.snapshot = html; }
    document.querySelectorAll('[data-strategy]').forEach(function (button) {
      var selected = button.dataset.strategy === d.pool.strategy;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-selected', String(selected));
    });
  }

  function updateOAuthView() {
    var start = $('#oauth-start'), cancel = $('#oauth-cancel'), status = $('#oauth-status'), link = $('#oauth-link');
    if (!start) return;
    start.disabled = state.oauthBusy || !!state.oauth;
    start.textContent = state.oauthBusy ? tr('正在准备登录…') : tr('登录 WorkBuddy');
    cancel.hidden = !state.oauth;
    status.textContent = state.oauthMessage || tr('登录结果会自动显示，无需刷新。');
    link.hidden = !state.oauthUrl;
    if (state.oauthUrl) link.href = state.oauthUrl;
    else link.removeAttribute('href');
  }

  function pollOAuth() {
    if (!state.oauth) return;
    var id = state.oauth;
    api('oauth/' + id + '/status').then(function (result) {
      if (state.oauth !== id) return;
      if (result.status === 'completed') {
        state.oauth = null;
        state.oauthUrl = '';
        state.oauthMessage = tr('登录成功，') + result.account_label + tr(' 已加入账号池。');
        updateOAuthView();
        return refreshOverview();
      }
      if (['failed', 'expired', 'cancelled'].indexOf(result.status) >= 0) {
        state.oauth = null;
        state.oauthUrl = '';
        state.oauthMessage = result.status === 'expired' ? tr('登录已超时，请重新开始。') : result.status === 'cancelled' ? tr('已取消登录。') : tr('登录失败：') + (result.error || tr('请重试'));
      } else {
        state.oauthMessage = result.status === 'pending' ? tr('等待你在官方网页完成登录…') : tr('授权已完成，正在确认账号…');
        state.oauthTimer = setTimeout(pollOAuth, 1500);
      }
      updateOAuthView();
    }).catch(function (error) {
      if (state.oauth !== id) return;
      state.oauth = null;
      state.oauthUrl = '';
      state.oauthMessage = error.message;
      updateOAuthView();
    });
  }

  function setImportStatus(text) {
    var el = $('#local-import-status');
    if (el) el.textContent = text;
  }

  function importErrorText(error) {
    var path = error.path || '';
    if (error.code === 'local_import_file_not_found') return tr('未找到凭据文件：') + path;
    if (error.code === 'local_import_read_error') return tr('无法读取凭据文件：') + path;
    if (error.code === 'local_import_format_error') return tr('凭据文件格式不支持：') + path;
    return error.message;
  }

  function wireImport() {
    var btn = $('#local-import');
    if (!btn) return;
    btn.addEventListener('click', function () {
      if (state.importBusy) return;
      state.importBusy = true;
      btn.disabled = true;
      setImportStatus(tr('正在导入…'));
      api('accounts/import-local', { method: 'POST' }).then(function (result) {
        setImportStatus(result.imported > 0 ? tr('已导入 ') + result.imported + tr(' 个账号。') : tr('未找到可导入的账号。'));
        return refreshOverview();
      }).catch(function (error) {
        setImportStatus(importErrorText(error));
      }).finally(function () {
        state.importBusy = false;
        btn.disabled = false;
      });
    });
  }

  function wireLoginForm() {
    var start = $('#oauth-start');
    if (!start) return;
    start.addEventListener('click', function () {
      if (state.oauthBusy || state.oauth) return;
      var popup = window.open('about:blank', '_blank');
      if (popup) {
        popup.opener = null;
        popup.document.title = tr('正在打开官方登录页');
        popup.document.body.textContent = tr('正在准备 WorkBuddy 登录，请稍候。');
        var meta = popup.document.createElement('meta');
        meta.name = 'referrer'; meta.content = 'no-referrer'; popup.document.head.appendChild(meta);
      }
      state.oauthBusy = true;
      state.oauthMessage = tr('正在申请官方登录链接…');
      updateOAuthView();
      var note = $('#oauth-note').value.trim();
      api('oauth/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ note: note || undefined }) }).then(function (result) {
        state.oauth = result.id;
        state.oauthUrl = result.authorization_url;
        state.oauthMessage = tr('请在新打开的官方网页完成登录；未弹出时点击下方链接。');
        if (popup && !popup.closed) popup.location.replace(result.authorization_url);
        clearTimeout(state.oauthTimer);
        state.oauthTimer = setTimeout(pollOAuth, 1500);
      }).catch(function (error) {
        if (popup && !popup.closed) popup.close();
        state.oauthMessage = error.code === 'oauth_already_pending' ? tr('此浏览器已有登录正在进行，请完成它或等待过期。') : error.message;
      }).finally(function () { state.oauthBusy = false; updateOAuthView(); });
    });
    $('#oauth-cancel').addEventListener('click', function () {
      var id = state.oauth;
      if (!id) return;
      api('oauth/' + id + '/cancel', { method: 'POST' }).then(function (result) {
        if (state.oauth !== id) return;
        clearTimeout(state.oauthTimer);
        state.oauth = null; state.oauthUrl = '';
        state.oauthMessage = result.status === 'completed' ? tr('账号已登录并加入池中。') : tr('已取消登录。');
        updateOAuthView();
        return refreshOverview();
      }).catch(function (error) { state.oauthMessage = error.message; updateOAuthView(); });
    });
    $('#acct-rows').addEventListener('click', function (event) {
      var button = event.target.closest('.acct-remove');
      if (!button) return;
      api('accounts/remove', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ label: button.dataset.label }) })
        .then(refreshOverview).catch(function (error) { state.oauthMessage = error.message; updateOAuthView(); });
    });
    document.querySelectorAll('.seg-btn').forEach(function (button) {
      button.addEventListener('click', function () {
        api('strategy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ strategy: button.dataset.strategy }) })
          .then(refreshOverview).catch(function (error) { state.oauthMessage = error.message; updateOAuthView(); });
      });
    });
    $('#refresh-now').addEventListener('click', function () { refreshOverview().catch(function () {}); });
  }

  // ---------- boot ----------
  var savedLang = null;
  try { savedLang = localStorage.getItem(LANG_STORAGE); } catch (e) {}
  if (savedLang === 'en' || savedLang === 'zh' || savedLang === 'ru') state.lang = savedLang;
  try { document.documentElement.lang = state.lang === 'zh' ? 'zh-CN' : state.lang; } catch (e) {}
  var saved = null;
  try { saved = localStorage.getItem(KEY_STORAGE); } catch (e) {}
  if (saved) {
    state.key = saved;
    refreshOverview().then(function () { if (state.overview) startTimer(); }).catch(function () {});
  }
  render();
})();
</script>
</body>
</html>`;
}

#!/usr/bin/env node
// Build script for playwright-course/docs-html/
// Renders each module's README.md (and M00 sub-lessons) into a self-contained .html
// using the design system documented in _design-system.md. No external runtime deps.
//
// Usage:  pnpm docs:build

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const HERE = dirname(fileURLToPath(import.meta.url));
const COURSE = resolve(HERE, "..");

// ─── Module manifest ───────────────────────────────────────────────────────
// Order matters: drives prev/next + index ordering.

const MODULES = [
  {
    id: "m00",
    num: "00",
    title: "Git esencial",
    duration: "30-45 min",
    piece: "Habilidad mínima de Git para versionar tu suite — config, init, status, add, commit, .gitignore, log",
    accent: "#ea580c",
    source: "modulo-00-git-esencial/README.md",
    children: [
      { id: "m00-01-config",         num: "00.1", title: "Configuración + 3 estados",   source: "modulo-00-git-esencial/01-config-y-3-estados.md" },
      { id: "m00-02-init-add-commit", num: "00.2", title: "init, add, commit",            source: "modulo-00-git-esencial/02-init-add-commit.md" },
      { id: "m00-03-gitignore",       num: "00.3", title: ".gitignore para Playwright",   source: "modulo-00-git-esencial/03-gitignore-playwright.md" },
      { id: "m00-04-log",             num: "00.4", title: "git log básico",               source: "modulo-00-git-esencial/04-log-basico.md" },
    ],
  },
  { id: "m01", num: "01", title: "Smoke feo",        duration: "60-90 min", accent: "#d97706", source: "modulo-01-smoke-feo/README.md",          piece: "Primer test E2E sin abstracciones — sólo Playwright + OmniPizza" },
  { id: "m02", num: "02", title: "Locators & data",  duration: "60-90 min", accent: "#059669", source: "modulo-02-locators-data/README.md",       piece: "Locators robustos + data-driven con JSON" },
  { id: "m03", num: "03", title: "POM",              duration: "60-90 min", accent: "#7c3aed", source: "modulo-03-pom/README.md",                 piece: "Page Object Model: BasePage + 3 páginas reales" },
  { id: "m04", num: "04", title: "Setup & fixtures", duration: "60-90 min", accent: "#0d9488", source: "modulo-04-setup-fixtures/README.md",      piece: "Setup project con storageState + fixtures de OmniPizza" },
  { id: "m05", num: "05", title: "API layer",        duration: "60-90 min", accent: "#e11d48", source: "modulo-05-api-layer/README.md",           piece: "Capa de servicios HTTP reutilizable para tests UI y API" },
  { id: "m06", num: "06", title: "CI/CD + debugging", duration: "40-50 min", accent: "#4f46e5", source: "modulo-06-ci-debugging/README.md",        piece: "GitHub Actions con matrix por browser + traces como artefactos" },
  { id: "m07", num: "07", title: "IA + Playwright MCP", duration: "45-60 min", accent: "#c026d3", source: "modulo-07-ia-mcp/README.md",            piece: "Asistente de IA que controla el browser real vía Playwright MCP" },
];

// Flatten module + sublessons into a single nav list for prev/next.
const NAV = [];
for (const m of MODULES) {
  NAV.push(m);
  if (m.children) for (const c of m.children) NAV.push({ ...c, parent: m.id, accent: m.accent });
}

// Map source path -> output HTML basename, for rewriting intra-doc .md links.
const SOURCE_TO_OUTPUT = new Map();
for (const item of NAV) {
  if (item.source) SOURCE_TO_OUTPUT.set(item.source, `${item.id}.html`);
}

// ─── Marked configuration ──────────────────────────────────────────────────

marked.setOptions({
  gfm: true,
  breaks: false,
  pedantic: false,
});

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9áéíóúñü\s-]/gi, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function escapeHTMLCode(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

marked.use({
  renderer: {
    blockquote(token) {
      const inner = this.parser.parse(token.tokens || []);
      const probe = inner.replace(/<[^>]+>/g, "").trim();
      if (probe.startsWith("💡")) return `<aside class="callout callout--tip">${inner}</aside>\n`;
      if (probe.startsWith("⚠")) return `<aside class="callout callout--warn">${inner}</aside>\n`;
      if (probe.startsWith("🎯")) return `<aside class="callout callout--big-idea">${inner}</aside>\n`;
      if (probe.startsWith("📚")) return `<aside class="callout callout--learn-more">${inner}</aside>\n`;
      return `<blockquote>${inner}</blockquote>\n`;
    },
    heading(token) {
      const inner = this.parser.parseInline(token.tokens || []);
      const plain = inner.replace(/<[^>]+>/g, "");
      const id = slugify(plain);
      return `<h${token.depth} id="${id}">${inner}</h${token.depth}>\n`;
    },
    code(token) {
      const language = (token.lang || "").trim();
      const escaped = escapeHTMLCode(token.text);
      const chip = language ? `<span class="code-lang">${language}</span>` : "";
      return `<div class="code-block">${chip}<button class="code-copy" type="button" aria-label="Copiar bloque de código">Copiar</button><pre><code class="lang-${language || "plain"}">${escaped}</code></pre></div>\n`;
    },
  },
});

// ─── HTML template ─────────────────────────────────────────────────────────

const CSS = `
:root {
  --bg: #ffffff;
  --bg-elevated: #f8fafc;
  --border: #e2e8f0;
  --text: #0f172a;
  --text-soft: #475569;
  --text-muted: #64748b;
  --code-bg: #0f172a;
  --code-text: #e2e8f0;
  --code-comment: #94a3b8;
  --shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.05);
  --shadow-md: 0 4px 12px rgba(15, 23, 42, 0.08);
  --radius: 8px;
  --radius-lg: 12px;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: #0b1220;
    --bg-elevated: #111827;
    --border: #1f2937;
    --text: #e5e7eb;
    --text-soft: #cbd5e1;
    --text-muted: #94a3b8;
    --code-bg: #020617;
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.4);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
  }
}
:root[data-theme="dark"] {
  --bg: #0b1220;
  --bg-elevated: #111827;
  --border: #1f2937;
  --text: #e5e7eb;
  --text-soft: #cbd5e1;
  --text-muted: #94a3b8;
  --code-bg: #020617;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; scroll-padding-top: 80px; }
body {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 16px;
  line-height: 1.7;
  color: var(--text);
  background: var(--bg);
  -webkit-font-smoothing: antialiased;
}
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }
a:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 2px; }

/* Top nav */
.topnav {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 24px;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
  backdrop-filter: saturate(180%) blur(8px);
  -webkit-backdrop-filter: saturate(180%) blur(8px);
}
.topnav__brand {
  font-weight: 600;
  color: var(--text);
  font-size: 14px;
  letter-spacing: -0.01em;
  white-space: nowrap;
}
.topnav__modules {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  flex: 1;
  scrollbar-width: none;
}
.topnav__modules::-webkit-scrollbar { display: none; }
.topnav__modules a {
  padding: 4px 10px;
  font-size: 13px;
  color: var(--text-muted);
  border-radius: 6px;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.topnav__modules a.active {
  color: var(--accent);
  background: var(--bg-elevated);
}
.topnav__theme {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-soft);
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}
.topnav__theme:hover { color: var(--accent); border-color: var(--accent); }

/* Layout */
.layout {
  display: grid;
  grid-template-columns: 1fr;
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px 96px;
  gap: 48px;
}
@media (min-width: 1024px) {
  .layout {
    grid-template-columns: 220px minmax(0, 1fr);
  }
}
.toc {
  font-size: 14px;
}
@media (min-width: 1024px) {
  .toc { position: sticky; top: 72px; align-self: start; max-height: calc(100vh - 96px); overflow-y: auto; }
}
.toc summary {
  cursor: pointer;
  font-weight: 600;
  color: var(--text-soft);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 11px;
  margin-bottom: 8px;
}
@media (min-width: 1024px) {
  .toc summary { list-style: none; pointer-events: none; }
  .toc summary::-webkit-details-marker { display: none; }
  details.toc[open] > summary,
  details.toc > summary { pointer-events: none; }
}
.toc ol { list-style: none; padding-left: 0; margin: 0; }
.toc li { margin: 0; }
.toc a {
  display: block;
  padding: 4px 10px;
  color: var(--text-muted);
  border-left: 2px solid transparent;
  font-size: 13px;
  line-height: 1.5;
}
.toc a:hover { color: var(--text); text-decoration: none; border-left-color: var(--border); }
.toc a.is-active { color: var(--accent); border-left-color: var(--accent); font-weight: 500; }

/* Body */
.content { min-width: 0; max-width: 760px; }
.hero {
  border-left: 4px solid var(--accent);
  background: var(--bg-elevated);
  padding: 28px 32px;
  border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
  margin-bottom: 40px;
}
.hero__num {
  display: inline-block;
  font-size: 13px;
  font-weight: 600;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 8px;
  font-variant-numeric: tabular-nums;
}
.hero h1 {
  margin: 0 0 12px;
  font-size: 32px;
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text);
}
.hero__meta {
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
}
.hero__meta strong { color: var(--text-soft); font-weight: 600; }

/* Markdown body */
.content h2 {
  font-size: 24px;
  line-height: 1.3;
  font-weight: 600;
  letter-spacing: -0.015em;
  margin: 48px 0 16px;
  padding-top: 16px;
  color: var(--text);
}
.content h3 {
  font-size: 18px;
  line-height: 1.4;
  font-weight: 600;
  margin: 32px 0 12px;
  color: var(--text);
}
.content h4 {
  font-size: 15px;
  font-weight: 600;
  margin: 24px 0 8px;
  color: var(--text-soft);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.content p { margin: 0 0 16px; color: var(--text); }
.content ul, .content ol { padding-left: 24px; margin: 0 0 20px; }
.content li { margin: 4px 0; }
.content li > ul, .content li > ol { margin: 8px 0; }
.content hr {
  border: 0;
  border-top: 1px solid var(--border);
  margin: 40px 0;
}
.content strong { color: var(--text); font-weight: 600; }
.content em { color: var(--text-soft); }

/* Inline code */
.content :not(pre) > code {
  background: var(--bg-elevated);
  color: var(--accent);
  padding: 1px 6px;
  border-radius: 4px;
  font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
  font-size: 0.88em;
  border: 1px solid var(--border);
}

/* Code blocks */
.code-block {
  position: relative;
  background: var(--code-bg);
  color: var(--code-text);
  border-radius: var(--radius);
  margin: 0 0 20px;
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}
.code-lang {
  position: absolute;
  top: 8px;
  right: 56px;
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--code-comment);
  background: rgba(255, 255, 255, 0.06);
  padding: 2px 8px;
  border-radius: 4px;
  pointer-events: none;
}
.code-copy {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--code-text);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 11px;
  font-family: inherit;
  padding: 2px 8px;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s ease;
}
.code-block:hover .code-copy { opacity: 1; }
.code-copy:hover { background: rgba(255, 255, 255, 0.12); }
.code-copy.is-copied { color: #86efac; }
.code-block pre {
  margin: 0;
  padding: 18px 20px;
  overflow-x: auto;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace;
  font-size: 13.5px;
  line-height: 1.6;
}
.code-block code { background: transparent; color: inherit; padding: 0; border: 0; font-size: inherit; }

/* Tables */
.content table {
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 24px;
  font-size: 14px;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}
.content th, .content td {
  text-align: left;
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
  vertical-align: top;
}
.content th {
  background: var(--bg-elevated);
  color: var(--text-soft);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}
.content tr:last-child td { border-bottom: 0; }

/* Callouts */
.callout {
  border-left: 3px solid;
  background: var(--bg-elevated);
  padding: 12px 16px 12px 18px;
  border-radius: 0 var(--radius) var(--radius) 0;
  margin: 0 0 20px;
  font-size: 14.5px;
  line-height: 1.65;
}
.callout p { margin: 0 0 8px; color: var(--text); }
.callout p:last-child { margin-bottom: 0; }
.callout ul, .callout ol { margin: 8px 0; padding-left: 20px; }
.callout strong { color: var(--text); }
.callout--tip { border-left-color: var(--accent); }
.callout--warn { border-left-color: #dc2626; }
.callout--big-idea { border-left-color: #0891b2; }
.callout--learn-more { border-left-color: var(--text-muted); }

/* Prev / Next */
.prevnext {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-top: 64px;
  padding-top: 32px;
  border-top: 1px solid var(--border);
}
@media (min-width: 640px) {
  .prevnext { grid-template-columns: 1fr 1fr; }
}
.prevnext a {
  display: block;
  padding: 16px 20px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text);
  transition: border-color 0.15s ease, transform 0.15s ease;
}
.prevnext a:hover { border-color: var(--accent); text-decoration: none; transform: translateY(-1px); }
.prevnext__label { font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
.prevnext__title { font-weight: 600; color: var(--text); }
.prevnext a.is-next { text-align: right; }

/* Index page */
.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
  margin: 32px 0;
}
.module-card {
  display: block;
  padding: 20px 22px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--bg);
  color: var(--text);
  transition: all 0.18s ease;
  border-left: 4px solid var(--accent-card);
}
.module-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); text-decoration: none; }
.module-card__num { font-size: 12px; font-weight: 700; color: var(--accent-card); letter-spacing: 0.12em; text-transform: uppercase; }
.module-card__title { font-size: 18px; font-weight: 600; margin: 4px 0 10px; color: var(--text); }
.module-card__piece { font-size: 14px; color: var(--text-muted); line-height: 1.55; margin: 0; }
.module-card__duration { font-size: 12px; color: var(--text-muted); margin-top: 12px; display: block; font-variant-numeric: tabular-nums; }

@media print {
  .topnav, .toc, .code-copy, .prevnext { display: none !important; }
  .layout { display: block; padding: 0; }
  .content { max-width: 100%; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
  html { scroll-behavior: auto; }
}
.hl-comment { color: var(--code-comment); font-style: italic; }
`;

const JS = `
(function() {
  // Theme toggle
  const root = document.documentElement;
  const btn = document.querySelector('.topnav__theme');
  const stored = localStorage.getItem('docs-theme');
  if (stored) root.setAttribute('data-theme', stored);
  function refreshIcon() {
    const t = root.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (btn) btn.textContent = t === 'dark' ? '☀' : '🌙';
  }
  refreshIcon();
  if (btn) btn.addEventListener('click', () => {
    const cur = root.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = cur === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('docs-theme', next);
    refreshIcon();
  });

  // Copy to clipboard
  document.querySelectorAll('.code-copy').forEach(button => {
    button.addEventListener('click', async () => {
      const code = button.parentElement.querySelector('code');
      if (!code) return;
      try {
        await navigator.clipboard.writeText(code.textContent);
        const prev = button.textContent;
        button.textContent = 'Copiado ✓';
        button.classList.add('is-copied');
        setTimeout(() => { button.textContent = prev; button.classList.remove('is-copied'); }, 1400);
      } catch (e) { /* ignore */ }
    });
  });

  // Active TOC link on scroll
  const links = Array.from(document.querySelectorAll('.toc a[href^="#"]'));
  if (!links.length) return;
  const targets = links
    .map(a => document.getElementById(a.getAttribute('href').slice(1)))
    .filter(Boolean);
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + id));
    });
  }, { rootMargin: '-80px 0px -70% 0px' });
  targets.forEach(t => io.observe(t));
})();
`;

function pageHTML({ module, html, toc, prev, next, allModules }) {
  const navLinks = allModules
    .map(m => `<a href="${m.id}.html" ${m.id === module.id || module.parent === m.id ? 'class="active"' : ''}>M${m.num}</a>`)
    .join("");
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>M${module.num} · ${module.title} — Playwright Course</title>
<style>:root { --accent: ${module.accent}; }
${CSS}</style>
</head>
<body>
<header class="topnav">
  <a href="index.html" class="topnav__brand">Playwright Course</a>
  <nav class="topnav__modules" aria-label="Módulos">${navLinks}</nav>
  <button class="topnav__theme" type="button" aria-label="Alternar tema claro/oscuro">🌙</button>
</header>
<div class="layout">
  <details class="toc" open>
    <summary>En esta página</summary>
    <ol>
${toc}
    </ol>
  </details>
  <main class="content">
    <header class="hero">
      <span class="hero__num">Módulo ${module.num}</span>
      <h1>${module.title}</h1>
      <p class="hero__meta">
        <strong>Duración:</strong> ${module.duration}
        ${module.piece ? `<br><strong>Pieza que suma al framework:</strong> ${escapeHTML(module.piece)}` : ""}
      </p>
    </header>
${html}
    <nav class="prevnext" aria-label="Navegación entre módulos">
      ${prev ? `<a href="${prev.id}.html"><div class="prevnext__label">← Anterior</div><div class="prevnext__title">M${prev.num} · ${prev.title}</div></a>` : '<span></span>'}
      ${next ? `<a href="${next.id}.html" class="is-next"><div class="prevnext__label">Siguiente →</div><div class="prevnext__title">M${next.num} · ${next.title}</div></a>` : '<span></span>'}
    </nav>
  </main>
</div>
<script>${JS}</script>
</body>
</html>
`;
}

function indexHTML(modules) {
  const cards = modules.map(m => `
    <a class="module-card" href="${m.id}.html" style="--accent-card: ${m.accent};">
      <span class="module-card__num">Módulo ${m.num}</span>
      <h2 class="module-card__title">${m.title}</h2>
      <p class="module-card__piece">${escapeHTML(m.piece)}</p>
      <span class="module-card__duration">${m.duration}</span>
    </a>
  `).join("");
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>Playwright Course — Handouts</title>
<style>:root { --accent: #4f46e5; }
${CSS}</style>
</head>
<body>
<header class="topnav">
  <a href="index.html" class="topnav__brand">Playwright Course</a>
  <nav class="topnav__modules" aria-label="Módulos">
    ${modules.map(m => `<a href="${m.id}.html">M${m.num}</a>`).join("")}
  </nav>
  <button class="topnav__theme" type="button" aria-label="Alternar tema claro/oscuro">🌙</button>
</header>
<div class="layout">
  <details class="toc">
    <summary>Índice</summary>
    <ol>
      ${modules.map(m => `<li><a href="#m${m.num}">M${m.num} · ${m.title}</a></li>`).join("")}
    </ol>
  </details>
  <main class="content">
    <header class="hero">
      <span class="hero__num">Curso completo</span>
      <h1>Playwright Course — Handouts</h1>
      <p class="hero__meta">
        Versión HTML de las lecciones del curso, una por módulo. Diseñada para repaso visual y guía durante la sesión.
        <br><strong>Retos:</strong> no incluidos — consulta el <code>reto.md</code> de cada módulo en el repo.
      </p>
    </header>
    <h2 id="m00">Lecciones</h2>
    <div class="modules-grid">
${cards}
    </div>
  </main>
</div>
<script>${JS}</script>
</body>
</html>
`;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function buildTOC(markdown) {
  // Extract H2 headings only for the TOC. Skip "Outcome esperado" / "Reto" if any (kept for parity, no-op).
  const lines = markdown.split("\n");
  const h2 = [];
  let inFence = false;
  for (const ln of lines) {
    if (ln.startsWith("```")) inFence = !inFence;
    if (inFence) continue;
    const m = ln.match(/^##\s+(.+?)\s*$/);
    if (m) {
      const text = m[1].replace(/`/g, "").trim();
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9áéíóúñü\s-]/gi, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      h2.push({ text, id });
    }
  }
  return h2.map(h => `      <li><a href="#${h.id}">${escapeHTML(h.text)}</a></li>`).join("\n");
}

function pickPrevNext(currentId) {
  const i = NAV.findIndex(m => m.id === currentId);
  const prev = i > 0 ? NAV[i - 1] : null;
  const next = i < NAV.length - 1 ? NAV[i + 1] : null;
  return { prev, next };
}

function stripFrontMatter(md) {
  // README files in this course don't use front-matter, but be safe.
  if (md.startsWith("---\n")) {
    const end = md.indexOf("\n---\n", 4);
    if (end !== -1) return md.slice(end + 5);
  }
  return md;
}

function stripFirstH1(md) {
  // The hero already renders the title; remove the first H1 to avoid duplication.
  return md.replace(/^#\s+.+\n/, "");
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function build() {
  await mkdir(HERE, { recursive: true });

  // Build each module page + each child sublesson page.
  for (const m of MODULES) {
    await renderOne(m, MODULES);
    if (m.children) {
      for (const c of m.children) {
        await renderOne({ ...c, duration: m.duration, piece: `Sublección del Módulo ${m.num}: ${m.title}` }, MODULES);
      }
    }
  }

  // Index page
  await writeFile(resolve(HERE, "index.html"), indexHTML(MODULES), "utf8");

  console.log(`\n✓ Generated ${NAV.length + 1} files in docs-html/`);
  for (const item of NAV) console.log(`  • ${item.id}.html  ← ${item.source ?? "(child)"}`);
  console.log(`  • index.html`);
}

async function renderOne(item, allModules) {
  const sourcePath = resolve(COURSE, item.source);
  const raw = await readFile(sourcePath, "utf8");
  const cleaned = stripFirstH1(stripFrontMatter(raw));
  const toc = buildTOC(cleaned);

  let html = marked.parse(cleaned);
  html = lightSyntaxHighlight(html);
  html = rewriteRelativeLinks(html, item.source);

  const { prev, next } = pickPrevNext(item.id);
  const out = pageHTML({ module: item, html, toc, prev, next, allModules });
  const outPath = resolve(HERE, `${item.id}.html`);
  await writeFile(outPath, out, "utf8");
}

// Rewrite intra-doc .md links to .html when an HTML output exists,
// or to the original markdown (path relative to docs-html/) when it doesn't.
// Leaves http(s) and anchor-only links alone. Cross-repo (../../) paths are
// preserved untouched — they already resolve correctly because docs-html/ sits
// at the same depth as the module folders inside playwright-course/.
function rewriteRelativeLinks(html, sourceRelPath) {
  const sourceDir = dirname(sourceRelPath); // e.g. "modulo-00-git-esencial"
  return html.replace(/href="([^"]+\.md)(#[^"]*)?"/g, (match, mdPath, anchor = "") => {
    if (/^(https?:|mailto:|#)/.test(mdPath)) return match;
    // Resolve mdPath relative to the source's directory.
    const parts = mdPath.split("/");
    const stack = sourceDir.split("/").filter(Boolean);
    for (const p of parts) {
      if (p === "." || p === "") continue;
      if (p === "..") stack.pop();
      else stack.push(p);
    }
    const resolvedKey = stack.join("/"); // e.g. "modulo-00-git-esencial/01-config-y-3-estados.md"
    const outBasename = SOURCE_TO_OUTPUT.get(resolvedKey);
    if (outBasename) return `href="${outBasename}${anchor}"`;
    // No HTML; rewrite to point to the markdown at its repo location relative to docs-html/.
    return `href="../${resolvedKey}${anchor}"`;
  });
}

// Minimal post-pass: dim shell comments inside <code class="lang-bash"> blocks.
function lightSyntaxHighlight(html) {
  return html.replace(
    /(<code class="lang-(?:bash|sh|shell|diff|gitignore|plain|)">)([\s\S]*?)(<\/code>)/g,
    (_, open, body, close) => {
      const dimmed = body.replace(
        /^(\s*)(#[^\n]*)$/gm,
        (_, ws, comment) => `${ws}<span class="hl-comment">${comment}</span>`
      );
      return open + dimmed + close;
    }
  );
}

build().catch(err => {
  console.error("docs:build failed:", err);
  process.exitCode = 1;
});

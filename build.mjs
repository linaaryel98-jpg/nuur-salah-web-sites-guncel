// Nuur Salah — statik site derleyici.
// src/ içindeki metin ve varlıklardan dist/ klasörünü üretir. Çalıştırma: npm run build
import { readFile, writeFile, mkdir, rm, cp } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import config from './site.config.mjs';
import {previewPhone} from './src/assets/js/device-preview.js';

const root = dirname(fileURLToPath(import.meta.url));
const src = join(root, 'src');
const dist = join(root, 'dist');

/* ---------- yardımcılar ---------- */

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Yer tutucu ([...]) ya da boş değilse "doldurulmuş" sayılır.
const isSet = (v) => typeof v === 'string' && v.trim() !== '' && !/^\[.*\]$/.test(v.trim());

const defaultLocale = config.locales[0].code;
const prefix = (code) => (code === defaultLocale ? '' : `/${code}`);
const abs = (path) => config.siteUrl.replace(/\/$/, '') + (path === '/' ? '/' : path);

const strings = {};
for (const l of config.locales) {
  strings[l.code] = JSON.parse(await readFile(join(src, 'locales', `${l.code}.json`), 'utf8'));
}

const PAGES = ['home', 'privacy', 'terms', 'support', 'deleteAccount'];
const CONTENT_FILE = { privacy: 'privacy.md', terms: 'terms.md', deleteAccount: 'delete-account.md' };

const urlFor = (code, page) =>
  page === 'home' ? prefix(code) || '/' : `${prefix(code)}/${strings[code].slugs[page]}`;

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[ıİ]/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '') || 'bolum';

const externalAttrs = 'target="_blank" rel="noopener noreferrer"';

/* ---------- ikonlar ---------- */

const icon = (paths, extra = '') =>
  `<svg class="icon" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"${extra}>${paths}</svg>`;

const ICONS = {
  clock: icon('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>'),
  bell: icon('<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/><path d="M12 3v2"/>'),
  compass: icon('<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>'),
  book: icon('<path d="M12 6.5C10 5 7 4.5 4 5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.500V5c-3-.5-6 0-8 1.500z"/><path d="M12 6.500v13"/>'),
  steps: icon('<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.500" cy="6" r="1.200"/><circle cx="4.500" cy="12" r="1.200"/><circle cx="4.500" cy="18" r="1.200"/>'),
  beads: icon('<circle cx="12" cy="3.800" r="1.500"/><circle cx="17" cy="5.800" r="1.500"/><circle cx="19" cy="10.800" r="1.500"/><circle cx="17" cy="15.800" r="1.500"/><circle cx="12" cy="17.800" r="1.500"/><circle cx="7" cy="15.800" r="1.500"/><circle cx="5" cy="10.800" r="1.500"/><circle cx="7" cy="5.800" r="1.500"/><path d="M12 19.300V23M10.500 23h3"/>'),
  kaaba: icon('<path d="M4 7.500l8-3.500 8 3.500v11L12 22l-8-3.500z"/><path d="M4 11l8 3.500 8-3.500"/><path d="M12 14.500V22"/>'),
  mosque: icon('<path d="M2.500 21h19"/><path d="M5 21v-8h14v8"/><path d="M6.500 13a5.500 5.500 0 0 1 11 0"/><path d="M12 4.500v3"/><path d="M10 21v-3a2 2 0 0 1 4 0v3"/>'),
  download: icon('<path d="M12 4v11M7.500 11l4.500 4.500 4.500-4.500M5 20h14"/>'),
  globe: icon('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.500 2.500 3.800 5.500 3.800 9s-1.300 6.500-3.800 9c-2.500-2.500-3.800-5.500-3.800-9S9.500 5.500 12 3z"/>'),
  chevron: icon('<path d="M6 9l6 6 6-6"/>'),
  mail: icon('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.500 7l8.500 6 8.500-6"/>'),
  qr: icon('<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h2v2h-2zM18 14h2M14 18h2M18 18h2v2"/>'),
  instagram: icon('<rect x="3.500" y="3.500" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.200" cy="6.800" r=".6" fill="currentColor"/>'),
  tiktok: icon('<path d="M14 3.500v11a4 4 0 1 1-4-4"/><path d="M14 3.500c.3 2.700 2.200 4.600 5 5"/>'),
  facebook: icon('<path d="M14.500 21v-7.500h2.700l.5-3.500h-3.200V8c0-1 .4-1.500 1.600-1.500h1.700V3.400c-.6-.1-1.600-.2-2.600-.2-2.700 0-4.400 1.600-4.400 4.500V10H8v3.500h2.800V21"/>'),
  sunrise: icon('<path d="M3 18h18M6.5 18a5.5 5.5 0 0 1 11 0M12 5v3M4.6 10.6l1.8 1.8M19.4 10.6l-1.8 1.8M8 21.5h8"/>'),
  sun: icon('<circle cx="12" cy="12" r="4"/><path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.800 12H21M5.6 5.6l1.6 1.6M16.800 16.800l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.800l-1.6 1.6"/>'.replace(/\.800/g, '.8')),
  sunlow: icon('<circle cx="12" cy="13" r="3.5"/><path d="M12 5.5v2M5.5 13h-2M20.5 13h-2M7 8l1.3 1.3M17 8l-1.3 1.3M4 19.5h16"/>'),
  sunset: icon('<path d="M3 17h18M7 17a5 5 0 0 1 10 0M12 4v5M9.5 6.5L12 9l2.5-2.5M7 20.5h10"/>'),
  moon: icon('<path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z"/>'),
  calendar: icon('<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4M8 14.5l2.5 2.500 5-5"/>'.replace('2.500', '2.5')),
  image: icon('<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle cx="9" cy="10" r="1.7"/><path d="M4 17l5-4.5 3.500 3 3-2.500 4.500 4"/>'.replace(/\.500/g, '.5')),
  arrow: icon('<path d="M5 12h14M13.5 6.5L19 12l-5.5 5.5"/>', ' data-arrow'),
};
for (const k in ICONS) ICONS[k] = ICONS[k].replace(/(\d)\.(\d)00/g, '$1.$2');

const logoMark = (size = 36) =>
  `<svg class="logo-mark" viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true" focusable="false"><rect width="64" height="64" rx="15" fill="#252529"/><path d="M17 55V30c0-11 9-17 15-23 6 6 15 12 15 23v25" fill="none" stroke="#CFA650" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><g fill="#CFA650"><rect x="25" y="27" width="14" height="14"/><rect x="25" y="27" width="14" height="14" transform="rotate(45 32 34)"/></g><circle cx="32" cy="34" r="3" fill="#252529"/></svg>`;

const heroArt = `<svg class="hero-art" viewBox="0 0 320 440" aria-hidden="true" focusable="false" fill="none" stroke="#CFA650" stroke-linejoin="round"><path d="M20 440V180C20 96 110 56 160 8c50 48 140 88 140 172v260" stroke-width="1.500" opacity=".9"/><path d="M48 440V186c0-66 72-100 112-138 40 38 112 72 112 138v254" stroke-width="1" opacity=".5"/><path d="M76 440V192c0-50 54-76 84-104 30 28 84 54 84 104v248" stroke-width="1" opacity=".28"/><g transform="translate(160 236)"><rect x="-34" y="-34" width="68" height="68" stroke-width="1.500"/><rect x="-34" y="-34" width="68" height="68" transform="rotate(45)" stroke-width="1.500"/><circle r="15" stroke-width="1"/><circle r="4" fill="#CFA650" stroke="none"/></g></svg>`;

// Kahraman bölümdeki cami manzarası (renkler site.css içindeki .scene-* sınıflarından gelir).
const arches = [0, 1, 2, 3, 4, 5, 6]
  .map((i) => `<path d="M${172 + i * 66} 560v-64c0-22 12-34 22-42 10 8 22 20 22 42v64z"/>`)
  .join('');
const heroScene = `<svg class="hero-scene" viewBox="0 0 720 560" preserveAspectRatio="xMaxYMax meet" aria-hidden="true" focusable="false">
<circle class="scene-glow" cx="400" cy="300" r="230"/>
<g class="scene-far"><path d="M-30 560V452c0-58 42-98 92-112 50 14 92 54 92 112v108z"/><path d="M54 340v-34M206 560V250l9-46 9 46v310zM560 560V330c0-40 30-66 62-76 32 10 62 36 62 76v230z"/><path d="M700 560V210l8-40 8 40v350z"/></g>
<g class="scene-main"><path d="M150 560V400h500v160z"/><path d="M290 402c0-72 50-122 110-138 60 16 110 66 110 138z"/><path d="M196 402c0-36 20-56 45-63 25 7 45 27 45 63zM514 402c0-36 20-56 45-63 25 7 45 27 45 63z"/><path d="M100 560V192l14-54 14 54v368zM92 250h44v12H92zM92 332h44v12H92zM646 560V152l14-58 14 58v408zM638 222h44v12h-44zM638 312h44v12h-44z"/><path d="M284 384h232v20H284z"/></g>
<g class="scene-arch">${arches}</g>
<g class="scene-gold"><path d="M400 264v-30M241 339v-18M559 339v-18M114 138v-20M660 94V72" fill="none" stroke-width="2.5" stroke-linecap="round"/><circle cx="400" cy="228" r="5"/><circle cx="241" cy="317" r="3.500"/><circle cx="559" cy="317" r="3.500"/><circle cx="114" cy="114" r="3.500"/><circle cx="660" cy="68" r="3.500"/></g>
</svg>`.replace(/3\.500/g, '3.5');

/* ---------- ortak parçalar ---------- */

function emailHtml(t) {
  return isSet(config.supportEmail)
    ? `<a href="mailto:${esc(config.supportEmail)}">${esc(config.supportEmail)}</a>`
    : `<span class="placeholder" title="${esc(t.common.emailPending)}">${esc(config.supportEmail)}</span>`;
}

function storeBadge(t, store) {
  const isApple = store === 'apple';
  const link = isApple ? config.appStoreLink : config.googlePlayLink;
  const small = isApple ? t.store.appStoreSmall : t.store.googlePlaySmall;
  const big = isApple ? t.store.appStore : t.store.googlePlay;
  const inner = `${ICONS.download}<span class="badge-text"><small>${esc(small)}</small><strong>${esc(big)}</strong></span>`;
  if (isSet(link)) {
    const label = isApple ? t.store.appStoreAria : `${big} (${t.common.newTab})`;
    return `<a class="badge" href="${esc(link)}" ${externalAttrs} aria-label="${esc(label)}">${inner}</a>`;
  }
  return `<span class="badge is-soon">${inner}<span class="chip">${esc(t.common.soon)}</span></span>`;
}

function qrBox(t, store) {
  const src = store === 'apple' ? config.qrAppStore : config.qrGooglePlay;
  const link = store === 'apple' ? config.appStoreLink : config.googlePlayLink;
  if (!isSet(link) || !isSet(src)) return '';
  const alt = store === 'apple' ? t.store.qrAppStoreAlt : t.store.qrGooglePlayAlt;
  if (isSet(src)) {
    return `<figure class="qr"><img src="${esc(src)}" alt="${esc(alt)}" width="132" height="132" loading="lazy" decoding="async"><figcaption>${esc(t.store.qrHint)}</figcaption></figure>`;
  }
  return `<div class="qr is-soon"><div class="qr-empty">${ICONS.qr}<span>${esc(t.store.qrLabel)}</span><span class="chip">${esc(t.common.soon)}</span></div></div>`;
}

// Onaylanan gerçekçi görsel tek atlas olarak korunur; CSS her bölgeyi ayrı gösterir.
const topbarIcons = Object.fromEntries(
  ['clock', 'bell', 'compass', 'book'].map(key => [key,
    `<span class="realistic-topbar-icon realistic-topbar-${key}" aria-hidden="true"></span>`
  ])
);

function langSwitcher(code, page) {
  const t = strings[code];
  const ordered = [...config.locales].sort((a,b) => {
    const rank = l => l.code === 'tr' ? 0 : l.code === 'en' ? 1 : 2;
    return rank(a) - rank(b);
  });
  const items = ordered.map(l => {
    const current = l.code === code;
    const flag = isSet(l.flag) ? `<img class="language-flag" src="${esc(l.flag)}" alt="" width="24" height="16">` : '';
    return `<li><a href="${urlFor(l.code, page)}" lang="${l.code}" hreflang="${l.code}"${current ? ' aria-current="true"' : ''}>${flag}<span>${esc(strings[l.code].langName)}</span>${current ? '<span class="language-check" aria-hidden="true">✓</span>' : ''}</a></li>`;
  }).join('');
  return `<details class="lang"><summary aria-label="${esc(t.common.language)}: ${esc(t.langName)}"><span class="language-world" aria-hidden="true"></span><span>${esc(t.common.language)}</span></summary><ul aria-label="${esc(t.common.language)}">${items}</ul></details>`;
}

function socialList(t) {
  const items = [
    ['instagram', 'Instagram'],
    ['tiktok', 'TikTok'],
    ['facebook', 'Facebook'],
  ]
    .filter(([k]) => isSet(config.social[k]))
    .map(
      ([k, name]) =>
        `<li><a href="${esc(config.social[k])}" ${externalAttrs} aria-label="${name} (${esc(t.common.newTab)})">${ICONS[k]}</a></li>`
    )
    .join('');
  return items ? `<ul class="social" aria-label="${esc(t.footer.socialLabel)}">${items}</ul>` : '';
}

function appMark(size = 40) {
  return isSet(config.appIcon)
    ? `<span class="app-icon"><img src="${esc(config.appIcon)}" alt="" width="1254" height="1254" decoding="async"></span>`
    : logoMark(size);
}
function appGlyph(key) {
  return isSet(config.appIcons?.[key])
    ? `<img class="icon app-glyph" src="${esc(config.appIcons[key])}" alt="" width="24" height="24">`
    : ICONS[key] || '';
}
function navigation(code, suffix) {
  const t = strings[code];
  const home = urlFor(code, 'home');
  const groups = [
    [t.nav.features, `${home}#ozellikler`, t.features.items.map(i => [i.title, `${home}#feature-${i.icon}`])],
    [t.nav.screens, `${home}#ekranlar`, config.screenshots.map(i => [t.screens.items[i.key], `${home}#screen-${i.key}`]).concat([[t.showcase.themeEyebrow, `${home}#gorunum`]])],
    [t.nav.support, urlFor(code, 'support'), [[t.support.faqTitle, `${urlFor(code,'support')}#sss-baslik`], [t.support.contactTitle, `${urlFor(code,'support')}#iletisim`], [t.footer.deleteAccount, urlFor(code,'deleteAccount')]]]
  ];
  return groups.map(([label,href,items],n) => `<div class="nav-group">
    <div class="nav-label"><a href="${href}">${esc(label)}</a><button class="nav-expand" type="button" aria-expanded="false" aria-controls="submenu-${suffix}-${n}" aria-label="${esc(label)} — ${esc(t.nav.submenu)}">${ICONS.chevron}</button></div>
    <div class="nav-panel" id="submenu-${suffix}-${n}" hidden><p>${esc(label)}</p><ul>${items.map(([text,url])=>`<li><a href="${url}">${esc(text)}</a></li>`).join('')}</ul></div>
  </div>`).join('');
}

function header(code, page) {
  const t = strings[code];
  const home = urlFor(code, 'home');
  const langPage = page === 'notFound' ? 'home' : page;
  return `<a class="skip" href="#icerik">${esc(t.common.skip)}</a>
<div class="topbar">
  <div class="wrap topbar-inner">
    <ul class="topbar-list">
      ${t.topbar.items.map((i) => `<li>${topbarIcons[i.icon] || appGlyph(i.icon)}<span>${esc(i.text)}</span></li>`).join('\n      ')}
    </ul>
    ${langSwitcher(code, langPage)}
  </div>
</div>
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="${home}"${page === 'home' ? ' aria-current="page"' : ''}>${appMark(40)}<span>${esc(config.appName)}</span></a>
    <nav class="main-nav" aria-label="${esc(t.nav.label)}">${navigation(code, 'desktop')}</nav>
    <div class="header-tools">
      <details class="mobile-menu"><summary>${esc(t.nav.menu)} ${ICONS.chevron}</summary>
        <nav aria-label="${esc(t.nav.label)}">${navigation(code, 'mobile')}<a class="mobile-download" href="${home}#indir">${esc(t.nav.download)}</a></nav>
      </details>
    </div>
    <a class="button button-small header-cta digital-download" href="${home}#indir">${ICONS.download}<span>${esc(t.nav.download)}</span></a>
  </div>
</header>`;
}

function footer(code, page) {
  const t = strings[code];
  const home = urlFor(code, 'home');
  const link = (p, label) =>
    `<li><a href="${urlFor(code, p)}"${p === page ? ' aria-current="page"' : ''}>${esc(label)}</a></li>`;
  return `<footer class="site-footer">
  <div class="wrap footer-inner">
    <div class="footer-brand">
      <a class="brand" href="${home}">${appMark(36)}<span>${esc(config.appName)}</span></a>
      <p>${esc(t.footer.tagline)}</p>
      ${socialList(t)}
    </div>
    <nav aria-labelledby="alt-uygulama">
      <h2 id="alt-uygulama">${esc(t.footer.appTitle)}</h2>
      <ul class="footer-links">
        <li><a href="${home}#ozellikler">${esc(t.nav.features)}</a></li>
        <li><a href="${home}#ekranlar">${esc(t.nav.screens)}</a></li>
        <li><a href="${home}#indir">${esc(t.nav.download)}</a></li>
      </ul>
    </nav>
    <nav aria-labelledby="alt-bilgi">
      <h2 id="alt-bilgi">${esc(t.footer.infoTitle)}</h2>
      <ul class="footer-links">
        ${link('privacy', t.footer.privacy)}
        ${link('terms', t.footer.terms)}
        ${link('deleteAccount', t.footer.deleteAccount)}
      </ul>
    </nav>
    <div>
      <h2>${esc(t.footer.contactTitle)}</h2>
      <ul class="footer-links footer-contact">
        ${link('support', t.footer.support)}
        <li>${ICONS.mail}${emailHtml(t)}</li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    <div class="wrap footer-bottom-inner">
      <p>${esc(config.copyright)}</p>
      <ul>
        ${link('privacy', t.footer.privacy)}
        ${link('terms', t.footer.terms)}
      </ul>
    </div>
  </div>
</footer>`;
}

let cssVersion = '';
let uiVersion = '';

function layout({ code, page, title, description, body, noindex = false, alternates = true }) {
  const locale = config.locales.find((l) => l.code === code);
  const path = page === 'notFound' ? null : urlFor(code, page);
  const alt =
    path && alternates
      ? config.locales
          .map((l) => `<link rel="alternate" hreflang="${l.code}" href="${abs(urlFor(l.code, page))}">`)
          .join('\n') + `\n<link rel="alternate" hreflang="x-default" href="${abs(urlFor(defaultLocale, page))}">`
      : '';
  const ogAlt = config.locales
    .filter((l) => l.code !== code)
    .map((l) => `<meta property="og:locale:alternate" content="${l.ogLocale}">`)
    .join('\n');
  return `<!doctype html>
<html lang="${code}" dir="${locale.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex">' : ''}
${path ? `<link rel="canonical" href="${abs(path)}">` : ''}
${alt}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(config.appName)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
${path ? `<meta property="og:url" content="${abs(path)}">` : ''}
<meta property="og:image" content="${abs('/assets/img/og.png')}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(config.appName)}">
<meta property="og:locale" content="${locale.ogLocale}">
${ogAlt}
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#f5f5f7">
<meta name="color-scheme" content="light dark">
<meta name="format-detection" content="telephone=no">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.png" type="image/png" sizes="64x64">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/plus-jakarta-sans-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/playfair-display-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<script src="/assets/js/site.js?v=${uiVersion}"></script>
<script type="module" src="/assets/js/device-preview.js?v=${uiVersion}"></script>
<link rel="stylesheet" href="/assets/css/site.css?v=${cssVersion}">
</head>
<body class="page-${page}">
${header(code, page)}
<main id="icerik">
${body}
</main>
${footer(code, page)}
</body>
</html>
`.replace(/\n{2,}/g, '\n');
}

/* ---------- sayfalar ---------- */

function productScreen(t, key, caption, eager = false) {
  const src = config.productScreens?.[key];
  const watch = key === 'watch';
  const hero = key === 'hero';
  const animated = hero && isSet(src) && /\.gif(?:$|\?)/i.test(src) && isSet(config.productScreens.heroPoster);
  const poster = config.productScreens.heroPoster;
  const image = isSet(src)
    ? (animated
      ? `<picture><source media="(prefers-reduced-motion: reduce)" srcset="${esc(poster)}"><img class="hero-language-animation" src="${esc(src)}" data-animated="${esc(src)}" data-poster="${esc(poster)}" alt="${esc(t.hero.imageAlt)}" width="780" height="1585" fetchpriority="high" decoding="async"><div class="phone-language-flags" aria-label="Türkçe, English, Deutsch, Français, العربية, 日本語"><span>🇹🇷</span><span>🇬🇧</span><span>🇩🇪</span><span>🇫🇷</span><span>🇸🇦</span><span>🇯🇵</span></div></picture>`
      : `<img src="${esc(src)}" alt="${esc(caption)}" width="${watch ? 396 : 390}" height="${watch ? 484 : 844}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`)
    : `<div class="screen-pending">${logoMark(48)}<span>${esc(t.showcase.pending)}</span></div>`;
  return `<figure class="product-screen product-screen-${key}">
    <div class="product-frame${watch ? ' watch-frame' : ''}">${['day','night'].includes(key) ? '<span class="gallery-island" aria-hidden="true"></span>' : ''}${animated ? `<span class="iphone-island" aria-hidden="true"></span><span class="iphone-home" aria-hidden="true"></span>` : ''}${image}${animated ? `<button class="hero-animation-toggle" type="button" aria-label="${esc(t.hero.pause)}" aria-pressed="false" data-pause-label="${esc(t.hero.pause)}" data-play-label="${esc(t.hero.play)}"><span aria-hidden="true"></span></button>` : ''}</div>
    ${hero ? '' : `<figcaption>${esc(caption)}</figcaption>`}
  </figure>`;
}

function homePage(code) {
  const t = strings[code];
  const home = urlFor(code, 'home');

  const sprite = (atlas, box, cls) => `<svg class="${cls}" viewBox="${box}" fill="none" aria-hidden="true" focusable="false"><image href="/assets/img/features/bento/${atlas}-reference.png" width="1586" height="992"/></svg>`;
  const icons = {
    clock: ['showcase', '90 227 84 84'], book: ['list', '76 473 82 82'],
    compass: ['showcase', '70 581 70 70'], bell: ['icon-grid', '464 280 123 123'],
    beads: ['showcase', '1073 582 70 70'], steps: ['list', '76 560 82 82'],
    kaaba: ['list', '76 741 82 82'], mosque: ['icon-grid', '1211 603 123 123']
  };
  const art = {clock:'440 213 405 305',book:'1205 211 326 303',compass:'350 607 149 155',bell:'892 562 122 210',beads:'1385 607 156 163',steps:'432 815 101 140'};
  const target = {clock:'screen-prayer',book:'screen-quran',compass:'screen-qibla',bell:'screen-prayer',beads:'screen-tasbih',steps:'screen-guides'};
  const features = ['clock','book','compass','bell','beads','steps','kaaba','mosque'].map(key => {
    const f=t.features.items.find(item=>item.icon===key);
    const icon=icons[key];
    return `<li class="feature bento-feature bento-${key}" id="feature-${key}"><a class="bento-card" href="#${target[key] || 'ekranlar'}">${['beads','steps'].includes(key) ? `<img class="bento-cutout bento-cutout-${key}" src="/assets/img/features/bento/${key}-cutout.png" alt="" width="1024" height="1024" loading="lazy" decoding="async">` : art[key] ? sprite('showcase',art[key],`bento-art bento-art-${key}`) : ''}<span class="bento-icon">${sprite(icon[0],icon[1],'bento-icon-image')}</span><div class="feature-body"><h3>${esc(f.title)}</h3><p>${esc(f.text)}</p></div><span class="bento-arrow" aria-hidden="true">${ICONS.arrow}</span></a></li>`;
  }).join('\n');
  const plannedFeatures = t.features.planned.items.map(item => `<li class="feature bento-feature bento-added bento-${esc(item.key)}" id="feature-${esc(item.key)}"><article class="bento-card"><img class="bento-added-art" src="/assets/img/features/bento/${esc(item.key)}-art.png" alt="" width="1024" height="1024" loading="lazy" decoding="async"><div class="feature-body"><h3>${esc(item.title)}</h3><p>${esc(item.text)}</p></div></article></li>`).join('');
  const renderShotFigure = (s) => {
      const caption = t.screens.items[s.key] || s.key;
      const screen = isSet(s.src)
        ? (s.key === 'prayer' ? `<picture><source media="(prefers-reduced-motion: reduce)" srcset="/assets/img/screens/gallery/prayer-istanbul.png"><img src="${esc(s.src)}" alt="${esc(caption)}" width="1290" height="2796" loading="lazy" decoding="async"></picture>` : `<img src="${esc(s.src)}" alt="${esc(caption)}" width="1290" height="2796" loading="lazy" decoding="async">`)
        : `<div class="phone-empty">${logoMark(44)}<span>${esc(t.screens.placeholder)}</span></div>`;
      return `<figure class="phone gallery-iphone${s.key.startsWith('widget-') ? ' gallery-widget' : ''}"><div class="phone-frame"><span class="gallery-island" aria-hidden="true"></span>${screen}<span class="gallery-home" aria-hidden="true"></span></div><figcaption>${esc(caption)}</figcaption></figure>`;
    };
  const shots = config.screenshots.filter(s => s.key !== 'widget-night').map(s => {
    if (s.key === 'widget-day') {
      const night = config.screenshots.find(item => item.key === 'widget-night');
      return `<li class="widget-pair" id="screen-widgets"><div id="screen-widget-day">${renderShotFigure(s)}</div><div id="screen-widget-night">${renderShotFigure(night)}</div></li>`;
    }
    return `<li id="screen-${esc(s.key)}">${renderShotFigure(s)}</li>`;
  }).join('\n');
  const heroBg = isSet(config.heroImage)
    ? `<img class="hero-bg" src="${esc(config.heroImage)}" alt="" fetchpriority="high" decoding="async">`
    : '<div class="hero-atmosphere" aria-hidden="true"></div>';
  const body = `<section class="hero${isSet(config.heroImage) ? ' has-image' : ''}">
  ${heroBg}
  <div class="wrap hero-inner">
    <div class="hero-copy">
      <h1>${esc(t.hero.title)}</h1>
      <p class="tagline">${esc(t.hero.tagline)}</p>
      <p class="hero-note">${esc(t.hero.note)}</p>
    </div>
    <div class="hero-product hero-devices" data-device-preview data-preview-language="${code}">

      <div class="device-preview device-iphone">${previewPhone(code)}<a class="device-store" href="${isSet(config.appStoreLink) ? esc(config.appStoreLink) : '#indir'}"${isSet(config.appStoreLink) ? externalAttrs : ''}><img class="store-symbol appstore-symbol" src="/assets/img/stores/app-store-user.jpg" width="148" height="148" alt="" decoding="async"><span><strong>App Store</strong><small>${isSet(config.appStoreLink) ? (code === 'tr' ? 'İndir' : 'Download') : (code === 'tr' ? 'Yakında' : 'Coming soon')}</small></span></a></div>
      <div class="device-preview device-samsung">${previewPhone(code)}<div class="device-store device-store-soon"><img class="store-symbol googleplay-symbol" src="/assets/img/stores/google-play-user.png" width="158" height="148" alt="" decoding="async"><span><strong>Google Play</strong><small>${code === 'tr' ? 'Yakında' : 'Coming soon'}</small></span></div></div>
    </div>
  </div>
</section>

<div class="wrap strip-wrap">
  <section class="strip" aria-labelledby="vakit-baslik">
    <div class="strip-head">
      <h2 id="vakit-baslik">${ICONS.mosque}<span>${esc(t.strip.title)}</span></h2>
      <p>${esc(t.strip.note)}</p>
    </div>
    <div class="strip-row">
      <ul class="strip-grid">
        ${t.strip.items.map((i, index) => `<li><span class="prayer-app-icon prayer-app-icon-${index}" aria-hidden="true"></span><span>${esc(i.name)}</span></li>`).join('\n        ')}
      </ul>
      <a class="button strip-button" href="#ozellikler"><span>${esc(t.strip.button)}</span>${ICONS.arrow}</a>
    </div>
  </section>
</div>

<section class="section" id="ozellikler" aria-labelledby="ozellikler-baslik">
  <div class="wrap">
    <header class="section-head">
      <p class="eyebrow">${esc(t.features.eyebrow)}</p>
      <h2 id="ozellikler-baslik">${esc(t.features.title)}</h2>
      <p>${esc(t.features.intro)}</p>
    </header>
    <ul class="features bento-features card-slider" id="feature-slider" tabindex="0" aria-labelledby="ozellikler-baslik">
${features}
${plannedFeatures}
    </ul>
    
  </div>
</section>

<section class="section" id="ekranlar" aria-labelledby="ekranlar-baslik">
  <div class="wrap">
    <header class="section-head">
      <p class="eyebrow">${esc(t.screens.eyebrow)}</p>
      <h2 id="ekranlar-baslik">${esc(t.screens.title)}</h2>
      <p>${esc(t.screens.intro)}</p>
    </header>

  </div>
  <div class="shots" id="screen-slider" role="region" aria-label="${esc(t.screens.regionLabel)}" tabindex="0">
    <ul>
${shots}
    </ul>
  </div>
</section>

<section class="section theme-showcase" id="gorunum" aria-labelledby="gorunum-baslik">
  <div class="wrap"><header class="section-head">
    <p class="eyebrow">${esc(t.showcase.themeEyebrow)}</p>
    <h2 id="gorunum-baslik">${esc(t.showcase.themeTitle)}</h2>
    <p>${esc(t.showcase.themeIntro)}</p>
  </header><div class="theme-pair">
    <div class="theme-day">${productScreen(t, 'day', t.showcase.day)}</div>
    <div class="theme-night">${productScreen(t, 'night', t.showcase.night)}</div>
  </div></div>
</section>
<section class="section section-alt download" id="indir" aria-labelledby="indir-baslik">
  <div class="wrap">
    <header class="section-head">
      <p class="eyebrow">${esc(t.download.eyebrow)}</p>
      <h2 id="indir-baslik">${esc(t.download.title)}</h2>
      <p>${esc(t.download.intro)}</p>
    </header>
    <div class="stores">
      <div class="store">
        <h3>${esc(t.download.iosTitle)}</h3>
        <div class="store-row">${storeBadge(t, 'apple')}${qrBox(t, 'apple')}</div>
      </div>
      <div class="store">
        <h3>${esc(t.download.androidTitle)}</h3>
        <p>${esc(t.download.androidText)}</p>
        <div class="store-row">${storeBadge(t, 'google')}${qrBox(t, 'google')}</div>
      </div>
    </div>
  </div>
</section>
<section class="section contact-section"><div class="wrap"><h2>${esc(t.showcase.contactTitle)}</h2>
<p>${esc(t.showcase.contactText)}</p><a class="button button-gold" href="mailto:${esc(config.supportEmail)}">${ICONS.mail}${esc(t.showcase.contactButton)}</a>
</div></section>`;
  return layout({ code, page: 'home', title: t.meta.home.title, description: t.meta.home.description, body });
}

// Basit ön bilgi (front matter) ayrıştırıcı: --- arasındaki "anahtar: değer" satırları.
function parseContent(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const meta = {};
  if (m) {
    for (const line of m[1].split(/\r?\n/)) {
      const i = line.indexOf(':');
      if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
  }
  return { meta, body: m ? raw.slice(m[0].length) : raw };
}

function fillTokens(text, code) {
  const t = strings[code];
  return text
    .replaceAll('{{supportEmail}}', emailHtml(t))
    .replaceAll('{{privacyUrl}}', urlFor(code, 'privacy'))
    .replaceAll('{{termsUrl}}', urlFor(code, 'terms'))
    .replaceAll('{{supportUrl}}', urlFor(code, 'support'))
    .replaceAll('{{deleteAccountUrl}}', urlFor(code, 'deleteAccount'));
}

function renderMarkdown(md, code) {
  let html = marked.parse(fillTokens(md, code), { gfm: true });
  html = html
    .replace(/<table>/g, '<div class="table-wrap" tabindex="0"><table>')
    .replace(/<\/table>/g, '</table></div>')
    .replace(/<a href="(https?:\/\/[^"]+)"/g, `<a href="$1" ${externalAttrs}`);
  return html;
}

async function articlePage(code, page) {
  const t = strings[code];
  const raw = await readFile(join(src, 'content', code, CONTENT_FILE[page]), 'utf8');
  const { meta, body: md } = parseContent(raw);
  const draft = meta.draft === 'true';
  const toc = [];
  const used = new Set();
  const html = renderMarkdown(md, code).replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (_, level, inner) => {
    const text = inner.replace(/<[^>]+>/g, '');
    let id = slugify(text);
    for (let n = 2; used.has(id); n++) id = `${slugify(text)}-${n}`;
    used.add(id);
    if (level === '2') toc.push({ id, inner });
    return `<h${level} id="${id}">${inner}</h${level}>`;
  });
  const title = meta.title || t.footer[page];
  const updated = meta.updated
    ? `<p class="updated">${esc(t.legal.updated)}: <time datetime="${esc(meta.updated)}">${new Intl.DateTimeFormat(code, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(meta.updated))}</time></p>`
    : '';
  const tocHtml =
    toc.length > 3
      ? `<nav class="toc" aria-labelledby="toc-baslik"><h2 id="toc-baslik">${esc(t.legal.toc)}</h2><ol>${toc.map((h) => `<li><a href="#${h.id}">${h.inner}</a></li>`).join('')}</ol></nav>`
      : '';
  const body = `<div class="wrap doc${tocHtml ? ' has-toc' : ''}">
  <header class="doc-head">
    <h1>${esc(title)}</h1>
    ${updated}
    ${draft ? `<p class="notice" role="note">${esc(t.legal.draft)}</p>` : ''}
  </header>
  ${tocHtml}
  <article class="prose">
${html}
  </article>
</div>`;
  return {
    draft,
    html: layout({
      code,
      page,
      title: `${title} · ${config.appName}`,
      description: meta.description || title,
      body,
      noindex: draft,
    }),
  };
}

function supportPage(code) {
  const t = strings[code];
  const faq = t.support.faq
    .map(
      (f) =>
        `<details class="faq"><summary><h3>${esc(f.q)}</h3>${ICONS.chevron}</summary><div class="faq-body prose">${renderMarkdown(f.a, code)}</div></details>`
    )
    .join('\n');
  const mailBtn = isSet(config.supportEmail)
    ? `<a class="button" href="mailto:${esc(config.supportEmail)}">${ICONS.mail}<span>${esc(config.supportEmail)}</span></a>`
    : `<p class="button is-soon">${ICONS.mail}<span class="placeholder">${esc(config.supportEmail)}</span></p>`;
  const body = `<div class="wrap doc">
  <header class="doc-head">
    <h1>${esc(t.support.title)}</h1>
    <p class="lead">${esc(t.support.intro)}</p>
  </header>
  <section aria-labelledby="sss-baslik">
    <h2 id="sss-baslik">${esc(t.support.faqTitle)}</h2>
    <div class="faq-list">
${faq}
    </div>
  </section>
  <section class="contact" id="iletisim" aria-labelledby="iletisim-baslik">
    <h2 id="iletisim-baslik">${esc(t.support.contactTitle)}</h2>
    <p>${esc(t.support.contactText)}</p>
    ${mailBtn}
  </section>
</div>`;
  return layout({ code, page: 'support', title: t.meta.support.title, description: t.meta.support.description, body });
}

function notFoundPage(code) {
  const t = strings[code];
  const body = `<div class="wrap doc notfound">
  <header class="doc-head">
    <h1>${esc(t.notFound.title)}</h1>
    <p class="lead">${esc(t.notFound.text)}</p>
    <p><a class="button" href="${urlFor(code, 'home')}">${esc(t.notFound.back)}</a></p>
  </header>
</div>`;
  return layout({ code, page: 'notFound', title: t.meta.notFound.title, description: t.meta.notFound.description, body, noindex: true });
}

/* ---------- derleme ---------- */

async function write(path, content) {
  const file = join(dist, path);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, content);
}
const fileFor = (url) => (url === '/' ? 'index.html' : `${url.slice(1)}/index.html`);

await rm(dist, { recursive: true, force: true });
await cp(join(src, 'assets'), join(dist, 'assets'), { recursive: true });
for (const f of ['favicon.svg', 'favicon.png', 'apple-touch-icon.png']) {
  await cp(join(src, 'assets', 'img', f), join(dist, f));
}
uiVersion = createHash('sha1').update(await readFile(join(src, 'assets', 'js', 'site.js'))).update(await readFile(join(src, 'assets', 'js', 'device-preview.js'))).digest('hex').slice(0, 8);
cssVersion = createHash('sha1').update(await readFile(join(src, 'assets', 'css', 'site.css'))).digest('hex').slice(0, 8);

const sitemap = [];
for (const { code } of config.locales) {
  for (const page of PAGES) {
    let html;
    let indexable = true;
    if (page === 'home') html = homePage(code);
    else if (page === 'support') html = supportPage(code);
    else {
      const r = await articlePage(code, page);
      html = r.html;
      indexable = !r.draft;
    }
    await write(fileFor(urlFor(code, page)), html);
    if (indexable) sitemap.push({ code, page });
  }
  if (code !== defaultLocale) await write(`${code}/404.html`, notFoundPage(code));
}
await write('404.html', notFoundPage(defaultLocale));

await write(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sitemap
  .map(
    ({ code, page }) => `  <url>
    <loc>${abs(urlFor(code, page))}</loc>
${config.locales.map((l) => `    <xhtml:link rel="alternate" hreflang="${l.code}" href="${abs(urlFor(l.code, page))}"/>`).join('\n')}
  </url>`
  )
  .join('\n')}
</urlset>
`
);
await write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${abs('/sitemap.xml')}\n`);

// Doldurulmamış yer tutucuları bildir.
const pending = Object.entries({
  appStoreLink: config.appStoreLink,
  googlePlayLink: config.googlePlayLink,
  supportEmail: config.supportEmail,
  'social.instagram': config.social.instagram,
  'social.tiktok': config.social.tiktok,
  'social.facebook': config.social.facebook,
  qrAppStore: config.qrAppStore,
  qrGooglePlay: config.qrGooglePlay,
}).filter(([, v]) => !isSet(v));
console.log(`Derlendi: dist/ (${config.locales.map((l) => l.code).join(', ')})`);
if (pending.length) {
  console.log(`Doldurulmamış yer tutucular (site.config.mjs): ${pending.map(([k, v]) => `${k} ${v}`).join(', ')}`);
}

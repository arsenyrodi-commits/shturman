/* ============================================================
   ШТУРМАН — общий UI-слой: навбар, футер, анимации, карточки.
   window.SH — публичные хелперы для страничных скриптов.
   ============================================================ */
(function () {
  'use strict';
  var SH = (window.SH = window.SH || {});

  /* ---------- иконки (inline SVG, без эмодзи) ---------- */
  var ICON = {
    arrow: '<svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
    ticket: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9a3 3 0 0 0 0 6v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2Z"/><path d="M13 5v14"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    flag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21V4M4 4h13l-2 4 2 4H4"/></svg>',
    spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    tg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.9 4.3 18.6 19c-.2 1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.3-5 9.1-8.2c.4-.4-.1-.6-.6-.2L6 12.2l-4.8-1.5c-1-.3-1-1 .2-1.5l18.7-7.2c.9-.3 1.6.2 1.8 1.3Z"/></svg>',
    mark: '<svg class="mark" viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="11" fill="#FF4D14"/><path d="M20 9l9.5 22-9.5-5-9.5 5L20 9Z" fill="#fff"/><path d="M20 9l9.5 22-9.5-5V9Z" fill="#FFD7C6"/></svg>'
  };
  SH.ICON = ICON;

  var MONTHS = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  var MONTHS_FULL = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

  SH.parse = function (iso) { var p = iso.split('-'); return { y: +p[0], m: +p[1] - 1, d: +p[2] }; };

  SH.formatDate = function (startIso, endIso) {
    var s = SH.parse(startIso);
    if (!endIso || endIso === startIso) return s.d + ' ' + MONTHS[s.m] + ' ' + s.y;
    var e = SH.parse(endIso);
    if (s.m === e.m) return s.d + '–' + e.d + ' ' + MONTHS[s.m] + ' ' + s.y;
    return s.d + ' ' + MONTHS[s.m] + ' – ' + e.d + ' ' + MONTHS[e.m] + ' ' + s.y;
  };
  SH.formatDateFull = function (iso) { var s = SH.parse(iso); return s.d + ' ' + MONTHS_FULL[s.m] + ' ' + s.y; };
  SH.dayNum = function (iso) { return SH.parse(iso).d; };
  SH.monthShort = function (iso) { return MONTHS[SH.parse(iso).m]; };
  SH.MONTHS = MONTHS;

  SH.disc = function (key) {
    return (window.SHTURMAN && window.SHTURMAN.disciplines && window.SHTURMAN.disciplines[key]) || { label: key, color: '#888' };
  };
  SH.event = function (id) {
    var e = (window.SHTURMAN && window.SHTURMAN.events) || [];
    for (var i = 0; i < e.length; i++) if (e[i].id === id) return e[i];
    return null;
  };
  SH.article = function (slug) {
    var a = (window.SHTURMAN && window.SHTURMAN.articles) || [];
    for (var i = 0; i < a.length; i++) if (a[i].slug === slug) return a[i];
    return null;
  };

  SH.discTag = function (key) {
    var d = SH.disc(key);
    return '<span class="tag tag-' + key + '"><span class="dot"></span>' + d.label + '</span>';
  };
  SH.priceTag = function (ev) {
    if (ev.free) return '<span class="tag tag-free">Бесплатно</span>';
    return '<span class="tag tag-paid">от ' + ev.priceFrom.toLocaleString('ru-RU') + ' ₽</span>';
  };

  var IMG_FALLBACK = "this.style.display='none';this.parentNode.classList.add('img-failed')";

  /* ---------- карточка события (для главной, календаря, похожих) ---------- */
  SH.eventCard = function (ev) {
    var d = SH.disc(ev.discipline);
    return '' +
      '<a class="card group flex flex-col" href="event.html?id=' + ev.id + '" aria-label="' + ev.title + '">' +
        '<div class="media media-' + ev.discipline + '" style="aspect-ratio:16/10">' +
          '<img src="' + ev.image + '" alt="' + ev.title + '" loading="lazy" onerror="' + IMG_FALLBACK + '">' +
          '<div class="speedlines"></div>' +
          '<div class="absolute top-3 left-3 flex gap-2">' + SH.discTag(ev.discipline) + '</div>' +
          '<div class="absolute top-3 right-3">' + SH.priceTag(ev) + '</div>' +
          '<div class="card-date absolute bottom-3 left-3">' +
            '<span class="inline-flex">' + ICON.calendar + '</span>' + SH.formatDate(ev.dateStart, ev.dateEnd) +
          '</div>' +
        '</div>' +
        '<div class="p-5 flex flex-col flex-1">' +
          '<h3 class="text-[20px] leading-tight mb-2 text-balance">' + ev.title + '</h3>' +
          '<div class="flex items-center gap-1.5 text-inktext-dim text-[14.5px] mb-4"><span class="inline-flex w-4 h-4 text-orange">' + ICON.pin + '</span>' + ev.track + ' · ' + ev.city + '</div>' +
          '<div class="mt-auto flex items-center justify-between pt-3" style="border-top:1px solid var(--line-light)">' +
            '<span class="text-[13.5px] text-inktext-faint" style="font-family:var(--font-head);font-weight:600">' + ev.format + '</span>' +
            '<span class="link-arrow text-orange text-[14px]">Подробнее' + ICON.arrow + '</span>' +
          '</div>' +
        '</div>' +
      '</a>';
  };

  /* ---------- карточка статьи (редакторская, с номером) ---------- */
  SH.articleCard = function (a, index) {
    var num = (index + 1 < 10 ? '0' : '') + (index + 1);
    return '' +
      '<a class="card group flex flex-col" href="article.html?slug=' + a.slug + '" aria-label="' + a.title + '">' +
        '<div class="media" style="aspect-ratio:16/10">' +
          '<img src="' + a.cover + '" alt="' + a.title + '" loading="lazy" onerror="' + IMG_FALLBACK + '">' +
          '<div class="absolute top-3 left-3"><span class="tag" style="background:rgba(14,14,17,.6);color:#fff;backdrop-filter:blur(6px)">' + a.category + '</span></div>' +
        '</div>' +
        '<div class="p-5 flex flex-col flex-1">' +
          '<div class="flex items-center gap-3 mb-2"><span style="font-family:var(--font-head);font-weight:800;color:var(--orange)">' + num + '</span><span class="text-[13px] text-inktext-faint">' + a.readMins + ' мин чтения</span></div>' +
          '<h3 class="text-[20px] leading-tight mb-2 text-balance">' + a.title + '</h3>' +
          '<p class="text-[15px] text-inktext-dim flex-1">' + a.excerpt + '</p>' +
          '<span class="link-arrow text-orange text-[14px] mt-4">Читать' + ICON.arrow + '</span>' +
        '</div>' +
      '</a>';
  };

  /* ---------- навбар + футер ---------- */
  var NAV_LINKS = [
    { href: 'index.html', label: 'Главная' },
    { href: 'calendar.html', label: 'Календарь' },
    { href: 'blog.html', label: 'База знаний' },
    { href: 'app.html', label: 'Приложение' }
  ];

  function currentFile() {
    var p = location.pathname.split('/').pop();
    return p === '' ? 'index.html' : p;
  }

  function buildNav() {
    var cur = currentFile();
    var links = NAV_LINKS.map(function (l) {
      var active = (l.href === cur) ? ' active' : '';
      return '<a class="navlink' + active + '" href="' + l.href + '">' + l.label + '</a>';
    }).join('');

    var mm = NAV_LINKS.map(function (l, i) {
      return '<a class="mm-item" href="' + l.href + '"><span class="num">0' + (i + 1) + '</span><span class="lbl">' + l.label + '</span></a>';
    }).join('');

    return '' +
      '<nav class="nav" id="nav"><div class="wrap"><div class="nav-inner">' +
        '<a class="brand" href="index.html">' + ICON.mark + 'Штурман</a>' +
        '<div class="nav-links flex items-center gap-1">' + links + '</div>' +
        '<div class="flex items-center gap-2">' +
          '<a class="btn btn-primary btn-sm nav-cta-desktop" href="app.html">Открыть приложение' + ICON.arrow + '</a>' +
          '<button class="menu-btn" id="menuBtn" aria-label="Открыть меню" aria-expanded="false">' + ICON.menu + '</button>' +
        '</div>' +
      '</div></div></nav>' +
      '<div class="mobile-menu" id="mobileMenu">' +
        '<div class="flex items-center justify-between mb-6">' +
          '<a class="brand" href="index.html">' + ICON.mark + 'Штурман</a>' +
          '<button class="menu-btn" id="menuClose" style="display:inline-flex" aria-label="Закрыть меню">' + ICON.close + '</button>' +
        '</div>' +
        '<div class="flex-1">' + mm + '</div>' +
        '<a class="btn btn-primary btn-lg mt-6" href="app.html">Открыть приложение' + ICON.arrow + '</a>' +
        '<div class="mt-6 text-cream-faint text-[14px]">tg @daryashilyagina · +7 (985) 699-06-29</div>' +
      '</div>';
  }

  function buildFooter() {
    var links = NAV_LINKS.map(function (l) { return '<a href="' + l.href + '" class="block py-1.5">' + l.label + '</a>'; }).join('');
    return '' +
      '<footer class="footer">' +
        '<div class="wrap pt-20 pb-10">' +
          '<div class="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">' +
            '<div>' +
              '<a class="brand text-[26px]" href="index.html">' + ICON.mark + 'Штурман</a>' +
              '<p class="text-cream-dim mt-5 max-w-sm text-[15.5px]">Твой навигатор в мире автоспорта. Все гонки России — ралли, дрифт, кольцо и мото — в одном месте.</p>' +
              '<div class="flex gap-3 mt-6">' +
                '<a href="https://t.me/daryashilyagina" target="_blank" rel="noopener" aria-label="Telegram" class="w-11 h-11 rounded-full flex items-center justify-center" style="background:rgba(244,241,234,.08);border:1px solid var(--line-dark)"><span class="w-5 h-5 inline-flex text-cream">' + ICON.tg + '</span></a>' +
              '</div>' +
            '</div>' +
            '<div>' +
              '<div class="eyebrow mb-4">Разделы</div>' + links +
            '</div>' +
            '<div>' +
              '<div class="eyebrow mb-4">Контакты</div>' +
              '<a href="https://t.me/daryashilyagina" class="block py-1.5">tg @daryashilyagina</a>' +
              '<a href="mailto:daryashilyagina@yandex.ru" class="block py-1.5">daryashilyagina@yandex.ru</a>' +
              '<a href="tel:+79856990629" class="block py-1.5">+7 (985) 699-06-29</a>' +
            '</div>' +
          '</div>' +
          '<div class="footer-mega mt-14 text-center md:text-left">ШТУРМАН</div>' +
          '<div class="flex flex-col md:flex-row gap-3 justify-between items-center pt-8 mt-2 text-cream-faint text-[13.5px]" style="border-top:1px solid var(--line-dark)">' +
            '<span>© 2026 Штурман. Демо-версия MVP.</span>' +
            '<span>Данные о событиях — ориентировочные, сезон 2026.</span>' +
          '</div>' +
        '</div>' +
      '</footer>';
  }

  /* ---------- поведение ---------- */
  function initNav() {
    var root = document.getElementById('nav-root');
    if (root) root.innerHTML = buildNav();
    var footRoot = document.getElementById('footer-root');
    if (footRoot) footRoot.innerHTML = buildFooter();

    var nav = document.getElementById('nav');
    var onScroll = function () { if (!nav) return; nav.classList.toggle('scrolled', window.scrollY > 20); };
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

    var menu = document.getElementById('mobileMenu');
    var btn = document.getElementById('menuBtn');
    var close = document.getElementById('menuClose');
    function open() { menu.classList.add('open'); document.body.classList.add('no-scroll'); btn && btn.setAttribute('aria-expanded', 'true'); }
    function shut() { menu.classList.remove('open'); document.body.classList.remove('no-scroll'); btn && btn.setAttribute('aria-expanded', 'false'); }
    btn && btn.addEventListener('click', open);
    close && close.addEventListener('click', shut);
    menu && menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', shut); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') shut(); });
  }

  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || !els.length) { els.forEach(function (e) { e.classList.add('is-visible'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (e) { io.observe(e); });
  }

  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 1400, start = null;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { el.textContent = target.toLocaleString('ru-RU') + suffix; return; }
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(target * eased);
      el.textContent = val.toLocaleString('ru-RU') + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  function initCounters() {
    var els = document.querySelectorAll('[data-count]');
    if (!els.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { animateCount(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.5 });
    els.forEach(function (e) { io.observe(e); });
  }

  SH.qs = function (name) { return new URLSearchParams(location.search).get(name); };

  /* заполнение inline-иконок в статической разметке: [data-arrow], [data-ic="name"] */
  function fillIcons(scope) {
    (scope || document).querySelectorAll('[data-arrow]').forEach(function (el) { if (!el.firstChild) el.innerHTML = ICON.arrow; });
    (scope || document).querySelectorAll('[data-ic]').forEach(function (el) {
      var n = el.getAttribute('data-ic'); if (ICON[n] && !el.firstChild) el.innerHTML = ICON[n];
    });
  }
  SH.fillIcons = fillIcons;
  SH.initReveal = initReveal;

  function boot() {
    initNav();
    fillIcons();
    initReveal();
    initCounters();
    var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
    if (typeof window.PAGE_INIT === 'function') window.PAGE_INIT();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

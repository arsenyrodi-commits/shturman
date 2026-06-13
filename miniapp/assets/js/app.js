/* ============================================================
   ШТУРМАН (VK Mini App) - оболочка + SPA-роутер.
   M1: верхние icon-табы + «Календарь».
   M2: «База знаний» (HelloChinese: пилюли + тумблер + карточки + читалка).
   M3: «Навигация по гонке» - сегменты Карта / Активности / Расписание,
       интерактивная SVG-карта Moscow Raceway (пан/зум, тап по зоне →
       нижняя карточка), чек-лист активностей и таймлайн.
   Прогресс (прочитано / посещено) хранится в localStorage; на M4 → VK Storage.
   ============================================================ */
(function () {
  'use strict';

  var REC = window.REC || { stages: [] };
  var stages = REC.stages;
  var arts = (window.SHTURMAN && window.SHTURMAN.articles) || [];

  /* ---------- иконки ---------- */
  var ICON = {
    mark: '<svg viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="11" fill="#FF4D14"/><path d="M20 9l9.5 22-9.5-5-9.5 5L20 9Z" fill="#fff"/><path d="M20 9l9.5 22-9.5-5V9Z" fill="#FFD7C6"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2V5Z"/><path d="M4 20a2 2 0 0 0 2 2h13"/></svg>',
    flag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21V4M4 4h13l-2 4 2 4H4"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>'
  };

  /* ---------- даты ---------- */
  var MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  function dObj(iso) { return new Date(iso + 'T00:00:00'); }
  function fmtDate(iso) { var p = iso.split('-'); return (+p[2]) + ' ' + MONTHS[(+p[1]) - 1] + ' ' + p[0]; }
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var nextId = (function () {
    for (var i = 0; i < stages.length; i++) { if (dObj(stages[i].date) >= today) return stages[i].id; }
    return stages.length ? stages[stages.length - 1].id : null;
  })();

  /* ---------- хранилище прогресса (localStorage + зеркало в VK Storage) ---------- */
  function load(key) { try { return JSON.parse(localStorage.getItem(key)) || {}; } catch (e) { return {}; } }
  function loadVal(key, def) { try { var v = JSON.parse(localStorage.getItem(key)); return v == null ? def : v; } catch (e) { return def; } }
  function save(key, obj) {
    var str = JSON.stringify(obj);
    try { localStorage.setItem(key, str); } catch (e) {}
    if (window.SH_VK && SH_VK.storageSet) SH_VK.storageSet(key, str).catch(function () {});
  }
  var READ_KEY = 'sh_read_v1', DONE_KEY = 'sh_done_v1', TICKET_KEY = 'sh_ticket_v1';
  var readMap = load(READ_KEY), doneMap = load(DONE_KEY);
  function isRead(slug) { return !!readMap[slug]; }
  function markRead(slug) { if (!readMap[slug]) { readMap[slug] = 1; save(READ_KEY, readMap); } }
  function doneKey(actId) { return state.stageId + '|' + actId; }
  function isDone(actId) { return !!doneMap[doneKey(actId)]; }

  /* ---------- состояние ---------- */
  var state = { tab: 'calendar', stageId: nextId, knCat: 'Все', hideRead: false, articleSlug: null, raceSection: 'map', ticket: loadVal(TICKET_KEY, 'Все') };

  var TABS = [
    { id: 'calendar', label: 'Календарь', icon: 'calendar' },
    { id: 'race', label: 'Навигация', icon: 'pin' },
    { id: 'knowledge', label: 'База знаний', icon: 'book' }
  ];
  var KIND_LABEL = { zone: 'Зона', show: 'Активности', kids: 'Детям', track: 'Трек и экскурсии', stand: 'Трибуна', service: 'Сервис', parking: 'Парковка', thrill: 'Аттракцион', inactive: 'Не используется' };
  var MAP = null; // данные карты текущего этапа (зоны/декор/viewBox)

  function stageById(id) { for (var i = 0; i < stages.length; i++) { if (stages[i].id === id) return stages[i]; } return null; }
  function articleBySlug(slug) { for (var i = 0; i < arts.length; i++) { if (arts[i].slug === slug) return arts[i]; } return null; }
  function actById(d, id) { for (var i = 0; i < d.activities.length; i++) { if (d.activities[i].id === id) return d.activities[i]; } return null; }
  function zoneById(d, id) { for (var i = 0; i < d.zones.length; i++) { if (d.zones[i].id === id) return d.zones[i]; } return null; }
  function displayName(s) { return s.name || ('Этап ' + s.stage); }
  function stageDate(s) { return s.dateLabel || fmtDate(s.date); }
  function calStatus(s) {
    if (s.id === nextId) return { cls: 'next', label: 'Ближайший' };
    if (dObj(s.date) < today) return { cls: 'past', label: 'Завершён' };
    return { cls: 'soon', label: 'Скоро' };
  }
  var IMG_FALLBACK = "this.style.display='none';this.parentNode.classList.add('img-failed')";

  /* ---------- категории билетов (фильтр) ---------- */
  var TICKETS = ['Все', 'Комфорт', 'Семейный', 'Премиум', 'ВИП', 'ЛЮКС'];
  function availFor(a) { if (state.ticket === 'Все') return true; if (!a.tickets) return true; return a.tickets.indexOf(state.ticket) >= 0; }
  function visibleActs(d) { return d.activities.filter(availFor); }

  /* ---------- шапка + табы ---------- */
  function header() {
    var tabs = TABS.map(function (t) {
      return '<button class="tab' + (t.id === state.tab ? ' active' : '') + '" data-tab="' + t.id + '">' +
        '<span class="ico ico-22">' + ICON[t.icon] + '</span><span class="tlabel">' + t.label + '</span></button>';
    }).join('');
    var ava = (window.SH_VK && SH_VK.user && SH_VK.user.photo_100)
      ? '<img class="vk-ava" src="' + SH_VK.user.photo_100 + '" alt="">' : '';
    return '<header class="app-head">' +
      '<div class="head-top"><div class="brand"><span class="ico ico-mark">' + ICON.mark + '</span>Штурман</div>' + ava + '</div>' +
      '<nav class="tabs">' + tabs + '</nav></header>';
  }

  /* ======================= КАЛЕНДАРЬ ======================= */
  function calendarScreen() {
    var cards = stages.map(function (s) {
      var st = calStatus(s);
      var num = (s.stage < 10 ? '0' : '') + s.stage;
      return '<a class="stage-card' + (st.cls === 'next' ? ' is-next' : '') + '" data-stage="' + s.id + '">' +
        '<div class="stage-media">' +
          '<img class="stage-img" src="../assets/img/stages/' + s.id + '.jpg" alt="" loading="lazy" onerror="' + IMG_FALLBACK + '">' +
          '<span class="stage-badge">Этап ' + s.stage + '</span>' +
          '<span class="stage-status s-' + st.cls + '">' + st.label + '</span>' +
          '<span class="stage-num">' + num + '</span></div>' +
        '<div class="stage-body">' +
          '<div class="stage-title">' + displayName(s) + '</div>' +
          '<div class="stage-series">' + REC.series + '</div>' +
          '<div class="meta"><span class="ico ico-15">' + ICON.calendar + '</span>' + stageDate(s) + '</div>' +
          '<div class="meta"><span class="ico ico-15">' + ICON.pin + '</span>' + s.track + ' · ' + s.city + '</div>' +
          '<div class="meta"><span class="ico ico-15">' + ICON.flag + '</span>' + s.type + '</div>' +
          '<div class="stage-cta">Открыть навигацию <span class="ico ico-15">' + ICON.arrow + '</span></div>' +
        '</div></a>';
    }).join('');
    return '<div class="cal-hero">' +
        '<div class="eyebrow">Сезон ' + REC.season + ' · ' + stages.length + ' этапов</div>' +
        '<h1 class="cal-title">Russian Endurance<br>Challenge</h1>' +
        '<p class="cal-sub">Выбери этап - внутри карта автодрома, активности и расписание.</p></div>' +
      '<div class="stage-list">' + cards + '</div>';
  }

  /* ======================= НАВИГАЦИЯ ПО ГОНКЕ ======================= */
  function raceScreen() {
    var s = stageById(state.stageId) || stages[0];
    if (!s) return stub('pin', 'Этап не выбран', 'Открой «Календарь» и выбери гонку.');
    var d = window.STAGE1 || { zones: [], activities: [], schedule: [], links: [] };
    var mapData = (s.venue === 'igora' && window.VENUE_IGORA) ? window.VENUE_IGORA : window.STAGE1;
    MAP = mapData;
    var hasMap = (s.venue === 'mrw' && window.STAGE1) || (s.venue === 'igora' && window.VENUE_IGORA);
    var note = s.stage !== 1
      ? '<div class="race-note">Активности и расписание показаны по образцу этапа 1 - для этого этапа уточняются.</div>' : '';
    var ticketBar = '<div class="ticket-bar"><span class="ticket-lbl">Мой билет</span>' +
      '<div class="pills tpills">' + TICKETS.map(function (t) {
        return '<button class="pill' + (state.ticket === t ? ' active' : '') + '" data-ticket="' + t + '">' + t + '</button>';
      }).join('') + '</div></div>';
    var seg = '<div class="seg">' + [['map', 'Карта'], ['acts', 'Активности'], ['sched', 'Расписание']].map(function (p) {
      return '<button class="seg-btn' + (state.raceSection === p[0] ? ' active' : '') + '" data-race-sec="' + p[0] + '">' + p[1] + '</button>';
    }).join('') + '</div>';

    var content;
    if (state.raceSection === 'acts') content = actsView(d);
    else if (state.raceSection === 'sched') content = schedView(d);
    else content = hasMap ? mapBlock(mapData)
      : stub('pin', 'Карта «' + s.track + '» - скоро', 'Интерактивная схема этого автодрома появится позже. Активности и расписание уже доступны на соседних вкладках.', 'Скоро');

    return '<div class="race-head">' +
        '<button class="back-chip" data-tab="calendar"><span class="ico ico-15">' + ICON.back + '</span>Все этапы</button>' +
        '<div class="eyebrow">Навигация по гонке</div>' +
        '<h1 class="screen-title">' + displayName(s) + '</h1>' +
        '<div class="race-meta">' + stageDate(s) + ' · ' + s.track + '</div></div>' +
      ticketBar + note + seg + content + usefulBlock(d);
  }

  /* ---- карта ---- */
  function labelSize(z) { var s = Math.round(z.w * 1.7 / Math.max(z.label.length, 1)); return Math.max(13, Math.min(28, s)); }
  function mapSVG(d) {
    var decor = d.decor || '';
    var zs = d.zones.map(function (z) {
      var tap = ((z.acts && z.acts.length) || z.desc) ? ' tappable' : '';
      var cx = z.x + z.w / 2, cy = z.y + z.h / 2;
      var avail = (z.acts || []).filter(function (id) { var a = actById(d, id); return a && availFor(a); }).length;
      var badge = avail
        ? '<g class="zbadge"><circle cx="' + (z.x + z.w - 15) + '" cy="' + (z.y + 15) + '" r="12"/><text x="' + (z.x + z.w - 15) + '" y="' + (z.y + 20) + '" text-anchor="middle" font-size="15">' + avail + '</text></g>'
        : '';
      return '<g class="zone z-' + z.kind + tap + '" data-zone="' + z.id + '">' +
        '<rect x="' + z.x + '" y="' + z.y + '" width="' + z.w + '" height="' + z.h + '" rx="9"/>' +
        '<text x="' + cx + '" y="' + (cy + 5) + '" text-anchor="middle" font-size="' + labelSize(z) + '">' + z.label + '</text>' +
        badge + '</g>';
    }).join('');
    return '<svg viewBox="' + (d.vb || '0 0 1000 660') + '" preserveAspectRatio="xMidYMid meet"><g id="vp">' + decor + zs + '</g></svg>';
  }
  function mapBlock(d) {
    return '<div class="map-wrap" id="mapWrap">' + mapSVG(d) +
      '<div class="map-zoom"><button data-zoom="in" aria-label="Приблизить">+</button><button data-zoom="out" aria-label="Отдалить">−</button></div></div>' +
      '<div class="map-hint">Тапни зону · тяни, чтобы двигать · +/− зум</div>';
  }

  /* ---- активности (чек-лист) ---- */
  function actRow(a) {
    var on = isDone(a.id);
    var sub = '';
    if (a.time) sub += '<span>' + a.time + '</span>';
    if (a.note) sub += '<span class="act-note">' + a.note + '</span>';
    if (a.free) sub += '<span class="tk free">Бесплатно</span>';
    else if (a.ticket) sub += '<span class="tk">Билет: ' + a.ticket + '</span>';
    return '<div class="act' + (on ? ' on' : '') + '">' +
      '<button class="chk' + (on ? ' on' : '') + '" data-done="' + a.id + '" aria-label="Отметить"><span class="ico">' + ICON.check + '</span></button>' +
      '<div class="act-main"><div class="act-title">' + a.title + '</div>' +
      '<div class="act-sub">' + sub + '</div></div></div>';
  }
  function actsView(d) {
    var vis = visibleActs(d);
    var groups = [['show', 'Аттракционы и зоны'], ['track', 'Экскурсии и трек'], ['main', 'Главное событие']];
    var total = vis.length, done = 0;
    vis.forEach(function (a) { if (isDone(a.id)) done++; });
    var pct = total ? Math.round(done / total * 100) : 0;
    var html = '<div class="acts-prog"><div class="bar"><i id="progBar" style="width:' + pct + '%"></i></div>' +
      '<span class="lbl" id="progLbl">Отмечено ' + done + ' из ' + total + '</span></div>';
    groups.forEach(function (g) {
      var items = vis.filter(function (a) { return a.cat === g[0]; });
      if (!items.length) return;
      html += '<div class="acts-group"><h4>' + g[1] + '</h4>' + items.map(actRow).join('') + '</div>';
    });
    return html;
  }
  function updateProg() {
    var bar = document.getElementById('progBar'); if (!bar) return;
    var vis = visibleActs(window.STAGE1); var total = vis.length, done = 0;
    vis.forEach(function (a) { if (isDone(a.id)) done++; });
    bar.style.width = (total ? Math.round(done / total * 100) : 0) + '%';
    var lbl = document.getElementById('progLbl'); if (lbl) lbl.textContent = 'Отмечено ' + done + ' из ' + total;
  }

  /* ---- расписание ---- */
  function schedView(d) {
    return '<div class="tl">' + d.schedule.map(function (r) {
      var note = r.note ? '<div class="tl-note">' + r.note + '</div>' : '';
      var tk = r.ticket ? ' <span class="tk">Билет: ' + r.ticket + '</span>' : '';
      return '<div class="tl-row' + (r.hot ? ' hot' : '') + '"><div class="tl-dot"></div>' +
        '<div class="tl-main"><div class="tl-time">' + r.t + '</div>' +
        '<div class="tl-title">' + r.title + tk + '</div>' + note + '</div></div>';
    }).join('') + '</div>';
  }

  /* ---- полезное ---- */
  function usefulBlock(d) {
    var links = (d.links || []).map(function (l) {
      return '<a class="link-row" href="' + l.url + '" target="_blank" rel="noopener"><span class="ico">' + ICON.flag + '</span>' + l.label + '<span class="ico tail">' + ICON.arrow + '</span></a>';
    }).join('');
    return '<div class="useful"><h4>Полезное</h4>' + links +
      '<a class="link-row" data-tab="knowledge"><span class="ico">' + ICON.book + '</span>Открыть базу знаний<span class="ico tail">' + ICON.arrow + '</span></a></div>';
  }

  /* ---- нижняя карточка зоны ---- */
  function openZoneSheet(id) {
    closeZoneSheet();
    var d = MAP || window.STAGE1; if (!d) return;
    var z = zoneById(d, id); if (!z) return;
    var all = (z.acts || []).map(function (aid) { return actById(d, aid); }).filter(Boolean);
    var inside = all.filter(availFor);
    var body = inside.length
      ? '<div class="acts-group" style="margin-top:14px">' + inside.map(actRow).join('') + '</div>'
      : (all.length
        ? '<p class="sheet-desc">Активности этой зоны доступны по другой категории билета. Смени билет наверху раздела, чтобы их увидеть.</p>'
        : '<p class="sheet-desc">' + (z.desc || 'Информационная зона на территории автодрома.') + '</p>');
    var html =
      '<div class="sheet-back" data-sheet-close></div>' +
      '<div class="sheet" role="dialog" aria-modal="true">' +
        '<div class="sheet-grip"></div>' +
        '<div class="sheet-head"><div><div class="sheet-kind">' + (KIND_LABEL[z.kind] || '') + '</div>' +
        '<h3>' + z.label + '</h3></div><button class="sheet-x" data-sheet-close aria-label="Закрыть">✕</button></div>' +
        body + '</div>';
    var node = document.createElement('div'); node.id = 'sheetRoot'; node.innerHTML = html;
    document.body.appendChild(node);
    // подсветка выбранной зоны на карте
    var g = document.querySelector('.zone[data-zone="' + id + '"]'); if (g) g.classList.add('selected');
  }
  function closeZoneSheet() {
    var n = document.getElementById('sheetRoot'); if (n) n.remove();
    var sel = document.querySelector('.zone.selected'); if (sel) sel.classList.remove('selected');
  }

  /* ======================= БАЗА ЗНАНИЙ ======================= */
  function knowledgeScreen() {
    if (state.articleSlug) { var a = articleBySlug(state.articleSlug); if (a) return readerScreen(a); state.articleSlug = null; }
    return knowledgeList();
  }
  function knowledgeList() {
    var cats = ['Все'];
    arts.forEach(function (a) { if (cats.indexOf(a.category) < 0) cats.push(a.category); });
    var pills = cats.map(function (c) { return '<button class="pill' + (c === state.knCat ? ' active' : '') + '" data-kn-cat="' + c + '">' + c + '</button>'; }).join('');
    var list = arts.filter(function (a) {
      if (state.knCat !== 'Все' && a.category !== state.knCat) return false;
      if (state.hideRead && isRead(a.slug)) return false;
      return true;
    });
    var cards = list.map(function (a) {
      var read = isRead(a.slug);
      var tail = read ? '<span class="read-flag"><span class="ico">' + ICON.check + '</span>Прочитано</span>' : '<span class="art-time">' + a.readMins + ' мин чтения</span>';
      return '<a class="art-card' + (read ? ' is-read' : '') + '" data-article="' + a.slug + '">' +
        '<div class="art-thumb"><img src="' + a.cover + '" alt="" loading="lazy" onerror="' + IMG_FALLBACK + '"></div>' +
        '<div class="art-info"><div class="art-title">' + a.title + '</div>' +
        '<div class="art-row"><span class="badge">' + a.category + '</span>' + tail + '</div></div></a>';
    }).join('');
    var empty = list.length ? '' :
      '<div class="stub" style="margin-top:14px"><span class="ico">' + ICON.book + '</span><h3>Здесь пусто</h3><p>В этом фильтре статей нет - попробуй другой раздел или покажи прочитанное.</p></div>';
    return '<div class="race-head"><div class="eyebrow">Для зрителя</div><h1 class="screen-title">База знаний</h1></div>' +
      '<div class="pills">' + pills + '</div>' +
      '<div class="kn-toolbar"><span class="lbl">Скрыть прочитанное</span>' +
      '<label class="switch"><input type="checkbox" data-toggle="hideread"' + (state.hideRead ? ' checked' : '') + '><span class="track"></span><span class="thumb"></span></label></div>' +
      '<div class="art-list">' + cards + '</div>' + empty;
  }
  function renderBody(body) {
    return (body || []).map(function (b) {
      if (b.type === 'h') return '<h2>' + b.text + '</h2>';
      if (b.type === 'tip') return '<div class="tip">' + b.text + '</div>';
      if (b.type === 'quote') return '<div class="quote">' + b.text + '</div>';
      if (b.type === 'list') return '<ul>' + b.items.map(function (i) { return '<li>' + i + '</li>'; }).join('') + '</ul>';
      return '<p>' + b.text + '</p>';
    }).join('');
  }
  function readerScreen(a) {
    return '<button class="back-chip" data-kn-back="1"><span class="ico ico-15">' + ICON.back + '</span>База знаний</button>' +
      '<div class="reader-cover"><img src="' + a.cover + '" alt="" onerror="this.style.display=\'none\'"></div>' +
      '<span class="reader-badge">' + a.category + '</span>' +
      '<h1 class="reader-title">' + a.title + '</h1>' +
      '<div class="reader-meta">' + a.readMins + ' мин чтения · ' + fmtDate(a.date) + '</div>' +
      '<div class="reader-body">' + renderBody(a.body) + '</div>';
  }

  /* ---------- общая заглушка ---------- */
  function stub(icon, title, text, soon) {
    return '<div class="stub"><span class="ico">' + ICON[icon] + '</span><h3>' + title + '</h3><p>' + text + '</p>' +
      (soon ? '<span class="soon-pill">' + soon + '</span>' : '') + '</div>';
  }

  /* ---------- рендер ---------- */
  function screenHtml() {
    if (state.tab === 'race') return raceScreen();
    if (state.tab === 'knowledge') return knowledgeScreen();
    return calendarScreen();
  }
  function render() {
    closeZoneSheet();
    document.getElementById('app').innerHTML =
      '<div class="app-shell">' + header() + '<main class="screen">' + screenHtml() + '</main></div>';
    window.scrollTo(0, 0);
    if (state.tab === 'race' && state.raceSection === 'map') initMap();
    ensureTrap();
  }

  /* ---------- карта: пан + зум + тап ---------- */
  function initMap() {
    var wrap = document.getElementById('mapWrap'); if (!wrap) return;
    var svg = wrap.querySelector('svg'); var vp = svg.querySelector('#vp');
    if (!svg || !vp) return;
    var vb = (svg.getAttribute('viewBox') || '0 0 1000 660').split(/\s+/);
    var VW = +vb[2] || 1000, VH = +vb[3] || 660;
    var t = { s: 1, x: 0, y: 0 };
    function clamp() { var mx = (t.s - 1) * VW, my = (t.s - 1) * VH; t.x = Math.min(0, Math.max(-mx, t.x)); t.y = Math.min(0, Math.max(-my, t.y)); }
    function apply() { vp.setAttribute('transform', 'translate(' + t.x.toFixed(1) + ' ' + t.y.toFixed(1) + ') scale(' + t.s.toFixed(3) + ')'); }
    function zoom(dir) { var ns = Math.min(3, Math.max(1, t.s * (dir > 0 ? 1.45 : 1 / 1.45))); var cx = VW / 2, cy = VH / 2; t.x = cx - (cx - t.x) * (ns / t.s); t.y = cy - (cy - t.y) * (ns / t.s); t.s = ns; clamp(); apply(); }
    wrap.querySelectorAll('[data-zoom]').forEach(function (b) { b.addEventListener('click', function () { zoom(b.getAttribute('data-zoom') === 'in' ? 1 : -1); }); });
    var drag = null, moved = 0;
    svg.addEventListener('pointerdown', function (e) { drag = { px: e.clientX, py: e.clientY, x: t.x, y: t.y }; moved = 0; try { svg.setPointerCapture(e.pointerId); } catch (_) {} });
    svg.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var k = VW / (svg.clientWidth || 360);
      moved = Math.max(moved, Math.abs(e.clientX - drag.px) + Math.abs(e.clientY - drag.py));
      t.x = drag.x + (e.clientX - drag.px) * k; t.y = drag.y + (e.clientY - drag.py) * k; clamp(); apply();
    });
    function end(e) {
      if (!drag) return; var wasDrag = moved > 6; drag = null;
      if (!wasDrag && e.target.closest) { var z = e.target.closest('.tappable'); if (z) openZoneSheet(z.getAttribute('data-zone')); }
    }
    svg.addEventListener('pointerup', end);
    svg.addEventListener('pointercancel', function () { drag = null; });
    apply();
  }

  /* ---------- поведение ---------- */
  function setTab(id) { if (state.tab !== id) { state.tab = id; state.articleSlug = null; render(); } }
  function openStage(id) { state.stageId = id; state.tab = 'race'; state.raceSection = 'map'; render(); }
  function openArticle(slug) { state.articleSlug = slug; markRead(slug); render(); }
  function toggleDone(chk) {
    var actId = chk.getAttribute('data-done'); var k = doneKey(actId);
    if (doneMap[k]) delete doneMap[k]; else doneMap[k] = 1;
    save(DONE_KEY, doneMap);
    var on = !!doneMap[k];
    chk.classList.toggle('on', on);
    var row = chk.closest('.act'); if (row) row.classList.toggle('on', on);
    updateProg();
  }

  document.addEventListener('click', function (e) {
    var done = e.target.closest('[data-done]'); if (done) { toggleDone(done); return; }
    var sc = e.target.closest('[data-sheet-close]'); if (sc) { closeZoneSheet(); return; }
    var art = e.target.closest('[data-article]'); if (art) { openArticle(art.getAttribute('data-article')); return; }
    var cat = e.target.closest('[data-kn-cat]'); if (cat) { state.knCat = cat.getAttribute('data-kn-cat'); render(); return; }
    var knb = e.target.closest('[data-kn-back]'); if (knb) { state.articleSlug = null; render(); return; }
    var tkt = e.target.closest('[data-ticket]'); if (tkt) { state.ticket = tkt.getAttribute('data-ticket'); save(TICKET_KEY, state.ticket); render(); return; }
    var rs = e.target.closest('[data-race-sec]'); if (rs) { state.raceSection = rs.getAttribute('data-race-sec'); render(); return; }
    var stg = e.target.closest('[data-stage]'); if (stg) { openStage(stg.getAttribute('data-stage')); return; }
    var tb = e.target.closest('[data-tab]'); if (tb) { setTab(tb.getAttribute('data-tab')); return; }
  });
  document.addEventListener('change', function (e) {
    var el = e.target.closest('[data-toggle="hideread"]'); if (el) { state.hideRead = el.checked; render(); }
  });

  /* ---------- кнопка/жест «назад»: перехватываем, чтобы не закрывать апп ---------- */
  var trapArmed = false;
  function stillDeep() {
    return !!document.getElementById('sheetRoot') ||
      (state.tab === 'knowledge' && state.articleSlug) ||
      state.tab !== 'calendar';
  }
  function armBack() { try { history.pushState({ sh: 1 }, ''); } catch (e) {} trapArmed = true; }
  function ensureTrap() { if (stillDeep() && !trapArmed) armBack(); }
  function handleBack() {
    if (document.getElementById('sheetRoot')) { closeZoneSheet(); return true; }
    if (state.tab === 'knowledge' && state.articleSlug) { state.articleSlug = null; render(); return true; }
    if (state.tab !== 'calendar') { setTab('calendar'); return true; }
    return false;
  }
  window.addEventListener('popstate', function () {
    trapArmed = false;
    var handled = handleBack();
    if (handled && stillDeep()) armBack();
  });

  /* ---------- VK Bridge: инициализация + подтяжка прогресса из VK Storage ---------- */
  function mergeFlags(map, raw) {
    if (!raw) return 0; var ch = 0;
    try { var o = JSON.parse(raw); for (var k in o) { if (o[k] && !map[k]) { map[k] = 1; ch = 1; } } } catch (e) {}
    return ch;
  }
  function bootVK() {
    if (!window.SH_VK) return;
    SH_VK.init(function () { if (SH_VK.user) render(); });
    if (SH_VK.inVK && SH_VK.storageGet) {
      SH_VK.storageGet([READ_KEY, DONE_KEY, TICKET_KEY]).then(function (v) {
        var ch = mergeFlags(readMap, v[READ_KEY]) | mergeFlags(doneMap, v[DONE_KEY]);
        if (v[TICKET_KEY]) { try { var tk = JSON.parse(v[TICKET_KEY]); if (tk && tk !== state.ticket) { state.ticket = tk; ch = 1; } } catch (e) {} }
        if (ch) { save(READ_KEY, readMap); save(DONE_KEY, doneMap); render(); }
      }).catch(function () {});
    }
  }

  render();
  bootVK();
})();

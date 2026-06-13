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
  var CHAMPS = window.CHAMPS || [];

  /* ---------- иконки ---------- */
  var ICON = {
    mark: '<svg viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="11" fill="#FF4D14"/><path d="M20 9l9.5 22-9.5-5-9.5 5L20 9Z" fill="#fff"/><path d="M20 9l9.5 22-9.5-5V9Z" fill="#FFD7C6"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2V5Z"/><path d="M4 20a2 2 0 0 0 2 2h13"/></svg>',
    flag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21V4M4 4h13l-2 4 2 4H4"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-4.5-9.5-9C1 9 2.5 5.5 6 5.5c2 0 3.2 1.2 4 2.3.8-1.1 2-2.3 4-2.3 3.5 0 5 3.5 3.5 6.5C19 16.5 12 21 12 21Z"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>'
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
  var PROFILE_KEY = 'sh_profile_v1';
  var profile = loadVal(PROFILE_KEY, { onboarded: false, discs: [], visited: {}, wishlist: {}, early: 0, night: 0 });
  function saveProfile() { save(PROFILE_KEY, profile); }

  var state = { tab: 'calendar', stageId: nextId, champId: null, knCat: 'Все', hideRead: false, articleSlug: null, raceSection: 'map', ticket: loadVal(TICKET_KEY, 'Все'), profView: 'main', achTab: 'available' };

  var TABS = [
    { id: 'calendar', label: 'Календарь', icon: 'calendar' },
    { id: 'race', label: 'Навигация', icon: 'pin' },
    { id: 'knowledge', label: 'База знаний', icon: 'book' },
    { id: 'profile', label: 'Профиль', icon: 'user' }
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

  /* ======================= КАЛЕНДАРЬ (ГОНКИ) ======================= */
  var DISC = {
    drift: { c: '#FF5A1F', label: 'Дрифт' },
    circuit: { c: '#2E8BFF', label: 'Кольцо' },
    rally: { c: '#19B36B', label: 'Ралли' },
    moto: { c: '#B26BFF', label: 'Мото' }
  };
  function discColor(k) { return (DISC[k] || {}).c || '#888'; }
  function discLabel(k) { return (DISC[k] || {}).label || k; }
  function plural(n, one, few, many) {
    var d = n % 10, h = n % 100;
    if (d === 1 && h !== 11) return one;
    if (d >= 2 && d <= 4 && (h < 10 || h >= 20)) return few;
    return many;
  }
  function champById(id) { for (var i = 0; i < CHAMPS.length; i++) { if (CHAMPS[i].id === id) return CHAMPS[i]; } return null; }
  function champEvents(c) { return c.useREC ? ((window.REC && REC.stages) || []) : (c.events || []); }
  function nextEventLabel(c) {
    var list = champEvents(c).slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    for (var i = 0; i < list.length; i++) { if (dObj(list[i].date) >= today) return list[i].dateLabel || fmtDate(list[i].date); }
    return list.length ? (list[list.length - 1].dateLabel || fmtDate(list[list.length - 1].date)) : '';
  }

  function recStageCard(s) {
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
  }

  function calendarScreen() {
    if (state.champId) { var c = champById(state.champId); if (c) return champEventsScreen(c); state.champId = null; }
    return champListScreen();
  }

  function champCard(c) {
    var dc = discColor(c.disc);
    var cnt = champEvents(c).length;
    return '<a class="champ-card" data-champ="' + c.id + '" style="--disc:' + dc + '">' +
      '<div class="champ-bar"></div>' +
      '<div class="champ-body">' +
        '<div class="champ-top"><span class="champ-disc">' + discLabel(c.disc) + '</span>' + (c.nav ? '<span class="champ-nav">Навигация</span>' : '') + '</div>' +
        '<div class="champ-name">' + c.name + '</div>' +
        '<div class="champ-meta">' + cnt + ' ' + plural(cnt, 'этап', 'этапа', 'этапов') + ' · ближайший ' + nextEventLabel(c) + '</div>' +
      '</div>' +
      '<span class="ico champ-arrow">' + ICON.arrow + '</span></a>';
  }

  function champListScreen() {
    return '<div class="cal-hero">' +
        '<div class="eyebrow">Календарь · сезон ' + (window.REC ? REC.season : 2026) + '</div>' +
        '<h1 class="cal-title">Гонки</h1>' +
        '<p class="cal-sub">Выбери гонку - внутри все её этапы. Навигация по треку пока доступна для REC.</p></div>' +
      '<div class="champ-list">' + CHAMPS.map(champCard).join('') + '</div>';
  }

  function champEventsScreen(c) {
    var dc = discColor(c.disc);
    var head = '<button class="back-chip" data-champ-back="1"><span class="ico ico-15">' + ICON.back + '</span>Все гонки</button>' +
      '<div class="cal-hero" style="margin-bottom:16px">' +
        '<div class="eyebrow" style="color:' + dc + '">' + discLabel(c.disc) + ' · сезон ' + (window.REC ? REC.season : 2026) + '</div>' +
        '<h1 class="cal-title">' + c.name + '</h1>' +
        (c.nav
          ? '<p class="cal-sub">Выбери этап - внутри карта автодрома, активности и расписание.</p>'
          : '<p class="cal-sub">Навигация по треку пока доступна только для REC. Здесь - календарь этапов серии.</p>') +
      '</div>';
    if (c.useREC) return head + '<div class="stage-list">' + REC.stages.map(recStageCard).join('') + '</div>';
    var evs = (c.events || []).slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    var cards = evs.map(function (e) {
      return '<div class="ev-card" style="--disc:' + dc + '">' +
        '<div class="ev-date">' + (e.dateLabel || fmtDate(e.date)) + '</div>' +
        '<div class="ev-body"><div class="ev-name">' + e.name + '</div>' +
        '<div class="ev-place"><span class="ico">' + ICON.pin + '</span>' + e.track + ' · ' + e.city + '</div></div></div>';
    }).join('');
    return head + '<div class="ev-list">' + cards + '</div>';
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

  /* ======================= ПРОФИЛЬ + ДОСТИЖЕНИЯ ======================= */
  function allEvents() {
    var out = [];
    CHAMPS.forEach(function (c) {
      champEvents(c).forEach(function (e, i) {
        out.push({ key: c.id + ':' + (e.id || i), disc: c.disc, name: e.name || displayName(e), date: e.date, dateLabel: e.dateLabel, track: e.track });
      });
    });
    return out;
  }
  function evByKey() { var m = {}; allEvents().forEach(function (e) { m[e.key] = e; }); return m; }

  var ACHS = [
    { id: 'first-race', title: 'Первый заезд', desc: 'Побывал на первой гонке' },
    { id: 'regular', title: 'Завсегдатай', desc: 'Посетил 10 гонок' },
    { id: 'explorer', title: 'Всё успел', desc: 'Отметил все активности этапа' },
    { id: 'drift', title: 'Дрифт-фан', desc: 'Был на дрифт-гонке' },
    { id: 'circuit', title: 'Кольцевик', desc: 'Был на кольцевой гонке' },
    { id: 'rally', title: 'Раллист', desc: 'Был на ралли' },
    { id: 'moto', title: 'Мотофан', desc: 'Был на мотогонке' },
    { id: 'early', title: 'Ранняя пташка', desc: 'Отметился ранним утром' },
    { id: 'night', title: 'Полуночник', desc: 'Отметился поздним вечером' },
    { id: 'bookworm', title: 'Знаток', desc: 'Прочитал все статьи' }
  ];
  function earnedSet() {
    var visited = profile.visited || {}, keys = Object.keys(visited), em = evByKey(), discs = {};
    keys.forEach(function (k) { var e = em[k]; if (e) discs[e.disc] = true; });
    var allAct = false;
    if (window.STAGE1 && STAGE1.activities && STAGE1.activities.length) {
      REC.stages.forEach(function (s) {
        if (STAGE1.activities.every(function (a) { return doneMap[s.id + '|' + a.id]; })) allAct = true;
      });
    }
    var allRead = arts.length > 0 && arts.every(function (a) { return readMap[a.slug]; });
    var n = keys.length;
    return {
      'first-race': n >= 1, 'regular': n >= 10, 'explorer': allAct,
      'drift': !!discs.drift, 'circuit': !!discs.circuit, 'rally': !!discs.rally, 'moto': !!discs.moto,
      'early': !!profile.early, 'night': !!profile.night, 'bookworm': allRead
    };
  }

  function userName() {
    var u = window.SH_VK && SH_VK.user;
    return u && u.first_name ? (u.first_name + (u.last_name ? ' ' + u.last_name : '')) : 'Гость';
  }
  function userAva() { return (window.SH_VK && SH_VK.user && SH_VK.user.photo_100) ? SH_VK.user.photo_100 : ''; }

  function profileScreen() {
    if (state.profView === 'ach') return achievementsScreen();
    if (state.profView === 'onboard' || !profile.onboarded) return onboardingScreen();
    return profileMain();
  }

  function onboardingScreen() {
    var DLIST = [['drift', 'Дрифт'], ['circuit', 'Кольцо'], ['rally', 'Ралли'], ['moto', 'Мото']];
    var discPills = DLIST.map(function (d) {
      var on = (profile.discs || []).indexOf(d[0]) >= 0;
      return '<button class="pill' + (on ? ' active' : '') + '" data-onb-disc="' + d[0] + '">' + d[1] + '</button>';
    }).join('');
    var rows = '';
    CHAMPS.forEach(function (c) {
      rows += '<div class="onb-grouptitle" style="color:' + discColor(c.disc) + '">' + c.name + '</div>';
      champEvents(c).forEach(function (e, i) {
        var key = c.id + ':' + (e.id || i);
        var v = !!(profile.visited && profile.visited[key]);
        var w = !!(profile.wishlist && profile.wishlist[key]);
        rows += '<div class="onb-row">' +
          '<div class="onb-ev"><div class="onb-evname">' + (e.name || displayName(e)) + '</div>' +
          '<div class="onb-evmeta">' + (e.dateLabel || fmtDate(e.date)) + ' · ' + e.track + '</div></div>' +
          '<button class="onb-tg v' + (v ? ' on' : '') + '" data-onb-visit="' + key + '" aria-label="Был"><span class="ico">' + ICON.check + '</span></button>' +
          '<button class="onb-tg w' + (w ? ' on' : '') + '" data-onb-wish="' + key + '" aria-label="Хочу"><span class="ico">' + ICON.heart + '</span></button>' +
        '</div>';
      });
    });
    return '<div class="race-head"><div class="eyebrow">Профиль</div>' +
        '<h1 class="screen-title">' + (profile.onboarded ? 'Мои предпочтения' : 'Привет!') + '</h1>' +
        '<div class="race-meta">' + (profile.onboarded ? 'Отметь, где был и что хочешь посетить.' : 'Пара отметок, и профиль оживёт. Всё сохранится у тебя.') + '</div></div>' +
      '<div class="onb-block"><h4>Любимые дисциплины</h4><div class="pills onb-pills">' + discPills + '</div></div>' +
      '<div class="onb-block"><h4>Где был и что хочешь</h4>' +
        '<div class="onb-legend"><span class="onb-tg v on sm"><span class="ico">' + ICON.check + '</span></span> был&ensp;&ensp;<span class="onb-tg w on sm"><span class="ico">' + ICON.heart + '</span></span> хочу</div>' +
        rows + '</div>' +
      '<button class="onb-done" data-onb-done="1">Готово</button>';
  }

  function statBox(n, label) { return '<div class="statbox"><div class="statn">' + n + '</div><div class="statl">' + label + '</div></div>'; }

  function profileMain() {
    var ava = userAva();
    var doneCount = Object.keys(doneMap).length, readCount = Object.keys(readMap).length, visitedCount = Object.keys(profile.visited || {}).length;
    var es = earnedSet();
    var earnedList = ACHS.filter(function (a) { return es[a.id]; });
    var em = evByKey();
    function evLine(map) {
      var keys = Object.keys(map || {});
      if (!keys.length) return '<div class="prof-empty">Пока пусто</div>';
      return '<div class="prof-evs">' + keys.map(function (k) {
        var e = em[k]; if (!e) return '';
        return '<div class="prof-ev"><span class="ev-dot" style="background:' + discColor(e.disc) + '"></span>' + e.name + ' <span class="prof-evtrack">· ' + e.track + '</span></div>';
      }).join('') + '</div>';
    }
    var discChips = (profile.discs || []).length
      ? profile.discs.map(function (d) { return '<span class="dchip" style="--disc:' + discColor(d) + '">' + discLabel(d) + '</span>'; }).join('')
      : '<span class="prof-empty">Не выбраны</span>';
    var achPreview = earnedList.length
      ? '<div class="ach-prevrow">' + earnedList.slice(0, 6).map(function (a) {
          return '<img class="ach-prev" src="assets/img/achievements/ach-' + a.id + '.png" alt="' + a.title + '" loading="lazy" onerror="this.style.visibility=\'hidden\'">';
        }).join('') + '</div>'
      : '<div class="prof-empty">Пока нет. Отмечай активности и читай статьи!</div>';

    return '<div class="prof-card">' +
        (ava ? '<img class="prof-ava" src="' + ava + '" alt="">' : '<div class="prof-ava ph"><span class="ico">' + ICON.user + '</span></div>') +
        '<div class="prof-id"><div class="prof-name">' + userName() + '</div><div class="prof-sub">Билет: ' + state.ticket + '</div></div>' +
        '<button class="prof-edit" data-onb-edit="1">Изменить</button>' +
      '</div>' +
      '<div class="prof-stats">' + statBox(visitedCount, 'гонок') + statBox(doneCount, 'активностей') + statBox(readCount, 'статей') + '</div>' +
      '<div class="prof-sec"><h4>Любимые дисциплины</h4><div class="dchips">' + discChips + '</div></div>' +
      '<div class="prof-sec"><div class="prof-sechead"><h4>Достижения</h4><button class="link-mini" data-prof-ach="1">Все ' + earnedList.length + '/' + ACHS.length + '<span class="ico ico-15">' + ICON.arrow + '</span></button></div>' + achPreview + '</div>' +
      '<div class="prof-sec"><h4>Был на гонках</h4>' + evLine(profile.visited) + '</div>' +
      '<div class="prof-sec"><h4>Хочу посетить</h4>' + evLine(profile.wishlist) + '</div>';
  }

  function achievementsScreen() {
    var es = earnedSet(), tab = state.achTab;
    var seg = '<div class="seg">' +
      '<button class="seg-btn' + (tab === 'earned' ? ' active' : '') + '" data-ach-tab="earned">Полученные</button>' +
      '<button class="seg-btn' + (tab === 'available' ? ' active' : '') + '" data-ach-tab="available">Доступные</button></div>';
    var list = ACHS.filter(function (a) { return tab === 'earned' ? es[a.id] : !es[a.id]; });
    var grid = list.length
      ? '<div class="ach-grid">' + list.map(function (a) {
          var earned = !!es[a.id];
          return '<div class="ach-card' + (earned ? ' earned' : ' locked') + '">' +
            '<div class="ach-ico"><img src="assets/img/achievements/ach-' + a.id + '.png" alt="" loading="lazy" onerror="this.style.opacity=0">' +
            (earned ? '' : '<span class="ach-lock"><span class="ico">' + ICON.lock + '</span></span>') + '</div>' +
            '<div class="ach-title">' + a.title + '</div><div class="ach-desc">' + a.desc + '</div></div>';
        }).join('') + '</div>'
      : '<div class="stub" style="margin-top:8px"><span class="ico">' + ICON.flag + '</span><h3>' + (tab === 'earned' ? 'Пока ничего' : 'Всё собрано!') + '</h3><p>' + (tab === 'earned' ? 'Отмечай активности на гонках и читай статьи, и достижения появятся здесь.' : 'Ты собрал все достижения. Красавчик!') + '</p></div>';
    return '<button class="back-chip" data-prof-back="1"><span class="ico ico-15">' + ICON.back + '</span>Профиль</button>' +
      '<div class="race-head" style="margin-bottom:14px"><div class="eyebrow">Профиль</div><h1 class="screen-title">Достижения</h1></div>' +
      seg + grid;
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
    if (state.tab === 'profile') return profileScreen();
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
    if (on) {
      var hh = new Date().getHours(); var pc = false;
      if (hh < 9 && !profile.early) { profile.early = 1; pc = true; }
      if ((hh >= 22 || hh < 5) && !profile.night) { profile.night = 1; pc = true; }
      if (pc) saveProfile();
    }
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
    var chb = e.target.closest('[data-champ-back]'); if (chb) { state.champId = null; render(); return; }
    var chp = e.target.closest('[data-champ]'); if (chp) { state.champId = chp.getAttribute('data-champ'); render(); return; }
    var od = e.target.closest('[data-onb-disc]'); if (od) { var dk = od.getAttribute('data-onb-disc'); var arr = profile.discs || (profile.discs = []); var ix = arr.indexOf(dk); if (ix >= 0) arr.splice(ix, 1); else arr.push(dk); od.classList.toggle('active'); saveProfile(); return; }
    var ov = e.target.closest('[data-onb-visit]'); if (ov) { var vk = ov.getAttribute('data-onb-visit'); profile.visited = profile.visited || {}; if (profile.visited[vk]) delete profile.visited[vk]; else profile.visited[vk] = 1; ov.classList.toggle('on'); saveProfile(); return; }
    var ow = e.target.closest('[data-onb-wish]'); if (ow) { var wk = ow.getAttribute('data-onb-wish'); profile.wishlist = profile.wishlist || {}; if (profile.wishlist[wk]) delete profile.wishlist[wk]; else profile.wishlist[wk] = 1; ow.classList.toggle('on'); saveProfile(); return; }
    var odn = e.target.closest('[data-onb-done]'); if (odn) { profile.onboarded = true; state.profView = 'main'; saveProfile(); render(); return; }
    var oe = e.target.closest('[data-onb-edit]'); if (oe) { state.profView = 'onboard'; render(); return; }
    var pa = e.target.closest('[data-prof-ach]'); if (pa) { state.profView = 'ach'; render(); return; }
    var pb = e.target.closest('[data-prof-back]'); if (pb) { state.profView = 'main'; render(); return; }
    var at = e.target.closest('[data-ach-tab]'); if (at) { state.achTab = at.getAttribute('data-ach-tab'); render(); return; }
    var stg = e.target.closest('[data-stage]'); if (stg) { openStage(stg.getAttribute('data-stage')); return; }
    var tb = e.target.closest('[data-tab]'); if (tb) { var tbid = tb.getAttribute('data-tab'); if (tb.classList.contains('tab')) { if (tbid === 'calendar') state.champId = null; if (tbid === 'profile') state.profView = 'main'; } setTab(tbid); return; }
  });
  document.addEventListener('change', function (e) {
    var el = e.target.closest('[data-toggle="hideread"]'); if (el) { state.hideRead = el.checked; render(); }
  });

  /* ---------- кнопка/жест «назад»: перехватываем, чтобы не закрывать апп ---------- */
  var trapArmed = false;
  function stillDeep() {
    return !!document.getElementById('sheetRoot') ||
      (state.tab === 'knowledge' && state.articleSlug) ||
      state.tab !== 'calendar' ||
      (state.tab === 'calendar' && !!state.champId);
  }
  function armBack() { try { history.pushState({ sh: 1 }, ''); } catch (e) {} trapArmed = true; }
  function ensureTrap() { if (stillDeep() && !trapArmed) armBack(); }
  function handleBack() {
    if (document.getElementById('sheetRoot')) { closeZoneSheet(); return true; }
    if (state.tab === 'knowledge' && state.articleSlug) { state.articleSlug = null; render(); return true; }
    if (state.tab === 'profile' && state.profView === 'ach') { state.profView = 'main'; render(); return true; }
    if (state.tab === 'profile' && state.profView === 'onboard' && profile.onboarded) { state.profView = 'main'; render(); return true; }
    if (state.tab !== 'calendar') { setTab('calendar'); return true; }
    if (state.champId) { state.champId = null; render(); return true; }
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
      SH_VK.storageGet([READ_KEY, DONE_KEY, TICKET_KEY, PROFILE_KEY]).then(function (v) {
        var ch = mergeFlags(readMap, v[READ_KEY]) | mergeFlags(doneMap, v[DONE_KEY]);
        if (v[TICKET_KEY]) { try { var tk = JSON.parse(v[TICKET_KEY]); if (tk && tk !== state.ticket) { state.ticket = tk; ch = 1; } } catch (e) {} }
        if (v[PROFILE_KEY]) { try { var p = JSON.parse(v[PROFILE_KEY]); if (p && typeof p === 'object' && (p.onboarded || !profile.onboarded)) { profile = p; save(PROFILE_KEY, profile); ch = 1; } } catch (e) {} }
        if (ch) { save(READ_KEY, readMap); save(DONE_KEY, doneMap); render(); }
      }).catch(function () {});
    }
  }

  render();
  bootVK();
})();

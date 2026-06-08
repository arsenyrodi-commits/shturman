/* Календарь — фасетные фильтры (дисциплина, регион, цена, месяц, поиск). */
window.PAGE_INIT = function () {
  var EV = (window.SHTURMAN && window.SHTURMAN.events) || [];
  var REGIONS = (window.SHTURMAN && window.SHTURMAN.regions) || [];

  var state = { discipline: 'all', region: 'all', price: 'all', month: 'all', q: '' };

  var DISC = [
    { k: 'all', label: 'Все дисциплины' },
    { k: 'drift', label: 'Дрифт' },
    { k: 'circuit', label: 'Кольцо' },
    { k: 'rally', label: 'Ралли' },
    { k: 'moto', label: 'Мото' }
  ];
  var PRICE = [
    { k: 'all', label: 'Любая цена' },
    { k: 'free', label: 'Бесплатно' },
    { k: 'paid', label: 'По билетам' }
  ];

  var els = {
    disc: document.getElementById('disc-chips'),
    price: document.getElementById('price-chips'),
    region: document.getElementById('region-select'),
    month: document.getElementById('month-select'),
    search: document.getElementById('search'),
    results: document.getElementById('cal-results'),
    count: document.getElementById('result-count'),
    empty: document.getElementById('empty-state'),
    reset: document.getElementById('reset-filters')
  };

  function ruPlural(n, forms) {
    var n10 = n % 10, n100 = n % 100;
    if (n10 === 1 && n100 !== 11) return forms[0];
    if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return forms[1];
    return forms[2];
  }

  /* ---- читаем URL ---- */
  function readURL() {
    var p = new URLSearchParams(location.search);
    ['discipline', 'region', 'price', 'month', 'q'].forEach(function (k) {
      if (p.get(k)) state[k] = p.get(k);
    });
  }
  function writeURL() {
    var p = new URLSearchParams();
    Object.keys(state).forEach(function (k) { if (state[k] && state[k] !== 'all') p.set(k, state[k]); });
    var qs = p.toString();
    history.replaceState(null, '', location.pathname + (qs ? '?' + qs : ''));
  }

  /* ---- построение контролов ---- */
  function buildChips(container, items, key, accent) {
    container.innerHTML = items.map(function (it) {
      var pressed = state[key] === it.k;
      return '<button class="chip' + (accent ? ' chip-accent' : '') + '" data-k="' + it.k + '" aria-pressed="' + pressed + '">' + it.label + '</button>';
    }).join('');
    container.querySelectorAll('.chip').forEach(function (b) {
      b.addEventListener('click', function () { state[key] = b.getAttribute('data-k'); refreshChips(container, key); apply(); });
    });
  }
  function refreshChips(container, key) {
    container.querySelectorAll('.chip').forEach(function (b) {
      b.setAttribute('aria-pressed', state[key] === b.getAttribute('data-k'));
    });
  }

  function buildRegion() {
    var opts = '<option value="all">Все регионы</option>';
    REGIONS.slice().sort(function (a, b) { return a.localeCompare(b, 'ru'); }).forEach(function (r) {
      opts += '<option value="' + r + '"' + (state.region === r ? ' selected' : '') + '>' + r + '</option>';
    });
    els.region.innerHTML = opts;
    els.region.addEventListener('change', function () { state.region = els.region.value; apply(); });
  }

  function buildMonth() {
    var seen = {}, list = [];
    EV.forEach(function (ev) { var ym = ev.dateStart.slice(0, 7); if (!seen[ym]) { seen[ym] = 1; list.push(ym); } });
    list.sort();
    var opts = '<option value="all">Весь сезон</option>';
    list.forEach(function (ym) {
      var m = parseInt(ym.slice(5, 7), 10) - 1;
      var label = SH.MONTHS_FULL ? '' : '';
      var name = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'][m];
      opts += '<option value="' + ym + '"' + (state.month === ym ? ' selected' : '') + '>' + name + ' ' + ym.slice(0, 4) + '</option>';
    });
    els.month.innerHTML = opts;
    els.month.addEventListener('change', function () { state.month = els.month.value; apply(); });
  }

  /* ---- фильтрация ---- */
  function match(ev) {
    if (state.discipline !== 'all' && ev.discipline !== state.discipline) return false;
    if (state.region !== 'all' && ev.region !== state.region) return false;
    if (state.price === 'free' && !ev.free) return false;
    if (state.price === 'paid' && ev.free) return false;
    if (state.month !== 'all' && ev.dateStart.slice(0, 7) !== state.month) return false;
    if (state.q) {
      var hay = (ev.title + ' ' + ev.series + ' ' + ev.track + ' ' + ev.city + ' ' + ev.format + ' ' + ev.region).toLowerCase();
      if (hay.indexOf(state.q.toLowerCase()) === -1) return false;
    }
    return true;
  }

  function anyActive() {
    return state.discipline !== 'all' || state.region !== 'all' || state.price !== 'all' || state.month !== 'all' || !!state.q;
  }

  function apply() {
    var filtered = EV.filter(match);
    els.results.innerHTML = filtered.map(SH.eventCard).join('');
    els.count.textContent = filtered.length + ' ' + ruPlural(filtered.length, ['событие', 'события', 'событий']);
    els.empty.classList.toggle('hidden', filtered.length !== 0);
    els.results.classList.toggle('hidden', filtered.length === 0);
    els.reset.style.display = anyActive() ? '' : 'none';
    writeURL();
  }

  /* ---- сброс ---- */
  els.reset.addEventListener('click', function () {
    state = { discipline: 'all', region: 'all', price: 'all', month: 'all', q: '' };
    els.search.value = '';
    els.region.value = 'all';
    els.month.value = 'all';
    refreshChips(els.disc, 'discipline');
    refreshChips(els.price, 'price');
    apply();
  });

  els.search.addEventListener('input', function () { state.q = els.search.value.trim(); apply(); });

  /* ---- init ---- */
  readURL();
  buildChips(els.disc, DISC, 'discipline', true);
  buildChips(els.price, PRICE, 'price', false);
  buildRegion();
  buildMonth();
  els.search.value = state.q;
  apply();

  // sticky filter bar под плавающей шапкой
  var fb = document.getElementById('filter-bar');
  if (fb) fb.style.top = '84px';
};

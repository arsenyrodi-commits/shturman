/* База знаний - редакторский список + фильтр по категориям. */
window.PAGE_INIT = function () {
  var ARTS = (window.SHTURMAN && window.SHTURMAN.articles) || [];
  var I = SH.ICON;
  var active = SH.qs('cat') || 'all';

  var cats = ['all'];
  ARTS.forEach(function (a) { if (cats.indexOf(a.category) === -1) cats.push(a.category); });

  var chipsEl = document.getElementById('cat-chips');
  var listEl = document.getElementById('blog-list');
  var FB = "this.style.display='none';this.parentNode.classList.add('img-failed')";

  function label(c) { return c === 'all' ? 'Все статьи' : c; }

  function renderChips() {
    chipsEl.innerHTML = cats.map(function (c) {
      return '<button class="chip chip-accent" data-cat="' + c + '" aria-pressed="' + (active === c) + '">' + label(c) + '</button>';
    }).join('');
    chipsEl.querySelectorAll('.chip').forEach(function (b) {
      b.addEventListener('click', function () {
        active = b.getAttribute('data-cat');
        chipsEl.querySelectorAll('.chip').forEach(function (x) { x.setAttribute('aria-pressed', x.getAttribute('data-cat') === active); });
        history.replaceState(null, '', location.pathname + (active !== 'all' ? '?cat=' + encodeURIComponent(active) : ''));
        renderList();
      });
    });
  }

  function row(a, i) {
    var num = (i + 1 < 10 ? '0' : '') + (i + 1);
    return '' +
      '<a class="group block py-8" style="border-bottom:1px solid var(--line-light)" href="article.html?slug=' + a.slug + '">' +
        '<div class="grid md:grid-cols-[auto_1fr_240px] gap-5 md:gap-8 items-center">' +
          '<div class="font-display text-orange" style="font-size:26px;min-width:42px">' + num + '</div>' +
          '<div>' +
            '<div class="flex items-center gap-3 mb-3 text-inktext-faint text-[13px]" style="font-family:var(--font-head);font-weight:700;letter-spacing:.06em;text-transform:uppercase">' +
              '<span class="text-orange">' + a.category + '</span><span class="w-1 h-1 rounded-full bg-current"></span><span>' + a.readMins + ' мин</span>' +
            '</div>' +
            '<h3 class="leading-tight transition-colors group-hover:text-orange text-balance" style="font-size:clamp(24px,3.6vw,40px)">' + a.title + '</h3>' +
            '<p class="text-inktext-dim mt-3 max-w-2xl text-[16px]">' + a.excerpt + '</p>' +
            '<span class="link-arrow text-orange mt-4 text-[15px]">Читать статью ' + I.arrow + '</span>' +
          '</div>' +
          '<div class="media rounded-xl hidden md:block" style="aspect-ratio:4/3"><img src="' + a.cover + '" alt="' + a.title + '" loading="lazy" onerror="' + FB + '"><div class="speedlines"></div></div>' +
        '</div>' +
      '</a>';
  }

  function renderList() {
    var filtered = active === 'all' ? ARTS : ARTS.filter(function (a) { return a.category === active; });
    listEl.innerHTML = '<div style="border-top:1px solid var(--line-light)">' + filtered.map(row).join('') + '</div>';
  }

  renderChips();
  renderList();
};

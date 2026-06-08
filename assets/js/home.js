/* Главная — динамические блоки: ближайшее событие, афиша, статьи. */
window.PAGE_INIT = function () {
  var all = (window.SHTURMAN && window.SHTURMAN.events) || [];
  var today = new Date(); today.setHours(0, 0, 0, 0);
  function endOf(ev) { return new Date((ev.dateEnd || ev.dateStart) + 'T23:59:00'); }
  var upcoming = all.filter(function (ev) { return endOf(ev) >= today; });
  var list = upcoming.length ? upcoming : all;

  var hero = document.getElementById('hero-next');
  if (hero && list[0]) hero.innerHTML = SH.eventCard(list[0]);

  var fe = document.getElementById('featured-events');
  if (fe) fe.innerHTML = list.slice(0, 6).map(SH.eventCard).join('');

  var arts = (window.SHTURMAN && window.SHTURMAN.articles) || [];
  var ha = document.getElementById('home-articles');
  if (ha) ha.innerHTML = arts.slice(0, 3).map(function (a, i) { return SH.articleCard(a, i); }).join('');
};

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

  initHeroVideo();
};

/* Фон-видео hero: подключаем ТОЛЬКО если файл реально существует (без 404-мусора и зависших медиа). */
function initHeroVideo() {
  var bg = document.getElementById('hero-bg');
  if (!bg) return;
  var src = bg.getAttribute('data-video');
  if (!src || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var v = document.createElement('video');
  v.className = 'hero-video';
  v.autoplay = true; v.muted = true; v.loop = true; v.preload = 'auto';
  v.setAttribute('playsinline', ''); v.setAttribute('muted', '');
  var s = document.createElement('source'); s.src = src; s.type = 'video/mp4';
  v.appendChild(s);
  var ov = document.createElement('div'); ov.className = 'hero-video-overlay';
  bg.appendChild(v); bg.appendChild(ov);
  bg.hidden = false;
  if (v.play) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
}

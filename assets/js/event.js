/* Страница события — рендер по ?id= */
window.PAGE_INIT = function () {
  var root = document.getElementById('event-root');
  var id = SH.qs('id');
  var ev = SH.event(id);
  var I = SH.ICON;

  if (!ev) {
    root.innerHTML =
      '<div class="theme-dark" style="padding-top:calc(var(--nav-h) + 120px)"><div class="wrap pb-24 text-center">' +
        '<h1 class="display text-cream" style="font-size:clamp(36px,7vw,84px)">Событие не найдено</h1>' +
        '<p class="text-cream-dim mt-4">Возможно, оно завершилось или ссылка устарела.</p>' +
        '<a class="btn btn-primary btn-lg mt-8" href="calendar.html">В календарь ' + I.arrow + '</a>' +
      '</div></div>';
    return;
  }

  document.title = ev.title + ' — Штурман';
  var d = SH.disc(ev.discipline);
  function variant(url, sfx) { return url.replace(/\.jpg$/i, '-' + sfx + '.jpg'); }
  var img2 = variant(ev.image, '2');
  var img3 = variant(ev.image, '3');
  var FB = "this.style.display='none';this.parentNode.classList.add('img-failed')";
  var mapUrl = 'https://yandex.ru/maps/?text=' + encodeURIComponent(ev.track + ' ' + ev.city);

  var ticketBlock = ev.free
    ? '<div class="tag tag-free mb-4">Вход свободный</div>' +
      '<a class="btn btn-dark btn-lg w-full" href="' + ev.officialUrl + '" target="_blank" rel="noopener">Подробности события ' + I.arrow + '</a>'
    : '<div class="flex items-baseline gap-2 mb-4"><span class="display text-orange" style="font-size:34px">от ' + ev.priceFrom.toLocaleString('ru-RU') + ' ₽</span></div>' +
      '<a class="btn btn-primary btn-lg w-full" href="' + ev.ticketUrl + '" target="_blank" rel="noopener">Купить билеты ' + I.arrow + '</a>' +
      '<div class="text-center text-inktext-faint text-[13px] mt-3">Переход на официальный сайт организатора</div>';

  function fact(icon, label, value) {
    return '<div class="flex items-start gap-3">' +
      '<span class="w-10 h-10 rounded-full flex-none flex items-center justify-center bg-orange-100 text-orange"><span class="w-5 h-5 inline-flex">' + icon + '</span></span>' +
      '<div><div class="text-inktext-faint text-[13px]">' + label + '</div><div class="font-bold text-[15.5px] mt-0.5" style="font-family:var(--font-head)">' + value + '</div></div>' +
    '</div>';
  }

  var related = ((window.SHTURMAN && window.SHTURMAN.events) || [])
    .filter(function (e) { return e.discipline === ev.discipline && e.id !== ev.id; }).slice(0, 3);
  var relatedHTML = related.length
    ? '<section class="theme-light section pt-4"><div class="wrap">' +
        '<div class="flex items-end justify-between mb-8"><h2 style="font-size:clamp(26px,3.6vw,40px)">Похожие события</h2>' +
        '<a class="link-arrow text-orange" href="calendar.html?discipline=' + ev.discipline + '">Все: ' + d.label.toLowerCase() + ' ' + I.arrow + '</a></div>' +
        '<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">' + related.map(SH.eventCard).join('') + '</div>' +
      '</div></section>'
    : '';

  root.innerHTML =
    /* ---------- HERO ---------- */
    '<section class="theme-dark relative overflow-hidden">' +
      '<div class="absolute inset-0 media media-' + ev.discipline + '">' +
        '<img src="' + ev.image + '" alt="' + ev.title + '" class="w-full h-full object-cover" style="opacity:.5" onerror="' + FB + '">' +
      '</div>' +
      '<div class="absolute inset-0" style="background:linear-gradient(180deg, rgba(14,14,17,.55) 0%, rgba(14,14,17,.35) 40%, rgba(14,14,17,.92) 100%)"></div>' +
      '<div class="wrap relative flex flex-col justify-end" style="padding-top:calc(var(--nav-h) + 64px);padding-bottom:56px;min-height:64vh">' +
        '<a class="link-arrow text-cream-dim mb-6" href="calendar.html"><span class="w-4 h-4 inline-flex rotate-180">' + I.arrow + '</span>Календарь</a>' +
        '<div class="flex flex-wrap gap-2 mb-5">' + SH.discTag(ev.discipline) + SH.priceTag(ev) + '<span class="tag" style="background:rgba(244,241,234,.12);color:var(--cream)">' + ev.format + '</span></div>' +
        '<h1 class="display text-cream text-balance" style="font-size:clamp(36px,6.4vw,82px);max-width:16ch">' + ev.title + '</h1>' +
        '<div class="flex flex-wrap items-center gap-x-7 gap-y-2 mt-6 text-cream-dim text-[16px]">' +
          '<span class="flex items-center gap-2"><span class="w-5 h-5 inline-flex text-orange">' + I.calendar + '</span>' + SH.formatDateFull(ev.dateStart) + (ev.dateEnd && ev.dateEnd !== ev.dateStart ? ' – ' + SH.formatDateFull(ev.dateEnd) : '') + '</span>' +
          '<span class="flex items-center gap-2"><span class="w-5 h-5 inline-flex text-orange">' + I.pin + '</span>' + ev.track + ', ' + ev.city + '</span>' +
          '<span class="flex items-center gap-2"><span class="w-5 h-5 inline-flex text-orange">' + I.flag + '</span>' + ev.series + '</span>' +
        '</div>' +
      '</div>' +
    '</section>' +

    /* ---------- FACTS STRIP ---------- */
    '<section class="theme-light" style="border-bottom:1px solid var(--line-light)"><div class="wrap py-8">' +
      '<div class="grid grid-cols-2 md:grid-cols-4 gap-6">' +
        fact(I.calendar, 'Когда', SH.formatDate(ev.dateStart, ev.dateEnd)) +
        fact(I.pin, 'Где', ev.track) +
        fact(I.flag, 'Тип', ev.format) +
        fact(I.ticket, 'Вход', ev.free ? 'Бесплатно' : 'от ' + ev.priceFrom.toLocaleString('ru-RU') + ' ₽') +
      '</div>' +
    '</div></section>' +

    /* ---------- CONTENT + ASIDE ---------- */
    '<section class="theme-light section pt-12"><div class="wrap">' +
      '<div class="grid lg:grid-cols-[1.6fr_1fr] gap-12 items-start">' +
        '<div>' +
          '<div class="reveal"><div class="eyebrow" style="color:var(--orange)">Что это за гонка</div>' +
            '<h2 class="mt-4 mb-3" style="font-size:clamp(24px,3.4vw,36px)">' + d.label + ' — ' + d.tagline.toLowerCase() + '</h2>' +
            '<p class="text-inktext-dim text-[17px]">' + d.about + '</p>' +
            '<p class="text-inktext-dim text-[17px] mt-4">' + ev.about + '</p>' +
          '</div>' +

          '<div class="reveal mt-12"><div class="eyebrow" style="color:var(--orange)">Чем заняться зрителю</div>' +
            '<h2 class="mt-4 mb-3" style="font-size:clamp(24px,3.4vw,36px)">Как смотреть, чтобы понравилось</h2>' +
            '<p class="text-inktext-dim text-[17px]">' + ev.spectator + '</p>' +
            '<p class="text-inktext-dim text-[17px] mt-4">' + d.watch + '</p>' +
          '</div>' +

          '<div class="reveal mt-10 rounded-2xl p-7 relative overflow-hidden" style="background:linear-gradient(120deg,var(--orange),var(--orange-700))">' +
            '<div class="speedlines" style="opacity:.25"></div>' +
            '<div class="relative flex items-start gap-4 text-white">' +
              '<span class="w-11 h-11 rounded-full flex-none flex items-center justify-center" style="background:rgba(255,255,255,.2)"><span class="w-6 h-6 inline-flex">' + I.spark + '</span></span>' +
              '<div><div class="text-white/80 text-[13px]" style="font-family:var(--font-head);font-weight:700;letter-spacing:.1em;text-transform:uppercase">Интересный факт</div>' +
              '<p class="text-[18px] mt-1 font-medium">' + ev.funFact + '</p></div>' +
            '</div>' +
          '</div>' +

          '<div class="reveal mt-12"><h3 class="mb-4" style="font-size:22px">Атмосфера</h3>' +
            '<div class="grid grid-cols-2 gap-4">' +
              '<div class="media rounded-xl col-span-2" style="aspect-ratio:16/9"><img src="' + ev.image + '" alt="' + ev.title + '" loading="lazy" onerror="' + FB + '"><div class="speedlines"></div></div>' +
              '<div class="media media-' + ev.discipline + ' rounded-xl" style="aspect-ratio:4/3"><img src="' + img2 + '" alt="Атмосфера события" loading="lazy" onerror="' + FB + '"></div>' +
              '<div class="media media-' + ev.discipline + ' rounded-xl" style="aspect-ratio:4/3"><img src="' + img3 + '" alt="Атмосфера события" loading="lazy" onerror="' + FB + '"></div>' +
            '</div>' +
          '</div>' +
        '</div>' +

        /* aside */
        '<aside class="lg:sticky" style="top:calc(var(--nav-h) + 16px)">' +
          '<div class="card p-7">' +
            ticketBlock +
            '<div class="divider-x my-6"></div>' +
            '<div class="space-y-4">' +
              fact(I.calendar, 'Дата', SH.formatDateFull(ev.dateStart) + (ev.dateEnd && ev.dateEnd !== ev.dateStart ? ' – ' + SH.formatDateFull(ev.dateEnd) : '')) +
              fact(I.pin, 'Место', ev.track + ', ' + ev.city) +
              fact(I.flag, 'Серия', ev.series) +
            '</div>' +
            '<a class="btn btn-ghost w-full mt-6" href="' + mapUrl + '" target="_blank" rel="noopener"><span class="w-[18px] h-[18px] inline-flex">' + I.pin + '</span> Построить маршрут</a>' +
            '<button class="btn btn-ghost w-full mt-3" id="share-btn">Поделиться</button>' +
          '</div>' +
          '<div class="card card-dark mt-5 p-6 theme-dark">' +
            '<div class="flex items-center gap-2 text-orange-300 text-[13px] mb-2" style="font-family:var(--font-head);font-weight:700;letter-spacing:.08em;text-transform:uppercase"><span class="w-2 h-2 rounded-full pulse" style="background:var(--orange)"></span> На событии</div>' +
            '<p class="text-cream text-[15.5px]">Не теряйся на автодроме: карта, расписание и маршрут — в мини-приложении «Штурман».</p>' +
            '<a class="link-arrow text-orange-300 mt-4 text-[14px]" href="app.html">Открыть приложение ' + I.arrow + '</a>' +
          '</div>' +
        '</aside>' +
      '</div>' +
    '</div></section>' +

    relatedHTML;

  // share
  var share = document.getElementById('share-btn');
  if (share) share.addEventListener('click', function () {
    if (navigator.share) { navigator.share({ title: ev.title, url: location.href }).catch(function () {}); }
    else if (navigator.clipboard) { navigator.clipboard.writeText(location.href); share.textContent = 'Ссылка скопирована'; setTimeout(function () { share.textContent = 'Поделиться'; }, 1800); }
  });

  SH.initReveal();
};

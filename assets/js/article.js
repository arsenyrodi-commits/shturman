/* Статья — рендер по ?slug= */
window.PAGE_INIT = function () {
  var root = document.getElementById('article-root');
  var slug = SH.qs('slug');
  var a = SH.article(slug);
  var I = SH.ICON;
  var FB = "this.style.display='none';this.parentNode.classList.add('img-failed')";

  if (!a) {
    root.innerHTML =
      '<div class="theme-dark" style="padding-top:calc(var(--nav-h) + 120px)"><div class="wrap pb-24 text-center">' +
        '<h1 class="display text-cream" style="font-size:clamp(36px,7vw,84px)">Статья не найдена</h1>' +
        '<a class="btn btn-primary btn-lg mt-8" href="blog.html">В базу знаний ' + I.arrow + '</a>' +
      '</div></div>';
    return;
  }

  document.title = a.title + ' — Штурман';

  function block(b) {
    if (b.type === 'h') return '<h2 class="mt-11 mb-1 text-balance" style="font-size:clamp(23px,3.2vw,32px)">' + b.text + '</h2>';
    if (b.type === 'p') return '<p class="mt-5 text-inktext-dim" style="font-size:18px;line-height:1.78">' + b.text + '</p>';
    if (b.type === 'list') return '<ul class="mt-6 space-y-3">' + b.items.map(function (it) {
      return '<li class="flex items-start gap-3 text-inktext-dim" style="font-size:17.5px;line-height:1.7"><span class="w-2 h-2 rounded-full bg-orange mt-2.5 flex-none"></span><span>' + it + '</span></li>';
    }).join('') + '</ul>';
    if (b.type === 'quote') return '<blockquote class="mt-9 pl-6 py-1" style="border-left:4px solid var(--orange)"><p class="text-inktext" style="font-family:var(--font-head);font-weight:600;font-size:clamp(20px,2.6vw,26px);line-height:1.45">' + b.text + '</p></blockquote>';
    if (b.type === 'tip') return '<div class="mt-8 rounded-2xl p-6 flex items-start gap-4" style="background:var(--orange-100)">' +
      '<span class="w-10 h-10 rounded-full flex-none flex items-center justify-center bg-orange text-white"><span class="w-5 h-5 inline-flex">' + I.spark + '</span></span>' +
      '<div><div class="text-orange-700 text-[12.5px]" style="font-family:var(--font-head);font-weight:800;letter-spacing:.08em;text-transform:uppercase">Совет Штурмана</div>' +
      '<p class="text-inktext mt-1" style="font-size:16.5px;line-height:1.6">' + b.text + '</p></div></div>';
    return '';
  }

  var related = ((window.SHTURMAN && window.SHTURMAN.articles) || [])
    .filter(function (x) { return x.slug !== a.slug; }).slice(0, 3);
  var relatedHTML = related.length
    ? '<section class="theme-light section pt-4" style="border-top:1px solid var(--line-light)"><div class="wrap">' +
        '<h2 class="mb-8" style="font-size:clamp(26px,3.6vw,40px)">Читать дальше</h2>' +
        '<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">' + related.map(function (r, i) { return SH.articleCard(r, i); }).join('') + '</div>' +
      '</div></section>'
    : '';

  root.innerHTML =
    /* hero */
    '<section class="theme-dark relative overflow-hidden">' +
      '<div class="absolute inset-0 media"><img src="' + a.cover + '" alt="' + a.title + '" class="w-full h-full object-cover" style="opacity:.4" onerror="' + FB + '"></div>' +
      '<div class="absolute inset-0" style="background:linear-gradient(180deg, rgba(14,14,17,.6), rgba(14,14,17,.55) 40%, rgba(14,14,17,.95))"></div>' +
      '<div class="wrap relative flex flex-col justify-end" style="padding-top:calc(var(--nav-h) + 56px);padding-bottom:52px;min-height:52vh">' +
        '<a class="link-arrow text-cream-dim mb-6" href="blog.html"><span class="w-4 h-4 inline-flex rotate-180">' + I.arrow + '</span>База знаний</a>' +
        '<div class="flex items-center gap-3 mb-4"><span class="tag tag-paid">' + a.category + '</span><span class="text-cream-dim text-[14px] flex items-center gap-2"><span class="w-4 h-4 inline-flex">' + I.clock + '</span>' + a.readMins + ' мин чтения</span></div>' +
        '<h1 class="text-cream text-balance" style="font-family:var(--font-head);font-weight:800;font-size:clamp(30px,5.2vw,62px);line-height:1.04;letter-spacing:-.02em;max-width:20ch">' + a.title + '</h1>' +
        '<div class="text-cream-faint mt-5 text-[14.5px]">' + SH.formatDateFull(a.date) + ' · Редакция «Штурман»</div>' +
      '</div>' +
    '</section>' +

    /* body */
    '<section class="theme-light section pt-12"><div class="wrap">' +
      '<div class="mx-auto" style="max-width:760px">' +
        '<p class="text-inktext" style="font-size:clamp(20px,2.6vw,24px);line-height:1.5;font-family:var(--font-head);font-weight:500">' + a.excerpt + '</p>' +
        '<div class="divider-x my-9"></div>' +
        a.body.map(block).join('') +
        '<div class="mt-12 rounded-2xl p-7 theme-dark card card-dark flex flex-col sm:flex-row sm:items-center gap-5 justify-between">' +
          '<div><div class="text-cream text-[19px] font-bold" style="font-family:var(--font-head)">Нашёл, на что хочешь съездить?</div>' +
          '<div class="text-cream-dim text-[15px] mt-1">Открой календарь и выбери ближайшую гонку.</div></div>' +
          '<a class="btn btn-primary btn-lg flex-none" href="calendar.html">В календарь ' + I.arrow + '</a>' +
        '</div>' +
      '</div>' +
    '</div></section>' +

    relatedHTML;

  SH.initReveal();
};

/* ============================================================
   ШТУРМАН (VK Mini App) - карта автодрома «Игора Драйв».
   Перерисовка плана площадки (этапы 3 и 5 REC проходят здесь).
   Зоны информационные: тап -> описание. viewBox 0 0 1000 480.
   window.VENUE_IGORA
   ============================================================ */
(function () {
  var zones = [
    { id: 'park-top',   x: 30,  y: 30,  w: 95,  h: 55,  label: 'Парковка',                 kind: 'parking', desc: 'Парковка для зрителей (северная зона).' },
    { id: 'circuit',    x: 150, y: 30,  w: 620, h: 72,  label: 'Шоссейно-кольцевая трасса', kind: 'track',   desc: 'Главная гоночная трасса автодрома: здесь проходит этап REC и кольцевые гонки.' },
    { id: 'karting',    x: 800, y: 30,  w: 180, h: 90,  label: 'Картинг-центр',            kind: 'track',   desc: 'Трасса и центр картинга.' },

    { id: 'enduro',     x: 30,  y: 125, w: 120, h: 95,  label: 'Эндуро · внедорожники',    kind: 'show',    desc: 'Трасса эндуро и парк внедорожников.' },
    { id: 'rallycross', x: 170, y: 125, w: 180, h: 85,  label: 'Трасса ралли-кросса',      kind: 'show',    desc: 'Трасса ралли-кросса.' },
    { id: 'drift',      x: 370, y: 125, w: 160, h: 70,  label: 'Площадка дрифта',          kind: 'show',    desc: 'Площадка для дрифта.' },
    { id: 'mainstand',  x: 550, y: 125, w: 150, h: 55,  label: 'Главная трибуна',          kind: 'stand',   desc: 'Главная трибуна: лучший обзор старт-финиша и пит-лейн.' },
    { id: 'automuseum', x: 820, y: 150, w: 160, h: 60,  label: 'Автомузей',                kind: 'service', desc: 'Автомузей «Игора Драйв».' },

    { id: 'rallymoto',  x: 370, y: 205, w: 150, h: 55,  label: 'Ралли-мото центр',         kind: 'service', desc: 'Ралли-мото центр.' },
    { id: 'pitbuild',   x: 550, y: 195, w: 200, h: 55,  label: 'Инфоцентр · Пит-билдинг',  kind: 'service', desc: 'Пит-билдинг и инфоцентр: боксы команд, информация для зрителей.' },
    { id: 'restaurant', x: 770, y: 225, w: 150, h: 52,  label: 'Ресторан «Фаворит»',       kind: 'service', desc: 'Ресторан «Фаворит».' },

    { id: 'motocross',  x: 110, y: 235, w: 230, h: 120, label: 'Трасса мотокросса',        kind: 'show',    desc: 'Трасса мотокросса, суперкросса и детского мотокросса.' },
    { id: 'medcenter',  x: 550, y: 262, w: 120, h: 46,  label: 'Медцентр',                 kind: 'service', desc: 'Медицинский центр.' },
    { id: 'contravar',  x: 690, y: 262, w: 210, h: 52,  label: 'Центр контраварийной подготовки', kind: 'service', desc: 'Центр контраварийной подготовки водителей.' },

    { id: 'busstop',    x: 400, y: 355, w: 160, h: 30,  label: 'Автобусная остановка',     kind: 'service', desc: 'Остановка автобуса.' },
    { id: 'park-left',  x: 30,  y: 372, w: 95,  h: 63,  label: 'Парковка',                 kind: 'parking', desc: 'Парковка для зрителей (западная зона).' },
    { id: 'entrance',   x: 400, y: 395, w: 160, h: 52,  label: 'Въезд · КПП',              kind: 'service', desc: 'Главный въезд и КПП: вход для зрителей, контроль билетов.' },
    { id: 'park-main',  x: 590, y: 395, w: 150, h: 52,  label: 'Парковка',                 kind: 'parking', desc: 'Основная парковка для зрителей у въезда.' }
  ];

  var decor =
    '<rect x="0" y="6" width="1000" height="11" fill="#dcd9d2"/>' +
    '<text x="500" y="15" text-anchor="middle" font-size="9" fill="#8e8b94" font-family="Manrope,sans-serif" font-weight="700">Новоприозерское шоссе А-121</text>' +
    '<rect x="0" y="462" width="1000" height="11" fill="#dcd9d2"/>' +
    '<text x="500" y="471" text-anchor="middle" font-size="9" fill="#8e8b94" font-family="Manrope,sans-serif" font-weight="700">Приозерское шоссе А-121</text>';

  window.VENUE_IGORA = { vb: '0 0 1000 480', decor: decor, zones: zones, activities: [] };
})();

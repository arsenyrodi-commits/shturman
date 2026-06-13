/* ============================================================
   ШТУРМАН (VK Mini App) - детали этапа (карта + активности + расписание).
   Этап 1: REC Moscow Raceway 4H - по присланному плану площадки и афише.
   Для остальных этапов на Moscow Raceway переиспользуется как образец.
   window.STAGE1
   ============================================================ */
(function () {

  /* ---- ЗОНЫ КАРТЫ (схематичная перерисовка плана, viewBox 0 0 1000 660) ----
     kind: zone | show | kids | track | stand | service | parking | thrill | inactive
     acts: id активностей внутри зоны. desc: текст для сервис-зон без активностей. */
  var zones = [
    { id: 'med',        x: 30,  y: 30,  w: 150, h: 70,  label: 'Медцентр',        kind: 'service',  desc: 'Медицинский центр и парковка для экстренных служб.' },
    { id: 'heli',       x: 290, y: 22,  w: 250, h: 92,  label: 'Вертолёт / шар',  kind: 'thrill',   acts: ['helicopter'] },
    { id: 'wc1',        x: 560, y: 40,  w: 55,  h: 55,  label: 'WC',              kind: 'service',  desc: 'Туалеты (северная зона).' },
    { id: 'grand4',     x: 650, y: 18,  w: 322, h: 100, label: 'Трибуна 4',       kind: 'stand',    desc: 'Зрительская трибуна №4 у северного виража.' },

    { id: 'kids',       x: 30,  y: 140, w: 165, h: 110, label: 'Детская зона',    kind: 'kids',     acts: ['kids_slalom', 'kids_cars', 'kids_kart', 'karting', 'kids_zone', 'game_zone'] },
    { id: 'trikes',     x: 212, y: 140, w: 98,  h: 75,  label: 'Трайки',          kind: 'kids',     acts: ['trikes'] },
    { id: 'spectator',  x: 328, y: 140, w: 250, h: 110, label: 'Зрительская зона', kind: 'zone',    acts: ['pitstop_stand', 'photo', 'foodcourt'] },
    { id: 'vippark',    x: 595, y: 140, w: 230, h: 110, label: 'VIP-парковка',    kind: 'parking',  desc: 'Парковка для категорий ВИП / ЛЮКС.' },
    { id: 'drift',      x: 845, y: 140, w: 127, h: 210, label: 'Дрифт-зона',      kind: 'show',     acts: ['drift'] },

    { id: 'testdrive',  x: 30,  y: 265, w: 165, h: 58,  label: 'Тест-драйв',      kind: 'show',     acts: ['testdrive'] },
    { id: 'autoshow',   x: 328, y: 265, w: 250, h: 58,  label: 'Автошоурум',      kind: 'show',     acts: ['autoshow'] },

    { id: 'posadka',    x: 30,  y: 345, w: 165, h: 95,  label: 'Зона посадки',    kind: 'track',    acts: ['excursion_track', 'bus_track', 'racetaxi', 'tracksession'] },
    { id: 'raceCtrl',   x: 212, y: 345, w: 98,  h: 55,  label: 'Рейс-контроль',   kind: 'service',  desc: 'Башня судейства и контроля гонки.' },
    { id: 'techpark',   x: 328, y: 345, w: 497, h: 55,  label: 'Технический парк', kind: 'zone',    desc: 'Технический парк участников: команды и боксы.' },

    { id: 'boxes',      x: 595, y: 412, w: 230, h: 46,  label: 'Боксы',           kind: 'track',    acts: ['boxes_excursion'] },

    { id: 'pitwalk',    x: 30,  y: 500, w: 165, h: 68,  label: 'Вход на Пит-лейн', kind: 'track',   acts: ['pitwalk', 'prestart', 'awarding'] },
    { id: 'mainstand',  x: 328, y: 498, w: 250, h: 92,  label: 'Главная трибуна', kind: 'stand',    acts: ['race'] },
    { id: 'general',    x: 595, y: 498, w: 265, h: 135, label: 'Общая территория', kind: 'zone',    desc: 'Свободная зона для всех зрителей: проходы, навигация, точки питания.' },
    { id: 'grand12',    x: 880, y: 470, w: 92,  h: 160, label: 'Grandstand 1–2',  kind: 'inactive', desc: 'Трибуны 1–2 - на этом этапе не используются.' },

    { id: 'foodcourt2', x: 30,  y: 588, w: 150, h: 58,  label: 'Фудкорт',         kind: 'service',  acts: ['foodcourt2'] },
    { id: 'wc2',        x: 360, y: 600, w: 50,  h: 46,  label: 'WC',              kind: 'service',  desc: 'Туалеты (южная зона, у главной трибуны).' },
    { id: 'entrance',   x: 200, y: 588, w: 150, h: 58,  label: 'Вход · Касса',    kind: 'service',  desc: 'Касса, контроль билетов, камера хранения, вход №1 (досмотр) и №2.' }
  ];

  /* ---- АКТИВНОСТИ ----
     cat: show (аттракционы и зоны) | track (экскурсии и трек) | main (главное)
     ticket: строка-бейдж, если активность по спец-категории (иначе null = для всех)
     free: true → бейдж «Бесплатно». tickets[] - для будущего фильтра на M4. */
  var T_PLUS = ['Комфорт', 'Премиум', 'ВИП', 'ЛЮКС'];
  var activities = [
    { id: 'drift',          title: 'Дрифт-зона',                  time: '14:00–21:30', note: 'перерыв 16:15–18:30', cat: 'show', zone: 'drift' },
    { id: 'autoshow',       title: 'Автошоурум',                  time: '14:00–21:30', cat: 'show', zone: 'autoshow' },
    { id: 'testdrive',      title: 'Тест-драйв',                  time: '14:00–21:30', cat: 'show', zone: 'testdrive' },
    { id: 'karting',        title: 'Картинг',                     time: '14:00–21:30', cat: 'show', zone: 'kids' },
    { id: 'kids_slalom',    title: 'Детский автослалом',          time: '14:00–21:30', cat: 'show', zone: 'kids' },
    { id: 'kids_kart',      title: 'Детский миникартинг',         time: '14:00–21:30', cat: 'show', zone: 'kids' },
    { id: 'kids_cars',      title: 'Электромашинки',              time: '14:00–21:30', cat: 'show', zone: 'kids' },
    { id: 'trikes',         title: 'Дрифт-трайки (электроскутеры)', time: '14:00–21:30', cat: 'show', zone: 'trikes' },
    { id: 'kids_zone',      title: 'Детская зона РГСЖ / Ложа 1',  time: '14:00–21:30', cat: 'show', zone: 'kids', free: true },
    { id: 'game_zone',      title: 'Игровая спорт-зона',          time: '14:00–21:30', cat: 'show', zone: 'kids', free: true },
    { id: 'pitstop_stand',  title: 'Стенд пит-стоп',              time: '14:00–21:30', cat: 'show', zone: 'spectator' },
    { id: 'photo',          title: 'Фотоуслуги',                  time: '14:00–21:30', cat: 'show', zone: 'spectator' },
    { id: 'foodcourt',      title: 'Фудкорт',                     time: '14:00–21:30', cat: 'show', zone: 'spectator' },
    { id: 'foodcourt2',     title: 'Фудкорт (общая территория)',  time: '14:00–21:30', cat: 'show', zone: 'foodcourt2' },

    { id: 'excursion_track', title: 'Экскурсия по автодрому',     time: '14:30 и 15:30', cat: 'track', zone: 'posadka' },
    { id: 'bus_track',      title: 'Экскурсия на автобусе по треку', time: '14:45–16:15', cat: 'track', zone: 'posadka' },
    { id: 'racetaxi',       title: 'Гоночное такси по треку',     time: '14:45–16:15', cat: 'track', zone: 'posadka' },
    { id: 'tracksession',   title: 'Трек-сессия на спорткаре',    time: '14:45–16:15', cat: 'track', zone: 'posadka' },
    { id: 'boxes_excursion', title: 'Экскурсия в боксы команд',   time: '14:45–16:15', cat: 'track', zone: 'boxes' },
    { id: 'pitwalk',        title: 'Прогулка по Пит-лейн',        time: '14:45–16:15', cat: 'track', zone: 'pitwalk', ticket: 'Комфорт+', tickets: T_PLUS },
    { id: 'helicopter',     title: 'Полёт на вертолёте',          time: '16:30–18:30', cat: 'track', zone: 'heli' },
    { id: 'prestart',       title: 'Предстартовая процедура',     time: '16:30–17:20', cat: 'track', zone: 'pitwalk', ticket: 'Комфорт+', tickets: T_PLUS },

    { id: 'race',           title: 'Гонка Гран-при Авто@Mail.ru', time: '17:30–21:30', cat: 'main', zone: 'mainstand' },
    { id: 'awarding',       title: 'Церемония награждения на пит-лейн', time: '22:00–22:30', cat: 'main', zone: 'pitwalk', ticket: 'Комфорт+', tickets: ['Комфорт', 'Семейный', 'Премиум', 'ВИП', 'ЛЮКС'] }
  ];

  /* ---- РАСПИСАНИЕ (таймлайн) ---- */
  var schedule = [
    { t: '14:00',        title: 'Открытие входа для зрителей' },
    { t: '14:00–21:30',  title: 'Зрительские зоны и активности', note: 'Автошоурум, дрифт-зона, картинг, детские зоны, фудкорт' },
    { t: '14:30 / 15:30', title: 'Экскурсия по автодрому' },
    { t: '14:45–16:15',  title: 'Трек: пит-лейн, боксы, автобус, гоночное такси, трек-сессия', ticket: 'Комфорт+' },
    { t: '16:30–18:30',  title: 'Полёт на вертолёте' },
    { t: '16:30–17:20',  title: 'Предстартовая процедура', ticket: 'Комфорт+' },
    { t: '17:30–21:30',  title: 'Гонка Гран-при Авто@Mail.ru', hot: true },
    { t: '22:00–22:30',  title: 'Церемония награждения на пит-лейн', ticket: 'Комфорт+' },
    { t: '22:30',        title: 'Окончание мероприятия' }
  ];

  var links = [
    { label: 'Сайт Russian Endurance Challenge', url: 'https://rusendurance.com' }
  ];

  var decor =
    '<rect class="trk-asphalt" x="40" y="460" width="920" height="34" rx="5"/>' +
    '<line class="trk-line" x1="55" y1="477" x2="945" y2="477"/>' +
    '<text class="trk-label" x="500" y="483" text-anchor="middle" font-size="17">СТАРТ · ФИНИШ</text>';

  window.STAGE1 = { vb: '0 0 1000 660', decor: decor, zones: zones, activities: activities, schedule: schedule, links: links };
})();

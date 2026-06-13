/* ============================================================
   ШТУРМАН (VK Mini App) - данные MVP.
   Russian Endurance Challenge 2026 - 6 этапов (по уточнённому календарю).
   Подключается как <script> -> window.REC.
   Детали этапа 1 (карта/активности/расписание) - в stage1.js;
   остальные этапы пока используют их как образец.
   ============================================================ */
(function () {
  var stages = [
    {
      id: 'rec-1', stage: 1, name: 'Гран-при Авто@Mail.ru',
      date: '2026-05-30',
      track: 'Moscow Raceway', city: 'Волоколамск',
      type: 'Гонка на выносливость', venue: 'mrw',
      official: 'https://rusendurance.com'
    },
    {
      id: 'rec-2', stage: 2, name: "Гран-при Спортс''",
      date: '2026-06-27',
      track: 'Moscow Raceway', city: 'Волоколамск',
      type: 'Гонка на выносливость', venue: 'mrw',
      official: 'https://rusendurance.com'
    },
    {
      id: 'rec-3', stage: 3, name: 'Гран-при Санкт-Петербурга',
      date: '2026-07-11',
      track: 'Игора Драйв', city: 'Приозерск',
      type: 'Гонка на выносливость', venue: 'igora',
      official: 'https://rusendurance.com'
    },
    {
      id: 'rec-4', stage: 4, name: 'Гран-при Авторадио',
      date: '2026-08-01',
      track: 'Moscow Raceway', city: 'Волоколамск',
      type: 'Гонка на выносливость', venue: 'mrw',
      official: 'https://rusendurance.com'
    },
    {
      id: 'rec-5', stage: 5, name: '4 часа',
      date: '2026-09-15', dateLabel: 'Сентябрь (на согласовании)', tbd: true,
      track: 'Игора Драйв', city: 'Приозерск',
      type: 'Гонка на выносливость', venue: 'igora',
      official: 'https://rusendurance.com'
    },
    {
      id: 'rec-6', stage: 6, name: 'REC × 500 вёрст',
      date: '2026-10-03',
      track: 'Moscow Raceway', city: 'Волоколамск',
      type: 'Гонка на выносливость', venue: 'mrw',
      official: 'https://rusendurance.com'
    }
  ];

  window.REC = { stages: stages, season: 2026, series: 'Russian Endurance Challenge' };
})();

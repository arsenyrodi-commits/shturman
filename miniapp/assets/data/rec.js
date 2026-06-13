/* ============================================================
   ШТУРМАН (VK Mini App) - данные MVP.
   Russian Endurance Challenge 2026 - 5 этапов (по присланной афише).
   Подключается как <script> → window.REC.
   Даты/названия - по афише REC; детали этапа 1 - из присланного
   расписания, остальные этапы пока дублируют его как заглушку.
   ============================================================ */
(function () {
  var stages = [
    {
      id: 'rec-1', stage: 1,
      name: 'Гран-при Авто@Mail.ru',
      title: 'REC Moscow Raceway 4H',
      date: '2026-05-30',
      track: 'Moscow Raceway', city: 'Волоколамск',
      type: 'Гонка на выносливость · 4 часа',
      venue: 'mrw',
      official: 'https://rusendurance.com'
    },
    {
      id: 'rec-2', stage: 2,
      name: null,
      title: 'Russian Endurance Challenge',
      date: '2026-06-27',
      track: 'Moscow Raceway', city: 'Волоколамск',
      type: 'Гонка на выносливость',
      venue: 'mrw',
      official: 'https://rusendurance.com'
    },
    {
      id: 'rec-3', stage: 3,
      name: null,
      title: 'Russian Endurance Challenge',
      date: '2026-07-11',
      track: 'Игора Драйв', city: 'Приозерск',
      type: 'Гонка на выносливость',
      venue: 'igora',
      official: 'https://rusendurance.com'
    },
    {
      id: 'rec-4', stage: 4,
      name: null,
      title: 'Russian Endurance Challenge',
      date: '2026-08-01',
      track: 'Moscow Raceway', city: 'Волоколамск',
      type: 'Гонка на выносливость',
      venue: 'mrw',
      official: 'https://rusendurance.com'
    },
    {
      id: 'rec-5', stage: 5,
      name: '500 вёрст',
      title: 'Russian Endurance Challenge · финал',
      date: '2026-10-03',
      track: 'Moscow Raceway', city: 'Волоколамск',
      type: 'Гонка на выносливость',
      venue: 'mrw',
      official: 'https://rusendurance.com'
    }
  ];

  window.REC = { stages: stages, season: 2026, series: 'Russian Endurance Challenge' };
})();

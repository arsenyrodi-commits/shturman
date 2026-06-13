/* ============================================================
   ШТУРМАН (VK Mini App) - чемпионаты для календаря.
   Список серий как на сайте; этапы - представительные данные сезона 2026.
   REC (useREC) тянет 6 этапов из window.REC.stages и имеет навигацию.
   У остальных серий навигации по треку пока нет (только календарь этапов).
   window.CHAMPS
   ============================================================ */
(function () {
  var champs = [
    {
      id: 'rec', name: 'Russian Endurance Challenge', short: 'REC',
      disc: 'circuit', nav: true, useREC: true
    },
    {
      id: 'rds', name: 'Российская Дрифт Серия (RDS GP)', short: 'RDS GP',
      disc: 'drift', nav: false, events: [
        { name: 'Этап 1', date: '2026-04-25', track: 'Moscow Raceway', city: 'Волоколамск' },
        { name: 'Этап 2', date: '2026-07-18', track: 'Сочи Автодром', city: 'Сочи' },
        { name: 'Финал сезона', date: '2026-10-03', track: 'Moscow Raceway', city: 'Волоколамск' }
      ]
    },
    {
      id: 'rskg', name: 'Российская серия кольцевых гонок', short: 'РСКГ',
      disc: 'circuit', nav: false, events: [
        { name: 'Этап 1', date: '2026-05-16', track: 'Игора Драйв', city: 'Приозерск' },
        { name: 'Этап 3', date: '2026-07-04', track: 'Казань Ринг', city: 'Казань' },
        { name: 'Финал', date: '2026-10-17', track: 'Игора Драйв', city: 'Приозерск' }
      ]
    },
    {
      id: 'rally', name: 'Чемпионат России по ралли', short: 'Ралли',
      disc: 'rally', nav: false, events: [
        { name: 'Ралли «Калуга»', date: '2026-05-23', track: 'Спецучастки', city: 'Калуга' },
        { name: 'Ралли «Выборг»', date: '2026-09-19', track: 'Спецучастки', city: 'Выборг' }
      ]
    },
    {
      id: 'moto', name: 'Мотоспорт России (МФР)', short: 'Мото',
      disc: 'moto', nav: false, events: [
        { name: 'Чемпионат по мотокроссу', date: '2026-05-30', track: 'Мотодром «Чехов»', city: 'Чехов' },
        { name: 'Шоссейно-кольцевые гонки', date: '2026-09-05', track: 'Нижегородское кольцо', city: 'Нижний Новгород' }
      ]
    },
    {
      id: 'timeattack', name: 'Time Attack Russia', short: 'Time Attack',
      disc: 'circuit', nav: false, events: [
        { name: 'Этап сезона', date: '2026-08-08', track: 'Смоленское кольцо', city: 'Смоленск' }
      ]
    },
    {
      id: 'driftcup', name: 'Кубок России по дрифту', short: 'Кубок РФ',
      disc: 'drift', nav: false, events: [
        { name: 'Сибирский этап', date: '2026-08-22', track: 'Красное кольцо', city: 'Красноярск' }
      ]
    }
  ];

  window.CHAMPS = champs;
})();

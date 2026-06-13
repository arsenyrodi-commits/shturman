/* ============================================================
   ШТУРМАН (VK Mini App) - слой VK Bridge.
   Безопасен вне VK: если bridge недоступен (обычный браузер),
   inVK=false, storage* отклоняются → app.js падает на localStorage.
   window.SH_VK
   ============================================================ */
(function () {
  'use strict';
  var SH_VK = (window.SH_VK = {});
  var bridge = window.vkBridge || null;

  var inVK = false;
  try {
    inVK = !!bridge && (/[?&]vk_(app_id|user_id|platform)=/.test(location.search) || (bridge.isWebView && bridge.isWebView()));
  } catch (e) {}
  SH_VK.inVK = inVK;
  SH_VK.user = null;

  /* ---- safe-area из VK (иначе остаётся env() из CSS) ---- */
  function applyInsets(data) {
    if (!data) return;
    var ins = data.insets || (typeof data.top === 'number' ? data : null);
    if (!ins) return;
    var r = document.documentElement;
    if (typeof ins.top === 'number') r.style.setProperty('--safe-top', ins.top + 'px');
    if (typeof ins.bottom === 'number') r.style.setProperty('--safe-bottom', ins.bottom + 'px');
  }
  function fetchInsets() {
    if (!bridge) return;
    try { bridge.send('VKWebAppGetConfig').then(applyInsets).catch(function () {}); } catch (e) {}
  }

  /* ---- инициализация ---- */
  SH_VK.init = function (cb) {
    cb = cb || function () {};
    if (!bridge) { cb(); return; }
    try { bridge.send('VKWebAppInit'); } catch (e) {}
    try {
      bridge.subscribe(function (e) {
        var d = e && e.detail; if (!d) return;
        if (d.type === 'VKWebAppUpdateConfig' || d.type === 'VKWebAppUpdateInsets') applyInsets(d.data);
      });
    } catch (e) {}
    fetchInsets();
    if (inVK) {
      try {
        bridge.send('VKWebAppGetUserInfo').then(function (u) { SH_VK.user = u; cb(u); }).catch(function () { cb(); });
      } catch (e) { cb(); }
    } else { cb(); }
  };

  /* ---- VK Storage (ключ-значение на пользователя) ---- */
  SH_VK.storageGet = function (keys) {
    if (!bridge || !inVK) return Promise.reject('no-vk');
    return bridge.send('VKWebAppStorageGet', { keys: keys }).then(function (r) {
      var out = {}; (r.keys || []).forEach(function (kv) { out[kv.key] = kv.value; }); return out;
    });
  };
  SH_VK.storageSet = function (key, value) {
    if (!bridge || !inVK) return Promise.reject('no-vk');
    return bridge.send('VKWebAppStorageSet', { key: key, value: String(value) });
  };
})();

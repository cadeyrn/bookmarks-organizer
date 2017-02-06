'use strict';

const elDebugMode = document.getElementById('debug_mode');

const options = {
  load () {
    browser.storage.local.get({ debug_enabled : false }).then((option) => {
      elDebugMode.checked = option.debug_enabled;
    });
  }
};

document.addEventListener('DOMContentLoaded', options.load);

elDebugMode.addEventListener('change', (e) => {
  browser.storage.local.set({ debug_enabled : e.target.checked });
});

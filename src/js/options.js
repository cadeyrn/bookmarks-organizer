'use strict';

const elDebugMode = document.getElementById('debug-mode');

const options = {
  async load () {
    const option = await browser.storage.local.get({ debug_enabled : false });
    elDebugMode.checked = option.debugEnabled;
  }
};

document.addEventListener('DOMContentLoaded', options.load);

elDebugMode.addEventListener('change', (e) => {
  browser.storage.local.set({ debugEnabled : e.target.checked });
});

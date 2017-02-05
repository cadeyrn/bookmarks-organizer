'use strict';

const elDebugMode = document.getElementById('debug_mode');

const options = {
  load : function () {
    browser.storage.local.get({ debug_enabled : false }).then((option) => {
      elDebugMode.checked = option.debug_enabled;
    });
  }
};

document.addEventListener('DOMContentLoaded', options.load);

elDebugMode.addEventListener('change', function () {
  browser.storage.local.set({ debug_enabled : this.checked });
});

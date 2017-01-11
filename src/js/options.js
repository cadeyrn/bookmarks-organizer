'use strict';

const elDebug = document.querySelector('#debug');

const options = {
  load : function () {
    function setDebugOption(result) {
      elDebug.checked = result.debug_enabled || false;
    }

    let debug = browser.storage.local.get('debug_enabled');
    debug.then(setDebugOption);
  }
};

document.addEventListener('DOMContentLoaded', options.load);

elDebug.addEventListener('change', function () {
  browser.storage.local.set({ 'debug_enabled' : this.checked });
});

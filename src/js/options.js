'use strict';

const elDebugMode = document.getElementById('debug-mode');

/**
 * @exports options
 */
const options = {
  /**
   * Fired when the initial HTML document has been completely loaded and parsed. This method is used to load the
   * current options.
   *
   * @returns {void}
   */
  async load () {
    const option = await browser.storage.local.get({ debug_enabled : false });
    elDebugMode.checked = option.debugEnabled;
  }
};

document.addEventListener('DOMContentLoaded', options.load);

elDebugMode.addEventListener('change', (e) => {
  browser.storage.local.set({ debugEnabled : e.target.checked });
});

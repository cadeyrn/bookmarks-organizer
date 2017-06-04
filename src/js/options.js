'use strict';

const elDebugMode = document.getElementById('debug-mode');
const elDisableConfirmations = document.getElementById('disable-confirmations');

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
    const option = await browser.storage.local.get({
      debugEnabled : false,
      disableConfirmations : false
    });

    elDebugMode.checked = option.debugEnabled;
    elDisableConfirmations.checked = option.disableConfirmations;
  }
};

document.addEventListener('DOMContentLoaded', options.load);

elDebugMode.addEventListener('change', (e) => {
  browser.storage.local.set({ debugEnabled : e.target.checked });
});

elDisableConfirmations.addEventListener('change', (e) => {
  browser.storage.local.set({ disableConfirmations : e.target.checked });
});

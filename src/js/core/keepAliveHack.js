'use strict';

// Please see https://bugzilla.mozilla.org/show_bug.cgi?id=1851373

const RESET_IDLE_TIME_MS = 10000;
const KEY_NAME = `keepAliveHack:${Date.now()}`;

browser.storage.session.onChanged.addListener(() => {
  // This storage onChanged listener is only used to keep
  // the event page alive while running tasks that will be
  // potentially last longer than the idle timeout.
});

// eslint-disable-next-line no-undef
globalThis.keepAliveHack = async function (promise) {
  const forceResetIdleTimer = () => browser.storage.session.set({ [KEY_NAME] : true });
  const clearSessionStore = () => browser.storage.session.remove([KEY_NAME]);
  forceResetIdleTimer();
  const interval = setInterval(forceResetIdleTimer, RESET_IDLE_TIME_MS);
  try {
    return await promise;
  }
  finally {
    clearInterval(interval);
    clearSessionStore();
  }
};

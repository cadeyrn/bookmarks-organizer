'use strict';

/* global STATUS */

const MIN_PROGRESS = 0.01;
const RELEASE_61 = 61;
const TIMEOUT_500_MS = 500;
const UI_PAGE = 'html/ui.html';

/**
 * @exports bookmarksorganizer
 */
const bookmarksorganizer = {
  /**
   * Limits the number of queried bookmarks. A value of 0 disables the limit. It's only there for debugging purposes.
   * In production it's always 0, there is no user setting.
   *
   * @type {integer}
   */
  LIMIT : 0,

  /**
   * Max attempts to connect to a url. It's always 2, there is no user setting (yet).
   *
   * @type {integer}
   */
  MAX_ATTEMPTS : 2,

  /**
   * Timeout for reaching a server in milliseconds. It's always 15 seconds, there is no user setting (yet).
   *
   * @type {integer}
   */
  TIMEOUT_IN_MS : 15000,

  /**
   * Never process more than QUEUE_SIZE bookmarks at the same time. It's always a size of 10, there is no user
   * setting (yet).
   *
   * @type {integer}
   */
  QUEUE_SIZE : 10,

  /**
   * Wheter the internal skip list should be used or not. It's always true, there is no user setting (yet).
   *
   * @type {integer}
   */
  USE_SKIP_LIST : true,

  /**
   * Enables or disables the debug mode. It defaults to false and can be enabled in the add-on's settings.
   *
   * @type {boolean}
   */
  debugEnabled : false,

  /**
   * Disables confirmation messages. It defaults to false and can be changed in the add-on's settings.
   *
   * @type {boolean}
   */
  disableConfirmations : false,

  /**
   * Internal variable. It's only true while a check is running.
   *
   * @type {boolean}
   */
  inProgress : false,

  /**
   * Internal variable. The index of the bookmark being checked.
   *
   * @type {integer}
   */
  internalCounter : 0,

  /**
   * The number of total bookmarks.
   *
   * @type {integer}
   */
  totalBookmarks : 0,

  /**
   * The number of already checked bookmarks.
   *
   * @type {integer}
   */
  checkedBookmarks : 0,

  /**
   * The number of found errors.
   *
   * @type {integer}
   */
  bookmarkErrors : 0,

  /**
   * The number of found warnings (e.g. redirects).
   *
   * @type {integer}
   */
  bookmarkWarnings : 0,

  /**
   * An array containing all bookmarks.
   *
   * @type {Array.<bookmarks.BookmarkTreeNode>}
   */
  collectedBookmarks : [],

  /**
   * An array of bookmarks with errors or warnings.
   *
   * @type {Array.<bookmarks.BookmarkTreeNode>}
   */
  bookmarksResult : [],

  /**
   * Additional data stored for bookmarks. In current version it only contains the full bookmark path.
   *
   * @type {Array.<string>}
   */
  additionalData : [],

  /**
   * An array with debugging data about bookmark requests. Only used if debug mode is enabled.
   *
   * @type {Array.<Object>}
   */
  debug : [],

  /**
   * An array of url patterns which should be ignored while checking for broken bookmarks. Please only add patterns
   * if there are known problems and add a comment with the GitHub issue.
   *
   * @type {Array.<string>}
   *
   */
  ignoreForBrokenBookmarks : [
    /* eslint-disable no-useless-escape, line-comment-position, no-inline-comments */
    '^https?:\/\/groups.google.com/group/', // issue #25
    '^https?:\/\/accounts-static.cdn.mozilla.net', // issue #76
    '^https?:\/\/accounts.firefox.com', // issue #76
    '^https?:\/\/addons.cdn.mozilla.net', // issue #76
    '^https?:\/\/addons.mozilla.org', // issue #76
    '^https?:\/\/api.accounts.firefox.com', // issue #76
    '^https?:\/\/content.cdn.mozilla.net', // issue #76
    '^https?:\/\/discovery.addons.mozilla.org', // issue #76
    '^https?:\/\/input.mozilla.org', // issue #76
    '^https?:\/\/install.mozilla.org', // issue #76
    '^https?:\/\/oauth.accounts.firefox.com', // issue #76
    '^https?:\/\/profile.accounts.firefox.com', // issue #76
    '^https?:\/\/support.mozilla.org', // issue #76
    '^https?:\/\/sync.services.mozilla.com', // issue #76
    '^https?:\/\/testpilot.firefox.com' // issue #76
    /* eslint-enable no-useless-escape, line-comment-position, no-inline-comments */
  ],

  /**
   * This method is used for version comparisons. It parses a given version number string and splits it into a major,
   * a minor and a patch component.
   *
   * @param {string} version - version number as string
   *
   * @returns {{major: (int), minor: (int), patch: (int)}} - object with major, minor and patch component of version
   */
  parseVersion (version) {
    const versionParts = version.split('.');
    const major = versionParts[0] ? parseInt(versionParts[0]) : 0;
    const minor = versionParts[1] ? parseInt(versionParts[1]) : 0;
    const patch = versionParts[2] ? parseInt(versionParts[2]) : 0;

    return { major, minor, patch };
  },

  /**
   * This method will be fired on add-on init and executes the onCreated listener for Firefox 61 and higher.
   *
   * @param {Object} info - an object containing information about the browser
   *
   * @returns {void}
   */
  init (info) {
    if (bookmarksorganizer.parseVersion(info.version).major >= RELEASE_61) {
      browser.bookmarks.onCreated.addListener(bookmarksorganizer.onBookmarkCreated);
    }
  },

  /**
   * Fired when a bookmark or a bookmark folder is created.
   *
   * @param {int} id - id of the bookmark that was created
   * @param {bookmarks.BookmarkTreeNode} bookmark - bookmark object containing the data of the new bookmark
   *
   * @returns {void}
   */
  onBookmarkCreated (id, bookmark) {
    bookmarksorganizer.collectAllBookmarks(bookmark, true);
  },

  /**
   * Fired when a bookmark or a bookmark folder is changed.
   *
   * @param {int} id - id of the bookmark that was changed
   * @param {bookmarks.BookmarkTreeNode} bookmark - bookmark object containing the new data of the bookmark
   *
   * @returns {void}
   */
  onBookmarkChanged (id, bookmark) {
    // update bookmark in array with all bookmarks
    const idx = bookmarksorganizer.collectedBookmarks.findIndex((obj) => obj.id === id);

    if (idx > -1) {
      if (bookmark.title || bookmark.title === '') {
        bookmarksorganizer.collectedBookmarks[idx].title = bookmark.title;
      }

      if (bookmark.url) {
        bookmarksorganizer.collectedBookmarks[idx].url = bookmark.url;
      }
    }
    else {
      bookmarksorganizer.collectedBookmarks.push(bookmark);
    }
  },

  /**
   * Fired when a bookmark or a bookmark folder is removed.
   *
   * @param {int} id - id of the bookmark that was removed
   *
   * @returns {void}
   */
  onBookmarkRemoved (id) {
    browser.runtime.sendMessage({
      message : 'total-bookmarks-changed',
      total_bookmarks : --bookmarksorganizer.totalBookmarks
    });

    // remove bookmark from array with all bookmarks
    const idx = bookmarksorganizer.collectedBookmarks.findIndex((obj) => obj.id === id);
    bookmarksorganizer.collectedBookmarks.splice(idx, 1);
  },

  /**
   * Fired whenever the user changes the input, after the user has started interacting with the add-on by entering
   * its keyword in the address bar and then pressing the space key.
   *
   * @param {string} input - user input in the address bar, not including the add-on's keyword itself or the space
   *                 after the keyword<br /><br />
   *                 <strong>Supported values:</strong> duplicates, empty-names, errors, organizer, redirects
   * @param {function} suggest - a callback function that the event listener can call to supply suggestions for the
   *                   address bar's drop-down list
   *
   * @returns {void}
   */
  showOmniboxSuggestions (input, suggest) {
    const availableCommands = ['duplicates', 'empty-names', 'errors', 'organizer', 'redirects'];
    const suggestions = [];

    for (const command of availableCommands) {
      if (command.indexOf(input) !== -1) {
        suggestions.push({
          content : command,
          description : browser.i18n.getMessage('omnibox_command_check_' + command.replace('-', '_'))
        });
      }

      if (suggestions.length === 0) {
        suggestions.push({
          content : 'organizer',
          description : browser.i18n.getMessage('omnibox_command_check_organizer')
        });
      }
    }

    suggest(suggestions);
  },

  /**
   * Fired when the user has selected one of the suggestions the add-on has added to the address bar's drop-down list.
   *
   * @param {string} input - this is the value that the user selected
   *
   * @returns {void}
   */
  callOmniboxAction (input) {
    bookmarksorganizer.openUserInterfaceInCurrentTab();

    // issue #74: set timeout to prevent "receiving end does not exist" error
    setTimeout(() => {
      switch (input) {
        case 'errors':
          bookmarksorganizer.execute('broken-bookmarks', 'errors');
          break;
        case 'redirects':
          bookmarksorganizer.execute('broken-bookmarks', 'warnings');
          break;
        case 'duplicates':
          bookmarksorganizer.execute('duplicates', 'all');
          break;
        case 'empty-names':
          bookmarksorganizer.execute('empty-names', 'all');
          break;
        case 'organizer':
        default:
          bookmarksorganizer.openUserInterfaceInCurrentTab();
      }
    }, TIMEOUT_500_MS);
  },

  /**
   * Fired when the toolbar icon is clicked. This method is used to open the user interface in a new tab or to switch
   * to the tab with the user interface if the user interface is alreary opened.
   *
   * @returns {void}
   */
  openUserInterface () {
    const url = browser.runtime.getURL(UI_PAGE);

    browser.tabs.query({}, (tabs) => {
      let tabId = null;

      for (const tab of tabs) {
        if (tab.url === url) {
          tabId = tab.id;
          break;
        }
      }

      if (tabId) {
        browser.tabs.update(tabId, { active : true });
      }
      else {
        browser.tabs.create({ url });
      }
    });
  },

  /**
   * This method is used to open the user interface in the current tab. It's used for the omnibox suggestions.
   *
   * @returns {void}
   */
  openUserInterfaceInCurrentTab () {
    browser.tabs.update(null, { url : browser.runtime.getURL(UI_PAGE) });
  },

  /**
   * Fired when a message is sent from the UI script to the background script.
   *
   * @param {Object} response - contains the response from the UI script
   *
   * @returns {void}
   */
  async handleResponse (response) {
    if (response.message === 'count') {
      bookmarksorganizer.initBookmarkCount();
    }
    else if (response.message === 'execute') {
      if (!bookmarksorganizer.inProgress) {
        bookmarksorganizer.execute(response.mode, 'all');
      }
    }
    else if (response.message === 'edit') {
      await browser.bookmarks.update(response.bookmarkId, {
        title : response.title,
        url : response.url
      });

      if (response.mode === 'duplicate') {
        browser.runtime.sendMessage({
          message : 'update-listitem',
          bookmarkId : response.bookmarkId,
          title : response.title,
          path : bookmarksorganizer.additionalData[response.bookmarkId].path,
          mode : response.mode
        });
      }
      else {
        const bookmarks = await browser.bookmarks.get(response.bookmarkId);
        browser.runtime.sendMessage({
          message : 'update-listitem',
          bookmarkId : response.bookmarkId,
          bookmark : bookmarks[0],
          mode : response.mode
        });
      }
    }
    else if (response.message === 'remove') {
      browser.bookmarks.remove(response.bookmarkId);
    }
    else if (response.message === 'repair-redirect') {
      browser.bookmarks.update(response.bookmarkId, { url : response.newUrl });
    }
    else if (response.message === 'ignore') {
      bookmarksorganizer.addToWhitelist(response.bookmarkId);
    }
  },

  /**
   * This method is used to start counting the number of bookmarks and to send the number of total bookmarks to the
   * UI script when finished.
   *
   * @returns {void}
   */
  async initBookmarkCount () {
    const bookmarks = await browser.bookmarks.getTree();

    bookmarksorganizer.totalBookmarks = 0;
    bookmarksorganizer.collectedBookmarks = [];
    bookmarksorganizer.collectAllBookmarks(bookmarks[0]);

    browser.runtime.sendMessage({
      message : 'total-bookmarks',
      total_bookmarks : bookmarksorganizer.totalBookmarks
    });
  },

  /**
   * This method is the starting point for checking the bookmarks.
   *
   * @param {string} mode - The checking mode<br /><br />
   *                 <strong>Supported values:</strong> broken-bookmarks, duplicates, empty-names
   * @param {string} type - The requested type of results<br /><br />
   *                 <strong>Supported values:</strong> errors, warnings, all
   *
   * @returns {void}
   */
  async execute (mode, type) {
    bookmarksorganizer.inProgress = true;
    bookmarksorganizer.internalCounter = 0;
    bookmarksorganizer.checkedBookmarks = 0;
    bookmarksorganizer.bookmarkErrors = 0;
    bookmarksorganizer.bookmarkWarnings = 0;
    bookmarksorganizer.bookmarksResult = [];
    bookmarksorganizer.additionalData = [];
    bookmarksorganizer.debug = [];

    browser.runtime.sendMessage({ message : 'started' });

    browser.storage.local.get((options) => {
      bookmarksorganizer.debugEnabled = options.debugEnabled || false;
      bookmarksorganizer.disableConfirmations = options.disableConfirmations || false;
    });

    switch (mode) {
      case 'broken-bookmarks':
        await bookmarksorganizer.processBookmarks(mode, type, bookmarksorganizer.QUEUE_SIZE);
        break;
      case 'duplicates':
        const bookmarks = await browser.bookmarks.getTree();

        bookmarksorganizer.getBookmarkPath(bookmarks[0], []);

        for (const bookmark of bookmarksorganizer.collectedBookmarks) {
          bookmarksorganizer.checkBookmarkAndAssignPath(bookmark, mode);
        }

        bookmarksorganizer.checkForDuplicates();
        break;
      case 'empty-names':
        for (const bookmark of bookmarksorganizer.collectedBookmarks) {
          bookmarksorganizer.checkForEmptyName(bookmark, mode);
        }
        break;
      default:
        // do nothing
    }
  },

  /**
   * Get the full path of all bookmarks. It's only used for the duplicates mode.
   *
   * @param {Array.<bookmarks.BookmarkTreeNode>} bookmark - a tree of bookmarks
   * @param {string} path - the path or a part of the path of the bookmark
   *
   * @returns {Array.<string>} - An array with the full path of all bookmarks
   */
  getBookmarkPath (bookmark, path) {
    if (bookmark.title) {
      path.push(bookmark.title);
    }

    if (bookmark.children) {
      for (const childNode of bookmark.children) {
        bookmarksorganizer.getBookmarkPath(childNode, path);
      }
    }
    else {
      if (!bookmarksorganizer.additionalData[bookmark.id]) {
        bookmarksorganizer.additionalData[bookmark.id] = {};
      }

      bookmarksorganizer.additionalData[bookmark.id].path = path.slice(0, -1);
    }

    path.pop();

    return bookmarksorganizer.additionalData;
  },

  /**
   * This method is used to check for broken bookmarks, called by processBookmarks().
   *
   * @param {bookmarks.BookmarkTreeNode} bookmark - a single bookmark
   * @param {string} mode - The checking mode<br /><br />
   *                 <strong>Supported values:</strong> broken-bookmarks, duplicates, empty-names
   * @param {string} type - The requested type of results<br /><br />
   *                 <strong>Supported values:</strong> errors, warnings, all
   *
   * @returns {void}
   */
  async checkForBrokenBookmark (bookmark, mode, type) {
    if (bookmark.url) {
      if (bookmarksorganizer.LIMIT > 0 && bookmarksorganizer.internalCounter === bookmarksorganizer.LIMIT) {
        return;
      }

      bookmarksorganizer.internalCounter++;

      if (bookmarksorganizer.USE_SKIP_LIST && bookmarksorganizer.ignoreForBrokenBookmarks.some((i) => (new RegExp('\\b' + i + '\\b')).test(bookmark.url))) {
        bookmarksorganizer.checkedBookmarks++;

        return;
      }

      const { whitelist } = await browser.storage.local.get({ whitelist : [] });

      if (whitelist.includes(bookmark.id)) {
        bookmarksorganizer.checkedBookmarks++;

        return;
      }

      if ((/^https?:\/\//).test(bookmark.url)) {
        bookmark.attempts = 0;

        const checkedBookmark = await bookmarksorganizer.checkHttpResponse(bookmark, 'HEAD');
        bookmarksorganizer.checkedBookmarks++;

        switch (checkedBookmark.status) {
          case STATUS.REDIRECT:
            if (type === 'all' || type === 'warnings') {
              bookmarksorganizer.bookmarkWarnings++;
              bookmarksorganizer.bookmarksResult.push(checkedBookmark);
            }
            break;
          case STATUS.NOT_FOUND:
          case STATUS.FETCH_ERROR:
          case STATUS.TIMEOUT:
            if (type === 'all' || type === 'errors') {
              bookmarksorganizer.bookmarkErrors++;
              bookmarksorganizer.bookmarksResult.push(checkedBookmark);
            }
            break;
          default:
            // do nothing
        }

        bookmarksorganizer.updateProgressUi(mode, true);
      }
      else {
        bookmarksorganizer.checkedBookmarks++;
        bookmarksorganizer.updateProgressUi(mode, true);
      }
    }
    else {
      bookmarksorganizer.bookmarksResult.push(bookmark);
    }
  },

  /**
   * This method sends a fetch request to check if a bookmark is broken or not, called by checkForBrokenBookmark().
   *
   * @param {bookmarks.BookmarkTreeNode} bookmark - a single bookmark
   * @param {string} method - the HTTP method to use (HEAD for first attempt, GET for second attempt)
   *
   * @returns {bookmarks.BookmarkTreeNode} - the bookmark object
   */
  async checkHttpResponse (bookmark, method) {
    bookmark.attempts++;

    try {
      const controller = new AbortController();
      const { signal } = controller;

      setTimeout(() => controller.abort(), bookmarksorganizer.TIMEOUT_IN_MS);

      const response = await fetch(bookmark.url, {
        cache : 'no-store',
        method : method,
        mode : 'no-cors',
        signal : signal
      });

      if (response.redirected) {
        // redirect to identical url. That's weird but there are cases in the real world…
        if (bookmark.url === response.url) {
          bookmark.status = STATUS.OK;
        }
        // redirect to another url
        else {
          bookmark.status = STATUS.REDIRECT;
        }

        bookmark.newUrl = response.url;

        // preserve the hash for redirects (issue #24)
        if (bookmark.url.indexOf('#') !== -1) {
          bookmark.newUrl += bookmark.url.substring(bookmark.url.indexOf('#'));
        }
      }
      else {
        const { headers } = response;
        if (headers.has('Content-Length') && headers.get('Content-Length') === '0') {
          bookmark.status = STATUS.EMPTY_BODY;
        }
        else {
          bookmark.status = response.status;
        }
      }

      if (bookmarksorganizer.debugEnabled) {
        bookmarksorganizer.debug.push({
          bookmark : {
            id : bookmark.id,
            parentId : bookmark.parentId,
            title : bookmark.title,
            url : bookmark.url,
            status : bookmark.status
          },
          method : method,
          cause : 'server-response',
          response : {
            url : response.url,
            redirected : response.redirected,
            status : response.status
          }
        });
      }

      if (bookmark.status > STATUS.REDIRECT) {
        if (bookmark.attempts < bookmarksorganizer.MAX_ATTEMPTS) {
          await bookmarksorganizer.checkHttpResponse(bookmark, 'GET');
        }
      }
    }
    catch (error) {
      let cause = 'fetch-error';

      if (error.name === 'AbortError') {
        bookmark.status = STATUS.TIMEOUT;
        cause = 'timeout';
      }
      else {
        bookmark.status = STATUS.FETCH_ERROR;
      }

      if (bookmarksorganizer.debugEnabled) {
        bookmarksorganizer.debug.push({
          bookmark : {
            id : bookmark.id,
            parentId : bookmark.parentId,
            title : bookmark.title,
            url : bookmark.url,
            status : bookmark.status
          },
          method : method,
          cause : cause,
          response : error.message
        });
      }

      if (bookmark.attempts < bookmarksorganizer.MAX_ATTEMPTS) {
        await bookmarksorganizer.checkHttpResponse(bookmark, 'GET');
      }
    }

    return bookmark;
  },

  /**
   * This method iterates over the full bookmark tree and pushes all bookmarks (except separators) to a global
   * array of bookmarks.
   *
   * @param {bookmarks.BookmarkTreeNode} bookmark - a single bookmark
   * @param {boolean} updateCounter - whether the number of total bookmarks should be updated or not
   *
   * @returns {void}
   */
  collectAllBookmarks (bookmark, updateCounter) {
    if (bookmarksorganizer.LIMIT > 0 && bookmarksorganizer.totalBookmarks === bookmarksorganizer.LIMIT) {
      return;
    }

    if (bookmark.type === 'separator') {
      return;
    }

    bookmarksorganizer.collectedBookmarks.push(bookmark);

    if (bookmark.url) {
      bookmarksorganizer.totalBookmarks++;
    }

    if (updateCounter) {
      browser.runtime.sendMessage({
        message : 'total-bookmarks-changed',
        total_bookmarks : bookmarksorganizer.totalBookmarks
      });
    }

    if (bookmark.children) {
      for (const child of bookmark.children) {
        bookmarksorganizer.collectAllBookmarks(child);
      }
    }
  },

  /**
   * This method iterates over the full bookmark tree and pushes all bookmarks (except separators) to an global
   * array of bookmarks.
   *
   * @param {string} mode - The checking mode<br /><br />
   *                 <strong>Supported values:</strong> broken-bookmarks, duplicates, empty-names
   * @param {string} type - The requested type of results<br /><br />
   *                 <strong>Supported values:</strong> errors, warnings, all
   * @param {int} queue_size - do not process more than queue_size bookmarks at the same time
   *
   * @returns {Promise.<Array.<*>>} - Promise
   */
  processBookmarks (mode, type, queue_size) {
    const limiter = bookmarksorganizer.throttle(queue_size);
    const tasks = [];

    const executeTask = function (aBookmark, aMode, aType) {
      return async function () {
        await bookmarksorganizer.checkForBrokenBookmark(aBookmark, aMode, aType);

        return limiter.give();
      };
    };

    for (const bookmark of bookmarksorganizer.collectedBookmarks) {
      tasks.push(limiter.take().then(executeTask(bookmark, mode, type)));
    }

    return Promise.all(tasks);
  },

  /**
   * This method provides the mechanics to throttle the requests. We do not want to execute more than queue_size
   * requests at the same time to improve the reliability of the bookmarks check.
   *
   * @param {int} queue_size - do not process more than queue_size bookmarks at the same time
   *
   * @returns {void}
   */
  throttle (queue_size) {
    const queue = {
      available : queue_size,
      maximum : queue_size
    };

    const futures = [];

    queue.take = function () {
      if (queue.available > 0) {
        queue.available -= 1;

        return Promise.resolve();
      }

      const p = new Promise((resolve) => {
        futures.push(resolve);
      });

      return p;
    };

    let emptyPromiseResolver = null;
    const emptyPromise = new Promise((resolve) => {
      emptyPromiseResolver = resolve;
    });

    queue.give = function () {
      if (futures.length) {
        const future = futures.shift();

        future();
      }
      else {
        queue.available += 1;

        if (queue.available === queue.maximum) {
          emptyPromiseResolver('empty queue');
        }
      }
    };

    queue.emptyPromise = function () {
      return emptyPromise;
    };

    return queue;
  },

  /**
   * This method assigns the full bookmark path to a bookmark object. It's only used for the duplicates mode.
   *
   * @param {bookmarks.BookmarkTreeNode} bookmark - a single bookmark
   * @param {string} mode - The checking mode<br /><br />
   *                 <strong>Supported values:</strong> broken-bookmarks, duplicates, empty-names
   *
   * @returns {void}
   */
  checkBookmarkAndAssignPath (bookmark, mode) {
    if (bookmark.url) {
      if (bookmarksorganizer.LIMIT > 0 && bookmarksorganizer.internalCounter === bookmarksorganizer.LIMIT) {
        return;
      }

      bookmark.path = bookmarksorganizer.additionalData[bookmark.id].path;

      bookmarksorganizer.internalCounter++;
      bookmarksorganizer.checkedBookmarks++;
      bookmarksorganizer.updateProgressUi(mode, false);
    }

    bookmarksorganizer.bookmarksResult.push(bookmark);
  },

  /**
   * This method is used to check for bookmarks with empty name.
   *
   * @param {bookmarks.BookmarkTreeNode} bookmark - a single bookmark
   * @param {string} mode - The checking mode<br /><br />
   *                 <strong>Supported values:</strong> broken-bookmarks, duplicates, empty-names
   *
   * @returns {void}
   */
  checkForEmptyName (bookmark, mode) {
    if (bookmark.url) {
      if (bookmarksorganizer.LIMIT > 0 && bookmarksorganizer.internalCounter === bookmarksorganizer.LIMIT) {
        return;
      }

      bookmarksorganizer.internalCounter++;

      // skip place:-URIs (issue #3)
      if (!bookmark.url.startsWith('place:')) {
        if (!bookmark.title) {
          bookmarksorganizer.bookmarkErrors++;
          bookmarksorganizer.bookmarksResult.push(bookmark);
        }
      }

      bookmarksorganizer.checkedBookmarks++;
      bookmarksorganizer.updateProgressUi(mode, true);
    }
    else {
      bookmarksorganizer.bookmarksResult.push(bookmark);
    }
  },

  /**
   * This method is used to check for duplicates.
   *
   * @returns {void}
   */
  checkForDuplicates () {
    const duplicates = { };

    bookmarksorganizer.bookmarksResult.forEach((bookmark) => {
      if (bookmark.url) {
        if (duplicates[bookmark.url]) {
          duplicates[bookmark.url].push(bookmark);
        }
        else {
          duplicates[bookmark.url] = [bookmark];
        }
      }
    });

    Object.keys(duplicates).forEach((key) => {
      if (duplicates[key].length < 2) {
        delete duplicates[key];
      }
      else {
        bookmarksorganizer.bookmarkErrors++;
      }
    });

    browser.runtime.sendMessage({
      message : 'show-duplicates-ui',
      bookmarks : duplicates,
      errors : bookmarksorganizer.bookmarkErrors,
      disableConfirmations : bookmarksorganizer.disableConfirmations
    });

    bookmarksorganizer.inProgress = false;
  },

  /**
   * This method is used to send the progress to the UI script.
   *
   * @param {string} mode - The checking mode<br /><br />
   *                 <strong>Supported values:</strong> broken-bookmarks, duplicates, empty-names
   * @param {boolean} checkForFinish - boolean, indicates whether the finished message should be sent to the UI script
   *                  or not
   *
   * @returns {void}
   */
  updateProgressUi (mode, checkForFinish) {
    let progress = bookmarksorganizer.checkedBookmarks / bookmarksorganizer.totalBookmarks;
    if (progress < MIN_PROGRESS) {
      progress = MIN_PROGRESS;
    }

    browser.runtime.sendMessage({
      message : 'update-counters',
      total_bookmarks : bookmarksorganizer.totalBookmarks,
      checked_bookmarks : bookmarksorganizer.checkedBookmarks,
      bookmarks_errors : bookmarksorganizer.bookmarkErrors,
      bookmarks_warnings : bookmarksorganizer.bookmarkWarnings,
      progress : progress
    });

    if (checkForFinish && bookmarksorganizer.checkedBookmarks === bookmarksorganizer.totalBookmarks) {
      const bookmarks = bookmarksorganizer.buildResultArray(bookmarksorganizer.bookmarksResult)[0].children;

      browser.runtime.sendMessage({
        message : 'finished',
        mode : mode,
        bookmarks : bookmarks,
        disableConfirmations : bookmarksorganizer.disableConfirmations,
        debug : bookmarksorganizer.debug
      });

      bookmarksorganizer.inProgress = false;
    }
  },

  /**
   * Builds an sorted array (by path) with the results (bookmarks with errors and warnings). Only used for broken
   * bookmarks and bookmarks with empty names, not for duplicates.
   *
   * @param {Array.<bookmarks.BookmarkTreeNode>} bookmarks - a tree of bookmarks
   *
   * @returns {Array.<bookmarks.BookmarkTreeNode>} - an array with the result of bookmarks with errors and warnings
   */
  buildResultArray (bookmarks) {
    const result = [];
    const mappedArray = {};
    let mappedElement = null;

    for (const bookmark of bookmarks) {
      mappedArray[bookmark.id] = bookmark;
      mappedArray[bookmark.id].children = [];
    }

    for (const id in mappedArray) {
      if (Object.prototype.hasOwnProperty.call(mappedArray, id)) {
        mappedElement = mappedArray[id];
        if (mappedElement.parentId) {
          mappedArray[mappedElement.parentId].children.push(mappedElement);
        }
        else {
          result.push(mappedElement);
        }
      }
    }

    return result;
  },

  /**
   * Adds a bookmark to the whitelist.
   *
   * @param {integer} bookmarkId - the id of the bookmark
   *
   * @returns {void}
   */
  async addToWhitelist (bookmarkId) {
    const { whitelist } = await browser.storage.local.get({ whitelist : [] });

    if (!whitelist.includes(bookmarkId)) {
      whitelist.push(bookmarkId);
      browser.storage.local.set({ whitelist : whitelist });
    }
  }
};

browser.runtime.getBrowserInfo().then(bookmarksorganizer.init).catch();
browser.bookmarks.onChanged.addListener(bookmarksorganizer.onBookmarkChanged);
browser.bookmarks.onRemoved.addListener(bookmarksorganizer.onBookmarkRemoved);
browser.browserAction.onClicked.addListener(bookmarksorganizer.openUserInterface);
browser.omnibox.onInputChanged.addListener(bookmarksorganizer.showOmniboxSuggestions);
browser.omnibox.onInputEntered.addListener(bookmarksorganizer.callOmniboxAction);
browser.omnibox.setDefaultSuggestion({ description : browser.i18n.getMessage('omnibox_default_description') });
browser.runtime.onMessage.addListener(bookmarksorganizer.handleResponse);

browser.menus.create({
  title : browser.i18n.getMessage('omnibox_command_check_organizer'),
  contexts : ['tools_menu'],
  command : '_execute_browser_action'
});

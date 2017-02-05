'use strict';

const bookmarkchecker = {
  UI_PAGE : 'html/ui.html',
  LIMIT : 0,
  TIMEOUT : 0,
  ATTEMPTS : 2,
  debug_enabled : false,
  inProgress : false,
  internalCounter : 0,
  totalBookmarks : 0,
  checkedBookmarks : 0,
  bookmarkErrors : 0,
  bookmarkWarnings : 0,
  unknownBookmarks : 0,
  bookmarksResult : [],
  additionalData : [],
  debug : [],

  showOmniboxSuggestions : function (input, suggest) {
    suggest([
      { content : 'check-all', description : browser.i18n.getMessage('omnibox_command_check_all') },
      { content : 'check-errors', description : browser.i18n.getMessage('omnibox_command_check_errors') },
      { content : 'check-warnings', description : browser.i18n.getMessage('omnibox_command_check_warnings') },
      { content : 'check-unknowns', description : browser.i18n.getMessage('omnibox_command_check_unknowns') },
      { content : 'duplicates', description : browser.i18n.getMessage('omnibox_command_check_duplicates') },
      { content : 'empty-titles', description : browser.i18n.getMessage('omnibox_command_empty_titles') }
    ]);
  },

  callOmniboxAction : function (input) {
    bookmarkchecker.openUserInterfaceInCurrentTab();
    bookmarkchecker.countBookmarks();

    switch (input) {
      case 'check-all':
        bookmarkchecker.execute('broken-bookmarks', 'all');
        break;
      case 'check-errors':
        bookmarkchecker.execute('broken-bookmarks', 'errors');
        break;
      case 'check-warnings':
        bookmarkchecker.execute('broken-bookmarks', 'warnings');
        break;
      case 'check-unknowns':
        bookmarkchecker.execute('broken-bookmarks', 'unknowns');
        break;
      case 'duplicates':
        bookmarkchecker.execute('duplicates', 'all');
        break;
      case 'empty-titles':
        bookmarkchecker.execute('empty-titles', 'all');
        break;
    }
  },

  openUserInterface : function () {
    const url = browser.extension.getURL(bookmarkchecker.UI_PAGE);

    browser.tabs.query({}, (tabs) => {
      let tabId = null;

      for (const tab of tabs) {
        if (tab.url === url) {
          tabId = tab.id;
          break;
        }
      }

      if (tabId) {
        browser.tabs.update(tabId, { 'active' : true });
      }
      else {
        browser.tabs.create({ 'url' : url });
      }
    });
  },

  openUserInterfaceInCurrentTab : function () {
    browser.tabs.update(null, { 'url' : browser.extension.getURL(bookmarkchecker.UI_PAGE) });
  },

  handleResponse : function (response) {
    if (response.message === 'execute') {
      if (!bookmarkchecker.inProgress) {
        bookmarkchecker.countBookmarks();
        bookmarkchecker.execute(response.mode, 'all');
      }
    }
    else if (response.message === 'edit') {
      const p = browser.bookmarks.update(response.bookmarkId, {
        title : response.title,
        url : response.url
      });

      p.then(() => {
        if (response.mode === 'duplicate') {
          browser.runtime.sendMessage({
            'message' : 'update-listitem',
            'bookmarkId' : response.bookmarkId,
            'title' : response.title,
            'path' : bookmarkchecker.additionalData[response.bookmarkId].path,
            'mode' : response.mode
          });
        }
        else {
          browser.bookmarks.get(response.bookmarkId).then((bookmarks) => {
            browser.runtime.sendMessage({
              'message' : 'update-listitem',
              'bookmarkId' : response.bookmarkId,
              'bookmark' : bookmarks[0],
              'mode' : response.mode
            });
          });
        }
      });
    }
    else if (response.message === 'remove') {
      browser.bookmarks.remove(response.bookmarkId);
    }
    else if (response.message === 'repair-redirect') {
      browser.bookmarks.update(response.bookmarkId, { url : response.newUrl });
    }
  },

  countBookmarks : function () {
    bookmarkchecker.inProgress = true;
    bookmarkchecker.totalBookmarks = 0;

    browser.bookmarks.getTree().then((bookmarks) => {
      bookmarkchecker.countBookmarksRecursive(bookmarks[0]);

      browser.runtime.sendMessage({
        'message' : 'total-bookmarks',
        'total_bookmarks' : bookmarkchecker.totalBookmarks
      });
    });
  },

  countBookmarksRecursive : function (bookmark) {
    if (bookmark.url) {
      if (bookmarkchecker.LIMIT > 0 && bookmarkchecker.totalBookmarks === bookmarkchecker.LIMIT) {
        return;
      }

      bookmarkchecker.totalBookmarks++;
    }

    if (bookmark.children) {
      for (const child of bookmark.children) {
        bookmarkchecker.countBookmarksRecursive(child);
      }
    }
  },

  updateProgressUi : function (checkForFinish) {
    let progress = bookmarkchecker.checkedBookmarks / bookmarkchecker.totalBookmarks;
      if (progress < 0.01) {
        progress = 0.01;
      }

      browser.runtime.sendMessage({
        'message' : 'update-counters',
        'total_bookmarks' : bookmarkchecker.totalBookmarks,
        'checked_bookmarks' : bookmarkchecker.checkedBookmarks,
        'unknown_bookmarks' : bookmarkchecker.unknownBookmarks,
        'bookmarks_errors' : bookmarkchecker.bookmarkErrors,
        'bookmarks_warnings' : bookmarkchecker.bookmarkWarnings,
        'progress' : progress
      });

      if (checkForFinish && bookmarkchecker.checkedBookmarks === bookmarkchecker.totalBookmarks) {
        const bookmarks = bookmarkchecker.buildResultArray(bookmarkchecker.bookmarksResult)[0].children;

        browser.runtime.sendMessage({
          'message' : 'finished',
          'bookmarks' : bookmarks,
          'debug' : bookmarkchecker.debug
        });

        bookmarkchecker.inProgress = false;
      }
  },

  getAdditionalData : function (bookmark, path, map) {
    if (bookmark.title) {
      path.push(bookmark.title);
    }

    if (bookmark.children) {
      for (const childNode of bookmark.children) {
        bookmarkchecker.getAdditionalData(childNode, path, map);
      }
    }
    else {
      if (!map[bookmark.id]) {
        map[bookmark.id] = {};
      }

      map[bookmark.id].path = path.slice(0, -1);
    }

    path.pop();

    return map;
  },

  execute : function (mode, type) {
    bookmarkchecker.internalCounter = 0;
    bookmarkchecker.checkedBookmarks = 0;
    bookmarkchecker.bookmarkErrors = 0;
    bookmarkchecker.bookmarkWarnings = 0;
    bookmarkchecker.unknownBookmarks = 0;
    bookmarkchecker.bookmarksResult = [];
    bookmarkchecker.additionalData = [];
    bookmarkchecker.debug = [];

    browser.storage.local.get('debug_enabled', (options) => {
      bookmarkchecker.debug_enabled = options.debug_enabled;
    });

    const p = browser.bookmarks.getTree().then((bookmarks) => {
      bookmarkchecker.getAdditionalData(bookmarks[0], [], bookmarkchecker.additionalData);
      bookmarkchecker.checkBookmarks(bookmarks[0], mode, type);
    });

    if (mode === 'duplicates') {
      p.then(() => {
        const duplicates = { };

        bookmarkchecker.bookmarksResult.forEach((bookmark) => {
          if (bookmark.url) {
            if (duplicates[bookmark.url]) {
              duplicates[bookmark.url].push(bookmark);
            }
            else {
              duplicates[bookmark.url] = [bookmark];
            }
          }
        });

        Object.keys(duplicates).forEach((key, idx) => {
          if (duplicates[key].length < 2) {
            delete duplicates[key];
          }
          else {
            bookmarkchecker.bookmarkWarnings++;
          }
        });

        browser.runtime.sendMessage({
          'message' : 'show-duplicates-ui',
          'bookmarks' : duplicates,
          'warnings' : bookmarkchecker.bookmarkWarnings
        });

        bookmarkchecker.inProgress = false;
      });
    }
  },

  checkBookmarks : function (bookmark, mode, type) {
    switch (mode) {
      case 'broken-bookmarks':
        bookmarkchecker.checkForBrokenBookmarks(bookmark, type);
        break;
      case 'duplicates':
        bookmarkchecker.checkForAllBookmarks(bookmark);
        break;
      case 'empty-titles':
        bookmarkchecker.checkForEmptyTitles(bookmark);
        break;
    }

    if (bookmark.children) {
      for (const child of bookmark.children) {
        bookmarkchecker.checkBookmarks(child, mode, type);
      }
    }
  },

  checkForBrokenBookmarks : function (bookmark, type) {
    if (bookmark.url) {
      if (bookmarkchecker.LIMIT > 0 && bookmarkchecker.internalCounter === bookmarkchecker.LIMIT) {
        return;
      }

      bookmarkchecker.internalCounter++;

      if (bookmark.url.match(/^https?:\/\//)) {
        bookmark.attempts = 0;

        bookmarkchecker.checkResponse(bookmark, function (bookmark) {
          bookmarkchecker.checkedBookmarks++;

          if (bookmark.status !== STATUS.OK) {
            switch (bookmark.status) {
              case STATUS.REDIRECT:
                if (type === 'all' || type === 'warnings') {
                  bookmarkchecker.bookmarkWarnings++;
                  bookmarkchecker.bookmarksResult.push(bookmark);
                }
                break;
              case STATUS.NOT_FOUND:
              case STATUS.FETCH_ERROR:
                if (type === 'all' || type === 'errors') {
                  bookmarkchecker.bookmarkErrors++;
                  bookmarkchecker.bookmarksResult.push(bookmark);
                }
                break;
              case STATUS.TIMEOUT:
              case STATUS.UNKNOWN_ERROR:
                if (type === 'all' || type === 'unknowns') {
                  bookmarkchecker.unknownBookmarks++;
                  bookmarkchecker.bookmarksResult.push(bookmark);
                }
                break;
            }
          }

          bookmarkchecker.updateProgressUi(true);
        });
      }
      else {
        bookmarkchecker.checkedBookmarks++;
        bookmarkchecker.updateProgressUi(true);
      }
    }
    else {
      bookmarkchecker.bookmarksResult.push(bookmark);
    }
  },

  checkResponse : function (bookmark, callback) {
    bookmark.attempts++;

    const p = Promise.race([
      fetch(bookmark.url, { credentials : 'include', cache : 'no-store' }), new Promise(function (resolve, reject) {
        if (bookmarkchecker.TIMEOUT > 0) {
          setTimeout(() => reject(new Error('timeout')), bookmarkchecker.TIMEOUT);
        }
      })
    ]);

    p.then(function (response) {
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
      }
      else {
        bookmark.status = response.status;
      }

      if (bookmarkchecker.debug_enabled) {
        bookmarkchecker.debug.push({
          bookmark : {
            id : bookmark.id,
            parentId : bookmark.parentId,
            title : bookmark.title,
            url : bookmark.url,
            status : bookmark.status
          },
          cause : 'server-response',
          response : {
            url : response.url,
            redirected : response.redirected,
            status : response.status
          }
        });
      }

      callback(bookmark);
    });

    p.catch(function (error) {
      if (error.message === 'timeout') {
        bookmark.status = STATUS.TIMEOUT;
      }
      else {
        bookmark.status = STATUS.FETCH_ERROR;
      }

      if (bookmarkchecker.debug_enabled) {
        bookmarkchecker.debug.push({
          bookmark : {
            id : bookmark.id,
            parentId : bookmark.parentId,
            title : bookmark.title,
            url : bookmark.url,
            status : bookmark.status
          },
          cause : 'fetch-error',
          response : error.message
        });
      }

      if (bookmark.attempts < bookmarkchecker.ATTEMPTS) {
        bookmarkchecker.checkResponse(bookmark, callback);
      }
      else {
        callback(bookmark);
      }
    });
  },

  checkForAllBookmarks : function (bookmark) {
    if (bookmark.url) {
      if (bookmarkchecker.LIMIT > 0 && bookmarkchecker.internalCounter === bookmarkchecker.LIMIT) {
        return;
      }

      bookmark.path = bookmarkchecker.additionalData[bookmark.id].path;

      bookmarkchecker.internalCounter++;
      bookmarkchecker.checkedBookmarks++;
      bookmarkchecker.updateProgressUi(false);
    }

    bookmarkchecker.bookmarksResult.push(bookmark);
  },

  checkForEmptyTitles : function (bookmark) {
    if (bookmark.url) {
      if (bookmarkchecker.LIMIT > 0 && bookmarkchecker.internalCounter === bookmarkchecker.LIMIT) {
        return;
      }

      bookmarkchecker.internalCounter++;

      if (!bookmark.title) {
        bookmarkchecker.bookmarkErrors++;
        bookmarkchecker.bookmarksResult.push(bookmark);
      }

      bookmarkchecker.checkedBookmarks++;
      bookmarkchecker.updateProgressUi(true);
    }
    else {
      bookmarkchecker.bookmarksResult.push(bookmark);
    }
  },

  buildResultArray : function (bookmarks) {
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
  }
};

browser.browserAction.onClicked.addListener(bookmarkchecker.openUserInterface);
browser.runtime.onMessage.addListener(bookmarkchecker.handleResponse);

// only available Firefox 52+
if (typeof browser.omnibox !== 'undefined') {
  browser.omnibox.onInputChanged.addListener(bookmarkchecker.showOmniboxSuggestions);
  browser.omnibox.onInputEntered.addListener(bookmarkchecker.callOmniboxAction);
}

'use strict';

const bookmarkchecker = {
  UI_PAGE : 'html/ui.html',
  LIMIT : 0,
  TIMEOUT: 0,
  inProgress : false,
  internalCounter : 0,
  totalBookmarks : 0,
  checkedBookmarks : 0,
  bookmarkErrors : 0,
  bookmarkWarnings : 0,
  unknownBookmarks : 0,
  bookmarksResult : [],
  errors : [],

  showOmniboxSuggestions : function (input, suggest) {
    suggest([
      { content : 'check-all', description : browser.i18n.getMessage('omnibox_command_check_all') },
      { content : 'check-errors', description : browser.i18n.getMessage('omnibox_command_check_errors') },
      { content : 'check-warnings', description : browser.i18n.getMessage('omnibox_command_check_warnings') },
      { content : 'check-unknowns', description : browser.i18n.getMessage('omnibox_command_check_unknowns') }
    ]);
  },

  callOmniboxAction : function (input) {
    bookmarkchecker.openUserInterfaceInCurrentTab();
    bookmarkchecker.countBookmarks();

    switch (input) {
      case 'check-all':
        bookmarkchecker.execute('all');
        break;
      case 'check-errors':
        bookmarkchecker.execute('errors');
        break;
      case 'check-warnings':
        bookmarkchecker.execute('warnings');
        break;
      case 'check-unknowns':
        bookmarkchecker.execute('unknowns');
        break;
    }
  },

  openUserInterface : function () {
    const url = browser.extension.getURL(bookmarkchecker.UI_PAGE);

    browser.tabs.query({}, (tabs) => {
      let tabId;

      for (let tab of tabs) {
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
        bookmarkchecker.execute('all');
      }
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
      bookmarkchecker.checkBookmarks(bookmarks[0], 'count', 'all');

      browser.runtime.sendMessage({
        'message' : 'total-bookmarks',
        'total_bookmarks' : bookmarkchecker.totalBookmarks
      });
    });
  },

  execute : function (type) {
    bookmarkchecker.internalCounter = 0;
    bookmarkchecker.checkedBookmarks = 0;
    bookmarkchecker.bookmarkErrors = 0;
    bookmarkchecker.bookmarkWarnings = 0;
    bookmarkchecker.unknownBookmarks = 0;
    bookmarkchecker.bookmarksResult = [];

    browser.bookmarks.getTree().then((bookmarks) => {
      bookmarkchecker.checkBookmarks(bookmarks[0], 'check', type);
    });
  },

  checkBookmarks : function (bookmark, mode, type) {
    if (bookmark.url) {
      if (bookmark.url.match(/^https?:\/\//)) {
        if (mode === 'count') {
          if (bookmarkchecker.LIMIT > 0 && bookmarkchecker.totalBookmarks === bookmarkchecker.LIMIT) {
            return;
          }

          bookmarkchecker.totalBookmarks++;
        }
        else {
          if (bookmarkchecker.LIMIT > 0 && bookmarkchecker.internalCounter === bookmarkchecker.LIMIT) {
            return;
          }

          bookmarkchecker.internalCounter++;
          bookmarkchecker.checkSingleBookmark(bookmark, type);
        }
      }
    }
    else {
      bookmarkchecker.bookmarksResult.push(bookmark);
    }

    if (bookmark.children) {
      for (let child of bookmark.children) {
        bookmarkchecker.checkBookmarks(child, mode, type);
      }
    }
  },

  checkSingleBookmark : function (bookmark, type) {
    browser.bookmarks.get(bookmark.parentId).then((parentBookmark) => {
      bookmark.parentTitle = parentBookmark[0].title;
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
              if (type === 'all' || type === 'errors') {
                bookmarkchecker.bookmarkErrors++;
                bookmarkchecker.bookmarksResult.push(bookmark);
              }
              break;
            case STATUS.UNKNOWN_ERROR:
              if (type === 'all' || type === 'unknowns') {
                bookmarkchecker.unknownBookmarks++;
                bookmarkchecker.bookmarksResult.push(bookmark);
              }
              break;
          }
        }

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

        if (bookmarkchecker.checkedBookmarks === bookmarkchecker.totalBookmarks) {
          const bookmarks = bookmarkchecker.buildResultArray(bookmarkchecker.bookmarksResult)[0].children;
          browser.runtime.sendMessage({ 'message' : 'finished', 'bookmarks' : bookmarks, 'errors' : bookmarkchecker.errors });
          bookmarkchecker.inProgress = false;
        }
      });
    });
  },

  checkResponse : function (bookmark, callback) {
    const p = Promise.race([
      fetch(bookmark.url, { cache : 'no-store' }), new Promise(function (resolve, reject) {
        if (bookmarkchecker.TIMEOUT > 0) {
          setTimeout(() => reject(new Error('timeout')), bookmarkchecker.TIMEOUT)
        }
      })
    ]);

    p.then(function (response) {
      if (response.redirected) {
        // redirect to identical url, there is something wrong, but we don't know the details…
        if (bookmark.url === response.url) {
          bookmark.status = STATUS.UNKNOWN_ERROR;
        }
        // redirect to another url
        else {
          bookmark.status = STATUS.REDIRECT;
        }

        bookmark.newUrl = response.url;
      }
      else {
        if (response.status === STATUS.NOT_FOUND) {
          bookmarkchecker.errors.push({
            bookmark : bookmark,
            cause : 'server-response',
            response : {
              type : response.type,
              url : response.url,
              redirected : response.redirected,
              status : response.status,
              ok : response.ok,
              statusText : response.statusText,
              bodyUsed : response.bodyUsed
            }
          });
        }
        bookmark.status = response.status;
      }

      callback(bookmark);
    });

    p.catch(function (error) {
      if (error.message === 'timeout') {
        bookmark.status = STATUS.TIMEOUT;
      }
      else {
        bookmarkchecker.errors.push({
          bookmark : bookmark,
          cause : 'fetch-error',
          response : error.message
        });
        bookmark.status = STATUS.NOT_FOUND;
      }

      callback(bookmark);
    });
  },

  buildResultArray : function (bookmarks) {
    const result = [];
    const mappedArray = {};
    let mappedElement;

    for (let bookmark of bookmarks) {
      mappedArray[bookmark.id] = bookmark;
      mappedArray[bookmark.id]['children'] = [];
    }

    for (let id in mappedArray) {
      if (mappedArray.hasOwnProperty(id)) {
        mappedElement = mappedArray[id];
        if (mappedElement.parentId) {
          mappedArray[mappedElement['parentId']]['children'].push(mappedElement);
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

// Firefox 52+
if (typeof browser.omnibox !== 'undefined') {
  browser.omnibox.onInputChanged.addListener(bookmarkchecker.showOmniboxSuggestions);
  browser.omnibox.onInputEntered.addListener(bookmarkchecker.callOmniboxAction);
}

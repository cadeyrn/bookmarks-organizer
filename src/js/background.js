'use strict';

const bookmarkchecker = {
  UI_PAGE : 'html/ui.html',
  LIMIT : 10000,
  TIMEOUT: 0,
  internalCounter : 0,
  totalBookmarks : 0,
  checkedBookmarks : 0,
  bookmarkErrors : 0,
  bookmarkWarnings : 0,
  unknownBookmarks : 0,
  bookmarksResult : [],

  openUserInterface : function () {
    browser.tabs.create({ url : browser.runtime.getURL(bookmarkchecker.UI_PAGE) });
  },

  handleResponse : function (response) {
    if (response.message === 'execute') {
      bookmarkchecker.countBookmarks();
      bookmarkchecker.execute();
    }
    else if (response.message === 'remove') {
      browser.bookmarks.remove(response.bookmarkId);
    }
  },

  countBookmarks : function () {
    bookmarkchecker.totalBookmarks = 0;

    browser.bookmarks.getTree().then((bookmarks) => {
      bookmarkchecker.checkBookmarks(bookmarks[0], 'count');

      browser.runtime.sendMessage({
        'message' : 'total-bookmarks',
        'total_bookmarks' : bookmarkchecker.totalBookmarks
      });
    });
  },

  execute : function () {
    bookmarkchecker.internalCounter = 0;
    bookmarkchecker.checkedBookmarks = 0;
    bookmarkchecker.bookmarkErrors = 0;
    bookmarkchecker.bookmarkWarnings = 0;
    bookmarkchecker.unknownBookmarks = 0;
    bookmarkchecker.bookmarksResult = [];

    browser.bookmarks.getTree().then((bookmarks) => {
      bookmarkchecker.checkBookmarks(bookmarks[0], 'errors');
    });
  },

  checkBookmarks : function (bookmark, mode) {
    if (bookmark.url) {
      if (!bookmark.url.match(/^(about:|place:)/)) {
        if (mode === 'count') {
          if (bookmarkchecker.totalBookmarks === bookmarkchecker.LIMIT) {
            return;
          }

          bookmarkchecker.totalBookmarks++;
        }
        else {
          if (bookmarkchecker.internalCounter === bookmarkchecker.LIMIT) {
            return;
          }

          bookmarkchecker.internalCounter++;
          bookmarkchecker.checkSingleBookmark(bookmark);
        }
      }
    }
    else {
      bookmarkchecker.bookmarksResult.push(bookmark);
    }

    if (bookmark.children) {
      for (let child of bookmark.children) {
        bookmarkchecker.checkBookmarks(child, mode);
      }
    }
  },

  checkSingleBookmark : function (bookmark) {
    browser.bookmarks.get(bookmark.parentId).then((parentBookmark) => {
      bookmark.parentTitle = parentBookmark[0].title;
      bookmarkchecker.checkResponse(bookmark, function (bookmark) {
        bookmarkchecker.checkedBookmarks++;

        if (bookmark.status !== 200) {
          if (bookmark.status == 901) {
             bookmarkchecker.bookmarkWarnings++;
          }
          else if (bookmark.status == 999) {
            bookmarkchecker.unknownBookmarks++;
          }
          else {
            bookmarkchecker.bookmarkErrors++;
          }

          bookmarkchecker.bookmarksResult.push(bookmark);
        }

        browser.runtime.sendMessage({
          'message' : 'update-counters',
          'checked_bookmarks' : bookmarkchecker.checkedBookmarks,
          'unknown_bookmarks' : bookmarkchecker.unknownBookmarks,
          'bookmarks_errors' : bookmarkchecker.bookmarkErrors,
          'bookmarks_warnings' : bookmarkchecker.bookmarkWarnings,
          'progress' : bookmarkchecker.checkedBookmarks / bookmarkchecker.totalBookmarks
        });

        if (bookmarkchecker.checkedBookmarks === bookmarkchecker.totalBookmarks) {
          const bookmarks = bookmarkchecker.buildResultArray(bookmarkchecker.bookmarksResult)[0].children;
          browser.runtime.sendMessage({ 'message' : 'finished', 'bookmarks' : bookmarks });
        }
      });
    });
  },

  checkResponse : function (bookmark, callback) {
    const p = Promise.race([
      fetch(bookmark.url), new Promise(function (resolve, reject) {
        if (bookmarkchecker.TIMEOUT > 0) {
          setTimeout(() => reject(new Error('request timeout')), bookmarkchecker.TIMEOUT)
        }
      })
    ]);

    p.then(function (response) {
      if (response.redirected) {
        bookmark.status = 901;
        bookmark.newUrl = response.url;
      }
      else {
        bookmark.status = response.status;
      }

      callback(bookmark);
    });

    p.catch(function (error) {
      if (error.message === 'request timeout') {
        bookmark.status = 999;
      }
      else {
        bookmark.status = 404;
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

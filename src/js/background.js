'use strict';

const bookmarkchecker = {
  UI_PAGE : 'html/ui.html',
  LIMIT : 200,
  TIMEOUT: 10000,
  internalCounter : 0,
  totalBookmarks : 0,
  checkedBookmarks : 0,
  brokenBookmarks : 0,

  openUserInterface : function () {
    browser.tabs.create({ url : browser.runtime.getURL(bookmarkchecker.UI_PAGE) });
  },

  handleResponse : function (response) {
    if (response.message === 'execute') {
      bookmarkchecker.countBookmarks();
      bookmarkchecker.execute();
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
    bookmarkchecker.brokenBookmarks = 0;

    browser.bookmarks.getTree().then((bookmarks) => {
      bookmarkchecker.checkBookmarks(bookmarks[0], 'errors');
    });
  },

  checkBookmarks : function (bookmark, mode) {
    if (bookmark.url && !bookmark.url.match(/^(about:|place:)/)) {
      if (mode === 'count') {
        if (bookmarkchecker.totalBookmarks === bookmarkchecker.LIMIT) {
          return;
        }

        bookmarkchecker.totalBookmarks++;
      } else {
        if (bookmarkchecker.internalCounter === bookmarkchecker.LIMIT) {
          return;
        }

        bookmarkchecker.internalCounter++;
        bookmarkchecker.checkSingleBookmark(bookmark);
      }
    }

    if (bookmark.children) {
      for (let child of bookmark.children) {
        bookmarkchecker.checkBookmarks(child, mode);
      }
    }
  },

  checkSingleBookmark : function (bookmark) {
    bookmarkchecker.checkResponse(bookmark, function (bookmark) {
      bookmarkchecker.checkedBookmarks++;

      if (bookmark.status != 200) {
        bookmarkchecker.brokenBookmarks++;
        browser.runtime.sendMessage({ 'message' : 'add-result', 'bookmark' : bookmark });
      }

      browser.runtime.sendMessage({
        'message' : 'update-counters',
        'checked_bookmarks' : bookmarkchecker.checkedBookmarks,
        'broken_bookmarks' : bookmarkchecker.brokenBookmarks,
        'progress' : bookmarkchecker.checkedBookmarks / bookmarkchecker.totalBookmarks
      });

      if (bookmarkchecker.checkedBookmarks === bookmarkchecker.totalBookmarks) {
        browser.runtime.sendMessage({ 'message' : 'finished' });
      }
    });
  },

  checkResponse : function (bookmark, callback) {
    const request = new XMLHttpRequest();
    request.open('get', bookmark.url);
    request.send();

    let timer = setTimeout(function () {
      request.onreadystatechange = null;
      request.abort();
      bookmark.status = 408;
      callback(bookmark);
    }, bookmarkchecker.TIMEOUT);

    request.onreadystatechange = function () {
      if (request.readyState === 4) {
        clearTimeout(timer);
        bookmark.status = request.status;
        callback(bookmark);
      }
    };
  }
};

browser.browserAction.onClicked.addListener(bookmarkchecker.openUserInterface);
browser.runtime.onMessage.addListener(bookmarkchecker.handleResponse);

'use strict';

const bookmarkchecker = {
  TIMEOUT : 5000,
  UI_PAGE : 'html/ui.html',

  openUserInterface : function () {
    browser.tabs.create({ url : browser.runtime.getURL(bookmarkchecker.UI_PAGE) });
  },

  handleResponse : function (response) {
    if (response.message === 'execute') {
      bookmarkchecker.execute();
    }
  },

  execute : function () {
    browser.bookmarks.getTree().then((bookmarks) => {
      bookmarkchecker.checkBookmarks(bookmarks[0]);
    });
  },

  checkBookmarks : function (bookmark) {
    if (bookmark.url && !bookmark.url.match(/^(about:|place:)/)) {
      bookmarkchecker.checkSingleBookmark(bookmark);
    }

    if (bookmark.children) {
      for (let child of bookmark.children) {
        bookmarkchecker.checkBookmarks(child);
      }
    }
  },

  checkSingleBookmark : function (bookmark) {
    bookmarkchecker.checkResponse(bookmark, function (bookmark) {
      if (bookmark.status != 200) {
        browser.runtime.sendMessage({ 'message' : 'add-result', 'bookmark' : bookmark });
      }
    });
  },

  checkResponse : function (bookmark, callback) {
    const request = new XMLHttpRequest();
    request.open('get', bookmark.url, true);
    request.send(null);

    const timeout_id = setTimeout(function () {
      request.onreadystatechange = null;
      request.abort();
      bookmark.status = 408;
      callback(bookmark);
    }, bookmarkchecker.TIMEOUT);

    request.onreadystatechange = function () {
      if (request.readyState === 4) {
        clearTimeout(timeout_id);
        bookmark.status = request.status ? request.status : 900;
        callback(bookmark);
      }
    };
  }
};

browser.browserAction.onClicked.addListener(bookmarkchecker.openUserInterface);
browser.runtime.onMessage.addListener(bookmarkchecker.handleResponse);

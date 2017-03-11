'use strict';

/* global STATUS */

const MIN_PROGRESS = 0.01;
const UI_PAGE = 'html/ui.html';

const bookmarkchecker = {
  LIMIT : 0,
  ATTEMPTS : 2,
  debug_enabled : false,
  inProgress : false,
  internalCounter : 0,
  totalBookmarks : 0,
  checkedBookmarks : 0,
  bookmarkErrors : 0,
  bookmarkWarnings : 0,
  bookmarksResult : [],
  additionalData : [],
  debug : [],

  showOmniboxSuggestions (input, suggest) {
    suggest([
      {
        content : 'check-all',
        description : browser.i18n.getMessage('omnibox_command_check_all')
      },
      {
        content : 'check-errors',
        description : browser.i18n.getMessage('omnibox_command_check_errors')
      },
      {
        content : 'check-warnings',
        description : browser.i18n.getMessage('omnibox_command_check_warnings')
      },
      {
        content : 'duplicates',
        description : browser.i18n.getMessage('omnibox_command_check_duplicates')
      },
      {
        content : 'empty-titles',
        description : browser.i18n.getMessage('omnibox_command_empty_titles')
      }
    ]);
  },

  callOmniboxAction (input) {
    bookmarkchecker.openUserInterfaceInCurrentTab();
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
      case 'duplicates':
        bookmarkchecker.execute('duplicates', 'all');
        break;
      case 'empty-titles':
        bookmarkchecker.execute('empty-titles', 'all');
        break;
      default:
        // do nothing
    }
  },

  openUserInterface () {
    const url = browser.extension.getURL(UI_PAGE);

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

  openUserInterfaceInCurrentTab () {
    browser.tabs.update(null, { url : browser.extension.getURL(UI_PAGE) });
  },

  async handleResponse (response) {
    if (response.message === 'count') {
      bookmarkchecker.initBookmarkCount();
    }
    else if (response.message === 'execute') {
      if (!bookmarkchecker.inProgress) {
        bookmarkchecker.execute(response.mode, 'all');
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
          path : bookmarkchecker.additionalData[response.bookmarkId].path,
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
  },

  async initBookmarkCount () {
    bookmarkchecker.totalBookmarks = 0;

    const bookmarks = await browser.bookmarks.getTree();
    bookmarkchecker.countBookmarks(bookmarks[0]);

    browser.runtime.sendMessage({
      message : 'total-bookmarks',
      total_bookmarks : bookmarkchecker.totalBookmarks
    });
  },

  countBookmarks (bookmark) {
    if (bookmark.url) {
      if (bookmarkchecker.LIMIT > 0 && bookmarkchecker.totalBookmarks === bookmarkchecker.LIMIT) {
        return;
      }

      bookmarkchecker.totalBookmarks++;
    }

    if (bookmark.children) {
      for (const child of bookmark.children) {
        bookmarkchecker.countBookmarks(child);
      }
    }
  },

  async execute (mode, type) {
    bookmarkchecker.inProgress = true;
    bookmarkchecker.internalCounter = 0;
    bookmarkchecker.checkedBookmarks = 0;
    bookmarkchecker.bookmarkErrors = 0;
    bookmarkchecker.bookmarkWarnings = 0;
    bookmarkchecker.bookmarksResult = [];
    bookmarkchecker.additionalData = [];
    bookmarkchecker.debug = [];

    browser.runtime.sendMessage({ message : 'started' });

    browser.storage.local.get('debug_enabled', (options) => {
      bookmarkchecker.debug_enabled = options.debug_enabled;
    });

    const bookmarks = await browser.bookmarks.getTree();
    bookmarkchecker.getBookmarkPath(bookmarks[0], [], bookmarkchecker.additionalData);
    bookmarkchecker.checkAllBookmarks(bookmarks[0], mode, type);

    if (mode === 'duplicates') {
      bookmarkchecker.checkForDuplicates();
    }
  },

  getBookmarkPath (bookmark, path, map) {
    if (bookmark.title) {
      path.push(bookmark.title);
    }

    if (bookmark.children) {
      for (const childNode of bookmark.children) {
        bookmarkchecker.getBookmarkPath(childNode, path, map);
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

  checkAllBookmarks (bookmark, mode, type) {
    switch (mode) {
      case 'broken-bookmarks':
        bookmarkchecker.checkForBrokenBookmark(bookmark, type);
        break;
      case 'duplicates':
        bookmarkchecker.checkBookmarkAndAssignPath(bookmark);
        break;
      case 'empty-titles':
        bookmarkchecker.checkForEmptyTitle(bookmark);
        break;
      default:
        // do nothing
    }

    if (bookmark.children) {
      for (const child of bookmark.children) {
        bookmarkchecker.checkAllBookmarks(child, mode, type);
      }
    }
  },

  async checkForBrokenBookmark (bookmark, type) {
    if (bookmark.url) {
      if (bookmarkchecker.LIMIT > 0 && bookmarkchecker.internalCounter === bookmarkchecker.LIMIT) {
        return;
      }

      bookmarkchecker.internalCounter++;

      if (bookmark.url.match(/^https?:\/\//)) {
        bookmark.attempts = 0;

        const checkedBookmark = await bookmarkchecker.checkHttpResponse(bookmark);
        bookmarkchecker.checkedBookmarks++;

        switch (checkedBookmark.status) {
          case STATUS.REDIRECT:
            if (type === 'all' || type === 'warnings') {
              bookmarkchecker.bookmarkWarnings++;
              bookmarkchecker.bookmarksResult.push(checkedBookmark);
            }
            break;
          case STATUS.NOT_FOUND:
          case STATUS.FETCH_ERROR:
            if (type === 'all' || type === 'errors') {
              bookmarkchecker.bookmarkErrors++;
              bookmarkchecker.bookmarksResult.push(checkedBookmark);
            }
            break;
          default:
            // do nothing
        }

        bookmarkchecker.updateProgressUi(true);
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

  async checkHttpResponse (bookmark) {
    bookmark.attempts++;

    try {
      const response = await fetch(bookmark.url, {
        credentials : 'include',
        cache : 'no-store'
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
    }
    catch (error) {
      bookmark.status = STATUS.FETCH_ERROR;

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
        await bookmarkchecker.checkHttpResponse(bookmark);
      }
    }

    return bookmark;
  },

  checkBookmarkAndAssignPath (bookmark) {
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

  checkForEmptyTitle (bookmark) {
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

  checkForDuplicates () {
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

    Object.keys(duplicates).forEach((key) => {
      if (duplicates[key].length < 2) {
        delete duplicates[key];
      }
      else {
        bookmarkchecker.bookmarkWarnings++;
      }
    });

    browser.runtime.sendMessage({
      message : 'show-duplicates-ui',
      bookmarks : duplicates,
      warnings : bookmarkchecker.bookmarkWarnings
    });

    bookmarkchecker.inProgress = false;
  },

  updateProgressUi (checkForFinish) {
    let progress = bookmarkchecker.checkedBookmarks / bookmarkchecker.totalBookmarks;
    if (progress < MIN_PROGRESS) {
      progress = MIN_PROGRESS;
    }

    browser.runtime.sendMessage({
      message : 'update-counters',
      total_bookmarks : bookmarkchecker.totalBookmarks,
      checked_bookmarks : bookmarkchecker.checkedBookmarks,
      bookmarks_errors : bookmarkchecker.bookmarkErrors,
      bookmarks_warnings : bookmarkchecker.bookmarkWarnings,
      progress : progress
    });

    if (checkForFinish && bookmarkchecker.checkedBookmarks === bookmarkchecker.totalBookmarks) {
      const bookmarks = bookmarkchecker.buildResultArray(bookmarkchecker.bookmarksResult)[0].children;

      browser.runtime.sendMessage({
        message : 'finished',
        bookmarks : bookmarks,
        debug : bookmarkchecker.debug
      });

      bookmarkchecker.inProgress = false;
    }
  },

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
  }
};

browser.browserAction.onClicked.addListener(bookmarkchecker.openUserInterface);
browser.omnibox.onInputChanged.addListener(bookmarkchecker.showOmniboxSuggestions);
browser.omnibox.onInputEntered.addListener(bookmarkchecker.callOmniboxAction);
browser.runtime.onMessage.addListener(bookmarkchecker.handleResponse);

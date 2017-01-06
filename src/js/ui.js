'use strict';

const elBody = document.querySelector('body');
const elButton = document.querySelector('button');
const elMessage = document.getElementById('message');
const elResults = document.getElementById('results');
const elTotalBookmarks = document.getElementById('totalBookmarks');
const elCheckedBookmarks = document.getElementById('checkedBookmarks');
const elBookmarksErrors = document.getElementById('bookmarksErrors');
const elBookmarksWarnings = document.getElementById('bookmarksWarnings');
const elUnknownBookmarks = document.getElementById('unknownBookmarks');
const elProgress = document.getElementById('progress');

const ui = {
  markedBookmarks : 0,
  
  execute : function () {
    browser.runtime.sendMessage({ 'message' : 'execute' });
  },

  handleResponse : function (response) {
    if (response.message === 'total-bookmarks') {
      elProgress.setAttribute('value', 0.01);
      elTotalBookmarks.innerText = response.total_bookmarks;
      elButton.disabled = true;
    }
    else if (response.message === 'update-counters') {
      elTotalBookmarks.innerText = response.total_bookmarks;
      elCheckedBookmarks.innerText = response.checked_bookmarks;
      elBookmarksErrors.innerText = response.bookmarks_errors;
      elBookmarksWarnings.innerText = response.bookmarks_warnings;
      elUnknownBookmarks.innerText = response.unknown_bookmarks;
      elProgress.setAttribute('value', response.progress);
      ui.markedBookmarks = response.bookmarks_errors + response.bookmarks_warnings + response.unknown_bookmarks;
    }
    else if (response.message === 'finished') {
      ui.buildBookmarksTree(response.bookmarks);
      ui.hideEmptyRows();
      elButton.disabled = false;
      
      if (ui.markedBookmarks === 0) {
        elMessage.innerText = browser.i18n.getMessage('no_marked_bookmarks');
      }
    }
  },

  buildBookmarksTree : function (bookmarks) {
    elResults.appendChild(ui.getNodes(bookmarks));
  },

  getNodes : function (bookmarks) {
    const list = document.createElement('ul');

    for (let bookmark of bookmarks) {
      if (bookmark.url || (!bookmark.url && bookmark.children.length > 0)) {
        list.appendChild(ui.getSingleNode(bookmark));
      }
    }

    return list;
  },

  getSingleNode : function (bookmark) {
    let template;
    const li = document.createElement('li');
    li.id = bookmark.id;

    if (bookmark.url) {
      template = document.getElementById('result-template-url').content.cloneNode(true);

      const title = bookmark.title ? bookmark.title : browser.i18n.getMessage('bookmark_no_title');
      const elNameText = document.createTextNode(title);
      const elName = template.querySelector('.name');
      elName.appendChild(elNameText);

      const elUrlText = document.createTextNode(bookmark.url);
      const elUrl = template.querySelector('.url');
      elUrl.appendChild(elUrlText);
      elUrl.setAttribute('href', bookmark.url);
      elUrl.setAttribute('target', '_blank');
      elUrl.setAttribute('rel', 'noopener');

      const elLocationText = document.createTextNode(browser.i18n.getMessage('bookmark_location') + ': ' + bookmark.parentTitle);
      const elLocation = template.querySelector('.location');
      elLocation.appendChild(elLocationText);

      const elStatus = template.querySelector('.status');
      let elStatusText;

      switch (bookmark.status) {
        case STATUS.REDIRECT:
          elStatusText = document.createTextNode(browser.i18n.getMessage('bookmark_state_label') + ': ' + browser.i18n.getMessage('bookmark_state_redirect'));
          elStatus.appendChild(elStatusText);
          li.className = 'warning';
        case STATUS.NOT_FOUND:
          elStatusText = document.createTextNode(browser.i18n.getMessage('bookmark_state_label') + ': ' + bookmark.status);
          elStatus.appendChild(elStatusText);
          li.className = 'error';
        case STATUS.UNKNOWN_ERROR:
          elStatusText = document.createTextNode(browser.i18n.getMessage('bookmark_state_label') + ': ' + browser.i18n.getMessage('bookmark_state_unknown'));
          elStatus.appendChild(elStatusText);
          li.className = 'unknown';
      }

      const elActionButtons = template.querySelector('.action-buttons');

      const elRemoveButtonText = document.createTextNode(browser.i18n.getMessage('bookmark_action_remove'));
      const elRemoveButton = document.createElement('a');
      elRemoveButton.appendChild(elRemoveButtonText);
      elRemoveButton.setAttribute('data-id', bookmark.id);
      elRemoveButton.setAttribute('data-action', 'remove');
      elRemoveButton.setAttribute('data-confirmation-msg', browser.i18n.getMessage('bookmark_confirmation_remove'));
      elRemoveButton.setAttribute('href', '#');
      elActionButtons.appendChild(elRemoveButton);

      if (bookmark.status === STATUS.REDIRECT) {
        const elNewUrlText = document.createTextNode(browser.i18n.getMessage('bookmark_new_url') + ': ' + bookmark.newUrl);
        const elNewUrl = template.querySelector('.newUrl');
        elNewUrl.appendChild(elNewUrlText);
        elNewUrl.setAttribute('href', bookmark.newUrl);
        elNewUrl.setAttribute('target', '_blank');
        elNewUrl.setAttribute('rel', 'noopener');

        const elRepairRedirectButtonText = document.createTextNode(browser.i18n.getMessage('bookmark_action_repair_redirect'));
        const elRepairRedirectButton = document.createElement('a');
        elRepairRedirectButton.appendChild(elRepairRedirectButtonText);
        elRepairRedirectButton.setAttribute('data-id', bookmark.id);
        elRepairRedirectButton.setAttribute('data-action', 'repair-redirect');
        elRepairRedirectButton.setAttribute('data-confirmation-msg', browser.i18n.getMessage('bookmark_confirmation_repair_redirect'));
        elRepairRedirectButton.setAttribute('data-new-url', bookmark.newUrl);
        elRepairRedirectButton.setAttribute('href', '#');
        elActionButtons.appendChild(elRepairRedirectButton);
      }
    }
    else {
      template = document.getElementById('result-template-title').content.cloneNode(true);

      const title = bookmark.title ? bookmark.title : browser.i18n.getMessage('bookmark_no_title');
      const elNameText = document.createTextNode(title);
      const elName = template.querySelector('.name');
      elName.appendChild(elNameText);
    }

    li.appendChild(template);

    if (bookmark.children && bookmark.children.length > 0) {
      li.appendChild(ui.getNodes(bookmark.children));
    }

    return li;
  },

  handleActionButtonClicks : function (e) {
    if (e.target.tagName === 'A' && e.target.getAttribute('data-action')) {
      e.preventDefault();

      if (!confirm(e.target.getAttribute('data-confirmation-msg'))) {
        return false;
      }

      const bookmarkId = e.target.getAttribute('data-id');
      const elBookmark = document.getElementById(bookmarkId);

      elBookmark.remove();

      elTotalBookmarks.innerText = parseInt(elTotalBookmarks.innerText) - 1;
      elCheckedBookmarks.innerText = parseInt(elCheckedBookmarks.innerText) - 1;

      switch (elBookmark.className) {
        case 'warning':
          elBookmarksWarnings.innerText = parseInt(elBookmarksWarnings.innerText) - 1;
        case 'error':
          elBookmarksErrors.innerText = parseInt(elBookmarksErrors.innerText) - 1;
        case 'unknown':
          elUnknownBookmarks.innerText = parseInt(elUnknownBookmarks.innerText) - 1;
      }

      ui.hideEmptyRows();

      switch (e.target.getAttribute('data-action')) {
        case 'remove':
          browser.runtime.sendMessage({ 'message' : 'remove', 'bookmarkId' : bookmarkId });
        case 'repair-redirect':
          browser.runtime.sendMessage({
            'message' : 'repair-redirect',
            'bookmarkId' : bookmarkId,
            'newUrl' : e.target.getAttribute('data-new-url')
          });
      }
    }
  },

  hideEmptyRows : function () {
    const rows = document.getElementsByTagName('ul');

    for (let row of rows) {
      if (row.getElementsByClassName('url').length == 0) {
        row.parentNode.style.display = 'none';
      }
    }
  }
};

elButton.addEventListener('click', ui.execute);
elBody.addEventListener('click', ui.handleActionButtonClicks);

browser.runtime.onMessage.addListener(ui.handleResponse);

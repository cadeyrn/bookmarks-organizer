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
      
      if (ui.markedBookmarks === 0) {
        elMessage.innerText = 'Glückwunsch, alle Lesezeichen sind in Ordnung!';
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

      const title = bookmark.title ? bookmark.title : '<kein Name>'
      const elNameText = document.createTextNode(title);
      const elName = template.querySelector('.name');
      elName.appendChild(elNameText);

      const elUrlText = document.createTextNode(bookmark.url);
      const elUrl = template.querySelector('.url');
      elUrl.appendChild(elUrlText);
      elUrl.setAttribute('href', bookmark.url);
      elUrl.setAttribute('target', '_blank');
      elUrl.setAttribute('rel', 'noopener');

      const elLocationText = document.createTextNode('Lesezeichen-Ort: ' + bookmark.parentTitle);
      const elLocation = template.querySelector('.location');
      elLocation.appendChild(elLocationText);

      const elStatus = template.querySelector('.status');

      if (bookmark.status == STATUS.REDIRECT) {
        const elStatusText = document.createTextNode('Status: Weiterleitung');
        elStatus.appendChild(elStatusText);
        li.className += 'warning';
      }
      else if (bookmark.status === STATUS.UNKNOWN_ERROR) {
        const elStatusText = document.createTextNode('Status: unbekannt');
        elStatus.appendChild(elStatusText);
      }
      else {
        const elStatusText = document.createTextNode('Status: ' + bookmark.status);
        elStatus.appendChild(elStatusText);
        li.className += 'error';
      }

      if (bookmark.newUrl) {
        const elNewUrlText = document.createTextNode('Neue URL: ' + bookmark.newUrl);
        const elNewUrl = template.querySelector('.newUrl');
        elNewUrl.appendChild(elNewUrlText);
        elNewUrl.setAttribute('href', bookmark.newUrl);
        elNewUrl.setAttribute('target', '_blank');
        elNewUrl.setAttribute('rel', 'noopener');
      }

      const elActionButtons = template.querySelector('.action-buttons');
      const elRemoveButtonText = document.createTextNode('[entfernen]');
      const elRemoveButton = document.createElement('a');
      elRemoveButton.appendChild(elRemoveButtonText);
      elRemoveButton.setAttribute('data-id', bookmark.id);
      elRemoveButton.setAttribute('href', '#');
      elRemoveButton.setAttribute('class', 'remove');
      elActionButtons.appendChild(elRemoveButton);
    }
    else {
      template = document.getElementById('result-template-title').content.cloneNode(true);

      const title = bookmark.title ? bookmark.title : '<kein Name>'
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

  removeBookmark : function (e) {
    if (e.target.tagName.toLowerCase() === 'a' && e.target.className === 'remove') {
      e.preventDefault();

      const bookmarkId = e.target.getAttribute('data-id');
      const elBookmark = document.getElementById(bookmarkId);

      elBookmark.remove();

      elTotalBookmarks.innerText = parseInt(elTotalBookmarks.innerText) - 1;
      elCheckedBookmarks.innerText = parseInt(elCheckedBookmarks.innerText) - 1;

      if (elBookmark.className === 'error') {
        elBookmarksErrors.innerText = parseInt(elBookmarksErrors.innerText) - 1;
      }
      else if (elBookmark.className === 'warning') {
        elBookmarksWarnings.innerText = parseInt(elBookmarksWarnings.innerText) - 1;
      }
      else {
        elUnknownBookmarks.innerText = parseInt(elUnknownBookmarks.innerText) - 1;
      }

      ui.hideEmptyRows();

      browser.runtime.sendMessage({ 'message' : 'remove', 'bookmarkId' : bookmarkId });
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
elBody.addEventListener('click', ui.removeBookmark);

browser.runtime.onMessage.addListener(ui.handleResponse);

'use strict';

const elBody = document.querySelector('body');
const elButton = document.querySelector('button');
const elResults = document.getElementById('results');
const elTotalBookmarks = document.getElementById('totalBookmarks');
const elCheckedBookmarks = document.getElementById('checkedBookmarks');
const elBookmarksErrors = document.getElementById('bookmarksErrors');
const elBookmarksWarnings = document.getElementById('bookmarksWarnings');
const elUnknownBookmarks = document.getElementById('unknownBookmarks');
const elProgress = document.getElementById('progress');

const ui = {
  execute : function () {
    browser.runtime.sendMessage({ 'message' : 'execute' });
  },

  handleResponse : function (response) {
    if (response.message === 'total-bookmarks') {
      elTotalBookmarks.innerText = response.total_bookmarks;
    }
    else if (response.message === 'update-counters') {
      elCheckedBookmarks.innerText = response.checked_bookmarks;
      elBookmarksErrors.innerText = response.bookmarks_errors;
      elBookmarksWarnings.innerText = response.bookmarks_warnings;
      elUnknownBookmarks.innerText = response.unknown_bookmarks;
      elProgress.setAttribute('value', response.progress);
    }
    else if (response.message === 'finished') {
      ui.buildBookmarksTree(response.bookmarks);
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
    const template = document.getElementById('result-template').content.cloneNode(true);

    const li = document.createElement('li');
    li.id = bookmark.id;

    const title = bookmark.title ? bookmark.title : '<kein Name>'
    const elNameText = document.createTextNode(title);
    const elName = template.querySelector('.name');
    elName.appendChild(elNameText);

    if (bookmark.url) {
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

      if (bookmark.status == 901) {
        const elStatusText = document.createTextNode('Status: Weiterleitung');
        elStatus.appendChild(elStatusText);
        li.className += 'warning';
      }
      else if (bookmark.status === 999) {
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

    li.appendChild(template);

    if (bookmark.children && bookmark.children.length > 0) {
      li.appendChild(ui.getNodes(bookmark.children));
    }

    return li;
  },

  removeBookmark : function (e) {
    if (e.target.tagName.toLowerCase() === 'a' && e.target.className === 'remove') {
      e.preventDefault();

      let bookmarkId = e.target.getAttribute('data-id');
      document.getElementById(bookmarkId).style.display = 'none';
      browser.runtime.sendMessage({ 'message' : 'remove', 'bookmarkId' : bookmarkId });
    }
  }
};

elButton.addEventListener('click', ui.execute);
elBody.addEventListener('click', ui.removeBookmark);

browser.runtime.onMessage.addListener(ui.handleResponse);

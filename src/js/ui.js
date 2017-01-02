'use strict';

const elResults = document.getElementById('results');

const ui = {
  bookmarks : [],

  execute : function () {
    browser.runtime.sendMessage({ 'message' : 'execute' });
  },

  handleResponse : function (response) {
    if (response.message === 'add-result') {
      let bookmark = response.bookmark;

      browser.bookmarks.get(bookmark.parentId).then((parentBookmark) => {
        bookmark.parentTitle = parentBookmark[0].title;
        ui.bookmarks.push(bookmark);
      });
    } else if (response.message === 'total-bookmarks') {
      document.getElementById('totalBookmarks').innerText = response.total_bookmarks;
    } else if (response.message === 'update-counters') {
      document.getElementById('checkedBookmarks').innerText = response.checked_bookmarks;
      document.getElementById('bookmarksErrors').innerText = response.bookmarks_errors;
      document.getElementById('bookmarksWarnings').innerText = response.bookmarks_warnings;
      document.getElementById('unknownBookmarks').innerText = response.unknown_bookmarks;
      document.getElementById('progress').setAttribute('value', response.progress);
    } else if (response.message === 'finished') {
      ui.bookmarks.sort(ui.sort(['status', 'parentTitle', 'title']));
      ui.showBookmarks();
    }
  },

  sort : function (fields) {
    return (a, b) => fields.map(obj => {
        let returnValue = 1;

        if (obj[0] === '-') {
          returnValue = -1;
          obj = obj.substring(1);
        }

        return a[obj] > b[obj] ? returnValue : a[obj] < b[obj] ? -(returnValue) : 0;
    }).reduce((a, b) => a ? a : b, 0);
  },

  showBookmarks : function () {
    for (let bookmark of ui.bookmarks) {
      let template = document.getElementById('result-template').content.cloneNode(true);

      template.querySelector('.wrapper').parentNode.id = bookmark.id;
      template.querySelector('.name').innerText = bookmark.title;

      let elUrl = template.querySelector('.url');
      elUrl.innerText = bookmark.url;
      elUrl.setAttribute('href', bookmark.url);
      elUrl.setAttribute('target', '_blank');
      elUrl.setAttribute('rel', 'noopener');

      template.querySelector('.parent').innerText = 'Parent: ' + bookmark.parentTitle;

      if (bookmark.status == 901) {
        template.querySelector('.status').innerText = 'Status: Weiterleitung';
        template.querySelector('.wrapper').className += ' warning';
      } else if (bookmark.status === 999) {
        template.querySelector('.status').innerText = 'Status: unbekannt';
      } else {
        template.querySelector('.status').innerText = 'Status: ' + bookmark.status;
        template.querySelector('.wrapper').className += ' error';
      }

      template.querySelector('.remove').setAttribute('data-id', bookmark.id);

      elResults.appendChild(template);
    }
  },

  removeBookmark : function (e) {
    if (e.target.tagName.toLowerCase() === 'a' && e.target.className === 'remove') {
      e.preventDefault();

      let bookmarkId = e.target.getAttribute('data-id');
      document.getElementById(bookmarkId).style.display = 'none';
      browser.bookmarks.remove(bookmarkId);
    }
  }
};

document.querySelector('button').addEventListener('click', ui.execute);
document.querySelector('body').addEventListener('click', ui.removeBookmark);

browser.runtime.onMessage.addListener(ui.handleResponse);

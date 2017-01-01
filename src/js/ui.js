'use strict';

const elResults = document.getElementById('results');

const ui = {
  execute : function () {
    browser.runtime.sendMessage({ 'message' : 'execute' });
  },

  handleResponse : function (response) {
    if (response.message === 'add-result') {
      let bookmark = response.bookmark;
      let template = document.getElementById('result-template').content.cloneNode(true);

      template.querySelector('.wrapper').parentNode.id = bookmark.id;
      template.querySelector('.name').innerText = bookmark.title;
      template.querySelector('.url').innerText = bookmark.url;
      template.querySelector('.parentId').innerText = 'Parent-ID: ' + bookmark.parentId;

      if (bookmark.status !== 0) {
        template.querySelector('.status').innerText = 'Status: ' + bookmark.status;
      }

      template.querySelector('.remove').setAttribute('data-id', bookmark.id);

      elResults.appendChild(template);
    }
  },

  removeBookmark : function (e) {
    e.preventDefault();

    if (e.target.tagName.toLowerCase() === 'a') {
      let bookmarkId = e.target.getAttribute('data-id');
      document.getElementById(bookmarkId).style.display = 'none';
      browser.bookmarks.remove(bookmarkId);
    }
  }
};

document.querySelector('button').addEventListener('click', ui.execute);
document.querySelector('body').addEventListener('click', ui.removeBookmark);

browser.runtime.onMessage.addListener(ui.handleResponse);

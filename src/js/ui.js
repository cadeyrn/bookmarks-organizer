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

      let elUrl = template.querySelector('.url');
      elUrl.innerText = bookmark.url;
      elUrl.setAttribute('href', bookmark.url);
      elUrl.setAttribute('target', '_blank');
      elUrl.setAttribute('rel', 'noopener');

      template.querySelector('.parentId').innerText = 'Parent-ID: ' + bookmark.parentId;

      if (bookmark.status !== 0) {
        template.querySelector('.status').innerText = 'Status: ' + bookmark.status;
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

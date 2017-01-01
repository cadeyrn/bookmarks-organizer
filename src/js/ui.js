'use strict';

const elResults = document.getElementById('results');

const ui = {
  execute : function () {
    browser.runtime.sendMessage({ 'message' : 'execute' });
  },

  handleResponse : function (response) {
    if (response.message === 'add-result') {
      let bookmark = response.bookmark;
      
      browser.bookmarks.get(bookmark.parentId).then((parentBookmark) => {
        let template = document.getElementById('result-template').content.cloneNode(true);

        template.querySelector('.wrapper').parentNode.id = bookmark.id;
        template.querySelector('.name').innerText = bookmark.title;

        let elUrl = template.querySelector('.url');
        elUrl.innerText = bookmark.url;
        elUrl.setAttribute('href', bookmark.url);
        elUrl.setAttribute('target', '_blank');
        elUrl.setAttribute('rel', 'noopener');


          console.error(parentBookmark.title);
          template.querySelector('.parent').innerText = 'Parent: ' + parentBookmark[0].title;


        if (bookmark.status !== 0) {
          template.querySelector('.status').innerText = 'Status: ' + bookmark.status;
        }

        template.querySelector('.remove').setAttribute('data-id', bookmark.id);

        elResults.appendChild(template);
      });
    } else if (response.message === 'update-counters') {
      document.getElementById('brokenBookmarks').innerText = response.broken_bookmarks;
      document.getElementById('totalBookmarks').innerText = response.total_bookmarks;
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

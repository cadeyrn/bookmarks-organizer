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

      template.querySelector('.name').innerText = bookmark.title;
      template.querySelector('.url').innerText = bookmark.url;

      if (bookmark.status !== 0) {
        template.querySelector('.status').innerText = bookmark.status;
      }

      elResults.appendChild(template);
    }
  }
};

document.querySelector('button').addEventListener('click', ui.execute);

browser.runtime.onMessage.addListener(ui.handleResponse);

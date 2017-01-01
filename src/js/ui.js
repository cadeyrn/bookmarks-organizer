'use strict';

const elResult = document.querySelector('#result');

const ui = {
  execute : function () {
    browser.runtime.sendMessage({ 'message' : 'execute' });
  },

  handleResponse : function (response) {
    if (response.message === 'add-result') {
      let bookmark = response.bookmark;
      let docFragment = document.createDocumentFragment();

      let div = document.createElement('div');
      let text = document.createTextNode(bookmark.title + ', ' + bookmark.url + ', status: ' + bookmark.status);
      div.appendChild(text);
      docFragment.appendChild(div);

      elResult.appendChild(docFragment);
    }
  }
};

document.querySelector('button').addEventListener('click', ui.execute);

browser.runtime.onMessage.addListener(ui.handleResponse);

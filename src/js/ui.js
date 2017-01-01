'use strict';

const ui = {
  execute : function () {
    browser.runtime.sendMessage({ 'message' : 'execute' });
  },

  showResult : function (result) {
    let bookmark = result.bookmark;
    alert('bookmark error: ' + bookmark.url + ', bookmark status: ' + bookmark.status);
  }
};

document.querySelector('button').addEventListener('click', ui.execute);

browser.runtime.onMessage.addListener(ui.showResult);

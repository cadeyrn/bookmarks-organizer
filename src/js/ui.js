'use strict';

const ui = {
  execute : function () {
    browser.runtime.sendMessage({ 'message' : 'execute' });
  }
};

document.querySelector('button').addEventListener('click', ui.execute);

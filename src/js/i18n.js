'use strict';

const i18n = {
  init () {
    i18n.translate();
    i18n.setLangAttribute();
  },

  setLangAttribute () {
    document.querySelector('html').setAttribute('lang', browser.i18n.getUILanguage().substring(0, 2));
  },

  findWithXPath (path) {
    return document.evaluate(path, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
  },

  getMessage (string, key) {
    return browser.i18n.getMessage(key);
  },

  replace (string) {
    return string.replace(/__MSG_([a-z_.]+)__/gi, i18n.getMessage);
  },

  translate () {
    document.removeEventListener('DOMContentLoaded', i18n.translate);

    const textNodes = i18n.findWithXPath('//text()[contains(self::text(), "__MSG_")]');
    const textSnapshotLength = textNodes.snapshotLength;

    for (let i = 0; i < textSnapshotLength; i++) {
      const text = textNodes.snapshotItem(i);
      text.nodeValue = i18n.replace(text.nodeValue);
    }

    const attributes = ['title', 'placeholder'];
    for (const attribute of attributes) {
      const nodes = i18n.findWithXPath('//*/attribute::' + attribute + '[contains(., "__MSG_")]');
      const AttributesSnapshotLength = nodes.snapshotLength;

      for (let i = 0; i < AttributesSnapshotLength; i++) {
        const node = nodes.snapshotItem(i);
        node.value = i18n.replace(node.value);
      }
    }
  }
};

window.addEventListener('DOMContentLoaded', i18n.init);

'use strict';

/* global STATUS */

const ESC_KEY = 27;
const HEADER_SWITCH_POSITION = 100;
const HEADER_TIMEOUT_IN_MS = 250;
const MIN_PROGRESS = 0.01;

const elBody = document.querySelector('body');
const elButton = document.getElementById('submit-button');
const elFox = document.getElementById('fox');
const elHeaderWrapper = document.getElementById('header-wrapper');
const elHint = document.getElementById('hint');
const elMode = document.getElementById('mode');
const elResultWrapper = document.getElementById('result-wrapper');
const elResults = document.getElementById('results');
const elTotalBookmarks = document.getElementById('total-bookmarks');
const elCheckedBookmarks = document.getElementById('checked-bookmarks');
const elBookmarksErrors = document.getElementById('bookmarks-errors');
const elBookmarksWarnings = document.getElementById('bookmarks-warnings');
const elProgress = document.getElementById('progress');
const elMassActions = document.getElementById('mass-actions');
const elRepairAllRedirects = document.getElementById('repair-all-redirects');
const elRemoveAllBookmarksWithErrors = document.getElementById('remove-all-bookmarks-with-errors');
const elFilterBar = document.getElementById('filterbar');
const elSearch = document.getElementById('search');
const elStart = document.getElementById('start');
const elDebugOutput = document.getElementById('debug-output');
const elMask = document.getElementById('mask');
const elSpinner = document.getElementById('spinner');

const ui = {
  markedBookmarks : 0,
  warnings : 0,
  showNoResultsMessage : false,
  showSearchField : false,
  showFilterCheckboxes : false,
  showMassActionButtons : false,
  showDebugOutput : false,

  init () {
    browser.runtime.sendMessage({ message : 'count' });
    ui.uiscript();
  },

  uiscript () {
    const delta = 5;
    let didScroll = false;
    let lastScrollTop = 0;

    const hasScrolled = function () {
      const { scrollTop } = document.documentElement;

      if (Math.abs(lastScrollTop - scrollTop) <= delta) {
        return;
      }

      if (scrollTop > HEADER_SWITCH_POSITION) {
        elHeaderWrapper.classList.remove('default');
        elHeaderWrapper.classList.add('compact');
      }
      else {
        elHeaderWrapper.classList.remove('compact');
        elHeaderWrapper.classList.add('default');
      }

      lastScrollTop = scrollTop;
    };

    window.addEventListener('scroll', () => {
      didScroll = true;
    });

    setInterval(() => {
      if (didScroll) {
        hasScrolled();
        didScroll = false;
      }
    }, HEADER_TIMEOUT_IN_MS);

    const closeButton = document.getElementById('hint-close-button');
    closeButton.onclick = function () {
      elHint.classList.add('hidden');
    };

    window.onkeydown = function (e) {
      if (e.keyCode === ESC_KEY) {
        elHint.classList.add('hidden');
      }
    };
  },

  handleFoxMessageClick (e) {
    e.preventDefault();
    elHint.classList.toggle('hidden');
  },

  execute (e) {
    e.preventDefault();
    browser.runtime.sendMessage({
      message : 'execute',
      mode : elMode.value
    });
  },

  handleResponse (response) {
    if (response.message === 'started') {
      elResultWrapper.classList.add('hidden');
      elStart.classList.add('hidden');
      elHint.getElementsByClassName('notice')[0].textContent = browser.i18n.getMessage('greeting');
      elHint.getElementsByClassName('content')[0].textContent = browser.i18n.getMessage('intro_check');
      elHint.classList.add('hidden');
      elHint.classList.remove('success');
      elResults.textContent = '';
      elDebugOutput.textContent = '';
      elProgress.setAttribute('value', MIN_PROGRESS);
      elCheckedBookmarks.textContent = 0;
      elBookmarksErrors.textContent = 0;
      elBookmarksWarnings.textContent = 0;
      elButton.disabled = true;
    }
    else if (response.message === 'total-bookmarks') {
      elTotalBookmarks.textContent = response.total_bookmarks;
      elButton.disabled = false;
      elMask.classList.add('is-hidden');
      elSpinner.classList.add('is-hidden');
    }
    else if (response.message === 'update-counters') {
      elTotalBookmarks.textContent = response.total_bookmarks;
      elCheckedBookmarks.textContent = response.checked_bookmarks;
      elBookmarksErrors.textContent = response.bookmarks_errors;
      elBookmarksWarnings.textContent = response.bookmarks_warnings;
      elProgress.setAttribute('value', response.progress);
      ui.markedBookmarks = response.bookmarks_errors + response.bookmarks_warnings;
      ui.warnings = response.bookmarks_warnings;
    }
    else if (response.message === 'finished') {
      ui.buildBookmarksTree(response.bookmarks);
      ui.hideEmptyCategories();

      if (ui.markedBookmarks === 0) {
        ui.showNoResultsMessage = true;
        ui.showSearchField = false;
        ui.showFilterCheckboxes = false;
      }
      else {
        ui.showNoResultsMessage = false;
        ui.showSearchField = true;
        ui.showFilterCheckboxes = true;
      }

      if (ui.warnings === 0) {
        ui.showMassActionButtons = false;
      }
      else {
        ui.showMassActionButtons = true;
      }

      if (response.debug.length === 0) {
        ui.showDebugOutput = false;
      }
      else {
        elDebugOutput.textContent = JSON.stringify(response.debug);
        ui.showDebugOutput = true;
      }

      ui.doUiCleanup();
    }
    else if (response.message === 'show-duplicates-ui') {
      elBookmarksWarnings.textContent = response.warnings;

      if (response.warnings === 0) {
        ui.showNoResultsMessage = true;
      }
      else {
        ui.showNoResultsMessage = false;
      }

      ui.showSearchField = false;
      ui.showFilterCheckboxes = false;
      ui.showMassActionButtons = false;
      ui.showDebugOutput = false;

      ui.buildDuplicatesUi(response.bookmarks);
      ui.doUiCleanup();
    }
    else if (response.message === 'update-listitem') {
      const listItem = document.getElementById(response.bookmarkId);

      if (response.mode === 'duplicate') {
        const title = browser.i18n.getMessage('bookmark_title') + ': ' + response.title;
        const path = browser.i18n.getMessage('bookmark_path') + ': ' + response.path.join(' / ');

        listItem.getElementsByClassName('title')[0].textContent = title;
        listItem.getElementsByClassName('url')[0].textContent = path;
      }
      else {
        listItem.replaceWith(ui.getSingleNode(response.bookmark));
      }
    }
  },

  doUiCleanup () {
    elButton.disabled = false;
    elResultWrapper.classList.remove('hidden');
    elSearch.focus();

    if (ui.showNoResultsMessage) {
      elHint.getElementsByClassName('notice')[0].textContent = browser.i18n.getMessage('no_marked_bookmarks_title');
      elHint.getElementsByClassName('content')[0].textContent = browser.i18n.getMessage('no_marked_bookmarks');
      elHint.classList.add('success');
      elHint.classList.remove('hidden');
    }
    else {
      elHint.getElementsByClassName('notice')[0].textContent = browser.i18n.getMessage('some_marked_bookmarks_title');
      elHint.getElementsByClassName('content')[0].textContent = browser.i18n.getMessage('some_marked_bookmarks');
      elHint.classList.remove('success');
      elHint.classList.remove('hidden');
    }

    if (ui.showMassActionButtons) {
      elMassActions.classList.remove('hidden');
    }
    else {
      elMassActions.classList.add('hidden');
    }

    if (ui.showSearchField) {
      elSearch.classList.remove('hidden');
    }
    else {
      elSearch.classList.add('hidden');
    }

    if (ui.showFilterCheckboxes) {
      elFilterBar.classList.remove('hidden');
    }
    else {
      elFilterBar.classList.add('hidden');
    }

    if (ui.showDebugOutput) {
      elDebugOutput.classList.remove('hidden');
    }
    else {
      elDebugOutput.classList.add('hidden');
    }
  },

  buildDuplicatesUi (bookmarks) {
    const list = document.createElement('ul');

    for (const url in bookmarks) {
      if (Object.prototype.hasOwnProperty.call(bookmarks, url)) {
        list.appendChild(ui.getSingleDuplicateNode(bookmarks, url));
      }
    }

    elResults.appendChild(list);
  },

  getSingleDuplicateNode (bookmarks, url) {
    const template = document.getElementById('duplicates-template').content.cloneNode(true);
    const elListItem = document.createElement('li');

    const elUrlText = document.createTextNode(url);
    const elUrl = template.querySelector('.url');
    elUrl.appendChild(elUrlText);
    elUrl.setAttribute('href', url);
    elUrl.setAttribute('target', '_blank');
    elUrl.setAttribute('rel', 'noopener');
    elListItem.appendChild(elUrl);

    const elDuplicatesList = document.createElement('ul');
    const duplicates = bookmarks[url];

    for (const duplicate of duplicates) {
      const elDuplicate = document.createElement('li');
      elDuplicate.id = duplicate.id;

      const elDuplicateTitle = document.createElement('div');
      elDuplicateTitle.classList.add('title');
      elDuplicateTitle.textContent = browser.i18n.getMessage('bookmark_title') + ': ' + duplicate.title;
      elDuplicate.appendChild(elDuplicateTitle);

      const elDuplicatePath = document.createElement('div');
      elDuplicatePath.classList.add('url');
      elDuplicatePath.textContent = browser.i18n.getMessage('bookmark_path') + ': ' + duplicate.path.join(' / ');
      elDuplicate.appendChild(elDuplicatePath);

      const elActionButtons = document.createElement('div');

      const elRemoveButtonText = document.createTextNode(browser.i18n.getMessage('bookmark_action_remove'));
      const elRemoveButton = document.createElement('a');
      elRemoveButton.appendChild(elRemoveButtonText);
      elRemoveButton.setAttribute('data-id', duplicate.id);
      elRemoveButton.setAttribute('data-action', 'remove');
      elRemoveButton.setAttribute('data-confirmation', 'true');
      elRemoveButton.setAttribute('data-confirmation-msg', browser.i18n.getMessage('bookmark_confirmation_remove'));
      elRemoveButton.setAttribute('href', '#');
      elActionButtons.appendChild(elRemoveButton);

      const elEditButtonText = document.createTextNode(browser.i18n.getMessage('bookmark_action_edit'));
      const elEditButton = document.createElement('a');
      elEditButton.appendChild(elEditButtonText);
      elEditButton.setAttribute('data-id', duplicate.id);
      elEditButton.setAttribute('data-action', 'edit');
      elEditButton.setAttribute('data-title', duplicate.title);
      elEditButton.setAttribute('data-url', duplicate.url);
      elEditButton.setAttribute('data-mode', 'duplicate');
      elEditButton.setAttribute('href', '#');
      elActionButtons.appendChild(elEditButton);

      elDuplicate.appendChild(elActionButtons);
      elDuplicatesList.appendChild(elDuplicate);
    }

    elListItem.appendChild(elDuplicatesList);

    return elListItem;
  },

  buildBookmarksTree (bookmarks) {
    elResults.appendChild(ui.getNodes(bookmarks));
  },

  getNodes (bookmarks) {
    const list = document.createElement('ul');

    for (const bookmark of bookmarks) {
      if (bookmark.url || (!bookmark.url && bookmark.children.length > 0)) {
        list.appendChild(ui.getSingleNode(bookmark));
      }
    }

    return list;
  },

  getSingleNode (bookmark) {
    let template = null;
    const li = document.createElement('li');
    li.id = bookmark.id;
    li.setAttribute('data-filter-searchfield', 'true');
    li.setAttribute('data-filter-checkbox', 'true');

    if (bookmark.url) {
      li.classList.add('is-bookmark');
      template = document.getElementById('result-template-url').content.cloneNode(true);

      const title = bookmark.title ? bookmark.title : browser.i18n.getMessage('bookmark_no_title');
      const elTitleText = document.createTextNode(title);
      const elTitle = template.querySelector('.title');
      elTitle.appendChild(elTitleText);

      const elUrlText = document.createTextNode(bookmark.url);
      const elUrl = template.querySelector('.url');
      elUrl.appendChild(elUrlText);
      elUrl.setAttribute('href', bookmark.url);
      elUrl.setAttribute('target', '_blank');
      elUrl.setAttribute('rel', 'noopener');

      if (bookmark.status) {
        switch (bookmark.status) {
          case STATUS.REDIRECT:
            li.classList.add('warning', 'redirect');
            break;
          case STATUS.NOT_FOUND:
          case STATUS.FETCH_ERROR:
            li.classList.add('error');
            break;
          default:
            // do nothing
        }
      }

      const elActionButtons = template.querySelector('.action-buttons');

      const elEditButtonText = document.createTextNode(browser.i18n.getMessage('bookmark_action_edit'));
      const elEditButton = document.createElement('a');
      elEditButton.appendChild(elEditButtonText);
      elEditButton.setAttribute('data-id', bookmark.id);
      elEditButton.setAttribute('data-action', 'edit');
      elEditButton.setAttribute('data-title', bookmark.title);
      elEditButton.setAttribute('data-url', bookmark.url);
      elEditButton.setAttribute('data-mode', 'default');
      elEditButton.setAttribute('href', '#');
      elActionButtons.appendChild(elEditButton);

      if (bookmark.status && bookmark.status === STATUS.REDIRECT) {
        const elNewUrlText = document.createTextNode(bookmark.newUrl);
        const elNewUrl = template.querySelector('.new-url');
        elNewUrl.appendChild(elNewUrlText);
        elNewUrl.setAttribute('href', bookmark.newUrl);
        elNewUrl.setAttribute('target', '_blank');
        elNewUrl.setAttribute('rel', 'noopener');

        const elRepairRedirectButtonText = document.createTextNode(
          browser.i18n.getMessage('bookmark_action_repair_redirect')
        );
        const elRepairRedirectButton = document.createElement('a');
        elRepairRedirectButton.appendChild(elRepairRedirectButtonText);
        elRepairRedirectButton.setAttribute('data-id', bookmark.id);
        elRepairRedirectButton.setAttribute('data-action', 'repair-redirect');
        elRepairRedirectButton.setAttribute('data-confirmation', 'true');
        elRepairRedirectButton.setAttribute(
          'data-confirmation-msg', browser.i18n.getMessage('bookmark_confirmation_repair_redirect')
        );
        elRepairRedirectButton.setAttribute('data-new-url', bookmark.newUrl);
        elRepairRedirectButton.setAttribute('href', '#');
        elActionButtons.appendChild(elRepairRedirectButton);
      }

      const elRemoveButtonText = document.createTextNode(browser.i18n.getMessage('bookmark_action_remove'));
      const elRemoveButton = document.createElement('a');
      elRemoveButton.appendChild(elRemoveButtonText);
      elRemoveButton.setAttribute('data-id', bookmark.id);
      elRemoveButton.setAttribute('data-action', 'remove');
      elRemoveButton.setAttribute('data-confirmation', 'true');
      elRemoveButton.setAttribute('data-confirmation-msg', browser.i18n.getMessage('bookmark_confirmation_remove'));
      elRemoveButton.setAttribute('href', '#');
      elActionButtons.appendChild(elRemoveButton);
    }
    else {
      template = document.getElementById('result-template-title').content.cloneNode(true);

      const title = bookmark.title ? bookmark.title : browser.i18n.getMessage('bookmark_no_title');
      const elTitleText = document.createTextNode(title);
      const elTitle = template.querySelector('.title');
      elTitle.appendChild(elTitleText);
    }

    li.appendChild(template);

    if (bookmark.children && bookmark.children.length > 0) {
      li.classList.add('has-children');
      li.appendChild(ui.getNodes(bookmark.children));
    }

    return li;
  },

  showEditBookmarkOverlay (bookmarkId, title, url, mode) {
    const modal = document.getElementById('modal-dialog');
    modal.classList.remove('hidden');

    const closeButton = document.getElementById('close-button');
    closeButton.onclick = function () {
      modal.classList.add('hidden');
    };

    window.onclick = function (e) {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    };

    window.onkeydown = function (e) {
      if (e.keyCode === ESC_KEY) {
        modal.classList.add('hidden');
      }
    };

    const elTitle = document.getElementById('title');
    elTitle.value = title;

    const elUrl = document.getElementById('url');
    elUrl.value = url;

    const submitButton = document.getElementById('submit-changes');
    submitButton.onclick = function (e) {
      e.preventDefault();

      modal.classList.add('hidden');
      ui.editBookmark(bookmarkId, elTitle.value, elUrl.value, mode);
    };
  },

  editBookmark (bookmarkId, title, url, mode) {
    browser.runtime.sendMessage({
      message : 'edit',
      bookmarkId : bookmarkId,
      title : title,
      url : url,
      mode : mode
    });
  },

  removeBookmark (bookmarkId) {
    browser.runtime.sendMessage({
      message : 'remove',
      bookmarkId : bookmarkId
    });
  },

  repairRedirect (bookmarkId, newUrl) {
    browser.runtime.sendMessage({
      message : 'repair-redirect',
      bookmarkId : bookmarkId,
      newUrl : newUrl
    });
  },

  handleActionButtonClicks (e) {
    if (e.target.getAttribute('data-action')) {
      e.preventDefault();

      if (e.target.getAttribute('data-confirmation')) {
        // eslint-disable-next-line no-alert
        if (!confirm(e.target.getAttribute('data-confirmation-msg'))) {
          return;
        }
      }

      const bookmarkId = e.target.getAttribute('data-id');
      const elBookmark = document.getElementById(bookmarkId);
      const title = e.target.getAttribute('data-title');
      const url = e.target.getAttribute('data-url');
      const mode = e.target.getAttribute('data-mode');

      switch (e.target.getAttribute('data-action')) {
        case 'edit':
          ui.showEditBookmarkOverlay(bookmarkId, title, url, mode);
          break;
        case 'remove':
          elBookmark.remove();
          ui.hideEmptyCategories();
          ui.removeBookmark(bookmarkId);
          break;
        case 'repair-redirect':
          elBookmark.remove();
          ui.hideEmptyCategories();
          ui.repairRedirect(bookmarkId, e.target.getAttribute('data-new-url'));
          break;
        default:
          // do nothing
      }
    }
    else if (e.target.getAttribute('data-filter')) {
      ui.applyCheckboxFilter(e);
    }
  },

  repairAllRedirects (e) {
    e.preventDefault();

    // eslint-disable-next-line no-alert
    if (!confirm(browser.i18n.getMessage('bookmark_confirmation_repair_all_redirects'))) {
      return;
    }

    const bookmarks = document.querySelectorAll('.redirect');

    for (const bookmark of bookmarks) {
      if (!bookmark.classList.contains('hidden')) {
        bookmark.remove();
        ui.repairRedirect(bookmark.id, bookmark.getElementsByClassName('new-url')[0].getAttribute('href'));
      }
    }

    ui.hideEmptyCategories();
  },

  removeAllBookmarksWithErrors (e) {
    e.preventDefault();

    // eslint-disable-next-line no-alert
    if (!confirm(browser.i18n.getMessage('bookmark_confirmation_remove_all_bookmarks_with_errors'))) {
      return;
    }

    const bookmarks = document.querySelectorAll('.error');

    for (const bookmark of bookmarks) {
      if (!bookmark.classList.contains('hidden')) {
        bookmark.remove();
        ui.removeBookmark(bookmark.id);
      }
    }

    ui.hideEmptyCategories();
  },

  applySearchFieldFilter (e) {
    const matcher = new RegExp(e.target.value, 'i');
    const urls = elResults.querySelectorAll('.url');

    for (const url of urls) {
      const parentElement = url.parentNode.parentNode;
      const title = parentElement.querySelector('.title');

      if (matcher.test(title.textContent) || matcher.test(url.textContent)) {
        parentElement.setAttribute('data-filter-searchfield', 'true');
      }
      else {
        parentElement.removeAttribute('data-filter-searchfield');
      }
    }

    ui.hideFilteredElements();
  },

  applyCheckboxFilter (e) {
    const urls = elResults.querySelectorAll('.url');

    for (const url of urls) {
      const parentElement = url.parentNode.parentNode;

      if (parentElement.classList.contains(e.target.getAttribute('data-filter'))) {
        if (e.target.checked) {
          parentElement.setAttribute('data-filter-checkbox', 'true');
        }
        else {
          parentElement.removeAttribute('data-filter-checkbox');
        }
      }
    }

    ui.hideFilteredElements();
  },

  hideFilteredElements () {
    const elements = elResults.querySelectorAll('li');

    for (const element of elements) {
      if (element.getElementsByClassName('url').length !== 0) {
        if (element.hasAttribute('data-filter-searchfield') && element.hasAttribute('data-filter-checkbox')) {
          element.classList.remove('hidden');
        }
        else {
          element.classList.add('hidden');
        }
      }
    }

    ui.hideEmptyCategories();
  },

  hideEmptyCategories () {
    const elements = elResults.querySelectorAll('li.has-children');
    for (const element of elements) {
      const subelements = element.querySelectorAll('li.is-bookmark');
      let count = 0;

      for (const subelement of subelements) {
        if (!subelement.classList.contains('hidden')) {
          count++;
          break;
        }
      }

      if (count > 0) {
        element.classList.remove('hidden');
      }
      else {
        element.classList.add('hidden');
      }
    }
  }
};

document.addEventListener('DOMContentLoaded', ui.init);

elButton.addEventListener('click', ui.execute);
elBody.addEventListener('click', ui.handleActionButtonClicks);
elFox.addEventListener('click', ui.handleFoxMessageClick);
elRepairAllRedirects.addEventListener('click', ui.repairAllRedirects);
elRemoveAllBookmarksWithErrors.addEventListener('click', ui.removeAllBookmarksWithErrors);
elSearch.addEventListener('input', ui.applySearchFieldFilter);

browser.runtime.onMessage.addListener(ui.handleResponse);

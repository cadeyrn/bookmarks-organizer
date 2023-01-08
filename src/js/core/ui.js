'use strict';

/* global STATUS */

const DELAY_SPINNER_TIMEOUT = 500;
const HEADER_SWITCH_POSITION = 100;
const MIN_PROGRESS = 0.01;

const elBody = document.querySelector('body');
const elBookmarksErrors = document.getElementById('bookmarks-errors');
const elBookmarksWarnings = document.getElementById('bookmarks-warnings');
const elButton = document.getElementById('submit-button');
const elCheckedBookmarks = document.getElementById('checked-bookmarks');
const elDebugOutput = document.getElementById('debug-output');
const elDebugWrapper = document.getElementById('debug-output-wrapper');
const elDeleteAllBookmarksWithErrors = document.getElementById('delete-all-bookmarks-with-errors');
const elFilterBar = document.getElementById('filterbar');
const elFilterErrors = document.getElementById('filter-errors');
const elFilterWarnings = document.getElementById('filter-warnings');
const elFox = document.getElementById('fox');
const elHeaderWrapper = document.getElementById('header-wrapper');
const elHint = document.getElementById('hint');
const elMask = document.getElementById('mask');
const elMode = document.getElementById('mode');
const elPermissionContainer = document.getElementById('permission-container');
const elPermissionGrantButton = document.getElementById('permission-grant-button');
const elProgress = document.getElementById('progress');
const elRepairAllRedirects = document.getElementById('repair-all-redirects');
const elResults = document.getElementById('results');
const elResultWrapper = document.getElementById('result-wrapper');
const elSearch = document.getElementById('search');
const elSpinner = document.getElementById('spinner');
const elStart = document.getElementById('start');
const elTotalBookmarks = document.getElementById('total-bookmarks');

/**
 * @exports ui
 */
const ui = {
  /**
   * Disables confirmation messages. It defaults to false and can be changed in the add-on's settings.
   *
   * @type {boolean}
   */
  disableConfirmations : false,

  /**
   * Number of bookmarks with errors or warnings.
   *
   * @type {int}
   */
  markedBookmarks : 0,

  /**
   * Number of bookmarks with warnings.
   *
   * @type {int}
   */
  warnings : 0,

  /**
   * Number of bookmarks with errors.
   *
   * @type {int}
   */
  errors : 0,

  /**
   * boolean, indicates whether the "no results" message should be shown or not.
   *
   * @type {boolean}
   */
  showNoResultsMessage : false,

  /**
   * boolean, indicates whether the search field should be shown or not.
   *
   * @type {boolean}
   */
  showSearchField : false,

  /**
   * boolean, indicates whether the filter checkboxes should be shown or not.
   *
   * @type {boolean}
   */
  showFilterCheckboxes : false,

  /**
   * boolean, indicates whether the button to repair all redirects should be shown or not.
   *
   * @type {boolean}
   */
  showRepairAllRedirectsBtn : false,

  /**
   * boolean, indicates whether the button to remove all broken bookmarks should be shown or not.
   *
   * @type {boolean}
   */
  showRemoveAllBrokenBtn : false,

  /**
   * boolean, indicates whether the debug output should be shown or not.
   *
   * @type {boolean}
   */
  showDebugOutput : false,

  /**
   * boolean, indicates whether the the permission to access all website data is granted or not
   *
   * @type {boolean}
   */
  hasPermission : false,

  /**
   * Fired when the initial HTML document has been completely loaded and parsed. Checks the permission to access all
   * website data, counts the bookmarks and initializes the UI script.
   *
   * @returns {void}
   */
  async init () {
    await ui.setupPermission();

    browser.runtime.sendMessage({ message : 'count' });
    ui.uiscript();
  },

  /**
   * Checks the permission to access all website data and adds the grant permission button listener.
   *
   * @returns {void}
   */
  setupPermission () {
    browser.runtime.sendMessage({
      message : 'check-permission'
    });

    elPermissionGrantButton.onclick = async (e) => {
      e.preventDefault();

      await browser.permissions.request({
        origins : ['<all_urls>']
      });

      browser.runtime.sendMessage({
        message : 'check-permission'
      });
    };
  },

  /**
   * A general confirmation dialog implementation, used by various methods.
   *
   * @param {string} msg - confirmation message
   *
   * @returns {Promise} - resolves on success (OK button)
   */
  confirm (msg) {
    const modal = document.getElementById('confirm-dialog');
    modal.classList.remove('hidden');

    const elMessage = document.getElementById('confirm-message');
    elMessage.textContent = msg;

    const hideModal = () => {
      modal.classList.add('hidden');
    };

    return new Promise((resolve) => {
      window.onkeydown = function (e) {
        if (e.key === 'Escape') {
          hideModal();
        }
      };

      window.onclick = function (e) {
        if (e.target === modal) {
          hideModal();
        }
      };

      const closeButton = document.getElementById('confirm-close-button');
      closeButton.onclick = function () {
        hideModal();
      };

      const cancelButton = document.getElementById('btn-cancel');
      cancelButton.onclick = function () {
        hideModal();
      };

      const submitButton = document.getElementById('btn-confirm');
      submitButton.onclick = function () {
        hideModal();
        resolve();
      };
    });
  },

  /**
   * Setup method for the user interface, called by init().
   *
   * @returns {void}
   */
  uiscript () {
    const delta = 5;
    let lastScrollTop = 0;
    let rafTimer = null;

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
      cancelAnimationFrame(rafTimer);
      rafTimer = requestAnimationFrame(hasScrolled);
    });

    const closeButton = document.getElementById('hint-close-button');
    closeButton.onclick = function () {
      elHint.classList.add('hidden');
    };

    window.onkeydown = function (e) {
      if (e.key === 'Escape') {
        elHint.classList.add('hidden');
      }
    };

    setTimeout(() => {
      elMask.classList.remove('hidden');
      elSpinner.classList.remove('hidden');
    }, DELAY_SPINNER_TIMEOUT);
  },

  /**
   * Fired when the Fox icon is clicked.
   *
   * @param {MouseEvent} e - event
   *
   * @returns {void}
   */
  handleFoxMessageClick (e) {
    e.preventDefault();
    elHint.classList.toggle('hidden');
  },

  /**
   * Fired when the button for starting a bookmark check is clicked.
   *
   * @param {MouseEvent} e - event
   *
   * @returns {void}
   */
  execute (e) {
    e.preventDefault();
    browser.runtime.sendMessage({
      message : 'execute',
      mode : elMode.value
    });
  },

  /**
   * Fired when a message is sent from the background script to the UI script.
   *
   * @param {Object} response - contains the response from the background script
   *
   * @returns {void}
   */
  handleResponse (response) {
    if (response.message === 'permission-granted') {
      ui.hasPermission = true;
      elPermissionContainer.classList.add('hidden');

      if (response.has_bookmarks) {
        elButton.disabled = false;
      }
    }
    else if (response.message === 'permission-revoked') {
      ui.hasPermission = false;
      elButton.disabled = true;

      if (elResultWrapper.classList.contains('hidden')) {
        elPermissionContainer.classList.remove('hidden');
      }
    }
    else if (response.message === 'started') {
      elMask.classList.remove('is-hidden');
      elMask.classList.add('active-check');
      elSpinner.classList.add('active-check');
      elSpinner.classList.remove('is-hidden');
      elResultWrapper.classList.add('hidden');
      elStart.classList.add('hidden');
      elHint.getElementsByClassName('notice')[0].textContent = browser.i18n.getMessage('greeting');
      elHint.getElementsByClassName('content')[0].textContent = browser.i18n.getMessage('intro_check');
      elHint.classList.add('hidden');
      elHint.classList.remove('success');
      elResults.textContent = '';
      elDebugOutput.textContent = '';
      elProgress.setAttribute('value', MIN_PROGRESS.toString());
      elCheckedBookmarks.textContent = '0';
      elBookmarksErrors.textContent = '0';
      elBookmarksWarnings.textContent = '0';
      elButton.disabled = true;
      elFilterErrors.checked = true;
      elFilterWarnings.checked = true;
      elSearch.value = '';
    }
    else if (response.message === 'total-bookmarks') {
      elTotalBookmarks.textContent = response.total_bookmarks;
      elMask.classList.add('is-hidden');
      elSpinner.classList.add('is-hidden');

      if (response.total_bookmarks === 0) {
        elStart.classList.add('hidden');
        elHint.getElementsByClassName('notice')[0].textContent = browser.i18n.getMessage('no_marked_bookmarks_title');
        elHint.getElementsByClassName('content')[0].textContent = browser.i18n.getMessage('no_marked_bookmarks');
        elHint.classList.add('success');
        elHint.classList.remove('hidden');
        elButton.disabled = true;
      }
      else if (ui.hasPermission && response.total_bookmarks > 0) {
        elButton.disabled = false;
      }
    }
    else if (response.message === 'total-bookmarks-changed') {
      elTotalBookmarks.textContent = response.total_bookmarks;
      elButton.disabled = !ui.hasPermission || response.total_bookmarks === 0;
    }
    else if (response.message === 'update-counters') {
      elTotalBookmarks.textContent = response.total_bookmarks;
      elCheckedBookmarks.textContent = response.checked_bookmarks;
      elBookmarksErrors.textContent = response.bookmarks_errors;
      elBookmarksWarnings.textContent = response.bookmarks_warnings;
      elProgress.setAttribute('value', response.progress);
      ui.markedBookmarks = response.bookmarks_errors + response.bookmarks_warnings;
      ui.warnings = response.bookmarks_warnings;
      ui.errors = response.bookmarks_errors;
    }
    else if (response.message === 'finished') {
      ui.disableConfirmations = response.disableConfirmations;

      ui.buildBookmarksTree(response.bookmarks);
      ui.hideEmptyCategories();

      if (ui.markedBookmarks === 0) {
        ui.showNoResultsMessage = true;
        ui.showSearchField = false;
      }
      else {
        ui.showNoResultsMessage = false;
        ui.showSearchField = true;
        elSearch.focus();
      }

      if (response.mode !== 'broken-bookmarks' || ui.markedBookmarks === 0) {
        ui.showFilterCheckboxes = false;
      }
      else {
        ui.showFilterCheckboxes = true;
      }

      if (ui.warnings === 0) {
        ui.showRepairAllRedirectsBtn = false;
      }
      else {
        ui.showRepairAllRedirectsBtn = true;
      }

      if (ui.errors === 0) {
        ui.showRemoveAllBrokenBtn = false;
      }
      else {
        ui.showRemoveAllBrokenBtn = true;
      }

      if (response.debug.length === 0) {
        ui.showDebugOutput = false;
      }
      else {
        elDebugOutput.textContent = JSON.stringify(response.debug, null, 2);
        ui.showDebugOutput = true;
      }

      ui.doUiCleanup();
    }
    else if (response.message === 'show-duplicates-ui') {
      ui.disableConfirmations = response.disableConfirmations;
      elBookmarksErrors.textContent = response.errors;

      if (response.errors === 0) {
        ui.showNoResultsMessage = true;
      }
      else {
        ui.showNoResultsMessage = false;
      }

      ui.showSearchField = false;
      ui.showFilterCheckboxes = false;
      ui.showRepairAllRedirectsBtn = false;
      ui.showRemoveAllBrokenBtn = false;
      ui.showDebugOutput = false;

      ui.buildDuplicatesUi(response.bookmarks);
      ui.doUiCleanup();
    }
    else if (response.message === 'update-listitem') {
      const listItem = document.getElementById(response.bookmarkId);

      if (response.mode === 'duplicate') {
        const title = browser.i18n.getMessage('bookmark_name') + ': ' + response.title;
        const path = browser.i18n.getMessage('bookmark_path') + ': ' + response.path.join(' / ');

        listItem.getElementsByClassName('name')[0].textContent = title;
        listItem.getElementsByClassName('url')[0].textContent = path;
      }
      else {
        response.bookmark.status = STATUS.UNKNOWN;
        listItem.replaceWith(ui.getSingleNode(response.bookmark));
      }
    }
    else if (response.message === 'change-disable-confirmations-state') {
      ui.disableConfirmations = response.disableConfirmations;
    }
  },

  /**
   * Shows and hides elements based on the check mode and the result.
   *
   * @returns {void}
   */
  doUiCleanup () {
    elMask.classList.add('is-hidden');
    elMask.classList.remove('active-check');
    elSpinner.classList.add('is-hidden');
    elSpinner.classList.remove('active-check');

    elButton.disabled = false;
    elResultWrapper.classList.remove('hidden');
    elStart.classList.add('hidden');
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
    }

    if (ui.showRepairAllRedirectsBtn) {
      elRepairAllRedirects.classList.remove('hidden');
    }
    else {
      elRepairAllRedirects.classList.add('hidden');
    }

    if (ui.showRemoveAllBrokenBtn) {
      elDeleteAllBookmarksWithErrors.classList.remove('hidden');
    }
    else {
      elDeleteAllBookmarksWithErrors.classList.add('hidden');
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
      elDebugWrapper.classList.remove('hidden');
    }
    else {
      elDebugWrapper.classList.add('hidden');
    }
  },

  /**
   * Builds the user interface for the duplicates mode.
   *
   * @param {Array.<bookmarks.BookmarkTreeNode>} bookmarks - a tree of bookmarks
   *
   * @returns {void}
   */
  buildDuplicatesUi (bookmarks) {
    const list = document.createElement('ul');
    list.classList.add('duplicates-item');

    for (const url in bookmarks) {
      if (Object.hasOwn(bookmarks, url)) {
        list.appendChild(ui.getSingleDuplicateNode(bookmarks, url));
      }
    }

    elResults.appendChild(list);
  },

  /**
   * Gets the HTML for a single bookmark item for the duplicates mode.
   *
   * @param {Array.<bookmarks.BookmarkTreeNode>} bookmarks - an array of bookmarks
   * @param {string} url - the url of the duplicate bookmarks
   *
   * @returns {HTMLElement} - the HTML for a single bookmark list item
   */
  getSingleDuplicateNode (bookmarks, url) {
    const template = document.getElementById('duplicates-template').content.cloneNode(true);
    const elListItem = document.createElement('li');
    elListItem.classList.add('error');

    const elUrlText = document.createTextNode(url);
    const elUrl = template.querySelector('.url');
    elUrl.appendChild(elUrlText);
    elUrl.setAttribute('href', url);
    elUrl.setAttribute('target', '_blank');
    elUrl.setAttribute('rel', 'noopener');
    elListItem.appendChild(elUrl);

    const elDuplicatesList = document.createElement('ul');
    elDuplicatesList.classList.add('duplicates');

    const duplicates = bookmarks[url];

    for (const duplicate of duplicates) {
      const elDuplicate = document.createElement('li');
      elDuplicate.id = duplicate.id;

      const elDuplicateName = document.createElement('div');
      elDuplicateName.classList.add('name');
      elDuplicateName.textContent = browser.i18n.getMessage('bookmark_name') + ': ' + duplicate.title;
      elDuplicate.appendChild(elDuplicateName);

      let duplicatePath = duplicate.path.join(' / ');
      if (!duplicatePath) {
        duplicatePath = '/';
      }

      const elDuplicatePath = document.createElement('div');
      elDuplicatePath.classList.add('url');
      elDuplicatePath.textContent = browser.i18n.getMessage('bookmark_path') + ': ' + duplicatePath;
      elDuplicate.appendChild(elDuplicatePath);

      const elActionButtons = document.createElement('div');
      elActionButtons.classList.add('action-buttons');

      const elEditButtonText = document.createTextNode(browser.i18n.getMessage('bookmark_action_edit'));
      const elEditButton = document.createElement('a');
      elEditButton.appendChild(elEditButtonText);
      elEditButton.setAttribute('data-id', duplicate.id);
      elEditButton.setAttribute('data-action', 'edit');
      elEditButton.setAttribute('data-name', duplicate.title);
      elEditButton.setAttribute('data-url', duplicate.url);
      elEditButton.setAttribute('data-mode', 'duplicate');
      elEditButton.setAttribute('href', '#');
      elActionButtons.appendChild(elEditButton);

      const elDeleteButtonText = document.createTextNode(browser.i18n.getMessage('bookmark_action_delete'));
      const elDeleteButton = document.createElement('a');
      elDeleteButton.appendChild(elDeleteButtonText);
      elDeleteButton.setAttribute('data-id', duplicate.id);
      elDeleteButton.setAttribute('data-action', 'delete');
      elDeleteButton.setAttribute('data-confirmation', 'true');
      elDeleteButton.setAttribute('data-confirmation-msg', browser.i18n.getMessage('bookmark_confirmation_delete'));
      elDeleteButton.setAttribute('href', '#');
      elActionButtons.appendChild(elDeleteButton);

      elDuplicate.appendChild(elActionButtons);
      elDuplicatesList.appendChild(elDuplicate);
    }

    elListItem.appendChild(elDuplicatesList);

    return elListItem;
  },

  /**
   * Builds the user interface for other modes than the duplicates mode.
   *
   * @param {Array.<bookmarks.BookmarkTreeNode>} bookmarks - a tree of bookmarks
   *
   * @returns {void}
   */
  buildBookmarksTree (bookmarks) {
    elResults.appendChild(ui.getNodes(bookmarks));
  },

  /**
   * Gets the HTML for all nodes for other modes than the duplicates mode.
   *
   * @param {Array.<bookmarks.BookmarkTreeNode>} bookmarks - a tree of bookmarks
   *
   * @returns {HTMLElement} - the HTML for an unordered list of bookmarks
   */
  getNodes (bookmarks) {
    const list = document.createElement('ul');

    for (const bookmark of bookmarks) {
      if (bookmark.url || (!bookmark.url && bookmark.children.length > 0)) {
        list.appendChild(ui.getSingleNode(bookmark));
      }
    }

    return list;
  },

  /**
   * Gets the HTML for a single bookmark for other modes than the duplicates mode.
   *
   * @param {bookmarks.BookmarkTreeNode} bookmark - a single bookmark
   *
   * @returns {HTMLElement} - the HTML for a single bookmark list item
   */
  getSingleNode (bookmark) {
    let template = null;
    const li = document.createElement('li');
    li.id = bookmark.id;
    li.setAttribute('data-filter-searchfield', 'true');
    li.setAttribute('data-filter-checkbox', 'true');

    if (bookmark.url) {
      li.classList.add('is-bookmark');
      template = document.getElementById('result-template-url').content.cloneNode(true);

      const elName = template.querySelector('.name');
      let { title } = bookmark;

      if (!title) {
        elName.classList.add('no-name');
        title = browser.i18n.getMessage('bookmark_no_name');
      }

      const elNameText = document.createTextNode(title);
      elName.appendChild(elNameText);

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
          case STATUS.TIMEOUT:
            li.classList.add('error');
            break;
          case STATUS.UNKNOWN:
            li.classList.add('unknown');
            break;
          default:
            // do nothing
        }
      }
      else {
        li.classList.add('error');
      }

      const elActionButtons = template.querySelector('.action-buttons');

      const elEditButtonText = document.createTextNode(browser.i18n.getMessage('bookmark_action_edit'));
      const elEditButton = document.createElement('a');
      elEditButton.appendChild(elEditButtonText);
      elEditButton.setAttribute('data-id', bookmark.id);
      elEditButton.setAttribute('data-action', 'edit');
      elEditButton.setAttribute('data-name', bookmark.title);
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

      const elDeleteButtonText = document.createTextNode(browser.i18n.getMessage('bookmark_action_delete'));
      const elDeleteButton = document.createElement('a');
      elDeleteButton.appendChild(elDeleteButtonText);
      elDeleteButton.setAttribute('data-id', bookmark.id);
      elDeleteButton.setAttribute('data-action', 'delete');
      elDeleteButton.setAttribute('data-confirmation', 'true');
      elDeleteButton.setAttribute('data-confirmation-msg', browser.i18n.getMessage('bookmark_confirmation_delete'));
      elDeleteButton.setAttribute('href', '#');
      elActionButtons.appendChild(elDeleteButton);

      const elIgnoreButtonText = document.createTextNode(browser.i18n.getMessage('bookmark_action_add_to_whitelist'));
      const elIgnoreButton = document.createElement('a');
      elIgnoreButton.appendChild(elIgnoreButtonText);
      elIgnoreButton.setAttribute('data-id', bookmark.id);
      elIgnoreButton.setAttribute('data-action', 'ignore');
      elIgnoreButton.setAttribute('data-confirmation', 'true');
      elIgnoreButton.setAttribute('data-confirmation-msg', browser.i18n.getMessage('bookmark_confirmation_whitelist'));
      elIgnoreButton.setAttribute('href', '#');
      elActionButtons.appendChild(elIgnoreButton);
    }
    else {
      template = document.getElementById('result-template-name').content.cloneNode(true);

      const title = bookmark.title ? bookmark.title : browser.i18n.getMessage('bookmark_no_name');
      const elNameText = document.createTextNode(title);
      const elName = template.querySelector('.name');
      elName.appendChild(elNameText);
    }

    li.appendChild(template);

    if (bookmark.children && bookmark.children.length > 0) {
      li.classList.add('has-children');
      li.appendChild(ui.getNodes(bookmark.children));
    }

    return li;
  },

  /**
   * Shows the edit overlay for a broken bookmark.
   *
   * @param {int} bookmarkId - the id of the bookmark
   * @param {string} title - the current title of the bookmark
   * @param {string} url - the current url of the bookmark
   * @param {string} mode - the mode of the bookmark check
   *
   * @returns {void}
   */
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
      if (e.key === 'Escape') {
        modal.classList.add('hidden');
      }
    };

    const elName = document.getElementById('name');
    elName.value = title;
    elName.focus();

    const elUrl = document.getElementById('url');
    elUrl.value = url;

    const submitButton = document.getElementById('submit-changes');
    submitButton.onclick = function (e) {
      e.preventDefault();

      modal.classList.add('hidden');
      ui.editBookmark(bookmarkId, elName.value, elUrl.value, mode);
    };
  },

  /**
   * This method is used to edit a bookmark.
   *
   * @param {int} bookmarkId - the id of the bookmark
   * @param {string} title - the new title of the bookmark
   * @param {string} url - the new url of the bookmark
   * @param {string} mode - the mode of the bookmark check
   *
   * @returns {void}
   */
  editBookmark (bookmarkId, title, url, mode) {
    browser.runtime.sendMessage({
      message : 'edit',
      bookmarkId : bookmarkId,
      title : title,
      url : url,
      mode : mode
    });
  },

  /**
   * This method is used to delete a bookmark.
   *
   * @param {string} bookmarkId - the id of the bookmark
   *
   * @returns {void}
   */
  deleteBookmark (bookmarkId) {
    browser.runtime.sendMessage({
      message : 'remove',
      bookmarkId : bookmarkId
    });

    // The number of total bookmarks will automatically be reduced by one in the onRemoved handler in background.js.
    // We also want to reduce the number of checked bookmarks so that there will never be more checked than total
    // bookmarks.
    elCheckedBookmarks.textContent = (parseInt(elCheckedBookmarks.textContent) - 1).toString();
  },

  /**
   * This method is used to change the url of a bookmark which is marked as redirect.
   *
   * @param {string} bookmarkId - the id of the bookmark
   * @param {string} newUrl - the new url of the bookmark
   *
   * @returns {void}
   */
  repairRedirect (bookmarkId, newUrl) {
    browser.runtime.sendMessage({
      message : 'repair-redirect',
      bookmarkId : bookmarkId,
      newUrl : newUrl
    });
  },

  /**
   * This method is used to add a bookmark to the whitelist.
   *
   * @param {int} bookmarkId - the id of the bookmark
   *
   * @returns {void}
   */
  ignoreBookmark (bookmarkId) {
    browser.runtime.sendMessage({
      message : 'ignore',
      bookmarkId : bookmarkId
    });
  },

  /**
   * Fired when one of the action buttons is clicked.
   *
   * @param {MouseEvent} e - event
   *
   * @returns {void}
   */
  async handleActionButtonClicks (e) {
    if (e.target.getAttribute('data-action')) {
      e.preventDefault();

      if (e.target.getAttribute('data-confirmation') && !ui.disableConfirmations) {
        await ui.confirm(e.target.getAttribute('data-confirmation-msg'));
      }

      const bookmarkId = e.target.getAttribute('data-id');
      const elBookmark = document.getElementById(bookmarkId);
      const title = e.target.getAttribute('data-name');
      const url = e.target.getAttribute('data-url');
      const mode = e.target.getAttribute('data-mode');

      switch (e.target.getAttribute('data-action')) {
        case 'edit':
          ui.showEditBookmarkOverlay(bookmarkId, title, url, mode);
          break;
        case 'delete':
          elBookmark.remove();
          ui.hideEmptyCategories();
          ui.deleteBookmark(bookmarkId);
          break;
        case 'repair-redirect':
          elBookmark.remove();
          ui.hideEmptyCategories();
          ui.repairRedirect(bookmarkId, e.target.getAttribute('data-new-url'));
          break;
        case 'ignore':
          elBookmark.remove();
          ui.hideEmptyCategories();
          ui.ignoreBookmark(bookmarkId);
          break;
        default:
          // do nothing
      }
    }
    else if (e.target.getAttribute('data-filter')) {
      ui.applyCheckboxFilter(e);
    }
  },

  /**
   * This method is used to change the url of all bookmarks which are marked as redirect.
   *
   * @param {MouseEvent} e - event
   *
   * @returns {void}
   */
  async repairAllRedirects (e) {
    e.preventDefault();

    if (!ui.disableConfirmations) {
      await ui.confirm(browser.i18n.getMessage('bookmark_confirmation_repair_all_redirects'));
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

  /**
   * This method is used to delete all broken bookmarks.
   *
   * @param {MouseEvent} e - event
   *
   * @returns {void}
   */
  async deleteAllBookmarksWithErrors (e) {
    e.preventDefault();

    if (!ui.disableConfirmations) {
      await ui.confirm(browser.i18n.getMessage('bookmark_confirmation_delete_all_broken'));
    }

    const bookmarks = document.querySelectorAll('.error');

    for (const bookmark of bookmarks) {
      if (!bookmark.classList.contains('hidden')) {
        bookmark.remove();
        ui.deleteBookmark(bookmark.id);
      }
    }

    ui.hideEmptyCategories();
  },

  /**
   * This method is used to filter the result based on the search field.
   *
   * @param {MouseEvent} e - event
   *
   * @returns {void}
   */
  applySearchFieldFilter (e) {
    const matcher = new RegExp(e.target.value, 'i');
    const urls = elResults.querySelectorAll('.url');

    for (const url of urls) {
      const parentElement = url.parentNode.parentNode;
      const title = parentElement.querySelector('.name');

      if (matcher.test(title.textContent) || matcher.test(url.textContent)) {
        parentElement.setAttribute('data-filter-searchfield', 'true');
      }
      else {
        parentElement.removeAttribute('data-filter-searchfield');
      }
    }

    ui.hideFilteredElements();
  },

  /**
   * This method is used to filter the result based on the checkboxes for errors and warnings.
   *
   * @param {MouseEvent} e - event
   *
   * @returns {void}
   */
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

  /**
   * This method is used to hide all result items which are filtered by the search field or the checkboxes.
   *
   * @returns {void}
   */
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

  /**
   * This method is used to hide all categories without bookmarks.
   *
   * @returns {void}
   */
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
elDeleteAllBookmarksWithErrors.addEventListener('click', ui.deleteAllBookmarksWithErrors);
elSearch.addEventListener('input', ui.applySearchFieldFilter);

browser.runtime.onMessage.addListener(ui.handleResponse);

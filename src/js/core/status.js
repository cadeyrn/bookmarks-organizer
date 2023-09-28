'use strict';

/**
 * Status codes for bookmarks, used in background script and in ui script.
 *
 * @exports STATUS
 */
const STATUS = {
  /**
   * Status Code '200' for 'OK'. There are no issues with this bookmark.
   *
   * @type {int}
   */
  OK : 200,

  /**
   * Status Code '300' for 'REDIRECT'. The bookmark redirects to another url.
   *
   * @type {int}
   */
  REDIRECT : 300,

  /**
   * Status Code '900' for 'NOT_OK'. There are issues with this bookmark.
   *
   * @type {int}
   */
  NOT_OK : 900,


  /**
   * Status Code '999' for 'UNKNOWN'. The status is not known, for example after editing a bookmark.
   *
   * @type {int}
   */
  UNKNOWN : 999
};

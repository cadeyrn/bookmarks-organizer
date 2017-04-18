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
   * @type {integer}
   */
  OK : 200,

  /**
   * Status Code '404' for 'NOT_FOUND'. The bookmark no longer works.
   *
   * @type {integer}
   */
  NOT_FOUND : 404,

  /**
   * Status Code '901' for 'REDIRECT'. The bookmark redirects to another url.
   *
   * @type {integer}
   */
  REDIRECT : 901,

  /**
   * Status Code '902' for 'FETCH_ERROR'. There was an error while fetching. Maybe the website no longer exists.
   *
   * @type {integer}
   */
  FETCH_ERROR : 902,

  /**
   * Status Code '999' for 'UNKNOWN'. The status is not known, for example after editing a bookmark.
   *
   * @type {integer}
   */
  UNKNOWN : 999
};

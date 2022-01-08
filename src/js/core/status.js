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
   * Status Code '404' for 'NOT_FOUND'. The bookmark no longer works.
   *
   * @type {int}
   */
  NOT_FOUND : 404,

  /**
   * Status Code '901' for 'TIMEOUT'. We try only TIMEOUT_IN_MS milliseconds to reach the server, otherwise we
   * abort the request.
   *
   * @type {int}
   */
  TIMEOUT : 901,

  /**
   * Status Code '902' for 'FETCH_ERROR'. There was an error while fetching. Maybe the website no longer exists.
   *
   * @type {int}
   */
  FETCH_ERROR : 902,

  /**
   * Status Code '903' for 'EMPTY_BODY'. Not every server allows HEAD requests, but some websites send a wrong HTTP
   * status code. So we check if the response has a body, otherwise we set the status to EMPTY_BODY and try again with
   * the GET method.
   *
   * @type {int}
   */
  EMPTY_BODY : 903,

  /**
   * Status Code '999' for 'UNKNOWN'. The status is not known, for example after editing a bookmark.
   *
   * @type {int}
   */
  UNKNOWN : 999
};

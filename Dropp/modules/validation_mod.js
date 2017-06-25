/**
 * validation_mod - @module for validating input data
 */

/**
 * isValidUsername - Validates a username
 * @param {String} _username a username
 * @returns {Boolean} validity of _username
 */
var isValidUsername = function(_username) {
  /**
   * Evaluates to true if _username is not null, not undefined, not
   * empty, and only contains alphanumeric characters, dashes, or
   * underscores. It must start with two alphanumeric characters
   */
  return _username !== null &&
    _username !== undefined &&
    (/^[a-zA-Z0-9]{2,}[\w\-]*$/).test(_username);
};

/**
 * isValidEmail - Validates an email address
 * @param {String} _email an email
 * @returns {Boolean} validity of _email
 */
var isValidEmail = function(_email) {
  // Evaluates to true if true if _email is not null, not undefined, and matches valid email formats
  return _email !== null &&
    _email !== undefined &&
    (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/).test(_email);
};

/**
 * isValidPassword - Validates a password
 * @param {String} _password a password
 * @returns {Boolean} validity of _password
 */
var isValidPassword = function(_password) {
  /**
   * Evaluates to true if _password is not null, not undefined, not
   * empty, and only contains alphanumeric and special characters
   */
  return _password !== null && _password !== undefined && (/^[\w\S]+$/).test(_password);
};

/**
 * isValidId - Validates an id
 * @param {String} _id an id
 * @returns {Boolean} validity of _id
 */
var isValidId = function(_id) {
  /**
   * Evaluates to true if _id is not null, not undefined, not empty,
   * and only contains alphanumeric characters, underscores, and dashes
   */
  return _id !== null && _id !== undefined && (/^[\w\-]+$/).test(_id);
};

/**
 * isValidLocation - Validates a location
 * @param {String} _location the location string of the form 'latitude,longitude'
 * @returns {Boolean} validity of _location
 */
var isValidLocation = function(_location) {
  /**
   * Evaluates to true if _location is not null, not undefined,
   * not empty, and is two comma separated decimal numbers
   */
  return _location !== null &&
    _location !== undefined &&
    typeof _location === 'string' &&
    (/^(\-?\d+(\.\d+)?),\s*(\-?\d+(\.\d+)?)$/).test(_location);
};

/**
 * isValidMediaString - Validates a media text string
 * @param {String} _media the media string
 * @returns {Boolean} validity of _media
 */
var isValidMediaString = function(_media) {
  // Evalutes to true if media is not null, not undefined, and a string equal to 'true' or 'false'
  return _media !== null && _media !== undefined && (_media === 'true' || _media === 'false');
};

/**
 * isValidInteger - Validates an integer
 * @param {Number} _number a number
 * @returns {Boolean} validity of _number
 */
var isValidInteger = function(_number) {
  // Evalutes to true if _number is not null, not undefined, not empty, and only numeric
  return _number !== null && _number !== undefined && (/^\d+$/).test(_number);
};

/**
 * isValidPositiveFloat - Validates a positive floating-point number
 * @param {Number} _number a number
 * @returns {Boolean} validity of _number
 */
var isValidPositiveFloat = function(_number) {
  // Evalutes to true if _number is not null, not undefined, and a non-negative float
  return _number !== null &&
    _number !== undefined &&
    (/^\d+(\.\d*)?$/).test(_number) &&
    Number(_number) > 0.0;
};

/**
 * isValidTextPost - Validates a text post
 * @param {String} _text a text post
 * @returns {Boolean} validity of _text
 */
var isValidTextPost = function(_text) {
  // Evaluates to true if _text is not null, not undefined, and not empty
  return _text !== null && _text !== undefined && _text.toString().trim().length !== 0;
};

module.exports = {
  isValidId: isValidId,
  isValidEmail: isValidEmail,
  isValidInteger: isValidInteger,
  isValidUsername: isValidUsername,
  isValidPassword: isValidPassword,
  isValidLocation: isValidLocation,
  isValidTextPost: isValidTextPost,
  isValidMediaString: isValidMediaString,
  isValidPositiveFloat: isValidPositiveFloat,
};

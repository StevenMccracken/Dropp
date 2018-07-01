/**
 * @module for data input validation
 */

const Utils = require('./utils');
const Constants = require('./constants');

/**
 * Validates a given Firebase ID
 * @param {String} _firebaseId the ID to validate
 * @return {Boolean} whether the ID is valid or not
 */
const validateFirebaseId = (_firebaseId) => {
  if (typeof _firebaseId !== 'string') return false;
  return _firebaseId.trim() !== Constants.utils.emptyString && !(/[.#$[\]]/).test(_firebaseId);
};

// Data validators for user attributes

/**
 * Validates a given username
 * @param {String} _username the username to validate
 * @return {Boolean} whether the username is valid or not
 */
const validateUsername = (_username) => {
  if (typeof _username !== 'string') return false;
  return (/^[a-zA-Z0-9]{2,}([.-]?\w+)*$/).test(_username);
};

/**
 * Validates a given email address
 * @param {String} _email the email address to validate
 * @return {Boolean} whether the email address is valid or not
 */
const validateEmail = (_email) => {
  if (typeof _email !== 'string') return false;
  return (/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/).test(_email);
};

/**
 * Validates a given password
 * @param {String} _password the password to validate
 * @return {Boolean} whether the password is valid or not
 */
const validatePassword = (_password) => {
  if (typeof _password !== 'string') return false;
  return (/^[\w\S]{4,}$/).test(_password);
};

// Data validators for dropp attributes

/**
 * Validates a given location string
 * @param {String} _location the location string to validate
 * @return {Boolean} whether the location string is valid or not
 */
const validateLocation = (_location) => {
  if (typeof _location !== 'string') return false;
  return (/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/).test(_location);
};

/**
 * Validates a given number
 * @param {Number} num the number to validate
 * @return {Boolean} whether the number is valid or not
 */
/* eslint-disable no-restricted-globals */
const validateNumber = num => typeof num === 'number' && !isNaN(parseFloat(num)) && isFinite(num);
/* eslint-enable no-restricted-globals */

/**
 * Validates a given integer
 * @param {Number} _integer the integer to validate
 * @return {Boolean} whether or not the integer is valid
 */
const validateInteger = (_integer) => {
  if (typeof _integer !== 'number') return false;
  return (_integer % 1) === 0;
};

/**
 * Validates a given UNIX timestamp
 * @param {Number} _timestamp the UNIX timestamp to validate
 * @return {Boolean} whether or not the UNIX timestamp is valid
 */
const validateTimestamp = (_timestamp) => {
  if (typeof _timestamp !== 'number') return false;
  return validateInteger(_timestamp) && _timestamp >= 0;
};

/**
 * Validates a given positive floating-point number
 * @param {Number} _float the floating-point number to validate
 * @return {Boolean} whether or not the floating-point number is valid
 */
const validatePositiveFloat = (_float) => {
  if (typeof _float !== 'number') return false;
  return Number(_float) > 0.0 && (/^\d+(\.\d*)?$/).test(_float);
};

/**
 * Validates a given text post
 * @param {String} text the text post to validate
 * @return {Boolean} whether the text post is valid or not
 */
const validateTextPost = text => typeof text === 'string';

/**
 * Validates a given boolean string
 * @param {String} _booleanString the boolean string to validate
 * @return {Boolean} whether the boolean string is valid or not
 */
const validateBooleanString = (_booleanString) => {
  if (typeof _booleanString !== 'string') return false;
  return _booleanString === Constants.params.true || _booleanString === Constants.params.false;
};

/**
 * Validates a given boolean
 * @param {Boolean} boolean the boolean to validate
 * @return {Boolean} whether the boolean is valid or not
 */
const validateBoolean = boolean => typeof boolean === 'boolean';

/**
 * Validates a given file path
 * @param {String} _path the file path to validate
 * @return {Boolean} whether the file path is valid or not
 */
const validateFilePath = async (_path) => {
  if (typeof _path !== 'string' || _path.length === 0) return false;
  let fileInfo;
  try {
    fileInfo = await Utils.lstat(_path);
  } catch (error) {
    return false;
  }

  return fileInfo.isFile();
};

/**
 * Determines whether or not a given Base-64
 * encoded string contains valid media data
 * @param {String} base64String the base-64 encoded media
 * @return {Boolean} the validity of the given media
 */
const validateBase64Media = (base64String) => {
  if (typeof base64String !== 'string' || base64String.length < 13) return false;
  const encoding = base64String.substring(0, 14);
  return encoding === Constants.media.base64DataTypes.png
    || encoding === Constants.media.base64DataTypes.jpg;
};

module.exports = {
  isValidEmail: validateEmail,
  isValidNumber: validateNumber,
  isValidInteger: validateInteger,
  isValidTextPost: validateTextPost,
  isValidUsername: validateUsername,
  isValidPassword: validatePassword,
  isValidLocation: validateLocation,
  isValidTimestamp: validateTimestamp,
  isValidFirebaseId: validateFirebaseId,
  isValidPositiveFloat: validatePositiveFloat,
  isValidBooleanString: validateBooleanString,
  isValidBoolean: validateBoolean,
  isValidFilePath: validateFilePath,
  isValidBase64Media: validateBase64Media,
};

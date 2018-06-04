/**
 * @module for data input validation
 */

const Utils = require('./utils');

/**
 * Validates a given Firebase ID
 * @param {String} _firebaseId the ID to validate
 * @return {Boolean} whether the ID is valid or not
 */
const validateFirebaseId = function validateFirebaseId(_firebaseId) {
  if (!Utils.hasValue(_firebaseId) || typeof _firebaseId !== 'string') return false;
  return _firebaseId.trim() !== '' && !(/[.#$[\]]/).test(_firebaseId);
};

// Data validators for user attributes

/**
 * Validates a given username
 * @param {String} _username the username to validate
 * @return {Boolean} whether the username is valid or not
 */
const validateUsername = function validateUsername(_username) {
  if (!Utils.hasValue(_username) || typeof _username !== 'string') return false;
  return (/^[a-zA-Z0-9]{2,}([.-]?\w+)*$/).test(_username);
};

/**
 * Validates a given email address
 * @param {String} _email the email address to validate
 * @return {Boolean} whether the email address is valid or not
 */
const validateEmail = function validateEmail(_email) {
  if (!Utils.hasValue(_email) || typeof _email !== 'string') return false;
  return (/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/).test(_email);
};

/**
 * Validates a given password
 * @param {String} _password the password to validate
 * @return {Boolean} whether the password is valid or not
 */
const validatePassword = function validatePassword(_password) {
  if (!Utils.hasValue(_password) || typeof _password !== 'string') return false;
  return (/^[\w\S]{4,}$/).test(_password);
};

// Data validators for dropp attributes

/**
 * Validates a given location string
 * @param {String} _location the location string to validate
 * @return {Boolean} whether the location string is valid or not
 */
const validateLocation = function validateLocation(_location) {
  if (!Utils.hasValue(_location) || typeof _location !== 'string') return false;
  return (/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/).test(_location);
};

/**
 * Validates a given number
 * @param {Number} _number the number to validate
 * @return {Boolean} whether the number is valid or not
 */
const validateNumber = function validateNumber(_number) {
  /* eslint-disable no-restricted-globals */
  return typeof _number === 'number' && !isNaN(parseFloat(_number)) && isFinite(_number);
  /* eslint-enable no-restricted-globals */
};

/**
 * Validates a given integer
 * @param {Number} _integer the integer to validate
 * @return {Boolean} whether or not the integer is valid
 */
const validateInteger = function validateInteger(_integer) {
  if (!Utils.hasValue(_integer) || typeof _integer !== 'number') return false;
  return (_integer % 1) === 0;
};

/**
 * Validates a given UNIX timestamp
 * @param {Number} _timestamp the UNIX timestamp to validate
 * @return {Boolean} whether or not the UNIX timestamp is valid
 */
const validateTimestamp = function validateTimestamp(_timestamp) {
  if (!Utils.hasValue(_timestamp) || typeof _timestamp !== 'number') return false;
  return validateInteger(_timestamp) && _timestamp >= 0;
};

/**
 * Validates a given positive floating-point number
 * @param {Number} _float the floating-point number to validate
 * @return {Boolean} whether or not the floating-point number is valid
 */
const validatePositiveFloat = function validatePositiveFloat(_float) {
  if (!Utils.hasValue(_float) || typeof _float !== 'number') return false;
  return Number(_float) > 0.0 && (/^\d+(\.\d*)?$/).test(_float);
};

/**
 * Validates a given text post
 * @param {String} _text the text post to validate
 * @return {Boolean} whether the text post is valid or not
 */
const validateTextPost = function validateTextPost(_text) {
  return Utils.hasValue(_text) && typeof _text === 'string';
};

/**
 * Validates a given boolean string
 * @param {String} _booleanString the boolean string to validate
 * @return {Boolean} whether the boolean string is valid or not
 */
const validateBooleanString = function validateBooleanString(_booleanString) {
  if (!Utils.hasValue(_booleanString) || typeof _booleanString !== 'string') return false;
  return _booleanString === 'true' || _booleanString === 'false';
};

/**
 * Validates a given boolean
 * @param {Boolean} _boolean the boolean to validate
 * @return {Boolean} whether the boolean is valid or not
 */
const validateBoolean = function validateBoolean(_boolean) {
  return Utils.hasValue(_boolean) && typeof _boolean === 'boolean';
};

/**
 * Validates a given file path
 * @param {String} _path the file path to validate
 * @return {Boolean} whether the file path is valid or not
 */
const validateFilePath = async function validateFilePath(_path) {
  if (typeof _path !== 'string' || _path.length === 0) return false;
  let fileInfo;
  try {
    fileInfo = await Utils.lstat(_path);
  } catch (error) {
    return false;
  }

  return fileInfo.isFile();
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
};

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
  if (!Utils.hasValue(_firebaseId) || typeof _firebaseId !== 'string') {
    return false;
  }

  return !(/[.#$[\]]/).test(_firebaseId);
};

// Data validators for user attributes

/**
 * Validates a given username
 * @param {String} _username the username to validate
 * @return {Boolean} whether the username is valid or not
 */
const validateUsername = function validateUsername(_username) {
  if (!Utils.hasValue(_username) || typeof _username !== 'string') {
    return false;
  }

  return (/^[a-zA-Z0-9]{2,}([.-]?\w+)*$/).test(_username);
};

/**
 * Validates a given email address
 * @param {String} _email the email address to validate
 * @return {Boolean} whether the email address is valid or not
 */
const validateEmail = function validateEmail(_email) {
  if (!Utils.hasValue(_email) || typeof _email !== 'string') {
    return false;
  }

  return (/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/).test(_email);
};

/**
 * Validates a given password
 * @param {String} _password the password to validate
 * @return {Boolean} whether the password is valid or not
 */
const validatePassword = function validatePassword(_password) {
  if (!Utils.hasValue(_password) || typeof _password !== 'string') {
    return false;
  }

  return (/^[\w\S]{4,}$/).test(_password);
};

// Data validators for dropp attributes

/**
 * Validates a given location string
 * @param {String} _location the location string to validate
 * @return {Boolean} whether the location string is valid or not
 */
const validateLocation = function validateLocation(_location) {
  if (!Utils.hasValue(_location) || typeof _location !== 'string') {
    return false;
  }

  return (/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/).test(_location);
};

/**
 * Validates a given UNIX timestamp
 * @param {Number} _timestamp the UNIX timestamp to validate
 * @return {Boolean} whether or not the UNIX timestamp is valid
 */
const validateTimestamp = function validateTimestamp(_timestamp) {
  if (!Utils.hasValue(_timestamp) || typeof _timestamp !== 'number') {
    return false;
  }

  return (_timestamp % 1) === 0 && _timestamp >= 0;
};

/**
 * Validates a given text post
 * @param {String} _text the text post to validate
 * @return {Boolean} whether the text post is valid or not
 */
const validateTextPost = function validateTextPost(_text) {
  if (!Utils.hasValue(_text) || typeof _text !== 'string') {
    return false;
  }

  return _text.toString().trim().length !== 0;
};

/**
 * Validates a given boolean string
 * @param {String} _booleanString the boolean string to validate
 * @return {Boolean} whether the boolean string is valid or not
 */
const validateBooleanString = function validateBooleanString(_booleanString) {
  if (!Utils.hasValue(_booleanString) || typeof _booleanString !== 'string') {
    return false;
  }

  return _booleanString === 'true' || _booleanString === 'false';
};

module.exports = {
  isValidEmail: validateEmail,
  isValidTextPost: validateTextPost,
  isValidUsername: validateUsername,
  isValidPassword: validatePassword,
  isValidLocation: validateLocation,
  isValidTimestamp: validateTimestamp,
  isValidFirebaseId: validateFirebaseId,
  isValidBooleanString: validateBooleanString,
};

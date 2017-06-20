/**
 * authentication_mod - @module for user authentication
 */

const LOG = require('./log_mod');
const JWT = require('jsonwebtoken');
const ERROR = require('./error_mod');
const BCRYPT = require('bcrypt-nodejs');
const CONFIG = require(process.cwd() + '/config/secret.js');

// Handles token storage and verification
const PASSPORT = require('passport');
require('../config/passport')(PASSPORT);

/**
 * validatePasswords - Compares a given password to a hashed password
 * @param {String} _givenPassword a password to compare against a hashed password
 * @param {String} _actualPassword the hashed password to compare against
 * @param {callback} _callback the callback to return successful comparison
 * @param {callback} _errorCallback the callback to return any errors
 */
var validatePasswords = function(_givenPassword, _actualPassword, _callback, _errorCallback) {
  const SOURCE = 'validatePasswords()';
  log(SOURCE);

  BCRYPT.compare(_givenPassword, _actualPassword, (compareError, compareResult) => {
    if (compareError === null) _callback(compareResult);
    else _errorCallback(compareError);
  });
};

/**
 * hash - Salts and hashes a password
 * @param {String} _password the password to hash
 * @param {callback} _callback the callback to return the hashed password
 * @param {callback} _errorCallback the callback to return any errors
 */
var hash = function(_password, _callback, _errorCallback) {
  const SOURCE = 'hash()';
  log(SOURCE);

  // Generate salt to hash the password, use 5 rounds of salting
  BCRYPT.genSalt(5, (genSaltError, salt) => {
    if (genSaltError !== null) _errorCallback(genSaltError);
    else {
      BCRYPT.hash(_password, salt, null, (hashError, hashedPassword) => {
        if (hashError === null) _callback(hashedPassword);
        else _errorCallback(hashError);
      });
    }
  });
};

/**
 * verifyToken - Validates and verifies a JSON web token
 * @param {Object} _request the HTTP request
 * @param {Object} _response the HTTP response
 * @param {callback} _callback the callback to return the user info encoded in the JSON web token
 * @param {callback} _errorCallback the callback to return errors
 */
var verifyToken = function(_request, _response, _callback, _errorCallback) {
  const SOURCE = 'verifyToken()';
  log(SOURCE, _request);

  // Verify the client's token
  PASSPORT.authenticate('jwt', { session: false }, (passportError, userInfo, tokenError) => {
    if (passportError !== null) _errorCallback(passportError, null, false);
    else if (tokenError !== undefined) _errorCallback(null, tokenError, false);
    else if (!userInfo) _errorCallback(null, null, true);
    else errorOccurred = _callback(userInfo);
  })(_request, _response);
};

/**
 * generateToken - Generates a JSON web token
 * @param {String} _username username of client
 * @param {Object} _userData JSON containing extra user information
 * @returns {String} a JSON web token
 */
var generateToken = function(_username, _userData) {
  const SOURCE = 'generateToken()';
  log(SOURCE);

  let userInfo = { username: _username, details: _userData }
  return JWT.sign(userInfo, CONFIG.secret, { expiresIn: '30d' });
}

module.exports = {
  validatePasswords: validatePasswords,
  hash: hash,
  verifyToken: verifyToken,
  generateToken: generateToken,
};

/**
 * log - Logs a message to the server console
 * @param {String} _message the log message
 * @param {Object} _request the HTTP request
 */
function log(_message, _request) {
  LOG.log('Authentication Module', _message, _request);
}

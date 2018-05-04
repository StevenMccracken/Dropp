/**
 * @module for API access and authentication
 */

const Bcrypt = require('bcryptjs');
const Jwt = require('jsonwebtoken');
const Passport = require('passport');
const User = require('../models/User');
const Log = require('../logging/logger');
const Utils = require('../utilities/utils');
const JwtConfig = require('../../config/jwt');

// Configure token storage and verification with Passport
require('./passport')(Passport);

/**
 * Logs a message about authentication
 * @param {String} _message the message to log
 * @param {Object} _request the HTTP request
 */
function log(_message, _request) {
  Log.log('Auth', _message, _request);
}

const expirationTime = '7d';

/**
 * Validates a given password against an already hashed password
 * @param {String} _given a given password to test
 * @param {String} _actual the actual
 * password to test against. Should be hashed.
 * @return {Boolean} whether the passwords match or not
 * @throws {Error} if _given or _actual are non-strings
 */
const validatePasswords = async function validatePasswords(_given, _actual) {
  const source = 'validatePasswords()';
  log(source);

  const matchResult = await Bcrypt.compare(_given, _actual);
  return matchResult;
};

/**
 * Verifies a JSON web token in the header of an HTTP request
 * @param {Object} _request the HTTP request
 * @param {Object} _response the HTTP response
 * @return {Promise<Object>} the user object
 * corresponding to the token or a JSON of errors
 */
const verifyToken = function verifyToken(_request, _response) {
  const source = 'verifyToken()';
  log(source, _request);

  const promise = new Promise((resolve, reject) => {
    Passport.authenticate('jwt', { session: false }, (passportError, user, tokenError) => {
      if (user instanceof User) resolve(user);
      else {
        const error = {
          passportError,
          tokenError: Utils.hasValue(tokenError) ? tokenError : null,
          userInfoMissing: !Utils.hasValue(user),
        };

        reject(error);
      }
    })(_request, _response);
  });

  return promise;
};

/**
 * Generates a new JSON web token
 * @param {User} _user user object with unique information
 * @return {String} a JSON web token, or null if _user is not of type User
 */
const generateToken = function generateToken(_user) {
  const source = 'generateToken()';
  log(source);

  if (!(_user instanceof User)) return null;
  return Jwt.sign(_user.privateData, JwtConfig.secret, { expiresIn: expirationTime });
};

/**
 * Performs a salted hash on a given value
 * @param {String} _value the value to hash
 * @return {String} the hashed value
 * @throws {Error} if _value is not a string
 */
const hash = async function hash(_value) {
  const source = 'hash()';
  log(source);

  const salt = await Bcrypt.genSalt(5);
  const hashedValue = await Bcrypt.hash(_value, salt);
  return hashedValue;
};

module.exports = {
  hash,
  verifyToken,
  generateToken,
  validatePasswords,
};

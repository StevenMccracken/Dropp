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
const Constants = require('../utilities/constants');

// Configure token storage and verification with Passport
require('./passport')(Passport);

/**
 * Validates a given password against an already hashed password
 * @param {String} _given a given password to test
 * @param {String} _actual the actual
 * password to test against. Should be hashed.
 * @return {Boolean} whether the passwords match or not
 * @throws {Error} if _given or _actual are non-strings
 */
const validatePasswords = async (_given, _actual) => {
  const source = 'validatePasswords()';
  Log.log(Constants.auth.moduleName, source, _given, _actual);

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
const verifyToken = (_request, _response) => {
  const source = 'verifyToken()';
  Log.logRequest(Constants.auth.moduleName, source, _request);

  const promise = new Promise((resolve, reject) => {
    Passport.authenticate(
      Constants.passport.jwt,
      { session: false },
      (passportError, user, tokenError) => {
        if (user instanceof User) resolve(user);
        else {
          const error = {
            tokenError,
            passportError,
            userInfoMissing: !Utils.hasValue(user),
          };

          reject(error);
        }
      }
    )(_request, _response);
  });

  return promise;
};

/**
 * Generates a new JSON web token
 * @param {User} _user user object with unique information
 * @return {String} a JSON web token, or null if _user is not of type User
 */
const generateToken = (_user) => {
  const source = 'generateToken()';
  Log.log(Constants.auth.moduleName, source, _user);

  if (!(_user instanceof User)) return null;
  const expirationConfig = { expiresIn: Constants.auth.saltIterations };
  return Jwt.sign(_user.privateData, JwtConfig.secret, expirationConfig);
};

/**
 * Performs a salted hash on a given value
 * @param {String} _value the value to hash
 * @return {String} the hashed value
 * @throws {Error} if _value is not a string
 */
const hash = async (_value) => {
  const source = 'hash()';
  Log.log(Constants.auth.moduleName, source, _value);

  const salt = await Bcrypt.genSalt(Constants.auth.saltIterations);
  const hashedValue = await Bcrypt.hash(_value, salt);
  return hashedValue;
};

module.exports = {
  hash,
  verifyToken,
  generateToken,
  validatePasswords,
};

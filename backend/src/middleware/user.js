/**
 * @module for User object interaction
 */

const User = require('../models/User');
const Log = require('../logging/logger');
const Utils = require('../utilities/utils');
const Auth = require('../authentication/auth');
const UserAccessor = require('../database/user');
const DroppError = require('../errors/DroppError');
const Validator = require('../utilities/validator');

/**
 * Logs a message about user interaction
 * @param {String} _source the source of the log
 * @param {String} _message extra message to log
 */
function log(_source, _message) {
  Log.log('User controller', `${_source} ${_message}`);
}

/**
 * Retrieves a user by their username
 * @param {User} _currentUser the current user for the request
 * @param {Object} [_details={}] the information to get the user
 * @return {Object} the retrieved user, or
 * null if no user with that username exists
 * @throws {DroppError} if the _username parameter is not
 * a valid username or if no user by that username exists
 */
const get = async function get(_currentUser, _details = {}) {
  const source = 'get()';
  log(source, _details.username);

  if (!(_currentUser instanceof User)) DroppError.throwServerError(source, null, 'Object is not a User');
  if (!Validator.isValidUsername(_details.username)) {
    DroppError.throwInvalidRequestError(source, 'username');
  }

  const user = await UserAccessor.get(_details.username);
  if (!Utils.hasValue(user)) DroppError.throwResourceDneError(source, 'user');

  return _currentUser.username === user.username ? user.privateData : user.publicData;
};

/**
 * Creates a new user with the given details
 * @param {Object} [_details={}] the information for
 * the user, including username, email, and password
 * @return {User} the created user
 * @throws {DroppError} if any of the details are
 * invalid, or if a user already exists with that username
 */
const create = async function create(_details = {}) {
  const source = 'create()';
  log(source, '');

  const invalidMembers = [];
  if (!Validator.isValidEmail(_details.email)) invalidMembers.push('email');
  if (!Validator.isValidUsername(_details.username)) invalidMembers.push('username');
  if (!Validator.isValidPassword(_details.password)) invalidMembers.push('password');
  if (invalidMembers.length > 0) DroppError.throwInvalidRequestError(source, invalidMembers);

  const existingUser = await UserAccessor.get(_details.username);
  if (Utils.hasValue(existingUser) && existingUser instanceof User) {
    DroppError.throwResourceError(source, 'A user with that username already exists');
  }

  const user = new User(_details);
  const password = await Auth.hash(_details.password);
  await UserAccessor.create(user, password);
  return user;
};

/**
 * Validates a given password for a given user,
 * and returns a JWT if the validation succeeds
 * @param {Object} [_details={}] the information
 * for the user, including username and password
 * @return {Object} a JSON containing the authentication token
 * @throws {DroppError} if the username or password
 * in _details is invalid, or if the validation fails
 */
const getAuthToken = async function getAuthToken(_details = {}) {
  const source = 'getAuthToken()';
  log(source, _details.username);

  const invalidMembers = [];
  if (!Validator.isValidUsername(_details.username)) invalidMembers.push('username');
  if (!Validator.isValidPassword(_details.password)) invalidMembers.push('password');
  if (invalidMembers.length > 0) DroppError.throwInvalidRequestError(source, invalidMembers);

  const retrievedPassword = await UserAccessor.getPassword(_details.username);
  if (!Validator.isValidPassword(retrievedPassword)) {
    DroppError.throwLoginError(source, null, `Retrieved password: ${retrievedPassword}`);
  }

  const passwordsMatch = await Auth.validatePasswords(_details.password, retrievedPassword);
  if (!passwordsMatch) DroppError.throwLoginError(source);

  const user = await UserAccessor.get(_details.username);
  if (!Utils.hasValue(user)) {
    DroppError.throwServerError(source, null, `Password was valid, but user was ${user}`);
  }

  const token = Auth.generateToken(user);
  const data = {
    success: {
      token: `Bearer ${token}`,
      message: 'Successful authentication',
    },
  };

  return data;
};

/**
 * Creates a new user with the given details
 * @param {Object} [_details={}] the information for
 * the user, including username, email, and passwords
 * @return {Object} the success details, including an authentication token
 * @throws {Error} if any of the details are invalid,
 * or if a user already exists with that username
 */
const addNewUser = async function addNewUser(_details = {}) {
  const source = 'addNewUser()';
  log(source, '');

  const user = await create(_details);
  const token = Auth.generateToken(user);
  const data = {
    success: {
      token: `Bearer ${token}`,
      message: 'Successful user creation',
    },
  };

  return data;
};

/**
 * Updates a user's password
 * @param {User} _currentUser the current user for the request
 * @param {String} _username the username of the user to update
 * @param {Object} [_details={}] the details
 * containing the old and new password to update to
 * @return {Object} the success details, including a new authentication token
 * @throws {DroppError} if the provided passwords are not valid,
 * if the current user does not match the requested user, or
 * if the given password does not match the existing password
 */
const updatePassword = async function updatePassword(_currentUser, _username, _details = {}) {
  const source = 'updatePassword()';
  log(source, _username);

  if (!(_currentUser instanceof User)) DroppError.throwServerError(source, null, 'Object is not a User');

  const invalidMembers = [];
  if (!Validator.isValidPassword(_details.oldPassword)) invalidMembers.push('oldPassword');
  if (!Validator.isValidPassword(_details.newPassword)) invalidMembers.push('newPassword');
  if (invalidMembers.length > 0) DroppError.throwInvalidRequestError(source, invalidMembers);

  if (_currentUser.username !== _username) {
    DroppError.throwResourceError(source, 'Unauthorized to update that user\'s password');
  }

  const retrievedPassword = await UserAccessor.getPassword(_username);
  if (!Validator.isValidPassword(retrievedPassword)) {
    DroppError.throwServerError(source, null, `Retrieved password: ${retrievedPassword}`);
  }

  const passwordsMatch = await Auth.validatePasswords(_details.oldPassword, retrievedPassword);
  if (!passwordsMatch) DroppError.throwLoginError(source);

  const hashedPassword = await Auth.hash(_details.newPassword);
  await UserAccessor.updatePassword(_currentUser, hashedPassword);
  const token = Auth.generateToken(_currentUser);
  const data = {
    success: {
      token: `Bearer ${token}`,
      message: 'Successful password update',
    },
  };

  return data;
};

/**
 * Updates a user's email
 * @param {User} _currentUser the current user for the request
 * @param {String} _username the username of the user to update
 * @param {Object} [_details={}] the details containing the new email
 * @return {Object} the success details
 * @throws {DroppError} if the provided email is invalid
 * or if the current user does not match the requested user
 */
const updateEmail = async function updateEmail(_currentUser, _username, _details = {}) {
  const source = 'updateEmail()';
  log(source, _username);

  if (!(_currentUser instanceof User)) DroppError.throwServerError(source, null, 'Object is not a User');
  if (!Validator.isValidEmail(_details.newEmail)) DroppError.throwInvalidRequestError(source, 'newEmail');
  if (_currentUser.username !== _username) {
    DroppError.throwResourceError(source, 'Unauthorized to update that user\'s email');
  }

  await UserAccessor.updateEmail(_currentUser, _details.newEmail);
  const data = {
    success: {
      message: 'Successful email update',
    },
  };

  return data;
};

/**
 * Removes a user by their username
 * @param {User} _currentUser the current user for the request
 * @param {String} _username the username of the user to remove
 * @throws {DroppError} if the given username is invalid, or if
 * the current user's username does not match the given username
 */
const remove = async function remove(_currentUser, _username) {
  const source = 'remove()';
  log(source, _username);

  if (!(_currentUser instanceof User)) DroppError.throwServerError(source, null, 'Object is not a User');
  if (!Validator.isValidUsername(_username)) {
    DroppError.throwInvalidRequestError(source, 'username');
  }

  if (_currentUser.username !== _username) {
    DroppError.throwResourceError(source, 'Unauthorized to remove that user');
  }

  const user = await UserAccessor.get(_username);
  if (!Utils.hasValue(user)) DroppError.throwResourceDneError(source, 'user');
  await UserAccessor.remove(user);
};

module.exports = {
  get,
  getAuthToken,
  create,
  addNewUser,
  updateEmail,
  updatePassword,
  remove,
};

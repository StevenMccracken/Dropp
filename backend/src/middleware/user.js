/**
 * @module for User object interaction
 */

const User = require('../models/User');
const Log = require('../logging/logger');
const Utils = require('../utilities/utils');
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
 * @param {String} _username the username of the user
 * @return {User} the retrieved user, or
 * null if no user with that username exists
 * @throws {DroppError} if the _username parameter is not a valid username
 */
const get = async function get(_username) {
  const source = 'get()';
  log(source, _username);

  if (!Validator.isValidUsername(_username)) throw new DroppError({ invalidMember: 'username' });
  const user = await UserAccessor.get(_username);
  return user;
};

/**
 * Retrieves a user's password
 * @param {String} _username the username of the user
 * @return {String} the retrieved password,
 * or null if no user exists for that username
 * @throws {DroppError} if the _username parameter is not a valid username
 */
const getPassword = async function getPassword(_username) {
  const source = 'getPassword()';
  log(source, _username);

  if (!Validator.isValidUsername(_username)) throw new DroppError({ invalidMember: 'username' });
  return UserAccessor.getPassword(_username);
};

/**
 * Creates a new user with the given details
 * @param {Object} [_details={}] the information for
 * the user, including username, email, and password
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
  if (invalidMembers.length > 0) throw new DroppError({ invalidMembers });

  const existingUser = await get(_details.username);
  if (Utils.hasValue(existingUser) && existingUser instanceof User) {
    DroppError.throwResourceError(source, 'A user with that username already exists');
  }

  const user = new User(_details);
  await UserAccessor.create(user, _details.password);
};

module.exports = {
  get,
  create,
  getPassword,
};

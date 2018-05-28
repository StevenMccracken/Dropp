/**
 * @module for Dropp object interaction
 */

const User = require('../models/User');
const Log = require('../logging/logger');
// const Dropp = require('../models/Dropp');
const Utils = require('../utilities/utils');
// const Location = require('../models/Location');
const UserAccessor = require('../database/user');
const DroppError = require('../errors/DroppError');
const DroppAccessor = require('../database/dropp');
const Validator = require('../utilities/validator');

const moduleName = 'Dropp Middleware';

/**
 * Retrieves a dropp by it's ID
 * @param {User} _currentUser the current user for the request
 * @param {Object} _details the information to get the dropp
 * @return {Object} the retrieved dropp
 * @throws {DroppError} if the `id` parameter is not
 * a valid dropp ID or if no dropp by that ID exists
 */
const get = async function get(_currentUser, _details) {
  const source = 'get()';
  Log.log(moduleName, source, _currentUser, _details);

  if (!(_currentUser instanceof User)) {
    DroppError.throwServerError(source, null, 'Object is not a User');
  }

  const details = Utils.hasValue(_details) ? _details : {};
  if (!Validator.isValidFirebaseId(details.id)) {
    DroppError.throwInvalidRequestError(source, 'id');
  }

  const dropp = await DroppAccessor.get(details.id);
  if (!Utils.hasValue(dropp)) DroppError.throwResourceDneError(source, 'dropp');
  return dropp.publicData;
};

/**
 * Retrieves dropps created by a user
 * @param {User} _currentUser the current user for the request
 * @param {Object} _details the information
 * containing the user's dropps to retrieve
 * @return {Object} count of dropps retrieved, and a list of those dropps
 */
const getByUser = async function getByUser(_currentUser, _details) {
  const source = 'getByUser()';
  Log.log(moduleName, source, _currentUser, _details);

  if (!(_currentUser instanceof User)) {
    DroppError.throwServerError(source, null, 'Object is not a User');
  }

  const details = Utils.hasValue(_details) ? _details : {};
  if (!Validator.isValidUsername(details.username)) {
    DroppError.throwInvalidRequestError(source, 'username');
  }

  const user = await UserAccessor.get(details.username);
  if (!Utils.hasValue(user)) DroppError.throwResourceDneError(source, 'user');

  // Make sure current user is retrieving their own dropps or one of their follow's dropps
  if (_currentUser.username !== user.username && !user.hasFollower(_currentUser.username)) {
    DroppError.throwResourceError(source, 'You must follow that user see their dropps');
  }

  const dropps = await DroppAccessor.getAll();
  const filteredDropps = dropps.filter(dropp => dropp.username === details.username);
  const result = {
    count: filteredDropps.length,
    dropps: filteredDropps.map(dropp => dropp.publicData),
  };

  return result;
};


module.exports = {
  get,
  getByUser,
};

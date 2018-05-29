/**
 * @module for Dropp object interaction
 */

const User = require('../models/User');
const Log = require('../logging/logger');
const Dropp = require('../models/Dropp');
const Utils = require('../utilities/utils');
const Location = require('../models/Location');
const UserAccessor = require('../database/user');
const DroppError = require('../errors/DroppError');
const DroppAccessor = require('../database/dropp');
const Validator = require('../utilities/validator');

const moduleName = 'Dropp Middleware';
const maxDistanceMeters = 1000;

/**
 * Retrieves all dropps and returns a given filtered result
 * @param {Function} filter the criteria used for filtering all dropps on
 * @return {Object} JSON containing the count of the filtered
 * dropps, and a list of the public data of each dropp
 */
const filterAllDropps = async function filterAllDropps(filter) {
  const dropps = await DroppAccessor.getAll();
  const filteredDropps = dropps.filter(filter);
  const result = {
    count: filteredDropps.length,
    dropps: filteredDropps.map(dropp => dropp.publicData),
  };

  return result;
};

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

  const result = await filterAllDropps(dropp => dropp.username === details.username);
  return { success: result };
};

/**
 * Retrieves dropps created by a user's follows
 * @param {User} _currentUser the current user for the request
 * @param {Object} _details the information
 * containing the user's dropps to retrieve
 * @return {Object} count of dropps retrieved, and a list of those dropps
 */
const getByFollows = async function getByFollows(_currentUser, _details) {
  const source = 'getByFollows()';
  Log.log(moduleName, source, _currentUser, _details);

  if (!(_currentUser instanceof User)) {
    DroppError.throwServerError(source, null, 'Object is not a User');
  }

  const details = Utils.hasValue(_details) ? _details : {};
  if (!Validator.isValidUsername(details.username)) {
    DroppError.throwInvalidRequestError(source, 'username');
  }

  if (_currentUser.username !== details.username) {
    DroppError.throwResourceError(source, 'Unauthorized to access that user\'s follows');
  }

  const user = await UserAccessor.get(details.username);
  if (!Utils.hasValue(user)) {
    DroppError.throwServerError(
      source,
      null,
      `Current user was valid, but retrieved user was ${user}`
    );
  }

  // Iterate through follows add them to a set to save time when iterating
  // over each dropp to determine if it's posted by the current user's follow
  const followsDictionary = {};
  user.follows.forEach((follow) => {
    followsDictionary[follow] = follow;
  });

  const result = await filterAllDropps(dropp => Utils.hasValue(followsDictionary[dropp.username]));
  return { success: result };
};

/**
 * Retrieves dropps created near a given location
 * @param {User} _currentUser the current user for the request
 * @param {Object} _details the information
 * containing the location to search around
 * @return {Object} count of dropps retrieved, and a list of those dropps
 */
const getByLocation = async function getByLocation(_currentUser, _details) {
  const source = 'getByLocation()';
  Log.log(moduleName, source, _currentUser, _details);

  if (!(_currentUser instanceof User)) {
    DroppError.throwServerError(source, null, 'Object is not a User');
  }

  const details = Utils.hasValue(_details) ? _details : {};
  if (!Validator.isValidLocation(`${details.latitude},${details.longitude}`)) {
    DroppError.throwInvalidRequestError(source, 'latitude,longitude');
  }

  const coordinates = {
    latitude: parseFloat(details.latitude),
    longitude: parseFloat(details.longitude),
  };

  const location = new Location(coordinates);
  const result = await filterAllDropps(dropp =>
    location.distance(dropp.location) <= maxDistanceMeters);
  return { success: result };
};

/**
 * Creates a new dropp
 * @param {User} _currentUser the current user for the request
 * @param {Object} _details the information containing the new dropp details
 * @return {Object} success message and the new dropp's ID
 */
const create = async function create(_currentUser, _details) {
  const source = 'create()';
  Log.log(moduleName, source, _currentUser, _details);

  if (!(_currentUser instanceof User)) {
    DroppError.throwServerError(source, null, 'Object is not a User');
  }

  const invalidMembers = [];
  const details = Utils.hasValue(_details) ? _details : {};
  if (!Validator.isValidTextPost(details.text)) invalidMembers.push('text');
  if (!Validator.isValidBooleanString(details.media)) invalidMembers.push('media');
  if (!Validator.isValidUsername(details.username)) invalidMembers.push('username');
  if (!Validator.isValidTimestamp(details.timestamp)) invalidMembers.push('timestamp');
  if (Utils.hasValue(details.location)) {
    if (!Validator.isValidNumber(details.location.latitude)) invalidMembers.push('latitude');
    if (!Validator.isValidNumber(details.location.longitude)) invalidMembers.push('longitude');
  } else invalidMembers.push('location');
  if (invalidMembers.length > 0) DroppError.throwInvalidRequestError(source, invalidMembers);

  const droppInfo = {
    text: details.text,
    media: details.media,
    username: details.username,
    timestamp: details.timestamp,
    location: new Location({
      latitude: details.location.latitude,
      longitude: details.location.longitude,
    }),
  };

  const dropp = await DroppAccessor.add(new Dropp(droppInfo));
  const result = {
    success: {
      droppId: dropp.id,
      message: 'Successful dropp creation',
    },
  };

  return result;
};

module.exports = {
  get,
  create,
  getByUser,
  getByFollows,
  getByLocation,
  maxDistanceMeters,
  filter: filterAllDropps,
};

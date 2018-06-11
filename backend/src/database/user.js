/**
 * @module for database access of users
 */

const User = require('../models/User');
const Log = require('../logging/logger');
const Utils = require('../utilities/utils');
const Firebase = require('../firebase/firebase');
const DroppError = require('../errors/DroppError');
const Validator = require('../utilities/validator');
const Constants = require('../utilities/constants');

/**
 * Retrieves a user from the database by their usenrame
 * @param {String} _username the unique username of the user
 * @return {User} the user
 * @throws {DroppError|Error}
 */
const get = async (_username) => {
  const source = 'get()';
  Log.log(Constants.database.user.moduleName, source, _username);

  if (!Validator.isValidUsername(_username)) {
    DroppError.throwInvalidRequestError(source, Constants.params.username);
  }

  const json = await Firebase.get(`${Constants.database.user.baseUrls.users}/${_username}`);
  if (!Utils.hasValue(json)) return null;
  json.username = _username;
  return new User(json);
};

/**
 * Retrieves a password for a given user from the database
 * @param {String} _username the username to retrieve the password for
 * @return {String} the user's password
 * @throws {DroppError|Error}
 */
const getPassword = async (_username) => {
  const source = 'getPassword()';
  Log.log(Constants.database.user.moduleName, source, _username);

  if (!Validator.isValidUsername(_username)) {
    DroppError.throwInvalidRequestError(source, Constants.params.username);
  }

  return Firebase.get(`${Constants.database.user.baseUrls.passwords}/${_username}`);
};

/**
 * Adds a user and their password to the database
 * @param {User} _user the user to add to the database
 * @param {String} _password the password to for the new user
 * @throws {DroppError|Error}
 */
const create = async (_user, _password) => {
  const source = 'create()';
  Log.log(Constants.database.user.moduleName, source, _user, _password);

  if (!(_user instanceof User)) {
    DroppError.throwServerError(source, null, Constants.errors.objectIsNot(Constants.params.User));
  }

  const invalidMembers = [];
  if (!Validator.isValidEmail(_user.email)) invalidMembers.push(Constants.params.email);
  if (!Validator.isValidUsername(_user.username)) invalidMembers.push(Constants.params.username);
  if (!Validator.isValidPassword(_password)) invalidMembers.push(Constants.params.password);
  if (invalidMembers.length > 0) DroppError.throwInvalidRequestError(source, invalidMembers);
  const data = {};
  data[`${Constants.database.user.baseUrls.users}/${_user.username}`] = _user.databaseData;
  data[`${Constants.database.user.baseUrls.passwords}/${_user.username}`] = _password;
  await Firebase.bulkUpdate(data);
};

/**
 * Updates the password for a given user
 * @param {User} _user the user who the password belongs to
 * @param {String} _password the password to add
 * @throws {DroppError|Error}
 */
const updatePassword = async (_user, _password) => {
  const source = 'updatePassword()';
  Log.log(Constants.database.user.moduleName, source, _user, _password);

  if (!(_user instanceof User)) {
    DroppError.throwServerError(source, null, Constants.errors.objectIsNot(Constants.params.User));
  }

  if (!Validator.isValidPassword(_password)) {
    DroppError.throwInvalidRequestError(source, Constants.params.password);
  }

  await Firebase.update(`${Constants.database.user.baseUrls.passwords}/${_user.username}`, _password);
};

/**
 * Updates a given user's email
 * @param {User} _user the user to update
 * @param {String} _email the new email to update the user with
 * @throws {DroppError|Error}
 */
const updateEmail = async (_user, _email) => {
  const source = 'updateEmail()';
  Log.log(Constants.database.user.moduleName, source, _user);

  if (!(_user instanceof User)) {
    DroppError.throwServerError(source, null, Constants.errors.objectIsNot(Constants.params.User));
  }

  if (!Validator.isValidEmail(_email)) {
    DroppError.throwInvalidRequestError(source, Constants.params.email);
  }

  await Firebase.update(
    `${Constants.database.user.baseUrls.users}/${_user.username}/email`,
    _email
  );
  /* eslint-disable no-param-reassign */
  _user.email = _email;
  /* eslint-enable no-param-reassign */
};

/**
 * Adds a user to a given user's follow requests, and also
 * adds the given user to the user's follower requests
 * @param {User} _user the user to add a follow request for
 * @param {User} _follow the user to be
 * added to the given user's follow requests
 * @throws {DroppError|Error}
 */
const addFollowRequest = async (_user, _follow) => {
  const source = 'addFollowRequest()';
  Log.log(Constants.database.user.moduleName, source, _user, _follow);

  if (!(_user instanceof User) || !(_follow instanceof User)) {
    DroppError.throwServerError(source, null, Constants.errors.objectIsNot(Constants.params.User));
  }

  const updates = {};
  updates[`${Constants.database.user.baseUrls.users}/${_user.username}/follow_requests/${_follow.username}`] = _follow.username;
  updates[`${Constants.database.user.baseUrls.users}/${_follow.username}/follower_requests/${_user.username}`] = _user.username;
  await Firebase.bulkUpdate(updates);
  _user.followRequests.push(_follow.username);
  _follow.followerRequests.push(_user.username);
};

/**
 * Adds a user to a given user's follows, and also
 * adds the given user to the user's followers
 * @param {User} _user the user to add a follow for
 * @param {User} _follow the user to be added to the given user's follows
 * @throws {DroppError|Error}
 */
const addFollow = async (_user, _follow) => {
  const source = 'addFollow()';
  Log.log(Constants.database.user.moduleName, source, _user);

  if (!(_user instanceof User) || !(_follow instanceof User)) {
    DroppError.throwServerError(source, null, Constants.errors.objectIsNot(Constants.params.User));
  }

  const updates = {};
  updates[`${Constants.database.user.baseUrls.users}/${_user.username}/follow_requests/${_follow.username}`] = null;
  updates[`${Constants.database.user.baseUrls.users}/${_user.username}/follows/${_follow.username}`] = _follow.username;
  updates[`${Constants.database.user.baseUrls.users}/${_follow.username}/follower_requests/${_user.username}`] = null;
  updates[`${Constants.database.user.baseUrls.users}/${_follow.username}/followers/${_user.username}`] = _user.username;

  await Firebase.bulkUpdate(updates);
  _user.follows.push(_follow.username);
  _follow.followers.push(_user.username);

  const index1 = _user.followRequests.indexOf(_follow.username);
  const index2 = _follow.followerRequests.indexOf(_user.username);
  if (index1 !== -1) _user.followRequests.splice(index1, 1);
  if (index2 !== -1) _follow.followerRequests.splice(index2, 1);
};

/**
 * Removes a user from a given user's follow requests, and
 * also removes the gven user from the user's follower requests
 * @param {User} _user the user to remove the follow request from
 * @param {User} _follow the user to be removed
 * from the given user's follow requests
 * @throws {DroppError|Error}
 */
const removeFollowRequest = async (_user, _follow) => {
  const source = 'removeFollowRequest()';
  Log.log(Constants.database.user.moduleName, source, _user, _follow);

  if (!(_user instanceof User) || !(_follow instanceof User)) {
    DroppError.throwServerError(source, null, Constants.errors.objectIsNot(Constants.params.User));
  }

  const removals = [];
  removals.push(`${Constants.database.user.baseUrls.users}/${_user.username}/follow_requests/${_follow.username}`);
  removals.push(`${Constants.database.user.baseUrls.users}/${_follow.username}/follower_requests/${_user.username}`);
  await Firebase.bulkRemove(removals);

  const index1 = _user.followRequests.indexOf(_follow.username);
  const index2 = _follow.followerRequests.indexOf(_user.username);
  if (index1 !== -1) _user.followRequests.splice(index1, 1);
  if (index2 !== -1) _follow.followerRequests.splice(index2, 1);
};

/**
 * Removes a user from a given user's follows, and also
 * removes the given user from the user's followers
 * @param {User} _user the user to remove the follow from
 * @param {User} _follow the user to be removed from the given user's follows
 * @throws {DroppError|Error}
 */
const removeFollow = async (_user, _follow) => {
  const source = 'removeFollow()';
  Log.log(Constants.database.user.moduleName, source, _user);

  if (!(_user instanceof User) || !(_follow instanceof User)) {
    DroppError.throwServerError(source, null, Constants.errors.objectIsNot(Constants.params.User));
  }

  const removals = [];
  removals.push(`${Constants.database.user.baseUrls.users}/${_user.username}/follows/${_follow.username}`);
  removals.push(`${Constants.database.user.baseUrls.users}/${_follow.username}/followers/${_user.username}`);
  await Firebase.bulkRemove(removals);

  const index1 = _user.follows.indexOf(_follow.username);
  const index2 = _follow.followers.indexOf(_user.username);
  if (index1 !== -1) _user.follows.splice(index1, 1);
  if (index2 !== -1) _follow.followers.splice(index2, 1);
};

/**
 * Deletes a user's information from the database
 * @param {User} _user the user to delete from the database
 * @throws {DroppError|Error}
 */
const remove = async (_user) => {
  const source = 'remove()';
  Log.log(Constants.database.user.moduleName, source, _user);

  if (!(_user instanceof User)) {
    DroppError.throwServerError(source, null, Constants.errors.objectIsNot(Constants.params.User));
  }

  const removals = [];
  removals.push(`${Constants.database.user.baseUrls.users}/${_user.username}`);
  removals.push(`${Constants.database.user.baseUrls.passwords}/${_user.username}`);
  _user.follows.forEach((follow) => {
    removals.push(`${Constants.database.user.baseUrls.users}/${follow}/followers/${_user.username}`);
  });

  _user.followers.forEach((follower) => {
    removals.push(`${Constants.database.user.baseUrls.users}/${follower}/follows/${_user.username}`);
  });

  _user.followRequests.forEach((followRequest) => {
    removals.push(`${Constants.database.user.baseUrls.users}/${followRequest}/follower_requests/${_user.username}`);
  });

  _user.followerRequests.forEach((followerRequest) => {
    removals.push(`${Constants.database.user.baseUrls.users}/${followerRequest}/follow_requests/${_user.username}`);
  });

  await Firebase.bulkRemove(removals);
};

module.exports = {
  get,
  create,
  remove,
  addFollow,
  getPassword,
  updateEmail,
  removeFollow,
  updatePassword,
  addFollowRequest,
  removeFollowRequest,
};

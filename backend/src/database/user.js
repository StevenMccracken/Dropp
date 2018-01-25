/**
 * @module for database interaction of users
 */

const Log = require('../logging/logger');
const User = require('../models/User');
const Utils = require('../utilities/utils');
const Firebase = require('../firebase/firebase');
const DroppError = require('../errors/DroppError');
const Validator = require('../utilities/validator');

/**
 * Logs a message about user database interaction
 * @param {String} _message the message to log
 * @param {String} _droppId the username of the user to access
 * @param {Boolean} _isPassword whether the log is about the user's password or not
 */
function log(_message, _username) {
  let extraMessage = '';
  if (Utils.hasValue(_username)) {
    extraMessage = ` user ${_username}`;
  }

  Log.log('Database', `${_message}${extraMessage}`);
}

const usersBaseUrl = '/users';
const passwordsBaseUrl = '/passwords';

/**
 * Retrieves a user from the database by their usenrame
 * @param {String} _username the unique username of the user
 * @return {User} the user
 * @throws {DroppError|Error}
 */
const get = async function get(_username) {
  const source = 'get()';
  log(source, _username);

  if (!Validator.isValidUsername(_username)) throw new DroppError({ invalidMember: 'username' });
  const json = await Firebase.get(`${usersBaseUrl}/${_username}`);

  if (!Utils.hasValue(json)) return null;
  json.username = _username;
  return new User(json);
};

/**
 * Adds a user to the database
 * @param {User} _user the user to add to the database
 * @throws {DroppError|Error} if the data in the user is invalid
 */
const add = async function add(_user) {
  const source = 'add()';
  log(source, '');

  if (!(_user instanceof User)) {
    throw new DroppError({ invalid_type: 'Object is not a User' });
  }

  const invalidMembers = [];
  if (!Validator.isValidEmail(_user.email)) invalidMembers.push('email');
  if (!Validator.isValidUsername(_user.username)) invalidMembers.push('username');

  if (invalidMembers.length > 0) {
    throw new DroppError({ invalidMembers });
  }

  await Firebase.update(`${usersBaseUrl}/${_user.username}`, _user.data);
};

/**
 * Adds a password for a given user to the database
 * @param {User} _user the user who the password belongs to
 * @param {String} _password the hashed password to add to the database
 * @throws {DroppError|Error}
 */
const addPassword = async function addPassword(_user, _password) {
  const source = 'addPassword()';
  log(source, _user.username);

  if (!(_user instanceof User)) {
    throw new DroppError({ invalid_type: 'Object is not a User' });
  }

  if (!Validator.isValidPassword(_password)) throw new DroppError({ invalidMember: 'password' });
  await Firebase.update(`${passwordsBaseUrl}/${_user.username}`, _password);
};

/**
 * Updates a given user's email
 * @param {User} _user the user to update
 * @param {String} _email the new email to update the user with
 * @throws {DroppError|Error}
 */
const updateEmail = async function updateEmail(_user, _email) {
  const source = 'updateEmail()';
  log(source, _user.username);

  if (!(_user instanceof User)) {
    throw new DroppError({ invalid_type: 'Object is not a User' });
  }

  if (!Validator.isValidEmail(_email)) throw new DroppError({ invalidMember: 'email' });
  await Firebase.update(`${usersBaseUrl}/${_user.username}/email`, _email);
  /* eslint-disable no-param-reassign */
  _user.email = _email;
  /* eslint-enable no-param-reassign */
};

/**
 * Adds a user to a given user's follow requests
 * @param {User} _user the user to add a follow request for
 * @param {User} _follow the user to be added to the given user's follow requests
 * @throws {DroppError|Error}
 */
const addFollowRequest = async function addFollowRequest(_user, _follow) {
  const source = 'addFollowRequest()';
  log(source, _user.username);

  if (!(_user instanceof User) || !(_follow instanceof User)) {
    throw new DroppError({ invalid_type: 'Object is not a User' });
  }

  await Firebase.update(`${usersBaseUrl}/${_user.username}/follow_requests/${_follow.username}`, _follow.username);
  _user.followRequests.push(_follow.username);
};

/**
 * Adds a user to a given user's follower requests
 * @param {User} _user the user to add a follower request for
 * @param {User} _follow the user to be added to the given user's follower requests
 * @throws {DroppError|Error}
 */
const addFollowerRequest = async function addFollowerRequest(_user, _follower) {
  const source = 'addFollowerRequest()';
  log(source, _user.username);

  if (!(_user instanceof User) || !(_follower instanceof User)) {
    throw new DroppError({ invalid_type: 'Object is not a User' });
  }

  await Firebase.update(`${usersBaseUrl}/${_user.username}/follower_requests/${_follower.username}`, _follower.username);
  _user.followerRequests.push(_follower.username);
};

/**
 * Adds a user to a given user's follows
 * @param {User} _user the user to add a follow for
 * @param {User} _follow the user to be added to the given user's follows
 * @throws {DroppError|Error}
 */
const addFollow = async function addFollow(_user, _follow) {
  const source = 'addFollow()';
  log(source, _user.username);

  if (!(_user instanceof User) || !(_follow instanceof User)) {
    throw new DroppError({ invalid_type: 'Object is not a User' });
  }

  await Firebase.update(`${usersBaseUrl}/${_user.username}/follows/${_follow.username}`, _follow.username);
  _user.follows.push(_follow.username);
};

/**
 * Adds a user to a given user's followers
 * @param {User} _user the user to add a follower for
 * @param {User} _follower the user to be added to the given user's followers
 * @throws {DroppError|Error}
 */
const addFollower = async function addFollower(_user, _follower) {
  const source = 'addFollower()';
  log(source, _user.username);

  if (!(_user instanceof User) || !(_follower instanceof User)) {
    throw new DroppError({ invalid_type: 'Object is not a User' });
  }

  await Firebase.update(`${usersBaseUrl}/${_user.username}/followers/${_follower.username}`, _follower.username);
  _user.followers.push(_follower.username);
};

/**
 * Removes a user from a given user's follow requests
 * @param {User} _user the user to remove the follow request from
 * @param {User} _follow the user to be removed from the given user's follow requests
 * @throws {DroppError|Error}
 */
const removeFollowRequest = async function removeFollowRequest(_user, _follow) {
  const source = 'removeFollowRequest()';
  log(source, _user.username);

  if (!(_user instanceof User) || !(_follow instanceof User)) {
    throw new DroppError({ invalid_type: 'Object is not a User' });
  }

  await Firebase.remove(`${usersBaseUrl}/${_user.username}/follow_requests/${_follow.username}`);
  const index = _user.followRequests.indexOf(_follow.username);
  if (index !== -1) {
    _user.followRequests.splice(index, 1);
  }
};

/**
 * Removes a user from a given user's follower requests
 * @param {User} _user the user to remove the follower request from
 * @param {User} _follow the user to be removed from the given user's follower requests
 * @throws {DroppError|Error}
 */
const removeFollowerRequest = async function removeFollowerRequest(_user, _follower) {
  const source = 'removeFollowerRequest()';
  log(source, _user.username);

  if (!(_user instanceof User) || !(_follower instanceof User)) {
    throw new DroppError({ invalid_type: 'Object is not a User' });
  }

  await Firebase.remove(`${usersBaseUrl}/${_user.username}/follower_requests/${_follower.username}`);
  const index = _user.followerRequests.indexOf(_follower.username);
  if (index !== -1) {
    _user.followerRequests.splice(index, 1);
  }
};

/**
 * Removes a user from a given user's follows
 * @param {User} _user the user to remove the follow from
 * @param {User} _follow the user to be removed from the given user's follows
 * @throws {DroppError|Error}
 */
const removeFollow = async function removeFollow(_user, _follow) {
  const source = 'removeFollow()';
  log(source, _user.username);

  if (!(_user instanceof User) || !(_follow instanceof User)) {
    throw new DroppError({ invalid_type: 'Object is not a User' });
  }

  await Firebase.remove(`${usersBaseUrl}/${_user.username}/follows/${_follow.username}`);
  const index = _user.follows.indexOf(_follow.username);
  if (index !== -1) {
    _user.follows.splice(index, 1);
  }
};

/**
 * Removes a user from a given user's followers
 * @param {User} _user the user to remove the follower from
 * @param {User} _follower the user to be removed from the given user's followers
 * @throws {DroppError|Error}
 */
const removeFollower = async function removeFollower(_user, _follower) {
  const source = 'removeFollower()';
  log(source, _user.username);

  if (!(_user instanceof User) || !(_follower instanceof User)) {
    throw new DroppError({ invalid_type: 'Object is not a User' });
  }

  await Firebase.remove(`${usersBaseUrl}/${_user.username}/followers/${_follower.username}`);
  const index = _user.followers.indexOf(_follower.username);
  if (index !== -1) {
    _user.followers.splice(index, 1);
  }
};

/**
 * Deletes a user from the database
 * @param {User} _user the user to delete
 * @throws {DroppError|Error}
 */
const remove = async function remove(_user) {
  const source = 'remove()';
  log(source, _user.username);

  if (!(_user instanceof User)) {
    throw new DroppError({ invalid_type: 'Object is not a User' });
  }

  await Firebase.remove(`${usersBaseUrl}/${_user.username}`);
};

/**
 * Deletes a user's password from the database
 * @param {User} _user the user for the password to delete
 * @throws {DroppError|Error}
 */
const removePassword = async function removePassword(_user) {
  const source = 'removePassword()';
  log(source, _user.username);

  if (!(_user instanceof User)) {
    throw new DroppError({ invalid_type: 'Object is not a User' });
  }

  await Firebase.remove(`${passwordsBaseUrl}/${_user.username}`);
};

module.exports = {
  get,
  add,
  remove,
  addFollow,
  addFollower,
  addPassword,
  updateEmail,
  removeFollow,
  removeFollower,
  removePassword,
  addFollowRequest,
  addFollowerRequest,
  removeFollowRequest,
  removeFollowerRequest,
  updatePassword: addPassword,
};

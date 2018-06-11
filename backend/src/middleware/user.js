/**
 * @module for User object interaction
 */

const User = require('../models/User');
const Log = require('../logging/logger');
const Utils = require('../utilities/utils');
const Auth = require('../authentication/auth');
const UserAccessor = require('../database/user');
const DroppError = require('../errors/DroppError');
const DroppAccessor = require('../database/dropp');
const Validator = require('../utilities/validator');
const Constants = require('../utilities/constants');

// Single user functions

/**
 * Retrieves a user by their username
 * @param {User} _currentUser the current user for the request
 * @param {Object} _details the information to get the user
 * @return {Object} the retrieved user, or
 * null if no user with that username exists
 * @throws {DroppError} if the _username parameter is not
 * a valid username or if no user by that username exists
 */
const get = async (_currentUser, _details) => {
  const source = 'get()';
  Log.log(Constants.middleware.user.moduleName, source, _currentUser, _details);

  if (!(_currentUser instanceof User)) {
    DroppError.throwServerError(source, null, Constants.errors.objectIsNot(Constants.params.User));
  }

  const details = Utils.hasValue(_details) ? _details : {};
  if (!Validator.isValidUsername(details.username)) {
    DroppError.throwInvalidRequestError(source, Constants.params.username);
  }

  const user = await UserAccessor.get(details.username);
  if (!Utils.hasValue(user)) DroppError.throwResourceDneError(source, Constants.params.user);
  return _currentUser.username === user.username ? user.privateData : user.publicData;
};

/**
 * Creates a new user with the given details
 * @param {Object} _details the information for the
 * user, including username, email, and password
 * @return {User} the created user
 * @throws {DroppError} if any of the details are
 * invalid, or if a user already exists with that username
 */
const create = async (_details) => {
  const source = 'create()';
  Log.log(Constants.middleware.user.moduleName, source, _details);

  const invalidMembers = [];
  const details = Utils.hasValue(_details) ? _details : {};
  if (!Validator.isValidEmail(details.email)) invalidMembers.push(Constants.params.email);
  if (!Validator.isValidUsername(details.username)) invalidMembers.push(Constants.params.username);
  if (!Validator.isValidPassword(details.password)) invalidMembers.push(Constants.params.password);
  if (invalidMembers.length > 0) DroppError.throwInvalidRequestError(source, invalidMembers);
  const existingUser = await UserAccessor.get(details.username);
  if (existingUser instanceof User) {
    DroppError.throwResourceError(
      source,
      Constants.middleware.user.messages.errors.usernameAlreadyExists
    );
  }

  const user = new User(details);
  const password = await Auth.hash(details.password);
  await UserAccessor.create(user, password);
  return user;
};

/**
 * Validates a given password for a given user,
 * and returns a JWT if the validation succeeds
 * @param {Object} _details the information for
 * the user, including username and password
 * @return {Object} a JSON containing the authentication token
 * @throws {DroppError} if the username or password
 * in _details is invalid, or if the validation fails
 */
const getAuthToken = async (_details) => {
  const source = 'getAuthToken()';
  Log.log(Constants.middleware.user.moduleName, source, _details);

  const invalidMembers = [];
  const details = Utils.hasValue(_details) ? _details : {};
  if (!Validator.isValidUsername(details.username)) invalidMembers.push(Constants.params.username);
  if (!Validator.isValidPassword(details.password)) invalidMembers.push(Constants.params.password);
  if (invalidMembers.length > 0) DroppError.throwInvalidRequestError(source, invalidMembers);
  const retrievedPassword = await UserAccessor.getPassword(details.username);
  if (!Validator.isValidPassword(retrievedPassword)) {
    DroppError.throwLoginError(source, null, `Retrieved password: ${retrievedPassword}`);
  }

  const passwordsMatch = await Auth.validatePasswords(details.password, retrievedPassword);
  if (!passwordsMatch) DroppError.throwLoginError(source);
  const user = await UserAccessor.get(details.username);
  if (!Utils.hasValue(user)) {
    DroppError.throwServerError(source, null, `Password was valid, but user was ${user}`);
  }

  const token = Auth.generateToken(user);
  const data = {
    success: {
      token: `${Constants.passport.Bearer} ${token}`,
      message: Constants.middleware.user.messages.success.authentication,
    },
  };

  return data;
};

/**
 * Creates a new user with the given details
 * @param {Object} _details the information for the
 * user, including username, email, and passwords
 * @return {Object} the success details, including an authentication token
 * @throws {Error} if any of the details are invalid,
 * or if a user already exists with that username
 */
const addNewUser = async (_details) => {
  const source = 'addNewUser()';
  Log.log(Constants.middleware.user.moduleName, source, _details);

  const user = await create(_details);
  const token = Auth.generateToken(user);
  const data = {
    success: {
      token: `${Constants.passport.Bearer} ${token}`,
      message: Constants.middleware.user.messages.success.createUser,
    },
  };

  return data;
};

/**
 * Updates a user's password
 * @param {User} _currentUser the current user for the request
 * @param {Object} _usernameDetails the details
 * containing the username of the user to update
 * @param {Object} _details the details containing
 * the old and new password to update to
 * @return {Object} the success details, including a new authentication token
 * @throws {DroppError} if the provided passwords are not valid,
 * if the current user does not match the requested user, or
 * if the given password does not match the existing password
 */
const updatePassword = async (_currentUser, _usernameDetails, _details) => {
  const source = 'updatePassword()';
  Log.log(Constants.middleware.user.moduleName, source, _currentUser, _usernameDetails, _details);

  if (!(_currentUser instanceof User)) {
    DroppError.throwServerError(source, null, Constants.errors.objectIsNot(Constants.params.User));
  }

  const invalidMembers = [];
  const details = Utils.hasValue(_details) ? _details : {};
  if (!Validator.isValidPassword(details.oldPassword)) {
    invalidMembers.push(Constants.params.oldPassword);
  }

  if (!Validator.isValidPassword(details.newPassword)) {
    invalidMembers.push(Constants.params.newPassword);
  }

  if (invalidMembers.length > 0) DroppError.throwInvalidRequestError(source, invalidMembers);
  if (details.oldPassword === details.newPassword) {
    DroppError.throwResourceError(source, Constants.errors.messages.newValueMustBeDifferent);
  }

  const usernameDetails = Utils.hasValue(_usernameDetails) ? _usernameDetails : {};
  if (_currentUser.username !== usernameDetails.username) {
    DroppError.throwResourceError(source, Constants.middleware.messages.unauthorizedAccess);
  }

  const retrievedPassword = await UserAccessor.getPassword(usernameDetails.username);
  if (!Validator.isValidPassword(retrievedPassword)) {
    DroppError.throwServerError(source, null, `Retrieved password: ${retrievedPassword}`);
  }

  const passwordsMatch = await Auth.validatePasswords(details.oldPassword, retrievedPassword);
  if (!passwordsMatch) {
    DroppError.throwResourceError(
      source,
      Constants.middleware.user.messages.errors.oldPasswordMustMatchExisting
    );
  }

  const hashedPassword = await Auth.hash(details.newPassword);
  await UserAccessor.updatePassword(_currentUser, hashedPassword);
  const token = Auth.generateToken(_currentUser);
  const data = {
    success: {
      token: `${Constants.passport.Bearer} ${token}`,
      message: Constants.middleware.user.messages.success.passwordUpdate,
    },
  };

  return data;
};

/**
 * Updates a user's email
 * @param {User} _currentUser the current user for the request
 * @param {Object} _usernameDetails the details
 * containing the username of the user to update
 * @param {Object} _details the details containing the new email
 * @return {Object} the success details
 * @throws {DroppError} if the provided email is invalid
 * or if the current user does not match the requested user
 */
const updateEmail = async (_currentUser, _usernameDetails, _details) => {
  const source = 'updateEmail()';
  Log.log(Constants.middleware.user.moduleName, source, _currentUser, _usernameDetails, _details);

  if (!(_currentUser instanceof User)) {
    DroppError.throwServerError(source, null, Constants.errors.objectIsNot(Constants.params.User));
  }

  const details = Utils.hasValue(_details) ? _details : {};
  if (!Validator.isValidEmail(details.newEmail)) {
    DroppError.throwInvalidRequestError(source, Constants.params.newEmail);
  }

  const usernameDetails = Utils.hasValue(_usernameDetails) ? _usernameDetails : {};
  if (_currentUser.username !== usernameDetails.username) {
    DroppError.throwResourceError(source, Constants.middleware.messages.unauthorizedAccess);
  }

  await UserAccessor.updateEmail(_currentUser, details.newEmail);
  const data = {
    success: {
      message: Constants.middleware.user.messages.success.emailUpdate,
    },
  };

  return data;
};

/**
 * Removes a user by their username
 * @param {User} _currentUser the current user for the request
 * @param {Object} _usernameDetails the details
 * containing the username of the user to remove
 * @return {Object} the success details
 * @throws {DroppError} if the given username is invalid, or if
 * the current user's username does not match the given username
 */
const remove = async (_currentUser, _usernameDetails) => {
  const source = 'remove()';
  Log.log(Constants.middleware.user.moduleName, source, _usernameDetails);

  if (!(_currentUser instanceof User)) {
    DroppError.throwServerError(source, null, Constants.errors.objectIsNot(Constants.params.User));
  }

  const usernameDetails = Utils.hasValue(_usernameDetails) ? _usernameDetails : {};
  if (!Validator.isValidUsername(usernameDetails.username)) {
    DroppError.throwInvalidRequestError(source, Constants.params.username);
  }

  if (_currentUser.username !== usernameDetails.username) {
    DroppError.throwResourceError(source, Constants.middleware.messages.unauthorizedAccess);
  }

  const user = await UserAccessor.get(usernameDetails.username);
  if (!Utils.hasValue(user)) {
    DroppError.throwServerError(
      source,
      null,
      `Current user was valid, but retrieved user was ${user}`
    );
  }

  await UserAccessor.remove(user);
  const dropps = await DroppAccessor.getAll();
  const droppsByUser = dropps.filter(dropp => dropp.username === usernameDetails.username);
  await DroppAccessor.bulkRemove(droppsByUser);
  const data = {
    success: {
      message: Constants.middleware.user.messages.success.remove,
    },
  };

  return data;
};

// Inter-user functions

/**
 * Adds a follow request from the current user to the given username
 * @param {User} _currentUser the current user for the request
 * @param {Object} _usernameDetails the details
 * containing the username of the user's follows requests
 * @param {Object} _requestedUserDetails the details
 * containing the username of the user to follow
 * @return {Object} the success details
 * @throws {DroppError} if the given username is invalid, or if
 * the current user already has a follow request/follows the user
 */
const requestToFollow = async (_currentUser, _usernameDetails, _requestedUserDetails) => {
  const source = 'requestToFollow()';
  Log.log(
    Constants.middleware.user.moduleName,
    source,
    _currentUser,
    _usernameDetails,
    _requestedUserDetails
  );

  if (!(_currentUser instanceof User)) {
    DroppError.throwServerError(source, null, Constants.errors.objectIsNot(Constants.params.User));
  }

  const usernameDetails = Utils.hasValue(_usernameDetails) ? _usernameDetails : {};
  const requestedUserDetails = Utils.hasValue(_requestedUserDetails) ? _requestedUserDetails : {};
  const invalidMembers = [];
  if (!Validator.isValidUsername(usernameDetails.username)) {
    invalidMembers.push(Constants.params.username);
  }

  if (!Validator.isValidUsername(requestedUserDetails.requestedUser)) {
    invalidMembers.push(Constants.params.requestedUser);
  }

  if (invalidMembers.length > 0) DroppError.throwInvalidRequestError(source, invalidMembers);
  if (_currentUser.username !== usernameDetails.username) {
    DroppError.throwResourceError(source, Constants.middleware.messages.unauthorizedAccess);
  }

  if (_currentUser.username === requestedUserDetails.requestedUser) {
    DroppError.throwResourceError(
      source,
      Constants.middleware.user.messages.errors.cannotRequestFollowSelf
    );
  }

  const user = await UserAccessor.get(requestedUserDetails.requestedUser);
  if (!Utils.hasValue(user)) DroppError.throwResourceDneError(source, Constants.params.user);
  if (user.hasFollowerRequest(_currentUser.username)) {
    DroppError.throwResourceError(
      source,
      Constants.middleware.user.messages.errors.alreadyHasFollowRequest
    );
  }

  await UserAccessor.addFollowRequest(_currentUser, user);
  const data = {
    success: {
      message: Constants.middleware.user.messages.success.followRequest,
    },
  };

  return data;
};

/**
 * Removes a follow request from the current user to the given username
 * @param {User} _currentUser the current user for the request
 * @param {Object} _usernameDetails the details containing
 * the username of the user's follow requests to access, and
 * the username of the user to remove the follow request for
 * @return {Object} the success details
 * @throws {DroppError} if the given username is invalid, if the current
 * user does not have a follow request, or already follows the user
 */
const removeFollowRequest = async (_currentUser, _usernameDetails) => {
  const source = 'removeFollowRequest()';
  Log.log(Constants.middleware.user.moduleName, source, _usernameDetails);

  if (!(_currentUser instanceof User)) {
    DroppError.throwServerError(source, null, Constants.errors.objectIsNot(Constants.params.User));
  }

  const invalidMembers = [];
  const usernameDetails = Utils.hasValue(_usernameDetails) ? _usernameDetails : {};
  if (!Validator.isValidUsername(usernameDetails.username)) {
    invalidMembers.push(Constants.params.username);
  }

  if (!Validator.isValidUsername(usernameDetails.requestedUser)) {
    invalidMembers.push(Constants.params.requestedUser);
  }

  if (invalidMembers.length > 0) DroppError.throwInvalidRequestError(source, invalidMembers);
  if (_currentUser.username !== usernameDetails.username) {
    DroppError.throwResourceError(source, Constants.middleware.messages.unauthorizedAccess);
  }

  if (_currentUser.username === usernameDetails.requestedUser) {
    DroppError.throwResourceError(
      source,
      Constants.middleware.user.messages.errors.cannotRemoveFollowSelf
    );
  }

  const user = await UserAccessor.get(usernameDetails.requestedUser);
  if (!Utils.hasValue(user)) DroppError.throwResourceDneError(source, Constants.params.user);
  if (!user.hasFollowerRequest(_currentUser.username)) {
    DroppError.throwResourceError(
      source,
      Constants.middleware.user.messages.errors.noPendingFollowRequest
    );
  }

  await UserAccessor.removeFollowRequest(_currentUser, user);
  const data = {
    success: {
      message: Constants.middleware.user.messages.success.followRequestRemoval,
    },
  };

  return data;
};

/**
 * Responds to a follower request for the current user from the given username
 * @param {User} _currentUser the current user for the request
 * @param {Object} _usernameDetails the details containing the
 * username of the user's follower requests to access, and the
 * username of the user to respond to the follower request for
 * @param {Object} _details the details containing accept parameter
 * @return {Object} the success details
 * @throws {DroppError} if the given username or accept parameter is invalid, if
 * the user already follows the current user, or if there is no follower request
 */
const respondToFollowerRequest = async (_currentUser, _usernameDetails, _details) => {
  const source = 'respondToFollowerRequest()';
  Log.log(Constants.middleware.user.moduleName, source, _currentUser, _usernameDetails, _details);

  if (!(_currentUser instanceof User)) {
    DroppError.throwServerError(source, null, Constants.errors.objectIsNot(Constants.params.User));
  }

  const invalidMembers = [];
  const details = Utils.hasValue(_details) ? _details : {};
  const usernameDetails = Utils.hasValue(_usernameDetails) ? _usernameDetails : {};
  if (!Validator.isValidUsername(usernameDetails.username)) {
    invalidMembers.push(Constants.params.username);
  }

  if (!Validator.isValidUsername(usernameDetails.requestedUser)) {
    invalidMembers.push(Constants.params.requestedUser);
  }

  if (!Validator.isValidBooleanString(details.accept)) invalidMembers.push(Constants.params.accept);
  if (invalidMembers.length > 0) DroppError.throwInvalidRequestError(source, invalidMembers);
  if (_currentUser.username !== usernameDetails.username) {
    DroppError.throwResourceError(source, Constants.middleware.messages.unauthorizedAccess);
  }

  if (_currentUser.username === usernameDetails.requestedUser) {
    DroppError.throwResourceError(
      source,
      Constants.middleware.user.messages.errors.cannotRespondRequestSelf
    );
  }

  const user = await UserAccessor.get(usernameDetails.requestedUser);
  if (!Utils.hasValue(user)) DroppError.throwResourceDneError(source, Constants.params.user);
  if (!user.hasFollowRequest(_currentUser.username)) {
    DroppError.throwResourceError(
      source,
      Constants.middleware.user.messages.errors.noFollowRequestFromUser
    );
  }

  let response;
  if (details.accept === 'true') {
    await UserAccessor.addFollow(user, _currentUser);
    response = Constants.params.acceptance;
  } else {
    await UserAccessor.removeFollowRequest(user, _currentUser);
    response = Constants.params.denial;
  }

  const data = {
    success: {
      message: Constants.middleware.user.messages.success.followRequestResponse(response),
    },
  };

  return data;
};

/**
 * Removes a follow from the current user to a given username
 * @param {User} _currentUser the current user for the request
 * @param {Object} _usernameDetails the details containing the username of
 * the user's follows to access, and the username of the user to unfollow
 * @return {Object} the success details
 * @throws {DroppError} if the given username is invalid,
 * or if the current user does not follow the given username
 */
const unfollow = async (_currentUser, _usernameDetails) => {
  const source = 'unfollow()';
  Log.log(Constants.middleware.user.moduleName, source, _usernameDetails);

  if (!(_currentUser instanceof User)) {
    DroppError.throwServerError(source, null, Constants.errors.objectIsNot(Constants.params.User));
  }

  const invalidMembers = [];
  const usernameDetails = Utils.hasValue(_usernameDetails) ? _usernameDetails : {};
  if (!Validator.isValidUsername(usernameDetails.username)) {
    invalidMembers.push(Constants.params.username);
  }

  if (!Validator.isValidUsername(usernameDetails.follow)) {
    invalidMembers.push(Constants.params.follow);
  }

  if (invalidMembers.length > 0) DroppError.throwInvalidRequestError(source, invalidMembers);
  if (_currentUser.username !== usernameDetails.username) {
    DroppError.throwResourceError(source, Constants.middleware.messages.unauthorizedAccess);
  }

  if (_currentUser.username === usernameDetails.follow) {
    DroppError.throwResourceError(
      source,
      Constants.middleware.user.messages.errors.cannotUnfollowSelf
    );
  }

  const user = await UserAccessor.get(usernameDetails.follow);
  if (!Utils.hasValue(user)) DroppError.throwResourceDneError(source, Constants.params.user);
  if (!user.hasFollower(_currentUser.username)) {
    DroppError.throwResourceError(
      source,
      Constants.middleware.user.messages.errors.doNotFollowUser
    );
  }

  await UserAccessor.removeFollow(_currentUser, user);
  const data = {
    success: {
      message: Constants.middleware.user.messages.success.unfollow,
    },
  };

  return data;
};

/**
 * Removes a follower for the current user from the given username
 * @param {User} _currentUser the current user for the request
 * @param {Object} _usernameDetails the details containing
 * the username of the user's followers to access, and
 * the username of the user to remove as a follower
 * @return {Object} the success details
 * @throws {DroppError} if the given username is invalid, or if
 * the current user does not have the given username as a follower
 */
const removeFollower = async (_currentUser, _usernameDetails) => {
  const source = 'removeFollower()';
  Log.log(Constants.middleware.user.moduleName, source, _currentUser, _usernameDetails);

  if (!(_currentUser instanceof User)) {
    DroppError.throwServerError(source, null, Constants.errors.objectIsNot(Constants.params.User));
  }

  const invalidMembers = [];
  const usernameDetails = Utils.hasValue(_usernameDetails) ? _usernameDetails : {};
  if (!Validator.isValidUsername(usernameDetails.username)) {
    invalidMembers.push(Constants.params.username);
  }

  if (!Validator.isValidUsername(usernameDetails.follower)) {
    invalidMembers.push(Constants.params.follower);
  }

  if (invalidMembers.length > 0) DroppError.throwInvalidRequestError(source, invalidMembers);
  if (_currentUser.username !== usernameDetails.username) {
    DroppError.throwResourceError(source, Constants.middleware.messages.unauthorizedAccess);
  }

  if (_currentUser.username === usernameDetails.follower) {
    DroppError.throwResourceError(
      source,
      Constants.middleware.user.messages.errors.cannotRemoveFollowerSelf
    );
  }

  const user = await UserAccessor.get(usernameDetails.follower);
  if (!Utils.hasValue(user)) DroppError.throwResourceDneError(source, Constants.params.user);
  if (!user.doesFollow(_currentUser.username)) {
    DroppError.throwResourceError(
      source,
      Constants.middleware.user.messages.errors.userDoesNotFollowYou
    );
  }

  await UserAccessor.removeFollow(user, _currentUser);
  const data = {
    success: {
      message: Constants.middleware.user.messages.success.removeFollower,
    },
  };

  return data;
};

module.exports = {
  get,
  getAuthToken,
  create,
  addNewUser,
  updateEmail,
  updatePassword,
  remove,
  requestToFollow,
  removeFollowRequest,
  respondToFollowerRequest,
  unfollow,
  removeFollower,
};

/**
 * @module for Dropp object interaction
 */

const User = require('../models/User');
const Log = require('../logging/logger');
const Media = require('../media/media');
const Dropp = require('../models/Dropp');
const Utils = require('../utilities/utils');
const Location = require('../models/Location');
const UserAccessor = require('../database/user');
const DroppError = require('../errors/DroppError');
const CloudStorage = require('../storage/storage');
const DroppAccessor = require('../database/dropp');
const ErrorAccessor = require('../database/error');
const Validator = require('../utilities/validator');
const Constants = require('../utilities/constants');
const StorageError = require('../errors/StorageError');

/**
 * Retrieves all dropps and returns a given filtered result
 * @param {Function} filter the criteria used for filtering all dropps on
 * @return {Object} JSON containing the count of the filtered
 * dropps, and a list of the public data of each dropp
 */
const filterAllDropps = async (filter) => {
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
const get = async (_currentUser, _details) => {
  const source = 'get()';
  Log.log(Constants.middleware.dropp.moduleName, source, _currentUser, _details);

  if (!(_currentUser instanceof User)) {
    DroppError.throwServerError(source, null, Constants.errors.objectIsNot(Constants.params.User));
  }

  const details = Utils.hasValue(_details) ? _details : {};
  if (!Validator.isValidFirebaseId(details.id)) {
    DroppError.throwInvalidRequestError(source, Constants.params.id);
  }

  const dropp = await DroppAccessor.get(details.id);
  if (!Utils.hasValue(dropp)) DroppError.throwResourceDneError(source, Constants.params.dropp);
  return dropp.publicData;
};

/**
 * Retrieves a photo for a dropp by it's ID
 * @param {User} _currentUser the current user for the request
 * @param {Object} _details the information to get the dropp
 * @return {Object} the retrieved dropp's photo data
 * @throws {DroppError} if the `id` parameter is not
 * a valid dropp ID or if no dropp by that ID exists
 */
const getPhoto = async (_currentUser, _details) => {
  const source = 'getPhoto()';
  Log.log(Constants.middleware.dropp.moduleName, source, _currentUser, _details);

  const dropp = await get(_currentUser, _details);
  if (dropp.media === false) {
    DroppError.throwResourceError(source, Constants.middleware.dropp.messages.errors.noMedia);
  }

  const result = await CloudStorage.get(Constants.middleware.dropp.cloudStorageFolder, dropp.id);
  return { success: result };
};

/**
 * Retrieves dropps created by a user
 * @param {User} _currentUser the current user for the request
 * @param {Object} _details the information
 * containing the user's dropps to retrieve
 * @return {Object} count of dropps retrieved, and a list of those dropps
 */
const getByUser = async (_currentUser, _details) => {
  const source = 'getByUser()';
  Log.log(Constants.middleware.dropp.moduleName, source, _currentUser, _details);

  if (!(_currentUser instanceof User)) {
    DroppError.throwServerError(source, null, Constants.errors.objectIsNot(Constants.params.User));
  }

  const details = Utils.hasValue(_details) ? _details : {};
  if (!Validator.isValidUsername(details.username)) {
    DroppError.throwInvalidRequestError(source, Constants.params.username);
  }

  const user = await UserAccessor.get(details.username);
  if (!Utils.hasValue(user)) DroppError.throwResourceDneError(source, Constants.params.user);

  // Make sure current user is retrieving their own dropps or one of their follow's dropps
  if (_currentUser.username !== user.username && !user.hasFollower(_currentUser.username)) {
    DroppError.throwResourceError(source, Constants.middleware.messages.mustFollowUser);
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
const getByFollows = async (_currentUser, _details) => {
  const source = 'getByFollows()';
  Log.log(Constants.middleware.dropp.moduleName, source, _currentUser, _details);

  if (!(_currentUser instanceof User)) {
    DroppError.throwServerError(source, null, Constants.errors.objectIsNot(Constants.params.User));
  }

  const details = Utils.hasValue(_details) ? _details : {};
  if (!Validator.isValidUsername(details.username)) {
    DroppError.throwInvalidRequestError(source, Constants.params.username);
  }

  if (_currentUser.username !== details.username) {
    DroppError.throwResourceError(source, Constants.middleware.messages.unauthorizedAccess);
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
 * Retrieves dropps created within a 1000 meter radius of a given location
 * @param {User} _currentUser the current user for the request
 * @param {Object} _details the information
 * containing the location to search around
 * @return {Object} count of dropps retrieved, and a list of those dropps
 */
const getByLocation = async (_currentUser, _details) => {
  const source = 'getByLocation()';
  Log.log(Constants.middleware.dropp.moduleName, source, _currentUser, _details);

  if (!(_currentUser instanceof User)) {
    DroppError.throwServerError(source, null, Constants.errors.objectIsNot(Constants.params.User));
  }

  const details = Utils.hasValue(_details) ? _details : {};
  if (!Validator.isValidLocation(`${details.latitude},${details.longitude}`)) {
    DroppError.throwInvalidRequestError(
      source,
      [Constants.params.latitude, Constants.params.longitude]
    );
  }

  const coordinates = {
    latitude: parseFloat(details.latitude),
    longitude: parseFloat(details.longitude),
  };

  const location = new Location(coordinates);
  const result = await filterAllDropps(dropp =>
    location.distance(dropp.location) <= Constants.middleware.dropp.maxDistanceMeters);
  return { success: result };
};

/**
 * Creates a new dropp
 * @param {User} _currentUser the current user for the request
 * @param {Object} _details the information containing the new dropp details
 * @return {Object} success message and the new dropp's ID
 */
const create = async (_currentUser, _details) => {
  const source = 'create()';
  Log.log(Constants.middleware.dropp.moduleName, source, _currentUser, _details);

  if (!(_currentUser instanceof User)) {
    DroppError.throwServerError(source, null, Constants.errors.objectIsNot(Constants.params.User));
  }

  let hasMedia = false;
  const invalidMembers = [];
  const details = Utils.hasValue(_details) ? _details : {};
  if (!Validator.isValidTextPost(details.text)) invalidMembers.push(Constants.params.text);
  if (Validator.isValidBooleanString(details.media)) {
    hasMedia = details.media === Constants.params.true;
    if (hasMedia && !Validator.isValidBase64Media(details.base64Data)) {
      invalidMembers.push(Constants.params.base64Data);
    }
  } else invalidMembers.push(Constants.params.media);

  let validLatitude;
  let validLongitude;
  if (Utils.hasValue(details.location)) {
    const { latitude, longitude } = details.location;
    if (Validator.isValidNumberString(latitude)) validLatitude = parseFloat(latitude);
    else invalidMembers.push(Constants.params.latitude);

    if (Validator.isValidNumberString(longitude)) validLongitude = parseFloat(longitude);
    else invalidMembers.push(Constants.params.longitude);
  } else invalidMembers.push(Constants.params.location);

  if (invalidMembers.length > 0) DroppError.throwInvalidRequestError(source, invalidMembers);
  if (!hasMedia && details.text.toString().trim().length === 0) {
    DroppError.throwResourceError(
      source,
      Constants.middleware.dropp.messages.errors.mustContainText
    );
  }

  const location = new Location({
    latitude: validLatitude,
    longitude: validLongitude,
  });

  const droppInfo = {
    text: details.text.trim(),
    media: hasMedia,
    username: _currentUser.username,
    timestamp: Utils.currentUnixSeconds(),
    location,
  };

  const dropp = await DroppAccessor.add(new Dropp(droppInfo));
  const result = {
    success: {
      dropp: dropp.publicData,
      message: Constants.middleware.dropp.messages.success.createDropp,
    },
  };

  if (hasMedia) {
    try {
      await CloudStorage.addString(
        Constants.middleware.dropp.cloudStorageFolder,
        dropp.id,
        details.base64Data
      );
    } catch (uploadError) {
      // Indicate partial-failure and log error asynchronously
      result.mediaUploadError = StorageError.type.Unknown;
      ErrorAccessor.add(uploadError);
    }
  }

  return result;
};

/**
 * Adds a photo for a given dropp
 * @param {User} _currentUser the current user for the request
 * @param {Object} _details the information containing
 * new dropp's ID and file path for the photo to be added
 * @return {Object} success message
 */
const addPhoto = async (_currentUser, _details) => {
  const source = 'addPhoto()';
  Log.log(Constants.middleware.dropp.moduleName, source, _currentUser, _details);

  if (!(_currentUser instanceof User)) {
    DroppError.throwServerError(source, null, Constants.errors.objectIsNot(Constants.params.User));
  }

  const invalidMembers = [];
  const details = Utils.hasValue(_details) ? _details : {};
  if (!Validator.isValidFirebaseId(details.id)) invalidMembers.push(Constants.params.id);
  if (!(await Validator.isValidFilePath(details.filePath))) {
    invalidMembers.push(Constants.params.media);
  }

  if (invalidMembers.length > 0) {
    DroppError.throwInvalidRequestError(source, invalidMembers);
  }

  const mimeType = await Media.determineMimeType(details.filePath);
  if (mimeType !== Constants.media.mimeTypes.png && mimeType !== Constants.media.mimeTypes.jpeg) {
    await Utils.deleteLocalFile(details.filePath);
    DroppError.throwResourceError(
      source,
      Constants.middleware.dropp.messages.errors.invalidMediaType
    );
  }

  const dropp = await DroppAccessor.get(details.id);
  if (!Utils.hasValue(dropp)) {
    await Utils.deleteLocalFile(details.filePath);
    DroppError.throwResourceDneError(source, Constants.params.dropp);
  }

  if (dropp.username !== _currentUser.username) {
    await Utils.deleteLocalFile(details.filePath);
    DroppError.throwResourceError(source, Constants.middleware.messages.unauthorizedAccess);
  }

  if (dropp.media === false) {
    await Utils.deleteLocalFile(details.filePath);
    DroppError.throwResourceError(
      source,
      Constants.middleware.dropp.messages.errors.cannotHaveMedia
    );
  }

  try {
    await CloudStorage.add(
      Constants.middleware.dropp.cloudStorageFolder,
      dropp.id,
      details.filePath
    );
  } catch (uploadError) {
    await Utils.deleteLocalFile(details.filePath);
    if (
      uploadError instanceof DroppError
      && uploadError.details.error.type === DroppError.type.Resource.type
    ) {
      // Throw error with clearer message
      DroppError.throwResourceError(
        source,
        Constants.middleware.dropp.messages.errors.mediaAlreadyAdded
      );
    }

    // Re-throw caught error
    throw uploadError;
  }

  const result = {
    success: {
      message: Constants.middleware.dropp.messages.success.addMedia,
    },
  };

  return result;
};

/**
 * Updates an existing dropp's text content
 * @param {User} _currentUser the current user for the request
 * @param {Object} _details the information containing the new dropp text
 * @return {Object} JSON containing the success message
 */
const updateText = async (_currentUser, _details) => {
  const source = 'updateText()';
  Log.log(Constants.middleware.dropp.moduleName, source, _currentUser, _details);

  if (!(_currentUser instanceof User)) {
    DroppError.throwServerError(source, null, Constants.errors.objectIsNot(Constants.params.User));
  }

  const invalidMembers = [];
  const details = Utils.hasValue(_details) ? _details : {};
  if (!Validator.isValidFirebaseId(details.id)) invalidMembers.push(Constants.params.id);
  if (!Validator.isValidTextPost(details.newText)) invalidMembers.push(Constants.params.newText);
  if (invalidMembers.length > 0) {
    DroppError.throwInvalidRequestError(source, invalidMembers);
  }

  const dropp = await DroppAccessor.get(details.id);
  if (!Utils.hasValue(dropp)) DroppError.throwResourceDneError(source, Constants.params.dropp);
  if (dropp.username !== _currentUser.username) {
    DroppError.throwResourceError(source, Constants.middleware.messages.unauthorizedAccess);
  }

  const newText = details.newText.toString().trim();
  if (dropp.text === newText) {
    DroppError.throwResourceError(source, Constants.errors.messages.newValueMustBeDifferent);
  }

  if (dropp.media === false && newText.length === 0) {
    DroppError.throwResourceError(
      source,
      Constants.middleware.dropp.messages.errors.mustContainText
    );
  }

  await DroppAccessor.updateText(dropp, newText);
  const result = {
    success: {
      message: Constants.middleware.dropp.messages.success.textUpdate,
    },
  };

  return result;
};

/**
 * Removes a dropp
 * @param {User} _currentUser the current user for the request
 * @param {Object} _details the information containing the dropp to remove
 * @return {Object} JSON containing the success message
 */
const remove = async (_currentUser, _details) => {
  const source = 'remove()';
  Log.log(Constants.middleware.dropp.moduleName, source, _currentUser, _details);

  if (!(_currentUser instanceof User)) {
    DroppError.throwServerError(source, null, Constants.errors.objectIsNot(Constants.params.User));
  }

  const details = Utils.hasValue(_details) ? _details : {};
  if (!Validator.isValidFirebaseId(details.id)) {
    DroppError.throwInvalidRequestError(source, Constants.params.id);
  }

  const dropp = await DroppAccessor.get(details.id);
  if (!Utils.hasValue(dropp)) DroppError.throwResourceDneError(source, Constants.params.dropp);
  if (dropp.username !== _currentUser.username) {
    DroppError.throwResourceError(source, Constants.middleware.messages.unauthorizedAccess);
  }

  await DroppAccessor.remove(dropp);
  const result = {
    success: {
      message: Constants.middleware.dropp.messages.success.removeDropp,
    },
  };

  if (dropp.media === true) {
    try {
      await CloudStorage.remove(Constants.middleware.dropp.cloudStorageFolder, dropp.id);
    } catch (removePhotoError) {
      // Indicate partial-failure and log error asynchronously
      result.mediaRemovalError = StorageError.type.Unknown;
      ErrorAccessor.add(removePhotoError);
    }
  }

  return result;
};

module.exports = {
  get,
  create,
  remove,
  addPhoto,
  getPhoto,
  getByUser,
  updateText,
  getByFollows,
  getByLocation,
  filter: filterAllDropps,
};

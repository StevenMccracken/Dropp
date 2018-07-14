/**
 * @module for database access of dropps
 */

const Log = require('../logging/logger');
const Dropp = require('../models/Dropp');
const Utils = require('../utilities/utils');
const Location = require('../models/Location');
const Firebase = require('../firebase/firebase');
const DroppError = require('../errors/DroppError');
const Validator = require('../utilities/validator');
const Constants = require('../utilities/constants');

/**
 * Retrieves a dropp from the database by it's ID
 * @param {String} _id the unique ID of the dropp
 * @return {Dropp} the dropp
 * @throws {DroppError|ModelError}
 */
const get = async (_id) => {
  const source = 'get()';
  Log.log(Constants.database.dropp.moduleName, source, _id);

  if (typeof _id !== 'string') {
    DroppError.throwServerError(source, null, 'Dropp ID is not a string');
  }

  if (_id === Constants.database.dropp.forbiddenDroppId) return null;
  const details = await Firebase.get(`${Constants.database.dropp.baseUrl}/${_id}`);

  if (!Utils.hasValue(details)) return null;
  const dropp = new Dropp(details);
  dropp.id = _id;
  return dropp;
};

/**
 * Gets all the dropps from the database
 * @return {[Dropp]} list of dropps
 * @throws {DroppError|Error}
 */
const getAll = async () => {
  const source = 'getAll()';
  Log.log(Constants.database.dropp.moduleName, source);

  const json = await Firebase.get(Constants.database.dropp.baseUrl);
  if (!Utils.hasValue(json)) return [];

  const dropps = [];
  Object.entries(json).forEach(([key, value]) => {
    if (key === Constants.database.dropp.forbiddenDroppId) return;
    if (!Utils.hasValue(value)) return;
    /* eslint-disable no-param-reassign */
    value.id = key;
    /* eslint-enable no-param-reassign */
    dropps.push(new Dropp(value));
  });

  return dropps;
};

/**
 * Adds a dropp to the database
 * @param {Dropp} _dropp the dropp to add to the database
 * @return {Dropp} the same dropp object with it's unique ID added
 * @throws {DroppError|Error} if the data in the dropp is invalid
 */
const add = async (_dropp) => {
  const source = 'add()';
  Log.log(Constants.database.dropp.moduleName, source, _dropp);

  if (!(_dropp instanceof Dropp)) {
    DroppError.throwServerError(source, null, Constants.errors.objectIsNot(Constants.params.Dropp));
  }

  const invalidMembers = [];
  if (!Validator.isValidTextPost(_dropp.text)) invalidMembers.push('text');
  if (!Validator.isValidBoolean(_dropp.media)) invalidMembers.push('media');
  if (!(_dropp.location instanceof Location)) invalidMembers.push('location');
  if (!Validator.isValidUsername(_dropp.username)) invalidMembers.push('username');
  if (!Validator.isValidTimestamp(_dropp.timestamp)) invalidMembers.push('timestamp');
  if (invalidMembers.length > 0) DroppError.throwInvalidRequestError(source, invalidMembers);

  const droppUrl = await Firebase.add(Constants.database.dropp.baseUrl, _dropp.databaseData);
  const id = droppUrl.split('/').pop();

  /* eslint-disable no-param-reassign */
  _dropp.id = id;
  /* eslint-enable no-param-reassign */
  return _dropp;
};

/**
 * Updates a given dropp's text
 * @param {Dropp} _dropp the dropp to update
 * @param {String} _text the new text to update the dropp with
 * @throws {DroppError|Error}
 */
const updateText = async (_dropp, _text) => {
  const source = 'updateText()';
  Log.log(Constants.database.dropp.moduleName, source, _dropp, _text);

  if (!(_dropp instanceof Dropp)) {
    DroppError.throwServerError(source, null, Constants.errors.objectIsNot(Constants.params.Dropp));
  }

  if (!Validator.isValidTextPost(_text)) DroppError.throwInvalidRequestError(source, 'text');
  await Firebase.update(`${Constants.database.dropp.baseUrl}/${_dropp.id}/text`, _text);
  /* eslint-disable no-param-reassign */
  _dropp.text = _text;
  /* eslint-enable no-param-reassign */
};

/**
 * Deletes a dropp from the database
 * @param {Dropp} _dropp the dropp to delete
 * @throws {DroppError|Error}
 */
const remove = async (_dropp) => {
  const source = 'remove()';
  Log.log(Constants.database.dropp.moduleName, source, _dropp);

  if (!(_dropp instanceof Dropp)) {
    DroppError.throwServerError(source, null, Constants.errors.objectIsNot(Constants.params.Dropp));
  }

  await Firebase.remove(`${Constants.database.dropp.baseUrl}/${_dropp.id}`);
};

/**
 * Deletes dropps from the database in bulk
 * @param {[Dropp]} _dropps the dropps to delete
 * @throws {DroppError|Error}
 */
const bulkRemove = async (_dropps) => {
  const source = 'bulkRemove()';
  Log.log(Constants.database.dropp.moduleName, source, _dropps);

  if (!Array.isArray(_dropps)) {
    DroppError.throwServerError(source, null, `Expected an array of dropps but got ${_dropps}`);
  }

  const removals = [];
  _dropps.forEach((dropp) => {
    if (!(dropp instanceof Dropp)) {
      DroppError.throwServerError(
        source,
        null,
        Constants.errors.objectIsNot(Constants.params.Dropp)
      );
    }

    if (Utils.hasValue(dropp.id)) removals.push(`${Constants.database.dropp.baseUrl}/${dropp.id}`);
  });

  if (removals.length > 0) await Firebase.bulkRemove(removals);
};

module.exports = {
  get,
  add,
  getAll,
  remove,
  bulkRemove,
  updateText,
};

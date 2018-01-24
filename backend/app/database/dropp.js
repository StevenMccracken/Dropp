/**
 * @module for database interaction of dropps
 */

const Log = require('../logging/logger');
const Dropp = require('../models/Dropp');
const Utils = require('../utilities/utils');
const Firebase = require('../firebase/firebase');
const DroppError = require('../errors/DroppError');
const Validator = require('../utilities/validator');

/**
 * Logs a message about dropp database interaction
 * @param {String} _message the message to log
 * @param {String} _droppId the ID of the dropp to access
 */
function log(_message, _droppId) {
  let extraMessage = '';
  if (Utils.hasValue(_droppId)) {
    extraMessage = ` dropp ${_droppId}`;
  }

  Log.log('Database', `${_message}${extraMessage}`);
}

const baseUrl = '/dropps';

/**
 * Retrieves a dropp from the database by it's ID
 * @param {String} _id the unique ID of the dropp
 * @return {Dropp} the dropp
 * @throws {DroppError|Error}
 */
const get = async function get(_id) {
  const source = 'get()';
  log(source, _id);

  const json = await Firebase.get(`${baseUrl}/${_id}`);
  return Utils.hasValue(json) ? new Dropp(json) : null;
};

/**
 * Adds a dropp to the database
 * @param {Dropp} _dropp the dropp to add to the database
 * @return {Dropp} the same dropp object with it's unique ID added
 * @throws {DroppError|Error} if the data in the dropp is invalid
 */
const add = async function add(_dropp) {
  const source = 'add()';
  log(source, '');

  if (!(_dropp instanceof Dropp)) {
    throw new DroppError({ invalid_type: 'Object is not a Dropp' });
  }

  const invalidMembers = [];
  if (!Validator.isValidTextPost(_dropp.text)) invalidMembers.push('text');
  if (!Validator.isValidBooleanString(_dropp.media)) invalidMembers.push('media');
  if (!Validator.isValidLocation(_dropp.location)) invalidMembers.push('location');
  if (!Validator.isValidUsername(_dropp.username)) invalidMembers.push('username');
  if (!Validator.isValidTimestamp(_dropp.timestamp)) invalidMembers.push('timestamp');

  if (invalidMembers.length > 0) {
    throw new DroppError({ invalidMembers });
  }

  const droppUrl = await Firebase.add(baseUrl, _dropp.data);
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
const updateText = async function updateText(_dropp, _text) {
  const source = 'updateText()';
  log(source, _dropp.id);

  if (!(_dropp instanceof Dropp)) {
    throw new DroppError({ invalid_type: 'Object is not a Dropp' });
  }

  if (!Validator.isValidTextPost(_text)) throw new DroppError({ invalidMember: 'text' });
  await Firebase.update(`${baseUrl}/${_dropp.id}/text`, _text);
  /* eslint-disable no-param-reassign */
  _dropp.text = _text;
  /* eslint-enable no-param-reassign */
};

/**
 * Deletes a dropp from the database
 * @param  {Dropp} _dropp the dropp to delete
 * @throws {DroppError|Error}
 */
const remove = async function remove(_dropp) {
  const source = 'delete()';
  log(source, _dropp.id);

  if (!(_dropp instanceof Dropp)) {
    throw new DroppError({ invalid_type: 'Object is not a Dropp' });
  }

  await Firebase.remove(`${baseUrl}/${_dropp.id}`);
};

module.exports = {
  get,
  add,
  remove,
  updateText,
};

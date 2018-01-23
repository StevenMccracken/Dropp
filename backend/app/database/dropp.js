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
 * Adds a dropp to the database with the given data
 * @param {Object} _data JSON containing the following members:
 *  location: a string of two floating-point values, separated
 *    by a comma with no extra whitespace
 *  timestamp: a positive integer
 *  username: a string
 *  text: a string
 *  media: a boolean
 * @return {String} the unique dropp ID for the created dropp
 * @throws {DroppError|Error} if one of the
 * required members in the data is missing
 */
const add = async function add(_data) {
  const source = 'add()';
  log(source, '');

  const invalidMembers = [];
  if (!Validator.isValidLocation(_data.location)) invalidMembers.push('location');
  if (!Validator.isValidTimestamp(_data.timestamp)) invalidMembers.push('timestamp');
  if (!Validator.isValidUsername(_data.username)) invalidMembers.push('username');
  if (!Validator.isValidTextPost(_data.text)) invalidMembers.push('text');
  if (!Validator.isValidBooleanString(_data.media)) invalidMembers.push('media');

  if (invalidMembers.length > 0) {
    throw new DroppError({ invalidMembers });
  }

  const droppUrl = await Firebase.add(baseUrl, _data);
  const droppId = droppUrl.split('/').pop();
  return droppId;
};

/**
 * Updates an entire dropp with a new set of data
 * @param {String} _id the unique ID of the dropp to update
 * @param {Object} _data JSON containing the following members:
 *  location: a string of two floating-point values, separated
 *    by a comma with no extra whitespace
 *  timestamp: a positive integer
 *  username: a string
 *  text: a string
 *  media: a boolean
 * @throws {DroppError|Error}
 */
const update = async function update(_id, _data) {
  const source = 'update()';
  log(source, _id);

  const invalidMembers = [];
  if (!Utils.hasValue(_data.location)) invalidMembers.append('location');
  if (!Utils.hasValue(_data.timestamp)) invalidMembers.append('timestamp');
  if (!Utils.hasValue(_data.username)) invalidMembers.append('username');
  if (!Utils.hasValue(_data.text)) invalidMembers.append('text');
  if (!Utils.hasValue(_data.media)) invalidMembers.append('media');

  if (invalidMembers.length > 0) {
    throw new DroppError({ invalidMembers });
  }

  await Firebase.update(`${baseUrl}/${_id}`, _data);
};

/**
 * Updates a given dropp's text
 * @param {String} _id the unique ID of the dropp to update
 * @param {String} _text the new text to update the dropp with
 * @throws {DroppError|Error}
 */
const updateText = async function updateText(_id, _text) {
  const source = 'updateText()';
  log(source, _id);

  if (!Utils.hasValue(_text)) throw new DroppError({ invalidMember: 'text' });
  await Firebase.update(`${baseUrl}/${_id}/text`, _text);
};

/**
 * Deletes a dropp from the database by it's ID
 * @param  {String} _id the unique ID of the dropp
 * @throws {DroppError|Error}
 */
const remove = async function remove(_id) {
  const source = 'delete()';
  log(source, _id);

  await Firebase.remove(`${baseUrl}/${_id}`);
};

module.exports = {
  get,
  add,
  update,
  remove,
  updateText,
};

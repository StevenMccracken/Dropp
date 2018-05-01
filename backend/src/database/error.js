/**
 * @module for database access of error logs
 */

const Log = require('../logging/logger');
const Utils = require('../utilities/utils');
const Firebase = require('../firebase/firebase');

/**
 * Logs a message about error log database interaction
 * @param {String} _message the message to log
 */
function log(_message) {
  Log.log('Error Accessor', _message);
}

const baseUrl = '/errorLogs';

/**
 * Gets an error log from the database
 * @param {String} _id the ID of the log to retrieve
 * @return {Object} the error details, null if _id
 * is not a string, or undefined if an error occurs
 */
const get = async function get(_id) {
  const source = 'get()';
  log(source, _id);

  if (typeof _id !== 'string') return null;
  let result;
  try {
    result = await Firebase.get(`${baseUrl}/${_id}`);
  } catch (error) {
    log(source, JSON.stringify(error));
  }

  return result;
};

/**
 * Adds a new error log to the database
 * @param {Object} _info the error log to add to the database
 * @return {String} the ID of the uploaded
 * error log, or undefined if an error occurred
 */
const add = async function add(_info) {
  const source = 'add()';
  log(source, 'Uploading error info...');

  if (!Utils.hasValue(_info)) return undefined;
  let id;
  try {
    const url = await Firebase.add(baseUrl, _info);
    id = url.split('/').pop();
  } catch (error) {
    log(source, JSON.stringify(error));
  }

  return id;
};

/**
 * Removes an error log from the database
 * @param {String} _id the ID of the error log to remove
 */
const remove = async function remove(_id) {
  const source = 'remove()';
  log(source, _id);

  if (typeof _id !== 'string') return;
  try {
    await Firebase.remove(`${baseUrl}/${_id}`);
  } catch (error) {
    log(source, JSON.stringify(error));
  }
};

module.exports = {
  get,
  add,
  remove,
};

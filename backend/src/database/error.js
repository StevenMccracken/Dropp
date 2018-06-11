/**
 * @module for database access of error logs
 */

const Log = require('../logging/logger');
const Utils = require('../utilities/utils');
const Firebase = require('../firebase/firebase');
const Constants = require('../utilities/constants');

/**
 * Gets an error log from the database
 * @param {String} _id the ID of the log to retrieve
 * @return {Object} the error details, null if _id
 * is not a string, or undefined if an error occurs
 */
const get = async (_id) => {
  const source = 'get()';
  Log.log(Constants.database.error.moduleName, source, _id);

  if (typeof _id !== 'string') return null;
  let result;
  try {
    result = await Firebase.get(`${Constants.database.error.baseUrl}/${_id}`);
  } catch (error) {
    Log.log(Constants.database.error.moduleName, source, error);
  }

  return result;
};

/**
 * Adds a new error log to the database
 * @param {Object} _info the error log to add to the database
 * @return {String} the ID of the uploaded
 * error log, or undefined if an error occurred
 */
const add = async (_info) => {
  const source = 'add()';
  Log.log(Constants.database.error.moduleName, source, _info);

  if (!Utils.hasValue(_info)) return undefined;
  let id;
  try {
    /* eslint-disable no-param-reassign */
    _info.environment = process.env.DROPP_ENV;
    /* eslint-enable no-param-reassign */
    const url = await Firebase.add(Constants.database.error.baseUrl, _info);
    id = url.split('/').pop();
  } catch (error) {
    Log.log(Constants.database.error.moduleName, source, error);
  }

  return id;
};

/**
 * Removes an error log from the database
 * @param {String} _id the ID of the error log to remove
 */
const remove = async (_id) => {
  const source = 'remove()';
  Log.log(Constants.database.error.moduleName, source, _id);

  if (typeof _id !== 'string') return;
  try {
    await Firebase.remove(`${Constants.database.error.baseUrl}/${_id}`);
  } catch (error) {
    Log.log(Constants.database.error.moduleName, source, error);
  }
};

module.exports = {
  get,
  add,
  remove,
};

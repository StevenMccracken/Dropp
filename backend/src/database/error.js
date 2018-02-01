/**
 * @module for database access of error logs
 */

const Log = require('../logging/logger');
const Firebase = require('../firebase/firebase');

/**
 * Logs a message about error log database interaction
 * @param {String} _message the message to log
 */
function log(_message) {
  Log.log('Error log accessor', _message);
}

const baseUrl = '/errorLogs';

/**
 * Adds a new error log to the database
 * @param {Object} _info the error log to add to the database
 */
const add = async function add(_info = {}) {
  const source = 'add()';
  log(source, '');

  try {
    Firebase.add(baseUrl, _info);
  } catch (error) {
    log(source, JSON.stringify(error));
  }
};

module.exports = {
  add,
};

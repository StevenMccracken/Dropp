/**
 * user_mod - @module for interacting with user data from the database
 */

const LOG = require('./log_mod');
const FIREBASE = require('./firebase_mod');

/**
 * remove - Deletes a user from the user's table
 * @param {String} _username the username of the desired user
 * @param {callback} _callback the callback to return the result
 * @param {callback} _errorCallback the callback to return any errors
 */
var remove = function(_username, _callback, _errorCallback) {
  const SOURCE = 'remove()';
  log(SOURCE);

  FIREBASE.DELETE(
    `/users/${_username}`,
    () => _callback(),
    deleteUserError => _errorCallback(deleteUserError)
  );
};

module.exports = {
  remove: remove,
};

/**
 * log - Logs a message to the server console
 * @param {String} _message the log message
 * @param {Object} _request the HTTP request
 */
function log(_message, _request) {
  LOG.log('User Module', _message, _request);
}

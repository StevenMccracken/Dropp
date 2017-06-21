/**
 * log_mod - @module for server logging to the console
 */

/**
 * log - Logs a detailed message to the server console
 * @param {String} _source the origin of the log event
 * @param {String} _message a detailed message about the event
 * @param {Object} _request the HTTP request
 */
var log = function(_source, _message, _request) {
  let formattedMessage, now = new Date().toISOString();
  if (_request === undefined) formattedMessage = `{${now}} [${_source}]: ${_message}`;
  else {
    let ip = _request.headers['x-forwarded-for'] || _request.connection.remoteAddress;
    formattedMessage = `{${now}} [${_source}] (${ip}): ${_message}`;
  }

  if (_source === 'ERROR') console.warn(formattedMessage);
  else console.log(formattedMessage);
};

/**
 * logError - Logs a detailed message to the server console and saves error logs to firebase
 * @param {Object} _errorJson a detailed JSON about the error event
 * @param {Object} _request the HTTP request
 * @param {callback} _callback the callback to return the error log firebase ID
 */
var logError = function(_errorJson, _request, _callback) {
  let now = new Date().toISOString();
  let formattedMessage, ip = null, consoleMessage = JSON.stringify(_errorJson);

  if (_request === undefined) formattedMessage = `{${now}} [ERROR]: ${consoleMessage}`;
  else {
    ip = _request.headers['x-forwarded-for'] || _request.connection.remoteAddress;
    formattedMessage = `{${now}} [ERROR] (${ip}): ${consoleMessage}`;
  }

  // Log the error message
  console.warn(formattedMessage);

  // Add the ip address to the error JSON
  _errorJson.ip = ip;

  // Log the error json to firebase
  const FIREBASE = require('./firebase_mod');
  FIREBASE.ADD(
    '/errorLogs',
    _errorJson,
    (errorLogUrl) => {
      let errorLogId = errorLogUrl.toString().split('/').pop();
      _callback(errorLogId);
    },
    (addErrorLogError) => {
      console.log(`Failed saving error log because ${addErrorLogError}`)
      _callback(null);
    }
  );
};

module.exports = {
  log: log,
  logError: logError,
};

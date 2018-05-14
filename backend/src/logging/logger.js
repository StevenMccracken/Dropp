/**
 * @module for logging to the console
 */

const Utils = require('../utilities/utils');

/**
 * Logs a detailed message to the server console
 * @param {String} _source the origin of the log event
 * @param {String} _message a detailed message about the event
 * @param {Object} _request the HTTP request
 * @return {String} the message logged to the console
 */
const log = function log(_source, _message, _request) {
  const now = new Date().toISOString();

  // If _request is null, the IP address cannot be logged
  let message;
  if (!Utils.hasValue(_request)) message = `{${now}} [${_source}]: ${_message}`;
  else {
    // Capture info about the incoming HTTP request
    const headers = Utils.hasValue(_request.headers) ? _request.headers : {};
    const id = headers.requestId;
    const ipAddress = Utils.getIpAddress(_request);
    message = `{${now}} [${_source}] (${ipAddress}) <${id}>: ${_message}`;
  }

  console.log(message);
  return message;
};

module.exports = {
  log,
};

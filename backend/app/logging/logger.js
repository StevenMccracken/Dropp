/**
 * @module for logging to the console
 */

const Utils = require('../utilities/utils');

/**
 * Logs a detailed message to the server console
 * @param {String} _source the origin of the log event
 * @param {String} _message a detailed message about the event
 * @param {Object} [_request=null] the HTTP request
 */
const log = function log(_source, _message, _request = null) {
  const now = new Date().toISOString();

  // If _request is null, the IP address cannot be logged
  let message;
  if (!Utils.hasValue(_request)) message = `{${now}} [${_source}]: ${_message}`;
  else {
    // Capture info about the incoming HTTP request
    const requestId = _request.headers.requestId;
    const ipAddress = _request.headers['x-forwarded-for'] || _request.connection.remoteAddress;
    message = `{${now}} [${_source}] (${ipAddress}) <${requestId}>: ${message}`;
  }

  console.log(message);
};

module.exports = {
  log,
};

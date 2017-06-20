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
  let now = new Date().toISOString();
  let consoleOutput = _source === 'ERROR' ? console.warn : console.log;
  if (_request === undefined) consoleOutput('{%s} [%s]: %s', now, _source, _message);
  else {
    let ip = _request.headers['x-forwarded-for'] || _request.connection.remoteAddress;
    consoleOutput('{%s} [%s] (%s): %s', now, _source, ip, _message);
  }
};

module.exports = {
  log: log,
};

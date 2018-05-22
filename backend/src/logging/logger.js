/**
 * @module for logging to the console
 */

const Utils = require('../utilities/utils');

/**
 * Logs a detailed message about an HTTP request
 * @param {String} _module the current module
 * @param {String} _source the source location within the given module
 * @param {Object} _request the HTTP request
 * @param {[Any]} args additional details to log
 */
const logRequest = function logRequest(_module, _source, _request, ...args) {
  // Capture info about the incoming HTTP request
  const id = Utils.getRequestId(_request);
  const ipAddress = Utils.getIpAddress(_request);
  const appendedMessages = Utils.reduceToString(args);
  const request = Utils.hasValue(_request) ? _request : {};
  const timestamp = new Date().toISOString();
  let formattedMessage;
  if (appendedMessages === '') {
    formattedMessage = `{${timestamp}} [${_module} -> ${_source}] (${ipAddress}) <${id}> | ${request.method} ${request.url} |`;
  } else {
    formattedMessage = `{${timestamp}} [${_module} -> ${_source}] (${ipAddress}) <${id}> | ${request.method} ${request.url} |: ${appendedMessages}`;
  }

  console.log(formattedMessage);
  return formattedMessage;
};

/**
 * Logs detailed messages to the console
 * @param {String} _module the current module
 * @param {String} _source the source location within the given module
 * @param {[Any]} args additional details to log
 */
const log = function log(_module, _source, ...args) {
  const appendedMessages = Utils.reduceToString(args);
  const timestamp = new Date().toISOString();
  let formattedMessage;
  if (appendedMessages === '') formattedMessage = `{${timestamp}} [${_module} -> ${_source}]`;
  else formattedMessage = `{${timestamp}} [${_module} -> ${_source}]: ${appendedMessages}`;
  console.log(formattedMessage);
  return formattedMessage;
};

module.exports = {
  log,
  logRequest,
};

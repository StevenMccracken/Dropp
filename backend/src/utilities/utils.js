/**
 * @module for common functions to reduce verbosity
 */

const Uuid = require('uuid/v4');
const Moment = require('moment');

const unixEndTimeSeconds = 2147471999;
const unixEndTimeMilliseconds = unixEndTimeSeconds * 1000;

/**
 * Generator for enumerating steps in a process
 * @return {Generator} the stepper to increment a number of steps
 */
function* stepper() {
  let step = 1;
  while (true) yield step++;
}

/**
 * Generates a unique hexadecimal identifier in the form xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
 * @return {String} a universal unique identifier
 */
const newUuid = function newUuid() {
  return Uuid();
};

/**
 * Determines whether or not a given value is not undefined and not null
 * @param {any} _value a proposed value
 * @return {Boolean} whether or not _value is not undefined and not null
 */
const hasValue = function hasValue(_value) {
  return _value !== undefined && _value !== null;
};

/**
 * Helper function to get the IP address from an Express request object
 * @param {Object} _request an HTTP request object
 * @return {String} the IP address from the
 * request if one exists, or an empty string
 */
const getIpAddress = function getIpAddress(_request) {
  const request = hasValue(_request) ? _request : {};
  const headers = request.headers || {};
  const connection = request.connection || {};
  const ipAddress = headers['x-forwarded-for'] || connection.remoteAddress;
  return ipAddress || '';
};

/**
 * Helper function to get the request ID from an Express request object
 * @param {Object} _request an HTTP request object
 * @return {String} the custom header field
 * _requestId_, or empty string if none exists
 */
const getRequestId = function getRequestId(_request) {
  const request = hasValue(_request) ? _request : {};
  const headers = request.headers || {};
  return headers.requestId || '';
};

/**
 * Squashes a given list of values to a comma-delimited
 * string, JSON stringifying valid values
 * @param {[Any]} args the list of values
 * @return {String} comma-separated stringified values. Can be null
 * or undefined if `args` is an array like [null] or [undefined]
 */
const reduceToString = function reduceToString(_args) {
  const args = Array.isArray(_args) ? _args : [];
  return args.reduce((message, argument, index) => {
    const formattedArgument = hasValue(argument) ? JSON.stringify(argument) : argument;
    return index === 0 ? formattedArgument : `${message},${formattedArgument}`;
  }, '');
};

/**
 * Converts a given measure of degrees to radians
 * @param {Number} _degrees degrees to convert.
 * Defaults to 0 if `degrees` is not numeric
 * @return {Number} `degrees` in radians
 */
const degreesToRadians = function degreesToRadians(_degrees) {
  let degrees;
  /* eslint-disable no-restricted-globals */
  if (typeof _degrees === 'number' && !isNaN(parseFloat(_degrees)) && isFinite(_degrees))  {
    /* eslint-enable no-restricted-globals */
    degrees = _degrees;
  } else degrees = 0;

  return degrees * (Math.PI / 180);
};


module.exports = {
  Moment,
  stepper,
  newUuid,
  hasValue,
  getIpAddress,
  getRequestId,
  reduceToString,
  degreesToRadians,
  unixEndTimeSeconds,
  unixEndTimeMilliseconds,
};

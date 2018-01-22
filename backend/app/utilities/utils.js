/**
 * @module for common functions to reduce verbosity
 */

const Uuid = require('uuid/v4');
const Moment = require('moment');

const unixEndTimeSeconds = 2147471999;
const unixEndTimeMilliseconds = unixEndTimeSeconds * 1000;

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
 * getIp - Helper function to get the IP address from an Express request object
 * @param {Object} [_request = {}] the Express request object
 * @return {String} the IP address of the request
 */
const getIpAddress = function getIpAddress(_request = {}) {
  const headers = _request.headers || {};
  const connection = _request.connection || {};
  const ipAddress = headers['x-forwarded-for'] || connection.remoteAddress;
  return ipAddress;
};

module.exports = {
  Moment,
  newUuid,
  hasValue,
  getIpAddress,
  unixEndTimeSeconds,
  unixEndTimeMilliseconds,
};

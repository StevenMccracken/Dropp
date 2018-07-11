/**
 * @module for common functions to reduce verbosity
 */

const Util = require('util');
const Uuid = require('uuid/v4');
const Moment = require('moment');
const FileSystem = require('fs');
const Constants = require('./constants');
const { Duplex } = require('stream');

const LstatPromise = Util.promisify(FileSystem.lstat);
const UnlinkPromise = Util.promisify(FileSystem.unlink);

/**
 * Generator for enumerating steps in a process
 * @return {Generator} the stepper to increment a number of steps
 */
function* stepper() {
  let step = 1;
  while (true) yield step++;
}

/**
 * Generates a unique hexadecimal identifier in
 * the form xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
 * @return {String} a universal unique identifier
 */
const newUuid = () => Uuid();

/**
 * Determines whether or not a given value is not undefined and not null
 * @param {any} _value a proposed value
 * @return {Boolean} whether or not _value is not undefined and not null
 */
const hasValue = value => value !== undefined && value !== null;

/**
 * Helper function to get the IP address from an Express request object
 * @param {Object} _request an HTTP request object
 * @return {String} the IP address from the
 * request if one exists, or an empty string
 */
const getIpAddress = (_request) => {
  const request = hasValue(_request) ? _request : {};
  const headers = request.headers || {};
  const connection = request.connection || {};
  const ipAddress = headers[Constants.router.xForwardedFor] || connection.remoteAddress;
  return ipAddress || Constants.utils.emptyString;
};

/**
 * Helper function to get the request ID from an Express request object
 * @param {Object} _request an HTTP request object
 * @return {String} the custom header field
 * _requestId_, or empty string if none exists
 */
const getRequestId = (_request) => {
  const request = hasValue(_request) ? _request : {};
  const headers = request.headers || {};
  return headers.requestId || Constants.utils.emptyString;
};

/**
 * Squashes a given list of values to a comma-delimited
 * string, JSON stringifying valid values
 * @param {[Any]} args the list of values
 * @return {String} comma-separated stringified values. Can be null
 * or undefined if `args` is an array like [null] or [undefined]
 */
const reduceToString = (_args) => {
  const args = Array.isArray(_args) ? _args : [];
  return args.reduce((message, argument, index) => {
    const formattedArgument = hasValue(argument) ? JSON.stringify(argument) : argument;
    return index === 0 ? formattedArgument : `${message},${formattedArgument}`;
  }, Constants.utils.emptyString);
};

/**
 * Converts a given measure of degrees to radians
 * @param {Number} _degrees degrees to convert.
 * Defaults to 0 if `degrees` is not numeric
 * @return {Number} `degrees` in radians
 */
const degreesToRadians = (_degrees) => {
  let degrees;
  /* eslint-disable no-restricted-globals */
  if (typeof _degrees === 'number' && !isNaN(parseFloat(_degrees)) && isFinite(_degrees)) {
    /* eslint-enable no-restricted-globals */
    degrees = _degrees;
  } else degrees = 0;

  return degrees * (Math.PI / Constants.utils.degress180);
};

/**
 * Removes a local file from the system
 * @param {String} _path the path to the file to remove
 * @return {Bool} false if `_path` is not a
 * string, or true after the file is deleted
 * @throws if a file system error occurred, like the file not existing
 */
const deleteLocalFile = async (_path) => {
  if (typeof _path !== 'string') return false;
  await UnlinkPromise(_path);
  return true;
};

/**
 * Adds a given buffer to a stream
 * @param {Buffer} _buffer the buffer to add.
 * Will not be added if type is not `Buffer`
 * @return {Duplex} stream from `_buffer`
 */
const bufferToStream = (_buffer) => {
  const stream = new Duplex();
  if (Buffer.isBuffer(_buffer)) stream.push(_buffer);
  stream.push(null);
  return stream;
};

/**
 * Gives the number of seconds from the UNIX epoch to now
 * @return {Number} integer number of seconds
 */
const currentUnixSeconds = () => {
  const now = new Date();
  const seconds = now.getTime() / 1000;
  return Math.round(seconds);
};

module.exports = {
  Moment,
  stepper,
  newUuid,
  hasValue,
  getIpAddress,
  getRequestId,
  bufferToStream,
  reduceToString,
  deleteLocalFile,
  degreesToRadians,
  currentUnixSeconds,
  lstat: LstatPromise,
  unlink: UnlinkPromise,
};

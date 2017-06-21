/**
 * error_mod - @module for standardized error messages
 */

const LOG = require('./log_mod');

const INVALID_URL_CHAR = 'invalid character in url';
const PASSPORT_USER_DNE = 'User for this token cannot be found';
const ERROR_CODE = {
  API_ERROR: {
    status: 500,
    type: 'api_error',
    message: 'There was a problem with our back-end services',
  },
  AUTHENTICATION_ERROR: {
    status: 401,
    type: 'authentication_error',
    message: 'There was an error while authenticating',
  },
  INVALID_MEDIA_TYPE: {
    status: 415,
    type: 'invalid_media_type',
    message: 'That type of media file is forbidden',
  },
  INVALID_REQUEST_ERROR: {
    status: 400,
    type: 'invalid_request_error',
    message: 'One of your request parameters is invalid',
  },
  INVALID_URL_ERROR: {
    status: 400,
    type: 'invalid_url_error',
    message: 'There is an unacceptable character in your URL',
  },
  LOGIN_ERROR: {
    status: 403,
    type: 'login_error',
    message: 'The username or password is incorrect',
  },
  RESOURCE_DNE_ERROR: {
    status: 404,
    type: 'resource_dne_error',
    message: 'That resource does not exist',
  },
  RESOURCE_ERROR: {
    status: 403,
    type: 'resource_error',
    message: 'There was an error accessing that resource',
  },
};

/**
 * error - Provides default verbose messages for given error types
 * @param {type} _info the details of the error that occurred
 * @param {type} _callback the callback to return the result
 */
var error = function(_info, _callback) {
  let missingKeys = [];
  let error = _info.error === undefined ? null : _info.error;
  let client = _info.client === undefined ? null : _info.client;
  let source = _info.source === undefined ? null : _info.source;
  let request = _info.request === undefined ? null : _info.request;
  let response = _info.response === undefined ? null : _info.response;
  let serverMessage = _info.serverMessage === undefined ? null : _info.serverMessage;
  let customErrorMessage = _info.customErrorMessage === undefined ? null : _info.customErrorMessage;

  if (error === null) missingKeys.push('error');
  if (source === null) missingKeys.push('source');
  if (response === null) missingKeys.push('response');

  if (missingKeys.length > 0) throw `Missing attributes: ${missingKeys.join()}`;

  // Set an HTTP status code for the error type
  response.status(error.status);

  // Build the client error JSON
  let clientJson = {
    error: {
      type: error.type,
      message: customErrorMessage === null ? error.message : customErrorMessage,
    },
  };

  let serverLog = {
    source: source,
    type: error.type,
    timestamp: (new Date().toISOString()),
    client: client,
    details: serverMessage === null ? clientJson.error.message : serverMessage,
  };

  // Log the error to the server console
  log(serverLog, request, (errorLogId) => {
    clientJson.error.id = errorLogId;
    _callback(clientJson);
  });
};

/**
 * determineAuthenticationError - Builds a client
 * error repsonse based on a given authentication error
 * @param {type} _info the details of the error that occurred
 * @param {type} _callback the callback to return the result
 */
var determineAuthenticationError = function(_info, _callback) {
  var clientErrorMessage, serverLog;
  if (_info.passportError !== null) {
    // An error occurred during the passport authenticate function call
    serverLog = _info.passportError;
  } else if (_info.tokenError !== null) {
    // The token in the request body is invalid
    serverLog = _info.tokenError.message;
    clientErrorMessage = determineJwtError(_info.tokenError.message);
  } else if (_info.userInfoMissing) {
    // There is no userInfo associated with the token
    serverLog = 'User for this token cannot be found';
  } else serverLog = 'Unknown error';

  _info.error = ERROR_CODE.AUTHENTICATION_ERROR;
  _info.serverMessage = serverLog;
  _info.customErrorMessage = clientErrorMessage;
  error(_info, errorJson => _callback(errorJson));
};

/**
 * determineFirebaseError - Builds a client error repsonse based on a given firebase error
 * @param {type} _info the details of the error that occurred
 * @param {type} _callback the callback to return the result
 */
var determineFirebaseError = function(_info, _callback) {
  var formalError, clientErrorMessage, serverLog;
  if (_info.error === INVALID_URL_CHAR) {
    // Error is this string when there is an invalid character in the firebase URL
    formalError = ERROR_CODE.INVALID_REQUEST_ERROR;
    if (_info.invalidParameter === undefined) {
      clientErrorMessage = `Request contains an invalid parameter`;
    } else clientErrorMessage = `Invalid ${_info.invalidParameter} parameter`;

    // Leave serverLog uninitialized because it isn't needed in ERROR.error()
  } else {
    // Unknown error thrown by firebase
    serverLog = _error;
    formalError = ERROR_CODE.API_ERROR;
  }

  _info.error = formalError;
  _info.customErrorMessage = clientErrorMessage;
  _info.serverMessage = serverLog;
  error(_info, errorJson => _callback(errorJson));
};

/**
 * determineBcryptError - Builds a client error repsonse based on a given bcrypt error
 * @param {type} _info the details of the error that occurred
 * @param {type} _callback the callback to return the result
 */
var determineBcryptError = function(_info, _callback) {
  var formalError, clientErrorMessage, serverLog;
  switch (_info.error) {
    case 'Not a valid BCrypt hash.':
      formalError = ERROR_CODE.API_ERROR;
      serverLog = 'Existing password is not correctly hashed';
      break;
    default:
      formalError = ERROR_CODE.API_ERROR;
      serverLog = _info.error;
  }

  _info.error = formalError;
  _info.customErrorMessage = clientErrorMessage;
  _info.serverMessage = serverLog;
  error(_info, errorJson => _callback(errorJson));
};

module.exports = {
  error: error,
  CODE: ERROR_CODE,
  INVALID_URL_CHAR: INVALID_URL_CHAR,
  PASSPORT_USER_DNE: PASSPORT_USER_DNE,
  determineBcryptError: determineBcryptError,
  determineFirebaseError: determineFirebaseError,
  determineAuthenticationError: determineAuthenticationError,
};

/**
 * determineJwtError - Determines the specific type of error generated from JWT events
 * @param {String} errorMessage the JWT error message
 * @returns {String} a more clearly worded error message
 */
function determineJwtError(errorMessage) {
  /**
   * If token is malformed, sometimes errorMessage will contain 'Unexpected
   * token' so shorten the errorMessage so it can work with the switch case
   */
  if (errorMessage !== null && errorMessage.indexOf('Unexpected token') !== -1) {
    errorMessage = 'Unexpected token';
  }

  let reason;
  switch (errorMessage) {
    case 'jwt expired':
      reason = 'Expired web token';
      break;
    case 'invalid token':
      reason = 'Invalid web token';
      break;
    case 'invalid signature':
      reason = 'Invalid web token';
      break;
    case 'jwt malformed':
      reason = 'Invalid web token';
      break;
    case 'Unexpected token':
      reason = 'Invalid web token';
      break;
    case 'No auth token':
      reason = 'Missing web token';
      break;
    case 'jwt must be provided':
      reason = 'Missing web token';
      break;
    default:
      reason = 'Unknown web token error';
  }

  return reason;
}

/**
 * log - Logs an error message to the server console
 * @param {String} _message the log message
 * @param {Object} _request the HTTP request
 * @param {callback} _callback the callback to return the response
 */
function log(_errorJson, _request, _callback) {
  LOG.logError(_errorJson, _request, errorId => _callback(errorId));
}

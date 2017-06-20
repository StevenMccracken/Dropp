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
  }
};

/**
 * error - Provides default verbose messages for given error types
 * @param {String} _source the function that the error occured in
 * @param {Object} _request the HTTP request
 * @param {Object} _response the HTTP response
 * @param {Object} _error the standardized error JSON
 * @param {String} _customErrorMessage a custom error message for the client
 * @param {String} _serverMessage a custom error message for the server log
 * @returns {Object} a formal error JSON for the client
 */
var error = function(_source, _request, _response, _error, _customErrorMessage, _serverMessage) {
  // Set an HTTP status code for the error type
  _response.status(_error.status);

  // Build the client error JSON
  let clientJson = {
    error: {
      type: _error.type,
      message: _customErrorMessage === null ? _error.message : _customErrorMessage,
    }
  };

  let serverLog = {
    error: {
      timestamp: (new Date().toISOString()),
      type: _error.type,
      source: _source,
      details: _serverMessage === undefined ? clientJson.error.message : _serverMessage,
    }
  };

  // Log the error to the server console
  log(JSON.stringify(serverLog), _request);
  return clientJson;
};

/**
 * determineAuthenticationError - Builds a client
 * error repsonse based on a given authentication error
 * @param {String} _source the function that the error originated from
 * @param {Object} _request the HTTP request
 * @param {Object} _response the HTTP response
 * @param {String} _passportError an message detailing a passport function call error
 * @param {Error} _tokenError An error object from the jsonwebtoken library
 * @param {Boolean} _userInfoMissing Description
 * @returns {Object} the response JSON for the client
 */
function determineAuthenticationError(
  _source,
  _request,
  _response,
  _passportError,
  _tokenError,
  _userInfoMissing
) {
  var clientErrorMessage, serverLog;
  if (_passportError !== null) {
    // An error occurred during the passport authenticate function call
    serverLog = _passportError;
    clientErrorMessage = null;
  } else if (_tokenError !== null) {
    // The token in the request body is invalid
    serverLog = _tokenError.message;
    clientErrorMessage = determineJwtError(_tokenError.message);
  } else if (_userInfoMissing) {
    // There is no userInfo associated with the token
    serverLog = 'User for this token cannot be found';
    clientErrorMessage = null;
  } else {
    serverLog = 'Unknown error';
    clientErrorMessage = null;
  }

  let errorJson = error(
    _source,
    _request,
    _response,
    ERROR_CODE.AUTHENTICATION_ERROR,
    clientErrorMessage,
    serverLog
  );

  return errorJson;
}

/**
 * determineFirebaseError - Builds a client error repsonse based on a given firebase error
 * @param {String} _source the function that the error originated from
 * @param {Object} _request the HTTP request
 * @param {Object} _response the HTTP response
 * @param {String|Object} _error the firebase error
 * @param {String} _invalidParameter the parameter in the
 * firebase URL that might have caused the firebase error
 * @returns {Object} the response JSON for the client
 */
function determineFirebaseError(_source, _request, _response, _error, _invalidParameter) {
  var formalError, clientErrorMessage, serverLog;
  if (_error === INVALID_URL_CHAR) {
    // Error is this string when there is an invalid character in the firebase URL
    formalError = ERROR_CODE.INVALID_REQUEST_ERROR;
    if (_invalidParameter === undefined) {
      clientErrorMessage = `Request contains an invalid parameter`;
    } else clientErrorMessage = `Invalid ${_invalidParameter} parameter`;

    // Leave serverLog uninitialized because it isn't needed in ERROR.error()
  } else {
    // Unknown error thrown by firebase
    formalError = ERROR_CODE.API_ERROR;
    clientErrorMessage = null;
    serverLog = _error;
  }

  let clientResponse = error(
    _source,
    _request,
    _response,
    formalError,
    clientErrorMessage,
    serverLog
  );

  return clientResponse;
}

/**
 * determineBcryptError - Builds a client error repsonse based on a given bcrypt error
 * @param {String} _source the function where the error occurred
 * @param {Object} _request the HTTP request
 * @param {Object} _response the HTTP response
 * @param {String} _error the bcrypt error string
 * @returns {Object} a formalized error JSON
 */
var determineBcryptError = function(_source, _request, _response, _error) {
  var errorJson;
  switch (_error) {
    case 'Not a valid BCrypt hash.':
      errorJson = error(
        _source,
        _request,
        _response,
        ERROR_CODE.API_ERROR,
        null,
        'Existing password is not correctly hashed'
      );

      break;
    default:
      errorJson = error(
        _source,
        _request,
        _response,
        ERROR_CODE.API_ERROR,
        null,
        _error
      );
  }

  return errorJson;
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

  var reason;
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
      log(`Unknown JWT error: ${errorMessage}`);
  }

  return reason;
}

/**
 * log - Logs a message to the server console
 * @param {String} _message the log message
 * @param {Object} _request the HTTP request
 */
function log(_message, _request) {
  LOG.log('ERROR', _message, _request);
}

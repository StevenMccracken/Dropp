/**
 * @module for creating standardized error messages
 */

const Log = require('../logging/logger');
const Utils = require('../utilities/utils');

const ErrorType = {
  Server: {
    status: 500,
    type: 'api_error',
    message: 'There was a problem with our back-end services',
  },
  Auth: {
    status: 401,
    type: 'authentication_error',
    message: 'There was an error during authentication',
  },
  InvalidMediaType: {
    status: 415,
    type: 'invalid_media_type',
    message: 'That type of media file is forbidden',
  },
  InvalidRequest: {
    status: 400,
    type: 'invalid_request_error',
    message: 'One of your request parameters is invalid',
  },
  Login: {
    status: 401,
    type: 'login_error',
    message: 'The username or password is incorrect',
  },
  ResourceDNE: {
    status: 404,
    type: 'resource_dne_error',
    message: 'That resource does not exist',
  },
  Resource: {
    status: 403,
    type: 'resource_error',
    message: 'There was an error accessing that resource',
  },
};

/**
 * Logs a message about errors
 * @param {String} _message the message to log
 * @param {Object} _request the HTTP request
 */
function log(_message, _request) {
  Log.log('Error', _message, _request);
}

/**
 * Provides default verbose messages for given error types
 * @param {String} _source the function that the error occured in
 * @param {Object} _request the HTTP request
 * @param {Object} _response the HTTP response
 * @param {Object} _error the standardized error JSON
 * @param {String} _customMessage a custom message for the client
 * @param {String} _serverMessage a custom message for the server log
 * @return {Object} a formal error JSON for the client
 */
/* eslint-disable max-len */
const handleError = function handleError(_source, _request, _response, _error, _customMessage, _serverMessage) {
/* eslint-enable max-len */
  _response.status(_error.status);
  const errorId = Utils.newUuid();
  const clientJson = {
    error: {
      id: errorId,
      type: _error.type,
      message: !Utils.hasValue(_customMessage) ? _error.message : _customMessage,
    },
  };

  const serverLog = {
    error: {
      id: errorId,
      timestamp: (new Date().toISOString()),
      type: _error.type,
      source: _source,
      details: !Utils.hasValue(_serverMessage) ? clientJson.error.message : _serverMessage,
    },
  };

  log(JSON.stringify(serverLog), _request);
  return clientJson;
};

/**
 * Determines the specific type of error generated from JWT events
 * @param {String} _errorMessage the JWT error message
 * @return {String} a more clearly worded error message
 */
function handleJwtError(_errorMessage) {
  /**
   * If token is malformed, sometimes errorMessage will contain 'Unexpected
   * token' so shorten the errorMessage so it can work with the switch case
   */
  let errorMessage = _errorMessage;
  if (Utils.hasValue(errorMessage) && errorMessage.indexOf('Unexpected token') !== -1) {
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
  } // End switch (errorMessage)

  return reason;
}

/**
 * Builds a client error repsonse based on a given authentication error
 * @param {String} _source the function where the error occurred
 * @param {Object} _request the HTTP request
 * @param {Object} _response the HTTP response
 * @param {Object} _error JSON containing specific authentication errors
 * @return {Object} a formalized error JSON
 */
const handleAuthError = function handleAuthError(_source, _request, _response, _error) {
  let serverLog;
  let clientErrorMessage = null;

  if (Utils.hasValue(_error.passportError)) serverLog = _error.passportError;
  else if (Utils.hasValue(_error.tokenError)) {
    // The token in the request body is invalid
    serverLog = _error.tokenError.message;
    clientErrorMessage = handleJwtError(_error.tokenError.message);
  } else if (_error.userInfoMissing) {
    serverLog = 'User for this token cannot be found';
    clientErrorMessage = 'Expired web token';
  } else serverLog = 'Unknown error';

  const errorJson = handleError(
    _source,
    _request,
    _response,
    ErrorType.Auth,
    clientErrorMessage,
    serverLog
  );

  return errorJson;
};

module.exports = {
  handleError,
  Type: ErrorType,
  handleAuthError,
};

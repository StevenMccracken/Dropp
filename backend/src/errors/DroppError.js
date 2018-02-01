/**
 * Custom error object to contain extra details
 * @extends Error
 */

const Log = require('../logging/logger');
const Utils = require('../utilities/utils');

/**
 * Logs a message about errors
 * @param {Object} _details the details of the error to log
 */
function log(_details) {
  Log.log('ERROR', JSON.stringify(_details));
}

class DroppError extends Error {
  constructor(_details = {}, _privateDetails = {}, ..._params) {
    super(..._params);
    this.name = this.constructor.name;
    if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);

    this.details = _details;
    this.privateDetails = _privateDetails;
  }

  get details() {
    return this._details;
  }

  get privateDetails() {
    return this._privateDetails;
  }

  get statusCode() {
    return this._privateDetails.error.type.status;
  }

  set details(_details) {
    this._details = _details;
  }

  set privateDetails(_privateDetails) {
    this._privateDetails = _privateDetails;
  }

  set statusCode(_statusCode) {
    this._statusCode = _statusCode;
  }

  static format(_type, _source, _clientMessage, _serverLog) {
    const id = Utils.newUuid();
    let formattedMessage;
    if (Utils.hasValue(_clientMessage)) {
      formattedMessage = Array.isArray(_clientMessage) ? _clientMessage.join(',') : _clientMessage;
    } else formattedMessage = _type.message;

    const clientDetails = {
      error: {
        id,
        type: _type.type,
        message: formattedMessage,
      },
    };

    const serverDetails = {
      error: {
        id,
        timestamp: new Date().toISOString(),
        type: _type,
        source: _source,
        details: Utils.hasValue(_serverLog) ? _serverLog : formattedMessage,
      },
    };

    return new DroppError(clientDetails, serverDetails);
  }

  static throw(_type, _source, _clientMessage, _serverLog) {
    const error = this.format(_type, _source, _clientMessage, _serverLog);
    log(error.privateDetails);
    throw error;
  }

  static throwServerError(_source, _clientMessage, _serverLog) {
    this.throw(this.type.Server, _source, _clientMessage, _serverLog);
  }

  static throwResourceError(_source, _clientMessage, _serverLog) {
    this.throw(this.type.Resource, _source, _clientMessage, _serverLog);
  }

  static throwResourceDneError(_source, _clientMessage, _serverLog) {
    const formattedMessage = `That ${_clientMessage} does not exist`;
    this.throw(this.type.ResourceDNE, _source, formattedMessage, _serverLog);
  }

  static throwInvalidRequestError(_source, _clientMessage, _serverLog) {
    this.throw(this.type.InvalidRequest, _source, _clientMessage, _serverLog);
  }

  static throwLoginError(_source, _clientMessage, _serverLog) {
    this.throw(this.type.Login, _clientMessage, _serverLog);
  }

  static handleJwtError(_errorMessage) {
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
   * @return {DroppError} a formalized error object
   */
  static handleAuthError(_source, _request, _response, _error) {
    let serverLog;
    let clientErrorMessage = null;

    if (Utils.hasValue(_error.passportError)) serverLog = _error.passportError;
    else if (Utils.hasValue(_error.tokenError)) {
      // The token in the request body is invalid
      serverLog = _error.tokenError.message;
      clientErrorMessage = this.handleJwtError(_error.tokenError.message);
    } else if (_error.userInfoMissing) {
      serverLog = 'User for this token cannot be found';
      clientErrorMessage = 'Expired web token';
    } else serverLog = 'Unknown error';

    const error = this.format(this.type.Auth, _source, clientErrorMessage, serverLog);
    return error;
  }
}

DroppError.type = {
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

module.exports = DroppError;

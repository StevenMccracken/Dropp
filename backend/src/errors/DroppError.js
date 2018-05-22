const Log = require('../logging/logger');
const Utils = require('../utilities/utils');

const moduleName = 'Dropp Error';

/**
 * Custom error object to contain extra details
 * @extends Error
 */
class DroppError extends Error {
  constructor(_details, _privateDetails, ..._params) {
    super(..._params);
    this.name = this.constructor.name;
    if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);

    this.details = Utils.hasValue(_details) ? _details : {};
    this.privateDetails = Utils.hasValue(_privateDetails) ? _privateDetails : {};
  }

  get details() {
    return this._details;
  }

  get privateDetails() {
    return this._privateDetails;
  }

  get statusCode() {
    let statusCode = null;
    if (
      Utils.hasValue(this._privateDetails) &&
      Utils.hasValue(this._privateDetails.error) &&
      Utils.hasValue(this._privateDetails.error.type)
    ) statusCode = this._privateDetails.error.type.status;
    return statusCode;
  }

  set details(_details) {
    this._details = _details;
  }

  set privateDetails(_privateDetails) {
    this._privateDetails = _privateDetails;
  }

  static format(_type, _source, _clientMessage, _serverLog) {
    const id = Utils.newUuid();
    let formattedMessage;
    if (Utils.hasValue(_clientMessage)) {
      formattedMessage = Array.isArray(_clientMessage) ? _clientMessage.join(',') : _clientMessage;
    } else if (Utils.hasValue(_type) && Utils.hasValue(_type.message)) {
      formattedMessage = _type.message;
    } else formattedMessage = DroppError.type.Server.message;

    let clientType;
    if (Utils.hasValue(_type) && Utils.hasValue(_type.type)) clientType = _type.type;
    else clientType = DroppError.type.Server.type;

    const clientDetails = {
      error: {
        id,
        type: clientType,
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
    const source = 'throw()';
    const error = this.format(_type, _source, _clientMessage, _serverLog);
    Log.log(moduleName, source, error.privateDetails);
    throw error;
  }

  static throwServerError(_source, _clientMessage, _serverLog) {
    this.throw(this.type.Server, _source, _clientMessage, _serverLog);
  }

  static throwResourceError(_source, _clientMessage, _serverLog) {
    this.throw(this.type.Resource, _source, _clientMessage, _serverLog);
  }

  static throwResourceDneError(_source, _resource, _serverLog) {
    const formattedMessage = `That ${_resource} does not exist`;
    this.throw(this.type.ResourceDNE, _source, formattedMessage, _serverLog);
  }

  static throwInvalidRequestError(_source, _clientMessage, _serverLog) {
    this.throw(this.type.InvalidRequest, _source, _clientMessage, _serverLog);
  }

  static throwLoginError(_source, _clientMessage, _serverLog) {
    this.throw(this.type.Login, _source, _clientMessage, _serverLog);
  }

  /**
   * Builds a client error repsonse based on a given JWT error
   * @param {String} _errorMessage the full JWT error message
   * @return {String} a formal error message for the client
   */
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
        reason = DroppError.TokenReason.expired;
        break;
      case 'invalid token':
        reason = DroppError.TokenReason.invalid;
        break;
      case 'invalid signature':
        reason = DroppError.TokenReason.invalid;
        break;
      case 'jwt malformed':
        reason = DroppError.TokenReason.invalid;
        break;
      case 'Unexpected token':
        reason = DroppError.TokenReason.invalid;
        break;
      case 'No auth token':
        reason = DroppError.TokenReason.missing;
        break;
      case 'jwt must be provided':
        reason = DroppError.TokenReason.missing;
        break;
      default:
        reason = DroppError.TokenReason.unknown;
    }

    return reason;
  }

  /**
   * Builds a client error repsonse based on a given authentication error
   * @param {String} _source the function where the error occurred
   * @param {Object} _request the HTTP request
   * @param {Object} _response the HTTP response
   * @param {Object} _error JSON containing specific authentication errors
   * @return {DroppError} error of type Auth
   */
  static handleAuthError(_source, _request, _response, _error) {
    let serverLog;
    let clientErrorMessage = null;
    const error = Utils.hasValue(_error) ? _error : {};
    if (Utils.hasValue(error.passportError)) serverLog = error.passportError;
    else if (Utils.hasValue(error.tokenError)) {
      // The token in the request body is invalid
      serverLog = error.tokenError.message;
      clientErrorMessage = this.handleJwtError(error.tokenError.message);
    } else if (error.userInfoMissing === true) {
      serverLog = 'User for this token cannot be found';
      clientErrorMessage = DroppError.TokenReason.expired;
    } else serverLog = 'Unknown error';

    const authError = this.format(this.type.Auth, _source, clientErrorMessage, serverLog);
    return authError;
  }
}

DroppError.TokenReason = {
  expired: 'Expired web token',
  invalid: 'Invalid web token',
  missing: 'Missing web token',
  unknown: 'Unknown web token error',
};

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

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
  constructor(_details = {}, ..._params) {
    super(..._params);

    this.name = this.constructor.name;

    if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
    this.details = _details;
  }

  static throw(_type, _source, _clientMessage, _serverLog) {
    const id = Utils.newUuid();
    const clientDetails = {
      error: {
        id,
        type: _type.type,
        message: Utils.hasValue(_clientMessage) ? _clientMessage : _type.message,
      },
    };

    const serverDetails = {
      error: {
        id,
        timestamp: new Date().toISOString(),
        type: _type.type,
        source: _source,
        details: Utils.hasValue(_serverLog) ? _serverLog : clientDetails.error.message,
      },
    };

    log(serverDetails);
    throw new DroppError(clientDetails);
  }

  static throwResourceError(_source, _clientMessage, _serverLog) {
    this.throw(this.type.Resource, _source, _clientMessage, _serverLog);
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

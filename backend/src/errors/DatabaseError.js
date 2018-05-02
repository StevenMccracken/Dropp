const Log = require('../logging/logger');
const Utils = require('../utilities/utils');

/**
 * Logs a message about database errors
 * @param {Object} _details the details of the error to log
 */
function log(_details) {
  Log.log('Database Error', JSON.stringify(_details));
}

/**
 * Custom error object to contain extra
 * details about database errors
 * @extends Error
 */
class DatabaseError extends Error {
  constructor(_details = {}, ..._params) {
    super(..._params);
    this.name = this.constructor.name;
    if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
    this.details = _details;
  }

  get details() {
    return this._details;
  }

  set details(_details) {
    this._details = _details;
  }

  static format(_type, _source, _details) {
    const type = Utils.hasValue(_type) ? _type.type : this.type.Unknown.type;
    const id = Utils.newUuid();
    const details = {
      id,
      source: _source,
      type,
      details: _details,
      timestamp: new Date().toISOString(),
    };

    return new DatabaseError(details);
  }

  static throw(_type, _source, _details) {
    const error = this.format(_type, _source, _details);
    log(error.details);
    throw error;
  }

  static throwUrlError(_source, _url) {
    const formattedMessage = `Url: ${_url}`;
    this.throw(this.type.Url, _source, formattedMessage);
  }

  static throwDataError(_source, _data) {
    this.throw(this.type.Data, _source, _data);
  }

  static throwInvalidStateError(_source) {
    this.throw(this.type.State, _source);
  }
}

DatabaseError.type = {
  Url: {
    type: 'url_error',
    message: 'Invalid database URL',
  },
  Data: {
    type: 'invalid_data',
    message: 'Data was invalid',
  },
  State: {
    type: 'invalid_state',
    message: 'The database was in an invalid state',
  },
  Unknown: {
    type: 'unknown',
    message: 'An unknown error occurred',
  },
};

module.exports = DatabaseError;

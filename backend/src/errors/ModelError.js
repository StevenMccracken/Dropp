const Log = require('../logging/logger');
const Utils = require('../utilities/utils');

/**
 * Logs a message about model object errors
 * @param {Object} _details the details of the error to log
 */
function log(_details) {
  Log.log('Model Error', JSON.stringify(_details));
}

/**
 * Custom error object to contain extra details
 * about model object errors
 * @extends Error
 */
class ModelError extends Error {
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
    const id = Utils.newUuid();
    const type = Utils.hasValue(_type) ? _type.type : this.type.Unknown.type;
    const details = {
      id,
      source: _source,
      type,
      details: _details,
      timestamp: new Date().toISOString(),
    };

    return new ModelError(details);
  }

  static throw(_type, _source, _details) {
    const error = this.format(_type, _source, _details);
    log(error.details);
    throw error;
  }

  static throwConstructorError(_source, _details) {
    this.throw(this.type.Constructor, _source, _details);
  }

  static throwInvalidMembersError(_source, _invalidMembers) {
    const details = {
      invalidMembers: _invalidMembers,
    };

    this.throw(this.type.Constructor, _source, details);
  }
}

ModelError.type = {
  Constructor: {
    type: 'constructor',
    message: 'Invalid data given to the constructor',
  },
  Unknown: {
    type: 'unknown',
    message: 'An unknown error occurred',
  },
};

module.exports = ModelError;

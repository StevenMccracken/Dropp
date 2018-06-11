const Log = require('../logging/logger');
const Utils = require('../utilities/utils');
const Constants = require('../utilities/constants');

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
    const source = 'throw()';
    const error = this.format(_type, _source, _details);
    Log.log(Constants.errors.model.moduleName, source, error.details);
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

  static throwTypeMismatchError(_model) {
    this.throw(this.type.TypeMismatch, _model);
  }
}

ModelError.type = {
  Constructor: {
    type: Constants.errors.types.constructor,
    message: Constants.errors.messages.invalidConstrucutorData,
  },
  TypeMismatch: {
    type: Constants.errors.types.typeMismatch,
    message: Constants.errors.messages.unexpectedType,
  },
  Unknown: {
    type: Constants.errors.types.unknown,
    message: Constants.errors.messages.unknownErrorOccurred,
  },
};

module.exports = ModelError;

const Log = require('../logging/logger');
const Utils = require('../utilities/utils');

const moduleName = 'Storage Error';

/**
 * Custom error object to contain extra details
 * about cloud storage errors
 * @extends Error
 */
class StorageError extends Error {
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

    return new StorageError(details);
  }

  static throw(_type, _source, _details) {
    const source = 'throw()';
    const error = this.format(_type, _source, _details);
    Log.log(moduleName, source, error.details);
    throw error;
  }

  static throwInvalidFileError(_source, _details) {
    this.throw(this.type.InvalidFile, _source, _details);
  }

  static throwFileDoesNotExistError(_source, _details) {
    this.throw(this.type.FileDoesNotExist, _source, _details);
  }

  static throwInvalidStateError(_source) {
    this.throw(this.type.State, _source);
  }

  static throwInvalidMembersError(_source, _invalidMembers) {
    const details = {
      invalidMembers: _invalidMembers,
    };

    this.throw(this.type.InvalidMembers, _source, details);
  }
}

StorageError.type = {
  State: {
    type: 'invalid_state',
    message: 'Cloud storage was in an invalid state',
  },
  InvalidFile: {
    type: 'invalid_file',
    message: 'That link is not a file',
  },
  FileDoesNotExist: {
    type: 'file_dne',
    message: 'That file does not exist',
  },
  InvalidMembers: {
    type: 'invalid_members',
    message: 'Invalid data',
  },
  Unknown: {
    type: 'unknown',
    message: 'An unknown error occurred',
  },
};

module.exports = StorageError;

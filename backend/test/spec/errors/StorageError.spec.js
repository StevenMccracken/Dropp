const Log = require('../../logger');
const StorageError = require('../../../src/errors/StorageError');

const testName = 'Storage Error';
const constructorTitle = 'Constructor';
/* eslint-disable no-undef */
describe(constructorTitle, () => {
  it('creates a model error object with default details', (done) => {
    const error = new StorageError();
    expect(error.name).toBe('StorageError');
    expect(Object.keys(error.details).length).toBe(0);
    Log(testName, constructorTitle, error);
    done();
  });

  it('creates a model error object with specific details', (done) => {
    const error = new StorageError('test');
    expect(error.name).toBe('StorageError');
    expect(error.details).toBe('test');
    Log(testName, constructorTitle, error);
    done();
  });
});

const formatTitle = 'Format';
describe(formatTitle, () => {
  it('creates a model error object with specific details', (done) => {
    const type = {
      type: 'test',
    };

    const error = StorageError.format(type, 'test', 'test');
    expect(typeof error.details.id).toBe('string');
    expect(error.details.source).toBe('test');
    expect(error.details.type).toBe(type.type);
    expect(error.details.details).toBe('test');
    expect(typeof error.details.timestamp).toBe('string');
    Log(testName, formatTitle, error);
    done();
  });

  it('creates a model error object with specific details without a type', (done) => {
    const error = StorageError.format(null, 'test', 'test');
    expect(typeof error.details.id).toBe('string');
    expect(error.details.source).toBe('test');
    expect(error.details.type).toBe(StorageError.type.Unknown.type);
    expect(error.details.details).toBe('test');
    expect(typeof error.details.timestamp).toBe('string');
    Log(testName, formatTitle, error);
    done();
  });
});

const throwTitle = 'Throw';
describe(throwTitle, () => {
  it('throws a model error with specific details', (done) => {
    try {
      StorageError.throw(null, 'test', 'test');
      expect(false).toBe(true);
      Log(testName, throwTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('StorageError');
      expect(error.details.source).toBe('test');
      expect(error.details.details).toBe('test');
      expect(error.details.type).toBe(StorageError.type.Unknown.type);
      Log(testName, throwTitle, error);
    }

    done();
  });

  it('throws a model error with specific details and a type', (done) => {
    const type = {
      type: 'test',
    };

    try {
      StorageError.throw(type, 'test', 'test');
      expect(false).toBe(true);
      Log(testName, throwTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('StorageError');
      expect(error.details.type).toBe('test');
      expect(error.details.source).toBe('test');
      expect(error.details.details).toBe('test');
      Log(testName, throwTitle, error);
    }

    done();
  });
});

const throwUnknownErrorTitle = 'Throw Unknown error';
describe(throwUnknownErrorTitle, () => {
  it('throws a model error of type Unknown', (done) => {
    try {
      StorageError.throwUnknownError('test', 'test');
      expect(false).toBe(true);
      Log(testName, throwUnknownErrorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('StorageError');
      expect(error.details.source).toBe('test');
      expect(error.details.details).toBe('test');
      expect(error.details.type).toBe(StorageError.type.Unknown.type);
      Log(testName, throwUnknownErrorTitle, error);
    }

    done();
  });
});

const throwInvalidFileErrorTitle = 'Throw Invalid File error';
describe(throwInvalidFileErrorTitle, () => {
  it('throws a model error of type Invalid File', (done) => {
    try {
      StorageError.throwInvalidFileError('test', 'test');
      expect(false).toBe(true);
      Log(testName, throwInvalidFileErrorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('StorageError');
      expect(error.details.source).toBe('test');
      expect(error.details.details).toBe('test');
      expect(error.details.type).toBe(StorageError.type.InvalidFile.type);
      Log(testName, throwInvalidFileErrorTitle, error);
    }

    done();
  });
});

const throwFileDoesNotExistErrorTitle = 'Throw Type Mismatch error';
describe(throwFileDoesNotExistErrorTitle, () => {
  it('throws a model error of type File Does Not Exist', (done) => {
    try {
      StorageError.throwFileDoesNotExistError('test', 'test');
      expect(false).toBe(true);
      Log(testName, throwFileDoesNotExistErrorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('StorageError');
      expect(error.details.source).toBe('test');
      expect(error.details.details).toBe('test');
      expect(error.details.type).toBe(StorageError.type.FileDoesNotExist.type);
      Log(testName, throwFileDoesNotExistErrorTitle, error);
    }

    done();
  });
});

const throwInvalidStateErrorTitle = 'Throw Type Mismatch error';
describe(throwInvalidStateErrorTitle, () => {
  it('throws a model error of type File Does Not Exist', (done) => {
    try {
      StorageError.throwInvalidStateError('test');
      expect(false).toBe(true);
      Log(testName, throwInvalidStateErrorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('StorageError');
      expect(error.details.source).toBe('test');
      expect(error.details.details).not.toBeDefined();
      expect(error.details.type).toBe(StorageError.type.State.type);
      Log(testName, throwInvalidStateErrorTitle, error);
    }

    done();
  });
});

const throwInvalidMembersErrorTitle = 'Throw Invalid Members error';
describe(throwInvalidMembersErrorTitle, () => {
  it('throws a model error of type Invalid Members', (done) => {
    try {
      StorageError.throwInvalidMembersError('test', 'test');
      expect(false).toBe(true);
      Log(testName, throwInvalidMembersErrorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('StorageError');
      expect(error.details.source).toBe('test');
      expect(error.details.details.invalidMembers).toBe('test');
      expect(error.details.type).toBe(StorageError.type.InvalidMembers.type);
      Log(testName, throwInvalidMembersErrorTitle, error);
    }

    done();
  });
});

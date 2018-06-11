const Log = require('../../logger');
const StorageError = require('../../../src/errors/StorageError');

const testName = 'Storage Error';
const constructorTitle = 'Constructor';
/* eslint-disable no-undef */
describe(constructorTitle, () => {
  const it1 = 'creates a model error object with default details';
  it(it1, () => {
    Log.it(testName, constructorTitle, it1, true);
    const error = new StorageError();
    expect(error.name).toBe('StorageError');
    expect(Object.keys(error.details).length).toBe(0);
    Log.log(testName, constructorTitle, error);
    Log.it(testName, constructorTitle, it1, false);
  });

  const it2 = 'creates a model error object with specific details';
  it(it2, () => {
    Log.it(testName, constructorTitle, it2, true);
    const error = new StorageError('test');
    expect(error.name).toBe('StorageError');
    expect(error.details).toBe('test');
    Log.log(testName, constructorTitle, error);
    Log.it(testName, constructorTitle, it2, false);
  });
});

const formatTitle = 'Format';
describe(formatTitle, () => {
  const it1 = 'creates a model error object with specific details';
  it(it1, () => {
    Log.it(testName, formatTitle, it1, true);
    const type = {
      type: 'test',
    };

    const error = StorageError.format(type, 'test', 'test');
    expect(typeof error.details.id).toBe('string');
    expect(error.details.source).toBe('test');
    expect(error.details.type).toBe(type.type);
    expect(error.details.details).toBe('test');
    expect(typeof error.details.timestamp).toBe('string');
    Log.log(testName, formatTitle, error);
    Log.it(testName, formatTitle, it1, false);
  });

  const it2 = 'creates a model error object with specific details without a type';
  it(it2, () => {
    Log.it(testName, formatTitle, it2, true);
    const error = StorageError.format(null, 'test', 'test');
    expect(typeof error.details.id).toBe('string');
    expect(error.details.source).toBe('test');
    expect(error.details.type).toBe(StorageError.type.Unknown.type);
    expect(error.details.details).toBe('test');
    expect(typeof error.details.timestamp).toBe('string');
    Log.log(testName, formatTitle, error);
    Log.it(testName, formatTitle, it2, false);
  });
});

const throwTitle = 'Throw';
describe(throwTitle, () => {
  const it1 = 'throws a model error with specific details';
  it(it1, () => {
    Log.it(testName, throwTitle, it1, true);
    try {
      StorageError.throw(null, 'test', 'test');
      expect(false).toBe(true);
      Log.log(testName, throwTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('StorageError');
      expect(error.details.source).toBe('test');
      expect(error.details.details).toBe('test');
      expect(error.details.type).toBe(StorageError.type.Unknown.type);
      Log.log(testName, throwTitle, error);
    }

    Log.it(testName, throwTitle, it1, false);
  });

  const it2 = 'throws a model error with specific details and a type';
  it(it2, () => {
    Log.it(testName, throwTitle, it2, true);
    const type = {
      type: 'test',
    };

    try {
      StorageError.throw(type, 'test', 'test');
      expect(false).toBe(true);
      Log.log(testName, throwTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('StorageError');
      expect(error.details.type).toBe('test');
      expect(error.details.source).toBe('test');
      expect(error.details.details).toBe('test');
      Log.log(testName, throwTitle, error);
    }

    Log.it(testName, throwTitle, it2, false);
  });
});

const throwUnknownErrorTitle = 'Throw Unknown error';
describe(throwUnknownErrorTitle, () => {
  const it1 = 'throws a model error of type Unknown';
  it(it1, () => {
    Log.it(testName, throwUnknownErrorTitle, it1, true);
    try {
      StorageError.throwUnknownError('test', 'test');
      expect(false).toBe(true);
      Log.log(testName, throwUnknownErrorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('StorageError');
      expect(error.details.source).toBe('test');
      expect(error.details.details).toBe('test');
      expect(error.details.type).toBe(StorageError.type.Unknown.type);
      Log.log(testName, throwUnknownErrorTitle, error);
    }

    Log.it(testName, throwUnknownErrorTitle, it1, false);
  });
});

const throwInvalidFileErrorTitle = 'Throw Invalid File error';
describe(throwInvalidFileErrorTitle, () => {
  const it1 = 'throws a model error of type Invalid File';
  it(it1, () => {
    Log.it(testName, throwInvalidFileErrorTitle, it1, true);
    try {
      StorageError.throwInvalidFileError('test', 'test');
      expect(false).toBe(true);
      Log.log(testName, throwInvalidFileErrorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('StorageError');
      expect(error.details.source).toBe('test');
      expect(error.details.details).toBe('test');
      expect(error.details.type).toBe(StorageError.type.InvalidFile.type);
      Log.log(testName, throwInvalidFileErrorTitle, error);
    }

    Log.it(testName, throwInvalidFileErrorTitle, it1, false);
  });
});

const throwFileDoesNotExistErrorTitle = 'Throw Type Mismatch error';
describe(throwFileDoesNotExistErrorTitle, () => {
  const it1 = 'throws a model error of type File Does Not Exist';
  it(it1, () => {
    Log.it(testName, throwFileDoesNotExistErrorTitle, it1, true);
    try {
      StorageError.throwFileDoesNotExistError('test', 'test');
      expect(false).toBe(true);
      Log.log(testName, throwFileDoesNotExistErrorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('StorageError');
      expect(error.details.source).toBe('test');
      expect(error.details.details).toBe('test');
      expect(error.details.type).toBe(StorageError.type.FileDoesNotExist.type);
      Log.log(testName, throwFileDoesNotExistErrorTitle, error);
    }

    Log.it(testName, throwFileDoesNotExistErrorTitle, it1, false);
  });
});

const throwInvalidStateErrorTitle = 'Throw Type Mismatch error';
describe(throwInvalidStateErrorTitle, () => {
  const it1 = 'throws a model error of type File Does Not Exist';
  it(it1, () => {
    Log.it(testName, throwInvalidStateErrorTitle, it1, true);
    try {
      StorageError.throwInvalidStateError('test');
      expect(false).toBe(true);
      Log.log(testName, throwInvalidStateErrorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('StorageError');
      expect(error.details.source).toBe('test');
      expect(error.details.details).not.toBeDefined();
      expect(error.details.type).toBe(StorageError.type.State.type);
      Log.log(testName, throwInvalidStateErrorTitle, error);
    }

    Log.it(testName, throwInvalidStateErrorTitle, it1, false);
  });
});

const throwInvalidMembersErrorTitle = 'Throw Invalid Members error';
describe(throwInvalidMembersErrorTitle, () => {
  const it1 = 'throws a model error of type Invalid Members';
  it(it1, () => {
    Log.it(testName, throwInvalidMembersErrorTitle, it1, true);
    try {
      StorageError.throwInvalidMembersError('test', 'test');
      expect(false).toBe(true);
      Log.log(testName, throwInvalidMembersErrorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('StorageError');
      expect(error.details.source).toBe('test');
      expect(error.details.details.invalidMembers).toBe('test');
      expect(error.details.type).toBe(StorageError.type.InvalidMembers.type);
      Log.log(testName, throwInvalidMembersErrorTitle, error);
    }

    Log.it(testName, throwInvalidMembersErrorTitle, it1, false);
  });
});

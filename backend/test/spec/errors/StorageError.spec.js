const Log = require('../../logger');
const TestConstants = require('../../constants');
const Constants = require('../../../src/utilities/constants');
const StorageError = require('../../../src/errors/StorageError');

const constructorTitle = 'Constructor';
/* eslint-disable no-undef */
describe(constructorTitle, () => {
  const it1 = 'creates a model error object with default details';
  it(it1, () => {
    Log.it(TestConstants.errors.storage.testName, constructorTitle, it1, true);
    const error = new StorageError();
    expect(error.name).toBe(Constants.errors.storage.name);
    expect(Object.keys(error.details).length).toBe(0);
    Log.log(TestConstants.errors.storage.testName, constructorTitle, error);
    Log.it(TestConstants.errors.storage.testName, constructorTitle, it1, false);
  });

  const it2 = 'creates a model error object with specific details';
  it(it2, () => {
    Log.it(TestConstants.errors.storage.testName, constructorTitle, it2, true);
    const error = new StorageError(TestConstants.params.test);
    expect(error.name).toBe(Constants.errors.storage.name);
    expect(error.details).toBe(TestConstants.params.test);
    Log.log(TestConstants.errors.storage.testName, constructorTitle, error);
    Log.it(TestConstants.errors.storage.testName, constructorTitle, it2, false);
  });
});

const formatTitle = 'Format';
describe(formatTitle, () => {
  const it1 = 'creates a model error object with specific details';
  it(it1, () => {
    Log.it(TestConstants.errors.storage.testName, formatTitle, it1, true);
    const type = {
      type: TestConstants.params.test,
    };

    const error = StorageError.format(type, TestConstants.params.test, TestConstants.params.test);
    expect(typeof error.details.id).toBe('string');
    expect(error.details.source).toBe(TestConstants.params.test);
    expect(error.details.type).toBe(type.type);
    expect(error.details.details).toBe(TestConstants.params.test);
    expect(typeof error.details.timestamp).toBe('string');
    Log.log(TestConstants.errors.storage.testName, formatTitle, error);
    Log.it(TestConstants.errors.storage.testName, formatTitle, it1, false);
  });

  const it2 = 'creates a model error object with specific details without a type';
  it(it2, () => {
    Log.it(TestConstants.errors.storage.testName, formatTitle, it2, true);
    const error = StorageError.format(null, TestConstants.params.test, TestConstants.params.test);
    expect(typeof error.details.id).toBe('string');
    expect(error.details.source).toBe(TestConstants.params.test);
    expect(error.details.type).toBe(StorageError.type.Unknown.type);
    expect(error.details.details).toBe(TestConstants.params.test);
    expect(typeof error.details.timestamp).toBe('string');
    Log.log(TestConstants.errors.storage.testName, formatTitle, error);
    Log.it(TestConstants.errors.storage.testName, formatTitle, it2, false);
  });
});

const throwTitle = 'Throw';
describe(throwTitle, () => {
  const it1 = 'throws a model error with specific details';
  it(it1, () => {
    Log.it(TestConstants.errors.storage.testName, throwTitle, it1, true);
    try {
      StorageError.throw(null, TestConstants.params.test, TestConstants.params.test);
      expect(false).toBe(true);
      Log.log(
        TestConstants.errors.storage.testName,
        throwTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (error) {
      expect(error.name).toBe(Constants.errors.storage.name);
      expect(error.details.source).toBe(TestConstants.params.test);
      expect(error.details.details).toBe(TestConstants.params.test);
      expect(error.details.type).toBe(StorageError.type.Unknown.type);
      Log.log(TestConstants.errors.storage.testName, throwTitle, error);
    }

    Log.it(TestConstants.errors.storage.testName, throwTitle, it1, false);
  });

  const it2 = 'throws a model error with specific details and a type';
  it(it2, () => {
    Log.it(TestConstants.errors.storage.testName, throwTitle, it2, true);
    const type = {
      type: TestConstants.params.test,
    };

    try {
      StorageError.throw(type, TestConstants.params.test, TestConstants.params.test);
      expect(false).toBe(true);
      Log.log(
        TestConstants.errors.storage.testName,
        throwTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (error) {
      expect(error.name).toBe(Constants.errors.storage.name);
      expect(error.details.type).toBe(TestConstants.params.test);
      expect(error.details.source).toBe(TestConstants.params.test);
      expect(error.details.details).toBe(TestConstants.params.test);
      Log.log(TestConstants.errors.storage.testName, throwTitle, error);
    }

    Log.it(TestConstants.errors.storage.testName, throwTitle, it2, false);
  });
});

const throwUnknownErrorTitle = 'Throw Unknown error';
describe(throwUnknownErrorTitle, () => {
  const it1 = 'throws a model error of type Unknown';
  it(it1, () => {
    Log.it(TestConstants.errors.storage.testName, throwUnknownErrorTitle, it1, true);
    try {
      StorageError.throwUnknownError(TestConstants.params.test, TestConstants.params.test);
      expect(false).toBe(true);
      Log.log(
        TestConstants.errors.storage.testName,
        throwUnknownErrorTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (error) {
      expect(error.name).toBe(Constants.errors.storage.name);
      expect(error.details.source).toBe(TestConstants.params.test);
      expect(error.details.details).toBe(TestConstants.params.test);
      expect(error.details.type).toBe(StorageError.type.Unknown.type);
      Log.log(TestConstants.errors.storage.testName, throwUnknownErrorTitle, error);
    }

    Log.it(TestConstants.errors.storage.testName, throwUnknownErrorTitle, it1, false);
  });
});

const throwInvalidFileErrorTitle = 'Throw Invalid File error';
describe(throwInvalidFileErrorTitle, () => {
  const it1 = 'throws a model error of type Invalid File';
  it(it1, () => {
    Log.it(TestConstants.errors.storage.testName, throwInvalidFileErrorTitle, it1, true);
    try {
      StorageError.throwInvalidFileError(TestConstants.params.test, TestConstants.params.test);
      expect(false).toBe(true);
      Log.log(
        TestConstants.errors.storage.testName,
        throwInvalidFileErrorTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (error) {
      expect(error.name).toBe(Constants.errors.storage.name);
      expect(error.details.source).toBe(TestConstants.params.test);
      expect(error.details.details).toBe(TestConstants.params.test);
      expect(error.details.type).toBe(StorageError.type.InvalidFile.type);
      Log.log(TestConstants.errors.storage.testName, throwInvalidFileErrorTitle, error);
    }

    Log.it(TestConstants.errors.storage.testName, throwInvalidFileErrorTitle, it1, false);
  });
});

const throwFileDoesNotExistErrorTitle = 'Throw Type Mismatch error';
describe(throwFileDoesNotExistErrorTitle, () => {
  const it1 = 'throws a model error of type File Does Not Exist';
  it(it1, () => {
    Log.it(TestConstants.errors.storage.testName, throwFileDoesNotExistErrorTitle, it1, true);
    try {
      StorageError.throwFileDoesNotExistError(TestConstants.params.test, TestConstants.params.test);
      expect(false).toBe(true);
      Log.log(
        TestConstants.errors.storage.testName,
        throwFileDoesNotExistErrorTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (error) {
      expect(error.name).toBe(Constants.errors.storage.name);
      expect(error.details.source).toBe(TestConstants.params.test);
      expect(error.details.details).toBe(TestConstants.params.test);
      expect(error.details.type).toBe(StorageError.type.FileDoesNotExist.type);
      Log.log(TestConstants.errors.storage.testName, throwFileDoesNotExistErrorTitle, error);
    }

    Log.it(TestConstants.errors.storage.testName, throwFileDoesNotExistErrorTitle, it1, false);
  });
});

const throwInvalidStateErrorTitle = 'Throw Type Mismatch error';
describe(throwInvalidStateErrorTitle, () => {
  const it1 = 'throws a model error of type File Does Not Exist';
  it(it1, () => {
    Log.it(TestConstants.errors.storage.testName, throwInvalidStateErrorTitle, it1, true);
    try {
      StorageError.throwInvalidStateError(TestConstants.params.test);
      expect(false).toBe(true);
      Log.log(
        TestConstants.errors.storage.testName,
        throwInvalidStateErrorTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (error) {
      expect(error.name).toBe(Constants.errors.storage.name);
      expect(error.details.source).toBe(TestConstants.params.test);
      expect(error.details.details).not.toBeDefined();
      expect(error.details.type).toBe(StorageError.type.State.type);
      Log.log(TestConstants.errors.storage.testName, throwInvalidStateErrorTitle, error);
    }

    Log.it(TestConstants.errors.storage.testName, throwInvalidStateErrorTitle, it1, false);
  });
});

const throwInvalidMembersErrorTitle = 'Throw Invalid Members error';
describe(throwInvalidMembersErrorTitle, () => {
  const it1 = 'throws a model error of type Invalid Members';
  it(it1, () => {
    Log.it(TestConstants.errors.storage.testName, throwInvalidMembersErrorTitle, it1, true);
    try {
      StorageError.throwInvalidMembersError(TestConstants.params.test, TestConstants.params.test);
      expect(false).toBe(true);
      Log.log(
        TestConstants.errors.storage.testName,
        throwInvalidMembersErrorTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (error) {
      expect(error.name).toBe(Constants.errors.storage.name);
      expect(error.details.source).toBe(TestConstants.params.test);
      expect(error.details.details.invalidMembers).toBe(TestConstants.params.test);
      expect(error.details.type).toBe(StorageError.type.InvalidMembers.type);
      Log.log(TestConstants.errors.storage.testName, throwInvalidMembersErrorTitle, error);
    }

    Log.it(TestConstants.errors.storage.testName, throwInvalidMembersErrorTitle, it1, false);
  });
});

const Log = require('../../logger');
const TestConstants = require('../../constants');
const Constants = require('../../../src/utilities/constants');
const DatabaseError = require('../../../src/errors/DatabaseError');

const constructorTitle = 'Constructor';
/* eslint-disable no-undef */
describe(constructorTitle, () => {
  const it1 = 'creates a database error object with default details';
  it(it1, () => {
    Log.it(TestConstants.errors.database.testName, constructorTitle, it1, true);
    const error = new DatabaseError();
    expect(error.name).toBe(Constants.errors.database.name);
    expect(Object.keys(error.details).length).toBe(0);
    Log.log(TestConstants.errors.database.testName, constructorTitle, error);
    Log.it(TestConstants.errors.database.testName, constructorTitle, it1, false);
  });

  const it2 = 'creates a database error object with specific details';
  it(it2, () => {
    Log.it(TestConstants.errors.database.testName, constructorTitle, it2, true);
    const error = new DatabaseError(TestConstants.params.test);
    expect(error.name).toBe(Constants.errors.database.name);
    expect(error.details).toBe(TestConstants.params.test);
    Log.log(TestConstants.errors.database.testName, constructorTitle, error);
    Log.it(TestConstants.errors.database.testName, constructorTitle, it2, false);
  });
});

const formatTitle = 'Format';
describe(formatTitle, () => {
  const it1 = 'creates a database error object with specific details';
  it(it1, () => {
    Log.it(TestConstants.errors.database.testName, formatTitle, it1, true);
    const type = {
      type: TestConstants.params.test,
    };

    const error = DatabaseError.format(type, TestConstants.params.test, TestConstants.params.test);
    expect(typeof error.details.id).toBe('string');
    expect(error.details.source).toBe(TestConstants.params.test);
    expect(error.details.type).toBe(type.type);
    expect(error.details.details).toBe(TestConstants.params.test);
    expect(typeof error.details.timestamp).toBe('string');
    Log.log(TestConstants.errors.database.testName, formatTitle, error);
    Log.it(TestConstants.errors.database.testName, formatTitle, it1, false);
  });

  const it2 = 'creates a database error object with specific details without a type';
  it(it2, () => {
    Log.it(TestConstants.errors.database.testName, formatTitle, it2, true);
    const error = DatabaseError.format(null, TestConstants.params.test, TestConstants.params.test);
    expect(typeof error.details.id).toBe('string');
    expect(error.details.source).toBe(TestConstants.params.test);
    expect(error.details.type).toBe(DatabaseError.type.Unknown.type);
    expect(error.details.details).toBe(TestConstants.params.test);
    expect(typeof error.details.timestamp).toBe('string');
    Log.log(TestConstants.errors.database.testName, formatTitle, error);
    Log.it(TestConstants.errors.database.testName, formatTitle, it2, false);
  });
});

const throwTitle = 'Throw';
describe(throwTitle, () => {
  const it1 = 'throws a database error with specific details';
  it(it1, () => {
    Log.it(TestConstants.errors.database.testName, throwTitle, it1, true);
    try {
      DatabaseError.throw(null, TestConstants.params.test, TestConstants.params.test);
      expect(false).toBe(true);
      Log.log(
        TestConstants.errors.database.testName,
        throwTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (error) {
      expect(error.name).toBe(Constants.errors.database.name);
      expect(error.details.source).toBe(TestConstants.params.test);
      expect(error.details.details).toBe(TestConstants.params.test);
      expect(error.details.type).toBe(DatabaseError.type.Unknown.type);
      Log.log(TestConstants.errors.database.testName, throwTitle, error);
    }

    Log.it(TestConstants.errors.database.testName, throwTitle, it1, false);
  });

  const it2 = 'throws a database error with specific details and a type';
  it(it2, () => {
    Log.it(TestConstants.errors.database.testName, throwTitle, it2, true);
    const type = {
      type: TestConstants.params.test,
    };

    try {
      DatabaseError.throw(type, TestConstants.params.test, TestConstants.params.test);
      expect(false).toBe(true);
      Log.log(
        TestConstants.errors.database.testName,
        throwTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (error) {
      expect(error.name).toBe(Constants.errors.database.name);
      expect(error.details.type).toBe(TestConstants.params.test);
      expect(error.details.source).toBe(TestConstants.params.test);
      expect(error.details.details).toBe(TestConstants.params.test);
      Log.log(TestConstants.errors.database.testName, throwTitle, error);
    }

    Log.it(TestConstants.errors.database.testName, throwTitle, it2, false);
  });
});

const throwUrlErrorTitle = 'Throw URL error';
describe(throwUrlErrorTitle, () => {
  const it3 = 'throws a database error of type Url';
  it(it3, () => {
    Log.it(TestConstants.errors.database.testName, throwUrlErrorTitle, it3, true);
    try {
      DatabaseError.throwUrlError(TestConstants.params.test, TestConstants.params.test);
      expect(false).toBe(true);
      Log.log(
        TestConstants.errors.database.testName,
        throwUrlErrorTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (error) {
      expect(error.name).toBe(Constants.errors.database.name);
      expect(error.details.source).toBe(TestConstants.params.test);
      expect(error.details.details).toBe('Url: test');
      expect(error.details.type).toBe(DatabaseError.type.Url.type);
      Log.log(TestConstants.errors.database.testName, throwUrlErrorTitle, error);
    }

    Log.it(TestConstants.errors.database.testName, throwUrlErrorTitle, it3, false);
  });
});

const throwDataErrorTitle = 'Throw Data error';
describe(throwDataErrorTitle, () => {
  const it1 = 'throws a database error of type Data';
  it(it1, () => {
    Log.it(TestConstants.errors.database.testName, throwDataErrorTitle, it1, true);
    try {
      DatabaseError.throwDataError(TestConstants.params.test, TestConstants.params.test);
      expect(false).toBe(true);
      Log.log(
        TestConstants.errors.database.testName,
        throwDataErrorTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (error) {
      expect(error.name).toBe(Constants.errors.database.name);
      expect(error.details.source).toBe(TestConstants.params.test);
      expect(error.details.details).toBe(TestConstants.params.test);
      expect(error.details.type).toBe(DatabaseError.type.Data.type);
      Log.log(TestConstants.errors.database.testName, throwDataErrorTitle, error);
    }

    Log.it(TestConstants.errors.database.testName, throwDataErrorTitle, it1, false);
  });
});

const throwInvalidStateErrorTitle = 'Throw Invalid State error';
describe(throwInvalidStateErrorTitle, () => {
  const it1 = 'throws a database error of type Invalid State';
  it(it1, () => {
    Log.it(TestConstants.errors.database.testName, throwInvalidStateErrorTitle, it1, true);
    try {
      DatabaseError.throwInvalidStateError(TestConstants.params.test);
      expect(false).toBe(true);
      Log.log(
        TestConstants.errors.database.testName,
        throwInvalidStateErrorTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (error) {
      expect(error.name).toBe(Constants.errors.database.name);
      expect(error.details.source).toBe(TestConstants.params.test);
      expect(error.details.type).toBe(DatabaseError.type.State.type);
      Log.log(TestConstants.errors.database.testName, throwInvalidStateErrorTitle, error);
    }

    Log.it(TestConstants.errors.database.testName, throwInvalidStateErrorTitle, it1, false);
  });
});

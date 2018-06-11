const Log = require('../../logger');
const DatabaseError = require('../../../src/errors/DatabaseError');

const testName = 'Database Error';
const constructorTitle = 'Constructor';
/* eslint-disable no-undef */
describe(constructorTitle, () => {
  const it1 = 'creates a database error object with default details';
  it(it1, () => {
    Log.it(testName, constructorTitle, it1, true);
    const error = new DatabaseError();
    expect(error.name).toBe('DatabaseError');
    expect(Object.keys(error.details).length).toBe(0);
    Log.log(testName, constructorTitle, error);
    Log.it(testName, constructorTitle, it1, false);
  });

  const it2 = 'creates a database error object with specific details';
  it(it2, () => {
    Log.it(testName, constructorTitle, it2, true);
    const error = new DatabaseError('test');
    expect(error.name).toBe('DatabaseError');
    expect(error.details).toBe('test');
    Log.log(testName, constructorTitle, error);
    Log.it(testName, constructorTitle, it2, false);
  });
});

const formatTitle = 'Format';
describe(formatTitle, () => {
  const it1 = 'creates a database error object with specific details';
  it(it1, () => {
    Log.it(testName, formatTitle, it1, true);
    const type = {
      type: 'test',
    };

    const error = DatabaseError.format(type, 'test', 'test');
    expect(typeof error.details.id).toBe('string');
    expect(error.details.source).toBe('test');
    expect(error.details.type).toBe(type.type);
    expect(error.details.details).toBe('test');
    expect(typeof error.details.timestamp).toBe('string');
    Log.log(testName, formatTitle, error);
    Log.it(testName, formatTitle, it1, false);
  });

  const it2 = 'creates a database error object with specific details without a type';
  it(it2, () => {
    Log.it(testName, formatTitle, it2, true);
    const error = DatabaseError.format(null, 'test', 'test');
    expect(typeof error.details.id).toBe('string');
    expect(error.details.source).toBe('test');
    expect(error.details.type).toBe(DatabaseError.type.Unknown.type);
    expect(error.details.details).toBe('test');
    expect(typeof error.details.timestamp).toBe('string');
    Log.log(testName, formatTitle, error);
    Log.it(testName, formatTitle, it2, false);
  });
});

const throwTitle = 'Throw';
describe(throwTitle, () => {
  const it1 = 'throws a database error with specific details';
  it(it1, () => {
    Log.it(testName, throwTitle, it1, true);
    try {
      DatabaseError.throw(null, 'test', 'test');
      expect(false).toBe(true);
      Log.log(testName, throwTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DatabaseError');
      expect(error.details.source).toBe('test');
      expect(error.details.details).toBe('test');
      expect(error.details.type).toBe(DatabaseError.type.Unknown.type);
      Log.log(testName, throwTitle, error);
    }

    Log.it(testName, throwTitle, it1, false);
  });

  const it2 = 'throws a database error with specific details and a type';
  it(it2, () => {
    Log.it(testName, throwTitle, it2, true);
    const type = {
      type: 'test',
    };

    try {
      DatabaseError.throw(type, 'test', 'test');
      expect(false).toBe(true);
      Log.log(testName, throwTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DatabaseError');
      expect(error.details.type).toBe('test');
      expect(error.details.source).toBe('test');
      expect(error.details.details).toBe('test');
      Log.log(testName, throwTitle, error);
    }

    Log.it(testName, throwTitle, it2, false);
  });
});

const throwUrlErrorTitle = 'Throw URL error';
describe(throwUrlErrorTitle, () => {
  const it3 = 'throws a database error of type Url';
  it(it3, () => {
    Log.it(testName, throwUrlErrorTitle, it3, true);
    try {
      DatabaseError.throwUrlError('test', 'test');
      expect(false).toBe(true);
      Log.log(testName, throwUrlErrorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DatabaseError');
      expect(error.details.source).toBe('test');
      expect(error.details.details).toBe('Url: test');
      expect(error.details.type).toBe(DatabaseError.type.Url.type);
      Log.log(testName, throwUrlErrorTitle, error);
    }

    Log.it(testName, throwUrlErrorTitle, it3, false);
  });
});

const throwDataErrorTitle = 'Throw Data error';
describe(throwDataErrorTitle, () => {
  const it1 = 'throws a database error of type Data';
  it(it1, () => {
    Log.it(testName, throwDataErrorTitle, it1, true);
    try {
      DatabaseError.throwDataError('test', 'test');
      expect(false).toBe(true);
      Log.log(testName, throwDataErrorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DatabaseError');
      expect(error.details.source).toBe('test');
      expect(error.details.details).toBe('test');
      expect(error.details.type).toBe(DatabaseError.type.Data.type);
      Log.log(testName, throwDataErrorTitle, error);
    }

    Log.it(testName, throwDataErrorTitle, it1, false);
  });
});

const throwInvalidStateErrorTitle = 'Throw Invalid State error';
describe(throwInvalidStateErrorTitle, () => {
  const it1 = 'throws a database error of type Invalid State';
  it(it1, () => {
    Log.it(testName, throwInvalidStateErrorTitle, it1, true);
    try {
      DatabaseError.throwInvalidStateError('test');
      expect(false).toBe(true);
      Log.log(testName, throwInvalidStateErrorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DatabaseError');
      expect(error.details.source).toBe('test');
      expect(error.details.type).toBe(DatabaseError.type.State.type);
      Log.log(testName, throwInvalidStateErrorTitle, error);
    }

    Log.it(testName, throwInvalidStateErrorTitle, it1, false);
  });
});

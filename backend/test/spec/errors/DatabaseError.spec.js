const Log = require('../../logger');
const DatabaseError = require('../../../src/errors/DatabaseError');

const testName = 'Database Error';
const constructorTitle = 'Constructor';
/* eslint-disable no-undef */
describe(constructorTitle, () => {
  it('creates a database error object with default details', (done) => {
    const error = new DatabaseError();
    expect(error.name).toBe('DatabaseError');
    expect(Object.keys(error.details).length).toBe(0);
    Log(testName, constructorTitle, error);
    done();
  });

  it('creates a database error object with specific details', (done) => {
    const error = new DatabaseError('test');
    expect(error.name).toBe('DatabaseError');
    expect(error.details).toBe('test');
    Log(testName, constructorTitle, error);
    done();
  });
});

const formatTitle = 'Format';
describe(formatTitle, () => {
  it('creates a database error object with specific details', (done) => {
    const type = {
      type: 'test',
    };

    const error = DatabaseError.format(type, 'test', 'test');
    expect(typeof error.details.id).toBe('string');
    expect(error.details.source).toBe('test');
    expect(error.details.type).toBe(type.type);
    expect(error.details.details).toBe('test');
    expect(typeof error.details.timestamp).toBe('string');
    Log(testName, formatTitle, error);
    done();
  });

  it('creates a database error object with specific details without a type', (done) => {
    const error = DatabaseError.format(null, 'test', 'test');
    expect(typeof error.details.id).toBe('string');
    expect(error.details.source).toBe('test');
    expect(error.details.type).toBe(DatabaseError.type.Unknown.type);
    expect(error.details.details).toBe('test');
    expect(typeof error.details.timestamp).toBe('string');
    Log(testName, formatTitle, error);
    done();
  });
});

const throwTitle = 'Throw';
describe(throwTitle, () => {
  it('throws a database error with specific details', (done) => {
    try {
      DatabaseError.throw(null, 'test', 'test');
      expect(false).toBe(true);
      Log(testName, throwTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DatabaseError');
      expect(error.details.source).toBe('test');
      expect(error.details.details).toBe('test');
      expect(error.details.type).toBe(DatabaseError.type.Unknown.type);
      Log(testName, throwTitle, error);
    }

    done();
  });

  it('throws a database error with specific details and a type', (done) => {
    const type = {
      type: 'test',
    };

    try {
      DatabaseError.throw(type, 'test', 'test');
      expect(false).toBe(true);
      Log(testName, throwTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DatabaseError');
      expect(error.details.type).toBe('test');
      expect(error.details.source).toBe('test');
      expect(error.details.details).toBe('test');
      Log(testName, throwTitle, error);
    }

    done();
  });
});

const throwUrlErrorTitle = 'Throw URL error';
describe(throwUrlErrorTitle, () => {
  it('throws a database error of type Url', (done) => {
    try {
      DatabaseError.throwUrlError('test', 'test');
      expect(false).toBe(true);
      Log(testName, throwUrlErrorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DatabaseError');
      expect(error.details.source).toBe('test');
      expect(error.details.details).toBe('Url: test');
      expect(error.details.type).toBe(DatabaseError.type.Url.type);
      Log(testName, throwUrlErrorTitle, error);
    }

    done();
  });
});

const throwDataErrorTitle = 'Throw Data error';
describe(throwDataErrorTitle, () => {
  it('throws a database error of type Data', (done) => {
    try {
      DatabaseError.throwDataError('test', 'test');
      expect(false).toBe(true);
      Log(testName, throwDataErrorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DatabaseError');
      expect(error.details.source).toBe('test');
      expect(error.details.details).toBe('test');
      expect(error.details.type).toBe(DatabaseError.type.Data.type);
      Log(testName, throwDataErrorTitle, error);
    }

    done();
  });
});

const throwInvalidStateErrorTitle = 'Throw Invalid State error';
describe(throwInvalidStateErrorTitle, () => {
  it('throws a database error of type Invalid State', (done) => {
    try {
      DatabaseError.throwInvalidStateError('test');
      expect(false).toBe(true);
      Log(testName, throwInvalidStateErrorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DatabaseError');
      expect(error.details.source).toBe('test');
      expect(error.details.type).toBe(DatabaseError.type.State.type);
      Log(testName, throwInvalidStateErrorTitle, error);
    }

    done();
  });
});

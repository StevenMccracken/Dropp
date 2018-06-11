const Log = require('../../logger');
const ModelError = require('../../../src/errors/ModelError');

const testName = 'Model Error';
const constructorTitle = 'Constructor';
/* eslint-disable no-undef */
describe(constructorTitle, () => {
  const it1 = 'creates a model error object with default details';
  it(it1, () => {
    Log.it(testName, constructorTitle, it1, true);
    const error = new ModelError();
    expect(error.name).toBe('ModelError');
    expect(Object.keys(error.details).length).toBe(0);
    Log.log(testName, constructorTitle, error);
    Log.it(testName, constructorTitle, it1, false);
  });

  const it2 = 'creates a model error object with specific details';
  it(it2, () => {
    Log.it(testName, constructorTitle, it2, true);
    const error = new ModelError('test');
    expect(error.name).toBe('ModelError');
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

    const error = ModelError.format(type, 'test', 'test');
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
    const error = ModelError.format(null, 'test', 'test');
    expect(typeof error.details.id).toBe('string');
    expect(error.details.source).toBe('test');
    expect(error.details.type).toBe(ModelError.type.Unknown.type);
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
      ModelError.throw(null, 'test', 'test');
      expect(false).toBe(true);
      Log.log(testName, throwTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('ModelError');
      expect(error.details.source).toBe('test');
      expect(error.details.details).toBe('test');
      expect(error.details.type).toBe(ModelError.type.Unknown.type);
      Log.log(testName, throwTitle, error);
      Log.it(testName, throwTitle, it1, false);
    }
  });

  const it2 = 'throws a model error with specific details and a type';
  it(it2, () => {
    Log.it(testName, throwTitle, it2, true);
    const type = {
      type: 'test',
    };

    try {
      ModelError.throw(type, 'test', 'test');
      expect(false).toBe(true);
      Log.log(testName, throwTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('ModelError');
      expect(error.details.type).toBe('test');
      expect(error.details.source).toBe('test');
      expect(error.details.details).toBe('test');
      Log.log(testName, throwTitle, error);
    }

    Log.it(testName, throwTitle, it2, false);
  });
});

const throwConstructorErrorTitle = 'Throw Constructor error';
describe(throwConstructorErrorTitle, () => {
  const it1 = 'throws a model error of type Constructor';
  it(it1, () => {
    Log.it(testName, throwConstructorErrorTitle, it1, true);
    try {
      ModelError.throwConstructorError('test', 'test');
      expect(false).toBe(true);
      Log.log(testName, throwConstructorErrorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('ModelError');
      expect(error.details.source).toBe('test');
      expect(error.details.details).toBe('test');
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      Log.log(testName, throwConstructorErrorTitle, error);
    }

    Log.it(testName, throwConstructorErrorTitle, it1, false);
  });
});

const throwInvalidMembersErrorTitle = 'Throw Invalid Members error';
describe(throwInvalidMembersErrorTitle, () => {
  const it1 = 'throws a model error of type Invalid Members';
  it(it1, () => {
    Log.it(testName, throwInvalidMembersErrorTitle, it1, true);
    try {
      ModelError.throwInvalidMembersError('test', 'test');
      expect(false).toBe(true);
      Log.log(testName, throwInvalidMembersErrorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('ModelError');
      expect(error.details.source).toBe('test');
      expect(error.details.details.invalidMembers).toBe('test');
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      Log.log(testName, throwInvalidMembersErrorTitle, error);
    }

    Log.it(testName, throwInvalidMembersErrorTitle, it1, false);
  });
});

const throwTypeMismatchErrorTitle = 'Throw Type Mismatch error';
describe(throwTypeMismatchErrorTitle, () => {
  const it1 = 'throws a model error of type Type Mismatch';
  it(it1, () => {
    Log.it(testName, throwTypeMismatchErrorTitle, it1, true);
    try {
      ModelError.throwTypeMismatchError('test');
      expect(false).toBe(true);
      Log.log(testName, throwTypeMismatchErrorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('ModelError');
      expect(error.details.source).toBe('test');
      expect(error.details.details).not.toBeDefined();
      expect(error.details.type).toBe(ModelError.type.TypeMismatch.type);
      Log.log(testName, throwTypeMismatchErrorTitle, error);
    }

    Log.it(testName, throwTypeMismatchErrorTitle, it1, false);
  });
});

const Log = require('../../logger');
const TestConstants = require('../../constants');
const ModelError = require('../../../src/errors/ModelError');
const Constants = require('../../../src/utilities/constants');

const constructorTitle = 'Constructor';
/* eslint-disable no-undef */
describe(constructorTitle, () => {
  const it1 = 'creates a model error object with default details';
  it(it1, () => {
    Log.it(TestConstants.errors.model.testName, constructorTitle, it1, true);
    const error = new ModelError();
    expect(error.name).toBe(Constants.errors.model.name);
    expect(Object.keys(error.details).length).toBe(0);
    Log.log(TestConstants.errors.model.testName, constructorTitle, error);
    Log.it(TestConstants.errors.model.testName, constructorTitle, it1, false);
  });

  const it2 = 'creates a model error object with specific details';
  it(it2, () => {
    Log.it(TestConstants.errors.model.testName, constructorTitle, it2, true);
    const error = new ModelError(TestConstants.params.test);
    expect(error.name).toBe(Constants.errors.model.name);
    expect(error.details).toBe(TestConstants.params.test);
    Log.log(TestConstants.errors.model.testName, constructorTitle, error);
    Log.it(TestConstants.errors.model.testName, constructorTitle, it2, false);
  });
});

const formatTitle = 'Format';
describe(formatTitle, () => {
  const it1 = 'creates a model error object with specific details';
  it(it1, () => {
    Log.it(TestConstants.errors.model.testName, formatTitle, it1, true);
    const type = { type: TestConstants.params.test };
    const error = ModelError.format(type, TestConstants.params.test, TestConstants.params.test);
    expect(typeof error.details.id).toBe('string');
    expect(error.details.source).toBe(TestConstants.params.test);
    expect(error.details.type).toBe(type.type);
    expect(error.details.details).toBe(TestConstants.params.test);
    expect(typeof error.details.timestamp).toBe('string');
    Log.log(TestConstants.errors.model.testName, formatTitle, error);
    Log.it(TestConstants.errors.model.testName, formatTitle, it1, false);
  });

  const it2 = 'creates a model error object with specific details without a type';
  it(it2, () => {
    Log.it(TestConstants.errors.model.testName, formatTitle, it2, true);
    const error = ModelError.format(null, TestConstants.params.test, TestConstants.params.test);
    expect(typeof error.details.id).toBe('string');
    expect(error.details.source).toBe(TestConstants.params.test);
    expect(error.details.type).toBe(ModelError.type.Unknown.type);
    expect(error.details.details).toBe(TestConstants.params.test);
    expect(typeof error.details.timestamp).toBe('string');
    Log.log(TestConstants.errors.model.testName, formatTitle, error);
    Log.it(TestConstants.errors.model.testName, formatTitle, it2, false);
  });
});

const throwTitle = 'Throw';
describe(throwTitle, () => {
  const it1 = 'throws a model error with specific details';
  it(it1, () => {
    Log.it(TestConstants.errors.model.testName, throwTitle, it1, true);
    try {
      ModelError.throw(null, TestConstants.params.test, TestConstants.params.test);
      expect(false).toBe(true);
      Log.log(
        TestConstants.errors.model.testName,
        throwTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (error) {
      expect(error.name).toBe(Constants.errors.model.name);
      expect(error.details.source).toBe(TestConstants.params.test);
      expect(error.details.details).toBe(TestConstants.params.test);
      expect(error.details.type).toBe(ModelError.type.Unknown.type);
      Log.log(TestConstants.errors.model.testName, throwTitle, error);
      Log.it(TestConstants.errors.model.testName, throwTitle, it1, false);
    }
  });

  const it2 = 'throws a model error with specific details and a type';
  it(it2, () => {
    Log.it(TestConstants.errors.model.testName, throwTitle, it2, true);
    const type = {
      type: TestConstants.params.test,
    };

    try {
      ModelError.throw(type, TestConstants.params.test, TestConstants.params.test);
      expect(false).toBe(true);
      Log.log(
        TestConstants.errors.model.testName,
        throwTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (error) {
      expect(error.name).toBe(Constants.errors.model.name);
      expect(error.details.type).toBe(TestConstants.params.test);
      expect(error.details.source).toBe(TestConstants.params.test);
      expect(error.details.details).toBe(TestConstants.params.test);
      Log.log(TestConstants.errors.model.testName, throwTitle, error);
    }

    Log.it(TestConstants.errors.model.testName, throwTitle, it2, false);
  });
});

const throwConstructorErrorTitle = 'Throw Constructor error';
describe(throwConstructorErrorTitle, () => {
  const it1 = 'throws a model error of type Constructor';
  it(it1, () => {
    Log.it(TestConstants.errors.model.testName, throwConstructorErrorTitle, it1, true);
    try {
      ModelError.throwConstructorError(TestConstants.params.test, TestConstants.params.test);
      expect(false).toBe(true);
      Log.log(
        TestConstants.errors.model.testName,
        throwConstructorErrorTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (error) {
      expect(error.name).toBe(Constants.errors.model.name);
      expect(error.details.source).toBe(TestConstants.params.test);
      expect(error.details.details).toBe(TestConstants.params.test);
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      Log.log(TestConstants.errors.model.testName, throwConstructorErrorTitle, error);
    }

    Log.it(TestConstants.errors.model.testName, throwConstructorErrorTitle, it1, false);
  });
});

const throwInvalidMembersErrorTitle = 'Throw Invalid Members error';
describe(throwInvalidMembersErrorTitle, () => {
  const it1 = 'throws a model error of type Invalid Members';
  it(it1, () => {
    Log.it(TestConstants.errors.model.testName, throwInvalidMembersErrorTitle, it1, true);
    try {
      ModelError.throwInvalidMembersError(TestConstants.params.test, TestConstants.params.test);
      expect(false).toBe(true);
      Log.log(
        TestConstants.errors.model.testName,
        throwInvalidMembersErrorTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (error) {
      expect(error.name).toBe(Constants.errors.model.name);
      expect(error.details.source).toBe(TestConstants.params.test);
      expect(error.details.details.invalidMembers).toBe(TestConstants.params.test);
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      Log.log(TestConstants.errors.model.testName, throwInvalidMembersErrorTitle, error);
    }

    Log.it(TestConstants.errors.model.testName, throwInvalidMembersErrorTitle, it1, false);
  });
});

const throwTypeMismatchErrorTitle = 'Throw Type Mismatch error';
describe(throwTypeMismatchErrorTitle, () => {
  const it1 = 'throws a model error of type Type Mismatch';
  it(it1, () => {
    Log.it(TestConstants.errors.model.testName, throwTypeMismatchErrorTitle, it1, true);
    try {
      ModelError.throwTypeMismatchError(TestConstants.params.test);
      expect(false).toBe(true);
      Log.log(
        TestConstants.errors.model.testName,
        throwTypeMismatchErrorTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (error) {
      expect(error.name).toBe(Constants.errors.model.name);
      expect(error.details.source).toBe(TestConstants.params.test);
      expect(error.details.details).not.toBeDefined();
      expect(error.details.type).toBe(ModelError.type.TypeMismatch.type);
      Log.log(TestConstants.errors.model.testName, throwTypeMismatchErrorTitle, error);
    }

    Log.it(TestConstants.errors.model.testName, throwTypeMismatchErrorTitle, it1, false);
  });
});

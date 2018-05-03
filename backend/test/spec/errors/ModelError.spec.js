const Log = require('../../logger');
const ModelError = require('../../../src/errors/ModelError');

/**
 * Logs a message for the current test file
 * @param {String} _title the describe label
 * @param {String|Object} _details the log details
 */
function log(_title, _details) {
  Log(`Model Error ${_title}`, _details);
}

const constructorTitle = 'Constructor';
/* eslint-disable no-undef */
describe(constructorTitle, () => {
  it('creates a model error object with default details', (done) => {
    const error = new ModelError();
    expect(error.name).toBe('ModelError');
    expect(Object.keys(error.details).length).toBe(0);
    log(constructorTitle, error);
    done();
  });

  it('creates a model error object with specific details', (done) => {
    const error = new ModelError('test');
    expect(error.name).toBe('ModelError');
    expect(error.details).toBe('test');
    log(constructorTitle, error);
    done();
  });
});

const formatTitle = 'Format';
describe(formatTitle, () => {
  it('creates a model error object with specific details', (done) => {
    const type = {
      type: 'test',
    };

    const error = ModelError.format(type, 'test', 'test');
    expect(typeof error.details.id).toBe('string');
    expect(error.details.source).toBe('test');
    expect(error.details.type).toBe(type.type);
    expect(error.details.details).toBe('test');
    expect(typeof error.details.timestamp).toBe('string');
    log(formatTitle, error);
    done();
  });

  it('creates a model error object with specific details without a type', (done) => {
    const error = ModelError.format(null, 'test', 'test');
    expect(typeof error.details.id).toBe('string');
    expect(error.details.source).toBe('test');
    expect(error.details.type).toBe(ModelError.type.Unknown.type);
    expect(error.details.details).toBe('test');
    expect(typeof error.details.timestamp).toBe('string');
    log(formatTitle, error);
    done();
  });
});

const throwTitle = 'Throw';
describe(throwTitle, () => {
  it('throws a model error with specific details', (done) => {
    try {
      ModelError.throw(null, 'test', 'test');
      expect(false).toBe(true);
      log(throwTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('ModelError');
      expect(error.details.source).toBe('test');
      expect(error.details.details).toBe('test');
      expect(error.details.type).toBe(ModelError.type.Unknown.type);
      log(throwTitle, error);
    }

    done();
  });

  it('throws a model error with specific details and a type', (done) => {
    const type = {
      type: 'test',
    };

    try {
      ModelError.throw(type, 'test', 'test');
      expect(false).toBe(true);
      log(throwTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('ModelError');
      expect(error.details.type).toBe('test');
      expect(error.details.source).toBe('test');
      expect(error.details.details).toBe('test');
      log(throwTitle, error);
    }

    done();
  });
});

const throwConstructorErrorTitle = 'Throw Constructor error';
describe(throwConstructorErrorTitle, () => {
  it('throws a model error of type Constructor', (done) => {
    try {
      ModelError.throwConstructorError('test', 'test');
      expect(false).toBe(true);
      log(throwConstructorErrorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('ModelError');
      expect(error.details.source).toBe('test');
      expect(error.details.details).toBe('test');
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      log(throwConstructorErrorTitle, error);
    }

    done();
  });
});

const throwInvalidMembersErrorTitle = 'Throw Invalid Members error';
describe(throwInvalidMembersErrorTitle, () => {
  it('throws a model error of type Invalid Members', (done) => {
    try {
      ModelError.throwInvalidMembersError('test', 'test');
      expect(false).toBe(true);
      log(throwInvalidMembersErrorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('ModelError');
      expect(error.details.source).toBe('test');
      expect(error.details.details.invalidMembers).toBe('test');
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      log(throwInvalidMembersErrorTitle, error);
    }

    done();
  });
});
/* eslint-enable no-undef */

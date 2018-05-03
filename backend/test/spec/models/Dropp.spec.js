const Log = require('../../logger');
const Dropp = require('../../../src/models/Dropp');
// const Utils = require('../../../src/utilities/utils');
const ModelError = require('../../../src/errors/ModelError');

/**
 * Logs a message for a User Middleware test
 * @param {String} _title the describe label
 * @param {String|Object} _details the log details
 */
function log(_title, _details) {
  Log(`Dropp Model ${_title}`, _details);
}

const constructorTitle = 'Constructor';
/* eslint-disable no-undef */
describe(constructorTitle, () => {
  beforeEach(() => {
    this.details = {
      location: '0,0',
      timestamp: 1,
      username: 'test',
      text: 'test',
      media: 'false',
    };
  });

  afterEach(() => {
    delete this.details;
  });

  it('throws an error for an invalid details object', (done) => {
    try {
      const dropp = new Dropp();
      expect(dropp).not.toBeDefined();
      log(constructorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('ModelError');
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      log(constructorTitle, error);
    }

    done();
  });

  it('throws an error for a missing location', (done) => {
    try {
      delete this.details.location;
      const dropp = new Dropp(this.details);
      expect(dropp).not.toBeDefined();
      log(constructorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('ModelError');
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      expect(error.details.details.invalidMembers.length).toBe(1);
      expect(error.details.details.invalidMembers[0]).toBe('location');
      log(constructorTitle, error);
    }

    done();
  });

  it('throws an error for a missing timestamp', (done) => {
    try {
      delete this.details.timestamp;
      const dropp = new Dropp(this.details);
      expect(dropp).not.toBeDefined();
      log(constructorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('ModelError');
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      expect(error.details.details.invalidMembers.length).toBe(1);
      expect(error.details.details.invalidMembers[0]).toBe('timestamp');
      log(constructorTitle, error);
    }

    done();
  });

  it('throws an error for a missing username', (done) => {
    try {
      delete this.details.username;
      const dropp = new Dropp(this.details);
      expect(dropp).not.toBeDefined();
      log(constructorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('ModelError');
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      expect(error.details.details.invalidMembers.length).toBe(1);
      expect(error.details.details.invalidMembers[0]).toBe('username');
      log(constructorTitle, error);
    }

    done();
  });

  it('throws an error for missing text', (done) => {
    try {
      delete this.details.text;
      const dropp = new Dropp(this.details);
      expect(dropp).not.toBeDefined();
      log(constructorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('ModelError');
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      expect(error.details.details.invalidMembers.length).toBe(1);
      expect(error.details.details.invalidMembers[0]).toBe('text');
      log(constructorTitle, error);
    }

    done();
  });

  it('throws an error for missing media', (done) => {
    try {
      delete this.details.media;
      const dropp = new Dropp(this.details);
      expect(dropp).not.toBeDefined();
      log(constructorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('ModelError');
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      expect(error.details.details.invalidMembers.length).toBe(1);
      expect(error.details.details.invalidMembers[0]).toBe('media');
      log(constructorTitle, error);
    }

    done();
  });

  it('creates a dropp object with the given details', (done) => {
    const dropp = new Dropp(this.details);
    expect(dropp.id).not.toBeDefined();
    expect(dropp.location).toBe(this.details.location);
    expect(dropp.media).toBe(this.details.media);
    expect(dropp.text).toBe(this.details.text);
    expect(dropp.timestamp).toBe(this.details.timestamp);
    expect(dropp.username).toBe(this.details.username);

    const responseData = dropp.data;
    expect(responseData.id).not.toBeDefined();
    expect(responseData.location).toBe(this.details.location);
    expect(responseData.media).toBe(this.details.media);
    expect(responseData.text).toBe(this.details.text);
    expect(responseData.timestamp).toBe(this.details.timestamp);
    expect(responseData.username).toBe(this.details.username);
    log(constructorTitle, dropp);
    done();
  });
});
/* eslint-enable no-undef */

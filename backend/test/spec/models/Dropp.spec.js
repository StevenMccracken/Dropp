const Log = require('../../logger');
const Dropp = require('../../../src/models/Dropp');
const Location = require('../../../src/models/Location');
const ModelError = require('../../../src/errors/ModelError');

const testName = 'Dropp Model';
const constructorTitle = 'Constructor';
/* eslint-disable no-undef */
describe(constructorTitle, () => {
  beforeEach(() => {
    this.location = new Location({
      latitude: 0,
      longitude: 0,
    });

    this.details = {
      location: this.location,
      timestamp: 1,
      username: 'test',
      text: 'test',
      media: 'false',
    };
  });

  afterEach(() => {
    delete this.details;
    delete this.location;
  });

  it('throws an error for an invalid details object', (done) => {
    try {
      const dropp = new Dropp();
      expect(dropp).not.toBeDefined();
      Log(testName, constructorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('ModelError');
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      Log(testName, constructorTitle, error);
    }

    done();
  });

  it('throws an error for a missing location', (done) => {
    try {
      delete this.details.location;
      const dropp = new Dropp(this.details);
      expect(dropp).not.toBeDefined();
      Log(testName, constructorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('ModelError');
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      expect(error.details.details.invalidMembers.length).toBe(1);
      expect(error.details.details.invalidMembers[0]).toBe('location');
      Log(testName, constructorTitle, error);
    }

    done();
  });

  it('throws an error for a missing timestamp', (done) => {
    try {
      delete this.details.timestamp;
      const dropp = new Dropp(this.details);
      expect(dropp).not.toBeDefined();
      Log(testName, constructorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('ModelError');
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      expect(error.details.details.invalidMembers.length).toBe(1);
      expect(error.details.details.invalidMembers[0]).toBe('timestamp');
      Log(testName, constructorTitle, error);
    }

    done();
  });

  it('throws an error for a missing username', (done) => {
    try {
      delete this.details.username;
      const dropp = new Dropp(this.details);
      expect(dropp).not.toBeDefined();
      Log(testName, constructorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('ModelError');
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      expect(error.details.details.invalidMembers.length).toBe(1);
      expect(error.details.details.invalidMembers[0]).toBe('username');
      Log(testName, constructorTitle, error);
    }

    done();
  });

  it('throws an error for missing text', (done) => {
    try {
      delete this.details.text;
      const dropp = new Dropp(this.details);
      expect(dropp).not.toBeDefined();
      Log(testName, constructorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('ModelError');
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      expect(error.details.details.invalidMembers.length).toBe(1);
      expect(error.details.details.invalidMembers[0]).toBe('text');
      Log(testName, constructorTitle, error);
    }

    done();
  });

  it('throws an error for missing media', (done) => {
    try {
      delete this.details.media;
      const dropp = new Dropp(this.details);
      expect(dropp).not.toBeDefined();
      Log(testName, constructorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('ModelError');
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      expect(error.details.details.invalidMembers.length).toBe(1);
      expect(error.details.details.invalidMembers[0]).toBe('media');
      Log(testName, constructorTitle, error);
    }

    done();
  });

  it('creates a dropp object with the given details', (done) => {
    const dropp = new Dropp(this.details);
    expect(dropp.id).not.toBeDefined();
    expect(dropp.location.latitude).toBe(this.details.location.latitude);
    expect(dropp.location.longitude).toBe(this.details.location.longitude);
    expect(dropp.media).toBe(this.details.media);
    expect(dropp.text).toBe(this.details.text);
    expect(dropp.timestamp).toBe(this.details.timestamp);
    expect(dropp.username).toBe(this.details.username);

    const responseData = dropp.databaseData;
    expect(responseData.id).not.toBeDefined();
    expect(responseData.location.latitude).toBe(this.details.location.latitude);
    expect(responseData.location.longitude).toBe(this.details.location.longitude);
    expect(responseData.media).toBe(this.details.media);
    expect(responseData.text).toBe(this.details.text);
    expect(responseData.timestamp).toBe(this.details.timestamp);
    expect(responseData.username).toBe(this.details.username);
    Log(testName, constructorTitle, dropp);
    done();
  });
});

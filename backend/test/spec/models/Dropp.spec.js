const Log = require('../../logger');
const Dropp = require('../../../src/models/Dropp');
const Location = require('../../../src/models/Location');
const ModelError = require('../../../src/errors/ModelError');

const testName = 'Dropp Model';
const constructorTitle = 'Constructor';
/* eslint-disable no-undef */
describe(constructorTitle, () => {
  beforeEach(() => {
    Log.beforeEach(testName, constructorTitle, true);
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

    Log.beforeEach(testName, constructorTitle, false);
  });

  afterEach(() => {
    Log.afterEach(testName, constructorTitle, true);
    delete this.details;
    delete this.location;
    Log.afterEach(testName, constructorTitle, false);
  });

  const it1 = 'throws an error for an invalid details object';
  it(it1, () => {
    Log.it(testName, constructorTitle, it1, true);
    try {
      const dropp = new Dropp();
      expect(dropp).not.toBeDefined();
      Log.log(testName, constructorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('ModelError');
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      Log.log(testName, constructorTitle, error);
    }

    Log.it(testName, constructorTitle, it1, false);
  });

  const it2 = 'throws an error for a missing location';
  it(it2, () => {
    Log.it(testName, constructorTitle, it2, true);
    try {
      delete this.details.location;
      const dropp = new Dropp(this.details);
      expect(dropp).not.toBeDefined();
      Log.log(testName, constructorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('ModelError');
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      expect(error.details.details.invalidMembers.length).toBe(1);
      expect(error.details.details.invalidMembers[0]).toBe('location');
      Log.log(testName, constructorTitle, error);
    }

    Log.it(testName, constructorTitle, it2, false);
  });

  const it3 = 'throws an error for an invalid location';
  it(it3, () => {
    Log.it(testName, constructorTitle, it3, true);
    try {
      this.details.location = this.location.databaseData;
      delete this.details.location.latitude;
      const dropp = new Dropp(this.details);
      expect(dropp).not.toBeDefined();
      Log.log(testName, constructorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('ModelError');
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      expect(error.details.details.invalidMembers.length).toBe(1);
      expect(error.details.details.invalidMembers[0]).toBe('location');
      Log.log(testName, constructorTitle, error);
    }

    Log.it(testName, constructorTitle, it3, false);
  });

  const it4 = 'throws an error for a missing timestamp';
  it(it4, () => {
    Log.it(testName, constructorTitle, it4, true);
    try {
      delete this.details.timestamp;
      const dropp = new Dropp(this.details);
      expect(dropp).not.toBeDefined();
      Log.log(testName, constructorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('ModelError');
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      expect(error.details.details.invalidMembers.length).toBe(1);
      expect(error.details.details.invalidMembers[0]).toBe('timestamp');
      Log.log(testName, constructorTitle, error);
    }

    Log.it(testName, constructorTitle, it4, false);
  });

  const it5 = 'throws an error for a missing username';
  it(it5, () => {
    Log.it(testName, constructorTitle, it5, true);
    try {
      delete this.details.username;
      const dropp = new Dropp(this.details);
      expect(dropp).not.toBeDefined();
      Log.log(testName, constructorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('ModelError');
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      expect(error.details.details.invalidMembers.length).toBe(1);
      expect(error.details.details.invalidMembers[0]).toBe('username');
      Log.log(testName, constructorTitle, error);
    }

    Log.it(testName, constructorTitle, it5, false);
  });

  const it6 = 'throws an error for missing text';
  it(it6, () => {
    Log.it(testName, constructorTitle, it6, true);
    try {
      delete this.details.text;
      const dropp = new Dropp(this.details);
      expect(dropp).not.toBeDefined();
      Log.log(testName, constructorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('ModelError');
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      expect(error.details.details.invalidMembers.length).toBe(1);
      expect(error.details.details.invalidMembers[0]).toBe('text');
      Log.log(testName, constructorTitle, error);
    }

    Log.it(testName, constructorTitle, it6, false);
  });

  const it7 = 'throws an error for missing media';
  it(it7, () => {
    Log.it(testName, constructorTitle, it7, true);
    try {
      delete this.details.media;
      const dropp = new Dropp(this.details);
      expect(dropp).not.toBeDefined();
      Log.log(testName, constructorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('ModelError');
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      expect(error.details.details.invalidMembers.length).toBe(1);
      expect(error.details.details.invalidMembers[0]).toBe('media');
      Log.log(testName, constructorTitle, error);
    }

    Log.it(testName, constructorTitle, it7, false);
  });

  const it8 = 'creates a dropp object with the given details';
  it(it8, () => {
    Log.it(testName, constructorTitle, it8, true);
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

    const data = dropp.publicData;
    expect(data.id).toBe(this.details.id);
    expect(data.location.latitude).toBe(this.details.location.latitude);
    expect(data.location.longitude).toBe(this.details.location.longitude);
    expect(data.media).toBe(this.details.media);
    expect(data.text).toBe(this.details.text);
    expect(data.timestamp).toBe(this.details.timestamp);
    expect(data.username).toBe(this.details.username);
    Log.log(testName, constructorTitle, dropp);
    Log.it(testName, constructorTitle, it8, false);
  });

  const it9 = 'creates a dropp object with location-like location object';
  it(it9, () => {
    Log.it(testName, constructorTitle, it9, true);
    this.details.location = this.location.databaseData;
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

    const data = dropp.publicData;
    expect(data.id).toBe(this.details.id);
    expect(data.location.latitude).toBe(this.details.location.latitude);
    expect(data.location.longitude).toBe(this.details.location.longitude);
    expect(data.media).toBe(this.details.media);
    expect(data.text).toBe(this.details.text);
    expect(data.timestamp).toBe(this.details.timestamp);
    expect(data.username).toBe(this.details.username);
    Log.log(testName, constructorTitle, dropp);
    Log.it(testName, constructorTitle, it9, false);
  });
});

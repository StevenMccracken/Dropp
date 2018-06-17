const Log = require('../../logger');
const TestConstants = require('../../constants');
const Dropp = require('../../../src/models/Dropp');
const Location = require('../../../src/models/Location');
const ModelError = require('../../../src/errors/ModelError');
const Constants = require('../../../src/utilities/constants');

const constructorTitle = 'Constructor';
/* eslint-disable no-undef */
describe(constructorTitle, () => {
  beforeEach(() => {
    Log.beforeEach(TestConstants.models.dropp.testName, constructorTitle, true);
    this.location = new Location({
      latitude: TestConstants.params.defaultLocation,
      longitude: TestConstants.params.defaultLocation,
    });

    this.details = {
      location: this.location,
      timestamp: TestConstants.params.defaultTimestamp,
      username: TestConstants.params.test,
      text: TestConstants.params.test,
      media: false,
    };

    Log.beforeEach(TestConstants.models.dropp.testName, constructorTitle, false);
  });

  afterEach(() => {
    Log.afterEach(TestConstants.models.dropp.testName, constructorTitle, true);
    delete this.details;
    delete this.location;
    Log.afterEach(TestConstants.models.dropp.testName, constructorTitle, false);
  });

  const it1 = 'throws an error for an invalid details object';
  it(it1, () => {
    Log.it(TestConstants.models.dropp.testName, constructorTitle, it1, true);
    try {
      const dropp = new Dropp();
      expect(dropp).not.toBeDefined();
      Log.log(
        TestConstants.models.dropp.testName,
        constructorTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (error) {
      expect(error.name).toBe(Constants.errors.model.name);
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      Log.log(TestConstants.models.dropp.testName, constructorTitle, error);
    }

    Log.it(TestConstants.models.dropp.testName, constructorTitle, it1, false);
  });

  const it2 = 'throws an error for a missing location';
  it(it2, () => {
    Log.it(TestConstants.models.dropp.testName, constructorTitle, it2, true);
    try {
      delete this.details.location;
      const dropp = new Dropp(this.details);
      expect(dropp).not.toBeDefined();
      Log.log(
        TestConstants.models.dropp.testName,
        constructorTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (error) {
      expect(error.name).toBe(Constants.errors.model.name);
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      expect(error.details.details.invalidMembers.length).toBe(1);
      expect(error.details.details.invalidMembers[0]).toBe(Constants.params.location);
      Log.log(TestConstants.models.dropp.testName, constructorTitle, error);
    }

    Log.it(TestConstants.models.dropp.testName, constructorTitle, it2, false);
  });

  const it3 = 'throws an error for an invalid location';
  it(it3, () => {
    Log.it(TestConstants.models.dropp.testName, constructorTitle, it3, true);
    try {
      this.details.location = this.location.databaseData;
      delete this.details.location.latitude;
      const dropp = new Dropp(this.details);
      expect(dropp).not.toBeDefined();
      Log.log(
        TestConstants.models.dropp.testName,
        constructorTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (error) {
      expect(error.name).toBe(Constants.errors.model.name);
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      expect(error.details.details.invalidMembers.length).toBe(1);
      expect(error.details.details.invalidMembers[0]).toBe(Constants.params.location);
      Log.log(TestConstants.models.dropp.testName, constructorTitle, error);
    }

    Log.it(TestConstants.models.dropp.testName, constructorTitle, it3, false);
  });

  const it4 = 'throws an error for a missing timestamp';
  it(it4, () => {
    Log.it(TestConstants.models.dropp.testName, constructorTitle, it4, true);
    try {
      delete this.details.timestamp;
      const dropp = new Dropp(this.details);
      expect(dropp).not.toBeDefined();
      Log.log(
        TestConstants.models.dropp.testName,
        constructorTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (error) {
      expect(error.name).toBe(Constants.errors.model.name);
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      expect(error.details.details.invalidMembers.length).toBe(1);
      expect(error.details.details.invalidMembers[0]).toBe(Constants.params.timestamp);
      Log.log(TestConstants.models.dropp.testName, constructorTitle, error);
    }

    Log.it(TestConstants.models.dropp.testName, constructorTitle, it4, false);
  });

  const it5 = 'throws an error for a missing username';
  it(it5, () => {
    Log.it(TestConstants.models.dropp.testName, constructorTitle, it5, true);
    try {
      delete this.details.username;
      const dropp = new Dropp(this.details);
      expect(dropp).not.toBeDefined();
      Log.log(
        TestConstants.models.dropp.testName,
        constructorTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (error) {
      expect(error.name).toBe(Constants.errors.model.name);
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      expect(error.details.details.invalidMembers.length).toBe(1);
      expect(error.details.details.invalidMembers[0]).toBe(Constants.params.username);
      Log.log(TestConstants.models.dropp.testName, constructorTitle, error);
    }

    Log.it(TestConstants.models.dropp.testName, constructorTitle, it5, false);
  });

  const it6 = 'throws an error for missing text';
  it(it6, () => {
    Log.it(TestConstants.models.dropp.testName, constructorTitle, it6, true);
    try {
      delete this.details.text;
      const dropp = new Dropp(this.details);
      expect(dropp).not.toBeDefined();
      Log.log(
        TestConstants.models.dropp.testName,
        constructorTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (error) {
      expect(error.name).toBe(Constants.errors.model.name);
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      expect(error.details.details.invalidMembers.length).toBe(1);
      expect(error.details.details.invalidMembers[0]).toBe(Constants.params.text);
      Log.log(TestConstants.models.dropp.testName, constructorTitle, error);
    }

    Log.it(TestConstants.models.dropp.testName, constructorTitle, it6, false);
  });

  const it7 = 'throws an error for missing media';
  it(it7, () => {
    Log.it(TestConstants.models.dropp.testName, constructorTitle, it7, true);
    try {
      delete this.details.media;
      const dropp = new Dropp(this.details);
      expect(dropp).not.toBeDefined();
      Log.log(
        TestConstants.models.dropp.testName,
        constructorTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (error) {
      expect(error.name).toBe(Constants.errors.model.name);
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      expect(error.details.details.invalidMembers.length).toBe(1);
      expect(error.details.details.invalidMembers[0]).toBe(Constants.params.media);
      Log.log(TestConstants.models.dropp.testName, constructorTitle, error);
    }

    Log.it(TestConstants.models.dropp.testName, constructorTitle, it7, false);
  });

  const it8 = 'creates a dropp object with the given details';
  it(it8, () => {
    Log.it(TestConstants.models.dropp.testName, constructorTitle, it8, true);
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
    Log.log(TestConstants.models.dropp.testName, constructorTitle, dropp);
    Log.it(TestConstants.models.dropp.testName, constructorTitle, it8, false);
  });

  const it9 = 'creates a dropp object with location-like location object';
  it(it9, () => {
    Log.it(TestConstants.models.dropp.testName, constructorTitle, it9, true);
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
    Log.log(TestConstants.models.dropp.testName, constructorTitle, dropp);
    Log.it(TestConstants.models.dropp.testName, constructorTitle, it9, false);
  });
});

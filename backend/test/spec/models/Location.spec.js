const Log = require('../../logger');
const TestConstants = require('../../constants');
const Location = require('../../../src/models/Location');
const ModelError = require('../../../src/errors/ModelError');
const Constants = require('../../../src/utilities/constants');

const constructorTitle = 'Constructor';
/* eslint-disable no-undef */
describe(constructorTitle, () => {
  beforeEach(() => {
    Log.beforeEach(TestConstants.models.location.testName, constructorTitle, true);
    this.details = {
      latitude: TestConstants.params.defaultLocation,
      longitude: TestConstants.params.defaultLocation,
    };

    Log.beforeEach(TestConstants.models.location.testName, constructorTitle, false);
  });

  afterEach(() => {
    Log.afterEach(TestConstants.models.location.testName, constructorTitle, true);
    delete this.details;
    Log.afterEach(TestConstants.models.location.testName, constructorTitle, false);
  });

  const it1 = 'throws an error for an invalid details object';
  it(it1, () => {
    Log.it(TestConstants.models.location.testName, constructorTitle, it1, true);
    Log.it(TestConstants.models.location.testName, constructorTitle, it1, false);
    try {
      const location = new Location();
      expect(location).not.toBeDefined();
      Log.log(
        TestConstants.models.location.testName,
        constructorTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (error) {
      expect(error.name).toBe(Constants.errors.model.name);
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      Log.log(TestConstants.models.location.testName, constructorTitle, error);
    }
  });

  const it2 = 'throws an error for a missing location';
  it(it2, () => {
    Log.it(TestConstants.models.location.testName, constructorTitle, it2, true);
    Log.it(TestConstants.models.location.testName, constructorTitle, it2, false);
    try {
      const location = new Location({});
      expect(location).not.toBeDefined();
      Log.log(
        TestConstants.models.location.testName,
        constructorTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (error) {
      expect(error.name).toBe(Constants.errors.model.name);
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      expect(error.details.details.invalidMembers.length).toBe(2);
      expect(error.details.details.invalidMembers[0]).toBe(Constants.params.latitude);
      expect(error.details.details.invalidMembers[1]).toBe(Constants.params.longitude);
      Log.log(TestConstants.models.location.testName, constructorTitle, error);
    }
  });

  const it3 = 'throws an error for a missing latitude';
  it(it3, () => {
    Log.it(TestConstants.models.location.testName, constructorTitle, it3, true);
    Log.it(TestConstants.models.location.testName, constructorTitle, it3, false);
    try {
      delete this.details.latitude;
      const location = new Location(this.details);
      expect(location).not.toBeDefined();
      Log.log(
        TestConstants.models.location.testName,
        constructorTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (error) {
      expect(error.name).toBe(Constants.errors.model.name);
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      expect(error.details.details.invalidMembers.length).toBe(1);
      expect(error.details.details.invalidMembers[0]).toBe(Constants.params.latitude);
      Log.log(TestConstants.models.location.testName, constructorTitle, error);
    }
  });

  const it4 = 'throws an error for a missing longitude';
  it(it4, () => {
    Log.it(TestConstants.models.location.testName, constructorTitle, it4, true);
    Log.it(TestConstants.models.location.testName, constructorTitle, it4, false);
    try {
      delete this.details.longitude;
      const location = new Location(this.details);
      expect(location).not.toBeDefined();
      Log.log(
        TestConstants.models.location.testName,
        constructorTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (error) {
      expect(error.name).toBe(Constants.errors.model.name);
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      expect(error.details.details.invalidMembers.length).toBe(1);
      expect(error.details.details.invalidMembers[0]).toBe(Constants.params.longitude);
      Log.log(TestConstants.models.location.testName, constructorTitle, error);
    }
  });

  const it5 = 'creates a location object with the given details';
  it(it5, () => {
    Log.it(TestConstants.models.location.testName, constructorTitle, it5, true);
    Log.it(TestConstants.models.location.testName, constructorTitle, it5, false);
    const location = new Location(this.details);
    expect(location.latitude).toBe(this.details.latitude);
    expect(location.longitude).toBe(this.details.longitude);

    const responseData = location.databaseData;
    expect(responseData.latitude).toBe(this.details.latitude);
    expect(responseData.longitude).toBe(this.details.longitude);
    Log.log(TestConstants.models.location.testName, constructorTitle, location);
  });
});

const distanceTitle = 'distance function';
describe(distanceTitle, () => {
  beforeEach(() => {
    Log.beforeEach(TestConstants.models.location.testName, distanceTitle, true);
    this.createLocation = (_latitude, _longitude) => {
      const data = {
        latitude: _latitude,
        longitude: _longitude,
      };

      return new Location(data);
    };

    Log.beforeEach(TestConstants.models.location.testName, distanceTitle, false);
  });

  afterEach(() => {
    Log.afterEach(TestConstants.models.location.testName, distanceTitle, true);
    delete this.createLocation;
    Log.afterEach(TestConstants.models.location.testName, distanceTitle, false);
  });

  const it6 = 'throws an error for a null argument';
  it(it6, () => {
    Log.it(TestConstants.models.location.testName, distanceTitle, it6, true);
    const location1 = this.createLocation(
      TestConstants.params.defaultLocation,
      TestConstants.params.defaultLocation
    );
    try {
      const distance = location1.distance(null);
      expect(distance).not.toBeDefined();
      Log.log(
        TestConstants.models.location.testName,
        distanceTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (error) {
      expect(error.name).toBe(Constants.errors.model.name);
      expect(error.details.type).toBe(ModelError.type.TypeMismatch.type);
      Log.log(TestConstants.models.location.testName, distanceTitle, error);
    }

    Log.it(TestConstants.models.location.testName, distanceTitle, it6, false);
  });

  const it7 = 'returns 0 for the same location';
  it(it7, () => {
    Log.it(TestConstants.models.location.testName, distanceTitle, it7, true);
    const location1 = this.createLocation(
      TestConstants.params.defaultLocation,
      TestConstants.params.defaultLocation
    );
    const location2 = this.createLocation(
      TestConstants.params.defaultLocation,
      TestConstants.params.defaultLocation
    );
    const distance1 = location1.distance(location2);
    const distance2 = location2.distance(location1);
    expect(distance1).toBe(0);
    expect(distance2).toBe(distance1);
    Log.log(TestConstants.models.location.testName, distanceTitle, distance1);
    Log.it(TestConstants.models.location.testName, distanceTitle, it7, false);
  });

  const it8 = 'returns a valid distance for different locations';
  it(it8, () => {
    Log.it(TestConstants.models.location.testName, distanceTitle, it8, true);
    const location2 = this.createLocation(
      TestConstants.models.location.coordinates.random1,
      TestConstants.models.location.coordinates.random3
    );
    const location3 = this.createLocation(
      TestConstants.models.location.coordinates.random2,
      TestConstants.models.location.coordinates.random4
    );
    const distance1 = location2.distance(location3);
    const distance2 = location3.distance(location2);
    expect(distance1).toBe(TestConstants.models.location.expectedDistance);
    expect(distance2).toBe(distance1);
    Log.log(TestConstants.models.location.testName, distanceTitle, distance1);
    Log.it(TestConstants.models.location.testName, distanceTitle, it8, false);
  });
});

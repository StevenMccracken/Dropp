const Log = require('../../logger');
const Location = require('../../../src/models/Location');
const ModelError = require('../../../src/errors/ModelError');

const testName = 'Location Model';
const constructorTitle = 'Constructor';
/* eslint-disable no-undef */
describe(constructorTitle, () => {
  beforeEach(() => {
    Log.beforeEach(testName, constructorTitle, true);
    this.details = {
      latitude: 0,
      longitude: 0,
    };

    Log.beforeEach(testName, constructorTitle, false);
  });

  afterEach(() => {
    Log.afterEach(testName, constructorTitle, true);
    delete this.details;
    Log.afterEach(testName, constructorTitle, false);
  });

  const it1 = 'throws an error for an invalid details object';
  it(it1, () => {
    Log.it(testName, constructorTitle, it1, true);
    Log.it(testName, constructorTitle, it1, false);
    try {
      const location = new Location();
      expect(location).not.toBeDefined();
      Log.log(testName, constructorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('ModelError');
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      Log.log(testName, constructorTitle, error);
    }
  });

  const it2 = 'throws an error for a missing location';
  it(it2, () => {
    Log.it(testName, constructorTitle, it2, true);
    Log.it(testName, constructorTitle, it2, false);
    try {
      const location = new Location({});
      expect(location).not.toBeDefined();
      Log.log(testName, constructorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('ModelError');
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      expect(error.details.details.invalidMembers.length).toBe(2);
      expect(error.details.details.invalidMembers[0]).toBe('latitude');
      expect(error.details.details.invalidMembers[1]).toBe('longitude');
      Log.log(testName, constructorTitle, error);
    }
  });

  const it3 = 'throws an error for a missing latitude';
  it(it3, () => {
    Log.it(testName, constructorTitle, it3, true);
    Log.it(testName, constructorTitle, it3, false);
    try {
      delete this.details.latitude;
      const location = new Location(this.details);
      expect(location).not.toBeDefined();
      Log.log(testName, constructorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('ModelError');
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      expect(error.details.details.invalidMembers.length).toBe(1);
      expect(error.details.details.invalidMembers[0]).toBe('latitude');
      Log.log(testName, constructorTitle, error);
    }
  });

  const it4 = 'throws an error for a missing longitude';
  it(it4, () => {
    Log.it(testName, constructorTitle, it4, true);
    Log.it(testName, constructorTitle, it4, false);
    try {
      delete this.details.longitude;
      const location = new Location(this.details);
      expect(location).not.toBeDefined();
      Log.log(testName, constructorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('ModelError');
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      expect(error.details.details.invalidMembers.length).toBe(1);
      expect(error.details.details.invalidMembers[0]).toBe('longitude');
      Log.log(testName, constructorTitle, error);
    }
  });

  const it5 = 'creates a location object with the given details';
  it(it5, () => {
    Log.it(testName, constructorTitle, it5, true);
    Log.it(testName, constructorTitle, it5, false);
    const location = new Location(this.details);
    expect(location.latitude).toBe(this.details.latitude);
    expect(location.longitude).toBe(this.details.longitude);

    const responseData = location.databaseData;
    expect(responseData.latitude).toBe(this.details.latitude);
    expect(responseData.longitude).toBe(this.details.longitude);
    Log.log(testName, constructorTitle, location);
  });
});

const distanceTitle = 'distance function';
describe(distanceTitle, () => {
  beforeEach(() => {
    Log.beforeEach(testName, distanceTitle, true);
    this.createLocation = (_latitude, _longitude) => {
      const data = {
        latitude: _latitude,
        longitude: _longitude,
      };

      return new Location(data);
    };

    Log.beforeEach(testName, distanceTitle, false);
  });

  afterEach(() => {
    Log.afterEach(testName, distanceTitle, true);
    delete this.createLocation;
    Log.afterEach(testName, distanceTitle, false);
  });

  const it6 = 'throws an error for a null argument';
  it(it6, () => {
    Log.it(testName, distanceTitle, it6, true);
    const location1 = this.createLocation(0, 0);
    try {
      const distance = location1.distance(null);
      expect(distance).not.toBeDefined();
      Log.log(testName, distanceTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('ModelError');
      expect(error.details.type).toBe(ModelError.type.TypeMismatch.type);
      Log.log(testName, distanceTitle, error);
    }

    Log.it(testName, distanceTitle, it6, false);
  });

  const it7 = 'returns 0 for the same location';
  it(it7, () => {
    Log.it(testName, distanceTitle, it7, true);
    const location1 = this.createLocation(0, 0);
    const location2 = this.createLocation(0, 0);
    const distance1 = location1.distance(location2);
    const distance2 = location2.distance(location1);
    expect(distance1).toBe(0);
    expect(distance2).toBe(distance1);
    Log.log(testName, distanceTitle, distance1);
    Log.it(testName, distanceTitle, it7, false);
  });

  const it8 = 'returns a valid distance for different locations';
  it(it8, () => {
    Log.it(testName, distanceTitle, it8, true);
    const location2 = this.createLocation(49.26780455063753, 12.48046875);
    const location3 = this.createLocation(24.84656534821976, 2.8125);
    const distance1 = location2.distance(location3);
    const distance2 = location3.distance(location2);
    expect(distance1).toBe(2842336.280726291);
    expect(distance2).toBe(distance1);
    Log.log(testName, distanceTitle, distance1);
    Log.it(testName, distanceTitle, it8, false);
  });
});

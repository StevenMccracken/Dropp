const Log = require('../../logger');
const Utils = require('../../../src/utilities/utils');
const Location = require('../../../src/models/Location');
const ModelError = require('../../../src/errors/ModelError');

const testName = 'Location Model';
const constructorTitle = 'Constructor';
/* eslint-disable no-undef */
describe(constructorTitle, () => {
  beforeEach(() => {
    this.details = {
      latitude: 0,
      longitude: 0,
    };
  });

  afterEach(() => {
    delete this.details;
  });

  it('throws an error for an invalid details object', () => {
    try {
      const location = new Location();
      expect(location).not.toBeDefined();
      Log(testName, constructorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('ModelError');
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      Log(testName, constructorTitle, error);
    }
  });

  it('throws an error for a missing location', () => {
    try {
      const location = new Location({});
      expect(location).not.toBeDefined();
      Log(testName, constructorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('ModelError');
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      expect(error.details.details.invalidMembers.length).toBe(2);
      expect(error.details.details.invalidMembers[0]).toBe('latitude');
      expect(error.details.details.invalidMembers[1]).toBe('longitude');
      Log(testName, constructorTitle, error);
    }
  });

  it('throws an error for a missing latitude', () => {
    try {
      delete this.details.latitude;
      const location = new Location(this.details);
      expect(location).not.toBeDefined();
      Log(testName, constructorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('ModelError');
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      expect(error.details.details.invalidMembers.length).toBe(1);
      expect(error.details.details.invalidMembers[0]).toBe('latitude');
      Log(testName, constructorTitle, error);
    }
  });

  it('throws an error for a missing longitude', () => {
    try {
      delete this.details.longitude;
      const location = new Location(this.details);
      expect(location).not.toBeDefined();
      Log(testName, constructorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('ModelError');
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      expect(error.details.details.invalidMembers.length).toBe(1);
      expect(error.details.details.invalidMembers[0]).toBe('longitude');
      Log(testName, constructorTitle, error);
    }
  });

  it('creates a location object with the given details', () => {
    const location = new Location(this.details);
    expect(location.latitude).toBe(this.details.latitude);
    expect(location.longitude).toBe(this.details.longitude);

    const responseData = location.databaseData;
    expect(responseData.latitude).toBe(this.details.latitude);
    expect(responseData.longitude).toBe(this.details.longitude);
    Log(testName, constructorTitle, location);
  });
});

const distanceTitle = 'distance function';
describe(distanceTitle, () => {
  beforeEach(() => {
    this.createLocation = (_latitude, _longitude) => {
      const data = {
        latitude: _latitude,
        longitude: _longitude,
      };

      return new Location(data);
    };
  });

  afterEach(() => {
    delete this.createLocation;
  });

  it('throws an error for a null argument', () => {
    const location1 = this.createLocation(0, 0);
    try {
      const distance = location1.distance(null);
      expect(distance).not.toBeDefined();
      Log(testName, distanceTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('ModelError');
      expect(error.details.type).toBe(ModelError.type.TypeMismatch.type);
      Log(testName, distanceTitle, error);
    }
  });

  it('returns 0 for the same location', () => {
    const location1 = this.createLocation(0, 0);
    const location2 = this.createLocation(0, 0);
    const distance1 = location1.distance(location2);
    const distance2 = location2.distance(location1);
    expect(distance1).toBe(0);
    expect(distance2).toBe(distance1);
    Log(testName, distanceTitle, distance1);
  });

  it('returns a valid distance for different locations', () => {
    const location2 = this.createLocation(49.26780455063753, 12.48046875);
    const location3 = this.createLocation(24.84656534821976, 2.8125);
    const distance1 = location2.distance(location3);
    const distance2 = location3.distance(location2);
    expect(distance1).toBe(2842336.280726291);
    expect(distance2).toBe(distance1);
    Log(testName, distanceTitle, distance1);
  });
});

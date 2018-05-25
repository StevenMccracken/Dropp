const Utils = require('../utilities/utils');
const ModelError = require('../errors/ModelError');
const Validator = require('../utilities/validator');

/**
 * Model object for a location
 * @extends Object
 */
class Location extends Object {
  constructor(_details) {
    super();
    if (!Utils.hasValue(_details)) {
      ModelError.throwConstructorError('Location', 'details arg has no value');
    }

    const invalidMembers = [];
    if (!Validator.isValidNumber(_details.latitude)) invalidMembers.push('latitude');
    if (!Validator.isValidNumber(_details.longitude)) invalidMembers.push('longitude');
    if (invalidMembers.length > 0) ModelError.throwInvalidMembersError('Location', invalidMembers);
    this._latitude = _details.latitude;
    this._longitude = _details.longitude;

    /**
     * Returns the straight-path distance from this location to a given location
     * @param {Location} _location the location to get the distance from
     * @return {Number} distance between the two locations
     * @throws `ModelError` if `_location` is not of the correct type
     */
    this.distance = (_location) => {
      if (!(_location instanceof Location)) ModelError.throwTypeMismatchError('Location');
      const thisLatitude = Utils.degreesToRadians(this.latitude);
      const givenLatitude = Utils.degreesToRadians(_location.latitude);
      const dLatitude = Utils.degreesToRadians(this.latitude - _location.latitude);
      const dLongitude = Utils.degreesToRadians(this.longitude - _location.longitude);
      /* eslint-disable max-len */
      const a = (Math.sin(dLatitude / 2) * Math.sin(dLatitude / 2)) + (Math.sin(dLongitude / 2) * Math.sin(dLongitude / 2) * Math.cos(givenLatitude) * Math.cos(thisLatitude));
      /* eslint-enable max-len */
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return c * 6371e3; // Multiply by the approx radius of the earth in meters
    };
  }

  get latitude() {
    return this._latitude;
  }

  get longitude() {
    return this._longitude;
  }

  get databaseData() {
    return {
      latitude: this._latitude,
      longitude: this._longitude,
    };
  }
}

module.exports = Location;

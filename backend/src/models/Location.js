const Utils = require('../utilities/utils');
const ModelError = require('../errors/ModelError');
const Validator = require('../utilities/validator');
const Constants = require('../utilities/constants');

/**
 * Model object for a location
 * @extends Object
 */
class Location extends Object {
  constructor(_details) {
    super();
    if (!Utils.hasValue(_details)) {
      ModelError.throwConstructorError(
        Constants.params.Location,
        Constants.errors.messages.detaisArgNoValue
      );
    }

    const invalidMembers = [];
    if (!Validator.isValidNumber(_details.latitude)) invalidMembers.push(Constants.params.latitude);
    if (!Validator.isValidNumber(_details.longitude)) {
      invalidMembers.push(Constants.params.longitude);
    }

    if (invalidMembers.length > 0) {
      ModelError.throwInvalidMembersError(Constants.params.Location, invalidMembers);
    }

    this._latitude = _details.latitude;
    this._longitude = _details.longitude;

    /**
     * Returns the straight-path distance from this location to a given location
     * @param {Location} _location the location to get the distance from
     * @return {Number} distance between the two locations in meters
     * @throws `ModelError` if `_location` is not of the correct type
     */
    this.distance = (_location) => {
      if (!(_location instanceof Location)) {
        ModelError.throwTypeMismatchError(Constants.params.Location);
      }

      const thisLatitude = Utils.degreesToRadians(this.latitude);
      const givenLatitude = Utils.degreesToRadians(_location.latitude);
      const dLatitude = Utils.degreesToRadians(this.latitude - _location.latitude);
      const dLongitude = Utils.degreesToRadians(this.longitude - _location.longitude);
      /* eslint-disable max-len */
      const a = (Math.sin(dLatitude / 2) * Math.sin(dLatitude / 2)) + (Math.sin(dLongitude / 2) * Math.sin(dLongitude / 2) * Math.cos(givenLatitude) * Math.cos(thisLatitude));
      /* eslint-enable max-len */
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return c * Constants.models.location.earthRadiusMeters;
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

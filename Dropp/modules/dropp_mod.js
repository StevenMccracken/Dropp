/**
 * dropp_mod - @module for performing operations on dropps
 */

const LOG = require('./log_mod');
const VALIDATE = require('./validation_mod');

/**
 * distance - Haversine function to calculate the distance between two GPS coordinates
 * @param {Number[]} loc1 an array of latitude,longitude coordinates
 * @param {Number[]} loc2 an array of latitude,longitude coordinates
 * @returns {Number} the straight-line distance between loc1 and loc2
 */
var distance = function(loc1, loc2) {
  let toRadians = degrees => degrees * Math.PI / 180;

  let dLat = toRadians(loc2[0] - loc1[0]);
  let dLon = toRadians(loc2[1] - loc1[1]);
  let lat1 = toRadians(loc1[0])
  let lat2 = toRadians(loc2[0]);

  let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2)
    * Math.cos(lat1) * Math.cos(lat2);

  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  // Multiply by the approx radius of the earth (meters)
  return c * 6371e3;
};

/**
 * getCloseDropps - Returns the dropps that are near a given location
 * @param {Object} _dropps JSON of dropps
 * @param {String} _targetLocation comma-separated
 * string representing lat,long coordinates
 * @param {Number} _maxDistance the radius extending from targetLocation
 * @param {callback} _callback the callback to return the result
 * @throws {String} _targetLocation must be a comma-separated
 * string with two floats. _maxDistance must be a positive float
 */
var getCloseDropps = function(_dropps, _targetLocation, _maxDistance, _callback) {
  const SOURCE = 'getCloseDropps()';
  log(SOURCE);

  if (!VALIDATE.isValidLocation(_targetLocation)) {
    throw `Invalid _targetLocation (${_targetLocation}). Must be a string like 'x,y', where x & y are floats`;
  } else if (!VALIDATE.isValidPositiveFloat(_maxDistance)) {
    throw `Invalid _maxDistance (${_maxDistance}). Must be a positive floating-point number`;
  }

  let closeDropps = {};
  let closeDroppsCount = 0;
  let maxDistance = Number(_maxDistance);
  let targetLocation = _targetLocation.trim().split(',').map(Number);

  // Loop over all the dropps in the dropps JSON
  for (let droppKey in _dropps) {
    let dropp = _dropps[droppKey];

    // If the dropp doesn't have a valid location, don't bother calculating distance
    if (!VALIDATE.isValidLocation(dropp.location)) continue;

    // Turn the string lat,long coordinates into a number array
    let droppLocation = dropp.location.split(',').map(Number);

    // Calculate straight-path distance between the points
    let distanceFromTarget = distance(targetLocation, droppLocation);
    if (distanceFromTarget <= maxDistance) {
      // The current dropp is within maxDistance so save it to closeDropps
      closeDropps[droppKey] = dropp;
      closeDroppsCount++;
    }
  }

  // Return JSON with count of close dropps and all the close dropps
  let results = {
    count: closeDroppsCount,
    dropps: closeDropps,
  };

  _callback(results);
};

module.exports = {
  distance: distance,
  getCloseDropps: getCloseDropps,
};

/**
 * log - Logs a message to the server console
 * @param {String} _message the log message
 * @param {Object} _request the HTTP request
 */
function log(_message, _request) {
  LOG.log('Dropp Module', _message, _request);
}

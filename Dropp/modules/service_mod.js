/* Service module */

var exports = module.exports = {};

// Filters all dropps in dropps if they are within max_distance meters of user_location
exports.getCloseDropps = function(dropps, user_location, max_distance) {
	var closeDropps = {};
	var numCloseDropps = 0;

	// Loop over all the dropps in the JSON
	for (var dropp in dropps) {
		// dropp is the key (ex. '-Ksadflkjl3d')
		var info = dropps[dropp];

		// Get string lat/long coords into number array
		var dropp_location = info["location"].split(",").map(Number);

		// Calculate straight-path distance between the points
		var distance = dist(user_location, dropp_location);
		if (distance <= max_distance) {
			// Save the dropp to the return set if it's close enough
			closeDropps[dropp] = info;
			numCloseDropps++;
		}
	}

	var response = {
		count: numCloseDropps,
		'dropps': closeDropps
	};

	return response;
}

/**
 * Haversine function to calculate the distance between two GPS coordinates
 * @param {Number[]} loc1 - a set of latitude,longitude coordinates
 * @param {Number[]} loc2 - a set of latitude,longitude coordinates
 * @returns the straight-line ("as the bird flies") distance between loc1 and loc2
 */
function dist(loc1, loc2) {
    var toRadians = (degrees) => { return degrees * Math.PI / 180; };

		// approx. radius of the Earth, in meters
    var r = 6371e3;

    var lat1 = loc1[0], lat2 = loc2[0];
    var lon1 = loc1[1], lon2 = loc2[1];

    var dLat = toRadians(lat2 - lat1);
    var dLon = toRadians(lon2 - lon1);
    var lat1 = toRadians(lat1)
    var lat2 = toRadians(lat2);

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return r * c;
}

/**
 * service_mod - Service @module
 */

/**
 * distance - Haversine function to calculate
 * the distance between two GPS coordinates
 * @param {Number[]} loc1 an array of latitude,longitude coordinates
 * @param {Number[]} loc2 an array of latitude,longitude coordinates
 * @returns {Number} the straight-line distance between loc1 and loc2
 */
const distance = function(loc1, loc2) {
	const toRadians = (degrees) => { return degrees * Math.PI / 180; };

	const dLat = toRadians(loc2[0] - loc1[0]);
	const dLon = toRadians(loc2[1] - loc1[1]);
	const lat1 = toRadians(loc1[0])
	const lat2 = toRadians(loc2[0]);

	const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.sin(dLon/2)
		* Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
	
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

	// Multiply by the approx radius of the earth (meters)
	return c * 6371e3;
}

module.exports = {
	/**
	 * getCloseDropps - Calculates the dropps that are near a given location
	 * @param {Object} dropps JSON of dropps
	 * @param {Number[]} targetLocation array representing lat,long coordinates
	 * @param {Number} maxDistance the radius extending from targetLocation
	 * @returns {Object} JSON of dropps within maxDistance of targetLocation
	 */
	getCloseDropps: function(dropps, targetLocation, maxDistance) {
		var closeDropps = {};
		var numCloseDropps = 0;

		// Loop over all the dropps in the dropps JSON
		for (var dropp in dropps) {
			// dropp is the key (ex. '-Ksadflkjl3d')
			const droppInfo = dropps[dropp];

			// Turn the string lat,long coordinates into a number array
			const droppLocation = droppInfo['location'].split(',').map(Number);

			// Calculate straight-path distance between the points
			const distanceFromTarget = distance(targetLocation, droppLocation);
			if (distanceFromTarget <= maxDistance) {
				// The current dropp is within maxDistance so save it to closeDropps
				closeDropps[dropp] = droppInfo;
				numCloseDropps++;
			}
		}

		// Return JSON with count of close dropps, and all the close dropps
		const response = {
			count: numCloseDropps,
			'dropps': closeDropps
		};

		return response;
	}
};

/**
 * httpStatus_mod - HTTP status @module
 */

const errors = require('./error_mod.js');

/**
 * exports - Applies a status code to an HTTP response for a given error
 * @param {String} errorType a standardized error code
 * @param {Object} response the HTTP response
 */
module.exports = function(errorType, response) {
  switch (errorType) {
		case errors.INVALID_REQUEST_ERROR:	response.status(400);
			break;
		case errors.AUTHENTICATION_ERROR:		response.status(401);
			break;
    case errors.LOGIN_ERROR:						response.status(403);
			break;
		case errors.RESOURCE_ERROR:					response.status(403);
			break;
		case errors.RESOURCE_DNE_ERROR:			response.status(404);
			break;
		case errors.API_ERROR:							response.status(500);
			break;
		default: 														response.status(0);
	}
};

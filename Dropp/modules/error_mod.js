/**
 * error_mod - Standardized error messages @module
 */

const Log = require('./log_mod');
const ERROR_CODE = {
	API_ERROR : {
  	status 	 : 500,
  	type 	   : 'api_error',
  	message  : 'There was a problem with our back-end services'
  },

	AUTHENTICATION_ERROR : {
		status 	: 401,
		type 	  : 'authentication_error',
		message : 'There was an error while authenticating'
	},

	INVALID_MEDIA_TYPE : {
		status 	: 415,
		type 	  : 'invalid_media_type',
		message : 'That type of media file is forbidden'
	},

	INVALID_REQUEST_ERROR : {
		status 	: 400,
		type 	  : 'invalid_request_error',
		message : 'One of your request parameters is invalid'
	},

	INVALID_URL_ERROR : {
		status	: 400,
		type		: 'invalid_url_error',
		message	: 'There is an unacceptable character in your URL'
	},

	LOGIN_ERROR	: {
		status 	: 403,
		type 	  : 'login_error',
		message : 'The username or password is incorrect'
	},

	RESOURCE_DNE_ERROR : {
		status 	: 404,
		type 	  : 'resource_dne_error',
		message : 'That resource does not exist'
	},

	RESOURCE_ERROR : {
		status 	: 403,
		type 	  : 'resource_error',
		message : 'There was an error accessing that resource'
	},

	UNKNOWN_ERROR : {
		status 	: 0,
		type 	  : 'unknown_error',
		message : 'An unknown error occured'
	}
};

/**
 * exports - Provides default verbose messages for given error types
 * @param {string} errorType a standard error type
 * @returns {string} a formal error message
 */
var error = function(_source, _request, _response, _error, _serverLog) {
	log(_error, _request);
	log(JSON.stringify({
		error: {
			timestamp  : (new Date().toISOString()),
			type       : _error.type,
			source     : _source,
			details    : (_serverLog === undefined) ? _error.message : _serverLog
		}
	}), _request);

	// Set an HTTP status code for the errorType to send to the client
	_response.status(_error.status);

	return {
		error : {
			type     : _error.type,
			message  : _error.message
		}
	};
};

module.exports = {
	error  : error,
	CODE   : ERROR_CODE
};

/**
 * log - Logs a message to the server console
 * @param {string} _message the log message
 * @param {Object} _request the HTTP request
 */
function log(_message, _request) {
	Log.log('Error Module', _message, _request);
}

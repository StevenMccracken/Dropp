/**
 * error_mod - Standardized error messages @module
 */

 const Log = require("./log_mod");

const ERROR_CODE = {
	API_ERROR					: 	{
										status 	: 500,
										type 	: 'api_error',
										message : 'There was a problem with our back-end services' 
									},
	AUTHENTICATION_ERROR		: 	{
										status 	: 401,
										type 	: 'authentication_error',
										message : 'There was an error while authenticating' 
									},
	INVALID_REQUEST_ERROR		: 	{
										status 	: 400,
										type 	: 'invalid_request_error',
										message : 'One of your request parameters is invalid' 
									},
	LOGIN_ERROR					: 	{
										status 	: 403,
										type 	: 'login_error',
										message : 'The username or password is incorrect' 
									},
	RESOURCE_DNE_ERROR			: 	{
										status 	: 404,
										type 	: 'resource_dne_error',
										message : 'That resource does not exist' 
									},
	RESOURCE_ERROR				: 	{
										status 	: 405,
										type 	: 'resource_error',
										message : 'There was an error accessing that resource' 
									},
	UNKNOWN_ERROR				: 	{
										status 	: 0,
										type 	: 'unknown_error',
										message : 'An unknown error occured'
									}
};


 /**
 * exports - Provides default verbose messages for given error types
 * @param {string} errorType a standard error type
 * @returns {string} a formal error message
 */

var error = function(_source, _request, _response, _Error, _serverLog) {
	log(_Error, _request);
	log(JSON.stringify({
		error: {
			timestamp : (new Date().toISOString()),
			type: _Error.type,
			source : _source,
			details: (_serverLog === undefined) ? _Error.message : _serverLog
		}
	}), _request);
	// Set an HTTP status code for the errorType to send to the client
	_response.status(_Error.status);

	return {
		error : {
			type: _Error.type,
			message: _Error.message
		}
	};
};

module.exports = {
	error : error,
	CODE : ERROR_CODE
};


function log(_message, _request){

	Log.log("Firebase Module", _message, _request);
}
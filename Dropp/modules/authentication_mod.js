/* Handle Authentication */

const Log 		= require('./log_mod');
// const FIREBASE 	= require('./firebase_mod');
const BCRYPT	= require('bcrypt-nodejs');
const ERROR 	= require("./error_mod");
const JWT 		= require('jsonwebtoken');
const config    = require(process.cwd() + '/config/secret.js'); 
/* Handle storing of token and verification */
const PASSPORT			= require('passport');
require('../config/passport')(PASSPORT); // Library handle token


var auth = function(_request, _response, _hashedPassword, _callback, _errorCallback){

	var response = null, serverLog = null;
	/* Validate Credentials */

	/**
	 * Username and password exist in the database, so
	 * compare the password argument to the database record
	 */

	 BCRYPT.compare(_request.body.password, _hashedPassword, (bcryptCompareError, passwordsMatch)=> {
	 	log("BCRYPT validating...", _request);
	 	if (bcryptCompareError != null) {
	 		switch(bcryptCompareError) {
	 			case 'Not a valid BCrypt hash.': 
	 				serverLog = 'Password for ' + _request.body.username + ' is not correctly hashed in the database';
	 				break;
	 			default:
	 				serverLog = bcryptCompareError;
	 		}
	 		log(serverLog, _request);
	 		response = ERROR.error("Validate Credentials", _request, _response, ERROR.CODE.API_ERROR, serverLog);
	 		_errorCallback(response);
	 	} else if (!passwordsMatch) {
	 		// The comparison result is false so the passwords do not match
	 		serverLog = _request.body.password + ' does not match ' + _request.body.username + '\'s password';
	 		response = ERROR.error("BCRYPT, password does not match", _request, _response, ERROR.CODE.LOGIN_ERROR, serverLog);
	 		log(serverLog, _request);
	 		_errorCallback(response);
	 	} else {
	 		serverLog = 'Valid login Credentials';
	 		response = {
	 			success : {
	 				message : 'Valid login Credentials'
	 			}
	 		};

	 		log(serverLog, _request);

	 		_callback();
	 	}


	 });

}


var salt = function( _password, _callback, _errorCallback){

	var response = null;
	// Generate salt to hash the password, use 5 rounds of salting
	BCRYPT.genSalt(5, (bcryptGenSaltError, salt) => {
		if(bcryptGenSaltError != null) {
			_errorCallback(bcryptGenSaltError);
		} else {

			BCRYPT.hash(_password, salt, null, (bcryptHashError, hashedPassword) => {
				if (bcryptHashError != null) {
					_errorCallback(bcryptHashError);
				} else {
					_callback(hashedPassword);
				}
			});
		}
	})
};

var verifyToken = function(_request, _response, _callback, _errorCallback) {

	var source = "Verify Web Token";
	var response = null, serverLog = null;
	// Verify the client's token
	PASSPORT.authenticate('jwt', { session: false }, function(err, user, info) {
		if (err) {
			serverLog = err;
			log(err, _request);
			// _callback(serverLog);
		} else if ( info != undefined) {
			serverLog = determineJwtError(info.message);
			// _callback(serverLog);
		} else if (!user) {
			serverLog = 'User for this token cannot be found';
			// _callback(serverLog);
		} 

		if (serverLog != null) {
			console.log(serverLog);
			// There is error
			response = ERROR.error(source, _request, _response, ERROR.CODE.AUTHENTICATION_ERROR, serverLog);
			_errorCallback(response);
		} else {

			// Check request paramters
			// if (!isValidUsername(_request.params.username)) {
			// 	serverLog = 'Not valid username';
			// 	log(serverLog, _request);
			// 	response = ERROR.error(source, _request, _response, ERROR.CODE.INVALID_REQUEST_ERROR, serverLog);
			// 	_errorCallback(response);
			// } else {

				// Verified
				_callback(user);

			// }
		}
	})(_request, _response);
}

module.exports = {
	auth 		: auth,
	salt 		: salt,
	genToken 	: generateToken,
	verifyToken : verifyToken
};



function log(_message, _request) {
	Log.log("Authentication Module", _message, _request);
}

function generateToken(_username, _userData) {
	const user = {
		username : _username,
		details: _userData
	}

	return JWT.sign(user, config.secret, { expiresIn: '30d'});
}

/**
 * determineJwtError - Determines the specific
 * type of error generated from JWT events
 * @param {string} errorMessage the JWT error message
 * @returns {string} a more clearly worded error message
 */
function determineJwtError(errorMessage) {
	/**
	 * If token is malformed, sometimes errorMessage will contain 'Unexpected
	 * token' so shorten the errorMessage so it can work with the switch case
	 */
	if (errorMessage != null && errorMessage.indexOf('Unexpected token') !== -1)
		errorMessage = 'Unexpected token';

  var reason;
  switch (errorMessage) {
    case 'jwt expired': 					reason = 'Expired web token';
      break;
		case 'invalid token': 				reason = 'Invalid web token';
			break;
    case 'invalid signature': 		reason = 'Invalid web token';
      break;
		case 'jwt malformed': 				reason = 'Invalid web token';
			break;
		case 'Unexpected token': 			reason = 'Invalid web token';
			break;
		case 'No auth token': 				reason = 'Missing web token';
      break;
    case 'jwt must be provided':	reason = 'Missing web token';
      break;
    default: 											reason = 'Unknown web token error';
			console.log('JWT ERROR: %s', errorMessage);
  }

  return reason;
}

/**
 * isValidUsername - Validates a username
 * @param {string} username a username
 * @returns {Boolean} validity of username
 */
function isValidUsername(username) {
	/**
	 * Evaluates to true if username is not null, not empty,
	 * and only contains alphanumeric characters, dashes, or
	 * underscores. It must start with two alphanumeric characters
	 */
  return username != null && (/^[a-zA-Z0-9]{2,}[\w\-]*$/).test(username);
}
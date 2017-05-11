/**
 * authentication_mod - User authentication @module
 */

const JWT 		= require('jsonwebtoken');
const BCRYPT	= require('bcrypt-nodejs');
const Log 		= require('./log_mod');
const ERROR 	= require('./error_mod');
const config  = require(process.cwd() + '/config/secret.js');

// Handles token storage and verification
const PASSPORT = require('passport');
require('../config/passport')(PASSPORT);

/**
 * auth - Authenticates a username and password and generates a JSON web token
 * @param {Object} _request the HTTP request
 * @param {Object} _response the HTTP response
 * @param {string} _hashedPassword a hashed password
 * @param {callback} _callback the callback to handle success result
 * @param {type} _errorCallback the callback to handle error result
 */
var auth = function(_request, _response, _hashedPassword, _callback, _errorCallback) {
	const SOURCE = 'auth()';
	var response, serverLog;

	log(SOURCE, _request);

	/**
	 * Username and password exist in the database, so
	 * compare the password argument to the database record
	 */
	BCRYPT.compare(_request.body.password, _hashedPassword, (bcryptCompareError, passwordsMatch) => {
	 	log(SOURCE + ' - BCRYPT comparing', _request);
	 	if (bcryptCompareError != null) {
	 		switch (bcryptCompareError) {
	 			case 'Not a valid BCrypt hash.':
	 				serverLog = 'Password for ' + _request.body.username + ' is not correctly hashed in the database';
	 				break;
	 			default:
	 				serverLog = bcryptCompareError;
	 		}

	 		log(serverLog, _request);
	 		response = ERROR.error(SOURCE, _request, _response, ERROR.CODE.API_ERROR, serverLog);
	 		_errorCallback(response);
	 	} else if (!passwordsMatch) {
	 		// The comparison result is false so the passwords do not match
	 		serverLog = _request.body.password + ' does not match ' + _request.body.username + '\'s password';
	 		log(serverLog, _request);

			response = ERROR.error(SOURCE, _request, _response, ERROR.CODE.LOGIN_ERROR, serverLog);
	 		_errorCallback(response);
	 	} else {
	 		serverLog = 'Valid login credentials';
	 		response = {
	 			success : {
	 				message : serverLog
	 			}
	 		};

	 		log(serverLog, _request);
	 		_callback();
	 	}
	});
};

/**
 * hash - Salts and hashes a password
 * @param {string} _password the password to hash
 * @param {callback} _callback the callback to handle success result
 * @param {type} _errorCallback the callback to handle error result
 */
var hash = function(_password, _callback, _errorCallback) {
	const SOURCE = 'hash()';
	var response;

	log(SOURCE);

	// Generate salt to hash the password, use 5 rounds of salting
	BCRYPT.genSalt(5, (bcryptGenSaltError, salt) => {
		if (bcryptGenSaltError != null) {
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
	});
};


/**
 * verifyToken - Validates and verifies a JSON web token
 * @param {Object} _request the HTTP request
 * @param {Object} _response the HTTP response
 * @param {callback} _callback the callback to handle success result
 * @param {callback} _errorCallback the callback to handle error result
 */
var verifyToken = function(_request, _response, _callback, _errorCallback) {
	const SOURCE = 'verifyToken()';
	var response, serverLog;

	// Verify the client's token
	PASSPORT.authenticate('jwt', { session: false }, function(err, user, info) {
		if (err) {
			serverLog = err;
			log(err, _request);
		} else if (info != undefined) {
			serverLog = determineJwtError(info.message);
		} else if (!user) {
			serverLog = 'User for this token cannot be found';
		}

		if (serverLog != null) {
			response = ERROR.error(SOURCE, _request, _response, ERROR.CODE.AUTHENTICATION_ERROR, serverLog);

			// Apply passport authenticate error message to response error message
			response.error.message = serverLog;
			_errorCallback(response);
		} else {
			// Token was valid, so return user info
			_callback(user);
		}
	})(_request, _response);
};


/**
 * generateToken - Generates a JSON web token
 * @param {string} _username username of client
 * @param {Object} _userData JSON containing extra user information
 * @returns {string} a JSON web token
 */
function generateToken(_username, _userData) {
	const user = {
		username : _username,
		details: _userData
	}

	return JWT.sign(user, config.secret, { expiresIn: '30d' });
}

module.exports = {
	auth 				: auth,
	hash 				: hash,
	verifyToken	: verifyToken,
	genToken 		: generateToken,
};

/**
 * log - Logs a message to the server console
 * @param {string} _message the log message
 * @param {Object} _request the HTTP request
 */
function log(_message, _request) {
	Log.log('Authentication Module', _message, _request);
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

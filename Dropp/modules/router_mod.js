/**
 * router_mod - HTTP request routing @module
 */

var router          = null;
const fs            = require('fs');
const jwt           = require('jsonwebtoken');
const errors        = require('./error_mod.js');
const config        = require('../config/secret.js');
const service       = require('./service_mod.js');
const passport      = require('passport');
const firebase      = require('./firebase_mod.js');
const errorMessages = require('./errorMessage_mod.js');
const setHttpStatus = require('./httpStatus_mod.js');
require('../config/passport')(passport);

// Multer handles multi-part form requests (different from JSON or x-www-form-urlencoded)
var multer = require('multer');

// Set the temporary download folder for incoming files and the file size limit
var upload = multer({
  dest: './temp/uploads/',
  limits: { fileSize: '10000kb' }
}).single('image');


// Global authentication for google cloud storage
const gcs = require('@google-cloud/storage')({
  projectId: 'dropp-3a65d',
  keyFilename: './storageAccountKey.json'
});

// Initialize cloud storage bucket
const bucket = gcs.bucket('dropp-3a65d.appspot.com');

/**
 * exports - Defines routing logic to handle HTTP requests
 * @param {Object} _router the express routing object
 * @returns {Object} the express routing object with new routes defined
 */
module.exports = function(_router) {
	router = _router;

  /**
   * Middleware to log metadata about incoming requests
   * @param {Object} req the HTTP request
   * @param {Object} res the HTTP response
   * @param {callback} next the callback to execute after metadata has been logged
   */
	router.use((req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		console.log('%s: %s request received from IP %s', new Date().toISOString(), req.method, ip);
	 next();
	});

	/**
   * The base GET route for the API. This route
   * does not require token authentication
   * @param {Object} req the HTTP request
   * @param {Object} res the HTTP response
	 */
	router.get('/', (req, res) => {
		res.json( { message: 'This is the REST API for Dropp' } );
	});

	/**
	 * The GET route for downloading the image linked to a
	 * dropp. This route does not require token authentication
	 * @param {Object} req the HTTP request
	 * @param {Object} res the HTTP response
	 */
	router.route('/dropps/:droppId/image').get(function(req, res) {
		const source = 'GET /dropps/' + req.params.droppId + '/image';
		var responseJson, errorMessage;

		// Verify the client's token
    passport.authenticate('jwt', { session: false }, function(err, user, info) {
      if (err) {
				logErrorWithJson(source, res, err);
				return res.json(err);
			}

      if (info != undefined)	errorMessage = determineJwtError(info.message);
      else if (!user) 				errorMessage = 'User for this token cannot be found';

			if (errorMessage != null) {
				responseJson = logError(source, res, errors.AUTHENTICATION_ERROR, errorMessage);
        return res.json(responseJson);
			}

      // Check request paramters
      if (!isValidId(req.params.droppId)) {
				// Get parameter-specific error message
				errorMessage = errorMessages(errors.INVALID_REQUEST_ERROR, 'droppId');
				responseJson = logError(source, res, errors.INVALID_REQUEST_ERROR, errorMessage);
				return res.json(responseJson);
      }

			// Get google cloud storage reference
			var filename = req.params.droppId;
			var remoteReadStream = bucket.file(filename).createReadStream();

			// Catch error event while downloading
			remoteReadStream.on('error', function(firebaseError) {
				if (firebaseError.code === 404) {
					errorMessage = logError(source, res, errors.RESOURCE_DNE_ERROR);
				} else {
					errorMessage = logError(source, res, errors.API_ERROR, firebaseError);
				}

				return res.json(errorMessage);
			});

			// Download bytes from google cloud storage reference to local memory array
			var bufs = [];
			remoteReadStream.on('data', function(d) { bufs.push(d); });

			// Catch finish event after downloading has finished
			remoteReadStream.on('end', function() {
				// Send byte string to client
				var buf = Buffer.concat(bufs);
				res.write(buf, 'binary');
				res.end(null, 'binary');
			});
		})(req, res);
	});

	/**
	 * The POST route for uploading an image to link with a dropp.
	 * The request body Content-Type MUST be multipart/form-data.
	 * This route does not require token authentication
	 * @param {Object} req the HTTP request
	 * @param {Object} res the HTTP response
	 */
	router.route('/dropps/:droppId/image').post(upload, function(req, res) {
		const source = 'POST /dropps/' + req.params.droppId + '/image';
		var responseJson, errorMessage;

		// Verify the client's token
    passport.authenticate('jwt', { session: false }, function(err, user, info) {
      if (err) {
				logErrorWithJson(source, res, err);

				 // Remove temp file that multer created
				if (req.file !== undefined) removeFile(req.file.path);
				return res.json(err);
			}

      if (info != undefined)	errorMessage = determineJwtError(info.message);
      else if (!user) 				errorMessage = 'User for this token cannot be found';

			if (errorMessage != null) {
				responseJson = logError(source, res, errors.AUTHENTICATION_ERROR, errorMessage);

				 // Remove temp file that multer created
				if (req.file !== undefined) removeFile(req.file.path);
        return res.json(responseJson);
			}

      // Check request paramters
      if (!isValidId(req.params.droppId)) {
				// Get parameter-specific error message
				errorMessage = errorMessages(errors.INVALID_REQUEST_ERROR, 'droppId');
				responseJson = logError(source, res, errors.INVALID_REQUEST_ERROR, errorMessage);

				 // Remove temp file that multer created
				if (req.file !== undefined) removeFilie(req.file.path);
				return res.json(responseJson);
      }

			// FIXME: Reject this request if droppId does not exist in database

			// If there is a file in the multi-part form request body, process it
			if (req.file !== undefined) {
				// Make sure only specific image files are accepted
				if (req.file.mimetype != 'image/jpeg' && req.file.mimetype != 'image/png') {
					errorMessage = 'Invalid mimetype (' + req.file.mimetype + ')';
					responseJson = logError(source, res, errors.INVALID_REQUEST_ERROR, errorMessage);

					 // Remove temp file that multer created
					removeFile(req.file.path);
		      return res.json(responseJson);
				}

				// Access file that multer added to ./temp/uploads/ and stream it to google cloud storage
				const filename = req.params.droppId;
				var localReadStream = fs.createReadStream(req.file.path);
				var remoteWriteStream = bucket.file(filename).createWriteStream();
				localReadStream.pipe(remoteWriteStream);

				// Catch error event while uploading
				remoteWriteStream.on('error', function(err) {
					responseJson = logError(source, res, errors.API_ERROR, err);

					 // Remove temp file that multer created
					removeFile(req.file.path);
					return res.json(responseJson);
				});

				// Catch finish event after uploading
				remoteWriteStream.on('finish', function() {
					responseJson = {
						success: {
							message: 'Added image to dropp ' + req.params.droppId,
						}
					};

					 // Remove temp file that multer created
					removeFile(req.file.path);
					return res.json(responseJson);
			  });
			} else {
				errorMessage = 'No file parameter provided';
				responseJson = logError(source, res, errors.INVALID_REQUEST_ERROR, errorMessage);
	      return res.json(responseJson);
			}
		})(req, res);
	});

	/**
	 * The POST route for validating login credentials. Sends
	 * an error JSON or a JSON web token for the requesting
	 * client. This route does not require token authentication
	 * @param {Object} req the HTTP request
	 * @param {Object} res the HTTP response
	 */
  router.route('/authenticate').post((req, res) => {
		const source = 'POST /authenticate';

    // Check request parameters
    if (!req.body.username || !req.body.password) {
		 	var responseJson = logError(source, res, errors.INVALID_REQUEST_ERROR, 'Missing login parameters');
      return res.json(responseJson);
    }

    // Compare credentials to user's information in database
    firebase.validateCredentials(req.body.username, req.body.password, validateResult => {
      if (validateResult['error'] != null) {
				logErrorWithJson(source, res, validateResult);
				return res.json(validateResult);
      }

      // If credentials are valid, get the user's information from the database
      firebase.getUser(req.body.username, dbResult => {
        if (dbResult['error'] != null) {
					logErrorWithJson(source, res, dbResult);
					return res.json(dbResult);
        }

        // Generate the JWT for the client request
        const token = generateToken(req.body.username, dbResult);
        validateResult['success']['token'] = 'JWT ' + token;
        return res.json(validateResult);
      });
    });
  });

	/**
	 * The POST route for creating a user. Sends an error JSON or a JSON of
	 * the created user. This route does not require token authentication
	 * @param {Object} req the HTTP request
	 * @param {Object} res the HTTP response
	 */
	router.route('/users').post(function(req, res) {
		const source = 'POST /users';

		// Check request parameters
		var invalidParam = null;
		if (!isValidUsername(req.body.username)) 			invalidParam = 'username';
    else if (!isValidEmail(req.body.email)) 			invalidParam = 'email';
    else if (!isValidPassword(req.body.password))	invalidParam = 'password';

		if (invalidParam != null) {
			// Get parameter-specific error message
			var errorMessage = errorMessages(errors.INVALID_REQUEST_ERROR, invalidParam);
			var errorJson = logError(source, res, errors.INVALID_REQUEST_ERROR, errorMessage);
			return res.json(errorJson);
		}

		// All params are good. Send request to database to add user
		firebase.createUser(req, dbResult => {
			if (dbResult['error'] != null) {
				logErrorWithJson(source, res, dbResult);
				return res.json(dbResult);
			}

			// Send the new user JSON to the client
			return res.status(201).json(dbResult);
		});
	});

	/**
	 * The GET route for retrieving a user by their username. Sends an error JSON
	 * or a JSON of the requested user. This route requires token authentication
	 * @param {Object} req the HTTP request
	 * @param {Object} res the HTTP response
	 */
  router.route('/users/:username').get(function(req, res) {
		const source = 'GET users/' + req.params.username;
		var responseJson, errorMessage;

		// Verify the client's token
    passport.authenticate('jwt', { session: false }, function(err, user, info) {
      if (err) {
				logErrorWithJson(source, res, err);
				return res.json(err);
			}

      if (info != undefined)	errorMessage = determineJwtError(info.message);
      else if (!user) 				errorMessage = 'User for this token cannot be found';

			if (errorMessage != null) {
				responseJson = logError(source, res, errors.AUTHENTICATION_ERROR, errorMessage);
        return res.json(responseJson);
			}

      // Check request paramters
      if (!isValidUsername(req.params.username)) {
				// Get parameter-specific error message
				errorMessage = errorMessages(errors.INVALID_REQUEST_ERROR, 'username');
				responseJson = logError(source, res, errors.INVALID_REQUEST_ERROR, errorMessage);
				return res.json(responseJson);
      }

			// Query the database for the requested user
      firebase.getUser(req.params.username, dbResult => {
        if (dbResult['error'] != null) {
					logErrorWithJson(source, res, dbResult);
        }

        return res.json(dbResult);
      });
    })(req, res);
  });

	/**
	 * The GET route for retrieving all dropps. Sends an error JSON or a
	 * JSON of all the dropps. This route requires token authentication
	 * @param {Object} req the HTTP request
	 * @param {Object} res the HTTP response
	 */
	router.route('/dropps').get(function(req, res) {
		const source = 'GET /dropps';
		var responseJson, errorMessage;

		// Verify the client's token
    passport.authenticate('jwt', { session: false }, function(err, user, info) {
      if (err) {
				logErrorWithJson(source, res, err);
				return res.json(err);
			}

      if (info != undefined)	errorMessage = determineJwtError(info.message);
      else if (!user) 				errorMessage = 'User for this token cannot be found';

			if (errorMessage != null) {
				responseJson = logError(source, res, errors.AUTHENTICATION_ERROR, errorMessage);
        return res.json(responseJson);
			}

			// Query the database for all dropps
			firebase.getAllDropps(dbResult => {
				if (dbResult['error'] != null) {
					logErrorWithJson(source, res, dbResult);
				}

				return res.json(dbResult);
			});
		})(req, res);
	});

	/**
	 * The GET route for retrieving all dropps posted by a specific
	 * user. Sends an error JSON or a JSON of the dropps posted by
	 * the requested user. This route requires token authentication
	 * @param {Object} req the HTTP request
	 * @param {Object} res the HTTP response
	 */
  router.route('/users/:username/dropps').get(function(req, res) {
		const source = 'GET users/' + req.params.username + '/dropps';
		var responseJson, errorMessage;

		// Verify the client's token
    passport.authenticate('jwt', { session: false }, function(err, user, info) {
      if (err) {
				logErrorWithJson(source, res, err);
				return res.json(err);
			}

      if (info != undefined)	errorMessage = determineJwtError(info.message);
      else if (!user) 				errorMessage = 'User for this token cannot be found';

			if (errorMessage != null) {
				responseJson = logError(source, res, errors.AUTHENTICATION_ERROR, errorMessage);
        return res.json(responseJson);
			}

			// Check request paramters
      if (!isValidUsername(req.params.username)) {
				// Get parameter-specific error message
				errorMessage = errorMessages(errors.INVALID_REQUEST_ERROR, 'username');
				responseJson = logError(source, res, errors.INVALID_REQUEST_ERROR, errorMessage);
				return res.json(responseJson);
      }

			// Query the database for all dropps posted by the requested user
      firebase.getDroppsByUser(req.params.username, dbResult => {
        if (dbResult['error'] != null) {
					logErrorWithJson(source, res, dbResult);
        }

        return res.json(dbResult);
      });
    })(req, res);
  });

	/**
	 * The GET route for retrieving a dropp by its id. Sends an error JSON or
	 * a JSON of the requested dropp. This route requires token authentication
	 * @param {Object} req the HTTP request
	 * @param {Object} res the HTTP response
	 */
  router.route('/dropps/:droppId').get(function(req, res) {
		const source = 'GET dropps/' + req.params.droppId;
		var responseJson, errorMessage;

		// Verify the client's token
    passport.authenticate('jwt', { session: false }, function(err, user, info) {
      if (err) {
				logErrorWithJson(source, res, err);
				return res.json(err);
			}

      if (info != undefined)	errorMessage = determineJwtError(info.message);
      else if (!user) 				errorMessage = 'User for this token cannot be found';

			if (errorMessage != null) {
				responseJson = logError(source, res, errors.AUTHENTICATION_ERROR, errorMessage);
        return res.json(responseJson);
			}

			// Check request paramters
      if (!isValidId(req.params.droppId)) {
				// Get parameter-specific error message
				errorMessage = errorMessages(errors.INVALID_REQUEST_ERROR, 'droppId');
				responseJson = logError(source, res, errors.INVALID_REQUEST_ERROR, errorMessage);
				return res.json(responseJson);
      }

			// Query the database for the requested dropp
      firebase.getDropp(req.params.droppId, dbResult => {
        if (dbResult['error'] != null) {
          logErrorWithJson(source, res, dbResult);
        }

				return res.json(dbResult);
      });
    })(req, res);
  });

	/**
	 * The POST route for retrieving dropps near a specific location.
	 * Sends an error JSON or a JSON of the dropps near that
	 * specific location. This route requires token authentication
	 * @param {Object} req the HTTP request
	 * @param {Object} res the HTTP response
	 */
	router.route('/location/dropps').post(function(req, res) {
		const source = 'POST location/dropps';
		var responseJson, errorMessage;

		// Verify the client's token
    passport.authenticate('jwt', { session: false }, function(err, user, info) {
      if (err) {
				logErrorWithJson(source, res, err);
				return res.json(err);
			}

      if (info != undefined)	errorMessage = determineJwtError(info.message);
      else if (!user) 				errorMessage = 'User for this token cannot be found';

			if (errorMessage != null) {
				responseJson = logError(source, res, errors.AUTHENTICATION_ERROR, errorMessage);
        return res.json(responseJson);
			}

			// Check request parameters
			var invalidParam = null;
			if (!isValidLocation(req.body.location)) 							invalidParam = 'location';
	    else if (!isValidPositiveFloat(req.body.maxDistance))	invalidParam = 'maxDistance';

			if (invalidParam != null) {
				// Get parameter-specific error message
				errorMessage = errorMessages(errors.INVALID_REQUEST_ERROR, invalidParam);
				responseJson = logError(source, res, errors.INVALID_REQUEST_ERROR, errorMessage);
				return res.json(responseJson);
			}

			// Query the database for all dropps
      firebase.getAllDropps(dbResult => {
        if (dbResult['error'] != null) {
          logErrorWithJson(source, res, dbResult);
					return res.json(dbResult);
        }

				/**
				 * Turn the latitude,longitude param in the
				 * request body from a string to a Number array
				 */
				const locationArr = req.body.location.split(',').map(Number);

				// Filter close dropps from all dropps
				const closeDropps = service.getCloseDropps(dbResult, locationArr, req.body.maxDistance);
        return res.json(closeDropps);
      });
    })(req, res);
  });

	/**
	 * The POST route for creating a dropp. Sends an error JSON or a JSON
	 * of the created dropp's id. This route requires token authentication
	 * @param {Object} req the HTTP request
	 * @param {Object} res the HTTP response
	 */
	router.route('/dropps').post(upload, function(req, res) {
		const source = 'POST /dropps';
		var responseJson, errorMessage;

		// Verify the client's token
    passport.authenticate('jwt', { session: false }, function(err, user, info) {
      if (err) {
				logErrorWithJson(source, res, err);
				return res.json(err);
			}

      if (info != undefined)	errorMessage = determineJwtError(info.message);
      else if (!user) 				errorMessage = 'User for this token cannot be found';

			if (errorMessage != null) {
				responseJson = logError(source, res, errors.AUTHENTICATION_ERROR, errorMessage);
        return res.json(responseJson);
			}

			// Check request parameters
			var invalidParam = null;
			if (!isValidLocation(req.body.location)) 			invalidParam = 'location';
	    else if (!isValidInteger(req.body.timestamp))	invalidParam = 'timestamp';
			else if (req.body.text != null
				&& req.body.media === 'false'
				&& !isValidTextPost(req.body.text))
			{
				invalidParam = 'text';
			}

			if (invalidParam != null) {
				// Get parameter-specific error message
				errorMessage = errorMessages(errors.INVALID_REQUEST_ERROR, invalidParam);
				responseJson = logError(source, res, errors.INVALID_REQUEST_ERROR, errorMessage);
				return res.json(responseJson);
			}

			// Reject if there is no content at all in the dropp
			if (req.body.text == null && req.body.media === 'false') {
				errorMessage = 'Your dropp has no content';
				responseJson = logError(source, res, errors.INVALID_REQUEST_ERROR, errorMessage);
				return res.json(responseJson);
			}

			// Add the dropp to the database
      firebase.createDropp(user.username, req, dbResult => {
        if (dbResult['error'] != null) {
          logErrorWithJson(source, res, dbResult);
        }

        return res.json(dbResult);
      });
    })(req, res);
  });

	return router;
}


/**
 * removeFile - Removes a file from the local filesystem
 * @param {string} filePath the path to the desired file
 */
function removeFile(filePath) {
	fs.unlink(filePath, function(err) {
		if (err) {
			console.log('Failed to remove temp file at %s', filePath);
		} else {
			console.log('Removed temp file at %s', filePath);
		}
	});
}

/**
 * generateToken - Encodes a given payload with our proprietary secret
 * @param {string} username the username from the client
 * @param {Object} userDetails a JSON array containing extra info about the user
 * @returns {Object} a JSON web token
 */
function generateToken(username, userDetails) {
	const user = {
		username: username,
		details: userDetails,
	};

	// Encode the user JSON in the JWT
  return jwt.sign(user, config.secret, { expiresIn: '30d' });
}

/**
 * retrieveToken - Extracts the JSON web token from request headers
 * @param {Object} headers the HTTP request headers
 * @returns {Object|null} the actual token or null
 */
function retrieveToken(headers) {
  if (headers && headers.authorization) {
    const parts = headers.authorization.split(' ');
    return parts.length != 2 ? null : parts[1];
  }

  return null;
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

/**
 * isValidEmail - Validates an email address
 * @param {string} email an email
 * @returns {Boolean} validity of email
 */
function isValidEmail(email) {
	// Evaluates to true if true if email is not null and matches valid email formats
  return email != null
		&& (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/).test(email);
}

/**
 * isValidPassword - Validates a password
 * @param {string} password a password
 * @returns {Boolean} validity of password
 */
function isValidPassword(password) {
	/**
	 * Evaluates to true if password is not empty and
	 * only contains alphanumeric and special characters
	 */
  return password != null && (/^[\w\S]+$/).test(password);
}

/**
 * isValidId - Validates an id
 * @param {string} id an id
 * @returns {Boolean} validity of id
 */
function isValidId(id) {
	// Evaluates to true if id is not null, not empty, and alphanumeric or has dashes
  return id != null && (/^[\w-]+$/).test(id);
}

/**
 * isValidLocation - Validates a location
 * @param {string} location the location string of the form "latitude,longitude"
 * @returns {Boolean} validity of location
 */
function isValidLocation(location) {
	/**
	 * Evaluates to true if location is not null
	 * & is two comma separated decimal numbers
	 */
	return location != null
		&& (/^(\-?\d+(\.\d+)?),\s*(\-?\d+(\.\d+)?)$/).test(location);
}

/**
 * isValidInteger - Validates an integer
 * @param {Number} number a number
 * @returns {Boolean} validity of number
 */
function isValidInteger(number) {
	// Evaluates to true if number is not null and an integer
  return number != null && (/^\d+$/).test(number);
}

/**
 * isValidPositiveFloat - Validates a positive float
 * @param {Number} number a number
 * @returns {Boolean} validity of number
 */
function isValidPositiveFloat(number) {
	// Evaluates to true if number is not null and non-negative float
  return number != null && (/^\d+(\.\d*)?$/).test(number);
}

/**
 * isValidTextPost - Validates a text post
 * @param {string} text a body of text
 * @returns {Boolean} validity of text
 */
function isValidTextPost(text) {
	// Evaluates to true if text is not null, not empty, and starts with a character
	return text != null && (/^\S[\w\W]+$/).test(text);
}

/**
 * logError - Logs a verbose JSON to the server, sets the
 * corresponding HTTP status code for the HTTP response,
 * and creates a slightly less verbose JSON for the client
 * @param {string} source the function where the error
 * occured (should be the inner-most named function)
 * @param {Object} response the HTTP response
 * @param {string} errorType formal error type
 * @param {string} errorMessage detailed message explaining the error for the
 * client. If null, a default message will be added corresponding to errorType
 * @param {string} serverLog detailed message
 * explaining the failure for server logs
 * @returns {Object} error JSON to send to client
 */
function logError(source, response, errorType, errorMessage, serverLog) {
  console.log(JSON.stringify({
    error: {
      timestamp: (new Date().toISOString()),
      type: errorType,
      source: source,
      details: (serverLog === undefined ? errorMessage : serverLog)
    }
  }));

	// Set an HTTP status code for the errorType to send to the client
	setHttpStatus(errorType, response);

	// Return a detailed error JSON for the a client
  return {
    error: {
      type: errorType,
      message: (errorMessage != null ? errorMessage : errorMessages(errorType))
    }
  };
}


/**
 * logErrorWithJson - Logs a verbose JSON to the server and
 * sets the corresponding HTTP status code for the HTTP response
 * @param {string} source the function where
 * the error occured (should be the API route)
 * @param {Object} response the HTTP response
 * @param {Object} errorJson the JSON containing the error details
 */
function logErrorWithJson(source, response, errorJson) {
	console.log('%s failed and will send client this error: %s', source, JSON.stringify(errorJson));

	// Set an HTTP status code for the errorType to send to the client;
	setHttpStatus(errorJson['error']['type'], response);
}

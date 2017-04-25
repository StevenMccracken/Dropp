/* Routing module */

var router 		= null,
		firebase 	= require('./firebase_mod.js'),
		service 	= require('./service_mod.js'),
		jwt				= require('jsonwebtoken'),
		config    = require(process.cwd() + '/config/secret.js'),
    passport	= require('passport');

require('../config/passport')(passport);

module.exports = function(_router) {
	router = _router;

	// Middleware
	router.use((req, res, next) => {
	    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
			console.log('%s: %s request came in from %s', new Date().toISOString(), req.method, ip);
	    next();
	});

	/* ----- Routes ----- */
	router.get('/', (req, res) => {
		res.json( { message: 'This is the REST API for Dropp' } );
	});

	// Validates a login attempt and sends a JSON web token
  router.route('/authenticate').post((req, res) => {
    // Check request parameters
    if (!req.body.username || !req.body.password) {
      return reject(req, res, 'invalid_request_error', 'Missing login parameters');
    }

    // Compare credentials to user's information in database
    firebase.validateCredentials(req.body.username, req.body.password, validateResult => {
      if (validateResult['error'] != null) {
        return rejectFromJson(req, res, validateResult);
      }

      // If credentials are valid, get the user's information from the database
      firebase.getUser(req.body.username, dbResult => {
        if (dbResult['error'] != null) {
          return rejectFromJson(req, res, dbResult);
        }

        // Generate the JWT for the client request
        var token = generateToken(req.body.username, dbResult);
        validateResult['success']['token'] = 'JWT ' + token;
        res.json(validateResult);
      });
    });
  });

	// Creates a user and returns their information
	router.route('/users').post(function(req, res) {
		// Check request parameters
		if (!isValidUsername(req.body.username)) {
      return reject(req, res, 'invalid_request_error', 'Your username parameter is invalid');
    }

    if (!isValidEmail(req.body.email)) {
      return reject(req, res, 'invalid_request_error', 'Your email parameter is invalid');
    }

    if (!isValidPassword(req.body.password)) {
      return reject(req, res, 'invalid_request_error', 'Your password parameter is invalid');
    }

		// Send request body information to database to add user
		firebase.createUser(req, dbResult => {
			if (dbResult['error'] != null) {
				return rejectFromJson(req, res, dbResult);
			}

			// Send the new user JSON to the client
			res.status(201).json(dbResult);
		});
	});

	// Get a specific user by their username
  router.route('/users/:username').get(function(req, res) {
		// Verify the client's token
    passport.authenticate('jwt', { session: false }, function(err, user, info) {
      if (err) return rejectFromJson(req, res, err);

      if (info != undefined) {
        var reason = determineJwtError(info.message);
        return reject(req, res, 'authentication_error', reason);
      }

      if (!user) {
        return reject(req, res, 'authentication_error', 'User for this token cannot be found');
      }

      // Check request paramters
      if (!isValidUsername(req.params.username)) {
        return reject(req, res, 'invalid_request_error', 'Your username parameter is invalid');
      }

			// Query the database for the requested user
      firebase.getUser(req.params.username, dbResult => {
        if (dbResult['error'] != null) {
          return rejectFromJson(req, res, dbResult);
        }

        return res.json(dbResult);
      });
    })(req, res);
  });

	// Get all dropps
	router.route('/dropps').get(function(req, res) {
		// Verify the client's token
		passport.authenticate('jwt', { session: false }, function(err, user, info) {
			if (err) return rejectFromJson(req, res, err);

      if (info != undefined) {
        var reason = determineJwtError(info.message);
        return reject(req, res, 'authentication_error', reason);
      }

      if (!user) {
        return reject(req, res, 'authentication_error', 'User for this token cannot be found');
      }

			// Query the database for all dropps
			firebase.getAllDropps(dbResult => {
				if (dbResult['error'] != null) {
					return rejectFromJson(req, res, dbResult);
				}

				return res.json(dbResult);
			});
		})(req, res);
	});

	// Get all dropps posted by a specific user
  router.route('/users/:username/dropps').get(function(req, res) {
		// Verify the client's token
    passport.authenticate('jwt', { session: false }, function(err, user, info) {
      if (err) return rejectFromJson(req, res, err);

      if (info != undefined) {
        var reason = determineJwtError(info.message);
        return reject(req, res, 'authentication_error', reason);
      }

      if (!user) {
        return reject(req, res, 'authentication_error', 'User for this token cannot be found');
      }

      // Check request paramters
      if (!isValidUsername(req.params.username)) {
        return reject(req, res, 'invalid_request_error', 'Your username parameter is invalid');
      }

			// Query the database for all dropps posted by the requested user
      firebase.getDroppsByUser(req.params.username, dbResult => {
        if (dbResult['error'] != null) {
          return rejectFromJson(req, res, dbResult);
        }

        return res.json(dbResult);
      });
    })(req, res);
  });

	// Get a specific dropp
  router.route('/dropps/:droppId').get(function(req, res) {
		// Verify the client's token
    passport.authenticate('jwt', { session: false }, function(err, user, info) {
      if (err) return rejectFromJson(req, res, err);

      if (info != undefined) {
        var reason = determineJwtError(info.message);
        return reject(req, res, 'authentication_error', reason);
      }

      if (!user) {
        return reject(req, res, 'authentication_error', 'User for this token cannot be found');
      }

      // Check request paramters
      if (!isValidId(req.params.droppId)) {
        return reject(req, res, 'invalid_request_error', 'Your droppId parameter is invalid');
      }

			// Query the database for the requested dropp
      firebase.getDropp(req.params.droppId, dbResult => {
        if (dbResult['error'] != null) {
          return rejectFromJson(req, res, dbResult);
        }

        return res.json(dbResult);
      });
    })(req, res);
  });

	// Get dropps near a specific location
	router.route('/location/dropps').post(function(req, res) {
		// Verify the client's token
    passport.authenticate('jwt', { session: false }, function(err, user, info) {
      if (err) return rejectFromJson(req, res, err);

      if (info != undefined) {
        var reason = determineJwtError(info.message);
        return reject(req, res, 'authentication_error', reason);
      }

      if (!user) {
        return reject(req, res, 'authentication_error', 'User for this token cannot be found');
      }

      // Check request paramters
      if (!isValidLocation(req.body.location)) {
        return reject(req, res, 'invalid_request_error', 'Your location parameter is invalid');
      }

			if(!isValidNonNegNumber(req.body.maxDistance)) {
				return reject(req, res, 'invalid_request_error', 'Your maxDistance parameter is invalid');
			}

			// Query the database for all dropps
      firebase.getAllDropps(dbResult => {
        if (dbResult['error'] != null) {
          return rejectFromJson(req, res, dbResult);
        }

				// Turn the latitude,longitude param in the request body from a string to a Number array
				var locationArr = req.body.location.split(',').map(Number);

				// Filter close dropps from all dropps
				var closeDropps = service.getCloseDropps(dbResult, locationArr, req.body.maxDistance);
        return res.json(closeDropps);
      });
    })(req, res);
  });

	// Create a dropp
	router.route('/dropps').post(function(req, res) {
		// Verify the user's token
    passport.authenticate('jwt', { session: false }, function(err, user, info) {
      if (err) return rejectFromJson(req, res, err);

      if (info != undefined) {
        var reason = determineJwtError(info.message);
        return reject(req, res, 'authentication_error', reason);
      }

      if (!user) {
        return reject(req, res, 'authentication_error', 'User for this token cannot be found');
      }

      // Check request paramters
      if (!isValidUsername(req.body.username)) {
        return reject(req, res, 'invalid_request_error', 'Your username parameter is invalid');
      }

			// Reject if the client username doesn't match the username param in the request body
			if (req.body.username !== user['username']) {
				var message = 'You (' + user['username'] + ') cannot create a dropp for ' + req.body.username;
				return reject(req, res, 'resource_error', message);
			}

			if (!isValidLocation(req.body.location)) {
				return reject(req, res, 'invalid_request_error', 'Your location parameter is invalid');
			}

			if (!isValidInteger(req.body.timestamp)) {
				return reject(req, res, 'invalid_request_error', 'Your timestamp parameter is invalid');
			}

			// Reject if there is no content in the dropp
			if (req.body.text == null && req.body.media == null) {
				return reject(req, res, 'invalid_request_error', 'Your dropp has no content');
			}

			// Reject if the request contains no media and the text param is empty
			if (req.body.text != null && req.body.media == null && !isValidTextPost(req.body.text)) {
				return reject(req, res, 'invalid_request_error', 'Your text parameter is invalid');
			}

			// Add the dropp to the database
      firebase.createDropp(req, dbResult => {
        if (dbResult['error'] != null) {
          return rejectFromJson(req, res, dbResult);
        }

				// Send the dropp id to the client
        return res.json(dbResult);
      });
    })(req, res);
  });

	return router;
}

/**
 * Encodes a given payload with our proprietary secret
 * @param {string} username - the username from the client
 * @param {Object} userDetails - a JSON array containing extra info about the user
 * @returns {Object} a JSON web token
 */
function generateToken(username, userDetails) {
	var user = {
		username: username,
		details: userDetails,
	};

	// Encode the user JSON in the JWT
  return jwt.sign(user, config.secret, { expiresIn: '30d' });
}

/**
 * Extracts the JSON web token from request headers
 * @param {Object} headers - the HTTP request headers
 * @returns {Object|null} the actual token or null
 */
function retrieveToken(headers) {
  if (headers && headers.authorization) {
    var parts = headers.authorization.split(' ');
    return parts.length != 2 ? null : parts[1];
  }

  return null;
}

/**
 * Determines the specific type of error generated from JWT events
 * @param {string} errorMessage - the JWT error message
 * @returns {string} a more clearly worded error message
 */
function determineJwtError(errorMessage) {
  var reason;
  switch (errorMessage) {
    case 'jwt expired':
      reason = 'Expired web token';
      break;
    case 'invalid signature':
      reason = 'Invalid web token';
      break;
    case 'jwt must be provided':
      reason = 'Missing web token';
      break;
    case 'No auth token':
      reason = 'Missing web token';
      break;
    default:
      reason = 'Unknown web token error';
  }

  return reason;
}

/**
 * Sends detailed error JSON to the client and logs the error
 * @param {Object} request - the HTTP request
 * @param {Object} response - the HTTP response
 * @param {Object} errorJson - the JSON containing the error type and details
 */
function rejectFromJson(request, response, errorJson) {
  console.log('%s request failed because: %s', request.method, errorJson['error']['message']);

  switch (errorJson['error']['type']) {
    case 'invalid_request_error':   response.status(400);
      break;
    case 'authentication_error':    response.status(401);
      break;
    case 'resource_error':          response.status(403);
      break;
    case 'login_error':             response.status(403);
      break;
    case 'resource_dne_error':      response.status(404);
      break;
    case 'api_error':               response.status(500);
      break;
    default:
  }

  response.json(errorJson);
}

/**
 * Sends detailed error JSON to the client and logs the error
 * @param {Object} request - the HTTP request
 * @param {Object} response - the HTTP response
 * @param {string} errorType - the standardized error type
 * @param {string} errorMessage - a more clear explanation of what went wrong
 */
function reject(request, response, errorType, errorMessage) {
  var errorJson = {
    error: {
      type: errorType,
      message: errorMessage,
    }
  };

  rejectFromJson(request, response, errorJson);
}

/**
 * Validates a username
 * @param {string} username - a username
 * @returns {Boolean} validity of username
 */
function isValidUsername(username) {
	/**
	 * Evaluates to true if username is not null, not empty, and only contains
	 * alphanumeric characters, dashes, or underscores
	 */
  return username != null && (/^[\w\-_]+$/).test(username);
}

/**
 * Validates an email address
 * @param {string} email - an email
 * @returns {Boolean} validity of email
 */
function isValidEmail(email) {
	// Evaluates to true if true if email is not null and matches valid email formats
  return email != null && (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/).test(email);
}

/**
 * Validates a password
 * @param {string} password - a password
 * @returns {Boolean} validity of password
 */
function isValidPassword(password) {
	// Evaluates to true if password is not empty and only contains alphanumeric and special characters
  return password != null && (/^[\w\S]+$/).test(password); // TODO: Add min length requirement
}

/**
 * Validates an id
 * @param {string} id - an id
 * @returns {Boolean} validity of id
 */
function isValidId(id) {
	// Evaluates to true if id is not null, not empty, and alphanumeric or has dashes
  return id != null && (/^[\w-]+$/).test(id);
}

/**
 * Validates a location
 * @param {string} location - the location string of the form "latitude,longitude"
 * @returns {Boolean} validity of location
 */
function isValidLocation(location) {
	// Evaluates to true if location is not null & is two comma separated decimal numbers
	return location != null && (/^(\-?\d+(\.\d+)?),\s*(\-?\d+(\.\d+)?)$/).test(location);
}

/**
 * Validates an integer
 * @param {Number} number - a number
 * @returns {Boolean} validity of number
 */
function isValidInteger(number) {
	// Evaluates to true if number is not null and an integer
  return number != null && (/^\d+$/).test(number);
}

/**
 * Validates a number
 * @param {Number} number - a number
 * @returns {Boolean} validity of number
 */
function isValidNonNegNumber(number) {
	// Evaluates to true if number is not null and non-negative decimal value
  return number != null && (/^\d+(\.\d*)?$/).test(number);
}

/**
 * Validates a text post
 * @param {string} text - a body of text
 * @returns {Boolean} validity of text
 */
function isValidTextPost(text) {
	// Evaluates to true if text is not null, not empty, and starts with a character
	return text != null && (/^\S[\w\W]+$/).test(text);
}

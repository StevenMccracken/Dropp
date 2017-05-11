/**
 * middleware_mod -  @module to authenticate and validate requests, call firebase module, and handles errors
 */

const fs 							= require('fs');
const Log 						= require('./log_mod');
const ERROR 					= require('./error_mod');
const MEDIA 					= require('./media_mod');
const FIREBASE 				= require('./firebase_mod');
const AUTHENTICATION	= require('./authentication_mod');

var defaultResponse = { message: 'Default response' };

/**
 * auth - Authorizes a user and generates a JSON web token for them
 * @param {Object} _request the HTTP request
 * @param {Object} _response the HTTP response
 * @param {callback} _callback the callback to send the database response
 */
var auth = function(_request, _response, _callback) {
	const SOURCE = 'auth()';
	var response = defaultResponse, serverLog = null;

	log(SOURCE, _request);

	// Check request parameters
	if (!_request.body.username || !_request.body.password) {
		log('Missing login parameters', _request);
		response = ERROR.error(SOURCE, _request, _response, ERROR.CODE.INVALID_REQUEST_ERROR, 'Missing login paramerters');
		_callback(response);
	} else {
		/**
		 * Username & password params are in the request,
		 * so check if the password exists for that username
		 */
		FIREBASE.GET('/passwords/' +  _request.body.username, hashedPassword => {
			if (hashedPassword == null) {
				serverLog = _request.body.username + ' does not exists in passwords table';
				log(serverLog, _request);

				response = ERROR.error(SOURCE, _request, _response, ERROR.CODE.LOGIN_ERROR, serverLog);
				_callback(response);
			} else {
				// Password exists in the database, so generate a token
				AUTHENTICATION.auth(_request, _response, hashedPassword, () => {
					FIREBASE.GET('/users/' + _request.body.username, userData => {
						if (userData == null) {
							serverLog = 'username \'' + _request.body.username + '\' does not exists';
							response = ERROR.error(SOURCE + ' - GET username', _request, _response, ERROR.CODE.RESOURCE_DNE_ERROR, serverLog);
						} else {
							log(userData, _request);

							// Generate the JWT for the client request
							const token = AUTHENTICATION.genToken(_request.body.username, userData);
							response = {
								success : {
									token : 'JWT ' + token
								}
							};
						}

						_callback(response);
					}, getUserError => {
						response = ERROR.error(SOURCE, _request, _response, ERROR.CODE.LOGIN_ERROR, getUserError);
						_callback(response);
					});
				}, authError => {
					response = ERROR.error(SOURCE, _request, _response, ERROR.CODE.LOGIN_ERROR, authError);
					_callback(response);
				});
			}
		}, getPasswordError => {
			if (getPasswordError === -1) {
				serverLog = 'Invalid character in parameter. Would have caused Firebase error';
			} else {
				serverLog = getPasswordError;
			}

			response = ERROR.error(SOURCE + ' - GET password', _request, _response, ERROR.CODE.LOGIN_ERROR, serverLog);
			_callback(response)
		});
	}
};

/**
 * createUser - Adds a user and all their data to the database
 * @param {Object} _request the HTTP request
 * @param {Object} _response the HTTP response
 * @param {callback} _callback the callback to send the database response
 */
var createUser = function(_request, _response, _callback) {
	const SOURCE = 'createUser()';
	var response = defaultResponse, serverLog = null;

	log(SOURCE, _request);

	// Check request paramerters
	var invalidParam = null;
	if (!isValidUsername(_request.body.username)) {
		invalidParam = 'username';
	} else if (!isValidEmail(_request.body.email)) {
		invalidParam = 'email';
	} else if (!isValidPassword(_request.body.password)) {
		invalidParam = 'password';
	}

	if (invalidParam != null) {
		serverLog = 'Invalid ' + invalidParam + ' parameter';
		log(serverLog, _request);

		response = ERROR.error(SOURCE, _request, _response, ERROR.CODE.INVALID_REQUEST_ERROR, serverLog);
		response.error.message = 'Your ' + invalidParam + ' parameter is invalid';
		_callback(response);
	} else {
		// All params are good, try to add user to database
		FIREBASE.GET('/users/' + _request.body.username, user => {
			// Check if username already exists
			if (user != null) {
				// That username already exists
				serverLog = 'New user not created because \'' + _request.body.username + '\' already exists';
				response  = ERROR.error(SOURCE, _request, _response, ERROR.CODE.RESOURCE_ERROR, serverLog);
				_callback(response);
			} else {
				/**
				 * User does not already exist, so add them to the users
				 * table first. Construct JSON with user information
				 */
				 var newUserInfo = {
				 	email: _request.body.email
				 };

				 // In a case where something goes wrong, user needs to be deleted
				 var removeUser = function(_user) {
				 	/**
					 * Adding password record failed so remove user
					 * from user table to prevent inconsistency
					 */
					 var userDeleted = false;

					 // Removing the user record might not succeed so try multiple times
					 var attemptLimit = 15;
					 for (var attempts = 0; attempts < attemptLimit && !userDeleted; attempts++) {
						 FIREBASE.POST('/users/' + _request.body.username, null, 'remove', function() {
							 userDeleted = true;
						 }, err => {
					 		// Deleting the user failed. Log progress and try again
							console.log('Attempt %d failed to remove password record for %s', attempts + 1, _request.body.username);

							/**
							 * If the password record does not exist in the passwords table, but
							 * a user record for that password DOES exist in the user table, the
							 * database is inconsistent because a user exists without a password.
							 * All attempts to delete the user failed, so log this error with high
							 * alert. FIXME: Send some sort of notification to make error more visible
							 */
							if (attempts >= attemptLimit) {
								log('EXTREME ERROR. Failed to delete password record for '
									+ _request.body.username + ' ' + attemptLimit
									+ ' times. Manually deleted the record!', _request);

								response = ERROR.error(SOURCE, _request, _response, ERROR.CODE.API_ERROR, err);
								_callback(response);
							}
						});
					}
				}

				/**
				 * Set user record in the users table. The key is req.body.username
				 * and the value is the user JSON constructed earlier
				 */
				log('Creating new user in database', _request);
				FIREBASE.POST('/users/' + _request.body.username, newUserInfo, 'set', () => {
					// Hash password and store in database
					AUTHENTICATION.hash(_request.body.password, hashedPassword => {
						// Sucessfully hashed password
						FIREBASE.POST('/passwords/' + _request.body.username, hashedPassword, 'set', () => {
							/**
							 * Password was successfully added to the passwords table.
							 * Add username to JSON for the client. Send the JSON
							 * containing all the user information with the callback
							 */
							newUserInfo.username = _request.body.username;
							_response.status(201);
							_callback(newUserInfo);
						}, fbSetPasswordErr => {
							// Failed to add password to database. Remove the user
							if (fbSetPasswordErr === -1) {
								serverLog = 'Invalid character in parameter. Would have caused Firebase error';
								response = ERROR.error(SOURCE + ' - SET password', _request, _response, ERROR.CODE.INVALID_REQUEST_ERROR, serverLog);
								response.error.message = 'Invalid password parameter';
							} else {
								serverLog = fbSetPasswordErr;
								response = ERROR.error(SOURCE, _request, _response, ERROR.CODE.API_ERROR, serverLog);
							}

							removeUser(_request.body.username);
							_callback(response);
						});
					}, hashErr => {
						// Failed to hash the password. Remove the user
						response = ERROR.error(SOURCE, _request, _response, ERROR.CODE.API_ERROR, hashErr);
						removeUser(_request.body.username);
						_callback(response);
					});
				}, fbSetUserErr => {
					// Failed to add the user to the database
					if (fbSetUserErr === -1) {
						serverLog = 'Invalid character in parameter. Would have caused Firebase error';
						response = ERROR.error(SOURCE + ' - ADD user', _request, _response, ERROR.CODE.LOGIN_ERROR, serverLog);
						response.error.message = 'Invalid username parameter';
					} else {
						serverLog = fbSetUserErr;
						response = ERROR.error(SOURCE, _request, _response, ERROR.CODE.API_ERROR, serverLog);
					}

					removeUser(_request.body.username);
					_callback(response);
				});
			}
		}, fbCheckUserErr => {
			// Failed while checking if username already existed
			if (fbCheckUserErr === -1) {
				serverLog = 'Invalid character in parameter. Would have caused Firebase error';
				response = ERROR.error(SOURCE + ' - CHECK user', _request, _response, ERROR.CODE.LOGIN_ERROR, serverLog);
				response.error.message = 'Invalid username parameter';
			} else {
				serverLog = fbCheckUserErr;
				response = ERROR.error(SOURCE, _request, _response, ERROR.CODE.API_ERROR, serverLog);
			}

			removeUser(_request.body.username);
			_callback(response)
		});
	}
};

/**
 * getUser - Retrieves a user from the database
 * @param {Object} _request the HTTP request
 * @param {Object} _response the HTTP response
 * @param {callback} _callback the callback to send the database response
 */
var getUser = function(_request, _response, _callback) {
	const SOURCE = 'getUser()';
	var response = null, serverLog = null;

	log(SOURCE, _request)

	// Verify client's web token first
	AUTHENTICATION.verifyToken(_request, _response, (user) => {
		// Token was verified so query database by username
		FIREBASE.GET('/users/' + _request.params.username, userData => {
			if (userData == null) {
				serverLog = 'username \'' + _request.params.username + '\' does not exist';
				response = ERROR.error(SOURCE, _request, _response, ERROR.CODE.RESOURCE_DNE_ERROR, serverLog);
			} else {
				response = userData;
			}

			_callback(response);
		}, fbGetUserErr => {
			// Failed while checking if username already existed
			if (fbCheckUserErr === -1) {
				serverLog = 'Invalid character in URL. Would have caused Firebase error';
				response = ERROR.error(SOURCE, _request, _response, ERROR.CODE.INVALID_URL_ERROR, serverLog);
			} else {
				serverLog = fbCheckUserErr;
				response = ERROR.error(SOURCE, _request, _response, ERROR.CODE.API_ERROR, serverLog);
			}

			_callback(response)
		});
	}, authErr => {
		_callback(authErr);
	});
};

/**
 * createDropp - Adds a dropp to the database
 * @param {Object} _request the HTTP request
 * @param {Object} _response the HTTP response
 * @param {callback} _callback the callback to send the database response
 */
var createDropp = function(_request, _response, _callback) {
	const SOURCE = 'createDropp()';
	var response, serverLog;

	log(SOURCE, _request);

	// Verify client's web token first
	AUTHENTICATION.verifyToken(_request, _response, (user) => {
		// Check request parameters
		var invalidParam = null;
		if (!isValidLocation(_request.body.location)) {
			invalidParam = 'location';
		} else if (!isValidInteger(_request.body.timestamp)) {
			invalidParam = 'timestamp';
		} else if (_request.body.text == null) {
			/**
			 * If the text parameter doesn't exist at all, reject
			 * the request (it can be empty if media exists)
			 */
			invalidParam = 'text';
		} else if (!isValidMedia(_request.body.media)) {
			invalidParam = 'media';
		}

		// If there was an invalid parameter, reject the request
		if (invalidParam != null) {
			serverLog = 'Invalid ' + invalidParam + ' parameter';
			log(serverLog, _request);

			response = ERROR.error(SOURCE, _request, _response, ERROR.CODE.INVALID_REQUEST_ERROR, serverLog);
			_callback(response);
		}

		// Make sure dropp content is not empty
		if (_request.body.media === 'false' && isEmptyTextPost(_request.body.text)) {
			serverLog = 'No dropp content';
			log(serverLog, _request);

			response = ERROR.error(SOURCE, _request, _response, ERROR.CODE.INVALID_REQUEST_ERROR, serverLog);
			_callback(response);
		}

		// All parameters are valid, so build dropp JSON
		var dropp = {
			location 	: _request.body.location.replace(/\s/g, ''),
			timestamp	: parseInt(_request.body.timestamp),
			username 	: user.username,
			text 			: _request.body.text.trim(),
			media 		: _request.body.media === 'true'
		};

		// Add dropp to database
		FIREBASE.POST('/dropps', dropp, 'push', key => {
			var droppKey = key.toString().split('/').pop();
			response = { droppId: droppKey };
			_callback(response);
		}, err => {
			response = ERROR.error(SOURCE, _request, _response, ERROR.CODE.API_ERROR, err);
			_callback(response);
		});
	}, authErr => {
		_callback(authErr);
	});
};

/**
 * getDropp - Retrieves a dropp from the database
 * @param {Object} _request the HTTP request
 * @param {Object} _response the HTTP response
 * @param {callback} _callback the callback to send the database response
 */
var getDropp = function(_request, _response, _callback) {
	const SOURCE = 'getDropp()';
	var response, serverLog;

	log(SOURCE, _request);

	// Verify client's web token first
	AUTHENTICATION.verifyToken(_request, _response, (user) => {
		// Check request parameters
		if (!isValidId(_request.params.droppId)) {
			serverLog = '\'' + _request.params.droppId + '\' is an invalid droppId';
			response = ERROR.error(SOURCE, _request, _response, ERROR.CODE.INVALID_REQUEST_ERROR, serverLog);
			_callback(response);
		} else {
			// Parameters are valid, so query database
			FIREBASE.GET('/dropps/' + _request.params.droppId, droppContent => {
				if (droppContent == null) {
					serverLog = 'Dropp with id \'' + _request.params.droppId + '\' does not exist';
					response = ERROR.error(SOURCE, _request, _response, ERROR.CODE.RESOURCE_DNE_ERROR, serverLog);
				} else {
					response = droppContent;
				}

				_callback(response);
			}, getDroppErr => {
				if (getDroppErr === -1) {
					serverLog = 'Invalid character in parameter. Would have caused Firebase error';
					response = ERROR.error(SOURCE, _request, _response, ERROR.CODE.INVALID_URL_ERROR, serverLog);
				} else {
					serverLog = getDroppErr;
					response = ERROR.error(SOURCE, _request, _response, ERROR.CODE.API_ERROR, serverLog);
				}

				_callback(response)
			});
		}
	}, authErr => {
		_callback(authErr);
	});
};

/**
 * getAllDropps - Retrieves all dropps from the database
 * @param {Object} _request the HTTP request
 * @param {Object} _response the HTTP response
 * @param {callback} _callback the callback to send the database response
 */
var getAllDropps = function(_request, _response, _callback) {
	const SOURCE = 'getAllDropps()';
	var response;

	log(SOURCE, _request);

	// Verify client's web token first
	AUTHENTICATION.verifyToken(_request, _response, (user) => {
		// Query database
		FIREBASE.GET('/dropps', dropps => {
			_callback(dropps);
		}, dbErr => {
			response = ERROR.error(SOURCE, _request, _response, ERROR.CODE.API_ERROR, dbErr);
			_callback(response);
		});
	}, authErr => {
		_callback(authErr);
	});
};

/**
 * getDroppsByUser - Retrieves all dropps from the database posted by a user
 * @param {Object} _request the HTTP request
 * @param {Object} _response the HTTP response
 * @param {callback} _callback the callback to send the database response
 */
var getDroppsByUser = function(_request, _response, _callback) {
	const SOURCE = 'getDroppsByUser()';
	var response, serverLog;

	log(SOURCE, _request);

	// Verify client's web token first
	AUTHENTICATION.verifyToken(_request, _response, (user) => {
		// Check request parameters
		if (!isValidUsername(_request.params.username)) {
			serverLog = 'Invalid username parameter';
			response = ERROR.error(SOURCE, _request, _response, ERROR.CODE.INVALID_REQUEST_ERROR, serverLog);
			_callback(response);
		} else {
			// Parameters are valid, so query database
			FIREBASE.GET('/dropps', allDropps => {
				response = {};

				// Loop over all dropps
				for (var k in allDropps) {
					// If the dropp's poster matches the requested username, add dropp to response
					if (allDropps[k].username === _request.params.username) {
						response[k] = allDropps[k];
					}
				}

				_callback(response);
			}, dbErr => {
				response = ERROR.error(SOURCE, _request, _response, ERROR.CODE.API_ERROR, dbErr);
				_callback(response);
			});
		}
	}, authErr => {
		_callback(authErr);
	});
};

/**
 * getDroppsByLocation - Retrieves all dropps from the database near a location
 * @param {Object} _request the HTTP request
 * @param {Object} _response the HTTP response
 * @param {callback} _callback the callback to send the database response
 */
var getDroppsByLocation = function(_request, _response, _callback) {
	const SOURCE = 'getDroppsByLocation()';
	var response, serverLog;

	log(SOURCE, _request);

	// Verify client's web token first
	AUTHENTICATION.verifyToken(_request, _response, (user) => {
		// Check request parameters
		var invalidParam = null;
		if (!isValidLocation(_request.body.location)) {
			invalidParam = 'location';
		} else if (!isValidPositiveFloat(_request.body.maxDistance)) {
			invalidParam = 'maxDistance';
		}

		if (invalidParam != null) {
			serverLog = 'Invalid ' + invalidParam + ' parameter';
			response = ERROR.error(SOURCE, _request, _response, ERROR.CODE.INVALID_REQUEST_ERROR, serverLog);
			_callback(response);
		} else {
			// Parameters are valid so query database
			FIREBASE.GET('/dropps', allDropps => {
				/**
				 * Turn the latitude,longitude string param in
				 * the request body from into a Number array
				 */
				const locationArr = _request.body.location.split(',').map(Number);

				// Filter close dropps from all dropps
				response = getCloseDropps(allDropps, locationArr, _request.body.maxDistance);
				_callback(response);
			}, dbErr => {
				response = ERROR.error(SOURCE, _request, _response, ERROR.CODE.API_ERROR, dbErr);
				_callback(response);
			});
		}
	}, authErr => {
		_callback(authErr);
	});
};

/**
 * addImage - Uploads an image to google cloud storage
 * @param {Object} _request the HTTP request
 * @param {Object} _response the HTTP response
 * @param {callback} _callback the callback to send the database response
 */
var addImage = function(_request, _response, _callback) {
	const SOURCE = 'uploadImage()';
	var response, serverLog;

	log(SOURCE, _request);

	// Verify client's web token first
	AUTHENTICATION.verifyToken(_request, _response, (user) => {
		// Check request parameters
		if (!isValidId(_request.params.droppId)) {
			serverLog = 'Invalid droppId parameter';
			response = ERROR.error(SOURCE, _request, _response, ERROR.CODE.INVALID_REQUEST_ERROR, serverLog);

			// Remove temp file that multer created
			if (_request.file !== undefined) {
				removeFile(_request.file.path);
			}

			_callback(response);
		} else {
			// Parameters are valid, so query database
			FIREBASE.GET('/dropps/' + _request.params.droppId, dropp => {
				if (dropp == null) {
					// Remove temp file that multer created
					if (_request.file !== undefined) {
						removeFile(_request.file.path);
					}

					// Send response to client
					serverLog = 'Dropp ' + _request.params.droppId + ' does not exist';
					response = ERROR.error(SOURCE, _request, _response, ERROR.CODE.RESOURCE_DNE_ERROR, serverLog);
					_callback(response);
				} else if (dropp.media === 'false') {
					// If dropp has media = false, do not allow an image upload
					// Remove temp file that multer created
					if (_request.file !== undefined) {
						removeFile(_request.file.path);
					}

					// Send response to client
					serverLog = 'Dropp media value is false';
					response = ERROR.error(SOURCE, _request, _response, ERROR.CODE.RESOURCE_ERROR, serverLog);
					response.error.message = 'That dropp is not allowed to have media attached';

					_callback(response);
				} else {
					/**
					 * Dropp exists in database and is supposed to have
					 * media. Check if request body contains file param
					 */
					if (_request.file !== undefined) {
						// Make sure only specific image files are in the request body data
						if (_request.file.mimetype != 'image/jpeg' && _request.file.mimetype != 'image/png') {
							// Delete the temp file that multer created
							removeFile(_request.file.path);

							// Send response to client
							serverLog = 'Invalid mimetype (' + _request.file.mimetype + ')';
							response = ERROR.error(SOURCE, _request, _response, ERROR.CODE.INVALID_MEDIA_TYPE, serverLog);
							_callback(response);
						} else {
							/**
							 * Valid file has been sent with request. Access file that multer
							 * added to temp directory and stream it to google cloud storage
							 */
					    const filename = _request.params.droppId;
					    var localReadStream = fs.createReadStream(_request.file.path);
			        var remoteWriteStream = MEDIA.bucket.file(filename).createWriteStream();
			        localReadStream.pipe(remoteWriteStream);

			        // Catch error event while uploading
			        remoteWriteStream.on('error', function(err) {
			          response = ERROR.error(SOURCE, _request, _response, ERROR.CODE.API_ERROR, err);

			           // Remove temp file that multer created
			          removeFile(_request.file.path);
			          _callback(response);
			        });

			        // Catch finish event after uploading
			        remoteWriteStream.on('finish', function() {
			          response = {
									success: {
										message: 'Added image to dropp ' + _request.params.droppId,
			            }
			          };

			           // Remove temp file that multer created
			          removeFile(_request.file.path);
			          _callback(response);
			        });
						}
					} else {
						serverLog = 'Missing file parameter';
						response = ERROR.error(SOURCE, _request, _response, ERROR.CODE.INVALID_REQUEST_ERROR, serverLog);
						_callback(response);
					}
				}
			}, fbGetDroppErr => {
				if (fbGetDroppErr === -1) {
					serverLog = 'Invalid character in parameter. Would have caused Firebase error';
					response = ERROR.error(SOURCE, _request, _response, ERROR.CODE.INVALID_URL_ERROR, serverLog);
				} else {
					serverLog = fbGetDroppErr;
					response = ERROR.error(SOURCE, _request, _response, ERROR.CODE.API_ERROR, serverLog);
				}

				_callback(response);
			});
		}
	}, authErr => {
		_callback(authErr);
	});
};

/**
 * getImage - Downloads an image from google cloud storage
 * @param {Object} _request the HTTP request
 * @param {Object} _response the HTTP response
 * @param {callback} _callback the callback to send the database response
 */
var getImage = function(_request, _response, _callback) {
	const SOURCE = 'getImage()';
	var response, serverLog;

	log(SOURCE, _request);

	// Verify client's web token first
	AUTHENTICATION.verifyToken(_request, _response, (user) => {
		// Check request parameters
		if (!isValidId(_request.params.droppId)) {
			serverLog = 'Invalid droppId parameter';
			response = ERROR.error(SOURCE, _request, _response, ERROR.CODE.INVALID_REQUEST_ERROR, serverLog);
			_callback(response);
		} else {
			// Parameters are valid, so check if dropp in firebase has media value as true
			FIREBASE.GET('/dropps/' + _request.params.droppId, dropp => {
				if (dropp == null) {
					serverLog = 'Dropp ' + _request.params.droppId + ' does not exist';
					response = ERROR.error(SOURCE, _request, _response, ERROR.CODE.RESOURCE_DNE_ERROR, serverLog);
					response.error.message = 'That dropp does not exist';

					_callback(response);
				} else if (dropp.media === 'false') {
					serverLog = 'Dropp ' + _request.params.droppId + ' has no media';
					response = ERROR.error(SOURCE, _request, _response, ERROR.CODE.RESOURCE_DNE_ERROR, serverLog);
					response.error.message = 'That dropp has no media';

					_callback(response);
				} else {
					// Requested dropp has media, so query google cloud storage for image
					var filename = _request.params.droppId;
					var remoteReadStream = MEDIA.bucket.file(filename).createReadStream();

					// Determine if image should be sent as base-64 string for react-native clients
					const REACT_NATIVE = _request.headers != null
														&& _request.headers.platform === 'React-Native';

					// Catch error event while downloading
					remoteReadStream.on('error', function(firebaseError) {
						if (firebaseError.code === 404) {
							response = ERROR.error(SOURCE, _request, _response, ERROR.CODE.RESOURCE_DNE_ERROR, 'Image does not exist');
						} else {
							response = ERROR.error(SOURCE, _request, _response, ERROR.CODE.API_ERROR, firebaseError);
						}

						_callback(response);
					});

					// Download bytes from google cloud storage reference to local memory array
					var data = [];
					remoteReadStream.on('data', function(d) { data.push(d); } );

					// Catch finish event after downloading has finished
					remoteReadStream.on('end', function() {
						// Create buffer object from array of bytes
						var buffer = Buffer.concat(data);

						if (REACT_NATIVE) {
							encodeForReactNative(buffer, string => {
								response = {
									media : string
								};

								_callback(response);
							});
						} else {
							response = {
								media : buffer
							};

							_callback(response);
						}
					});
				}
		}, fbGetDroppErr => {
			if (fbGetDroppErr === -1) {
				serverLog = 'Invalid character in parameter. Would have caused Firebase error';
				response = ERROR.error(SOURCE, _request, _response, ERROR.CODE.INVALID_URL_ERROR, serverLog);
			} else {
				serverLog = fbGetDroppErr;
				response = ERROR.error(SOURCE, _request, _response, ERROR.CODE.API_ERROR, serverLog);
			}

			_callback(response);
		});
	}}, authErr => {
		_callback(authErr);
	});
};

module.exports = {
	auth 								: auth,
	getUser 						: getUser,
	addImage 						: addImage,
	getImage						: getImage,
	getDropp 						: getDropp,
	createUser 					: createUser,
	createDropp 				: createDropp,
	getAllDropps 				: getAllDropps,
	getDroppsByUser 		: getDroppsByUser,
	getDroppsByLocation	: getDroppsByLocation
};

function encodeForReactNative(buffer, callback) {
	// Encode buffer data to base-64 string
	var base64String = buffer.toString('base64');

	// First chunk of buffer data will have the encoding type
	var filetype;
	const ENCODED_FILETYPE = base64String.substring(0,14);

	if (ENCODED_FILETYPE === '/9j/4AAQSkZJRg') {
		filetype = 'jpeg';
	} else if (ENCODED_FILETYPE === 'iVBORw0KGgoAAA') {
		filetype = 'png';
	} else {
		filetype = 'unknown';
		// FIXME: throw an error ?
	}

	const FULL_STRING = 'data:image/' + filetype + ';base64,' + base64String;
	callback(FULL_STRING);
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
 * @param {string} location the location string of the form 'latitude,longitude'
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
 * isValidMedia - Validates a media text string
 * @param {string} media the media string
 * @returns {Boolean} validity of media
 */
function isValidMedia(media) {
	// Evalutes to true if media is not null and equal to string 'true' or 'false'
	return media != null && media === 'true' || media === 'false';
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
 * isEmptyTextPost - Validates a text post
 * @param {string} text a string of text
 * @returns {Boolean} validity of text
 */
function isEmptyTextPost(text) {
	// Evaluates to true if text is not null and has at least one character
	return text == null || text.trim().length == 0;
}

/**
 * distance - Haversine function to calculate
 * the distance between two GPS coordinates
 * @param {Number[]} loc1 an array of latitude,longitude coordinates
 * @param {Number[]} loc2 an array of latitude,longitude coordinates
 * @returns {Number} the straight-line distance between loc1 and loc2
 */
 function distance(loc1, loc2) {
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

/**
 * getCloseDropps - Calculates the dropps that are near a given location
 * @param {Object} dropps JSON of dropps
 * @param {Number[]} targetLocation array representing lat,long coordinates
 * @param {Number} maxDistance the radius extending from targetLocation
 * @returns {Object} JSON of dropps within maxDistance of targetLocation
 */
 function getCloseDropps(dropps, targetLocation, maxDistance) {
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
		count : numCloseDropps,
		'dropps' : closeDropps
	};

	return response;
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
 * log - Logs a message to the server console
 * @param {string} _message the log message
 * @param {Object} _request the HTTP request
 */
function log(_message, _request) {
	Log.log('Middleware Module', _message, _request);
}

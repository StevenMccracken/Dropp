/**
 * middleware_mod -  Authenticate and validate request, call firebase module and handle error @module
 */

const ERROR 			= require("./error_mod");
const FIREBASE 			= require("./firebase_mod");
const Log 				= require("./log_mod");
const AUTHENTICATION 	= require("./authentication_mod");
const MEDIA 			= require("./media_mod");
const fs 				= require("fs");


var auth = function(_request, _response, _callback) {
	log("Authenticate Client", _request);
	const source = "POST /authenticate";
	var response = { message : "Default Response"}, serverLog = null;

	// Check request parameters
	if( !_request.body.username || !_request.body.password){
		log("Missing login parameters", _request);
		// Respond with error
		response = ERROR.error(source, _request, _response, ERROR.CODE.INVALID_REQUEST_ERROR, 'Missing login paramerter');
		_callback(response);
	} else {

		// // Call authentication module to validate and produce generated token
		// AUTHENTICATION.auth(_request, _response, _callback);

		/* Validate Credential */
		FIREBASE.GET('/passwords/' +  _request.body.username, hashedPassword => {
			if (hashedPassword == null){
				serverLog = _request.body.username + ' does not exists in passwords table';
				log(serverLog, _request);
				response = ERROR.error("Validate Credentials", _request, _response, ERROR.CODE.LOGIN_ERROR, serverLog);
				_callback(response);
			} else {
				/* Generating TOken */
				AUTHENTICATION.auth(_request, _response, hashedPassword, () => {

					FIREBASE.GET('/users/' + _request.body.username, userData => {
						if(userData == null){
							serverLog = 'user with username = ' + _request.body.username + ' does not exists';
							response = ERROR.error("GET user information on FIREBASE", _request, _response, ERROR.CODE.RESOURCE_DNE_ERROR, serverLog);
						} else {
							response = userData;
							log(response, _request);

							/* Generate the JWT for the client request */
							const token = AUTHENTICATION.genToken(_request.body.username, userData);
							response = {
								success : {
									token : 'JWT ' + token
								}
							};
						}
						_callback(response);
					}, err => {
						response = ERROR.error("Validate Credentials", _request, _response, ERROR.CODE.LOGIN_ERROR, err);
						_callback(response);
					});
				}, err => {
					response = ERROR.error("Validate Credentials", _request, _response, ERROR.CODE.LOGIN_ERROR, err);
					_callback(response);
				});
			}
		}, err => {
			response = ERROR.error("GET hashed password", _request, _response, ERROR.CODE.LOGIN_ERROR, err);
			_callback(response)
		});
	}

	
};

var createUser = function(_request, _response, _callback) {
	log("Create Users", _request);
	const source = "POST /users";

	var response = { message : "Default Response"}, serverLog = null;

	// Check request paramerters
	var invalidParam = null;
	if(!isValidUsername(_request.body.username)) {
		invalidParam = 'username';
	} else if (!isValidEmail(_request.body.email)) {
		invalidParam = 'email';
	} else if (!isValidPassword(_request.body.password)) {
		invalidParam = 'password';
	}

	if (invalidParam != null) {
		serverLog = "Invalid Parameter " + invalidParam;
		log(serverLog, _request);
		response = ERROR.error(source, _request, _response, ERROR.CODE.INVALID_REQUEST_ERROR, serverLog);
		_callback(response);
	} else {

		// All params are good, send request to databse to add user
		FIREBASE.GET('/users', userIDs => {

			// Check if username already exists
			// userIDs will be null if empty
			if( userIDs != null && userIDs[_request.body.username] != undefined) {
				// username already exists
				serverLog = "That username is already in use, new user was not created";
				response  = ERROR.error(source, _request, _response, ERROR.CODE.RESOURCE_ERROR, serverLog);
				_callback(response);
			} else {

				/**
				 * User does not already exist, so add them to the users
				 * table first. Construct JSON with user information
				 */
				 var newUserInfo = {
				 	email: _request.body.email
				 };

				 /* In a case where something goes wrong, user need to be deleted */
				 var removeUser = function(_user){
				 	/**
					 * Adding password record failed so remove user
					 * from user table to prevent inconsistency
					 */

					 var userDeleted = false;

					 // Removing the user record might not succeed so try multiple times
					 var attemptLimit = 15;
					 for (var attempts = 0; attempts < attemptLimit && !userDeleted; attempts++){
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

							if(attempts >= attemptLimit){ 
								log('EXTREME ERROR. Failed to delete password record for ' 
									+ _request.body.username + attemptLimit 
									+ ' times. Manually deleted the record!', _request);

								response = ERROR.error("Fail to post password", _request, _response, ERROR.CODE.API_ERROR, err);
								_callback(response);
							}

					 	});
					 }
				 }

				 /**
				 * Set user record in the users table. The key is req.body.username
				 * and the value is the user JSON constructed earlier
				 */
				 log( "Creating new user in database", _request);
				 FIREBASE.POST('/users/'+_request.body.username, newUserInfo, 'set', () => {
				 	// Salt password and store in database
				 	AUTHENTICATION.salt( _request.body.password, hashedPassword => {
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

				 		}, err => {
				 			response = ERROR.error(source, _request, _response, ERROR.CODE.API_ERROR, err);
				 			// Failed to salt, remove user
				 			removeUser(_request.body.username);
				 			_callback(response);
				 		})
				 	}, err => {
				 		response = ERROR.error(source, _request, _response, ERROR.CODE.API_ERROR, err);
				 		// Failed to salt, remove user
				 		removeUser(_request.body.username);
				 		_callback(response);
				 	});

				 }, err => {
				 	response = ERROR.error(source, _request, _response, ERROR.CODE.API_ERROR, err);
				 	_callback(response);
				 });
			}
		}, err => {
			response = ERROR.error(source, _request, _response, ERROR.CODE.API_ERROR, err);
			_callback(response);
		});
	}
};

var getUser = function(_request, _response, _callback) {
	const source = 'GET users/:username';
	var response = null, serverLog = null;

	// Verify web token
	AUTHENTICATION.verifyToken(_request, _response, (user)=> {
		// Query the database for requested user
		FIREBASE.GET('/users/' + _request.params.username, userData => {
			// console.log(data);
			// log(JSON.stringify(data));
			if(userData == null){
				// User doens't exists
				serverLog = 'user with username = ' + _request.params.username + ' does not exist';
				response = ERROR.error(source, _request, _response, ERROR.CODE.RESOURCE_DNE_ERROR, serverLog);
			} else {
				response = userData;
			}

			_callback(response);
		}, err => {
			// Get user's information from firebase error
			_callback(err);
		});
	}, err => {
		// Authentication of web token error
		_callback(err);
	});
};

var createDropps = function(_request, _response, _callback){
	const source = "POST /dropps";
	var response, serverLog;
	var dropps = {
		location 	: _request.body.location,
		timestamp 	: parseInt(_request.body.timestamp),
		username 	: null,
		text 		: _request.body.text == null ? '': _request.body.text,
		media 		: _request.body.media === 'true' ? true: false
	}

	// Verify web token
	AUTHENTICATION.verifyToken(_request, _response, (user)=> {
		
		dropps.username = user.username;

		// Create Dropps
		FIREBASE.POST('/dropps', dropps, "push", key => {
			var parseKey = key.toString().split('/').pop();
			response = {
				droppId: parseKey
			};
			_callback(response);
		}, err => {
			response = ERROR.error(source, _request, _response, ERROR.CODE.API_ERROR, err);
			_callback(response);
		});

	}, err => {
		// Authentication of web token error
		_callback(err);
	});


	// _callback(dropps);
};

var getDroppsById = function(_request, _response, _callback){
	const source = "Get dropps/:droppId";
	var response = null;
	// console.log(_request.params);
	// Verify web token
	AUTHENTICATION.verifyToken(_request, _response, (user)=> {
		
		if(!isValidId(_request.params.droppId)) {
			serverLog = "Invalid request dropp id";
			response = ERROR.error(source, _request, _response, ERROR.CODE.INVALID_REQUEST_ERROR, serverLog);
			_callback(response);
		} else {
			FIREBASE.GET('/dropps/' + _request.params.droppId, droppContent => {
				if(droppContent == null) {
					serverLog = "Db was queried for dropp " 
					+ _request.params.droppId + ' but it does not exist';

					response = ERROR.error(source, _request, _response, ERROR.CODE.RESOURCE_DNE_ERROR, serverLog);
				} else {
					response = droppContent;
				}
				_callback(response);
			});
		}

	}, err => {
		// Authentication of web token error
		_callback(err);
	});
};




var getAllDropps = function(_request, _response, _callback) {
	const source = 'GET /dropps';
	var response = null;

	AUTHENTICATION.verifyToken(_request, _response, (user)=> {
		
		FIREBASE.GET('/dropps', dropps => {
			_callback(dropps);
		}, err => {

			response = ERROR.error(source, _request, _response, ERROR.CODE.API_ERROR, err);
			_callback(response);
		});
	}, err => {
		// Authentication of web token error
		_callback(err);
	});
	
};

var getDroppsByUser = function(_request, _response, _callback) {

	const source = 'GET users/:username/dropps';
	var response = null;

	AUTHENTICATION.verifyToken(_request, _response, (user)=> {

		if(!isValidUsername(_request.params.username)) {
			serverLog = "Invalid Username";
			response = ERROR.error(source, _request, _response, ERROR.CODE.INVALID_REQUEST_ERROR, serverLog);
			_callback(response);
		} else {
			FIREBASE.GET('/dropps', allDropps => {

				response = {};
				for( var k in allDropps){
					if(allDropps[k].username === user.username) {
						response[k] = allDropps[k];
					}
				}

				_callback(response);
			}, err => {
				response = ERROR.error(source, _request, _response, ERROR.CODE.API_ERROR, err);
				_callback(response);
			});
		}
	}, err => {
		// Authentication of web token error
		_callback(err);
	});

};


var getDroppsByLocation = function(_request, _response, _callback) {
	const source = 'POST location/dropps';
	var response, serverLog;

	AUTHENTICATION.verifyToken(_request, _response, (user)=> {


		/* Check request parameters */
		var invalidParam = null;
		if(!isValidLocation(_request.body.location)) {
			invalidParam = 'Invalid location';
		} else if (!isValidPositiveFloat(_request.body.maxDistance)) {
			invalidParam = 'Max distance';
		}

		/**************/

		if(invalidParam != null) {
			serverLog = invalidParam;
			response = ERROR.error(source, _request, _response, ERROR.CODE.INVALID_REQUEST_ERROR, serverLog);
			_callback(response);
		} else {

			FIREBASE.GET('/dropps', allDropps => {

				/**
				 * Turn the latitude,longitude param in the
				 * request body from a string to a Number array
				 */
				const locationArr = _request.body.location.split(',').map(Number);
				// Filter close dropps from all dropps
				response = getCloseDropps(allDropps, locationArr, _request.body.maxDistance);

				_callback(response);


			}, err => {
				response = ERROR.error(source, _request, _response, ERROR.CODE.API_ERROR, err);
				_callback(response);
			});
			// _callback(_request.body.location);
		}

	}, err => {
		// Authentication of web token error
		_callback(err);
	});
};


var uploadImage = function(_request, _response, _callback) {

	const source = 'POST /dropps/' + _request.params.droppId + '/image';
	var response, serverLog;
	AUTHENTICATION.verifyToken(_request, _response, (user)=> {

		// Check request parameters
		if (!isValidId(_request.params.droppId)) {

			serverLog = "Not valid dropp id";
			response = ERROR.error(source, _request, _response, ERROR.CODE.INVALID_REQUEST_ERROR, serverLog);

			// Remove temp file that multer created
			if( _request.file !== undefined){
				removeFile(_request.file.path);
			}
			_callback(response);
		} else {


			// Reject this request if droppId does not exist in database
			FIREBASE.GET('/dropps', dropps => {



				if( !(_request.params.droppId in dropps)){
					// DroppId doesn't exist
					serverLog = "Dropps id doesn't exists";
					response = ERROR.error(source, _request, _response, ERROR.CODE.INVALID_REQUEST_ERROR, serverLog);
					_callback(response);
				} else {
					// dropp id exist

					// If there is a file in the multi-part form request body, process it
					if(_request.file !== undefined) {

						// Make sure only specific image files are accepted
						if(_request.file.mimetype != 'image/jpeg' && _request.file.mimetype != 'image/png') {
							serverLog = "Invalid mimetype (" + _request.file.mimetype + ')';
							response = ERROR.error(source, _request, _response, ERROR.CODE.INVALID_REQUEST_ERROR, serverLog);
							removeFile(_request.file.path);
							_callback(response);
						} else {

							    // Access file that multer added to ./temp/uploads/ and stream it to google cloud storage
							    const filename = _request.params.droppId;
							    var localReadStream = fs.createReadStream(_request.file.path);
						        var remoteWriteStream = MEDIA.bucket.file(filename).createWriteStream();
						        localReadStream.pipe(remoteWriteStream);

						        // Catch error event while uploading
						        remoteWriteStream.on('error', function(err) {
						          response = ERROR.error(source, _request, _response, ERROR.CODE.API_ERROR, err);//logError(source, res, errors.API_ERROR, err);

						           // Remove temp file that multer created
						          removeFile(_request.file.path);
						          // return res.json(responseJson);
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
						          // return res.json(responseJson);
						          _callback(response);
						        });

							    // _callback(filename);
						}
					} else {
						serverLog = "No file parameter provided";
						response = ERROR.error(source, _request, _response, ERROR.CODE.INVALID_REQUEST_ERROR, serverLog);
						_callback(response);
					}
				}	
				// console.log(_request.params.droppId in dropps);
			}, err => {
				_callback(err);
			});
			// _callback(_request.file);
		}

	}, err => {
		_callback(err);
	});
}


var getImage = function(_request, _response, _callback) {
	const source = 'GET /dropps/' + _request.params.droppId + '/image';

	var response, serverLog;

	AUTHENTICATION.verifyToken(_request, _response, (user)=> {
		if( !isValidId(_request.params.droppId) ) {
			serverLog = "Invalid Dropp id";
			response = ERROR.error(source, _request, _response, ERROR.CODE.INVALID_REQUEST_ERROR, serverLog);
			_callback(response);
		} else {

			// Get google cloud storage reference
			var filename = _request.params.droppId;
			var remoteReadStream = MEDIA.bucket.file(filename).createReadStream();

			// Catch error event while downloading
			remoteReadStream.on('error', function(firebaseError) {
				if(firebaseError.code === 404) {
					response = ERROR.error(source, _request, _response, ERROR.CODE.RESOURCE_DNE_ERROR, "Code 404");
				} else {
					response = ERROR.error(source, _request, _response, ERROR.CODE.API_ERROR, firebaseError);
				}
				_callback(response);
			});

			// Download bytes from google cloud storage reference to local memeory array
			var bufs = [];
			remoteReadStream.on('data', function(d) { bufs.push(d); } );

			// Catch finish event after downloading has finished
			remoteReadStream.on('end', function() {
				// Send byte string to client
				var buf = Buffer.concat(bufs);
				response = {
					media : buf
				};
				_callback(response);
			});
		}
	}, err => {
		_callback(err);
	});
}



 module.exports = {
	auth 				: auth,
	createUser 			: createUser,
	getAllDropps 		: getAllDropps,
	getDroppsByUser 	: getDroppsByUser,
	getDroppsById 		: getDroppsById,
	getDroppsByLocation : getDroppsByLocation,
	createDropps 		: createDropps,
	getUser 			: getUser,
	uploadImage 		: uploadImage,
	getImage			: getImage
};



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
		count: numCloseDropps,
		'dropps': closeDropps
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





function log(_message, _request){

	Log.log("Middleware Module", _message, _request);
}


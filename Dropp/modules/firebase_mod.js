/* Firebase module */

var db 							= null,
		bcrypt					= require('bcrypt-nodejs'),
		admin 					= require('firebase-admin'),
		serviceAccount 	= require('../serviceAccountKey.json');

// Authenticate firebase
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: 'https://dropp-3a65d.firebaseio.com'
});

db = admin.database();
var exports = module.exports = {};

// Validates username and password from request with database record
exports.validateCredentials = function(username, password, callback) {
	// Declare error variables
	var dbReason, errorType, explanation;

	// Retrieve password for requested user
	var passwordRef = db.ref('/passwords/' + username);
	passwordRef.once('value', snapshot => {
		if (snapshot.val() == null) {
			dbReason    = username + ' does not exist in passwords table';
			errorType   = 'login_error';
			explanation = 'The username or password is incorrect';
			return callback(fail('validateCredentials', dbReason, errorType, explanation));
		}

		// Compare the entered password to the database password
		bcrypt.compare(password, snapshot.val(), (err, res) => {
			if (err) {
        switch (err) {
					case 'Not a valid BCrypt hash.':
						dbReason    = 'Password for ' + username + ' is not hashed in the database';
						errorType   = 'api_error';
						explanation = 'There was a problem with our back-end services';
						break;
          default:
            dbReason    = 'unknown';
            errorType   = 'api_error';
            explanation = 'There was a problem with our back-end services';
        }

        return callback(fail('validateCredentials', dbReason, errorType, explanation));
      }

			if (!res) {
        dbReason    = password + ' does not match ' + username + '\'s password';
        errorType   = 'login_error';
        explanation = 'The username or password is incorrect';
        return callback(fail('validateCredentials', dbReason, errorType, explanation));
      }

			var successJson = {
        success: {
          message: 'Valid login credentials',
        }
      };

      callback(successJson);
		});
	}, err => {
		// Determine type of error
		var errorCode = -1; // FIXME: Parse err object for more specific information
		switch (errorCode) {
			default:
				dbReason    = err;
				errorType   = 'api_error';
				explanation = 'There was a problem with our back-end services';
		}

		return callback(fail('validateCredentials', dbReason, errorType, explanation));
	});
};

// Creates a user
exports.createUser = function(req, callback) {
	// Declare error variables
	var dbReason, errorType, explanation;

	// Check if a user with that username already exists
	var userRef = db.ref('/users'), passwordRef = db.ref('/passwords');
	userRef.orderByKey().equalTo(req.body.username).once('value', function(snapshot) {
		var user = snapshot.val();
		if (user) {
			return callback(fail('createUser', 'username already exists', 'resource_error', 'That username is already being used'));
		}

		/**
		 * User does not already exist, so add them to the users table first.
		 * Start constructing JSON array with user information
		 */
		user = {};
		user['email'] = req.body.email;

		// Push user to database (username => userInfoJson)
		userRef.child(req.body.username).set(user)
			.then(function() {
				// Hash the password from the request
				bcrypt.genSalt(5, (err, salt) => {
					if (err) {
		        // Determine type of error
		        var errorCode = err.code == null ? -1 : err.code;

		        // TODO: discover more error codes to provide more specific feedback
		        switch (errorCode) {
		          default:
		            dbReason    = 'unknown';
		            errorType   = 'api_error';
		            explanation = 'There was a problem with our back-end services';
		        }

		        return callback(fail('createUser', dbReason, errorType, explanation));
		      }

					bcrypt.hash(req.body.password, salt, null, (err, hash) => {
						if (err) {
							// Determine type of error
							var errorCode = -1; // FIXME: Parse err object for more specific information
							switch (errorCode) {
								default:
									dbReason    = err;
									errorType   = 'api_error';
									explanation = 'There was a problem with our back-end services';
							}

							return callback(fail('createUser', dbReason, errorType, explanation));
						}

						// After adding user, add the password record in the password table
						passwordRef.child(req.body.username).set(hash)
							.then(function() {
								// Add username to user info JSON and pass it to the callback for client
								user['username'] = req.body.username;
								return callback(user);
							})
							.catch(function(err) {
								// Adding password record failed, so remove user from user table to prevent inconsistency
								var userDeleted = false;

								// Try to remove the password record at most 15 times
								for (var i = 0; i < 15 && !userDeleted; i++) {
									db.ref('/users/' + req.body.username).remove()
										.then(function() {
											userDeleted = true;
										})
										.catch(function(removeError) {
											console.log('Attempt %d failed to remove password record for %s', i, req.body.username);
										});
								}

								// Log serious error if User & Password tables are inconsistent
								if (!userDeleted) {
									console.log('EXTREME ERROR. Failed to delete password record for %s 15 times. Manually deleted the record', req.body.username);
								}

								// Determine type of error
								var errorCode = -1; // FIXME: Parse err object for more specific information
								switch (errorCode) {
									default:
										dbReason    = err;
										errorType   = 'api_error';
										explanation = 'There was a problem with our back-end services';
								}

								return callback(fail('createUser', dbReason, errorType, explanation));
							});
					});
				});
			})
			.catch(function(err) {
				// Determine type of error
				var errorCode = -1; // FIXME: Parse err object for more specific information
				switch (errorCode) {
					default:
						dbReason    = err;
						errorType   = 'api_error';
						explanation = 'There was a problem with our back-end services';
				}

				return callback(fail('createUser', dbReason, errorType, explanation));
			});
	}, err => {
		// Determine type of error
		var errorCode = -1; // FIXME: Parse err object for more specific information
		switch (errorCode) {
			default:
				dbReason    = err;
				errorType   = 'api_error';
				explanation = 'There was a problem with our back-end services';
		}

		return callback(fail('createUser', dbReason, errorType, explanation));
	});
};

// Retrieves a user
exports.getUser = function(username, callback) {
	// Declare error variables
	var dbReason, errorType, explanation;

	// Retrieve user from the database
	var ref = db.ref('/users/' + username);
	ref.once('value', snapshot => {
		if (snapshot.val() == null) {
			dbReason    = 'user does not exist';
			errorType   = 'resource_dne_error';
			explanation = 'That user does not exist';
			return callback(fail('getUser', dbReason, errorType, explanation));
		}

		// Return the user record with the callback
		callback(snapshot.val());
	}, err => {
		// Determine type of error
		var errorCode = -1; // FIXME: Parse err object for more specific information
		switch (errorCode) {
			default:
				dbReason    = err;
				errorType   = 'api_error';
				explanation = 'There was a problem with our back-end services';
		}

		return callback(fail('getUser', dbReason, errorType, explanation));
	});
};

// Retrieve all dropps
exports.getAllDropps = function(callback) {
	// Declare error variables
	var dbReason, errorType, explanation;

	var ref = db.ref('/dropps');
	ref.once('value', snapshot => {
		callback(snapshot.val());
	}, err => {
		// Determine type of error
		var errorCode = -1; // FIXME: Parse err object for more specific information
		switch (errorCode) {
			default:
				dbReason    = err;
				errorType   = 'api_error';
				explanation = 'There was a problem with our back-end services';
		}

		return callback(fail('getAllDropps', dbReason, errorType, explanation));
	});
};

// Retrieve all dropps posted by a specific user
exports.getDroppsByUser = function(username, callback) {
	// Declare error variables
	var dbReason, errorType, explanation;

	var dropps = {};
	var ref = db.ref('/dropps');

	// Load dropps reference to have dropps in the closure
	ref.on('value', snapshot => {
		// Push dropps onto JSON that belong to username
		ref.orderByChild('user_id').equalTo(username).on('child_added', snap => {
			dropps[snap.key] = snap.val();
		}, err => {
			// Determine type of error
			var errorCode = -1; // FIXME: Parse err object for more specific information
			switch (errorCode) {
				default:
					dbReason    = err;
					errorType   = 'api_error';
					explanation = 'There was a problem with our back-end services';
			}

			return callback(fail('getDroppsByUser', dbReason, errorType, explanation));
		});

		// Return dropps posted by specific user with callback
		return callback(dropps);
	}, err => {
		// Determine type of error
		var errorCode = -1; // FIXME: Parse err object for more specific information
		switch (errorCode) {
			default:
				dbReason    = err;
				errorType   = 'api_error';
				explanation = 'There was a problem with our back-end services';
		}

		return callback(fail('getDroppsByUser', dbReason, errorType, explanation));
	});
};

// Retrieve a specific dropp
exports.getDropp = function(droppId, callback) {
	// Declare error variables
	var dbReason, errorType, explanation;

	// Query database for specific dropp
	var ref = db.ref('/dropps/' + droppId);
	ref.once('value', snapshot => {
		if (snapshot.val() == null) {
			dbReason    = droppId + ' does not exist';
			errorType   = 'resource_dne_error';
			explanation = 'That dropp does not exist';
			return callback(fail('getDropp', dbReason, errorType, explanation));
		}

		return callback(snapshot.val());
	}, err => {
		// Determine type of error
		var errorCode = -1; // FIXME: Parse err object for more specific information
		switch (errorCode) {
			default:
				dbReason    = err;
				errorType   = 'api_error';
				explanation = 'There was a problem with our back-end services';
		}

		return callback(fail('getDropp', dbReason, errorType, explanation));
	});
};

// Post a dropp
exports.createDropp = function(req, callback) {
	// Build dropp JSON for database
	var dropp = {
		"location" 	: req.body.location,
		"timestamp"	: parseInt(req.body.timestamp),
		"user_id" 	: req.body.username,
		"content" 	: {
					"text" 	: req.body.text 	== null ? '' : req.body.text,
					"media" : req.body.media 	== null ? '' : req.body.media // FIXME: actually upload image
		}
	};

	// Push JSON to database and save the auto-generated push key
	var ref = db.ref('/dropps');
	var droppRef = ref.push(dropp, function(err) {
		if (err) {
			// FIXME: Find out error types
			var dbReason    = err;
			var errorType   = 'api_error';
			var explanation = 'There was a problem with our back-end services';
			return callback(fail('createDropp', dbReason, errorType, explanation));
		}
	});

	return callback({ droppId: droppRef.key });
};

/**
 * Creates a detailed JSON message when a failure occurs and logs the error
 * @param {string} source - the name of the function where the error occurred
 * @param {string} reason - the detailed reason the function received an error (kept private on the server)
 * @param {string} errorType - the standardized error type
 * @param {string} details - a more clear explanation of what went wrong (for the client)
 * @returns {Object}
 */
function fail(source, reason, errorType, details) {
  console.log('%s function failed because: %s', source, reason);
  var responseJSON = {
    error: {
      type: errorType,
      message: details,
    }
  };

  return responseJSON;
}

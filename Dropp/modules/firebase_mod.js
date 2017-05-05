/**
 * firebase_mod - Database @module
 */

const admin 					= require('firebase-admin');
const error          	= require('./error_mod.js');
const bcrypt					= require('bcrypt-nodejs');
const errorMessages   = require('./errorMessage_mod.js');
const serviceAccount	= require('../serviceAccountKey.json');

// Authenticate firebase with server admin credentials
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: 'https://dropp-3a65d.firebaseio.com'
});

// Obtain the database reference
const db = admin.database();

module.exports = {
	/**
	 * validateCredentials - Validates username and password credentials
	 * @param {string} username a username
	 * @param {string} password a password
	 * @param {callback} callback the callback that handles credentials validity
	 */
	validateCredentials: function(username, password, callback) {
    var responseJson, serverLog;

		// Obtain the db reference for the password of the username argument
		const passwordRef = db.ref('/passwords/' + username);
		if (passwordRef == null) {
			serverLog = 'Passwords table does not exist';
			responseJson = logError('validateCredentials', error.API_ERROR, null, serverLog);
			return callback(responseJson);
		}

		passwordRef.once('value', passwordRefSnapshot => {
			// If the snapshot value is null, no user exists at /passwords/<username>
			if (passwordRefSnapshot.val() == null) {
        serverLog = username + ' does not exist in passwords table';
        responseJson = logError('validateCredentials', error.LOGIN_ERROR, null, serverLog);
				return callback(responseJson);
			}

			/**
			 * Username and password exist in the database, so
			 * compare the password argument to the database record
			 */
			bcrypt.compare(password, passwordRefSnapshot.val(), (bcryptCompareError, passwordsMatch) => {
				if (bcryptCompareError != null) {
          // Error is not null so the bcrypt compare function failed
          switch (bcryptCompareError) {
            case 'Not a valid BCrypt hash.':
              serverLog = 'Password for ' + username + ' is not correctly hashed in the database';
              break;
            default:
              serverLog = bcryptCompareError;
          }

          responseJson = logError('validateCredentials', error.API_ERROR, null, serverLog);
	      } else if (!passwordsMatch) {
          // The comparison result is false so the passwords do not match
          serverLog = password + ' does not match ' + username + '\'s password';
          responseJson = logError('validateCredentials', error.LOGIN_ERROR, null, serverLog);
	      } else {
          // The comparison result is true so the passwords match
          responseJson = {
            success: {
  	          message: 'Valid login credentials',
  	        }
          };
        }

	      return callback(responseJson);
			});
		}, passwordRefError => {
      // An error occured with the database reference
      responseJson = logError('validateCredentials', error.API_ERROR, null, passwordRefError);
      return callback(responseJson);
		});
	},

	/**
	 * Creates a user record in the database
	 * @param {Object} req the HTTP request
	 * @param {callback} callback the callback that handles the database response
	 */
	createUser: function(req, callback) {
		var responseJson;

		// Obtain the db reference for the users records
		const usersRef = db.ref('/users');
		if (usersRef == null) {
			serverLog = 'Users table does not exist';
			responseJson = logError('createUser', error.API_ERROR, null, serverLog);
			return callback(responseJson);
		}

		// First see if a user with the requested username already exists
		usersRef.orderByKey().equalTo(req.body.username).once('value', userSnapshot => {
			// If userSnapshot value is not null, a user with that username already exists
			if (userSnapshot.val() != null) {
				const message = 'That username is already in use';
				const serverLog = 'new user was not created because the requested username already exists';
				responseJson = logError('createUser', error.RESOURCE_ERROR, message, serverLog);
				return callback(responseJson);
			}

			/**
			 * User does not already exist, so add them to the users
			 * table first. Construct JSON with user information
			 */
			var newUserInfo = {
				email: req.body.email
			};

			/**
			 * Set user record in the users table. The key is req.body.username
			 * and the value is the user JSON constructed earlier
			 */
			usersRef.child(req.body.username).set(newUserInfo)
				.then(function() {
					/**
					 * User record was added to the database, so generate salt to hash
					 * the password given in the request body. Use 5 rounds of salting
					 */
					bcrypt.genSalt(5, (bcryptGenSaltError, salt) => {
						if (bcryptGenSaltError != null) {
							responseJson = logError('createUser', error.API_ERROR, null, bcryptGenSaltError);
			        return callback(responseJson);
			      }

						// There was no genSalt() error. Hash the password with the salt
						bcrypt.hash(req.body.password, salt, null, (bcryptHashError, hashedPassword) => {
							if (bcryptHashError != null) {
								responseJson = logError('createUser', error.API_ERROR, null, bcryptHashError);
				        return callback(responseJson);
							}

							/**
							 * The password has been hashed with salt. Add it to the passwords
							 * records. First obtain the db reference for the passwords records
							 */
							const passwordsRef = db.ref('/passwords');
							if (passwordsRef == null) {
								serverLog = 'Passwords table does not exist';
								responseJson = logError('createUser', error.API_ERROR, null, serverLog);
								return callback(responseJson);
							}

							/**
							 * Set password record in the passwords table. The key is
							 * req.body.username and the value is the hashed password
							 */
							passwordsRef.child(req.body.username).set(hashedPassword)
								.then(function() {
									/**
									 * Password was successfully added to the passwords table.
									 * Add username to JSON for the client. Send the JSON
									 * containing all the user information with the callback
									 */
									newUserInfo['username'] = req.body.username;
									return callback(newUserInfo);
								})
								.catch(function(setPasswordError) {
									/**
									 * Adding password record failed so remove user
									 * from user table to prevent inconsistency
									 */
									var userDeleted = false;

									// Removing the user record might not succeed so try multiple times
									var attemptLimit = 15;
									const userRef = db.ref('/users/' + req.body.username);
									if (userRef == null) {
										serverLog = 'User record does not exist (' + req.body.username + ')';
										responseJson = logError('createUser', error.API_ERROR, null, serverLog);
										return callback(responseJson);
									}

									for (var attempts = 0; attempts < attemptLimit && !userDeleted; attempts++) {
										userRef.remove()
											.then(function() {
												// Successfully deleted the user record
												userDeleted = true;
											})
											.catch(function(removeUserError) {
												// Deleting the user failed. Log progress and try again
												console.log('Attempt %d failed to remove password record for %s', attempts + 1, req.body.username);
											});
									}

									/**
									 * If the password record does not exist in the passwords table, but
									 * a user record for that password DOES exist in the user table, the
									 * database is inconsistent because a user exists without a password.
									 * All attempts to delete the user failed, so log this error with high
									 * alert. FIXME: Send some sort of notification to make error more visible
									 */
									if (!userDeleted) {
										console.log('EXTREME ERROR. Failed to delete password record for %s %d times. Manually deleted the record!', req.body.username, attemptLimit);
									}

									responseJson = logError('createUser', error.API_ERROR, null, setPasswordError);
									return callback(responseJson);
								});
						});
					});
				})
				.catch(function(setUserError) {
					responseJson = logError('createUser', error.API_ERROR, null, setUserError);
					return callback(responseJson);
				});
		}, usersRefError => {
			responseJson = logError('createUser', error.API_ERROR, null, usersRefError);
			return callback(responseJson);
		});
	},

	/**
	 * Retrieves a user from the database
	 * @param {string} username a username to search for in the database
	 * @param {callback} callback the callback that handles the database response
	 */
	getUser: function(username, callback) {
    var responseJson;

		// Obtain the db reference for the user record in the users table
		const userRef = db.ref('/users/' + username); //TODO: AY BITCH
		userRef.once('value', userSnapshot => {
			// If the snapshot value is null, the user for username does not exist
			if (userSnapshot.val() == null) {
        const serverLog = 'user with username = ' + username + ' does not exist';
        responseJson = logError('getUser', error.RESOURCE_DNE_ERROR, null, serverLog);
			} else {
        responseJson = userSnapshot.val();
      }

			return callback(responseJson);
		}, userRefError => {
      // An error occured with the database reference
      responseJson = logError('getUser', error.API_ERROR, null, userRefError);
      return callback(responseJson);
		});
	},

	/**
	 * Retrieve all dropps from the database
	 * @param {callback} callback the callback that handles the database response
	 */
	getAllDropps: function(callback) {
		// Obtain the db reference for the dropps records
		const droppsRef = db.ref('/dropps');
		if (droppsRef == null) {
			serverLog = 'Dropps table does not exist';
			responseJson = logError('getAllDropps', error.API_ERROR, null, serverLog);
			return callback(responseJson);
		}

		droppsRef.once('value', droppsSnapshot => {
			return callback(droppsSnapshot.val());
		}, droppsRefError => {
			var errorJson = logError('getAllDropps', error.API_ERROR, null, droppsRefError);
			return callback(errorJson);
		});
	},

	/**
	 * Retrieve all dropps posted by a specific user
	 * @param {string} username the username to select dropps by
	 * @param {callback} callback the callback to handle the database response
	 */
	getDroppsByUser: function(username, callback) {
		var responseJson = {};

		/**
		 * First check if a user with username argument exists. Obtain
		 * the db reference for the user record in the users table
		 */
		const userRef = db.ref('/users/' + username);
		userRef.once('value', userSnapshot => {
			/**
			 * If the snapshot value is null the requested user
			 * does not exist. Don't query the db for any dropps
			 */
			if (userSnapshot.val() == null) {
        const serverLog = 'user with username = ' + username + ' does not exist';
        responseJson = logError('getDroppsByUser', error.RESOURCE_DNE_ERROR, 'That user does not exist', serverLog);
				return callback(responseJson);
			}

			/**
			 * The user exists so query the db for their dropps. Obtain
			 * db reference to retain all dropp values in the closure
			 */
			const droppsRef = db.ref('/dropps');
			if (droppsRef == null) {
				serverLog = 'Dropps table does not exist';
				responseJson = logError('getDroppsByUser', error.API_ERROR, null, serverLog);
				return callback(responseJson);
			}

			droppsRef.on('value', droppsSnapshot => {
				// Get all dropps that have username = <username> argument
				droppsRef.orderByChild('username').equalTo(username).on('child_added', droppSnapshot => {
					// Add each dropp posted by user to responseJson
					responseJson[droppSnapshot.key] = droppSnapshot.val();
				}, droppSnapshotError => {
					responseJson = logError('getDroppsByUser', error.API_ERROR, null, droppSnapshotError);
					return callback(responseJson);
				});

				// Return all dropps posted by specific user with the callback
				return callback(responseJson);
			}, droppsRefError => {
				responseJson = logError('getDroppsByUser', error.API_ERROR, null, droppsRefError);
				return callback(responseJson);
			});
		}, userRefError => {
      // An error occured with the database reference
      responseJson = logError('getDroppsByUser', error.API_ERROR, null, dbRefError);
      return callback(responseJson);
		});
	},

	/**
	 * Retrieve a specific dropp from the database
	 * @param {string} droppId the id of the dropp
	 * @param {callback} callback the callback to handle the database response
	 */
	getDropp: function(droppId, callback) {
    var responseJson;

		// Obtain the db reference for the specific dropp record
		const droppRef = db.ref('/dropps/' + droppId);
		droppRef.once('value', droppSnapshot => {
			// If the snapshot value is null, there is no dropp with that droppId
			if (droppSnapshot.val() == null) {
				const serverLog = 'Db was queried for dropp ' + droppId + ' but it does not exist';
        responseJson = logError('getDropp', error.RESOURCE_DNE_ERROR, null, serverLog);
			} else {
        responseJson = droppSnapshot.val();
      }

      return callback(responseJson);
		}, droppRefError => {
      responseJson = logError('getDropp', error.API_ERROR, null, droppRefError);
      return callback(responseJson);
		});
	},

	/**
	 * Post a dropp to the database
	 * @param {string} username the username of the author of the dropp
	 * @param {Object} req the HTTP request
	 * @param {callback} callback the callback to handle the database response
	 */
	createDropp: function(username, req, callback) {
		// Build dropp JSON for database. TODO: move this to the service layer
		const dropp = {
			"location" 	: req.body.location,
			"timestamp"	: parseInt(req.body.timestamp),
			"username" 	: username,
			"text" 			: req.body.text == null ? '' : req.body.text,
			"media" 		: req.body.media
		};

		var responseJson;

		// Obtain the db reference for the dropps table
		const droppsRef = db.ref('/dropps');

		// Push dropp JSON to the database and save the auto-generated push key
		const droppRef = droppsRef.push(dropp, function(droppRefError) {
			if (droppRefError != null) {
				responseJson = logError('createDropp', error.API_ERROR, null, droppRefError);
				return callback(responseJson);
			}
		});

		// Return the newly created dropp id with the callback
		responseJson = { droppId: droppRef.key };
		return callback(responseJson);
	},

	/**
	 * Remove a dropp from the database
	 * @param {string} droppId the id of the dropp to remove
	 * @param {callback} callback the callback to handle the database response
	 */
	deleteDropp: function(droppId, callback) {
		var responseJson, errorMessage;
		const droppRef = db.ref('/dropps/' + droppId);

		// Check if a dropp with that id exists
		droppRef.once('value', droppSnapshot => {
			// If the snapshot value is null, there is no dropp with that droppId
			if (droppSnapshot.val() == null) {
				const serverLog = 'Db was queried for dropp ' + droppId + ' but it does not exist';
        responseJson = logError('deleteDropp', error.RESOURCE_DNE_ERROR, null, serverLog);
				return callback(responseJson);
			} else {
				// The dropp exists, so remove it
				droppRef.remove()
				  .then(function() {
						// Successfully deleted dropp, so send success JSON
						responseJson = {
							success: {
								message: 'Successfully deleted dropp ' + droppId
							}
						};

				    return callback(responseJson);
				  })
				  .catch(function(removeDroppError) {
						// An error occurred with remove() call, so log that message
						errorMessage = 'Failed to delete ' + droppId;
						responseJson = logError('deleteDropp', error.API_ERROR, errorMessage, removeDroppError);
				    return callback(responseJson);
				  });
      }

		}, droppRefError => {
			errorMessage = 'Failed to delete ' + droppId;
      responseJson = logError('deleteDropp', error.API_ERROR, errorMessage, droppRefError);
      return callback(responseJson);
		});
	}
};

/**
 * logError - Logs a verbose JSON to the server and
 * creates a slightly less verbose JSON for the client
 * @param {string} source the function where the error
 * occured (should be the inner-most named function)
 * @param {string} errorType formal error type
 * @param {string} errorMessage detailed message explaining the error for the
 * client. If null, a default message will be added corresponding to errorType
 * @param {string} serverLog detailed message
 * explaining the failure for server logs
 * @returns {Object} error JSON to send to client
 */
function logError(source, errorType, errorMessage, serverLog) {
  console.log(JSON.stringify({
    error: {
      timestamp: (new Date().toISOString()),
      type: errorType,
      source: source,
      details: serverLog
    }
  }));

  return {
    error: {
      type: errorType,
      message: (errorMessage != null ? errorMessage : errorMessages(errorType))
    }
  };
}

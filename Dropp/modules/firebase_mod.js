/**
 * firebase_mod - Database @module
 */

const LOG 	= require('./log_mod');
const ADMIN = require('firebase-ADMIN');

// Testing Environment will get the key from environment variable
var serviceAccount = process.env.TEST;
if (serviceAccount) {
	serviceAccount = JSON.parse(serviceAccount);
} else {
	// If enviroment variable doesn't exists, get the key from the file
	serviceAccount = require('../serviceAccountKey.json');
}

// Verify firebase admin credentials
ADMIN.initializeApp({
	credential: ADMIN.credential.cert(serviceAccount),
	databaseURL: 'https://dropp-3a65d.firebaseio.com'
});

// Initialze database object
const DB = ADMIN.database();

/**
 * GET - Retrieves data from the database
 * @param {string} _url the path to the data in firebase
 * @param {callback} callback the callback to handle success result
 * @param {callback} errorCallback the callback to handle error result
 */
var GET = function(_url, callback, errorCallback) {
	log('Firebase GET: ' + _url);

	if (validateUrl(_url)) {
		var ref = DB.ref(_url);

		ref.once('value').then(snapshot => {
			// Reference call was successful
			callback(snapshot.val());
		}, err => {
			// Reference call failed
			log('Problem with firebase module\'s GET');
			log(err);
			errorCallback(err);
		});
	} else {
		errorCallback(-1);
	}
};

/**
 * POST - Changes data in the firebase by adding, updating, or removing data
 * @param {string} _url the path to the data in firebase
 * @param {Object} _post the data to add or update
 * @param {string} _operation the add, update, or delete operation
 * @param {callback} callback the callback to handle success result
 * @param {callback} errorCallback the callback to handle error result
 */
var POST = function(_url, _post, _operation, callback, errorCallback) {
	log('Firebase POST: ' + _url);

	if (validateUrl(_url)) {
		var ref = DB.ref(_url);

		switch (_operation) {
			case 'push':
				ref.push(_post).then(key => {
					callback(key);
				}, err => {
					log('Problem pushing data to firebase');
					log(err);
					errorCallback(err);
				});

				break;
			case 'set':
				ref.set(_post).then(() => {
					callback();
				}, err => {
					log('Problem setting data in firebase');
					log(err);
					errorCallback(err);
				});

				break;
			case 'remove':
				ref.remove().then(() => {
					callback();
				}, err => {
					errorCallback(err);
				});

				break;
			default:
				log('Unknown firebase POST type: ' + _operation)
		}
	} else {
		errorCallback(-1);
	}
};

module.exports = {
	GET		: GET,
	POST	: POST
};

/**
 * log - Logs a message to the server console
 * @param {string} _message the log message
 * @param {Object} _request the HTTP request
 */
function log(_message) {
	LOG.log('Firebase Module', _message);
}

/**
 * validateUrl - Validates a firebase reference URL
 * @param {string} url the firebase URL
 * @returns {Boolean} validity of url
 */
function validateUrl(url) {
	/**
	 * Evaluates to true if url is not null and doesn't
	 * contain any of the following characters: . # $ [ ]
	 */
	return url != null && (/^[^\.#\$\[\]]*$/).test(url);
}

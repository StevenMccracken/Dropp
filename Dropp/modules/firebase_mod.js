/**
 * firebase_mod - @module for database interaction
 */

const LOG = require('./log_mod');
const ERROR = require('./error_mod');
const ADMIN = require('firebase-admin');

// Testing Environment will get the key from environment variable
let serviceAccount = process.env.TEST;
if (serviceAccount) serviceAccount = JSON.parse(serviceAccount);
else serviceAccount = require('../serviceAccountKey.json');

// Verify firebase admin credentials
ADMIN.initializeApp({
  credential: ADMIN.credential.cert(serviceAccount),
  databaseURL: 'https://dropp-3a65d.firebaseio.com'
});

// Initialze database object
const DB = ADMIN.database();

/**
 * FILTER - Filters data from firebase
 * @param {String} _url the path to the data in firebase
 * @param {String} _attribute the key in the data structure
 * @param {String} _value the value associated with keys
 * @param {callback} _callback the callback to handle successful filtering
 * @param {callback} _errorCallback the callback to handle any errors
 */
var FILTER = function(_url, _attribute, _value, _callback, _errorCallback) {
  const SOURCE = 'FILTER';
  log(`${SOURCE} (${_url})`);

  GET(
    _url,
    (data) => {
      // Loop over data and remove keys that don't have attributes = value
      for (let key in data) {
        if (data[key][_attribute] !== _value) delete data[key];
      }

      _callback(data);
    },
    (getAllDataError) => {
      log('Problem filtering data from firebase');
      _errorCallback(getAllDataError);
    }
  );
};

/**
 * GET - Retrieves data from firebase
 * @param {String} _url the path to the data in firebase
 * @param {callback} _callback the callback to handle successful retrieval
 * @param {callback} _errorCallback the callback to handle any errors
 */
var GET = function(_url, _callback, _errorCallback) {
  const SOURCE = 'GET';
  log(`${SOURCE} (${_url})`);

  if (isValidUrl(_url)) {
    let ref = DB.ref(_url);
    ref.once('value').then(
      snapshot => _callback(snapshot.val()),
      (refError) => {
        log('Problem getting data from firebase');
        _errorCallback(refError);
      }
    );
  } else _errorCallback(ERROR.INVALID_URL_CHAR);
};

/**
 * ADD - Adds new data in firebase
 * @param {String} _url the path where the new data will exist in firebase
 * @param {*} _data the data to save in firebase
 * @param {callback} _callback the callback to handle successful addition
 * @param {callback} _errorCallback the callback to handle any errors
 */
var ADD = function(_url, _data, _callback, _errorCallback) {
  const SOURCE = 'ADD';
  log(`${SOURCE} (${_url})`);

  if (isValidUrl(_url)) {
    let ref = DB.ref(_url);
    ref.push(_data).then(
      key => _callback(key),
      (pushError) => {
        log('Problem pushing data to firebase');
        _errorCallback(pushError);
      }
    );
  } else _errorCallback(ERROR.INVALID_URL_CHAR);
};

/**
 * UPDATE - Updates existing data in firebase
 * @param {String} _url the path to the data in firebase
 * @param {*} _newData the new value for the specified database url path
 * @param {callback} _callback the callback to handle successful updates
 * @param {callback} _errorCallback the callback to handle any errors
 */
var UPDATE = function(_url, _newData, _callback, _errorCallback) {
  const SOURCE = 'UPDATE';
  log(`${SOURCE} (${_url})`);

  if (isValidUrl(_url)) {
    let ref = DB.ref(_url);
    ref.set(_newData).then(
      () => _callback(),
      (updateError) => {
        log('Problem setting data in firebase');
        _errorCallback(updateError);
      }
    );
  } else _errorCallback(ERROR.INVALID_URL_CHAR);
};

/**
 * DELETE - Removes data from firebase
 * @param {String} _url the path to the data in firebase
 * @param {callback} _callback the callback to handle successful deletion
 * @param {callback} _errorCallback the callback to handle any errors
 */
var DELETE = function(_url, _callback, _errorCallback) {
  const SOURCE = 'DELETE';
  log(`${SOURCE} (${_url})`);

  if (isValidUrl(_url)) {
    let ref = DB.ref(_url);
    ref.remove().then(
      () => _callback(),
      (removeError) => {
        log('Problem removing data from firebase');
        _errorCallback(removeError);
      }
    );
  } else _errorCallback(ERROR.INVALID_URL_CHAR);
};

module.exports = {
  GET: GET,
  ADD: ADD,
  UPDATE: UPDATE,
  DELETE: DELETE,
  FILTER: FILTER,
};

/**
 * isValidUrl - Validates a firebase reference URL
 * @param {String} _url the firebase URL
 * @returns {Boolean} validity of url
 */
function isValidUrl(_url) {
  /**
   * Evaluates to true if url is not null, not undefined, and
   * doesn't contain any of the following characters: . # $ [ ]
   */
  return _url !== null && _url !== undefined && !(/[\.#\$\[\]]/).test(_url);
}

/**
 * log - Logs a message to the server console
 * @param {String} _message the log message
 */
function log(_message) {
  LOG.log('Firebase Module', _message);
}

/**
 * @module for firebase interaction
 */

const Log = require('../logging/logger');
// const Error = require('../errors/error');
const Firebase = require('firebase-admin');
const Validator = require('../utilities/validator');
const DroppError = require('../errors/DroppError');
const firebaseApiKey = require('../../config/secrets/firebaseApiKey.json');

// Firebase initialization

let didStart = false;
let db;
const configOptions = {
  databaseURL: 'https://dropp-3a65d.firebaseio.com',
  credential: Firebase.credential.cert(firebaseApiKey),
};

/**
 * Configures and initializes the firebase module
 * @throws {DroppError} if the firebase module has already been started
 */
const start = function start() {
  if (didStart) return;

  Firebase.initializeApp(configOptions);
  db = Firebase.database();
  didStart = true;
};

// Helper functions

const hasStarted = function hasStarted() {
  return didStart;
};

/**
 * Logs a message about firebase interaction
 * @param {String} _message the message to log
 * @param {String} _url the firebase path to interact with
 */
function log(_message, _url) {
  Log.log('Firebase', `${_message} -> ${_url}`);
}

/**
 * Creates and throws an error with the invalid URL in the details
 * @param {String} _url the firebase path to interact with
 * @throws {DroppError}
 */
function throwInvalidUrlError(_url) {
  throw new DroppError({ invalid_firebase_url: _url });
}

/**
 * Creates and throws an error with the has not started message in the details
 * @throws {DroppError}
 */
function throwHasNotStartedError() {
  throw new DroppError({ details: 'Firebase has not started yet' });
}

// Firebase functions

/**
 * Gets data from firebase
 * @param {String} _url the firebase path to get data from
 * @return {Object} the data at the given url
 * @throws {DroppError|Error}
 */
const get = async function get(_url) {
  const source = 'get()';
  log(source, _url);

  if (!didStart) throwHasNotStartedError();
  if (!Validator.isValidFirebaseId(_url)) throwInvalidUrlError();
  const ref = db.ref(_url);
  const snapshot = await ref.once('value');
  return snapshot.val();
};

/**
 * Adds data to firebase
 * @param {String} _url the firebase path to add data to
 * @param {Object} _data the data for the given url
 * @return {String} the fully-qualified URL where the data exists in Firebase
 * @throws {DroppError|Error}
 */
const add = async function add(_url, _data) {
  const source = 'add()';
  log(source, _url);

  if (!didStart) throwHasNotStartedError();
  if (!Validator.isValidFirebaseId(_url)) throwInvalidUrlError();
  const ref = db.ref(_url);
  const key = await ref.push(_data);
  return key.toString();
};

/**
 * Updates data in firebase
 * @param {String} _url the firebase path to update data for
 * @param {Object} _data the data to update with for the given url
 * @throws {DroppError|Error}
 */
const update = async function update(_url, _data) {
  const source = 'update()';
  log(source, _url);

  if (!didStart) throwHasNotStartedError();
  if (!Validator.isValidFirebaseId(_url)) throwInvalidUrlError();
  const ref = db.ref(_url);
  await ref.set(_data);
};

/**
 * Updates multiple URLs with different data in firebase
 * @param {Object} _urlDataMap a mapping of the firebase
 * paths to update data for, with their corresponding new data
 * @throws {DroppError|Error}
 */
const bulkUpdate = async function bulkUpdate(_urlDataMap = {}) {
  const source = 'bulkUpdate()';
  log(source, Object.keys(_urlDataMap));

  if (!didStart) throwHasNotStartedError();
  Object.keys(_urlDataMap).forEach((key) => {
    if (!Validator.isValidFirebaseId(key)) throwInvalidUrlError();
  });

  const ref = db.ref();
  await ref.update(_urlDataMap);
};

/**
 * Removes data from firebase
 * @param {String} _url the firebase path to remove data from
 * @throws {DroppError|Error}
 */
const remove = async function remove(_url) {
  const source = 'delete()';
  log(source, _url);

  if (!didStart) throwHasNotStartedError();
  if (!Validator.isValidFirebaseId(_url)) throwInvalidUrlError();
  const ref = db.ref(_url);
  await ref.remove();
};

/**
 * Removes multiple data values in firebase
 * @param {Array} [_urls=[]] the paths to delete data from
 * @throws {DroppError|Error}
 */
const bulkRemove = async function bulkRemove(_urls = []) {
  const source = 'bulkRemove()';
  log(source, _urls);

  if (!didStart) throwHasNotStartedError();

  const deleteUrlsMap = {};
  _urls.forEach((url) => {
    if (!Validator.isValidFirebaseId(url)) throwInvalidUrlError();
    else deleteUrlsMap[url] = null;
  });

  const ref = db.ref();
  await ref.update(deleteUrlsMap);
};

module.exports = {
  get,
  add,
  start,
  update,
  remove,
  hasStarted,
  bulkUpdate,
  bulkRemove,
};

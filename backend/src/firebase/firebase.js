/**
 * @module for firebase interaction
 */

const Log = require('../logging/logger');
const Firebase = require('firebase-admin');
const MockFirebase = require('./firebase.mock');
const Validator = require('../utilities/validator');
const Constants = require('../utilities/constants');
const DatabaseError = require('../errors/DatabaseError');
const firebaseApiKey = require('../../config/secrets/firebaseApiKey.json');

// Firebase initialization

let db;
let didStart = false;
const configOptions = {
  databaseURL: Constants.firebase.projectUrl,
  credential: Firebase.credential.cert(firebaseApiKey),
};

/**
 * Configures and initializes the firebase module. Returns
 * immediately if Firebase has already been started
 * @param {Boolean} [_shouldMock=false] whether or not to use the mock database
 */
const start = (_shouldMock = false) => {
  const source = 'start()';
  Log.log(Constants.firebase.moduleName, source, _shouldMock);

  if (didStart === true) return;
  if (_shouldMock === true) db = MockFirebase;
  else {
    Firebase.initializeApp(configOptions);
    db = Firebase.database();
  }

  didStart = true;
};

// Helper functions

/**
 * Determines whether Firebase has been started yet or not
 * @return {Boolean} whether or not Firebase has been started
 */
const hasStarted = () => didStart;

// Firebase functions

/**
 * Gets data from firebase
 * @param {String} _url the firebase path to get data from
 * @return {Object|String|Boolean|Number} the data at the given url
 * @throws {DatabaseError} if Firebase has not started or _url is invalid
 */
const get = async (_url) => {
  const source = 'get()';
  Log.log(Constants.firebase.moduleName, source, _url);

  if (!didStart) DatabaseError.throwInvalidStateError(source);
  if (!Validator.isValidFirebaseId(_url)) DatabaseError.throwUrlError(source, _url);
  const ref = db.ref(_url);
  const snapshot = await ref.once(Constants.firebase.value);
  return snapshot.val();
};

/**
 * Adds data to firebase
 * @param {String} _url the firebase path to add data to
 * @param {Object} _data the data for the given url
 * @return {String} the fully-qualified URL where the data exists in Firebase
 * @throws {DatabaseError} if Firebase has not started or _url is invalid
 */
const add = async (_url, _data) => {
  const source = 'add()';
  Log.log(Constants.firebase.moduleName, source, _url, _data);

  if (!didStart) DatabaseError.throwInvalidStateError(source);
  if (!Validator.isValidFirebaseId(_url)) DatabaseError.throwUrlError(source, _url);
  const ref = db.ref(_url);
  const key = await ref.push(_data);
  return key.toString();
};

/**
 * Updates data in firebase
 * @param {String} _url the firebase path to update data for
 * @param {Object} _data the data to update with for the given url
 * @throws {DatabaseError} if Firebase has not started or _url is invalid
 */
const update = async (_url, _data) => {
  const source = 'update()';
  Log.log(Constants.firebase.moduleName, source, _url);

  if (!didStart) DatabaseError.throwInvalidStateError(source);
  if (!Validator.isValidFirebaseId(_url)) DatabaseError.throwUrlError(source, _url);
  const ref = db.ref(_url);
  await ref.set(_data);
};

/**
 * Updates multiple URLs with different data in firebase
 * @param {Object} _urlDataMap a mapping of the firebase
 * paths to update data for, with their corresponding new data
 * @throws {DatabaseError} if Firebase has not started or _url is invalid
 */
const bulkUpdate = async (_urlDataMap = {}) => {
  const source = 'bulkUpdate()';
  Log.log(Constants.firebase.moduleName, source, _urlDataMap);

  if (!didStart) DatabaseError.throwInvalidStateError(source);
  Object.keys(_urlDataMap).forEach((key) => {
    if (!Validator.isValidFirebaseId(key)) DatabaseError.throwUrlError(source, key);
  });

  const ref = db.ref();
  await ref.update(_urlDataMap);
};

/**
 * Removes data from firebase
 * @param {String} _url the firebase path to remove data from
 * @throws {DatabaseError} if Firebase has not started or _url is invalid
 */
const remove = async (_url) => {
  const source = 'delete()';
  Log.log(Constants.firebase.moduleName, source, _url);

  if (!didStart) DatabaseError.throwInvalidStateError(source);
  if (!Validator.isValidFirebaseId(_url)) DatabaseError.throwUrlError(source, _url);
  const ref = db.ref(_url);
  await ref.remove();
};

/**
 * Removes multiple data values in firebase
 * @param {[String]} [_urls=[]] the paths to delete data from
 * @throws {DatabaseError} if Firebase has not started or _url is invalid
 */
const bulkRemove = async (_urls = []) => {
  const source = 'bulkRemove()';
  Log.log(Constants.firebase.moduleName, source, _urls);

  if (!didStart) DatabaseError.throwInvalidStateError(source);
  const deleteUrlsMap = {};
  _urls.forEach((url) => {
    if (!Validator.isValidFirebaseId(url)) DatabaseError.throwUrlError(source, url);
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

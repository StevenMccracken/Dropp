/**
 * @module for mocking firebase
 */

const Utils = require('../utilities/utils');

/**
 * In-memory database
 * @type {Object}
 */
const datastore = {
};

/**
 * Sets a given value to a given path within the database
 * @param {[String]} [_paths=[]] the path within the database
 * @param {String|Number|Boolean|Object} [_value=null] the value to set at the given path
 */
const set = function set(_paths = [], _value = null) {
  let storeReference = datastore;
  for (let i = 0; i < _paths.length - 1; i++) {
    const path = _paths[i];
    if (!storeReference[path]) storeReference[path] = {};
    storeReference = storeReference[path];
  }

  storeReference[_paths[_paths.length - 1]] = _value;
};

/**
 * Creates a sequential list of paths to traverse
 * the database from a given database URL
 * @param {String} [_url=''] the URL for a
 * specific piece of data in the database
 * @return {[String]} the URL broken up into it's individual paths
 */
const urlParts = function urlParts(_url = '') {
  const parts = _url.split('/');

  // Drop the first element empty space, if it exists
  if (parts.length > 0 && parts[0] === '') {
    parts.splice(0, 1);
  }

  return parts;
};

/**
 * Retrives the data at a given path
 * @param {[String]} [_paths=[]] the path
 * within the database to the expected data
 * @return {Promise<Object>} an object holding the
 * data. Get the data by calling val() on the object
 */
const get = function get(_paths = []) {
  const promise = new Promise((resolve) => {
    let subStore = datastore;
    _paths.forEach((path) => {
      if (subStore === null || subStore === undefined) return;
      if (typeof subStore !== 'object') subStore = null;
      else if (subStore[path] !== null && subStore[path] !== undefined) {
        subStore = subStore[path];
      } else subStore = {};
    });

    let value;
    if (typeof subStore === 'object' && Object.keys(subStore).length === 0) value = null;
    else value = subStore;

    const wrapper = {
      val: () => value,
    };

    resolve(wrapper);
  });

  return promise;
};

/**
 * Adds new data at a specified path, with an auto-generated key
 * @param {[String]} [_paths=[]] the path within the database to add the data
 * @param {String|Number|Boolean|Object} [_data] the data to add at the given path
 * @return {Promise<String>} the full path, including
 * the data's key at the given path, as a URL
 */
const push = function push(_paths = [], _data) {
  const promise = new Promise((resolve) => {
    const uuid = Utils.newUuid();
    const fullPaths = _paths.concat(uuid);
    set(fullPaths, _data);
    const fullPath = `/${_paths.join('/')}/${uuid}`;
    resolve(fullPath);
  });

  return promise;
};

/**
 * Sets data at a specified path
 * @param {[String]} [_paths=[]] the path within the database to set the data.
 * The path does not have to fully exist yet for this operation to succeed
 * @param {String|Number|Boolean|Object} [_data] the data
 * to set at the given path. Pass null to delete the data
 * @return {Promise}
 */
const setData = function setData(_paths = [], _data) {
  const promise = new Promise((resolve) => {
    set(_paths, _data);
    resolve();
  });

  return promise;
};

/**
 * Performs multiple set operations
 * @param {Object} [_updates={}] key/value map of database URL paths to actual
 * data. The set operations are performed in the order the keys exist in the map
 * @return {Promise}
 */
const update = function update(_updates = {}) {
  const promise = new Promise((resolve) => {
    Object.keys(_updates).forEach((key) => {
      const keyPaths = urlParts(key);
      set(keyPaths, _updates[key]);
    });

    resolve();
  });

  return promise;
};

/**
 * Removes data at a specified path
 * @param {[String]} [_paths=[]] the path within the database to set the data.
 * @return {Promise}
 */
const remove = function remove(_paths) {
  const promise = new Promise((resolve) => {
    set(_paths, null);
    resolve();
  });

  return promise;
};

/**
 * Provides a reference to the data at the specified database URL
 * @param {String} [_url=''] the URL for a
 * specific piece of data in the database
 * @return {Object} Reference with functions to perform operations on
 * the data: once(), push(data), set(data), update(updates), and remove()
 */
const ref = function ref(_url = '') {
  const paths = urlParts(_url);
  return {
    once: () => get(paths),
    push: _data => push(paths, _data),
    set: _data => setData(paths, _data),
    update: _updates => update(_updates),
    remove: () => remove(paths),
  };
};

module.exports = {
  urlParts,
  get,
  push,
  setData,
  update,
  remove,
  ref,
};

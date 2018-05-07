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
 * @param {[String]} [_paths] the path within the database
 * @param {String|Number|Boolean|Object} [_value] the value to set at the given path
 */
const set = function set(_paths, _value) {
  let storeReference = datastore;
  const paths = Array.isArray(_paths) ? _paths : [];
  for (let i = 0; i < paths.length - 1; i++) {
    const path = paths[i];
    if (!storeReference[path]) storeReference[path] = {};
    storeReference = storeReference[path];
  }

  if (Utils.hasValue(_value)) storeReference[paths[paths.length - 1]] = _value;
  else delete storeReference[paths[paths.length - 1]];
};

/**
 * Creates a sequential list of paths to traverse
 * the database from a given database URL
 * @param {String} [_url] the URL for a specific piece of data in the database
 * @return {[String]} the URL broken up into it's individual paths
 */
const urlParts = function urlParts(_url) {
  const url = typeof _url === 'string' ? _url : '';
  const parts = url.split('/');

  // Drop the first element empty space, if it exists
  if (parts.length > 0 && parts[0] === '') {
    parts.splice(0, 1);
  }

  return parts;
};

/**
 * Retrives the data at a given path
 * @param {[String]} [_paths] the path within the database to the expected data
 * @return {Promise<Object>} an object holding the
 * data. Get the data by calling val() on the object
 */
const get = function get(_paths) {
  const promise = new Promise((resolve) => {
    const wrapper = {};
    if (!Array.isArray(_paths)) {
      wrapper.val = () => null;
      resolve(wrapper);
      return;
    }

    let subStore = datastore;
    _paths.forEach((path) => {
      if (!Utils.hasValue(subStore)) return;
      if (typeof subStore !== 'object') subStore = null;
      else if (Utils.hasValue(subStore[path])) subStore = subStore[path];
      else subStore = {};
    });

    let value;
    if (Utils.hasValue(subStore) &&
        typeof subStore === 'object' &&
        Object.keys(subStore).length === 0) value = null;
    else value = subStore;

    wrapper.val = () => value;
    resolve(wrapper);
  });

  return promise;
};

/**
 * Adds new data at a specified path, with a unique key
 * @param {[String]} [_paths] the path within the database to add the data
 * @param {String|Number|Boolean|Object} [_data] the data to add at the given path
 * @return {Promise<String>} the full path, including
 * the data's key at the given path, as a URL
 */
const push = function push(_paths, _data) {
  if (!Array.isArray(_paths)) {
    return new Promise(resolve => resolve());
  }

  const promise = new Promise((resolve) => {
    const key = Utils.newUuid();
    const fullPaths = _paths.concat(key);
    set(fullPaths, _data);
    let fullPath;
    if (_paths.length > 0) fullPath = `${_paths.join('/')}/${key}`;
    else fullPath = `${key}`;
    resolve(fullPath);
  });

  return promise;
};

/**
 * Sets data at a specified path
 * @param {[String]} [_paths] the path within the database to set the data.
 * The path does not have to fully exist yet for this operation to succeed
 * @param {String|Number|Boolean|Object} [_data] the data
 * to set at the given path. Pass null to delete the data
 * @return {Promise}
 */
const setData = function setData(_paths, _data) {
  const promise = new Promise((resolve) => {
    if (Array.isArray(_paths)) set(_paths, _data);
    resolve();
  });

  return promise;
};

/**
 * Performs multiple set operations
 * @param {Object} [_updates] key/value map of database URL paths to actual
 * data. The set operations are performed in the order the keys exist in the map
 * @return {Promise}
 */
const update = function update(_updates) {
  const promise = new Promise((resolve) => {
    if (!Utils.hasValue(_updates)) {
      resolve();
      return;
    }

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

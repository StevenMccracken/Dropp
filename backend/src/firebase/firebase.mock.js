/**
 * @module for mocking firebase
 */

const Utils = require('../utilities/utils');

const data = {
};

const set = function set(_paths = [], _value = null) {
  let schema = data;
  for (let i = 0; i < _paths.length - 1; i++) {
    const path = _paths[i];
    if (!schema[path]) schema[path] = {};
    schema = schema[path];
  }

  schema[_paths[_paths.length - 1]] = _value;
};

const urlParts = function urlParts(_url = '') {
  const parts = _url.split('/');

  // Drop the first element empty space, if it exists
  if (parts.length > 0 && parts[0] === '') {
    parts.splice(0, 1);
  }

  return parts;
};

const ref = function ref(_url = '') {
  const paths = urlParts(_url);
  return {
    paths,
    once: () => {
      const promise = new Promise((resolve) => {
        let tempData = data;
        paths.forEach((path) => {
          if (tempData === null || tempData === undefined) return;
          if (typeof tempData !== 'object') tempData = null;
          else if (tempData[path] !== null && tempData[path] !== undefined) {
            tempData = tempData[path];
          } else tempData = {};
        });

        let value;
        if (typeof tempData === 'object' && Object.keys(tempData).length === 0) value = null;
        else value = tempData;

        const wrapper = {
          val: () => value,
        };

        resolve(wrapper);
      });

      return promise;
    },
    push: (_data) => {
      const promise = new Promise((resolve) => {
        const uuid = Utils.newUuid();
        const fullPaths = paths.concat(uuid);
        set(fullPaths, _data);
        const fullPath = `/${paths.join('/')}/${uuid}`;
        resolve(fullPath);
      });

      return promise;
    },
    set: (_data) => {
      const promise = new Promise((resolve) => {
        set(paths, _data);
        resolve();
      });

      return promise;
    },
    update: (_updates = {}) => {
      const promise = new Promise((resolve) => {
        Object.keys(_updates).forEach((key) => {
          const keyPaths = urlParts(key);
          set(keyPaths, _updates[key]);
        });

        resolve();
      });

      return promise;
    },
    remove: () => {
      const promise = new Promise((resolve) => {
        set(paths, null);
        resolve();
      });

      return promise;
    },
  };
};

module.exports = {
  ref,
};

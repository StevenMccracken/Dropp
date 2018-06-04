/**
 * @module for media interaction
 */

const mmmagic = require('mmmagic');

const mimeTypes = {
  png: 'image/png',
  jpeg: 'image/jpeg',
};

const base64DataTypes = {
  png: 'iVBORw0KGgoAAA',
  jpg: '/9j/4AAQSkZJRg',
};

/**
 * Determines the MIME type of a given file based on it's data
 * @param {String} _path the path to the given file
 * @return {String} the MIME type. Empty string if an error occurred
 */
const determineMimeType = async function determineMimeType(_path) {
  const promise = new Promise((resolve) => {
    const magic = new mmmagic.Magic(mmmagic.MAGIC_MIME_TYPE);
    magic.detectFile(_path, (error, result) => {
      const type = error ? '' : result;
      resolve(type);
    });
  });

  return promise;
};

/**
 * Encodes a given buffer of data into a base-64 string
 * @param {Buffer} _buffer the data to encode
 * @return {Object} object with MIME type and encoded data
 */
const encodeToBase64 = function encodeToBase64(_buffer) {
  const result = {
    mimeType: '',
    base64Data: '',
  };

  if (!(_buffer instanceof Buffer)) return result;
  const base64String = _buffer.toString('base64');

  let mimeType = 'unknown';
  if (base64String.length >= 13) {
    const encoding = base64String.substring(0, 14);
    if (encoding === base64DataTypes.png) mimeType = mimeTypes.png;
    else if (encoding === base64DataTypes.jpg) mimeType = mimeTypes.jpeg;
  }

  result.mimeType = mimeType;
  result.base64Data = base64String;
  return result;
};

module.exports = {
  mimeTypes,
  base64DataTypes,
  determineMimeType,
  encodeToBase64,
};

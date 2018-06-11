/**
 * @module for media interaction
 */

const mmmagic = require('mmmagic');
const Log = require('../logging/logger');
const Constants = require('../utilities/constants');

/**
 * Determines the MIME type of a given file based on it's data
 * @param {String} _path the path to the given file
 * @return {String} the MIME type. Empty string if an error occurred
 */
const determineMimeType = async (_path) => {
  const source = 'determineMimeType()';
  Log.log(Constants.media.moduleName, source, _path);

  const promise = new Promise((resolve) => {
    if (typeof _path !== 'string') {
      resolve('');
      return;
    }

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
const encodeToBase64 = (_buffer) => {
  const source = 'encodeToBase64()';
  Log.log(Constants.media.moduleName, source, _buffer);

  const result = {
    mimeType: '',
    base64Data: '',
  };

  if (!(_buffer instanceof Buffer)) return result;
  const base64String = _buffer.toString(Constants.media.encodings.base64);

  let mimeType = Constants.media.mimeTypes.unknown;
  if (base64String.length >= 13) {
    const encoding = base64String.substring(0, 14);
    if (encoding === Constants.media.base64DataTypes.png) mimeType = Constants.media.mimeTypes.png;
    else if (encoding === Constants.media.base64DataTypes.jpg) {
      mimeType = Constants.media.mimeTypes.jpeg;
    }
  }

  result.mimeType = mimeType;
  result.base64Data = base64String;
  return result;
};

module.exports = {
  determineMimeType,
  encodeToBase64,
};

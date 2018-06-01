/**
 * @module for media interaction
 */

const encodedPngType = 'iVBORw0KGgoAAA';
const encodedJpegType = '/9j/4AAQSkZJRg';

/**
 * Encodes a given buffer of data into a Base-64 string
 * @param {Buffer} _buffer the data to encode
 * @return {String} the encoded data as a string
 */
const bufferToBase64String = function bufferToBase64String(_buffer) {
  if (!(_buffer instanceof Buffer)) return '';
  const base64String = _buffer.toString('base64');

  let mimeType = 'unknown';
  let fileType = 'unknown';
  if (base64String.length >= 13) {
    const encodedFiletype = base64String.substring(0, 14);
    if (encodedFiletype === encodedPngType) {
      fileType = 'png';
      mimeType = 'image';
    } else if (encodedFiletype === encodedJpegType) {
      fileType = 'jpeg';
      mimeType = 'image';
    }
  }

  return `data:${mimeType}/${fileType};base64,${base64String}`;
};

module.exports = {
  encodedPngType,
  encodedJpegType,
  bufferToBase64String,
};

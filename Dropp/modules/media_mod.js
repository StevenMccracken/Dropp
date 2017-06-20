/**
 * media_mod - @module for media transfer to google cloud storage
 */

const LOG = require('./log_mod');
const Multer = require('multer');

// Verify credentials for google cloud storage
const GCS = require('@google-cloud/storage')({
  projectId: 'dropp-3a65d',
  keyFilename: './storageAccountKey.json'
});

// Initialize cloud storage bucket
const BUCKET = GCS.bucket('dropp-3a65d.appspot.com');

// Temporary file download configuration
const UPLOAD_CONFIG = Multer({
  dest: './temp/uploads/',
  limits: { fileSize: '10000kb' }
});

/**
 * deleteImage - Removes an image from cloud storage
 * @param {String} _filename the name of the file (usually a dropp id)
 * @param {callback} _callback the callback to handle finish event
 * @param {callback} _errorCallback the callback to handle error event
 */
var deleteImage = function(_filename, _callback, _errorCallback) {
  const SOURCE = 'deleteImage()';
  log(SOURCE);

  log(`${SOURCE}: Trying to delete image '${_filename}'`);
  let image = BUCKET.file(_filename);
  if (image !== null) {
    image.delete().then((response) => {
      log(`${SOURCE}: Successfully deleted image '${_filename}'`);
      _callback(true);
    })
    .catch((deleteImageError) => {
      log(`${SOURCE}: Failed deleting image '${_filename}' because: ${deleteImageError}`);
      _errorCallback(deleteImageError);
    });
  } else {
    log(`${SOURCE}: Image '${_filename}' does not exist`);
    _callback(false);
  }
};

module.exports = {
  bucket: BUCKET,
  upload: UPLOAD_CONFIG,
  deleteImage: deleteImage,
};

/**
 * log - Logs a message to the server console
 * @param {String} _message the log message
 * @param {Object} _request the HTTP request
 */
function log(_message) {
  LOG.log('Media Module', _message);
}

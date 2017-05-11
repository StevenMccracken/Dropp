/**
 * media_mod - Media transfer @module
 */

const multer = require('multer');

// Verify credentials for google cloud storage
const gcs = require('@google-cloud/storage')({
  projectId: 'dropp-3a65d',
  keyFilename: './storageAccountKey.json'
});

// Initialize cloud storage bucket
const bucket = gcs.bucket('dropp-3a65d.appspot.com');

// Temporary file download configuration
const upload_config = multer({
	dest   :	'./temp/uploads/',
	limits : { fileSize: '10000kb' }
});

/**
 * deleteImage - Removes an image from cloud storage
 * @param {string} _filename the name of the file (usually a dropp id)
 * @param {callback} _callback the callback to handle finish event
 * @param {callback} _errorCallback the callback to handle error event
 */
var deleteImage = function(_filename, _callback, _errorCallback) {
  console.log('Trying to delete image \'%s\'', _filename);

  var image = bucket.file(_filename);
  if (image != null) {
    image.delete().then(function(response) {
      console.log('Successfully deleted image \'%s\'', _filename);
      _callback(true);
    })
    .catch(function(err) {
      console.log('Failed deleting image \'%s\': %s', _filename, err);
      _errorCallback(err);
    });
  } else {
    console.log('Image \'%s\' does not exist', _filename);
    _callback(false);
  }
}

module.exports = {
  bucket      : bucket,
	upload      : upload_config,
  deleteImage : deleteImage
};

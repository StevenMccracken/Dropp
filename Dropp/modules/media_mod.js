
const multer = require('multer');

// Global authentication for google cloud storage
const gcs = require('@google-cloud/storage')({
  projectId: 'dropp-3a65d',
  keyFilename: './storageAccountKey.json'
});

// Initialize cloud storage bucket
const bucket = gcs.bucket('dropp-3a65d.appspot.com');

const upload_config = multer({
	dest		:	'./temp/uploads/',
	limits			: { fileSize: '5mb' }
});


module.exports = {
	upload : upload_config,
	bucket : bucket
}
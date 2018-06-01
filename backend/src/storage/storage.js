/**
 * @module for cloud storage interaction
 */

const FileSystem = require('fs');
const Media = require('../media/media');
const Log = require('../logging/logger');
const Utils = require('../utilities/utils');
const CloudStorage = require('@google-cloud/storage');
const StorageError = require('../errors/StorageError');

const moduleName = 'Cloud Storage Accessor';

// Cloud storage project info
const projectId = 'dropp-3a65d';
const projectUrl = `${projectId}.appspot.com`;
const storageAccountKeyPath = './config/secrets/storageAccountKey.json';
let didInitializeBucket = false;

/**
 * Initializes the Cloud Storage bucket interface.
 * Returns immediately if bucket was already initialized
 */
const initializeBucket = function initializeBucket() {
  const source = 'initializeBucket()';
  Log.log(moduleName, source);

  if (didInitializeBucket) return;
  const project = CloudStorage({
    projectId,
    keyFilename: storageAccountKeyPath,
  });
  this.bucket = project.bucket(projectUrl);
  didInitializeBucket = true;
};

/**
 * Retrieves a file from cloud storage
 * @param {String} _folder the name of the folder to
 * to retrieve from. Use empty string for base folder
 * @param {String} _fileName the name the uploaded file to retrieve
 * @return {Promise<Object>} rejects when a download error
 * occurs, and resolves when the download is complete. Resolved
 * promise will contain path to local file, as well as data buffer
 * @throws {StorageError} for invalid `_fileName`
 */
const get = function get(_folder, _fileName) {
  const source = 'get()';
  Log.log(moduleName, source, _folder, _fileName);

  if (!didInitializeBucket) StorageError.throwInvalidStateError(source);
  const invalidMembers = [];
  if (typeof _folder !== 'string') invalidMembers.push('folder');
  if (typeof _fileName !== 'string' || _fileName.length === 0) invalidMembers.push('fileName');
  if (invalidMembers.length > 0) StorageError.throwInvalidMembersError(source, invalidMembers);

  Log.log(moduleName, source, 'Creating file from bucket');
  const file = this.bucket.file(`${_folder}${_fileName}`);
  Log.log(moduleName, source, 'Creating read stream for existing file from bucket');
  const remoteReadStream = file.createReadStream();
  const promise = new Promise((resolve, reject) => {
    const bytes = [];
    const localFile = `${process.cwd()}/cache/downloads/${Utils.newUuid()}`;
    remoteReadStream.on('error', (downloadError) => {
      let errorType;
      if (downloadError.code === 404) errorType = StorageError.type.FileDoesNotExist;
      else errorType = StorageError.type.Unknown;
      reject(StorageError.format(errorType, source, downloadError));
    });

    remoteReadStream.on('data', byte => bytes.push(byte));
    remoteReadStream.on('end', async () => {
      const buffer = Buffer.concat(bytes);
      const base64String = Media.bufferToBase64String(buffer);
      resolve(base64String);
      await Utils.deleteLocalFile(localFile);
    });

    Log.log(moduleName, source, 'Creating write stream for new local file');
    const localWriteStream = FileSystem.createWriteStream(localFile);
    Log.log(moduleName, source, 'Piping remote read stream to local write stream');
    remoteReadStream.pipe(localWriteStream);
  });

  return promise;
};

/**
 * Uploads a file to cloud storage
 * @param {String} _folder the name of the folder to
 * to retrieve from. Use empty string for base folder
 * @param {String} _fileName the name the uploaded file should have
 * @param {String} _filePath the path to the local file to upload
 * @return {Promise} rejects when an upload error
 * occurs, and resolves when the upload is complete
 * @throws {StorageError} for invalid `fileName` or `_filePath`
 */
const add = async function add(_folder, _fileName, _filePath) {
  const source = 'add()';
  Log.log(moduleName, source, _folder, _fileName, _filePath);

  if (!didInitializeBucket) StorageError.throwInvalidStateError(source);
  const invalidMembers = [];
  if (typeof _folder !== 'string') invalidMembers.push('folder');
  if (typeof _fileName !== 'string' || _fileName.length === 0) invalidMembers.push('fileName');
  if (typeof _filePath !== 'string' || _filePath.length === 0) invalidMembers.push('filePath');
  if (invalidMembers.length > 0) StorageError.throwInvalidMembersError(source, invalidMembers);

  let fileInfo;
  try {
    Log.log(moduleName, source, 'Analyzing given path');
    fileInfo = await Utils.lstat(_filePath);
  } catch (error) {
    StorageError.throwFileDoesNotExistError(source, error);
  }

  if (!fileInfo.isFile()) StorageError.throwInvalidFileError(source, fileInfo);
  const promise = new Promise((resolve, reject) => {
    Log.log(moduleName, source, 'Creating file in bucket');
    const file = this.bucket.file(`${_folder}${_fileName}`);
    Log.log(moduleName, source, 'Creating write stream for new file in bucket');
    const remoteWriteStream = file.createWriteStream({ resumable: false });
    Log.log(moduleName, source, 'Creating read stream for given file path');
    const localReadStream = FileSystem.createReadStream(_filePath);
    remoteWriteStream.on('error', (uploadError) => {
      Log.log(
        moduleName,
        source,
        'Encountered an error while uploading local file to cloud storage',
        uploadError
      );
      reject(StorageError.format(StorageError.type.Unknown, source, uploadError));
    });

    remoteWriteStream.on('finish', async () => {
      Log.log(moduleName, source, 'Finished uploading local file to cloud storage');
      resolve();
      await Utils.deleteLocalFile(_filePath);
    });

    Log.log(moduleName, source, 'Piping local read stream to remote write stream');
    localReadStream.pipe(remoteWriteStream);
  });

  return promise;
};

module.exports = {
  get,
  add,
  initializeBucket,
  didInitializeBucket,
};

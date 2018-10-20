/**
 * @module for cloud storage interaction
 */

const FileSystem = require('fs');
const Media = require('../media/media');
const Log = require('../logging/logger');
const Utils = require('../utilities/utils');
const MockStorage = require('./mock/MockStorage');
const DroppError = require('../errors/DroppError');
const Validator = require('../utilities/validator');
const Constants = require('../utilities/constants');
const CloudStorage = require('@google-cloud/storage');
const StorageError = require('../errors/StorageError');

let didInitializeBucket = false;

/**
 * Initializes the Cloud Storage bucket interface.
 * Returns immediately if bucket was already initialized
 * @param {Boolean} [_shouldMock=false] whether
 * or not to use the mock storage bucket
 */
const initializeBucket = (_shouldMock = false) => {
  const source = 'initializeBucket()';
  Log.log(Constants.storage.moduleName, source, _shouldMock);

  if (didInitializeBucket) return;
  let storage;
  if (_shouldMock === true) storage = new MockStorage();
  else {
    storage = CloudStorage({
      projectId: Constants.storage.project.id,
      keyFilename: Constants.storage.project.accountKeyPath,
    });
  }

  this.bucket = storage.bucket(Constants.storage.project.url);
  didInitializeBucket = true;
};

/**
 * Retrieves a file from cloud storage
 * @param {String} _folder the name of the folder to
 * to retrieve from. Use empty string for base folder
 * @param {String} _fileName the name the uploaded file to retrieve
 * @return {Promise<Object>} rejects when a download error occurs,
 * and resolves when the download is complete. Resolved promise
 * will contain object with MIME type and base-64 encoded data
 * @throws {StorageError} for invalid `_folder`,
 * `_fileName`, or if file does not exist
 */
const get = async (_folder, _fileName) => {
  const source = 'get()';
  Log.log(Constants.storage.moduleName, source, _folder, _fileName);

  if (!didInitializeBucket) StorageError.throwInvalidStateError(source);
  const invalidMembers = [];
  if (typeof _folder !== 'string') invalidMembers.push(Constants.params.folder);
  if (typeof _fileName !== 'string' || _fileName.length === 0) {
    invalidMembers.push(Constants.params.fileName);
  }

  if (invalidMembers.length > 0) StorageError.throwInvalidMembersError(source, invalidMembers);

  Log.log(Constants.storage.moduleName, source, Constants.storage.messages.configuringStorageFile);
  const file = this.bucket.file(`${_folder}${_fileName}`);
  const doesFileExist = await file.exists();
  if (Array.isArray(doesFileExist) && doesFileExist.length > 0 && doesFileExist[0] === false) {
    StorageError.throwFileDoesNotExistError(source);
  }

  Log.log(Constants.storage.moduleName, source, Constants.storage.messages.creatingRemoteStream);
  const remoteReadStream = file.createReadStream();
  const promise = new Promise((resolve, reject) => {
    const bytes = [];
    const localFile = `${process.cwd()}/${Constants.storage.folders.downloads}/${Utils.newUuid()}`;
    remoteReadStream.on(Constants.storage.streamEvents.error, async (downloadError) => {
      await Utils.deleteLocalFile(localFile);
      reject(StorageError.format(StorageError.type.Unknown, source, downloadError));
    });

    remoteReadStream.on(Constants.storage.streamEvents.data, byte => bytes.push(byte));
    remoteReadStream.on(Constants.storage.streamEvents.end, async () => {
      const buffer = Buffer.concat(bytes);
      const data = Media.encodeToBase64(buffer);
      await Utils.deleteLocalFile(localFile);
      resolve(data);
    });

    Log.log(Constants.storage.moduleName, source, Constants.storage.messages.creatingLocalStream);
    const localWriteStream = FileSystem.createWriteStream(localFile);
    Log.log(Constants.storage.moduleName, source, Constants.storage.messages.pipingStreams);
    remoteReadStream.pipe(localWriteStream);
  });

  return promise;
};

/**
 * Adds a given string as a file in cloud storage
 * @param {String} _folder the name of the folder
 * to to add to. Use empty string for base folder
 * @param {String} _fileName the name the uploaded file should have
 * @param {String} string the string to add
 * to cloud storage. Should be base-64 encoded
 * @return {Promise} rejects when an upload error
 * occurs, and resolves when the upload is complete
 * @throws {StorageError} for invalid `_folder`,
 * `fileName`, or `_filePath`. Throws if file already exists
 */
const addString = async (folder, filename, string) => {
  const source = 'addString()';
  Log.log(Constants.storage.moduleName, source, folder, filename, string);

  if (!didInitializeBucket) StorageError.throwInvalidStateError(source);
  const invalidMembers = [];
  if (typeof folder !== 'string') invalidMembers.push(Constants.params.folder);
  if (typeof filename !== 'string' || filename.trim().length === 0) {
    invalidMembers.push(Constants.params.fileName);
  }

  if (typeof string !== 'string' || string.trim().length === 0) {
    invalidMembers.push(Constants.params.string);
  }

  if (invalidMembers.length > 0) StorageError.throwInvalidMembersError(source, invalidMembers);
  Log.log(Constants.storage.moduleName, source, Constants.storage.messages.configuringStorageFile);
  const file = this.bucket.file(`${folder}${filename}`);
  const doesFileExist = await file.exists();
  if (Array.isArray(doesFileExist) && doesFileExist.length > 0 && doesFileExist[0] === true) {
    DroppError.throwResourceError(source, Constants.storage.messages.errors.fileAlreadyExists);
  }

  const promise = new Promise((resolve, reject) => {
    Log.log(Constants.storage.moduleName, source, Constants.storage.messages.creatingRemoteStream);
    const remoteWriteStream = file.createWriteStream({ resumable: false });

    Log.log(Constants.storage.moduleName, source, Constants.storage.messages.creatingLocalStream);
    const buffer = Buffer.from(string, 'base64');
    const inMemoryStream = Utils.bufferToStream(buffer);
    remoteWriteStream.on(Constants.storage.streamEvents.error, (uploadError) => {
      Log.log(
        Constants.storage.moduleName,
        source,
        Constants.storage.messages.errors.uploadError,
        uploadError
      );
      reject(StorageError.format(StorageError.type.Unknown, source, uploadError));
    });

    remoteWriteStream.on(Constants.storage.streamEvents.finish, async () => {
      Log.log(
        Constants.storage.moduleName,
        source,
        Constants.storage.messages.success.finishedUpload
      );

      this.bucket.addFile(folder, filename, file);
      resolve();
    });

    Log.log(Constants.storage.moduleName, source, Constants.storage.messages.pipingStreams);
    inMemoryStream.pipe(remoteWriteStream);
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
 * @throws {StorageError} for invalid `_folder`,
 * `fileName`, or `_filePath`. Throws if file already exists
 */
const add = async (_folder, _fileName, _filePath) => {
  const source = 'add()';
  Log.log(Constants.storage.moduleName, source, _folder, _fileName, _filePath);

  if (!didInitializeBucket) StorageError.throwInvalidStateError(source);
  const invalidMembers = [];
  if (typeof _folder !== 'string') invalidMembers.push(Constants.params.folder);
  if (typeof _fileName !== 'string' || _fileName.length === 0) {
    invalidMembers.push(Constants.params.fileName);
  }

  if (!(await Validator.isValidFilePath(_filePath))) invalidMembers.push(Constants.params.filePath);
  if (invalidMembers.length > 0) StorageError.throwInvalidMembersError(source, invalidMembers);

  Log.log(Constants.storage.moduleName, source, Constants.storage.messages.configuringStorageFile);
  const file = this.bucket.file(`${_folder}${_fileName}`);
  const doesFileExist = await file.exists();
  if (Array.isArray(doesFileExist) && doesFileExist.length > 0 && doesFileExist[0] === true) {
    DroppError.throwResourceError(source, Constants.storage.messages.errors.fileAlreadyExists);
  }

  const promise = new Promise((resolve, reject) => {
    Log.log(Constants.storage.moduleName, source, Constants.storage.messages.creatingRemoteStream);
    const remoteWriteStream = file.createWriteStream({ resumable: false });
    Log.log(Constants.storage.moduleName, source, Constants.storage.messages.creatingLocalStream);
    const localReadStream = FileSystem.createReadStream(_filePath);
    remoteWriteStream.on(Constants.storage.streamEvents.error, (uploadError) => {
      Log.log(
        Constants.storage.moduleName,
        source,
        Constants.storage.messages.errors.uploadError,
        uploadError
      );
      reject(StorageError.format(StorageError.type.Unknown, source, uploadError));
    });

    remoteWriteStream.on(Constants.storage.streamEvents.finish, async () => {
      Log.log(
        Constants.storage.moduleName,
        source,
        Constants.storage.messages.success.finishedUpload
      );
      await Utils.deleteLocalFile(_filePath);

      this.bucket.addFile(_folder, _fileName, file);
      resolve();
    });

    Log.log(Constants.storage.moduleName, source, Constants.storage.messages.pipingStreams);
    localReadStream.pipe(remoteWriteStream);
  });

  return promise;
};

/**
 * Removes a file from cloud storage
 * @param {String} _folder the name of the folder to
 * to remove from. Use empty string for base folder
 * @param {String} _fileName the name the uploaded file to remove
 * @throws {StorageError} for invalid `_folder`,
 * `_fileName`, or if the file does not exist
 */
const remove = async (_folder, _fileName) => {
  const source = 'remove()';
  Log.log(Constants.storage.moduleName, source, _folder, _fileName);

  if (!didInitializeBucket) StorageError.throwInvalidStateError(source);
  const invalidMembers = [];
  if (typeof _folder !== 'string') invalidMembers.push(Constants.params.folder);
  if (typeof _fileName !== 'string' || _fileName.length === 0) {
    invalidMembers.push(Constants.params.fileName);
  }

  if (invalidMembers.length > 0) StorageError.throwInvalidMembersError(source, invalidMembers);

  Log.log(Constants.storage.moduleName, source, Constants.storage.messages.configuringStorageFile);
  const file = this.bucket.file(`${_folder}${_fileName}`);
  const doesFileExist = await file.exists();
  if (Array.isArray(doesFileExist) && doesFileExist.length > 0 && doesFileExist[0] === false) {
    StorageError.throwFileDoesNotExistError(source);
  }

  Log.log(Constants.storage.moduleName, source, Constants.storage.messages.removingRemoteFile);
  try {
    await file.delete();
  } catch (error) {
    StorageError.throwUnknownError(source, error);
  }
};

/**
 * Removes multiple files from cloud storage
 * @param {String} _folder the name of the folder
 * to remove from. Use empty string for base folder
 * @param {[String]} _fileNames the names of the uploaded files to remove
 * @throws {StorageError} for invalid `_folder` or `_fileNames`
 */
const bulkRemove = async (_folder, _fileNames) => {
  const source = 'bulkRemove()';
  Log.log(Constants.storage.moduleName, source, _folder, _fileNames);

  if (!didInitializeBucket) StorageError.throwInvalidStateError(source);
  const invalidMembers = [];
  if (typeof _folder !== 'string') invalidMembers.push(Constants.params.folder);
  if (Array.isArray(_fileNames)) {
    const invalidFileNames = _fileNames.filter(fileName => typeof fileName !== 'string' || fileName.trim().length === 0);
    if (invalidFileNames.length > 0) invalidMembers.push(Constants.params.fileName);
  } else invalidMembers.push(Constants.params.fileNames);

  if (invalidMembers.length > 0) StorageError.throwInvalidMembersError(source, invalidMembers);
  const removals = _fileNames.map(fileName => remove(_folder, fileName));
  await Promise.all(removals);
};

module.exports = {
  get,
  add,
  remove,
  addString,
  bulkRemove,
  initializeBucket,
  didInitializeBucket,
};

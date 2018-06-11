/**
* @module for common unit test functionality
*/

const Log = require('./logger');
const FileSystem = require('fs');
const Utils = require('../src/utilities/utils');

const moduleName = 'Helper';

/**
 * Creates a new text file in the cache/uploads folder
 * @param {String} _filename the name of the new file to
 * create, excluding it's extension. Default is a new UUID
 * @param {String} _content text content to
 * write to the new file. Default is a new UUID
 * @return {String} the full path to the new file
 */
const createLocalTextFile = (_filename, _content) => {
  const source = 'createLocalTextFile()';
  const content = _content || Utils.newUuid();
  const filename = _filename || Utils.newUuid();
  const path = `${process.cwd()}/cache/uploads/${filename}.txt`;
  Log.log(moduleName, source, path);
  const promise = new Promise((resolve) => {
    const writeStream = FileSystem.createWriteStream(path);
    writeStream.on('close', () => resolve(path));
    writeStream.write(content);
    writeStream.end();
  });

  return promise;
};

/**
 * Copies a local file from the test/uploads folder to the cache/uploads folder
 * @param {String} _filename the name of
 * the file to copy, including it's extension
 * @param {String} _uuid a unique identifier to prepend
 * to the copied file name. Default is a new UUID
 * @return {Object} containing `filename` of the
 * copied file and `path` for the copied file
 */
const copyLocalFile = (_filename, _uuid) => {
  const source = 'copyLocalFile()';
  const uuid = _uuid || Utils.newUuid();
  const existingImagePath = `${process.cwd()}/test/uploads/${_filename}`;
  const copiedImagePath = `${process.cwd()}/cache/uploads/${uuid}_${_filename}`;
  Log.log(moduleName, source, copiedImagePath);
  const promise = new Promise((resolve, reject) => {
    const writeStream = FileSystem.createWriteStream(copiedImagePath);
    writeStream.on('error', error => reject(error));
    writeStream.on('close', () => {
      const result = {
        filename: uuid,
        path: copiedImagePath,
      };

      resolve(result);
    });

    FileSystem.createReadStream(existingImagePath).pipe(writeStream);
  });

  return promise;
};

module.exports = {
  copyLocalFile,
  createLocalTextFile,
  customTimeout: 60000,
};

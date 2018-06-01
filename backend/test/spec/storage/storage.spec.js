const FileSystem = require('fs');
const Log = require('../../logger');
const Utils = require('../../../src/utilities/utils');
const CloudStorage = require('../../../src/storage/storage');
const StorageError = require('../../../src/errors/StorageError');

const testName = 'Cloud Storage';
CloudStorage.initializeBucket();
/* eslint-disable no-undef */
describe(testName, () => {
  beforeEach(() => {
    this.deleteLocalFile = async (_testImageFilePath) => {
      await Utils.deleteLocalFile(_testImageFilePath);
    };

    this.createLocalFile = (_testImageName) => {
      const uuid = Utils.newUuid();
      const existingImagePath = `${process.cwd()}/test/uploads/${_testImageName}`;
      const copiedImagePath = `${process.cwd()}/test/uploads/${uuid}_${_testImageName}`;
      const promise = new Promise((resolve) => {
        const writeStream = FileSystem.createWriteStream(copiedImagePath);
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
  });

  afterEach(() => {
    delete this.createLocalFile;
    delete this.deleteLocalFile;
  });

  const getTitle = 'Get';
  describe(getTitle, () => {
    it('throws an error for invalid folder and filename', async (done) => {
      try {
        const result = await CloudStorage.get();
        expect(result).not.toBeDefined();
        Log(testName, getTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('StorageError');
        expect(error.details.type).toBe(StorageError.type.InvalidMembers.type);
        expect(error.details.details.invalidMembers).toContain('folder');
        expect(error.details.details.invalidMembers).toContain('fileName');
        Log(testName, getTitle, error.details);
      }

      done();
    });

    it('throws an error for a non-existent file', async (done) => {
      try {
        const result = await CloudStorage.get('', Utils.newUuid());
        expect(result).not.toBeDefined();
        Log(testName, getTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('StorageError');
        expect(error.details.type).toBe(StorageError.type.FileDoesNotExist.type);
        Log(testName, getTitle, error.details);
      }

      done();
    });

    const successGetTitle = 'Get success';
    describe(successGetTitle, () => {
      beforeEach(async (done) => {
        this.fileInfo = await this.createLocalFile('test_image_001.png');
        await CloudStorage.add('', this.fileInfo.filename, this.fileInfo.path);
        done();
      });

      afterEach(() => {
        delete this.fileInfo;
      });

      it('gets an image from cloud storage', async (done) => {
        const result = await CloudStorage.get('', this.fileInfo.filename);
        expect(typeof result).toBeDefined('string');
        expect(result.substring(0, 22)).toBe('data:image/png;base64,');
        Log(testName, successGetTitle, result.substring(0, 22));
        done();
      });
    });
  });

  const addTitle = 'Add';
  describe(addTitle, () => {
    it('throws an error for invalid folder, filename, and file path', async (done) => {
      try {
        const result = await CloudStorage.add();
        expect(result).not.toBeDefined();
        Log(testName, addTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('StorageError');
        expect(error.details.type).toBe(StorageError.type.InvalidMembers.type);
        expect(error.details.details.invalidMembers).toContain('folder');
        expect(error.details.details.invalidMembers).toContain('fileName');
        expect(error.details.details.invalidMembers).toContain('filePath');
        Log(testName, addTitle, error.details);
      }

      done();
    });

    it('throws an error for a non-existent file path', async (done) => {
      try {
        const result = await CloudStorage.add('', Utils.newUuid(), Utils.newUuid());
        expect(result).not.toBeDefined();
        Log(testName, addTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('StorageError');
        expect(error.details.type).toBe(StorageError.type.FileDoesNotExist.type);
        Log(testName, addTitle, error.details);
      }

      done();
    });

    it('throws an error for a non-file file path', async (done) => {
      try {
        const result = await CloudStorage.add('', Utils.newUuid(), process.cwd());
        expect(result).not.toBeDefined();
        Log(testName, addTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('StorageError');
        expect(error.details.type).toBe(StorageError.type.InvalidFile.type);
        Log(testName, addTitle, error.details);
      }

      done();
    });

    const successAddTitle = 'Add success';
    describe(successAddTitle, () => {
      beforeEach(async (done) => {
        this.fileInfo = await this.createLocalFile('test_image_001.png');
        done();
      });

      afterEach(() => {
        delete this.fileInfo;
      });

      it('adds an image to cloud storage', async (done) => {
        await CloudStorage.add('', this.fileInfo.filename, this.fileInfo.path);

        // Verify result from cloud storage
        const result = await CloudStorage.get('', this.fileInfo.filename);
        expect(typeof result).toBeDefined('string');
        expect(result.substring(0, 22)).toBe('data:image/png;base64,');
        Log(testName, successAddTitle, result.substring(0, 22));
        done();
      });
    });
  });
});

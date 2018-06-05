const Log = require('../../logger');
const Helper = require('../../helper');
const Utils = require('../../../src/utilities/utils');
const DroppError = require('../../../src/errors/DroppError');
const CloudStorage = require('../../../src/storage/storage');
const StorageError = require('../../../src/errors/StorageError');

const testName = 'Cloud Storage';
CloudStorage.initializeBucket();
/* eslint-disable no-undef */
describe(testName, () => {
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
        this.fileInfo = await Helper.copyLocalFile('test_image_001.png');
        await CloudStorage.add('', this.fileInfo.filename, this.fileInfo.path);
        done();
      });

      afterEach(async (done) => {
        await CloudStorage.remove('', this.fileInfo.filename);
        delete this.fileInfo;
        done();
      });

      it('gets an image from cloud storage', async (done) => {
        const result = await CloudStorage.get('', this.fileInfo.filename);
        expect(result.mimeType).toBe('image/png');
        expect(result.base64Data.length > 0).toBe(true);
        Log(testName, successGetTitle, result.mimeType);
        done();
      });
    });
  });

  const addTitle = 'Add';
  describe(addTitle, () => {
    beforeEach(async (done) => {
      this.fileInfo = await Helper.copyLocalFile('test_image_001.png');
      await CloudStorage.add('', this.fileInfo.filename, this.fileInfo.path);
      done();
    });

    afterEach(async (done) => {
      await CloudStorage.remove('', this.fileInfo.filename);
      delete this.fileInfo;
      done();
    });

    it('throws an error for invalid folder, filename, and file path', async (done) => {
      try {
        const result = await CloudStorage.add();
        expect(result).not.toBeDefined();
        Log(testName, addTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('StorageError');
        expect(error.details.type).toBe(StorageError.type.InvalidMembers.type);
        expect(error.details.details.invalidMembers.length).toBe(3);
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
        expect(error.details.type).toBe(StorageError.type.InvalidMembers.type);
        expect(error.details.details.invalidMembers.length).toBe(1);
        expect(error.details.details.invalidMembers[0]).toBe('filePath');
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
        expect(error.details.type).toBe(StorageError.type.InvalidMembers.type);
        expect(error.details.details.invalidMembers.length).toBe(1);
        expect(error.details.details.invalidMembers[0]).toBe('filePath');
        Log(testName, addTitle, error.details);
      }

      done();
    });

    it('throws an error for an already-existing file', async (done) => {
      this.fileInfo = await Helper.copyLocalFile('test_image_001.png', this.fileInfo.filename);
      try {
        const result = await CloudStorage.add('', this.fileInfo.filename, this.fileInfo.path);
        expect(result).not.toBeDefined();
        Log(testName, addTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.privateDetails.error.source).toBe('add()');
        expect(error.details.error.message).toBe('That file already exists');
        Log(testName, addTitle, error.details);
      }

      await Utils.deleteLocalFile(this.fileInfo.path);
      done();
    });

    const successAddTitle = 'Add success';
    describe(successAddTitle, () => {
      beforeEach(async (done) => {
        this.fileInfo2 = await Helper.copyLocalFile('test_image_001.png');
        done();
      });

      afterEach(async (done) => {
        await CloudStorage.remove('', this.fileInfo2.filename);
        delete this.fileInfo2;
        done();
      });

      it('adds a file to cloud storage', async (done) => {
        await CloudStorage.add('', this.fileInfo2.filename, this.fileInfo2.path);

        // Verify result from cloud storage
        const result = await CloudStorage.get('', this.fileInfo2.filename);
        expect(result.mimeType).toBe('image/png');
        expect(result.base64Data.length > 0).toBe(true);
        Log(testName, successAddTitle, result.mimeType);
        done();
      });
    });
  });

  const removeTitle = 'Remove';
  describe(removeTitle, () => {
    it('throws an error for invalid folder and filename', async (done) => {
      try {
        const result = await CloudStorage.remove();
        expect(result).not.toBeDefined();
        Log(testName, removeTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('StorageError');
        expect(error.details.type).toBe(StorageError.type.InvalidMembers.type);
        expect(error.details.details.invalidMembers).toContain('folder');
        expect(error.details.details.invalidMembers).toContain('fileName');
        Log(testName, removeTitle, error.details);
      }

      done();
    });

    it('throws an error for a non-existent file', async (done) => {
      try {
        const result = await CloudStorage.remove('', Utils.newUuid());
        expect(result).not.toBeDefined();
        Log(testName, removeTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('StorageError');
        expect(error.details.type).toBe(StorageError.type.FileDoesNotExist.type);
        Log(testName, removeTitle, error.details);
      }

      done();
    });

    const successRemoveTitle = 'Remove success';
    describe(successRemoveTitle, () => {
      beforeEach(async (done) => {
        this.fileInfo = await Helper.copyLocalFile('test_image_001.png');
        await CloudStorage.add('', this.fileInfo.filename, this.fileInfo.path);
        done();
      });

      afterEach(() => {
        delete this.fileInfo;
      });

      it('removes a file from cloud storage', async (done) => {
        await CloudStorage.remove('', this.fileInfo.filename);

        // Verify result from cloud storage
        try {
          const result = await CloudStorage.get('', this.fileInfo.filename);
          expect(result).not.toBeDefined();
          Log(testName, successRemoveTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('StorageError');
          expect(error.details.type).toBe(StorageError.type.FileDoesNotExist.type);
          Log(testName, removeTitle, error.details);
        }

        done();
      });
    });
  });
});

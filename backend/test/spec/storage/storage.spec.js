const Log = require('../../logger');
const Helper = require('../../helper');
const TestConstants = require('../../constants');
const Utils = require('../../../src/utilities/utils');
const DroppError = require('../../../src/errors/DroppError');
const CloudStorage = require('../../../src/storage/storage');
const Constants = require('../../../src/utilities/constants');
const StorageError = require('../../../src/errors/StorageError');

CloudStorage.initializeBucket();
/* eslint-disable no-undef */
describe(TestConstants.storage.testName, () => {
  let originalTimeout;
  beforeEach(() => {
    Log.beforeEach(TestConstants.storage.testName, TestConstants.storage.testName, true);
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = Helper.customTimeout;
    Log.beforeEach(TestConstants.storage.testName, TestConstants.storage.testName, false);
  });

  afterEach(() => {
    Log.afterEach(TestConstants.storage.testName, TestConstants.storage.testName, true);
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    Log.afterEach(TestConstants.storage.testName, TestConstants.storage.testName, false);
  });

  const getTitle = 'Get';
  describe(getTitle, () => {
    it('throws an error for invalid folder and filename', async (done) => {
      try {
        const result = await CloudStorage.get();
        expect(result).not.toBeDefined();
        Log.log(TestConstants.storage.testName, getTitle, TestConstants.messages.shouldHaveThrown);
      } catch (error) {
        expect(error.name).toBe(Constants.errors.storage.name);
        expect(error.details.type).toBe(StorageError.type.InvalidMembers.type);
        expect(error.details.details.invalidMembers).toContain(Constants.params.folder);
        expect(error.details.details.invalidMembers).toContain(Constants.params.fileName);
        Log.log(TestConstants.storage.testName, getTitle, error.details);
      }

      done();
    });

    it('throws an error for a non-existent file', async (done) => {
      try {
        const result = await CloudStorage.get(
          TestConstants.utils.strings.emptyString,
          Utils.newUuid()
        );
        expect(result).not.toBeDefined();
        Log.log(TestConstants.storage.testName, getTitle, TestConstants.messages.shouldHaveThrown);
      } catch (error) {
        expect(error.name).toBe(Constants.errors.storage.name);
        expect(error.details.type).toBe(StorageError.type.FileDoesNotExist.type);
        Log.log(TestConstants.storage.testName, getTitle, error.details);
      }

      done();
    });

    const successGetTitle = 'Get success';
    describe(successGetTitle, () => {
      beforeEach(async (done) => {
        this.fileInfo = await Helper.copyLocalFile(TestConstants.files.image001);
        await CloudStorage.add(
          TestConstants.utils.strings.emptyString,
          this.fileInfo.filename,
          this.fileInfo.path
        );
        done();
      });

      afterEach(async (done) => {
        await CloudStorage.remove(TestConstants.utils.strings.emptyString, this.fileInfo.filename);
        delete this.fileInfo;
        done();
      });

      it('gets an image from cloud storage', async (done) => {
        const result = await CloudStorage.get(
          TestConstants.utils.strings.emptyString,
          this.fileInfo.filename
        );
        expect(result.mimeType).toBe(Constants.media.mimeTypes.png);
        expect(result.base64Data.length > 0).toBe(true);
        Log.log(TestConstants.storage.testName, successGetTitle, result.mimeType);
        done();
      }, Helper.customTimeout);
    });
  });

  const addTitle = 'Add';
  describe(addTitle, () => {
    beforeEach(async (done) => {
      this.fileInfo = await Helper.copyLocalFile(TestConstants.files.image001);
      await CloudStorage.add(
        TestConstants.utils.strings.emptyString,
        this.fileInfo.filename,
        this.fileInfo.path
      );
      done();
    });

    afterEach(async (done) => {
      await CloudStorage.remove(TestConstants.utils.strings.emptyString, this.fileInfo.filename);
      delete this.fileInfo;
      done();
    });

    it('throws an error for invalid folder, filename, and file path', async (done) => {
      try {
        await CloudStorage.add();
        expect(true).toBe(false);
        Log.log(TestConstants.storage.testName, addTitle, TestConstants.messages.shouldHaveThrown);
      } catch (error) {
        expect(error.name).toBe(Constants.errors.storage.name);
        expect(error.details.type).toBe(StorageError.type.InvalidMembers.type);
        expect(error.details.details.invalidMembers.length).toBe(3);
        expect(error.details.details.invalidMembers).toContain(Constants.params.folder);
        expect(error.details.details.invalidMembers).toContain(Constants.params.fileName);
        expect(error.details.details.invalidMembers).toContain(Constants.params.filePath);
        Log.log(TestConstants.storage.testName, addTitle, error.details);
      }

      done();
    });

    it('throws an error for a non-existent file path', async (done) => {
      try {
        await CloudStorage.add(
          TestConstants.utils.strings.emptyString,
          Utils.newUuid(),
          Utils.newUuid()
        );
        expect(true).toBe(false);
        Log.log(TestConstants.storage.testName, addTitle, TestConstants.messages.shouldHaveThrown);
      } catch (error) {
        expect(error.name).toBe(Constants.errors.storage.name);
        expect(error.details.type).toBe(StorageError.type.InvalidMembers.type);
        expect(error.details.details.invalidMembers.length).toBe(1);
        expect(error.details.details.invalidMembers[0]).toBe(Constants.params.filePath);
        Log.log(TestConstants.storage.testName, addTitle, error.details);
      }

      done();
    });

    it('throws an error for a non-file file path', async (done) => {
      try {
        await CloudStorage.add(
          TestConstants.utils.strings.emptyString,
          Utils.newUuid(),
          process.cwd()
        );
        expect(true).toBe(false);
        Log.log(TestConstants.storage.testName, addTitle, TestConstants.messages.shouldHaveThrown);
      } catch (error) {
        expect(error.name).toBe(Constants.errors.storage.name);
        expect(error.details.type).toBe(StorageError.type.InvalidMembers.type);
        expect(error.details.details.invalidMembers.length).toBe(1);
        expect(error.details.details.invalidMembers[0]).toBe(Constants.params.filePath);
        Log.log(TestConstants.storage.testName, addTitle, error.details);
      }

      done();
    });

    it('throws an error for an already-existing file', async (done) => {
      this.fileInfo = await Helper.copyLocalFile(
        TestConstants.files.image001,
        this.fileInfo.filename
      );
      try {
        await CloudStorage.add(
          TestConstants.utils.strings.emptyString,
          this.fileInfo.filename,
          this.fileInfo.path
        );
        expect(true).toBe(false);
        Log.log(TestConstants.storage.testName, addTitle, TestConstants.messages.shouldHaveThrown);
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.privateDetails.error.source).toBe('add()');
        expect(error.details.error.message)
          .toBe(Constants.storage.messages.errors.fileAlreadyExists);
        Log.log(TestConstants.storage.testName, addTitle, error.details);
      }

      await Utils.deleteLocalFile(this.fileInfo.path);
      done();
    }, Helper.customTimeout);

    const successAddTitle = 'Add success';
    describe(successAddTitle, () => {
      beforeEach(async (done) => {
        this.fileInfo2 = await Helper.copyLocalFile(TestConstants.files.image001);
        done();
      });

      afterEach(async (done) => {
        await CloudStorage.remove(TestConstants.utils.strings.emptyString, this.fileInfo2.filename);
        delete this.fileInfo2;
        done();
      });

      it('adds a file to cloud storage', async (done) => {
        await CloudStorage.add(
          TestConstants.utils.strings.emptyString,
          this.fileInfo2.filename,
          this.fileInfo2.path
        );

        // Verify result from cloud storage
        const result = await CloudStorage.get(
          TestConstants.utils.strings.emptyString,
          this.fileInfo2.filename
        );
        expect(result.mimeType).toBe(Constants.media.mimeTypes.png);
        expect(result.base64Data.length > 0).toBe(true);
        Log.log(TestConstants.storage.testName, successAddTitle, result.mimeType);
        done();
      }, Helper.customTimeout);
    });
  });

  const addStringTitle = 'Add string';
  describe(addStringTitle, () => {
    beforeEach(async (done) => {
      this.didAdd = false;
      this.data = Utils.newUuid();
      this.filename = Utils.newUuid();
      this.existingFilename = Utils.newUuid();
      await CloudStorage.addString(
        TestConstants.utils.strings.emptyString,
        this.existingFilename,
        Utils.newUuid()
      );
      done();
    });

    afterEach(async (done) => {
      await CloudStorage.remove(TestConstants.utils.strings.emptyString, this.existingFilename);
      if (this.didAdd === true) {
        await CloudStorage.remove(TestConstants.utils.strings.emptyString, this.filename);
      }

      delete this.data;
      delete this.didAdd;
      delete this.filename;
      delete this.existingFilename;
      done();
    });

    it('throws an error for invalid folder, filename, and string', async (done) => {
      try {
        await CloudStorage.addString();
        expect(true).toBe(false);
        Log.log(
          TestConstants.storage.testName,
          addStringTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.storage.name);
        expect(error.details.type).toBe(StorageError.type.InvalidMembers.type);
        expect(error.details.details.invalidMembers.length).toBe(3);
        expect(error.details.details.invalidMembers).toContain(Constants.params.folder);
        expect(error.details.details.invalidMembers).toContain(Constants.params.fileName);
        expect(error.details.details.invalidMembers).toContain(Constants.params.string);
        Log.log(TestConstants.storage.testName, addStringTitle, error.details);
      }

      done();
    });

    it('throws an error for an empty filename and string', async (done) => {
      try {
        await CloudStorage.addString(
          TestConstants.utils.strings.emptyString,
          TestConstants.utils.strings.tab,
          TestConstants.utils.strings.tab
        );
        expect(true).toBe(false);
        Log.log(
          TestConstants.storage.testName,
          addStringTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.storage.name);
        expect(error.details.type).toBe(StorageError.type.InvalidMembers.type);
        expect(error.details.details.invalidMembers.length).toBe(2);
        expect(error.details.details.invalidMembers).toContain(Constants.params.fileName);
        expect(error.details.details.invalidMembers).toContain(Constants.params.string);
        Log.log(TestConstants.storage.testName, addStringTitle, error.details);
      }

      done();
    });

    it('throws an error for an already-existing file', async (done) => {
      try {
        await CloudStorage.addString(
          TestConstants.utils.strings.emptyString,
          this.existingFilename,
          this.data
        );
        expect(true).toBe(false);
        Log.log(
          TestConstants.storage.testName,
          addStringTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.privateDetails.error.source).toBe('addString()');
        expect(error.details.error.message)
          .toBe(Constants.storage.messages.errors.fileAlreadyExists);
        Log.log(TestConstants.storage.testName, addStringTitle, error.details);
      }

      done();
    }, Helper.customTimeout);

    const addStringSuccessTitle = 'Add string success';
    describe(addStringSuccessTitle, () => {
      it('adds a string to cloud storage', async (done) => {
        await CloudStorage.addString(
          TestConstants.utils.strings.emptyString,
          this.filename,
          this.data
        );

        // Verify result from cloud storage
        const result = await CloudStorage.get(
          TestConstants.utils.strings.emptyString,
          this.filename
        );
        expect(result.mimeType).toBe(Constants.media.mimeTypes.unknown);
        expect(result.base64Data.length > 0).toBe(true);

        this.didAdd = true;
        Log.log(TestConstants.storage.testName, addStringSuccessTitle, result.mimeType);
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
        Log.log(
          TestConstants.storage.testName,
          removeTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.storage.name);
        expect(error.details.type).toBe(StorageError.type.InvalidMembers.type);
        expect(error.details.details.invalidMembers).toContain(Constants.params.folder);
        expect(error.details.details.invalidMembers).toContain(Constants.params.fileName);
        Log.log(TestConstants.storage.testName, removeTitle, error.details);
      }

      done();
    });

    it('throws an error for a non-existent file', async (done) => {
      try {
        const result = await CloudStorage.remove(
          TestConstants.utils.strings.emptyString,
          Utils.newUuid()
        );
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.storage.testName,
          removeTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.storage.name);
        expect(error.details.type).toBe(StorageError.type.FileDoesNotExist.type);
        Log.log(TestConstants.storage.testName, removeTitle, error.details);
      }

      done();
    });

    const successRemoveTitle = 'Remove success';
    describe(successRemoveTitle, () => {
      beforeEach(async (done) => {
        this.fileInfo = await Helper.copyLocalFile(TestConstants.files.image001);
        await CloudStorage.add(
          TestConstants.utils.strings.emptyString,
          this.fileInfo.filename,
          this.fileInfo.path
        );
        done();
      });

      afterEach(() => {
        delete this.fileInfo;
      });

      it('removes a file from cloud storage', async (done) => {
        await CloudStorage.remove(TestConstants.utils.strings.emptyString, this.fileInfo.filename);

        // Verify result from cloud storage
        try {
          const result = await CloudStorage.get(
            TestConstants.utils.strings.emptyString,
            this.fileInfo.filename
          );
          expect(result).not.toBeDefined();
          Log.log(
            TestConstants.storage.testName,
            successRemoveTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.storage.name);
          expect(error.details.type).toBe(StorageError.type.FileDoesNotExist.type);
          Log.log(TestConstants.storage.testName, removeTitle, error.details);
        }

        done();
      }, Helper.customTimeout);
    });
  });
});

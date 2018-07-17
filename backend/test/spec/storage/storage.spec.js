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
    const it1 = 'throws an error for invalid folder and filename';
    it(it1, async (done) => {
      Log.it(TestConstants.storage.testName, getTitle, it1, true);
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

      Log.it(TestConstants.storage.testName, getTitle, it1, false);
      done();
    });

    const it2 = 'throws an error for a non-existent file';
    it(it2, async (done) => {
      Log.it(TestConstants.storage.testName, getTitle, it2, true);
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

      Log.it(TestConstants.storage.testName, getTitle, it2, false);
      done();
    });

    const successGetTitle = 'Get success';
    describe(successGetTitle, () => {
      beforeEach(async (done) => {
        Log.beforeEach(TestConstants.storage.testName, successGetTitle, true);
        this.fileInfo = await Helper.copyLocalFile(TestConstants.files.image001);
        await CloudStorage.add(
          TestConstants.utils.strings.emptyString,
          this.fileInfo.filename,
          this.fileInfo.path
        );
        Log.beforeEach(TestConstants.storage.testName, successGetTitle, false);
        done();
      });

      afterEach(async (done) => {
        Log.afterEach(TestConstants.storage.testName, successGetTitle, true);
        await CloudStorage.remove(TestConstants.utils.strings.emptyString, this.fileInfo.filename);
        delete this.fileInfo;
        Log.afterEach(TestConstants.storage.testName, successGetTitle, false);
        done();
      });

      const it3 = 'gets an image from cloud storage';
      it(it3, async (done) => {
        Log.it(TestConstants.storage.testName, successGetTitle, it3, true);
        const result = await CloudStorage.get(
          TestConstants.utils.strings.emptyString,
          this.fileInfo.filename
        );
        expect(result.mimeType).toBe(Constants.media.mimeTypes.png);
        expect(result.base64Data.length).toBeGreaterThan(0);
        Log.log(TestConstants.storage.testName, successGetTitle, result.mimeType);
        Log.it(TestConstants.storage.testName, successGetTitle, it3, false);
        done();
      }, Helper.customTimeout);
    });
  });

  const addTitle = 'Add';
  describe(addTitle, () => {
    beforeEach(async (done) => {
      Log.beforeEach(TestConstants.storage.testName, addTitle, true);
      this.fileInfo = await Helper.copyLocalFile(TestConstants.files.image001);
      await CloudStorage.add(
        TestConstants.utils.strings.emptyString,
        this.fileInfo.filename,
        this.fileInfo.path
      );
      Log.beforeEach(TestConstants.storage.testName, addTitle, false);
      done();
    });

    afterEach(async (done) => {
      Log.afterEach(TestConstants.storage.testName, addTitle, true);
      await CloudStorage.remove(TestConstants.utils.strings.emptyString, this.fileInfo.filename);
      delete this.fileInfo;
      Log.afterEach(TestConstants.storage.testName, addTitle, false);
      done();
    });

    const it1 = 'throws an error for invalid folder, filename, and file path';
    it(it1, async (done) => {
      Log.it(TestConstants.storage.testName, addTitle, it1, true);
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

      Log.it(TestConstants.storage.testName, addTitle, it1, false);
      done();
    });

    const it2 = 'throws an error for a non-existent file path';
    it(it2, async (done) => {
      Log.it(TestConstants.storage.testName, addTitle, it2, true);
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

      Log.it(TestConstants.storage.testName, addTitle, it2, false);
      done();
    });

    const it3 = 'throws an error for a non-file file path';
    it(it3, async (done) => {
      Log.it(TestConstants.storage.testName, addTitle, it3, true);
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

      Log.it(TestConstants.storage.testName, addTitle, it3, false);
      done();
    });

    const it4 = 'throws an error for an already-existing file';
    it(it4, async (done) => {
      Log.it(TestConstants.storage.testName, addTitle, it4, true);
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
      Log.it(TestConstants.storage.testName, addTitle, it4, false);
      done();
    }, Helper.customTimeout);

    const successAddTitle = 'Add success';
    describe(successAddTitle, () => {
      beforeEach(async (done) => {
        Log.beforeEach(TestConstants.storage.testName, successAddTitle, true);
        this.fileInfo2 = await Helper.copyLocalFile(TestConstants.files.image001);
        Log.beforeEach(TestConstants.storage.testName, successAddTitle, false);
        done();
      });

      afterEach(async (done) => {
        Log.afterEach(TestConstants.storage.testName, successAddTitle, true);
        await CloudStorage.remove(TestConstants.utils.strings.emptyString, this.fileInfo2.filename);
        delete this.fileInfo2;
        Log.afterEach(TestConstants.storage.testName, successAddTitle, false);
        done();
      });

      const it5 = 'adds a file to cloud storage';
      it(it5, async (done) => {
        Log.it(TestConstants.storage.testName, successAddTitle, it5, true);
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
        expect(result.base64Data.length).toBeGreaterThan(0);
        Log.log(TestConstants.storage.testName, successAddTitle, result.mimeType);
        Log.it(TestConstants.storage.testName, successAddTitle, it5, false);
        done();
      }, Helper.customTimeout);
    });
  });

  const addStringTitle = 'Add string';
  describe(addStringTitle, () => {
    beforeEach(async (done) => {
      Log.beforeEach(TestConstants.storage.testName, addStringTitle, true);
      this.didAdd = false;
      this.data = Utils.newUuid();
      this.filename = Utils.newUuid();
      this.existingFilename = Utils.newUuid();
      await CloudStorage.addString(
        TestConstants.utils.strings.emptyString,
        this.existingFilename,
        Utils.newUuid()
      );
      Log.beforeEach(TestConstants.storage.testName, addStringTitle, false);
      done();
    });

    afterEach(async (done) => {
      Log.afterEach(TestConstants.storage.testName, addStringTitle, true);
      await CloudStorage.remove(TestConstants.utils.strings.emptyString, this.existingFilename);
      if (this.didAdd === true) {
        await CloudStorage.remove(TestConstants.utils.strings.emptyString, this.filename);
      }

      delete this.data;
      delete this.didAdd;
      delete this.filename;
      delete this.existingFilename;
      Log.afterEach(TestConstants.storage.testName, addStringTitle, false);
      done();
    });

    const it1 = 'throws an error for invalid folder, filename, and string';
    it(it1, async (done) => {
      Log.it(TestConstants.storage.testName, addStringTitle, it1, true);
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

      Log.it(TestConstants.storage.testName, addStringTitle, it1, false);
      done();
    });

    const it2 = 'throws an error for an empty filename and string';
    it(it2, async (done) => {
      Log.it(TestConstants.storage.testName, addStringTitle, it2, true);
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

      Log.it(TestConstants.storage.testName, addStringTitle, it2, false);
      done();
    });

    const it3 = 'throws an error for an already-existing file';
    it(it3, async (done) => {
      Log.it(TestConstants.storage.testName, addStringTitle, it3, true);
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

      Log.it(TestConstants.storage.testName, addStringTitle, it3, false);
      done();
    }, Helper.customTimeout);

    const addStringSuccessTitle = 'Add string success';
    describe(addStringSuccessTitle, () => {
      const it4 = 'adds a string to cloud storage';
      it(it4, async (done) => {
        Log.it(TestConstants.storage.testName, addStringSuccessTitle, it4, true);
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
        expect(result.base64Data.length).toBeGreaterThan(0);

        this.didAdd = true;
        Log.log(TestConstants.storage.testName, addStringSuccessTitle, result.mimeType);
        Log.it(TestConstants.storage.testName, addStringSuccessTitle, it4, false);
        done();
      });
    });
  });

  const removeTitle = 'Remove';
  describe(removeTitle, () => {
    const it1 = 'throws an error for invalid folder and filename';
    it(it1, async (done) => {
      Log.it(TestConstants.storage.testName, removeTitle, it1, true);
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

      Log.it(TestConstants.storage.testName, removeTitle, it1, false);
      done();
    });

    const it2 = 'throws an error for a non-existent file';
    it(it2, async (done) => {
      Log.it(TestConstants.storage.testName, removeTitle, it2, true);
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

      Log.it(TestConstants.storage.testName, removeTitle, it2, false);
      done();
    });

    const successRemoveTitle = 'Remove success';
    describe(successRemoveTitle, () => {
      beforeEach(async (done) => {
        Log.beforeEach(TestConstants.storage.testName, successRemoveTitle, true);
        this.fileInfo = await Helper.copyLocalFile(TestConstants.files.image001);
        await CloudStorage.add(
          TestConstants.utils.strings.emptyString,
          this.fileInfo.filename,
          this.fileInfo.path
        );
        Log.beforeEach(TestConstants.storage.testName, successRemoveTitle, false);
        done();
      });

      afterEach(() => {
        Log.afterEach(TestConstants.storage.testName, successRemoveTitle, true);
        delete this.fileInfo;
        Log.afterEach(TestConstants.storage.testName, successRemoveTitle, false);
      });

      const it3 = 'removes a file from cloud storage';
      it(it3, async (done) => {
        Log.it(TestConstants.storage.testName, successRemoveTitle, it3, true);
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
          Log.log(TestConstants.storage.testName, successRemoveTitle, error.details);
        }

        Log.it(TestConstants.storage.testName, successRemoveTitle, it3, false);
        done();
      }, Helper.customTimeout);
    });
  });

  const bulkRemoveTitle = 'Bulk remove';
  describe(bulkRemoveTitle, () => {
    const it1 = 'throws an error for invalid folder and filenames';
    it(it1, async (done) => {
      Log.it(TestConstants.storage.testName, bulkRemoveTitle, it1, true);
      try {
        const result = await CloudStorage.bulkRemove();
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.storage.testName,
          bulkRemoveTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.storage.name);
        expect(error.details.type).toBe(StorageError.type.InvalidMembers.type);
        expect(error.details.details.invalidMembers).toContain(Constants.params.folder);
        expect(error.details.details.invalidMembers).toContain(Constants.params.fileNames);
        Log.log(TestConstants.storage.testName, bulkRemoveTitle, error.details);
      }

      Log.it(TestConstants.storage.testName, bulkRemoveTitle, it1, false);
      done();
    }, Helper.customTimeout);

    const it2 = 'throws an error for invalid folder and array with invalid filename';
    it(it2, async (done) => {
      Log.it(TestConstants.storage.testName, bulkRemoveTitle, it2, true);
      const filenames = [Utils.newUuid(), TestConstants.utils.strings.tab];
      try {
        const result = await CloudStorage.bulkRemove(
          TestConstants.utils.strings.emptyString,
          filenames
        );
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.storage.testName,
          bulkRemoveTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.storage.name);
        expect(error.details.type).toBe(StorageError.type.InvalidMembers.type);
        expect(error.details.details.invalidMembers).toContain(Constants.params.fileName);
        Log.log(TestConstants.storage.testName, bulkRemoveTitle, error.details);
      }

      Log.it(TestConstants.storage.testName, bulkRemoveTitle, it2, false);
      done();
    }, Helper.customTimeout);

    const it3 = 'throws an error for a non-existent file';
    it(it3, async (done) => {
      Log.it(TestConstants.storage.testName, bulkRemoveTitle, it3, true);
      const filenames = [Utils.newUuid()];
      try {
        const result = await CloudStorage.bulkRemove(
          TestConstants.utils.strings.emptyString,
          filenames
        );
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.storage.testName,
          bulkRemoveTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.storage.name);
        expect(error.details.type).toBe(StorageError.type.FileDoesNotExist.type);
        Log.log(TestConstants.storage.testName, bulkRemoveTitle, error.details);
      }

      Log.it(TestConstants.storage.testName, bulkRemoveTitle, it3, false);
      done();
    }, Helper.customTimeout);

    const successBulkRemoveTitle = 'Bulk remove success';
    describe(successBulkRemoveTitle, () => {
      beforeEach(async (done) => {
        Log.beforeEach(TestConstants.storage.testName, successBulkRemoveTitle, true);
        this.filename1 = Utils.newUuid();
        this.filename2 = Utils.newUuid();
        const addFile1 = CloudStorage.addString(
          TestConstants.utils.strings.emptyString,
          this.filename1,
          Utils.newUuid()
        );
        const addFile2 = CloudStorage.addString(
          TestConstants.utils.strings.emptyString,
          this.filename2,
          Utils.newUuid()
        );

        await Promise.all([addFile1, addFile2]);
        Log.beforeEach(TestConstants.storage.testName, successBulkRemoveTitle, false);
        done();
      });

      afterEach(() => {
        Log.afterEach(TestConstants.storage.testName, successBulkRemoveTitle, true);
        delete this.filename1;
        delete this.filename2;
        Log.afterEach(TestConstants.storage.testName, successBulkRemoveTitle, false);
      });

      const it4 = 'removes multiple files from cloud storage';
      it(it4, async (done) => {
        Log.it(TestConstants.storage.testName, successBulkRemoveTitle, it4, true);
        await CloudStorage.bulkRemove(
          TestConstants.utils.strings.emptyString,
          [this.filename1, this.filename2]
        );

        // Verify results for each file from cloud storage
        try {
          const result = await CloudStorage.get(
            TestConstants.utils.strings.emptyString,
            this.filename1
          );
          expect(result).not.toBeDefined();
          Log.log(
            TestConstants.storage.testName,
            successBulkRemoveTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.storage.name);
          expect(error.details.type).toBe(StorageError.type.FileDoesNotExist.type);
          Log.log(TestConstants.storage.testName, successBulkRemoveTitle, error.details);
        }

        try {
          const result = await CloudStorage.get(
            TestConstants.utils.strings.emptyString,
            this.filename2
          );
          expect(result).not.toBeDefined();
          Log.log(
            TestConstants.storage.testName,
            successBulkRemoveTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.storage.name);
          expect(error.details.type).toBe(StorageError.type.FileDoesNotExist.type);
          Log.log(TestConstants.storage.testName, successBulkRemoveTitle, error.details);
        }

        Log.it(TestConstants.storage.testName, successBulkRemoveTitle, it4, false);
        done();
      }, Helper.customTimeout);
    });
  });
});

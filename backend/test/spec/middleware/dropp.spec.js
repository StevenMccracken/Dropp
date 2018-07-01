const Log = require('../../logger');
const Helper = require('../../helper');
const User = require('../../../src/models/User');
const TestConstants = require('../../constants');
const Dropp = require('../../../src/models/Dropp');
const Utils = require('../../../src/utilities/utils');
const Location = require('../../../src/models/Location');
const Firebase = require('../../../src/firebase/firebase');
const UserAccessor = require('../../../src/database/user');
const DroppError = require('../../../src/errors/DroppError');
const CloudStorage = require('../../../src/storage/storage');
const DroppAccessor = require('../../../src/database/dropp');
const Constants = require('../../../src/utilities/constants');
const StorageError = require('../../../src/errors/StorageError');
const DroppMiddleware = require('../../../src/middleware/dropp');

Firebase.start(process.env.MOCK === '1');
/* eslint-disable no-undef */
describe(TestConstants.middleware.dropp.testName, () => {
  beforeEach(async (done) => {
    Log.beforeEach(
      TestConstants.middleware.dropp.testName,
      TestConstants.middleware.dropp.testName,
      true
    );
    const uuid = Utils.newUuid();
    this.user = new User({
      username: uuid,
      email: TestConstants.params.uuidEmail(),
    });

    await UserAccessor.create(this.user, uuid);
    Log.beforeEach(
      TestConstants.middleware.dropp.testName,
      TestConstants.middleware.dropp.testName,
      false
    );
    done();
  });

  afterEach(async (done) => {
    Log.afterEach(
      TestConstants.middleware.dropp.testName,
      TestConstants.middleware.dropp.testName,
      true
    );
    await UserAccessor.remove(this.user);
    delete this.user;
    Log.afterEach(
      TestConstants.middleware.dropp.testName,
      TestConstants.middleware.dropp.testName,
      false
    );
    done();
  });

  const getDroppTitle = 'Get dropp';
  describe(getDroppTitle, () => {
    beforeEach(async (done) => {
      Log.beforeEach(TestConstants.middleware.dropp.testName, getDroppTitle, true);
      this.location = new Location({
        latitude: TestConstants.params.defaultLocation,
        longitude: TestConstants.params.defaultLocation,
      });

      this.dropp = new Dropp({
        timestamp: TestConstants.params.defaultTimestamp,
        media: false,
        text: Utils.newUuid(),
        location: this.location,
        username: this.user.username,
      });

      await DroppAccessor.add(this.dropp);
      this.droppIdDetails = { id: this.dropp.id };
      Log.beforeEach(TestConstants.middleware.dropp.testName, getDroppTitle, false);
      done();
    });

    afterEach(async (done) => {
      Log.afterEach(TestConstants.middleware.dropp.testName, getDroppTitle, true);
      await DroppAccessor.remove(this.dropp);
      delete this.location;
      delete this.dropp;
      Log.afterEach(TestConstants.middleware.dropp.testName, getDroppTitle, false);
      done();
    });

    const it1 = 'throws an error for an invalid current user';
    it(it1, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, getDroppTitle, it1, true);
      try {
        const result = await DroppMiddleware.get(null, this.droppIdDetails);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.dropp.testName,
          getDroppTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(TestConstants.middleware.dropp.testName, getDroppTitle, error.details);
      }

      Log.it(TestConstants.middleware.dropp.testName, getDroppTitle, it1, false);
      done();
    });

    const it2 = 'throws an error for null details';
    it(it2, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, getDroppTitle, it2, true);
      try {
        const result = await DroppMiddleware.get(this.user, null);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.dropp.testName,
          getDroppTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe(Constants.params.id);
        Log.log(TestConstants.middleware.dropp.testName, getDroppTitle, error.details);
      }

      Log.it(TestConstants.middleware.dropp.testName, getDroppTitle, it2, false);
      done();
    });

    const it3 = 'throws an error for an invalid dropp ID';
    it(it3, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, getDroppTitle, it3, true);
      const invalidDetails = { id: TestConstants.params.invalidChars.dollar };
      try {
        const result = await DroppMiddleware.get(this.user, invalidDetails);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.dropp.testName,
          getDroppTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe(Constants.params.id);
        Log.log(TestConstants.middleware.dropp.testName, getDroppTitle, error.details);
      }

      Log.it(TestConstants.middleware.dropp.testName, getDroppTitle, it3, false);
      done();
    });

    const it4 = 'throws an error for a non-existent dropp';
    it(it4, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, getDroppTitle, it4, true);
      const details = { id: Utils.newUuid() };
      try {
        const result = await DroppMiddleware.get(this.user, details);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.dropp.testName,
          getDroppTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.ResourceDNE.type);
        expect(error.details.error.message)
          .toBe(TestConstants.messages.doesNotExist(Constants.params.dropp));
        Log.log(TestConstants.middleware.dropp.testName, getDroppTitle, error.details);
      }

      Log.it(TestConstants.middleware.dropp.testName, getDroppTitle, it4, false);
      done();
    });

    const it5 = 'gets a dropp';
    it(it5, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, getDroppTitle, it5, true);
      const result = await DroppMiddleware.get(this.user, this.droppIdDetails);
      expect(result.id).toBe(this.dropp.id);
      expect(result.text).toBe(this.dropp.text);
      expect(result.media).toBe(this.dropp.media);
      expect(result.username).toBe(this.dropp.username);
      expect(result.timestamp).toBe(this.dropp.timestamp);
      expect(result.location.latitude).toBe(this.dropp.location.latitude);
      expect(result.location.longitude).toBe(this.dropp.location.longitude);
      Log.log(TestConstants.middleware.dropp.testName, getDroppTitle, result);
      Log.it(TestConstants.middleware.dropp.testName, getDroppTitle, it5, false);
      done();
    });
  });

  const getDroppPhotoTitle = 'Get dropp photo';
  describe(getDroppPhotoTitle, () => {
    beforeEach(async (done) => {
      Log.beforeEach(TestConstants.middleware.dropp.testName, getDroppPhotoTitle, true);
      this.dropp = new Dropp({
        text: TestConstants.params.test,
        media: false,
        username: this.user.username,
        timestamp: TestConstants.params.defaultTimestamp,
        location: new Location({
          latitude: TestConstants.params.defaultLocation,
          longitude: TestConstants.params.defaultLocation,
        }),
      });

      await DroppAccessor.add(this.dropp);
      this.details = { id: this.dropp.id };
      Log.beforeEach(TestConstants.middleware.dropp.testName, getDroppPhotoTitle, false);
      done();
    });

    afterEach(async (done) => {
      Log.afterEach(TestConstants.middleware.dropp.testName, getDroppPhotoTitle, true);
      await DroppMiddleware.remove(this.user, this.details);
      delete this.dropp;
      delete this.details;
      Log.afterEach(TestConstants.middleware.dropp.testName, getDroppPhotoTitle, false);
      done();
    });

    const it1 = 'throws an error for an invalid current user';
    it(it1, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, getDroppPhotoTitle, it1, true);
      try {
        const result = await DroppMiddleware.getPhoto(null, this.details);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.dropp.testName,
          getDroppPhotoTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(TestConstants.middleware.dropp.testName, getDroppPhotoTitle, error.details);
      }

      Log.it(TestConstants.middleware.dropp.testName, getDroppPhotoTitle, it1, false);
      done();
    });

    const it2 = 'throws an error for null details';
    it(it2, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, getDroppPhotoTitle, it2, true);
      try {
        const result = await DroppMiddleware.getPhoto(this.user, null);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.dropp.testName,
          getDroppPhotoTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe(Constants.params.id);
        Log.log(TestConstants.middleware.dropp.testName, getDroppPhotoTitle, error.details);
      }

      Log.it(TestConstants.middleware.dropp.testName, getDroppPhotoTitle, it2, false);
      done();
    });

    const it3 = 'throws an error for an invalid dropp ID';
    it(it3, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, getDroppPhotoTitle, it3, true);
      const invalidDetails = { id: TestConstants.params.invalidChars.dollar };
      try {
        const result = await DroppMiddleware.getPhoto(this.user, invalidDetails);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.dropp.testName,
          getDroppPhotoTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe(Constants.params.id);
        Log.log(TestConstants.middleware.dropp.testName, getDroppPhotoTitle, error.details);
      }

      Log.it(TestConstants.middleware.dropp.testName, getDroppPhotoTitle, it3, false);
      done();
    });

    const it4 = 'throws an error for a non-existent dropp';
    it(it4, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, getDroppPhotoTitle, it4, true);
      const details = { id: Utils.newUuid() };
      try {
        const result = await DroppMiddleware.getPhoto(this.user, details);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.dropp.testName,
          getDroppPhotoTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.ResourceDNE.type);
        expect(error.details.error.message)
          .toBe(TestConstants.messages.doesNotExist(Constants.params.dropp));
        Log.log(TestConstants.middleware.dropp.testName, getDroppPhotoTitle, error.details);
      }

      Log.it(TestConstants.middleware.dropp.testName, getDroppPhotoTitle, it4, false);
      done();
    });

    const it5 = 'throws an error for a dropp with no media';
    it(it5, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, getDroppPhotoTitle, it5, true);
      try {
        const result = await DroppMiddleware.getPhoto(this.user, this.details);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.dropp.testName,
          getDroppPhotoTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message)
          .toBe(Constants.middleware.dropp.messages.errors.noMedia);
        Log.log(TestConstants.middleware.dropp.testName, getDroppPhotoTitle, error.details);
      }

      Log.it(TestConstants.middleware.dropp.testName, getDroppPhotoTitle, it5, false);
      done();
    });

    const getDroppPhotoSuccessTitle = 'Get dropp photo success';
    describe(getDroppPhotoSuccessTitle, () => {
      let originalTimeout;
      beforeEach(async (done) => {
        Log.beforeEach(TestConstants.middleware.dropp.testName, getDroppPhotoSuccessTitle, true);
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = Helper.customTimeout;

        this.dropp2 = new Dropp({
          text: TestConstants.params.test,
          media: true,
          username: this.user.username,
          timestamp: TestConstants.params.defaultTimestamp,
          location: new Location({
            latitude: TestConstants.params.defaultLocation,
            longitude: TestConstants.params.defaultLocation,
          }),
        });

        await DroppAccessor.add(this.dropp2);
        this.details2 = { id: this.dropp2.id };
        const result = await Helper.copyLocalFile(TestConstants.files.image001);
        const details = {
          id: this.dropp2.id,
          filePath: result.path,
        };

        await DroppMiddleware.addPhoto(this.user, details);
        Log.beforeEach(TestConstants.middleware.dropp.testName, getDroppPhotoSuccessTitle, false);
        done();
      });

      afterEach(async (done) => {
        Log.afterEach(TestConstants.middleware.dropp.testName, getDroppPhotoSuccessTitle, true);
        await DroppMiddleware.remove(this.user, this.details2);
        delete this.dropp2;
        delete this.details2;

        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
        Log.afterEach(TestConstants.middleware.dropp.testName, getDroppPhotoSuccessTitle, false);
        done();
      });

      const it6 = 'get\'s a dropp\'s photo data';
      it(it6, async (done) => {
        Log.it(TestConstants.middleware.dropp.testName, getDroppPhotoSuccessTitle, it6, true);
        const result = await DroppMiddleware.getPhoto(this.user, this.details2);
        expect(result.success.mimeType).toBe(Constants.media.mimeTypes.png);
        expect(result.success.base64Data.length > 0).toBe(true);
        Log.log(
          TestConstants.middleware.dropp.testName,
          getDroppPhotoSuccessTitle,
          result.success.mimeType
        );
        Log.it(TestConstants.middleware.dropp.testName, getDroppPhotoSuccessTitle, it6, false);
        done();
      }, Helper.customTimeout);
    });
  });

  const getByUserTitle = 'Get dropps by user';
  describe(getByUserTitle, () => {
    beforeEach(async (done) => {
      Log.beforeEach(TestConstants.middleware.dropp.testName, getByUserTitle, true);
      const uuid = Utils.newUuid();
      this.user2 = new User({
        username: uuid,
        email: TestConstants.params.uuidEmail(),
      });

      await UserAccessor.create(this.user2, uuid);
      Log.beforeEach(TestConstants.middleware.dropp.testName, getByUserTitle, false);
      done();
    });

    afterEach(async (done) => {
      Log.afterEach(TestConstants.middleware.dropp.testName, getByUserTitle, true);
      await UserAccessor.remove(this.user2);
      delete this.user2;
      Log.afterEach(TestConstants.middleware.dropp.testName, getByUserTitle, false);
      done();
    });

    const it1 = 'throws an error for an invalid current user';
    it(it1, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, getByUserTitle, it1, true);
      try {
        const result = await DroppMiddleware.getByUser(null, this.droppIdDetails);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.dropp.testName,
          getByUserTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(TestConstants.middleware.dropp.testName, getByUserTitle, error.details);
      }

      Log.it(TestConstants.middleware.dropp.testName, getByUserTitle, it1, false);
      done();
    });

    const it2 = 'throws an error for null details';
    it(it2, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, getByUserTitle, it2, true);
      try {
        const result = await DroppMiddleware.getByUser(this.user, null);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.dropp.testName,
          getByUserTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe(Constants.params.username);
        Log.log(TestConstants.middleware.dropp.testName, getByUserTitle, error.details);
      }

      Log.it(TestConstants.middleware.dropp.testName, getByUserTitle, it2, false);
      done();
    });

    const it3 = 'throws an error for an invalid username';
    it(it3, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, getByUserTitle, it3, true);
      const invalidDetails = { username: TestConstants.params.invalidChars.dollar };
      try {
        const result = await DroppMiddleware.getByUser(this.user, invalidDetails);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.dropp.testName,
          getByUserTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe(Constants.params.username);
        Log.log(TestConstants.middleware.dropp.testName, getByUserTitle, error.details);
      }

      Log.it(TestConstants.middleware.dropp.testName, getByUserTitle, it3, false);
      done();
    });

    const it4 = 'throws an error for a non-existent user';
    it(it4, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, getByUserTitle, it4, true);
      const details = { username: Utils.newUuid() };
      try {
        const result = await DroppMiddleware.getByUser(this.user, details);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.dropp.testName,
          getByUserTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.ResourceDNE.type);
        expect(error.details.error.message)
          .toBe(TestConstants.messages.doesNotExist(Constants.params.user));
        Log.log(
          TestConstants.middleware.dropp.testName,
          getByUserTitle,
          error.details
        );
      }

      Log.it(TestConstants.middleware.dropp.testName, getByUserTitle, it4, false);
      done();
    });

    const it5 = 'throws an error for an unfollowed user';
    it(it5, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, getByUserTitle, it5, true);
      const details = { username: this.user2.username };
      try {
        const result = await DroppMiddleware.getByUser(this.user, details);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.dropp.testName,
          getByUserTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message).toBe(Constants.middleware.messages.mustFollowUser);
        Log.log(TestConstants.middleware.dropp.testName, getByUserTitle, error.details);
      }

      Log.it(TestConstants.middleware.dropp.testName, getByUserTitle, it5, false);
      done();
    });

    const getDroppsByUserSuccessTitle = 'Get dropps by user success';
    describe(getDroppsByUserSuccessTitle, () => {
      beforeEach(async (done) => {
        Log.beforeEach(TestConstants.middleware.dropp.testName, getDroppsByUserSuccessTitle, true);
        this.location = new Location({
          latitude: TestConstants.params.defaultLocation,
          longitude: TestConstants.params.defaultLocation,
        });

        this.dropp1 = new Dropp({
          location: this.location,
          media: false,
          text: TestConstants.params.test,
          timestamp: TestConstants.params.defaultTimestamp,
          username: this.user.username,
        });

        this.dropp2 = new Dropp({
          location: this.location,
          media: false,
          text: TestConstants.params.test,
          timestamp: TestConstants.params.defaultTimestamp,
          username: this.user2.username,
        });

        await DroppAccessor.add(this.dropp1);
        await DroppAccessor.add(this.dropp2);
        await UserAccessor.addFollow(this.user, this.user2);
        Log.beforeEach(TestConstants.middleware.dropp.testName, getDroppsByUserSuccessTitle, false);
        done();
      });

      afterEach(async (done) => {
        Log.afterEach(TestConstants.middleware.dropp.testName, getDroppsByUserSuccessTitle, true);
        await DroppAccessor.remove(this.dropp1);
        await DroppAccessor.remove(this.dropp2);
        delete this.location;
        delete this.dropp1;
        delete this.dropp2;
        await UserAccessor.removeFollow(this.user, this.user2);
        Log.afterEach(TestConstants.middleware.dropp.testName, getDroppsByUserSuccessTitle, false);
        done();
      });

      const it6 = 'gets dropps posted by the same user';
      it(it6, async (done) => {
        Log.it(TestConstants.middleware.dropp.testName, getByUserTitle, it6, true);
        const details = { username: this.user.username };
        const result = await DroppMiddleware.getByUser(this.user, details);
        expect(result.success.count).toBe(1);
        expect(result.success.dropps[0].id).toBe(this.dropp1.id);
        Log.log(TestConstants.middleware.dropp.testName, getDroppsByUserSuccessTitle, result);
        Log.it(TestConstants.middleware.dropp.testName, getByUserTitle, it6, false);
        done();
      });

      const it7 = 'gets dropps posted by a user\'s follow';
      it(it7, async (done) => {
        Log.it(TestConstants.middleware.dropp.testName, getDroppsByUserSuccessTitle, it7, true);
        const details = { username: this.user2.username };
        const result = await DroppMiddleware.getByUser(this.user, details);
        expect(result.success.count).toBe(1);
        expect(result.success.dropps[0].id).toBe(this.dropp2.id);
        Log.log(TestConstants.middleware.dropp.testName, getDroppsByUserSuccessTitle, result);
        Log.it(TestConstants.middleware.dropp.testName, getDroppsByUserSuccessTitle, it7, false);
        done();
      });
    });
  });

  const getByFollowsTitle = 'Get dropps by follows';
  describe(getByFollowsTitle, () => {
    beforeEach(async (done) => {
      Log.beforeEach(TestConstants.middleware.dropp.testName, getByFollowsTitle, true);
      const uuid = Utils.newUuid();
      this.user2 = new User({
        username: uuid,
        email: TestConstants.params.uuidEmail(),
      });

      await UserAccessor.create(this.user2, uuid);
      await UserAccessor.addFollow(this.user, this.user2);
      this.location = new Location({
        latitude: TestConstants.params.defaultLocation,
        longitude: TestConstants.params.defaultLocation,
      });

      this.dropp1 = new Dropp({
        location: this.location,
        media: false,
        text: TestConstants.params.test,
        timestamp: TestConstants.params.defaultTimestamp,
        username: this.user2.username,
      });

      await DroppAccessor.add(this.dropp1);
      Log.beforeEach(TestConstants.middleware.dropp.testName, getByFollowsTitle, false);
      done();
    });

    afterEach(async (done) => {
      Log.afterEach(TestConstants.middleware.dropp.testName, getByFollowsTitle, true);
      await DroppAccessor.remove(this.dropp1);
      await UserAccessor.removeFollow(this.user, this.user2);
      await UserAccessor.remove(this.user2);
      delete this.user2;
      delete this.location;
      delete this.dropp1;
      Log.afterEach(TestConstants.middleware.dropp.testName, getByFollowsTitle, false);
      done();
    });

    const it1 = 'throws an error for an invalid current user';
    it(it1, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, getByFollowsTitle, it1, true);
      try {
        const result = await DroppMiddleware.getByFollows(null, this.droppIdDetails);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.dropp.testName,
          getByFollowsTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(TestConstants.middleware.dropp.testName, getByFollowsTitle, error.details);
      }

      Log.it(TestConstants.middleware.dropp.testName, getByFollowsTitle, it1, false);
      done();
    });

    const it2 = 'throws an error for null details';
    it(it2, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, getByFollowsTitle, it2, true);
      try {
        const result = await DroppMiddleware.getByFollows(this.user, null);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.dropp.testName,
          getByFollowsTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe(Constants.params.username);
        Log.log(TestConstants.middleware.dropp.testName, getByFollowsTitle, error.details);
      }

      Log.it(TestConstants.middleware.dropp.testName, getByFollowsTitle, it2, false);
      done();
    });

    const it3 = 'throws an error for an invalid username';
    it(it3, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, getByFollowsTitle, it3, true);
      const invalidDetails = { username: TestConstants.params.invalidChars.dollar };
      try {
        const result = await DroppMiddleware.getByFollows(this.user, invalidDetails);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.dropp.testName,
          getByFollowsTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe(Constants.params.username);
        Log.log(TestConstants.middleware.dropp.testName, getByFollowsTitle, error.details);
      }

      Log.it(TestConstants.middleware.dropp.testName, getByFollowsTitle, it3, false);
      done();
    });

    const it4 = 'throws an error for a different user';
    it(it4, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, getByFollowsTitle, it4, true);
      const details = { username: this.user2.username };
      try {
        const result = await DroppMiddleware.getByFollows(this.user, details);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.dropp.testName,
          getByFollowsTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message).toBe(Constants.middleware.messages.unauthorizedAccess);
        Log.log(TestConstants.middleware.dropp.testName, getByFollowsTitle, error.details);
      }

      Log.it(TestConstants.middleware.dropp.testName, getByFollowsTitle, it4, false);
      done();
    });

    const it5 = 'throws an error for a non-existent user';
    it(it5, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, getByFollowsTitle, it5, true);
      const uuid = Utils.newUuid();
      const user = new User({
        username: uuid,
        email: TestConstants.params.uuidEmail(),
      });
      const details = { username: user.username };

      try {
        const result = await DroppMiddleware.getByFollows(user, details);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.dropp.testName,
          getByFollowsTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(TestConstants.middleware.dropp.testName, getByFollowsTitle, error.details);
      }

      Log.it(TestConstants.middleware.dropp.testName, getByFollowsTitle, it5, false);
      done();
    });

    const it6 = 'returns dropps posted by the user\'s follows';
    it(it6, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, getByFollowsTitle, it6, true);
      const details = { username: this.user.username };
      const result = await DroppMiddleware.getByFollows(this.user, details);
      expect(result.success.count).toBe(1);
      expect(result.success.dropps[0].id).toBe(this.dropp1.id);
      Log.log(TestConstants.middleware.dropp.testName, getByFollowsTitle, result);
      Log.it(TestConstants.middleware.dropp.testName, getByFollowsTitle, it6, false);
      done();
    });
  });

  const getByLocationTitle = 'Get dropps by location';
  describe(getByLocationTitle, () => {
    beforeEach(async (done) => {
      Log.beforeEach(TestConstants.middleware.dropp.testName, getByLocationTitle, true);
      const coordinate = Math.random() * 100;
      this.location = new Location({
        latitude: coordinate,
        longitude: coordinate,
      });

      this.dropp1 = new Dropp({
        location: this.location,
        media: false,
        text: TestConstants.params.test,
        timestamp: TestConstants.params.defaultTimestamp,
        username: this.user.username,
      });

      await DroppAccessor.add(this.dropp1);
      Log.beforeEach(TestConstants.middleware.dropp.testName, getByLocationTitle, false);
      done();
    });

    afterEach(async (done) => {
      Log.afterEach(TestConstants.middleware.dropp.testName, getByLocationTitle, true);
      await DroppAccessor.remove(this.dropp1);
      delete this.dropp1;
      delete this.location;
      Log.afterEach(TestConstants.middleware.dropp.testName, getByLocationTitle, false);
      done();
    });

    const it1 = 'throws an error for an invalid current user';
    it(it1, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, getByFollowsTitle, it1, true);
      try {
        const result = await DroppMiddleware.getByLocation(null, this.location.databaseData);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.dropp.testName,
          getByLocationTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(TestConstants.middleware.dropp.testName, getByLocationTitle, error.details);
      }

      Log.it(TestConstants.middleware.dropp.testName, getByFollowsTitle, it1, false);
      done();
    });

    const it2 = 'throws an error for null details';
    it(it2, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, getByLocationTitle, it2, true);
      try {
        const result = await DroppMiddleware.getByLocation(this.user, null);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.dropp.testName,
          getByLocationTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message)
          .toBe(`${Constants.params.latitude},${Constants.params.longitude}`);
        Log.log(TestConstants.middleware.dropp.testName, getByLocationTitle, error.details);
      }

      Log.it(TestConstants.middleware.dropp.testName, getByLocationTitle, it2, false);
      done();
    });

    const it3 = 'throws an error for invalid latitude';
    it(it3, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, getByLocationTitle, it3, true);
      const details = {
        latitude: TestConstants.params.invalidChars.dollar,
        longitude: `${TestConstants.params.defaultLocation}`,
      };

      try {
        const result = await DroppMiddleware.getByLocation(this.user, details);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.dropp.testName,
          getByLocationTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message)
          .toBe(`${Constants.params.latitude},${Constants.params.longitude}`);
        Log.log(TestConstants.middleware.dropp.testName, getByLocationTitle, error.details);
      }

      Log.it(TestConstants.middleware.dropp.testName, getByLocationTitle, it3, false);
      done();
    });

    const it4 = 'throws an error for invalid longitude';
    it(it4, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, getByLocationTitle, it4, true);
      const details = {
        latitude: `${TestConstants.params.defaultLocation}`,
        longitude: TestConstants.params.invalidChars.dollar,
      };

      try {
        const result = await DroppMiddleware.getByLocation(this.user, details);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.dropp.testName,
          getByLocationTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message)
          .toBe(`${Constants.params.latitude},${Constants.params.longitude}`);
        Log.log(TestConstants.middleware.dropp.testName, getByLocationTitle, error.details);
      }

      Log.it(TestConstants.middleware.dropp.testName, getByLocationTitle, it4, false);
      done();
    });

    const it5 = 'returns dropps around a location';
    it(it5, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, getByLocationTitle, it5, true);
      const result = await DroppMiddleware.getByLocation(this.user, this.location.databaseData);
      expect(result.success.count).toBe(1);
      expect(result.success.dropps[0].id).toBe(this.dropp1.id);
      Log.log(TestConstants.middleware.dropp.testName, getByLocationTitle, result);
      Log.it(TestConstants.middleware.dropp.testName, getByLocationTitle, it5, false);
      done();
    });
  });

  const createDroppTitle = 'Create dropp';
  describe(createDroppTitle, () => {
    beforeEach(() => {
      Log.beforeEach(TestConstants.middleware.dropp.testName, createDroppTitle, true);
      this.droppInfo = {
        text: TestConstants.params.test,
        media: Constants.params.false,
        username: this.user.username,
        timestamp: TestConstants.params.defaultTimestamp,
        location: {
          latitude: TestConstants.params.defaultLocation,
          longitude: TestConstants.params.defaultLocation,
        },
      };

      Log.beforeEach(TestConstants.middleware.dropp.testName, createDroppTitle, false);
    });

    afterEach(() => {
      Log.afterEach(TestConstants.middleware.dropp.testName, createDroppTitle, true);
      delete this.droppInfo;
      Log.afterEach(TestConstants.middleware.dropp.testName, createDroppTitle, false);
    });

    const it1 = 'throws an error for an invalid current user';
    it(it1, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, getByFollowsTitle, it1, true);
      try {
        const result = await DroppMiddleware.create(null, this.droppInfo);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.dropp.testName,
          createDroppTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(TestConstants.middleware.dropp.testName, createDroppTitle, error.details);
      }

      Log.it(TestConstants.middleware.dropp.testName, getByFollowsTitle, it1, false);
      done();
    });

    const it2 = 'throws an error for null details';
    it(it2, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, createDroppTitle, it2, true);
      try {
        const result = await DroppMiddleware.create(this.user, null);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.dropp.testName,
          createDroppTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        const params = [
          Constants.params.text,
          Constants.params.media,
          Constants.params.username,
          Constants.params.timestamp,
          Constants.params.location,
        ];

        expect(error.details.error.message).toBe(params.join());
        Log.log(TestConstants.middleware.dropp.testName, createDroppTitle, error.details);
      }

      Log.it(TestConstants.middleware.dropp.testName, createDroppTitle, it2, false);
      done();
    });

    const it3 = 'throws an error for invalid location details';
    it(it3, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, createDroppTitle, it3, true);
      delete this.droppInfo.location.latitude;
      delete this.droppInfo.location.longitude;
      try {
        const result = await DroppMiddleware.create(this.user, this.droppInfo);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.dropp.testName,
          createDroppTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message)
          .toBe(`${Constants.params.latitude},${Constants.params.longitude}`);
        Log.log(TestConstants.middleware.dropp.testName, createDroppTitle, error.details);
      }

      Log.it(TestConstants.middleware.dropp.testName, createDroppTitle, it3, false);
      done();
    });

    const it4 = 'throws an error for no media and empty text';
    it(it4, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, createDroppTitle, it4, true);
      this.droppInfo.text = TestConstants.utils.strings.emptyString;
      try {
        const result = await DroppMiddleware.create(this.user, this.droppInfo);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.dropp.testName,
          createDroppTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message)
          .toBe(Constants.middleware.dropp.messages.errors.mustContainText);
        Log.log(TestConstants.middleware.dropp.testName, createDroppTitle, error.details);
      }

      Log.it(TestConstants.middleware.dropp.testName, createDroppTitle, it4, false);
      done();
    });

    const it5 = 'throws an error for true media but invalid media data';
    it(it5, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, createDroppTitle, it5, true);
      this.droppInfo.media = 'true';
      this.droppInfo.base64Data = TestConstants.media.base64DataTypes.random;
      try {
        const result = await DroppMiddleware.create(this.user, this.droppInfo);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.dropp.testName,
          createDroppTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe(Constants.params.base64Data);
        Log.log(TestConstants.middleware.dropp.testName, createDroppTitle, error.details);
      }

      Log.it(TestConstants.middleware.dropp.testName, createDroppTitle, it5, false);
      done();
    });

    const createDroppSuccessTitle = 'Create dropp success';
    describe(createDroppSuccessTitle, () => {
      afterEach(async (done) => {
        Log.afterEach(TestConstants.middleware.dropp.testName, createDroppSuccessTitle, true);
        await DroppMiddleware.remove(this.user, this.dropp.publicData);
        delete this.dropp;
        Log.afterEach(TestConstants.middleware.dropp.testName, createDroppSuccessTitle, false);
        done();
      });

      const it6 = 'creates a dropp and returns an ID';
      it(it6, async (done) => {
        Log.it(TestConstants.middleware.dropp.testName, createDroppTitle, it6, true);
        const result = await DroppMiddleware.create(this.user, this.droppInfo);
        expect(result.success.message)
          .toBe(Constants.middleware.dropp.messages.success.createDropp);
        expect(typeof result.success.droppId).toBe('string');
        expect(result.success.droppId.length > 0).toBe(true);
        this.dropp = await DroppAccessor.get(result.success.droppId);
        expect(this.dropp.id).toBe(result.success.droppId);
        Log.log(TestConstants.middleware.dropp.testName, createDroppSuccessTitle, result);
        Log.it(TestConstants.middleware.dropp.testName, createDroppTitle, it6, false);
        done();
      });

      const it7 = 'creates a dropp with media and no text';
      it(it7, async (done) => {
        Log.it(TestConstants.middleware.dropp.testName, createDroppSuccessTitle, it7, true);
        this.droppInfo.text = TestConstants.utils.strings.tab;
        this.droppInfo.media = Constants.params.true;
        this.droppInfo.base64Data = `${Constants.media.base64DataTypes.png}${TestConstants.media.base64DataTypes.test}`;
        const result = await DroppMiddleware.create(this.user, this.droppInfo);
        expect(result.mediaUploadError).not.toBeDefined();
        expect(result.success.message)
          .toBe(Constants.middleware.dropp.messages.success.createDropp);
        expect(typeof result.success.droppId).toBe('string');
        expect(result.success.droppId.length > 0).toBe(true);

        // Validate results from the backend
        this.dropp = await DroppAccessor.get(result.success.droppId);
        expect(this.dropp.id).toBe(result.success.droppId);
        expect(this.dropp.text).toBe(TestConstants.utils.strings.emptyString);
        expect(this.dropp.media).toBe(true);

        const media = await DroppMiddleware.getPhoto(this.user, { id: this.dropp.id });
        expect(media.success.mimeType).toBe(Constants.media.mimeTypes.png);
        expect(media.success.base64Data)
          .toBe(this.droppInfo.base64Data.slice(0, this.droppInfo.base64Data.length - 2));
        Log.log(TestConstants.middleware.dropp.testName, createDroppSuccessTitle, result);
        Log.it(TestConstants.middleware.dropp.testName, createDroppSuccessTitle, it7, false);
        done();
      });
    });
  });

  const addPhotoTitle = 'Add photo to dropp';
  describe(addPhotoTitle, () => {
    beforeEach(async (done) => {
      Log.beforeEach(TestConstants.middleware.dropp.testName, addPhotoTitle, true);
      this.dropp = new Dropp({
        text: TestConstants.params.test,
        media: false,
        username: this.user.username,
        timestamp: TestConstants.params.defaultTimestamp,
        location: new Location({
          latitude: TestConstants.params.defaultLocation,
          longitude: TestConstants.params.defaultLocation,
        }),
      });

      await DroppAccessor.add(this.dropp);
      const result = await Helper.copyLocalFile(TestConstants.files.image001);
      this.details = {
        id: this.dropp.id,
        filePath: result.path,
      };

      this.shouldDeleteLocalFile = false;
      Log.beforeEach(TestConstants.middleware.dropp.testName, addPhotoTitle, false);
      done();
    });

    afterEach(async (done) => {
      Log.afterEach(TestConstants.middleware.dropp.testName, addPhotoTitle, true);
      await DroppAccessor.remove(this.dropp);
      if (this.shouldDeleteLocalFile === true) await Utils.deleteLocalFile(this.details.filePath);
      delete this.dropp;
      delete this.details;
      Log.afterEach(TestConstants.middleware.dropp.testName, addPhotoTitle, false);
      done();
    });

    const it1 = 'throws an error for an invalid current user';
    it(it1, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, addPhotoTitle, it1, true);
      this.shouldDeleteLocalFile = true;
      try {
        const result = await DroppMiddleware.addPhoto(null, this.details);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.dropp.testName,
          addPhotoTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(TestConstants.middleware.dropp.testName, addPhotoTitle, error.details);
      }

      Log.it(TestConstants.middleware.dropp.testName, addPhotoTitle, it1, false);
      done();
    });

    const it2 = 'throws an error for null details';
    it(it2, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, addPhotoTitle, it2, true);
      this.shouldDeleteLocalFile = true;
      try {
        const result = await DroppMiddleware.addPhoto(this.user, null);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.dropp.testName,
          addPhotoTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message)
          .toBe(`${Constants.params.id},${Constants.params.media}`);
        Log.log(TestConstants.middleware.dropp.testName, addPhotoTitle, error.details);
      }

      Log.it(TestConstants.middleware.dropp.testName, addPhotoTitle, it2, false);
      done();
    });

    const it3 = 'throws an error for an invalid dropp ID';
    it(it3, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, addPhotoTitle, it3, true);
      this.shouldDeleteLocalFile = true;
      delete this.details.id;
      try {
        const result = await DroppMiddleware.addPhoto(this.user, this.details);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.dropp.testName,
          addPhotoTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe(Constants.params.id);
        Log.log(TestConstants.middleware.dropp.testName, addPhotoTitle, error.details);
      }

      Log.it(TestConstants.middleware.dropp.testName, addPhotoTitle, it3, false);
      done();
    });

    const it4 = 'throws an error for an invalid file path';
    it(it4, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, addPhotoTitle, it4, true);
      this.shouldDeleteLocalFile = true;
      const details = { id: this.details.id };
      try {
        const result = await DroppMiddleware.addPhoto(this.user, details);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.dropp.testName,
          addPhotoTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe(Constants.params.media);
        Log.log(TestConstants.middleware.dropp.testName, addPhotoTitle, error.details);
      }

      Log.it(TestConstants.middleware.dropp.testName, addPhotoTitle, it4, false);
      done();
    });

    const it5 = 'throws an error for an invalid file type';
    it(it5, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, addPhotoTitle, it5, true);
      await Utils.deleteLocalFile(this.details.filePath);
      this.details.filePath = await Helper.createLocalTextFile();
      try {
        const result = await DroppMiddleware.addPhoto(this.user, this.details);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.dropp.testName,
          addPhotoTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message)
          .toBe(Constants.middleware.dropp.messages.errors.invalidMediaType);
        Log.log(TestConstants.middleware.dropp.testName, addPhotoTitle, error.details);
      }

      Log.it(TestConstants.middleware.dropp.testName, addPhotoTitle, it5, false);
      done();
    });

    const it6 = 'throws an error for adding a photo to a non-existent dropp';
    it(it6, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, addPhotoTitle, it6, true);
      this.details.id = Utils.newUuid();
      try {
        const result = await DroppMiddleware.addPhoto(this.user, this.details);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.dropp.testName,
          addPhotoTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.ResourceDNE.type);
        expect(error.details.error.message)
          .toBe(TestConstants.messages.doesNotExist(Constants.params.dropp));
        Log.log(TestConstants.middleware.dropp.testName, addPhotoTitle, error.details);
      }

      Log.it(TestConstants.middleware.dropp.testName, addPhotoTitle, it6, false);
      done();
    });

    const it7 = 'throws an error for adding a photo to a different user\'s dropp';
    it(it7, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, addPhotoTitle, it7, true);
      const uuid = Utils.newUuid();
      const user = new User({
        username: uuid,
        email: TestConstants.params.uuidEmail(),
      });

      try {
        const result = await DroppMiddleware.addPhoto(user, this.details);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.dropp.testName,
          addPhotoTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message).toBe(Constants.middleware.messages.unauthorizedAccess);
        Log.log(TestConstants.middleware.dropp.testName, addPhotoTitle, error.details);
      }

      Log.it(TestConstants.middleware.dropp.testName, addPhotoTitle, it7, false);
      done();
    });

    const it8 = 'throws an error for a dropp that cannot have a photo';
    it(it8, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, addPhotoTitle, it8, true);
      try {
        const result = await DroppMiddleware.addPhoto(this.user, this.details);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.dropp.testName,
          addPhotoTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message)
          .toBe(Constants.middleware.dropp.messages.errors.cannotHaveMedia);
        Log.log(TestConstants.middleware.dropp.testName, addPhotoTitle, error.details);
      }

      Log.it(TestConstants.middleware.dropp.testName, addPhotoTitle, it8, false);
      done();
    });

    const addPhotoExistingPhotoTitle = 'Add photo existing photo error';
    describe(addPhotoExistingPhotoTitle, () => {
      let originalTimeout;
      beforeEach(async (done) => {
        Log.beforeEach(TestConstants.middleware.dropp.testName, addPhotoExistingPhotoTitle, true);
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = Helper.customTimeout;

        this.shouldDeleteLocalFile = true;
        this.dropp2 = new Dropp({
          text: TestConstants.params.test,
          media: true,
          username: this.user.username,
          timestamp: TestConstants.params.defaultTimestamp,
          location: new Location({
            latitude: TestConstants.params.defaultLocation,
            longitude: TestConstants.params.defaultLocation,
          }),
        });

        await DroppAccessor.add(this.dropp2);
        const result = await Helper.copyLocalFile(TestConstants.files.image001);
        this.details2 = {
          id: this.dropp2.id,
          filePath: result.path,
        };

        await DroppMiddleware.addPhoto(this.user, this.details2);
        const result2 = await Helper.copyLocalFile(TestConstants.files.image001);
        this.details2.filePath = result2.path;
        Log.beforeEach(TestConstants.middleware.dropp.testName, addPhotoExistingPhotoTitle, false);
        done();
      });

      afterEach(async (done) => {
        Log.afterEach(TestConstants.middleware.dropp.testName, addPhotoExistingPhotoTitle, true);
        await DroppMiddleware.remove(this.user, this.details2);
        delete this.dropp2;
        delete this.details2;

        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
        Log.afterEach(TestConstants.middleware.dropp.testName, addPhotoExistingPhotoTitle, false);
        done();
      });

      const it9 = 'throws an error for an already added photo';
      it(it9, async (done) => {
        Log.it(TestConstants.middleware.dropp.testName, addPhotoTitle, it9, true);
        try {
          const result = await DroppMiddleware.addPhoto(this.user, this.details2);
          expect(result).not.toBeDefined();
          Log.log(
            TestConstants.middleware.dropp.testName,
            addPhotoTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message)
            .toBe(Constants.middleware.dropp.messages.errors.mediaAlreadyAdded);
          Log.log(
            TestConstants.middleware.dropp.testName,
            addPhotoExistingPhotoTitle,
            error.details
          );
        }

        Log.it(TestConstants.middleware.dropp.testName, addPhotoTitle, it9, false);
        done();
      }, Helper.customTimeout);
    });

    const addPhotoSuccessTitle = 'Add photo success';
    describe(addPhotoSuccessTitle, () => {
      let originalTimeout;
      beforeEach(async (done) => {
        Log.beforeEach(TestConstants.middleware.dropp.testName, addPhotoSuccessTitle, true);
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = Helper.customTimeout;

        this.shouldDeleteLocalFile = true;
        this.dropp2 = new Dropp({
          text: TestConstants.params.test,
          media: true,
          username: this.user.username,
          timestamp: TestConstants.params.defaultTimestamp,
          location: new Location({
            latitude: TestConstants.params.defaultLocation,
            longitude: TestConstants.params.defaultLocation,
          }),
        });

        await DroppAccessor.add(this.dropp2);
        const result = await Helper.copyLocalFile(TestConstants.files.image001);
        this.details2 = {
          id: this.dropp2.id,
          filePath: result.path,
        };

        Log.beforeEach(TestConstants.middleware.dropp.testName, addPhotoSuccessTitle, false);
        done();
      });

      afterEach(async (done) => {
        Log.afterEach(TestConstants.middleware.dropp.testName, addPhotoSuccessTitle, true);
        await DroppMiddleware.remove(this.user, this.details2);
        delete this.dropp2;
        delete this.details2;

        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
        Log.afterEach(TestConstants.middleware.dropp.testName, addPhotoSuccessTitle, false);
        done();
      });

      const it10 = 'adds a photo to a dropp';
      it(it10, async (done) => {
        Log.it(TestConstants.middleware.dropp.testName, addPhotoExistingPhotoTitle, it10, true);
        const result = await DroppMiddleware.addPhoto(this.user, this.details2);
        expect(result.success.message).toBe(Constants.middleware.dropp.messages.success.addMedia);
        Log.log(TestConstants.middleware.dropp.testName, addPhotoSuccessTitle, result);
        Log.it(TestConstants.middleware.dropp.testName, addPhotoExistingPhotoTitle, it10, false);
        done();
      }, Helper.customTimeout);
    });
  });

  const updateDroppTextTitle = 'Update dropp text';
  describe(updateDroppTextTitle, () => {
    beforeEach(async (done) => {
      Log.beforeEach(TestConstants.middleware.dropp.testName, updateDroppTextTitle, true);
      this.dropp = new Dropp({
        text: TestConstants.params.test,
        media: false,
        username: this.user.username,
        timestamp: TestConstants.params.defaultTimestamp,
        location: new Location({
          latitude: TestConstants.params.defaultLocation,
          longitude: TestConstants.params.defaultLocation,
        }),
      });

      await DroppAccessor.add(this.dropp);
      this.details = {
        id: this.dropp.id,
        newText: `${Utils.newUuid()}\t`,
      };

      Log.beforeEach(TestConstants.middleware.dropp.testName, updateDroppTextTitle, false);
      done();
    });

    afterEach(async (done) => {
      Log.afterEach(TestConstants.middleware.dropp.testName, updateDroppTextTitle, true);
      await DroppAccessor.remove(this.dropp);
      delete this.dropp;
      delete this.details;
      Log.afterEach(TestConstants.middleware.dropp.testName, updateDroppTextTitle, false);
      done();
    });

    const it1 = 'throws an error for an invalid current user';
    it(it1, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, addPhotoTitle, it1, true);
      try {
        const result = await DroppMiddleware.updateText(null, this.details);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.dropp.testName,
          updateDroppTextTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(TestConstants.middleware.dropp.testName, updateDroppTextTitle, error.details);
      }

      Log.it(TestConstants.middleware.dropp.testName, addPhotoTitle, it1, false);
      done();
    });

    const it2 = 'throws an error for null details';
    it(it2, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, updateDroppTextTitle, it2, true);
      try {
        const result = await DroppMiddleware.updateText(this.user, null);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.dropp.testName,
          updateDroppTextTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message)
          .toBe(`${Constants.params.id},${Constants.params.newText}`);
        Log.log(TestConstants.middleware.dropp.testName, updateDroppTextTitle, error.details);
      }

      Log.it(TestConstants.middleware.dropp.testName, updateDroppTextTitle, it2, false);
      done();
    });

    const it3 = 'throws an error for a non-existent dropp ID';
    it(it3, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, updateDroppTextTitle, it3, true);
      this.details.id = Utils.newUuid();
      try {
        const result = await DroppMiddleware.updateText(this.user, this.details);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.dropp.testName,
          updateDroppTextTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.ResourceDNE.type);
        expect(error.details.error.message)
          .toBe(TestConstants.messages.doesNotExist(Constants.params.dropp));
        Log.log(TestConstants.middleware.dropp.testName, updateDroppTextTitle, error.details);
      }

      Log.it(TestConstants.middleware.dropp.testName, updateDroppTextTitle, it3, false);
      done();
    });

    const it4 = 'throws an error for updating a different user\'s dropp';
    it(it4, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, updateDroppTextTitle, it4, true);
      const uuid = Utils.newUuid();
      const user = new User({
        username: uuid,
        email: TestConstants.params.uuidEmail(),
      });

      try {
        const result = await DroppMiddleware.updateText(user, this.details);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.dropp.testName,
          updateDroppTextTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message).toBe(Constants.middleware.messages.unauthorizedAccess);
        Log.log(TestConstants.middleware.dropp.testName, updateDroppTextTitle, error.details);
      }

      Log.it(TestConstants.middleware.dropp.testName, updateDroppTextTitle, it4, false);
      done();
    });

    const it5 = 'throws an error for updating a dropp with the same text';
    it(it5, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, updateDroppTextTitle, it5, true);
      this.details.newText = this.dropp.text;
      try {
        const result = await DroppMiddleware.updateText(this.user, this.details);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.dropp.testName,
          updateDroppTextTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message).toBe(Constants.errors.messages.newValueMustBeDifferent);
        Log.log(TestConstants.middleware.dropp.testName, updateDroppTextTitle, error.details);
      }

      Log.it(TestConstants.middleware.dropp.testName, updateDroppTextTitle, it5, false);
      done();
    });

    const it6 = 'throws an error for updating a dropp with no media and empty text';
    it(it6, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, updateDroppTextTitle, it6, true);
      this.details.newText = TestConstants.utils.strings.tab;
      try {
        const result = await DroppMiddleware.updateText(this.user, this.details);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.dropp.testName,
          updateDroppTextTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message)
          .toBe(Constants.middleware.dropp.messages.errors.mustContainText);
        Log.log(TestConstants.middleware.dropp.testName, updateDroppTextTitle, error.details);
      }

      Log.it(TestConstants.middleware.dropp.testName, updateDroppTextTitle, it6, false);
      done();
    });

    const it7 = 'updates a dropp\'s text';
    it(it7, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, updateDroppTextTitle, it7, true);
      const result = await DroppMiddleware.updateText(this.user, this.details);
      expect(result.success.message).toBe(Constants.middleware.dropp.messages.success.textUpdate);
      const dropp = await DroppAccessor.get(this.dropp.id);
      expect(dropp.text).toBe(this.details.newText.trim());
      Log.log(TestConstants.middleware.dropp.testName, updateDroppTextTitle, result);
      Log.it(TestConstants.middleware.dropp.testName, updateDroppTextTitle, it7, false);
      done();
    });
  });

  const removeDroppTitle = 'Remove dropp';
  describe(removeDroppTitle, () => {
    beforeEach(async (done) => {
      Log.beforeEach(TestConstants.middleware.dropp.testName, removeDroppTitle, true);
      this.shouldDeleteDropp = true;
      this.dropp = new Dropp({
        text: TestConstants.params.test,
        media: false,
        username: this.user.username,
        timestamp: TestConstants.params.defaultTimestamp,
        location: new Location({
          latitude: TestConstants.params.defaultLocation,
          longitude: TestConstants.params.defaultLocation,
        }),
      });

      await DroppAccessor.add(this.dropp);
      this.details = { id: this.dropp.id };
      Log.beforeEach(TestConstants.middleware.dropp.testName, removeDroppTitle, false);
      done();
    });

    afterEach(async (done) => {
      Log.afterEach(TestConstants.middleware.dropp.testName, removeDroppTitle, true);
      if (this.shouldDeleteDropp === true) await DroppAccessor.remove(this.dropp);
      delete this.dropp;
      delete this.details;
      delete this.shouldDeleteDropp;
      Log.afterEach(TestConstants.middleware.dropp.testName, removeDroppTitle, false);
      done();
    });

    const it1 = 'throws an error for an invalid current user';
    it(it1, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, updateDroppTextTitle, it1, true);
      try {
        const result = await DroppMiddleware.remove(null, this.details);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.dropp.testName,
          removeDroppTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(TestConstants.middleware.dropp.testName, removeDroppTitle, error.details);
      }

      Log.it(TestConstants.middleware.dropp.testName, updateDroppTextTitle, it1, false);
      done();
    });

    const it2 = 'throws an error for null details';
    it(it2, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, removeDroppTitle, it2, true);
      try {
        const result = await DroppMiddleware.remove(this.user, null);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.dropp.testName,
          removeDroppTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe(Constants.params.id);
        Log.log(TestConstants.middleware.dropp.testName, removeDroppTitle, error.details);
      }

      Log.it(TestConstants.middleware.dropp.testName, removeDroppTitle, it2, false);
      done();
    });

    const it3 = 'throws an error for a non-existent dropp ID';
    it(it3, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, removeDroppTitle, it3, true);
      this.details.id = Utils.newUuid();
      try {
        const result = await DroppMiddleware.remove(this.user, this.details);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.dropp.testName,
          removeDroppTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.ResourceDNE.type);
        expect(error.details.error.message)
          .toBe(TestConstants.messages.doesNotExist(Constants.params.dropp));
        Log.log(TestConstants.middleware.dropp.testName, removeDroppTitle, error.details);
      }

      Log.it(TestConstants.middleware.dropp.testName, removeDroppTitle, it3, false);
      done();
    });

    const it4 = 'throws an error for updating a different user\'s dropp';
    it(it4, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, removeDroppTitle, it4, true);
      const uuid = Utils.newUuid();
      const user = new User({
        username: uuid,
        email: TestConstants.params.uuidEmail(),
      });

      try {
        const result = await DroppMiddleware.remove(user, this.details);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.dropp.testName,
          removeDroppTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message).toBe(Constants.middleware.messages.unauthorizedAccess);
        Log.log(TestConstants.middleware.dropp.testName, removeDroppTitle, error.details);
      }

      Log.it(TestConstants.middleware.dropp.testName, removeDroppTitle, it4, false);
      done();
    });

    const it5 = 'removes a dropp';
    it(it5, async (done) => {
      Log.it(TestConstants.middleware.dropp.testName, removeDroppTitle, it5, true);
      this.shouldDeleteDropp = false;
      const result = await DroppMiddleware.remove(this.user, this.details);
      expect(result.success.message).toBe(Constants.middleware.dropp.messages.success.removeDropp);
      const dropp = await DroppAccessor.get(this.dropp.id);
      expect(dropp).toBeNull();
      Log.log(TestConstants.middleware.dropp.testName, removeDroppTitle, result);
      Log.it(TestConstants.middleware.dropp.testName, removeDroppTitle, it5, false);
      done();
    });

    const removeDroppWithPhotoTitle = 'Remove dropp with photo';
    describe(removeDroppWithPhotoTitle, () => {
      let originalTimeout;
      beforeEach(async (done) => {
        Log.beforeEach(TestConstants.middleware.dropp.testName, removeDroppWithPhotoTitle, true);
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

        this.dropp2 = new Dropp({
          text: TestConstants.params.test,
          media: true,
          username: this.user.username,
          timestamp: TestConstants.params.defaultTimestamp,
          location: new Location({
            latitude: TestConstants.params.defaultLocation,
            longitude: TestConstants.params.defaultLocation,
          }),
        });

        await DroppAccessor.add(this.dropp2);
        this.details2 = { id: this.dropp2.id };
        const result = await Helper.copyLocalFile(TestConstants.files.image001);
        const details = {
          id: this.dropp2.id,
          filePath: result.path,
        };

        await DroppMiddleware.addPhoto(this.user, details);
        Log.beforeEach(TestConstants.middleware.dropp.testName, removeDroppWithPhotoTitle, false);
        done();
      });

      afterEach(() => {
        Log.afterEach(TestConstants.middleware.dropp.testName, removeDroppWithPhotoTitle, true);
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
        Log.afterEach(TestConstants.middleware.dropp.testName, removeDroppWithPhotoTitle, false);
      });

      const it6 = 'removes a dropp and it\'s photo';
      it(it6, async (done) => {
        Log.it(TestConstants.middleware.dropp.testName, removeDroppWithPhotoTitle, it6, true);
        const result = await DroppMiddleware.remove(this.user, this.details2);
        expect(result.success.message)
          .toBe(Constants.middleware.dropp.messages.success.removeDropp);
        const dropp = await DroppAccessor.get(this.dropp2.id);
        expect(dropp).toBeNull();
        try {
          const result2 = await CloudStorage.get(
            Constants.middleware.dropp.cloudStorageFolder,
            this.dropp2.id
          );
          expect(result2).not.toBeDefined();
          Log.log(
            TestConstants.middleware.dropp.testName,
            removeDroppWithPhotoTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.storage.name);
          expect(error.details.type).toBe(StorageError.type.FileDoesNotExist.type);
          Log.log(
            TestConstants.middleware.dropp.testName,
            removeDroppWithPhotoTitle,
            error.details
          );
        }

        Log.log(TestConstants.middleware.dropp.testName, removeDroppTitle, result);
        Log.it(TestConstants.middleware.dropp.testName, removeDroppWithPhotoTitle, it6, false);
        done();
      });
    });
  });
});

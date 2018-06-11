const Log = require('../../logger');
const Helper = require('../../helper');
const User = require('../../../src/models/User');
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

const testName = 'Dropp Middleware';
Firebase.start(process.env.MOCK === '1');
/* eslint-disable no-undef */
describe(testName, () => {
  beforeEach(async (done) => {
    Log.beforeEach(testName, testName, true);
    const uuid = Utils.newUuid();
    this.user = new User({
      username: uuid,
      email: `${uuid}@${uuid}.com`,
    });

    await UserAccessor.create(this.user, uuid);
    Log.beforeEach(testName, testName, false);
    done();
  });

  afterEach(async (done) => {
    Log.afterEach(testName, testName, true);
    await UserAccessor.remove(this.user);
    delete this.user;
    Log.afterEach(testName, testName, false);
    done();
  });

  const getDroppTitle = 'Get dropp';
  describe(getDroppTitle, () => {
    beforeEach(async (done) => {
      Log.beforeEach(testName, getDroppTitle, true);
      this.location = new Location({
        latitude: 0,
        longitude: 0,
      });

      this.dropp = new Dropp({
        timestamp: 1,
        media: 'false',
        text: Utils.newUuid(),
        location: this.location,
        username: this.user.username,
      });

      await DroppAccessor.add(this.dropp);
      this.droppIdDetails = { id: this.dropp.id };
      Log.beforeEach(testName, getDroppTitle, false);
      done();
    });

    afterEach(async (done) => {
      Log.afterEach(testName, getDroppTitle, true);
      await DroppAccessor.remove(this.dropp);
      delete this.location;
      delete this.dropp;
      Log.afterEach(testName, getDroppTitle, false);
      done();
    });

    const it1 = 'throws an error for an invalid current user';
    it(it1, async (done) => {
      Log.it(testName, getDroppTitle, it1, true);
      try {
        const result = await DroppMiddleware.get(null, this.droppIdDetails);
        expect(result).not.toBeDefined();
        Log.log(testName, getDroppTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(testName, getDroppTitle, error.details);
      }

      Log.it(testName, getDroppTitle, it1, false);
      done();
    });

    const it2 = 'throws an error for null details';
    it(it2, async (done) => {
      Log.it(testName, getDroppTitle, it2, true);
      try {
        const result = await DroppMiddleware.get(this.user, null);
        expect(result).not.toBeDefined();
        Log.log(testName, getDroppTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('id');
        Log.log(testName, getDroppTitle, error.details);
      }

      Log.it(testName, getDroppTitle, it2, false);
      done();
    });

    const it3 = 'throws an error for an invalid dropp ID';
    it(it3, async (done) => {
      Log.it(testName, getDroppTitle, it3, true);
      const invalidDetails = { id: '$' };
      try {
        const result = await DroppMiddleware.get(this.user, invalidDetails);
        expect(result).not.toBeDefined();
        Log.log(testName, getDroppTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('id');
        Log.log(testName, getDroppTitle, error.details);
      }

      Log.it(testName, getDroppTitle, it3, false);
      done();
    });

    const it4 = 'throws an error for a non-existent dropp';
    it(it4, async (done) => {
      Log.it(testName, getDroppTitle, it4, true);
      const details = { id: Utils.newUuid() };
      try {
        const result = await DroppMiddleware.get(this.user, details);
        expect(result).not.toBeDefined();
        Log.log(testName, getDroppTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.ResourceDNE.type);
        expect(error.details.error.message).toBe('That dropp does not exist');
        Log.log(testName, getDroppTitle, error.details);
      }

      Log.it(testName, getDroppTitle, it4, false);
      done();
    });

    const it5 = 'gets a dropp';
    it(it5, async (done) => {
      Log.it(testName, getDroppTitle, it5, true);
      const result = await DroppMiddleware.get(this.user, this.droppIdDetails);
      expect(result.id).toBe(this.dropp.id);
      expect(result.text).toBe(this.dropp.text);
      expect(result.media).toBe(this.dropp.media);
      expect(result.username).toBe(this.dropp.username);
      expect(result.timestamp).toBe(this.dropp.timestamp);
      expect(result.location.latitude).toBe(this.dropp.location.latitude);
      expect(result.location.longitude).toBe(this.dropp.location.longitude);
      Log.log(testName, getDroppTitle, result);
      Log.it(testName, getDroppTitle, it5, false);
      done();
    });
  });

  const getDroppPhotoTitle = 'Get dropp photo';
  describe(getDroppPhotoTitle, () => {
    beforeEach(async (done) => {
      Log.beforeEach(testName, getDroppPhotoTitle, true);
      this.dropp = new Dropp({
        text: 'test',
        media: 'false',
        username: this.user.username,
        timestamp: 1,
        location: new Location({
          latitude: 0,
          longitude: 0,
        }),
      });

      await DroppAccessor.add(this.dropp);
      this.details = { id: this.dropp.id };
      Log.beforeEach(testName, getDroppPhotoTitle, false);
      done();
    });

    afterEach(async (done) => {
      Log.afterEach(testName, getDroppPhotoTitle, true);
      await DroppMiddleware.remove(this.user, this.details);
      delete this.dropp;
      delete this.details;
      Log.afterEach(testName, getDroppPhotoTitle, false);
      done();
    });

    const it1 = 'throws an error for an invalid current user';
    it(it1, async (done) => {
      Log.it(testName, getDroppPhotoTitle, it1, true);
      try {
        const result = await DroppMiddleware.getPhoto(null, this.details);
        expect(result).not.toBeDefined();
        Log.log(testName, getDroppPhotoTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(testName, getDroppPhotoTitle, error.details);
      }

      Log.it(testName, getDroppPhotoTitle, it1, false);
      done();
    });

    const it2 = 'throws an error for null details';
    it(it2, async (done) => {
      Log.it(testName, getDroppPhotoTitle, it2, true);
      try {
        const result = await DroppMiddleware.getPhoto(this.user, null);
        expect(result).not.toBeDefined();
        Log.log(testName, getDroppPhotoTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('id');
        Log.log(testName, getDroppPhotoTitle, error.details);
      }

      Log.it(testName, getDroppPhotoTitle, it2, false);
      done();
    });

    const it3 = 'throws an error for an invalid dropp ID';
    it(it3, async (done) => {
      Log.it(testName, getDroppPhotoTitle, it3, true);
      const invalidDetails = { id: '$' };
      try {
        const result = await DroppMiddleware.getPhoto(this.user, invalidDetails);
        expect(result).not.toBeDefined();
        Log.log(testName, getDroppPhotoTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('id');
        Log.log(testName, getDroppPhotoTitle, error.details);
      }

      Log.it(testName, getDroppPhotoTitle, it3, false);
      done();
    });

    const it4 = 'throws an error for a non-existent dropp';
    it(it4, async (done) => {
      Log.it(testName, getDroppPhotoTitle, it4, true);
      const details = { id: Utils.newUuid() };
      try {
        const result = await DroppMiddleware.getPhoto(this.user, details);
        expect(result).not.toBeDefined();
        Log.log(testName, getDroppPhotoTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.ResourceDNE.type);
        expect(error.details.error.message).toBe('That dropp does not exist');
        Log.log(testName, getDroppPhotoTitle, error.details);
      }

      Log.it(testName, getDroppPhotoTitle, it4, false);
      done();
    });

    const it5 = 'throws an error for a dropp with no media';
    it(it5, async (done) => {
      Log.it(testName, getDroppPhotoTitle, it5, true);
      try {
        const result = await DroppMiddleware.getPhoto(this.user, this.details);
        expect(result).not.toBeDefined();
        Log.log(testName, getDroppPhotoTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message)
          .toBe(Constants.middleware.dropp.messages.errors.noMedia);
        Log.log(testName, getDroppPhotoTitle, error.details);
      }

      Log.it(testName, getDroppPhotoTitle, it5, false);
      done();
    });

    const getDroppPhotoSuccessTitle = 'Get dropp photo success';
    describe(getDroppPhotoSuccessTitle, () => {
      let originalTimeout;
      beforeEach(async (done) => {
        Log.beforeEach(testName, getDroppPhotoSuccessTitle, true);
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = Helper.customTimeout;

        this.dropp2 = new Dropp({
          text: 'test',
          media: 'true',
          username: this.user.username,
          timestamp: 1,
          location: new Location({
            latitude: 0,
            longitude: 0,
          }),
        });

        await DroppAccessor.add(this.dropp2);
        this.details2 = { id: this.dropp2.id };
        const result = await Helper.copyLocalFile('test_image_001.png');
        const details = {
          id: this.dropp2.id,
          filePath: result.path,
        };

        await DroppMiddleware.addPhoto(this.user, details);
        Log.beforeEach(testName, getDroppPhotoSuccessTitle, false);
        done();
      });

      afterEach(async (done) => {
        Log.afterEach(testName, getDroppPhotoSuccessTitle, true);
        await DroppMiddleware.remove(this.user, this.details2);
        delete this.dropp2;
        delete this.details2;

        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
        Log.afterEach(testName, getDroppPhotoSuccessTitle, false);
        done();
      });

      const it6 = 'get\'s a dropp\'s photo data';
      it(it6, async (done) => {
        Log.it(testName, getDroppPhotoSuccessTitle, it6, true);
        const result = await DroppMiddleware.getPhoto(this.user, this.details2);
        expect(result.success.mimeType).toBe('image/png');
        expect(result.success.base64Data.length > 0).toBe(true);
        Log.log(testName, getDroppPhotoSuccessTitle, result.success.mimeType);
        Log.it(testName, getDroppPhotoSuccessTitle, it6, false);
        done();
      }, Helper.customTimeout);
    });
  });

  const getByUserTitle = 'Get dropps by user';
  describe(getByUserTitle, () => {
    beforeEach(async (done) => {
      Log.beforeEach(testName, getByUserTitle, true);
      const uuid = Utils.newUuid();
      this.user2 = new User({
        username: uuid,
        email: `${uuid}@${uuid}.com`,
      });

      await UserAccessor.create(this.user2, uuid);
      Log.beforeEach(testName, getByUserTitle, false);
      done();
    });

    afterEach(async (done) => {
      Log.afterEach(testName, getByUserTitle, true);
      await UserAccessor.remove(this.user2);
      delete this.user2;
      Log.afterEach(testName, getByUserTitle, false);
      done();
    });

    const it1 = 'throws an error for an invalid current user';
    it(it1, async (done) => {
      Log.it(testName, getByUserTitle, it1, true);
      try {
        const result = await DroppMiddleware.getByUser(null, this.droppIdDetails);
        expect(result).not.toBeDefined();
        Log.log(testName, getByUserTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(testName, getByUserTitle, error.details);
      }

      Log.it(testName, getByUserTitle, it1, false);
      done();
    });

    const it2 = 'throws an error for null details';
    it(it2, async (done) => {
      Log.it(testName, getByUserTitle, it2, true);
      try {
        const result = await DroppMiddleware.getByUser(this.user, null);
        expect(result).not.toBeDefined();
        Log.log(testName, getByUserTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('username');
        Log.log(testName, getByUserTitle, error.details);
      }

      Log.it(testName, getByUserTitle, it2, false);
      done();
    });

    const it3 = 'throws an error for an invalid username';
    it(it3, async (done) => {
      Log.it(testName, getByUserTitle, it3, true);
      const invalidDetails = { username: '$' };
      try {
        const result = await DroppMiddleware.getByUser(this.user, invalidDetails);
        expect(result).not.toBeDefined();
        Log.log(testName, getByUserTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('username');
        Log.log(testName, getByUserTitle, error.details);
      }

      Log.it(testName, getByUserTitle, it3, false);
      done();
    });

    const it4 = 'throws an error for a non-existent user';
    it(it4, async (done) => {
      Log.it(testName, getByUserTitle, it4, true);
      const details = { username: Utils.newUuid() };
      try {
        const result = await DroppMiddleware.getByUser(this.user, details);
        expect(result).not.toBeDefined();
        Log.log(testName, getByUserTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.ResourceDNE.type);
        expect(error.details.error.message).toBe('That user does not exist');
        Log.log(testName, getByUserTitle, error.details);
      }

      Log.it(testName, getByUserTitle, it4, false);
      done();
    });

    const it5 = 'throws an error for an unfollowed user';
    it(it5, async (done) => {
      Log.it(testName, getByUserTitle, it5, true);
      const details = { username: this.user2.username };
      try {
        const result = await DroppMiddleware.getByUser(this.user, details);
        expect(result).not.toBeDefined();
        Log.log(testName, getByUserTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message).toBe(Constants.middleware.messages.mustFollowUser);
        Log.log(testName, getByUserTitle, error.details);
      }

      Log.it(testName, getByUserTitle, it5, false);
      done();
    });

    const getDroppsByUserSuccessTitle = 'Get dropps by user success';
    describe(getDroppsByUserSuccessTitle, () => {
      beforeEach(async (done) => {
        Log.beforeEach(testName, getDroppsByUserSuccessTitle, true);
        this.location = new Location({
          latitude: 0,
          longitude: 0,
        });

        this.dropp1 = new Dropp({
          location: this.location,
          media: 'false',
          text: 'test',
          timestamp: 1,
          username: this.user.username,
        });

        this.dropp2 = new Dropp({
          location: this.location,
          media: 'false',
          text: 'test',
          timestamp: 1,
          username: this.user2.username,
        });

        await DroppAccessor.add(this.dropp1);
        await DroppAccessor.add(this.dropp2);
        await UserAccessor.addFollow(this.user, this.user2);
        Log.beforeEach(testName, getDroppsByUserSuccessTitle, false);
        done();
      });

      afterEach(async (done) => {
        Log.afterEach(testName, getDroppsByUserSuccessTitle, true);
        await DroppAccessor.remove(this.dropp1);
        await DroppAccessor.remove(this.dropp2);
        delete this.location;
        delete this.dropp1;
        delete this.dropp2;
        await UserAccessor.removeFollow(this.user, this.user2);
        Log.afterEach(testName, getDroppsByUserSuccessTitle, false);
        done();
      });

      const it6 = 'gets dropps posted by the same user';
      it(it6, async (done) => {
        Log.it(testName, getByUserTitle, it6, true);
        const details = { username: this.user.username };
        const result = await DroppMiddleware.getByUser(this.user, details);
        expect(result.success.count).toBe(1);
        expect(result.success.dropps[0].id).toBe(this.dropp1.id);
        Log.log(testName, getDroppsByUserSuccessTitle, result);
        Log.it(testName, getByUserTitle, it6, false);
        done();
      });

      const it7 = 'gets dropps posted by a user\'s follow';
      it(it7, async (done) => {
        Log.it(testName, getDroppsByUserSuccessTitle, it7, true);
        const details = { username: this.user2.username };
        const result = await DroppMiddleware.getByUser(this.user, details);
        expect(result.success.count).toBe(1);
        expect(result.success.dropps[0].id).toBe(this.dropp2.id);
        Log.log(testName, getDroppsByUserSuccessTitle, result);
        Log.it(testName, getDroppsByUserSuccessTitle, it7, false);
        done();
      });
    });
  });

  const getByFollowsTitle = 'Get dropps by follows';
  describe(getByFollowsTitle, () => {
    beforeEach(async (done) => {
      Log.beforeEach(testName, getByFollowsTitle, true);
      const uuid = Utils.newUuid();
      this.user2 = new User({
        username: uuid,
        email: `${uuid}@${uuid}.com`,
      });

      await UserAccessor.create(this.user2, uuid);
      await UserAccessor.addFollow(this.user, this.user2);
      this.location = new Location({
        latitude: 0,
        longitude: 0,
      });

      this.dropp1 = new Dropp({
        location: this.location,
        media: 'false',
        text: 'test',
        timestamp: 1,
        username: this.user2.username,
      });

      await DroppAccessor.add(this.dropp1);
      Log.beforeEach(testName, getByFollowsTitle, false);
      done();
    });

    afterEach(async (done) => {
      Log.afterEach(testName, getByFollowsTitle, true);
      await DroppAccessor.remove(this.dropp1);
      await UserAccessor.removeFollow(this.user, this.user2);
      await UserAccessor.remove(this.user2);
      delete this.user2;
      delete this.location;
      delete this.dropp1;
      Log.afterEach(testName, getByFollowsTitle, false);
      done();
    });

    const it1 = 'throws an error for an invalid current user';
    it(it1, async (done) => {
      Log.it(testName, getByFollowsTitle, it1, true);
      try {
        const result = await DroppMiddleware.getByFollows(null, this.droppIdDetails);
        expect(result).not.toBeDefined();
        Log.log(testName, getByFollowsTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(testName, getByFollowsTitle, error.details);
      }

      Log.it(testName, getByFollowsTitle, it1, false);
      done();
    });

    const it2 = 'throws an error for null details';
    it(it2, async (done) => {
      Log.it(testName, getByFollowsTitle, it2, true);
      try {
        const result = await DroppMiddleware.getByFollows(this.user, null);
        expect(result).not.toBeDefined();
        Log.log(testName, getByFollowsTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('username');
        Log.log(testName, getByFollowsTitle, error.details);
      }

      Log.it(testName, getByFollowsTitle, it2, false);
      done();
    });

    const it3 = 'throws an error for an invalid username';
    it(it3, async (done) => {
      Log.it(testName, getByFollowsTitle, it3, true);
      const invalidDetails = { username: '$' };
      try {
        const result = await DroppMiddleware.getByFollows(this.user, invalidDetails);
        expect(result).not.toBeDefined();
        Log.log(testName, getByFollowsTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('username');
        Log.log(testName, getByFollowsTitle, error.details);
      }

      Log.it(testName, getByFollowsTitle, it3, false);
      done();
    });

    const it4 = 'throws an error for a different user';
    it(it4, async (done) => {
      Log.it(testName, getByFollowsTitle, it4, true);
      const details = { username: this.user2.username };
      try {
        const result = await DroppMiddleware.getByFollows(this.user, details);
        expect(result).not.toBeDefined();
        Log.log(testName, getByFollowsTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message).toBe(Constants.middleware.messages.unauthorizedAccess);
        Log.log(testName, getByFollowsTitle, error.details);
      }

      Log.it(testName, getByFollowsTitle, it4, false);
      done();
    });

    const it5 = 'throws an error for a non-existent user';
    it(it5, async (done) => {
      Log.it(testName, getByFollowsTitle, it5, true);
      const uuid = Utils.newUuid();
      const user = new User({
        username: uuid,
        email: `${uuid}@${uuid}.com`,
      });
      const details = { username: user.username };

      try {
        const result = await DroppMiddleware.getByFollows(user, details);
        expect(result).not.toBeDefined();
        Log.log(testName, getByFollowsTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(testName, getByFollowsTitle, error.details);
      }

      Log.it(testName, getByFollowsTitle, it5, false);
      done();
    });

    const it6 = 'returns dropps posted by the user\'s follows';
    it(it6, async (done) => {
      Log.it(testName, getByFollowsTitle, it6, true);
      const details = { username: this.user.username };
      const result = await DroppMiddleware.getByFollows(this.user, details);
      expect(result.success.count).toBe(1);
      expect(result.success.dropps[0].id).toBe(this.dropp1.id);
      Log.log(testName, getByFollowsTitle, result);
      Log.it(testName, getByFollowsTitle, it6, false);
      done();
    });
  });

  const getByLocationTitle = 'Get dropps by location';
  describe(getByLocationTitle, () => {
    beforeEach(async (done) => {
      Log.beforeEach(testName, getByLocationTitle, true);
      const coordinate = Math.random() * 100;
      this.location = new Location({
        latitude: coordinate,
        longitude: coordinate,
      });

      this.dropp1 = new Dropp({
        location: this.location,
        media: 'false',
        text: 'test',
        timestamp: 1,
        username: this.user.username,
      });

      await DroppAccessor.add(this.dropp1);
      Log.beforeEach(testName, getByLocationTitle, false);
      done();
    });

    afterEach(async (done) => {
      Log.afterEach(testName, getByLocationTitle, true);
      await DroppAccessor.remove(this.dropp1);
      delete this.dropp1;
      delete this.location;
      Log.afterEach(testName, getByLocationTitle, false);
      done();
    });

    const it1 = 'throws an error for an invalid current user';
    it(it1, async (done) => {
      Log.it(testName, getByFollowsTitle, it1, true);
      try {
        const result = await DroppMiddleware.getByLocation(null, this.location.databaseData);
        expect(result).not.toBeDefined();
        Log.log(testName, getByLocationTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(testName, getByLocationTitle, error.details);
      }

      Log.it(testName, getByFollowsTitle, it1, false);
      done();
    });

    const it2 = 'throws an error for null details';
    it(it2, async (done) => {
      Log.it(testName, getByLocationTitle, it2, true);
      try {
        const result = await DroppMiddleware.getByLocation(this.user, null);
        expect(result).not.toBeDefined();
        Log.log(testName, getByLocationTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('latitude,longitude');
        Log.log(testName, getByLocationTitle, error.details);
      }

      Log.it(testName, getByLocationTitle, it2, false);
      done();
    });

    const it3 = 'throws an error for invalid latitude';
    it(it3, async (done) => {
      Log.it(testName, getByLocationTitle, it3, true);
      const details = {
        latitude: '$',
        longitude: '0',
      };

      try {
        const result = await DroppMiddleware.getByLocation(this.user, details);
        expect(result).not.toBeDefined();
        Log.log(testName, getByLocationTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('latitude,longitude');
        Log.log(testName, getByLocationTitle, error.details);
      }

      Log.it(testName, getByLocationTitle, it3, false);
      done();
    });

    const it4 = 'throws an error for invalid longitude';
    it(it4, async (done) => {
      Log.it(testName, getByLocationTitle, it4, true);
      const details = {
        latitude: '0',
        longitude: '$',
      };

      try {
        const result = await DroppMiddleware.getByLocation(this.user, details);
        expect(result).not.toBeDefined();
        Log.log(testName, getByLocationTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('latitude,longitude');
        Log.log(testName, getByLocationTitle, error.details);
      }

      Log.it(testName, getByLocationTitle, it4, false);
      done();
    });

    const it5 = 'returns dropps around a location';
    it(it5, async (done) => {
      Log.it(testName, getByLocationTitle, it5, true);
      const result = await DroppMiddleware.getByLocation(this.user, this.location.databaseData);
      expect(result.success.count).toBe(1);
      expect(result.success.dropps[0].id).toBe(this.dropp1.id);
      Log.log(testName, getByLocationTitle, result);
      Log.it(testName, getByLocationTitle, it5, false);
      done();
    });
  });

  const createDroppTitle = 'Create dropp';
  describe(createDroppTitle, () => {
    beforeEach(() => {
      Log.beforeEach(testName, createDroppTitle, true);
      this.droppInfo = {
        text: 'test',
        media: 'false',
        username: this.user.username,
        timestamp: 1,
        location: {
          latitude: 0,
          longitude: 0,
        },
      };

      Log.beforeEach(testName, createDroppTitle, false);
    });

    afterEach(() => {
      Log.afterEach(testName, createDroppTitle, true);
      delete this.droppInfo;
      Log.afterEach(testName, createDroppTitle, false);
    });

    const it1 = 'throws an error for an invalid current user';
    it(it1, async (done) => {
      Log.it(testName, getByFollowsTitle, it1, true);
      try {
        const result = await DroppMiddleware.create(null, this.droppInfo);
        expect(result).not.toBeDefined();
        Log.log(testName, createDroppTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(testName, createDroppTitle, error.details);
      }

      Log.it(testName, getByFollowsTitle, it1, false);
      done();
    });

    const it2 = 'throws an error for null details';
    it(it2, async (done) => {
      Log.it(testName, createDroppTitle, it2, true);
      try {
        const result = await DroppMiddleware.create(this.user, null);
        expect(result).not.toBeDefined();
        Log.log(testName, createDroppTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('text,media,username,timestamp,location');
        Log.log(testName, createDroppTitle, error.details);
      }

      Log.it(testName, createDroppTitle, it2, false);
      done();
    });

    const it3 = 'throws an error for invalid location details';
    it(it3, async (done) => {
      Log.it(testName, createDroppTitle, it3, true);
      delete this.droppInfo.location.latitude;
      delete this.droppInfo.location.longitude;
      try {
        const result = await DroppMiddleware.create(this.user, this.droppInfo);
        expect(result).not.toBeDefined();
        Log.log(testName, createDroppTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('latitude,longitude');
        Log.log(testName, createDroppTitle, error.details);
      }

      Log.it(testName, createDroppTitle, it3, false);
      done();
    });

    const it4 = 'throws an error for no media and empty text';
    it(it4, async (done) => {
      Log.it(testName, createDroppTitle, it4, true);
      this.droppInfo.text = '';
      try {
        const result = await DroppMiddleware.create(this.user, this.droppInfo);
        expect(result).not.toBeDefined();
        Log.log(testName, createDroppTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message).toBe('This dropp must contain non-empty text');
        Log.log(testName, createDroppTitle, error.details);
      }

      Log.it(testName, createDroppTitle, it4, false);
      done();
    });

    const createDroppSuccessTitle = 'Create dropp success';
    describe(createDroppSuccessTitle, () => {
      afterEach(async (done) => {
        Log.afterEach(testName, createDroppSuccessTitle, true);
        await DroppAccessor.remove(this.dropp);
        delete this.dropp;
        Log.afterEach(testName, createDroppSuccessTitle, false);
        done();
      });

      const it5 = 'creates a dropp and returns an ID';
      it(it5, async (done) => {
        Log.it(testName, createDroppTitle, it5, true);
        const result = await DroppMiddleware.create(this.user, this.droppInfo);
        expect(result.success.message).toBe('Successful dropp creation');
        expect(typeof result.success.droppId).toBe('string');
        expect(result.success.droppId.length > 0).toBe(true);
        this.dropp = await DroppAccessor.get(result.success.droppId);
        expect(this.dropp.id).toBe(result.success.droppId);
        Log.log(testName, createDroppSuccessTitle, result);
        Log.it(testName, createDroppTitle, it5, false);
        done();
      });

      const it6 = 'creates a dropp with media and no text';
      it(it6, async (done) => {
        Log.it(testName, createDroppSuccessTitle, it6, true);
        this.droppInfo.text = '\t';
        this.droppInfo.media = 'true';
        const result = await DroppMiddleware.create(this.user, this.droppInfo);
        expect(result.success.message).toBe('Successful dropp creation');
        expect(typeof result.success.droppId).toBe('string');
        expect(result.success.droppId.length > 0).toBe(true);
        this.dropp = await DroppAccessor.get(result.success.droppId);
        expect(this.dropp.id).toBe(result.success.droppId);
        expect(this.dropp.text).toBe('');
        Log.log(testName, createDroppSuccessTitle, result);
        Log.it(testName, createDroppSuccessTitle, it6, false);
        done();
      });
    });
  });

  const addPhotoTitle = 'Add photo to dropp';
  describe(addPhotoTitle, () => {
    beforeEach(async (done) => {
      Log.beforeEach(testName, addPhotoTitle, true);
      this.dropp = new Dropp({
        text: 'test',
        media: 'false',
        username: this.user.username,
        timestamp: 1,
        location: new Location({
          latitude: 0,
          longitude: 0,
        }),
      });

      await DroppAccessor.add(this.dropp);
      const result = await Helper.copyLocalFile('test_image_001.png');
      this.details = {
        id: this.dropp.id,
        filePath: result.path,
      };

      this.shouldDeleteLocalFile = false;
      Log.beforeEach(testName, addPhotoTitle, false);
      done();
    });

    afterEach(async (done) => {
      Log.afterEach(testName, addPhotoTitle, true);
      await DroppAccessor.remove(this.dropp);
      if (this.shouldDeleteLocalFile === true) await Utils.deleteLocalFile(this.details.filePath);
      delete this.dropp;
      delete this.details;
      Log.afterEach(testName, addPhotoTitle, false);
      done();
    });

    const it1 = 'throws an error for an invalid current user';
    it(it1, async (done) => {
      Log.it(testName, addPhotoTitle, it1, true);
      this.shouldDeleteLocalFile = true;
      try {
        const result = await DroppMiddleware.addPhoto(null, this.details);
        expect(result).not.toBeDefined();
        Log.log(testName, addPhotoTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(testName, addPhotoTitle, error.details);
      }

      Log.it(testName, addPhotoTitle, it1, false);
      done();
    });

    const it2 = 'throws an error for null details';
    it(it2, async (done) => {
      Log.it(testName, addPhotoTitle, it2, true);
      this.shouldDeleteLocalFile = true;
      try {
        const result = await DroppMiddleware.addPhoto(this.user, null);
        expect(result).not.toBeDefined();
        Log.log(testName, addPhotoTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('id,media');
        Log.log(testName, addPhotoTitle, error.details);
      }

      Log.it(testName, addPhotoTitle, it2, false);
      done();
    });

    const it3 = 'throws an error for an invalid dropp ID';
    it(it3, async (done) => {
      Log.it(testName, addPhotoTitle, it3, true);
      this.shouldDeleteLocalFile = true;
      delete this.details.id;
      try {
        const result = await DroppMiddleware.addPhoto(this.user, this.details);
        expect(result).not.toBeDefined();
        Log.log(testName, addPhotoTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('id');
        Log.log(testName, addPhotoTitle, error.details);
      }

      Log.it(testName, addPhotoTitle, it3, false);
      done();
    });

    const it4 = 'throws an error for an invalid file path';
    it(it4, async (done) => {
      Log.it(testName, addPhotoTitle, it4, true);
      this.shouldDeleteLocalFile = true;
      const details = { id: this.details.id };
      try {
        const result = await DroppMiddleware.addPhoto(this.user, details);
        expect(result).not.toBeDefined();
        Log.log(testName, addPhotoTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('media');
        Log.log(testName, addPhotoTitle, error.details);
      }

      Log.it(testName, addPhotoTitle, it4, false);
      done();
    });

    const it5 = 'throws an error for an invalid file type';
    it(it5, async (done) => {
      Log.it(testName, addPhotoTitle, it5, true);
      await Utils.deleteLocalFile(this.details.filePath);
      this.details.filePath = await Helper.createLocalTextFile();
      try {
        const result = await DroppMiddleware.addPhoto(this.user, this.details);
        expect(result).not.toBeDefined();
        Log.log(testName, addPhotoTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message).toBe('Media must be PNG or JPG');
        Log.log(testName, addPhotoTitle, error.details);
      }

      Log.it(testName, addPhotoTitle, it5, false);
      done();
    });

    const it6 = 'throws an error for adding a photo to a non-existent dropp';
    it(it6, async (done) => {
      Log.it(testName, addPhotoTitle, it6, true);
      this.details.id = Utils.newUuid();
      try {
        const result = await DroppMiddleware.addPhoto(this.user, this.details);
        expect(result).not.toBeDefined();
        Log.log(testName, addPhotoTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.ResourceDNE.type);
        expect(error.details.error.message).toBe('That dropp does not exist');
        Log.log(testName, addPhotoTitle, error.details);
      }

      Log.it(testName, addPhotoTitle, it6, false);
      done();
    });

    const it7 = 'throws an error for adding a photo to a different user\'s dropp';
    it(it7, async (done) => {
      Log.it(testName, addPhotoTitle, it7, true);
      const uuid = Utils.newUuid();
      const user = new User({
        username: uuid,
        email: `${uuid}@${uuid}.com`,
      });

      try {
        const result = await DroppMiddleware.addPhoto(user, this.details);
        expect(result).not.toBeDefined();
        Log.log(testName, addPhotoTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message).toBe('Unauthorized to access that');
        Log.log(testName, addPhotoTitle, error.details);
      }

      Log.it(testName, addPhotoTitle, it7, false);
      done();
    });

    const it8 = 'throws an error for a dropp that cannot have a photo';
    it(it8, async (done) => {
      Log.it(testName, addPhotoTitle, it8, true);
      try {
        const result = await DroppMiddleware.addPhoto(this.user, this.details);
        expect(result).not.toBeDefined();
        Log.log(testName, addPhotoTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message).toBe('This dropp cannot have media added to it');
        Log.log(testName, addPhotoTitle, error.details);
      }

      Log.it(testName, addPhotoTitle, it8, false);
      done();
    });

    const addPhotoExistingPhotoTitle = 'Add photo existing photo error';
    describe(addPhotoExistingPhotoTitle, () => {
      let originalTimeout;
      beforeEach(async (done) => {
        Log.beforeEach(testName, addPhotoExistingPhotoTitle, true);
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = Helper.customTimeout;

        this.shouldDeleteLocalFile = true;
        this.dropp2 = new Dropp({
          text: 'test',
          media: 'true',
          username: this.user.username,
          timestamp: 1,
          location: new Location({
            latitude: 0,
            longitude: 0,
          }),
        });

        await DroppAccessor.add(this.dropp2);
        const result = await Helper.copyLocalFile('test_image_001.png');
        this.details2 = {
          id: this.dropp2.id,
          filePath: result.path,
        };

        await DroppMiddleware.addPhoto(this.user, this.details2);
        const result2 = await Helper.copyLocalFile('test_image_001.png');
        this.details2.filePath = result2.path;
        Log.beforeEach(testName, addPhotoExistingPhotoTitle, false);
        done();
      });

      afterEach(async (done) => {
        Log.afterEach(testName, addPhotoExistingPhotoTitle, true);
        await DroppMiddleware.remove(this.user, this.details2);
        delete this.dropp2;
        delete this.details2;

        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
        Log.afterEach(testName, addPhotoExistingPhotoTitle, false);
        done();
      });

      const it9 = 'throws an error for an already added photo';
      it(it9, async (done) => {
        Log.it(testName, addPhotoTitle, it9, true);
        try {
          const result = await DroppMiddleware.addPhoto(this.user, this.details2);
          expect(result).not.toBeDefined();
          Log.log(testName, addPhotoTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message).toBe('Media has already been added to this dropp');
          Log.log(testName, addPhotoExistingPhotoTitle, error.details);
        }

        Log.it(testName, addPhotoTitle, it9, false);
        done();
      }, Helper.customTimeout);
    });

    const addPhotoSuccessTitle = 'Add photo success';
    describe(addPhotoSuccessTitle, () => {
      let originalTimeout;
      beforeEach(async (done) => {
        Log.beforeEach(testName, addPhotoSuccessTitle, true);
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = Helper.customTimeout;

        this.shouldDeleteLocalFile = true;
        this.dropp2 = new Dropp({
          text: 'test',
          media: 'true',
          username: this.user.username,
          timestamp: 1,
          location: new Location({
            latitude: 0,
            longitude: 0,
          }),
        });

        await DroppAccessor.add(this.dropp2);
        const result = await Helper.copyLocalFile('test_image_001.png');
        this.details2 = {
          id: this.dropp2.id,
          filePath: result.path,
        };

        Log.beforeEach(testName, addPhotoSuccessTitle, false);
        done();
      });

      afterEach(async (done) => {
        Log.afterEach(testName, addPhotoSuccessTitle, true);
        await DroppMiddleware.remove(this.user, this.details2);
        delete this.dropp2;
        delete this.details2;

        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
        Log.afterEach(testName, addPhotoSuccessTitle, false);
        done();
      });

      const it10 = 'adds a photo to a dropp';
      it(it10, async (done) => {
        Log.it(testName, addPhotoExistingPhotoTitle, it10, true);
        const result = await DroppMiddleware.addPhoto(this.user, this.details2);
        expect(result.success.message).toBe('Successful media creation');
        Log.log(testName, addPhotoSuccessTitle, result);
        Log.it(testName, addPhotoExistingPhotoTitle, it10, false);
        done();
      }, Helper.customTimeout);
    });
  });

  const updateDroppTextTitle = 'Update dropp text';
  describe(updateDroppTextTitle, () => {
    beforeEach(async (done) => {
      Log.beforeEach(testName, updateDroppTextTitle, true);
      this.dropp = new Dropp({
        text: 'test',
        media: 'false',
        username: this.user.username,
        timestamp: 1,
        location: new Location({
          latitude: 0,
          longitude: 0,
        }),
      });

      await DroppAccessor.add(this.dropp);
      this.details = {
        id: this.dropp.id,
        newText: `${Utils.newUuid()}\t`,
      };

      Log.beforeEach(testName, updateDroppTextTitle, false);
      done();
    });

    afterEach(async (done) => {
      Log.afterEach(testName, updateDroppTextTitle, true);
      await DroppAccessor.remove(this.dropp);
      delete this.dropp;
      delete this.details;
      Log.afterEach(testName, updateDroppTextTitle, false);
      done();
    });

    const it1 = 'throws an error for an invalid current user';
    it(it1, async (done) => {
      Log.it(testName, addPhotoTitle, it1, true);
      try {
        const result = await DroppMiddleware.updateText(null, this.details);
        expect(result).not.toBeDefined();
        Log.log(testName, updateDroppTextTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(testName, updateDroppTextTitle, error.details);
      }

      Log.it(testName, addPhotoTitle, it1, false);
      done();
    });

    const it2 = 'throws an error for null details';
    it(it2, async (done) => {
      Log.it(testName, updateDroppTextTitle, it2, true);
      try {
        const result = await DroppMiddleware.updateText(this.user, null);
        expect(result).not.toBeDefined();
        Log.log(testName, updateDroppTextTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('id,newText');
        Log.log(testName, updateDroppTextTitle, error.details);
      }

      Log.it(testName, updateDroppTextTitle, it2, false);
      done();
    });

    const it3 = 'throws an error for a non-existent dropp ID';
    it(it3, async (done) => {
      Log.it(testName, updateDroppTextTitle, it3, true);
      this.details.id = Utils.newUuid();
      try {
        const result = await DroppMiddleware.updateText(this.user, this.details);
        expect(result).not.toBeDefined();
        Log.log(testName, updateDroppTextTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.ResourceDNE.type);
        expect(error.details.error.message).toBe('That dropp does not exist');
        Log.log(testName, updateDroppTextTitle, error.details);
      }

      Log.it(testName, updateDroppTextTitle, it3, false);
      done();
    });

    const it4 = 'throws an error for updating a different user\'s dropp';
    it(it4, async (done) => {
      Log.it(testName, updateDroppTextTitle, it4, true);
      const uuid = Utils.newUuid();
      const user = new User({
        username: uuid,
        email: `${uuid}@${uuid}.com`,
      });

      try {
        const result = await DroppMiddleware.updateText(user, this.details);
        expect(result).not.toBeDefined();
        Log.log(testName, updateDroppTextTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message).toBe('Unauthorized to access that');
        Log.log(testName, updateDroppTextTitle, error.details);
      }

      Log.it(testName, updateDroppTextTitle, it4, false);
      done();
    });

    const it5 = 'throws an error for updating a dropp with the same text';
    it(it5, async (done) => {
      Log.it(testName, updateDroppTextTitle, it5, true);
      this.details.newText = this.dropp.text;
      try {
        const result = await DroppMiddleware.updateText(this.user, this.details);
        expect(result).not.toBeDefined();
        Log.log(testName, updateDroppTextTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message).toBe('New value must be different than existing value');
        Log.log(testName, updateDroppTextTitle, error.details);
      }

      Log.it(testName, updateDroppTextTitle, it5, false);
      done();
    });

    const it6 = 'throws an error for updating a dropp with no media and empty text';
    it(it6, async (done) => {
      Log.it(testName, updateDroppTextTitle, it6, true);
      this.details.newText = '\t';
      try {
        const result = await DroppMiddleware.updateText(this.user, this.details);
        expect(result).not.toBeDefined();
        Log.log(testName, updateDroppTextTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message).toBe('This dropp must contain non-empty text');
        Log.log(testName, updateDroppTextTitle, error.details);
      }

      Log.it(testName, updateDroppTextTitle, it6, false);
      done();
    });

    const it7 = 'updates a dropp\'s text';
    it(it7, async (done) => {
      Log.it(testName, updateDroppTextTitle, it7, true);
      const result = await DroppMiddleware.updateText(this.user, this.details);
      expect(result.success.message).toBe('Successful text update');
      const dropp = await DroppAccessor.get(this.dropp.id);
      expect(dropp.text).toBe(this.details.newText.trim());
      Log.log(testName, updateDroppTextTitle, result);
      Log.it(testName, updateDroppTextTitle, it7, false);
      done();
    });
  });

  const removeDroppTitle = 'Remove dropp';
  describe(removeDroppTitle, () => {
    beforeEach(async (done) => {
      Log.beforeEach(testName, removeDroppTitle, true);
      this.shouldDeleteDropp = true;
      this.dropp = new Dropp({
        text: 'test',
        media: 'false',
        username: this.user.username,
        timestamp: 1,
        location: new Location({
          latitude: 0,
          longitude: 0,
        }),
      });

      await DroppAccessor.add(this.dropp);
      this.details = { id: this.dropp.id };
      Log.beforeEach(testName, removeDroppTitle, false);
      done();
    });

    afterEach(async (done) => {
      Log.afterEach(testName, removeDroppTitle, true);
      if (this.shouldDeleteDropp === true) await DroppAccessor.remove(this.dropp);
      delete this.dropp;
      delete this.details;
      delete this.shouldDeleteDropp;
      Log.afterEach(testName, removeDroppTitle, false);
      done();
    });

    const it1 = 'throws an error for an invalid current user';
    it(it1, async (done) => {
      Log.it(testName, updateDroppTextTitle, it1, true);
      try {
        const result = await DroppMiddleware.remove(null, this.details);
        expect(result).not.toBeDefined();
        Log.log(testName, removeDroppTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(testName, removeDroppTitle, error.details);
      }

      Log.it(testName, updateDroppTextTitle, it1, false);
      done();
    });

    const it2 = 'throws an error for null details';
    it(it2, async (done) => {
      Log.it(testName, removeDroppTitle, it2, true);
      try {
        const result = await DroppMiddleware.remove(this.user, null);
        expect(result).not.toBeDefined();
        Log.log(testName, removeDroppTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('id');
        Log.log(testName, removeDroppTitle, error.details);
      }

      Log.it(testName, removeDroppTitle, it2, false);
      done();
    });

    const it3 = 'throws an error for a non-existent dropp ID';
    it(it3, async (done) => {
      Log.it(testName, removeDroppTitle, it3, true);
      this.details.id = Utils.newUuid();
      try {
        const result = await DroppMiddleware.remove(this.user, this.details);
        expect(result).not.toBeDefined();
        Log.log(testName, removeDroppTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.ResourceDNE.type);
        expect(error.details.error.message).toBe('That dropp does not exist');
        Log.log(testName, removeDroppTitle, error.details);
      }

      Log.it(testName, removeDroppTitle, it3, false);
      done();
    });

    const it4 = 'throws an error for updating a different user\'s dropp';
    it(it4, async (done) => {
      Log.it(testName, removeDroppTitle, it4, true);
      const uuid = Utils.newUuid();
      const user = new User({
        username: uuid,
        email: `${uuid}@${uuid}.com`,
      });

      try {
        const result = await DroppMiddleware.remove(user, this.details);
        expect(result).not.toBeDefined();
        Log.log(testName, removeDroppTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message).toBe('Unauthorized to access that');
        Log.log(testName, removeDroppTitle, error.details);
      }

      Log.it(testName, removeDroppTitle, it4, false);
      done();
    });

    const it5 = 'removes a dropp';
    it(it5, async (done) => {
      Log.it(testName, removeDroppTitle, it5, true);
      this.shouldDeleteDropp = false;
      const result = await DroppMiddleware.remove(this.user, this.details);
      expect(result.success.message).toBe('Successful dropp removal');
      const dropp = await DroppAccessor.get(this.dropp.id);
      expect(dropp).toBeNull();
      Log.log(testName, removeDroppTitle, result);
      Log.it(testName, removeDroppTitle, it5, false);
      done();
    });

    const removeDroppWithPhotoTitle = 'Remove dropp with photo';
    describe(removeDroppWithPhotoTitle, () => {
      let originalTimeout;
      beforeEach(async (done) => {
        Log.beforeEach(testName, removeDroppWithPhotoTitle, true);
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

        this.dropp2 = new Dropp({
          text: 'test',
          media: 'true',
          username: this.user.username,
          timestamp: 1,
          location: new Location({
            latitude: 0,
            longitude: 0,
          }),
        });

        await DroppAccessor.add(this.dropp2);
        this.details2 = { id: this.dropp2.id };
        const result = await Helper.copyLocalFile('test_image_001.png');
        const details = {
          id: this.dropp2.id,
          filePath: result.path,
        };

        await DroppMiddleware.addPhoto(this.user, details);
        Log.beforeEach(testName, removeDroppWithPhotoTitle, false);
        done();
      });

      afterEach(() => {
        Log.afterEach(testName, removeDroppWithPhotoTitle, true);
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
        Log.afterEach(testName, removeDroppWithPhotoTitle, false);
      });

      const it6 = 'removes a dropp and it\'s photo';
      it(it6, async (done) => {
        Log.it(testName, removeDroppWithPhotoTitle, it6, true);
        const result = await DroppMiddleware.remove(this.user, this.details2);
        expect(result.success.message).toBe('Successful dropp removal');
        const dropp = await DroppAccessor.get(this.dropp2.id);
        expect(dropp).toBeNull();
        try {
          const result2 = await CloudStorage.get(
            Constants.middleware.dropp.cloudStorageFolder,
            this.dropp2.id
          );
          expect(result2).not.toBeDefined();
          Log.log(testName, removeDroppWithPhotoTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('StorageError');
          expect(error.details.type).toBe(StorageError.type.FileDoesNotExist.type);
          Log.log(testName, removeDroppWithPhotoTitle, error.details);
        }

        Log.log(testName, removeDroppTitle, result);
        Log.it(testName, removeDroppWithPhotoTitle, it6, false);
        done();
      });
    });
  });
});

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
const StorageError = require('../../../src/errors/StorageError');
const DroppMiddleware = require('../../../src/middleware/dropp');

const testName = 'Dropp Middleware';
Firebase.start(process.env.MOCK === '1');
/* eslint-disable no-undef */
describe(testName, () => {
  beforeEach(async (done) => {
    const uuid = Utils.newUuid();
    this.user = new User({
      username: uuid,
      email: `${uuid}@${uuid}.com`,
    });

    await UserAccessor.create(this.user, uuid);
    done();
  });

  afterEach(async (done) => {
    await UserAccessor.remove(this.user);
    delete this.user;
    done();
  });

  const getDroppTitle = 'Get dropp';
  describe(getDroppTitle, () => {
    beforeEach(async (done) => {
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
      done();
    });

    afterEach(async (done) => {
      await DroppAccessor.remove(this.dropp);
      delete this.location;
      delete this.dropp;
      done();
    });

    it('throws an error for an invalid current user', async (done) => {
      try {
        const result = await DroppMiddleware.get(null, this.droppIdDetails);
        expect(result).not.toBeDefined();
        Log(testName, getDroppTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log(testName, getDroppTitle, error.details);
      }

      done();
    });

    it('throws an error for null details', async (done) => {
      try {
        const result = await DroppMiddleware.get(this.user, null);
        expect(result).not.toBeDefined();
        Log(testName, getDroppTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('id');
        Log(testName, getDroppTitle, error.details);
      }

      done();
    });

    it('throws an error for an invalid dropp ID', async (done) => {
      const invalidDetails = { id: '$' };
      try {
        const result = await DroppMiddleware.get(this.user, invalidDetails);
        expect(result).not.toBeDefined();
        Log(testName, getDroppTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('id');
        Log(testName, getDroppTitle, error.details);
      }

      done();
    });

    it('throws an error for a non-existent dropp', async (done) => {
      const details = { id: Utils.newUuid() };
      try {
        const result = await DroppMiddleware.get(this.user, details);
        expect(result).not.toBeDefined();
        Log(testName, getDroppTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.ResourceDNE.type);
        expect(error.details.error.message).toBe('That dropp does not exist');
        Log(testName, getDroppTitle, error.details);
      }

      done();
    });

    it('gets a dropp', async (done) => {
      const result = await DroppMiddleware.get(this.user, this.droppIdDetails);
      expect(result.id).toBe(this.dropp.id);
      expect(result.text).toBe(this.dropp.text);
      expect(result.media).toBe(this.dropp.media);
      expect(result.username).toBe(this.dropp.username);
      expect(result.timestamp).toBe(this.dropp.timestamp);
      expect(result.location.latitude).toBe(this.dropp.location.latitude);
      expect(result.location.longitude).toBe(this.dropp.location.longitude);
      Log(testName, getDroppTitle, result);
      done();
    });
  });

  const getByUserTitle = 'Get dropps by user';
  describe(getByUserTitle, () => {
    beforeEach(async (done) => {
      const uuid = Utils.newUuid();
      this.user2 = new User({
        username: uuid,
        email: `${uuid}@${uuid}.com`,
      });

      await UserAccessor.create(this.user2, uuid);
      done();
    });

    afterEach(async (done) => {
      await UserAccessor.remove(this.user2);
      delete this.user2;
      done();
    });

    it('throws an error for an invalid current user', async (done) => {
      try {
        const result = await DroppMiddleware.getByUser(null, this.droppIdDetails);
        expect(result).not.toBeDefined();
        Log(testName, getByUserTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log(testName, getByUserTitle, error.details);
      }

      done();
    });

    it('throws an error for null details', async (done) => {
      try {
        const result = await DroppMiddleware.getByUser(this.user, null);
        expect(result).not.toBeDefined();
        Log(testName, getByUserTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('username');
        Log(testName, getByUserTitle, error.details);
      }

      done();
    });

    it('throws an error for an invalid username', async (done) => {
      const invalidDetails = { username: '$' };
      try {
        const result = await DroppMiddleware.getByUser(this.user, invalidDetails);
        expect(result).not.toBeDefined();
        Log(testName, getByUserTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('username');
        Log(testName, getByUserTitle, error.details);
      }

      done();
    });

    it('throws an error for a non-existent user', async (done) => {
      const details = { username: Utils.newUuid() };
      try {
        const result = await DroppMiddleware.getByUser(this.user, details);
        expect(result).not.toBeDefined();
        Log(testName, getByUserTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.ResourceDNE.type);
        expect(error.details.error.message).toBe('That user does not exist');
        Log(testName, getByUserTitle, error.details);
      }

      done();
    });

    it('throws an error for an unfollowed user', async (done) => {
      const details = { username: this.user2.username };
      try {
        const result = await DroppMiddleware.getByUser(this.user, details);
        expect(result).not.toBeDefined();
        Log(testName, getByUserTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message).toBe('You must follow that user see their dropps');
        Log(testName, getByUserTitle, error.details);
      }

      done();
    });

    const getDroppsByUserSuccessTitle = 'Get dropps by user success';
    describe(getDroppsByUserSuccessTitle, () => {
      beforeEach(async (done) => {
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
        done();
      });

      afterEach(async (done) => {
        await DroppAccessor.remove(this.dropp1);
        await DroppAccessor.remove(this.dropp2);
        delete this.location;
        delete this.dropp1;
        delete this.dropp2;
        await UserAccessor.removeFollow(this.user, this.user2);
        done();
      });

      it('gets dropps posted by the same user', async (done) => {
        const details = { username: this.user.username };
        const result = await DroppMiddleware.getByUser(this.user, details);
        expect(result.success.count).toBe(1);
        expect(result.success.dropps[0].id).toBe(this.dropp1.id);
        Log(testName, getDroppsByUserSuccessTitle, result);
        done();
      });

      it('gets dropps posted by a user\'s follow', async (done) => {
        const details = { username: this.user2.username };
        const result = await DroppMiddleware.getByUser(this.user, details);
        expect(result.success.count).toBe(1);
        expect(result.success.dropps[0].id).toBe(this.dropp2.id);
        Log(testName, getDroppsByUserSuccessTitle, result);
        done();
      });
    });
  });

  const getByFollowsTitle = 'Get dropps by follows';
  describe(getByFollowsTitle, () => {
    beforeEach(async (done) => {
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
      done();
    });

    afterEach(async (done) => {
      await DroppAccessor.remove(this.dropp1);
      await UserAccessor.removeFollow(this.user, this.user2);
      await UserAccessor.remove(this.user2);
      delete this.user2;
      delete this.location;
      delete this.dropp1;
      done();
    });

    it('throws an error for an invalid current user', async (done) => {
      try {
        const result = await DroppMiddleware.getByFollows(null, this.droppIdDetails);
        expect(result).not.toBeDefined();
        Log(testName, getByFollowsTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log(testName, getByFollowsTitle, error.details);
      }

      done();
    });

    it('throws an error for null details', async (done) => {
      try {
        const result = await DroppMiddleware.getByFollows(this.user, null);
        expect(result).not.toBeDefined();
        Log(testName, getByFollowsTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('username');
        Log(testName, getByFollowsTitle, error.details);
      }

      done();
    });

    it('throws an error for an invalid username', async (done) => {
      const invalidDetails = { username: '$' };
      try {
        const result = await DroppMiddleware.getByFollows(this.user, invalidDetails);
        expect(result).not.toBeDefined();
        Log(testName, getByFollowsTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('username');
        Log(testName, getByFollowsTitle, error.details);
      }

      done();
    });

    it('throws an error for a different user', async (done) => {
      const details = { username: this.user2.username };
      try {
        const result = await DroppMiddleware.getByFollows(this.user, details);
        expect(result).not.toBeDefined();
        Log(testName, getByFollowsTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message).toBe('Unauthorized to access that user\'s follows');
        Log(testName, getByFollowsTitle, error.details);
      }

      done();
    });

    it('throws an error for a non-existent user', async (done) => {
      const uuid = Utils.newUuid();
      const user = new User({
        username: uuid,
        email: `${uuid}@${uuid}.com`,
      });
      const details = { username: user.username };

      try {
        const result = await DroppMiddleware.getByFollows(user, details);
        expect(result).not.toBeDefined();
        Log(testName, getByFollowsTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log(testName, getByFollowsTitle, error.details);
      }

      done();
    });

    it('returns dropps posted by the user\'s follows', async (done) => {
      const details = { username: this.user.username };
      const result = await DroppMiddleware.getByFollows(this.user, details);
      expect(result.success.count).toBe(1);
      expect(result.success.dropps[0].id).toBe(this.dropp1.id);
      Log(testName, getByFollowsTitle, result);
      done();
    });
  });

  const getByLocationTitle = 'Get dropps by location';
  describe(getByLocationTitle, () => {
    beforeEach(async (done) => {
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
      done();
    });

    afterEach(async (done) => {
      await DroppAccessor.remove(this.dropp1);
      delete this.dropp1;
      delete this.location;
      done();
    });

    it('throws an error for an invalid current user', async (done) => {
      try {
        const result = await DroppMiddleware.getByLocation(null, this.location.databaseData);
        expect(result).not.toBeDefined();
        Log(testName, getByLocationTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log(testName, getByLocationTitle, error.details);
      }

      done();
    });

    it('throws an error for null details', async (done) => {
      try {
        const result = await DroppMiddleware.getByLocation(this.user, null);
        expect(result).not.toBeDefined();
        Log(testName, getByLocationTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('latitude,longitude');
        Log(testName, getByLocationTitle, error.details);
      }

      done();
    });

    it('throws an error for invalid latitude', async (done) => {
      const details = {
        latitude: '$',
        longitude: '0',
      };

      try {
        const result = await DroppMiddleware.getByLocation(this.user, details);
        expect(result).not.toBeDefined();
        Log(testName, getByLocationTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('latitude,longitude');
        Log(testName, getByLocationTitle, error.details);
      }

      done();
    });

    it('throws an error for invalid longitude', async (done) => {
      const details = {
        latitude: '0',
        longitude: '$',
      };

      try {
        const result = await DroppMiddleware.getByLocation(this.user, details);
        expect(result).not.toBeDefined();
        Log(testName, getByLocationTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('latitude,longitude');
        Log(testName, getByLocationTitle, error.details);
      }

      done();
    });

    it('returns dropps around a location', async (done) => {
      const result = await DroppMiddleware.getByLocation(this.user, this.location.databaseData);
      expect(result.success.count).toBe(1);
      expect(result.success.dropps[0].id).toBe(this.dropp1.id);
      Log(testName, getByLocationTitle, result);
      done();
    });
  });

  const createDroppTitle = 'Create dropp';
  describe(createDroppTitle, () => {
    beforeEach(() => {
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
    });

    afterEach(() => {
      delete this.droppInfo;
    });

    it('throws an error for an invalid current user', async (done) => {
      try {
        const result = await DroppMiddleware.create(null, this.droppInfo);
        expect(result).not.toBeDefined();
        Log(testName, createDroppTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log(testName, createDroppTitle, error.details);
      }

      done();
    });

    it('throws an error for null details', async (done) => {
      try {
        const result = await DroppMiddleware.create(this.user, null);
        expect(result).not.toBeDefined();
        Log(testName, createDroppTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('text,media,username,timestamp,location');
        Log(testName, createDroppTitle, error.details);
      }

      done();
    });

    it('throws an error for invalid location details', async (done) => {
      delete this.droppInfo.location.latitude;
      delete this.droppInfo.location.longitude;
      try {
        const result = await DroppMiddleware.create(this.user, this.droppInfo);
        expect(result).not.toBeDefined();
        Log(testName, createDroppTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('latitude,longitude');
        Log(testName, createDroppTitle, error.details);
      }

      done();
    });

    it('throws an error for no media and empty text', async (done) => {
      this.droppInfo.text = '';
      try {
        const result = await DroppMiddleware.create(this.user, this.droppInfo);
        expect(result).not.toBeDefined();
        Log(testName, createDroppTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message).toBe('This dropp must contain non-empty text');
        Log(testName, createDroppTitle, error.details);
      }

      done();
    });

    const createDroppSuccessTitle = 'Create dropp success';
    describe(createDroppSuccessTitle, () => {
      afterEach(async (done) => {
        await DroppAccessor.remove(this.dropp);
        delete this.dropp;
        done();
      });

      it('creates a dropp and returns an ID', async (done) => {
        const result = await DroppMiddleware.create(this.user, this.droppInfo);
        expect(result.success.message).toBe('Successful dropp creation');
        expect(typeof result.success.droppId).toBe('string');
        expect(result.success.droppId.length > 0).toBe(true);
        this.dropp = await DroppAccessor.get(result.success.droppId);
        expect(this.dropp.id).toBe(result.success.droppId);
        Log(testName, createDroppSuccessTitle, result);
        done();
      });

      it('creates a dropp with media and no text', async (done) => {
        this.droppInfo.text = '\t';
        this.droppInfo.media = 'true';
        const result = await DroppMiddleware.create(this.user, this.droppInfo);
        expect(result.success.message).toBe('Successful dropp creation');
        expect(typeof result.success.droppId).toBe('string');
        expect(result.success.droppId.length > 0).toBe(true);
        this.dropp = await DroppAccessor.get(result.success.droppId);
        expect(this.dropp.id).toBe(result.success.droppId);
        expect(this.dropp.text).toBe('');
        Log(testName, createDroppSuccessTitle, result);
        done();
      });
    });
  });

  const addPhotoTitle = 'Add photo to dropp';
  describe(addPhotoTitle, () => {
    beforeEach(async (done) => {
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
      done();
    });

    afterEach(async (done) => {
      await DroppAccessor.remove(this.dropp);
      if (this.shouldDeleteLocalFile === true) await Utils.deleteLocalFile(this.details.filePath);
      delete this.dropp;
      delete this.details;
      done();
    });

    it('throws an error for an invalid current user', async (done) => {
      this.shouldDeleteLocalFile = true;
      try {
        const result = await DroppMiddleware.addPhoto(null, this.details);
        expect(result).not.toBeDefined();
        Log(testName, addPhotoTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log(testName, addPhotoTitle, error.details);
      }

      done();
    });

    it('throws an error for null details', async (done) => {
      this.shouldDeleteLocalFile = true;
      try {
        const result = await DroppMiddleware.addPhoto(this.user, null);
        expect(result).not.toBeDefined();
        Log(testName, addPhotoTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('id,image');
        Log(testName, addPhotoTitle, error.details);
      }

      done();
    });

    it('throws an error for an invalid dropp ID', async (done) => {
      this.shouldDeleteLocalFile = true;
      delete this.details.id;
      try {
        const result = await DroppMiddleware.addPhoto(this.user, this.details);
        expect(result).not.toBeDefined();
        Log(testName, addPhotoTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('id');
        Log(testName, addPhotoTitle, error.details);
      }

      done();
    });

    it('throws an error for an invalid file path', async (done) => {
      this.shouldDeleteLocalFile = true;
      const details = { id: this.details.id };
      try {
        const result = await DroppMiddleware.addPhoto(this.user, details);
        expect(result).not.toBeDefined();
        Log(testName, addPhotoTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('image');
        Log(testName, addPhotoTitle, error.details);
      }

      done();
    });

    it('throws an error for an invalid file type', async (done) => {
      await Utils.deleteLocalFile(this.details.filePath);
      this.details.filePath = await Helper.createLocalTextFile();
      try {
        const result = await DroppMiddleware.addPhoto(this.user, this.details);
        expect(result).not.toBeDefined();
        Log(testName, addPhotoTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message).toBe('Image must be PNG or JPG');
        Log(testName, addPhotoTitle, error.details);
      }

      done();
    });

    it('throws an error for adding a photo to a non-existent dropp', async (done) => {
      this.details.id = Utils.newUuid();
      try {
        const result = await DroppMiddleware.addPhoto(this.user, this.details);
        expect(result).not.toBeDefined();
        Log(testName, addPhotoTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.ResourceDNE.type);
        expect(error.details.error.message).toBe('That dropp does not exist');
        Log(testName, addPhotoTitle, error.details);
      }

      done();
    });

    it('throws an error for adding a photo to a different user\'s dropp', async (done) => {
      const uuid = Utils.newUuid();
      const user = new User({
        username: uuid,
        email: `${uuid}@${uuid}.com`,
      });

      try {
        const result = await DroppMiddleware.addPhoto(user, this.details);
        expect(result).not.toBeDefined();
        Log(testName, addPhotoTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message).toBe('Unauthorized to add a photo to that dropp');
        Log(testName, addPhotoTitle, error.details);
      }

      done();
    });

    it('throws an error for a dropp that cannot have a photo', async (done) => {
      try {
        const result = await DroppMiddleware.addPhoto(this.user, this.details);
        expect(result).not.toBeDefined();
        Log(testName, addPhotoTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message).toBe('This dropp cannot have a photo added to it');
        Log(testName, addPhotoTitle, error.details);
      }

      done();
    });

    const addPhotoExistingPhotoTitle = 'Add photo existing photo error';
    describe(addPhotoExistingPhotoTitle, () => {
      beforeEach(async (done) => {
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
        done();
      });

      afterEach(async (done) => {
        await DroppAccessor.remove(this.dropp2);
        delete this.dropp2;
        delete this.details2;
        done();
      });

      it('throws an error for an already added photo', async (done) => {
        try {
          const result = await DroppMiddleware.addPhoto(this.user, this.details2);
          expect(result).not.toBeDefined();
          Log(testName, addPhotoTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message).toBe('A photo has already been added to this dropp');
          Log(testName, addPhotoTitle, error.details);
        }

        done();
      });
    });

    const addPhotoSuccessTitle = 'Add photo success';
    describe(addPhotoSuccessTitle, () => {
      beforeEach(async (done) => {
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

        done();
      });

      afterEach(async (done) => {
        await DroppAccessor.remove(this.dropp2);
        delete this.dropp2;
        delete this.details2;
        done();
      });

      it('adds a photo to a dropp', async (done) => {
        const result = await DroppMiddleware.addPhoto(this.user, this.details2);
        expect(result.success.message).toBe('Successful photo creation');
        Log(testName, addPhotoSuccessTitle, result);
        done();
      });
    });
  });

  const updateDroppTextTitle = 'Update dropp text';
  describe(updateDroppTextTitle, () => {
    beforeEach(async (done) => {
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

      done();
    });

    afterEach(async (done) => {
      await DroppAccessor.remove(this.dropp);
      delete this.dropp;
      delete this.details;
      done();
    });

    it('throws an error for an invalid current user', async (done) => {
      try {
        const result = await DroppMiddleware.updateText(null, this.details);
        expect(result).not.toBeDefined();
        Log(testName, updateDroppTextTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log(testName, updateDroppTextTitle, error.details);
      }

      done();
    });

    it('throws an error for null details', async (done) => {
      try {
        const result = await DroppMiddleware.updateText(this.user, null);
        expect(result).not.toBeDefined();
        Log(testName, updateDroppTextTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('id,newText');
        Log(testName, updateDroppTextTitle, error.details);
      }

      done();
    });

    it('throws an error for a non-existent dropp ID', async (done) => {
      this.details.id = Utils.newUuid();
      try {
        const result = await DroppMiddleware.updateText(this.user, this.details);
        expect(result).not.toBeDefined();
        Log(testName, updateDroppTextTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.ResourceDNE.type);
        expect(error.details.error.message).toBe('That dropp does not exist');
        Log(testName, updateDroppTextTitle, error.details);
      }

      done();
    });

    it('throws an error for updating a different user\'s dropp', async (done) => {
      const uuid = Utils.newUuid();
      const user = new User({
        username: uuid,
        email: `${uuid}@${uuid}.com`,
      });

      try {
        const result = await DroppMiddleware.updateText(user, this.details);
        expect(result).not.toBeDefined();
        Log(testName, updateDroppTextTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message).toBe('Unauthorized to update that dropp\'s text');
        Log(testName, updateDroppTextTitle, error.details);
      }

      done();
    });

    it('throws an error for updating a dropp with the same text', async (done) => {
      this.details.newText = this.dropp.text;
      try {
        const result = await DroppMiddleware.updateText(this.user, this.details);
        expect(result).not.toBeDefined();
        Log(testName, updateDroppTextTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message).toBe('New text must be different than existing text');
        Log(testName, updateDroppTextTitle, error.details);
      }

      done();
    });

    it('throws an error for updating a dropp with no media and empty text', async (done) => {
      this.details.newText = '\t';
      try {
        const result = await DroppMiddleware.updateText(this.user, this.details);
        expect(result).not.toBeDefined();
        Log(testName, updateDroppTextTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message).toBe('This dropp must contain non-empty text');
        Log(testName, updateDroppTextTitle, error.details);
      }

      done();
    });

    it('updates a dropp\'s text', async (done) => {
      const result = await DroppMiddleware.updateText(this.user, this.details);
      expect(result.success.message).toBe('Successful text update');
      const dropp = await DroppAccessor.get(this.dropp.id);
      expect(dropp.text).toBe(this.details.newText.trim());
      Log(testName, updateDroppTextTitle, result);
      done();
    });
  });

  const removeDroppTitle = 'Remove dropp';
  describe(removeDroppTitle, () => {
    beforeEach(async (done) => {
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
      done();
    });

    afterEach(async (done) => {
      await DroppAccessor.remove(this.dropp);
      delete this.dropp;
      delete this.details;
      done();
    });

    it('throws an error for an invalid current user', async (done) => {
      try {
        const result = await DroppMiddleware.remove(null, this.details);
        expect(result).not.toBeDefined();
        Log(testName, removeDroppTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log(testName, removeDroppTitle, error.details);
      }

      done();
    });

    it('throws an error for null details', async (done) => {
      try {
        const result = await DroppMiddleware.remove(this.user, null);
        expect(result).not.toBeDefined();
        Log(testName, removeDroppTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('id');
        Log(testName, removeDroppTitle, error.details);
      }

      done();
    });

    it('throws an error for a non-existent dropp ID', async (done) => {
      this.details.id = Utils.newUuid();
      try {
        const result = await DroppMiddleware.remove(this.user, this.details);
        expect(result).not.toBeDefined();
        Log(testName, removeDroppTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.ResourceDNE.type);
        expect(error.details.error.message).toBe('That dropp does not exist');
        Log(testName, removeDroppTitle, error.details);
      }

      done();
    });

    it('throws an error for updating a different user\'s dropp', async (done) => {
      const uuid = Utils.newUuid();
      const user = new User({
        username: uuid,
        email: `${uuid}@${uuid}.com`,
      });

      try {
        const result = await DroppMiddleware.remove(user, this.details);
        expect(result).not.toBeDefined();
        Log(testName, removeDroppTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message).toBe('Unauthorized to remove that dropp');
        Log(testName, removeDroppTitle, error.details);
      }

      done();
    });

    const removeDroppSuccessTitle = 'Remove dropp success';
    describe(removeDroppSuccessTitle, () => {
      beforeEach(async (done) => {
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
        done();
      });

      it('removes a dropp', async (done) => {
        const result = await DroppMiddleware.remove(this.user, this.details2);
        expect(result.success.message).toBe('Successful dropp removal');
        const dropp = await DroppAccessor.get(this.dropp2.id);
        expect(dropp).toBeNull();
        try {
          const result2 = await CloudStorage.get(
            DroppMiddleware.cloudStorageFolder,
            this.dropp2.id
          );
          expect(result2).not.toBeDefined();
          Log(testName, removeDroppSuccessTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('StorageError');
          expect(error.details.type).toBe(StorageError.type.FileDoesNotExist.type);
          Log(testName, removeDroppSuccessTitle, error.details);
        }

        Log(testName, removeDroppTitle, result);
        done();
      });
    });
  });
});

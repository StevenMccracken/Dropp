const Log = require('../../logger');
const User = require('../../../src/models/User');
const Dropp = require('../../../src/models/Dropp');
const Utils = require('../../../src/utilities/utils');
const Location = require('../../../src/models/Location');
const Firebase = require('../../../src/firebase/firebase');
const UserAccessor = require('../../../src/database/user');
const DroppError = require('../../../src/errors/DroppError');
const DroppAccessor = require('../../../src/database/dropp');
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

    it('throws an error for an invalid dropp ID', async (done) => {
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

    it('throws an error for a non-existent dropp', async (done) => {
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
        await UserAccessor.removeFollow(this.user, this.user2);
        done();
      });

      it('gets dropps posted by the same user', async (done) => {
        const details = { username: this.user.username };
        const result = await DroppMiddleware.getByUser(this.user, details);
        expect(result.count).toBe(1);
        expect(result.dropps[0].id).toBe(this.dropp1.id);
        Log(testName, getDroppsByUserSuccessTitle, result);
        done();
      });

      it('gets dropps posted by a user\'s follow', async (done) => {
        const details = { username: this.user2.username };
        const result = await DroppMiddleware.getByUser(this.user, details);
        expect(result.count).toBe(1);
        expect(result.dropps[0].id).toBe(this.dropp2.id);
        Log(testName, getDroppsByUserSuccessTitle, result);
        done();
      });
    });
  });
});

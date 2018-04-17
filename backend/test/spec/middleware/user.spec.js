const Log = require('../../logger');
const Utils = require('../../../src/utilities/utils');
const Firebase = require('../../../src/firebase/firebase');
const UserAccessor = require('../../../src/database/user');
const DroppError = require('../../../src/errors/DroppError');
const UserMiddleware = require('../../../src/middleware/user');

/* eslint-disable no-undef */
Firebase.start();
describe('User Middleware tests', () => {
  this.password = 'test';
  this.uuid = Utils.newUuid();
  this.testUserData = {
    username: this.uuid,
    password: this.password,
    email: `${this.uuid}@${this.uuid}.com`,
  };

  beforeEach(async (done) => {
    this.testUser = await UserMiddleware.create(this.testUserData);
    done();
  });

  afterEach(async (done) => {
    await UserMiddleware.remove(this.testUser, this.testUser.username);
    delete this.testUser;
    done();
  });

  this.uuid2 = Utils.newUuid();
  const createUserTitle = 'Create user';
  describe(createUserTitle, () => {
    const testUserData2 = {
      username: this.uuid2,
      password: this.password,
      email: `${this.uuid2}@${this.uuid2}.com`,
    };

    it('creates a user', async (done) => {
      this.newUser = await UserMiddleware.create(testUserData2);
      expect(this.newUser).toBeDefined();
      expect(this.newUser.email).toBe(testUserData2.email);
      expect(this.newUser.username).toBe(testUserData2.username);
      expect(this.newUser.password).not.toBe(testUserData2.password);
      Log(`User Middleware ${createUserTitle}`, this.newUser);
      done();
    });
  });

  const getSameUserTitle = 'Get same user';
  describe(getSameUserTitle, () => {
    const details = { username: this.uuid2 };
    it('retrieves a user\'s private details', async (done) => {
      const user = await UserMiddleware.get(this.newUser, details);
      expect(user).toBeDefined();
      expect(user.email).toBe(this.newUser.email);
      expect(user.username).toBe(this.uuid2);
      expect(user.follows).toBeDefined();
      expect(typeof user.follows).toBe('object');
      expect(user.followers).toBeDefined();
      expect(typeof user.followers).toBe('object');
      expect(user.followsCount).toBeDefined();
      expect(typeof user.followsCount).toBe('number');
      expect(user.followerCount).toBeDefined();
      expect(typeof user.followerCount).toBe('number');
      expect(user.followRequests).toBeDefined();
      expect(typeof user.followRequests).toBe('object');
      expect(user.followerRequests).toBeDefined();
      expect(typeof user.followerRequests).toBe('object');
      expect(user.followRequestCount).toBeDefined();
      expect(typeof user.followRequestCount).toBe('number');
      expect(user.followerRequestCount).toBeDefined();
      expect(typeof user.followerRequestCount).toBe('number');
      Log(`User Middleware ${getSameUserTitle}`, user);
      done();
    });
  });

  const getDifferentUserTitle = 'Get different user';
  describe(getDifferentUserTitle, () => {
    const details = { username: this.uuid2 };
    it('retrieves a user\'s public details', async (done) => {
      const user = await UserMiddleware.get(this.testUser, details);
      expect(user).toBeDefined();
      expect(user.email).not.toBeDefined();
      expect(user.username).toBe(this.uuid2);
      expect(user.follows).toBeDefined();
      expect(user.followers).toBeDefined();
      expect(user.followsCount).toBeDefined();
      expect(user.followerCount).toBeDefined();
      expect(user.followRequests).not.toBeDefined();
      expect(user.followerRequests).not.toBeDefined();
      expect(user.followRequestCount).not.toBeDefined();
      expect(user.followerRequestCount).not.toBeDefined();
      Log(`User Middleware ${getDifferentUserTitle}`, user);
      done();
    });
  });

  const createNewUserTitle = 'Create new user';
  describe(createNewUserTitle, () => {
    const uuid3 = Utils.newUuid();
    const testUserData3 = {
      username: uuid3,
      password: this.password,
      email: `${uuid3}@${uuid3}.com`,
    };

    afterEach(async (done) => {
      const user = await UserAccessor.get(testUserData3.username);
      await UserMiddleware.remove(user, testUserData3.username);
      done();
    });

    it('creates a new user', async (done) => {
      const result = await UserMiddleware.addNewUser(testUserData3);
      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      expect(result.success.token).toBeDefined();
      expect(typeof result.success.token).toBe('string');
      expect(result.success.token).toContain('Bearer');
      Log(`User Middleware ${createNewUserTitle}`, result);
      done();
    });
  });

  const getAuthTokenTitle = 'Get authentication token';
  describe(getAuthTokenTitle, () => {
    it('gets an authentication token', async (done) => {
      const details = {
        username: this.testUser.username,
        password: this.password,
      };

      const result = await UserMiddleware.getAuthToken(details);
      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      expect(result.success.token).toBeDefined();
      expect(typeof result.success.token).toBe('string');
      expect(result.success.token).toContain('Bearer');
      Log(`User Middleware ${getAuthTokenTitle}`, result);
      done();
    });
  });

  const updatePasswordTitle = 'Update password';
  describe(updatePasswordTitle, () => {
    it('updates the user\'s password', async (done) => {
      const details = {
        oldPassword: this.password,
        newPassword: 'test2',
      };

      /* eslint-disable max-len */
      const result = await UserMiddleware.updatePassword(this.testUser, this.testUser.username, details);
      /* eslint-enable max-len */
      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      expect(result.success.token).toBeDefined();
      expect(typeof result.success.token).toBe('string');
      expect(result.success.token).toContain('Bearer');
      Log(`User Middleware ${updatePasswordTitle}`, result);
      done();
    });
  });

  const updateEmailTitle = 'Update email';
  describe(updateEmailTitle, () => {
    it('updates the user\'s email', async (done) => {
      const uuid = Utils.newUuid();
      const details = { newEmail: `${uuid}@${uuid}.com` };
      /* eslint-disable max-len */
      const result = await UserMiddleware.updateEmail(this.testUser, this.testUser.username, details);
      /* eslint-enable max-len */
      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      expect(result.success.message).toBeDefined();
      expect(typeof result.success.message).toBe('string');
      expect(result.success.message).toContain('email');
      Log(`User Middleware ${updateEmailTitle}`, result);
      done();
    });
  });

  const interUserFunctionsTitle = 'Inter-user functions';
  describe(interUserFunctionsTitle, () => {
    beforeEach(async (done) => {
      const uuid = Utils.newUuid();
      const data = {
        username: uuid,
        password: uuid,
        email: `${uuid}@${uuid}.com`,
      };

      this.testUser2 = await UserMiddleware.create(data);
      done();
    });

    afterEach(async (done) => {
      await UserMiddleware.remove(this.testUser2, this.testUser2.username);
      delete this.testUser2;
      done();
    });

    const requestToFollowTitle = 'Request to follow user';
    describe(requestToFollowTitle, () => {
      it('adds a follow request for the user', async (done) => {
        const result = await UserMiddleware.requestToFollow(this.testUser, this.testUser2.username);
        expect(result).toBeDefined();
        expect(result.success).toBeDefined();
        expect(result.success.message).toBeDefined();
        expect(typeof result.success.message).toBe('string');
        expect(result.success.message).toContain('follow request');
        expect(this.testUser.followRequests.includes(this.testUser2.username)).toBe(true);
        Log(`User Middleware ${requestToFollowTitle}`, result);
        done();
      });
    });

    const removeFollowRequestTitle = 'Remove follow request';
    describe(removeFollowRequestTitle, () => {
      beforeEach(async (done) => {
        await UserMiddleware.requestToFollow(this.testUser, this.testUser2.username);
        done();
      });

      it('removes a follow request to the user', async (done) => {
        /* eslint-disable max-len */
        const result = await UserMiddleware.removeFollowRequest(this.testUser, this.testUser2.username);
        /* eslint-enable max-len */
        expect(result).toBeDefined();
        expect(result.success).toBeDefined();
        expect(result.success.message).toBeDefined();
        expect(typeof result.success.message).toBe('string');
        expect(result.success.message).toContain('removal');
        expect(this.testUser.followRequests.includes(this.testUser2.username)).toBe(false);
        Log(`User Middleware ${removeFollowRequestTitle}`, result);
        done();
      });
    });

    const respondToFollowerRequestTitle = 'Respond to follow request';
    describe(respondToFollowerRequestTitle, () => {
      beforeEach(async (done) => {
        await UserMiddleware.requestToFollow(this.testUser, this.testUser2.username);
        done();
      });

      it('accepts a follower request', async (done) => {
        const details = { accept: true };
        /* eslint-disable max-len */
        const result = await UserMiddleware.respondToFollowerRequest(this.testUser2, this.testUser.username, details);
        /* eslint-enable max-len */
        expect(result).toBeDefined();
        expect(result.success).toBeDefined();
        expect(result.success.message).toBeDefined();
        expect(typeof result.success.message).toBe('string');
        expect(result.success.message).toContain('acceptance');
        expect(this.testUser2.followerRequests.includes(this.testUser.username)).toBe(false);
        expect(this.testUser2.followers.includes(this.testUser.username)).toBe(true);
        Log(`User Middleware ${respondToFollowerRequestTitle}`, result);
        done();
      });

      it('declines a follower request', async (done) => {
        const details = { accept: false };
        /* eslint-disable max-len */
        const result = await UserMiddleware.respondToFollowerRequest(this.testUser2, this.testUser.username, details);
        /* eslint-enable max-len */
        expect(result).toBeDefined();
        expect(result.success).toBeDefined();
        expect(result.success.message).toBeDefined();
        expect(typeof result.success.message).toBe('string');
        expect(result.success.message).toContain('denial');
        expect(this.testUser2.followerRequests.includes(this.testUser.username)).toBe(false);
        expect(this.testUser2.followers.includes(this.testUser.username)).toBe(false);
        Log(`User Middleware ${respondToFollowerRequestTitle}`, result);
        done();
      });
    });
  });

  const removeUserTitle = 'Remove user';
  describe(removeUserTitle, () => {
    it('removes a user', async (done) => {
      await UserMiddleware.remove(this.newUser, this.newUser.username);
      try {
        const user = await UserMiddleware.get(this.testUser, { username: this.newUser.username });
        expect(user).not.toBeDefined();
        Log(`User Middleware ${removeUserTitle}`, `Was able to fetch ${user.username} after removing them`);
      } catch (retrieveUserError) {
        expect(retrieveUserError.name).toBe('DroppError');
        expect(retrieveUserError.statusCode).toBe(DroppError.type.ResourceDNE.status);
        Log(`User Middleware ${removeUserTitle}`, retrieveUserError);
      }

      done();
    });
  });
});
/* eslint-enable no-undef */

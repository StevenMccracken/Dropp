const Log = require('../../logger');
const User = require('../../../src/models/User');
const Utils = require('../../../src/utilities/utils');
const Firebase = require('../../../src/firebase/firebase');
const UserAccessor = require('../../../src/database/user');
const DroppError = require('../../../src/errors/DroppError');
const UserMiddleware = require('../../../src/middleware/user');

/**
 * Logs a message for a User Middleware test
 * @param {String} _title the describe label
 * @param {String|Object} _details the log details
 */
function log(_title, _details) {
  Log(`User Middleware ${_title}`, _details);
}

Firebase.start(true);
/* eslint-disable no-undef */
describe('User Middleware Tests', () => {
  const uuid = Utils.newUuid();
  this.testUserData = {
    username: uuid,
    password: uuid,
    email: `${uuid}@${uuid}.com`,
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
    this.testUserData2 = {
      username: this.uuid2,
      password: this.uuid2,
      email: `${this.uuid2}@${this.uuid2}.com`,
    };

    it('creates a user', async (done) => {
      this.newUser = await UserMiddleware.create(this.testUserData2);
      expect(this.newUser).toBeDefined();
      expect(this.newUser.email).toBe(this.testUserData2.email);
      expect(this.newUser.username).toBe(this.testUserData2.username);
      expect(this.newUser.password).not.toBe(this.testUserData2.password);
      log(createUserTitle, this.newUser);
      done();
    });

    const invalidCreateUserTitle = 'Invalid details';
    describe(invalidCreateUserTitle, () => {
      beforeEach(() => {
        const uuid2 = Utils.newUuid();
        this.invalidUserDetails = {
          username: uuid2,
          password: uuid2,
          email: `${uuid2}@${uuid2}.com`,
        };
      });

      afterEach(() => {
        delete this.invalidUserDetails;
      });

      it('throws an error for missing username', async (done) => {
        try {
          delete this.invalidUserDetails.username;
          const result = await UserMiddleware.create(this.invalidUserDetails);
          expect(result).not.toBeDefined();
          log(invalidCreateUserTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error).toBeDefined();
          expect(error.name).toBe('DroppError');
          expect(error.details).toBeDefined();
          expect(error.details.error).toBeDefined();
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBeDefined();
          expect(typeof error.details.error.message).toBe('string');

          const invalidParameters = error.details.error.message.split(',');
          expect(invalidParameters.length).toBe(1);
          expect(invalidParameters[0]).toBe('username');
          log(invalidCreateUserTitle, error.details);
          done();
        }
      });

      it('throws an error for missing password', async (done) => {
        try {
          delete this.invalidUserDetails.password;
          const result = await UserMiddleware.create(this.invalidUserDetails);
          expect(result).not.toBeDefined();
          log(invalidCreateUserTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error).toBeDefined();
          expect(error.name).toBe('DroppError');
          expect(error.details).toBeDefined();
          expect(error.details.error).toBeDefined();
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBeDefined();
          expect(typeof error.details.error.message).toBe('string');

          const invalidParameters = error.details.error.message.split(',');
          expect(invalidParameters.length).toBe(1);
          expect(invalidParameters[0]).toBe('password');
          log(invalidCreateUserTitle, error.details);
          done();
        }
      });

      it('throws an error for missing email', async (done) => {
        try {
          delete this.invalidUserDetails.email;
          const result = await UserMiddleware.create(this.invalidUserDetails);
          expect(result).not.toBeDefined();
          log(invalidCreateUserTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error).toBeDefined();
          expect(error.name).toBe('DroppError');
          expect(error.details).toBeDefined();
          expect(error.details.error).toBeDefined();
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBeDefined();
          expect(typeof error.details.error.message).toBe('string');

          const invalidParameters = error.details.error.message.split(',');
          expect(invalidParameters.length).toBe(1);
          expect(invalidParameters[0]).toBe('email');
          log(invalidCreateUserTitle, error.details);
          done();
        }
      });

      it('throws an error for 2 missing details', async (done) => {
        try {
          delete this.invalidUserDetails.username;
          delete this.invalidUserDetails.password;
          const result = await UserMiddleware.create(this.invalidUserDetails);
          expect(result).not.toBeDefined();
          log(invalidCreateUserTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error).toBeDefined();
          expect(error.name).toBe('DroppError');
          expect(error.details).toBeDefined();
          expect(error.details.error).toBeDefined();
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBeDefined();
          expect(typeof error.details.error.message).toBe('string');

          const invalidParameters = error.details.error.message.split(',');
          expect(invalidParameters.length).toBe(2);
          expect(invalidParameters.includes('username')).toBe(true);
          expect(invalidParameters.includes('password')).toBe(true);
          log(invalidCreateUserTitle, error.details);
          done();
        }
      });

      it('throws an error for 3 missing details', async (done) => {
        try {
          delete this.invalidUserDetails.email;
          delete this.invalidUserDetails.username;
          delete this.invalidUserDetails.password;
          const result = await UserMiddleware.create(this.invalidUserDetails);
          expect(result).not.toBeDefined();
          log(invalidCreateUserTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error).toBeDefined();
          expect(error.name).toBe('DroppError');
          expect(error.details).toBeDefined();
          expect(error.details.error).toBeDefined();
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBeDefined();
          expect(typeof error.details.error.message).toBe('string');

          const invalidParameters = error.details.error.message.split(',');
          expect(invalidParameters.length).toBe(3);
          expect(invalidParameters.includes('email')).toBe(true);
          expect(invalidParameters.includes('username')).toBe(true);
          expect(invalidParameters.includes('password')).toBe(true);
          log(invalidCreateUserTitle, error.details);
          done();
        }
      });

      it('throws an error for already existing username', async (done) => {
        try {
          this.invalidUserDetails.username = this.testUserData.username;
          const result = await UserMiddleware.create(this.invalidUserDetails);
          expect(result).not.toBeDefined();
          log(invalidCreateUserTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error).toBeDefined();
          expect(error.name).toBe('DroppError');
          expect(error.details).toBeDefined();
          expect(error.details.error).toBeDefined();
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message).toBe('A user with that username already exists');
          log(invalidCreateUserTitle, error.details);
          done();
        }
      });
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
      log(getSameUserTitle, user);
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
      log(getDifferentUserTitle, user);
      done();
    });
  });

  const invalidGetUserTitle = 'Invalid get user';
  describe(invalidGetUserTitle, () => {
    beforeEach(() => {
      this.invalidDetails = {
        username: '$%l;kadfjs',
      };
    });

    afterEach(() => {
      delete this.invalidDetails;
    });

    it('throws an error for an invalid current user', async (done) => {
      try {
        const result = await UserMiddleware.get(null, this.invalidDetails);
        expect(result).not.toBeDefined();
        log(invalidGetUserTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.name).toBe('DroppError');
        expect(error.details).toBeDefined();
        expect(error.details.error).toBeDefined();
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBeDefined();
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        log(invalidGetUserTitle, error.details);
        done();
      }
    });

    it('throws an error for an invalid username', async (done) => {
      try {
        const result = await UserMiddleware.get(this.testUser, this.invalidDetails);
        expect(result).not.toBeDefined();
        log(invalidGetUserTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.name).toBe('DroppError');
        expect(error.details).toBeDefined();
        expect(error.details.error).toBeDefined();
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBeDefined();
        expect(typeof error.details.error.message).toBe('string');

        const invalidParameters = error.details.error.message.split(',');
        expect(invalidParameters.length).toBe(1);
        expect(invalidParameters[0]).toBe('username');
        log(invalidGetUserTitle, error.details);
        done();
      }
    });

    it('throws an error for a missing username', async (done) => {
      delete this.invalidDetails.username;
      try {
        const result = await UserMiddleware.get(this.testUser, this.invalidDetails);
        expect(result).not.toBeDefined();
        log(invalidGetUserTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.name).toBe('DroppError');
        expect(error.details).toBeDefined();
        expect(error.details.error).toBeDefined();
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBeDefined();
        expect(typeof error.details.error.message).toBe('string');

        const invalidParameters = error.details.error.message.split(',');
        expect(invalidParameters.length).toBe(1);
        expect(invalidParameters[0]).toBe('username');
        log(invalidGetUserTitle, error.details);
        done();
      }
    });

    it('throws an error for a non-existent user', async (done) => {
      this.invalidDetails.username = Utils.newUuid();
      try {
        const result = await UserMiddleware.get(this.testUser, this.invalidDetails);
        expect(result).not.toBeDefined();
        log(invalidGetUserTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.name).toBe('DroppError');
        expect(error.details).toBeDefined();
        expect(error.details.error).toBeDefined();
        expect(error.details.error.type).toBe(DroppError.type.ResourceDNE.type);
        expect(error.details.error.message).toBeDefined();
        expect(typeof error.details.error.message).toBe('string');
        expect(error.details.error.message.toLowerCase()).toContain('user');
        log(invalidGetUserTitle, error.details);
        done();
      }
    });
  });

  const addNewUserTitle = 'Add new user';
  describe(addNewUserTitle, () => {
    const uuid2 = Utils.newUuid();
    const details = {
      username: uuid2,
      password: uuid2,
      email: `${uuid2}@${uuid2}.com`,
    };

    afterEach(async (done) => {
      const user = await UserAccessor.get(details.username);
      await UserMiddleware.remove(user, details.username);
      done();
    });

    it('adds a new user', async (done) => {
      const result = await UserMiddleware.addNewUser(details);
      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      expect(result.success.token).toBeDefined();
      expect(typeof result.success.token).toBe('string');
      expect(result.success.token).toContain('Bearer');
      log(addNewUserTitle, result);
      done();
    });
  });

  const getAuthTokenTitle = 'Get authentication token';
  describe(getAuthTokenTitle, () => {
    it('gets an authentication token', async (done) => {
      const details = {
        username: this.testUser.username,
        password: this.testUserData.password,
      };

      const result = await UserMiddleware.getAuthToken(details);
      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      expect(result.success.token).toBeDefined();
      expect(typeof result.success.token).toBe('string');
      expect(result.success.token).toContain('Bearer');
      log(getAuthTokenTitle, result);
      done();
    });
  });

  const invalidGetAuthTokenTitle = 'Invalid get authentication token';
  describe(invalidGetAuthTokenTitle, () => {
    beforeEach(() => {
      this.invalidDetails = {
        username: Utils.newUuid(),
        password: Utils.newUuid(),
      };
    });

    afterEach(() => {
      delete this.invalidDetails;
    });

    it('throws an error for an invalid username and password', async (done) => {
      this.invalidDetails.username = '$%l;kadfjs';
      this.invalidDetails.password = 'he$';
      try {
        const result = await UserMiddleware.getAuthToken(this.invalidDetails);
        expect(result).not.toBeDefined();
        log(invalidGetAuthTokenTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.name).toBe('DroppError');
        expect(error.details).toBeDefined();
        expect(error.details.error).toBeDefined();
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBeDefined();
        expect(typeof error.details.error.message).toBe('string');

        const invalidParameters = error.details.error.message.split(',');
        expect(invalidParameters.length).toBe(2);
        expect(invalidParameters.includes('username')).toBe(true);
        expect(invalidParameters.includes('password')).toBe(true);
        log(invalidGetAuthTokenTitle, error.details);
        done();
      }
    });

    it('throws an error for a missing username', async (done) => {
      delete this.invalidDetails.username;
      try {
        const result = await UserMiddleware.getAuthToken(this.invalidDetails);
        expect(result).not.toBeDefined();
        log(invalidGetAuthTokenTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.name).toBe('DroppError');
        expect(error.details).toBeDefined();
        expect(error.details.error).toBeDefined();
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBeDefined();
        expect(typeof error.details.error.message).toBe('string');

        const invalidParameters = error.details.error.message.split(',');
        expect(invalidParameters.length).toBe(1);
        expect(invalidParameters[0]).toBe('username');
        log(invalidGetAuthTokenTitle, error.details);
        done();
      }
    });

    it('throws an error for a missing password', async (done) => {
      delete this.invalidDetails.password;
      try {
        const result = await UserMiddleware.getAuthToken(this.invalidDetails);
        expect(result).not.toBeDefined();
        log(invalidGetAuthTokenTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.name).toBe('DroppError');
        expect(error.details).toBeDefined();
        expect(error.details.error).toBeDefined();
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBeDefined();
        expect(typeof error.details.error.message).toBe('string');

        const invalidParameters = error.details.error.message.split(',');
        expect(invalidParameters.length).toBe(1);
        expect(invalidParameters[0]).toBe('password');
        log(invalidGetAuthTokenTitle, error.details);
        done();
      }
    });

    it('throws an error for a non-existent user', async (done) => {
      try {
        const result = await UserMiddleware.getAuthToken(this.invalidDetails);
        expect(result).not.toBeDefined();
        log(invalidGetAuthTokenTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.name).toBe('DroppError');
        expect(error.details).toBeDefined();
        expect(error.details.error).toBeDefined();
        expect(error.details.error.type).toBe(DroppError.type.Login.type);
        expect(error.details.error.message).toBeDefined();
        expect(error.details.error.message).toBe(DroppError.type.Login.message);
        log(invalidGetAuthTokenTitle, error.details);
        done();
      }
    });

    it('throws an error for an incorrect password', async (done) => {
      this.invalidDetails.username = this.testUser.username;
      try {
        const result = await UserMiddleware.getAuthToken(this.invalidDetails);
        expect(result).not.toBeDefined();
        log(invalidGetAuthTokenTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.name).toBe('DroppError');
        expect(error.details).toBeDefined();
        expect(error.details.error).toBeDefined();
        expect(error.details.error.type).toBe(DroppError.type.Login.type);
        expect(error.details.error.message).toBeDefined();
        expect(error.details.error.message).toBe(DroppError.type.Login.message);
        log(invalidGetAuthTokenTitle, error.details);
        done();
      }
    });
  });

  const updatePasswordTitle = 'Update password';
  describe(updatePasswordTitle, () => {
    it('updates the user\'s password', async (done) => {
      const details = {
        oldPassword: this.testUserData.password,
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
      log(updatePasswordTitle, result);
      done();
    });
  });

  const invalidUpdatePasswordTitle = 'Invalid update password';
  describe(invalidUpdatePasswordTitle, () => {
    beforeEach(() => {
      this.invalidDetails = {
        oldPassword: this.testUserData.password,
        newPassword: Utils.newUuid(),
      };
    });

    afterEach(() => {
      delete this.invalidDetails;
    });

    it('throws an error for an invalid current user', async (done) => {
      try {
        /* eslint-disable max-len */
        const result = await UserMiddleware.updatePassword(null, this.testUser.username, this.invalidDetails);
        /* eslint-enable max-len */
        expect(result).not.toBeDefined();
        log(invalidUpdatePasswordTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.name).toBe('DroppError');
        expect(error.details).toBeDefined();
        expect(error.details.error).toBeDefined();
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBeDefined();
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        log(invalidUpdatePasswordTitle, error.details);
        done();
      }
    });

    it('throws an error for an invalid old and new password', async (done) => {
      this.invalidDetails.oldPassword = '$%';
      this.invalidDetails.newPassword = 'he$';
      try {
        /* eslint-disable max-len */
        const result = await UserMiddleware.updatePassword(this.testUser, this.testUser.username, this.invalidDetails);
        /* eslint-enable max-len */
        expect(result).not.toBeDefined();
        log(invalidUpdatePasswordTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.name).toBe('DroppError');
        expect(error.details).toBeDefined();
        expect(error.details.error).toBeDefined();
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBeDefined();
        expect(typeof error.details.error.message).toBe('string');

        const invalidParameters = error.details.error.message.split(',');
        expect(invalidParameters.length).toBe(2);
        expect(invalidParameters.includes('oldPassword')).toBe(true);
        expect(invalidParameters.includes('newPassword')).toBe(true);
        log(invalidUpdatePasswordTitle, error.details);
        done();
      }
    });

    it('throws an error for a missing old password', async (done) => {
      delete this.invalidDetails.oldPassword;
      try {
        /* eslint-disable max-len */
        const result = await UserMiddleware.updatePassword(this.testUser, this.testUser.username, this.invalidDetails);
        /* eslint-enable max-len */
        expect(result).not.toBeDefined();
        log(invalidUpdatePasswordTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.name).toBe('DroppError');
        expect(error.details).toBeDefined();
        expect(error.details.error).toBeDefined();
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBeDefined();
        expect(typeof error.details.error.message).toBe('string');

        const invalidParameters = error.details.error.message.split(',');
        expect(invalidParameters.length).toBe(1);
        expect(invalidParameters[0]).toBe('oldPassword');
        log(invalidUpdatePasswordTitle, error.details);
        done();
      }
    });

    it('throws an error for a missing new password', async (done) => {
      delete this.invalidDetails.newPassword;
      try {
        /* eslint-disable max-len */
        const result = await UserMiddleware.updatePassword(this.testUser, this.testUser.username, this.invalidDetails);
        /* eslint-enable max-len */
        expect(result).not.toBeDefined();
        log(invalidUpdatePasswordTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.name).toBe('DroppError');
        expect(error.details).toBeDefined();
        expect(error.details.error).toBeDefined();
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBeDefined();
        expect(typeof error.details.error.message).toBe('string');

        const invalidParameters = error.details.error.message.split(',');
        expect(invalidParameters.length).toBe(1);
        expect(invalidParameters[0]).toBe('newPassword');
        log(invalidUpdatePasswordTitle, error.details);
        done();
      }
    });

    it('throws an error for identical old and new passwords', async (done) => {
      this.invalidDetails.newPassword = this.invalidDetails.oldPassword;
      try {
        /* eslint-disable max-len */
        const result = await UserMiddleware.updatePassword(this.testUser, this.testUser.username, this.invalidDetails);
        /* eslint-enable max-len */
        expect(result).not.toBeDefined();
        log(invalidUpdatePasswordTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.name).toBe('DroppError');
        expect(error.details).toBeDefined();
        expect(error.details.error).toBeDefined();
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message).toBeDefined();
        expect(typeof error.details.error.message).toBe('string');
        expect(error.details.error.message.toLowerCase()).toContain('different');
        log(invalidUpdatePasswordTitle, error.details);
        done();
      }
    });

    it('throws an error for updating a different user', async (done) => {
      try {
        /* eslint-disable max-len */
        const result = await UserMiddleware.updatePassword(this.testUser, 'test', this.invalidDetails);
        /* eslint-enable max-len */
        expect(result).not.toBeDefined();
        log(invalidUpdatePasswordTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.name).toBe('DroppError');
        expect(error.details).toBeDefined();
        expect(error.details.error).toBeDefined();
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message).toBeDefined();
        expect(typeof error.details.error.message).toBe('string');
        expect(error.details.error.message.toLowerCase()).toContain('password');
        log(invalidUpdatePasswordTitle, error.details);
        done();
      }
    });

    it('throws an error for updating a non-existent current user', async (done) => {
      const user = new User({
        username: 'test',
        email: 'test@test.com',
      });

      try {
        /* eslint-disable max-len */
        const result = await UserMiddleware.updatePassword(user, user.username, this.invalidDetails);
        /* eslint-enable max-len */
        expect(result).not.toBeDefined();
        log(invalidUpdatePasswordTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.name).toBe('DroppError');
        expect(error.details).toBeDefined();
        expect(error.details.error).toBeDefined();
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBeDefined();
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        log(invalidUpdatePasswordTitle, error.details);
        done();
      }
    });

    it('throws an error for an incorrect password', async (done) => {
      this.invalidDetails.oldPassword = Utils.newUuid();
      try {
        /* eslint-disable max-len */
        const result = await UserMiddleware.updatePassword(this.testUser, this.testUser.username, this.invalidDetails);
        /* eslint-enable max-len */
        expect(result).not.toBeDefined();
        log(invalidUpdatePasswordTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.name).toBe('DroppError');
        expect(error.details).toBeDefined();
        expect(error.details.error).toBeDefined();
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message).toBeDefined();
        expect(typeof error.details.error.message).toBe('string');
        expect(error.details.error.message.toLowerCase()).toContain('match');
        log(invalidUpdatePasswordTitle, error.details);
        done();
      }
    });
  });

  const updateEmailTitle = 'Update email';
  describe(updateEmailTitle, () => {
    it('updates the user\'s email', async (done) => {
      const uuid2 = Utils.newUuid();
      const details = { newEmail: `${uuid2}@${uuid2}.com` };
      /* eslint-disable max-len */
      const result = await UserMiddleware.updateEmail(this.testUser, this.testUser.username, details);
      /* eslint-enable max-len */
      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      expect(result.success.message).toBeDefined();
      expect(typeof result.success.message).toBe('string');
      expect(result.success.message.toLowerCase()).toContain('email');
      log(updateEmailTitle, result);
      done();
    });
  });

  const invalidUpdateEmailTitle = 'Invalid update email';
  describe(invalidUpdateEmailTitle, () => {
    beforeEach(() => {
      this.invalidDetails = {
        newEmail: Utils.newUuid(),
      };
    });

    afterEach(() => {
      delete this.invalidDetails;
    });

    it('throws an error for an invalid current user', async (done) => {
      try {
        /* eslint-disable max-len */
        const result = await UserMiddleware.updateEmail(null, this.testUser.username, this.invalidDetails);
        /* eslint-enable max-len */
        expect(result).not.toBeDefined();
        log(invalidUpdateEmailTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.name).toBe('DroppError');
        expect(error.details).toBeDefined();
        expect(error.details.error).toBeDefined();
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBeDefined();
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        log(invalidUpdateEmailTitle, error.details);
        done();
      }
    });

    it('throws an error for an invalid email', async (done) => {
      try {
        /* eslint-disable max-len */
        const result = await UserMiddleware.updateEmail(this.testUser, this.testUser.username, this.invalidDetails);
        /* eslint-enable max-len */
        expect(result).not.toBeDefined();
        log(invalidUpdateEmailTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.name).toBe('DroppError');
        expect(error.details).toBeDefined();
        expect(error.details.error).toBeDefined();
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBeDefined();
        expect(typeof error.details.error.message).toBe('string');

        const invalidParameters = error.details.error.message.split(',');
        expect(invalidParameters.length).toBe(1);
        expect(invalidParameters[0]).toBe('newEmail');
        log(invalidUpdateEmailTitle, error.details);
        done();
      }
    });

    it('throws an error for a missing email', async (done) => {
      delete this.invalidDetails.newEmail;
      try {
        /* eslint-disable max-len */
        const result = await UserMiddleware.updateEmail(this.testUser, this.testUser.username, this.invalidDetails);
        /* eslint-enable max-len */
        expect(result).not.toBeDefined();
        log(invalidUpdateEmailTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.name).toBe('DroppError');
        expect(error.details).toBeDefined();
        expect(error.details.error).toBeDefined();
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBeDefined();
        expect(typeof error.details.error.message).toBe('string');

        const invalidParameters = error.details.error.message.split(',');
        expect(invalidParameters.length).toBe(1);
        expect(invalidParameters[0]).toBe('newEmail');
        log(invalidUpdateEmailTitle, error.details);
        done();
      }
    });

    it('throws an error for updating a different user', async (done) => {
      this.invalidDetails.newEmail = 'test@test.com';
      try {
        const result = await UserMiddleware.updateEmail(this.testUser, 'test', this.invalidDetails);
        expect(result).not.toBeDefined();
        log(invalidUpdateEmailTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.name).toBe('DroppError');
        expect(error.details).toBeDefined();
        expect(error.details.error).toBeDefined();
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message).toBeDefined();
        expect(typeof error.details.error.message).toBe('string');
        expect(error.details.error.message.toLowerCase()).toContain('email');
        log(invalidUpdateEmailTitle, error.details);
        done();
      }
    });
  });

  const interUserFunctionsTitle = 'Inter-user functions';
  describe(interUserFunctionsTitle, () => {
    beforeEach(async (done) => {
      const uuid2 = Utils.newUuid();
      const details = {
        username: uuid2,
        password: uuid2,
        email: `${uuid2}@${uuid2}.com`,
      };

      this.testUser2 = await UserMiddleware.create(details);
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
        expect(result.success.message.toLowerCase()).toContain('follow request');
        expect(this.testUser.followRequests.includes(this.testUser2.username)).toBe(true);
        log(requestToFollowTitle, result);
        done();
      });
    });

    const invalidRequestToFollowTitle = 'Invalid request to follow user';
    describe(invalidRequestToFollowTitle, () => {
      beforeEach(() => {
        this.invalidUsername = '%';
      });

      afterEach(() => {
        delete this.invalidUsername;
      });

      it('throws an error for an invalid current user', async (done) => {
        try {
          const result = await UserMiddleware.requestToFollow(null, this.invalidUsername);
          expect(result).not.toBeDefined();
          log(invalidRequestToFollowTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error).toBeDefined();
          expect(error.name).toBe('DroppError');
          expect(error.details).toBeDefined();
          expect(error.details.error).toBeDefined();
          expect(error.details.error.type).toBe(DroppError.type.Server.type);
          expect(error.details.error.message).toBeDefined();
          expect(error.details.error.message).toBe(DroppError.type.Server.message);
          log(invalidRequestToFollowTitle, error.details);
          done();
        }
      });

      it('throws an error for an invalid username', async (done) => {
        try {
          const result = await UserMiddleware.requestToFollow(this.testUser, this.invalidUsername);
          expect(result).not.toBeDefined();
          log(invalidRequestToFollowTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error).toBeDefined();
          expect(error.name).toBe('DroppError');
          expect(error.details).toBeDefined();
          expect(error.details.error).toBeDefined();
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBeDefined();
          expect(typeof error.details.error.message).toBe('string');

          const invalidParameters = error.details.error.message.split(',');
          expect(invalidParameters.length).toBe(1);
          expect(invalidParameters[0]).toBe('username');
          log(invalidRequestToFollowTitle, error.details);
          done();
        }
      });

      it('throws an error for a missing username', async (done) => {
        delete this.invalidUsername;
        try {
          const result = await UserMiddleware.requestToFollow(this.testUser, this.invalidUsername);
          expect(result).not.toBeDefined();
          log(invalidRequestToFollowTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error).toBeDefined();
          expect(error.name).toBe('DroppError');
          expect(error.details).toBeDefined();
          expect(error.details.error).toBeDefined();
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBeDefined();
          expect(typeof error.details.error.message).toBe('string');

          const invalidParameters = error.details.error.message.split(',');
          expect(invalidParameters.length).toBe(1);
          expect(invalidParameters[0]).toBe('username');
          log(invalidRequestToFollowTitle, error.details);
          done();
        }
      });

      it('throws an error for a non-existent user', async (done) => {
        try {
          const result = await UserMiddleware.requestToFollow(this.testUser, 'test');
          expect(result).not.toBeDefined();
          log(invalidRequestToFollowTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error).toBeDefined();
          expect(error.name).toBe('DroppError');
          expect(error.details).toBeDefined();
          expect(error.details.error).toBeDefined();
          expect(error.details.error.type).toBe(DroppError.type.ResourceDNE.type);
          expect(error.details.error.message).toBeDefined();
          expect(typeof error.details.error.message).toBe('string');
          expect(error.details.error.message.toLowerCase()).toContain('user');
          log(invalidRequestToFollowTitle, error.details);
          done();
        }
      });

      it('throws an error for existing pending follow request', async (done) => {
        // Set up test case
        let testUser3;
        try {
          const details = {
            username: Utils.newUuid(),
            password: Utils.newUuid(),
            email: `${Utils.newUuid()}@${Utils.newUuid()}.com`,
          };

          testUser3 = await UserMiddleware.create(details);
          await UserMiddleware.requestToFollow(this.testUser, testUser3.username);
        } catch (error) {
          expect(error).not.toBeDefined();
          log(invalidRequestToFollowTitle, 'Should not have thrown error');
          done();
        }

        try {
          const result = await UserMiddleware.requestToFollow(this.testUser, testUser3.username);
          expect(result).not.toBeDefined();
          log(invalidRequestToFollowTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error).toBeDefined();
          expect(error.name).toBe('DroppError');
          expect(error.details).toBeDefined();
          expect(error.details.error).toBeDefined();
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message).toBeDefined();
          expect(typeof error.details.error.message).toBe('string');
          expect(error.details.error.message.toLowerCase()).toContain('pending follow request');
          log(invalidRequestToFollowTitle, error.details);
        }

        // Clean up test case
        try {
          await UserMiddleware.remove(testUser3, testUser3.username);
        } catch (error) {
          expect(error).not.toBeDefined();
          log(invalidRequestToFollowTitle, 'Should not have thrown error');
        }

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
        expect(result.success.message.toLowerCase()).toContain('removal');
        expect(this.testUser.followRequests.includes(this.testUser2.username)).toBe(false);
        log(removeFollowRequestTitle, result);
        done();
      });
    });

    const invalidRemoveFollowRequestTitle = 'Invalid remove follow request';
    describe(invalidRemoveFollowRequestTitle, () => {
      beforeEach(() => {
        this.invalidUsername = '%';
      });

      afterEach(() => {
        delete this.invalidUsername;
      });

      it('throws an error for an invalid current user', async (done) => {
        try {
          const result = await UserMiddleware.removeFollowRequest(null, this.invalidUsername);
          expect(result).not.toBeDefined();
          log(invalidRemoveFollowRequestTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error).toBeDefined();
          expect(error.name).toBe('DroppError');
          expect(error.details).toBeDefined();
          expect(error.details.error).toBeDefined();
          expect(error.details.error.type).toBe(DroppError.type.Server.type);
          expect(error.details.error.message).toBeDefined();
          expect(error.details.error.message).toBe(DroppError.type.Server.message);
          log(invalidRemoveFollowRequestTitle, error.details);
          done();
        }
      });

      it('throws an error for an invalid username', async (done) => {
        try {
          /* eslint-disable max-len */
          const result = await UserMiddleware.removeFollowRequest(this.testUser, this.invalidUsername);
          /* eslint-enable max-len */
          expect(result).not.toBeDefined();
          log(invalidRemoveFollowRequestTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error).toBeDefined();
          expect(error.name).toBe('DroppError');
          expect(error.details).toBeDefined();
          expect(error.details.error).toBeDefined();
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBeDefined();
          expect(typeof error.details.error.message).toBe('string');

          const invalidParameters = error.details.error.message.split(',');
          expect(invalidParameters.length).toBe(1);
          expect(invalidParameters[0]).toBe('username');
          log(invalidRemoveFollowRequestTitle, error.details);
          done();
        }
      });

      it('throws an error for a missing username', async (done) => {
        delete this.invalidUsername;
        try {
          /* eslint-disable max-len */
          const result = await UserMiddleware.removeFollowRequest(this.testUser, this.invalidUsername);
          /* eslint-enable max-len */
          expect(result).not.toBeDefined();
          log(invalidRemoveFollowRequestTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error).toBeDefined();
          expect(error.name).toBe('DroppError');
          expect(error.details).toBeDefined();
          expect(error.details.error).toBeDefined();
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBeDefined();
          expect(typeof error.details.error.message).toBe('string');

          const invalidParameters = error.details.error.message.split(',');
          expect(invalidParameters.length).toBe(1);
          expect(invalidParameters[0]).toBe('username');
          log(invalidRemoveFollowRequestTitle, error.details);
          done();
        }
      });

      it('throws an error for a non-existent user', async (done) => {
        try {
          const result = await UserMiddleware.removeFollowRequest(this.testUser, 'test');
          expect(result).not.toBeDefined();
          log(invalidRemoveFollowRequestTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error).toBeDefined();
          expect(error.name).toBe('DroppError');
          expect(error.details).toBeDefined();
          expect(error.details.error).toBeDefined();
          expect(error.details.error.type).toBe(DroppError.type.ResourceDNE.type);
          expect(error.details.error.message).toBeDefined();
          expect(typeof error.details.error.message).toBe('string');
          expect(error.details.error.message.toLowerCase()).toContain('user');
          log(invalidRemoveFollowRequestTitle, error.details);
          done();
        }
      });

      it('throws an error for a non-existent follow request', async (done) => {
        try {
          /* eslint-disable max-len */
          const result = await UserMiddleware.removeFollowRequest(this.testUser, this.testUser2.username);
          /* eslint-enable max-len */
          expect(result).not.toBeDefined();
          log(invalidRemoveFollowRequestTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error).toBeDefined();
          expect(error.name).toBe('DroppError');
          expect(error.details).toBeDefined();
          expect(error.details.error).toBeDefined();
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message).toBeDefined();
          expect(typeof error.details.error.message).toBe('string');
          expect(error.details.error.message.toLowerCase()).toContain('pending follow request');
          log(invalidRemoveFollowRequestTitle, error.details);
          done();
        }
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
        expect(result.success.message.toLowerCase()).toContain('acceptance');
        expect(this.testUser2.followerRequests.includes(this.testUser.username)).toBe(false);
        expect(this.testUser2.followers.includes(this.testUser.username)).toBe(true);
        log(respondToFollowerRequestTitle, result);
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
        expect(result.success.message.toLowerCase()).toContain('denial');
        expect(this.testUser2.followerRequests.includes(this.testUser.username)).toBe(false);
        expect(this.testUser2.followers.includes(this.testUser.username)).toBe(false);
        log(respondToFollowerRequestTitle, result);
        done();
      });
    });

    const invalidRespondToFollowerRequestTitle = 'Invalid respond to follow request';
    describe(invalidRespondToFollowerRequestTitle, () => {
      beforeEach(() => {
        this.invalidUsername = 'test';
        this.invalidDetails = {
          accept: true,
        };
      });

      afterEach(() => {
        delete this.invalidDetails;
        delete this.invalidUsername;
      });

      it('throws an error for an invalid current user', async (done) => {
        try {
          /* eslint-disable max-len */
          const result = await UserMiddleware.respondToFollowerRequest(null, this.invalidUsername, this.invalidDetails);
          /* eslint-enable max-len */
          expect(result).not.toBeDefined();
          log(invalidRespondToFollowerRequestTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error).toBeDefined();
          expect(error.name).toBe('DroppError');
          expect(error.details).toBeDefined();
          expect(error.details.error).toBeDefined();
          expect(error.details.error.type).toBe(DroppError.type.Server.type);
          expect(error.details.error.message).toBeDefined();
          expect(error.details.error.message).toBe(DroppError.type.Server.message);
          log(invalidRespondToFollowerRequestTitle, error.details);
          done();
        }
      });

      it('throws an error for an invalid username', async (done) => {
        this.invalidUsername = '%';
        try {
          /* eslint-disable max-len */
          const result = await UserMiddleware.respondToFollowerRequest(this.testUser, this.invalidUsername, this.invalidDetails);
          /* eslint-enable max-len */
          expect(result).not.toBeDefined();
          log(invalidRespondToFollowerRequestTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error).toBeDefined();
          expect(error.name).toBe('DroppError');
          expect(error.details).toBeDefined();
          expect(error.details.error).toBeDefined();
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBeDefined();
          expect(typeof error.details.error.message).toBe('string');

          const invalidParameters = error.details.error.message.split(',');
          expect(invalidParameters.length).toBe(1);
          expect(invalidParameters[0]).toBe('username');
          log(invalidRespondToFollowerRequestTitle, error.details);
          done();
        }
      });

      it('throws an error for a missing username', async (done) => {
        delete this.invalidUsername;
        try {
          /* eslint-disable max-len */
          const result = await UserMiddleware.respondToFollowerRequest(this.testUser, this.invalidUsername, this.invalidDetails);
          /* eslint-enable max-len */
          expect(result).not.toBeDefined();
          log(invalidRespondToFollowerRequestTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error).toBeDefined();
          expect(error.name).toBe('DroppError');
          expect(error.details).toBeDefined();
          expect(error.details.error).toBeDefined();
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBeDefined();
          expect(typeof error.details.error.message).toBe('string');

          const invalidParameters = error.details.error.message.split(',');
          expect(invalidParameters.length).toBe(1);
          expect(invalidParameters[0]).toBe('username');
          log(invalidRespondToFollowerRequestTitle, error.details);
          done();
        }
      });

      it('throws an error for an invalid accept parameter', async (done) => {
        this.invalidDetails.accept = 'hi';
        try {
          /* eslint-disable max-len */
          const result = await UserMiddleware.respondToFollowerRequest(this.testUser, this.invalidUsername, this.invalidDetails);
          /* eslint-enable max-len */
          expect(result).not.toBeDefined();
          log(invalidRespondToFollowerRequestTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error).toBeDefined();
          expect(error.name).toBe('DroppError');
          expect(error.details).toBeDefined();
          expect(error.details.error).toBeDefined();
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBeDefined();
          expect(typeof error.details.error.message).toBe('string');

          const invalidParameters = error.details.error.message.split(',');
          expect(invalidParameters.length).toBe(1);
          expect(invalidParameters[0]).toBe('accept');
          log(invalidRespondToFollowerRequestTitle, error.details);
          done();
        }
      });

      it('throws an error for a missing accept parameter', async (done) => {
        delete this.invalidDetails.accept;
        try {
          /* eslint-disable max-len */
          const result = await UserMiddleware.respondToFollowerRequest(this.testUser, this.invalidUsername, this.invalidDetails);
          /* eslint-enable max-len */
          expect(result).not.toBeDefined();
          log(invalidRespondToFollowerRequestTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error).toBeDefined();
          expect(error.name).toBe('DroppError');
          expect(error.details).toBeDefined();
          expect(error.details.error).toBeDefined();
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBeDefined();
          expect(typeof error.details.error.message).toBe('string');

          const invalidParameters = error.details.error.message.split(',');
          expect(invalidParameters.length).toBe(1);
          expect(invalidParameters[0]).toBe('accept');
          log(invalidRespondToFollowerRequestTitle, error.details);
          done();
        }
      });

      it('throws an error for an invalid username and accept parameter', async (done) => {
        this.invalidUsername = '%';
        this.invalidDetails.accept = '%';
        try {
          /* eslint-disable max-len */
          const result = await UserMiddleware.respondToFollowerRequest(this.testUser, this.invalidUsername, this.invalidDetails);
          /* eslint-enable max-len */
          expect(result).not.toBeDefined();
          log(invalidRespondToFollowerRequestTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error).toBeDefined();
          expect(error.name).toBe('DroppError');
          expect(error.details).toBeDefined();
          expect(error.details.error).toBeDefined();
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBeDefined();
          expect(typeof error.details.error.message).toBe('string');

          const invalidParameters = error.details.error.message.split(',');
          expect(invalidParameters.length).toBe(2);
          expect(invalidParameters.includes('username')).toBe(true);
          expect(invalidParameters.includes('accept')).toBe(true);
          log(invalidRespondToFollowerRequestTitle, error.details);
          done();
        }
      });

      it('throws an error for a non-existent user', async (done) => {
        try {
          /* eslint-disable max-len */
          const result = await UserMiddleware.respondToFollowerRequest(this.testUser, 'test', this.invalidDetails);
          /* eslint-enable max-len */
          expect(result).not.toBeDefined();
          log(invalidRespondToFollowerRequestTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error).toBeDefined();
          expect(error.name).toBe('DroppError');
          expect(error.details).toBeDefined();
          expect(error.details.error).toBeDefined();
          expect(error.details.error.type).toBe(DroppError.type.ResourceDNE.type);
          expect(error.details.error.message).toBeDefined();
          expect(typeof error.details.error.message).toBe('string');
          expect(error.details.error.message.toLowerCase()).toContain('user');
          log(invalidRespondToFollowerRequestTitle, error.details);
          done();
        }
      });

      it('throws an error for a non-existent follower request', async (done) => {
        try {
          /* eslint-disable max-len */
          const result = await UserMiddleware.respondToFollowerRequest(this.testUser, this.testUser2.username, this.invalidDetails);
          /* eslint-enable max-len */
          expect(result).not.toBeDefined();
          log(invalidRespondToFollowerRequestTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error).toBeDefined();
          expect(error.name).toBe('DroppError');
          expect(error.details).toBeDefined();
          expect(error.details.error).toBeDefined();
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message).toBeDefined();
          expect(typeof error.details.error.message).toBe('string');
          expect(error.details.error.message.toLowerCase()).toContain('has not requested');
          log(invalidRespondToFollowerRequestTitle, error.details);
          done();
        }
      });
    });

    const updateFollowFollowerTitle = 'Update follow/follower';
    describe(updateFollowFollowerTitle, () => {
      beforeEach(async (done) => {
        const details = { accept: true };
        await UserMiddleware.requestToFollow(this.testUser, this.testUser2.username);
        /* eslint-disable max-len */
        await UserMiddleware.respondToFollowerRequest(this.testUser2, this.testUser.username, details);
        /* eslint-enable max-len */
        done();
      });

      it('unfollows a user', async (done) => {
        const result = await UserMiddleware.unfollow(this.testUser, this.testUser2.username);
        expect(result).toBeDefined();
        expect(result.success).toBeDefined();
        expect(result.success.message).toBeDefined();
        expect(typeof result.success.message).toBe('string');
        expect(result.success.message.toLowerCase()).toContain('unfollow');
        expect(this.testUser.follows.includes(this.testUser2.username)).toBe(false);
        done();
      });

      it('removes a follower', async (done) => {
        const result = await UserMiddleware.removeFollower(this.testUser2, this.testUser.username);
        expect(result).toBeDefined();
        expect(result.success).toBeDefined();
        expect(result.success.message).toBeDefined();
        expect(typeof result.success.message).toBe('string');
        expect(result.success.message.toLowerCase()).toContain('follower removal');
        expect(this.testUser2.followers.includes(this.testUser.username)).toBe(false);
        done();
      });
    });

    const invalidUnfollowTitle = 'Invalid unfollow';
    describe(invalidUnfollowTitle, () => {
      beforeEach(() => {
        this.invalidUsername = '%';
      });

      afterEach(() => {
        delete this.invalidUsername;
      });

      it('throws an error for an invalid current user', async (done) => {
        try {
          const result = await UserMiddleware.unfollow(null, this.invalidUsername);
          expect(result).not.toBeDefined();
          log(invalidUnfollowTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error).toBeDefined();
          expect(error.name).toBe('DroppError');
          expect(error.details).toBeDefined();
          expect(error.details.error).toBeDefined();
          expect(error.details.error.type).toBe(DroppError.type.Server.type);
          expect(error.details.error.message).toBeDefined();
          expect(error.details.error.message).toBe(DroppError.type.Server.message);
          log(invalidUnfollowTitle, error.details);
          done();
        }
      });

      it('throws an error for an invalid username', async (done) => {
        try {
          const result = await UserMiddleware.unfollow(this.testUser, this.invalidUsername);
          expect(result).not.toBeDefined();
          log(invalidUnfollowTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error).toBeDefined();
          expect(error.name).toBe('DroppError');
          expect(error.details).toBeDefined();
          expect(error.details.error).toBeDefined();
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBeDefined();
          expect(typeof error.details.error.message).toBe('string');

          const invalidParameters = error.details.error.message.split(',');
          expect(invalidParameters.length).toBe(1);
          expect(invalidParameters[0]).toBe('username');
          log(invalidUnfollowTitle, error.details);
          done();
        }
      });

      it('throws an error for a missing username', async (done) => {
        delete this.invalidUsername;
        try {
          const result = await UserMiddleware.unfollow(this.testUser, this.invalidUsername);
          expect(result).not.toBeDefined();
          log(invalidUnfollowTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error).toBeDefined();
          expect(error.name).toBe('DroppError');
          expect(error.details).toBeDefined();
          expect(error.details.error).toBeDefined();
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBeDefined();
          expect(typeof error.details.error.message).toBe('string');

          const invalidParameters = error.details.error.message.split(',');
          expect(invalidParameters.length).toBe(1);
          expect(invalidParameters[0]).toBe('username');
          log(invalidUnfollowTitle, error.details);
          done();
        }
      });

      it('throws an error for a non-existent user', async (done) => {
        try {
          const result = await UserMiddleware.unfollow(this.testUser, 'test');
          expect(result).not.toBeDefined();
          log(invalidUnfollowTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error).toBeDefined();
          expect(error.name).toBe('DroppError');
          expect(error.details).toBeDefined();
          expect(error.details.error).toBeDefined();
          expect(error.details.error.type).toBe(DroppError.type.ResourceDNE.type);
          expect(error.details.error.message).toBeDefined();
          expect(typeof error.details.error.message).toBe('string');
          expect(error.details.error.message.toLowerCase()).toContain('user');
          log(invalidUnfollowTitle, error.details);
          done();
        }
      });

      it('throws an error for a non-existent follow', async (done) => {
        try {
          const result = await UserMiddleware.unfollow(this.testUser, this.testUser2.username);
          expect(result).not.toBeDefined();
          log(invalidUnfollowTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error).toBeDefined();
          expect(error.name).toBe('DroppError');
          expect(error.details).toBeDefined();
          expect(error.details.error).toBeDefined();
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message).toBeDefined();
          expect(typeof error.details.error.message).toBe('string');
          expect(error.details.error.message.toLowerCase()).toContain('do not follow');
          log(invalidUnfollowTitle, error.details);
          done();
        }
      });
    });

    const invalidRemoveFollowerTitle = 'Invalid remove follower';
    describe(invalidRemoveFollowerTitle, () => {
      beforeEach(() => {
        this.invalidUsername = '%';
      });

      afterEach(() => {
        delete this.invalidUsername;
      });

      it('throws an error for an invalid current user', async (done) => {
        try {
          const result = await UserMiddleware.removeFollower(null, this.invalidUsername);
          expect(result).not.toBeDefined();
          log(invalidUnfollowTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error).toBeDefined();
          expect(error.name).toBe('DroppError');
          expect(error.details).toBeDefined();
          expect(error.details.error).toBeDefined();
          expect(error.details.error.type).toBe(DroppError.type.Server.type);
          expect(error.details.error.message).toBeDefined();
          expect(error.details.error.message).toBe(DroppError.type.Server.message);
          log(invalidUnfollowTitle, error.details);
          done();
        }
      });

      it('throws an error for an invalid username', async (done) => {
        try {
          const result = await UserMiddleware.removeFollower(this.testUser, this.invalidUsername);
          expect(result).not.toBeDefined();
          log(invalidUnfollowTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error).toBeDefined();
          expect(error.name).toBe('DroppError');
          expect(error.details).toBeDefined();
          expect(error.details.error).toBeDefined();
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBeDefined();
          expect(typeof error.details.error.message).toBe('string');

          const invalidParameters = error.details.error.message.split(',');
          expect(invalidParameters.length).toBe(1);
          expect(invalidParameters[0]).toBe('username');
          log(invalidUnfollowTitle, error.details);
          done();
        }
      });

      it('throws an error for a missing username', async (done) => {
        delete this.invalidUsername;
        try {
          const result = await UserMiddleware.removeFollower(this.testUser, this.invalidUsername);
          expect(result).not.toBeDefined();
          log(invalidUnfollowTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error).toBeDefined();
          expect(error.name).toBe('DroppError');
          expect(error.details).toBeDefined();
          expect(error.details.error).toBeDefined();
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBeDefined();
          expect(typeof error.details.error.message).toBe('string');

          const invalidParameters = error.details.error.message.split(',');
          expect(invalidParameters.length).toBe(1);
          expect(invalidParameters[0]).toBe('username');
          log(invalidUnfollowTitle, error.details);
          done();
        }
      });

      it('throws an error for a non-existent user', async (done) => {
        try {
          const result = await UserMiddleware.removeFollower(this.testUser, 'test');
          expect(result).not.toBeDefined();
          log(invalidUnfollowTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error).toBeDefined();
          expect(error.name).toBe('DroppError');
          expect(error.details).toBeDefined();
          expect(error.details.error).toBeDefined();
          expect(error.details.error.type).toBe(DroppError.type.ResourceDNE.type);
          expect(error.details.error.message).toBeDefined();
          expect(typeof error.details.error.message).toBe('string');
          expect(error.details.error.message.toLowerCase()).toContain('user');
          log(invalidUnfollowTitle, error.details);
          done();
        }
      });

      it('throws an error for a non-existent follower', async (done) => {
        try {
          /* eslint-disable max-len */
          const result = await UserMiddleware.removeFollower(this.testUser, this.testUser2.username);
          /* eslint-enable max-len */
          expect(result).not.toBeDefined();
          log(invalidUnfollowTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error).toBeDefined();
          expect(error.name).toBe('DroppError');
          expect(error.details).toBeDefined();
          expect(error.details.error).toBeDefined();
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message).toBeDefined();
          expect(typeof error.details.error.message).toBe('string');
          expect(error.details.error.message.toLowerCase()).toContain('does not follow');
          log(invalidUnfollowTitle, error.details);
          done();
        }
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
        log(removeUserTitle, `Was able to fetch ${user.username} after removing them`);
      } catch (retrieveUserError) {
        expect(retrieveUserError.name).toBe('DroppError');
        expect(retrieveUserError.statusCode).toBe(DroppError.type.ResourceDNE.status);
        log(removeUserTitle, retrieveUserError);
      }

      done();
    });
  });
});
/* eslint-enable no-undef */
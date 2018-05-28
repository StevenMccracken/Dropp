const Log = require('../../logger');
const User = require('../../../src/models/User');
const Utils = require('../../../src/utilities/utils');
const Firebase = require('../../../src/firebase/firebase');
const UserAccessor = require('../../../src/database/user');
const DroppError = require('../../../src/errors/DroppError');
const UserMiddleware = require('../../../src/middleware/user');

const testName = 'User Middleware';
Firebase.start(process.env.MOCK === '1');
/* eslint-disable no-undef */
describe(testName, () => {
  const uuid = Utils.newUuid();
  this.testUserData = {
    username: uuid,
    password: uuid,
    email: `${uuid}@${uuid}.com`,
  };

  beforeEach(async (done) => {
    this.testUser = await UserMiddleware.create(this.testUserData);
    this.testUserDetails = { username: this.testUser.username };
    done();
  });

  afterEach(async (done) => {
    await UserMiddleware.remove(this.testUser, { username: this.testUser.username });
    delete this.testUser;
    delete this.testUserDetails;
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
      Log(testName, createUserTitle, this.newUser);
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

      it('throws an error for null user details', async (done) => {
        try {
          const result = await UserMiddleware.create(null);
          expect(result).not.toBeDefined();
          Log(testName, invalidCreateUserTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe('email,username,password');
          Log(testName, invalidCreateUserTitle, error.details);
          done();
        }
      });

      it('throws an error for missing username', async (done) => {
        try {
          delete this.invalidUserDetails.username;
          const result = await UserMiddleware.create(this.invalidUserDetails);
          expect(result).not.toBeDefined();
          Log(testName, invalidCreateUserTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe('username');
          Log(testName, invalidCreateUserTitle, error.details);
          done();
        }
      });

      it('throws an error for missing password', async (done) => {
        try {
          delete this.invalidUserDetails.password;
          const result = await UserMiddleware.create(this.invalidUserDetails);
          expect(result).not.toBeDefined();
          Log(testName, invalidCreateUserTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe('password');
          Log(testName, invalidCreateUserTitle, error.details);
          done();
        }
      });

      it('throws an error for missing email', async (done) => {
        try {
          delete this.invalidUserDetails.email;
          const result = await UserMiddleware.create(this.invalidUserDetails);
          expect(result).not.toBeDefined();
          Log(testName, invalidCreateUserTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe('email');
          Log(testName, invalidCreateUserTitle, error.details);
          done();
        }
      });

      it('throws an error for 2 missing details', async (done) => {
        try {
          delete this.invalidUserDetails.username;
          delete this.invalidUserDetails.password;
          const result = await UserMiddleware.create(this.invalidUserDetails);
          expect(result).not.toBeDefined();
          Log(testName, invalidCreateUserTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe('username,password');
          Log(testName, invalidCreateUserTitle, error.details);
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
          Log(testName, invalidCreateUserTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe('email,username,password');
          Log(testName, invalidCreateUserTitle, error.details);
          done();
        }
      });

      it('throws an error for already existing username', async (done) => {
        try {
          this.invalidUserDetails.username = this.testUserData.username;
          const result = await UserMiddleware.create(this.invalidUserDetails);
          expect(result).not.toBeDefined();
          Log(testName, invalidCreateUserTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message).toBe('A user with that username already exists');
          Log(testName, invalidCreateUserTitle, error.details);
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
      Log(testName, getSameUserTitle, user);
      done();
    });
  });

  const getDifferentUserTitle = 'Get different user';
  describe(getDifferentUserTitle, () => {
    const details = { username: this.uuid2 };
    it('retrieves a user\'s public details', async (done) => {
      const user = await UserMiddleware.get(this.testUser, details);
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
      Log(testName, getDifferentUserTitle, user);
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
        Log(testName, invalidGetUserTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log(testName, invalidGetUserTitle, error.details);
        done();
      }
    });

    it('throws an error for null details', async (done) => {
      try {
        const result = await UserMiddleware.get(this.testUser, null);
        expect(result).not.toBeDefined();
        Log(testName, invalidGetUserTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('username');
        Log(testName, invalidGetUserTitle, error.details);
        done();
      }
    });

    it('throws an error for an invalid username', async (done) => {
      try {
        const result = await UserMiddleware.get(this.testUser, this.invalidDetails);
        expect(result).not.toBeDefined();
        Log(testName, invalidGetUserTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('username');
        Log(testName, invalidGetUserTitle, error.details);
        done();
      }
    });

    it('throws an error for a missing username', async (done) => {
      delete this.invalidDetails.username;
      try {
        const result = await UserMiddleware.get(this.testUser, this.invalidDetails);
        expect(result).not.toBeDefined();
        Log(testName, invalidGetUserTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('username');
        Log(testName, invalidGetUserTitle, error.details);
        done();
      }
    });

    it('throws an error for a non-existent user', async (done) => {
      this.invalidDetails.username = Utils.newUuid();
      try {
        const result = await UserMiddleware.get(this.testUser, this.invalidDetails);
        expect(result).not.toBeDefined();
        Log(testName, invalidGetUserTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.ResourceDNE.type);
        expect(error.details.error.message).toBe('That user does not exist');
        Log(testName, invalidGetUserTitle, error.details);
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
      await UserMiddleware.remove(user, { username: details.username });
      done();
    });

    it('adds a new user', async (done) => {
      const result = await UserMiddleware.addNewUser(details);
      expect(result.success).toBeDefined();
      expect(result.success.token).toBeDefined();
      expect(typeof result.success.token).toBe('string');
      expect(result.success.token).toContain('Bearer');
      Log(testName, addNewUserTitle, result);
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
      expect(result.success).toBeDefined();
      expect(result.success.token).toBeDefined();
      expect(typeof result.success.token).toBe('string');
      expect(result.success.token).toContain('Bearer');
      Log(testName, getAuthTokenTitle, result);
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

    it('throws an error for null details', async (done) => {
      try {
        const result = await UserMiddleware.getAuthToken(null);
        expect(result).not.toBeDefined();
        Log(testName, invalidGetAuthTokenTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('username,password');
        Log(testName, invalidGetAuthTokenTitle, error.details);
        done();
      }
    });

    it('throws an error for an invalid username and password', async (done) => {
      this.invalidDetails.username = '$%l;kadfjs';
      this.invalidDetails.password = 'he$';
      try {
        const result = await UserMiddleware.getAuthToken(this.invalidDetails);
        expect(result).not.toBeDefined();
        Log(testName, invalidGetAuthTokenTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('username,password');
        Log(testName, invalidGetAuthTokenTitle, error.details);
        done();
      }
    });

    it('throws an error for a missing username', async (done) => {
      delete this.invalidDetails.username;
      try {
        const result = await UserMiddleware.getAuthToken(this.invalidDetails);
        expect(result).not.toBeDefined();
        Log(testName, invalidGetAuthTokenTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('username');
        Log(testName, invalidGetAuthTokenTitle, error.details);
        done();
      }
    });

    it('throws an error for a missing password', async (done) => {
      delete this.invalidDetails.password;
      try {
        const result = await UserMiddleware.getAuthToken(this.invalidDetails);
        expect(result).not.toBeDefined();
        Log(testName, invalidGetAuthTokenTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('password');
        Log(testName, invalidGetAuthTokenTitle, error.details);
        done();
      }
    });

    it('throws an error for a non-existent user', async (done) => {
      try {
        const result = await UserMiddleware.getAuthToken(this.invalidDetails);
        expect(result).not.toBeDefined();
        Log(testName, invalidGetAuthTokenTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Login.type);
        expect(error.details.error.message).toBe(DroppError.type.Login.message);
        Log(testName, invalidGetAuthTokenTitle, error.details);
        done();
      }
    });

    it('throws an error for an incorrect password', async (done) => {
      this.invalidDetails.username = this.testUser.username;
      try {
        const result = await UserMiddleware.getAuthToken(this.invalidDetails);
        expect(result).not.toBeDefined();
        Log(testName, invalidGetAuthTokenTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Login.type);
        expect(error.details.error.message).toBe(DroppError.type.Login.message);
        Log(testName, invalidGetAuthTokenTitle, error.details);
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

      const result = await UserMiddleware.updatePassword(
        this.testUser,
        this.testUserDetails,
        details
      );
      expect(result.success).toBeDefined();
      expect(result.success.token).toBeDefined();
      expect(typeof result.success.token).toBe('string');
      expect(result.success.token).toContain('Bearer');
      Log(testName, updatePasswordTitle, result);
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
        const result = await UserMiddleware.updatePassword(
          null,
          this.testUserDetails,
          this.invalidDetails
        );
        expect(result).not.toBeDefined();
        Log(testName, invalidUpdatePasswordTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log(testName, invalidUpdatePasswordTitle, error.details);
        done();
      }
    });

    it('throws an error for null details', async (done) => {
      try {
        const result = await UserMiddleware.updatePassword(
          this.testUser,
          this.testUserDetails,
          null
        );
        expect(result).not.toBeDefined();
        Log(testName, invalidUpdatePasswordTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('oldPassword,newPassword');
        Log(testName, invalidUpdatePasswordTitle, error.details);
        done();
      }
    });

    it('throws an error for null username details', async (done) => {
      const details = {
        oldPassword: this.testUserData.password,
        newPassword: 'test2',
      };

      try {
        const result = await UserMiddleware.updatePassword(this.testUser, null, details);
        expect(result).not.toBeDefined();
        Log(testName, invalidUpdatePasswordTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message).toBe('Unauthorized to update that user\'s password');
        Log(testName, invalidUpdatePasswordTitle, error.details);
        done();
      }
    });

    it('throws an error for an invalid old and new password', async (done) => {
      this.invalidDetails.oldPassword = '$%';
      this.invalidDetails.newPassword = 'he$';
      try {
        const result = await UserMiddleware.updatePassword(
          this.testUser,
          this.testUserDetails,
          this.invalidDetails
        );
        expect(result).not.toBeDefined();
        Log(testName, invalidUpdatePasswordTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('oldPassword,newPassword');
        Log(testName, invalidUpdatePasswordTitle, error.details);
        done();
      }
    });

    it('throws an error for a missing old password', async (done) => {
      delete this.invalidDetails.oldPassword;
      try {
        const result = await UserMiddleware.updatePassword(
          this.testUser,
          this.testUserDetails,
          this.invalidDetails
        );
        expect(result).not.toBeDefined();
        Log(testName, invalidUpdatePasswordTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('oldPassword');
        Log(testName, invalidUpdatePasswordTitle, error.details);
        done();
      }
    });

    it('throws an error for a missing new password', async (done) => {
      delete this.invalidDetails.newPassword;
      try {
        const result = await UserMiddleware.updatePassword(
          this.testUser,
          this.testUserDetails,
          this.invalidDetails
        );
        expect(result).not.toBeDefined();
        Log(testName, invalidUpdatePasswordTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('newPassword');
        Log(testName, invalidUpdatePasswordTitle, error.details);
        done();
      }
    });

    it('throws an error for identical old and new passwords', async (done) => {
      this.invalidDetails.newPassword = this.invalidDetails.oldPassword;
      try {
        const result = await UserMiddleware.updatePassword(
          this.testUser,
          this.testUserDetails,
          this.invalidDetails
        );
        expect(result).not.toBeDefined();
        Log(testName, invalidUpdatePasswordTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message).toBe('New password must be different from old password');
        Log(testName, invalidUpdatePasswordTitle, error.details);
        done();
      }
    });

    it('throws an error for updating a different user', async (done) => {
      const details = { username: 'test' };
      try {
        const result = await UserMiddleware.updatePassword(
          this.testUser,
          details,
          this.invalidDetails
        );
        expect(result).not.toBeDefined();
        Log(testName, invalidUpdatePasswordTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message).toBe('Unauthorized to update that user\'s password');
        Log(testName, invalidUpdatePasswordTitle, error.details);
        done();
      }
    });

    it('throws an error for updating a non-existent current user', async (done) => {
      const user = new User({
        username: 'test',
        email: 'test@test.com',
      });

      const details = { username: user.username };
      try {
        const result = await UserMiddleware.updatePassword(user, details, this.invalidDetails);
        expect(result).not.toBeDefined();
        Log(testName, invalidUpdatePasswordTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log(testName, invalidUpdatePasswordTitle, error.details);
        done();
      }
    });

    it('throws an error for an incorrect password', async (done) => {
      this.invalidDetails.oldPassword = Utils.newUuid();
      try {
        const result = await UserMiddleware.updatePassword(
          this.testUser,
          this.testUserDetails,
          this.invalidDetails
        );
        expect(result).not.toBeDefined();
        Log(testName, invalidUpdatePasswordTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message).toBe('Old password must match existing password');
        Log(testName, invalidUpdatePasswordTitle, error.details);
        done();
      }
    });
  });

  const updateEmailTitle = 'Update email';
  describe(updateEmailTitle, () => {
    it('updates the user\'s email', async (done) => {
      const uuid2 = Utils.newUuid();
      const details = { newEmail: `${uuid2}@${uuid2}.com` };
      const result = await UserMiddleware.updateEmail(this.testUser, this.testUserDetails, details);
      expect(result.success).toBeDefined();
      expect(result.success.message).toBeDefined();
      expect(typeof result.success.message).toBe('string');
      expect(result.success.message.toLowerCase()).toContain('email');
      Log(testName, updateEmailTitle, result);
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
        const result = await UserMiddleware.updateEmail(
          null,
          this.testUserDetails,
          this.invalidDetails
        );
        expect(result).not.toBeDefined();
        Log(testName, invalidUpdateEmailTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log(testName, invalidUpdateEmailTitle, error.details);
        done();
      }
    });

    it('throws an error for null details', async (done) => {
      try {
        const result = await UserMiddleware.updateEmail(this.testUser, this.testUserDetails, null);
        expect(result).not.toBeDefined();
        Log(testName, invalidUpdateEmailTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('newEmail');
        Log(testName, invalidUpdateEmailTitle, error.details);
        done();
      }
    });

    it('throws an error for null username details', async (done) => {
      const details = { newEmail: `${Utils.newUuid()}@${Utils.newUuid()}.com` };
      try {
        const result = await UserMiddleware.updateEmail(this.testUser, null, details);
        expect(result).not.toBeDefined();
        Log(testName, invalidUpdateEmailTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message).toBe('Unauthorized to update that user\'s email');
        Log(testName, invalidUpdateEmailTitle, error.details);
        done();
      }
    });

    it('throws an error for an invalid email', async (done) => {
      try {
        const result = await UserMiddleware.updateEmail(
          this.testUser,
          this.testUserDetails,
          this.invalidDetails
        );
        expect(result).not.toBeDefined();
        Log(testName, invalidUpdateEmailTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('newEmail');
        Log(testName, invalidUpdateEmailTitle, error.details);
        done();
      }
    });

    it('throws an error for a missing email', async (done) => {
      delete this.invalidDetails.newEmail;
      try {
        const result = await UserMiddleware.updateEmail(
          this.testUser,
          this.testUserDetails,
          this.invalidDetails
        );
        expect(result).not.toBeDefined();
        Log(testName, invalidUpdateEmailTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('newEmail');
        Log(testName, invalidUpdateEmailTitle, error.details);
        done();
      }
    });

    it('throws an error for updating a different user', async (done) => {
      this.invalidDetails.newEmail = 'test@test.com';
      try {
        const details = { username: 'test' };
        const result = await UserMiddleware.updateEmail(
          this.testUser,
          details,
          this.invalidDetails
        );
        expect(result).not.toBeDefined();
        Log(testName, invalidUpdateEmailTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message).toBe('Unauthorized to update that user\'s email');
        Log(testName, invalidUpdateEmailTitle, error.details);
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
      await UserMiddleware.remove(this.testUser2, { username: this.testUser2.username });
      delete this.testUser2;
      done();
    });

    const requestToFollowTitle = 'Request to follow user';
    describe(requestToFollowTitle, () => {
      it('adds a follow request for the user', async (done) => {
        const details = { username: this.testUser.username };
        const requestedUser = { requestedUser: this.testUser2.username };
        const result = await UserMiddleware.requestToFollow(this.testUser, details, requestedUser);
        expect(result.success).toBeDefined();
        expect(result.success.message).toBeDefined();
        expect(typeof result.success.message).toBe('string');
        expect(result.success.message.toLowerCase()).toContain('follow request');
        expect(this.testUser.followRequests.includes(this.testUser2.username)).toBe(true);
        Log(testName, requestToFollowTitle, result);
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
        const details = { username: this.testUser.username };
        const requestedUser = { requestedUser: this.testUser2.username };
        try {
          const result = await UserMiddleware.requestToFollow(null, details, requestedUser);
          expect(result).not.toBeDefined();
          Log(testName, invalidRequestToFollowTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.Server.type);
          expect(error.details.error.message).toBe(DroppError.type.Server.message);
          Log(testName, invalidRequestToFollowTitle, error.details);
          done();
        }
      });

      it('throws an error for an invalid username details argument', async (done) => {
        const requestedUser = { requestedUser: this.testUser2.username };
        try {
          const result = await UserMiddleware.requestToFollow(this.testUser, null, requestedUser);
          expect(result).not.toBeDefined();
          Log(testName, invalidRequestToFollowTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe('username');
          Log(testName, invalidRequestToFollowTitle, error.details);
        }

        done();
      });

      it('throws an error for an invalid requested user details argument', async (done) => {
        const details = { username: this.testUser.username };
        try {
          const result = await UserMiddleware.requestToFollow(this.testUser, details, null);
          expect(result).not.toBeDefined();
          Log(testName, invalidRequestToFollowTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe('requestedUser');
          Log(testName, invalidRequestToFollowTitle, error.details);
        }

        done();
      });

      it('throws an error for an invalid username', async (done) => {
        const details = { username: this.testUser.username };
        const requestedUser = { requestedUser: this.invalidUsername };
        try {
          const result = await UserMiddleware.requestToFollow(
            this.testUser,
            details,
            requestedUser
          );
          expect(result).not.toBeDefined();
          Log(testName, invalidRequestToFollowTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe('requestedUser');
          Log(testName, invalidRequestToFollowTitle, error.details);
          done();
        }
      });

      it('throws an error for a missing username', async (done) => {
        delete this.invalidUsername;
        const details = { username: this.testUser.username };
        const requestedUser = { requestedUser: this.invalidUsername };
        try {
          const result = await UserMiddleware.requestToFollow(
            this.testUser,
            details,
            requestedUser
          );
          expect(result).not.toBeDefined();
          Log(testName, invalidRequestToFollowTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe('requestedUser');
          Log(testName, invalidRequestToFollowTitle, error.details);
          done();
        }
      });

      it('throws an error for accessing a different user\'s follow requests', async (done) => {
        const details = { username: this.testUser2.username };
        const requestedUser = { requestedUser: this.testUser2.username };
        try {
          const result = await UserMiddleware.requestToFollow(
            this.testUser,
            details,
            requestedUser
          );
          expect(result).not.toBeDefined();
          Log(testName, invalidRequestToFollowTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message).toBe('Unauthorized to access that user\'s follow requests');
          Log(testName, invalidRequestToFollowTitle, error.details);
        }

        done();
      });

      it('throws an error for requesting to follow the same user', async (done) => {
        const details = { username: this.testUser.username };
        const requestedUser = { requestedUser: this.testUser.username };
        try {
          const result = await UserMiddleware.requestToFollow(
            this.testUser,
            details,
            requestedUser
          );
          expect(result).not.toBeDefined();
          Log(testName, invalidRequestToFollowTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message).toBe('You cannot request to follow yourself');
          Log(testName, invalidRequestToFollowTitle, error.details);
        }

        done();
      });

      it('throws an error for a non-existent user', async (done) => {
        const details = { username: this.testUser.username };
        const requestedUser = { requestedUser: 'test' };
        try {
          const result = await UserMiddleware.requestToFollow(
            this.testUser,
            details,
            requestedUser
          );
          expect(result).not.toBeDefined();
          Log(testName, invalidRequestToFollowTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.ResourceDNE.type);
          expect(error.details.error.message).toBe('That user does not exist');
          Log(testName, invalidRequestToFollowTitle, error.details);
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
          const usernameDetails = { username: this.testUser.username };
          const requestedUser = { requestedUser: testUser3.username };
          await UserMiddleware.requestToFollow(this.testUser, usernameDetails, requestedUser);
        } catch (error) {
          expect(error).not.toBeDefined();
          Log(testName, invalidRequestToFollowTitle, 'Should not have thrown error');
          done();
        }

        try {
          const usernameDetails = { username: this.testUser.username };
          const requestedUser = { requestedUser: testUser3.username };
          const result = await UserMiddleware.requestToFollow(
            this.testUser,
            usernameDetails,
            requestedUser
          );
          expect(result).not.toBeDefined();
          Log(testName, invalidRequestToFollowTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message).toBe('You already have a pending follow request for that user');
          Log(testName, invalidRequestToFollowTitle, error.details);
        }

        // Clean up test case
        try {
          const result = await UserMiddleware.remove(testUser3, { username: testUser3.username });
          expect(result.success).toBeDefined();
        } catch (error) {
          expect(error).not.toBeDefined();
          Log(testName, invalidRequestToFollowTitle, 'Should not have thrown error');
        }

        done();
      });
    });

    const removeFollowRequestTitle = 'Remove follow request';
    describe(removeFollowRequestTitle, () => {
      beforeEach(async (done) => {
        const details = { username: this.testUser.username };
        const requestedUser = { requestedUser: this.testUser2.username };
        await UserMiddleware.requestToFollow(this.testUser, details, requestedUser);
        done();
      });

      it('removes a follow request to the user', async (done) => {
        const details = {
          username: this.testUser.username,
          requestedUser: this.testUser2.username,
        };

        const result = await UserMiddleware.removeFollowRequest(this.testUser, details);
        expect(result.success).toBeDefined();
        expect(result.success.message).toBeDefined();
        expect(typeof result.success.message).toBe('string');
        expect(result.success.message.toLowerCase()).toContain('removal');
        expect(this.testUser.followRequests.includes(this.testUser2.username)).toBe(false);
        Log(testName, removeFollowRequestTitle, result);
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
        const details = {
          username: this.testUser.username,
          requestedUser: this.testUser2.username,
        };

        try {
          const result = await UserMiddleware.removeFollowRequest(null, details);
          expect(result).not.toBeDefined();
          Log(testName, invalidRemoveFollowRequestTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.Server.type);
          expect(error.details.error.message).toBe(DroppError.type.Server.message);
          Log(testName, invalidRemoveFollowRequestTitle, error.details);
          done();
        }
      });

      it('throws an error for an invalid username details argument', async (done) => {
        try {
          const result = await UserMiddleware.removeFollowRequest(this.testUser, null);
          expect(result).not.toBeDefined();
          Log(testName, invalidRemoveFollowRequestTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe('username,requestedUser');
          Log(testName, invalidRemoveFollowRequestTitle, error.details);
        }

        done();
      });

      it('throws an error for an invalid username', async (done) => {
        const details = {
          username: this.invalidUsername,
          requestedUser: this.testUser2.username,
        };

        try {
          const result = await UserMiddleware.removeFollowRequest(this.testUser, details);
          expect(result).not.toBeDefined();
          Log(testName, invalidRemoveFollowRequestTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe('username');
          Log(testName, invalidRemoveFollowRequestTitle, error.details);
          done();
        }
      });

      it('throws an error for an invalid requested username', async (done) => {
        const details = {
          username: this.testUser.username,
          requestedUser: this.invalidUsername,
        };

        try {
          const result = await UserMiddleware.removeFollowRequest(this.testUser, details);
          expect(result).not.toBeDefined();
          Log(testName, invalidRemoveFollowRequestTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe('requestedUser');
          Log(testName, invalidRemoveFollowRequestTitle, error.details);
          done();
        }
      });

      it('throws an error for a missing requested username', async (done) => {
        const details = {
          requestedUser: undefined,
          username: this.testUser.username,
        };

        try {
          const result = await UserMiddleware.removeFollowRequest(this.testUser, details);
          expect(result).not.toBeDefined();
          Log(testName, invalidRemoveFollowRequestTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe('requestedUser');
          Log(testName, invalidRemoveFollowRequestTitle, error.details);
          done();
        }
      });

      it('throws an error for accessing a different user\'s follow requests', async (done) => {
        const details = {
          username: this.testUser2.username,
          requestedUser: this.testUser2.username,
        };

        try {
          const result = await UserMiddleware.removeFollowRequest(this.testUser, details);
          expect(result).not.toBeDefined();
          Log(testName, invalidRemoveFollowRequestTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message).toBe('Unauthorized to access that user\'s follow requests');
          Log(testName, invalidRemoveFollowRequestTitle, error.details);
        }

        done();
      });

      it('throws an error for removing a follow request from the same user', async (done) => {
        const details = {
          username: this.testUser.username,
          requestedUser: this.testUser.username,
        };

        try {
          const result = await UserMiddleware.removeFollowRequest(this.testUser, details);
          expect(result).not.toBeDefined();
          Log(testName, invalidRemoveFollowRequestTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message).toBe('You cannot remove a follow request from yourself');
          Log(testName, invalidRemoveFollowRequestTitle, error.details);
        }

        done();
      });

      it('throws an error for a non-existent requested user', async (done) => {
        const details = {
          requestedUser: Utils.newUuid(),
          username: this.testUser.username,
        };

        try {
          const result = await UserMiddleware.removeFollowRequest(this.testUser, details);
          expect(result).not.toBeDefined();
          Log(testName, invalidRemoveFollowRequestTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.ResourceDNE.type);
          expect(error.details.error.message).toBe('That user does not exist');
          Log(testName, invalidRemoveFollowRequestTitle, error.details);
          done();
        }
      });

      it('throws an error for a non-existent follow request', async (done) => {
        const details = {
          username: this.testUser.username,
          requestedUser: this.testUser2.username,
        };

        try {
          const result = await UserMiddleware.removeFollowRequest(this.testUser, details);
          expect(result).not.toBeDefined();
          Log(testName, invalidRemoveFollowRequestTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message).toBe('You do not have a pending follow request for that user');
          Log(testName, invalidRemoveFollowRequestTitle, error.details);
          done();
        }
      });
    });

    const respondToFollowerRequestTitle = 'Respond to follow request';
    describe(respondToFollowerRequestTitle, () => {
      beforeEach(async (done) => {
        const details = { username: this.testUser.username };
        const requestedUser = { requestedUser: this.testUser2.username };
        await UserMiddleware.requestToFollow(this.testUser, details, requestedUser);
        done();
      });

      it('accepts a follower request', async (done) => {
        const details = { accept: 'true' };
        const usernameDetails = {
          username: this.testUser2.username,
          requestedUser: this.testUser.username,
        };

        const result = await UserMiddleware.respondToFollowerRequest(
          this.testUser2,
          usernameDetails,
          details
        );
        expect(result.success).toBeDefined();
        expect(result.success.message).toBe('Successful follow request acceptance');
        expect(this.testUser2.followerRequests.includes(this.testUser.username)).toBe(false);
        expect(this.testUser2.followers.includes(this.testUser.username)).toBe(true);
        Log(testName, respondToFollowerRequestTitle, result);
        done();
      });

      it('declines a follower request', async (done) => {
        const details = { accept: 'false' };
        const usernameDetails = {
          username: this.testUser2.username,
          requestedUser: this.testUser.username,
        };

        const result = await UserMiddleware.respondToFollowerRequest(
          this.testUser2,
          usernameDetails,
          details
        );
        expect(result.success).toBeDefined();
        expect(result.success.message).toBe('Successful follow request denial');
        expect(this.testUser2.followerRequests.includes(this.testUser.username)).toBe(false);
        expect(this.testUser2.followers.includes(this.testUser.username)).toBe(false);
        Log(testName, respondToFollowerRequestTitle, result);
        done();
      });
    });

    const invalidRespondToFollowerRequestTitle = 'Invalid respond to follow request';
    describe(invalidRespondToFollowerRequestTitle, () => {
      beforeEach(() => {
        this.invalidUsername = 'test';
        this.invalidDetails = {
          accept: 'true',
        };
      });

      afterEach(() => {
        delete this.invalidDetails;
        delete this.invalidUsername;
      });

      it('throws an error for an invalid current user', async (done) => {
        const usernameDetails = {
          username: this.testUser.username,
          requestedUser: this.testUser2.username,
        };

        try {
          const result = await UserMiddleware.respondToFollowerRequest(
            null,
            usernameDetails,
            this.invalidDetails
          );
          expect(result).not.toBeDefined();
          Log(testName, invalidRespondToFollowerRequestTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.Server.type);
          expect(error.details.error.message).toBe(DroppError.type.Server.message);
          Log(testName, invalidRespondToFollowerRequestTitle, error.details);
          done();
        }
      });

      it('throws an error for null username details', async (done) => {
        try {
          const result = await UserMiddleware.respondToFollowerRequest(
            this.testUser,
            null,
            this.invalidDetails
          );
          expect(result).not.toBeDefined();
          Log(testName, invalidRespondToFollowerRequestTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe('username,requestedUser');
          Log(testName, invalidRespondToFollowerRequestTitle, error.details);
          done();
        }
      });

      it('throws an error for null details', async (done) => {
        const usernameDetails = {
          username: this.testUser.username,
          requestedUser: this.testUser2.username,
        };

        try {
          const result = await UserMiddleware.respondToFollowerRequest(
            this.testUser,
            usernameDetails,
            null
          );
          expect(result).not.toBeDefined();
          Log(testName, invalidRespondToFollowerRequestTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe('accept');
          Log(testName, invalidRespondToFollowerRequestTitle, error.details);
          done();
        }
      });

      it('throws an error for an invalid username', async (done) => {
        const usernameDetails = {
          requestedUser: '%',
          username: this.testUser.username,
        };

        try {
          const result = await UserMiddleware.respondToFollowerRequest(
            this.testUser,
            usernameDetails,
            this.invalidDetails
          );
          expect(result).not.toBeDefined();
          Log(testName, invalidRespondToFollowerRequestTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe('requestedUser');
          Log(testName, invalidRespondToFollowerRequestTitle, error.details);
          done();
        }
      });

      it('throws an error for an invalid accept parameter', async (done) => {
        this.invalidDetails.accept = 'hi';
        const usernameDetails = {
          username: this.testUser.username,
          requestedUser: this.testUser2.username,
        };

        try {
          const result = await UserMiddleware.respondToFollowerRequest(
            this.testUser,
            usernameDetails,
            this.invalidDetails
          );
          expect(result).not.toBeDefined();
          Log(testName, invalidRespondToFollowerRequestTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe('accept');
          Log(testName, invalidRespondToFollowerRequestTitle, error.details);
          done();
        }
      });

      it('throws an error for an invalid username and accept parameter', async (done) => {
        this.invalidDetails.accept = '%';
        const usernameDetails = {
          requestedUser: '%',
          username: this.testUser.username,
        };

        try {
          const result = await UserMiddleware.respondToFollowerRequest(
            this.testUser,
            usernameDetails,
            this.invalidDetails
          );
          expect(result).not.toBeDefined();
          Log(testName, invalidRespondToFollowerRequestTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe('requestedUser,accept');
          Log(testName, invalidRespondToFollowerRequestTitle, error.details);
          done();
        }
      });

      it('throws an error for accessing a different user\'s follow requests', async (done) => {
        const usernameDetails = {
          username: this.testUser2.username,
          requestedUser: this.testUser2.username,
        };

        try {
          const result = await UserMiddleware.respondToFollowerRequest(
            this.testUser,
            usernameDetails,
            this.invalidDetails
          );
          expect(result).not.toBeDefined();
          Log(testName, invalidRespondToFollowerRequestTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message).toBe('Unauthorized to access that user\'s follower requests');
          Log(testName, invalidRespondToFollowerRequestTitle, error.details);
        }

        done();
      });

      it(
        'throws an error for attempting to remove a follower request from the same user',
        async (done) => {
          const usernameDetails = {
            username: this.testUser.username,
            requestedUser: this.testUser.username,
          };

          try {
            const result = await UserMiddleware.respondToFollowerRequest(
              this.testUser,
              usernameDetails,
              this.invalidDetails
            );
            expect(result).not.toBeDefined();
            Log(testName, invalidRespondToFollowerRequestTitle, 'Should have thrown error');
          } catch (error) {
            expect(error.name).toBe('DroppError');
            expect(error.details.error.type).toBe(DroppError.type.Resource.type);
            expect(error.details.error.message).toBe('You cannot respond to a follower request from yourself');
            Log(testName, invalidRespondToFollowerRequestTitle, error.details);
          }

          done();
        }
      );

      it('throws an error for a non-existent user', async (done) => {
        const usernameDetails = {
          requestedUser: Utils.newUuid(),
          username: this.testUser.username,
        };

        try {
          const result = await UserMiddleware.respondToFollowerRequest(
            this.testUser,
            usernameDetails,
            this.invalidDetails
          );
          expect(result).not.toBeDefined();
          Log(testName, invalidRespondToFollowerRequestTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.ResourceDNE.type);
          expect(error.details.error.message).toBe('That user does not exist');
          Log(testName, invalidRespondToFollowerRequestTitle, error.details);
          done();
        }
      });

      it('throws an error for a non-existent follower request', async (done) => {
        const usernameDetails = {
          username: this.testUser.username,
          requestedUser: this.testUser2.username,
        };

        try {
          const result = await UserMiddleware.respondToFollowerRequest(
            this.testUser,
            usernameDetails,
            this.invalidDetails
          );
          expect(result).not.toBeDefined();
          Log(testName, invalidRespondToFollowerRequestTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message).toBe('That user has not requested to follow you');
          Log(testName, invalidRespondToFollowerRequestTitle, error.details);
          done();
        }
      });
    });

    const updateFollowFollowerTitle = 'Update follow/follower';
    describe(updateFollowFollowerTitle, () => {
      beforeEach(async (done) => {
        const details = { accept: 'true' };
        const user1Details = {
          username: this.testUser.username,
          requestedUser: this.testUser2.username,
        };

        const user2Details = {
          username: this.testUser2.username,
          requestedUser: this.testUser.username,
        };

        await UserMiddleware.requestToFollow(this.testUser, user1Details, user1Details);
        await UserMiddleware.respondToFollowerRequest(this.testUser2, user2Details, details);
        done();
      });

      it('unfollows a user', async (done) => {
        const usernameDetails = {
          follow: this.testUser2.username,
          username: this.testUser.username,
        };

        const result = await UserMiddleware.unfollow(this.testUser, usernameDetails);
        expect(result.success).toBeDefined();
        expect(result.success.message).toBeDefined();
        expect(typeof result.success.message).toBe('string');
        expect(result.success.message.toLowerCase()).toContain('unfollow');
        expect(this.testUser.follows.includes(this.testUser2.username)).toBe(false);
        done();
      });

      it('removes a follower', async (done) => {
        const usernameDetails = {
          follower: this.testUser.username,
          username: this.testUser2.username,
        };

        const result = await UserMiddleware.removeFollower(this.testUser2, usernameDetails);
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
        const usernameDetails = {
          follow: this.invalidUsername,
          username: this.testUser.username,
        };

        try {
          const result = await UserMiddleware.unfollow(null, usernameDetails);
          expect(result).not.toBeDefined();
          Log(testName, invalidUnfollowTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.Server.type);
          expect(error.details.error.message).toBe(DroppError.type.Server.message);
          Log(testName, invalidUnfollowTitle, error.details);
          done();
        }
      });

      it('throws an error for an invalid username details argument', async (done) => {
        try {
          const result = await UserMiddleware.unfollow(this.testUser, null);
          expect(result).not.toBeDefined();
          Log(testName, invalidUnfollowTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe('username,follow');
          Log(testName, invalidUnfollowTitle, error.details);
          done();
        }
      });

      it('throws an error for an invalid requested username', async (done) => {
        const usernameDetails = {
          follow: this.invalidUsername,
          username: this.testUser.username,
        };

        try {
          const result = await UserMiddleware.unfollow(this.testUser, usernameDetails);
          expect(result).not.toBeDefined();
          Log(testName, invalidUnfollowTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe('follow');
          Log(testName, invalidUnfollowTitle, error.details);
          done();
        }
      });

      it('throws an error for an invalid current username', async (done) => {
        const usernameDetails = {
          username: this.invalidUsername,
          follow: this.testUser2.username,
        };

        try {
          const result = await UserMiddleware.unfollow(this.testUser, usernameDetails);
          expect(result).not.toBeDefined();
          Log(testName, invalidUnfollowTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe('username');
          Log(testName, invalidUnfollowTitle, error.details);
          done();
        }
      });

      it('throws an error for accessing a different user\'s follows', async (done) => {
        const usernameDetails = {
          follow: this.testUser2.username,
          username: this.testUser2.username,
        };

        try {
          const result = await UserMiddleware.unfollow(this.testUser, usernameDetails);
          expect(result).not.toBeDefined();
          Log(testName, invalidUnfollowTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message).toBe('Unauthorized to access that user\'s follows');
          Log(testName, invalidUnfollowTitle, error.details);
        }

        done();
      });

      it('throws an error for attempting to unfollow the same user', async (done) => {
        const usernameDetails = {
          follow: this.testUser.username,
          username: this.testUser.username,
        };

        try {
          const result = await UserMiddleware.unfollow(this.testUser, usernameDetails);
          expect(result).not.toBeDefined();
          Log(testName, invalidUnfollowTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message).toBe('You cannot unfollow yourself');
          Log(testName, invalidUnfollowTitle, error.details);
        }

        done();
      });

      it('throws an error for a non-existent user', async (done) => {
        const usernameDetails = {
          follow: Utils.newUuid(),
          username: this.testUser.username,
        };

        try {
          const result = await UserMiddleware.unfollow(this.testUser, usernameDetails);
          expect(result).not.toBeDefined();
          Log(testName, invalidUnfollowTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.ResourceDNE.type);
          expect(error.details.error.message).toBe('That user does not exist');
          Log(testName, invalidUnfollowTitle, error.details);
          done();
        }
      });

      it('throws an error for a non-existent follow', async (done) => {
        const usernameDetails = {
          follow: this.testUser2.username,
          username: this.testUser.username,
        };

        try {
          const result = await UserMiddleware.unfollow(this.testUser, usernameDetails);
          expect(result).not.toBeDefined();
          Log(testName, invalidUnfollowTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message).toBe('You do not follow that user');
          Log(testName, invalidUnfollowTitle, error.details);
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
        const usernameDetails = {
          username: this.testUser.username,
          follower: this.testUser2.username,
        };

        try {
          const result = await UserMiddleware.removeFollower(null, usernameDetails);
          expect(result).not.toBeDefined();
          Log(testName, invalidRemoveFollowerTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.Server.type);
          expect(error.details.error.message).toBe(DroppError.type.Server.message);
          Log(testName, invalidRemoveFollowerTitle, error.details);
          done();
        }
      });

      it('throws an error for an invalid username details argument', async (done) => {
        try {
          const result = await UserMiddleware.removeFollower(this.testUser, null);
          expect(result).not.toBeDefined();
          Log(testName, invalidRemoveFollowerTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe('username,follower');
          Log(testName, invalidRemoveFollowerTitle, error.details);
          done();
        }
      });

      it('throws an error for accessing a different user\'s followers', async (done) => {
        const usernameDetails = {
          follower: this.testUser2.username,
          username: this.testUser2.username,
        };

        try {
          const result = await UserMiddleware.removeFollower(this.testUser, usernameDetails);
          expect(result).not.toBeDefined();
          Log(testName, invalidRemoveFollowerTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message).toBe('Unauthorized to access that user\'s followers');
          Log(testName, invalidRemoveFollowerTitle, error.details);
        }

        done();
      });

      it('throws an error for attempting to remove the same follower', async (done) => {
        const usernameDetails = {
          follower: this.testUser.username,
          username: this.testUser.username,
        };

        try {
          const result = await UserMiddleware.removeFollower(this.testUser, usernameDetails);
          expect(result).not.toBeDefined();
          Log(testName, invalidRemoveFollowerTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message).toBe('You cannot remove yourself as a follower');
          Log(testName, invalidRemoveFollowerTitle, error.details);
        }

        done();
      });

      it('throws an error for a non-existent user', async (done) => {
        const usernameDetails = {
          follower: Utils.newUuid(),
          username: this.testUser.username,
        };

        try {
          const result = await UserMiddleware.removeFollower(this.testUser, usernameDetails);
          expect(result).not.toBeDefined();
          Log(testName, invalidRemoveFollowerTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.ResourceDNE.type);
          expect(error.details.error.message).toBe('That user does not exist');
          Log(testName, invalidRemoveFollowerTitle, error.details);
          done();
        }
      });

      it('throws an error for a non-existent follower', async (done) => {
        const usernameDetails = {
          username: this.testUser.username,
          follower: this.testUser2.username,
        };

        try {
          const result = await UserMiddleware.removeFollower(this.testUser, usernameDetails);
          expect(result).not.toBeDefined();
          Log(testName, invalidRemoveFollowerTitle, 'Should have thrown error');
          done();
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message).toBe('That user does not follow you');
          Log(testName, invalidRemoveFollowerTitle, error.details);
          done();
        }
      });
    });
  });

  const removeUserTitle = 'Remove user';
  describe(removeUserTitle, () => {
    it('removes a user', async (done) => {
      const result = await UserMiddleware.remove(this.newUser, { username: this.newUser.username });
      expect(result.success.message).toBe('Successfully removed all user data');
      try {
        const user = await UserMiddleware.get(this.testUser, { username: this.newUser.username });
        expect(user).not.toBeDefined();
        Log(testName, removeUserTitle, `Was able to fetch ${user.username} after removing them`);
      } catch (retrieveUserError) {
        expect(retrieveUserError.name).toBe('DroppError');
        expect(retrieveUserError.statusCode).toBe(DroppError.type.ResourceDNE.status);
        Log(testName, removeUserTitle, retrieveUserError);
      }

      done();
    });
  });

  const invalidRemoveTitle = 'Invalid remove user';
  describe(invalidRemoveTitle, () => {
    beforeEach(() => {
      this.invalidUsername = '%';
    });

    afterEach(() => {
      delete this.invalidUsername;
    });

    it('throws an error for an invalid current user', async (done) => {
      try {
        const result = await UserMiddleware.remove(null, { username: this.invalidUsername });
        expect(result).not.toBeDefined();
        Log(testName, invalidRemoveTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log(testName, invalidRemoveTitle, error.details);
        done();
      }
    });

    it('throws an error for invalid username details', async (done) => {
      try {
        const result = await UserMiddleware.remove(this.testUser, null);
        expect(result).not.toBeDefined();
        Log(testName, invalidRemoveTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('username');
        Log(testName, invalidRemoveTitle, error.details);
        done();
      }
    });

    it('throws an error for an invalid username', async (done) => {
      const details = { username: this.invalidUsername };
      try {
        const result = await UserMiddleware.remove(this.testUser, details);
        expect(result).not.toBeDefined();
        Log(testName, invalidRemoveTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('username');
        Log(testName, invalidRemoveTitle, error.details);
        done();
      }
    });

    it('throws an error for a missing username', async (done) => {
      delete this.invalidUsername;
      const details = { username: this.invalidUsername };
      try {
        const result = await UserMiddleware.remove(this.testUser, details);
        expect(result).not.toBeDefined();
        Log(testName, invalidRemoveTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('username');
        Log(testName, invalidRemoveTitle, error.details);
        done();
      }
    });

    it('throws an error for a different user', async (done) => {
      try {
        const result = await UserMiddleware.remove(this.testUser, { username: 'test' });
        expect(result).not.toBeDefined();
        Log(testName, invalidRemoveTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message).toBe('Unauthorized to remove that user');
        Log(testName, invalidRemoveTitle, error.details);
        done();
      }
    });

    it('throws an error for a non-existent user', async (done) => {
      const user = new User({
        username: 'test',
        email: 'test@test.com',
      });

      try {
        const result = await UserMiddleware.remove(user, { username: user.username });
        expect(result).not.toBeDefined();
        Log(testName, invalidRemoveTitle, 'Should have thrown error');
        done();
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log(testName, invalidRemoveTitle, error.details);
        done();
      }
    });
  });
});
/* eslint-enable no-undef */

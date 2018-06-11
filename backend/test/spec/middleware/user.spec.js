const Log = require('../../logger');
const User = require('../../../src/models/User');
const Dropp = require('../../../src/models/Dropp');
const Utils = require('../../../src/utilities/utils');
const Location = require('../../../src/models/Location');
const Firebase = require('../../../src/firebase/firebase');
const UserAccessor = require('../../../src/database/user');
const DroppError = require('../../../src/errors/DroppError');
const DroppAccessor = require('../../../src/database/dropp');
const Constants = require('../../../src/utilities/constants');
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
    Log.beforeEach(testName, testName, true);
    this.testUser = await UserMiddleware.create(this.testUserData);
    this.testUserDetails = { username: this.testUser.username };
    Log.beforeEach(testName, testName, false);
    done();
  });

  afterEach(async (done) => {
    Log.afterEach(testName, testName, true);
    await UserMiddleware.remove(this.testUser, { username: this.testUser.username });
    delete this.testUser;
    delete this.testUserDetails;
    Log.afterEach(testName, testName, false);
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

    const it1 = 'creates a user';
    it(it1, async (done) => {
      Log.it(testName, createUserTitle, it1, true);
      this.newUser = await UserMiddleware.create(this.testUserData2);
      expect(this.newUser).toBeDefined();
      expect(this.newUser.email).toBe(this.testUserData2.email);
      expect(this.newUser.username).toBe(this.testUserData2.username);
      expect(this.newUser.password).not.toBe(this.testUserData2.password);
      Log.log(testName, createUserTitle, this.newUser);
      Log.it(testName, createUserTitle, it1, false);
      done();
    });

    const invalidCreateUserTitle = 'Invalid details';
    describe(invalidCreateUserTitle, () => {
      beforeEach(() => {
        Log.beforeEach(testName, invalidCreateUserTitle, true);
        const uuid2 = Utils.newUuid();
        this.invalidUserDetails = {
          username: uuid2,
          password: uuid2,
          email: `${uuid2}@${uuid2}.com`,
        };

        Log.beforeEach(testName, invalidCreateUserTitle, false);
      });

      afterEach(() => {
        Log.afterEach(testName, invalidCreateUserTitle, true);
        delete this.invalidUserDetails;
        Log.afterEach(testName, invalidCreateUserTitle, false);
      });

      const it2 = 'throws an error for null user details';
      it(it2, async (done) => {
        Log.it(testName, createUserTitle, it2, true);
        try {
          const result = await UserMiddleware.create(null);
          expect(result).not.toBeDefined();
          Log.log(testName, invalidCreateUserTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe('email,username,password');
          Log.log(testName, invalidCreateUserTitle, error.details);
        }

        Log.it(testName, createUserTitle, it2, false);
        done();
      });

      const it3 = 'throws an error for missing username';
      it(it3, async (done) => {
        Log.it(testName, createUserTitle, it3, true);
        try {
          delete this.invalidUserDetails.username;
          const result = await UserMiddleware.create(this.invalidUserDetails);
          expect(result).not.toBeDefined();
          Log.log(testName, invalidCreateUserTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe('username');
          Log.log(testName, invalidCreateUserTitle, error.details);
        }

        Log.it(testName, createUserTitle, it3, false);
        done();
      });

      const it4 = 'throws an error for missing password';
      it(it4, async (done) => {
        Log.it(testName, invalidCreateUserTitle, it4, true);
        try {
          delete this.invalidUserDetails.password;
          const result = await UserMiddleware.create(this.invalidUserDetails);
          expect(result).not.toBeDefined();
          Log.log(testName, invalidCreateUserTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe('password');
          Log.log(testName, invalidCreateUserTitle, error.details);
        }

        Log.it(testName, invalidCreateUserTitle, it4, false);
        done();
      });

      const it5 = 'throws an error for missing email';
      it(it5, async (done) => {
        Log.it(testName, invalidCreateUserTitle, it5, true);
        try {
          delete this.invalidUserDetails.email;
          const result = await UserMiddleware.create(this.invalidUserDetails);
          expect(result).not.toBeDefined();
          Log.log(testName, invalidCreateUserTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe('email');
          Log.log(testName, invalidCreateUserTitle, error.details);
        }

        Log.it(testName, invalidCreateUserTitle, it5, false);
        done();
      });

      const it6 = 'throws an error for 2 missing details';
      it(it6, async (done) => {
        Log.it(testName, invalidCreateUserTitle, it6, true);
        try {
          delete this.invalidUserDetails.username;
          delete this.invalidUserDetails.password;
          const result = await UserMiddleware.create(this.invalidUserDetails);
          expect(result).not.toBeDefined();
          Log.log(testName, invalidCreateUserTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe('username,password');
          Log.log(testName, invalidCreateUserTitle, error.details);
        }

        Log.it(testName, invalidCreateUserTitle, it6, false);
        done();
      });

      const it7 = 'throws an error for 3 missing details';
      it(it7, async (done) => {
        Log.it(testName, invalidCreateUserTitle, it7, true);
        try {
          delete this.invalidUserDetails.email;
          delete this.invalidUserDetails.username;
          delete this.invalidUserDetails.password;
          const result = await UserMiddleware.create(this.invalidUserDetails);
          expect(result).not.toBeDefined();
          Log.log(testName, invalidCreateUserTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe('email,username,password');
          Log.log(testName, invalidCreateUserTitle, error.details);
        }

        Log.it(testName, invalidCreateUserTitle, it7, false);
        done();
      });

      const it8 = 'throws an error for already existing username';
      it(it8, async (done) => {
        Log.it(testName, invalidCreateUserTitle, it8, true);
        try {
          this.invalidUserDetails.username = this.testUserData.username;
          const result = await UserMiddleware.create(this.invalidUserDetails);
          expect(result).not.toBeDefined();
          Log.log(testName, invalidCreateUserTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message).toBe('A user with that username already exists');
          Log.log(testName, invalidCreateUserTitle, error.details);
        }

        Log.it(testName, invalidCreateUserTitle, it8, false);
        done();
      });
    });
  });

  const getSameUserTitle = 'Get same user';
  describe(getSameUserTitle, () => {
    const details = { username: this.uuid2 };
    const it1 = 'retrieves a user\'s private details';
    it(it1, async (done) => {
      Log.it(testName, getSameUserTitle, it1, true);
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
      Log.log(testName, getSameUserTitle, user);
      Log.it(testName, getSameUserTitle, it1, false);
      done();
    });
  });

  const getDifferentUserTitle = 'Get different user';
  describe(getDifferentUserTitle, () => {
    const details = { username: this.uuid2 };
    const it1 = 'retrieves a user\'s public details';
    it(it1, async (done) => {
      Log.it(testName, getSameUserTitle, it1, true);
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
      Log.log(testName, getDifferentUserTitle, user);
      Log.it(testName, getSameUserTitle, it1, false);
      done();
    });
  });

  const invalidGetUserTitle = 'Invalid get user';
  describe(invalidGetUserTitle, () => {
    beforeEach(() => {
      Log.beforeEach(testName, invalidGetUserTitle, true);
      this.invalidDetails = {
        username: '$%l;kadfjs',
      };

      Log.beforeEach(testName, invalidGetUserTitle, false);
    });

    afterEach(() => {
      Log.afterEach(testName, invalidGetUserTitle, true);
      delete this.invalidDetails;
      Log.afterEach(testName, invalidGetUserTitle, false);
    });

    const it1 = 'throws an error for an invalid current user';
    it(it1, async (done) => {
      Log.it(testName, createUserTitle, it1, true);
      try {
        const result = await UserMiddleware.get(null, this.invalidDetails);
        expect(result).not.toBeDefined();
        Log.log(testName, invalidGetUserTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(testName, invalidGetUserTitle, error.details);
      }

      Log.it(testName, createUserTitle, it1, false);
      done();
    });

    const it2 = 'throws an error for null details';
    it(it2, async (done) => {
      Log.it(testName, invalidGetUserTitle, it2, true);
      try {
        const result = await UserMiddleware.get(this.testUser, null);
        expect(result).not.toBeDefined();
        Log.log(testName, invalidGetUserTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('username');
        Log.log(testName, invalidGetUserTitle, error.details);
      }

      Log.it(testName, invalidGetUserTitle, it2, false);
      done();
    });

    const it3 = 'throws an error for an invalid username';
    it(it3, async (done) => {
      Log.it(testName, invalidGetUserTitle, it3, true);
      try {
        const result = await UserMiddleware.get(this.testUser, this.invalidDetails);
        expect(result).not.toBeDefined();
        Log.log(testName, invalidGetUserTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('username');
        Log.log(testName, invalidGetUserTitle, error.details);
      }

      Log.it(testName, invalidGetUserTitle, it3, false);
      done();
    });

    const it4 = 'throws an error for a missing username';
    it(it4, async (done) => {
      Log.it(testName, invalidGetUserTitle, it4, true);
      delete this.invalidDetails.username;
      try {
        const result = await UserMiddleware.get(this.testUser, this.invalidDetails);
        expect(result).not.toBeDefined();
        Log.log(testName, invalidGetUserTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('username');
        Log.log(testName, invalidGetUserTitle, error.details);
      }

      Log.it(testName, invalidGetUserTitle, it4, false);
      done();
    });

    const it5 = 'throws an error for a non-existent user';
    it(it5, async (done) => {
      Log.it(testName, invalidGetUserTitle, it5, true);
      this.invalidDetails.username = Utils.newUuid();
      try {
        const result = await UserMiddleware.get(this.testUser, this.invalidDetails);
        expect(result).not.toBeDefined();
        Log.log(testName, invalidGetUserTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.ResourceDNE.type);
        expect(error.details.error.message).toBe('That user does not exist');
        Log.log(testName, invalidGetUserTitle, error.details);
      }

      Log.it(testName, invalidGetUserTitle, it5, false);
      done();
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
      Log.afterEach(testName, addNewUserTitle, true);
      const user = await UserAccessor.get(details.username);
      await UserMiddleware.remove(user, { username: details.username });
      Log.afterEach(testName, addNewUserTitle, false);
      done();
    });

    const it1 = 'adds a new user';
    it(it1, async (done) => {
      Log.it(testName, invalidGetUserTitle, it1, true);
      const result = await UserMiddleware.addNewUser(details);
      expect(result.success).toBeDefined();
      expect(result.success.token).toBeDefined();
      expect(typeof result.success.token).toBe('string');
      expect(result.success.token).toContain('Bearer');
      Log.log(testName, addNewUserTitle, result);
      Log.it(testName, invalidGetUserTitle, it1, false);
      done();
    });
  });

  const getAuthTokenTitle = 'Get authentication token';
  describe(getAuthTokenTitle, () => {
    const it1 = 'gets an authentication token';
    it(it1, async (done) => {
      Log.it(testName, addNewUserTitle, it1, true);
      const details = {
        username: this.testUser.username,
        password: this.testUserData.password,
      };

      const result = await UserMiddleware.getAuthToken(details);
      expect(result.success).toBeDefined();
      expect(result.success.token).toBeDefined();
      expect(typeof result.success.token).toBe('string');
      expect(result.success.token).toContain('Bearer');
      Log.log(testName, getAuthTokenTitle, result);
      Log.it(testName, addNewUserTitle, it1, false);
      done();
    });
  });

  const invalidGetAuthTokenTitle = 'Invalid get authentication token';
  describe(invalidGetAuthTokenTitle, () => {
    beforeEach(() => {
      Log.beforeEach(testName, invalidGetAuthTokenTitle, true);
      this.invalidDetails = {
        username: Utils.newUuid(),
        password: Utils.newUuid(),
      };

      Log.beforeEach(testName, invalidGetAuthTokenTitle, false);
    });

    afterEach(() => {
      Log.afterEach(testName, invalidGetAuthTokenTitle, true);
      delete this.invalidDetails;
      Log.afterEach(testName, invalidGetAuthTokenTitle, false);
    });

    const it1 = 'throws an error for null details';
    it(it1, async (done) => {
      Log.it(testName, invalidGetAuthTokenTitle, it1, true);
      try {
        const result = await UserMiddleware.getAuthToken(null);
        expect(result).not.toBeDefined();
        Log.log(testName, invalidGetAuthTokenTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('username,password');
        Log.log(testName, invalidGetAuthTokenTitle, error.details);
      }

      Log.it(testName, invalidGetAuthTokenTitle, it1, false);
      done();
    });

    const it2 = 'throws an error for an invalid username and password';
    it(it2, async (done) => {
      Log.it(testName, invalidGetAuthTokenTitle, it2, true);
      this.invalidDetails.username = '$%l;kadfjs';
      this.invalidDetails.password = 'he$';
      try {
        const result = await UserMiddleware.getAuthToken(this.invalidDetails);
        expect(result).not.toBeDefined();
        Log.log(testName, invalidGetAuthTokenTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('username,password');
        Log.log(testName, invalidGetAuthTokenTitle, error.details);
      }

      Log.it(testName, invalidGetAuthTokenTitle, it2, false);
      done();
    });

    const it3 = 'throws an error for a missing username';
    it(it3, async (done) => {
      Log.it(testName, invalidGetAuthTokenTitle, it3, true);
      delete this.invalidDetails.username;
      try {
        const result = await UserMiddleware.getAuthToken(this.invalidDetails);
        expect(result).not.toBeDefined();
        Log.log(testName, invalidGetAuthTokenTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('username');
        Log.log(testName, invalidGetAuthTokenTitle, error.details);
      }

      Log.it(testName, invalidGetAuthTokenTitle, it3, false);
      done();
    });

    const it4 = 'throws an error for a missing password';
    it(it4, async (done) => {
      Log.it(testName, invalidGetAuthTokenTitle, it4, true);
      delete this.invalidDetails.password;
      try {
        const result = await UserMiddleware.getAuthToken(this.invalidDetails);
        expect(result).not.toBeDefined();
        Log.log(testName, invalidGetAuthTokenTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('password');
        Log.log(testName, invalidGetAuthTokenTitle, error.details);
      }

      Log.it(testName, invalidGetAuthTokenTitle, it4, false);
      done();
    });

    const it5 = 'throws an error for a non-existent user';
    it(it5, async (done) => {
      Log.it(testName, invalidGetAuthTokenTitle, it5, true);
      try {
        const result = await UserMiddleware.getAuthToken(this.invalidDetails);
        expect(result).not.toBeDefined();
        Log.log(testName, invalidGetAuthTokenTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Login.type);
        expect(error.details.error.message).toBe(DroppError.type.Login.message);
        Log.log(testName, invalidGetAuthTokenTitle, error.details);
      }

      Log.it(testName, invalidGetAuthTokenTitle, it5, false);
      done();
    });

    const it6 = 'throws an error for an incorrect password';
    it(it6, async (done) => {
      Log.it(testName, invalidGetAuthTokenTitle, it6, true);
      this.invalidDetails.username = this.testUser.username;
      try {
        const result = await UserMiddleware.getAuthToken(this.invalidDetails);
        expect(result).not.toBeDefined();
        Log.log(testName, invalidGetAuthTokenTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Login.type);
        expect(error.details.error.message).toBe(DroppError.type.Login.message);
        Log.log(testName, invalidGetAuthTokenTitle, error.details);
      }

      Log.it(testName, invalidGetAuthTokenTitle, it6, false);
      done();
    });
  });

  const updatePasswordTitle = 'Update password';
  describe(updatePasswordTitle, () => {
    const it1 = 'updates the user\'s password';
    it(it1, async (done) => {
      Log.it(testName, updatePasswordTitle, it1, true);
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
      Log.log(testName, updatePasswordTitle, result);
      Log.it(testName, updatePasswordTitle, it1, false);
      done();
    });
  });

  const invalidUpdatePasswordTitle = 'Invalid update password';
  describe(invalidUpdatePasswordTitle, () => {
    beforeEach(() => {
      Log.beforeEach(testName, invalidUpdatePasswordTitle, true);
      this.invalidDetails = {
        oldPassword: this.testUserData.password,
        newPassword: Utils.newUuid(),
      };

      Log.beforeEach(testName, invalidUpdatePasswordTitle, false);
    });

    afterEach(() => {
      Log.afterEach(testName, invalidUpdatePasswordTitle, true);
      delete this.invalidDetails;
      Log.afterEach(testName, invalidUpdatePasswordTitle, false);
    });

    const it1 = 'throws an error for an invalid current user';
    it(it1, async (done) => {
      Log.it(testName, invalidGetAuthTokenTitle, it1, true);
      try {
        const result = await UserMiddleware.updatePassword(
          null,
          this.testUserDetails,
          this.invalidDetails
        );
        expect(result).not.toBeDefined();
        Log.log(testName, invalidUpdatePasswordTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(testName, invalidUpdatePasswordTitle, error.details);
      }

      Log.it(testName, invalidGetAuthTokenTitle, it1, false);
      done();
    });

    const it2 = 'throws an error for null details';
    it(it2, async (done) => {
      Log.it(testName, invalidUpdatePasswordTitle, it2, true);
      try {
        const result = await UserMiddleware.updatePassword(
          this.testUser,
          this.testUserDetails,
          null
        );
        expect(result).not.toBeDefined();
        Log.log(testName, invalidUpdatePasswordTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('oldPassword,newPassword');
        Log.log(testName, invalidUpdatePasswordTitle, error.details);
      }

      Log.it(testName, invalidUpdatePasswordTitle, it2, false);
      done();
    });

    const it3 = 'throws an error for null username details';
    it(it3, async (done) => {
      Log.it(testName, invalidUpdatePasswordTitle, it3, true);
      const details = {
        oldPassword: this.testUserData.password,
        newPassword: 'test2',
      };

      try {
        const result = await UserMiddleware.updatePassword(this.testUser, null, details);
        expect(result).not.toBeDefined();
        Log.log(testName, invalidUpdatePasswordTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message).toBe('Unauthorized to access that');
        Log.log(testName, invalidUpdatePasswordTitle, error.details);
      }

      Log.it(testName, invalidUpdatePasswordTitle, it3, false);
      done();
    });

    const it4 = 'throws an error for an invalid old and new password';
    it(it4, async (done) => {
      Log.it(testName, invalidUpdatePasswordTitle, it4, true);
      this.invalidDetails.oldPassword = '$%';
      this.invalidDetails.newPassword = 'he$';
      try {
        const result = await UserMiddleware.updatePassword(
          this.testUser,
          this.testUserDetails,
          this.invalidDetails
        );
        expect(result).not.toBeDefined();
        Log.log(testName, invalidUpdatePasswordTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('oldPassword,newPassword');
        Log.log(testName, invalidUpdatePasswordTitle, error.details);
      }

      Log.it(testName, invalidUpdatePasswordTitle, it4, false);
      done();
    });

    const it5 = 'throws an error for a missing old password';
    it(it5, async (done) => {
      Log.it(testName, invalidUpdatePasswordTitle, it5, true);
      delete this.invalidDetails.oldPassword;
      try {
        const result = await UserMiddleware.updatePassword(
          this.testUser,
          this.testUserDetails,
          this.invalidDetails
        );
        expect(result).not.toBeDefined();
        Log.log(testName, invalidUpdatePasswordTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('oldPassword');
        Log.log(testName, invalidUpdatePasswordTitle, error.details);
      }

      Log.it(testName, invalidUpdatePasswordTitle, it5, false);
      done();
    });

    const it6 = 'throws an error for a missing new password';
    it(it6, async (done) => {
      Log.it(testName, invalidUpdatePasswordTitle, it6, true);
      delete this.invalidDetails.newPassword;
      try {
        const result = await UserMiddleware.updatePassword(
          this.testUser,
          this.testUserDetails,
          this.invalidDetails
        );
        expect(result).not.toBeDefined();
        Log.log(testName, invalidUpdatePasswordTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('newPassword');
        Log.log(testName, invalidUpdatePasswordTitle, error.details);
      }

      Log.it(testName, invalidUpdatePasswordTitle, it6, false);
      done();
    });

    const it7 = 'throws an error for identical old and new passwords';
    it(it7, async (done) => {
      Log.it(testName, invalidUpdatePasswordTitle, it7, true);
      this.invalidDetails.newPassword = this.invalidDetails.oldPassword;
      try {
        const result = await UserMiddleware.updatePassword(
          this.testUser,
          this.testUserDetails,
          this.invalidDetails
        );
        expect(result).not.toBeDefined();
        Log.log(testName, invalidUpdatePasswordTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message).toBe('New value must be different than existing value');
        Log.log(testName, invalidUpdatePasswordTitle, error.details);
      }

      Log.it(testName, invalidUpdatePasswordTitle, it7, false);
      done();
    });

    const it8 = 'throws an error for updating a different user';
    it(it8, async (done) => {
      Log.it(testName, invalidUpdatePasswordTitle, it8, true);
      const details = { username: 'test' };
      try {
        const result = await UserMiddleware.updatePassword(
          this.testUser,
          details,
          this.invalidDetails
        );
        expect(result).not.toBeDefined();
        Log.log(testName, invalidUpdatePasswordTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message).toBe('Unauthorized to access that');
        Log.log(testName, invalidUpdatePasswordTitle, error.details);
      }

      Log.it(testName, invalidUpdatePasswordTitle, it8, false);
      done();
    });

    const it9 = 'throws an error for updating a non-existent current user';
    it(it9, async (done) => {
      Log.it(testName, invalidUpdatePasswordTitle, it9, true);
      const user = new User({
        username: 'test',
        email: 'test@test.com',
      });

      const details = { username: user.username };
      try {
        const result = await UserMiddleware.updatePassword(user, details, this.invalidDetails);
        expect(result).not.toBeDefined();
        Log.log(testName, invalidUpdatePasswordTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(testName, invalidUpdatePasswordTitle, error.details);
      }

      Log.it(testName, invalidUpdatePasswordTitle, it9, false);
      done();
    });

    const it10 = 'throws an error for an incorrect password';
    it(it10, async (done) => {
      Log.it(testName, invalidUpdatePasswordTitle, it10, true);
      this.invalidDetails.oldPassword = Utils.newUuid();
      try {
        const result = await UserMiddleware.updatePassword(
          this.testUser,
          this.testUserDetails,
          this.invalidDetails
        );
        expect(result).not.toBeDefined();
        Log.log(testName, invalidUpdatePasswordTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message).toBe('Old password must match existing password');
        Log.log(testName, invalidUpdatePasswordTitle, error.details);
      }

      Log.it(testName, invalidUpdatePasswordTitle, it10, false);
      done();
    });
  });

  const updateEmailTitle = 'Update email';
  describe(updateEmailTitle, () => {
    const it1 = 'updates the user\'s email';
    it(it1, async (done) => {
      Log.it(testName, updateEmailTitle, it1, true);
      const uuid2 = Utils.newUuid();
      const details = { newEmail: `${uuid2}@${uuid2}.com` };
      const result = await UserMiddleware.updateEmail(this.testUser, this.testUserDetails, details);
      expect(result.success).toBeDefined();
      expect(result.success.message).toBeDefined();
      expect(typeof result.success.message).toBe('string');
      expect(result.success.message.toLowerCase()).toContain('email');
      Log.log(testName, updateEmailTitle, result);
      Log.it(testName, updateEmailTitle, it1, false);
      done();
    });
  });

  const invalidUpdateEmailTitle = 'Invalid update email';
  describe(invalidUpdateEmailTitle, () => {
    beforeEach(() => {
      Log.beforeEach(testName, invalidUpdateEmailTitle, true);
      this.invalidDetails = {
        newEmail: Utils.newUuid(),
      };

      Log.beforeEach(testName, invalidUpdateEmailTitle, false);
    });

    afterEach(() => {
      Log.afterEach(testName, invalidUpdateEmailTitle, true);
      delete this.invalidDetails;
      Log.afterEach(testName, invalidUpdateEmailTitle, false);
    });

    const it1 = 'throws an error for an invalid current user';
    it(it1, async (done) => {
      Log.it(testName, invalidUpdateEmailTitle, it1, true);
      try {
        const result = await UserMiddleware.updateEmail(
          null,
          this.testUserDetails,
          this.invalidDetails
        );
        expect(result).not.toBeDefined();
        Log.log(testName, invalidUpdateEmailTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(testName, invalidUpdateEmailTitle, error.details);
      }

      Log.it(testName, invalidUpdateEmailTitle, it1, false);
      done();
    });

    const it2 = 'throws an error for null details';
    it(it2, async (done) => {
      Log.it(testName, invalidUpdateEmailTitle, it2, true);
      try {
        const result = await UserMiddleware.updateEmail(this.testUser, this.testUserDetails, null);
        expect(result).not.toBeDefined();
        Log.log(testName, invalidUpdateEmailTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('newEmail');
        Log.log(testName, invalidUpdateEmailTitle, error.details);
      }

      Log.it(testName, invalidUpdateEmailTitle, it2, false);
      done();
    });

    const it3 = 'throws an error for null username details';
    it(it3, async (done) => {
      Log.it(testName, invalidUpdateEmailTitle, it3, true);
      const details = { newEmail: `${Utils.newUuid()}@${Utils.newUuid()}.com` };
      try {
        const result = await UserMiddleware.updateEmail(this.testUser, null, details);
        expect(result).not.toBeDefined();
        Log.log(testName, invalidUpdateEmailTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message).toBe('Unauthorized to access that');
        Log.log(testName, invalidUpdateEmailTitle, error.details);
      }

      Log.it(testName, invalidUpdateEmailTitle, it3, false);
      done();
    });

    const it4 = 'throws an error for an invalid email';
    it(it4, async (done) => {
      Log.it(testName, invalidUpdateEmailTitle, it4, true);
      try {
        const result = await UserMiddleware.updateEmail(
          this.testUser,
          this.testUserDetails,
          this.invalidDetails
        );
        expect(result).not.toBeDefined();
        Log.log(testName, invalidUpdateEmailTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('newEmail');
        Log.log(testName, invalidUpdateEmailTitle, error.details);
      }

      Log.it(testName, invalidUpdateEmailTitle, it4, false);
      done();
    });

    const it5 = 'throws an error for a missing email';
    it(it5, async (done) => {
      Log.it(testName, invalidUpdateEmailTitle, it5, true);
      delete this.invalidDetails.newEmail;
      try {
        const result = await UserMiddleware.updateEmail(
          this.testUser,
          this.testUserDetails,
          this.invalidDetails
        );
        expect(result).not.toBeDefined();
        Log.log(testName, invalidUpdateEmailTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('newEmail');
        Log.log(testName, invalidUpdateEmailTitle, error.details);
      }

      Log.it(testName, invalidUpdateEmailTitle, it5, false);
      done();
    });

    const it6 = 'throws an error for updating a different user';
    it(it6, async (done) => {
      Log.it(testName, invalidUpdateEmailTitle, it6, true);
      this.invalidDetails.newEmail = 'test@test.com';
      try {
        const details = { username: 'test' };
        const result = await UserMiddleware.updateEmail(
          this.testUser,
          details,
          this.invalidDetails
        );
        expect(result).not.toBeDefined();
        Log.log(testName, invalidUpdateEmailTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message).toBe('Unauthorized to access that');
        Log.log(testName, invalidUpdateEmailTitle, error.details);
      }

      Log.it(testName, invalidUpdateEmailTitle, it6, false);
      done();
    });
  });

  const interUserFunctionsTitle = 'Inter-user functions';
  describe(interUserFunctionsTitle, () => {
    beforeEach(async (done) => {
      Log.beforeEach(testName, interUserFunctionsTitle, true);
      const uuid2 = Utils.newUuid();
      const details = {
        username: uuid2,
        password: uuid2,
        email: `${uuid2}@${uuid2}.com`,
      };

      this.testUser2 = await UserMiddleware.create(details);
      Log.beforeEach(testName, interUserFunctionsTitle, false);
      done();
    });

    afterEach(async (done) => {
      Log.afterEach(testName, interUserFunctionsTitle, true);
      await UserMiddleware.remove(this.testUser2, { username: this.testUser2.username });
      delete this.testUser2;
      Log.afterEach(testName, interUserFunctionsTitle, false);
      done();
    });

    const requestToFollowTitle = 'Request to follow user';
    describe(requestToFollowTitle, () => {
      const it1 = 'adds a follow request for the user';
      it(it1, async (done) => {
        Log.it(testName, requestToFollowTitle, it1, true);
        const details = { username: this.testUser.username };
        const requestedUser = { requestedUser: this.testUser2.username };
        const result = await UserMiddleware.requestToFollow(this.testUser, details, requestedUser);
        expect(result.success).toBeDefined();
        expect(result.success.message).toBeDefined();
        expect(typeof result.success.message).toBe('string');
        expect(result.success.message.toLowerCase()).toContain('follow request');
        expect(this.testUser.followRequests.includes(this.testUser2.username)).toBe(true);
        Log.log(testName, requestToFollowTitle, result);
        Log.it(testName, requestToFollowTitle, it1, false);
        done();
      });
    });

    const invalidRequestToFollowTitle = 'Invalid request to follow user';
    describe(invalidRequestToFollowTitle, () => {
      beforeEach(() => {
        Log.beforeEach(testName, invalidRequestToFollowTitle, true);
        this.invalidUsername = '%';
        Log.beforeEach(testName, invalidRequestToFollowTitle, false);
      });

      afterEach(() => {
        Log.afterEach(testName, invalidRequestToFollowTitle, true);
        delete this.invalidUsername;
        Log.afterEach(testName, invalidRequestToFollowTitle, false);
      });

      const it2 = 'throws an error for an invalid current user';
      it(it2, async (done) => {
        Log.it(testName, invalidRequestToFollowTitle, it2, true);
        const details = { username: this.testUser.username };
        const requestedUser = { requestedUser: this.testUser2.username };
        try {
          const result = await UserMiddleware.requestToFollow(null, details, requestedUser);
          expect(result).not.toBeDefined();
          Log.log(testName, invalidRequestToFollowTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.Server.type);
          expect(error.details.error.message).toBe(DroppError.type.Server.message);
          Log.log(testName, invalidRequestToFollowTitle, error.details);
        }

        Log.it(testName, invalidRequestToFollowTitle, it2, false);
        done();
      });

      const it3 = 'throws an error for an invalid username details argument';
      it(it3, async (done) => {
        Log.it(testName, invalidRequestToFollowTitle, it3, true);
        const requestedUser = { requestedUser: this.testUser2.username };
        try {
          const result = await UserMiddleware.requestToFollow(this.testUser, null, requestedUser);
          expect(result).not.toBeDefined();
          Log.log(testName, invalidRequestToFollowTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe('username');
          Log.log(testName, invalidRequestToFollowTitle, error.details);
        }

        Log.it(testName, invalidRequestToFollowTitle, it3, false);
        done();
      });

      const it4 = 'throws an error for an invalid requested user details argument';
      it(it4, async (done) => {
        Log.it(testName, invalidRequestToFollowTitle, it4, true);
        const details = { username: this.testUser.username };
        try {
          const result = await UserMiddleware.requestToFollow(this.testUser, details, null);
          expect(result).not.toBeDefined();
          Log.log(testName, invalidRequestToFollowTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe('requestedUser');
          Log.log(testName, invalidRequestToFollowTitle, error.details);
        }

        Log.it(testName, invalidRequestToFollowTitle, it4, false);
        done();
      });

      const it5 = 'throws an error for an invalid username';
      it(it5, async (done) => {
        Log.it(testName, invalidRequestToFollowTitle, it5, true);
        const details = { username: this.testUser.username };
        const requestedUser = { requestedUser: this.invalidUsername };
        try {
          const result = await UserMiddleware.requestToFollow(
            this.testUser,
            details,
            requestedUser
          );
          expect(result).not.toBeDefined();
          Log.log(testName, invalidRequestToFollowTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe('requestedUser');
          Log.log(testName, invalidRequestToFollowTitle, error.details);
        }

        Log.it(testName, invalidRequestToFollowTitle, it5, false);
        done();
      });

      const it6 = 'throws an error for a missing username';
      it(it6, async (done) => {
        Log.it(testName, invalidRequestToFollowTitle, it6, true);
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
          Log.log(testName, invalidRequestToFollowTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe('requestedUser');
          Log.log(testName, invalidRequestToFollowTitle, error.details);
        }

        Log.it(testName, invalidRequestToFollowTitle, it6, false);
        done();
      });

      const it7 = 'throws an error for accessing a different user\'s follow requests';
      it(it7, async (done) => {
        Log.it(testName, invalidRequestToFollowTitle, it7, true);
        const details = { username: this.testUser2.username };
        const requestedUser = { requestedUser: this.testUser2.username };
        try {
          const result = await UserMiddleware.requestToFollow(
            this.testUser,
            details,
            requestedUser
          );
          expect(result).not.toBeDefined();
          Log.log(testName, invalidRequestToFollowTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message).toBe('Unauthorized to access that');
          Log.log(testName, invalidRequestToFollowTitle, error.details);
        }

        Log.it(testName, invalidRequestToFollowTitle, it7, false);
        done();
      });

      const it8 = 'throws an error for requesting to follow the same user';
      it(it8, async (done) => {
        Log.it(testName, invalidRequestToFollowTitle, it8, true);
        const details = { username: this.testUser.username };
        const requestedUser = { requestedUser: this.testUser.username };
        try {
          const result = await UserMiddleware.requestToFollow(
            this.testUser,
            details,
            requestedUser
          );
          expect(result).not.toBeDefined();
          Log.log(testName, invalidRequestToFollowTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message).toBe('You cannot request to follow yourself');
          Log.log(testName, invalidRequestToFollowTitle, error.details);
        }

        Log.it(testName, invalidRequestToFollowTitle, it8, false);
        done();
      });

      const it9 = 'throws an error for a non-existent user';
      it(it9, async (done) => {
        Log.it(testName, invalidRequestToFollowTitle, it9, true);
        const details = { username: this.testUser.username };
        const requestedUser = { requestedUser: 'test' };
        try {
          const result = await UserMiddleware.requestToFollow(
            this.testUser,
            details,
            requestedUser
          );
          expect(result).not.toBeDefined();
          Log.log(testName, invalidRequestToFollowTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.ResourceDNE.type);
          expect(error.details.error.message).toBe('That user does not exist');
          Log.log(testName, invalidRequestToFollowTitle, error.details);
        }

        Log.it(testName, invalidRequestToFollowTitle, it9, false);
        done();
      });

      const it10 = 'throws an error for existing pending follow request';
      it(it10, async (done) => {
        Log.it(testName, invalidRequestToFollowTitle, it10, true);
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
          Log.log(testName, invalidRequestToFollowTitle, 'Should not have thrown error');
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
          Log.log(testName, invalidRequestToFollowTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message).toBe('You already have a pending follow request for that user');
          Log.log(testName, invalidRequestToFollowTitle, error.details);
        }

        // Clean up test case
        try {
          const result = await UserMiddleware.remove(testUser3, { username: testUser3.username });
          expect(result.success).toBeDefined();
        } catch (error) {
          expect(error).not.toBeDefined();
          Log.log(testName, invalidRequestToFollowTitle, 'Should not have thrown error');
        }

        Log.it(testName, invalidRequestToFollowTitle, it10, false);
        done();
      });
    });

    const removeFollowRequestTitle = 'Remove follow request';
    describe(removeFollowRequestTitle, () => {
      beforeEach(async (done) => {
        Log.beforeEach(testName, removeFollowRequestTitle, true);
        const details = { username: this.testUser.username };
        const requestedUser = { requestedUser: this.testUser2.username };
        await UserMiddleware.requestToFollow(this.testUser, details, requestedUser);
        Log.beforeEach(testName, removeFollowRequestTitle, false);
        done();
      });

      const it1 = 'removes a follow request to the user';
      it(it1, async (done) => {
        Log.it(testName, removeFollowRequestTitle, it1, true);
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
        Log.log(testName, removeFollowRequestTitle, result);
        Log.it(testName, removeFollowRequestTitle, it1, false);
        done();
      });
    });

    const invalidRemoveFollowRequestTitle = 'Invalid remove follow request';
    describe(invalidRemoveFollowRequestTitle, () => {
      beforeEach(() => {
        Log.beforeEach(testName, invalidRemoveFollowRequestTitle, true);
        this.invalidUsername = '%';
        Log.beforeEach(testName, invalidRemoveFollowRequestTitle, false);
      });

      afterEach(() => {
        Log.afterEach(testName, invalidRemoveFollowRequestTitle, true);
        delete this.invalidUsername;
        Log.afterEach(testName, invalidRemoveFollowRequestTitle, false);
      });

      const it2 = 'throws an error for an invalid current user';
      it(it2, async (done) => {
        Log.it(testName, invalidRemoveFollowRequestTitle, it2, true);
        const details = {
          username: this.testUser.username,
          requestedUser: this.testUser2.username,
        };

        try {
          const result = await UserMiddleware.removeFollowRequest(null, details);
          expect(result).not.toBeDefined();
          Log.log(testName, invalidRemoveFollowRequestTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.Server.type);
          expect(error.details.error.message).toBe(DroppError.type.Server.message);
          Log.log(testName, invalidRemoveFollowRequestTitle, error.details);
        }

        Log.it(testName, invalidRemoveFollowRequestTitle, it2, false);
        done();
      });

      const it3 = 'throws an error for an invalid username details argument';
      it(it3, async (done) => {
        Log.it(testName, invalidRemoveFollowRequestTitle, it3, true);
        try {
          const result = await UserMiddleware.removeFollowRequest(this.testUser, null);
          expect(result).not.toBeDefined();
          Log.log(testName, invalidRemoveFollowRequestTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe('username,requestedUser');
          Log.log(testName, invalidRemoveFollowRequestTitle, error.details);
        }

        Log.it(testName, invalidRemoveFollowRequestTitle, it3, false);
        done();
      });

      const it4 = 'throws an error for an invalid username';
      it(it4, async (done) => {
        Log.it(testName, invalidRemoveFollowRequestTitle, it4, true);
        const details = {
          username: this.invalidUsername,
          requestedUser: this.testUser2.username,
        };

        try {
          const result = await UserMiddleware.removeFollowRequest(this.testUser, details);
          expect(result).not.toBeDefined();
          Log.log(testName, invalidRemoveFollowRequestTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe('username');
          Log.log(testName, invalidRemoveFollowRequestTitle, error.details);
        }

        Log.it(testName, invalidRemoveFollowRequestTitle, it4, false);
        done();
      });

      const it5 = 'throws an error for an invalid requested username';
      it(it5, async (done) => {
        Log.it(testName, invalidRemoveFollowRequestTitle, it5, true);
        const details = {
          username: this.testUser.username,
          requestedUser: this.invalidUsername,
        };

        try {
          const result = await UserMiddleware.removeFollowRequest(this.testUser, details);
          expect(result).not.toBeDefined();
          Log.log(testName, invalidRemoveFollowRequestTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe('requestedUser');
          Log.log(testName, invalidRemoveFollowRequestTitle, error.details);
        }

        Log.it(testName, invalidRemoveFollowRequestTitle, it5, false);
        done();
      });

      const it6 = 'throws an error for a missing requested username';
      it(it6, async (done) => {
        Log.it(testName, invalidRemoveFollowRequestTitle, it6, true);
        const details = {
          requestedUser: undefined,
          username: this.testUser.username,
        };

        try {
          const result = await UserMiddleware.removeFollowRequest(this.testUser, details);
          expect(result).not.toBeDefined();
          Log.log(testName, invalidRemoveFollowRequestTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe('requestedUser');
          Log.log(testName, invalidRemoveFollowRequestTitle, error.details);
        }

        Log.it(testName, invalidRemoveFollowRequestTitle, it6, false);
        done();
      });

      const it7 = 'throws an error for accessing a different user\'s follow requests';
      it(it7, async (done) => {
        Log.it(testName, invalidRemoveFollowRequestTitle, it7, true);
        const details = {
          username: this.testUser2.username,
          requestedUser: this.testUser2.username,
        };

        try {
          const result = await UserMiddleware.removeFollowRequest(this.testUser, details);
          expect(result).not.toBeDefined();
          Log.log(testName, invalidRemoveFollowRequestTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message).toBe('Unauthorized to access that');
          Log.log(testName, invalidRemoveFollowRequestTitle, error.details);
        }

        Log.it(testName, invalidRemoveFollowRequestTitle, it7, false);
        done();
      });

      const it8 = 'throws an error for removing a follow request from the same user';
      it(it8, async (done) => {
        Log.it(testName, invalidRemoveFollowRequestTitle, it8, true);
        const details = {
          username: this.testUser.username,
          requestedUser: this.testUser.username,
        };

        try {
          const result = await UserMiddleware.removeFollowRequest(this.testUser, details);
          expect(result).not.toBeDefined();
          Log.log(testName, invalidRemoveFollowRequestTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message).toBe('You cannot remove a follow request from yourself');
          Log.log(testName, invalidRemoveFollowRequestTitle, error.details);
        }

        Log.it(testName, invalidRemoveFollowRequestTitle, it8, false);
        done();
      });

      const it9 = 'throws an error for a non-existent requested user';
      it(it9, async (done) => {
        Log.it(testName, invalidRemoveFollowRequestTitle, it9, true);
        const details = {
          requestedUser: Utils.newUuid(),
          username: this.testUser.username,
        };

        try {
          const result = await UserMiddleware.removeFollowRequest(this.testUser, details);
          expect(result).not.toBeDefined();
          Log.log(testName, invalidRemoveFollowRequestTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.ResourceDNE.type);
          expect(error.details.error.message).toBe('That user does not exist');
          Log.log(testName, invalidRemoveFollowRequestTitle, error.details);
        }

        Log.it(testName, invalidRemoveFollowRequestTitle, it9, false);
        done();
      });

      const it10 = 'throws an error for a non-existent follow request';
      it(it10, async (done) => {
        Log.it(testName, invalidRemoveFollowRequestTitle, it10, true);
        const details = {
          username: this.testUser.username,
          requestedUser: this.testUser2.username,
        };

        try {
          const result = await UserMiddleware.removeFollowRequest(this.testUser, details);
          expect(result).not.toBeDefined();
          Log.log(testName, invalidRemoveFollowRequestTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message).toBe('You do not have a pending follow request for that user');
          Log.log(testName, invalidRemoveFollowRequestTitle, error.details);
        }

        Log.it(testName, invalidRemoveFollowRequestTitle, it10, false);
        done();
      });
    });

    const respondToFollowerRequestTitle = 'Respond to follow request';
    describe(respondToFollowerRequestTitle, () => {
      beforeEach(async (done) => {
        Log.beforeEach(testName, respondToFollowerRequestTitle, true);
        const details = { username: this.testUser.username };
        const requestedUser = { requestedUser: this.testUser2.username };
        await UserMiddleware.requestToFollow(this.testUser, details, requestedUser);
        Log.beforeEach(testName, respondToFollowerRequestTitle, false);
        done();
      });

      const it1 = 'accepts a follower request';
      it(it1, async (done) => {
        Log.it(testName, respondToFollowerRequestTitle, it1, true);
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
        Log.log(testName, respondToFollowerRequestTitle, result);
        Log.it(testName, respondToFollowerRequestTitle, it1, false);
        done();
      });

      const it2 = 'declines a follower request';
      it(it2, async (done) => {
        Log.it(testName, respondToFollowerRequestTitle, it2, true);
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
        Log.log(testName, respondToFollowerRequestTitle, result);
        Log.it(testName, respondToFollowerRequestTitle, it2, false);
        done();
      });
    });

    const invalidRespondToFollowerRequestTitle = 'Invalid respond to follow request';
    describe(invalidRespondToFollowerRequestTitle, () => {
      beforeEach(() => {
        Log.beforeEach(testName, invalidRespondToFollowerRequestTitle, true);
        this.invalidUsername = 'test';
        this.invalidDetails = {
          accept: 'true',
        };

        Log.beforeEach(testName, invalidRespondToFollowerRequestTitle, false);
      });

      afterEach(() => {
        Log.afterEach(testName, invalidRespondToFollowerRequestTitle, true);
        delete this.invalidDetails;
        delete this.invalidUsername;
        Log.afterEach(testName, invalidRespondToFollowerRequestTitle, false);
      });

      const it3 = 'throws an error for an invalid current user';
      it(it3, async (done) => {
        Log.it(testName, invalidRespondToFollowerRequestTitle, it3, true);
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
          Log.log(testName, invalidRespondToFollowerRequestTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.Server.type);
          expect(error.details.error.message).toBe(DroppError.type.Server.message);
          Log.log(testName, invalidRespondToFollowerRequestTitle, error.details);
        }

        Log.it(testName, invalidRespondToFollowerRequestTitle, it3, false);
        done();
      });

      const it4 = 'throws an error for null username details';
      it(it4, async (done) => {
        Log.it(testName, invalidRespondToFollowerRequestTitle, it4, true);
        try {
          const result = await UserMiddleware.respondToFollowerRequest(
            this.testUser,
            null,
            this.invalidDetails
          );
          expect(result).not.toBeDefined();
          Log.log(testName, invalidRespondToFollowerRequestTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe('username,requestedUser');
          Log.log(testName, invalidRespondToFollowerRequestTitle, error.details);
        }

        Log.it(testName, invalidRespondToFollowerRequestTitle, it4, false);
        done();
      });

      const it5 = 'throws an error for null details';
      it(it5, async (done) => {
        Log.it(testName, invalidRespondToFollowerRequestTitle, it5, true);
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
          Log.log(testName, invalidRespondToFollowerRequestTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe('accept');
          Log.log(testName, invalidRespondToFollowerRequestTitle, error.details);
        }

        Log.it(testName, invalidRespondToFollowerRequestTitle, it5, false);
        done();
      });

      const it6 = 'throws an error for an invalid username';
      it(it6, async (done) => {
        Log.it(testName, invalidRespondToFollowerRequestTitle, it6, true);
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
          Log.log(testName, invalidRespondToFollowerRequestTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe('requestedUser');
          Log.log(testName, invalidRespondToFollowerRequestTitle, error.details);
        }

        Log.it(testName, invalidRespondToFollowerRequestTitle, it6, false);
        done();
      });

      const it7 = 'throws an error for an invalid accept parameter';
      it(it7, async (done) => {
        Log.it(testName, invalidRespondToFollowerRequestTitle, it7, true);
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
          Log.log(testName, invalidRespondToFollowerRequestTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe('accept');
          Log.log(testName, invalidRespondToFollowerRequestTitle, error.details);
        }

        Log.it(testName, invalidRespondToFollowerRequestTitle, it7, false);
        done();
      });

      const it8 = 'throws an error for an invalid username and accept parameter';
      it(it8, async (done) => {
        Log.it(testName, invalidRespondToFollowerRequestTitle, it8, true);
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
          Log.log(testName, invalidRespondToFollowerRequestTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe('requestedUser,accept');
          Log.log(testName, invalidRespondToFollowerRequestTitle, error.details);
        }

        Log.it(testName, invalidRespondToFollowerRequestTitle, it8, false);
        done();
      });

      const it9 = 'throws an error for accessing a different user\'s follow requests';
      it(it9, async (done) => {
        Log.it(testName, invalidRespondToFollowerRequestTitle, it9, true);
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
          Log.log(testName, invalidRespondToFollowerRequestTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message).toBe('Unauthorized to access that');
          Log.log(testName, invalidRespondToFollowerRequestTitle, error.details);
        }

        Log.it(testName, invalidRespondToFollowerRequestTitle, it9, false);
        done();
      });

      const it95 = 'throws an error for attempting to remove a follower request from the same user';
      it(it95, async (done) => {
        Log.it(testName, invalidRespondToFollowerRequestTitle, it95, true);
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
          Log.log(testName, invalidRespondToFollowerRequestTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message).toBe('You cannot respond to a follower request from yourself');
          Log.log(testName, invalidRespondToFollowerRequestTitle, error.details);
        }

        Log.it(testName, invalidRespondToFollowerRequestTitle, it95, false);
        done();
      });

      const it10 = 'throws an error for a non-existent user';
      it(it10, async (done) => {
        Log.it(testName, invalidRespondToFollowerRequestTitle, it10, true);
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
          Log.log(testName, invalidRespondToFollowerRequestTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.ResourceDNE.type);
          expect(error.details.error.message).toBe('That user does not exist');
          Log.log(testName, invalidRespondToFollowerRequestTitle, error.details);
        }

        Log.it(testName, invalidRespondToFollowerRequestTitle, it10, false);
        done();
      });

      const it11 = 'throws an error for a non-existent follower request';
      it(it11, async (done) => {
        Log.it(testName, invalidRespondToFollowerRequestTitle, it11, true);
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
          Log.log(testName, invalidRespondToFollowerRequestTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message).toBe('That user has not requested to follow you');
          Log.log(testName, invalidRespondToFollowerRequestTitle, error.details);
        }

        Log.it(testName, invalidRespondToFollowerRequestTitle, it11, false);
        done();
      });
    });

    const updateFollowFollowerTitle = 'Update follow/follower';
    describe(updateFollowFollowerTitle, () => {
      beforeEach(async (done) => {
        Log.beforeEach(testName, updateFollowFollowerTitle, true);
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
        Log.beforeEach(testName, updateFollowFollowerTitle, false);
        done();
      });

      const it1 = 'unfollows a user';
      it(it1, async (done) => {
        Log.it(testName, updateFollowFollowerTitle, it1, true);
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
        Log.log(testName, updateFollowFollowerTitle, result);
        Log.it(testName, updateFollowFollowerTitle, it1, false);
        done();
      });

      const it2 = 'removes a follower';
      it(it2, async (done) => {
        Log.it(testName, updateFollowFollowerTitle, it2, true);
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
        Log.log(testName, updateFollowFollowerTitle, result);
        Log.it(testName, updateFollowFollowerTitle, it2, false);
        done();
      });
    });

    const invalidUnfollowTitle = 'Invalid unfollow';
    describe(invalidUnfollowTitle, () => {
      beforeEach(() => {
        Log.beforeEach(testName, invalidUnfollowTitle, true);
        this.invalidUsername = '%';
        Log.beforeEach(testName, invalidUnfollowTitle, false);
      });

      afterEach(() => {
        Log.afterEach(testName, invalidUnfollowTitle, true);
        delete this.invalidUsername;
        Log.afterEach(testName, invalidUnfollowTitle, false);
      });

      const it1 = 'throws an error for an invalid current user';
      it(it1, async (done) => {
        Log.it(testName, invalidUnfollowTitle, it1, true);
        const usernameDetails = {
          follow: this.invalidUsername,
          username: this.testUser.username,
        };

        try {
          const result = await UserMiddleware.unfollow(null, usernameDetails);
          expect(result).not.toBeDefined();
          Log.log(testName, invalidUnfollowTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.Server.type);
          expect(error.details.error.message).toBe(DroppError.type.Server.message);
          Log.log(testName, invalidUnfollowTitle, error.details);
        }

        Log.it(testName, invalidUnfollowTitle, it1, false);
        done();
      });

      const it2 = 'throws an error for an invalid username details argument';
      it(it2, async (done) => {
        Log.it(testName, invalidUnfollowTitle, it2, true);
        try {
          const result = await UserMiddleware.unfollow(this.testUser, null);
          expect(result).not.toBeDefined();
          Log.log(testName, invalidUnfollowTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe('username,follow');
          Log.log(testName, invalidUnfollowTitle, error.details);
        }

        Log.it(testName, invalidUnfollowTitle, it2, false);
        done();
      });

      const it3 = 'throws an error for an invalid requested username';
      it(it3, async (done) => {
        Log.it(testName, invalidUnfollowTitle, it3, true);
        const usernameDetails = {
          follow: this.invalidUsername,
          username: this.testUser.username,
        };

        try {
          const result = await UserMiddleware.unfollow(this.testUser, usernameDetails);
          expect(result).not.toBeDefined();
          Log.log(testName, invalidUnfollowTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe('follow');
          Log.log(testName, invalidUnfollowTitle, error.details);
        }

        Log.it(testName, invalidUnfollowTitle, it3, false);
        done();
      });

      const it4 = 'throws an error for an invalid current username';
      it(it4, async (done) => {
        Log.it(testName, invalidUnfollowTitle, it4, true);
        const usernameDetails = {
          username: this.invalidUsername,
          follow: this.testUser2.username,
        };

        try {
          const result = await UserMiddleware.unfollow(this.testUser, usernameDetails);
          expect(result).not.toBeDefined();
          Log.log(testName, invalidUnfollowTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe('username');
          Log.log(testName, invalidUnfollowTitle, error.details);
        }

        Log.it(testName, invalidUnfollowTitle, it4, false);
        done();
      });

      const it5 = 'throws an error for accessing a different user\'s follows';
      it(it5, async (done) => {
        Log.it(testName, invalidUnfollowTitle, it5, true);
        const usernameDetails = {
          follow: this.testUser2.username,
          username: this.testUser2.username,
        };

        try {
          const result = await UserMiddleware.unfollow(this.testUser, usernameDetails);
          expect(result).not.toBeDefined();
          Log.log(testName, invalidUnfollowTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message)
            .toBe(Constants.middleware.messages.unauthorizedAccess);
          Log.log(testName, invalidUnfollowTitle, error.details);
        }

        Log.it(testName, invalidUnfollowTitle, it5, false);
        done();
      });

      const it6 = 'throws an error for attempting to unfollow the same user';
      it(it6, async (done) => {
        Log.it(testName, invalidUnfollowTitle, it6, true);
        const usernameDetails = {
          follow: this.testUser.username,
          username: this.testUser.username,
        };

        try {
          const result = await UserMiddleware.unfollow(this.testUser, usernameDetails);
          expect(result).not.toBeDefined();
          Log.log(testName, invalidUnfollowTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message).toBe('You cannot unfollow yourself');
          Log.log(testName, invalidUnfollowTitle, error.details);
        }

        Log.it(testName, invalidUnfollowTitle, it6, false);
        done();
      });

      const it7 = 'throws an error for a non-existent user';
      it(it7, async (done) => {
        Log.it(testName, invalidUnfollowTitle, it7, true);
        const usernameDetails = {
          follow: Utils.newUuid(),
          username: this.testUser.username,
        };

        try {
          const result = await UserMiddleware.unfollow(this.testUser, usernameDetails);
          expect(result).not.toBeDefined();
          Log.log(testName, invalidUnfollowTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.ResourceDNE.type);
          expect(error.details.error.message).toBe('That user does not exist');
          Log.log(testName, invalidUnfollowTitle, error.details);
        }

        Log.it(testName, invalidUnfollowTitle, it7, false);
        done();
      });

      const it8 = 'throws an error for a non-existent follow';
      it(it8, async (done) => {
        Log.it(testName, invalidUnfollowTitle, it8, true);
        const usernameDetails = {
          follow: this.testUser2.username,
          username: this.testUser.username,
        };

        try {
          const result = await UserMiddleware.unfollow(this.testUser, usernameDetails);
          expect(result).not.toBeDefined();
          Log.log(testName, invalidUnfollowTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message).toBe('You do not follow that user');
          Log.log(testName, invalidUnfollowTitle, error.details);
        }

        Log.it(testName, invalidUnfollowTitle, it8, false);
        done();
      });
    });

    const invalidRemoveFollowerTitle = 'Invalid remove follower';
    describe(invalidRemoveFollowerTitle, () => {
      beforeEach(() => {
        Log.beforeEach(testName, invalidRemoveFollowerTitle, true);
        this.invalidUsername = '%';
        Log.beforeEach(testName, invalidRemoveFollowerTitle, false);
      });

      afterEach(() => {
        Log.afterEach(testName, invalidRemoveFollowerTitle, true);
        delete this.invalidUsername;
        Log.afterEach(testName, invalidRemoveFollowerTitle, false);
      });

      const it1 = 'throws an error for an invalid current user';
      it(it1, async (done) => {
        Log.it(testName, invalidRemoveFollowerTitle, it1, true);
        const usernameDetails = {
          username: this.testUser.username,
          follower: this.testUser2.username,
        };

        try {
          const result = await UserMiddleware.removeFollower(null, usernameDetails);
          expect(result).not.toBeDefined();
          Log.log(testName, invalidRemoveFollowerTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.Server.type);
          expect(error.details.error.message).toBe(DroppError.type.Server.message);
          Log.log(testName, invalidRemoveFollowerTitle, error.details);
        }

        Log.it(testName, invalidRemoveFollowerTitle, it1, false);
        done();
      });

      const it2 = 'throws an error for an invalid username details argument';
      it(it2, async (done) => {
        Log.it(testName, invalidRemoveFollowerTitle, it2, true);
        try {
          const result = await UserMiddleware.removeFollower(this.testUser, null);
          expect(result).not.toBeDefined();
          Log.log(testName, invalidRemoveFollowerTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe('username,follower');
          Log.log(testName, invalidRemoveFollowerTitle, error.details);
        }

        Log.it(testName, invalidRemoveFollowerTitle, it2, false);
        done();
      });

      const it3 = 'throws an error for accessing a different user\'s followers';
      it(it3, async (done) => {
        Log.it(testName, invalidRemoveFollowerTitle, it3, true);
        const usernameDetails = {
          follower: this.testUser2.username,
          username: this.testUser2.username,
        };

        try {
          const result = await UserMiddleware.removeFollower(this.testUser, usernameDetails);
          expect(result).not.toBeDefined();
          Log.log(testName, invalidRemoveFollowerTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message).toBe('Unauthorized to access that');
          Log.log(testName, invalidRemoveFollowerTitle, error.details);
        }

        Log.it(testName, invalidRemoveFollowerTitle, it3, false);
        done();
      });

      const it4 = 'throws an error for attempting to remove the same follower';
      it(it4, async (done) => {
        Log.it(testName, invalidRemoveFollowerTitle, it4, true);
        const usernameDetails = {
          follower: this.testUser.username,
          username: this.testUser.username,
        };

        try {
          const result = await UserMiddleware.removeFollower(this.testUser, usernameDetails);
          expect(result).not.toBeDefined();
          Log.log(testName, invalidRemoveFollowerTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message).toBe('You cannot remove yourself as a follower');
          Log.log(testName, invalidRemoveFollowerTitle, error.details);
        }

        Log.it(testName, invalidRemoveFollowerTitle, it4, false);
        done();
      });

      const it5 = 'throws an error for a non-existent user';
      it(it5, async (done) => {
        Log.it(testName, invalidRemoveFollowerTitle, it5, true);
        const usernameDetails = {
          follower: Utils.newUuid(),
          username: this.testUser.username,
        };

        try {
          const result = await UserMiddleware.removeFollower(this.testUser, usernameDetails);
          expect(result).not.toBeDefined();
          Log.log(testName, invalidRemoveFollowerTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.ResourceDNE.type);
          expect(error.details.error.message).toBe('That user does not exist');
          Log.log(testName, invalidRemoveFollowerTitle, error.details);
        }

        Log.it(testName, invalidRemoveFollowerTitle, it5, false);
        done();
      });

      const it6 = 'throws an error for a non-existent follower';
      it(it6, async (done) => {
        Log.it(testName, invalidRemoveFollowerTitle, it6, true);
        const usernameDetails = {
          username: this.testUser.username,
          follower: this.testUser2.username,
        };

        try {
          const result = await UserMiddleware.removeFollower(this.testUser, usernameDetails);
          expect(result).not.toBeDefined();
          Log.log(testName, invalidRemoveFollowerTitle, 'Should have thrown error');
        } catch (error) {
          expect(error.name).toBe('DroppError');
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message).toBe('That user does not follow you');
          Log.log(testName, invalidRemoveFollowerTitle, error.details);
        }

        Log.it(testName, invalidRemoveFollowerTitle, it6, false);
        done();
      });
    });
  });

  const removeUserTitle = 'Remove user';
  describe(removeUserTitle, () => {
    beforeEach(async (done) => {
      Log.beforeEach(testName, removeUserTitle, true);
      this.dropp = new Dropp({
        text: 'test',
        media: 'false',
        username: this.newUser.username,
        timestamp: 1,
        location: new Location({
          latitude: 0,
          longitude: 0,
        }),
      });

      await DroppAccessor.add(this.dropp);
      Log.beforeEach(testName, removeUserTitle, false);
      done();
    });

    afterEach(async (done) => {
      Log.afterEach(testName, removeUserTitle, true);
      if (Utils.hasValue(this.dropp)) await DroppAccessor.remove(this.dropp);
      Log.afterEach(testName, removeUserTitle, false);
      done();
    });

    const it1 = 'removes a user';
    it(it1, async (done) => {
      Log.it(testName, removeUserTitle, it1, true);
      const result = await UserMiddleware.remove(this.newUser, { username: this.newUser.username });
      expect(result.success.message).toBe('Successfully removed all user data');
      this.dropp = await DroppAccessor.get(this.dropp.id);
      expect(this.dropp).toBeNull();
      try {
        const user = await UserMiddleware.get(this.testUser, { username: this.newUser.username });
        expect(user).not.toBeDefined();
        Log.log(testName, removeUserTitle, `Was able to fetch ${user.username} after removing them`);
      } catch (retrieveUserError) {
        expect(retrieveUserError.name).toBe('DroppError');
        expect(retrieveUserError.statusCode).toBe(DroppError.type.ResourceDNE.status);
        Log.log(testName, removeUserTitle, retrieveUserError);
      }

      Log.it(testName, removeUserTitle, it1, false);
      done();
    });
  });

  const invalidRemoveTitle = 'Invalid remove user';
  describe(invalidRemoveTitle, () => {
    beforeEach(() => {
      Log.beforeEach(testName, invalidRemoveTitle, true);
      this.invalidUsername = '%';
      Log.beforeEach(testName, invalidRemoveTitle, false);
    });

    afterEach(() => {
      Log.afterEach(testName, invalidRemoveTitle, true);
      delete this.invalidUsername;
      Log.afterEach(testName, invalidRemoveTitle, false);
    });

    const it1 = 'throws an error for an invalid current user';
    it(it1, async (done) => {
      Log.it(testName, invalidRemoveTitle, it1, true);
      try {
        const result = await UserMiddleware.remove(null, { username: this.invalidUsername });
        expect(result).not.toBeDefined();
        Log.log(testName, invalidRemoveTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(testName, invalidRemoveTitle, error.details);
      }

      Log.it(testName, invalidRemoveTitle, it1, false);
      done();
    });

    const it2 = 'throws an error for invalid username details';
    it(it2, async (done) => {
      Log.it(testName, invalidRemoveTitle, it2, true);
      try {
        const result = await UserMiddleware.remove(this.testUser, null);
        expect(result).not.toBeDefined();
        Log.log(testName, invalidRemoveTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('username');
        Log.log(testName, invalidRemoveTitle, error.details);
      }

      Log.it(testName, invalidRemoveTitle, it2, false);
      done();
    });

    const it3 = 'throws an error for an invalid username';
    it(it3, async (done) => {
      Log.it(testName, invalidRemoveTitle, it3, true);
      const details = { username: this.invalidUsername };
      try {
        const result = await UserMiddleware.remove(this.testUser, details);
        expect(result).not.toBeDefined();
        Log.log(testName, invalidRemoveTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('username');
        Log.log(testName, invalidRemoveTitle, error.details);
      }

      Log.it(testName, invalidRemoveTitle, it3, false);
      done();
    });

    const it4 = 'throws an error for a missing username';
    it(it4, async (done) => {
      Log.it(testName, invalidRemoveTitle, it4, true);
      delete this.invalidUsername;
      const details = { username: this.invalidUsername };
      try {
        const result = await UserMiddleware.remove(this.testUser, details);
        expect(result).not.toBeDefined();
        Log.log(testName, invalidRemoveTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('username');
        Log.log(testName, invalidRemoveTitle, error.details);
      }

      Log.it(testName, invalidRemoveTitle, it4, false);
      done();
    });

    const it5 = 'throws an error for a different user';
    it(it5, async (done) => {
      Log.it(testName, invalidRemoveTitle, it5, true);
      try {
        const result = await UserMiddleware.remove(this.testUser, { username: 'test' });
        expect(result).not.toBeDefined();
        Log.log(testName, invalidRemoveTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message).toBe('Unauthorized to access that');
        Log.log(testName, invalidRemoveTitle, error.details);
      }

      Log.it(testName, invalidRemoveTitle, it5, false);
      done();
    });

    const it6 = 'throws an error for a non-existent user';
    it(it6, async (done) => {
      Log.it(testName, invalidRemoveTitle, it6, true);
      const user = new User({
        username: 'test',
        email: 'test@test.com',
      });

      try {
        const result = await UserMiddleware.remove(user, { username: user.username });
        expect(result).not.toBeDefined();
        Log.log(testName, invalidRemoveTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(testName, invalidRemoveTitle, error.details);
      }

      Log.it(testName, invalidRemoveTitle, it6, false);
      done();
    });
  });
});

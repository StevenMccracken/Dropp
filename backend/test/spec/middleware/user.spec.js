const Log = require('../../logger');
const User = require('../../../src/models/User');
const TestConstants = require('../../constants');
const Dropp = require('../../../src/models/Dropp');
const Utils = require('../../../src/utilities/utils');
const Firebase = require('../../../src/firebase/firebase');
const UserAccessor = require('../../../src/database/user');
const DroppError = require('../../../src/errors/DroppError');
const CloudStorage = require('../../../src/storage/storage');
const DroppAccessor = require('../../../src/database/dropp');
const Constants = require('../../../src/utilities/constants');
const UserMiddleware = require('../../../src/middleware/user');
const StorageError = require('../../../src/errors/StorageError');
const DroppMiddleware = require('../../../src/middleware/dropp');

CloudStorage.initializeBucket();
Firebase.start(process.env.MOCK === '1');
/* eslint-disable no-undef */
describe(TestConstants.middleware.user.testName, () => {
  this.testUserData = {
    username: Utils.newUuid(),
    password: Utils.newUuid(),
    email: TestConstants.params.uuidEmail(),
  };

  beforeEach(async (done) => {
    Log.beforeEach(
      TestConstants.middleware.user.testName,
      TestConstants.middleware.user.testName,
      true
    );
    this.testUser = await UserMiddleware.create(this.testUserData);
    this.testUserDetails = { username: this.testUser.username };
    Log.beforeEach(
      TestConstants.middleware.user.testName,
      TestConstants.middleware.user.testName,
      false
    );
    done();
  });

  afterEach(async (done) => {
    Log.afterEach(
      TestConstants.middleware.user.testName,
      TestConstants.middleware.user.testName,
      true
    );
    await UserMiddleware.remove(this.testUser, { username: this.testUser.username });
    delete this.testUser;
    delete this.testUserDetails;
    Log.afterEach(
      TestConstants.middleware.user.testName,
      TestConstants.middleware.user.testName,
      false
    );
    done();
  });

  this.uuid2 = Utils.newUuid();
  const createUserTitle = 'Create user';
  describe(createUserTitle, () => {
    this.testUserData2 = {
      username: this.uuid2,
      password: Utils.newUuid(),
      email: TestConstants.params.uuidEmail(),
    };

    const it1 = 'creates a user';
    it(it1, async (done) => {
      Log.it(TestConstants.middleware.user.testName, createUserTitle, it1, true);
      this.newUser = await UserMiddleware.create(this.testUserData2);
      expect(this.newUser).toBeDefined();
      expect(this.newUser.email).toBe(this.testUserData2.email);
      expect(this.newUser.username).toBe(this.testUserData2.username);
      expect(this.newUser.password).not.toBe(this.testUserData2.password);
      Log.log(TestConstants.middleware.user.testName, createUserTitle, this.newUser);
      Log.it(TestConstants.middleware.user.testName, createUserTitle, it1, false);
      done();
    });

    const invalidCreateUserTitle = 'Invalid details';
    describe(invalidCreateUserTitle, () => {
      beforeEach(() => {
        Log.beforeEach(TestConstants.middleware.user.testName, invalidCreateUserTitle, true);
        this.invalidUserDetails = {
          username: Utils.newUuid(),
          password: Utils.newUuid(),
          email: TestConstants.params.uuidEmail(),
        };

        Log.beforeEach(TestConstants.middleware.user.testName, invalidCreateUserTitle, false);
      });

      afterEach(() => {
        Log.afterEach(TestConstants.middleware.user.testName, invalidCreateUserTitle, true);
        delete this.invalidUserDetails;
        Log.afterEach(TestConstants.middleware.user.testName, invalidCreateUserTitle, false);
      });

      const it2 = 'throws an error for null user details';
      it(it2, async (done) => {
        Log.it(TestConstants.middleware.user.testName, createUserTitle, it2, true);
        try {
          const result = await UserMiddleware.create(null);
          expect(result).not.toBeDefined();
          Log.log(
            TestConstants.middleware.user.testName,
            invalidCreateUserTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          const params = [
            Constants.params.email,
            Constants.params.username,
            Constants.params.password,
          ];

          expect(error.details.error.message).toBe(params.join());
          Log.log(TestConstants.middleware.user.testName, invalidCreateUserTitle, error.details);
        }

        Log.it(TestConstants.middleware.user.testName, createUserTitle, it2, false);
        done();
      });

      const it3 = 'throws an error for missing username';
      it(it3, async (done) => {
        Log.it(TestConstants.middleware.user.testName, createUserTitle, it3, true);
        try {
          delete this.invalidUserDetails.username;
          const result = await UserMiddleware.create(this.invalidUserDetails);
          expect(result).not.toBeDefined();
          Log.log(
            TestConstants.middleware.user.testName,
            invalidCreateUserTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe(Constants.params.username);
          Log.log(TestConstants.middleware.user.testName, invalidCreateUserTitle, error.details);
        }

        Log.it(TestConstants.middleware.user.testName, createUserTitle, it3, false);
        done();
      });

      const it4 = 'throws an error for missing password';
      it(it4, async (done) => {
        Log.it(TestConstants.middleware.user.testName, invalidCreateUserTitle, it4, true);
        try {
          delete this.invalidUserDetails.password;
          const result = await UserMiddleware.create(this.invalidUserDetails);
          expect(result).not.toBeDefined();
          Log.log(
            TestConstants.middleware.user.testName,
            invalidCreateUserTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe(Constants.params.password);
          Log.log(TestConstants.middleware.user.testName, invalidCreateUserTitle, error.details);
        }

        Log.it(TestConstants.middleware.user.testName, invalidCreateUserTitle, it4, false);
        done();
      });

      const it5 = 'throws an error for missing email';
      it(it5, async (done) => {
        Log.it(TestConstants.middleware.user.testName, invalidCreateUserTitle, it5, true);
        try {
          delete this.invalidUserDetails.email;
          const result = await UserMiddleware.create(this.invalidUserDetails);
          expect(result).not.toBeDefined();
          Log.log(
            TestConstants.middleware.user.testName,
            invalidCreateUserTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe(Constants.params.email);
          Log.log(TestConstants.middleware.user.testName, invalidCreateUserTitle, error.details);
        }

        Log.it(TestConstants.middleware.user.testName, invalidCreateUserTitle, it5, false);
        done();
      });

      const it6 = 'throws an error for 2 missing details';
      it(it6, async (done) => {
        Log.it(TestConstants.middleware.user.testName, invalidCreateUserTitle, it6, true);
        try {
          delete this.invalidUserDetails.username;
          delete this.invalidUserDetails.password;
          const result = await UserMiddleware.create(this.invalidUserDetails);
          expect(result).not.toBeDefined();
          Log.log(
            TestConstants.middleware.user.testName,
            invalidCreateUserTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message)
            .toBe(`${Constants.params.username},${Constants.params.password}`);
          Log.log(TestConstants.middleware.user.testName, invalidCreateUserTitle, error.details);
        }

        Log.it(TestConstants.middleware.user.testName, invalidCreateUserTitle, it6, false);
        done();
      });

      const it7 = 'throws an error for 3 missing details';
      it(it7, async (done) => {
        Log.it(TestConstants.middleware.user.testName, invalidCreateUserTitle, it7, true);
        try {
          delete this.invalidUserDetails.email;
          delete this.invalidUserDetails.username;
          delete this.invalidUserDetails.password;
          const result = await UserMiddleware.create(this.invalidUserDetails);
          expect(result).not.toBeDefined();
          Log.log(
            TestConstants.middleware.user.testName,
            invalidCreateUserTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          const params = [
            Constants.params.email,
            Constants.params.username,
            Constants.params.password,
          ];

          expect(error.details.error.message).toBe(params.join());
          Log.log(TestConstants.middleware.user.testName, invalidCreateUserTitle, error.details);
        }

        Log.it(TestConstants.middleware.user.testName, invalidCreateUserTitle, it7, false);
        done();
      });

      const it8 = 'throws an error for already existing username';
      it(it8, async (done) => {
        Log.it(TestConstants.middleware.user.testName, invalidCreateUserTitle, it8, true);
        try {
          this.invalidUserDetails.username = this.testUserData.username;
          const result = await UserMiddleware.create(this.invalidUserDetails);
          expect(result).not.toBeDefined();
          Log.log(
            TestConstants.middleware.user.testName,
            invalidCreateUserTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message)
            .toBe(Constants.middleware.user.messages.errors.usernameAlreadyExists);
          Log.log(TestConstants.middleware.user.testName, invalidCreateUserTitle, error.details);
        }

        Log.it(TestConstants.middleware.user.testName, invalidCreateUserTitle, it8, false);
        done();
      });
    });
  });

  const getSameUserTitle = 'Get same user';
  describe(getSameUserTitle, () => {
    const details = { username: this.uuid2 };
    const it1 = 'retrieves a user\'s private details';
    it(it1, async (done) => {
      Log.it(TestConstants.middleware.user.testName, getSameUserTitle, it1, true);
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
      Log.log(TestConstants.middleware.user.testName, getSameUserTitle, user);
      Log.it(TestConstants.middleware.user.testName, getSameUserTitle, it1, false);
      done();
    });
  });

  const getDifferentUserTitle = 'Get different user';
  describe(getDifferentUserTitle, () => {
    const details = { username: this.uuid2 };
    const it1 = 'retrieves a user\'s public details';
    it(it1, async (done) => {
      Log.it(TestConstants.middleware.user.testName, getSameUserTitle, it1, true);
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
      Log.log(TestConstants.middleware.user.testName, getDifferentUserTitle, user);
      Log.it(TestConstants.middleware.user.testName, getSameUserTitle, it1, false);
      done();
    });
  });

  const invalidGetUserTitle = 'Invalid get user';
  describe(invalidGetUserTitle, () => {
    beforeEach(() => {
      Log.beforeEach(TestConstants.middleware.user.testName, invalidGetUserTitle, true);
      this.invalidDetails = { username: TestConstants.params.invalidChars.username };
      Log.beforeEach(TestConstants.middleware.user.testName, invalidGetUserTitle, false);
    });

    afterEach(() => {
      Log.afterEach(TestConstants.middleware.user.testName, invalidGetUserTitle, true);
      delete this.invalidDetails;
      Log.afterEach(TestConstants.middleware.user.testName, invalidGetUserTitle, false);
    });

    const it1 = 'throws an error for an invalid current user';
    it(it1, async (done) => {
      Log.it(TestConstants.middleware.user.testName, createUserTitle, it1, true);
      try {
        const result = await UserMiddleware.get(null, this.invalidDetails);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.user.testName,
          invalidGetUserTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(TestConstants.middleware.user.testName, invalidGetUserTitle, error.details);
      }

      Log.it(TestConstants.middleware.user.testName, createUserTitle, it1, false);
      done();
    });

    const it2 = 'throws an error for null details';
    it(it2, async (done) => {
      Log.it(TestConstants.middleware.user.testName, invalidGetUserTitle, it2, true);
      try {
        const result = await UserMiddleware.get(this.testUser, null);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.user.testName,
          invalidGetUserTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe(Constants.params.username);
        Log.log(TestConstants.middleware.user.testName, invalidGetUserTitle, error.details);
      }

      Log.it(TestConstants.middleware.user.testName, invalidGetUserTitle, it2, false);
      done();
    });

    const it3 = 'throws an error for an invalid username';
    it(it3, async (done) => {
      Log.it(TestConstants.middleware.user.testName, invalidGetUserTitle, it3, true);
      try {
        const result = await UserMiddleware.get(this.testUser, this.invalidDetails);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.user.testName,
          invalidGetUserTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe(Constants.params.username);
        Log.log(TestConstants.middleware.user.testName, invalidGetUserTitle, error.details);
      }

      Log.it(TestConstants.middleware.user.testName, invalidGetUserTitle, it3, false);
      done();
    });

    const it4 = 'throws an error for a missing username';
    it(it4, async (done) => {
      Log.it(TestConstants.middleware.user.testName, invalidGetUserTitle, it4, true);
      delete this.invalidDetails.username;
      try {
        const result = await UserMiddleware.get(this.testUser, this.invalidDetails);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.user.testName,
          invalidGetUserTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe(Constants.params.username);
        Log.log(TestConstants.middleware.user.testName, invalidGetUserTitle, error.details);
      }

      Log.it(TestConstants.middleware.user.testName, invalidGetUserTitle, it4, false);
      done();
    });

    const it5 = 'throws an error for a non-existent user';
    it(it5, async (done) => {
      Log.it(TestConstants.middleware.user.testName, invalidGetUserTitle, it5, true);
      this.invalidDetails.username = Utils.newUuid();
      try {
        const result = await UserMiddleware.get(this.testUser, this.invalidDetails);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.user.testName,
          invalidGetUserTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.ResourceDNE.type);
        expect(error.details.error.message)
          .toBe(TestConstants.messages.doesNotExist(Constants.params.user));
        Log.log(TestConstants.middleware.user.testName, invalidGetUserTitle, error.details);
      }

      Log.it(TestConstants.middleware.user.testName, invalidGetUserTitle, it5, false);
      done();
    });
  });

  const addNewUserTitle = 'Add new user';
  describe(addNewUserTitle, () => {
    const details = {
      username: Utils.newUuid(),
      password: Utils.newUuid(),
      email: TestConstants.params.uuidEmail(),
    };

    afterEach(async (done) => {
      Log.afterEach(TestConstants.middleware.user.testName, addNewUserTitle, true);
      const user = await UserAccessor.get(details.username);
      await UserMiddleware.remove(user, { username: details.username });
      Log.afterEach(TestConstants.middleware.user.testName, addNewUserTitle, false);
      done();
    });

    const it1 = 'adds a new user';
    it(it1, async (done) => {
      Log.it(TestConstants.middleware.user.testName, addNewUserTitle, it1, true);
      const result = await UserMiddleware.addNewUser(details);
      expect(result.success).toBeDefined();
      expect(result.success.token).toBeDefined();
      expect(typeof result.success.token).toBe('string');
      expect(result.success.token).toContain(Constants.passport.Bearer);
      Log.log(TestConstants.middleware.user.testName, addNewUserTitle, result);
      Log.it(TestConstants.middleware.user.testName, addNewUserTitle, it1, false);
      done();
    });
  });

  const getAuthTokenTitle = 'Get authentication token';
  describe(getAuthTokenTitle, () => {
    const it1 = 'gets an authentication token';
    it(it1, async (done) => {
      Log.it(TestConstants.middleware.user.testName, getAuthTokenTitle, it1, true);
      const details = {
        username: this.testUser.username,
        password: this.testUserData.password,
      };

      const result = await UserMiddleware.getAuthToken(details);
      expect(result.success).toBeDefined();
      expect(result.success.token).toBeDefined();
      expect(typeof result.success.token).toBe('string');
      expect(result.success.token).toContain(Constants.passport.Bearer);
      Log.log(TestConstants.middleware.user.testName, getAuthTokenTitle, result);
      Log.it(TestConstants.middleware.user.testName, getAuthTokenTitle, it1, false);
      done();
    });
  });

  const invalidGetAuthTokenTitle = 'Invalid get authentication token';
  describe(invalidGetAuthTokenTitle, () => {
    beforeEach(() => {
      Log.beforeEach(TestConstants.middleware.user.testName, invalidGetAuthTokenTitle, true);
      this.invalidDetails = {
        username: Utils.newUuid(),
        password: Utils.newUuid(),
      };

      Log.beforeEach(TestConstants.middleware.user.testName, invalidGetAuthTokenTitle, false);
    });

    afterEach(() => {
      Log.afterEach(TestConstants.middleware.user.testName, invalidGetAuthTokenTitle, true);
      delete this.invalidDetails;
      Log.afterEach(TestConstants.middleware.user.testName, invalidGetAuthTokenTitle, false);
    });

    const it1 = 'throws an error for null details';
    it(it1, async (done) => {
      Log.it(TestConstants.middleware.user.testName, invalidGetAuthTokenTitle, it1, true);
      try {
        const result = await UserMiddleware.getAuthToken(null);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.user.testName,
          invalidGetAuthTokenTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message)
          .toBe(`${Constants.params.username},${Constants.params.password}`);
        Log.log(TestConstants.middleware.user.testName, invalidGetAuthTokenTitle, error.details);
      }

      Log.it(TestConstants.middleware.user.testName, invalidGetAuthTokenTitle, it1, false);
      done();
    });

    const it2 = 'throws an error for an invalid username and password';
    it(it2, async (done) => {
      Log.it(TestConstants.middleware.user.testName, invalidGetAuthTokenTitle, it2, true);
      this.invalidDetails.username = TestConstants.params.invalidChars.username;
      this.invalidDetails.password = TestConstants.params.invalidChars.password;
      try {
        const result = await UserMiddleware.getAuthToken(this.invalidDetails);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.user.testName,
          invalidGetAuthTokenTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message)
          .toBe(`${Constants.params.username},${Constants.params.password}`);
        Log.log(TestConstants.middleware.user.testName, invalidGetAuthTokenTitle, error.details);
      }

      Log.it(TestConstants.middleware.user.testName, invalidGetAuthTokenTitle, it2, false);
      done();
    });

    const it3 = 'throws an error for a missing username';
    it(it3, async (done) => {
      Log.it(TestConstants.middleware.user.testName, invalidGetAuthTokenTitle, it3, true);
      delete this.invalidDetails.username;
      try {
        const result = await UserMiddleware.getAuthToken(this.invalidDetails);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.user.testName,
          invalidGetAuthTokenTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe(Constants.params.username);
        Log.log(TestConstants.middleware.user.testName, invalidGetAuthTokenTitle, error.details);
      }

      Log.it(TestConstants.middleware.user.testName, invalidGetAuthTokenTitle, it3, false);
      done();
    });

    const it4 = 'throws an error for a missing password';
    it(it4, async (done) => {
      Log.it(TestConstants.middleware.user.testName, invalidGetAuthTokenTitle, it4, true);
      delete this.invalidDetails.password;
      try {
        const result = await UserMiddleware.getAuthToken(this.invalidDetails);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.user.testName,
          invalidGetAuthTokenTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe(Constants.params.password);
        Log.log(TestConstants.middleware.user.testName, invalidGetAuthTokenTitle, error.details);
      }

      Log.it(TestConstants.middleware.user.testName, invalidGetAuthTokenTitle, it4, false);
      done();
    });

    const it5 = 'throws an error for a non-existent user';
    it(it5, async (done) => {
      Log.it(TestConstants.middleware.user.testName, invalidGetAuthTokenTitle, it5, true);
      try {
        const result = await UserMiddleware.getAuthToken(this.invalidDetails);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.user.testName,
          invalidGetAuthTokenTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.Login.type);
        expect(error.details.error.message).toBe(DroppError.type.Login.message);
        Log.log(TestConstants.middleware.user.testName, invalidGetAuthTokenTitle, error.details);
      }

      Log.it(TestConstants.middleware.user.testName, invalidGetAuthTokenTitle, it5, false);
      done();
    });

    const it6 = 'throws an error for an incorrect password';
    it(it6, async (done) => {
      Log.it(TestConstants.middleware.user.testName, invalidGetAuthTokenTitle, it6, true);
      this.invalidDetails.username = this.testUser.username;
      try {
        const result = await UserMiddleware.getAuthToken(this.invalidDetails);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.user.testName,
          invalidGetAuthTokenTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.Login.type);
        expect(error.details.error.message).toBe(DroppError.type.Login.message);
        Log.log(TestConstants.middleware.user.testName, invalidGetAuthTokenTitle, error.details);
      }

      Log.it(TestConstants.middleware.user.testName, invalidGetAuthTokenTitle, it6, false);
      done();
    });
  });

  const updatePasswordTitle = 'Update password';
  describe(updatePasswordTitle, () => {
    const it1 = 'updates the user\'s password';
    it(it1, async (done) => {
      Log.it(TestConstants.middleware.user.testName, updatePasswordTitle, it1, true);
      const details = {
        oldPassword: this.testUserData.password,
        newPassword: TestConstants.params.test2,
      };

      const result = await UserMiddleware.updatePassword(
        this.testUser,
        this.testUserDetails,
        details
      );
      expect(result.success).toBeDefined();
      expect(result.success.token).toBeDefined();
      expect(typeof result.success.token).toBe('string');
      expect(result.success.token).toContain(Constants.passport.Bearer);
      Log.log(TestConstants.middleware.user.testName, updatePasswordTitle, result);
      Log.it(TestConstants.middleware.user.testName, updatePasswordTitle, it1, false);
      done();
    });
  });

  const invalidUpdatePasswordTitle = 'Invalid update password';
  describe(invalidUpdatePasswordTitle, () => {
    beforeEach(() => {
      Log.beforeEach(TestConstants.middleware.user.testName, invalidUpdatePasswordTitle, true);
      this.invalidDetails = {
        oldPassword: this.testUserData.password,
        newPassword: Utils.newUuid(),
      };

      Log.beforeEach(TestConstants.middleware.user.testName, invalidUpdatePasswordTitle, false);
    });

    afterEach(() => {
      Log.afterEach(TestConstants.middleware.user.testName, invalidUpdatePasswordTitle, true);
      delete this.invalidDetails;
      Log.afterEach(TestConstants.middleware.user.testName, invalidUpdatePasswordTitle, false);
    });

    const it1 = 'throws an error for an invalid current user';
    it(it1, async (done) => {
      Log.it(TestConstants.middleware.user.testName, invalidGetAuthTokenTitle, it1, true);
      try {
        const result = await UserMiddleware.updatePassword(
          null,
          this.testUserDetails,
          this.invalidDetails
        );
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.user.testName,
          invalidUpdatePasswordTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(TestConstants.middleware.user.testName, invalidUpdatePasswordTitle, error.details);
      }

      Log.it(TestConstants.middleware.user.testName, invalidGetAuthTokenTitle, it1, false);
      done();
    });

    const it2 = 'throws an error for null details';
    it(it2, async (done) => {
      Log.it(TestConstants.middleware.user.testName, invalidUpdatePasswordTitle, it2, true);
      try {
        const result = await UserMiddleware.updatePassword(
          this.testUser,
          this.testUserDetails,
          null
        );
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.user.testName,
          invalidUpdatePasswordTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message)
          .toBe(`${Constants.params.oldPassword},${Constants.params.newPassword}`);
        Log.log(TestConstants.middleware.user.testName, invalidUpdatePasswordTitle, error.details);
      }

      Log.it(TestConstants.middleware.user.testName, invalidUpdatePasswordTitle, it2, false);
      done();
    });

    const it3 = 'throws an error for null username details';
    it(it3, async (done) => {
      Log.it(TestConstants.middleware.user.testName, invalidUpdatePasswordTitle, it3, true);
      const details = {
        oldPassword: this.testUserData.password,
        newPassword: TestConstants.params.test2,
      };

      try {
        const result = await UserMiddleware.updatePassword(this.testUser, null, details);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.user.testName,
          invalidUpdatePasswordTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message)
          .toBe(Constants.middleware.messages.unauthorizedAccess);
        Log.log(TestConstants.middleware.user.testName, invalidUpdatePasswordTitle, error.details);
      }

      Log.it(TestConstants.middleware.user.testName, invalidUpdatePasswordTitle, it3, false);
      done();
    });

    const it4 = 'throws an error for an invalid old and new password';
    it(it4, async (done) => {
      Log.it(TestConstants.middleware.user.testName, invalidUpdatePasswordTitle, it4, true);
      this.invalidDetails.oldPassword = `${TestConstants.params.invalidChars.dollar}${TestConstants.params.invalidChars.percent}`;
      this.invalidDetails.newPassword = TestConstants.params.invalidChars.password;
      try {
        const result = await UserMiddleware.updatePassword(
          this.testUser,
          this.testUserDetails,
          this.invalidDetails
        );
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.user.testName,
          invalidUpdatePasswordTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message)
          .toBe(`${Constants.params.oldPassword},${Constants.params.newPassword}`);
        Log.log(TestConstants.middleware.user.testName, invalidUpdatePasswordTitle, error.details);
      }

      Log.it(TestConstants.middleware.user.testName, invalidUpdatePasswordTitle, it4, false);
      done();
    });

    const it5 = 'throws an error for a missing old password';
    it(it5, async (done) => {
      Log.it(TestConstants.middleware.user.testName, invalidUpdatePasswordTitle, it5, true);
      delete this.invalidDetails.oldPassword;
      try {
        const result = await UserMiddleware.updatePassword(
          this.testUser,
          this.testUserDetails,
          this.invalidDetails
        );
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.user.testName,
          invalidUpdatePasswordTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe(`${Constants.params.oldPassword}`);
        Log.log(TestConstants.middleware.user.testName, invalidUpdatePasswordTitle, error.details);
      }

      Log.it(TestConstants.middleware.user.testName, invalidUpdatePasswordTitle, it5, false);
      done();
    });

    const it6 = 'throws an error for a missing new password';
    it(it6, async (done) => {
      Log.it(TestConstants.middleware.user.testName, invalidUpdatePasswordTitle, it6, true);
      delete this.invalidDetails.newPassword;
      try {
        const result = await UserMiddleware.updatePassword(
          this.testUser,
          this.testUserDetails,
          this.invalidDetails
        );
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.user.testName,
          invalidUpdatePasswordTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe(`${Constants.params.newPassword}`);
        Log.log(TestConstants.middleware.user.testName, invalidUpdatePasswordTitle, error.details);
      }

      Log.it(TestConstants.middleware.user.testName, invalidUpdatePasswordTitle, it6, false);
      done();
    });

    const it7 = 'throws an error for identical old and new passwords';
    it(it7, async (done) => {
      Log.it(TestConstants.middleware.user.testName, invalidUpdatePasswordTitle, it7, true);
      this.invalidDetails.newPassword = this.invalidDetails.oldPassword;
      try {
        const result = await UserMiddleware.updatePassword(
          this.testUser,
          this.testUserDetails,
          this.invalidDetails
        );
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.user.testName,
          invalidUpdatePasswordTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message).toBe(Constants.errors.messages.newValueMustBeDifferent);
        Log.log(TestConstants.middleware.user.testName, invalidUpdatePasswordTitle, error.details);
      }

      Log.it(TestConstants.middleware.user.testName, invalidUpdatePasswordTitle, it7, false);
      done();
    });

    const it8 = 'throws an error for updating a different user';
    it(it8, async (done) => {
      Log.it(TestConstants.middleware.user.testName, invalidUpdatePasswordTitle, it8, true);
      const details = { username: TestConstants.params.test };
      try {
        const result = await UserMiddleware.updatePassword(
          this.testUser,
          details,
          this.invalidDetails
        );
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.user.testName,
          invalidUpdatePasswordTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message)
          .toBe(Constants.middleware.messages.unauthorizedAccess);
        Log.log(TestConstants.middleware.user.testName, invalidUpdatePasswordTitle, error.details);
      }

      Log.it(TestConstants.middleware.user.testName, invalidUpdatePasswordTitle, it8, false);
      done();
    });

    const it9 = 'throws an error for updating a non-existent current user';
    it(it9, async (done) => {
      Log.it(TestConstants.middleware.user.testName, invalidUpdatePasswordTitle, it9, true);
      const user = new User({
        username: TestConstants.params.test,
        email: TestConstants.params.testEmail,
      });

      const details = { username: user.username };
      try {
        const result = await UserMiddleware.updatePassword(user, details, this.invalidDetails);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.user.testName,
          invalidUpdatePasswordTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(TestConstants.middleware.user.testName, invalidUpdatePasswordTitle, error.details);
      }

      Log.it(TestConstants.middleware.user.testName, invalidUpdatePasswordTitle, it9, false);
      done();
    });

    const it10 = 'throws an error for an incorrect password';
    it(it10, async (done) => {
      Log.it(TestConstants.middleware.user.testName, invalidUpdatePasswordTitle, it10, true);
      this.invalidDetails.oldPassword = Utils.newUuid();
      try {
        const result = await UserMiddleware.updatePassword(
          this.testUser,
          this.testUserDetails,
          this.invalidDetails
        );
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.user.testName,
          invalidUpdatePasswordTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message)
          .toBe(Constants.middleware.user.messages.errors.oldPasswordMustMatchExisting);
        Log.log(TestConstants.middleware.user.testName, invalidUpdatePasswordTitle, error.details);
      }

      Log.it(TestConstants.middleware.user.testName, invalidUpdatePasswordTitle, it10, false);
      done();
    });
  });

  const updateEmailTitle = 'Update email';
  describe(updateEmailTitle, () => {
    const it1 = 'updates the user\'s email';
    it(it1, async (done) => {
      Log.it(TestConstants.middleware.user.testName, updateEmailTitle, it1, true);
      const details = { newEmail: TestConstants.params.uuidEmail() };
      const result = await UserMiddleware.updateEmail(this.testUser, this.testUserDetails, details);
      expect(result.success).toBeDefined();
      expect(result.success.message).toBeDefined();
      expect(typeof result.success.message).toBe('string');
      expect(result.success.message.toLowerCase()).toContain(Constants.params.email);
      Log.log(TestConstants.middleware.user.testName, updateEmailTitle, result);
      Log.it(TestConstants.middleware.user.testName, updateEmailTitle, it1, false);
      done();
    });
  });

  const invalidUpdateEmailTitle = 'Invalid update email';
  describe(invalidUpdateEmailTitle, () => {
    beforeEach(() => {
      Log.beforeEach(TestConstants.middleware.user.testName, invalidUpdateEmailTitle, true);
      this.invalidDetails = {
        newEmail: Utils.newUuid(),
      };

      Log.beforeEach(TestConstants.middleware.user.testName, invalidUpdateEmailTitle, false);
    });

    afterEach(() => {
      Log.afterEach(TestConstants.middleware.user.testName, invalidUpdateEmailTitle, true);
      delete this.invalidDetails;
      Log.afterEach(TestConstants.middleware.user.testName, invalidUpdateEmailTitle, false);
    });

    const it1 = 'throws an error for an invalid current user';
    it(it1, async (done) => {
      Log.it(TestConstants.middleware.user.testName, invalidUpdateEmailTitle, it1, true);
      try {
        const result = await UserMiddleware.updateEmail(
          null,
          this.testUserDetails,
          this.invalidDetails
        );
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.user.testName,
          invalidUpdateEmailTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(TestConstants.middleware.user.testName, invalidUpdateEmailTitle, error.details);
      }

      Log.it(TestConstants.middleware.user.testName, invalidUpdateEmailTitle, it1, false);
      done();
    });

    const it2 = 'throws an error for null details';
    it(it2, async (done) => {
      Log.it(TestConstants.middleware.user.testName, invalidUpdateEmailTitle, it2, true);
      try {
        const result = await UserMiddleware.updateEmail(this.testUser, this.testUserDetails, null);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.user.testName,
          invalidUpdateEmailTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe(Constants.params.newEmail);
        Log.log(TestConstants.middleware.user.testName, invalidUpdateEmailTitle, error.details);
      }

      Log.it(TestConstants.middleware.user.testName, invalidUpdateEmailTitle, it2, false);
      done();
    });

    const it3 = 'throws an error for null username details';
    it(it3, async (done) => {
      Log.it(TestConstants.middleware.user.testName, invalidUpdateEmailTitle, it3, true);
      const details = { newEmail: TestConstants.params.uuidEmail() };
      try {
        const result = await UserMiddleware.updateEmail(this.testUser, null, details);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.user.testName,
          invalidUpdateEmailTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message)
          .toBe(Constants.middleware.messages.unauthorizedAccess);
        Log.log(TestConstants.middleware.user.testName, invalidUpdateEmailTitle, error.details);
      }

      Log.it(TestConstants.middleware.user.testName, invalidUpdateEmailTitle, it3, false);
      done();
    });

    const it4 = 'throws an error for an invalid email';
    it(it4, async (done) => {
      Log.it(TestConstants.middleware.user.testName, invalidUpdateEmailTitle, it4, true);
      try {
        const result = await UserMiddleware.updateEmail(
          this.testUser,
          this.testUserDetails,
          this.invalidDetails
        );
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.user.testName,
          invalidUpdateEmailTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe(Constants.params.newEmail);
        Log.log(TestConstants.middleware.user.testName, invalidUpdateEmailTitle, error.details);
      }

      Log.it(TestConstants.middleware.user.testName, invalidUpdateEmailTitle, it4, false);
      done();
    });

    const it5 = 'throws an error for a missing email';
    it(it5, async (done) => {
      Log.it(TestConstants.middleware.user.testName, invalidUpdateEmailTitle, it5, true);
      delete this.invalidDetails.newEmail;
      try {
        const result = await UserMiddleware.updateEmail(
          this.testUser,
          this.testUserDetails,
          this.invalidDetails
        );
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.user.testName,
          invalidUpdateEmailTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe(Constants.params.newEmail);
        Log.log(TestConstants.middleware.user.testName, invalidUpdateEmailTitle, error.details);
      }

      Log.it(TestConstants.middleware.user.testName, invalidUpdateEmailTitle, it5, false);
      done();
    });

    const it6 = 'throws an error for updating a different user';
    it(it6, async (done) => {
      Log.it(TestConstants.middleware.user.testName, invalidUpdateEmailTitle, it6, true);
      this.invalidDetails.newEmail = TestConstants.params.testEmail;
      try {
        const details = { username: TestConstants.params.test };
        const result = await UserMiddleware.updateEmail(
          this.testUser,
          details,
          this.invalidDetails
        );
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.user.testName,
          invalidUpdateEmailTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message)
          .toBe(Constants.middleware.messages.unauthorizedAccess);
        Log.log(TestConstants.middleware.user.testName, invalidUpdateEmailTitle, error.details);
      }

      Log.it(TestConstants.middleware.user.testName, invalidUpdateEmailTitle, it6, false);
      done();
    });
  });

  const interUserFunctionsTitle = 'Inter-user functions';
  describe(interUserFunctionsTitle, () => {
    beforeEach(async (done) => {
      Log.beforeEach(TestConstants.middleware.user.testName, interUserFunctionsTitle, true);
      const details = {
        username: Utils.newUuid(),
        password: Utils.newUuid(),
        email: TestConstants.params.uuidEmail(),
      };

      this.testUser2 = await UserMiddleware.create(details);
      Log.beforeEach(TestConstants.middleware.user.testName, interUserFunctionsTitle, false);
      done();
    });

    afterEach(async (done) => {
      Log.afterEach(TestConstants.middleware.user.testName, interUserFunctionsTitle, true);
      await UserMiddleware.remove(this.testUser2, { username: this.testUser2.username });
      delete this.testUser2;
      Log.afterEach(TestConstants.middleware.user.testName, interUserFunctionsTitle, false);
      done();
    });

    const requestToFollowTitle = 'Request to follow user';
    describe(requestToFollowTitle, () => {
      const it1 = 'adds a follow request for the user';
      it(it1, async (done) => {
        Log.it(TestConstants.middleware.user.testName, requestToFollowTitle, it1, true);
        const details = { username: this.testUser.username };
        const requestedUser = { requestedUser: this.testUser2.username };
        const result = await UserMiddleware.requestToFollow(this.testUser, details, requestedUser);
        expect(result.success).toBeDefined();
        expect(result.success.message).toBeDefined();
        expect(typeof result.success.message).toBe('string');
        expect(result.success.message)
          .toBe(Constants.middleware.user.messages.success.followRequest);
        expect(this.testUser.followRequests.includes(this.testUser2.username)).toBe(true);
        Log.log(TestConstants.middleware.user.testName, requestToFollowTitle, result);
        Log.it(TestConstants.middleware.user.testName, requestToFollowTitle, it1, false);
        done();
      });
    });

    const invalidRequestToFollowTitle = 'Invalid request to follow user';
    describe(invalidRequestToFollowTitle, () => {
      beforeEach(() => {
        Log.beforeEach(TestConstants.middleware.user.testName, invalidRequestToFollowTitle, true);
        this.invalidUsername = TestConstants.params.invalidChars.percent;
        Log.beforeEach(TestConstants.middleware.user.testName, invalidRequestToFollowTitle, false);
      });

      afterEach(() => {
        Log.afterEach(TestConstants.middleware.user.testName, invalidRequestToFollowTitle, true);
        delete this.invalidUsername;
        Log.afterEach(TestConstants.middleware.user.testName, invalidRequestToFollowTitle, false);
      });

      const it2 = 'throws an error for an invalid current user';
      it(it2, async (done) => {
        Log.it(TestConstants.middleware.user.testName, invalidRequestToFollowTitle, it2, true);
        const details = { username: this.testUser.username };
        const requestedUser = { requestedUser: this.testUser2.username };
        try {
          const result = await UserMiddleware.requestToFollow(null, details, requestedUser);
          expect(result).not.toBeDefined();
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRequestToFollowTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.Server.type);
          expect(error.details.error.message).toBe(DroppError.type.Server.message);
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRequestToFollowTitle,
            error.details
          );
        }

        Log.it(TestConstants.middleware.user.testName, invalidRequestToFollowTitle, it2, false);
        done();
      });

      const it3 = 'throws an error for an invalid username details argument';
      it(it3, async (done) => {
        Log.it(TestConstants.middleware.user.testName, invalidRequestToFollowTitle, it3, true);
        const requestedUser = { requestedUser: this.testUser2.username };
        try {
          const result = await UserMiddleware.requestToFollow(this.testUser, null, requestedUser);
          expect(result).not.toBeDefined();
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRequestToFollowTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe(Constants.params.username);
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRequestToFollowTitle,
            error.details
          );
        }

        Log.it(TestConstants.middleware.user.testName, invalidRequestToFollowTitle, it3, false);
        done();
      });

      const it4 = 'throws an error for an invalid requested user details argument';
      it(it4, async (done) => {
        Log.it(TestConstants.middleware.user.testName, invalidRequestToFollowTitle, it4, true);
        const details = { username: this.testUser.username };
        try {
          const result = await UserMiddleware.requestToFollow(this.testUser, details, null);
          expect(result).not.toBeDefined();
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRequestToFollowTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe(Constants.params.requestedUser);
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRequestToFollowTitle,
            error.details
          );
        }

        Log.it(TestConstants.middleware.user.testName, invalidRequestToFollowTitle, it4, false);
        done();
      });

      const it5 = 'throws an error for an invalid username';
      it(it5, async (done) => {
        Log.it(TestConstants.middleware.user.testName, invalidRequestToFollowTitle, it5, true);
        const details = { username: this.testUser.username };
        const requestedUser = { requestedUser: this.invalidUsername };
        try {
          const result = await UserMiddleware.requestToFollow(
            this.testUser,
            details,
            requestedUser
          );
          expect(result).not.toBeDefined();
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRequestToFollowTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe(Constants.params.requestedUser);
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRequestToFollowTitle,
            error.details
          );
        }

        Log.it(TestConstants.middleware.user.testName, invalidRequestToFollowTitle, it5, false);
        done();
      });

      const it6 = 'throws an error for a missing username';
      it(it6, async (done) => {
        Log.it(TestConstants.middleware.user.testName, invalidRequestToFollowTitle, it6, true);
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
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRequestToFollowTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe(Constants.params.requestedUser);
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRequestToFollowTitle,
            error.details
          );
        }

        Log.it(TestConstants.middleware.user.testName, invalidRequestToFollowTitle, it6, false);
        done();
      });

      const it7 = 'throws an error for accessing a different user\'s follow requests';
      it(it7, async (done) => {
        Log.it(TestConstants.middleware.user.testName, invalidRequestToFollowTitle, it7, true);
        const details = { username: this.testUser2.username };
        const requestedUser = { requestedUser: this.testUser2.username };
        try {
          const result = await UserMiddleware.requestToFollow(
            this.testUser,
            details,
            requestedUser
          );
          expect(result).not.toBeDefined();
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRequestToFollowTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message)
            .toBe(Constants.middleware.messages.unauthorizedAccess);
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRequestToFollowTitle,
            error.details
          );
        }

        Log.it(TestConstants.middleware.user.testName, invalidRequestToFollowTitle, it7, false);
        done();
      });

      const it8 = 'throws an error for requesting to follow the same user';
      it(it8, async (done) => {
        Log.it(TestConstants.middleware.user.testName, invalidRequestToFollowTitle, it8, true);
        const details = { username: this.testUser.username };
        const requestedUser = { requestedUser: this.testUser.username };
        try {
          const result = await UserMiddleware.requestToFollow(
            this.testUser,
            details,
            requestedUser
          );
          expect(result).not.toBeDefined();
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRequestToFollowTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message)
            .toBe(Constants.middleware.user.messages.errors.cannotRequestFollowSelf);
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRequestToFollowTitle,
            error.details
          );
        }

        Log.it(TestConstants.middleware.user.testName, invalidRequestToFollowTitle, it8, false);
        done();
      });

      const it9 = 'throws an error for a non-existent user';
      it(it9, async (done) => {
        Log.it(TestConstants.middleware.user.testName, invalidRequestToFollowTitle, it9, true);
        const details = { username: this.testUser.username };
        const requestedUser = { requestedUser: TestConstants.params.test };
        try {
          const result = await UserMiddleware.requestToFollow(
            this.testUser,
            details,
            requestedUser
          );
          expect(result).not.toBeDefined();
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRequestToFollowTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.ResourceDNE.type);
          expect(error.details.error.message)
            .toBe(TestConstants.messages.doesNotExist(Constants.params.user));
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRequestToFollowTitle,
            error.details
          );
        }

        Log.it(TestConstants.middleware.user.testName, invalidRequestToFollowTitle, it9, false);
        done();
      });

      const it10 = 'throws an error for existing pending follow request';
      it(it10, async (done) => {
        Log.it(TestConstants.middleware.user.testName, invalidRequestToFollowTitle, it10, true);
        // Set up test case
        let testUser3;
        try {
          const details = {
            username: Utils.newUuid(),
            password: Utils.newUuid(),
            email: TestConstants.params.uuidEmail(),
          };

          testUser3 = await UserMiddleware.create(details);
          const usernameDetails = { username: this.testUser.username };
          const requestedUser = { requestedUser: testUser3.username };
          await UserMiddleware.requestToFollow(this.testUser, usernameDetails, requestedUser);
        } catch (error) {
          expect(error).not.toBeDefined();
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRequestToFollowTitle,
            TestConstants.messages.shouldNotHaveThrown
          );
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
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRequestToFollowTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message)
            .toBe(Constants.middleware.user.messages.errors.alreadyHasFollowRequest);
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRequestToFollowTitle,
            error.details
          );
        }

        // Clean up test case
        try {
          const result = await UserMiddleware.remove(testUser3, { username: testUser3.username });
          expect(result.success).toBeDefined();
        } catch (error) {
          expect(error).not.toBeDefined();
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRequestToFollowTitle,
            TestConstants.messages.shouldNotHaveThrown
          );
        }

        Log.it(TestConstants.middleware.user.testName, invalidRequestToFollowTitle, it10, false);
        done();
      });
    });

    const removeFollowRequestTitle = 'Remove follow request';
    describe(removeFollowRequestTitle, () => {
      beforeEach(async (done) => {
        Log.beforeEach(TestConstants.middleware.user.testName, removeFollowRequestTitle, true);
        const details = { username: this.testUser.username };
        const requestedUser = { requestedUser: this.testUser2.username };
        await UserMiddleware.requestToFollow(this.testUser, details, requestedUser);
        Log.beforeEach(TestConstants.middleware.user.testName, removeFollowRequestTitle, false);
        done();
      });

      const it1 = 'removes a follow request to the user';
      it(it1, async (done) => {
        Log.it(TestConstants.middleware.user.testName, removeFollowRequestTitle, it1, true);
        const details = {
          username: this.testUser.username,
          requestedUser: this.testUser2.username,
        };

        const result = await UserMiddleware.removeFollowRequest(this.testUser, details);
        expect(result.success).toBeDefined();
        expect(result.success.message).toBeDefined();
        expect(typeof result.success.message).toBe('string');
        expect(result.success.message)
          .toBe(Constants.middleware.user.messages.success.followRequestRemoval);
        expect(this.testUser.followRequests.includes(this.testUser2.username)).toBe(false);
        Log.log(
          TestConstants.middleware.user.testName,
          removeFollowRequestTitle,
          result
        );
        Log.it(TestConstants.middleware.user.testName, removeFollowRequestTitle, it1, false);
        done();
      });
    });

    const invalidRemoveFollowRequestTitle = 'Invalid remove follow request';
    describe(invalidRemoveFollowRequestTitle, () => {
      beforeEach(() => {
        Log.beforeEach(
          TestConstants.middleware.user.testName,
          invalidRemoveFollowRequestTitle,
          true
        );
        this.invalidUsername = TestConstants.params.invalidChars.percent;
        Log.beforeEach(
          TestConstants.middleware.user.testName,
          invalidRemoveFollowRequestTitle,
          false
        );
      });

      afterEach(() => {
        Log.afterEach(
          TestConstants.middleware.user.testName,
          invalidRemoveFollowRequestTitle,
          true
        );
        delete this.invalidUsername;
        Log.afterEach(
          TestConstants.middleware.user.testName,
          invalidRemoveFollowRequestTitle,
          false
        );
      });

      const it2 = 'throws an error for an invalid current user';
      it(it2, async (done) => {
        Log.it(TestConstants.middleware.user.testName, invalidRemoveFollowRequestTitle, it2, true);
        const details = {
          username: this.testUser.username,
          requestedUser: this.testUser2.username,
        };

        try {
          const result = await UserMiddleware.removeFollowRequest(null, details);
          expect(result).not.toBeDefined();
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRemoveFollowRequestTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.Server.type);
          expect(error.details.error.message).toBe(DroppError.type.Server.message);
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRemoveFollowRequestTitle,
            error.details
          );
        }

        Log.it(TestConstants.middleware.user.testName, invalidRemoveFollowRequestTitle, it2, false);
        done();
      });

      const it3 = 'throws an error for an invalid username details argument';
      it(it3, async (done) => {
        Log.it(TestConstants.middleware.user.testName, invalidRemoveFollowRequestTitle, it3, true);
        try {
          const result = await UserMiddleware.removeFollowRequest(this.testUser, null);
          expect(result).not.toBeDefined();
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRemoveFollowRequestTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message)
            .toBe(`${Constants.params.username},${Constants.params.requestedUser}`);
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRemoveFollowRequestTitle,
            error.details
          );
        }

        Log.it(TestConstants.middleware.user.testName, invalidRemoveFollowRequestTitle, it3, false);
        done();
      });

      const it4 = 'throws an error for an invalid username';
      it(it4, async (done) => {
        Log.it(TestConstants.middleware.user.testName, invalidRemoveFollowRequestTitle, it4, true);
        const details = {
          username: this.invalidUsername,
          requestedUser: this.testUser2.username,
        };

        try {
          const result = await UserMiddleware.removeFollowRequest(this.testUser, details);
          expect(result).not.toBeDefined();
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRemoveFollowRequestTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe(Constants.params.username);
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRemoveFollowRequestTitle,
            error.details
          );
        }

        Log.it(TestConstants.middleware.user.testName, invalidRemoveFollowRequestTitle, it4, false);
        done();
      });

      const it5 = 'throws an error for an invalid requested username';
      it(it5, async (done) => {
        Log.it(TestConstants.middleware.user.testName, invalidRemoveFollowRequestTitle, it5, true);
        const details = {
          username: this.testUser.username,
          requestedUser: this.invalidUsername,
        };

        try {
          const result = await UserMiddleware.removeFollowRequest(this.testUser, details);
          expect(result).not.toBeDefined();
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRemoveFollowRequestTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe(Constants.params.requestedUser);
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRemoveFollowRequestTitle,
            error.details
          );
        }

        Log.it(TestConstants.middleware.user.testName, invalidRemoveFollowRequestTitle, it5, false);
        done();
      });

      const it6 = 'throws an error for a missing requested username';
      it(it6, async (done) => {
        Log.it(TestConstants.middleware.user.testName, invalidRemoveFollowRequestTitle, it6, true);
        const details = {
          requestedUser: undefined,
          username: this.testUser.username,
        };

        try {
          const result = await UserMiddleware.removeFollowRequest(this.testUser, details);
          expect(result).not.toBeDefined();
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRemoveFollowRequestTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe(Constants.params.requestedUser);
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRemoveFollowRequestTitle,
            error.details
          );
        }

        Log.it(TestConstants.middleware.user.testName, invalidRemoveFollowRequestTitle, it6, false);
        done();
      });

      const it7 = 'throws an error for accessing a different user\'s follow requests';
      it(it7, async (done) => {
        Log.it(TestConstants.middleware.user.testName, invalidRemoveFollowRequestTitle, it7, true);
        const details = {
          username: this.testUser2.username,
          requestedUser: this.testUser2.username,
        };

        try {
          const result = await UserMiddleware.removeFollowRequest(this.testUser, details);
          expect(result).not.toBeDefined();
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRemoveFollowRequestTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message)
            .toBe(Constants.middleware.messages.unauthorizedAccess);
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRemoveFollowRequestTitle,
            error.details
          );
        }

        Log.it(TestConstants.middleware.user.testName, invalidRemoveFollowRequestTitle, it7, false);
        done();
      });

      const it8 = 'throws an error for removing a follow request from the same user';
      it(it8, async (done) => {
        Log.it(TestConstants.middleware.user.testName, invalidRemoveFollowRequestTitle, it8, true);
        const details = {
          username: this.testUser.username,
          requestedUser: this.testUser.username,
        };

        try {
          const result = await UserMiddleware.removeFollowRequest(this.testUser, details);
          expect(result).not.toBeDefined();
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRemoveFollowRequestTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message)
            .toBe(Constants.middleware.user.messages.errors.cannotRemoveFollowSelf);
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRemoveFollowRequestTitle,
            error.details
          );
        }

        Log.it(TestConstants.middleware.user.testName, invalidRemoveFollowRequestTitle, it8, false);
        done();
      });

      const it9 = 'throws an error for a non-existent requested user';
      it(it9, async (done) => {
        Log.it(TestConstants.middleware.user.testName, invalidRemoveFollowRequestTitle, it9, true);
        const details = {
          requestedUser: Utils.newUuid(),
          username: this.testUser.username,
        };

        try {
          const result = await UserMiddleware.removeFollowRequest(this.testUser, details);
          expect(result).not.toBeDefined();
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRemoveFollowRequestTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.ResourceDNE.type);
          expect(error.details.error.message)
            .toBe(TestConstants.messages.doesNotExist(Constants.params.user));
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRemoveFollowRequestTitle,
            error.details
          );
        }

        Log.it(TestConstants.middleware.user.testName, invalidRemoveFollowRequestTitle, it9, false);
        done();
      });

      const it10 = 'throws an error for a non-existent follow request';
      it(it10, async (done) => {
        Log.it(TestConstants.middleware.user.testName, invalidRemoveFollowRequestTitle, it10, true);
        const details = {
          username: this.testUser.username,
          requestedUser: this.testUser2.username,
        };

        try {
          const result = await UserMiddleware.removeFollowRequest(this.testUser, details);
          expect(result).not.toBeDefined();
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRemoveFollowRequestTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message)
            .toBe(Constants.middleware.user.messages.errors.noPendingFollowRequest);
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRemoveFollowRequestTitle,
            error.details
          );
        }

        Log.it(
          TestConstants.middleware.user.testName,
          invalidRemoveFollowRequestTitle,
          it10,
          false
        );
        done();
      });
    });

    const respondToFollowerRequestTitle = 'Respond to follow request';
    describe(respondToFollowerRequestTitle, () => {
      beforeEach(async (done) => {
        Log.beforeEach(TestConstants.middleware.user.testName, respondToFollowerRequestTitle, true);
        const details = { username: this.testUser.username };
        const requestedUser = { requestedUser: this.testUser2.username };
        await UserMiddleware.requestToFollow(this.testUser, details, requestedUser);
        Log.beforeEach(
          TestConstants.middleware.user.testName,
          respondToFollowerRequestTitle,
          false
        );
        done();
      });

      const it1 = 'accepts a follower request';
      it(it1, async (done) => {
        Log.it(
          TestConstants.middleware.user.testName,
          respondToFollowerRequestTitle,
          it1,
          true
        );
        const details = { accept: Constants.params.true };
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
        const expectedMessage = Constants.middleware.user.messages.success
          .followRequestResponse(Constants.params.acceptance);
        expect(result.success.message).toBe(expectedMessage);
        expect(this.testUser2.followerRequests.includes(this.testUser.username)).toBe(false);
        expect(this.testUser2.followers.includes(this.testUser.username)).toBe(true);
        Log.log(
          TestConstants.middleware.user.testName,
          respondToFollowerRequestTitle,
          result
        );
        Log.it(TestConstants.middleware.user.testName, respondToFollowerRequestTitle, it1, false);
        done();
      });

      const it2 = 'declines a follower request';
      it(it2, async (done) => {
        Log.it(TestConstants.middleware.user.testName, respondToFollowerRequestTitle, it2, true);
        const details = { accept: Constants.params.false };
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
        const expectedMessage = Constants.middleware.user.messages.success
          .followRequestResponse(Constants.params.denial);
        expect(result.success.message).toBe(expectedMessage);
        expect(this.testUser2.followerRequests.includes(this.testUser.username)).toBe(false);
        expect(this.testUser2.followers.includes(this.testUser.username)).toBe(false);
        Log.log(TestConstants.middleware.user.testName, respondToFollowerRequestTitle, result);
        Log.it(TestConstants.middleware.user.testName, respondToFollowerRequestTitle, it2, false);
        done();
      });
    });

    const invalidRespondToFollowerRequestTitle = 'Invalid respond to follow request';
    describe(invalidRespondToFollowerRequestTitle, () => {
      beforeEach(() => {
        Log.beforeEach(
          TestConstants.middleware.user.testName,
          invalidRespondToFollowerRequestTitle,
          true
        );
        this.invalidUsername = TestConstants.params.test;
        this.invalidDetails = {
          accept: Constants.params.true,
        };

        Log.beforeEach(

          TestConstants.middleware.user.testName,

          invalidRespondToFollowerRequestTitle,

          false

        );
      });

      afterEach(() => {
        Log.afterEach(
          TestConstants.middleware.user.testName,
          invalidRespondToFollowerRequestTitle,
          true
        );
        delete this.invalidDetails;
        delete this.invalidUsername;
        Log.afterEach(
          TestConstants.middleware.user.testName,
          invalidRespondToFollowerRequestTitle,
          false
        );
      });

      const it3 = 'throws an error for an invalid current user';
      it(it3, async (done) => {
        Log.it(
          TestConstants.middleware.user.testName,
          invalidRespondToFollowerRequestTitle,
          it3,
          true
        );
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
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRespondToFollowerRequestTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.Server.type);
          expect(error.details.error.message).toBe(DroppError.type.Server.message);
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRespondToFollowerRequestTitle,
            error.details
          );
        }

        Log.it(
          TestConstants.middleware.user.testName,
          invalidRespondToFollowerRequestTitle,
          it3,
          false
        );
        done();
      });

      const it4 = 'throws an error for null username details';
      it(it4, async (done) => {
        Log.it(
          TestConstants.middleware.user.testName,
          invalidRespondToFollowerRequestTitle,
          it4,
          true
        );
        try {
          const result = await UserMiddleware.respondToFollowerRequest(
            this.testUser,
            null,
            this.invalidDetails
          );
          expect(result).not.toBeDefined();
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRespondToFollowerRequestTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message)
            .toBe(`${Constants.params.username},${Constants.params.requestedUser}`);
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRespondToFollowerRequestTitle,
            error.details
          );
        }

        Log.it(
          TestConstants.middleware.user.testName,
          invalidRespondToFollowerRequestTitle,
          it4,
          false
        );
        done();
      });

      const it5 = 'throws an error for null details';
      it(it5, async (done) => {
        Log.it(
          TestConstants.middleware.user.testName,
          invalidRespondToFollowerRequestTitle,
          it5,
          true
        );
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
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRespondToFollowerRequestTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe(Constants.params.accept);
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRespondToFollowerRequestTitle,
            error.details
          );
        }

        Log.it(
          TestConstants.middleware.user.testName,
          invalidRespondToFollowerRequestTitle,
          it5,
          false
        );
        done();
      });

      const it6 = 'throws an error for an invalid username';
      it(it6, async (done) => {
        Log.it(
          TestConstants.middleware.user.testName,
          invalidRespondToFollowerRequestTitle,
          it6,
          true
        );
        const usernameDetails = {
          requestedUser: TestConstants.params.invalidChars.percent,
          username: this.testUser.username,
        };

        try {
          const result = await UserMiddleware.respondToFollowerRequest(
            this.testUser,
            usernameDetails,
            this.invalidDetails
          );
          expect(result).not.toBeDefined();
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRespondToFollowerRequestTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe(Constants.params.requestedUser);
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRespondToFollowerRequestTitle,
            error.details
          );
        }

        Log.it(
          TestConstants.middleware.user.testName,
          invalidRespondToFollowerRequestTitle,
          it6,
          false
        );
        done();
      });

      const it7 = 'throws an error for an invalid accept parameter';
      it(it7, async (done) => {
        Log.it(
          TestConstants.middleware.user.testName,
          invalidRespondToFollowerRequestTitle,
          it7,
          true
        );
        this.invalidDetails.accept = TestConstants.params.test;
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
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRespondToFollowerRequestTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe(Constants.params.accept);
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRespondToFollowerRequestTitle,
            error.details
          );
        }

        Log.it(
          TestConstants.middleware.user.testName,
          invalidRespondToFollowerRequestTitle,
          it7,
          false
        );
        done();
      });

      const it8 = 'throws an error for an invalid username and accept parameter';
      it(it8, async (done) => {
        Log.it(
          TestConstants.middleware.user.testName,
          invalidRespondToFollowerRequestTitle,
          it8,
          true
        );
        this.invalidDetails.accept = TestConstants.params.invalidChars.percent;
        const usernameDetails = {
          requestedUser: TestConstants.params.invalidChars.percent,
          username: this.testUser.username,
        };

        try {
          const result = await UserMiddleware.respondToFollowerRequest(
            this.testUser,
            usernameDetails,
            this.invalidDetails
          );
          expect(result).not.toBeDefined();
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRespondToFollowerRequestTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message)
            .toBe(`${Constants.params.requestedUser},${Constants.params.accept}`);
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRespondToFollowerRequestTitle,
            error.details
          );
        }

        Log.it(
          TestConstants.middleware.user.testName,
          invalidRespondToFollowerRequestTitle,
          it8,
          false
        );
        done();
      });

      const it9 = 'throws an error for accessing a different user\'s follow requests';
      it(it9, async (done) => {
        Log.it(
          TestConstants.middleware.user.testName,
          invalidRespondToFollowerRequestTitle,
          it9,
          true
        );
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
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRespondToFollowerRequestTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message)
            .toBe(Constants.middleware.messages.unauthorizedAccess);
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRespondToFollowerRequestTitle,
            error.details
          );
        }

        Log.it(
          TestConstants.middleware.user.testName,
          invalidRespondToFollowerRequestTitle,
          it9,
          false
        );
        done();
      });

      const it95 = 'throws an error for attempting to remove a follower request from the same user';
      it(it95, async (done) => {
        Log.it(
          TestConstants.middleware.user.testName,
          invalidRespondToFollowerRequestTitle,
          it95,
          true
        );
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
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRespondToFollowerRequestTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message)
            .toBe(Constants.middleware.user.messages.errors.cannotRespondRequestSelf);
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRespondToFollowerRequestTitle,
            error.details
          );
        }

        Log.it(
          TestConstants.middleware.user.testName,
          invalidRespondToFollowerRequestTitle,
          it95,
          false
        );
        done();
      });

      const it10 = 'throws an error for a non-existent user';
      it(it10, async (done) => {
        Log.it(
          TestConstants.middleware.user.testName,
          invalidRespondToFollowerRequestTitle,
          it10,
          true
        );
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
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRespondToFollowerRequestTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.ResourceDNE.type);
          expect(error.details.error.message)
            .toBe(TestConstants.messages.doesNotExist(Constants.params.user));
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRespondToFollowerRequestTitle,
            error.details
          );
        }

        Log.it(
          TestConstants.middleware.user.testName,
          invalidRespondToFollowerRequestTitle,
          it10,
          false
        );
        done();
      });

      const it11 = 'throws an error for a non-existent follower request';
      it(it11, async (done) => {
        Log.it(
          TestConstants.middleware.user.testName,
          invalidRespondToFollowerRequestTitle,
          it11,
          true
        );
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
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRespondToFollowerRequestTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message)
            .toBe(Constants.middleware.user.messages.errors.noFollowRequestFromUser);
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRespondToFollowerRequestTitle,
            error.details
          );
        }

        Log.it(
          TestConstants.middleware.user.testName,
          invalidRespondToFollowerRequestTitle,
          it11,
          false
        );
        done();
      });
    });

    const updateFollowFollowerTitle = 'Update follow/follower';
    describe(updateFollowFollowerTitle, () => {
      beforeEach(async (done) => {
        Log.beforeEach(TestConstants.middleware.user.testName, updateFollowFollowerTitle, true);
        const details = { accept: Constants.params.true };
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
        Log.beforeEach(TestConstants.middleware.user.testName, updateFollowFollowerTitle, false);
        done();
      });

      const it1 = 'unfollows a user';
      it(it1, async (done) => {
        Log.it(TestConstants.middleware.user.testName, updateFollowFollowerTitle, it1, true);
        const usernameDetails = {
          follow: this.testUser2.username,
          username: this.testUser.username,
        };

        const result = await UserMiddleware.unfollow(this.testUser, usernameDetails);
        expect(result.success).toBeDefined();
        expect(result.success.message).toBeDefined();
        expect(result.success.message).toBe(Constants.middleware.user.messages.success.unfollow);
        expect(this.testUser.follows.includes(this.testUser2.username)).toBe(false);
        Log.log(TestConstants.middleware.user.testName, updateFollowFollowerTitle, result);
        Log.it(TestConstants.middleware.user.testName, updateFollowFollowerTitle, it1, false);
        done();
      });

      const it2 = 'removes a follower';
      it(it2, async (done) => {
        Log.it(TestConstants.middleware.user.testName, updateFollowFollowerTitle, it2, true);
        const usernameDetails = {
          follower: this.testUser.username,
          username: this.testUser2.username,
        };

        const result = await UserMiddleware.removeFollower(this.testUser2, usernameDetails);
        expect(result.success).toBeDefined();
        expect(result.success.message).toBeDefined();
        expect(result.success.message)
          .toBe(Constants.middleware.user.messages.success.removeFollower);
        expect(this.testUser2.followers.includes(this.testUser.username)).toBe(false);
        Log.log(TestConstants.middleware.user.testName, updateFollowFollowerTitle, result);
        Log.it(TestConstants.middleware.user.testName, updateFollowFollowerTitle, it2, false);
        done();
      });
    });

    const invalidUnfollowTitle = 'Invalid unfollow';
    describe(invalidUnfollowTitle, () => {
      beforeEach(() => {
        Log.beforeEach(TestConstants.middleware.user.testName, invalidUnfollowTitle, true);
        this.invalidUsername = TestConstants.params.invalidChars.percent;
        Log.beforeEach(TestConstants.middleware.user.testName, invalidUnfollowTitle, false);
      });

      afterEach(() => {
        Log.afterEach(TestConstants.middleware.user.testName, invalidUnfollowTitle, true);
        delete this.invalidUsername;
        Log.afterEach(TestConstants.middleware.user.testName, invalidUnfollowTitle, false);
      });

      const it1 = 'throws an error for an invalid current user';
      it(it1, async (done) => {
        Log.it(TestConstants.middleware.user.testName, invalidUnfollowTitle, it1, true);
        const usernameDetails = {
          follow: this.invalidUsername,
          username: this.testUser.username,
        };

        try {
          const result = await UserMiddleware.unfollow(null, usernameDetails);
          expect(result).not.toBeDefined();
          Log.log(
            TestConstants.middleware.user.testName,
            invalidUnfollowTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.Server.type);
          expect(error.details.error.message).toBe(DroppError.type.Server.message);
          Log.log(TestConstants.middleware.user.testName, invalidUnfollowTitle, error.details);
        }

        Log.it(TestConstants.middleware.user.testName, invalidUnfollowTitle, it1, false);
        done();
      });

      const it2 = 'throws an error for an invalid username details argument';
      it(it2, async (done) => {
        Log.it(TestConstants.middleware.user.testName, invalidUnfollowTitle, it2, true);
        try {
          const result = await UserMiddleware.unfollow(this.testUser, null);
          expect(result).not.toBeDefined();
          Log.log(
            TestConstants.middleware.user.testName,
            invalidUnfollowTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message)
            .toBe(`${Constants.params.username},${Constants.params.follow}`);
          Log.log(TestConstants.middleware.user.testName, invalidUnfollowTitle, error.details);
        }

        Log.it(TestConstants.middleware.user.testName, invalidUnfollowTitle, it2, false);
        done();
      });

      const it3 = 'throws an error for an invalid requested username';
      it(it3, async (done) => {
        Log.it(TestConstants.middleware.user.testName, invalidUnfollowTitle, it3, true);
        const usernameDetails = {
          follow: this.invalidUsername,
          username: this.testUser.username,
        };

        try {
          const result = await UserMiddleware.unfollow(this.testUser, usernameDetails);
          expect(result).not.toBeDefined();
          Log.log(
            TestConstants.middleware.user.testName,
            invalidUnfollowTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe(Constants.params.follow);
          Log.log(TestConstants.middleware.user.testName, invalidUnfollowTitle, error.details);
        }

        Log.it(TestConstants.middleware.user.testName, invalidUnfollowTitle, it3, false);
        done();
      });

      const it4 = 'throws an error for an invalid current username';
      it(it4, async (done) => {
        Log.it(TestConstants.middleware.user.testName, invalidUnfollowTitle, it4, true);
        const usernameDetails = {
          username: this.invalidUsername,
          follow: this.testUser2.username,
        };

        try {
          const result = await UserMiddleware.unfollow(this.testUser, usernameDetails);
          expect(result).not.toBeDefined();
          Log.log(
            TestConstants.middleware.user.testName,
            invalidUnfollowTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message).toBe(Constants.params.username);
          Log.log(TestConstants.middleware.user.testName, invalidUnfollowTitle, error.details);
        }

        Log.it(TestConstants.middleware.user.testName, invalidUnfollowTitle, it4, false);
        done();
      });

      const it5 = 'throws an error for accessing a different user\'s follows';
      it(it5, async (done) => {
        Log.it(TestConstants.middleware.user.testName, invalidUnfollowTitle, it5, true);
        const usernameDetails = {
          follow: this.testUser2.username,
          username: this.testUser2.username,
        };

        try {
          const result = await UserMiddleware.unfollow(this.testUser, usernameDetails);
          expect(result).not.toBeDefined();
          Log.log(
            TestConstants.middleware.user.testName,
            invalidUnfollowTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message)
            .toBe(Constants.middleware.messages.unauthorizedAccess);
          Log.log(TestConstants.middleware.user.testName, invalidUnfollowTitle, error.details);
        }

        Log.it(TestConstants.middleware.user.testName, invalidUnfollowTitle, it5, false);
        done();
      });

      const it6 = 'throws an error for attempting to unfollow the same user';
      it(it6, async (done) => {
        Log.it(TestConstants.middleware.user.testName, invalidUnfollowTitle, it6, true);
        const usernameDetails = {
          follow: this.testUser.username,
          username: this.testUser.username,
        };

        try {
          const result = await UserMiddleware.unfollow(this.testUser, usernameDetails);
          expect(result).not.toBeDefined();
          Log.log(
            TestConstants.middleware.user.testName,
            invalidUnfollowTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message)
            .toBe(Constants.middleware.user.messages.errors.cannotUnfollowSelf);
          Log.log(TestConstants.middleware.user.testName, invalidUnfollowTitle, error.details);
        }

        Log.it(TestConstants.middleware.user.testName, invalidUnfollowTitle, it6, false);
        done();
      });

      const it7 = 'throws an error for a non-existent user';
      it(it7, async (done) => {
        Log.it(TestConstants.middleware.user.testName, invalidUnfollowTitle, it7, true);
        const usernameDetails = {
          follow: Utils.newUuid(),
          username: this.testUser.username,
        };

        try {
          const result = await UserMiddleware.unfollow(this.testUser, usernameDetails);
          expect(result).not.toBeDefined();
          Log.log(
            TestConstants.middleware.user.testName,
            invalidUnfollowTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.ResourceDNE.type);
          expect(error.details.error.message)
            .toBe(TestConstants.messages.doesNotExist(Constants.params.user));
          Log.log(TestConstants.middleware.user.testName, invalidUnfollowTitle, error.details);
        }

        Log.it(TestConstants.middleware.user.testName, invalidUnfollowTitle, it7, false);
        done();
      });

      const it8 = 'throws an error for a non-existent follow';
      it(it8, async (done) => {
        Log.it(TestConstants.middleware.user.testName, invalidUnfollowTitle, it8, true);
        const usernameDetails = {
          follow: this.testUser2.username,
          username: this.testUser.username,
        };

        try {
          const result = await UserMiddleware.unfollow(this.testUser, usernameDetails);
          expect(result).not.toBeDefined();
          Log.log(
            TestConstants.middleware.user.testName,
            invalidUnfollowTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message)
            .toBe(Constants.middleware.user.messages.errors.doNotFollowUser);
          Log.log(TestConstants.middleware.user.testName, invalidUnfollowTitle, error.details);
        }

        Log.it(TestConstants.middleware.user.testName, invalidUnfollowTitle, it8, false);
        done();
      });
    });

    const invalidRemoveFollowerTitle = 'Invalid remove follower';
    describe(invalidRemoveFollowerTitle, () => {
      beforeEach(() => {
        Log.beforeEach(TestConstants.middleware.user.testName, invalidRemoveFollowerTitle, true);
        this.invalidUsername = TestConstants.params.invalidChars.percent;
        Log.beforeEach(TestConstants.middleware.user.testName, invalidRemoveFollowerTitle, false);
      });

      afterEach(() => {
        Log.afterEach(TestConstants.middleware.user.testName, invalidRemoveFollowerTitle, true);
        delete this.invalidUsername;
        Log.afterEach(TestConstants.middleware.user.testName, invalidRemoveFollowerTitle, false);
      });

      const it1 = 'throws an error for an invalid current user';
      it(it1, async (done) => {
        Log.it(TestConstants.middleware.user.testName, invalidRemoveFollowerTitle, it1, true);
        const usernameDetails = {
          username: this.testUser.username,
          follower: this.testUser2.username,
        };

        try {
          const result = await UserMiddleware.removeFollower(null, usernameDetails);
          expect(result).not.toBeDefined();
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRemoveFollowerTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.Server.type);
          expect(error.details.error.message).toBe(DroppError.type.Server.message);
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRemoveFollowerTitle,
            error.details
          );
        }

        Log.it(TestConstants.middleware.user.testName, invalidRemoveFollowerTitle, it1, false);
        done();
      });

      const it2 = 'throws an error for an invalid username details argument';
      it(it2, async (done) => {
        Log.it(TestConstants.middleware.user.testName, invalidRemoveFollowerTitle, it2, true);
        try {
          const result = await UserMiddleware.removeFollower(this.testUser, null);
          expect(result).not.toBeDefined();
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRemoveFollowerTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
          expect(error.details.error.message)
            .toBe(`${Constants.params.username},${Constants.params.follower}`);
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRemoveFollowerTitle,
            error.details
          );
        }

        Log.it(TestConstants.middleware.user.testName, invalidRemoveFollowerTitle, it2, false);
        done();
      });

      const it3 = 'throws an error for accessing a different user\'s followers';
      it(it3, async (done) => {
        Log.it(TestConstants.middleware.user.testName, invalidRemoveFollowerTitle, it3, true);
        const usernameDetails = {
          follower: this.testUser2.username,
          username: this.testUser2.username,
        };

        try {
          const result = await UserMiddleware.removeFollower(this.testUser, usernameDetails);
          expect(result).not.toBeDefined();
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRemoveFollowerTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message)
            .toBe(Constants.middleware.messages.unauthorizedAccess);
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRemoveFollowerTitle,
            error.details
          );
        }

        Log.it(TestConstants.middleware.user.testName, invalidRemoveFollowerTitle, it3, false);
        done();
      });

      const it4 = 'throws an error for attempting to remove the same follower';
      it(it4, async (done) => {
        Log.it(TestConstants.middleware.user.testName, invalidRemoveFollowerTitle, it4, true);
        const usernameDetails = {
          follower: this.testUser.username,
          username: this.testUser.username,
        };

        try {
          const result = await UserMiddleware.removeFollower(this.testUser, usernameDetails);
          expect(result).not.toBeDefined();
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRemoveFollowerTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message)
            .toBe(Constants.middleware.user.messages.errors.cannotRemoveFollowerSelf);
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRemoveFollowerTitle,
            error.details
          );
        }

        Log.it(TestConstants.middleware.user.testName, invalidRemoveFollowerTitle, it4, false);
        done();
      });

      const it5 = 'throws an error for a non-existent user';
      it(it5, async (done) => {
        Log.it(TestConstants.middleware.user.testName, invalidRemoveFollowerTitle, it5, true);
        const usernameDetails = {
          follower: Utils.newUuid(),
          username: this.testUser.username,
        };

        try {
          const result = await UserMiddleware.removeFollower(this.testUser, usernameDetails);
          expect(result).not.toBeDefined();
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRemoveFollowerTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.ResourceDNE.type);
          expect(error.details.error.message)
            .toBe(TestConstants.messages.doesNotExist(Constants.params.user));
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRemoveFollowerTitle,
            error.details
          );
        }

        Log.it(TestConstants.middleware.user.testName, invalidRemoveFollowerTitle, it5, false);
        done();
      });

      const it6 = 'throws an error for a non-existent follower';
      it(it6, async (done) => {
        Log.it(TestConstants.middleware.user.testName, invalidRemoveFollowerTitle, it6, true);
        const usernameDetails = {
          username: this.testUser.username,
          follower: this.testUser2.username,
        };

        try {
          const result = await UserMiddleware.removeFollower(this.testUser, usernameDetails);
          expect(result).not.toBeDefined();
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRemoveFollowerTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.dropp.name);
          expect(error.details.error.type).toBe(DroppError.type.Resource.type);
          expect(error.details.error.message)
            .toBe(Constants.middleware.user.messages.errors.userDoesNotFollowYou);
          Log.log(
            TestConstants.middleware.user.testName,
            invalidRemoveFollowerTitle,
            error.details
          );
        }

        Log.it(TestConstants.middleware.user.testName, invalidRemoveFollowerTitle, it6, false);
        done();
      });
    });
  });

  const removeUserTitle = 'Remove user';
  describe(removeUserTitle, () => {
    beforeEach(async (done) => {
      Log.beforeEach(TestConstants.middleware.user.testName, removeUserTitle, true);
      const droppInfo = {
        text: TestConstants.params.test,
        media: 'true',
        base64Data: `${Constants.media.base64DataTypes.png}${TestConstants.media.base64DataTypes.test}`,
        location: {
          latitude: TestConstants.params.defaultLocationString,
          longitude: TestConstants.params.defaultLocationString,
        },
      };

      const result = await DroppMiddleware.create(this.newUser, droppInfo);
      this.dropp = new Dropp(result.success.dropp);
      Log.beforeEach(TestConstants.middleware.user.testName, removeUserTitle, false);
      done();
    });

    afterEach(async (done) => {
      Log.afterEach(TestConstants.middleware.user.testName, removeUserTitle, true);
      if (Utils.hasValue(this.dropp)) await DroppAccessor.remove(this.dropp);
      Log.afterEach(TestConstants.middleware.user.testName, removeUserTitle, false);
      done();
    });

    const it1 = 'removes a user';
    it(it1, async (done) => {
      Log.it(TestConstants.middleware.user.testName, removeUserTitle, it1, true);
      const result = await UserMiddleware.remove(this.newUser, { username: this.newUser.username });
      expect(result.success.message).toBe(Constants.middleware.user.messages.success.remove);
      expect(result.mediaRemovalError).not.toBeDefined();

      // Verify results from backend
      const dropp = await DroppAccessor.get(this.dropp.id);
      expect(dropp).toBeNull();
      try {
        const media = await CloudStorage.get(
          Constants.middleware.dropp.cloudStorageFolder,
          this.dropp.id
        );
        expect(media).not.toBeDefined();
        Log.log(
          TestConstants.middleware.user.testName,
          removeUserTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.storage.name);
        expect(error.details.type).toBe(StorageError.type.FileDoesNotExist.type);
        Log.log(TestConstants.middleware.user.testName, removeUserTitle, error.details);
      }

      try {
        const user = await UserMiddleware.get(this.testUser, { username: this.newUser.username });
        expect(user).not.toBeDefined();
        Log.log(
          TestConstants.middleware.user.testName,
          removeUserTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (retrieveUserError) {
        expect(retrieveUserError.name).toBe(Constants.errors.dropp.name);
        expect(retrieveUserError.statusCode).toBe(DroppError.type.ResourceDNE.status);
        Log.log(TestConstants.middleware.user.testName, removeUserTitle, retrieveUserError);
      }

      this.dropp = null;
      Log.it(TestConstants.middleware.user.testName, removeUserTitle, it1, false);
      done();
    });
  });

  const invalidRemoveTitle = 'Invalid remove user';
  describe(invalidRemoveTitle, () => {
    beforeEach(() => {
      Log.beforeEach(TestConstants.middleware.user.testName, invalidRemoveTitle, true);
      this.invalidUsername = TestConstants.params.invalidChars.percent;
      Log.beforeEach(TestConstants.middleware.user.testName, invalidRemoveTitle, false);
    });

    afterEach(() => {
      Log.afterEach(TestConstants.middleware.user.testName, invalidRemoveTitle, true);
      delete this.invalidUsername;
      Log.afterEach(TestConstants.middleware.user.testName, invalidRemoveTitle, false);
    });

    const it1 = 'throws an error for an invalid current user';
    it(it1, async (done) => {
      Log.it(TestConstants.middleware.user.testName, invalidRemoveTitle, it1, true);
      try {
        const result = await UserMiddleware.remove(null, { username: this.invalidUsername });
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.user.testName,
          invalidRemoveTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(TestConstants.middleware.user.testName, invalidRemoveTitle, error.details);
      }

      Log.it(TestConstants.middleware.user.testName, invalidRemoveTitle, it1, false);
      done();
    });

    const it2 = 'throws an error for invalid username details';
    it(it2, async (done) => {
      Log.it(TestConstants.middleware.user.testName, invalidRemoveTitle, it2, true);
      try {
        const result = await UserMiddleware.remove(this.testUser, null);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.user.testName,
          invalidRemoveTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe(Constants.params.username);
        Log.log(TestConstants.middleware.user.testName, invalidRemoveTitle, error.details);
      }

      Log.it(TestConstants.middleware.user.testName, invalidRemoveTitle, it2, false);
      done();
    });

    const it3 = 'throws an error for an invalid username';
    it(it3, async (done) => {
      Log.it(TestConstants.middleware.user.testName, invalidRemoveTitle, it3, true);
      const details = { username: this.invalidUsername };
      try {
        const result = await UserMiddleware.remove(this.testUser, details);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.user.testName,
          invalidRemoveTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe(Constants.params.username);
        Log.log(TestConstants.middleware.user.testName, invalidRemoveTitle, error.details);
      }

      Log.it(TestConstants.middleware.user.testName, invalidRemoveTitle, it3, false);
      done();
    });

    const it4 = 'throws an error for a missing username';
    it(it4, async (done) => {
      Log.it(TestConstants.middleware.user.testName, invalidRemoveTitle, it4, true);
      delete this.invalidUsername;
      const details = { username: this.invalidUsername };
      try {
        const result = await UserMiddleware.remove(this.testUser, details);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.user.testName,
          invalidRemoveTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe(Constants.params.username);
        Log.log(TestConstants.middleware.user.testName, invalidRemoveTitle, error.details);
      }

      Log.it(TestConstants.middleware.user.testName, invalidRemoveTitle, it4, false);
      done();
    });

    const it5 = 'throws an error for a different user';
    it(it5, async (done) => {
      Log.it(TestConstants.middleware.user.testName, invalidRemoveTitle, it5, true);
      const details = { username: TestConstants.params.test };
      try {
        const result = await UserMiddleware.remove(this.testUser, details);
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.user.testName,
          invalidRemoveTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.Resource.type);
        expect(error.details.error.message)
          .toBe(Constants.middleware.messages.unauthorizedAccess);
        Log.log(TestConstants.middleware.user.testName, invalidRemoveTitle, error.details);
      }

      Log.it(TestConstants.middleware.user.testName, invalidRemoveTitle, it5, false);
      done();
    });

    const it6 = 'throws an error for a non-existent user';
    it(it6, async (done) => {
      Log.it(TestConstants.middleware.user.testName, invalidRemoveTitle, it6, true);
      const user = new User({
        username: TestConstants.params.test,
        email: TestConstants.params.testEmail,
      });

      try {
        const result = await UserMiddleware.remove(user, { username: user.username });
        expect(result).not.toBeDefined();
        Log.log(
          TestConstants.middleware.user.testName,
          invalidRemoveTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(TestConstants.middleware.user.testName, invalidRemoveTitle, error.details);
      }

      Log.it(TestConstants.middleware.user.testName, invalidRemoveTitle, it6, false);
      done();
    });
  });
});

const Log = require('../../logger');
const Server = require('../../../index');
const User = require('../../../src/models/User');
const Request = require('request-promise-native');
const Dropp = require('../../../src/models/Dropp');
const Utils = require('../../../src/utilities/utils');
const Location = require('../../../src/models/Location');
const UserAccessor = require('../../../src/database/user');
const DroppError = require('../../../src/errors/DroppError');
const DroppAccessor = require('../../../src/database/dropp');
const Constants = require('../../../src/utilities/constants');
const AuthModule = require('../../../src/authentication/auth');
const UserMiddleware = require('../../../src/middleware/user');

const testName = 'Router Module';
const url = `http://localhost:${Server.port}/users`;
const postUserRouteTitle = 'Post user route';
/* eslint-disable no-undef */
describe(postUserRouteTitle, () => {
  beforeEach(() => {
    Log.beforeEach(testName, postUserRouteTitle, true);
    this.deleteUser = false;
    this.username = Utils.newUuid();
    this.password = Utils.newUuid();
    this.email = `${Utils.newUuid()}@${Utils.newUuid()}.com`;
    this.options = {
      method: 'POST',
      uri: url,
      resolveWithFullResponse: true,
      form: {
        email: this.email,
        username: this.username,
        password: this.password,
      },
    };

    Log.beforeEach(testName, postUserRouteTitle, false);
  });

  afterEach(async (done) => {
    Log.afterEach(testName, postUserRouteTitle, true);
    if (this.deleteUser === true) {
      const user = await UserAccessor.get(this.username);
      await UserAccessor.remove(user);
    }

    delete this.email;
    delete this.username;
    delete this.password;
    delete this.options;
    delete this.deleteUser;
    Log.afterEach(testName, postUserRouteTitle, false);
    done();
  });

  const it1 = 'returns an error for an invalid username';
  it(it1, async (done) => {
    Log.it(testName, postUserRouteTitle, it1, true);
    delete this.options.form.username;
    try {
      const response = await Request(this.options);
      expect(response).not.toBeDefined();
      Log.log(testName, postUserRouteTitle, 'Should have thrown error');
    } catch (response) {
      expect(response.statusCode).toBe(400);
      const details = JSON.parse(response.error);
      expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(details.error.message).toBe('username');
      Log.log(testName, postUserRouteTitle, response.error);
    }

    Log.it(testName, postUserRouteTitle, it1, false);
    done();
  });

  const it2 = 'returns an error for an invalid password';
  it(it2, async (done) => {
    Log.it(testName, postUserRouteTitle, it2, true);
    delete this.options.form.password;
    try {
      const response = await Request(this.options);
      expect(response).not.toBeDefined();
      Log.log(testName, postUserRouteTitle, 'Should have thrown error');
    } catch (response) {
      expect(response.statusCode).toBe(400);
      const details = JSON.parse(response.error);
      expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(details.error.message).toBe('password');
      Log.log(testName, postUserRouteTitle, response.error);
    }

    Log.it(testName, postUserRouteTitle, it2, false);
    done();
  });

  const it3 = 'returns an error for an invalid email';
  it(it3, async (done) => {
    Log.it(testName, postUserRouteTitle, it3, true);
    delete this.options.form.email;
    try {
      const response = await Request(this.options);
      expect(response).not.toBeDefined();
      Log.log(testName, postUserRouteTitle, 'Should have thrown error');
    } catch (response) {
      expect(response.statusCode).toBe(400);
      const details = JSON.parse(response.error);
      expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(details.error.message).toBe('email');
      Log.log(testName, postUserRouteTitle, response.error);
    }

    Log.it(testName, postUserRouteTitle, it3, false);
    done();
  });

  const it4 = 'returns an error for an invalid username, password, and email';
  it(it4, async (done) => {
    Log.it(testName, postUserRouteTitle, it4, true);
    delete this.options.form.email;
    delete this.options.form.username;
    delete this.options.form.password;
    try {
      const response = await Request(this.options);
      expect(response).not.toBeDefined();
      Log.log(testName, postUserRouteTitle, 'Should have thrown error');
    } catch (response) {
      expect(response.statusCode).toBe(400);
      const details = JSON.parse(response.error);
      expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(details.error.message).toContain('email');
      expect(details.error.message).toContain('username');
      expect(details.error.message).toContain('password');
      Log.log(testName, postUserRouteTitle, response.error);
    }

    Log.it(testName, postUserRouteTitle, it4, false);
    done();
  });

  describe('Existing user', () => {
    beforeEach(async (done) => {
      Log.beforeEach(testName, 'Existing user', true);
      this.user = new User({
        username: Utils.newUuid(),
        email: `${Utils.newUuid()}@${Utils.newUuid()}.com`,
      });

      await UserAccessor.create(this.user, Utils.newUuid());
      Log.beforeEach(testName, 'Existing user', false);
      done();
    });

    afterEach(async (done) => {
      Log.afterEach(testName, 'Existing user', true);
      await UserAccessor.remove(this.user);
      delete this.user;
      Log.afterEach(testName, 'Existing user', false);
      done();
    });

    const it5 = 'returns an error for an already existing username';
    it(it5, async (done) => {
      Log.it(testName, postUserRouteTitle, it5, true);
      this.options.form.username = this.user.username;
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, postUserRouteTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(403);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.Resource.type);
        expect(details.error.message).toBe('A user with that username already exists');
        Log.log(testName, postUserRouteTitle, response.error);
      }

      Log.it(testName, postUserRouteTitle, it5, false);
      done();
    });
  });

  const it6 = 'creates a new user and receives an authentication token';
  it(it6, async (done) => {
    Log.it(testName, postUserRouteTitle, it6, true);
    const response = await Request(this.options);
    expect(response.statusCode).toBe(201);
    const details = JSON.parse(response.body);
    expect(details.success.token.toLowerCase()).toContain('bearer');
    expect(details.success.message).toBe('Successful user creation');
    this.deleteUser = true;
    Log.log(testName, postUserRouteTitle, response.body);
    Log.it(testName, postUserRouteTitle, it6, false);
    done();
  });
});

const getUserRouteTitle = 'Get user route';
describe(getUserRouteTitle, () => {
  beforeEach(async (done) => {
    Log.beforeEach(testName, getUserRouteTitle, true);
    this.options = {
      method: 'GET',
      uri: url,
      resolveWithFullResponse: true,
      headers: {},
    };

    this.updateUrl = function updateUrl(_user) {
      this.options.uri = `${url}/${_user}`;
    };

    const details = {
      username: Utils.newUuid(),
      password: Utils.newUuid(),
      email: `${Utils.newUuid()}@${Utils.newUuid()}.com`,
    };

    this.user = await UserMiddleware.create(details);
    const authDetails = await UserMiddleware.getAuthToken(details);
    this.options.headers.authorization = authDetails.success.token;
    Log.beforeEach(testName, getUserRouteTitle, false);
    done();
  });

  afterEach(async (done) => {
    Log.afterEach(testName, getUserRouteTitle, true);
    await UserMiddleware.remove(this.user, { username: this.user.username });
    delete this.user;
    delete this.options;
    delete this.updateUrl;
    Log.afterEach(testName, getUserRouteTitle, false);
    done();
  });

  const it1 = 'returns an authentication error for a missing auth token';
  it(it1, async (done) => {
    Log.it(testName, postUserRouteTitle, it1, true);
    this.updateUrl(this.user.username);
    delete this.options.headers.authorization;
    try {
      const response = await Request(this.options);
      expect(response).not.toBeDefined();
      Log.log(testName, postUserRouteTitle, 'Should have thrown error');
    } catch (response) {
      expect(response.statusCode).toBe(401);
      const details = JSON.parse(response.error);
      expect(details.error.type).toBe(DroppError.type.Auth.type);
      expect(details.error.message).toBe(DroppError.TokenReason.missing);
      Log.log(testName, postUserRouteTitle, response.error);
    }

    Log.it(testName, postUserRouteTitle, it1, false);
    done();
  });

  const it2 = 'returns an error for an invalid username';
  it(it2, async (done) => {
    Log.it(testName, postUserRouteTitle, it2, true);
    this.updateUrl('__.');
    try {
      const response = await Request(this.options);
      expect(response).not.toBeDefined();
      Log.log(testName, postUserRouteTitle, 'Should have thrown error');
    } catch (response) {
      expect(response.statusCode).toBe(400);
      const details = JSON.parse(response.error);
      expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(details.error.message).toContain('username');
      Log.log(testName, postUserRouteTitle, response.error);
    }

    Log.it(testName, postUserRouteTitle, it2, false);
    done();
  });

  const it3 = 'returns an error for a non-existent user';
  it(it3, async (done) => {
    Log.it(testName, postUserRouteTitle, it3, true);
    this.updateUrl(Utils.newUuid());
    try {
      const response = await Request(this.options);
      expect(response).not.toBeDefined();
      Log.log(testName, postUserRouteTitle, 'Should have thrown error');
    } catch (response) {
      expect(response.statusCode).toBe(404);
      const details = JSON.parse(response.error);
      expect(details.error.type).toBe(DroppError.type.ResourceDNE.type);
      expect(details.error.message).toBe('That user does not exist');
      Log.log(testName, postUserRouteTitle, response.error);
    }

    Log.it(testName, postUserRouteTitle, it3, false);
    done();
  });

  const it4 = 'gets the user\'s private details';
  it(it4, async (done) => {
    Log.it(testName, postUserRouteTitle, it4, true);
    this.updateUrl(this.user.username);
    const response = await Request(this.options, this.auth);
    expect(response.statusCode).toBe(200);
    const details = JSON.parse(response.body);
    expect(details.email).toBe(this.user.email);
    expect(details.username).toBe(this.user.username);
    expect(Object.keys(details.follows).length).toBe(0);
    expect(Object.keys(details.followers).length).toBe(0);
    expect(details.followsCount).toBe(0);
    expect(details.followerCount).toBe(0);
    expect(Object.keys(details.followRequests).length).toBe(0);
    expect(Object.keys(details.followerRequests).length).toBe(0);
    expect(details.followRequestCount).toBe(0);
    expect(details.followerRequestCount).toBe(0);
    Log.log(testName, postUserRouteTitle, response.body);
    Log.it(testName, postUserRouteTitle, it4, false);
    done();
  });

  describe('Different user', () => {
    beforeEach(async (done) => {
      Log.beforeEach(testName, 'Different user', true);
      const details = {
        username: Utils.newUuid(),
        password: Utils.newUuid(),
        email: `${Utils.newUuid()}@${Utils.newUuid()}.com`,
      };

      this.user2 = await UserMiddleware.create(details);
      Log.beforeEach(testName, 'Different user', false);
      done();
    });

    afterEach(async (done) => {
      Log.afterEach(testName, 'Different user', true);
      await UserMiddleware.remove(this.user2, { username: this.user2.username });
      delete this.user2;
      Log.afterEach(testName, 'Different user', false);
      done();
    });

    const it5 = 'gets the user\'s public details';
    it(it5, async (done) => {
      Log.it(testName, postUserRouteTitle, it5, true);
      this.updateUrl(this.user2.username);
      const response = await Request(this.options, this.auth);
      expect(response.statusCode).toBe(200);
      const details = JSON.parse(response.body);
      expect(details.username).toBe(this.user2.username);
      expect(Object.keys(details.follows).length).toBe(0);
      expect(Object.keys(details.followers).length).toBe(0);
      expect(details.followsCount).toBe(0);
      expect(details.followerCount).toBe(0);
      expect(details.email).not.toBeDefined();
      expect(details.followRequests).not.toBeDefined();
      expect(details.followerRequests).not.toBeDefined();
      expect(details.followRequestCount).not.toBeDefined();
      expect(details.followerRequestCount).not.toBeDefined();
      Log.log(testName, postUserRouteTitle, response.body);
      Log.it(testName, postUserRouteTitle, it5, false);
      done();
    });
  });
});

const updateUserRouteTitle = 'Update user route';
describe(updateUserRouteTitle, () => {
  beforeEach(async (done) => {
    Log.beforeEach(testName, updateUserRouteTitle, true);
    this.oldPassword = Utils.newUuid();
    this.options = {
      method: 'PUT',
      uri: url,
      resolveWithFullResponse: true,
      headers: {},
      form: {
        newPassword: Utils.newUuid(),
        oldPassword: this.oldPassword,
        newEmail: `${Utils.newUuid()}@${Utils.newUuid()}.com`,
      },
    };

    this.updateUrl = function updateUrl(_user, _attribute) {
      this.options.uri = `${url}/${_user}/${_attribute}`;
    };

    const details = {
      username: Utils.newUuid(),
      password: this.oldPassword,
      email: `${Utils.newUuid()}@${Utils.newUuid()}.com`,
    };

    this.user = await UserMiddleware.create(details);
    const authDetails = await UserMiddleware.getAuthToken(details);
    this.options.headers.authorization = authDetails.success.token;
    Log.beforeEach(testName, updateUserRouteTitle, false);
    done();
  });

  afterEach(async (done) => {
    Log.afterEach(testName, updateUserRouteTitle, true);
    await UserMiddleware.remove(this.user, { username: this.user.username });
    delete this.user;
    delete this.options;
    delete this.updateUrl;
    delete this.oldPassword;
    Log.afterEach(testName, updateUserRouteTitle, false);
    done();
  });

  const updateEmailTitle = 'Update email';
  describe(updateEmailTitle, () => {
    const it1 = 'returns an authentication error for a missing auth token';
    it(it1, async (done) => {
      Log.it(testName, updateEmailTitle, it1, true);
      this.updateUrl(this.user.username, 'email');
      delete this.options.headers.authorization;
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, updateEmailTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(401);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.Auth.type);
        expect(details.error.message).toBe(DroppError.TokenReason.missing);
        Log.log(testName, updateEmailTitle, response.error);
      }

      Log.it(testName, updateEmailTitle, it1, false);
      done();
    });

    const it2 = 'returns an error for an invalid email';
    it(it2, async (done) => {
      Log.it(testName, updateEmailTitle, it2, true);
      delete this.options.form.newEmail;
      this.updateUrl(this.user.username, 'email');
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, updateEmailTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(400);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(details.error.message).toBe('newEmail');
        Log.log(testName, updateEmailTitle, response.error);
      }

      Log.it(testName, updateEmailTitle, it2, false);
      done();
    });

    const it3 = 'returns an error for updating a different user';
    it(it3, async (done) => {
      Log.it(testName, updateEmailTitle, it3, true);
      this.updateUrl(Utils.newUuid(), 'email');
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, updateEmailTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(403);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.Resource.type);
        expect(details.error.message).toBe('Unauthorized to access that');
        Log.log(testName, updateEmailTitle, response.error);
      }

      Log.it(testName, updateEmailTitle, it3, false);
      done();
    });

    const it4 = 'updates the user\'s email address';
    it(it4, async (done) => {
      Log.it(testName, updateEmailTitle, it4, true);
      this.updateUrl(this.user.username, 'email');
      const response = await Request(this.options);
      expect(response.statusCode).toBe(200);
      const details = JSON.parse(response.body);
      expect(details.success.message).toBe('Successful email update');

      // Verify user information from the backend
      const userData = await UserMiddleware.get(this.user, { username: this.user.username });
      expect(userData.email).toBe(this.options.form.newEmail);
      Log.log(testName, updateEmailTitle, response.body);
      Log.it(testName, updateEmailTitle, it4, false);
      done();
    });
  });

  const updatePasswordTitle = 'Upate password';
  describe(updatePasswordTitle, () => {
    const it1 = 'returns an authentication error for a missing auth token';
    it(it1, async (done) => {
      Log.it(testName, updatePasswordTitle, it1, true);
      this.updateUrl(this.user.username, 'password');
      delete this.options.headers.authorization;
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, updatePasswordTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(401);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.Auth.type);
        expect(details.error.message).toBe(DroppError.TokenReason.missing);
        Log.log(testName, updatePasswordTitle, response.error);
      }

      Log.it(testName, updatePasswordTitle, it1, false);
      done();
    });

    const it2 = 'returns an error for an invalid old password';
    it(it2, async (done) => {
      Log.it(testName, updatePasswordTitle, it2, true);
      delete this.options.form.oldPassword;
      this.updateUrl(this.user.username, 'password');
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, updatePasswordTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(400);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(details.error.message).toBe('oldPassword');
        Log.log(testName, updatePasswordTitle, response.error);
      }

      Log.it(testName, updatePasswordTitle, it2, false);
      done();
    });

    const it3 = 'returns an error for an invalid new password';
    it(it3, async (done) => {
      Log.it(testName, updatePasswordTitle, it3, true);
      delete this.options.form.newPassword;
      this.updateUrl(this.user.username, 'password');
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, updatePasswordTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(400);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(details.error.message).toBe('newPassword');
        Log.log(testName, updatePasswordTitle, response.error);
      }

      Log.it(testName, updatePasswordTitle, it3, false);
      done();
    });

    const it4 = 'returns an error for an invalid old & new password';
    it(it4, async (done) => {
      Log.it(testName, updatePasswordTitle, it4, true);
      delete this.options.form.oldPassword;
      delete this.options.form.newPassword;
      this.updateUrl(this.user.username, 'password');
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, updatePasswordTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(400);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(details.error.message).toContain('oldPassword');
        expect(details.error.message).toContain('newPassword');
        Log.log(testName, updatePasswordTitle, response.error);
      }

      Log.it(testName, updatePasswordTitle, it4, false);
      done();
    });

    const it5 = 'returns an error when the old & new passwords are the same';
    it(it5, async (done) => {
      Log.it(testName, updatePasswordTitle, it5, true);
      this.options.form.newPassword = this.options.form.oldPassword;
      this.updateUrl(this.user.username, 'password');
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, updatePasswordTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(403);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.Resource.type);
        expect(details.error.message).toBe('New value must be different than existing value');
        Log.log(testName, updatePasswordTitle, response.error);
      }

      Log.it(testName, updatePasswordTitle, it5, false);
      done();
    });

    const it6 = 'returns an error for updating a different user';
    it(it6, async (done) => {
      Log.it(testName, updatePasswordTitle, it6, true);
      this.updateUrl(Utils.newUuid(), 'password');
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, updatePasswordTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(403);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.Resource.type);
        expect(details.error.message).toBe('Unauthorized to access that');
        Log.log(testName, updatePasswordTitle, response.error);
      }

      Log.it(testName, updatePasswordTitle, it6, false);
      done();
    });

    const it65 = 'returns an error when the old password doesn\'t match the existing password';
    it(it65, async (done) => {
      Log.it(testName, updatePasswordTitle, it65, true);
      this.options.form.oldPassword = Utils.newUuid();
      this.updateUrl(this.user.username, 'password');
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, updatePasswordTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(403);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.Resource.type);
        expect(details.error.message).toBe('Old password must match existing password');
        Log.log(testName, updatePasswordTitle, response.error);
      }

      Log.it(testName, updatePasswordTitle, it65, false);
      done();
    });

    describe('Successful update', () => {
      beforeEach(async (done) => {
        Log.beforeEach(testName, 'Successful update', true);
        this.oldHashedPassword = await UserAccessor.getPassword(this.user.username);
        Log.beforeEach(testName, 'Successful update', false);
        done();
      });

      afterEach(() => {
        Log.afterEach(testName, 'Successful update', true);
        delete this.oldHashedPassword;
        Log.afterEach(testName, 'Successful update', false);
      });
    });

    const it7 = 'updates the user\'s password';
    it(it7, async (done) => {
      Log.it(testName, updatePasswordTitle, it7, true);
      this.updateUrl(this.user.username, 'password');
      const response = await Request(this.options);
      expect(response.statusCode).toBe(200);
      const details = JSON.parse(response.body);
      expect(details.success.message).toBe('Successful password update');
      expect(details.success.token.toLowerCase()).toContain('bearer');

      // Verify user information from the backend
      const newPassword = await UserAccessor.getPassword(this.user.username);
      expect(newPassword).not.toBe(this.oldHashedPassword);
      const matchResult = await AuthModule.validatePasswords(
        this.options.form.newPassword,
        newPassword
      );
      expect(matchResult).toBe(true);
      Log.log(testName, updatePasswordTitle, response.body);
      Log.it(testName, updatePasswordTitle, it7, false);
      done();
    });
  });
});

const removeUserTitle = 'Remove user route';
describe(removeUserTitle, () => {
  beforeEach(async (done) => {
    Log.beforeEach(testName, removeUserTitle, true);
    this.shouldDeleteUser = true;
    this.options = {
      method: 'DELETE',
      uri: url,
      resolveWithFullResponse: true,
      headers: {},
    };

    this.updateUrl = function updateUrl(_user) {
      this.options.uri = `${url}/${_user}`;
    };

    const details = {
      username: Utils.newUuid(),
      password: Utils.newUuid(),
      email: `${Utils.newUuid()}@${Utils.newUuid()}.com`,
    };

    this.user = await UserMiddleware.create(details);
    const authDetails = await UserMiddleware.getAuthToken(details);
    this.options.headers.authorization = authDetails.success.token;

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
    Log.beforeEach(testName, removeUserTitle, false);
    done();
  });

  afterEach(async (done) => {
    Log.afterEach(testName, removeUserTitle, true);
    if (this.shouldDeleteUser === true) {
      await UserMiddleware.remove(this.user, { username: this.user.username });
    }

    delete this.user;
    delete this.options;
    delete this.updateUrl;
    delete this.shouldDeleteUser;
    Log.afterEach(testName, removeUserTitle, false);
    done();
  });

  const it1 = 'returns an authentication error for a missing auth token';
  it(it1, async (done) => {
    Log.it(testName, removeUserTitle, it1, true);
    this.updateUrl(this.user.username);
    delete this.options.headers.authorization;
    try {
      const response = await Request(this.options);
      expect(response).not.toBeDefined();
      Log.log(testName, removeUserTitle, 'Should have thrown error');
    } catch (response) {
      expect(response.statusCode).toBe(401);
      const details = JSON.parse(response.error);
      expect(details.error.type).toBe(DroppError.type.Auth.type);
      expect(details.error.message).toBe(DroppError.TokenReason.missing);
      Log.log(testName, removeUserTitle, response.error);
    }

    Log.it(testName, removeUserTitle, it1, false);
    done();
  });

  const it2 = 'returns an error for an invalid username';
  it(it2, async (done) => {
    Log.it(testName, removeUserTitle, it2, true);
    this.updateUrl('__.');
    try {
      const response = await Request(this.options);
      expect(response).not.toBeDefined();
      Log.log(testName, removeUserTitle, 'Should have thrown error');
    } catch (response) {
      expect(response.statusCode).toBe(400);
      const details = JSON.parse(response.error);
      expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(details.error.message).toBe('username');
      Log.log(testName, removeUserTitle, response.error);
    }

    Log.it(testName, removeUserTitle, it2, false);
    done();
  });

  const it3 = 'returns an error for removing a different user';
  it(it3, async (done) => {
    Log.it(testName, removeUserTitle, it3, true);
    this.updateUrl(Utils.newUuid());
    try {
      const response = await Request(this.options);
      expect(response).not.toBeDefined();
      Log.log(testName, removeUserTitle, 'Should have thrown error');
    } catch (response) {
      expect(response.statusCode).toBe(403);
      const details = JSON.parse(response.error);
      expect(details.error.type).toBe(DroppError.type.Resource.type);
      expect(details.error.message).toBe('Unauthorized to access that');
      Log.log(testName, removeUserTitle, response.error);
    }

    Log.it(testName, removeUserTitle, it3, false);
    done();
  });

  const it4 = 'removes a user';
  it(it4, async (done) => {
    Log.it(testName, removeUserTitle, it4, true);
    this.updateUrl(this.user.username);
    const response = await Request(this.options);
    expect(response.statusCode).toBe(200);
    const details = JSON.parse(response.body);
    expect(details.success.message).toBe('Successfully removed all user data');

    // Verify user information from the backend
    const result = await UserAccessor.get(this.user.username);
    expect(result).toBeNull();
    const dropp = await DroppAccessor.get(this.dropp.id);
    expect(dropp).toBeNull();
    this.shouldDeleteUser = Utils.hasValue(result);
    Log.log(testName, removeUserTitle, response.body);
    Log.it(testName, removeUserTitle, it4, false);
    done();
  });
});

const interUserRoutes = 'Inter-user routes';
describe(interUserRoutes, () => {
  beforeEach(async (done) => {
    Log.beforeEach(testName, interUserRoutes, true);
    this.details1 = {
      username: Utils.newUuid(),
      password: Utils.newUuid(),
      email: `${Utils.newUuid()}@${Utils.newUuid()}.com`,
    };

    this.details2 = {
      username: Utils.newUuid(),
      password: Utils.newUuid(),
      email: `${Utils.newUuid()}@${Utils.newUuid()}.com`,
    };

    this.user1 = await UserMiddleware.create(this.details1);
    this.user2 = await UserMiddleware.create(this.details2);
    Log.beforeEach(testName, interUserRoutes, false);
    done();
  });

  afterEach(async (done) => {
    Log.afterEach(testName, interUserRoutes, true);
    await UserMiddleware.remove(this.user1, { username: this.user1.username });
    await UserMiddleware.remove(this.user2, { username: this.user2.username });
    delete this.user1;
    delete this.user2;
    delete this.details1;
    delete this.details2;
    Log.afterEach(testName, interUserRoutes, false);
    done();
  });

  const requestToFollowTitle = 'Request to follow';
  describe(requestToFollowTitle, () => {
    beforeEach(async (done) => {
      Log.beforeEach(testName, requestToFollowTitle, true);
      this.options = {
        method: 'POST',
        uri: url,
        resolveWithFullResponse: true,
        headers: {},
        form: {},
      };

      this.updateUrl = function updateUrl(_user) {
        this.options.uri = `${url}/${_user}/follows/requests`;
      };

      const authDetails = await UserMiddleware.getAuthToken(this.details1);
      this.options.headers.authorization = authDetails.success.token;
      Log.beforeEach(testName, requestToFollowTitle, false);
      done();
    });

    afterEach(() => {
      Log.afterEach(testName, removeUserTitle, true);
      delete this.options;
      delete this.updateUrl;
      Log.afterEach(testName, removeUserTitle, false);
    });

    const it1 = 'returns an authentication error for a missing auth token';
    it(it1, async (done) => {
      Log.it(testName, removeUserTitle, it1, true);
      this.updateUrl(this.user1.username);
      this.options.form.requestedUser = this.user2.username;
      delete this.options.headers.authorization;
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, requestToFollowTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(401);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.Auth.type);
        expect(details.error.message).toBe(DroppError.TokenReason.missing);
        Log.log(testName, requestToFollowTitle, response.error);
      }

      Log.it(testName, removeUserTitle, it1, false);
      done();
    });

    const it2 = 'returns an error for an invalid username';
    it(it2, async (done) => {
      Log.it(testName, requestToFollowTitle, it2, true);
      this.updateUrl('__.');
      this.options.form.requestedUser = this.user2.username;
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, requestToFollowTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(400);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(details.error.message).toBe('username');
        Log.log(testName, requestToFollowTitle, response.error);
      }

      Log.it(testName, requestToFollowTitle, it2, false);
      done();
    });

    const it3 = 'returns an error for an invalid requested username';
    it(it3, async (done) => {
      Log.it(testName, requestToFollowTitle, it3, true);
      this.updateUrl(this.user1.username);
      this.options.form.requestedUser = '__.';
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, requestToFollowTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(400);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(details.error.message).toBe('requestedUser');
        Log.log(testName, requestToFollowTitle, response.error);
      }

      Log.it(testName, requestToFollowTitle, it3, false);
      done();
    });

    const it35 = 'returns an error for attempting to access a different user\'s follow requests';
    it(it35, async (done) => {
      Log.it(testName, requestToFollowTitle, it35, true);
      this.updateUrl(this.user2.username);
      this.options.form.requestedUser = this.user2.username;
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, requestToFollowTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(403);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.Resource.type);
        expect(details.error.message).toBe('Unauthorized to access that');
        Log.log(testName, requestToFollowTitle, response.error);
      }

      Log.it(testName, requestToFollowTitle, it35, false);
      done();
    });

    const it4 = 'returns an error for requesting to follow the same user';
    it(it4, async (done) => {
      Log.it(testName, requestToFollowTitle, it4, true);
      this.updateUrl(this.user1.username);
      this.options.form.requestedUser = this.user1.username;
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, requestToFollowTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(403);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.Resource.type);
        expect(details.error.message).toBe('You cannot request to follow yourself');
        Log.log(testName, requestToFollowTitle, response.error);
      }

      Log.it(testName, requestToFollowTitle, it4, false);
      done();
    });

    const it5 = 'returns an error for a non-existent user';
    it(it5, async (done) => {
      Log.it(testName, requestToFollowTitle, it5, true);
      this.updateUrl(this.user1.username);
      this.options.form.requestedUser = Utils.newUuid();
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, requestToFollowTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(404);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.ResourceDNE.type);
        expect(details.error.message).toBe('That user does not exist');
        Log.log(testName, requestToFollowTitle, response.error);
      }

      Log.it(testName, requestToFollowTitle, it5, false);
      done();
    });

    const existingFollowRequestTitle = 'Existing follow request';
    describe(existingFollowRequestTitle, () => {
      beforeEach(async (done) => {
        Log.beforeEach(testName, existingFollowRequestTitle, true);
        await UserAccessor.addFollowRequest(this.user1, this.user2);
        Log.beforeEach(testName, existingFollowRequestTitle, false);
        done();
      });

      afterEach(async (done) => {
        Log.afterEach(testName, existingFollowRequestTitle, true);
        await UserAccessor.removeFollowRequest(this.user1, this.user2);
        done();
      });

      const it6 = 'returns an error for an existing follow request';
      it(it6, async (done) => {
        Log.it(testName, existingFollowRequestTitle, it6, true);
        this.updateUrl(this.user1.username);
        this.options.form.requestedUser = this.user2.username;
        try {
          const response = await Request(this.options);
          expect(response).not.toBeDefined();
          Log.log(testName, existingFollowRequestTitle, 'Should have thrown error');
        } catch (response) {
          expect(response.statusCode).toBe(403);
          const details = JSON.parse(response.error);
          expect(details.error.type).toBe(DroppError.type.Resource.type);
          expect(details.error.message).toBe('You already have a pending follow request for that user');
          Log.log(testName, existingFollowRequestTitle, response.error);
        }

        Log.it(testName, existingFollowRequestTitle, it6, false);
        done();
      });
    });

    const successFollowRequestTitle = 'Success follow request';
    describe(successFollowRequestTitle, () => {
      afterEach(async (done) => {
        Log.afterEach(testName, successFollowRequestTitle, true);
        await UserAccessor.removeFollowRequest(this.user1, this.user2);
        Log.afterEach(testName, successFollowRequestTitle, false);
        done();
      });

      const it7 = 'sends a request to follow a user';
      it(it7, async (done) => {
        Log.it(testName, successFollowRequestTitle, it7, true);
        this.updateUrl(this.user1.username);
        this.options.form.requestedUser = this.user2.username;
        const response = await Request(this.options);
        expect(response.statusCode).toBe(200);
        const details = JSON.parse(response.body);
        expect(details.success.message).toBe('Successful follow request');

        // Verify user information from the backend
        const user = await UserAccessor.get(this.user2.username);
        expect(user.hasFollowerRequest(this.user1.username)).toBe(true);
        Log.log(testName, successFollowRequestTitle, response.body);
        Log.it(testName, successFollowRequestTitle, it7, false);
        done();
      });
    });
  });

  const removeFollowRequestTitle = 'Remove follow request';
  describe(removeFollowRequestTitle, () => {
    beforeEach(async (done) => {
      Log.beforeEach(testName, removeFollowRequestTitle, true);
      this.options = {
        method: 'DELETE',
        uri: url,
        resolveWithFullResponse: true,
        headers: {},
        form: {},
      };

      this.updateUrl = function updateUrl(_user, _requestedUser) {
        this.options.uri = `${url}/${_user}/follows/requests/${_requestedUser}`;
      };

      const authDetails = await UserMiddleware.getAuthToken(this.details1);
      this.options.headers.authorization = authDetails.success.token;
      Log.beforeEach(testName, removeFollowRequestTitle, false);
      done();
    });

    afterEach(() => {
      Log.afterEach(testName, removeFollowRequestTitle, true);
      delete this.options;
      delete this.updateUrl;
      Log.afterEach(testName, removeFollowRequestTitle, false);
    });

    const it8 = 'returns an authentication error for a missing auth token';
    it(it8, async (done) => {
      Log.it(testName, removeFollowRequestTitle, it8, true);
      this.updateUrl(this.user1.username, this.user2.username);
      delete this.options.headers.authorization;
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, removeFollowRequestTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(401);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.Auth.type);
        expect(details.error.message).toBe(DroppError.TokenReason.missing);
        Log.log(testName, removeFollowRequestTitle, response.error);
      }

      Log.it(testName, removeFollowRequestTitle, it8, false);
      done();
    });

    const it9 = 'returns an error for an invalid username';
    it(it9, async (done) => {
      Log.it(testName, removeFollowRequestTitle, it9, true);
      this.updateUrl('__.', this.user2.username);
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, removeFollowRequestTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(400);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(details.error.message).toBe('username');
        Log.log(testName, removeFollowRequestTitle, response.error);
      }

      Log.it(testName, removeFollowRequestTitle, it9, false);
      done();
    });

    const it10 = 'returns an error for an invalid requested username';
    it(it10, async (done) => {
      Log.it(testName, removeFollowRequestTitle, it10, true);
      this.updateUrl(this.user1.username, '__.');

      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, removeFollowRequestTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(400);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(details.error.message).toBe('requestedUser');
        Log.log(testName, removeFollowRequestTitle, response.error);
      }

      Log.it(testName, removeFollowRequestTitle, it10, false);
      done();
    });

    const it11 = 'returns an error for an invalid username and requested username';
    it(it11, async (done) => {
      Log.it(testName, removeFollowRequestTitle, it11, true);
      this.updateUrl('__.', '__.');

      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, removeFollowRequestTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(400);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(details.error.message).toBe('username,requestedUser');
        Log.log(testName, removeFollowRequestTitle, response.error);
      }

      Log.it(testName, removeFollowRequestTitle, it11, false);
      done();
    });

    const it115 = 'returns an error for attempting to access a different user\'s follow requests';
    it(it115, async (done) => {
      Log.it(testName, removeFollowRequestTitle, it115, true);
      this.updateUrl(this.user2.username, this.user2.username);
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, removeFollowRequestTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(403);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.Resource.type);
        expect(details.error.message).toBe('Unauthorized to access that');
        Log.log(testName, removeFollowRequestTitle, response.error);
      }

      Log.it(testName, removeFollowRequestTitle, it115, false);
      done();
    });

    const it116 = 'returns an error for attempting to remove a follow request from the same user';
    it(it116, async (done) => {
      Log.it(testName, removeFollowRequestTitle, it116, true);
      this.updateUrl(this.user1.username, this.user1.username);
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, removeFollowRequestTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(403);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.Resource.type);
        expect(details.error.message).toBe('You cannot remove a follow request from yourself');
        Log.log(testName, removeFollowRequestTitle, response.error);
      }

      Log.it(testName, removeFollowRequestTitle, it116, false);
      done();
    });

    const it12 = 'returns an error for a non-existent user';
    it(it12, async (done) => {
      Log.it(testName, removeFollowRequestTitle, it12, true);
      this.updateUrl(this.user1.username, Utils.newUuid());
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, removeFollowRequestTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(404);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.ResourceDNE.type);
        expect(details.error.message).toBe('That user does not exist');
        Log.log(testName, removeFollowRequestTitle, response.error);
      }

      done();
      Log.it(testName, removeFollowRequestTitle, it12, false);
    });

    const it125 = 'returns an error for attempting to remove a non-existent follow request';
    it(it125, async (done) => {
      Log.it(testName, removeFollowRequestTitle, it125, true);
      this.updateUrl(this.user1.username, this.user2.username);
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, removeFollowRequestTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(403);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.Resource.type);
        expect(details.error.message).toBe('You do not have a pending follow request for that user');
        Log.log(testName, removeFollowRequestTitle, response.error);
      }

      Log.it(testName, removeFollowRequestTitle, it125, false);
      done();
    });

    const successFollowRequestRemovalTitle = 'Success follow request removal';
    describe(successFollowRequestRemovalTitle, () => {
      beforeEach(async (done) => {
        Log.beforeEach(testName, successFollowRequestRemovalTitle, true);
        await UserAccessor.addFollowRequest(this.user1, this.user2);
        Log.beforeEach(testName, successFollowRequestRemovalTitle, false);
        done();
      });

      const it13 = 'removes a follow request from a user';
      it(it13, async (done) => {
        Log.it(testName, postUserRouteTitle, it13, true);
        this.updateUrl(this.user1.username, this.user2.username);
        const response = await Request(this.options);
        expect(response.statusCode).toBe(200);
        const details = JSON.parse(response.body);
        expect(details.success.message).toBe('Successful follow request removal');

        // Verify user information from the backend
        const user = await UserAccessor.get(this.user2.username);
        expect(user.hasFollowerRequest(this.user1.username)).toBe(false);
        Log.log(testName, successFollowRequestRemovalTitle, response.body);
        Log.it(testName, postUserRouteTitle, it13, false);
        done();
      });
    });
  });

  const respondToFollowerRequestTitle = 'Respond to follower request';
  describe(respondToFollowerRequestTitle, () => {
    beforeEach(async (done) => {
      Log.beforeEach(testName, respondToFollowerRequestTitle, true);
      this.options = {
        method: 'PUT',
        uri: url,
        resolveWithFullResponse: true,
        headers: {},
        form: {},
      };

      this.updateUrl = function updateUrl(_user, _requestedUser) {
        this.options.uri = `${url}/${_user}/followers/requests/${_requestedUser}`;
      };

      const authDetails = await UserMiddleware.getAuthToken(this.details1);
      this.options.headers.authorization = authDetails.success.token;
      Log.beforeEach(testName, respondToFollowerRequestTitle, false);
      done();
    });

    afterEach(() => {
      Log.afterEach(testName, respondToFollowerRequestTitle, true);
      delete this.options;
      delete this.updateUrl;
      Log.afterEach(testName, respondToFollowerRequestTitle, false);
    });

    const it14 = 'returns an authentication error for a missing auth token';
    it(it14, async (done) => {
      Log.it(testName, postUserRouteTitle, it14, true);
      this.options.form.accept = true;
      this.updateUrl(this.user1.username, this.user2.username);
      delete this.options.headers.authorization;
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, respondToFollowerRequestTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(401);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.Auth.type);
        expect(details.error.message).toBe(DroppError.TokenReason.missing);
        Log.log(testName, respondToFollowerRequestTitle, response.error);
      }

      Log.it(testName, postUserRouteTitle, it14, false);
      done();
    });

    const it15 = 'returns an error for an invalid username';
    it(it15, async (done) => {
      Log.it(testName, respondToFollowerRequestTitle, it15, true);
      this.options.form.accept = true;
      this.updateUrl('__.', this.user2.username);
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, respondToFollowerRequestTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(400);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(details.error.message).toBe('username');
        Log.log(testName, respondToFollowerRequestTitle, response.error);
      }

      Log.it(testName, respondToFollowerRequestTitle, it15, false);
      done();
    });

    const it16 = 'returns an error for an invalid requested username';
    it(it16, async (done) => {
      Log.it(testName, respondToFollowerRequestTitle, it16, true);
      this.options.form.accept = true;
      this.updateUrl(this.user1.username, '__.');
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, respondToFollowerRequestTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(400);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(details.error.message).toBe('requestedUser');
        Log.log(testName, respondToFollowerRequestTitle, response.error);
      }

      Log.it(testName, respondToFollowerRequestTitle, it16, false);
      done();
    });

    const it17 = 'returns an error for an invalid username and requested username';
    it(it17, async (done) => {
      Log.it(testName, respondToFollowerRequestTitle, it17, true);
      this.options.form.accept = true;
      this.updateUrl('__.', '__.');
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, respondToFollowerRequestTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(400);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(details.error.message).toBe('username,requestedUser');
        Log.log(testName, respondToFollowerRequestTitle, response.error);
      }

      Log.it(testName, respondToFollowerRequestTitle, it17, false);
      done();
    });

    const it18 = 'returns an error for an invalid accept body parameter';
    it(it18, async (done) => {
      Log.it(testName, respondToFollowerRequestTitle, it18, true);
      this.options.form.accept = Utils.newUuid();
      this.updateUrl(this.user1.username, this.user2.username);
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, respondToFollowerRequestTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(400);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(details.error.message).toBe('accept');
        Log.log(testName, respondToFollowerRequestTitle, response.error);
      }

      Log.it(testName, respondToFollowerRequestTitle, it18, false);
      done();
    });

    const it185 = 'returns an error for attempting to access a different user\'s follower requests';
    it(it185, async (done) => {
      Log.it(testName, respondToFollowerRequestTitle, it185, true);
      this.options.form.accept = true;
      this.updateUrl(this.user2.username, this.user2.username);
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, respondToFollowerRequestTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(403);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.Resource.type);
        expect(details.error.message).toBe('Unauthorized to access that');
        Log.log(testName, respondToFollowerRequestTitle, response.error);
      }

      Log.it(testName, respondToFollowerRequestTitle, it185, false);
      done();
    });

    const it186 = 'returns an error for attempting to respond to a follower request from the same user';
    it(it186, async (done) => {
      Log.it(testName, respondToFollowerRequestTitle, it186, true);
      this.options.form.accept = true;
      this.updateUrl(this.user1.username, this.user1.username);
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, respondToFollowerRequestTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(403);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.Resource.type);
        expect(details.error.message).toBe('You cannot respond to a follower request from yourself');
        Log.log(testName, respondToFollowerRequestTitle, response.error);
      }

      Log.it(testName, respondToFollowerRequestTitle, it186, false);
      done();
    });

    const it19 = 'returns an error for a non-existent user';
    it(it19, async (done) => {
      Log.it(testName, respondToFollowerRequestTitle, it19, true);
      this.options.form.accept = true;
      this.updateUrl(this.user1.username, Utils.newUuid());
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, respondToFollowerRequestTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(404);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.ResourceDNE.type);
        expect(details.error.message).toBe('That user does not exist');
        Log.log(testName, respondToFollowerRequestTitle, response.error);
      }

      Log.it(testName, respondToFollowerRequestTitle, it19, false);
      done();
    });

    const it195 = 'returns an error for attempting to remove a non-existent follow request';
    it(it195, async (done) => {
      Log.it(testName, respondToFollowerRequestTitle, it195, true);
      this.options.form.accept = true;
      this.updateUrl(this.user1.username, this.user2.username);
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, respondToFollowerRequestTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(403);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.Resource.type);
        expect(details.error.message).toBe('That user has not requested to follow you');
        Log.log(testName, respondToFollowerRequestTitle, response.error);
      }

      done();
    });

    const successRespondToFollowerRequestTitle = 'Success respond to follower request';
    describe(successRespondToFollowerRequestTitle, () => {
      beforeEach(async (done) => {
        Log.beforeEach(testName, successRespondToFollowerRequestTitle, true);
        this.removeFollower = true;
        await UserAccessor.addFollowRequest(this.user2, this.user1);
        Log.beforeEach(testName, successRespondToFollowerRequestTitle, false);
        done();
      });

      afterEach(async (done) => {
        Log.afterEach(testName, successRespondToFollowerRequestTitle, true);
        if (this.removeFollower === true) await UserAccessor.removeFollow(this.user2, this.user1);
        delete this.removeFollower;
        Log.afterEach(testName, successRespondToFollowerRequestTitle, false);
        done();
      });

      const it20 = 'accepts a follower request from a user';
      it(it20, async (done) => {
        Log.it(testName, successRespondToFollowerRequestTitle, it20, true);
        this.options.form.accept = true;
        this.updateUrl(this.user1.username, this.user2.username);
        const response = await Request(this.options);
        expect(response.statusCode).toBe(200);
        const details = JSON.parse(response.body);
        expect(details.success.message).toBe('Successful follow request acceptance');

        // Verify user information from the backend
        const user = await UserAccessor.get(this.user2.username);
        expect(user.doesFollow(this.user1.username)).toBe(true);
        expect(user.hasFollowRequest(this.user1.username)).toBe(false);
        Log.log(testName, successRespondToFollowerRequestTitle, response.body);
        Log.it(testName, successRespondToFollowerRequestTitle, it20, false);
        done();
      });

      const it21 = 'declines a follower request from a user';
      it(it21, async (done) => {
        Log.it(testName, successRespondToFollowerRequestTitle, it21, true);
        this.options.form.accept = false;
        this.updateUrl(this.user1.username, this.user2.username);
        const response = await Request(this.options);
        expect(response.statusCode).toBe(200);
        const details = JSON.parse(response.body);
        expect(details.success.message).toBe('Successful follow request denial');

        // Verify user information from the backend
        const user = await UserAccessor.get(this.user2.username);
        expect(user.doesFollow(this.user1.username)).toBe(false);
        expect(user.hasFollowRequest(this.user1.username)).toBe(false);
        Log.log(testName, successRespondToFollowerRequestTitle, response.body);
        Log.it(testName, successRespondToFollowerRequestTitle, it21, false);
        done();
      });
    });
  });

  const unfollowTitle = 'Unfollow';
  describe(unfollowTitle, () => {
    beforeEach(async (done) => {
      Log.beforeEach(testName, unfollowTitle, true);
      this.options = {
        method: 'DELETE',
        uri: url,
        resolveWithFullResponse: true,
        headers: {},
      };

      this.updateUrl = function updateUrl(_user, _follow) {
        this.options.uri = `${url}/${_user}/follows/${_follow}`;
      };

      const authDetails = await UserMiddleware.getAuthToken(this.details1);
      this.options.headers.authorization = authDetails.success.token;
      Log.beforeEach(testName, unfollowTitle, false);
      done();
    });

    afterEach(() => {
      Log.afterEach(testName, unfollowTitle, true);
      delete this.options;
      delete this.updateUrl;
      Log.afterEach(testName, unfollowTitle, false);
    });

    const it1 = 'returns an authentication error for a missing auth token';
    it(it1, async (done) => {
      Log.it(testName, unfollowTitle, it1, true);
      this.updateUrl(this.user1.username, this.user2.username);
      delete this.options.headers.authorization;
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, unfollowTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(401);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.Auth.type);
        expect(details.error.message).toBe(DroppError.TokenReason.missing);
        Log.log(testName, unfollowTitle, response.error);
      }

      Log.it(testName, unfollowTitle, it1, false);
      done();
    });

    const it2 = 'returns an error for an invalid username';
    it(it2, async (done) => {
      Log.it(testName, unfollowTitle, it2, true);
      this.updateUrl('__.', this.user2.username);
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, unfollowTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(400);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(details.error.message).toBe('username');
        Log.log(testName, unfollowTitle, response.error);
      }

      Log.it(testName, unfollowTitle, it2, false);
      done();
    });

    const it3 = 'returns an error for an invalid follow username';
    it(it3, async (done) => {
      Log.it(testName, unfollowTitle, it3, true);
      this.updateUrl(this.user1.username, '__.');
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, unfollowTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(400);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(details.error.message).toBe('follow');
        Log.log(testName, unfollowTitle, response.error);
      }

      Log.it(testName, unfollowTitle, it3, false);
      done();
    });

    const it4 = 'returns an error for an invalid username and requested username';
    it(it4, async (done) => {
      Log.it(testName, unfollowTitle, it4, true);
      this.updateUrl('__.', '__.');
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, unfollowTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(400);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(details.error.message).toBe('username,follow');
        Log.log(testName, unfollowTitle, response.error);
      }

      Log.it(testName, unfollowTitle, it4, false);
      done();
    });

    const it45 = 'returns an error for attempting to access a different user\'s follows';
    it(it45, async (done) => {
      Log.it(testName, unfollowTitle, it45, true);
      this.updateUrl(this.user2.username, this.user2.username);
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, unfollowTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(403);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.Resource.type);
        expect(details.error.message).toBe(Constants.middleware.messages.unauthorizedAccess);
        Log.log(testName, unfollowTitle, response.error);
      }

      Log.it(testName, unfollowTitle, it45, false);
      done();
    });

    const it5 = 'returns an error for attempting to unfollow the same user';
    it(it5, async (done) => {
      Log.it(testName, unfollowTitle, it5, true);
      this.updateUrl(this.user1.username, this.user1.username);
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, unfollowTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(403);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.Resource.type);
        expect(details.error.message).toBe('You cannot unfollow yourself');
        Log.log(testName, unfollowTitle, response.error);
      }

      Log.it(testName, unfollowTitle, it5, false);
      done();
    });

    const it6 = 'returns an error for attempting to unfollow a non-existent user';
    it(it6, async (done) => {
      Log.it(testName, unfollowTitle, it6, true);
      this.updateUrl(this.user1.username, Utils.newUuid());
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, unfollowTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(404);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.ResourceDNE.type);
        expect(details.error.message).toBe('That user does not exist');
        Log.log(testName, unfollowTitle, response.error);
      }

      Log.it(testName, unfollowTitle, it6, false);
      done();
    });

    const it7 = 'returns an error for attempting to unfollow a non-existent follow';
    it(it7, async (done) => {
      Log.it(testName, unfollowTitle, it7, true);
      this.updateUrl(this.user1.username, this.user2.username);
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, unfollowTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(403);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.Resource.type);
        expect(details.error.message).toBe('You do not follow that user');
        Log.log(testName, unfollowTitle, response.error);
      }

      Log.it(testName, unfollowTitle, it7, false);
      done();
    });

    const successUnfollowTitle = 'Success unfollow';
    describe(successUnfollowTitle, () => {
      beforeEach(async (done) => {
        Log.beforeEach(testName, successUnfollowTitle, true);
        await UserAccessor.addFollow(this.user1, this.user2);
        Log.beforeEach(testName, successUnfollowTitle, false);
        done();
      });

      const it8 = 'unfollows a user';
      it(it8, async (done) => {
        Log.it(testName, successUnfollowTitle, it8, true);
        this.updateUrl(this.user1.username, this.user2.username);
        const response = await Request(this.options);
        expect(response.statusCode).toBe(200);
        const details = JSON.parse(response.body);
        expect(details.success.message).toBe('Successful unfollow');

        // Verify user information from the backend
        const user = await UserAccessor.get(this.user2.username);
        expect(user.hasFollower(this.user1.username)).toBe(false);
        Log.log(testName, successUnfollowTitle, response.body);
        Log.it(testName, successUnfollowTitle, it8, false);
        done();
      });
    });
  });

  const removeFollowerTitle = 'Remove follower';
  describe(removeFollowerTitle, () => {
    beforeEach(async (done) => {
      Log.beforeEach(testName, removeFollowerTitle, true);
      this.options = {
        method: 'DELETE',
        uri: url,
        resolveWithFullResponse: true,
        headers: {},
      };

      this.updateUrl = function updateUrl(_user, _follower) {
        this.options.uri = `${url}/${_user}/followers/${_follower}`;
      };

      const authDetails = await UserMiddleware.getAuthToken(this.details1);
      this.options.headers.authorization = authDetails.success.token;
      Log.beforeEach(testName, removeFollowerTitle, false);
      done();
    });

    afterEach(() => {
      Log.afterEach(testName, removeFollowerTitle, true);
      delete this.options;
      delete this.updateUrl;
      Log.afterEach(testName, removeFollowerTitle, false);
    });

    const it1 = 'returns an authentication error for a missing auth token';
    it(it1, async (done) => {
      Log.it(testName, removeFollowerTitle, it1, true);
      this.updateUrl(this.user1.username, this.user2.username);
      delete this.options.headers.authorization;
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, removeFollowerTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(401);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.Auth.type);
        expect(details.error.message).toBe(DroppError.TokenReason.missing);
        Log.log(testName, removeFollowerTitle, response.error);
      }

      Log.it(testName, removeFollowerTitle, it1, false);
      done();
    });

    const it2 = 'returns an error for an invalid username';
    it(it2, async (done) => {
      Log.it(testName, removeFollowerTitle, it2, true);
      this.updateUrl('__.', this.user2.username);
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, removeFollowerTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(400);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(details.error.message).toBe('username');
        Log.log(testName, removeFollowerTitle, response.error);
      }

      Log.it(testName, removeFollowerTitle, it2, false);
      done();
    });

    const it3 = 'returns an error for an invalid follower username';
    it(it3, async (done) => {
      Log.it(testName, removeFollowerTitle, it3, true);
      this.updateUrl(this.user1.username, '__.');
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, removeFollowerTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(400);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(details.error.message).toBe('follower');
        Log.log(testName, removeFollowerTitle, response.error);
      }

      Log.it(testName, removeFollowerTitle, it3, false);
      done();
    });

    const it4 = 'returns an error for an invalid username and follower username';
    it(it4, async (done) => {
      Log.it(testName, removeFollowerTitle, it4, true);
      this.updateUrl('__.', '__.');
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, removeFollowerTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(400);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(details.error.message).toBe('username,follower');
        Log.log(testName, removeFollowerTitle, response.error);
      }

      Log.it(testName, removeFollowerTitle, it4, false);
      done();
    });

    const it5 = 'returns an error for attempting to access a different user\'s followers';
    it(it5, async (done) => {
      Log.it(testName, removeFollowerTitle, it5, true);
      this.updateUrl(this.user2.username, this.user2.username);
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, removeFollowerTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(403);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.Resource.type);
        expect(details.error.message).toBe('Unauthorized to access that');
        Log.log(testName, removeFollowerTitle, response.error);
      }

      Log.it(testName, removeFollowerTitle, it5, false);
      done();
    });

    const it6 = 'returns an error for attempting to remove the same user as a follower';
    it(it6, async (done) => {
      Log.it(testName, removeFollowerTitle, it6, true);
      this.updateUrl(this.user1.username, this.user1.username);
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, removeFollowerTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(403);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.Resource.type);
        expect(details.error.message).toBe('You cannot remove yourself as a follower');
        Log.log(testName, removeFollowerTitle, response.error);
      }

      Log.it(testName, removeFollowerTitle, it6, false);
      done();
    });

    const it7 = 'returns an error for attempting to remove a non-existent user';
    it(it7, async (done) => {
      Log.it(testName, removeFollowerTitle, it7, true);
      this.updateUrl(this.user1.username, Utils.newUuid());
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, removeFollowerTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(404);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.ResourceDNE.type);
        expect(details.error.message).toBe('That user does not exist');
        Log.log(testName, removeFollowerTitle, response.error);
      }

      Log.it(testName, removeFollowerTitle, it7, false);
      done();
    });

    const it8 = 'returns an error for attempting to remove a non-existent follower';
    it(it8, async (done) => {
      Log.it(testName, removeFollowerTitle, it8, true);
      this.updateUrl(this.user1.username, this.user2.username);
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(testName, removeFollowerTitle, 'Should have thrown error');
      } catch (response) {
        expect(response.statusCode).toBe(403);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.Resource.type);
        expect(details.error.message).toBe('That user does not follow you');
        Log.log(testName, removeFollowerTitle, response.error);
      }

      Log.it(testName, removeFollowerTitle, it8, false);
      done();
    });

    const successRemoveFollowerTitle = 'Success unfollow';
    describe(successRemoveFollowerTitle, () => {
      beforeEach(async (done) => {
        Log.beforeEach(testName, successRemoveFollowerTitle, true);
        await UserAccessor.addFollow(this.user2, this.user1);
        Log.beforeEach(testName, successRemoveFollowerTitle, false);
        done();
      });

      const it9 = 'removes a follower';
      it(it9, async (done) => {
        Log.it(testName, successRemoveFollowerTitle, it9, true);
        this.updateUrl(this.user1.username, this.user2.username);
        const response = await Request(this.options);
        expect(response.statusCode).toBe(200);
        const details = JSON.parse(response.body);
        expect(details.success.message).toBe('Successful follower removal');

        // Verify user information from the backend
        const user = await UserAccessor.get(this.user2.username);
        expect(user.doesFollow(this.user1.username)).toBe(false);
        Log.log(testName, successRemoveFollowerTitle, response.body);
        Log.it(testName, successRemoveFollowerTitle, it9, false);
        done();
      });
    });
  });
});
/* eslint-enable no-undef */

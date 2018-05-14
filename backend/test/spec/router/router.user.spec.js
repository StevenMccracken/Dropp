const Request = require('request-promise-native');
const Log = require('../../logger');
const Server = require('../../../index');
const User = require('../../../src/models/User');
const Utils = require('../../../src/utilities/utils');
const UserAccessor = require('../../../src/database/user');
const UserMiddleware = require('../../../src/middleware/user');

/**
 * Logs a message for the current test file
 * @param {String} _title the describe label
 * @param {String|Object} _details the log details
 */
function log(_title, _details) {
  Log(`Router Module ${_title}`, _details);
}

const url = `http://localhost:${Server.port}/users`;
const postUserRouteTitle = 'Post user route';
/* eslint-disable no-undef */
describe(postUserRouteTitle, () => {
  beforeEach(() => {
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
  });

  afterEach(async (done) => {
    if (this.deleteUser) {
      const user = await UserAccessor.get(this.username);
      await UserAccessor.remove(user);
    }

    delete this.email;
    delete this.username;
    delete this.password;
    delete this.options;
    delete this.deleteUser;
    done();
  });

  it('returns an error for an invalid username', async (done) => {
    delete this.options.form.username;
    try {
      const response = await Request(this.options);
      expect(response).not.toBeDefined();
      log(postUserRouteTitle, 'Should have thrown error');
    } catch (response) {
      expect(response).toBeDefined();
      expect(response.statusCode).toBe(400);

      const details = JSON.parse(response.error);
      expect(details.error.type).toBe('invalid_request_error');
      expect(details.error.message).toBe('username');
      log(postUserRouteTitle, response.error);
    }

    done();
  });

  it('returns an error for an invalid password', async (done) => {
    delete this.options.form.password;
    try {
      const response = await Request(this.options);
      expect(response).not.toBeDefined();
      log(postUserRouteTitle, 'Should have thrown error');
    } catch (response) {
      expect(response).toBeDefined();
      expect(response.statusCode).toBe(400);

      const details = JSON.parse(response.error);
      expect(details.error.type).toBe('invalid_request_error');
      expect(details.error.message).toBe('password');
      log(postUserRouteTitle, response.error);
    }

    done();
  });

  it('returns an error for an invalid email', async (done) => {
    delete this.options.form.email;
    try {
      const response = await Request(this.options);
      expect(response).not.toBeDefined();
      log(postUserRouteTitle, 'Should have thrown error');
    } catch (response) {
      expect(response).toBeDefined();
      expect(response.statusCode).toBe(400);

      const details = JSON.parse(response.error);
      expect(details.error.type).toBe('invalid_request_error');
      expect(details.error.message).toBe('email');
      log(postUserRouteTitle, response.error);
    }

    done();
  });

  it('returns an error for an invalid username, password, and email', async (done) => {
    delete this.options.form.email;
    delete this.options.form.username;
    delete this.options.form.password;
    try {
      const response = await Request(this.options);
      expect(response).not.toBeDefined();
      log(postUserRouteTitle, 'Should have thrown error');
    } catch (response) {
      expect(response).toBeDefined();
      expect(response.statusCode).toBe(400);

      const details = JSON.parse(response.error);
      expect(details.error.type).toBe('invalid_request_error');
      expect(details.error.message).toContain('email');
      expect(details.error.message).toContain('username');
      expect(details.error.message).toContain('password');
      log(postUserRouteTitle, response.error);
    }

    done();
  });

  describe('Existing user', () => {
    beforeEach(async (done) => {
      this.user = new User({
        username: Utils.newUuid(),
        email: `${Utils.newUuid()}@${Utils.newUuid()}.com`,
      });

      await UserAccessor.create(this.user, Utils.newUuid());
      done();
    });

    afterEach(async (done) => {
      await UserAccessor.remove(this.user);
      done();
    });

    it('returns an error for an already existing username', async (done) => {
      this.options.form.username = this.user.username;
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        log(postUserRouteTitle, 'Should have thrown error');
      } catch (response) {
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(403);

        const details = JSON.parse(response.error);
        expect(details.error.type).toBe('resource_error');
        expect(details.error.message).toBe('A user with that username already exists');
        log(postUserRouteTitle, response.error);
      }

      done();
    });
  });

  it('creates a new user and receives an authentication token', async (done) => {
    const response = await Request(this.options);
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(200);

    const details = JSON.parse(response.body);
    expect(details.success.token.toLowerCase()).toContain('bearer');
    expect(details.success.message).toBe('Successful user creation');
    this.deleteUser = true;
    log(postUserRouteTitle, response.body);
    done();
  });
});

const getUserRouteTitle = 'Get user route';
describe(getUserRouteTitle, () => {
  beforeEach(async (done) => {
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
    done();
  });

  afterEach(async (done) => {
    await UserMiddleware.remove(this.user, this.user.username);
    delete this.auth;
    delete this.user;
    delete this.token;
    delete this.options;
    delete this.updateUrl;
    done();
  });

  it('returns an error for an invalid username', async (done) => {
    this.updateUrl('__.');
    try {
      const response = await Request(this.options);
      expect(response).not.toBeDefined();
      log(postUserRouteTitle, 'Should have thrown error');
    } catch (response) {
      expect(response).toBeDefined();
      expect(response.statusCode).toBe(400);

      const details = JSON.parse(response.error);
      expect(details.error.type).toBe('invalid_request_error');
      expect(details.error.message).toContain('username');
      log(postUserRouteTitle, response.error);
    }

    done();
  });

  it('returns an error for a non-existent user', async (done) => {
    this.updateUrl(Utils.newUuid());
    try {
      const response = await Request(this.options);
      expect(response).not.toBeDefined();
      log(postUserRouteTitle, 'Should have thrown error');
    } catch (response) {
      expect(response).toBeDefined();
      expect(response.statusCode).toBe(404);

      const details = JSON.parse(response.error);
      expect(details.error.type).toBe('resource_dne_error');
      expect(details.error.message).toBe('That user does not exist');
      log(postUserRouteTitle, response.error);
    }

    done();
  });

  it('gets the user\'s private details', async (done) => {
    this.updateUrl(this.user.username);
    const response = await Request(this.options, this.auth);
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(200);

    const details = JSON.parse(response.body);
    expect(details).toBeDefined();
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
    log(postUserRouteTitle, response.body);
    done();
  });

  describe('Different user', () => {
    beforeEach(async (done) => {
      const details = {
        username: Utils.newUuid(),
        password: Utils.newUuid(),
        email: `${Utils.newUuid()}@${Utils.newUuid()}.com`,
      };

      this.user2 = await UserMiddleware.create(details);
      done();
    });

    afterEach(async (done) => {
      await UserMiddleware.remove(this.user2, this.user2.username);
      delete this.user2;
      done();
    });

    it('gets the user\'s public details', async (done) => {
      this.updateUrl(this.user2.username);
      const response = await Request(this.options, this.auth);
      expect(response).toBeDefined();
      expect(response.statusCode).toBe(200);

      const details = JSON.parse(response.body);
      expect(details).toBeDefined();
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
      log(postUserRouteTitle, response.body);
      done();
    });
  });
});
/* eslint-enable no-undef */

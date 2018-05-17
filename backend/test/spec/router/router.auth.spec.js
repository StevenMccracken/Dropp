const Request = require('request-promise-native');
const Log = require('../../logger');
const Server = require('../../../index');
const Utils = require('../../../src/utilities/utils');
const DroppError = require('../../../src/errors/DroppError');
const UserMiddleware = require('../../../src/middleware/user');

/**
 * Logs a message for the current test file
 * @param {String} _title the describe label
 * @param {String|Object} _details the log details
 */
function log(_title, _details) {
  Log(`Router Module ${_title}`, _details);
}

const url = `http://localhost:${Server.port}/auth`;
const authRouteTitle = 'Auth route';
/* eslint-disable no-undef */
describe(authRouteTitle, () => {
  beforeEach(async (done) => {
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

    this.user = await UserMiddleware.create(this.options.form);
    done();
  });

  afterEach(async (done) => {
    delete this.email;
    delete this.username;
    delete this.password;
    delete this.options;
    await UserMiddleware.remove(this.user, { username: this.user.username });
    done();
  });

  it('returns an error for an invalid username', async (done) => {
    delete this.options.form.username;
    try {
      const response = await Request(this.options);
      expect(response).not.toBeDefined();
      log(authRouteTitle, 'Should have thrown error');
    } catch (response) {
      expect(response).toBeDefined();
      expect(response.statusCode).toBe(400);

      const details = JSON.parse(response.error);
      expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(details.error.message).toBe('username');
      log(authRouteTitle, response.error);
    }

    done();
  });

  it('returns an error for an invalid password', async (done) => {
    delete this.options.form.password;
    try {
      const response = await Request(this.options);
      expect(response).not.toBeDefined();
      log(authRouteTitle, 'Should have thrown error');
    } catch (response) {
      expect(response).toBeDefined();
      expect(response.statusCode).toBe(400);

      const details = JSON.parse(response.error);
      expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(details.error.message).toBe('password');
      log(authRouteTitle, response.error);
    }

    done();
  });

  it('returns an error for an invalid username and password', async (done) => {
    delete this.options.form.username;
    delete this.options.form.password;
    try {
      const response = await Request(this.options);
      expect(response).not.toBeDefined();
      log(authRouteTitle, 'Should have thrown error');
    } catch (response) {
      expect(response).toBeDefined();
      expect(response.statusCode).toBe(400);

      const details = JSON.parse(response.error);
      expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(details.error.message).toContain('username');
      expect(details.error.message).toContain('password');
      log(authRouteTitle, response.error);
    }

    done();
  });

  it('returns an error for a non-existent user', async (done) => {
    this.options.form.username = Utils.newUuid();
    try {
      const response = await Request(this.options);
      expect(response).not.toBeDefined();
      log(authRouteTitle, 'Should have thrown error');
    } catch (response) {
      expect(response).toBeDefined();
      expect(response.statusCode).toBe(401);

      const details = JSON.parse(response.error);
      expect(details.error.type).toBe(DroppError.type.Login.type);
      expect(details.error.message).toBe('The username or password is incorrect');
      log(authRouteTitle, response.error);
    }

    done();
  });

  it('returns an error for a mismatching password', async (done) => {
    this.options.form.password = Utils.newUuid();
    try {
      const response = await Request(this.options);
      expect(response).not.toBeDefined();
      log(authRouteTitle, 'Should have thrown error');
    } catch (response) {
      expect(response).toBeDefined();
      expect(response.statusCode).toBe(401);

      const details = JSON.parse(response.error);
      expect(details.error.type).toBe(DroppError.type.Login.type);
      expect(details.error.message).toBe('The username or password is incorrect');
      log(authRouteTitle, response.error);
    }

    done();
  });

  it('gets an authentication token', async (done) => {
    const response = await Request(this.options);
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(200);

    const details = JSON.parse(response.body);
    expect(details.success.token.toLowerCase()).toContain('bearer');
    expect(details.success.message).toBe('Successful authentication');
    log(authRouteTitle, response.body);
    done();
  });
});
/* eslint-enable no-undef */

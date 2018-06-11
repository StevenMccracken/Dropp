const Request = require('request-promise-native');
const Log = require('../../logger');
const Server = require('../../../index');
const Utils = require('../../../src/utilities/utils');
const DroppError = require('../../../src/errors/DroppError');
const UserMiddleware = require('../../../src/middleware/user');

const testName = 'Router Module';
const url = `http://localhost:${Server.port}/auth`;
const authRouteTitle = 'Auth route';
/* eslint-disable no-undef */
describe(authRouteTitle, () => {
  beforeEach(async (done) => {
    Log.beforeEach(testName, authRouteTitle, true);
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
    Log.beforeEach(testName, authRouteTitle, false);
    done();
  });

  afterEach(async (done) => {
    Log.afterEach(testName, authRouteTitle, true);
    delete this.email;
    delete this.username;
    delete this.password;
    delete this.options;
    const usernameDetails = { username: this.user.username };
    await UserMiddleware.remove(this.user, usernameDetails);
    Log.afterEach(testName, authRouteTitle, false);
    done();
  });

  const it1 = 'returns an error for an invalid username';
  it(it1, async (done) => {
    Log.it(testName, authRouteTitle, it1, true);
    delete this.options.form.username;
    try {
      const response = await Request(this.options);
      expect(response).not.toBeDefined();
      Log.log(testName, authRouteTitle, 'Should have thrown error');
    } catch (response) {
      expect(response.statusCode).toBe(400);
      const details = JSON.parse(response.error);
      expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(details.error.message).toBe('username');
      Log.log(testName, authRouteTitle, response.error);
    }

    Log.it(testName, authRouteTitle, it1, false);
    done();
  });

  const it2 = 'returns an error for an invalid password';
  it(it2, async (done) => {
    Log.it(testName, authRouteTitle, it2, true);
    delete this.options.form.password;
    try {
      const response = await Request(this.options);
      expect(response).not.toBeDefined();
      Log.log(testName, authRouteTitle, 'Should have thrown error');
    } catch (response) {
      expect(response.statusCode).toBe(400);
      const details = JSON.parse(response.error);
      expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(details.error.message).toBe('password');
      Log.log(testName, authRouteTitle, response.error);
    }

    Log.it(testName, authRouteTitle, it2, false);
    done();
  });

  const it3 = 'returns an error for an invalid username and password';
  it(it3, async (done) => {
    Log.it(testName, authRouteTitle, it3, true);
    delete this.options.form.username;
    delete this.options.form.password;
    try {
      const response = await Request(this.options);
      expect(response).not.toBeDefined();
      Log.log(testName, authRouteTitle, 'Should have thrown error');
    } catch (response) {
      expect(response.statusCode).toBe(400);
      const details = JSON.parse(response.error);
      expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(details.error.message).toContain('username');
      expect(details.error.message).toContain('password');
      Log.log(testName, authRouteTitle, response.error);
    }

    Log.it(testName, authRouteTitle, it3, false);
    done();
  });

  const it4 = 'returns an error for a non-existent user';
  it(it4, async (done) => {
    Log.it(testName, authRouteTitle, it4, true);
    this.options.form.username = Utils.newUuid();
    try {
      const response = await Request(this.options);
      expect(response).not.toBeDefined();
      Log.log(testName, authRouteTitle, 'Should have thrown error');
    } catch (response) {
      expect(response.statusCode).toBe(401);
      const details = JSON.parse(response.error);
      expect(details.error.type).toBe(DroppError.type.Login.type);
      expect(details.error.message).toBe('The username or password is incorrect');
      Log.log(testName, authRouteTitle, response.error);
    }

    Log.it(testName, authRouteTitle, it4, false);
    done();
  });

  const it5 = 'returns an error for a mismatching password';
  it(it5, async (done) => {
    Log.it(testName, authRouteTitle, it5, true);
    this.options.form.password = Utils.newUuid();
    try {
      const response = await Request(this.options);
      expect(response).not.toBeDefined();
      Log.log(testName, authRouteTitle, 'Should have thrown error');
    } catch (response) {
      expect(response.statusCode).toBe(401);
      const details = JSON.parse(response.error);
      expect(details.error.type).toBe(DroppError.type.Login.type);
      expect(details.error.message).toBe('The username or password is incorrect');
      Log.log(testName, authRouteTitle, response.error);
    }

    Log.it(testName, authRouteTitle, it5, false);
    done();
  });

  const it6 = 'gets an authentication token';
  it(it6, async (done) => {
    Log.it(testName, authRouteTitle, it6, true);
    const response = await Request(this.options);
    expect(response.statusCode).toBe(200);
    const details = JSON.parse(response.body);
    expect(details.success.token.toLowerCase()).toContain('bearer');
    expect(details.success.message).toBe('Successful authentication');
    Log.log(testName, authRouteTitle, response.body);
    Log.it(testName, authRouteTitle, it6, false);
    done();
  });
});

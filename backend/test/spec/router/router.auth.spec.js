const Request = require('request-promise-native');
const Log = require('../../logger');
const Server = require('../../../index');
const TestConstants = require('../../constants');
const Utils = require('../../../src/utilities/utils');
const DroppError = require('../../../src/errors/DroppError');
const Constants = require('../../../src/utilities/constants');
const UserMiddleware = require('../../../src/middleware/user');

const authRouteTitle = 'Auth route';
/* eslint-disable no-undef */
describe(authRouteTitle, () => {
  beforeEach(async (done) => {
    Log.beforeEach(TestConstants.router.testName, authRouteTitle, true);
    this.username = Utils.newUuid();
    this.password = Utils.newUuid();
    this.email = TestConstants.params.uuidEmail();
    this.options = {
      method: TestConstants.router.methods.post,
      uri: `${TestConstants.router.url(Server.port)}${Constants.router.routes.auth}`,
      resolveWithFullResponse: true,
      form: {
        email: this.email,
        username: this.username,
        password: this.password,
      },
    };

    this.user = await UserMiddleware.create(this.options.form);
    Log.beforeEach(TestConstants.router.testName, authRouteTitle, false);
    done();
  });

  afterEach(async (done) => {
    Log.afterEach(TestConstants.router.testName, authRouteTitle, true);
    delete this.email;
    delete this.username;
    delete this.password;
    delete this.options;
    const usernameDetails = { username: this.user.username };
    await UserMiddleware.remove(this.user, usernameDetails);
    Log.afterEach(TestConstants.router.testName, authRouteTitle, false);
    done();
  });

  const it1 = 'returns an error for an invalid username';
  it(it1, async (done) => {
    Log.it(TestConstants.router.testName, authRouteTitle, it1, true);
    delete this.options.form.username;
    try {
      const response = await Request(this.options);
      expect(response).not.toBeDefined();
      Log.log(
        TestConstants.router.testName,
        authRouteTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (response) {
      expect(response.statusCode).toBe(DroppError.type.InvalidRequest.status);
      const details = JSON.parse(response.error);
      expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(details.error.message).toBe(Constants.params.username);
      Log.log(
        TestConstants.router.testName,
        authRouteTitle,
        response.error
      );
    }

    Log.it(TestConstants.router.testName, authRouteTitle, it1, false);
    done();
  });

  const it2 = 'returns an error for an invalid password';
  it(it2, async (done) => {
    Log.it(TestConstants.router.testName, authRouteTitle, it2, true);
    delete this.options.form.password;
    try {
      const response = await Request(this.options);
      expect(response).not.toBeDefined();
      Log.log(
        TestConstants.router.testName,
        authRouteTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (response) {
      expect(response.statusCode).toBe(DroppError.type.InvalidRequest.status);
      const details = JSON.parse(response.error);
      expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(details.error.message).toBe(Constants.params.password);
      Log.log(TestConstants.router.testName, authRouteTitle, response.error);
    }

    Log.it(TestConstants.router.testName, authRouteTitle, it2, false);
    done();
  });

  const it3 = 'returns an error for an invalid username and password';
  it(it3, async (done) => {
    Log.it(TestConstants.router.testName, authRouteTitle, it3, true);
    delete this.options.form.username;
    delete this.options.form.password;
    try {
      const response = await Request(this.options);
      expect(response).not.toBeDefined();
      Log.log(
        TestConstants.router.testName,
        authRouteTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (response) {
      expect(response.statusCode).toBe(DroppError.type.InvalidRequest.status);
      const details = JSON.parse(response.error);
      expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(details.error.message).toContain(Constants.params.username);
      expect(details.error.message).toContain(Constants.params.password);
      Log.log(TestConstants.router.testName, authRouteTitle, response.error);
    }

    Log.it(TestConstants.router.testName, authRouteTitle, it3, false);
    done();
  });

  const it4 = 'returns an error for a non-existent user';
  it(it4, async (done) => {
    Log.it(TestConstants.router.testName, authRouteTitle, it4, true);
    this.options.form.username = Utils.newUuid();
    try {
      const response = await Request(this.options);
      expect(response).not.toBeDefined();
      Log.log(
        TestConstants.router.testName,
        authRouteTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (response) {
      expect(response.statusCode).toBe(DroppError.type.Login.status);
      const details = JSON.parse(response.error);
      expect(details.error.type).toBe(DroppError.type.Login.type);
      expect(details.error.message).toBe(DroppError.type.Login.message);
      Log.log(TestConstants.router.testName, authRouteTitle, response.error);
    }

    Log.it(TestConstants.router.testName, authRouteTitle, it4, false);
    done();
  });

  const it5 = 'returns an error for a mismatching password';
  it(it5, async (done) => {
    Log.it(TestConstants.router.testName, authRouteTitle, it5, true);
    this.options.form.password = Utils.newUuid();
    try {
      const response = await Request(this.options);
      expect(response).not.toBeDefined();
      Log.log(
        TestConstants.router.testName,
        authRouteTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (response) {
      expect(response.statusCode).toBe(DroppError.type.Login.status);
      const details = JSON.parse(response.error);
      expect(details.error.type).toBe(DroppError.type.Login.type);
      expect(details.error.message).toBe(DroppError.type.Login.message);
      Log.log(TestConstants.router.testName, authRouteTitle, response.error);
    }

    Log.it(TestConstants.router.testName, authRouteTitle, it5, false);
    done();
  });

  const it6 = 'gets an authentication token';
  it(it6, async (done) => {
    Log.it(TestConstants.router.testName, authRouteTitle, it6, true);
    const response = await Request(this.options);
    expect(response.statusCode).toBe(TestConstants.router.statusCodes.success);
    const details = JSON.parse(response.body);
    expect(details.success.token).toContain(Constants.passport.Bearer);
    expect(details.success.message).toBe(Constants.middleware.user.messages.success.authentication);
    Log.log(TestConstants.router.testName, authRouteTitle, response.body);
    Log.it(TestConstants.router.testName, authRouteTitle, it6, false);
    done();
  });
});

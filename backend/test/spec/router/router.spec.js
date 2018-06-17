const Log = require('../../logger');
const TestConstants = require('../../constants');
const Utils = require('../../../src/utilities/utils');
const RouterModule = require('../../../src/routing/router');
const DroppError = require('../../../src/errors/DroppError');
const UserMiddleware = require('../../../src/middleware/user');

const handleErrorTitle = 'Handle error';
/* eslint-disable no-undef */
describe(handleErrorTitle, () => {
  beforeEach(() => {
    Log.beforeEach(TestConstants.router.testName, handleErrorTitle, true);
    this.request = {};
    this.response = {
      status: (value) => {
        this.statusCode = value;
      },
      json: (result) => {
        this.responseResult = result;
      },
    };

    Log.beforeEach(TestConstants.router.testName, handleErrorTitle, false);
  });

  afterEach(() => {
    Log.afterEach(TestConstants.router.testName, handleErrorTitle, true);
    delete this.request;
    delete this.response;
    delete this.statusCode;
    delete this.responseResult;
    Log.afterEach(TestConstants.router.testName, handleErrorTitle, false);
  });

  const it1 = 'returns a generic error for an invalid error object';
  it(it1, () => {
    Log.it(TestConstants.router.testName, handleErrorTitle, it1, true);
    RouterModule.errorHandler(null, this.request, this.response, null);
    expect(this.statusCode).toBe(DroppError.type.Server.status);
    expect(this.responseResult.error.type).toBe(DroppError.type.Server.type);
    expect(this.responseResult.error.message).toBe(DroppError.type.Server.message);
    Log.log(TestConstants.router.testName, handleErrorTitle, this.responseResult);
    Log.it(TestConstants.router.testName, handleErrorTitle, it1, false);
  });

  const it2 = 'returns a generic error for an empty Dropp error';
  it(it2, () => {
    Log.it(TestConstants.router.testName, handleErrorTitle, it2, true);
    const error = new DroppError();
    error.details = null;
    RouterModule.errorHandler(error, this.request, this.response, null);
    expect(this.statusCode).toBe(DroppError.type.Server.status);
    expect(this.responseResult.error.type).toBe(DroppError.type.Server.type);
    expect(this.responseResult.error.message).toBe(DroppError.type.Server.message);
    Log.log(TestConstants.router.testName, handleErrorTitle, this.responseResult);
    Log.it(TestConstants.router.testName, handleErrorTitle, it2, false);
  });

  const it3 = 'returns an error for an semi-complete Dropp error';
  it(it3, () => {
    Log.it(TestConstants.router.testName, handleErrorTitle, it3, true);
    const error = new DroppError(TestConstants.params.test, TestConstants.params.test);
    RouterModule.errorHandler(error, this.request, this.response, null);
    expect(this.responseResult).toBe(TestConstants.params.test);
    expect(this.statusCode).toBe(DroppError.type.Server.status);
    Log.log(TestConstants.router.testName, handleErrorTitle, this.responseResult);
    Log.it(TestConstants.router.testName, handleErrorTitle, it3, false);
  });

  const it4 = 'returns an error for an complete Dropp error';
  it(it4, () => {
    Log.it(TestConstants.router.testName, handleErrorTitle, it4, true);
    const privateDetails = {
      error: {
        type: {
          status: 1,
        },
      },
    };

    const error = new DroppError(TestConstants.params.test, privateDetails);
    RouterModule.errorHandler(error, this.request, this.response, null);
    expect(this.statusCode).toBe(1);
    expect(this.responseResult).toBe(TestConstants.params.test);
    Log.log(TestConstants.router.testName, handleErrorTitle, this.responseResult);
    Log.it(TestConstants.router.testName, handleErrorTitle, it4, false);
  });
});

const validateAuthTokenTitle = 'Validate auth token';
describe(validateAuthTokenTitle, () => {
  beforeEach(async (done) => {
    this.didCallNext = false;
    this.next = () => {
      this.didCallNext = true;
    };

    this.request = {
      headers: {},
    };

    this.response = {
      status: (value) => {
        this.statusCode = value;
      },
      json: (result) => {
        this.responseResult = result;
      },
    };

    this.userDetails = {
      username: Utils.newUuid(),
      password: Utils.newUuid(),
      email: TestConstants.params.uuidEmail(),
    };

    this.user = await UserMiddleware.create(this.userDetails);
    const result = await UserMiddleware.getAuthToken(this.userDetails);
    this.token = result.success.token;
    done();
  });

  afterEach(async (done) => {
    delete this.token;
    delete this.request;
    delete this.response;
    delete this.statusCode;
    delete this.userDetails;
    delete this.didCallNext;
    delete this.responseResult;
    const usernameDetails = { username: this.user.username };
    await UserMiddleware.remove(this.user, usernameDetails);
    delete this.user;
    done();
  });

  const it5 = 'returns an error for a missing auth token';
  it(it5, async (done) => {
    Log.it(TestConstants.router.testName, validateAuthTokenTitle, it5, true);
    await RouterModule.validateAuthToken(this.request, this.response, this.next);
    expect(this.didCallNext).toBe(false);
    expect(this.request.user).not.toBeDefined();
    expect(this.statusCode).toBe(DroppError.type.Auth.status);
    expect(this.responseResult.error.type).toBe(DroppError.type.Auth.type);
    expect(this.responseResult.error.message).toBe(DroppError.TokenReason.missing);
    Log.log(
      TestConstants.router.testName,
      validateAuthTokenTitle,
      this.responseResult.error.message
    );
    Log.it(TestConstants.router.testName, validateAuthTokenTitle, it5, false);
    done();
  });

  const it6 = 'returns an error for an invalid auth token';
  it(it6, async (done) => {
    Log.it(TestConstants.router.testName, validateAuthTokenTitle, it6, true);
    this.request.headers.authorization = `Bearer ${Utils.newUuid()}`;
    await RouterModule.validateAuthToken(this.request, this.response, this.next);
    expect(this.didCallNext).toBe(false);
    expect(this.request.user).not.toBeDefined();
    expect(this.statusCode).toBe(DroppError.type.Auth.status);
    expect(this.responseResult.error.type).toBe(DroppError.type.Auth.type);
    expect(this.responseResult.error.message).toBe(DroppError.TokenReason.invalid);
    Log.log(
      TestConstants.router.testName,
      validateAuthTokenTitle,
      this.responseResult.error.message
    );
    Log.it(TestConstants.router.testName, validateAuthTokenTitle, it6, false);
    done();
  });

  const it7 = 'returns a user for an valid auth token';
  it(it7, async (done) => {
    Log.it(TestConstants.router.testName, validateAuthTokenTitle, it7, true);
    this.request.headers.authorization = this.token;
    await RouterModule.validateAuthToken(this.request, this.response, this.next);
    expect(this.didCallNext).toBe(true);
    expect(this.request.user.username).toBe(this.user.username);
    Log.log(TestConstants.router.testName, validateAuthTokenTitle, this.didCallNext);
    Log.it(TestConstants.router.testName, validateAuthTokenTitle, it7, false);
    done();
  });
});

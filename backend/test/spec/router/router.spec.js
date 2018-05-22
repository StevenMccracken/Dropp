const Log = require('../../logger');
const Utils = require('../../../src/utilities/utils');
const RouterModule = require('../../../src/routing/router');
const DroppError = require('../../../src/errors/DroppError');
const UserMiddleware = require('../../../src/middleware/user');

const testName = 'Router Module';
const handleErrorTitle = 'Handle error';
/* eslint-disable no-undef */
describe(handleErrorTitle, () => {
  beforeEach(() => {
    this.request = {};
    this.response = {
      status: (value) => {
        this.statusCode = value;
      },
      json: (result) => {
        this.responseResult = result;
      },
    };
  });

  afterEach(() => {
    delete this.request;
    delete this.response;
    delete this.statusCode;
    delete this.responseResult;
  });

  it('returns a generic error for an invalid error object', (done) => {
    RouterModule.errorHandler(null, this.request, this.response, null);
    expect(this.statusCode).toBe(DroppError.type.Server.status);
    expect(this.responseResult.error.type).toBe(DroppError.type.Server.type);
    expect(this.responseResult.error.message).toBe(DroppError.type.Server.message);
    Log(testName, handleErrorTitle, this.responseResult);
    done();
  });

  it('returns a generic error for an empty Dropp error', (done) => {
    const error = new DroppError();
    error.details = null;
    RouterModule.errorHandler(error, this.request, this.response, null);
    expect(this.statusCode).toBe(DroppError.type.Server.status);
    expect(this.responseResult.error.type).toBe(DroppError.type.Server.type);
    expect(this.responseResult.error.message).toBe(DroppError.type.Server.message);
    Log(testName, handleErrorTitle, this.responseResult);
    done();
  });

  it('returns an error for an semi-complete Dropp error', (done) => {
    const error = new DroppError('test', 'test');
    RouterModule.errorHandler(error, this.request, this.response, null);
    expect(this.responseResult).toBe('test');
    expect(this.statusCode).toBe(DroppError.type.Server.status);
    Log(testName, handleErrorTitle, this.responseResult);
    done();
  });

  it('returns an error for an complete Dropp error', (done) => {
    const privateDetails = {
      error: {
        type: {
          status: 1,
        },
      },
    };

    const error = new DroppError('test', privateDetails);
    RouterModule.errorHandler(error, this.request, this.response, null);
    expect(this.statusCode).toBe(1);
    expect(this.responseResult).toBe('test');
    Log(testName, handleErrorTitle, this.responseResult);
    done();
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
      email: `${Utils.newUuid()}@${Utils.newUuid()}.com`,
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

  it('returns an error for a missing auth token', async (done) => {
    await RouterModule.validateAuthToken(this.request, this.response, this.next);
    expect(this.didCallNext).toBe(false);
    expect(this.request.user).not.toBeDefined();
    expect(this.statusCode).toBe(DroppError.type.Auth.status);
    expect(this.responseResult.error.type).toBe(DroppError.type.Auth.type);
    expect(this.responseResult.error.message).toBe(DroppError.TokenReason.missing);
    Log(testName, validateAuthTokenTitle, this.responseResult.error.message);
    done();
  });

  it('returns an error for an invalid auth token', async (done) => {
    this.request.headers.authorization = `Bearer ${Utils.newUuid()}`;
    await RouterModule.validateAuthToken(this.request, this.response, this.next);
    expect(this.didCallNext).toBe(false);
    expect(this.request.user).not.toBeDefined();
    expect(this.statusCode).toBe(DroppError.type.Auth.status);
    expect(this.responseResult.error.type).toBe(DroppError.type.Auth.type);
    expect(this.responseResult.error.message).toBe(DroppError.TokenReason.invalid);
    Log(testName, validateAuthTokenTitle, this.responseResult.error.message);
    done();
  });

  it('returns a user for an valid auth token', async (done) => {
    this.request.headers.authorization = this.token;
    await RouterModule.validateAuthToken(this.request, this.response, this.next);
    expect(this.didCallNext).toBe(true);
    expect(this.request.user.username).toBe(this.user.username);
    Log(testName, validateAuthTokenTitle, this.didCallNext);
    done();
  });
});

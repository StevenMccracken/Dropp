const Log = require('../../logger');
const Utils = require('../../../src/utilities/utils');
const RouterModule = require('../../../src/routing/router');
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
    log(handleErrorTitle, this.responseResult);
    done();
  });

  it('returns a generic error for an empty Dropp error', (done) => {
    const error = new DroppError();
    error.details = null;
    RouterModule.errorHandler(error, this.request, this.response, null);
    expect(this.statusCode).toBe(DroppError.type.Server.status);
    expect(this.responseResult.error.type).toBe(DroppError.type.Server.type);
    expect(this.responseResult.error.message).toBe(DroppError.type.Server.message);
    log(handleErrorTitle, this.responseResult);
    done();
  });

  it('returns an error for an semi-complete Dropp error', (done) => {
    const error = new DroppError('test', 'test');
    RouterModule.errorHandler(error, this.request, this.response, null);
    expect(this.responseResult).toBe('test');
    expect(this.statusCode).toBe(DroppError.type.Server.status);
    log(handleErrorTitle, this.responseResult);
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
    log(handleErrorTitle, this.responseResult);
    done();
  });
});
/* eslint-enable no-undef */

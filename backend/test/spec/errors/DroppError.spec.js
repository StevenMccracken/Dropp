const Log = require('../../logger');
const Utils = require('../../../src/utilities/utils');
const DroppError = require('../../../src/errors/DroppError');

const testName = 'Dropp Error';
const constructorTitle = 'Constructor';
/* eslint-disable no-undef */
describe(constructorTitle, () => {
  it('creates a dropp error object with default details', (done) => {
    const error = new DroppError();
    expect(error.name).toBe('DroppError');
    expect(error.statusCode).toBeNull();
    expect(Object.keys(error.details).length).toBe(0);
    expect(Object.keys(error.privateDetails).length).toBe(0);
    Log(testName, constructorTitle, error);
    done();
  });

  it('creates a dropp error object with specific details', (done) => {
    const error = new DroppError('test', 'test');
    expect(error.name).toBe('DroppError');
    expect(error.details).toBe('test');
    expect(error.privateDetails).toBe('test');
    expect(error.statusCode).toBeNull();
    Log(testName, constructorTitle, error);
    done();
  });

  it('creates a dropp error object with specific private details', (done) => {
    const privateDetails = {
      error: 'test',
    };

    const error = new DroppError('test', privateDetails);
    expect(error.name).toBe('DroppError');
    expect(error.details).toBe('test');
    expect(error.privateDetails).toBe(privateDetails);
    expect(error.statusCode).toBeNull();
    Log(testName, constructorTitle, error);
    done();
  });

  it('creates a dropp error object with a null status code when private details are null', (done) => {
    const error = new DroppError();
    error.privateDetails = null;
    expect(error.name).toBe('DroppError');
    expect(error.statusCode).toBeNull();
    Log(testName, constructorTitle, error);
    done();
  });

  it('creates a dropp error object without a status code in the private details', (done) => {
    const privateDetails = {
      error: {
        type: 'test',
      },
    };

    const error = new DroppError('test', privateDetails);
    expect(error.name).toBe('DroppError');
    expect(error.privateDetails).toBe(privateDetails);
    expect(error.statusCode).not.toBeDefined();
    Log(testName, constructorTitle, error);
    done();
  });

  it('creates a dropp error object without a status code in the private details', (done) => {
    const privateDetails = {
      error: {
        type: 'test',
      },
    };

    const error = new DroppError('test', privateDetails);
    expect(error.name).toBe('DroppError');
    expect(error.details).toBe('test');
    expect(error.privateDetails).toBe(privateDetails);
    expect(error.statusCode).not.toBeDefined();
    Log(testName, constructorTitle, error);
    done();
  });

  it('creates a dropp error object with a status code in the private details', (done) => {
    const privateDetails = {
      error: {
        type: {
          status: 'test',
        },
      },
    };

    const error = new DroppError('test', privateDetails);
    expect(error.name).toBe('DroppError');
    expect(error.details).toBe('test');
    expect(error.privateDetails).toBe(privateDetails);
    expect(error.statusCode).toBe('test');
    Log(testName, constructorTitle, error);
    done();
  });
});

const formatTitle = 'Format';
describe(formatTitle, () => {
  it('creates a dropp error object', (done) => {
    const error = DroppError.format();
    expect(typeof error.details.error.id).toBe('string');
    expect(error.details.error.type).toBe(DroppError.type.Server.type);
    expect(error.details.error.message).toBe(DroppError.type.Server.message);
    expect(error.privateDetails.error.id).toBe(error.details.error.id);
    expect(typeof error.privateDetails.error.timestamp).toBe('string');
    expect(error.privateDetails.error.type).not.toBeDefined();
    expect(error.privateDetails.error.source).not.toBeDefined();
    expect(error.privateDetails.error.details).toBe(DroppError.type.Server.message);
    Log(testName, formatTitle, error);
    done();
  });

  it('creates a dropp error object with an array client message', (done) => {
    const error = DroppError.format(null, null, [1, 2]);
    expect(error.details.error.message).toBe('1,2');
    expect(error.privateDetails.error.details).toBe('1,2');
    Log(testName, formatTitle, error);
    done();
  });

  it('creates a dropp error object with a string client message', (done) => {
    const error = DroppError.format(null, null, 'test');
    expect(error.details.error.message).toBe('test');
    expect(error.privateDetails.error.details).toBe('test');
    Log(testName, formatTitle, error);
    done();
  });

  it('creates a dropp error object with a client message of the type', (done) => {
    const type = {
      message: 'test',
    };

    const error = DroppError.format(type);
    expect(error.details.error.message).toBe('test');
    expect(error.privateDetails.error.details).toBe('test');
    Log(testName, formatTitle, error);
    done();
  });

  it('creates a dropp error object with a client message of the type', (done) => {
    const type = {
      type: 'test',
      message: 'test',
    };

    const error = DroppError.format(type);
    expect(error.details.error.type).toBe('test');
    expect(error.privateDetails.error.type).toBe(type);
    expect(error.details.error.message).toBe('test');
    expect(error.privateDetails.error.details).toBe('test');
    Log(testName, formatTitle, error);
    done();
  });

  it('creates a dropp error object with a specific server message', (done) => {
    const error = DroppError.format(null, null, null, 'test');
    expect(error.privateDetails.error.details).toBe('test');
    Log(testName, formatTitle, error);
    done();
  });
});

const throwTitle = 'Throw';
describe(throwTitle, () => {
  it('throws a dropp error with specific details', (done) => {
    const type = {
      type: 'test',
    };

    try {
      DroppError.throw(type, 'test', 'test', 'test');
      expect(false).toBe(true);
      Log(testName, throwTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe('test');
      expect(error.privateDetails.error.type).toBe(type);
      expect(error.privateDetails.error.source).toBe('test');
      expect(error.details.error.message).toBe('test');
      expect(error.privateDetails.error.details).toBe('test');
      Log(testName, throwTitle, error);
    }

    done();
  });
});

const throwServerErrorTitle = 'Throw Server error';
describe(throwServerErrorTitle, () => {
  it('throws a dropp error of type Server', (done) => {
    try {
      DroppError.throwServerError('test', 'test', 'test');
      expect(false).toBe(true);
      Log(testName, throwServerErrorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.Server.type);
      expect(error.privateDetails.error.type).toBe(DroppError.type.Server);
      expect(error.privateDetails.error.source).toBe('test');
      expect(error.details.error.message).toBe('test');
      expect(error.privateDetails.error.details).toBe('test');
      Log(testName, throwServerErrorTitle, error);
    }

    done();
  });
});

const throwResourceErrorTitle = 'Throw Resource error';
describe(throwResourceErrorTitle, () => {
  it('throws a dropp error of type Resource', (done) => {
    try {
      DroppError.throwResourceError('test', 'test', 'test');
      expect(false).toBe(true);
      Log(testName, throwResourceErrorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.Resource.type);
      expect(error.privateDetails.error.type).toBe(DroppError.type.Resource);
      expect(error.privateDetails.error.source).toBe('test');
      expect(error.details.error.message).toBe('test');
      expect(error.privateDetails.error.details).toBe('test');
      Log(testName, throwResourceErrorTitle, error);
    }

    done();
  });
});

const throwResourceDneErrorTitle = 'Throw Resource DNE error';
describe(throwResourceDneErrorTitle, () => {
  it('throws a dropp error of type Resource DNE', (done) => {
    try {
      DroppError.throwResourceDneError('test', 'test', 'test');
      expect(false).toBe(true);
      Log(testName, throwResourceDneErrorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.ResourceDNE.type);
      expect(error.privateDetails.error.type).toBe(DroppError.type.ResourceDNE);
      expect(error.privateDetails.error.source).toBe('test');
      expect(error.details.error.message).toBe('That test does not exist');
      expect(error.privateDetails.error.details).toBe('test');
      Log(testName, throwResourceDneErrorTitle, error);
    }

    done();
  });
});

const throwInvalidRequestErrorTitle = 'Throw Invalid Request error';
describe(throwInvalidRequestErrorTitle, () => {
  it('throws a dropp error of type Invalid Request', (done) => {
    try {
      DroppError.throwInvalidRequestError('test', 'test', 'test');
      expect(false).toBe(true);
      Log(testName, throwInvalidRequestErrorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.privateDetails.error.type).toBe(DroppError.type.InvalidRequest);
      expect(error.privateDetails.error.source).toBe('test');
      expect(error.details.error.message).toBe('test');
      expect(error.privateDetails.error.details).toBe('test');
      Log(testName, throwInvalidRequestErrorTitle, error);
    }

    done();
  });
});

const throwLoginErrorTitle = 'Throw Login error';
describe(throwLoginErrorTitle, () => {
  it('throws a dropp error of type Login', (done) => {
    try {
      DroppError.throwLoginError('test', 'test', 'test');
      expect(false).toBe(true);
      Log(testName, throwLoginErrorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.Login.type);
      expect(error.privateDetails.error.type).toBe(DroppError.type.Login);
      expect(error.privateDetails.error.source).toBe('test');
      expect(error.details.error.message).toBe('test');
      expect(error.privateDetails.error.details).toBe('test');
      Log(testName, throwLoginErrorTitle, error);
    }

    done();
  });
});

const handleJwtErrorTitle = 'Handle JWT error title';
describe(handleJwtErrorTitle, () => {
  it('returns the default message for an invalid error', (done) => {
    const message = DroppError.handleJwtError();
    expect(message).toBe(DroppError.TokenReason.unknown);
    Log(testName, handleJwtErrorTitle, message);
    done();
  });

  it('returns the expected message for error containing \'Unexpected token\'', (done) => {
    const error = `${Utils.newUuid()}Unexpected token${Utils.newUuid()}`;
    const message = DroppError.handleJwtError(error);
    expect(message).toBe(DroppError.TokenReason.invalid);
    Log(testName, handleJwtErrorTitle, message);
    done();
  });

  it('returns the expected message for error equal to \'jwt expired\'', (done) => {
    const error = 'jwt expired';
    const message = DroppError.handleJwtError(error);
    expect(message).toBe(DroppError.TokenReason.expired);
    Log(testName, handleJwtErrorTitle, message);
    done();
  });

  it('returns the expected message for error equal to \'invalid token\'', (done) => {
    const error = 'invalid token';
    const message = DroppError.handleJwtError(error);
    expect(message).toBe(DroppError.TokenReason.invalid);
    Log(testName, handleJwtErrorTitle, message);
    done();
  });

  it('returns the expected message for error equal to \'invalid signature\'', (done) => {
    const error = 'invalid signature';
    const message = DroppError.handleJwtError(error);
    expect(message).toBe(DroppError.TokenReason.invalid);
    Log(testName, handleJwtErrorTitle, message);
    done();
  });

  it('returns the expected message for error equal to \'jwt malformed\'', (done) => {
    const error = 'jwt malformed';
    const message = DroppError.handleJwtError(error);
    expect(message).toBe(DroppError.TokenReason.invalid);
    Log(testName, handleJwtErrorTitle, message);
    done();
  });

  it('returns the expected message for error equal to \'Unexpected token\'', (done) => {
    const error = 'jwt malformed';
    const message = DroppError.handleJwtError(error);
    expect(message).toBe(DroppError.TokenReason.invalid);
    Log(testName, handleJwtErrorTitle, message);
    done();
  });

  it('returns the expected message for error equal to \'No auth token\'', (done) => {
    const error = 'No auth token';
    const message = DroppError.handleJwtError(error);
    expect(message).toBe(DroppError.TokenReason.missing);
    Log(testName, handleJwtErrorTitle, message);
    done();
  });

  it('returns the expected message for error equal to \'jwt must be provided\'', (done) => {
    const error = 'jwt must be provided';
    const message = DroppError.handleJwtError(error);
    expect(message).toBe(DroppError.TokenReason.missing);
    Log(testName, handleJwtErrorTitle, message);
    done();
  });
});

const handleAuthErrorTitle = 'Handle Authentication error title';
describe(handleAuthErrorTitle, () => {
  it('returns the default details for an invalid error', (done) => {
    const error = DroppError.handleAuthError('test', null, null, null);
    expect(error.details.error.type).toBe(DroppError.type.Auth.type);
    expect(error.privateDetails.error.type).toBe(DroppError.type.Auth);
    expect(error.privateDetails.error.source).toBe('test');
    expect(error.details.error.message).toBe(DroppError.type.Auth.message);
    expect(error.privateDetails.error.details).toBe('Unknown error');
    Log(testName, handleAuthErrorTitle, error);
    done();
  });

  it('returns the correct details for a passport error', (done) => {
    const details = {
      passportError: 'test',
    };

    const error = DroppError.handleAuthError(null, null, null, details);
    expect(error.details.error.type).toBe(DroppError.type.Auth.type);
    expect(error.privateDetails.error.type).toBe(DroppError.type.Auth);
    expect(error.details.error.message).toBe(DroppError.type.Auth.message);
    expect(error.privateDetails.error.details).toBe('test');
    Log(testName, handleAuthErrorTitle, error);
    done();
  });

  it('returns the correct details for a token error', (done) => {
    const details = {
      tokenError: {
        message: 'test',
      },
    };

    const error = DroppError.handleAuthError(null, null, null, details);
    expect(error.details.error.type).toBe(DroppError.type.Auth.type);
    expect(error.privateDetails.error.type).toBe(DroppError.type.Auth);
    expect(error.details.error.message).toBe(DroppError.TokenReason.unknown);
    expect(error.privateDetails.error.details).toBe('test');
    Log(testName, handleAuthErrorTitle, error);
    done();
  });

  it('returns the correct details for missing user info', (done) => {
    const details = {
      userInfoMissing: true,
    };

    const error = DroppError.handleAuthError(null, null, null, details);
    expect(error.details.error.type).toBe(DroppError.type.Auth.type);
    expect(error.privateDetails.error.type).toBe(DroppError.type.Auth);
    expect(error.details.error.message).toBe(DroppError.TokenReason.expired);
    expect(error.privateDetails.error.details).toBe('User for this token cannot be found');
    Log(testName, handleAuthErrorTitle, error);
    done();
  });
});

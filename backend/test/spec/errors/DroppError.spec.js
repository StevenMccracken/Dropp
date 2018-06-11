const Log = require('../../logger');
const Utils = require('../../../src/utilities/utils');
const DroppError = require('../../../src/errors/DroppError');

const testName = 'Dropp Error';
const constructorTitle = 'Constructor';
/* eslint-disable no-undef */
describe(constructorTitle, () => {
  const it1 = 'creates a dropp error object with default details';
  it(it1, () => {
    Log.it(testName, constructorTitle, it1, true);
    const error = new DroppError();
    expect(error.name).toBe('DroppError');
    expect(error.statusCode).toBeNull();
    expect(Object.keys(error.details).length).toBe(0);
    expect(Object.keys(error.privateDetails).length).toBe(0);
    Log.log(testName, constructorTitle, error);
    Log.it(testName, constructorTitle, it1, false);
  });

  const it2 = 'creates a dropp error object with specific details';
  it(it2, () => {
    Log.it(testName, constructorTitle, it2, true);
    const error = new DroppError('test', 'test');
    expect(error.name).toBe('DroppError');
    expect(error.details).toBe('test');
    expect(error.privateDetails).toBe('test');
    expect(error.statusCode).toBeNull();
    Log.log(testName, constructorTitle, error);
    Log.it(testName, constructorTitle, it2, false);
  });

  const it3 = 'creates a dropp error object with specific private details';
  it(it3, () => {
    Log.it(testName, constructorTitle, it3, true);
    const privateDetails = {
      error: 'test',
    };

    const error = new DroppError('test', privateDetails);
    expect(error.name).toBe('DroppError');
    expect(error.details).toBe('test');
    expect(error.privateDetails).toBe(privateDetails);
    expect(error.statusCode).toBeNull();
    Log.log(testName, constructorTitle, error);
    Log.it(testName, constructorTitle, it3, false);
  });

  const it4 = 'creates a dropp error object with a null status code when private details are null';
  it(it4, () => {
    Log.it(testName, constructorTitle, it4, true);
    const error = new DroppError();
    error.privateDetails = null;
    expect(error.name).toBe('DroppError');
    expect(error.statusCode).toBeNull();
    Log.log(testName, constructorTitle, error);
    Log.it(testName, constructorTitle, it4, false);
  });

  const it5 = 'creates a dropp error object without a status code in the private details';
  it(it5, () => {
    Log.it(testName, constructorTitle, it5, true);
    const privateDetails = {
      error: {
        type: 'test',
      },
    };

    const error = new DroppError('test', privateDetails);
    expect(error.name).toBe('DroppError');
    expect(error.privateDetails).toBe(privateDetails);
    expect(error.statusCode).not.toBeDefined();
    Log.log(testName, constructorTitle, error);
    Log.it(testName, constructorTitle, it5, false);
  });

  const it6 = 'creates a dropp error object without a status code in the private details';
  it(it6, () => {
    Log.it(testName, constructorTitle, it6, true);
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
    Log.log(testName, constructorTitle, error);
    Log.it(testName, constructorTitle, it6, false);
  });

  const it7 = 'creates a dropp error object with a status code in the private details';
  it(it7, () => {
    Log.it(testName, constructorTitle, it7, true);
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
    Log.log(testName, constructorTitle, error);
    Log.it(testName, constructorTitle, it7, false);
  });
});

const formatTitle = 'Format';
describe(formatTitle, () => {
  const it1 = 'creates a dropp error object';
  it(it1, () => {
    Log.it(testName, formatTitle, it1, true);
    const error = DroppError.format();
    expect(typeof error.details.error.id).toBe('string');
    expect(error.details.error.type).toBe(DroppError.type.Server.type);
    expect(error.details.error.message).toBe(DroppError.type.Server.message);
    expect(error.privateDetails.error.id).toBe(error.details.error.id);
    expect(typeof error.privateDetails.error.timestamp).toBe('string');
    expect(error.privateDetails.error.type).not.toBeDefined();
    expect(error.privateDetails.error.source).not.toBeDefined();
    expect(error.privateDetails.error.details).toBe(DroppError.type.Server.message);
    Log.log(testName, formatTitle, error);
    Log.it(testName, formatTitle, it1, false);
  });

  const it2 = 'creates a dropp error object with an array client message';
  it(it2, () => {
    Log.it(testName, formatTitle, it2, true);
    const error = DroppError.format(null, null, [1, 2]);
    expect(error.details.error.message).toBe('1,2');
    expect(error.privateDetails.error.details).toBe('1,2');
    Log.log(testName, formatTitle, error);
    Log.it(testName, formatTitle, it2, false);
  });

  const it3 = 'creates a dropp error object with a string client message';
  it(it3, () => {
    Log.it(testName, formatTitle, it3, true);
    const error = DroppError.format(null, null, 'test');
    expect(error.details.error.message).toBe('test');
    expect(error.privateDetails.error.details).toBe('test');
    Log.log(testName, formatTitle, error);
    Log.it(testName, formatTitle, it3, false);
  });

  const it4 = 'creates a dropp error object with a client message of the type';
  it(it4, () => {
    Log.it(testName, formatTitle, it4, true);
    const type = {
      message: 'test',
    };

    const error = DroppError.format(type);
    expect(error.details.error.message).toBe('test');
    expect(error.privateDetails.error.details).toBe('test');
    Log.log(testName, formatTitle, error);
    Log.it(testName, formatTitle, it4, false);
  });

  const it5 = 'creates a dropp error object with a client message of the type';
  it(it5, () => {
    Log.it(testName, formatTitle, it5, true);
    const type = {
      type: 'test',
      message: 'test',
    };

    const error = DroppError.format(type);
    expect(error.details.error.type).toBe('test');
    expect(error.privateDetails.error.type).toBe(type);
    expect(error.details.error.message).toBe('test');
    expect(error.privateDetails.error.details).toBe('test');
    Log.log(testName, formatTitle, error);
    Log.it(testName, formatTitle, it5, false);
  });

  const it6 = 'creates a dropp error object with a specific server message';
  it(it6, () => {
    Log.it(testName, formatTitle, it6, true);
    const error = DroppError.format(null, null, null, 'test');
    expect(error.privateDetails.error.details).toBe('test');
    Log.log(testName, formatTitle, error);
    Log.it(testName, formatTitle, it6, false);
  });
});

const throwTitle = 'Throw';
describe(throwTitle, () => {
  const it1 = 'throws a dropp error with specific details';
  it(it1, () => {
    Log.it(testName, throwTitle, it1, true);
    const type = {
      type: 'test',
    };

    try {
      DroppError.throw(type, 'test', 'test', 'test');
      expect(false).toBe(true);
      Log.log(testName, throwTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe('test');
      expect(error.privateDetails.error.type).toBe(type);
      expect(error.privateDetails.error.source).toBe('test');
      expect(error.details.error.message).toBe('test');
      expect(error.privateDetails.error.details).toBe('test');
      Log.log(testName, throwTitle, error);
    }

    Log.it(testName, throwTitle, it1, false);
  });
});

const throwServerErrorTitle = 'Throw Server error';
describe(throwServerErrorTitle, () => {
  const it1 = 'throws a dropp error of type Server';
  it(it1, () => {
    Log.it(testName, throwServerErrorTitle, it1, true);
    try {
      DroppError.throwServerError('test', 'test', 'test');
      expect(false).toBe(true);
      Log.log(testName, throwServerErrorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.Server.type);
      expect(error.privateDetails.error.type).toBe(DroppError.type.Server);
      expect(error.privateDetails.error.source).toBe('test');
      expect(error.details.error.message).toBe('test');
      expect(error.privateDetails.error.details).toBe('test');
      Log.log(testName, throwServerErrorTitle, error);
    }

    Log.it(testName, throwServerErrorTitle, it1, false);
  });
});

const throwResourceErrorTitle = 'Throw Resource error';
describe(throwResourceErrorTitle, () => {
  const it1 = 'throws a dropp error of type Resource';
  it(it1, () => {
    Log.it(testName, throwResourceErrorTitle, it1, true);
    try {
      DroppError.throwResourceError('test', 'test', 'test');
      expect(false).toBe(true);
      Log.log(testName, throwResourceErrorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.Resource.type);
      expect(error.privateDetails.error.type).toBe(DroppError.type.Resource);
      expect(error.privateDetails.error.source).toBe('test');
      expect(error.details.error.message).toBe('test');
      expect(error.privateDetails.error.details).toBe('test');
      Log.log(testName, throwResourceErrorTitle, error);
    }

    Log.it(testName, throwResourceErrorTitle, it1, false);
  });
});

const throwResourceDneErrorTitle = 'Throw Resource DNE error';
describe(throwResourceDneErrorTitle, () => {
  const it1 = 'throws a dropp error of type Resource DNE';
  it(it1, () => {
    Log.it(testName, throwResourceDneErrorTitle, it1, true);
    try {
      DroppError.throwResourceDneError('test', 'test', 'test');
      expect(false).toBe(true);
      Log.log(testName, throwResourceDneErrorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.ResourceDNE.type);
      expect(error.privateDetails.error.type).toBe(DroppError.type.ResourceDNE);
      expect(error.privateDetails.error.source).toBe('test');
      expect(error.details.error.message).toBe('That test does not exist');
      expect(error.privateDetails.error.details).toBe('test');
      Log.log(testName, throwResourceDneErrorTitle, error);
    }

    Log.it(testName, throwResourceDneErrorTitle, it1, false);
  });
});

const throwInvalidRequestErrorTitle = 'Throw Invalid Request error';
describe(throwInvalidRequestErrorTitle, () => {
  const it1 = 'throws a dropp error of type Invalid Request';
  it(it1, () => {
    Log.it(testName, throwInvalidRequestErrorTitle, it1, true);
    try {
      DroppError.throwInvalidRequestError('test', 'test', 'test');
      expect(false).toBe(true);
      Log.log(testName, throwInvalidRequestErrorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.privateDetails.error.type).toBe(DroppError.type.InvalidRequest);
      expect(error.privateDetails.error.source).toBe('test');
      expect(error.details.error.message).toBe('test');
      expect(error.privateDetails.error.details).toBe('test');
      Log.log(testName, throwInvalidRequestErrorTitle, error);
    }

    Log.it(testName, throwInvalidRequestErrorTitle, it1, false);
  });
});

const throwLoginErrorTitle = 'Throw Login error';
describe(throwLoginErrorTitle, () => {
  const it1 = 'throws a dropp error of type Login';
  it(it1, () => {
    Log.it(testName, throwLoginErrorTitle, it1, true);
    try {
      DroppError.throwLoginError('test', 'test', 'test');
      expect(false).toBe(true);
      Log.log(testName, throwLoginErrorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.Login.type);
      expect(error.privateDetails.error.type).toBe(DroppError.type.Login);
      expect(error.privateDetails.error.source).toBe('test');
      expect(error.details.error.message).toBe('test');
      expect(error.privateDetails.error.details).toBe('test');
      Log.log(testName, throwLoginErrorTitle, error);
    }

    Log.it(testName, throwLoginErrorTitle, it1, false);
  });
});

const handleJwtErrorTitle = 'Handle JWT error title';
describe(handleJwtErrorTitle, () => {
  const it1 = 'returns the default message for an invalid error';
  it(it1, () => {
    Log.it(testName, handleJwtErrorTitle, it1, true);
    const message = DroppError.handleJwtError();
    expect(message).toBe(DroppError.TokenReason.unknown);
    Log.log(testName, handleJwtErrorTitle, message);
    Log.it(testName, handleJwtErrorTitle, it1, false);
  });

  const it2 = 'returns the expected message for error containing \'Unexpected token\'';
  it(it2, () => {
    Log.it(testName, handleJwtErrorTitle, it2, true);
    const error = `${Utils.newUuid()}Unexpected token${Utils.newUuid()}`;
    const message = DroppError.handleJwtError(error);
    expect(message).toBe(DroppError.TokenReason.invalid);
    Log.log(testName, handleJwtErrorTitle, message);
    Log.it(testName, handleJwtErrorTitle, it2, false);
  });

  const it3 = 'returns the expected message for error equal to \'jwt expired\'';
  it(it3, () => {
    Log.it(testName, handleJwtErrorTitle, it3, true);
    const error = 'jwt expired';
    const message = DroppError.handleJwtError(error);
    expect(message).toBe(DroppError.TokenReason.expired);
    Log.log(testName, handleJwtErrorTitle, message);
    Log.it(testName, handleJwtErrorTitle, it3, false);
  });

  const it4 = 'returns the expected message for error equal to \'invalid token\'';
  it(it4, () => {
    Log.it(testName, handleJwtErrorTitle, it4, true);
    const error = 'invalid token';
    const message = DroppError.handleJwtError(error);
    expect(message).toBe(DroppError.TokenReason.invalid);
    Log.log(testName, handleJwtErrorTitle, message);
    Log.it(testName, handleJwtErrorTitle, it4, false);
  });

  const it5 = 'returns the expected message for error equal to \'invalid signature\'';
  it(it5, () => {
    Log.it(testName, handleJwtErrorTitle, it5, true);
    const error = 'invalid signature';
    const message = DroppError.handleJwtError(error);
    expect(message).toBe(DroppError.TokenReason.invalid);
    Log.log(testName, handleJwtErrorTitle, message);
    Log.it(testName, handleJwtErrorTitle, it5, false);
  });

  const it6 = 'returns the expected message for error equal to \'jwt malformed\'';
  it(it6, () => {
    Log.it(testName, handleJwtErrorTitle, it6, true);
    const error = 'jwt malformed';
    const message = DroppError.handleJwtError(error);
    expect(message).toBe(DroppError.TokenReason.invalid);
    Log.log(testName, handleJwtErrorTitle, message);
    Log.it(testName, handleJwtErrorTitle, it6, false);
  });

  const it7 = 'returns the expected message for error equal to \'Unexpected token\'';
  it(it7, () => {
    Log.it(testName, handleJwtErrorTitle, it7, true);
    const error = 'jwt malformed';
    const message = DroppError.handleJwtError(error);
    expect(message).toBe(DroppError.TokenReason.invalid);
    Log.log(testName, handleJwtErrorTitle, message);
    Log.it(testName, handleJwtErrorTitle, it7, false);
  });

  const it8 = 'returns the expected message for error equal to \'No auth token\'';
  it(it8, () => {
    Log.it(testName, handleJwtErrorTitle, it8, true);
    const error = 'No auth token';
    const message = DroppError.handleJwtError(error);
    expect(message).toBe(DroppError.TokenReason.missing);
    Log.log(testName, handleJwtErrorTitle, message);
    Log.it(testName, handleJwtErrorTitle, it8, false);
  });

  const it9 = 'returns the expected message for error equal to \'jwt must be provided\'';
  it(it9, () => {
    Log.it(testName, handleJwtErrorTitle, it9, true);
    const error = 'jwt must be provided';
    const message = DroppError.handleJwtError(error);
    expect(message).toBe(DroppError.TokenReason.missing);
    Log.log(testName, handleJwtErrorTitle, message);
    Log.it(testName, handleJwtErrorTitle, it9, false);
  });
});

const handleAuthErrorTitle = 'Handle Authentication error title';
describe(handleAuthErrorTitle, () => {
  const it1 = 'returns the default details for an invalid error';
  it(it1, () => {
    Log.it(testName, handleAuthErrorTitle, it1, true);
    const error = DroppError.handleAuthError('test', null, null, null);
    expect(error.details.error.type).toBe(DroppError.type.Auth.type);
    expect(error.privateDetails.error.type).toBe(DroppError.type.Auth);
    expect(error.privateDetails.error.source).toBe('test');
    expect(error.details.error.message).toBe(DroppError.type.Auth.message);
    expect(error.privateDetails.error.details).toBe('Unknown error');
    Log.log(testName, handleAuthErrorTitle, error);
    Log.it(testName, handleAuthErrorTitle, it1, false);
  });

  const it2 = 'returns the correct details for a passport error';
  it(it2, () => {
    Log.it(testName, handleAuthErrorTitle, it2, true);
    const details = {
      passportError: 'test',
    };

    const error = DroppError.handleAuthError(null, null, null, details);
    expect(error.details.error.type).toBe(DroppError.type.Auth.type);
    expect(error.privateDetails.error.type).toBe(DroppError.type.Auth);
    expect(error.details.error.message).toBe(DroppError.type.Auth.message);
    expect(error.privateDetails.error.details).toBe('test');
    Log.log(testName, handleAuthErrorTitle, error);
    Log.it(testName, handleAuthErrorTitle, it2, false);
  });

  const it3 = 'returns the correct details for a token error';
  it(it3, () => {
    Log.it(testName, handleAuthErrorTitle, it3, true);
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
    Log.log(testName, handleAuthErrorTitle, error);
    Log.it(testName, handleAuthErrorTitle, it3, false);
  });

  const it4 = 'returns the correct details for missing user info';
  it(it4, () => {
    Log.it(testName, handleAuthErrorTitle, it4, true);
    const details = {
      userInfoMissing: true,
    };

    const error = DroppError.handleAuthError(null, null, null, details);
    expect(error.details.error.type).toBe(DroppError.type.Auth.type);
    expect(error.privateDetails.error.type).toBe(DroppError.type.Auth);
    expect(error.details.error.message).toBe(DroppError.TokenReason.expired);
    expect(error.privateDetails.error.details).toBe('User for this token cannot be found');
    Log.log(testName, handleAuthErrorTitle, error);
    Log.it(testName, handleAuthErrorTitle, it4, false);
  });
});

const Log = require('../../logger');
const TestConstants = require('../../constants');
const Utils = require('../../../src/utilities/utils');
const DroppError = require('../../../src/errors/DroppError');
const Constants = require('../../../src/utilities/constants');

const constructorTitle = 'Constructor';
/* eslint-disable no-undef */
describe(constructorTitle, () => {
  const it1 = 'creates a dropp error object with default details';
  it(it1, () => {
    Log.it(TestConstants.errors.dropp.testName, constructorTitle, it1, true);
    const error = new DroppError();
    expect(error.name).toBe(Constants.errors.dropp.name);
    expect(error.statusCode).toBeNull();
    expect(Object.keys(error.details).length).toBe(0);
    expect(Object.keys(error.privateDetails).length).toBe(0);
    Log.log(TestConstants.errors.dropp.testName, constructorTitle, error);
    Log.it(TestConstants.errors.dropp.testName, constructorTitle, it1, false);
  });

  const it2 = 'creates a dropp error object with specific details';
  it(it2, () => {
    Log.it(TestConstants.errors.dropp.testName, constructorTitle, it2, true);
    const error = new DroppError(TestConstants.params.test, TestConstants.params.test);
    expect(error.name).toBe(Constants.errors.dropp.name);
    expect(error.details).toBe(TestConstants.params.test);
    expect(error.privateDetails).toBe(TestConstants.params.test);
    expect(error.statusCode).toBeNull();
    Log.log(TestConstants.errors.dropp.testName, constructorTitle, error);
    Log.it(TestConstants.errors.dropp.testName, constructorTitle, it2, false);
  });

  const it3 = 'creates a dropp error object with specific private details';
  it(it3, () => {
    Log.it(TestConstants.errors.dropp.testName, constructorTitle, it3, true);
    const privateDetails = {
      error: TestConstants.params.test,
    };

    const error = new DroppError(TestConstants.params.test, privateDetails);
    expect(error.name).toBe(Constants.errors.dropp.name);
    expect(error.details).toBe(TestConstants.params.test);
    expect(error.privateDetails).toBe(privateDetails);
    expect(error.statusCode).toBeNull();
    Log.log(TestConstants.errors.dropp.testName, constructorTitle, error);
    Log.it(TestConstants.errors.dropp.testName, constructorTitle, it3, false);
  });

  const it4 = 'creates a dropp error object with a null status code when private details are null';
  it(it4, () => {
    Log.it(TestConstants.errors.dropp.testName, constructorTitle, it4, true);
    const error = new DroppError();
    error.privateDetails = null;
    expect(error.name).toBe(Constants.errors.dropp.name);
    expect(error.statusCode).toBeNull();
    Log.log(TestConstants.errors.dropp.testName, constructorTitle, error);
    Log.it(TestConstants.errors.dropp.testName, constructorTitle, it4, false);
  });

  const it5 = 'creates a dropp error object without a status code in the private details';
  it(it5, () => {
    Log.it(TestConstants.errors.dropp.testName, constructorTitle, it5, true);
    const privateDetails = {
      error: {
        type: TestConstants.params.test,
      },
    };

    const error = new DroppError(TestConstants.params.test, privateDetails);
    expect(error.name).toBe(Constants.errors.dropp.name);
    expect(error.privateDetails).toBe(privateDetails);
    expect(error.statusCode).not.toBeDefined();
    Log.log(TestConstants.errors.dropp.testName, constructorTitle, error);
    Log.it(TestConstants.errors.dropp.testName, constructorTitle, it5, false);
  });

  const it6 = 'creates a dropp error object without a status code in the private details';
  it(it6, () => {
    Log.it(TestConstants.errors.dropp.testName, constructorTitle, it6, true);
    const privateDetails = {
      error: {
        type: TestConstants.params.test,
      },
    };

    const error = new DroppError(TestConstants.params.test, privateDetails);
    expect(error.name).toBe(Constants.errors.dropp.name);
    expect(error.details).toBe(TestConstants.params.test);
    expect(error.privateDetails).toBe(privateDetails);
    expect(error.statusCode).not.toBeDefined();
    Log.log(TestConstants.errors.dropp.testName, constructorTitle, error);
    Log.it(TestConstants.errors.dropp.testName, constructorTitle, it6, false);
  });

  const it7 = 'creates a dropp error object with a status code in the private details';
  it(it7, () => {
    Log.it(TestConstants.errors.dropp.testName, constructorTitle, it7, true);
    const privateDetails = {
      error: {
        type: {
          status: TestConstants.params.test,
        },
      },
    };

    const error = new DroppError(TestConstants.params.test, privateDetails);
    expect(error.name).toBe(Constants.errors.dropp.name);
    expect(error.details).toBe(TestConstants.params.test);
    expect(error.privateDetails).toBe(privateDetails);
    expect(error.statusCode).toBe(TestConstants.params.test);
    Log.log(TestConstants.errors.dropp.testName, constructorTitle, error);
    Log.it(TestConstants.errors.dropp.testName, constructorTitle, it7, false);
  });
});

const formatTitle = 'Format';
describe(formatTitle, () => {
  const it1 = 'creates a dropp error object';
  it(it1, () => {
    Log.it(TestConstants.errors.dropp.testName, formatTitle, it1, true);
    const error = DroppError.format();
    expect(typeof error.details.error.id).toBe('string');
    expect(error.details.error.type).toBe(DroppError.type.Server.type);
    expect(error.details.error.message).toBe(DroppError.type.Server.message);
    expect(error.privateDetails.error.id).toBe(error.details.error.id);
    expect(typeof error.privateDetails.error.timestamp).toBe('string');
    expect(error.privateDetails.error.type).not.toBeDefined();
    expect(error.privateDetails.error.source).not.toBeDefined();
    expect(error.privateDetails.error.details).toBe(DroppError.type.Server.message);
    Log.log(TestConstants.errors.dropp.testName, formatTitle, error);
    Log.it(TestConstants.errors.dropp.testName, formatTitle, it1, false);
  });

  const it2 = 'creates a dropp error object with an array client message';
  it(it2, () => {
    Log.it(TestConstants.errors.dropp.testName, formatTitle, it2, true);
    const numbers = [1, 2];
    const error = DroppError.format(null, null, numbers);
    expect(error.details.error.message).toBe(numbers.join());
    expect(error.privateDetails.error.details).toBe(numbers.join());
    Log.log(TestConstants.errors.dropp.testName, formatTitle, error);
    Log.it(TestConstants.errors.dropp.testName, formatTitle, it2, false);
  });

  const it3 = 'creates a dropp error object with a string client message';
  it(it3, () => {
    Log.it(TestConstants.errors.dropp.testName, formatTitle, it3, true);
    const error = DroppError.format(null, null, TestConstants.params.test);
    expect(error.details.error.message).toBe(TestConstants.params.test);
    expect(error.privateDetails.error.details).toBe(TestConstants.params.test);
    Log.log(TestConstants.errors.dropp.testName, formatTitle, error);
    Log.it(TestConstants.errors.dropp.testName, formatTitle, it3, false);
  });

  const it4 = 'creates a dropp error object with a client message of the type';
  it(it4, () => {
    Log.it(TestConstants.errors.dropp.testName, formatTitle, it4, true);
    const type = {
      message: TestConstants.params.test,
    };

    const error = DroppError.format(type);
    expect(error.details.error.message).toBe(TestConstants.params.test);
    expect(error.privateDetails.error.details).toBe(TestConstants.params.test);
    Log.log(TestConstants.errors.dropp.testName, formatTitle, error);
    Log.it(TestConstants.errors.dropp.testName, formatTitle, it4, false);
  });

  const it5 = 'creates a dropp error object with a client message of the type';
  it(it5, () => {
    Log.it(TestConstants.errors.dropp.testName, formatTitle, it5, true);
    const type = {
      type: TestConstants.params.test,
      message: TestConstants.params.test,
    };

    const error = DroppError.format(type);
    expect(error.details.error.type).toBe(TestConstants.params.test);
    expect(error.privateDetails.error.type).toBe(type);
    expect(error.details.error.message).toBe(TestConstants.params.test);
    expect(error.privateDetails.error.details).toBe(TestConstants.params.test);
    Log.log(TestConstants.errors.dropp.testName, formatTitle, error);
    Log.it(TestConstants.errors.dropp.testName, formatTitle, it5, false);
  });

  const it6 = 'creates a dropp error object with a specific server message';
  it(it6, () => {
    Log.it(TestConstants.errors.dropp.testName, formatTitle, it6, true);
    const error = DroppError.format(null, null, null, TestConstants.params.test);
    expect(error.privateDetails.error.details).toBe(TestConstants.params.test);
    Log.log(TestConstants.errors.dropp.testName, formatTitle, error);
    Log.it(TestConstants.errors.dropp.testName, formatTitle, it6, false);
  });
});

const throwTitle = 'Throw';
describe(throwTitle, () => {
  const it1 = 'throws a dropp error with specific details';
  it(it1, () => {
    Log.it(TestConstants.errors.dropp.testName, throwTitle, it1, true);
    const type = {
      type: TestConstants.params.test,
    };

    try {
      DroppError.throw(
        type,
        TestConstants.params.test,
        TestConstants.params.test,
        TestConstants.params.test
      );
      expect(false).toBe(true);
      Log.log(
        TestConstants.errors.dropp.testName,
        throwTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (error) {
      expect(error.name).toBe(Constants.errors.dropp.name);
      expect(error.details.error.type).toBe(TestConstants.params.test);
      expect(error.privateDetails.error.type).toBe(type);
      expect(error.privateDetails.error.source).toBe(TestConstants.params.test);
      expect(error.details.error.message).toBe(TestConstants.params.test);
      expect(error.privateDetails.error.details).toBe(TestConstants.params.test);
      Log.log(TestConstants.errors.dropp.testName, throwTitle, error);
    }

    Log.it(TestConstants.errors.dropp.testName, throwTitle, it1, false);
  });
});

const throwServerErrorTitle = 'Throw Server error';
describe(throwServerErrorTitle, () => {
  const it1 = 'throws a dropp error of type Server';
  it(it1, () => {
    Log.it(TestConstants.errors.dropp.testName, throwServerErrorTitle, it1, true);
    try {
      DroppError.throwServerError(
        TestConstants.params.test,
        TestConstants.params.test,
        TestConstants.params.test
      );
      expect(false).toBe(true);
      Log.log(
        TestConstants.errors.dropp.testName,
        throwServerErrorTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (error) {
      expect(error.name).toBe(Constants.errors.dropp.name);
      expect(error.details.error.type).toBe(DroppError.type.Server.type);
      expect(error.privateDetails.error.type).toBe(DroppError.type.Server);
      expect(error.privateDetails.error.source).toBe(TestConstants.params.test);
      expect(error.details.error.message).toBe(TestConstants.params.test);
      expect(error.privateDetails.error.details).toBe(TestConstants.params.test);
      Log.log(TestConstants.errors.dropp.testName, throwServerErrorTitle, error);
    }

    Log.it(TestConstants.errors.dropp.testName, throwServerErrorTitle, it1, false);
  });
});

const throwResourceErrorTitle = 'Throw Resource error';
describe(throwResourceErrorTitle, () => {
  const it1 = 'throws a dropp error of type Resource';
  it(it1, () => {
    Log.it(TestConstants.errors.dropp.testName, throwResourceErrorTitle, it1, true);
    try {
      DroppError.throwResourceError(
        TestConstants.params.test,
        TestConstants.params.test,
        TestConstants.params.test
      );
      expect(false).toBe(true);
      Log.log(
        TestConstants.errors.dropp.testName,
        throwResourceErrorTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (error) {
      expect(error.name).toBe(Constants.errors.dropp.name);
      expect(error.details.error.type).toBe(DroppError.type.Resource.type);
      expect(error.privateDetails.error.type).toBe(DroppError.type.Resource);
      expect(error.privateDetails.error.source).toBe(TestConstants.params.test);
      expect(error.details.error.message).toBe(TestConstants.params.test);
      expect(error.privateDetails.error.details).toBe(TestConstants.params.test);
      Log.log(TestConstants.errors.dropp.testName, throwResourceErrorTitle, error);
    }

    Log.it(TestConstants.errors.dropp.testName, throwResourceErrorTitle, it1, false);
  });
});

const throwResourceDneErrorTitle = 'Throw Resource DNE error';
describe(throwResourceDneErrorTitle, () => {
  const it1 = 'throws a dropp error of type Resource DNE';
  it(it1, () => {
    Log.it(TestConstants.errors.dropp.testName, throwResourceDneErrorTitle, it1, true);
    try {
      DroppError.throwResourceDneError(
        TestConstants.params.test,
        TestConstants.params.test,
        TestConstants.params.test
      );
      expect(false).toBe(true);
      Log.log(
        TestConstants.errors.dropp.testName,
        throwResourceDneErrorTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (error) {
      expect(error.name).toBe(Constants.errors.dropp.name);
      expect(error.details.error.type).toBe(DroppError.type.ResourceDNE.type);
      expect(error.privateDetails.error.type).toBe(DroppError.type.ResourceDNE);
      expect(error.privateDetails.error.source).toBe(TestConstants.params.test);
      expect(error.details.error.message)
        .toBe(TestConstants.messages.doesNotExist(TestConstants.params.test));
      expect(error.privateDetails.error.details).toBe(TestConstants.params.test);
      Log.log(TestConstants.errors.dropp.testName, throwResourceDneErrorTitle, error);
    }

    Log.it(TestConstants.errors.dropp.testName, throwResourceDneErrorTitle, it1, false);
  });
});

const throwInvalidRequestErrorTitle = 'Throw Invalid Request error';
describe(throwInvalidRequestErrorTitle, () => {
  const it1 = 'throws a dropp error of type Invalid Request';
  it(it1, () => {
    Log.it(TestConstants.errors.dropp.testName, throwInvalidRequestErrorTitle, it1, true);
    try {
      DroppError.throwInvalidRequestError(
        TestConstants.params.test,
        TestConstants.params.test,
        TestConstants.params.test
      );
      expect(false).toBe(true);
      Log.log(
        TestConstants.errors.dropp.testName,
        throwInvalidRequestErrorTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (error) {
      expect(error.name).toBe(Constants.errors.dropp.name);
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.privateDetails.error.type).toBe(DroppError.type.InvalidRequest);
      expect(error.privateDetails.error.source).toBe(TestConstants.params.test);
      expect(error.details.error.message).toBe(TestConstants.params.test);
      expect(error.privateDetails.error.details).toBe(TestConstants.params.test);
      Log.log(TestConstants.errors.dropp.testName, throwInvalidRequestErrorTitle, error);
    }

    Log.it(TestConstants.errors.dropp.testName, throwInvalidRequestErrorTitle, it1, false);
  });
});

const throwLoginErrorTitle = 'Throw Login error';
describe(throwLoginErrorTitle, () => {
  const it1 = 'throws a dropp error of type Login';
  it(it1, () => {
    Log.it(TestConstants.errors.dropp.testName, throwLoginErrorTitle, it1, true);
    try {
      DroppError.throwLoginError(
        TestConstants.params.test,
        TestConstants.params.test,
        TestConstants.params.test
      );
      expect(false).toBe(true);
      Log.log(
        TestConstants.errors.dropp.testName,
        throwLoginErrorTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (error) {
      expect(error.name).toBe(Constants.errors.dropp.name);
      expect(error.details.error.type).toBe(DroppError.type.Login.type);
      expect(error.privateDetails.error.type).toBe(DroppError.type.Login);
      expect(error.privateDetails.error.source).toBe(TestConstants.params.test);
      expect(error.details.error.message).toBe(TestConstants.params.test);
      expect(error.privateDetails.error.details).toBe(TestConstants.params.test);
      Log.log(TestConstants.errors.dropp.testName, throwLoginErrorTitle, error);
    }

    Log.it(TestConstants.errors.dropp.testName, throwLoginErrorTitle, it1, false);
  });
});

const handleJwtErrorTitle = 'Handle JWT error title';
describe(handleJwtErrorTitle, () => {
  const it1 = 'returns the default message for an invalid error';
  it(it1, () => {
    Log.it(TestConstants.errors.dropp.testName, handleJwtErrorTitle, it1, true);
    const message = DroppError.handleJwtError();
    expect(message).toBe(DroppError.TokenReason.unknown);
    Log.log(TestConstants.errors.dropp.testName, handleJwtErrorTitle, message);
    Log.it(TestConstants.errors.dropp.testName, handleJwtErrorTitle, it1, false);
  });

  const it2 = `returns the expected message for error containing '${TestConstants.auth.errors.unexpectedToken}'`;
  it(it2, () => {
    Log.it(TestConstants.errors.dropp.testName, handleJwtErrorTitle, it2, true);
    const error = `${Utils.newUuid()}${TestConstants.auth.errors.unexpectedToken}${Utils.newUuid()}`;
    const message = DroppError.handleJwtError(error);
    expect(message).toBe(DroppError.TokenReason.invalid);
    Log.log(TestConstants.errors.dropp.testName, handleJwtErrorTitle, message);
    Log.it(TestConstants.errors.dropp.testName, handleJwtErrorTitle, it2, false);
  });

  const it3 = TestConstants.messages.expectedMessage(TestConstants.auth.errors.expired);
  it(it3, () => {
    Log.it(TestConstants.errors.dropp.testName, handleJwtErrorTitle, it3, true);
    const message = DroppError.handleJwtError(TestConstants.auth.errors.expired);
    expect(message).toBe(DroppError.TokenReason.expired);
    Log.log(TestConstants.errors.dropp.testName, handleJwtErrorTitle, message);
    Log.it(TestConstants.errors.dropp.testName, handleJwtErrorTitle, it3, false);
  });

  const it4 = TestConstants.messages.expectedMessage(TestConstants.auth.errors.invalidToken);
  it(it4, () => {
    Log.it(TestConstants.errors.dropp.testName, handleJwtErrorTitle, it4, true);
    const message = DroppError.handleJwtError(TestConstants.auth.errors.invalidToken);
    expect(message).toBe(DroppError.TokenReason.invalid);
    Log.log(TestConstants.errors.dropp.testName, handleJwtErrorTitle, message);
    Log.it(TestConstants.errors.dropp.testName, handleJwtErrorTitle, it4, false);
  });

  const it5 = TestConstants.messages.expectedMessage(TestConstants.auth.errors.invalidSignature);
  it(it5, () => {
    Log.it(TestConstants.errors.dropp.testName, handleJwtErrorTitle, it5, true);
    const message = DroppError.handleJwtError(TestConstants.auth.errors.invalidSignature);
    expect(message).toBe(DroppError.TokenReason.invalid);
    Log.log(TestConstants.errors.dropp.testName, handleJwtErrorTitle, message);
    Log.it(TestConstants.errors.dropp.testName, handleJwtErrorTitle, it5, false);
  });

  const it6 = TestConstants.messages.expectedMessage(TestConstants.auth.errors.malformed);
  it(it6, () => {
    Log.it(TestConstants.errors.dropp.testName, handleJwtErrorTitle, it6, true);
    const message = DroppError.handleJwtError(TestConstants.auth.errors.malformed);
    expect(message).toBe(DroppError.TokenReason.invalid);
    Log.log(TestConstants.errors.dropp.testName, handleJwtErrorTitle, message);
    Log.it(TestConstants.errors.dropp.testName, handleJwtErrorTitle, it6, false);
  });

  const it7 = TestConstants.messages.expectedMessage(TestConstants.auth.errors.unexpectedToken);
  it(it7, () => {
    Log.it(TestConstants.errors.dropp.testName, handleJwtErrorTitle, it7, true);
    const message = DroppError.handleJwtError(TestConstants.auth.errors.malformed);
    expect(message).toBe(DroppError.TokenReason.invalid);
    Log.log(TestConstants.errors.dropp.testName, handleJwtErrorTitle, message);
    Log.it(TestConstants.errors.dropp.testName, handleJwtErrorTitle, it7, false);
  });

  const it8 = TestConstants.messages.expectedMessage(TestConstants.auth.errors.noAuthToken);
  it(it8, () => {
    Log.it(TestConstants.errors.dropp.testName, handleJwtErrorTitle, it8, true);
    const message = DroppError.handleJwtError(TestConstants.auth.errors.noAuthToken);
    expect(message).toBe(DroppError.TokenReason.missing);
    Log.log(TestConstants.errors.dropp.testName, handleJwtErrorTitle, message);
    Log.it(TestConstants.errors.dropp.testName, handleJwtErrorTitle, it8, false);
  });

  const it9 = TestConstants.messages.expectedMessage(TestConstants.auth.errors.mustBeProvided);
  it(it9, () => {
    Log.it(TestConstants.errors.dropp.testName, handleJwtErrorTitle, it9, true);
    const message = DroppError.handleJwtError(TestConstants.auth.errors.mustBeProvided);
    expect(message).toBe(DroppError.TokenReason.missing);
    Log.log(TestConstants.errors.dropp.testName, handleJwtErrorTitle, message);
    Log.it(TestConstants.errors.dropp.testName, handleJwtErrorTitle, it9, false);
  });
});

const handleAuthErrorTitle = 'Handle Authentication error title';
describe(handleAuthErrorTitle, () => {
  const it1 = 'returns the default details for an invalid error';
  it(it1, () => {
    Log.it(TestConstants.errors.dropp.testName, handleAuthErrorTitle, it1, true);
    const error = DroppError.handleAuthError(TestConstants.params.test, null, null, null);
    expect(error.details.error.type).toBe(DroppError.type.Auth.type);
    expect(error.privateDetails.error.type).toBe(DroppError.type.Auth);
    expect(error.privateDetails.error.source).toBe(TestConstants.params.test);
    expect(error.details.error.message).toBe(DroppError.type.Auth.message);
    expect(error.privateDetails.error.details).toBe(Constants.errors.messages.unknown);
    Log.log(TestConstants.errors.dropp.testName, handleAuthErrorTitle, error);
    Log.it(TestConstants.errors.dropp.testName, handleAuthErrorTitle, it1, false);
  });

  const it2 = 'returns the correct details for a passport error';
  it(it2, () => {
    Log.it(TestConstants.errors.dropp.testName, handleAuthErrorTitle, it2, true);
    const details = {
      passportError: TestConstants.params.test,
    };

    const error = DroppError.handleAuthError(null, null, null, details);
    expect(error.details.error.type).toBe(DroppError.type.Auth.type);
    expect(error.privateDetails.error.type).toBe(DroppError.type.Auth);
    expect(error.details.error.message).toBe(DroppError.type.Auth.message);
    expect(error.privateDetails.error.details).toBe(TestConstants.params.test);
    Log.log(TestConstants.errors.dropp.testName, handleAuthErrorTitle, error);
    Log.it(TestConstants.errors.dropp.testName, handleAuthErrorTitle, it2, false);
  });

  const it3 = 'returns the correct details for a token error';
  it(it3, () => {
    Log.it(TestConstants.errors.dropp.testName, handleAuthErrorTitle, it3, true);
    const details = {
      tokenError: {
        message: TestConstants.params.test,
      },
    };

    const error = DroppError.handleAuthError(null, null, null, details);
    expect(error.details.error.type).toBe(DroppError.type.Auth.type);
    expect(error.privateDetails.error.type).toBe(DroppError.type.Auth);
    expect(error.details.error.message).toBe(DroppError.TokenReason.unknown);
    expect(error.privateDetails.error.details).toBe(TestConstants.params.test);
    Log.log(TestConstants.errors.dropp.testName, handleAuthErrorTitle, error);
    Log.it(TestConstants.errors.dropp.testName, handleAuthErrorTitle, it3, false);
  });

  const it4 = 'returns the correct details for missing user info';
  it(it4, () => {
    Log.it(TestConstants.errors.dropp.testName, handleAuthErrorTitle, it4, true);
    const details = {
      userInfoMissing: true,
    };

    const error = DroppError.handleAuthError(null, null, null, details);
    expect(error.details.error.type).toBe(DroppError.type.Auth.type);
    expect(error.privateDetails.error.type).toBe(DroppError.type.Auth);
    expect(error.details.error.message).toBe(DroppError.TokenReason.expired);
    expect(error.privateDetails.error.details).toBe(Constants.errors.messages.noUserForToken);
    Log.log(TestConstants.errors.dropp.testName, handleAuthErrorTitle, error);
    Log.it(TestConstants.errors.dropp.testName, handleAuthErrorTitle, it4, false);
  });
});

const Log = require('../../logger');
const Helper = require('../../helper');
const TestConstants = require('../../constants');
const Utils = require('../../../src/utilities/utils');
const Constants = require('../../../src/utilities/constants');

const hasValueTitle = 'hasValue function';
/* eslint-disable no-undef */
describe(hasValueTitle, () => {
  const it1 = 'should return false for a null value';
  it(it1, () => {
    Log.it(TestConstants.utils.testName, hasValueTitle, it1, true);
    const value = null;
    const result = Utils.hasValue(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.utils.testName,
      hasValueTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.utils.testName, hasValueTitle, it1, false);
  });

  const it2 = 'should return false for an undefined value';
  it(it2, () => {
    Log.it(TestConstants.utils.testName, hasValueTitle, it2, true);
    const value = undefined;
    const result = Utils.hasValue(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.utils.testName,
      hasValueTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.utils.testName, hasValueTitle, it2, false);
  });

  const it3 = 'should return true for an array';
  it(it3, () => {
    Log.it(TestConstants.utils.testName, hasValueTitle, it3, true);
    const value = [];
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log.log(
      TestConstants.utils.testName,
      hasValueTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.utils.testName, hasValueTitle, it3, false);
  });

  const it4 = 'should return true for an object';
  it(it4, () => {
    Log.it(TestConstants.utils.testName, hasValueTitle, it4, true);
    const value = {};
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log.log(
      TestConstants.utils.testName,
      hasValueTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.utils.testName, hasValueTitle, it4, false);
  });

  const it5 = 'should return true for a function';
  it(it5, () => {
    Log.it(TestConstants.utils.testName, hasValueTitle, it5, true);
    const value = () => {};
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log.log(
      TestConstants.utils.testName,
      hasValueTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.utils.testName, hasValueTitle, it5, false);
  });

  const it6 = 'should return true for a boolean false value';
  it(it6, () => {
    Log.it(TestConstants.utils.testName, hasValueTitle, it6, true);
    const value = false;
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log.log(
      TestConstants.utils.testName,
      hasValueTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.utils.testName, hasValueTitle, it6, false);
  });

  const it7 = 'should return true for a boolean true value';
  it(it7, () => {
    Log.it(TestConstants.utils.testName, hasValueTitle, it7, true);
    const value = true;
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log.log(
      TestConstants.utils.testName,
      hasValueTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.utils.testName, hasValueTitle, it7, false);
  });

  const it8 = 'should return true for an empty string';
  it(it8, () => {
    Log.it(TestConstants.utils.testName, hasValueTitle, it8, true);
    const value = TestConstants.utils.strings.emptyString;
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log.log(
      TestConstants.utils.testName,
      hasValueTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.utils.testName, hasValueTitle, it8, false);
  });

  const it9 = 'should return true for a string with space whitespace';
  it(it9, () => {
    Log.it(TestConstants.utils.testName, hasValueTitle, it9, true);
    const value = TestConstants.utils.strings.paddedEmptyString;
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log.log(
      TestConstants.utils.testName,
      hasValueTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.utils.testName, hasValueTitle, it9, false);
  });

  const it10 = 'should return true for a string with tabbed whitespace';
  it(it10, () => {
    Log.it(TestConstants.utils.testName, hasValueTitle, it10, true);
    const value = TestConstants.utils.strings.tab;
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log.log(
      TestConstants.utils.testName,
      hasValueTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.utils.testName, hasValueTitle, it10, false);
  });

  const it11 = 'should return true for a string with newline whitespace';
  it(it11, () => {
    Log.it(TestConstants.utils.testName, hasValueTitle, it11, true);
    const value = TestConstants.utils.strings.newLine;
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log.log(
      TestConstants.utils.testName,
      hasValueTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.utils.testName, hasValueTitle, it11, false);
  });

  const it12 = 'should return true for a string with return whitespace';
  it(it12, () => {
    Log.it(TestConstants.utils.testName, hasValueTitle, it12, true);
    const value = TestConstants.utils.strings.return;
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log.log(
      TestConstants.utils.testName,
      hasValueTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.utils.testName, hasValueTitle, it12, false);
  });

  const it13 = 'should return true for a string with Javascript code';
  it(it13, () => {
    Log.it(TestConstants.utils.testName, hasValueTitle, it13, true);
    const value = TestConstants.utils.strings.javascript;
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log.log(
      TestConstants.utils.testName,
      hasValueTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.utils.testName, hasValueTitle, it13, false);
  });

  const it14 = 'should return true for a float with decimal places';
  it(it14, () => {
    Log.it(TestConstants.utils.testName, hasValueTitle, it14, true);
    const value = 1.1;
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log.log(
      TestConstants.utils.testName,
      hasValueTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.utils.testName, hasValueTitle, it14, false);
  });

  const it15 = 'should return true for a number';
  it(it15, () => {
    Log.it(TestConstants.utils.testName, hasValueTitle, it15, true);
    const value = 0;
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log.log(
      TestConstants.utils.testName,
      hasValueTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.utils.testName, hasValueTitle, it15, false);
  });

  const it16 = 'should return true for a string with one character';
  it(it16, () => {
    Log.it(TestConstants.utils.testName, hasValueTitle, it16, true);
    const value = TestConstants.utils.strings.stringWithInteger;
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log.log(
      TestConstants.utils.testName,
      hasValueTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.utils.testName, hasValueTitle, it16, false);
  });
});

const stepperTitle = 'stepper() generator';
describe(stepperTitle, () => {
  const it1 = 'should return 3 after being called 3 times';
  it(it1, () => {
    Log.it(TestConstants.utils.testName, stepperTitle, it1, true);
    const stepper = Utils.stepper();
    stepper.next();
    stepper.next();
    const step = stepper.next().value;
    expect(step).toBe(3);
    Log.log(
      TestConstants.utils.testName,
      stepperTitle,
      `After 3 calls to the generator, the value returned is ${step}`
    );
    Log.it(TestConstants.utils.testName, stepperTitle, it1, false);
  });
});

const getIpAddressTitle = 'getIpAddress function';
describe(getIpAddressTitle, () => {
  const it1 = 'returns emtpy string for a null value';
  it(it1, () => {
    Log.it(TestConstants.utils.testName, getIpAddressTitle, it1, true);
    const ip = Utils.getIpAddress(null);
    expect(ip).toBe(TestConstants.utils.strings.emptyString);
    Log.log(TestConstants.utils.testName, getIpAddressTitle, ip);
    Log.it(TestConstants.utils.testName, getIpAddressTitle, it1, false);
  });

  const it2 = 'returns correct value for x-forwarded-for in headers';
  it(it2, () => {
    Log.it(TestConstants.utils.testName, getIpAddressTitle, it2, true);
    const details = {
      headers: {
        [Constants.router.xForwardedFor]: TestConstants.params.test,
      },
    };

    const ip = Utils.getIpAddress(details);
    expect(ip).toBe(TestConstants.params.test);
    Log.log(TestConstants.utils.testName, getIpAddressTitle, ip);
    Log.it(TestConstants.utils.testName, getIpAddressTitle, it2, false);
  });

  const it3 = 'returns correct value for remoteAddress in connection';
  it(it3, () => {
    Log.it(TestConstants.utils.testName, getIpAddressTitle, it3, true);
    const details = {
      connection: {
        remoteAddress: TestConstants.params.test,
      },
    };

    const ip = Utils.getIpAddress(details);
    expect(ip).toBe(TestConstants.params.test);
    Log.log(TestConstants.utils.testName, getIpAddressTitle, ip);
    Log.it(TestConstants.utils.testName, getIpAddressTitle, it3, false);
  });

  const it4 = 'returns correct value for when both headers and connection are valid';
  it(it4, () => {
    Log.it(TestConstants.utils.testName, getIpAddressTitle, it4, true);
    const details = {
      headers: {
        [Constants.router.xForwardedFor]: TestConstants.params.test,
      },
      connection: {
        remoteAddress: TestConstants.params.test2,
      },
    };

    const ip = Utils.getIpAddress(details);
    expect(ip).toBe(TestConstants.params.test);
    Log.log(TestConstants.utils.testName, getIpAddressTitle, ip);
    Log.it(TestConstants.utils.testName, getIpAddressTitle, it4, false);
  });
});

const getRequestIdTitle = 'getRequestId function';
describe(getRequestIdTitle, () => {
  const it1 = 'returns emtpy string for a null value';
  it(it1, () => {
    Log.it(TestConstants.utils.testName, getRequestIdTitle, it1, true);
    const id = Utils.getRequestId(null);
    expect(id).toBe(TestConstants.utils.strings.emptyString);
    Log.log(TestConstants.utils.testName, getRequestIdTitle, id);
    Log.it(TestConstants.utils.testName, getRequestIdTitle, it1, false);
  });

  const it2 = 'returns correct value for requestId in headers';
  it(it2, () => {
    Log.it(TestConstants.utils.testName, getRequestIdTitle, it2, true);
    const details = {
      headers: {
        requestId: TestConstants.params.test,
      },
    };

    const id = Utils.getRequestId(details);
    expect(id).toBe(TestConstants.params.test);
    Log.log(TestConstants.utils.testName, getRequestIdTitle, id);
    Log.it(TestConstants.utils.testName, getRequestIdTitle, it2, false);
  });
});

const reduceToStringTitle = 'reduceToString function';
describe(reduceToStringTitle, () => {
  const it1 = 'returns a string with a null argument';
  it(it1, () => {
    Log.it(TestConstants.utils.testName, reduceToStringTitle, it1, true);
    const message = Utils.reduceToString(null);
    expect(message).toBe(TestConstants.utils.strings.emptyString);
    Log.log(TestConstants.utils.testName, reduceToStringTitle, message);
    Log.it(TestConstants.utils.testName, reduceToStringTitle, it1, false);
  });

  const it2 = 'returns a string with one argument';
  it(it2, () => {
    Log.it(TestConstants.utils.testName, reduceToStringTitle, it2, true);
    const message = Utils.reduceToString([4]);
    expect(message).toBe('4');
    Log.log(TestConstants.utils.testName, reduceToStringTitle, message);
    Log.it(TestConstants.utils.testName, reduceToStringTitle, it2, false);
  });

  const it3 = 'returns a string with multiple arguments';
  it(it3, () => {
    Log.it(TestConstants.utils.testName, reduceToStringTitle, it3, true);
    const message = Utils.reduceToString([4, TestConstants.params.test]);
    expect(message).toBe('4,"test"');
    Log.log(TestConstants.utils.testName, reduceToStringTitle, message);
    Log.it(TestConstants.utils.testName, reduceToStringTitle, it3, false);
  });

  const it4 = 'returns a string with an invalid argument';
  it(it4, () => {
    Log.it(TestConstants.utils.testName, reduceToStringTitle, it4, true);
    const message = Utils.reduceToString([null]);
    expect(message).toBeNull();
    Log.log(TestConstants.utils.testName, reduceToStringTitle, message);
    Log.it(TestConstants.utils.testName, reduceToStringTitle, it4, false);
  });

  const it5 = 'returns a string with multiple invalid arguments';
  it(it5, () => {
    Log.it(TestConstants.utils.testName, reduceToStringTitle, it5, true);
    const message = Utils.reduceToString([null, undefined]);
    expect(message).toBe('null,undefined');
    Log.log(TestConstants.utils.testName, reduceToStringTitle, message);
    Log.it(TestConstants.utils.testName, reduceToStringTitle, it5, false);
  });
});

const degreesToRadiansTitle = 'degreesToRadians function';
describe(degreesToRadiansTitle, () => {
  const it1 = 'returns 0 for a null argument';
  it(it1, () => {
    Log.it(TestConstants.utils.testName, degreesToRadiansTitle, it1, true);
    const result = Utils.degreesToRadians(null);
    expect(result).toBe(0);
    Log.log(TestConstants.utils.testName, degreesToRadiansTitle, result);
    Log.it(TestConstants.utils.testName, degreesToRadiansTitle, it1, false);
  });

  const it2 = 'returns 0 for a non-numeric argument';
  it(it2, () => {
    Log.it(TestConstants.utils.testName, degreesToRadiansTitle, it2, true);
    const result = Utils.degreesToRadians(TestConstants.params.test);
    expect(result).toBe(0);
    Log.log(TestConstants.utils.testName, degreesToRadiansTitle, result);
    Log.it(TestConstants.utils.testName, degreesToRadiansTitle, it2, false);
  });

  const it3 = 'returns 0 for a non-zero number string';
  it(it3, () => {
    Log.it(TestConstants.utils.testName, degreesToRadiansTitle, it3, true);
    const result = Utils.degreesToRadians('4.4');
    expect(result).toBe(0);
    Log.log(TestConstants.utils.testName, degreesToRadiansTitle, result);
    Log.it(TestConstants.utils.testName, degreesToRadiansTitle, it3, false);
  });

  const it4 = 'returns a valid number of radians for a valid number of degrees';
  it(it4, () => {
    Log.it(TestConstants.utils.testName, degreesToRadiansTitle, it4, true);
    const result = Utils.degreesToRadians(1);
    expect(result).toBe(0.017453292519943295);
    Log.log(TestConstants.utils.testName, degreesToRadiansTitle, result);
    Log.it(TestConstants.utils.testName, degreesToRadiansTitle, it4, false);
  });

  const it5 = 'returns a valid number of radians for another valid number of degrees';
  it(it5, () => {
    Log.it(TestConstants.utils.testName, degreesToRadiansTitle, it5, true);
    const result = Utils.degreesToRadians(49.267804550637528394);
    expect(result).toBe(0.8598854046376703);
    Log.log(TestConstants.utils.testName, degreesToRadiansTitle, result);
    Log.it(TestConstants.utils.testName, degreesToRadiansTitle, it5, false);
  });
});

const deleteLocalFileTitle = 'deleteLocalFile function';
describe(deleteLocalFileTitle, () => {
  const it1 = 'throws an error for a non-existent file';
  it(it1, async (done) => {
    Log.it(TestConstants.utils.testName, deleteLocalFileTitle, it1, true);
    try {
      const result = await Utils.deleteLocalFile(Utils.newUuid());
      expect(result).not.toBeDefined();
      Log.log(
        TestConstants.utils.testName,
        deleteLocalFileTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (error) {
      Log.log(TestConstants.utils.testName, deleteLocalFileTitle, error);
    }

    Log.it(TestConstants.utils.testName, deleteLocalFileTitle, it1, false);
    done();
  });

  const it2 = 'returns false for a non-string path argument';
  it(it2, async (done) => {
    Log.it(TestConstants.utils.testName, deleteLocalFileTitle, it2, true);
    const result = await Utils.deleteLocalFile();
    expect(result).toBe(false);
    Log.log(TestConstants.utils.testName, deleteLocalFileTitle, result);
    Log.it(TestConstants.utils.testName, deleteLocalFileTitle, it2, false);
    done();
  });

  const it3 = 'deletes a file and returns true';
  it(it3, async (done) => {
    Log.it(TestConstants.utils.testName, deleteLocalFileTitle, it3, true);
    const path = await Helper.createLocalTextFile();
    const result = await Utils.deleteLocalFile(path);
    expect(result).toBe(true);
    Log.log(TestConstants.utils.testName, deleteLocalFileTitle, result);
    Log.it(TestConstants.utils.testName, deleteLocalFileTitle, it3, false);
    done();
  });
});

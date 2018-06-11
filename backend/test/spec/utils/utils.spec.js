const Log = require('../../logger');
const Helper = require('../../helper');
const Utils = require('../../../src/utilities/utils');

const testName = 'Utility Module';
const hasValueTitle = 'hasValue function';
/* eslint-disable no-undef */
describe(hasValueTitle, () => {
  const it1 = 'should return false for a null value';
  it(it1, () => {
    Log.it(testName, hasValueTitle, it1, true);
    const value = null;
    const result = Utils.hasValue(value);
    expect(result).toBe(false);
    Log.log(testName, hasValueTitle, `${value} returns ${result}`);
    Log.it(testName, hasValueTitle, it1, false);
  });

  const it2 = 'should return false for an undefined value';
  it(it2, () => {
    Log.it(testName, hasValueTitle, it2, true);
    const value = undefined;
    const result = Utils.hasValue(value);
    expect(result).toBe(false);
    Log.log(testName, hasValueTitle, `${value} returns ${result}`);
    Log.it(testName, hasValueTitle, it2, false);
  });

  const it3 = 'should return true for an array';
  it(it3, () => {
    Log.it(testName, hasValueTitle, it3, true);
    const value = [];
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log.log(testName, hasValueTitle, `${value} returns ${result}`);
    Log.it(testName, hasValueTitle, it3, false);
  });

  const it4 = 'should return true for an object';
  it(it4, () => {
    Log.it(testName, hasValueTitle, it4, true);
    const value = {};
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log.log(testName, hasValueTitle, `${value} returns ${result}`);
    Log.it(testName, hasValueTitle, it4, false);
  });

  const it5 = 'should return true for a function';
  it(it5, () => {
    Log.it(testName, hasValueTitle, it5, true);
    const value = () => {};
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log.log(testName, hasValueTitle, `${value} returns ${result}`);
    Log.it(testName, hasValueTitle, it5, false);
  });

  const it6 = 'should return true for a boolean false value';
  it(it6, () => {
    Log.it(testName, hasValueTitle, it6, true);
    const value = false;
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log.log(testName, hasValueTitle, `${value} returns ${result}`);
    Log.it(testName, hasValueTitle, it6, false);
  });

  const it7 = 'should return true for a boolean true value';
  it(it7, () => {
    Log.it(testName, hasValueTitle, it7, true);
    const value = true;
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log.log(testName, hasValueTitle, `${value} returns ${result}`);
    Log.it(testName, hasValueTitle, it7, false);
  });

  const it8 = 'should return true for an empty string';
  it(it8, () => {
    Log.it(testName, hasValueTitle, it8, true);
    const value = '';
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log.log(testName, hasValueTitle, `${value} returns ${result}`);
    Log.it(testName, hasValueTitle, it8, false);
  });

  const it9 = 'should return true for a string with space whitespace';
  it(it9, () => {
    Log.it(testName, hasValueTitle, it9, true);
    const value = '    ';
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log.log(testName, hasValueTitle, `${value} returns ${result}`);
    Log.it(testName, hasValueTitle, it9, false);
  });

  const it10 = 'should return true for a string with tabbed whitespace';
  it(it10, () => {
    Log.it(testName, hasValueTitle, it10, true);
    const value = '\t';
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log.log(testName, hasValueTitle, `${value} returns ${result}`);
    Log.it(testName, hasValueTitle, it10, false);
  });

  const it11 = 'should return true for a string with newline whitespace';
  it(it11, () => {
    Log.it(testName, hasValueTitle, it11, true);
    const value = '\n';
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log.log(testName, hasValueTitle, `${value} returns ${result}`);
    Log.it(testName, hasValueTitle, it11, false);
  });

  const it12 = 'should return true for a string with return whitespace';
  it(it12, () => {
    Log.it(testName, hasValueTitle, it12, true);
    const value = '\r';
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log.log(testName, hasValueTitle, `${value} returns ${result}`);
    Log.it(testName, hasValueTitle, it12, false);
  });

  const it13 = 'should return true for a string with Javascript code';
  it(it13, () => {
    Log.it(testName, hasValueTitle, it13, true);
    const value = 'console.log(\'hey\')';
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log.log(testName, hasValueTitle, `${value} returns ${result}`);
    Log.it(testName, hasValueTitle, it13, false);
  });

  const it14 = 'should return true for a float with decimal places';
  it(it14, () => {
    Log.it(testName, hasValueTitle, it14, true);
    const value = 1.1;
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log.log(testName, hasValueTitle, `${value} returns ${result}`);
    Log.it(testName, hasValueTitle, it14, false);
  });

  const it15 = 'should return true for a number';
  it(it15, () => {
    Log.it(testName, hasValueTitle, it15, true);
    const value = 0;
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log.log(testName, hasValueTitle, `${value} returns ${result}`);
    Log.it(testName, hasValueTitle, it15, false);
  });

  const it16 = 'should return true for a string with one character';
  it(it16, () => {
    Log.it(testName, hasValueTitle, it16, true);
    const value = '1';
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log.log(testName, hasValueTitle, `${value} returns ${result}`);
    Log.it(testName, hasValueTitle, it16, false);
  });
});

const stepperTitle = 'stepper() generator';
describe(stepperTitle, () => {
  const it1 = 'should return 3 after being called 3 times';
  it(it1, () => {
    Log.it(testName, stepperTitle, it1, true);
    const stepper = Utils.stepper();
    stepper.next();
    stepper.next();
    const step = stepper.next().value;
    expect(step).toBe(3);
    Log.log(testName, stepperTitle, `After 3 calls to the generator, the value returned is ${step}`);
    Log.it(testName, stepperTitle, it1, false);
  });
});

const getIpAddressTitle = 'getIpAddress function';
describe(getIpAddressTitle, () => {
  const it1 = 'returns emtpy string for a null value';
  it(it1, () => {
    Log.it(testName, getIpAddressTitle, it1, true);
    const ip = Utils.getIpAddress(null);
    expect(ip).toBe('');
    Log.log(testName, getIpAddressTitle, ip);
    Log.it(testName, getIpAddressTitle, it1, false);
  });

  const it2 = 'returns correct value for x-forwarded-for in headers';
  it(it2, () => {
    Log.it(testName, getIpAddressTitle, it2, true);
    const details = {
      headers: {
        'x-forwarded-for': 'test',
      },
    };

    const ip = Utils.getIpAddress(details);
    expect(ip).toBe('test');
    Log.log(testName, getIpAddressTitle, ip);
    Log.it(testName, getIpAddressTitle, it2, false);
  });

  const it3 = 'returns correct value for remoteAddress in connection';
  it(it3, () => {
    Log.it(testName, getIpAddressTitle, it3, true);
    const details = {
      connection: {
        remoteAddress: 'test',
      },
    };

    const ip = Utils.getIpAddress(details);
    expect(ip).toBe('test');
    Log.log(testName, getIpAddressTitle, ip);
    Log.it(testName, getIpAddressTitle, it3, false);
  });

  const it4 = 'returns correct value for when both headers and connection are valid';
  it(it4, () => {
    Log.it(testName, getIpAddressTitle, it4, true);
    const details = {
      headers: {
        'x-forwarded-for': 'test',
      },
      connection: {
        remoteAddress: 'test2',
      },
    };

    const ip = Utils.getIpAddress(details);
    expect(ip).toBe('test');
    Log.log(testName, getIpAddressTitle, ip);
    Log.it(testName, getIpAddressTitle, it4, false);
  });
});

const getRequestIdTitle = 'getRequestId function';
describe(getRequestIdTitle, () => {
  const it1 = 'returns emtpy string for a null value';
  it(it1, () => {
    Log.it(testName, getRequestIdTitle, it1, true);
    const id = Utils.getRequestId(null);
    expect(id).toBe('');
    Log.log(testName, getRequestIdTitle, id);
    Log.it(testName, getRequestIdTitle, it1, false);
  });

  const it2 = 'returns correct value for requestId in headers';
  it(it2, () => {
    Log.it(testName, getRequestIdTitle, it2, true);
    const details = {
      headers: {
        requestId: 'test',
      },
    };

    const id = Utils.getRequestId(details);
    expect(id).toBe('test');
    Log.log(testName, getRequestIdTitle, id);
    Log.it(testName, getRequestIdTitle, it2, false);
  });
});

const reduceToStringTitle = 'reduceToString function';
describe(reduceToStringTitle, () => {
  const it1 = 'returns a string with a null argument';
  it(it1, () => {
    Log.it(testName, reduceToStringTitle, it1, true);
    const message = Utils.reduceToString(null);
    expect(message).toBe('');
    Log.log(testName, reduceToStringTitle, message);
    Log.it(testName, reduceToStringTitle, it1, false);
  });

  const it2 = 'returns a string with one argument';
  it(it2, () => {
    Log.it(testName, reduceToStringTitle, it2, true);
    const message = Utils.reduceToString([4]);
    expect(message).toBe('4');
    Log.log(testName, reduceToStringTitle, message);
    Log.it(testName, reduceToStringTitle, it2, false);
  });

  const it3 = 'returns a string with multiple arguments';
  it(it3, () => {
    Log.it(testName, reduceToStringTitle, it3, true);
    const message = Utils.reduceToString([4, 'test']);
    expect(message).toBe('4,"test"');
    Log.log(testName, reduceToStringTitle, message);
    Log.it(testName, reduceToStringTitle, it3, false);
  });

  const it4 = 'returns a string with an invalid argument';
  it(it4, () => {
    Log.it(testName, reduceToStringTitle, it4, true);
    const message = Utils.reduceToString([null]);
    expect(message).toBeNull();
    Log.log(testName, reduceToStringTitle, message);
    Log.it(testName, reduceToStringTitle, it4, false);
  });

  const it5 = 'returns a string with multiple invalid arguments';
  it(it5, () => {
    Log.it(testName, reduceToStringTitle, it5, true);
    const message = Utils.reduceToString([null, undefined]);
    expect(message).toBe('null,undefined');
    Log.log(testName, reduceToStringTitle, message);
    Log.it(testName, reduceToStringTitle, it5, false);
  });
});

const degreesToRadiansTitle = 'degreesToRadians function';
describe(degreesToRadiansTitle, () => {
  const it1 = 'returns 0 for a null argument';
  it(it1, () => {
    Log.it(testName, degreesToRadiansTitle, it1, true);
    const result = Utils.degreesToRadians(null);
    expect(result).toBe(0);
    Log.log(testName, degreesToRadiansTitle, result);
    Log.it(testName, degreesToRadiansTitle, it1, false);
  });

  const it2 = 'returns 0 for a non-numeric argument';
  it(it2, () => {
    Log.it(testName, degreesToRadiansTitle, it2, true);
    const result = Utils.degreesToRadians('test');
    expect(result).toBe(0);
    Log.log(testName, degreesToRadiansTitle, result);
    Log.it(testName, degreesToRadiansTitle, it2, false);
  });

  const it3 = 'returns 0 for a non-zero number string';
  it(it3, () => {
    Log.it(testName, degreesToRadiansTitle, it3, true);
    const result = Utils.degreesToRadians('4.4');
    expect(result).toBe(0);
    Log.log(testName, degreesToRadiansTitle, result);
    Log.it(testName, degreesToRadiansTitle, it3, false);
  });

  const it4 = 'returns a valid number of radians for a valid number of degrees';
  it(it4, () => {
    Log.it(testName, degreesToRadiansTitle, it4, true);
    const result = Utils.degreesToRadians(1);
    expect(result).toBe(0.017453292519943295);
    Log.log(testName, degreesToRadiansTitle, result);
    Log.it(testName, degreesToRadiansTitle, it4, false);
  });

  const it5 = 'returns a valid number of radians for another valid number of degrees';
  it(it5, () => {
    Log.it(testName, degreesToRadiansTitle, it5, true);
    const result = Utils.degreesToRadians(49.267804550637528394);
    expect(result).toBe(0.8598854046376703);
    Log.log(testName, degreesToRadiansTitle, result);
    Log.it(testName, degreesToRadiansTitle, it5, false);
  });
});

const deleteLocalFileTitle = 'deleteLocalFile function';
describe(deleteLocalFileTitle, () => {
  const it1 = 'throws an error for a non-existent file';
  it(it1, async (done) => {
    Log.it(testName, deleteLocalFileTitle, it1, true);
    try {
      const result = await Utils.deleteLocalFile(Utils.newUuid());
      expect(result).not.toBeDefined();
      Log.log(testName, deleteLocalFileTitle, 'Should have thrown error');
    } catch (error) {
      Log.log(testName, deleteLocalFileTitle, error);
    }

    Log.it(testName, deleteLocalFileTitle, it1, false);
    done();
  });

  const it2 = 'returns false for a non-string path argument';
  it(it2, async (done) => {
    Log.it(testName, deleteLocalFileTitle, it2, true);
    const result = await Utils.deleteLocalFile();
    expect(result).toBe(false);
    Log.log(testName, deleteLocalFileTitle, result);
    Log.it(testName, deleteLocalFileTitle, it2, false);
    done();
  });

  const it3 = 'deletes a file and returns true';
  it(it3, async (done) => {
    Log.it(testName, deleteLocalFileTitle, it3, true);
    const path = await Helper.createLocalTextFile();
    const result = await Utils.deleteLocalFile(path);
    expect(result).toBe(true);
    Log.log(testName, deleteLocalFileTitle, result);
    Log.it(testName, deleteLocalFileTitle, it3, false);
    done();
  });
});

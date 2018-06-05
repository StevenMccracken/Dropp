const FileSystem = require('fs');
const Log = require('../../logger');
const Utils = require('../../../src/utilities/utils');

const testName = 'Utility Module';
const hasValueTitle = 'hasValue function';
/* eslint-disable no-undef */
describe(hasValueTitle, () => {
  it('should return false for a null value', (done) => {
    const value = null;
    const result = Utils.hasValue(value);
    expect(result).toBe(false);
    Log(testName, hasValueTitle, `${value} returns ${result}`);
    done();
  });

  it('should return false for an undefined value', (done) => {
    const value = undefined;
    const result = Utils.hasValue(value);
    expect(result).toBe(false);
    Log(testName, hasValueTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for an array', (done) => {
    const value = [];
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log(testName, hasValueTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for an object', (done) => {
    const value = {};
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log(testName, hasValueTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for a function', (done) => {
    const value = () => {};
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log(testName, hasValueTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for a boolean false value', (done) => {
    const value = false;
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log(testName, hasValueTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for a boolean true value', (done) => {
    const value = true;
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log(testName, hasValueTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for an empty string', (done) => {
    const value = '';
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log(testName, hasValueTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for a string with space whitespace', (done) => {
    const value = '    ';
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log(testName, hasValueTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for a string with tabbed whitespace', (done) => {
    const value = '\t';
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log(testName, hasValueTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for a string with newline whitespace', (done) => {
    const value = '\n';
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log(testName, hasValueTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for a string with return whitespace', (done) => {
    const value = '\r';
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log(testName, hasValueTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for a string with Javascript code', (done) => {
    const value = 'console.log(\'hey\')';
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log(testName, hasValueTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for a float with decimal places', (done) => {
    const value = 1.1;
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log(testName, hasValueTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for a number', (done) => {
    const value = 0;
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log(testName, hasValueTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for a string with one character', (done) => {
    const value = '1';
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log(testName, hasValueTitle, `${value} returns ${result}`);
    done();
  });
});

const stepperTitle = 'stepper() generator';
describe(stepperTitle, () => {
  it('should return 3 after being called 3 times', (done) => {
    const stepper = Utils.stepper();
    stepper.next();
    stepper.next();
    const step = stepper.next().value;
    expect(step).toBe(3);
    Log(testName, stepperTitle, `After 3 calls to the generator, the value returned is ${step}`);
    done();
  });
});

const getIpAddressTitle = 'getIpAddress function';
describe(getIpAddressTitle, () => {
  it('returns emtpy string for a null value', (done) => {
    const ip = Utils.getIpAddress(null);
    expect(ip).toBe('');
    Log(testName, getIpAddressTitle, ip);
    done();
  });

  it('returns correct value for x-forwarded-for in headers', (done) => {
    const details = {
      headers: {
        'x-forwarded-for': 'test',
      },
    };

    const ip = Utils.getIpAddress(details);
    expect(ip).toBe('test');
    Log(testName, getIpAddressTitle, ip);
    done();
  });

  it('returns correct value for remoteAddress in connection', (done) => {
    const details = {
      connection: {
        remoteAddress: 'test',
      },
    };

    const ip = Utils.getIpAddress(details);
    expect(ip).toBe('test');
    Log(testName, getIpAddressTitle, ip);
    done();
  });

  it('returns correct value for when both headers and connection are valid', (done) => {
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
    Log(testName, getIpAddressTitle, ip);
    done();
  });
});

const getRequestIdTitle = 'getRequestId function';
describe(getRequestIdTitle, () => {
  it('returns emtpy string for a null value', (done) => {
    const id = Utils.getRequestId(null);
    expect(id).toBe('');
    Log(testName, getRequestIdTitle, id);
    done();
  });

  it('returns correct value for requestId in headers', (done) => {
    const details = {
      headers: {
        requestId: 'test',
      },
    };

    const id = Utils.getRequestId(details);
    expect(id).toBe('test');
    Log(testName, getRequestIdTitle, id);
    done();
  });
});

const reduceToStringTitle = 'reduceToString function';
describe(reduceToStringTitle, () => {
  it('returns a string with a null argument', (done) => {
    const message = Utils.reduceToString(null);
    expect(message).toBe('');
    Log(testName, reduceToStringTitle, message);
    done();
  });

  it('returns a string with one argument', (done) => {
    const message = Utils.reduceToString([4]);
    expect(message).toBe('4');
    Log(testName, reduceToStringTitle, message);
    done();
  });

  it('returns a string with multiple arguments', (done) => {
    const message = Utils.reduceToString([4, 'test']);
    expect(message).toBe('4,"test"');
    Log(testName, reduceToStringTitle, message);
    done();
  });

  it('returns a string with an invalid argument', (done) => {
    const message = Utils.reduceToString([null]);
    expect(message).toBeNull();
    Log(testName, reduceToStringTitle, message);
    done();
  });

  it('returns a string with multiple invalid arguments', (done) => {
    const message = Utils.reduceToString([null, undefined]);
    expect(message).toBe('null,undefined');
    Log(testName, reduceToStringTitle, message);
    done();
  });
});

const degreesToRadiansTitle = 'degreesToRadians function';
describe(degreesToRadiansTitle, () => {
  it('returns 0 for a null argument', () => {
    const result = Utils.degreesToRadians(null);
    expect(result).toBe(0);
    Log(testName, degreesToRadiansTitle, result);
  });

  it('returns 0 for a non-numeric argument', () => {
    const result = Utils.degreesToRadians('test');
    expect(result).toBe(0);
    Log(testName, degreesToRadiansTitle, result);
  });

  it('returns 0 for a non-zero number string', () => {
    const result = Utils.degreesToRadians('4.4');
    expect(result).toBe(0);
    Log(testName, degreesToRadiansTitle, result);
  });

  it('returns a valid number of radians for a valid number of degrees', () => {
    const result = Utils.degreesToRadians(1);
    expect(result).toBe(0.017453292519943295);
    Log(testName, degreesToRadiansTitle, result);
  });

  it('returns a valid number of radians for another valid number of degrees', () => {
    const result = Utils.degreesToRadians(49.267804550637528394);
    expect(result).toBe(0.8598854046376703);
    Log(testName, degreesToRadiansTitle, result);
  });
});

const deleteLocalFileTitle = 'deleteLocalFile function';
describe(deleteLocalFileTitle, () => {
  beforeEach(() => {
    this.createLocalFile = () => {
      const path = `${process.cwd()}/cache/uploads/${Utils.newUuid()}.txt`;
      const promise = new Promise((resolve) => {
        const writeStream = FileSystem.createWriteStream(path);
        writeStream.on('close', () => resolve(path));
        writeStream.write(Utils.newUuid());
        writeStream.end();
      });

      return promise;
    };
  });

  afterEach(() => {
    delete this.createLocalFile;
  });

  it('throws an error for a non-existent file', async (done) => {
    try {
      const result = await Utils.deleteLocalFile(Utils.newUuid());
      expect(result).not.toBeDefined();
      Log(testName, deleteLocalFileTitle, 'Should have thrown error');
    } catch (error) {
      Log(testName, deleteLocalFileTitle, error);
    }

    done();
  });

  it('returns false for a non-string path argument', async (done) => {
    const result = await Utils.deleteLocalFile();
    expect(result).toBe(false);
    Log(testName, deleteLocalFileTitle, result);
    done();
  });

  it('deletes a file and returns true', async (done) => {
    const path = await this.createLocalFile();
    const result = await Utils.deleteLocalFile(path);
    expect(result).toBe(true);
    Log(testName, deleteLocalFileTitle, result);
    done();
  });
});

const Log = require('../../logger');
const Utils = require('../../../src/utilities/utils');

/**
 * Logs a message for the current test file
 * @param {String} _title the describe label
 * @param {String|Object} _details the log details
 */
function log(_title, _details) {
  Log(`Utils ${_title}`, _details);
}

const hasValueTitle = 'hasValue function';
/* eslint-disable no-undef */
describe(hasValueTitle, () => {
  it('should return false for a null value', (done) => {
    const value = null;
    const result = Utils.hasValue(value);
    expect(result).toBe(false);
    log(hasValueTitle, `${value} returns ${result}`);
    done();
  });

  it('should return false for an undefined value', (done) => {
    const value = undefined;
    const result = Utils.hasValue(value);
    expect(result).toBe(false);
    log(hasValueTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for an array', (done) => {
    const value = [];
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    log(hasValueTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for an object', (done) => {
    const value = {};
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    log(hasValueTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for a function', (done) => {
    const value = function value() {};
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    log(hasValueTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for a boolean false value', (done) => {
    const value = false;
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    log(hasValueTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for a boolean true value', (done) => {
    const value = true;
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    log(hasValueTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for an empty string', (done) => {
    const value = '';
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    log(hasValueTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for a string with space whitespace', (done) => {
    const value = '    ';
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    log(hasValueTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for a string with tabbed whitespace', (done) => {
    const value = '\t';
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    log(hasValueTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for a string with newline whitespace', (done) => {
    const value = '\n';
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    log(hasValueTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for a string with return whitespace', (done) => {
    const value = '\r';
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    log(hasValueTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for a string with Javascript code', (done) => {
    const value = 'console.log(\'hey\')';
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    log(hasValueTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for a float with decimal places', (done) => {
    const value = 1.1;
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    log(hasValueTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for a number', (done) => {
    const value = 0;
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    log(hasValueTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for a string with one character', (done) => {
    const value = '1';
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    log(hasValueTitle, `${value} returns ${result}`);
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
    log(stepperTitle, `After 3 calls to the generator, the value returned is ${step}`);
    done();
  });
});

const getIpAddressTitle = 'getIpAddress function';
describe(getIpAddressTitle, () => {
  it('returns emtpy string for a null value', (done) => {
    const ip = Utils.getIpAddress(null);
    expect(ip).toBe('');
    log(getIpAddressTitle, ip);
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
    log(getIpAddressTitle, ip);
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
    log(getIpAddressTitle, ip);
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
    log(getIpAddressTitle, ip);
    done();
  });
});

const getRequestIdTitle = 'getRequestId function';
describe(getRequestIdTitle, () => {
  it('returns emtpy string for a null value', (done) => {
    const id = Utils.getRequestId(null);
    expect(id).toBe('');
    log(getRequestIdTitle, id);
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
    log(getRequestIdTitle, id);
    done();
  });
});
/* eslint-enable no-undef */

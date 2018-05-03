const Log = require('../../logger');
const Utils = require('../../../src/utilities/utils');

const utilsHasValueTitle = 'Utils hasValue()';
/* eslint-disable no-undef */
describe(utilsHasValueTitle, () => {
  it('should return false for a null value', (done) => {
    const value = null;
    const result = Utils.hasValue(value);
    expect(result).toBe(false);
    Log(utilsHasValueTitle, `${value} returns ${result}`);
    done();
  });

  it('should return false for an undefined value', (done) => {
    const value = undefined;
    const result = Utils.hasValue(value);
    expect(result).toBe(false);
    Log(utilsHasValueTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for an array', (done) => {
    const value = [];
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log(utilsHasValueTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for an object', (done) => {
    const value = {};
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log(utilsHasValueTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for a function', (done) => {
    const value = function value() {};
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log(utilsHasValueTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for a boolean false value', (done) => {
    const value = false;
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log(utilsHasValueTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for a boolean true value', (done) => {
    const value = true;
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log(utilsHasValueTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for an empty string', (done) => {
    const value = '';
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log(utilsHasValueTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for a string with space whitespace', (done) => {
    const value = '    ';
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log(utilsHasValueTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for a string with tabbed whitespace', (done) => {
    const value = '\t';
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log(utilsHasValueTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for a string with newline whitespace', (done) => {
    const value = '\n';
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log(utilsHasValueTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for a string with return whitespace', (done) => {
    const value = '\r';
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log(utilsHasValueTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for a string with Javascript code', (done) => {
    const value = 'console.log(\'hey\')';
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log(utilsHasValueTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for a float with decimal places', (done) => {
    const value = 1.1;
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log(utilsHasValueTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for a number', (done) => {
    const value = 0;
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log(utilsHasValueTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for a string with one character', (done) => {
    const value = '1';
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log(utilsHasValueTitle, `${value} returns ${result}`);
    done();
  });
});

const utilsStepperTitle = 'Utils stepper generator';
describe(utilsStepperTitle, () => {
  it('should return 3 after being called 3 times', (done) => {
    const stepper = Utils.stepper();
    stepper.next();
    stepper.next();
    const step = stepper.next().value;
    expect(step).toBe(3);
    Log(utilsStepperTitle, `After 3 calls to the generator, the value returned is ${step}`);
    done();
  });
});

const utilsGetIpAddressTitle = 'Utils getIpAddress()';
describe(utilsGetIpAddressTitle, () => {
  it('returns emtpy string for a null value', (done) => {
    const ip = Utils.getIpAddress(null);
    expect(ip).toBe('');
    Log(utilsGetIpAddressTitle, ip);
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
    Log(utilsGetIpAddressTitle, ip);
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
    Log(utilsGetIpAddressTitle, ip);
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
    Log(utilsGetIpAddressTitle, ip);
    done();
  });
});
/* eslint-enable no-undef */

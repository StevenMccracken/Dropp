const Log = require('../../logger');
const Validator = require('../../../app/utilities/validator');

/* eslint-disable no-undef */
const timestampInputValidator = 'Timestamp input validator';
describe(timestampInputValidator, () => {
  it('should return false for a null value', (done) => {
    const value = null;
    const result = Validator.isValidTimestamp(value);
    expect(result).toBe(false);
    Log(timestampInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for an undefined value', (done) => {
    const value = undefined;
    const result = Validator.isValidTimestamp(value);
    expect(result).toBe(false);
    Log(timestampInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for an array', (done) => {
    const value = [];
    const result = Validator.isValidTimestamp(value);
    expect(result).toBe(false);
    Log(timestampInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for an object', (done) => {
    const value = {};
    const result = Validator.isValidTimestamp(value);
    expect(result).toBe(false);
    Log(timestampInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a function', (done) => {
    const value = function value() {};
    const result = Validator.isValidTimestamp(value);
    expect(result).toBe(false);
    Log(timestampInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a boolean false value', (done) => {
    const value = false;
    const result = Validator.isValidTimestamp(value);
    expect(result).toBe(false);
    Log(timestampInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a boolean true value', (done) => {
    const value = true;
    const result = Validator.isValidTimestamp(value);
    expect(result).toBe(false);
    Log(timestampInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for an empty string', (done) => {
    const value = '';
    const result = Validator.isValidTimestamp(value);
    expect(result).toBe(false);
    Log(timestampInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a non-empty string', (done) => {
    const value = 'hey';
    const result = Validator.isValidTimestamp(value);
    expect(result).toBe(false);
    Log(timestampInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with a number', (done) => {
    const value = '1';
    const result = Validator.isValidTimestamp(value);
    expect(result).toBe(false);
    Log(timestampInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with a float', (done) => {
    const value = '1.0';
    const result = Validator.isValidTimestamp(value);
    expect(result).toBe(false);
    Log(timestampInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a float with decimal places', (done) => {
    const value = 1.1;
    const result = Validator.isValidTimestamp(value);
    expect(result).toBe(false);
    Log(timestampInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a negative number', (done) => {
    const value = -1;
    const result = Validator.isValidTimestamp(value);
    expect(result).toBe(false);
    Log(timestampInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return true for the number 0', (done) => {
    const value = 0;
    const result = Validator.isValidTimestamp(value);
    expect(result).toBe(true);
    Log(timestampInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return true for a positive number', (done) => {
    const value = 1;
    const result = Validator.isValidTimestamp(value);
    expect(result).toBe(true);
    Log(timestampInputValidator, `${value} returns ${result}`);
    done();
  });
});
/* eslint-enable no-undef */

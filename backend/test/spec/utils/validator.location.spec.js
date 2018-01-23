const Log = require('../../logger');
const Validator = require('../../../app/utilities/validator');

/* eslint-disable no-undef */
const locationInputValidator = 'Location input validator';
describe(locationInputValidator, () => {
  it('should return false for a null value', (done) => {
    const value = null;
    const result = Validator.isValidLocation(value);
    expect(result).toBe(false);
    Log(locationInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for an undefined value', (done) => {
    const value = undefined;
    const result = Validator.isValidLocation(value);
    expect(result).toBe(false);
    Log(locationInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for an array', (done) => {
    const value = [];
    const result = Validator.isValidLocation(value);
    expect(result).toBe(false);
    Log(locationInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for an object', (done) => {
    const value = {};
    const result = Validator.isValidLocation(value);
    expect(result).toBe(false);
    Log(locationInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a number', (done) => {
    const value = 0;
    const result = Validator.isValidLocation(value);
    expect(result).toBe(false);
    Log(locationInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a negative number', (done) => {
    const value = -1;
    const result = Validator.isValidLocation(value);
    expect(result).toBe(false);
    Log(locationInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a positive number', (done) => {
    const value = 1;
    const result = Validator.isValidLocation(value);
    expect(result).toBe(false);
    Log(locationInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a function', (done) => {
    const value = function value() {};
    const result = Validator.isValidLocation(value);
    expect(result).toBe(false);
    Log(locationInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a boolean false value', (done) => {
    const value = false;
    const result = Validator.isValidLocation(value);
    expect(result).toBe(false);
    Log(locationInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a boolean true value', (done) => {
    const value = true;
    const result = Validator.isValidLocation(value);
    expect(result).toBe(false);
    Log(locationInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for an empty string', (done) => {
    const value = '';
    const result = Validator.isValidLocation(value);
    expect(result).toBe(false);
    Log(locationInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a non-empty string with no numbers', (done) => {
    const value = 'hey';
    const result = Validator.isValidLocation(value);
    expect(result).toBe(false);
    Log(locationInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with just a comma', (done) => {
    const value = ',';
    const result = Validator.isValidLocation(value);
    expect(result).toBe(false);
    Log(locationInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with a number and a comma', (done) => {
    const value = '1,';
    const result = Validator.isValidLocation(value);
    expect(result).toBe(false);
    Log(locationInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with a comma and a number', (done) => {
    const value = ',1';
    const result = Validator.isValidLocation(value);
    expect(result).toBe(false);
    Log(locationInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with a number, comma, and a string', (done) => {
    const value = '1,hey';
    const result = Validator.isValidLocation(value);
    expect(result).toBe(false);
    Log(locationInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with a string, comma, and a number', (done) => {
    const value = 'hey,1';
    const result = Validator.isValidLocation(value);
    expect(result).toBe(false);
    Log(locationInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return true for a string with two numbers with a comma', (done) => {
    const value = '1,1';
    const result = Validator.isValidLocation(value);
    expect(result).toBe(true);
    Log(locationInputValidator, `${value} returns ${result}`);
    done();
  });
});
/* eslint-enable no-undef */

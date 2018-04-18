const Log = require('../../../logger');
const Validator = require('../../../../src/utilities/validator');

const positiveFloatInputValidator = 'Positive float input validator';
/* eslint-disable no-undef */
describe(positiveFloatInputValidator, () => {
  it('should return false for a null value', (done) => {
    const value = null;
    const result = Validator.isValidPositiveFloat(value);
    expect(result).toBe(false);
    Log(positiveFloatInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for an undefined value', (done) => {
    const value = undefined;
    const result = Validator.isValidPositiveFloat(value);
    expect(result).toBe(false);
    Log(positiveFloatInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for an array', (done) => {
    const value = [];
    const result = Validator.isValidPositiveFloat(value);
    expect(result).toBe(false);
    Log(positiveFloatInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for an object', (done) => {
    const value = {};
    const result = Validator.isValidPositiveFloat(value);
    expect(result).toBe(false);
    Log(positiveFloatInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a function', (done) => {
    const value = function value() {};
    const result = Validator.isValidPositiveFloat(value);
    expect(result).toBe(false);
    Log(positiveFloatInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a boolean false value', (done) => {
    const value = false;
    const result = Validator.isValidPositiveFloat(value);
    expect(result).toBe(false);
    Log(positiveFloatInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a boolean true value', (done) => {
    const value = true;
    const result = Validator.isValidPositiveFloat(value);
    expect(result).toBe(false);
    Log(positiveFloatInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for an empty string', (done) => {
    const value = '';
    const result = Validator.isValidPositiveFloat(value);
    expect(result).toBe(false);
    Log(positiveFloatInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a non-empty string', (done) => {
    const value = 'hey';
    const result = Validator.isValidPositiveFloat(value);
    expect(result).toBe(false);
    Log(positiveFloatInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with an integer', (done) => {
    const value = '1';
    const result = Validator.isValidPositiveFloat(value);
    expect(result).toBe(false);
    Log(positiveFloatInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with a float', (done) => {
    const value = '1.0';
    const result = Validator.isValidPositiveFloat(value);
    expect(result).toBe(false);
    Log(positiveFloatInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a negative number', (done) => {
    const value = -1;
    const result = Validator.isValidPositiveFloat(value);
    expect(result).toBe(false);
    Log(positiveFloatInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a negative float', (done) => {
    const value = -0.1;
    const result = Validator.isValidPositiveFloat(value);
    expect(result).toBe(false);
    Log(positiveFloatInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return true for a float', (done) => {
    const value = 1.1;
    const result = Validator.isValidPositiveFloat(value);
    expect(result).toBe(true);
    Log(positiveFloatInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for the number 0', (done) => {
    const value = 0;
    const result = Validator.isValidPositiveFloat(value);
    expect(result).toBe(false);
    Log(positiveFloatInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return true for a positive number', (done) => {
    const value = 0.1;
    const result = Validator.isValidPositiveFloat(value);
    expect(result).toBe(true);
    Log(positiveFloatInputValidator, `${value} returns ${result}`);
    done();
  });
});
/* eslint-enable no-undef */

const Log = require('../../logger');
const Validator = require('../../../app/utilities/validator');

/* eslint-disable no-undef */
const passwordInputValidator = 'Password input validator';
describe(passwordInputValidator, () => {
  it('should return false for a null value', (done) => {
    const value = null;
    const result = Validator.isValidPassword(value);
    expect(result).toBe(false);
    Log(passwordInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for an undefined value', (done) => {
    const value = undefined;
    const result = Validator.isValidPassword(value);
    expect(result).toBe(false);
    Log(passwordInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for an array', (done) => {
    const value = [];
    const result = Validator.isValidPassword(value);
    expect(result).toBe(false);
    Log(passwordInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for an object', (done) => {
    const value = {};
    const result = Validator.isValidPassword(value);
    expect(result).toBe(false);
    Log(passwordInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a function', (done) => {
    const value = function value() {};
    const result = Validator.isValidPassword(value);
    expect(result).toBe(false);
    Log(passwordInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a boolean false value', (done) => {
    const value = false;
    const result = Validator.isValidPassword(value);
    expect(result).toBe(false);
    Log(passwordInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a boolean true value', (done) => {
    const value = true;
    const result = Validator.isValidPassword(value);
    expect(result).toBe(false);
    Log(passwordInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for an empty string', (done) => {
    const value = '';
    const result = Validator.isValidPassword(value);
    expect(result).toBe(false);
    Log(passwordInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with space whitespace', (done) => {
    const value = '    ';
    const result = Validator.isValidPassword(value);
    expect(result).toBe(false);
    Log(passwordInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with tabbed whitespace', (done) => {
    const value = '\t';
    const result = Validator.isValidPassword(value);
    expect(result).toBe(false);
    Log(passwordInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with newline whitespace', (done) => {
    const value = '\n';
    const result = Validator.isValidPassword(value);
    expect(result).toBe(false);
    Log(passwordInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with return whitespace', (done) => {
    const value = '\r';
    const result = Validator.isValidPassword(value);
    expect(result).toBe(false);
    Log(passwordInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a float with decimal places', (done) => {
    const value = 1.1;
    const result = Validator.isValidPassword(value);
    expect(result).toBe(false);
    Log(passwordInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a number', (done) => {
    const value = 0;
    const result = Validator.isValidPassword(value);
    expect(result).toBe(false);
    Log(passwordInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with one character', (done) => {
    const value = '1';
    const result = Validator.isValidPassword(value);
    expect(result).toBe(false);
    Log(passwordInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with 2 characters', (done) => {
    const value = 'he';
    const result = Validator.isValidPassword(value);
    expect(result).toBe(false);
    Log(passwordInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with 3 characters character', (done) => {
    const value = 'he$';
    const result = Validator.isValidPassword(value);
    expect(result).toBe(false);
    Log(passwordInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with starting whitespace, and then word characters', (done) => {
    const value = '  hey-';
    const result = Validator.isValidPassword(value);
    expect(result).toBe(false);
    Log(passwordInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return true for a string with at least 4 characters', (done) => {
    const value = 'he-w';
    const result = Validator.isValidPassword(value);
    expect(result).toBe(true);
    Log(passwordInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return true for a string with special characters', (done) => {
    const value = '$$$$';
    const result = Validator.isValidPassword(value);
    expect(result).toBe(true);
    Log(passwordInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return true for a string with emoji', (done) => {
    const value = 'hey😈';
    const result = Validator.isValidPassword(value);
    expect(result).toBe(true);
    Log(passwordInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return true for a string with Javascript code', (done) => {
    const value = 'console.log(\'hey\')';
    const result = Validator.isValidPassword(value);
    expect(result).toBe(true);
    Log(passwordInputValidator, `${value} returns ${result}`);
    done();
  });
});
/* eslint-enable no-undef */

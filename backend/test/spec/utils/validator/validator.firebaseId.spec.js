const Log = require('../../../logger');
const Validator = require('../../../../src/utilities/validator');

const testName = 'Validator Module';
const isValidFirebaseIdTitle = 'isValidFirebaseId()';
/* eslint-disable no-undef */
describe(isValidFirebaseIdTitle, () => {
  it('should return false for a null value', (done) => {
    const value = null;
    const result = Validator.isValidFirebaseId(value);
    expect(result).toBe(false);
    Log(testName, isValidFirebaseIdTitle, `${value} returns ${result}`);
    done();
  });

  it('should return false for an undefined value', (done) => {
    const value = undefined;
    const result = Validator.isValidFirebaseId(value);
    expect(result).toBe(false);
    Log(testName, isValidFirebaseIdTitle, `${value} returns ${result}`);
    done();
  });

  it('should return false for an array', (done) => {
    const value = [];
    const result = Validator.isValidFirebaseId(value);
    expect(result).toBe(false);
    Log(testName, isValidFirebaseIdTitle, `${value} returns ${result}`);
    done();
  });

  it('should return false for an object', (done) => {
    const value = {};
    const result = Validator.isValidFirebaseId(value);
    expect(result).toBe(false);
    Log(testName, isValidFirebaseIdTitle, `${value} returns ${result}`);
    done();
  });

  it('should return false for a function', (done) => {
    const value = function value() {};
    const result = Validator.isValidFirebaseId(value);
    expect(result).toBe(false);
    Log(testName, isValidFirebaseIdTitle, `${value} returns ${result}`);
    done();
  });

  it('should return false for a boolean false value', (done) => {
    const value = false;
    const result = Validator.isValidFirebaseId(value);
    expect(result).toBe(false);
    Log(testName, isValidFirebaseIdTitle, `${value} returns ${result}`);
    done();
  });

  it('should return false for a boolean true value', (done) => {
    const value = true;
    const result = Validator.isValidFirebaseId(value);
    expect(result).toBe(false);
    Log(testName, isValidFirebaseIdTitle, `${value} returns ${result}`);
    done();
  });

  it('should return false for a float with decimal places', (done) => {
    const value = 1.1;
    const result = Validator.isValidFirebaseId(value);
    expect(result).toBe(false);
    Log(testName, isValidFirebaseIdTitle, `${value} returns ${result}`);
    done();
  });

  it('should return false for a number', (done) => {
    const value = 0;
    const result = Validator.isValidFirebaseId(value);
    expect(result).toBe(false);
    Log(testName, isValidFirebaseIdTitle, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string containing a period', (done) => {
    const value = '.';
    const result = Validator.isValidFirebaseId(value);
    expect(result).toBe(false);
    Log(testName, isValidFirebaseIdTitle, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string containing a #', (done) => {
    const value = '#';
    const result = Validator.isValidFirebaseId(value);
    expect(result).toBe(false);
    Log(testName, isValidFirebaseIdTitle, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string containing a $', (done) => {
    const value = '$';
    const result = Validator.isValidFirebaseId(value);
    expect(result).toBe(false);
    Log(testName, isValidFirebaseIdTitle, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string containing a [', (done) => {
    const value = '[';
    const result = Validator.isValidFirebaseId(value);
    expect(result).toBe(false);
    Log(testName, isValidFirebaseIdTitle, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string containing a ]', (done) => {
    const value = ']';
    const result = Validator.isValidFirebaseId(value);
    expect(result).toBe(false);
    Log(testName, isValidFirebaseIdTitle, `${value} returns ${result}`);
    done();
  });

  it('should return false for an empty string', (done) => {
    const value = '';
    const result = Validator.isValidFirebaseId(value);
    expect(result).toBe(false);
    Log(testName, isValidFirebaseIdTitle, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with space whitespace', (done) => {
    const value = '    ';
    const result = Validator.isValidFirebaseId(value);
    expect(result).toBe(false);
    Log(testName, isValidFirebaseIdTitle, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with tabbed whitespace', (done) => {
    const value = '\t';
    const result = Validator.isValidFirebaseId(value);
    expect(result).toBe(false);
    Log(testName, isValidFirebaseIdTitle, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with newline whitespace', (done) => {
    const value = '\n';
    const result = Validator.isValidFirebaseId(value);
    expect(result).toBe(false);
    Log(testName, isValidFirebaseIdTitle, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with return whitespace', (done) => {
    const value = '\r';
    const result = Validator.isValidFirebaseId(value);
    expect(result).toBe(false);
    Log(testName, isValidFirebaseIdTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for a non-empty string', (done) => {
    const value = 'hey';
    const result = Validator.isValidFirebaseId(value);
    expect(result).toBe(true);
    Log(testName, isValidFirebaseIdTitle, `${value} returns ${result}`);
    done();
  });
});

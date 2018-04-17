const Log = require('../../../logger');
const Validator = require('../../../../src/utilities/validator');

/* eslint-disable no-undef */
const booleanStringInputValidator = 'Boolean string input validator';
describe(booleanStringInputValidator, () => {
  it('should return false for a null value', (done) => {
    const value = null;
    const result = Validator.isValidBooleanString(value);
    expect(result).toBe(false);
    Log(booleanStringInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for an undefined value', (done) => {
    const value = undefined;
    const result = Validator.isValidBooleanString(value);
    expect(result).toBe(false);
    Log(booleanStringInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for an array', (done) => {
    const value = [];
    const result = Validator.isValidBooleanString(value);
    expect(result).toBe(false);
    Log(booleanStringInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for an object', (done) => {
    const value = {};
    const result = Validator.isValidBooleanString(value);
    expect(result).toBe(false);
    Log(booleanStringInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a function', (done) => {
    const value = function value() {};
    const result = Validator.isValidBooleanString(value);
    expect(result).toBe(false);
    Log(booleanStringInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a boolean false value', (done) => {
    const value = false;
    const result = Validator.isValidBooleanString(value);
    expect(result).toBe(false);
    Log(booleanStringInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a boolean true value', (done) => {
    const value = true;
    const result = Validator.isValidBooleanString(value);
    expect(result).toBe(false);
    Log(booleanStringInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for an empty string', (done) => {
    const value = '';
    const result = Validator.isValidBooleanString(value);
    expect(result).toBe(false);
    Log(booleanStringInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with space whitespace', (done) => {
    const value = '    ';
    const result = Validator.isValidBooleanString(value);
    expect(result).toBe(false);
    Log(booleanStringInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with tabbed whitespace', (done) => {
    const value = '\t';
    const result = Validator.isValidBooleanString(value);
    expect(result).toBe(false);
    Log(booleanStringInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with newline whitespace', (done) => {
    const value = '\n';
    const result = Validator.isValidBooleanString(value);
    expect(result).toBe(false);
    Log(booleanStringInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with return whitespace', (done) => {
    const value = '\r';
    const result = Validator.isValidBooleanString(value);
    expect(result).toBe(false);
    Log(booleanStringInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a float with decimal places', (done) => {
    const value = 1.1;
    const result = Validator.isValidBooleanString(value);
    expect(result).toBe(false);
    Log(booleanStringInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a number', (done) => {
    const value = 0;
    const result = Validator.isValidBooleanString(value);
    expect(result).toBe(false);
    Log(booleanStringInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with a number', (done) => {
    const value = '1';
    const result = Validator.isValidBooleanString(value);
    expect(result).toBe(false);
    Log(booleanStringInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with a float', (done) => {
    const value = '1.1';
    const result = Validator.isValidBooleanString(value);
    expect(result).toBe(false);
    Log(booleanStringInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with special characters', (done) => {
    const value = 'console.log(\'hey\')';
    const result = Validator.isValidBooleanString(value);
    expect(result).toBe(false);
    Log(booleanStringInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string containing whitespace and text', (done) => {
    const value = '  hey-';
    const result = Validator.isValidBooleanString(value);
    expect(result).toBe(false);
    Log(booleanStringInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string containing symbols', (done) => {
    const value = 'he$';
    const result = Validator.isValidBooleanString(value);
    expect(result).toBe(false);
    Log(booleanStringInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string containing emoji', (done) => {
    const value = '😈';
    const result = Validator.isValidBooleanString(value);
    expect(result).toBe(false);
    Log(booleanStringInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return true for a string containing a boolean true value', (done) => {
    const value = 'true';
    const result = Validator.isValidBooleanString(value);
    expect(result).toBe(true);
    Log(booleanStringInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return true for a string containing a boolean false value', (done) => {
    const value = 'false';
    const result = Validator.isValidBooleanString(value);
    expect(result).toBe(true);
    Log(booleanStringInputValidator, `${value} returns ${result}`);
    done();
  });
});

const booleanInputValidator = 'Boolean input validator';
describe(booleanInputValidator, () => {
  it('should return false for a null value', (done) => {
    const value = null;
    const result = Validator.isValidBoolean(value);
    expect(result).toBe(false);
    Log(booleanInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for an undefined value', (done) => {
    const value = undefined;
    const result = Validator.isValidBoolean(value);
    expect(result).toBe(false);
    Log(booleanInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for an array', (done) => {
    const value = [];
    const result = Validator.isValidBoolean(value);
    expect(result).toBe(false);
    Log(booleanInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for an object', (done) => {
    const value = {};
    const result = Validator.isValidBoolean(value);
    expect(result).toBe(false);
    Log(booleanInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a function', (done) => {
    const value = function value() {};
    const result = Validator.isValidBoolean(value);
    expect(result).toBe(false);
    Log(booleanInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for an empty string', (done) => {
    const value = '';
    const result = Validator.isValidBoolean(value);
    expect(result).toBe(false);
    Log(booleanInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with space whitespace', (done) => {
    const value = '    ';
    const result = Validator.isValidBoolean(value);
    expect(result).toBe(false);
    Log(booleanInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with tabbed whitespace', (done) => {
    const value = '\t';
    const result = Validator.isValidBoolean(value);
    expect(result).toBe(false);
    Log(booleanInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with newline whitespace', (done) => {
    const value = '\n';
    const result = Validator.isValidBoolean(value);
    expect(result).toBe(false);
    Log(booleanInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with return whitespace', (done) => {
    const value = '\r';
    const result = Validator.isValidBoolean(value);
    expect(result).toBe(false);
    Log(booleanInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a float with decimal places', (done) => {
    const value = 1.1;
    const result = Validator.isValidBoolean(value);
    expect(result).toBe(false);
    Log(booleanInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a number', (done) => {
    const value = 0;
    const result = Validator.isValidBoolean(value);
    expect(result).toBe(false);
    Log(booleanInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with a number', (done) => {
    const value = '1';
    const result = Validator.isValidBoolean(value);
    expect(result).toBe(false);
    Log(booleanInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with a float', (done) => {
    const value = '1.1';
    const result = Validator.isValidBoolean(value);
    expect(result).toBe(false);
    Log(booleanInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with special characters', (done) => {
    const value = 'console.log(\'hey\')';
    const result = Validator.isValidBoolean(value);
    expect(result).toBe(false);
    Log(booleanInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string containing whitespace and text', (done) => {
    const value = '  hey-';
    const result = Validator.isValidBoolean(value);
    expect(result).toBe(false);
    Log(booleanInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string containing symbols', (done) => {
    const value = 'he$';
    const result = Validator.isValidBoolean(value);
    expect(result).toBe(false);
    Log(booleanInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string containing emoji', (done) => {
    const value = '😈';
    const result = Validator.isValidBoolean(value);
    expect(result).toBe(false);
    Log(booleanInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return true for a boolean false value', (done) => {
    const value = false;
    const result = Validator.isValidBoolean(value);
    expect(result).toBe(true);
    Log(booleanInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return true for a boolean true value', (done) => {
    const value = true;
    const result = Validator.isValidBoolean(value);
    expect(result).toBe(true);
    Log(booleanInputValidator, `${value} returns ${result}`);
    done();
  });
});
/* eslint-enable no-undef */

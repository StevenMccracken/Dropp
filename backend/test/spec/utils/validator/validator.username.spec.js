const Log = require('../../../logger');
const Validator = require('../../../../src/utilities/validator');

const testName = 'Validator Module';
const isValidUsernameTitle = 'isValidUsername()';
/* eslint-disable no-undef */
describe(isValidUsernameTitle, () => {
  it('should return false for a null value', (done) => {
    const value = null;
    const result = Validator.isValidUsername(value);
    expect(result).toBe(false);
    Log(testName, isValidUsernameTitle, `${value} returns ${result}`);
    done();
  });

  it('should return false for an undefined value', (done) => {
    const value = undefined;
    const result = Validator.isValidUsername(value);
    expect(result).toBe(false);
    Log(testName, isValidUsernameTitle, `${value} returns ${result}`);
    done();
  });

  it('should return false for an array', (done) => {
    const value = [];
    const result = Validator.isValidUsername(value);
    expect(result).toBe(false);
    Log(testName, isValidUsernameTitle, `${value} returns ${result}`);
    done();
  });

  it('should return false for an object', (done) => {
    const value = {};
    const result = Validator.isValidUsername(value);
    expect(result).toBe(false);
    Log(testName, isValidUsernameTitle, `${value} returns ${result}`);
    done();
  });

  it('should return false for a function', (done) => {
    const value = function value() {};
    const result = Validator.isValidUsername(value);
    expect(result).toBe(false);
    Log(testName, isValidUsernameTitle, `${value} returns ${result}`);
    done();
  });

  it('should return false for a boolean false value', (done) => {
    const value = false;
    const result = Validator.isValidUsername(value);
    expect(result).toBe(false);
    Log(testName, isValidUsernameTitle, `${value} returns ${result}`);
    done();
  });

  it('should return false for a boolean true value', (done) => {
    const value = true;
    const result = Validator.isValidUsername(value);
    expect(result).toBe(false);
    Log(testName, isValidUsernameTitle, `${value} returns ${result}`);
    done();
  });

  it('should return false for an empty string', (done) => {
    const value = '';
    const result = Validator.isValidUsername(value);
    expect(result).toBe(false);
    Log(testName, isValidUsernameTitle, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with space whitespace', (done) => {
    const value = '    ';
    const result = Validator.isValidUsername(value);
    expect(result).toBe(false);
    Log(testName, isValidUsernameTitle, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with tabbed whitespace', (done) => {
    const value = '\t';
    const result = Validator.isValidUsername(value);
    expect(result).toBe(false);
    Log(testName, isValidUsernameTitle, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with newline whitespace', (done) => {
    const value = '\n';
    const result = Validator.isValidUsername(value);
    expect(result).toBe(false);
    Log(testName, isValidUsernameTitle, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with return whitespace', (done) => {
    const value = '\r';
    const result = Validator.isValidUsername(value);
    expect(result).toBe(false);
    Log(testName, isValidUsernameTitle, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with Javascript code', (done) => {
    const value = 'console.log(\'hey\')';
    const result = Validator.isValidUsername(value);
    expect(result).toBe(false);
    Log(testName, isValidUsernameTitle, `${value} returns ${result}`);
    done();
  });

  it('should return false for a float with decimal places', (done) => {
    const value = 1.1;
    const result = Validator.isValidUsername(value);
    expect(result).toBe(false);
    Log(testName, isValidUsernameTitle, `${value} returns ${result}`);
    done();
  });

  it('should return false for a number', (done) => {
    const value = 0;
    const result = Validator.isValidUsername(value);
    expect(result).toBe(false);
    Log(testName, isValidUsernameTitle, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with one character', (done) => {
    const value = '1';
    const result = Validator.isValidUsername(value);
    expect(result).toBe(false);
    Log(testName, isValidUsernameTitle, `${value} returns ${result}`);
    done();
  });

  it(
    'should return false for a string with starting whitespace, and then word characters',
    (done) => {
      const value = '  hey-';
      const result = Validator.isValidUsername(value);
      expect(result).toBe(false);
      Log(testName, isValidUsernameTitle, `${value} returns ${result}`);
      done();
    }
  );

  it('should return false for a string with a non-word character', (done) => {
    const value = 'he$';
    const result = Validator.isValidUsername(value);
    expect(result).toBe(false);
    Log(testName, isValidUsernameTitle, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with a period in the first two characters', (done) => {
    const value = 'h.';
    const result = Validator.isValidUsername(value);
    expect(result).toBe(false);
    Log(testName, isValidUsernameTitle, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with a period after the first two characters', (done) => {
    const value = '__.';
    const result = Validator.isValidUsername(value);
    expect(result).toBe(false);
    Log(testName, isValidUsernameTitle, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with a dash after the first two characters', (done) => {
    const value = '__-';
    const result = Validator.isValidUsername(value);
    expect(result).toBe(false);
    Log(testName, isValidUsernameTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for a string with two word characters at the beginning', (done) => {
    const value = 'he';
    const result = Validator.isValidUsername(value);
    expect(result).toBe(true);
    Log(testName, isValidUsernameTitle, `${value} returns ${result}`);
    done();
  });

  it(
    'should return true for a string with an underscore after the first two characters',
    (done) => {
      const value = 'he_';
      const result = Validator.isValidUsername(value);
      expect(result).toBe(true);
      Log(testName, isValidUsernameTitle, `${value} returns ${result}`);
      done();
    }
  );

  it(
    'should return true for a string with a period after the first two characters, followed by a word character',
    (done) => {
      const value = 'he._';
      const result = Validator.isValidUsername(value);
      expect(result).toBe(true);
      Log(testName, isValidUsernameTitle, `${value} returns ${result}`);
      done();
    }
  );

  it(
    'should return true for a string with a dash after the first two characters, followed by a word character',
    (done) => {
      const value = 'he-w';
      const result = Validator.isValidUsername(value);
      expect(result).toBe(true);
      Log(testName, isValidUsernameTitle, `${value} returns ${result}`);
      done();
    }
  );
});

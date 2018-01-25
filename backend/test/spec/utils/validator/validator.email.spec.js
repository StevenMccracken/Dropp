const Log = require('../../../logger');
const Validator = require('../../../../src/utilities/validator');

/* eslint-disable no-undef */
const emailInputValidator = 'Email input validator';
describe(emailInputValidator, () => {
  it('should return false for a null value', (done) => {
    const value = null;
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log(emailInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for an undefined value', (done) => {
    const value = undefined;
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log(emailInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for an array', (done) => {
    const value = [];
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log(emailInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for an object', (done) => {
    const value = {};
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log(emailInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a function', (done) => {
    const value = function value() {};
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log(emailInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a boolean false value', (done) => {
    const value = false;
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log(emailInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a boolean true value', (done) => {
    const value = true;
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log(emailInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for an empty string', (done) => {
    const value = '';
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log(emailInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with space whitespace', (done) => {
    const value = '    ';
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log(emailInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with tabbed whitespace', (done) => {
    const value = '\t';
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log(emailInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with newline whitespace', (done) => {
    const value = '\n';
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log(emailInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with return whitespace', (done) => {
    const value = '\r';
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log(emailInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with Javascript code', (done) => {
    const value = 'console.log(\'hey\')';
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log(emailInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a float with decimal places', (done) => {
    const value = 1.1;
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log(emailInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a number', (done) => {
    const value = 0;
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log(emailInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with one character', (done) => {
    const value = '1';
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log(emailInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with starting whitespace, and then word characters', (done) => {
    const value = '  hey-';
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log(emailInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with a non-word character', (done) => {
    const value = 'he$';
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log(emailInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with a period in the first two characters', (done) => {
    const value = 'h.';
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log(emailInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with a period after the first two characters', (done) => {
    const value = '__.';
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log(emailInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a string with a dash after the first two characters', (done) => {
    const value = '__-';
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log(emailInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a malformed email address', (done) => {
    const value = 'first.last@sub.do,com';
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log(emailInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a malformed email address', (done) => {
    /* eslint-disable no-useless-escape */
    const value = 'first\@last@iana.org';
    /* eslint-enable no-useless-escape */
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log(emailInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a malformed email address', (done) => {
    const value = '"""@iana.org';
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log(emailInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a malformed email address', (done) => {
    const value = 'first.last@[IPv6:1111:2222:3333:4444:5555:12.34.56.78]';
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log(emailInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a malformed email address', (done) => {
    const value = 'first.last@-xample.com';
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log(emailInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a malformed email address', (done) => {
    const value = '@iana.org';
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log(emailInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return false for a malformed email address', (done) => {
    const value = 'gatsby@f.sc.ot.t.f.i.tzg.era.l.d.';
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log(emailInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return true for a valid email address', (done) => {
    const value = '12345678901234567890123456789012345678901234567890123456789012345@iana.org';
    const result = Validator.isValidEmail(value);
    expect(result).toBe(true);
    Log(emailInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return true for a valid email address', (done) => {
    const value = '123456789012345678901234567890123456789012345678901234567890@12345678901234567890123456789012345678901234567890123456789.12345678901234567890123456789012345678901234567890123456789.12345678901234567890123456789012345678901234567890123456789.12345.iana.org';
    const result = Validator.isValidEmail(value);
    expect(result).toBe(true);
    Log(emailInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return true for a valid email address', (done) => {
    const value = 'test@test.com';
    const result = Validator.isValidEmail(value);
    expect(result).toBe(true);
    Log(emailInputValidator, `${value} returns ${result}`);
    done();
  });

  it('should return true for a valid email address', (done) => {
    const value = 'test@test.co';
    const result = Validator.isValidEmail(value);
    expect(result).toBe(true);
    Log(emailInputValidator, `${value} returns ${result}`);
    done();
  });
});
/* eslint-enable no-undef */

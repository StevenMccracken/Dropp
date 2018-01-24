const Log = require('../../logger');
const Utils = require('../../../app/utilities/utils');

/* eslint-disable no-undef */
const utilsTitle = 'Utils hasValue()';
describe(utilsTitle, () => {
  it('should return false for a null value', (done) => {
    const value = null;
    const result = Utils.hasValue(value);
    expect(result).toBe(false);
    Log(utilsTitle, `${value} returns ${result}`);
    done();
  });

  it('should return false for an undefined value', (done) => {
    const value = undefined;
    const result = Utils.hasValue(value);
    expect(result).toBe(false);
    Log(utilsTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for an array', (done) => {
    const value = [];
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log(utilsTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for an object', (done) => {
    const value = {};
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log(utilsTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for a function', (done) => {
    const value = function value() {};
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log(utilsTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for a boolean false value', (done) => {
    const value = false;
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log(utilsTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for a boolean true value', (done) => {
    const value = true;
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log(utilsTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for an empty string', (done) => {
    const value = '';
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log(utilsTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for a string with space whitespace', (done) => {
    const value = '    ';
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log(utilsTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for a string with tabbed whitespace', (done) => {
    const value = '\t';
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log(utilsTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for a string with newline whitespace', (done) => {
    const value = '\n';
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log(utilsTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for a string with return whitespace', (done) => {
    const value = '\r';
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log(utilsTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for a string with Javascript code', (done) => {
    const value = 'console.log(\'hey\')';
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log(utilsTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for a float with decimal places', (done) => {
    const value = 1.1;
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log(utilsTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for a number', (done) => {
    const value = 0;
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log(utilsTitle, `${value} returns ${result}`);
    done();
  });

  it('should return true for a string with one character', (done) => {
    const value = '1';
    const result = Utils.hasValue(value);
    expect(result).toBe(true);
    Log(utilsTitle, `${value} returns ${result}`);
    done();
  });
});
/* eslint-enable no-undef */

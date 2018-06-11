const Log = require('../../../logger');
const Validator = require('../../../../src/utilities/validator');

const testName = 'Validator Module';
const isValidUsernameTitle = 'isValidUsername()';
/* eslint-disable no-undef */
describe(isValidUsernameTitle, () => {
  const it1 = 'should return false for a null value';
  it(it1, () => {
    Log.it(testName, isValidUsernameTitle, it1, true);
    const value = null;
    const result = Validator.isValidUsername(value);
    expect(result).toBe(false);
    Log.log(testName, isValidUsernameTitle, `${value} returns ${result}`);
    Log.it(testName, isValidUsernameTitle, it1, false);
  });

  const it2 = 'should return false for an undefined value';
  it(it2, () => {
    Log.it(testName, isValidUsernameTitle, it2, true);
    const value = undefined;
    const result = Validator.isValidUsername(value);
    expect(result).toBe(false);
    Log.log(testName, isValidUsernameTitle, `${value} returns ${result}`);
    Log.it(testName, isValidUsernameTitle, it2, false);
  });

  const it3 = 'should return false for an array';
  it(it3, () => {
    Log.it(testName, isValidUsernameTitle, it3, true);
    const value = [];
    const result = Validator.isValidUsername(value);
    expect(result).toBe(false);
    Log.log(testName, isValidUsernameTitle, `${value} returns ${result}`);
    Log.it(testName, isValidUsernameTitle, it3, false);
  });

  const it4 = 'should return false for an object';
  it(it4, () => {
    Log.it(testName, isValidUsernameTitle, it4, true);
    const value = {};
    const result = Validator.isValidUsername(value);
    expect(result).toBe(false);
    Log.log(testName, isValidUsernameTitle, `${value} returns ${result}`);
    Log.it(testName, isValidUsernameTitle, it4, false);
  });

  const it5 = 'should return false for a function';
  it(it5, () => {
    Log.it(testName, isValidUsernameTitle, it5, true);
    const value = function value() {};
    const result = Validator.isValidUsername(value);
    expect(result).toBe(false);
    Log.log(testName, isValidUsernameTitle, `${value} returns ${result}`);
    Log.it(testName, isValidUsernameTitle, it5, false);
  });

  const it6 = 'should return false for a boolean false value';
  it(it6, () => {
    Log.it(testName, isValidUsernameTitle, it6, true);
    const value = false;
    const result = Validator.isValidUsername(value);
    expect(result).toBe(false);
    Log.log(testName, isValidUsernameTitle, `${value} returns ${result}`);
    Log.it(testName, isValidUsernameTitle, it6, false);
  });

  const it7 = 'should return false for a boolean true value';
  it(it7, () => {
    Log.it(testName, isValidUsernameTitle, it7, true);
    const value = true;
    const result = Validator.isValidUsername(value);
    expect(result).toBe(false);
    Log.log(testName, isValidUsernameTitle, `${value} returns ${result}`);
    Log.it(testName, isValidUsernameTitle, it7, false);
  });

  const it8 = 'should return false for an empty string';
  it(it8, () => {
    Log.it(testName, isValidUsernameTitle, it8, true);
    const value = '';
    const result = Validator.isValidUsername(value);
    expect(result).toBe(false);
    Log.log(testName, isValidUsernameTitle, `${value} returns ${result}`);
    Log.it(testName, isValidUsernameTitle, it8, false);
  });

  const it9 = 'should return false for a string with space whitespace';
  it(it9, () => {
    Log.it(testName, isValidUsernameTitle, it9, true);
    const value = '    ';
    const result = Validator.isValidUsername(value);
    expect(result).toBe(false);
    Log.log(testName, isValidUsernameTitle, `${value} returns ${result}`);
    Log.it(testName, isValidUsernameTitle, it9, false);
  });

  const it10 = 'should return false for a string with tabbed whitespace';
  it(it10, () => {
    Log.it(testName, isValidUsernameTitle, it10, true);
    const value = '\t';
    const result = Validator.isValidUsername(value);
    expect(result).toBe(false);
    Log.log(testName, isValidUsernameTitle, `${value} returns ${result}`);
    Log.it(testName, isValidUsernameTitle, it10, false);
  });

  const it11 = 'should return false for a string with newline whitespace';
  it(it11, () => {
    Log.it(testName, isValidUsernameTitle, it11, true);
    const value = '\n';
    const result = Validator.isValidUsername(value);
    expect(result).toBe(false);
    Log.log(testName, isValidUsernameTitle, `${value} returns ${result}`);
    Log.it(testName, isValidUsernameTitle, it11, false);
  });

  const it12 = 'should return false for a string with return whitespace';
  it(it12, () => {
    Log.it(testName, isValidUsernameTitle, it12, true);
    const value = '\r';
    const result = Validator.isValidUsername(value);
    expect(result).toBe(false);
    Log.log(testName, isValidUsernameTitle, `${value} returns ${result}`);
    Log.it(testName, isValidUsernameTitle, it12, false);
  });

  const it13 = 'should return false for a string with Javascript code';
  it(it13, () => {
    Log.it(testName, isValidUsernameTitle, it13, true);
    const value = 'console.log(\'hey\')';
    const result = Validator.isValidUsername(value);
    expect(result).toBe(false);
    Log.log(testName, isValidUsernameTitle, `${value} returns ${result}`);
    Log.it(testName, isValidUsernameTitle, it13, false);
  });

  const it14 = 'should return false for a float with decimal places';
  it(it14, () => {
    Log.it(testName, isValidUsernameTitle, it14, true);
    const value = 1.1;
    const result = Validator.isValidUsername(value);
    expect(result).toBe(false);
    Log.log(testName, isValidUsernameTitle, `${value} returns ${result}`);
    Log.it(testName, isValidUsernameTitle, it14, false);
  });

  const it15 = 'should return false for a number';
  it(it15, () => {
    Log.it(testName, isValidUsernameTitle, it15, true);
    const value = 0;
    const result = Validator.isValidUsername(value);
    expect(result).toBe(false);
    Log.log(testName, isValidUsernameTitle, `${value} returns ${result}`);
    Log.it(testName, isValidUsernameTitle, it15, false);
  });

  const it16 = 'should return false for a string with one character';
  it(it16, () => {
    Log.it(testName, isValidUsernameTitle, it16, true);
    const value = '1';
    const result = Validator.isValidUsername(value);
    expect(result).toBe(false);
    Log.log(testName, isValidUsernameTitle, `${value} returns ${result}`);
    Log.it(testName, isValidUsernameTitle, it16, false);
  });

  const it17 = 'should return false for a string with starting whitespace, and then word characters';
  it(it17, () => {
    Log.it(testName, isValidUsernameTitle, it17, true);
    const value = '  hey-';
    const result = Validator.isValidUsername(value);
    expect(result).toBe(false);
    Log.log(testName, isValidUsernameTitle, `${value} returns ${result}`);
    Log.it(testName, isValidUsernameTitle, it17, false);
  });

  const it18 = 'should return false for a string with a non-word character';
  it(it18, () => {
    Log.it(testName, isValidUsernameTitle, it18, true);
    const value = 'he$';
    const result = Validator.isValidUsername(value);
    expect(result).toBe(false);
    Log.log(testName, isValidUsernameTitle, `${value} returns ${result}`);
    Log.it(testName, isValidUsernameTitle, it18, false);
  });

  const it19 = 'should return false for a string with a period in the first two characters';
  it(it19, () => {
    Log.it(testName, isValidUsernameTitle, it19, true);
    const value = 'h.';
    const result = Validator.isValidUsername(value);
    expect(result).toBe(false);
    Log.log(testName, isValidUsernameTitle, `${value} returns ${result}`);
    Log.it(testName, isValidUsernameTitle, it19, false);
  });

  const it20 = 'should return false for a string with a period after the first two characters';
  it(it20, () => {
    Log.it(testName, isValidUsernameTitle, it20, true);
    const value = '__.';
    const result = Validator.isValidUsername(value);
    expect(result).toBe(false);
    Log.log(testName, isValidUsernameTitle, `${value} returns ${result}`);
    Log.it(testName, isValidUsernameTitle, it20, false);
  });

  const it21 = 'should return false for a string with a dash after the first two characters';
  it(it21, () => {
    Log.it(testName, isValidUsernameTitle, it21, true);
    const value = '__-';
    const result = Validator.isValidUsername(value);
    expect(result).toBe(false);
    Log.log(testName, isValidUsernameTitle, `${value} returns ${result}`);
    Log.it(testName, isValidUsernameTitle, it21, false);
  });

  const it22 = 'should return true for a string with two word characters at the beginning';
  it(it22, () => {
    Log.it(testName, isValidUsernameTitle, it22, true);
    const value = 'he';
    const result = Validator.isValidUsername(value);
    expect(result).toBe(true);
    Log.log(testName, isValidUsernameTitle, `${value} returns ${result}`);
    Log.it(testName, isValidUsernameTitle, it22, false);
  });

  const it23 = 'should return true for a string with an underscore after the first two characters';
  it(it23, () => {
    Log.it(testName, isValidUsernameTitle, it23, true);
    const value = 'he_';
    const result = Validator.isValidUsername(value);
    expect(result).toBe(true);
    Log.log(testName, isValidUsernameTitle, `${value} returns ${result}`);
    Log.it(testName, isValidUsernameTitle, it23, false);
  });

  it(
    'should return true for a string with a period after the first two characters, followed by a word character',
    () => {
      const value = 'he._';
      const result = Validator.isValidUsername(value);
      expect(result).toBe(true);
      Log.log(testName, isValidUsernameTitle, `${value} returns ${result}`);
    }
  );

  it(
    'should return true for a string with a dash after the first two characters, followed by a word character',
    () => {
      const value = 'he-w';
      const result = Validator.isValidUsername(value);
      expect(result).toBe(true);
      Log.log(testName, isValidUsernameTitle, `${value} returns ${result}`);
    }
  );
});

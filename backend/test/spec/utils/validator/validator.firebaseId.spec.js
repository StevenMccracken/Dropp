const Log = require('../../../logger');
const Validator = require('../../../../src/utilities/validator');

const testName = 'Validator Module';
const isValidFirebaseIdTitle = 'isValidFirebaseId()';
/* eslint-disable no-undef */
describe(isValidFirebaseIdTitle, () => {
  const it1 = 'should return false for a null value';
  it(it1, () => {
    Log.it(testName, isValidFirebaseIdTitle, it1, true);
    const value = null;
    const result = Validator.isValidFirebaseId(value);
    expect(result).toBe(false);
    Log.log(testName, isValidFirebaseIdTitle, `${value} returns ${result}`);
    Log.it(testName, isValidFirebaseIdTitle, it1, false);
  });

  const it2 = 'should return false for an undefined value';
  it(it2, () => {
    Log.it(testName, isValidFirebaseIdTitle, it2, true);
    const value = undefined;
    const result = Validator.isValidFirebaseId(value);
    expect(result).toBe(false);
    Log.log(testName, isValidFirebaseIdTitle, `${value} returns ${result}`);
    Log.it(testName, isValidFirebaseIdTitle, it2, false);
  });

  const it3 = 'should return false for an array';
  it(it3, () => {
    Log.it(testName, isValidFirebaseIdTitle, it3, true);
    Log.it(testName, isValidFirebaseIdTitle, it3, false);
    const value = [];
    const result = Validator.isValidFirebaseId(value);
    expect(result).toBe(false);
    Log.log(testName, isValidFirebaseIdTitle, `${value} returns ${result}`);
  });

  const it4 = 'should return false for an object';
  it(it4, () => {
    Log.it(testName, isValidFirebaseIdTitle, it4, true);
    const value = {};
    const result = Validator.isValidFirebaseId(value);
    expect(result).toBe(false);
    Log.log(testName, isValidFirebaseIdTitle, `${value} returns ${result}`);
    Log.it(testName, isValidFirebaseIdTitle, it4, false);
  });

  const it5 = 'should return false for a function';
  it(it5, () => {
    Log.it(testName, isValidFirebaseIdTitle, it5, true);
    const value = function value() {};
    const result = Validator.isValidFirebaseId(value);
    expect(result).toBe(false);
    Log.log(testName, isValidFirebaseIdTitle, `${value} returns ${result}`);
    Log.it(testName, isValidFirebaseIdTitle, it5, false);
  });

  const it6 = 'should return false for a boolean false value';
  it(it6, () => {
    Log.it(testName, isValidFirebaseIdTitle, it6, true);
    const value = false;
    const result = Validator.isValidFirebaseId(value);
    expect(result).toBe(false);
    Log.log(testName, isValidFirebaseIdTitle, `${value} returns ${result}`);
    Log.it(testName, isValidFirebaseIdTitle, it6, false);
  });

  const it7 = 'should return false for a boolean true value';
  it(it7, () => {
    Log.it(testName, isValidFirebaseIdTitle, it7, true);
    const value = true;
    const result = Validator.isValidFirebaseId(value);
    expect(result).toBe(false);
    Log.log(testName, isValidFirebaseIdTitle, `${value} returns ${result}`);
    Log.it(testName, isValidFirebaseIdTitle, it7, false);
  });

  const it8 = 'should return false for a float with decimal places';
  it(it8, () => {
    Log.it(testName, isValidFirebaseIdTitle, it8, true);
    const value = 1.1;
    const result = Validator.isValidFirebaseId(value);
    expect(result).toBe(false);
    Log.log(testName, isValidFirebaseIdTitle, `${value} returns ${result}`);
    Log.it(testName, isValidFirebaseIdTitle, it8, false);
  });

  const it9 = 'should return false for a number';
  it(it9, () => {
    Log.it(testName, isValidFirebaseIdTitle, it9, true);
    const value = 0;
    const result = Validator.isValidFirebaseId(value);
    expect(result).toBe(false);
    Log.log(testName, isValidFirebaseIdTitle, `${value} returns ${result}`);
    Log.it(testName, isValidFirebaseIdTitle, it9, false);
  });

  const it10 = 'should return false for a string containing a period';
  it(it10, () => {
    Log.it(testName, isValidFirebaseIdTitle, it10, true);
    const value = '.';
    const result = Validator.isValidFirebaseId(value);
    expect(result).toBe(false);
    Log.log(testName, isValidFirebaseIdTitle, `${value} returns ${result}`);
    Log.it(testName, isValidFirebaseIdTitle, it10, false);
  });

  const it11 = 'should return false for a string containing a #';
  it(it11, () => {
    Log.it(testName, isValidFirebaseIdTitle, it11, true);
    const value = '#';
    const result = Validator.isValidFirebaseId(value);
    expect(result).toBe(false);
    Log.log(testName, isValidFirebaseIdTitle, `${value} returns ${result}`);
    Log.it(testName, isValidFirebaseIdTitle, it11, false);
  });

  const it12 = 'should return false for a string containing a $';
  it(it12, () => {
    Log.it(testName, isValidFirebaseIdTitle, it12, true);
    const value = '$';
    const result = Validator.isValidFirebaseId(value);
    expect(result).toBe(false);
    Log.log(testName, isValidFirebaseIdTitle, `${value} returns ${result}`);
    Log.it(testName, isValidFirebaseIdTitle, it12, false);
  });

  const it13 = 'should return false for a string containing a [';
  it(it13, () => {
    Log.it(testName, isValidFirebaseIdTitle, it13, true);
    const value = '[';
    const result = Validator.isValidFirebaseId(value);
    expect(result).toBe(false);
    Log.log(testName, isValidFirebaseIdTitle, `${value} returns ${result}`);
    Log.it(testName, isValidFirebaseIdTitle, it13, false);
  });

  const it14 = 'should return false for a string containing a ]';
  it(it14, () => {
    Log.it(testName, isValidFirebaseIdTitle, it14, true);
    const value = ']';
    const result = Validator.isValidFirebaseId(value);
    expect(result).toBe(false);
    Log.log(testName, isValidFirebaseIdTitle, `${value} returns ${result}`);
    Log.it(testName, isValidFirebaseIdTitle, it14, false);
  });

  const it15 = 'should return false for an empty string';
  it(it15, () => {
    Log.it(testName, isValidFirebaseIdTitle, it15, true);
    const value = '';
    const result = Validator.isValidFirebaseId(value);
    expect(result).toBe(false);
    Log.log(testName, isValidFirebaseIdTitle, `${value} returns ${result}`);
    Log.it(testName, isValidFirebaseIdTitle, it15, false);
  });

  const it16 = 'should return false for a string with space whitespace';
  it(it16, () => {
    Log.it(testName, isValidFirebaseIdTitle, it16, true);
    const value = '    ';
    const result = Validator.isValidFirebaseId(value);
    expect(result).toBe(false);
    Log.log(testName, isValidFirebaseIdTitle, `${value} returns ${result}`);
    Log.it(testName, isValidFirebaseIdTitle, it16, false);
  });

  const it17 = 'should return false for a string with tabbed whitespace';
  it(it17, () => {
    Log.it(testName, isValidFirebaseIdTitle, it17, true);
    const value = '\t';
    const result = Validator.isValidFirebaseId(value);
    expect(result).toBe(false);
    Log.log(testName, isValidFirebaseIdTitle, `${value} returns ${result}`);
    Log.it(testName, isValidFirebaseIdTitle, it17, false);
  });

  const it18 = 'should return false for a string with newline whitespace';
  it(it18, () => {
    Log.it(testName, isValidFirebaseIdTitle, it18, true);
    const value = '\n';
    const result = Validator.isValidFirebaseId(value);
    expect(result).toBe(false);
    Log.log(testName, isValidFirebaseIdTitle, `${value} returns ${result}`);
    Log.it(testName, isValidFirebaseIdTitle, it18, false);
  });

  const it19 = 'should return false for a string with return whitespace';
  it(it19, () => {
    Log.it(testName, isValidFirebaseIdTitle, it19, true);
    const value = '\r';
    const result = Validator.isValidFirebaseId(value);
    expect(result).toBe(false);
    Log.log(testName, isValidFirebaseIdTitle, `${value} returns ${result}`);
    Log.it(testName, isValidFirebaseIdTitle, it19, false);
  });

  const it20 = 'should return true for a non-empty string';
  it(it20, () => {
    Log.it(testName, isValidFirebaseIdTitle, it20, true);
    const value = 'hey';
    const result = Validator.isValidFirebaseId(value);
    expect(result).toBe(true);
    Log.log(testName, isValidFirebaseIdTitle, `${value} returns ${result}`);
    Log.it(testName, isValidFirebaseIdTitle, it20, false);
  });
});

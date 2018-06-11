const Log = require('../../../logger');
const Validator = require('../../../../src/utilities/validator');

const testName = 'Validator Module';
const isValidTimestampTitle = 'isValidTimestamp()';
/* eslint-disable no-undef */
describe(isValidTimestampTitle, () => {
  const it1 = 'should return false for a null value';
  it(it1, () => {
    Log.it(testName, isValidTimestampTitle, it1, true);
    const value = null;
    const result = Validator.isValidTimestamp(value);
    expect(result).toBe(false);
    Log.log(testName, isValidTimestampTitle, `${value} returns ${result}`);
    Log.it(testName, isValidTimestampTitle, it1, false);
  });

  const it2 = 'should return false for an undefined value';
  it(it2, () => {
    Log.it(testName, isValidTimestampTitle, it2, true);
    const value = undefined;
    const result = Validator.isValidTimestamp(value);
    expect(result).toBe(false);
    Log.log(testName, isValidTimestampTitle, `${value} returns ${result}`);
    Log.it(testName, isValidTimestampTitle, it2, false);
  });

  const it3 = 'should return false for an array';
  it(it3, () => {
    Log.it(testName, isValidTimestampTitle, it3, true);
    const value = [];
    const result = Validator.isValidTimestamp(value);
    expect(result).toBe(false);
    Log.log(testName, isValidTimestampTitle, `${value} returns ${result}`);
    Log.it(testName, isValidTimestampTitle, it3, false);
  });

  const it4 = 'should return false for an object';
  it(it4, () => {
    Log.it(testName, isValidTimestampTitle, it4, true);
    const value = {};
    const result = Validator.isValidTimestamp(value);
    expect(result).toBe(false);
    Log.log(testName, isValidTimestampTitle, `${value} returns ${result}`);
    Log.it(testName, isValidTimestampTitle, it4, false);
  });

  const it5 = 'should return false for a function';
  it(it5, () => {
    Log.it(testName, isValidTimestampTitle, it5, true);
    const value = function value() {};
    const result = Validator.isValidTimestamp(value);
    expect(result).toBe(false);
    Log.log(testName, isValidTimestampTitle, `${value} returns ${result}`);
    Log.it(testName, isValidTimestampTitle, it5, false);
  });

  const it6 = 'should return false for a boolean false value';
  it(it6, () => {
    Log.it(testName, isValidTimestampTitle, it6, true);
    const value = false;
    const result = Validator.isValidTimestamp(value);
    expect(result).toBe(false);
    Log.log(testName, isValidTimestampTitle, `${value} returns ${result}`);
    Log.it(testName, isValidTimestampTitle, it6, false);
  });

  const it7 = 'should return false for a boolean true value';
  it(it7, () => {
    Log.it(testName, isValidTimestampTitle, it7, true);
    const value = true;
    const result = Validator.isValidTimestamp(value);
    expect(result).toBe(false);
    Log.log(testName, isValidTimestampTitle, `${value} returns ${result}`);
    Log.it(testName, isValidTimestampTitle, it7, false);
  });

  const it8 = 'should return false for an empty string';
  it(it8, () => {
    Log.it(testName, isValidTimestampTitle, it8, true);
    const value = '';
    const result = Validator.isValidTimestamp(value);
    expect(result).toBe(false);
    Log.log(testName, isValidTimestampTitle, `${value} returns ${result}`);
    Log.it(testName, isValidTimestampTitle, it8, false);
  });

  const it9 = 'should return false for a non-empty string';
  it(it9, () => {
    Log.it(testName, isValidTimestampTitle, it9, true);
    const value = 'hey';
    const result = Validator.isValidTimestamp(value);
    expect(result).toBe(false);
    Log.log(testName, isValidTimestampTitle, `${value} returns ${result}`);
    Log.it(testName, isValidTimestampTitle, it9, false);
  });

  const it10 = 'should return false for a string with a number';
  it(it10, () => {
    Log.it(testName, isValidTimestampTitle, it10, true);
    const value = '1';
    const result = Validator.isValidTimestamp(value);
    expect(result).toBe(false);
    Log.log(testName, isValidTimestampTitle, `${value} returns ${result}`);
    Log.it(testName, isValidTimestampTitle, it10, false);
  });

  const it11 = 'should return false for a string with a float';
  it(it11, () => {
    Log.it(testName, isValidTimestampTitle, it11, true);
    const value = '1.0';
    const result = Validator.isValidTimestamp(value);
    expect(result).toBe(false);
    Log.log(testName, isValidTimestampTitle, `${value} returns ${result}`);
    Log.it(testName, isValidTimestampTitle, it11, false);
  });

  const it12 = 'should return false for a float with decimal places';
  it(it12, () => {
    Log.it(testName, isValidTimestampTitle, it12, true);
    const value = 1.1;
    const result = Validator.isValidTimestamp(value);
    expect(result).toBe(false);
    Log.log(testName, isValidTimestampTitle, `${value} returns ${result}`);
    Log.it(testName, isValidTimestampTitle, it12, false);
  });

  const it13 = 'should return false for a negative number';
  it(it13, () => {
    Log.it(testName, isValidTimestampTitle, it13, true);
    const value = -1;
    const result = Validator.isValidTimestamp(value);
    expect(result).toBe(false);
    Log.log(testName, isValidTimestampTitle, `${value} returns ${result}`);
    Log.it(testName, isValidTimestampTitle, it13, false);
  });

  const it14 = 'should return true for the number 0';
  it(it14, () => {
    Log.it(testName, isValidTimestampTitle, it14, true);
    const value = 0;
    const result = Validator.isValidTimestamp(value);
    expect(result).toBe(true);
    Log.log(testName, isValidTimestampTitle, `${value} returns ${result}`);
    Log.it(testName, isValidTimestampTitle, it14, false);
  });

  const it15 = 'should return true for a positive number';
  it(it15, () => {
    Log.it(testName, isValidTimestampTitle, it15, true);
    const value = 1;
    const result = Validator.isValidTimestamp(value);
    expect(result).toBe(true);
    Log.log(testName, isValidTimestampTitle, `${value} returns ${result}`);
    Log.it(testName, isValidTimestampTitle, it15, false);
  });
});

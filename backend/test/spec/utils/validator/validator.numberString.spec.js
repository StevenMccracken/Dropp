const Log = require('../../../logger');
const TestConstants = require('../../../constants');
const Validator = require('../../../../src/utilities/validator');

const isValidNumberStringTitle = 'isValidNumberString()';
/* eslint-disable no-undef */
describe(isValidNumberStringTitle, () => {
  const it1 = 'should return false for a null value';
  it(it1, () => {
    Log.it(TestConstants.validator.testName, isValidNumberStringTitle, it1, true);
    const value = null;
    const result = Validator.isValidNumberString(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidNumberStringTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidNumberStringTitle, it1, false);
  });

  const it2 = 'should return false for an undefined value';
  it(it2, () => {
    Log.it(TestConstants.validator.testName, isValidNumberStringTitle, it2, true);
    const value = undefined;
    const result = Validator.isValidNumberString(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidNumberStringTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidNumberStringTitle, it2, false);
  });

  const it3 = 'should return false for an array';
  it(it3, () => {
    Log.it(TestConstants.validator.testName, isValidNumberStringTitle, it3, true);
    const value = [];
    const result = Validator.isValidNumberString(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidNumberStringTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidNumberStringTitle, it3, false);
  });

  const it4 = 'should return false for an object';
  it(it4, () => {
    Log.it(TestConstants.validator.testName, isValidNumberStringTitle, it4, true);
    const value = {};
    const result = Validator.isValidNumberString(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidNumberStringTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidNumberStringTitle, it4, false);
  });

  const it5 = 'should return false for a function';
  it(it5, () => {
    Log.it(TestConstants.validator.testName, isValidNumberStringTitle, it5, true);
    const value = function value() {};
    const result = Validator.isValidNumberString(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidNumberStringTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidNumberStringTitle, it5, false);
  });

  const it6 = 'should return false for a boolean false value';
  it(it6, () => {
    Log.it(TestConstants.validator.testName, isValidNumberStringTitle, it6, true);
    const value = false;
    const result = Validator.isValidNumberString(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidNumberStringTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidNumberStringTitle, it6, false);
  });

  const it7 = 'should return false for a boolean true value';
  it(it7, () => {
    Log.it(TestConstants.validator.testName, isValidNumberStringTitle, it7, true);
    const value = true;
    const result = Validator.isValidNumberString(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidNumberStringTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidNumberStringTitle, it7, false);
  });

  const it8 = 'should return false for an empty string';
  it(it8, () => {
    Log.it(TestConstants.validator.testName, isValidNumberStringTitle, it8, true);
    const value = TestConstants.utils.strings.emptyString;
    const result = Validator.isValidNumberString(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidNumberStringTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidNumberStringTitle, it8, false);
  });

  const it85 = 'should return false for an empty string with whitespace';
  it(it85, () => {
    Log.it(TestConstants.validator.testName, isValidNumberStringTitle, it85, true);
    const value = TestConstants.utils.strings.tab;
    const result = Validator.isValidNumberString(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidNumberStringTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidNumberStringTitle, it85, false);
  });

  const it9 = 'should return false for a non-empty string';
  it(it9, () => {
    Log.it(TestConstants.validator.testName, isValidNumberStringTitle, it9, true);
    const value = TestConstants.utils.strings.hey;
    const result = Validator.isValidNumberString(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidNumberStringTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidNumberStringTitle, it9, false);
  });

  const it12 = 'should return false for a float with decimal places';
  it(it12, () => {
    Log.it(TestConstants.validator.testName, isValidNumberStringTitle, it12, true);
    const value = 1.1;
    const result = Validator.isValidNumberString(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidNumberStringTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidNumberStringTitle, it12, false);
  });

  const it13 = 'should return false for a negative number';
  it(it13, () => {
    Log.it(TestConstants.validator.testName, isValidNumberStringTitle, it13, true);
    const value = -1;
    const result = Validator.isValidNumberString(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidNumberStringTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidNumberStringTitle, it13, false);
  });

  const it14 = 'should return false for the number 0';
  it(it14, () => {
    Log.it(TestConstants.validator.testName, isValidNumberStringTitle, it14, true);
    const value = 0;
    const result = Validator.isValidNumberString(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidNumberStringTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidNumberStringTitle, it14, false);
  });

  const it15 = 'should return false for a positive number';
  it(it15, () => {
    Log.it(TestConstants.validator.testName, isValidNumberStringTitle, it15, true);
    const value = 1;
    const result = Validator.isValidNumberString(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidNumberStringTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidNumberStringTitle, it15, false);
  });

  const it10 = 'should return true for a string with an integer';
  it(it10, () => {
    Log.it(TestConstants.validator.testName, isValidNumberStringTitle, it10, true);
    const value = TestConstants.utils.strings.stringWithInteger;
    const result = Validator.isValidNumberString(value);
    expect(result).toBe(true);
    Log.log(
      TestConstants.validator.testName,
      isValidNumberStringTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidNumberStringTitle, it10, false);
  });

  const it11 = 'should return true for a string with a float';
  it(it11, () => {
    Log.it(TestConstants.validator.testName, isValidNumberStringTitle, it11, true);
    const value = TestConstants.utils.strings.stringWithFloat;
    const result = Validator.isValidNumberString(value);
    expect(result).toBe(true);
    Log.log(
      TestConstants.validator.testName,
      isValidNumberStringTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidNumberStringTitle, it11, false);
  });
});

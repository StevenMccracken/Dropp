const Log = require('../../../logger');
const TestConstants = require('../../../constants');
const Validator = require('../../../../src/utilities/validator');

const isValidNumberTitle = 'isValidNumber()';
/* eslint-disable no-undef */
describe(isValidNumberTitle, () => {
  const it1 = 'should return false for a null value';
  it(it1, () => {
    Log.it(TestConstants.validator.testName, isValidNumberTitle, it1, true);
    const value = null;
    const result = Validator.isValidNumber(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidNumberTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidNumberTitle, it1, false);
  });

  const it2 = 'should return false for an undefined value';
  it(it2, () => {
    Log.it(TestConstants.validator.testName, isValidNumberTitle, it2, true);
    const value = undefined;
    const result = Validator.isValidNumber(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidNumberTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidNumberTitle, it2, false);
  });

  const it3 = 'should return false for an array';
  it(it3, () => {
    Log.it(TestConstants.validator.testName, isValidNumberTitle, it3, true);
    const value = [];
    const result = Validator.isValidNumber(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidNumberTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidNumberTitle, it3, false);
  });

  const it4 = 'should return false for an object';
  it(it4, () => {
    Log.it(TestConstants.validator.testName, isValidNumberTitle, it4, true);
    const value = {};
    const result = Validator.isValidNumber(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidNumberTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidNumberTitle, it4, false);
  });

  const it5 = 'should return false for a function';
  it(it5, () => {
    Log.it(TestConstants.validator.testName, isValidNumberTitle, it5, true);
    const value = function value() {};
    const result = Validator.isValidNumber(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidNumberTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidNumberTitle, it5, false);
  });

  const it6 = 'should return false for a boolean false value';
  it(it6, () => {
    Log.it(TestConstants.validator.testName, isValidNumberTitle, it6, true);
    const value = false;
    const result = Validator.isValidNumber(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidNumberTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidNumberTitle, it6, false);
  });

  const it7 = 'should return false for a boolean true value';
  it(it7, () => {
    Log.it(TestConstants.validator.testName, isValidNumberTitle, it7, true);
    const value = true;
    const result = Validator.isValidNumber(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidNumberTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidNumberTitle, it7, false);
  });

  const it8 = 'should return false for an empty string';
  it(it8, () => {
    Log.it(TestConstants.validator.testName, isValidNumberTitle, it8, true);
    const value = TestConstants.utils.strings.emptyString;
    const result = Validator.isValidNumber(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidNumberTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidNumberTitle, it8, false);
  });

  const it9 = 'should return false for a non-empty string';
  it(it9, () => {
    Log.it(TestConstants.validator.testName, isValidNumberTitle, it9, true);
    const value = TestConstants.utils.strings.hey;
    const result = Validator.isValidNumber(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidNumberTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidNumberTitle, it9, false);
  });

  const it10 = 'should return false for a string with an integer';
  it(it10, () => {
    Log.it(TestConstants.validator.testName, isValidNumberTitle, it10, true);
    const value = TestConstants.utils.strings.stringWithInteger;
    const result = Validator.isValidNumber(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidNumberTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidNumberTitle, it10, false);
  });

  const it11 = 'should return false for a string with a float';
  it(it11, () => {
    Log.it(TestConstants.validator.testName, isValidNumberTitle, it11, true);
    const value = TestConstants.utils.strings.stringWithFloat;
    const result = Validator.isValidNumber(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidNumberTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidNumberTitle, it11, false);
  });

  const it12 = 'should return false for a float with decimal places';
  it(it12, () => {
    Log.it(TestConstants.validator.testName, isValidNumberTitle, it12, true);
    const value = 1.1;
    const result = Validator.isValidNumber(value);
    expect(result).toBe(true);
    Log.log(
      TestConstants.validator.testName,
      isValidNumberTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidNumberTitle, it12, false);
  });

  const it13 = 'should return true for a negative number';
  it(it13, () => {
    Log.it(TestConstants.validator.testName, isValidNumberTitle, it13, true);
    const value = -1;
    const result = Validator.isValidNumber(value);
    expect(result).toBe(true);
    Log.log(
      TestConstants.validator.testName,
      isValidNumberTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidNumberTitle, it13, false);
  });

  const it14 = 'should return true for the number 0';
  it(it14, () => {
    Log.it(TestConstants.validator.testName, isValidNumberTitle, it14, true);
    const value = 0;
    const result = Validator.isValidNumber(value);
    expect(result).toBe(true);
    Log.log(
      TestConstants.validator.testName,
      isValidNumberTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidNumberTitle, it14, false);
  });

  const it15 = 'should return true for a positive number';
  it(it15, () => {
    Log.it(TestConstants.validator.testName, isValidNumberTitle, it15, true);
    const value = 1;
    const result = Validator.isValidNumber(value);
    expect(result).toBe(true);
    Log.log(
      TestConstants.validator.testName,
      isValidNumberTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidNumberTitle, it15, false);
  });
});

const Log = require('../../../logger');
const TestConstants = require('../../../constants');
const Validator = require('../../../../src/utilities/validator');

const isValidLocationTitle = 'isValidLocation()';
/* eslint-disable no-undef */
describe(isValidLocationTitle, () => {
  const it1 = 'should return false for a null value';
  it(it1, () => {
    Log.it(TestConstants.validator.testName, isValidLocationTitle, it1, true);
    const value = null;
    const result = Validator.isValidLocation(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidLocationTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidLocationTitle, it1, false);
  });

  const it2 = 'should return false for an undefined value';
  it(it2, () => {
    Log.it(TestConstants.validator.testName, isValidLocationTitle, it2, true);
    const value = undefined;
    const result = Validator.isValidLocation(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidLocationTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidLocationTitle, it2, false);
  });

  const it3 = 'should return false for an array';
  it(it3, () => {
    Log.it(TestConstants.validator.testName, isValidLocationTitle, it3, true);
    const value = [];
    const result = Validator.isValidLocation(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidLocationTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidLocationTitle, it3, false);
  });

  const it4 = 'should return false for an object';
  it(it4, () => {
    Log.it(TestConstants.validator.testName, isValidLocationTitle, it4, true);
    const value = {};
    const result = Validator.isValidLocation(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidLocationTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidLocationTitle, it4, false);
  });

  const it5 = 'should return false for a number';
  it(it5, () => {
    Log.it(TestConstants.validator.testName, isValidLocationTitle, it5, true);
    const value = 0;
    const result = Validator.isValidLocation(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidLocationTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidLocationTitle, it5, false);
  });

  const it6 = 'should return false for a negative number';
  it(it6, () => {
    Log.it(TestConstants.validator.testName, isValidLocationTitle, it6, true);
    const value = -1;
    const result = Validator.isValidLocation(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidLocationTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidLocationTitle, it6, false);
  });

  const it7 = 'should return false for a positive number';
  it(it7, () => {
    Log.it(TestConstants.validator.testName, isValidLocationTitle, it7, true);
    const value = 1;
    const result = Validator.isValidLocation(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidLocationTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidLocationTitle, it7, false);
  });

  const it8 = 'should return false for a function';
  it(it8, () => {
    Log.it(TestConstants.validator.testName, isValidLocationTitle, it8, true);
    const value = function value() {};
    const result = Validator.isValidLocation(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidLocationTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidLocationTitle, it8, false);
  });

  const it9 = 'should return false for a boolean false value';
  it(it9, () => {
    Log.it(TestConstants.validator.testName, isValidLocationTitle, it9, true);
    const value = false;
    const result = Validator.isValidLocation(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidLocationTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidLocationTitle, it9, false);
  });

  const it10 = 'should return false for a boolean true value';
  it(it10, () => {
    Log.it(TestConstants.validator.testName, isValidLocationTitle, it10, true);
    const value = true;
    const result = Validator.isValidLocation(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidLocationTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidLocationTitle, it10, false);
  });

  const it11 = 'should return false for an empty string';
  it(it11, () => {
    Log.it(TestConstants.validator.testName, isValidLocationTitle, it11, true);
    const value = TestConstants.utils.strings.emptyString;
    const result = Validator.isValidLocation(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidLocationTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidLocationTitle, it11, false);
  });

  const it12 = 'should return false for a non-empty string with no numbers';
  it(it12, () => {
    Log.it(TestConstants.validator.testName, isValidLocationTitle, it12, true);
    const value = TestConstants.utils.strings.hey;
    const result = Validator.isValidLocation(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidLocationTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidLocationTitle, it12, false);
  });

  const it13 = 'should return false for a string with just a comma';
  it(it13, () => {
    Log.it(TestConstants.validator.testName, isValidLocationTitle, it13, true);
    const value = ',';
    const result = Validator.isValidLocation(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidLocationTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidLocationTitle, it13, false);
  });

  const it14 = 'should return false for a string with a number and a comma';
  it(it14, () => {
    Log.it(TestConstants.validator.testName, isValidLocationTitle, it14, true);
    const value = '1,';
    const result = Validator.isValidLocation(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidLocationTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidLocationTitle, it14, false);
  });

  const it15 = 'should return false for a string with a comma and a number';
  it(it15, () => {
    Log.it(TestConstants.validator.testName, isValidLocationTitle, it15, true);
    const value = ',1';
    const result = Validator.isValidLocation(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidLocationTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidLocationTitle, it15, false);
  });

  const it16 = 'should return false for a string with a number, comma, and a string';
  it(it16, () => {
    Log.it(TestConstants.validator.testName, isValidLocationTitle, it16, true);
    const value = '1,hey';
    const result = Validator.isValidLocation(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidLocationTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidLocationTitle, it16, false);
  });

  const it17 = 'should return false for a string with a string, comma, and a number';
  it(it17, () => {
    Log.it(TestConstants.validator.testName, isValidLocationTitle, it17, true);
    const value = 'hey,1';
    const result = Validator.isValidLocation(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidLocationTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidLocationTitle, it17, false);
  });

  const it18 = 'should return true for a string with two numbers with a comma';
  it(it18, () => {
    Log.it(TestConstants.validator.testName, isValidLocationTitle, it18, true);
    const value = '1,1';
    const result = Validator.isValidLocation(value);
    expect(result).toBe(true);
    Log.log(
      TestConstants.validator.testName,
      isValidLocationTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidLocationTitle, it18, false);
  });
});

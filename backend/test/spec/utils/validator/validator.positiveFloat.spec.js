const Log = require('../../../logger');
const TestConstants = require('../../../constants');
const Validator = require('../../../../src/utilities/validator');

const isValidPositiveFloatTitle = 'isValidPositiveFloat()';
/* eslint-disable no-undef */
describe(isValidPositiveFloatTitle, () => {
  const it1 = 'should return false for a null value';
  it(it1, () => {
    Log.it(TestConstants.validator.testName, isValidPositiveFloatTitle, it1, true);
    const value = null;
    const result = Validator.isValidPositiveFloat(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidPositiveFloatTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidPositiveFloatTitle, it1, false);
  });

  const it2 = 'should return false for an undefined value';
  it(it2, () => {
    Log.it(TestConstants.validator.testName, isValidPositiveFloatTitle, it2, true);
    const value = undefined;
    const result = Validator.isValidPositiveFloat(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidPositiveFloatTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidPositiveFloatTitle, it2, false);
  });

  const it3 = 'should return false for an array';
  it(it3, () => {
    Log.it(TestConstants.validator.testName, isValidPositiveFloatTitle, it3, true);
    const value = [];
    const result = Validator.isValidPositiveFloat(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidPositiveFloatTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidPositiveFloatTitle, it3, false);
  });

  const it4 = 'should return false for an object';
  it(it4, () => {
    Log.it(TestConstants.validator.testName, isValidPositiveFloatTitle, it4, true);
    const value = {};
    const result = Validator.isValidPositiveFloat(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidPositiveFloatTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidPositiveFloatTitle, it4, false);
  });

  const it5 = 'should return false for a function';
  it(it5, () => {
    Log.it(TestConstants.validator.testName, isValidPositiveFloatTitle, it5, true);
    const value = function value() {};
    const result = Validator.isValidPositiveFloat(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidPositiveFloatTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidPositiveFloatTitle, it5, false);
  });

  const it6 = 'should return false for a boolean false value';
  it(it6, () => {
    Log.it(TestConstants.validator.testName, isValidPositiveFloatTitle, it6, true);
    const value = false;
    const result = Validator.isValidPositiveFloat(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidPositiveFloatTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidPositiveFloatTitle, it6, false);
  });

  const it7 = 'should return false for a boolean true value';
  it(it7, () => {
    Log.it(TestConstants.validator.testName, isValidPositiveFloatTitle, it7, true);
    const value = true;
    const result = Validator.isValidPositiveFloat(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidPositiveFloatTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidPositiveFloatTitle, it7, false);
  });

  const it8 = 'should return false for an empty string';
  it(it8, () => {
    Log.it(TestConstants.validator.testName, isValidPositiveFloatTitle, it8, true);
    const value = TestConstants.utils.strings.emptyString;
    const result = Validator.isValidPositiveFloat(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidPositiveFloatTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidPositiveFloatTitle, it8, false);
  });

  const it9 = 'should return false for a non-empty string';
  it(it9, () => {
    Log.it(TestConstants.validator.testName, isValidPositiveFloatTitle, it9, true);
    const value = TestConstants.utils.strings.hey;
    const result = Validator.isValidPositiveFloat(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidPositiveFloatTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidPositiveFloatTitle, it9, false);
  });

  const it10 = 'should return false for a string with an integer';
  it(it10, () => {
    Log.it(TestConstants.validator.testName, isValidPositiveFloatTitle, it10, true);
    const value = TestConstants.utils.strings.stringWithInteger;
    const result = Validator.isValidPositiveFloat(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidPositiveFloatTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidPositiveFloatTitle, it10, false);
  });

  const it11 = 'should return false for a string with a float';
  it(it11, () => {
    Log.it(TestConstants.validator.testName, isValidPositiveFloatTitle, it11, true);
    const value = TestConstants.utils.strings.stringWithFloat;
    const result = Validator.isValidPositiveFloat(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidPositiveFloatTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidPositiveFloatTitle, it11, false);
  });

  const it12 = 'should return false for a negative number';
  it(it12, () => {
    Log.it(TestConstants.validator.testName, isValidPositiveFloatTitle, it12, true);
    const value = -1;
    const result = Validator.isValidPositiveFloat(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidPositiveFloatTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidPositiveFloatTitle, it12, false);
  });

  const it13 = 'should return false for a negative float';
  it(it13, () => {
    Log.it(TestConstants.validator.testName, isValidPositiveFloatTitle, it13, true);
    const value = -0.1;
    const result = Validator.isValidPositiveFloat(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidPositiveFloatTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidPositiveFloatTitle, it13, false);
  });

  const it14 = 'should return true for a float';
  it(it14, () => {
    Log.it(TestConstants.validator.testName, isValidPositiveFloatTitle, it14, true);
    const value = 1.1;
    const result = Validator.isValidPositiveFloat(value);
    expect(result).toBe(true);
    Log.log(
      TestConstants.validator.testName,
      isValidPositiveFloatTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidPositiveFloatTitle, it14, false);
  });

  const it15 = 'should return false for the number 0';
  it(it15, () => {
    Log.it(TestConstants.validator.testName, isValidPositiveFloatTitle, it15, true);
    const value = 0;
    const result = Validator.isValidPositiveFloat(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidPositiveFloatTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidPositiveFloatTitle, it15, false);
  });

  const it16 = 'should return true for a positive number';
  it(it16, () => {
    Log.it(TestConstants.validator.testName, isValidPositiveFloatTitle, it16, true);
    const value = 0.1;
    const result = Validator.isValidPositiveFloat(value);
    expect(result).toBe(true);
    Log.log(
      TestConstants.validator.testName,
      isValidPositiveFloatTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidPositiveFloatTitle, it16, false);
  });
});

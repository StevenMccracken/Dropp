const Log = require('../../../logger');
const TestConstants = require('../../../constants');
const Constants = require('../../../../src/utilities/constants');
const Validator = require('../../../../src/utilities/validator');

const isValidBooleanStringTitle = 'isValidBooleanString()';
/* eslint-disable no-undef */
describe(isValidBooleanStringTitle, () => {
  const it1 = 'should return false for a null value';
  it(it1, () => {
    Log.it(TestConstants.validator.testName, isValidBooleanStringTitle, it1, true);
    const value = null;
    const result = Validator.isValidBooleanString(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidBooleanStringTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidBooleanStringTitle, it1, false);
  });

  const it2 = 'should return false for an undefined value';
  it(it2, () => {
    Log.it(TestConstants.validator.testName, isValidBooleanStringTitle, it2, true);
    const value = undefined;
    const result = Validator.isValidBooleanString(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidBooleanStringTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidBooleanStringTitle, it2, false);
  });

  const it3 = 'should return false for an array';
  it(it3, () => {
    Log.it(TestConstants.validator.testName, isValidBooleanStringTitle, it3, true);
    const value = [];
    const result = Validator.isValidBooleanString(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidBooleanStringTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidBooleanStringTitle, it3, false);
  });

  const it4 = 'should return false for an object';
  it(it4, () => {
    Log.it(TestConstants.validator.testName, isValidBooleanStringTitle, it4, true);
    const value = {};
    const result = Validator.isValidBooleanString(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidBooleanStringTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidBooleanStringTitle, it4, false);
  });

  const it5 = 'should return false for a function';
  it(it5, () => {
    Log.it(TestConstants.validator.testName, isValidBooleanStringTitle, it5, true);
    const value = function value() {};
    const result = Validator.isValidBooleanString(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidBooleanStringTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidBooleanStringTitle, it5, false);
  });

  const it6 = 'should return false for a boolean false value';
  it(it6, () => {
    Log.it(TestConstants.validator.testName, isValidBooleanStringTitle, it6, true);
    const value = false;
    const result = Validator.isValidBooleanString(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidBooleanStringTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidBooleanStringTitle, it6, false);
  });

  const it7 = 'should return false for a boolean true value';
  it(it7, () => {
    Log.it(TestConstants.validator.testName, isValidBooleanStringTitle, it7, true);
    const value = true;
    const result = Validator.isValidBooleanString(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidBooleanStringTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidBooleanStringTitle, it7, false);
  });

  const it8 = 'should return false for an empty string';
  it(it8, () => {
    Log.it(TestConstants.validator.testName, isValidBooleanStringTitle, it8, true);
    const value = TestConstants.utils.strings.emptyString;
    const result = Validator.isValidBooleanString(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidBooleanStringTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidBooleanStringTitle, it8, false);
  });

  const it9 = 'should return false for a string with space whitespace';
  it(it9, () => {
    Log.it(TestConstants.validator.testName, isValidBooleanStringTitle, it9, true);
    const value = TestConstants.utils.strings.paddedEmptyString;
    const result = Validator.isValidBooleanString(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidBooleanStringTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidBooleanStringTitle, it9, false);
  });

  const it10 = 'should return false for a string with tabbed whitespace';
  it(it10, () => {
    Log.it(TestConstants.validator.testName, isValidBooleanStringTitle, it10, true);
    const value = TestConstants.utils.strings.tab;
    const result = Validator.isValidBooleanString(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidBooleanStringTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidBooleanStringTitle, it10, false);
  });

  const it11 = 'should return false for a string with newline whitespace';
  it(it11, () => {
    Log.it(TestConstants.validator.testName, isValidBooleanStringTitle, it11, true);
    const value = TestConstants.utils.strings.newLine;
    const result = Validator.isValidBooleanString(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidBooleanStringTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidBooleanStringTitle, it11, false);
  });

  const it12 = 'should return false for a string with return whitespace';
  it(it12, () => {
    Log.it(TestConstants.validator.testName, isValidBooleanStringTitle, it12, true);
    const value = TestConstants.utils.strings.return;
    const result = Validator.isValidBooleanString(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidBooleanStringTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidBooleanStringTitle, it12, false);
  });

  const it13 = 'should return false for a float with decimal places';
  it(it13, () => {
    Log.it(TestConstants.validator.testName, isValidBooleanStringTitle, it13, true);
    const value = 1.1;
    const result = Validator.isValidBooleanString(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidBooleanStringTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidBooleanStringTitle, it13, false);
  });

  const it14 = 'should return false for a number';
  it(it14, () => {
    Log.it(TestConstants.validator.testName, isValidBooleanStringTitle, it14, true);
    const value = 0;
    const result = Validator.isValidBooleanString(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidBooleanStringTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidBooleanStringTitle, it14, false);
  });

  const it15 = 'should return false for a string with a number';
  it(it15, () => {
    Log.it(TestConstants.validator.testName, isValidBooleanStringTitle, it15, true);
    const value = TestConstants.utils.strings.stringWithInteger;
    const result = Validator.isValidBooleanString(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidBooleanStringTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidBooleanStringTitle, it15, false);
  });

  const it16 = 'should return false for a string with a float';
  it(it16, () => {
    Log.it(TestConstants.validator.testName, isValidBooleanStringTitle, it16, true);
    const value = TestConstants.utils.strings.stringWithFloat;
    const result = Validator.isValidBooleanString(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidBooleanStringTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidBooleanStringTitle, it16, false);
  });

  const it17 = 'should return false for a string with special characters';
  it(it17, () => {
    Log.it(TestConstants.validator.testName, isValidBooleanStringTitle, it17, true);
    const value = TestConstants.utils.strings.javascript;
    const result = Validator.isValidBooleanString(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidBooleanStringTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidBooleanStringTitle, it17, false);
  });

  const it18 = 'should return false for a string containing whitespace and text';
  it(it18, () => {
    Log.it(TestConstants.validator.testName, isValidBooleanStringTitle, it18, true);
    const value = TestConstants.utils.strings.stringWithWhitespaceAndText;
    const result = Validator.isValidBooleanString(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidBooleanStringTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidBooleanStringTitle, it18, false);
  });

  const it19 = 'should return false for a string containing symbols';
  it(it19, () => {
    Log.it(TestConstants.validator.testName, isValidBooleanStringTitle, it19, true);
    const value = TestConstants.params.invalidChars.password;
    const result = Validator.isValidBooleanString(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidBooleanStringTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidBooleanStringTitle, it19, false);
  });

  const it20 = 'should return false for a string containing emoji';
  it(it20, () => {
    Log.it(TestConstants.validator.testName, isValidBooleanStringTitle, it20, true);
    const value = TestConstants.utils.strings.emoji;
    const result = Validator.isValidBooleanString(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidBooleanStringTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidBooleanStringTitle, it20, false);
  });

  const it21 = 'should return true for a string containing a boolean true value';
  it(it21, () => {
    Log.it(TestConstants.validator.testName, isValidBooleanStringTitle, it21, true);
    const value = Constants.params.true;
    const result = Validator.isValidBooleanString(value);
    expect(result).toBe(true);
    Log.log(
      TestConstants.validator.testName,
      isValidBooleanStringTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidBooleanStringTitle, it21, false);
  });

  const it22 = 'should return true for a string containing a boolean false value';
  it(it22, () => {
    Log.it(TestConstants.validator.testName, isValidBooleanStringTitle, it22, true);
    const value = Constants.params.false;
    const result = Validator.isValidBooleanString(value);
    expect(result).toBe(true);
    Log.log(
      TestConstants.validator.testName,
      isValidBooleanStringTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidBooleanStringTitle, it22, false);
  });
});

const booleanInputValidator = 'Boolean input validator';
describe(booleanInputValidator, () => {
  const it1 = 'should return false for a null value';
  it(it1, () => {
    Log.it(TestConstants.validator.testName, booleanInputValidator, it1, true);
    const value = null;
    const result = Validator.isValidBoolean(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      booleanInputValidator,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, booleanInputValidator, it1, false);
  });

  const it2 = 'should return false for an undefined value';
  it(it2, () => {
    Log.it(TestConstants.validator.testName, booleanInputValidator, it2, true);
    const value = undefined;
    const result = Validator.isValidBoolean(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      booleanInputValidator,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, booleanInputValidator, it2, false);
  });

  const it3 = 'should return false for an array';
  it(it3, () => {
    Log.it(TestConstants.validator.testName, booleanInputValidator, it3, true);
    const value = [];
    const result = Validator.isValidBoolean(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      booleanInputValidator,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, booleanInputValidator, it3, false);
  });

  const it4 = 'should return false for an object';
  it(it4, () => {
    Log.it(TestConstants.validator.testName, booleanInputValidator, it4, true);
    const value = {};
    const result = Validator.isValidBoolean(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      booleanInputValidator,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, booleanInputValidator, it4, false);
  });

  const it5 = 'should return false for a function';
  it(it5, () => {
    Log.it(TestConstants.validator.testName, booleanInputValidator, it5, true);
    const value = function value() {};
    const result = Validator.isValidBoolean(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      booleanInputValidator,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, booleanInputValidator, it5, false);
  });

  const it6 = 'should return false for an empty string';
  it(it6, () => {
    Log.it(TestConstants.validator.testName, booleanInputValidator, it6, true);
    const value = TestConstants.utils.strings.emptyString;
    const result = Validator.isValidBoolean(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      booleanInputValidator,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, booleanInputValidator, it6, false);
  });

  const it7 = 'should return false for a string with space whitespace';
  it(it7, () => {
    Log.it(TestConstants.validator.testName, booleanInputValidator, it7, true);
    const value = TestConstants.utils.strings.paddedEmptyString;
    const result = Validator.isValidBoolean(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      booleanInputValidator,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, booleanInputValidator, it7, false);
  });

  const it8 = 'should return false for a string with tabbed whitespace';
  it(it8, () => {
    Log.it(TestConstants.validator.testName, booleanInputValidator, it8, true);
    const value = TestConstants.utils.strings.tab;
    const result = Validator.isValidBoolean(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      booleanInputValidator,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, booleanInputValidator, it8, false);
  });

  const it9 = 'should return false for a string with newline whitespace';
  it(it9, () => {
    Log.it(TestConstants.validator.testName, booleanInputValidator, it9, true);
    const value = TestConstants.utils.strings.newLine;
    const result = Validator.isValidBoolean(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      booleanInputValidator,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, booleanInputValidator, it9, false);
  });

  const it10 = 'should return false for a string with return whitespace';
  it(it10, () => {
    Log.it(TestConstants.validator.testName, booleanInputValidator, it10, true);
    const value = TestConstants.utils.strings.return;
    const result = Validator.isValidBoolean(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      booleanInputValidator,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, booleanInputValidator, it10, false);
  });

  const it11 = 'should return false for a float with decimal places';
  it(it11, () => {
    Log.it(TestConstants.validator.testName, booleanInputValidator, it11, true);
    const value = 1.1;
    const result = Validator.isValidBoolean(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      booleanInputValidator,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, booleanInputValidator, it11, false);
  });

  const it12 = 'should return false for a number';
  it(it12, () => {
    Log.it(TestConstants.validator.testName, booleanInputValidator, it12, true);
    const value = 0;
    const result = Validator.isValidBoolean(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      booleanInputValidator,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, booleanInputValidator, it12, false);
  });

  const it13 = 'should return false for a string with a number';
  it(it13, () => {
    Log.it(TestConstants.validator.testName, booleanInputValidator, it13, true);
    const value = TestConstants.utils.strings.stringWithInteger;
    const result = Validator.isValidBoolean(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      booleanInputValidator,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, booleanInputValidator, it13, false);
  });

  const it14 = 'should return false for a string with a float';
  it(it14, () => {
    Log.it(TestConstants.validator.testName, booleanInputValidator, it14, true);
    const value = TestConstants.utils.strings.stringWithFloat;
    const result = Validator.isValidBoolean(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      booleanInputValidator,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, booleanInputValidator, it14, false);
  });

  const it15 = 'should return false for a string with special characters';
  it(it15, () => {
    Log.it(TestConstants.validator.testName, booleanInputValidator, it15, true);
    const value = TestConstants.utils.strings.javascript;
    const result = Validator.isValidBoolean(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      booleanInputValidator,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, booleanInputValidator, it15, false);
  });

  const it16 = 'should return false for a string containing whitespace and text';
  it(it16, () => {
    Log.it(TestConstants.validator.testName, booleanInputValidator, it16, true);
    const value = TestConstants.utils.strings.stringWithWhitespaceAndText;
    const result = Validator.isValidBoolean(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      booleanInputValidator,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, booleanInputValidator, it16, false);
  });

  const it17 = 'should return false for a string containing symbols';
  it(it17, () => {
    Log.it(TestConstants.validator.testName, booleanInputValidator, it17, true);
    const value = TestConstants.params.invalidChars.password;
    const result = Validator.isValidBoolean(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      booleanInputValidator,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, booleanInputValidator, it17, false);
  });

  const it18 = 'should return false for a string containing emoji';
  it(it18, () => {
    Log.it(TestConstants.validator.testName, booleanInputValidator, it18, true);
    const value = TestConstants.utils.strings.emoji;
    const result = Validator.isValidBoolean(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      booleanInputValidator,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, booleanInputValidator, it18, false);
  });

  const it19 = 'should return true for a boolean false value';
  it(it19, () => {
    Log.it(TestConstants.validator.testName, booleanInputValidator, it19, true);
    const value = false;
    const result = Validator.isValidBoolean(value);
    expect(result).toBe(true);
    Log.log(
      TestConstants.validator.testName,
      booleanInputValidator,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, booleanInputValidator, it19, false);
  });

  const it20 = 'should return true for a boolean true value';
  it(it20, () => {
    Log.it(TestConstants.validator.testName, booleanInputValidator, it20, true);
    const value = true;
    const result = Validator.isValidBoolean(value);
    expect(result).toBe(true);
    Log.log(
      TestConstants.validator.testName,
      booleanInputValidator,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, booleanInputValidator, it20, false);
  });
});

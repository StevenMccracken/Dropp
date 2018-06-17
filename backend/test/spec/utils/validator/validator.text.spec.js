const Log = require('../../../logger');
const TestConstants = require('../../../constants');
const Validator = require('../../../../src/utilities/validator');

const isValidTextPostTitle = 'isValidTextPost()';
/* eslint-disable no-undef */
describe(isValidTextPostTitle, () => {
  const it1 = 'should return false for a null value';
  it(it1, () => {
    Log.it(TestConstants.validator.testName, isValidTextPostTitle, it1, true);
    const value = null;
    const result = Validator.isValidTextPost(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidTextPostTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidTextPostTitle, it1, false);
  });

  const it2 = 'should return false for an undefined value';
  it(it2, () => {
    Log.it(TestConstants.validator.testName, isValidTextPostTitle, it2, true);
    const value = undefined;
    const result = Validator.isValidTextPost(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidTextPostTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidTextPostTitle, it2, false);
  });

  const it3 = 'should return false for an array';
  it(it3, () => {
    Log.it(TestConstants.validator.testName, isValidTextPostTitle, it3, true);
    const value = [];
    const result = Validator.isValidTextPost(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidTextPostTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidTextPostTitle, it3, false);
  });

  const it4 = 'should return false for an object';
  it(it4, () => {
    Log.it(TestConstants.validator.testName, isValidTextPostTitle, it4, true);
    const value = {};
    const result = Validator.isValidTextPost(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidTextPostTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidTextPostTitle, it4, false);
  });

  const it5 = 'should return false for a function';
  it(it5, () => {
    Log.it(TestConstants.validator.testName, isValidTextPostTitle, it5, true);
    const value = function value() {};
    const result = Validator.isValidTextPost(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidTextPostTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidTextPostTitle, it5, false);
  });

  const it6 = 'should return false for a boolean false value';
  it(it6, () => {
    Log.it(TestConstants.validator.testName, isValidTextPostTitle, it6, true);
    const value = false;
    const result = Validator.isValidTextPost(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidTextPostTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidTextPostTitle, it6, false);
  });

  const it7 = 'should return false for a boolean true value';
  it(it7, () => {
    Log.it(TestConstants.validator.testName, isValidTextPostTitle, it7, true);
    const value = true;
    const result = Validator.isValidTextPost(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidTextPostTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidTextPostTitle, it7, false);
  });

  const it8 = 'should return true for an empty string';
  it(it8, () => {
    Log.it(TestConstants.validator.testName, isValidTextPostTitle, it8, true);
    const value = TestConstants.utils.strings.emptyString;
    const result = Validator.isValidTextPost(value);
    expect(result).toBe(true);
    Log.log(
      TestConstants.validator.testName,
      isValidTextPostTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidTextPostTitle, it8, false);
  });

  const it9 = 'should return true for a string with space whitespace';
  it(it9, () => {
    Log.it(TestConstants.validator.testName, isValidTextPostTitle, it9, true);
    const value = TestConstants.utils.strings.paddedEmptyString;
    const result = Validator.isValidTextPost(value);
    expect(result).toBe(true);
    Log.log(
      TestConstants.validator.testName,
      isValidTextPostTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidTextPostTitle, it9, false);
  });

  const it10 = 'should return true for a string with tabbed whitespace';
  it(it10, () => {
    Log.it(TestConstants.validator.testName, isValidTextPostTitle, it10, true);
    const value = TestConstants.utils.strings.tab;
    const result = Validator.isValidTextPost(value);
    expect(result).toBe(true);
    Log.log(
      TestConstants.validator.testName,
      isValidTextPostTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidTextPostTitle, it10, false);
  });

  const it11 = 'should return true for a string with newline whitespace';
  it(it11, () => {
    Log.it(TestConstants.validator.testName, isValidTextPostTitle, it11, true);
    const value = TestConstants.utils.strings.newLine;
    const result = Validator.isValidTextPost(value);
    expect(result).toBe(true);
    Log.log(
      TestConstants.validator.testName,
      isValidTextPostTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidTextPostTitle, it11, false);
  });

  const it12 = 'should return true for a string with return whitespace';
  it(it12, () => {
    Log.it(TestConstants.validator.testName, isValidTextPostTitle, it12, true);
    const value = TestConstants.utils.strings.return;
    const result = Validator.isValidTextPost(value);
    expect(result).toBe(true);
    Log.log(
      TestConstants.validator.testName,
      isValidTextPostTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidTextPostTitle, it12, false);
  });

  const it13 = 'should return false for a float with decimal places';
  it(it13, () => {
    Log.it(TestConstants.validator.testName, isValidTextPostTitle, it13, true);
    const value = 1.1;
    const result = Validator.isValidTextPost(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidTextPostTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidTextPostTitle, it13, false);
  });

  const it14 = 'should return false for a number';
  it(it14, () => {
    Log.it(TestConstants.validator.testName, isValidTextPostTitle, it14, true);
    const value = 0;
    const result = Validator.isValidTextPost(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidTextPostTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidTextPostTitle, it14, false);
  });

  const it15 = 'should return true for a string with a number';
  it(it15, () => {
    Log.it(TestConstants.validator.testName, isValidTextPostTitle, it15, true);
    const value = TestConstants.utils.strings.stringWithInteger;
    const result = Validator.isValidTextPost(value);
    expect(result).toBe(true);
    Log.log(
      TestConstants.validator.testName,
      isValidTextPostTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidTextPostTitle, it15, false);
  });

  const it16 = 'should return true for a string with a float';
  it(it16, () => {
    Log.it(TestConstants.validator.testName, isValidTextPostTitle, it16, true);
    const value = TestConstants.utils.strings.stringWithFloat;
    const result = Validator.isValidTextPost(value);
    expect(result).toBe(true);
    Log.log(
      TestConstants.validator.testName,
      isValidTextPostTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidTextPostTitle, it16, false);
  });

  const it17 = 'should return true for a string with special characters';
  it(it17, () => {
    Log.it(TestConstants.validator.testName, isValidTextPostTitle, it17, true);
    const value = TestConstants.utils.strings.javascript;
    const result = Validator.isValidTextPost(value);
    expect(result).toBe(true);
    Log.log(
      TestConstants.validator.testName,
      isValidTextPostTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidTextPostTitle, it17, false);
  });

  const it18 = 'should return true for a string containing whitespace and text';
  it(it18, () => {
    Log.it(TestConstants.validator.testName, isValidTextPostTitle, it18, true);
    const value = TestConstants.utils.strings.stringWithWhitespaceAndText;
    const result = Validator.isValidTextPost(value);
    expect(result).toBe(true);
    Log.log(
      TestConstants.validator.testName,
      isValidTextPostTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidTextPostTitle, it18, false);
  });

  const it19 = 'should return true for a string containing symbols';
  it(it19, () => {
    Log.it(TestConstants.validator.testName, isValidTextPostTitle, it19, true);
    const value = TestConstants.params.invalidChars.password;
    const result = Validator.isValidTextPost(value);
    expect(result).toBe(true);
    Log.log(
      TestConstants.validator.testName,
      isValidTextPostTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidTextPostTitle, it19, false);
  });

  const it20 = 'should return true for a string containing periods';
  it(it20, () => {
    Log.it(TestConstants.validator.testName, isValidTextPostTitle, it20, true);
    const value = 'h.';
    const result = Validator.isValidTextPost(value);
    expect(result).toBe(true);
    Log.log(
      TestConstants.validator.testName,
      isValidTextPostTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidTextPostTitle, it20, false);
  });

  const it21 = 'should return true for a string containing regular characters';
  it(it21, () => {
    Log.it(TestConstants.validator.testName, isValidTextPostTitle, it21, true);
    const value = 'he';
    const result = Validator.isValidTextPost(value);
    expect(result).toBe(true);
    Log.log(
      TestConstants.validator.testName,
      isValidTextPostTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidTextPostTitle, it21, false);
  });

  const it22 = 'should return true for a string containing emoji';
  it(it22, () => {
    Log.it(TestConstants.validator.testName, isValidTextPostTitle, it22, true);
    const value = TestConstants.utils.strings.emoji;
    const result = Validator.isValidTextPost(value);
    expect(result).toBe(true);
    Log.log(
      TestConstants.validator.testName,
      isValidTextPostTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidTextPostTitle, it22, false);
  });
});

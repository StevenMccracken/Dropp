const Log = require('../../../logger');
const TestConstants = require('../../../constants');
const Validator = require('../../../../src/utilities/validator');

const isValidEmailTitle = 'isValidEmail()';
/* eslint-disable no-undef */
describe(isValidEmailTitle, () => {
  const it1 = 'should return false for a null value';
  it(it1, () => {
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it1, true);
    const value = null;
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidEmailTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it1, false);
  });

  const it2 = 'should return false for an undefined value';
  it(it2, () => {
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it2, true);
    const value = undefined;
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidEmailTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it2, false);
  });

  const it3 = 'should return false for an array';
  it(it3, () => {
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it3, true);
    const value = [];
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidEmailTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it3, false);
  });

  const it4 = 'should return false for an object';
  it(it4, () => {
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it4, true);
    const value = {};
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidEmailTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it4, false);
  });

  const it5 = 'should return false for a function';
  it(it5, () => {
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it5, true);
    const value = function value() {};
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidEmailTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it5, false);
  });

  const it6 = 'should return false for a boolean false value';
  it(it6, () => {
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it6, true);
    const value = false;
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidEmailTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it6, false);
  });

  const it7 = 'should return false for a boolean true value';
  it(it7, () => {
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it7, true);
    const value = true;
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidEmailTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it7, false);
  });

  const it8 = 'should return false for an empty string';
  it(it8, () => {
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it8, true);
    const value = TestConstants.utils.strings.emptyString;
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidEmailTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it8, false);
  });

  const it9 = 'should return false for a string with space whitespace';
  it(it9, () => {
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it9, true);
    const value = TestConstants.utils.strings.paddedEmptyString;
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidEmailTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it9, false);
  });

  const it10 = 'should return false for a string with tabbed whitespace';
  it(it10, () => {
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it10, true);
    const value = TestConstants.utils.strings.tab;
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidEmailTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it10, false);
  });

  const it11 = 'should return false for a string with newline whitespace';
  it(it11, () => {
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it11, true);
    const value = TestConstants.utils.strings.newLine;
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidEmailTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it11, false);
  });

  const it12 = 'should return false for a string with return whitespace';
  it(it12, () => {
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it12, true);
    const value = TestConstants.utils.strings.return;
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidEmailTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it12, false);
  });

  const it13 = 'should return false for a string with Javascript code';
  it(it13, () => {
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it13, true);
    const value = TestConstants.utils.strings.javascript;
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidEmailTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it13, false);
  });

  const it14 = 'should return false for a float with decimal places';
  it(it14, () => {
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it14, true);
    const value = 1.1;
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidEmailTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it14, false);
  });

  const it15 = 'should return false for a number';
  it(it15, () => {
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it15, true);
    const value = 0;
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidEmailTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it15, false);
  });

  const it16 = 'should return false for a string with one character';
  it(it16, () => {
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it16, true);
    const value = TestConstants.utils.strings.stringWithInteger;
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidEmailTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it16, false);
  });

  const it17 = 'should return false for a string with starting whitespace, and then word characters';
  it(it17, () => {
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it17, true);
    const value = TestConstants.utils.strings.stringWithWhitespaceAndText;
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidEmailTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it17, false);
  });

  const it18 = 'should return false for a string with a non-word character';
  it(it18, () => {
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it18, true);
    const value = TestConstants.params.invalidChars.password;
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidEmailTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it18, false);
  });

  const it19 = 'should return false for a string with a period in the first two characters';
  it(it19, () => {
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it19, true);
    const value = 'h.';
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidEmailTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it19, false);
  });

  const it20 = 'should return false for a string with a period after the first two characters';
  it(it20, () => {
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it20, true);
    const value = '__.';
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidEmailTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it20, false);
  });

  const it21 = 'should return false for a string with a dash after the first two characters';
  it(it21, () => {
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it21, true);
    const value = '__-';
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidEmailTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it21, false);
  });

  const it22 = 'should return false for a malformed email address';
  it(it22, () => {
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it22, true);
    const value = 'first.last@sub.do,com';
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidEmailTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it22, false);
  });

  const it23 = 'should return false for a malformed email address';
  it(it23, () => {
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it23, true);
    /* eslint-disable no-useless-escape */
    const value = 'first\@last@iana.org';
    /* eslint-enable no-useless-escape */
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidEmailTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it23, false);
  });

  const it24 = 'should return false for a malformed email address';
  it(it24, () => {
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it24, true);
    const value = '"""@iana.org';
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidEmailTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it24, false);
  });

  const it25 = 'should return false for a malformed email address';
  it(it25, () => {
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it25, true);
    const value = 'first.last@[IPv6:1111:2222:3333:4444:5555:12.34.56.78]';
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidEmailTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it25, false);
  });

  const it26 = 'should return false for a malformed email address';
  it(it26, () => {
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it26, true);
    const value = 'first.last@-xample.com';
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidEmailTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it26, false);
  });

  const it27 = 'should return false for a malformed email address';
  it(it27, () => {
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it27, true);
    const value = '@iana.org';
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidEmailTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it27, false);
  });

  const it28 = 'should return false for a malformed email address';
  it(it28, () => {
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it28, true);
    const value = 'gatsby@f.sc.ot.t.f.i.tzg.era.l.d.';
    const result = Validator.isValidEmail(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidEmailTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it28, false);
  });

  const it29 = 'should return true for a valid email address';
  it(it29, () => {
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it29, true);
    const value = '12345678901234567890123456789012345678901234567890123456789012345@iana.org';
    const result = Validator.isValidEmail(value);
    expect(result).toBe(true);
    Log.log(
      TestConstants.validator.testName,
      isValidEmailTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it29, false);
  });

  const it30 = 'should return true for a valid email address';
  it(it30, () => {
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it30, true);
    const value = '123456789012345678901234567890123456789012345678901234567890@12345678901234567890123456789012345678901234567890123456789.12345678901234567890123456789012345678901234567890123456789.12345678901234567890123456789012345678901234567890123456789.12345.iana.org';
    const result = Validator.isValidEmail(value);
    expect(result).toBe(true);
    Log.log(
      TestConstants.validator.testName,
      isValidEmailTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it30, false);
  });

  const it31 = 'should return true for a valid email address';
  it(it31, () => {
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it31, true);
    const value = TestConstants.params.testEmail;
    const result = Validator.isValidEmail(value);
    expect(result).toBe(true);
    Log.log(
      TestConstants.validator.testName,
      isValidEmailTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it31, false);
  });

  const it33 = 'should return true for a valid email address';
  it(it33, () => {
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it33, true);
    const value = 'test@test.co';
    const result = Validator.isValidEmail(value);
    expect(result).toBe(true);
    Log.log(
      TestConstants.validator.testName,
      isValidEmailTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it33, false);
  });

  const it34 = 'should return true and not infinitely recurse for an email address with 2 UUIDs';
  it(it34, () => {
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it34, true);
    const value = '89022932-6bf8-4639-a42e-7ef3c182a719@89022932-6bf8-4639-a42e-7ef3c182a719.com';
    const result = Validator.isValidEmail(value);
    expect(result).toBe(true);
    Log.log(
      TestConstants.validator.testName,
      isValidEmailTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidEmailTitle, it34, false);
  });
});

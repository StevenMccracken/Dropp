const Log = require('../../../logger');
const TestConstants = require('../../../constants');
const Constants = require('../../../../src/utilities/constants');
const Validator = require('../../../../src/utilities/validator');

const isValidBase64MediaTitle = 'isValidBase64Media()';
/* eslint-disable no-undef */
describe(isValidBase64MediaTitle, () => {
  const it1 = 'should return false for a non-string value';
  it(it1, () => {
    Log.it(TestConstants.validator.testName, isValidBase64MediaTitle, it1, true);
    const value = null;
    const result = Validator.isValidBase64Media(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidBase64MediaTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidBase64MediaTitle, it1, false);
  });

  const it2 = 'should return false for a string less than 13 characters long';
  it(it2, () => {
    Log.it(TestConstants.validator.testName, isValidBase64MediaTitle, it2, true);
    const value = TestConstants.params.test;
    const result = Validator.isValidBase64Media(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidBase64MediaTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidBase64MediaTitle, it2, false);
  });

  const it3 = 'should return false for a non base64 media string';
  it(it3, () => {
    Log.it(TestConstants.validator.testName, isValidBase64MediaTitle, it3, true);
    const value = TestConstants.media.base64DataTypes.random;
    const result = Validator.isValidBase64Media(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidBase64MediaTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidBase64MediaTitle, it3, false);
  });

  const it4 = 'should return true for a PNG base64 media string';
  it(it4, () => {
    Log.it(TestConstants.validator.testName, isValidBase64MediaTitle, it4, true);
    const value = Constants.media.base64DataTypes.png;
    const result = Validator.isValidBase64Media(value);
    expect(result).toBe(true);
    Log.log(
      TestConstants.validator.testName,
      isValidBase64MediaTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidBase64MediaTitle, it4, false);
  });

  const it5 = 'should return true for a JPG base64 media string';
  it(it5, () => {
    Log.it(TestConstants.validator.testName, isValidBase64MediaTitle, it5, true);
    const value = Constants.media.base64DataTypes.jpg;
    const result = Validator.isValidBase64Media(value);
    expect(result).toBe(true);
    Log.log(
      TestConstants.validator.testName,
      isValidBase64MediaTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidBase64MediaTitle, it5, false);
  });
});

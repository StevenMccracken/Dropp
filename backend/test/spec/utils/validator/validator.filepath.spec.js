const Log = require('../../../logger');
const TestConstants = require('../../../constants');
const Utils = require('../../../../src/utilities/utils');
const Validator = require('../../../../src/utilities/validator');

const isValidFilePathTitle = 'isValidFilePath()';
/* eslint-disable no-undef */
describe(isValidFilePathTitle, () => {
  const it1 = 'should return false for a null value';
  it(it1, async (done) => {
    Log.it(TestConstants.validator.testName, isValidFilePathTitle, it1, true);
    const value = null;
    const result = await Validator.isValidFilePath(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidFilePathTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidFilePathTitle, it1, false);
    done();
  });

  const it2 = 'should return false for an undefined value';
  it(it2, async (done) => {
    Log.it(TestConstants.validator.testName, isValidFilePathTitle, it2, true);
    const value = undefined;
    const result = await Validator.isValidFilePath(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidFilePathTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidFilePathTitle, it2, false);
    done();
  });

  const it3 = 'should return false for a boolean value';
  it(it3, async (done) => {
    Log.it(TestConstants.validator.testName, isValidFilePathTitle, it3, true);
    const value = true;
    const result = await Validator.isValidFilePath(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidFilePathTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidFilePathTitle, it3, false);
    done();
  });

  const it4 = 'should return false for an array value';
  it(it4, async (done) => {
    Log.it(TestConstants.validator.testName, isValidFilePathTitle, it4, true);
    const value = true;
    const result = await Validator.isValidFilePath([]);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidFilePathTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidFilePathTitle, it4, false);
    done();
  });

  const it5 = 'should return false for an empty string value';
  it(it5, async (done) => {
    Log.it(TestConstants.validator.testName, isValidFilePathTitle, it5, true);
    const value = TestConstants.utils.strings.emptyString;
    const result = await Validator.isValidFilePath(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidFilePathTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidFilePathTitle, it5, false);
    done();
  });

  const it6 = 'should return false for a non-existent file path';
  it(it6, async (done) => {
    Log.it(TestConstants.validator.testName, isValidFilePathTitle, it6, true);
    const value = Utils.newUuid();
    const result = await Validator.isValidFilePath(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidFilePathTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidFilePathTitle, it6, false);
    done();
  });

  const it7 = 'should return false for a folder file path';
  it(it7, async (done) => {
    Log.it(TestConstants.validator.testName, isValidFilePathTitle, it7, true);
    const value = process.cwd();
    const result = await Validator.isValidFilePath(value);
    expect(result).toBe(false);
    Log.log(
      TestConstants.validator.testName,
      isValidFilePathTitle,
      TestConstants.validator.returns(value, result)
    );
    Log.it(TestConstants.validator.testName, isValidFilePathTitle, it7, false);
    done();
  });
});

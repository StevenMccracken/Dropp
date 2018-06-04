const Log = require('../../../logger');
const Utils = require('../../../../src/utilities/utils');
const Validator = require('../../../../src/utilities/validator');

const testName = 'Validator Module';
const isValidFilePathTitle = 'isValidFilePath()';
/* eslint-disable no-undef */
describe(isValidFilePathTitle, () => {
  it('should return false for a null value', async (done) => {
    const value = null;
    const result = await Validator.isValidFilePath(value);
    expect(result).toBe(false);
    Log(testName, isValidFilePathTitle, `${value} returns ${result}`);
    done();
  });

  it('should return false for an undefined value', async (done) => {
    const value = undefined;
    const result = await Validator.isValidFilePath(value);
    expect(result).toBe(false);
    Log(testName, isValidFilePathTitle, `${value} returns ${result}`);
    done();
  });

  it('should return false for a boolean value', async (done) => {
    const value = true;
    const result = await Validator.isValidFilePath(value);
    expect(result).toBe(false);
    Log(testName, isValidFilePathTitle, `${value} returns ${result}`);
    done();
  });

  it('should return false for an array value', async (done) => {
    const value = true;
    const result = await Validator.isValidFilePath([]);
    expect(result).toBe(false);
    Log(testName, isValidFilePathTitle, `${value} returns ${result}`);
    done();
  });

  it('should return false for an empty string value', async (done) => {
    const value = true;
    const result = await Validator.isValidFilePath('');
    expect(result).toBe(false);
    Log(testName, isValidFilePathTitle, `${value} returns ${result}`);
    done();
  });

  it('should return false for a non-existent file path', async (done) => {
    const value = true;
    const result = await Validator.isValidFilePath(Utils.newUuid());
    expect(result).toBe(false);
    Log(testName, isValidFilePathTitle, `${value} returns ${result}`);
    done();
  });

  it('should return false for a folder file path', async (done) => {
    const value = true;
    const result = await Validator.isValidFilePath(process.cwd());
    expect(result).toBe(false);
    Log(testName, isValidFilePathTitle, `${value} returns ${result}`);
    done();
  });
});

const Log = require('../../logger');
const TestConstants = require('../../constants');
const Media = require('../../../src/media/media');
const Utils = require('../../../src/utilities/utils');
const Constants = require('../../../src/utilities/constants');

/* eslint-disable no-undef */
describe(TestConstants.media.testName, () => {
  const determineMimeTypeTitle = 'determineMimeType function';
  describe(determineMimeTypeTitle, () => {
    const it1 = 'returns an empty string for an undefined argument';
    it(it1, async (done) => {
      Log.it(TestConstants.media.testName, determineMimeTypeTitle, it1, true);
      const result = await Media.determineMimeType();
      expect(result).toBe(TestConstants.utils.strings.emptyString);
      Log.log(TestConstants.media.testName, determineMimeTypeTitle, result);
      Log.it(TestConstants.media.testName, determineMimeTypeTitle, it1, false);
      done();
    });

    const it2 = 'returns an empty string for a null argument';
    it(it2, async (done) => {
      Log.it(TestConstants.media.testName, determineMimeTypeTitle, it2, true);
      const result = await Media.determineMimeType(null);
      expect(result).toBe(TestConstants.utils.strings.emptyString);
      Log.log(TestConstants.media.testName, determineMimeTypeTitle, result);
      Log.it(TestConstants.media.testName, determineMimeTypeTitle, it2, false);
      done();
    });

    const it3 = 'returns an empty string for an empty string argument';
    it(it3, async (done) => {
      Log.it(TestConstants.media.testName, determineMimeTypeTitle, it3, true);
      const result = await Media.determineMimeType(TestConstants.utils.strings.emptyString);
      expect(result).toBe(TestConstants.utils.strings.emptyString);
      Log.log(TestConstants.media.testName, determineMimeTypeTitle, result);
      Log.it(TestConstants.media.testName, determineMimeTypeTitle, it3, false);
      done();
    });

    const it4 = 'returns an empty string for a non-existent file';
    it(it4, async (done) => {
      Log.it(TestConstants.media.testName, determineMimeTypeTitle, it4, true);
      const result = await Media.determineMimeType(Utils.newUuid());
      expect(result).toBe(TestConstants.utils.strings.emptyString);
      Log.log(TestConstants.media.testName, determineMimeTypeTitle, result);
      Log.it(TestConstants.media.testName, determineMimeTypeTitle, it4, false);
      done();
    });

    const it5 = 'returns directory for a folder';
    it(it5, async (done) => {
      Log.it(TestConstants.media.testName, determineMimeTypeTitle, it5, true);
      const result = await Media.determineMimeType(process.cwd());
      expect(result).toBe(TestConstants.media.mimeTypes.directory);
      Log.log(TestConstants.media.testName, determineMimeTypeTitle, result);
      Log.it(TestConstants.media.testName, determineMimeTypeTitle, it5, false);
      done();
    });
  });

  const encodeToBase64Title = 'encodeToBase64 function';
  const it1 = 'returns an empty string for a non-buffer data argument';
  it(it1, () => {
    Log.it(TestConstants.media.testName, encodeToBase64Title, it1, true);
    const result = Media.encodeToBase64();
    expect(result.mimeType).toBe(TestConstants.utils.strings.emptyString);
    expect(result.base64Data).toBe(TestConstants.utils.strings.emptyString);
    Log.it(TestConstants.media.testName, encodeToBase64Title, it1, false);
    Log.log(TestConstants.media.testName, encodeToBase64Title, result);
  });

  const it2 = 'returns an empty string for an empty buffer';
  it(it2, () => {
    Log.it(TestConstants.media.testName, encodeToBase64Title, it2, true);
    const buffer = Buffer.from(TestConstants.utils.strings.emptyString);
    const result = Media.encodeToBase64(buffer);
    expect(result.mimeType).toBe(Constants.media.mimeTypes.unknown);
    expect(result.base64Data).toBe(TestConstants.utils.strings.emptyString);
    Log.it(TestConstants.media.testName, encodeToBase64Title, it2, false);
    Log.log(TestConstants.media.testName, encodeToBase64Title, result);
  });

  const it3 = 'returns unknown for short data';
  it(it3, () => {
    Log.it(TestConstants.media.testName, encodeToBase64Title, it3, true);
    const buffer = Buffer.from(TestConstants.params.test);
    const result = Media.encodeToBase64(buffer);
    expect(result.mimeType).toBe(Constants.media.mimeTypes.unknown);
    expect(result.base64Data).toBe(TestConstants.media.base64DataTypes.test);
    Log.it(TestConstants.media.testName, encodeToBase64Title, it3, false);
    Log.log(TestConstants.media.testName, encodeToBase64Title, result);
  });

  const it4 = 'returns unknown for non-png/non-jpg data';
  it(it4, () => {
    Log.it(TestConstants.media.testName, encodeToBase64Title, it4, true);
    const buffer = Buffer.from(TestConstants.media.hexData.random, TestConstants.media.hex);
    const result = Media.encodeToBase64(buffer);
    expect(result.mimeType).toBe(Constants.media.mimeTypes.unknown);
    expect(result.base64Data).toBe(TestConstants.media.base64DataTypes.random);
    Log.it(TestConstants.media.testName, encodeToBase64Title, it4, false);
    Log.log(TestConstants.media.testName, encodeToBase64Title, result);
  });

  const it5 = 'returns unknown for non-png/non-jpg data';
  it(it5, () => {
    Log.it(TestConstants.media.testName, encodeToBase64Title, it5, true);
    const buffer = Buffer.from(TestConstants.params.test);
    const result = Media.encodeToBase64(buffer);
    expect(result.mimeType).toBe(Constants.media.mimeTypes.unknown);
    expect(result.base64Data).toBe(TestConstants.media.base64DataTypes.test);
    Log.it(TestConstants.media.testName, encodeToBase64Title, it5, false);
    Log.log(TestConstants.media.testName, encodeToBase64Title, result);
  });

  const it6 = 'returns image/png for png data';
  it(it6, () => {
    Log.it(TestConstants.media.testName, encodeToBase64Title, it6, true);
    const buffer = Buffer.from(TestConstants.media.hexData.png, TestConstants.media.hex);
    const result = Media.encodeToBase64(buffer);
    expect(result.mimeType).toBe(Constants.media.mimeTypes.png);
    expect(result.base64Data)
      .toBe(`${Constants.media.base64DataTypes.png}${TestConstants.media.doubleEquals}`);
    Log.it(TestConstants.media.testName, encodeToBase64Title, it6, false);
    Log.log(TestConstants.media.testName, encodeToBase64Title, result);
  });

  const it7 = 'returns image/jpeg for jpg data';
  it(it7, () => {
    Log.it(TestConstants.media.testName, encodeToBase64Title, it7, true);
    const buffer = Buffer.from(TestConstants.media.hexData.jpg, TestConstants.media.hex);
    const result = Media.encodeToBase64(buffer);
    expect(result.mimeType).toBe(Constants.media.mimeTypes.jpeg);
    expect(result.base64Data)
      .toBe(`${Constants.media.base64DataTypes.jpg}${TestConstants.media.doubleEquals}`);
    Log.it(TestConstants.media.testName, encodeToBase64Title, it7, false);
    Log.log(TestConstants.media.testName, encodeToBase64Title, result);
  });
});

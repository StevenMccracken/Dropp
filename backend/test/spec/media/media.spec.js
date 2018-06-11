const Log = require('../../logger');
const Media = require('../../../src/media/media');
const Utils = require('../../../src/utilities/utils');

const testName = 'Media';
/* eslint-disable no-undef */
describe(testName, () => {
  const determineMimeTypeTitle = 'determineMimeType function';
  describe(determineMimeTypeTitle, () => {
    const it1 = 'returns an empty string for an undefined argument';
    it(it1, async (done) => {
      Log.it(testName, determineMimeTypeTitle, it1, true);
      const result = await Media.determineMimeType();
      expect(result).toBe('');
      Log.log(testName, determineMimeTypeTitle, result);
      Log.it(testName, determineMimeTypeTitle, it1, false);
      done();
    });

    const it2 = 'returns an empty string for a null argument';
    it(it2, async (done) => {
      Log.it(testName, determineMimeTypeTitle, it2, true);
      const result = await Media.determineMimeType(null);
      expect(result).toBe('');
      Log.log(testName, determineMimeTypeTitle, result);
      Log.it(testName, determineMimeTypeTitle, it2, false);
      done();
    });

    const it3 = 'returns an empty string for an empty string argument';
    it(it3, async (done) => {
      Log.it(testName, determineMimeTypeTitle, it3, true);
      const result = await Media.determineMimeType('');
      expect(result).toBe('');
      Log.log(testName, determineMimeTypeTitle, result);
      Log.it(testName, determineMimeTypeTitle, it3, false);
      done();
    });

    const it4 = 'returns an empty string for a non-existent file';
    it(it4, async (done) => {
      Log.it(testName, determineMimeTypeTitle, it4, true);
      const result = await Media.determineMimeType(Utils.newUuid());
      expect(result).toBe('');
      Log.log(testName, determineMimeTypeTitle, result);
      Log.it(testName, determineMimeTypeTitle, it4, false);
      done();
    });

    const it5 = 'returns directory for a folder';
    it(it5, async (done) => {
      Log.it(testName, determineMimeTypeTitle, it5, true);
      const result = await Media.determineMimeType(process.cwd());
      expect(result).toBe('inode/directory');
      Log.log(testName, determineMimeTypeTitle, result);
      Log.it(testName, determineMimeTypeTitle, it5, false);
      done();
    });
  });

  const encodeToBase64Title = 'encodeToBase64 function';
  const it1 = 'returns an empty string for a non-buffer data argument';
  it(it1, () => {
    Log.it(testName, encodeToBase64Title, it1, true);
    const result = Media.encodeToBase64();
    expect(result.mimeType).toBe('');
    expect(result.base64Data).toBe('');
    Log.it(testName, encodeToBase64Title, it1, false);
    Log.log(testName, encodeToBase64Title, result);
  });

  const it2 = 'returns an empty string for an empty buffer';
  it(it2, () => {
    Log.it(testName, encodeToBase64Title, it2, true);
    const buffer = Buffer.from('');
    const result = Media.encodeToBase64(buffer);
    expect(result.mimeType).toBe('unknown');
    expect(result.base64Data).toBe('');
    Log.it(testName, encodeToBase64Title, it2, false);
    Log.log(testName, encodeToBase64Title, result);
  });

  const it3 = 'returns unknown for short data';
  it(it3, () => {
    Log.it(testName, encodeToBase64Title, it3, true);
    const buffer = Buffer.from('test');
    const result = Media.encodeToBase64(buffer);
    expect(result.mimeType).toBe('unknown');
    expect(result.base64Data).toBe('dGVzdA==');
    Log.it(testName, encodeToBase64Title, it3, false);
    Log.log(testName, encodeToBase64Title, result);
  });

  const it4 = 'returns unknown for non-png/non-jpg data';
  it(it4, () => {
    Log.it(testName, encodeToBase64Title, it4, true);
    const buffer = Buffer.from('255044462d312e330a25', 'hex');
    const result = Media.encodeToBase64(buffer);
    expect(result.mimeType).toBe('unknown');
    expect(result.base64Data).toBe('JVBERi0xLjMKJQ==');
    Log.it(testName, encodeToBase64Title, it4, false);
    Log.log(testName, encodeToBase64Title, result);
  });

  const it5 = 'returns unknown for non-png/non-jpg data';
  it(it5, () => {
    Log.it(testName, encodeToBase64Title, it5, true);
    const buffer = Buffer.from('test');
    const result = Media.encodeToBase64(buffer);
    expect(result.mimeType).toBe('unknown');
    expect(result.base64Data).toBe('dGVzdA==');
    Log.it(testName, encodeToBase64Title, it5, false);
    Log.log(testName, encodeToBase64Title, result);
  });

  const it6 = 'returns image/png for png data';
  it(it6, () => {
    Log.it(testName, encodeToBase64Title, it6, true);
    const buffer = Buffer.from('89504e470d0a1a0a0000', 'hex');
    const result = Media.encodeToBase64(buffer);
    expect(result.mimeType).toBe('image/png');
    expect(result.base64Data).toBe('iVBORw0KGgoAAA==');
    Log.it(testName, encodeToBase64Title, it6, false);
    Log.log(testName, encodeToBase64Title, result);
  });

  const it7 = 'returns image/jpeg for jpg data';
  it(it7, () => {
    Log.it(testName, encodeToBase64Title, it7, true);
    const buffer = Buffer.from('ffd8ffe000104a464946', 'hex');
    const result = Media.encodeToBase64(buffer);
    expect(result.mimeType).toBe('image/jpeg');
    expect(result.base64Data).toBe('/9j/4AAQSkZJRg==');
    Log.it(testName, encodeToBase64Title, it7, false);
    Log.log(testName, encodeToBase64Title, result);
  });
});

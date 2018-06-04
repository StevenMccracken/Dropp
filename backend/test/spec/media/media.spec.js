const Log = require('../../logger');
const Media = require('../../../src/media/media');
const Utils = require('../../../src/utilities/utils');

const testName = 'Media';
/* eslint-disable no-undef */
describe(testName, () => {
  const determineMimeTypeTitle = 'determineMimeType function';
  describe(determineMimeTypeTitle, () => {
    it('returns an empty string for an undefined argument', async (done) => {
      const result = await Media.determineMimeType();
      expect(result).toBe('');
      Log(testName, determineMimeTypeTitle, result);
      done();
    });

    it('returns an empty string for a null argument', async (done) => {
      const result = await Media.determineMimeType(null);
      expect(result).toBe('');
      Log(testName, determineMimeTypeTitle, result);
      done();
    });

    it('returns an empty string for an empty string argument', async (done) => {
      const result = await Media.determineMimeType('');
      expect(result).toBe('');
      Log(testName, determineMimeTypeTitle, result);
      done();
    });

    it('returns an empty string for a non-existent file', async (done) => {
      const result = await Media.determineMimeType(Utils.newUuid());
      expect(result).toBe('');
      Log(testName, determineMimeTypeTitle, result);
      done();
    });

    it('returns directory for a folder', async (done) => {
      const result = await Media.determineMimeType(process.cwd());
      expect(result).toBe('inode/directory');
      Log(testName, determineMimeTypeTitle, result);
      done();
    });
  });

  const encodeToBase64Title = 'encodeToBase64 function';
  it('returns an empty string for a non-buffer data argument', () => {
    const result = Media.encodeToBase64();
    expect(result.mimeType).toBe('');
    expect(result.base64Data).toBe('');
    Log(testName, encodeToBase64Title, result);
  });

  it('returns an empty string for an empty buffer', () => {
    const buffer = Buffer.from('');
    const result = Media.encodeToBase64(buffer);
    expect(result.mimeType).toBe('unknown');
    expect(result.base64Data).toBe('');
    Log(testName, encodeToBase64Title, result);
  });

  it('returns unknown for short data', () => {
    const buffer = Buffer.from('test');
    const result = Media.encodeToBase64(buffer);
    expect(result.mimeType).toBe('unknown');
    expect(result.base64Data).toBe('dGVzdA==');
    Log(testName, encodeToBase64Title, result);
  });

  it('returns unknown for non-png/non-jpg data', () => {
    const buffer = Buffer.from('255044462d312e330a25', 'hex');
    const result = Media.encodeToBase64(buffer);
    expect(result.mimeType).toBe('unknown');
    expect(result.base64Data).toBe('JVBERi0xLjMKJQ==');
    Log(testName, encodeToBase64Title, result);
  });

  it('returns unknown for non-png/non-jpg data', () => {
    const buffer = Buffer.from('test');
    const result = Media.encodeToBase64(buffer);
    expect(result.mimeType).toBe('unknown');
    expect(result.base64Data).toBe('dGVzdA==');
    Log(testName, encodeToBase64Title, result);
  });

  it('returns image/png for png data', () => {
    const buffer = Buffer.from('89504e470d0a1a0a0000', 'hex');
    const result = Media.encodeToBase64(buffer);
    expect(result.mimeType).toBe('image/png');
    expect(result.base64Data).toBe('iVBORw0KGgoAAA==');
    Log(testName, encodeToBase64Title, result);
  });

  it('returns image/jpeg for jpg data', () => {
    const buffer = Buffer.from('ffd8ffe000104a464946', 'hex');
    const result = Media.encodeToBase64(buffer);
    expect(result.mimeType).toBe('image/jpeg');
    expect(result.base64Data).toBe('/9j/4AAQSkZJRg==');
    Log(testName, encodeToBase64Title, result);
  });
});

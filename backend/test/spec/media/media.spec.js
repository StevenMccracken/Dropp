const Log = require('../../logger');
const Media = require('../../../src/media/media');

const testName = 'Media';
/* eslint-disable no-undef */
describe(testName, () => {
  const bufferToBase64StringTitle = 'bufferToBase64String function';
  it('returns an empty string for a non-buffer data argument', () => {
    const result = Media.bufferToBase64String();
    expect(result).toBe('');
    Log(testName, bufferToBase64StringTitle, result);
  });

  it('returns an empty string for an empty buffer', () => {
    const buffer = Buffer.from('');
    const result = Media.bufferToBase64String(buffer);
    expect(result).toBe('data:unknown/unknown;base64,');
    Log(testName, bufferToBase64StringTitle, result);
  });

  it('returns unknown for short data', () => {
    const buffer = Buffer.from('test');
    const result = Media.bufferToBase64String(buffer);
    expect(result).toBe('data:unknown/unknown;base64,dGVzdA==');
    Log(testName, bufferToBase64StringTitle, result);
  });

  it('returns unknown for non-png/non-jpg data', () => {
    const buffer = Buffer.from('255044462d312e330a25', 'hex');
    const result = Media.bufferToBase64String(buffer);
    expect(result).toBe('data:unknown/unknown;base64,JVBERi0xLjMKJQ==');
    Log(testName, bufferToBase64StringTitle, result);
  });

  it('returns unknown for non-png/non-jpg data', () => {
    const buffer = Buffer.from('test');
    const result = Media.bufferToBase64String(buffer);
    expect(result).toBe('data:unknown/unknown;base64,dGVzdA==');
    Log(testName, bufferToBase64StringTitle, result);
  });

  it('returns image/png for png data', () => {
    const buffer = Buffer.from('89504e470d0a1a0a0000', 'hex');
    const result = Media.bufferToBase64String(buffer);
    expect(result).toBe('data:image/png;base64,iVBORw0KGgoAAA==');
    Log(testName, bufferToBase64StringTitle, result);
  });

  it('returns image/jpeg for jpg data', () => {
    const buffer = Buffer.from('ffd8ffe000104a464946', 'hex');
    const result = Media.bufferToBase64String(buffer);
    expect(result).toBe('data:image/jpeg;base64,/9j/4AAQSkZJRg==');
    Log(testName, bufferToBase64StringTitle, result);
  });
});

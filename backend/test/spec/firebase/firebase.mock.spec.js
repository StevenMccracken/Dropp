const Log = require('../../logger');
const Utils = require('../../../src/utilities/utils');
const MockFirebase = require('../../../src/firebase/firebase.mock');

/**
 * Logs a message for the current test file
 * @param {String} _title the describe label
 * @param {String|Object} _details the log details
 */
function log(_title, _details) {
  Log(`Mock Firebase ${_title}`, _details);
}

const urlPartsTitle = 'URL parts';
/* eslint-disable no-undef */
describe(urlPartsTitle, () => {
  it('returns empty array for non-string argument', (done) => {
    const result = MockFirebase.urlParts(null);
    expect(result.length).toBe(0);
    log(urlPartsTitle, result);
    done();
  });

  it('returns empty array for an empty string', (done) => {
    const result = MockFirebase.urlParts('');
    expect(result.length).toBe(0);
    log(urlPartsTitle, result);
    done();
  });

  it('returns an array of length 1 for a string with no \'/\'s', (done) => {
    const url = Utils.newUuid();
    const result = MockFirebase.urlParts(url);
    expect(result.length).toBe(1);
    expect(result[0]).toBe(url);
    log(urlPartsTitle, result);
    done();
  });

  it('returns an array without an empty string as the first element when the url starts with a \'/\'', (done) => {
    const result = MockFirebase.urlParts('/test');
    expect(result.length).toBe(1);
    expect(result[0]).toBe('test');
    log(urlPartsTitle, result);
    done();
  });

  it('returns an array with all the correct parts', (done) => {
    const parts = [
      Utils.newUuid(),
      Utils.newUuid(),
      Utils.newUuid(),
      Utils.newUuid(),
    ];

    const result = MockFirebase.urlParts(parts.join('/'));
    expect(result.length).toBe(4);
    expect(result[0]).toBe(parts[0]);
    expect(result[1]).toBe(parts[1]);
    expect(result[2]).toBe(parts[2]);
    expect(result[3]).toBe(parts[3]);
    log(urlPartsTitle, result);
    done();
  });
});
/* eslint-enable no-undef */

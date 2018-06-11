const Utils = require('../src/utilities/utils');

/**
 * Logs testing messages to the console
 * @param {String} _test the current test file or module
 * @param {String} _spec the current specification within the test
 * @param {Any} _details details to log
 */
const log = (_test, _spec, _details) => {
  const message = Utils.hasValue(_details) ? JSON.stringify(_details) : _details;
  console.log('[TEST] <%s> {%s}: %s', _test, _spec, message);
};

/**
 * Logs metadata test messages
 * @param {String} _test the current test file or module
 * @param {String} _spec the current specification within the test
 * @param {String} _location the type of test function
 * @param {Boolean} _start if the log is the beginning of the function
 */
const metaLog = (_test, _spec, _location, _start = false) => {
  const message = _start === true ? 'BEGIN' : 'END';
  console.log('[TEST] <%s> {%s} %s - %s', _test, _spec, _location, message);
};

/**
 * Logs testing messages for beforeEach functions
 * @param {String} _test the current test file or module
 * @param {String} _spec the current specification within the test
 * @param {Boolean} _start if the log is the beginning of the function
 */
const beforeEach = (_test, _spec, _start = false) => {
  metaLog(_test, _spec, 'beforeEach', _start);
};

/**
 * Logs testing messages for beforeEach functions
 * @param {String} _test the current test file or module
 * @param {String} _spec the current specification within the test
 * @param {Boolean} _start if the log is the beginning of the function
 */
const afterEach = (_test, _spec, _start = false) => {
  metaLog(_test, _spec, 'afterEach', _start);
};

/**
 * Logs testing messages for it functions within specs
 * @param {String} _test the current test file or module
 * @param {String} _spec the current specification within the test
 * @param {String} _it the it description within a spec
 * @param {Boolean} _start if the log is the beginning of the function
 */
const it = (_test, _spec, _it, _start = false) => {
  metaLog(_test, _spec, `[it: ${_it}]`, _start);
};

module.exports = {
  it,
  log,
  afterEach,
  beforeEach,
};

const Utils = require('../src/utilities/utils');

/**
 * Logs testing messages to the console
 * @param {String} _test the current test file or module
 * @param {String} _spec the current specification within the test
 * @param {Any} _details details to log
 */
const log = function log(_test, _spec, _details) {
  const message = Utils.hasValue(_details) ? JSON.stringify(_details) : _details;
  console.log('[TEST] <%s> {%s}: %s', _test, _spec, message);
};

module.exports = log;

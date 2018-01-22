/**
 * Logs testing messages to the console
 * @param {String} _topic the test specification
 * @param {String} _message a result of the test
 */
const log = function log(_topic, _message) {
  if (_message === undefined) console.log('[TEST]: %s', _topic);
  else console.log('[TEST] %s: %s', _topic, _message);
};

module.exports = log;

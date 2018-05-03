const Log = require('../../logger');
const LoggerModule = require('../../../src/logging/logger');

/**
 * Logs a message for the current test files
 * @param {String} _title the describe label
 * @param {String|Object} _details the log details
 */
function log(_title, _details) {
  Log(`Logger module ${_title}`, _details);
}

const logTitle = 'Log';
/* eslint-disable no-undef */
describe(logTitle, () => {
  it('logs a message without request details for no request object', (done) => {
    const message = LoggerModule.log('source', 'message');
    expect(message).toContain('[source]: message');
    log(logTitle, message);
    done();
  });

  it('logs a message with request details for an object with no headers', (done) => {
    const message = LoggerModule.log('source', 'message', {});
    expect(message).toContain('[source] () <undefined>: message');
    log(logTitle, message);
    done();
  });

  it('logs a message with request details for a true request object', (done) => {
    const request = {
      headers: {
        requestId: 'testId',
        'x-forwarded-for': 'testAddress',
      },
    };

    const message = LoggerModule.log('source', 'message', request);
    expect(message).toContain('[source] (testAddress) <testId>: message');
    log(logTitle, message);
    done();
  });
});
/* eslint-enable no-undef */

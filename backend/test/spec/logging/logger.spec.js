const Log = require('../../logger');
const LoggerModule = require('../../../src/logging/logger');

const testName = 'Logger Module';
const logTitle = 'Log';
/* eslint-disable no-undef */
describe(logTitle, () => {
  it('logs a message without request details for no request object', (done) => {
    const message = LoggerModule.log('source', 'message');
    expect(message).toContain('[source]: message');
    Log(testName, logTitle, message);
    done();
  });

  it('logs a message with request details for an object with no headers', (done) => {
    const message = LoggerModule.log('source', 'message', {});
    expect(message).toContain('[source] () <undefined>: message');
    Log(testName, logTitle, message);
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
    Log(testName, logTitle, message);
    done();
  });
});

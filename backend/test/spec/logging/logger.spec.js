const Log = require('../../logger');
const LoggerModule = require('../../../src/logging/logger');

const testName = 'Logger Module';
const logRequestTitle = 'Log request';
/* eslint-disable no-undef */
describe(logRequestTitle, () => {
  it('logs a message without request details for no request object', (done) => {
    const message = LoggerModule.logRequest('module', 'source', null);
    expect(message).toContain('} [module -> source] () <> | undefined undefined |');
    Log(testName, logRequestTitle, message);
    done();
  });

  it('logs a message with request details for an object with no headers', (done) => {
    const message = LoggerModule.logRequest('module', 'source', {});
    expect(message).toContain('} [module -> source] () <> | undefined undefined |');
    Log(testName, logRequestTitle, message);
    done();
  });

  it('logs a message with request details for a true request object', (done) => {
    const request = {
      headers: {
        requestId: 'testId',
        'x-forwarded-for': 'testAddress',
      },
    };

    const message = LoggerModule.logRequest('module', 'source', request);
    expect(message).toContain('} [module -> source] (testAddress) <testId> | undefined undefined |');
    Log(testName, logRequestTitle, message);
    done();
  });

  it('logs a message with request details for a request object with other header info', (done) => {
    const request = {
      url: 'url',
      method: 'method',
      headers: {
        requestId: 'testId',
        'x-forwarded-for': 'testAddress',
      },
    };

    const message = LoggerModule.logRequest('module', 'source', request);
    expect(message).toContain('} [module -> source] (testAddress) <testId> | method url |');
    Log(testName, logRequestTitle, message);
    done();
  });

  it('logs a message with request details and extra messages', (done) => {
    const request = {
      url: 'url',
      method: 'method',
      headers: {
        requestId: 'testId',
        'x-forwarded-for': 'testAddress',
      },
    };

    const message = LoggerModule.logRequest('module', 'source', request, 'wow', 2);
    expect(message).toContain('} [module -> source] (testAddress) <testId> | method url |: "wow",2');
    Log(testName, logRequestTitle, message);
    done();
  });
});

const logTitle = 'Log 2';
describe(logTitle, () => {
  it('logs a message with no arguments', (done) => {
    const message = LoggerModule.log('module', 'source');
    expect(message).toContain('} [module -> source]');
    Log(testName, logTitle, message);
    done();
  });

  it('logs a message with one argument', (done) => {
    const message = LoggerModule.log('module', 'source', 4);
    expect(message).toContain('} [module -> source]: 4');
    Log(testName, logTitle, message);
    done();
  });

  it('logs a message with multiple arguments', (done) => {
    const message = LoggerModule.log('module', 'source', 4, 'test');
    expect(message).toContain('} [module -> source]: 4,"test"');
    Log(testName, logTitle, message);
    done();
  });

  it('logs a message with an invalid argument', (done) => {
    const message = LoggerModule.log('module', 'source', null);
    expect(message).toContain('} [module -> source]: null');
    Log(testName, logTitle, message);
    done();
  });

  it('logs a message with multiple invalid arguments', (done) => {
    const message = LoggerModule.log('module', 'source', null, undefined);
    expect(message).toContain('} [module -> source]: null,undefined');
    Log(testName, logTitle, message);
    done();
  });
});

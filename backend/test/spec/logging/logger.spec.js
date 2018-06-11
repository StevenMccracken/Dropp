const Log = require('../../logger');
const LoggerModule = require('../../../src/logging/logger');

const testName = 'Logger Module';
const logRequestTitle = 'Log request';
/* eslint-disable no-undef */
describe(logRequestTitle, () => {
  const it1 = 'logs a message without request details for no request object';
  it(it1, () => {
    Log.it(testName, logRequestTitle, it1, true);
    const message = LoggerModule.logRequest('module', 'source', null);
    expect(message).toContain('} [module -> source] () <> | undefined undefined |');
    Log.log(testName, logRequestTitle, message);
    Log.it(testName, logRequestTitle, it1, false);
  });

  const it2 = 'logs a message with request details for an object with no headers';
  it(it2, () => {
    Log.it(testName, logRequestTitle, it2, true);
    const message = LoggerModule.logRequest('module', 'source', {});
    expect(message).toContain('} [module -> source] () <> | undefined undefined |');
    Log.log(testName, logRequestTitle, message);
    Log.it(testName, logRequestTitle, it2, false);
  });

  const it3 = 'logs a message with request details for a true request object';
  it(it3, () => {
    Log.it(testName, logRequestTitle, it3, true);
    const request = {
      headers: {
        requestId: 'testId',
        'x-forwarded-for': 'testAddress',
      },
    };

    const message = LoggerModule.logRequest('module', 'source', request);
    expect(message).toContain('} [module -> source] (testAddress) <testId> | undefined undefined |');
    Log.log(testName, logRequestTitle, message);
    Log.it(testName, logRequestTitle, it3, false);
  });

  const it4 = 'logs a message with request details for a request object with other header info';
  it(it4, () => {
    Log.it(testName, logRequestTitle, it4, true);
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
    Log.log(testName, logRequestTitle, message);
    Log.it(testName, logRequestTitle, it4, false);
  });

  const it5 = 'logs a message with request details and extra messages';
  it(it5, () => {
    Log.it(testName, logRequestTitle, it5, true);
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
    Log.log(testName, logRequestTitle, message);
    Log.it(testName, logRequestTitle, it5, false);
  });
});

const logTitle = 'Log';
describe(logTitle, () => {
  const it6 = 'logs a message with no arguments';
  it(it6, () => {
    Log.it(testName, logTitle, it6, true);
    const message = LoggerModule.log('module', 'source');
    expect(message).toContain('} [module -> source]');
    Log.log(testName, logTitle, message);
    Log.it(testName, logTitle, it6, false);
  });

  const it7 = 'logs a message with one argument';
  it(it7, () => {
    Log.it(testName, logTitle, it7, true);
    const message = LoggerModule.log('module', 'source', 4);
    expect(message).toContain('} [module -> source]: 4');
    Log.log(testName, logTitle, message);
    Log.it(testName, logTitle, it7, false);
  });

  const it8 = 'logs a message with multiple arguments';
  it(it8, () => {
    Log.it(testName, logTitle, it8, true);
    const message = LoggerModule.log('module', 'source', 4, 'test');
    expect(message).toContain('} [module -> source]: 4,"test"');
    Log.log(testName, logTitle, message);
    Log.it(testName, logTitle, it8, false);
  });

  const it9 = 'logs a message with an invalid argument';
  it(it9, () => {
    Log.it(testName, logTitle, it9, true);
    const message = LoggerModule.log('module', 'source', null);
    expect(message).toContain('} [module -> source]: null');
    Log.log(testName, logTitle, message);
    Log.it(testName, logTitle, it9, false);
  });

  const it10 = 'logs a message with multiple invalid arguments';
  it(it10, () => {
    Log.it(testName, logTitle, it10, true);
    const message = LoggerModule.log('module', 'source', null, undefined);
    expect(message).toContain('} [module -> source]: null,undefined');
    Log.log(testName, logTitle, message);
    Log.it(testName, logTitle, it10, false);
  });
});

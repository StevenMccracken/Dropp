const Log = require('../../logger');
const Server = require('../../../index');

const testName = 'Index startup';
const startServerTitle = 'Start server';
/* eslint-disable no-undef */
describe(startServerTitle, () => {
  const it1 = 'starts the server on a port';
  it(it1, () => {
    Log.it(testName, startServerTitle, it1, true);
    expect(Server.port).toBeDefined();
    Log.log(testName, startServerTitle, Server.port);
    Log.it(testName, startServerTitle, it1, false);
  });
});

const Log = require('../../logger');
// const Server = require('../../../index');

const testName = 'Index shutdown';
const shutdownServerTitle = 'Shutdown server';
/* eslint-disable no-undef */
describe(shutdownServerTitle, () => {
  const it1 = 'shuts down the server';
  it(it1, () => {
    Log.it(testName, shutdownServerTitle, it1, true);
    // Server.shutdown();
    Log.log(testName, shutdownServerTitle, 'Did shut down the server');
    Log.it(testName, shutdownServerTitle, it1, false);
  });
});

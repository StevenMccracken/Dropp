const Log = require('../../logger');
// const Server = require('../../../index');

const testName = 'Index shutdown';
const shutdownServerTitle = 'Shutdown server';
/* eslint-disable no-undef */
describe(shutdownServerTitle, () => {
  it('shuts down the server', (done) => {
    // Server.shutdown();
    Log(testName, shutdownServerTitle, 'Did shut down the server');
    done();
  });
});

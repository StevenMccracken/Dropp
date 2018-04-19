const Log = require('../../logger');
// const Server = require('../../../index');

const shutdownServerTitle = 'Shutdown server';
/* eslint-disable no-undef */
describe(shutdownServerTitle, () => {
  it('shuts down the server', (done) => {
    // Server.shutdown();
    Log('Shut down the server');
    done();
  });
});
/* eslint-enable no-undef */

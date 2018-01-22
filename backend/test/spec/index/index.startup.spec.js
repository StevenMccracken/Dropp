const Log = require('../../logger');
const Server = require('../../../index');

/* eslint-disable no-undef */
const startServerTitle = 'Start server';
describe(startServerTitle, () => {
  it('starts the server on a port', (done) => {
    expect(Server.port).toBeDefined();
    Log('Server port is', Server.port);
    done();
  });
});
/* eslint-enable no-undef */

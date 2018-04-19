const Log = require('../../logger');
const Server = require('../../../index');

const startServerTitle = 'Start server';
/* eslint-disable no-undef */
describe(startServerTitle, () => {
  it('starts the server on a port', (done) => {
    expect(Server.port).toBeDefined();
    Log('Server port is', Server.port);
    done();
  });
});
/* eslint-enable no-undef */

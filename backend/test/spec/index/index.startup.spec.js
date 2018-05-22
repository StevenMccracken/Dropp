const Log = require('../../logger');
const Server = require('../../../index');

const testName = 'Index startup';
const startServerTitle = 'Start server';
/* eslint-disable no-undef */
describe(startServerTitle, () => {
  it('starts the server on a port', (done) => {
    expect(Server.port).toBeDefined();
    Log(testName, startServerTitle, Server.port);
    done();
  });
});

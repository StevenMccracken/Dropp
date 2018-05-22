const Request = require('request-promise-native');
const Log = require('../../logger');
const Server = require('../../../index');

const testName = 'Router Module';
const url = `http://localhost:${Server.port}/welcome`;
const welcomeRouteTitle = 'Welcome route';
/* eslint-disable no-undef */
describe(welcomeRouteTitle, () => {
  beforeEach(() => {
    this.options = {
      method: 'GET',
      uri: url,
      resolveWithFullResponse: true,
    };
  });

  afterEach(() => {
    delete this.options;
  });

  it('gets the welcome message', async (done) => {
    const response = await Request(this.options);
    expect(response.statusCode).toBe(200);
    const details = JSON.parse(response.body);
    expect(details.message).toBe('This is the REST API for Dropp');
    Log(testName, welcomeRouteTitle, response.body);
    done();
  });
});
/* eslint-enable no-undef */

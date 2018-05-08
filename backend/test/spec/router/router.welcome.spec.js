const Request = require('request-promise-native');
const Log = require('../../logger');
const Server = require('../../../index');

const url = `http://localhost:${Server.port}/welcome`;
const baseRouteTitle = 'Base route';
/* eslint-disable no-undef */
describe(baseRouteTitle, () => {
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

  it('gets the welcome message and returns status code 200', async (done) => {
    const response = await Request(this.options);
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(200);

    // Verify routes
    const details = JSON.parse(response.body);
    expect(details.message).toBe('This is the REST API for Dropp');
    Log(baseRouteTitle, response.body);
    done();
  });
});
/* eslint-enable no-undef */

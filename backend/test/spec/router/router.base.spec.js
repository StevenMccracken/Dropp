const Request = require('request-promise-native');
const Log = require('../../logger');
const Server = require('../../../index');

const baseUrl = `http://localhost:${Server.port}`;
const baseRouteTitle = 'Base route';
/* eslint-disable no-undef */
describe(baseRouteTitle, () => {
  beforeEach(() => {
    this.options = {
      method: 'GET',
      uri: baseUrl,
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
    const routes = JSON.parse(response.body);
    expect(routes['/']).toBe('GET');
    expect(routes.welcome).toBe('GET');
    expect(routes.auth).toBe('POST');
    expect(routes.users['/']).toBe('POST');
    expect(routes.users['/<username>']).toBe('GET');
    Log(baseRouteTitle, response.body);
    done();
  });
});
/* eslint-enable no-undef */

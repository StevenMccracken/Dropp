const Request = require('request-promise-native');
const Log = require('../../logger');
const Server = require('../../../index');

/**
 * Logs a message for the current test file
 * @param {String} _title the describe label
 * @param {String|Object} _details the log details
 */
function log(_title, _details) {
  Log(`Router Module ${_title}`, _details);
}

const url = `http://localhost:${Server.port}`;
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

  it('gets the list of routes', async (done) => {
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
    log(baseRouteTitle, response.body);
    done();
  });
});
/* eslint-enable no-undef */

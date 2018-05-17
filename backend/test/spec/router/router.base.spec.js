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
    expect(Object.keys(routes).length).toBe(4);
    expect(routes['/']).toBe('GET');
    expect(routes['/welcome']).toBe('GET');
    expect(routes['/auth']).toBe('POST');

    const users = routes['/users'];
    expect(Object.keys(users).length).toBe(2);
    expect(users['/']).toBe('POST');

    const username = users['/<username>'];
    expect(Object.keys(username).length).toBe(3);
    expect(username['/email']).toBe('PUT');
    expect(username['/password']).toBe('PUT');

    const baseUsername = username['/'];
    expect(baseUsername[0]).toBe('GET');
    expect(baseUsername[1]).toBe('DELETE');
    log(baseRouteTitle, response.body);
    done();
  });
});
/* eslint-enable no-undef */

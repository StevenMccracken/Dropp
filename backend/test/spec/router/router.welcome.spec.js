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
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(200);

    // Verify routes
    const details = JSON.parse(response.body);
    expect(details.message).toBe('This is the REST API for Dropp');
    log(welcomeRouteTitle, response.body);
    done();
  });
});
/* eslint-enable no-undef */

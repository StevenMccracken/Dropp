const Request = require('request-promise-native');
const Log = require('../../logger');
const Server = require('../../../index');

const testName = 'Router Module';
const url = `http://localhost:${Server.port}/welcome`;
const welcomeRouteTitle = 'Welcome route';
/* eslint-disable no-undef */
describe(welcomeRouteTitle, () => {
  beforeEach(() => {
    Log.beforeEach(testName, welcomeRouteTitle, true);
    this.options = {
      method: 'GET',
      uri: url,
      resolveWithFullResponse: true,
    };

    Log.beforeEach(testName, welcomeRouteTitle, false);
  });

  afterEach(() => {
    Log.afterEach(testName, welcomeRouteTitle, true);
    delete this.options;
    Log.afterEach(testName, welcomeRouteTitle, false);
  });

  const it1 = 'gets the welcome message';
  it(it1, async (done) => {
    Log.it(testName, welcomeRouteTitle, it1, true);
    const response = await Request(this.options);
    expect(response.statusCode).toBe(200);
    const details = JSON.parse(response.body);
    expect(details.message).toBe('This is the REST API for Dropp');
    Log.log(testName, welcomeRouteTitle, response.body);
    Log.it(testName, welcomeRouteTitle, it1, false);
    done();
  });
});
/* eslint-enable no-undef */

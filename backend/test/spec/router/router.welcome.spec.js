const Request = require('request-promise-native');
const Log = require('../../logger');
const Server = require('../../../index');
const TestConstants = require('../../constants');
const Constants = require('../../../src/utilities/constants');

const welcomeRouteTitle = 'Welcome route';
/* eslint-disable no-undef */
describe(welcomeRouteTitle, () => {
  beforeEach(() => {
    Log.beforeEach(TestConstants.router.testName, welcomeRouteTitle, true);
    this.options = {
      method: TestConstants.router.methods.get,
      uri: `${TestConstants.router.url(Server.port)}${Constants.router.routes.welcome}`,
      resolveWithFullResponse: true,
    };

    Log.beforeEach(TestConstants.router.testName, welcomeRouteTitle, false);
  });

  afterEach(() => {
    Log.afterEach(TestConstants.router.testName, welcomeRouteTitle, true);
    delete this.options;
    Log.afterEach(TestConstants.router.testName, welcomeRouteTitle, false);
  });

  const it1 = 'gets the welcome message';
  it(it1, async (done) => {
    Log.it(TestConstants.router.testName, welcomeRouteTitle, it1, true);
    const response = await Request(this.options);
    expect(response.statusCode).toBe(TestConstants.router.statusCodes.success);
    const details = JSON.parse(response.body);
    expect(details.message).toBe(Constants.router.messages.success.welcome);
    Log.log(TestConstants.router.testName, welcomeRouteTitle, response.body);
    Log.it(TestConstants.router.testName, welcomeRouteTitle, it1, false);
    done();
  });
});

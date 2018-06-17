const Request = require('request-promise-native');
const Log = require('../../logger');
const Server = require('../../../index');
const TestConstants = require('../../constants');
const Constants = require('../../../src/utilities/constants');

const baseRouteTitle = 'Base route';
/* eslint-disable no-undef */
describe(baseRouteTitle, () => {
  beforeEach(() => {
    Log.beforeEach(TestConstants.router.testName, baseRouteTitle, true);
    this.options = {
      method: TestConstants.router.methods.get,
      uri: TestConstants.router.url(Server.port),
      resolveWithFullResponse: true,
    };

    Log.beforeEach(TestConstants.router.testName, baseRouteTitle, false);
  });

  afterEach(() => {
    Log.afterEach(TestConstants.router.testName, baseRouteTitle, true);
    delete this.options;
    Log.afterEach(TestConstants.router.testName, baseRouteTitle, false);
  });

  const it1 = 'gets the list of routes';
  it(it1, async (done) => {
    Log.it(TestConstants.router.testName, baseRouteTitle, it1, true);
    const response = await Request(this.options);
    expect(response.statusCode).toBe(TestConstants.router.statusCodes.success);

    // Verify routes
    const routes = JSON.parse(response.body);
    expect(Object.keys(routes).length).toBe(4);
    expect(routes[Constants.router.routes.base]).toBe(TestConstants.router.methods.get);
    expect(routes[Constants.router.routes.welcome]).toBe(TestConstants.router.methods.get);
    expect(routes[Constants.router.routes.auth]).toBe(TestConstants.router.methods.post);

    const users = routes[Constants.router.routes.users.base];
    expect(Object.keys(users).length).toBe(2);
    expect(users[Constants.router.routes.base]).toBe(TestConstants.router.methods.post);

    const username = users[TestConstants.router.subroutes.anyUsername];
    expect(Object.keys(username).length).toBe(5);

    const baseUsername = username[Constants.router.routes.base];
    expect(baseUsername[0]).toBe(TestConstants.router.methods.get);
    expect(baseUsername[1]).toBe(TestConstants.router.methods.delete);

    expect(username[TestConstants.router.subroutes.email]).toBe(TestConstants.router.methods.put);
    expect(username[TestConstants.router.subroutes.password])
      .toBe(TestConstants.router.methods.put);

    const follows = username[TestConstants.router.subroutes.follows];
    expect(Object.keys(follows).length).toBe(2);
    expect(follows[TestConstants.router.subroutes.anyFollow])
      .toBe(TestConstants.router.methods.delete);

    const followRequests = follows[TestConstants.router.subroutes.requests];
    expect(Object.keys(followRequests).length).toBe(2);
    expect(followRequests[Constants.router.routes.base]).toBe(TestConstants.router.methods.post);
    expect(followRequests[TestConstants.router.subroutes.anyRequestedUser])
      .toBe(TestConstants.router.methods.delete);

    const followers = username[TestConstants.router.subroutes.followers];
    expect(Object.keys(followers).length).toBe(2);
    expect(followers[TestConstants.router.subroutes.anyFollower])
      .toBe(TestConstants.router.methods.delete);

    const followerRequests = followers[TestConstants.router.subroutes.requests];
    expect(Object.keys(followerRequests).length).toBe(1);
    expect(followerRequests[TestConstants.router.subroutes.anyRequestedUser])
      .toBe(TestConstants.router.methods.put);

    Log.log(TestConstants.router.testName, baseRouteTitle, response.body);
    Log.it(TestConstants.router.testName, baseRouteTitle, it1, false);
    done();
  });
});

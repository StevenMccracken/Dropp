const Request = require('request-promise-native');
const Log = require('../../logger');
const Server = require('../../../index');

const testName = 'Router Module';
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
    expect(Object.keys(username).length).toBe(5);

    const baseUsername = username['/'];
    expect(baseUsername[0]).toBe('GET');
    expect(baseUsername[1]).toBe('DELETE');

    expect(username['/email']).toBe('PUT');
    expect(username['/password']).toBe('PUT');

    const follows = username['/follows'];
    expect(Object.keys(follows).length).toBe(2);
    expect(follows['/<follow>']).toBe('DELETE');

    const followRequests = follows['/requests'];
    expect(Object.keys(followRequests).length).toBe(2);
    expect(followRequests['/']).toBe('POST');
    expect(followRequests['/<requestedUser>']).toBe('DELETE');

    const followers = username['/followers'];
    expect(Object.keys(followers).length).toBe(2);
    expect(followers['/<follower>']).toBe('DELETE');

    const followerRequests = followers['/requests'];
    expect(Object.keys(followerRequests).length).toBe(1);
    expect(followerRequests['/<requestedUser>']).toBe('PUT');

    Log(testName, baseRouteTitle, response.body);
    done();
  });
});

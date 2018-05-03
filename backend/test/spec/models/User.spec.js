const Log = require('../../logger');
const User = require('../../../src/models/User');
const ModelError = require('../../../src/errors/ModelError');

/**
 * Logs a message for the current test file
 * @param {String} _title the describe label
 * @param {String|Object} _details the log details
 */
function log(_title, _details) {
  Log(`User Model ${_title}`, _details);
}

const constructorTitle = 'Constructor';
/* eslint-disable no-undef */
describe(constructorTitle, () => {
  beforeEach(() => {
    this.details = {
      email: 'test@test.com',
      username: 'test',
    };
  });

  afterEach(() => {
    delete this.details;
  });

  it('throws an error for an invalid details object', (done) => {
    try {
      const user = new User();
      expect(user).not.toBeDefined();
      log(constructorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('ModelError');
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      log(constructorTitle, error);
    }

    done();
  });

  it('throws an error for a missing email', (done) => {
    try {
      delete this.details.email;
      const user = new User(this.details);
      expect(user).not.toBeDefined();
      log(constructorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('ModelError');
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      expect(error.details.details.invalidMembers.length).toBe(1);
      expect(error.details.details.invalidMembers[0]).toBe('email');
      log(constructorTitle, error);
    }

    done();
  });

  it('throws an error for a missing username', (done) => {
    try {
      delete this.details.username;
      const user = new User(this.details);
      expect(user).not.toBeDefined();
      log(constructorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('ModelError');
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      expect(error.details.details.invalidMembers.length).toBe(1);
      expect(error.details.details.invalidMembers[0]).toBe('username');
      log(constructorTitle, error);
    }

    done();
  });

  it('creates a user object with the given details', (done) => {
    const user = new User(this.details);
    expect(user.username).toBe(this.details.username);
    expect(user.email).toBe(this.details.email);
    expect(user.follows.length).toBe(0);
    expect(user.followers.length).toBe(0);
    expect(user.followRequests.length).toBe(0);
    expect(user.followerRequests.length).toBe(0);

    /* eslint-disable prefer-destructuring */
    const data = user.data;
    expect(Object.keys(data).length).toBe(5);
    expect(data.email).toBe(this.details.email);
    expect(Object.keys(data.follows).length).toBe(0);
    expect(Object.keys(data.followers).length).toBe(0);
    expect(Object.keys(data.follow_requests).length).toBe(0);
    expect(Object.keys(data.follower_requests).length).toBe(0);

    const privateData = user.privateData;
    expect(Object.keys(privateData).length).toBe(10);
    expect(privateData.email).toBe(this.details.email);
    expect(privateData.username).toBe(this.details.username);
    expect(Object.keys(privateData.follows).length).toBe(0);
    expect(Object.keys(privateData.followers).length).toBe(0);
    expect(privateData.followsCount).toBe(0);
    expect(privateData.followerCount).toBe(0);
    expect(Object.keys(privateData.followRequests).length).toBe(0);
    expect(Object.keys(privateData.followerRequests).length).toBe(0);
    expect(privateData.followRequestCount).toBe(0);
    expect(privateData.followerRequestCount).toBe(0);

    const publicData = user.publicData;
    expect(Object.keys(publicData).length).toBe(5);
    expect(publicData.username).toBe(this.details.username);
    expect(Object.keys(publicData.follows).length).toBe(0);
    expect(Object.keys(publicData.followers).length).toBe(0);
    expect(publicData.followsCount).toBe(0);
    expect(publicData.followerCount).toBe(0);
    expect(publicData.email).not.toBeDefined();
    expect(publicData.followRequests).not.toBeDefined();
    expect(publicData.followerRequests).not.toBeDefined();
    expect(publicData.followRequestCount).not.toBeDefined();
    expect(publicData.followerRequestCount).not.toBeDefined();
    /* eslint-enable prefer-destructuring */
    log(constructorTitle, user);
    done();
  });

  it('creates a user object with follows', (done) => {
    this.details.follows = {
      test: 'test',
    };

    const user = new User(this.details);
    expect(user.follows.length).toBe(1);
    expect(user.doesFollow('test')).toBe(true);

    /* eslint-disable prefer-destructuring */
    const data = user.data;
    expect(Object.keys(data.follows).length).toBe(1);
    expect(data.follows.test).toBe('test');

    const privateData = user.privateData;
    expect(Object.keys(privateData.follows).length).toBe(1);
    expect(privateData.followsCount).toBe(1);

    const publicData = user.publicData;
    expect(Object.keys(publicData.follows).length).toBe(1);
    expect(publicData.followsCount).toBe(1);
    /* eslint-enable prefer-destructuring */
    log(constructorTitle, user);
    done();
  });

  it('creates a user object with followers', (done) => {
    this.details.followers = {
      test: 'test',
    };

    const user = new User(this.details);
    expect(user.followers.length).toBe(1);
    expect(user.hasFollower('test')).toBe(true);

    /* eslint-disable prefer-destructuring */
    const data = user.data;
    expect(Object.keys(data.followers).length).toBe(1);
    expect(data.followers.test).toBe('test');

    const privateData = user.privateData;
    expect(Object.keys(privateData.followers).length).toBe(1);
    expect(privateData.followerCount).toBe(1);

    const publicData = user.publicData;
    expect(Object.keys(publicData.followers).length).toBe(1);
    expect(publicData.followerCount).toBe(1);
    /* eslint-enable prefer-destructuring */
    log(constructorTitle, user);
    done();
  });

  it('creates a user object with follow requests', (done) => {
    this.details.follow_requests = {
      test: 'test',
    };

    const user = new User(this.details);
    expect(user.followRequests.length).toBe(1);
    expect(user.hasFollowRequest('test')).toBe(true);

    /* eslint-disable prefer-destructuring */
    const data = user.data;
    expect(Object.keys(data.follow_requests).length).toBe(1);
    expect(data.follow_requests.test).toBe('test');

    const privateData = user.privateData;
    expect(Object.keys(privateData.followRequests).length).toBe(1);
    expect(privateData.followRequestCount).toBe(1);
    /* eslint-enable prefer-destructuring */
    log(constructorTitle, user);
    done();
  });

  it('creates a user object with follower requests', (done) => {
    this.details.follower_requests = {
      test: 'test',
    };

    const user = new User(this.details);
    expect(user.followerRequests.length).toBe(1);
    expect(user.hasFollowerRequest('test')).toBe(true);

    /* eslint-disable prefer-destructuring */
    const data = user.data;
    expect(Object.keys(data.follower_requests).length).toBe(1);
    expect(data.follower_requests.test).toBe('test');

    const privateData = user.privateData;
    expect(Object.keys(privateData.followerRequests).length).toBe(1);
    expect(privateData.followerRequestCount).toBe(1);
    /* eslint-enable prefer-destructuring */
    log(constructorTitle, user);
    done();
  });

  it('does not crash for missing inter-user data', (done) => {
    const user = new User(this.details);
    user.follows = null;
    user.followers = null;
    user.followRequests = null;
    user.followerRequests = null;
    expect(user.doesFollow('test')).toBe(false);
    expect(user.hasFollower('test')).toBe(false);
    expect(user.hasFollowRequest('test')).toBe(false);
    expect(user.hasFollowerRequest('test')).toBe(false);
    log(constructorTitle, user);
    done();
  });
});
/* eslint-enable no-undef */

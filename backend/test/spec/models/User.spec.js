const Log = require('../../logger');
const User = require('../../../src/models/User');
const ModelError = require('../../../src/errors/ModelError');

const testName = 'User Model';
const constructorTitle = 'Constructor';
/* eslint-disable no-undef */
describe(constructorTitle, () => {
  beforeEach(() => {
    Log.beforeEach(testName, constructorTitle, true);
    this.details = {
      email: 'test@test.com',
      username: 'test',
    };

    Log.beforeEach(testName, constructorTitle, false);
  });

  afterEach(() => {
    Log.afterEach(testName, constructorTitle, true);
    delete this.details;
    Log.afterEach(testName, constructorTitle, false);
  });

  const it0 = 'throws an error for an invalid details object';
  it(it0, () => {
    Log.it(testName, constructorTitle, it0, true);
    try {
      const user = new User();
      expect(user).not.toBeDefined();
      Log.log(testName, constructorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('ModelError');
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      Log.log(testName, constructorTitle, error);
    }

    Log.it(testName, constructorTitle, it0, false);
  });

  const it1 = 'throws an error for a missing email';
  it(it1, () => {
    Log.it(testName, constructorTitle, it1, true);
    try {
      delete this.details.email;
      const user = new User(this.details);
      expect(user).not.toBeDefined();
      Log.log(testName, constructorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('ModelError');
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      expect(error.details.details.invalidMembers.length).toBe(1);
      expect(error.details.details.invalidMembers[0]).toBe('email');
      Log.log(testName, constructorTitle, error);
    }

    Log.it(testName, constructorTitle, it1, false);
  });

  const it2 = 'throws an error for a missing username';
  it(it2, () => {
    Log.it(testName, constructorTitle, it2, true);
    try {
      delete this.details.username;
      const user = new User(this.details);
      expect(user).not.toBeDefined();
      Log.log(testName, constructorTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('ModelError');
      expect(error.details.type).toBe(ModelError.type.Constructor.type);
      expect(error.details.details.invalidMembers.length).toBe(1);
      expect(error.details.details.invalidMembers[0]).toBe('username');
      Log.log(testName, constructorTitle, error);
    }

    Log.it(testName, constructorTitle, it2, false);
  });

  const it3 = 'creates a user object with the given details';
  it(it3, () => {
    Log.it(testName, constructorTitle, it3, true);
    const user = new User(this.details);
    expect(user.username).toBe(this.details.username);
    expect(user.email).toBe(this.details.email);
    expect(user.follows.length).toBe(0);
    expect(user.followers.length).toBe(0);
    expect(user.followRequests.length).toBe(0);
    expect(user.followerRequests.length).toBe(0);

    const data = user.databaseData;
    expect(Object.keys(data).length).toBe(5);
    expect(data.email).toBe(this.details.email);
    expect(Object.keys(data.follows).length).toBe(0);
    expect(Object.keys(data.followers).length).toBe(0);
    expect(Object.keys(data.follow_requests).length).toBe(0);
    expect(Object.keys(data.follower_requests).length).toBe(0);

    /* eslint-disable prefer-destructuring */
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
    Log.log(testName, constructorTitle, user);
    Log.it(testName, constructorTitle, it3, false);
  });

  const it4 = 'creates a user object with follows';
  it(it4, () => {
    Log.it(testName, constructorTitle, it4, true);
    this.details.follows = {
      test: 'test',
    };

    const user = new User(this.details);
    expect(user.follows.length).toBe(1);
    expect(user.doesFollow('test')).toBe(true);

    const data = user.databaseData;
    expect(Object.keys(data.follows).length).toBe(1);
    expect(data.follows.test).toBe('test');

    /* eslint-disable prefer-destructuring */
    const privateData = user.privateData;
    expect(Object.keys(privateData.follows).length).toBe(1);
    expect(privateData.followsCount).toBe(1);

    const publicData = user.publicData;
    expect(Object.keys(publicData.follows).length).toBe(1);
    expect(publicData.followsCount).toBe(1);
    /* eslint-enable prefer-destructuring */
    Log.log(testName, constructorTitle, user);
    Log.it(testName, constructorTitle, it4, false);
  });

  const it5 = 'creates a user object with followers';
  it(it5, () => {
    Log.it(testName, constructorTitle, it5, true);
    this.details.followers = {
      test: 'test',
    };

    const user = new User(this.details);
    expect(user.followers.length).toBe(1);
    expect(user.hasFollower('test')).toBe(true);

    const data = user.databaseData;
    expect(Object.keys(data.followers).length).toBe(1);
    expect(data.followers.test).toBe('test');

    /* eslint-disable prefer-destructuring */
    const privateData = user.privateData;
    expect(Object.keys(privateData.followers).length).toBe(1);
    expect(privateData.followerCount).toBe(1);

    const publicData = user.publicData;
    expect(Object.keys(publicData.followers).length).toBe(1);
    expect(publicData.followerCount).toBe(1);
    /* eslint-enable prefer-destructuring */
    Log.log(testName, constructorTitle, user);
    Log.it(testName, constructorTitle, it5, false);
  });

  const it6 = 'creates a user object with follow requests';
  it(it6, () => {
    Log.it(testName, constructorTitle, it6, true);
    this.details.follow_requests = {
      test: 'test',
    };

    const user = new User(this.details);
    expect(user.followRequests.length).toBe(1);
    expect(user.hasFollowRequest('test')).toBe(true);

    const data = user.databaseData;
    expect(Object.keys(data.follow_requests).length).toBe(1);
    expect(data.follow_requests.test).toBe('test');

    /* eslint-disable prefer-destructuring */
    const privateData = user.privateData;
    expect(Object.keys(privateData.followRequests).length).toBe(1);
    expect(privateData.followRequestCount).toBe(1);
    /* eslint-enable prefer-destructuring */
    Log.log(testName, constructorTitle, user);
    Log.it(testName, constructorTitle, it6, false);
  });

  const it7 = 'creates a user object with follower requests';
  it(it7, () => {
    Log.it(testName, constructorTitle, it7, true);
    this.details.follower_requests = {
      test: 'test',
    };

    const user = new User(this.details);
    expect(user.followerRequests.length).toBe(1);
    expect(user.hasFollowerRequest('test')).toBe(true);

    const data = user.databaseData;
    expect(Object.keys(data.follower_requests).length).toBe(1);
    expect(data.follower_requests.test).toBe('test');

    /* eslint-disable prefer-destructuring */
    const privateData = user.privateData;
    expect(Object.keys(privateData.followerRequests).length).toBe(1);
    expect(privateData.followerRequestCount).toBe(1);
    /* eslint-enable prefer-destructuring */
    Log.log(testName, constructorTitle, user);
    Log.it(testName, constructorTitle, it7, false);
  });

  const it8 = 'does not crash for missing inter-user data';
  it(it8, () => {
    Log.it(testName, constructorTitle, it8, true);
    const user = new User(this.details);
    user.follows = null;
    user.followers = null;
    user.followRequests = null;
    user.followerRequests = null;
    expect(user.doesFollow('test')).toBe(false);
    expect(user.hasFollower('test')).toBe(false);
    expect(user.hasFollowRequest('test')).toBe(false);
    expect(user.hasFollowerRequest('test')).toBe(false);
    Log.log(testName, constructorTitle, user);
    Log.it(testName, constructorTitle, it8, false);
  });
});

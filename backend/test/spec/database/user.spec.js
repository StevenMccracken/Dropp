const Log = require('../../logger');
const User = require('../../../src/models/User');
const Firebase = require('../../../src/firebase/firebase');
const UserAccessor = require('../../../src/database/user');

Firebase.start(true);
const user1 = new User({
  username: 'test0123456789',
  email: 'test0123456789@test.com',
});

const getMissingUserTitle = 'Get non-existent user';
/* eslint-disable no-undef */
describe(getMissingUserTitle, () => {
  it('attempts to get a non-existent user from the database', async (done) => {
    const retrievedUser = await UserAccessor.get(user1.username);
    expect(retrievedUser).toBe(null);
    Log(getMissingUserTitle, `Non-existent user is ${retrievedUser}`);
    done();
  }, 10000);
});

const createUser1Title = 'Create user 1';
describe(createUser1Title, () => {
  it('creates the user in the database', async (done) => {
    await UserAccessor.create(user1, 'password');
    Log(createUser1Title);
    done();
  }, 10000);
});

const user2 = new User({
  username: 'test9876543210',
  email: 'test9876543210@test.com',
});

const createUser2Title = 'Create user 2';
describe(createUser2Title, () => {
  it('creates the user in the database', async (done) => {
    await UserAccessor.create(user2, 'password');
    Log(createUser2Title);
    done();
  }, 10000);
});

const getPasswordTitle = 'Get password';
describe(getPasswordTitle, () => {
  it('gets a password from the database', async (done) => {
    const password = await UserAccessor.getPassword(user2.username);
    expect(password).toBe('password');
    Log(getPasswordTitle);
    done();
  }, 10000);
});

let retrievedUser;
const getUserTitle = 'Get user';
describe(getUserTitle, () => {
  it('retrieves a user from the database', async (done) => {
    retrievedUser = await UserAccessor.get(user1.username);
    expect(retrievedUser).toBeDefined();
    expect(retrievedUser.username).toBe(user1.username);
    expect(retrievedUser.email).toBe(user1.email);
    expect(Array.isArray(retrievedUser.follows)).toBe(true);
    expect(Array.isArray(retrievedUser.followers)).toBe(true);
    expect(Array.isArray(retrievedUser.followRequests)).toBe(true);
    expect(Array.isArray(retrievedUser.followerRequests)).toBe(true);
    Log(getUserTitle, `Retrieving user ${user1.username} returned ${retrievedUser.username}`);
    done();
  }, 10000);
});

const updatePasswordTitle = 'Update password';
describe(updatePasswordTitle, () => {
  it('updates a password in the database', async (done) => {
    await UserAccessor.updatePassword(user1, 'newPassword');
    Log(updatePasswordTitle);
    done();
  }, 10000);
});

const getUpdatedPasswordTitle = 'Get updated password';
describe(getUpdatedPasswordTitle, () => {
  it('gets the updated password from the database', async (done) => {
    const password = await UserAccessor.getPassword(user1.username);
    expect(password).toBe('newPassword');
    Log(getUpdatedPasswordTitle);
    done();
  }, 10000);
});

const updateEmailTitle = 'Update email';
describe(updateEmailTitle, () => {
  it('updates a user\'s email in the database', async (done) => {
    const oldEmail = user1.email;
    const newEmail = 'test0123456789876543210@test.com';
    await UserAccessor.updateEmail(user1, newEmail);
    expect(user1.email).toBe(newEmail);
    Log(updateEmailTitle, `Updated user ${user1.username}'s email from ${oldEmail} to ${user1.email}`);
    done();
  }, 10000);
});

const addFollowRequestTitle = 'Add follow request';
describe(addFollowRequestTitle, () => {
  it('adds a follow request to the user\'s follow requests', async (done) => {
    await UserAccessor.addFollowRequest(user1, user2);
    expect(user1.followRequests).toContain(user2.username);
    expect(user2.followerRequests).toContain(user1.username);
    Log(addFollowRequestTitle);
    done();
  }, 10000);
});

const addFollowTitle = 'Add follow';
describe(addFollowTitle, () => {
  it('adds a follow to the user\'s follows', async (done) => {
    await UserAccessor.addFollow(user1, user2);
    expect(user1.follows).toContain(user2.username);
    expect(user2.followers).toContain(user1.username);
    expect(user1.followRequests).not.toContain(user2.username);
    expect(user2.followerRequests).not.toContain(user1.username);
    Log(addFollowTitle);
    done();
  }, 10000);
});

const removeFollowTitle = 'Remove follow';
describe(removeFollowTitle, () => {
  it('removes a follow from the user\'s follows', async (done) => {
    await UserAccessor.removeFollow(user1, user2);
    expect(user1.follows).not.toContain(user2.username);
    expect(user2.followers).not.toContain(user1.username);
    Log(removeFollowTitle);
    done();
  }, 10000);
});

describe(addFollowRequestTitle, () => {
  it('adds a follow request to the user\'s follow requests', async (done) => {
    await UserAccessor.addFollowRequest(user2, user1);
    expect(user2.followRequests).toContain(user1.username);
    expect(user1.followerRequests).toContain(user2.username);
    Log(addFollowRequestTitle);
    done();
  }, 10000);
});

const removeFollowRequestTitle = 'Remove follow request';
describe(removeFollowRequestTitle, () => {
  it('removes a follow request from the user\'s follow requests', async (done) => {
    await UserAccessor.removeFollowRequest(user2, user1);
    expect(user2.followRequests).not.toContain(user1.username);
    expect(user1.followerRequests).not.toContain(user2.username);
    Log(removeFollowRequestTitle);
    done();
  }, 10000);
});

const deleteUser1Title = 'Delete user 1';
describe(deleteUser1Title, () => {
  it('deletes the user from the database', async (done) => {
    await UserAccessor.remove(user1);
    Log(deleteUser1Title);
    done();
  }, 10000);
});

const deleteUser2Title = 'Delete user 2';
describe(deleteUser2Title, () => {
  it('deletes the user from the database', async (done) => {
    await UserAccessor.remove(user2);
    Log(deleteUser2Title);
    done();
  }, 10000);
});
/* eslint-enable no-undef */

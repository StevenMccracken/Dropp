const Log = require('../../logger');
const User = require('../../../src/models/User');
// const Utils = require('../../../src/utilities/utils');
const Firebase = require('../../../src/firebase/firebase');
const UserAccessor = require('../../../src/database/user');

/* eslint-disable no-undef */
Firebase.start();

const user = new User({
  username: 'test0123456789',
  email: 'test0123456789@test.com',
});

const getMissingUserTitle = 'Get non-existent user';
describe(getMissingUserTitle, () => {
  it('attempts to get a non-existent user from the database', async (done) => {
    const retrievedUser = await UserAccessor.get(user.username);
    expect(retrievedUser).toBe(null);
    Log(getMissingUserTitle, `Non-existent user is ${retrievedUser}`);
    done();
  }, 10000);
});

const createUserTitle = 'Create user';
describe(createUserTitle, () => {
  it('creates a user in the database', async (done) => {
    await UserAccessor.add(user);
    Log(createUserTitle);
    done();
  }, 10000);
});

const addPasswordTitle = 'Add password';
describe(addPasswordTitle, () => {
  it('creates a password in the database', async (done) => {
    await UserAccessor.addPassword(user, 'password');
    Log(addPasswordTitle);
    done();
  }, 10000);
});

const getUserTitle = 'Get user';
describe(getUserTitle, () => {
  it('retrieves a user from the database', async (done) => {
    const retrievedUser = await UserAccessor.get(user.username);
    expect(retrievedUser).toBeDefined();
    expect(retrievedUser.username).toBe(user.username);
    expect(retrievedUser.email).toBe(user.email);
    expect(retrievedUser.follows).toBeDefined();
    expect(retrievedUser.followers).toBeDefined();
    expect(retrievedUser.followRequests).toBeDefined();
    expect(retrievedUser.followerRequests).toBeDefined();
    Log(getUserTitle, `Retrieving user ${user.username} returned ${retrievedUser.username}`);
    done();
  }, 10000);
});

const updateEmailTitle = 'Update email';
describe(updateEmailTitle, () => {
  it('updates a user\'s email in the database', async (done) => {
    const oldEmail = user.email;
    const newEmail = 'test0123456789876543210@test.com';
    await UserAccessor.updateEmail(user, newEmail);
    expect(user.email).toBe(newEmail);
    Log(updateEmailTitle, `Updated user ${user.username}'s email from ${oldEmail} to ${user.email}`);
    done();
  }, 10000);
});

const updatePasswordTitle = 'Update password';
describe(updatePasswordTitle, () => {
  it('updates a password in the database', async (done) => {
    await UserAccessor.updatePassword(user, 'newPassword');
    Log(updatePasswordTitle);
    done();
  }, 10000);
});

const user2Password = 'password';
const user2 = new User({
  username: 'test9876543210',
  email: 'test9876543210@test.com',
});

const addUserDataBulkTitle = 'Add user data in bulk';
describe(addUserDataBulkTitle, () => {
  it('adds a user and their password to the database', async (done) => {
    await UserAccessor.addUserAndPassword(user2, user2Password);
    Log(addUserDataBulkTitle);
    done();
  }, 10000);
});

const addFollowRequestTitle = 'Add follow request';
describe(addFollowRequestTitle, () => {
  it('adds a follow request to the user\'s follow requests', async (done) => {
    await UserAccessor.addFollowRequest(user, user2);
    expect(user.followRequests).toContain(user2.username);
    Log(addFollowRequestTitle);
    done();
  }, 10000);
});

const addFollowerRequestTitle = 'Add follower request';
describe(addFollowerRequestTitle, () => {
  it('adds a follower request to the user\'s follower requests', async (done) => {
    await UserAccessor.addFollowerRequest(user, user2);
    expect(user.followerRequests).toContain(user2.username);
    Log(addFollowerRequestTitle);
    done();
  }, 10000);
});

const addFollowTitle = 'Add follow';
describe(addFollowTitle, () => {
  it('adds a follow to the user\'s follows', async (done) => {
    await UserAccessor.addFollow(user, user2);
    expect(user.follows).toContain(user2.username);
    Log(addFollowTitle);
    done();
  }, 10000);
});

const addFollowerTitle = 'Add follower';
describe(addFollowerTitle, () => {
  it('adds a follower to the user\'s followers', async (done) => {
    await UserAccessor.addFollower(user, user2);
    expect(user.followers).toContain(user2.username);
    Log(addFollowerTitle);
    done();
  }, 10000);
});

const removeFollowRequestTitle = 'Remove follow request';
describe(removeFollowRequestTitle, () => {
  it('removes a follow request from the user\'s follow requests', async (done) => {
    await UserAccessor.removeFollowRequest(user, user2);
    expect(user.followRequests).not.toContain(user2.username);
    Log(removeFollowRequestTitle);
    done();
  }, 10000);
});

const removeFollowerRequestTitle = 'Remove follower request';
describe(removeFollowerRequestTitle, () => {
  it('removes a follower request from the user\'s follower requests', async (done) => {
    await UserAccessor.removeFollowerRequest(user, user2);
    expect(user.followerRequests).not.toContain(user2.username);
    Log(removeFollowerRequestTitle);
    done();
  }, 10000);
});

const removeFollowTitle = 'Remove follow';
describe(removeFollowTitle, () => {
  it('removes a follow from the user\'s follows', async (done) => {
    await UserAccessor.removeFollow(user, user2);
    expect(user.follows).not.toContain(user2.username);
    Log(removeFollowTitle);
    done();
  }, 10000);
});

const removeFollowerTitle = 'Remove follower';
describe(removeFollowerTitle, () => {
  it('removes a follower from the user\'s followers', async (done) => {
    await UserAccessor.removeFollower(user, user2);
    expect(user.followers).not.toContain(user2.username);
    Log(removeFollowerTitle);
    done();
  }, 10000);
});

const deleteUserTitle = 'Delete user';
describe(deleteUserTitle, () => {
  it('deletes a user from the database', async (done) => {
    await UserAccessor.remove(user);
    Log(deleteUserTitle);
    done();
  }, 10000);
});

const deletePasswordTitle = 'Delete password';
describe(deletePasswordTitle, () => {
  it('deletes a password from the database', async (done) => {
    await UserAccessor.removePassword(user);
    Log(deletePasswordTitle);
    done();
  }, 10000);
});

const deleteUserDataBulkTitle = 'Delete user data in bulk';
describe(deleteUserDataBulkTitle, () => {
  it('deletes a user and their password from the database', async (done) => {
    await UserAccessor.removeUserAndPassword(user2);
    Log(deleteUserDataBulkTitle);
    done();
  }, 10000);
});
/* eslint-enable no-undef */

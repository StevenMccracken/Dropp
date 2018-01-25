const Log = require('../../logger');
const User = require('../../../app/models/User');
// const Utils = require('../../../app/utilities/utils');
const Firebase = require('../../../app/firebase/firebase');
const UserAccessor = require('../../../app/database/user');

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

const secondUser = new User({
  username: 'test9876543210',
  email: 'test9876543210@test.com',
});

const addFollowRequestTitle = 'Add follow request';
describe(addFollowRequestTitle, () => {
  it('adds a follow request to the user\'s follow requests', async (done) => {
    await UserAccessor.addFollowRequest(user, secondUser);
    expect(user.followRequests).toContain(secondUser.username);
    Log(addFollowRequestTitle);
    done();
  }, 10000);
});

const addFollowerRequestTitle = 'Add follower request';
describe(addFollowerRequestTitle, () => {
  it('adds a follower request to the user\'s follower requests', async (done) => {
    await UserAccessor.addFollowerRequest(user, secondUser);
    expect(user.followerRequests).toContain(secondUser.username);
    Log(addFollowerRequestTitle);
    done();
  }, 10000);
});

const addFollowTitle = 'Add follow';
describe(addFollowTitle, () => {
  it('adds a follow to the user\'s follows', async (done) => {
    await UserAccessor.addFollow(user, secondUser);
    expect(user.follows).toContain(secondUser.username);
    Log(addFollowTitle);
    done();
  }, 10000);
});

const addFollowerTitle = 'Add follower';
describe(addFollowerTitle, () => {
  it('adds a follower to the user\'s followers', async (done) => {
    await UserAccessor.addFollower(user, secondUser);
    expect(user.followers).toContain(secondUser.username);
    Log(addFollowerTitle);
    done();
  }, 10000);
});

const removeFollowRequestTitle = 'Remove follow request';
describe(removeFollowRequestTitle, () => {
  it('removes a follow request from the user\'s follow requests', async (done) => {
    await UserAccessor.removeFollowRequest(user, secondUser);
    expect(user.followRequests).not.toContain(secondUser.username);
    Log(removeFollowRequestTitle);
    done();
  }, 10000);
});

const removeFollowerRequestTitle = 'Remove follower request';
describe(removeFollowerRequestTitle, () => {
  it('removes a follower request from the user\'s follower requests', async (done) => {
    await UserAccessor.removeFollowerRequest(user, secondUser);
    expect(user.followerRequests).not.toContain(secondUser.username);
    Log(removeFollowerRequestTitle);
    done();
  }, 10000);
});

const removeFollowTitle = 'Remove follow';
describe(removeFollowTitle, () => {
  it('removes a follow from the user\'s follows', async (done) => {
    await UserAccessor.removeFollow(user, secondUser);
    expect(user.follows).not.toContain(secondUser.username);
    Log(removeFollowTitle);
    done();
  }, 10000);
});

const removeFollowerTitle = 'Remove follower';
describe(removeFollowerTitle, () => {
  it('removes a follower from the user\'s followers', async (done) => {
    await UserAccessor.removeFollower(user, secondUser);
    expect(user.followers).not.toContain(secondUser.username);
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
/* eslint-enable no-undef */

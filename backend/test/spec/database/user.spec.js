const Log = require('../../logger');
const User = require('../../../src/models/User');
const Utils = require('../../../src/utilities/utils');
const Firebase = require('../../../src/firebase/firebase');
const UserAccessor = require('../../../src/database/user');
const DroppError = require('../../../src/errors/DroppError');

const testName = 'User Accessor';
Firebase.start(process.env.MOCK === '1');
const getUserTitle = 'Get user';
/* eslint-disable no-undef */
describe(getUserTitle, () => {
  beforeEach(async (done) => {
    Log.beforeEach(testName, getUserTitle, true);
    this.user = new User({
      username: Utils.newUuid(),
      email: `${Utils.newUuid()}@${Utils.newUuid()}.com`,
    });

    await UserAccessor.create(this.user, Utils.newUuid());
    Log.beforeEach(testName, getUserTitle, false);
    done();
  });

  afterEach(async (done) => {
    Log.afterEach(testName, getUserTitle, true);
    await UserAccessor.remove(this.user);
    delete this.user;
    Log.afterEach(testName, getUserTitle, false);
    done();
  });

  const it1 = 'throws an error for a missing username';
  it(it1, async (done) => {
    Log.it(testName, getUserTitle, it1, true);
    try {
      const result = await UserAccessor.get(null);
      expect(result).not.toBeDefined();
      Log.log(testName, getUserTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.details.error.message).toBe('username');
      Log.log(testName, getUserTitle, error.details);
    }

    Log.it(testName, getUserTitle, it1, false);
    done();
  });

  const it2 = 'throws an error for an invalid username';
  it(it2, async (done) => {
    Log.it(testName, getUserTitle, it2, true);
    try {
      const result = await UserAccessor.get('%');
      expect(result).not.toBeDefined();
      Log.log(testName, getUserTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.details.error.message).toBe('username');
      Log.log(testName, getUserTitle, error.details);
    }

    Log.it(testName, getUserTitle, it2, false);
    done();
  });

  const it3 = 'returns null for a non-existent user';
  it(it3, async (done) => {
    Log.it(testName, getUserTitle, it3, true);
    const result = await UserAccessor.get(Utils.newUuid());
    expect(result).toBeNull();
    Log.log(testName, getUserTitle, result);
    Log.it(testName, getUserTitle, it3, false);
    done();
  });

  const it4 = 'returns a User for a valid, existing username';
  it(it4, async (done) => {
    Log.it(testName, getUserTitle, it4, true);
    const result = await UserAccessor.get(this.user.username);
    expect(result instanceof User).toBe(true);
    expect(result.email).toBe(this.user.email);
    expect(result.username).toBe(this.user.username);
    Log.log(testName, getUserTitle, result);
    Log.it(testName, getUserTitle, it4, false);
    done();
  });
});

const getPasswordTitle = 'Get password';
describe(getPasswordTitle, () => {
  beforeEach(async (done) => {
    Log.beforeEach(testName, getPasswordTitle, true);
    this.user = new User({
      username: Utils.newUuid(),
      email: `${Utils.newUuid()}@${Utils.newUuid()}.com`,
    });

    this.password = Utils.newUuid();
    await UserAccessor.create(this.user, this.password);
    Log.beforeEach(testName, getPasswordTitle, false);
    done();
  });

  afterEach(async (done) => {
    Log.afterEach(testName, getPasswordTitle, true);
    await UserAccessor.remove(this.user);
    delete this.user;
    delete this.password;
    Log.afterEach(testName, getPasswordTitle, false);
    done();
  });

  const it1 = 'throws an error for a missing username';
  it(it1, async (done) => {
    Log.it(testName, getPasswordTitle, it1, true);
    try {
      const result = await UserAccessor.getPassword(null);
      expect(result).not.toBeDefined();
      Log.log(testName, getPasswordTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.details.error.message).toBe('username');
      Log.log(testName, getPasswordTitle, error.details);
    }

    Log.it(testName, getPasswordTitle, it1, false);
    done();
  });

  const it2 = 'throws an error for an invalid username';
  it(it2, async (done) => {
    Log.it(testName, getPasswordTitle, it2, true);
    try {
      const result = await UserAccessor.getPassword('%');
      expect(result).not.toBeDefined();
      Log.log(testName, getPasswordTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.details.error.message).toBe('username');
      Log.log(testName, getPasswordTitle, error.details);
    }

    Log.it(testName, getPasswordTitle, it2, false);
    done();
  });

  const it3 = 'returns null for a non-existent user';
  it(it3, async (done) => {
    Log.it(testName, getPasswordTitle, it3, true);
    const result = await UserAccessor.getPassword(Utils.newUuid());
    expect(result).toBeNull();
    Log.log(testName, getPasswordTitle, result);
    Log.it(testName, getPasswordTitle, it3, false);
    done();
  });

  const it4 = 'returns a password for a valid, existing username';
  it(it4, async (done) => {
    Log.it(testName, getPasswordTitle, it4, true);
    const result = await UserAccessor.getPassword(this.user.username);
    expect(result).toBe(this.password);
    Log.log(testName, getPasswordTitle, result);
    Log.it(testName, getPasswordTitle, it4, false);
    done();
  });
});

const createUserTitle = 'Create user';
describe(createUserTitle, () => {
  beforeEach(() => {
    Log.beforeEach(testName, createUserTitle, true);
    this.password = Utils.newUuid();
    this.user = new User({
      username: Utils.newUuid(),
      email: `${Utils.newUuid()}@${Utils.newUuid()}.com`,
    });

    Log.beforeEach(testName, createUserTitle, false);
  });

  afterEach(() => {
    Log.afterEach(testName, createUserTitle, true);
    delete this.user;
    delete this.password;
    Log.afterEach(testName, createUserTitle, false);
  });

  const it1 = 'throws an error for an invalid user object';
  it(it1, async (done) => {
    Log.it(testName, createUserTitle, it1, true);
    try {
      await UserAccessor.create(null, this.password);
      expect(false).toBe(true);
      Log.log(testName, createUserTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.Server.type);
      expect(error.details.error.message).toBe(DroppError.type.Server.message);
      Log.log(testName, createUserTitle, error.details);
    }

    Log.it(testName, createUserTitle, it1, false);
    done();
  });

  const it2 = 'throws an error for an invalid username';
  it(it2, async (done) => {
    Log.it(testName, createUserTitle, it2, true);
    this.user.username = '%';
    try {
      await UserAccessor.create(this.user, this.password);
      expect(false).toBe(true);
      Log.log(testName, createUserTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.details.error.message).toBe('username');
      Log.log(testName, createUserTitle, error.details);
    }

    Log.it(testName, createUserTitle, it2, false);
    done();
  });

  const it3 = 'throws an error for an invalid password';
  it(it3, async (done) => {
    Log.it(testName, createUserTitle, it3, true);
    this.password = '%';
    try {
      await UserAccessor.create(this.user, this.password);
      expect(false).toBe(true);
      Log.log(testName, createUserTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.details.error.message).toBe('password');
      Log.log(testName, createUserTitle, error.details);
    }

    Log.it(testName, createUserTitle, it3, false);
    done();
  });

  const it4 = 'throws an error for an invalid email';
  it(it4, async (done) => {
    Log.it(testName, createUserTitle, it4, true);
    this.user.email = '%';
    try {
      await UserAccessor.create(this.user, this.password);
      expect(false).toBe(true);
      Log.log(testName, createUserTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.details.error.message).toBe('email');
      Log.log(testName, createUserTitle, error.details);
    }

    Log.it(testName, createUserTitle, it4, false);
    done();
  });

  const it5 = 'throws an error for 2 invalid attributes';
  it(it5, async (done) => {
    Log.it(testName, createUserTitle, it5, true);
    this.password = '%';
    this.user.username = '%';
    try {
      await UserAccessor.create(this.user, this.password);
      expect(false).toBe(true);
      Log.log(testName, createUserTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.details.error.message).toBe('username,password');
      Log.log(testName, createUserTitle, error.details);
    }

    Log.it(testName, createUserTitle, it5, false);
    done();
  });

  const it6 = 'throws an error for 3 invalid attributes';
  it(it6, async (done) => {
    Log.it(testName, createUserTitle, it6, true);
    this.password = '%';
    this.user.email = '%';
    this.user.username = '%';
    try {
      await UserAccessor.create(this.user, this.password);
      expect(false).toBe(true);
      Log.log(testName, createUserTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.details.error.message).toBe('email,username,password');
      Log.log(testName, createUserTitle, error.details);
    }

    Log.it(testName, createUserTitle, it6, false);
    done();
  });

  const successfulUserCreationTitle = 'Successful user creation';
  describe(successfulUserCreationTitle, () => {
    afterEach(async (done) => {
      Log.afterEach(testName, successfulUserCreationTitle, true);
      await UserAccessor.remove(this.user);
      Log.afterEach(testName, successfulUserCreationTitle, false);
      done();
    });

    const it7 = 'creates a user in the database for valid details';
    it(it7, async (done) => {
      Log.it(testName, createUserTitle, it7, true);
      await UserAccessor.create(this.user, this.password);
      const user = await UserAccessor.get(this.user.username);
      expect(user instanceof User).toBe(true);
      expect(user.email).toBe(this.user.email);
      expect(user.username).toBe(this.user.username);
      const password = await UserAccessor.getPassword(this.user.username);
      expect(password).toBe(this.password);
      Log.log(testName, successfulUserCreationTitle, user);
      Log.it(testName, createUserTitle, it7, false);
      done();
    });
  });
});

const updateUserAttributesTitle = 'Update user attributes';
describe(updateUserAttributesTitle, () => {
  beforeEach(async (done) => {
    Log.beforeEach(testName, updateUserAttributesTitle, true);
    this.user = new User({
      username: Utils.newUuid(),
      email: `${Utils.newUuid()}@${Utils.newUuid()}.com`,
    });

    this.password = Utils.newUuid();
    await UserAccessor.create(this.user, this.password);
    Log.beforeEach(testName, updateUserAttributesTitle, false);
    done();
  });

  afterEach(async (done) => {
    Log.afterEach(testName, updateUserAttributesTitle, true);
    await UserAccessor.remove(this.user);
    delete this.user;
    delete this.password;
    Log.afterEach(testName, updateUserAttributesTitle, false);
    done();
  });

  const updatePasswordTitle = 'Update password';
  describe(updatePasswordTitle, () => {
    const it1 = 'throws an error for an invalid user object';
    it(it1, async (done) => {
      Log.it(testName, updatePasswordTitle, it1, true);
      try {
        await UserAccessor.updatePassword(null, Utils.newUuid());
        expect(false).toBe(true);
        Log.log(testName, updatePasswordTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(testName, updatePasswordTitle, error.details);
      }

      Log.it(testName, updatePasswordTitle, it1, false);
      done();
    });

    const it2 = 'throws an error for an invalid password';
    it(it2, async (done) => {
      Log.it(testName, updatePasswordTitle, it2, true);
      try {
        await UserAccessor.updatePassword(this.user, '%');
        expect(false).toBe(true);
        Log.log(testName, updatePasswordTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('password');
        Log.log(testName, updatePasswordTitle, error.details);
      }

      Log.it(testName, updatePasswordTitle, it2, false);
      done();
    });

    const it3 = 'updates the password for a valid password';
    it(it3, async (done) => {
      Log.it(testName, updatePasswordTitle, it3, true);
      const password = Utils.newUuid();
      await UserAccessor.updatePassword(this.user, password);
      const result = await UserAccessor.getPassword(this.user.username);
      expect(result).toBe(password);
      Log.log(testName, updatePasswordTitle, result);
      Log.it(testName, updatePasswordTitle, it3, false);
      done();
    });
  });

  const updateEmailTitle = 'Update email';
  describe(updateEmailTitle, () => {
    const it4 = 'throws an error for an invalid user object';
    it(it4, async (done) => {
      Log.it(testName, updateEmailTitle, it4, true);
      try {
        await UserAccessor.updateEmail(null, 'test@test.com');
        expect(false).toBe(true);
        Log.log(testName, updateEmailTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(testName, updateEmailTitle, error.details);
      }

      Log.it(testName, updateEmailTitle, it4, false);
      done();
    });

    const it5 = 'throws an error for an invalid email';
    it(it5, async (done) => {
      Log.it(testName, updateEmailTitle, it5, true);
      try {
        await UserAccessor.updateEmail(this.user, Utils.newUuid());
        expect(false).toBe(true);
        Log.log(testName, updateEmailTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('email');
        Log.log(testName, updateEmailTitle, error.details);
      }

      Log.it(testName, updateEmailTitle, it5, false);
      done();
    });

    const it6 = 'updates the email for a valid email';
    it(it6, async (done) => {
      Log.it(testName, updateEmailTitle, it6, true);
      const email = `${Utils.newUuid()}@${Utils.newUuid()}.com`;
      await UserAccessor.updateEmail(this.user, email);
      expect(this.user.email).toBe(email);
      Log.log(testName, updateEmailTitle, this.user.email);
      Log.it(testName, updateEmailTitle, it6, false);
      done();
    });
  });
});

const interUserFunctions = 'Inter-user functions';
describe(interUserFunctions, () => {
  beforeEach(async (done) => {
    Log.beforeEach(testName, interUserFunctions, true);
    this.user1 = new User({
      username: Utils.newUuid(),
      email: `${Utils.newUuid()}@${Utils.newUuid()}.com`,
    });

    this.user2 = new User({
      username: Utils.newUuid(),
      email: `${Utils.newUuid()}@${Utils.newUuid()}.com`,
    });

    await UserAccessor.create(this.user1, Utils.newUuid());
    await UserAccessor.create(this.user2, Utils.newUuid());
    Log.beforeEach(testName, interUserFunctions, false);
    done();
  });

  afterEach(async (done) => {
    Log.afterEach(testName, interUserFunctions, true);
    await UserAccessor.remove(this.user1);
    await UserAccessor.remove(this.user2);
    delete this.user1;
    delete this.user2;
    Log.afterEach(testName, interUserFunctions, false);
    done();
  });

  const addFollowRequestTitle = 'Add follow request';
  describe(addFollowRequestTitle, () => {
    const it1 = 'throws an error for a first invalid user object';
    it(it1, async (done) => {
      Log.it(testName, addFollowRequestTitle, it1, true);
      try {
        await UserAccessor.addFollowRequest(null, this.user2);
        expect(false).toBe(true);
        Log.log(testName, addFollowRequestTitle, 'Should have thrown an error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(testName, addFollowRequestTitle, error.details);
      }

      Log.it(testName, addFollowRequestTitle, it1, false);
      done();
    });

    const it2 = 'throws an error for a second invalid user object';
    it(it2, async (done) => {
      Log.it(testName, addFollowRequestTitle, it2, true);
      try {
        await UserAccessor.addFollowRequest(this.user1, null);
        expect(false).toBe(true);
        Log.log(testName, addFollowRequestTitle, 'Should have thrown an error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(testName, addFollowRequestTitle, error.details);
      }

      Log.it(testName, addFollowRequestTitle, it2, false);
      done();
    });

    const it3 = 'adds a follow request to the user\'s follow requests';
    it(it3, async (done) => {
      Log.it(testName, addFollowRequestTitle, it3, true);
      await UserAccessor.addFollowRequest(this.user1, this.user2);
      expect(this.user1.followRequests).toContain(this.user2.username);
      expect(this.user2.followerRequests).toContain(this.user1.username);
      Log.log(testName, addFollowRequestTitle, this.user1.followRequests);
      Log.it(testName, addFollowRequestTitle, it3, false);
      done();
    });
  });

  const addFollowTitle = 'Add follow';
  describe(addFollowTitle, () => {
    const it4 = 'throws an error for a first invalid user object';
    it(it4, async (done) => {
      Log.it(testName, addFollowTitle, it4, true);
      try {
        await UserAccessor.addFollow(null, this.user2);
        expect(false).toBe(true);
        Log.log(testName, addFollowTitle, 'Should have thrown an error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(testName, addFollowTitle, error.details);
      }

      Log.it(testName, addFollowTitle, it4, false);
      done();
    });

    const it5 = 'throws an error for a second invalid user object';
    it(it5, async (done) => {
      Log.it(testName, addFollowTitle, it5, true);
      try {
        await UserAccessor.addFollow(this.user1, null);
        expect(false).toBe(true);
        Log.log(testName, addFollowTitle, 'Should have thrown an error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(testName, addFollowTitle, error.details);
      }

      Log.it(testName, addFollowTitle, it5, false);
      done();
    });

    const addFollowSuccessTitle = 'Add follow success';
    describe(addFollowSuccessTitle, () => {
      beforeEach(() => {
        Log.beforeEach(testName, addFollowSuccessTitle, true);
        this.user1.followRequests.push(this.user2.username);
        this.user2.followerRequests.push(this.user1.username);
        Log.beforeEach(testName, addFollowSuccessTitle, false);
      });

      const it6 = 'adds a follow to the user\'s follows';
      it(it6, async (done) => {
        Log.it(testName, addFollowSuccessTitle, it6, true);
        await UserAccessor.addFollow(this.user1, this.user2);
        expect(this.user1.follows).toContain(this.user2.username);
        expect(this.user2.followers).toContain(this.user1.username);
        Log.log(testName, addFollowSuccessTitle, this.user1.follows);
        Log.it(testName, addFollowSuccessTitle, it6, false);
        done();
      });
    });
  });

  const removeFollowRequestTitle = 'Remove follow request';
  describe(removeFollowRequestTitle, () => {
    const it1 = 'throws an error for a first invalid user object';
    it(it1, async (done) => {
      Log.it(testName, removeFollowRequestTitle, it1, true);
      try {
        await UserAccessor.removeFollowRequest(null, this.user2);
        expect(false).toBe(true);
        Log.log(testName, removeFollowRequestTitle, 'Should have thrown an error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(testName, removeFollowRequestTitle, error.details);
      }

      Log.it(testName, removeFollowRequestTitle, it1, false);
      done();
    });

    const it2 = 'throws an error for a second invalid user object';
    it(it2, async (done) => {
      Log.it(testName, removeFollowRequestTitle, it2, true);
      try {
        await UserAccessor.removeFollowRequest(this.user1, null);
        expect(false).toBe(true);
        Log.log(testName, removeFollowRequestTitle, 'Should have thrown an error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(testName, removeFollowRequestTitle, error.details);
      }

      Log.it(testName, removeFollowRequestTitle, it2, false);
      done();
    });

    const successRemoveFollowRequestTitle = 'Success remove follow request';
    describe(successRemoveFollowRequestTitle, () => {
      beforeEach(() => {
        Log.beforeEach(testName, successRemoveFollowRequestTitle, true);
        this.user1.followRequests.push(this.user2.username);
        this.user2.followerRequests.push(this.user1.username);
        Log.beforeEach(testName, successRemoveFollowRequestTitle, false);
      });

      const it3 = 'removes a follow request from the user\'s follow requests';
      it(it3, async (done) => {
        Log.it(testName, successRemoveFollowRequestTitle, it3, true);
        await UserAccessor.removeFollowRequest(this.user1, this.user2);
        expect(this.user1.followRequests).not.toContain(this.user2.username);
        expect(this.user2.followerRequests).not.toContain(this.user1.username);
        Log.log(testName, successRemoveFollowRequestTitle, this.user1.followRequests);
        Log.it(testName, successRemoveFollowRequestTitle, it3, false);
        done();
      });
    });
  });

  const removeFollowTitle = 'Remove follow';
  describe(removeFollowTitle, () => {
    const it1 = 'throws an error for a first invalid user object';
    it(it1, async (done) => {
      Log.it(testName, removeFollowTitle, it1, true);
      try {
        await UserAccessor.removeFollow(null, this.user2);
        expect(false).toBe(true);
        Log.log(testName, removeFollowTitle, 'Should have thrown an error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(testName, removeFollowTitle, error.details);
      }

      Log.it(testName, removeFollowTitle, it1, false);
      done();
    });

    const it2 = 'throws an error for a second invalid user object';
    it(it2, async (done) => {
      Log.it(testName, removeFollowTitle, it2, true);
      try {
        await UserAccessor.removeFollow(this.user1, null);
        expect(false).toBe(true);
        Log.log(testName, removeFollowTitle, 'Should have thrown an error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(testName, removeFollowTitle, error.details);
      }

      Log.it(testName, removeFollowTitle, it2, false);
      done();
    });

    const successRemoveFollowTitle = 'Success remove follow';
    describe(successRemoveFollowTitle, () => {
      beforeEach(() => {
        Log.beforeEach(testName, successRemoveFollowTitle, true);
        this.user1.follows.push(this.user2.username);
        this.user2.followers.push(this.user1.username);
        Log.beforeEach(testName, successRemoveFollowTitle, false);
      });

      const it3 = 'removes a follow from the user\'s follows';
      it(it3, async (done) => {
        Log.it(testName, successRemoveFollowTitle, it3, true);
        await UserAccessor.removeFollow(this.user1, this.user2);
        expect(this.user1.follows).not.toContain(this.user2.username);
        expect(this.user2.followers).not.toContain(this.user1.username);
        Log.log(testName, successRemoveFollowTitle, this.user1.follows);
        Log.it(testName, successRemoveFollowTitle, it3, false);
        done();
      });
    });
  });
});

const removeUserTitle = 'Remove user';
describe(removeUserTitle, () => {
  beforeEach(async (done) => {
    Log.beforeEach(testName, removeUserTitle, true);
    this.user = new User({
      username: Utils.newUuid(),
      email: `${Utils.newUuid()}@${Utils.newUuid()}.com`,
    });

    await UserAccessor.create(this.user, Utils.newUuid());
    Log.beforeEach(testName, removeUserTitle, false);
    done();
  });

  afterEach(async (done) => {
    Log.afterEach(testName, removeUserTitle, true);
    if (Utils.hasValue(this.user)) await UserAccessor.remove(this.user);
    delete this.user;
    Log.afterEach(testName, removeUserTitle, false);
    done();
  });

  const it1 = 'throws an error for an invalid user object';
  it(it1, async (done) => {
    Log.it(testName, removeUserTitle, it1, true);
    try {
      await UserAccessor.remove(null);
      expect(false).toBe(true);
      Log.log(testName, removeUserTitle, 'Should have thrown an error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.Server.type);
      expect(error.details.error.message).toBe(DroppError.type.Server.message);
      Log.log(testName, removeUserTitle, error.details);
    }

    Log.it(testName, removeUserTitle, it1, false);
    done();
  });

  const it2 = 'removes a user from the database';
  it(it2, async (done) => {
    Log.it(testName, removeUserTitle, it2, true);
    await UserAccessor.remove(this.user);
    const result = await UserAccessor.get(this.user.username);
    expect(result).toBeNull();
    Log.it(testName, removeUserTitle, it2, false);
    done();
  });
});

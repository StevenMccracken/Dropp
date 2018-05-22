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
    this.user = new User({
      username: Utils.newUuid(),
      email: `${Utils.newUuid()}@${Utils.newUuid()}.com`,
    });

    await UserAccessor.create(this.user, Utils.newUuid());
    done();
  });

  afterEach(async (done) => {
    await UserAccessor.remove(this.user);
    delete this.user;
    done();
  });

  it('throws an error for a missing username', async (done) => {
    try {
      const result = await UserAccessor.get(null);
      expect(result).not.toBeDefined();
      Log(testName, getUserTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.details.error.message).toBe('username');
      Log(testName, getUserTitle, error.details);
    }

    done();
  });

  it('throws an error for an invalid username', async (done) => {
    try {
      const result = await UserAccessor.get('%');
      expect(result).not.toBeDefined();
      Log(testName, getUserTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.details.error.message).toBe('username');
      Log(testName, getUserTitle, error.details);
    }

    done();
  });

  it('returns null for a non-existent user', async (done) => {
    const result = await UserAccessor.get(Utils.newUuid());
    expect(result).toBeNull();
    Log(testName, getUserTitle, result);
    done();
  });

  it('returns a User for a valid, existing username', async (done) => {
    const result = await UserAccessor.get(this.user.username);
    expect(result instanceof User).toBe(true);
    expect(result.email).toBe(this.user.email);
    expect(result.username).toBe(this.user.username);
    Log(testName, getUserTitle, result);
    done();
  });
});

const getPasswordTitle = 'Get password';
describe(getPasswordTitle, () => {
  beforeEach(async (done) => {
    this.user = new User({
      username: Utils.newUuid(),
      email: `${Utils.newUuid()}@${Utils.newUuid()}.com`,
    });

    this.password = Utils.newUuid();
    await UserAccessor.create(this.user, this.password);
    done();
  });

  afterEach(async (done) => {
    await UserAccessor.remove(this.user);
    delete this.user;
    delete this.password;
    done();
  });

  it('throws an error for a missing username', async (done) => {
    try {
      const result = await UserAccessor.getPassword(null);
      expect(result).not.toBeDefined();
      Log(testName, getPasswordTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.details.error.message).toBe('username');
      Log(testName, getPasswordTitle, error.details);
    }

    done();
  });

  it('throws an error for an invalid username', async (done) => {
    try {
      const result = await UserAccessor.getPassword('%');
      expect(result).not.toBeDefined();
      Log(testName, getPasswordTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.details.error.message).toBe('username');
      Log(testName, getPasswordTitle, error.details);
    }

    done();
  });

  it('returns null for a non-existent user', async (done) => {
    const result = await UserAccessor.getPassword(Utils.newUuid());
    expect(result).toBeNull();
    Log(testName, getPasswordTitle, result);
    done();
  });

  it('returns a password for a valid, existing username', async (done) => {
    const result = await UserAccessor.getPassword(this.user.username);
    expect(result).toBe(this.password);
    Log(testName, getPasswordTitle, result);
    done();
  });
});

const createUserTitle = 'Create user';
describe(createUserTitle, () => {
  beforeEach(() => {
    this.password = Utils.newUuid();
    this.user = new User({
      username: Utils.newUuid(),
      email: `${Utils.newUuid()}@${Utils.newUuid()}.com`,
    });
  });

  afterEach(() => {
    delete this.user;
    delete this.password;
  });

  it('throws an error for an invalid user object', async (done) => {
    try {
      await UserAccessor.create(null, this.password);
      expect(false).toBe(true);
      Log(testName, createUserTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.Server.type);
      expect(error.details.error.message).toBe(DroppError.type.Server.message);
      Log(testName, createUserTitle, error.details);
    }

    done();
  });

  it('throws an error for an invalid username', async (done) => {
    this.user.username = '%';
    try {
      await UserAccessor.create(this.user, this.password);
      expect(false).toBe(true);
      Log(testName, createUserTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.details.error.message).toBe('username');
      Log(testName, createUserTitle, error.details);
    }

    done();
  });

  it('throws an error for an invalid password', async (done) => {
    this.password = '%';
    try {
      await UserAccessor.create(this.user, this.password);
      expect(false).toBe(true);
      Log(testName, createUserTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.details.error.message).toBe('password');
      Log(testName, createUserTitle, error.details);
    }

    done();
  });

  it('throws an error for an invalid email', async (done) => {
    this.user.email = '%';
    try {
      await UserAccessor.create(this.user, this.password);
      expect(false).toBe(true);
      Log(testName, createUserTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.details.error.message).toBe('email');
      Log(testName, createUserTitle, error.details);
    }

    done();
  });

  it('throws an error for 2 invalid attributes', async (done) => {
    this.password = '%';
    this.user.username = '%';
    try {
      await UserAccessor.create(this.user, this.password);
      expect(false).toBe(true);
      Log(testName, createUserTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.details.error.message).toBe('username,password');
      Log(testName, createUserTitle, error.details);
    }

    done();
  });

  it('throws an error for 3 invalid attributes', async (done) => {
    this.password = '%';
    this.user.email = '%';
    this.user.username = '%';
    try {
      await UserAccessor.create(this.user, this.password);
      expect(false).toBe(true);
      Log(testName, createUserTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.details.error.message).toBe('email,username,password');
      Log(testName, createUserTitle, error.details);
    }

    done();
  });

  const successfulUserCreationTitle = 'Successful user creation';
  describe(successfulUserCreationTitle, () => {
    afterEach(async (done) => {
      await UserAccessor.remove(this.user);
      done();
    });

    it('creates a user in the database for valid details', async (done) => {
      await UserAccessor.create(this.user, this.password);
      const user = await UserAccessor.get(this.user.username);
      expect(user instanceof User).toBe(true);
      expect(user.email).toBe(this.user.email);
      expect(user.username).toBe(this.user.username);
      const password = await UserAccessor.getPassword(this.user.username);
      expect(password).toBe(this.password);
      Log(testName, successfulUserCreationTitle, user);
      done();
    });
  });
});

const updateUserAttributesTitle = 'Update user attributes';
describe(updateUserAttributesTitle, () => {
  beforeEach(async (done) => {
    this.user = new User({
      username: Utils.newUuid(),
      email: `${Utils.newUuid()}@${Utils.newUuid()}.com`,
    });

    this.password = Utils.newUuid();
    await UserAccessor.create(this.user, this.password);
    done();
  });

  afterEach(async (done) => {
    await UserAccessor.remove(this.user);
    delete this.user;
    delete this.password;
    done();
  });

  const updatePasswordTitle = 'Update password';
  describe(updatePasswordTitle, () => {
    it('throws an error for an invalid user object', async (done) => {
      try {
        await UserAccessor.updatePassword(null, Utils.newUuid());
        expect(false).toBe(true);
        Log(testName, updatePasswordTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log(testName, updatePasswordTitle, error.details);
      }

      done();
    });

    it('throws an error for an invalid password', async (done) => {
      try {
        await UserAccessor.updatePassword(this.user, '%');
        expect(false).toBe(true);
        Log(testName, updatePasswordTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('password');
        Log(testName, updatePasswordTitle, error.details);
      }

      done();
    });

    it('updates the password for a valid password', async (done) => {
      const password = Utils.newUuid();
      await UserAccessor.updatePassword(this.user, password);
      const result = await UserAccessor.getPassword(this.user.username);
      expect(result).toBe(password);
      Log(testName, updatePasswordTitle, result);
      done();
    });
  });

  const updateEmailTitle = 'Update email';
  describe(updateEmailTitle, () => {
    it('throws an error for an invalid user object', async (done) => {
      try {
        await UserAccessor.updateEmail(null, 'test@test.com');
        expect(false).toBe(true);
        Log(testName, updateEmailTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log(testName, updateEmailTitle, error.details);
      }

      done();
    });

    it('throws an error for an invalid email', async (done) => {
      try {
        await UserAccessor.updateEmail(this.user, Utils.newUuid());
        expect(false).toBe(true);
        Log(testName, updateEmailTitle, 'Should have thrown error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe('email');
        Log(testName, updateEmailTitle, error.details);
      }

      done();
    });

    it('updates the email for a valid email', async (done) => {
      const email = `${Utils.newUuid()}@${Utils.newUuid()}.com`;
      await UserAccessor.updateEmail(this.user, email);
      expect(this.user.email).toBe(email);
      Log(testName, updateEmailTitle, this.user.email);
      done();
    });
  });
});

const interUserFunctions = 'Inter-user functions';
describe(interUserFunctions, () => {
  beforeEach(async (done) => {
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
    done();
  });

  afterEach(async (done) => {
    await UserAccessor.remove(this.user1);
    await UserAccessor.remove(this.user2);
    delete this.user1;
    delete this.user2;
    done();
  });

  const addFollowRequestTitle = 'Add follow request';
  describe(addFollowRequestTitle, () => {
    it('throws an error for a first invalid user object', async (done) => {
      try {
        await UserAccessor.addFollowRequest(null, this.user2);
        expect(false).toBe(true);
        Log(testName, addFollowRequestTitle, 'Should have thrown an error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log(testName, addFollowRequestTitle, error.details);
      }

      done();
    });

    it('throws an error for a second invalid user object', async (done) => {
      try {
        await UserAccessor.addFollowRequest(this.user1, null);
        expect(false).toBe(true);
        Log(testName, addFollowRequestTitle, 'Should have thrown an error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log(testName, addFollowRequestTitle, error.details);
      }

      done();
    });

    it('adds a follow request to the user\'s follow requests', async (done) => {
      await UserAccessor.addFollowRequest(this.user1, this.user2);
      expect(this.user1.followRequests).toContain(this.user2.username);
      expect(this.user2.followerRequests).toContain(this.user1.username);
      Log(testName, addFollowRequestTitle, this.user1.followRequests);
      done();
    });
  });

  const addFollowTitle = 'Add follow';
  describe(addFollowTitle, () => {
    it('throws an error for a first invalid user object', async (done) => {
      try {
        await UserAccessor.addFollow(null, this.user2);
        expect(false).toBe(true);
        Log(testName, addFollowTitle, 'Should have thrown an error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log(testName, addFollowTitle, error.details);
      }

      done();
    });

    it('throws an error for a second invalid user object', async (done) => {
      try {
        await UserAccessor.addFollow(this.user1, null);
        expect(false).toBe(true);
        Log(testName, addFollowTitle, 'Should have thrown an error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log(testName, addFollowTitle, error.details);
      }

      done();
    });

    const addFollowSuccessTitle = 'Add follow success';
    describe(addFollowSuccessTitle, () => {
      beforeEach(() => {
        this.user1.followRequests.push(this.user2.username);
        this.user2.followerRequests.push(this.user1.username);
      });

      it('adds a follow to the user\'s follows', async (done) => {
        await UserAccessor.addFollow(this.user1, this.user2);
        expect(this.user1.follows).toContain(this.user2.username);
        expect(this.user2.followers).toContain(this.user1.username);
        Log(testName, addFollowSuccessTitle, this.user1.follows);
        done();
      });
    });
  });

  const removeFollowRequestTitle = 'Remove follow request';
  describe(removeFollowRequestTitle, () => {
    it('throws an error for a first invalid user object', async (done) => {
      try {
        await UserAccessor.removeFollowRequest(null, this.user2);
        expect(false).toBe(true);
        Log(testName, removeFollowRequestTitle, 'Should have thrown an error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log(testName, removeFollowRequestTitle, error.details);
      }

      done();
    });

    it('throws an error for a second invalid user object', async (done) => {
      try {
        await UserAccessor.removeFollowRequest(this.user1, null);
        expect(false).toBe(true);
        Log(testName, removeFollowRequestTitle, 'Should have thrown an error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log(testName, removeFollowRequestTitle, error.details);
      }

      done();
    });

    const successRemoveFollowRequestTitle = 'Success remove follow request';
    describe(successRemoveFollowRequestTitle, () => {
      beforeEach(() => {
        this.user1.followRequests.push(this.user2.username);
        this.user2.followerRequests.push(this.user1.username);
      });

      it('removes a follow request from the user\'s follow requests', async (done) => {
        await UserAccessor.removeFollowRequest(this.user1, this.user2);
        expect(this.user1.followRequests).not.toContain(this.user2.username);
        expect(this.user2.followerRequests).not.toContain(this.user1.username);
        Log(testName, successRemoveFollowRequestTitle, this.user1.followRequests);
        done();
      });
    });
  });

  const removeFollowTitle = 'Remove follow';
  describe(removeFollowTitle, () => {
    it('throws an error for a first invalid user object', async (done) => {
      try {
        await UserAccessor.removeFollow(null, this.user2);
        expect(false).toBe(true);
        Log(testName, removeFollowTitle, 'Should have thrown an error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log(testName, removeFollowTitle, error.details);
      }

      done();
    });

    it('throws an error for a second invalid user object', async (done) => {
      try {
        await UserAccessor.removeFollow(this.user1, null);
        expect(false).toBe(true);
        Log(testName, removeFollowTitle, 'Should have thrown an error');
      } catch (error) {
        expect(error.name).toBe('DroppError');
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log(testName, removeFollowTitle, error.details);
      }

      done();
    });

    const successRemoveFollowTitle = 'Success remove follow';
    describe(successRemoveFollowTitle, () => {
      beforeEach(() => {
        this.user1.follows.push(this.user2.username);
        this.user2.followers.push(this.user1.username);
      });

      it('removes a follow from the user\'s follows', async (done) => {
        await UserAccessor.removeFollow(this.user1, this.user2);
        expect(this.user1.follows).not.toContain(this.user2.username);
        expect(this.user2.followers).not.toContain(this.user1.username);
        Log(testName, successRemoveFollowTitle, this.user1.follows);
        done();
      });
    });
  });
});

const removeUserTitle = 'Remove user';
describe(removeUserTitle, () => {
  beforeEach(async (done) => {
    this.user = new User({
      username: Utils.newUuid(),
      email: `${Utils.newUuid()}@${Utils.newUuid()}.com`,
    });

    await UserAccessor.create(this.user, Utils.newUuid());
    done();
  });

  afterEach(async (done) => {
    if (Utils.hasValue(this.user)) await UserAccessor.remove(this.user);
    delete this.user;
    done();
  });

  it('throws an error for an invalid user object', async (done) => {
    try {
      await UserAccessor.remove(null);
      expect(false).toBe(true);
      Log(testName, removeUserTitle, 'Should have thrown an error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.Server.type);
      expect(error.details.error.message).toBe(DroppError.type.Server.message);
      Log(testName, removeUserTitle, error.details);
    }

    done();
  });

  it('removes a user from the database', async (done) => {
    await UserAccessor.remove(this.user);
    const result = await UserAccessor.get(this.user.username);
    expect(result).toBeNull();
    done();
  });
});

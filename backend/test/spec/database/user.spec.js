const Log = require('../../logger');
const User = require('../../../src/models/User');
const Utils = require('../../../src/utilities/utils');
const Firebase = require('../../../src/firebase/firebase');
const UserAccessor = require('../../../src/database/user');
const DroppError = require('../../../src/errors/DroppError');

/**
 * Logs a message for a User Middleware test
 * @param {String} _title the describe label
 * @param {String|Object} _details the log details
 */
function log(_title, _details) {
  Log(`User Accessor ${_title}`, _details);
}

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
      Log(getUserTitle, 'Should have thrown error');
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.name).toBe('DroppError');
      expect(error.details).toBeDefined();
      expect(error.details.error).toBeDefined();
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.details.error.message).toBeDefined();
      expect(typeof error.details.error.message).toBe('string');

      const invalidParameters = error.details.error.message.split(',');
      expect(invalidParameters.length).toBe(1);
      expect(invalidParameters[0]).toBe('username');
      log(getUserTitle, error.details);
    }

    done();
  });

  it('throws an error for an invalid username', async (done) => {
    try {
      const result = await UserAccessor.get('%');
      expect(result).not.toBeDefined();
      Log(getUserTitle, 'Should have thrown error');
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.name).toBe('DroppError');
      expect(error.details).toBeDefined();
      expect(error.details.error).toBeDefined();
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.details.error.message).toBeDefined();
      expect(typeof error.details.error.message).toBe('string');

      const invalidParameters = error.details.error.message.split(',');
      expect(invalidParameters.length).toBe(1);
      expect(invalidParameters[0]).toBe('username');
      log(getUserTitle, error.details);
    }

    done();
  });

  it('returns null for a non-existent user', async (done) => {
    const result = await UserAccessor.get(Utils.newUuid());
    expect(result).toBe(null);
    Log(getUserTitle, result);
    done();
  });

  it('returns a User for a valid, existing username', async (done) => {
    const result = await UserAccessor.get(this.user.username);
    expect(result).not.toBe(null);
    expect(result instanceof User).toBe(true);
    expect(result.email).toBe(this.user.email);
    expect(result.username).toBe(this.user.username);
    Log(getUserTitle, result);
    done();
  });
});

const getPasswordTitle = 'Get password';
/* eslint-disable no-undef */
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
      Log(getPasswordTitle, 'Should have thrown error');
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.name).toBe('DroppError');
      expect(error.details).toBeDefined();
      expect(error.details.error).toBeDefined();
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.details.error.message).toBeDefined();
      expect(typeof error.details.error.message).toBe('string');

      const invalidParameters = error.details.error.message.split(',');
      expect(invalidParameters.length).toBe(1);
      expect(invalidParameters[0]).toBe('username');
      log(getPasswordTitle, error.details);
    }

    done();
  });

  it('throws an error for an invalid username', async (done) => {
    try {
      const result = await UserAccessor.getPassword('%');
      expect(result).not.toBeDefined();
      Log(getPasswordTitle, 'Should have thrown error');
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.name).toBe('DroppError');
      expect(error.details).toBeDefined();
      expect(error.details.error).toBeDefined();
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.details.error.message).toBeDefined();
      expect(typeof error.details.error.message).toBe('string');

      const invalidParameters = error.details.error.message.split(',');
      expect(invalidParameters.length).toBe(1);
      expect(invalidParameters[0]).toBe('username');
      log(getPasswordTitle, error.details);
    }

    done();
  });

  it('returns null for a non-existent user', async (done) => {
    const result = await UserAccessor.getPassword(Utils.newUuid());
    expect(result).toBe(null);
    Log(getPasswordTitle, result);
    done();
  });

  it('returns a password for a valid, existing username', async (done) => {
    const result = await UserAccessor.getPassword(this.user.username);
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
    expect(result).toBe(this.password);
    Log(getPasswordTitle, result);
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
      Log(createUserTitle, 'Should have thrown error');
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.name).toBe('DroppError');
      expect(error.details).toBeDefined();
      expect(error.details.error).toBeDefined();
      expect(error.details.error.type).toBe(DroppError.type.Server.type);
      expect(error.details.error.message).toBeDefined();
      expect(error.details.error.message).toBe(DroppError.type.Server.message);
      log(createUserTitle, error.details);
    }

    done();
  });

  it('throws an error for an invalid username', async (done) => {
    try {
      this.user.username = '%';
      await UserAccessor.create(this.user, this.password);
      expect(false).toBe(true);
      log(createUserTitle, 'Should have thrown error');
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.name).toBe('DroppError');
      expect(error.details).toBeDefined();
      expect(error.details.error).toBeDefined();
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.details.error.message).toBeDefined();
      expect(typeof error.details.error.message).toBe('string');

      const invalidParameters = error.details.error.message.split(',');
      expect(invalidParameters.length).toBe(1);
      expect(invalidParameters[0]).toBe('username');
      log(createUserTitle, error.details);
    }

    done();
  });

  it('throws an error for an invalid password', async (done) => {
    try {
      this.password = '%';
      await UserAccessor.create(this.user, this.password);
      expect(false).toBe(true);
      log(createUserTitle, 'Should have thrown error');
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.name).toBe('DroppError');
      expect(error.details).toBeDefined();
      expect(error.details.error).toBeDefined();
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.details.error.message).toBeDefined();
      expect(typeof error.details.error.message).toBe('string');

      const invalidParameters = error.details.error.message.split(',');
      expect(invalidParameters.length).toBe(1);
      expect(invalidParameters[0]).toBe('password');
      log(createUserTitle, error.details);
    }

    done();
  });

  it('throws an error for an invalid email', async (done) => {
    try {
      this.user.email = '%';
      await UserAccessor.create(this.user, this.password);
      expect(false).toBe(true);
      log(createUserTitle, 'Should have thrown error');
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.name).toBe('DroppError');
      expect(error.details).toBeDefined();
      expect(error.details.error).toBeDefined();
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.details.error.message).toBeDefined();
      expect(typeof error.details.error.message).toBe('string');

      const invalidParameters = error.details.error.message.split(',');
      expect(invalidParameters.length).toBe(1);
      expect(invalidParameters[0]).toBe('email');
      log(createUserTitle, error.details);
    }

    done();
  });

  it('throws an error for 2 invalid attributes', async (done) => {
    try {
      this.password = '%';
      this.user.username = '%';
      await UserAccessor.create(this.user, this.password);
      expect(false).toBe(true);
      log(createUserTitle, 'Should have thrown error');
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.name).toBe('DroppError');
      expect(error.details).toBeDefined();
      expect(error.details.error).toBeDefined();
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.details.error.message).toBeDefined();
      expect(typeof error.details.error.message).toBe('string');

      const invalidParameters = error.details.error.message.split(',');
      expect(invalidParameters.length).toBe(2);
      expect(invalidParameters.includes('username')).toBe(true);
      expect(invalidParameters.includes('password')).toBe(true);
      log(createUserTitle, error.details);
    }

    done();
  });

  it('throws an error for 3 invalid attributes', async (done) => {
    try {
      this.password = '%';
      this.user.email = '%';
      this.user.username = '%';
      await UserAccessor.create(this.user, this.password);
      expect(false).toBe(true);
      log(createUserTitle, 'Should have thrown error');
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.name).toBe('DroppError');
      expect(error.details).toBeDefined();
      expect(error.details.error).toBeDefined();
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.details.error.message).toBeDefined();
      expect(typeof error.details.error.message).toBe('string');

      const invalidParameters = error.details.error.message.split(',');
      expect(invalidParameters.length).toBe(3);
      expect(invalidParameters.includes('email')).toBe(true);
      expect(invalidParameters.includes('username')).toBe(true);
      expect(invalidParameters.includes('password')).toBe(true);
      log(createUserTitle, error.details);
    }

    done();
  });

  describe('Successful user creation', () => {
    afterEach(async (done) => {
      await UserAccessor.remove(this.user);
      done();
    });
  });

  it('creates a user in the database for valid details', async (done) => {
    await UserAccessor.create(this.user, this.password);
    const user = await UserAccessor.get(this.user.username);
    expect(user).not.toBe(null);
    expect(user instanceof User).toBe(true);
    expect(user.email).toBe(this.user.email);
    expect(user.username).toBe(this.user.username);

    const password = await UserAccessor.getPassword(this.user.username);
    expect(password).toBeDefined();
    expect(typeof password).toBe('string');
    expect(password).toBe(this.password);

    Log(createUserTitle, { user, password });
    done();
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
        Log(updatePasswordTitle, 'Should have thrown error');
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.name).toBe('DroppError');
        expect(error.details).toBeDefined();
        expect(error.details.error).toBeDefined();
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBeDefined();
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        log(updatePasswordTitle, error.details);
      }

      done();
    });

    it('throws an error for an invalid password', async (done) => {
      try {
        await UserAccessor.updatePassword(this.user, '%');
        expect(false).toBe(true);
        log(updatePasswordTitle, 'Should have thrown error');
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.name).toBe('DroppError');
        expect(error.details).toBeDefined();
        expect(error.details.error).toBeDefined();
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBeDefined();
        expect(typeof error.details.error.message).toBe('string');

        const invalidParameters = error.details.error.message.split(',');
        expect(invalidParameters.length).toBe(1);
        expect(invalidParameters[0]).toBe('password');
        log(updatePasswordTitle, error.details);
      }

      done();
    });

    it('updates the password for a valid password', async (done) => {
      const password = Utils.newUuid();
      await UserAccessor.updatePassword(this.user, password);
      const result = await UserAccessor.getPassword(this.user.username);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toBe(password);
      Log(updatePasswordTitle, result);
      done();
    });
  });

  const updateEmailTitle = 'Update email';
  describe(updateEmailTitle, () => {
    it('throws an error for an invalid user object', async (done) => {
      try {
        await UserAccessor.updateEmail(null, 'test@test.com');
        expect(false).toBe(true);
        Log(updateEmailTitle, 'Should have thrown error');
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.name).toBe('DroppError');
        expect(error.details).toBeDefined();
        expect(error.details.error).toBeDefined();
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBeDefined();
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        log(updateEmailTitle, error.details);
      }

      done();
    });

    it('throws an error for an invalid email', async (done) => {
      try {
        await UserAccessor.updateEmail(this.user, Utils.newUuid());
        expect(false).toBe(true);
        log(updateEmailTitle, 'Should have thrown error');
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.name).toBe('DroppError');
        expect(error.details).toBeDefined();
        expect(error.details.error).toBeDefined();
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBeDefined();
        expect(typeof error.details.error.message).toBe('string');

        const invalidParameters = error.details.error.message.split(',');
        expect(invalidParameters.length).toBe(1);
        expect(invalidParameters[0]).toBe('email');
        log(updateEmailTitle, error.details);
      }

      done();
    });

    it('updates the email for a valid email', async (done) => {
      const email = `${Utils.newUuid()}@${Utils.newUuid()}.com`;
      await UserAccessor.updateEmail(this.user, email);
      expect(this.user.email).toBe(email);
      Log(updateEmailTitle, this.user.email);
      done();
    });
  });
});

const user1 = new User({
  username: 'test0123456789',
  email: 'test0123456789@test.com',
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

let retrievedUser;
const getUserTitle2 = 'Get user';
describe(getUserTitle2, () => {
  it('retrieves a user from the database', async (done) => {
    retrievedUser = await UserAccessor.get(user1.username);
    expect(retrievedUser).toBeDefined();
    expect(retrievedUser.username).toBe(user1.username);
    expect(retrievedUser.email).toBe(user1.email);
    expect(Array.isArray(retrievedUser.follows)).toBe(true);
    expect(Array.isArray(retrievedUser.followers)).toBe(true);
    expect(Array.isArray(retrievedUser.followRequests)).toBe(true);
    expect(Array.isArray(retrievedUser.followerRequests)).toBe(true);
    Log(getUserTitle2, `Retrieving user ${user1.username} returned ${retrievedUser.username}`);
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

const Log = require('../../logger');
const User = require('../../../src/models/User');
const TestConstants = require('../../constants');
const Utils = require('../../../src/utilities/utils');
const Firebase = require('../../../src/firebase/firebase');
const UserAccessor = require('../../../src/database/user');
const DroppError = require('../../../src/errors/DroppError');
const Constants = require('../../../src/utilities/constants');

Firebase.start(process.env.MOCK === '1');
const getUserTitle = 'Get user';
/* eslint-disable no-undef */
describe(getUserTitle, () => {
  beforeEach(async (done) => {
    Log.beforeEach(TestConstants.database.user.testName, getUserTitle, true);
    this.user = new User({
      username: Utils.newUuid(),
      email: TestConstants.params.uuidEmail(),
    });

    await UserAccessor.create(this.user, Utils.newUuid());
    Log.beforeEach(TestConstants.database.user.testName, getUserTitle, false);
    done();
  });

  afterEach(async (done) => {
    Log.afterEach(TestConstants.database.user.testName, getUserTitle, true);
    await UserAccessor.remove(this.user);
    delete this.user;
    Log.afterEach(TestConstants.database.user.testName, getUserTitle, false);
    done();
  });

  const it1 = 'throws an error for a missing username';
  it(it1, async (done) => {
    Log.it(TestConstants.database.user.testName, getUserTitle, it1, true);
    try {
      const result = await UserAccessor.get(null);
      expect(result).not.toBeDefined();
      Log.log(
        TestConstants.database.user.testName,
        getUserTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (error) {
      expect(error.name).toBe(Constants.errors.dropp.name);
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.details.error.message).toBe(Constants.params.username);
      Log.log(TestConstants.database.user.testName, getUserTitle, error.details);
    }

    Log.it(TestConstants.database.user.testName, getUserTitle, it1, false);
    done();
  });

  const it2 = 'throws an error for an invalid username';
  it(it2, async (done) => {
    Log.it(TestConstants.database.user.testName, getUserTitle, it2, true);
    try {
      const result = await UserAccessor.get(TestConstants.params.invalidChars.percent);
      expect(result).not.toBeDefined();
      Log.log(
        TestConstants.database.user.testName,
        getUserTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (error) {
      expect(error.name).toBe(Constants.errors.dropp.name);
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.details.error.message).toBe(Constants.params.username);
      Log.log(TestConstants.database.user.testName, getUserTitle, error.details);
    }

    Log.it(TestConstants.database.user.testName, getUserTitle, it2, false);
    done();
  });

  const it3 = 'returns null for a non-existent user';
  it(it3, async (done) => {
    Log.it(TestConstants.database.user.testName, getUserTitle, it3, true);
    const result = await UserAccessor.get(Utils.newUuid());
    expect(result).toBeNull();
    Log.log(TestConstants.database.user.testName, getUserTitle, result);
    Log.it(TestConstants.database.user.testName, getUserTitle, it3, false);
    done();
  });

  const it4 = 'returns a User for a valid, existing username';
  it(it4, async (done) => {
    Log.it(TestConstants.database.user.testName, getUserTitle, it4, true);
    const result = await UserAccessor.get(this.user.username);
    expect(result instanceof User).toBe(true);
    expect(result.email).toBe(this.user.email);
    expect(result.username).toBe(this.user.username);
    Log.log(TestConstants.database.user.testName, getUserTitle, result);
    Log.it(TestConstants.database.user.testName, getUserTitle, it4, false);
    done();
  });
});

const getPasswordTitle = 'Get password';
describe(getPasswordTitle, () => {
  beforeEach(async (done) => {
    Log.beforeEach(TestConstants.database.user.testName, getPasswordTitle, true);
    this.user = new User({
      username: Utils.newUuid(),
      email: TestConstants.params.uuidEmail(),
    });

    this.password = Utils.newUuid();
    await UserAccessor.create(this.user, this.password);
    Log.beforeEach(TestConstants.database.user.testName, getPasswordTitle, false);
    done();
  });

  afterEach(async (done) => {
    Log.afterEach(TestConstants.database.user.testName, getPasswordTitle, true);
    await UserAccessor.remove(this.user);
    delete this.user;
    delete this.password;
    Log.afterEach(TestConstants.database.user.testName, getPasswordTitle, false);
    done();
  });

  const it1 = 'throws an error for a missing username';
  it(it1, async (done) => {
    Log.it(TestConstants.database.user.testName, getPasswordTitle, it1, true);
    try {
      const result = await UserAccessor.getPassword(null);
      expect(result).not.toBeDefined();
      Log.log(
        TestConstants.database.user.testName,
        getPasswordTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (error) {
      expect(error.name).toBe(Constants.errors.dropp.name);
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.details.error.message).toBe(Constants.params.username);
      Log.log(TestConstants.database.user.testName, getPasswordTitle, error.details);
    }

    Log.it(TestConstants.database.user.testName, getPasswordTitle, it1, false);
    done();
  });

  const it2 = 'throws an error for an invalid username';
  it(it2, async (done) => {
    Log.it(TestConstants.database.user.testName, getPasswordTitle, it2, true);
    try {
      const result = await UserAccessor.getPassword(TestConstants.params.invalidChars.percent);
      expect(result).not.toBeDefined();
      Log.log(
        TestConstants.database.user.testName,
        getPasswordTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (error) {
      expect(error.name).toBe(Constants.errors.dropp.name);
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.details.error.message).toBe(Constants.params.username);
      Log.log(TestConstants.database.user.testName, getPasswordTitle, error.details);
    }

    Log.it(TestConstants.database.user.testName, getPasswordTitle, it2, false);
    done();
  });

  const it3 = 'returns null for a non-existent user';
  it(it3, async (done) => {
    Log.it(TestConstants.database.user.testName, getPasswordTitle, it3, true);
    const result = await UserAccessor.getPassword(Utils.newUuid());
    expect(result).toBeNull();
    Log.log(TestConstants.database.user.testName, getPasswordTitle, result);
    Log.it(TestConstants.database.user.testName, getPasswordTitle, it3, false);
    done();
  });

  const it4 = 'returns a password for a valid, existing username';
  it(it4, async (done) => {
    Log.it(TestConstants.database.user.testName, getPasswordTitle, it4, true);
    const result = await UserAccessor.getPassword(this.user.username);
    expect(result).toBe(this.password);
    Log.log(TestConstants.database.user.testName, getPasswordTitle, result);
    Log.it(TestConstants.database.user.testName, getPasswordTitle, it4, false);
    done();
  });
});

const createUserTitle = 'Create user';
describe(createUserTitle, () => {
  beforeEach(() => {
    Log.beforeEach(TestConstants.database.user.testName, createUserTitle, true);
    this.password = Utils.newUuid();
    this.user = new User({
      username: Utils.newUuid(),
      email: TestConstants.params.uuidEmail(),
    });

    Log.beforeEach(TestConstants.database.user.testName, createUserTitle, false);
  });

  afterEach(() => {
    Log.afterEach(TestConstants.database.user.testName, createUserTitle, true);
    delete this.user;
    delete this.password;
    Log.afterEach(TestConstants.database.user.testName, createUserTitle, false);
  });

  const it1 = 'throws an error for an invalid user object';
  it(it1, async (done) => {
    Log.it(TestConstants.database.user.testName, createUserTitle, it1, true);
    try {
      await UserAccessor.create(null, this.password);
      expect(false).toBe(true);
      Log.log(
        TestConstants.database.user.testName,
        createUserTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (error) {
      expect(error.name).toBe(Constants.errors.dropp.name);
      expect(error.details.error.type).toBe(DroppError.type.Server.type);
      expect(error.details.error.message).toBe(DroppError.type.Server.message);
      Log.log(TestConstants.database.user.testName, createUserTitle, error.details);
    }

    Log.it(TestConstants.database.user.testName, createUserTitle, it1, false);
    done();
  });

  const it2 = 'throws an error for an invalid username';
  it(it2, async (done) => {
    Log.it(TestConstants.database.user.testName, createUserTitle, it2, true);
    this.user.username = TestConstants.params.invalidChars.percent;
    try {
      await UserAccessor.create(this.user, this.password);
      expect(false).toBe(true);
      Log.log(
        TestConstants.database.user.testName,
        createUserTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (error) {
      expect(error.name).toBe(Constants.errors.dropp.name);
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.details.error.message).toBe(Constants.params.username);
      Log.log(TestConstants.database.user.testName, createUserTitle, error.details);
    }

    Log.it(TestConstants.database.user.testName, createUserTitle, it2, false);
    done();
  });

  const it3 = 'throws an error for an invalid password';
  it(it3, async (done) => {
    Log.it(TestConstants.database.user.testName, createUserTitle, it3, true);
    this.password = TestConstants.params.invalidChars.percent;
    try {
      await UserAccessor.create(this.user, this.password);
      expect(false).toBe(true);
      Log.log(
        TestConstants.database.user.testName,
        createUserTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (error) {
      expect(error.name).toBe(Constants.errors.dropp.name);
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.details.error.message).toBe(Constants.params.password);
      Log.log(TestConstants.database.user.testName, createUserTitle, error.details);
    }

    Log.it(TestConstants.database.user.testName, createUserTitle, it3, false);
    done();
  });

  const it4 = 'throws an error for an invalid email';
  it(it4, async (done) => {
    Log.it(TestConstants.database.user.testName, createUserTitle, it4, true);
    this.user.email = TestConstants.params.invalidChars.percent;
    try {
      await UserAccessor.create(this.user, this.password);
      expect(false).toBe(true);
      Log.log(
        TestConstants.database.user.testName,
        createUserTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (error) {
      expect(error.name).toBe(Constants.errors.dropp.name);
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.details.error.message).toBe(Constants.params.email);
      Log.log(TestConstants.database.user.testName, createUserTitle, error.details);
    }

    Log.it(TestConstants.database.user.testName, createUserTitle, it4, false);
    done();
  });

  const it5 = 'throws an error for 2 invalid attributes';
  it(it5, async (done) => {
    Log.it(TestConstants.database.user.testName, createUserTitle, it5, true);
    this.password = TestConstants.params.invalidChars.percent;
    this.user.username = TestConstants.params.invalidChars.percent;
    try {
      await UserAccessor.create(this.user, this.password);
      expect(false).toBe(true);
      Log.log(
        TestConstants.database.user.testName,
        createUserTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (error) {
      expect(error.name).toBe(Constants.errors.dropp.name);
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.details.error.message)
        .toBe(`${Constants.params.username},${Constants.params.password}`);
      Log.log(TestConstants.database.user.testName, createUserTitle, error.details);
    }

    Log.it(TestConstants.database.user.testName, createUserTitle, it5, false);
    done();
  });

  const it6 = 'throws an error for 3 invalid attributes';
  it(it6, async (done) => {
    Log.it(TestConstants.database.user.testName, createUserTitle, it6, true);
    this.password = TestConstants.params.invalidChars.percent;
    this.user.email = TestConstants.params.invalidChars.percent;
    this.user.username = TestConstants.params.invalidChars.percent;
    try {
      await UserAccessor.create(this.user, this.password);
      expect(false).toBe(true);
      Log.log(
        TestConstants.database.user.testName,
        createUserTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (error) {
      expect(error.name).toBe(Constants.errors.dropp.name);
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.details.error.message)
        .toBe(`${Constants.params.email},${Constants.params.username},${Constants.params.password}`);
      Log.log(TestConstants.database.user.testName, createUserTitle, error.details);
    }

    Log.it(TestConstants.database.user.testName, createUserTitle, it6, false);
    done();
  });

  const successfulUserCreationTitle = 'Successful user creation';
  describe(successfulUserCreationTitle, () => {
    afterEach(async (done) => {
      Log.afterEach(TestConstants.database.user.testName, successfulUserCreationTitle, true);
      await UserAccessor.remove(this.user);
      Log.afterEach(TestConstants.database.user.testName, successfulUserCreationTitle, false);
      done();
    });

    const it7 = 'creates a user in the database for valid details';
    it(it7, async (done) => {
      Log.it(TestConstants.database.user.testName, createUserTitle, it7, true);
      await UserAccessor.create(this.user, this.password);
      const user = await UserAccessor.get(this.user.username);
      expect(user instanceof User).toBe(true);
      expect(user.email).toBe(this.user.email);
      expect(user.username).toBe(this.user.username);
      const password = await UserAccessor.getPassword(this.user.username);
      expect(password).toBe(this.password);
      Log.log(TestConstants.database.user.testName, successfulUserCreationTitle, user);
      Log.it(TestConstants.database.user.testName, createUserTitle, it7, false);
      done();
    });
  });
});

const updateUserAttributesTitle = 'Update user attributes';
describe(updateUserAttributesTitle, () => {
  beforeEach(async (done) => {
    Log.beforeEach(TestConstants.database.user.testName, updateUserAttributesTitle, true);
    this.user = new User({
      username: Utils.newUuid(),
      email: TestConstants.params.uuidEmail(),
    });

    this.password = Utils.newUuid();
    await UserAccessor.create(this.user, this.password);
    Log.beforeEach(TestConstants.database.user.testName, updateUserAttributesTitle, false);
    done();
  });

  afterEach(async (done) => {
    Log.afterEach(TestConstants.database.user.testName, updateUserAttributesTitle, true);
    await UserAccessor.remove(this.user);
    delete this.user;
    delete this.password;
    Log.afterEach(TestConstants.database.user.testName, updateUserAttributesTitle, false);
    done();
  });

  const updatePasswordTitle = 'Update password';
  describe(updatePasswordTitle, () => {
    const it1 = 'throws an error for an invalid user object';
    it(it1, async (done) => {
      Log.it(TestConstants.database.user.testName, updatePasswordTitle, it1, true);
      try {
        await UserAccessor.updatePassword(null, Utils.newUuid());
        expect(false).toBe(true);
        Log.log(
          TestConstants.database.user.testName,
          updatePasswordTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(TestConstants.database.user.testName, updatePasswordTitle, error.details);
      }

      Log.it(TestConstants.database.user.testName, updatePasswordTitle, it1, false);
      done();
    });

    const it2 = 'throws an error for an invalid password';
    it(it2, async (done) => {
      Log.it(TestConstants.database.user.testName, updatePasswordTitle, it2, true);
      try {
        await UserAccessor.updatePassword(this.user, TestConstants.params.invalidChars.percent);
        expect(false).toBe(true);
        Log.log(
          TestConstants.database.user.testName,
          updatePasswordTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe(Constants.params.password);
        Log.log(TestConstants.database.user.testName, updatePasswordTitle, error.details);
      }

      Log.it(TestConstants.database.user.testName, updatePasswordTitle, it2, false);
      done();
    });

    const it3 = 'updates the password for a valid password';
    it(it3, async (done) => {
      Log.it(TestConstants.database.user.testName, updatePasswordTitle, it3, true);
      const password = Utils.newUuid();
      await UserAccessor.updatePassword(this.user, password);
      const result = await UserAccessor.getPassword(this.user.username);
      expect(result).toBe(password);
      Log.log(TestConstants.database.user.testName, updatePasswordTitle, result);
      Log.it(TestConstants.database.user.testName, updatePasswordTitle, it3, false);
      done();
    });
  });

  const updateEmailTitle = 'Update email';
  describe(updateEmailTitle, () => {
    const it4 = 'throws an error for an invalid user object';
    it(it4, async (done) => {
      Log.it(TestConstants.database.user.testName, updateEmailTitle, it4, true);
      try {
        await UserAccessor.updateEmail(null, TestConstants.params.testEmail);
        expect(false).toBe(true);
        Log.log(
          TestConstants.database.user.testName,
          updateEmailTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(TestConstants.database.user.testName, updateEmailTitle, error.details);
      }

      Log.it(TestConstants.database.user.testName, updateEmailTitle, it4, false);
      done();
    });

    const it5 = 'throws an error for an invalid email';
    it(it5, async (done) => {
      Log.it(TestConstants.database.user.testName, updateEmailTitle, it5, true);
      try {
        await UserAccessor.updateEmail(this.user, Utils.newUuid());
        expect(false).toBe(true);
        Log.log(
          TestConstants.database.user.testName,
          updateEmailTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(error.details.error.message).toBe(Constants.params.email);
        Log.log(TestConstants.database.user.testName, updateEmailTitle, error.details);
      }

      Log.it(TestConstants.database.user.testName, updateEmailTitle, it5, false);
      done();
    });

    const it6 = 'updates the email for a valid email';
    it(it6, async (done) => {
      Log.it(TestConstants.database.user.testName, updateEmailTitle, it6, true);
      const email = TestConstants.params.uuidEmail();
      await UserAccessor.updateEmail(this.user, email);
      expect(this.user.email).toBe(email);
      Log.log(TestConstants.database.user.testName, updateEmailTitle, this.user.email);
      Log.it(TestConstants.database.user.testName, updateEmailTitle, it6, false);
      done();
    });
  });
});

const interUserFunctions = 'Inter-user functions';
describe(interUserFunctions, () => {
  beforeEach(async (done) => {
    Log.beforeEach(TestConstants.database.user.testName, interUserFunctions, true);
    this.user1 = new User({
      username: Utils.newUuid(),
      email: TestConstants.params.uuidEmail(),
    });

    this.user2 = new User({
      username: Utils.newUuid(),
      email: TestConstants.params.uuidEmail(),
    });

    await UserAccessor.create(this.user1, Utils.newUuid());
    await UserAccessor.create(this.user2, Utils.newUuid());
    Log.beforeEach(TestConstants.database.user.testName, interUserFunctions, false);
    done();
  });

  afterEach(async (done) => {
    Log.afterEach(TestConstants.database.user.testName, interUserFunctions, true);
    await UserAccessor.remove(this.user1);
    await UserAccessor.remove(this.user2);
    delete this.user1;
    delete this.user2;
    Log.afterEach(TestConstants.database.user.testName, interUserFunctions, false);
    done();
  });

  const addFollowRequestTitle = 'Add follow request';
  describe(addFollowRequestTitle, () => {
    const it1 = 'throws an error for a first invalid user object';
    it(it1, async (done) => {
      Log.it(TestConstants.database.user.testName, addFollowRequestTitle, it1, true);
      try {
        await UserAccessor.addFollowRequest(null, this.user2);
        expect(false).toBe(true);
        Log.log(
          TestConstants.database.user.testName,
          addFollowRequestTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(TestConstants.database.user.testName, addFollowRequestTitle, error.details);
      }

      Log.it(TestConstants.database.user.testName, addFollowRequestTitle, it1, false);
      done();
    });

    const it2 = 'throws an error for a second invalid user object';
    it(it2, async (done) => {
      Log.it(TestConstants.database.user.testName, addFollowRequestTitle, it2, true);
      try {
        await UserAccessor.addFollowRequest(this.user1, null);
        expect(false).toBe(true);
        Log.log(
          TestConstants.database.user.testName,
          addFollowRequestTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(TestConstants.database.user.testName, addFollowRequestTitle, error.details);
      }

      Log.it(TestConstants.database.user.testName, addFollowRequestTitle, it2, false);
      done();
    });

    const it3 = 'adds a follow request to the user\'s follow requests';
    it(it3, async (done) => {
      Log.it(TestConstants.database.user.testName, addFollowRequestTitle, it3, true);
      await UserAccessor.addFollowRequest(this.user1, this.user2);
      expect(this.user1.followRequests).toContain(this.user2.username);
      expect(this.user2.followerRequests).toContain(this.user1.username);
      Log.log(
        TestConstants.database.user.testName,
        addFollowRequestTitle,
        this.user1.followRequests
      );
      Log.it(TestConstants.database.user.testName, addFollowRequestTitle, it3, false);
      done();
    });
  });

  const addFollowTitle = 'Add follow';
  describe(addFollowTitle, () => {
    const it4 = 'throws an error for a first invalid user object';
    it(it4, async (done) => {
      Log.it(TestConstants.database.user.testName, addFollowTitle, it4, true);
      try {
        await UserAccessor.addFollow(null, this.user2);
        expect(false).toBe(true);
        Log.log(
          TestConstants.database.user.testName,
          addFollowTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(TestConstants.database.user.testName, addFollowTitle, error.details);
      }

      Log.it(TestConstants.database.user.testName, addFollowTitle, it4, false);
      done();
    });

    const it5 = 'throws an error for a second invalid user object';
    it(it5, async (done) => {
      Log.it(TestConstants.database.user.testName, addFollowTitle, it5, true);
      try {
        await UserAccessor.addFollow(this.user1, null);
        expect(false).toBe(true);
        Log.log(
          TestConstants.database.user.testName,
          addFollowTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(TestConstants.database.user.testName, addFollowTitle, error.details);
      }

      Log.it(TestConstants.database.user.testName, addFollowTitle, it5, false);
      done();
    });

    const addFollowSuccessTitle = 'Add follow success';
    describe(addFollowSuccessTitle, () => {
      beforeEach(() => {
        Log.beforeEach(TestConstants.database.user.testName, addFollowSuccessTitle, true);
        this.user1.followRequests.push(this.user2.username);
        this.user2.followerRequests.push(this.user1.username);
        Log.beforeEach(TestConstants.database.user.testName, addFollowSuccessTitle, false);
      });

      const it6 = 'adds a follow to the user\'s follows';
      it(it6, async (done) => {
        Log.it(TestConstants.database.user.testName, addFollowSuccessTitle, it6, true);
        await UserAccessor.addFollow(this.user1, this.user2);
        expect(this.user1.follows).toContain(this.user2.username);
        expect(this.user2.followers).toContain(this.user1.username);
        Log.log(TestConstants.database.user.testName, addFollowSuccessTitle, this.user1.follows);
        Log.it(TestConstants.database.user.testName, addFollowSuccessTitle, it6, false);
        done();
      });
    });
  });

  const removeFollowRequestTitle = 'Remove follow request';
  describe(removeFollowRequestTitle, () => {
    const it1 = 'throws an error for a first invalid user object';
    it(it1, async (done) => {
      Log.it(TestConstants.database.user.testName, removeFollowRequestTitle, it1, true);
      try {
        await UserAccessor.removeFollowRequest(null, this.user2);
        expect(false).toBe(true);
        Log.log(
          TestConstants.database.user.testName,
          removeFollowRequestTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(TestConstants.database.user.testName, removeFollowRequestTitle, error.details);
      }

      Log.it(TestConstants.database.user.testName, removeFollowRequestTitle, it1, false);
      done();
    });

    const it2 = 'throws an error for a second invalid user object';
    it(it2, async (done) => {
      Log.it(TestConstants.database.user.testName, removeFollowRequestTitle, it2, true);
      try {
        await UserAccessor.removeFollowRequest(this.user1, null);
        expect(false).toBe(true);
        Log.log(
          TestConstants.database.user.testName,
          removeFollowRequestTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(TestConstants.database.user.testName, removeFollowRequestTitle, error.details);
      }

      Log.it(TestConstants.database.user.testName, removeFollowRequestTitle, it2, false);
      done();
    });

    const successRemoveFollowRequestTitle = 'Success remove follow request';
    describe(successRemoveFollowRequestTitle, () => {
      beforeEach(() => {
        Log.beforeEach(TestConstants.database.user.testName, successRemoveFollowRequestTitle, true);
        this.user1.followRequests.push(this.user2.username);
        this.user2.followerRequests.push(this.user1.username);
        Log.beforeEach(
          TestConstants.database.user.testName,
          successRemoveFollowRequestTitle,
          false
        );
      });

      const it3 = 'removes a follow request from the user\'s follow requests';
      it(it3, async (done) => {
        Log.it(TestConstants.database.user.testName, successRemoveFollowRequestTitle, it3, true);
        await UserAccessor.removeFollowRequest(this.user1, this.user2);
        expect(this.user1.followRequests).not.toContain(this.user2.username);
        expect(this.user2.followerRequests).not.toContain(this.user1.username);
        Log.log(
          TestConstants.database.user.testName,
          successRemoveFollowRequestTitle,
          this.user1.followRequests
        );
        Log.it(TestConstants.database.user.testName, successRemoveFollowRequestTitle, it3, false);
        done();
      });
    });
  });

  const removeFollowTitle = 'Remove follow';
  describe(removeFollowTitle, () => {
    const it1 = 'throws an error for a first invalid user object';
    it(it1, async (done) => {
      Log.it(TestConstants.database.user.testName, removeFollowTitle, it1, true);
      try {
        await UserAccessor.removeFollow(null, this.user2);
        expect(false).toBe(true);
        Log.log(
          TestConstants.database.user.testName,
          removeFollowTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(TestConstants.database.user.testName, removeFollowTitle, error.details);
      }

      Log.it(TestConstants.database.user.testName, removeFollowTitle, it1, false);
      done();
    });

    const it2 = 'throws an error for a second invalid user object';
    it(it2, async (done) => {
      Log.it(TestConstants.database.user.testName, removeFollowTitle, it2, true);
      try {
        await UserAccessor.removeFollow(this.user1, null);
        expect(false).toBe(true);
        Log.log(
          TestConstants.database.user.testName,
          removeFollowTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (error) {
        expect(error.name).toBe(Constants.errors.dropp.name);
        expect(error.details.error.type).toBe(DroppError.type.Server.type);
        expect(error.details.error.message).toBe(DroppError.type.Server.message);
        Log.log(TestConstants.database.user.testName, removeFollowTitle, error.details);
      }

      Log.it(TestConstants.database.user.testName, removeFollowTitle, it2, false);
      done();
    });

    const successRemoveFollowTitle = 'Success remove follow';
    describe(successRemoveFollowTitle, () => {
      beforeEach(() => {
        Log.beforeEach(TestConstants.database.user.testName, successRemoveFollowTitle, true);
        this.user1.follows.push(this.user2.username);
        this.user2.followers.push(this.user1.username);
        Log.beforeEach(TestConstants.database.user.testName, successRemoveFollowTitle, false);
      });

      const it3 = 'removes a follow from the user\'s follows';
      it(it3, async (done) => {
        Log.it(TestConstants.database.user.testName, successRemoveFollowTitle, it3, true);
        await UserAccessor.removeFollow(this.user1, this.user2);
        expect(this.user1.follows).not.toContain(this.user2.username);
        expect(this.user2.followers).not.toContain(this.user1.username);
        Log.log(TestConstants.database.user.testName, successRemoveFollowTitle, this.user1.follows);
        Log.it(TestConstants.database.user.testName, successRemoveFollowTitle, it3, false);
        done();
      });
    });
  });
});

const removeUserTitle = 'Remove user';
describe(removeUserTitle, () => {
  beforeEach(async (done) => {
    Log.beforeEach(TestConstants.database.user.testName, removeUserTitle, true);
    this.user = new User({
      username: Utils.newUuid(),
      email: TestConstants.params.uuidEmail(),
    });

    await UserAccessor.create(this.user, Utils.newUuid());
    Log.beforeEach(TestConstants.database.user.testName, removeUserTitle, false);
    done();
  });

  afterEach(async (done) => {
    Log.afterEach(TestConstants.database.user.testName, removeUserTitle, true);
    if (Utils.hasValue(this.user)) await UserAccessor.remove(this.user);
    delete this.user;
    Log.afterEach(TestConstants.database.user.testName, removeUserTitle, false);
    done();
  });

  const it1 = 'throws an error for an invalid user object';
  it(it1, async (done) => {
    Log.it(TestConstants.database.user.testName, removeUserTitle, it1, true);
    try {
      await UserAccessor.remove(null);
      expect(false).toBe(true);
      Log.log(
        TestConstants.database.user.testName,
        removeUserTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (error) {
      expect(error.name).toBe(Constants.errors.dropp.name);
      expect(error.details.error.type).toBe(DroppError.type.Server.type);
      expect(error.details.error.message).toBe(DroppError.type.Server.message);
      Log.log(TestConstants.database.user.testName, removeUserTitle, error.details);
    }

    Log.it(TestConstants.database.user.testName, removeUserTitle, it1, false);
    done();
  });

  const it2 = 'removes a user from the database';
  it(it2, async (done) => {
    Log.it(TestConstants.database.user.testName, removeUserTitle, it2, true);
    await UserAccessor.remove(this.user);
    const result = await UserAccessor.get(this.user.username);
    expect(result).toBeNull();
    Log.it(TestConstants.database.user.testName, removeUserTitle, it2, false);
    done();
  });
});

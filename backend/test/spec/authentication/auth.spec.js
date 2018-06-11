const Log = require('../../logger');
const User = require('../../../src/models/User');
const Utils = require('../../../src/utilities/utils');
const Firebase = require('../../../src/firebase/firebase');
const UserAccessor = require('../../../src/database/user');
const Constants = require('../../../src/utilities/constants');
const AuthModule = require('../../../src/authentication/auth');

const testName = 'Authentication Module';
const validatePasswordTitle = 'Validate password';
/* eslint-disable no-undef */
describe(validatePasswordTitle, () => {
  beforeEach(async (done) => {
    Log.beforeEach(testName, validatePasswordTitle, true);
    this.testPassword = 'test';
    this.hashedPassword = await AuthModule.hash(this.testPassword);
    Log.beforeEach(testName, validatePasswordTitle, false);
    done();
  });

  afterEach(() => {
    Log.afterEach(testName, validatePasswordTitle, true);
    delete this.testPassword;
    delete this.hashedPassword;
    Log.afterEach(testName, validatePasswordTitle, false);
  });

  const it1 = 'throws an error for a non-string given password';
  it(it1, async (done) => {
    Log.it(testName, validatePasswordTitle, it1, true);
    try {
      const result = await AuthModule.validatePasswords(null, this.hashedPassword);
      expect(result).not.toBeDefined();
      Log.log(testName, validatePasswordTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.message.toLowerCase()).toContain('illegal arguments');
      Log.log(testName, validatePasswordTitle, error);
    }

    Log.it(testName, validatePasswordTitle, it1, false);
    done();
  });

  const it2 = 'throws an error for a non-string hashed password';
  it(it2, async (done) => {
    Log.it(testName, validatePasswordTitle, it2, true);
    try {
      const result = await AuthModule.validatePasswords(this.testPassword, null);
      expect(result).not.toBeDefined();
      Log.log(testName, validatePasswordTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.message.toLowerCase()).toContain('illegal arguments');
      Log.log(testName, validatePasswordTitle, error);
    }

    Log.it(testName, validatePasswordTitle, it2, false);
    done();
  });

  const it3 = 'returns false for an unhashed password to test against';
  it(it3, async (done) => {
    Log.it(testName, validatePasswordTitle, it3, true);
    const result = await AuthModule.validatePasswords(this.testPassword, Utils.newUuid());
    expect(result).toBe(false);
    Log.log(testName, validatePasswordTitle, result);
    Log.it(testName, validatePasswordTitle, it3, false);
    done();
  });

  const it4 = 'returns false for an incorrect password';
  it(it4, async (done) => {
    Log.it(testName, validatePasswordTitle, it4, true);
    const result = await AuthModule.validatePasswords(Utils.newUuid(), this.hashedPassword);
    expect(result).toBe(false);
    Log.log(testName, validatePasswordTitle, result);
    Log.it(testName, validatePasswordTitle, it4, false);
    done();
  });

  const it5 = 'returns true for a matching password';
  it(it5, async (done) => {
    Log.it(testName, validatePasswordTitle, it5, true);
    const result = await AuthModule.validatePasswords(this.testPassword, this.hashedPassword);
    expect(result).toBe(true);
    Log.log(testName, validatePasswordTitle, result);
    Log.it(testName, validatePasswordTitle, it5, false);
    done();
  });
});

const generateTokenTitle = 'Generate token';
describe(generateTokenTitle, () => {
  const it1 = 'returns null for an invalid user object';
  it(it1, () => {
    Log.it(testName, generateTokenTitle, it1, true);
    const result = AuthModule.generateToken(null);
    expect(result).toBeNull();
    Log.it(testName, generateTokenTitle, it1, false);
    Log.log(testName, generateTokenTitle, result);
  });

  const it2 = 'returns a token for a valid user object';
  it(it2, () => {
    Log.it(testName, generateTokenTitle, it2, true);
    const user = new User({
      username: 'test',
      email: 'test@test.com',
    });

    const result = AuthModule.generateToken(user);
    expect(typeof result).toBe('string');
    Log.it(testName, generateTokenTitle, it2, false);
    Log.log(testName, generateTokenTitle, result);
  });
});

const hashTitle = 'Hash';
describe(hashTitle, () => {
  const it1 = 'throws an error for a non-string given value';
  it(it1, async (done) => {
    Log.it(testName, hashTitle, it1, true);
    try {
      const result = await AuthModule.hash(null);
      expect(result).not.toBeDefined();
      Log.log(testName, hashTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.message.toLowerCase()).toContain('illegal arguments');
      Log.log(testName, hashTitle, error);
    }

    Log.it(testName, hashTitle, it1, false);
    done();
  });

  const it2 = 'hashes a valid value';
  it(it2, async (done) => {
    Log.it(testName, hashTitle, it2, true);
    const result = await AuthModule.hash('test');
    expect(typeof result).toBe('string');
    expect(result).not.toBe('test');
    Log.log(testName, hashTitle, result);
    Log.it(testName, hashTitle, it2, false);
    done();
  });
});

const verifyTokenTitle = 'Verify token';
describe(verifyTokenTitle, () => {
  beforeEach(async (done) => {
    Log.beforeEach(testName, verifyTokenTitle, true);
    Firebase.start(process.env.MOCK === '1');
    this.request = {
      headers: {},
    };

    this.user = new User({
      username: Utils.newUuid(),
      email: `${Utils.newUuid()}@${Utils.newUuid()}.com`,
    });

    await UserAccessor.create(this.user, Utils.newUuid());
    this.token = AuthModule.generateToken(this.user);
    await UserAccessor.updateEmail(this.user, 'test@test.com');
    Log.beforeEach(testName, verifyTokenTitle, false);
    done();
  });

  afterEach(async (done) => {
    Log.afterEach(testName, verifyTokenTitle, true);
    await UserAccessor.remove(this.user);
    delete this.user;
    delete this.token;
    delete this.request;
    Log.afterEach(testName, verifyTokenTitle, false);
    done();
  });

  const it1 = 'throws an error for a missing authorization header';
  it(it1, async (done) => {
    Log.it(testName, verifyTokenTitle, it1, true);
    try {
      const result = await AuthModule.verifyToken({}, {});
      expect(result).not.toBeDefined();
      Log.log(testName, verifyTokenTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.tokenError).not.toBeDefined();
      expect(error.passportError).not.toBeDefined();
      expect(error.userInfoMissing).not.toBeDefined();
      Log.log(testName, verifyTokenTitle, error);
    }

    Log.it(testName, verifyTokenTitle, it1, false);
    done();
  });

  const it2 = 'throws an error for an invalid authorization header';
  it(it2, async (done) => {
    Log.it(testName, verifyTokenTitle, it2, true);
    this.request.headers.authorization = 'test';
    try {
      const result = await AuthModule.verifyToken(this.request, {});
      expect(result).not.toBeDefined();
      Log.log(testName, verifyTokenTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.passportError).toBeNull();
      expect(error.userInfoMissing).toBe(false);
      expect(error.tokenError.message.toLowerCase()).toContain('no auth token');
      Log.log(testName, verifyTokenTitle, error);
    }

    Log.it(testName, verifyTokenTitle, it2, false);
    done();
  });

  const it3 = 'returns a user for a valid authorization token';
  it(it3, async (done) => {
    Log.it(testName, verifyTokenTitle, it3, true);
    this.request.headers.authorization = `${Constants.passport.Bearer} ${this.token}`;
    const user = await AuthModule.verifyToken(this.request, {});
    expect(user instanceof User).toBe(true);
    expect(user.email).toBe(this.user.email);
    expect(user.username).toBe(this.user.username);
    Log.log(testName, verifyTokenTitle, user);
    Log.it(testName, verifyTokenTitle, it3, false);
    done();
  });
});

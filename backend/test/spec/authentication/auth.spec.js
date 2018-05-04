const Log = require('../../logger');
const User = require('../../../src/models/User');
const Utils = require('../../../src/utilities/utils');
const Firebase = require('../../../src/firebase/firebase');
const UserAccessor = require('../../../src/database/user');
const AuthModule = require('../../../src/authentication/auth');

/**
 * Logs a message for the current test file
 * @param {String} _title the describe label
 * @param {String|Object} _details the log details
 */
function log(_title, _details) {
  Log(`Authentication Module ${_title}`, _details);
}

const validatePasswordTitle = 'Validate password';
/* eslint-disable no-undef */
describe(validatePasswordTitle, () => {
  beforeEach(async (done) => {
    this.testPassword = 'test';
    this.hashedPassword = await AuthModule.hash(this.testPassword);
    done();
  });

  afterEach(() => {
    delete this.testPassword;
    delete this.hashedPassword;
  });

  it('throws an error for a non-string given password', async (done) => {
    try {
      const result = await AuthModule.validatePasswords(null, this.hashedPassword);
      expect(result).not.toBeDefined();
      log(validatePasswordTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.message.toLowerCase()).toContain('illegal arguments');
      log(validatePasswordTitle, error);
    }

    done();
  });

  it('throws an error for a non-string hashed password', async (done) => {
    try {
      const result = await AuthModule.validatePasswords(this.testPassword, null);
      expect(result).not.toBeDefined();
      log(validatePasswordTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.message.toLowerCase()).toContain('illegal arguments');
      log(validatePasswordTitle, error);
    }

    done();
  });

  it('returns false for an unhashed password to test against', async (done) => {
    const result = await AuthModule.validatePasswords(this.testPassword, Utils.newUuid());
    expect(result).toBe(false);
    log(validatePasswordTitle, result);
    done();
  });

  it('returns false for an incorrect password', async (done) => {
    const result = await AuthModule.validatePasswords(Utils.newUuid(), this.hashedPassword);
    expect(result).toBe(false);
    log(validatePasswordTitle, result);
    done();
  });

  it('returns true for a matching password', async (done) => {
    const result = await AuthModule.validatePasswords(this.testPassword, this.hashedPassword);
    expect(result).toBe(true);
    log(validatePasswordTitle, result);
    done();
  });
});

const generateTokenTitle = 'Generate token';
describe(generateTokenTitle, () => {
  it('returns null for an invalid user object', (done) => {
    const result = AuthModule.generateToken(null);
    expect(result).toBeNull();
    log(generateTokenTitle, result);
    done();
  });

  it('returns a token for a valid user object', (done) => {
    const user = new User({
      username: 'test',
      email: 'test@test.com',
    });

    const result = AuthModule.generateToken(user);
    expect(typeof result).toBe('string');
    log(generateTokenTitle, result);
    done();
  });
});

const hashTitle = 'Hash';
describe(hashTitle, () => {
  it('throws an error for a non-string given value', async (done) => {
    try {
      const result = await AuthModule.hash(null);
      expect(result).not.toBeDefined();
      log(hashTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.message.toLowerCase()).toContain('illegal arguments');
      log(hashTitle, error);
    }

    done();
  });

  it('hashes a valid value', async (done) => {
    const result = await AuthModule.hash('test');
    expect(typeof result).toBe('string');
    expect(result).not.toBe('test');
    log(hashTitle, result);
    done();
  });
});

const verifyTokenTitle = 'Verify token';
describe(verifyTokenTitle, () => {
  beforeEach(async (done) => {
    Firebase.start(process.env.MOCK === '1');
    this.user = new User({
      username: Utils.newUuid(),
      email: `${Utils.newUuid()}@${Utils.newUuid()}.com`,
    });

    await UserAccessor.create(this.user, Utils.newUuid());
    this.token = AuthModule.generateToken(this.user);
    await UserAccessor.updateEmail(this.user, 'test@test.com');
    done();
  });

  afterEach(async (done) => {
    await UserAccessor.remove(this.user);
    delete this.user;
    delete this.token;
    done();
  });

  it('throws an error for a missing authorization header', async (done) => {
    try {
      const result = await AuthModule.verifyToken({}, {});
      expect(result).not.toBeDefined();
      log(verifyTokenTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.tokenError).not.toBeDefined();
      expect(error.passportError).not.toBeDefined();
      expect(error.userInfoMissing).not.toBeDefined();
      log(verifyTokenTitle, error);
    }

    done();
  });

  it('throws an error for an invalid authorization header', async (done) => {
    const request = {
      headers: {
        authorization: 'test',
      },
    };

    try {
      const result = await AuthModule.verifyToken(request, {});
      expect(result).not.toBeDefined();
      log(verifyTokenTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.passportError).toBeNull();
      expect(error.userInfoMissing).toBe(false);
      expect(error.tokenError.message.toLowerCase()).toContain('no auth token');
      log(verifyTokenTitle, error);
    }

    done();
  });

  it('returns a user for a valid authorization token', async (done) => {
    const request = {
      headers: {
        authorization: `Bearer ${this.token}`,
      },
    };

    const user = await AuthModule.verifyToken(request, {});
    expect(user instanceof User).toBe(true);
    expect(user.email).toBe(this.user.email);
    expect(user.username).toBe(this.user.username);
    log(verifyTokenTitle, user);
    done();
  });
});
/* eslint-enable no-undef */

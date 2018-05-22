const Request = require('request-promise-native');
const Log = require('../../logger');
const Server = require('../../../index');
const User = require('../../../src/models/User');
const Utils = require('../../../src/utilities/utils');
const UserAccessor = require('../../../src/database/user');
const DroppError = require('../../../src/errors/DroppError');
const AuthModule = require('../../../src/authentication/auth');
const UserMiddleware = require('../../../src/middleware/user');

/**
 * Logs a message for the current test file
 * @param {String} _title the describe label
 * @param {String|Object} _details the log details
 */
function log(_title, _details) {
  Log(`Router Module ${_title}`, _details);
}

const url = `http://localhost:${Server.port}/users`;
const postUserRouteTitle = 'Post user route';
/* eslint-disable no-undef */
describe(postUserRouteTitle, () => {
  beforeEach(() => {
    this.deleteUser = false;
    this.username = Utils.newUuid();
    this.password = Utils.newUuid();
    this.email = `${Utils.newUuid()}@${Utils.newUuid()}.com`;
    this.options = {
      method: 'POST',
      uri: url,
      resolveWithFullResponse: true,
      form: {
        email: this.email,
        username: this.username,
        password: this.password,
      },
    };
  });

  afterEach(async (done) => {
    if (this.deleteUser) {
      const user = await UserAccessor.get(this.username);
      await UserAccessor.remove(user);
    }

    delete this.email;
    delete this.username;
    delete this.password;
    delete this.options;
    delete this.deleteUser;
    done();
  });

  it('returns an error for an invalid username', async (done) => {
    delete this.options.form.username;
    try {
      const response = await Request(this.options);
      expect(response).not.toBeDefined();
      log(postUserRouteTitle, 'Should have thrown error');
    } catch (response) {
      expect(response).toBeDefined();
      expect(response.statusCode).toBe(400);

      const details = JSON.parse(response.error);
      expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(details.error.message).toBe('username');
      log(postUserRouteTitle, response.error);
    }

    done();
  });

  it('returns an error for an invalid password', async (done) => {
    delete this.options.form.password;
    try {
      const response = await Request(this.options);
      expect(response).not.toBeDefined();
      log(postUserRouteTitle, 'Should have thrown error');
    } catch (response) {
      expect(response).toBeDefined();
      expect(response.statusCode).toBe(400);

      const details = JSON.parse(response.error);
      expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(details.error.message).toBe('password');
      log(postUserRouteTitle, response.error);
    }

    done();
  });

  it('returns an error for an invalid email', async (done) => {
    delete this.options.form.email;
    try {
      const response = await Request(this.options);
      expect(response).not.toBeDefined();
      log(postUserRouteTitle, 'Should have thrown error');
    } catch (response) {
      expect(response).toBeDefined();
      expect(response.statusCode).toBe(400);

      const details = JSON.parse(response.error);
      expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(details.error.message).toBe('email');
      log(postUserRouteTitle, response.error);
    }

    done();
  });

  it('returns an error for an invalid username, password, and email', async (done) => {
    delete this.options.form.email;
    delete this.options.form.username;
    delete this.options.form.password;
    try {
      const response = await Request(this.options);
      expect(response).not.toBeDefined();
      log(postUserRouteTitle, 'Should have thrown error');
    } catch (response) {
      expect(response).toBeDefined();
      expect(response.statusCode).toBe(400);

      const details = JSON.parse(response.error);
      expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(details.error.message).toContain('email');
      expect(details.error.message).toContain('username');
      expect(details.error.message).toContain('password');
      log(postUserRouteTitle, response.error);
    }

    done();
  });

  describe('Existing user', () => {
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

    it('returns an error for an already existing username', async (done) => {
      this.options.form.username = this.user.username;
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        log(postUserRouteTitle, 'Should have thrown error');
      } catch (response) {
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(403);

        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.Resource.type);
        expect(details.error.message).toBe('A user with that username already exists');
        log(postUserRouteTitle, response.error);
      }

      done();
    });
  });

  it('creates a new user and receives an authentication token', async (done) => {
    const response = await Request(this.options);
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(201);

    const details = JSON.parse(response.body);
    expect(details.success.token.toLowerCase()).toContain('bearer');
    expect(details.success.message).toBe('Successful user creation');
    this.deleteUser = true;
    log(postUserRouteTitle, response.body);
    done();
  });
});

const getUserRouteTitle = 'Get user route';
describe(getUserRouteTitle, () => {
  beforeEach(async (done) => {
    this.options = {
      method: 'GET',
      uri: url,
      resolveWithFullResponse: true,
      headers: {},
    };

    this.updateUrl = function updateUrl(_user) {
      this.options.uri = `${url}/${_user}`;
    };

    const details = {
      username: Utils.newUuid(),
      password: Utils.newUuid(),
      email: `${Utils.newUuid()}@${Utils.newUuid()}.com`,
    };

    this.user = await UserMiddleware.create(details);
    const authDetails = await UserMiddleware.getAuthToken(details);
    this.options.headers.authorization = authDetails.success.token;
    done();
  });

  afterEach(async (done) => {
    await UserMiddleware.remove(this.user, { username: this.user.username });
    delete this.user;
    delete this.options;
    delete this.updateUrl;
    done();
  });

  it('returns an authentication error for a missing auth token', async (done) => {
    this.updateUrl(this.user.username);
    delete this.options.headers.authorization;
    try {
      const response = await Request(this.options);
      expect(response).not.toBeDefined();
      log(postUserRouteTitle, 'Should have thrown error');
    } catch (response) {
      expect(response).toBeDefined();
      expect(response.statusCode).toBe(401);

      const details = JSON.parse(response.error);
      expect(details.error.type).toBe(DroppError.type.Auth.type);
      expect(details.error.message).toBe(DroppError.TokenReason.missing);
      log(postUserRouteTitle, response.error);
    }

    done();
  });

  it('returns an error for an invalid username', async (done) => {
    this.updateUrl('__.');
    try {
      const response = await Request(this.options);
      expect(response).not.toBeDefined();
      log(postUserRouteTitle, 'Should have thrown error');
    } catch (response) {
      expect(response).toBeDefined();
      expect(response.statusCode).toBe(400);

      const details = JSON.parse(response.error);
      expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(details.error.message).toContain('username');
      log(postUserRouteTitle, response.error);
    }

    done();
  });

  it('returns an error for a non-existent user', async (done) => {
    this.updateUrl(Utils.newUuid());
    try {
      const response = await Request(this.options);
      expect(response).not.toBeDefined();
      log(postUserRouteTitle, 'Should have thrown error');
    } catch (response) {
      expect(response).toBeDefined();
      expect(response.statusCode).toBe(404);

      const details = JSON.parse(response.error);
      expect(details.error.type).toBe(DroppError.type.ResourceDNE.type);
      expect(details.error.message).toBe('That user does not exist');
      log(postUserRouteTitle, response.error);
    }

    done();
  });

  it('gets the user\'s private details', async (done) => {
    this.updateUrl(this.user.username);
    const response = await Request(this.options, this.auth);
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(200);

    const details = JSON.parse(response.body);
    expect(details).toBeDefined();
    expect(details.email).toBe(this.user.email);
    expect(details.username).toBe(this.user.username);
    expect(Object.keys(details.follows).length).toBe(0);
    expect(Object.keys(details.followers).length).toBe(0);
    expect(details.followsCount).toBe(0);
    expect(details.followerCount).toBe(0);
    expect(Object.keys(details.followRequests).length).toBe(0);
    expect(Object.keys(details.followerRequests).length).toBe(0);
    expect(details.followRequestCount).toBe(0);
    expect(details.followerRequestCount).toBe(0);
    log(postUserRouteTitle, response.body);
    done();
  });

  describe('Different user', () => {
    beforeEach(async (done) => {
      const details = {
        username: Utils.newUuid(),
        password: Utils.newUuid(),
        email: `${Utils.newUuid()}@${Utils.newUuid()}.com`,
      };

      this.user2 = await UserMiddleware.create(details);
      done();
    });

    afterEach(async (done) => {
      await UserMiddleware.remove(this.user2, { username: this.user2.username });
      delete this.user2;
      done();
    });

    it('gets the user\'s public details', async (done) => {
      this.updateUrl(this.user2.username);
      const response = await Request(this.options, this.auth);
      expect(response).toBeDefined();
      expect(response.statusCode).toBe(200);

      const details = JSON.parse(response.body);
      expect(details).toBeDefined();
      expect(details.username).toBe(this.user2.username);
      expect(Object.keys(details.follows).length).toBe(0);
      expect(Object.keys(details.followers).length).toBe(0);
      expect(details.followsCount).toBe(0);
      expect(details.followerCount).toBe(0);
      expect(details.email).not.toBeDefined();
      expect(details.followRequests).not.toBeDefined();
      expect(details.followerRequests).not.toBeDefined();
      expect(details.followRequestCount).not.toBeDefined();
      expect(details.followerRequestCount).not.toBeDefined();
      log(postUserRouteTitle, response.body);
      done();
    });
  });
});

const updateUserRouteTitle = 'Update user route';
describe(updateUserRouteTitle, () => {
  beforeEach(async (done) => {
    this.oldPassword = Utils.newUuid();
    this.options = {
      method: 'PUT',
      uri: url,
      resolveWithFullResponse: true,
      headers: {},
      form: {
        newPassword: Utils.newUuid(),
        oldPassword: this.oldPassword,
        newEmail: `${Utils.newUuid()}@${Utils.newUuid()}.com`,
      },
    };

    this.updateUrl = function updateUrl(_user, _attribute) {
      this.options.uri = `${url}/${_user}/${_attribute}`;
    };

    const details = {
      username: Utils.newUuid(),
      password: this.oldPassword,
      email: `${Utils.newUuid()}@${Utils.newUuid()}.com`,
    };

    this.user = await UserMiddleware.create(details);
    const authDetails = await UserMiddleware.getAuthToken(details);
    this.options.headers.authorization = authDetails.success.token;
    done();
  });

  afterEach(async (done) => {
    await UserMiddleware.remove(this.user, { username: this.user.username });
    delete this.user;
    delete this.options;
    delete this.updateUrl;
    delete this.oldPassword;
    done();
  });

  const updateEmailTitle = 'Update email';
  describe(updateEmailTitle, () => {
    it('returns an authentication error for a missing auth token', async (done) => {
      this.updateUrl(this.user.username, 'email');
      delete this.options.headers.authorization;
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        log(updateEmailTitle, 'Should have thrown error');
      } catch (response) {
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(401);

        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.Auth.type);
        expect(details.error.message).toBe(DroppError.TokenReason.missing);
        log(updateEmailTitle, response.error);
      }

      done();
    });

    it('returns an error for an invalid email', async (done) => {
      delete this.options.form.newEmail;
      this.updateUrl(this.user.username, 'email');
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        log(updateEmailTitle, 'Should have thrown error');
      } catch (response) {
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(400);

        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(details.error.message).toBe('newEmail');
        log(updateEmailTitle, response.error);
      }

      done();
    });

    it('returns an error for updating a different user', async (done) => {
      this.updateUrl(Utils.newUuid(), 'email');
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        log(updateEmailTitle, 'Should have thrown error');
      } catch (response) {
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(403);

        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.Resource.type);
        expect(details.error.message).toBe('Unauthorized to update that user\'s email');
        log(updateEmailTitle, response.error);
      }

      done();
    });

    it('updates the user\'s email address', async (done) => {
      this.updateUrl(this.user.username, 'email');
      const response = await Request(this.options);
      expect(response).toBeDefined();
      expect(response.statusCode).toBe(200);

      const details = JSON.parse(response.body);
      expect(details.success.message).toBe('Successful email update');

      // Verify user information from the backend
      const userData = await UserMiddleware.get(this.user, { username: this.user.username });
      expect(userData.email).toBe(this.options.form.newEmail);
      log(updateEmailTitle, response.body);
      done();
    });
  });

  const updatePasswordTitle = 'Upate password';
  describe(updatePasswordTitle, () => {
    it('returns an authentication error for a missing auth token', async (done) => {
      this.updateUrl(this.user.username, 'password');
      delete this.options.headers.authorization;
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        log(updatePasswordTitle, 'Should have thrown error');
      } catch (response) {
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(401);

        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.Auth.type);
        expect(details.error.message).toBe(DroppError.TokenReason.missing);
        log(updatePasswordTitle, response.error);
      }

      done();
    });

    it('returns an error for an invalid old password', async (done) => {
      delete this.options.form.oldPassword;
      this.updateUrl(this.user.username, 'password');
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        log(updatePasswordTitle, 'Should have thrown error');
      } catch (response) {
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(400);

        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(details.error.message).toBe('oldPassword');
        log(updatePasswordTitle, response.error);
      }

      done();
    });

    it('returns an error for an invalid new password', async (done) => {
      delete this.options.form.newPassword;
      this.updateUrl(this.user.username, 'password');
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        log(updatePasswordTitle, 'Should have thrown error');
      } catch (response) {
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(400);

        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(details.error.message).toBe('newPassword');
        log(updatePasswordTitle, response.error);
      }

      done();
    });

    it('returns an error for an invalid old & new password', async (done) => {
      delete this.options.form.oldPassword;
      delete this.options.form.newPassword;
      this.updateUrl(this.user.username, 'password');
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        log(updatePasswordTitle, 'Should have thrown error');
      } catch (response) {
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(400);

        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(details.error.message).toContain('oldPassword');
        expect(details.error.message).toContain('newPassword');
        log(updatePasswordTitle, response.error);
      }

      done();
    });

    it('returns an error when the old & new passwords are the same', async (done) => {
      this.options.form.newPassword = this.options.form.oldPassword;
      this.updateUrl(this.user.username, 'password');
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        log(updatePasswordTitle, 'Should have thrown error');
      } catch (response) {
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(403);

        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.Resource.type);
        expect(details.error.message).toBe('New password must be different from old password');
        log(updatePasswordTitle, response.error);
      }

      done();
    });

    it('returns an error for updating a different user', async (done) => {
      this.updateUrl(Utils.newUuid(), 'password');
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        log(updatePasswordTitle, 'Should have thrown error');
      } catch (response) {
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(403);

        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.Resource.type);
        expect(details.error.message).toBe('Unauthorized to update that user\'s password');
        log(updatePasswordTitle, response.error);
      }

      done();
    });

    it(
      'returns an error when the old password doesn\'t match the existing password',
      async (done) => {
        this.options.form.oldPassword = Utils.newUuid();
        this.updateUrl(this.user.username, 'password');
        try {
          const response = await Request(this.options);
          expect(response).not.toBeDefined();
          log(updatePasswordTitle, 'Should have thrown error');
        } catch (response) {
          expect(response).toBeDefined();
          expect(response.statusCode).toBe(403);

          const details = JSON.parse(response.error);
          expect(details.error.type).toBe(DroppError.type.Resource.type);
          expect(details.error.message).toBe('Old password must match existing password');
          log(updatePasswordTitle, response.error);
        }

        done();
      }
    );

    describe('Successful update', () => {
      beforeEach(async (done) => {
        this.oldHashedPassword = await UserAccessor.getPassword(this.user.username);
        done();
      });

      afterEach(() => {
        delete this.oldHashedPassword;
      });
    });

    it('updates the user\'s password', async (done) => {
      this.updateUrl(this.user.username, 'password');
      const response = await Request(this.options);
      expect(response).toBeDefined();
      expect(response.statusCode).toBe(200);

      const details = JSON.parse(response.body);
      expect(details.success.message).toBe('Successful password update');
      expect(details.success.token.toLowerCase()).toContain('bearer');

      // Verify user information from the backend
      const newPassword = await UserAccessor.getPassword(this.user.username);
      expect(newPassword).not.toBe(this.oldHashedPassword);
      const matchResult = await AuthModule.validatePasswords(
        this.options.form.newPassword,
        newPassword
      );
      expect(matchResult).toBe(true);
      log(updatePasswordTitle, response.body);
      done();
    });
  });
});

const removeUserTitle = 'Remove user route';
describe(removeUserTitle, () => {
  beforeEach(async (done) => {
    this.shouldDeleteUser = true;
    this.options = {
      method: 'DELETE',
      uri: url,
      resolveWithFullResponse: true,
      headers: {},
    };

    this.updateUrl = function updateUrl(_user) {
      this.options.uri = `${url}/${_user}`;
    };

    const details = {
      username: Utils.newUuid(),
      password: Utils.newUuid(),
      email: `${Utils.newUuid()}@${Utils.newUuid()}.com`,
    };

    this.user = await UserMiddleware.create(details);
    const authDetails = await UserMiddleware.getAuthToken(details);
    this.options.headers.authorization = authDetails.success.token;
    done();
  });

  afterEach(async (done) => {
    if (this.shouldDeleteUser === true) {
      await UserMiddleware.remove(this.user, { username: this.user.username });
    }

    delete this.user;
    delete this.options;
    delete this.updateUrl;
    delete this.shouldDeleteUser;
    done();
  });

  it('returns an authentication error for a missing auth token', async (done) => {
    this.updateUrl(this.user.username);
    delete this.options.headers.authorization;
    try {
      const response = await Request(this.options);
      expect(response).not.toBeDefined();
      log(removeUserTitle, 'Should have thrown error');
    } catch (response) {
      expect(response).toBeDefined();
      expect(response.statusCode).toBe(401);

      const details = JSON.parse(response.error);
      expect(details.error.type).toBe(DroppError.type.Auth.type);
      expect(details.error.message).toBe(DroppError.TokenReason.missing);
      log(removeUserTitle, response.error);
    }

    done();
  });

  it('returns an error for an invalid username', async (done) => {
    this.updateUrl('__.');
    try {
      const response = await Request(this.options);
      expect(response).not.toBeDefined();
      log(removeUserTitle, 'Should have thrown error');
    } catch (response) {
      expect(response).toBeDefined();
      expect(response.statusCode).toBe(400);

      const details = JSON.parse(response.error);
      expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(details.error.message).toBe('username');
      log(removeUserTitle, response.error);
    }

    done();
  });

  it('returns an error for removing a different user', async (done) => {
    this.updateUrl(Utils.newUuid());
    try {
      const response = await Request(this.options);
      expect(response).not.toBeDefined();
      log(removeUserTitle, 'Should have thrown error');
    } catch (response) {
      expect(response).toBeDefined();
      expect(response.statusCode).toBe(403);

      const details = JSON.parse(response.error);
      expect(details.error.type).toBe(DroppError.type.Resource.type);
      expect(details.error.message).toBe('Unauthorized to remove that user');
      log(removeUserTitle, response.error);
    }

    done();
  });

  it('removes a user', async (done) => {
    this.updateUrl(this.user.username);
    const response = await Request(this.options);
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(200);

    const details = JSON.parse(response.body);
    expect(details.success.message).toBe('Successfully removed all user data');

    // Verify user information from the backend
    const result = await UserAccessor.get(this.user.username);
    expect(result).toBeNull();
    this.shouldDeleteUser = Utils.hasValue(result);
    log(removeUserTitle, response.body);
    done();
  });
});

const interUserRoutes = 'Inter-user routes';
describe(interUserRoutes, () => {
  beforeEach(async (done) => {
    this.details1 = {
      username: Utils.newUuid(),
      password: Utils.newUuid(),
      email: `${Utils.newUuid()}@${Utils.newUuid()}.com`,
    };

    this.details2 = {
      username: Utils.newUuid(),
      password: Utils.newUuid(),
      email: `${Utils.newUuid()}@${Utils.newUuid()}.com`,
    };

    this.user1 = await UserMiddleware.create(this.details1);
    this.user2 = await UserMiddleware.create(this.details2);
    done();
  });

  afterEach(async (done) => {
    await UserMiddleware.remove(this.user1, { username: this.user1.username });
    await UserMiddleware.remove(this.user2, { username: this.user2.username });
    delete this.user1;
    delete this.user2;
    delete this.details1;
    delete this.details2;
    done();
  });

  const requestToFollowTitle = 'Request to follow';
  describe(requestToFollowTitle, () => {
    beforeEach(async (done) => {
      this.options = {
        method: 'POST',
        uri: url,
        resolveWithFullResponse: true,
        headers: {},
        form: {},
      };

      this.updateUrl = function updateUrl(_user) {
        this.options.uri = `${url}/${_user}/follows/requests`;
      };

      const authDetails = await UserMiddleware.getAuthToken(this.details1);
      this.options.headers.authorization = authDetails.success.token;
      done();
    });

    afterEach(() => {
      delete this.options;
      delete this.updateUrl;
    });

    it('returns an authentication error for a missing auth token', async (done) => {
      this.updateUrl(this.user1.username);
      this.options.form.requestedUser = this.user2.username;
      delete this.options.headers.authorization;
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        log(requestToFollowTitle, 'Should have thrown error');
      } catch (response) {
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(401);

        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.Auth.type);
        expect(details.error.message).toBe(DroppError.TokenReason.missing);
        log(requestToFollowTitle, response.error);
      }

      done();
    });

    it('returns an error for an invalid username', async (done) => {
      this.updateUrl('__.');
      this.options.form.requestedUser = this.user2.username;
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        log(requestToFollowTitle, 'Should have thrown error');
      } catch (response) {
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(400);

        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(details.error.message).toBe('username');
        log(requestToFollowTitle, response.error);
      }

      done();
    });

    it('returns an error for an invalid requested username', async (done) => {
      this.updateUrl(this.user1.username);
      this.options.form.requestedUser = '__.';
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        log(requestToFollowTitle, 'Should have thrown error');
      } catch (response) {
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(400);

        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(details.error.message).toBe('requestedUser');
        log(requestToFollowTitle, response.error);
      }

      done();
    });

    it(
      'returns an error for attempting to access a different user\'s follow requests',
      async (done) => {
        this.updateUrl(this.user2.username);
        this.options.form.requestedUser = this.user2.username;
        try {
          const response = await Request(this.options);
          expect(response).not.toBeDefined();
          log(requestToFollowTitle, 'Should have thrown error');
        } catch (response) {
          expect(response).toBeDefined();
          expect(response.statusCode).toBe(403);

          const details = JSON.parse(response.error);
          expect(details.error.type).toBe(DroppError.type.Resource.type);
          expect(details.error.message).toBe('Unauthorized to access that user\'s follow requests');
          log(requestToFollowTitle, response.error);
        }

        done();
      }
    );

    it('returns an error for requesting to follow the same user', async (done) => {
      this.updateUrl(this.user1.username);
      this.options.form.requestedUser = this.user1.username;
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        log(requestToFollowTitle, 'Should have thrown error');
      } catch (response) {
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(403);

        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.Resource.type);
        expect(details.error.message).toBe('You cannot request to follow yourself');
        log(requestToFollowTitle, response.error);
      }

      done();
    });

    it('returns an error for a non-existent user', async (done) => {
      this.updateUrl(this.user1.username);
      this.options.form.requestedUser = Utils.newUuid();
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        log(requestToFollowTitle, 'Should have thrown error');
      } catch (response) {
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(404);

        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.ResourceDNE.type);
        expect(details.error.message).toBe('That user does not exist');
        log(requestToFollowTitle, response.error);
      }

      done();
    });

    const existingFollowRequestTitle = 'Existing follow request';
    describe(existingFollowRequestTitle, () => {
      beforeEach(async (done) => {
        await UserAccessor.addFollowRequest(this.user1, this.user2);
        done();
      });

      afterEach(async (done) => {
        await UserAccessor.removeFollowRequest(this.user1, this.user2);
        done();
      });

      it('returns an error for an existing follow request', async (done) => {
        this.updateUrl(this.user1.username);
        this.options.form.requestedUser = this.user2.username;
        try {
          const response = await Request(this.options);
          expect(response).not.toBeDefined();
          log(existingFollowRequestTitle, 'Should have thrown error');
        } catch (response) {
          expect(response).toBeDefined();
          expect(response.statusCode).toBe(403);

          const details = JSON.parse(response.error);
          expect(details.error.type).toBe(DroppError.type.Resource.type);
          expect(details.error.message).toBe('You already have a pending follow request for that user');
          log(existingFollowRequestTitle, response.error);
        }

        done();
      });
    });

    const successFollowRequestTitle = 'Success follow request';
    describe(successFollowRequestTitle, () => {
      afterEach(async (done) => {
        await UserAccessor.removeFollowRequest(this.user1, this.user2);
        done();
      });

      it('sends a request to follow a user', async (done) => {
        this.updateUrl(this.user1.username);
        this.options.form.requestedUser = this.user2.username;
        const response = await Request(this.options);
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(200);

        const details = JSON.parse(response.body);
        expect(details.success.message).toBe('Successful follow request');

        // Verify user information from the backend
        const user = await UserAccessor.get(this.user2.username);
        expect(user.hasFollowerRequest(this.user1.username)).toBe(true);
        log(successFollowRequestTitle, response.body);
        done();
      });
    });
  });

  const removeFollowRequestTitle = 'Remove follow request';
  describe(removeFollowRequestTitle, () => {
    beforeEach(async (done) => {
      this.options = {
        method: 'DELETE',
        uri: url,
        resolveWithFullResponse: true,
        headers: {},
        form: {},
      };

      this.updateUrl = function updateUrl(_user, _requestedUser) {
        this.options.uri = `${url}/${_user}/follows/requests/${_requestedUser}`;
      };

      const authDetails = await UserMiddleware.getAuthToken(this.details1);
      this.options.headers.authorization = authDetails.success.token;
      done();
    });

    afterEach(() => {
      delete this.options;
      delete this.updateUrl;
    });

    it('returns an authentication error for a missing auth token', async (done) => {
      this.updateUrl(this.user1.username, this.user2.username);
      delete this.options.headers.authorization;
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        log(removeFollowRequestTitle, 'Should have thrown error');
      } catch (response) {
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(401);

        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.Auth.type);
        expect(details.error.message).toBe(DroppError.TokenReason.missing);
        log(removeFollowRequestTitle, response.error);
      }

      done();
    });

    it('returns an error for an invalid username', async (done) => {
      this.updateUrl('__.', this.user2.username);
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        log(removeFollowRequestTitle, 'Should have thrown error');
      } catch (response) {
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(400);

        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(details.error.message).toBe('username');
        log(removeFollowRequestTitle, response.error);
      }

      done();
    });

    it('returns an error for an invalid requested username', async (done) => {
      this.updateUrl(this.user1.username, '__.');

      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        log(removeFollowRequestTitle, 'Should have thrown error');
      } catch (response) {
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(400);

        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(details.error.message).toBe('requestedUser');
        log(removeFollowRequestTitle, response.error);
      }

      done();
    });

    it('returns an error for an invalid username and requested username', async (done) => {
      this.updateUrl('__.', '__.');

      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        log(removeFollowRequestTitle, 'Should have thrown error');
      } catch (response) {
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(400);

        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(details.error.message).toBe('username,requestedUser');
        log(removeFollowRequestTitle, response.error);
      }

      done();
    });

    it(
      'returns an error for attempting to access a different user\'s follow requests',
      async (done) => {
        this.updateUrl(this.user2.username, this.user2.username);
        try {
          const response = await Request(this.options);
          expect(response).not.toBeDefined();
          log(removeFollowRequestTitle, 'Should have thrown error');
        } catch (response) {
          expect(response).toBeDefined();
          expect(response.statusCode).toBe(403);

          const details = JSON.parse(response.error);
          expect(details.error.type).toBe(DroppError.type.Resource.type);
          expect(details.error.message).toBe('Unauthorized to access that user\'s follow requests');
          log(removeFollowRequestTitle, response.error);
        }

        done();
      }
    );

    it(
      'returns an error for attempting to remove a follow request from the same user',
      async (done) => {
        this.updateUrl(this.user1.username, this.user1.username);
        try {
          const response = await Request(this.options);
          expect(response).not.toBeDefined();
          log(removeFollowRequestTitle, 'Should have thrown error');
        } catch (response) {
          expect(response).toBeDefined();
          expect(response.statusCode).toBe(403);

          const details = JSON.parse(response.error);
          expect(details.error.type).toBe(DroppError.type.Resource.type);
          expect(details.error.message).toBe('You cannot remove a follow request from yourself');
          log(removeFollowRequestTitle, response.error);
        }

        done();
      }
    );

    it('returns an error for a non-existent user', async (done) => {
      this.updateUrl(this.user1.username, Utils.newUuid());
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        log(postUserRouteTitle, 'Should have thrown error');
      } catch (response) {
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(404);

        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.ResourceDNE.type);
        expect(details.error.message).toBe('That user does not exist');
        log(postUserRouteTitle, response.error);
      }

      done();
    });

    it(
      'returns an error for attempting to remove a non-existent follow request',
      async (done) => {
        this.updateUrl(this.user1.username, this.user2.username);
        try {
          const response = await Request(this.options);
          expect(response).not.toBeDefined();
          log(removeFollowRequestTitle, 'Should have thrown error');
        } catch (response) {
          expect(response).toBeDefined();
          expect(response.statusCode).toBe(403);

          const details = JSON.parse(response.error);
          expect(details.error.type).toBe(DroppError.type.Resource.type);
          expect(details.error.message).toBe('You do not have a pending follow request for that user');
          log(removeFollowRequestTitle, response.error);
        }

        done();
      }
    );

    const successFollowRequestRemovalTitle = 'Success follow request removal';
    describe(successFollowRequestRemovalTitle, () => {
      beforeEach(async (done) => {
        await UserAccessor.addFollowRequest(this.user1, this.user2);
        done();
      });

      it('removes a follow request from a user', async (done) => {
        this.updateUrl(this.user1.username, this.user2.username);
        const response = await Request(this.options);
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(200);

        const details = JSON.parse(response.body);
        expect(details.success.message).toBe('Successful follow request removal');

        // Verify user information from the backend
        const user = await UserAccessor.get(this.user2.username);
        expect(user.hasFollowerRequest(this.user1.username)).toBe(false);
        log(successFollowRequestRemovalTitle, response.body);
        done();
      });
    });
  });

  const respondToFollowerRequestTitle = 'Respond to follower request';
  describe(respondToFollowerRequestTitle, () => {
    beforeEach(async (done) => {
      this.options = {
        method: 'PUT',
        uri: url,
        resolveWithFullResponse: true,
        headers: {},
        form: {},
      };

      this.updateUrl = function updateUrl(_user, _requestedUser) {
        this.options.uri = `${url}/${_user}/followers/requests/${_requestedUser}`;
      };

      const authDetails = await UserMiddleware.getAuthToken(this.details1);
      this.options.headers.authorization = authDetails.success.token;
      done();
    });

    afterEach(() => {
      delete this.options;
      delete this.updateUrl;
    });

    it('returns an authentication error for a missing auth token', async (done) => {
      this.options.form.accept = true;
      this.updateUrl(this.user1.username, this.user2.username);
      delete this.options.headers.authorization;
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        log(respondToFollowerRequestTitle, 'Should have thrown error');
      } catch (response) {
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(401);

        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.Auth.type);
        expect(details.error.message).toBe(DroppError.TokenReason.missing);
        log(respondToFollowerRequestTitle, response.error);
      }

      done();
    });

    it('returns an error for an invalid username', async (done) => {
      this.options.form.accept = true;
      this.updateUrl('__.', this.user2.username);
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        log(respondToFollowerRequestTitle, 'Should have thrown error');
      } catch (response) {
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(400);

        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(details.error.message).toBe('username');
        log(respondToFollowerRequestTitle, response.error);
      }

      done();
    });

    it('returns an error for an invalid requested username', async (done) => {
      this.options.form.accept = true;
      this.updateUrl(this.user1.username, '__.');
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        log(respondToFollowerRequestTitle, 'Should have thrown error');
      } catch (response) {
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(400);

        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(details.error.message).toBe('requestedUser');
        log(respondToFollowerRequestTitle, response.error);
      }

      done();
    });

    it('returns an error for an invalid username and requested username', async (done) => {
      this.options.form.accept = true;
      this.updateUrl('__.', '__.');
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        log(respondToFollowerRequestTitle, 'Should have thrown error');
      } catch (response) {
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(400);

        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(details.error.message).toBe('username,requestedUser');
        log(respondToFollowerRequestTitle, response.error);
      }

      done();
    });

    it('returns an error for an invalid accept body parameter', async (done) => {
      this.options.form.accept = Utils.newUuid();
      this.updateUrl(this.user1.username, this.user2.username);
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        log(respondToFollowerRequestTitle, 'Should have thrown error');
      } catch (response) {
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(400);

        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(details.error.message).toBe('accept');
        log(respondToFollowerRequestTitle, response.error);
      }

      done();
    });

    it(
      'returns an error for attempting to access a different user\'s follower requests',
      async (done) => {
        this.options.form.accept = true;
        this.updateUrl(this.user2.username, this.user2.username);
        try {
          const response = await Request(this.options);
          expect(response).not.toBeDefined();
          log(respondToFollowerRequestTitle, 'Should have thrown error');
        } catch (response) {
          expect(response).toBeDefined();
          expect(response.statusCode).toBe(403);

          const details = JSON.parse(response.error);
          expect(details.error.type).toBe(DroppError.type.Resource.type);
          expect(details.error.message).toBe('Unauthorized to access that user\'s follower requests');
          log(respondToFollowerRequestTitle, response.error);
        }

        done();
      }
    );

    it(
      'returns an error for attempting to respond to a follower request from the same user',
      async (done) => {
        this.options.form.accept = true;
        this.updateUrl(this.user1.username, this.user1.username);
        try {
          const response = await Request(this.options);
          expect(response).not.toBeDefined();
          log(respondToFollowerRequestTitle, 'Should have thrown error');
        } catch (response) {
          expect(response).toBeDefined();
          expect(response.statusCode).toBe(403);

          const details = JSON.parse(response.error);
          expect(details.error.type).toBe(DroppError.type.Resource.type);
          expect(details.error.message).toBe('You cannot respond to a follower request from yourself');
          log(respondToFollowerRequestTitle, response.error);
        }

        done();
      }
    );

    it('returns an error for a non-existent user', async (done) => {
      this.options.form.accept = true;
      this.updateUrl(this.user1.username, Utils.newUuid());
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        log(respondToFollowerRequestTitle, 'Should have thrown error');
      } catch (response) {
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(404);

        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.ResourceDNE.type);
        expect(details.error.message).toBe('That user does not exist');
        log(respondToFollowerRequestTitle, response.error);
      }

      done();
    });

    it(
      'returns an error for attempting to remove a non-existent follow request',
      async (done) => {
        this.options.form.accept = true;
        this.updateUrl(this.user1.username, this.user2.username);
        try {
          const response = await Request(this.options);
          expect(response).not.toBeDefined();
          log(removeFollowRequestTitle, 'Should have thrown error');
        } catch (response) {
          expect(response).toBeDefined();
          expect(response.statusCode).toBe(403);

          const details = JSON.parse(response.error);
          expect(details.error.type).toBe(DroppError.type.Resource.type);
          expect(details.error.message).toBe('That user has not requested to follow you');
          log(removeFollowRequestTitle, response.error);
        }

        done();
      }
    );

    const successRespondToFollowerRequestTitle = 'Success respond to follower request';
    describe(successRespondToFollowerRequestTitle, () => {
      beforeEach(async (done) => {
        this.removeFollower = true;
        await UserAccessor.addFollowRequest(this.user2, this.user1);
        done();
      });

      afterEach(async (done) => {
        if (this.removeFollower === true) {
          await UserAccessor.removeFollow(this.user2, this.user1);
        }

        delete this.removeFollower;
        done();
      });

      it('accepts a follower request from a user', async (done) => {
        this.options.form.accept = true;
        this.updateUrl(this.user1.username, this.user2.username);
        const response = await Request(this.options);
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(200);

        const details = JSON.parse(response.body);
        expect(details.success.message).toBe('Successful follow request acceptance');

        // Verify user information from the backend
        const user = await UserAccessor.get(this.user2.username);
        expect(user.doesFollow(this.user1.username)).toBe(true);
        expect(user.hasFollowRequest(this.user1.username)).toBe(false);
        log(successRespondToFollowerRequestTitle, response.body);
        done();
      });

      it('declines a follower request from a user', async (done) => {
        this.options.form.accept = false;
        this.updateUrl(this.user1.username, this.user2.username);
        const response = await Request(this.options);
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(200);

        const details = JSON.parse(response.body);
        expect(details.success.message).toBe('Successful follow request denial');

        // Verify user information from the backend
        const user = await UserAccessor.get(this.user2.username);
        expect(user.doesFollow(this.user1.username)).toBe(false);
        expect(user.hasFollowRequest(this.user1.username)).toBe(false);
        log(successRespondToFollowerRequestTitle, response.body);
        done();
      });
    });
  });

  const unfollowTitle = 'Unfollow';
  describe(unfollowTitle, () => {
    beforeEach(async (done) => {
      this.options = {
        method: 'DELETE',
        uri: url,
        resolveWithFullResponse: true,
        headers: {},
      };

      this.updateUrl = function updateUrl(_user, _follow) {
        this.options.uri = `${url}/${_user}/follows/${_follow}`;
      };

      const authDetails = await UserMiddleware.getAuthToken(this.details1);
      this.options.headers.authorization = authDetails.success.token;
      done();
    });

    afterEach(() => {
      delete this.options;
      delete this.updateUrl;
    });

    it('returns an authentication error for a missing auth token', async (done) => {
      this.updateUrl(this.user1.username, this.user2.username);
      delete this.options.headers.authorization;
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        log(unfollowTitle, 'Should have thrown error');
      } catch (response) {
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(401);

        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.Auth.type);
        expect(details.error.message).toBe(DroppError.TokenReason.missing);
        log(unfollowTitle, response.error);
      }

      done();
    });

    it('returns an error for an invalid username', async (done) => {
      this.updateUrl('__.', this.user2.username);
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        log(unfollowTitle, 'Should have thrown error');
      } catch (response) {
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(400);

        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(details.error.message).toBe('username');
        log(unfollowTitle, response.error);
      }

      done();
    });

    it('returns an error for an invalid follow username', async (done) => {
      this.updateUrl(this.user1.username, '__.');
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        log(unfollowTitle, 'Should have thrown error');
      } catch (response) {
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(400);

        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(details.error.message).toBe('follow');
        log(unfollowTitle, response.error);
      }

      done();
    });

    it('returns an error for an invalid username and requested username', async (done) => {
      this.updateUrl('__.', '__.');
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        log(unfollowTitle, 'Should have thrown error');
      } catch (response) {
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(400);

        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(details.error.message).toBe('username,follow');
        log(unfollowTitle, response.error);
      }

      done();
    });

    it(
      'returns an error for attempting to access a different user\'s follows',
      async (done) => {
        this.updateUrl(this.user2.username, this.user2.username);
        try {
          const response = await Request(this.options);
          expect(response).not.toBeDefined();
          log(unfollowTitle, 'Should have thrown error');
        } catch (response) {
          expect(response).toBeDefined();
          expect(response.statusCode).toBe(403);

          const details = JSON.parse(response.error);
          expect(details.error.type).toBe(DroppError.type.Resource.type);
          expect(details.error.message).toBe('Unauthorized to access that user\'s follows');
          log(unfollowTitle, response.error);
        }

        done();
      }
    );

    it('returns an error for attempting to unfollow the same user', async (done) => {
      this.updateUrl(this.user1.username, this.user1.username);
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        log(unfollowTitle, 'Should have thrown error');
      } catch (response) {
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(403);

        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.Resource.type);
        expect(details.error.message).toBe('You cannot unfollow yourself');
        log(unfollowTitle, response.error);
      }

      done();
    });

    it('returns an error for attempting to unfollow a non-existent user', async (done) => {
      this.updateUrl(this.user1.username, Utils.newUuid());
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        log(unfollowTitle, 'Should have thrown error');
      } catch (response) {
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(404);

        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.ResourceDNE.type);
        expect(details.error.message).toBe('That user does not exist');
        log(unfollowTitle, response.error);
      }

      done();
    });

    it('returns an error for attempting to unfollow a non-existent follow', async (done) => {
      this.updateUrl(this.user1.username, this.user2.username);
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        log(unfollowTitle, 'Should have thrown error');
      } catch (response) {
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(403);

        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.Resource.type);
        expect(details.error.message).toBe('You do not follow that user');
        log(unfollowTitle, response.error);
      }

      done();
    });

    const successUnfollowTitle = 'Success unfollow';
    describe(successUnfollowTitle, () => {
      beforeEach(async (done) => {
        await UserAccessor.addFollow(this.user1, this.user2);
        done();
      });

      it('unfollows a user', async (done) => {
        this.updateUrl(this.user1.username, this.user2.username);
        const response = await Request(this.options);
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(200);

        const details = JSON.parse(response.body);
        expect(details.success.message).toBe('Successful unfollow');

        // Verify user information from the backend
        const user = await UserAccessor.get(this.user2.username);
        expect(user.hasFollower(this.user1.username)).toBe(false);
        log(successUnfollowTitle, response.body);
        done();
      });
    });
  });

  const removeFollowerTitle = 'Remove follower';
  describe(removeFollowerTitle, () => {
    beforeEach(async (done) => {
      this.options = {
        method: 'DELETE',
        uri: url,
        resolveWithFullResponse: true,
        headers: {},
      };

      this.updateUrl = function updateUrl(_user, _follower) {
        this.options.uri = `${url}/${_user}/followers/${_follower}`;
      };

      const authDetails = await UserMiddleware.getAuthToken(this.details1);
      this.options.headers.authorization = authDetails.success.token;
      done();
    });

    afterEach(() => {
      delete this.options;
      delete this.updateUrl;
    });

    it('returns an authentication error for a missing auth token', async (done) => {
      this.updateUrl(this.user1.username, this.user2.username);
      delete this.options.headers.authorization;
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        log(removeFollowerTitle, 'Should have thrown error');
      } catch (response) {
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(401);

        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.Auth.type);
        expect(details.error.message).toBe(DroppError.TokenReason.missing);
        log(removeFollowerTitle, response.error);
      }

      done();
    });

    it('returns an error for an invalid username', async (done) => {
      this.updateUrl('__.', this.user2.username);
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        log(removeFollowerTitle, 'Should have thrown error');
      } catch (response) {
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(400);

        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(details.error.message).toBe('username');
        log(removeFollowerTitle, response.error);
      }

      done();
    });

    it('returns an error for an invalid follower username', async (done) => {
      this.updateUrl(this.user1.username, '__.');
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        log(removeFollowerTitle, 'Should have thrown error');
      } catch (response) {
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(400);

        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(details.error.message).toBe('follower');
        log(removeFollowerTitle, response.error);
      }

      done();
    });

    it('returns an error for an invalid username and follower username', async (done) => {
      this.updateUrl('__.', '__.');
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        log(removeFollowerTitle, 'Should have thrown error');
      } catch (response) {
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(400);

        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(details.error.message).toBe('username,follower');
        log(removeFollowerTitle, response.error);
      }

      done();
    });

    it('returns an error for attempting to access a different user\'s followers', async (done) => {
      this.updateUrl(this.user2.username, this.user2.username);
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        log(removeFollowerTitle, 'Should have thrown error');
      } catch (response) {
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(403);

        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.Resource.type);
        expect(details.error.message).toBe('Unauthorized to access that user\'s followers');
        log(removeFollowerTitle, response.error);
      }

      done();
    });

    it('returns an error for attempting to remove the same user as a follower', async (done) => {
      this.updateUrl(this.user1.username, this.user1.username);
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        log(removeFollowerTitle, 'Should have thrown error');
      } catch (response) {
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(403);

        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.Resource.type);
        expect(details.error.message).toBe('You cannot remove yourself as a follower');
        log(removeFollowerTitle, response.error);
      }

      done();
    });

    it('returns an error for attempting to remove a non-existent user', async (done) => {
      this.updateUrl(this.user1.username, Utils.newUuid());
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        log(removeFollowerTitle, 'Should have thrown error');
      } catch (response) {
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(404);

        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.ResourceDNE.type);
        expect(details.error.message).toBe('That user does not exist');
        log(removeFollowerTitle, response.error);
      }

      done();
    });

    it('returns an error for attempting to remove a non-existent follower', async (done) => {
      this.updateUrl(this.user1.username, this.user2.username);
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        log(removeFollowerTitle, 'Should have thrown error');
      } catch (response) {
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(403);

        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.Resource.type);
        expect(details.error.message).toBe('That user does not follow you');
        log(removeFollowerTitle, response.error);
      }

      done();
    });

    const successRemoveFollowerTitle = 'Success unfollow';
    describe(successRemoveFollowerTitle, () => {
      beforeEach(async (done) => {
        await UserAccessor.addFollow(this.user2, this.user1);
        done();
      });

      it('removes a follower', async (done) => {
        this.updateUrl(this.user1.username, this.user2.username);
        const response = await Request(this.options);
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(200);

        const details = JSON.parse(response.body);
        expect(details.success.message).toBe('Successful follower removal');

        // Verify user information from the backend
        const user = await UserAccessor.get(this.user2.username);
        expect(user.doesFollow(this.user1.username)).toBe(false);
        log(successRemoveFollowerTitle, response.body);
        done();
      });
    });
  });
});
/* eslint-enable no-undef */

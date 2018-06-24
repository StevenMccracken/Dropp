const Log = require('../../logger');
const Server = require('../../../index');
const User = require('../../../src/models/User');
const TestConstants = require('../../constants');
const Request = require('request-promise-native');
const Dropp = require('../../../src/models/Dropp');
const Utils = require('../../../src/utilities/utils');
const Location = require('../../../src/models/Location');
const UserAccessor = require('../../../src/database/user');
const DroppError = require('../../../src/errors/DroppError');
const DroppAccessor = require('../../../src/database/dropp');
const Constants = require('../../../src/utilities/constants');
const UserMiddleware = require('../../../src/middleware/user');

const url = `${TestConstants.router.url(Server.port)}${Constants.router.routes.dropps.base}`;
/* eslint-disable no-undef */
describe(TestConstants.router.testName, () => {
  beforeEach(async (done) => {
    Log.beforeEach(TestConstants.router.testName, TestConstants.router.testName, true);
    const details = {
      username: Utils.newUuid(),
      password: Utils.newUuid(),
      email: TestConstants.params.uuidEmail(),
    };

    this.user1 = await UserMiddleware.create(details);
    const authDetails = await UserMiddleware.getAuthToken(details);
    this.authToken = authDetails.success.token;
    Log.beforeEach(TestConstants.router.testName, TestConstants.router.testName, false);
    done();
  });

  afterEach(async (done) => {
    Log.afterEach(TestConstants.router.testName, TestConstants.router.testName, true);
    await UserMiddleware.remove(this.user1, { username: this.user1.username });
    delete this.user1;
    delete this.authToken;
    Log.afterEach(TestConstants.router.testName, TestConstants.router.testName, false);
    done();
  });

  const getDroppRouteTitle = 'Get dropp route';
  describe(getDroppRouteTitle, () => {
    beforeEach(async (done) => {
      Log.beforeEach(TestConstants.router.testName, getDroppRouteTitle, true);
      this.options = {
        method: TestConstants.router.methods.get,
        uri: url,
        resolveWithFullResponse: true,
        headers: {
          authorization: this.authToken,
        },
      };

      this.updateUrl = (_dropp) => {
        this.options.uri = `${url}/${_dropp}`;
      };

      this.dropp1 = new Dropp({
        timestamp: TestConstants.params.defaultTimestamp,
        media: false,
        text: Utils.newUuid(),
        username: this.user1.username,
        location: new Location({
          latitude: TestConstants.params.defaultLocation,
          longitude: TestConstants.params.defaultLocation,
        }),
      });

      await DroppAccessor.add(this.dropp1);
      Log.beforeEach(TestConstants.router.testName, getDroppRouteTitle, false);
      done();
    });

    afterEach(async (done) => {
      Log.afterEach(TestConstants.router.testName, getDroppRouteTitle, true);
      await DroppAccessor.remove(this.dropp1);
      delete this.dropp1;
      delete this.options;
      delete this.updateUrl;
      Log.afterEach(TestConstants.router.testName, getDroppRouteTitle, false);
      done();
    });

    const it1 = 'returns an authentication error for a missing auth token';
    it(it1, async (done) => {
      Log.it(TestConstants.router.testName, getDroppRouteTitle, it1, true);
      this.updateUrl(this.dropp1.id);
      delete this.options.headers.authorization;
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(
          TestConstants.router.testName,
          getDroppRouteTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (response) {
        expect(response.statusCode).toBe(DroppError.type.Auth.status);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.Auth.type);
        expect(details.error.message).toBe(DroppError.TokenReason.missing);
        Log.log(TestConstants.router.testName, getDroppRouteTitle, response.error);
      }

      Log.it(TestConstants.router.testName, getDroppRouteTitle, it1, false);
      done();
    });

    const it2 = 'returns an error for an invalid dropp ID';
    it(it2, async (done) => {
      Log.it(TestConstants.router.testName, getDroppRouteTitle, it2, true);
      this.updateUrl(TestConstants.params.invalidChars.encodedDroppId);
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(
          TestConstants.router.testName,
          getDroppRouteTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (response) {
        expect(response.statusCode).toBe(DroppError.type.InvalidRequest.status);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(details.error.message).toContain(Constants.params.id);
        Log.log(TestConstants.router.testName, getDroppRouteTitle, response.error);
      }

      Log.it(TestConstants.router.testName, getDroppRouteTitle, it2, false);
      done();
    });

    const it3 = 'returns an error for a non-existent dropp';
    it(it3, async (done) => {
      Log.it(TestConstants.router.testName, getDroppRouteTitle, it3, true);
      this.updateUrl(Utils.newUuid());
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(
          TestConstants.router.testName,
          getDroppRouteTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (response) {
        expect(response.statusCode).toBe(DroppError.type.ResourceDNE.status);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.ResourceDNE.type);
        expect(details.error.message)
          .toBe(TestConstants.messages.doesNotExist(Constants.params.dropp));
        Log.log(TestConstants.router.testName, getDroppRouteTitle, response.error);
      }

      Log.it(TestConstants.router.testName, getDroppRouteTitle, it3, false);
      done();
    });

    const it4 = 'returns a dropp\'s public details';
    it(it4, async (done) => {
      Log.it(TestConstants.router.testName, getDroppRouteTitle, it4, true);
      this.updateUrl(this.dropp1.id);

      const response = await Request(this.options);
      expect(response.statusCode).toBe(TestConstants.router.statusCodes.success);
      const details = JSON.parse(response.body);

      expect(details.id).toBe(this.dropp1.id);
      expect(details.text).toBe(this.dropp1.text);
      expect(details.media).toBe(this.dropp1.media);
      expect(details.username).toBe(this.dropp1.username);
      expect(details.timestamp).toBe(this.dropp1.timestamp);
      expect(details.location.latitude).toBe(this.dropp1.location.latitude);
      expect(details.location.longitude).toBe(this.dropp1.location.longitude);

      Log.it(TestConstants.router.testName, getDroppRouteTitle, it4, false);
      done();
    });
  });
});

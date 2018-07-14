const Log = require('../../logger');
const Server = require('../../../index');
// const User = require('../../../src/models/User');
const TestConstants = require('../../constants');
const Request = require('request-promise-native');
const Dropp = require('../../../src/models/Dropp');
const Utils = require('../../../src/utilities/utils');
const Location = require('../../../src/models/Location');
// const UserAccessor = require('../../../src/database/user');
const DroppError = require('../../../src/errors/DroppError');
const CloudStorage = require('../../../src/storage/storage');
const DroppAccessor = require('../../../src/database/dropp');
const Constants = require('../../../src/utilities/constants');
const UserMiddleware = require('../../../src/middleware/user');
const StorageError = require('../../../src/errors/StorageError');
const DroppMiddleware = require('../../../src/middleware/dropp');

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

      Log.log(TestConstants.router.testName, getDroppRouteTitle, response.body);
      Log.it(TestConstants.router.testName, getDroppRouteTitle, it4, false);
      done();
    });
  });

  const createDroppRouteTitle = 'Create dropp route';
  describe(createDroppRouteTitle, () => {
    beforeEach(() => {
      Log.beforeEach(TestConstants.router.testName, createDroppRouteTitle, true);
      this.options = {
        method: TestConstants.router.methods.post,
        uri: url,
        resolveWithFullResponse: true,
        headers: {
          authorization: this.authToken,
        },
        form: {
          text: Utils.newUuid(),
          media: Constants.params.false,
          location: {
            latitude: TestConstants.params.defaultLocation,
            longitude: TestConstants.params.defaultLocation,
          },
        },
      };

      Log.beforeEach(TestConstants.router.testName, getDroppRouteTitle, false);
    });

    afterEach(async (done) => {
      Log.afterEach(TestConstants.router.testName, createDroppRouteTitle, true);
      if (Utils.hasValue(this.dropp1)) await DroppMiddleware.remove(this.user1, this.dropp1);
      delete this.details;
      Log.afterEach(TestConstants.router.testName, createDroppRouteTitle, false);
      done();
    });

    const it1 = 'returns an authentication error for a missing auth token';
    it(it1, async (done) => {
      Log.it(TestConstants.router.testName, createDroppRouteTitle, it1, true);
      delete this.options.headers.authorization;
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(
          TestConstants.router.testName,
          createDroppRouteTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (response) {
        expect(response.statusCode).toBe(DroppError.type.Auth.status);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.Auth.type);
        expect(details.error.message).toBe(DroppError.TokenReason.missing);
        Log.log(TestConstants.router.testName, createDroppRouteTitle, response.error);
      }

      Log.it(TestConstants.router.testName, createDroppRouteTitle, it1, false);
      done();
    });

    const it2 = 'returns an error for all invalid parameters';
    it(it2, async (done) => {
      Log.it(TestConstants.router.testName, createDroppRouteTitle, it2, true);
      delete this.options.form;
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(
          TestConstants.router.testName,
          createDroppRouteTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (response) {
        expect(response.statusCode).toBe(DroppError.type.InvalidRequest.status);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(details.error.message).toContain(Constants.params.text);
        expect(details.error.message).toContain(Constants.params.media);
        expect(details.error.message).toContain(Constants.params.location);
        Log.log(TestConstants.router.testName, createDroppRouteTitle, response.error);
      }

      Log.it(TestConstants.router.testName, createDroppRouteTitle, it2, false);
      done();
    });

    const it3 = 'returns an error for invalid location details';
    it(it3, async (done) => {
      Log.it(TestConstants.router.testName, createDroppRouteTitle, it3, true);
      this.options.form.location.latitude = Utils.newUuid();
      this.options.form.location.longitude = Utils.newUuid();
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(
          TestConstants.router.testName,
          createDroppRouteTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (response) {
        expect(response.statusCode).toBe(DroppError.type.InvalidRequest.status);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(details.error.message).toContain(Constants.params.latitude);
        expect(details.error.message).toContain(Constants.params.longitude);
        Log.log(TestConstants.router.testName, createDroppRouteTitle, response.error);
      }

      Log.it(TestConstants.router.testName, createDroppRouteTitle, it3, false);
      done();
    });

    const it4 = 'returns an error for no media and empty text';
    it(it4, async (done) => {
      Log.it(TestConstants.router.testName, createDroppRouteTitle, it4, true);
      this.options.form.text = TestConstants.utils.strings.emptyString;
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(
          TestConstants.router.testName,
          createDroppRouteTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (response) {
        expect(response.statusCode).toBe(DroppError.type.Resource.status);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.Resource.type);
        expect(details.error.message)
          .toBe(Constants.middleware.dropp.messages.errors.mustContainText);
        Log.log(TestConstants.router.testName, createDroppRouteTitle, response.error);
      }

      Log.it(TestConstants.router.testName, createDroppRouteTitle, it4, false);
      done();
    });

    const it5 = 'returns an error for true media but invalid media data';
    it(it5, async (done) => {
      Log.it(TestConstants.router.testName, createDroppRouteTitle, it5, true);
      this.options.form.media = Constants.params.true;
      this.options.form.base64Data = TestConstants.media.base64DataTypes.random;
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(
          TestConstants.router.testName,
          createDroppRouteTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (response) {
        expect(response.statusCode).toBe(DroppError.type.InvalidRequest.status);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(details.error.message).toBe(Constants.params.base64Data);
        Log.log(TestConstants.router.testName, createDroppRouteTitle, response.error);
      }

      Log.it(TestConstants.router.testName, createDroppRouteTitle, it5, false);
      done();
    });

    const createDroppSuccessTitle = 'Create dropp success';
    describe(createDroppSuccessTitle, () => {
      afterEach(async (done) => {
        Log.afterEach(TestConstants.router.testName, createDroppSuccessTitle, true);
        await DroppMiddleware.remove(this.user1, this.droppInfo);
        delete this.droppInfo;
        Log.afterEach(TestConstants.router.testName, createDroppSuccessTitle, false);
        done();
      });

      const it6 = 'creates a dropp and with text and no media';
      it(it6, async (done) => {
        Log.it(TestConstants.router.testName, createDroppSuccessTitle, it6, true);
        const response = await Request(this.options);
        expect(response.statusCode).toBe(TestConstants.router.statusCodes.creation);
        const details = JSON.parse(response.body);

        const { message, dropp } = details.success;
        expect(message).toBe(Constants.middleware.dropp.messages.success.createDropp);
        expect(typeof dropp.id).toBe('string');
        expect(dropp.id.length).toBeGreaterThan(0);
        expect(dropp.text).toBe(this.options.form.text.trim());
        expect(dropp.media).toBe(false);
        expect(dropp.username).toBe(this.user1.username);
        expect(typeof dropp.timestamp).toBe('number');
        expect(dropp.timestamp).toBeGreaterThan(0);
        expect(dropp.location.latitude).toBe(TestConstants.params.defaultLocation);
        expect(dropp.location.longitude).toBe(TestConstants.params.defaultLocation);

        this.droppInfo = dropp;
        Log.log(TestConstants.router.testName, createDroppSuccessTitle, response.body);
        Log.it(TestConstants.router.testName, createDroppSuccessTitle, it6, false);
        done();
      });

      const it7 = 'creates a dropp with media and no text';
      it(it7, async (done) => {
        Log.it(TestConstants.router.testName, createDroppSuccessTitle, it7, true);
        this.options.form.media = true;
        this.options.form.text = TestConstants.utils.strings.tab;
        this.options.form.base64Data = `${Constants.media.base64DataTypes.png}${TestConstants.media.base64DataTypes.test}`;

        const response = await Request(this.options);
        expect(response.statusCode).toBe(TestConstants.router.statusCodes.creation);
        const details = JSON.parse(response.body);
        expect(details.mediaUploadError).not.toBeDefined();

        const { message, dropp } = details.success;
        expect(message).toBe(Constants.middleware.dropp.messages.success.createDropp);
        expect(typeof dropp.id).toBe('string');
        expect(dropp.id.length).toBeGreaterThan(0);
        expect(dropp.text).toBe(TestConstants.utils.strings.emptyString);
        expect(dropp.media).toBe(true);
        expect(dropp.username).toBe(this.user1.username);
        expect(typeof dropp.timestamp).toBe('number');
        expect(dropp.timestamp).toBeGreaterThan(0);
        expect(dropp.location.latitude).toBe(TestConstants.params.defaultLocation);
        expect(dropp.location.longitude).toBe(TestConstants.params.defaultLocation);

        // Validate media results from the backend
        const media = await DroppMiddleware.getPhoto(this.user1, dropp);
        const { base64Data } = this.options.form;
        expect(media.success.mimeType).toBe(Constants.media.mimeTypes.png);
        expect(media.success.base64Data).toBe(base64Data.slice(0, base64Data.length - 2));

        this.droppInfo = dropp;
        Log.log(TestConstants.router.testName, createDroppSuccessTitle, response.body);
        Log.it(TestConstants.router.testName, createDroppSuccessTitle, it7, false);
        done();
      });
    });
  });

  const removeDroppRouteTitle = 'Remove dropp route';
  describe(removeDroppRouteTitle, () => {
    beforeEach(async (done) => {
      Log.beforeEach(TestConstants.router.testName, removeDroppRouteTitle, true);
      this.options = {
        method: TestConstants.router.methods.delete,
        uri: url,
        resolveWithFullResponse: true,
        headers: {
          authorization: this.authToken,
        },
      };

      this.updateUrl = (dropp) => {
        this.options.uri = `${url}/${dropp}`;
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
      this.shouldDeleteDropp = true;
      Log.beforeEach(TestConstants.router.testName, removeDroppRouteTitle, false);
      done();
    });

    afterEach(async (done) => {
      Log.afterEach(TestConstants.router.testName, removeDroppRouteTitle, true);
      if (this.shouldDeleteDropp === true) await DroppAccessor.remove(this.dropp1);
      delete this.dropp1;
      delete this.options;
      delete this.updateUrl;
      Log.afterEach(TestConstants.router.testName, removeDroppRouteTitle, false);
      done();
    });

    const it1 = 'returns an authentication error for a missing auth token';
    it(it1, async (done) => {
      Log.it(TestConstants.router.testName, removeDroppRouteTitle, it1, true);
      this.updateUrl(this.dropp1.id);
      delete this.options.headers.authorization;
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(
          TestConstants.router.testName,
          removeDroppRouteTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (response) {
        expect(response.statusCode).toBe(DroppError.type.Auth.status);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.Auth.type);
        expect(details.error.message).toBe(DroppError.TokenReason.missing);
        Log.log(TestConstants.router.testName, removeDroppRouteTitle, response.error);
      }

      Log.it(TestConstants.router.testName, removeDroppRouteTitle, it1, false);
      done();
    });

    const it2 = 'returns an error for an invalid dropp ID';
    it(it2, async (done) => {
      Log.it(TestConstants.router.testName, removeDroppRouteTitle, it2, true);
      this.updateUrl(TestConstants.params.invalidChars.encodedDroppId);
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(
          TestConstants.router.testName,
          removeDroppRouteTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (response) {
        expect(response.statusCode).toBe(DroppError.type.InvalidRequest.status);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.InvalidRequest.type);
        expect(details.error.message).toContain(Constants.params.id);
        Log.log(TestConstants.router.testName, removeDroppRouteTitle, response.error);
      }

      Log.it(TestConstants.router.testName, removeDroppRouteTitle, it2, false);
      done();
    });

    const it3 = 'returns an error for a non-existent dropp';
    it(it3, async (done) => {
      Log.it(TestConstants.router.testName, removeDroppRouteTitle, it3, true);
      this.updateUrl(Utils.newUuid());
      try {
        const response = await Request(this.options);
        expect(response).not.toBeDefined();
        Log.log(
          TestConstants.router.testName,
          removeDroppRouteTitle,
          TestConstants.messages.shouldHaveThrown
        );
      } catch (response) {
        expect(response.statusCode).toBe(DroppError.type.ResourceDNE.status);
        const details = JSON.parse(response.error);
        expect(details.error.type).toBe(DroppError.type.ResourceDNE.type);
        expect(details.error.message)
          .toBe(TestConstants.messages.doesNotExist(Constants.params.dropp));
        Log.log(TestConstants.router.testName, removeDroppRouteTitle, response.error);
      }

      Log.it(TestConstants.router.testName, removeDroppRouteTitle, it3, false);
      done();
    });

    const removeDifferentUserDroppRouteTitle = 'Remove different user\'s dropp route';
    describe(removeDifferentUserDroppRouteTitle, () => {
      beforeEach(async (done) => {
        Log.beforeEach(TestConstants.router.testName, removeDifferentUserDroppRouteTitle, true);
        const details = {
          username: Utils.newUuid(),
          password: Utils.newUuid(),
          email: TestConstants.params.uuidEmail(),
        };

        this.user2 = await UserMiddleware.create(details);
        this.dropp2 = new Dropp({
          timestamp: TestConstants.params.defaultTimestamp,
          media: false,
          text: Utils.newUuid(),
          username: this.user2.username,
          location: new Location({
            latitude: TestConstants.params.defaultLocation,
            longitude: TestConstants.params.defaultLocation,
          }),
        });

        await DroppAccessor.add(this.dropp2);
        Log.beforeEach(TestConstants.router.testName, removeDifferentUserDroppRouteTitle, false);
        done();
      });

      afterEach(async (done) => {
        Log.afterEach(TestConstants.router.testName, removeDifferentUserDroppRouteTitle, true);

        // This will also delete `this.dropp2`
        await UserMiddleware.remove(this.user2, { username: this.user2.username });
        delete this.user2;
        delete this.dropp2;
        Log.afterEach(TestConstants.router.testName, removeDifferentUserDroppRouteTitle, false);
        done();
      });

      const it4 = 'returns an error for removing a different user\'s dropp';
      it(it4, async (done) => {
        Log.it(TestConstants.router.testName, removeDifferentUserDroppRouteTitle, it4, true);
        this.updateUrl(this.dropp2.id);
        try {
          const response = await Request(this.options);
          expect(response).not.toBeDefined();
          Log.log(
            TestConstants.router.testName,
            removeDifferentUserDroppRouteTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (response) {
          expect(response.statusCode).toBe(DroppError.type.Resource.status);
          const details = JSON.parse(response.error);
          expect(details.error.type).toBe(DroppError.type.Resource.type);
          expect(details.error.message).toBe(Constants.middleware.messages.unauthorizedAccess);
          Log.log(
            TestConstants.router.testName,
            removeDifferentUserDroppRouteTitle,
            response.error
          );
        }

        Log.it(TestConstants.router.testName, removeDifferentUserDroppRouteTitle, it4, false);
        done();
      });
    });

    const removeDroppSuccessRouteTitle = 'Remove dropp success route';
    describe(removeDroppSuccessRouteTitle, () => {
      const it4 = 'successfully removes a dropp';
      it(it4, async (done) => {
        Log.it(TestConstants.router.testName, removeDroppSuccessRouteTitle, it4, true);
        this.updateUrl(this.dropp1.id);
        const response = await Request(this.options);
        expect(response.statusCode).toBe(TestConstants.router.statusCodes.success);
        const details = JSON.parse(response.body);
        const { message } = details.success;
        expect(message).toBe(Constants.middleware.dropp.messages.success.removeDropp);

        // Verify results from backend
        const dropp = await DroppAccessor.get(this.dropp1.id);
        expect(dropp).toBeNull();

        this.shouldDeleteDropp = false;
        Log.log(TestConstants.router.testName, removeDroppSuccessRouteTitle, response.body);
        Log.it(TestConstants.router.testName, removeDroppSuccessRouteTitle, it4, false);
        done();
      });
    });

    const removeDroppWithPhotoSuccessRouteTitle = 'Remove dropp with photo success route';
    describe(removeDroppWithPhotoSuccessRouteTitle, () => {
      beforeEach(async (done) => {
        Log.beforeEach(TestConstants.router.testName, removeDroppWithPhotoSuccessRouteTitle, true);
        const droppInfo = {
          text: TestConstants.params.test,
          media: 'true',
          base64Data: `${Constants.media.base64DataTypes.png}${TestConstants.media.base64DataTypes.test}`,
          location: {
            latitude: TestConstants.params.defaultLocationString,
            longitude: TestConstants.params.defaultLocationString,
          },
        };

        const result = await DroppMiddleware.create(this.user1, droppInfo);
        this.dropp2 = result.success.dropp;
        Log.beforeEach(TestConstants.router.testName, removeDroppWithPhotoSuccessRouteTitle, false);
        done();
      });

      const it4 = 'successfully removes a dropp with media';
      it(it4, async (done) => {
        Log.it(TestConstants.router.testName, removeDroppWithPhotoSuccessRouteTitle, it4, true);
        this.updateUrl(this.dropp2.id);
        const response = await Request(this.options);
        expect(response.statusCode).toBe(TestConstants.router.statusCodes.success);
        const details = JSON.parse(response.body);
        const { message } = details.success;
        expect(message).toBe(Constants.middleware.dropp.messages.success.removeDropp);
        expect(details.mediaRemovalError).not.toBeDefined();

        // Verify results from backend
        const dropp = await DroppAccessor.get(this.dropp2.id);
        expect(dropp).toBeNull();
        try {
          const mediaResult = await CloudStorage.get(
            Constants.middleware.dropp.cloudStorageFolder,
            this.dropp2.id
          );
          expect(mediaResult).not.toBeDefined();
          Log.log(
            TestConstants.router.testName,
            removeDroppWithPhotoSuccessRouteTitle,
            TestConstants.messages.shouldHaveThrown
          );
        } catch (error) {
          expect(error.name).toBe(Constants.errors.storage.name);
          expect(error.details.type).toBe(StorageError.type.FileDoesNotExist.type);
          Log.log(
            TestConstants.router.testName,
            removeDroppWithPhotoSuccessRouteTitle,
            error.details
          );
        }

        Log.log(
          TestConstants.router.testName,
          removeDroppWithPhotoSuccessRouteTitle,
          response.body
        );
        Log.it(TestConstants.router.testName, removeDroppWithPhotoSuccessRouteTitle, it4, false);
        done();
      });
    });
  });
});

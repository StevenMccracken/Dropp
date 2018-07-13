/**
 * @module for HTTP request routing
 */

const Log = require('../logging/logger');
const Utils = require('../utilities/utils');
const Auth = require('../authentication/auth');
const DroppError = require('../errors/DroppError');
const Constants = require('../utilities/constants');
const UserMiddleware = require('../middleware/user');
const ErrorLogAccessor = require('../database/error');
const DroppMiddleware = require('../middleware/dropp');

/**
 * Sends an error response in JSON format
 * @param {Error} _error the error that occurred
 * @param {Object} _request the HTTP request
 * @param {Object} _response the HTTP response
 * @param {Function} _next unused callback
 */
/* eslint-disable no-unused-vars */
const handleError = (_error, _request, _response, _next) => {
/* eslint-enable no-unused-vars */
  const source = 'handleError()';
  Log.logRequest(Constants.router.moduleName, source, _request, _error);

  let errorDetails;
  if (_error instanceof DroppError) {
    if (Utils.hasValue(_error.details)) errorDetails = _error.details;
    else {
      const error = DroppError.format(DroppError.type.Server, source);
      errorDetails = error.details;
    }

    if (Utils.hasValue(_error.statusCode)) _response.status(_error.statusCode);
    else _response.status(DroppError.type.Server.status);

    let logDetails;
    if (Utils.hasValue(_error.privateDetails) && Utils.hasValue(_error.privateDetails.error)) {
      logDetails = _error.privateDetails.error;
    } else logDetails = {};

    logDetails.ip = Utils.getIpAddress(_request);
    logDetails.requestId = Utils.getRequestId(_request);
    ErrorLogAccessor.add(logDetails);
  } else {
    _response.status(DroppError.type.Server.status);
    const error = DroppError.format(DroppError.type.Server, source);
    errorDetails = error.details;
    const details = {
      message: Constants.router.messages.errors.unknownCatch,
      error: _error,
      request: _request,
    };

    ErrorLogAccessor.add(details);
  }

  _response.json(errorDetails);
};

/**
 * Authenticates a given request along it's intended route. If
 * authentication succeeds, the User information will be attached
 * to the request via `request.user`. authentication fails, the
 * _next callback is not used. Instead the response is sent with a
 * failing status code and details about the authentication error
 * @param {Object} _request the HTTP request object
 * @param {Object} _response the HTTP response object
 * @param {Function} _next the callback used if authentication succeeds
 */
const validateAuthToken = async (_request, _response, _next) => {
  try {
    /* eslint-disable no-param-reassign */
    _request.user = await Auth.verifyToken(_request, _response);
    /* eslint-enable no-param-reassign */
    _next();
  } catch (authError) {
    const source = `${Constants.router.moduleName} ${_request.url}`;
    const error = DroppError.handleAuthError(source, _request, _response, authError);
    handleError(error, _request, _response, _next);
  }
};

let router;
const routing = (_router) => {
  router = _router;

  // Middleware to log metadata about incoming requests
  router.use((request, response, next) => {
    // Add unique request ID to request and response headers
    const source = 'Logging middleware';
    const requestId = Utils.newUuid();
    request.headers.requestId = requestId;
    response.set(Constants.params.requestId, requestId);
    response.set(Constants.router.accessControlExposeHeaders, Constants.params.requestId);
    Log.logRequest(Constants.router.moduleName, source, request);
    next();
  });

  /**
   * Method: GET
   * Authentication: No
   * Details: Base route for the API. Provides all accessible routes and methods
   */
  router.route(Constants.router.routes.base).get((request, response) => {
    response.json(Constants.router.details);
  });

  /**
   * Method: GET
   * Authentication: No
   * Details: Route to test without other resource access
   */
  router.route(Constants.router.routes.welcome).get((request, response) => {
    response.json({ message: Constants.router.messages.success.welcome });
  });

  /**
   * Method: POST
   * Authentication: No
   * Details: Generates an authentication token for a valid username and password
   * Body parameters:
   *  username
   *  password
   */
  router.route(Constants.router.routes.auth).post(async (request, response, next) => {
    try {
      const result = await UserMiddleware.getAuthToken(request.body);
      response.json(result);
    } catch (error) {
      next(error);
    }
  });

  /**
   * Method: POST
   * Authentication: No
   * Details: Creates a user and generates an authentication token
   * Body parameters:
   *  email
   *  username
   *  password
   */
  router.route(Constants.router.routes.users.base).post(async (request, response, next) => {
    try {
      const result = await UserMiddleware.addNewUser(request.body);
      response.status(201);
      response.json(result);
    } catch (error) {
      next(error);
    }
  });

  /**
   * Method: GET
   * Authentication: Yes
   * Details: Retrieves a user by their username
   * URL parameters:
   *  username
   */
  router.route(Constants.router.routes.users.username.base)
    .all(validateAuthToken)
    .get(async (request, response, next) => {
      try {
        const result = await UserMiddleware.get(request.user, request.params);
        response.json(result);
      } catch (error) {
        next(error);
      }
    });

  /**
   * Method: PUT
   * Authentication: Yes
   * Details: Updates a user's email address
   * URL parameters:
   *  username
   * Body parameters:
   *  newEmail
   */
  router.route(Constants.router.routes.users.username.email)
    .all(validateAuthToken)
    .put(async (request, response, next) => {
      try {
        const result = await UserMiddleware.updateEmail(request.user, request.params, request.body);
        response.json(result);
      } catch (error) {
        next(error);
      }
    });

  /**
   * Method: PUT
   * Authentication: Yes
   * Details: Updates a user's password
   * URL parameters:
   *  username
   * Body parameters:
   *  oldPassword
   *  newPassword
   */
  router.route(Constants.router.routes.users.username.password)
    .all(validateAuthToken)
    .put(async (request, response, next) => {
      try {
        const result = await UserMiddleware.updatePassword(
          request.user,
          request.params,
          request.body
        );
        response.json(result);
      } catch (error) {
        next(error);
      }
    });

  /**
   * Method: POST
   * Authentication: Yes
   * Details: Requests to follow a user
   * URL parameters:
   *  username
   */
  router.route(Constants.router.routes.users.username.follows.requests.base)
    .all(validateAuthToken)
    .post(async (request, response, next) => {
      try {
        const result = await UserMiddleware.requestToFollow(
          request.user,
          request.params,
          request.body
        );
        response.json(result);
      } catch (error) {
        next(error);
      }
    });

  /**
   * Method: DELETE
   * Authentication: Yes
   * Details: Removes a pending follow request to a user
   * URL parameters:
   *  username
   *  requestedUser
   */
  router.route(Constants.router.routes.users.username.follows.requests.requestedUser)
    .all(validateAuthToken)
    .delete(async (request, response, next) => {
      try {
        const result = await UserMiddleware.removeFollowRequest(request.user, request.params);
        response.json(result);
      } catch (error) {
        next(error);
      }
    });

  /**
   * Method: PUT
   * Authentication: Yes
   * Details: Accepts or declines a follower request from a user
   * URL parameters:
   *  username
   *  requestedUser
   * Body parameters:
   *  accept
   */
  router.route(Constants.router.routes.users.username.followers.requests.requestedUser)
    .all(validateAuthToken)
    .put(async (request, response, next) => {
      try {
        const result = await UserMiddleware.respondToFollowerRequest(
          request.user,
          request.params,
          request.body
        );
        response.json(result);
      } catch (error) {
        next(error);
      }
    });

  /**
   * Method: DELETE
   * Authentication: Yes
   * Details: Unfollows a user
   * URL parameters:
   *  username
   *  follow
   */
  router.route(Constants.router.routes.users.username.follows.follow)
    .all(validateAuthToken)
    .delete(async (request, response, next) => {
      try {
        const result = await UserMiddleware.unfollow(request.user, request.params);
        response.json(result);
      } catch (error) {
        next(error);
      }
    });

  /**
   * Method: DELETE
   * Authentication: Yes
   * Details: Removes a user as a follower
   * URL parameters:
   *  username
   *  follower
   */
  router.route(Constants.router.routes.users.username.followers.follower)
    .all(validateAuthToken)
    .delete(async (request, response, next) => {
      try {
        const result = await UserMiddleware.removeFollower(request.user, request.params);
        response.json(result);
      } catch (error) {
        next(error);
      }
    });

  /**
   * Method: DELETE
   * Authentication: Yes
   * Details: Deletes a user and all of their data
   * URL parameters:
   *  username
   */
  router.route(Constants.router.routes.users.username.base)
    .all(validateAuthToken)
    .delete(async (request, response, next) => {
      try {
        const result = await UserMiddleware.remove(request.user, request.params);
        response.json(result);
      } catch (error) {
        next(error);
      }
    });

  /**
   * Method: GET
   * Authentication: Yes
   * Details: Retrieves a dropp by it's ID
   * URL parameters:
   *  id
   */
  router.route(Constants.router.routes.dropps.dropp.base)
    .all(validateAuthToken)
    .get(async (request, response, next) => {
      try {
        const result = await DroppMiddleware.get(request.user, request.params);
        response.json(result);
      } catch (error) {
        next(error);
      }
    });

  /**
   * Method: POST
   * Authentication: Yes
   * Details: Creates a new dropp for a user
   * Body parameters:
   *  text
   *  media
   *  location
   */
  router.route(Constants.router.routes.dropps.base)
    .all(validateAuthToken)
    .post(async (request, response, next) => {
      try {
        const result = await DroppMiddleware.create(request.user, request.body);
        response.status(201);
        response.json(result);
      } catch (error) {
        next(error);
      }
    });

  return router;
};

module.exports = {
  validateAuthToken,
  configure: routing,
  errorHandler: handleError,
};

/**
 * @module for HTTP request routing
 */

const Log = require('../logging/logger');
const Utils = require('../utilities/utils');
const Auth = require('../authentication/auth');
const DroppError = require('../errors/DroppError');
const UserMiddleware = require('../middleware/user');
const ErrorLogAccessor = require('../database/error');

const routes = {
  '/': 'GET',
  welcome: 'GET',
  auth: 'POST',
  users: {
    '/': 'POST',
    '/<username>': [
      'GET',
      'DELETE',
    ],
    '/<username>/email': 'PUT',
    '/<username>/password': 'PUT',
  },
};

/**
 * Logs a message about routing
 * @param  {String} _message the message to log
 * @param  {Object} _request the HTTP request
 */
function log(_message, _request) {
  Log.log('Router', _message, _request);
}

/**
 * Sends an error response in JSON format
 * @param {Error} _error the error that occurred
 * @param {Object} _request the HTTP request
 * @param {Object} _response the HTTP response
 * @param {Function} _next unused callback
 */
/* eslint-disable no-unused-vars */
const handleError = function handleError(_error, _request, _response, _next) {
/* eslint-enable no-unused-vars */
  const source = 'handleError()';
  log(source, _request);

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
      message: 'An unknown was caught in router',
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
const validateAuthToken = async function validateAuthToken(_request, _response, _next) {
  try {
    /* eslint-disable no-param-reassign */
    _request.user = await Auth.verifyToken(_request, _response);
    /* eslint-enable no-param-reassign */
    _next();
  } catch (authError) {
    const source = `Router ${_request.url}`;
    const error = DroppError.handleAuthError(source, _request, _response, authError);
    handleError(error, _request, _response, _next);
  }
};

let router;
const routing = function routing(_router) {
  router = _router;

  // Middleware to log metadata about incoming requests
  router.use((request, response, next) => {
    // Add unique request ID to request and response headers
    const requestId = Utils.newUuid();
    request.headers.requestId = requestId;
    response.set('requestId', requestId);
    response.set('Access-Control-Expose-Headers', 'requestId');
    log(`${request.method} ${request.url}`, request);
    next();
  });

  /**
   * Method: GET
   * Authentication: No
   * Details: Base route for the API. Provides all accessible routes and methods
   */
  const baseRoute = '/';
  router.route(baseRoute).get((request, response) => {
    log(baseRoute, request);
    response.json(routes);
  });

  /**
   * Method: GET
   * Authentication: No
   * Details: Route to test without other resource access
   */
  const welcomeRoute = '/welcome';
  router.route(welcomeRoute).get((request, response) => {
    log(welcomeRoute, request);
    response.json({ message: 'This is the REST API for Dropp' });
  });

  /**
   * Method: POST
   * Authentication: No
   * Details: Generates an authentication token for a valid username and password
   * Body parameters:
   *  username
   *  password
   */
  const authRoute = '/auth';
  router.route(authRoute).post(async (request, response, next) => {
    try {
      const data = await UserMiddleware.getAuthToken(request.body);
      response.json(data);
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
  router.route('/users').post(async (request, response, next) => {
    try {
      const data = await UserMiddleware.addNewUser(request.body);
      response.status(201);
      response.json(data);
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
  router.route('/users/:username')
    .all(validateAuthToken)
    .get(async (request, response, next) => {
      try {
        const data = await UserMiddleware.get(request.user, request.params);
        response.json(data);
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
  router.route('/users/:username/email')
    .all(validateAuthToken)
    .put(async (request, response, next) => {
      try {
        const data = await UserMiddleware.updateEmail(request.user, request.params, request.body);
        response.json(data);
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
  router.route('/users/:username/password')
    .all(validateAuthToken)
    .put(async (request, response, next) => {
      try {
        /* eslint-disable max-len */
        const data = await UserMiddleware.updatePassword(request.user, request.params, request.body);
        /* eslint-enable max-len */
        response.json(data);
      } catch (error) {
        next(error);
      }
    });

  return router;
};

module.exports = {
  routes,
  validateAuthToken,
  configure: routing,
  errorHandler: handleError,
};

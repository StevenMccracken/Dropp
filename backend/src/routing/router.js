/**
 * @module for HTTP request routing
 */

const Log = require('../logging/logger');
const Error = require('../errors/error');
const Utils = require('../utilities/utils');
const Auth = require('../authentication/auth');
const DroppError = require('../errors/DroppError');
const UserMiddleware = require('../middleware/user');

/**
 * Logs a message about routing
 * @param  {String} _message the message to log
 * @param  {Object} _request the HTTP request
 */
function log(_message, _request) {
  Log.log('Router', _message, _request);
}

/**
 * Sends an error message in JSON format
 * @param {Error} [_error=new Error()] the error that was caught
 * @param {Object} _request the HTTP request
 * @param {Object} _response the HTTP response
 */
function handleError(_error = new Error(), _request, _response) {
  let errorDetails;
  if (_error instanceof DroppError) errorDetails = _error.details;
  _response.json(errorDetails);
}

const routes = {
  '/': 'GET',
  welcome: 'GET',
  auth: 'POST',
  test: 'POST',
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
  router.route(authRoute).post(async (request, response) => {
    try {
      const data = await UserMiddleware.getAuthToken(request.body.username, request.body.password);
      response.json(data);
    } catch (error) {
      handleError(error, request, response);
    }
  });

  /**
   * Method: GET
   * Authentication: Yes
   * Details: Test route to test token authentication
   */
  router.route('/test').get(async (request, response) => {
    let user;
    try {
      user = await Auth.verifyToken(request, response);
    } catch (authError) {
      const source = 'Router /test';
      const standardError = Error.handleAuthError(source, request, response, authError);
      response.json(standardError);
      return;
    }

    response.json(user.data);
  });

  return router;
};

module.exports = routing;

/**
 * @module for HTTP request routing
 */

const Log = require('../logging/logger');
const Utils = require('../utilities/utils');
const DroppError = require('../models/DroppError');

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

  // The base GET route for the API. This route does not require token authentication
  router.route('/').get((request, response) => {
    response.json({ message: 'This is the REST API for Dropp' });
  });

  return router;
};

module.exports = routing;

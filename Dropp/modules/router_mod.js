/**
 * router_mod - @module for HTTP request routing
 */

const LOG = require('./log_mod');
const MEDIA = require('./media_mod');
const MIDDLEWARE = require('./middleware_mod');

var router;
var routing = function(_router) {
  router = _router;

  /**
   * Middleware to log metadata about incoming requests
   * @param {Object} _request the HTTP request
   * @param {Object} _response the HTTP response
   * @param {callback} _next the callback to execute after metadata has been logged
   */
  router.use((_request, _response, _next) => {
    log(`${_request.method} ${_request.url}`, _request);
    _next();
  });

  /**
   * The base GET route for the API. This route does not require token authentication
   * @param {Object} _request the HTTP request
   * @param {Object} _response the HTTP response
   */
  router.route('/').get((_request, _response) => (
    _response.json({ message: 'This is the REST API for Dropp' })
  ));

  /**
   * The POST route for validating login credentials. Sends
   * an error JSON or a JSON web token for the requesting
   * client. This route does not require token authentication
   * @param {Object} _request the HTTP request
   * @param {Object} _response the HTTP response
   */
  router.route('/authenticate').post((_request, _response) => (
    MIDDLEWARE.authenticate(_request, _response, result => _response.json(result))
  ));

  /**
   * The POST route for creating a user. Sends an error JSON or a JSON of
   * the created user. This route does not require token authentication
   * @param {Object} _request the HTTP request
   * @param {Object} _response the HTTP response
   */
  router.route('/users').post((_request, _response) => (
    MIDDLEWARE.createUser(_request, _response, result => _response.json(result))
  ));

  /**
   * The GET route for retrieving a user by their username. Sends an error JSON
   * or a JSON of the requested user. This route requires token authentication
   * @param {Object} _request the HTTP request
   * @param {Object} _response the HTTP response
   */
  router.route('/users/:username').get((_request, _response) => (
    MIDDLEWARE.getUser(_request, _response, result => _response.json(result))
  ));

  /**
   * The PUT route for updating a user's email. Sends an error JSON or a JSON
   * of the successful update. This route does not require token authentication
   * @param {Object} _request the HTTP request
   * @param {Object} _response the HTTP response
   */
  router.route('/users/:username/email').put((_request, _response) => (
    MIDDLEWARE.updateUserEmail(_request, _response, result => _response.json(result))
  ));

  /**
   * The PUT route for updating a user's password. Sends an error JSON or a JSON
   * of the successful update. This route does not require token authentication
   * @param {Object} _request the HTTP request
   * @param {Object} _response the HTTP response
   */
  router.route('/users/:username/password').put((_request, _response) => (
    MIDDLEWARE.updateUserPassword(_request, _response, result => _response.json(result))
  ));

  /**
   * The DELETE route for removing a user by their username. Sends an error JSON
   * or a JSON of the requested user. This route requires token authentication
   * @param {Object} _request the HTTP request
   * @param {Object} _response the HTTP response
   */
  router.route('/users/:username').delete((_request, _response) => (
    MIDDLEWARE.deleteUser(_request, _response, result => _response.json(result))
  ));

  /**
   * The POST route for creating a dropp. Sends an error JSON or a JSON
   * of the created dropp's id. This route requires token authentication
   * @param {Object} _request the HTTP request
   * @param {Object} _response the HTTP response
   */
  router.route('/dropps').post((_request, _response) => (
    MIDDLEWARE.createDropp(_request, _response, result => _response.json(result))
  ));

  /**
   * The POST route for uploading an image to link with
   * a dropp. The request body Content-Type MUST be
   * multipart/form-data. This route requires token authentication
   * @param {Object} _request the HTTP request
   * @param {Object} _response the HTTP response
   */
  router.route('/dropps/:droppId/image').post(
    MEDIA.upload.single('image'),
    (_request, _response) => (
      MIDDLEWARE.addImage(_request, _response, result => _response.json(result))
  ));

  /**
   * The GET route for retrieving a dropp by its id. Sends an error JSON or
   * a JSON of the requested dropp. This route requires token authentication
   * @param {Object} _request the HTTP request
   * @param {Object} _response the HTTP response
   */
  router.route('/dropps/:droppId').get((_request, _response) => (
    MIDDLEWARE.getDropp(_request, _response, result => _response.json(result))
  ));

  /**
   * The GET route for downloading the image linked to a dropp. Sends
   * an error JSON or the image. The image will be sent as binary data.
   * However, the image will be sent as a base-64 string if the client
   * platform is React-Native. This route requires token authentication
   * @param {Object} _request the HTTP request
   * @param {Object} _response the HTTP response
   */
  router.route('/dropps/:droppId/image').get((_request, _response) => {
     MIDDLEWARE.getImage(_request, _response, (result) => {
      // There was an error retrieving media, so send the error result as a JSON
      if (result.media === undefined) _response.json(result);
      else {
        // There was no error retrieving the media. Check if the platform is for React-Native
        if (_request.headers !== undefined && _request.headers.platform === 'React-Native') {
          // Send the base-64 string encoded image
          _response.send(result.media);
        } else {
          // Send the binary data image file
          _response.write(result.media, 'binary');
          _response.end(null, 'binary');
        }
      }
    });
  });

  /**
   * The POST route for retrieving dropps near a specific location
   * or posted by a specific user's follows. Sends an error JSON or
   * a JSON of the dropps. This route requires token authentication
   * @param {Object} _request the HTTP request
   * @param {Object} _response the HTTP response
   */
  router.route('/dropps/all').post((_request, _response) => (
    MIDDLEWARE.getAllDropps(_request, _response, result => _response.json(result))
  ));

  /**
   * The POST route for retrieving dropps near a specific location.
   * Sends an error JSON or a JSON of the dropps near that
   * specific location. This route requires token authentication
   * @param {Object} _request the HTTP request
   * @param {Object} _response the HTTP response
   */
  router.route('/dropps/location').post((_request, _response) => (
    MIDDLEWARE.getDroppsByLocation(_request, _response, result => _response.json(result))
  ));

  /**
   * The GET route for retrieving all dropps posted by a specific
   * user. Sends an error JSON or a JSON of the dropps posted by
   * the requested user. This route requires token authentication
   * @param {Object} _request the HTTP request
   * @param {Object} _response the HTTP response
   */
  router.route('/users/:username/dropps').get((_request, _response) => (
    MIDDLEWARE.getDroppsByUser(_request, _response, result => _response.json(result))
  ));

  /**
   * The GET route for retrieving all dropps posted by a specific user's
   * follows. Sends an error JSON or a JSON of the dropps posted by the
   * requested user's follows. This route requires token authentication
   * @param {Object} _request the HTTP request
   * @param {Object} _response the HTTP response
   */
  router.route('/users/:username/follows/dropps').get((_request, _response) => (
    MIDDLEWARE.getDroppsByFollows(_request, _response, result => _response.json(result))
  ));

  /**
   * The PUT route for updating a dropp's text content. Sends an error JSON or a
   * JSON indicating successful update. This route requires token authentication
   * @param {Object} _request the HTTP request
   * @param {Object} _response the HTTP response
   */
  router.route('/dropps/:droppId/text').put((_request, _response) => (
    MIDDLEWARE.updateDroppText(_request, _response, result => _response.json(result))
  ));

  /**
   * The DELETE route for deleting a dropp by its id. Sends an error JSON or a
   * JSON indicating successful deletion. This route requires token authentication
   * @param {Object} _request the HTTP request
   * @param {Object} _response the HTTP response
   */
  router.route('/dropps/:droppId').delete((_request, _response) => (
    MIDDLEWARE.deleteDropp(_request, _response, result => _response.json(result))
  ));

  /**
   * The POST route for requesting to follow a user. Sends an error
   * or success JSON. This route requires token authentication
   * @param {Object} _request the HTTP request
   * @param {Object} _response the HTTP response
   */
  router.route('/users/:username/requests/followers').post((_request, _response) => (
    MIDDLEWARE.requestToFollow(_request, _response, result => _response.json(result))
  ));

  /**
   * The GET route for retrieving a user's followers. Sends an error JSON or
   * a JSON with the user's follower. This route requires token authentication
   * @param {Object} _request the HTTP request
   * @param {Object} _response the HTTP response
   */
  router.route('/users/:username/followers').get((_request, _response) => (
    MIDDLEWARE.getFollowers(_request, _response, result => _response.json(result))
  ));

  /**
   * The GET route for retrieving the users that another user
   * follows. Sends an error JSON or a JSON with the user's
   * follower equests. This route requires token authentication
   * @param {Object} _request the HTTP request
   * @param {Object} _response the HTTP response
   */
  router.route('/users/:username/follows').get((_request, _response) => (
    MIDDLEWARE.getFollows(_request, _response, result => _response.json(result))
  ));

  /**
   * The GET route for retrieving a user's follower requests.
   * Sends an error JSON or a JSON with the user's follower
   * requests. This route requires token authentication
   * @param {Object} _request the HTTP request
   * @param {Object} _response the HTTP response
   */
  router.route('/users/:username/requests/followers').get((_request, _response) => (
    MIDDLEWARE.getFollowerRequests(_request, _response, result => _response.json(result))
  ));

  /**
   * The GET route for retrieving a user's follow requests.
   * Sends an error JSON or a JSON with the user's follower
   * requests. This route requires token authentication
   * @param {Object} _request the HTTP request
   * @param {Object} _response the HTTP response
   */
  router.route('/users/:username/requests/follows').get((_request, _response) => (
    MIDDLEWARE.getFollowRequests(_request, _response, result => _response.json(result))
  ));

  /**
   * The PUT route for accepting a follower request. Sends an error
   * or success JSON. This route requires token authentication
   * @param {Object} _request the HTTP request
   * @param {Object} _response the HTTP response
   */
  router.route('/users/:username/requests/followers/:requestingUser').put((_request, _response) => (
    MIDDLEWARE.respondToFollowerRequest(_request, _response, result => _response.json(result))
  ));

  /**
   * The DELETE route for declining a pending follower request. Sends
   * an error or success JSON. This route requires token authentication
   * @param {Object} _request the HTTP request
   * @param {Object} _response the HTTP response
   */
  router.route('/users/:username/requests/followers/:requestingUser')
    .delete((_request, _response) => (
      MIDDLEWARE.respondToFollowerRequest(_request, _response, result => _response.json(result))
    ));

  /**
   * The DELETE route for removing a pending follow request. Sends an
   * error or success JSON. This route requires token authentication
   * @param {Object} _request the HTTP request
   * @param {Object} _response the HTTP response
   */
  router.route('/users/:username/requests/follows/:requestedUser').delete((_request, _response) => (
    MIDDLEWARE.removeFollowRequest(_request, _response, result => _response.json(result))
  ));

  /**
   * The DELETE route for removing a follower. Sends an error
   * or success JSON. This route requires token authentication
   * @param {Object} _request the HTTP request
   * @param {Object} _response the HTTP response
   */
  router.route('/users/:username/followers/:follower').delete((_request, _response) => (
    MIDDLEWARE.removeFollower(_request, _response, result => _response.json(result))
  ));

  /**
   * The DELETE route for unfollowing a user. Sends an error
   * or success JSON. This route requires token authentication
   * @param {Object} _request the HTTP request
   * @param {Object} _response the HTTP response
   */
  router.route('/users/:username/follows/:followedUser').delete((_request, _response) => (
    MIDDLEWARE.unfollow(_request, _response, result => _response.json(result))
  ));

  return router;
}

module.exports = routing;

/**
 * log - Logs a message to the server console
 * @param {String} _message the log message
 * @param {Object} _request the HTTP request
 */
function log(_message, _request) {
  LOG.log('Router Module', _message, _request);
}

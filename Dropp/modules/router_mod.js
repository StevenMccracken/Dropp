/**
 * router_mod - HTTP request routing @module
 */

const MIDDLEWARE 	= require('./middleware_mod');
const MEDIA 		  = require('./media_mod');
var router        = null;

var routing = function(_router) {
	router = _router;

  /**
	 * Middleware to log metadata about incoming requests
   * @param {Object} request the HTTP request
   * @param {Object} response the HTTP response
   * @param {callback} next the callback to execute after metadata has been logged
   */
	router.use((request, response, next) => {
	  const IP = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
		console.log('%s: %s request received from IP %s', new Date().toISOString(), request.method, IP);
    next()
	});

	/**
	 * The base GET route for the API. This route
	 * does not require token authentication
	 * @param {Object} request the HTTP request
	 * @param {Object} response the HTTP response
	 */
	router.get('/', (request, response) => {
    response.json( { message: 'This is the REST API for Dropp' } );
	});

	/**
	 * The POST route for validating login credentials. Sends
	 * an error JSON or a JSON web token for the requesting
	 * client. This route does not require token authentication
	 * @param {Object} request the HTTP request
	 * @param {Object} response the HTTP response
	 */
	router.route('/authenticate').post((request, response) => {
	   MIDDLEWARE.auth(request, response, result => {
       response.json(result);
     });
   });

	/**
	 * The POST route for creating a user. Sends an error JSON or a JSON of
	 * the created user. This route does not require token authentication
	 * @param {Object} request the HTTP request
	 * @param {Object} response the HTTP response
	 */
	router.route('/users').post((request, response) => {
    MIDDLEWARE.createUser(request, response, result => {
      response.json(result);
    });
	});

	/**
	 * The GET route for retrieving a user by their username. Sends an error JSON
	 * or a JSON of the requested user. This route requires token authentication
	 * @param {Object} request the HTTP request
	 * @param {Object} response the HTTP response
	 */
	router.route('/users/:username').get((request, response) => {
    MIDDLEWARE.getUser(request, response, result => {
      response.json(result);
		});
	});

	/**
	 * The GET route for retrieving all dropps. Sends an error JSON or a
	 * JSON of all the dropps. This route requires token authentication
	 * @param {Object} request the HTTP request
	 * @param {Object} response the HTTP response
	 */
	router.route('/dropps').get(function(request, response) {
    MIDDLEWARE.getAllDropps(request, response, result => {
      response.json(result);
		});
  });

	/**
	 * The GET route for retrieving all dropps posted by a specific
	 * user. Sends an error JSON or a JSON of the dropps posted by
	 * the requested user. This route requires token authentication
	 * @param {Object} request the HTTP request
	 * @param {Object} response the HTTP response
	 */
	router.route('/users/:username/dropps').get(function(request, response) {
		MIDDLEWARE.getDroppsByUser(request, response, result => {
      response.json(result);
		});
	});

	/**
	 * The GET route for retrieving a dropp by its id. Sends an error JSON or
	 * a JSON of the requested dropp. This route requires token authentication
	 * @param {Object} request the HTTP request
	 * @param {Object} response the HTTP response
	 */
	router.route('/dropps/:droppId').get(function(request, response) {
		MIDDLEWARE.getDropp(request, response, result => {
			response.json(result);
		});
	});

	/**
	 * The POST route for retrieving dropps near a specific location.
	 * Sends an error JSON or a JSON of the dropps near that
	 * specific location. This route requires token authentication
	 * @param {Object} request the HTTP request
	 * @param {Object} response the HTTP response
	 */
	router.route('/location/dropps').post(function(request, response) {
    MIDDLEWARE.getDroppsByLocation(request, response, result => {
      response.json(result);
		});
	});

	/**
	 * The POST route for creating a dropp. Sends an error JSON or a JSON
	 * of the created dropp's id. This route requires token authentication
	 * @param {Object} request the HTTP request
	 * @param {Object} response the HTTP response
	 */
	router.route('/dropps').post(function(request, response) {
    MIDDLEWARE.createDropp(request, response, result => {
      response.json(result);
    });
  });

	/**
	 * The POST route for uploading an image to link with a dropp.
	 * The request body Content-Type MUST be multipart/form-data.
	 * This route requires token authentication
	 * @param {Object} request the HTTP request
	 * @param {Object} response the HTTP response
	 */
	router.route('/dropps/:droppId/image')
    .post(MEDIA.upload.single('image'), function(request, response) {
      MIDDLEWARE.addImage(request, response, result => {
        response.json(result);
      });
    });

	/**
	 * The GET route for downloading the image linked to a
   * dropp. This route requires token authentication
   * @param {Object} request the HTTP request
   * @param {Object} response the HTTP response
   */
  router.route('/dropps/:droppId/image').get(function(request, response) {
   	MIDDLEWARE.getImage(request, response, result => {
			// There was no error retrieving media, so write the data to the request
      if (result.media != null) {
				if (request.headers != null && request.headers.platform === 'React-Native') {
					response.send(result.media);
				} else {
					response.write(result.media, 'binary');
	     		response.end(null, 'binary');
				}
   		} else {
				// There was an error retrieving the image, so send a regular JSON
   			response.json(result);
   		}
    });
  });

	return router;
}

module.exports = routing;

/**
 * router_mod - HTTP request routing @module
 */


var router = null;

var middleware = require('./middleware_mod');

var routing = function(_router){

	router = _router;	
	/**
	* Middleware to log metadata about incoming requests
   	* @param {Object} req the HTTP request
   	* @param {Object} res the HTTP response
   	* @param {callback} next the callback to execute after metadata has been logged
   	*/

	router.use((req, res, next) => {
	    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		console.log('%s: %s request received from IP %s', new Date().toISOString(), req.method, ip);
	    next();
	});


	/**
	* The base GET route for the API. This route
	* does not require token authentication
	* @param {Object} req the HTTP request
	* @param {Object} res the HTTP response
	*/

	router.get('/', (req, res) => {
		res.json( { message: 'This is the REST API for Dropp' } );
	});


	/**
	 * The POST route for validating login credentials. Sends
	 * an error JSON or a JSON web token for the requesting
	 * client. This route does not require token authentication
	 * @param {Object} req the HTTP request
	 * @param {Object} res the HTTP response
	 */

	router.route('/authenticate').post((req, res) =>{


		// Call middleware
		middleware.auth(req, res, response => {
			res.json(response);
		});
	});


	/**
	 * The POST route for creating a user. Sends an error JSON or a JSON of
	 * the created user. This route does not require token authentication
	 * @param {Object} req the HTTP request
	 * @param {Object} res the HTTP response
	 */

	router.route('/users').post((req, res) => {

		// Call Middleware
		middleware.createUser(req, res, response => {
			res.json(response);
		});
	});


	/**
	 * The GET route for retrieving a user by their username. Sends an error JSON
	 * or a JSON of the requested user. This route requires token authentication
	 * @param {Object} req the HTTP request
	 * @param {Object} res the HTTP response
	 */

	router.route('/users/:username').get((req, res) => {

		// Call Middleware

		middleware.getUser(req, res, response => {
			res.json(response);
			// res.json({ message: "Default Messages "});
		});
	});


	/**
	 * The GET route for retrieving all dropps. Sends an error JSON or a
	 * JSON of all the dropps. This route requires token authentication
	 * @param {Object} req the HTTP request
	 * @param {Object} res the HTTP response
	 */

	router.route('/dropps').get(function(req, res) {

		// Call middleware, getAllDropps
		// res.json({ message: "Default Messages "});
		middleware.getAllDropps(req, res, response => {
			res.json(response);
		});
	});


	/**
	 * The GET route for retrieving all dropps posted by a specific
	 * user. Sends an error JSON or a JSON of the dropps posted by
	 * the requested user. This route requires token authentication
	 * @param {Object} req the HTTP request
	 * @param {Object} res the HTTP response
	 */

	router.route('/users/:username/dropps').get(function(req, res) {

		// middleware, getDroppsByUser
		// res.json({ message: "Default Messages "});
		middleware.getDroppsByUser(req, res, response => {
			res.json(response);
		});
	});


	/**
	 * The GET route for retrieving a dropp by its id. Sends an error JSON or
	 * a JSON of the requested dropp. This route requires token authentication
	 * @param {Object} req the HTTP request
	 * @param {Object} res the HTTP response
	 */

	router.route('/dropps/:droppId').get(function(req, res) {

		// call middleware
		// res.json({ message: "Default Messages "});
		middleware.getDroppsById(req, res, response => {
			res.json(response);
		});
	});


	/**
	 * The POST route for retrieving dropps near a specific location.
	 * Sends an error JSON or a JSON of the dropps near that
	 * specific location. This route requires token authentication
	 * @param {Object} req the HTTP request
	 * @param {Object} res the HTTP response
	 */

	router.route('/location/dropps').post(function(req, res) {

		// call middleware
		// res.json({ message: "Default Messages "});
		middleware.getDroppsByLocation(req, res, response => {
			res.json(response);
		});
	});


	/**
	 * The POST route for creating a dropp. Sends an error JSON or a JSON
	 * of the created dropp's id. This route requires token authentication
	 * @param {Object} req the HTTP request
	 * @param {Object} res the HTTP response
	 */

	 router.route('/dropps').post(function(req, res) {

	 	// call middleware
	 	// res.json({ message: "Default Messages "});
	 	middleware.createDropps(req, res, response => {
	 		res.json(response);
	 	});
	 });


	return router;
} 


module.exports = routing;

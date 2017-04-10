/* Routing module */

var firebase 	= require('./firebase_mod.js');
var service 	= require('./service_mod.js');
var router 		= null;

module.exports = function(_router) {
	router = _router;

	// Middleware
	router.use( (req, res, next) => {
	    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	    console.log(req.method + ' request came in from ' + ip);
	    next();
	});

	/* ----- Routes ----- */
	router.get('/', (req, res) => {
	    res.send('Welcome to Dropp');
	});

	// Get all dropps
	router.route('/dropps').get((req, res) => {
		firebase.GET('/dropps', dropps => {
			res.json(dropps);
		});
	});

	// Get a specific dropp
	router.route('/dropps/:dropp_id').get((req, res) => {
		firebase.GET('/dropps/' + req.params.dropp_id, dropp => {
			res.json(dropp);
		});
	});

	// Get dropps specific to user location provided in the request body
	router.route('/dropps/location').post((req, res) => {
		// Validate request parameters
		if(req.body.location == null || !isValidLocation(req.body.location)) {
			reject(req, res, 'location');
			return;
		}
		if(req.body.max_distance == null || req.body.max_distance <= 0) {
			reject(req, res, 'max_distance');
			return;
		}

	    firebase.GET('/dropps', dropps => {
	    	try {
	    		var user_location 	= req.body.location.split(',').map(Number);
				var max_distance 	= req.body.max_distance;
				var closeDropps 	= service.getCloseDropps(dropps, user_location, max_distance);
				res.json(closeDropps);
	    	} catch(err) {
	    		console.log(err);
				// TODO: Send failure to client or try again?
	    	}
	    });
	});

	// Post a dropp
	router.route('/dropps').post((req, res) => {
		// Validate request parameters
		if(req.body.location == null || !isValidLocation(req.body.location)) {
			reject(req, res, 'location');
			return;
		}
		if(req.body.timestamp == null || req.body.timestamp.match(/^\d+$/) == null || parseInt(req.body.timestamp) < 0) {
			reject(req, res, 'timestamp');
			return;
		}
		if(req.body.user_id == null || req.body.user_id === "") {
			reject(req, res, 'user_id');
			return;
		}
		if(req.body.text == null && req.body.media == null) {
			reject(req, res, 'empty content');
			return;
		}

	    var newDropp = {
            "location"  : req.body.location,
            "timestamp" : parseInt(req.body.timestamp),
            "user_id"   : req.body.user_id,
            "content"   :
            {
                "text"    : req.body.text	== null ? '' : req.body.text,
                "media"   : req.body.media	== null ? '' : req.body.media // TODO: Actually upload image
            }
        }

        firebase.POST('/dropps', newDropp, 'push', response => {
        	res.send(response);
        });
	});

	return router;
}

// Create server log about failed request and send failure response to client
function reject(request, response, reason) {
	console.log('INVALID %s REQUEST! Reason: %s', request.method, reason);
	response.send('invalid_request');
}

// Helper function to validate latitude, longitude coordinates
function isValidLocation(locString) {
	return locString.match(/^(\-?\d+(\.\d+)?),\s*(\-?\d+(\.\d+)?)$/) != null;
}

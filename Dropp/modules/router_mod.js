/** router_mod.js **/


var firebase 	= require('./firebase_mod.js');
var service 	= require('./service_mod.js');
var router 		= null;

module.exports = function(_router){

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
	router.route('/dropps')
	.get((req, res) => {
		/*
		firebase.GET("/dropps").then(response => {
			// On Success
			var dropps = response;
			res.json(dropps);
		}, error => {
			// On Error
			console.log("Error on: /dropps request" );
			console.log(error);
		});
		*/
		firebase.GET("/dropps", dropps => {
			res.json(dropps);
		})
	});


	// Get a specific dropp
	router.route('/dropps/:dropp_id')
	.get((req, res) => {
		/*
		firebase.GET("/dropps/" + _req.params.dropp_id).then(response => {
			// On Success
			var dropps = response;
			res.json(dropps);
		}, error => {
			// On Error
			console.log("Error on: /dropps/:dropps_id");
			console.log(error);
		});
		*/
	});

	// Get dropps specific to user location provided in the request body
	router.route('/dropps/location')
	.post((req, res) => {
		/*
	    if(req.body.location == null || req.body.max_distance == null) {
	        console.log('Invalid request, body contains');
	        console.log(req.body);
	        res.send("invalid_request");
	        return;
	    }

	    firebase.GET("/dropps").then(response => {
	    	// On Success
			var dropps 	= response;
			try{
				var user_location 	= req.body.location.split(",").map(Number);
				var max_distance 	= req.body.max_distance;
				var closeDropps = service.getCloseDropps(dropps, user_location, max_distance);
				res.json(closeDropps);
			} catch (err){
				console.log(err);
			}
			
	    }, error =>{
	    	// On error
	    	console.log("Error on: /dropps/location");
	    	console.log(error);
	    });
		*/
	});


	// Post a dropp
	router.route('/dropps')
	.post((req, res) => {
	    if(req.body.location == null || req.body.timestamp == null || req.body.user_id == null) {
	        console.log('Invalid request, body contains');
	        console.log(req.body);
	        res.send("invalid_request");
	        return;
	    }

	    /*
	    var newDropp = {
            "location"  : req.body.location,
            "timestamp" : parseInt(req.body.timestamp),
            "user_id"   : req.body.user_id,
            "content"   :
            {
                "text"    : req.body.text       === 'null' ? '' : req.body.text,
                "media"   : req.body.media      === 'null' ? '' : req.body.media
            }
        }

        firebase.POST("/dropps", newDropp, "push").then(response => {
        	res.send(response);
        }, error => {
        	console.log("Error on POST /dropps");
        	console.log(error);
        });
		*/

	    /*
	    var ref = db.ref("/dropps");
	    var newDropp = ref.push(
	        {
	            "location"  : req.body.location,
	            "timestamp" : parseInt(req.body.timestamp),
	            "user_id"   : req.body.user_id,
	            "content"   :
	            {
	                "text"    : req.body.text       === 'null' ? '' : req.body.text,
	                "media"   : req.body.media      === 'null' ? '' : req.body.media
	            }
	        });
	        res.send(newDropp.key); // Return the dropp id
	        */
	    });

	return router;
}
var admin = require('firebase-admin');
var express = require('express');
var bodyParser = require('body-parser')

var app = express();
var port = 80;
var router = express.Router();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// Setup firebase
var serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://dropp-3a65d.firebaseio.com"
});

var db = admin.database(); // Get the db object to call on

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

app.use('/api', router);

// Get all dropps
router.route('/dropps')
.get((req, res) => {
    var ref = db.ref("/dropps");
    ref.once("value", (snapshot) => {
        res.json(snapshot.val());
    });
});

// Get a specific dropp
router.route('/dropps/:dropp_id')
.get((req, res) => {
    var ref = db.ref("/dropps/" + req.params.dropp_id);
    ref.once("value", (snapshot) => {
        res.json(snapshot.val());
    });
});

// Get dropps specific to user location provided in the request body
router.route('/dropps/location')
.post((req, res) => {
    if(req.body.location == null || req.body.max_distance == null) {
        console.log('Invalid request, body contains');
        console.log(req.body);
        res.send("invalid_request");
        return;
    }

    var ref = db.ref("/dropps");
    ref.once("value", (snapshot) => {
        var dropps = snapshot.val();
        var user_location = req.body.location.split(",").map(Number);
        var max_distance = req.body.max_distance;

        var closeDropps = getCloseDropps(dropps, user_location, max_distance);
        res.json(closeDropps);
    });
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
    });

// Start listening
app.listen(port, (err) => {
    if (err) return console.log('Server error', err);
    console.log(`Dropp server is listening on port ${port}`);
});

/* ----- Utility functions ----- */

// Filters out the dropps that are further than max_distance from user_location
function getCloseDropps(dropps, user_location, max_distance) {
    var closeDropps = {};

    // Loop over all the dropps in the JSON
    for(var dropp in dropps) {
        var info = dropps[dropp]; // dropp is the key (ex. '-Ksadflkjl3d')
        var dropp_location = info["location"].split(",").map(Number); // Get string lat/long coords into number array

        var distance = dist(user_location, dropp_location); // Calculate straight-path distance between the points
        if(distance <= max_distance) closeDropps[dropp] = info; // Save the dropp to the return set if it's close enough
    }
    return closeDropps;
}

// Haversine function to calculate the distance between two GPS coordinates
function dist(loc1, loc2) {
    var radians = (degrees) => { return degrees * Math.PI / 180; };

    var r = 6371e3; // meters
    var lat1 = loc1[0], lat2 = loc2[0];
    var lon1 = loc1[1], lon2 = loc2[1];

    var dLat = radians(lat2 - lat1);
    var dLon = radians(lon2 - lon1);
    var lat1 = radians(lat1)
    var lat2 = radians(lat2);

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return r * c; // distance
}

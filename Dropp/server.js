var admin = require('firebase-admin');
var express = require('express');
var bodyParser = require('body-parser')

var app = express();
var port = process.env.PORT || 3000;
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
    console.log('Request came in');
    next();
});

/* --------------- Routes --------------- */
router.get('/', (req, res) => {
    res.status(200).send('Welcome to Dropp');
});

app.use('/api', router);

// Get all dropps
router.route('/dropps')
  .get( (req, res) => {
    var ref = db.ref("/");
    ref.once("value", (snapshot) => {
      res.json(snapshot.val());
    });
  });

// Post a dropp
router.route('/dropps')
  .post( (req, res) => {
    var ref = db.ref("/");
    var newDropp = ref.push(
      {
        "location"  : req.body.location,
        "timestamp" : parseInt(req.body.timestamp),
        "content"   :
        {
          "text"    : req.body.text,
          "media"   : req.body.media === 'null' ? null : req.body.media
        }
      });
    res.status(201).send(newDropp.key); // Return the dropp id
  });

// Get a specific dropp
router.route('/dropps/:dropp_id')
  .get( (req, res) => {
    var ref = db.ref("/" + req.params.dropp_id);
    ref.once("value", (snapshot) => {
      res.json(snapshot.val());
    });
  });

// Start listening
app.listen(port, (err) => {
  if (err) {
    return console.log('Server error', err);
  }

  console.log(`Dropp server is listening on ${port}`);
});

var admin = require('firebase-admin');
var express = require('express');
var app = express();

var port = process.env.PORT || 3000;
var router = express.Router();

// Setup firebase
var serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://dropp-3a65d.firebaseio.com"
});

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

router.route('/dropps')
  .get( (req, res) => {
    res.json(
      {
        "1":
        {
          "id": 4,
          "timezone": "PST",
          "timestamp": "2017-03-14 12:42:41",
          "text": "Game at the pyramid is lit!",
          "media": null
        },
        "2":
        {
          "id": 5,
          "timezone": "PST",
          "timestamp": "2017-03-14 09:21:16",
          "text": "So bored at the library right now...",
          "media": null
        }
      }
    );
  });

router.route('/dropps/:dropp_id')
  .get( (req, res) => {
    res.send(req.params.dropp_id);
  });

// Start listening
app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err);
  }

  console.log(`server is listening on ${port}`);
});

var admin = require('firebase-admin');
const express = require('express');
const app = express();
const port = 3000;

var serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://dropp-3a65d.firebaseio.com"
});

app.post('/', function(req, res) {
  console.log('Posted');
  console.log(req.body);
  res.send('heyo');
})

app.get('/', (request, response) => {
  response.send('Let\'s Dropp');
});

app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err);
  }

  console.log(`server is listening on ${port}`);
});

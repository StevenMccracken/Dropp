const express = require('express');
const app = express();
const port = 3000;

app.post('/', function(req, res) {
  const shit = req.body;
  res.send('heyo');
})

app.get('/', (request, response) => {
  response.send('Hello from Express!');
});

app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err);
  }

  console.log(`server is listening on ${port}`);
});

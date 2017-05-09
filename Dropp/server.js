/**
 * server - Initializes the express server and starts listening
 */

const express     = require('express');
const app         = express();
const router 	    = require('./modules/router_mod.js')(express.Router());
const bodyParser  = require('body-parser');
var port      	  = 8080;

var exports = module.exports = {};

// For purpose of checking travis, need to be remove later
if (process.env.TEST) {
  port = 3000;
}

// Set properties of the express server
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// Set the base route path
app.use('/', router);

/**
 * Listens for all incoming requests
 * @param {Number} port the port to listen on
 * @param {callback} err the callback that handles any errors
 */
var server = app.listen(port, (err) => {
  if (err) console.log('Server connection error', err);
  else console.log(`Dropp server is listening on port ${port}`);
});

exports.closeServer = function() {
  server.close();
};

/**
 * server - Initializes the express server and starts listening
 */

const Express = require('express');
const ROUTER = require('./modules/router_mod.js')(Express.Router());
const BODY_PARSER = require('body-parser');

// Instantiate the express application server
const APP = Express();

// Configure the server to accept application/x-www-form-urlencoded requests
APP.use(
  BODY_PARSER.urlencoded({
    parameterLimit: 100000000,
    limit: '10000kb',
    extended: true,
  })
);

// Set the base route for the server URL address
APP.use('/', ROUTER);

// Configure the port that the server listens on
let port = 8080;
if (process.env.TEST) port = 3000;

/**
 * Listens for all incoming requests
 * @param {Number} port the port to listen on
 * @param {callback} error the callback that handles any errors
 */
const SERVER = APP.listen(port, (error) => {
  if (error === undefined) console.log('Dropp server is listening on port %d', port);
  else console.log('Server connection error: %s', error);
});

exports.closeServer = () => {
  SERVER.close();
};

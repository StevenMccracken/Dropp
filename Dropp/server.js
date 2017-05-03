/**
 * server - Initializes the express server and starts listening
 */

const PORT        = 80;
const express     = require('express');
const app         = express();
const router 	  = require('./modules/router_mod.js')(express.Router());
const bodyParser  = require('body-parser');

// Set properties of the express server
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set the base route path
app.use('/', router);

/**
 * Listens for all incoming requests
 * @param {Number} PORT the port to listen on
 * @param {callback} err the callback that handles any errors
 */
app.listen(PORT, (err) => {
    if (err) return console.log('Server connection error', err);
    else console.log(`Dropp server is listening on port ${PORT}`);
});

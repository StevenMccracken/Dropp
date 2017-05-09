/**
 * server - Initializes the express server and starts listening
 */

var PORT     	 	= 8080;
const express   	= require('express');
const app       	= express();
const router 		= require('./modules/router_mod')(express.Router());
const bodyParser  	= require('body-parser');


 var exports = module.exports = {};

// For purpose of checking travis, need to be remove later
if (process.env.TEST) {
  PORT = 3000;
}

// Set properties of the express 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	parameterLimit: 100000,
    limit: '5mb',
	extended: true
}));

// Set the base route path
app.use('/', router);

/**
 * Listens for all incoming requests
 * @param {Number} PORT the port to listen on
 * @param {callback} err the callback that handles any errors
 */
 var server = app.listen(PORT, (err) => {
 	if (err) console.log('Server connection error', err);
 	else console.log(`Dropp server is listening on port ${PORT}`);
 });

 exports.closeServer = function(){
 	server.close();
 };


/**
 * Initializes the REST API node server
 */

const Cors = require('cors');
const Express = require('express');
const BodyParser = require('body-parser');
const Utils = require('./src/utilities/utils');
const Routes = require('./src/routing/router');
const Firebase = require('./src/firebase/firebase');

let server;
const PORTS = {
  DEV: 8080,
  TEST: 8081,
  PROD: 8080,
};

// Helper function definitions

const startupStepper = Utils.stepper();
const shutdownStepper = Utils.stepper();

/**
 * Logs a message to the console
 * @param {String} _message the message to log
 * @param {Boolean} [_printNewLine=false] whether or not
 * there should be a new line printed before the message
 */
function log(_message, _printNewLine = false) {
  if (_printNewLine === true) console.log();
  console.log(_message);
}

/**
 * Logs a message about the server startup process
 * @param {String} _message the startup message to log
 * @param {Boolean} [_printNewLine=false] whether or not there
 * should be a new line printed before the startup message
 */
function startupLog(_message, _printNewLine = false) {
  const currentStep = startupStepper.next().value;
  const message = `[SERVER STARTUP] ${currentStep}) ${_message}`;
  log(message, _printNewLine);
}

/**
 * Logs a message about the server shutdown process
 * @param {String} _message the startup message to log
 * @param {Boolean} [_printNewLine=false] whether or not there
 * should be a new line printed before the shutdown message
 */
function shutdownLog(_message, _printNewLine = false) {
  const currentStep = shutdownStepper.next().value;
  const message = `[SERVER SHUTDOWN] ${currentStep}) ${_message}`;
  log(message, _printNewLine);
}

/**
 * Shuts down the Express application
 */
const shutdown = async function shutdown() {
  shutdownLog('Closing express application...', true);
  server.close();
  shutdownLog('Express application closed');
};

// Begin application initialization

startupLog('Initializing express application...', true);
const express = Express();
startupLog('Express application initialized');

// Configure CORS settings before registering routes
const whitelist = [];
const corsOptions = {
  origin: whitelist,
  preflightContinue: true,
  allowedHeaders: 'Content-Type,Authorization',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
};

// Enable the cors options on all routes
startupLog('Adding CORS configuration...', true);
express.use(Cors(corsOptions));
express.options('*', Cors(corsOptions));
startupLog('CORS configured');

// Request body parsing configuration
startupLog('Adding body-parser configuration...', true);
express.use(BodyParser.urlencoded({
  parameterLimit: 100000000,
  limit: '10000kb',
  extended: true,
}));
startupLog('Body-parser configured');

// Define the default port to listen on
let port = PORTS.DEV;

startupLog('Checking arguments...', true);
const usedArgsOptions = {
  env: false,
  port: false,
  test: false,
  prod: false,
  mock: false,
  bugsnag: false,
};

process.argv.forEach((arg) => {
  // Check for a custom 'port' argument
  const portMatches = arg.match(/--port=\d{4,6}/gi) || [];
  if (!usedArgsOptions.port && portMatches.length > 0) {
    startupLog('Checking port argument...', true);
    const portArgParts = portMatches[0].split('=');
    const potentialPort = parseInt(portArgParts[1].split('='), 10);
    if (potentialPort > 1024 && potentialPort < 32768) {
      port = potentialPort;
      usedArgsOptions.port = true;
      startupLog(`Port configured as ${port}`);
    } else startupLog(`Port argument ${potentialPort} is invalid`);
  }

  // Check if server is meant to be run in test mode with the 'test' argument
  const testMatches = arg.match(/--test/gi) || [];
  if (!usedArgsOptions.prod && !usedArgsOptions.test && testMatches.length > 0) {
    startupLog('Test flag recognized. Configuring test settings...', true);

    startupLog('Setting \'DROPP_ENV\' environment variable to \'test\'...', true);
    process.env.DROPP_ENV = 'test';
    usedArgsOptions.env = true;
    startupLog('Set environment to \'test\'');

    // Override any previous port configuration with the default test port
    startupLog('Configuring test port...', true);
    port = PORTS.TEST;
    usedArgsOptions.port = true;
    startupLog(`Port configured as ${port}`);

    usedArgsOptions.test = true;
    startupLog('Test settings configured', true);
  }

  // Check if database is meant to be run in mock mode with the 'mock' argument
  const mockMatches = arg.match(/--mock/gi) || [];
  if (!usedArgsOptions.prod && !usedArgsOptions.mock && mockMatches.length > 0) {
    startupLog('Mock flag recognized. Configuring mock settings...', true);

    startupLog('Setting \'MOCK\' environment variable to \'1\'...', true);
    process.env.MOCK = '1';
    usedArgsOptions.mock = true;
    startupLog('Set mock configuration to \'1\'');
    startupLog('Mock settings configured', true);
  }

  // Check if server is meant to be run in production mode with the 'prod' argument
  const productionMatches = arg.match(/--prod/gi) || [];
  if (!usedArgsOptions.prod && productionMatches.length > 0) {
    startupLog('Production flag recognized. Configuring production settings...', true);

    startupLog('Setting \'DROPP_ENV\' environment variable to \'prod\'...', true);
    process.env.DROPP_ENV = 'prod';
    usedArgsOptions.env = true;
    startupLog('Set environment to \'prod\'');

    // Override any previous port configuration with the default production port
    startupLog('Configuring production port...', true);
    port = PORTS.PROD;
    usedArgsOptions.port = true;
    startupLog(`Port configured as ${port}`);

    usedArgsOptions.prod = true;
    startupLog('Production settings configured', true);
  }
});

startupLog('Arguments checked', true);

// Set the port of the server in the environment
process.env.DROPP_PORT = `${port}`;

// Register the routes from the router module with the express application
startupLog('Adding Router configuration...', true);
const router = Routes(Express.Router());
express.use('/', router);
startupLog('Router configured');

// Start database connection
startupLog('Starting database...', true);
Firebase.start(process.env.MOCK === '1');
startupLog('Database started');

// Listen for all incoming requests on the specified port
startupLog('Starting Express app...', true);
server = express.listen(port, (connectionError) => {
  if (connectionError) startupLog(`Express connection error: ${connectionError}`);
  else startupLog(`Express app started. Listening on port ${port}`);
});

// Catch the kill signal
process.on('SIGINT', () => {
  shutdownLog('Caught interrupt signal. Cleaning up...', true);
  shutdown();
  shutdownLog('Done cleaning up', true);
  process.exit();
});

module.exports = {
  port,
  app: server,
  shutdown,
};

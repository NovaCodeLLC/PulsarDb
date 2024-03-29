#!/usr/bin/env node
'use strict';
/**
 * Module dependencies.
 */

const server = require('../dist/server');
const debug = require('debug')('pulsardb:server');
const http = require('http');

/**
 * Get port from environment and store in Express.
 */

const httpPort = normalizePort(process.env.PORT || '3000');

/**
 * Bootstrapping our application
 */
const app = server.Server.bootstrap().app;
app.set('port', httpPort);

/**
 * Create HTTP server.
 */
const httpServer = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

httpServer.listen(httpPort);
httpServer.on('error', onError);
httpServer.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  let port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  let bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  let addr = httpServer.address();
  let bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

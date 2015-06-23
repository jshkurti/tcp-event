var net    = require('net');
var spawn  = require('child_process').spawn;
var debug  = require('debug')('tcp-event:client');

module.exports = client = {};

client.connect = function(opts, cb) {
  var socket = new net.Socket();

  function onconnect() {
    socket.removeListener('error', onerror);
    cb(null, socket);
  }

  function onerror(err) {
    debug('socket error: ' + err.stack || err);
    socket.removeListener('connect', onconnect);
    cb(err);
  }

  socket.on('error', onerror);
  socket.on('connect', onconnect);

  if (opts.remote_addr && opts.remote_port)
    socket.connect({
      host : opts.remote_addr,
      port : opts.remote_port
    });
  else
    socket.connect(opts.listen_port);
};

client.launchDaemon = function(opts) {
  var child = spawn('node', ['./lib/server.js', opts.listen_port], {
    env      : process.env,
    cwd      : process.cwd(),
    stdio    : 'ignore',
    detached : true
  });
  child.unref();
  debug('Daemon launched');
};

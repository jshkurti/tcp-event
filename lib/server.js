var net     = require('net');
var debug   = require('debug')('tcp-event:server');
var Message = require('./message.js');

process.title = 'tcp-event daemon';

var clients = [];
var port    = process.argv[2];
var server  = net.createServer();

var broadcast = function(data) {
  debug('broadcasting an event');
  for (var i = 0; i < clients.length; ++i) {
    (function(i) {
      process.nextTick(function() {
        clients[i] && clients[i].send && clients[i].send(data);
      });
    })(i);
  }
};

server.on('connection', function(client) {
  debug('a client just connected');
  clients.push(new Message(client));
  client.on('message', broadcast);
  client.on('close', function() {
    debug('a client disconnected');
    for (var i = 0; i < clients.length; ++i) {
      if (clients[i] && clients[i].socket === client) {
        delete clients[i];
        break;
      }
    }
  });
});

server.listen(port, function() {
  debug('server up and running on port', port);
});

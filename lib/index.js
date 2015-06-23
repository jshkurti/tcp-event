var util    = require('util');
var debug   = require('debug')('tcp-event:main');
var Client  = require('./client.js');
var Message = require('./message.js');

var TcpEvent = function(opts) {
  if (!(this instanceof TcpEvent))
    return new TcpEvent(opts);

  var self = this;
  self.events = [];
  self.queue = [];
  self.connected = false;

  opts = util._extend({
    remote_addr    : undefined,
    remote_port    : undefined,
    listen_port    : 61337,
  }, opts);

  var main = function() {
    Client.connect(opts, function(err, socket) {
      if (err) {
        debug('Launching the daemon...');
        Client.launchDaemon(opts);
        setTimeout(main, 3000);
      }
      else {
        debug('Connected to daemon');
        self.connected = true;
        self.socket = socket;
        self.init();

        for (var i = 0; i < self.queue.length; ++i) {
          self._tcpEmit.apply(self, self.queue[i]);
          self.queue.slice(i--, 1);
        }
      }
    });
  };
  main();
};

TcpEvent.prototype.init = function() {
  var self = this;
  debug('initialize new tcp-event');
  self.message = new Message(self.socket);
  self.socket.on('message', function(data) {
    debug('new message');
    data = JSON.parse(data);
    data.length = Object.keys(data).length;
    self._emit.apply(self, data);
  });
};

TcpEvent.prototype.addListener = function(id, cb, once) {
  this.events.push({
    id   : id,
    cb   : cb,
    once : !!once
  });
};

TcpEvent.prototype.listeners = function(id) {
  var ret = [];
  for (var i = 0; i < this.events.length; ++i) {
    if (this.events[i]
        && this.events[i].id === id)
      ret.push({
        id : this.events[i].id,
        cb : this.events[i].cb
      });
  }
  return ret;
};

TcpEvent.prototype.removeListener = function(id, cb) {
  for (var i = 0; i < this.events.length; ++i) {
    if (this.events[i]
        && this.events[i].id === id
        && this.events[i].cb === cb)
      this.events.splice(i--, 1);
  }
};

TcpEvent.prototype.removeAllListeners = function(id) {
  for (var i = 0; i < this.events.length; ++i) {
    if (this.events[i]
        && this.events[i].id === id)
      this.events.splice(i--, 1);
  }
};

TcpEvent.prototype.on = function(id, cb) {
  this.addListener(id, cb, false);
};

TcpEvent.prototype.once = function(id, cb) {
  this.addListener(id, cb, true);
};

TcpEvent.prototype.emit = function() {
//  this._emit.apply(this, arguments);
  if (this.connected)
    this._tcpEmit.apply(this, arguments);
  else
    this.queue.push(arguments);
};

TcpEvent.prototype._emit = function() {
  var args = JSON.parse(JSON.stringify(arguments));
  var id   = args[0];

  delete args['0'];
  args = Object.keys(args).map(function(k) {return args[k]});

  for (var i = 0; i < this.events.length; ++i) {
    if (this.events[i]
        && this.events[i].id === id) {
      this.events[i].cb.apply(this, args);
      if (this.events[i].once)
        this.events.splice(i--, 1);
    }
  }
};

TcpEvent.prototype._tcpEmit = function() {
  debug('sending a message');
  this.message.send(JSON.stringify(arguments));
};

module.exports = TcpEvent;

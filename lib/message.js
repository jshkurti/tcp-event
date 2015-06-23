var debug = require('debug')('tcp-event:message');

var Message = function(socket) {
  if (!(this instanceof Message))
    return new Message(socket);

  this.data = undefined;
  this.socket = socket;
  this.init();
};

Message.prototype.init = function() {
  var self = this;

  debug('initialize new message instance');
  self.socket.on('data', function ondata(chunk) {
    if (self.data === undefined) {
      self.data = {};
      self.data.buffer = '';
      self.data.length = chunk.readUInt32LE();
      chunk = chunk.slice(4);
    }

    if (chunk.length < self.data.length) {
      self.data.buffer += chunk.toString();
      self.data.length -= chunk.length;
    }
    else if (chunk.length === self.data.length)  {
      self.data.buffer += chunk.toString();
      self.socket.emit('message', self.data.buffer);
      delete self.data;
    }
    else {
      var length = self.data.length;
      self.data.buffer += chunk.slice(0, self.data.length).toString();
      self.socket.emit('message', self.data.buffer);
      delete self.data;
      ondata.call(self, chunk.slice(length));
    }
  });
};

Message.prototype.send = function(data) {
  debug('sending a messsage');
  var header = new Buffer(4);
  var body = new Buffer(data);
  header.writeUInt32LE(body.length);
  this.socket.write(Buffer.concat([header, body]));
};

module.exports = Message;

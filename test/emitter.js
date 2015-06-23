var ee = require('..')();

var a = '';
for (var i = 0; i < 1024*1024; ++i) {
  a += 'a';
}

var b = '';
for (var i = 0; i < 1024*1024; ++i) {
  b += 'b';
}

var c = '';
for (var i = 0; i < 1024*1024; ++i) {
  c += 'c';
}

ee.emit('a', a);
ee.emit('b', b)
ee.emit('c', c);

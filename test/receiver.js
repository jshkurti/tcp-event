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


ee.once('a', function(data) {
  console.assert(data === a);
  console.log('received a');
});

ee.once('b', function(data) {
  console.assert(data === b);
  console.log('received b');
});

ee.once('c', function(data) {
  console.assert(data === c);
  console.log('received c');
});

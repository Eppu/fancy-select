var connect = require('connect');
var serveStatic = require('serve-static');

connect().use(serveStatic(__dirname)).listen(1337, function () {
  console.log('Server running on 1337...');
});
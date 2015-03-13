var app = require('koa')();
var router = require('koa-router')();

var PORT = 3001;

router.get('/', function *(next) {
  this.body = 'Hello world';
});

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(PORT);

console.log('server run at http://localhost:' + PORT);

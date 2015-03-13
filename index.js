var views = require('co-views');
var app = require('koa')();
var router = require('koa-router')();

var PORT = 3001;
var render = views(__dirname + '/refs', { ext: 'ejs' });

router.get('/', function *(next) {
  // this.body = 'Hello world';
  this.body = yield render('index', {
    title: 'test',
    description: 'xxx',
    body: '<h1>Hello EJS</h1>'
  });
});

app
  .use(router.routes())
  .use(router.allowedMethods());

if (!module.parent) {
  app.listen(PORT);
  console.log('server run at http://localhost:' + PORT);
}

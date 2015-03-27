'use strict';

var views = require('co-views');
var app = require('koa')();
var router = require('koa-router')();
var compress = require('koa-compress');
var logger = require('koa-log4js');

var React = require('react');
var assign = require('react/lib/Object.assign');

var url = require('url');
var fs = require('fs');
var path = require('path');

var PORT = 9001;
var LOG_FILE = __dirname + '/logs/normal.log';

// 创建日志目录
if (!fs.existsSync(path.dirname(LOG_FILE))) {
  fs.mkdirSync(path.dirname(LOG_FILE));
}

var compressConfig = {
  filter: function (content_type) {
    return /text/i.test(content_type);
  },
  threshold: 2048,
  flush: require('zlib').Z_SYNC_FLUSH
};

var render = views(__dirname + '/refs', { ext: 'ejs' });

function getBodyHTML(page, props) {
  var layout = null, child = null;
  while ((layout = page.type.layout || (page.defaultProps && page.defaultProps.layout))) {
    child = React.createElement(page, props, child);
    page = layout;
  }
  return React.renderToStaticMarkup(
    React.createElement(page, props, child)
  );
}

function getTemplateData(filename, query) {
  var page = require('./refs/components/pages/' + filename);
  var props = require('./refs/config/queryStringParse')(query) || {};
  return assign(page.meta, {
    body: getBodyHTML(page, props)
  });
}

var routers = require('./refs/config/urlrewrite');
Object.keys(routers).forEach((key) => {
  router.get(key, function *(next) {
    this.body = yield render('index', getTemplateData(routers[key], this.params.query));
  });
});

router.all('/api/:module/:action', function *(next) {
  var uri = url.parse(this.url, true);
  //console.log(url.parse(this.url, true));
  this.set('Content-Type', 'application/json;charset=utf-8');
  //this.redirect('/sign-in');
  //this.status = 301;
  //this.body = JSON.stringify({action: this.params.action});//this.params.action;
  try {
    require('.' + uri.pathname)(this);
  } catch (e) {
    console.error(e);
  }

});

// router.get('/', function *(next) {
//   this.body = yield render('index', getTemplateData('Index'));
// });
// router.get('/about', function *(next) {
//   this.body = yield render('index', getTemplateData('About'));
// });

app
  .use(compress(compressConfig))
  .use(logger({
    file: LOG_FILE
  }))
  .use(router.routes())
  .use(router.allowedMethods());

if (!module.parent) {
  app.listen(PORT);
  console.log('server run at ' + PORT);
}

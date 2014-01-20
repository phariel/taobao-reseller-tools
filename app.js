/**
 * Module dependencies.
 */

var express = require('express'),
  engine = require('ejs-locals'),
  index = require('./routes/index'),
  auth = require('./routes/auth'),
  products = require('./routes/products'),
  keyfile = require('./config/key'),
  http = require('http'),
  path = require('path');

var app = express();

// all environments
app.set('port', keyfile.port);
app.engine('ejs', engine);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('im ur father'));
app.use(express.session());
app.use(app.router);
app.use(require('less-middleware')({
  src: __dirname + '/public'
}));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', index.index);
app.get('/login', index.login);
app.post('/login', index.loginSvc);
app.get('/auth', auth.auth);
app.get('/products', products.index);
app.get('/products/inventory', products.inventory);
app.post('/products/update', products.update);
app.get('/products/sync', products.sync);
app.get('/products/sync/onsale', products.sync.onsale);
app.get('/products/sync/inventory', products.sync.inventory);

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
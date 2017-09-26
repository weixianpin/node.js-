
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var mongoStore = require('connect-mongo')(session);
var port = process.env.PORT || 3000;
var app = express();
var routes = require('./config/routes.js')(app);

mongoose.connect('mongodb://localhost/movie');//链接数据库

app.locals.moment = require('moment');
app.set('views', './views/pages');
app.set('view engine', 'jade');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
app.use(session({
	secret: 'movie',
	store: new mongoStore({
		url: 'mongodb://localhost/movie',
		collection: 'sessions'
	})
}));
app.use(express.static(path.join(__dirname, 'public')));
app.listen(port);
console.log('movie started on port' + port);



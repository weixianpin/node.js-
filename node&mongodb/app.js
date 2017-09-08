
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

var port = process.env.PORT || 3000;
var app = express();

app.set('views', './views/pages');
app.set('view engine', 'jade');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'bower_components')));
app.listen(port);

console.log('movie started on port ' + port);

//index page
app.get('/', function (req, res) {
	res.render('index', {
		title: 'movie 首页'
	});
});
//list page
app.get('/admin/list', function (req, res) {
	res.render('list', {
		title: 'movie 列表页'
	});
});
//detail page
app.get('/movie/:id', function (req, res) {
	res.render('detail', {
		title: 'movie 详细页'
	});
});
//admin page
app.get('/admin/movie', function (req, res) {
	res.render('admin', {
		title: 'movie 登录页'
	});
});
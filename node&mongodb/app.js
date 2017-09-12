
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var _ = require('underscore');
var Movie = require('./modules/movie.js');

var port = process.env.PORT || 3000;
var app = express();

mongoose.connect('mongoose.db: //localhost/movie');//链接数据库

app.locals.moment = require('moment');
app.set('views', './views/pages');
app.set('view engine', 'jade');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.listen(port);
console.log('movie started on port ' + port);

//index page
app.get('/', function (req, res) {
	Movie.fetch(function(err, movies) {
		if (err) {
				console.log(err);
		}
		res.render('index', {
			title: 'movie 首页',
			movies: movies
		}); 
	});
});
//list page
app.get('/admin/list', function (req, res) {
	Movie.fetch(function(err, movies) {
		if (err) {
				console.log(err);
		}
		res.render('admin', {
			title: 'movie 后台录入页',
			movies: movies
		}); 
	});
});

//list movie delete
app.delete('/admin/list', function(req, res) {
	var id = req.query.id;

	if (id) {
		Movie.remove({_id: id}, function(err, movie) {
			if(err) {
				console.log(err);
			}
			else {
				res.json({success: 1});
			}
		});
	}
});

//detail page
app.get('/movie/:id', function (req, res) {
	var id = req.params.id;
	Movie.findById(id, function(err, movie){
	res.render('detail', {
			title: 'movie' + movie.title,
			movie: movie
		});
	});
	
});

//admin update movie
app.get('/admin/update/:id', function(req, res) {
	var id = req.params.id;
	if(id) {
		Movie.findById(id, function(err, movie) {
			res.render('admin', {
				title: 'movie 后台更新页面',
				movie: movie
			});
		});
	}
});
 


//admin page
app.get('/admin/movie', function (req, res) {
	res.render('admin', {
		title: 'movie 后台录入页',
		movie: {
			title: '',
			director: '',
			country: '',
			year: '',
			poster: '',
			flash: '',
			summary: '',
			language: ''
		}
	});
});
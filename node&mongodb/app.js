
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var _ = require('underscore');
var Movie = require('./modules/movie.js');
var User = require('./modules/user.js');

var port = process.env.PORT || 3000;
var app = express();

mongoose.connect('mongodb://localhost/movie');//链接数据库

app.locals.moment = require('moment');
app.set('views', './views/pages');
app.set('view engine', 'jade');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));
app.listen(port);
console.log('movie started on port' + port);

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

//admin post movie
app.post('/admin/movie/new', function(req, res) {
	var id = req.body.movie._id;
	var movieObj = req.body.movie;//post 过来的movie
	var _movie;

	if(id !== 'undefined') {
		Movie.findById(id, function(err, movie) {
			if(err) {
				return console.log(err);
			}
			_movie = _.extend(movie, movieObj);//将post过来的数据替换原先的数据
			_movie.save(function(err, movie) {
				if(err) {
					console.log(err);
				}
				res.redirect('/movie/' + movie._id);
			});
		});
	}else {
		_movie = new Movie({
			title: movieObj.title,
			director: movieObj.director,
			country: movieObj.country,
			year: movieObj.year,
			language: movieObj.language,
			poster: movieObj.poster,
			flash: movieObj.flash,
			summary: movieObj.summary
		});
		_movie.save(function(err, movie) {
				if(err) {
					console.log(err);
				}
				res.redirect('/movie/' + movie._id);
		});
	}
});

//list page
app.get('/admin/list', function (req, res) {
	Movie.fetch(function(err, movies) {
		if (err) {
			return console.log(err);
		}
		res.render('list', {
			title: 'movie 后台录入页',
			movies: movies
		}); 
	});
});

//list delete movie 
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

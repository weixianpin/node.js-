
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
console.log('movie started on port' + port);

//index page

//admin post movie
app.post('/admin/movie/new', function(req, res) {
	var id = req.body.movie._id;
	var movieObj = req.body.movie;//post 过来的movie
	var _movie;

	if(id !== 'undefined') {
		Movie.findById(id, function(err, movie) {
			if(err) {
				console.log(err);
			}
			_movie = _.extend(movie, movieObj);//将post过来的数据替换原先的数据
			_movie.save(function(err, movie) {
				if(err) {
					console.log(err);
				}
				res.redirect('/movie/' + movie.id);
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
				res.redirect('/movie/' + movie.id);
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
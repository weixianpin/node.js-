
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


//signup
app.post('/user/signup', function(req,res) {
	var _user =  req.body.user; //从提交表单中获取user
	User.find('name:{_user.name}' , function(err, user) {
		if(err) {
			console.log(err);
		}
		// 该用户名已经被注册
		if(user) {
			return res.redirect('');// 重定向到首页
		}
		else {
			user = new User(_user);
			//调用save方法
			user.save(function(err, user) {
				if(err) {
					console.log(err);
				}else {
					// console.log(user);
					res.redirect('/admin/userlist');// 重定向到首页
				}
			});
		}
	});
	
});

// signin
app.post('/user/signin', function(req, res) {
	var _user = req.body.user;
	var name = _user.name;
	var password = user.password;

	User.findOne('{name: name}', function(err, user) {
		if(err) {
			console.log(err);
		}
		if(!user) {
			return res.redirect('/');
		}
		user.comparePassword(password, function(err, isMatch) {
			if(err) {
				console.log(err);
			}
			if(isMatch) {
				return res.redirect('');
			}else {
				console.log('Password Not Matched');
			}
		});
	});
});

// user list page
app.get('/admin/userlist', function (req, res) {
	User.fetch(function(err, users) {
		if (err) {
			return console.log(err);
		}
		res.render('userlist', {
			title: 'movie 用户列表页',
			users: users
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
			title: 'movie 列表页',
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

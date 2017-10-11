var _ = require('underscore');
var Movie = require('../modules/movie.js');
var Category = require('../modules/category.js');
var Comment = require('../modules/comment.js');
var fs = require('fs');
var path = require('path');

//detail page
exports.detail = function (req, res) {
	var id = req.params.id;
	Movie.update({_id: id}, {$inc: {pv: 1}}, function(err) {
				if(err) {
					console.log(err);
				}
			});
	Movie.findById(id, function(err, movie){
		
		Comment
		.find({movie:id})
		.populate('from', 'name')
		.exec(function(err, comments) {
			res.render('detail', {
				title: 'movie' + movie.title,
				movie: movie,
				comments: comments
			});
		});
	});
};

//admin page
exports.new = function (req, res) {
	Category.find({}, function(err, categories) {
		res.render('admin', {
				title: 'movie 后台录入页',
				movie: {},
				categories: categories
			});
	});
	
};

//admin update movie
exports.update = function(req, res) {
	var id = req.params.id;
	if(id) {
		Movie.findById(id, function(err, movie) {
			Category.find({}, function(err, categories) {
				res.render('admin', {
					title: 'movie 后台更新页面',
					movie: movie,
					categories: categories
				});
			});
		});
	}
};

// admin poster
exports.savePoster = function(req, res, next) {
	var posterData = req.files.uplaodPoster; // 上传文件
	var filePath = posterData.path; // 文件路径
	var originalFilename = posterData.originalFilename;// 用以判断文件是否存在
	if(originalFilename) {
		fs.readFile(filePath, function(err, data) {
			var timestamp = Date.now();// 以时间命名文件
			var type = posterData.type.split('/')[1];// 文件类型
			var poster = timestamp + '.' + type;
			var newPath = path.join(__dirname, '../../public/upload/' + poster);
			fs.writeFile(newPath, data, function(err) {
				req.poster = poster;
				next();
			});
		});
	}
	else {
		next();
	}
};

//admin post movie
exports.save = function(req, res) {
	var id = req.body.movie._id;
	var movieObj = req.body.movie;//post 过来的movie
	var _movie;

	if(req.poster) {
		movieObj.poster = req.poster;
	}

	if(id) {
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
		_movie = new Movie(movieObj);
		var categoryId = movieObj.category;
		var categoryName = movieObj.categoryName;
		_movie.save(function(err, movie) {
				if(err) {
					console.log(err);
				}

				if(categoryId) {
					Category.findById(categoryId, function(err, category) {
							category.movies.push(movie._id);
							category.save(function(err, category) {
								res.redirect('/movie/' + movie._id);
							});
					});
				}
				else if(categoryName) {
					var category = new Category({
						name: categoryName,
						movies: [movie._id]
					});
					category.save(function(err, category) {
						movie.category = category._id;
						movie.save(function(err, category) {
							res.redirect('/movie/' + movie._id);
						});
						
					});
				}
		});
	}
};

//list page
exports.list = function (req, res) {
	Movie.fetch(function(err, movies) {
		if (err) {
			return console.log(err);
		}
		res.render('list', {
			title: 'movie 列表页',
			movies: movies
		}); 
	});
};

//list delete movie 
exports.delete = function(req, res) {
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
};
var _ = require('underscore');
var Movie = require('../modules/movie.js');
var Category = require('../modules/category.js');

//admin new page
exports.new = function (req, res) {
	res.render('category_admin', {
		title: 'movie 后台分类录入页',
	});
};


//admin post movie
exports.save = function(req, res) {
	var _category = req.body.category;

	var category = new Category(_category);
	category.save(function(err, category) {
			if(err) {
				console.log(err);
			}
			res.redirect('/admin/category/list');
	});
};

// category list page
exports.list = function (req, res) {
	Category.fetch(function(err, categories) {
		if (err) {
			return console.log(err);
		}
		res.render('list', {
			title: '分类 列表页',
			categories: categories
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
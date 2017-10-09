var Movie = require('../modules/movie.js');
var Category =  require('../modules/category.js');
//index page
exports.index = function (req, res) {
	Category
		.find({})
		.populate({
			path: 'movies', 
			selector: 'title poster',
			options: {limit: 10}
		})
		// 执行回调
		.exec(function(err, categories) {
			if (err) {
				console.log(err);
			}
			res.render('index', {
				title: 'movie 首页',
				categories: categories
			});
		});
};
//search page
exports.search = function (req, res) {
	var catId = req.query.cat;
	var page = req.query.p;
	var count = 5;
	var index = page * count;


	Category
		.find({})
		.populate({
			path: 'movies', 
			selector: 'title poster',
		})
		// 执行回调
		.exec(function(err, categories) {
			if (err) {
				console.log(err);
			}
			var category = categories[0] || {};
			var movies = category.movies || [];
			var results = movies.slice(index, index + count);

			res.render('results', {
				title: 'movie 结果列表',
				keyword: category.name,
				currentPage: (page + 1),
				query: 'cat=' + catId,
				totalPage: Math.ceil(movies.length / count),// 向上取整
				movies: results
			});
		});
};
var Movie = require('../modules/movie.js');
var Category =  require('../modules/category.js');
//index page
exports.index = function (req, res) {
	Category
		.find({})
		.populate({path: 'movies', options: {limit: 10}})
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
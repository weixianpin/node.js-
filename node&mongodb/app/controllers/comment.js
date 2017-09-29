var Comment = require('../modules/comment.js');

// comment
exports.save = function(req, res) {
	var _comment = req.body.comment;
	var movieId = _comment.movie;
	var comment = new Comment(_comment);

	comment.save(function(err, movie) {
			if(err) {
				console.log(err);
			}
			res.redirect('/movie/' + movieId);
	});
};
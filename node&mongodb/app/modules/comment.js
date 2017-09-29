var mongoose = require('mongoose');
var MovieSchema = require('../schemas/movie.js');

var Comment = mongoose.model('Comment', CommentSchema);
module.exports = Comment;
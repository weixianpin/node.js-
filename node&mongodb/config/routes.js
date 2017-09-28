var _ = require('underscore');
var Index = require('../app/controllers/index.js');
var User = require('../app/controllers/user.js');
var Movie = require('../app/controllers/movie.js');
module.exports = function(app) {
	// pre handle user 预处理
	app.use(function(req, res, next) {
		var _user = req.session.user;
			if(_user) {
				app.locals.user = _user;
			}
			return next();
	});

	//index page
	app.get('/', Index.index);

	//signup
	app.post('/user/signup', User.signup);
	// signin
	app.post('/user/signin', User.signin);
	app.get('/signin', User.showSignin);
	app.get('/signup', User.showSignup);
	// logout
	app.get('/logout', User.logout);
	// user list page
	app.get('/admin/userlist', User.userlist);

	//detail page
	app.get('/movie/:id', Movie.detail);
	//admin new page
	app.get('/admin/movie', Movie.new);
	//admin update movie
	app.get('/admin/update/:id', Movie.update);
	//admin post movie
	app.post('/admin/movie/new', Movie.save);
	//list page
	app.get('/admin/list', Movie.list);
	//list delete movie 
	app.delete('/admin/list', Movie.delete);
};

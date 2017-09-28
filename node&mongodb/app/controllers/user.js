var User = require('../modules/user.js');


//signup
exports.showSignup = function (req, res) {
	
		res.render('signup', {
			title: '注册页面',
			users: users
		});
};

exports.signup = function(req,res) {
	var _user =  req.body.user; //从提交表单中获取user
	User.find('name:{_user.name}' , function(err, user) {
		if(err) {
			console.log(err);
		}
		// 该用户名已经被注册
		if(user) {
			return res.redirect('/signin');// 重定向到登录页
		}
		else {
			user = new User(_user);
			//调用save方法
			user.save(function(err, user) {
				if(err) {
					console.log(err);
				}else {
					// console.log(user);
					res.redirect('/');// 重定向到首页
				}
			});
		}
	});
	
};

// signin
exports.showSignin = function (req, res) {
	
		res.render('signin', {
			title: '登陆页面',
			users: users
		});
};

exports.signin = function(req, res) {
	var _user = req.body.user;
	var name = _user.name;
	var password = user.password;

	User.findOne('{name: name}', function(err, user) {
		if(err) {
			console.log(err);
		}
		if(!user) {
			return res.redirect('signup');
		}
		user.comparePassword(password, function(err, isMatch) {
			if(err) {
				console.log(err);
			}
			if(isMatch) {
				req.session.user = user;
				console.log('Password is Matched');
				return res.redirect('/');
			}else {
				console.log('Password Not Matched');
				return res.redirect('/signin');
			}
		});
	});
};

// logout
exports.logout = function(req, res) {
	delete req.session.user;
	// delete req.locals.user;

	res.redirect('/');
};

// userlist page
exports.userlist = function (req, res) {
	User.fetch(function(err, users) {
		if (err) {
			return console.log(err);
		}
		res.render('userlist', {
			title: 'movie 用户列表页',
			users: users
		}); 
	});
};
// authority for admin
exports.signinRequired = function (req, res, next) {
	var user = req.session.user;
	if(!user) {
		return res.redirect('/signin');
	}
	next();
};

exports.adminRequired = function (req, res, next) {
	var user = req.session.user;
	if(user.role <= 10) {
		return res.redirect('/signin');
	}
	next();
};
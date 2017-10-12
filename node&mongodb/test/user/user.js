var crypto = require('crypto');
var bcrypt = require('bcrypt');
// 获取随机字符串，user名字 
function getRandomString(le) {
	if (!le) {
		le = 16;
	}

	return crypto.randomBytes(Math.ceil(le / 2).toString('hex'));
}

var should = require('should');
var app = require('../../app.js');
var mongoose = require('mongoose');
var User = require('../../app/modules/user.js');

// test
var user;
describe('<Unit Test', function() {
	describe('Model User:', function() {
		before(function(done) {
			user={
				name: getRandomString(),
				password: 'password'
			};
			done();
		});
// 确定name用户不存在
		describe('Before Method save:', function() {
			it('should begin withour test user', function(done) {
				User.find({name: user.name}, function(err, users) {
					users.should.have.length(0);

					done();
				});
			});
		});
// 用户保存
		describe('User save:', function() {
			it('save without problems', function(done) {
				var _user = new User(user);
				_user.save(function(err) {
					should.not.exist(err);
					_user.remove(function(err) {
						should.not.exist(err);
					});
				});
			});

// 密码加密没有问题
		it('should password be hashed correctly', function(done) {
			var password = user.password;
			var _user = new User(user);
			_user.save(function(err) {
				should.not.exist(err);
				_user.password.should.not.have.length(0);
					bcrypt.compare(password, _user.password, function(err, isMatch) {
						should.not.exist(err);
						isMatch.should.equal(true);
						_user.remove(function(err) {
							should.not.exist(err);
							done();
						});
					});
					_user.remove(function(err) {
						should.not.exist(err);
					});
				});
			});
		});

		// 用户权限
		it('should have default role 0', function(done) {
			var _user = new User(user);

			_user.save(function(err) {
				_user.role.should.equal(0);
					
				_user.remove(function(err) {
					done();
				});
			});
		});
// 是否存在重复值
		it('should fail to save an existing user', function(done) {
			var _user1 = new User(user);
			_user1.save();

			var _user2 = new User(user);
			_user2.save(function(err) {
				should.have(err);
					
				_user1.remove(function(err) {
					if(!err) {
						_user2.remove(function(err) {
							done();
						});
					}
					done();
				});
			});
		});
	});
});
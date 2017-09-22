
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;

var UserSchema = new mongoose.Schema({
	name: {
		unique: true,
		type: String
	},
	password: String,
	meta: {
		createAt:{
			type: Date,
			default: Date.now()
		},
		updateAt:{
			type: Date,
			default: Date.now()
		}
	}
});

//每次存储数据前，调用该方法
UserSchema.pre('save', function (next) {
	var user = this;
	if (this.isNew) {
		//新加数据 创建时间和更新时间一样
		this.meta.createAt = this.meta.updateAt = Date.now();
	}else {
		this.meta.updateAt = Date.now();
	}
// hash 加盐加密
	bcrypt.genSalt(SALT_WORK_FACTOR, function(err,salt) {
		if(err) {
			return next(err);
		}
		bcrypt.hash(user.password, salt, function(err, hash) {
			if(err) {
				return next(err);
			}
			user.password = hash;
			next();
		});
	});

	next();
});

UserSchema.statics = {
	//取到数据库所有数据
	fetch: function(cb) {
		return this
		.find({})//查询数据
		.sort('meta.updateAt')
		.exec(cb);
	}, 
	findById: function(id, cb) {
		return this
		.findOne({_id: id})//查询数据
		.exec(cb);
	}
};
module.exports = UserSchema;
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var CategorySchema = new mongoose.Schema({
	name: String,
	movies: [{type: ObjectId, ref: 'Movie'}],
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
CategorySchema.pre('save', function (next) {
	if (this.isNew) {
		//新加数据 创建时间和更新时间一样
		this.meta.createAt = this.meta.updateAt = Date.now();
	}else {
		this.meta.updateAt = Date.now();
	}
	next();
});

CategorySchema.statics = {
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
module.exports = CategorySchema;
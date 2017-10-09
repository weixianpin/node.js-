var mongoose = require('mongoose');
var ObjectId = Schema.Types.ObjectId;
var Schame = mongoose.Schema

var MovieSchema = new Schema({
	director: String,
	title: String,
	language: String,
	country: String,
	summary: String,
	flash: String,
	poster: String,
	year: Number,
	category: ObjectId;

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
MovieSchema.pre('save', function (next) {
	if (this.isNew) {
		//新加数据 创建时间和更新时间一样
		this.meta.createAt = this.meta.updateAt = Date.now();
	}else {
		this.meta.updateAt = Date.now();
	}
	next();
});

MovieSchema.statics = {
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
module.exports = MovieSchema;
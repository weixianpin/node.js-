
var fs = require('fs');
var Promise = require('bluebird');

//对外暴露readFile()异步方法
exports.readFileAsync = function (fpath, encoding) {
	return Promise(function (resolve, reject) {
		fs.readFile(fpath, encoding, function (err, content) {
			if (err) {
				reject(err);
			}else{
				resolve(content);
			}
		});
	});
};
exports.writeFileAsync = function (fpath, content) {
	return Promise(function (resolve, reject) {
		fs.writeFile(fpath, content, function (err) {
			if (err) {
				reject(err);
			}else{
				resolve();
			}
		});
	});
};
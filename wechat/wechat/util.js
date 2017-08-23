
var Promise = require('bluebird');
var xml2js = require('xml2js');
exports.parseXMLAsync = function (xml) {//接收到xml原始数据
	return new Promise(function (resolve, reject) {
		//解析xml并返回结果
		xml2js.parseString(xml, {trim: true}, function (err, content) {
			if (err){
				reject(err);
			}else {
				resolve(content);
			}
		});
	});
};

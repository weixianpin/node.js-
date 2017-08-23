
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

function formatMessage (result) {
	var message = {};
	if (typeof result === 'object') {
		var keys = Object.keys(result);//拿到所有的key
		for (var i = 0; i < keys.length; i++) {
			var item = result[keys[i]];
			var key = keys[i];

			if (!(item instanceof Array) || item.length === 0) {
				continue;
			}
			if (item.length === 1) {
				var val = item[0];

				if (typeof val === 'object') {
					message[key] = formatMessage(val);
				}else {
					message[key] = (val || '').trim();
				}
			}
			else {//item的长度不为0和1，则item是一个数组
				message[key] = [];
				for (var j = 0; j < item.length; j++) {
					message[key].push(formatMessage(item[j]));
				}
			}

		}
	}
	return message;
}

exports.formatMessage = formatMessage;

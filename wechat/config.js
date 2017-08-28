
var path = require('path');
// var sha1 = require('sha1');
// var wechat = require('./wechat/generator.js');
var util = require('./libs/util.js');
var wechat_file = path.join(__dirname,'./config/wechat.txt');

var config = {
		weChat: {
				appID: 'wx28d1909da0d656f6',
				appSecret: 'c4095132ccf2e2486eb95a88c40ff6a8',
				token: 'c11203cafb4265ff',
				getAccessToken: function () {
					return util.readFileAsync(wechat_file);
				},
				saveAccessToken: function (data) {
					data = JSON.stringify(data);
					return util.writeFileAsync(wechat_file, data);
				}
		}
};
module.exports = config;
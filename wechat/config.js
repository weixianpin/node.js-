'use strict';

var path = require('path');

var util = require('./libs/util.js');
var wechat_file = path.join(__dirname,'./config/wechat.txt');

var config = {
		weChat: {
				appID: 'wx28d1909da0d656f6',
				appSecret: 'c4095132ccf2e2486eb95a88c40ff6a8',
				token: '9ab54b9489ea1797',
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
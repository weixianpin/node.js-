	// 'use strict';

	var Promise = require('bluebird');
	var request = Promise.promisify(require('request'));
	var util = require('./util.js');
	var fs = require('fs');

	var prefix = 'https://api.weixin.qq.com/cgi-bin/';
	var api = {
		accessToken: prefix + 'token?grant_type=client_credential',
		temporary: {
			upload: prefix + 'media/upload?'
		},
		permanent: {
			upload: prefix + 'material/add_material?',
			uploadNews: prefix + 'material/add_news?',
			uploadNewsPic: prefix + 'media/uploadimg?'
		}
		
	};
	function Wechat (opts) {
		var that = this;
		this.appID = opts.appID;
		this.appSecret = opts.appSecret;
	//获取票据,accesstoken是客户端与微信交互的的唯一票据(钥匙)
		this.getAccessToken = opts.getAccessToken;
		this.saveAccessToken = opts.saveAccessToken;

		this.fetchAccessToken();
	}

	Wechat.prototype.fetchAccessToken = function (data) {
		var that = this;
		if (this.access_token && this.expires_in) {
			if (this.isValidAccessToken(this)) {
				return Promise.resolve(this);
			}
		}
		//如果access_token无效，重新获取
		this.getAccessToken()
					.then(function (data) {//then就是向下传递结果
						try {
							data = JSON.parse(data);
						}
						catch (e){//如果票据不存在或不合法则更新票据
							return that.updateAccessToken();
						}
						//检测票据的合法性
						if (that.isValidAccessToken(data)) {
							return Promise.resolve(data);
						}else{
							return that.updateAccessToken();
						}
					})
					.then(function (data) {
						that.access_token = data.access_token;//将票据挂到data实例
						that.expires_in = data.expires_in;//票据过期字段
						that.saveAccessToken(data);
						return Promise.resolve(data);
					});
	};
//定义isValidAccessToken
	Wechat.prototype.isValidAccessToken = function (data) {
		if (!data || !data.access_token || !data.expires_in) {
			return false;
		}
		var access_token = data.access_token;
		var expires_in = data.expires_in;
		var time = (new Date().getTime());
		if (time < expires_in) {
			return true;
		}else {
			return false;
		}
	};
//更新票据
	Wechat.prototype.updateAccessToken = function (data) {
		var appID = this.appID;
		var appSecret = this.appSecret;
		var url = api.accessToken + '&appid=' + appID + '&secret=' + appSecret;
		return new Promise(function (resolve, reject) {
			request({url: url, json: true}).then(function (response) {
				var data = response.body;
				var time = (new Date().getTime());
			//服务器计算需要时间，提前20s刷新
				var expires_in = time + (data.expires_in - 20)*1000;
				data.expires_in = expires_in;
				resolve(data);
			});
		});
		
	};
//增加upload方法
	Wechat.prototype.uploadMaterial = function (type, filepath, permanent) {
		   var that = this;
		   var form ={};
		   var uploadUrl = api.temporary.upload;//临时素材地址

		   if (permanent) {
		   	uploadUrl = api.permanent.upload;//如果永久素材存在，获得其url
		   	_.extedd(form, permanent);
		 }
		 if (type === 'pic') {
		 	uploadUrl = api.permanent.uploadNews;
		 }
		//构造表单 
		   var form = {
			   media: fs.createReadStream(filepath)
		   };

		
		  return new Promise(function (resolve, reject) {
			that
				.fetchAccessToken()
				.then(function (data) {
					var url = api.upload + 'access_token=' + data.access_token + '&type=' + type;

					request({method: 'POST', url: url, formData: form, json: true}).then(function (response) {
						var _data = response.body;
						
						if (_data) {
							resolve(_data);
						}else {
							throw new Error('Upload material fails');
						}
					})
					.catch(function (err) {
						reject(err);
					});
				});
		});
		
	};

//构造回复方法
	Wechat.prototype.reply = function () {
		var content= this.body;//拿到回复消息的内容
		var message = this.weixin;//拿到微信
		var xml = util.tpl(content, message);

		this.status= 200;
		this.type = 'application/xml';
		this.body = xml;
	};

	module.exports = Wechat;
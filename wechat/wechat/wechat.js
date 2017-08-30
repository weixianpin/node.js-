	// 'use strict';

	var Promise = require('bluebird');
	var request = Promise.promisify(require('request'));
	var util = require('./util.js');
	var fs = require('fs');
	var _ = require('lodash');

	var prefix = 'https://api.weixin.qq.com/cgi-bin/';
	var api = {
		accessToken: prefix + 'token?grant_type=client_credential',
		temporary: {
			upload: prefix + 'media/upload?',//上传路径
			fetch: prefix + 'media/get?'//下载路径
		},
		permanent: {
			upload: prefix + 'material/add_material?',
			fetch: prefix + 'material/get_material?',
			uploadNews: prefix + 'material/add_news?',
			uploadNewsPic: prefix + 'media/uploadimg?',
			del: prefix + 'material/del_material?',
			update: prefix + 'material/update_news?',
			count: prefix + 'material/get_materialcount?',
			batch: prefix + 'material/batchget_material?'
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
	Wechat.prototype.uploadMaterial = function (type, material, permanent) {
		   var that = this;
		   var form ={};
		   var uploadUrl = api.temporary.upload;//临时素材地址

		   if (permanent) {
		   	uploadUrl = api.permanent.upload;//如果永久素材存在，获得其url
		   	_.extend(form, permanent);
		 }
		 if (type === 'pic') {
		 	uploadUrl = api.permanent.uploadNewsPic;
		 }
		 if (type === 'news') {
		 	uploadUrl = api.permanent.uploadNews;
		 	form = material;
		 }
		 else {
		 	form.media = fs.createReadStream(material);
		 }
		
		  return new Promise(function (resolve, reject) {
			that
				.fetchAccessToken()
				.then(function (data) {
					var url = uploadUrl + 'access_token=' + data.access_token;
					if (!permanent) {
						url += '&type=' + type;
					}else {
						form.access_token = data.access_token;
					}
					//定义上传参数
					var options = {
						method: 'POST',
						url: url,
						json: true
					};

					if (type === 'news') {
						options.body = form;
					}else {
						options.formData = form;
					}

					request(options).then(function (response) {
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

	Wechat.prototype.fetchMaterial = function (mediaId, type, permanent) {
		   var that = this;
		   var form = {};
		   var fetchUrl = api.temporary.fetch;//临时素材地址

		   if (permanent) {
		   	fetchUrl = api.permanent.fetch;//如果永久素材存在，获得其url
		 }
		
		  return new Promise(function (resolve, reject) {
			that
				.fetchAccessToken()
				.then(function (data) {
					var url = fetchUrl + 'access_token=' + data.access_token + '&media_id' + mediaId;
					
					var options = {
						method: 'POST',
						url: url,
						json: true
					};
					if (permanent) {
						form.media_id = mediaId;
						form.access_token = data.access_token;
						options.body = form;
					}else {
						if (type === 'video') {
							url = url.replace('https://', 'http://');
						}
						url += '&media_id=' + mediaId;
					}
					if (type === 'news' || type === 'video') {

							request(options).then(function (response) {
							var _data = response.body;
							
							if (_data) {
								resolve(_data);
							}else {
								throw new Error('Fetch material fails');
							}
						})
						.catch(function (err) {
							reject(err);
						});
					}
					else {
						resolve(url);
					}
					

					// if (!permanent && type === 'video') {
					// 	url = url.replace('https://', 'http://');
					// }
					// resolve(url);
				});
		});
		
	};

	Wechat.prototype.deleteMaterial = function (mediaId) {
		   var that = this;
		   var form ={
		   	media_id: mediaId
		   };
		
		  return new Promise(function (resolve, reject) {
			that
				.fetchAccessToken()
				.then(function (data) {
					var url = api.permanent.del + 'access_token=' + data.access_token + '&media_id' + mediaId;

					request({method: 'POST', url: url, body: form, json: true}).then(function (response) {
						var _data = response.body;
						
						if (_data) {
							resolve(_data);
						}else {
							throw new Error('Delete material fails');
						}
					})
					.catch(function (err) {
						reject(err);
					});
				});
		});
		
	};

	Wechat.prototype.updateMaterial = function (mediaId, news) {
		   var that = this;
		   var form ={
		   	media_id: mediaId
		   };
		   _extend(form, news);
		
		  return new Promise(function (resolve, reject) {
			that
				.fetchAccessToken()
				.then(function (data) {
					var url = api.permanent.update + 'access_token=' + data.access_token + '&media_id' + mediaId;

					request({method: 'POST', url: url, body: form, json: true}).then(function (response) {
						var _data = response.body;
						
						if (_data) {
							resolve(_data);
						}else {
							throw new Error('Update material fails');
						}
					})
					.catch(function (err) {
						reject(err);
					});
				});
		});
		
	};

	Wechat.prototype.countMaterial = function () {
		   var that = this;
		
		  return new Promise(function (resolve, reject) {
			that
				.fetchAccessToken()
				.then(function (data) {
					var url = api.permanent.count + 'access_token=' + data.access_token;

					request({method: 'GET', url: url, json: true}).then(function (response) {
						var _data = response.body;
						
						if (_data) {
							resolve(_data);
						}else {
							throw new Error('Count material fails');
						}
					})
					.catch(function (err) {
						reject(err);
					});
				});
		});
		
	};

	Wechat.prototype.batchMaterial = function (options) {
		   var that = this;
		   options.type = options.type || 'image';
		   options.offset = options.offset || 0;
		   options.count = options.count || 1;
		
		  return new Promise(function (resolve, reject) {
			that
				.fetchAccessToken()
				.then(function (data) {
					var url = api.permanent.batch + 'access_token=' + data.access_token;

					request({method: 'POST', url: url, body: options, json: true}).then(function (response) {
						var _data = response.body;
						
						if (_data) {
							resolve(_data);
						}else {
							throw new Error('Batch material fails');
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
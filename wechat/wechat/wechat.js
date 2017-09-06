	// 'use strict';

	var Promise = require('bluebird');
	var request = Promise.promisify(require('request'));
	var util = require('./util.js');
	var fs = require('fs');
	var _ = require('lodash');

	var prefix = 'https://api.weixin.qq.com/cgi-bin/';
	var mpPrefix = 'https://mp.weixin.qq.com/cgi-bin/';
	var semanticUrl = 'https://api.weixin.qq.com/semantic/semproxy/search?';
	var api = {
		semanticUrl: semanticUrl,
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
		},
		group: {
			create: prefix + 'groups/create?',
			fetch: prefix + 'groups/get?',
			check: prefix + 'groups/getid?',
			update: prefix + 'groups/update?',
			move: prefix + 'groups/mebers/update?',
			batchupdate: prefix + 'groups/mebers/chatchupdate?',
			del: prefix + 'groups/delete?',
		},
		user: {
			remark: prefix + 'user/info/updateremark?',
			fetch: prefix + 'user/info?',
			batchFetch: prefix + 'user/info/batchget?',
			list: prefix + 'user/get?'
		},
		mass: {
			byGroup: prefix + 'message/mass/sendall?',
			openId: prefix + 'message/mass/send?',
			del: prefix + 'message/mass/delete?',
			preview: prefix + 'message/mass/preview?',
			check: prefix + 'message/mass/get?'
		},
		menu: {
			create: prefix + 'menu/create?',
			get: prefix + 'menu/get?',
			del: prefix + 'menu/delete?',
			current: prefix + 'get_current_selfmenu_info?',
		},
		qrcode: {
			create: prefix + 'qrcode/create?',
			show: mpPrefix + 'showqrcode?'
		},
		shortUrl: {
			create: prefix + 'shorturl?'
		},
		ticket: {
			get: prefix + 'ticket/getticket'
		}
		
	};
	function Wechat (opts) {
		var that = this;
		this.appID = opts.appID;
		this.appSecret = opts.appSecret;
	//获取票据,accesstoken是客户端与微信交互的的唯一票据(钥匙)
		this.getAccessToken = opts.getAccessToken;
		this.saveAccessToken = opts.saveAccessToken;
		this.getTicket = opts.getTicket;
		this.saveTicket = opts.saveTicket;

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
		return this.getAccessToken()
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
//获取票据ticket
	Wechat.prototype.fetchTicket = function (access_token) {
		var that = this;
		
		//如果access_token无效，重新获取
		return this.getTicket()
					.then(function (data) {//then就是向下传递结果
						try {
							data = JSON.parse(data);
						}
						catch (e){//如果票据不存在或不合法则更新票据
							return that.updateTicket(access_token);
						}
						//检测票据的合法性
						if (that.isValidTicket(data)) {
							return Promise.resolve(data);
						}else{
							return that.updateTicket(access_token);
						}
					})
					.then(function (data) {
						
						that.saveTicket(data);
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

	Wechat.prototype.isValidTicket = function (data) {
		if (!data || !data.ticket || !data.expires_in) {
			return false;
		}
		var ticket = data.ticket;
		var expires_in = data.expires_in;
		var time = (new Date().getTime());
		if (ticket && time < expires_in) {
			return true;
		}else {
			return false;
		}
	};

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

	//更新ticket票据
		Wechat.prototype.updateTicket = function () {
			
			var url = api.ticket.get + '&access_token=' + access_token + '&type=jsapi';
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

//增加素材
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
					var url = fetchUrl + 'access_token=' + data.access_token + '&media_id=' + mediaId;
					
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
//删除素材
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
//更新素材
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
//统计素材
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
//获取永久素材
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
//创建分组
	Wechat.prototype.createGroup = function (name) {
		   var that = this;
		
		  return new Promise(function (resolve, reject) {
			that
				.fetchAccessToken()
				.then(function (data) {
					var url = api.group.create + 'access_token=' + data.access_token;
					var form = {
						group: {
							name: name
						}
					};

					request({method: 'POST', url: url, body: form, json: true}).then(function (response) {
						var _data = response.body;
						
						if (_data) {
							resolve(_data);
						}else {
							throw new Error('Create group fails');
						}
					})
					.catch(function (err) {
						reject(err);
					});
				});
		});
		
	};
//获取分组
	Wechat.prototype.fetchGroup = function (name) {
		   var that = this;
		
		  return new Promise(function (resolve, reject) {
			that
				.fetchAccessToken()
				.then(function (data) {
					var url = api.group.fetch + 'access_token=' + data.access_token;
					

					request({url: url, json: true}).then(function (response) {
						var _data = response.body;
						
						if (_data) {
							resolve(_data);
						}else {
							throw new Error('Fetch group fails');
						}
					})
					.catch(function (err) {
						reject(err);
					});
				});
		});
		
	};
//检查分组
	Wechat.prototype.checkGroup = function (openId) {
		   var that = this;
		
		  return new Promise(function (resolve, reject) {
			that
				.fetchAccessToken()
				.then(function (data) {
					var url = api.group.check + 'access_token=' + data.access_token;
					
					var form = {
						openid: openId
					};
					request({method: 'POST', url: url, body: form, json: true}).then(function (response) {
						var _data = response.body;
						
						if (_data) {
							resolve(_data);
						}else {
							throw new Error('Check group fails');
						}
					})
					.catch(function (err) {
						reject(err);
					});
				});
		});
		
	};
//更新分组
	Wechat.prototype.updateGroup = function (id, name) {
		   var that = this;
		
		  return new Promise(function (resolve, reject) {
			that
				.fetchAccessToken()
				.then(function (data) {
					var url = api.group.update + 'access_token=' + data.access_token;
					
					var form = {
						group: {
							id: id,
							name: name
						}
					};
					request({method: 'POST', url: url, body: form, json: true}).then(function (response) {
						var _data = response.body;
						
						if (_data) {
							resolve(_data);
						}else {
							throw new Error('Update group fails');
						}
					})
					.catch(function (err) {
						reject(err);
					});
				});
		});
		
	};


//批量移动
	Wechat.prototype.moveGroup = function (openIds, to) {
		   var that = this;
		
		  return new Promise(function (resolve, reject) {
			that
				.fetchAccessToken()
				.then(function (data) {
					var url;
					var form = {
						to_groupid: to
					};
					if (_.isArray(openIds)) {

						url = api.group.batchupdate + 'access_token=' + data.access_token;
						form.openid_list = openIds;
					}else {
						url = url = api.group.move + 'access_token=' + data.access_token;
						form.openid = openIds;
					}
					
					request({method: 'POST', url: url, body: form, json: true}).then(function (response) {
						var _data = response.body;
						
						if (_data) {
							resolve(_data);
						}else {
							throw new Error('move group fails');
						}
					})
					.catch(function (err) {
						reject(err);
					});
				});
		});
		
	};
//删除分组
	Wechat.prototype.deleteGroup = function (id) {
		   var that = this;
		
		  return new Promise(function (resolve, reject) {
			that
				.fetchAccessToken()
				.then(function (data) {
					var url = api.group.del + 'access_token=' + data.access_token;
					var form = {
						group: {
							id: id
						}
					};
					
					request({method: 'POST', url: url, body: form, json: true}).then(function (response) {
						var _data = response.body;
						
						if (_data) {
							resolve(_data);
						}else {
							throw new Error('Delete group fails');
						}
					})
					.catch(function (err) {
						reject(err);
					});
				});
		});
		
	};
//备注用户
	Wechat.prototype.remarkUser = function (openId, remark) {
		   var that = this;
		
		  return new Promise(function (resolve, reject) {
			that
				.fetchAccessToken()
				.then(function (data) {
					var url = api.user.remark + 'access_token=' + data.access_token;
					var form = {
						openid: openId,
						remark: remark
					};
					
					request({method: 'POST', url: url, body: form, json: true}).then(function (response) {
						var _data = response.body;
						
						if (_data) {
							resolve(_data);
						}else {
							throw new Error('Remark user fails');
						}
					})
					.catch(function (err) {
						reject(err);
					});
				});
		});
		
	};
//批量获取用户基本信息
	Wechat.prototype.fetchUser = function (openIds, lang) {
		   var that = this;
			lang = lang || 'zh_CN';
		  return new Promise(function (resolve, reject) {
			that
				.fetchAccessToken()
				.then(function (data) {

					var options = {
						json: true
					};
					if (_.isArray(openIds)) {//lodash的方法

						options.url = api.user.batchFetch + 'access_token=' + data.access_token;
						options.body = {
							user_list: openIds
						};
						options.method = 'POST';
					}else {
						options.url = api.user.fetch + 'access_token=' + data.access_token + '&openid=' + openIds + '&lang=' + lang;
					}
					
					request(options).then(function (response) {
						var _data = response.body;
						
						if (_data) {
							resolve(_data);
						}else {
							throw new Error('fetch user fails');
						}
					})
					.catch(function (err) {
						reject(err);
					});
				});
		});
		
	};

	Wechat.prototype.listUser = function (nextOpenId) {
		   var that = this;
		
		  return new Promise(function (resolve, reject) {
			that
				.fetchAccessToken()
				.then(function (data) {
					var url = api.user.list + 'access_token=' + data.access_token;
					if (nextOpenId) {
						url += '&next_openid=' + nextOpenId;
					}
					
					request({method: 'GET', url: url, json: true}).then(function (response) {
						var _data = response.body;
						
						if (_data) {
							resolve(_data);
						}else {
							throw new Error('List user fails');
						}
					})
					.catch(function (err) {
						reject(err);
					});
				});
		});
		
	};
//分组发送消息
	Wechat.prototype.sendByGroup = function (type, message, groupId) {
		   var that = this;

		   var msg = {
		   	filter:{},
		   	msgtype: type
		   };
			msg[type] = message;

		   if (!groupId) {
		   	msg.filter.is_to_all = true;
		   }else {
		   	msg.filter = {
		   		is_to_all: false,
		   		group_id: groupId
		   	};
		   }
		  return new Promise(function (resolve, reject) {
			that
				.fetchAccessToken()
				.then(function (data) {
					var url = api.mass.byGroup + 'access_token=' + data.access_token;
					
					request({method: 'POST', url: url, body: msg, json: true}).then(function (response) {
						var _data = response.body;
						
						if (_data) {
							resolve(_data);
						}else {
							throw new Error('Send by group fails');
						}
					})
					.catch(function (err) {
						reject(err);
					});
				});
		});
		
	};
//通过id发送
	Wechat.prototype.sendByOpenId = function (type, message, openIds) {
		   var that = this;

		   var msg = {
		   	msgtype: type,
		   	touser: openIds
		   };
			msg[type] = message;

		  return new Promise(function (resolve, reject) {
			that
				.fetchAccessToken()
				.then(function (data) {
					var url = api.mass.openId + 'access_token=' + data.access_token;
					
					request({method: 'POST', url: url, body: msg, json: true}).then(function (response) {
						var _data = response.body;
						
						if (_data) {
							resolve(_data);
						}else {
							throw new Error('Send by openid fails');
						}
					})
					.catch(function (err) {
						reject(err);
					});
				});
		});
		
	};
//删除群发
	Wechat.prototype.deleteMass = function (msgId) {
		   var that = this;

		  return new Promise(function (resolve, reject) {
			that
				.fetchAccessToken()
				.then(function (data) {
					var url = api.mass.del + 'access_token=' + data.access_token;
					
					var form = {
						msg_id: msgId
					};

					request({method: 'POST', url: url, body: form, json: true}).then(function (response) {
						var _data = response.body;
						
						if (_data) {
							resolve(_data);
						}else {
							throw new Error('Delete mass fails');
						}
					})
					.catch(function (err) {
						reject(err);
					});
				});
		});
		
	};
//预览群发
	Wechat.prototype.previewMass = function (type, message, openId) {
		   var that = this;

		   var msg = {
		   	msgtype: type,
		   	touser: openId
		   };
			msg[type] = message;

		  return new Promise(function (resolve, reject) {
			that
				.fetchAccessToken()
				.then(function (data) {
					var url = api.mass.preview + 'access_token=' + data.access_token;
					
					request({method: 'POST', url: url, body: msg, json: true}).then(function (response) {
						var _data = response.body;
						
						if (_data) {
							resolve(_data);
						}else {
							throw new Error('Preview mass fails');
						}
					})
					.catch(function (err) {
						reject(err);
					});
				});
		});
		
	};
//检查群发状态
	Wechat.prototype.checkMass = function (msgId) {
		   var that = this;

		   

		  return new Promise(function (resolve, reject) {
			that
				.fetchAccessToken()
				.then(function (data) {
					var url = api.mass.check + 'access_token=' + data.access_token;
					var form = {
					   	msg_id: msgId
					};

					request({method: 'POST', url: url, body: form, json: true}).then(function (response) {
						var _data = response.body;
						
						if (_data) {
							resolve(_data);
						}else {
							throw new Error('Check mass fails');
						}
					})
					.catch(function (err) {
						reject(err);
					});
				});
		});
		
	};
//创建菜单
	Wechat.prototype.createMenu = function (menu) {
		   var that = this;

		  return new Promise(function (resolve, reject) {
			that
				.fetchAccessToken()
				.then(function (data) {
					var url = api.menu.create + 'access_token=' + data.access_token;

					request({method: 'POST', url: url, body: menu, json: true}).then(function (response) {
						var _data = response.body;
						
						if (_data) {
							resolve(_data);
						}else {
							throw new Error('Create menu fails');
						}
					})
					.catch(function (err) {
						reject(err);
					});
				});
		});
		
	};
//获取菜单
	Wechat.prototype.getMenu = function (menu) {
		   var that = this;

		  return new Promise(function (resolve, reject) {
			that
				.fetchAccessToken()
				.then(function (data) {
					var url = api.menu.get + 'access_token=' + data.access_token;

					request({url: url, json: true}).then(function (response) {
						var _data = response.body;
						
						if (_data) {
							resolve(_data);
						}else {
							throw new Error('Get menu fails');
						}
					})
					.catch(function (err) {
						reject(err);
					});
				});
		});
		
	};
//删除菜单
	Wechat.prototype.deleteMenu = function () {
		   var that = this;

		  return new Promise(function (resolve, reject) {
			that
				.fetchAccessToken()
				.then(function (data) {
					var url = api.menu.del + 'access_token=' + data.access_token;

					request({url: url, json: true}).then(function (response) {
						var _data = response.body;
						
						if (_data) {
							resolve(_data);
						}else {
							throw new Error('Delete menu fails');
						}
					})
					.catch(function (err) {
						reject(err);
					});
				});
		});
		
	};
//自定义菜单
	Wechat.prototype.getCurrentMenu = function () {
		   var that = this;

		  return new Promise(function (resolve, reject) {
			that
				.fetchAccessToken()
				.then(function (data) {
					var url = api.menu.current + 'access_token=' + data.access_token;

					request({url: url, json: true}).then(function (response) {
						var _data = response.body;
						
						if (_data) {
							resolve(_data);
						}else {
							throw new Error('Get current menu fails');
						}
					})
					.catch(function (err) {
						reject(err);
					});
				});
		});
		
	};
//创建二维码
	Wechat.prototype.createQrcode = function (qr) {
		   var that = this;

		  return new Promise(function (resolve, reject) {
			that
				.fetchAccessToken()
				.then(function (data) {
					var url = api.qr.create + 'access_token=' + data.access_token;

					request({method: 'POST', url: url, body: qr, json: true}).then(function (response) {
						var _data = response.body;
						
						if (_data) {
							resolve(_data);
						}else {
							throw new Error('Create qrfails');
						}
					})
					.catch(function (err) {
						reject(err);
					});
				});
		});
		
	};
//显示二维码
	Wechat.prototype.showQrcode = function (ticket) {
		return api.qrcode.show + 'ticket=' + encodeURI(ticket);
	};
//长链接转换为短链接
	Wechat.prototype.createShortUrl = function (action, url) {
		   action = action || 'long2short';

		   var that = this;

		  return new Promise(function (resolve, reject) {
			that
				.fetchAccessToken()
				.then(function (data) {
					var url = api.shortUrl.create + 'access_token=' + data.access_token;

					var form = {
						action: action,
						long_url: url
					};

					request({method: 'POST', url: url, body: form, json: true}).then(function (response) {
						var _data = response.body;
						
						if (_data) {
							resolve(_data);
						}else {
							throw new Error('Create shortUrl fails');
						}
					})
					.catch(function (err) {
						reject(err);
					});
				});
		});
		
	};
//只能语音接口
	Wechat.prototype.semantic = function (semanticData) {

		   var that = this;

		  return new Promise(function (resolve, reject) {
			that
				.fetchAccessToken()
				.then(function (data) {
					var url = api.semanticUrl + 'access_token=' + data.access_token;

					semanticData.appid = semanticData.appID;

					request({method: 'POST', url: url, body: semanticData, json: true}).then(function (response) {
						var _data = response.body;
						
						if (_data) {
							resolve(_data);
						}else {
							throw new Error('Sematic fails');
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
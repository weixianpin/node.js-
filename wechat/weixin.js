// 'use strict';

var config = require('./config.js');
var Wechat = require('./wechat/wechat.js');
var menu = require('./weixin/menu.js');
var wechatApi= new Wechat(config.weChat);

wechatApi.deleteMenu().then(function () {
	return wechatApi.createMenu(menu);
})
.then(function (msg) {
	console.log(msg);
});

exports.reply = function*(next) {
	var message = this.weixin;

	if (message.MsgType === 'event') {
		if (message.Event === 'subscribe') {
			if (message.EventKey) {
				console.log('扫描二维码进来' + message.EventKey +' '+ message.Ticket);
			}
			
			this.body = '谢谢长得好的你订阅了这个号';
		}
		else if (message.Event === 'unsubscribe') {
		
			console.log('无情取关');
			this.body = '';
		}
		else if (message.Event === 'LOCATION') {
			this.body = '您上报的位置是：' + message.Latitude + '' + message.Longitude + '-' + message.Precision;
		}
		else if (message.Event === 'CLICK') {
			this.body = '您点击了菜单' + message.EventKey;
		}
		else if (message.Event === 'SCAN') {
			console.log('关注后扫描二维码' + message.EventKey + message.Ticket);
			this.body = '看到后，请关注';
		}
		else if (message.Event === 'VIEW') {
			this.body = '您点击了菜单中的链接' + message.EventKey;
		}
		else if (message.Event === 'scancode_push') {
			console.log(message.ScanCodeInfo.ScanType);
			console.log(message.ScanCodeInfo.ScanResult);
			this.body = '您点击了菜单中的链接' + message.EventKey;
		}
		else if (message.Event === 'scancode_waitmsg') {
			console.log(message.ScanCodeInfo.ScanType);
			console.log(message.ScanCodeInfo.ScanResult);
			this.body = '您点击了菜单中的链接' + message.EventKey;
		}
		else if (message.Event === 'pic_sysphoto') {
			console.log(message.SendPicInfo.PicList);
			console.log(message.SendPicInfo.Count);
			this.body = '您点击了菜单中的链接' + message.EventKey;
		}
		else if (message.Event === 'pic_photo_or_album') {
			console.log(message.SendPicInfo.PicList);
			console.log(message.SendPicInfo.Count);
			this.body = '您点击了菜单中的链接' + message.EventKey;
		}
		else if (message.Event === 'pic_weixin') {
			console.log(message.SendPicInfo.PicList);
			console.log(message.SendPicInfo.Count);
			this.body = '您点击了菜单中的链接' + message.EventKey;
		}
		else if (message.Event === 'location_select') {
			console.log(message.SendLocationInfo.Location_X);
			console.log(message.SendLocationInfo.Location_Y);
			console.log(message.SendLocationInfo.Location_Scale);
			console.log(message.SendLocationInfo.Location_Label);
			console.log(message.SendLocationInfo.Location_Poiname);
			this.body = '您点击了菜单中的链接' + message.EventKey;
		}
	}
	
	else if (message.MsgType === 'text') {
		var content = message.Content;
		var reply = '你说的' + message.Content + '太复杂了，我无法回复';

		if (content === '1') {
			reply = '李会娟真好看';
		}
		else if (content === '2') {
			reply = '李会娟真漂亮';
		}
		else if (content === '3') {
			reply = '李会娟真美丽';
		}
		else if (content === '4') {
			reply = [{
						title: '一个大美女',
						description: '你好，我叫李会娟，有点可爱，有时候也会犯2',
						picUrl: 'http://otwll2i2i.bkt.clouddn.com/littleGirl1.JPG',
						url: 'https://github.com/'
				},
				{
					title: '还是一个大美女',
					description: '这只是一个描述',
					picUrl: 'http://otwll2i2i.bkt.clouddn.com/littleGirl2.JPG',
					url: 'https://nodejs.org/'
			}];
		}
		else if (content === '5') {
			var data = yield wechatApi.uploadMaterial('image', __dirname + '/2.jpg');
			reply = {
				type: 'image',
				mediaId: data.media_id
			};
			console.log(reply);
		}//上传永久素材
		else if (content === '6') {
			var data = yield wechatApi.uploadMaterial('image', __dirname +'/2.jpg', {type: 'image'});
			reply = {
				type: 'image',
				mediaId: data.media_id
			};
			console.log(reply);
		}
		else if (content === '7') {
			var picData = yield wechatApi.uploadMaterial('image', __dirname + '/2.jpg', {});
			var media = {
					articles: [{
					title: '没有标题',
					thumb_media_id: picData.media_id,
					author: '没有作者',
					digest: '没有摘要',
					show_cover_pic: 1,
					content: '没有内容',
					content_source_url: 'https://github.com'//阅读全文地址
				}]
			};
			data = yield wechatApi.uploadMaterial('news', media, {});
			data = yield wechatApi.fetchMaterial(data.media_id, 'news', {});

			console.log(data);

			var items = data.news_item;
			var news = [];

			items.forEach(function (item) {
				news.push({
					title: item.title,
					description: item.digest,
					picUrl: picData.url,
					url: item.url
				});
			});
			reply = news;
		}
		else if (content === '8') {
			var counts = yield wechatApi.countMaterial();
			console.log(JSON.stringify(counts));

			var results = yield [
				wechatApi.batchMaterial({
								type: 'image',
								offset: 0,
								count: 10
							}),
				wechatApi.batchMaterial({
								type: 'voice',
								offset: 0,
								count: 10
							}),
				wechatApi.batchMaterial({
								type: 'video',
								offset: 0,
								count: 10
							}),
				wechatApi.batchMaterial({
								type: 'news',
								offset: 0,
								count: 10
							})
			];
			console.log(JSON.stringify(results));
			reply = '1';
		}
		else if (content === '9') {
			var group = yield wechatApi.createGroup('wechat');

			console.log('新分组 wechat');
			console.log(group);

			var groups = yield wechatApi.fetchGroup();

			console.log('加了 wechat 后的分组列表');
			console.log(groups);

			var group2 = yield wechatApi.checkGroup(message.FromUserName);

			console.log('查看自己的分组');
			console.log(group2);


			reply = 'group done!';
		}
		else if (content === '10') {
			var user = yield wechatApi.fetchUser(message.FromUserName, 'en');
			console.log(user);
			var openIds = [
				{
					openid: message.FromUserName,
					lang: 'en'
				}
			];
			var users = yield wechatApi.fetchUser(openIds);
			console.log(users);
			reply = JSON.stringify(user);
		}
		else if (content ==='用户') {
			var userList = yield wechatApi.listUser();
			console.log(userList);
			reply = '已经有' + userList.total + '位用户关注您拉';
		}
		else if (content === '11') {
			var mpnews = {
				media_id: 'fFQ4fRTYf_uVLDCh6nvsH_DpNCkwmMNIDGW6UnTNo38'
			};
			var msgData = yield wechatApi.sendByGroup('mpnews', mpnews, 101);
			console.log(msgData);
			reply = '发送成功';
		}
		else if (content === '12') {
			var mpnews = {
				media_id: 'fFQ4fRTYf_uVLDCh6nvsH_DpNCkwmMNIDGW6UnTNo38'
			};
			// var text = {
			// 	'content': 'Hellow, World!'
			// };
			var msgData1 = yield wechatApi.previewMass('mpnews', mpnews, 'om0qRxAcS2Lugl36lrX5UnLtCgXg');
			console.log(msgData1);
			reply = '发送成功';
		}
		else if (content === '13') {
			
			var msgData2 = yield wechatApi.checkMass('6462108670469940241');
			console.log(msgData2);
			reply = '发送成功';
		}


		this.body = reply;
	}
	yield next;
};
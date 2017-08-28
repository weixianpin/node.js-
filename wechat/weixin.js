'use strict';

exports.reply = function *(next) {
	var message = this.weixin;

	if (message.MsgType === 'event') {
		if (message.Event === 'subscribe') {
			if (message.EventKey) {
				console.log('扫描二维码进来' + message.EventKey + message.Ticket);
			}
			this.body = '谢谢您订阅了这个号';
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
	}
	else if (message.MsgType === 'text') {
		var content = message.Content;
		var reply = '你说的' + message.Content + '太复杂了';

		if (content === '1') {
			reply = '李会娟真好看';
		}
		else if (content === '2') {
			reply = '李会娟真漂亮';
		}
		else if (content ==='3') {
			reply = '李会娟真美丽';
		}
		else if (content === '4') {
			reply = [{
					title: '技术改变世界',
					description: '这只是一个描述',
					picUrl: 'http://res.cloudinary.com/moveha/image/upload/v1441184110/assets/images/Mask-min.png',
					url: 'https://github.com'
				},
				{
					title: 'node.js开发微信',
					description: '这只是一个描述',
					picUrl: 'http://res.cloudinary.com/moveha/image/upload/v1431337192/index-img2_fvzeow.png',
					url: 'https://nodejs.org'
			}];
		}
		this.body = reply;
	}
	yield next;
};
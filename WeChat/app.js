// 'use strict';
// 入口文件
var Koa = require('koa');
var path = require('path');
var crypto = require('crypto');
var ejs = require('ejs');
var heredoc = require('heredoc');
// var sha1 = require('sha1');
var wechat = require('./wechat/generator.js');
var util = require('./libs/util.js');
var config = require('./config.js');
var weixin = require('./weixin.js');
var Wechat = require('./wechat/wechat.js');

var wechat_file = path.join(__dirname,'./config/wechat.txt');



//实例化koaweb服务器
/*为什么用koa而不用express，因为这种多异步的程序更适合用koa，
而且koa的代码更加简单*/
var app = new Koa();

var tpl = heredoc(function () {/*
	<!DOCTYPE html>
	<html>
		<head>
			<title>搜索电影</title>
			<meta name="viewport" content="initial-scale=1, maximum-scale=1, minimum-scale=1" />
		</head>
		<body>
			<h1>点我开始语音搜索电影</h1>
			<p id="title"></p>
			<div id="director"></div>
			<div id="year"></div>
			<div id="poster"></div>
			<script src="http://zeptojs.com/zepto-docs.min.js"></script>
			<script src="http://res.wx.qq.com/open/js/jweixin-1.0.0.js">
			</script>
			<script>
				wx.config({
				    debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
				    appId: 'wx28d1909da0d656f6', // 必填，公众号的唯一标识
				    timestamp: '<%= timestamp %>', // 必填，生成签名的时间戳
				    nonceStr: '<%= noncestr %>', // 必填，生成签名的随机串
				    signature: '<%= signature %>',// 必填，签名，见附录1
				    jsApiList: [
					    'onMenuShareTimeLine',
					    'onMenuShareAppMessage',
					    'onMenuShareQQ',
					    'onMenuShareWwiBo',
					    'onMenuShareQZone',
					    'previewImage',
						'startRecord',
						'stopRecord',
						'onVoiceRecordEnd', 
						'translateVoice'
				    ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
				});

				wx.ready(function(){

				    wx.checkJsApi({
				        jsApiList: ['onVoiceRecordEnd'],
				        success: function(res) {
				        	console.log(res);
				        }
				    });
//分享给朋友
					var shareContent = {
						title: '分享电影',
						desc: '12345', 
						link: 'https://github.com/', 
						imgUrl: 'https://ss2.baidu.com/-vo3dSag_xI4khGko9WTAnF6hhy/image/h%3D220/sign=eb93d20122381f3081198aab99004c67/242dd42a2834349b76878ebcc3ea15ce36d3be02.jpg',
						success: function () { 
						    window.alert('分享成功')
						},
						cancel: function () { 
						    window.alert('分享失败')
						}
					}

					wx.onMenuShareAppMessage(shareContent);
					var slides
					var isRecording = false;

					$('#poster').on('tap', function () {
						wx.previewImage(slides);
					});

				    $('h1').on('tap', function () {
				    	if(!isRecording) {
				    		isRecording = true;
					    	wx.startRecord({
							  cancel: function () {
								window.alert('那就无法搜索电影了');
							  }
							});
							return;
				    	}
						isRecording = false;

						wx.stopRecord({
						    success: function (res) {
						        var localId = res.localId;

						        wx.translateVoice({
						           localId: localId, 
						           isShowProgressTips: 1, 
						           success: function (res) {
						            	var result = res.translateResult;
						                $.ajax ({
										  type: 'GET',
										  url: 'https://api.douban.com/v2/movie/search?q=' + result,
										  dataType: 'jsonp',
										  jsonp: 'callback',
										  success: function (data) {
											console.log(data);
											var subject = data.subjects[0];
											console.log(subject);
											$('#title').html('电影名称：'+subject.title)

											$('#year').html('年份：'+subject.year)

											$('#director').html('导演：'+subject.directors[0].name)

											$('#poster').html('<img src="'+ subject.images.large + '" />')

											shareContent = {
											  title: subject.title, 
											  desc: '我搜出来了'+subject.title, 
											  link: 'https://github.com', 
											  imgUrl: subject.images.large,
											  success: function () { 
											    window.alert('分享成功')
											  },
											  cancel: function () { 
											    window.alert('分享失败')
											  }
											}

											slides = {
											  current: subject.images.large,
											  urls: [subject.images.large],
											}
											data.subjects.forEach(function(item) {
											  slides.urls.push(item.images.large)
											})

											
											wx.onMenuShareAppMessage(shareContent);

										  }
						                }) 
						            }
						        });
						    }
						});
				    });
				});
			</script>
		</body>
	</html>
*/});
//随机数
var createNonce = function () {
	return Math.random().toString(36).substr(2, 15);
};
//时间戳
var createTimestamp = function () {
	return parseInt(new Date().getTime() / 1000, 10) + '';
};

var _sign = function (noncestr, ticket, timestamp, url) {
	var params = [
		'noncestr=' + noncestr,
		'jsapi_ticket=' + ticket,
		'timestamp=' + timestamp,
		'url=' + url
	];
	var str = params.sort().join('&');
	var shasum = crypto.createHash('sha1');//crypto加密库

	shasum.update(str);
	return shasum.digest('hex');
};

//签名算法signature
function sign (ticket, url) {
	var noncestr = createNonce();
	var timestamp = createTimestamp();
	var signature = _sign(noncestr, ticket, timestamp, url);
	console.log(ticket);
	console.log(url);
	return {
		noncestr: noncestr,
		timestamp: timestamp,
		signature: signature
	};
}

app.use(function*(next) {
	if (this.url.indexOf('/movie') > -1) {
		var wechatApi = new Wechat(config.weChat);
		var data = yield wechatApi.fetchAccessToken();
		var access_token = data.access_token;
		var ticketData = yield wechatApi.fetchTicket(access_token);
		var ticket = ticketData.ticket;
		var url = this.href;//.replace(':8000', '')
		var params = sign(ticket, url);
		console.log(params);
		this.body = ejs.render(tpl, params);//将数据传入html页面内
		return next;
	}
	yield next;

});

app.use(wechat(config.weChat, weixin.reply));
app.listen(1234);
console.log('Listenning: 1234');
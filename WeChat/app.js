// 'use strict';
// 入口文件
var Koa = require('koa');
var path = require('path');
var crypto = require('crypto');
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
var ejs = require('ejs');
var heredoc = require('heredoc');

var tpl = heredoc(function () {/*
	<!DOCTYPE html>
	<html>
		<head>
			<title>猜电影</title>
			<meta name="viewport" content="initial-scal=1, maximum-scale=1, minimum-scale=1" />
		</head>
		<body>
			<h1>点击标题，开始录音翻译</h1>
			<p id="title"></p>
			<div id="poster"></div>
			<script src="http://zeptojs.com/zepto-docs.min.js"></script>
			<script src="http://res.wx.qq.com/open/js/jweixin-1.2.0.js">
			</script>
			<script>
				wx.config({
				    debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
				    appId: 'wx28d1909da0d656f6', // 必填，公众号的唯一标识
				    timestamp: '<%= timestamp %>', // 必填，生成签名的时间戳
				    nonceStr: '<%= noncestr %>', // 必填，生成签名的随机串
				    signature: '<%= signature %>',// 必填，签名，见附录1
				    jsApiList: [
						'startRecord'
						'stopRecord'
						'onVoiceRcordEnd'
						'translateVoice'
				    ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
				});
			</script>
		</body>
	</html>
*/});
//随机数
var createNonce = function () {
	return Math.random().toString(36).subStr(2, 15);
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

	return {
		noncestr: noncestr,
		timestamp: timestamp,
		signature: signature
	};
}

app.use(function*(next) {
	if (this.url.indexOf('/movie') > -1) {
		var wechatApi = Wechat(config.weChat);
		var data = wechatApi.fetchAccessToken();
		var access_token = data.access_token;
		var ticketData = wechatApi.fetchTicket(access_token);
		var ticket = data.ticket;
		var url = this.href;
		var params = sign(ticket, url);

		this.body = ejs.render(tpl, params);//将数据传入html页面内
		return next;
	}
	yield next;

});

app.use(wechat(config.weChat, weixin.reply));
app.listen(1234);
console.log('Listenning: 1234');
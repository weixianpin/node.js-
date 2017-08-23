	var sha1 = require('sha1');
	var getRawBody = require('raw-body');

	var Wechat = require('./wechat.js');
	var util = require('./util.js');
	
//实例化koaweb服务器
/*为什么用koa而不用express，因为这种多异步的程序更适合用koa，
而且koa的代码更加简单*/
	module.exports = function (opts) {
		// var wechat = new Wechat(opts);
		return function *(next){//生成期函数--generator function
					// console.log(this.query);
				//获取一系列所需要的参数
					var that = this;
					var token = opts.token;
					var signature = this.query.signature;
					var nonce = this.query.nonce;
					var echostr = this.query.echostr;
					var timestamp = this.query.timestamp;
				//对三个参数进行字典排序
					var str = [token, nonce, timestamp].sort().join('');
					var sha = sha1(str);//对排序后的参数加密
					if (this.method === 'GET') {
						if (sha === signature) {
							this.body = echostr + '';
						}else {
								this.boyd = 'wrong';
						}
					}
					else if (this.method === 'POST') {
						if (sha !== signature) {
							this.body = 'wrong';
							return false;
						}
				//拿到post请求的原始xml数据
						var data = yield getRawBody(this.req, {
							length: this.length,
							limit: '1mb',
							encoding: this.charset
						});
						// console.log(data.toString());
						//将原始数据传递给XML，解析后返回给content
						var content = yield util.parseXMLAsync(data);
						console.log(content);

						var message = util.formatMessage(content.xml);
						console.log(message);

						if (message.MsgType === 'event') {
							if (message.Event === 'subscribe') {
								var now = new Date().getTime();
								that.status = 200;
								that.type = 'application/xml';
								that.body = '<xml>' +
								'<ToUserName><![CDATA['+ message.FromUserName+']]></ToUserName>' +
								'<FromUserName><![CDATA['+ message.ToUserName+']]></FromUserName>' +
								'<CreateTime>'+ now +'</CreateTime>' +
								'<MsgType><![CDATA[text]]></MsgType>' +
								'<Content><![CDATA[美少女,你好]]></Content>' +
								'</xml>';
								return;
							}
						}
					}
				};
	};

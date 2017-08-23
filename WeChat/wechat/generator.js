	var sha1 = require('sha1');
	var prefix = 'https://api.weixin.qq.com/cgi-bin/';
	var api = {
		accessToken: prefix+ 'token?grant_type=client_credential'
	};
	function Wechat (opts) {
		var that = this;
		this.appID = opts.appID;
		this.appSecret = opts.appSecret;
	//获取票据,accesstoken是客户端与微信交互的的唯一票据(钥匙)
		this.getAccessToken = opts.getAccessToken;
		this.saveAccessToken = opts.saveAccessToken;

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
					Promise.resolve(data);
				}else{
					return that.updateAccessToken();
				}
			})
			.then(function (data) {
				that.access_token = data.access_token;//将票据挂到data实例
				that.expires_in = data.expires_in;//票据过期字段
				that.saveAccessToken(data);
			});
	}
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
		var url = api.accessToken + '&appid=' + addID + '&secret=' + appSecret;
		request({url: url, json: true}).then(function (response) {
			var data = response[1];
			var time = (new Date().getTime());
		//服务器计算需要时间，提前20s刷新
			var expires_in = time + (data.expires_in - 20)*1000;
		});
	};
//实例化koaweb服务器
/*为什么用koa而不用express，因为这种多异步的程序更适合用koa，
而且koa的代码更加简单*/
	module.exports = function (opts) {
		return function *(next){//生成期函数--generator function
					console.log(this.query);
				//获取一系列所需要的参数
					var token = opts.token;
					var signature = this.query.signature;
					var nonce = this.query.nonce;
					var echostr = this.query.echostr;
					var timestamp = this.query.timestamp;
				//对三个参数进行字典排序
					var str = [token, nonce, timestamp].sort().join('');
					var sha = sha1(str);//对排序后的参数加密
					if (sha === signature) {
						this.body = echostr + '';
					}else {
						this.boyd = 'wrong';
					}
				};
	};

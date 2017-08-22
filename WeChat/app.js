// 入口文件
var Koa = require('koa');
var sha1 = require('sha1');
var config = {
		weChat: {
				appID: 'wx28d1909da0d656f6',
				appSecret: 'c4095132ccf2e2486eb95a88c40ff6a8',
				token: 'c11203cafb4265ff'
		}
};
//实例化koaweb服务器
/*为什么用koa而不用express，因为这种多异步的程序更适合用koa，
而且koa的代码更加简单*/
var app = new Koa();
app.use(function *(next){//生成期函数--generator function
	console.log(this.query);
//获取一系列所需要的参数
	var token = config.weChat.token;
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
});
app.listen(1234);
console.log('Listenning: 1234');
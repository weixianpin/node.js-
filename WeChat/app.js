// 入口文件
var Koa = require('koa');
// var sha1 = require('sha1');
var wechat = require('./wechat/generator.js');
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
app.use(wechat(config.weChat));
app.listen(1234);
console.log('Listenning: 1234');
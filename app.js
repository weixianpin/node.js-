// 入口文件
var Koa = require('koa');
var sha1 = require('sha1');
var congif = {
		weChat: {
				appID: 'wx28d1909da0d656f6',
				appSecret: 'c4095132ccf2e2486eb95a88c40ff6a8',
				token: 'weixianpinsitumingyue'
		}
};
//实例化koaweb服务器
/*为什么用koa而不用express，因为这种多异步的程序更适合用koa，
而且koa的代码更加简单*/
var app = new Koa();
app.use(function *(next){//生成期函数--generation function
	console.log(this.query);
});
app.listen(1234);
console.log('Listenning: 1234');
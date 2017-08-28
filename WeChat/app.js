// 入口文件
var Koa = require('koa');
var path = require('path');
// var sha1 = require('sha1');
var wechat = require('./wechat/generator.js');
var util = require('./libs/util.js');
var wechat_file = path.join(__dirname,'./config/wechat.txt');
var config = require('./config.js');


//实例化koaweb服务器
/*为什么用koa而不用express，因为这种多异步的程序更适合用koa，
而且koa的代码更加简单*/
var app = new Koa();
app.use(wechat(config.weChat, weixin.reply));
app.listen(1234);
console.log('Listenning: 1234');
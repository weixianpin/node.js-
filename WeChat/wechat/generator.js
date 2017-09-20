	// 'use strict';

	var sha1 = require('sha1');
	var getRawBody = require('raw-body');

	var Wechat = require('./wechat.js');
	var util = require('./util.js');
	
//实例化koaweb服务器
/*为什么用koa而不用express，因为这种多异步的程序更适合用koa，
而且koa的代码更加简单*/
	

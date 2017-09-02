// 'use strict';

var ejs = require('ejs');
var heredoc = require('heredoc');

var tpl = heredoc(function () {
	/*
	<xml>
		<ToUserName><![CDATA[<%= toUserName %>]]></ToUserName>
		<FromUserName><![CDATA[<%= fromUserName %>]]></FromUserName>
		<CreateTime><%= createTime %></CreateTime>
		<MsgType><![CDATA[<%= msgType %>]]></MsgType>
		<% if (msgType === 'text') { %>
			<Content><![CDATA[<%= content %>]]></Content>
		<% } else if (msgType === 'image') { %>
			<Image>
				<<MediaId><![CDATA[<%= content.mediaId %>]]></MediaId>>
			</Image>
		<% } else if (msgType === 'voice') { %>
			<Voice>
			<MediaId><![CDATA[<%= content.mediaId %>]]></MediaId>
			</Voice>
		<% } else if (msgType === 'video') { %>
			<Video>
				<MediaId><![CDATA[<%= content.mediaId %>]]></MediaId>
				<Title><![CDATA[<%= content.title %>]]></Title>
				<Description><![CDATA[<%= content.description %>]]>
				</Description>
			</Video>
		
	
*/});

var compiled = ejs.compile(tpl);
exports = module.exports = {
	compiled: compiled
};
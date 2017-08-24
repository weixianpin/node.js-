'use stric';

var ejs = require('ejs');
var heredoc = require('heredoc');

var tpl = heredoc(function () {
	/**
	<xml>
		<ToUserName><![CDATA[<% toUserName %>]]></ToUserName>
		<FromUserName><![CDATA[<% fromUserName %>]]></FromUserName>
		<CreateTime><% createTime %></CreateTime>
		<MsgType><![CDATA[<% msgType %>]]></MsgType>
		<% if (msgType === 'text') { %>
			<Content><![CDATA[<% content %>]]></Content>
		<% } else if (msgType === 'image' ) { %>
			<Image>
				<<MediaId><![CDATA[<% content.meida_id %>]]></MediaId>>
			</Image>
		<% } else if (msgType === 'voice' ) { %>

	</xml>;
	**/
});
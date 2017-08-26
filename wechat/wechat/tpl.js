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
			<Voice>
			<MediaId><![CDATA[<% content.meida_id %>]]></MediaId>
			</Voice>
		<% } else if (msgType === 'vedio' ) { %>
			<Video>
				<MediaId><![CDATA[<% content.meida_id %>]]></MediaId>
				<Title><![CDATA[<% content.title %>]]></Title>
				<Description><![CDATA[<% content.description %>]]>
				</Description>
			</Video>
		<% } else if (msgType === 'music' ) { %>
			<Music>
				<Title><![CDATA[<% content.title %>]]></Title>
				<Description><![CDATA[<% content.description %>]]>
				</Description>
				<MusicUrl><![CDATA[<% content.musicUrl %>]]></MusicUrl>
				<HQMusicUrl><![CDATA[<% content.hqMusicUrl %>]]>
				</HQMusicUrl>
				<ThumbMediaId><![CDATA[<% content.thumbMediaId %>]]></ThumbMediaId>
			</Music>
		<% } else if (msgType === 'music' ) { %>
			<ArticleCount><% content.length %></ArticleCount>
			<Articles>
			<% content.forEach(function (item) { %>
				<item>
					<Title><![CDATA[<% item.title %>]]></Title> 
					<Description><![CDATA[<% item.description %>]]>
					</Description>
					<PicUrl><![CDATA[<% item.picUrl %>]]></PicUrl>
					<Url><![CDATA[<% item.url %>]]></Url>
				</item>
			<% }) %>
			</Articles>
		<% } %>
	</xml>;
	**/
});

var compiled = ejs.compiled(tpl);
exports = module.exports = {
	compiled: compiled
}
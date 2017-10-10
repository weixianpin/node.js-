$(document).ready(function() {
	$('.del').click(function(e) {
		var target = $(this);
		var toId = target.data('tid');
		var commentId = target.data('cid');
		if ($('#toId').length > 0) {
			$('#toId').val(toId);
		}
		else {
			$('<input>').attr({
						type: 'hidden',
						id: 'toId',
						name: 'comment[tid]',
						value: toId
					}).appendTo('#commentForm');
		}
		if ($('commentId').length > 0) {
			$('#commentId').val(commentId);
		}
		else {
			$('<input>').attr({
						type: 'hidden',
						id: 'commentId',
						name: 'comment[cid]',
						value: commentId
					}).appendTo('#commentForm');
		}
/**
	$(function() {
		$('#button').click(function() {
			var div = $('div');
			div.animate({left: '300px', opacity: '0.5'}, 'slow')
			div.animate({top: '300px', opacity: '0.5'}, 'slow')
			div.animate({left: '0px', opacity: '0.7'}, 'slow')
			div.animate({top: '100px', opacity: '0.7'}, 'slow')
		})
	})
	$(function(){
		$('#button').click(function() {
			$('div').animate({left: '300px', opacity: '0.5'},slow);
			$('div').animate({top: '300px', opacity: '0.5'},slow);
			$('div').animate({left: '0', opacity: '0.7'},slow);
			$('div').animate({top: '100', opacity: '0.7'},slow);
		})
	})
	$(function(){
		$('#button').click(function() {
			$('.panel').sildeDown('3000');
			$('.stop').stop();
		})
	})
	$(document).ready(fucntion(){
		$('#button').click(function() {
			$('.panel').slideDown(3000);// 向下滑动
			$('.stop').stop(); // 停止向下滑动
		})
	})
	// 获取属性值
	$(function() {
		$('#link').click(function(){
			var a = $('a');
			a.preventDefault();// 阻止默认行为
			alert(a.attr('href'));
		})
	})
	$(function(){
		var text1 = '<p>这是text1<p>';
		var text2 = $('<p></p>').text('这是text2');
		var text3 = document.createElement('p').innerHTML('这是text3');
		$('body').append(text1, text2, text3);
	})
	$(function() {
		$('#button').click(function() {
			$('p, h2, h3').addClass('blue');
			$('h2').addClass('important');
		})
	})
	
	// 按索引号
	$(function() {
		$('p').eq(0).css('background-color', 'yellow'); // 索引为0的p标签，即第一个p标签与$('div p').first()相同
AB095,AA003,CB021,AD015,AD025,BA254,BX110,AG145,AF199,BS022,AV100,BK233,AP001,CA235,BC116
	})
**/
	});
});
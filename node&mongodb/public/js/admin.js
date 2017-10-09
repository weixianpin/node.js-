$(function() {
	$('.del').click(function(e) {
		var target = $(e.target);
		var id = target.data('id');
		var tr = $('.item-id-' + id);

		$.ajax({
			type: 'DELETE',
			url: '/admin/movie/list?id=' + id,

		})
		.done(function(results) {
			if(results.success === 1) {
				if(tr.length > 0) {
					tr.remove();
				}
			}
		});
	});

	$("#douban").blur(function() {
		var douban = $(this);
		var id = douban.val();
		if(id) {
			$.ajax({
				url: 'https://api.douban.com/v2/movie/object/' + id,
				cache: true,
				type: 'get',
				dataType: 'jsonp',
				crossDomin: true,
				jsonp: 'callback',
				success: function(data) {
					$("#inputTitle").val(data.title);
					$("#inputDirector").val(data.directors[0].name);
					$("#inputCountry").val(data.coutries[0]);
					$("#inputPoster").val(data.iamges.large);
					$("#inputYear").val(data.year);
					$("#inputSummary").val(data.summary);
				}
			});
		}
	});
});
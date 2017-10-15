$(function() {
  $('.comment').click(function(e) {
    var target = $(this)
    var toId = target.data('tid')
    var commentId = target.data('cid')

    if ($('#toId').length > 0) {
      $('#toId').val(toId)
    }
    
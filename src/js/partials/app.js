(function($) {
	$('.js-detail').click(function() {
		$.fancybox.open({
			src: 'request-form.html',
			type: 'ajax'
		});
	});
})(jQuery)
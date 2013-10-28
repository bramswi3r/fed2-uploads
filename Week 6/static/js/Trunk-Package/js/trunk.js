(function () {

	var content = document.getElementsByClassName('content')[0];
	var items1 = document.getElementsByClassName('slideRight')[0];  
	var items2 = document.getElementsByClassName('slideLeft')[0];

	var open = function() {
		items1.classList.remove('close');
		items1.classList.add('open');
		items2.classList.remove('close');
		items2.classList.add('open');
		content.classList.remove('close');
		content.classList.add('open');
	}
	var close = function() { 
		items1.classList.remove('open');
		items1.classList.add('close');
		items2.classList.remove('open');
		items2.classList.add('close');
		content.classList.remove('open');
		content.classList.add('close');
	}

	var navToggle = document.getElementById('navToggle');

	navToggle.addEventListener('click', function(){
		if (content.classList.contains('open')) {
			close();
		}
		else {
			open();
		}
	});

	content.addEventListener("click", function(){
		if (content.classList.contains('open')) {
			close();
		}
	});

})();

$( document ).ready(function() {

	$('body').on('click', '.scip-overlay-link', function(e){
		e.preventDefault();
		e.stopPropagation();
	});

	makeCorrectNavItemActive();

	function makeCorrectNavItemActive(){
		var url = window.location.pathname;
		var slugs = [];
		var urlParts = url.split('/');
		for(var slug in urlParts){
			var convertSlug = urlParts[slug].replace(/[_-]/g, " ");
			slugs.push(convertSlug);
		}		

		$('.header').find('a > span').each(function(){
			var t = $(this);
			var curText = t.text();
			if(findInArray(slugs,curText.toLowerCase())){
				t.addClass('ds-active');
			}else{
				t.removeClass('ds-active');
			}
		});
	}

	function findInArray(arr,obj) {
	    return (arr.indexOf(obj) != -1 && obj != '');
	}

	if($('.scip-case-studies').length > 0){
		var url = window.location.href;
		if(url.indexOf("#") != -1){
			var caseStudy = url.substring(url.indexOf("#")+1);
			openCaseStudy(caseStudy);
		}
	}

	$('body').on('click', '.scip-case-studies .ds-nav-item, .scip-case-studies .ds-option', function(e){
		e.preventDefault();
		e.stopPropagation();
		openCaseStudy($(this).attr('data-cs'));
		changeDropdownTitle($(this).text());
	});

	function openCaseStudy(toOpen){
		var somethingOpened = false;
		$('.scip-case-studies .ds-nav-item').each(function(){
			if($(this).attr('data-cs') == toOpen){
				$(this).addClass('ds-active');
				somethingOpened = true;
			}else{
				$(this).removeClass('ds-active');
			}
		});

		$('.scip-case-study').each(function(){
			$(this).addClass('ds-hide');
		});
		$('.'+toOpen).removeClass('ds-hide');

		if(!somethingOpened){
			var openFirst = $('.scip-case-studies .ds-nav-item').eq(0).attr('data-cs');
			openCaseStudy(openFirst);
		}
	}

	function changeDropdownTitle(title){
		$('.scip-case-studies .ds-title').text(title);
	}

}); //END OF DOC READY


var overlayElement = document.querySelector('.ds-overlay');
if(overlayElement){
	w3ds.overlay(overlayElement);
}

var dropdownElement = document.querySelector('.ds-dropdown');
if(dropdownElement){
	w3ds.dropdown(dropdownElement);
}

var setHeightElement = document.querySelectorAll('[class*="ds-set-height-"]');
if(setHeightElement){
	w3ds.setHeight(setHeightElement);
}

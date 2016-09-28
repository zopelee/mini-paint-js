//** Smooth Navigational Menu- By Dynamic Drive DHTML code library: http://www.dynamicdrive.com
//** Script Download/ instructions page: http://www.dynamicdrive.com/dynamicindex1/ddlevelsmenu/
//** Menu created: Nov 12, 2008

//** Dec 12th, 08" (v1.01): Fixed Shadow issue when multiple LIs within the same UL (level) contain sub menus: http://www.dynamicdrive.com/forums/showthread.php?t=39177&highlight=smooth

//** Feb 11th, 09" (v1.02): The currently active main menu item (LI A) now gets a CSS class of ".selected", including sub menu items.

//** May 1st, 09" (v1.3):
//** 1) Now supports vertical (side bar) menu mode- set "orientation" to 'v'
//** 2) In IE6, shadows are now always disabled

//** July 27th, 09" (v1.31): Fixed bug so shadows can be disabled if desired.
//** Feb 2nd, 10" (v1.4): Adds ability to specify delay before sub menus appear and disappear, respectively. See showhidedelay variable below

//** Dec 17th, 10" (v1.5): Updated menu shadow to use CSS3 box shadows when the browser is FF3.5+, IE9+, Opera9.5+, or Safari3+/Chrome. Only .js file changed.

//** Jun 28th, 2012: Unofficial update adds optional hover images for down and right arrows in the format: filename_over.ext
//** These must be present for whichever or both of the arrow(s) are used and will preload.

//** Dec 23rd, 2012 Unofficial update to fixed configurable z-index, add method option to init "toggle" which activates on click or "hover" 
//** which activates on mouse over/out - defaults to "toggle" (click activation), with detection of touch devices to activate on click for them.
//** Add option for when there are two or more menus using "toggle" activation, whether or not all previously opened menus collapse
//** on new menu activation, or just those within that specific menu
//** See: http://www.dynamicdrive.com/forums/showthread.php?72449-PLEASE-HELP-with-Smooth-Navigational-Menu-(v1-51)&p=288466#post288466

//** Feb 7th, 2013 Unofficial update change fixed configurable z-index back to graduated for cases of main UL wrapping. Update off menu click detection in
//** ipad/iphone to touchstart because document click wasn't registering. see: http://www.dynamicdrive.com/forums/showthread.php?72825

//** Feb 14th, 2013 Add window.ontouchstart to means tests for detecting touch browsers - thanks DD!
//** Feb 15th, 2013 Add 'ontouchstart' in window and 'ontouchstart' in document.documentElement to means tests for detecting touch browsers - thanks DD!

//** Feb 20th, 2013 correct for IE 9+ sometimes adding a pixel to the offsetHeight of the top level trigger for horizontal menus
//** Feb 23rd, 2013 move CSS3 shadow adjustment for IE 9+ to the script, add resize event for all browsers to reposition open toggle 
//** menus and shadows in window if they would have gone to a different position at the new window dimensions
//** Feb 25th, 2013 (v2.0) All unofficial updates by John merged into official and now called v2.0. Changed "method" option's default value to "hover"
//** May 14th, 2013 (v2.1) Adds class 'repositioned' to menus moved due to being too close to the browser's right edge
//** May 30th, 2013 (v2.1) Change from version sniffing to means testing for jQuery versions which require added code for click toggle event handling
//** Sept 15th, 2013 add workaround for false positives for touch on Chrome
//** Sept 22nd, 2013 (v2.2) Add vertical repositioning if sub menu will not fit in the viewable vertical area. May be turned off by setting
// 	repositionv: false,
//** in the init. Sub menus that are vertically repositioned will have the class 'repositionedv' added to them.
//** March 17th, 15' (v3.0): Adds fully mobile friendly, compact version of menu that's activated in mobile and small screen browsers.
//** Refines drop down menu behaviour when there's neither space to the right nor left to accommodate sub menu; in that case sub menu overlaps parent menu.
//** Nov 3rd, 15' (v3.01): Fixed long drop down menus causing a vertical document scrollbar when page loads
//** April 1st, 16' (v3.02): Fixed Chrome desktop falsely reporting as touch enabled, requiring clicking on menu items to drop down.
var ddsmoothmenu = {

///////////////////////// Global Configuration Options: /////////////////////////

mobilemediaquery: "screen and (max-width: 700px)", // CSS media query string that when matched activates mobile menu (while hiding default)
//Specify full URL to down and right arrow images (23 is padding-right for top level LIs with drop downs, 6 is for vertical top level items with fly outs):
arrowimages: {down:['downarrowclass', 'down.gif', 23], right:['rightarrowclass', 'right.gif', 6], left:['leftarrowclass', 'left.gif']},
transition: {overtime:300, outtime:300}, //duration of slide in/ out animation, in milliseconds
mobiletransition: 200, // duration of slide animation in mobile menu, in milliseconds
shadow: false, //enable shadow? (offsets now set in ddsmoothmenu.css stylesheet)
showhidedelay: {showdelay: 100, hidedelay: 200}, //set delay in milliseconds before sub menus appear and disappear, respectively
zindexvalue: 1000, //set z-index value for menus
closeonnonmenuclick: true, //when clicking outside of any "toggle" method menu, should all "toggle" menus close? 
closeonmouseout: false, //when leaving a "toggle" menu, should all "toggle" menus close? Will not work on touchscreen

/////////////////////// End Global Configuration Options ////////////////////////

overarrowre: /(?=\.(gif|jpg|jpeg|png|bmp))/i,
overarrowaddtofilename: '_over',
detecttouch: !!('ontouchstart' in window) || !!('ontouchstart' in document.documentElement) || !!window.ontouchstart || (!!window.Touch && !!window.Touch.length) || !!window.onmsgesturechange || (window.DocumentTouch && window.document instanceof window.DocumentTouch),
detectwebkit: navigator.userAgent.toLowerCase().indexOf("applewebkit") > -1, //detect WebKit browsers (Safari, Chrome etc)
detectchrome: navigator.userAgent.toLowerCase().indexOf("chrome") > -1, //detect chrome
ismobile: navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i) != null, //boolean check for popular mobile browsers
idevice: /ipad|iphone/i.test(navigator.userAgent),
detectie6: (function(){var ie; return (ie = /MSIE (\d+)/.exec(navigator.userAgent)) && ie[1] < 7;})(),
detectie9: (function(){var ie; return (ie = /MSIE (\d+)/.exec(navigator.userAgent)) && ie[1] > 8;})(),
ie9shadow: function(){},
css3support: typeof document.documentElement.style.boxShadow === 'string' || (!document.all && document.querySelector), //detect browsers that support CSS3 box shadows (ie9+ or FF3.5+, Safari3+, Chrome etc)
prevobjs: [], menus: null,
mobilecontainer: {$main: null, $topulsdiv: null, $toggler: null, hidetimer: null},
mobilezindexvalue: 2000, // mobile menus starting zIndex

executelink: function($, prevobjs, e){
	var prevscount = prevobjs.length, link = e.target;
	while(--prevscount > -1){
		if(prevobjs[prevscount] === this){
			prevobjs.splice(prevscount, 1);
			if(link.href !== ddsmoothmenu.emptyhash && link.href && $(link).is('a') && !$(link).children('span.' + ddsmoothmenu.arrowimages.down[0] +', span.' + ddsmoothmenu.arrowimages.right[0]).length){
				if(link.target && link.target !== '_self'){
					window.open(link.href, link.target);
				} else {
					window.location.href = link.href;
				}
				e.stopPropagation();
			}
		}
	}
},

repositionv: function($subul, $link, newtop, winheight, doctop, method, menutop){
	menutop = menutop || 0;
	var topinc = 0, doclimit = winheight + doctop;
	$subul.css({top: newtop, display: 'block'});
	while($subul.offset().top < doctop) {
		$subul.css({top: ++newtop});
		++topinc;
	}
	if(!topinc && $link.offset().top + $link.outerHeight() < doclimit && $subul.data('height') + $subul.offset().top > doclimit){
		$subul.css({top: doctop - $link.parents('ul').last().offset().top - $link.position().top});
	}
	method === 'toggle' && $subul.css({display: 'none'});
	if(newtop !== menutop){$subul.addClass('repositionedv');}
	return [topinc, newtop];
},

updateprev: function($, prevobjs, $curobj){
	var prevscount = prevobjs.length, prevobj, $indexobj = $curobj.parents().add(this);
	while(--prevscount > -1){
		if($indexobj.index((prevobj = prevobjs[prevscount])) < 0){
			$(prevobj).trigger('click', [1]);
			prevobjs.splice(prevscount, 1);
		}
	}
	prevobjs.push(this);
},

subulpreventemptyclose: function(e){
	var link = e.target;
	if(link.href === ddsmoothmenu.emptyhash && $(link).parent('li').find('ul').length < 1){
		e.preventDefault();
		e.stopPropagation();
	}
},

getajaxmenu: function($, setting, nobuild){ //function to fetch external page containing the panel DIVs
	var $menucontainer=$('#'+setting.contentsource[0]); //reference empty div on page that will hold menu
	$menucontainer.html("Loading Menu...");
	$.ajax({
		url: setting.contentsource[1], //path to external menu file
		async: true,
		dataType: 'html',
		error: function(ajaxrequest){
			setting.menustate = "error"
			$menucontainer.html('Error fetching content. Server Response: '+ajaxrequest.responseText);
		},
		success: function(content){
			setting.menustate = "fetched"
			$menucontainer.html(content).find('#' + setting.mainmenuid).css('display', 'block');
			!!!nobuild && ddsmoothmenu.buildmenu($, setting);
		}
	});
},

getajaxmenuMobile: function($, setting){ //function to fetch external page containing the primary menu UL
	setting.mobilemenustate = 'fetching'
	$.ajax({
		url: setting.contentsource[1], //path to external menu file
		async: true,
		dataType: 'html',
		error: function(ajaxrequest){
			setting.mobilemenustate = 'error'
			alert("Error fetching Ajax content " + ajaxrequest.responseText)
		},
		success: function(content){
			var $ul = $(content).find('>ul')
			setting.mobilemenustate = 'fetched'
			ddsmoothmenu.buildmobilemenu($, setting, $ul);
		}
	});
},

closeall: function(e){
	var smoothmenu = ddsmoothmenu, prevscount;
	if(!smoothmenu.globaltrackopen){return;}
	if(e.type === 'mouseleave' || ((e.type === 'click' || e.type === 'touchstart') && smoothmenu.menus.index(e.target) < 0)){
		prevscount = smoothmenu.prevobjs.length;
		while(--prevscount > -1){
			$(smoothmenu.prevobjs[prevscount]).trigger('click');
			smoothmenu.prevobjs.splice(prevscount, 1);
		}
	}
},

emptyhash: $('<a href="#"></a>').get(0).href,

togglemobile: function(action, duration){
	if (!this.mobilecontainer.$main)
		return
	clearTimeout(this.mobilecontainer.hidetimer)
	var $mobilemenu = this.mobilecontainer.$main
	var duration = duration || this.mobiletransition
	if ($mobilemenu.css('visibility') == 'hidden' && (!action || action == 'open')){
		$mobilemenu.css({left: '-100%', visibility: 'visible'}).animate({left: 0}, duration)
		this.mobilecontainer.$toggler.addClass('open')
	}
	else if ($mobilemenu.css('visibility') == 'visible' && (!action || action != 'open')){
		$mobilemenu.animate({left: '-100%'}, duration, function(){this.style.visibility = 'hidden'})
		this.mobilecontainer.$toggler.removeClass('open')
	}
	return false
	
},

buildmobilemenu: function($, setting, $ul){

	function flattenuls($mainul, cloneulBol, callback, finalcall){
		var callback = callback || function(){}
		var finalcall = finalcall || function(){}
		var $headers = $mainul.find('ul').parent()
		var $mainulcopy = cloneulBol? $mainul.clone() : $mainul
		var $flattened = jQuery(document.createDocumentFragment())
		var $headers = $mainulcopy.find('ul').parent()
		for (var i=$headers.length-1; i>=0; i--){ // loop through headers backwards, so we end up with topmost UL last
			var $header = $headers.eq(i)
			var $subul = $header.find('>ul').prependTo($flattened)
			callback(i, $header, $subul)
		}
		$mainulcopy.prependTo($flattened) // Add top most UL to collection
		finalcall($mainulcopy)
		return $flattened
	}

	var $mainmenu = $('#' + setting.mainmenuid)
	var $mainul = $ul
	var $topulref = null

	var flattened = flattenuls($mainul, false,
		function(i, $header, $subul){ // loop through header LIs and sub ULs
			$subul.addClass("submenu")
			var $breadcrumb = $('<li class="breadcrumb" />')
				.html('<img src="' + ddsmoothmenu.arrowimages.left[1] +'" class="' + ddsmoothmenu.arrowimages.left[0] +'" />' + $header.text())
				.prependTo($subul)
			$header.find('a:eq(0)').append('<img src="' + ddsmoothmenu.arrowimages.right[1] +'" class="' + ddsmoothmenu.arrowimages.right[0] +'" />')
			$header.on('click', function(e){
				var $headermenu = $(this).parent('ul')
				$headermenu = $headermenu.hasClass('submenu')? $headermenu : $headermenu.parent()
				$headermenu.css({zIndex: ddsmoothmenu.mobilezindexvalue++, left: 0}).animate({left: '-100%'}, ddsmoothmenu.mobiletransition)
				$subul.css({zIndex: ddsmoothmenu.mobilezindexvalue++, left: '100%'}).animate({left: 0}, ddsmoothmenu.mobiletransition)
				e.stopPropagation()
				e.preventDefault()
			})
			$breadcrumb.on('click', function(e){
				var $headermenu = $header.parent('ul')
				$headermenu = $headermenu.hasClass('submenu')? $headermenu : $headermenu.parent()
				$headermenu.css({zIndex: ddsmoothmenu.mobilezindexvalue++, left: '-100%'}).animate({left: 0}, ddsmoothmenu.mobiletransition)
				$subul.css({zIndex: ddsmoothmenu.mobilezindexvalue++, left: 0}).animate({left: '100%'}, ddsmoothmenu.mobiletransition)
				e.stopPropagation()
				e.preventDefault()
			})
		},
		function($topul){
			$topulref = $topul
		}
	)


	if (!this.mobilecontainer.$main){ // if primary mobile menu container not defined yet
		var $maincontainer = $('<div class="ddsmoothmobile"><div class="topulsdiv"></div></div>').appendTo(document.body)
		$maincontainer
			.css({zIndex: this.mobilezindexvalue++, left: '-100%', visibility: 'hidden'})
			.on('click', function(e){ // assign click behavior to mobile container
				ddsmoothmenu.mobilecontainer.hidetimer = setTimeout(function(){
					ddsmoothmenu.togglemobile('close', 0)
				}, 50)
				e.stopPropagation()
			})
			.on('touchstart', function(e){
				e.stopPropagation()
			})
		var $topulsdiv = $maincontainer.find('div.topulsdiv')
		var $mobiletoggler = $('#ddsmoothmenu-mobiletoggle').css({display: 'block'})
		$mobiletoggler
			.on('click', function(e){ // assign click behavior to main mobile menu toggler
				ddsmoothmenu.togglemobile()
				e.stopPropagation()
			})
			.on('touchstart', function(e){
				e.stopPropagation()
			})		
		var hidemobilemenuevent = /(iPad|iPhone|iPod)/g.test( navigator.userAgent )? 'touchstart' : 'click' // ios doesnt seem to respond to clicks on BODY
		$(document.body).on(hidemobilemenuevent, function(e){
			if (!$maincontainer.is(':animated'))
				ddsmoothmenu.togglemobile('close', 0)
		})

		this.mobilecontainer.$main = $maincontainer
		this.mobilecontainer.$topulsdiv = $topulsdiv
		this.mobilecontainer.$toggler = $mobiletoggler
	}
	else{ // else, just reference mobile container on page
		var $maincontainer = this.mobilecontainer.$main
		var $topulsdiv = this.mobilecontainer.$topulsdiv
	}
	$topulsdiv.append($topulref).css({zIndex: this.mobilezindexvalue++})
	$maincontainer.append(flattened)

	setting.mobilemenustate = 'done'
	

},

buildmenu: function($, setting){
	// additional step to detect true touch support. Chrome desktop mistakenly returns true for this.detecttouch
	var detecttruetouch = (this.detecttouch && !this.detectchrome) || (this.detectchrome && this.ismobile)
	var smoothmenu = ddsmoothmenu;
	smoothmenu.globaltrackopen = smoothmenu.closeonnonmenuclick || smoothmenu.closeonmouseout;
	var zsub = 0; //subtractor to be incremented so that each top level menu can be covered by previous one's drop downs
	var prevobjs = smoothmenu.globaltrackopen? smoothmenu.prevobjs : [];
	var $mainparent = $("#"+setting.mainmenuid).removeClass("ddsmoothmenu ddsmoothmenu-v").addClass(setting.classname || "ddsmoothmenu");
	setting.repositionv = setting.repositionv !== false;
	var $mainmenu = $mainparent.find('>ul'); //reference main menu UL
	var method = (detecttruetouch)? 'toggle' : setting.method === 'toggle'? 'toggle' : 'hover';
	var $topheaders = $mainmenu.find('>li>ul').parent();//has('ul');
	var orient = setting.orientation!='v'? 'down' : 'right', $parentshadow = $(document.body);
	$mainmenu.click(function(e){e.target.href === smoothmenu.emptyhash && e.preventDefault();});
	if(method === 'toggle') {
		if(smoothmenu.globaltrackopen){
			smoothmenu.menus = smoothmenu.menus? smoothmenu.menus.add($mainmenu.add($mainmenu.find('*'))) : $mainmenu.add($mainmenu.find('*'));
		}
		if(smoothmenu.closeonnonmenuclick){
			if(orient === 'down'){$mainparent.click(function(e){e.stopPropagation();});}
			$(document).unbind('click.smoothmenu').bind('click.smoothmenu', smoothmenu.closeall);
			if(smoothmenu.idevice){
				document.removeEventListener('touchstart', smoothmenu.closeall, false);
				document.addEventListener('touchstart', smoothmenu.closeall, false);
			}
		} else if (setting.closeonnonmenuclick){
			if(orient === 'down'){$mainparent.click(function(e){e.stopPropagation();});}
			$(document).bind('click.' + setting.mainmenuid, function(e){$mainmenu.find('li>a.selected').parent().trigger('click');});
			if(smoothmenu.idevice){
				document.addEventListener('touchstart', function(e){$mainmenu.find('li>a.selected').parent().trigger('click');}, false);
			}
		}
		if(smoothmenu.closeonmouseout){
			var $leaveobj = orient === 'down'? $mainparent : $mainmenu;
			$leaveobj.bind('mouseleave.smoothmenu', smoothmenu.closeall);
		} else if (setting.closeonmouseout){
			var $leaveobj = orient === 'down'? $mainparent : $mainmenu;
			$leaveobj.bind('mouseleave.smoothmenu', function(){$mainmenu.find('li>a.selected').parent().trigger('click');});
		}
		if(!$('style[title="ddsmoothmenushadowsnone"]').length){
			$('head').append('<style title="ddsmoothmenushadowsnone" type="text/css">.ddsmoothmenushadowsnone{display:none!important;}</style>');
		}
		var shadowstimer;
		$(window).bind('resize scroll', function(){
			clearTimeout(shadowstimer);
			var $selected = $mainmenu.find('li>a.selected').parent(),
			$shadows = $('.ddshadow').addClass('ddsmoothmenushadowsnone');
			$selected.eq(0).trigger('click');
			$selected.trigger('click');
			if ( !window.matchMedia || (window.matchMedia && !setting.mobilemql.matches))
				shadowstimer = setTimeout(function(){$shadows.removeClass('ddsmoothmenushadowsnone');}, 100);
		});
	}

	$topheaders.each(function(){
		var $curobj=$(this).css({zIndex: (setting.zindexvalue || smoothmenu.zindexvalue) + zsub--}); //reference current LI header
		var $subul=$curobj.children('ul:eq(0)').css({display:'block'}).data('timers', {});
		var $link = $curobj.children("a:eq(0)").css({paddingRight: smoothmenu.arrowimages[orient][2]}).append( //add arrow images
			'<span style="display: block;" class="' + smoothmenu.arrowimages[orient][0] + '"></span>'
		);
		var dimensions = {
			w	: $link.outerWidth(),
			h	: $curobj.innerHeight(),
			subulw	: $subul.outerWidth(),
			subulh	: $subul.outerHeight()
		};
		var menutop = orient === 'down'? dimensions.h : 0;
		$subul.css({top: menutop});
		function restore(){$link.removeClass('selected');}
		method === 'toggle' && $subul.click(smoothmenu.subulpreventemptyclose);
		$curobj[method](
			function(e){
				if(!$curobj.data('headers')){
					smoothmenu.buildsubheaders($, $subul, $subul.find('>li>ul').parent(), setting, method, prevobjs);
					$curobj.data('headers', true).find('>ul').each(function(i, ul){
						var $ul = $(ul);
						$ul.data('height', $ul.outerHeight());
					}).css({display:'none', visibility:'visible'});
				}
				method === 'toggle' && smoothmenu.updateprev.call(this, $, prevobjs, $curobj);
				clearTimeout($subul.data('timers').hidetimer);
				$link.addClass('selected');
				$subul.data('timers').showtimer=setTimeout(function(){
					var menuleft = orient === 'down'? 0 : dimensions.w;
					var menumoved = menuleft, newtop, doctop, winheight, topinc = 0;
					var offsetLeft = $curobj.offset().left
					menuleft=(offsetLeft+menuleft+dimensions.subulw>$(window).width())? (orient === 'down'? -dimensions.subulw+dimensions.w : -dimensions.w) : menuleft; 
//calculate this sub menu's offsets from its parent
					if (orient === 'right' && menuleft < 0){ // for vertical menu, if top level sub menu drops left, test to see if it'll be obscured by left window edge
						var scrollX = window.pageXOffset || (document.documentElement || document.body.parentNode || document.body).scrollLeft
						if (offsetLeft - dimensions.subulw < 0) // if menu will be obscured by left window edge
							menuleft = 0
					}
					menumoved = menumoved !== menuleft;
					$subul.css({top: menutop}).removeClass('repositionedv');
					if(setting.repositionv && $link.offset().top + menutop + $subul.data('height') > (winheight = $(window).height()) + (doctop = $(document).scrollTop())){
						newtop = (orient === 'down'? 0 : $link.outerHeight()) - $subul.data('height');
						topinc = smoothmenu.repositionv($subul, $link, newtop, winheight, doctop, method, menutop)[0];
					}
					$subul.css({left:menuleft, width:dimensions.subulw}).stop(true, true).animate({height:'show',opacity:'show'}, smoothmenu.transition.overtime, function(){this.style.removeAttribute && this.style.removeAttribute('filter');});
					if(menumoved){$subul.addClass('repositioned');} else {$subul.removeClass('repositioned');}
					if (setting.shadow){
						if(!$curobj.data('$shadow')){
							$curobj.data('$shadow', $('<div></div>').addClass('ddshadow toplevelshadow').prependTo($parentshadow).css({zIndex: $curobj.css('zIndex')}));  //insert shadow DIV and set it to parent node for the next shadow div
						}
						smoothmenu.ie9shadow($curobj.data('$shadow'));
						var offsets = $subul.offset();
						var shadowleft = offsets.left;
						var shadowtop = offsets.top;
						$curobj.data('$shadow').css({overflow: 'visible', width:dimensions.subulw, left:shadowleft, top:shadowtop}).stop(true, true).animate({height:dimensions.subulh}, smoothmenu.transition.overtime);
					}
				}, smoothmenu.showhidedelay.showdelay);
			},
			function(e, speed){
				var $shadow = $curobj.data('$shadow');
				if(method === 'hover'){restore();}
				else{smoothmenu.executelink.call(this, $, prevobjs, e);}
				clearTimeout($subul.data('timers').showtimer);
				$subul.data('timers').hidetimer=setTimeout(function(){
					$subul.stop(true, true).animate({height:'hide', opacity:'hide'}, speed || smoothmenu.transition.outtime, function(){method === 'toggle' && restore();});
					if ($shadow){
						if (!smoothmenu.css3support && smoothmenu.detectwebkit){ //in WebKit browsers, set first child shadow's opacity to 0, as "overflow:hidden" doesn't work in them
							$shadow.children('div:eq(0)').css({opacity:0});
						}
						$shadow.stop(true, true).animate({height:0}, speed || smoothmenu.transition.outtime, function(){if(method === 'toggle'){this.style.overflow = 'hidden';}});
					}
				}, smoothmenu.showhidedelay.hidedelay);
			}
		); //end hover/toggle
		$subul.css({display: 'none'}); // collapse sub UL 
	}); //end $topheaders.each()
},

buildsubheaders: function($, $subul, $headers, setting, method, prevobjs){
	//setting.$mainparent.data('$headers').add($headers);
	$subul.css('display', 'block');
	$headers.each(function(){ //loop through each LI header
		var smoothmenu = ddsmoothmenu;
		var $curobj=$(this).css({zIndex: $(this).parent('ul').css('z-index')}); //reference current LI header
		var $subul=$curobj.children('ul:eq(0)').css({display:'block'}).data('timers', {}), $parentshadow;
		method === 'toggle' && $subul.click(smoothmenu.subulpreventemptyclose);
		var $link = $curobj.children("a:eq(0)").append( //add arrow images
			'<span style="display: block;" class="' + smoothmenu.arrowimages['right'][0] + '"></span>'
		);
		var dimensions = {
			w	: $link.outerWidth(),
			subulw	: $subul.outerWidth(),
			subulh	: $subul.outerHeight()
		};
		$subul.css({top: 0});
		function restore(){$link.removeClass('selected');}
		$curobj[method](
			function(e){
				if(!$curobj.data('headers')){
					smoothmenu.buildsubheaders($, $subul, $subul.find('>li>ul').parent(), setting, method, prevobjs);
					$curobj.data('headers', true).find('>ul').each(function(i, ul){
						var $ul = $(ul);
						$ul.data('height', $ul.height());
					}).css({display:'none', visibility:'visible'});
				}
				method === 'toggle' && smoothmenu.updateprev.call(this, $, prevobjs, $curobj);
				clearTimeout($subul.data('timers').hidetimer);
				$link.addClass('selected');
				$subul.data('timers').showtimer=setTimeout(function(){
					var menuleft= dimensions.w;
					var menumoved = menuleft, newtop, doctop, winheight, topinc = 0;
					var offsetLeft = $curobj.offset().left
					menuleft=(offsetLeft+menuleft+dimensions.subulw>$(window).width())? -dimensions.w : menuleft; //calculate this sub menu's offsets from its parent
					if (menuleft < 0){ // if drop left, test to see if it'll be obscured by left window edge
						var scrollX = window.pageXOffset || (document.documentElement || document.body.parentNode || document.body).scrollLeft
						if (offsetLeft - dimensions.subulw < scrollX) // if menu will be obscured by left window edge
							menuleft = 0
					}
					menumoved = menumoved !== menuleft;

					$subul.css({top: 0}).removeClass('repositionedv');
					if(setting.repositionv && $link.offset().top + $subul.data('height') > (winheight = $(window).height()) + (doctop = $(document).scrollTop())){
						newtop = $link.outerHeight() - $subul.data('height');
						topinc = smoothmenu.repositionv($subul, $link, newtop, winheight, doctop, method);
						newtop = topinc[1];
						topinc = topinc[0];
					}
					$subul.css({left:menuleft, width:dimensions.subulw}).stop(true, true).animate({height:'show',opacity:'show'}, smoothmenu.transition.overtime, function(){this.style.removeAttribute && this.style.removeAttribute('filter');});
					if(menumoved){$subul.addClass('repositioned');} else {$subul.removeClass('repositioned');}
					if (setting.shadow){
						if(!$curobj.data('$shadow')){
							$parentshadow = $curobj.parents("li:eq(0)").data('$shadow');
							$curobj.data('$shadow', $('<div></div>').addClass('ddshadow').prependTo($parentshadow).css({zIndex: $parentshadow.css('z-index')}));  //insert shadow DIV and set it to parent node for the next shadow div
						}
						var offsets = $subul.offset();
						var shadowleft = menuleft;
						var shadowtop = $curobj.position().top - (newtop? $subul.data('height') - $link.outerHeight() - topinc : 0);
						if (smoothmenu.detectwebkit && !smoothmenu.css3support){ //in WebKit browsers, restore shadow's opacity to full
							$curobj.data('$shadow').css({opacity:1});
						}
						$curobj.data('$shadow').css({overflow: 'visible', width:dimensions.subulw, left:shadowleft, top:shadowtop}).stop(true, true).animate({height:dimensions.subulh}, smoothmenu.transition.overtime);
					}
				}, smoothmenu.showhidedelay.showdelay);
			},
			function(e, speed){
				var $shadow = $curobj.data('$shadow');
				if(method === 'hover'){restore();}
				else{smoothmenu.executelink.call(this, $, prevobjs, e);}
				clearTimeout($subul.data('timers').showtimer);
				$subul.data('timers').hidetimer=setTimeout(function(){
					$subul.stop(true, true).animate({height:'hide', opacity:'hide'}, speed || smoothmenu.transition.outtime, function(){
						method === 'toggle' && restore();
					});
					if ($shadow){
						if (!smoothmenu.css3support && smoothmenu.detectwebkit){ //in WebKit browsers, set first child shadow's opacity to 0, as "overflow:hidden" doesn't work in them
							$shadow.children('div:eq(0)').css({opacity:0});
						}
						$shadow.stop(true, true).animate({height:0}, speed || smoothmenu.transition.outtime, function(){if(method === 'toggle'){this.style.overflow = 'hidden';}});
					}
				}, smoothmenu.showhidedelay.hidedelay);
			}
		); //end hover/toggle for subheaders
	}); //end $headers.each() for subheaders
},


initmenu: function(setting){
	if (setting.mobilemql.matches){ // if mobile mode
		jQuery(function($){
			var $mainmenu = $('#' + setting.mainmenuid)
			$mainmenu.css({display: 'none'}) // hide regular menu
			//setTimeout(function(){$('.ddshadow').addClass('ddsmoothmenushadowsnone')}, 150)
			if (!setting.$mainulclone){ // store a copy of the main menu's UL menu before it gets manipulated
				setting.$mainulclone = $mainmenu.find('>ul').clone()
			}
			var mobilemenustate = setting.mobilemenustate
			if (setting.contentsource == "markup" && !mobilemenustate){ // if mobile menu not built yet
				ddsmoothmenu.buildmobilemenu($, setting, setting.$mainulclone)
			}
			else if (setting.contentsource != "markup" && (!mobilemenustate || mobilemenustate == "error")){ // if Ajax content and mobile menu not built yet
				ddsmoothmenu.getajaxmenuMobile($, setting)
			}
			else{ // if mobile menu built already, just show mobile togger
				$('#ddsmoothmenu-mobiletoggle').css({display: 'block'})				
			}
		})
		return
	}
	else{ // if desktop mode
		var menustate = setting.menustate
		if (menustate && menustate != "error"){ // if menustate is anything other than "error" (meaning error fetching ajax content), it means menu's built already, so exit init()
			var $mainmenu = $('#' + setting.mainmenuid)
			$mainmenu.css({display: 'block'}) // show regular menu
			if (this.mobilecontainer.$main){ // if mobile menu defined, hide it
				this.togglemobile('close', 0)
			}
			$('#ddsmoothmenu-mobiletoggle').css({display: 'none'}) // hide mobile menu toggler
			return
		}
	}

	if(this.detectie6 && parseFloat(jQuery.fn.jquery) > 1.3){
		this.initmenu = function(setting){
			if (typeof setting.contentsource=="object"){ //if external ajax menu
				jQuery(function($){ddsmoothmenu.getajaxmenu($, setting, 'nobuild');});
			}
			return false;
		};
		jQuery('link[href*="ddsmoothmenu"]').attr('disabled', true);
		jQuery(function($){
			alert('You Seriously Need to Update Your Browser!\n\nDynamic Drive Smooth Navigational Menu Showing Text Only Menu(s)\n\nDEVELOPER\'s NOTE: This script will run in IE 6 when using jQuery 1.3.2 or less,\nbut not real well.');
				$('link[href*="ddsmoothmenu"]').attr('disabled', true);
		});
		return this.initmenu(setting);
	}
	var mainmenuid = '#' + setting.mainmenuid, right, down, stylestring = ['</style>\n'], stylesleft = setting.arrowswap? 4 : 2;
	function addstyles(){
		if(stylesleft){return;}
		if (typeof setting.customtheme=="object" && setting.customtheme.length==2){ //override default menu colors (default/hover) with custom set?
			var mainselector=(setting.orientation=="v")? mainmenuid : mainmenuid+', '+mainmenuid;
			stylestring.push([mainselector,' ul li a {background:',setting.customtheme[0],';}\n',
				mainmenuid,' ul li a:hover {background:',setting.customtheme[1],';}'].join(''));
		}
		stylestring.push('\n<style type="text/css">');
		stylestring.reverse();
		jQuery('head').append(stylestring.join('\n'));
	}
	if(setting.arrowswap){
		right = ddsmoothmenu.arrowimages.right[1].replace(ddsmoothmenu.overarrowre, ddsmoothmenu.overarrowaddtofilename);
		down = ddsmoothmenu.arrowimages.down[1].replace(ddsmoothmenu.overarrowre, ddsmoothmenu.overarrowaddtofilename);
		jQuery(new Image()).bind('load error', function(e){
			setting.rightswap = e.type === 'load';
			if(setting.rightswap){
				stylestring.push([mainmenuid, ' ul li a:hover .', ddsmoothmenu.arrowimages.right[0], ', ',
				mainmenuid, ' ul li a.selected .', ddsmoothmenu.arrowimages.right[0],
				' { background-image: url(', this.src, ');}'].join(''));
			}
			--stylesleft;
			addstyles();
		}).attr('src', right);
		jQuery(new Image()).bind('load error', function(e){
			setting.downswap = e.type === 'load';
			if(setting.downswap){
				stylestring.push([mainmenuid, ' ul li a:hover .', ddsmoothmenu.arrowimages.down[0], ', ',
				mainmenuid, ' ul li a.selected .', ddsmoothmenu.arrowimages.down[0],
				' { background-image: url(', this.src, ');}'].join(''));
			}
			--stylesleft;
			addstyles();
		}).attr('src', down);
	}
	jQuery(new Image()).bind('load error', function(e){
		if(e.type === 'load'){
			stylestring.push([mainmenuid+' ul li a .', ddsmoothmenu.arrowimages.right[0],' { background: url(', this.src, ') no-repeat;width:', this.width,'px;height:', this.height, 'px;}'].join(''));
		}
		--stylesleft;
		addstyles();
	}).attr('src', ddsmoothmenu.arrowimages.right[1]);
	jQuery(new Image()).bind('load error', function(e){
		if(e.type === 'load'){
			stylestring.push([mainmenuid+' ul li a .', ddsmoothmenu.arrowimages.down[0],' { background: url(', this.src, ') no-repeat;width:', this.width,'px;height:', this.height, 'px;}'].join(''));
		}
		--stylesleft;
		addstyles();
	}).attr('src', ddsmoothmenu.arrowimages.down[1]);
	setting.shadow = this.detectie6 && (setting.method === 'hover' || setting.orientation === 'v')? false : setting.shadow || this.shadow; //in IE6, always disable shadow except for horizontal toggle menus
	jQuery(document).ready(function($){
		var $mainmenu = $('#' + setting.mainmenuid)
		$mainmenu.css({display: 'block'}) // show regular menu (in case previously hidden by mobile menu activation)
		if (ddsmoothmenu.mobilecontainer.$main){ // if mobile menu defined, hide it
				ddsmoothmenu.togglemobile('close', 0)
		}
		$('#ddsmoothmenu-mobiletoggle').css({display: 'none'}) // hide mobile menu toggler
		if (!setting.$mainulclone){ // store a copy of the main menu's UL menu before it gets manipulated
			setting.$mainulclone = $mainmenu.find('>ul').clone()
		}
		if (setting.shadow && ddsmoothmenu.css3support){$('body').addClass('ddcss3support');}
		if (typeof setting.contentsource=="object"){ //if external ajax menu
			ddsmoothmenu.getajaxmenu($, setting);
		}
		else{ //else if markup menu
			ddsmoothmenu.buildmenu($, setting);
		}

		setting.menustate = "initialized" // set menu state to initialized
	});
},

init: function(setting){
	setting.mobilemql = (window.matchMedia)? window.matchMedia(this.mobilemediaquery) : {matches: false, addListener: function(){}}
	this.initmenu(setting)
	setting.mobilemql.addListener(function(){
		ddsmoothmenu.initmenu(setting)
	})
}
}; //end ddsmoothmenu variable


// Patch for jQuery 1.9+ which lack click toggle (deprecated in 1.8, removed in 1.9)
// Will not run if using another patch like jQuery Migrate, which also takes care of this
if(
	(function($){
		var clicktogglable = false;
		try {
			$('<a href="#"></a>').toggle(function(){}, function(){clicktogglable = true;}).trigger('click').trigger('click');
		} catch(e){}
		return !clicktogglable;
	})(jQuery)
){
	(function(){
		var toggleDisp = jQuery.fn.toggle; // There's an animation/css method named .toggle() that toggles display. Save a reference to it.
		jQuery.extend(jQuery.fn, {
			toggle: function( fn, fn2 ) {
				// The method fired depends on the arguments passed.
				if ( !jQuery.isFunction( fn ) || !jQuery.isFunction( fn2 ) ) {
					return toggleDisp.apply(this, arguments);
				}
				// Save reference to arguments for access in closure
				var args = arguments, guid = fn.guid || jQuery.guid++,
					i = 0,
					toggler = function( event ) {
						// Figure out which function to execute
						var lastToggle = ( jQuery._data( this, "lastToggle" + fn.guid ) || 0 ) % i;
						jQuery._data( this, "lastToggle" + fn.guid, lastToggle + 1 );
	
						// Make sure that clicks stop
						event.preventDefault();
	
						// and execute the function
						return args[ lastToggle ].apply( this, arguments ) || false;
					};

				// link all the functions, so any of them can unbind this click handler
				toggler.guid = guid;
				while ( i < args.length ) {
					args[ i++ ].guid = guid;
				}

				return this.click( toggler );
			}
		});
	})();
}

/* TECHNICAL NOTE: To overcome an intermittent layout bug in IE 9+, the script will change margin top and left for the shadows to 
   1px less than their computed values, and the first two values for the box-shadow property will be changed to 1px larger than 
   computed, ex: -1px top and left margins and 6px 6px 5px #aaa box-shadow results in what appears to be a 5px box-shadow. 
   Other browsers skip this step and it shouldn't affect you in most cases. In some rare cases it will result in 
   slightly narrower (by 1px) box shadows for IE 9+ on one or more of the drop downs. Without this, sometimes 
   the shadows could be 1px beyond their drop down resulting in a gap. This is the first of the two patches below. 
   and also relates to the MS CSSOM which uses decimal fractions of pixels for layout while only reporting rounded values. 
   There appears to be no computedStyle workaround for this one. */

//Scripted CSS Patch for IE 9+ intermittent mis-rendering of box-shadow elements (see above TECHNICAL NOTE for more info)
//And jQuery Patch for IE 9+ CSSOM re: offset Width and Height and re: getBoundingClientRect(). Both run only in IE 9 and later.
//IE 9 + uses decimal fractions of pixels internally for layout but only reports rounded values using the offset and getBounding methods.
//These are sometimes rounded inconsistently. This second patch gets the decimal values directly from computedStyle.
if(ddsmoothmenu.detectie9){
	(function($){ //begin Scripted CSS Patch
		function incdec(v, how){return parseInt(v) + how + 'px';}
		ddsmoothmenu.ie9shadow = function($elem){ //runs once
			var getter = document.defaultView.getComputedStyle($elem.get(0), null),
			curshadow = getter.getPropertyValue('box-shadow').split(' '),
			curmargin = {top: getter.getPropertyValue('margin-top'), left: getter.getPropertyValue('margin-left')};
			$('head').append(['\n<style title="ie9shadow" type="text/css">',
			'.ddcss3support .ddshadow {',
			'\tbox-shadow: ' + incdec(curshadow[0], 1) + ' ' + incdec(curshadow[1], 1) + ' ' + curshadow[2] + ' ' + curshadow[3] + ';',
			'}', '.ddcss3support .ddshadow.toplevelshadow {',
			'\topacity: ' + ($('.ddcss3support .ddshadow').css('opacity') - 0.1) + ';',
			'\tmargin-top: ' + incdec(curmargin.top, -1) + ';',
			'\tmargin-left: ' + incdec(curmargin.left, -1) + ';', '}',
			'</style>\n'].join('\n'));
			ddsmoothmenu.ie9shadow = function(){}; //becomes empty function after running once
		}; //end Scripted CSS Patch
		var jqheight = $.fn.height, jqwidth = $.fn.width; //begin jQuery Patch for IE 9+ .height() and .width()
		$.extend($.fn, {
			height: function(){
				var obj = this.get(0);
				if(this.length < 1 || arguments.length || obj === window || obj === document){
					return jqheight.apply(this, arguments);
				}
				return parseFloat(document.defaultView.getComputedStyle(obj, null).getPropertyValue('height'));
			},
			innerHeight: function(){
				if(this.length < 1){return null;}
				var val = this.height(), obj = this.get(0), getter = document.defaultView.getComputedStyle(obj, null);
				val += parseInt(getter.getPropertyValue('padding-top'));
				val += parseInt(getter.getPropertyValue('padding-bottom'));
				return val;
			},
			outerHeight: function(bool){
				if(this.length < 1){return null;}
				var val = this.innerHeight(), obj = this.get(0), getter = document.defaultView.getComputedStyle(obj, null);
				val += parseInt(getter.getPropertyValue('border-top-width'));
				val += parseInt(getter.getPropertyValue('border-bottom-width'));
				if(bool){
					val += parseInt(getter.getPropertyValue('margin-top'));
					val += parseInt(getter.getPropertyValue('margin-bottom'));
				}
				return val;
			},
			width: function(){
				var obj = this.get(0);
				if(this.length < 1 || arguments.length || obj === window || obj === document){
					return jqwidth.apply(this, arguments);
				}
				return parseFloat(document.defaultView.getComputedStyle(obj, null).getPropertyValue('width'));
			},
			innerWidth: function(){
				if(this.length < 1){return null;}
				var val = this.width(), obj = this.get(0), getter = document.defaultView.getComputedStyle(obj, null);
				val += parseInt(getter.getPropertyValue('padding-right'));
				val += parseInt(getter.getPropertyValue('padding-left'));
				return val;
			},
			outerWidth: function(bool){
				if(this.length < 1){return null;}
				var val = this.innerWidth(), obj = this.get(0), getter = document.defaultView.getComputedStyle(obj, null);
				val += parseInt(getter.getPropertyValue('border-right-width'));
				val += parseInt(getter.getPropertyValue('border-left-width'));
				if(bool){
					val += parseInt(getter.getPropertyValue('margin-right'));
					val += parseInt(getter.getPropertyValue('margin-left'));
				}
				return val;
			}
		}); //end jQuery Patch for IE 9+ .height() and .width()
	})(jQuery);
}
//about - A Javascript Image filter library for the HTML5 Canvas tag. 
//author - https://github.com/arahaya/ImageFilters.js
//demo - http://www.arahaya.com/imagefilters/
var ImageFilters={};ImageFilters.utils={initSampleCanvas:function(){var t=document.createElement("canvas"),a=t.getContext("2d");t.width=0,t.height=0,this.getSampleCanvas=function(){return t},this.getSampleContext=function(){return a},this.createImageData=a.createImageData?function(t,e){return a.createImageData(t,e)}:function(t,a){return new ImageData(t,a)}},getSampleCanvas:function(){return this.initSampleCanvas(),this.getSampleCanvas()},getSampleContext:function(){return this.initSampleCanvas(),this.getSampleContext()},createImageData:function(t,a){return this.initSampleCanvas(),this.createImageData(t,a)},clamp:function(t){return t>255?255:0>t?0:t},buildMap:function(t){for(var a,e=[],i=0;256>i;i+=1)e[i]=(a=t(i))>255?255:0>a?0:0|a;return e},applyMap:function(t,a,e){for(var i=0,r=t.length;r>i;i+=4)a[i]=e[t[i]],a[i+1]=e[t[i+1]],a[i+2]=e[t[i+2]],a[i+3]=t[i+3]},mapRGB:function(t,a,e){this.applyMap(t,a,this.buildMap(e))},getPixelIndex:function(t,a,e,i,r){if(0>t||t>=e||0>a||a>=i)switch(r){case 1:t=0>t?0:t>=e?e-1:t,a=0>a?0:a>=i?i-1:a;break;case 2:t=(t%=e)<0?t+e:t,a=(a%=i)<0?a+i:a;break;default:return null}return a*e+t<<2},getPixel:function(t,a,e,i,r,n){if(0>a||a>=i||0>e||e>=r)switch(n){case 1:a=0>a?0:a>=i?i-1:a,e=0>e?0:e>=r?r-1:e;break;case 2:a=(a%=i)<0?a+i:a,e=(e%=r)<0?e+r:e;break;default:return 0}var h=e*i+a<<2;return t[h+3]<<24|t[h]<<16|t[h+1]<<8|t[h+2]},getPixelByIndex:function(t,a){return t[a+3]<<24|t[a]<<16|t[a+1]<<8|t[a+2]},copyBilinear:function(t,a,e,i,r,n,h,s){var l,u,o,g,f,c,d,m=0>a?a-1|0:0|a,I=0>e?e-1|0:0|e,v=a-m,F=e-I,p=0,w=0,D=0,x=0;if(m>=0&&i-1>m&&I>=0&&r-1>I){if(l=I*i+m<<2,!v&&!F)return n[h]=t[l],n[h+1]=t[l+1],n[h+2]=t[l+2],void(n[h+3]=t[l+3]);p=t[l+3]<<24|t[l]<<16|t[l+1]<<8|t[l+2],l+=4,w=t[l+3]<<24|t[l]<<16|t[l+1]<<8|t[l+2],l=l-8+(i<<2),D=t[l+3]<<24|t[l]<<16|t[l+1]<<8|t[l+2],l+=4,x=t[l+3]<<24|t[l]<<16|t[l+1]<<8|t[l+2]}else{if(p=this.getPixel(t,m,I,i,r,s),!v&&!F)return n[h]=p>>16&255,n[h+1]=p>>8&255,n[h+2]=255&p,void(n[h+3]=p>>24&255);w=this.getPixel(t,m+1,I,i,r,s),D=this.getPixel(t,m,I+1,i,r,s),x=this.getPixel(t,m+1,I+1,i,r,s)}u=1-v,o=1-F,g=((p>>16&255)*u+(w>>16&255)*v)*o+((D>>16&255)*u+(x>>16&255)*v)*F,f=((p>>8&255)*u+(w>>8&255)*v)*o+((D>>8&255)*u+(x>>8&255)*v)*F,c=((255&p)*u+(255&w)*v)*o+((255&D)*u+(255&x)*v)*F,d=((p>>24&255)*u+(w>>24&255)*v)*o+((D>>24&255)*u+(x>>24&255)*v)*F,n[h]=g>255?255:0>g?0:0|g,n[h+1]=f>255?255:0>f?0:0|f,n[h+2]=c>255?255:0>c?0:0|c,n[h+3]=d>255?255:0>d?0:0|d},rgbToHsl:function(t,a,e){t/=255,a/=255,e/=255;var i=t>a?t>e?t:e:a>e?a:e,r=a>t?e>t?t:e:e>a?a:e,n=i-r,h=0,s=0,l=(r+i)/2;return 0!==n&&(h=t===i?(a-e)/n+(e>a?6:0):a===i?(e-t)/n+2:(t-a)/n+4,h/=6,s=l>.5?n/(2-i-r):n/(i+r)),[h,s,l]},hslToRgb:function(t,a,e){var i,r,n,h,s,l,u=[];if(0===a)h=s=l=255*e+.5|0,u=[h,s,l];else{r=.5>=e?e*(a+1):e+a-e*a,i=2*e-r,n=t+1/3;for(var o,g=0;3>g;g+=1)0>n?n+=1:n>1&&(n-=1),o=1>6*n?i+(r-i)*n*6:1>2*n?r:2>3*n?i+(r-i)*(2/3-n)*6:i,u[g]=255*o+.5|0,n-=1/3}return u}},ImageFilters.Translate=function(t,a,e,i){},ImageFilters.Scale=function(t,a,e,i){},ImageFilters.Rotate=function(t,a,e,i,r,n){},ImageFilters.Affine=function(t,a,e,i){},ImageFilters.UnsharpMask=function(t,a){},ImageFilters.ConvolutionFilter=function(t,a,e,i,r,n,h,s,l,u){var o=t.data,g=t.width,f=t.height,c=(o.length,this.utils.createImageData(g,f)),d=c.data;r=r||1,n=n||0,h!==!1&&(h=!0),s!==!1&&(s=!0),l=l||0,u=u||0;for(var m=0,I=a>>1,v=e>>1,F=l>>16&255,p=l>>8&255,w=255&l,D=255*u,x=0;f>x;x+=1)for(var C=0;g>C;C+=1,m+=4){for(var b,B=0,M=0,S=0,R=0,y=!1,G=0,P=-I;I>=P;P+=1){var k,T=x+P;T>=0&&f>T?k=T*g:s?k=x*g:y=!0;for(var z=-v;v>=z;z+=1){var E=i[G++];if(0!==E){var N=C+z;if(N>=0&&g>N||(s?N=C:y=!0),y)B+=E*F,M+=E*p,S+=E*w,R+=E*D;else{var A=k+N<<2;B+=E*o[A],M+=E*o[A+1],S+=E*o[A+2],R+=E*o[A+3]}}}}d[m]=(b=B/r+n)>255?255:0>b?0:0|b,d[m+1]=(b=M/r+n)>255?255:0>b?0:0|b,d[m+2]=(b=S/r+n)>255?255:0>b?0:0|b,d[m+3]=h?o[m+3]:(b=R/r+n)>255?255:0>b?0:0|b}return c},ImageFilters.Binarize=function(t,a){var e=t.data,i=t.width,r=t.height,n=e.length,h=this.utils.createImageData(i,r),s=h.data;isNaN(a)&&(a=.5),a*=255;for(var l=0;n>l;l+=4){var u=e[l]+e[l+1]+e[l+2]/3;s[l]=s[l+1]=s[l+2]=a>=u?0:255,s[l+3]=255}return h},ImageFilters.BlendAdd=function(t,a,e,i){for(var r,n=t.data,h=t.width,s=t.height,l=n.length,u=this.utils.createImageData(h,s),o=u.data,g=a.data,f=0;l>f;f+=4)o[f]=(r=n[f]+g[f])>255?255:r,o[f+1]=(r=n[f+1]+g[f+1])>255?255:r,o[f+2]=(r=n[f+2]+g[f+2])>255?255:r,o[f+3]=255;return u},ImageFilters.BlendSubtract=function(t,a,e,i){for(var r,n=t.data,h=t.width,s=t.height,l=n.length,u=this.utils.createImageData(h,s),o=u.data,g=a.data,f=0;l>f;f+=4)o[f]=(r=n[f]-g[f])<0?0:r,o[f+1]=(r=n[f+1]-g[f+1])<0?0:r,o[f+2]=(r=n[f+2]-g[f+2])<0?0:r,o[f+3]=255;return u},ImageFilters.BoxBlur=function(){var t=function(t,a,e,i,r){var n,h,s,l,u,o,g,f,c,d,m,I,v,F,p=2*r+1,w=r+1,D=e-1,x=0,C=[];for(c=0,d=256*p;d>c;c+=1)C[c]=c/p|0;for(I=0;i>I;I+=1){for(n=h=s=l=0,u=I,o=x<<2,n+=w*t[o],h+=w*t[o+1],s+=w*t[o+2],l+=w*t[o+3],c=1;r>=c;c+=1)o=x+(e>c?c:D)<<2,n+=t[o],h+=t[o+1],s+=t[o+2],l+=t[o+3];for(m=0;e>m;m+=1)o=u<<2,a[o]=C[n],a[o+1]=C[h],a[o+2]=C[s],a[o+3]=C[l],v=m+w,v>D&&(v=D),F=m-r,0>F&&(F=0),g=x+v<<2,f=x+F<<2,n+=t[g]-t[f],h+=t[g+1]-t[f+1],s+=t[g+2]-t[f+2],l+=t[g+3]-t[f+3],u+=i;x+=e}};return function(a,e,i,r){for(var n=a.data,h=a.width,s=a.height,l=(n.length,this.utils.createImageData(h,s)),u=l.data,o=this.utils.createImageData(h,s),g=o.data,f=0;r>f;f+=1)t(f?u:n,g,h,s,e),t(g,u,s,h,i);return l}}(),ImageFilters.GaussianBlur=function(t,a){var e,i,r;switch(a){case 2:e=5,i=[1,1,2,1,1,1,2,4,2,1,2,4,8,4,2,1,2,4,2,1,1,1,2,1,1],r=52;break;case 3:e=7,i=[1,1,2,2,2,1,1,1,2,2,4,2,2,1,2,2,4,8,4,2,2,2,4,8,16,8,4,2,2,2,4,8,4,2,2,1,2,2,4,2,2,1,1,1,2,2,2,1,1],r=140;break;case 4:e=15,i=[2,2,3,4,5,5,6,6,6,5,5,4,3,2,2,2,3,4,5,7,7,8,8,8,7,7,5,4,3,2,3,4,6,7,9,10,10,11,10,10,9,7,6,4,3,4,5,7,9,10,12,13,13,13,12,10,9,7,5,4,5,7,9,11,13,14,15,16,15,14,13,11,9,7,5,5,7,10,12,14,16,17,18,17,16,14,12,10,7,5,6,8,10,13,15,17,19,19,19,17,15,13,10,8,6,6,8,11,13,16,18,19,20,19,18,16,13,11,8,6,6,8,10,13,15,17,19,19,19,17,15,13,10,8,6,5,7,10,12,14,16,17,18,17,16,14,12,10,7,5,5,7,9,11,13,14,15,16,15,14,13,11,9,7,5,4,5,7,9,10,12,13,13,13,12,10,9,7,5,4,3,4,6,7,9,10,10,11,10,10,9,7,6,4,3,2,3,4,5,7,7,8,8,8,7,7,5,4,3,2,2,2,3,4,5,5,6,6,6,5,5,4,3,2,2],r=2044;break;default:e=3,i=[1,2,1,2,4,2,1,2,1],r=16}return this.ConvolutionFilter(t,e,e,i,r,0,!1)},ImageFilters.StackBlur=function(){function t(){this.r=0,this.g=0,this.b=0,this.a=0,this.next=null}var a=[512,512,456,512,328,456,335,512,405,328,271,456,388,335,292,512,454,405,364,328,298,271,496,456,420,388,360,335,312,292,273,512,482,454,428,405,383,364,345,328,312,298,284,271,259,496,475,456,437,420,404,388,374,360,347,335,323,312,302,292,282,273,265,512,497,482,468,454,441,428,417,405,394,383,373,364,354,345,337,328,320,312,305,298,291,284,278,271,265,259,507,496,485,475,465,456,446,437,428,420,412,404,396,388,381,374,367,360,354,347,341,335,329,323,318,312,307,302,297,292,287,282,278,273,269,265,261,512,505,497,489,482,475,468,461,454,447,441,435,428,422,417,411,405,399,394,389,383,378,373,368,364,359,354,350,345,341,337,332,328,324,320,316,312,309,305,301,298,294,291,287,284,281,278,274,271,268,265,262,259,257,507,501,496,491,485,480,475,470,465,460,456,451,446,442,437,433,428,424,420,416,412,408,404,400,396,392,388,385,381,377,374,370,367,363,360,357,354,350,347,344,341,338,335,332,329,326,323,320,318,315,312,310,307,304,302,299,297,294,292,289,287,285,282,280,278,275,273,271,269,267,265,263,261,259],e=[9,11,12,13,13,14,14,15,15,15,15,16,16,16,16,17,17,17,17,17,17,17,18,18,18,18,18,18,18,18,18,19,19,19,19,19,19,19,19,19,19,19,19,19,19,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24];return function(i,r){var n,h,s,l,u,o,g,f,c,d,m,I,v,F,p,w,D,x,C,b,B,M,S,R,y,G,P,k=i.data,T=i.width,z=i.height,E=(k.length,this.Clone(i)),N=E.data,A=r+r+1,H=T-1,O=z-1,j=r+1,q=j*(j+1)/2,L=new t,U=L,J=a[r],K=e[r];for(s=1;A>s;s+=1)U=U.next=new t,s==j&&(P=U);for(U.next=L,g=o=0,h=0;z>h;h+=1){for(w=D=x=C=f=c=d=m=0,I=j*(b=N[o]),v=j*(B=N[o+1]),F=j*(M=N[o+2]),p=j*(S=N[o+3]),f+=q*b,c+=q*B,d+=q*M,m+=q*S,U=L,s=0;j>s;s+=1)U.r=b,U.g=B,U.b=M,U.a=S,U=U.next;for(s=1;j>s;s+=1)l=o+((s>H?H:s)<<2),f+=(U.r=b=N[l])*(R=j-s),c+=(U.g=B=N[l+1])*R,d+=(U.b=M=N[l+2])*R,m+=(U.a=S=N[l+3])*R,w+=b,D+=B,x+=M,C+=S,U=U.next;for(y=L,G=P,n=0;T>n;n+=1)N[o]=f*J>>K,N[o+1]=c*J>>K,N[o+2]=d*J>>K,N[o+3]=m*J>>K,f-=I,c-=v,d-=F,m-=p,I-=y.r,v-=y.g,F-=y.b,p-=y.a,l=g+((l=n+r+1)<H?l:H)<<2,w+=y.r=N[l],D+=y.g=N[l+1],x+=y.b=N[l+2],C+=y.a=N[l+3],f+=w,c+=D,d+=x,m+=C,y=y.next,I+=b=G.r,v+=B=G.g,F+=M=G.b,p+=S=G.a,w-=b,D-=B,x-=M,C-=S,G=G.next,o+=4;g+=T}for(n=0;T>n;n+=1){for(D=x=C=w=c=d=m=f=0,o=n<<2,I=j*(b=N[o]),v=j*(B=N[o+1]),F=j*(M=N[o+2]),p=j*(S=N[o+3]),f+=q*b,c+=q*B,d+=q*M,m+=q*S,U=L,s=0;j>s;s+=1)U.r=b,U.g=B,U.b=M,U.a=S,U=U.next;for(u=T,s=1;r>=s;s+=1)o=u+n<<2,f+=(U.r=b=N[o])*(R=j-s),c+=(U.g=B=N[o+1])*R,d+=(U.b=M=N[o+2])*R,m+=(U.a=S=N[o+3])*R,w+=b,D+=B,x+=M,C+=S,U=U.next,O>s&&(u+=T);for(o=n,y=L,G=P,h=0;z>h;h+=1)l=o<<2,N[l]=f*J>>K,N[l+1]=c*J>>K,N[l+2]=d*J>>K,N[l+3]=m*J>>K,f-=I,c-=v,d-=F,m-=p,I-=y.r,v-=y.g,F-=y.b,p-=y.a,l=n+((l=h+j)<O?l:O)*T<<2,f+=w+=y.r=N[l],c+=D+=y.g=N[l+1],d+=x+=y.b=N[l+2],m+=C+=y.a=N[l+3],y=y.next,I+=b=G.r,v+=B=G.g,F+=M=G.b,p+=S=G.a,w-=b,D-=B,x-=M,C-=S,G=G.next,o+=T}return E}}(),ImageFilters.Brightness=function(t,a){var e=t.data,i=t.width,r=t.height,n=(e.length,this.utils.createImageData(i,r)),h=n.data;return this.utils.mapRGB(e,h,function(t){return t+=a,t>255?255:t}),n},ImageFilters.BrightnessContrastGimp=function(t,a,e){var i=t.data,r=t.width,n=t.height,h=i.length,s=this.utils.createImageData(r,n),l=s.data,u=Math.PI/4;a/=100,e*=.99,e/=100,e=Math.tan((e+1)*u);for(var o=0,g=0;h>g;g+=4)o+=19595*i[g]+38470*i[g+1]+7471*i[g+2]>>16;return o/=h/4,this.utils.mapRGB(i,l,function(t){return 0>a?t*=1+a:a>0&&(t+=(255-t)*a),0!==e&&(t=(t-o)*e+o),t+.5|0}),s},ImageFilters.BrightnessContrastPhotoshop=function(t,a,e){var i=t.data,r=t.width,n=t.height,h=(i.length,this.utils.createImageData(r,n)),s=h.data;return a=(a+100)/100,e=(e+100)/100,this.utils.mapRGB(i,s,function(t){return t*=a,t=(t-127.5)*e+127.5,t+.5|0}),h},ImageFilters.Channels=function(t,a){var e;switch(a){case 2:e=[0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,1,0];break;case 3:e=[0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,1,0];break;default:e=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,1,0]}return this.ColorMatrixFilter(t,e)},ImageFilters.Clone=function(t){return this.Copy(t,this.utils.createImageData(t.width,t.height))},ImageFilters.CloneBuiltin=function(t){var a,e=t.width,i=t.height,r=this.utils.getSampleCanvas(),n=this.utils.getSampleContext();return r.width=e,r.height=i,n.putImageData(t,0,0),a=n.getImageData(0,0,e,i),r.width=0,r.height=0,a},ImageFilters.ColorMatrixFilter=function(t,a){var e,i,r,n,h,s,l=t.data,u=t.width,o=t.height,g=l.length,f=this.utils.createImageData(u,o),c=f.data,d=a[0],m=a[1],I=a[2],v=a[3],F=a[4],p=a[5],w=a[6],D=a[7],x=a[8],C=a[9],b=a[10],B=a[11],M=a[12],S=a[13],R=a[14],y=a[15],G=a[16],P=a[17],k=a[18],T=a[19];for(i=0;g>i;i+=4)r=l[i],n=l[i+1],h=l[i+2],s=l[i+3],c[i]=(e=r*d+n*m+h*I+s*v+F)>255?255:0>e?0:0|e,c[i+1]=(e=r*p+n*w+h*D+s*x+C)>255?255:0>e?0:0|e,c[i+2]=(e=r*b+n*B+h*M+s*S+R)>255?255:0>e?0:0|e,c[i+3]=(e=r*y+n*G+h*P+s*k+T)>255?255:0>e?0:0|e;return f},ImageFilters.ColorTransformFilter=function(t,a,e,i,r,n,h,s,l){var u,o,g=t.data,f=t.width,c=t.height,d=g.length,m=this.utils.createImageData(f,c),I=m.data;for(u=0;d>u;u+=4)I[u]=(o=g[u]*a+n)>255?255:0>o?0:o,I[u+1]=(o=g[u+1]*e+h)>255?255:0>o?0:o,I[u+2]=(o=g[u+2]*i+s)>255?255:0>o?0:o,I[u+3]=(o=g[u+3]*r+l)>255?255:0>o?0:o;return m},ImageFilters.Copy=function(t,a){for(var e=t.data,i=e.length,r=a.data;i--;)r[i]=e[i];return a},ImageFilters.Crop=function(t,a,e,i,r){var n,h,s,l,u=t.data,o=t.width,g=t.height,f=(u.length,this.utils.createImageData(i,r)),c=f.data,d=Math.max(a,0),m=Math.max(e,0),I=Math.min(a+i,o),v=Math.min(e+r,g),F=d-a,p=m-e;for(n=m,dstRow=p;v>n;n+=1,dstRow+=1)for(h=d,dstCol=F;I>h;h+=1,dstCol+=1)s=n*o+h<<2,l=dstRow*i+dstCol<<2,c[l]=u[s],c[l+1]=u[s+1],c[l+2]=u[s+2],c[l+3]=u[s+3];return f},ImageFilters.CropBuiltin=function(t,a,e,i,r){var n=t.width,h=t.height,s=this.utils.getSampleCanvas(),l=this.utils.getSampleContext();s.width=n,s.height=h,l.putImageData(t,0,0);var u=l.getImageData(a,e,i,r);return s.width=0,s.height=0,u},ImageFilters.Desaturate=function(t){for(var a=t.data,e=t.width,i=t.height,r=a.length,n=this.utils.createImageData(e,i),h=n.data,s=0;r>s;s+=4){var l=a[s],u=a[s+1],o=a[s+2],g=l>u?l>o?l:o:u>o?u:o,f=u>l?o>l?l:o:o>u?u:o,c=(g+f)/2+.5|0;h[s]=h[s+1]=h[s+2]=c,h[s+3]=a[s+3]}return n},ImageFilters.DisplacementMapFilter=function(t,a,e,i,r,n,h,s,l){var u=t.data,o=t.width,g=t.height,f=(u.length,ImageFilters.Clone(t)),c=f.data;e||(e=0),i||(i=0),r||(r=0),n||(n=0),h||(h=0),s||(s=0),l||(l=2);var d,m,I,v,F,p,w,D,x,C=a.width,b=a.height,B=a.data,M=C+e,S=b+i;for(D=0;o>D;D+=1)for(x=0;g>x;x+=1)d=x*o+D<<2,e>D||i>x||D>=M||x>=S?m=d:(I=(x-i)*C+(D-e)<<2,v=B[I+r],p=D+((v-128)*h>>8),F=B[I+n],w=x+((F-128)*s>>8),m=ImageFilters.utils.getPixelIndex(p+.5|0,w+.5|0,o,g,l),null===m&&(m=d)),c[d]=u[m],c[d+1]=u[m+1],c[d+2]=u[m+2],c[d+3]=u[m+3];return f},ImageFilters.Dither=function(t,a){var e=t.width,i=t.height,r=this.Clone(t),n=r.data;a=2>a?2:a>255?255:a;var h,s,l=[],u=a-1,o=0,g=0;for(s=0;a>s;s+=1)l[s]=255*s/u;h=this.utils.buildMap(function(t){var e=l[o];return g+=a,g>255&&(g-=255,o+=1),e});var f,c,d,m,I,v,F,p,w,D,x,C,b,B,M,S=e-1,R=i-1,y=7/16,G=3/16,P=5/16,k=1/16;for(c=0;i>c;c+=1)for(f=0;e>f;f+=1)d=c*e+f<<2,m=n[d],I=n[d+1],v=n[d+2],F=h[m],p=h[I],w=h[v],n[d]=F,n[d+1]=p,n[d+2]=w,D=m-F,x=I-p,C=v-w,d+=4,S>f&&(b=n[d]+y*D,B=n[d+1]+y*x,M=n[d+2]+y*C,n[d]=b>255?255:0>b?0:0|b,n[d+1]=B>255?255:0>B?0:0|B,n[d+2]=M>255?255:0>M?0:0|M),d+=e-2<<2,f>0&&R>c&&(b=n[d]+G*D,B=n[d+1]+G*x,M=n[d+2]+G*C,n[d]=b>255?255:0>b?0:0|b,n[d+1]=B>255?255:0>B?0:0|B,n[d+2]=M>255?255:0>M?0:0|M),d+=4,R>c&&(b=n[d]+P*D,B=n[d+1]+P*x,M=n[d+2]+P*C,n[d]=b>255?255:0>b?0:0|b,n[d+1]=B>255?255:0>B?0:0|B,n[d+2]=M>255?255:0>M?0:0|M),d+=4,S>f&&R>c&&(b=n[d]+k*D,B=n[d+1]+k*x,M=n[d+2]+k*C,n[d]=b>255?255:0>b?0:0|b,n[d+1]=B>255?255:0>B?0:0|B,n[d+2]=M>255?255:0>M?0:0|M);return r},ImageFilters.Edge=function(t){return this.ConvolutionFilter(t,3,3,[-1,-1,-1,-1,8,-1,-1,-1,-1])},ImageFilters.Emboss=function(t){return this.ConvolutionFilter(t,3,3,[-2,-1,0,-1,1,1,0,1,2])},ImageFilters.Enrich=function(t){return this.ConvolutionFilter(t,3,3,[0,-2,0,-2,20,-2,0,-2,0],10,-40)},ImageFilters.Flip=function(t,a){var e,i,r,n,h=t.data,s=t.width,l=t.height,u=(h.length,this.utils.createImageData(s,l)),o=u.data;for(i=0;l>i;i+=1)for(e=0;s>e;e+=1)r=i*s+e<<2,n=a?(l-i-1)*s+e<<2:i*s+(s-e-1)<<2,o[n]=h[r],o[n+1]=h[r+1],o[n+2]=h[r+2],o[n+3]=h[r+3];return u},ImageFilters.Gamma=function(t,a){var e=t.data,i=t.width,r=t.height,n=(e.length,this.utils.createImageData(i,r)),h=n.data;return this.utils.mapRGB(e,h,function(t){return t=255*Math.pow(t/255,1/a)+.5,t>255?255:t+.5|0}),n},ImageFilters.GrayScale=function(t){for(var a=t.data,e=t.width,i=t.height,r=a.length,n=this.utils.createImageData(e,i),h=n.data,s=0;r>s;s+=4){var l=19595*a[s]+38470*a[s+1]+7471*a[s+2]>>16;h[s]=h[s+1]=h[s+2]=l,h[s+3]=a[s+3]}return n},ImageFilters.HSLAdjustment=function(t,a,e,i){var r=t.data,n=t.width,h=t.height,s=r.length,l=this.utils.createImageData(n,h),u=l.data;a/=360,e/=100,i/=100;var o,g,f,c,d,m,I=this.utils.rgbToHsl,v=this.utils.hslToRgb;for(m=0;s>m;m+=4){for(c=I(r[m],r[m+1],r[m+2]),o=c[0]+a;0>o;)o+=1;for(;o>1;)o-=1;g=c[1]+c[1]*e,0>g?g=0:g>1&&(g=1),f=c[2],i>0?f+=(1-f)*i:0>i&&(f+=f*i),d=v(o,g,f),u[m]=d[0],u[m+1]=d[1],u[m+2]=d[2],u[m+3]=r[m+3]}return l},ImageFilters.Invert=function(t){var a=t.data,e=t.width,i=t.height,r=(a.length,this.utils.createImageData(e,i)),n=r.data;return this.utils.mapRGB(a,n,function(t){return 255-t}),r},ImageFilters.Mosaic=function(t,a){var e,i,r,n,h,s,l,u,o,g,f,c,d,m,I,v=t.data,F=t.width,p=t.height,w=(v.length,this.utils.createImageData(F,p)),D=w.data,x=Math.ceil(F/a),C=Math.ceil(p/a);for(e=0;C>e;e+=1)for(h=e*a,s=h+a,s>p&&(s=p),i=0;x>i;i+=1){for(r=i*a,n=r+a,n>F&&(n=F),c=d=m=I=0,f=(n-r)*(s-h),u=h;s>u;u+=1)for(o=u*F,l=r;n>l;l+=1)g=o+l<<2,c+=v[g],d+=v[g+1],m+=v[g+2],I+=v[g+3];for(c=c/f+.5|0,d=d/f+.5|0,m=m/f+.5|0,I=I/f+.5|0,u=h;s>u;u+=1)for(o=u*F,l=r;n>l;l+=1)g=o+l<<2,D[g]=c,D[g+1]=d,D[g+2]=m,D[g+3]=I}return w},ImageFilters.Oil=function(t,a,e){var i,r,n,h,s,l,u,o,g,f,c,d,m,I,v,F,p,w,D=t.data,x=t.width,C=t.height,b=(D.length,this.utils.createImageData(x,C)),B=b.data,M=0,S=[],R=[],y=[],G=[],P=[],k=[];for(r=0;C>r;r+=1)for(i=0;x>i;i+=1){for(n=0;e>n;n+=1)S[n]=R[n]=y[n]=G[n]=P[n]=k[n]=0;for(h=-a;a>=h;h+=1)if(l=r+h,!(0>l||l>=C))for(o=l*x,s=-a;a>=s;s+=1)u=i+s,0>u||u>=x||(g=o+u<<2,f=D[g],c=D[g+1],d=D[g+2],m=f*e>>8,I=c*e>>8,v=d*e>>8,G[m]+=f,P[I]+=c,k[v]+=d,S[m]+=1,R[I]+=1,y[v]+=1);for(F=p=w=0,n=1;e>n;n+=1)S[n]>S[F]&&(F=n),R[n]>R[p]&&(p=n),y[n]>y[w]&&(w=n);B[M]=G[F]/S[F]|0,B[M+1]=P[p]/R[p]|0,B[M+2]=k[w]/y[w]|0,B[M+3]=D[M+3],M+=4}return b},ImageFilters.OpacityFilter=function(t,a){for(var e=t.data,i=t.width,r=t.height,n=e.length,h=this.utils.createImageData(i,r),s=h.data,l=0;n>l;l+=4)s[l]=e[l],s[l+1]=e[l+1],s[l+2]=e[l+2],s[l+3]=a;return h},ImageFilters.Posterize=function(t,a){var e=t.data,i=t.width,r=t.height,n=(e.length,this.utils.createImageData(i,r)),h=n.data;a=2>a?2:a>255?255:a;var s,l=[],u=a-1,o=0,g=0;for(s=0;a>s;s+=1)l[s]=255*s/u;return this.utils.mapRGB(e,h,function(t){var e=l[o];return g+=a,g>255&&(g-=255,o+=1),e}),n},ImageFilters.Rescale=function(t,a){var e=t.data,i=t.width,r=t.height,n=(e.length,this.utils.createImageData(i,r)),h=n.data;return this.utils.mapRGB(e,h,function(t){return t*=a,t>255?255:t+.5|0}),n},ImageFilters.ResizeNearestNeighbor=function(t,a,e){var i,r,n,h,s=t.data,l=t.width,u=t.height,o=(s.length,this.utils.createImageData(a,e)),g=o.data,f=l/a,c=u/e,d=0;for(n=0;e>n;n+=1)for(h=(n*c|0)*l,r=0;a>r;r+=1)i=h+r*f<<2,g[d]=s[i],g[d+1]=s[i+1],g[d+2]=s[i+2],g[d+3]=s[i+3],d+=4;return o},ImageFilters.Resize=function(t,a,e){var i,r,n=t.data,h=t.width,s=t.height,l=(n.length,this.utils.createImageData(a,e)),u=l.data,o=h/a,g=s/e,f=0;for(r=0;e>r;r+=1)for(i=0;a>i;i+=1)this.utils.copyBilinear(n,i*o,r*g,h,s,u,f,0),f+=4;return l},ImageFilters.ResizeBuiltin=function(t,a,e){var i,r=t.width,n=t.height,h=this.utils.getSampleCanvas(),s=this.utils.getSampleContext();return h.width=Math.max(r,a),h.height=Math.max(n,e),s.save(),s.putImageData(t,0,0),s.scale(a/r,e/n),s.drawImage(h,0,0),i=s.getImageData(0,0,a,e),s.restore(),h.width=0,h.height=0,i},ImageFilters.Sepia=function(t){var a,e,i,r,n,h=t.data,s=t.width,l=t.height,u=h.length,o=this.utils.createImageData(s,l),g=o.data;for(r=0;u>r;r+=4)a=h[r],e=h[r+1],i=h[r+2],g[r]=(n=.393*a+.769*e+.189*i)>255?255:0>n?0:n+.5|0,g[r+1]=(n=.349*a+.686*e+.168*i)>255?255:0>n?0:n+.5|0,g[r+2]=(n=.272*a+.534*e+.131*i)>255?255:0>n?0:n+.5|0,g[r+3]=h[r+3];return o},ImageFilters.Sharpen=function(t,a){return this.ConvolutionFilter(t,3,3,[-a/16,-a/8,-a/16,-a/8,.75*a+1,-a/8,-a/16,-a/8,-a/16])},ImageFilters.Solarize=function(t){var a=t.data,e=t.width,i=t.height,r=(a.length,this.utils.createImageData(e,i)),n=r.data;return this.utils.mapRGB(a,n,function(t){return t>127?2*(t-127.5):2*(127.5-t)}),r},ImageFilters.Transpose=function(t){var a,e,i=t.data,r=t.width,n=t.height,h=(i.length,this.utils.createImageData(n,r)),s=h.data;for(y=0;y<n;y+=1)for(x=0;x<r;x+=1)a=y*r+x<<2,e=x*n+y<<2,s[e]=i[a],s[e+1]=i[a+1],s[e+2]=i[a+2],s[e+3]=i[a+3];return h},ImageFilters.Twril=function(t,a,e,i,r,n,h){var s=t.data,l=t.width,u=t.height,o=(s.length,this.utils.createImageData(l,u)),g=o.data;a=l*a,e=u*e,r*=Math.PI/180;var f,c,d,m,I,v,F,p,w,D=i*i,x=0;for(c=0;u>c;c+=1)for(f=0;l>f;f+=1)d=f-a,m=c-e,I=d*d+m*m,I>D?(g[x]=s[x],g[x+1]=s[x+1],g[x+2]=s[x+2],g[x+3]=s[x+3]):(I=Math.sqrt(I),v=Math.atan2(m,d)+r*(i-I)/i,F=a+I*Math.cos(v),p=e+I*Math.sin(v),h?this.utils.copyBilinear(s,F,p,l,u,g,x,n):(w=(p+.5|0)*l+(F+.5|0)<<2,g[x]=s[w],g[x+1]=s[w+1],g[x+2]=s[w+2],g[x+3]=s[w+3])),x+=4;return o};
//http://ricardocabello.com/blog/post/689
var sketchy_brush = {
	context: null,
	prevMouseX: null,
	prevMouseY: null,
	points: null,
	count: null,
	init: function (a) {
		this.context = a;
		this.context.globalCompositeOperation = "source-over";
		this.points = new Array();
		this.count = 0
	},
	destroy: function () {
	},
	strokeStart: function (b, a) {
		this.prevMouseX = b;
		this.prevMouseY = a
	},
	stroke: function (color_rgb, f, c, size) {
		var e, b, a, g;
		this.points.push([f, c]);
		this.context.strokeStyle = "rgba(" + color_rgb.r + ', ' + color_rgb.g + ', ' + color_rgb.b + ", 0.1)";
		this.context.beginPath();
		this.context.moveTo(this.prevMouseX, this.prevMouseY);
		this.context.lineTo(f, c);
		this.context.stroke();
		this.context.strokeStyle = "rgba(" + color_rgb.r + ', ' + color_rgb.g + ', ' + color_rgb.b + ", 0.1 )";
		for (e = 0; e < this.points.length; e++) {
			b = this.points[e][0] - this.points[this.count][0];
			a = this.points[e][1] - this.points[this.count][1];
			g = b * b + a * a;
			if (g < 800 * size && Math.random() > g / (400 * size)) {
				this.context.beginPath();
				this.context.moveTo(this.points[this.count][0] + (b * 0.3), this.points[this.count][1] + (a * 0.3));
				this.context.lineTo(this.points[e][0] - (b * 0.3), this.points[e][1] - (a * 0.3));
				this.context.stroke();
			}
		}
		this.prevMouseX = f;
		this.prevMouseY = c;
		this.count++
	},
	strokeEnd: function (b, a) {
	}
};
var shaded_brush = {
	context: null,
	prevMouseX: null,
	prevMouseY: null,
	points: null,
	count: null,
	init: function (a) {
		this.context = a;
		this.context.globalCompositeOperation = "source-over";
		this.points = new Array();
		this.count = 0
	},
	destroy: function () {
	},
	strokeStart: function (b, a) {
		this.prevMouseX = b;
		this.prevMouseY = a
	},
	stroke: function (color_rgb, f, c, size) {
		var e, b, a, g;
		this.points.push([f, c]);
		for (e = 0; e < this.points.length; e++) {
			b = this.points[e][0] - this.points[this.count][0];
			a = this.points[e][1] - this.points[this.count][1];
			g = b * b + a * a;
			if (g < 200 * size) {
				this.context.strokeStyle = "rgba(" + color_rgb.r + ', ' + color_rgb.g + ', ' + color_rgb.b + ", " + ((1 - (g / (200 * size))) * 0.1) + " )";
				this.context.beginPath();
				this.context.moveTo(this.points[this.count][0], this.points[this.count][1]);
				this.context.lineTo(this.points[e][0], this.points[e][1]);
				this.context.stroke()
			}
		}
		this.prevMouseX = f;
		this.prevMouseY = c;
		this.count++
	},
	strokeEnd: function (b, a) {
	}
};
var chrome_brush = {
	context: null,
	prevMouseX: null,
	prevMouseY: null,
	points: null,
	count: null,
	init: function (a) {
		this.context = a;
		this.points = new Array();
		this.count = 0
	},
	destroy: function () {
	},
	strokeStart: function (b, a) {
		this.prevMouseX = b;
		this.prevMouseY = a
	},
	stroke: function (color_rgb, f, c, size) {
		var e, b, a, g;
		this.points.push([f, c]);
		this.context.strokeStyle = "rgba(" + color_rgb.r + ', ' + color_rgb.g + ', ' + color_rgb.b + ", 0.1)";
		this.context.beginPath();
		this.context.moveTo(this.prevMouseX, this.prevMouseY);
		this.context.lineTo(f, c);
		this.context.stroke();
		for (e = 0; e < this.points.length; e++) {
			b = this.points[e][0] - this.points[this.count][0];
			a = this.points[e][1] - this.points[this.count][1];
			g = b * b + a * a;
			if (g < 200 * size) {
				this.context.strokeStyle = "rgba(" + Math.floor(Math.random() * 255) + ", " + Math.floor(Math.random() * 255) + ", " + Math.floor(Math.random() * 255) + ", 0.1 )";
				this.context.beginPath();
				this.context.moveTo(this.points[this.count][0] + (b * 0.2), this.points[this.count][1] + (a * 0.2));
				this.context.lineTo(this.points[e][0] - (b * 0.2), this.points[e][1] - (a * 0.2));
				this.context.stroke()
			}
		}
		this.prevMouseX = f;
		this.prevMouseY = c;
		this.count++
	},
	strokeEnd: function (b, a) {
	}
};

/* Copyright:
 *	Maxim Stepin - maxst@hiend3d.com
 *	Cameron Zemek - grom@zeminvaders.net
 *	Dominic Szablewski - mail@phoboslab.org
 * https://github.com/phoboslab/js-hqx
 * GNU Lesser General Public License.
 */
!function(a){"use strict";var e=null,c=null,s=65280,r=16711935,b=16711680,k=65280,t=255,n=3145728,i=1792,o=6,h=a.Math,u=function(a){var e=(16711680&a)>>16,c=(65280&a)>>8,s=255&a;return((.299*e+.587*c+.114*s|0)<<16)+((-.169*e-.331*c+.5*s+128|0)<<8)+(.5*e-.419*c-.081*s+128|0)},f=function(a,e){var c=u(a),s=u(e);return h.abs((c&b)-(s&b))>n||h.abs((c&k)-(s&k))>i||h.abs((c&t)-(s&t))>o},d=function(a,e,b){return e===b?void(c[a]=e):(c[a]=(3*(e&s)+(b&s)>>2&s)+(3*(e&r)+(b&r)>>2&r),void(c[a]|=4278190080&e))},g=function(a,e,b,k){c[a]=(((e&s)<<1)+(b&s)+(k&s)>>2&s)+(((e&r)<<1)+(b&r)+(k&r)>>2&r),c[a]|=4278190080&e},v=function(a,e,b){return e===b?void(c[a]=e):(c[a]=(7*(e&s)+(b&s)>>3&s)+(7*(e&r)+(b&r)>>3&r),void(c[a]|=4278190080&e))},w=function(a,e,b,k){c[a]=(((e&s)<<1)+7*(b&s)+7*(k&s)>>4&s)+(((e&r)<<1)+7*(b&r)+7*(k&r)>>4&r),c[a]|=4278190080&e},l=function(a,e,b){return e===b?void(c[a]=e):(c[a]=((e&s)+(b&s)>>1&s)+((e&r)+(b&r)>>1&r),void(c[a]|=4278190080&e))},m=function(a,e,b,k){c[a]=(5*(e&s)+((b&s)<<1)+(k&s)>>3&s)+(5*(e&r)+((b&r)<<1)+(k&r)>>3&r),c[a]|=4278190080&e},D=function(a,e,b,k){c[a]=(6*(e&s)+(b&s)+(k&s)>>3&s)+(6*(e&r)+(b&r)+(k&r)>>3&r),c[a]|=4278190080&e},I=function(a,e,b){return e===b?void(c[a]=e):(c[a]=(5*(e&s)+3*(b&s)>>3&s)+(5*(e&r)+3*(b&r)>>3&r),void(c[a]|=4278190080&e))},x=function(a,e,b,k){c[a]=(((e&s)<<1)+3*(b&s)+3*(k&s)>>3&s)+(((e&r)<<1)+3*(b&r)+3*(k&r)>>3&r),c[a]|=4278190080&e},C=function(a,e){var c=e.charAt(0).toUpperCase()+e.substr(1);return a[e]||a["ms"+c]||a["moz"+c]||a["webkit"+c]||a["o"+c]},H=function(a,e,c,s,r){var b=document.createElement("canvas"),k=b.getContext("2d"),t=C(k,"backingStorePixelRatio")||1;k.getImageDataHD=C(k,"getImageDataHD");var n=a.width/t,i=a.height/t;return b.width=Math.ceil(n),b.height=Math.ceil(i),k.drawImage(a,0,0,n,i),1===t?k.getImageData(e,c,s,r):k.getImageDataHD(e,c,s,r)};a.hqx=function(a,s){if(-1===[2,3,4].indexOf(s))return a;var r,b,k,t;a instanceof HTMLCanvasElement?(r=a,b=r.getContext("2d"),k=r,t=b.getImageData(0,0,r.width,r.height).data):(t=H(a,0,0,a.width,a.height).data,k=document.createElement("canvas"));for(var n,i=a.width*a.height,o=e=new Array(i),h=c=new Array(i*s*s),u=0;i>u;u++)o[u]=(t[(n=u<<2)+3]<<24)+(t[n+2]<<16)+(t[n+1]<<8)+t[n];2===s?M(a.width,a.height):3===s?A(a.width,a.height):4===s&&E(a.width,a.height),k.width=a.width*s,k.height=a.height*s;for(var f,d,g=k.getContext("2d"),v=g.getImageData(0,0,k.width,k.height),w=v.data,l=h.length,m=0;l>m;m++)d=(4278190080&(f=h[m]))>>24,w[(n=m<<2)+3]=0>d?d+256:0,w[n+2]=(16711680&f)>>16,w[n+1]=(65280&f)>>8,w[n]=255&f;return e=o=null,c=h=null,v};var M=function(a,s){var r,v,w,l,I,C,H,M=[],A=a<<1,E=0,p=0,y=f,q=h,z=u,L=d,O=g,P=m,R=D,S=x,T=e,U=c,j=b,B=k,F=t,G=n,J=i,K=o;for(v=0;s>v;v++){for(l=v>0?-a:0,I=s-1>v?a:0,r=0;a>r;r++){M[2]=T[p+l],M[5]=T[p],M[8]=T[p+I],r>0?(M[1]=T[p+l-1],M[4]=T[p-1],M[7]=T[p+I-1]):(M[1]=M[2],M[4]=M[5],M[7]=M[8]),a-1>r?(M[3]=T[p+l+1],M[6]=T[p+1],M[9]=T[p+I+1]):(M[3]=M[2],M[6]=M[5],M[9]=M[8]);var N=0,Q=1;for(C=z(M[5]),w=1;10>w;w++)5!==w&&(M[w]!==M[5]&&(H=z(M[w]),(q.abs((C&j)-(H&j))>G||q.abs((C&B)-(H&B))>J||q.abs((C&F)-(H&F))>K)&&(N|=Q)),Q<<=1);switch(N){case 0:case 1:case 4:case 32:case 128:case 5:case 132:case 160:case 33:case 129:case 36:case 133:case 164:case 161:case 37:case 165:O(E,M[5],M[4],M[2]),O(E+1,M[5],M[2],M[6]),O(E+A,M[5],M[8],M[4]),O(E+A+1,M[5],M[6],M[8]);break;case 2:case 34:case 130:case 162:O(E,M[5],M[1],M[4]),O(E+1,M[5],M[3],M[6]),O(E+A,M[5],M[8],M[4]),O(E+A+1,M[5],M[6],M[8]);break;case 16:case 17:case 48:case 49:O(E,M[5],M[4],M[2]),O(E+1,M[5],M[3],M[2]),O(E+A,M[5],M[8],M[4]),O(E+A+1,M[5],M[9],M[8]);break;case 64:case 65:case 68:case 69:O(E,M[5],M[4],M[2]),O(E+1,M[5],M[2],M[6]),O(E+A,M[5],M[7],M[4]),O(E+A+1,M[5],M[9],M[6]);break;case 8:case 12:case 136:case 140:O(E,M[5],M[1],M[2]),O(E+1,M[5],M[2],M[6]),O(E+A,M[5],M[7],M[8]),O(E+A+1,M[5],M[6],M[8]);break;case 3:case 35:case 131:case 163:L(E,M[5],M[4]),O(E+1,M[5],M[3],M[6]),O(E+A,M[5],M[8],M[4]),O(E+A+1,M[5],M[6],M[8]);break;case 6:case 38:case 134:case 166:O(E,M[5],M[1],M[4]),L(E+1,M[5],M[6]),O(E+A,M[5],M[8],M[4]),O(E+A+1,M[5],M[6],M[8]);break;case 20:case 21:case 52:case 53:O(E,M[5],M[4],M[2]),L(E+1,M[5],M[2]),O(E+A,M[5],M[8],M[4]),O(E+A+1,M[5],M[9],M[8]);break;case 144:case 145:case 176:case 177:O(E,M[5],M[4],M[2]),O(E+1,M[5],M[3],M[2]),O(E+A,M[5],M[8],M[4]),L(E+A+1,M[5],M[8]);break;case 192:case 193:case 196:case 197:O(E,M[5],M[4],M[2]),O(E+1,M[5],M[2],M[6]),O(E+A,M[5],M[7],M[4]),L(E+A+1,M[5],M[6]);break;case 96:case 97:case 100:case 101:O(E,M[5],M[4],M[2]),O(E+1,M[5],M[2],M[6]),L(E+A,M[5],M[4]),O(E+A+1,M[5],M[9],M[6]);break;case 40:case 44:case 168:case 172:O(E,M[5],M[1],M[2]),O(E+1,M[5],M[2],M[6]),L(E+A,M[5],M[8]),O(E+A+1,M[5],M[6],M[8]);break;case 9:case 13:case 137:case 141:L(E,M[5],M[2]),O(E+1,M[5],M[2],M[6]),O(E+A,M[5],M[7],M[8]),O(E+A+1,M[5],M[6],M[8]);break;case 18:case 50:O(E,M[5],M[1],M[4]),y(M[2],M[6])?L(E+1,M[5],M[3]):O(E+1,M[5],M[2],M[6]),O(E+A,M[5],M[8],M[4]),O(E+A+1,M[5],M[9],M[8]);break;case 80:case 81:O(E,M[5],M[4],M[2]),O(E+1,M[5],M[3],M[2]),O(E+A,M[5],M[7],M[4]),y(M[6],M[8])?L(E+A+1,M[5],M[9]):O(E+A+1,M[5],M[6],M[8]);break;case 72:case 76:O(E,M[5],M[1],M[2]),O(E+1,M[5],M[2],M[6]),y(M[8],M[4])?L(E+A,M[5],M[7]):O(E+A,M[5],M[8],M[4]),O(E+A+1,M[5],M[9],M[6]);break;case 10:case 138:y(M[4],M[2])?L(E,M[5],M[4]):O(E,M[5],M[4],M[2]),O(E+1,M[5],M[3],M[6]),O(E+A,M[5],M[7],M[8]),O(E+A+1,M[5],M[6],M[8]);break;case 66:O(E,M[5],M[1],M[4]),O(E+1,M[5],M[3],M[6]),O(E+A,M[5],M[7],M[4]),O(E+A+1,M[5],M[9],M[6]);break;case 24:O(E,M[5],M[1],M[2]),O(E+1,M[5],M[3],M[2]),O(E+A,M[5],M[7],M[8]),O(E+A+1,M[5],M[9],M[8]);break;case 7:case 39:case 135:L(E,M[5],M[4]),L(E+1,M[5],M[6]),O(E+A,M[5],M[8],M[4]),O(E+A+1,M[5],M[6],M[8]);break;case 148:case 149:case 180:O(E,M[5],M[4],M[2]),L(E+1,M[5],M[2]),O(E+A,M[5],M[8],M[4]),L(E+A+1,M[5],M[8]);break;case 224:case 228:case 225:O(E,M[5],M[4],M[2]),O(E+1,M[5],M[2],M[6]),L(E+A,M[5],M[4]),L(E+A+1,M[5],M[6]);break;case 41:case 169:case 45:L(E,M[5],M[2]),O(E+1,M[5],M[2],M[6]),L(E+A,M[5],M[8]),O(E+A+1,M[5],M[6],M[8]);break;case 22:case 54:O(E,M[5],M[1],M[4]),y(M[2],M[6])?U[E+1]=M[5]:O(E+1,M[5],M[2],M[6]),O(E+A,M[5],M[8],M[4]),O(E+A+1,M[5],M[9],M[8]);break;case 208:case 209:O(E,M[5],M[4],M[2]),O(E+1,M[5],M[3],M[2]),O(E+A,M[5],M[7],M[4]),y(M[6],M[8])?U[E+A+1]=M[5]:O(E+A+1,M[5],M[6],M[8]);break;case 104:case 108:O(E,M[5],M[1],M[2]),O(E+1,M[5],M[2],M[6]),y(M[8],M[4])?U[E+A]=M[5]:O(E+A,M[5],M[8],M[4]),O(E+A+1,M[5],M[9],M[6]);break;case 11:case 139:y(M[4],M[2])?U[E]=M[5]:O(E,M[5],M[4],M[2]),O(E+1,M[5],M[3],M[6]),O(E+A,M[5],M[7],M[8]),O(E+A+1,M[5],M[6],M[8]);break;case 19:case 51:y(M[2],M[6])?(L(E,M[5],M[4]),L(E+1,M[5],M[3])):(P(E,M[5],M[2],M[4]),S(E+1,M[5],M[2],M[6])),O(E+A,M[5],M[8],M[4]),O(E+A+1,M[5],M[9],M[8]);break;case 146:case 178:O(E,M[5],M[1],M[4]),y(M[2],M[6])?(L(E+1,M[5],M[3]),L(E+A+1,M[5],M[8])):(S(E+1,M[5],M[2],M[6]),P(E+A+1,M[5],M[6],M[8])),O(E+A,M[5],M[8],M[4]);break;case 84:case 85:O(E,M[5],M[4],M[2]),y(M[6],M[8])?(L(E+1,M[5],M[2]),L(E+A+1,M[5],M[9])):(P(E+1,M[5],M[6],M[2]),S(E+A+1,M[5],M[6],M[8])),O(E+A,M[5],M[7],M[4]);break;case 112:case 113:O(E,M[5],M[4],M[2]),O(E+1,M[5],M[3],M[2]),y(M[6],M[8])?(L(E+A,M[5],M[4]),L(E+A+1,M[5],M[9])):(P(E+A,M[5],M[8],M[4]),S(E+A+1,M[5],M[6],M[8]));break;case 200:case 204:O(E,M[5],M[1],M[2]),O(E+1,M[5],M[2],M[6]),y(M[8],M[4])?(L(E+A,M[5],M[7]),L(E+A+1,M[5],M[6])):(S(E+A,M[5],M[8],M[4]),P(E+A+1,M[5],M[8],M[6]));break;case 73:case 77:y(M[8],M[4])?(L(E,M[5],M[2]),L(E+A,M[5],M[7])):(P(E,M[5],M[4],M[2]),S(E+A,M[5],M[8],M[4])),O(E+1,M[5],M[2],M[6]),O(E+A+1,M[5],M[9],M[6]);break;case 42:case 170:y(M[4],M[2])?(L(E,M[5],M[4]),L(E+A,M[5],M[8])):(S(E,M[5],M[4],M[2]),P(E+A,M[5],M[4],M[8])),O(E+1,M[5],M[3],M[6]),O(E+A+1,M[5],M[6],M[8]);break;case 14:case 142:y(M[4],M[2])?(L(E,M[5],M[4]),L(E+1,M[5],M[6])):(S(E,M[5],M[4],M[2]),P(E+1,M[5],M[2],M[6])),O(E+A,M[5],M[7],M[8]),O(E+A+1,M[5],M[6],M[8]);break;case 67:L(E,M[5],M[4]),O(E+1,M[5],M[3],M[6]),O(E+A,M[5],M[7],M[4]),O(E+A+1,M[5],M[9],M[6]);break;case 70:O(E,M[5],M[1],M[4]),L(E+1,M[5],M[6]),O(E+A,M[5],M[7],M[4]),O(E+A+1,M[5],M[9],M[6]);break;case 28:O(E,M[5],M[1],M[2]),L(E+1,M[5],M[2]),O(E+A,M[5],M[7],M[8]),O(E+A+1,M[5],M[9],M[8]);break;case 152:O(E,M[5],M[1],M[2]),O(E+1,M[5],M[3],M[2]),O(E+A,M[5],M[7],M[8]),L(E+A+1,M[5],M[8]);break;case 194:O(E,M[5],M[1],M[4]),O(E+1,M[5],M[3],M[6]),O(E+A,M[5],M[7],M[4]),L(E+A+1,M[5],M[6]);break;case 98:O(E,M[5],M[1],M[4]),O(E+1,M[5],M[3],M[6]),L(E+A,M[5],M[4]),O(E+A+1,M[5],M[9],M[6]);break;case 56:O(E,M[5],M[1],M[2]),O(E+1,M[5],M[3],M[2]),L(E+A,M[5],M[8]),O(E+A+1,M[5],M[9],M[8]);break;case 25:L(E,M[5],M[2]),O(E+1,M[5],M[3],M[2]),O(E+A,M[5],M[7],M[8]),O(E+A+1,M[5],M[9],M[8]);break;case 26:case 31:y(M[4],M[2])?U[E]=M[5]:O(E,M[5],M[4],M[2]),y(M[2],M[6])?U[E+1]=M[5]:O(E+1,M[5],M[2],M[6]),O(E+A,M[5],M[7],M[8]),O(E+A+1,M[5],M[9],M[8]);break;case 82:case 214:O(E,M[5],M[1],M[4]),y(M[2],M[6])?U[E+1]=M[5]:O(E+1,M[5],M[2],M[6]),O(E+A,M[5],M[7],M[4]),y(M[6],M[8])?U[E+A+1]=M[5]:O(E+A+1,M[5],M[6],M[8]);break;case 88:case 248:O(E,M[5],M[1],M[2]),O(E+1,M[5],M[3],M[2]),y(M[8],M[4])?U[E+A]=M[5]:O(E+A,M[5],M[8],M[4]),y(M[6],M[8])?U[E+A+1]=M[5]:O(E+A+1,M[5],M[6],M[8]);break;case 74:case 107:y(M[4],M[2])?U[E]=M[5]:O(E,M[5],M[4],M[2]),O(E+1,M[5],M[3],M[6]),y(M[8],M[4])?U[E+A]=M[5]:O(E+A,M[5],M[8],M[4]),O(E+A+1,M[5],M[9],M[6]);break;case 27:y(M[4],M[2])?U[E]=M[5]:O(E,M[5],M[4],M[2]),L(E+1,M[5],M[3]),O(E+A,M[5],M[7],M[8]),O(E+A+1,M[5],M[9],M[8]);break;case 86:O(E,M[5],M[1],M[4]),y(M[2],M[6])?U[E+1]=M[5]:O(E+1,M[5],M[2],M[6]),O(E+A,M[5],M[7],M[4]),L(E+A+1,M[5],M[9]);break;case 216:O(E,M[5],M[1],M[2]),O(E+1,M[5],M[3],M[2]),L(E+A,M[5],M[7]),y(M[6],M[8])?U[E+A+1]=M[5]:O(E+A+1,M[5],M[6],M[8]);break;case 106:L(E,M[5],M[4]),O(E+1,M[5],M[3],M[6]),y(M[8],M[4])?U[E+A]=M[5]:O(E+A,M[5],M[8],M[4]),O(E+A+1,M[5],M[9],M[6]);break;case 30:L(E,M[5],M[4]),y(M[2],M[6])?U[E+1]=M[5]:O(E+1,M[5],M[2],M[6]),O(E+A,M[5],M[7],M[8]),O(E+A+1,M[5],M[9],M[8]);break;case 210:O(E,M[5],M[1],M[4]),L(E+1,M[5],M[3]),O(E+A,M[5],M[7],M[4]),y(M[6],M[8])?U[E+A+1]=M[5]:O(E+A+1,M[5],M[6],M[8]);break;case 120:O(E,M[5],M[1],M[2]),O(E+1,M[5],M[3],M[2]),y(M[8],M[4])?U[E+A]=M[5]:O(E+A,M[5],M[8],M[4]),L(E+A+1,M[5],M[9]);break;case 75:y(M[4],M[2])?U[E]=M[5]:O(E,M[5],M[4],M[2]),O(E+1,M[5],M[3],M[6]),L(E+A,M[5],M[7]),O(E+A+1,M[5],M[9],M[6]);break;case 29:L(E,M[5],M[2]),L(E+1,M[5],M[2]),O(E+A,M[5],M[7],M[8]),O(E+A+1,M[5],M[9],M[8]);break;case 198:O(E,M[5],M[1],M[4]),L(E+1,M[5],M[6]),O(E+A,M[5],M[7],M[4]),L(E+A+1,M[5],M[6]);break;case 184:O(E,M[5],M[1],M[2]),O(E+1,M[5],M[3],M[2]),L(E+A,M[5],M[8]),L(E+A+1,M[5],M[8]);break;case 99:L(E,M[5],M[4]),O(E+1,M[5],M[3],M[6]),L(E+A,M[5],M[4]),O(E+A+1,M[5],M[9],M[6]);break;case 57:L(E,M[5],M[2]),O(E+1,M[5],M[3],M[2]),L(E+A,M[5],M[8]),O(E+A+1,M[5],M[9],M[8]);break;case 71:L(E,M[5],M[4]),L(E+1,M[5],M[6]),O(E+A,M[5],M[7],M[4]),O(E+A+1,M[5],M[9],M[6]);break;case 156:O(E,M[5],M[1],M[2]),L(E+1,M[5],M[2]),O(E+A,M[5],M[7],M[8]),L(E+A+1,M[5],M[8]);break;case 226:O(E,M[5],M[1],M[4]),O(E+1,M[5],M[3],M[6]),L(E+A,M[5],M[4]),L(E+A+1,M[5],M[6]);break;case 60:O(E,M[5],M[1],M[2]),L(E+1,M[5],M[2]),L(E+A,M[5],M[8]),O(E+A+1,M[5],M[9],M[8]);break;case 195:L(E,M[5],M[4]),O(E+1,M[5],M[3],M[6]),O(E+A,M[5],M[7],M[4]),L(E+A+1,M[5],M[6]);break;case 102:O(E,M[5],M[1],M[4]),L(E+1,M[5],M[6]),L(E+A,M[5],M[4]),O(E+A+1,M[5],M[9],M[6]);break;case 153:L(E,M[5],M[2]),O(E+1,M[5],M[3],M[2]),O(E+A,M[5],M[7],M[8]),L(E+A+1,M[5],M[8]);break;case 58:y(M[4],M[2])?L(E,M[5],M[4]):R(E,M[5],M[4],M[2]),y(M[2],M[6])?L(E+1,M[5],M[3]):R(E+1,M[5],M[2],M[6]),L(E+A,M[5],M[8]),O(E+A+1,M[5],M[9],M[8]);break;case 83:L(E,M[5],M[4]),y(M[2],M[6])?L(E+1,M[5],M[3]):R(E+1,M[5],M[2],M[6]),O(E+A,M[5],M[7],M[4]),y(M[6],M[8])?L(E+A+1,M[5],M[9]):R(E+A+1,M[5],M[6],M[8]);break;case 92:O(E,M[5],M[1],M[2]),L(E+1,M[5],M[2]),y(M[8],M[4])?L(E+A,M[5],M[7]):R(E+A,M[5],M[8],M[4]),y(M[6],M[8])?L(E+A+1,M[5],M[9]):R(E+A+1,M[5],M[6],M[8]);break;case 202:y(M[4],M[2])?L(E,M[5],M[4]):R(E,M[5],M[4],M[2]),O(E+1,M[5],M[3],M[6]),y(M[8],M[4])?L(E+A,M[5],M[7]):R(E+A,M[5],M[8],M[4]),L(E+A+1,M[5],M[6]);break;case 78:y(M[4],M[2])?L(E,M[5],M[4]):R(E,M[5],M[4],M[2]),L(E+1,M[5],M[6]),y(M[8],M[4])?L(E+A,M[5],M[7]):R(E+A,M[5],M[8],M[4]),O(E+A+1,M[5],M[9],M[6]);break;case 154:y(M[4],M[2])?L(E,M[5],M[4]):R(E,M[5],M[4],M[2]),y(M[2],M[6])?L(E+1,M[5],M[3]):R(E+1,M[5],M[2],M[6]),O(E+A,M[5],M[7],M[8]),L(E+A+1,M[5],M[8]);break;case 114:O(E,M[5],M[1],M[4]),y(M[2],M[6])?L(E+1,M[5],M[3]):R(E+1,M[5],M[2],M[6]),L(E+A,M[5],M[4]),y(M[6],M[8])?L(E+A+1,M[5],M[9]):R(E+A+1,M[5],M[6],M[8]);break;case 89:L(E,M[5],M[2]),O(E+1,M[5],M[3],M[2]),y(M[8],M[4])?L(E+A,M[5],M[7]):R(E+A,M[5],M[8],M[4]),y(M[6],M[8])?L(E+A+1,M[5],M[9]):R(E+A+1,M[5],M[6],M[8]);break;case 90:y(M[4],M[2])?L(E,M[5],M[4]):R(E,M[5],M[4],M[2]),y(M[2],M[6])?L(E+1,M[5],M[3]):R(E+1,M[5],M[2],M[6]),y(M[8],M[4])?L(E+A,M[5],M[7]):R(E+A,M[5],M[8],M[4]),y(M[6],M[8])?L(E+A+1,M[5],M[9]):R(E+A+1,M[5],M[6],M[8]);break;case 55:case 23:y(M[2],M[6])?(L(E,M[5],M[4]),U[E+1]=M[5]):(P(E,M[5],M[2],M[4]),S(E+1,M[5],M[2],M[6])),O(E+A,M[5],M[8],M[4]),O(E+A+1,M[5],M[9],M[8]);break;case 182:case 150:O(E,M[5],M[1],M[4]),y(M[2],M[6])?(U[E+1]=M[5],L(E+A+1,M[5],M[8])):(S(E+1,M[5],M[2],M[6]),P(E+A+1,M[5],M[6],M[8])),O(E+A,M[5],M[8],M[4]);break;case 213:case 212:O(E,M[5],M[4],M[2]),y(M[6],M[8])?(L(E+1,M[5],M[2]),U[E+A+1]=M[5]):(P(E+1,M[5],M[6],M[2]),S(E+A+1,M[5],M[6],M[8])),O(E+A,M[5],M[7],M[4]);break;case 241:case 240:O(E,M[5],M[4],M[2]),O(E+1,M[5],M[3],M[2]),y(M[6],M[8])?(L(E+A,M[5],M[4]),U[E+A+1]=M[5]):(P(E+A,M[5],M[8],M[4]),S(E+A+1,M[5],M[6],M[8]));break;case 236:case 232:O(E,M[5],M[1],M[2]),O(E+1,M[5],M[2],M[6]),y(M[8],M[4])?(U[E+A]=M[5],L(E+A+1,M[5],M[6])):(S(E+A,M[5],M[8],M[4]),P(E+A+1,M[5],M[8],M[6]));break;case 109:case 105:y(M[8],M[4])?(L(E,M[5],M[2]),U[E+A]=M[5]):(P(E,M[5],M[4],M[2]),S(E+A,M[5],M[8],M[4])),O(E+1,M[5],M[2],M[6]),O(E+A+1,M[5],M[9],M[6]);break;case 171:case 43:y(M[4],M[2])?(U[E]=M[5],L(E+A,M[5],M[8])):(S(E,M[5],M[4],M[2]),P(E+A,M[5],M[4],M[8])),O(E+1,M[5],M[3],M[6]),O(E+A+1,M[5],M[6],M[8]);break;case 143:case 15:y(M[4],M[2])?(U[E]=M[5],L(E+1,M[5],M[6])):(S(E,M[5],M[4],M[2]),P(E+1,M[5],M[2],M[6])),O(E+A,M[5],M[7],M[8]),O(E+A+1,M[5],M[6],M[8]);break;case 124:O(E,M[5],M[1],M[2]),L(E+1,M[5],M[2]),y(M[8],M[4])?U[E+A]=M[5]:O(E+A,M[5],M[8],M[4]),L(E+A+1,M[5],M[9]);break;case 203:y(M[4],M[2])?U[E]=M[5]:O(E,M[5],M[4],M[2]),O(E+1,M[5],M[3],M[6]),L(E+A,M[5],M[7]),L(E+A+1,M[5],M[6]);break;case 62:L(E,M[5],M[4]),y(M[2],M[6])?U[E+1]=M[5]:O(E+1,M[5],M[2],M[6]),L(E+A,M[5],M[8]),O(E+A+1,M[5],M[9],M[8]);break;case 211:L(E,M[5],M[4]),L(E+1,M[5],M[3]),O(E+A,M[5],M[7],M[4]),y(M[6],M[8])?U[E+A+1]=M[5]:O(E+A+1,M[5],M[6],M[8]);break;case 118:O(E,M[5],M[1],M[4]),y(M[2],M[6])?U[E+1]=M[5]:O(E+1,M[5],M[2],M[6]),L(E+A,M[5],M[4]),L(E+A+1,M[5],M[9]);break;case 217:L(E,M[5],M[2]),O(E+1,M[5],M[3],M[2]),L(E+A,M[5],M[7]),y(M[6],M[8])?U[E+A+1]=M[5]:O(E+A+1,M[5],M[6],M[8]);break;case 110:L(E,M[5],M[4]),L(E+1,M[5],M[6]),y(M[8],M[4])?U[E+A]=M[5]:O(E+A,M[5],M[8],M[4]),O(E+A+1,M[5],M[9],M[6]);break;case 155:y(M[4],M[2])?U[E]=M[5]:O(E,M[5],M[4],M[2]),L(E+1,M[5],M[3]),O(E+A,M[5],M[7],M[8]),L(E+A+1,M[5],M[8]);break;case 188:O(E,M[5],M[1],M[2]),L(E+1,M[5],M[2]),L(E+A,M[5],M[8]),L(E+A+1,M[5],M[8]);break;case 185:L(E,M[5],M[2]),O(E+1,M[5],M[3],M[2]),L(E+A,M[5],M[8]),L(E+A+1,M[5],M[8]);break;case 61:L(E,M[5],M[2]),L(E+1,M[5],M[2]),L(E+A,M[5],M[8]),O(E+A+1,M[5],M[9],M[8]);break;case 157:L(E,M[5],M[2]),L(E+1,M[5],M[2]),O(E+A,M[5],M[7],M[8]),L(E+A+1,M[5],M[8]);break;case 103:L(E,M[5],M[4]),L(E+1,M[5],M[6]),L(E+A,M[5],M[4]),O(E+A+1,M[5],M[9],M[6]);break;case 227:L(E,M[5],M[4]),O(E+1,M[5],M[3],M[6]),L(E+A,M[5],M[4]),L(E+A+1,M[5],M[6]);break;case 230:O(E,M[5],M[1],M[4]),L(E+1,M[5],M[6]),L(E+A,M[5],M[4]),L(E+A+1,M[5],M[6]);break;case 199:L(E,M[5],M[4]),L(E+1,M[5],M[6]),O(E+A,M[5],M[7],M[4]),L(E+A+1,M[5],M[6]);break;case 220:O(E,M[5],M[1],M[2]),L(E+1,M[5],M[2]),y(M[8],M[4])?L(E+A,M[5],M[7]):R(E+A,M[5],M[8],M[4]),y(M[6],M[8])?U[E+A+1]=M[5]:O(E+A+1,M[5],M[6],M[8]);break;case 158:y(M[4],M[2])?L(E,M[5],M[4]):R(E,M[5],M[4],M[2]),y(M[2],M[6])?U[E+1]=M[5]:O(E+1,M[5],M[2],M[6]),O(E+A,M[5],M[7],M[8]),L(E+A+1,M[5],M[8]);break;case 234:y(M[4],M[2])?L(E,M[5],M[4]):R(E,M[5],M[4],M[2]),O(E+1,M[5],M[3],M[6]),y(M[8],M[4])?U[E+A]=M[5]:O(E+A,M[5],M[8],M[4]),L(E+A+1,M[5],M[6]);break;case 242:O(E,M[5],M[1],M[4]),y(M[2],M[6])?L(E+1,M[5],M[3]):R(E+1,M[5],M[2],M[6]),L(E+A,M[5],M[4]),y(M[6],M[8])?U[E+A+1]=M[5]:O(E+A+1,M[5],M[6],M[8]);break;case 59:y(M[4],M[2])?U[E]=M[5]:O(E,M[5],M[4],M[2]),y(M[2],M[6])?L(E+1,M[5],M[3]):R(E+1,M[5],M[2],M[6]),L(E+A,M[5],M[8]),O(E+A+1,M[5],M[9],M[8]);break;case 121:L(E,M[5],M[2]),O(E+1,M[5],M[3],M[2]),y(M[8],M[4])?U[E+A]=M[5]:O(E+A,M[5],M[8],M[4]),y(M[6],M[8])?L(E+A+1,M[5],M[9]):R(E+A+1,M[5],M[6],M[8]);break;case 87:L(E,M[5],M[4]),y(M[2],M[6])?U[E+1]=M[5]:O(E+1,M[5],M[2],M[6]),O(E+A,M[5],M[7],M[4]),y(M[6],M[8])?L(E+A+1,M[5],M[9]):R(E+A+1,M[5],M[6],M[8]);break;case 79:y(M[4],M[2])?U[E]=M[5]:O(E,M[5],M[4],M[2]),L(E+1,M[5],M[6]),y(M[8],M[4])?L(E+A,M[5],M[7]):R(E+A,M[5],M[8],M[4]),O(E+A+1,M[5],M[9],M[6]);break;case 122:y(M[4],M[2])?L(E,M[5],M[4]):R(E,M[5],M[4],M[2]),y(M[2],M[6])?L(E+1,M[5],M[3]):R(E+1,M[5],M[2],M[6]),y(M[8],M[4])?U[E+A]=M[5]:O(E+A,M[5],M[8],M[4]),y(M[6],M[8])?L(E+A+1,M[5],M[9]):R(E+A+1,M[5],M[6],M[8]);break;case 94:y(M[4],M[2])?L(E,M[5],M[4]):R(E,M[5],M[4],M[2]),y(M[2],M[6])?U[E+1]=M[5]:O(E+1,M[5],M[2],M[6]),y(M[8],M[4])?L(E+A,M[5],M[7]):R(E+A,M[5],M[8],M[4]),y(M[6],M[8])?L(E+A+1,M[5],M[9]):R(E+A+1,M[5],M[6],M[8]);break;case 218:y(M[4],M[2])?L(E,M[5],M[4]):R(E,M[5],M[4],M[2]),y(M[2],M[6])?L(E+1,M[5],M[3]):R(E+1,M[5],M[2],M[6]),y(M[8],M[4])?L(E+A,M[5],M[7]):R(E+A,M[5],M[8],M[4]),y(M[6],M[8])?U[E+A+1]=M[5]:O(E+A+1,M[5],M[6],M[8]);break;case 91:y(M[4],M[2])?U[E]=M[5]:O(E,M[5],M[4],M[2]),y(M[2],M[6])?L(E+1,M[5],M[3]):R(E+1,M[5],M[2],M[6]),y(M[8],M[4])?L(E+A,M[5],M[7]):R(E+A,M[5],M[8],M[4]),y(M[6],M[8])?L(E+A+1,M[5],M[9]):R(E+A+1,M[5],M[6],M[8]);break;case 229:O(E,M[5],M[4],M[2]),O(E+1,M[5],M[2],M[6]),L(E+A,M[5],M[4]),L(E+A+1,M[5],M[6]);break;case 167:L(E,M[5],M[4]),L(E+1,M[5],M[6]),O(E+A,M[5],M[8],M[4]),O(E+A+1,M[5],M[6],M[8]);break;case 173:L(E,M[5],M[2]),O(E+1,M[5],M[2],M[6]),L(E+A,M[5],M[8]),O(E+A+1,M[5],M[6],M[8]);break;case 181:O(E,M[5],M[4],M[2]),L(E+1,M[5],M[2]),O(E+A,M[5],M[8],M[4]),L(E+A+1,M[5],M[8]);break;case 186:y(M[4],M[2])?L(E,M[5],M[4]):R(E,M[5],M[4],M[2]),y(M[2],M[6])?L(E+1,M[5],M[3]):R(E+1,M[5],M[2],M[6]),L(E+A,M[5],M[8]),L(E+A+1,M[5],M[8]);break;case 115:L(E,M[5],M[4]),y(M[2],M[6])?L(E+1,M[5],M[3]):R(E+1,M[5],M[2],M[6]),L(E+A,M[5],M[4]),y(M[6],M[8])?L(E+A+1,M[5],M[9]):R(E+A+1,M[5],M[6],M[8]);break;case 93:L(E,M[5],M[2]),L(E+1,M[5],M[2]),y(M[8],M[4])?L(E+A,M[5],M[7]):R(E+A,M[5],M[8],M[4]),y(M[6],M[8])?L(E+A+1,M[5],M[9]):R(E+A+1,M[5],M[6],M[8]);break;case 206:y(M[4],M[2])?L(E,M[5],M[4]):R(E,M[5],M[4],M[2]),L(E+1,M[5],M[6]),y(M[8],M[4])?L(E+A,M[5],M[7]):R(E+A,M[5],M[8],M[4]),L(E+A+1,M[5],M[6]);break;case 205:case 201:L(E,M[5],M[2]),O(E+1,M[5],M[2],M[6]),y(M[8],M[4])?L(E+A,M[5],M[7]):R(E+A,M[5],M[8],M[4]),L(E+A+1,M[5],M[6]);break;case 174:case 46:y(M[4],M[2])?L(E,M[5],M[4]):R(E,M[5],M[4],M[2]),L(E+1,M[5],M[6]),L(E+A,M[5],M[8]),O(E+A+1,M[5],M[6],M[8]);break;case 179:case 147:L(E,M[5],M[4]),y(M[2],M[6])?L(E+1,M[5],M[3]):R(E+1,M[5],M[2],M[6]),O(E+A,M[5],M[8],M[4]),L(E+A+1,M[5],M[8]);break;case 117:case 116:O(E,M[5],M[4],M[2]),L(E+1,M[5],M[2]),L(E+A,M[5],M[4]),y(M[6],M[8])?L(E+A+1,M[5],M[9]):R(E+A+1,M[5],M[6],M[8]);break;case 189:L(E,M[5],M[2]),L(E+1,M[5],M[2]),L(E+A,M[5],M[8]),L(E+A+1,M[5],M[8]);break;case 231:L(E,M[5],M[4]),L(E+1,M[5],M[6]),L(E+A,M[5],M[4]),L(E+A+1,M[5],M[6]);break;case 126:L(E,M[5],M[4]),y(M[2],M[6])?U[E+1]=M[5]:O(E+1,M[5],M[2],M[6]),y(M[8],M[4])?U[E+A]=M[5]:O(E+A,M[5],M[8],M[4]),L(E+A+1,M[5],M[9]);break;case 219:y(M[4],M[2])?U[E]=M[5]:O(E,M[5],M[4],M[2]),L(E+1,M[5],M[3]),L(E+A,M[5],M[7]),y(M[6],M[8])?U[E+A+1]=M[5]:O(E+A+1,M[5],M[6],M[8]);break;case 125:y(M[8],M[4])?(L(E,M[5],M[2]),U[E+A]=M[5]):(P(E,M[5],M[4],M[2]),S(E+A,M[5],M[8],M[4])),L(E+1,M[5],M[2]),L(E+A+1,M[5],M[9]);break;case 221:L(E,M[5],M[2]),y(M[6],M[8])?(L(E+1,M[5],M[2]),U[E+A+1]=M[5]):(P(E+1,M[5],M[6],M[2]),S(E+A+1,M[5],M[6],M[8])),L(E+A,M[5],M[7]);break;case 207:y(M[4],M[2])?(U[E]=M[5],L(E+1,M[5],M[6])):(S(E,M[5],M[4],M[2]),P(E+1,M[5],M[2],M[6])),L(E+A,M[5],M[7]),L(E+A+1,M[5],M[6]);break;case 238:L(E,M[5],M[4]),L(E+1,M[5],M[6]),y(M[8],M[4])?(U[E+A]=M[5],L(E+A+1,M[5],M[6])):(S(E+A,M[5],M[8],M[4]),P(E+A+1,M[5],M[8],M[6]));break;case 190:L(E,M[5],M[4]),y(M[2],M[6])?(U[E+1]=M[5],L(E+A+1,M[5],M[8])):(S(E+1,M[5],M[2],M[6]),P(E+A+1,M[5],M[6],M[8])),L(E+A,M[5],M[8]);break;case 187:y(M[4],M[2])?(U[E]=M[5],L(E+A,M[5],M[8])):(S(E,M[5],M[4],M[2]),P(E+A,M[5],M[4],M[8])),L(E+1,M[5],M[3]),L(E+A+1,M[5],M[8]);break;case 243:L(E,M[5],M[4]),L(E+1,M[5],M[3]),y(M[6],M[8])?(L(E+A,M[5],M[4]),U[E+A+1]=M[5]):(P(E+A,M[5],M[8],M[4]),S(E+A+1,M[5],M[6],M[8]));break;case 119:y(M[2],M[6])?(L(E,M[5],M[4]),U[E+1]=M[5]):(P(E,M[5],M[2],M[4]),S(E+1,M[5],M[2],M[6])),L(E+A,M[5],M[4]),L(E+A+1,M[5],M[9]);break;case 237:case 233:L(E,M[5],M[2]),O(E+1,M[5],M[2],M[6]),y(M[8],M[4])?U[E+A]=M[5]:L(E+A,M[5],M[7]),L(E+A+1,M[5],M[6]);break;case 175:case 47:y(M[4],M[2])?U[E]=M[5]:L(E,M[5],M[4]),L(E+1,M[5],M[6]),L(E+A,M[5],M[8]),O(E+A+1,M[5],M[6],M[8]);break;case 183:case 151:L(E,M[5],M[4]),y(M[2],M[6])?U[E+1]=M[5]:L(E+1,M[5],M[3]),O(E+A,M[5],M[8],M[4]),L(E+A+1,M[5],M[8]);break;case 245:case 244:O(E,M[5],M[4],M[2]),L(E+1,M[5],M[2]),L(E+A,M[5],M[4]),y(M[6],M[8])?U[E+A+1]=M[5]:L(E+A+1,M[5],M[9]);break;case 250:L(E,M[5],M[4]),L(E+1,M[5],M[3]),y(M[8],M[4])?U[E+A]=M[5]:O(E+A,M[5],M[8],M[4]),y(M[6],M[8])?U[E+A+1]=M[5]:O(E+A+1,M[5],M[6],M[8]);break;case 123:y(M[4],M[2])?U[E]=M[5]:O(E,M[5],M[4],M[2]),L(E+1,M[5],M[3]),y(M[8],M[4])?U[E+A]=M[5]:O(E+A,M[5],M[8],M[4]),L(E+A+1,M[5],M[9]);break;case 95:y(M[4],M[2])?U[E]=M[5]:O(E,M[5],M[4],M[2]),y(M[2],M[6])?U[E+1]=M[5]:O(E+1,M[5],M[2],M[6]),L(E+A,M[5],M[7]),L(E+A+1,M[5],M[9]);break;case 222:L(E,M[5],M[4]),y(M[2],M[6])?U[E+1]=M[5]:O(E+1,M[5],M[2],M[6]),L(E+A,M[5],M[7]),y(M[6],M[8])?U[E+A+1]=M[5]:O(E+A+1,M[5],M[6],M[8]);break;case 252:O(E,M[5],M[1],M[2]),L(E+1,M[5],M[2]),y(M[8],M[4])?U[E+A]=M[5]:O(E+A,M[5],M[8],M[4]),y(M[6],M[8])?U[E+A+1]=M[5]:L(E+A+1,M[5],M[9]);break;case 249:L(E,M[5],M[2]),O(E+1,M[5],M[3],M[2]),y(M[8],M[4])?U[E+A]=M[5]:L(E+A,M[5],M[7]),y(M[6],M[8])?U[E+A+1]=M[5]:O(E+A+1,M[5],M[6],M[8]);break;case 235:y(M[4],M[2])?U[E]=M[5]:O(E,M[5],M[4],M[2]),O(E+1,M[5],M[3],M[6]),y(M[8],M[4])?U[E+A]=M[5]:L(E+A,M[5],M[7]),L(E+A+1,M[5],M[6]);break;case 111:y(M[4],M[2])?U[E]=M[5]:L(E,M[5],M[4]),L(E+1,M[5],M[6]),y(M[8],M[4])?U[E+A]=M[5]:O(E+A,M[5],M[8],M[4]),O(E+A+1,M[5],M[9],M[6]);break;case 63:y(M[4],M[2])?U[E]=M[5]:L(E,M[5],M[4]),y(M[2],M[6])?U[E+1]=M[5]:O(E+1,M[5],M[2],M[6]),L(E+A,M[5],M[8]),O(E+A+1,M[5],M[9],M[8]);break;case 159:y(M[4],M[2])?U[E]=M[5]:O(E,M[5],M[4],M[2]),y(M[2],M[6])?U[E+1]=M[5]:L(E+1,M[5],M[3]),O(E+A,M[5],M[7],M[8]),L(E+A+1,M[5],M[8]);break;case 215:L(E,M[5],M[4]),y(M[2],M[6])?U[E+1]=M[5]:L(E+1,M[5],M[3]),O(E+A,M[5],M[7],M[4]),y(M[6],M[8])?U[E+A+1]=M[5]:O(E+A+1,M[5],M[6],M[8]);break;case 246:O(E,M[5],M[1],M[4]),y(M[2],M[6])?U[E+1]=M[5]:O(E+1,M[5],M[2],M[6]),L(E+A,M[5],M[4]),y(M[6],M[8])?U[E+A+1]=M[5]:L(E+A+1,M[5],M[9]);break;case 254:L(E,M[5],M[4]),y(M[2],M[6])?U[E+1]=M[5]:O(E+1,M[5],M[2],M[6]),y(M[8],M[4])?U[E+A]=M[5]:O(E+A,M[5],M[8],M[4]),y(M[6],M[8])?U[E+A+1]=M[5]:L(E+A+1,M[5],M[9]);break;case 253:L(E,M[5],M[2]),L(E+1,M[5],M[2]),y(M[8],M[4])?U[E+A]=M[5]:L(E+A,M[5],M[7]),y(M[6],M[8])?U[E+A+1]=M[5]:L(E+A+1,M[5],M[9]);break;case 251:y(M[4],M[2])?U[E]=M[5]:O(E,M[5],M[4],M[2]),L(E+1,M[5],M[3]),y(M[8],M[4])?U[E+A]=M[5]:L(E+A,M[5],M[7]),y(M[6],M[8])?U[E+A+1]=M[5]:O(E+A+1,M[5],M[6],M[8]);break;case 239:y(M[4],M[2])?U[E]=M[5]:L(E,M[5],M[4]),L(E+1,M[5],M[6]),y(M[8],M[4])?U[E+A]=M[5]:L(E+A,M[5],M[7]),L(E+A+1,M[5],M[6]);break;case 127:y(M[4],M[2])?U[E]=M[5]:L(E,M[5],M[4]),y(M[2],M[6])?U[E+1]=M[5]:O(E+1,M[5],M[2],M[6]),y(M[8],M[4])?U[E+A]=M[5]:O(E+A,M[5],M[8],M[4]),L(E+A+1,M[5],M[9]);break;case 191:y(M[4],M[2])?U[E]=M[5]:L(E,M[5],M[4]),y(M[2],M[6])?U[E+1]=M[5]:L(E+1,M[5],M[3]),L(E+A,M[5],M[8]),L(E+A+1,M[5],M[8]);break;case 223:y(M[4],M[2])?U[E]=M[5]:O(E,M[5],M[4],M[2]),y(M[2],M[6])?U[E+1]=M[5]:L(E+1,M[5],M[3]),L(E+A,M[5],M[7]),y(M[6],M[8])?U[E+A+1]=M[5]:O(E+A+1,M[5],M[6],M[8]);break;case 247:L(E,M[5],M[4]),y(M[2],M[6])?U[E+1]=M[5]:L(E+1,M[5],M[3]),L(E+A,M[5],M[4]),y(M[6],M[8])?U[E+A+1]=M[5]:L(E+A+1,M[5],M[9]);break;case 255:y(M[4],M[2])?U[E]=M[5]:L(E,M[5],M[4]),y(M[2],M[6])?U[E+1]=M[5]:L(E+1,M[5],M[3]),y(M[8],M[4])?U[E+A]=M[5]:L(E+A,M[5],M[7]),y(M[6],M[8])?U[E+A+1]=M[5]:L(E+A+1,M[5],M[9])}p++,E+=2}E+=A}},A=function(a,s){var r,m,D,I,x,C,H,M=[],A=3*a,E=0,p=0,y=f,q=h,z=u,L=d,O=g,P=v,R=w,S=l,T=e,U=c,j=b,B=k,F=t,G=n,J=i,K=o;for(m=0;s>m;m++){for(I=m>0?-a:0,x=s-1>m?a:0,r=0;a>r;r++){M[2]=T[p+I],M[5]=T[p],M[8]=T[p+x],r>0?(M[1]=T[p+I-1],M[4]=T[p-1],M[7]=T[p+x-1]):(M[1]=M[2],M[4]=M[5],M[7]=M[8]),a-1>r?(M[3]=T[p+I+1],M[6]=T[p+1],M[9]=T[p+x+1]):(M[3]=M[2],M[6]=M[5],M[9]=M[8]);var N=0,Q=1;for(C=z(M[5]),D=1;10>D;D++)5!==D&&(M[D]!==M[5]&&(H=z(M[D]),(q.abs((C&j)-(H&j))>G||q.abs((C&B)-(H&B))>J||q.abs((C&F)-(H&F))>K)&&(N|=Q)),Q<<=1);switch(N){case 0:case 1:case 4:case 32:case 128:case 5:case 132:case 160:case 33:case 129:case 36:case 133:case 164:case 161:case 37:case 165:O(E,M[5],M[4],M[2]),L(E+1,M[5],M[2]),O(E+2,M[5],M[2],M[6]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),O(E+(A<<1),M[5],M[8],M[4]),L(E+(A<<1)+1,M[5],M[8]),O(E+(A<<1)+2,M[5],M[6],M[8]);break;case 2:case 34:case 130:case 162:L(E,M[5],M[1]),U[E+1]=M[5],L(E+2,M[5],M[3]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),O(E+(A<<1),M[5],M[8],M[4]),L(E+(A<<1)+1,M[5],M[8]),O(E+(A<<1)+2,M[5],M[6],M[8]);break;case 16:case 17:case 48:case 49:O(E,M[5],M[4],M[2]),L(E+1,M[5],M[2]),L(E+2,M[5],M[3]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],U[E+A+2]=M[5],O(E+(A<<1),M[5],M[8],M[4]),L(E+(A<<1)+1,M[5],M[8]),L(E+(A<<1)+2,M[5],M[9]);break;case 64:case 65:case 68:case 69:O(E,M[5],M[4],M[2]),L(E+1,M[5],M[2]),O(E+2,M[5],M[2],M[6]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),L(E+(A<<1),M[5],M[7]),U[E+(A<<1)+1]=M[5],L(E+(A<<1)+2,M[5],M[9]);break;case 8:case 12:case 136:case 140:L(E,M[5],M[1]),L(E+1,M[5],M[2]),O(E+2,M[5],M[2],M[6]),U[E+A]=M[5],U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),L(E+(A<<1),M[5],M[7]),L(E+(A<<1)+1,M[5],M[8]),O(E+(A<<1)+2,M[5],M[6],M[8]);break;case 3:case 35:case 131:case 163:L(E,M[5],M[4]),U[E+1]=M[5],L(E+2,M[5],M[3]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),O(E+(A<<1),M[5],M[8],M[4]),L(E+(A<<1)+1,M[5],M[8]),O(E+(A<<1)+2,M[5],M[6],M[8]);break;case 6:case 38:case 134:case 166:L(E,M[5],M[1]),U[E+1]=M[5],L(E+2,M[5],M[6]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),O(E+(A<<1),M[5],M[8],M[4]),L(E+(A<<1)+1,M[5],M[8]),O(E+(A<<1)+2,M[5],M[6],M[8]);break;case 20:case 21:case 52:case 53:O(E,M[5],M[4],M[2]),L(E+1,M[5],M[2]),L(E+2,M[5],M[2]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],U[E+A+2]=M[5],O(E+(A<<1),M[5],M[8],M[4]),L(E+(A<<1)+1,M[5],M[8]),L(E+(A<<1)+2,M[5],M[9]);break;case 144:case 145:case 176:case 177:O(E,M[5],M[4],M[2]),L(E+1,M[5],M[2]),L(E+2,M[5],M[3]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],U[E+A+2]=M[5],O(E+(A<<1),M[5],M[8],M[4]),L(E+(A<<1)+1,M[5],M[8]),L(E+(A<<1)+2,M[5],M[8]);break;case 192:case 193:case 196:case 197:O(E,M[5],M[4],M[2]),L(E+1,M[5],M[2]),O(E+2,M[5],M[2],M[6]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),L(E+(A<<1),M[5],M[7]),U[E+(A<<1)+1]=M[5],L(E+(A<<1)+2,M[5],M[6]);break;case 96:case 97:case 100:case 101:O(E,M[5],M[4],M[2]),L(E+1,M[5],M[2]),O(E+2,M[5],M[2],M[6]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),L(E+(A<<1),M[5],M[4]),U[E+(A<<1)+1]=M[5],L(E+(A<<1)+2,M[5],M[9]);break;case 40:case 44:case 168:case 172:L(E,M[5],M[1]),L(E+1,M[5],M[2]),O(E+2,M[5],M[2],M[6]),U[E+A]=M[5],U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),L(E+(A<<1),M[5],M[8]),L(E+(A<<1)+1,M[5],M[8]),O(E+(A<<1)+2,M[5],M[6],M[8]);break;case 9:case 13:case 137:case 141:L(E,M[5],M[2]),L(E+1,M[5],M[2]),O(E+2,M[5],M[2],M[6]),U[E+A]=M[5],U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),L(E+(A<<1),M[5],M[7]),L(E+(A<<1)+1,M[5],M[8]),O(E+(A<<1)+2,M[5],M[6],M[8]);break;case 18:case 50:L(E,M[5],M[1]),y(M[2],M[6])?(U[E+1]=M[5],L(E+2,M[5],M[3]),U[E+A+2]=M[5]):(P(E+1,M[5],M[2]),R(E+2,M[5],M[2],M[6]),P(E+A+2,M[5],M[6])),L(E+A,M[5],M[4]),U[E+A+1]=M[5],O(E+(A<<1),M[5],M[8],M[4]),L(E+(A<<1)+1,M[5],M[8]),L(E+(A<<1)+2,M[5],M[9]);break;case 80:case 81:O(E,M[5],M[4],M[2]),L(E+1,M[5],M[2]),L(E+2,M[5],M[3]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],L(E+(A<<1),M[5],M[7]),y(M[6],M[8])?(U[E+A+2]=M[5],U[E+(A<<1)+1]=M[5],L(E+(A<<1)+2,M[5],M[9])):(P(E+A+2,M[5],M[6]),P(E+(A<<1)+1,M[5],M[8]),R(E+(A<<1)+2,M[5],M[6],M[8]));break;case 72:case 76:L(E,M[5],M[1]),L(E+1,M[5],M[2]),O(E+2,M[5],M[2],M[6]),U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),y(M[8],M[4])?(U[E+A]=M[5],L(E+(A<<1),M[5],M[7]),U[E+(A<<1)+1]=M[5]):(P(E+A,M[5],M[4]),R(E+(A<<1),M[5],M[8],M[4]),P(E+(A<<1)+1,M[5],M[8])),L(E+(A<<1)+2,M[5],M[9]);break;case 10:case 138:y(M[4],M[2])?(L(E,M[5],M[1]),U[E+1]=M[5],U[E+A]=M[5]):(R(E,M[5],M[4],M[2]),P(E+1,M[5],M[2]),P(E+A,M[5],M[4])),L(E+2,M[5],M[3]),U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),L(E+(A<<1),M[5],M[7]),L(E+(A<<1)+1,M[5],M[8]),O(E+(A<<1)+2,M[5],M[6],M[8]);break;case 66:L(E,M[5],M[1]),U[E+1]=M[5],L(E+2,M[5],M[3]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),L(E+(A<<1),M[5],M[7]),U[E+(A<<1)+1]=M[5],L(E+(A<<1)+2,M[5],M[9]);break;case 24:L(E,M[5],M[1]),L(E+1,M[5],M[2]),L(E+2,M[5],M[3]),U[E+A]=M[5],U[E+A+1]=M[5],U[E+A+2]=M[5],L(E+(A<<1),M[5],M[7]),L(E+(A<<1)+1,M[5],M[8]),L(E+(A<<1)+2,M[5],M[9]);break;case 7:case 39:case 135:L(E,M[5],M[4]),U[E+1]=M[5],L(E+2,M[5],M[6]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),O(E+(A<<1),M[5],M[8],M[4]),L(E+(A<<1)+1,M[5],M[8]),O(E+(A<<1)+2,M[5],M[6],M[8]);break;case 148:case 149:case 180:O(E,M[5],M[4],M[2]),L(E+1,M[5],M[2]),L(E+2,M[5],M[2]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],U[E+A+2]=M[5],O(E+(A<<1),M[5],M[8],M[4]),L(E+(A<<1)+1,M[5],M[8]),L(E+(A<<1)+2,M[5],M[8]);break;case 224:case 228:case 225:O(E,M[5],M[4],M[2]),L(E+1,M[5],M[2]),O(E+2,M[5],M[2],M[6]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),L(E+(A<<1),M[5],M[4]),U[E+(A<<1)+1]=M[5],L(E+(A<<1)+2,M[5],M[6]);break;case 41:case 169:case 45:L(E,M[5],M[2]),L(E+1,M[5],M[2]),O(E+2,M[5],M[2],M[6]),U[E+A]=M[5],U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),L(E+(A<<1),M[5],M[8]),L(E+(A<<1)+1,M[5],M[8]),O(E+(A<<1)+2,M[5],M[6],M[8]);break;case 22:case 54:L(E,M[5],M[1]),y(M[2],M[6])?(U[E+1]=M[5],U[E+2]=M[5],U[E+A+2]=M[5]):(P(E+1,M[5],M[2]),R(E+2,M[5],M[2],M[6]),P(E+A+2,M[5],M[6])),L(E+A,M[5],M[4]),U[E+A+1]=M[5],O(E+(A<<1),M[5],M[8],M[4]),L(E+(A<<1)+1,M[5],M[8]),L(E+(A<<1)+2,M[5],M[9]);break;case 208:case 209:O(E,M[5],M[4],M[2]),L(E+1,M[5],M[2]),L(E+2,M[5],M[3]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],L(E+(A<<1),M[5],M[7]),y(M[6],M[8])?(U[E+A+2]=M[5],U[E+(A<<1)+1]=M[5],U[E+(A<<1)+2]=M[5]):(P(E+A+2,M[5],M[6]),P(E+(A<<1)+1,M[5],M[8]),R(E+(A<<1)+2,M[5],M[6],M[8]));break;case 104:case 108:L(E,M[5],M[1]),L(E+1,M[5],M[2]),O(E+2,M[5],M[2],M[6]),U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),y(M[8],M[4])?(U[E+A]=M[5],U[E+(A<<1)]=M[5],U[E+(A<<1)+1]=M[5]):(P(E+A,M[5],M[4]),R(E+(A<<1),M[5],M[8],M[4]),P(E+(A<<1)+1,M[5],M[8])),L(E+(A<<1)+2,M[5],M[9]);break;case 11:case 139:y(M[4],M[2])?(U[E]=M[5],U[E+1]=M[5],U[E+A]=M[5]):(R(E,M[5],M[4],M[2]),P(E+1,M[5],M[2]),P(E+A,M[5],M[4])),L(E+2,M[5],M[3]),U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),L(E+(A<<1),M[5],M[7]),L(E+(A<<1)+1,M[5],M[8]),O(E+(A<<1)+2,M[5],M[6],M[8]);break;case 19:case 51:y(M[2],M[6])?(L(E,M[5],M[4]),U[E+1]=M[5],L(E+2,M[5],M[3]),U[E+A+2]=M[5]):(O(E,M[5],M[4],M[2]),L(E+1,M[2],M[5]),S(E+2,M[2],M[6]),L(E+A+2,M[5],M[6])),L(E+A,M[5],M[4]),U[E+A+1]=M[5],O(E+(A<<1),M[5],M[8],M[4]),L(E+(A<<1)+1,M[5],M[8]),L(E+(A<<1)+2,M[5],M[9]);break;case 146:case 178:y(M[2],M[6])?(U[E+1]=M[5],L(E+2,M[5],M[3]),U[E+A+2]=M[5],L(E+(A<<1)+2,M[5],M[8])):(L(E+1,M[5],M[2]),S(E+2,M[2],M[6]),L(E+A+2,M[6],M[5]),O(E+(A<<1)+2,M[5],M[6],M[8])),L(E,M[5],M[1]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],O(E+(A<<1),M[5],M[8],M[4]),L(E+(A<<1)+1,M[5],M[8]);break;case 84:case 85:y(M[6],M[8])?(L(E+2,M[5],M[2]),U[E+A+2]=M[5],U[E+(A<<1)+1]=M[5],L(E+(A<<1)+2,M[5],M[9])):(O(E+2,M[5],M[2],M[6]),L(E+A+2,M[6],M[5]),L(E+(A<<1)+1,M[5],M[8]),S(E+(A<<1)+2,M[6],M[8])),O(E,M[5],M[4],M[2]),
L(E+1,M[5],M[2]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],L(E+(A<<1),M[5],M[7]);break;case 112:case 113:y(M[6],M[8])?(U[E+A+2]=M[5],L(E+(A<<1),M[5],M[4]),U[E+(A<<1)+1]=M[5],L(E+(A<<1)+2,M[5],M[9])):(L(E+A+2,M[5],M[6]),O(E+(A<<1),M[5],M[8],M[4]),L(E+(A<<1)+1,M[8],M[5]),S(E+(A<<1)+2,M[6],M[8])),O(E,M[5],M[4],M[2]),L(E+1,M[5],M[2]),L(E+2,M[5],M[3]),L(E+A,M[5],M[4]),U[E+A+1]=M[5];break;case 200:case 204:y(M[8],M[4])?(U[E+A]=M[5],L(E+(A<<1),M[5],M[7]),U[E+(A<<1)+1]=M[5],L(E+(A<<1)+2,M[5],M[6])):(L(E+A,M[5],M[4]),S(E+(A<<1),M[8],M[4]),L(E+(A<<1)+1,M[8],M[5]),O(E+(A<<1)+2,M[5],M[6],M[8])),L(E,M[5],M[1]),L(E+1,M[5],M[2]),O(E+2,M[5],M[2],M[6]),U[E+A+1]=M[5],L(E+A+2,M[5],M[6]);break;case 73:case 77:y(M[8],M[4])?(L(E,M[5],M[2]),U[E+A]=M[5],L(E+(A<<1),M[5],M[7]),U[E+(A<<1)+1]=M[5]):(O(E,M[5],M[4],M[2]),L(E+A,M[4],M[5]),S(E+(A<<1),M[8],M[4]),L(E+(A<<1)+1,M[5],M[8])),L(E+1,M[5],M[2]),O(E+2,M[5],M[2],M[6]),U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),L(E+(A<<1)+2,M[5],M[9]);break;case 42:case 170:y(M[4],M[2])?(L(E,M[5],M[1]),U[E+1]=M[5],U[E+A]=M[5],L(E+(A<<1),M[5],M[8])):(S(E,M[4],M[2]),L(E+1,M[5],M[2]),L(E+A,M[4],M[5]),O(E+(A<<1),M[5],M[8],M[4])),L(E+2,M[5],M[3]),U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),L(E+(A<<1)+1,M[5],M[8]),O(E+(A<<1)+2,M[5],M[6],M[8]);break;case 14:case 142:y(M[4],M[2])?(L(E,M[5],M[1]),U[E+1]=M[5],L(E+2,M[5],M[6]),U[E+A]=M[5]):(S(E,M[4],M[2]),L(E+1,M[2],M[5]),O(E+2,M[5],M[2],M[6]),L(E+A,M[5],M[4])),U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),L(E+(A<<1),M[5],M[7]),L(E+(A<<1)+1,M[5],M[8]),O(E+(A<<1)+2,M[5],M[6],M[8]);break;case 67:L(E,M[5],M[4]),U[E+1]=M[5],L(E+2,M[5],M[3]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),L(E+(A<<1),M[5],M[7]),U[E+(A<<1)+1]=M[5],L(E+(A<<1)+2,M[5],M[9]);break;case 70:L(E,M[5],M[1]),U[E+1]=M[5],L(E+2,M[5],M[6]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),L(E+(A<<1),M[5],M[7]),U[E+(A<<1)+1]=M[5],L(E+(A<<1)+2,M[5],M[9]);break;case 28:L(E,M[5],M[1]),L(E+1,M[5],M[2]),L(E+2,M[5],M[2]),U[E+A]=M[5],U[E+A+1]=M[5],U[E+A+2]=M[5],L(E+(A<<1),M[5],M[7]),L(E+(A<<1)+1,M[5],M[8]),L(E+(A<<1)+2,M[5],M[9]);break;case 152:L(E,M[5],M[1]),L(E+1,M[5],M[2]),L(E+2,M[5],M[3]),U[E+A]=M[5],U[E+A+1]=M[5],U[E+A+2]=M[5],L(E+(A<<1),M[5],M[7]),L(E+(A<<1)+1,M[5],M[8]),L(E+(A<<1)+2,M[5],M[8]);break;case 194:L(E,M[5],M[1]),U[E+1]=M[5],L(E+2,M[5],M[3]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),L(E+(A<<1),M[5],M[7]),U[E+(A<<1)+1]=M[5],L(E+(A<<1)+2,M[5],M[6]);break;case 98:L(E,M[5],M[1]),U[E+1]=M[5],L(E+2,M[5],M[3]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),L(E+(A<<1),M[5],M[4]),U[E+(A<<1)+1]=M[5],L(E+(A<<1)+2,M[5],M[9]);break;case 56:L(E,M[5],M[1]),L(E+1,M[5],M[2]),L(E+2,M[5],M[3]),U[E+A]=M[5],U[E+A+1]=M[5],U[E+A+2]=M[5],L(E+(A<<1),M[5],M[8]),L(E+(A<<1)+1,M[5],M[8]),L(E+(A<<1)+2,M[5],M[9]);break;case 25:L(E,M[5],M[2]),L(E+1,M[5],M[2]),L(E+2,M[5],M[3]),U[E+A]=M[5],U[E+A+1]=M[5],U[E+A+2]=M[5],L(E+(A<<1),M[5],M[7]),L(E+(A<<1)+1,M[5],M[8]),L(E+(A<<1)+2,M[5],M[9]);break;case 26:case 31:y(M[4],M[2])?(U[E]=M[5],U[E+A]=M[5]):(R(E,M[5],M[4],M[2]),P(E+A,M[5],M[4])),U[E+1]=M[5],y(M[2],M[6])?(U[E+2]=M[5],U[E+A+2]=M[5]):(R(E+2,M[5],M[2],M[6]),P(E+A+2,M[5],M[6])),U[E+A+1]=M[5],L(E+(A<<1),M[5],M[7]),L(E+(A<<1)+1,M[5],M[8]),L(E+(A<<1)+2,M[5],M[9]);break;case 82:case 214:L(E,M[5],M[1]),y(M[2],M[6])?(U[E+1]=M[5],U[E+2]=M[5]):(P(E+1,M[5],M[2]),R(E+2,M[5],M[2],M[6])),L(E+A,M[5],M[4]),U[E+A+1]=M[5],U[E+A+2]=M[5],L(E+(A<<1),M[5],M[7]),y(M[6],M[8])?(U[E+(A<<1)+1]=M[5],U[E+(A<<1)+2]=M[5]):(P(E+(A<<1)+1,M[5],M[8]),R(E+(A<<1)+2,M[5],M[6],M[8]));break;case 88:case 248:L(E,M[5],M[1]),L(E+1,M[5],M[2]),L(E+2,M[5],M[3]),U[E+A+1]=M[5],y(M[8],M[4])?(U[E+A]=M[5],U[E+(A<<1)]=M[5]):(P(E+A,M[5],M[4]),R(E+(A<<1),M[5],M[8],M[4])),U[E+(A<<1)+1]=M[5],y(M[6],M[8])?(U[E+A+2]=M[5],U[E+(A<<1)+2]=M[5]):(P(E+A+2,M[5],M[6]),R(E+(A<<1)+2,M[5],M[6],M[8]));break;case 74:case 107:y(M[4],M[2])?(U[E]=M[5],U[E+1]=M[5]):(R(E,M[5],M[4],M[2]),P(E+1,M[5],M[2])),L(E+2,M[5],M[3]),U[E+A]=M[5],U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),y(M[8],M[4])?(U[E+(A<<1)]=M[5],U[E+(A<<1)+1]=M[5]):(R(E+(A<<1),M[5],M[8],M[4]),P(E+(A<<1)+1,M[5],M[8])),L(E+(A<<1)+2,M[5],M[9]);break;case 27:y(M[4],M[2])?(U[E]=M[5],U[E+1]=M[5],U[E+A]=M[5]):(R(E,M[5],M[4],M[2]),P(E+1,M[5],M[2]),P(E+A,M[5],M[4])),L(E+2,M[5],M[3]),U[E+A+1]=M[5],U[E+A+2]=M[5],L(E+(A<<1),M[5],M[7]),L(E+(A<<1)+1,M[5],M[8]),L(E+(A<<1)+2,M[5],M[9]);break;case 86:L(E,M[5],M[1]),y(M[2],M[6])?(U[E+1]=M[5],U[E+2]=M[5],U[E+A+2]=M[5]):(P(E+1,M[5],M[2]),R(E+2,M[5],M[2],M[6]),P(E+A+2,M[5],M[6])),L(E+A,M[5],M[4]),U[E+A+1]=M[5],L(E+(A<<1),M[5],M[7]),U[E+(A<<1)+1]=M[5],L(E+(A<<1)+2,M[5],M[9]);break;case 216:L(E,M[5],M[1]),L(E+1,M[5],M[2]),L(E+2,M[5],M[3]),U[E+A]=M[5],U[E+A+1]=M[5],L(E+(A<<1),M[5],M[7]),y(M[6],M[8])?(U[E+A+2]=M[5],U[E+(A<<1)+1]=M[5],U[E+(A<<1)+2]=M[5]):(P(E+A+2,M[5],M[6]),P(E+(A<<1)+1,M[5],M[8]),R(E+(A<<1)+2,M[5],M[6],M[8]));break;case 106:L(E,M[5],M[1]),U[E+1]=M[5],L(E+2,M[5],M[3]),U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),y(M[8],M[4])?(U[E+A]=M[5],U[E+(A<<1)]=M[5],U[E+(A<<1)+1]=M[5]):(P(E+A,M[5],M[4]),R(E+(A<<1),M[5],M[8],M[4]),P(E+(A<<1)+1,M[5],M[8])),L(E+(A<<1)+2,M[5],M[9]);break;case 30:L(E,M[5],M[1]),y(M[2],M[6])?(U[E+1]=M[5],U[E+2]=M[5],U[E+A+2]=M[5]):(P(E+1,M[5],M[2]),R(E+2,M[5],M[2],M[6]),P(E+A+2,M[5],M[6])),U[E+A]=M[5],U[E+A+1]=M[5],L(E+(A<<1),M[5],M[7]),L(E+(A<<1)+1,M[5],M[8]),L(E+(A<<1)+2,M[5],M[9]);break;case 210:L(E,M[5],M[1]),U[E+1]=M[5],L(E+2,M[5],M[3]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],L(E+(A<<1),M[5],M[7]),y(M[6],M[8])?(U[E+A+2]=M[5],U[E+(A<<1)+1]=M[5],U[E+(A<<1)+2]=M[5]):(P(E+A+2,M[5],M[6]),P(E+(A<<1)+1,M[5],M[8]),R(E+(A<<1)+2,M[5],M[6],M[8]));break;case 120:L(E,M[5],M[1]),L(E+1,M[5],M[2]),L(E+2,M[5],M[3]),U[E+A+1]=M[5],U[E+A+2]=M[5],y(M[8],M[4])?(U[E+A]=M[5],U[E+(A<<1)]=M[5],U[E+(A<<1)+1]=M[5]):(P(E+A,M[5],M[4]),R(E+(A<<1),M[5],M[8],M[4]),P(E+(A<<1)+1,M[5],M[8])),L(E+(A<<1)+2,M[5],M[9]);break;case 75:y(M[4],M[2])?(U[E]=M[5],U[E+1]=M[5],U[E+A]=M[5]):(R(E,M[5],M[4],M[2]),P(E+1,M[5],M[2]),P(E+A,M[5],M[4])),L(E+2,M[5],M[3]),U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),L(E+(A<<1),M[5],M[7]),U[E+(A<<1)+1]=M[5],L(E+(A<<1)+2,M[5],M[9]);break;case 29:L(E,M[5],M[2]),L(E+1,M[5],M[2]),L(E+2,M[5],M[2]),U[E+A]=M[5],U[E+A+1]=M[5],U[E+A+2]=M[5],L(E+(A<<1),M[5],M[7]),L(E+(A<<1)+1,M[5],M[8]),L(E+(A<<1)+2,M[5],M[9]);break;case 198:L(E,M[5],M[1]),U[E+1]=M[5],L(E+2,M[5],M[6]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),L(E+(A<<1),M[5],M[7]),U[E+(A<<1)+1]=M[5],L(E+(A<<1)+2,M[5],M[6]);break;case 184:L(E,M[5],M[1]),L(E+1,M[5],M[2]),L(E+2,M[5],M[3]),U[E+A]=M[5],U[E+A+1]=M[5],U[E+A+2]=M[5],L(E+(A<<1),M[5],M[8]),L(E+(A<<1)+1,M[5],M[8]),L(E+(A<<1)+2,M[5],M[8]);break;case 99:L(E,M[5],M[4]),U[E+1]=M[5],L(E+2,M[5],M[3]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),L(E+(A<<1),M[5],M[4]),U[E+(A<<1)+1]=M[5],L(E+(A<<1)+2,M[5],M[9]);break;case 57:L(E,M[5],M[2]),L(E+1,M[5],M[2]),L(E+2,M[5],M[3]),U[E+A]=M[5],U[E+A+1]=M[5],U[E+A+2]=M[5],L(E+(A<<1),M[5],M[8]),L(E+(A<<1)+1,M[5],M[8]),L(E+(A<<1)+2,M[5],M[9]);break;case 71:L(E,M[5],M[4]),U[E+1]=M[5],L(E+2,M[5],M[6]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),L(E+(A<<1),M[5],M[7]),U[E+(A<<1)+1]=M[5],L(E+(A<<1)+2,M[5],M[9]);break;case 156:L(E,M[5],M[1]),L(E+1,M[5],M[2]),L(E+2,M[5],M[2]),U[E+A]=M[5],U[E+A+1]=M[5],U[E+A+2]=M[5],L(E+(A<<1),M[5],M[7]),L(E+(A<<1)+1,M[5],M[8]),L(E+(A<<1)+2,M[5],M[8]);break;case 226:L(E,M[5],M[1]),U[E+1]=M[5],L(E+2,M[5],M[3]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),L(E+(A<<1),M[5],M[4]),U[E+(A<<1)+1]=M[5],L(E+(A<<1)+2,M[5],M[6]);break;case 60:L(E,M[5],M[1]),L(E+1,M[5],M[2]),L(E+2,M[5],M[2]),U[E+A]=M[5],U[E+A+1]=M[5],U[E+A+2]=M[5],L(E+(A<<1),M[5],M[8]),L(E+(A<<1)+1,M[5],M[8]),L(E+(A<<1)+2,M[5],M[9]);break;case 195:L(E,M[5],M[4]),U[E+1]=M[5],L(E+2,M[5],M[3]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),L(E+(A<<1),M[5],M[7]),U[E+(A<<1)+1]=M[5],L(E+(A<<1)+2,M[5],M[6]);break;case 102:L(E,M[5],M[1]),U[E+1]=M[5],L(E+2,M[5],M[6]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),L(E+(A<<1),M[5],M[4]),U[E+(A<<1)+1]=M[5],L(E+(A<<1)+2,M[5],M[9]);break;case 153:L(E,M[5],M[2]),L(E+1,M[5],M[2]),L(E+2,M[5],M[3]),U[E+A]=M[5],U[E+A+1]=M[5],U[E+A+2]=M[5],L(E+(A<<1),M[5],M[7]),L(E+(A<<1)+1,M[5],M[8]),L(E+(A<<1)+2,M[5],M[8]);break;case 58:y(M[4],M[2])?L(E,M[5],M[1]):O(E,M[5],M[4],M[2]),U[E+1]=M[5],y(M[2],M[6])?L(E+2,M[5],M[3]):O(E+2,M[5],M[2],M[6]),U[E+A]=M[5],U[E+A+1]=M[5],U[E+A+2]=M[5],L(E+(A<<1),M[5],M[8]),L(E+(A<<1)+1,M[5],M[8]),L(E+(A<<1)+2,M[5],M[9]);break;case 83:L(E,M[5],M[4]),U[E+1]=M[5],y(M[2],M[6])?L(E+2,M[5],M[3]):O(E+2,M[5],M[2],M[6]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],U[E+A+2]=M[5],L(E+(A<<1),M[5],M[7]),U[E+(A<<1)+1]=M[5],y(M[6],M[8])?L(E+(A<<1)+2,M[5],M[9]):O(E+(A<<1)+2,M[5],M[6],M[8]);break;case 92:L(E,M[5],M[1]),L(E+1,M[5],M[2]),L(E+2,M[5],M[2]),U[E+A]=M[5],U[E+A+1]=M[5],U[E+A+2]=M[5],y(M[8],M[4])?L(E+(A<<1),M[5],M[7]):O(E+(A<<1),M[5],M[8],M[4]),U[E+(A<<1)+1]=M[5],y(M[6],M[8])?L(E+(A<<1)+2,M[5],M[9]):O(E+(A<<1)+2,M[5],M[6],M[8]);break;case 202:y(M[4],M[2])?L(E,M[5],M[1]):O(E,M[5],M[4],M[2]),U[E+1]=M[5],L(E+2,M[5],M[3]),U[E+A]=M[5],U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),y(M[8],M[4])?L(E+(A<<1),M[5],M[7]):O(E+(A<<1),M[5],M[8],M[4]),U[E+(A<<1)+1]=M[5],L(E+(A<<1)+2,M[5],M[6]);break;case 78:y(M[4],M[2])?L(E,M[5],M[1]):O(E,M[5],M[4],M[2]),U[E+1]=M[5],L(E+2,M[5],M[6]),U[E+A]=M[5],U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),y(M[8],M[4])?L(E+(A<<1),M[5],M[7]):O(E+(A<<1),M[5],M[8],M[4]),U[E+(A<<1)+1]=M[5],L(E+(A<<1)+2,M[5],M[9]);break;case 154:y(M[4],M[2])?L(E,M[5],M[1]):O(E,M[5],M[4],M[2]),U[E+1]=M[5],y(M[2],M[6])?L(E+2,M[5],M[3]):O(E+2,M[5],M[2],M[6]),U[E+A]=M[5],U[E+A+1]=M[5],U[E+A+2]=M[5],L(E+(A<<1),M[5],M[7]),L(E+(A<<1)+1,M[5],M[8]),L(E+(A<<1)+2,M[5],M[8]);break;case 114:L(E,M[5],M[1]),U[E+1]=M[5],y(M[2],M[6])?L(E+2,M[5],M[3]):O(E+2,M[5],M[2],M[6]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],U[E+A+2]=M[5],L(E+(A<<1),M[5],M[4]),U[E+(A<<1)+1]=M[5],y(M[6],M[8])?L(E+(A<<1)+2,M[5],M[9]):O(E+(A<<1)+2,M[5],M[6],M[8]);break;case 89:L(E,M[5],M[2]),L(E+1,M[5],M[2]),L(E+2,M[5],M[3]),U[E+A]=M[5],U[E+A+1]=M[5],U[E+A+2]=M[5],y(M[8],M[4])?L(E+(A<<1),M[5],M[7]):O(E+(A<<1),M[5],M[8],M[4]),U[E+(A<<1)+1]=M[5],y(M[6],M[8])?L(E+(A<<1)+2,M[5],M[9]):O(E+(A<<1)+2,M[5],M[6],M[8]);break;case 90:y(M[4],M[2])?L(E,M[5],M[1]):O(E,M[5],M[4],M[2]),U[E+1]=M[5],y(M[2],M[6])?L(E+2,M[5],M[3]):O(E+2,M[5],M[2],M[6]),U[E+A]=M[5],U[E+A+1]=M[5],U[E+A+2]=M[5],y(M[8],M[4])?L(E+(A<<1),M[5],M[7]):O(E+(A<<1),M[5],M[8],M[4]),U[E+(A<<1)+1]=M[5],y(M[6],M[8])?L(E+(A<<1)+2,M[5],M[9]):O(E+(A<<1)+2,M[5],M[6],M[8]);break;case 55:case 23:y(M[2],M[6])?(L(E,M[5],M[4]),U[E+1]=M[5],U[E+2]=M[5],U[E+A+2]=M[5]):(O(E,M[5],M[4],M[2]),L(E+1,M[2],M[5]),S(E+2,M[2],M[6]),L(E+A+2,M[5],M[6])),L(E+A,M[5],M[4]),U[E+A+1]=M[5],O(E+(A<<1),M[5],M[8],M[4]),L(E+(A<<1)+1,M[5],M[8]),L(E+(A<<1)+2,M[5],M[9]);break;case 182:case 150:y(M[2],M[6])?(U[E+1]=M[5],U[E+2]=M[5],U[E+A+2]=M[5],L(E+(A<<1)+2,M[5],M[8])):(L(E+1,M[5],M[2]),S(E+2,M[2],M[6]),L(E+A+2,M[6],M[5]),O(E+(A<<1)+2,M[5],M[6],M[8])),L(E,M[5],M[1]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],O(E+(A<<1),M[5],M[8],M[4]),L(E+(A<<1)+1,M[5],M[8]);break;case 213:case 212:y(M[6],M[8])?(L(E+2,M[5],M[2]),U[E+A+2]=M[5],U[E+(A<<1)+1]=M[5],U[E+(A<<1)+2]=M[5]):(O(E+2,M[5],M[2],M[6]),L(E+A+2,M[6],M[5]),L(E+(A<<1)+1,M[5],M[8]),S(E+(A<<1)+2,M[6],M[8])),O(E,M[5],M[4],M[2]),L(E+1,M[5],M[2]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],L(E+(A<<1),M[5],M[7]);break;case 241:case 240:y(M[6],M[8])?(U[E+A+2]=M[5],L(E+(A<<1),M[5],M[4]),U[E+(A<<1)+1]=M[5],U[E+(A<<1)+2]=M[5]):(L(E+A+2,M[5],M[6]),O(E+(A<<1),M[5],M[8],M[4]),L(E+(A<<1)+1,M[8],M[5]),S(E+(A<<1)+2,M[6],M[8])),O(E,M[5],M[4],M[2]),L(E+1,M[5],M[2]),L(E+2,M[5],M[3]),L(E+A,M[5],M[4]),U[E+A+1]=M[5];break;case 236:case 232:y(M[8],M[4])?(U[E+A]=M[5],U[E+(A<<1)]=M[5],U[E+(A<<1)+1]=M[5],L(E+(A<<1)+2,M[5],M[6])):(L(E+A,M[5],M[4]),S(E+(A<<1),M[8],M[4]),L(E+(A<<1)+1,M[8],M[5]),O(E+(A<<1)+2,M[5],M[6],M[8])),L(E,M[5],M[1]),L(E+1,M[5],M[2]),O(E+2,M[5],M[2],M[6]),U[E+A+1]=M[5],L(E+A+2,M[5],M[6]);break;case 109:case 105:y(M[8],M[4])?(L(E,M[5],M[2]),U[E+A]=M[5],U[E+(A<<1)]=M[5],U[E+(A<<1)+1]=M[5]):(O(E,M[5],M[4],M[2]),L(E+A,M[4],M[5]),S(E+(A<<1),M[8],M[4]),L(E+(A<<1)+1,M[5],M[8])),L(E+1,M[5],M[2]),O(E+2,M[5],M[2],M[6]),U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),L(E+(A<<1)+2,M[5],M[9]);break;case 171:case 43:y(M[4],M[2])?(U[E]=M[5],U[E+1]=M[5],U[E+A]=M[5],L(E+(A<<1),M[5],M[8])):(S(E,M[4],M[2]),L(E+1,M[5],M[2]),L(E+A,M[4],M[5]),O(E+(A<<1),M[5],M[8],M[4])),L(E+2,M[5],M[3]),U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),L(E+(A<<1)+1,M[5],M[8]),O(E+(A<<1)+2,M[5],M[6],M[8]);break;case 143:case 15:y(M[4],M[2])?(U[E]=M[5],U[E+1]=M[5],L(E+2,M[5],M[6]),U[E+A]=M[5]):(S(E,M[4],M[2]),L(E+1,M[2],M[5]),O(E+2,M[5],M[2],M[6]),L(E+A,M[5],M[4])),U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),L(E+(A<<1),M[5],M[7]),L(E+(A<<1)+1,M[5],M[8]),O(E+(A<<1)+2,M[5],M[6],M[8]);break;case 124:L(E,M[5],M[1]),L(E+1,M[5],M[2]),L(E+2,M[5],M[2]),U[E+A+1]=M[5],U[E+A+2]=M[5],y(M[8],M[4])?(U[E+A]=M[5],U[E+(A<<1)]=M[5],U[E+(A<<1)+1]=M[5]):(P(E+A,M[5],M[4]),R(E+(A<<1),M[5],M[8],M[4]),P(E+(A<<1)+1,M[5],M[8])),L(E+(A<<1)+2,M[5],M[9]);break;case 203:y(M[4],M[2])?(U[E]=M[5],U[E+1]=M[5],U[E+A]=M[5]):(R(E,M[5],M[4],M[2]),P(E+1,M[5],M[2]),P(E+A,M[5],M[4])),L(E+2,M[5],M[3]),U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),L(E+(A<<1),M[5],M[7]),U[E+(A<<1)+1]=M[5],L(E+(A<<1)+2,M[5],M[6]);break;case 62:L(E,M[5],M[1]),y(M[2],M[6])?(U[E+1]=M[5],U[E+2]=M[5],U[E+A+2]=M[5]):(P(E+1,M[5],M[2]),R(E+2,M[5],M[2],M[6]),P(E+A+2,M[5],M[6])),U[E+A]=M[5],U[E+A+1]=M[5],L(E+(A<<1),M[5],M[8]),L(E+(A<<1)+1,M[5],M[8]),L(E+(A<<1)+2,M[5],M[9]);break;case 211:L(E,M[5],M[4]),U[E+1]=M[5],L(E+2,M[5],M[3]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],L(E+(A<<1),M[5],M[7]),y(M[6],M[8])?(U[E+A+2]=M[5],U[E+(A<<1)+1]=M[5],U[E+(A<<1)+2]=M[5]):(P(E+A+2,M[5],M[6]),P(E+(A<<1)+1,M[5],M[8]),R(E+(A<<1)+2,M[5],M[6],M[8]));break;case 118:L(E,M[5],M[1]),y(M[2],M[6])?(U[E+1]=M[5],U[E+2]=M[5],U[E+A+2]=M[5]):(P(E+1,M[5],M[2]),R(E+2,M[5],M[2],M[6]),P(E+A+2,M[5],M[6])),L(E+A,M[5],M[4]),U[E+A+1]=M[5],L(E+(A<<1),M[5],M[4]),U[E+(A<<1)+1]=M[5],L(E+(A<<1)+2,M[5],M[9]);break;case 217:L(E,M[5],M[2]),L(E+1,M[5],M[2]),L(E+2,M[5],M[3]),U[E+A]=M[5],U[E+A+1]=M[5],L(E+(A<<1),M[5],M[7]),y(M[6],M[8])?(U[E+A+2]=M[5],U[E+(A<<1)+1]=M[5],U[E+(A<<1)+2]=M[5]):(P(E+A+2,M[5],M[6]),P(E+(A<<1)+1,M[5],M[8]),R(E+(A<<1)+2,M[5],M[6],M[8]));break;case 110:L(E,M[5],M[1]),U[E+1]=M[5],L(E+2,M[5],M[6]),U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),y(M[8],M[4])?(U[E+A]=M[5],U[E+(A<<1)]=M[5],U[E+(A<<1)+1]=M[5]):(P(E+A,M[5],M[4]),R(E+(A<<1),M[5],M[8],M[4]),P(E+(A<<1)+1,M[5],M[8])),L(E+(A<<1)+2,M[5],M[9]);break;case 155:y(M[4],M[2])?(U[E]=M[5],U[E+1]=M[5],U[E+A]=M[5]):(R(E,M[5],M[4],M[2]),P(E+1,M[5],M[2]),P(E+A,M[5],M[4])),L(E+2,M[5],M[3]),U[E+A+1]=M[5],U[E+A+2]=M[5],L(E+(A<<1),M[5],M[7]),L(E+(A<<1)+1,M[5],M[8]),L(E+(A<<1)+2,M[5],M[8]);break;case 188:L(E,M[5],M[1]),L(E+1,M[5],M[2]),L(E+2,M[5],M[2]),U[E+A]=M[5],U[E+A+1]=M[5],U[E+A+2]=M[5],L(E+(A<<1),M[5],M[8]),L(E+(A<<1)+1,M[5],M[8]),L(E+(A<<1)+2,M[5],M[8]);break;case 185:L(E,M[5],M[2]),L(E+1,M[5],M[2]),L(E+2,M[5],M[3]),U[E+A]=M[5],U[E+A+1]=M[5],U[E+A+2]=M[5],L(E+(A<<1),M[5],M[8]),L(E+(A<<1)+1,M[5],M[8]),L(E+(A<<1)+2,M[5],M[8]);break;case 61:L(E,M[5],M[2]),L(E+1,M[5],M[2]),L(E+2,M[5],M[2]),U[E+A]=M[5],U[E+A+1]=M[5],U[E+A+2]=M[5],L(E+(A<<1),M[5],M[8]),L(E+(A<<1)+1,M[5],M[8]),L(E+(A<<1)+2,M[5],M[9]);break;case 157:L(E,M[5],M[2]),L(E+1,M[5],M[2]),L(E+2,M[5],M[2]),U[E+A]=M[5],U[E+A+1]=M[5],U[E+A+2]=M[5],L(E+(A<<1),M[5],M[7]),L(E+(A<<1)+1,M[5],M[8]),L(E+(A<<1)+2,M[5],M[8]);break;case 103:L(E,M[5],M[4]),U[E+1]=M[5],L(E+2,M[5],M[6]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),L(E+(A<<1),M[5],M[4]),U[E+(A<<1)+1]=M[5],L(E+(A<<1)+2,M[5],M[9]);break;case 227:L(E,M[5],M[4]),U[E+1]=M[5],L(E+2,M[5],M[3]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),L(E+(A<<1),M[5],M[4]),U[E+(A<<1)+1]=M[5],L(E+(A<<1)+2,M[5],M[6]);break;case 230:L(E,M[5],M[1]),U[E+1]=M[5],L(E+2,M[5],M[6]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),L(E+(A<<1),M[5],M[4]),U[E+(A<<1)+1]=M[5],L(E+(A<<1)+2,M[5],M[6]);break;case 199:L(E,M[5],M[4]),U[E+1]=M[5],L(E+2,M[5],M[6]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),L(E+(A<<1),M[5],M[7]),U[E+(A<<1)+1]=M[5],L(E+(A<<1)+2,M[5],M[6]);break;case 220:L(E,M[5],M[1]),L(E+1,M[5],M[2]),L(E+2,M[5],M[2]),U[E+A]=M[5],U[E+A+1]=M[5],y(M[8],M[4])?L(E+(A<<1),M[5],M[7]):O(E+(A<<1),M[5],M[8],M[4]),y(M[6],M[8])?(U[E+A+2]=M[5],U[E+(A<<1)+1]=M[5],U[E+(A<<1)+2]=M[5]):(P(E+A+2,M[5],M[6]),P(E+(A<<1)+1,M[5],M[8]),R(E+(A<<1)+2,M[5],M[6],M[8]));break;case 158:y(M[4],M[2])?L(E,M[5],M[1]):O(E,M[5],M[4],M[2]),y(M[2],M[6])?(U[E+1]=M[5],U[E+2]=M[5],U[E+A+2]=M[5]):(P(E+1,M[5],M[2]),R(E+2,M[5],M[2],M[6]),P(E+A+2,M[5],M[6])),U[E+A]=M[5],U[E+A+1]=M[5],L(E+(A<<1),M[5],M[7]),L(E+(A<<1)+1,M[5],M[8]),L(E+(A<<1)+2,M[5],M[8]);break;case 234:y(M[4],M[2])?L(E,M[5],M[1]):O(E,M[5],M[4],M[2]),U[E+1]=M[5],L(E+2,M[5],M[3]),U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),y(M[8],M[4])?(U[E+A]=M[5],U[E+(A<<1)]=M[5],U[E+(A<<1)+1]=M[5]):(P(E+A,M[5],M[4]),R(E+(A<<1),M[5],M[8],M[4]),P(E+(A<<1)+1,M[5],M[8])),L(E+(A<<1)+2,M[5],M[6]);break;case 242:L(E,M[5],M[1]),U[E+1]=M[5],y(M[2],M[6])?L(E+2,M[5],M[3]):O(E+2,M[5],M[2],M[6]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],L(E+(A<<1),M[5],M[4]),y(M[6],M[8])?(U[E+A+2]=M[5],U[E+(A<<1)+1]=M[5],U[E+(A<<1)+2]=M[5]):(P(E+A+2,M[5],M[6]),P(E+(A<<1)+1,M[5],M[8]),R(E+(A<<1)+2,M[5],M[6],M[8]));break;case 59:y(M[4],M[2])?(U[E]=M[5],U[E+1]=M[5],U[E+A]=M[5]):(R(E,M[5],M[4],M[2]),P(E+1,M[5],M[2]),P(E+A,M[5],M[4])),y(M[2],M[6])?L(E+2,M[5],M[3]):O(E+2,M[5],M[2],M[6]),U[E+A+1]=M[5],U[E+A+2]=M[5],L(E+(A<<1),M[5],M[8]),L(E+(A<<1)+1,M[5],M[8]),L(E+(A<<1)+2,M[5],M[9]);break;case 121:L(E,M[5],M[2]),L(E+1,M[5],M[2]),L(E+2,M[5],M[3]),U[E+A+1]=M[5],U[E+A+2]=M[5],y(M[8],M[4])?(U[E+A]=M[5],U[E+(A<<1)]=M[5],U[E+(A<<1)+1]=M[5]):(P(E+A,M[5],M[4]),R(E+(A<<1),M[5],M[8],M[4]),P(E+(A<<1)+1,M[5],M[8])),y(M[6],M[8])?L(E+(A<<1)+2,M[5],M[9]):O(E+(A<<1)+2,M[5],M[6],M[8]);break;case 87:L(E,M[5],M[4]),y(M[2],M[6])?(U[E+1]=M[5],U[E+2]=M[5],U[E+A+2]=M[5]):(P(E+1,M[5],M[2]),R(E+2,M[5],M[2],M[6]),P(E+A+2,M[5],M[6])),L(E+A,M[5],M[4]),U[E+A+1]=M[5],L(E+(A<<1),M[5],M[7]),U[E+(A<<1)+1]=M[5],y(M[6],M[8])?L(E+(A<<1)+2,M[5],M[9]):O(E+(A<<1)+2,M[5],M[6],M[8]);break;case 79:y(M[4],M[2])?(U[E]=M[5],U[E+1]=M[5],U[E+A]=M[5]):(R(E,M[5],M[4],M[2]),P(E+1,M[5],M[2]),P(E+A,M[5],M[4])),L(E+2,M[5],M[6]),U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),y(M[8],M[4])?L(E+(A<<1),M[5],M[7]):O(E+(A<<1),M[5],M[8],M[4]),U[E+(A<<1)+1]=M[5],L(E+(A<<1)+2,M[5],M[9]);break;case 122:y(M[4],M[2])?L(E,M[5],M[1]):O(E,M[5],M[4],M[2]),U[E+1]=M[5],y(M[2],M[6])?L(E+2,M[5],M[3]):O(E+2,M[5],M[2],M[6]),U[E+A+1]=M[5],U[E+A+2]=M[5],y(M[8],M[4])?(U[E+A]=M[5],U[E+(A<<1)]=M[5],U[E+(A<<1)+1]=M[5]):(P(E+A,M[5],M[4]),R(E+(A<<1),M[5],M[8],M[4]),P(E+(A<<1)+1,M[5],M[8])),y(M[6],M[8])?L(E+(A<<1)+2,M[5],M[9]):O(E+(A<<1)+2,M[5],M[6],M[8]);break;case 94:y(M[4],M[2])?L(E,M[5],M[1]):O(E,M[5],M[4],M[2]),y(M[2],M[6])?(U[E+1]=M[5],U[E+2]=M[5],U[E+A+2]=M[5]):(P(E+1,M[5],M[2]),R(E+2,M[5],M[2],M[6]),P(E+A+2,M[5],M[6])),U[E+A]=M[5],U[E+A+1]=M[5],y(M[8],M[4])?L(E+(A<<1),M[5],M[7]):O(E+(A<<1),M[5],M[8],M[4]),U[E+(A<<1)+1]=M[5],y(M[6],M[8])?L(E+(A<<1)+2,M[5],M[9]):O(E+(A<<1)+2,M[5],M[6],M[8]);break;case 218:y(M[4],M[2])?L(E,M[5],M[1]):O(E,M[5],M[4],M[2]),U[E+1]=M[5],y(M[2],M[6])?L(E+2,M[5],M[3]):O(E+2,M[5],M[2],M[6]),U[E+A]=M[5],U[E+A+1]=M[5],y(M[8],M[4])?L(E+(A<<1),M[5],M[7]):O(E+(A<<1),M[5],M[8],M[4]),y(M[6],M[8])?(U[E+A+2]=M[5],U[E+(A<<1)+1]=M[5],U[E+(A<<1)+2]=M[5]):(P(E+A+2,M[5],M[6]),P(E+(A<<1)+1,M[5],M[8]),R(E+(A<<1)+2,M[5],M[6],M[8]));break;case 91:y(M[4],M[2])?(U[E]=M[5],U[E+1]=M[5],U[E+A]=M[5]):(R(E,M[5],M[4],M[2]),P(E+1,M[5],M[2]),P(E+A,M[5],M[4])),y(M[2],M[6])?L(E+2,M[5],M[3]):O(E+2,M[5],M[2],M[6]),U[E+A+1]=M[5],U[E+A+2]=M[5],y(M[8],M[4])?L(E+(A<<1),M[5],M[7]):O(E+(A<<1),M[5],M[8],M[4]),U[E+(A<<1)+1]=M[5],y(M[6],M[8])?L(E+(A<<1)+2,M[5],M[9]):O(E+(A<<1)+2,M[5],M[6],M[8]);break;case 229:O(E,M[5],M[4],M[2]),L(E+1,M[5],M[2]),O(E+2,M[5],M[2],M[6]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),L(E+(A<<1),M[5],M[4]),U[E+(A<<1)+1]=M[5],L(E+(A<<1)+2,M[5],M[6]);break;case 167:L(E,M[5],M[4]),U[E+1]=M[5],L(E+2,M[5],M[6]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),O(E+(A<<1),M[5],M[8],M[4]),L(E+(A<<1)+1,M[5],M[8]),O(E+(A<<1)+2,M[5],M[6],M[8]);break;case 173:L(E,M[5],M[2]),L(E+1,M[5],M[2]),O(E+2,M[5],M[2],M[6]),U[E+A]=M[5],U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),L(E+(A<<1),M[5],M[8]),L(E+(A<<1)+1,M[5],M[8]),O(E+(A<<1)+2,M[5],M[6],M[8]);break;case 181:O(E,M[5],M[4],M[2]),L(E+1,M[5],M[2]),L(E+2,M[5],M[2]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],U[E+A+2]=M[5],O(E+(A<<1),M[5],M[8],M[4]),L(E+(A<<1)+1,M[5],M[8]),L(E+(A<<1)+2,M[5],M[8]);break;case 186:y(M[4],M[2])?L(E,M[5],M[1]):O(E,M[5],M[4],M[2]),U[E+1]=M[5],y(M[2],M[6])?L(E+2,M[5],M[3]):O(E+2,M[5],M[2],M[6]),U[E+A]=M[5],U[E+A+1]=M[5],U[E+A+2]=M[5],L(E+(A<<1),M[5],M[8]),L(E+(A<<1)+1,M[5],M[8]),L(E+(A<<1)+2,M[5],M[8]);break;case 115:L(E,M[5],M[4]),U[E+1]=M[5],y(M[2],M[6])?L(E+2,M[5],M[3]):O(E+2,M[5],M[2],M[6]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],U[E+A+2]=M[5],L(E+(A<<1),M[5],M[4]),U[E+(A<<1)+1]=M[5],y(M[6],M[8])?L(E+(A<<1)+2,M[5],M[9]):O(E+(A<<1)+2,M[5],M[6],M[8]);break;case 93:L(E,M[5],M[2]),L(E+1,M[5],M[2]),L(E+2,M[5],M[2]),U[E+A]=M[5],U[E+A+1]=M[5],U[E+A+2]=M[5],y(M[8],M[4])?L(E+(A<<1),M[5],M[7]):O(E+(A<<1),M[5],M[8],M[4]),U[E+(A<<1)+1]=M[5],y(M[6],M[8])?L(E+(A<<1)+2,M[5],M[9]):O(E+(A<<1)+2,M[5],M[6],M[8]);break;case 206:y(M[4],M[2])?L(E,M[5],M[1]):O(E,M[5],M[4],M[2]),U[E+1]=M[5],L(E+2,M[5],M[6]),U[E+A]=M[5],U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),y(M[8],M[4])?L(E+(A<<1),M[5],M[7]):O(E+(A<<1),M[5],M[8],M[4]),U[E+(A<<1)+1]=M[5],L(E+(A<<1)+2,M[5],M[6]);break;case 205:case 201:L(E,M[5],M[2]),L(E+1,M[5],M[2]),O(E+2,M[5],M[2],M[6]),U[E+A]=M[5],U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),y(M[8],M[4])?L(E+(A<<1),M[5],M[7]):O(E+(A<<1),M[5],M[8],M[4]),U[E+(A<<1)+1]=M[5],L(E+(A<<1)+2,M[5],M[6]);break;case 174:case 46:y(M[4],M[2])?L(E,M[5],M[1]):O(E,M[5],M[4],M[2]),U[E+1]=M[5],L(E+2,M[5],M[6]),U[E+A]=M[5],U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),L(E+(A<<1),M[5],M[8]),L(E+(A<<1)+1,M[5],M[8]),O(E+(A<<1)+2,M[5],M[6],M[8]);break;case 179:case 147:L(E,M[5],M[4]),U[E+1]=M[5],y(M[2],M[6])?L(E+2,M[5],M[3]):O(E+2,M[5],M[2],M[6]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],U[E+A+2]=M[5],O(E+(A<<1),M[5],M[8],M[4]),L(E+(A<<1)+1,M[5],M[8]),L(E+(A<<1)+2,M[5],M[8]);break;case 117:case 116:O(E,M[5],M[4],M[2]),L(E+1,M[5],M[2]),L(E+2,M[5],M[2]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],U[E+A+2]=M[5],L(E+(A<<1),M[5],M[4]),U[E+(A<<1)+1]=M[5],y(M[6],M[8])?L(E+(A<<1)+2,M[5],M[9]):O(E+(A<<1)+2,M[5],M[6],M[8]);break;case 189:L(E,M[5],M[2]),L(E+1,M[5],M[2]),L(E+2,M[5],M[2]),U[E+A]=M[5],U[E+A+1]=M[5],U[E+A+2]=M[5],L(E+(A<<1),M[5],M[8]),L(E+(A<<1)+1,M[5],M[8]),L(E+(A<<1)+2,M[5],M[8]);break;case 231:L(E,M[5],M[4]),U[E+1]=M[5],L(E+2,M[5],M[6]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),L(E+(A<<1),M[5],M[4]),U[E+(A<<1)+1]=M[5],L(E+(A<<1)+2,M[5],M[6]);break;case 126:L(E,M[5],M[1]),y(M[2],M[6])?(U[E+1]=M[5],U[E+2]=M[5],U[E+A+2]=M[5]):(P(E+1,M[5],M[2]),R(E+2,M[5],M[2],M[6]),P(E+A+2,M[5],M[6])),U[E+A+1]=M[5],y(M[8],M[4])?(U[E+A]=M[5],U[E+(A<<1)]=M[5],U[E+(A<<1)+1]=M[5]):(P(E+A,M[5],M[4]),R(E+(A<<1),M[5],M[8],M[4]),P(E+(A<<1)+1,M[5],M[8])),L(E+(A<<1)+2,M[5],M[9]);break;case 219:y(M[4],M[2])?(U[E]=M[5],U[E+1]=M[5],U[E+A]=M[5]):(R(E,M[5],M[4],M[2]),P(E+1,M[5],M[2]),P(E+A,M[5],M[4])),L(E+2,M[5],M[3]),U[E+A+1]=M[5],L(E+(A<<1),M[5],M[7]),y(M[6],M[8])?(U[E+A+2]=M[5],U[E+(A<<1)+1]=M[5],U[E+(A<<1)+2]=M[5]):(P(E+A+2,M[5],M[6]),P(E+(A<<1)+1,M[5],M[8]),R(E+(A<<1)+2,M[5],M[6],M[8]));break;case 125:y(M[8],M[4])?(L(E,M[5],M[2]),U[E+A]=M[5],U[E+(A<<1)]=M[5],U[E+(A<<1)+1]=M[5]):(O(E,M[5],M[4],M[2]),L(E+A,M[4],M[5]),S(E+(A<<1),M[8],M[4]),L(E+(A<<1)+1,M[5],M[8])),L(E+1,M[5],M[2]),L(E+2,M[5],M[2]),U[E+A+1]=M[5],U[E+A+2]=M[5],L(E+(A<<1)+2,M[5],M[9]);break;case 221:y(M[6],M[8])?(L(E+2,M[5],M[2]),U[E+A+2]=M[5],U[E+(A<<1)+1]=M[5],U[E+(A<<1)+2]=M[5]):(O(E+2,M[5],M[2],M[6]),L(E+A+2,M[6],M[5]),L(E+(A<<1)+1,M[5],M[8]),S(E+(A<<1)+2,M[6],M[8])),L(E,M[5],M[2]),L(E+1,M[5],M[2]),U[E+A]=M[5],U[E+A+1]=M[5],L(E+(A<<1),M[5],M[7]);break;case 207:y(M[4],M[2])?(U[E]=M[5],U[E+1]=M[5],L(E+2,M[5],M[6]),U[E+A]=M[5]):(S(E,M[4],M[2]),L(E+1,M[2],M[5]),O(E+2,M[5],M[2],M[6]),L(E+A,M[5],M[4])),U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),L(E+(A<<1),M[5],M[7]),U[E+(A<<1)+1]=M[5],L(E+(A<<1)+2,M[5],M[6]);break;case 238:y(M[8],M[4])?(U[E+A]=M[5],U[E+(A<<1)]=M[5],U[E+(A<<1)+1]=M[5],L(E+(A<<1)+2,M[5],M[6])):(L(E+A,M[5],M[4]),S(E+(A<<1),M[8],M[4]),L(E+(A<<1)+1,M[8],M[5]),O(E+(A<<1)+2,M[5],M[6],M[8])),L(E,M[5],M[1]),U[E+1]=M[5],L(E+2,M[5],M[6]),U[E+A+1]=M[5],L(E+A+2,M[5],M[6]);break;case 190:y(M[2],M[6])?(U[E+1]=M[5],U[E+2]=M[5],U[E+A+2]=M[5],L(E+(A<<1)+2,M[5],M[8])):(L(E+1,M[5],M[2]),S(E+2,M[2],M[6]),L(E+A+2,M[6],M[5]),O(E+(A<<1)+2,M[5],M[6],M[8])),L(E,M[5],M[1]),U[E+A]=M[5],U[E+A+1]=M[5],L(E+(A<<1),M[5],M[8]),L(E+(A<<1)+1,M[5],M[8]);break;case 187:y(M[4],M[2])?(U[E]=M[5],U[E+1]=M[5],U[E+A]=M[5],L(E+(A<<1),M[5],M[8])):(S(E,M[4],M[2]),L(E+1,M[5],M[2]),L(E+A,M[4],M[5]),O(E+(A<<1),M[5],M[8],M[4])),L(E+2,M[5],M[3]),U[E+A+1]=M[5],U[E+A+2]=M[5],L(E+(A<<1)+1,M[5],M[8]),L(E+(A<<1)+2,M[5],M[8]);break;case 243:y(M[6],M[8])?(U[E+A+2]=M[5],L(E+(A<<1),M[5],M[4]),U[E+(A<<1)+1]=M[5],U[E+(A<<1)+2]=M[5]):(L(E+A+2,M[5],M[6]),O(E+(A<<1),M[5],M[8],M[4]),L(E+(A<<1)+1,M[8],M[5]),S(E+(A<<1)+2,M[6],M[8])),L(E,M[5],M[4]),U[E+1]=M[5],L(E+2,M[5],M[3]),L(E+A,M[5],M[4]),U[E+A+1]=M[5];break;case 119:y(M[2],M[6])?(L(E,M[5],M[4]),U[E+1]=M[5],U[E+2]=M[5],U[E+A+2]=M[5]):(O(E,M[5],M[4],M[2]),L(E+1,M[2],M[5]),S(E+2,M[2],M[6]),L(E+A+2,M[5],M[6])),L(E+A,M[5],M[4]),U[E+A+1]=M[5],L(E+(A<<1),M[5],M[4]),U[E+(A<<1)+1]=M[5],L(E+(A<<1)+2,M[5],M[9]);break;case 237:case 233:L(E,M[5],M[2]),L(E+1,M[5],M[2]),O(E+2,M[5],M[2],M[6]),U[E+A]=M[5],U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),y(M[8],M[4])?U[E+(A<<1)]=M[5]:O(E+(A<<1),M[5],M[8],M[4]),U[E+(A<<1)+1]=M[5],L(E+(A<<1)+2,M[5],M[6]);break;case 175:case 47:y(M[4],M[2])?U[E]=M[5]:O(E,M[5],M[4],M[2]),U[E+1]=M[5],L(E+2,M[5],M[6]),U[E+A]=M[5],U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),L(E+(A<<1),M[5],M[8]),L(E+(A<<1)+1,M[5],M[8]),O(E+(A<<1)+2,M[5],M[6],M[8]);break;case 183:case 151:L(E,M[5],M[4]),U[E+1]=M[5],y(M[2],M[6])?U[E+2]=M[5]:O(E+2,M[5],M[2],M[6]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],U[E+A+2]=M[5],O(E+(A<<1),M[5],M[8],M[4]),L(E+(A<<1)+1,M[5],M[8]),L(E+(A<<1)+2,M[5],M[8]);break;case 245:case 244:O(E,M[5],M[4],M[2]),L(E+1,M[5],M[2]),L(E+2,M[5],M[2]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],U[E+A+2]=M[5],L(E+(A<<1),M[5],M[4]),U[E+(A<<1)+1]=M[5],y(M[6],M[8])?U[E+(A<<1)+2]=M[5]:O(E+(A<<1)+2,M[5],M[6],M[8]);break;case 250:L(E,M[5],M[1]),U[E+1]=M[5],L(E+2,M[5],M[3]),U[E+A+1]=M[5],y(M[8],M[4])?(U[E+A]=M[5],U[E+(A<<1)]=M[5]):(P(E+A,M[5],M[4]),R(E+(A<<1),M[5],M[8],M[4])),U[E+(A<<1)+1]=M[5],y(M[6],M[8])?(U[E+A+2]=M[5],U[E+(A<<1)+2]=M[5]):(P(E+A+2,M[5],M[6]),R(E+(A<<1)+2,M[5],M[6],M[8]));break;case 123:y(M[4],M[2])?(U[E]=M[5],U[E+1]=M[5]):(R(E,M[5],M[4],M[2]),P(E+1,M[5],M[2])),L(E+2,M[5],M[3]),U[E+A]=M[5],U[E+A+1]=M[5],U[E+A+2]=M[5],y(M[8],M[4])?(U[E+(A<<1)]=M[5],U[E+(A<<1)+1]=M[5]):(R(E+(A<<1),M[5],M[8],M[4]),P(E+(A<<1)+1,M[5],M[8])),L(E+(A<<1)+2,M[5],M[9]);break;case 95:y(M[4],M[2])?(U[E]=M[5],U[E+A]=M[5]):(R(E,M[5],M[4],M[2]),P(E+A,M[5],M[4])),U[E+1]=M[5],y(M[2],M[6])?(U[E+2]=M[5],U[E+A+2]=M[5]):(R(E+2,M[5],M[2],M[6]),P(E+A+2,M[5],M[6])),U[E+A+1]=M[5],L(E+(A<<1),M[5],M[7]),U[E+(A<<1)+1]=M[5],L(E+(A<<1)+2,M[5],M[9]);break;case 222:L(E,M[5],M[1]),y(M[2],M[6])?(U[E+1]=M[5],U[E+2]=M[5]):(P(E+1,M[5],M[2]),R(E+2,M[5],M[2],M[6])),U[E+A]=M[5],U[E+A+1]=M[5],U[E+A+2]=M[5],L(E+(A<<1),M[5],M[7]),y(M[6],M[8])?(U[E+(A<<1)+1]=M[5],U[E+(A<<1)+2]=M[5]):(P(E+(A<<1)+1,M[5],M[8]),R(E+(A<<1)+2,M[5],M[6],M[8]));break;case 252:L(E,M[5],M[1]),L(E+1,M[5],M[2]),L(E+2,M[5],M[2]),U[E+A+1]=M[5],U[E+A+2]=M[5],y(M[8],M[4])?(U[E+A]=M[5],U[E+(A<<1)]=M[5]):(P(E+A,M[5],M[4]),R(E+(A<<1),M[5],M[8],M[4])),U[E+(A<<1)+1]=M[5],y(M[6],M[8])?U[E+(A<<1)+2]=M[5]:O(E+(A<<1)+2,M[5],M[6],M[8]);break;case 249:L(E,M[5],M[2]),L(E+1,M[5],M[2]),L(E+2,M[5],M[3]),U[E+A]=M[5],U[E+A+1]=M[5],y(M[8],M[4])?U[E+(A<<1)]=M[5]:O(E+(A<<1),M[5],M[8],M[4]),U[E+(A<<1)+1]=M[5],y(M[6],M[8])?(U[E+A+2]=M[5],U[E+(A<<1)+2]=M[5]):(P(E+A+2,M[5],M[6]),R(E+(A<<1)+2,M[5],M[6],M[8]));break;case 235:y(M[4],M[2])?(U[E]=M[5],U[E+1]=M[5]):(R(E,M[5],M[4],M[2]),P(E+1,M[5],M[2])),L(E+2,M[5],M[3]),U[E+A]=M[5],U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),y(M[8],M[4])?U[E+(A<<1)]=M[5]:O(E+(A<<1),M[5],M[8],M[4]),U[E+(A<<1)+1]=M[5],L(E+(A<<1)+2,M[5],M[6]);break;case 111:y(M[4],M[2])?U[E]=M[5]:O(E,M[5],M[4],M[2]),U[E+1]=M[5],L(E+2,M[5],M[6]),U[E+A]=M[5],U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),y(M[8],M[4])?(U[E+(A<<1)]=M[5],U[E+(A<<1)+1]=M[5]):(R(E+(A<<1),M[5],M[8],M[4]),P(E+(A<<1)+1,M[5],M[8])),L(E+(A<<1)+2,M[5],M[9]);break;case 63:y(M[4],M[2])?U[E]=M[5]:O(E,M[5],M[4],M[2]),U[E+1]=M[5],y(M[2],M[6])?(U[E+2]=M[5],U[E+A+2]=M[5]):(R(E+2,M[5],M[2],M[6]),P(E+A+2,M[5],M[6])),U[E+A]=M[5],U[E+A+1]=M[5],L(E+(A<<1),M[5],M[8]),L(E+(A<<1)+1,M[5],M[8]),L(E+(A<<1)+2,M[5],M[9]);break;case 159:y(M[4],M[2])?(U[E]=M[5],U[E+A]=M[5]):(R(E,M[5],M[4],M[2]),P(E+A,M[5],M[4])),U[E+1]=M[5],y(M[2],M[6])?U[E+2]=M[5]:O(E+2,M[5],M[2],M[6]),U[E+A+1]=M[5],U[E+A+2]=M[5],L(E+(A<<1),M[5],M[7]),L(E+(A<<1)+1,M[5],M[8]),L(E+(A<<1)+2,M[5],M[8]);break;case 215:L(E,M[5],M[4]),U[E+1]=M[5],y(M[2],M[6])?U[E+2]=M[5]:O(E+2,M[5],M[2],M[6]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],U[E+A+2]=M[5],L(E+(A<<1),M[5],M[7]),y(M[6],M[8])?(U[E+(A<<1)+1]=M[5],U[E+(A<<1)+2]=M[5]):(P(E+(A<<1)+1,M[5],M[8]),R(E+(A<<1)+2,M[5],M[6],M[8]));break;case 246:L(E,M[5],M[1]),y(M[2],M[6])?(U[E+1]=M[5],U[E+2]=M[5]):(P(E+1,M[5],M[2]),R(E+2,M[5],M[2],M[6])),L(E+A,M[5],M[4]),U[E+A+1]=M[5],U[E+A+2]=M[5],L(E+(A<<1),M[5],M[4]),U[E+(A<<1)+1]=M[5],y(M[6],M[8])?U[E+(A<<1)+2]=M[5]:O(E+(A<<1)+2,M[5],M[6],M[8]);break;case 254:L(E,M[5],M[1]),y(M[2],M[6])?(U[E+1]=M[5],U[E+2]=M[5]):(P(E+1,M[5],M[2]),R(E+2,M[5],M[2],M[6])),U[E+A+1]=M[5],y(M[8],M[4])?(U[E+A]=M[5],U[E+(A<<1)]=M[5]):(P(E+A,M[5],M[4]),R(E+(A<<1),M[5],M[8],M[4])),y(M[6],M[8])?(U[E+A+2]=M[5],U[E+(A<<1)+1]=M[5],U[E+(A<<1)+2]=M[5]):(P(E+A+2,M[5],M[6]),P(E+(A<<1)+1,M[5],M[8]),O(E+(A<<1)+2,M[5],M[6],M[8]));break;case 253:L(E,M[5],M[2]),L(E+1,M[5],M[2]),L(E+2,M[5],M[2]),U[E+A]=M[5],U[E+A+1]=M[5],U[E+A+2]=M[5],y(M[8],M[4])?U[E+(A<<1)]=M[5]:O(E+(A<<1),M[5],M[8],M[4]),U[E+(A<<1)+1]=M[5],y(M[6],M[8])?U[E+(A<<1)+2]=M[5]:O(E+(A<<1)+2,M[5],M[6],M[8]);break;case 251:y(M[4],M[2])?(U[E]=M[5],U[E+1]=M[5]):(R(E,M[5],M[4],M[2]),P(E+1,M[5],M[2])),L(E+2,M[5],M[3]),U[E+A+1]=M[5],y(M[8],M[4])?(U[E+A]=M[5],U[E+(A<<1)]=M[5],U[E+(A<<1)+1]=M[5]):(P(E+A,M[5],M[4]),O(E+(A<<1),M[5],M[8],M[4]),P(E+(A<<1)+1,M[5],M[8])),y(M[6],M[8])?(U[E+A+2]=M[5],U[E+(A<<1)+2]=M[5]):(P(E+A+2,M[5],M[6]),R(E+(A<<1)+2,M[5],M[6],M[8]));break;case 239:y(M[4],M[2])?U[E]=M[5]:O(E,M[5],M[4],M[2]),U[E+1]=M[5],L(E+2,M[5],M[6]),U[E+A]=M[5],U[E+A+1]=M[5],L(E+A+2,M[5],M[6]),y(M[8],M[4])?U[E+(A<<1)]=M[5]:O(E+(A<<1),M[5],M[8],M[4]),U[E+(A<<1)+1]=M[5],L(E+(A<<1)+2,M[5],M[6]);break;case 127:y(M[4],M[2])?(U[E]=M[5],U[E+1]=M[5],U[E+A]=M[5]):(O(E,M[5],M[4],M[2]),P(E+1,M[5],M[2]),P(E+A,M[5],M[4])),y(M[2],M[6])?(U[E+2]=M[5],U[E+A+2]=M[5]):(R(E+2,M[5],M[2],M[6]),P(E+A+2,M[5],M[6])),U[E+A+1]=M[5],y(M[8],M[4])?(U[E+(A<<1)]=M[5],U[E+(A<<1)+1]=M[5]):(R(E+(A<<1),M[5],M[8],M[4]),P(E+(A<<1)+1,M[5],M[8])),L(E+(A<<1)+2,M[5],M[9]);break;case 191:y(M[4],M[2])?U[E]=M[5]:O(E,M[5],M[4],M[2]),U[E+1]=M[5],y(M[2],M[6])?U[E+2]=M[5]:O(E+2,M[5],M[2],M[6]),U[E+A]=M[5],U[E+A+1]=M[5],U[E+A+2]=M[5],L(E+(A<<1),M[5],M[8]),L(E+(A<<1)+1,M[5],M[8]),L(E+(A<<1)+2,M[5],M[8]);break;case 223:y(M[4],M[2])?(U[E]=M[5],U[E+A]=M[5]):(R(E,M[5],M[4],M[2]),P(E+A,M[5],M[4])),y(M[2],M[6])?(U[E+1]=M[5],U[E+2]=M[5],U[E+A+2]=M[5]):(P(E+1,M[5],M[2]),O(E+2,M[5],M[2],M[6]),P(E+A+2,M[5],M[6])),U[E+A+1]=M[5],L(E+(A<<1),M[5],M[7]),y(M[6],M[8])?(U[E+(A<<1)+1]=M[5],U[E+(A<<1)+2]=M[5]):(P(E+(A<<1)+1,M[5],M[8]),R(E+(A<<1)+2,M[5],M[6],M[8]));break;case 247:L(E,M[5],M[4]),U[E+1]=M[5],y(M[2],M[6])?U[E+2]=M[5]:O(E+2,M[5],M[2],M[6]),L(E+A,M[5],M[4]),U[E+A+1]=M[5],U[E+A+2]=M[5],L(E+(A<<1),M[5],M[4]),U[E+(A<<1)+1]=M[5],y(M[6],M[8])?U[E+(A<<1)+2]=M[5]:O(E+(A<<1)+2,M[5],M[6],M[8]);break;case 255:y(M[4],M[2])?U[E]=M[5]:O(E,M[5],M[4],M[2]),U[E+1]=M[5],y(M[2],M[6])?U[E+2]=M[5]:O(E+2,M[5],M[2],M[6]),U[E+A]=M[5],U[E+A+1]=M[5],U[E+A+2]=M[5],y(M[8],M[4])?U[E+(A<<1)]=M[5]:O(E+(A<<1),M[5],M[8],M[4]),U[E+(A<<1)+1]=M[5],y(M[6],M[8])?U[E+(A<<1)+2]=M[5]:O(E+(A<<1)+2,M[5],M[6],M[8])}p++,E+=3}E+=A<<1}},E=function(a,s){
var r,w,x,C,H,M,A,E=[],p=a<<2,y=0,q=0,z=f,L=h,O=u,P=d,R=g,S=v,T=l,U=m,j=D,B=I,F=e,G=c,J=b,K=k,N=t,Q=n,V=i,W=o;for(w=0;s>w;w++){for(C=w>0?-a:0,H=s-1>w?a:0,r=0;a>r;r++){E[2]=F[q+C],E[5]=F[q],E[8]=F[q+H],r>0?(E[1]=F[q+C-1],E[4]=F[q-1],E[7]=F[q+H-1]):(E[1]=E[2],E[4]=E[5],E[7]=E[8]),a-1>r?(E[3]=F[q+C+1],E[6]=F[q+1],E[9]=F[q+H+1]):(E[3]=E[2],E[6]=E[5],E[9]=E[8]);var X=0,Y=1;for(M=O(E[5]),x=1;10>x;x++)5!==x&&(E[x]!==E[5]&&(A=O(E[x]),(L.abs((M&J)-(A&J))>Q||L.abs((M&K)-(A&K))>V||L.abs((M&N)-(A&N))>W)&&(X|=Y)),Y<<=1);switch(X){case 0:case 1:case 4:case 32:case 128:case 5:case 132:case 160:case 33:case 129:case 36:case 133:case 164:case 161:case 37:case 165:R(y,E[5],E[2],E[4]),U(y+1,E[5],E[2],E[4]),U(y+2,E[5],E[2],E[6]),R(y+3,E[5],E[2],E[6]),U(y+p,E[5],E[4],E[2]),j(y+p+1,E[5],E[4],E[2]),j(y+p+2,E[5],E[6],E[2]),U(y+p+3,E[5],E[6],E[2]),U(y+(p<<1),E[5],E[4],E[8]),j(y+(p<<1)+1,E[5],E[4],E[8]),j(y+(p<<1)+2,E[5],E[6],E[8]),U(y+(p<<1)+3,E[5],E[6],E[8]),R(y+3*p,E[5],E[8],E[4]),U(y+3*p+1,E[5],E[8],E[4]),U(y+3*p+2,E[5],E[8],E[6]),R(y+3*p+3,E[5],E[8],E[6]);break;case 2:case 34:case 130:case 162:B(y,E[5],E[1]),P(y+1,E[5],E[1]),P(y+2,E[5],E[3]),B(y+3,E[5],E[3]),U(y+p,E[5],E[4],E[1]),S(y+p+1,E[5],E[1]),S(y+p+2,E[5],E[3]),U(y+p+3,E[5],E[6],E[3]),U(y+(p<<1),E[5],E[4],E[8]),j(y+(p<<1)+1,E[5],E[4],E[8]),j(y+(p<<1)+2,E[5],E[6],E[8]),U(y+(p<<1)+3,E[5],E[6],E[8]),R(y+3*p,E[5],E[8],E[4]),U(y+3*p+1,E[5],E[8],E[4]),U(y+3*p+2,E[5],E[8],E[6]),R(y+3*p+3,E[5],E[8],E[6]);break;case 16:case 17:case 48:case 49:R(y,E[5],E[2],E[4]),U(y+1,E[5],E[2],E[4]),U(y+2,E[5],E[2],E[3]),B(y+3,E[5],E[3]),U(y+p,E[5],E[4],E[2]),j(y+p+1,E[5],E[4],E[2]),S(y+p+2,E[5],E[3]),P(y+p+3,E[5],E[3]),U(y+(p<<1),E[5],E[4],E[8]),j(y+(p<<1)+1,E[5],E[4],E[8]),S(y+(p<<1)+2,E[5],E[9]),P(y+(p<<1)+3,E[5],E[9]),R(y+3*p,E[5],E[8],E[4]),U(y+3*p+1,E[5],E[8],E[4]),U(y+3*p+2,E[5],E[8],E[9]),B(y+3*p+3,E[5],E[9]);break;case 64:case 65:case 68:case 69:R(y,E[5],E[2],E[4]),U(y+1,E[5],E[2],E[4]),U(y+2,E[5],E[2],E[6]),R(y+3,E[5],E[2],E[6]),U(y+p,E[5],E[4],E[2]),j(y+p+1,E[5],E[4],E[2]),j(y+p+2,E[5],E[6],E[2]),U(y+p+3,E[5],E[6],E[2]),U(y+(p<<1),E[5],E[4],E[7]),S(y+(p<<1)+1,E[5],E[7]),S(y+(p<<1)+2,E[5],E[9]),U(y+(p<<1)+3,E[5],E[6],E[9]),B(y+3*p,E[5],E[7]),P(y+3*p+1,E[5],E[7]),P(y+3*p+2,E[5],E[9]),B(y+3*p+3,E[5],E[9]);break;case 8:case 12:case 136:case 140:B(y,E[5],E[1]),U(y+1,E[5],E[2],E[1]),U(y+2,E[5],E[2],E[6]),R(y+3,E[5],E[2],E[6]),P(y+p,E[5],E[1]),S(y+p+1,E[5],E[1]),j(y+p+2,E[5],E[6],E[2]),U(y+p+3,E[5],E[6],E[2]),P(y+(p<<1),E[5],E[7]),S(y+(p<<1)+1,E[5],E[7]),j(y+(p<<1)+2,E[5],E[6],E[8]),U(y+(p<<1)+3,E[5],E[6],E[8]),B(y+3*p,E[5],E[7]),U(y+3*p+1,E[5],E[8],E[7]),U(y+3*p+2,E[5],E[8],E[6]),R(y+3*p+3,E[5],E[8],E[6]);break;case 3:case 35:case 131:case 163:B(y,E[5],E[4]),S(y+1,E[5],E[4]),P(y+2,E[5],E[3]),B(y+3,E[5],E[3]),B(y+p,E[5],E[4]),S(y+p+1,E[5],E[4]),S(y+p+2,E[5],E[3]),U(y+p+3,E[5],E[6],E[3]),U(y+(p<<1),E[5],E[4],E[8]),j(y+(p<<1)+1,E[5],E[4],E[8]),j(y+(p<<1)+2,E[5],E[6],E[8]),U(y+(p<<1)+3,E[5],E[6],E[8]),R(y+3*p,E[5],E[8],E[4]),U(y+3*p+1,E[5],E[8],E[4]),U(y+3*p+2,E[5],E[8],E[6]),R(y+3*p+3,E[5],E[8],E[6]);break;case 6:case 38:case 134:case 166:B(y,E[5],E[1]),P(y+1,E[5],E[1]),S(y+2,E[5],E[6]),B(y+3,E[5],E[6]),U(y+p,E[5],E[4],E[1]),S(y+p+1,E[5],E[1]),S(y+p+2,E[5],E[6]),B(y+p+3,E[5],E[6]),U(y+(p<<1),E[5],E[4],E[8]),j(y+(p<<1)+1,E[5],E[4],E[8]),j(y+(p<<1)+2,E[5],E[6],E[8]),U(y+(p<<1)+3,E[5],E[6],E[8]),R(y+3*p,E[5],E[8],E[4]),U(y+3*p+1,E[5],E[8],E[4]),U(y+3*p+2,E[5],E[8],E[6]),R(y+3*p+3,E[5],E[8],E[6]);break;case 20:case 21:case 52:case 53:R(y,E[5],E[2],E[4]),U(y+1,E[5],E[2],E[4]),B(y+2,E[5],E[2]),B(y+3,E[5],E[2]),U(y+p,E[5],E[4],E[2]),j(y+p+1,E[5],E[4],E[2]),S(y+p+2,E[5],E[2]),S(y+p+3,E[5],E[2]),U(y+(p<<1),E[5],E[4],E[8]),j(y+(p<<1)+1,E[5],E[4],E[8]),S(y+(p<<1)+2,E[5],E[9]),P(y+(p<<1)+3,E[5],E[9]),R(y+3*p,E[5],E[8],E[4]),U(y+3*p+1,E[5],E[8],E[4]),U(y+3*p+2,E[5],E[8],E[9]),B(y+3*p+3,E[5],E[9]);break;case 144:case 145:case 176:case 177:R(y,E[5],E[2],E[4]),U(y+1,E[5],E[2],E[4]),U(y+2,E[5],E[2],E[3]),B(y+3,E[5],E[3]),U(y+p,E[5],E[4],E[2]),j(y+p+1,E[5],E[4],E[2]),S(y+p+2,E[5],E[3]),P(y+p+3,E[5],E[3]),U(y+(p<<1),E[5],E[4],E[8]),j(y+(p<<1)+1,E[5],E[4],E[8]),S(y+(p<<1)+2,E[5],E[8]),S(y+(p<<1)+3,E[5],E[8]),R(y+3*p,E[5],E[8],E[4]),U(y+3*p+1,E[5],E[8],E[4]),B(y+3*p+2,E[5],E[8]),B(y+3*p+3,E[5],E[8]);break;case 192:case 193:case 196:case 197:R(y,E[5],E[2],E[4]),U(y+1,E[5],E[2],E[4]),U(y+2,E[5],E[2],E[6]),R(y+3,E[5],E[2],E[6]),U(y+p,E[5],E[4],E[2]),j(y+p+1,E[5],E[4],E[2]),j(y+p+2,E[5],E[6],E[2]),U(y+p+3,E[5],E[6],E[2]),U(y+(p<<1),E[5],E[4],E[7]),S(y+(p<<1)+1,E[5],E[7]),S(y+(p<<1)+2,E[5],E[6]),B(y+(p<<1)+3,E[5],E[6]),B(y+3*p,E[5],E[7]),P(y+3*p+1,E[5],E[7]),S(y+3*p+2,E[5],E[6]),B(y+3*p+3,E[5],E[6]);break;case 96:case 97:case 100:case 101:R(y,E[5],E[2],E[4]),U(y+1,E[5],E[2],E[4]),U(y+2,E[5],E[2],E[6]),R(y+3,E[5],E[2],E[6]),U(y+p,E[5],E[4],E[2]),j(y+p+1,E[5],E[4],E[2]),j(y+p+2,E[5],E[6],E[2]),U(y+p+3,E[5],E[6],E[2]),B(y+(p<<1),E[5],E[4]),S(y+(p<<1)+1,E[5],E[4]),S(y+(p<<1)+2,E[5],E[9]),U(y+(p<<1)+3,E[5],E[6],E[9]),B(y+3*p,E[5],E[4]),S(y+3*p+1,E[5],E[4]),P(y+3*p+2,E[5],E[9]),B(y+3*p+3,E[5],E[9]);break;case 40:case 44:case 168:case 172:B(y,E[5],E[1]),U(y+1,E[5],E[2],E[1]),U(y+2,E[5],E[2],E[6]),R(y+3,E[5],E[2],E[6]),P(y+p,E[5],E[1]),S(y+p+1,E[5],E[1]),j(y+p+2,E[5],E[6],E[2]),U(y+p+3,E[5],E[6],E[2]),S(y+(p<<1),E[5],E[8]),S(y+(p<<1)+1,E[5],E[8]),j(y+(p<<1)+2,E[5],E[6],E[8]),U(y+(p<<1)+3,E[5],E[6],E[8]),B(y+3*p,E[5],E[8]),B(y+3*p+1,E[5],E[8]),U(y+3*p+2,E[5],E[8],E[6]),R(y+3*p+3,E[5],E[8],E[6]);break;case 9:case 13:case 137:case 141:B(y,E[5],E[2]),B(y+1,E[5],E[2]),U(y+2,E[5],E[2],E[6]),R(y+3,E[5],E[2],E[6]),S(y+p,E[5],E[2]),S(y+p+1,E[5],E[2]),j(y+p+2,E[5],E[6],E[2]),U(y+p+3,E[5],E[6],E[2]),P(y+(p<<1),E[5],E[7]),S(y+(p<<1)+1,E[5],E[7]),j(y+(p<<1)+2,E[5],E[6],E[8]),U(y+(p<<1)+3,E[5],E[6],E[8]),B(y+3*p,E[5],E[7]),U(y+3*p+1,E[5],E[8],E[7]),U(y+3*p+2,E[5],E[8],E[6]),R(y+3*p+3,E[5],E[8],E[6]);break;case 18:case 50:B(y,E[5],E[1]),P(y+1,E[5],E[1]),z(E[2],E[6])?(P(y+2,E[5],E[3]),B(y+3,E[5],E[3]),S(y+p+2,E[5],E[3]),P(y+p+3,E[5],E[3])):(T(y+2,E[2],E[5]),T(y+3,E[2],E[6]),G[y+p+2]=E[5],T(y+p+3,E[6],E[5])),U(y+p,E[5],E[4],E[1]),S(y+p+1,E[5],E[1]),U(y+(p<<1),E[5],E[4],E[8]),j(y+(p<<1)+1,E[5],E[4],E[8]),S(y+(p<<1)+2,E[5],E[9]),P(y+(p<<1)+3,E[5],E[9]),R(y+3*p,E[5],E[8],E[4]),U(y+3*p+1,E[5],E[8],E[4]),U(y+3*p+2,E[5],E[8],E[9]),B(y+3*p+3,E[5],E[9]);break;case 80:case 81:R(y,E[5],E[2],E[4]),U(y+1,E[5],E[2],E[4]),U(y+2,E[5],E[2],E[3]),B(y+3,E[5],E[3]),U(y+p,E[5],E[4],E[2]),j(y+p+1,E[5],E[4],E[2]),S(y+p+2,E[5],E[3]),P(y+p+3,E[5],E[3]),U(y+(p<<1),E[5],E[4],E[7]),S(y+(p<<1)+1,E[5],E[7]),z(E[6],E[8])?(S(y+(p<<1)+2,E[5],E[9]),P(y+(p<<1)+3,E[5],E[9]),P(y+3*p+2,E[5],E[9]),B(y+3*p+3,E[5],E[9])):(G[y+(p<<1)+2]=E[5],T(y+(p<<1)+3,E[6],E[5]),T(y+3*p+2,E[8],E[5]),T(y+3*p+3,E[8],E[6])),B(y+3*p,E[5],E[7]),P(y+3*p+1,E[5],E[7]);break;case 72:case 76:B(y,E[5],E[1]),U(y+1,E[5],E[2],E[1]),U(y+2,E[5],E[2],E[6]),R(y+3,E[5],E[2],E[6]),P(y+p,E[5],E[1]),S(y+p+1,E[5],E[1]),j(y+p+2,E[5],E[6],E[2]),U(y+p+3,E[5],E[6],E[2]),z(E[8],E[4])?(P(y+(p<<1),E[5],E[7]),S(y+(p<<1)+1,E[5],E[7]),B(y+3*p,E[5],E[7]),P(y+3*p+1,E[5],E[7])):(T(y+(p<<1),E[4],E[5]),G[y+(p<<1)+1]=E[5],T(y+3*p,E[8],E[4]),T(y+3*p+1,E[8],E[5])),S(y+(p<<1)+2,E[5],E[9]),U(y+(p<<1)+3,E[5],E[6],E[9]),P(y+3*p+2,E[5],E[9]),B(y+3*p+3,E[5],E[9]);break;case 10:case 138:z(E[4],E[2])?(B(y,E[5],E[1]),P(y+1,E[5],E[1]),P(y+p,E[5],E[1]),S(y+p+1,E[5],E[1])):(T(y,E[2],E[4]),T(y+1,E[2],E[5]),T(y+p,E[4],E[5]),G[y+p+1]=E[5]),P(y+2,E[5],E[3]),B(y+3,E[5],E[3]),S(y+p+2,E[5],E[3]),U(y+p+3,E[5],E[6],E[3]),P(y+(p<<1),E[5],E[7]),S(y+(p<<1)+1,E[5],E[7]),j(y+(p<<1)+2,E[5],E[6],E[8]),U(y+(p<<1)+3,E[5],E[6],E[8]),B(y+3*p,E[5],E[7]),U(y+3*p+1,E[5],E[8],E[7]),U(y+3*p+2,E[5],E[8],E[6]),R(y+3*p+3,E[5],E[8],E[6]);break;case 66:B(y,E[5],E[1]),P(y+1,E[5],E[1]),P(y+2,E[5],E[3]),B(y+3,E[5],E[3]),U(y+p,E[5],E[4],E[1]),S(y+p+1,E[5],E[1]),S(y+p+2,E[5],E[3]),U(y+p+3,E[5],E[6],E[3]),U(y+(p<<1),E[5],E[4],E[7]),S(y+(p<<1)+1,E[5],E[7]),S(y+(p<<1)+2,E[5],E[9]),U(y+(p<<1)+3,E[5],E[6],E[9]),B(y+3*p,E[5],E[7]),P(y+3*p+1,E[5],E[7]),P(y+3*p+2,E[5],E[9]),B(y+3*p+3,E[5],E[9]);break;case 24:B(y,E[5],E[1]),U(y+1,E[5],E[2],E[1]),U(y+2,E[5],E[2],E[3]),B(y+3,E[5],E[3]),P(y+p,E[5],E[1]),S(y+p+1,E[5],E[1]),S(y+p+2,E[5],E[3]),P(y+p+3,E[5],E[3]),P(y+(p<<1),E[5],E[7]),S(y+(p<<1)+1,E[5],E[7]),S(y+(p<<1)+2,E[5],E[9]),P(y+(p<<1)+3,E[5],E[9]),B(y+3*p,E[5],E[7]),U(y+3*p+1,E[5],E[8],E[7]),U(y+3*p+2,E[5],E[8],E[9]),B(y+3*p+3,E[5],E[9]);break;case 7:case 39:case 135:B(y,E[5],E[4]),S(y+1,E[5],E[4]),S(y+2,E[5],E[6]),B(y+3,E[5],E[6]),B(y+p,E[5],E[4]),S(y+p+1,E[5],E[4]),S(y+p+2,E[5],E[6]),B(y+p+3,E[5],E[6]),U(y+(p<<1),E[5],E[4],E[8]),j(y+(p<<1)+1,E[5],E[4],E[8]),j(y+(p<<1)+2,E[5],E[6],E[8]),U(y+(p<<1)+3,E[5],E[6],E[8]),R(y+3*p,E[5],E[8],E[4]),U(y+3*p+1,E[5],E[8],E[4]),U(y+3*p+2,E[5],E[8],E[6]),R(y+3*p+3,E[5],E[8],E[6]);break;case 148:case 149:case 180:R(y,E[5],E[2],E[4]),U(y+1,E[5],E[2],E[4]),B(y+2,E[5],E[2]),B(y+3,E[5],E[2]),U(y+p,E[5],E[4],E[2]),j(y+p+1,E[5],E[4],E[2]),S(y+p+2,E[5],E[2]),S(y+p+3,E[5],E[2]),U(y+(p<<1),E[5],E[4],E[8]),j(y+(p<<1)+1,E[5],E[4],E[8]),S(y+(p<<1)+2,E[5],E[8]),S(y+(p<<1)+3,E[5],E[8]),R(y+3*p,E[5],E[8],E[4]),U(y+3*p+1,E[5],E[8],E[4]),B(y+3*p+2,E[5],E[8]),B(y+3*p+3,E[5],E[8]);break;case 224:case 228:case 225:R(y,E[5],E[2],E[4]),U(y+1,E[5],E[2],E[4]),U(y+2,E[5],E[2],E[6]),R(y+3,E[5],E[2],E[6]),U(y+p,E[5],E[4],E[2]),j(y+p+1,E[5],E[4],E[2]),j(y+p+2,E[5],E[6],E[2]),U(y+p+3,E[5],E[6],E[2]),B(y+(p<<1),E[5],E[4]),S(y+(p<<1)+1,E[5],E[4]),S(y+(p<<1)+2,E[5],E[6]),B(y+(p<<1)+3,E[5],E[6]),B(y+3*p,E[5],E[4]),S(y+3*p+1,E[5],E[4]),S(y+3*p+2,E[5],E[6]),B(y+3*p+3,E[5],E[6]);break;case 41:case 169:case 45:B(y,E[5],E[2]),B(y+1,E[5],E[2]),U(y+2,E[5],E[2],E[6]),R(y+3,E[5],E[2],E[6]),S(y+p,E[5],E[2]),S(y+p+1,E[5],E[2]),j(y+p+2,E[5],E[6],E[2]),U(y+p+3,E[5],E[6],E[2]),S(y+(p<<1),E[5],E[8]),S(y+(p<<1)+1,E[5],E[8]),j(y+(p<<1)+2,E[5],E[6],E[8]),U(y+(p<<1)+3,E[5],E[6],E[8]),B(y+3*p,E[5],E[8]),B(y+3*p+1,E[5],E[8]),U(y+3*p+2,E[5],E[8],E[6]),R(y+3*p+3,E[5],E[8],E[6]);break;case 22:case 54:B(y,E[5],E[1]),P(y+1,E[5],E[1]),z(E[2],E[6])?(G[y+2]=E[5],G[y+3]=E[5],G[y+p+3]=E[5]):(T(y+2,E[2],E[5]),T(y+3,E[2],E[6]),T(y+p+3,E[6],E[5])),U(y+p,E[5],E[4],E[1]),S(y+p+1,E[5],E[1]),G[y+p+2]=E[5],U(y+(p<<1),E[5],E[4],E[8]),j(y+(p<<1)+1,E[5],E[4],E[8]),S(y+(p<<1)+2,E[5],E[9]),P(y+(p<<1)+3,E[5],E[9]),R(y+3*p,E[5],E[8],E[4]),U(y+3*p+1,E[5],E[8],E[4]),U(y+3*p+2,E[5],E[8],E[9]),B(y+3*p+3,E[5],E[9]);break;case 208:case 209:R(y,E[5],E[2],E[4]),U(y+1,E[5],E[2],E[4]),U(y+2,E[5],E[2],E[3]),B(y+3,E[5],E[3]),U(y+p,E[5],E[4],E[2]),j(y+p+1,E[5],E[4],E[2]),S(y+p+2,E[5],E[3]),P(y+p+3,E[5],E[3]),U(y+(p<<1),E[5],E[4],E[7]),S(y+(p<<1)+1,E[5],E[7]),G[y+(p<<1)+2]=E[5],z(E[6],E[8])?(G[y+(p<<1)+3]=E[5],G[y+3*p+2]=E[5],G[y+3*p+3]=E[5]):(T(y+(p<<1)+3,E[6],E[5]),T(y+3*p+2,E[8],E[5]),T(y+3*p+3,E[8],E[6])),B(y+3*p,E[5],E[7]),P(y+3*p+1,E[5],E[7]);break;case 104:case 108:B(y,E[5],E[1]),U(y+1,E[5],E[2],E[1]),U(y+2,E[5],E[2],E[6]),R(y+3,E[5],E[2],E[6]),P(y+p,E[5],E[1]),S(y+p+1,E[5],E[1]),j(y+p+2,E[5],E[6],E[2]),U(y+p+3,E[5],E[6],E[2]),z(E[8],E[4])?(G[y+(p<<1)]=E[5],G[y+3*p]=E[5],G[y+3*p+1]=E[5]):(T(y+(p<<1),E[4],E[5]),T(y+3*p,E[8],E[4]),T(y+3*p+1,E[8],E[5])),G[y+(p<<1)+1]=E[5],S(y+(p<<1)+2,E[5],E[9]),U(y+(p<<1)+3,E[5],E[6],E[9]),P(y+3*p+2,E[5],E[9]),B(y+3*p+3,E[5],E[9]);break;case 11:case 139:z(E[4],E[2])?(G[y]=E[5],G[y+1]=E[5],G[y+p]=E[5]):(T(y,E[2],E[4]),T(y+1,E[2],E[5]),T(y+p,E[4],E[5])),P(y+2,E[5],E[3]),B(y+3,E[5],E[3]),G[y+p+1]=E[5],S(y+p+2,E[5],E[3]),U(y+p+3,E[5],E[6],E[3]),P(y+(p<<1),E[5],E[7]),S(y+(p<<1)+1,E[5],E[7]),j(y+(p<<1)+2,E[5],E[6],E[8]),U(y+(p<<1)+3,E[5],E[6],E[8]),B(y+3*p,E[5],E[7]),U(y+3*p+1,E[5],E[8],E[7]),U(y+3*p+2,E[5],E[8],E[6]),R(y+3*p+3,E[5],E[8],E[6]);break;case 19:case 51:z(E[2],E[6])?(B(y,E[5],E[4]),S(y+1,E[5],E[4]),P(y+2,E[5],E[3]),B(y+3,E[5],E[3]),S(y+p+2,E[5],E[3]),P(y+p+3,E[5],E[3])):(P(y,E[5],E[2]),P(y+1,E[2],E[5]),B(y+2,E[2],E[6]),T(y+3,E[2],E[6]),j(y+p+2,E[5],E[6],E[2]),R(y+p+3,E[6],E[5],E[2])),B(y+p,E[5],E[4]),S(y+p+1,E[5],E[4]),U(y+(p<<1),E[5],E[4],E[8]),j(y+(p<<1)+1,E[5],E[4],E[8]),S(y+(p<<1)+2,E[5],E[9]),P(y+(p<<1)+3,E[5],E[9]),R(y+3*p,E[5],E[8],E[4]),U(y+3*p+1,E[5],E[8],E[4]),U(y+3*p+2,E[5],E[8],E[9]),B(y+3*p+3,E[5],E[9]);break;case 146:case 178:B(y,E[5],E[1]),P(y+1,E[5],E[1]),z(E[2],E[6])?(P(y+2,E[5],E[3]),B(y+3,E[5],E[3]),S(y+p+2,E[5],E[3]),P(y+p+3,E[5],E[3]),S(y+(p<<1)+3,E[5],E[8]),B(y+3*p+3,E[5],E[8])):(R(y+2,E[2],E[5],E[6]),T(y+3,E[2],E[6]),j(y+p+2,E[5],E[6],E[2]),B(y+p+3,E[6],E[2]),P(y+(p<<1)+3,E[6],E[5]),P(y+3*p+3,E[5],E[6])),U(y+p,E[5],E[4],E[1]),S(y+p+1,E[5],E[1]),U(y+(p<<1),E[5],E[4],E[8]),j(y+(p<<1)+1,E[5],E[4],E[8]),S(y+(p<<1)+2,E[5],E[8]),R(y+3*p,E[5],E[8],E[4]),U(y+3*p+1,E[5],E[8],E[4]),B(y+3*p+2,E[5],E[8]);break;case 84:case 85:R(y,E[5],E[2],E[4]),U(y+1,E[5],E[2],E[4]),B(y+2,E[5],E[2]),z(E[6],E[8])?(B(y+3,E[5],E[2]),S(y+p+3,E[5],E[2]),S(y+(p<<1)+2,E[5],E[9]),P(y+(p<<1)+3,E[5],E[9]),P(y+3*p+2,E[5],E[9]),B(y+3*p+3,E[5],E[9])):(P(y+3,E[5],E[6]),P(y+p+3,E[6],E[5]),j(y+(p<<1)+2,E[5],E[6],E[8]),B(y+(p<<1)+3,E[6],E[8]),R(y+3*p+2,E[8],E[5],E[6]),T(y+3*p+3,E[8],E[6])),U(y+p,E[5],E[4],E[2]),j(y+p+1,E[5],E[4],E[2]),S(y+p+2,E[5],E[2]),U(y+(p<<1),E[5],E[4],E[7]),S(y+(p<<1)+1,E[5],E[7]),B(y+3*p,E[5],E[7]),P(y+3*p+1,E[5],E[7]);break;case 112:case 113:R(y,E[5],E[2],E[4]),U(y+1,E[5],E[2],E[4]),U(y+2,E[5],E[2],E[3]),B(y+3,E[5],E[3]),U(y+p,E[5],E[4],E[2]),j(y+p+1,E[5],E[4],E[2]),S(y+p+2,E[5],E[3]),P(y+p+3,E[5],E[3]),B(y+(p<<1),E[5],E[4]),S(y+(p<<1)+1,E[5],E[4]),z(E[6],E[8])?(S(y+(p<<1)+2,E[5],E[9]),P(y+(p<<1)+3,E[5],E[9]),B(y+3*p,E[5],E[4]),S(y+3*p+1,E[5],E[4]),P(y+3*p+2,E[5],E[9]),B(y+3*p+3,E[5],E[9])):(j(y+(p<<1)+2,E[5],E[6],E[8]),R(y+(p<<1)+3,E[6],E[5],E[8]),P(y+3*p,E[5],E[8]),P(y+3*p+1,E[8],E[5]),B(y+3*p+2,E[8],E[6]),T(y+3*p+3,E[8],E[6]));break;case 200:case 204:B(y,E[5],E[1]),U(y+1,E[5],E[2],E[1]),U(y+2,E[5],E[2],E[6]),R(y+3,E[5],E[2],E[6]),P(y+p,E[5],E[1]),S(y+p+1,E[5],E[1]),j(y+p+2,E[5],E[6],E[2]),U(y+p+3,E[5],E[6],E[2]),z(E[8],E[4])?(P(y+(p<<1),E[5],E[7]),S(y+(p<<1)+1,E[5],E[7]),B(y+3*p,E[5],E[7]),P(y+3*p+1,E[5],E[7]),S(y+3*p+2,E[5],E[6]),B(y+3*p+3,E[5],E[6])):(R(y+(p<<1),E[4],E[5],E[8]),j(y+(p<<1)+1,E[5],E[4],E[8]),T(y+3*p,E[8],E[4]),B(y+3*p+1,E[8],E[4]),P(y+3*p+2,E[8],E[5]),P(y+3*p+3,E[5],E[8])),S(y+(p<<1)+2,E[5],E[6]),B(y+(p<<1)+3,E[5],E[6]);break;case 73:case 77:z(E[8],E[4])?(B(y,E[5],E[2]),S(y+p,E[5],E[2]),P(y+(p<<1),E[5],E[7]),S(y+(p<<1)+1,E[5],E[7]),B(y+3*p,E[5],E[7]),P(y+3*p+1,E[5],E[7])):(P(y,E[5],E[4]),P(y+p,E[4],E[5]),B(y+(p<<1),E[4],E[8]),j(y+(p<<1)+1,E[5],E[4],E[8]),T(y+3*p,E[8],E[4]),R(y+3*p+1,E[8],E[5],E[4])),B(y+1,E[5],E[2]),U(y+2,E[5],E[2],E[6]),R(y+3,E[5],E[2],E[6]),S(y+p+1,E[5],E[2]),j(y+p+2,E[5],E[6],E[2]),U(y+p+3,E[5],E[6],E[2]),S(y+(p<<1)+2,E[5],E[9]),U(y+(p<<1)+3,E[5],E[6],E[9]),P(y+3*p+2,E[5],E[9]),B(y+3*p+3,E[5],E[9]);break;case 42:case 170:z(E[4],E[2])?(B(y,E[5],E[1]),P(y+1,E[5],E[1]),P(y+p,E[5],E[1]),S(y+p+1,E[5],E[1]),S(y+(p<<1),E[5],E[8]),B(y+3*p,E[5],E[8])):(T(y,E[2],E[4]),R(y+1,E[2],E[5],E[4]),B(y+p,E[4],E[2]),j(y+p+1,E[5],E[4],E[2]),P(y+(p<<1),E[4],E[5]),P(y+3*p,E[5],E[4])),P(y+2,E[5],E[3]),B(y+3,E[5],E[3]),S(y+p+2,E[5],E[3]),U(y+p+3,E[5],E[6],E[3]),S(y+(p<<1)+1,E[5],E[8]),j(y+(p<<1)+2,E[5],E[6],E[8]),U(y+(p<<1)+3,E[5],E[6],E[8]),B(y+3*p+1,E[5],E[8]),U(y+3*p+2,E[5],E[8],E[6]),R(y+3*p+3,E[5],E[8],E[6]);break;case 14:case 142:z(E[4],E[2])?(B(y,E[5],E[1]),P(y+1,E[5],E[1]),S(y+2,E[5],E[6]),B(y+3,E[5],E[6]),P(y+p,E[5],E[1]),S(y+p+1,E[5],E[1])):(T(y,E[2],E[4]),B(y+1,E[2],E[4]),P(y+2,E[2],E[5]),P(y+3,E[5],E[2]),R(y+p,E[4],E[5],E[2]),j(y+p+1,E[5],E[4],E[2])),S(y+p+2,E[5],E[6]),B(y+p+3,E[5],E[6]),P(y+(p<<1),E[5],E[7]),S(y+(p<<1)+1,E[5],E[7]),j(y+(p<<1)+2,E[5],E[6],E[8]),U(y+(p<<1)+3,E[5],E[6],E[8]),B(y+3*p,E[5],E[7]),U(y+3*p+1,E[5],E[8],E[7]),U(y+3*p+2,E[5],E[8],E[6]),R(y+3*p+3,E[5],E[8],E[6]);break;case 67:B(y,E[5],E[4]),S(y+1,E[5],E[4]),P(y+2,E[5],E[3]),B(y+3,E[5],E[3]),B(y+p,E[5],E[4]),S(y+p+1,E[5],E[4]),S(y+p+2,E[5],E[3]),U(y+p+3,E[5],E[6],E[3]),U(y+(p<<1),E[5],E[4],E[7]),S(y+(p<<1)+1,E[5],E[7]),S(y+(p<<1)+2,E[5],E[9]),U(y+(p<<1)+3,E[5],E[6],E[9]),B(y+3*p,E[5],E[7]),P(y+3*p+1,E[5],E[7]),P(y+3*p+2,E[5],E[9]),B(y+3*p+3,E[5],E[9]);break;case 70:B(y,E[5],E[1]),P(y+1,E[5],E[1]),S(y+2,E[5],E[6]),B(y+3,E[5],E[6]),U(y+p,E[5],E[4],E[1]),S(y+p+1,E[5],E[1]),S(y+p+2,E[5],E[6]),B(y+p+3,E[5],E[6]),U(y+(p<<1),E[5],E[4],E[7]),S(y+(p<<1)+1,E[5],E[7]),S(y+(p<<1)+2,E[5],E[9]),U(y+(p<<1)+3,E[5],E[6],E[9]),B(y+3*p,E[5],E[7]),P(y+3*p+1,E[5],E[7]),P(y+3*p+2,E[5],E[9]),B(y+3*p+3,E[5],E[9]);break;case 28:B(y,E[5],E[1]),U(y+1,E[5],E[2],E[1]),B(y+2,E[5],E[2]),B(y+3,E[5],E[2]),P(y+p,E[5],E[1]),S(y+p+1,E[5],E[1]),S(y+p+2,E[5],E[2]),S(y+p+3,E[5],E[2]),P(y+(p<<1),E[5],E[7]),S(y+(p<<1)+1,E[5],E[7]),S(y+(p<<1)+2,E[5],E[9]),P(y+(p<<1)+3,E[5],E[9]),B(y+3*p,E[5],E[7]),U(y+3*p+1,E[5],E[8],E[7]),U(y+3*p+2,E[5],E[8],E[9]),B(y+3*p+3,E[5],E[9]);break;case 152:B(y,E[5],E[1]),U(y+1,E[5],E[2],E[1]),U(y+2,E[5],E[2],E[3]),B(y+3,E[5],E[3]),P(y+p,E[5],E[1]),S(y+p+1,E[5],E[1]),S(y+p+2,E[5],E[3]),P(y+p+3,E[5],E[3]),P(y+(p<<1),E[5],E[7]),S(y+(p<<1)+1,E[5],E[7]),S(y+(p<<1)+2,E[5],E[8]),S(y+(p<<1)+3,E[5],E[8]),B(y+3*p,E[5],E[7]),U(y+3*p+1,E[5],E[8],E[7]),B(y+3*p+2,E[5],E[8]),B(y+3*p+3,E[5],E[8]);break;case 194:B(y,E[5],E[1]),P(y+1,E[5],E[1]),P(y+2,E[5],E[3]),B(y+3,E[5],E[3]),U(y+p,E[5],E[4],E[1]),S(y+p+1,E[5],E[1]),S(y+p+2,E[5],E[3]),U(y+p+3,E[5],E[6],E[3]),U(y+(p<<1),E[5],E[4],E[7]),S(y+(p<<1)+1,E[5],E[7]),S(y+(p<<1)+2,E[5],E[6]),B(y+(p<<1)+3,E[5],E[6]),B(y+3*p,E[5],E[7]),P(y+3*p+1,E[5],E[7]),S(y+3*p+2,E[5],E[6]),B(y+3*p+3,E[5],E[6]);break;case 98:B(y,E[5],E[1]),P(y+1,E[5],E[1]),P(y+2,E[5],E[3]),B(y+3,E[5],E[3]),U(y+p,E[5],E[4],E[1]),S(y+p+1,E[5],E[1]),S(y+p+2,E[5],E[3]),U(y+p+3,E[5],E[6],E[3]),B(y+(p<<1),E[5],E[4]),S(y+(p<<1)+1,E[5],E[4]),S(y+(p<<1)+2,E[5],E[9]),U(y+(p<<1)+3,E[5],E[6],E[9]),B(y+3*p,E[5],E[4]),S(y+3*p+1,E[5],E[4]),P(y+3*p+2,E[5],E[9]),B(y+3*p+3,E[5],E[9]);break;case 56:B(y,E[5],E[1]),U(y+1,E[5],E[2],E[1]),U(y+2,E[5],E[2],E[3]),B(y+3,E[5],E[3]),P(y+p,E[5],E[1]),S(y+p+1,E[5],E[1]),S(y+p+2,E[5],E[3]),P(y+p+3,E[5],E[3]),S(y+(p<<1),E[5],E[8]),S(y+(p<<1)+1,E[5],E[8]),S(y+(p<<1)+2,E[5],E[9]),P(y+(p<<1)+3,E[5],E[9]),B(y+3*p,E[5],E[8]),B(y+3*p+1,E[5],E[8]),U(y+3*p+2,E[5],E[8],E[9]),B(y+3*p+3,E[5],E[9]);break;case 25:B(y,E[5],E[2]),B(y+1,E[5],E[2]),U(y+2,E[5],E[2],E[3]),B(y+3,E[5],E[3]),S(y+p,E[5],E[2]),S(y+p+1,E[5],E[2]),S(y+p+2,E[5],E[3]),P(y+p+3,E[5],E[3]),P(y+(p<<1),E[5],E[7]),S(y+(p<<1)+1,E[5],E[7]),S(y+(p<<1)+2,E[5],E[9]),P(y+(p<<1)+3,E[5],E[9]),B(y+3*p,E[5],E[7]),U(y+3*p+1,E[5],E[8],E[7]),U(y+3*p+2,E[5],E[8],E[9]),B(y+3*p+3,E[5],E[9]);break;case 26:case 31:z(E[4],E[2])?(G[y]=E[5],G[y+1]=E[5],G[y+p]=E[5]):(T(y,E[2],E[4]),T(y+1,E[2],E[5]),T(y+p,E[4],E[5])),z(E[2],E[6])?(G[y+2]=E[5],G[y+3]=E[5],G[y+p+3]=E[5]):(T(y+2,E[2],E[5]),T(y+3,E[2],E[6]),T(y+p+3,E[6],E[5])),G[y+p+1]=E[5],G[y+p+2]=E[5],P(y+(p<<1),E[5],E[7]),S(y+(p<<1)+1,E[5],E[7]),S(y+(p<<1)+2,E[5],E[9]),P(y+(p<<1)+3,E[5],E[9]),B(y+3*p,E[5],E[7]),U(y+3*p+1,E[5],E[8],E[7]),U(y+3*p+2,E[5],E[8],E[9]),B(y+3*p+3,E[5],E[9]);break;case 82:case 214:B(y,E[5],E[1]),P(y+1,E[5],E[1]),z(E[2],E[6])?(G[y+2]=E[5],G[y+3]=E[5],G[y+p+3]=E[5]):(T(y+2,E[2],E[5]),T(y+3,E[2],E[6]),T(y+p+3,E[6],E[5])),U(y+p,E[5],E[4],E[1]),S(y+p+1,E[5],E[1]),G[y+p+2]=E[5],U(y+(p<<1),E[5],E[4],E[7]),S(y+(p<<1)+1,E[5],E[7]),G[y+(p<<1)+2]=E[5],z(E[6],E[8])?(G[y+(p<<1)+3]=E[5],G[y+3*p+2]=E[5],G[y+3*p+3]=E[5]):(T(y+(p<<1)+3,E[6],E[5]),T(y+3*p+2,E[8],E[5]),T(y+3*p+3,E[8],E[6])),B(y+3*p,E[5],E[7]),P(y+3*p+1,E[5],E[7]);break;case 88:case 248:B(y,E[5],E[1]),U(y+1,E[5],E[2],E[1]),U(y+2,E[5],E[2],E[3]),B(y+3,E[5],E[3]),P(y+p,E[5],E[1]),S(y+p+1,E[5],E[1]),S(y+p+2,E[5],E[3]),P(y+p+3,E[5],E[3]),z(E[8],E[4])?(G[y+(p<<1)]=E[5],G[y+3*p]=E[5],G[y+3*p+1]=E[5]):(T(y+(p<<1),E[4],E[5]),T(y+3*p,E[8],E[4]),T(y+3*p+1,E[8],E[5])),G[y+(p<<1)+1]=E[5],G[y+(p<<1)+2]=E[5],z(E[6],E[8])?(G[y+(p<<1)+3]=E[5],G[y+3*p+2]=E[5],G[y+3*p+3]=E[5]):(T(y+(p<<1)+3,E[6],E[5]),T(y+3*p+2,E[8],E[5]),T(y+3*p+3,E[8],E[6]));break;case 74:case 107:z(E[4],E[2])?(G[y]=E[5],G[y+1]=E[5],G[y+p]=E[5]):(T(y,E[2],E[4]),T(y+1,E[2],E[5]),T(y+p,E[4],E[5])),P(y+2,E[5],E[3]),B(y+3,E[5],E[3]),G[y+p+1]=E[5],S(y+p+2,E[5],E[3]),U(y+p+3,E[5],E[6],E[3]),z(E[8],E[4])?(G[y+(p<<1)]=E[5],G[y+3*p]=E[5],G[y+3*p+1]=E[5]):(T(y+(p<<1),E[4],E[5]),T(y+3*p,E[8],E[4]),T(y+3*p+1,E[8],E[5])),G[y+(p<<1)+1]=E[5],S(y+(p<<1)+2,E[5],E[9]),U(y+(p<<1)+3,E[5],E[6],E[9]),P(y+3*p+2,E[5],E[9]),B(y+3*p+3,E[5],E[9]);break;case 27:z(E[4],E[2])?(G[y]=E[5],G[y+1]=E[5],G[y+p]=E[5]):(T(y,E[2],E[4]),T(y+1,E[2],E[5]),T(y+p,E[4],E[5])),P(y+2,E[5],E[3]),B(y+3,E[5],E[3]),G[y+p+1]=E[5],S(y+p+2,E[5],E[3]),P(y+p+3,E[5],E[3]),P(y+(p<<1),E[5],E[7]),S(y+(p<<1)+1,E[5],E[7]),S(y+(p<<1)+2,E[5],E[9]),P(y+(p<<1)+3,E[5],E[9]),B(y+3*p,E[5],E[7]),U(y+3*p+1,E[5],E[8],E[7]),U(y+3*p+2,E[5],E[8],E[9]),B(y+3*p+3,E[5],E[9]);break;case 86:B(y,E[5],E[1]),P(y+1,E[5],E[1]),z(E[2],E[6])?(G[y+2]=E[5],G[y+3]=E[5],G[y+p+3]=E[5]):(T(y+2,E[2],E[5]),T(y+3,E[2],E[6]),T(y+p+3,E[6],E[5])),U(y+p,E[5],E[4],E[1]),S(y+p+1,E[5],E[1]),G[y+p+2]=E[5],U(y+(p<<1),E[5],E[4],E[7]),S(y+(p<<1)+1,E[5],E[7]),S(y+(p<<1)+2,E[5],E[9]),P(y+(p<<1)+3,E[5],E[9]),B(y+3*p,E[5],E[7]),P(y+3*p+1,E[5],E[7]),P(y+3*p+2,E[5],E[9]),B(y+3*p+3,E[5],E[9]);break;case 216:B(y,E[5],E[1]),U(y+1,E[5],E[2],E[1]),U(y+2,E[5],E[2],E[3]),B(y+3,E[5],E[3]),P(y+p,E[5],E[1]),S(y+p+1,E[5],E[1]),S(y+p+2,E[5],E[3]),P(y+p+3,E[5],E[3]),P(y+(p<<1),E[5],E[7]),S(y+(p<<1)+1,E[5],E[7]),G[y+(p<<1)+2]=E[5],z(E[6],E[8])?(G[y+(p<<1)+3]=E[5],G[y+3*p+2]=E[5],G[y+3*p+3]=E[5]):(T(y+(p<<1)+3,E[6],E[5]),T(y+3*p+2,E[8],E[5]),T(y+3*p+3,E[8],E[6])),B(y+3*p,E[5],E[7]),P(y+3*p+1,E[5],E[7]);break;case 106:B(y,E[5],E[1]),P(y+1,E[5],E[1]),P(y+2,E[5],E[3]),B(y+3,E[5],E[3]),P(y+p,E[5],E[1]),S(y+p+1,E[5],E[1]),S(y+p+2,E[5],E[3]),U(y+p+3,E[5],E[6],E[3]),z(E[8],E[4])?(G[y+(p<<1)]=E[5],G[y+3*p]=E[5],G[y+3*p+1]=E[5]):(T(y+(p<<1),E[4],E[5]),T(y+3*p,E[8],E[4]),T(y+3*p+1,E[8],E[5])),G[y+(p<<1)+1]=E[5],S(y+(p<<1)+2,E[5],E[9]),U(y+(p<<1)+3,E[5],E[6],E[9]),P(y+3*p+2,E[5],E[9]),B(y+3*p+3,E[5],E[9]);break;case 30:B(y,E[5],E[1]),P(y+1,E[5],E[1]),z(E[2],E[6])?(G[y+2]=E[5],G[y+3]=E[5],G[y+p+3]=E[5]):(T(y+2,E[2],E[5]),T(y+3,E[2],E[6]),T(y+p+3,E[6],E[5])),P(y+p,E[5],E[1]),S(y+p+1,E[5],E[1]),G[y+p+2]=E[5],P(y+(p<<1),E[5],E[7]),S(y+(p<<1)+1,E[5],E[7]),S(y+(p<<1)+2,E[5],E[9]),P(y+(p<<1)+3,E[5],E[9]),B(y+3*p,E[5],E[7]),U(y+3*p+1,E[5],E[8],E[7]),U(y+3*p+2,E[5],E[8],E[9]),B(y+3*p+3,E[5],E[9]);break;case 210:B(y,E[5],E[1]),P(y+1,E[5],E[1]),P(y+2,E[5],E[3]),B(y+3,E[5],E[3]),U(y+p,E[5],E[4],E[1]),S(y+p+1,E[5],E[1]),S(y+p+2,E[5],E[3]),P(y+p+3,E[5],E[3]),U(y+(p<<1),E[5],E[4],E[7]),S(y+(p<<1)+1,E[5],E[7]),G[y+(p<<1)+2]=E[5],z(E[6],E[8])?(G[y+(p<<1)+3]=E[5],G[y+3*p+2]=E[5],G[y+3*p+3]=E[5]):(T(y+(p<<1)+3,E[6],E[5]),T(y+3*p+2,E[8],E[5]),T(y+3*p+3,E[8],E[6])),B(y+3*p,E[5],E[7]),P(y+3*p+1,E[5],E[7]);break;case 120:B(y,E[5],E[1]),U(y+1,E[5],E[2],E[1]),U(y+2,E[5],E[2],E[3]),B(y+3,E[5],E[3]),P(y+p,E[5],E[1]),S(y+p+1,E[5],E[1]),S(y+p+2,E[5],E[3]),P(y+p+3,E[5],E[3]),z(E[8],E[4])?(G[y+(p<<1)]=E[5],G[y+3*p]=E[5],G[y+3*p+1]=E[5]):(T(y+(p<<1),E[4],E[5]),T(y+3*p,E[8],E[4]),T(y+3*p+1,E[8],E[5])),G[y+(p<<1)+1]=E[5],S(y+(p<<1)+2,E[5],E[9]),P(y+(p<<1)+3,E[5],E[9]),P(y+3*p+2,E[5],E[9]),B(y+3*p+3,E[5],E[9]);break;case 75:z(E[4],E[2])?(G[y]=E[5],G[y+1]=E[5],G[y+p]=E[5]):(T(y,E[2],E[4]),T(y+1,E[2],E[5]),T(y+p,E[4],E[5])),P(y+2,E[5],E[3]),B(y+3,E[5],E[3]),G[y+p+1]=E[5],S(y+p+2,E[5],E[3]),U(y+p+3,E[5],E[6],E[3]),P(y+(p<<1),E[5],E[7]),S(y+(p<<1)+1,E[5],E[7]),S(y+(p<<1)+2,E[5],E[9]),U(y+(p<<1)+3,E[5],E[6],E[9]),B(y+3*p,E[5],E[7]),P(y+3*p+1,E[5],E[7]),P(y+3*p+2,E[5],E[9]),B(y+3*p+3,E[5],E[9]);break;case 29:B(y,E[5],E[2]),B(y+1,E[5],E[2]),B(y+2,E[5],E[2]),B(y+3,E[5],E[2]),S(y+p,E[5],E[2]),S(y+p+1,E[5],E[2]),S(y+p+2,E[5],E[2]),S(y+p+3,E[5],E[2]),P(y+(p<<1),E[5],E[7]),S(y+(p<<1)+1,E[5],E[7]),S(y+(p<<1)+2,E[5],E[9]),P(y+(p<<1)+3,E[5],E[9]),B(y+3*p,E[5],E[7]),U(y+3*p+1,E[5],E[8],E[7]),U(y+3*p+2,E[5],E[8],E[9]),B(y+3*p+3,E[5],E[9]);break;case 198:B(y,E[5],E[1]),P(y+1,E[5],E[1]),S(y+2,E[5],E[6]),B(y+3,E[5],E[6]),U(y+p,E[5],E[4],E[1]),S(y+p+1,E[5],E[1]),S(y+p+2,E[5],E[6]),B(y+p+3,E[5],E[6]),U(y+(p<<1),E[5],E[4],E[7]),S(y+(p<<1)+1,E[5],E[7]),S(y+(p<<1)+2,E[5],E[6]),B(y+(p<<1)+3,E[5],E[6]),B(y+3*p,E[5],E[7]),P(y+3*p+1,E[5],E[7]),S(y+3*p+2,E[5],E[6]),B(y+3*p+3,E[5],E[6]);break;case 184:B(y,E[5],E[1]),U(y+1,E[5],E[2],E[1]),U(y+2,E[5],E[2],E[3]),B(y+3,E[5],E[3]),P(y+p,E[5],E[1]),S(y+p+1,E[5],E[1]),S(y+p+2,E[5],E[3]),P(y+p+3,E[5],E[3]),S(y+(p<<1),E[5],E[8]),S(y+(p<<1)+1,E[5],E[8]),S(y+(p<<1)+2,E[5],E[8]),S(y+(p<<1)+3,E[5],E[8]),B(y+3*p,E[5],E[8]),B(y+3*p+1,E[5],E[8]),B(y+3*p+2,E[5],E[8]),B(y+3*p+3,E[5],E[8]);break;case 99:B(y,E[5],E[4]),S(y+1,E[5],E[4]),P(y+2,E[5],E[3]),B(y+3,E[5],E[3]),B(y+p,E[5],E[4]),S(y+p+1,E[5],E[4]),S(y+p+2,E[5],E[3]),U(y+p+3,E[5],E[6],E[3]),B(y+(p<<1),E[5],E[4]),S(y+(p<<1)+1,E[5],E[4]),S(y+(p<<1)+2,E[5],E[9]),U(y+(p<<1)+3,E[5],E[6],E[9]),B(y+3*p,E[5],E[4]),S(y+3*p+1,E[5],E[4]),P(y+3*p+2,E[5],E[9]),B(y+3*p+3,E[5],E[9]);break;case 57:B(y,E[5],E[2]),B(y+1,E[5],E[2]),U(y+2,E[5],E[2],E[3]),B(y+3,E[5],E[3]),S(y+p,E[5],E[2]),S(y+p+1,E[5],E[2]),S(y+p+2,E[5],E[3]),P(y+p+3,E[5],E[3]),S(y+(p<<1),E[5],E[8]),S(y+(p<<1)+1,E[5],E[8]),S(y+(p<<1)+2,E[5],E[9]),P(y+(p<<1)+3,E[5],E[9]),B(y+3*p,E[5],E[8]),B(y+3*p+1,E[5],E[8]),U(y+3*p+2,E[5],E[8],E[9]),B(y+3*p+3,E[5],E[9]);break;case 71:B(y,E[5],E[4]),S(y+1,E[5],E[4]),S(y+2,E[5],E[6]),B(y+3,E[5],E[6]),B(y+p,E[5],E[4]),S(y+p+1,E[5],E[4]),S(y+p+2,E[5],E[6]),B(y+p+3,E[5],E[6]),U(y+(p<<1),E[5],E[4],E[7]),S(y+(p<<1)+1,E[5],E[7]),S(y+(p<<1)+2,E[5],E[9]),U(y+(p<<1)+3,E[5],E[6],E[9]),B(y+3*p,E[5],E[7]),P(y+3*p+1,E[5],E[7]),P(y+3*p+2,E[5],E[9]),B(y+3*p+3,E[5],E[9]);break;case 156:B(y,E[5],E[1]),U(y+1,E[5],E[2],E[1]),B(y+2,E[5],E[2]),B(y+3,E[5],E[2]),P(y+p,E[5],E[1]),S(y+p+1,E[5],E[1]),S(y+p+2,E[5],E[2]),S(y+p+3,E[5],E[2]),P(y+(p<<1),E[5],E[7]),S(y+(p<<1)+1,E[5],E[7]),S(y+(p<<1)+2,E[5],E[8]),S(y+(p<<1)+3,E[5],E[8]),B(y+3*p,E[5],E[7]),U(y+3*p+1,E[5],E[8],E[7]),B(y+3*p+2,E[5],E[8]),B(y+3*p+3,E[5],E[8]);break;case 226:B(y,E[5],E[1]),P(y+1,E[5],E[1]),P(y+2,E[5],E[3]),B(y+3,E[5],E[3]),U(y+p,E[5],E[4],E[1]),S(y+p+1,E[5],E[1]),S(y+p+2,E[5],E[3]),U(y+p+3,E[5],E[6],E[3]),B(y+(p<<1),E[5],E[4]),S(y+(p<<1)+1,E[5],E[4]),S(y+(p<<1)+2,E[5],E[6]),B(y+(p<<1)+3,E[5],E[6]),B(y+3*p,E[5],E[4]),S(y+3*p+1,E[5],E[4]),S(y+3*p+2,E[5],E[6]),B(y+3*p+3,E[5],E[6]);break;case 60:B(y,E[5],E[1]),U(y+1,E[5],E[2],E[1]),B(y+2,E[5],E[2]),B(y+3,E[5],E[2]),P(y+p,E[5],E[1]),S(y+p+1,E[5],E[1]),S(y+p+2,E[5],E[2]),S(y+p+3,E[5],E[2]),S(y+(p<<1),E[5],E[8]),S(y+(p<<1)+1,E[5],E[8]),S(y+(p<<1)+2,E[5],E[9]),P(y+(p<<1)+3,E[5],E[9]),B(y+3*p,E[5],E[8]),B(y+3*p+1,E[5],E[8]),U(y+3*p+2,E[5],E[8],E[9]),B(y+3*p+3,E[5],E[9]);break;case 195:B(y,E[5],E[4]),S(y+1,E[5],E[4]),P(y+2,E[5],E[3]),B(y+3,E[5],E[3]),B(y+p,E[5],E[4]),S(y+p+1,E[5],E[4]),S(y+p+2,E[5],E[3]),U(y+p+3,E[5],E[6],E[3]),U(y+(p<<1),E[5],E[4],E[7]),S(y+(p<<1)+1,E[5],E[7]),S(y+(p<<1)+2,E[5],E[6]),B(y+(p<<1)+3,E[5],E[6]),B(y+3*p,E[5],E[7]),P(y+3*p+1,E[5],E[7]),S(y+3*p+2,E[5],E[6]),B(y+3*p+3,E[5],E[6]);break;case 102:B(y,E[5],E[1]),P(y+1,E[5],E[1]),S(y+2,E[5],E[6]),B(y+3,E[5],E[6]),U(y+p,E[5],E[4],E[1]),S(y+p+1,E[5],E[1]),S(y+p+2,E[5],E[6]),B(y+p+3,E[5],E[6]),B(y+(p<<1),E[5],E[4]),S(y+(p<<1)+1,E[5],E[4]),S(y+(p<<1)+2,E[5],E[9]),U(y+(p<<1)+3,E[5],E[6],E[9]),B(y+3*p,E[5],E[4]),S(y+3*p+1,E[5],E[4]),P(y+3*p+2,E[5],E[9]),B(y+3*p+3,E[5],E[9]);break;case 153:B(y,E[5],E[2]),B(y+1,E[5],E[2]),U(y+2,E[5],E[2],E[3]),B(y+3,E[5],E[3]),S(y+p,E[5],E[2]),S(y+p+1,E[5],E[2]),S(y+p+2,E[5],E[3]),P(y+p+3,E[5],E[3]),P(y+(p<<1),E[5],E[7]),S(y+(p<<1)+1,E[5],E[7]),S(y+(p<<1)+2,E[5],E[8]),S(y+(p<<1)+3,E[5],E[8]),B(y+3*p,E[5],E[7]),U(y+3*p+1,E[5],E[8],E[7]),B(y+3*p+2,E[5],E[8]),B(y+3*p+3,E[5],E[8]);break;case 58:z(E[4],E[2])?(B(y,E[5],E[1]),P(y+1,E[5],E[1]),P(y+p,E[5],E[1]),S(y+p+1,E[5],E[1])):(R(y,E[5],E[2],E[4]),P(y+1,E[5],E[2]),P(y+p,E[5],E[4]),G[y+p+1]=E[5]),z(E[2],E[6])?(P(y+2,E[5],E[3]),B(y+3,E[5],E[3]),S(y+p+2,E[5],E[3]),P(y+p+3,E[5],E[3])):(P(y+2,E[5],E[2]),R(y+3,E[5],E[2],E[6]),G[y+p+2]=E[5],P(y+p+3,E[5],E[6])),S(y+(p<<1),E[5],E[8]),S(y+(p<<1)+1,E[5],E[8]),S(y+(p<<1)+2,E[5],E[9]),P(y+(p<<1)+3,E[5],E[9]),B(y+3*p,E[5],E[8]),B(y+3*p+1,E[5],E[8]),U(y+3*p+2,E[5],E[8],E[9]),B(y+3*p+3,E[5],E[9]);break;case 83:B(y,E[5],E[4]),S(y+1,E[5],E[4]),z(E[2],E[6])?(P(y+2,E[5],E[3]),B(y+3,E[5],E[3]),S(y+p+2,E[5],E[3]),P(y+p+3,E[5],E[3])):(P(y+2,E[5],E[2]),R(y+3,E[5],E[2],E[6]),G[y+p+2]=E[5],P(y+p+3,E[5],E[6])),B(y+p,E[5],E[4]),S(y+p+1,E[5],E[4]),U(y+(p<<1),E[5],E[4],E[7]),S(y+(p<<1)+1,E[5],E[7]),z(E[6],E[8])?(S(y+(p<<1)+2,E[5],E[9]),P(y+(p<<1)+3,E[5],E[9]),P(y+3*p+2,E[5],E[9]),B(y+3*p+3,E[5],E[9])):(G[y+(p<<1)+2]=E[5],P(y+(p<<1)+3,E[5],E[6]),P(y+3*p+2,E[5],E[8]),R(y+3*p+3,E[5],E[8],E[6])),B(y+3*p,E[5],E[7]),P(y+3*p+1,E[5],E[7]);break;case 92:B(y,E[5],E[1]),U(y+1,E[5],E[2],E[1]),B(y+2,E[5],E[2]),B(y+3,E[5],E[2]),P(y+p,E[5],E[1]),S(y+p+1,E[5],E[1]),S(y+p+2,E[5],E[2]),S(y+p+3,E[5],E[2]),z(E[8],E[4])?(P(y+(p<<1),E[5],E[7]),S(y+(p<<1)+1,E[5],E[7]),B(y+3*p,E[5],E[7]),P(y+3*p+1,E[5],E[7])):(P(y+(p<<1),E[5],E[4]),G[y+(p<<1)+1]=E[5],R(y+3*p,E[5],E[8],E[4]),P(y+3*p+1,E[5],E[8])),z(E[6],E[8])?(S(y+(p<<1)+2,E[5],E[9]),P(y+(p<<1)+3,E[5],E[9]),P(y+3*p+2,E[5],E[9]),B(y+3*p+3,E[5],E[9])):(G[y+(p<<1)+2]=E[5],P(y+(p<<1)+3,E[5],E[6]),P(y+3*p+2,E[5],E[8]),R(y+3*p+3,E[5],E[8],E[6]));break;case 202:z(E[4],E[2])?(B(y,E[5],E[1]),P(y+1,E[5],E[1]),P(y+p,E[5],E[1]),S(y+p+1,E[5],E[1])):(R(y,E[5],E[2],E[4]),P(y+1,E[5],E[2]),P(y+p,E[5],E[4]),G[y+p+1]=E[5]),P(y+2,E[5],E[3]),B(y+3,E[5],E[3]),S(y+p+2,E[5],E[3]),U(y+p+3,E[5],E[6],E[3]),z(E[8],E[4])?(P(y+(p<<1),E[5],E[7]),S(y+(p<<1)+1,E[5],E[7]),B(y+3*p,E[5],E[7]),P(y+3*p+1,E[5],E[7])):(P(y+(p<<1),E[5],E[4]),G[y+(p<<1)+1]=E[5],R(y+3*p,E[5],E[8],E[4]),P(y+3*p+1,E[5],E[8])),S(y+(p<<1)+2,E[5],E[6]),B(y+(p<<1)+3,E[5],E[6]),S(y+3*p+2,E[5],E[6]),B(y+3*p+3,E[5],E[6]);break;case 78:z(E[4],E[2])?(B(y,E[5],E[1]),P(y+1,E[5],E[1]),P(y+p,E[5],E[1]),S(y+p+1,E[5],E[1])):(R(y,E[5],E[2],E[4]),P(y+1,E[5],E[2]),P(y+p,E[5],E[4]),G[y+p+1]=E[5]),S(y+2,E[5],E[6]),B(y+3,E[5],E[6]),S(y+p+2,E[5],E[6]),B(y+p+3,E[5],E[6]),z(E[8],E[4])?(P(y+(p<<1),E[5],E[7]),S(y+(p<<1)+1,E[5],E[7]),B(y+3*p,E[5],E[7]),P(y+3*p+1,E[5],E[7])):(P(y+(p<<1),E[5],E[4]),G[y+(p<<1)+1]=E[5],R(y+3*p,E[5],E[8],E[4]),P(y+3*p+1,E[5],E[8])),S(y+(p<<1)+2,E[5],E[9]),U(y+(p<<1)+3,E[5],E[6],E[9]),P(y+3*p+2,E[5],E[9]),B(y+3*p+3,E[5],E[9]);break;case 154:z(E[4],E[2])?(B(y,E[5],E[1]),P(y+1,E[5],E[1]),P(y+p,E[5],E[1]),S(y+p+1,E[5],E[1])):(R(y,E[5],E[2],E[4]),P(y+1,E[5],E[2]),P(y+p,E[5],E[4]),G[y+p+1]=E[5]),z(E[2],E[6])?(P(y+2,E[5],E[3]),B(y+3,E[5],E[3]),S(y+p+2,E[5],E[3]),P(y+p+3,E[5],E[3])):(P(y+2,E[5],E[2]),R(y+3,E[5],E[2],E[6]),G[y+p+2]=E[5],P(y+p+3,E[5],E[6])),P(y+(p<<1),E[5],E[7]),S(y+(p<<1)+1,E[5],E[7]),S(y+(p<<1)+2,E[5],E[8]),S(y+(p<<1)+3,E[5],E[8]),B(y+3*p,E[5],E[7]),U(y+3*p+1,E[5],E[8],E[7]),B(y+3*p+2,E[5],E[8]),B(y+3*p+3,E[5],E[8]);break;case 114:B(y,E[5],E[1]),P(y+1,E[5],E[1]),z(E[2],E[6])?(P(y+2,E[5],E[3]),B(y+3,E[5],E[3]),S(y+p+2,E[5],E[3]),P(y+p+3,E[5],E[3])):(P(y+2,E[5],E[2]),R(y+3,E[5],E[2],E[6]),G[y+p+2]=E[5],P(y+p+3,E[5],E[6])),U(y+p,E[5],E[4],E[1]),S(y+p+1,E[5],E[1]),B(y+(p<<1),E[5],E[4]),S(y+(p<<1)+1,E[5],E[4]),z(E[6],E[8])?(S(y+(p<<1)+2,E[5],E[9]),P(y+(p<<1)+3,E[5],E[9]),P(y+3*p+2,E[5],E[9]),B(y+3*p+3,E[5],E[9])):(G[y+(p<<1)+2]=E[5],P(y+(p<<1)+3,E[5],E[6]),P(y+3*p+2,E[5],E[8]),R(y+3*p+3,E[5],E[8],E[6])),B(y+3*p,E[5],E[4]),S(y+3*p+1,E[5],E[4]);break;case 89:B(y,E[5],E[2]),B(y+1,E[5],E[2]),U(y+2,E[5],E[2],E[3]),B(y+3,E[5],E[3]),S(y+p,E[5],E[2]),S(y+p+1,E[5],E[2]),S(y+p+2,E[5],E[3]),P(y+p+3,E[5],E[3]),z(E[8],E[4])?(P(y+(p<<1),E[5],E[7]),S(y+(p<<1)+1,E[5],E[7]),B(y+3*p,E[5],E[7]),P(y+3*p+1,E[5],E[7])):(P(y+(p<<1),E[5],E[4]),G[y+(p<<1)+1]=E[5],R(y+3*p,E[5],E[8],E[4]),P(y+3*p+1,E[5],E[8])),z(E[6],E[8])?(S(y+(p<<1)+2,E[5],E[9]),P(y+(p<<1)+3,E[5],E[9]),P(y+3*p+2,E[5],E[9]),B(y+3*p+3,E[5],E[9])):(G[y+(p<<1)+2]=E[5],P(y+(p<<1)+3,E[5],E[6]),P(y+3*p+2,E[5],E[8]),R(y+3*p+3,E[5],E[8],E[6]));break;case 90:z(E[4],E[2])?(B(y,E[5],E[1]),P(y+1,E[5],E[1]),P(y+p,E[5],E[1]),S(y+p+1,E[5],E[1])):(R(y,E[5],E[2],E[4]),P(y+1,E[5],E[2]),P(y+p,E[5],E[4]),G[y+p+1]=E[5]),z(E[2],E[6])?(P(y+2,E[5],E[3]),B(y+3,E[5],E[3]),S(y+p+2,E[5],E[3]),
P(y+p+3,E[5],E[3])):(P(y+2,E[5],E[2]),R(y+3,E[5],E[2],E[6]),G[y+p+2]=E[5],P(y+p+3,E[5],E[6])),z(E[8],E[4])?(P(y+(p<<1),E[5],E[7]),S(y+(p<<1)+1,E[5],E[7]),B(y+3*p,E[5],E[7]),P(y+3*p+1,E[5],E[7])):(P(y+(p<<1),E[5],E[4]),G[y+(p<<1)+1]=E[5],R(y+3*p,E[5],E[8],E[4]),P(y+3*p+1,E[5],E[8])),z(E[6],E[8])?(S(y+(p<<1)+2,E[5],E[9]),P(y+(p<<1)+3,E[5],E[9]),P(y+3*p+2,E[5],E[9]),B(y+3*p+3,E[5],E[9])):(G[y+(p<<1)+2]=E[5],P(y+(p<<1)+3,E[5],E[6]),P(y+3*p+2,E[5],E[8]),R(y+3*p+3,E[5],E[8],E[6]));break;case 55:case 23:z(E[2],E[6])?(B(y,E[5],E[4]),S(y+1,E[5],E[4]),G[y+2]=E[5],G[y+3]=E[5],G[y+p+2]=E[5],G[y+p+3]=E[5]):(P(y,E[5],E[2]),P(y+1,E[2],E[5]),B(y+2,E[2],E[6]),T(y+3,E[2],E[6]),j(y+p+2,E[5],E[6],E[2]),R(y+p+3,E[6],E[5],E[2])),B(y+p,E[5],E[4]),S(y+p+1,E[5],E[4]),U(y+(p<<1),E[5],E[4],E[8]),j(y+(p<<1)+1,E[5],E[4],E[8]),S(y+(p<<1)+2,E[5],E[9]),P(y+(p<<1)+3,E[5],E[9]),R(y+3*p,E[5],E[8],E[4]),U(y+3*p+1,E[5],E[8],E[4]),U(y+3*p+2,E[5],E[8],E[9]),B(y+3*p+3,E[5],E[9]);break;case 182:case 150:B(y,E[5],E[1]),P(y+1,E[5],E[1]),z(E[2],E[6])?(G[y+2]=E[5],G[y+3]=E[5],G[y+p+2]=E[5],G[y+p+3]=E[5],S(y+(p<<1)+3,E[5],E[8]),B(y+3*p+3,E[5],E[8])):(R(y+2,E[2],E[5],E[6]),T(y+3,E[2],E[6]),j(y+p+2,E[5],E[6],E[2]),B(y+p+3,E[6],E[2]),P(y+(p<<1)+3,E[6],E[5]),P(y+3*p+3,E[5],E[6])),U(y+p,E[5],E[4],E[1]),S(y+p+1,E[5],E[1]),U(y+(p<<1),E[5],E[4],E[8]),j(y+(p<<1)+1,E[5],E[4],E[8]),S(y+(p<<1)+2,E[5],E[8]),R(y+3*p,E[5],E[8],E[4]),U(y+3*p+1,E[5],E[8],E[4]),B(y+3*p+2,E[5],E[8]);break;case 213:case 212:R(y,E[5],E[2],E[4]),U(y+1,E[5],E[2],E[4]),B(y+2,E[5],E[2]),z(E[6],E[8])?(B(y+3,E[5],E[2]),S(y+p+3,E[5],E[2]),G[y+(p<<1)+2]=E[5],G[y+(p<<1)+3]=E[5],G[y+3*p+2]=E[5],G[y+3*p+3]=E[5]):(P(y+3,E[5],E[6]),P(y+p+3,E[6],E[5]),j(y+(p<<1)+2,E[5],E[6],E[8]),B(y+(p<<1)+3,E[6],E[8]),R(y+3*p+2,E[8],E[5],E[6]),T(y+3*p+3,E[8],E[6])),U(y+p,E[5],E[4],E[2]),j(y+p+1,E[5],E[4],E[2]),S(y+p+2,E[5],E[2]),U(y+(p<<1),E[5],E[4],E[7]),S(y+(p<<1)+1,E[5],E[7]),B(y+3*p,E[5],E[7]),P(y+3*p+1,E[5],E[7]);break;case 241:case 240:R(y,E[5],E[2],E[4]),U(y+1,E[5],E[2],E[4]),U(y+2,E[5],E[2],E[3]),B(y+3,E[5],E[3]),U(y+p,E[5],E[4],E[2]),j(y+p+1,E[5],E[4],E[2]),S(y+p+2,E[5],E[3]),P(y+p+3,E[5],E[3]),B(y+(p<<1),E[5],E[4]),S(y+(p<<1)+1,E[5],E[4]),z(E[6],E[8])?(G[y+(p<<1)+2]=E[5],G[y+(p<<1)+3]=E[5],B(y+3*p,E[5],E[4]),S(y+3*p+1,E[5],E[4]),G[y+3*p+2]=E[5],G[y+3*p+3]=E[5]):(j(y+(p<<1)+2,E[5],E[6],E[8]),R(y+(p<<1)+3,E[6],E[5],E[8]),P(y+3*p,E[5],E[8]),P(y+3*p+1,E[8],E[5]),B(y+3*p+2,E[8],E[6]),T(y+3*p+3,E[8],E[6]));break;case 236:case 232:B(y,E[5],E[1]),U(y+1,E[5],E[2],E[1]),U(y+2,E[5],E[2],E[6]),R(y+3,E[5],E[2],E[6]),P(y+p,E[5],E[1]),S(y+p+1,E[5],E[1]),j(y+p+2,E[5],E[6],E[2]),U(y+p+3,E[5],E[6],E[2]),z(E[8],E[4])?(G[y+(p<<1)]=E[5],G[y+(p<<1)+1]=E[5],G[y+3*p]=E[5],G[y+3*p+1]=E[5],S(y+3*p+2,E[5],E[6]),B(y+3*p+3,E[5],E[6])):(R(y+(p<<1),E[4],E[5],E[8]),j(y+(p<<1)+1,E[5],E[4],E[8]),T(y+3*p,E[8],E[4]),B(y+3*p+1,E[8],E[4]),P(y+3*p+2,E[8],E[5]),P(y+3*p+3,E[5],E[8])),S(y+(p<<1)+2,E[5],E[6]),B(y+(p<<1)+3,E[5],E[6]);break;case 109:case 105:z(E[8],E[4])?(B(y,E[5],E[2]),S(y+p,E[5],E[2]),G[y+(p<<1)]=E[5],G[y+(p<<1)+1]=E[5],G[y+3*p]=E[5],G[y+3*p+1]=E[5]):(P(y,E[5],E[4]),P(y+p,E[4],E[5]),B(y+(p<<1),E[4],E[8]),j(y+(p<<1)+1,E[5],E[4],E[8]),T(y+3*p,E[8],E[4]),R(y+3*p+1,E[8],E[5],E[4])),B(y+1,E[5],E[2]),U(y+2,E[5],E[2],E[6]),R(y+3,E[5],E[2],E[6]),S(y+p+1,E[5],E[2]),j(y+p+2,E[5],E[6],E[2]),U(y+p+3,E[5],E[6],E[2]),S(y+(p<<1)+2,E[5],E[9]),U(y+(p<<1)+3,E[5],E[6],E[9]),P(y+3*p+2,E[5],E[9]),B(y+3*p+3,E[5],E[9]);break;case 171:case 43:z(E[4],E[2])?(G[y]=E[5],G[y+1]=E[5],G[y+p]=E[5],G[y+p+1]=E[5],S(y+(p<<1),E[5],E[8]),B(y+3*p,E[5],E[8])):(T(y,E[2],E[4]),R(y+1,E[2],E[5],E[4]),B(y+p,E[4],E[2]),j(y+p+1,E[5],E[4],E[2]),P(y+(p<<1),E[4],E[5]),P(y+3*p,E[5],E[4])),P(y+2,E[5],E[3]),B(y+3,E[5],E[3]),S(y+p+2,E[5],E[3]),U(y+p+3,E[5],E[6],E[3]),S(y+(p<<1)+1,E[5],E[8]),j(y+(p<<1)+2,E[5],E[6],E[8]),U(y+(p<<1)+3,E[5],E[6],E[8]),B(y+3*p+1,E[5],E[8]),U(y+3*p+2,E[5],E[8],E[6]),R(y+3*p+3,E[5],E[8],E[6]);break;case 143:case 15:z(E[4],E[2])?(G[y]=E[5],G[y+1]=E[5],S(y+2,E[5],E[6]),B(y+3,E[5],E[6]),G[y+p]=E[5],G[y+p+1]=E[5]):(T(y,E[2],E[4]),B(y+1,E[2],E[4]),P(y+2,E[2],E[5]),P(y+3,E[5],E[2]),R(y+p,E[4],E[5],E[2]),j(y+p+1,E[5],E[4],E[2])),S(y+p+2,E[5],E[6]),B(y+p+3,E[5],E[6]),P(y+(p<<1),E[5],E[7]),S(y+(p<<1)+1,E[5],E[7]),j(y+(p<<1)+2,E[5],E[6],E[8]),U(y+(p<<1)+3,E[5],E[6],E[8]),B(y+3*p,E[5],E[7]),U(y+3*p+1,E[5],E[8],E[7]),U(y+3*p+2,E[5],E[8],E[6]),R(y+3*p+3,E[5],E[8],E[6]);break;case 124:B(y,E[5],E[1]),U(y+1,E[5],E[2],E[1]),B(y+2,E[5],E[2]),B(y+3,E[5],E[2]),P(y+p,E[5],E[1]),S(y+p+1,E[5],E[1]),S(y+p+2,E[5],E[2]),S(y+p+3,E[5],E[2]),z(E[8],E[4])?(G[y+(p<<1)]=E[5],G[y+3*p]=E[5],G[y+3*p+1]=E[5]):(T(y+(p<<1),E[4],E[5]),T(y+3*p,E[8],E[4]),T(y+3*p+1,E[8],E[5])),G[y+(p<<1)+1]=E[5],S(y+(p<<1)+2,E[5],E[9]),P(y+(p<<1)+3,E[5],E[9]),P(y+3*p+2,E[5],E[9]),B(y+3*p+3,E[5],E[9]);break;case 203:z(E[4],E[2])?(G[y]=E[5],G[y+1]=E[5],G[y+p]=E[5]):(T(y,E[2],E[4]),T(y+1,E[2],E[5]),T(y+p,E[4],E[5])),P(y+2,E[5],E[3]),B(y+3,E[5],E[3]),G[y+p+1]=E[5],S(y+p+2,E[5],E[3]),U(y+p+3,E[5],E[6],E[3]),P(y+(p<<1),E[5],E[7]),S(y+(p<<1)+1,E[5],E[7]),S(y+(p<<1)+2,E[5],E[6]),B(y+(p<<1)+3,E[5],E[6]),B(y+3*p,E[5],E[7]),P(y+3*p+1,E[5],E[7]),S(y+3*p+2,E[5],E[6]),B(y+3*p+3,E[5],E[6]);break;case 62:B(y,E[5],E[1]),P(y+1,E[5],E[1]),z(E[2],E[6])?(G[y+2]=E[5],G[y+3]=E[5],G[y+p+3]=E[5]):(T(y+2,E[2],E[5]),T(y+3,E[2],E[6]),T(y+p+3,E[6],E[5])),P(y+p,E[5],E[1]),S(y+p+1,E[5],E[1]),G[y+p+2]=E[5],S(y+(p<<1),E[5],E[8]),S(y+(p<<1)+1,E[5],E[8]),S(y+(p<<1)+2,E[5],E[9]),P(y+(p<<1)+3,E[5],E[9]),B(y+3*p,E[5],E[8]),B(y+3*p+1,E[5],E[8]),U(y+3*p+2,E[5],E[8],E[9]),B(y+3*p+3,E[5],E[9]);break;case 211:B(y,E[5],E[4]),S(y+1,E[5],E[4]),P(y+2,E[5],E[3]),B(y+3,E[5],E[3]),B(y+p,E[5],E[4]),S(y+p+1,E[5],E[4]),S(y+p+2,E[5],E[3]),P(y+p+3,E[5],E[3]),U(y+(p<<1),E[5],E[4],E[7]),S(y+(p<<1)+1,E[5],E[7]),G[y+(p<<1)+2]=E[5],z(E[6],E[8])?(G[y+(p<<1)+3]=E[5],G[y+3*p+2]=E[5],G[y+3*p+3]=E[5]):(T(y+(p<<1)+3,E[6],E[5]),T(y+3*p+2,E[8],E[5]),T(y+3*p+3,E[8],E[6])),B(y+3*p,E[5],E[7]),P(y+3*p+1,E[5],E[7]);break;case 118:B(y,E[5],E[1]),P(y+1,E[5],E[1]),z(E[2],E[6])?(G[y+2]=E[5],G[y+3]=E[5],G[y+p+3]=E[5]):(T(y+2,E[2],E[5]),T(y+3,E[2],E[6]),T(y+p+3,E[6],E[5])),U(y+p,E[5],E[4],E[1]),S(y+p+1,E[5],E[1]),G[y+p+2]=E[5],B(y+(p<<1),E[5],E[4]),S(y+(p<<1)+1,E[5],E[4]),S(y+(p<<1)+2,E[5],E[9]),P(y+(p<<1)+3,E[5],E[9]),B(y+3*p,E[5],E[4]),S(y+3*p+1,E[5],E[4]),P(y+3*p+2,E[5],E[9]),B(y+3*p+3,E[5],E[9]);break;case 217:B(y,E[5],E[2]),B(y+1,E[5],E[2]),U(y+2,E[5],E[2],E[3]),B(y+3,E[5],E[3]),S(y+p,E[5],E[2]),S(y+p+1,E[5],E[2]),S(y+p+2,E[5],E[3]),P(y+p+3,E[5],E[3]),P(y+(p<<1),E[5],E[7]),S(y+(p<<1)+1,E[5],E[7]),G[y+(p<<1)+2]=E[5],z(E[6],E[8])?(G[y+(p<<1)+3]=E[5],G[y+3*p+2]=E[5],G[y+3*p+3]=E[5]):(T(y+(p<<1)+3,E[6],E[5]),T(y+3*p+2,E[8],E[5]),T(y+3*p+3,E[8],E[6])),B(y+3*p,E[5],E[7]),P(y+3*p+1,E[5],E[7]);break;case 110:B(y,E[5],E[1]),P(y+1,E[5],E[1]),S(y+2,E[5],E[6]),B(y+3,E[5],E[6]),P(y+p,E[5],E[1]),S(y+p+1,E[5],E[1]),S(y+p+2,E[5],E[6]),B(y+p+3,E[5],E[6]),z(E[8],E[4])?(G[y+(p<<1)]=E[5],G[y+3*p]=E[5],G[y+3*p+1]=E[5]):(T(y+(p<<1),E[4],E[5]),T(y+3*p,E[8],E[4]),T(y+3*p+1,E[8],E[5])),G[y+(p<<1)+1]=E[5],S(y+(p<<1)+2,E[5],E[9]),U(y+(p<<1)+3,E[5],E[6],E[9]),P(y+3*p+2,E[5],E[9]),B(y+3*p+3,E[5],E[9]);break;case 155:z(E[4],E[2])?(G[y]=E[5],G[y+1]=E[5],G[y+p]=E[5]):(T(y,E[2],E[4]),T(y+1,E[2],E[5]),T(y+p,E[4],E[5])),P(y+2,E[5],E[3]),B(y+3,E[5],E[3]),G[y+p+1]=E[5],S(y+p+2,E[5],E[3]),P(y+p+3,E[5],E[3]),P(y+(p<<1),E[5],E[7]),S(y+(p<<1)+1,E[5],E[7]),S(y+(p<<1)+2,E[5],E[8]),S(y+(p<<1)+3,E[5],E[8]),B(y+3*p,E[5],E[7]),U(y+3*p+1,E[5],E[8],E[7]),B(y+3*p+2,E[5],E[8]),B(y+3*p+3,E[5],E[8]);break;case 188:B(y,E[5],E[1]),U(y+1,E[5],E[2],E[1]),B(y+2,E[5],E[2]),B(y+3,E[5],E[2]),P(y+p,E[5],E[1]),S(y+p+1,E[5],E[1]),S(y+p+2,E[5],E[2]),S(y+p+3,E[5],E[2]),S(y+(p<<1),E[5],E[8]),S(y+(p<<1)+1,E[5],E[8]),S(y+(p<<1)+2,E[5],E[8]),S(y+(p<<1)+3,E[5],E[8]),B(y+3*p,E[5],E[8]),B(y+3*p+1,E[5],E[8]),B(y+3*p+2,E[5],E[8]),B(y+3*p+3,E[5],E[8]);break;case 185:B(y,E[5],E[2]),B(y+1,E[5],E[2]),U(y+2,E[5],E[2],E[3]),B(y+3,E[5],E[3]),S(y+p,E[5],E[2]),S(y+p+1,E[5],E[2]),S(y+p+2,E[5],E[3]),P(y+p+3,E[5],E[3]),S(y+(p<<1),E[5],E[8]),S(y+(p<<1)+1,E[5],E[8]),S(y+(p<<1)+2,E[5],E[8]),S(y+(p<<1)+3,E[5],E[8]),B(y+3*p,E[5],E[8]),B(y+3*p+1,E[5],E[8]),B(y+3*p+2,E[5],E[8]),B(y+3*p+3,E[5],E[8]);break;case 61:B(y,E[5],E[2]),B(y+1,E[5],E[2]),B(y+2,E[5],E[2]),B(y+3,E[5],E[2]),S(y+p,E[5],E[2]),S(y+p+1,E[5],E[2]),S(y+p+2,E[5],E[2]),S(y+p+3,E[5],E[2]),S(y+(p<<1),E[5],E[8]),S(y+(p<<1)+1,E[5],E[8]),S(y+(p<<1)+2,E[5],E[9]),P(y+(p<<1)+3,E[5],E[9]),B(y+3*p,E[5],E[8]),B(y+3*p+1,E[5],E[8]),U(y+3*p+2,E[5],E[8],E[9]),B(y+3*p+3,E[5],E[9]);break;case 157:B(y,E[5],E[2]),B(y+1,E[5],E[2]),B(y+2,E[5],E[2]),B(y+3,E[5],E[2]),S(y+p,E[5],E[2]),S(y+p+1,E[5],E[2]),S(y+p+2,E[5],E[2]),S(y+p+3,E[5],E[2]),P(y+(p<<1),E[5],E[7]),S(y+(p<<1)+1,E[5],E[7]),S(y+(p<<1)+2,E[5],E[8]),S(y+(p<<1)+3,E[5],E[8]),B(y+3*p,E[5],E[7]),U(y+3*p+1,E[5],E[8],E[7]),B(y+3*p+2,E[5],E[8]),B(y+3*p+3,E[5],E[8]);break;case 103:B(y,E[5],E[4]),S(y+1,E[5],E[4]),S(y+2,E[5],E[6]),B(y+3,E[5],E[6]),B(y+p,E[5],E[4]),S(y+p+1,E[5],E[4]),S(y+p+2,E[5],E[6]),B(y+p+3,E[5],E[6]),B(y+(p<<1),E[5],E[4]),S(y+(p<<1)+1,E[5],E[4]),S(y+(p<<1)+2,E[5],E[9]),U(y+(p<<1)+3,E[5],E[6],E[9]),B(y+3*p,E[5],E[4]),S(y+3*p+1,E[5],E[4]),P(y+3*p+2,E[5],E[9]),B(y+3*p+3,E[5],E[9]);break;case 227:B(y,E[5],E[4]),S(y+1,E[5],E[4]),P(y+2,E[5],E[3]),B(y+3,E[5],E[3]),B(y+p,E[5],E[4]),S(y+p+1,E[5],E[4]),S(y+p+2,E[5],E[3]),U(y+p+3,E[5],E[6],E[3]),B(y+(p<<1),E[5],E[4]),S(y+(p<<1)+1,E[5],E[4]),S(y+(p<<1)+2,E[5],E[6]),B(y+(p<<1)+3,E[5],E[6]),B(y+3*p,E[5],E[4]),S(y+3*p+1,E[5],E[4]),S(y+3*p+2,E[5],E[6]),B(y+3*p+3,E[5],E[6]);break;case 230:B(y,E[5],E[1]),P(y+1,E[5],E[1]),S(y+2,E[5],E[6]),B(y+3,E[5],E[6]),U(y+p,E[5],E[4],E[1]),S(y+p+1,E[5],E[1]),S(y+p+2,E[5],E[6]),B(y+p+3,E[5],E[6]),B(y+(p<<1),E[5],E[4]),S(y+(p<<1)+1,E[5],E[4]),S(y+(p<<1)+2,E[5],E[6]),B(y+(p<<1)+3,E[5],E[6]),B(y+3*p,E[5],E[4]),S(y+3*p+1,E[5],E[4]),S(y+3*p+2,E[5],E[6]),B(y+3*p+3,E[5],E[6]);break;case 199:B(y,E[5],E[4]),S(y+1,E[5],E[4]),S(y+2,E[5],E[6]),B(y+3,E[5],E[6]),B(y+p,E[5],E[4]),S(y+p+1,E[5],E[4]),S(y+p+2,E[5],E[6]),B(y+p+3,E[5],E[6]),U(y+(p<<1),E[5],E[4],E[7]),S(y+(p<<1)+1,E[5],E[7]),S(y+(p<<1)+2,E[5],E[6]),B(y+(p<<1)+3,E[5],E[6]),B(y+3*p,E[5],E[7]),P(y+3*p+1,E[5],E[7]),S(y+3*p+2,E[5],E[6]),B(y+3*p+3,E[5],E[6]);break;case 220:B(y,E[5],E[1]),U(y+1,E[5],E[2],E[1]),B(y+2,E[5],E[2]),B(y+3,E[5],E[2]),P(y+p,E[5],E[1]),S(y+p+1,E[5],E[1]),S(y+p+2,E[5],E[2]),S(y+p+3,E[5],E[2]),z(E[8],E[4])?(P(y+(p<<1),E[5],E[7]),S(y+(p<<1)+1,E[5],E[7]),B(y+3*p,E[5],E[7]),P(y+3*p+1,E[5],E[7])):(P(y+(p<<1),E[5],E[4]),G[y+(p<<1)+1]=E[5],R(y+3*p,E[5],E[8],E[4]),P(y+3*p+1,E[5],E[8])),G[y+(p<<1)+2]=E[5],z(E[6],E[8])?(G[y+(p<<1)+3]=E[5],G[y+3*p+2]=E[5],G[y+3*p+3]=E[5]):(T(y+(p<<1)+3,E[6],E[5]),T(y+3*p+2,E[8],E[5]),T(y+3*p+3,E[8],E[6]));break;case 158:z(E[4],E[2])?(B(y,E[5],E[1]),P(y+1,E[5],E[1]),P(y+p,E[5],E[1]),S(y+p+1,E[5],E[1])):(R(y,E[5],E[2],E[4]),P(y+1,E[5],E[2]),P(y+p,E[5],E[4]),G[y+p+1]=E[5]),z(E[2],E[6])?(G[y+2]=E[5],G[y+3]=E[5],G[y+p+3]=E[5]):(T(y+2,E[2],E[5]),T(y+3,E[2],E[6]),T(y+p+3,E[6],E[5])),G[y+p+2]=E[5],P(y+(p<<1),E[5],E[7]),S(y+(p<<1)+1,E[5],E[7]),S(y+(p<<1)+2,E[5],E[8]),S(y+(p<<1)+3,E[5],E[8]),B(y+3*p,E[5],E[7]),U(y+3*p+1,E[5],E[8],E[7]),B(y+3*p+2,E[5],E[8]),B(y+3*p+3,E[5],E[8]);break;case 234:z(E[4],E[2])?(B(y,E[5],E[1]),P(y+1,E[5],E[1]),P(y+p,E[5],E[1]),S(y+p+1,E[5],E[1])):(R(y,E[5],E[2],E[4]),P(y+1,E[5],E[2]),P(y+p,E[5],E[4]),G[y+p+1]=E[5]),P(y+2,E[5],E[3]),B(y+3,E[5],E[3]),S(y+p+2,E[5],E[3]),U(y+p+3,E[5],E[6],E[3]),z(E[8],E[4])?(G[y+(p<<1)]=E[5],G[y+3*p]=E[5],G[y+3*p+1]=E[5]):(T(y+(p<<1),E[4],E[5]),T(y+3*p,E[8],E[4]),T(y+3*p+1,E[8],E[5])),G[y+(p<<1)+1]=E[5],S(y+(p<<1)+2,E[5],E[6]),B(y+(p<<1)+3,E[5],E[6]),S(y+3*p+2,E[5],E[6]),B(y+3*p+3,E[5],E[6]);break;case 242:B(y,E[5],E[1]),P(y+1,E[5],E[1]),z(E[2],E[6])?(P(y+2,E[5],E[3]),B(y+3,E[5],E[3]),S(y+p+2,E[5],E[3]),P(y+p+3,E[5],E[3])):(P(y+2,E[5],E[2]),R(y+3,E[5],E[2],E[6]),G[y+p+2]=E[5],P(y+p+3,E[5],E[6])),U(y+p,E[5],E[4],E[1]),S(y+p+1,E[5],E[1]),B(y+(p<<1),E[5],E[4]),S(y+(p<<1)+1,E[5],E[4]),G[y+(p<<1)+2]=E[5],z(E[6],E[8])?(G[y+(p<<1)+3]=E[5],G[y+3*p+2]=E[5],G[y+3*p+3]=E[5]):(T(y+(p<<1)+3,E[6],E[5]),T(y+3*p+2,E[8],E[5]),T(y+3*p+3,E[8],E[6])),B(y+3*p,E[5],E[4]),S(y+3*p+1,E[5],E[4]);break;case 59:z(E[4],E[2])?(G[y]=E[5],G[y+1]=E[5],G[y+p]=E[5]):(T(y,E[2],E[4]),T(y+1,E[2],E[5]),T(y+p,E[4],E[5])),z(E[2],E[6])?(P(y+2,E[5],E[3]),B(y+3,E[5],E[3]),S(y+p+2,E[5],E[3]),P(y+p+3,E[5],E[3])):(P(y+2,E[5],E[2]),R(y+3,E[5],E[2],E[6]),G[y+p+2]=E[5],P(y+p+3,E[5],E[6])),G[y+p+1]=E[5],S(y+(p<<1),E[5],E[8]),S(y+(p<<1)+1,E[5],E[8]),S(y+(p<<1)+2,E[5],E[9]),P(y+(p<<1)+3,E[5],E[9]),B(y+3*p,E[5],E[8]),B(y+3*p+1,E[5],E[8]),U(y+3*p+2,E[5],E[8],E[9]),B(y+3*p+3,E[5],E[9]);break;case 121:B(y,E[5],E[2]),B(y+1,E[5],E[2]),U(y+2,E[5],E[2],E[3]),B(y+3,E[5],E[3]),S(y+p,E[5],E[2]),S(y+p+1,E[5],E[2]),S(y+p+2,E[5],E[3]),P(y+p+3,E[5],E[3]),z(E[8],E[4])?(G[y+(p<<1)]=E[5],G[y+3*p]=E[5],G[y+3*p+1]=E[5]):(T(y+(p<<1),E[4],E[5]),T(y+3*p,E[8],E[4]),T(y+3*p+1,E[8],E[5])),G[y+(p<<1)+1]=E[5],z(E[6],E[8])?(S(y+(p<<1)+2,E[5],E[9]),P(y+(p<<1)+3,E[5],E[9]),P(y+3*p+2,E[5],E[9]),B(y+3*p+3,E[5],E[9])):(G[y+(p<<1)+2]=E[5],P(y+(p<<1)+3,E[5],E[6]),P(y+3*p+2,E[5],E[8]),R(y+3*p+3,E[5],E[8],E[6]));break;case 87:B(y,E[5],E[4]),S(y+1,E[5],E[4]),z(E[2],E[6])?(G[y+2]=E[5],G[y+3]=E[5],G[y+p+3]=E[5]):(T(y+2,E[2],E[5]),T(y+3,E[2],E[6]),T(y+p+3,E[6],E[5])),B(y+p,E[5],E[4]),S(y+p+1,E[5],E[4]),G[y+p+2]=E[5],U(y+(p<<1),E[5],E[4],E[7]),S(y+(p<<1)+1,E[5],E[7]),z(E[6],E[8])?(S(y+(p<<1)+2,E[5],E[9]),P(y+(p<<1)+3,E[5],E[9]),P(y+3*p+2,E[5],E[9]),B(y+3*p+3,E[5],E[9])):(G[y+(p<<1)+2]=E[5],P(y+(p<<1)+3,E[5],E[6]),P(y+3*p+2,E[5],E[8]),R(y+3*p+3,E[5],E[8],E[6])),B(y+3*p,E[5],E[7]),P(y+3*p+1,E[5],E[7]);break;case 79:z(E[4],E[2])?(G[y]=E[5],G[y+1]=E[5],G[y+p]=E[5]):(T(y,E[2],E[4]),T(y+1,E[2],E[5]),T(y+p,E[4],E[5])),S(y+2,E[5],E[6]),B(y+3,E[5],E[6]),G[y+p+1]=E[5],S(y+p+2,E[5],E[6]),B(y+p+3,E[5],E[6]),z(E[8],E[4])?(P(y+(p<<1),E[5],E[7]),S(y+(p<<1)+1,E[5],E[7]),B(y+3*p,E[5],E[7]),P(y+3*p+1,E[5],E[7])):(P(y+(p<<1),E[5],E[4]),G[y+(p<<1)+1]=E[5],R(y+3*p,E[5],E[8],E[4]),P(y+3*p+1,E[5],E[8])),S(y+(p<<1)+2,E[5],E[9]),U(y+(p<<1)+3,E[5],E[6],E[9]),P(y+3*p+2,E[5],E[9]),B(y+3*p+3,E[5],E[9]);break;case 122:z(E[4],E[2])?(B(y,E[5],E[1]),P(y+1,E[5],E[1]),P(y+p,E[5],E[1]),S(y+p+1,E[5],E[1])):(R(y,E[5],E[2],E[4]),P(y+1,E[5],E[2]),P(y+p,E[5],E[4]),G[y+p+1]=E[5]),z(E[2],E[6])?(P(y+2,E[5],E[3]),B(y+3,E[5],E[3]),S(y+p+2,E[5],E[3]),P(y+p+3,E[5],E[3])):(P(y+2,E[5],E[2]),R(y+3,E[5],E[2],E[6]),G[y+p+2]=E[5],P(y+p+3,E[5],E[6])),z(E[8],E[4])?(G[y+(p<<1)]=E[5],G[y+3*p]=E[5],G[y+3*p+1]=E[5]):(T(y+(p<<1),E[4],E[5]),T(y+3*p,E[8],E[4]),T(y+3*p+1,E[8],E[5])),G[y+(p<<1)+1]=E[5],z(E[6],E[8])?(S(y+(p<<1)+2,E[5],E[9]),P(y+(p<<1)+3,E[5],E[9]),P(y+3*p+2,E[5],E[9]),B(y+3*p+3,E[5],E[9])):(G[y+(p<<1)+2]=E[5],P(y+(p<<1)+3,E[5],E[6]),P(y+3*p+2,E[5],E[8]),R(y+3*p+3,E[5],E[8],E[6]));break;case 94:z(E[4],E[2])?(B(y,E[5],E[1]),P(y+1,E[5],E[1]),P(y+p,E[5],E[1]),S(y+p+1,E[5],E[1])):(R(y,E[5],E[2],E[4]),P(y+1,E[5],E[2]),P(y+p,E[5],E[4]),G[y+p+1]=E[5]),z(E[2],E[6])?(G[y+2]=E[5],G[y+3]=E[5],G[y+p+3]=E[5]):(T(y+2,E[2],E[5]),T(y+3,E[2],E[6]),T(y+p+3,E[6],E[5])),G[y+p+2]=E[5],z(E[8],E[4])?(P(y+(p<<1),E[5],E[7]),S(y+(p<<1)+1,E[5],E[7]),B(y+3*p,E[5],E[7]),P(y+3*p+1,E[5],E[7])):(P(y+(p<<1),E[5],E[4]),G[y+(p<<1)+1]=E[5],R(y+3*p,E[5],E[8],E[4]),P(y+3*p+1,E[5],E[8])),z(E[6],E[8])?(S(y+(p<<1)+2,E[5],E[9]),P(y+(p<<1)+3,E[5],E[9]),P(y+3*p+2,E[5],E[9]),B(y+3*p+3,E[5],E[9])):(G[y+(p<<1)+2]=E[5],P(y+(p<<1)+3,E[5],E[6]),P(y+3*p+2,E[5],E[8]),R(y+3*p+3,E[5],E[8],E[6]));break;case 218:z(E[4],E[2])?(B(y,E[5],E[1]),P(y+1,E[5],E[1]),P(y+p,E[5],E[1]),S(y+p+1,E[5],E[1])):(R(y,E[5],E[2],E[4]),P(y+1,E[5],E[2]),P(y+p,E[5],E[4]),G[y+p+1]=E[5]),z(E[2],E[6])?(P(y+2,E[5],E[3]),B(y+3,E[5],E[3]),S(y+p+2,E[5],E[3]),P(y+p+3,E[5],E[3])):(P(y+2,E[5],E[2]),R(y+3,E[5],E[2],E[6]),G[y+p+2]=E[5],P(y+p+3,E[5],E[6])),z(E[8],E[4])?(P(y+(p<<1),E[5],E[7]),S(y+(p<<1)+1,E[5],E[7]),B(y+3*p,E[5],E[7]),P(y+3*p+1,E[5],E[7])):(P(y+(p<<1),E[5],E[4]),G[y+(p<<1)+1]=E[5],R(y+3*p,E[5],E[8],E[4]),P(y+3*p+1,E[5],E[8])),G[y+(p<<1)+2]=E[5],z(E[6],E[8])?(G[y+(p<<1)+3]=E[5],G[y+3*p+2]=E[5],G[y+3*p+3]=E[5]):(T(y+(p<<1)+3,E[6],E[5]),T(y+3*p+2,E[8],E[5]),T(y+3*p+3,E[8],E[6]));break;case 91:z(E[4],E[2])?(G[y]=E[5],G[y+1]=E[5],G[y+p]=E[5]):(T(y,E[2],E[4]),T(y+1,E[2],E[5]),T(y+p,E[4],E[5])),z(E[2],E[6])?(P(y+2,E[5],E[3]),B(y+3,E[5],E[3]),S(y+p+2,E[5],E[3]),P(y+p+3,E[5],E[3])):(P(y+2,E[5],E[2]),R(y+3,E[5],E[2],E[6]),G[y+p+2]=E[5],P(y+p+3,E[5],E[6])),G[y+p+1]=E[5],z(E[8],E[4])?(P(y+(p<<1),E[5],E[7]),S(y+(p<<1)+1,E[5],E[7]),B(y+3*p,E[5],E[7]),P(y+3*p+1,E[5],E[7])):(P(y+(p<<1),E[5],E[4]),G[y+(p<<1)+1]=E[5],R(y+3*p,E[5],E[8],E[4]),P(y+3*p+1,E[5],E[8])),z(E[6],E[8])?(S(y+(p<<1)+2,E[5],E[9]),P(y+(p<<1)+3,E[5],E[9]),P(y+3*p+2,E[5],E[9]),B(y+3*p+3,E[5],E[9])):(G[y+(p<<1)+2]=E[5],P(y+(p<<1)+3,E[5],E[6]),P(y+3*p+2,E[5],E[8]),R(y+3*p+3,E[5],E[8],E[6]));break;case 229:R(y,E[5],E[2],E[4]),U(y+1,E[5],E[2],E[4]),U(y+2,E[5],E[2],E[6]),R(y+3,E[5],E[2],E[6]),U(y+p,E[5],E[4],E[2]),j(y+p+1,E[5],E[4],E[2]),j(y+p+2,E[5],E[6],E[2]),U(y+p+3,E[5],E[6],E[2]),B(y+(p<<1),E[5],E[4]),S(y+(p<<1)+1,E[5],E[4]),S(y+(p<<1)+2,E[5],E[6]),B(y+(p<<1)+3,E[5],E[6]),B(y+3*p,E[5],E[4]),S(y+3*p+1,E[5],E[4]),S(y+3*p+2,E[5],E[6]),B(y+3*p+3,E[5],E[6]);break;case 167:B(y,E[5],E[4]),S(y+1,E[5],E[4]),S(y+2,E[5],E[6]),B(y+3,E[5],E[6]),B(y+p,E[5],E[4]),S(y+p+1,E[5],E[4]),S(y+p+2,E[5],E[6]),B(y+p+3,E[5],E[6]),U(y+(p<<1),E[5],E[4],E[8]),j(y+(p<<1)+1,E[5],E[4],E[8]),j(y+(p<<1)+2,E[5],E[6],E[8]),U(y+(p<<1)+3,E[5],E[6],E[8]),R(y+3*p,E[5],E[8],E[4]),U(y+3*p+1,E[5],E[8],E[4]),U(y+3*p+2,E[5],E[8],E[6]),R(y+3*p+3,E[5],E[8],E[6]);break;case 173:B(y,E[5],E[2]),B(y+1,E[5],E[2]),U(y+2,E[5],E[2],E[6]),R(y+3,E[5],E[2],E[6]),S(y+p,E[5],E[2]),S(y+p+1,E[5],E[2]),j(y+p+2,E[5],E[6],E[2]),U(y+p+3,E[5],E[6],E[2]),S(y+(p<<1),E[5],E[8]),S(y+(p<<1)+1,E[5],E[8]),j(y+(p<<1)+2,E[5],E[6],E[8]),U(y+(p<<1)+3,E[5],E[6],E[8]),B(y+3*p,E[5],E[8]),B(y+3*p+1,E[5],E[8]),U(y+3*p+2,E[5],E[8],E[6]),R(y+3*p+3,E[5],E[8],E[6]);break;case 181:R(y,E[5],E[2],E[4]),U(y+1,E[5],E[2],E[4]),B(y+2,E[5],E[2]),B(y+3,E[5],E[2]),U(y+p,E[5],E[4],E[2]),j(y+p+1,E[5],E[4],E[2]),S(y+p+2,E[5],E[2]),S(y+p+3,E[5],E[2]),U(y+(p<<1),E[5],E[4],E[8]),j(y+(p<<1)+1,E[5],E[4],E[8]),S(y+(p<<1)+2,E[5],E[8]),S(y+(p<<1)+3,E[5],E[8]),R(y+3*p,E[5],E[8],E[4]),U(y+3*p+1,E[5],E[8],E[4]),B(y+3*p+2,E[5],E[8]),B(y+3*p+3,E[5],E[8]);break;case 186:z(E[4],E[2])?(B(y,E[5],E[1]),P(y+1,E[5],E[1]),P(y+p,E[5],E[1]),S(y+p+1,E[5],E[1])):(R(y,E[5],E[2],E[4]),P(y+1,E[5],E[2]),P(y+p,E[5],E[4]),G[y+p+1]=E[5]),z(E[2],E[6])?(P(y+2,E[5],E[3]),B(y+3,E[5],E[3]),S(y+p+2,E[5],E[3]),P(y+p+3,E[5],E[3])):(P(y+2,E[5],E[2]),R(y+3,E[5],E[2],E[6]),G[y+p+2]=E[5],P(y+p+3,E[5],E[6])),S(y+(p<<1),E[5],E[8]),S(y+(p<<1)+1,E[5],E[8]),S(y+(p<<1)+2,E[5],E[8]),S(y+(p<<1)+3,E[5],E[8]),B(y+3*p,E[5],E[8]),B(y+3*p+1,E[5],E[8]),B(y+3*p+2,E[5],E[8]),B(y+3*p+3,E[5],E[8]);break;case 115:B(y,E[5],E[4]),S(y+1,E[5],E[4]),z(E[2],E[6])?(P(y+2,E[5],E[3]),B(y+3,E[5],E[3]),S(y+p+2,E[5],E[3]),P(y+p+3,E[5],E[3])):(P(y+2,E[5],E[2]),R(y+3,E[5],E[2],E[6]),G[y+p+2]=E[5],P(y+p+3,E[5],E[6])),B(y+p,E[5],E[4]),S(y+p+1,E[5],E[4]),B(y+(p<<1),E[5],E[4]),S(y+(p<<1)+1,E[5],E[4]),z(E[6],E[8])?(S(y+(p<<1)+2,E[5],E[9]),P(y+(p<<1)+3,E[5],E[9]),P(y+3*p+2,E[5],E[9]),B(y+3*p+3,E[5],E[9])):(G[y+(p<<1)+2]=E[5],P(y+(p<<1)+3,E[5],E[6]),P(y+3*p+2,E[5],E[8]),R(y+3*p+3,E[5],E[8],E[6])),B(y+3*p,E[5],E[4]),S(y+3*p+1,E[5],E[4]);break;case 93:B(y,E[5],E[2]),B(y+1,E[5],E[2]),B(y+2,E[5],E[2]),B(y+3,E[5],E[2]),S(y+p,E[5],E[2]),S(y+p+1,E[5],E[2]),S(y+p+2,E[5],E[2]),S(y+p+3,E[5],E[2]),z(E[8],E[4])?(P(y+(p<<1),E[5],E[7]),S(y+(p<<1)+1,E[5],E[7]),B(y+3*p,E[5],E[7]),P(y+3*p+1,E[5],E[7])):(P(y+(p<<1),E[5],E[4]),G[y+(p<<1)+1]=E[5],R(y+3*p,E[5],E[8],E[4]),P(y+3*p+1,E[5],E[8])),z(E[6],E[8])?(S(y+(p<<1)+2,E[5],E[9]),P(y+(p<<1)+3,E[5],E[9]),P(y+3*p+2,E[5],E[9]),B(y+3*p+3,E[5],E[9])):(G[y+(p<<1)+2]=E[5],P(y+(p<<1)+3,E[5],E[6]),P(y+3*p+2,E[5],E[8]),R(y+3*p+3,E[5],E[8],E[6]));break;case 206:z(E[4],E[2])?(B(y,E[5],E[1]),P(y+1,E[5],E[1]),P(y+p,E[5],E[1]),S(y+p+1,E[5],E[1])):(R(y,E[5],E[2],E[4]),P(y+1,E[5],E[2]),P(y+p,E[5],E[4]),G[y+p+1]=E[5]),S(y+2,E[5],E[6]),B(y+3,E[5],E[6]),S(y+p+2,E[5],E[6]),B(y+p+3,E[5],E[6]),z(E[8],E[4])?(P(y+(p<<1),E[5],E[7]),S(y+(p<<1)+1,E[5],E[7]),B(y+3*p,E[5],E[7]),P(y+3*p+1,E[5],E[7])):(P(y+(p<<1),E[5],E[4]),G[y+(p<<1)+1]=E[5],R(y+3*p,E[5],E[8],E[4]),P(y+3*p+1,E[5],E[8])),S(y+(p<<1)+2,E[5],E[6]),B(y+(p<<1)+3,E[5],E[6]),S(y+3*p+2,E[5],E[6]),B(y+3*p+3,E[5],E[6]);break;case 205:case 201:B(y,E[5],E[2]),B(y+1,E[5],E[2]),U(y+2,E[5],E[2],E[6]),R(y+3,E[5],E[2],E[6]),S(y+p,E[5],E[2]),S(y+p+1,E[5],E[2]),j(y+p+2,E[5],E[6],E[2]),U(y+p+3,E[5],E[6],E[2]),z(E[8],E[4])?(P(y+(p<<1),E[5],E[7]),S(y+(p<<1)+1,E[5],E[7]),B(y+3*p,E[5],E[7]),P(y+3*p+1,E[5],E[7])):(P(y+(p<<1),E[5],E[4]),G[y+(p<<1)+1]=E[5],R(y+3*p,E[5],E[8],E[4]),P(y+3*p+1,E[5],E[8])),S(y+(p<<1)+2,E[5],E[6]),B(y+(p<<1)+3,E[5],E[6]),S(y+3*p+2,E[5],E[6]),B(y+3*p+3,E[5],E[6]);break;case 174:case 46:z(E[4],E[2])?(B(y,E[5],E[1]),P(y+1,E[5],E[1]),P(y+p,E[5],E[1]),S(y+p+1,E[5],E[1])):(R(y,E[5],E[2],E[4]),P(y+1,E[5],E[2]),P(y+p,E[5],E[4]),G[y+p+1]=E[5]),S(y+2,E[5],E[6]),B(y+3,E[5],E[6]),S(y+p+2,E[5],E[6]),B(y+p+3,E[5],E[6]),S(y+(p<<1),E[5],E[8]),S(y+(p<<1)+1,E[5],E[8]),j(y+(p<<1)+2,E[5],E[6],E[8]),U(y+(p<<1)+3,E[5],E[6],E[8]),B(y+3*p,E[5],E[8]),B(y+3*p+1,E[5],E[8]),U(y+3*p+2,E[5],E[8],E[6]),R(y+3*p+3,E[5],E[8],E[6]);break;case 179:case 147:B(y,E[5],E[4]),S(y+1,E[5],E[4]),z(E[2],E[6])?(P(y+2,E[5],E[3]),B(y+3,E[5],E[3]),S(y+p+2,E[5],E[3]),P(y+p+3,E[5],E[3])):(P(y+2,E[5],E[2]),R(y+3,E[5],E[2],E[6]),G[y+p+2]=E[5],P(y+p+3,E[5],E[6])),B(y+p,E[5],E[4]),S(y+p+1,E[5],E[4]),U(y+(p<<1),E[5],E[4],E[8]),j(y+(p<<1)+1,E[5],E[4],E[8]),S(y+(p<<1)+2,E[5],E[8]),S(y+(p<<1)+3,E[5],E[8]),R(y+3*p,E[5],E[8],E[4]),U(y+3*p+1,E[5],E[8],E[4]),B(y+3*p+2,E[5],E[8]),B(y+3*p+3,E[5],E[8]);break;case 117:case 116:R(y,E[5],E[2],E[4]),U(y+1,E[5],E[2],E[4]),B(y+2,E[5],E[2]),B(y+3,E[5],E[2]),U(y+p,E[5],E[4],E[2]),j(y+p+1,E[5],E[4],E[2]),S(y+p+2,E[5],E[2]),S(y+p+3,E[5],E[2]),B(y+(p<<1),E[5],E[4]),S(y+(p<<1)+1,E[5],E[4]),z(E[6],E[8])?(S(y+(p<<1)+2,E[5],E[9]),P(y+(p<<1)+3,E[5],E[9]),P(y+3*p+2,E[5],E[9]),B(y+3*p+3,E[5],E[9])):(G[y+(p<<1)+2]=E[5],P(y+(p<<1)+3,E[5],E[6]),P(y+3*p+2,E[5],E[8]),R(y+3*p+3,E[5],E[8],E[6])),B(y+3*p,E[5],E[4]),S(y+3*p+1,E[5],E[4]);break;case 189:B(y,E[5],E[2]),B(y+1,E[5],E[2]),B(y+2,E[5],E[2]),B(y+3,E[5],E[2]),S(y+p,E[5],E[2]),S(y+p+1,E[5],E[2]),S(y+p+2,E[5],E[2]),S(y+p+3,E[5],E[2]),S(y+(p<<1),E[5],E[8]),S(y+(p<<1)+1,E[5],E[8]),S(y+(p<<1)+2,E[5],E[8]),S(y+(p<<1)+3,E[5],E[8]),B(y+3*p,E[5],E[8]),B(y+3*p+1,E[5],E[8]),B(y+3*p+2,E[5],E[8]),B(y+3*p+3,E[5],E[8]);break;case 231:B(y,E[5],E[4]),S(y+1,E[5],E[4]),S(y+2,E[5],E[6]),B(y+3,E[5],E[6]),B(y+p,E[5],E[4]),S(y+p+1,E[5],E[4]),S(y+p+2,E[5],E[6]),B(y+p+3,E[5],E[6]),B(y+(p<<1),E[5],E[4]),S(y+(p<<1)+1,E[5],E[4]),S(y+(p<<1)+2,E[5],E[6]),B(y+(p<<1)+3,E[5],E[6]),B(y+3*p,E[5],E[4]),S(y+3*p+1,E[5],E[4]),S(y+3*p+2,E[5],E[6]),B(y+3*p+3,E[5],E[6]);break;case 126:B(y,E[5],E[1]),P(y+1,E[5],E[1]),z(E[2],E[6])?(G[y+2]=E[5],G[y+3]=E[5],G[y+p+3]=E[5]):(T(y+2,E[2],E[5]),T(y+3,E[2],E[6]),T(y+p+3,E[6],E[5])),P(y+p,E[5],E[1]),S(y+p+1,E[5],E[1]),G[y+p+2]=E[5],z(E[8],E[4])?(G[y+(p<<1)]=E[5],G[y+3*p]=E[5],G[y+3*p+1]=E[5]):(T(y+(p<<1),E[4],E[5]),T(y+3*p,E[8],E[4]),T(y+3*p+1,E[8],E[5])),G[y+(p<<1)+1]=E[5],S(y+(p<<1)+2,E[5],E[9]),P(y+(p<<1)+3,E[5],E[9]),P(y+3*p+2,E[5],E[9]),B(y+3*p+3,E[5],E[9]);break;case 219:z(E[4],E[2])?(G[y]=E[5],G[y+1]=E[5],G[y+p]=E[5]):(T(y,E[2],E[4]),T(y+1,E[2],E[5]),T(y+p,E[4],E[5])),P(y+2,E[5],E[3]),B(y+3,E[5],E[3]),G[y+p+1]=E[5],S(y+p+2,E[5],E[3]),P(y+p+3,E[5],E[3]),P(y+(p<<1),E[5],E[7]),S(y+(p<<1)+1,E[5],E[7]),G[y+(p<<1)+2]=E[5],z(E[6],E[8])?(G[y+(p<<1)+3]=E[5],G[y+3*p+2]=E[5],G[y+3*p+3]=E[5]):(T(y+(p<<1)+3,E[6],E[5]),T(y+3*p+2,E[8],E[5]),T(y+3*p+3,E[8],E[6])),B(y+3*p,E[5],E[7]),P(y+3*p+1,E[5],E[7]);break;case 125:z(E[8],E[4])?(B(y,E[5],E[2]),S(y+p,E[5],E[2]),G[y+(p<<1)]=E[5],G[y+(p<<1)+1]=E[5],G[y+3*p]=E[5],G[y+3*p+1]=E[5]):(P(y,E[5],E[4]),P(y+p,E[4],E[5]),B(y+(p<<1),E[4],E[8]),j(y+(p<<1)+1,E[5],E[4],E[8]),T(y+3*p,E[8],E[4]),R(y+3*p+1,E[8],E[5],E[4])),B(y+1,E[5],E[2]),B(y+2,E[5],E[2]),B(y+3,E[5],E[2]),S(y+p+1,E[5],E[2]),S(y+p+2,E[5],E[2]),S(y+p+3,E[5],E[2]),S(y+(p<<1)+2,E[5],E[9]),P(y+(p<<1)+3,E[5],E[9]),P(y+3*p+2,E[5],E[9]),B(y+3*p+3,E[5],E[9]);break;case 221:B(y,E[5],E[2]),B(y+1,E[5],E[2]),B(y+2,E[5],E[2]),z(E[6],E[8])?(B(y+3,E[5],E[2]),S(y+p+3,E[5],E[2]),G[y+(p<<1)+2]=E[5],G[y+(p<<1)+3]=E[5],G[y+3*p+2]=E[5],G[y+3*p+3]=E[5]):(P(y+3,E[5],E[6]),P(y+p+3,E[6],E[5]),j(y+(p<<1)+2,E[5],E[6],E[8]),B(y+(p<<1)+3,E[6],E[8]),R(y+3*p+2,E[8],E[5],E[6]),T(y+3*p+3,E[8],E[6])),S(y+p,E[5],E[2]),S(y+p+1,E[5],E[2]),S(y+p+2,E[5],E[2]),P(y+(p<<1),E[5],E[7]),S(y+(p<<1)+1,E[5],E[7]),B(y+3*p,E[5],E[7]),P(y+3*p+1,E[5],E[7]);break;case 207:z(E[4],E[2])?(G[y]=E[5],G[y+1]=E[5],S(y+2,E[5],E[6]),B(y+3,E[5],E[6]),G[y+p]=E[5],G[y+p+1]=E[5]):(T(y,E[2],E[4]),B(y+1,E[2],E[4]),P(y+2,E[2],E[5]),P(y+3,E[5],E[2]),R(y+p,E[4],E[5],E[2]),j(y+p+1,E[5],E[4],E[2])),S(y+p+2,E[5],E[6]),B(y+p+3,E[5],E[6]),P(y+(p<<1),E[5],E[7]),S(y+(p<<1)+1,E[5],E[7]),S(y+(p<<1)+2,E[5],E[6]),B(y+(p<<1)+3,E[5],E[6]),B(y+3*p,E[5],E[7]),P(y+3*p+1,E[5],E[7]),S(y+3*p+2,E[5],E[6]),B(y+3*p+3,E[5],E[6]);break;case 238:B(y,E[5],E[1]),P(y+1,E[5],E[1]),S(y+2,E[5],E[6]),B(y+3,E[5],E[6]),P(y+p,E[5],E[1]),S(y+p+1,E[5],E[1]),S(y+p+2,E[5],E[6]),B(y+p+3,E[5],E[6]),z(E[8],E[4])?(G[y+(p<<1)]=E[5],G[y+(p<<1)+1]=E[5],G[y+3*p]=E[5],G[y+3*p+1]=E[5],S(y+3*p+2,E[5],E[6]),B(y+3*p+3,E[5],E[6])):(R(y+(p<<1),E[4],E[5],E[8]),j(y+(p<<1)+1,E[5],E[4],E[8]),T(y+3*p,E[8],E[4]),B(y+3*p+1,E[8],E[4]),P(y+3*p+2,E[8],E[5]),P(y+3*p+3,E[5],E[8])),S(y+(p<<1)+2,E[5],E[6]),B(y+(p<<1)+3,E[5],E[6]);break;case 190:B(y,E[5],E[1]),P(y+1,E[5],E[1]),z(E[2],E[6])?(G[y+2]=E[5],G[y+3]=E[5],G[y+p+2]=E[5],G[y+p+3]=E[5],S(y+(p<<1)+3,E[5],E[8]),B(y+3*p+3,E[5],E[8])):(R(y+2,E[2],E[5],E[6]),T(y+3,E[2],E[6]),j(y+p+2,E[5],E[6],E[2]),B(y+p+3,E[6],E[2]),P(y+(p<<1)+3,E[6],E[5]),P(y+3*p+3,E[5],E[6])),P(y+p,E[5],E[1]),S(y+p+1,E[5],E[1]),S(y+(p<<1),E[5],E[8]),S(y+(p<<1)+1,E[5],E[8]),S(y+(p<<1)+2,E[5],E[8]),B(y+3*p,E[5],E[8]),B(y+3*p+1,E[5],E[8]),B(y+3*p+2,E[5],E[8]);break;case 187:z(E[4],E[2])?(G[y]=E[5],G[y+1]=E[5],G[y+p]=E[5],G[y+p+1]=E[5],S(y+(p<<1),E[5],E[8]),B(y+3*p,E[5],E[8])):(T(y,E[2],E[4]),R(y+1,E[2],E[5],E[4]),B(y+p,E[4],E[2]),j(y+p+1,E[5],E[4],E[2]),P(y+(p<<1),E[4],E[5]),P(y+3*p,E[5],E[4])),P(y+2,E[5],E[3]),B(y+3,E[5],E[3]),S(y+p+2,E[5],E[3]),P(y+p+3,E[5],E[3]),S(y+(p<<1)+1,E[5],E[8]),S(y+(p<<1)+2,E[5],E[8]),S(y+(p<<1)+3,E[5],E[8]),B(y+3*p+1,E[5],E[8]),B(y+3*p+2,E[5],E[8]),B(y+3*p+3,E[5],E[8]);break;case 243:B(y,E[5],E[4]),S(y+1,E[5],E[4]),P(y+2,E[5],E[3]),B(y+3,E[5],E[3]),B(y+p,E[5],E[4]),S(y+p+1,E[5],E[4]),S(y+p+2,E[5],E[3]),P(y+p+3,E[5],E[3]),B(y+(p<<1),E[5],E[4]),S(y+(p<<1)+1,E[5],E[4]),z(E[6],E[8])?(G[y+(p<<1)+2]=E[5],G[y+(p<<1)+3]=E[5],B(y+3*p,E[5],E[4]),S(y+3*p+1,E[5],E[4]),G[y+3*p+2]=E[5],G[y+3*p+3]=E[5]):(j(y+(p<<1)+2,E[5],E[6],E[8]),R(y+(p<<1)+3,E[6],E[5],E[8]),P(y+3*p,E[5],E[8]),P(y+3*p+1,E[8],E[5]),B(y+3*p+2,E[8],E[6]),T(y+3*p+3,E[8],E[6]));break;case 119:z(E[2],E[6])?(B(y,E[5],E[4]),S(y+1,E[5],E[4]),G[y+2]=E[5],G[y+3]=E[5],G[y+p+2]=E[5],G[y+p+3]=E[5]):(P(y,E[5],E[2]),P(y+1,E[2],E[5]),B(y+2,E[2],E[6]),T(y+3,E[2],E[6]),j(y+p+2,E[5],E[6],E[2]),R(y+p+3,E[6],E[5],E[2])),B(y+p,E[5],E[4]),S(y+p+1,E[5],E[4]),B(y+(p<<1),E[5],E[4]),S(y+(p<<1)+1,E[5],E[4]),S(y+(p<<1)+2,E[5],E[9]),P(y+(p<<1)+3,E[5],E[9]),B(y+3*p,E[5],E[4]),S(y+3*p+1,E[5],E[4]),P(y+3*p+2,E[5],E[9]),B(y+3*p+3,E[5],E[9]);break;case 237:case 233:B(y,E[5],E[2]),B(y+1,E[5],E[2]),U(y+2,E[5],E[2],E[6]),R(y+3,E[5],E[2],E[6]),S(y+p,E[5],E[2]),S(y+p+1,E[5],E[2]),j(y+p+2,E[5],E[6],E[2]),U(y+p+3,E[5],E[6],E[2]),G[y+(p<<1)]=E[5],G[y+(p<<1)+1]=E[5],S(y+(p<<1)+2,E[5],E[6]),B(y+(p<<1)+3,E[5],E[6]),z(E[8],E[4])?G[y+3*p]=E[5]:R(y+3*p,E[5],E[8],E[4]),G[y+3*p+1]=E[5],S(y+3*p+2,E[5],E[6]),B(y+3*p+3,E[5],E[6]);break;case 175:case 47:z(E[4],E[2])?G[y]=E[5]:R(y,E[5],E[2],E[4]),G[y+1]=E[5],S(y+2,E[5],E[6]),B(y+3,E[5],E[6]),G[y+p]=E[5],G[y+p+1]=E[5],S(y+p+2,E[5],E[6]),B(y+p+3,E[5],E[6]),S(y+(p<<1),E[5],E[8]),S(y+(p<<1)+1,E[5],E[8]),j(y+(p<<1)+2,E[5],E[6],E[8]),U(y+(p<<1)+3,E[5],E[6],E[8]),B(y+3*p,E[5],E[8]),B(y+3*p+1,E[5],E[8]),U(y+3*p+2,E[5],E[8],E[6]),R(y+3*p+3,E[5],E[8],E[6]);break;case 183:case 151:B(y,E[5],E[4]),S(y+1,E[5],E[4]),G[y+2]=E[5],z(E[2],E[6])?G[y+3]=E[5]:R(y+3,E[5],E[2],E[6]),B(y+p,E[5],E[4]),S(y+p+1,E[5],E[4]),G[y+p+2]=E[5],G[y+p+3]=E[5],U(y+(p<<1),E[5],E[4],E[8]),j(y+(p<<1)+1,E[5],E[4],E[8]),S(y+(p<<1)+2,E[5],E[8]),S(y+(p<<1)+3,E[5],E[8]),R(y+3*p,E[5],E[8],E[4]),U(y+3*p+1,E[5],E[8],E[4]),B(y+3*p+2,E[5],E[8]),B(y+3*p+3,E[5],E[8]);break;case 245:case 244:R(y,E[5],E[2],E[4]),U(y+1,E[5],E[2],E[4]),B(y+2,E[5],E[2]),B(y+3,E[5],E[2]),U(y+p,E[5],E[4],E[2]),j(y+p+1,E[5],E[4],E[2]),S(y+p+2,E[5],E[2]),S(y+p+3,E[5],E[2]),B(y+(p<<1),E[5],E[4]),S(y+(p<<1)+1,E[5],E[4]),G[y+(p<<1)+2]=E[5],G[y+(p<<1)+3]=E[5],B(y+3*p,E[5],E[4]),S(y+3*p+1,E[5],E[4]),G[y+3*p+2]=E[5],z(E[6],E[8])?G[y+3*p+3]=E[5]:R(y+3*p+3,E[5],E[8],E[6]);break;case 250:B(y,E[5],E[1]),P(y+1,E[5],E[1]),P(y+2,E[5],E[3]),B(y+3,E[5],E[3]),P(y+p,E[5],E[1]),S(y+p+1,E[5],E[1]),S(y+p+2,E[5],E[3]),P(y+p+3,E[5],E[3]),z(E[8],E[4])?(G[y+(p<<1)]=E[5],G[y+3*p]=E[5],G[y+3*p+1]=E[5]):(T(y+(p<<1),E[4],E[5]),T(y+3*p,E[8],E[4]),T(y+3*p+1,E[8],E[5])),G[y+(p<<1)+1]=E[5],G[y+(p<<1)+2]=E[5],z(E[6],E[8])?(G[y+(p<<1)+3]=E[5],G[y+3*p+2]=E[5],G[y+3*p+3]=E[5]):(T(y+(p<<1)+3,E[6],E[5]),T(y+3*p+2,E[8],E[5]),T(y+3*p+3,E[8],E[6]));break;case 123:z(E[4],E[2])?(G[y]=E[5],G[y+1]=E[5],G[y+p]=E[5]):(T(y,E[2],E[4]),T(y+1,E[2],E[5]),T(y+p,E[4],E[5])),P(y+2,E[5],E[3]),B(y+3,E[5],E[3]),G[y+p+1]=E[5],S(y+p+2,E[5],E[3]),P(y+p+3,E[5],E[3]),z(E[8],E[4])?(G[y+(p<<1)]=E[5],G[y+3*p]=E[5],G[y+3*p+1]=E[5]):(T(y+(p<<1),E[4],E[5]),T(y+3*p,E[8],E[4]),T(y+3*p+1,E[8],E[5])),G[y+(p<<1)+1]=E[5],S(y+(p<<1)+2,E[5],E[9]),P(y+(p<<1)+3,E[5],E[9]),P(y+3*p+2,E[5],E[9]),B(y+3*p+3,E[5],E[9]);break;case 95:z(E[4],E[2])?(G[y]=E[5],G[y+1]=E[5],G[y+p]=E[5]):(T(y,E[2],E[4]),T(y+1,E[2],E[5]),T(y+p,E[4],E[5])),z(E[2],E[6])?(G[y+2]=E[5],G[y+3]=E[5],G[y+p+3]=E[5]):(T(y+2,E[2],E[5]),T(y+3,E[2],E[6]),T(y+p+3,E[6],E[5])),G[y+p+1]=E[5],G[y+p+2]=E[5],P(y+(p<<1),E[5],E[7]),S(y+(p<<1)+1,E[5],E[7]),S(y+(p<<1)+2,E[5],E[9]),P(y+(p<<1)+3,E[5],E[9]),B(y+3*p,E[5],E[7]),P(y+3*p+1,E[5],E[7]),P(y+3*p+2,E[5],E[9]),B(y+3*p+3,E[5],E[9]);break;case 222:B(y,E[5],E[1]),P(y+1,E[5],E[1]),z(E[2],E[6])?(G[y+2]=E[5],G[y+3]=E[5],G[y+p+3]=E[5]):(T(y+2,E[2],E[5]),T(y+3,E[2],E[6]),T(y+p+3,E[6],E[5])),P(y+p,E[5],E[1]),S(y+p+1,E[5],E[1]),G[y+p+2]=E[5],P(y+(p<<1),E[5],E[7]),S(y+(p<<1)+1,E[5],E[7]),G[y+(p<<1)+2]=E[5],z(E[6],E[8])?(G[y+(p<<1)+3]=E[5],G[y+3*p+2]=E[5],G[y+3*p+3]=E[5]):(T(y+(p<<1)+3,E[6],E[5]),T(y+3*p+2,E[8],E[5]),T(y+3*p+3,E[8],E[6])),B(y+3*p,E[5],E[7]),P(y+3*p+1,E[5],E[7]);break;case 252:B(y,E[5],E[1]),U(y+1,E[5],E[2],E[1]),B(y+2,E[5],E[2]),B(y+3,E[5],E[2]),P(y+p,E[5],E[1]),S(y+p+1,E[5],E[1]),S(y+p+2,E[5],E[2]),S(y+p+3,E[5],E[2]),z(E[8],E[4])?(G[y+(p<<1)]=E[5],G[y+3*p]=E[5],G[y+3*p+1]=E[5]):(T(y+(p<<1),E[4],E[5]),T(y+3*p,E[8],E[4]),T(y+3*p+1,E[8],E[5])),G[y+(p<<1)+1]=E[5],G[y+(p<<1)+2]=E[5],G[y+(p<<1)+3]=E[5],G[y+3*p+2]=E[5],z(E[6],E[8])?G[y+3*p+3]=E[5]:R(y+3*p+3,E[5],E[8],E[6]);break;case 249:B(y,E[5],E[2]),B(y+1,E[5],E[2]),U(y+2,E[5],E[2],E[3]),B(y+3,E[5],E[3]),S(y+p,E[5],E[2]),S(y+p+1,E[5],E[2]),S(y+p+2,E[5],E[3]),P(y+p+3,E[5],E[3]),G[y+(p<<1)]=E[5],G[y+(p<<1)+1]=E[5],G[y+(p<<1)+2]=E[5],z(E[6],E[8])?(G[y+(p<<1)+3]=E[5],G[y+3*p+2]=E[5],G[y+3*p+3]=E[5]):(T(y+(p<<1)+3,E[6],E[5]),T(y+3*p+2,E[8],E[5]),T(y+3*p+3,E[8],E[6])),z(E[8],E[4])?G[y+3*p]=E[5]:R(y+3*p,E[5],E[8],E[4]),G[y+3*p+1]=E[5];break;case 235:z(E[4],E[2])?(G[y]=E[5],G[y+1]=E[5],G[y+p]=E[5]):(T(y,E[2],E[4]),T(y+1,E[2],E[5]),T(y+p,E[4],E[5])),P(y+2,E[5],E[3]),B(y+3,E[5],E[3]),G[y+p+1]=E[5],S(y+p+2,E[5],E[3]),U(y+p+3,E[5],E[6],E[3]),G[y+(p<<1)]=E[5],G[y+(p<<1)+1]=E[5],S(y+(p<<1)+2,E[5],E[6]),B(y+(p<<1)+3,E[5],E[6]),z(E[8],E[4])?G[y+3*p]=E[5]:R(y+3*p,E[5],E[8],E[4]),G[y+3*p+1]=E[5],S(y+3*p+2,E[5],E[6]),B(y+3*p+3,E[5],E[6]);break;case 111:z(E[4],E[2])?G[y]=E[5]:R(y,E[5],E[2],E[4]),G[y+1]=E[5],S(y+2,E[5],E[6]),B(y+3,E[5],E[6]),G[y+p]=E[5],G[y+p+1]=E[5],S(y+p+2,E[5],E[6]),B(y+p+3,E[5],E[6]),
z(E[8],E[4])?(G[y+(p<<1)]=E[5],G[y+3*p]=E[5],G[y+3*p+1]=E[5]):(T(y+(p<<1),E[4],E[5]),T(y+3*p,E[8],E[4]),T(y+3*p+1,E[8],E[5])),G[y+(p<<1)+1]=E[5],S(y+(p<<1)+2,E[5],E[9]),U(y+(p<<1)+3,E[5],E[6],E[9]),P(y+3*p+2,E[5],E[9]),B(y+3*p+3,E[5],E[9]);break;case 63:z(E[4],E[2])?G[y]=E[5]:R(y,E[5],E[2],E[4]),G[y+1]=E[5],z(E[2],E[6])?(G[y+2]=E[5],G[y+3]=E[5],G[y+p+3]=E[5]):(T(y+2,E[2],E[5]),T(y+3,E[2],E[6]),T(y+p+3,E[6],E[5])),G[y+p]=E[5],G[y+p+1]=E[5],G[y+p+2]=E[5],S(y+(p<<1),E[5],E[8]),S(y+(p<<1)+1,E[5],E[8]),S(y+(p<<1)+2,E[5],E[9]),P(y+(p<<1)+3,E[5],E[9]),B(y+3*p,E[5],E[8]),B(y+3*p+1,E[5],E[8]),U(y+3*p+2,E[5],E[8],E[9]),B(y+3*p+3,E[5],E[9]);break;case 159:z(E[4],E[2])?(G[y]=E[5],G[y+1]=E[5],G[y+p]=E[5]):(T(y,E[2],E[4]),T(y+1,E[2],E[5]),T(y+p,E[4],E[5])),G[y+2]=E[5],z(E[2],E[6])?G[y+3]=E[5]:R(y+3,E[5],E[2],E[6]),G[y+p+1]=E[5],G[y+p+2]=E[5],G[y+p+3]=E[5],P(y+(p<<1),E[5],E[7]),S(y+(p<<1)+1,E[5],E[7]),S(y+(p<<1)+2,E[5],E[8]),S(y+(p<<1)+3,E[5],E[8]),B(y+3*p,E[5],E[7]),U(y+3*p+1,E[5],E[8],E[7]),B(y+3*p+2,E[5],E[8]),B(y+3*p+3,E[5],E[8]);break;case 215:B(y,E[5],E[4]),S(y+1,E[5],E[4]),G[y+2]=E[5],z(E[2],E[6])?G[y+3]=E[5]:R(y+3,E[5],E[2],E[6]),B(y+p,E[5],E[4]),S(y+p+1,E[5],E[4]),G[y+p+2]=E[5],G[y+p+3]=E[5],U(y+(p<<1),E[5],E[4],E[7]),S(y+(p<<1)+1,E[5],E[7]),G[y+(p<<1)+2]=E[5],z(E[6],E[8])?(G[y+(p<<1)+3]=E[5],G[y+3*p+2]=E[5],G[y+3*p+3]=E[5]):(T(y+(p<<1)+3,E[6],E[5]),T(y+3*p+2,E[8],E[5]),T(y+3*p+3,E[8],E[6])),B(y+3*p,E[5],E[7]),P(y+3*p+1,E[5],E[7]);break;case 246:B(y,E[5],E[1]),P(y+1,E[5],E[1]),z(E[2],E[6])?(G[y+2]=E[5],G[y+3]=E[5],G[y+p+3]=E[5]):(T(y+2,E[2],E[5]),T(y+3,E[2],E[6]),T(y+p+3,E[6],E[5])),U(y+p,E[5],E[4],E[1]),S(y+p+1,E[5],E[1]),G[y+p+2]=E[5],B(y+(p<<1),E[5],E[4]),S(y+(p<<1)+1,E[5],E[4]),G[y+(p<<1)+2]=E[5],G[y+(p<<1)+3]=E[5],B(y+3*p,E[5],E[4]),S(y+3*p+1,E[5],E[4]),G[y+3*p+2]=E[5],z(E[6],E[8])?G[y+3*p+3]=E[5]:R(y+3*p+3,E[5],E[8],E[6]);break;case 254:B(y,E[5],E[1]),P(y+1,E[5],E[1]),z(E[2],E[6])?(G[y+2]=E[5],G[y+3]=E[5],G[y+p+3]=E[5]):(T(y+2,E[2],E[5]),T(y+3,E[2],E[6]),T(y+p+3,E[6],E[5])),P(y+p,E[5],E[1]),S(y+p+1,E[5],E[1]),G[y+p+2]=E[5],z(E[8],E[4])?(G[y+(p<<1)]=E[5],G[y+3*p]=E[5],G[y+3*p+1]=E[5]):(T(y+(p<<1),E[4],E[5]),T(y+3*p,E[8],E[4]),T(y+3*p+1,E[8],E[5])),G[y+(p<<1)+1]=E[5],G[y+(p<<1)+2]=E[5],G[y+(p<<1)+3]=E[5],G[y+3*p+2]=E[5],z(E[6],E[8])?G[y+3*p+3]=E[5]:R(y+3*p+3,E[5],E[8],E[6]);break;case 253:B(y,E[5],E[2]),B(y+1,E[5],E[2]),B(y+2,E[5],E[2]),B(y+3,E[5],E[2]),S(y+p,E[5],E[2]),S(y+p+1,E[5],E[2]),S(y+p+2,E[5],E[2]),S(y+p+3,E[5],E[2]),G[y+(p<<1)]=E[5],G[y+(p<<1)+1]=E[5],G[y+(p<<1)+2]=E[5],G[y+(p<<1)+3]=E[5],z(E[8],E[4])?G[y+3*p]=E[5]:R(y+3*p,E[5],E[8],E[4]),G[y+3*p+1]=E[5],G[y+3*p+2]=E[5],z(E[6],E[8])?G[y+3*p+3]=E[5]:R(y+3*p+3,E[5],E[8],E[6]);break;case 251:z(E[4],E[2])?(G[y]=E[5],G[y+1]=E[5],G[y+p]=E[5]):(T(y,E[2],E[4]),T(y+1,E[2],E[5]),T(y+p,E[4],E[5])),P(y+2,E[5],E[3]),B(y+3,E[5],E[3]),G[y+p+1]=E[5],S(y+p+2,E[5],E[3]),P(y+p+3,E[5],E[3]),G[y+(p<<1)]=E[5],G[y+(p<<1)+1]=E[5],G[y+(p<<1)+2]=E[5],z(E[6],E[8])?(G[y+(p<<1)+3]=E[5],G[y+3*p+2]=E[5],G[y+3*p+3]=E[5]):(T(y+(p<<1)+3,E[6],E[5]),T(y+3*p+2,E[8],E[5]),T(y+3*p+3,E[8],E[6])),z(E[8],E[4])?G[y+3*p]=E[5]:R(y+3*p,E[5],E[8],E[4]),G[y+3*p+1]=E[5];break;case 239:z(E[4],E[2])?G[y]=E[5]:R(y,E[5],E[2],E[4]),G[y+1]=E[5],S(y+2,E[5],E[6]),B(y+3,E[5],E[6]),G[y+p]=E[5],G[y+p+1]=E[5],S(y+p+2,E[5],E[6]),B(y+p+3,E[5],E[6]),G[y+(p<<1)]=E[5],G[y+(p<<1)+1]=E[5],S(y+(p<<1)+2,E[5],E[6]),B(y+(p<<1)+3,E[5],E[6]),z(E[8],E[4])?G[y+3*p]=E[5]:R(y+3*p,E[5],E[8],E[4]),G[y+3*p+1]=E[5],S(y+3*p+2,E[5],E[6]),B(y+3*p+3,E[5],E[6]);break;case 127:z(E[4],E[2])?G[y]=E[5]:R(y,E[5],E[2],E[4]),G[y+1]=E[5],z(E[2],E[6])?(G[y+2]=E[5],G[y+3]=E[5],G[y+p+3]=E[5]):(T(y+2,E[2],E[5]),T(y+3,E[2],E[6]),T(y+p+3,E[6],E[5])),G[y+p]=E[5],G[y+p+1]=E[5],G[y+p+2]=E[5],z(E[8],E[4])?(G[y+(p<<1)]=E[5],G[y+3*p]=E[5],G[y+3*p+1]=E[5]):(T(y+(p<<1),E[4],E[5]),T(y+3*p,E[8],E[4]),T(y+3*p+1,E[8],E[5])),G[y+(p<<1)+1]=E[5],S(y+(p<<1)+2,E[5],E[9]),P(y+(p<<1)+3,E[5],E[9]),P(y+3*p+2,E[5],E[9]),B(y+3*p+3,E[5],E[9]);break;case 191:z(E[4],E[2])?G[y]=E[5]:R(y,E[5],E[2],E[4]),G[y+1]=E[5],G[y+2]=E[5],z(E[2],E[6])?G[y+3]=E[5]:R(y+3,E[5],E[2],E[6]),G[y+p]=E[5],G[y+p+1]=E[5],G[y+p+2]=E[5],G[y+p+3]=E[5],S(y+(p<<1),E[5],E[8]),S(y+(p<<1)+1,E[5],E[8]),S(y+(p<<1)+2,E[5],E[8]),S(y+(p<<1)+3,E[5],E[8]),B(y+3*p,E[5],E[8]),B(y+3*p+1,E[5],E[8]),B(y+3*p+2,E[5],E[8]),B(y+3*p+3,E[5],E[8]);break;case 223:z(E[4],E[2])?(G[y]=E[5],G[y+1]=E[5],G[y+p]=E[5]):(T(y,E[2],E[4]),T(y+1,E[2],E[5]),T(y+p,E[4],E[5])),G[y+2]=E[5],z(E[2],E[6])?G[y+3]=E[5]:R(y+3,E[5],E[2],E[6]),G[y+p+1]=E[5],G[y+p+2]=E[5],G[y+p+3]=E[5],P(y+(p<<1),E[5],E[7]),S(y+(p<<1)+1,E[5],E[7]),G[y+(p<<1)+2]=E[5],z(E[6],E[8])?(G[y+(p<<1)+3]=E[5],G[y+3*p+2]=E[5],G[y+3*p+3]=E[5]):(T(y+(p<<1)+3,E[6],E[5]),T(y+3*p+2,E[8],E[5]),T(y+3*p+3,E[8],E[6])),B(y+3*p,E[5],E[7]),P(y+3*p+1,E[5],E[7]);break;case 247:B(y,E[5],E[4]),S(y+1,E[5],E[4]),G[y+2]=E[5],z(E[2],E[6])?G[y+3]=E[5]:R(y+3,E[5],E[2],E[6]),B(y+p,E[5],E[4]),S(y+p+1,E[5],E[4]),G[y+p+2]=E[5],G[y+p+3]=E[5],B(y+(p<<1),E[5],E[4]),S(y+(p<<1)+1,E[5],E[4]),G[y+(p<<1)+2]=E[5],G[y+(p<<1)+3]=E[5],B(y+3*p,E[5],E[4]),S(y+3*p+1,E[5],E[4]),G[y+3*p+2]=E[5],z(E[6],E[8])?G[y+3*p+3]=E[5]:R(y+3*p+3,E[5],E[8],E[6]);break;case 255:z(E[4],E[2])?G[y]=E[5]:R(y,E[5],E[2],E[4]),G[y+1]=E[5],G[y+2]=E[5],z(E[2],E[6])?G[y+3]=E[5]:R(y+3,E[5],E[2],E[6]),G[y+p]=E[5],G[y+p+1]=E[5],G[y+p+2]=E[5],G[y+p+3]=E[5],G[y+(p<<1)]=E[5],G[y+(p<<1)+1]=E[5],G[y+(p<<1)+2]=E[5],G[y+(p<<1)+3]=E[5],z(E[8],E[4])?G[y+3*p]=E[5]:R(y+3*p,E[5],E[8],E[4]),G[y+3*p+1]=E[5],G[y+3*p+2]=E[5],z(E[6],E[8])?G[y+3*p+3]=E[5]:R(y+3*p+3,E[5],E[8],E[6])}q++,y+=4}y+=3*p}}}(this);
// https://github.com/jorgejeferson/translate.js/tree/39be8237666a76035fc210a28d8e431f1416579e
(function ($) {
	$.fn.translate = function (options) {
		var that = this; //a reference to ourselves
		var settings = {
			css: "trn",
			attrs: ["alt", "placeholder", "title"],
			lang: "pt",
			langDefault: "pt",
		};
		settings = $.extend(settings, options || {});
		if (settings.css.lastIndexOf(".", 0) !== 0) { //doesn't start with '.'
			settings.css = "." + settings.css;
		}
		var t = settings.t;
		//public methods
		this.lang = function (l) {
			if (l) {
				settings.lang = l;
				this.translate(settings);  //translate everything
			}
			return settings.lang;
		};
		this.get = function (index) {
			var res = index;

			try {
				res = t[index][settings.lang];
			} catch (err) { //not found, return index
				return index;
			}
			if (res) {
				return res;
			} else {
				return index;
			}
		};
		this.g = this.get;
		//main
		this.find(settings.css).each(function (i) {
			var $this = $(this);

			var trn_key = $this.attr("data-trn-key");
			if (!trn_key) {
				trn_key = $this.html();
				$this.attr("data-trn-key", trn_key);
			}
			// Filtering attr
			$.each(this.attributes, function () {
				if ($.inArray(this.name, settings.attrs) !== -1) {
					var trn_attr_key = $this.attr("data-trn-attr");
					if (!trn_attr_key) {
						trn_attr_key = $this.attr(this.name);
						$this.attr("data-trn-attr", trn_attr_key);
					}
					$this.attr(this.name, that.get(trn_attr_key));
				}
			});
			$this.html(that.get(trn_key));
		});
		return this;
	};
})(jQuery);

/* global fx, ImageFilters, canvas_active */

var VINTAGE = new VINTAGE_CLASS();

/**
 * adds vintage effect
 * 
 * @author ViliusL
 * 
 * Functions:
 *  - adjust_color
 *  - lower_contrast
 *  - blur
 *  - light_leak
 *  - chemicals
 *  - exposure
 *  - grains
 *  - grains_big
 *  - optics
 *  - dusts
 *  
 * Usage:	VINTAGE.___function___(canvas_ctx, width, height, param1, param2, ...);
 * 
 * libs:		
 *  - imagefilters.js, url: https://github.com/arahaya/ImageFilters.js
 *  - glfx.js url: http://evanw.github.com/glfx.js/
 */
function VINTAGE_CLASS() {
  var fx_filter = false;

  //increasing red color
  this.adjust_color = function (context, W, H, level_red) {	//level = [0, 200], default 70
    var param_green = 0;
    var param_blue = 0;
    var imageData = context.getImageData(0, 0, W, H);
    var filtered = ImageFilters.ColorTransformFilter(imageData, 1, 1, 1, 1, level_red, param_green, param_blue, 1);
    context.putImageData(filtered, 0, 0);
  };

  //decreasing contrast
  this.lower_contrast = function (context, W, H, level) {	//level = [0, 50], default 15
    var imageData = context.getImageData(0, 0, W, H);
    var filtered = ImageFilters.BrightnessContrastPhotoshop(imageData, 0, -level);
    context.putImageData(filtered, 0, 0);
  };

  //adding blur
  this.blur = function (context, W, H, level) {	//level = [0, 2], default 0
    if (level < 1)
      return context;
    var imageData = context.getImageData(0, 0, W, H);
    var filtered = ImageFilters.GaussianBlur(imageData, level);
    context.putImageData(filtered, 0, 0);
  };

  //creating transparent #ffa500 radial gradients
  this.light_leak = function (context, W, H, level) {	//level = [0, 150], default 90
    var click_x = this.getRandomInt(0, W);
    var click_y = this.getRandomInt(0, H);
    var distance = Math.min(W, H) * 0.6;
    var radgrad = canvas_active().createRadialGradient(
            click_x, click_y, distance * level / 255,
            click_x, click_y, distance);
    radgrad.addColorStop(0, "rgba(255, 165, 0, " + level / 255 + ")");
    radgrad.addColorStop(1, "rgba(255, 255, 255, 0)");

    context.fillStyle = radgrad;
    context.fillRect(0, 0, W, H);
  };

  //de-saturate
  this.chemicals = function (context, W, H, level) {	//level = [0, 100], default 40
    var imageData = context.getImageData(0, 0, W, H);
    var filtered = ImageFilters.HSLAdjustment(imageData, 0, -level, 0);
    context.putImageData(filtered, 0, 0);
  };

  //creating transparent vertical black-to-white gradients
  this.exposure = function (context, W, H, level) {		//level = [0, 150], default 80
    context.rect(0, 0, W, H);
    var grd = canvas_active().createLinearGradient(0, 0, 0, H);
    if (this.getRandomInt(1, 10) < 5) {
      //dark at top
      grd.addColorStop(0, "rgba(0, 0, 0, " + level / 255 + ")");
      grd.addColorStop(1, "rgba(255, 255, 255, " + level / 255 + ")");
    } else {
      //bright at top
      grd.addColorStop(0, "rgba(255, 255, 255, " + level / 255 + ")");
      grd.addColorStop(1, "rgba(0, 0, 0, " + level / 255 + ")");
    }
    context.fillStyle = grd;
    context.fill();
  };

  //add grains, noise
  this.grains = function (context, W, H, level) {	//level = [0, 50], default 10
    if (level == 0)
      return context;
    var img = context.getImageData(0, 0, W, H);
    var imgData = img.data;
    for (var j = 0; j < H; j++) {
      for (var i = 0; i < W; i++) {
        var x = (i + j * W) * 4;
        if (imgData[x + 3] == 0)
          continue;	//transparent
        //increase it's lightness
        var delta = this.getRandomInt(0, level);
        if (delta == 0)
          continue;

        if (imgData[x] - delta < 0)
          imgData[x] = -(imgData[x] - delta);
        else
          imgData[x] = imgData[x] - delta;
        if (imgData[x + 1] - delta < 0)
          imgData[x + 1] = -(imgData[x + 1] - delta);
        else
          imgData[x + 1] = imgData[x + 1] - delta;
        if (imgData[x + 2] - delta < 0)
          imgData[x + 2] = -(imgData[x + 2] - delta);
        else
          imgData[x + 2] = imgData[x + 2] - delta;
      }
    }
    context.putImageData(img, 0, 0);
  };

  //add big grains, noise
  this.grains_big = function (context, W, H, level) {	//level = [0, 50], default 20
    if (level == 0)
      return context;
    var n = W * H / 100 * level;	//density
    var color = 200;
    for (var i = 0; i < n; i++) {
      var power = this.getRandomInt(5, 10 + level);
      var size = 2;
      var x = this.getRandomInt(0, W);
      var y = this.getRandomInt(0, H);
      context.fillStyle = "rgba(" + color + ", " + color + ", " + color + ", " + power / 255 + ")";
      context.fillRect(x, y, size, size);
    }
  };

  //adding vignette effect - blured dark borders
  this.optics = function (context, W, H, param1, param2) {	//param1 [0, 0.5], param2 [0, 0.7], default 0.3, 0.5
    //make sure FX lib loaded
    if (fx_filter == false) {
      fx_filter = fx.canvas();
    }

    var texture = fx_filter.texture(context.getImageData(0, 0, W, H));
    fx_filter.draw(texture).vignette(param1, param2).update();
    context.drawImage(fx_filter, 0, 0);
  };

  //add dust and hairs
  this.dusts = function (context, W, H, level) {	//level = [0, 100], default 70
    var n = level / 100 * (W * H) / 1000;
    //add dust
    context.fillStyle = "rgba(200, 200, 200, 0.3)";
    for (var i = 0; i < n; i++) {
      var x = this.getRandomInt(0, W);
      var y = this.getRandomInt(0, H);
      var mode = this.getRandomInt(1, 2);
      if (mode == 1) {
        var w = 1;
        var h = this.getRandomInt(1, 3);
      } else if (mode == 2) {
        var w = this.getRandomInt(1, 3);
        var h = 1;
      }
      context.beginPath();
      context.rect(x, y, w, h);
      context.fill();
    }

    //add hairs
    context.strokeStyle = "rgba(200, 200, 200, 0.2)";
    for (var i = 0; i < n / 3; i++) {
      var x = this.getRandomInt(0, W);
      var y = this.getRandomInt(0, H);
      var radius = this.getRandomInt(5, 15);
      var start_nr = this.getRandomInt(0, 20) / 10;
      var start_angle = Math.PI * start_nr;
      var end_angle = Math.PI * (start_nr + this.getRandomInt(7, 15) / 10);
      context.beginPath();
      context.arc(x, y, radius, start_angle, end_angle);
      context.stroke();
    }

    return context;
  };

  //random number generator
  this.getRandomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
}

/**
 * SIFT: scale-invariant-feature-transform, keypoints
 * 
 * @author ViliusL
 */

/* global HELPER, IMAGE, ImageFilters, LAYER, canvas_active */

var SIFT = new SIFT_CLASS();

function SIFT_CLASS() {
  /**
   * contrast check, smaller - more points, better accuracy, but slower
   */
  var avg_offset = 50;

  /**
   * how much pixels to check for each side to get average
   */
  var avg_step = 4;

  //generate key points for image
  this.generate_keypoints = function (canvas, show_points) {
    var W = canvas.width;
    var H = canvas.height;
    HELPER.timer_init();

    //check whitespace
    var trim_details = IMAGE.trim_info(canvas);
    W = W - trim_details.left - trim_details.right;
    H = H - trim_details.top - trim_details.bottom;
    //make copy
    var clone = document.createElement("canvas");
    clone.width = W;
    clone.height = H;
    var ctx = clone.getContext("2d");
    ctx.drawImage(canvas, -trim_details.left, -trim_details.top, canvas.width, canvas.height);

    //greyscale
    var imageData = ctx.getImageData(0, 0, W, H);
    var filtered = ImageFilters.GrayScale(imageData); //add effect
    ctx.putImageData(filtered, 0, 0);

    //make few copies and blur each
    var n = 5;
    var copies = [];
    for (var i = 0; i < n; i++) {
      var tmp_canvas = document.createElement("canvas");
      tmp_canvas.width = W;
      tmp_canvas.height = H;
      var ctx_i = tmp_canvas.getContext("2d");
      ctx_i.drawImage(clone, 0, 0);

      //gausian blur
      var imageData = ctx_i.getImageData(0, 0, W, H);
      var filtered = ImageFilters.GaussianBlur(imageData, i + 0.5); //add effect
      ctx_i.putImageData(filtered, 0, 0);

      copies.push(tmp_canvas);
    }

    //find extreme points
    var points = [];
    var n0 = avg_step * 2 + 1;
    for (var c = 1; c < copies.length - 1; c++) {
      var imageData = copies[c].getContext("2d").getImageData(0, 0, W, H).data;
      var imageData0 = copies[c - 1].getContext("2d").getImageData(0, 0, W, H).data;
      var imageData2 = copies[c + 1].getContext("2d").getImageData(0, 0, W, H).data;
      for (var j = avg_step; j < H - avg_step; j++) {
        for (var i = avg_step; i < W - avg_step; i++) {
          var x = (i + j * W) * 4;
          if (imageData[x + 3] == 0)
            continue; //transparent
          if (imageData[x] < imageData[x - 4] || imageData[x] < imageData[x + 4] || imageData[x] > imageData[x - 4] || imageData[x] > imageData[x + 4]) {
            var x_pre = (i + (j - 1) * W) * 4;
            var x_post = (i + (j + 1) * W) * 4;
            //calc average
            var area_average = 0;
            for (var l = -avg_step; l <= avg_step; l++) {
              var avgi = (i + (j - l) * W) * 4;
              for (var a = -avg_step; a <= avg_step; a++) {
                area_average += imageData[avgi + 4 * a];
              }
            }
            area_average = area_average / (n0 * n0);
            //max
            if (imageData[x] + avg_offset < area_average) {
              var min = Math.min(imageData[x_pre - 4], imageData[x_pre], imageData[x_pre + 4], imageData[x - 4], imageData[x + 4], imageData[x_post - 4], imageData[x_post], imageData[x_post + 4]);
              if (imageData[x] <= min) {
                var min0 = Math.min(imageData0[x_pre - 4], imageData0[x_pre], imageData0[x_pre + 4], imageData0[x - 4], imageData0[x + 4], imageData0[x_post - 4], imageData0[x_post], imageData0[x_post + 4]);
                if (imageData[x] <= min0) {
                  var min2 = Math.min(imageData2[x_pre - 4], imageData2[x_pre], imageData2[x_pre + 4], imageData2[x - 4], imageData2[x + 4], imageData2[x_post - 4], imageData2[x_post], imageData2[x_post + 4]);
                  if (imageData[x] <= min2)
                    points.push({
                      x: i + trim_details.left,
                      y: j + trim_details.top,
                      w: Math.round(area_average - imageData[x] - avg_offset)
                    });
                }
              }
              continue;
            }
            //min
            if (imageData[x] - avg_offset > area_average) {
              var max = Math.max(imageData[x_pre - 4], imageData[x_pre], imageData[x_pre + 4], imageData[x - 4], imageData[x + 4], imageData[x_post - 4], imageData[x_post], imageData[x_post + 4]);
              if (imageData[x] >= max) {
                var max0 = Math.max(imageData0[x_pre - 4], imageData0[x_pre], imageData0[x_pre + 4], imageData0[x - 4], imageData0[x + 4], imageData0[x_post - 4], imageData0[x_post], imageData0[x_post + 4]);
                if (imageData[x] >= max0) {
                  var max2 = Math.max(imageData2[x_pre - 4], imageData2[x_pre], imageData2[x_pre + 4], imageData2[x - 4], imageData2[x + 4], imageData2[x_post - 4], imageData2[x_post], imageData2[x_post + 4]);
                  if (imageData[x] >= max2) {
                    points.push({
                      x: i + trim_details.left,
                      y: j + trim_details.top,
                      w: Math.round(imageData[x] - area_average - avg_offset)
                    });
                  }
                }
              }
            }
          }
        }
      }
    }
    //make unique
    for (var i = 0; i < points.length; i++) {
      for (var j = 0; j < points.length; j++) {
        if (i != j && points[i].x == points[j].x && points[i].y == points[j].y) {
          points.splice(i, 1);
          i--;
          break;
        }
      }
    }

    //show points?
    if (show_points === true) {
      var time = HELPER.timer('', true);
      console.log('key points: ' + points.length + ", " + time);
      LAYER.layer_add();

      var size = 3;
      canvas_active().fillStyle = "#ff0000";
      for (var i in points) {
        var point = points[i];
        canvas_active().beginPath();
        canvas_active().rect(point.x - Math.floor(size / 2) + 1, point.y - Math.floor(size / 2) + 1, size, size);
        canvas_active().fill();
      }
    } else {
      //sort by weights 
      points.sort(function (a, b) {
        return parseFloat(b.w) - parseFloat(a.w);
      });
      return {
        points: points,
        trim_details: trim_details
      };
    }
  };

  //returns average value of requested area from greyscale image
  //area = {x, y, w, h}
  this.get_area_average = function (area, imageData, i, j, size) {
    var imgData = imageData.data;
    var sum = 0;
    var n = 0;
    size = size / 100; //prepare to use 1-100% values
    var stop_x = i + Math.round(size * area.x) + Math.round(size * area.w);
    var stop_y = j + Math.round(size * area.y) + Math.round(size * area.h);
    var img_width4 = imageData.width * 4;
    var k0, k;
    for (var y = j + Math.round(size * area.y); y < stop_y; y++) {
      k0 = y * img_width4;
      for (var x = i + Math.round(size * area.x); x < stop_x; x++) {
        k = k0 + (x * 4);
        sum = sum + imgData[k];
        n++;
      }
    }
    return Math.round(sum / n);
  };
}

/* global WIDTH, HEIGHT, parseInt */

var HELPER = new HELPER_CLASS();

/**
 * various helpers
 * 
 * @author ViliusL
 */
function HELPER_CLASS() {
  var time;

  this.timer_init = function () {
    time = Date.now();
  };

  this.timer = function (s, echo) {
    var str = "time(" + s + ") = " + (Math.round(Date.now() - time) / 1000) + " s";
    if (echo === true)
      return str;
    else
      console.log(str);
  };

  this.strpos = function (haystack, needle, offset) {
    var i = (haystack + '').indexOf(needle, (offset || 0));
    return i === -1 ? false : i;
  };

  this.getCookie = function (NameOfCookie) {
    if (document.cookie.length > 0) {
      begin = document.cookie.indexOf(NameOfCookie + "=");
      if (begin != -1) {
        begin += NameOfCookie.length + 1;
        end = document.cookie.indexOf(";", begin);
        if (end == -1)
          end = document.cookie.length;
        return unescape(document.cookie.substring(begin, end));
      }
    }
    return '';
  };

  this.setCookie = function (NameOfCookie, value, expiredays) {
    var ExpireDate = new Date();
    ExpireDate.setTime(ExpireDate.getTime() + (expiredays * 24 * 3600 * 1000));
    document.cookie = NameOfCookie + "=" + escape(value) +
            ((expiredays == null) ? "" : "; expires=" + ExpireDate.toGMTString());
  };

  this.delCookie = function (NameOfCookie) {
    if (HELPER.getCookie(NameOfCookie)) {
      document.cookie = NameOfCookie + "=" +
              "; expires=Thu, 01-Jan-70 00:00:01 GMT";
    }
  };

  this.getRandomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  this.font_pixel_to_height = function (px) {
    return Math.round(px * 0.75);
  };

  this.rgbToHex = function (r, g, b) {
    if (r > 255 || g > 255 || b > 255)
      throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
  };

  this.rgb2hex_all = function (rgb) {
    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    return "#" + HELPER.hex(rgb[1]) + HELPER.hex(rgb[2]) + HELPER.hex(rgb[3]);
  };

  this.hex = function (x) {
    return ("0" + parseInt(x).toString(16)).slice(-2);
  };

  this.hex2rgb = function (hex) {
    if (hex[0] == "#")
      hex = hex.substr(1);
    if (hex.length == 3) {
      var temp = hex;
      hex = '';
      temp = /^([a-f0-9])([a-f0-9])([a-f0-9])$/i.exec(temp).slice(1);
      for (var i = 0; i < 3; i++)
        hex += temp[i] + temp[i];
    }
    var triplets = /^([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i.exec(hex).slice(1);
    return {
      r: parseInt(triplets[0], 16),
      g: parseInt(triplets[1], 16),
      b: parseInt(triplets[2], 16),
      a: 255
    };
  };

  this.remove_selection = function () {
    if (window.getSelection) {
      if (window.getSelection().empty) // Chrome
        window.getSelection().empty();
      else if (window.getSelection().removeAllRanges) // Firefox
        window.getSelection().removeAllRanges();
    } else if (document.selection) // IE?
      document.selection.empty();
  };

  this.get_dimensions = function () {
    var theWidth, theHeight;
    if (window.innerWidth) {
      theWidth = window.innerWidth;
    } else if (document.documentElement && document.documentElement.clientWidth) {
      theWidth = document.documentElement.clientWidth;
    } else if (document.body) {
      theWidth = document.body.clientWidth;
    }
    if (window.innerHeight) {
      theHeight = window.innerHeight;
    } else if (document.documentElement && document.documentElement.clientHeight) {
      theHeight = document.documentElement.clientHeight;
    } else if (document.body) {
      theHeight = document.body.clientHeight;
    }
    return [theWidth, theHeight];
  };

  //credits: richard maloney 2006
  this.darkenColor = function (color, v) {
    if (color.length > 6) {
      color = color.substring(1, color.length);
    }
    var rgb = parseInt(color, 16);
    var r = Math.abs(((rgb >> 16) & 0xFF) + v);
    if (r > 255)
      r = r - (r - 255);
    var g = Math.abs(((rgb >> 8) & 0xFF) + v);
    if (g > 255)
      g = g - (g - 255);
    var b = Math.abs((rgb & 0xFF) + v);
    if (b > 255)
      b = b - (b - 255);
    r = Number(r < 0 || isNaN(r)) ? 0 : ((r > 255) ? 255 : r).toString(16);
    if (r.length == 1)
      r = '0' + r;
    g = Number(g < 0 || isNaN(g)) ? 0 : ((g > 255) ? 255 : g).toString(16);
    if (g.length == 1)
      g = '0' + g;
    b = Number(b < 0 || isNaN(b)) ? 0 : ((b > 255) ? 255 : b).toString(16);
    if (b.length == 1)
      b = '0' + b;
    return "#" + r + g + b;
  };

  //IntegraXor Web SCADA - JavaScript Number Formatter, author: KPL, KHL
  this.number_format = function (n, decPlaces, thouSeparator, decSeparator) {
    var decPlaces = isNaN(decPlaces = Math.abs(decPlaces)) ? 2 : decPlaces;
    var decSeparator = decSeparator == undefined ? "." : decSeparator;
    var thouSeparator = thouSeparator == undefined ? "," : thouSeparator;
    var sign = n < 0 ? "-" : "";
    var i = parseInt(n = Math.abs(+n || 0).toFixed(decPlaces)) + "";
    var j = (j = i.length) > 3 ? j % 3 : 0;
    return sign + (j ? i.substr(0, j) + thouSeparator : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thouSeparator) + (decPlaces ? decSeparator + Math.abs(n - i).toFixed(decPlaces).slice(2) : "");
  };

  this.chech_input_color_support = function (id) {
    if (document.getElementById(id).value != undefined && document.getElementById(id).value[0] == '#')
      return true;
    return false;
  };

  this.b64toBlob = function (b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);

      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      var byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, {type: contentType});
    return blob;
  };
  this.escapeHtml = function (text) {
    return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
  };
  this.isNumeric = function (n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  };
}

/* global MAIN, HELPER, POP, LAYER, EFFECTS, GUI */
/* global canvas_front, WIDTH, HEIGHT */

var POP = new popup();

/**
 * user dialogs library
 * 
 * @author ViliusL
 * 
 * Usage:
 * var POP = new popup();
 * POP.add({name: "param1", title: "value1:" });
 * POP.add(...);
 * POP.show('title', main_handler, preview_handler, onload_handler);
 * 
 * POP.add() parameters:
 * - name		type			example
 * - ---------------------------------------------------------------
 * - name		string		'parameter1'
 * - title		string		'enter value:'
 * - type		string		'select', 'textarea', 'color'
 * - value		string		'314'
 * - values		array fo strings	['one', 'two', 'three']
 * - range		numbers interval	[0, 255]
 * - step		int/float		1	
 * - placeholder	text			'enter number here'
 * - html		html text		'<b>bold</b>'
 * - function	function		'cutom_function'
 * - onchange	function		'class.onchange_function()'
 */
function popup() {
  this.active = false;
  this.handler = '';
  this.preview = false;
  this.onload = false;
  this.width_mini = 184;
  this.height_mini = 195;
  this.preview_in_main = false;
  this.effects = false;
  this.id = 0;
  var parameters = [];
  var layer_active_small = document.createElement("canvas");
  var layer_active_small_ctx = layer_active_small.getContext("2d");

  //add parameter
  this.add = function (object) {
    parameters.push(object);
  };

  /**
   * show popup window.
   * used strings: "Ok", "Cancel", "Preview"
   * 
   * @param string title
   * @param function handler
   * @param function preview_handler
   * @param function onload_handler
   */
  this.show = function (title, handler, preview_handler, onload_handler) {
    POP.id = HELPER.getRandomInt(0, 999999999);
    if (this.active == true) {
      this.hide();
      return false;
    }
    this.active = true;
    this.handler = handler;
    if (preview_handler != undefined)
      this.preview = preview_handler;
    if (onload_handler != undefined)
      this.onload = onload_handler;
    var html = '';

    var dim = HELPER.get_dimensions();
    popup = document.getElementById('popup');
    popup.style.top = 150 + 'px';
    popup.style.left = Math.round(dim[0] / 2) + 'px';

    if (this.effects == true) {
      var index;
      for (var i = 0; i < EFFECTS.FILTERS_LIST.length; i++) {
        if (EFFECTS.FILTERS_LIST[i].name == GUI.last_menu) {
          index = i;
          break;
        }
      }
      var prev_index = index - 1;
      if (prev_index < 0) {
        prev_index = 0;
      }
      var next_index = index + 1;
      if (next_index > EFFECTS.FILTERS_LIST.length - 1) {
        next_index = EFFECTS.FILTERS_LIST.length - 1;
      }
      html += '<span style="float:right;">';
      html += '<input id="previous_filter" type="button" value="&lt;"> ';
      html += '<select id="effect_browser">';
      html += '<option class="trn" value="">--- Select effect ---</option>';
      for (var i = 0; i < EFFECTS.FILTERS_LIST.length; i++) {
        var selected = '';
        if (EFFECTS.FILTERS_LIST[i].name == GUI.last_menu)
          var selected = 'selected';
        html += ' <option ' + selected + ' value="' + i + '">' + EFFECTS.FILTERS_LIST[i].title + '</option>';
      }
      html += '</select>';
      html += ' <input id="next_filter" onclick="" type="button" value="&gt;"> ';
      html += '</span>';
    }
    html += '<h2 id="popup_drag" class="trn">' + title + '</h2>';

    //preview area
    if (this.preview !== false && this.preview_in_main == false) {
      html += '<div style="margin-top:15px;margin-bottom:15px;">';
      html += '<canvas style="position:relative;float:left;margin-right:5px;border:1px solid #393939;" width="' + POP.width_mini + '" height="' + POP.height_mini + '" id="pop_pre"></canvas>';
      html += '<canvas style="position:relative;border:1px solid #393939;background-color:#ffffff;" width="' + POP.width_mini + '" height="' + POP.height_mini + '" id="pop_post"></canvas>';
      html += '</div>';
    }

    //settings
    html += '<table style="width:99%;">';
    for (var i in parameters) {
      var parameter = parameters[i];

      html += '<tr id="popup-tr-' + parameters[i].name + '">';
      if (title != 'Error')
        html += '<td style="font-weight:bold;padding-right:3px;width:130px;" class="trn">' + parameter.title + '</td>';
      if (parameter.name != undefined) {
        if (parameter.values != undefined) {
          var onchange = '';
          if (parameter.onchange != undefined)
            onchange = ' onchange="' + parameter.onchange + ';" ';
          if (parameter.values.length > 10 || parameter.type == 'select') {
            //drop down
            if (onchange == '' && preview_handler != undefined)
              onchange = ' onchange="POP.view();" ';
            html += '<td colspan="2"><select ' + onchange + ' style="font-size:12px;" id="pop_data_' + parameter.name + '">';
            var k = 0;
            for (var j in parameter.values) {
              var sel = '';
              if (parameter.value == parameter.values[j])
                sel = 'selected="selected"';
              if (parameter.value == undefined && k == 0)
                sel = 'selected="selected"';
              html += '<option ' + sel + ' name="' + parameter.values[j] + '">' + parameter.values[j] + '</option>';
              k++;
            }
            html += '</select></td>';
          } else {
            //radio
            html += '<td colspan="2">';
            if (parameter.values.length > 2)
              html += '<div class="group">';
            var k = 0;
            for (var j in parameter.values) {
              var ch = '';
              if (parameter.value == parameter.values[j])
                ch = 'checked="checked"';
              if (parameter.value == undefined && k == 0)
                ch = 'checked="checked"';
              if (onchange == '' && preview_handler != undefined)
                onchange = ' onchange="POP.view();" ';
              html += '<input type="radio" ' + onchange + ' ' + ch + ' name="' + parameter.name + '" id="pop_data_' + parameter.name + "_poptmp" + j + '" value="' + parameter.values[j] + '">';
              html += '<label style="margin-right:20px;" class="trn" for="pop_data_' + parameter.name + "_poptmp" + j + '">' + parameter.values[j] + '</label>';
              if (parameter.values.length > 2)
                html += '<br />';
              k++;
            }
            if (parameter.values.length > 2)
              html += '</div>';
            html += '</td>';
          }
        } else if (parameter.value != undefined) {
          //input, range, textarea, color
          var step = 1;
          if (parameter.step != undefined)
            step = parameter.step;
          if (parameter.range != undefined) {
            //range
            var preview_code = '';
            if (this.preview !== false)
              preview_code = 'POP.view();';
            html += '<td><input type="range" id="pop_data_' + parameter.name + '" value="' + parameter.value + '" min="' + parameter.range[0] + '" max="' + parameter.range[1] + '" step="' + step + '" " oninput="document.getElementById(\'pv' + i + '\').innerHTML=Math.round(this.value*100)/100;' + preview_code + '" /></td>';
            html += '<td style="padding-left:10px;width:50px;" id="pv' + i + '">' + parameter.value + '</td>';
          } else if (parameter.type == 'color') {
            //color
            var preview_code = '';
            if (this.preview !== false)
              preview_code = 'POP.view();';
            html += '<td><input type="color" id="pop_data_' + parameter.name + '" value="' + parameter.value + '" onchange="' + preview_code + '" /></td>';
          } else {
            //input or textarea
            if (parameter.placeholder == undefined)
              parameter.placeholder = '';
            if (parameter.type == 'textarea') {
              html += '<td><textarea style="height:80px;" id="pop_data_' + parameter.name + '" placeholder="' + parameter.placeholder + '">' + parameter.value + '</textarea></td>';
            } else {
              var input_type = "text";
              if (parameter.placeholder != undefined && parameter.placeholder != '' && !isNaN(parameter.placeholder))
                input_type = 'number';
              if (parameter.value != undefined && typeof parameter.value == 'number')
                input_type = 'number';

              html += '<td colspan="2"><input type="' + input_type + '" id="pop_data_' + parameter.name + '" value="' + parameter.value + '" placeholder="' + parameter.placeholder + '" onkeyup="POP.validate(this);" /></td>';
            }
          }
        }
      } else if (parameter.function != undefined) {
        //custom function
        var result;
        if (typeof parameter.function == 'string')
          result = window[parameter.function]();
        else
          result = parameter.function();
        html += '<td colspan="3">' + result + '</td>';
      } else if (parameter.html != undefined) {
        //html
        html += '<td style="padding-bottom:3px;padding-top:3px;" colspan="2">' + parameter.html + '</td>';
      } else {
        //locked fields without name
        str = "" + parameter.value;
        var id_tmp = parameter.title.toLowerCase().replace(/[^\w]+/g, '').replace(/ +/g, '-');
        id_tmp = id_tmp.substring(0, 10);
        if (str.length < 40)
          html += '<td colspan="2"><div class="trn" id="pop_data_' + id_tmp + '" style="padding: 2px 0px;">' + parameter.value + '</div></td>';
        else
          html += '<td style="font-size:11px;" colspan="2"><textarea disabled="disabled">' + parameter.value + '</textarea></td>';
      }
      html += '</tr>';
    }
    html += '</table>';

    //action buttons
    html += '<div style="text-align:center;margin-top:20px;margin-bottom:15px;">';
    html += '<button onclick="POP.save();" class="button trn">Ok</button>';
    html += '<button onclick="POP.hide();" class="button trn">Cancel</button>';
    if (this.preview_in_main !== false)
      html += '<button onclick="POP.view();" class="button trn">Preview</button>';
    html += '</div>';

    document.getElementById("popup").innerHTML = html;
    document.getElementById("popup").style.display = "block";
    if (parameters.length > 15)
      document.getElementById("popup").style.overflowY = "scroll";
    else
      document.getElementById("popup").style.overflowY = 'hidden';

    //onload
    if (this.onload != '') {
      if (typeof this.onload == "string")
        window[this.onload]();
      else
        this.onload();
    }

    //some events for effects browser
    if (this.effects == true) {
      document.getElementById('previous_filter').disabled = false;
      document.getElementById('next_filter').disabled = false;
      if (index == 0) {
        document.getElementById('previous_filter').disabled = true;
      }
      if (index == EFFECTS.FILTERS_LIST.length - 1) {
        document.getElementById('next_filter').disabled = true;
      }
      //previous
      document.getElementById('previous_filter').addEventListener('click', function (event) {
        POP.hide();
        GUI.last_menu = EFFECTS.FILTERS_LIST[prev_index].name;
        call_menu(EFFECTS, EFFECTS.FILTERS_LIST[prev_index].name);
      });
      //next
      document.getElementById('next_filter').addEventListener('click', function (event) {
        POP.hide();
        GUI.last_menu = EFFECTS.FILTERS_LIST[next_index].name;
        call_menu(EFFECTS, EFFECTS.FILTERS_LIST[next_index].name);
      });
      //onchange
      var effect_browser = document.getElementById('effect_browser');
      effect_browser.addEventListener('change', function (event) {
        var value = effect_browser.options[effect_browser.selectedIndex].value;
        POP.hide();
        GUI.last_menu = EFFECTS.FILTERS_LIST[value].name;
        call_menu(EFFECTS, EFFECTS.FILTERS_LIST[value].name);
      });
    }

    //load preview?
    if (this.preview !== false && this.preview_in_main == false) {
      //original
      var pop_pre = document.getElementById("pop_pre").getContext("2d");
      pop_pre.rect(0, 0, POP.width_mini, POP.height_mini);
      pop_pre.fillStyle = "#ffffff";
      pop_pre.fill();
      GUI.draw_background(pop_pre, POP.width_mini, POP.height_mini, 5);
      pop_pre.drawImage(document.getElementById(LAYER.layers[LAYER.layer_active].name), 0, 0, POP.width_mini, POP.height_mini);

      //copy
      pop_post = document.getElementById("pop_post").getContext("2d");
      pop_post.rect(0, 0, POP.width_mini, POP.height_mini);
      pop_post.fillStyle = "#ffffff";
      pop_post.fill();
      GUI.draw_background(pop_post, POP.width_mini, POP.height_mini, 5);
      pop_post.drawImage(document.getElementById(LAYER.layers[LAYER.layer_active].name), 0, 0, POP.width_mini, POP.height_mini);

      //prepare temp canvas
      layer_active_small.width = POP.width_mini;
      layer_active_small.height = POP.height_mini;
      layer_active_small_ctx.drawImage(document.getElementById(LAYER.layers[LAYER.layer_active].name), 0, 0, POP.width_mini, POP.height_mini);
      POP.view();
    }

    //call translation again to translate popup
    HELP.help_translate(LANG);
  };

  //hide popup
  this.hide = function () {
    document.getElementById('popup').style.display = 'none';
    parameters = [];
    this.handler = '';
    this.active = false;
    this.preview = false;
    this.onload = false;
    this.preview_in_main = false;
    this.effects = false;
    canvas_front.clearRect(0, 0, WIDTH, HEIGHT);
  };

  //renders preview. If input=range supported, is called on every param update - must be fast...
  this.view = function () {
    if (this.preview !== false) {
      if (this.preview_in_main == false) {
        //reset mini view
        pop_post.clearRect(0, 0, POP.width_mini, POP.height_mini);
        pop_post.drawImage(layer_active_small, 0, 0);
      }

      //prepare
      var response = {};
      inputs = document.getElementsByTagName('input');
      for (i = 0; i < inputs.length; i++) {
        if (inputs[i].id.substr(0, 9) == 'pop_data_') {
          var key = inputs[i].id.substr(9);
          if (HELPER.strpos(key, "_poptmp") != false)
            key = key.substring(0, HELPER.strpos(key, "_poptmp"));
          var value = inputs[i].value;
          if (inputs[i].type == 'radio') {
            if (inputs[i].checked == true)
              response[key] = value;
          } else
            response[key] = value;
        }
      }
      selects = document.getElementsByTagName('select');
      for (i = 0; i < selects.length; i++) {
        if (selects[i].id.substr(0, 9) == 'pop_data_') {
          var key = selects[i].id.substr(9);
          var value = selects[i].value;
          response[key] = value;
        }
      }
      textareas = document.getElementsByTagName('textarea');
      for (i = 0; i < textareas.length; i++) {
        if (textareas[i].id.substr(0, 9) == 'pop_data_') {
          var key = textareas[i].id.substr(9);
          var value = textareas[i].value;
          response[key] = value;
        }
      }

      //call handler
      if (this.preview_in_main == false)
        this.preview(response, pop_post, POP.width_mini, POP.height_mini);
      else
        this.preview(response);
    }
  };

  //OK pressed - prepare data and call handlers
  this.save = function () {
    this.active = false;
    document.getElementById("popup").style.display = "none";
    var response = {};
    inputs = document.getElementsByTagName('input');
    for (i = 0; i < inputs.length; i++) {
      if (inputs[i].id.substr(0, 9) == 'pop_data_') {
        var key = inputs[i].id.substr(9);
        if (HELPER.strpos(key, "_poptmp") != false)
          key = key.substring(0, HELPER.strpos(key, "_poptmp"));
        var value = inputs[i].value;
        if (inputs[i].type == 'radio') {
          if (inputs[i].checked == true)
            response[key] = value;
        } else
          response[key] = value;

      }
    }
    selects = document.getElementsByTagName('select');
    for (i = 0; i < selects.length; i++) {
      if (selects[i].id.substr(0, 9) == 'pop_data_') {
        var key = selects[i].id.substr(9);
        var value = selects[i].value;
        response[key] = value;
      }
    }
    textareas = document.getElementsByTagName('textarea');
    for (i = 0; i < textareas.length; i++) {
      if (textareas[i].id.substr(0, 9) == 'pop_data_') {
        var key = textareas[i].id.substr(9);
        var value = textareas[i].value;
        response[key] = value;
      }
    }
    parameters = [];
    this.preview = false;
    this.onload = false;
    this.preview_in_main = false;
    this.effects = false;
    if (this.handler != '') {
      if (typeof this.handler == "object")
        this.handler[0][this.handler[1]](response);
      else if (typeof this.handler == "function")
        this.handler(response);
      else
        console.log('error: wrong function type: ' + this.handler);
    }
    this.handler = '';
  };

  //validate input field, unless browser supports input=range
  this.validate = function (field) {
    for (var i in parameters) {
      var parameter = parameters[i];
      if ("pop_data_" + parameter.name == field.id && parameter.range != undefined) {
        if (field.value == '-' || field.value == '')
          return true;

        var value = parseFloat(field.value);
        if (isNaN(value) || value != field.value)
          field.value = parameter.value;	//not number
        if (value < parameter.range[0])
          field.value = parameter.range[0];	//less then min
        else if (value > parameter.range[1])
          field.value = parameter.range[1];	//more then max
      }
    }
  };
}

var dict_es = {
  "2d": {"es": "2d"},
  "3D position:": {"es": "Posición 3d:"},
  "3D size:": {"es": "3d tamaño:"},
  "About": {"es": "Acerca de"},
  "Add new layer": {"es": "Añadir nueva capa"},
  "All": {"es": "Todas"},
  "Alpha": {"es": "Alfa"},
  "Alpha:": {"es": "Alfa:"},
  "Amount:": {"es": "Cantidad:"},
  "Anonymous": {"es": "Anónimo"},
  "Anti aliasing": {"es": "Submuestreo"},
  "Area:": {"es": "Zona:"},
  "Arial": {"es": "Arial"},
  "Arrow": {"es": "Flecha"},
  "Arrow keys": {"es": "Teclas de flecha"},
  "Attributes": {"es": "Atributos"},
  "Author:": {"es": "Autor:"},
  "Auto adjust colors": {"es": "Ajuste automático de colores"},
  "Auto colorize": {"es": "Colorear auto"},
  "Average:": {"es": "Promedio:"},
  "BMP - Windows Bitmap": {"es": "Bmp - ventanas de mapa de bits"},
  "Background": {"es": "Fondo"},
  "Basic": {"es": "Basic"},
  "BezierCurve": {"es": "Curva de bézier"},
  "Big grains level:": {"es": "Granos grandes de nivel:"},
  "Black and White": {"es": "En blanco y negro"},
  "Blend": {"es": "Mezcla"},
  "Blend:": {"es": "Mezcla:"},
  "Blue": {"es": "Azul"},
  "Blue channel:": {"es": "Canal azul:"},
  "Blur": {"es": "Difuminar"},
  "Blur Radius:": {"es": "Radio de desenfoque:"},
  "Blur tool": {"es": "Herramienta de desenfoque"},
  "Blur-Box": {"es": "Falta de definición de la caja"},
  "Blur-Gaussian": {"es": "Desenfoque gaussiano"},
  "Blur-Stack": {"es": "Blur-pila"},
  "Blur-Zoom": {"es": "Blur-zoom"},
  "Blur:": {"es": "Difuminar:"},
  "Bold": {"es": "Negrita"},
  "Bold Italic": {"es": "Negrita cursiva"},
  "Borders": {"es": "Fronteras"},
  "Both": {"es": "Ambos"},
  "Bottom-left": {"es": "Abajo a la izquierda"},
  "Bottom-right": {"es": "Abajo a la derecha"},
  "Brightness Contrast": {"es": "Contraste de brillo"},
  "Brightness:": {"es": "Brillo:"},
  "Brush": {"es": "Cepillo"},
  "Brush styles": {"es": "Estilos de pincel"},
  "Bulge/Pinch": {"es": "Abultamiento / pizca"},
  "Burn": {"es": "Quemar"},
  "Burn/Dodge tool": {"es": "Burn herramienta / esquivar"},
  "CTRL + Arrow keys": {"es": "Ctrl + teclas de flecha"},
  "Cancel": {"es": "Cancelar"},
  "Center x:": {"es": "Centro de x:"},
  "Center y:": {"es": "Centro y:"},
  "Center:": {"es": "Centrar:"},
  "Channel:": {"es": "Canal:"},
  "Chrome": {"es": "Cromo"},
  "Circle": {"es": "Circulo"},
  "Clear": {"es": "Claro"},
  "Clear selection": {"es": "Selección clara"},
  "Clone tool": {"es": "Herramienta de clonación"},
  "Color #1:": {"es": "Color # 1:"},
  "Color #2:": {"es": "Color # 2:"},
  "Color Zoom": {"es": "Zoom de color"},
  "Color adjust:": {"es": "Ajuste de color:"},
  "Color corrections": {"es": "Correcciones de color"},
  "Color to Alpha": {"es": "Color a alfa"},
  "Color to alpha": {"es": "Color a alfa"},
  "Color:": {"es": "Color:"},
  "Colorize": {"es": "Colorear"},
  "Colors:": {"es": "Colores:"},
  "Composite": {"es": "Compuesto"},
  "Composition:": {"es": "Composición:"},
  "Contrast:": {"es": "Contraste:"},
  "Copy selection": {"es": "Selección de copia"},
  "Courier": {"es": "Mensajero"},
  "Crop": {"es": "Cultivo"},
  "Crop Selection": {"es": "Selección de cultivos"},
  "Curve": {"es": "Curva"},
  "Cut selection": {"es": "Cortar la selección"},
  "Decrease color depth": {"es": "Disminuir la profundidad de color"},
  "Decrease colors": {"es": "Disminuir los colores"},
  "Default": {"es": "Defecto"},
  "Del": {"es": "Del"},
  "Delete": {"es": "Borrar"},
  "Delete selection": {"es": "Eliminar la selección"},
  "Denoise": {"es": "Eliminación de ruido"},
  "Desaturate": {"es": "Desaturar"},
  "Desaturation:": {"es": "Desaturación:"},
  "Description:": {"es": "Descripción:"},
  "Differences": {"es": "Diferencias"},
  "Differences Down": {"es": "Diferencias abajo"},
  "Dither": {"es": "Vacilar"},
  "Dithering:": {"es": "Difuminado:"},
  "Dot Screen": {"es": "Trama de puntos"},
  "Down": {"es": "Abajo"},
  "Downloaded": {"es": "Descargado"},
  "Drag & Drop": {"es": "Arrastrar y soltar"},
  "Draw circle": {"es": "Dibujar círculo"},
  "Draw letters": {"es": "Dibujar letras"},
  "Draw line": {"es": "Dibujar linea"},
  "Draw rectangle": {"es": "Dibujar rectángulo"},
  "Dublicate": {"es": "Dublicate"},
  "Dusts level:": {"es": "Los polvos nivel:"},
  "Edge": {"es": "Borde"},
  "Edit": {"es": "Editar"},
  "Effects": {"es": "Efectos"},
  "Effects library": {"es": "Librería de efectos"},
  "Email:": {"es": "Email:"},
  "Emboss": {"es": "Realzar"},
  "Empty data": {"es": "De datos vacía"},
  "English": {"es": "Inglés"},
  "Enrich": {"es": "Enriquecer"},
  "Enter angle (0-360):": {"es": "Introduzca el ángulo (0-360):"},
  "Erase": {"es": "Borrar"},
  "Error": {"es": "Error"},
  "Error, can not find active layer.": {"es": "Error, no se puede encontrar capa activa."},
  "Error:": {"es": "Error:"},
  "Exponent:": {"es": "Exponente:"},
  "Exposure level:": {"es": "Nivel de exposición:"},
  "Factor:": {"es": "Factor:"},
  "File": {"es": "Archivo"},
  "File name:": {"es": "Nombre del archivo:"},
  "Fill": {"es": "Llenar"},
  "Fill style:": {"es": "Estilo de relleno:"},
  "Flatten Image": {"es": "Imagen aplanada"},
  "Flip": {"es": "Dar la vuelta"},
  "Font family:": {"es": "Familia tipográfica:"},
  "Font style:": {"es": "Estilo de fuente:"},
  "Fur": {"es": "Pelaje"},
  "Gamma": {"es": "Gama"},
  "Gamma:": {"es": "Gama:"},
  "Gap:": {"es": "Brecha:"},
  "Gradient": {"es": "Gradiente"},
  "Gradient Radius:": {"es": "Radio de gradiente:"},
  "Grains": {"es": "Granos"},
  "Grains level:": {"es": "Granos nivel:"},
  "Gray": {"es": "Gris"},
  "GrayScale": {"es": "Escala de grises"},
  "Green": {"es": "Verde"},
  "Green channel:": {"es": "Canal verde:"},
  "Greyscale:": {"es": "Escala de grises:"},
  "Grid": {"es": "Cuadrícula"},
  "Grid on/off": {"es": "Rejilla de encendido / apagado"},
  "Grouped": {"es": "Agrupados"},
  "H Radius:": {"es": "Radio h:"},
  "HSL Adjustment": {"es": "Ajuste de hsl"},
  "Harmony": {"es": "Armonía"},
  "Heatmap": {"es": "Mapa de calor"},
  "Height (%):": {"es": "Altura (%):"},
  "Height (pixels):": {"es": "Altura (píxeles):"},
  "Height:": {"es": "Altura:"},
  "Help": {"es": "Ayuda"},
  "Helvetica": {"es": "Helvetica"},
  "Hermite": {"es": "Hermite"},
  "Histogram": {"es": "Histograma"},
  "Histogram:": {"es": "Histograma:"},
  "Horizontal": {"es": "Horizontal"},
  "Horizontal gap:": {"es": "Brecha horizontal:"},
  "Hue:": {"es": "Matiz:"},
  "Image": {"es": "Imagen"},
  "Image filters": {"es": "Filtros de imagen"},
  "Impact": {"es": "Impacto"},
  "Imports images": {"es": "Importa imágenes"},
  "Information": {"es": "Información"},
  "Invalid color component": {"es": "Componente de color no válido"},
  "Italic": {"es": "Itálico"},
  "JPG - JPG/JPEG Format": {"es": "Jpg - formato jpg / jpeg"},
  "JPG Compression": {"es": "Compresión jpg"},
  "JSON - Full layers data": {"es": "Json - capas de datos completos"},
  "KD-tree": {"es": "Kd-tree"},
  "Key-points": {"es": "Puntos clave"},
  "Keyboard Shortcuts": {"es": "Atajos de teclado"},
  "Language": {"es": "Idioma"},
  "Layer": {"es": "Capa"},
  "Layer #": {"es": "La capa #"},
  "Layers": {"es": "Capas"},
  "Left": {"es": "Izquierda"},
  "Level:": {"es": "Nivel:"},
  "Levels:": {"es": "Niveles:"},
  "Lietuvių": {"es": "Lietuvių"},
  "Light leak:": {"es": "Fuga de luz:"},
  "Limit:": {"es": "Límite:"},
  "Luminance:": {"es": "Luminancia:"},
  "Luminosity:": {"es": "Luminosidad:"},
  "Magic Wand Tool": {"es": "Varita mágica"},
  "Merge": {"es": "Unir"},
  "Merge Down": {"es": "Fusionar"},
  "Mode:": {"es": "Modo:"},
  "Mosaic": {"es": "Mosaico"},
  "Mouse:": {"es": "Ratón:"},
  "Move": {"es": "Movimiento"},
  "Move active layer by 10px": {"es": "Mover la capa activa de 10px"},
  "Move active layer by 1px": {"es": "Mover la capa activa de 1px"},
  "Move active layer by 50px": {"es": "Mover la capa activa de 50 px"},
  "Move down": {"es": "Mover hacia abajo"},
  "Move up": {"es": "Ascender"},
  "Multi-line": {"es": "Multilínea"},
  "Name:": {"es": "Nombre:"},
  "Negative": {"es": "Negativo"},
  "New": {"es": "Nuevo"},
  "New file...": {"es": "Archivo nuevo..."},
  "New layer": {"es": "Nueva capa"},
  "No": {"es": "No"},
  "Normal": {"es": "Normal"},
  "Notice": {"es": "Darse cuenta"},
  "Notice:": {"es": "Darse cuenta:"},
  "Oil": {"es": "Petróleo"},
  "Ok": {"es": "De acuerdo"},
  "Online image editor": {"es": "Editor de imágenes en línea"},
  "Opacity": {"es": "Opacidad"},
  "Open": {"es": "Abierto"},
  "Open file(s)": {"es": "Abrir archivos)"},
  "PNG - Portable Network Graphics": {"es": "Png - portable network graphics"},
  "Paste": {"es": "Pegar"},
  "Paste selection": {"es": "La selección de pasta"},
  "Pencil": {"es": "Lápiz"},
  "Perspective": {"es": "Perspectiva"},
  "Pick Color": {"es": "Color de la selección"},
  "Posterize": {"es": "Posterizar"},
  "Power:": {"es": "Poder:"},
  "Pre-Blur:": {"es": "Pre-desenfoque:"},
  "Preview": {"es": "Avance"},
  "Print": {"es": "Impresión"},
  "Quality (jpeg):": {"es": "Calidad (jpeg):"},
  "Quality:": {"es": "Calidad:"},
  "Radial": {"es": "Radial"},
  "Radius:": {"es": "Radio:"},
  "Range:": {"es": "Distancia:"},
  "Reason:": {"es": "Razón:"},
  "Recover alpha": {"es": "Recuperar alfa"},
  "Red": {"es": "Rojo"},
  "Red channel:": {"es": "Canal rojo:"},
  "Resample - Hermite": {"es": "Volver a muestrear - hermite"},
  "Resize": {"es": "Cambiar el tamaño"},
  "Restore alpha": {"es": "Restaurar alfa"},
  "Right": {"es": "Derecha"},
  "Rotate": {"es": "Girar"},
  "Rotate left": {"es": "Girar a la izquierda"},
  "Rotation": {"es": "Rotación"},
  "SHIFT + Arrow keys": {"es": "Teclas shift + flecha"},
  "Saturation:": {"es": "Saturación:"},
  "Save": {"es": "Salvar"},
  "Save as": {"es": "Guardar como"},
  "Save as type:": {"es": "Guardar como tipo:"},
  "Save layers:": {"es": "Guardar capas:"},
  "Select all": {"es": "Seleccionar todo"},
  "Select area first": {"es": "Elija un área de primera"},
  "Select area tool": {"es": "Seleccionar herramienta de área"},
  "Select color": {"es": "Seleccionar el color"},
  "Select object tool": {"es": "Herramienta de selección de objetos"},
  "Selected": {"es": "Seleccionado"},
  "Sensitivity:": {"es": "Sensibilidad:"},
  "Sepia": {"es": "Sepia"},
  "Shaded": {"es": "Sombreada"},
  "Shadow blur:": {"es": "Sombra desenfoque:"},
  "Shadow color:": {"es": "Color de la sombra:"},
  "Shadow:": {"es": "Sombra:"},
  "Sharpen": {"es": "Afilar"},
  "Sharpen tool": {"es": "Afilar herramientas"},
  "Sharpen:": {"es": "Afilar:"},
  "Show / Hide": {"es": "Mostrar ocultar"},
  "Simple": {"es": "Sencillo"},
  "Size": {"es": "Tamaño"},
  "Size:": {"es": "Tamaño:"},
  "Sketchy": {"es": "Incompleto"},
  "Solarize": {"es": "Solarize"},
  "Sorry": {"es": "Lo siento"},
  "Source is empty, right click on image first.": {"es": "Fuente está vacía, haga clic derecho en la imagen primero."},
  "Source:": {"es": "Fuente:"},
  "Sprites": {"es": "Sprites"},
  "Square": {"es": "Cuadrado"},
  "Strength:": {"es": "Fuerza:"},
  "Strict": {"es": "Estricto"},
  "Stroke": {"es": "Carrera"},
  "Stroke size:": {"es": "El tamaño del trazo:"},
  "Text": {"es": "Texto"},
  "Text:": {"es": "Texto:"},
  "The image could not be loaded.": {"es": "La imagen no se pudo cargar."},
  "This can not be last layer": {"es": "Esto no puede ser la última capa"},
  "This can not be last layer.": {"es": "Esto no puede ser la última capa."},
  "Tilt Shift": {"es": "Cambio de inclinación"},
  "Times New Roman": {"es": "Times new roman"},
  "To paste from clipboard, use Ctrl-V.": {"es": "Para pegar desde el portapapeles, use ctrl-v."},
  "Tools": {"es": "Herramientas"},
  "Top-left": {"es": "Arriba a la izquierda"},
  "Top-right": {"es": "Parte superior derecha"},
  "Total pixels:": {"es": "Píxeles en total:"},
  "Translate error, can not find dictionary:": {"es": "Traducir el error, no puede encontrar el diccionario:"},
  "Transparency #1:": {"es": "Transparencia # 1:"},
  "Transparency #2:": {"es": "Transparencia # 2:"},
  "Transparent:": {"es": "Transparente:"},
  "Trim": {"es": "Recortar"},
  "Trim:": {"es": "Recortar:"},
  "Undo": {"es": "Deshacer"},
  "Unique colors:": {"es": "Colores únicas:"},
  "Up": {"es": "Arriba"},
  "V Radius:": {"es": "Radio de v:"},
  "Verdana": {"es": "Verdana"},
  "Vertical": {"es": "Vertical"},
  "Vertical gap:": {"es": "Espacio vertical:"},
  "Vignette": {"es": "Viñeta"},
  "Vignette amount:": {"es": "Cantidad viñeta:"},
  "Vignette size:": {"es": "Tamaño de viñeta:"},
  "ViliusL": {"es": "Viliusl"},
  "Vintage": {"es": "Vendimia"},
  "Visible:": {"es": "Visible:"},
  "WEBP - Weppy File Format": {"es": "Webp - formato de archivo weppy"},
  "Website": {"es": "Sitio web"},
  "Width (%):": {"es": "Anchura (%):"},
  "Width (pixels):": {"es": "Ancho (píxeles):"},
  "Width:": {"es": "Anchura:"},
  "X end:": {"es": "X final:"},
  "X start:": {"es": "Inicio x:"},
  "Y end:": {"es": "Y final:"},
  "Y start:": {"es": "Y de inicio:"},
  "Yes": {"es": "Sí"},
  "Your browser do not support this format.": {"es": "Su navegador no soporta este formato."},
  "Your browser doesn't support canvas.": {"es": "Su navegador no soporta lienzo."},
  "Zoom": {"es": "Enfocar"},
  "Zoom in": {"es": "Acercarse"},
  "Zoom out": {"es": "Disminuir el zoom"},
  "Zoom:": {"es": "Enfocar:"},
};

var dict_it = {
  "2d": {"it": "2d"},
  "3D position:": {"it": "Posizione 3d:"},
  "3D size:": {"it": "Formato 3d:"},
  "About": {"it": "Di"},
  "Add new layer": {"it": "Aggiungere nuovo livello"},
  "All": {"it": "Tutti"},
  "Alpha": {"it": "Alfa"},
  "Alpha:": {"it": "Alfa:"},
  "Amount:": {"it": "Quantità:"},
  "Anonymous": {"it": "Anonimo"},
  "Anti aliasing": {"it": "Anti aliasing"},
  "Area:": {"it": "La zona:"},
  "Arial": {"it": "Arial"},
  "Arrow": {"it": "Freccia"},
  "Arrow keys": {"it": "Tasti freccia"},
  "Attributes": {"it": "Attributi"},
  "Author:": {"it": "Autore:"},
  "Auto adjust colors": {"it": "Regolazione automatica colori"},
  "Auto colorize": {"it": "Colorare auto"},
  "Average:": {"it": "Media:"},
  "BMP - Windows Bitmap": {"it": "Bmp - windows bitmap"},
  "Background": {"it": "Sfondo"},
  "Basic": {"it": "Di base"},
  "BezierCurve": {"it": "Curva di bézier"},
  "Big grains level:": {"it": "Di livello grani grossi:"},
  "Black and White": {"it": "Bianco e nero"},
  "Blend": {"it": "Miscela"},
  "Blend:": {"it": "Miscela:"},
  "Blue": {"it": "Blu"},
  "Blue channel:": {"it": "Blue channel:"},
  "Blur": {"it": "Blur"},
  "Blur Radius:": {"it": "Raggio di sfocatura:"},
  "Blur tool": {"it": "Strumento blur"},
  "Blur-Box": {"it": "Blur-box"},
  "Blur-Gaussian": {"it": "Blur-gaussiano"},
  "Blur-Stack": {"it": "Blur-stack"},
  "Blur-Zoom": {"it": "Blur-zoom"},
  "Blur:": {"it": "Blur:"},
  "Bold": {"it": "Grassetto"},
  "Bold Italic": {"it": "Italico grassetto"},
  "Borders": {"it": "Frontiere"},
  "Both": {"it": "Entrambi"},
  "Bottom-left": {"it": "In basso a sinistra"},
  "Bottom-right": {"it": "In basso a destra"},
  "Brightness Contrast": {"it": "Contrasto di luminosità"},
  "Brightness:": {"it": "Luminosità:"},
  "Brush": {"it": "Pennello"},
  "Brush styles": {"it": "Stili di pennello"},
  "Bulge/Pinch": {"it": "Bulge / pinch"},
  "Burn": {"it": "Bruciare"},
  "Burn/Dodge tool": {"it": "Masterizzare strumento / dodge"},
  "CTRL + Arrow keys": {"it": "Tasti freccia ctrl +"},
  "Cancel": {"it": "Annulla"},
  "Center x:": {"it": "Centro x:"},
  "Center y:": {"it": "Centro y:"},
  "Center:": {"it": "Centro:"},
  "Channel:": {"it": "Canale:"},
  "Chrome": {"it": "Cromo"},
  "Circle": {"it": "Cerchio"},
  "Clear": {"it": "Pulire"},
  "Clear selection": {"it": "Cancella selezione"},
  "Clone tool": {"it": "Strumento clone"},
  "Color #1:": {"it": "Colore # 1:"},
  "Color #2:": {"it": "Colore # 2:"},
  "Color Zoom": {"it": "Zoom colore"},
  "Color adjust:": {"it": "Regola colore:"},
  "Color corrections": {"it": "Correzioni di colore"},
  "Color to Alpha": {"it": "Colore ad alfa"},
  "Color to alpha": {"it": "Colore ad alfa"},
  "Color:": {"it": "Colore:"},
  "Colorize": {"it": "Colorize"},
  "Colors:": {"it": "Colori:"},
  "Composite": {"it": "Composito"},
  "Composition:": {"it": "Composizione:"},
  "Contrast:": {"it": "Contrasto:"},
  "Copy selection": {"it": "Selezione copy"},
  "Courier": {"it": "Corriere"},
  "Crop": {"it": "Raccolto"},
  "Crop Selection": {"it": "Selezione di ritaglio"},
  "Curve": {"it": "Curva"},
  "Cut selection": {"it": "Selezione cut"},
  "Decrease color depth": {"it": "Diminuire la profondità di colore"},
  "Decrease colors": {"it": "Diminuzione colori"},
  "Default": {"it": "Predefinito"},
  "Del": {"it": "Del"},
  "Delete": {"it": "Cancellare"},
  "Delete selection": {"it": "Elimina la selezione"},
  "Denoise": {"it": "Denoise"},
  "Desaturate": {"it": "Desatura"},
  "Desaturation:": {"it": "Desaturazione:"},
  "Description:": {"it": "Descrizione:"},
  "Differences": {"it": "Differenze"},
  "Differences Down": {"it": "Differenze giù"},
  "Dither": {"it": "Agitarsi"},
  "Dithering:": {"it": "Dithering:"},
  "Dot Screen": {"it": "Schermo dot"},
  "Down": {"it": "Giù"},
  "Downloaded": {"it": "Scaricati"},
  "Drag & Drop": {"it": "Drag & drop"},
  "Draw circle": {"it": "Disegna cerchio"},
  "Draw letters": {"it": "Disegnare le lettere"},
  "Draw line": {"it": "Draw line"},
  "Draw rectangle": {"it": "Disegna rettangolo"},
  "Dublicate": {"it": "Dublicate"},
  "Dusts level:": {"it": "Polveri di livello:"},
  "Edge": {"it": "Bordo"},
  "Edit": {"it": "Modifica"},
  "Effects": {"it": "Effetti"},
  "Effects library": {"it": "Libreria di effetti"},
  "Email:": {"it": "E-mail:"},
  "Emboss": {"it": "Rilievo"},
  "Empty data": {"it": "Dati vuota"},
  "English": {"it": "Inglese"},
  "Enrich": {"it": "Arricchire"},
  "Enter angle (0-360):": {"it": "Digitare l'angolo (0-360):"},
  "Erase": {"it": "Cancellare"},
  "Error": {"it": "Errore"},
  "Error, can not find active layer.": {"it": "Errore, non riesce a trovare livello attivo."},
  "Error:": {"it": "Errore:"},
  "Español": {"it": "Español"},
  "Exponent:": {"it": "Esponente:"},
  "Exposure level:": {"it": "Livello di esposizione:"},
  "Factor:": {"it": "Fattore:"},
  "File": {"it": "File"},
  "File name:": {"it": "Nome del file:"},
  "Fill": {"it": "Riempire"},
  "Fill style:": {"it": "Fill stile:"},
  "Flatten Image": {"it": "Immagine piatta"},
  "Flip": {"it": "Capovolgere"},
  "Font family:": {"it": "Famiglia di font:"},
  "Font style:": {"it": "Stile carattere:"},
  "Fur": {"it": "Pelliccia"},
  "Gamma": {"it": "Gamma"},
  "Gamma:": {"it": "Gamma:"},
  "Gap:": {"it": "Gap:"},
  "Gradient": {"it": "Pendenza"},
  "Gradient Radius:": {"it": "Raggio gradiente:"},
  "Grains": {"it": "Grani"},
  "Grains level:": {"it": "Di livello grains:"},
  "Gray": {"it": "Grigio"},
  "GrayScale": {"it": "Scala di grigi"},
  "Green": {"it": "Verde"},
  "Green channel:": {"it": "Canale verde:"},
  "Greyscale:": {"it": "Scala di grigi:"},
  "Grid": {"it": "Griglia"},
  "Grid on/off": {"it": "Griglia on / off"},
  "Grouped": {"it": "Raggruppate"},
  "H Radius:": {"it": "Raggio h:"},
  "HSL Adjustment": {"it": "Regolazione hsl"},
  "Harmony": {"it": "Armonia"},
  "Heatmap": {"it": "Mappa di calore"},
  "Height (%):": {"it": "Altezza (%):"},
  "Height (pixels):": {"it": "Altezza (pixel):"},
  "Height:": {"it": "Altezza:"},
  "Help": {"it": "Aiuto"},
  "Helvetica": {"it": "Helvetica"},
  "Hermite": {"it": "Hermite"},
  "Histogram": {"it": "Istogramma"},
  "Histogram:": {"it": "Istogramma:"},
  "Horizontal": {"it": "Orizzontale"},
  "Horizontal gap:": {"it": "Gap orizzontale:"},
  "Hue:": {"it": "Hue:"},
  "Image": {"it": "Immagine"},
  "Image filters": {"it": "Filtri per le immagini"},
  "Impact": {"it": "Urto"},
  "Imports images": {"it": "Immagini importazioni"},
  "Information": {"it": "Informazioni"},
  "Invalid color component": {"it": "Componente di colore non valido"},
  "Italic": {"it": "Corsivo"},
  "JPG - JPG/JPEG Format": {"it": "Jpg - jpg / jpeg"},
  "JPG Compression": {"it": "Compressione jpg"},
  "JSON - Full layers data": {"it": "Json - strati pieni di dati"},
  "KD-tree": {"it": "Kd-albero"},
  "Key-points": {"it": "Punti chiave"},
  "Keyboard Shortcuts": {"it": "Tasti rapidi"},
  "Language": {"it": "Lingua"},
  "Layer": {"it": "Strato"},
  "Layer #": {"it": "Strato #"},
  "Layers": {"it": "Livelli"},
  "Left": {"it": "Sinistra"},
  "Level:": {"it": "Livello:"},
  "Levels:": {"it": "Livelli:"},
  "Lietuvių": {"it": "Lietuvių"},
  "Light leak:": {"it": "Perdita di luce:"},
  "Limit:": {"it": "Limite:"},
  "Luminance:": {"it": "Luminance:"},
  "Luminosity:": {"it": "Luminosità:"},
  "Magic Wand Tool": {"it": "Strumento bacchetta magica"},
  "Merge": {"it": "Fondere"},
  "Merge Down": {"it": "Fondere"},
  "Mode:": {"it": "Modalità:"},
  "Mosaic": {"it": "Mosaico"},
  "Mouse:": {"it": "Topo:"},
  "Move": {"it": "Mossa"},
  "Move active layer by 10px": {"it": "Spostare strato attivo da 10px"},
  "Move active layer by 1px": {"it": "Spostare strato attivo da 1px"},
  "Move active layer by 50px": {"it": "Spostare strato attivo da 50px"},
  "Move down": {"it": "Abbassati"},
  "Move up": {"it": "Rimontare"},
  "Multi-line": {"it": "Multi-line"},
  "Name:": {"it": "Nome:"},
  "Negative": {"it": "Negativo"},
  "New": {"it": "Nuovo"},
  "New file...": {"it": "Nuovo file..."},
  "New layer": {"it": "Nuovo livello"},
  "No": {"it": "No"},
  "Normal": {"it": "Normale"},
  "Notice": {"it": "Avviso"},
  "Notice:": {"it": "Avviso:"},
  "Oil": {"it": "Olio"},
  "Ok": {"it": "Ok"},
  "Online image editor": {"it": "Editor di immagini online"},
  "Opacity": {"it": "Opacità"},
  "Open": {"it": "Aperto"},
  "Open file(s)": {"it": "Aprire il file (s)"},
  "PNG - Portable Network Graphics": {"it": "Png - portable network graphics"},
  "Paste": {"it": "Incolla"},
  "Paste selection": {"it": "Selezione incolla"},
  "Pencil": {"it": "Matita"},
  "Perspective": {"it": "Prospettiva"},
  "Pick Color": {"it": "Scegli il colore"},
  "Posterize": {"it": "Posterizzare"},
  "Power:": {"it": "Energia:"},
  "Pre-Blur:": {"it": "Pre-sfocatura:"},
  "Preview": {"it": "Anteprima"},
  "Print": {"it": "Stampare"},
  "Quality (jpeg):": {"it": "Qualità (jpeg):"},
  "Quality:": {"it": "Qualità:"},
  "Radial": {"it": "Radiale"},
  "Radius:": {"it": "Raggio:"},
  "Range:": {"it": "Gamma:"},
  "Reason:": {"it": "Ragionare:"},
  "Recover alpha": {"it": "Recuperare alpha"},
  "Red": {"it": "Rosso"},
  "Red channel:": {"it": "Canale rosso:"},
  "Resample - Hermite": {"it": "Resample - hermite"},
  "Resize": {"it": "Ridimensiona"},
  "Restore alpha": {"it": "Ripristinare alpha"},
  "Right": {"it": "Destra"},
  "Rotate": {"it": "Ruotare"},
  "Rotate left": {"it": "Gira a sinistra"},
  "Rotation": {"it": "Rotazione"},
  "SHIFT + Arrow keys": {"it": "Tasti shift + freccia"},
  "Saturation:": {"it": "Saturazione:"},
  "Save": {"it": "Salvare"},
  "Save as": {"it": "Salva come"},
  "Save as type:": {"it": "Salva come tipo:"},
  "Save layers:": {"it": "Salva strati:"},
  "Select all": {"it": "Seleziona tutto"},
  "Select area first": {"it": "Seleziona l'area prima"},
  "Select area tool": {"it": "Selezionare lo strumento zona"},
  "Select color": {"it": "Scegli il colore"},
  "Select object tool": {"it": "Selezionare lo strumento oggetto"},
  "Selected": {"it": "Selezionato"},
  "Sensitivity:": {"it": "Sensibilità:"},
  "Sepia": {"it": "Nero di seppia"},
  "Shaded": {"it": "Ombroso"},
  "Shadow blur:": {"it": "Ombra sfocatura:"},
  "Shadow color:": {"it": "Colore dell'ombra:"},
  "Shadow:": {"it": "Ombra:"},
  "Sharpen": {"it": "Affilare"},
  "Sharpen tool": {"it": "Contrasta strumento"},
  "Sharpen:": {"it": "Affilare:"},
  "Show / Hide": {"it": "Mostra nascondi"},
  "Simple": {"it": "Semplice"},
  "Size": {"it": "Dimensione"},
  "Size:": {"it": "Dimensione:"},
  "Sketchy": {"it": "Abbozzato"},
  "Solarize": {"it": "Solarizzare"},
  "Sorry": {"it": "Scusate"},
  "Source is empty, right click on image first.": {"it": "Source è vuoto, fate clic destro sull'immagine prima."},
  "Source:": {"it": "Fonte:"},
  "Sprites": {"it": "Sprites"},
  "Square": {"it": "Piazza"},
  "Strength:": {"it": "Forza:"},
  "Strict": {"it": "Rigoroso"},
  "Stroke": {"it": "Ictus"},
  "Stroke size:": {"it": "Dimensioni corsa:"},
  "Text": {"it": "Testo"},
  "Text:": {"it": "Testo:"},
  "The image could not be loaded.": {"it": "L'immagine non può essere caricato."},
  "This can not be last layer": {"it": "Questo non può essere ultimo strato"},
  "This can not be last layer.": {"it": "Questo non può essere ultimo strato."},
  "Tilt Shift": {"it": "Tilt shift"},
  "Times New Roman": {"it": "Times new roman"},
  "To paste from clipboard, use Ctrl-V.": {"it": "Per incollare dagli appunti, utilizzare ctrl-v."},
  "Tools": {"it": "Utensili"},
  "Top-left": {"it": "A sinistra in alto"},
  "Top-right": {"it": "In alto a destra"},
  "Total pixels:": {"it": "Pixel totali:"},
  "Translate error, can not find dictionary:": {"it": "Tradurre errore, non riesce a trovare dizionario:"},
  "Transparency #1:": {"it": "Trasparenza # 1:"},
  "Transparency #2:": {"it": "Trasparenza # 2:"},
  "Transparent:": {"it": "Trasparente:"},
  "Trim": {"it": "Tagliare"},
  "Trim:": {"it": "Trim:"},
  "Undo": {"it": "Disfare"},
  "Unique colors:": {"it": "Colori unici:"},
  "Up": {"it": "Su"},
  "V Radius:": {"it": "Raggio v:"},
  "Verdana": {"it": "Verdana"},
  "Vertical": {"it": "Verticale"},
  "Vertical gap:": {"it": "Gap verticale:"},
  "Vignette": {"it": "Vignette"},
  "Vignette amount:": {"it": "Importo vignette:"},
  "Vignette size:": {"it": "Dimensioni vignette:"},
  "ViliusL": {"it": "Viliusl"},
  "Vintage": {"it": "Annata"},
  "Visible:": {"it": "Visibile:"},
  "WEBP - Weppy File Format": {"it": "Webp - formato di file weppy"},
  "Website": {"it": "Sito web"},
  "Width (%):": {"it": "Larghezza (%):"},
  "Width (pixels):": {"it": "Larghezza (pixel):"},
  "Width:": {"it": "Larghezza:"},
  "X end:": {"it": "X fine:"},
  "X start:": {"it": "X inizio:"},
  "Y end:": {"it": "Fine y:"},
  "Y start:": {"it": "Y inizio:"},
  "Yes": {"it": "Sì"},
  "Your browser do not support this format.": {"it": "Il tuo browser non supporta questo formato."},
  "Your browser doesn't support canvas.": {"it": "Il tuo browser non supporta tela."},
  "Zoom": {"it": "Ingrandimento"},
  "Zoom in": {"it": "Ingrandire"},
  "Zoom out": {"it": "Zoom indietro"},
  "Zoom:": {"it": "Ingrandimento:"},
};

var dict_lt = {
  "2d": {"lt": "2d"},
  "3D position:": {"lt": "3d vieta:"},
  "3D size:": {"lt": "3d dydis:"},
  "About": {"lt": "Apie"},
  "Add new layer": {"lt": "Naujas sluoksnis"},
  "All": {"lt": "Visi"},
  "Alpha": {"lt": "Alfa"},
  "Alpha:": {"lt": "Alfa:"},
  "Amount:": {"lt": "Kiekis:"},
  "Anonymous": {"lt": "Anoniminis"},
  "Anti aliasing": {"lt": "Sulieti"},
  "Area:": {"lt": "Plotas:"},
  "Arial": {"lt": "Arial"},
  "Arrow": {"lt": "Rodyklė"},
  "Arrow keys": {"lt": "Rodyklių klavišai"},
  "Attributes": {"lt": "Atributai"},
  "Author:": {"lt": "Autorius:"},
  "Auto adjust colors": {"lt": "Automatinis spalvų reguliavimas"},
  "Auto colorize": {"lt": "Spalvinimas"},
  "Average:": {"lt": "Vidurkis:"},
  "BMP - Windows Bitmap": {"lt": "BMP - Windows Bitmap"},
  "Background": {"lt": "Fonas"},
  "Basic": {"lt": "Paprastas"},
  "BezierCurve": {"lt": "Bezjė kreivė"},
  "Big grains level:": {"lt": "Didelio grūdėtumo lygis:"},
  "Black and White": {"lt": "Juoda ir balta"},
  "Blend": {"lt": "Mišinys"},
  "Blend:": {"lt": "Mišinys:"},
  "Blue": {"lt": "Mėlynas"},
  "Blue channel:": {"lt": "Mėlyna kanalas:"},
  "Blur": {"lt": "Migla"},
  "Blur Radius:": {"lt": "Migla-spindulys:"},
  "Blur tool": {"lt": "Migla-įrankis"},
  "Blur-Box": {"lt": "Migla-dėžė"},
  "Blur-Gaussian": {"lt": "Migla-Gaussian"},
  "Blur-Stack": {"lt": "Migla-daugybė"},
  "Blur-Zoom": {"lt": "Migla-priartinimas"},
  "Blur:": {"lt": "Migla:"},
  "Bold": {"lt": "Drąsus"},
  "Bold Italic": {"lt": "Bold italic"},
  "Borders": {"lt": "Kraštai"},
  "Both": {"lt": "Abu"},
  "Bottom-left": {"lt": "Apatiniame kairiajame"},
  "Bottom-right": {"lt": "Apatiniame dešiniajame"},
  "Brightness Contrast": {"lt": "Ryškumas kontrastas"},
  "Brightness:": {"lt": "Ryškumas:"},
  "Brush": {"lt": "Šepetys"},
  "Brush styles": {"lt": "šepečių stilius"},
  "Bulge/Pinch": {"lt": "Išpūtimas/Sutraukimas"},
  "Burn": {"lt": "Deginti"},
  "Burn/Dodge tool": {"lt": "Burn / dodge nuorodą"},
  "CTRL + Arrow keys": {"lt": "Ctrl + rodyklių klavišus"},
  "Cancel": {"lt": "Atšaukti"},
  "Center x:": {"lt": "Centras x:"},
  "Center y:": {"lt": "Centras y:"},
  "Center:": {"lt": "Centras:"},
  "Channel:": {"lt": "Kanalas:"},
  "Chrome": {"lt": "Chromas"},
  "Circle": {"lt": "Ratas"},
  "Clear": {"lt": "Išvalyti"},
  "Clear selection": {"lt": "Atšaukti pažymėtą sritį"},
  "Clone tool": {"lt": "Klonas įrankis"},
  "Color #1:": {"lt": "Spalva # 1:"},
  "Color #2:": {"lt": "Spalva # 2:"},
  "Color Zoom": {"lt": "Spalvų analizė"},
  "Color adjust:": {"lt": "Spalva reguliuoti:"},
  "Color corrections": {"lt": "Spalvų korekcijos"},
  "Color to Alpha": {"lt": "Spalva alfa"},
  "Color to alpha": {"lt": "Keisti spalvos permatomumą"},
  "Color:": {"lt": "Spalva:"},
  "Colorize": {"lt": "Spalvinimas"},
  "Colors:": {"lt": "Spalvos:"},
  "Composite": {"lt": "Sudėtinis"},
  "Composition:": {"lt": "Sudėtis:"},
  "Contrast:": {"lt": "Kontrastas:"},
  "Copy selection": {"lt": "Kopijuoti pasirinkimas"},
  "Courier": {"lt": "Kurjeris"},
  "Crop": {"lt": "Apkarpyti"},
  "Crop Selection": {"lt": "Apkarpyti pasirinkimą"},
  "Curve": {"lt": "Kreivė"},
  "Cut selection": {"lt": "Iškirpti pasirinkimas"},
  "Decrease color depth": {"lt": "Sumažinti spalvų gylį"},
  "Decrease colors": {"lt": "Sumažinti spalvos"},
  "Default": {"lt": "Numatytas"},
  "Del": {"lt": "Trinti"},
  "Delete": {"lt": "Panaikinti"},
  "Delete selection": {"lt": "Ištrinti pasirinkimą"},
  "Denoise": {"lt": "Triukšmo šalinimas"},
  "Desaturate": {"lt": "Mažiau sodrumo"},
  "Desaturation:": {"lt": "Mažiau sodrumo:"},
  "Description:": {"lt": "Aprašymas:"},
  "Differences": {"lt": "Skirtumai"},
  "Differences Down": {"lt": "Skirtumai žemyn"},
  "Dither": {"lt": "Papildymas"},
  "Dithering:": {"lt": "Papildymu:"},
  "Dot Screen": {"lt": "Taškų ekranas"},
  "Down": {"lt": "žemyn"},
  "Downloaded": {"lt": "Parsiūstas"},
  "Downloading...": {"lt": "Atsisiunčiama..."},
  "Drag & Drop": {"lt": "Nutempti & paleisti"},
  "Draw circle": {"lt": "Piešti apskritimą"},
  "Draw letters": {"lt": "Piešti raides"},
  "Draw line": {"lt": "Piešti liniją"},
  "Draw rectangle": {"lt": "Piešti stačiakampį"},
  "Dublicate": {"lt": "Dauginti"},
  "Dusts level:": {"lt": "Dulkių lygis:"},
  "Edge": {"lt": "Kraštas"},
  "Edit": {"lt": "Redaguoti"},
  "Effects": {"lt": "Efektai"},
  "Effects library": {"lt": "Efektų biblioteka"},
  "Email:": {"lt": "E-Paštas:"},
  "Emboss": {"lt": "Įspausti"},
  "Empty data": {"lt": "Nėra duomenų"},
  "English": {"lt": "English"},
  "Enrich": {"lt": "Praturtinti"},
  "Enter angle (0-360):": {"lt": "įveskite kampą (0-360):"},
  "Erase": {"lt": "Ištrinti"},
  "Error": {"lt": "Klaida"},
  "Error, can not find active layer.": {"lt": "Klaida, negalima rasti aktyvaus sluoksnio."},
  "Error:": {"lt": "Klaida:"},
  "Exponent:": {"lt": "Eksponentė:"},
  "Exposure level:": {"lt": "Ekspozicijos lygis:"},
  "Factor:": {"lt": "Veiksnys:"},
  "File": {"lt": "Byla"},
  "File name:": {"lt": "Failo vardas:"},
  "Fill": {"lt": "Pildyti"},
  "Fill style:": {"lt": "Užpildykite stilius:"},
  "Flatten Image": {"lt": "Sujungti sluoksnius"},
  "Flip": {"lt": "Apversti"},
  "Font family:": {"lt": "Šrifto šeima:"},
  "Font style:": {"lt": "Šrifto stilius:"},
  "Format": {"lt": "Formatas"},
  "Fur": {"lt": "Kailis"},
  "Gamma": {"lt": "Šviesumas"},
  "Gamma:": {"lt": "Šviesumas:"},
  "Gap:": {"lt": "Tarpas:"},
  "Gradient": {"lt": "Gradientas"},
  "Gradient Radius:": {"lt": "Gradientas spindulys:"},
  "Grains": {"lt": "Grūdėtumas"},
  "Grains level:": {"lt": "Grūdėtumo lygis:"},
  "Gray": {"lt": "Pilkas"},
  "GrayScale": {"lt": "Pilkai"},
  "Green": {"lt": "Žalias"},
  "Green channel:": {"lt": "Žalioji kanalas:"},
  "Greyscale:": {"lt": "Pilkieji pustoniai:"},
  "Grid": {"lt": "Tinklelis"},
  "Grid on/off": {"lt": "Tinklelis įjungtas/išjungtas"},
  "Grouped": {"lt": "Grupuoti"},
  "H Radius:": {"lt": "Horizontalus spindulys:"},
  "HSL Adjustment": {"lt": "HSL reguliavimas"},
  "Harmony": {"lt": "Harmonija"},
  "Heatmap": {"lt": "Spalvinė diagrama"},
  "Height (%):": {"lt": "Aukštis (%):"},
  "Height (pixels):": {"lt": "Aukštis (taškai):"},
  "Height:": {"lt": "Aukštis:"},
  "Help": {"lt": "Pagalba"},
  "Helvetica": {"lt": "Helvetica"},
  "Hermite": {"lt": "Hermite"},
  "Histogram": {"lt": "Histograma"},
  "Histogram:": {"lt": "Histograma:"},
  "Horizontal": {"lt": "Horizontalus"},
  "Horizontal gap:": {"lt": "Horizontali tarpas:"},
  "Hue:": {"lt": "Atspalvis:"},
  "Image": {"lt": "Vaizdas"},
  "Image filters": {"lt": "Vaizdo filtrai"},
  "Impact": {"lt": "Poveikis"},
  "Imports images": {"lt": "Importas vaizdai"},
  "Information": {"lt": "Informacija"},
  "Invalid color component": {"lt": "Neteisingas spalva komponentas"},
  "Italic": {"lt": "Italic"},
  "JPG - JPG/JPEG Format": {"lt": "JPG - jpg / jpeg formatas"},
  "JPG Compression": {"lt": "Jpg suspaudimas"},
  "JSON - Full layers data": {"lt": "JSON - visi sluoksnių duomenys"},
  "KD-tree": {"lt": "KD-medis"},
  "Key-points": {"lt": "Pagrindiniai taškai"},
  "Keyboard Shortcuts": {"lt": "Klaviatūros nuorodos"},
  "Language": {"lt": "Kalba"},
  "Layer": {"lt": "Sluoksnis"},
  "Layer #": {"lt": "Sluoksnio #"},
  "Layers": {"lt": "Sluoksniai"},
  "Left": {"lt": "Į kairę"},
  "Level:": {"lt": "Lygis:"},
  "Levels:": {"lt": "Lygiais:"},
  "Lietuvių": {"lt": "Lietuvių"},
  "Light leak:": {"lt": "šviesos nuotėkio:"},
  "Limit:": {"lt": "Riba:"},
  "Luminosity:": {"lt": "Šviesumas:"},
  "Luminance:": {"lt": "Apšvietimo lygis:"},
  "Magic Wand Tool": {"lt": "Stebuklinga lazdelė"},
  "Merge": {"lt": "Susijungti"},
  "Merge Down": {"lt": "Sujungti žemyn"},
  "Mode:": {"lt": "Režimas:"},
  "Mosaic": {"lt": "Mozaika"},
  "Mouse:": {"lt": "Pelė:"},
  "Move": {"lt": "Perkelti"},
  "Move active layer by 10px": {"lt": "Perkelti aktyvų sluoksnį per 10px"},
  "Move active layer by 1px": {"lt": "Perkelti aktyvų sluoksnį per 1px"},
  "Move active layer by 50px": {"lt": "Perkelti aktyvų sluoksnį per 50px"},
  "Move down": {"lt": "Perkelti žemyn"},
  "Move up": {"lt": "Perkelti"},
  "Multi-line": {"lt": "Kelių eilučių"},
  "Name:": {"lt": "Vardas:"},
  "Negative": {"lt": "Neigiamas"},
  "New": {"lt": "Nauja"},
  "New file...": {"lt": "Naujas failas..."},
  "New layer": {"lt": "Nauja sluoksnis"},
  "No": {"lt": "Ne"},
  "Normal": {"lt": "Normalus"},
  "Notice": {"lt": "Pastebėti"},
  "Notice:": {"lt": "Pastebėti:"},
  "Oil": {"lt": "Aliejus"},
  "Ok": {"lt": "Gerai"},
  "Online image editor": {"lt": "Internetinis grafinis redaktorius"},
  "Opacity": {"lt": "Nepermatomumas"},
  "Open": {"lt": "Atidaryti"},
  "Open file(s)": {"lt": "Atidaryti failą(us)"},
  "PNG - Portable Network Graphics": {"lt": "PNG - Portable Network Graphics"},
  "Paste": {"lt": "Įkelti"},
  "Paste selection": {"lt": "Nukopijuokite pasirinkimas"},
  "Pencil": {"lt": "Pieštukas"},
  "Perspective": {"lt": "Perspektyva"},
  "Pick Color": {"lt": "Pasirinkite spalvą"},
  "Posterize": {"lt": "Mažinti spalvas"},
  "Power:": {"lt": "Galia:"},
  "Pre-Blur:": {"lt": "Išankstinis išliejimas:"},
  "Preview": {"lt": "Peržiūrėti"},
  "Print": {"lt": "Spausdinti"},
  "Quality (jpeg):": {"lt": "Kokybė (jpeg):"},
  "Quality:": {"lt": "Kokybė:"},
  "Radial": {"lt": "Radialinis"},
  "Radius:": {"lt": "Spindulys:"},
  "Range:": {"lt": "Kategorijos:"},
  "Reason:": {"lt": "Priežastis:"},
  "Recover alpha": {"lt": "Atkurti nepermatomumą"},
  "Red": {"lt": "Raudonas"},
  "Red channel:": {"lt": "Raudonasis kanalas:"},
  "Resample - Hermite": {"lt": "Pažangus-Hermite"},
  "Resize": {"lt": "Keisti dydį"},
  "Restore alpha": {"lt": "Atkurti alfa"},
  "Right": {"lt": "Į dešinę"},
  "Rotate": {"lt": "Sukti"},
  "Rotate left": {"lt": "Pasukti į kairę"},
  "Rotation": {"lt": "Rotacija"},
  "SHIFT + Arrow keys": {"lt": "Shift + rodyklių klavišas"},
  "Saturation:": {"lt": "Spalvingumas:"},
  "Save": {"lt": "Išsaugoti"},
  "Save as": {"lt": "Išsaugoti kaip"},
  "Save as type:": {"lt": "Failo tipas:"},
  "Save layers:": {"lt": "Išsaugoti sluoksnius:"},
  "Select all": {"lt": "Pažymėti viską"},
  "Select area first": {"lt": "Pasirinkite plotas pirmas"},
  "Select area tool": {"lt": "Pasirinkite plotas įrankis"},
  "Select color": {"lt": "Pasirinkite spalvą"},
  "Select object tool": {"lt": "Pasirinkite objektas įrankis"},
  "Selected": {"lt": "Pasirinkti"},
  "Sensitivity:": {"lt": "Jautrumas:"},
  "Sepia": {"lt": "Sepija"},
  "Shaded": {"lt": "Tamsioje"},
  "Shadow blur:": {"lt": "Šešėlių blur:"},
  "Shadow color:": {"lt": "Šešėlių spalva:"},
  "Shadow:": {"lt": "Šešėlis:"},
  "Sharpen": {"lt": "Pagaląsti"},
  "Sharpen tool": {"lt": "Paryškinti nuorodą"},
  "Sharpen:": {"lt": "Paryškinti:"},
  "Show / Hide": {"lt": "Rodyti/slėpti"},
  "Simple": {"lt": "Paprastas"},
  "Size": {"lt": "Dydis"},
  "Size:": {"lt": "Dydis:"},
  "Sketchy": {"lt": "Paviršutiniškas"},
  "Solarize": {"lt": "Saulės poveikis"},
  "Sorry": {"lt": "Atsiprašome"},
  "Source is empty, right click on image first.": {"lt": "šaltinis yra tuščias, dešiniuoju pelės mygtuku spustelėkite ant nuotraukos."},
  "Source:": {"lt": "Kodas:"},
  "Sprites": {"lt": "Sprites"},
  "Square": {"lt": "Kvadratas"},
  "Strength:": {"lt": "Jėga:"},
  "Strict": {"lt": "Griežtas"},
  "Stroke": {"lt": "Brūkšnys"},
  "Stroke size:": {"lt": "Brūkšnio dydis:"},
  "Text": {"lt": "Tekstas"},
  "Text:": {"lt": "Tekstas:"},
  "The image could not be loaded.": {"lt": "Vaizdas negali būti įkeltas."},
  "This can not be last layer": {"lt": "Tai gali būti ne paskutinis sluoksnis"},
  "This can not be last layer.": {"lt": "Tai gali būti ne paskutinis sluoksnis."},
  "Tilt Shift": {"lt": "Tentinis perėjimas"},
  "Times New Roman": {"lt": "Times new roman"},
  "To paste from clipboard, use Ctrl-V.": {"lt": "Norėdami įklijuoti iš mainų srities, naudokite ctrl-v."},
  "Tools": {"lt": "Įrankiai"},
  "Top-left": {"lt": "Viršutiniame kairiajame"},
  "Top-right": {"lt": "Viršutiniame dešiniajame"},
  "Total pixels:": {"lt": "Iš viso taškų:"},
  "Translate error, can not find dictionary:": {"lt": "Versti klaidą, negali rasti žodyną:"},
  "Transparency #1:": {"lt": "Permatomumas # 1:"},
  "Transparency #2:": {"lt": "Permatomumas # 2:"},
  "Transparent:": {"lt": "Permatomumas:"},
  "Trim": {"lt": "Apkarpyti"},
  "Trim:": {"lt": "Apkarpyti:"},
  "Undo": {"lt": "Anuliuoti"},
  "Unique colors:": {"lt": "Unikalios spalvos:"},
  "Up": {"lt": "Aukštyn"},
  "V Radius:": {"lt": "Verticalus spindulys:"},
  "Verdana": {"lt": "Verdana"},
  "Vertical": {"lt": "Vertikalus"},
  "Vertical gap:": {"lt": "Vertikali atotrūkis:"},
  "Vignette": {"lt": "Vinjetė"},
  "Vignette amount:": {"lt": "Vinjetė suma:"},
  "Vignette size:": {"lt": "Vinjetė dydis:"},
  "ViliusL": {"lt": "Viliusl"},
  "Vintage": {"lt": "Senoviškas"},
  "Visible:": {"lt": "Matomas:"},
  "WEBP - Weppy File Format": {"lt": "WEBP - Weppy File Format"},
  "Website": {"lt": "Internetinė svetainė"},
  "Width (%):": {"lt": "Plotis (%):"},
  "Width (pixels):": {"lt": "Plotis (taškai):"},
  "Width:": {"lt": "Plotis:"},
  "X end:": {"lt": "X pabaiga:"},
  "X start:": {"lt": "X pradžia:"},
  "Y end:": {"lt": "Y pabaiga:"},
  "Y start:": {"lt": "Y pradžia:"},
  "Yes": {"lt": "Taip"},
  "Your browser do not support this format.": {"lt": "Jūsų naršyklė nepalaiko šito formato."},
  "Your browser doesn't support canvas.": {"lt": "Jūsų naršyklė nepalaiko naujausių technologijų."},
  "Zoom": {"lt": "Padidinti"},
  "Zoom in": {"lt": "Priartinti"},
  "Zoom out": {"lt": "Nutolinti"},
  "Zoom:": {"lt": "Priartinimas:"},
};

var dict_zh = {
  "2d": {"zh": "2d"},
  "3D position:": {"zh": "三维位置："},
  "3D size:": {"zh": "三维尺寸："},
  "About": {"zh": "关于"},
  "Add new layer": {"zh": "添加新图层"},
  "All": {"zh": "所有"},
  "Alpha": {"zh": "α"},
  "Alpha:": {"zh": "α："},
  "Amount:": {"zh": "量："},
  "Anonymous": {"zh": "匿名"},
  "Anti aliasing": {"zh": "反走样"},
  "Area:": {"zh": "区："},
  "Arial": {"zh": "宋体"},
  "Arrow": {"zh": "箭头"},
  "Arrow keys": {"zh": "方向键"},
  "Attributes": {"zh": "属性"},
  "Author:": {"zh": "作者："},
  "Auto adjust colors": {"zh": "自动调整颜色"},
  "Auto colorize": {"zh": "汽车着色"},
  "Average:": {"zh": "平均："},
  "BMP - Windows Bitmap": {"zh": "Bmp - windows位图"},
  "Background": {"zh": "背景"},
  "Basic": {"zh": "基本"},
  "BezierCurve": {"zh": "贝兹曲线"},
  "Big grains level:": {"zh": "大粒级："},
  "Black and White": {"zh": "黑与白"},
  "Blend": {"zh": "混合"},
  "Blend:": {"zh": "混合："},
  "Blue": {"zh": "蓝色"},
  "Blue channel:": {"zh": "蓝色通道："},
  "Blur": {"zh": "模糊"},
  "Blur Radius:": {"zh": "模糊半径："},
  "Blur tool": {"zh": "模糊工具"},
  "Blur-Box": {"zh": "模糊箱"},
  "Blur-Gaussian": {"zh": "模糊 - 高斯"},
  "Blur-Stack": {"zh": "模糊堆栈"},
  "Blur-Zoom": {"zh": "模糊变焦"},
  "Blur:": {"zh": "模糊："},
  "Bold": {"zh": "胆大"},
  "Bold Italic": {"zh": "加粗斜体"},
  "Borders": {"zh": "国界"},
  "Both": {"zh": "都"},
  "Bottom-left": {"zh": "左下方"},
  "Bottom-right": {"zh": "右下角"},
  "Brightness Contrast": {"zh": "亮度对比"},
  "Brightness:": {"zh": "亮度："},
  "Brush": {"zh": "刷"},
  "Brush styles": {"zh": "刷风格"},
  "Bulge/Pinch": {"zh": "隆起/捏"},
  "Burn": {"zh": "烧伤"},
  "Burn/Dodge tool": {"zh": "刻录/减淡工具"},
  "CTRL + Arrow keys": {"zh": "按ctrl +箭头键"},
  "Cancel": {"zh": "取消"},
  "Center x:": {"zh": "中心x："},
  "Center y:": {"zh": "中心y："},
  "Center:": {"zh": "中央："},
  "Channel:": {"zh": "渠道："},
  "Chinese": {"zh": "中文"},
  "Chrome": {"zh": "铬"},
  "Circle": {"zh": "圈"},
  "Clear": {"zh": "明确"},
  "Clear selection": {"zh": "清除选择"},
  "Clone tool": {"zh": "克隆工具"},
  "Color #1:": {"zh": "颜色＃1："},
  "Color #2:": {"zh": "颜色＃2："},
  "Color Zoom": {"zh": "彩色变焦"},
  "Color adjust:": {"zh": "颜色调整："},
  "Color corrections": {"zh": "色彩校正"},
  "Color to Alpha": {"zh": "颜色阿尔法"},
  "Color to alpha": {"zh": "颜色阿尔法"},
  "Color:": {"zh": "颜色："},
  "Colorize": {"zh": "上色"},
  "Colors:": {"zh": "颜色："},
  "Composite": {"zh": "综合"},
  "Composition:": {"zh": "组成："},
  "Contrast:": {"zh": "对比："},
  "Copy selection": {"zh": "选择复制"},
  "Courier": {"zh": "信使"},
  "Crop": {"zh": "作物"},
  "Crop Selection": {"zh": "作物选择"},
  "Curve": {"zh": "曲线"},
  "Cut selection": {"zh": "剪切选择"},
  "Decrease color depth": {"zh": "减小色深"},
  "Decrease colors": {"zh": "减少颜色"},
  "Default": {"zh": "默认"},
  "Del": {"zh": "德尔"},
  "Delete": {"zh": "删除"},
  "Delete selection": {"zh": "删除选择"},
  "Denoise": {"zh": "降噪"},
  "Desaturate": {"zh": "去色"},
  "Desaturation:": {"zh": "饱和度："},
  "Description:": {"zh": "描述："},
  "Differences": {"zh": "差异"},
  "Differences Down": {"zh": "差异下跌"},
  "Dither": {"zh": "抖动"},
  "Dithering:": {"zh": "抖动："},
  "Dot Screen": {"zh": "点屏幕"},
  "Down": {"zh": "下"},
  "Downloaded": {"zh": "下载"},
  "Drag & Drop": {"zh": "拖放"},
  "Draw circle": {"zh": "绘制圆"},
  "Draw letters": {"zh": "绘制文字"},
  "Draw line": {"zh": "绘制线"},
  "Draw rectangle": {"zh": "绘制矩形"},
  "Dublicate": {"zh": "Dublicate"},
  "Dusts level:": {"zh": "粉尘等级："},
  "Edge": {"zh": "边缘"},
  "Edit": {"zh": "编辑"},
  "Effects": {"zh": "效果"},
  "Effects library": {"zh": "特效库"},
  "Email:": {"zh": "电子邮件："},
  "Emboss": {"zh": "拷花"},
  "Empty data": {"zh": "空数据"},
  "English": {"zh": "英语"},
  "Enrich": {"zh": "丰富"},
  "Enter angle (0-360):": {"zh": "输入角度（0-360）："},
  "Erase": {"zh": "抹去"},
  "Error": {"zh": "错误"},
  "Error, can not find active layer.": {"zh": "错误，找不到有源层。"},
  "Error:": {"zh": "错误："},
  "Exponent:": {"zh": "指数："},
  "Exposure level:": {"zh": "曝光量："},
  "Factor:": {"zh": "因子："},
  "File": {"zh": "文件"},
  "File name:": {"zh": "文件名："},
  "Fill": {"zh": "填"},
  "Fill style:": {"zh": "填充样式："},
  "Flatten Image": {"zh": "拼合图像"},
  "Flip": {"zh": "翻动"},
  "Font family:": {"zh": "字体系列："},
  "Font style:": {"zh": "字体样式："},
  "Fur": {"zh": "毛皮"},
  "Gamma": {"zh": "伽玛"},
  "Gamma:": {"zh": "伽玛："},
  "Gap:": {"zh": "间隙："},
  "Gradient": {"zh": "梯度"},
  "Gradient Radius:": {"zh": "渐变半径："},
  "Grains": {"zh": "谷物"},
  "Grains level:": {"zh": "谷物等级："},
  "Gray": {"zh": "灰色"},
  "GrayScale": {"zh": "灰度"},
  "Green": {"zh": "绿色"},
  "Green channel:": {"zh": "绿色通道："},
  "Greyscale:": {"zh": "灰度："},
  "Grid": {"zh": "格"},
  "Grid on/off": {"zh": "格的开/关"},
  "Grouped": {"zh": "分组"},
  "H Radius:": {"zh": "^ h半径："},
  "HSL Adjustment": {"zh": "Hsl调整"},
  "Harmony": {"zh": "和谐"},
  "Heatmap": {"zh": "热图"},
  "Height (%):": {"zh": "高度（％）："},
  "Height (pixels):": {"zh": "高度（像素）："},
  "Height:": {"zh": "高度："},
  "Help": {"zh": "帮帮我"},
  "Helvetica": {"zh": "黑体"},
  "Hermite": {"zh": "埃尔米特"},
  "Histogram": {"zh": "直方图"},
  "Histogram:": {"zh": "直方图："},
  "Horizontal": {"zh": "横"},
  "Horizontal gap:": {"zh": "水平的差距："},
  "Hue:": {"zh": "色调："},
  "Image": {"zh": "图片"},
  "Image filters": {"zh": "图片过滤器"},
  "Impact": {"zh": "碰撞"},
  "Imports images": {"zh": "进口图片"},
  "Information": {"zh": "信息"},
  "Invalid color component": {"zh": "无效的颜色分量"},
  "Italic": {"zh": "斜体"},
  "JPG - JPG/JPEG Format": {"zh": "Jpg - jpg / jpeg格式"},
  "JPG Compression": {"zh": "Jpg压缩"},
  "JSON - Full layers data": {"zh": "Json - 全层的数据"},
  "KD-tree": {"zh": "Kd树"},
  "Key-points": {"zh": "关键点"},
  "Keyboard Shortcuts": {"zh": "键盘快捷键"},
  "Language": {"zh": "语言"},
  "Layer": {"zh": "层"},
  "Layer #": {"zh": "层＃"},
  "Layers": {"zh": "层"},
  "Left": {"zh": "剩下"},
  "Level:": {"zh": "水平："},
  "Levels:": {"zh": "级别："},
  "Lietuvių": {"zh": "立陶宛ų"},
  "Light leak:": {"zh": "漏光："},
  "Limit:": {"zh": "限制："},
  "Luminance:": {"zh": "亮度："},
  "Luminosity:": {"zh": "亮度："},
  "Magic Wand Tool": {"zh": "魔术棒工具"},
  "Merge": {"zh": "合并"},
  "Merge Down": {"zh": "向下合并"},
  "Mode:": {"zh": "模式："},
  "Mosaic": {"zh": "镶嵌"},
  "Mouse:": {"zh": "老鼠："},
  "Move": {"zh": "移动"},
  "Move active layer by 10px": {"zh": "通过移动积极10px的层"},
  "Move active layer by 1px": {"zh": "由1px的移动有源层"},
  "Move active layer by 50px": {"zh": "移动50像素有源层"},
  "Move down": {"zh": "下移"},
  "Move up": {"zh": "提升"},
  "Multi-line": {"zh": "多线"},
  "Name:": {"zh": "名称："},
  "Negative": {"zh": "负"},
  "New": {"zh": "新"},
  "New file...": {"zh": "新的文件..."},
  "New layer": {"zh": "新建图层"},
  "No": {"zh": "没有"},
  "Normal": {"zh": "正常"},
  "Notice": {"zh": "注意"},
  "Notice:": {"zh": "注意："},
  "Oil": {"zh": "油"},
  "Ok": {"zh": "好"},
  "Online image editor": {"zh": "在线图像编辑器"},
  "Opacity": {"zh": "不透明度"},
  "Open": {"zh": "打开"},
  "Open file(s)": {"zh": "打开文件（s）"},
  "PNG - Portable Network Graphics": {"zh": "Png - 便携式网络图形"},
  "Paste": {"zh": "糊"},
  "Paste selection": {"zh": "粘贴选择"},
  "Pencil": {"zh": "铅笔"},
  "Perspective": {"zh": "透视"},
  "Pick Color": {"zh": "挑选颜色"},
  "Posterize": {"zh": "色调分离"},
  "Power:": {"zh": "功率："},
  "Pre-Blur:": {"zh": "预模糊："},
  "Preview": {"zh": "预习"},
  "Print": {"zh": "打印"},
  "Quality (jpeg):": {"zh": "质量（jpeg）："},
  "Quality:": {"zh": "质量："},
  "Radial": {"zh": "径向"},
  "Radius:": {"zh": "半径："},
  "Range:": {"zh": "范围："},
  "Reason:": {"zh": "原因："},
  "Recover alpha": {"zh": "阿尔法恢复"},
  "Red": {"zh": "红"},
  "Red channel:": {"zh": "红色通道："},
  "Resample - Hermite": {"zh": "重新取样 - 埃尔米特"},
  "Resize": {"zh": "调整"},
  "Restore alpha": {"zh": "恢复阿尔法"},
  "Right": {"zh": "对"},
  "Rotate": {"zh": "旋转"},
  "Rotate left": {"zh": "向左旋转"},
  "Rotation": {"zh": "回转"},
  "SHIFT + Arrow keys": {"zh": "Shift +箭头键"},
  "Saturation:": {"zh": "饱和："},
  "Save": {"zh": "保存"},
  "Save as": {"zh": "另存为"},
  "Save as type:": {"zh": "保存类型："},
  "Save layers:": {"zh": "保存层："},
  "Select all": {"zh": "全选"},
  "Select area first": {"zh": "选择区第一"},
  "Select area tool": {"zh": "选择区域工具"},
  "Select color": {"zh": "选择颜色"},
  "Select object tool": {"zh": "对象选择工具"},
  "Selected": {"zh": "选"},
  "Sensitivity:": {"zh": "灵敏度："},
  "Sepia": {"zh": "乌贼"},
  "Shaded": {"zh": "阴影"},
  "Shadow blur:": {"zh": "阴影模糊："},
  "Shadow color:": {"zh": "阴影颜色："},
  "Shadow:": {"zh": "阴影："},
  "Sharpen": {"zh": "磨"},
  "Sharpen tool": {"zh": "锐化工具"},
  "Sharpen:": {"zh": "锐化："},
  "Show / Hide": {"zh": "显示隐藏"},
  "Simple": {"zh": "简单"},
  "Size": {"zh": "尺寸"},
  "Size:": {"zh": "尺寸："},
  "Sketchy": {"zh": "略"},
  "Solarize": {"zh": "曝光过度"},
  "Sorry": {"zh": "抱歉"},
  "Source is empty, right click on image first.": {"zh": "资料来源是空的，用鼠标右键点击图片第一。"},
  "Source:": {"zh": "资源："},
  "Sprites": {"zh": "精灵"},
  "Square": {"zh": "广场"},
  "Strength:": {"zh": "强度："},
  "Strict": {"zh": "严格"},
  "Stroke": {"zh": "行程"},
  "Stroke size:": {"zh": "笔触大小："},
  "Text": {"zh": "文本"},
  "Text:": {"zh": "文本："},
  "The image could not be loaded.": {"zh": "图像无法加载。"},
  "This can not be last layer": {"zh": "这不可能是最后一层"},
  "This can not be last layer.": {"zh": "这不可能是最后一层。"},
  "Tilt Shift": {"zh": "倾斜移位"},
  "Times New Roman": {"zh": "英语字体格式一种"},
  "To paste from clipboard, use Ctrl-V.": {"zh": "若要从剪贴板粘贴使用ctrl-v。"},
  "Tools": {"zh": "工具"},
  "Top-left": {"zh": "左上角"},
  "Top-right": {"zh": "右上"},
  "Total pixels:": {"zh": "总像素："},
  "Translate error, can not find dictionary:": {"zh": "翻译错误，找不到词典："},
  "Transparency #1:": {"zh": "透明＃1："},
  "Transparency #2:": {"zh": "透明＃2："},
  "Transparent:": {"zh": "透明："},
  "Trim": {"zh": "修剪"},
  "Trim:": {"zh": "修剪："},
  "Undo": {"zh": "解开"},
  "Unique colors:": {"zh": "独特的颜色："},
  "Up": {"zh": "向上"},
  "V Radius:": {"zh": "V半径："},
  "Verdana": {"zh": "宋体"},
  "Vertical": {"zh": "垂直"},
  "Vertical gap:": {"zh": "垂直间隙："},
  "Vignette": {"zh": "小插图"},
  "Vignette amount:": {"zh": "晕影量："},
  "Vignette size:": {"zh": "晕影大小："},
  "ViliusL": {"zh": "Viliusl"},
  "Vintage": {"zh": "酿酒"},
  "Visible:": {"zh": "可见："},
  "WEBP - Weppy File Format": {"zh": "Webp - weppy文件格式"},
  "Website": {"zh": "网站"},
  "Width (%):": {"zh": "宽度（％）："},
  "Width (pixels):": {"zh": "宽度（像素）："},
  "Width:": {"zh": "宽度："},
  "X end:": {"zh": "X最终："},
  "X start:": {"zh": "X起动："},
  "Y end:": {"zh": "Y结尾："},
  "Y start:": {"zh": "是开始："},
  "Yes": {"zh": "是"},
  "Your browser do not support this format.": {"zh": "你的浏览器不支持此格式。"},
  "Your browser doesn't support canvas.": {"zh": "您的浏览器不支持画布。"},
  "Zoom": {"zh": "放大"},
  "Zoom in": {"zh": "放大"},
  "Zoom out": {"zh": "缩小"},
  "Zoom:": {"zh": "放大："},
};

/* global WIDTH, HEIGHT */

var EL = new ELEMENTS_CLASS();

/**
 * class that draw simple elements
 * 
 * @author ViliusL
 */
function ELEMENTS_CLASS() {

  //draw lines
  this.line = function (ctx, from_x, from_y, to_x, to_y, size) {
    ctx.beginPath();
    if (size != undefined)
      ctx.lineWidth = size;
    ctx.moveTo(from_x + 0.5, from_y + 0.5);
    ctx.lineTo(to_x + 0.5, to_y + 0.5);
    ctx.stroke();
  };

  //draws rectangle
  this.rectangle = function (ctx, x, y, width, height, fill, stroke) {
    x = x + 0.5;
    y = y + 0.5;
    if (typeof stroke == "undefined")
      stroke = true;
    if (fill == false && stroke == undefined)
      stroke = true;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y);
    ctx.lineTo(x + width, y + height);
    ctx.quadraticCurveTo(x + width, y + height, x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height);
    ctx.lineTo(x, y);
    ctx.quadraticCurveTo(x, y, x, y);
    ctx.closePath();
    if (stroke) {
      ctx.stroke();
    }
    if (fill) {
      ctx.fill();
    }
  };

  //draws square
  this.square = function (ctx, x, y, width, height, fill, stroke) {
    x = x + 0.5;
    y = y + 0.5;
    if (typeof stroke == "undefined")
      stroke = true;
    if (fill == false && stroke == undefined)
      stroke = true;

    if (Math.abs(width) < Math.abs(height)) {
      if (width > 0)
        width = Math.abs(height);
      else
        width = -Math.abs(height);
    } else {
      if (height > 0)
        height = Math.abs(width);
      else
        height = -Math.abs(width);
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y);
    ctx.lineTo(x + width, y + height);
    ctx.quadraticCurveTo(x + width, y + height, x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height);
    ctx.lineTo(x, y);
    ctx.quadraticCurveTo(x, y, x, y);
    ctx.closePath();
    if (stroke) {
      ctx.stroke();
    }
    if (fill) {
      ctx.fill();
    }
  };

  this.circle = function (ctx, x, y, size, color) {
    ctx.lineWidth = 1;
    if (color != undefined)
      ctx.strokeStyle = color;
    else
      ctx.strokeStyle = "#000000";

    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2, true);
    ctx.stroke();
  };

  this.ellipse_by_center = function (ctx, cx, cy, w, h, color, fill) {
    this.ellipse(ctx, cx - w / 2.0, cy - h / 2.0, w, h, color, fill);
  };

  this.ellipse = function (ctx, x, y, w, h, color, fill) {
    var kappa = .5522848,
            ox = (w / 2) * kappa, // control point offset horizontal
            oy = (h / 2) * kappa, // control point offset vertical
            xe = x + w, // x-end
            ye = y + h, // y-end
            xm = x + w / 2, // x-middle
            ym = y + h / 2; // y-middle

    ctx.beginPath();
    ctx.moveTo(x, ym);
    ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
    ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
    ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
    ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    if (fill == undefined)
      ctx.stroke();
    else
      ctx.fill();
  };

  this.arrow = function (context, fromx, fromy, tox, toy, headlen) {
    if (headlen == undefined)
      headlen = 10;	// length of head in pixels
    var dx = tox - fromx;
    var dy = toy - fromy;
    var angle = Math.atan2(dy, dx);
    context.beginPath();
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.stroke();
    context.beginPath();
    context.moveTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    context.lineTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
    context.stroke();
  };

  //dashed objects
  this.rectangle_dashed = function (canvas, x1, y1, x2, y2, dashLen, color) {
    this.line_dashed(canvas, x1, y1, x2, y1, dashLen, color);
    this.line_dashed(canvas, x2, y1, x2, y2, dashLen, color);
    this.line_dashed(canvas, x2, y2, x1, y2, dashLen, color);
    this.line_dashed(canvas, x1, y2, x1, y1, dashLen, color);
  };

  this.line_dashed = function (canvas, x1, y1, x2, y2, dashLen, color) {
    x1 = x1 + 0.5;
    y1 = y1 + 0.5;
    x2 = x2 + 0.5;
    y2 = y2 + 0.5;
    if (color != undefined)
      canvas.strokeStyle = color;
    else
      canvas.strokeStyle = "#000000";
    if (dashLen == undefined)
      dashLen = 4;
    canvas.beginPath();
    canvas.moveTo(x1, y1);
    var dX = x2 - x1;
    var dY = y2 - y1;
    var dashes = Math.floor(Math.sqrt(dX * dX + dY * dY) / dashLen);
    var dashX = dX / dashes;
    var dashY = dY / dashes;
    var q = 0;
    while (q++ < dashes) {
      x1 += dashX;
      y1 += dashY;
      canvas[q % 2 == 0 ? 'moveTo' : 'lineTo'](x1, y1);
    }
    canvas[q % 2 == 0 ? 'moveTo' : 'lineTo'](x2, y2);
    canvas.stroke();
    canvas.closePath();
  };

  this.image_round = function (canvas, mouse_x, mouse_y, size, img_data, canvas_tmp, anti_aliasing) {
    var size_half = Math.round(size / 2);
    var ctx_tmp = canvas_tmp.getContext("2d");
    var xx = mouse_x - size_half;
    var yy = mouse_y - size_half;
    if (xx < 0)
      xx = 0;
    if (yy < 0)
      yy = 0;

    ctx_tmp.clearRect(0, 0, WIDTH, HEIGHT);
    ctx_tmp.save();
    //draw main data
    try {
      ctx_tmp.drawImage(img_data, mouse_x - size_half, mouse_y - size_half, size, size);
    } catch (err) {
      try {
        ctx_tmp.putImageData(img_data, xx, yy);
      } catch (err) {
        console.log("Error: " + err.message);
      }
    }
    ctx_tmp.globalCompositeOperation = 'destination-in';

    //create form
    ctx_tmp.fillStyle = '#ffffff';
    if (anti_aliasing == true) {
      var gradient = ctx_tmp.createRadialGradient(mouse_x, mouse_y, 0, mouse_x, mouse_y, size_half);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(0.8, '#ffffff');
      gradient.addColorStop(1, 'rgba(25115,255,255,0');
      ctx_tmp.fillStyle = gradient;
    }
    ctx_tmp.beginPath();
    ctx_tmp.arc(mouse_x, mouse_y, size_half, 0, 2 * Math.PI, true);
    ctx_tmp.fill();
    //draw final data
    if (xx + size > WIDTH)
      size = WIDTH - xx;
    if (yy + size > HEIGHT)
      size = HEIGHT - yy;
    canvas.drawImage(canvas_tmp, xx, yy, size, size, xx, yy, size, size);
    //reset
    ctx_tmp.restore();
    ctx_tmp.clearRect(0, 0, WIDTH, HEIGHT);
  };
}

//http://www.script-tutorials.com/html5-canvas-custom-brush1/
var BezierCurveBrush = {
  // inner variables
  iPrevX: 0,
  iPrevY: 0,
  points: null,
  // initialization function
  init: function () {
  },
  startCurve: function (x, y) {
    this.iPrevX = x;
    this.iPrevY = y;
    this.points = new Array();
  },
  getPoint: function (iLength, a) {
    var index = a.length - iLength, i;
    for (i = index; i < a.length; i++) {
      if (a[i]) {
        return a[i];
      }
    }
  },
  draw: function (ctx, color_rgb, x, y, size) {
    if (Math.abs(this.iPrevX - x) > 5 || Math.abs(this.iPrevY - y) > 5) {
      this.points.push([x, y]);

      // draw main path stroke
      ctx.beginPath();
      ctx.moveTo(this.iPrevX, this.iPrevY);
      ctx.lineTo(x, y);

      ctx.lineWidth = size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgba(' + color_rgb.r + ', ' + color_rgb.g + ', ' + color_rgb.b + ', 0.9)';
      ctx.stroke();
      ctx.closePath();

      // draw extra strokes
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(' + color_rgb.r + ', ' + color_rgb.g + ', ' + color_rgb.b + ', 0.2)';
      ctx.beginPath();
      var iStartPoint = this.getPoint(25, this.points);
      var iFirstPoint = this.getPoint(1, this.points);
      var iSecondPoint = this.getPoint(5, this.points);
      ctx.moveTo(iStartPoint[0], iStartPoint[1]);
      ctx.bezierCurveTo(iFirstPoint[0], iFirstPoint[1], iSecondPoint[0], iSecondPoint[1], x, y);
      ctx.stroke();
      ctx.closePath();

      this.iPrevX = x;
      this.iPrevY = y;
    }
  }
};
/* global FILE, EDIT, HELPER, POP, MAIN, EVENTS, LAYER, IMAGE, GUI, DRAW, EL */
/* global canvas_active, canvas_front, WIDTH, HEIGHT, EXIF */

var EVENTS = new EVENTS_CLASS();

//keyboard handlers
document.onkeydown = function (e) {
  return EVENTS.on_keyboard_action(e);
};
document.onkeyup = function (e) {
  return EVENTS.on_keyboardup_action(e);
};
//mouse
window.ondrop = function (e) {
  EVENTS.upload_drop(e);
};		//drop
window.ondragover = function (e) {
  e.preventDefault();
};
window.onresize = function (e) {
  EVENTS.on_resize();
};		//window resize
document.onmousedown = EVENTS.mouse_click;	//mouse click
document.onmousemove = EVENTS.mouse_move;	//mouse move
document.onmouseup = EVENTS.mouse_release;	//mouse resease
document.addEventListener("mousewheel", EVENTS.mouse_wheel_handler, false);	//mouse scroll
document.addEventListener("DOMMouseScroll", EVENTS.mouse_wheel_handler, false);	//mouse scroll
document.oncontextmenu = function (e) {
  return EVENTS.mouse_right_click(e);
};	//mouse right click
document.getElementById('color_hex').onkeyup = function (e) {
  GUI.set_color_manual(e);
};	//on main color type
document.getElementById('color_hex').onpaste = function (e) {
  GUI.set_color_manual(e);
}; // on paste in main color input

//windows touch
document.addEventListener('MSPointerDown', EVENTS.mouse_click, false);
document.addEventListener('MSPointerMove', EVENTS.mouse_move, false);
document.addEventListener('MSPointerUp', EVENTS.mouse_release, false);

//touch and drag
document.addEventListener("touchstart", EVENTS.mouse_click, false);
document.addEventListener("touchend", EVENTS.mouse_release, false);
document.addEventListener("touchmove", EVENTS.mouse_move, false);
//document.addEventListener("touchcancel", handleCancel, false);

/**
 * all events handling
 * 
 * @author ViliusL
 */
function EVENTS_CLASS() {

  /**
   * mouse data, like positions, clicks
   */
  this.mouse = {};

  /**
   * if user is holding ctrl
   */
  this.ctrl_pressed = false;

  /**
   * if user is holding command key
   */
  this.command_pressed = false;

  /**
   * if use is holding shift
   */
  this.shift_pressed = false; //16

  /**
   * if use is draging
   */
  this.isDrag = false;

  /**
   * selected area resize rect. size (controlls, where you can resize area)
   */
  this.sr_size = 8;

  /**
   * if false, font canvas is not cleared on mouse release
   */
  this.clear_front_on_release = true;

  /**
   * if canvas size was not changed - autosize possible
   */
  var autosize = true;

  /**
   * mouse click positions
   */
  var mouse_click_pos = [false, false];

  /**
   * last mouse move position
   */
  var mouse_move_last = [false, false];

  /**
   * main canvas resize action
   */
  var resize_all = false;

  /**
   * if mouse was click on canvas
   */
  var mouse_click_valid = false;

  /**
   * mouse click position of popup drag start
   */
  var last_pop_click = [0, 0];

  /**
   * popup position for dragable ability
   */
  var popup_pos = [0, 0];

  /**
   * if popup is dragged
   */
  var popup_dragable = false;

  //keyboard actions
  this.on_keyboard_action = function (event) {
    k = event.keyCode;	//console.log(k);

    if (k != 27) {
      //we can not touch these events!
      if (POP != undefined && POP.active == true) {
        //dialog active
        return true;
      }
      if (document.activeElement.type == 'text' || document.activeElement.type == 'number') {
        //text input selected
        return true;
      }
    }

    //ctrl
    if (event.ctrlKey == true) {
      EVENTS.ctrl_pressed = true;
    }
    //command
    if (event.metaKey == true) {
      EVENTS.command_pressed = true;
      EVENTS.ctrl_pressed = true;
    }

    //up
    if (k == 38) {
      if (DRAW.active_tool == 'select_tool') {
        EDIT.save_state();
        LAYER.layer_move_active(0, -1);
        GUI.zoom();
        return false;
      }
    }
    //down
    else if (k == 40) {
      if (DRAW.active_tool == 'select_tool') {
        EDIT.save_state();
        LAYER.layer_move_active(0, 1);
        GUI.zoom();
        return false;
      }
    }
    //right
    else if (k == 39) {
      if (DRAW.active_tool == 'select_tool') {
        EDIT.save_state();
        LAYER.layer_move_active(1, 0);
        GUI.zoom();
        return false;
      }
    }
    //left
    else if (k == 37) {
      if (DRAW.active_tool == 'select_tool') {
        EDIT.save_state();
        LAYER.layer_move_active(-1, 0);
        GUI.zoom();
        return false;
      }
    }
    //esc
    else if (k == 27) {
      if (POP != undefined && POP.active == true)
        POP.hide();
      DRAW.last_line = [];

      DRAW.curve_points = [];
      if (DRAW.select_data != false) {
        EDIT.edit_clear();
      }
    }
    //z - undo
    else if (k == 90) {
      //undo
      if (EVENTS.ctrl_pressed == true) {
        EDIT.undo();
      }
    }
    //t - trim
    else if (k == 84) {
      EDIT.save_state();
      IMAGE.trim();
    }
    //o - open
    else if (k == 79) {
      FILE.open();
    }
    //s - save
    else if (k == 83) {
      if (POP != undefined)
        FILE.save_dialog(event);
    }
    //l - rotate left
    else if (k == 76) {
      EDIT.save_state();
      IMAGE.rotate_resize_doc(270, WIDTH, HEIGHT);
      IMAGE.rotate_layer({angle: 270}, canvas_active(), WIDTH, HEIGHT);
    }
    //r - resize
    else if (k == 82)
      IMAGE.resize_box();
    //grid
    else if (k == 71) {
      if (GUI.grid == false)
        GUI.grid = true;
      else
        GUI.grid = false;
      GUI.draw_grid();
    }
    //del
    else if (k == 46) {
      if (DRAW.select_data != false) {
        EDIT.save_state();
        canvas_active().clearRect(DRAW.select_data.x, DRAW.select_data.y, DRAW.select_data.w, DRAW.select_data.h);
        DRAW.select_data = false;
        DRAW.select_square_action = '';
        canvas_front.clearRect(0, 0, WIDTH, HEIGHT);
      }
    }
    //shift
    else if (k == 16) {
      EVENTS.shift_pressed = true;
    }
    //d
    else if (k == 68) {
      call_menu(LAYER, 'layer_dublicate');
    }
    //a
    else if (k == 65) {
      if (EVENTS.ctrl_pressed == true) {
        DRAW.select_data = {
          x: 0,
          y: 0,
          w: WIDTH,
          h: HEIGHT
        };
        GUI.draw_selected_area();
        return false;
      }
    }
    //v
    else if (k == 86) {
      EDIT.save_state();
      if (EVENTS.ctrl_pressed == true)
        EDIT.paste();
    }
    //f - fix images
    else if (k == 70) {
      EDIT.save_state();
      IMAGE.auto_adjust(canvas_active(), WIDTH, HEIGHT);
    }
    //h - histogram	
    else if (k == 72) {
      IMAGE.histogram();
    }
    //minus
    else if (k == 109) {
      GUI.zoom(-1);
    }
    //plus
    else if (k == 107) {
      GUI.zoom(+1);
    }
    //n - new layer
    else if (k == 78)
      LAYER.layer_add();

    GUI.zoom();
    return true;
  };
  //keyboard release
  this.on_keyboardup_action = function (event) {
    k = event.keyCode;
    //shift
    if (k == 16)
      EVENTS.shift_pressed = false;
    //ctrl
    else if (event.ctrlKey == false && EVENTS.ctrl_pressed == true) {
      EVENTS.ctrl_pressed = false;
    }
    //command
    else if (event.metaKey == false && EVENTS.command_pressed == true) {
      EVENTS.command_pressed = false;
      EVENTS.ctrl_pressed = false;
    }
  };
  // mouse_x, mouse_y, event.pageX, event.pageY
  this.get_mouse_position = function (event) {
    if (event.changedTouches) {
      //using touch events
      event = event.changedTouches[0];
    }
    var valid = true;
    var abs_x = event.pageX;
    var abs_y = event.pageY;

    var bodyRect = document.body.getBoundingClientRect();
    var canvas_el = document.getElementById('canvas_front').getBoundingClientRect();
    var canvas_offset_x = canvas_el.left - bodyRect.left;
    var canvas_offset_y = canvas_el.top - bodyRect.top;

    var mouse_x = event.pageX - canvas_offset_x;
    var mouse_y = event.pageY - canvas_offset_y;

    if (event.target.id != "canvas_front") {
      //outside canvas
      valid = false;
    }

    if (event.target.id == "canvas_preview") {
      //in preview area - relative pos
      var canvas_preview_el = document.getElementById('canvas_preview').getBoundingClientRect();
      var canvas_preview_el_x = canvas_preview_el.left - bodyRect.left;
      var canvas_preview_el_y = canvas_preview_el.top - bodyRect.top;

      mouse_x = event.pageX - canvas_preview_el_x;
      mouse_y = event.pageY - canvas_preview_el_y;
    }

    if (event.target.id != "canvas_preview" && GUI.ZOOM != 100) {
      //we are in zoom mode - recalculate
      mouse_x = Math.floor(mouse_x / GUI.ZOOM * 100);
      mouse_y = Math.floor(mouse_y / GUI.ZOOM * 100);
    }

    //save
    EVENTS.mouse = {
      x: mouse_x,
      y: mouse_y,
      click_x: mouse_click_pos[0],
      click_y: mouse_click_pos[1],
      last_x: mouse_move_last[0],
      last_y: mouse_move_last[1],
      valid: valid,
      click_valid: mouse_click_valid,
      abs_x: abs_x,
      abs_y: abs_y,
    };
  };
  //mouse right click
  this.mouse_right_click = function (event) {
    if (POP != undefined && POP.active == true)
      return true;

    EVENTS.get_mouse_position(event);

    if (EVENTS.mouse.x != EVENTS.mouse.click_x && EVENTS.mouse.y != EVENTS.mouse.click_y) {
      //disable long click on mobile
      event.preventDefault();
      event.stopPropagation();
      return false;
    }

    mouse_click_pos[0] = EVENTS.mouse.x;
    mouse_click_pos[1] = EVENTS.mouse.y;

    for (var i in DRAW) {
      if (i == DRAW.active_tool) {
        return DRAW[i]('right_click', EVENTS.mouse, event);
        break;
      }
    }
  };
  //mouse click
  this.mouse_click = function (event) {
    EVENTS.isDrag = true;
    if (POP != undefined && POP.active == true) {
      EVENTS.get_mouse_position(event);
      last_pop_click[0] = EVENTS.mouse.abs_x;
      last_pop_click[1] = EVENTS.mouse.abs_y;
      popup = document.getElementById('popup');
      popup_pos[0] = parseInt(popup.style.top);
      popup_pos[1] = parseInt(popup.style.left);

      if (event.target.id == "popup_drag")
        popup_dragable = true;
      else
        popup_dragable = false;
      return true;
    }

    EVENTS.get_mouse_position(event);
    mouse_click_pos[0] = EVENTS.mouse.x;
    mouse_click_pos[1] = EVENTS.mouse.y;
    if (event.which == 3) {
      return true;
    }
    if (EVENTS.mouse.valid == false)
      mouse_click_valid = false;
    else
      mouse_click_valid = true;

    //check tools functions
    for (var i in DRAW) {
      if (i == DRAW.active_tool) {
        DRAW[i]('click', EVENTS.mouse, event);
        break;
      }
    }

    if (event.target.id == "canvas_preview")
      EVENTS.calc_preview_by_mouse(EVENTS.mouse.x, EVENTS.mouse.y);

    //main window resize
    resize_all = false;
    if (GUI.ZOOM == 100) {
      if (event.target.id == "resize-w")
        resize_all = "w";
      else if (event.target.id == "resize-h")
        resize_all = "h";
      else if (event.target.id == "resize-wh")
        resize_all = "wh";
    }
  };
  //mouse move
  this.mouse_move = function (event) {
    if (POP != undefined && POP.active == true) {
      //drag popup
      if (EVENTS.isDrag == true && popup_dragable == true) {
        EVENTS.get_mouse_position(event);
        popup = document.getElementById('popup');
        popup.style.top = (popup_pos[0] + EVENTS.mouse.abs_y - last_pop_click[1]) + 'px';
        popup.style.left = (popup_pos[1] + EVENTS.mouse.abs_x - last_pop_click[0]) + 'px';
      }
      return true;
    }
    EVENTS.get_mouse_position(event);
    if (event.target.id == "canvas_preview" && EVENTS.isDrag == true)
      EVENTS.calc_preview_by_mouse(EVENTS.mouse.x, EVENTS.mouse.y);
    LAYER.update_info_block();

    //main window resize
    if (GUI.ZOOM == 100) {
      if (event.target.id == "resize-w")
        document.body.style.cursor = "w-resize";
      else if (event.target.id == "resize-h")
        document.body.style.cursor = "n-resize";
      else if (event.target.id == "resize-wh")
        document.body.style.cursor = "nw-resize";
      else
        document.body.style.cursor = "auto";
      if (resize_all != false && EVENTS.isDrag == true) {
        document.body.style.cursor = "auto";
        if (resize_all == "w") {
          new_w = EVENTS.mouse.x;
          new_h = HEIGHT;
        } else if (resize_all == "h") {
          new_w = WIDTH;
          new_h = EVENTS.mouse.y;
        } else if (resize_all == "wh") {
          new_w = EVENTS.mouse.x;
          new_h = EVENTS.mouse.y;
        }
        canvas_front.clearRect(0, 0, WIDTH, HEIGHT);
        canvas_front.lineWidth = 1;
        canvas_front.fillStyle = "#ff0000";
        EL.rectangle_dashed(canvas_front, 0, 0, new_w - 1, new_h - 1);
        event.preventDefault();
        HELPER.remove_selection();
        return false;
      }
    }
    //check tools functions
    if (EVENTS.isDrag === false) {
      for (i in DRAW) {
        if (i == DRAW.active_tool) {
          DRAW[i]('move', EVENTS.mouse, event);
          break;
        }
      }
    }


    if (EVENTS.isDrag === false)
      return false;	//only drag now

    //check tools functions
    for (var i in DRAW) {
      if (i == DRAW.active_tool) {
        DRAW[i]('drag', EVENTS.mouse, event);
        break;
      }
    }

    if (DRAW.active_tool != 'select_square')
      DRAW.select_square_action = '';

    mouse_move_last[0] = EVENTS.mouse.x;
    mouse_move_last[1] = EVENTS.mouse.y;
  };
  //release mouse click
  this.mouse_release = function (event) {
    EVENTS.isDrag = false;
    if (POP != undefined && POP.active == true)
      return true;
    EVENTS.get_mouse_position(event);
    mouse_move_last[0] = false;
    mouse_move_last[1] = false;

    if (DRAW.select_square_action == '' && EVENTS.mouse.valid == true)
      DRAW.select_data = false;

    //check tools functions
    if (EVENTS.clear_front_on_release == true)
      canvas_front.clearRect(0, 0, WIDTH, HEIGHT);
    GUI.draw_selected_area();
    for (var i in DRAW) {
      if (i == DRAW.active_tool) {
        DRAW[i]('release', EVENTS.mouse, event);
        break;
      }
    }

    //main window resize
    if (resize_all != false && GUI.ZOOM == 100 && EVENTS.mouse.x > 0 && EVENTS.mouse.y > 0) {
      EDIT.save_state();
      EVENTS.autosize = false;
      document.body.style.cursor = "auto";
      if (resize_all == "w")
        WIDTH = EVENTS.mouse.x;
      else if (resize_all == "h")
        HEIGHT = EVENTS.mouse.y;
      else if (resize_all == "wh") {
        WIDTH = EVENTS.mouse.x;
        HEIGHT = EVENTS.mouse.y;
      }
      LAYER.set_canvas_size();
      GUI.zoom();
    }
    resize_all = false;
    GUI.zoom();
  };
  //upload drop zone
  this.upload_drop = function (e) {
    e.preventDefault();

    FILE.open_handler(e);
  };
  this.mouse_wheel_handler = function (e) {	//return true;
    e.preventDefault();
    //zoom
    if (EVENTS.ctrl_pressed == true) {
      var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
      if (delta > 0)
        GUI.zoom(+1, true);
      else
        GUI.zoom(-1, true);

      return false;
    }
  };
  this.scroll_window = function () {
    var canvas_wrapper = document.querySelector('#canvas_wrapper');
    var visible_w = canvas_wrapper.clientWidth / GUI.ZOOM * 100;
    var visible_h = canvas_wrapper.clientHeight / GUI.ZOOM * 100;

    if (this.mouse.valid == true) {
      GUI.zoom_center = [this.mouse.x / WIDTH * 100, this.mouse.y / HEIGHT * 100];
    }

    //scroll to - convert center % coordinates to top/left px, and translate to current zoom
    if (this.mouse.valid == true) {
      //using exact position
      xx = (GUI.zoom_center[0] * WIDTH / 100 - visible_w * GUI.zoom_center[0] / 100) * GUI.ZOOM / 100;
      yy = (GUI.zoom_center[1] * HEIGHT / 100 - visible_h * GUI.zoom_center[1] / 100) * GUI.ZOOM / 100;
    } else {
      //using center
      xx = (GUI.zoom_center[0] * WIDTH / 100 - visible_w / 2) * GUI.ZOOM / 100;
      yy = (GUI.zoom_center[1] * HEIGHT / 100 - visible_h / 2) * GUI.ZOOM / 100;
    }

    canvas_wrapper.scrollLeft = xx;
    canvas_wrapper.scrollTop = yy;

  };
  this.calc_preview_by_mouse = function (mouse_x, mouse_y) {
    GUI.zoom_center[0] = mouse_x / GUI.PREVIEW_SIZE.w * 100;
    GUI.zoom_center[1] = mouse_y / GUI.PREVIEW_SIZE.h * 100;

    GUI.zoom(undefined, true);
    return true;
  };
  this.on_resize = function () {
    GUI.redraw_preview();

    //recalc popup position
    var dim = HELPER.get_dimensions();
    popup = document.getElementById('popup');
    popup.style.top = 150 + 'px';
    popup.style.left = Math.round(dim[0] / 2) + 'px';

    document.querySelector('#sidebar_left').classList.remove("active");
    document.querySelector('#sidebar_right').classList.remove("active");
  };
}

function call_menu(class_name, function_name, parameter) {
  //close menu
  var menu = document.querySelector('#main_menu .selected');
  if (menu != undefined) {
    menu.click();
  }
  GUI.last_menu = function_name;

  //exec
  class_name[function_name](parameter);

  GUI.zoom();
}

//=== Clipboard ================================================================

var CLIPBOARD = new CLIPBOARD_CLASS('', false);

/**
 * image pasting into canvas
 * 
 * @param {string} canvas_id - canvas id
 * @param {boolean} autoresize - if canvas will be resized
 */
function CLIPBOARD_CLASS(canvas_id, autoresize) {
  var _self = this;
  if (canvas_id != '') {
    var canvas = document.getElementById(canvas_id);
    var ctx = document.getElementById(canvas_id).getContext("2d");
  }
  var ctrl_pressed = false;
  var command_pressed = false;
  var reading_dom = false;
  var text_top = 15;
  var pasteCatcher;
  var paste_mode;

  //handlers
  document.addEventListener('keydown', function (e) {
    _self.on_keyboard_action(e);
  }, false); //firefox fix
  document.addEventListener('keyup', function (e) {
    _self.on_keyboardup_action(e);
  }, false); //firefox fix
  document.addEventListener('paste', function (e) {
    _self.paste_auto(e);
  }, false); //official paste handler

  //constructor - prepare
  this.init = function () {
    //if using auto
    if (window.Clipboard)
      return true;

    pasteCatcher = document.createElement("div");
    pasteCatcher.setAttribute("id", "paste_ff");
    pasteCatcher.setAttribute("contenteditable", "");
    pasteCatcher.style.cssText = 'opacity:0;position:fixed;top:0px;left:0px;';
    pasteCatcher.style.marginLeft = "-20px";
    pasteCatcher.style.width = "10px";
    document.body.appendChild(pasteCatcher);

    // create an observer instance
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (paste_mode == 'auto' || ctrl_pressed == false || mutation.type != 'childList')
          return true;

        //if paste handle failed - capture pasted object manually
        if (mutation.addedNodes.length == 1) {
          if (mutation.addedNodes[0].src != undefined) {
            //image
            _self.paste_createImage(mutation.addedNodes[0].src);
          }
          //register cleanup after some time.
          setTimeout(function () {
            pasteCatcher.innerHTML = '';
          }, 20);
        }
      });
    });
    var target = document.getElementById('paste_ff');
    var config = {attributes: true, childList: true, characterData: true};
    observer.observe(target, config);
  }();
  //default paste action
  this.paste_auto = function (e) {
    paste_mode = '';
    pasteCatcher.innerHTML = '';
    var plain_text_used = false;
    if (e.clipboardData) {
      var items = e.clipboardData.items;
      if (items) {
        paste_mode = 'auto';
        //access data directly
        for (var i = 0; i < items.length; i++) {
          if (items[i].type.indexOf("image") !== -1) {
            //image
            var blob = items[i].getAsFile();
            var URLObj = window.URL || window.webkitURL;
            var source = URLObj.createObjectURL(blob);
            this.paste_createImage(source);
          }
        }
        e.preventDefault();
      } else {
        //wait for DOMSubtreeModified event
        //https://bugzilla.mozilla.org/show_bug.cgi?id=891247
      }
    }
  };
  //on keyboard press
  this.on_keyboard_action = function (event) {
    if (POP.active == true)
      return true;
    k = event.keyCode;
    //ctrl
    if (k == 17 || event.metaKey || event.ctrlKey) {
      if (ctrl_pressed == false)
        ctrl_pressed = true;
    }
    //v
    if (k == 86) {
      if (document.activeElement != undefined && document.activeElement.type == 'text') {
        //let user paste into some input
        return false;
      }

      if (ctrl_pressed == true && !window.Clipboard)
        pasteCatcher.focus();
    }
  };
  //on kaybord release
  this.on_keyboardup_action = function (event) {
    //ctrl
    if (event.ctrlKey == false && ctrl_pressed == true) {
      ctrl_pressed = false;
    }
    //command
    else if (event.metaKey == false && command_pressed == true) {
      command_pressed = false;
      ctrl_pressed = false;
    }
  };
  //draw image
  this.paste_createImage = function (source) {
    var pastedImage = new Image();
    pastedImage.onload = function () {
      if (canvas_id != '') {
        if (autoresize == true) {
          //resize
          canvas.width = pastedImage.width;
          canvas.height = pastedImage.height;
        } else {
          //clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
      LAYER.layer_add('Paste', source);
    };
    pastedImage.src = source;
  };
}

/* global MAIN, POP, LAYER, EXIF, HELPER, IMAGE, GUI */
/* global SAVE_TYPES */

var FILE = new FILE_CLASS();

/** 
 * manages files actions
 * 
 * @author ViliusL
 */
function FILE_CLASS() {

  /**
   * file info: exif, general data 
   */
  this.file_info = {
    general: [],
    exif: [],
  };

  /**
   * default name used for saving file
   */
  this.SAVE_NAME = 'example';			//default save name

  /**
   * save types config
   */
  this.SAVE_TYPES = [
    "PNG - Portable Network Graphics", //default
    "JPG - JPG/JPEG Format", //autodetect on photos where png useless?
    "JSON - Full layers data", //aka PSD
    "BMP - Windows Bitmap", //firefox only, useless?
    "WEBP - Weppy File Format", //chrome only
  ];
  //new
  this.file_new = function () {
    var resolutions = ['Custom'];
    for (var i in GUI.common_dimensions) {
      resolutions.push(GUI.common_dimensions[i][0] + 'x' + GUI.common_dimensions[i][1]);
    }

    POP.add({name: "width", title: "Width:", value: WIDTH});
    POP.add({name: "height", title: "Height:", value: HEIGHT});
    POP.add({name: "transparency", title: "Transparent:", values: ['Yes', 'No']});
    POP.add({name: "resolution", title: "Resolution:", values: resolutions});
    POP.show(
            'New file...',
            function (response) {
              var width = parseInt(response.width);
              var height = parseInt(response.height);
              var resolution = response.resolution;

              if (resolution != 'Custom') {
                var dim = resolution.split("x");
                width = dim[0];
                height = dim[1];
              }
              if (response.transparency == 'Yes')
                GUI.TRANSPARENCY = true;
              else
                GUI.TRANSPARENCY = false;

              GUI.ZOOM = 100;
              WIDTH = width;
              HEIGHT = height;
              MAIN.init();
            }
    );
  };

  //open
  this.file_open = function () {
    this.open();
  };

  //save
  this.file_save = function () {
    this.save_dialog();
  };

  //print
  this.file_print = function () {
    window.print();
  };

  this.open = function () {
    var self = this;

    document.getElementById("tmp").innerHTML = '';
    var a = document.createElement('input');
    a.setAttribute("id", "file_open");
    a.type = 'file';
    a.multiple = 'multiple ';
    document.getElementById("tmp").appendChild(a);
    document.getElementById('file_open').addEventListener('change', function (e) {
      self.open_handler(e);
    }, false);

    //force click
    document.querySelector('#file_open').click();
  };

  this.open_handler = function (e) {
    var files = e.target.files;
    var self = this;
    if (files == undefined) {
      //drag and drop
      files = e.dataTransfer.files;
    }

    for (var i = 0, f; i < files.length; i++) {
      f = files[i];
      if (!f.type.match('image.*') && !f.name.match('.json')) {
        console.log('Wrong file type, must be image or json.');
        continue;
      }
      if (files.length == 1)
        this.SAVE_NAME = f.name.split('.')[f.name.split('.').length - 2];

      var FR = new FileReader();
      FR.file = files[i];

      FR.onload = function (event) {
        if (this.file.type.match('image.*')) {
          //image
          LAYER.layer_add(this.file.name, event.target.result, this.file.type);
          self.save_file_info(this.file);
        } else {
          //json
          var responce = self.load_json(event.target.result);
          if (responce === true)
            return false;
        }
      };
      if (f.type == "text/plain")
        FR.readAsText(f);
      else if (f.name.match('.json'))
        FR.readAsText(f);
      else
        FR.readAsDataURL(f);
    }
  };

  this.save_dialog = function (e) {
    //find default format
    var save_default = this.SAVE_TYPES[0];	//png
    if (HELPER.getCookie('save_default') == 'jpg')
      save_default = this.SAVE_TYPES[1]; //jpg

    POP.add({name: "name", title: "File name:", value: this.SAVE_NAME});
    POP.add({name: "type", title: "Save as type:", values: this.SAVE_TYPES, value: save_default});
    POP.add({name: "quality", title: "Quality (jpeg):", value: 90, range: [1, 100]});
    POP.add({name: "layers", title: "Save layers:", values: ['All', 'Selected']});
    POP.add({name: "trim", title: "Trim:", values: ['No', 'Yes']});
    POP.show('Save as', [FILE, 'save']);
    document.getElementById("pop_data_name").select();
    if (e != undefined)
      e.preventDefault();
  };

  this.save = function (user_response) {
    fname = user_response.name;
    var tempCanvas = document.createElement("canvas");
    var tempCtx = tempCanvas.getContext("2d");
    var save_mode_for_ie = false;
    if (window.Blob && window.navigator.msSaveOrOpenBlob && window.FileReader)
      save_mode_for_ie = true;
    tempCanvas.width = WIDTH;
    tempCanvas.height = HEIGHT;

    //save choosen type
    var save_default = this.SAVE_TYPES[0];	//png
    if (HELPER.getCookie('save_default') == 'jpg')
      save_default = this.SAVE_TYPES[1]; //jpg
    if (user_response.type != save_default && user_response.type == this.SAVE_TYPES[0])
      HELPER.setCookie('save_default', 'png', 30);
    else if (user_response.type != save_default && user_response.type == this.SAVE_TYPES[1])
      HELPER.setCookie('save_default', 'jpg', 30);

    //detect type
    var parts = user_response.type.split(" ");
    user_response.type = parts[0];

    if (HELPER.strpos(fname, '.png') !== false)
      user_response.type = 'PNG';
    else if (HELPER.strpos(fname, '.jpg') !== false)
      user_response.type = 'JPG';
    else if (HELPER.strpos(fname, '.json') !== false)
      user_response.type = 'JSON';
    else if (HELPER.strpos(fname, '.bmp') !== false)
      user_response.type = 'BMP';
    else if (HELPER.strpos(fname, '.webp') !== false)
      user_response.type = 'WEBP';

    //handle transparency
    if (GUI.TRANSPARENCY == false || user_response.type == 'JPG') {
      tempCtx.beginPath();
      tempCtx.rect(0, 0, WIDTH, HEIGHT);
      tempCtx.fillStyle = "#ffffff";
      tempCtx.fill();
    }

    //take data
    for (var i = LAYER.layers.length - 1; i >= 0; i--) {
      if (LAYER.layers[i].visible == false)
        continue;
      if (user_response.layers == 'Selected' && user_response.type != 'JSON' && i != LAYER.layer_active)
        continue;
      tempCtx.drawImage(document.getElementById(LAYER.layers[i].name), 0, 0, WIDTH, HEIGHT);
    }

    if (user_response.trim == 'Yes' && user_response.type != 'JSON') {
      //trim
      var trim_info = IMAGE.trim_info(tempCanvas);
      tmp_data = tempCtx.getImageData(0, 0, WIDTH, HEIGHT);
      tempCtx.clearRect(0, 0, WIDTH, HEIGHT);
      tempCanvas.width = WIDTH - trim_info.right - trim_info.left;
      tempCanvas.height = HEIGHT - trim_info.bottom - trim_info.top;
      tempCtx.putImageData(tmp_data, -trim_info.left, -trim_info.top);
    }

    if (user_response.type == 'PNG') {
      //png - default format
      if (HELPER.strpos(fname, '.png') == false)
        fname = fname + ".png";

      tempCanvas.toBlob(function (blob) {
        saveAs(blob, fname);
      });
    } else if (user_response.type == 'JPG') {
      //jpg
      if (HELPER.strpos(fname, '.jpg') == false)
        fname = fname + ".jpg";

      var quality = parseInt(user_response.quality);
      if (quality > 100 || quality < 1 || isNaN(quality) == true)
        quality = 90;
      quality = quality / 100;

      tempCanvas.toBlob(function (blob) {
        saveAs(blob, fname);
      }, "image/jpeg", quality);
    } else if (user_response.type == 'WEBP') {
      //WEBP - new format for chrome only
      if (HELPER.strpos(fname, '.webp') == false)
        fname = fname + ".webp";
      var data_header = "image/webp";

      //check support
      if (this.check_format_support(tempCanvas, data_header) == false)
        return false;

      tempCanvas.toBlob(function (blob) {
        saveAs(blob, fname);
      }, data_header);
    } else if (user_response.type == 'BMP') {
      //bmp
      if (HELPER.strpos(fname, '.webp') == false)
        fname = fname + ".webp";
      var data_header = "image/bmp";

      //check support
      if (this.check_format_support(tempCanvas, data_header) == false)
        return false;

      tempCanvas.toBlob(function (blob) {
        saveAs(blob, fname);
      }, data_header);
    } else if (user_response.type == 'JSON') {
      //json - full data with layers
      if (HELPER.strpos(fname, '.json') == false)
        fname = fname + ".json";

      var export_data = {};

      //basic info
      export_data.info = {
        width: WIDTH,
        height: HEIGHT,
      };

      //layers
      export_data.layers = [];
      for (var i = LAYER.layers.length - 1; i >= 0; i--) {
        var layer = {
          name: LAYER.layers[i].name,
          title: LAYER.layers[i].title,
          visible: 1,
          opacity: LAYER.layers[i].opacity,
        };
        if (LAYER.layers[i].visible == false)
          layer.visible = 0;
        export_data.layers.push(layer);
      }

      //image data
      export_data.image_data = [];
      for (var i = LAYER.layers.length - 1; i >= 0; i--) {
        var data_tmp = document.getElementById(LAYER.layers[i].name).toDataURL("image/png");
        export_data.image_data.push({name: LAYER.layers[i].name, data: data_tmp});
      }

      var data_json = JSON.stringify(export_data, null, 6);
      delete export_data;

      var blob = new Blob([data_json], {type: "text/plain"});
      //var data = window.URL.createObjectURL(blob); //html5
      saveAs(blob, fname);
    }
  };

  this.check_format_support = function (canvas, data_header) {
    var data = canvas.toDataURL(data_header);
    var actualType = data.replace(/^data:([^;]*).*/, '$1');

    if (data_header != actualType && data_header != "text/plain") {
      //error - no support
      POP.add({title: "Error:", value: 'Your browser do not support this format.'});
      POP.show('Sorry', '');
      delete data;
      return false;
    }
    delete data;
    return true;
  };

  this.save_cleanup = function (a) {
    a.textContent = 'Downloaded';
    setTimeout(function () {
      a.href = '';
      var element = document.getElementById("save_data");
      element.parentNode.removeChild(element);
    }, 1500);
  };

  this.save_file_info = function (object) {
    this.file_info = {
      general: [],
      exif: [],
    };
    //exif data
    EXIF.getData(object, function () {
      FILE.file_info.exif = this.exifdata;
    });

    //general
    if (object.name != undefined)
      FILE.file_info.general.Name = object.name;
    if (object.size != undefined)
      FILE.file_info.general.Size = HELPER.number_format(object.size / 1000, 2) + ' KB';
    if (object.type != undefined)
      FILE.file_info.general.Type = object.type;
    if (object.lastModifiedDate != undefined)
      FILE.file_info.general['Last modified'] = object.lastModifiedDate;
  };

  this.load_json = function (data) {
    var json = JSON.parse(data);

    //init new file
    GUI.ZOOM = 100;
    MAIN.init();

    LAYER.remove_all_layers();

    //set attributes
    WIDTH = parseInt(json.info.width);
    HEIGHT = parseInt(json.info.height);
    LAYER.set_canvas_size();

    //add layers
    for (var i in json.layers) {
      var layer = json.layers[i];
      var name = layer.name.replace(/[^0-9a-zA-Z-_\. ]/g, "");
      var title = layer.title;
      var visible = parseInt(layer.visible);
      var opacity = parseInt(layer.opacity);

      LAYER.layer_add(name);
      //update attributes
      LAYER.layers[LAYER.layer_active].title = title;
      if (visible == 0)
        LAYER.layer_visibility(LAYER.layer_active);
      LAYER.layers[LAYER.layer_active].opacity = opacity;
    }
    LAYER.layer_renew();

    for (var i in json.image_data) {
      var layer = json.image_data[i];
      var name = layer.name.replace(/[^0-9a-zA-Z-_\. ]/g, "");
      var data = layer.data;

      var img = new Image();
      img.onload = (function (name, value) {
        return function () {
          document.getElementById(name).getContext('2d').drawImage(value, 0, 0);

          LAYER.layer_renew();
          GUI.zoom();
        };
      })(name, img);
      img.src = data;
    }
  };

}
/* global MAIN, POP, LAYER, DRAW, GUI */
/* global WIDTH, HEIGHT, canvas_active, canvas_front */

var EDIT = new EDIT_CLASS();

/** 
 * manages edit actions
 * 
 * @author ViliusL
 */
function EDIT_CLASS() {

  /**
   * used to store internal copied objects data
   */
  var PASTE_DATA = false;

  /**
   * latest 3 saved states of all layers for undo
   */
  var layers_archive = [{}, {}, {}];

  /**
   * on undo, current data index in layers_archive array
   */
  var undo_level = 0;

  //undo
  this.edit_undo = function () {
    this.undo();
  };

  //cut
  this.edit_cut = function () {
    this.save_state();
    if (DRAW.select_data != false) {
      this.copy_to_clipboard();
      canvas_active().clearRect(DRAW.select_data.x, DRAW.select_data.y, DRAW.select_data.w, DRAW.select_data.h);
      DRAW.select_data = false;
      canvas_front.clearRect(0, 0, WIDTH, HEIGHT);
    }
  };

  //copy
  this.edit_copy = function () {
    if (DRAW.select_data != false) {
      this.copy_to_clipboard();
    }
  };

  //paste
  this.edit_paste = function () {
    this.save_state();
    this.paste('menu');
  };

  //select all
  this.edit_select = function () {
    DRAW.select_data = {
      x: 0,
      y: 0,
      w: WIDTH,
      h: HEIGHT
    };
    canvas_front.clearRect(0, 0, WIDTH, HEIGHT);
    GUI.draw_selected_area();
  };

  //clear selection
  this.edit_clear = function () {
    DRAW.select_data = false;
    canvas_front.clearRect(0, 0, WIDTH, HEIGHT);
    DRAW.select_square_action = '';
  };

  this.copy_to_clipboard = function () {
    PASTE_DATA = false;
    PASTE_DATA = document.createElement("canvas");
    PASTE_DATA.width = DRAW.select_data.w;
    PASTE_DATA.height = DRAW.select_data.h;
    PASTE_DATA.getContext("2d").drawImage(canvas_active(true), DRAW.select_data.x, DRAW.select_data.y, DRAW.select_data.w, DRAW.select_data.h, 0, 0, DRAW.select_data.w, DRAW.select_data.h);
  };

  this.paste = function (type) {
    if (PASTE_DATA == false) {
      if (type == 'menu') {
        POP.add({title: "Error:", value: 'Empty data'});
        POP.add({title: "Notice:", value: 'To paste from clipboard, use Ctrl-V.'});
        POP.show('Notice', '');
      }
      return false;
    }

    tmp = new Array();
    var new_name = 'Layer #' + (LAYER.layers.length + 1);
    LAYER.create_canvas(new_name);
    LAYER.layers.unshift({name: new_name, title: new_name, visible: true});
    LAYER.layer_active = 0;
    canvas_active().drawImage(PASTE_DATA, 0, 0);
    LAYER.layer_renew();
    EDIT.edit_clear();
  };

  this.save_state = function () {
    undo_level = 0;
    j = 0;

    //move previous
    layers_archive[2] = layers_archive[1];
    layers_archive[1] = layers_archive[0];

    //save last state
    layers_archive[j] = {};
    layers_archive[j].width = WIDTH;
    layers_archive[j].height = HEIGHT;
    layers_archive[j].data = {};
    for (var i in LAYER.layers) {
      layers_archive[j].data[LAYER.layers[i].name] = document.createElement('canvas');
      layers_archive[j].data[LAYER.layers[i].name].width = WIDTH;
      layers_archive[j].data[LAYER.layers[i].name].height = HEIGHT;
      layers_archive[j].data[LAYER.layers[i].name].getContext('2d').drawImage(document.getElementById(LAYER.layers[i].name), 0, 0);
    }
    return true;
  };
  //supports 3 levels undo system - more levels requires more memory
  this.undo = function () {
    if (layers_archive.length == 0)
      return false;
    j = undo_level;
    undo_level++;
    if (layers_archive[j] == undefined || layers_archive[j].width == undefined)
      return false;
    if (WIDTH != layers_archive[j].width || HEIGHT != layers_archive[j].height) {
      WIDTH = layers_archive[j].width;
      HEIGHT = layers_archive[j].height;
      LAYER.set_canvas_size(true);
    }

    //undo
    for (var i in LAYER.layers) {
      if (layers_archive[j].data[LAYER.layers[i].name] != undefined) {
        document.getElementById(LAYER.layers[i].name).getContext("2d").clearRect(0, 0, WIDTH, HEIGHT);
        document.getElementById(LAYER.layers[i].name).getContext("2d").drawImage(layers_archive[j].data[LAYER.layers[i].name], 0, 0);
      }
    }
    GUI.zoom();
    return true;
  };
}

/* global MAIN, EVENTS, LAYER, POP, HELPER, TOOLS, DRAW, GUI, EDIT */
/* global canvas_active, ImageFilters, WIDTH, HEIGHT, canvas_active, canvas_front */

var IMAGE = new IMAGE_CLASS();

/** 
 * manages image actions
 * 
 * @author ViliusL
 */
function IMAGE_CLASS() {

  //information
  this.image_information = function () {
    var colors = this.unique_colors_count(canvas_active(true));
    colors = HELPER.number_format(colors, 0);

    POP.add({title: "Width:", value: WIDTH});
    POP.add({title: "Height:", value: HEIGHT});
    POP.add({title: "Unique colors:", value: colors});

    //show general data
    for (var i in FILE.file_info.general) {
      POP.add({title: i + ":", value: FILE.file_info.general[i]});
    }

    //show exif data
    var n = 0;
    for (var i in FILE.file_info.exif) {
      if (i == 'undefined')
        continue;
      if (n == 0)
        POP.add({title: "==== EXIF ====", value: ''});
      POP.add({title: i + ":", value: FILE.file_info.exif[i]});
      n++;
    }

    POP.show('Information', '');
  };

  //size
  this.image_size = function () {
    POP.add({name: "width", title: "Width:", value: WIDTH, placeholder: WIDTH});
    POP.add({name: "height", title: "Height:", value: HEIGHT, placeholder: HEIGHT});
    POP.show('Attributes', [IMAGE, 'resize_custom']);
  };

  //trim
  this.image_trim = function () {
    EDIT.save_state();
    this.trim();
  };

  //crop
  this.image_crop = function () {
    EDIT.save_state();
    if (DRAW.select_data == false) {
      POP.add({html: 'Select area first'});
      POP.show('Error', '');
    } else {
      for (var i in LAYER.layers) {
        var layer = document.getElementById(LAYER.layers[i].name).getContext("2d");

        var tmp = layer.getImageData(DRAW.select_data.x, DRAW.select_data.y, DRAW.select_data.w, DRAW.select_data.h);
        layer.clearRect(0, 0, WIDTH, HEIGHT);
        layer.putImageData(tmp, 0, 0);
      }

      //resize
      EDIT.save_state();
      WIDTH = DRAW.select_data.w;
      HEIGHT = DRAW.select_data.h;
      LAYER.set_canvas_size();

      DRAW.select_data = false;
      canvas_front.clearRect(0, 0, WIDTH, HEIGHT);
    }
  };

  //resize
  this.image_resize = function () {
    this.resize_box();
  };

  //rotate left
  this.image_rotate_left = function () {
    EDIT.save_state();
    this.rotate_resize_doc(270, WIDTH, HEIGHT);
    this.rotate_layer({angle: 270}, canvas_active(), WIDTH, HEIGHT);
  };

  //rotate right
  this.image_rotate_right = function () {
    EDIT.save_state();
    this.rotate_resize_doc(90, WIDTH, HEIGHT);
    this.rotate_layer({angle: 90}, canvas_active(), WIDTH, HEIGHT);
  };

  //rotate
  this.image_rotate = function () {
    POP.add({name: "angle", title: "Enter angle (0-360):", value: 0, range: [0, 360]});
    POP.add({name: "mode", title: "Area:", values: ['All', 'Visible']});
    POP.show(
            'Rotate',
            function (response) {
              EDIT.save_state();
              if (response.mode == 'All')
                IMAGE.rotate_resize_doc(response.angle, WIDTH, HEIGHT);
              IMAGE.rotate_layer(response, canvas_active(), WIDTH, HEIGHT);
            },
            function (response, canvas_preview, w, h) {
              IMAGE.rotate_layer(response, canvas_preview, w, h);
            }
    );
  };

  //vertical flip
  this.image_vflip = function () {
    EDIT.save_state();
    var tempCanvas = document.createElement("canvas");
    var tempCtx = tempCanvas.getContext("2d");
    tempCanvas.width = WIDTH;
    tempCanvas.height = HEIGHT;
    tempCtx.drawImage(canvas_active(true), 0, 0, WIDTH, HEIGHT);
    //flip
    canvas_active().clearRect(0, 0, WIDTH, HEIGHT);
    canvas_active().save();
    canvas_active().scale(-1, 1);
    canvas_active().drawImage(tempCanvas, -WIDTH, 0);
    canvas_active().restore();
  };

  //horizontal flip
  this.image_hflip = function () {
    EDIT.save_state();
    var tempCanvas = document.createElement("canvas");
    var tempCtx = tempCanvas.getContext("2d");
    tempCanvas.width = WIDTH;
    tempCanvas.height = HEIGHT;
    tempCtx.drawImage(canvas_active(true), 0, 0, WIDTH, HEIGHT);
    //flip
    canvas_active().clearRect(0, 0, WIDTH, HEIGHT);
    canvas_active().save();
    canvas_active().scale(1, -1);
    canvas_active().drawImage(tempCanvas, 0, -HEIGHT);
    canvas_active().restore();
  };

  //color corrections
  this.image_colors = function () {
    POP.add({name: "param1", title: "Brightness:", value: "0", range: [-100, 100]});
    POP.add({name: "param2", title: "Contrast:", value: "0", range: [-100, 100]});
    POP.add({name: "param_red", title: "Red channel:", value: "0", range: [-255, 255]});
    POP.add({name: "param_green", title: "Green channel:", value: "0", range: [-255, 255]});
    POP.add({name: "param_blue", title: "Blue channel:", value: "0", range: [-255, 255]});
    POP.add({name: "param_h", title: "Hue:", value: "0", range: [-180, 180]});
    POP.add({name: "param_s", title: "Saturation:", value: "0", range: [-100, 100]});
    POP.add({name: "param_l", title: "Luminance:", value: "0", range: [-100, 100]});

    POP.show(
            'Brightness Contrast',
            function (user_response) {
              EDIT.save_state();
              var param1 = parseInt(user_response.param1);
              var param2 = parseInt(user_response.param2);
              var param_red = parseInt(user_response.param_red);
              var param_green = parseInt(user_response.param_green);
              var param_blue = parseInt(user_response.param_blue);
              var param_h = parseInt(user_response.param_h);
              var param_s = parseInt(user_response.param_s);
              var param_l = parseInt(user_response.param_l);

              var imageData = canvas_active().getImageData(0, 0, WIDTH, HEIGHT);
              //Brightness/Contrast
              var filtered = ImageFilters.BrightnessContrastPhotoshop(imageData, param1, param2);
              //RGB corrections
              var filtered = ImageFilters.ColorTransformFilter(filtered, 1, 1, 1, 1, param_red, param_green, param_blue, 1);
              //hue/saturation/luminance
              var filtered = ImageFilters.HSLAdjustment(filtered, param_h, param_s, param_l);
              canvas_active().putImageData(filtered, 0, 0);
              GUI.zoom();
            },
            function (user_response, canvas_preview, w, h) {
              var param1 = parseInt(user_response.param1);
              var param2 = parseInt(user_response.param2);
              var param_red = parseInt(user_response.param_red);
              var param_green = parseInt(user_response.param_green);
              var param_blue = parseInt(user_response.param_blue);
              var param_h = parseInt(user_response.param_h);
              var param_s = parseInt(user_response.param_s);
              var param_l = parseInt(user_response.param_l);

              var imageData = canvas_preview.getImageData(0, 0, w, h);
              //Brightness/Contrast
              var filtered = ImageFilters.BrightnessContrastPhotoshop(imageData, param1, param2);	//add effect
              //RGB corrections
              var filtered = ImageFilters.ColorTransformFilter(filtered, 1, 1, 1, 1, param_red, param_green, param_blue, 1);
              //hue/saturation/luminance
              var filtered = ImageFilters.HSLAdjustment(filtered, param_h, param_s, param_l);
              canvas_preview.putImageData(filtered, 0, 0);
            }
    );
  };

  //auto adjust colors
  this.image_auto_adjust = function () {
    EDIT.save_state();
    this.auto_adjust(canvas_active(), WIDTH, HEIGHT);
  };

  //convert to grayscale
  this.image_GrayScale = function () {
    EDIT.save_state();
    var imageData = canvas_active().getImageData(0, 0, WIDTH, HEIGHT);
    var filtered = ImageFilters.GrayScale(imageData);	//add effect
    canvas_active().putImageData(filtered, 0, 0);
  };

  //enchance colors
  this.image_decrease_colors = function () {
    POP.add({name: "param1", title: "Colors:", value: "10", range: [2, 256]});
    POP.add({name: "param2", title: "Dithering:", values: ["No", "Yes"], });
    POP.add({name: "param3", title: "Greyscale:", values: ["No", "Yes"], });
    POP.show(
            'Decrease colors',
            function (user_response) {
              EDIT.save_state();
              var param1 = parseInt(user_response.param1);
              if (user_response.param2 == 'Yes')
                param2 = true;
              else
                param2 = false;
              if (user_response.param3 == 'Yes')
                param3 = true;
              else
                param3 = false;

              IMAGE.decrease_colors(canvas_active(true), canvas_active(true), WIDTH, HEIGHT, param1, param2, param3);
              GUI.zoom();
            },
            function (user_response, canvas_preview, w, h) {
              var param1 = parseInt(user_response.param1);
              if (user_response.param2 == 'Yes')
                param2 = true;
              else
                param2 = false;
              if (user_response.param3 == 'Yes')
                param3 = true;
              else
                param3 = false;

              IMAGE.decrease_colors(canvas_active(true), document.getElementById("pop_post"), w, h, param1, param2, param3);
            }
    );
  };

  //negative
  this.image_negative = function () {
    EDIT.save_state();
    if (DRAW.select_data == false)
      var imageData = canvas_active().getImageData(0, 0, WIDTH, HEIGHT);
    else
      var imageData = canvas_active().getImageData(DRAW.select_data.x, DRAW.select_data.y, DRAW.select_data.w, DRAW.select_data.h);
    var pixels = imageData.data;
    for (var i = 0; i < pixels.length; i += 4) {
      pixels[i] = 255 - pixels[i]; // red
      pixels[i + 1] = 255 - pixels[i + 1]; // green
      pixels[i + 2] = 255 - pixels[i + 2]; // blue
    }
    //save
    if (DRAW.select_data == false)
      canvas_active().putImageData(imageData, 0, 0);
    else
      canvas_active().putImageData(imageData, DRAW.select_data.x, DRAW.select_data.y);
  };

  //grid
  this.image_grid = function () {
    POP.add({name: "visible", title: "Visible:", value: "Yes", values: ["Yes", "No"]});
    POP.add({name: "gap_x", title: "Horizontal gap:", value: GUI.grid_size[0]});
    POP.add({name: "gap_y", title: "Vertical gap:", value: GUI.grid_size[1]});
    POP.show(
            'Grid',
            function (response) {
              if (response.visible == "Yes") {
                GUI.grid = true;
                gap_x = response.gap_x;
                gap_y = response.gap_y;
                GUI.draw_grid(gap_x, gap_y);
              } else {
                GUI.grid = false;
                GUI.draw_grid();
              }
            }
    );
  };

  //histogram
  this.image_histogram = function () {
    this.histogram();
  };

  this.resize_custom = function (user_response) {
    EDIT.save_state();
    EVENTS.autosize = false;
    if (user_response.width != WIDTH || user_response.height != HEIGHT) {
      WIDTH = user_response.width;
      HEIGHT = user_response.height;
      LAYER.set_canvas_size();
    }
  };

  //prepare rotation - increase doc dimensions if needed
  this.rotate_resize_doc = function (angle, w, h) {
    var o = angle * Math.PI / 180;
    var new_x = w * Math.abs(Math.cos(o)) + h * Math.abs(Math.sin(o));
    var new_y = w * Math.abs(Math.sin(o)) + h * Math.abs(Math.cos(o));
    new_x = Math.ceil(Math.round(new_x * 1000) / 1000);
    new_y = Math.ceil(Math.round(new_y * 1000) / 1000);

    if (WIDTH != new_x || HEIGHT != new_y) {
      EDIT.save_state();
      var dx = 0;
      var dy = 0;
      if (new_x > WIDTH) {
        dx = Math.ceil(new_x - WIDTH) / 2;
        WIDTH = new_x;
      }
      if (new_y > HEIGHT) {
        dy = Math.ceil(new_y - HEIGHT) / 2;
        HEIGHT = new_y;
      }
      LAYER.set_canvas_size();

      var tmp = canvas_active().getImageData(0, 0, WIDTH, HEIGHT);
      canvas_active().clearRect(0, 0, WIDTH, HEIGHT);
      canvas_active().putImageData(tmp, dx, dy);
    }
  };

  //rotate layer
  this.rotate_layer = function (user_response, canvas, w, h) {
    var TO_RADIANS = Math.PI / 180;
    angle = user_response.angle;
    mode = user_response.mode;

    var area_x = 0;
    var area_y = 0;
    var area_w = w;
    var area_h = h;

    var dx = 0;
    var dy = 0;

    if (mode == 'Visible') {
      //rotate only visible part

      var trim_info = this.trim_info(canvas.canvas);
      area_x = trim_info.left;
      area_y = trim_info.top;
      area_w = w - trim_info.left - trim_info.right;
      area_h = h - trim_info.top - trim_info.bottom;

      //calc how much dimensions will increase
      var o = angle * Math.PI / 180;
      var new_x = area_w * Math.abs(Math.cos(o)) + area_h * Math.abs(Math.sin(o));
      var new_y = area_w * Math.abs(Math.sin(o)) + area_h * Math.abs(Math.cos(o));
      new_x = Math.ceil(Math.round(new_x * 1000) / 1000);
      new_y = Math.ceil(Math.round(new_y * 1000) / 1000);
      if (new_x > area_w || new_y > area_h) {
        if (new_x > area_w) {
          dx = Math.ceil(new_x - area_w) / 2;
          if (area_x > dx)
            dx = 0;
        }
        if (new_y > area_h) {
          dy = Math.ceil(new_y - area_h) / 2;
          if (area_y > dy)
            dy = 0;
        }
        if (w == WIDTH && h == HEIGHT) {
          var tmp = canvas.getImageData(0, 0, w, h);
          canvas.clearRect(0, 0, w, h);
          canvas.putImageData(tmp, dx, dy);
        }
      }

      //recalc
      var trim_info = this.trim_info(canvas.canvas);
      area_x = trim_info.left;
      area_y = trim_info.top;
      area_w = w - trim_info.left - trim_info.right;
      area_h = h - trim_info.top - trim_info.bottom;
    }

    var tempCanvas = document.createElement("canvas");
    var tempCtx = tempCanvas.getContext("2d");
    tempCanvas.width = area_w;
    tempCanvas.height = area_h;
    var imageData = canvas.getImageData(area_x, area_y, area_w, area_h);
    tempCtx.putImageData(imageData, 0, 0);

    //rotate
    canvas.clearRect(area_x, area_y, area_w, area_h);
    canvas.save();
    canvas.translate(area_x + Math.round(area_w / 2), area_y + Math.round(area_h / 2));
    canvas.rotate(angle * TO_RADIANS);
    canvas.drawImage(tempCanvas, -Math.round(area_w / 2), -Math.round(area_h / 2));
    canvas.restore();
    if (w == WIDTH && h == HEIGHT) {
      //if main canvas
      GUI.zoom();
    }
  };

  this.resize_box = function () {
    POP.add({name: "width", title: "Width (pixels):", value: '', placeholder: WIDTH});
    POP.add({name: "height", title: "Height (pixels):", value: '', placeholder: HEIGHT});
    POP.add({name: "width_percent", title: "Width (%):", value: '', placeholder: 100});
    POP.add({name: "height_percent", title: "Height (%):", value: '', placeholder: 100});
    POP.add({name: "mode", title: "Mode:", values: ["Resample - Hermite", "Basic", "HQX"]});
    POP.add({name: "preblur", title: "Pre-Blur:", values: ["Yes", "No"], value: "No"});
    POP.add({name: "sharpen", title: "Sharpen:", values: ["Yes", "No"], value: "No"});
    POP.show('Resize', [IMAGE, "resize_layer"]);
  };

  this.resize_layer = function (user_response) {
    EDIT.save_state();
    var width = parseInt(user_response.width);
    var height = parseInt(user_response.height);
    var width_100 = parseInt(user_response.width_percent);
    var height_100 = parseInt(user_response.height_percent);
    var preblur = user_response.preblur;
    var sharpen = user_response.sharpen;
    if (isNaN(width) && isNaN(height) && isNaN(width_100) && isNaN(height_100))
      return false;
    if (width == WIDTH && height == HEIGHT)
      return false;

    //if dimension with percent provided
    if (isNaN(width) && isNaN(height)) {
      if (isNaN(width_100) == false) {
        width = Math.round(WIDTH * width_100 / 100);
      }
      if (isNaN(height_100) == false) {
        height = Math.round(HEIGHT * height_100 / 100);
      }
    }

    //if only 1 dimension was provided
    if (isNaN(width) || isNaN(height)) {
      var ratio = WIDTH / HEIGHT;
      if (isNaN(width))
        width = Math.round(height * ratio);
      if (isNaN(height))
        height = Math.round(width / ratio);
    }

    //anti-artifacting?
    if (preblur == 'Yes') {
      var ratio_w = WIDTH / width;
      var ratio_h = HEIGHT / height;
      var ratio_avg = Math.max(ratio_w, ratio_h);
      var power = ratio_avg * 0.3;
      if (power > 0.6) {
        var imageData = canvas_active().getImageData(0, 0, WIDTH, HEIGHT);
        var filtered = ImageFilters.GaussianBlur(imageData, power);	//add effect
        canvas_active().putImageData(filtered, 0, 0);
      }
    }

    //validate
    if (user_response.mode == "Resample - Hermite" && (width > WIDTH || height > HEIGHT)) {
      //scalling up - Hermite not supported
      user_response.mode = "Resize";
    }
    if (user_response.mode == "HQX" && (width < WIDTH && height < HEIGHT)) {
      //scalling down - HQX not supported
      user_response.mode = "Resample - Hermite";
    }

    var time1 = Date.now();
    var resize_type;

    if (user_response.mode == "Resample - Hermite") {
      //Hermite resample - max quality
      resize_type = 'Hermite';
      this.resample_hermite(canvas_active(true), WIDTH, HEIGHT, width, height);
      if (GUI.last_menu != 'layer_resize') {
        WIDTH = width;
        HEIGHT = height;
        if (WIDTH < 1)
          WIDTH = 1;
        if (HEIGHT < 1)
          HEIGHT = 1;
        LAYER.set_canvas_size();
      }
      GUI.zoom();
    } else if (user_response.mode == "HQX") {
      //HQX - 2, 3, 4 scale only, but amazing quality if there are only few colors
      resize_type = 'HQX';

      //find correct dimensions
      var multiply = Math.max(width / WIDTH, height / HEIGHT);
      multiply = Math.round(multiply);
      if (multiply < 2)
        multiply = 2;
      if (multiply > 4)
        multiply = 4;

      var image_data_resized = hqx(canvas_active(true), multiply);

      canvas_active().clearRect(0, 0, WIDTH, HEIGHT);
      WIDTH = WIDTH * multiply;
      HEIGHT = HEIGHT * multiply;
      LAYER.set_canvas_size();
      canvas_active().putImageData(image_data_resized, 0, 0);
      GUI.zoom();
    } else {
      //simple resize - max speed
      resize_type = 'Default';
      tmp_data = document.createElement("canvas");
      tmp_data.width = WIDTH;
      tmp_data.height = HEIGHT;
      tmp_data.getContext("2d").drawImage(canvas_active(true), 0, 0);

      canvas_active().clearRect(0, 0, WIDTH, HEIGHT);
      WIDTH = width;
      HEIGHT = height;
      LAYER.set_canvas_size();
      canvas_active().drawImage(tmp_data, 0, 0, width, height);
      GUI.zoom();
    }

    //console.log(resize_type + " resize: " + (Math.round(Date.now() - time1) / 1000) + " s");

    //sharpen after?
    if (sharpen == 'Yes') {
      var imageData = canvas_active().getImageData(0, 0, WIDTH, HEIGHT);
      var filtered = ImageFilters.Sharpen(imageData, 1);	//add effect
      canvas_active().putImageData(filtered, 0, 0);
    }
  };

  /**
   * get canvas painted are coords
   * 
   * @param {HtmlElement} canvas
   * @param {boolean} trim_white
   * @param {boolean} include_white
   */
  this.trim_info = function (canvas, trim_white, include_white) {
    var top = 0;
    var left = 0;
    var bottom = 0;
    var right = 0;
    var img = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);
    var imgData = img.data;
    //check top
    main1:
            for (var y = 0; y < img.height; y++) {
      for (var x = 0; x < img.width; x++) {
        var k = ((y * (img.width * 4)) + (x * 4));
        if (imgData[k + 3] == 0)
          continue; //transparent 
        if (include_white !== true && imgData[k] == 255 && imgData[k + 1] == 255 && imgData[k + 2] == 255)
          continue; //white
        break main1;
      }
      top++;
    }
    //check left
    main2:
            for (var x = 0; x < img.width; x++) {
      for (var y = 0; y < img.height; y++) {
        var k = ((y * (img.width * 4)) + (x * 4));
        if (imgData[k + 3] == 0)
          continue; //transparent 
        if (include_white !== true && imgData[k] == 255 && imgData[k + 1] == 255 && imgData[k + 2] == 255)
          continue; //white
        break main2;
      }
      left++;
    }
    //check bottom
    main3:
            for (var y = img.height - 1; y >= 0; y--) {
      for (var x = img.width - 1; x >= 0; x--) {
        var k = ((y * (img.width * 4)) + (x * 4));
        if (imgData[k + 3] == 0)
          continue; //transparent 
        if (include_white !== true && imgData[k] == 255 && imgData[k + 1] == 255 && imgData[k + 2] == 255)
          continue; //white
        break main3;
      }
      bottom++;
    }
    //check right
    main4:
            for (var x = img.width - 1; x >= 0; x--) {
      for (var y = img.height - 1; y >= 0; y--) {
        var k = ((y * (img.width * 4)) + (x * 4));
        if (imgData[k + 3] == 0)
          continue; //transparent 
        if (include_white !== true && imgData[k] == 255 && imgData[k + 1] == 255 && imgData[k + 2] == 255)
          continue; //white
        break main4;
      }
      right++;
    }
    return {
      top: top,
      left: left,
      bottom: bottom,
      right: right
    };
  };

  this.trim = function (layer, no_resize, include_white) {
    var all_top = HEIGHT;
    var all_left = WIDTH;
    var all_bottom = HEIGHT;
    var all_right = WIDTH;
    for (var i in LAYER.layers) {
      if (layer != undefined && LAYER.layers[i].name != layer)
        continue;

      var top = 0;
      var left = 0;
      var bottom = 0;
      var right = 0;
      var img = document.getElementById(LAYER.layers[i].name).getContext("2d").getImageData(0, 0, WIDTH, HEIGHT);
      var imgData = img.data;
      //check top
      main1:
              for (var y = 0; y < img.height; y++) {
        for (var x = 0; x < img.width; x++) {
          var k = ((y * (img.width * 4)) + (x * 4));
          if (imgData[k + 3] == 0)
            continue; //transparent 
          if (include_white !== true && imgData[k] == 255 && imgData[k + 1] == 255 && imgData[k + 2] == 255)
            continue; //white
          break main1;
        }
        top++;
      }
      //check left
      main2:
              for (var x = 0; x < img.width; x++) {
        for (var y = 0; y < img.height; y++) {
          var k = ((y * (img.width * 4)) + (x * 4));
          if (imgData[k + 3] == 0)
            continue; //transparent 
          if (include_white !== true && imgData[k] == 255 && imgData[k + 1] == 255 && imgData[k + 2] == 255)
            continue; //white
          break main2;
        }
        left++;
      }
      //check bottom
      main3:
              for (var y = img.height - 1; y >= 0; y--) {
        for (var x = img.width - 1; x >= 0; x--) {
          var k = ((y * (img.width * 4)) + (x * 4));
          if (imgData[k + 3] == 0)
            continue; //transparent 
          if (include_white !== true && imgData[k] == 255 && imgData[k + 1] == 255 && imgData[k + 2] == 255)
            continue; //white
          break main3;
        }
        bottom++;
      }
      //check right
      main4:
              for (var x = img.width - 1; x >= 0; x--) {
        for (var y = img.height - 1; y >= 0; y--) {
          var k = ((y * (img.width * 4)) + (x * 4));
          if (imgData[k + 3] == 0)
            continue; //transparent 
          if (include_white !== true && imgData[k] == 255 && imgData[k + 1] == 255 && imgData[k + 2] == 255)
            continue; //white
          break main4;
        }
        right++;
      }
      all_top = Math.min(all_top, top);
      all_left = Math.min(all_left, left);
      all_bottom = Math.min(all_bottom, bottom);
      all_right = Math.min(all_right, right);
    }
    //move to top-left corner
    for (var i in LAYER.layers) {
      if (layer != undefined && LAYER.layers[i].name != layer)
        continue;

      tmp_data = document.getElementById(LAYER.layers[i].name).getContext("2d").getImageData(0, 0, WIDTH, HEIGHT);
      document.getElementById(LAYER.layers[i].name).getContext("2d").clearRect(0, 0, WIDTH, HEIGHT);
      document.getElementById(LAYER.layers[i].name).getContext("2d").putImageData(tmp_data, -all_left, -all_top);
      var canvas_name = LAYER.layers[i].name;
    }
    //resize
    if (no_resize != undefined)
      return false;
    if (layer != undefined) {
      var W = Math.round(WIDTH - all_left - all_right);
      var H = Math.round(HEIGHT - all_top - all_bottom);

      var imageData = document.getElementById(layer).getContext("2d").getImageData(0, 0, W, H);
      document.getElementById(layer).width = W;
      document.getElementById(layer).height = H;
      document.getElementById(layer).getContext("2d").clearRect(0, 0, W, H);
      document.getElementById(layer).getContext("2d").putImageData(imageData, 0, 0);

      return {
        top: all_top,
        left: all_left,
        bottom: all_bottom,
        right: all_right
      };
    } else {
      WIDTH = WIDTH - all_left - all_right;
      HEIGHT = HEIGHT - all_top - all_bottom;
      if (WIDTH < 1)
        WIDTH = 1;
      if (HEIGHT < 1)
        HEIGHT = 1;
      LAYER.set_canvas_size();
    }
    LAYER.update_info_block();
  };

  this.decrease_colors = function (canvas_source, canvas_destination, W, H, colors, dithering, greyscale) {
    var context = canvas_destination.getContext("2d");
    var img = context.getImageData(0, 0, W, H);
    var imgData = img.data;
    var palette = [];

    //collect top colors
    var block_size = 10;
    var ctx = canvas_front; //use temp canvas
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(canvas_source, 0, 0, Math.ceil(canvas_source.width / block_size), Math.ceil(canvas_source.height / block_size)); //simple resize
    var img_p = ctx.getImageData(0, 0, Math.ceil(canvas_source.width / block_size), Math.ceil(canvas_source.height / block_size));
    var imgData_p = img_p.data;
    ctx.clearRect(0, 0, W, H);

    for (var i = 0; i < imgData_p.length; i += 4) {
      if (imgData_p[i + 3] == 0)
        continue;	//transparent
      var grey = Math.round(0.2126 * imgData_p[i] + 0.7152 * imgData_p[i + 1] + 0.0722 * imgData_p[i + 2]);
      palette.push([imgData_p[i], imgData_p[i + 1], imgData_p[i + 2], grey]);
    }

    //calculate weights
    var grey_palette = [];
    for (var i = 0; i < 256; i++)
      grey_palette[i] = 0;
    for (var i = 0; i < palette.length; i++)
      grey_palette[palette[i][3]]++;

    //remove similar colors
    for (var max = 10 * 3; max < 100 * 3; max = max + 10 * 3) {
      if (palette.length <= colors)
        break;
      for (var i = 0; i < palette.length; i++) {
        if (palette.length <= colors)
          break;
        var valid = true;
        for (var j = 0; j < palette.length; j++) {
          if (palette.length <= colors)
            break;
          if (i == j)
            continue;
          if (Math.abs(palette[i][0] - palette[j][0]) + Math.abs(palette[i][1] - palette[j][1]) + Math.abs(palette[i][2] - palette[j][2]) < max) {
            if (grey_palette[palette[i][3]] > grey_palette[palette[j][3]]) {
              //remove color
              palette.splice(j, 1);
              j--;
            } else {
              valid = false;
              break;
            }
          }
        }
        //remove color
        if (valid == false) {
          palette.splice(i, 1);
          i--;
        }
      }
    }

    //change
    var p_n = palette.length;
    for (var j = 0; j < H; j++) {
      for (var i = 0; i < W; i++) {
        var k = ((j * (W * 4)) + (i * 4));
        if (imgData[k + 3] == 0)
          continue;	//transparent
        var grey = Math.round(0.2126 * imgData_p[k] + 0.7152 * imgData_p[k + 1] + 0.0722 * imgData_p[k + 2]);

        //find closest color
        var index1 = 0;
        var min = 999999;
        var diff1;
        for (var m = 0; m < p_n; m++) {
          var diff = Math.abs(palette[m][0] - imgData[k]) + Math.abs(palette[m][1] - imgData[k + 1]) + Math.abs(palette[m][2] - imgData[k + 2]);
          if (diff < min) {
            min = diff;
            index1 = m;
            diff1 = diff;
          }
        }

        if (dithering == false) {
          imgData[k] = palette[index1][0];
          imgData[k + 1] = palette[index1][1];
          imgData[k + 2] = palette[index1][2];
        } else {
          //dithering
          if (diff1 >= 10) {
            //find second close color
            var index2;
            var min2 = 256 * 3;
            var diff2;
            for (var m = 0; m < p_n; m++) {
              if (m == index1)
                continue; //we already have this
              if (palette[index1][3] < grey && palette[m][3] < grey)
                continue;
              if (palette[index1][3] > grey && palette[m][3] > grey)
                continue;
              var diff = Math.abs(palette[m][0] - imgData[k]) + Math.abs(palette[m][1] - imgData[k + 1]) + Math.abs(palette[m][2] - imgData[k + 2]);
              if (diff < min2) {
                min2 = diff;
                index2 = m;
                diff2 = diff;
              }
            }
          }

          var c;
          if (index2 == undefined)
            c = palette[index1]; //only 1 match
          else {
            //randomize
            var rand = HELPER.getRandomInt(-diff1, diff2);
            if (rand < 0)
              c = palette[index2];
            else
              c = palette[index1];
          }
          imgData[k] = c[0];
          imgData[k + 1] = c[1];
          imgData[k + 2] = c[2];
        }

        if (greyscale == true) {
          var mid = Math.round(0.2126 * imgData[k] + 0.7152 * imgData[k + 1] + 0.0722 * imgData[k + 2]);
          imgData[k] = mid;
          imgData[k + 1] = mid;
          imgData[k + 2] = mid;
        }
      }
    }
    canvas_destination.getContext("2d").putImageData(img, 0, 0);
  };

  //fixing white and black color balance
  this.auto_adjust = function (context, W, H) {
    //settings
    var white = 240;	//white color min
    var black = 30;		//black color max
    var target_white = 1; 	//how much % white colors should take
    var target_black = 0.5;	//how much % black colors should take
    var modify = 1.1;	//color modify strength
    var cycles_count = 10; //how much iteration to change colors

    document.body.style.cursor = "wait";
    var img = context.getImageData(0, 0, W, H);
    var imgData = img.data;
    var n = 0;	//pixels count without transparent

    //make sure we have white
    var n_valid = 0;
    for (var i = 0; i < imgData.length; i += 4) {
      if (imgData[i + 3] == 0)
        continue;	//transparent
      if ((imgData[i] + imgData[i + 1] + imgData[i + 2]) / 3 > white)
        n_valid++;
      n++;
    }
    target = target_white;
    var n_fix_white = 0;
    var done = false;
    for (var j = 0; j < cycles_count; j++) {
      if (n_valid * 100 / n >= target)
        done = true;
      if (done == true)
        break;
      n_fix_white++;

      //adjust
      for (var i = 0; i < imgData.length; i += 4) {
        if (imgData[i + 3] == 0)
          continue;	//transparent
        for (var c = 0; c < 3; c++) {
          var x = i + c;
          if (imgData[x] < 10)
            continue;
          //increase white
          imgData[x] *= modify;
          imgData[x] = Math.round(imgData[x]);
          if (imgData[x] > 255)
            imgData[x] = 255;
        }
      }

      //recheck
      n_valid = 0;
      for (var i = 0; i < imgData.length; i += 4) {
        if (imgData[i + 3] == 0)
          continue;	//transparent
        if ((imgData[i] + imgData[i + 1] + imgData[i + 2]) / 3 > white)
          n_valid++;
      }
    }

    //make sure we have black
    n_valid = 0;
    for (var i = 0; i < imgData.length; i += 4) {
      if (imgData[i + 3] == 0)
        continue;	//transparent
      if ((imgData[i] + imgData[i + 1] + imgData[i + 2]) / 3 < black)
        n_valid++;
    }
    target = target_black;
    var n_fix_black = 0;
    var done = false;
    for (var j = 0; j < cycles_count; j++) {
      if (n_valid * 100 / n >= target)
        done = true;
      if (done == true)
        break;
      n_fix_black++;

      //adjust
      for (var i = 0; i < imgData.length; i += 4) {
        if (imgData[i + 3] == 0)
          continue;	//transparent
        for (var c = 0; c < 3; c++) {
          var x = i + c;
          if (imgData[x] > 240)
            continue;
          //increase black
          imgData[x] -= (255 - imgData[x]) * modify - (255 - imgData[x]);
          imgData[x] = Math.round(imgData[x]);
        }
      }

      //recheck
      n_valid = 0;
      for (var i = 0; i < imgData.length; i += 4) {
        if (imgData[i + 3] == 0)
          continue;	//transparent
        if ((imgData[i] + imgData[i + 1] + imgData[i + 2]) / 3 < black)
          n_valid++;
      }
    }

    //save	
    context.putImageData(img, 0, 0);
    document.body.style.cursor = "auto";
    //log('Iterations: brighten='+n_fix_white+", darken="+n_fix_black);
  };

  //hermite resample
  this.resample_hermite = function (canvas, W, H, W2, H2) {
    var img = canvas.getContext("2d").getImageData(0, 0, W, H);
    var img2 = canvas.getContext("2d").getImageData(0, 0, W2, H2);
    var data = img.data;
    var data2 = img2.data;
    var ratio_w = W / W2;
    var ratio_h = H / H2;
    var ratio_w_half = Math.ceil(ratio_w / 2);
    var ratio_h_half = Math.ceil(ratio_h / 2);

    for (var j = 0; j < H2; j++) {
      for (var i = 0; i < W2; i++) {
        var x2 = (i + j * W2) * 4;
        var weight = 0;
        var weights = 0;
        var weights_alpha = 0;
        var gx_r = gx_g = gx_b = gx_a = 0;
        var center_y = (j + 0.5) * ratio_h;
        for (var yy = Math.floor(j * ratio_h); yy < (j + 1) * ratio_h; yy++) {
          var dy = Math.abs(center_y - (yy + 0.5)) / ratio_h_half;
          var center_x = (i + 0.5) * ratio_w;
          var w0 = dy * dy; //pre-calc part of w
          for (var xx = Math.floor(i * ratio_w); xx < (i + 1) * ratio_w; xx++) {
            var dx = Math.abs(center_x - (xx + 0.5)) / ratio_w_half;
            var w = Math.sqrt(w0 + dx * dx);
            if (w >= -1 && w <= 1) {
              //hermite filter
              weight = 2 * w * w * w - 3 * w * w + 1;
              if (weight > 0) {
                dx = 4 * (xx + yy * W);
                //alpha
                gx_a += weight * data[dx + 3];
                weights_alpha += weight;
                //colors
                if (data[dx + 3] < 255)
                  weight = weight * data[dx + 3] / 250;
                gx_r += weight * data[dx];
                gx_g += weight * data[dx + 1];
                gx_b += weight * data[dx + 2];
                weights += weight;
              }
            }
          }
        }
        data2[x2] = gx_r / weights;
        data2[x2 + 1] = gx_g / weights;
        data2[x2 + 2] = gx_b / weights;
        data2[x2 + 3] = gx_a / weights_alpha;
      }
    }
    canvas.getContext("2d").clearRect(0, 0, Math.max(W, W2), Math.max(H, H2));
    canvas.getContext("2d").putImageData(img2, 0, 0);
  };

  this.histogram = function () {
    POP.add({name: "param1", title: "Channel:", values: ["Gray", "Red", "Green", "Blue"], onchange: "IMAGE.histogram_onload()"});
    POP.add({title: 'Histogram:', function: function () {
        var html = '<canvas style="position:relative;" id="c_h" width="256" height="100"></canvas>';
        return html;
      }});
    POP.add({title: "Total pixels:", value: ""});
    POP.add({title: "Average:", value: ""});
    POP.show(
            'Histogram',
            undefined,
            undefined,
            this.histogram_onload
            );
  };

  this.histogram_onload = function (user_response) {
    var img = canvas_active().getImageData(0, 0, WIDTH, HEIGHT);
    var imgData = img.data;
    var channel_grey = document.getElementById("pop_data_param1_poptmp0");
    var channel_r = document.getElementById("pop_data_param1_poptmp1");
    var channel_g = document.getElementById("pop_data_param1_poptmp2");
    var channel_b = document.getElementById("pop_data_param1_poptmp3");

    if (channel_grey.checked == true)
      channel = channel_grey.value;
    else if (channel_r.checked == true)
      channel = channel_r.value;
    else if (channel_g.checked == true)
      channel = channel_g.value;
    else if (channel_b.checked == true)
      channel = channel_b.value;

    //collect data
    var hist_data = [];
    for (var i = 0; i <= 255; i++)
      hist_data[i] = 0;
    var total = imgData.length / 4;
    var sum = 0;
    var grey;

    if (channel == 'Gray') {
      for (var i = 0; i < imgData.length; i += 4) {
        grey = Math.round((imgData[i] + imgData[i + 1] + imgData[i + 2]) / 3);
        hist_data[grey]++;
        sum = sum + imgData[i] + imgData[i + 1] + imgData[i + 2];
      }
    } else if (channel == 'Red') {
      for (var i = 0; i < imgData.length; i += 4) {
        hist_data[imgData[i]]++;
        sum = sum + imgData[i] * 3;
      }
    } else if (channel == 'Green') {
      for (var i = 0; i < imgData.length; i += 4) {
        hist_data[imgData[i + 1]]++;
        sum = sum + imgData[i + 1] * 3;
      }
    } else if (channel == 'Blue') {
      for (var i = 0; i < imgData.length; i += 4) {
        hist_data[imgData[i + 2]]++;
        sum = sum + imgData[i + 2] * 3;
      }
    }

    //draw histogram
    var c = document.getElementById("c_h").getContext("2d");
    c.rect(0, 0, 255, 100);
    c.fillStyle = "#ffffff";
    c.fill();
    for (var i = 0; i <= 255; i++) {
      if (hist_data[i] == 0)
        continue;
      c.beginPath();
      c.strokeStyle = "#000000";
      c.lineWidth = 1;
      c.moveTo(i + 0.5, 100 + 0.5);
      c.lineTo(i + 0.5, 100 - Math.round(hist_data[i] * 255 * 100 / total / 6) + 0.5);
      c.stroke();
    }
    document.getElementById("pop_data_totalpixel").innerHTML = HELPER.number_format(total, 0);
    if (total > 0)
      average = Math.round(sum * 10 / total / 3) / 10;
    else
      average = '-';
    document.getElementById("pop_data_average").innerHTML = average;
  };

  this.unique_colors_count = function (canvas) {
    var img = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);
    var imgData = img.data;
    var colors = [];
    var n = 0;
    for (var i = 0; i < imgData.length; i += 4) {
      if (imgData[i + 3] == 0)
        continue;	//transparent
      var key = imgData[i] + "." + imgData[i + 1] + "." + imgData[i + 2];
      if (colors[key] == undefined) {
        colors[key] = 1;
        n++;
      }
    }
    return n;
  };
  this.zoom_in = function () {
    GUI.zoom(+1, true);
  };
  this.zoom_out = function () {
    GUI.zoom(-1, true);
  };
  this.zoom_original = function () {
    GUI.zoom(100, true);
  };
  this.zoom_auto = function (only_increase) {
    var canvas_wrapper = document.querySelector('#canvas_wrapper');
    var page_w = canvas_wrapper.clientWidth;
    var page_h = canvas_wrapper.clientHeight;

    var best_width = page_w / WIDTH * 100;
    var best_height = page_h / HEIGHT * 100;
    var best_zoom = Math.floor(Math.min(best_width, best_height));
    if (only_increase != undefined && best_zoom > 100) {
      return false;
    }
    GUI.zoom(Math.min(best_width, best_height), true);
  };
}
/* global HELPER, POP, MAIN, EVENTS, LAYER, IMAGE, DRAW, EDIT, GUI */
/* global WIDTH, HEIGHT, canvas_front, canvas_back */

var LAYER = new LAYER_CLASS();

/**
 * layers class - manages layers
 * 
 * @author ViliusL
 */
function LAYER_CLASS() {

  /**
   * active layer index
   */
  this.layer_active = 0;

  /**
   * data layers array
   */
  this.layers = [];

  /**
   * latest layer index
   */
  var layer_max_index = 0;

  //new layer
  this.layer_new = function () {
    this.layer_add();
  };

  //removes all layers
  this.remove_all_layers = function () {
    //delete old layers
    for (var i = LAYER.layers.length - 1; i >= 0; i--) {
      LAYER.layer_remove(i, true);
    }
    layer_max_index = 0;
    this.layer_renew();
  };

  //create layer
  this.layer_add = function (name, data) {
    layer_max_index++;

    //save selected area
    var copy = false;
    var last_layer = LAYER.layer_active;
    if (DRAW.select_data != false && data == undefined) {
      copy = document.createElement("canvas");
      copy.width = DRAW.select_data.w;
      copy.height = DRAW.select_data.h;
      copy.getContext("2d").drawImage(canvas_active(true), DRAW.select_data.x, DRAW.select_data.y, DRAW.select_data.w, DRAW.select_data.h, 0, 0, DRAW.select_data.w, DRAW.select_data.h);
    }

    if (data == undefined) {
      //empty layer
      if (name == undefined) {
        name = 'Layer #' + (layer_max_index);
      }
      var new_layer = [];
      new_layer.name = name;
      new_layer.title = name;
      new_layer.visible = true;
      new_layer.opacity = 1;
      LAYER.create_canvas(name);
      this.layers.unshift(new_layer);

      //add selected data
      if (DRAW.select_data != false) {
        //copy user selected data to new layer
        canvas_active().drawImage(copy, 0, 0);

        //clear selection
        DRAW.select_data = false;
        canvas_front.clearRect(0, 0, WIDTH, HEIGHT);

        //switch back to old layer
        LAYER.layer_active = last_layer;
      }
    } else {
      var img = new Image();
      if (data.substring(0, 4) == 'http')
        img.crossOrigin = "Anonymous";	//data from other domain - turn on CORS
      var _this = this;

      img.onload = function () {
        //check size
        if (img.width > WIDTH || img.height > HEIGHT) {
          if (img.width > WIDTH)
            WIDTH = img.width;
          if (img.height > HEIGHT)
            HEIGHT = img.height;
          LAYER.set_canvas_size();
        }
        if (_this.layers.length == 1 && EVENTS.autosize == true) {
          var trim_info = IMAGE.trim_info(document.getElementById(_this.layers[0].name));
          if (trim_info.left == WIDTH) {
            _this.layer_remove(0, true);
            WIDTH = img.width;
            HEIGHT = img.height;
            LAYER.set_canvas_size(false);
          }
        }

        for (var i in _this.layers) {
          if (_this.layers[i].name == name) {
            name = 'Layer #' + (layer_max_index);
          }
        }
        LAYER.create_canvas(name);
        _this.layers.unshift({
          name: name,
          title: name,
          visible: true,
          opacity: 1
        });
        LAYER.layer_active = 0;

        document.getElementById(name).getContext("2d").globalAlpha = 1;
        document.getElementById(name).getContext('2d').drawImage(img, 0, 0);
        LAYER.layer_renew();
        IMAGE.zoom_auto(true);
        GUI.redraw_preview();
      };
      img.onerror = function (ex) {
        POP.add({html: '<b>The image could not be loaded.<br /><br /></b>'});
        if (data.substring(0, 4) == 'http')
          POP.add({title: "Reason:", value: 'Cross-origin resource sharing (CORS) not supported. Try to save image first.'});
        POP.show('Error', '.');
      };
      img.src = data;
    }
    LAYER.layer_active = 0;
    document.getElementById(this.layers[LAYER.layer_active].name).getContext("2d").globalAlpha = 1;
    this.layer_renew();
  };

  this.layer_remove = function (i, force) {
    if (this.layers.length == 1 && force == undefined) {
      //only 1 layer left
      canvas_active().clearRect(0, 0, WIDTH, HEIGHT);
      return false;
    }
    element = document.getElementById(this.layers[i].name);
    element.getContext("2d").clearRect(0, 0, WIDTH, HEIGHT);
    element.parentNode.removeChild(element);

    this.layers.splice(i, 1);
    if (LAYER.layer_active == i)
      LAYER.layer_active = Math.max(0, LAYER.layer_active - 1);
    this.layer_renew();
    GUI.redraw_preview();
  };

  //dublicate
  this.layer_dublicate = function () {
    EDIT.save_state();
    if (DRAW.select_data != false) {
      //selection
      EDIT.copy_to_clipboard();
      DRAW.select_data = false;
      canvas_front.clearRect(0, 0, WIDTH, HEIGHT);
      EDIT.paste('menu');
      LAYER.layer_active = 0;
      LAYER.layer_renew();
    } else {
      layer_max_index++;
      //copy all layer
      tmp_data = document.createElement("canvas");
      tmp_data.width = WIDTH;
      tmp_data.height = HEIGHT;
      tmp_data.getContext("2d").drawImage(canvas_active(true), 0, 0);

      //create
      var new_name = 'Layer #' + (layer_max_index);
      LAYER.create_canvas(new_name);
      this.layers.unshift({name: new_name, title: new_name, visible: true});
      LAYER.layer_active = 0;
      canvas_active().drawImage(tmp_data, 0, 0);
      LAYER.layer_renew();
    }
  };

  //show / hide
  this.layer_show_hide = function () {
    LAYER.layer_visibility(LAYER.layer_active);
  };

  //crop
  this.layer_crop = function () {
    EDIT.save_state();
    if (DRAW.select_data == false) {
      POP.add({html: 'Select area first'});
      POP.show('Error', '');
    } else {
      var layer = LAYER.canvas_active();

      var tmp = layer.getImageData(DRAW.select_data.x, DRAW.select_data.y, DRAW.select_data.w, DRAW.select_data.h);
      layer.clearRect(0, 0, WIDTH, HEIGHT);
      layer.putImageData(tmp, 0, 0);

      DRAW.select_data = false;
      canvas_front.clearRect(0, 0, WIDTH, HEIGHT);
    }
  };

  //delete
  this.layer_delete = function () {
    EDIT.save_state();
    LAYER.layer_remove(LAYER.layer_active);
  };

  //move up
  this.layer_move_up = function () {
    EDIT.save_state();
    LAYER.move_layer('up');
  };

  //move down
  this.layer_move_down = function () {
    EDIT.save_state();
    LAYER.move_layer('down');
  };

  //opacity
  this.layer_opacity = function () {
    LAYER.set_alpha();
  };

  //rename
  this.layer_rename = function () {
    var _this = this;
    POP.add({name: "param1", title: "Name:", value: this.layers[LAYER.layer_active].title});
    POP.show('Rename layer',
            function (user_response) {
              EDIT.save_state();
              var param1 = user_response.param1;

              _this.layers[LAYER.layer_active].title = param1;
              LAYER.layer_renew();
            }
    );
  };

  //trim
  this.layer_trim = function () {
    EDIT.save_state();
    IMAGE.trim(this.layers[LAYER.layer_active].name, true);
  };

  //resize
  this.layer_resize = function () {
    IMAGE.resize_box();
  };

  //clear
  this.layer_clear = function () {
    EDIT.save_state();
    canvas_active().clearRect(0, 0, WIDTH, HEIGHT);
  };

  //show differences
  this.layer_differences = function () {
    if (parseInt(LAYER.layer_active) + 1 >= this.layers.length) {
      POP.add({html: 'This can not be last layer'});
      POP.show('Error', '');
      return false;
    }

    POP.add({name: "param1", title: "Sensitivity:", value: "0", range: [0, 255]});
    POP.show(
            'Differences',
            function (response) {
              var param1 = parseInt(response.param1);
              LAYER.calc_differences(param1);
            },
            function (user_response, canvas_preview, w, h) {
              var param1 = parseInt(user_response.param1);
              LAYER.calc_differences(param1, canvas_preview, w, h);
            }
    );
  };

  //merge
  this.layer_merge_down = function () {
    var compositions = ["source-over", "source-in", "source-out", "source-atop",
      "destination-over", "destination-in", "destination-out", "destination-atop",
      "lighter", "darker", "copy", "xor"];

    var blend_modes = ["normal", "multiply", "screen", "overlay", "darken", "lighten",
      "color-dodge", "color-burn", "hard-light", "soft-light", "difference",
      "exclusion", "hue", "saturation", "color", "luminosity"];

    if (LAYER.layer_active + 1 >= this.layers.length) {
      POP.add({html: 'This can not be last layer.'});
      POP.show('Error', '');
      return false;
    }
    POP.add({name: "param1", title: "Composition:", values: compositions});
    POP.add({name: "param2", title: "Blend:", values: blend_modes});
    POP.add({name: "param3", title: "Mode:", values: ["Composite", "Blend"]});
    POP.show(
            'Merge',
            function (response) {
              var param1 = response.param1;
              var param2 = response.param2;
              var param3 = response.param3;

              EDIT.save_state();

              //copy
              var tmp_data = document.createElement("canvas");
              tmp_data.width = WIDTH;
              tmp_data.height = HEIGHT;
              tmp_data.getContext("2d").drawImage(LAYER.canvas_active(true), 0, 0);

              //paste
              LAYER.canvas_active().save();
              LAYER.canvas_active().clearRect(0, 0, WIDTH, HEIGHT);
              LAYER.canvas_active().drawImage(document.getElementById(LAYER.layers[LAYER.layer_active + 1].name), 0, 0);

              if (param3 == "Composite")
                LAYER.canvas_active().globalCompositeOperation = param1;
              else
                LAYER.canvas_active().globalCompositeOperation = param2;
              LAYER.canvas_active().drawImage(tmp_data, 0, 0);
              LAYER.canvas_active().restore();

              //remove next layer
              LAYER.layer_remove(LAYER.layer_active + 1);
              LAYER.layer_renew();
            },
            function (response, canvas_preview, w, h) {
              var param1 = response.param1;
              var param2 = response.param2;
              var param3 = response.param3;

              //paste
              canvas_preview.save();
              canvas_preview.clearRect(0, 0, w, h);
              LAYER.layer_active++;
              canvas_preview.drawImage(LAYER.canvas_active(true), 0, 0, WIDTH, HEIGHT, 0, 0, w, h);
              LAYER.layer_active--;

              if (param3 == "Composite")
                canvas_preview.globalCompositeOperation = param1;
              else
                canvas_preview.globalCompositeOperation = param2;
              canvas_preview.drawImage(LAYER.canvas_active(true), 0, 0, WIDTH, HEIGHT, 0, 0, w, h);
              canvas_preview.restore();
            }
    );
  };

  //flatten all
  this.layer_flatten = function () {
    EDIT.save_state();
    if (this.layers.length == 1)
      return false;
    LAYER.layer_active = 0;
    tmp_data = document.createElement("canvas");
    tmp_data.width = WIDTH;
    tmp_data.height = HEIGHT;
    for (var i = this.layers.length - 2; i >= 0; i--) {
      //copy
      LAYER.layer_active = i;
      tmp_data.getContext("2d").clearRect(0, 0, WIDTH, HEIGHT);
      tmp_data.getContext("2d").drawImage(canvas_active(true), 0, 0);

      //paste
      LAYER.layer_active = this.layers.length - 1;
      canvas_active().drawImage(tmp_data, 0, 0);
    }

    //delete layers
    for (var i = this.layers.length - 2; i >= 0; i--) {
      LAYER.layer_active = i;
      LAYER.layer_remove(LAYER.layer_active);
    }
    LAYER.layer_renew();
  };

  this.create_canvas = function (canvas_id) {
    var new_canvas = document.createElement('canvas');
    new_canvas.setAttribute('id', canvas_id);

    document.getElementById('canvas_more').appendChild(new_canvas);
    new_canvas.width = WIDTH;
    new_canvas.height = HEIGHT;

    new_canvas.getContext("2d").mozImageSmoothingEnabled = false;
    new_canvas.getContext("2d").webkitImageSmoothingEnabled = false;
    new_canvas.getContext("2d").msImageSmoothingEnabled = false;
    new_canvas.getContext("2d").imageSmoothingEnabled = false;

    //sync zoom
    new_canvas.style.width = Math.round(WIDTH * GUI.ZOOM / 100) + "px";
    new_canvas.style.height = Math.round(HEIGHT * GUI.ZOOM / 100) + "px";
  };
  this.move_layer = function (direction) {
    if (this.layers.length < 2)
      return false;

    var layer_from = this.layers[this.layer_active];
    var parent = document.getElementById('canvas_more');
    var content = document.getElementById(this.layers[this.layer_active].name);

    if (direction == 'up') {
      if (this.layer_active == 0)
        return false;
      var layer_to = this.layers[this.layer_active - 1];

      if (this.layer_active != 1)
        parent.insertBefore(content, document.getElementById(this.layers[this.layer_active - 2].name));
      else
        parent.insertBefore(content, null);

      this.layer_active--;
    } else if (direction == 'down') {
      if (this.layer_active == this.layers.length - 1)
        return false;

      parent.insertBefore(content, document.getElementById(this.layers[this.layer_active + 1].name));

      this.layer_active++;
    }
    //switch attribures
    var layer_to = this.layers[this.layer_active];
    for (var i in layer_to) {
      var tmp = layer_to[i];
      layer_to[i] = layer_from[i];
      layer_from[i] = tmp;
    }

    this.layer_renew();
    GUI.zoom();
    return true;
  };
  this.layer_visibility = function (i) {
    if (this.layers[i].visible == true) {
      this.layers[i].visible = false;
      document.getElementById(this.layers[i].name).style.visibility = 'hidden';
      document.getElementById('layer_' + i).src = "img/yes-grey.png";
    } else {
      this.layers[i].visible = true;
      document.getElementById(this.layers[i].name).style.visibility = 'visible';
      document.getElementById('layer_' + i).src = "img/yes.png";
    }
    this.layer_renew();
    GUI.redraw_preview();
  };

  this.layer_move_active = function (x, y) {
    var distance = 10;
    if (EVENTS.ctrl_pressed == true)
      distance = 50;
    if (EVENTS.shift_pressed == true)
      distance = 1;

    //move
    dx = x * distance;
    dy = y * distance;
    var tmp = canvas_active().getImageData(0, 0, WIDTH, HEIGHT);
    canvas_active().clearRect(0, 0, WIDTH, HEIGHT);
    canvas_active().putImageData(tmp, dx, dy);
  };
  this.select_layer = function (i) {
    if (LAYER.layer_active != i) {
      LAYER.layer_active = parseInt(i);	//select
      this.layer_renew();
    }
    LAYER.shake(i);
  };
  this.layer_renew = function () {
    var html = '';
    for (var i in this.layers) {
      //create
      if (LAYER.layer_active == i)
        html += '<div class="layer active">';
      else
        html += '<div class="layer">';
      var title = this.layers[i].title;
      html += '<span class="layer_title" ondblclick="LAYER.layer_rename();" onclick="LAYER.select_layer(\'' + i + '\')">' + HELPER.escapeHtml(title) + '</span>';
      html += '<a class="layer_visible" onclick="LAYER.layer_remove(\'' + i + '\');return false;" title="delete" href="#"></a>';
      //hide
      if (this.layers[i].visible == true)
        html += '<a class="layer_delete" id="layer_' + i + '" onclick="LAYER.layer_visibility(\'' + i + '\');return false;" title="hide" href="#"></a>';
      else
        html += '<a class="layer_delete layer_unvisible" id="layer_' + i + '" onclick="LAYER.layer_visibility(\'' + i + '\');return false;" title="show" href="#"></a>';

      html += '</div>';
      //show
      document.getElementById('layers').innerHTML = html;
    }
  };
  this.shake = function (i, nr) {
    var step = 3;
    var n = 10;

    if (nr == undefined) {
      //begin
      nr = 0;
      canvas_front.drawImage(canvas_active(true), 0, 0);
    }
    var dx = step * (nr % 2);
    if (dx == 0)
      dx = -step;

    var element = document.getElementById('canvas_front');
    element.style.marginLeft = dx + "px";
    if (nr < n)
      setTimeout(function () {
        LAYER.shake(i, nr + 1);
      }, 15);
    else {
      //finish shaking
      element.style.marginLeft = "0px";
      canvas_front.clearRect(0, 0, WIDTH, HEIGHT);
    }
  };
  this.update_info_block = function () {
    //show size
    document.getElementById('mouse_info_size').innerHTML = WIDTH + "x" + HEIGHT;

    //show mouse position
    var x = 0;
    var y = 0;
    if (EVENTS.mouse != undefined) {
      x = EVENTS.mouse.x;
      y = EVENTS.mouse.y;
    }
    document.getElementById('mouse_info_mouse').innerHTML = x + ", " + y;

    //show selected area info
    if (DRAW.select_data != false) {
      document.getElementById('mouse_info_xy').innerHTML = DRAW.select_data.x + ", " + DRAW.select_data.y;
      document.getElementById('mouse_info_area').innerHTML = DRAW.select_data.w + ", " + DRAW.select_data.h;

      document.getElementById('mouse_info_selected').style.display = 'block';
    } else {
      document.getElementById('mouse_info_xy').innerHTML = '';
      document.getElementById('mouse_info_area').innerHTML = '';
      document.getElementById('mouse_info_selected').style.display = 'none';
    }
  };
  this.set_canvas_size = function (repaint) {
    var ratio = WIDTH / HEIGHT;
    var W = Math.round(WIDTH);
    var H = Math.round(W / ratio);

    this.resize_canvas("canvas_back");
    GUI.draw_background(canvas_back, WIDTH, HEIGHT);
    this.resize_canvas("canvas_front", false);
    this.resize_canvas("canvas_grid", true);
    for (var i in this.layers) {
      if (repaint === false)
        this.resize_canvas(this.layers[i].name, false);
      else
        this.resize_canvas(this.layers[i].name, true);
    }

    GUI.draw_grid();

    document.getElementById('resize-w').style.marginLeft = W + "px";
    document.getElementById('resize-w').style.marginTop = Math.round(H / 2) + "px";
    document.getElementById('resize-h').style.marginLeft = Math.round(W / 2) + "px";
    document.getElementById('resize-h').style.marginTop = H + "px";
    document.getElementById('resize-wh').style.marginLeft = W + "px";
    document.getElementById('resize-wh').style.marginTop = H + "px";

    this.update_info_block();
    GUI.redraw_preview();
    GUI.zoom();
  };
  this.resize_canvas = function (canvas_name, repaint) {
    var ratio = WIDTH / HEIGHT;
    var W = Math.round(WIDTH);
    var H = Math.round(W / ratio);
    var canvas = document.getElementById(canvas_name);
    var ctx = canvas.getContext("2d");

    if (repaint == false) {
      canvas.width = W;
      canvas.height = H;
    } else {
      //save
      var buffer = document.createElement('canvas');
      buffer.width = WIDTH;
      buffer.height = HEIGHT;
      buffer.getContext('2d').drawImage(canvas, 0, 0);

      canvas.width = W;
      canvas.height = H;

      //restore
      ctx.drawImage(buffer, 0, 0);
    }
  };
  this.set_alpha = function () {
    var _this = this;
    if (this.layers[LAYER.layer_active].opacity == undefined)
      this.layers[LAYER.layer_active].opacity = 1;
    POP.add({name: "param1", title: "Alpha:", value: this.layers[LAYER.layer_active].opacity, range: [0, 1], step: 0.01});
    POP.show(
            'Opacity',
            function (user_response) {
              var param1 = parseFloat(user_response.param1);
              _this.layers[LAYER.layer_active].opacity = param1;
              canvas_active().globalAlpha = param1;

              var img = canvas_active().getImageData(0, 0, WIDTH, HEIGHT);
              var imgData = img.data;
              var new_alpha = 255 * param1;
              if (new_alpha < 10)
                new_alpha = 10;
              canvas_active().clearRect(0, 0, WIDTH, HEIGHT);
              for (var y = 0; y < img.height; y++) {
                for (var x = 0; x < img.width; x++) {
                  var k = ((y * (img.width * 4)) + (x * 4));
                  if (imgData[k + 3] > 0)
                    imgData[k + 3] = new_alpha;
                }
              }
              canvas_active().putImageData(img, 0, 0);

              GUI.zoom();
            }
    );
  };
  this.canvas_active = function (base) {
    if (base == undefined)
      return document.getElementById(LAYER.layers[LAYER.layer_active].name).getContext("2d");
    else
      return document.getElementById(LAYER.layers[LAYER.layer_active].name);
  };

  this.calc_differences = function (sensitivity, canvas_preview, w, h) {
    vlayer_active = parseInt(LAYER.layer_active);
    //first layer
    var img1 = canvas_active().getImageData(0, 0, WIDTH, HEIGHT);
    var imgData1 = img1.data;

    //second layer
    var context2 = document.getElementById(this.layers[vlayer_active + 1].name).getContext("2d");
    var img2 = context2.getImageData(0, 0, WIDTH, HEIGHT);
    var imgData2 = img2.data;

    //result layer
    if (canvas_preview == undefined) {
      //add differences layer
      LAYER.layer_add();
      canvas_active().rect(0, 0, WIDTH, HEIGHT);
      canvas_active().fillStyle = "#ffffff";
      canvas_active().fill();
      var img3 = canvas_active().getImageData(0, 0, WIDTH, HEIGHT);
    } else {
      //work on preview layer
      var canvas_tmp = document.createElement("canvas");
      canvas_tmp.width = WIDTH;
      canvas_tmp.height = HEIGHT;
      var img3 = canvas_tmp.getContext("2d").getImageData(0, 0, WIDTH, HEIGHT);
    }
    var imgData3 = img3.data;
    for (var xx = 0; xx < WIDTH; xx++) {
      for (var yy = 0; yy < HEIGHT; yy++) {
        var x = (xx + yy * WIDTH) * 4;
        if (Math.abs(imgData1[x] - imgData2[x]) > sensitivity
                || Math.abs(imgData1[x + 1] - imgData2[x + 1]) > sensitivity
                || Math.abs(imgData1[x + 2] - imgData2[x + 2]) > sensitivity
                || Math.abs(imgData1[x + 3] - imgData2[x + 3]) > sensitivity) {
          imgData3[x] = 255;
          imgData3[x + 1] = 0;
          imgData3[x + 2] = 0;
          imgData3[x + 3] = 255;
        }
      }
    }
    if (canvas_preview == undefined)
      canvas_active().putImageData(img3, 0, 0);
    else {
      canvas_tmp.getContext("2d").rect(0, 0, WIDTH, HEIGHT);
      canvas_tmp.getContext("2d").fillStyle = "#ffffff";
      canvas_tmp.getContext("2d").fill();
      canvas_tmp.getContext("2d").putImageData(img3, 0, 0);
      canvas_preview.clearRect(0, 0, w, h);

      canvas_preview.save();
      canvas_preview.scale(w / WIDTH, h / HEIGHT);
      canvas_preview.drawImage(canvas_tmp, 0, 0);
      canvas_preview.restore();
    }
  };

  var self = this
  self.reset_layers = function () {
    LAYER.remove_all_layers();
    LAYER.layers = [];
    LAYER.layer_add();
    LAYER.set_canvas_size();
  }
}

function canvas_active(base) {
  return LAYER.canvas_active(base);
}

/* global POP, MAIN, VINTAGE, ImageFilters, fx_filter, VINTAGE, fx, HELPER, EVENTS, EDIT, GUI */
/* global WIDTH, HEIGHT, canvas_active, canvas_front */

var EFFECTS = new EFFECTS_CLASS();

/** 
 * manages effects
 * 
 * @author ViliusL
 */
function EFFECTS_CLASS() {

  this.FILTERS_LIST = [
    {title: 'Black and White', name: 'effects_bw'},
    {title: 'Blur-Box', name: 'effects_BoxBlur'},
    {title: 'Blur-Gaussian', name: 'effects_GaussianBlur'},
    {title: 'Blur-Stack', name: 'effects_StackBlur'},
    {title: 'Blur-Zoom', name: 'effects_zoomblur'},
    {title: 'Bulge/Pinch', name: 'effects_bulge_pinch'},
    {title: 'Colorize', name: 'effects_colorize'},
    {title: 'Denoise', name: 'effects_denoise'},
    {title: 'Desaturate', name: 'effects_Desaturate'},
    {title: 'Dither', name: 'effects_Dither'},
    {title: 'Dot Screen', name: 'effects_dot_screen'},
    {title: 'Edge', name: 'effects_Edge'},
    {title: 'Emboss', name: 'effects_Emboss'},
    {title: 'Enrich', name: 'effects_Enrich'},
    {title: 'Gamma', name: 'effects_Gamma'},
    {title: 'Grains', name: 'effects_Grains'},
    {title: 'Heatmap', name: 'effects_heatmap'},
    {title: 'HSL Adjustment', name: 'effects_HSLAdjustment'},
    {title: 'JPG Compression', name: 'effects_jpg_vintage'},
    {title: 'Mosaic', name: 'effects_Mosaic'},
    {title: 'Oil', name: 'effects_Oil'},
    {title: 'Posterize', name: 'effects_Posterize'},
    {title: 'Sepia', name: 'effects_Sepia'},
    {title: 'Sharpen', name: 'effects_Sharpen'},
    {title: 'Solarize', name: 'effects_Solarize'},
    {title: 'Tilt Shift', name: 'effects_tilt_shift'},
    {title: 'Vignette', name: 'effects_vignette'},
    {title: 'Vintage', name: 'effects_vintage'},
  ];

  var fx_filter = false;

  this.load_fx = function () {
    //load FX lib
    if (fx_filter == false) {
      fx_filter = fx.canvas();
    }
  };

  this.effects_bw = function () {
    var default_level = this.thresholding('otsu', canvas_active(), WIDTH, HEIGHT, true);
    POP.add({name: "param1", title: "Level:", value: default_level, range: [0, 255]});
    POP.add({name: "param2", title: "Dithering:", values: ['No', 'Yes'], onchange: "EFFECTS.effects_bw_onchange()"});
    POP.effects = true;
    POP.show('Black and White',
            function (user_response) {
              EDIT.save_state();
              var param1 = parseInt(user_response.param1);
              var param2 = false;
              if (user_response.param2 == 'Yes')
                param2 = true;

              EFFECTS.effect_bw(canvas_active(), WIDTH, HEIGHT, param1, param2);
              GUI.zoom();
            },
            function (user_response, canvas_preview, w, h) {
              var param1 = parseInt(user_response.param1);
              var param2 = false;
              if (user_response.param2 == 'Yes')
                param2 = true;

              EFFECTS.effect_bw(canvas_preview, w, h, param1, param2);
            }
    );
  };

  this.effects_bw_onchange = function () {
    var levels = document.getElementById("pop_data_param1");
    var dithering_no = document.getElementById("pop_data_param2_poptmp0");
    var dithering_yes = document.getElementById("pop_data_param2_poptmp1");

    if (dithering_no.checked == true)
      levels.disabled = false;
    else if (dithering_yes.checked == true)
      levels.disabled = true;

    POP.view();
  };

  this.effects_BoxBlur = function () {
    POP.add({name: "param1", title: "H Radius:", value: "3", range: [1, 20]});
    POP.add({name: "param2", title: "V Radius:", value: "3", range: [1, 20]});
    POP.add({name: "param3", title: "Quality:", value: "2", range: [1, 10]});
    POP.effects = true;
    POP.show('Blur-Box',
            function (user_response) {
              EDIT.save_state();
              var param1 = parseInt(user_response.param1);
              var param2 = parseInt(user_response.param2);
              var param3 = parseInt(user_response.param3);

              var imageData = canvas_active().getImageData(0, 0, WIDTH, HEIGHT);
              var filtered = ImageFilters.BoxBlur(imageData, param1, param2, param3);	//add effect
              canvas_active().putImageData(filtered, 0, 0);
              GUI.zoom();
            },
            function (user_response, canvas_preview, w, h) {
              var param1 = parseInt(user_response.param1);
              var param2 = parseInt(user_response.param2);
              var param3 = parseInt(user_response.param3);
              var imageData = canvas_preview.getImageData(0, 0, w, h);
              var filtered = ImageFilters.BoxBlur(imageData, param1, param2, param3);	//add effect
              canvas_preview.putImageData(filtered, 0, 0);
            }
    );
  };

  this.effects_GaussianBlur = function () {
    POP.add({name: "param1", title: "Strength:", value: "2", range: [1, 4], step: 0.1});
    POP.effects = true;
    POP.show('Blur-Gaussian',
            function (user_response) {
              EDIT.save_state();
              var param1 = parseFloat(user_response.param1);

              var imageData = canvas_active().getImageData(0, 0, WIDTH, HEIGHT);
              var filtered = ImageFilters.GaussianBlur(imageData, param1);	//add effect
              canvas_active().putImageData(filtered, 0, 0);
              GUI.zoom();
            },
            function (user_response, canvas_preview, w, h) {
              var param1 = parseFloat(user_response.param1);

              var imageData = canvas_preview.getImageData(0, 0, w, h);
              var filtered = ImageFilters.GaussianBlur(imageData, param1);	//add effect
              canvas_preview.putImageData(filtered, 0, 0);
            }
    );
  };

  this.effects_StackBlur = function () {
    POP.add({name: "param1", title: "Radius:", value: "6", range: [1, 40]});
    POP.effects = true;
    POP.show('Blur-Stack',
            function (user_response) {
              EDIT.save_state();
              var param1 = parseInt(user_response.param1);

              var imageData = canvas_active().getImageData(0, 0, WIDTH, HEIGHT);
              var filtered = ImageFilters.StackBlur(imageData, param1);	//add effect
              canvas_active().putImageData(filtered, 0, 0);
              GUI.zoom();
            },
            function (user_response, canvas_preview, w, h) {
              var param1 = parseInt(user_response.param1);
              var imageData = canvas_preview.getImageData(0, 0, w, h);
              var filtered = ImageFilters.StackBlur(imageData, param1);	//add effect
              canvas_preview.putImageData(filtered, 0, 0);
            }
    );
  };

  this.effects_zoomblur = function () {
    this.load_fx();

    POP.add({name: "param1", title: "Strength:", value: "0.3", range: [0, 1], step: 0.01});
    POP.add({name: "param2", title: "Center x:", value: Math.round(WIDTH / 2), range: [0, WIDTH]});
    POP.add({name: "param3", title: "Center y:", value: Math.round(HEIGHT / 2), range: [0, HEIGHT]});
    POP.effects = true;
    POP.show('Blur-Zoom',
            function (user_response) {
              EDIT.save_state();
              var param1 = parseFloat(user_response.param1);
              var param2 = parseInt(user_response.param2);
              var param3 = parseInt(user_response.param3);

              var texture = fx_filter.texture(canvas_active(true));
              fx_filter.draw(texture).zoomBlur(param2, param3, param1).update();	//effect
              canvas_active().clearRect(0, 0, WIDTH, HEIGHT);
              canvas_active().drawImage(fx_filter, 0, 0);
              GUI.zoom();
            },
            function (user_response, canvas_preview, w, h) {
              var param1 = parseFloat(user_response.param1);
              var param2 = parseInt(user_response.param2);
              var param3 = parseInt(user_response.param3);

              //recalc param by size
              param2 = param2 / WIDTH * w;
              param3 = param3 / HEIGHT * h;

              var texture = fx_filter.texture(canvas_preview.getImageData(0, 0, w, h));
              fx_filter.draw(texture).zoomBlur(param2, param3, param1).update();	//effect
              canvas_preview.drawImage(fx_filter, 0, 0);

              //draw circle
              canvas_preview.beginPath();
              canvas_preview.strokeStyle = "#ff0000";
              canvas_preview.lineWidth = 1;
              canvas_preview.beginPath();
              canvas_preview.arc(param2, param3, 5, 0, Math.PI * 2, true);
              canvas_preview.stroke();
            }
    );
  };

  this.effects_bulge_pinch = function () {
    this.load_fx();

    POP.add({name: "param1", title: "Strength:", value: 1, range: [-1, 1], step: 0.1});
    var default_value = Math.min(WIDTH, HEIGHT);
    default_value = Math.round(default_value / 2);
    POP.add({name: "param2", title: "Radius:", value: default_value, range: [0, 600]});
    POP.effects = true;
    POP.show('Bulge/Pinch',
            function (user_response) {
              EDIT.save_state();
              var param1 = parseFloat(user_response.param1);
              var param2 = parseInt(user_response.param2);

              var texture = fx_filter.texture(canvas_active(true));
              fx_filter.draw(texture).bulgePinch(Math.round(WIDTH / 2), Math.round(HEIGHT / 2), param2, param1).update();	//effect
              canvas_active().clearRect(0, 0, WIDTH, HEIGHT);
              canvas_active().drawImage(fx_filter, 0, 0);
              GUI.zoom();
            },
            function (user_response, canvas_preview, w, h) {
              var param1 = parseFloat(user_response.param1);
              var param2 = parseInt(user_response.param2);

              //recalc param by size
              param2 = param2 / Math.min(WIDTH, HEIGHT) * Math.min(w, h);

              var texture = fx_filter.texture(canvas_preview.getImageData(0, 0, w, h));
              fx_filter.draw(texture).bulgePinch(Math.round(w / 2), Math.round(h / 2), param2, param1).update();	//effect
              canvas_preview.drawImage(fx_filter, 0, 0);
            }
    );
  };

  this.effects_colorize = function () {
    var _this = this;
    var colorize_data;

    POP.add({name: "param1", title: "Power:", value: "3", range: [1, 10]});
    POP.add({name: "param2", title: "Limit:", value: "30", range: [10, 200]});
    POP.add({name: "param3", title: "Dithering:", values: ["Yes", "No"]});
    POP.preview_in_main = true;
    POP.effects = true;
    POP.show('Auto colorize',
            function (user_response) {
              EDIT.save_state();
              var param1 = parseInt(user_response.param1);
              var param2 = parseInt(user_response.param2);
              if (user_response.param3 == 'Yes')
                param3 = true;

              else
                param3 = false;

              _this.colorize(canvas_active(), WIDTH, HEIGHT, param1, param2, param3, colorize_data);
              GUI.zoom();
              canvas_front.clearRect(0, 0, WIDTH, HEIGHT);
            },
            function (user_response) {
              POP.preview_in_main = true;
              var param1 = parseInt(user_response.param1);
              var param2 = parseInt(user_response.param2);
              if (user_response.param3 == 'Yes')
                param3 = true;
              else
                param3 = false;

              colorize_data = _this.colorize(false, WIDTH, HEIGHT, param1, param2, param3, true);
              canvas_front.clearRect(0, 0, WIDTH, HEIGHT);
              canvas_front.drawImage(canvas_active(true), 0, 0);
              _this.colorize(canvas_front, WIDTH, HEIGHT, param1, param2, param3, colorize_data);
            }
    );
  };

  this.effects_denoise = function () {
    this.load_fx();

    POP.add({name: "param1", title: "Exponent:", value: "20", range: [0, 50]});
    POP.effects = true;
    POP.show('Denoise',
            function (user_response) {
              EDIT.save_state();
              var param1 = parseFloat(user_response.param1);

              var texture = fx_filter.texture(canvas_active(true));
              fx_filter.draw(texture).denoise(param1).update();	//effect
              canvas_active().clearRect(0, 0, WIDTH, HEIGHT);
              canvas_active().drawImage(fx_filter, 0, 0);
              GUI.zoom();
            },
            function (user_response, canvas_preview, w, h) {
              var param1 = parseFloat(user_response.param1);

              var texture = fx_filter.texture(canvas_preview.getImageData(0, 0, w, h));
              fx_filter.draw(texture).denoise(param1).update();	//effect
              canvas_preview.drawImage(fx_filter, 0, 0);
            }
    );
  };

  this.effects_Desaturate = function () {
    POP.effects = true;
    POP.show('Desaturate',
            function (user_response) {
              EDIT.save_state();
              var imageData = canvas_active().getImageData(0, 0, WIDTH, HEIGHT);
              var filtered = ImageFilters.Desaturate(imageData);	//add effect
              canvas_active().putImageData(filtered, 0, 0);
              GUI.zoom();
            },
            function (user_response, canvas_preview, w, h) {
              var imageData = canvas_preview.getImageData(0, 0, w, h);
              var filtered = ImageFilters.Desaturate(imageData);	//add effect
              canvas_preview.putImageData(filtered, 0, 0);
            }
    );
  };

  this.effects_Dither = function () {
    POP.add({name: "param1", title: "Levels:", value: "8", range: [2, 32]});
    POP.effects = true;
    POP.show('Dither',
            function (user_response) {
              EDIT.save_state();
              var param1 = parseInt(user_response.param1);

              var imageData = canvas_active().getImageData(0, 0, WIDTH, HEIGHT);
              var filtered = ImageFilters.Dither(imageData, param1);	//add effect
              canvas_active().putImageData(filtered, 0, 0);
              GUI.zoom();
            },
            function (user_response, canvas_preview, w, h) {
              var param1 = parseInt(user_response.param1);
              var imageData = canvas_preview.getImageData(0, 0, w, h);
              var filtered = ImageFilters.Dither(imageData, param1);	//add effect
              canvas_preview.putImageData(filtered, 0, 0);
            }
    );
  };

  this.effects_dot_screen = function () {
    this.load_fx();

    POP.add({name: "param2", title: "Size:", value: "3", range: [1, 20]});
    POP.effects = true;
    POP.show('Dot Screen',
            function (user_response) {
              EDIT.save_state();
              var param2 = parseInt(user_response.param2);

              var texture = fx_filter.texture(canvas_active(true));
              fx_filter.draw(texture).dotScreen(Math.round(WIDTH / 2), Math.round(HEIGHT / 2), 0, param2).update();	//effect
              canvas_active().clearRect(0, 0, WIDTH, HEIGHT);
              canvas_active().drawImage(fx_filter, 0, 0);
              GUI.zoom();
            },
            function (user_response, canvas_preview, w, h) {
              var param2 = parseInt(user_response.param2);

              var texture = fx_filter.texture(canvas_preview.getImageData(0, 0, w, h));
              fx_filter.draw(texture).dotScreen(Math.round(w / 2), Math.round(h / 2), 0, param2).update();	//effect
              canvas_preview.drawImage(fx_filter, 0, 0);
            }
    );
  };

  this.effects_Edge = function () {
    POP.effects = true;
    POP.show('Edge',
            function (user_response) {
              EDIT.save_state();
              var imageData = canvas_active().getImageData(0, 0, WIDTH, HEIGHT);
              var filtered = ImageFilters.Edge(imageData);	//add effect
              canvas_active().putImageData(filtered, 0, 0);
              GUI.zoom();
            },
            function (user_response, canvas_preview, w, h) {
              var imageData = canvas_preview.getImageData(0, 0, w, h);
              var filtered = ImageFilters.Edge(imageData);	//add effect
              canvas_preview.putImageData(filtered, 0, 0);
            }
    );
  };

  this.effects_Emboss = function () {
    POP.effects = true;
    POP.show('Emboss',
            function (user_response) {
              EDIT.save_state();
              var imageData = canvas_active().getImageData(0, 0, WIDTH, HEIGHT);
              var filtered = ImageFilters.Emboss(imageData);	//add effect
              canvas_active().putImageData(filtered, 0, 0);
              GUI.zoom();
            },
            function (user_response, canvas_preview, w, h) {
              var imageData = canvas_preview.getImageData(0, 0, w, h);
              var filtered = ImageFilters.Emboss(imageData);	//add effect
              canvas_preview.putImageData(filtered, 0, 0);
            }
    );
  };

  this.effects_Enrich = function () {
    POP.effects = true;
    POP.show('Enrich',
            function (user_response) {
              EDIT.save_state();
              var imageData = canvas_active().getImageData(0, 0, WIDTH, HEIGHT);
              var filtered = ImageFilters.Enrich(imageData);	//add effect
              canvas_active().putImageData(filtered, 0, 0);
              GUI.zoom();
            },
            function (user_response, canvas_preview, w, h) {
              var imageData = canvas_preview.getImageData(0, 0, w, h);
              var filtered = ImageFilters.Enrich(imageData);	//add effect
              canvas_preview.putImageData(filtered, 0, 0);
            }
    );
  };

  this.effects_Gamma = function () {
    POP.add({name: "param1", title: "Gamma:", value: "1", range: [0, 3], step: 0.1});
    POP.effects = true;
    POP.show('Gamma',
            function (user_response) {
              EDIT.save_state();
              var param1 = parseFloat(user_response.param1);

              var imageData = canvas_active().getImageData(0, 0, WIDTH, HEIGHT);
              var filtered = ImageFilters.Gamma(imageData, param1);	//add effect
              canvas_active().putImageData(filtered, 0, 0);
              GUI.zoom();
            },
            function (user_response, canvas_preview, w, h) {
              var param1 = parseFloat(user_response.param1);

              var imageData = canvas_preview.getImageData(0, 0, w, h);
              var filtered = ImageFilters.Gamma(imageData, param1);	//add effect
              canvas_preview.putImageData(filtered, 0, 0);
            }
    );
  };

  this.effects_Grains = function () {
    var _this = this;
    POP.effects = true;
    POP.add({name: "param1", title: "Level:", value: "30", range: [0, 50]});
    POP.show('Grains',
            function (user_response) {
              var param1 = parseInt(user_response.param1);
              EDIT.save_state();
              _this.grains_effect(canvas_active(), WIDTH, HEIGHT, param1);
            },
            function (user_response, canvas_preview, w, h) {
              var param1 = parseInt(user_response.param1);
              _this.grains_effect(canvas_preview, w, h, param1);
            }
    );
  };

  this.effects_heatmap = function () {
    var _this = this;
    POP.effects = true;
    POP.show('Heatmap',
            function (user_response) {
              EDIT.save_state();
              _this.heatmap_effect(canvas_active(), WIDTH, HEIGHT);
            },
            function (user_response, canvas_preview, w, h) {
              _this.heatmap_effect(canvas_preview, w, h);
            }
    );
  };

  this.effects_HSLAdjustment = function () {
    POP.add({name: "param1", title: "Hue:", value: "0", range: [-180, 180]});
    POP.add({name: "param2", title: "Saturation:", value: "0", range: [-100, 100]});
    POP.add({name: "param3", title: "Luminance:", value: "0", range: [-100, 100]});
    POP.effects = true;
    POP.show('HSL Adjustment',
            function (user_response) {
              EDIT.save_state();
              var param1 = parseInt(user_response.param1);
              var param2 = parseInt(user_response.param2);
              var param3 = parseInt(user_response.param3);

              var imageData = canvas_active().getImageData(0, 0, WIDTH, HEIGHT);
              var filtered = ImageFilters.HSLAdjustment(imageData, param1, param2, param3);	//add effect
              canvas_active().putImageData(filtered, 0, 0);
              GUI.zoom();
            },
            function (user_response, canvas_preview, w, h) {
              var param1 = parseInt(user_response.param1);
              var param2 = parseInt(user_response.param2);
              var param3 = parseInt(user_response.param3);
              var imageData = canvas_preview.getImageData(0, 0, w, h);
              var filtered = ImageFilters.HSLAdjustment(imageData, param1, param2, param3);	//add effect
              canvas_preview.putImageData(filtered, 0, 0);
            }
    );
  };

  //ages photo saving it to jpg many times
  this.effects_jpg_vintage = function () {
    POP.add({name: "param1", title: "Quality:", value: 80, range: [1, 100]});
    POP.effects = true;
    POP.show('JPG Compression',
            function (user_response) {
              EDIT.save_state();
              var quality = parseInt(user_response.param1);
              if (quality > 100 || quality < 1 || isNaN(quality) == true)
                quality = 80;
              quality = quality / 100;
              var data = canvas_active(true).toDataURL('image/jpeg', quality);
              var img = new Image;
              img.onload = function () {
                canvas_active().clearRect(0, 0, WIDTH, HEIGHT);
                canvas_active().drawImage(img, 0, 0);
              };
              img.src = data;
              GUI.zoom();
            },
            function (user_response, canvas_preview, w, h) {
              var quality = parseInt(user_response.param1);
              if (quality > 100 || quality < 1 || isNaN(quality) == true)
                quality = 80;
              quality = quality / 100;
              var element = document.getElementById("pop_post");
              var data = element.toDataURL('image/jpeg', quality);
              var img = new Image;
              img.onload = function () {
                canvas_preview.clearRect(0, 0, w, h);
                canvas_preview.drawImage(img, 0, 0);
              };
              img.src = data;
            }
    );
  };

  this.effects_Mosaic = function () {
    POP.add({name: "param1", title: "Size:", value: "10", range: [1, 100]});
    POP.effects = true;
    POP.show('Mosaic',
            function (user_response) {
              EDIT.save_state();
              var param1 = parseInt(user_response.param1);

              var imageData = canvas_active().getImageData(0, 0, WIDTH, HEIGHT);
              var filtered = ImageFilters.Mosaic(imageData, param1);	//add effect
              canvas_active().putImageData(filtered, 0, 0);
              GUI.zoom();
            },
            function (user_response, canvas_preview, w, h) {
              var param1 = parseInt(user_response.param1);
              var imageData = canvas_preview.getImageData(0, 0, w, h);
              var filtered = ImageFilters.Mosaic(imageData, param1);	//add effect
              canvas_preview.putImageData(filtered, 0, 0);
            }
    );
  };

  this.effects_Oil = function () {
    POP.add({name: "param1", title: "Range:", value: "2", range: [1, 5]});
    POP.add({name: "param2", title: "Levels:", value: "32", range: [1, 256]});
    POP.effects = true;
    POP.show('Oil',
            function (user_response) {
              EDIT.save_state();
              var param1 = parseInt(user_response.param1);
              var param2 = parseInt(user_response.param2);

              var imageData = canvas_active().getImageData(0, 0, WIDTH, HEIGHT);
              var filtered = ImageFilters.Oil(imageData, param1, param2);	//add effect
              canvas_active().putImageData(filtered, 0, 0);
              GUI.zoom();
            },
            function (user_response, canvas_preview, w, h) {
              var param1 = parseInt(user_response.param1);
              var param2 = parseInt(user_response.param2);
              var imageData = canvas_preview.getImageData(0, 0, w, h);
              var filtered = ImageFilters.Oil(imageData, param1, param2);	//add effect
              canvas_preview.putImageData(filtered, 0, 0);
            }
    );
  };

  this.effects_perspective = function () {
    this.load_fx();

    POP.add({name: "param1", title: "X1:", value: WIDTH / 4, range: [0, WIDTH]});
    POP.add({name: "param2", title: "Y1:", value: HEIGHT / 4, range: [0, HEIGHT]});
    POP.add({name: "param3", title: "X2:", value: WIDTH * 3 / 4, range: [0, WIDTH]});
    POP.add({name: "param4", title: "Y2:", value: HEIGHT / 4, range: [0, HEIGHT]});
    POP.add({name: "param5", title: "X3:", value: WIDTH * 3 / 4, range: [0, WIDTH]});
    POP.add({name: "param6", title: "Y3:", value: HEIGHT * 3 / 4, range: [0, HEIGHT]});
    POP.add({name: "param7", title: "X4:", value: WIDTH / 4, range: [0, WIDTH]});
    POP.add({name: "param8", title: "Y4:", value: HEIGHT * 3 / 4, range: [0, HEIGHT]});
    POP.preview_in_main = true;
    POP.effects = true;
    POP.show('Perspective',
            function (user_response) {
              EDIT.save_state();
              var param1 = parseInt(user_response.param1);
              var param2 = parseInt(user_response.param2);
              var param3 = parseInt(user_response.param3);
              var param4 = parseInt(user_response.param4);
              var param5 = parseInt(user_response.param5);
              var param6 = parseInt(user_response.param6);
              var param7 = parseInt(user_response.param7);
              var param8 = parseInt(user_response.param8);

              var texture = fx_filter.texture(canvas_active(true));
              fx_filter.draw(texture).perspective([WIDTH / 4, HEIGHT / 4, WIDTH * 3 / 4, HEIGHT / 4, WIDTH * 3 / 4, HEIGHT * 3 / 4, WIDTH / 4, HEIGHT * 3 / 4], [param1, param2, param3, param4, param5, param6, param7, param8]).update();	//effect
              canvas_active().clearRect(0, 0, WIDTH, HEIGHT);
              canvas_active().drawImage(fx_filter, 0, 0);
              GUI.zoom();
            },
            function (user_response) {
              var param1 = parseInt(user_response.param1);
              var param2 = parseInt(user_response.param2);
              var param3 = parseInt(user_response.param3);
              var param4 = parseInt(user_response.param4);
              var param5 = parseInt(user_response.param5);
              var param6 = parseInt(user_response.param6);
              var param7 = parseInt(user_response.param7);
              var param8 = parseInt(user_response.param8);

              canvas_front.rect(0, 0, WIDTH, HEIGHT);
              canvas_front.fillStyle = "#ffffff";
              canvas_front.fill();

              var texture = fx_filter.texture(canvas_active(true));
              fx_filter.draw(texture).perspective([WIDTH / 4, HEIGHT / 4, WIDTH * 3 / 4, HEIGHT / 4, WIDTH * 3 / 4, HEIGHT * 3 / 4, WIDTH / 4, HEIGHT * 3 / 4], [param1, param2, param3, param4, param5, param6, param7, param8]).update();	//effect
              canvas_front.drawImage(fx_filter, 0, 0);

              pers_square(param1, param2);
              pers_square(param3, param4);
              pers_square(param5, param6);
              pers_square(param7, param8);
            }
    );

    function pers_square(x, y) {
      canvas_front.beginPath();
      canvas_front.rect(x - round(EVENTS.sr_size / 2), y - round(EVENTS.sr_size / 2), EVENTS.sr_size, EVENTS.sr_size);
      canvas_front.fillStyle = "#0000c8";
      canvas_front.fill();
    }
  };

  this.effects_Posterize = function () {
    POP.add({name: "param1", title: "Levels:", value: "8", range: [2, 32]});
    POP.effects = true;
    POP.show('Posterize',
            function (user_response) {
              EDIT.save_state();
              var param1 = parseInt(user_response.param1);

              var imageData = canvas_active().getImageData(0, 0, WIDTH, HEIGHT);
              var filtered = ImageFilters.Posterize(imageData, param1);	//add effect
              canvas_active().putImageData(filtered, 0, 0);
              GUI.zoom();
            },
            function (user_response, canvas_preview, w, h) {
              var param1 = parseInt(user_response.param1);
              var imageData = canvas_preview.getImageData(0, 0, w, h);
              var filtered = ImageFilters.Posterize(imageData, param1);	//add effect
              canvas_preview.putImageData(filtered, 0, 0);
            }
    );
  };

  this.effects_Sepia = function () {
    POP.effects = true;
    POP.show('Sepia',
            function (user_response) {
              EDIT.save_state();
              var imageData = canvas_active().getImageData(0, 0, WIDTH, HEIGHT);
              var filtered = ImageFilters.Sepia(imageData);	//add effect
              canvas_active().putImageData(filtered, 0, 0);
            },
            function (user_response, canvas_preview, w, h) {
              var imageData = canvas_preview.getImageData(0, 0, w, h);
              var filtered = ImageFilters.Sepia(imageData);	//add effect
              canvas_preview.putImageData(filtered, 0, 0);
            }
    );
  };

  this.effects_Sharpen = function () {
    POP.add({name: "param1", title: "Factor:", value: "3", range: [1, 10], step: 0.1});
    POP.effects = true;
    POP.show('Sharpen',
            function (user_response) {
              EDIT.save_state();
              var param1 = parseFloat(user_response.param1);
              var imageData = canvas_active().getImageData(0, 0, WIDTH, HEIGHT);
              var filtered = ImageFilters.Sharpen(imageData, param1);	//add effect
              canvas_active().putImageData(filtered, 0, 0);
              GUI.zoom();
            },
            function (user_response, canvas_preview, w, h) {
              var param1 = parseFloat(user_response.param1);
              var imageData = canvas_preview.getImageData(0, 0, w, h);
              var filtered = ImageFilters.Sharpen(imageData, param1);	//add effect
              canvas_preview.putImageData(filtered, 0, 0);
            }
    );
  };

  this.effects_Solarize = function () {
    POP.effects = true;
    POP.show('Solarize',
            function (user_response) {
              EDIT.save_state();
              var imageData = canvas_active().getImageData(0, 0, WIDTH, HEIGHT);
              var filtered = ImageFilters.Solarize(imageData);	//add effect
              canvas_active().putImageData(filtered, 0, 0);
            },
            function (user_response, canvas_preview, w, h) {
              var imageData = canvas_preview.getImageData(0, 0, w, h);
              var filtered = ImageFilters.Solarize(imageData);	//add effect
              canvas_preview.putImageData(filtered, 0, 0);
            }
    );
  };

  this.effects_tilt_shift = function () {
    this.load_fx();

    //extra
    POP.add({name: "param7", title: "Saturation:", value: "3", range: [0, 100]});
    POP.add({name: "param8", title: "Sharpen:", value: "1", range: [1, 10]});
    //main
    POP.add({name: "param1", title: "Blur Radius:", value: "15", range: [0, 50]});
    POP.add({name: "param2", title: "Gradient Radius:", value: "200", range: [0, 400]});
    //startX, startY, endX, endY
    POP.add({name: "param3", title: "X start:", value: "0", range: [0, WIDTH]});
    POP.add({name: "param4", title: "Y start:", value: Math.round(HEIGHT / 2), range: [0, HEIGHT]});
    POP.add({name: "param5", title: "X end:", value: WIDTH, range: [0, WIDTH]});
    POP.add({name: "param6", title: "Y end:", value: Math.round(HEIGHT / 2), range: [0, HEIGHT]});
    POP.effects = true;
    POP.show('Tilt Shift',
            function (user_response) {
              EDIT.save_state();
              var param1 = parseInt(user_response.param1);
              var param2 = parseInt(user_response.param2);
              var param3 = parseInt(user_response.param3);
              var param4 = parseInt(user_response.param4);
              var param5 = parseInt(user_response.param5);
              var param6 = parseInt(user_response.param6);
              var param7 = parseInt(user_response.param7);
              var param8 = parseInt(user_response.param8);

              //main effect
              var texture = fx_filter.texture(canvas_active(true));
              fx_filter.draw(texture).tiltShift(param3, param4, param5, param6, param1, param2).update();	//effect
              canvas_active().clearRect(0, 0, WIDTH, HEIGHT);
              canvas_active().drawImage(fx_filter, 0, 0);

              //saturation
              var imageData = canvas_active().getImageData(0, 0, WIDTH, HEIGHT);
              var filtered = ImageFilters.HSLAdjustment(imageData, 0, param7, 0);
              canvas_active().putImageData(filtered, 0, 0);

              //sharpen
              var imageData = canvas_active().getImageData(0, 0, WIDTH, HEIGHT);
              var filtered = ImageFilters.Sharpen(imageData, param8);
              canvas_active().putImageData(filtered, 0, 0);

              GUI.zoom();
            },
            function (user_response, canvas_preview, w, h) {
              var param1 = parseInt(user_response.param1);
              var param2 = parseInt(user_response.param2);
              var param3 = parseInt(user_response.param3);
              var param4 = parseInt(user_response.param4);
              var param5 = parseInt(user_response.param5);
              var param6 = parseInt(user_response.param6);
              var param7 = parseInt(user_response.param7);
              var param8 = parseInt(user_response.param8);

              //recalc param by size
              var param3 = param3 / WIDTH * w;
              var param4 = param4 / HEIGHT * h;
              var param5 = param5 / WIDTH * w;
              var param6 = param6 / HEIGHT * h;

              //main effect
              var texture = fx_filter.texture(canvas_preview.getImageData(0, 0, w, h));
              fx_filter.draw(texture).tiltShift(param3, param4, param5, param6, param1, param2).update();	//effect
              canvas_preview.drawImage(fx_filter, 0, 0);

              //saturation
              var imageData = canvas_preview.getImageData(0, 0, w, h);
              var filtered = ImageFilters.HSLAdjustment(imageData, 0, param7, 0);
              canvas_preview.putImageData(filtered, 0, 0);

              //sharpen
              var imageData = canvas_preview.getImageData(0, 0, w, h);
              var filtered = ImageFilters.Sharpen(imageData, param8);
              canvas_preview.putImageData(filtered, 0, 0);

              //draw line
              canvas_preview.beginPath();
              canvas_preview.strokeStyle = "#ff0000";
              canvas_preview.lineWidth = 1;
              canvas_preview.moveTo(param3 + 0.5, param4 + 0.5);
              canvas_preview.lineTo(param5 + 0.5, param6 + 0.5);
              canvas_preview.stroke();
            }
    );
  };

  this.effects_vignette = function () {
    this.load_fx();

    POP.add({name: "param1", title: "Size:", value: "0.5", range: [0, 1], step: 0.01});
    POP.add({name: "param2", title: "Amount:", value: "0.5", range: [0, 1], step: 0.01});
    POP.effects = true;
    POP.show('Vignette',
            function (user_response) {
              EDIT.save_state();
              var param1 = parseFloat(user_response.param1);
              var param2 = parseFloat(user_response.param2);

              var texture = fx_filter.texture(canvas_active(true));
              fx_filter.draw(texture).vignette(param1, param2).update();	//effect
              canvas_active().clearRect(0, 0, WIDTH, HEIGHT);
              canvas_active().drawImage(fx_filter, 0, 0);
              GUI.zoom();
            },
            function (user_response, canvas_preview, w, h) {
              var param1 = parseFloat(user_response.param1);
              var param2 = parseFloat(user_response.param2);

              var texture = fx_filter.texture(canvas_preview.getImageData(0, 0, w, h));
              fx_filter.draw(texture).vignette(param1, param2).update();	//effect
              canvas_preview.drawImage(fx_filter, 0, 0);
            }
    );
  };

  this.effects_vintage = function () {
    POP.add({name: "red_offset", title: "Color adjust:", value: "70", range: [0, 200]});
    POP.add({name: "contrast", title: "Contrast:", value: "15", range: [0, 50]});
    POP.add({name: "blur", title: "Blur:", value: "0", range: [0, 2], step: 0.1});
    POP.add({name: "light_leak", title: "Light leak:", value: "90", range: [0, 150]});
    POP.add({name: "de_saturation", title: "Desaturation:", value: "40", range: [0, 100]});
    POP.add({name: "exposure", title: "Exposure level:", value: "80", range: [0, 150]});
    POP.add({name: "grains", title: "Grains level:", value: "20", range: [0, 50]});
    POP.add({name: "big_grains", title: "Big grains level:", value: "20", range: [0, 50]});
    POP.add({name: "vignette1", title: "Vignette size:", value: "0.3", range: [0, 0.5], step: 0.01});
    POP.add({name: "vignette2", title: "Vignette amount:", value: "0.5", range: [0, 0.7], step: 0.01});
    POP.add({name: "dust_level", title: "Dusts level:", value: "70", range: [0, 100]});
    POP.effects = true;
    POP.show('Vintage',
            function (user_response) {
              EDIT.save_state();
              var red_offset = parseInt(user_response.red_offset);
              var contrast = parseInt(user_response.contrast);
              var blur = parseFloat(user_response.blur);
              var light_leak = parseInt(user_response.light_leak);
              var de_saturation = parseInt(user_response.de_saturation);
              var exposure = parseInt(user_response.exposure);
              var grains = parseInt(user_response.grains);
              var big_grains = parseInt(user_response.big_grains);
              var vignette1 = parseFloat(user_response.vignette1);
              var vignette2 = parseFloat(user_response.vignette2);
              var dust_level = parseInt(user_response.dust_level);

              VINTAGE.adjust_color(canvas_active(), WIDTH, HEIGHT, red_offset);
              VINTAGE.lower_contrast(canvas_active(), WIDTH, HEIGHT, contrast);
              VINTAGE.blur(canvas_active(), WIDTH, HEIGHT, blur);
              VINTAGE.light_leak(canvas_active(), WIDTH, HEIGHT, light_leak);
              VINTAGE.chemicals(canvas_active(), WIDTH, HEIGHT, de_saturation);
              VINTAGE.exposure(canvas_active(), WIDTH, HEIGHT, exposure);
              VINTAGE.grains(canvas_active(), WIDTH, HEIGHT, grains);
              VINTAGE.grains_big(canvas_active(), WIDTH, HEIGHT, big_grains);
              VINTAGE.optics(canvas_active(), WIDTH, HEIGHT, vignette1, vignette2);
              VINTAGE.dusts(canvas_active(), WIDTH, HEIGHT, dust_level);
              GUI.zoom();
            },
            function (user_response, canvas_preview, w, h) {
              var red_offset = parseInt(user_response.red_offset);
              var contrast = parseInt(user_response.contrast);
              var blur = parseFloat(user_response.blur);
              var light_leak = parseInt(user_response.light_leak);
              var de_saturation = parseInt(user_response.de_saturation);
              var exposure = parseInt(user_response.exposure);
              var grains = parseInt(user_response.grains);
              var big_grains = parseInt(user_response.big_grains);
              var vignette1 = parseFloat(user_response.vignette1);
              var vignette2 = parseFloat(user_response.vignette2);
              var dust_level = parseInt(user_response.dust_level);

              VINTAGE.adjust_color(canvas_preview, w, h, red_offset);
              VINTAGE.lower_contrast(canvas_preview, w, h, contrast);
              VINTAGE.blur(canvas_preview, w, h, blur);
              VINTAGE.light_leak(canvas_preview, w, h, light_leak);
              VINTAGE.chemicals(canvas_preview, w, h, de_saturation);
              VINTAGE.exposure(canvas_preview, w, h, exposure);
              VINTAGE.grains(canvas_preview, w, h, grains);
              VINTAGE.grains_big(canvas_preview, w, h, big_grains);
              VINTAGE.optics(canvas_preview, w, h, vignette1, vignette2);
              VINTAGE.dusts(canvas_preview, w, h, dust_level);
            }
    );
  };

  this.effect_bw = function (context, W, H, level, dithering) {
    var img = context.getImageData(0, 0, W, H);
    var imgData = img.data;
    var grey, c, quant_error, m;
    if (dithering !== true) {
      //no differing
      for (var i = 0; i < imgData.length; i += 4) {
        if (imgData[i + 3] == 0)
          continue;	//transparent
        grey = Math.round(0.2126 * imgData[i] + 0.7152 * imgData[i + 1] + 0.0722 * imgData[i + 2]);
        if (grey <= level)
          c = 0;
        else
          c = 255;
        imgData[i] = c;
        imgData[i + 1] = c;
        imgData[i + 2] = c;
      }
    } else {
      //Floyd–Steinberg dithering
      canvas_front.clearRect(0, 0, W, H); //temp canvas for storing pixel data shifts
      var img2 = canvas_front.getImageData(0, 0, W, H);
      var imgData2 = img2.data;
      for (var j = 0; j < H; j++) {
        for (var i = 0; i < W; i++) {
          var k = ((j * (W * 4)) + (i * 4));
          if (imgData[k + 3] == 0)
            continue;	//transparent

          grey = Math.round(0.2126 * imgData[k] + 0.7152 * imgData[k + 1] + 0.0722 * imgData[k + 2]);
          grey = grey + imgData2[k]; //add data shft from previous iterations
          c = Math.floor(grey / 256);
          if (c == 1)
            c = 255;
          imgData[k] = c;
          imgData[k + 1] = c;
          imgData[k + 2] = c;
          quant_error = grey - c;
          if (i + 1 < W) {
            m = k + 4;
            imgData2[m] += Math.round(quant_error * 7 / 16);
          }
          if (i - 1 > 0 && j + 1 < H) {
            m = k - 4 + W * 4;
            imgData2[m] += Math.round(quant_error * 3 / 16);
          }
          if (j + 1 < H) {
            m = k + W * 4;
            imgData2[m] += Math.round(quant_error * 5 / 16);
          }
          if (i + 1 < W && j + 1 < H) {
            m = k + 4 + W * 4;
            imgData2[m] += Math.round(quant_error * 1 / 16);
          }
        }
      }
    }
    context.putImageData(img, 0, 0);
  };

  //converts greyscale images to colored
  this.colorize = function (context, W, H, rand_power, max_gap, dither, manual_colors) {
    if (manual_colors == undefined || manual_colors === true) {
      var colors = [];
      for (var x = 0; x < 3; x++) {
        colors[x] = [];
        var pre = HELPER.getRandomInt(-1 * rand_power, rand_power);
        for (var i = 0; i <= 255; i++) {
          colors[x][i] = HELPER.getRandomInt(pre - rand_power, pre + rand_power);

          if (colors[x][i] < -1 * max_gap)
            colors[x][i] += 10;
          else if (colors[x][i] > max_gap)
            colors[x][i] -= 10;

          pre = colors[x][i];
        }
      }
      if (manual_colors === true)
        return colors;
    } else {
      var colors = manual_colors;
    }

    var img = context.getImageData(0, 0, W, H);

    //colorize
    var imgData = img.data;
    for (var i = 0; i < imgData.length; i += 4) {
      if (imgData[i + 3] == 0)
        continue;	//transparent
      if (dither == true) {
        var diff = Math.abs(colors[0][imgData[x]]) + Math.abs(colors[0][imgData[x]]) + Math.abs(colors[0][imgData[x]]);
        diff = diff / 3;
      }
      for (var c = 0; c < 3; c++) {
        var x = i + c;
        if (dither == false)
          imgData[x] += colors[c][imgData[x]];
        else {
          if (diff < rand_power * 6)
            imgData[x] += colors[c][imgData[x]];
          else {
            //big difference here - randomize
            var rand = HELPER.getRandomInt(Math.min(0, colors[c][imgData[x]]), Math.max(0, colors[c][imgData[x]]));
            imgData[x] += rand;
          }
        }
        if (imgData[x] > 255)
          imgData[x] = 255;
        if (imgData[x] < 0)
          imgData[x] = 0;
      }
    }
    context.putImageData(img, 0, 0);
    return false;
  };

  this.heatmap_effect = function (context, W, H) {
    var img = context.getImageData(0, 0, W, H);
    var imgData = img.data;
    var grey, RGB;
    for (var i = 0; i < imgData.length; i += 4) {
      if (imgData[i + 3] == 0)
        continue;	//transparent
      grey = Math.round(0.2126 * imgData[i] + 0.7152 * imgData[i + 1] + 0.0722 * imgData[i + 2]);
      RGB = this.color2heat(grey);
      imgData[i] = RGB.R;
      imgData[i + 1] = RGB.G;
      imgData[i + 2] = RGB.B;
    }
    context.putImageData(img, 0, 0);
  };

  this.color2heat = function (value) {
    var RGB = {R: 0, G: 0, B: 0};
    value = value / 255;
    if (0 <= value && value <= 1 / 8) {
      RGB.R = 0;
      RGB.G = 0;
      RGB.B = 4 * value + .5; // .5 - 1 // b = 1/2
    } else if (1 / 8 < value && value <= 3 / 8) {
      RGB.R = 0;
      RGB.G = 4 * value - .5; // 0 - 1 // b = - 1/2
      RGB.B = 1; // small fix
    } else if (3 / 8 < value && value <= 5 / 8) {
      RGB.R = 4 * value - 1.5; // 0 - 1 // b = - 3/2
      RGB.G = 1;
      RGB.B = -4 * value + 2.5; // 1 - 0 // b = 5/2
    } else if (5 / 8 < value && value <= 7 / 8) {
      RGB.R = 1;
      RGB.G = -4 * value + 3.5; // 1 - 0 // b = 7/2
      RGB.B = 0;
    } else if (7 / 8 < value && value <= 1) {
      RGB.R = -4 * value + 4.5; // 1 - .5 // b = 9/2
      RGB.G = 0;
      RGB.B = 0;
    } else {
      // should never happen - value > 1
      RGB.R = .5;
      RGB.G = 0;
      RGB.B = 0;
    }
    // scale for hex conversion
    RGB.R *= 255;
    RGB.G *= 255;
    RGB.B *= 255;

    RGB.R = Math.round(RGB.R);
    RGB.G = Math.round(RGB.G);
    RGB.B = Math.round(RGB.B);

    return RGB;
  };

  //method = otsu
  this.thresholding = function (method, ctx, W, H, only_level) {
    var img = ctx.getImageData(0, 0, W, H);
    var imgData = img.data;
    var hist_data = [];
    var grey;
    for (var i = 0; i <= 255; i++)
      hist_data[i] = 0;
    for (var i = 0; i < imgData.length; i += 4) {
      grey = Math.round(0.2126 * imgData[i] + 0.7152 * imgData[i + 1] + 0.0722 * imgData[i + 2]);
      hist_data[grey]++;
    }
    var level;
    if (method == 'otsu')
      level = this.otsu(hist_data, W * H);
    else
      alert('ERROR: unknown method in EFFECTS.thresholding().');
    if (only_level === true)
      return level;
    var c;
    for (var i = 0; i < imgData.length; i += 4) {
      if (imgData[i + 3] == 0)
        continue;	//transparent
      grey = Math.round(0.2126 * imgData[i] + 0.7152 * imgData[i + 1] + 0.0722 * imgData[i + 2]);
      if (grey < level)
        c = 0;
      else
        c = 255;
      imgData[i] = c;
      imgData[i + 1] = c;
      imgData[i + 2] = c;
    }
    ctx.putImageData(img, 0, 0);
  };

  //http://en.wikipedia.org/wiki/Otsu%27s_Method
  this.otsu = function (histogram, total) {
    var sum = 0;
    for (var i = 1; i < 256; ++i)
      sum += i * histogram[i];
    var mB, mF, between;
    var sumB = 0;
    var wB = 0;
    var wF = 0;
    var max = 0;
    var threshold = 0;
    for (var i = 0; i < 256; ++i) {
      wB += histogram[i];
      if (wB == 0)
        continue;
      wF = total - wB;
      if (wF == 0)
        break;
      sumB += i * histogram[i];
      mB = sumB / wB;
      mF = (sum - sumB) / wF;
      between = wB * wF * Math.pow(mB - mF, 2);
      if (between > max) {
        max = between;
        threshold = i;
      }
    }
    return threshold;
  };

  this.grains_effect = function (context, W, H, level) {
    if (level == 0)
      return context;
    var img = context.getImageData(0, 0, W, H);
    var imgData = img.data;
    for (var j = 0; j < H; j++) {
      for (var i = 0; i < W; i++) {
        var x = (i + j * W) * 4;
        if (imgData[x + 3] == 0)
          continue;	//transparent
        //increase it's lightness
        var delta = HELPER.getRandomInt(0, level);
        if (delta == 0)
          continue;

        if (imgData[x] - delta < 0)
          imgData[x] = -(imgData[x] - delta);
        else
          imgData[x] = imgData[x] - delta;
        if (imgData[x + 1] - delta < 0)
          imgData[x + 1] = -(imgData[x + 1] - delta);
        else
          imgData[x + 1] = imgData[x + 1] - delta;
        if (imgData[x + 2] - delta < 0)
          imgData[x + 2] = -(imgData[x + 2] - delta);
        else
          imgData[x + 2] = imgData[x + 2] - delta;
      }
    }
    context.putImageData(img, 0, 0);
  };
}
/* global POP, MAIN, SIFT, LAYER, IMAGE, EVENTS, HELPER, EDIT, GUI, EL */
/* global WIDTH, HEIGHT, COLOR, canvas_active */

var TOOLS = new TOOLS_CLASS();

/** 
 * manages various tools
 * 
 * @author ViliusL
 */
function TOOLS_CLASS() {

  //sprites
  this.tools_sprites = function () {
    POP.add({name: "param1", title: "Gap:", value: "50", values: ["0", "10", "50", "100"]});
    POP.show('Sprites', function (response) {
      EDIT.save_state();
      var param1 = parseInt(response.param1);
      TOOLS.generate_sprites(param1);
    });
  };

  //show keypoints
  this.tools_keypoints = function () {
    SIFT.generate_keypoints(canvas_active(true), true);
  };

  //create panorama
  this.tools_panorama = function () {
    SIFT.panorama();
  };

  //extract alpha channel
  this.tools_color2alpha = function () {
    POP.add({name: "param1", title: "Color:", value: COLOR, type: 'color'});
    POP.show(
            'Color to alpha',
            function (user_response) {
              EDIT.save_state();
              var param1 = user_response.param1;
              TOOLS.convert_color_to_alpha(canvas_active(), WIDTH, HEIGHT, param1);
              GUI.zoom();
            },
            function (user_response, canvas_preview, w, h) {
              var param1 = user_response.param1;
              TOOLS.convert_color_to_alpha(canvas_preview, w, h, param1);
            }
    );
  };

  //expands colors
  this.tools_color_zoom = function () {
    POP.add({name: "param1", title: "Zoom:", value: "2", range: [2, 20], });
    POP.add({name: "param2", title: "Center:", value: "128", range: [0, 255]});
    POP.show(
            'Color Zoom',
            function (user_response) {
              EDIT.save_state();
              var param1 = parseInt(user_response.param1);
              var param2 = parseInt(user_response.param2);

              TOOLS.color_zoom(canvas_active(), WIDTH, HEIGHT, param1, param2);
              GUI.zoom();
            },
            function (user_response, canvas_preview, w, h) {
              var param1 = parseInt(user_response.param1);
              var param2 = parseInt(user_response.param2);

              TOOLS.color_zoom(canvas_preview, w, h, param1, param2);
            }
    );
  };

  //recover alpha channel values
  this.tools_restore_alpha = function () {
    POP.add({name: "param", title: "Level:", value: "128", range: [0, 255]});
    POP.show(
            'Recover alpha',
            function (user_response) {
              EDIT.save_state();
              var param = parseInt(user_response.param);

              TOOLS.recover_alpha(canvas_active(), WIDTH, HEIGHT, param);
              GUI.zoom();
            },
            function (user_response, canvas_preview, w, h) {
              var param = parseInt(user_response.param);

              TOOLS.recover_alpha(canvas_preview, w, h, param);
            }
    );
  };

  //adds borders
  this.tools_borders = function () {
    POP.add({name: "color", title: "Color:", value: COLOR, type: 'color'});
    POP.add({name: "shadow", title: "Shadow:", values: ["No", "Yes"]});
    POP.add({name: "size", title: "Size:", value: "5", range: [1, 100]});
    POP.show(
            'Borders',
            function (user_response) {
              EDIT.save_state();
              var color = user_response.color;
              var size = Math.round(WIDTH / 100 * user_response.size);
              var shadow = false;
              if (user_response.shadow == 'Yes')
                shadow = true;

              TOOLS.add_borders(canvas_active(), WIDTH, HEIGHT, color, size, shadow);
              GUI.zoom();
            },
            function (user_response, canvas_preview, w, h) {
              var color = user_response.color;
              var size = Math.round(w / 100 * user_response.size);
              var shadow = false;
              if (user_response.shadow == 'Yes')
                shadow = true;

              TOOLS.add_borders(canvas_preview, w, h, color, size, shadow);
            }
    );
  };

  this.generate_sprites = function (gap) {
    if (LAYER.layers.length == 1)
      return false;
    EDIT.save_state();
    LAYER.layer_add();
    var xx = 0;
    var yy = 0;
    var max_height = 0;
    var tmp = document.createElement("canvas");
    tmp.setAttribute('id', "tmp_canvas");
    tmp.width = WIDTH;
    tmp.height = HEIGHT;
    var W = WIDTH;
    var H = HEIGHT;
    for (var i = LAYER.layers.length - 1; i >= 0; i--) {
      if (i == LAYER.layer_active)
        continue;	//end
      if (LAYER.layers[i].visible == false)
        continue;

      tmp.getContext("2d").clearRect(0, 0, W, H);
      tmp.getContext("2d").drawImage(document.getElementById(LAYER.layers[i].name), 0, 0);

      var trim_details = IMAGE.trim_info(tmp, false); //trim
      if (WIDTH == trim_details.left)
        continue; //empty layer
      var width = W - trim_details.left - trim_details.right;
      var height = H - trim_details.top - trim_details.bottom;

      if (xx + width > WIDTH) {
        xx = 0;
        yy += max_height;
        max_height = 0;
      }
      if (yy % gap > 0 && gap > 0)
        yy = yy - yy % gap + gap;
      if (yy + height > HEIGHT) {
        EVENTS.autosize = false;
        HEIGHT = yy + height;
        LAYER.set_canvas_size();
      }

      canvas_active().drawImage(tmp, trim_details.left, trim_details.top, width, height, xx, yy, width, height);
      xx += width;
      if (gap > 0)
        xx = xx - xx % gap + gap;

      if (height > max_height)
        max_height = height;
      if (xx > WIDTH) {
        xx = 0;
        yy += max_height;
        max_height = 0;
      }
    }
  };

  this.convert_color_to_alpha = function (context, W, H, color) {
    var img = context.getImageData(0, 0, W, H);
    var imgData = img.data;
    var back_color = HELPER.hex2rgb(color);

    for (var i = 0; i < imgData.length; i += 4) {
      if (imgData[i + 3] == 0)
        continue;	//transparent

      //calculate difference from requested color, and change alpha
      var diff = Math.abs(imgData[i] - back_color.r) + Math.abs(imgData[i + 1] - back_color.g) + Math.abs(imgData[i + 2] - back_color.b) / 3;
      imgData[i + 3] = Math.round(diff);

      //combining 2 layers in future will change colors, so make changes to get same colors in final image
      //color_result = color_1 * (alpha_1 / 255) * (1 - A2 / 255) + color_2 * (alpha_2 / 255)
      //color_2 = (color_result - color_1 * (alpha_1 / 255) * (1 - A2 / 255)) / (alpha_2 / 255)
      imgData[i] = Math.ceil((imgData[i] - back_color.r * (1 - imgData[i + 3] / 255)) / (imgData[i + 3] / 255));
      imgData[i + 1] = Math.ceil((imgData[i + 1] - back_color.g * (1 - imgData[i + 3] / 255)) / (imgData[i + 3] / 255));
      imgData[i + 2] = Math.ceil((imgData[i + 2] - back_color.b * (1 - imgData[i + 3] / 255)) / (imgData[i + 3] / 255));
    }
    context.putImageData(img, 0, 0);
  };

  this.color_zoom = function (context, W, H, zoom, center) {
    var img = context.getImageData(0, 0, W, H);
    var imgData = img.data;
    var grey;
    for (var i = 0; i < imgData.length; i += 4) {
      if (imgData[i + 3] == 0)
        continue;	//transparent

      grey = Math.round(0.2126 * imgData[i] + 0.7152 * imgData[i + 1] + 0.0722 * imgData[i + 2]);

      for (var j = 0; j < 3; j++) {
        var k = i + j;
        if (grey > center)
          imgData[k] += (imgData[k] - center) * zoom;
        else if (grey < center)
          imgData[k] -= (center - imgData[k]) * zoom;
        if (imgData[k] < 0)
          imgData[k] = 0;
        if (imgData[k] > 255)
          imgData[k] = 255;
      }
    }
    context.putImageData(img, 0, 0);
  };

  this.recover_alpha = function (context, W, H, level) {
    var img = context.getImageData(0, 0, W, H);
    var imgData = img.data;
    var tmp;
    level = parseInt(level);
    for (var i = 0; i < imgData.length; i += 4) {
      tmp = imgData[i + 3] + level;
      if (tmp > 255)
        tmp = 255;
      imgData[i + 3] = tmp;
    }
    context.putImageData(img, 0, 0);
  };

  this.add_borders = function (context, W, H, color, size, shadow) {
    context.save();
    if (shadow == true) {
      //with shadow
      context.beginPath();
      context.lineWidth = size;
      context.strokeStyle = 'green';
      context.shadowColor = color;
      context.shadowBlur = size / 2;
      context.rect(-size / 2, -size / 2, W + size, H + size);
      context.stroke();
      context.stroke();
      context.stroke();
      context.stroke();
      context.stroke();
    } else {
      context.strokeStyle = color;
      context.lineWidth = size;
      EL.rectangle(context, 0, 0, W - 1, H - 1, false, true);
    }
    context.restore();
  };
}
/* global MAIN, HELPER, LAYER, EDIT, POP, GUI, EVENTS, EL, ImageFilters, sketchy_brush, shaded_brush, chrome_brush, BezierCurveBrush */
/* global WIDTH, HEIGHT, COLOR, canvas_active, canvas_front */

var DRAW = new DRAW_TOOLS_CLASS();

/** 
 * manages draw tools
 * 
 * @author ViliusL
 */
function DRAW_TOOLS_CLASS() {

  /**
   * user action for selected area
   */
  this.select_square_action = '';

  /**
   * previous line coordinates [x, y]
   */
  this.last_line = [];

  /**
   * user selected area config - array(x, y, width, height)
   */
  this.select_data = false;

  /**
   * currently used tool
   */
  this.active_tool = 'select_tool';

  /**
   * line points data for curved line
   */
  var curve_points = [];

  /**
   * image data for cloning tool
   */
  var clone_data = false;

  //credits to Victor Haydin
  this.toolFiller = function (context, W, H, x, y, color_to, sensitivity, anti_aliasing) {
    canvas_front.clearRect(0, 0, WIDTH, HEIGHT);
    var img_tmp = canvas_front.getImageData(0, 0, W, H);
    var imgData_tmp = img_tmp.data;

    var img = context.getImageData(0, 0, W, H);
    var imgData = img.data;
    var k = ((y * (img.width * 4)) + (x * 4));
    var dx = [0, -1, +1, 0];
    var dy = [-1, 0, 0, +1];
    var color_from = {
      r: imgData[k + 0],
      g: imgData[k + 1],
      b: imgData[k + 2],
      a: imgData[k + 3]
    };
    if (color_from.r == color_to.r && color_from.g == color_to.g && color_from.b == color_to.b && color_from.a == color_to.a) {
      return false;
    }
    var stack = [];
    stack.push([x, y]);
    while (stack.length > 0) {
      var curPoint = stack.pop();
      for (var i = 0; i < 4; i++) {
        var nextPointX = curPoint[0] + dx[i];
        var nextPointY = curPoint[1] + dy[i];
        if (nextPointX < 0 || nextPointY < 0 || nextPointX >= W || nextPointY >= H)
          continue;
        var k = (nextPointY * W + nextPointX) * 4;
        if (imgData_tmp[k + 3] != 0)
          continue; //already parsed

        //check
        if (Math.abs(imgData[k + 0] - color_from.r) <= sensitivity &&
                Math.abs(imgData[k + 1] - color_from.g) <= sensitivity &&
                Math.abs(imgData[k + 2] - color_from.b) <= sensitivity &&
                Math.abs(imgData[k + 3] - color_from.a) <= sensitivity) {

          //fill pixel
          imgData_tmp[k] = color_to.r; //r
          imgData_tmp[k + 1] = color_to.g; //g
          imgData_tmp[k + 2] = color_to.b; //b
          imgData_tmp[k + 3] = color_to.a; //a

          stack.push([nextPointX, nextPointY]);
        }
      }
    }
    canvas_front.putImageData(img_tmp, 0, 0);
    if (anti_aliasing == true) {
      context.shadowColor = "rgba(" + color_to.r + ", " + color_to.g + ", " + color_to.b + ", " + color_to.a / 255 + ")";
      context.shadowBlur = 5;
    }
    context.drawImage(document.getElementById("canvas_front"), 0, 0);
    //reset
    context.shadowBlur = 0;
  };

  this.tool_magic_wand = function (context, W, H, x, y, sensitivity, anti_aliasing) {
    canvas_front.clearRect(0, 0, WIDTH, HEIGHT);

    canvas_front.rect(0, 0, WIDTH, HEIGHT);
    canvas_front.fillStyle = "rgba(255, 255, 255, 0)";
    canvas_front.fill();

    var img_tmp = canvas_front.getImageData(0, 0, W, H);
    var imgData_tmp = img_tmp.data;

    var img = context.getImageData(0, 0, W, H);
    var imgData = img.data;
    var k = ((y * (img.width * 4)) + (x * 4));
    var dx = [0, -1, +1, 0];
    var dy = [-1, 0, 0, +1];
    var color_to = {
      r: 255,
      g: 255,
      b: 255,
      a: 255
    };
    var color_from = {
      r: imgData[k + 0],
      g: imgData[k + 1],
      b: imgData[k + 2],
      a: imgData[k + 3]
    };
    if (color_from.r == color_to.r &&
            color_from.g == color_to.g &&
            color_from.b == color_to.b &&
            color_from.a == 0) {
      return false;
    }
    var stack = [];
    stack.push([x, y]);
    while (stack.length > 0) {
      var curPoint = stack.pop();
      for (var i = 0; i < 4; i++) {
        var nextPointX = curPoint[0] + dx[i];
        var nextPointY = curPoint[1] + dy[i];
        if (nextPointX < 0 || nextPointY < 0 || nextPointX >= W || nextPointY >= H)
          continue;
        var k = (nextPointY * W + nextPointX) * 4;
        if (imgData_tmp[k + 3] != 0)
          continue; //already parsed

        if (Math.abs(imgData[k] - color_from.r) <= sensitivity
                && Math.abs(imgData[k + 1] - color_from.g) <= sensitivity
                && Math.abs(imgData[k + 2] - color_from.b) <= sensitivity
                && Math.abs(imgData[k + 3] - color_from.a) <= sensitivity) {
          imgData_tmp[k] = color_to.r; //r
          imgData_tmp[k + 1] = color_to.g; //g
          imgData_tmp[k + 2] = color_to.b; //b
          imgData_tmp[k + 3] = color_to.a; //a

          stack.push([nextPointX, nextPointY]);
        }
      }
    }
    //destination-out + blur = anti-aliasing
    if (anti_aliasing == true)
      img_tmp = ImageFilters.StackBlur(img_tmp, 2);
    canvas_front.putImageData(img_tmp, 0, 0);
    context.globalCompositeOperation = "destination-out";
    context.drawImage(document.getElementById("canvas_front"), 0, 0);
    //reset
    context.shadowBlur = 0;
    context.globalCompositeOperation = 'source-over';
  };

  //type = click, right_click, drag, move, release
  this.select_tool = function (type, mouse, event) {
    if (mouse == undefined)
      return false;
    if (mouse.valid == false)
      return true;
    if (mouse.click_valid == false)
      return true;
    if (event != undefined && event.target.id == "canvas_preview")
      return true;
    var active_layer_obj = document.getElementById(LAYER.layers[LAYER.layer_active].name);

    if (type == 'drag') {
      canvas_front.clearRect(0, 0, WIDTH, HEIGHT);

      if (active_layer_obj.style.visibility != 'hidden') {
        //hide active layer
        active_layer_obj.style.visibility = 'hidden';
      }

      if (EVENTS.ctrl_pressed == true) {
        //ctrl is pressed
        var xx = mouse.x;
        var yy = mouse.y;
        if (Math.abs(mouse.click_x - mouse.x) < Math.abs(mouse.click_y - mouse.y))
          xx = mouse.click_x;
        else
          yy = mouse.click_y;
        canvas_front.drawImage(canvas_active(true), xx - mouse.click_x, yy - mouse.click_y);
      } else {
        canvas_front.drawImage(canvas_active(true), mouse.x - mouse.click_x, mouse.y - mouse.click_y);
      }
    } else if (type == 'release') {
      //show active layer
      active_layer_obj.style.visibility = 'visible';

      if (mouse.valid == false || mouse.click_x === false) {
        return false;
      }
      if (mouse.x - mouse.click_x == 0 && mouse.y - mouse.click_y == 0) {
        return false;
      }
      EDIT.save_state();
      var tmp = canvas_active().getImageData(0, 0, WIDTH, HEIGHT);
      canvas_active().clearRect(0, 0, WIDTH, HEIGHT);
      if (EVENTS.ctrl_pressed == true) {
        //ctrl is pressed
        var xx = mouse.x;
        var yy = mouse.y;
        if (Math.abs(mouse.click_x - mouse.x) < Math.abs(mouse.click_y - mouse.y))
          xx = mouse.click_x;
        else
          yy = mouse.click_y;
        canvas_active().putImageData(tmp, xx - mouse.click_x, yy - mouse.click_y);
      } else {
        canvas_active().putImageData(tmp, mouse.x - mouse.click_x, mouse.y - mouse.click_y);
      }
    }
  };
  this.magic_wand = function (type, mouse, event) {
    if (mouse.valid == false)
      return true;
    if (type == 'click') {
      EDIT.save_state();
      this.tool_magic_wand(canvas_active(), WIDTH, HEIGHT, mouse.x, mouse.y, GUI.action_data().attributes.power, GUI.action_data().attributes.anti_aliasing);
    }
  };
  this.erase = function (type, mouse, event) {
    if (mouse.valid == false)
      return true;
    var strict = GUI.action_data().attributes.strict;
    var size = GUI.action_data().attributes.size;
    var is_circle = GUI.action_data().attributes.circle;

    var strict_element = document.getElementById('strict');
    if (is_circle == false) {
      //hide strict controlls
      if (strict_element != undefined)
        strict_element.style.display = 'none';
    } else {
      //show strict controlls
      if (strict_element != undefined)
        strict_element.style.display = 'block';
    }

    if (type == 'click') {
      EDIT.save_state();
      if (is_circle == false) {
        canvas_active().save();
        canvas_active().globalCompositeOperation = 'destination-out';
        canvas_active().fillStyle = "rgba(255, 255, 255, " + ALPHA / 255 + ")";
        canvas_active().fillRect(mouse.x - Math.ceil(size / 2) + 1, mouse.y - Math.ceil(size / 2) + 1, size, size);
        canvas_active().restore();
      } else {
        if (strict == false) {
          var radgrad = canvas_active().createRadialGradient(
                  mouse.x, mouse.y, size / 8,
                  mouse.x, mouse.y, size / 2);
          radgrad.addColorStop(0, "rgba(255, 255, 255, " + ALPHA / 255 + ")");
          radgrad.addColorStop(1, "rgba(255, 255, 255, 0)");
        }

        //set Composite
        canvas_active().save();
        canvas_active().globalCompositeOperation = 'destination-out';
        if (strict == true)
          canvas_active().fillStyle = "rgba(255, 255, 255, " + ALPHA / 255 + ")";
        else
          canvas_active().fillStyle = radgrad;
        canvas_active().beginPath();
        canvas_active().arc(mouse.x, mouse.y, size / 2, 0, Math.PI * 2, true);
        canvas_active().fill();
        canvas_active().restore();
      }
    } else if (type == 'drag') {
      if (is_circle == false) {
        canvas_active().save();
        canvas_active().globalCompositeOperation = 'destination-out';
        if (ALPHA < 255)
          canvas_active().fillStyle = "rgba(255, 255, 255, " + ALPHA / 255 / 10 + ")";
        else
          canvas_active().fillStyle = COLOR;
        canvas_active().fillRect(mouse.x - Math.ceil(size / 2) + 1, mouse.y - Math.ceil(size / 2) + 1, size, size);
        canvas_active().restore();
      } else {
        if (strict == false) {
          var radgrad = canvas_active().createRadialGradient(
                  mouse.x, mouse.y, size / 10,
                  mouse.x, mouse.y, size / 2);
          if (ALPHA < 255)
            radgrad.addColorStop(0, "rgba(255, 255, 255, " + ALPHA / 255 / 10 + ")");
          else
            radgrad.addColorStop(0, "rgba(255, 255, 255, 1)");
          radgrad.addColorStop(1, "rgba(255, 255, 255, 0)");
        }
        //set Composite
        canvas_active().save();
        canvas_active().globalCompositeOperation = 'destination-out';
        if (strict == true) {
          if (ALPHA < 255)
            canvas_active().fillStyle = "rgba(255, 255, 255, " + ALPHA / 255 / 10 + ")";
          else
            canvas_active().fillStyle = COLOR;
        } else
          canvas_active().fillStyle = radgrad;
        canvas_active().beginPath();
        canvas_active().arc(mouse.x, mouse.y, size / 2, 0, Math.PI * 2, true);
        canvas_active().fill();
        canvas_active().restore();
      }

      //show size
      canvas_front.clearRect(0, 0, WIDTH, HEIGHT);
      if (is_circle == false) {
        canvas_front.lineWidth = 1;
        EL.rectangle_dashed(canvas_front, mouse.x - Math.ceil(size / 2) + 1, mouse.y - Math.ceil(size / 2) + 1, mouse.x + Math.floor(size / 2), mouse.y + Math.floor(size / 2), 1, '#000000');
      } else {
        EL.circle(canvas_front, mouse.x, mouse.y, size);
      }
    } else if (type == 'move') {
      var size1 = Math.floor((size) / 2);
      var size2 = Math.floor((size) / 2);
      if (size % 2 == 0)
        size2--;
      else {
        size1--;
      }

      //show size
      canvas_front.clearRect(0, 0, WIDTH, HEIGHT);
      if (is_circle == false) {
        canvas_front.lineWidth = 1;
        EL.rectangle_dashed(canvas_front, mouse.x - Math.ceil(size / 2) + 1, mouse.y - Math.ceil(size / 2) + 1, mouse.x + Math.floor(size / 2), mouse.y + Math.floor(size / 2), 1, '#000000');
      } else {
        EL.circle(canvas_front, mouse.x, mouse.y, size);
      }
    }
  };
  this.fill = function (type, mouse, event) {
    if (mouse.valid == false)
      return true;
    if (type == 'click') {
      EDIT.save_state();
      var color_to = HELPER.hex2rgb(COLOR);
      color_to.a = ALPHA;
      DRAW.toolFiller(canvas_active(), WIDTH, HEIGHT, mouse.x, mouse.y, color_to, GUI.action_data().attributes.power, GUI.action_data().attributes.anti_aliasing);
    }
  };
  this.pick_color = function (type, mouse, event) {
    if (mouse.valid == false)
      return true;
    if (type == 'click') {
      var c = canvas_active().getImageData(mouse.x, mouse.y, 1, 1).data;
      COLOR = "#" + ("000000" + HELPER.rgbToHex(c[0], c[1], c[2])).slice(-6);

      //set alpha
      ALPHA = c[3];
      document.getElementById("rgb_a").value = ALPHA;

      GUI.sync_colors();
    }
  };
  this.pencil = function (type, mouse, event) {
    if (mouse.valid == false)
      return true;
    var color_rgb = HELPER.hex2rgb(COLOR);
    if (type == 'click') {
      EDIT.save_state();
    } else if (type == 'drag') {
      //why no simple lines? this way turns off aliasing
      if (mouse.last_x != false && mouse.last_y != false) {
        //saving
        dist_x = mouse.last_x - mouse.x;
        dist_y = mouse.last_y - mouse.y;
        distance = Math.sqrt((dist_x * dist_x) + (dist_y * dist_y));
        radiance = Math.atan2(dist_y, dist_x);
        for (var i = 0; i < distance; i++) {
          x_tmp = mouse.x + Math.cos(radiance) * i;
          y_tmp = mouse.y + Math.sin(radiance) * i;

          x_tmp = Math.round(x_tmp);
          y_tmp = Math.round(y_tmp);
          var my_color = HELPER.hex2rgb(COLOR);
          canvas_active().fillStyle = "rgba(" + color_rgb.r + ", " + color_rgb.g + ", " + color_rgb.b + ", " + ALPHA / 255 + ")";
          canvas_active().fillRect(x_tmp, y_tmp, 1, 1);
        }
      }
    } else if (type == 'release') {
      canvas_active().fillStyle = "rgba(" + color_rgb.r + ", " + color_rgb.g + ", " + color_rgb.b + ", " + ALPHA / 255 + ")";
      canvas_active().fillRect(mouse.x, mouse.y, 1, 1);
    }
  };
  this.line = function (type, mouse, event) {
    if (mouse.click_valid == false)
      return false;
    var color_rgb = HELPER.hex2rgb(COLOR);

    //horizontal/vertical only
    var xx = mouse.x;
    var yy = mouse.y;
    var from_x = mouse.click_x;
    var from_y = mouse.click_y;
    var attribute_type = GUI.action_data().attributes.type;

    if (type == 'move') {
      canvas_front.clearRect(0, 0, WIDTH, HEIGHT);
      canvas_front.strokeStyle = "rgba(" + color_rgb.r + ", " + color_rgb.g + ", " + color_rgb.b + ", " + ALPHA / 255 + ")";
      canvas_front.lineWidth = GUI.action_data().attributes.size;

      if (attribute_type == 'Curve') {
        //curve
        if (curve_points.length == 2) {
          canvas_front.beginPath();
          canvas_front.moveTo(curve_points[0][0] + 0.5, curve_points[0][1] + 0.5);
          canvas_front.quadraticCurveTo(mouse.x + 0.5, mouse.y + 0.5, curve_points[1][0], curve_points[1][1]);
          canvas_front.stroke();
        }
      }
    } else if (type == 'drag') {
      document.body.style.cursor = "crosshair";
      canvas_front.clearRect(0, 0, WIDTH, HEIGHT);
      canvas_front.beginPath();
      canvas_front.strokeStyle = "rgba(" + color_rgb.r + ", " + color_rgb.g + ", " + color_rgb.b + ", " + ALPHA / 255 + ")";
      canvas_front.lineWidth = GUI.action_data().attributes.size;
      if (attribute_type == 'Multi-line' && this.last_line[0] != undefined) {
        from_x = this.last_line[0];
        from_y = this.last_line[1];
      }
      if (EVENTS.ctrl_pressed == true) {
        if (Math.abs(from_x - mouse.x) < Math.abs(from_y - mouse.y))
          xx = from_x;
        else
          yy = from_y;
      }

      //arrow
      if (attribute_type == 'Arrow') {
        var headlen = GUI.action_data().attributes.size * 5;
        if (headlen < 15)
          headlen = 15;
        EL.arrow(canvas_front, from_x + 0.5, from_y + 0.5, xx + 0.5, yy + 0.5, headlen);
      }
      //line
      else {
        canvas_front.moveTo(from_x + 0.5, from_y + 0.5);
        canvas_front.lineTo(xx + 0.5, yy + 0.5);
        canvas_front.stroke();
      }
    } else if (type == 'click') {
      //curve
      if (attribute_type == 'Curve') {
        EDIT.save_state();

        canvas_active().beginPath();
        canvas_active().strokeStyle = "rgba(" + color_rgb.r + ", " + color_rgb.g + ", " + color_rgb.b + ", " + ALPHA / 255 + ")";
        canvas_active().lineWidth = GUI.action_data().attributes.size;
        if (EVENTS.ctrl_pressed == true) {
          if (Math.abs(from_x - mouse.x) < Math.abs(from_y - mouse.y))
            xx = from_x;
          else
            yy = from_y;
        }
        if (curve_points.length == 2) {
          canvas_active().beginPath();
          canvas_active().moveTo(curve_points[0][0] + 0.5, curve_points[0][1] + 0.5);
          canvas_active().quadraticCurveTo(xx + 0.5, yy + 0.5, curve_points[1][0], curve_points[1][1]);
          canvas_active().stroke();
          curve_points = [];
        }
      }
    } else if (type == 'release') {
      document.body.style.cursor = "auto";
      if (mouse.x - mouse.click_x == 0 && mouse.y - mouse.click_y == 0 && attribute_type != 'Multi-line')
        return false;

      EDIT.save_state();

      canvas_active().beginPath();
      canvas_active().strokeStyle = "rgba(" + color_rgb.r + ", " + color_rgb.g + ", " + color_rgb.b + ", " + ALPHA / 255 + ")";
      canvas_active().lineWidth = GUI.action_data().attributes.size;
      if (attribute_type == 'Multi-line' && this.last_line[0] != undefined) {
        from_x = DRAW.last_line[0];
        from_y = DRAW.last_line[1];
      }
      if (EVENTS.ctrl_pressed == true) {
        if (Math.abs(from_x - mouse.x) < Math.abs(from_y - mouse.y))
          xx = from_x;
        else
          yy = from_y;
      }
      //arrow
      if (attribute_type == 'Arrow') {
        var headlen = GUI.action_data().attributes.size * 5;
        if (headlen < 15)
          headlen = 15;
        EL.arrow(canvas_active(), from_x + 0.5, from_y + 0.5, xx + 0.5, yy + 0.5, headlen);
        this.last_line[0] = xx;
        this.last_line[1] = yy;
      }
      //curve
      else if (attribute_type == 'Curve') {
        if (curve_points.length == 0 && (mouse.click_x != mouse.x || mouse.click_y != mouse.y)) {
          curve_points.push([mouse.click_x, mouse.click_y]);
          curve_points.push([xx, yy]);
        } else if (curve_points.length == 2)
          curve_points = [];
      }
      //line
      else {
        EL.line(canvas_active(), from_x, from_y, xx, yy);
        this.last_line[0] = xx;
        this.last_line[1] = yy;
      }
    }
  };
  this.letters = function (type, mouse, event) {
    var _this = this;
    if (mouse.valid == false)
      return true;
    var xx = mouse.x;
    var yy = mouse.y;
    if (type == 'click') {
      POP.add({name: "text", title: "Text:", value: "", type: 'textarea'});
      POP.add({name: "size", title: "Size:", value: 20, range: [2, 1000], step: 2});
      POP.add({name: "color", title: "Color:", value: "#000000", type: "color"});
      POP.add({name: "style", title: "Font style:", values: ["Normal", "Italic", "Bold", "Bold Italic"], type: 'select'});
      POP.add({name: "family", title: "Font family:", values: ["Arial", "Courier", "Impact", "Helvetica", "monospace", "Times New Roman", "Verdana"], type: 'select'});
      POP.add({name: "size_3d", title: "3D size:", value: 0, range: [0, 200]});
      POP.add({name: "pos_3d", title: "3D position:", values: ["Top-left", "Top-right", "Bottom-left", "Bottom-right"], type: 'select'});
      POP.add({name: "shadow", title: "Shadow:", values: ["No", "Yes"]});
      POP.add({name: "shadow_blur", title: "Shadow blur:", value: 6, range: [1, 20]});
      POP.add({name: "shadow_color", title: "Shadow color:", value: "#000000", type: "color"});
      POP.add({name: "fill_style", title: "Fill style:", values: ["Fill", "Stroke", "Both"], type: 'select'});
      POP.add({name: "stroke_size", title: "Stroke size:", value: 1, range: [1, 100]});
      POP.preview_in_main = true;
      POP.show(
              'Text',
              function (user_response) {
                EDIT.save_state();
                text = user_response.text.split("\n");
                for (var i in text) {
                  user_response.text = text[i];
                  var yyy = yy + i * (parseInt(user_response.size) + 2);
                  _this.letters_render(canvas_active(), xx, yyy, user_response);
                }
                canvas_front.clearRect(0, 0, WIDTH, HEIGHT);
              },
              function (user_response) {
                canvas_front.clearRect(0, 0, WIDTH, HEIGHT);
                text = user_response.text.split("\n");
                for (var i in text) {
                  user_response.text = text[i];
                  var yyy = yy + i * (parseInt(user_response.size) + 2);
                  _this.letters_render(canvas_front, xx, yyy, user_response);
                }
              }
      );
    }
  };
  this.letters_render = function (canvas, xx, yy, user_response) {
    var text = user_response.text;
    var size = parseInt(user_response.size);
    var color = user_response.color;
    var dpth = parseInt(user_response.size_3d);
    var pos_3d = user_response.pos_3d;
    var shadow = user_response.shadow;
    var shadow_blur = parseInt(user_response.shadow_blur);
    var shadow_color = user_response.shadow_color;
    var font = user_response.family;
    var font_style = user_response.style;
    var fill_style = user_response.fill_style;
    var stroke_size = user_response.stroke_size;
    var dx;
    var dy;
    if (pos_3d == "Top-left") {
      dx = -1;
      dy = -1;
    } else if (pos_3d == "Top-right") {
      dx = 1;
      dy = -1;
    } else if (pos_3d == "Bottom-left") {
      dx = -1;
      dy = 1;
    } else if (pos_3d == "Bottom-right") {
      dx = 1;
      dy = 1;
    }

    var color_rgb = HELPER.hex2rgb(color);
    canvas.fillStyle = "rgba(" + color_rgb.r + ", " + color_rgb.g + ", " + color_rgb.b + ", " + ALPHA / 255 + ")";
    canvas.font = font_style + " " + size + "px " + font;
    var letters_height = HELPER.font_pixel_to_height(size);

    //shadow
    if (shadow == 'Yes') {
      canvas.save();
      canvas.shadowColor = shadow_color;
      canvas.shadowBlur = shadow_blur;
      canvas.shadowOffsetX = dx;
      canvas.shadowOffsetY = dy;
      canvas.fillText(text, xx + dx * (dpth - 1), yy + letters_height + dy * (dpth - 1));
      canvas.restore();
    }

    //3d
    if (dpth > 0) {
      canvas.fillStyle = HELPER.darkenColor(COLOR, -30);
      alpha_tmp = ALPHA;
      if (alpha_tmp < 255)
        alpha_tmp /= 10;

      color_rgb.r -= 50;
      color_rgb.g -= 50;
      color_rgb.b -= 50;
      if (color_rgb.r < 0)
        color_rgb.r *= -1;
      if (color_rgb.g < 0)
        color_rgb.g *= -1;
      if (color_rgb.b < 0)
        color_rgb.b *= -1;

      canvas.fillStyle = "rgba(" + color_rgb.r + ", " + color_rgb.g + ", " + color_rgb.b + ", " + alpha_tmp / 255 + ")";
      for (cnt = 0; cnt < dpth; cnt++)
        canvas.fillText(text, xx + dx * cnt, yy + letters_height + dy * cnt);
      color_rgb = HELPER.hex2rgb(COLOR);
    }

    //main text
    canvas.fillStyle = "rgba(" + color_rgb.r + ", " + color_rgb.g + ", " + color_rgb.b + ", " + ALPHA / 255 + ")";
    canvas.strokeStyle = "rgba(" + color_rgb.r + ", " + color_rgb.g + ", " + color_rgb.b + ", " + ALPHA / 255 + ")";
    canvas.lineWidth = stroke_size;
    if (fill_style == 'Fill' || fill_style == 'Both')
      canvas.fillText(text, xx, yy + letters_height);
    if (fill_style == 'Stroke' || fill_style == 'Both')
      canvas.strokeText(text, xx, yy + letters_height);

    GUI.zoom();
  };
  this.draw_square = function (type, mouse, event) {
    if (mouse.click_valid == false)
      return true;
    var color_rgb = HELPER.hex2rgb(COLOR);
    var fill = GUI.action_data().attributes.fill;
    var width = mouse.x - mouse.click_x;
    var height = mouse.y - mouse.click_y;

    if (type == 'drag') {
      canvas_front.clearRect(0, 0, WIDTH, HEIGHT);
      canvas_front.fillStyle = "rgba(" + color_rgb.r + ", " + color_rgb.g + ", " + color_rgb.b + ", " + ALPHA / 255 + ")";
      canvas_front.strokeStyle = "rgba(" + color_rgb.r + ", " + color_rgb.g + ", " + color_rgb.b + ", " + ALPHA / 255 + ")";
      canvas_front.lineWidth = 1;

      if (GUI.action_data().attributes.square == true)
        EL.square(canvas_front, mouse.click_x, mouse.click_y, width, height, fill);
      else
        EL.rectangle(canvas_front, mouse.click_x, mouse.click_y, width, height, fill);
    } else if (type == 'release') {
      if (mouse.x == mouse.click_x && mouse.y == mouse.click_y)
        return false;
      EDIT.save_state();

      canvas_active().fillStyle = "rgba(" + color_rgb.r + ", " + color_rgb.g + ", " + color_rgb.b + ", " + ALPHA / 255 + ")";
      canvas_active().strokeStyle = "rgba(" + color_rgb.r + ", " + color_rgb.g + ", " + color_rgb.b + ", " + ALPHA / 255 + ")";
      canvas_active().lineWidth = 1;

      if (GUI.action_data().attributes.square == true)
        EL.square(canvas_active(), mouse.click_x, mouse.click_y, width, height, fill);
      else
        EL.rectangle(canvas_active(), mouse.click_x, mouse.click_y, width, height, fill);
    }
  };
  this.draw_circle = function (type, mouse, event) {
    if (mouse.click_valid == false)
      return true;
    var color_rgb = HELPER.hex2rgb(COLOR);
    if (type == 'drag') {
      dist_x = mouse.x - mouse.click_x;
      dist_y = mouse.y - mouse.click_y;
      canvas_front.clearRect(0, 0, WIDTH, HEIGHT);
      if (GUI.action_data().attributes.circle == true)
        dist_x = dist_y = Math.min(dist_x, dist_y);
      if (GUI.action_data().attributes.fill == true)
        EL.ellipse_by_center(canvas_front, mouse.click_x, mouse.click_y, dist_x * 2, dist_y * 2, "rgba(" + color_rgb.r + ", " + color_rgb.g + ", " + color_rgb.b + ", " + ALPHA / 255 + ")", true);
      else
        EL.ellipse_by_center(canvas_front, mouse.click_x, mouse.click_y, dist_x * 2, dist_y * 2, "rgba(" + color_rgb.r + ", " + color_rgb.g + ", " + color_rgb.b + ", " + ALPHA / 255 + ")");
    } else if (type == 'release') {
      dist_x = mouse.x - mouse.click_x;
      dist_y = mouse.y - mouse.click_y;
      if (dist_x == 0 && dist_y == 0)
        return false;
      EDIT.save_state();
      if (GUI.action_data().attributes.circle == true)
        dist_x = dist_y = Math.min(dist_x, dist_y);
      canvas_active().lineWidth = 1;
      if (GUI.action_data().attributes.fill == true)
        EL.ellipse_by_center(canvas_active(), mouse.click_x, mouse.click_y, dist_x * 2, dist_y * 2, "rgba(" + color_rgb.r + ", " + color_rgb.g + ", " + color_rgb.b + ", " + ALPHA / 255 + ")", true);
      else
        EL.ellipse_by_center(canvas_active(), mouse.click_x, mouse.click_y, dist_x * 2, dist_y * 2, "rgba(" + color_rgb.r + ", " + color_rgb.g + ", " + color_rgb.b + ", " + ALPHA / 255 + ")");
    }
  };
  this.update_brush = function () {
    document.getElementById('anti_aliasing').style.display = '';
    if (GUI.action_data().attributes.type != 'Brush')
      document.getElementById('anti_aliasing').style.display = 'none';
  };
  this.desaturate_tool = function (type, mouse, event) {
    if (mouse.valid == false)
      return true;
    var size = GUI.action_data().attributes.size;
    var xx = mouse.x - size / 2;
    var yy = mouse.y - size / 2;
    if (xx < 0)
      xx = 0;
    if (yy < 0)
      yy = 0;

    if (type == 'click') {
      EDIT.save_state();
      var imageData = canvas_active().getImageData(xx, yy, size, size);
      var filtered = ImageFilters.GrayScale(imageData);	//add effect
      EL.image_round(canvas_active(), mouse.x, mouse.y, size, filtered, document.getElementById("canvas_front"), GUI.action_data().attributes.anti_aliasing);
    } else if (type == 'drag') {
      var imageData = canvas_active().getImageData(xx, yy, size, size);
      var filtered = ImageFilters.GrayScale(imageData);	//add effect
      EL.image_round(canvas_active(), mouse.x, mouse.y, size, filtered, document.getElementById("canvas_front"), GUI.action_data().attributes.anti_aliasing);
    }
    if (type == 'move' || type == 'drag') {
      //show size
      canvas_front.clearRect(0, 0, WIDTH, HEIGHT);
      EL.circle(canvas_front, mouse.x, mouse.y, size);
    }
  };
  this.brush = function (type, mouse, event) {
    if (mouse.valid == false)
      return true;
    var brush_type = GUI.action_data().attributes.type;
    var color_rgb = HELPER.hex2rgb(COLOR);
    var size = GUI.action_data().attributes.size;

    if (type == 'click')
      EDIT.save_state();

    if (brush_type == 'Brush') {
      if (type == 'click') {
        //init settings
        canvas_active().beginPath();
        canvas_active().strokeStyle = "rgba(" + color_rgb.r + ", " + color_rgb.g + ", " + color_rgb.b + ", " + ALPHA / 255 + ")";
        canvas_active().lineWidth = GUI.action_data().attributes.size;
        canvas_active().lineCap = 'round';
        canvas_active().lineJoin = 'round';

        canvas_front.clearRect(0, 0, WIDTH, HEIGHT);
        if (ALPHA < 255) {
          canvas_front.beginPath();
          canvas_front.strokeStyle = "rgba(" + color_rgb.r + ", " + color_rgb.g + ", " + color_rgb.b + ", " + ALPHA / 255 + ")";
          canvas_front.lineWidth = GUI.action_data().attributes.size;
          canvas_front.lineCap = 'round';
          canvas_front.lineJoin = 'round';
        }

        canvas_front.beginPath();
        canvas_front.arc(mouse.x, mouse.y, GUI.action_data().attributes.size / 2, 0, 2 * Math.PI, false);
        canvas_front.fillStyle = "rgba(" + color_rgb.r + ", " + color_rgb.g + ", " + color_rgb.b + ", " + ALPHA / 255 + ")";
        canvas_front.fill();

        //blur
        canvas_active().shadowBlur = 0;
        if (GUI.action_data().attributes.anti_aliasing == true) {
          canvas_active().shadowColor = "rgba(" + color_rgb.r + ", " + color_rgb.g + ", " + color_rgb.b + ", " + ALPHA / 255 + ")";
          canvas_active().shadowBlur = Math.round(GUI.action_data().attributes.size);
        }
      } else if (type == 'drag' && mouse.last_x != false && mouse.last_y != false) {
        if (ALPHA == 255)
          canvas_active().beginPath();
        canvas_active().moveTo(mouse.last_x, mouse.last_y);
        canvas_active().lineTo(mouse.x, mouse.y);
        if (ALPHA == 255)
          canvas_active().stroke();

        //now draw preview
        if (ALPHA < 255) {
          canvas_front.beginPath();
          //clean from last line
          canvas_front.globalCompositeOperation = "destination-out";
          canvas_front.strokeStyle = "rgba(" + color_rgb.r + ", " + color_rgb.g + ", " + color_rgb.b + ", 1)";
          canvas_front.moveTo(mouse.last_x, mouse.last_y);
          canvas_front.lineTo(mouse.x, mouse.y);
          canvas_front.stroke();
          //reset
          canvas_front.strokeStyle = "rgba(" + color_rgb.r + ", " + color_rgb.g + ", " + color_rgb.b + ", " + ALPHA / 255 + ")";
          canvas_front.globalCompositeOperation = "source-over";
          //draw new line segment
          canvas_front.moveTo(mouse.last_x, mouse.last_y);
          canvas_front.lineTo(mouse.x, mouse.y);
          canvas_front.stroke();
        }
      } else if (type == 'release') {
        canvas_front.clearRect(0, 0, WIDTH, HEIGHT);
        //paint everything
        canvas_active().stroke();

        //if mouse was not moved
        if (mouse.click_x == mouse.x && mouse.click_y == mouse.y) {
          canvas_active().beginPath();
          canvas_active().arc(mouse.x, mouse.y, GUI.action_data().attributes.size / 2, 0, 2 * Math.PI, false);
          canvas_active().fillStyle = "rgba(" + color_rgb.r + ", " + color_rgb.g + ", " + color_rgb.b + ", " + ALPHA / 255 + ")";
          canvas_active().fill();
        }
        canvas_active().shadowBlur = 0;
      } else if (type == 'move') {
        //show size
        canvas_front.clearRect(0, 0, WIDTH, HEIGHT);
        EL.circle(canvas_front, mouse.x, mouse.y, size);
      }
    } else if (brush_type == 'BezierCurve') {
      if (type == 'click')
        BezierCurveBrush.startCurve(mouse.x, mouse.y);
      else if (type == 'drag' && mouse.last_x != false && mouse.last_y != false) {
        var color_rgb = HELPER.hex2rgb(COLOR);
        canvas_active().strokeStyle = "rgba(" + color_rgb.r + ", " + color_rgb.g + ", " + color_rgb.b + ", " + ALPHA / 255 + ")";
        canvas_active().lineWidth = 0.5;

        BezierCurveBrush.draw(canvas_active(), color_rgb, mouse.x, mouse.y, GUI.action_data().attributes.size);
      }
    } else if (brush_type == 'Chrome') {
      if (type == 'click') {
        chrome_brush.init(canvas_active());
        chrome_brush.strokeStart(mouse.x, mouse.y);
      } else if (type == 'drag' && mouse.last_x != false && mouse.last_y != false) {
        var color_rgb = HELPER.hex2rgb(COLOR);
        canvas_active().strokeStyle = "rgba(" + color_rgb.r + ", " + color_rgb.g + ", " + color_rgb.b + ", " + ALPHA / 255 + ")";
        canvas_active().lineWidth = 1;

        chrome_brush.stroke(color_rgb, mouse.x, mouse.y, GUI.action_data().attributes.size);
      }
    } else if (brush_type == 'Fur') {
      if (type == 'click') {
        points = new Array();
        prevMouseX = mouse.x;
        prevMouseY = mouse.y;
        count = 0;
      } else if (type == 'drag' && mouse.last_x != false && mouse.last_y != false) {
        var color_rgb = HELPER.hex2rgb(COLOR);
        canvas_active().strokeStyle = "rgba(" + color_rgb.r + ", " + color_rgb.g + ", " + color_rgb.b + ", 0.1)";
        canvas_active().lineWidth = 1;

        f = mouse.x;
        c = mouse.y;
        var e, b, a, g;
        points.push([f, c]);
        canvas_active().beginPath();
        canvas_active().moveTo(prevMouseX, prevMouseY);
        canvas_active().lineTo(f, c);
        canvas_active().stroke();
        for (e = 0; e < points.length; e++) {
          b = points[e][0] - points[count][0];
          a = points[e][1] - points[count][1];
          g = b * b + a * a;
          var g_size = Math.round(400 * GUI.action_data().attributes.size);
          if (g < g_size && Math.random() > g / g_size) {
            canvas_active().beginPath();
            canvas_active().moveTo(f + (b * 0.5), c + (a * 0.5));
            canvas_active().lineTo(f - (b * 0.5), c - (a * 0.5));
            canvas_active().stroke();
          }
        }
        prevMouseX = f;
        prevMouseY = c;
        count++;
      }
    } else if (brush_type == 'Grouped') {
      groups_n = GUI.action_data().attributes.size;
      gsize = 10;
      random_power = 5;

      if (type == 'click') {
        chrome_brush.init(canvas_active());
        chrome_brush.strokeStart(mouse.x, mouse.y);
        groups = [];

        for (var g = 0; g < groups_n; g++) {
          groups[g] = {};
          groups[g].x = HELPER.getRandomInt(-gsize, gsize);
          groups[g].y = HELPER.getRandomInt(-gsize, gsize);
        }
      } else if (type == 'drag' && mouse.last_x != false && mouse.last_y != false) {
        canvas_active().strokeStyle = "rgba(" + color_rgb.r + ", " + color_rgb.g + ", " + color_rgb.b + ", " + ALPHA / 255 + ")";
        canvas_active().lineWidth = 0.5;

        for (var g in groups) {
          canvas_active().beginPath();
          canvas_active().moveTo(mouse.last_x + groups[g].x, mouse.last_y + groups[g].y);

          //randomize here
          groups[g].x += HELPER.getRandomInt(-random_power, random_power);
          groups[g].y += HELPER.getRandomInt(-random_power, random_power);
          if (groups[g].x < -gsize)
            groups[g].x = -gsize + random_power;
          if (groups[g].y < -gsize)
            groups[g].y = -gsize + random_power;
          if (groups[g].x > gsize)
            groups[g].x = gsize - random_power;
          if (groups[g].y > gsize)
            groups[g].y = gsize - random_power;

          canvas_active().lineTo(mouse.x + groups[g].x, mouse.y + groups[g].y);
          canvas_active().stroke();
        }
      }
    } else if (brush_type == 'Shaded') {
      if (type == 'click') {
        shaded_brush.init(canvas_active());
        shaded_brush.strokeStart(mouse.x, mouse.y);
      } else if (type == 'drag' && mouse.last_x != false && mouse.last_y != false) {
        var color_rgb = HELPER.hex2rgb(COLOR);
        canvas_active().strokeStyle = "rgba(" + color_rgb.r + ", " + color_rgb.g + ", " + color_rgb.b + ", " + ALPHA / 255 + ")";
        canvas_active().lineWidth = 1;

        shaded_brush.stroke(color_rgb, mouse.x, mouse.y, GUI.action_data().attributes.size);
      }
    } else if (brush_type == 'Sketchy') {
      if (type == 'click') {
        sketchy_brush.init(canvas_active());
        sketchy_brush.strokeStart(mouse.x, mouse.y);
      } else if (type == 'drag' && mouse.last_x != false && mouse.last_y != false) {
        var color_rgb = HELPER.hex2rgb(COLOR);
        canvas_active().strokeStyle = "rgba(" + color_rgb.r + ", " + color_rgb.g + ", " + color_rgb.b + ", " + ALPHA / 255 + ")";
        canvas_active().lineWidth = 1;

        sketchy_brush.stroke(color_rgb, mouse.x, mouse.y, GUI.action_data().attributes.size);
      }
    }
  };
  this.gradient_tool = function (type, mouse, event) {
    if (mouse != undefined && mouse.valid == false && type != 'init')
      return true;
    var power = GUI.action_data().attributes.power;
    if (power > 99)
      power = 99;

    if (type == 'init') {
      POP.add({name: "param1", title: "Color #1:", value: '#000000', type: 'color'});
      POP.add({name: "param2", title: "Transparency #1:", value: '255', range: [0, 255]});
      POP.add({name: "param3", title: "Color #2:", value: '#ffffff', type: 'color'});
      POP.add({name: "param4", title: "Transparency #2:", value: '255', range: [0, 255]});
      POP.show(
              'Text',
              function (user_response) {
                color1 = HELPER.hex2rgb(user_response.param1);
                color1.a = parseInt(user_response.param2);

                color2 = HELPER.hex2rgb(user_response.param3);
                color2.a = parseInt(user_response.param4);
              }
      );
    } else if (type == 'drag') {
      canvas_front.clearRect(0, 0, WIDTH, HEIGHT);

      if (GUI.action_data().attributes.radial == false) {
        //linear
        canvas_front.rect(0, 0, WIDTH, HEIGHT);
        if (mouse.x > mouse.click_x) {
          var grd = canvas_front.createLinearGradient(
                  mouse.click_x, mouse.click_y,
                  mouse.x, mouse.y);
        } else {
          var grd = canvas_front.createLinearGradient(
                  mouse.x, mouse.y,
                  mouse.click_x, mouse.click_y);
        }
        grd.addColorStop(0, "rgba(" + color1.r + ", " + color1.g + ", " + color1.b + ", " + color1.a / 255 + ")");
        grd.addColorStop(1, "rgba(" + color2.r + ", " + color2.g + ", " + color2.b + ", " + color2.a / 255 + ")");
        canvas_front.fillStyle = grd;
        canvas_front.fill();
      } else {
        //radial
        var dist_x = mouse.click_x - mouse.x;
        var dist_y = mouse.click_y - mouse.y;
        var distance = Math.sqrt((dist_x * dist_x) + (dist_y * dist_y));
        var radgrad = canvas_front.createRadialGradient(
                mouse.click_x, mouse.click_y, distance * power / 100,
                mouse.click_x, mouse.click_y, distance);
        radgrad.addColorStop(0, "rgba(" + color1.r + ", " + color1.g + ", " + color1.b + ", " + color1.a / 255 + ")");
        radgrad.addColorStop(1, "rgba(" + color2.r + ", " + color2.g + ", " + color2.b + ", " + color2.a / 255 + ")");

        canvas_front.fillStyle = radgrad;
        canvas_front.fillRect(0, 0, WIDTH, HEIGHT);
      }
      //draw line
      canvas_front.beginPath();
      canvas_front.strokeStyle = "#ff0000";
      canvas_front.lineWidth = 1;
      var xx = mouse.x;
      var yy = mouse.y;
      canvas_front.moveTo(mouse.click_x + 0.5, mouse.click_y + 0.5);
      canvas_front.lineTo(xx + 0.5, yy + 0.5);
      canvas_front.stroke();
    } else if (type == 'release') {
      EDIT.save_state();
      if (GUI.action_data().attributes.radial == false) {
        //linear
        canvas_active().rect(0, 0, WIDTH, HEIGHT);
        if (mouse.x > mouse.click_x) {
          var grd = canvas_active().createLinearGradient(
                  mouse.click_x, mouse.click_y,
                  mouse.x, mouse.y);
        } else {
          var grd = canvas_active().createLinearGradient(
                  mouse.x, mouse.y,
                  mouse.click_x, mouse.click_y);
        }
        grd.addColorStop(0, "rgba(" + color1.r + ", " + color1.g + ", " + color1.b + ", " + color1.a / 255 + ")");
        grd.addColorStop(1, "rgba(" + color2.r + ", " + color2.g + ", " + color2.b + ", " + color2.a / 255 + ")");
        canvas_active().fillStyle = grd;
        canvas_active().fill();
      } else {
        //radial
        var dist_x = mouse.click_x - mouse.x;
        var dist_y = mouse.click_y - mouse.y;
        var distance = Math.sqrt((dist_x * dist_x) + (dist_y * dist_y));
        var radgrad = canvas_active().createRadialGradient(
                mouse.click_x, mouse.click_y, distance * power / 100,
                mouse.click_x, mouse.click_y, distance);
        radgrad.addColorStop(0, "rgba(" + color1.r + ", " + color1.g + ", " + color1.b + ", " + color1.a / 255 + ")");
        radgrad.addColorStop(1, "rgba(" + color2.r + ", " + color2.g + ", " + color2.b + ", " + color2.a / 255 + ")");

        canvas_active().fillStyle = radgrad;
        canvas_active().fillRect(0, 0, WIDTH, HEIGHT);
      }
    }
  };
  this.blur_tool = function (type, mouse, event) {
    if (mouse.valid == false)
      return true;
    var size = GUI.action_data().attributes.size;
    var size_half = Math.round(size / 2);
    var xx = mouse.x - size / 2;
    var yy = mouse.y - size / 2;
    if (xx < 0)
      xx = 0;
    if (yy < 0)
      yy = 0;
    if (type == 'click') {
      EDIT.save_state();
      var param1 = GUI.action_data().attributes.power;
      var imageData = canvas_active().getImageData(xx, yy, size, size);
      var filtered = ImageFilters.StackBlur(imageData, param1);	//add effect
      EL.image_round(canvas_active(), mouse.x, mouse.y, size, filtered, document.getElementById("canvas_front"));

      //show size
      canvas_front.clearRect(0, 0, WIDTH, HEIGHT);
      EL.circle(canvas_front, mouse.x, mouse.y, size);
    } else if (type == 'drag') {
      var param1 = GUI.action_data().attributes.power;
      var imageData = canvas_active().getImageData(xx, yy, size, size);
      var filtered = ImageFilters.StackBlur(imageData, param1);	//add effect
      EL.image_round(canvas_active(), mouse.x, mouse.y, size, filtered, document.getElementById("canvas_front"));

      //show size
      canvas_front.clearRect(0, 0, WIDTH, HEIGHT);
      EL.circle(canvas_front, mouse.x, mouse.y, size);
    } else if (type == 'move') {
      //show size
      canvas_front.clearRect(0, 0, WIDTH, HEIGHT);
      EL.circle(canvas_front, mouse.x, mouse.y, size);
    }
  };
  this.sharpen_tool = function (type, mouse, event) {
    if (mouse.valid == false)
      return true;
    var size = GUI.action_data().attributes.size;
    var param1 = 0.5;
    var xx = mouse.x - size / 2;
    var yy = mouse.y - size / 2;
    if (xx < 0)
      xx = 0;
    if (yy < 0)
      yy = 0;

    if (type == 'click') {
      EDIT.save_state();
      var imageData = canvas_active().getImageData(xx, yy, size, size);
      var filtered = ImageFilters.Sharpen(imageData, param1);	//add effect
      EL.image_round(canvas_active(), mouse.x, mouse.y, size, filtered, document.getElementById("canvas_front"));

      canvas_front.clearRect(0, 0, WIDTH, HEIGHT);
      EL.circle(canvas_front, mouse.x, mouse.y, size);
    } else if (type == 'drag') {
      var imageData = canvas_active().getImageData(xx, yy, size, size);
      var filtered = ImageFilters.Sharpen(imageData, param1);	//add effect
      EL.image_round(canvas_active(), mouse.x, mouse.y, size, filtered, document.getElementById("canvas_front"));

      canvas_front.clearRect(0, 0, WIDTH, HEIGHT);
      EL.circle(canvas_front, mouse.x, mouse.y, size);
    } else if (type == 'move') {
      //show size
      canvas_front.clearRect(0, 0, WIDTH, HEIGHT);
      EL.circle(canvas_front, mouse.x, mouse.y, size);
    }
  };
  this.burn_dodge_tool = function (type, mouse, event) {
    if (mouse.valid == false)
      return true;
    var size = GUI.action_data().attributes.size;
    var power = GUI.action_data().attributes.power * 2.5;

    if (type == 'click') {
      EDIT.save_state();
      canvas_front.clearRect(0, 0, WIDTH, HEIGHT);
      canvas_front.save();
      EVENTS.clear_front_on_release = false;

      //init settings
      canvas_active().beginPath();
      canvas_active().lineWidth = GUI.action_data().attributes.size;
      canvas_active().lineCap = 'round';
      canvas_active().lineJoin = 'round';

      canvas_front.beginPath();
      if (GUI.action_data().attributes.burn == true)
        canvas_front.strokeStyle = "rgba(0, 0, 0, " + power / 255 + ")";
      else
        canvas_front.strokeStyle = "rgba(255, 255, 255, " + power / 255 + ")";
      canvas_front.lineWidth = GUI.action_data().attributes.size;
      canvas_front.lineCap = 'round';
      canvas_front.lineJoin = 'round';
    } else if (type == 'drag' && mouse.last_x != false && mouse.last_y != false) {
      //now draw preview
      canvas_front.beginPath();
      //clean from last line
      canvas_front.globalCompositeOperation = "destination-out";
      canvas_front.moveTo(mouse.last_x, mouse.last_y);
      canvas_front.lineTo(mouse.x, mouse.y);
      canvas_front.stroke();
      //reset
      canvas_front.globalCompositeOperation = "source-over";
      //draw new line segment
      canvas_front.moveTo(mouse.last_x, mouse.last_y);
      canvas_front.lineTo(mouse.x, mouse.y);
      canvas_front.stroke();
    } else if (type == 'release') {
      canvas_active().globalCompositeOperation = "soft-light";
      canvas_active().shadowBlur = 5;
      canvas_active().drawImage(document.getElementById("canvas_front"), 0, 0);
      canvas_active().globalCompositeOperation = "source-over";
      canvas_front.clearRect(0, 0, WIDTH, HEIGHT);
      EVENTS.clear_front_on_release = true;

      //if mouse was not moved
      if (mouse.click_x == mouse.x && mouse.click_y == mouse.y) {
        canvas_active().globalCompositeOperation = "soft-light";
        canvas_active().beginPath();
        canvas_active().arc(mouse.x, mouse.y, GUI.action_data().attributes.size / 2, 0, 2 * Math.PI, false);
        if (GUI.action_data().attributes.burn == true) {
          canvas_active().fillStyle = "rgba(0, 0, 0, " + power / 255 + ")";
        } else {
          canvas_active().fillStyle = "rgba(255, 255, 255, " + power / 255 + ")";
        }
        canvas_active().shadowBlur = 5;
        canvas_active().fill();
        canvas_active().globalCompositeOperation = "source-over";
      }
      canvas_active().shadowBlur = 0;
      canvas_front.clearRect(0, 0, WIDTH, HEIGHT);
      canvas_front.restore();
    } else if (type == 'move' && EVENTS.isDrag == false) {
      canvas_front.clearRect(0, 0, WIDTH, HEIGHT);
      EL.circle(canvas_front, mouse.x, mouse.y, size);
    }
  };
  this.crop_tool = function (type, mouse, event) {
    if (mouse.click_valid == false)
      return true;

    if (type == 'drag') {
      if (mouse.x < 0)
        mouse.x = 0;
      if (mouse.y < 0)
        mouse.y = 0;
      if (mouse.x >= WIDTH)
        mouse.x = WIDTH;
      if (mouse.y >= HEIGHT)
        mouse.y = HEIGHT;
      if (mouse.click_x >= WIDTH)
        mouse.click_x = WIDTH;
      if (mouse.click_y >= HEIGHT)
        mouse.click_y = HEIGHT;
      if (this.select_square_action == '') {
        document.body.style.cursor = "crosshair";
        canvas_front.clearRect(0, 0, WIDTH, HEIGHT);
        canvas_front.fillStyle = "rgba(0, 255, 0, 0.3)";
        canvas_front.fillRect(mouse.click_x, mouse.click_y, mouse.x - mouse.click_x, mouse.y - mouse.click_y);
      }
    } else if (type == 'move' && this.select_data != false) {
      if (EVENTS.isDrag == true)
        return true;
      canvas_front.lineWidth = 1;
      border_size = 5;
      this.select_square_action = '';

      if (this.select_square_action == ''
              && mouse.x > this.select_data.x && mouse.y > this.select_data.y
              && mouse.x < this.select_data.x + this.select_data.w && mouse.y < this.select_data.y + this.select_data.h) {
        this.select_square_action = 'move';
        document.body.style.cursor = 'pointer';
      }
      if (this.select_square_action == '' && mouse.valid == true)
        document.body.style.cursor = "auto";
    } else if (type == 'release') {
      if (mouse.x < 0)
        mouse.x = 0;
      if (mouse.y < 0)
        mouse.y = 0;
      if (mouse.x >= WIDTH)
        mouse.x = WIDTH;
      if (mouse.y >= HEIGHT)
        mouse.y = HEIGHT;
      if (mouse.click_x >= WIDTH)
        mouse.click_x = WIDTH;
      if (mouse.click_y >= HEIGHT)
        mouse.click_y = HEIGHT;

      if (this.select_square_action == '') {
        if (mouse.x != mouse.click_x && mouse.y != mouse.click_y) {
          this.select_data = {
            x: Math.min(mouse.x, mouse.click_x),
            y: Math.min(mouse.y, mouse.click_y),
            w: Math.abs(mouse.x - mouse.click_x),
            h: Math.abs(mouse.y - mouse.click_y)
          };
        }
      }
      GUI.draw_selected_area(true);

      LAYER.update_info_block();
    } else if (type == 'click' && this.select_data != false) {
      document.body.style.cursor = "auto";
      if (mouse.x > this.select_data.x && mouse.y > this.select_data.y
              && mouse.x < this.select_data.x + this.select_data.w && mouse.y < this.select_data.y + this.select_data.h) {
        EDIT.save_state();
        for (var i in LAYER.layers) {
          var layer = document.getElementById(LAYER.layers[i].name).getContext("2d");

          var tmp = layer.getImageData(this.select_data.x, this.select_data.y, this.select_data.w, this.select_data.h);
          layer.clearRect(0, 0, WIDTH, HEIGHT);
          layer.putImageData(tmp, 0, 0);
        }

        //resize
        EDIT.save_state();
        WIDTH = this.select_data.w;
        HEIGHT = this.select_data.h;
        LAYER.set_canvas_size();

        EDIT.edit_clear();
      }
    }
  };
  this.clone_tool = function (type, mouse, event) {
    if (mouse.valid == false)
      return true;
    var size = GUI.action_data().attributes.size;
    var size_half = Math.round(size / 2);

    if (type == 'click') {
      EDIT.save_state();

      if (clone_data === false) {
        POP.add({html: 'Source is empty, right click on image first.'});
        POP.show('Error', '');
      } else {
        //draw rounded image
        EL.image_round(canvas_active(), mouse.x, mouse.y, size, clone_data, document.getElementById("canvas_front"), GUI.action_data().attributes.anti_aliasing);
      }
    } else if (type == 'right_click') {
      //save clone source
      clone_data = document.createElement("canvas");
      clone_data.width = size;
      clone_data.height = size;
      var xx = mouse.x - size_half;
      var yy = mouse.y - size_half;
      if (xx < 0)
        xx = 0;
      if (yy < 0)
        yy = 0;
      clone_data.getContext("2d").drawImage(canvas_active(true), xx, yy, size, size, 0, 0, size, size);
      return false;
    } else if (type == 'drag') {
      if (event.which == 3)
        return true;
      if (clone_data === false)
        return false;	//no source

      //draw rounded image
      EL.image_round(canvas_active(), mouse.x, mouse.y, size, clone_data, document.getElementById("canvas_front"), GUI.action_data().attributes.anti_aliasing);
    } else if (type == 'move') {
      //show size
      canvas_front.clearRect(0, 0, WIDTH, HEIGHT);
      EL.circle(canvas_front, mouse.x, mouse.y, size);
    }
  };
  this.select_square = function (type, mouse, event) {
    if (mouse.click_valid == false)
      return true;
    if (type == 'drag') {
      if (mouse.x < 0)
        mouse.x = 0;
      if (mouse.y < 0)
        mouse.y = 0;
      if (mouse.x >= WIDTH)
        mouse.x = WIDTH;
      if (mouse.y >= HEIGHT)
        mouse.y = HEIGHT;
      if (mouse.click_x >= WIDTH)
        mouse.click_x = WIDTH;
      if (mouse.click_y >= HEIGHT)
        mouse.click_y = HEIGHT;
      if (this.select_square_action == '') {
        //user still selecting area
        document.body.style.cursor = "crosshair";
        canvas_front.clearRect(0, 0, WIDTH, HEIGHT);
        canvas_front.fillStyle = "rgba(0, 255, 0, 0.3)";
        canvas_front.fillRect(mouse.click_x, mouse.click_y, mouse.x - mouse.click_x, mouse.y - mouse.click_y);
      } else {
        //drag
        if (this.select_square_action == 'move') {
          //move
          try {
            canvas_front.clearRect(0, 0, WIDTH, HEIGHT);
            canvas_front.drawImage(canvas_active(true),
                    this.select_data.x, this.select_data.y, this.select_data.w, this.select_data.h,
                    mouse.x - mouse.click_x + this.select_data.x,
                    mouse.y - mouse.click_y + this.select_data.y,
                    this.select_data.w,
                    this.select_data.h);
            canvas_front.restore();
          } catch (err) {
            console.log("Error: " + err.message);
          }
        } else {
          //resize
          var s_x = this.select_data.x;
          var s_y = this.select_data.y;
          var d_x = this.select_data.w;
          var d_y = this.select_data.h;
          if (this.select_square_action == 'resize-left') {
            s_x += mouse.x - mouse.click_x;
            d_x -= mouse.x - mouse.click_x;
          } else if (this.select_square_action == 'resize-right')
            d_x += mouse.x - mouse.click_x;
          else if (this.select_square_action == 'resize-top') {
            s_y += mouse.y - mouse.click_y;
            d_y -= mouse.y - mouse.click_y;
          } else if (this.select_square_action == 'resize-bottom')
            d_y += mouse.y - mouse.click_y;
          else if (this.select_square_action == 'resize-1') {
            s_x += mouse.x - mouse.click_x;
            s_y += mouse.y - mouse.click_y;
            d_x -= mouse.x - mouse.click_x;
            d_y -= mouse.y - mouse.click_y;
          } else if (this.select_square_action == 'resize-2') {
            d_x += mouse.x - mouse.click_x;
            s_y += mouse.y - mouse.click_y;
            d_y -= mouse.y - mouse.click_y;
          } else if (this.select_square_action == 'resize-3') {
            d_x += mouse.x - mouse.click_x;
            d_y += mouse.y - mouse.click_y;
          } else if (this.select_square_action == 'resize-4') {
            s_x += mouse.x - mouse.click_x;
            d_x -= mouse.x - mouse.click_x;
            d_y += mouse.y - mouse.click_y;
          }
          var s_x = Math.max(s_x, 0);
          var s_y = Math.max(s_y, 0);
          var d_x = Math.max(d_x, 0);
          var d_y = Math.max(d_y, 0);

          canvas_front.save();
          canvas_front.clearRect(0, 0, WIDTH, HEIGHT);

          canvas_front.mozImageSmoothingEnabled = false;
          canvas_front.webkitImageSmoothingEnabled = false;
          canvas_front.msImageSmoothingEnabled = false;
          canvas_front.ImageSmoothingEnabled = false;

          canvas_front.drawImage(canvas_active(true),
                  this.select_data.x, this.select_data.y, this.select_data.w, this.select_data.h,
                  s_x, s_y, d_x, d_y);
          canvas_front.restore();
        }
      }
    } else if (type == 'move' && this.select_data != false) {
      if (EVENTS.isDrag == true)
        return true;
      canvas_front.lineWidth = 1;
      border_size = 5;
      this.select_square_action = '';
      var sr_size = Math.ceil(EVENTS.sr_size / GUI.ZOOM * 100);

      //left
      if (this.check_mouse_pos(this.select_data.x, this.select_data.y + this.select_data.h / 2, sr_size, mouse.x, mouse.y) == true) {
        document.body.style.cursor = "w-resize";
        this.select_square_action = 'resize-left';
      }
      //top
      else if (this.check_mouse_pos(this.select_data.x + this.select_data.w / 2, this.select_data.y, sr_size, mouse.x, mouse.y) == true) {
        document.body.style.cursor = "n-resize";
        this.select_square_action = 'resize-top';
      }
      //right
      else if (this.check_mouse_pos(this.select_data.x + this.select_data.w - sr_size, this.select_data.y + this.select_data.h / 2, sr_size, mouse.x, mouse.y) == true) {
        document.body.style.cursor = "w-resize";
        this.select_square_action = 'resize-right';
      }
      //bottom
      else if (this.check_mouse_pos(this.select_data.x + this.select_data.w / 2, this.select_data.y + this.select_data.h - sr_size, sr_size, mouse.x, mouse.y) == true) {
        document.body.style.cursor = "n-resize";
        this.select_square_action = 'resize-bottom';
      }

      //corner 1
      if (this.check_mouse_pos(this.select_data.x, this.select_data.y, sr_size, mouse.x, mouse.y) == true) {
        document.body.style.cursor = "nw-resize";
        this.select_square_action = 'resize-1';
      }
      //corner 2
      else if (this.check_mouse_pos(this.select_data.x + this.select_data.w - sr_size, this.select_data.y, sr_size, mouse.x, mouse.y) == true) {
        document.body.style.cursor = "ne-resize";
        this.select_square_action = 'resize-2';
      }
      //corner 3
      else if (this.check_mouse_pos(this.select_data.x + this.select_data.w - sr_size, this.select_data.y + this.select_data.h - sr_size, sr_size, mouse.x, mouse.y) == true) {
        document.body.style.cursor = "nw-resize";
        this.select_square_action = 'resize-3';
      }
      //corner 4
      else if (this.check_mouse_pos(this.select_data.x, this.select_data.y + this.select_data.h - sr_size, sr_size, mouse.x, mouse.y) == true) {
        document.body.style.cursor = "ne-resize";
        this.select_square_action = 'resize-4';
      }

      if (this.select_square_action == ''
              && mouse.x > this.select_data.x && mouse.y > this.select_data.y
              && mouse.x < this.select_data.x + this.select_data.w && mouse.y < this.select_data.y + this.select_data.h) {
        this.select_square_action = 'move';
        document.body.style.cursor = "move";
      }
      if (this.select_square_action == '' && mouse.valid == true)
        document.body.style.cursor = "auto";
    } else if (type == 'release') {
      if (mouse.x < 0)
        mouse.x = 0;
      if (mouse.y < 0)
        mouse.y = 0;
      if (mouse.x >= WIDTH)
        mouse.x = WIDTH;
      if (mouse.y >= HEIGHT)
        mouse.y = HEIGHT;
      if (mouse.click_x >= WIDTH)
        mouse.click_x = WIDTH;
      if (mouse.click_y >= HEIGHT)
        mouse.click_y = HEIGHT;

      if (this.select_square_action == '') {
        if (mouse.x != mouse.click_x && mouse.y != mouse.click_y) {
          this.select_data = {
            x: Math.min(mouse.x, mouse.click_x),
            y: Math.min(mouse.y, mouse.click_y),
            w: Math.abs(mouse.x - mouse.click_x),
            h: Math.abs(mouse.y - mouse.click_y)
          };
        }
      } else {
        if (mouse.x - mouse.click_x == 0 && mouse.y - mouse.click_y == 0)
          return false;
        EDIT.save_state();

        if (this.select_square_action == 'move') {
          if (this.select_data != false) {
            select_data_tmp = canvas_active().getImageData(this.select_data.x, this.select_data.y, this.select_data.w, this.select_data.h);
            canvas_active().clearRect(this.select_data.x, this.select_data.y, this.select_data.w, this.select_data.h);
            canvas_active().putImageData(select_data_tmp, mouse.x - mouse.click_x + this.select_data.x, mouse.y - mouse.click_y + this.select_data.y);
          }
          this.select_data.x += mouse.x - mouse.click_x;
          this.select_data.y += mouse.y - mouse.click_y;
        } else {
          var s_x = this.select_data.x;
          var s_y = this.select_data.y;
          var d_x = this.select_data.w;
          var d_y = this.select_data.h;

          if (this.select_square_action == 'resize-left') {
            s_x += mouse.x - mouse.click_x;
            d_x -= mouse.x - mouse.click_x;
          } else if (this.select_square_action == 'resize-right')
            d_x += mouse.x - mouse.click_x;
          else if (this.select_square_action == 'resize-top') {
            s_y += mouse.y - mouse.click_y;
            d_y -= mouse.y - mouse.click_y;
          } else if (this.select_square_action == 'resize-bottom')
            d_y += mouse.y - mouse.click_y;
          else if (this.select_square_action == 'resize-1') {
            s_x += mouse.x - mouse.click_x;
            s_y += mouse.y - mouse.click_y;
            d_x -= mouse.x - mouse.click_x;
            d_y -= mouse.y - mouse.click_y;
          } else if (this.select_square_action == 'resize-2') {
            d_x += mouse.x - mouse.click_x;
            s_y += mouse.y - mouse.click_y;
            d_y -= mouse.y - mouse.click_y;
          } else if (this.select_square_action == 'resize-3') {
            d_x += mouse.x - mouse.click_x;
            d_y += mouse.y - mouse.click_y;
          } else if (this.select_square_action == 'resize-4') {
            s_x += mouse.x - mouse.click_x;
            d_x -= mouse.x - mouse.click_x;
            d_y += mouse.y - mouse.click_y;
          }
          var s_x = Math.max(s_x, 0);
          var s_y = Math.max(s_y, 0);
          var d_x = Math.max(d_x, 0);
          var d_y = Math.max(d_y, 0);

          var tempCanvas = document.createElement("canvas");
          var tempCtx = tempCanvas.getContext("2d");
          tempCanvas.width = Math.max(d_x, this.select_data.w);
          tempCanvas.height = Math.max(d_y, this.select_data.h);
          tempCtx.drawImage(canvas_active(true), this.select_data.x, this.select_data.y, this.select_data.w, this.select_data.h, 0, 0, this.select_data.w, this.select_data.h);

          canvas_active().clearRect(s_x, s_y, d_x, d_y);
          canvas_active().drawImage(tempCanvas, 0, 0, this.select_data.w, this.select_data.h, s_x, s_y, d_x, d_y);

          this.select_data.x = s_x;
          this.select_data.y = s_y;
          this.select_data.w = d_x;
          this.select_data.h = d_y;
        }
      }
      GUI.draw_selected_area();
      LAYER.update_info_block();
    }
  };

  this.check_mouse_pos = function (x, y, size, mouse_x, mouse_y) {
    if (mouse_x > x - Math.round(size) && mouse_x < x + Math.round(size))
      if (mouse_y > y - Math.round(size) && mouse_y < y + Math.round(size))
        return true;
    return false;
  };
}
/* global EVENTS, HELPER, POP, DRAW, LAYER, EL, HELP, LANG */
/* global WIDTH, HEIGHT, canvas_front, DRAW_TOOLS_CONFIG, canvas_grid, canvas_preview */

var GUI = new GUI_CLASS();

/**
 * manages grapchic interface functionality: left/right sidebar actions
 * 
 * @author ViliusL
 */
function GUI_CLASS() {

  /**
   * preview mini window size on right sidebar
   */
  this.PREVIEW_SIZE = {w: 148, h: 100};

  /**
   * last used menu id
   */
  this.last_menu = '';

  /**
   * grid dimnesions config
   */
  this.grid_size = [50, 50];

  /**
   * if grid is visible
   */
  this.grid = false;

  /**
   * true if using transparecy, false if using white background
   */
  this.TRANSPARENCY = true;

  /**
   * zoom level, original - 100%, can vary from 10% to 1000%
   */
  this.ZOOM = 100;

  /**
   * visible part center coordinates, when zoomed in
   */
  this.zoom_center = [50, 50];

  /**
   * common image dimensions
   */
  this.common_dimensions = [
    [640, 480], //480p
    [800, 600], //SVGA
    [1024, 768], //XGA 
    [1280, 720], //hdtv, 720p
    [1600, 1200], //UXGA
    [1920, 1080], //Full HD, 1080p
    [3840, 2160], //4K UHD
    [7680, 4320], //8K UHD
  ];

  /**
   * last color copy
   */
  var COLOR_copy;

  this.draw_helpers = function () {
    //left menu
    var html = '';
    for (var i in DRAW_TOOLS_CONFIG) {
      html += '<a title="' + DRAW_TOOLS_CONFIG[i].title + '"';
      html += ' style="background-position: ' + DRAW_TOOLS_CONFIG[i].icon[1] + 'px ' + DRAW_TOOLS_CONFIG[i].icon[2] + 'px;"';
      if (DRAW_TOOLS_CONFIG[i].name == DRAW.active_tool)
        html += ' class="active trn"';
      else
        html += ' class="trn"';
      html += ' onclick="return GUI.action(\'' + DRAW_TOOLS_CONFIG[i].name + '\');"';
      html += ' id="' + DRAW_TOOLS_CONFIG[i].name + '"';
      html += ' href="#"></a>' + "\n";
    }
    document.getElementById("menu_left_container").innerHTML = html;

    //draw colors
    var html = '';
    for (var i in COLORS_DATA) {
      for (var j in COLORS_DATA[i]) {
        html += '<div style="background-color:' + COLORS_DATA[i][j] + ';" class="mini-color" onclick="GUI.set_color(this);"></div>' + "\n";
      }
      html += '<div style="clear:both;"></div>' + "\n";
    }
    document.getElementById("all_colors").innerHTML = html;
  };

  this.autodetect_dimensions = function () {
    var canvas_wrapper = document.querySelector('#canvas_wrapper');
    var page_w = canvas_wrapper.clientWidth;
    var page_h = canvas_wrapper.clientHeight;
    var auto_size = false;

    for (var i = this.common_dimensions.length - 1; i >= 0; i--) {
      if (this.common_dimensions[i][0] > page_w || this.common_dimensions[i][1] > page_h) {
        //browser size is too small
        continue;
      }
      WIDTH = this.common_dimensions[i][0];
      HEIGHT = this.common_dimensions[i][1];
      auto_size = true;
      break;
    }

    if (auto_size == false) {
      //screen size is smaller then 400x300
      WIDTH = page_w - 5;
      HEIGHT = page_h - 10;
      if (page_w < 585) {
        HEIGHT = HEIGHT - 15;
      }
    }
  };

  this.draw_background = function (canvas, W, H, gap, force) {
    if (this.TRANSPARENCY == false && force == undefined) {
      canvas.beginPath();
      canvas.rect(0, 0, W, H);
      canvas.fillStyle = "#ffffff";
      canvas.fill();
      return false;
    }
    if (gap == undefined)
      gap = 10;
    var fill = true;
    for (var i = 0; i < W; i = i + gap) {
      if (i % (gap * 2) == 0)
        fill = true;
      else
        fill = false;
      for (var j = 0; j < H; j = j + gap) {
        if (fill == true) {
          canvas.fillStyle = '#eeeeee';
          canvas.fillRect(i, j, gap, gap);
          fill = false;
        } else
          fill = true;
      }
    }
  };

  this.draw_grid = function (gap_x, gap_y) {
    if (this.grid == false) {
      document.getElementById("canvas_grid").style.display = 'none';
      return false;
    } else {
      document.getElementById("canvas_grid").style.display = '';
      canvas_grid.clearRect(0, 0, WIDTH, HEIGHT);
    }

    //size
    if (gap_x != undefined && gap_y != undefined)
      this.grid_size = [gap_x, gap_y];
    else {
      gap_x = this.grid_size[0];
      gap_y = this.grid_size[1];
    }
    gap_x = parseInt(gap_x);
    gap_y = parseInt(gap_y);
    if (gap_x < 2)
      gap_x = 2;
    if (gap_y < 2)
      gap_y = 2;
    for (var i = gap_x; i < WIDTH; i = i + gap_x) {
      if (gap_x == 0)
        break;
      if (i % (gap_x * 5) == 0)	//main lines
        canvas_grid.strokeStyle = '#222222';
      else {
        EL.line_dashed(canvas_grid, i, 0, i, HEIGHT, 3, '#888888');
        continue;
      }
      canvas_grid.beginPath();
      canvas_grid.moveTo(0.5 + i, 0);
      canvas_grid.lineTo(0.5 + i, HEIGHT);
      canvas_grid.stroke();
    }
    for (var i = gap_y; i < HEIGHT; i = i + gap_y) {
      if (gap_y == 0)
        break;
      if (i % (gap_y * 5) == 0)	//main lines
        canvas_grid.strokeStyle = '#222222';
      else {
        EL.line_dashed(canvas_grid, 0, i, WIDTH, i, 3, '#888888');
        continue;
      }
      canvas_grid.beginPath();
      canvas_grid.moveTo(0, 0.5 + i);
      canvas_grid.lineTo(WIDTH, 0.5 + i);
      canvas_grid.stroke();
    }
  };
  this.redraw_preview = function () {
    canvas_preview.beginPath();
    canvas_preview.rect(0, 0, self.PREVIEW_SIZE.w, self.PREVIEW_SIZE.h);
    canvas_preview.fillStyle = "#ffffff";
    canvas_preview.fill();
    this.draw_background(canvas_preview, self.PREVIEW_SIZE.w, self.PREVIEW_SIZE.h, 5);

    //redraw preview area
    canvas_preview.save();
    canvas_preview.scale(self.PREVIEW_SIZE.w / WIDTH, self.PREVIEW_SIZE.h / HEIGHT);
    for (var i = LAYER.layers.length - 1; i >= 0; i--) {
      if (LAYER.layers[i].visible == false)
        continue;
      canvas_preview.drawImage(document.getElementById(LAYER.layers[i].name), 0, 0, WIDTH, HEIGHT);
    }
    canvas_preview.restore();

    //active zone
    var canvas_wrapper = document.querySelector('#canvas_wrapper');
    var visible_w = canvas_wrapper.clientWidth / self.ZOOM * 100;
    var visible_h = canvas_wrapper.clientHeight / self.ZOOM * 100;

    var mini_rect_w = self.PREVIEW_SIZE.w * visible_w / WIDTH;
    var mini_rect_h = self.PREVIEW_SIZE.h * visible_h / HEIGHT;

    //xx = (GUI.zoom_center[0] * WIDTH / 100 - visible_w*GUI.zoom_center[0]/100) * GUI.ZOOM / 100;
    if (EVENTS.mouse.valid == true) {
      //using exact position
      mini_rect_x = self.zoom_center[0] * self.PREVIEW_SIZE.w / 100 - mini_rect_w * self.zoom_center[0] / 100;
      mini_rect_y = self.zoom_center[1] * self.PREVIEW_SIZE.h / 100 - mini_rect_h * self.zoom_center[1] / 100;
    } else {
      //using center
      mini_rect_x = self.zoom_center[0] * self.PREVIEW_SIZE.w / 100 - mini_rect_w / 2;
      mini_rect_y = self.zoom_center[1] * self.PREVIEW_SIZE.h / 100 - mini_rect_h / 2;
    }

    //validate
    mini_rect_x = Math.max(0, mini_rect_x);
    mini_rect_y = Math.max(0, mini_rect_y);
    mini_rect_w = Math.min(self.PREVIEW_SIZE.w - 1, mini_rect_w);
    mini_rect_h = Math.min(self.PREVIEW_SIZE.h - 1, mini_rect_h);
    if (mini_rect_x + mini_rect_w > self.PREVIEW_SIZE.w)
      mini_rect_x = self.PREVIEW_SIZE.w - mini_rect_w;
    if (mini_rect_y + mini_rect_h > self.PREVIEW_SIZE.h)
      mini_rect_y = self.PREVIEW_SIZE.h - mini_rect_h;

    if (mini_rect_x == 0 && mini_rect_y == 0 && mini_rect_w == self.PREVIEW_SIZE.w - 1 && mini_rect_h == self.PREVIEW_SIZE.h - 1) {
      //everything is visible
      return false;
    }

    //draw selected area in preview canvas
    canvas_preview.lineWidth = 1;
    canvas_preview.beginPath();
    canvas_preview.rect(Math.round(mini_rect_x) + 0.5, Math.round(mini_rect_y) + 0.5, mini_rect_w, mini_rect_h);
    canvas_preview.fillStyle = "rgba(0, 255, 0, 0.3)";
    canvas_preview.strokeStyle = "#00ff00";
    canvas_preview.fill();
    canvas_preview.stroke();
    return true;
  };
  this.zoom = function (recalc, scroll) {
    if (recalc != undefined) {
      //zoom-in or zoom-out
      if (recalc == 1 || recalc == -1) {
        var step = 100;
        if (this.ZOOM <= 110 && recalc < 0) {
          step = 10;
        }
        if (this.ZOOM <= 90 && recalc > 0) {
          step = 10;
        }
        this.ZOOM = this.ZOOM + recalc * step;
        if (this.ZOOM > 100 && this.ZOOM < 200) {
          this.ZOOM = 100;
        }
      } else {
        //zoom using exact value
        this.ZOOM = parseInt(recalc);
      }
      this.ZOOM = Math.max(this.ZOOM, 10);
      self.redraw_preview();
    }
    document.getElementById("zoom_nr").innerHTML = this.ZOOM;
    document.getElementById("zoom_range").value = this.ZOOM;

    //change scale and repaint
    document.getElementById('canvas_back').style.width = Math.round(WIDTH * this.ZOOM / 100) + "px";
    document.getElementById('canvas_back').style.height = Math.round(HEIGHT * this.ZOOM / 100) + "px";
    for (var i in LAYER.layers) {
      document.getElementById(LAYER.layers[i].name).style.width = Math.round(WIDTH * this.ZOOM / 100) + "px";
      document.getElementById(LAYER.layers[i].name).style.height = Math.round(HEIGHT * this.ZOOM / 100) + "px";
    }
    document.getElementById('canvas_front').style.width = Math.round(WIDTH * this.ZOOM / 100) + "px";
    document.getElementById('canvas_front').style.height = Math.round(HEIGHT * this.ZOOM / 100) + "px";

    document.getElementById('canvas_grid').style.width = Math.round(WIDTH * this.ZOOM / 100) + "px";
    document.getElementById('canvas_grid').style.height = Math.round(HEIGHT * this.ZOOM / 100) + "px";

    //check main resize corners
    if (this.ZOOM != 100) {
      document.getElementById('resize-w').style.display = "none";
      document.getElementById('resize-h').style.display = "none";
      document.getElementById('resize-wh').style.display = "none";
    } else {
      document.getElementById('resize-w').style.display = "block";
      document.getElementById('resize-h').style.display = "block";
      document.getElementById('resize-wh').style.display = "block";
    }

    if (scroll != undefined) {
      EVENTS.scroll_window();
    }
    this.redraw_preview();
    return true;
  };

  this.update_attribute = function (object, next_value) {
    var max_value = 500;
    for (var k in this.action_data().attributes) {
      if (k != object.id)
        continue;
      if (this.action_data().attributes[k] === true || this.action_data().attributes[k] === false) {
        //true / false
        var value;
        if (next_value == 0)
          value = true;
        else
          value = false;
        //save
        this.action_data().attributes[k] = value;
        this.show_action_attributes();
      } else if (typeof this.action_data().attributes[k] == 'object') {
        //select

        var selected = object.options[object.selectedIndex];
        var value = selected.getAttribute('data-value');

        var key = k.replace("_values", "");
        this.action_data().attributes[key] = value;
      } else if (this.action_data().attributes[k][0] == '#') {
        //color
        var key = k.replace("_values", "");
        this.action_data().attributes[key] = object.value;
      } else {
        //numbers
        if (next_value != undefined) {
          if (next_value > 0) {
            if (parseInt(this.action_data().attributes[k]) == 0)
              object.value = 1;
            else if (parseInt(this.action_data().attributes[k]) == 1)
              object.value = 5;
            else if (parseInt(this.action_data().attributes[k]) == 5)
              object.value = 10;
            else
              object.value = parseInt(this.action_data().attributes[k]) + next_value;
          } else if (next_value < 0) {
            if (parseInt(this.action_data().attributes[k]) == 1)
              object.value = 0;
            else if (parseInt(this.action_data().attributes[k]) <= 5)
              object.value = 1;
            else if (parseInt(this.action_data().attributes[k]) <= 10)
              object.value = 5;
            else if (parseInt(this.action_data().attributes[k]) <= 20)
              object.value = 10;
            else
              object.value = parseInt(this.action_data().attributes[k]) + next_value;
          }

          if (object.value < 0)
            object.value = 0;
          if (object.value > max_value)
            object.value = max_value;
        } else {
          if (object.value.length == 0)
            return false;
          object.value = parseInt(object.value);
          object.value = Math.abs(object.value);
          if (object.value == 0 || isNaN(object.value) || value > max_value)
            object.value = this.action_data().attributes[k];
        }
        if (k == 'power' && object.value > 100)
          object.value = 100;

        //save
        this.action_data().attributes[k] = object.value;

        document.getElementById(k).value = object.value;
      }
      if (this.action_data().on_update != undefined) {
        DRAW[this.action_data().on_update](object.value);
      }
    }

    //custom
    if (DRAW.active_tool == 'erase') {
      var strict = this.action_data().attributes.strict;
      var is_circle = self.action_data().attributes.circle;

      if (is_circle == false) {
        //hide strict controlls
        document.getElementById('strict').style.display = 'none';
      } else {
        //show strict controlls
        document.getElementById('strict').style.display = 'block';
      }
    }
  };

  this.action = function (key) {
    DRAW[key]('init', {valid: true});
    if (DRAW.active_tool == key)
      return false;

    //change
    if (DRAW.active_tool != '')
      document.getElementById(DRAW.active_tool).className = "";
    DRAW.active_tool = key;
    document.getElementById(key).className = "active trn";
    this.show_action_attributes();

    return false;
  };

  this.action_data = function () {
    for (var i in DRAW_TOOLS_CONFIG) {
      if (DRAW_TOOLS_CONFIG[i].name == DRAW.active_tool)
        return DRAW_TOOLS_CONFIG[i];
    }
  };

  /**
   * used strings: 
   * "Fill", "Square", "Circle", "Radial", "Anti aliasing", "Circle", "Strict", "Burn"
   */
  this.show_action_attributes = function () {
    html = '';
    var step = 10;
    for (var k in this.action_data().attributes) {
      var title = k[0].toUpperCase() + k.slice(1);
      title = title.replace("_", " ");
      if (this.action_data().attributes[k + "_values"] != undefined)
        continue;
      if (this.action_data().attributes[k] === true || this.action_data().attributes[k] === false) {
        //true / false
        if (this.action_data().attributes[k] == true)
          html += '<div onclick="GUI.update_attribute(this, 1)" style="background-color:#5680c1;" class="attribute-area trn" id="' + k + '">' + title + '</div>';
        else
          html += '<div onclick="GUI.update_attribute(this, 0)" class="attribute-area trn" id="' + k + '">' + title + '</div>';
      } else if (typeof self.action_data().attributes[k] == 'object') {
        //drop down select
        html += '<select style="font-size:11px;margin-bottom:10px;" onchange="GUI.update_attribute(this);" id="' + k + '">';
        for (var j in self.action_data().attributes[k]) {
          var sel = '';
          var key = k.replace("_values", "");
          if (self.action_data().attributes[key] == self.action_data().attributes[k][j])
            sel = 'selected="selected"';
          html += '<option class="trn" ' + sel + ' name="' + self.action_data().attributes[k][j] + '" data-value="' + self.action_data().attributes[k][j] + '">' + self.action_data().attributes[k][j] + '</option>';
        }
        html += '</select>';
      } else if (self.action_data().attributes[k][0] == '#') {
        //color
        html += '<table style="width:100%;">';	//table for 100% width
        html += '<tr>';
        html += '<td style="font-weight:bold;width:45px;">' + title + ':</td>';
        html += '<td><input onchange="GUI.update_attribute(this);" type="color" id="' + k + '" value="' + self.action_data().attributes[k] + '" /></td>';
        html += '</tr>';
        html += '</table>';
      } else {
        //numbers
        html += '<div id="' + k + '_container">';
        html += '<table style="width:100%;">';	//table for 100% width
        html += '<tr>';
        html += '<td style="font-weight:bold;padding-right:2px;white-space:nowrap;" class="trn">' + title + ':</td>';
        html += '<td><input onKeyUp="GUI.update_attribute(this);" type="number" id="' + k + '" value="' + self.action_data().attributes[k] + '" /></td>';
        html += '</tr>';
        html += '</table>';
        html += '<div style="float:left;width:32px;" onclick="GUI.update_attribute(this, ' + (step) + ')" class="attribute-area" id="' + k + '">+</div>';
        html += '<div style="margin-left:48px;margin-bottom:15px;" onclick="GUI.update_attribute(this, ' + (-step) + ')" class="attribute-area" id="' + k + '">-</div>';
        html += '</div>';
      }
    }
    document.getElementById("action_attributes").innerHTML = html;

    //retranslate
    HELP.help_translate(LANG);
  };

  this.set_color = function (object) {
    if (HELPER.chech_input_color_support('main_color') == true && object.id == 'main_color')
      COLOR = object.value;
    else
      COLOR = HELPER.rgb2hex_all(object.style.backgroundColor);
    COLOR_copy = COLOR;

    if (HELPER.chech_input_color_support('main_color') == true)
      document.getElementById("main_color").value = COLOR; //supported
    else
      document.getElementById("main_color_alt").style.backgroundColor = COLOR; //not supported

    document.getElementById("color_hex").value = COLOR;
    var colors = HELPER.hex2rgb(COLOR);
    document.getElementById("rgb_r").value = colors.r;
    document.getElementById("rgb_g").value = colors.g;
    document.getElementById("rgb_b").value = colors.b;
  };

  this.set_color_manual = function (event) {
    var object = event.target;
    if (object.value.length == 6 && object.value[0] != '#') {
      COLOR = '#' + object.value;
      this.sync_colors();
    }
    if (object.value.length == 7) {
      COLOR = object.value;
      this.sync_colors();
    } else if (object.value.length > 7)
      object.value = COLOR;
  };

  this.set_color_rgb = function (object, c) {
    var colors = HELPER.hex2rgb(COLOR);
    if (object.value.length > 3) {
      object.value = colors[c];
    } else if (object.value.length > 0) {
      value = object.value;
      value = parseInt(value);
      if (isNaN(value) || value != object.value || value > 255 || value < 0) {
        object.value = colors[c];
        return false;
      }
      COLOR = "#" + ("000000" + HELPER.rgbToHex(document.getElementById("rgb_r").value, document.getElementById("rgb_g").value, document.getElementById("rgb_b").value)).slice(-6);
      ALPHA = document.getElementById("rgb_a").value;
      document.getElementById("rgb_a").value = ALPHA;
      this.sync_colors();
    }
  };

  this.sync_colors = function () {
    document.getElementById("color_hex").value = COLOR;

    if (HELPER.chech_input_color_support('main_color') == true)
      document.getElementById("main_color").value = COLOR; //supported
    else
      document.getElementById("main_color_alt").style.backgroundColor = COLOR; //not supported

    var colors = HELPER.hex2rgb(COLOR);
    document.getElementById("rgb_r").value = colors.r;
    document.getElementById("rgb_g").value = colors.g;
    document.getElementById("rgb_b").value = colors.b;
  };

  this.toggle_color_select = function () {
    if (POP.active == false) {
      POP.add({
        title: 'Color:',
        function: function () {
          COLOR_copy = COLOR;
          var html = '<canvas style="position:relative;margin-bottom:5px;" id="c_all" width="300" height="300"></canvas>';
          html += '<table>';
          html += '<tr>';
          html += '	<td><b>Luminosity:</b></td>';
          html += '	<td><input id="lum_ranger" oninput="GUI.change_lum(this.value);document.getElementById(\'lum_preview\').innerHTML=this.value;" type="range" value="0" min="-255" max="255" step="1"></td>';
          html += '	<td style="padding-left:10px;width:30px;" id="lum_preview">0</td>';
          html += '</tr>';
          html += '<tr>';
          html += '	<td><b>Alpha:</b></td>';
          html += '	<td><input oninput="GUI.change_alpha(this.value);document.getElementById(\'alpha_preview\').innerHTML=this.value;" type="range" value="' + ALPHA + '" min="0" max="255" step="1"></td>';
          html += '	<td style="padding-left:10px;" id="alpha_preview">' + ALPHA + '</td></tr>';
          html += '</tr>';
          html += '</table>';
          return html;
        }
      });
      POP.show(
              'Select color',
              function (user_response) {
                var param1 = parseInt(user_response.param1);
              },
              undefined,
              this.toggle_color_select_onload
              );
    } else {
      POP.hide();
    }
  };

  this.change_lum = function (lumi) {
    lumi = parseInt(lumi);
    var c3 = HELPER.hex2rgb(COLOR_copy);
    c3.r += lumi;
    c3.g += lumi;
    c3.b += lumi;

    if (c3.r < 0)
      c3.r = 0;
    if (c3.g < 0)
      c3.g = 0;
    if (c3.b < 0)
      c3.b = 0;
    if (c3.r > 255)
      c3.r = 255;
    if (c3.g > 255)
      c3.g = 255;
    if (c3.b > 255)
      c3.b = 255;

    COLOR = "#" + ("000000" + HELPER.rgbToHex(c3.r, c3.g, c3.b)).slice(-6);
    this.sync_colors();
  };

  this.change_alpha = function (value) {
    ALPHA = parseInt(value);
    document.getElementById("rgb_a").value = ALPHA;
  };

  this.toggle_color_select_onload = function () {
    var img = new Image();
    img.onload = function () {
      document.getElementById("c_all").getContext("2d").drawImage(img, 0, 0);
      document.getElementById("c_all").onmousedown = function (event) {
        if (event.offsetX) {
          mouse_x = event.offsetX;
          mouse_y = event.offsetY;
        } else if (event.layerX) {
          mouse_x = event.layerX;
          mouse_y = event.layerY;
        }
        var c = document.getElementById("c_all").getContext("2d").getImageData(mouse_x, mouse_y, 1, 1).data;
        COLOR = "#" + ("000000" + HELPER.rgbToHex(c[0], c[1], c[2])).slice(-6);
        this.sync_colors();
        COLOR_copy = COLOR;
        document.getElementById("lum_ranger").value = 0;
      };
    };
    img.src = 'img/colorwheel.png';
  };

  this.draw_selected_area = function (no_resize) {
    if (DRAW.select_data == false)
      return false;
    //draw area
    canvas_front.clearRect(0, 0, WIDTH, HEIGHT);
    var x = DRAW.select_data.x;
    var y = DRAW.select_data.y;
    var w = DRAW.select_data.w;
    var h = DRAW.select_data.h;
    if (this.ZOOM != 100) {
      x = Math.round(x);
      y = Math.round(y);
      w = Math.round(w);
      h = Math.round(h);
    }

    //fill
    canvas_front.fillStyle = "rgba(0, 255, 0, 0.3)";
    canvas_front.fillRect(x, y, w, h);
    if (this.ZOOM <= 100) {
      //borders
      canvas_front.strokeStyle = "rgba(0, 255, 0, 1)";
      canvas_front.lineWidth = 1;
      canvas_front.strokeRect(x + 0.5, y + 0.5, w, h);
    }
    if (no_resize == true)
      return true;

    //draw carners
    square(x, y, 0, 0);
    square(x + w, y, -1, 0);
    square(x, y + h, 0, -1);
    square(x + w, y + h, -1, -1);

    //draw centers
    square(x + w / 2, y, 0, 0);
    square(x, y + h / 2, 0, 0);
    square(x + w / 2, y + h, 0, -1);
    square(x + w, y + h / 2, -1, 0);

    function square(x, y, mx, my) {
      var sr_size = Math.ceil(EVENTS.sr_size / self.ZOOM * 100);
      x = Math.round(x);
      y = Math.round(y);
      canvas_front.beginPath();
      canvas_front.rect(x + mx * Math.round(sr_size), y + my * Math.round(sr_size), sr_size, sr_size);
      canvas_front.fillStyle = "#0000ff";
      canvas_front.fill();
    }
  };

  this.toggle = function (query) {
    document.querySelector(query).classList.toggle("active");
  };

  var self = this
  self.init = function () {
    self.draw_background(canvas_back, WIDTH, HEIGHT);
    document.getElementById("canvas_preview").width = self.PREVIEW_SIZE.w;
    document.getElementById("canvas_preview").height = self.PREVIEW_SIZE.h;
    var color_rgb = HELPER.hex2rgb(COLOR);
    document.getElementById("rgb_r").value = color_rgb.r;
    document.getElementById("rgb_g").value = color_rgb.g;
    document.getElementById("rgb_b").value = color_rgb.b;
    document.getElementById("rgb_a").value = ALPHA;
    self.redraw_preview();

    //detect color support
    if (HELPER.chech_input_color_support('main_color') == true)
      document.getElementById("main_color").value = COLOR; //supported
    else {
      //not supported
      document.getElementById("main_color").style.display = 'none';
      document.getElementById("main_color_alt").style.display = '';
      document.getElementById("main_color_alt").style.backgroundColor = COLOR;
    }
    canvas_grid.globalAlpha = 0.8;
  }
}

/* global POP */
/* global VERSION */

var HELP = new HELP_CLASS();

/** 
 * manages help actions
 * 
 * @author ViliusL
 */
function HELP_CLASS() {

  //shortcuts
  this.help_shortcuts = function () {
    POP.add({title: "D", value: 'Dublicate'});
    POP.add({title: "Del", value: 'Delete selection'});
    POP.add({title: "F", value: 'Auto adjust colors'});
    POP.add({title: "G", value: 'Grid on/off'});
    POP.add({title: "L", value: 'Rotate left'});
    POP.add({title: "N", value: 'New layer'});
    POP.add({title: "O", value: 'Open file(s)'});
    POP.add({title: "R", value: 'Resize'});
    POP.add({title: "S", value: 'Save'});
    POP.add({title: "T", value: 'Trim'});
    POP.add({title: "-", value: 'Zoom out'});
    POP.add({title: "+", value: 'Zoom in'});
    POP.add({title: "CTRL + Z", value: 'Undo'});
    POP.add({title: "CTRL + A", value: 'Select all'});
    POP.add({title: "CTRL + V", value: 'Paste'});
    POP.add({title: "Arrow keys", value: 'Move active layer by 10px'});
    POP.add({title: "CTRL + Arrow keys", value: 'Move active layer by 50px'});
    POP.add({title: "SHIFT + Arrow keys", value: 'Move active layer by 1px'});
    POP.add({title: "Drag & Drop", value: 'Imports images'});
    POP.show('Keyboard Shortcuts', '');
  };
  //about
  this.help_about = function () {
    var email = 'www.viliusl@gmail.com';
    POP.add({title: "Name:", value: "miniPaint " + VERSION});
    POP.add({title: "Description:", value: 'Online image editor'});
    POP.add({title: "Author:", value: 'ViliusL'});
    POP.add({title: "Email:", html: '<a href="mailto:' + email + '">' + email + '</a>'});
    POP.add({title: "Source:", html: '<a href="https://github.com/viliusle/miniPaint">github.com/viliusle/miniPaint</a>'});
    POP.show('About', '');
  };

  //change language
  this.help_translate = function (lang_code) {

    //default English emty translator
    var dict_en = {};

    //save cookie
    if (lang_code != undefined && lang_code != LANG) {
      HELPER.setCookie('language', lang_code, 30);
    }

    var dictionary_data = "dict_" + lang_code;
    if (window[dictionary_data] != undefined || lang_code == 'en') {
      //translate
      $('body').translate({lang: lang_code, t: window[dictionary_data]});
      LANG = lang_code;
    } else {
      console.log('Translate error, can not find dictionary: ' + dictionary_data);
    }
  };
}
/**
 * main config file
 * 
 * @author ViliusL
 */

//canvas layers
var canvas_back = document.getElementById("canvas_back").getContext("2d");		//layer for grid/transparency
var canvas_front = document.getElementById("canvas_front").getContext("2d");		//tmp layer
var canvas_grid = document.getElementById("canvas_grid").getContext("2d");		//grid layer
var canvas_preview = document.getElementById("canvas_preview").getContext("2d");	//mini preview

//global settings
var VERSION = '3.1.1';
var WIDTH;						//canvas midth
var HEIGHT;						//canvas height
var COLOR = '#0000ff';				//active color
var ALPHA = 255;					//active color alpha
var LANG = 'en';					//active language

var DRAW_TOOLS_CONFIG = [
  {name: 'select_tool', title: 'Select object tool', icon: [null, 0 + 7, 2], attributes: {}},
  {name: 'select_square', title: 'Select area tool', icon: [null, -50 + 4, 5], attributes: {}},
  {name: 'magic_wand', title: 'Magic Wand Tool', icon: [null, -150 + 1, -50 + 2], attributes: {power: 40, anti_aliasing: true}},
  {name: 'erase', title: 'Erase', icon: [null, -100 + 3, 4], attributes: {size: 20, circle: true, strict: true}},
  {name: 'fill', title: 'Fill', icon: [null, -150 + 3, 3], attributes: {power: 0, anti_aliasing: false}},
  {name: 'pick_color', title: 'Pick Color', icon: [null, -200 + 3, 3], attributes: {}},
  {name: 'pencil', title: 'Pencil', icon: [null, -250 + 3, 3], attributes: {}},
  {name: 'line', title: 'Draw line', icon: [null, -300 + 3, 3], attributes: {size: 1, type_values: ['Simple', 'Multi-line', 'Arrow', 'Curve']}},
  {name: 'letters', title: 'Draw letters', icon: [null, -350 + 3, 4], attributes: {}},
  {name: 'draw_square', title: 'Draw rectangle', icon: [null, -400 + 3, 5], attributes: {fill: false, square: false}},
  {name: 'draw_circle', title: 'Draw circle', icon: [null, -450 + 3, 5], attributes: {fill: false, circle: false}},
  {name: 'brush', title: 'Brush', icon: [null, -500 + 6, 3], attributes: {type: 'Brush', type_values: ['Brush', 'BezierCurve', 'Chrome', 'Fur', 'Grouped', 'Shaded', 'Sketchy'], size: 5, anti_aliasing: false}, on_update: 'update_brush', },
  {name: 'blur_tool', title: 'Blur tool', icon: [null, -250 + 5, -50 + 2], attributes: {size: 30, power: 1}},
  {name: 'sharpen_tool', title: 'Sharpen tool', icon: [null, -300 + 5, -50 + 2], attributes: {size: 30}},
  {name: 'burn_dodge_tool', title: 'Burn/Dodge tool', icon: [null, -500 + 3, -50 + 4], attributes: {burn: true, size: 30, power: 50}},
  {name: 'desaturate_tool', title: 'Desaturate', icon: [null, -550 + 3, -00 + 4], attributes: {size: 50, anti_aliasing: true}},
  {name: 'clone_tool', title: 'Clone tool', icon: [null, -350 + 4, -50 + 3], attributes: {size: 30, anti_aliasing: true}},
  {name: 'gradient_tool', title: 'Gradient', icon: [null, -400 + 3, -50 + 4], attributes: {radial: false, power: 50}},
  {name: 'crop_tool', title: 'Crop', icon: [null, -450 + 2, -50 + 2], attributes: {}},
];

// colors
var COLORS_DATA = [
  ['#ff0000', '#ff5b31', '#ffa500', '#ff007f', '#ff00ff'], //red
  ['#00ff00', '#008000', '#7fff00', '#00ff7f', '#8ac273'], //green
  ['#0000ff', '#007fff', '#37629c', '#000080', '#8000ff'], //blue
  ['#ffff00', '#ffff80', '#ddd06a', '#808000', '#bcb88a'], //yellow
  ['#ffffff', '#c0c0c0', '#808080', '#404040', '#000000'], //grey
]

// menu
// override
ddsmoothmenu.arrowimages = {down: ['downarrowclass', '', 23], right: ['rightarrowclass', '', 6], left: ['leftarrowclass', '']}
var MENU_ID = 'main_menu'
/* global HELPER, EVENTS, LAYER, POP, FILE, GUI, DRAW */
/* global WIDTH, HEIGHT, canvas_back, canvas_grid, COLOR, ALPHA  */

var MAIN = new MAIN_CLASS();

/**
 * main class - initialize app
 * 
 * @author ViliusL
 */
function MAIN_CLASS() {
  this.init = function (options) {
    var options = options || {}
    if (options.firstLoad) {
      if (options.drawHelpers) {
        GUI.draw_helpers();
      }
      GUI.autodetect_dimensions();
      POP.height_mini = Math.round(POP.width_mini * HEIGHT / WIDTH);
    }
    EVENTS.autosize = true;
    FILE.file_info = {
      general: [],
      exif: [],
    };
    DRAW.select_data = false;

    LAYER.reset_layers()
    GUI.init()

    //init translation
    var lang_cookie = HELPER.getCookie('language');
    if (lang_cookie != '')
      LANG = lang_cookie.replace(/([^a-z]+)/gi, '');
    HELP.help_translate(LANG);

    // init menu
    ddsmoothmenu.init({
      mainmenuid: MENU_ID || "main_menu", //menu DIV id
      orientation: 'h', //Horizontal or vertical menu: Set to "h" or "v"
      classname: 'ddsmoothmenu', //class added to menu's outer DIV
      //customtheme: ["#1c5a80", "#18374a"],
      contentsource: "markup" //"markup" or ["container_id", "path_to_menu_file"]
    })
  };
}

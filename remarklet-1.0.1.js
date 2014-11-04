/*! Remarklet - v1.0.1
* by Zach Watkins (watkinza@gmail.com)
* http://remarklet.com
* licensed under the MIT License.
*/
if(typeof remarklet=='undefined'){
	var remarklet = {
		blocktime: null,
		blockruninit: null,
		usercommand: {
			togglemenu: null,
			addImage: null,
			addNote: null,
			showGrid: null,
			showGuidelines: null,
			showMenuPane: null,
		},
		menu: {
			file: {
				container: jQuery('<div id="remarklet-file-menu" class="remarklet-ui"></div>'),
				exportit: jQuery('<div class="remarklet-ui">Export</div>'),
				emailit: jQuery('<div class="remarklet-ui">Email</div>'),
				preferences: jQuery('<div class="remarklet-ui">Preferences</div>'),
				emailwindow: {
					container: jQuery('<div id="remarklet-email" class="remarklet-ui">Email This Page</div>'),
					recipient: jQuery('<div class="remarklet-ui"></div>'),
					message: jQuery('<div class="remarklet-ui"></div>')
				},
				preferenceswindow: {
					container: jQuery('<div id="remarklet-preferences" class="remarklet-ui">User Preferences</div>'),
					keyboard: jQuery('<div class="remarklet-ui">Keyboard Shortcuts <span class="remarklet-ui remarklet-switch"><i class="remarklet-ui remarklet-switchbutton"></i></span></div>'),
					embedimages: jQuery('<div class="remarklet-ui">Embed Images<span class="remarklet-ui remarklet-switch"><i class="remarklet-ui remarklet-switchbutton"></i></span></div>'),
				}
			},
			view: {
				container: jQuery('<div id="remarklet-view-menu" class="remarklet-ui"></div>'),
				grid: jQuery('<div class="remarklet-ui">Grid</div>'),
				guidelines: jQuery('<div class="remarklet-ui">Guidelines</div>'),
				outlines: jQuery('<div class="remarklet-ui">Outlines</div>')
			},
			insert: {
				container: jQuery('<div id="remarklet-insert-menu" class="remarklet-ui"></div>'),
				imageobj: jQuery('<div class="remarklet-ui"></div>'),
				note: jQuery('<div class="remarklet-ui"></div>'),
				htmlobj: jQuery('<div class="remarklet-ui"></div>')
			}
		},
		appcommand: {
			doFormat: null,
			prompt: null,
			init: null,
			getScrollOffsets: null,
			recordMousePos: null,
			blockinit: null
		},
		target: null,
		keydown: null,
		keyup: null,
		mode: 'drag',
		resizeParams: {},
		dragParams: null,
		keydownlistening: true,
		fileRead: false,
		getBlobURL: (window.URL && URL.createObjectURL.bind(URL)) || (window.webkitURL && webkitURL.createObjectURL.bind(webkitURL)) || window.createObjectURL,
		box: jQuery('<div id="remarklet-box"></div>'),
		mousePos: {x: null, y: null},
		dragging: false,
		isIE: navigator.userAgent.toUpperCase().indexOf('MSIE')>=0 ? true : false,
		promptwindow: jQuery('<div id="remarklet-prompt" class="remarklet-ui" style="display:none"><div id="remarklet-prompt-content" class="remarklet-ui"><div id="remarklet-prompt-form" class="remarklet-ui"></div><button id="remarklet-prompt-submit" class="remarklet-ui" type="button">OK</button><button id="remarklet-prompt-cancel" class="remarklet-ui" type="button">Cancel</button></div></div>'),
		menue: jQuery('<div id="remarklet-menu" class="remarklet-ui" style="display:none"><div class="remarklet-ui">Remarklet Shortcuts</div><div class="remarklet-ui">Drag Mode </div><ol class="remarklet-ui"><li class="remarklet-ui">Toggle Shortcut List: F1</li><li class="remarklet-ui">Enter Text Mode: Ctrl + Click</li><li class="remarklet-ui">Resize Element: Ctrl (+ Shift) + Arrow keys</li><li class="remarklet-ui">Delete Element: Delete key</li><li class="remarklet-ui">Add Image: Ctrl + Alt + I</li><li class="remarklet-ui">Add Remark: Ctrl + Alt + N</li></ol><div class="remarklet-ui">Text Mode </div><ol class="remarklet-ui"><li class="remarklet-ui">Toggle Shortcut List: F1</li><li class="remarklet-ui">Resize Element: Drag a resizing handle attached to an element</li><li class="remarklet-ui">Add Image: Ctrl + Alt + I</li><li class="remarklet-ui">Add Remark: Ctrl + Alt + N</li><li class="remarklet-ui">Return to Drag Mode: Ctrl + Enter key</li></ol></div>'),
		menuhint: jQuery('<div id="remarklet-menu-hint" class="remarklet-ui">F1</div>'),
		win: null
	};
	remarklet.usercommand.togglemenu = function(){
		console.log('toggle');
		remarklet.menuee.toggle();
		remarklet.menueehint.toggle();
	};
	remarklet.dragParams = {
		start: function(event, ui){
			var ele = event.target || event.srcElement;
			remarklet.dragging = true;
			remarklet.target = jQuery(ele);
			jQuery('body').unbind('mousemove', remarklet.appcommand.recordMousePos);
		},
		stop: function(event, ui){
			remarklet.dragging = false;
			remarklet.appcommand.recordMousePos(event);
			jQuery('body').bind('mousemove', remarklet.appcommand.recordMousePos);
		}
	};
	remarklet.appcommand.prompt = function(formhtml, callback){
		jQuery('body').unbind('mousemove', remarklet.appcommand.recordMousePos);
		// PROVIDE PROMPT WINDOW FOR USER INPUT
		jQuery('#remarklet-prompt-form').html(formhtml);
		jQuery('#remarklet-prompt-form input').bind('keydown',function(e){
			if(e.which==13){
				// ENTER, SUBMIT FORM.
				jQuery('#remarklet-prompt-submit').click();
				jQuery('#remarklet-prompt-form input').unbind('keydown');
			} else if(e.which==27){
				// ESCAPE, CANCEL FORM.
				jQuery('#remarklet-prompt-cancel').click();
				jQuery('#remarklet-prompt-form input').unbind('keydown');
			}
		});
		jQuery('#remarklet-prompt-form textarea').bind('keydown',function(e){
			if(e.which==27){
				// ESCAPE, SUBMIT FORM.
				jQuery('#remarklet-prompt-cancel').click();
				jQuery('#remarklet-prompt-form textarea').unbind('keydown');
			}
		});
		remarklet.appcommand.promptwindow.show();
		jQuery('#remarklet-prompt-content').css({'margin-top':function(){
			return -1 * (jQuery('#remarklet-prompt-content').innerHeight()/2);
		}});
		jQuery('#remarklet-prompt-form input,#remarklet-prompt-form textarea').first().focus();
		jQuery('#remarklet-prompt-submit').bind('click', function(){
			callback();
			remarklet.appcommand.promptwindow.hide();
			jQuery(this).unbind('click');
			jQuery('body').bind('mousemove', remarklet.appcommand.recordMousePos);
		});
		jQuery('#remarklet-prompt-cancel').bind('click', function(){
			remarklet.appcommand.promptwindow.hide();
			jQuery('#remarklet-prompt-submit').unbind('click');
			jQuery('body').bind('mousemove', remarklet.appcommand.recordMousePos);
		});
	};
	remarklet.appcommand.recordMousePos = function(e){
		remarklet.mousePos.x = e.pageX - remarklet.box.offset().left;
		remarklet.mousePos.y = e.pageY;
	};
	remarklet.appcommand.doFormat = function(usercommandName, showDefaultUI, valueArgument) {
		// FROM https://developer.mozilla.org/en-US/docs/Rich-Text_Editing_in_Mozilla
		if(valueArgument==undefined) valueArgument = null;
		if(showDefaultUI==undefined) showDefaultUI = false;
		if(document.queryusercommandEnabled(usercommandName)){
			document.execusercommand(usercommandName, showDefaultUI, valueArgument);
		} else if(usercommandName=='increasefontsize' || usercommandName=='decreasefontsize'){
			var s = prompt('Enter new font size (between 1 and 7)','');
			document.execusercommand('fontsize',true,s);
		}
	};
	remarklet.usercommand.addImage = function(){
		remarklet.appcommand.prompt('<label class="remarklet-ui">Make a placeholder</label><input type="text" value="300x200" class="remarklet-ui" id="remarklet-imgdimensions" name="remarklet-imgdimensions" autofocus="autofocus"> <input type="text" value="#cccccc" class="remarklet-ui" id="remarklet-bgcolor" name="remarklet-bgcolor"> <input type="text" value="#000000" class="remarklet-ui" id="remarklet-textcolor" name="remarklet-textcolor"> <input type="text" value="Image (300x200)" class="remarklet-ui" id="remarklet-text" name="remarklet-text"><br /><label class="remarklet-ui">Enter image url</label><input name="remarklet-url" id="remarklet-url" class="remarklet-ui" type="text" value=""><br><label class="remarklet-ui">Add local file <span title="This image will expire when you leave the page, and will not be stored if you save the page as an HTML file." class="remarklet-hovernote remarklet-ui">?</span></label><input name="remarklet-file" id="remarklet-file" class="remarklet-ui" type="file" /><script type="text/javascript">jQuery("#remarklet-file").on("change",function(ev){jQuery("#remarklet-prompt-submit").attr("disabled",true);var f=ev.target.files[0];var fr=new FileReader();fr.onload=function(ev2){jQuery("#remarklet-prompt-submit").removeAttr("disabled");remarklet.fileRead=remarklet.getBlobURL(f);};fr.readAsDataURL(f);});</script>', function(){
			var string;
			if(jQuery('#remarklet-url').val().length>1){
				string = '<img src="' + jQuery('#remarklet-url').val() + '" style="left:' + remarklet.mousePos.x + 'px;top:' + remarklet.mousePos.y + 'px" class="remarklet-newimg" />';
			} else if(remarklet.fileRead!=false){
				string = '<img src="' + remarklet.fileRead + '" style="left:' + remarklet.mousePos.x + 'px;top:' + remarklet.mousePos.y + 'px" class="remarklet-newimg" />';
				remarklet.fileRead = false;
			} else {
				string = '<div style="color:' + jQuery('#remarklet-textcolor').val() + ';background-color:' + jQuery('#remarklet-bgcolor').val() + ';width:' + jQuery('#remarklet-imgdimensions').val().toLowerCase().split('x')[0] + 'px;height:' + jQuery('#remarklet-imgdimensions').val().toLowerCase().split('x')[1] + 'px;left:' + remarklet.mousePos.x + 'px;top:' + remarklet.mousePos.y + 'px" class="remarklet-newimg">' + jQuery('#remarklet-text').val() + '</div>';
			}
			jQuery(string).appendTo(remarklet.box);
		});
	};
	remarklet.usercommand.addNote = function(e){
		remarklet.appcommand.prompt('<label class="remarklet-ui">Enter note text</label class="remarklet-ui"><textarea name="remarklet-text" id="remarklet-text" class="remarklet-ui" type="text" autofocus="autofocus" cols="48" rows="13">Enter your note\'s text here.</textarea>', function(){																		
			// CHARACTERS ARE 8px WIDE, DEFAULT MAX WIDTH IS 500px.
			var width = jQuery('#remarklet-text').val().length * 8;
			if(width>500){
				width = 500;
			}
			jQuery('<div class="remarklet-note" contenteditable="true" style="left:' + remarklet.mousePos.x + 'px;top:' + remarklet.mousePos.y + 'px;width:' + width + 'px">' + jQuery('#remarklet-text').val() + '</div>').appendTo(remarklet.box);
		});
	};
	remarklet.keydown = function(event){
		// WE HAVE TO DESTROY THE DRAG EFFECT TO ALLOW DEFAULT BEHAVIORS TO WORK, LIKE WHEN WE START EDITING THE CONTENT ON CTRL+CLICK
		if(remarklet.mode=='text'){
			switch(event.which){
				case 9 : // TAB
					event.preventDefault();
					break;
				case 13 : // ENTER, RETURN TO DRAG MODE IF CTRL + ENTER
					if(event.ctrlKey){
						// DESTROY RESIZABLE FUNCTIONALITY
						if(jQuery(remarklet.target).hasClass('ui-resizable')) jQuery(remarklet.target).resizable('destroy');
						remarklet.mode = 'drag';
						// RESTORE DRAGGING FUNCTIONALITY TO TEXT EDIT TARGET
						jQuery(remarklet.target).draggable();
						jQuery('<input type="text" style="width:1px;height:1px;background-color:transparent;border:0 none;opacity:0;position:fixed;top:0;left:0;" />').appendTo('body').focus().blur().remove();
					}
					break;
				case 73: // I, CREATE NEW IMAGE
					if(event.ctrlKey && event.altKey){
						remarklet.usercommand.addImage(event);
					}
					break;
				case 78: // N, CREATE NEW REMARK
					if(event.ctrlKey && event.altKey){
						remarklet.usercommand.addNote(event);
					}
					break;
				case 112: // F1, SHOW SHORTCUTS
					remarklet.usercommand.togglemenu();
					break;
				default: break;
			}
		} else if(remarklet.mode=='drag'){
			switch(event.which){
				case 17: // CTRL, PREPARE FOR SHORTCUT -> DISABLE DRAGGING
					if(jQuery('.ui-draggable').size()>0) jQuery('.ui-draggable').draggable('destroy');
					break;
				case 37: // LEFT ARROW, DECREASE WIDTH BY 1PX
					if(event.ctrlKey){
						event.preventDefault();
						if(!event.shiftKey) jQuery(remarklet.target).css({width: function(){return jQuery(this).width()-1}});
						else jQuery(remarklet.target).css({width: function(){return jQuery(this).width()-10}});
					}
					break;
				case 38: // UP ARROW, INCREASE HEIGHT BY 1PX
					if(event.ctrlKey){
						event.preventDefault();
						if(!event.shiftKey) jQuery(remarklet.target).css({height: function(){return jQuery(this).height()-1}});
						else jQuery(remarklet.target).css({height: function(){return jQuery(this).height()-10}});
					}
					break;
				case 39: // RIGHT ARROW, INCREASE WIDTH BY 1PX
					if(event.ctrlKey){
						event.preventDefault();
						if(!event.shiftKey) jQuery(remarklet.target).css({width: function(){return jQuery(this).width()+1}});
						else jQuery(remarklet.target).css({width: function(){return jQuery(this).width()+10}});
					}
					break;
				case 40: // DOWN ARROW, DECREASE HEIGHT BY 1PX
					if(event.ctrlKey){
						event.preventDefault();
						if(!event.shiftKey) jQuery(remarklet.target).css({height: function(){return jQuery(this).height()+1}});
						else jQuery(remarklet.target).css({height: function(){return jQuery(this).height()+10}});
					}
					break;
				case 46: // DELETE, HIDE AND REMOVE ELEMENT FROM PAGE FLOW
					jQuery(remarklet.target).addClass('remarklet-deleted');
					break;
				case 73: // I, CREATE NEW IMAGE
					if(event.ctrlKey && event.altKey) remarklet.usercommand.addImage(event);
					break;
				case 78: // N, CREATE NEW REMARK
					if(event.ctrlKey && event.altKey) remarklet.usercommand.addNote(event);
					break;
				case 112: // F1, SHOW SHORTCUTS
					remarklet.menuee.toggle();
					remarklet.menueehint.toggle();
					break;
				default: break;
			}
		}
	};
	remarklet.keyup = function(event){
		if(remarklet.mode=='drag'){
			switch(event.which){
				case 17: // CTRL, RE-ENABLE DRAGGING
					if(jQuery(remarklet.target).hasClass('ui-draggable-disabled')){
						jQuery(remarklet.target).draggable(remarklet.dragParams);
					}
					break;
				default: break;
			}
		}
	};
	remarklet.appcommand.init = function(){
		jQuery.noConflict();
		// DEFINE REMARKLET PROPERTIES THAT REQUIRE JQUERY
		remarklet.box = jQuery('#remarklet-box').size()==0 ? remarklet.box.appendTo('body') : jQuery('#remarklet-box');
		remarklet.appcommand.promptwindow =  jQuery('#remarklet-prompt').size()==0 ? remarklet.appcommand.promptwindow.appendTo('body') :  jQuery('#remarklet-prompt');
		remarklet.menuee =  jQuery('#remarklet-menu').size()==0 ? remarklet.menuee.on('click', function(){console.log('clicked');remarklet.usercommand.togglemenu();}).appendTo('body') :  jQuery('#remarklet-menu');
		remarklet.menueehint =  jQuery('#remarklet-menu-hint').size()==0 ? remarklet.menueehint.on('click', function(){remarklet.usercommand.togglemenu();}).appendTo('body') :  jQuery('#remarklet-menu-hint');
		remarklet.win = jQuery(window);
		
		jQuery('body').on('mouseover', '*', function(event){
			event.preventDefault();
			event.stopPropagation();
			var ele = event.target || event.srcElement;
			if(!jQuery(ele).hasClass('ui-resizable-handle') && !jQuery(ele).hasClass('remarklet-ui')){
				jQuery(ele).addClass('remarklet-target');
				// IF WE ARE IN DRAG MODE, ENABLE DRAGABILITY.
				if(remarklet.mode=='drag' && !remarklet.dragging){
					jQuery(ele).draggable(remarklet.dragParams);
				}
				// ENABLE TEXT EDITING
				jQuery(ele).attr('contentEditable', true);
			}
		}).on('mouseout', '*', function(event){
			event.preventDefault();
			event.stopPropagation();
			var ele = event.target || event.srcElement;
			if(!jQuery(ele).hasClass('ui-resizable-handle') && !jQuery(ele).hasClass('remarklet-ui')){
				jQuery(ele).removeClass('remarklet-target');
				if(remarklet.mode=='drag'){
					jQuery(ele).attr('contentEditable', false);
					if(!remarklet.dragging){
						if(jQuery(ele).hasClass('ui-draggable')) jQuery(ele).draggable('destroy');
					}
				}
			}
		}).on('click', '*', function(event){
			event.stopPropagation();
			var ele = event.target || event.srcElement;
			if(!jQuery(ele).hasClass('ui-resizable-handle') && !jQuery(ele).hasClass('remarklet-ui') && event.which==1){
				remarklet.target = jQuery(ele);
				if(event.ctrlKey || remarklet.mode=='text'){
					// ENTER TEXT EDITING MODE!
					if(remarklet.mode=='text'){
						if(jQuery('.ui-resizable').size()>0) jQuery('.ui-resizable').resizable('destroy');
					} else {
						remarklet.mode = 'text';
						if(jQuery('.ui-draggable').size()>0) jQuery('.ui-draggable').draggable('destroy');
					}
					if(!remarklet.isIE) remarklet.target.resizable(remarklet.resizeParams);
				}
			}
		}).bind('mousemove', remarklet.appcommand.recordMousePos);
		jQuery(window).bind('keydown', remarklet.keydown);
		jQuery(window).bind('keyup', remarklet.keyup);
	};
	remarklet.appcommand.blockinit = function(){
		if(typeof jQuery=='function' && typeof jQuery.ui=='object'){
			remarklet.appcommand.init();
		} else {
			remarklet.blocktime = window.setInterval(loadRemarklet, 10);
		}
		function loadRemarklet(){
			if(typeof jQuery=='function' && typeof jQuery.ui=='object'){
				window.clearInterval(remarklet.blocktime);
				remarklet.appcommand.init();
			}
		}
	};
	remarklet.appcommand.blockinit();
	// http://remysharp.com/2009/02/27/analytics-for-bookmarklets-injected-scripts/
	function gaTrack(g,h,i){function c(e,j){return e+Math.floor(Math.random()*(j-e))}var f=1000000000,k=c(f,9999999999),a=c(10000000,99999999),l=c(f,2147483647),b=(new Date()).getTime(),d=window.location,m=new Image(),n='http://www.google-analytics.com/__utm.gif?utmwv=1.3&utmn='+k+'&utmsr=-&utmsc=-&utmul=-&utmje=0&utmfl=-&utmdt=-&utmhn='+h+'&utmr='+d+'&utmp='+i+'&utmac='+g+'&utmcc=__utma%3D'+a+'.'+l+'.'+b+'.'+b+'.'+b+'.2%3B%2B__utmb%3D'+a+'%3B%2B__utmc%3D'+a+'%3B%2B__utmz%3D'+a+'.'+b+'.2.2.utmccn%3D(referral)%7Cutmcsr%3D'+d.host+'%7Cutmcct%3D'+d.pathname+'%7Cutmcmd%3Dreferral%3B%2B__utmv%3D'+a+'.-%3B';m.src=n}
	gaTrack('UA-44858109-1', 'remarklet.com', '/files/remarklet.js');
}

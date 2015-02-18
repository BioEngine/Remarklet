/* Remarklet - v0.9 - 2014-11-21
 by Zach Watkins (zwatkins7@yahoo.com)
 https://remarklet.com
 licensed under the MIT License.
*/
require.config({
	paths:{
		jquery:'jquery-2.1.3.min',
		jqueryui:'jquery-ui.min'
	}
});
requirejs(['jquery','jqueryui'], function($, $ui){
	remarklet = {
		win: $(window),
		body: $('body'),
		mode: 'drag',
		texttarget: false,
		pageSavedState: '',
		clipboard: null,
		resizeOps: {},
		fileRead: false,
		getBlobURL: (window.URL && URL.createObjectURL.bind(URL)) || (window.webkitURL && webkitURL.createObjectURL.bind(webkitURL)) || window.createObjectURL,
		mousePos: {x: null, y: null},
		dragging: false,
		el: {
			box: $('#remarklet-box').length == 0 ? $('<div id="remarklet-box"></div>') : $('#remarklet-box'),
			defaults: $('#remarklet-defaults'),
			usercss: $('#remarklet-usercss').length == 0 ? $('<style id="remarklet-usercss" type="text/css"></style>') : $('#remarklet-usercss'),
			promptwindow: $('<div id="remarklet-prompt"><div id="remarklet-prompt-content"><div id="remarklet-prompt-form" ></div><button id="remarklet-prompt-submit" type="button">OK</button><button id="remarklet-prompt-cancel" type="button">Cancel</button></div></div>'),
			menuwrapper: $('<div id="remarklet-menu"></div>'),
			gridoverlay: $('<div id="remarklet-grid"></div>')
		},
		getLastEdited: function(){
			/* Unfortunately, getting the last element doesn't mean it will have the largest edit number. */
			var last = 0;
			$('.remarklet-ed').each(function(item){
				var curint = parseInt(this.className.match(/remarklet-ed-([0-9]+)/)[1]);
				if(curint > last){
					last = curint;
				}
			});
			return last;
		},
		returnSelector: function($el, ancestor){
			if($el.jquery == undefined) $el = $($el);
			var value = '',
				$parent = $el.parent().length > 0 ? $el.parent() : $el,
				limit = ancestor ? $(ancestor).parent().get(0) : $parent.parent().get(0),
				temp, id, cl;
			while($parent.get(0) != limit){
				temp = value;
				value = $el.get(0).tagName.toLowerCase();
				if($el.attr('id')){
					value += '#';
					value += $el.attr('id');
				}
				if($el.attr('class')){
					value += '.';
					value += $el.attr('class').replace(/\s+/g,'.');
				}
				value += temp;
				$el = $parent;
				$parent = $parent.parent();
			}
			return value;
		}
	};
	remarklet.storedcss = {
		defaultrules: {},
		rules: {},
		text: '',
		editcounter: remarklet.getLastEdited()
	};
	remarklet.dragOps = {
		start: function(event, ui){
			remarklet.dragging = true;
			remarklet.target = $(event.target);
			remarklet.body.off('mousemove', remarklet.recordMousePos);
		},
		stop: function(event, ui){
			var $target = $(event.target);
			remarklet.dragging = false;
			remarklet.recordMousePos(event);
			remarklet.body.on('mousemove', remarklet.recordMousePos);
			remarklet.usercommand.setCSSRule('.remarklet-ed-' + $target.data('remarklet-ed'), $target.attr('style'));
			$target.removeAttr('style');
			remarklet.usercommand.updateUserCSS();
		}
	};
	/* Define commands that the user can execute */
	remarklet.usercommand = {
		toggleGrid: function(){
			remarklet.body.toggleClass('remarklet-show-grid');
		},
		toggleOutlines: function(){
			remarklet.body.toggleClass('remarklet-show-outlines');
		},
		toggleUserCSS: function(){
			remarklet.body.toggleClass('remarklet-show-usercss');
			remarklet.el.csseditor.find('div').attr('contenteditable', function(){
				return this.contentEditable != 'true';
			});
			$('.remarklet-show-usercss #remarklet-usercss-editor').focus();
		},
		addImage: function(){
			remarklet.prompt('<label>Make a placeholder</label><input type="text" value="300x200" id="remarklet-imgdimensions" name="imgdimensions" autofocus="autofocus"> <input type="text" value="#cccccc" id="remarklet-bgcolor" name="bgcolor"> <input type="text" value="#000000" id="remarklet-textcolor" name="textcolor"> <input type="text" value="Image (300x200)" id="remarklet-text" name="imgtext"><br /><label>Enter image url</label><input name="imgurl" id="remarklet-url" type="text" value=""><br><label>Add local file <span title="This image will expire when you leave the page, and will not be stored if you save the page as an HTML file." class="remarklet-hovernote">?</span></label><input name="file" id="remarklet-file" type="file" onchange="jQuery(\'#remarklet-prompt-submit\').attr(\'disabled\',true);var f=this.files[0];var fr=new FileReader();fr.onload=function(ev2){jQuery(\'#remarklet-prompt-submit\').removeAttr(\'disabled\');remarklet.fileRead=remarklet.getBlobURL(f);};fr.readAsDataURL(f);});"/>', function(data){
				remarklet.storedcss.editcounter++;
				var string,
					ednum = remarklet.storedcss.editcounter;
				if(data.imgurl.length>1){
					string = '<img src="' + data.imgurl + '" style="left:' + remarklet.mousePos.x + 'px;top:' + remarklet.mousePos.y + 'px" class="remarklet-newimg" />';
				} else if(remarklet.fileRead!=false){
					string = '<img src="' + remarklet.fileRead + '" style="left:' + remarklet.mousePos.x + 'px;top:' + remarklet.mousePos.y + 'px" class="remarklet-newimg" />';
					remarklet.fileRead = false;
				} else {
					string = '<div style="color:' + data.textcolor + ';background-color:' + data.bgcolor + ';width:' + data.imgdimensions.toLowerCase().split('x')[0] + 'px;height:' + data.imgdimensions.toLowerCase().split('x')[1] + 'px;left:' + remarklet.mousePos.x + 'px;top:' + remarklet.mousePos.y + 'px" class="remarklet-newimg">' + data.imgtext + '</div>';
				}
				$(string).data('remarklet-ed', ednum).addClass('remarklet-ed remarklet-ed-' + ednum).appendTo(remarklet.el.box);
			});
		},
		addNote: function(){
			remarklet.prompt('<label>Enter note text</label><textarea name="notetext" id="remarklet-text" type="text" autofocus="autofocus" cols="48" rows="13">Enter your note\'s text here.</textarea>', function(data){
				remarklet.storedcss.editcounter++;
				/* Characters seem to be 8px wide */
				var width = data.notetext.length * 8,
					ednum = remarklet.storedcss.editcounter;
				if(width > 500){
					width = 500;
				}
				$('<div class="remarklet-note" style="left:' + remarklet.mousePos.x + 'px;top:' + remarklet.mousePos.y + 'px;width:' + width + 'px">' + data.notetext + '</div>').data('remarklet-ed', ednum).addClass('remarklet-ed remarklet-ed-' + ednum).appendTo(remarklet.el.box);
			});
		},
		addCode: function(){
			remarklet.prompt('<label>Enter HTML</label><textarea name="codetext" id="remarklet-text" type="text" autofocus="autofocus" cols="48" rows="13">Enter your code here.</textarea>', function(data){
				remarklet.storedcss.editcounter++;
				var ednum = remarklet.storedcss.editcounter;
				$('<div class="remarklet-usercode" style="position:absolute;left:' + remarklet.mousePos.x + 'px;top:' + remarklet.mousePos.y + 'px;">' + data.codetext + '</div>').data('remarklet-ed', ednum).addClass('remarklet-ed remarklet-ed-' + ednum).appendTo(remarklet.el.box).css({
					width: function(){return this.clientWidth + 1},
					height: function(){return this.clientHeight + 1}
				});
			});
		},
		exportPage: function(){
			var html,
				appfiles = $('script[src*="remarklet.com/rm/scripts"],link[href*="remarklet.com/rm/scripts"]'),
				appfilecode = new Array(),
				data = 'data:text/html;charset=UTF-8,',
				pathpart = location.pathname.split('/'); 
			pathpart.pop();
			pathpart = pathpart.join('/');
			if(document.doctype && document.doctype.publicId==''){
				html = '<!DOCTYPE html>';
			} else {
				html = document.doctype?'<!DOCTYPE ' + document.doctype.name.toUpperCase() + ' PUBLIC "' + document.doctype.publicId + '" "' + document.doctype.systemId + '">' : document.all[0].text;
			}
			remarklet.el.retained.remove();
			for(i=0; i<appfiles.length; i++){
				appfilecode.push(appfiles.get(i).outerHTML);
			}
			var appfileregexp = new RegExp(appfilecode.toString().replace(',','|').replace(/(\.|\/)/g,'\$1'));
			html += document.documentElement.outerHTML.replace(appfileregexp, '');
			remarklet.el.retained.appendTo(remarklet.body);
			html = html.replace(/.overflowRulerX > .firebug[^{]+{[^}]+}|.overflowRulerY\s>\s.firebug[^{]+{[^}]+}/gi,'').replace(/(src|href)=("|')\/\//g, '$1=$2'+location.protocol).replace(/(src|href)=("|')(\/|(?=[^:]{6}))/gi, '$1=$2'+location.protocol + '//' + location.hostname + pathpart + '/').replace(/<script/gi,'<!-- script').replace(/<\/script>/gi,'</script -->').replace(/url\(&quot;/gi,'url(').replace(/.(a-z){3}&quot;\)/gi,'$1)').replace(/url\(\//gi,'url('+location.protocol+'//'+location.hostname+pathpart+'/').replace(/\sremarklet-show-(grid|outlines|usercss)\s/g,' ').replace(/\s?remarklet-show-(grid|outlines|usercss)\s?|\s/g,' ');
			data += encodeURIComponent(html);
			window.open(data, 'Exported From Remarklet', '');
		},
		savePageState: function(){
			remarklet.pageSavedState = '';
			remarklet.body.children().not(remarklet.el.retained).each(function(){
				remarklet.pageSavedState += this.outerHTML.replace(/<script/gi,'<!-- script').replace(/<\/script>/gi,'</script -->');
			});
		},
		restorePageState: function(){
			if(remarklet.pageSavedState != ''){
				remarklet.body.children().not(remarklet.el.retained).remove();
				remarklet.body.prepend(remarklet.pageSavedState);
				remarklet.el.usercss = $('#remarklet-usercss');
				remarklet.el.box = $('#remarklet-box');
			}
		},
		updateUserCSS: function(){
			remarklet.el.usercss.html(remarklet.el.csseditor.find('div').html().replace(/<br>/g,'\n').replace(/&nbsp;/g,' ') + remarklet.storedcss.text);
		},
		returnUniqueStyles: function(sel){
			sel = sel.split(':');
			console.log(sel);
			var selector = sel[0],
				pseudoselector = sel.length > 1 ? ':' + sel[1] : null,
				el = document.querySelector(selector),
				elstyle = window.getComputedStyle(el, pseudoselector),
				parentstyle = window.getComputedStyle(el.parentNode, null),
				defaultstylename = pseudoselector ? el.tagName + ':' + pseudoselector : el.tagName,
				defaultstyle = remarklet.storedcss.defaultrules[defaultstylename],
				values = '',
				flag, attribute, value;
			if(!defaultstyle){
				/* Register element's default styles so we only need to generate them once. */
				var example = document.createElement(el.tagName);
				remarklet.el.defaults.append(example);
				remarklet.storedcss.defaultrules[defaultstylename] = window.getComputedStyle(example, pseudoselector);
				defaultstyle = remarklet.storedcss.defaultrules[defaultstylename];
			}
			if(pseudoselector){
				if(elstyle.content == defaultstyle.content && elstyle.content == 'none'){
					/* If a pseudo-element has no content, we can assume it is not being used. */
					return;
				} else {
					/* Due to a bug in Chrome, we have to add the "content" property manually. */
					defaultstyle = window.getComputedStyle(el, null);
					values += 'content: ';
					values += elstyle.content;
					values += ';'
				}
			}
			for(var i=0; i<elstyle.length; i++){
				flag = false;
				attribute = elstyle[i];
				value = elstyle.getPropertyValue(attribute);
				if(value != defaultstyle.getPropertyValue(attribute)){
					/* When values are auto-calculated by the browser in place of words like auto, none, or 50% */
					switch(attribute){
						case 'outline-color':
						case '-webkit-text-emphasis-color':
						case '-webkit-text-fill-color':
						case '-webkit-text-stroke-color':
						case '-moz-text-decoration-color':
						case '-webkit-text-decoration-color':
							if(value == elstyle.color){
								flag = true;
							}
							break;
						case 'border-bottom-color':
						case 'border-left-color':
						case 'border-right-color':
						case 'border-top-color':
							if(elstyle.borderWidth == '' || elstyle.borderWidth == '0px'){
								flag = true;
							}
							break;
						case '-moz-column-rule-color':
						case '-webkit-column-rule-color':
							if(elstyle.getPropertyValue(attribute.replace('color','width')) == '0px'){
								flag = true;
							}
						case '-moz-text-decoration-line':
						case '-webkit-text-decoration-line':
							if(value == elstyle.textDecoration){
								flag = true;
							}
							break;
						case '-moz-column-gap':
						case '-webkit-column-gap':
							if(elstyle.getPropertyValue(attribute.replace('gap','count')) == 'auto' && elstyle.getPropertyValue(attribute.replace('gap','width')) == 'auto'){
								flag = true;
							}
							break;
						case 'transform-origin':
						case 'perspective-origin':
							if(elstyle.getPropertyValue(attribute.replace('-origin','')) == 'none'){
								flag = true;
							}
							break;
						case '-webkit-text-decorations-in-effect':
							/* Is there a need for this attribute? */
							flag = true;
							break;
						case 'content':
							/* We already included this value since Chrome doesn't enumerate it */
							flag = true;
							break;
						default:
							break;
					}
					if(!flag && parentstyle.getPropertyValue(attribute) != value){
						values += attribute;
						values += ':';
						values += value;
						values += ';';
					}
				}
			}
			return values;
		},
		setCSSRule: function(selector, styles){
			if(!styles) return;
			var found = false,
				rules = remarklet.el.usercss.get(0).sheet.cssRules,
				i = rules.length-1
				newcss = '{' + styles + '}';
			while(i>=0){
				if(selector == rules[i].selectorText){
					found = remarklet.el.usercss.get(0).sheet.cssRules[i];
					i = 0;
				}
				i--;
			}
			if(!found){
				remarklet.el.usercss.get(0).sheet.insertRule(selector + newcss, rules.length);
			} else {
				found.style.cssText = found.style.cssText.replace(/}.*$/,'') + newcss.slice(1);
				newcss = '{'+found.style.cssText+'}';
			}
			remarklet.storedcss.rules[selector] = newcss;
			remarklet.storedcss.text = JSON.stringify(remarklet.storedcss.rules).replace(/":"|","|^{"|"}$/g,'');
		}
	};
	remarklet.usercommand.duplicate = function(sel, attrs){
		var $target = typeof sel == 'object' ? sel : $(sel),
			$children = $target.find('*'),
			$clone = $target.clone(true),
			selectors = new Array(),
			tarsel, closel;
		
		if(attrs){
			if(attrs.id) $clone.attr('id', attrs.id);
			if(attrs.class) $clone.attr('class', attrs.class);
		}
		var cloneselector = remarklet.returnSelector($clone);
		
		selectors.push(remarklet.returnSelector($target));
		$children.each(function(){
			selectors.push(remarklet.returnSelector(this, $target));
		});
		for(var i=0; i<selectors.length; i++){
			tsel = selectors[i];
			csel = cloneselector + selectors[i].replace(selectors[0], '');
			if(remarklet.storedcss.rules[csel] == undefined){
				remarklet.usercommand.setCSSRule(csel, remarklet.usercommand.returnUniqueStyles(tsel));
				remarklet.usercommand.setCSSRule(csel+':before', remarklet.usercommand.returnUniqueStyles(tsel+':before'));
				remarklet.usercommand.setCSSRule(csel+':after', remarklet.usercommand.returnUniqueStyles(tsel+':after'));
			}
		}
		
		return $clone;
	}
	remarklet.el.csseditor = $('<div id="remarklet-ui-usercss" class="remarklet-do-resize remarklet-dont-edit">CSS Changes<div id="remarklet-usercss-editor" ></div></div>').on('keyup', remarklet.usercommand.updateUserCSS);
	remarklet.prompt = function(formhtml, callback){
		remarklet.body.off('mousemove', remarklet.recordMousePos);
		/* Provide prompt window for user input */
		remarklet.el.promptwindow.find('#remarklet-prompt-form').html(formhtml);
		remarklet.win.on('keydown',remarklet.promptwindowkeydown);
		remarklet.el.promptwindow.show();
		remarklet.el.promptwindow.find('#remarklet-prompt-content').css({'margin-top':function(){
			return -1 * (remarklet.el.promptwindow.find('#remarklet-prompt-content').innerHeight()/2);
		}});
		remarklet.el.promptwindow.find('#remarklet-prompt-form input,#remarklet-prompt-form textarea').first().focus();
		remarklet.el.promptwindow.find('#remarklet-prompt-submit').on('click', function(){
			var data = {};
			remarklet.el.promptwindow.find('#remarklet-prompt-form *[name]').each(function(){
				data[this.name] = this.value;
			});
			callback(data);
			remarklet.el.promptwindow.hide();
			$(this).off('click');
			remarklet.body.on('mousemove', remarklet.recordMousePos);
		});
		remarklet.el.promptwindow.find('#remarklet-prompt-cancel').on('click', function(){
			remarklet.el.promptwindow.hide();
			remarklet.el.promptwindow.find('#remarklet-prompt-submit').off('click');
			remarklet.body.on('mousemove', remarklet.recordMousePos);
		});
	};
	remarklet.promptwindowkeydown = function(e){
		switch(e.which){
			case 27:
				/* Escape => Cancel form */
				e.preventDefault();
				$('#remarklet-prompt-cancel').click();
				remarklet.win.off('keydown', remarklet.promptwindowkeydown);
				break;
			case 13:
				/* Enter => Submit form */
				e.preventDefault();
				$('#remarklet-prompt-submit').click();
				remarklet.win.off('keydown', remarklet.promptwindowkeydown);
				break;
			default: break;
		}
	};
	remarklet.recordMousePos = function(e){
		remarklet.mousePos.x = e.pageX - remarklet.el.box.offset().left;
		remarklet.mousePos.y = e.pageY;
	};
	remarklet.changeMode = function(newmode){
		this.body.removeClass('remarklet-'+remarklet.mode+'mode').addClass('remarklet-'+newmode+'mode');
		this.mode = newmode;
		if(newmode == 'drag'){
			remarklet.body.find('*[contenteditable]').removeAttr('contenteditable');
			remarklet.texttarget = false;
			remarklet.target.draggable(remarklet.dragOps);
			/* HACK: Disabling content edit-ability on an element does not remove the cursor from that element in all browsers, so we create a temporary element to focus on and then remove it. */
			$('<input type="text" style="width:1px;height:1px;background-color:transparent;border:0 none;opacity:0;position:fixed;top:0;left:0;" />').appendTo(remarklet.body).focus().blur().remove();
		} else if (newmode == 'text'){
			if(remarklet.target != undefined){
				remarklet.target.attr('contenteditable','true');
			}
			$('.ui-draggable').draggable('destroy');
		}
	};
	remarklet.doFormat = function(usercommandName, showDefaultUI, valueArgument) {
		// FROM https://developer.mozilla.org/en-US/docs/Rich-Text_Editing_in_Mozilla, replace later with WYSIWYG
		if(valueArgument==undefined) valueArgument = null;
		if(showDefaultUI==undefined) showDefaultUI = false;
		if(d.queryusercommandEnabled(usercommandName)){
			d.execusercommand(usercommandName, showDefaultUI, valueArgument);
		} else if(usercommandName=='increasefontsize' || usercommandName=='decreasefontsize'){
			var s = prompt('Enter new font size (between 1 and 7)','');
			d.execusercommand('fontsize',true,s);
		}
	};
	remarklet.buildUI = function(){
		/* Build Menu */
		var m = {
			File: {
				exportit: $('<li>Export</li>').on('click', remarklet.usercommand.exportPage),
				saveit: $('<li>Save</li>').on('click', remarklet.usercommand.savePageState),
				restoreit: $('<li>Restore</li>').on('click', remarklet.usercommand.restorePageState)
			},
			View: {
				grid: $('<li>Grid</li>').on('click', remarklet.usercommand.toggleGrid),
				outlines: $('<li>Outlines</li>').on('click', remarklet.usercommand.toggleOutlines),
				css: $('<li>CSS Changes</li>').on('click', remarklet.usercommand.toggleUserCSS)
			},
			Insert: {
				imageobj: $('<li>Image</li>').on('click', remarklet.usercommand.addImage),
				note: $('<li>Note</li>').on('click', remarklet.usercommand.addNote),
				htmlobj: $('<li>HTML</li>').on('click', remarklet.usercommand.addCode)
			}
		};
		for(i in m){
			var $submenu = $('<ol class="remarklet-submenu"></ol>');
			for(j in m[i]){
				$submenu.append(m[i][j].addClass(' remarklet-menu-' + j));
			}
			$('<li>' + i + '</li>').append($submenu).appendTo(remarklet.el.menuwrapper).wrap('<ol class="remarklet-menuitem"></ol>');
		}
		/* Add App Elements To Page */
		remarklet.el.exported = remarklet.el.box.add(remarklet.el.usercss).appendTo(remarklet.body);
		remarklet.el.retained = remarklet.el.gridoverlay.add(remarklet.el.csseditor).add(remarklet.el.menuwrapper).add(remarklet.el.promptwindow).add(remarklet.el.defaults).appendTo(remarklet.body);
	};
	remarklet.docEvents = {
		mouseover: function(e){
			if(remarklet.dragging) return;
			var $this = remarklet.target = $(this).addClass('remarklet-target');
			switch(remarklet.mode){
				case 'drag':
					$this.draggable(remarklet.dragOps);
					break;
				case 'text':
					$this.attr('contenteditable','true');
					break;
				default: break;
			}
			/* Provide the target's CSS selector in the User CSS window. */
			var selector = this.tagName.toLowerCase();
			if($this.attr('id')!=undefined) selector += '#' + this.id;
			selector += '.remarklet-ed-' + $this.data('remarklet-ed');
			remarklet.el.csseditor.attr('data-remarklet', selector);
			e.stopPropagation();
		},
		mouseout: function(e){
			if(remarklet.dragging) return;
			var $this = $(this).removeClass('remarklet-target');
			$('.ui-draggable').draggable('destroy');
			if(remarklet.mode == 'text'){
				$this.removeAttr('contenteditable');
			}
			e.stopPropagation();
		},
		mousedown: function(e){
			if(e.which!=1) return;
			remarklet.target = $(this);
			if(remarklet.mode == 'text') remarklet.texttarget = $(this);
			e.stopPropagation();
		},
		click: function(e){
			if(this.tagName == 'A'){
				e.preventDefault();
			}
		},
		mousemove: function(e){
			remarklet.recordMousePos(e);
		}
	};
	remarklet.docEvents.toggle = function(state){
		/* Event delegation for non-app elements. */
		if(state == 'on'){
			for(var name in remarklet.docEvents){
				remarklet.body.on(name, '.remarklet-ed', remarklet.docEvents[name]);
			}
		} else {
			for(var name in remarklet.docEvents){
				remarklet.body.off(name, '.remarklet-ed', remarklet.docEvents[name]);
			}
		}
	};
	remarklet.init = function(){
		$.noConflict();
		/* Tag all non-app page elements we may want to interact with. */
		remarklet.body.find('*:not(:hidden,.remarklet-ed)').each(function(index, item){
			var num = index + remarklet.storedcss.editcounter;
			$(item).data('remarklet-ed',num).addClass('remarklet-ed remarklet-ed-' + num);
		});
		remarklet.storedcss.editcounter = remarklet.getLastEdited();
		/* Add UI Elements to page. */
		remarklet.buildUI();
		/* Event delegation for non-app elements. */
		remarklet.docEvents.toggle('on');
		remarklet.win.on('keydown', function(e){
			switch(e.keyCode){
				case 67: /*C*/
					if(remarklet.mode == 'drag' && e.ctrlKey){
						remarklet.clipboard = remarklet.target;
					}
					break;
				case 84: /*T*/
					if(remarklet.mode == 'drag'){
						if(!e.ctrlKey){
							remarklet.changeMode('text');
							e.preventDefault();
						} else if(e.altKey){
							remarklet.target.resizable(remarklet.resizeOps);
							e.preventDefault();
						}
					}
					break;
				case 86: /*V*/
					if(remarklet.mode == 'drag' && e.ctrlKey){
						remarklet.storedcss.editcounter++;
						var $dupe = remarklet.usercommand.duplicate(remarklet.clipboard.draggable('disable').removeAttr('class'), {id: '', class: 'remarklet-ed remarklet-ed-' + remarklet.storedcss.editcounter});
						console.log($dupe);
						$dupe.data('remarklet-ed', remarklet.storedcss.editcounter).appendTo(remarklet.el.box);
					} else if(remarklet.mode == 'text' && !remarklet.texttarget){
						remarklet.changeMode('drag');
						e.preventDefault();
					}
					break;
				case 13: /*Enter*/
					if(remarklet.mode == 'drag' && $('.ui-resizable').length > 0){
						$('.ui-resizable').resizable('destroy');
					} else if(remarklet.mode == 'text' && e.ctrlKey){
						remarklet.changeMode('drag');
						e.preventDefault();
						e.stopPropagation();
					}
					break;
				case 46: /*Del*/
					if(remarklet.mode == 'drag'){
						remarklet.target.remove();
					}
				default: break;
			}
		});
	};
	remarklet.init();
	/* http://remysharp.com/2009/02/27/analytics-for-bookmarklets-injected-scripts/ */
	function gaTrack(g,h,i){function c(e,j){return e+Math.floor(Math.random()*(j-e))}var f=1000000000,k=c(f,9999999999),a=c(10000000,99999999),l=c(f,2147483647),b=(new Date()).getTime(),d=window.location,m=new Image(),n='//www.google-analytics.com/__utm.gif?utmwv=1.3&utmn='+k+'&utmsr=-&utmsc=-&utmul=-&utmje=0&utmfl=-&utmdt=-&utmhn='+h+'&utmr='+d+'&utmp='+i+'&utmac='+g+'&utmcc=__utma%3D'+a+'.'+l+'.'+b+'.'+b+'.'+b+'.2%3B%2B__utmb%3D'+a+'%3B%2B__utmc%3D'+a+'%3B%2B__utmz%3D'+a+'.'+b+'.2.2.utmccn%3D(referral)%7Cutmcsr%3D'+d.host+'%7Cutmcct%3D'+d.pathname+'%7Cutmcmd%3Dreferral%3B%2B__utmv%3D'+a+'.-%3B';m.src=n}
	gaTrack('UA-44858109-1', 'remarklet.com', '/files/remarklet.js');
});

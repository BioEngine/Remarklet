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
	var remarklet = {
		win: $(window),
		bod: $('body'),
		mode: 'drag',
		dragging: false,
		mousecoords: {x: null, y: null},
		texttarget: false,
		ui: {
			menuwrapper: $('<div id="remarklet-menu"></div>'),
			csseditor: $('<div id="remarklet-ui-usercss" class="remarklet-do-resize remarklet-dont-edit">CSS Changes<div id="remarklet-usercss-editor" ></div></div>'),
			gridoverlay: $('<div id="remarklet-grid"></div>'),
			usercss: $('#remarklet-usercss').length == 0 ? $('<style id="remarklet-usercss" type="text/css"></style>') : $('#remarklet-usercss'),
			box: $('#remarklet-box').length == 0 ? $('<div id="remarklet-box"></div>') : $('#remarklet-box')
		},
		storage: {
			pageSavedState: '',
			clipboard: null,
			fileRead: false,
			editcounter: 0,
			css: {
				rules: {},
				text: ''
			}
		},
		resizeOps: {},
		getBlobURL: (window.URL && URL.createObjectURL.bind(URL)) || (window.webkitURL && webkitURL.createObjectURL.bind(webkitURL)) || window.createObjectURL,
	};
	/* Stylesheet Module */
	var stylesheet = (function(){
		var style;
		var rules = {};
		return {
			init: function(obj){
				style = obj;
			},
			setRule: function(selector, rule){
				if(!rule) return;
				var found = false,
					i = style.sheet.cssRules.length-1;
				rule = '{' + rule + '}';
				while(i >= 0){
					if(selector == style.sheet.cssRules[i].selectorText){
						found = style.sheet.cssRules[i];
						i = 0;
					}
					i--;
				}
				if(!found){
					style.sheet.insertRule(selector + rule, style.sheet.cssRules.length);
				} else {
					found.style.cssText = found.style.cssText.replace(/}.*$/,'') + rule.slice(1);
					rule = '{'+found.style.cssText+'}';
				}
				rules[selector] = rule;
			},
			fromHTML: function(html){
				var t, name;
				html = html.replace(/<br>/g,' ').replace(/(&nbsp;|\s)+/g,' ').replace(/\s*([{}]+)\s+/g,'$1').split('}').slice(0,-1);
				rules = {};
				for(var i=0; i<html.length; i++){
					t = html[i].split('{');
					rules[t[0]] = '{' + t[1] + '}';
				}
				t = '';
				for(name in rules){ 
					t += name;
					t += ' ';
					t += rules[name].replace(/({|;)\s*/g,'$1\n    ').replace('    }','}\n');
				}
				style.innerHTML = t;
			},
			getRules: function(){
				return rules;
			}
		};
	}());
	/* Element Duplication Module. Dependency: stylesheet.setRule */
	var duplicate = (function(){
		var rules = {},
			rulelength = 0,
			stylesheet;
		var getSelector = function(el){
			var value = el.tagName.toLowerCase();
			if(el.id !== ''){
				value += '#';
				value += el.id;
			}
			if(el.className !== ''){
				value += '.';
				value += el.className.replace(/\s+/g,'.');
			}
			return value;
		};
		var getSelectorsBetween = function(start, end){
			var parent = end.parentNode,
				limit = start.parentNode,
				value = getSelector(end),
				temp;
			while(parent != limit){
				temp = value;
				value = getSelector(parent);
				value += ' ';
				value += temp;
				parent = parent.parentNode;
			}
			return value;
		};
		var getUniqueStyles = function(sel, destination, clone){
			sel = sel.split(':');
			var selector = sel[0],
				pseudoselector = sel.length > 1 ? ':' + sel[1] : null,
				el = document.querySelector(selector),
				elstyle = window.getComputedStyle(el, pseudoselector),
				parentstyle = window.getComputedStyle(el.parentNode, null),
				clonestyle = window.getComputedStyle(clone, pseudoselector),
				values = '',
				flag, attribute, value;
			if(pseudoselector){
				if(elstyle.content == clonestyle.content && elstyle.content == 'none'){
					return;
				} else {
					clonestyle = window.getComputedStyle(el, null);
					values += 'content: ';
					values += elstyle.content;
					values += ';';
				}
			}
			for(var i=0; i<elstyle.length; i++){
				flag = false;
				attribute = elstyle[i];
				value = elstyle.getPropertyValue(attribute);
				if(value != clonestyle.getPropertyValue(attribute)){
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
							if(elstyle.borderWidth === '' || elstyle.borderWidth == '0px'){
								flag = true;
							}
							break;
						case '-moz-column-rule-color':
						case '-webkit-column-rule-color':
							if(elstyle.getPropertyValue(attribute.replace('color','width')) == '0px'){
								flag = true;
							}
							break;
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
							flag = true;
							break;
						case 'content':
							flag = true;
							break;
						default:
							break;
					}
					if(!flag && (parentstyle.getPropertyValue(attribute) != value || clonestyle.getPropertyValue(attribute) != value)){
						values += attribute;
						values += ':';
						values += value;
						values += ';';
					}
				}
			}
			return values;
		};
		var addRule;
		return {
			init: function(setRule){
				addRule = setRule;
			},
			setSheet: function(obj){
				stylesheet = obj;
			},
			create: function(sel, destination, attrs){
				var target = typeof sel == 'string' ? document.querySelector(sel) : sel,
					selectors = [],
					children = target.querySelectorAll('*'),
					clone = target.cloneNode(true),
					tsel, csel, cloneselector;
				if(attrs){
					if(attrs.id) clone.id = attrs.id;
					if(attrs.class) clone.className = attrs.class;
				}
				cloneselector = getSelector(clone);

				if(typeof destination == 'string'){
					document.querySelector(destination).appendChild(clone);
				} else {
					if(destination.nextSibling){
						destination.parentNode.insertBefore(clone, destination.nextSibling);
					} else {
						destination.parentNode.appendChild(clone);
					}
				}

				selectors.push(getSelector(target));

				for(var i=0; i<children.length; i++){
					selectors.push(getSelectorsBetween(target, children[i]));
				}

				for(var j=0; j<selectors.length; j++){
					tsel = selectors[j];
					csel = cloneselector + selectors[j].replace(selectors[0], '');
					if(rules[csel] === undefined){
						addRule(csel, getUniqueStyles(tsel, destination, clone));
						addRule(csel+':before', getUniqueStyles(tsel+':before', destination, clone));
						addRule(csel+':after', getUniqueStyles(tsel+':after', destination, clone));
					}
				}
				return clone;
			}
		};
	}());
	/* Prompt Window Module. Dependencies: jQuery */
	var prompt = (function(){
		var callback = function(){};
		var open = function(formhtml, init, call){
			ui.form.html(formhtml);
			init();
			ui.window.show();
			ui.content.css({'margin-top':function(){
				return -1 * (ui.content.innerHeight()/2);
			}});
			ui.form.find('input,textarea').first().focus();
			callback = call;
		};
		var submit = function(){
			var data = {};
			ui.form.find('*[name]').each(function(){
				data[this.name] = this.value;
			});
			callback(data);
			ui.window.hide();
		};
		var cancel = function(){
			ui.window.focus().blur().hide();
		};
		var keydown = function(e){
			e.stopPropagation();
			switch(e.keyCode){
				case 27:
					/* Escape => Cancel form */
					e.preventDefault();
					cancel();
					break;
				default: break;
			}
		};
		var ui = {
			window: $('<div></div>').on('keydown', keydown),
			form: $('<div></div>'),
			content: $('<div></div>'),
			submit: $('<button type="button">Submit</button>').on('click', submit),
			cancel: $('<button type="button">Cancel</button>').on('click', cancel)
		};
		return {
			init: function(prefix){
				for(key in ui){
					ui[key].attr('id', prefix+'-prompt-'+key);
				}
				ui.content.append(ui.form).append(ui.submit).append(ui.cancel).appendTo(ui.window);
				ui.window.appendTo('body');
			},
			get: {
				window: function(){
					return ui.window;
				},
				form: function(){
					return ui.form;
				},
				submit: function(){
					return ui.submit;
				}
			},
			open: open
		};
	}());
	/* Define commands that the user interface can execute. */
	remarklet.utility = {
		dragOps: {
			start: function(event, ui){
				remarklet.dragging = true;
				remarklet.target = $(event.target);
				remarklet.bod.off('mousemove', remarklet.utility.recordMousePos);
			},
			stop: function(event, ui){
				var $target = $(event.target);
				remarklet.dragging = false;
				remarklet.utility.recordMousePos(event);
				remarklet.bod.on('mousemove', remarklet.utility.recordMousePos);
				stylesheet.setRule('.remarklet-' + $target.data('remarklet'), $target.attr('style'));
				$target.removeAttr('style');
				remarklet.usercommand.updateUserCSSUI();
			}
		},
		recordMousePos: function(e){
			remarklet.mousecoords.x = e.pageX - remarklet.ui.box.offset().left;
			remarklet.mousecoords.y = e.pageY;
		},
		getLastEdited: function(){
			/* Unfortunately, getting the last element doesn't mean it will have the largest edit number. */
			var last = 0;
			$('.remarklet').each(function(item){
				var curint = parseInt(this.className.match(/remarklet-([0-9]+)/)[1]);
				if(curint > last){
					last = curint;
				}
			});
			return last;
		}
	};
	/* Define commands that the user can execute */
	remarklet.usercommand = {
		addImage: function(){
			prompt.open('<label>Make a placeholder</label><input type="text" value="300x200" id="remarklet-imgdimensions" name="imgdimensions" autofocus="autofocus"> <input type="text" value="#cccccc" id="remarklet-bgcolor" name="bgcolor"> <input type="text" value="#000000" id="remarklet-textcolor" name="textcolor"> <input type="text" value="Image (300x200)" id="remarklet-text" name="imgtext"><br /><label>Enter image url</label><input name="imgurl" id="remarklet-url" type="text" value=""><br><label>Add local file <span title="This image will expire when you leave the page, and will not be stored if you save the page as an HTML file." class="remarklet-hovernote">?</span></label><input name="file" id="remarklet-file" type="file"/>', function(){
				prompt.get.window().find('#remarklet-file').on('change', function(){
					prompt.get.submit().attr('disabled',true);
					var f = this.files[0];
					var fr = new FileReader();
					fr.onload = function(ev2){
						prompt.get.submit().removeAttr('disabled');
						remarklet.storage.fileRead = remarklet.getBlobURL(f);
					};
					fr.readAsDataURL(f);
				});
				remarklet.bod.off('mousemove', remarklet.utility.recordMousePos);
			}, function(data){
				prompt.get.window().find('#remarklet-file').off('change');
				remarklet.storage.editcounter++;
				var string,
					ednum = remarklet.storage.editcounter;
				if(data.imgurl.length>1){
					string = '<img src="' + data.imgurl + '" style="left:' + remarklet.mousecoords.x + 'px;top:' + remarklet.mousecoords.y + 'px" class="remarklet-newimg" />';
				} else if(remarklet.storage.fileRead!=false){
					string = '<img src="' + remarklet.storage.fileRead + '" style="left:' + remarklet.mousecoords.x + 'px;top:' + remarklet.mousecoords.y + 'px" class="remarklet-newimg" />';
					remarklet.storage.fileRead = false;
				} else {
					string = '<div style="color:' + data.textcolor + ';background-color:' + data.bgcolor + ';width:' + data.imgdimensions.toLowerCase().split('x')[0] + 'px;height:' + data.imgdimensions.toLowerCase().split('x')[1] + 'px;left:' + remarklet.mousecoords.x + 'px;top:' + remarklet.mousecoords.y + 'px" class="remarklet-newimg">' + data.imgtext + '</div>';
				}
				$(string).data('remarklet', ednum).addClass('remarklet remarklet-' + ednum).appendTo(remarklet.ui.box);
				remarklet.bod.on('mousemove', remarklet.utility.recordMousePos);
			});
		},
		addNote: function(){
			prompt.open('<label>Enter note text</label><textarea name="notetext" id="remarklet-text" type="text" autofocus="autofocus" cols="48" rows="13">Enter your note\'s text here.</textarea>', function(){
				remarklet.bod.off('mousemove', remarklet.utility.recordMousePos);
			}, function(data){
				remarklet.storage.editcounter++;
				/* Characters seem to be 8px wide */
				var width = data.notetext.length * 8,
					ednum = remarklet.storage.editcounter;
				if(width > 500){
					width = 500;
				}
				$('<div class="remarklet-note" style="left:' + remarklet.mousecoords.x + 'px;top:' + remarklet.mousecoords.y + 'px;width:' + width + 'px">' + data.notetext + '</div>').data('remarklet', ednum).addClass('remarklet remarklet-' + ednum).appendTo(remarklet.ui.box);
				remarklet.bod.on('mousemove', remarklet.utility.recordMousePos);
			});
		},
		addCode: function(){
			prompt.open('<label>Enter HTML</label><textarea name="codetext" id="remarklet-text" type="text" autofocus="autofocus" cols="48" rows="13">Enter your code here.</textarea>', function(){
				remarklet.bod.off('mousemove', remarklet.utility.recordMousePos);
			}, function(data){
				remarklet.storage.editcounter++;
				var ednum = remarklet.storage.editcounter;
				$('<div class="remarklet-usercode" style="position:absolute;left:' + remarklet.mousecoords.x + 'px;top:' + remarklet.mousecoords.y + 'px;">' + data.codetext + '</div>').data('remarklet', ednum).addClass('remarklet remarklet-' + ednum).appendTo(remarklet.ui.box).css({
					width: function(){return this.clientWidth + 1},
					height: function(){return this.clientHeight + 1}
				});
				remarklet.bod.on('mousemove', remarklet.utility.recordMousePos);
			});
		},
		exportPage: function(){
			var html,
				data = 'data:text/html;charset=UTF-8,',
				pathpart = location.pathname.split('/'); 
			pathpart.pop();
			pathpart = pathpart.join('/');
			if(document.doctype && document.doctype.publicId==''){
				html = '<!DOCTYPE html>';
			} else {
				html = document.doctype?'<!DOCTYPE ' + document.doctype.name.toUpperCase() + ' PUBLIC "' + document.doctype.publicId + '" "' + document.doctype.systemId + '">' : document.all[0].text;
			}
			html += document.documentElement.outerHTML;
			$('script[src*="remarklet.com/rm/scripts"],link[href*="remarklet.com/rm/scripts"]').add(remarklet.ui.retained).each(function(){
				html = html.replace(this.outerHTML, '');
			});
			html = html.replace(/.overflowRulerX > .firebug[^{]+{[^}]+}|.overflowRulerY\s>\s.firebug[^{]+{[^}]+}/gi,'').replace(/(src|href)=("|')\/\//g, '$1=$2'+location.protocol).replace(/(src|href)=("|')(\/|(?=[^:]{6}))/gi, '$1=$2'+location.protocol + '//' + location.hostname + pathpart + '/').replace(/<script/gi,'<!-- script').replace(/<\/script>/gi,'</script -->').replace(/url\(&quot;/gi,'url(').replace(/.(a-z){3}&quot;\)/gi,'$1)').replace(/url\(\//gi,'url('+location.protocol+'//'+location.hostname+pathpart+'/').replace(/\sremarklet-show-(grid|outlines|usercss)\s/g,' ').replace(/\s?remarklet-show-(grid|outlines|usercss)\s?|\s/g,' ');
			data += encodeURIComponent(html);
			window.open(data, 'Exported From Remarklet', '');
		},
		savePageState: function(){
			remarklet.pageSavedState = '';
			remarklet.bod.children().not(remarklet.ui.retained).each(function(){
				remarklet.pageSavedState += this.outerHTML.replace(/<script/gi,'<!-- script').replace(/<\/script>/gi,'</script -->');
			});
		},
		restorePageState: function(){
			if(remarklet.pageSavedState != ''){
				remarklet.bod.children().not(remarklet.ui.retained).remove();
				remarklet.bod.prepend(remarklet.pageSavedState);
				remarklet.ui.usercss = $('#remarklet-usercss');
				remarklet.ui.box = $('#remarklet-box');
			}
		},
		updateUserCSS: function(e){
			stylesheet.fromHTML(remarklet.ui.csseditor.find('div').html());
		},
		updateUserCSSUI: function(e){
			var rules = stylesheet.getRules();
			var html = '';
			for(name in rules){
				html += name;
				html += ' ';
				html += rules[name].replace(/({|;\s?)/g,'$1<br>    ').replace('    }','}<br>');
			}
			remarklet.ui.csseditor.find('div').html(html);
		},
		viewgrid: function(){
			remarklet.bod.toggleClass('remarklet-show-grid');
		},
		viewoutlines: function(){
			remarklet.bod.toggleClass('remarklet-show-outlines');
		},
		viewusercss: function(){
			remarklet.bod.toggleClass('remarklet-show-usercss');
			remarklet.ui.csseditor.find('div').attr('contenteditable', function(){
				return this.contentEditable != 'true';
			});
			$('.remarklet-show-usercss #remarklet-usercss-editor').focus();
		},
		keyboardshortcuts: function(e){
			if(e.target != remarklet.ui.csseditor.find('#remarklet-usercss-editor').get(0)){
				switch(e.keyCode){
					case 67: /*C*/
						if(remarklet.mode == 'drag' && e.ctrlKey){
							remarklet.clipboard = remarklet.target;
						}
						break;
					case 84: /*T*/
						if(remarklet.mode == 'drag'){
							if(!e.ctrlKey){
								remarklet.usercommand.switchmode('text');
								e.preventDefault();
							} else if(e.altKey){
								remarklet.target.resizable(remarklet.resizeOps);
								e.preventDefault();
							}
						}
						break;
					case 86: /*V*/
						if(remarklet.mode == 'drag' && e.ctrlKey){
							remarklet.storage.editcounter++;
							if(remarklet.clipboard.draggable('instance')){
								remarklet.clipboard.draggable('destroy');
							}
							var original = remarklet.clipboard.removeClass('remarklet-target').get(0);
							var dupe = duplicate.create(original, original, {id: '', class: 'remarklet remarklet-' + remarklet.storage.editcounter});
							$(dupe).data('remarklet', remarklet.storage.editcounter);
						} else if(remarklet.mode == 'text' && !remarklet.texttarget){
							remarklet.usercommand.switchmode('drag');
							e.preventDefault();
						}
						break;
					case 13: /*Enter*/
						if(remarklet.mode == 'drag' && $('.ui-resizable').length > 0){
							$('.ui-resizable').resizable('destroy');
						} else if(remarklet.mode == 'text' && e.ctrlKey){
							remarklet.usercommand.switchmode('drag');
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
			}
		},
		switchmode: function(newmode){
			remarklet.bod.removeClass('remarklet-'+remarklet.mode+'mode').addClass('remarklet-'+newmode+'mode');
			remarklet.mode = newmode;
			if(newmode == 'drag'){
				remarklet.bod.find('*[contenteditable]').removeAttr('contenteditable');
				remarklet.texttarget = false;
				remarklet.target.draggable(remarklet.utility.dragOps);
				/* HACK: Disabling content edit-ability on an element does not remove the cursor from that element in all browsers, so we create a temporary element to focus on and then remove it. */
				$('<input type="text" style="width:1px;height:1px;background-color:transparent;border:0 none;opacity:0;position:fixed;top:0;left:0;" />').appendTo(remarklet.bod).focus().blur().remove();
			} else if (newmode == 'text'){
				if(remarklet.target != undefined){
					remarklet.target.attr('contenteditable','true');
				}
				$('.ui-draggable').draggable('destroy');
			}
		},
		doFormat: function(usercommandName, showDefaultUI, valueArgument) {
			// FROM https://developer.mozilla.org/en-US/docs/Rich-Text_Editing_in_Mozilla, replace later with WYSIWYG
			if(valueArgument==undefined) valueArgument = null;
			if(showDefaultUI==undefined) showDefaultUI = false;
			if(d.queryusercommandEnabled(usercommandName)){
				d.execusercommand(usercommandName, showDefaultUI, valueArgument);
			} else if(usercommandName=='increasefontsize' || usercommandName=='decreasefontsize'){
				var s = prompt('Enter new font size (between 1 and 7)','');
				d.execusercommand('fontsize',true,s);
			}
		}
	};
	remarklet.docEvents = {
		mouseover: function(e){
			if(remarklet.dragging) return;
			var $this = remarklet.target = $(this).addClass('remarklet-target');
			switch(remarklet.mode){
				case 'drag':
					$this.draggable(remarklet.utility.dragOps);
					break;
				case 'text':
					$this.attr('contenteditable','true');
					break;
				default: break;
			}
			/* Provide the target's CSS selector in the User CSS window. */
			var selector = this.tagName.toLowerCase();
			if($this.attr('id')!=undefined) selector += '#' + this.id;
			selector += '.remarklet-' + $this.data('remarklet');
			remarklet.ui.csseditor.attr('data-remarklet', selector);
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
			remarklet.utility.recordMousePos(e);
		},
		toggle: function(state){
			/* Event delegation for non-app elements. */
			if(state == 'on'){
				for(name in remarklet.docEvents){
					if(name != 'toggle'){
						remarklet.bod.on(name, '.remarklet', remarklet.docEvents[name]);
					}
				}
			} else {
				for(name in remarklet.docEvents){
					if(name != 'toggle'){
						remarklet.bod.off(name, '.remarklet', remarklet.docEvents[name]);
					}
				}
			}
		}
	};
	remarklet.ui.build = function(){
		/* Build menu */
		var m = {
			File: {
				Export: remarklet.usercommand.exportPage,
				Save: remarklet.usercommand.savePageState,
				Restore: remarklet.usercommand.restorePageState
			},
			View: {
				Grid: remarklet.usercommand.viewgrid,
				Outlines: remarklet.usercommand.viewoutlines,
				CSS: remarklet.usercommand.viewusercss
			},
			Insert: {
				Image: remarklet.usercommand.addImage,
				Note: remarklet.usercommand.addNote,
				HTML: remarklet.usercommand.addCode
			}
		};
		for(i in m){
			var $submenu = $('<ol class="remarklet-submenu"></ol>');
			for(j in m[i]){
				$('<li class="remarklet-menu-' + j.toLowerCase() + '">' + j + '</li>').on('click', m[i][j]).appendTo($submenu);
			}
			$('<li>' + i + '</li>').append($submenu).appendTo(remarklet.ui.menuwrapper).wrap('<ol class="remarklet-menuitem"></ol>');
		}
		/* Add remaining app UI events */
		remarklet.ui.csseditor.on('keyup', remarklet.usercommand.updateUserCSS);
		remarklet.win.on('keydown', remarklet.usercommand.keyboardshortcuts);
		
		/* Initialize modules. */
		prompt.init('remarklet');
		stylesheet.init(remarklet.ui.usercss.get(0), remarklet.usercommand.updateUserCSSUI);
		duplicate.init(stylesheet.setRule);
		
		/* Insert app elements into page. */
		remarklet.ui.box.add(remarklet.ui.usercss).appendTo(remarklet.bod);
		remarklet.ui.retained = remarklet.ui.gridoverlay.add(remarklet.ui.csseditor).add(remarklet.ui.menuwrapper).add(prompt.get.window()).appendTo(remarklet.bod);
	};
	remarklet.init = function(){
		$.noConflict();
		/* Tag all non-app page elements we may want to interact with. */
		remarklet.bod.find('*:not(:hidden,.remarklet)').each(function(index, item){
			var num = index + remarklet.storage.editcounter;
			$(item).data('remarklet',num).addClass('remarklet remarklet-' + num);
		});
		remarklet.storage.editcounter = remarklet.utility.getLastEdited();
		/* Add UI Elements to page. */
		remarklet.ui.build();
		duplicate.setSheet(remarklet.ui.usercss.get(0));
		/* Event delegation for non-app elements. */
		remarklet.docEvents.toggle('on');
	};
	remarklet.init();
	/* http://remysharp.com/2009/02/27/analytics-for-bookmarklets-injected-scripts/ */
	function gaTrack(g,h,i){function c(e,j){return e+Math.floor(Math.random()*(j-e))}var f=1000000000,k=c(f,9999999999),a=c(10000000,99999999),l=c(f,2147483647),b=(new Date()).getTime(),d=window.location,m=new Image(),n='//www.google-analytics.com/__utm.gif?utmwv=1.3&utmn='+k+'&utmsr=-&utmsc=-&utmul=-&utmje=0&utmfl=-&utmdt=-&utmhn='+h+'&utmr='+d+'&utmp='+i+'&utmac='+g+'&utmcc=__utma%3D'+a+'.'+l+'.'+b+'.'+b+'.'+b+'.2%3B%2B__utmb%3D'+a+'%3B%2B__utmc%3D'+a+'%3B%2B__utmz%3D'+a+'.'+b+'.2.2.utmccn%3D(referral)%7Cutmcsr%3D'+d.host+'%7Cutmcct%3D'+d.pathname+'%7Cutmcmd%3Dreferral%3B%2B__utmv%3D'+a+'.-%3B';m.src=n}
	gaTrack('UA-44858109-1', 'remarklet.com', '/files/remarklet.js');
});

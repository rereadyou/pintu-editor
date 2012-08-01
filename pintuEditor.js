
/**
 *	Translate #pintuEditor textarea to Rich Text Editor
 *  Need jQuery support
 */
var PE = pintuEditor = {

	init: function(tag)
	{
		this.tag = tag;
		var dest = $('#'+tag);
		this.dest = dest;
		var ifr = document.createElement('iframe');
			ifr.name = ifr.id = 'peifr';

			$(ifr).appendTo(dest);
		
		this.doc = ifr.contentDocument || ifr.contentWindow.document;
		this.doc.designMode = "on";
		this.doc.contentEditable = "true";
		this.doc.open();
		this.doc.write('<html><head></head>');
		this.doc.write('<body class="pecontent">Pintu Editor</body></html>');
		this.doc.close();
		this.ifr = ifr;
		return this;
	},

	resize: function(width, height)
	{
		this.width = width;
		this.height = height;
		this.ifr.setAttribute('width', width);
		this.ifr.setAttribute('height', height);
		
		return this;
	},

	config: function(oJson)
	{
		this.config = oJson;
		this.resize(oJson.size.width, oJson.size.height);
		
		for(var a in oJson.css)
		{
			this.css(a, oJson.css[a]);
			$(this.ifr).css(a, oJson.css[a]);
		}
	},

	save: function(file, name, btn)
	{
		var form = "<form name='pintuForm' action='"+file+"' method='post'>";
			form += "<input type='hidden' name='"+name+"' id='"+name+"' />";
			form += "<button type='submit' id='pintuSubmit' class='button'>"+btn+"</button>";
			form += "</form>";
		this.form = form;
		$(this.dest).prepend(form);
		var _that = this;
		
		var form = document.forms['pintuForm'];
		form.onsubmit = function(event){
				// prevent form submition before set input value
				if(event.preventDefault)
				{
					event.preventDefault();
				}
				else
				{
					event.returnValue = false;
				}
				var html = $('#peifr').contents().find('body').html();
				//var _html = document.frames['peifr'].document.body.innerHTML;
				$('input#'+name).val(encodeURIComponent(html));
			
				var o = event.target || event.srcElement;
				o.submit();
			};

	},

	css: function(attr, style)
	{
		this.ifr.style.attr = style;
	},

	toolbar_no_arg_command: ['bold', 'italic', 'underline', 
	                         'indent', 'outdent', 
	                         'insertorderedlist', 'insertunorderedlist', 
	                         'justifyleft', 'justifycenter', 'justifyright', 
	                         'removeformat'],
	                         
	toolbar_sole_arg_command: ['fontname', 'fontsize', 
	                           'forecolor', 'hilitecolor', 
	                           'createlink', 'insertimage', 
	                           'formatblock'],
	                           
	toolbar_modeless_command: ['indent', 'outdent', 
	                           'justifyleft', 'justifycenter', 'justifyright', 
	                           'removeformat'],
	                           
	toolbar: function(json)
	{
		var _that = this;
		if(!this.pebar)
		{
			var pebar = document.createElement('div');
			pebar.className = 'pebar';
			pebar.id = 'pebar';
			
			$(this.dest).prepend(pebar);
			this.pebar = pebar;
		}
		for(item in json)
		{
			var tag = "petb"+item;
			var title = json[item].title;
			var blocks = '<div class="toolItem" id="'+tag+'" title="'+title+'">';
				blocks += '<div class="petoolbar '+tag+'" title="'+title+'"';

			if(json[item].command)
			{
				blocks += ' command='+json[item].command;
				//console.log('Load toolbar item: ', json[item].command, ' --done!');
			}
			blocks += '></div>';
			if(json[item].submenu)
			{
				blocks += '<div class="littleGrayDownArrow"></div>';
			}
			blocks += '</div>';
			
			$(this.pebar).append(blocks);
		}
		//cause the Fuc* IE 6 don't support div:hover, damn it
//		this.pebar.onmouseover = function (e){
//			o = e.target || e.srcElement;
//			if(o.parentNode.className == 'pebar')
//				$(o).addClass('hoverMenu');
//		},
//		this.pebar.ommouseout = function (e){
//			o = e.target || e.srcElement;
//			if(o.parentNode.className == 'pebar')
//				$(o).removeClass('hoverMenu');
//		},
		
		this.pebar.onclick = function(e) { 
			//$('.popup_toolbar_div').hide();
			o = e.target || e.srcElement;
			if(o.className == 'littleGrayDownArrow')
			{
				o = $(o).prev();
			}
			
			if(!$(o).attr('command'))
			{
				return ;
			}

			var fn = $(o).attr('command').toString().toLowerCase(); 
			var noArgCommands	= _that.toolbar_no_arg_command.join();
			var soleArgCommands = _that.toolbar_sole_arg_command.join();
			var modelessCommands= _that.toolbar_modeless_command.join();
			//change the css when an item is selected
			$(o).toggleClass('toolItemSelected');
//			console.info(o);

			if( noArgCommands.indexOf(fn)+1 )
			{
				_that.doc.execCommand(fn, false, null);
				
				if(modelessCommands.indexOf(fn)+1)
				{
					$(o).toggleClass('toolItemSelected');
				}
			}
			else if( soleArgCommands.indexOf(fn)+1 )
			{

				var tag = e.target.id || e.target.parentNode.id || e.srcElement.id || e.srcElement.parentNode.id;
				var o = document.getElementById(tag);

				var cls = o.className;
				//all sole arg command set to be unselected
				$('.petoolbar').not($(o).find('div:first')).removeClass('toolItemSelected');

				var l = o.offsetLeft;
				var t = o.offsetTop + o.offsetHeight - 2;
				
				switch(fn)
				{
					case 'fontname':
						_that.pop_div(t, l, 'fontFamily');
						break;
					case 'forecolor':
						_that.mark = 'fore';
						//$('.petbHIGHLIGHT').removeClass('toolItemSelected');
						_that.pop_div(t, l, 'colorPlate');
						break;
					case 'hilitecolor':
						_that.mark = 'hilite';
						//$('.petbTEXTCOLOR').removeClass('toolItemSelected');
						_that.pop_div(t, l, 'colorPlate');
						break;
					case 'fontsize':
						_that.pop_div(t, l, 'fontSize');
						break;
					case 'createlink':
						$('#linkText').val(_that.doc.getSelection());
						_that.pop_div(t, l, 'link');
						break;
					case 'insertimage':
						_that.pop_div(t, l, 'img');
						break;
					case 'formatblock':
						_that.doc.execCommand('formatblock', false, 'BLOCKQUOTE');
						break;
					default:
						console.info('Have no idea what div should pop!');
						break;
				}
				
			}
			
			//_that.ifr.contentWindow.focus();
		};
	},
	
	link: function(bEnable)
	{
		var linkDiv = "<div id='linkDiv' command='createLink' style='padding: 15px 50px; font-family: arial, sans serif;'>";

			linkDiv += "<div id='popupLinkTitle' style='margin-bottom: 40px;'>";
			linkDiv += "<span>Add a Link</span>";
			linkDiv += "<span class='closeX' ></span>";
			linkDiv += "</div>";

			linkDiv += "<div id='linkDivBody'>";
			linkDiv += "<div id='linkTextDiv' style='font-size: 13px;'>Text to display";
			linkDiv += "<input id='linkText' type='text' style='width: 460px; margin-left: 50px;' /></div>";

			linkDiv += "<div id='radioDiv'>";

		var radioSwitchDiv = "<div id='linkRadio' style='float: left; margin: 20px 0px; width: 150px; font-size: 13px;'>";
			radioSwitchDiv += "<input type='radio' id='linkUrlRadio' class = 'linkDest' name='linkSrc' checked/>Web address" + "</br></br>";
			radioSwitchDiv += "<input type='radio' id='linkMailRadio' class = 'linkDest' name='linkSrc' />Email address";
			radioSwitchDiv += "</div>";
		
		var linkUrl = "<div id='linkUrl' class='linkInput' style='padding: 20px 0px;' >";
			linkUrl += "<b>To what URL should this link go?</b></br><input id='linkDestUrl' type='text' name='linkUrl' style='width: 433px';/>";	
			linkUrl +="<div id='tr_image-dialog-external-image-preview' style='width: 433px; color: #888888 !important; border: 1px solid #DDDDDD; font-size: 13px;'>Not sure what to put in the box? First, find the page on the web that you want to link to. (A search engine might be useful.) Then, copy the web address from the box in your browser's address bar, and paste it into the box above.</font></p></div>";
			linkUrl += "</div>";
		
		var linkMail = "<div id='linkEmail' class='linkInput' style='padding: 20px 0px; display: none; ' >"; 
			linkMail += "<b>To what email address should this link?</b></br> <input id='linkDestMail' type='text' style='width: 433px;' />";
			linkMail += "</div>";	

			linkDiv += radioSwitchDiv;
			linkDiv += "<div id='linkInput' style='float: left; font-size: 13px; padding-left: 10px;'>";
			linkDiv += linkUrl;
			linkDiv += linkMail;
			linkDiv += '</div>';

			linkDiv += "</div>";
			linkDiv += "<div style='clear: both;'></div>";
			linkDiv += "<input id='linkDone' class='button' type='button' style='margin: 0px 0px 0px 5px;' value='OK' disabled />";
			linkDiv += "<input id='linkCancel' class='button' type='button' style='margin: 0px 0px 0px 5px;' value='Cancel' />";
			linkDiv += "</form></div>";

		this.create_div(700, 0, 'link');
		$('#link').append(linkDiv);
		
		var _that = this;
		
		$('.linkDest').each(function(){ 
				$(this).bind('click', function() {
					$('.linkInput').toggle(); 
				});
			});
		

		$('.closeX').bind('click', function() { $('#link').hide();
			$('.petbLINK').removeClass('toolItemSelected');});
		$('#linkCancel').bind('click', function() { $('#link').hide();
			$('.petbLINK').removeClass('toolItemSelected');});
		
		$('#linkDestUrl').bind('input', function() {
					$('#linkDone').attr('disabled', false);
					//console.info('paste');
				});
		
		$(this.link).find('#linkDone').bind('click', function(){ 
				
				var url = $('#linkDestUrl').val();
				var email = $('#linkDestEmail').val();
				
				//set the input txt as link
				var txt = $('#linkText').val();
				if(txt)
				{
					var newLink = '<a href="'+url+'" target="_blank" >'+txt+'</a>';
					//insertHtml is not supported by IE, ie need pasteHTML on textrange
					_that.doc.execCommand('insertHTML', false, newLink);

					$('#linkText').val('');
					$('#linkDestUrl').val('');
					$('#link').hide();
				}
				//check url.
				var urlRegExp = /^http:\/\/\w[\w\/#\.\?&]*\.\w{2,}$/i;
				//if(urlRegExp.test(url))
				console.info(_that.doc.getSelection());
				if(_that.doc.getSelection())
				{
					_that.doc.execCommand('createLink', false, url);
					$('#link').hide();
				}
				else 
				{
					$('#unvalidUrlHint').remove();
					var hint = "<div id='unvalidUrlHint' style='color: #FF0000; font-size: 13px;' >";
						hint += "Unvalid URL or display text, Please input a valid URL and display text.";
						hint += "</div>";
					$('#linkDiv').append(hint);
				}
				// remove css of selected
				$('.petbLINK').removeClass('toolItemSelected');
			});
		


	},

	image: function(imgtype)
	{
		var radioSwitchDiv = "<div id='imgRadio' style='float: left; margin: 20px 0px; width: 150px; font-size: 13px;'>";
			radioSwitchDiv += "<input type='radio' id='pcTypeImg' class = 'imgtype' name='imgSrc' checked/>My Computer" + "</br></br>";
			radioSwitchDiv += "<input type='radio' id='urlTypeImg' class = 'imgtype' name='imgSrc' />Web Address(URL)";
			radioSwitchDiv += "</div>";
		
		var uploadPartDiv = "<div id='uploadPart' class='imgInput' style='padding: 30px 0px;' >";
			uploadPartDiv += "Upload an image <input id='pcImg' type='file' name='uploadfilename' />";	
			uploadPartDiv += "</div>";
		
		var webAddressUrl = "<div id='webimgurl' class='imgInput' style='display: none; ' >"; 
			webAddressUrl += "Image URL <input id='urlImg' type='text' style='width: 331px;' />";

			webAddressUrl +="<div id='tr_image-dialog-external-image-preview' style='width: 400px; color: #888888 !important; border: 1px solid #DDDDDD; text-align: center;'>If your URL is correct, you'll see an image preview here. Large images may take a few minutes to appear.<p><font size='-2'>Remember: Using others' images on the web without their permission may be bad manners, or worse, copyright infringement.</font></p></div>";
			webAddressUrl += "</div>";	

		var imgInput = "<div id='imgInput' style='float: left; font-size: 13px; padding-left: 40px; height: 100px;'>";
			imgInput += uploadPartDiv;
			imgInput += webAddressUrl;
			imgInput += "</div>";
		
		var linkDiv = "<div id='insertImgDiv' command='insertimage' style='padding: 15px 50px; font-family: arial, sans serif;' >";
			linkDiv += "<div id='popupTitle' style='margin-bottom: 40px;'>";
			linkDiv += "<span>Add an Image</span>";
			linkDiv += "<span class='closeX' ></span>";
			linkDiv += "</div>";
			linkDiv += "<form enctype='multipart/form-data' method='post'>";
			
			linkDiv += radioSwitchDiv;
			linkDiv += imgInput;
			
			linkDiv += "<div style='clear: both;'></div></br></br>";
			linkDiv += "<input id='imgDone' class='button' type='button' style='margin: 0px 0px 0px 5px;' value='OK' disabled />";
			linkDiv += "<input id='imgCancel' class='button' type='button' style='margin: 0px 0px 0px 5px;' value='Cancel' />";
			linkDiv += "</form></div>";
		
		
		this.create_div(700, 260, 'img');
		$('#img').append(linkDiv);	

		var _that = this;

		$('.imgtype').each(function(){ 
				$(this).bind('click', function() {
					$('.imgInput').toggle(); 
				});
			});
		
		$('.closeX').bind('click', function() { $('#img').hide();
			$('.petbPICTURE').removeClass('toolItemSelected');});
		$('#imgCancel').bind('click', function() { $('#img').hide();
			$('.petbPICTURE').removeClass('toolItemSelected');});

		//action when img is ready
		function imgReadyAction()
		{
			var imgurl = $('#urlImg').val();
			var extRegExp = /^.+\.(\w{3,})$/i;
				ext = extRegExp.exec(imgurl);

			//check if an ext found
			if(ext && ext[1])
			{
				ext = ext[1].toLowerCase();
			}
			else
			{
				return;
			}

			var exts = (typeof imgtype == 'string') ? imgtype : imgtype.join(',');
				exts = exts.toLowerCase();
			
			if(exts.search(ext) + 1)
			{			
				$('#imgDone').removeAttr('disabled').unbind().bind('click', function() { 					
					_that.doc.execCommand('insertimage', false,  imgurl);
					
					$('#img').toggle();
					$('#urlImg').val('');
					$('#imgDone').attr('disabled', true);
					
					$('.petbPICTURE').removeClass('toolItemSelected');
				});
			}
		}

		$('#urlImg').bind('input', function() {			
				$('#imgDone').attr('disabled', true);
				imgReadyAction();				
			});

	},
	
	create_div: function(width, height, id)
	{
		var div = '<div class="popup_toolbar_div popDiv"';
			div += id ? ' id="'+id : '';
		w = (typeof width == "number") ? width+"px" : width;
		h = (typeof height == "number") ? height+"px" : height;
		
		div += '" style="';
		div += (w==='0px') ? '' : '; width: '+w;
		div += (h==='0px') ? '' : '; height: '+h;
		div += ';" ></div>';		
		
		d = document.createElement('div');
		d.className = 'popup_div';
		this[id] = d;
		$(this.pebar).append(d);
		$(d).append(div);
		
		//console.info('Loading sub menu iteam :'+id+' ...done!');
	},
	
	pop_div: function(top, left, id)
	{
		var regExp = /^#(\w+)$/;
			t = (typeof top == "number") ? top+"px" : top;
			l = (typeof left == "number") ? left+"px" : left;
			id = regExp.exec(id) ? id : '#'+id;
		$('.popup_toolbar_div').not(id).hide();
		$(id).css({"top":t, "left":l}).toggle();
	},
	
	color_plate: function(oJson)
	{
		var colorPlate = '<div id="textColorPlate" class="colorPlate">';
			//colorPlate += '<div id="colorSample" style="border: 1px solid #FF0000; width: 40px; height: 40px; "></div>';
			colorPlate += '<table>';
		for(row in oJson)
		{
			colorPlate += '<tr>';
			for(span in oJson[row])
			{
				colorPlate += '<td><div class="colorBrick" command="" title="'+oJson[row][span];
				colorPlate += '"style="background-color: '+oJson[row][span]+';"></div></td>';
			}
			colorPlate += '</tr>';
		}
		colorPlate += '</table></div>';
		
		this.create_div(0, 0, 'colorPlate');
		$('#colorPlate').append(colorPlate);

		var _that = this;

		this.colorPlate.onmouseover = function(e){
			$('.colorBrick').css({'border':'','width':'14px','height':'12px','margin':'0px -2px -2px 0px'});
			o = e.target || e.srcElement;
			if(o.className == "colorBrick")
			{
				$(o).css({'width':'16px','height':'14px', 'margin':'-2px -4px -4px -2px'});
				$(o).css('border', '1px solid #FFFF00');
			}
		};

		this.colorPlate.onmousedown = function(e){
			o = e.target || e.srcElement;
			//$('#fontSize').hide();
			_that.doc.execCommand(_that.mark+'Color', false, o.title);
			
			//hide selected status of toobaritem
			if(_that.mark == 'fore')
			{
				$('.petbTEXTCOLOR').removeClass('toolItemSelected');
			}
			else if(_that.mark == 'hilite')
			{
				$('.petbHIGHLIGHT').removeClass('toolItemSelected');
			}

			$('#colorPlate').hide();
		};
	},
	
	font_size: function(oJson)
	{
		var size = '<div id="fontSize" style="color: #333333;">';
		
		for(item in oJson)
		{
			var v = oJson[item];
				v = (typeof v === 'number') ? v+'px' : v;

			size += '<div id="'+item+'Font" class="fontSize" command="'+v['size']+'" ';
			size += 'style="font-size: '+v['name']+'; padding: 3px 0px 3px 30px;">';
			size += '<div class="checkmark fs_checkmark" id="'+item+'Font_checkmark"></div>';
			size += item+'</div>';
		}
		size += '</div>';
			
		this.create_div(150, 0, 'fontSize');
		$('#fontSize').append(size);

		var _that = this;
		
		this.fontSize.onmouseover = function(e){
			$('.fontSize').attr('class', 'fontSize');
			o = e.target || e.srcElement;
			$(o).addClass('overFont');
		};
		
		this.fontSize.onmouseout = function(e){
			o = e.target || e.srcElement;
			$(o).removeClass('overFont');
		};

		this.fontSize.onclick =  function(e){
			o = e.target || e.srcElement;
			//hide this popup div
			$('#fontSize').hide();			
			//show the clicked font size selection checkmark
			$('.fs_checkmark').hide();
			$('.fontSize').not(o).css('padding-left', '30px');
			$(o).css('padding-left', '0px');
			//console.info(o, ':' , o.id+'_checkmark');
			$('#'+o.id+'_checkmark').css('display', 'inline-block').toggle();
			
			_that.doc.execCommand('FontSize', false, $(o).attr('command'));
			$('.petbSIZE').removeClass('toolItemSelected');
		};
	
	}, 
	
	font: function(fs)
	{
		var fb = '<div id="fontFamily" style="color: #333333;">';
		for(var f in fs)
		{
			fword = f.replace(/\s/g, '');
			fb += '<div id="font'+fword+'" class="fontFamily" title="'+f+'" command="'+fs[f]+'" ';
			fb += 'style="font-family: '+fs[f]+'; font-size: 13px; padding: 3px 0px 3px 30px;" >';
			fb += '<div class="checkmark ff_checkmark" id="font'+fword+'_checkmark"></div>';
			fb += f+'</div>';
		}
		fb += '</div>';	
		
		this.create_div(150, 0, 'fontFamily');		
		$('#fontFamily').append(fb);

		var _that = this;
		
		this.fontFamily.onmouseover = function(e){
			$('.fontFamily').attr('class', 'fontFamily');
			o = e.target || e.srcElement;
			$(o).addClass('overFont');
		};
		
		this.fontFamily.onmouseout = function(e){
			o = e.target || e.srcElement;
			$(o).removeClass('overFont');
		};

		this.fontFamily.onclick = function(e){
			o = e.target || e.srcElement;
			//console.info(o, o.title, $(o).attr('command'));
			$('#fontFamily').hide();
			
			$('.ff_checkmark').hide();
			$('.fontFamily').not(o).css('padding-left', '30px');
			$(o).css('padding-left', '0px');
			
			//console.info(o, ':' , o.id+'_checkmark');
			$('#'+o.id+'_checkmark').css('display', 'inline-block');
			
			_that.doc.execCommand('FontName', false, $(o).attr('command'));
			$('.petbFONT').removeClass('toolItemSelected');
		};

		_that.ifr.contentWindow.focus();
	}

};

//config the pe editor
PE.init('pintuEditor').config({size: {width:600, height: 300},
								css: {border: '1px solid #4D90FE',
									  'box-shadow': '2px -1px 4px rgba(0, 0, 0, 0.2)'}
							 });

PE.toolbar({BOLD:		{title: 'Bold',				command: 'bold'},
		   ITALIC:		{title: 'Italic',			command: 'italic'},
	       UNDERLINE:	{title: 'Underline',		command: 'underline'},
	       FONT:		{title: 'Font',				command: 'fontname',	submenu: true},
	       SIZE:		{title: 'Size',				command: 'fontsize',	submenu: true},
	       TEXTCOLOR:	{title: 'Text Color',		command: 'forecolor',	submenu: true},
	       HIGHLIGHT:	{title: 'Highlight Color',	command: 'hilitecolor',	submenu: true},
	       //EMOTION:		{title: 'Emotion'},
	       LINK:		{title: 'Link',				command: 'createlink'},
	       NUMBEREDLIST:{title: 'Numbered List',	command: 'insertorderedlist'},
		   BULLETEDLIST:{title: 'Bulleted List',	command: 'insertunorderedlist'},
	       PICTURE:		{title: 'Insert Picture',	command: 'insertimage'},
		   INDENT:		{title: 'Indent',			command: 'indent'},
		   OUTDENT:		{title: 'Outdent',			command: 'outdent'},
		   QUOTE:		{title: 'Quote',			command: 'formatblock'},
		   ALIGNLEFT:	{title: 'Align Left',		command: 'justifyleft'},
		   ALIGNCENTER:	{title: 'Align Center',		command: 'justifycenter'},
		   ALIGNRIGHT:	{title: 'Align Right',		command: 'justifyright'},
		   ALIGNTX:		{title: 'Remove Formatting',command: 'removeformat'}
		 });

PE.color_plate(
			   {row1:	['#FFFFFF', '#CCCCCC', '#C0C0C0', '#999999', '#666666', '#333333', '#000000'],
				row2:	['#FFCCCC', '#FF6666', '#FF0000', '#CC0000', '#990000', '#660000', '#330000'],
				row3:	['#FFCC99', '#FF9966', '#FF9900', '#FF6600', '#CC6600', '#993300', '#663300'],
				row4:	['#FFFF99', '#FFFF66', '#FFCC66', '#FFCC33', '#CC9933', '#996633', '#663333'],
				row5:	['#FFFFCC', '#FFFF33', '#FFFF00', '#FFCC00', '#999900', '#666600', '#333300'],
				row6:	['#99FF99', '#66FF99', '#33FF33', '#33CC00', '#009900', '#006600', '#003300'],
				row7:	['#99FFFF', '#33FFFF', '#66CCCC', '#00CCCC', '#339999', '#336666', '#003333'],
				row8:	['#CCFFFF', '#66FFFF', '#33CCFF', '#3366FF', '#3333FF', '#000099', '#000066'],
				row9:	['#CCCCFF', '#9999FF', '#6666CC', '#6633FF', '#6600CC', '#333399', '#330099'],
				row0:	['#FFCCFF', '#FF99FF', '#CC66CC', '#CC33CC', '#993399', '#663366', '#330033']				
				});

PE.font_size({Small:	{name: 'x-small',	size: 1},
			  Normal:	{name: 'medium',	size: 2},
			  Large:	{name: 'large',		size: 4},
			  Huge:		{name: 'xx-large',	size: 6}
			});

PE.font({'Sans Serif':		'arial,helvetica,sans-serif', 
		 'Serif':			'times new roman,serif',
		 'Wide':			'arial black,sans-serif', 
		 'Narrow':			'arial narrow,sans-serif', 
		 'Comic Sans MS':	'comic sans ms,sans-serif',
		 'Courier New':		'courier new,monospace', 
         'Garamond':		'garamond,serif',
		 'Georgia':			'georgia,serif',
		 'Tahoma':			'tahoma,sans-serif',
		 'Trebuchet MS':	'trebuchet ms,sans-serif', 
		 'Verdana':			'verdana,sans-serif'});

PE.image(['jpg', 'jpeg', 'png', 'bmp']);

PE.link(true);
// form input element name you want to post to server when click button 'Submit'
PE.save('server.php', 'pintuEditor', 'Submit');
//body contents $('#peifr').contents().find('body').html();
// Off cause the html tags ('<*>') can be encoded before save it to database;


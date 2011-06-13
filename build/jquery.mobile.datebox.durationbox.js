/*
 * jQuery Mobile Framework : plugin to provide a date and time picker.
 * Copyright (c) JTSage
 * CC 3.0 Attribution.  May be relicensed without permission/notifcation.
 * https://github.com/jtsage/jquery-mobile-datebox
 */
(function($, undefined ) {
  $.widget( "mobile.datebox", $.mobile.widget, {
	options: {
		theme: 'c',
		pickPageTheme: 'b',
		pickPageInputTheme: 'e',
		pickPageButtonTheme: 'a',
		pickPageHighButtonTheme: 'e',
		pickPageTodayButtonTheme: 'e',
		pickPageSlideButtonTheme: 'd',
		noAnimation: false,
		
		disabled: false,
		wheelExists: false,
		swipeEnabled: true,
		zindex: '500',
		experimentReg: false,
		
		setDateButtonLabel: 'Set Date',
		setTimeButtonLabel: 'Set Time',
		setDurationButtonLabel: 'Set Duration',
		titleDateDialogLabel: 'Set Date',
		titleTimeDialogLabel: 'Set Time',
		titleDialogLabel: false,
		meridiemLetters: ['AM', 'PM'],
		daysOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
		daysOfWeekShort: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
		monthsOfYear: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'Novemeber', 'December'],
		monthsOfYearShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
		durationLabel: ['Days', 'Hours', 'Minutes', 'Seconds'],
		durationDays: ['Day', 'Days'],
		timeFormat: 24,
		
		mode: 'datebox',
		calShowDays: true,
		calShowOnlyMonth: false,
		useDialogForceTrue: false,
		useDialogForceFalse: false,
		useDialog: false,
		useModal: false,
		useInline: false,
		noButtonFocusMode: false,
		noButton: false,
		closeCallback: false,
		
		fieldsOrder: ['m', 'd', 'y'],
		headerFormat: 'ddd, mmm dd, YYYY',
		dateFormat: 'YYYY-MM-DD',
		minuteStep: 1,
		calWeekMode: false,
		calWeekModeFirstDay: 1,
		calWeekModeHighlight: true,
		calStartDay: 0,
		defaultDate: false,
		minYear: false,
		maxYear: false,
		afterToday: false,
		maxDays: false,
		minDays: false,
		blackDays: false,
		blackDates: false,
		durationNoDays: false,
		durationShort: true,
		durationSteppers: {'d': 1, 'h': 1, 'i': 1, 's': 1},
		disabledDayColor: '#888'
	},
	_zeroPad: function(number) {
		return ( ( number < 10 ) ? "0" : "" ) + String(number);
	},
	_makeOrd: function (num) {
		var ending = num % 10;
		if ( num > 9 && num < 21 ) { return 'th'; }
		if ( ending > 3 ) { return 'th'; }
		return ['th','st','nd','rd'][ending];
	},
	_isInt: function (s) {
			return (s.toString().search(/^[0-9]+$/) === 0);
	},
	_dstAdjust: function(date) {
		if (!date) { return null; }
		date.setHours(date.getHours() > 12 ? date.getHours() + 2 : 0);
		return date;
	},
	_getFirstDay: function(date) {
		return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
	},
	_getLastDate: function(date) {
		return 32 - this._dstAdjust(new Date(date.getFullYear(), date.getMonth(), 32)).getDate();
	},
	_getLastDateBefore: function(date) {
		return 32 - this._dstAdjust(new Date(date.getFullYear(), date.getMonth()-1, 32)).getDate();
	},
	_formatter: function(format, date) {
		format = format.replace('o', this._makeOrd(date.getDate()));
		format = format.replace('YYYY', date.getFullYear());
		format = format.replace('mmm',  this.options.monthsOfYear[date.getMonth()] );
		format = format.replace('MM',   this._zeroPad(date.getMonth() + 1));
		format = format.replace('mm',   date.getMonth() + 1);
		format = format.replace('ddd',  this.options.daysOfWeek[date.getDay()] );
		format = format.replace('DD',   this._zeroPad(date.getDate()));
		format = format.replace('dd',   date.getDate());
		return format;
	},
	_formatHeader: function(date) {
		return this._formatter(this.options.headerFormat, date);
	},
	_formatDate: function(date) {
		return this._formatter(this.options.dateFormat, date);
	},
	_isoDate: function(y,m,d) {
		return String(y) + '-' + (( m < 10 ) ? "0" : "") + String(m) + '-' + ((d < 10 ) ? "0" : "") + String(d);
	},
	_formatTime: function(date) {
		var self = this,
			hours = '0', h,
			i, y, days = '',
			meri = 0;
			
		if ( this.options.mode === 'durationbox' ) {
			i = ((self.theDate.getTime() - self.theDate.getMilliseconds()) / 1000) - ((self.initDate.getTime() - self.initDate.getMilliseconds()) / 1000);
			y = parseInt( i / (60*60*24),10); // Days
			if ( !self.options.durationNoDays ) {
				days = (y===0) ? '' : String(y) + ' ' + ((y>1) ? this.options.durationDays[1]:this.options.durationDays[0]) + ', ';
				i = i-(y*60*60*24);
			}
			h = parseInt( i / (60*60), 10); i = i-(h*60*60); // Hours
			y = parseInt( i / (60), 10); i = i-(y*60); // Mins
			if ( self.options.durationShort ) {
				return days + ((h>0||days!=='')?self._zeroPad(h) + ':':'') + ((y>0||h>0||days!=='')?self._zeroPad(y) + ':':'') + ((y>0||h>0||days!=='')?self._zeroPad(parseInt(i, 10)):String(i));
			} else {
				return days + self._zeroPad(h) + ':' + self._zeroPad(y) + ':' + self._zeroPad(parseInt(i, 10));
			}
		}
		if ( this.options.timeFormat === 12 ) {
			if ( date.getHours() > 11 ) {
				meri = 1;
				hours = self._zeroPad(date.getHours() - 12);
				if ( hours === '00' ) { hours = '12'; }
			} else {
				meri = 0;
				hours = self._zeroPad(date.getHours());
				if ( hours === '00' ) { hours = '12'; }
			}
			return hours + ":" + self._zeroPad(date.getMinutes()) + ' ' + this.options.meridiemLetters[meri];
		} else {
			return self._zeroPad(date.getHours()) + ":" + self._zeroPad(date.getMinutes());
		}
	},
	_makeDate: function (str) {
		str = $.trim(str);
		var o = this.options,
			self = this,
			seperator = o.dateFormat.replace(/[mydo ]/gi, "").substr(0,1),
			adv = o.dateFormat,
			exp_input = null,
			exp_format = null,
			exp_temp = null,
			parts = o.dateFormat.split(seperator),
			data = str.split(seperator),
			date = new Date(),
			d_day = 1,
			d_mon = 0,
			d_yar = 2000,
			seconds = 0,
			timeRegex = { '12': /^([012]?[0-9]):([0-5][0-9])\s*(am?|pm?)?$/i, '24': /^([012]?[0-9]):([0-5][0-9])$/i },
			durationRegex = /^(?:([0-9]+) .+, )?(?:([0-9]+):)?(?:([0-9]+):)?([0-9]+)$/i,
			match = null,
			i;
		
		if ( o.mode === 'durationbox' ) {
			match = durationRegex.exec(str);
			if ( match === null ) {
				return new Date(self.initDate.getTime());
			} else {
				seconds = ((self.initDate.getTime() - self.initDate.getMilliseconds()) / 1000) + parseInt(match[4],10);
				if ( typeof match[3] !== 'undefined' ) { seconds = seconds + (parseInt(match[3],10)*60); }
				if ( typeof match[2] !== 'undefined' ) { 
					if ( typeof match[3] === 'undefined' ) {
						seconds = seconds + (parseInt(match[2],10)*60); 
					} else {
						seconds = seconds + (parseInt(match[2],10)*60*60); 
					}
				}
				if ( typeof match[1] !== 'undefined' ) { seconds = seconds + (parseInt(match[1],10)*60*60*24); }
				seconds = seconds * 1000;
				return new Date(seconds);
			}
		}
		if ( o.mode === 'timebox' ) {
			
			if ( o.timeFormat === 12 ) {
				match = timeRegex[o.timeFormat].exec(str);
				
				if( match === null || match.length < 3 ) { 
					return new Date();
				} else if ( match[1] < 12 && match[3].toLowerCase().charAt(0) === 'p' ) {  
					match[1] = parseInt(match[1],10) + 12;
				} else if ( match[1] === 12 ) {
					if ( match[3].toLowerCase().charAt(0) === 'a' ) { match[1] = 0; }
					else { match[1] = 12; }
				} else {
					match[1] = parseInt(match[1],10);
				}
			} else {
				match = timeRegex[o.timeFormat].exec(str);
				
				if( match === null || match.length < 2 || match[1] > 24 ) { 
					return new Date();
				}
			}
			
			date.setMinutes(match[2]);
			date.setHours(match[1]);
			
			return date;
		} else {
			if ( o.experimentalReg ) {
				//console.log('EXPERMENTAL REGEX MODE!');
				adv = adv.replace(/ddd|mmm|o/ig, '(.+?)');
				adv = adv.replace(/yyyy|dd|mm/ig, '([0-9ydm]+)');
				adv = RegExp('^' + adv + '$' , 'i');
				exp_input = adv.exec(str);
				exp_format = adv.exec(o.dateFormat);
				
				if ( exp_input === null || exp_input.length !== exp_format.length ) {
					return new Date();
				} else {
					date = new Date();
					for ( i=0; i<exp_input.length; i++ ) {
						if ( exp_format[i].match(/^dd$/i) )   { date.setDate(parseInt(exp_input[i],10)); }
						if ( exp_format[i].match(/^mm$/i) )   { date.setMonth(parseInt(exp_input[i],10)-1); }
						if ( exp_format[i].match(/^yyyy$/i) ) { date.setYear(parseInt(exp_input[i],10)); }
						if ( exp_format[i].match(/^mmm$/i) )  { 
							exp_temp = o.monthsOfYear.indexOf(exp_input[i]);
							if ( exp_temp > -1 ) {
								date.setMonth(exp_temp);
							}
						}
					}
					return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0); // Normalize time.
				}
			}
			
			if ( parts.length !== data.length ) { // Unrecognized string in input
				if ( o.defaultDate !== false ) {
					date = new Date(o.defaultDate);
					if ( ! date.getDate() ) {
						return new Date();
					} else {
						return date;
					}
				} else {
					return new Date();
				}
			} else { // Good string in input
				for ( i=0; i<parts.length; i++ ) {
					if ( parts[i].match(/d/i) ) { d_day = data[i]; }
					if ( parts[i].match(/m/i) ) { d_mon = data[i]; }
					if ( parts[i].match(/y/i) ) { d_yar = data[i]; }
				}
				date = new Date(d_yar, d_mon-1, d_day,0,0,0,0);
				if ( ! date.getDate() ) {
					return new Date();
				} else {
					return date;
				}
			}
		}
	},
	_checker: function(date) {
		return parseInt(String(date.getFullYear()) + this._zeroPad(date.getMonth()+1) + this._zeroPad(date.getDate()),10);
	},
	_hoover: function(item) {
		$(item).toggleClass('ui-btn-up-'+$(item).attr('data-theme')+' ui-btn-down-'+$(item).attr('data-theme'));
	},
	_offset: function(mode, amount, update) {
		var self = this,
			o = this.options;
			
		if ( typeof(update) === "undefined" ) { update = true; }
		switch(mode) {
			case 'y':
				self.theDate.setYear(self.theDate.getFullYear() + amount);
				break;
			case 'm':
				self.theDate.setMonth(self.theDate.getMonth() + amount);
				break;
			case 'd':
				self.theDate.setDate(self.theDate.getDate() + amount);
				break;
			case 'h':
				self.theDate.setHours(self.theDate.getHours() + amount);
				break;
			case 'i':
				self.theDate.setMinutes(self.theDate.getMinutes() + amount);
				break;
			case 's':
				self.theDate.setSeconds(self.theDate.getSeconds() + amount);
				break;
			case 'a':
				if ( self.pickerMeri.val() === o.meridiemLetters[0] ) { 
					self._offset('h',12,false);
				} else {
					self._offset('h',-12,false);
				}
				break;
		}
		if ( update === true ) { self._update(); }
	},
	_updateduration: function() {
		var self = this,
			secs = (self.initDate.getTime() - self.initDate.getMilliseconds()) / 1000;
		
		if ( !self._isInt(self.pickerDay.val())  ) { self.pickerDay.val(0); }
		if ( !self._isInt(self.pickerHour.val()) ) { self.pickerHour.val(0); }
		if ( !self._isInt(self.pickerMins.val()) ) { self.pickerMins.val(0); }
		if ( !self._isInt(self.pickerSecs.val()) ) { self.pickerSecs.val(0); }
		
		secs = secs + (parseInt(self.pickerDay.val(),10) * 60 * 60 * 24);
		secs = secs + (parseInt(self.pickerHour.val(),10) * 60 * 60);
		secs = secs + (parseInt(self.pickerMins.val(),10) * 60);
		secs = secs + (parseInt(self.pickerSecs.val(),10));
		self.theDate.setTime( secs * 1000 );
		self._update();
	},
	_update: function() {
		var self = this,
			o = self.options, 
			testDate = null,
			i, gridWeek, gridDay, skipThis, thisRow, y, cTheme, inheritDate,
			interval = {'d': 60*60*24, 'h': 60*60, 'i': 60, 's':1},
			calmode = {};
			
		/* BEGIN:DURATIONBOX */
		if ( o.mode === 'durationbox' ) {
			i = ((self.theDate.getTime() - self.theDate.getMilliseconds()) / 1000) - ((self.initDate.getTime() - self.initDate.getMilliseconds()) / 1000);
			if ( i<0 ) { i = 0; self.theDate.setTime(self.initDate.getTime()); }
			
			/* DAYS */
			y = parseInt( i / interval['d'],10); 
			i = i - ( y * interval['d'] ); 
			self.pickerDay.val(y);
			
			/* HOURS */
			y = parseInt( i / interval['h'], 10);
			i = i - ( y * interval['h'] );
			self.pickerHour.val(y);
			
			/* MINS AND SECS */
			y = parseInt( i / interval['i'], 10);
			i = i - ( y * interval['i']); 
			self.pickerMins.val(y);
			self.pickerSecs.val(parseInt(i,10));
		}
		/* END:DURATIONBOX */
		/* CLIP:TIMEBOX */
		/* CLIP:SLIDEBOX */
		/* CLIP:DATEBOX */
		/* CLIP:CALBOX */
	},
	_create: function() {
		var self = this,
			o = $.extend(this.options, this.element.data('options')),
			input = this.element,
			focusedEl = input.wrap('<div class="ui-input-datebox ui-shadow-inset ui-corner-all ui-body-'+ o.theme +'"></div>').parent(),
			theDate = new Date(),
			initDate = new Date(theDate.getTime()),
			dialogTitle = ((o.titleDialogLabel === false)?((o.mode==='timebox')?o.titleTimeDialogLabel:o.titleDateDialogLabel):o.titleDialogLabel),
			openbutton = $('<a href="#" class="ui-input-clear" title="date picker">date picker</a>')
				.bind('vclick', function (e) {
					e.preventDefault();
					if ( !o.disabled ) { self.open(); }
					setTimeout( function() { $(e.target).closest("a").removeClass($.mobile.activeBtnClass); }, 300);
				})
				.appendTo(focusedEl).buttonMarkup({icon: 'grid', iconpos: 'notext', corners:true, shadow:true})
				.css({'vertical-align': 'middle', 'float': 'right'}),
			thisPage = input.closest('.ui-page'),
			pickPage = $("<div data-role='dialog' class='ui-dialog-datebox' data-theme='" + o.pickPageTheme + "' >" +
						"<div data-role='header' data-backbtn='false' data-theme='a'>" +
							"<div class='ui-title'>" + dialogTitle + "</div>"+
						"</div>"+
						"<div data-role='content'></div>"+
					"</div>")
					.appendTo( $.mobile.pageContainer )
					.page().css('minHeight', '0px').css('zIndex', o.zindex).addClass('pop'),
			pickPageContent = pickPage.find( ".ui-content" );
			
		$('label[for='+input.attr('id')+']').addClass('ui-input-text').css('verticalAlign', 'middle');
		
		o.mode = 'durationbox'
			
		if ( o.noButtonFocusMode || o.useInline || o.noButton ) { openbutton.hide(); }
		
		focusedEl.tap(function() {
			if ( !o.disabled && o.noButtonFocusMode ) { self.open(); }
		});
		
		input
			.removeClass('ui-corner-all ui-shadow-inset')
			.focus(function(){
				if ( ! o.disabled ) {
					focusedEl.addClass('ui-focus');
					if ( o.noButtonFocusMode ) { focusedEl.addClass('ui-focus'); self.open(); }
				}
				input.removeClass('ui-focus');
			})
			.blur(function(){
				focusedEl.removeClass('ui-focus');
				input.removeClass('ui-focus');
			})
			.change(function() {
				self.theDate = self._makeDate(self.input.val());
				self._update();
			});
		
		pickPage.find( ".ui-header a").bind('vclick', function(e) {
			e.preventDefault();
			e.stopImmediatePropagation();
			self.close();
		});

		$.extend(self, {
			pickPage: pickPage,
			thisPage: thisPage,
			pickPageContent: pickPageContent,
			input: input,
			theDate: theDate,
			initDate: initDate,
			focusedEl: focusedEl
		});
		
		if ( typeof $.event.special.mousewheel !== 'undefined' ) { o.wheelExists = true; }
		
		self._buildPage();
		
		if ( input.is(':disabled') ) {
			self.disable();
		}
	},
	_buildPage: function () {
		var self = this,
			o = self.options, x, newHour,
			linkdiv =$("<div><a href='#'></a></div>"),
			pickerContent = $("<div>", { "class": 'ui-datebox-container ui-overlay-shadow ui-corner-all ui-datebox-hidden pop ui-body-'+o.pickPageTheme} ).css('zIndex', o.zindex),
			templInput = $("<input type='text' />").addClass('ui-input-text ui-corner-all ui-shadow-inset ui-datebox-input ui-body-'+o.pickPageInputTheme),
			templControls = $("<div>", { "class":'ui-datebox-controls' }),
			controlsPlus, controlsInput, controlsMinus, controlsSet, controlsHeader,
			pickerHour, pickerMins, pickerMeri, pickerMon, pickerDay, pickerYar, pickerSecs,
			calNoNext = false,
			calNoPrev = false,
			screen = $("<div>", {'class':'ui-datebox-screen ui-datebox-hidden'+((o.useModal)?' ui-datebox-screen-modal':'')})
				.css({'z-index': o.zindex-1})
				.appendTo(self.thisPage)
				.bind("vclick", function(event) {
					self.close();
					event.preventDefault();
				});
		
		if ( o.noAnimation ) { pickerContent.removeClass('pop');	}
		
		/* BEGIN:DURATIONBOX */
		if ( o.mode === 'durationbox' ) {
			controlsPlus = templControls.clone().removeClass('ui-datebox-controls').addClass('ui-datebox-scontrols').appendTo(pickerContent);
			controlsInput = controlsPlus.clone().appendTo(pickerContent);
			controlsMinus = controlsPlus.clone().appendTo(pickerContent);
			controlsSet = templControls.clone().appendTo(pickerContent);
			
			pickerDay = templInput.removeClass('ui-datebox-input').clone()
				.keyup(function() {	if ( $(this).val() !== '' ) { self._updateduration(); } });
				
			pickerHour = pickerDay.clone().keyup(function() {	if ( $(this).val() !== '' ) { self._updateduration(); } });
			pickerMins = pickerDay.clone().keyup(function() {	if ( $(this).val() !== '' ) { self._updateduration(); } });
			pickerSecs = pickerDay.clone().keyup(function() {	if ( $(this).val() !== '' ) { self._updateduration(); } });
			
			if ( o.wheelExists ) {
					pickerDay.bind('mousewheel', function(e,d) { e.preventDefault(); self._offset('d', ((d<0)?-1:1)*o.durationSteppers['d']); });
					pickerHour.bind('mousewheel', function(e,d) { e.preventDefault(); self._offset('h', ((d<0)?-1:1)*o.durationSteppers['h']); });
					pickerMins.bind('mousewheel', function(e,d) { e.preventDefault(); self._offset('i', ((d<0)?-1:1)*o.durationSteppers['i']); });
					pickerSecs.bind('mousewheel', function(e,d) { e.preventDefault(); self._offset('s', ((d<0)?-1:1)*o.durationSteppers['s']); });
				}
			
			$('<div>', {'class': 'ui-datebox-sinput'}).append(pickerDay).appendTo(controlsInput).prepend('<label>'+o.durationLabel[0]+'</label>');
			$('<div>', {'class': 'ui-datebox-sinput'}).append(pickerHour).appendTo(controlsInput).prepend('<label>'+o.durationLabel[1]+'</label>');
			$('<div>', {'class': 'ui-datebox-sinput'}).append(pickerMins).appendTo(controlsInput).prepend('<label>'+o.durationLabel[2]+'</label>');
			$('<div>', {'class': 'ui-datebox-sinput'}).append(pickerSecs).appendTo(controlsInput).prepend('<label>'+o.durationLabel[3]+'</label>');
			
			
			$("<a href='#'>" + o.setDurationButtonLabel + "</a>")
				.appendTo(controlsSet).buttonMarkup({theme: o.pickPageTheme, icon: 'check', iconpos: 'left', corners:true, shadow:true})
				.click(function(e) {
					e.preventDefault();
					self.input.val(self._formatTime(self.theDate)).trigger('change');
					self.close();
				});
				
			for ( x=0; x<4; x++ ) {
				linkdiv.clone()
					.appendTo(controlsPlus).buttonMarkup({theme: o.pickPageButtonTheme, icon: 'plus', iconpos: 'bottom', corners:true, shadow:true})
					.attr('data-field', ['d','h','i','s'][x])
					.bind('vclick', function(e) {
						e.preventDefault();
						self._offset($(this).attr('data-field'),o.durationSteppers[$(this).attr('data-field')]);
					});
					
				linkdiv.clone()
					.appendTo(controlsMinus).buttonMarkup({theme: o.pickPageButtonTheme, icon: 'minus', iconpos: 'top', corners:true, shadow:true})
					.attr('data-field', ['d','h','i','s'][x])
					.bind('vclick', function(e) {
						e.preventDefault();
						self._offset($(this).attr('data-field'),-1*o.durationSteppers[$(this).attr('data-field')]);
					});
			}
			
			$.extend(self, {
				pickerHour: pickerHour,
				pickerMins: pickerMins,
				pickerDay: pickerDay,
				pickerSecs: pickerSecs
			});
			
			pickerContent.appendTo(self.thisPage);
		}
		/* END:DURATIONBOX */
		/* CLIP:TIMEBOX */
		/* CLIP:DATEBOX */
		/* CLIP:CALBOX */
		/* CLIP:SLIDEBOX */

		$.extend(self, {
			pickerContent: pickerContent,
			screen: screen
		});
		
		if ( o.useInline ) { 
			self.input.parent().parent().append(self.pickerContent);
			if ( o.useInlineHideInput ) { self.input.parent().hide(); }
			self.input.trigger('change');
			self.pickerContent.removeClass('ui-datebox-hidden');
		}
			
	},
	refresh: function() {
		if ( this.options.useInline === true ) {
			this.input.trigger('change');
		}
		this._update();
	},
	open: function() {
		this.input.trigger('change').blur();
		
		var self = this,
			o = this.options,
			inputOffset = self.focusedEl.offset(),
			pickWinHeight = self.pickerContent.outerHeight(),
			pickWinWidth = self.pickerContent.innerWidth(),
			pickWinTop = inputOffset.top + ( self.focusedEl.outerHeight() / 2 )- ( pickWinHeight / 2),
			pickWinLeft = inputOffset.left + ( self.focusedEl.outerWidth() / 2) - ( pickWinWidth / 2);

		if ( o.useInline ) { return false; }
					
		if ( (pickWinHeight + pickWinTop) > $(document).height() ) {
			pickWinTop = $(document).height() - (pickWinHeight + 2);
		}
		if ( pickWinTop < 45 ) { pickWinTop = 45; }
		
		if ( ( $(document).width() > 400 && !o.useDialogForceTrue ) || o.useDialogForceFalse ) {
			o.useDialog = false;
			if ( o.useModal ) {
				self.screen.fadeIn('slow');
			} else {
				self.screen.removeClass('ui-datebox-hidden');
			}
			self.pickerContent.addClass('ui-overlay-shadow in').css({'position': 'absolute', 'top': pickWinTop, 'left': pickWinLeft}).removeClass('ui-datebox-hidden');
		} else {
			o.useDialog = true;
			self.pickPageContent.append(self.pickerContent);
			self.pickerContent.css({'top': 'auto', 'left': 'auto', 'marginLeft': 'auto', 'marginRight': 'auto'}).removeClass('ui-overlay-shadow ui-datebox-hidden');
			$.mobile.changePage(self.pickPage, 'pop', false, true);
		}
	},
	close: function() {
		var self = this,
			callback;

		if ( self.options.useInline ) {
			return true;
		}

		if ( self.options.useDialog ) {
			$(self.pickPage).dialog('close');
			self.pickerContent.addClass('ui-datebox-hidden').removeAttr('style').css('zIndex', self.options.zindex);
			self.thisPage.append(self.pickerContent);
		} else {
			if ( self.options.useModal ) {
				self.screen.fadeOut('slow');
			} else {
				self.screen.addClass('ui-datebox-hidden');
			}
			self.pickerContent.addClass('ui-datebox-hidden').removeAttr('style').css('zIndex', self.options.zindex).removeClass('in');
		}
		self.focusedEl.removeClass('ui-focus');
		
		if ( self.options.closeCallback !== false ) { callback = new Function(self.options.closeCallback); callback(); }
	},
	disable: function(){
		this.element.attr("disabled",true);
		this.element.parent().addClass("ui-disabled");
		this.options.disabled = true;
		this.element.blur();
	},
	enable: function(){
		this.element.attr("disabled", false);
		this.element.parent().removeClass("ui-disabled");
		this.options.disabled = false;
	}
	
  });
	
  $( ".ui-page" ).live( "pagecreate", function() { 
	$( 'input[data-role="datebox"]', this ).each(function() {
		$(this).datebox();
	});

  });
	
})( jQuery );

/*
 *	Calendar.js - version 2.0
 *	feature:
 *		// todo
 *		- double dateinputs supported (start_time & end_time)
 *
 *	@liupd
 */

;(function() {
	'use strict';
	const CONFIG = {
		type: 'single',					// type: single, double
		date: new Date(),				// default date
		sdate: new Date(),				// default start date
		edate: new Date(),				// default end date
		min: null,						// min date
		max: null,						// max date
		// limit:	null,					// date interval limit
		weeks: ['柒', '壹', '贰', '叁', '肆', '伍', '陆']
	}

	class Calendar{
		constructor(options) {
			var me = this;
			if (!/^#\w+/.test(options.selector) || !document.querySelector(options.selector)) {
				throw Error('Invalid ID selector');
			}

			me.config = _extend(CONFIG, options);
			me.dom 	  = document.querySelector(options.selector);

			me.date = _formatDate(me.config.date, 'YYYY-MM-DD');

			me.dom.addEventListener('click', function(e) {
				me.input = e.target;
				me._init();
			}, false)
		}
		_init() {
			var me = this;
			me.defaultDate = _formatDate(me.date, 'object');
			me.year  = me.defaultDate.y;
			me.month = me.defaultDate.m;
			me.day   = me.defaultDate.d;

			me._createDom();
			me._handler();
		}
		// date
		get date() { return this._date; }
		set date(value) {
			this._date = value;
			this.dom.value = value;
		}
		// year
		get year() { return this._year; }
		set year(value) {
			if (isNaN(value) || !/^[1-9]\d{3}$/.test(value)) {
				throw Error('Invalid year input')
				return false;
			}
			this._year = value;
			this.yearInput && (this.yearInput.value = value);
			this._reRenderDays();
		}
		// month
		get month() { return this._month; }
		set month(value) {
			if (isNaN(value) || !/^[1-9]\d?$/.test(value)) {
				throw Error('Invalid month input')
				return false;
			}
			if (value > 12 || value < 1) {
				return false;
			}
			this._month = value;
			this.monthInput && (this.monthInput.value = value);
			this._reRenderDays();
		}
		// day
		_createDom() {
			var me = this;
			if (!!me.calendar) {
				me.calendar.remove();
			}

			var oYear  = me._createInputDom('year', me.defaultDate.y)
			var oMonth = me._createInputDom('month', me.defaultDate.m);
			var oWeek  = me._createWeekDom();

			var oBtns  = document.createElement('div');
			oBtns.id = 'btnBox';
			oBtns.innerHTML = `<button class=\"submit-btn\" data-handle=\"apply\">Apply</button><button class=\"submit-btn\" data-handle=\"cancel\">Cancel</button>`;

			var oCalendar = document.createElement('div');
			oCalendar.id = 'calendar';
			oCalendar.appendChild(oYear);
			oCalendar.appendChild(oMonth);
			oCalendar.appendChild(oWeek);
			oCalendar.appendChild(oBtns);

			me._position(oCalendar, me.input);

			document.body.appendChild(oCalendar);
			me.calendar = oCalendar;
		}
		_createInputDom(type, value) {
			var me = this;
			var oDiv = document.createElement('div');
			oDiv.className = 'select-box';
			var oBtn1 = document.createElement('button');
			oBtn1.className = 'handler-btn icon icon-arrow-left';
			oBtn1.setAttribute('data-type', '-1');
			oBtn1.setAttribute('data-prop', type);
			var oInput = document.createElement('input');
			oInput.id = 'calendar-' + type;
			oInput.className = 'calendar-ym-input'
			oInput.setAttribute('data-prop', type);
			var oBtn2 = document.createElement('button');
			oBtn2.className = 'handler-btn icon icon-arrow-right';
			oBtn2.setAttribute('data-type', '1');
			oBtn2.setAttribute('data-prop', type);

			me[type + 'Input'] = oInput;
			me[type] = value;

			oDiv.appendChild(oBtn1);
			oDiv.appendChild(oInput);
			oDiv.appendChild(oBtn2);
			return oDiv;
		}
		_createWeekDom() {
			var me = this;
			var oHead = document.createElement('ul');
			oHead.id  = 'calendar-week-head';
			oHead.innerHTML = '';
			me.config.weeks.forEach(function(week) {
				oHead.innerHTML += `<li>${week}</li>`
			})
			var oTable = me._renderDays();

			var oDiv = document.createElement('div');
			oDiv.id = 'calendar-week';
			oDiv.appendChild(oHead);
			oDiv.appendChild(oTable);
			me.weekDom = oDiv;
			return oDiv;
		}
		_renderDays() {
			var me 	  = this,
				year  = me.year,
				month = me.month;
			var isBigYear = !(year % 4) && !!(year % 100) || !(year % 400);
			var total;
			if ( (month > 7 && !(month % 2)) || (month < 8 && month % 2) ) {
				total = 31;
			}else {
				total = month == 2 ? (isBigYear ? 29 : 28) : 30;
			}

			var firstDay = (new Date(year, month-1, 1)).getDay();
			var oUl = document.createElement('ul');
			oUl.id = 'calendar-week-table';
			for (let i = 1; i < total + firstDay + 1; i ++) {
				let oLi = document.createElement('li');
				let index = i - firstDay;
				if (index > 0) {
					oLi.innerHTML = index;
					oLi.className = 'item';
					!me._dateValidity(year, month, index) && oLi.classList.add('disabled');

					oLi.style.webkitAnimationDelay = Math.round(Math.random() * 5) / 20 + 's';
					oLi.style.animationDelay = Math.round(Math.random() * 5) / 20 + 's';

					if (year == me.defaultDate.y && month == me.defaultDate.m && index == me.day) {
						oLi.classList.add('on');
					}
				}
				oUl.appendChild(oLi);
			}
			return oUl;
		}
		_dateValidity(y, m, d) {
			var me = this;
			if (!me.config.min && !me.config.max) {
				return true;
			}
			var now = new Date(y, m-1, d);
			return !(me.config.max && now > new Date(me.config.max) || me.config.min && now < new Date(me.config.min));
		}
		_position(calendar, target) {
			// the calendar dom size is about 240 * 300, set in css
			// rect: target position info
			let rect = target.getBoundingClientRect();

			let win = {
				w: document.body.clientWidth,
				h: document.documentElement.clientWidth
			}

			let top  = rect.top + rect.height;
			let left = rect.left;

			if (win.w - rect.left < 240) {		// in case the target-input is at the right side of the window
				calendar.style.right = (win.w - rect.left - rect.width) + 'px';
			}else {
				calendar.style.left = left + 'px';
			}

			if (win.h - top < 300) {
				calendar.style.bottom = win.h - rect.top + 'px';
			}else {
				calendar.style.top = top + 'px';
			}
		}
		_handler() {
			var me = this;
			me.events = [
				['click', '.handler-btn', '_changeYearMonth']
				,['keyup', '.calendar-ym-input', '_inputYearMonth']
				,['click', '.item', '_selectDay']
				,['click', '.submit-btn', '_submit']
			]
			for (let event of me.events) {
				let ev = event[0],
					el = event[1],
					fn = event[2];
				let fun = function(e) {
					if (!_isTarget(e.target, el)) { return false };

					me[fn].apply(me, [e])
				}
				me.calendar.removeEventListener(ev, fun, false);
				me.calendar.addEventListener(ev, fun, false);
			}
		}
		_changeYearMonth(e) {
			var me = this;
			var oBtn = e.target;
			var type = oBtn.getAttribute('data-type');
			var prop = oBtn.getAttribute('data-prop');
			me[prop] = type > 0 ? me[prop] + 1 : me[prop] - 1;
		}
		_inputYearMonth(e) {
			if (e.keyCode == 13) {
				var me = this;
				var oInput = e.target;
				var prop = oInput.getAttribute('data-prop');
				me[prop] = oInput.value;
			}
		}
		_reRenderDays() {
			var me = this;
			if (me.weekDom) {
				me.weekDom.childNodes[1].remove();
				me.weekDom.appendChild(me._renderDays());
			}
		}
		_selectDay(e) {
			var me = this;
			var oItem = e.target;
			if (oItem.classList.contains('disabled')) {
				return false;
			}
			oItem.parentNode.childNodes._removeClass('on');
			oItem.classList.add('on');
			me.day = Number(oItem.innerHTML);
			me.defaultDate.d = me.day;
			me.defaultDate.y = me.year;
			me.defaultDate.m = me.month;
		}
		_submit(e) {
			var me = this;
			var oBtn = e.target;
			if (oBtn.getAttribute('data-handle') == 'apply') {
				me.date = _formatDate(me.defaultDate, 'YYYY-MM-DD')
			}
			me._cancel();
		}
		_cancel() {
			this.calendar.remove();
		}
	}



	// utils
	function _extend(target, object, isCover) {				// extend target with object
		var temp = {};
		isCover && (temp = target);
		for (let k in target) {
			if (object.hasOwnProperty(k)) {
				temp[k] = object[k]
			}else {
				if (!isCover) {
					temp[k] = target[k]
				}
			}
		}
		return temp;
	}
	function _formatDate(date, format) {					// format date into ['object' | 'YYYYMMDD']
		var result = {};
		if (date instanceof Date) {
			result = {
				y: _db(date.getFullYear()),
				m: _db(date.getMonth() + 1),
				d: _db(date.getDate())
			}
		}else if (typeof date == 'object') {
			result = {
				y: _db(date.y),
				m: _db(date.m),
				d: _db(date.d)
			};
		}else if (typeof date === 'string') {
			if (date.match(/^\d{4}-\d{2}-\d{2}$/) || date.match(/^\d{8}$/)) {
				var nums = date.match(/\d/g);
				result = {
					y: nums[0] + nums[1] + nums[2] + nums[3],
					m: nums[4] + nums[5],
					d: nums[6] + nums[7]
				}
			}else {
				throw Error('date format not supported')
			}
		}

		if (format == 'object') {
			return {y: Number(result.y), m: Number(result.m), d: Number(result.d)};
		}else {
			return format.replace('YYYY', result.y).replace('MM', result.m).replace('DD', result.d);
		}
	}
	function _db(num) {											// double-digit
		return num > 9 ? num.toString() : '0' + (num | 0);
	}
	function _isTarget(target, collection) {					// check if target is in HTMLCollection
		if (typeof collection == 'string') {
			collection = document.querySelectorAll(collection);
		}
		var index = Array.prototype.slice.call(collection).indexOf(target);
		return index > -1;
	}
	NodeList.prototype._removeClass = function(str) {
		var nodes = this;
		for (let node of nodes) {
			node.classList.remove(str);
		}
	}


	// exports
	if (typeof module === 'object' && module && typeof module.exports === 'object') {
		module.exports = Calendar;
	}else {
		if (typeof define === 'function' && define.amd) {
			define(function() {
				return Calendar;
			})
		}else {
			window.Calendar = Calendar;
		}
	}
})()

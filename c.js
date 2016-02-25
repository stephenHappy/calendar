/*
 *	Calendar.js
 *
 */

;(function() {

	class Calendar {
		constructor(options) {
			let dom = document.getElementById(options.id.match(/^#(\w+)/)[1]);
			if (!dom) {
				console.warn('No Input Element Found');
				return false;
			}

			let me = this;
			me.dom 		= dom;
			me.isInit   = false;
			me.options  = options || {};
			me.callback = options.callback;
			me.dom.addEventListener('click', function() {
				me._init();
			}, false)
		}

		_init() {
			let me = this;

			me.defaultDate = _dateFormat(me.dom.value || me.options.defaultDate || new Date(), 'object');

			me.tempDate = {};
			for (let k in me.defaultDate) {
				me.tempDate[k] = me.defaultDate[k];
			}

			me._createDom();			// cerate dom
			me._handler();				// add event listener
		}

		_createDom() {
			let me = this;
			if (!!document.getElementById('calendar')) {
				document.getElementById('calendar').remove();
			}

			let year  = _creSelectDom('calendar-year', me.defaultDate.y);
			let month = _creSelectDom('calendar-month', me.defaultDate.m);

			let week  = _creWeekDom();
			let weekTable = me._renderDays(me.defaultDate);
			week.appendChild(weekTable);

			let btns  = document.createElement('div');
			btns.id = 'btnBox';
			btns.innerHTML = '<button class=\"submit-btn\" data-handle=\"apply\">Apply</button><button class=\"submit-btn\" data-handle=\"cancel\">Cancel</button>';

			let calendar = document.createElement('div');
			calendar.id = 'calendar';
			calendar.appendChild(year);
			calendar.appendChild(month);
			calendar.appendChild(week);
			calendar.appendChild(btns);

			// set the calendar at the correct position
			me._position(calendar, me.dom);
			// append calendar element to the document
			document.body.appendChild(calendar);
			me.calendar = calendar;
		}

		_renderDays(date) {
			let me = this;
			let year  = date.y,
				month = date.m;
			let isBigYear = !(year % 4) && !!(year % 100) || !(year % 400);
			let total;
			if ( (month > 7 && !(month % 2)) || (month < 8 && month % 2) ) {
				total = 31;
			}else {
				if (month == 2) {
					total = isBigYear ? 29 : 28;
				}else {
					total = 30;
				}
			}

			let temp = new Date(year, month-1, 1);	// the first day of this month
			let firstDay = temp.getDay();
			let ul = document.createElement('ul');
			ul.id = 'calendar-week-table';
			for (let i = 0; i < total + firstDay; i ++) {
				let li = document.createElement('li');
				let index = i + 1 - firstDay;
				li.innerHTML = index >= 1 ? index : null;
				li.className = index >= 1 ? 'item' : null;

				li.style.webkitAnimationDelay = Math.round(Math.random() * 5) / 20 + 's';
				li.style.animationDelay = Math.round(Math.random() * 5) / 20 + 's';

				if (date.y == me.defaultDate.y && date.m == me.defaultDate.m && index == me.defaultDate.d) {
					li.classList.add('on');
				}
				ul.appendChild(li);
			}
			return ul;
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
			let me = this;
			me.events = [
				['click', '.handler-btn', '_changeYearMonth']
				,['click', '.item', '_selectDay']
				,['click', '.submit-btn', '_submit']
			]

			const events = me.events;
			for (let event of events) {
				let ev = event[0],
					el = event[1],
					fn = event[2];
				let fun = function(e) {
					let collections = document.querySelectorAll(el);
					if ( _inArray(e.target, collections) < 0 ) return false;

					me[fn].apply(me, [e])
				}
				me.calendar.removeEventListener(ev, fun, false);
				me.calendar.addEventListener(ev, fun, false);
			}
		}

		_changeYearMonth(e) {
			let me  = this;
			let btn = e.target;
			let type = btn.getAttribute('data-handle');
			let input = btn.parentNode.getElementsByTagName('input')[0];
			let id 	= input.id;
			let val = parseInt(input.value)

			if (/year/.test(id)) {
				if (type == 'minus') {
					input.value -= 1;
				}else {
					input.value = ++val;
				}
				me.tempDate.y = parseInt(input.value);
			}else {
				if (type == 'minus') {
					input.value = (val == 1 ? 12 : --val)
				}else {
					input.value = (val == 12 ? 1 : ++val)
				}
				me.tempDate.m = parseInt(input.value);
			}

			me._repaint();
		}

		_selectDay(e) {
			let me = this;
			let day = e.target;

			day.parentNode.getElementsByTagName('li')._removeClass('on');
			day.classList.add('on');
			me.defaultDate.d = _db(parseInt(day.innerHTML));
			me.defaultDate.y = _db(me.tempDate.y);
			me.defaultDate.m = _db(me.tempDate.m);
		}

		_repaint() {
			let me = this;
			document.getElementById('calendar-week-table').remove();
			let weekTable = me._renderDays(me.tempDate);
			document.getElementById('calendar-week').appendChild(weekTable);
		}

		_submit(e) {
			let me = this;
			let btn = e.target;
			let type = btn.getAttribute('data-handle');
			var result = _dateFormat(me.defaultDate, 'YYYY-MM-DD')
			if (type == 'apply') {
				me.dom.value = result
				me.callback && me.callback(result);
			}

			me._cancel();
		}
		_cancel() {
			var me = this;
			me.calendar.remove();
		}
	}
	function _dateFormat(date, format) {
		if (date instanceof Date) {
			date = {
				y: _db(date.getFullYear()),
				m: _db(date.getMonth() + 1),
				d: _db(date.getDate())
			}
		}else if (typeof date === 'string') {
			let nums = date.match(/\d/g);
			date = {
				y: nums[0] + nums[1] + nums[2] + nums[3],
				m: nums[4] + nums[5],
				d: nums[6] + nums[7]
			}
		}

		if (format == 'object') {
			return date;
		}else {
			return format.replace('YYYY', date.y).replace('MM', date.m).replace('DD', date.d);
		}
	}
	function _db(num) {					// double-digit
		num = Number(num)
		num = num > 9 ? num : '0' + num;
		return num.toString()
	}
	function _creSelectDom(id, val) {
		let div = document.createElement('div');
		div.className = 'select-box';
		div.innerHTML = `<button class=\"handler-btn icon icon-arrow-left\" data-handle=\"minus\"></button><input id=${id} value=${val}></input><button class=\"handler-btn icon icon-arrow-right\" data-handle=\"plus\"></button>`
		return div;
	}
	function _creWeekDom() {
		let weekHead = document.createElement('ul');
		weekHead.id = 'calendar-week-head';
		weekHead.innerHTML = `<li title=\"Sunday\">Sun</li><li>Mon</li><li>Tue</li><li>Wed</li><li>Thu</li><li>Fri</li><li>Sat</li>`
		let div = document.createElement('div');
		div.id = 'calendar-week';
		div.appendChild(weekHead);

		return div;
	}
	function _inArray(ele, arr) {
		let n = arr.length;
		let res = -1;
		if (n > 0) {
			for (let i = 0; i < n; i ++) {
				if (ele === arr[i]) {
					res = i;
					break;
				}
			}
		}
		return res;
	}
	NodeList.prototype._removeClass =
	HTMLCollection.prototype._removeClass = function(str) {
		let nodes = this;
		for (let i = 0, n = nodes.length; i < n; i ++) {
			nodes[i].classList.remove(str);
		}
	}



	if (typeof module === 'object' && module && typeof module.exports === 'object') {
		module.exports = Calendar;
	}else {
		window.Calendar = Calendar;
		if (typeof define === 'function' && define.amd) {
			define(function() {
				return Calendar;
			})
		}
	}
})()
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

/*
 *	Calendar.js
 *
 */

;(function () {

	var Calendar = function Calendar(selector, options, callback) {
		var dom = document.getElementById(selector.match(/^#(\w+)/)[1]);
		if (!dom) {
			console.warn('No Input Element Found');
			return false;
		}

		var me = this;
		me.dom = dom;
		me.isInit = false;
		me.options = options;
		me.callback = callback;
		me.dom.addEventListener('click', function () {
			me._init();
		}, false);
	};

	Calendar.prototype._init = function () {
		var me = this;

		me.defaultDate = _dateFormat(me.dom.value || me.options.defaultDate || new Date(), 'object');

		me.tempDate = {};
		for (var k in me.defaultDate) {
			me.tempDate[k] = me.defaultDate[k];
		}

		me._createDom(); // cerate dom
		me._handler(); // add event listener
	};

	Calendar.prototype._createDom = function () {
		var me = this;
		if (!!document.getElementById('calendar')) {
			document.getElementById('calendar').remove();
		}

		var year = _creSelectDom('calendar-year', me.defaultDate.y);
		var month = _creSelectDom('calendar-month', me.defaultDate.m);

		var week = _creWeekDom();
		var weekTable = me._renderDays(me.defaultDate);
		week.appendChild(weekTable);

		var btns = document.createElement('div');
		btns.id = 'btnBox';
		btns.innerHTML = '<button class=\"submit-btn\" data-handle=\"apply\">Apply</button><button class=\"submit-btn\" data-handle=\"cancel\">Cancel</button>';

		var calendar = document.createElement('div');
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
	};

	Calendar.prototype._renderDays = function (date) {
		var me = this;
		var year = date.y,
		    month = date.m;
		var isBigYear = !(year % 4) && !!(year % 100) || !(year % 400);
		var total = undefined;
		if (month > 7 && !(month % 2) || month < 8 && month % 2) {
			total = 31;
		} else {
			if (month == 2) {
				total = isBigYear ? 29 : 28;
			} else {
				total = 30;
			}
		}

		var temp = new Date(year, month - 1, 1); // the first day of this month
		var firstDay = temp.getDay();
		var ul = document.createElement('ul');
		ul.id = 'calendar-week-table';
		for (var i = 0; i < total + firstDay; i++) {
			var li = document.createElement('li');
			var index = i + 1 - firstDay;
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
	};

	Calendar.prototype._position = function (calendar, target) {
		// the calendar dom size is about 240 * 300, set in css
		// rect: target position info
		var rect = target.getBoundingClientRect();

		var win = {
			w: document.body.clientWidth,
			h: document.documentElement.clientWidth
		};

		var top = rect.top + rect.height;
		var left = rect.left;

		if (win.w - rect.left < 240) {
			// in case the target-input is at the right side of the window
			calendar.style.right = win.w - rect.left - rect.width + 'px';
		} else {
			calendar.style.left = left + 'px';
		}

		if (win.h - top < 300) {
			calendar.style.bottom = win.h - rect.top + 'px';
		} else {
			calendar.style.top = top + 'px';
		}
	};

	Calendar.prototype._handler = function () {
		var me = this;
		me.events = [['click', '.handler-btn', '_changeYearMonth'], ['click', '.item', '_selectDay'], ['click', '.submit-btn', '_submit']];

		var events = me.events;
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			var _loop = function _loop() {
				var event = _step.value;

				var ev = event[0],
				    el = event[1],
				    fn = event[2];
				var fun = function fun(e) {
					var collections = document.querySelectorAll(el);
					if (_inArray(e.target, collections) < 0) return false;

					me[fn].apply(me, [e]);
				};
				me.calendar.removeEventListener(ev, fun, false);
				me.calendar.addEventListener(ev, fun, false);
			};

			for (var _iterator = events[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				_loop();
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}
	};

	Calendar.prototype._changeYearMonth = function (e) {
		var me = this;
		var btn = e.target;
		var type = btn.getAttribute('data-handle');
		var input = btn.parentNode.getElementsByTagName('input')[0];
		var id = input.id;
		var val = parseInt(input.value);

		if (/year/.test(id)) {
			if (type == 'minus') {
				input.value -= 1;
			} else {
				input.value = ++val;
			}
			me.tempDate.y = parseInt(input.value);
		} else {
			if (type == 'minus') {
				input.value = val == 1 ? 12 : --val;
			} else {
				input.value = val == 12 ? 1 : ++val;
			}
			me.tempDate.m = parseInt(input.value);
		}

		me._repaint();
	};

	Calendar.prototype._selectDay = function (e) {
		var me = this;
		var day = e.target;

		day.parentNode.getElementsByTagName('li')._removeClass('on');
		day.classList.add('on');
		me.defaultDate.d = _db(parseInt(day.innerHTML));
		me.defaultDate.y = _db(me.tempDate.y);
		me.defaultDate.m = _db(me.tempDate.m);
	};

	Calendar.prototype._repaint = function () {
		var me = this;
		document.getElementById('calendar-week-table').remove();
		var weekTable = me._renderDays(me.tempDate);
		document.getElementById('calendar-week').appendChild(weekTable);
	};

	Calendar.prototype._submit = function (e) {
		var me = this;
		var btn = e.target;
		var type = btn.getAttribute('data-handle');
		type == 'apply' && (me.dom.value = _dateFormat(me.defaultDate, 'YYYY-MM-DD'));
		me._cancel();
	};
	Calendar.prototype._cancel = function () {
		var me = this;
		me.calendar.remove();
	};

	function _dateFormat(date, format) {
		if (date instanceof Date) {
			date = {
				y: _db(date.getFullYear()),
				m: _db(date.getMonth() + 1),
				d: _db(date.getDate())
			};
		} else if (typeof date === 'string') {
			var nums = date.match(/\d/g);
			date = {
				y: nums[0] + nums[1] + nums[2] + nums[3],
				m: nums[4] + nums[5],
				d: nums[6] + nums[7]
			};
		}

		if (format == 'object') {
			return date;
		} else {
			return format.replace('YYYY', date.y).replace('MM', date.m).replace('DD', date.d);
		}
	}
	function _db(num) {
		// double-digit
		num = Number(num);
		num = num > 9 ? num : '0' + num;
		return num.toString();
	}
	function _creSelectDom(id, val) {
		var div = document.createElement('div');
		div.className = 'select-box';
		div.innerHTML = '<button class="handler-btn icon icon-arrow-left" data-handle="minus"></button><input id=' + id + ' value=' + val + '></input><button class="handler-btn icon icon-arrow-right" data-handle="plus"></button>';
		return div;
	}
	function _creWeekDom() {
		var weekHead = document.createElement('ul');
		weekHead.id = 'calendar-week-head';
		weekHead.innerHTML = '<li title="Sunday">Sun</li><li>Mon</li><li>Tue</li><li>Wed</li><li>Thu</li><li>Fri</li><li>Sat</li>';
		var div = document.createElement('div');
		div.id = 'calendar-week';
		div.appendChild(weekHead);

		return div;
	}
	function _inArray(ele, arr) {
		var n = arr.length;
		var res = -1;
		if (n > 0) {
			for (var i = 0; i < n; i++) {
				if (ele === arr[i]) {
					res = i;
					break;
				}
			}
		}
		return res;
	}
	NodeList.prototype._removeClass = HTMLCollection.prototype._removeClass = function (str) {
		var nodes = this;
		for (var i = 0, n = nodes.length; i < n; i++) {
			nodes[i].classList.remove(str);
		}
	};

	if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object' && module && _typeof(module.exports) === 'object') {
		module.exports = Calendar;
	} else {
		window.Calendar = Calendar;
		if (typeof define === 'function' && define.amd) {
			define(function () {
				return Calendar;
			});
		}
	}
})();
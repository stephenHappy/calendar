'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 *	Calendar.js - version 2.0
 *	feature:
 *		// todo
 *		- double dateinputs supported (start_time & end_time)
 *
 *	@liupd
 */

;(function () {
	'use strict';

	var CONFIG = {
		type: 'single', // type: single, double
		date: new Date(), // default date
		sdate: new Date(), // default start date
		edate: new Date(), // default end date
		min: null, // min date
		max: null, // max date
		// limit:	null,					// date interval limit
		weeks: ['柒', '壹', '贰', '叁', '肆', '伍', '陆']
	};

	var Calendar = function () {
		function Calendar(options) {
			_classCallCheck(this, Calendar);

			var me = this;
			if (!/^#\w+/.test(options.selector) || !document.querySelector(options.selector)) {
				throw Error('Invalid ID selector');
			}

			me.config = _extend(CONFIG, options);
			me.dom = document.querySelector(options.selector);

			me.date = _formatDate(me.config.date, 'YYYY-MM-DD');

			me.dom.addEventListener('click', function (e) {
				me.input = e.target;
				me._init();
			}, false);
		}

		_createClass(Calendar, [{
			key: '_init',
			value: function _init() {
				var me = this;
				me.defaultDate = _formatDate(me.date, 'object');
				me.year = me.defaultDate.y;
				me.month = me.defaultDate.m;
				me.day = me.defaultDate.d;

				me._createDom();
				me._handler();
			}
			// date

		}, {
			key: '_createDom',

			// day
			value: function _createDom() {
				var me = this;
				if (!!me.calendar) {
					me.calendar.remove();
				}

				var oYear = me._createInputDom('year', me.defaultDate.y);
				var oMonth = me._createInputDom('month', me.defaultDate.m);
				var oWeek = me._createWeekDom();

				var oBtns = document.createElement('div');
				oBtns.id = 'btnBox';
				oBtns.innerHTML = '<button class="submit-btn" data-handle="apply">Apply</button><button class="submit-btn" data-handle="cancel">Cancel</button>';

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
		}, {
			key: '_createInputDom',
			value: function _createInputDom(type, value) {
				var me = this;
				var oDiv = document.createElement('div');
				oDiv.className = 'select-box';
				var oBtn1 = document.createElement('button');
				oBtn1.className = 'handler-btn icon icon-arrow-left';
				oBtn1.setAttribute('data-type', '-1');
				oBtn1.setAttribute('data-prop', type);
				var oInput = document.createElement('input');
				oInput.id = 'calendar-' + type;
				oInput.className = 'calendar-ym-input';
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
		}, {
			key: '_createWeekDom',
			value: function _createWeekDom() {
				var me = this;
				var oHead = document.createElement('ul');
				oHead.id = 'calendar-week-head';
				oHead.innerHTML = '';
				me.config.weeks.forEach(function (week) {
					oHead.innerHTML += '<li>' + week + '</li>';
				});
				var oTable = me._renderDays();

				var oDiv = document.createElement('div');
				oDiv.id = 'calendar-week';
				oDiv.appendChild(oHead);
				oDiv.appendChild(oTable);
				me.weekDom = oDiv;
				return oDiv;
			}
		}, {
			key: '_renderDays',
			value: function _renderDays() {
				var me = this,
				    year = me.year,
				    month = me.month;
				var isBigYear = !(year % 4) && !!(year % 100) || !(year % 400);
				var total;
				if (month > 7 && !(month % 2) || month < 8 && month % 2) {
					total = 31;
				} else {
					total = month == 2 ? isBigYear ? 29 : 28 : 30;
				}

				var firstDay = new Date(year, month - 1, 1).getDay();
				var oUl = document.createElement('ul');
				oUl.id = 'calendar-week-table';
				for (var i = 1; i < total + firstDay + 1; i++) {
					var oLi = document.createElement('li');
					var index = i - firstDay;
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
		}, {
			key: '_dateValidity',
			value: function _dateValidity(y, m, d) {
				var me = this;
				if (!me.config.min && !me.config.max) {
					return true;
				}
				var now = new Date(y, m - 1, d);
				return !(me.config.max && now > new Date(me.config.max) || me.config.min && now < new Date(me.config.min));
			}
		}, {
			key: '_position',
			value: function _position(calendar, target) {
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
			}
		}, {
			key: '_handler',
			value: function _handler() {
				var me = this;
				me.events = [['click', '.handler-btn', '_changeYearMonth'], ['keyup', '.calendar-ym-input', '_inputYearMonth'], ['click', '.item', '_selectDay'], ['click', '.submit-btn', '_submit']];
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
							if (!_isTarget(e.target, el)) {
								return false;
							};

							me[fn].apply(me, [e]);
						};
						me.calendar.removeEventListener(ev, fun, false);
						me.calendar.addEventListener(ev, fun, false);
					};

					for (var _iterator = me.events[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
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
			}
		}, {
			key: '_changeYearMonth',
			value: function _changeYearMonth(e) {
				var me = this;
				var oBtn = e.target;
				var type = oBtn.getAttribute('data-type');
				var prop = oBtn.getAttribute('data-prop');
				me[prop] = type > 0 ? me[prop] + 1 : me[prop] - 1;
			}
		}, {
			key: '_inputYearMonth',
			value: function _inputYearMonth(e) {
				if (e.keyCode == 13) {
					var me = this;
					var oInput = e.target;
					var prop = oInput.getAttribute('data-prop');
					me[prop] = oInput.value;
				}
			}
		}, {
			key: '_reRenderDays',
			value: function _reRenderDays() {
				var me = this;
				if (me.weekDom) {
					me.weekDom.childNodes[1].remove();
					me.weekDom.appendChild(me._renderDays());
				}
			}
		}, {
			key: '_selectDay',
			value: function _selectDay(e) {
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
		}, {
			key: '_submit',
			value: function _submit(e) {
				var me = this;
				var oBtn = e.target;
				if (oBtn.getAttribute('data-handle') == 'apply') {
					me.date = _formatDate(me.defaultDate, 'YYYY-MM-DD');
				}
				me._cancel();
			}
		}, {
			key: '_cancel',
			value: function _cancel() {
				this.calendar.remove();
			}
		}, {
			key: 'date',
			get: function get() {
				return this._date;
			},
			set: function set(value) {
				this._date = value;
				this.dom.value = value;
			}
			// year

		}, {
			key: 'year',
			get: function get() {
				return this._year;
			},
			set: function set(value) {
				if (isNaN(value) || !/^[1-9]\d{3}$/.test(value)) {
					throw Error('Invalid year input');
					return false;
				}
				this._year = value;
				this.yearInput && (this.yearInput.value = value);
				this._reRenderDays();
			}
			// month

		}, {
			key: 'month',
			get: function get() {
				return this._month;
			},
			set: function set(value) {
				if (isNaN(value) || !/^[1-9]\d?$/.test(value)) {
					throw Error('Invalid month input');
					return false;
				}
				if (value > 12 || value < 1) {
					return false;
				}
				this._month = value;
				this.monthInput && (this.monthInput.value = value);
				this._reRenderDays();
			}
		}]);

		return Calendar;
	}();

	// utils


	function _extend(target, object, isCover) {
		// extend target with object
		var temp = {};
		isCover && (temp = target);
		for (var k in target) {
			if (object.hasOwnProperty(k)) {
				temp[k] = object[k];
			} else {
				if (!isCover) {
					temp[k] = target[k];
				}
			}
		}
		return temp;
	}
	function _formatDate(date, format) {
		// format date into ['object' | 'YYYYMMDD']
		var result = {};
		if (date instanceof Date) {
			result = {
				y: _db(date.getFullYear()),
				m: _db(date.getMonth() + 1),
				d: _db(date.getDate())
			};
		} else if ((typeof date === 'undefined' ? 'undefined' : _typeof(date)) == 'object') {
			result = {
				y: _db(date.y),
				m: _db(date.m),
				d: _db(date.d)
			};
		} else if (typeof date === 'string') {
			if (date.match(/^\d{4}-\d{2}-\d{2}$/) || date.match(/^\d{8}$/)) {
				var nums = date.match(/\d/g);
				result = {
					y: nums[0] + nums[1] + nums[2] + nums[3],
					m: nums[4] + nums[5],
					d: nums[6] + nums[7]
				};
			} else {
				throw Error('date format not supported');
			}
		}

		if (format == 'object') {
			return { y: Number(result.y), m: Number(result.m), d: Number(result.d) };
		} else {
			return format.replace('YYYY', result.y).replace('MM', result.m).replace('DD', result.d);
		}
	}
	function _db(num) {
		// double-digit
		return num > 9 ? num.toString() : '0' + (num | 0);
	}
	function _isTarget(target, collection) {
		// check if target is in HTMLCollection
		if (typeof collection == 'string') {
			collection = document.querySelectorAll(collection);
		}
		var index = Array.prototype.slice.call(collection).indexOf(target);
		return index > -1;
	}
	NodeList.prototype._removeClass = function (str) {
		var nodes = this;
		var _iteratorNormalCompletion2 = true;
		var _didIteratorError2 = false;
		var _iteratorError2 = undefined;

		try {
			for (var _iterator2 = nodes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
				var node = _step2.value;

				node.classList.remove(str);
			}
		} catch (err) {
			_didIteratorError2 = true;
			_iteratorError2 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion2 && _iterator2.return) {
					_iterator2.return();
				}
			} finally {
				if (_didIteratorError2) {
					throw _iteratorError2;
				}
			}
		}
	};

	// exports
	if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object' && module && _typeof(module.exports) === 'object') {
		module.exports = Calendar;
	} else {
		if (typeof define === 'function' && define.amd) {
			define(function () {
				return Calendar;
			});
		} else {
			window.Calendar = Calendar;
		}
	}
})();
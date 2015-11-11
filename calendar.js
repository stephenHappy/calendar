(function(){
	function calendar(e) {
	// _removeClass shim
	HTMLCollection.prototype._removeClass = function(str) {
		var nodes = this;
		for (var i = 0, n = nodes.length; i < n; i ++) {
			nodes[i].classList.remove(str);
		}
	}

	var oInput = e.target;
	// default date object
	var defaultDate = _strToObj(oInput.value) || _strToObj(_dateToStr(new Date()));
	var defaultDateCopy = {};
	for (var i in defaultDate) {
		defaultDateCopy[i] = defaultDate[i];
	}

	// create and append calendar
	var create = {
		date: defaultDate,
		_init: function() {
			var me = this;
			if (document.getElementById('calendar')) {
				document.getElementById('calendar').remove();
			}
			var calendar = me._render();
			return calendar;
		},
		_render: function() {
			var me = this;
			// year, month, week
			var year  = me._selectComponent({id: 'calendar-year', data: me.date.year, type: 'year'});
			var month = me._selectComponent({id: 'calendar-month', data: me.date.month, type: 'month'});
			var week  = me._weekComponent();
			var btns  = me._btnComponent();

			var calendar = document.createElement('div');
			calendar.id = 'calendar';
			calendar.appendChild(year);
			calendar.appendChild(month);
			calendar.appendChild(week);
			calendar.appendChild(btns);

			me._position(calendar, oInput);

			document.body.appendChild(calendar);

			return calendar;
		},
		_position: function(calendar, target) {
			// the calendar dom size is about 240 * 300
			var rect = target.getBoundingClientRect();

			var win = {
				w: document.body.clientWidth,
				h: document.documentElement.clientHeight
			}

			var top = rect.top + rect.height;
			var left = rect.left;

			if (win.w - rect.left < 240) {		// in case the target-input is at the right of page
				calendar.style.right = (win.w - rect.left - rect.width) + 'px';
			}else {
				calendar.style.left = left + 'px';
			}

			if (win.h - top < 300) {			// in case the target-input is at the bottom of page
				calendar.style.bottom = win.h - rect.top + 'px';
			}else {
				calendar.style.top = top + 'px';
			}
		},
		_selectComponent: function(param) {
			var me = this;
			var div = document.createElement('div');
			div.id = param.id;
			div.className = 'select-box'
			div.innerHTML = '<button class=\"handler-btn icon icon-arrow-left\" data-handle=\"minus\"></button>'
							+'<input id=\"' + param.id + '-input\" value=\"' + param.data + '\" readonly>'
							+'<button class=\"handler-btn icon icon-arrow-right\" data-handle=\"-plus\"></button>';
			return div;
		},
		_weekComponent: function() {
			var me = this;
			var weekHead = document.createElement('ul');
			weekHead.id = 'calendar-week-head';
			weekHead.innerHTML = '<li title=\"Sunday\">日</li><li>月</li><li>火</li><li>水</li><li>木</li><li>金</li><li>土</li>';

			var weekTable = me._renderDays(me.date);
			var div = document.createElement('div');
			div.id = 'calendar-week';
			div.appendChild(weekHead);
			div.appendChild(weekTable);

			return div;
		},
		_renderDays: function(date) {
			var year  = date.year,
				month = date.month;
			var isBigYear = !(year % 4) && !!(year % 100) || !(year % 400);
			var days;
			if ( (month > 7 && !(month % 2)) || (month < 8 && month % 2) ) {
				days = 31;
			}else {
				if (month == 2) {
					days = isBigYear ? 29 : 28;
				}else {
					days = 30;
				}
			}

			var tempDate = new Date(year, month - 1, 1);
			var w1 = tempDate.getDay();
			var ul = document.createElement('ul');
			ul.id = 'calendar-week-table';
			for (var i = 0; i < days + w1; i ++) {
				var li = document.createElement('li');
				var index = i - w1 + 1;
				li.innerHTML = index >=1 ? index : '';
				li.className = index >= 1 ? 'item' : '';
				li.style.webkitAnimationDelay = Math.round(Math.random() * 5) / 20 + 's';
				if (date.year == defaultDate.year && date.month == defaultDate.month && index == defaultDate.day) {
					li.classList.add('on');
				}
				ul.appendChild(li);
			}
			return ul;
		},
		_btnComponent: function() {
			var div = document.createElement('div');
			div.id = 'btnBox';
			div.innerHTML = '<button class=\"submit-btn\" data-handle=\"sure\">就是这一天啦</button><button class=\"submit-btn\" data-handle=\"cancel\">关掉这个日历</button>';
			return div;
		}
	}

	// bind event to calendar
	var handler = {
		calendar: null,
		date: defaultDate,
		_create: function() {
			var me = this;
			me.calendar = create._init();
			me.calendar.addEventListener('click', me._bind, false);
			// me.calendar.addEventListener('input', me._bind, false);
			document.addEventListener('keyup', me._bind, false);
		},
		_bind: function(e) {
			var dom  = e.target;
			switch(e.type) {
				case 'click':
					handler._clickHandler(dom);
					break;
				// case 'input':
				// 	handler._changeHandler(dom);
				// 	break;
				case 'keyup':
					handler._keyUpHandler(e);
					break;
			}
		},
		_keyUpHandler: function(e) {
			e.keyCode == 27 && handler._off();
		},
		_clickHandler: function(dom) {
			if (dom.classList.contains('handler-btn')) {
				var type = dom.getAttribute('data-handle');
				var input = dom.parentNode.getElementsByTagName('input')[0];
				var id  = input.id;
				var val = parseInt(input.value);
				if (/year/.test(id)) {
					input.value = val + (type == 'minus' ? -1 : 1);
					handler.date.year = input.value;
				}else {
					if (type == 'minus') {
						input.value = val == 1 ? 12 : val - 1;
					}else {
						input.value = val == 12 ? 1 : val + 1;
					}
					handler.date.month = input.value;
				}
				// repaint the week table
				var weekTable = document.getElementById('calendar-week-table');
				weekTable.innerHTML = '';
				var weekDays = create._renderDays(handler.date);
				weekTable.appendChild(weekDays);
			}else if (dom.classList.contains('item')) {
				var day = dom.innerHTML;
				dom.parentNode.getElementsByTagName('li')._removeClass('on');
				dom.classList.add('on');
				handler.date.day = day;
			}else if (dom.classList.contains('submit-btn')) {
				// 关闭日历的唯一入口
				var type = dom.getAttribute('data-handle');
				if (type == 'sure') {
					oInput.value = _objToStr(handler.date);
				}else {
					oInput.value = _objToStr(defaultDateCopy);
				}
				handler._off();
			}
		},
		_changeHandler: function(dom) {
			console.log(dom.value,dom.id);
		},
		_off: function() {
			var me = this;
			me.calendar.remove();
			document.removeEventListener('keyup', me._bind, false);
		}
	}
	handler._create();

	// some assistant methods
	function _strToObj(str) {
		var arr = str.split('-');
		return {year: arr[0], month: parseInt(arr[1]), day: parseInt(arr[2])};
	}
	function _objToStr(obj) {
		var year  = obj.year,
			month = obj.month,
			day   = obj.day;
		return year + '-' + (month > 9 ? month : '0' + month) + '-' + (day > 9 ? day : '0' + day);
	}
	function _dateToStr(date) {
		var year  = date.getFullYear(),
			month = date.getMonth() + 1,
			day   = date.getDate();
		return year + '-' + (month > 9 ? month : '0' + month) + '-' + (day > 9 ? day : '0' + day);
	}
}


if (typeof define == 'function' && define.amd) {
	define(function() {
		return calendar;
	})
}else {
	window.calendar = calendar;
}

})()
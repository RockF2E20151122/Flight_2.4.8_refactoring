/**
 * @author wliao廖伟 <wliao@ctrip.com>
 * @requires underscore
 * @class Calendar
 * @description 日历插件
 * @example
  var calender = new Calendar({
    monthsNum: 5,
    header: {
      title: '选择日期',
      tel: '4000086666',
      home: true,
      homeHandler: function() {
        
      }
    },
    endTime: new Date(2014, 6, 10),
    callback: function(date, dateStyle, target) {
      this.$el.find('.cui_cld_daycrt').removeClass('cui_cld_daycrt');
      target.addClass('cui_cld_daycrt');
      this.hide();
    },
    onShow: function() {
    },
    onHide: function() {
      //销毁日历组件
      this.remove();
    }
  });
  calender.show();
 */
define([
  'cUtility'
], function(util) { 'use strict';
  /**
   * @name isLeap
   *
   * @description Check a year is leap. 
   * @param {string} year 
   * @returns {num}
   */
  function isLeapYear(year) {
    if (year % 100 === 0) {
      if (year % 400 === 0) {
        return true;
      }
    } else if (year % 4 === 0) {
      return true;
    }
    return false;
  }

  /**
   * @name getDaysInMonth
   *
   * @description get 
   * @param {string} year
   * @param {string} month
   * @returns {string} 
   */
  function getDaysInMonth(year, month) {
    return [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
  }

  /**
   * @name  extend
   *
   * @description Inherit method, Borrow from Bckbone.js
   * @param {Object} 扩展原型属性
   * @param {Object} 扩展静态方法
   * @returns {Function} 子类
   */
  function extend(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }

    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    var Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Set a convenience property in case the parent's prototype is needed
    child.__super__ = parent.prototype;

    return child;
  }

  //Keep date format method reference
  var dateFormat = util.Date.format;
  var serverDate = util.getServerDate();
  var serverDateZero = (function() {
    var date = new Date(serverDate);
    date.setHours(0, 0, 0, 0);
    return date;
  })();

  /**
   * @name noop 
   *
   * @description None operation
   */
  function noop() {}
  //日历默认参数
  var defaults = {
    cls: 'cui-calendar',        //组件根类
    monthsNum: 1,               //月数
    animateSwitch: 'right',      //right, left, top, bottom
    format: 'Y-m-d',            //日期返回格式,在callback中的dateStyle.value中获取
    days: 'min',                //可选值'min', 'short', '',显示'日'或者'星期天','周日'
    monthFormate: 'Y年n月',     //月份显示格式
    //根元素选择器
    appendElement: 'body',      //日历的根元素插入哪里
    startTime: serverDateZero,  //开始时间，默认为服务器时间
    todayCls: 'cui_cld_today',  //今天，后天，明天类
    endTime: Number.MAX_VALUE,  //结束时间，默认为无限大
    header: {                   //日期头部
      title: '',
      tel: false,
      home: false,
      homeHandler: noop
    },
    headerTemplate: 
      '<header>' +
        '<h1><%= title %></h1>' + 
        '<i id="js_return" class="returnico lefthead"></i>' +
        '<% if(home) { %> <i class="icon_home i_bef" id="c-ui-header-home"></i> <% } %>' +
        '<% if(tel) { %><a href="tel:<%= tel %>" class="icon_phone i_bef __hreftel__" id="c-ui-header-tel"></a><% } %>' +
      '</header>',
    bodyPrefixTemplate:
      '<article class="cont_wrap"><div class="cui_cldwrap">',
    daysTemplate: 
      '<ul class="cui_cldweek">' +
        '<% _.each(days, function(day) { %>' +
        '<li><%= day %>' +
        '<% }); %>' +
      '</ul>',
    monthTemplate:
      '<section class="cui_cldunit">' +
        '<h1 class="cui_cldmonth"><%= monthFormate %></h1>' + 
        '<ul class="cui_cld_daybox">' +
          '<% _.each(month, function(day) { %>' +
          '<li data-date="<%= day.format %>" class="<% if (day.invalid) { print("cui_cld_invalid cui_cld_daypass"); } else { print("cui_cld_valid"); } if(day.desc) { print(" cui_cld_day_havetxt"); } if (day.cls) { print(" " + day.cls); } %>">' +
            '<em><%= day.value %></em>' +
            '<% if (day.desc) { %>' +
            '<i><%= day.desc %></i>' +
            '<% } %>' +
          '<% }); %>' +
        '</ul>' +
      '</section>',
    bodySuffixTemplate: '</div></article>',
    callback: noop,            //日期被点后的回调函数        
    onShow: noop,              //日期展示后的回调函数
    onHide: noop,              //日期隐藏后的回调函数
    constant: {
      days: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
      daysShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
      daysMin:  ['日', '一', '二', '三', '四', '五', '六'],
      months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
      monthsShort: ['01月', '02月', '03月', '04月', '05月', '06月', '07月', '08月', '09月', '10月', '11月', '12月']
    }
  };

  var Calendar = function(options) {
    options = options || {};
    this.options = $.extend(true, {}, defaults, options);
    this.$el = $('<div>').addClass(this.options.cls);
    this.initialize.apply(this, arguments);
    this.render();
  };

  Calendar.prototype = {
    constructor: Calendar,
    initialize: noop,
    hasPushState: history && history.pushState,
    show: function() {
      var options = this.options;
      var $el = this.$el;
      var prepareCss = this.animateHandler();
      var self = this;

      if (this._isShow) {
        return;
      }
      //增加浏览器回退功能
      if (this.hasPushState && this.options.header) {
        history.pushState({}, document.title, location.href);
        $(window).one('popstate', function() {
          self.hide(true);
        });
      }

      if (options.animateSwitch) {
        $el.css({
              '-webkit-transform': prepareCss,
              transform: prepareCss
        })
          .show()
          .animate({
            '-webkit-transform': 'translate(0, 0)',
            transform: 'translate(0, 0)'
          }, 500, 'ease-in-out', function() {
            $el.css({
              '-webkit-transform': '',
              transform: ''
            });
          });
      } else {
        $el.show();
      }
      this._isShow = true;
      options.onShow.call(this);
      return this;
    },
    hide: function(historyBack) {
      var self = this;
      var options = this.options;
      var $el = this.$el;
      var prepareCss = this.animateHandler();
      //浏览器回退消失
      if (this._isShow && !historyBack && this.hasPushState && this.options.header) {
        history.back();
      }

      if (options.animateSwitch) {
        $el.animate({
          '-webkit-transform': prepareCss,
          transform: prepareCss
        }, 500, 'ease-in-out', function() {
          $el.hide();
        });
      } else {
        $el.hide();
      }
      options.onHide.call(self);
      this._isShow = false;
      return this;
    },
    //销毁日历组件
    remove: function() {
      var $el = this.$el;
      if (this.options.animateSwitch) {
        setTimeout(function() {
          $el.remove();
        }, 501);
      } else {
        $el.remove();
      }
    },
    //处理动画方向
    animateHandler: function() {
      var animateSwitch = this.options.animateSwitch;
      var prepareCss;
      if (animateSwitch) {
        switch (animateSwitch) {
          case 'top':
            prepareCss = 'translate(0, 100%)';
            break;
          case 'bottom':
            prepareCss = 'translate(0, -100%)';
            break;
          case 'left':
            prepareCss = 'translate(-100%, 0)';
            break;
          case 'right':
            prepareCss = 'translate(100%, 0)';
            break;
          default:
            prepareCss = 'translate(100%, 0)';
        }
      }
      return prepareCss;
    },
    setOptions: function(key, value) {
      if (_.isObject(key)) {
        _.each(key, function(itemValue, itemKey) {
          this.options[itemKey] = itemValue;
        }, this);
      } else {
        this.options[key] = value;
      }
      return this;
    },
    isValid: function(time) {
      var startTime = this.options.startTime.getTime();
      var endTime;
      time = time.getTime();
      if (_.isDate(this.options.endTime)) {
        endTime = this.options.endTime.getTime();
      } else {
        endTime = this.options.endTime;
      }

      return time - startTime >= 0 && endTime - time >= 0;
    },
    bindEvents: function() {
      var self = this;
      var header = this.options.header;
      this.$el.on('click', '.cui_cld_valid', function() {
        var target = $(this);
        var dateArr = target.attr('data-date').split('-');
        var date = new Date(dateArr[0], parseInt(dateArr[1], 10) - 1, dateArr[2]);
        var getDay = date.getDay();
        var getMonth = date.getMonth();
        var datesTxt = self.options.constant;
        var dateStyle = {
          days: datesTxt.days[getDay],
          daysShort: datesTxt.daysShort[getDay],
          daysMin: datesTxt.daysMin[getDay],
          months: datesTxt.months[getMonth],
          monthsShort: datesTxt.monthsShort[getMonth],
          value: dateFormat(date, self.options.format),
          holiday: self.getDateDesc(date).desc
        };

        //选中日期，样式，被点击的目标
        self.options.callback.call(self, date, dateStyle, target);
      });

      if (header) {
        this.$el.on('click', '#js_return', function() {
          self.hide();
        });

        if (header.home) {
          this.$el.on('click', '#c-ui-header-home', function() {
            header.homeHandler.call(self);
          });
        }
      }
    },
    render: function() {
      var options = this.options;
      var html = [];
      var year = options.startTime.getFullYear();
      var month = options.startTime.getMonth();

      html.push(this.createHeader());
      html.push(options.bodyPrefixTemplate);
      html.push(this.createDays());
      for (var i = 0; i < options.monthsNum; i++) {
        //月份超过12月，换下一年
        if (month + 1 > 12) {
          month = 0;
          year++;
        }
        html.push(this.createMonth(year, month++));
      }
      html.push(options.bodySuffixTemplate);
      this.$el
          .css('display', 'none')
          .html(html.join(''))
          .appendTo($(options.appendElement));
      if (options.appendElement === 'body') {
        this.$el.css({
          position: 'absolute',
          zIndex: 3001,
          top: 0,
          right: 0,
          left: 0
        });
      } else {
        this.$el.addClass('cui-calendar-static');
      }
      this.bindEvents();
    },
    //创建头部
    createHeader: function() {
      var header = this.options.header;
      if (!header) {
        return '';
      }

      return _.template(this.options.headerTemplate, header);
    },
    //创建周的描述
    createDays: function() {
      var daysStyle = this.options.days;
      var datesTxt = this.options.constant;
      var data;
      
      if (daysStyle === 'short') {
        data = datesTxt.daysShort;
      } else if (daysStyle === 'min') {
        data = datesTxt.daysMin;
      } else {
        data = datesTxt.days;
      }

      return _.template(this.options.daysTemplate, {days: data});
    },
    /**
     * @description 创建月历
     * @param {string} 年份
     * @param {string} 月份，月份是从0开始计算的
     * @returns {string} 月历html代码
     */
    createMonth: function(year, month) {
      var firstDayDate = new Date(year, month);
      var firstDay = firstDayDate.getDay();
      var ret = {
        monthFormate: dateFormat(firstDayDate, this.options.monthFormate),
        month: []
      };
      var monthModel = this.generateMonthModel(year, month);

      //每月第一天前面的暂位标签
      for (var i = 0; i < firstDay; i++) {
        ret.month.push({ invalid: true, value: '' });
      }
      
      ret.month = ret.month.concat(monthModel);
      return _.template(this.options.monthTemplate, ret); 
    },
    //转换月历模型
    generateMonthModel: function(year, month) {
      var days = getDaysInMonth(year, month);
      var monthModel = [];
      var temporaryTime, temporaryDay;

      for (var j = 1; j <= days; j++) {
        temporaryTime = new Date(year, month, j);
        temporaryDay = { invalid: true, value: j };
        _.extend(temporaryDay, this.getDateDesc(temporaryTime));
        if (this.isValid(temporaryTime)) {
          temporaryDay.invalid = false;
          temporaryDay.format = dateFormat(temporaryTime, 'Y-m-d');
        }
        monthModel.push(temporaryDay);
      }

      return monthModel;
    },
    //判断当前日期的文本描述
    getDateDesc: function(date) {
      var oneDay = 86400000; //oneday = 1000 * 60 * 60 * 24;
      var txt = '';
      var todayCls = '';
      var dateTime = date.getTime();
      var serverDateTime = serverDateZero.getTime();

      //今天，明天，后天逻辑
      if (dateTime === serverDateTime) {
        txt = '今天';
        todayCls = this.options.todayCls;
      } else if(dateTime - serverDateTime === oneDay) {
        txt = '明天';
        todayCls = this.options.todayCls;
      } else if (dateTime - serverDateTime === 2 * oneDay) {
        txt = '后天';
        todayCls = this.options.todayCls;
      }

      return {
        cls: todayCls,
        desc: txt
      };
    }
  };

  //Extend static method
  _.extend(Calendar, {
    isLeapYear: isLeapYear,
    getDaysInMonth: getDaysInMonth,
    extend: extend,
    dateFormat: dateFormat,
    defaults: defaults,
    serverDate: serverDate
  });

  /* Css hack */
/*  (function() {
    var css = '.cui-calendar-static .cui_cldweek { position: static; border-top: 1px solid #c8c8c8; } .cui-calendar-static .cont_wrap { margin: 0; } .cui-calendar-static .cui_cldwrap { padding-top: 0; }';
    $('<style>').html(css).appendTo(document.head);
  })()*/
  return Calendar;
});
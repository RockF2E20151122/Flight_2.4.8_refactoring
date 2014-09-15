/**
 * @fileoverview 中国节日日历
 * @author wliao廖伟 <wliao@ctrip.com>
 */
define([
  'cCalendar'
], function(Calendar) { 'use strict';
  var CHINESE_LUNAR_INFO = [
    0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
          0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
          0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
          0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
          0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
          0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
          0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
          0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,
          0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
          0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
          0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
          0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
          0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
          0x05aa0, 0x076a3, 0x096d0, 0x04bd7, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
          0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
          0x14b63
  ];

  //传回农历 y年闰哪个月 1-12 , 没闰传回 0
  function leapMonth(year) {
    return CHINESE_LUNAR_INFO[year - 1900] & 0xf;
  }

  //传回农历 y年m月的总天数
  function monthDays(year, month) {
    return (CHINESE_LUNAR_INFO[year - 1900] & (0x10000 >> month)) ? 30 : 29;
  }

  function leapDays(year) {
    if (leapMonth(year)) {
      return (CHINESE_LUNAR_INFO[year - 1900] & 0x10000) ? 30 : 29;
    } else {
      return 0;
    }
  }

  //传回农历 y年的总天数
  function lYearDays(year) {
    var sum = 348;
    for (var i = 0x8000; i > 0x8; i >>= 1) {
      sum += (CHINESE_LUNAR_INFO[year - 1900] & i) ? 1 : 0;
    }
    return sum + leapDays(year);
  }

  //算出农历, 传入日期对象, 传回农历日期对象
  //该对象属性有 .year .month .day .isLeap .yearCyl .dayCyl .monCyl
  function toLunar(dateObj) {
     var i,
      leap = 0,
      temp = 0,
      lunarObj = {};
      var baseDate = new Date(1900, 0, 31);
      var offset = (dateObj - baseDate) / 86400000;
      lunarObj.dayCyl = offset + 40;
      lunarObj.monCyl = 14;
      for (i = 1900; i < 2050 && offset > 0; i++) {
        temp = lYearDays(i);
        offset -= temp;
        lunarObj.monCyl += 12;
      }
      if (offset < 0) {
        offset += temp;
        i--;
        lunarObj.monCyl -= 12;
      }

      lunarObj.year = i;
      lunarObj.yearCyl = i - 1864;
      leap = leapMonth(i);
      lunarObj.isLeap = false;
      for (i = 1; i < 13 && offset > 0; i++) {
        if (leap > 0 && i === (leap + 1) && lunarObj.isLeap === false) {
          --i;
          lunarObj.isLeap = true;
          temp = leapDays(lunarObj.year);
        } else {
          temp = monthDays(lunarObj.year, i);
        }
        if (lunarObj.isLeap === true && i === (leap + 1)) {
          lunarObj.isLeap = false;
        }
        offset -= temp;
        if (lunarObj.isLeap === false) {
          lunarObj.monCyl++;
        }
      }

      if (offset === 0 && leap > 0 && i === leap + 1) {
        if (lunarObj.isLeap) {
          lunarObj.isLeap = false;
        } else {
          lunarObj.isLeap = true;
          --i;
          --lunarObj.monCyl;
        }
      }

      if (offset < 0) {
        offset += temp;
        --i;
        --lunarObj.monCyl;
      }
      lunarObj.month = i;
      lunarObj.day = offset + 1;
      return lunarObj;
  }

  /**
   * @name HolidayCalendar.defaults
   * @description 节日日历参数, 扩展于Calendar.defaults
   */
  var defaults = _.defaults({
    holidayCls: 'cui_cld_holiday',            //节日的类
    solarHoliday: {                           //阳历节日
      '0101': '元旦',
      '0214': '情人节',
      '0405': '清明',
      '0501': '劳动节',
      '1001': '国庆',
      '1225': '圣诞节'
    },
    lunarHoliday: {                           //阴历节日,不需要请设置为false
      '1230': '除夕',
      '0101': '春节',
      '0115': '元宵',
      '0505': '端午',
      '0707': '七夕',
      '0815': '中秋',
      '0909': '重阳'
    },
    _lunarHoliday: {

    }
  }, Calendar.defaults);

  /**
   * @constructor HolidayCalendar
   * @extends Calendar
   * @example
      var calender = new HolidayCalendar({
        monthsNum: 5,
        title: '选择日期',
        endTime: new Date(2014, 6, 10),
        callback: function(date, dateStyle, currentTarget) {
          this.hide();
        },
        onShow: function() {
        },
        onHide: function() {
        }
      });
      calender.show();
   */
  var HolidayCalendar = Calendar.extend({
    initialize: function(options) {
      this.options = $.extend(true, {}, defaults, options);
    },
    // 重写当前日期的文本描述
    getDateDesc: function(date) {
      //调用父元素的文本描述
      var dateDesc = HolidayCalendar.__super__.getDateDesc.apply(this, arguments);
      var holidayKey = this.generateHolidayKey(date.getMonth() + 1, date.getDate());
      var options = this.options;
      var lunarKey, lunarObj, _lunarKey;

      //节日判断
      if (options.solarHoliday[holidayKey]) {
        dateDesc.desc = options.solarHoliday[holidayKey];
        dateDesc.cls = options.holidayCls;
      } else {
        lunarObj = toLunar(date);
        lunarKey = this.generateHolidayKey(lunarObj.month, lunarObj.day);
        _lunarKey = date.getFullYear() + lunarKey;

        //农历节日判断, 农历节日过前不过后
        if (options.lunarHoliday[lunarKey]) {
          if (
              options._lunarHoliday[_lunarKey] &&
              options._lunarHoliday[_lunarKey] === holidayKey
            ) {
            dateDesc.desc = options.lunarHoliday[lunarKey];
            dateDesc.cls = options.holidayCls;
          } else if (!options._lunarHoliday[_lunarKey]) {
            dateDesc.desc = options.lunarHoliday[lunarKey];
            dateDesc.cls = options.holidayCls;
            options._lunarHoliday[_lunarKey] = holidayKey;
          }
        }
      }
      
      return dateDesc;
    },
    generateHolidayKey: function(month, day) {
      if (month < 10) {
        month = '0' + month;
      }
      if (day < 10) {
        day = '0' + day;
      }

      return '' + month + day;
    }
  }, {
    defaults: defaults
  });

  return HolidayCalendar;
});
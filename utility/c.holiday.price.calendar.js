/**
* @author wliao廖伟 <wliao@ctrip.com>
* @requires HolidayCalendar
* @class HolidayPriceCalendar
* @description 中国节日价格日历,参数会继承于中国节日插件
* @example
var calender = new HolidayPriceCalendar({
rootElement: '.calendar-wrap',
monthsNum: 5,
animatSwitch: 'top',
startPriceTime: null,
priceDate: [
{ date: new Date('2014/5/1 0:00:00'), price: 25 },
{ date: new Date('2014/5/2 0:00:00'), price: 30 },
{ date: new Date('2014/5/3 0:00:00'), price: 35 },
{ date: new Date('2014/5/4 0:00:00'), price: 36 },
{ date: new Date('2014/5/5 0:00:00'), price: 37 },
{ date: new Date('2014/6/1 0:00:00'), price: 30 },
{ date: new Date('2014/6/2 0:00:00'), price: 30 },
],
callback: function(date) {
      
},
onShow: function() {
this.findMinPrice();
}
});
calender.show();
*/
define(['cHolidayCalendar'], function (HolidayCalendar) {
  'use strict';
  //节日价格日历默认参数,扩展于节日参数
  var defaults = _.defaults({
    unit: '¥', //价格单位
    lowestCls: 'price_lowest', //当月最低价格类
    monthTemplate:
      '<section class="cui_cldunit">' +
        '<h1 class="cui_cldmonth"><%= monthFormate %></h1>' +
        '<ul class="cui_cld_daybox">' +
          '<% _.each(month, function(day) { %>' +
          '<li <% if (day.price) { %> data-price="<%= day.price %>" <% } %> data-date="<%= day.format %>" class="<% if (day.invalid) { print("cui_cld_invalid cui_cld_daypass"); } else { print("cui_cld_valid"); } if(day.desc) { print(" cui_cld_day_havetxt"); } if (day.cls) { print(" " + day.cls); } %>">' +
            '<em><%= day.value %></em>' +
            '<% if (day.desc) { %>' +
            '<i><%= day.desc %></i>' +
            '<% } %>' +
          '<% }); %>' +
        '</ul>' +
      '</section>',
    priceDate: [], //价格日期
    startPriceTime: false, //价格开始时间
    voidInvalid: true //没有价格的日期是否有效可点
  }, HolidayCalendar.defaults);

  var HolidayPriceCalendar = HolidayCalendar.extend({
    initialize: function (options) {
      this.options = $.extend(true, {}, defaults, options);
      this.setPriceDate(this.options.priceDate);
    },
    generateMonthModel: function(year, month) {
      var days = HolidayCalendar.getDaysInMonth(year, month);
      var monthModel = [];
      var options = this.options;
      var tempDate, tempDay, tempTime, tempDesc, tempPrice;

      for (var j = 1; j <= days; j++) {
        tempDate = new Date(year, month, j);
        tempTime = tempDate.getTime();
        tempDay = this.getDateDesc(tempDate);
        tempPrice = options.priceDate[tempTime];

        //如果存在价格
        if (typeof tempPrice !== 'undefined') {
          if (tempDay.desc) {
            tempDay.value = tempDay.desc;
          } else {
            tempDay.value = j;
          }
          //价格不为0
          if (tempPrice != 0) {
            tempDay.desc = options.unit + tempPrice;
          } else {
            tempDay.desc = '';
          }

          tempDay.price = tempPrice;
        } else {
          tempDay.invalid = options.voidInvalid;
          tempDay.value = j;
        }

        if (!this.isPriceValidTime(tempDate)) {
          tempDay.invalid = true;
        }

        tempDay.format = HolidayCalendar.dateFormat(tempTime, 'Y-m-d');
        monthModel.push(tempDay);
      }

      return monthModel;
    },
    isPriceValidTime: function (date) {
      var startPriceTime = this.options.startPriceTime;
      if (startPriceTime) {
        return date.getTime() - startPriceTime.getTime() >= 0;
      } else {
        return this.isValid(date);
      }
    },
    findMinPrice: function () {
      var months = this.$el.find('.cui_cld_daybox');
      var lowestCls = this.options.lowestCls;
      months.each(function () {
        var days = $(this).find('[data-price]');
        var prices = [];
        var min;
        days.each(function () {
          prices.push(parseInt(this.getAttribute('data-price'),
            10));
        });
        min = Math.min.apply(null, prices);
        days.each(function () {
          var item = $(this);
          var price = parseInt(item.attr('data-price'), 10);
          if (price === min) {
            item.addClass(lowestCls);
          }
        });
      });
    },
    //处理priceDate参数
    setPriceDate: function(value) {
      var ret = {};

      _.each(value, function(item) {
        ret[item.date.getTime()] = item.price;
      });

      this.options.priceDate = ret;
    }
  });
  return HolidayPriceCalendar;
});
define(['cSales','libs', 'c', 'CommonStore', 'FlightStore', 'FlightModel', 'cBasePageView', buildViewTemplatesPath('flightordermodify.html'), 'cUtility', 'cHolidayCalendar', 'cWidgetFactory', 'cWidgetGuider', 'cWidgetCalendar'],
 function (cSales, libs, c, CommonStore, FlightStore, FlightModel, BasePageView, html, cUtility, HolidayCalendar, WidgetFactory) {
     var cui = c.ui,
      cbase = c.base,
      salesStore = CommonStore.SalesObjectStore.getInstance(),
      orderParamStore = FlightStore.FlightOrderParamStore.getInstance(), //用户的订单参数信息     
      flightTicketRefundChangeModel = FlightModel.FlightTicketRefundChangeModel.getInstance(),
      flightTicketRefundChangeStore = FlightStore.FlightTicketRefundChangeStore.getInstance(),
      flightTicketChangeForm = FlightStore.FlightTicketChangeForm.getInstance(),
      flightTicketChangeModel = FlightModel.FlightTicketChangeModel.getInstance();
     //用户信息
     var userStore = CommonStore.UserStore.getInstance(), userInfo = userStore.getUser();
     var default_data = {};
     var Calendar = WidgetFactory.create('Calendar');


     var View = BasePageView.extend({
         pageid: '214396',
         tpl: html,
         calendar: null,
         viewData: {},
         passengerList: {},
         changeTime: {},
         getAppUrl: function () {
             var self = this;
             var appUrl = "";
             if (userStore && userStore.getUser()) {

                 var sourceid = "";
                 if (window.localStorage && window.localStorage.getItem('SALES') != null && window.localStorage.getItem('SALES') != "") {
                     var SALES = JSON.parse(window.localStorage.getItem('SALES'));
                     if (SALES["data"] != null) {
                         sourceid = SALES["data"]["sourceid"];
                     }
                 }
                 var oid = orderParamStore.get().Id;
                 appUrl = "/flight_inland_change?c1=" + oid +
                  "&UserID=" + userStore.getUser().LoginName +
                  "&extendSourceID=" + sourceid;
             }
             return appUrl;
         },
         formData: {
             extens: "0",
             flag: 0, //"是否国内机票改签 0：是（国内）1：否（国际）"
             oid: undefined, //点单ID
             tktchgs: [], //退改签申请明细列表
             tktcontinfo: {//联系人信息
                 comment: "", //备注
                 confirm: 0, //位操作，1：白天联系
                 name: "", //联系人姓名
                 phone: ""//联系人电话
             }
         },
         hasAd: true,
         homeUrl: "/html5",
         backUrl: "flightorderdetail",
         render: function () {
             this.$el.html(this.tpl);
             this.elsBox = {
                 flightordermodify_tpl: this.$el.find('#flightordermodify_tpl'), //模板
                 flightordermodify_box: this.$el.find('#flightordermodify_box')  //容器                

             };
             this.flightordermodify_fun = _.template(this.elsBox.flightordermodify_tpl.html());

         },
         renderData: function (data) {
             var self = this;
             data.cDate = cbase.Date;
             data.ticketdaytimeshow = this.isShowDaytime();
             data.num2Chnum = num2Chnum;
             var selectp_data = flightTicketChangeForm.get();
             if (selectp_data && selectp_data.passengerList && selectp_data.changeTime) {
                 this.passengerList = selectp_data.passengerList;
                 this.changeTime = selectp_data.changeTime;
             }

             data.selectp = selectp_data;
             var flightordermodify_item = self.flightordermodify_fun(data);
             self.elsBox.flightordermodify_box.html(flightordermodify_item);
             self.autoSelectPassenger(data);


         },
         backAction: function () {

             userInfo = userStore.getUser();
             this.passengerList = {};
             this.flighticketchangermk = null;
             this.changeTime = {};
             if (userInfo && userInfo.Auth) {

                 this.back("flightorderdetail");

             } else {
                 var salesInfo = salesStore.get();

                 if (salesInfo && salesInfo.sid && +salesInfo.sid == 1896) {
                     window.location = "map://leftClick()";
                 } else {
                     this.jump(this.homeUrl);
                 }
             }


         },
         events: {
             "click .list_st_border .changeplist": "selectPassengers", //多航程选择改签信息
             "click .list_st_border .js_departDate": "departDateAction", //选择起飞日期
             "click #js_psgslist li.js_psgs": "selectPassengerList", //选择改签人
             "click .ticketdaytime": "ticketDaytime", //白天联系
             "click #ticketchangesumbit": "ticketChangeSumbit"//提交按钮
         },
         //多航程选择改签信息
         selectPassengers: function (e) {
             var index = $(e.target).attr("data-index");
             this.forward("flightordermodifyselect?pindex=" + index);
         },
         //选择改签人
         selectPassengerList: function (e) {
             var target = $(e.currentTarget);
             if (target.hasClass("checkbox_b_checked")) {
                 target.removeClass("checkbox_b_checked")
             } else {
                 target.addClass("checkbox_b_checked")
             }
             var pindex, pval;
             pindex = target.data("index");
             this.changePassengerList(0, pindex, target.hasClass("checkbox_b_checked"));

         },
         changePassengerList: function (segid, pindex, flag) {
             var data = flightTicketRefundChangeStore.get();
             var pval = data.segs[segid].psgs[pindex];
             if (flag) {
                 this.passengerList[segid] = this.passengerList[segid] || {};

                 this.passengerList[segid][pindex] = {
                     chgseg: {
                         segid: data.segs[segid].segid,
                         psgname: pval.name
                     }
                 }
             } else {
                 delete this.passengerList[segid][pindex];
             }
         },
         //白天联系
         ticketDaytime: function (e) {
             var target = $(e.currentTarget);
             if (target.hasClass("checkbox_bs_checked")) {
                 target.removeClass("checkbox_bs_checked")
             } else {
                 target.addClass("checkbox_bs_checked")
             }

             this.formData.tktcontinfo.confirm = target.hasClass("checkbox_bs_checked") ? this.formData.tktcontinfo.confirm | 1 : this.formData.tktcontinfo.confirm ^ 1;
         },
         //判断是否显示白天联系
         isShowDaytime: function () {
             var now = this.getServerDate();
             var h = now.getHours();
             if (h > 21 || h < 8) {
                 return true;
             } else {
                 return false;
             }
             return false;
         },
         //用户登录校验
         userInfoCheck: function (callback) {
             var self = this;
             userInfo = userStore.getUser();
             var param = orderParamStore.get();
             if (userInfo && userInfo.Auth) {
                 callback.call(self);
             } else {
                 if (!cUtility.isInApp()) {
                     self.jump("/webapp/myctrip/#account/login?from=" + encodeURIComponent(this.getRoot() + '#flightorderdetail'));
                 } else {
                     self.showWarning404(function () {
                         location.reload();
                     });
                 }
             }
         },
         //登机人自动选择
         autoSelectPassenger: function (data) {

             if (data.tktinfo.triptype === 1) {
                 var cp = 0;
                 for (var i = 0; i < data.segs[0].psgs.length; i++) {
                     if (data.segs[0].psgs[i].uiflag == 2) {
                         cp += 1;
                     }
                 }
                 if (cp == 1) {
                     var input = this.$el.find("#js_psgslist li.js_psgs").not(".flt_discheck");
                     input.trigger("click");
                 }
             } else {
                 return false;
             }
         },
         //提交的数据校验
         checkSumbitData: function () {
             var self = this, flg = false;
             var data = this.viewData;
             self.formData.tktchgs = [];
             self.formData.tktcontinfo.name = data.tktinfo.name;
             self.formData.tktcontinfo.phone = data.tktinfo.phone;
             var passengerList = self.passengerList;
             self.$el.find(".js_departDate").removeClass("cui-input-error");
             self.$el.find("#js_psgslist li").removeClass("cui-input-error");
             self.$el.find(".changeplist").removeClass("cui-input-error");

             for (var segid in passengerList) {

                 for (var pid in passengerList[segid]) {
                     flg = true;
                     if (self.changeTime[segid]) {
                         passengerList[segid][pid].chgseg.takedate = cbase.Date.format(self.changeTime[segid].takedate, 'Y/m/d 0:00:00');
                     } else {
                         self.hideLoading();

                         self.$el.find(".js_departDate").addClass("cui-input-error");
                         var msg = "请选择起飞日期";
                         self.showToast(msg);
                         return false;
                     }
                     self.formData.tktchgs.push(passengerList[segid][pid]);
                 }
             }
             if (flg) {
                 return true;
             }
             else {
                 self.hideLoading();
                 self.$el.find(".changeplist").addClass("cui-input-error");
                 self.$el.find("#js_psgslist li").not(".flt_greytit,.flt_discheck").addClass("cui-input-error");
                 var msg = "请至少选择一个登机人";
                 self.showToast(msg);
                 return false;
             }


         },
         //改签提交按钮动作
         ticketChangeSumbit: function (e) {
             this.userInfoCheck(function () {
                 var target = $(e.currentTarget);
                 var self = this, formData = this.formData;
                 self.showLoading();
                 var orderdata = flightTicketRefundChangeStore.get();
                 userInfo = userStore.getUser();
                 var param = orderParamStore.get(); //获取查询参数                               
                 if (param && param.Id) {
                     flightTicketChangeForm.setAttr("oid", param.Id);
                     if (param.url != null) {
                         self.backUrl = param.url;
                     }
                     formData.oid = ~ ~param.Id;
                     formData.tktcontinfo.comment = this.elsBox.flightordermodify_box.find("#flighticketchangermk").val();
                     if (this.checkSumbitData()) {
                         if (orderdata) {
                             if (orderdata.tktinfo.triptype == 1 && orderdata.segs.length > 1) {
                                 var tktchgs_temp = [];
                                 for (var segkey in orderdata.segs) {
                                     for (var tktchgkey in formData.tktchgs) {
                                         tktchgs_temp.push({
                                             chgseg: {
                                                 psgname: formData.tktchgs[tktchgkey].chgseg.psgname,
                                                 segid: orderdata.segs[segkey].segid,
                                                 takedate: formData.tktchgs[tktchgkey].chgseg.takedate
                                             }
                                         });
                                     }
                                 }
                                 formData.tktchgs = tktchgs_temp;
                             }
                         }

                         flightTicketChangeModel.setParam(formData);

                         flightTicketChangeModel.excute(function (data) {
                             self.hideLoading();
                             this.forward("flightticketchangesucces");
                         },
                        function (err) {
                            self.hideLoading();
                            var msg = err.msg;
                            self.showToast(msg);
                        }, true, this,
                        function () {
                            self.hideLoading();
                            self.showWarning404(function () {
                                location.reload();
                            });
                        });
                     }

                 } else {
                     //self.backAction();
                     self.hideLoading();
                     self.showWarning404(function () {
                         location.reload();
                     });
                 }
             });
         },
         onCreate: function () {
             this.injectHeaderView();
             this.render();
         },
         onShow: function () {
             this.setTitle('改签申请');
             this.headerview.show();
         },
         onLoad: function () {
             var self = this;




             //对HeaderView设置数据
             var isShowHome = true;
             var _sales = salesStore.get();
             if (_sales && _sales.sid && (+_sales.sid == 1575 || +_sales.sid == 1867)) {
                 isShowHome = false;
             }
             self.headerview.set({
                 title: '改签申请',
                 back: true,
                 view: self,
                 tel: { number: 4000086666 },
                 home: isShowHome,
                 events: {
                     homeHandler: function () {
                         var salesInfo = salesStore.get();

                         if (salesInfo && salesInfo.sid && +salesInfo.sid == 1896) {
                             window.location = "map://leftClick()";
                         } else {
                             self.jump(self.homeUrl);
                         }
                     },
                     returnHandler: function () { self.backAction(); }
                 }
             });
             // 将HeaderView显示出来
             self.headerview.show();
             userInfo = userStore.getUser();
             if (userInfo && userInfo.Auth) {

                 if (this.request.query.oid) {
                     orderParamStore.setAttr({ Id: this.request.query.oid, 'url': "flight_order_list" });
                 }

                 var param = orderParamStore.get(); //获取查询参数                
                 if (param && param.Id) {
                     flightTicketRefundChangeModel.setParam('flag', 0);
                     flightTicketRefundChangeModel.setParam('reqtype', 2);
                     flightTicketRefundChangeModel.setParam('oid', param.Id);
                     if (param.url != null) {
                         self.backUrl = param.url;
                     }
                     self.getFlightTicketRefundChangeSearch();


                 } else {
                     this.jump("/webapp/myctrip/index.html#orders/flightorderlist");
                 }
             } else {//用户未登入或登入失效返回首页
                 if (!cUtility.isInApp()) {
                     self.jump("/webapp/myctrip/#account/login?from=" + encodeURIComponent(this.getRoot() + '#flightorderdetail'));
                 } else {
                     self.showWarning404(function () {
                         location.reload();
                     });
                 }
             }
           //获取营销电话
           this.getSalesObj();
         },
        getSalesObj: function () {
         var self = this;
         var sales = self.getQuery('sales'),
             sourceid = self.getQuery('sourceid');

         var _sales = CommonStore.SalesStore.getInstance().get();
         if (_sales != null) {
           if (sourceid == null && sales == null) {
             sourceid = _sales["sourceid"];
           }
         }
         if (sales || sourceid) {
           cSales.getSalesObject(sales || sourceid, $.proxy(function (data) {
             cSales.replaceContent(self.$el);
           }, this));
         }

        },
         onHide: function () {
             flightTicketRefundChangeModel.abort();
             this.elsBox.flightordermodify_box.empty();
             this.hideLoading();
             this.hideWarning404();
             //this.headerview.hide();
         },
         //数据检测
         checkData: function (data) {
             try {
                 if (data.tktinfo && data.tktinfo.expired && data.segs) {
                     if (data.segs.length > 0) {
                         for (var seg in data.segs) {
                             data.segs[seg].canChange = false;
                             for (var psg in data.segs[seg].psgs) {
                                 if ((data.segs[seg].psgs[psg].uiflag & 2) == 2) {
                                     data.segs[seg].canChange = true;
                                 }
                             }
                         }
                         return true;
                     } else {
                         return false;
                     }
                 } else {
                     false;
                 }
             } catch (e) {
                 this.hideLoading();
                 this.showToast(e.message)
                 return false;
             }
         },
         //获取退改签查询信息
         getFlightTicketRefundChangeSearch: function () {
             var self = this;
             self.showLoading();
             flightTicketRefundChangeModel.excute(function (data) {

                 // 将HeaderView显示出来
                 self.headerview.show();

                 //数据mock
                 data = defaultData(data, default_data);
                 flightTicketRefundChangeStore.remove();
                 flightTicketRefundChangeStore.setAttr(data);
                 //数据mock end               
                 if (data != null && data.head != null && data.head.errcode == 0) {
                     //console.log(data.tktinfo.expired);

                     if (self.checkData(data)) {
                         self.hideLoading();
                         self.turning();
                         self.viewData = data;
                         self.createCalendar(new Date((data.tktinfo.expired).replace(/-/g, '/')));
                         self.renderData(data);
                     } else {
                         self.hideLoading();
                         self.showWarning404(function () {
                             location.reload();
                         }); ;
                     }
                 } else {
                     self.hideLoading();
                     self.showWarning404(function () {
                         location.reload();
                     }); ;
                 }
             }, function (err) {
                 self.hideLoading();
                 self.showWarning404(function () {
                     location.reload();
                 });
             }, true, this, function () {
                 self.hideLoading();
                 self.showWarning404(function () {
                     location.reload();
                 });
             });
         },
         createCalendar: function (validEndDate) {
             var now = this.getServerDate();
             var self = this;

             var months = cbase.Date.diffMonth(now, validEndDate);
             months = months > 0 ? months + 1 : 1;
             console.log(validEndDate);
             this.calendar = new HolidayCalendar({
                 monthsNum: months,
                 animatSwitch: 'right',
                 header: {
                     title: '日期选择'
                 },
                 endTime: validEndDate,
                 callback: function (date, dateStyle, target) {
                     self.setPanelDate.apply(self, arguments);
                     if (this._hide) { this._hide(); } else { this.hide(); };
                 },
                 onShow: function () {
                     $('#headerview header').css('z-index', 99);
                 },
                 onHide: function () {
                     self.$el.show();
                     $('#headerview header').css('z-index', 9999);
                 }
             });

             /*
             var months = cbase.Date.diffMonth(now, validEndDate);
             months = months > 0 ? months + 1 : 1;

             this.calendar = new Calendar({
             date: {
             start: {
             headtitle: '改签日期',
             title: function (date, sformat) {
             var str = '<em>' + sformat(date) + '</em>';
             return str;
             },
             value: now
             }
             },
             animatSwitch: true,
             Months: months,
             validEndDate: validEndDate,
             title: '日期选择',
             callback: function (date, datename, dates, d, end) {

             self.setPanelDate.apply(self, arguments);

             if (this._hide) { this._hide(); } else { this.hide(); };
             },
             onShow: function () {
             //self.$el.hide();
             //self.setCalendarUbt();
             $('#headerview header').css('z-index', 99);
             },
             onHide: function () {
             self.$el.show();
             $('#headerview header').css('z-index', 9999);
             //self.recoverIndexUbt();
             }
             });
             this.calendar.create();
             */
         },
         //选择起飞时间
         departDateAction: function () {
             //            this.calendar.setCurDate('start');
             //            this.calendar.update({
             //                validStartDate: this.getServerDate()
             //            });
             this.flighticketchangermk = this.$el.find("#flighticketchangermk").val();
             this.calendar.show();
         },
         //选择起飞时间响应
         setPanelDate: function (date, datename, dates, d, end) {
             var datap = this.elsBox.flightordermodify_box.find(".js_departDate .flt_rlink");
             datap.addClass("flt_rshow");
             datap.html(cbase.Date.format(date, 'Y-m-d'));
             this.addDateTime(0, date)

         },
         addDateTime: function (segid, date) {
             this.changeTime[segid] = this.changeTime[segid] || {};
             this.changeTime[segid].takedate = cbase.Date.format(date, 'Y/m/d 0:00:00');
         }

     });

     var defaultData = function (data, default_data) {

         for (var key in data) {
             if (typeof (data[key]) == "undefined" || data[key] == null) {
                 data[key] = default_data[key];
             } else if (typeof (data[key]) == "object") {
                 default_data[key] = default_data[key] || {};
                 defaultData(data[key], default_data[key])
             }
         }
         /*if (data.segs && data.segs.length > 1 && data.tktinfo && data.tktinfo.triptype == 1) {
         data.tktinfo.triptype = 4;
         }*/

         return data;
     }
     //阿拉伯数字转行成中文数字 数字不能超过5位数 （2 -> 二）
     var num2Chnum = function (n) {
         var s_n = n + "";
         var s_n_a = s_n.split("");
         var chnum_s = "";
         var units = ["", "十", "百", "千", "万"];
         var chnum = ["o", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
         var slen = s_n_a.length;
         for (i = 1; i <= slen; i++) {
             if (~ ~s_n_a[slen - i] == 0) {
                 chnum_s = chnum[~ ~s_n_a[slen - i]] + chnum_s;
             } else {
                 chnum_s = chnum[~ ~s_n_a[slen - i]] + units[i - 1] + chnum_s;
             }
         }
         chnum_s = chnum_s.replace(/(.)\1+/, "$1");
         chnum_s = chnum_s.replace(/o$/, "");
         if (chnum_s == '一十') {
             chnum_s = '十';
         }
         return chnum_s.replace("o", "零");
     }

     return View;
 });

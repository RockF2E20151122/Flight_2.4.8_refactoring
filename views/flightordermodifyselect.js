define(['libs', 'c', 'CommonStore', 'FlightStore', 'FlightModel', 'cBasePageView', buildViewTemplatesPath('flightordermodifyselect.html'), 'cUtility', 'cHolidayCalendar','cWidgetFactory', 'cWidgetGuider', 'cWidgetCalendar'], function (libs, c, CommonStore, FlightStore, FlightModel, BasePageView, html, cUtility, HolidayCalendar,WidgetFactory) {
    var cui = c.ui, cbase = c.base, salesStore = CommonStore.SalesObjectStore.getInstance(),
      orderParamStore = FlightStore.FlightOrderParamStore.getInstance(); //用户的订单参数信息           
    //用户信息
    var userStore = CommonStore.UserStore.getInstance(), userInfo = userStore.getUser();
    var flightTicketRefundChangeStore = FlightStore.FlightTicketRefundChangeStore.getInstance();
    var flightTicketChangeForm = FlightStore.FlightTicketChangeForm.getInstance();
    var default_data = {};
    var Calendar = WidgetFactory.create('Calendar');
    var View = BasePageView.extend({
        pageid: '214397',
        tpl: html,
        homeUrl: "/html5",
        calendar: null,
        passengerList: {},
        changeTime: {},
        formData: {},
        render: function () {
            this.$el.html(this.tpl);
            this.elsBox = {
                flightordermodify_tpl: this.$el.find('#flightordermodifyselect_tpl'), //模板
                flightordermodify_box: this.$el.find('#flightordermodifyselect_box')  //容器                

            };
            this.flightordermodify_fun = _.template(this.elsBox.flightordermodify_tpl.html());

        },
        renderData: function (data) {
            var self = this;
            var segid = ~ ~this.request.query.pindex;
            data.cDate = cbase.Date;
            data.num2Chnum = num2Chnum;
            //为了修正日期控件选择自动调用load
            /*if (self.passengerList[segid]) {
                data.selectp.passengerList = data.selectp.passengerList || {};
                data.selectp.passengerList[segid] = data.selectp.passengerList[segid] || {};
                data.selectp.passengerList[segid] = self.passengerList[segid];
            }*/
            //----------------

            var flightordermodify_item = self.flightordermodify_fun(data);
            self.elsBox.flightordermodify_box.html(flightordermodify_item);


            self.autoSelectPassenger(data); //修正日历bug后可以放开此处注释

            //为了修正日期控件选择自动调用load
            /*if (self.changeTime[segid] && self.changeTime[segid].takedate) {
                var datap = self.elsBox.flightordermodify_box.find("#js_departDate .flt_rlink");
                datap.addClass("flt_rshow");
                datap.html(cbase.Date.format(self.changeTime[segid].takedate, 'Y-m-d'));
            }
            if (self.passengerList[segid]) {
                for (var psindex in self.passengerList[segid]) {
                    var input = self.$el.find("#flightordermodifyselect_box li").not(".flt_greytit").eq(psindex);
                    input = input.find("input");
                    if (input.attr("checked") == false) {
                        input.trigger("click");
                    }
                }
            } else {
                self.autoSelectPassenger(data);
            }*/
            //--------------------------------

        },
        autoSelectPassenger: function (data) {

            var cp = 0;
            for (var i = 0; i < data.psgs.length; i++) {
                if (data.psgs[i].uiflag == 2) {
                    cp += 1;
                }
            }
            if (cp == 1) {
                var input = this.$el.find("ul.list_psgs li.js_psgs").not(".flt_discheck");
                input.trigger("click");
            }

        },
        backAction: function () {

            userInfo = userStore.getUser();
            this.passengerList = {};
            this.changeTime = {};
            if (userInfo && userInfo.Auth) {

                this.back("flightordermodify");

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
            "click .list_st_border #js_departDate": "departDateAction",
            "click #flightordermodifyselect_submit": "flightordermodifyselectSubmit",
            "click ul.list_psgs li.js_psgs": "selectPassengerList"
        },
        //选择改签人        
        selectPassengerList: function (e) {
            var target = $(e.currentTarget)
			
			if(target.hasClass("checkbox_b_checked")){
				target.removeClass("checkbox_b_checked")
			}else{
				target.addClass("checkbox_b_checked")
			}
            var pindex, pval;
            pindex = target.data("index");
            var segid = ~ ~this.request.query.pindex;
			
            this.changePassengerList(segid, pindex, target.hasClass("checkbox_b_checked"));
        },
        changePassengerList: function (segid, pindex, flag) {
            var data = flightTicketRefundChangeStore.get();
            var pval = data.segs[segid].psgs[pindex];

            if (flag) {
                this.passengerList[segid] = this.passengerList[segid] || {};
                this.passengerList[segid][pindex] = {
                    chgseg: {
                        segid:  data.segs[segid].segid,
                        psgname: pval.name
                    }
                }
            } else {
                delete this.passengerList[segid][pindex];
            }
        },
        flightordermodifyselectSubmit: function () {
            if (this.checkSumbitData()) {
                var sdata = flightTicketChangeForm.get();
                var segid = ~ ~this.request.query.pindex;
                sdata = sdata || {
                    passengerList: {},
                    changeTime: {}
                };
                sdata.passengerList = sdata.passengerList || {};
                sdata.passengerList[segid] = sdata.passengerList[segid] || {};

                sdata.passengerList[segid] = this.passengerList[segid];

                sdata.changeTime = sdata.changeTime || {};
                sdata.changeTime[segid] = sdata.changeTime[segid] || {};
                sdata.changeTime[segid] = this.changeTime[segid];
                flightTicketChangeForm.setAttr(sdata);


                this.passengerList = {};
                this.changeTime = {};
                this.back("flightordermodify");
            }
        },
        //提交的数据校验
        checkSumbitData: function () {
            var self = this, flg = false;
            var segid = ~ ~this.request.query.pindex;
            var passengerList = self.passengerList;
            self.$el.find("#js_departDate").removeClass("cui-input-error");
            self.$el.find(".list_psgs li").removeClass("cui-input-error");
            for (var pid in passengerList[segid]) {
                flg = true;
            }

            if (flg) {
                if (self.changeTime[segid]) {
                    return true;
                } else {
                    self.hideLoading();
                    self.$el.find("#js_departDate").addClass("cui-input-error");
                    var msg = "请选择起飞日期";
                    self.showToast(msg);
                    return false;
                }
            }
            else {
                self.hideLoading();
                self.$el.find(".list_psgs li").not(".flt_discheck").addClass("cui-input-error");
                var msg = "请至少选择一个登机人";
                self.showToast(msg);
                return false;
            }


        },
        onCreate: function () {
            this.injectHeaderView();
            this.render();
        },
        onShow: function () {
            this.setTitle('改签信息填写');
        },
        onLoad: function () {
            var self = this;
           
            //对HeaderView设置数据
            var isShowHome = true;            
            self.headerview.set({
                title: '改签信息填写',
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
                self.getFlightTicketRefundChangeSearch();
            } else {//用户未登入或登入失效返回首页
                if (!cUtility.isInApp()) {
                    self.jump("/webapp/myctrip/#account/login?from=" + encodeURIComponent(this.getRoot() + '#flightorderdetail'));
                } else {
                    self.showWarning404(function () {
                        location.reload();
                    });
                }
            }
        },
        onHide: function () {
            this.elsBox.flightordermodify_box.empty();
            this.hideLoading();
            this.hideWarning404();
            //this.headerview.hide();
        },
        checkData: function (data) {
            try {
                if (data.tktinfo && data.segs) {
                    if (data.segs.length > 0) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    false;
                }
            } catch (e) {
                return false;
            }
        },
        getFlightTicketRefundChangeSearch: function () {
            var self = this;
            self.showLoading();
            var data = flightTicketRefundChangeStore.get();
            var pindex = ~ ~this.request.query.pindex;
            var formData = flightTicketChangeForm.get();
            formData = formData || {};
            self.hideLoading();
            if (self.changeTime[pindex] && self.changeTime[pindex].takedate) {

            } else {
                this.changeTime = formData.changeTime || {};
            }

            if (self.passengerList[pindex]) {

            } else {
                this.passengerList = formData.passengerList || {};
            }

            if (data && data.segs[pindex]) {
                self.turning();
                data.segs[pindex].selectp = formData;
                this.createCalendar(new Date((data.tktinfo.expired).replace(/-/g, '/')));
                self.renderData(data.segs[pindex]);
            } else {
                self.hideLoading();
                self.showWarning404(function () {
                    location.reload();
                });
            }

        },
        createCalendar: function (validEndDate) {
            var now = this.getServerDate();
            var self = this;
            var months = cbase.Date.diffMonth(now, validEndDate);
            months = months > 0 ? months + 1 : 1;


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
                title: '日期选择',
                Months: months,
                animatSwitch: true,
                validEndDate: validEndDate,
                callback: function (date, datename, dates, d, end) {

                    self.setPanelDate.apply(self, arguments);
                    if (this._hide) { this._hide(); } else { this.hide(); };
                },
                onShow: function () {
                    self.$el.hide();
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
        departDateAction: function () {
         //   this.calendar.setCurDate('start');
         //   this.calendar.update({
         //       validStartDate: this.getServerDate()
          //  });
            this.calendar.show();
        },
        setPanelDate: function (date, datename, dates, d, end) {
            var datap = this.elsBox.flightordermodify_box.find("#js_departDate .flt_rlink");
            datap.addClass("flt_rshow");
            datap.html(cbase.Date.format(date, 'Y-m-d'));
            //this.changeTime = date;
            var segid = ~ ~this.request.query.pindex;
            this.addDateTime(segid, date);

        },
        addDateTime: function (segid, date) {
            this.changeTime[segid] = this.changeTime[segid] || {};
            this.changeTime[segid].takedate = cbase.Date.format(date, 'Y/m/d 0:00:00');
        }

    });

    var defaultData = function (data, default_data) {

        for (key in data) {
            if (typeof (data[key]) == "undefined" || data[key] == null) {
                data[key] = default_data[key];
            } else if (typeof (data[key]) == "object") {
                default_data[key] = default_data[key] || {};
                defaultData(data[key], default_data[key])
            }
        }
        
        return data;
    }
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

define(['cSales', 'libs', 'c', 'CommonStore', 'FlightStore', 'FlightModel', 'cBasePageView', buildViewTemplatesPath('flightorderdetail.html'), 'cUtilityCrypt', 'utility/utility.js', 'cUtility', 'cWidgetFactory', 'cWidgetGuider'], function (cSales, libs, c, CommonStore, FlightStore, FlightModel, BasePageView, html, Crypt, utility, cUtility, WidgetFactory) {
    var cui = c.ui, cbase = c.base, salesStore = CommonStore.SalesObjectStore.getInstance(),
      orderParamStore = FlightStore.FlightOrderParamStore.getInstance(), //用户的订单参数信息
      flightAircraftStore = FlightStore.FlightAircraftStore.getInstance(),
      flightAircraftModel = FlightModel.FlightAircraftModel.getInstance(),
      flightOrderDetailStore = FlightStore.FlightOrderDetailStore.getInstance(),
      flightOrderInfoStore = FlightStore.FlightOrderInfoStore.getInstance(), //航班订单信息Storage
      flightDeliveryStore = FlightStore.FlightPickTicketSelectStore.getInstance(), //航班订单配送信息Storage
      flightTicketChangeForm = FlightStore.FlightTicketChangeForm.getInstance(),
      flightTicketRefundFormStore = FlightStore.FlightTicketRefundFormStore.getInstance(), // 退票申请表单内容
      flightOrderDetailModel = FlightModel.FlightOrderDetailModel.getInstance(),
      orderCancelModel = FlightModel.OrderCancelModel.getInstance(),
      expressStatusSearchModel = FlightModel.ExpressStatusSearchModel.getInstance(),
      XiaoMiModel = FlightModel.XiaoMiModel.getInstance();

    var paymentThirdPartySignatureForFlightSearch = FlightModel.PaymentThirdPartySignatureForFlightSearch.getInstance(); //第三方

    var cancelCheckResultStore = FlightStore.CancelCheckResultStore.getInstance(); //取消值机结果store
    var orderDetailId = 0;
    //用户信息    
    var userStore = CommonStore.UserStore.getInstance(),
        userInfo = userStore.getUser();
    var HeadStore = CommonStore.HeadStore.getInstance();

    var defaultData = {
        amt: 0,
        statusRmk: "&nbsp;"
    };

    var flightCCBStore = FlightStore.FlightCCBStore.getInstance();


    var View = BasePageView.extend({
        pageid: '214208',
        tpl: html,
        hasAd: true,
        removeOrderStore: true,
        tripType: null,
        homeUrl: "/html5",
        backUrl: "flightorderlist",
        getAppUrl: function () {
            var appUrl = "";

            orderDetailId = this.getQuery("oid");

            if (userStore && userStore.getUser()) {
                var sourceid = "";
                if (window.localStorage && window.localStorage.getItem('SALES') != null && window.localStorage.getItem('SALES') != "") {
                    var SALES = JSON.parse(window.localStorage.getItem('SALES'));
                    if (SALES["data"] != null) {
                        sourceid = SALES["data"]["sourceid"];
                    }
                }

                var oid = flightOrderDetailModel.getParam('id');
                appUrl =
            "/InlandFlightOrder?orderId=" + oid +
            "&UserID=" + userStore.getUser().LoginName +
            "&extendSourceID=" + sourceid;
            }

            return appUrl;
        },
        render: function () {
            this.$el.html(this.tpl);
            this.elsBox = {
                flight_info_tpl: this.$el.find('#flight_info_tpl'), //模板
                flight_info_box: this.$el.find('#flight_info_box'),  //容器
                flight_fly_tpl: this.$el.find('#flight_fly_tpl'), //模板
                flight_fly_box: this.$el.find('#flight_fly_box'),  //容器
                flight_passengers_tpl: this.$el.find('#flight_passengers_tpl'), //模板
                flight_passengers_box: this.$el.find('#flight_passengers_box'),  //容器
                flight_paypanel_tpl: this.$el.find('#flight_paypanel_tpl'),
                flight_paypanel_box: this.$el.find('#flight_paypanel_box'),
                expressstatus_tpl: this.$el.find('#expressstatus_tpl')

            };
            this.flight_info_fun = _.template(this.elsBox.flight_info_tpl.html());
            this.flight_fly_fun = _.template(this.elsBox.flight_fly_tpl.html());
            this.flight_passengers_fun = _.template(this.elsBox.flight_passengers_tpl.html());
            this.flight_paypanel_fun = _.template(this.elsBox.flight_paypanel_tpl.html());
            this.expressstatus_fun = _.template(this.elsBox.expressstatus_tpl.html());
        },
        renderData: function (data) {
            var self = this;
            data.cDate = cbase.Date;
            data.num2Chnum = num2Chnum;
            //送礼品卡
            try {
                if (data.deliverys && data.deliverys[0] && data.deliverys[0].extinfo && data.deliverys[0].extinfo.paytype === 2) {
                    data.isLiPinKa = true;
                    data.lpkAmt = data.deliverys[0].extinfo.amount;
                    data.returnAmt = (data.flttick && data.flttick.acamt) || 0;
                } else if (data.flttick && data.flttick.thamt > 0) {
                    data.isLiPinKa = true;
                    data.lpkAmt = data.flttick.thamt || 0;
                    data.returnAmt = data.flttick.acamt || 0;
                } else {
                    data.isLiPinKa = false;
                }
            } catch (err) {
                console.log('送礼品卡error：', err.msg);
            }
            var flight_info_item = self.flight_info_fun(data);
            self.elsBox.flight_info_box.html(flight_info_item);
            var flight_fly_item = self.flight_fly_fun(data);
            self.elsBox.flight_fly_box.html(flight_fly_item);
            var flight_passengers_item = self.flight_passengers_fun(data);
            self.elsBox.flight_passengers_box.html(flight_passengers_item);
            var flight_paypanel_item = self.flight_paypanel_fun(data);
            self.elsBox.flight_paypanel_box.html(flight_paypanel_item);
            if (self.exhtml) {
                self.$el.find(".js_expressStatus").append(self.exhtml);
            }
        },
        backAction: function () {


            if (orderParamStore) { orderParamStore.remove(); }
            this.removeOrderStore = true;


            userInfo = userStore.getUser();
            if (userInfo && userInfo.Auth) {
                if (this.backUrl == "flight_order_list") {
                    this.jump("/webapp/myctrip/index.html#orders/flightorderlist");
                } else if (this.backUrl == "/webapp/myctrip/index.html#orders/unuseorderlist") {
                    this.jump("/webapp/myctrip/index.html#orders/unuseorderlist");
                } else if (this.backUrl.indexOf("orderresults") > 0) {
                    this.jump("/webapp/flight/index.html#orderresults?rc=0&orderid=" + orderDetailId);
                } else if (this.backUrl.indexOf("flight/#bookinginfo") > 0) {
                    //跳转至订单填写页
                    this.jump(this.backUrl);
                } else if (this.backUrl != "flight_order_list" && this.backUrl != "" && this.backUrl != null) {//新增  当backurl中有正确url地址则jump
                    this.jump(this.backUrl);
                } else {
                    this.jump("/webapp/myctrip/index.html#orders/flightorderlist");
                }

            } else {
                var _sales = salesStore.get();
                //交行合作渠道(1867) 2014-3-11 caof  建行合作
                if (_sales && _sales.sid && (+_sales.sid == 1575 || +_sales.sid == 1867 || +_sales.sid == 449843)) {
                    this.jump('/webapp/flight/index.html');
                } else if (_sales && _sales.sid && +_sales.sid == 1896) {
                    window.location = "map://leftClick()";
                } else {
                    this.jump(this.homeUrl);
                }
            }

        },
        rebateAction: function (e) {
            var target = $(e.currentTarget);
            var amt = target.attr('data-rebate');
            var code = target.attr('data-code');
            if (amt && +amt > 0 && code && code.trim().length > 0) {
                var yzcode = code.split('|')[0];
                //1.设置弹出框
                this.fxAlert = new c.ui.Alert({
                    title: '返现提示',
                    message: '1.在微信中查找“携程旅行网”加关注</br>2.在聊天输入框中输入验证码“' + yzcode + '”后发送',
                    buttons: [
                     { text: '确定', click: function () { this.hide(); } },
                      {
                          text: '去下载', click: function () {
                              var os = window.navigator.userAgent;
                              if (os) {
                                  os = os.toLowerCase();
                                  var androidAppstore = 'http://weixin.qq.com/m',
                                 iosAppstore = 'https://itunes.apple.com/cn/app/id414478124?mt=8&ls=1';
                                  if (os.indexOf('android') > -1) { this.hide(); window.location = androidAppstore; }
                                  else if (os.indexOf('iphone') > -1) { this.hide(); window.location = iosAppstore; }
                                  else { this.hide(); }
                              } else {
                                  this.hide();
                              }
                          }
                      }
                    ]
                });
                this.fxAlert.show();
            }
        },
        events: {
            "click .jstgq": "showTgq",
            "click #jsRebateAmt": "rebateAction",
            "click #modifyorder": "modifyorder",
            "click #flightticketrefund": "ticketrefund",
            "click .jsexpstatlistp": "expressStatusList",
            "click #cancelorder": "showCancelAlert",
            "click #flightzj": "jumpCheckin",
            "click #payagain": "showDialog4PayAgain"
        },
        jumpCheckin: function (e) {
            cancelCheckResultStore.setAttr("backurl", "/webapp/flight/index.html#flightorderdetail?oid=" + orderDetailId);
            $('#headerview').hide();
            this.jump("/webapp/flight/#CheckInList");
        },
        expressStatusList: function (e) {
            var target = $(e.currentTarget);
            target.toggleClass("current");
            if (target.hasClass("current")) {
                target.next(".jsexpstatlist").show();
            } else {
                target.next(".jsexpstatlist").hide();
            }
        },
        //显示取消订单弹层
        showCancelAlert: function (event) {
            var $this = $(event.currentTarget),
                oid = $this.attr('data-oid'),
                cflag = $this.attr('data-flag');
            if ((cflag & 4) == 4 && (oid != null && oid != "")) {
                var self = this;
                self.cancelAlert = new cui.Alert({
                    showTitle: true,
                    title: '提示信息',
                    message: '确定要取消订单吗？',
                    buttons: [

                             {
                                 'text': '取消订单',
                                 'click': function () {
                                     this.hide();
                                     self.cancelFlightOrder(oid)
                                 },
                                 'type': c.ui.Alert.STYLE_CANCELSTYLE_CONFIRM
                             },
                             {
                                 'text': '点错了',
                                 'click': function () { this.hide(); },
                                 'type': c.ui.Alert.STYLE_CANCEL || 'cancel'
                             }
                    ]
                });
                self.cancelAlert.show();
            }
        },
        //取消订单
        cancelFlightOrder: function (oid) {
            var self = this;
            console.log(oid);

            if (oid != "") {
                self.showLoading();
                orderCancelModel.setParam('oid', oid);
                orderCancelModel.excute(function (data) {
                    self.hideLoading();
                    console.log(data);
                    if (data && data["res"] == true) {
                        self.sucAlert = new cui.Alert({
                            showTitle: true,
                            title: '提示信息',
                            message: '订单取消成功',
                            buttons: [
                             {
                                 text: '知道了', click: function () {
                                     this.hide();
                                     location.reload();
                                 }
                             }
                            ]
                        });
                        self.sucAlert.show();
                    } else {
                        self.errAlert = new cui.Alert({
                            showTitle: true,
                            title: '提示信息',
                            message: '您的订单已无法取消，如有疑问请您拨打客服电话',
                            buttons: [

                              {
                                  'text': '拨打电话',
                                  'click': function () {
                                    //点击header的电话啊
                                    $('#c-ui-header-tel').click();
                                    this.hide();
                                  },
                                  'type': c.ui.Alert.STYLE_CANCELSTYLE_CONFIRM
                              },
                              {
                                  'text': '确定',
                                  'click': function () {
                                      this.hide();
                                      location.reload();
                                  },
                                  'type': c.ui.Alert.STYLE_CANCEL || 'cancel'
                              }
                            ]
                        });
                        self.errAlert.show();
                    }
                }, function (err) {
                    self.hideLoading();
                    self.hideWarning404();
                    self.showWarning404(function () {
                        self.hideWarning404();
                        location.reload();
                    });
                }, true, this, function (err) {
                    self.hideLoading();
                    self.hideWarning404();
                    self.showWarning404(function () {
                        self.hideWarning404();
                        location.reload();
                    });
                });
            }

        },
        //退票按钮
        ticketrefund: function () {
            this.removeOrderStore = false;

            if (this.tripType) {
                if (this.tripType == 1) {
                    this.forward("ticketrefundsingle");
                } else {
                    this.forward("ticketrefundmultiple");
                }
            }

        },
        //改签按钮
        modifyorder: function (e) {
            this.removeOrderStore = false;
            this.forward("flightordermodify");
        },
        showTgq: function (e) {
            var target = $(e.currentTarget);
            var div = target.next("div");
            if (target.hasClass('flight-arrdown')) {
                div.removeClass('js_hide');
                target.removeClass('flight-arrdown').addClass('flight-arrup');
            } else {
                div.addClass('js_hide');
                target.removeClass('flight-arrup').addClass('flight-arrdown');
            }
        },
        showDialog4PayAgain: function () {
            var self = this;
            var data = flightOrderDetailStore.get();
            if (data != null) {

                var queryObj = {};
                for (var i = 0; i < data["repays"].length; i++) {
                    var o = data["repays"][i];
                    if (o["repaytyp"] != null && o["extno"] != null) {
                        queryObj = o;
                        break;
                    }
                }

                var oid = data["id"];
                var extno = queryObj["extno"] || "";
                //var billno = queryObj["billno"] || "";
                // var amt = queryObj["amt"] || 0;
                // var auth = userStore.getUser().Auth;

                var param = {
                    "ver": "99",
                    "ooption": 1, //  1:获得新的ExternalNo  2:提交修改支付方式 
                    "oid": oid,
                    "extno": extno
                };


                var relorders = data["relorders"];

                if (relorders != null && relorders.length > 0) {


                    //---------------拆单--------------------//
                    var content = "<p>支付金额:" + " ￥" + amt + "</p>"
                    content += "<p>提交订单时，系统自动拆分成多张订单:</p>"
                    content += "<p>订单" + data["id"] + "</p>";
                    for (var i = 0; i < relorders.length; i++) {
                        content += "<p>订单" + relorders[i]["oid"] + "</p>";
                    }
                    content += "<p>支付总额为以上订单应付款总和</p>"

                    self.payAgainAlert = new cui.Alert({
                        // showTitle: true,
                        // title: '提示信息',
                        message: content,
                        buttons: [
                    {
                        'text': '返回',
                        'click': function () { this.hide(); },
                        'type': c.ui.Alert.STYLE_CANCEL || 'cancel'
                    },
                    {
                        'text': '支付',
                        'click': function () {
                            this.hide();
                            self.jumpToPaymentV2(param);
                        },
                        'type': c.ui.Alert.STYLE_CANCELSTYLE_CONFIRM
                    }

                        ]
                    });
                    self.payAgainAlert.show();
                    //---------------拆单--------------------//
                } else {
                    self.jumpToPaymentV2(param);
                }
            }
        },
        //---------------再支付--------------//
        jumpToPaymentV2: function (param) {
            var self = this;
            if (param != null) {

                //----------------------------------------------------------------//
                var data = flightOrderDetailStore.get();

                var queryObj = {};
                for (var i = 0; i < data["repays"].length; i++) {
                    var o = data["repays"][i];
                    if (o["repaytyp"] != null && o["extno"] != null) {
                        queryObj = o;
                        break;
                    }
                }

                var oid = data["id"];
                var extno = queryObj["extno"] || "";
                var billno = queryObj["billno"] || "";
                var amt = queryObj["amt"] || 0;
                var auth = userStore.getUser().Auth;
                var bustype = 101; //国内机票
                var title = "";

                var auth = userStore.getUser().Auth;

                var getRam = function (n) {
                    // cUtility.getGuid();
                    var rnd = "";
                    for (var i = 0; i < n; i++)
                        rnd += Math.floor(Math.random() * 10);
                    return rnd;
                }
                var rid = getRam(19);




                //----------------------------------------------------------------//

                self.showLoading();


                paymentThirdPartySignatureForFlightSearch.setParam(param);
                console.log(param);

                paymentThirdPartySignatureForFlightSearch.excute(function (result) {
                    self.hideLoading();
                    console.log(result);

                    if (result) {
                        if (result["rc"] == 0) {
                            var newExtno = result["rltvlu"];

                            // 生成 token
                            var tokenObj = {
                                "oid": oid,
                                "bustype": bustype,
                                "from": location.href,
                                "sback": location.origin + "/webapp/flight/#orderresults?rc=0&type=flight&orderid=" + oid,
                                "eback": location.origin + "/webapp/flight/#orderresults?rc=1&type=flight&orderid=" + oid,
                                "rback": location.origin + "/webapp/flight/#orderresults?rc=2&type=flight&orderid=" + oid,
                                "auth": userStore.getUser().Auth,
                                "title": "机票订单",
                                "currency": "CNY",
                                "amount": amt,
                                "extno": newExtno,
                                "islogin": userStore.isNonUser() ? 1 : 0,
                                "requestid": rid
                            };

                            var needInvoice = (data["delivery"] && data["delivery"] != "不需要报销凭证");

                            if (needInvoice == true) {
                                tokenObj["needInvoice"] = true;
                                tokenObj["invoiceDeliveryFee"] = data["deliveryFee"] || 0;
                                tokenObj["includeInTotalPrice"] = true;
                            }



                            var token = Crypt.Base64.encode(JSON.stringify(tokenObj));

                            // 构建支付URL
                            var host = location.host;
                            var paymentURL = "https://secure.ctrip.com/webapp/payment2/index.html#index?";

                            if (host.match(/^(localhost|172\.16|127\.0)/i)) {
                                //本地环境
                                paymentURL = "https://secure.fws.qa.nt.ctripcorp.com/webapp/payment2/index.html#index?";
                            } else if (host.match(/^m.fat/i) || host.match((/^m.test/i))) {
                                //测试环境
                                paymentURL = "https://secure.fws.qa.nt.ctripcorp.com/webapp/payment2/index.html#index?";
                            } else if (host.match(/^m\.uat\.qa/i)) {
                                // UAT 环境
                                paymentURL = "https://secure.uat.sh.ctriptravel.com/webapp/payment2/index.html#index?";
                            } else if (host.match(/10.\8/ig)) {
                                // 堡垒环境（需要改Hosts）
                                // 10.8.5.10 secure.ctrip.com
                                // 10.8.5.25 wpg.ctrip.com
                                paymentURL = "https://10.8.5.10/webapp/payment2/index.html#index?"
                            } else {
                                // 生产环境
                                //paymentURL = "https://secure.ctrip.com/webapp/payment2/index.html#index?";
                                paymentURL = "https://secure.ctrip.com/webapp/payment2/index.html#index?"
                            }

                            paymentURL += "oid=" + oid
                            + "&bustype=" + bustype
                            + "&token=" + token;

                            //----------------------------建行合作-----------------------------------//

                            if (flightCCBStore.getAttr("isCCB")) {
                                // 构建扩展信息
                                
                                var osType = flightCCBStore.get().osType;
                                var osVersion = flightCCBStore.get().osVer;
                                var extendObj = {
                                    "osType": osType,
                                    "osVersion": osVersion,
                                    "payWayWhiteList": "EB_CCB"
                                };
                                
                                var extend = Crypt.Base64.encode(JSON.stringify(extendObj));
                                paymentURL += "&extend=" + extend;
                            }

                            //----------------------------建行合作-----------------------------------//



                            //----------------------------建行合作-----------------------------------//

                            if (flightCCBStore.getAttr("isCCB")) {
                                // 构建扩展信息
                                var osType = flightCCBStore.get().osType;
                                var osVersion = flightCCBStore.get().osVer;
                                var extendObj = {
                                    "osType": osType,
                                    "osVersion": osVersion,
                                    "payWayWhiteList": "EB_CCB"
                                };

                                var extend = Crypt.Base64.encode(JSON.stringify(extendObj));
                                paymentURL += "&extend=" + extend;
                            }

                            //----------------------------建行合作-----------------------------------//


                            self.jump(paymentURL);

                        } else {
                            var msg = result["rmsg"] || "网络不给力,请稍后再试试吧"
                            self.showToast(msg);
                        }
                    }
                }, function (err) {
                    self.hideLoading();
                    var msg = err.msg || "网络不给力,请稍后再试试吧"
                    self.showToast(msg);

                }, true, paymentThirdPartySignatureForFlightSearch, function () {
                    self.hideLoading();
                    self.showWarning404(function () {
                        location.reload();
                    });
                });
            }
        },
        //-------------再支付---------------//
        onCreate: function () {
            this.injectHeaderView();
            this.render();
        },
        onShow: function () {
            this.setTitle('订单详情');
            //预防checklist jump回来没有刷新页面的情况，header要显示
            this.showOutHeader();
        },
        onLoad: function () {
            var self = this;
            //对HeaderView设置数据
            var isShowHome = false;
            var _sales = salesStore.get();
            //交行合作渠道(1867) 2014-3-11 caof
            if (_sales && _sales.sid && (+_sales.sid == 1575 || +_sales.sid == 1867)) {
                this.$el.find('#footer').hide();
                if (this.footer)
                    this.footer.hide();
                this.hasAd = false;
            }

            userInfo = userStore.getUser();
            console.log(userInfo);
             
            if (userInfo != null && userInfo.Auth != null && userInfo.Auth != "") {
                console.log(" is login !");
                var param = orderParamStore.get(),//获取查询参数
                    hashAdd = this.request.query.from;//提取来源地址

                if (this.request.query.oid) {//从oid赋值
                    console.log(" is from oid !");
                    flightOrderDetailModel.setParam('id', parseInt(this.request.query.oid));
                    self.backUrl = "flight_order_list";
                    orderParamStore.setAttr({ Id: parseInt(this.request.query.oid), 'url': "flight_order_list" });
                    self.getFlightOrderDetail(parseInt(this.request.query.oid));
                    orderDetailId = parseInt(this.request.query.oid);
                    //小米黄页
                    this.xiaoMiHuangYe(this.request.query.oid);

                } else if (param && param.Id) {
                    flightOrderDetailModel.setParam('id', param.Id);
                    orderDetailId = param.Id;
                    flightTicketRefundFormStore.remove();
                    flightTicketChangeForm.remove();
                    flightTicketChangeForm.setAttr("oid", param.Id);
                    if (param.url != null) {//从 orderstore赋值
                        self.backUrl = param.url;
                    }
                    self.getFlightOrderDetail(param.Id);
                    this.xiaoMiHuangYe(param.Id);
                } else {
                    self.backUrl = "flight_order_list";
                    self.backAction();
                }
            } else {//用户未登入或登入失效返回  登入页/机票首页
                if (!cUtility.isInApp()) {
                    var jumpurl = "/webapp/myctrip/#account/login?from=" + encodeURIComponent(this.getRoot() + '#flightorderdetail');
                    if (this.request.query.oid) {
                        jumpurl += "?oid=" + this.request.query.oid;
                        if (this.getQuery("openapp")) {
                            jumpurl += "&openapp=" + this.getQuery("openapp");
                        }
                        if (this.getQuery("downapp")) {
                            jumpurl += "&downapp=" + this.getQuery("downapp");
                        }
                        if (this.getQuery("sourceid")) {
                            jumpurl += "&sourceid=" + this.getQuery("sourceid");
                        }
                    }
                    var _sales = salesStore.get();
                    //交行合作渠道(1867) 2014-3-11 caof
                    if (_sales && _sales.sid && (+_sales.sid == 1575 || +_sales.sid == 1867)) {
                        jumpurl = '/webapp/flight/index.html';
                    }
                    self.jump(jumpurl);
                } else {
                    self.showWarning404(function () {
                        location.reload();
                    });
                }
            }
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
            flightAircraftModel.abort();
            flightOrderDetailModel.abort();
            this.elsBox.flight_info_box.empty();
            this.elsBox.flight_fly_box.empty();
            this.elsBox.flight_passengers_box.empty();
            this.elsBox.flight_paypanel_box.empty();
            this.hideLoading();
            this.hideWarning404();
            orderCancelModel.abort();
            //隐藏view时隐藏外围头部
            //            this.hideOutHeader();
            //            this.headerview.hide();           //头部消失的问题
        },
        hideOutHeader: function () {
            //隐藏view外围头部
            this.$headerview = this.$headerview ? this.$headerview : $('#headerview');
            if (this.$headerview.length > 0) {
                this.$headerview.hide();
            }
        },
        showOutHeader: function () {
            //显示view外围头部
            this.$headerview = this.$headerview ? this.$headerview : $('#headerview');
            if (this.$headerview.length > 0) {
                this.$headerview.show();
            }
        },
        //小米黄页更新订单状态
        xiaoMiHuangYe: function (oid) {
            //如果是小米登录，则传入token、mac_key、url
            var _sales = JSON.parse(window.localStorage.getItem('SALES')),   //获取sale store
                requestParams = {};
            if (_sales && _sales['data'] && +parseInt(_sales['data'].sourceid) == 1575) {
                var XIAOMI_TOKEN = JSON.parse(window.localStorage.getItem('XIAOMI_TOKEN'));
                if (XIAOMI_TOKEN) {
                    requestParams.appk = "5311722679795";
                    requestParams.clid = "2882303761517226795";
                    requestParams.actk = XIAOMI_TOKEN.access_token;
                    requestParams.mcky = XIAOMI_TOKEN.mac_key;
                    requestParams.oridurl = 'http://' + window.location.host + '/webapp/fltintl/#fltintlorderdetail?oid=';
                    requestParams.orid = oid;
                    requestParams.btype = 101;  //101是国内，102是国际
                    XiaoMiModel.setParam(requestParams);

                    XiaoMiModel.excute(function (data) {
                        //                console.log('xiaomi:', data);
                    }, function () {

                    }, this.false);

                }

            }
        },

        getFlightOrderDetail: function (oid) {
            var self = this;
            self.showLoading();

            expressStatusSearchModel.setParam({ qinfo: [{ 'oid': oid, 'biztype': 1 }] });
            expressStatusSearchModel.excute(function (exdata) {
                exdata.cDate = cbase.Date;
                self.exhtml = self.expressstatus_fun(exdata);
                if (self.$el.find(".js_expressStatus").length > 0) {
                    self.$el.find(".js_expressStatus").append(self.exhtml);
                    self.exhtml = null;
                }
            }, function (err) {

            }, false, self, function () {

            });
            //先隐藏多余头部
            this.hideOutHeader();
            flightOrderDetailModel.excute(function (data) {
                console.log(data);

                data["cBase"] = cbase;
                //对HeaderView设置数据
                var isShowHome = false;
                checkData.call(self, data, defaultData);
                self.headerview.set({
                    title: '订单详情',
                    back: true,
                    view: self,
                    tel: { number: 4000086666 },
                    home: isShowHome,
                    events: {
                        homeHandler: function () { self.jump("/html5/"); },
                        returnHandler: function () { self.backAction(); }
                    }
                });
                self.headerview.show();
                self.turning();

                if (data["passengers"] != null && data["passengers"].length == 0) {//乘客信息获取不到,返回机票首页 
                    self.hideLoading();
                    if (this.getQuery("oid")) {
                        self.showToast("订单查询失败。", 1, function () {
                            var salesInfo = salesStore.get();
                            if (salesInfo && salesInfo.sid && +salesInfo.sid == 1896) {
                                window.location = "map://leftClick()";
                            } else {
                                self.jump(self.homeUrl);
                            }
                        });
                    } else {
                        self.showWarning404(function () {
                            self.hideWarning404();
                            self.onLoad();
                        });
                    }
                }


                if (data != null) {

                    if (data["passengers"] != null && data["passengers"].length == 0) {//乘客信息获取不到,返回机票首页 
                        self.hideLoading();
                        if (this.getQuery("oid")) {
                            self.showToast("订单查询失败。", 1, function () {
                                var salesInfo = salesStore.get();
                                if (salesInfo && salesInfo.sid && +salesInfo.sid == 1896) {
                                    window.location = "map://leftClick()";
                                } else {
                                    self.jump(self.homeUrl);
                                }
                            });
                        } else {
                            self.showWarning404(function () {
                                self.hideWarning404();
                                self.onLoad();
                            });
                        }
                    }


                    var isShowBtnDiv = false;
                    if (data["flightInfos"] != null) {
                        var isZJ = false;
                        for (var i = 0; i < data["flightInfos"].length; i++) {
                            var flagZJ = data["flightInfos"][i]["flag"];
                            if ((flagZJ & 1024) == 1024) {
                                isZJ = true;
                                isShowBtnDiv = true;
                            }
                        }
                        data["isZJ"] = isZJ;
                    }

                    if (data["flag"] != null) {
                        if ((data["flag"] & 8) == 8 || (data["flag"] & 32) == 32 || (data["flag"] & 64) == 64) {
                            isShowBtnDiv = true;
                        }
                    }



                    if (typeof (data["repays"]) != "undefined" && data["repays"] != null) {
                        for (var i = 0; i < data["repays"].length; i++) {
                            var rp = data["repays"][i];
                            if (rp["repaytyp"] == 1 || rp["repaytyp"] == 3) {//兼容 1或者3信用卡继续支付
                                data["payAgain"] = true;
                                isShowBtnDiv = true;
                                break;
                            }
                        }
                    }



                    data["isShowBtnDiv"] = isShowBtnDiv;



                    if (data.amt === 0 && data.passengers.length === 0) {
                        //订单可能不是属于登录人的
                        // self.hideLoading();
                        //this.jump("/html5");
                    } else {
                        flightAircraftModel.excute(function (d) {
                            self.hideLoading();
                            if (d) {
                                data.aircraft = d;
                                //在订单详情stroe加入订单填写store中的iinfo wyren@ctrip.com 2014-4-2
                                // data.iinfo = flightOrderInfoStore.get() ? flightOrderInfoStore.get().iinfo : {}; //发票抬头
                                // data.deliverytype = flightDeliveryStore.get() ? flightDeliveryStore.get().type : 1; //配送方式：1-不要；2-邮寄；3-机场自取

                                data["iinfo"] = (typeof (data["iinfo"]) != "undefined" && data["iinfo"] != null) ? data["iinfo"] : {};

                                self.renderData(data);
                            }
                        }, function (er) {
                            self.hideLoading();
                            data.aircraft = null;

                            self.renderData(data);
                        });
                    }
                } else {
                    self.hideLoading();
                    self.showWarning404(function () {
                        location.reload();
                    });
                }
            }, function (err) {
                self.hideLoading();
                self.showWarning404(function () {
                    location.reload();
                });
            }, this.removeOrderStore, this, function () {
                self.hideLoading();
                self.showWarning404(function () {
                    location.reload();
                });
            });
        }
    });

    var checkData = function (data, default_data) {
        for (key in data) {
            if (typeof (data[key]) == "undefined" || data[key] == null) {
                data[key] = default_data[key];
            } else if (typeof (data[key]) == "object") {
                default_data[key] = default_data[key] || {};
                checkData(data[key], default_data[key])
            }
        }
        this.tripType = data.tripType;
        if (data.flightInfos && data.flightInfos.length > 1 && data.tripType == 1) {
            data.tripType = 4;
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

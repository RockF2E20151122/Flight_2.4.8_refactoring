/// <summary>
/// 用户机票订单详情 creator:caofu; createtime:2013-07-23
/// </summary>
define(['libs', 'c', 'CommonStore', 'FlightStore', 'FlightModel', buildViewTemplatesPath('orderdetail.html')], function (libs, c, CommonStore, FlightStore, FlightModels, html) {
    var orderListModel = FlightModels.FlightOrderListModel.getInstance(), //订单列表数据Model
     orderListStore = FlightStore.FlightOrderListStore.getInstance(), //用户的订单列表信息
        orderDetailModel = FlightModels.FlightOrderDetailModel.getInstance(), //订单详情数据Model
        orderParamStore = FlightStore.FlightOrderParamStore.getInstance(), //用户的订单参数信息
        aircraftModel = FlightModels.FlightAircraftModel.getInstance(), //机型数据Model
        userStore = CommonStore.UserStore.getInstance(), //用户信息
        userInfo = userStore ? userStore.getUser() : null,
        returnPageStore = FlightStore.OrderDetailReturnPage.getInstance(),
        cbase = c.base;
    var View = c.view.extend({
        pageid: '212055',
        hasAd : true,
        tpl: html,
        //css: ['/webapp/res/style/common2.css', '/webapp/res/style/flight.css'],
        render: function () {
            this.showLoading();
            this.$el.html(this.tpl);
            this.elsBox = {
                orderinfo_tpl: this.$el.find('#orderinfotpl'), //订单基本信息模板
                orderinfo_box: this.$el.find('#orderinfobox'), //订单基本信息容器
                flightdetail_tpl: this.$el.find('#flightdetailtpl'), //航班详情模板
                flightdetail_box: this.$el.find('#flightdetailbox'), //航班详情容器
                passenger_tpl: this.$el.find('#passengertpl'), //旅客信息模板
                passenger_box: this.$el.find('#passengerbox')//旅客信息容器
            };
            this.boxtplfun = _.template(this.elsBox.orderinfo_tpl.html());
            this.flightdetailtplfun = _.template(this.elsBox.flightdetail_tpl.html());
            this.passengertplfun = _.template(this.elsBox.passenger_tpl.html());
        },
        onCreate: function () {
            if (userInfo && userInfo.Auth) {
                this.render();
            } else {
                this.jump('/webapp/myctrip/#account/login?from=' + encodeURIComponent(this.getRoot() + '#orderdetail'));
            }
        },
        onLoad: function () {
            this.render();
            this.elsBox.orderinfo_box.empty();
            this.elsBox.flightdetail_box.empty();
            this.elsBox.passenger_box.empty();
            this.setTitle('携程旅行网手机触屏版-机票详情');
            if (userInfo && userInfo.Auth) {
                var param = orderParamStore.get(); //获取查询参数
                if (param && param.Id) {
                    orderDetailModel.getHead().setAttr('auth', userInfo.Auth);
                    orderDetailModel.setParam('id', param.Id);
                } else {
                    this.backAction();
                    return;
                }
            } else {
                this.jump('/webapp/myctrip/#account/login?from=' + encodeURIComponent(this.getRoot() + '#orderlist'));
                return;
            }

            this.turning();
            this.getOrderInfoData();
        },
        events: {
            'click #js_return': 'backAction', //返回我的携程
            'click .jsbtnfx': 'rebateAction' //申请返现按钮
        },
        appendList: function (data) {
            //模板数据渲染
            data.cDate = cbase.Date;
            var item = this.boxtplfun(data);
            this.elsBox.orderinfo_box.append(item);
            this.elsBox.flightdetail_box.append(this.flightdetailtplfun(data));
            this.elsBox.passenger_box.append(this.passengertplfun(data));
        },
        getOrderInfoData: function () {
            //获取订单详细信息
            orderDetailModel.excute(function (data) {
                this.hideLoading();
                var self = this;
                if (!data) {
                    this.showHeadWarning('订单详情', '啊哦,数据加载出错了，请稍候再试!', function () {
                        self.backAction(); this.hide();
                    });
                    return;
                }
                orderParamStore.setAttr('Id', data.id);
                aircraftModel.excute(function (d) {
                    if (d) {
                        data.aircraft = d;
                    }
                    self.appendList(data);
                });
            }, function (err) {
                var self = this;
                var msg = err.msg ? err.msg : '啊哦,数据加载出错了，请稍候再试';
                this.showHeadWarning('订单详情', msg, function () {
                    self.backAction(); this.hide();
                });
                this.hideLoading();
            }, true, this);
        },
        backAction: function (e) {
            orderListModel.setParam('pageIdx', 1);
            if (orderParamStore) {
                orderParamStore.remove();
            }
            if (returnPageStore.get()) {
                this.forward('#orderlist');
            } else {
                this.back();
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
                    buttons: [{ text: '下载微信', click: function () {
                        var os = window.navigator.userAgent;
                        if (os) {
                            os = os.toLowerCase();
                            var androidAppstore = 'http://weixin.qq.com/m', iosAppstore = 'https://itunes.apple.com/cn/app/id414478124?mt=8&ls=1';
                            if (os.indexOf('android') > -1) { window.location = androidAppstore; }
                            else if (os.indexOf('iphone') > -1) { window.location = iosAppstore; }
                            else { this.hide(); }
                        } else {
                            this.hide();
                        }
                    }
                    }, { text: '确定', click: function () { this.hide(); } }
                ]
                });
                this.fxAlert.show();
            }
        }
    });
    return View;
});
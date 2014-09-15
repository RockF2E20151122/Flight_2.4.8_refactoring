/// <summary>
/// 机票订单提交结果页 creator:caofu; createtime:2013-07-23
/// </summary>
define(['libs', 'c', 'CommonStore', 'FlightStore', 'FlightModel', 'CPageModel', 'CPageStore', buildViewTemplatesPath('bookingsuccess.html')], function (libs, c, CommonStore, FlightStore, FlightModels, CPageModel, CPageStore, html) {
    var flightDetailsStore = FlightStore.FlightDetailsStore.getInstance(), //获取航班详细信息Storage
     orderDetailStore = FlightStore.FlightOrderDetailStore.getInstance(), //用户的订单详情信息
     orderListStore = FlightStore.FlightOrderListStore.getInstance(), //用户的订单列表信息
    orderParamStore = FlightStore.FlightOrderParamStore.getInstance(), //用户的订单参数信息
    selFlightInfoStore = FlightStore.FlightSelectedInfo.getInstance(), //用户选择的航班信息
    passengerStore = CPageStore.passengerQueryStore.getInstance(), //用户选择的登机人
    passengerEditStore = CPageStore.passengerEditStore.getInstance(), //设置需要修改的登机人Storage
    flightOrderStore = FlightStore.FlightOrderInfoStore.getInstance(), //航班订单信息Storage
    flightDeliveryStore = FlightStore.FlightPickTicketSelectStore.getInstance(), //航班订单配送信息Storage
    postAddressStorage = CPageStore.CustomerAddrStore.getInstance(), //航班订单邮寄配送信息Storage
    airportDeliveryStore = FlightStore.zqInAirportDateAndAddressStore.getInstance(), //航班订单机场自取配
    selfAddressStore = FlightStore.zqInCityDateAndAddressStore.getInstance(), //航班订单市内自取配送信息Storage
    returnPageStore = FlightStore.OrderDetailReturnPage.getInstance(),
    orderCreateStore = FlightStore.OrderCreateStore.getInstance(),  //下一步后生成订单的结果stroe
    userStore = CommonStore.UserStore.getInstance(); //用户信息
    var salesStore = CommonStore.SalesObjectStore.getInstance();
    var View = c.view.extend({
        pageid: '212002',
        tpl: html,
        hasAd: true,
        onCreate: function () {
            returnPageStore.remove();
            orderDetailStore.remove();
            orderListStore.remove();
        },
        onLoad: function () {
            this.showLoading();
            orderDetailStore.remove();
            returnPageStore.remove();
            orderListStore.remove();
            this.render();
            this.updatePage(function () {
                this.hideLoading();
            });
            this.turning();
        },
        onShow: function () {
            this.setTitle('携程旅行网手机触屏版-订单完成');
            returnPageStore.remove();
            if ($('#headerview').length > 0) {
                $('#headerview').hide();
            }
        },
        onHide: function () {
            userInfo = userStore ? userStore.getUser() : null;
            if (userInfo && userInfo.IsNonUser) {
                //移除非会员信息
                userStore.remove();
            }
            returnPageStore.remove();
            orderDetailStore.remove();
            orderListStore.remove();
            this.hideLoading();
            if ($('#headerview').length > 0) {
                $('#headerview').show();
            }
        },
        render: function () {
            selFlightInfoStore.remove();
            var selP = passengerStore.get();
            //从Storage中移除对应的登机人信息
            for (var i in selP) {
                var p = selP[i];
                p.selected = 0;
            }
            var tag = passengerStore.getTag();
            passengerStore.set(selP, tag);
            flightOrderStore.remove();
            flightDetailsStore.remove();
            // flightDeliveryStore.remove();
            // postAddressStorage.remove();
            airportDeliveryStore.remove();
            selfAddressStore.remove();
            returnPageStore.remove();
            orderDetailStore.remove();
            this.$el.html(this.tpl);
            this.elsBox = {
                infobox_tpl: this.$el.find('#infotpl'), //模板
                // cdinfo_tpl:this.$el.find('#cd_infotpl'),//拆单模版
                infobox_box: this.$el.find('#infobox')//模板容器
            };
            this.infoboxtplfun = _.template(this.elsBox.infobox_tpl.html());
            // this.cdinfotplfun=_.template(this.elsBox.cdinfo_tpl.html());
        },
        updatePage: function (callback) {
            //获取url参数
            var masterOid = this.getQuery('orderid'),
                extension = this.getQuery('extension'), 
                flag = this.getQuery('flag');
            userInfo = userStore ? userStore.getUser() : null;
            var _sales = salesStore.get();
            if (_sales && _sales.sid && (+_sales.sid == 1575 || +_sales.sid == 1867)) {
                this.$el.find('#js_home').hide();
                this.$el.find('#footer').hide();
                if (this.footer)
                    this.footer.hide();
                this.hasAd = false;
            }
            if (userInfo && userInfo.Auth && masterOid) {
                var data = orderCreateStore.get(masterOid);
                data.user = userInfo;
                data.orderId = masterOid;
                data.flag = flag;
                data.ext = extension;
                data._sales = _sales;
                data.days = this.getQuery('days');
                if (extension && data.days && +data.days > 0 && !userInfo.IsNonUser) {
                    var os = window.navigator.userAgent;
                    var app = 'http://weixin.qq.com/m';
                    if (os) {
                        os = os.toLowerCase();
                        if (os.indexOf('iphone') > -1 || os.indexOf('ios') > -1) { app = 'https://itunes.apple.com/cn/app/id414478124?mt=8&ls=1'; }
                    }
                    data.app = app;
                }
                //绑定模板
                var item = this.infoboxtplfun(data);
                this.elsBox.infobox_box.html(item);
            } else {
                var self = this;
                this.showHeadWarning('订单完成', "您的订单已提交成功，请返回至我的携程进行订单查询", function () {
                    self.backAction(1); this.hide(); returnPageStore.remove(); self.hideLoading();
                });
            }
            callback.call(this);
        },
        events: {
            'click #js_return': 'backAction', //返回
            'click #js_home': 'backHome', //返回首页
            'click input[data-app]': 'rebateAction', //申请返现按钮
            'click .orderid': 'viewOrder', //查看订单详情
            'click #reg': 'regAction'//前往注册
        },
        backAction: function (e) {
            userInfo = userStore ? userStore.getUser() : null;
            if (userInfo && userInfo.IsNonUser) {
                //移除非会员信息
                userStore.remove();
            }
            //返回到机票搜索页
            this.jump('/webapp/flight/', true);
        },
        backHome: function (e) {
            userInfo = userStore ? userStore.getUser() : null;
            if (userInfo && userInfo.IsNonUser) {
                //移除非会员信息
                userStore.remove();
            }
            //返回H5首页
            var salesInfo = salesStore.get();

            if (salesInfo && salesInfo.sid && +salesInfo.sid == 1896) {
                window.location = "map://leftClick()";
            } else {
                this.jump('/html5/', true);
            }
        },
        rebateAction: function (e) {
            var app = $(e.currentTarget).attr('data-app');
            if (app) {
                window.location.href = app;
            }
        },
        viewOrder: function (e) {
            var orderid = $(e.currentTarget).attr('data-id');
            userInfo = userStore ? userStore.getUser() : null;
            if (orderid && userInfo && userInfo.Auth) {
                //记录用户选定的订单号及基本订单信息
                this.showLoading();
                var data = { Id: orderid, url: "/webapp/flight/index.html#bookingsuccess?orderid=" + orderid };
                orderParamStore.set(data);
                this.jump('/webapp/flight/#flightorderdetail');
            }
        },
        regAction: function (e) {
            window.location.href = $(e.currentTarget).attr('data-href');
        }
    });
    return View;
});

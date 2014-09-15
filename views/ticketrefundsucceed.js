define(['cSales','libs', 'c', 'CommonStore', 'FlightStore', 'FlightModel', 'cBasePageView', buildViewTemplatesPath('ticketrefundsucceed.html'), 'cUtility', 'cWidgetFactory', 'cWidgetGuider'], function (cSales, libs, c, CommonStore, FlightStore, FlightModel, BasePageView, html, cUtility, WidgetFactory) {

    var salesStore = CommonStore.SalesObjectStore.getInstance(),
        userStore = CommonStore.UserStore.getInstance(),
        orderParamStore = FlightStore.FlightOrderParamStore.getInstance(), // 用户的订单参数信息  
        flightOrderDetailStore = FlightStore.FlightOrderDetailStore.getInstance();

    var flightTicketRefundChangeModel = FlightModel.FlightTicketRefundChangeModel.getInstance(), // 机票退改签查询Model
        flightTicketRefundModel = FlightModel.FlightTicketRefundModel.getInstance();  // 机票退票申请       


    var cui = c.ui,
        cbase = c.base,
        userInfo = userStore.getUser(); //用户信息

    var PAGETITLE = '退票申请';

    var View = BasePageView.extend({
        pageid: '214395',
        tpl: html,
        hasAd: true,
        homeUrl: "/html5",
        //backUrl: "filghtordermodify",
        render: function () {
            this.$el.html(this.tpl);
            this.elsBox = {
                ticketRefund_succeed_tpl: this.$el.find('#ticketRefund_succeed_tpl'), // 单程模板
                ticketRefund_succeed_box: this.$el.find('#ticketRefund_succeed_box')  //容器                
            };
            this.ticketRefund_succeed_tpl_creater = _.template(this.elsBox.ticketRefund_succeed_tpl.html());
        },
        renderData: function (data) {
            var self = this;
            var param = orderParamStore.get(); //获取订单查询参数
            data.orderID = param.Id;
            var ticketRefund_item = self.ticketRefund_succeed_tpl_creater(data);
            self.elsBox.ticketRefund_succeed_box.html(ticketRefund_item);
        },

        backAction: function () {
            //if (orderParamStore) { orderParamStore.remove(); }
            userInfo = userStore.getUser();
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
            //"event selector": "functionname"
        },
        onCreate: function () {
            orderParamStore.get() || this.jump(this.homeUrl);
            this.injectHeaderView();
            this.render();
        },
        onShow: function () {
            this.setTitle(PAGETITLE);
        },
        onLoad: function () {
            var self = this;
            self.turning();

            //对HeaderView设置数据
            var isShowHome = true;
            var _sales = salesStore.get();
            if (_sales && _sales.sid && (+_sales.sid == 1575 || +_sales.sid == 1867)) {
                isShowHome = false;
            }
            self.headerview.set({
                title: PAGETITLE,
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
                //self.getFlightTicketRefundChangeSearch();
                self.renderData({})
            } else {//用户未登入或登入失效返回首页
                if (!cUtility.isInApp()) {
                    self.jump("/webapp/myctrip/#account/login?from=" + encodeURIComponent(this.getRoot() + '#flightorderdetail'));
                } else {
                    self.showWarning404(function () {
                        location.reload();
                    });
                }
            }
          //营销电话
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
            this.hideLoading();
            this.hideWarning404();
            //this.headerview.hide();
        }

    });
    return View;
});

define(['cSales','libs', 'c', 'CommonStore', 'FlightStore', 'FlightModel', 'cBasePageView', buildViewTemplatesPath('flightticketchangesucces.html'), 'cUtility', 'cWidgetFactory', 'cWidgetGuider', 'cWidgetCalendar'], function (cSales,libs, c, CommonStore, FlightStore, FlightModel, BasePageView, html, cUtility, WidgetFactory) {
    var cui = c.ui, cbase = c.base, salesStore = CommonStore.SalesObjectStore.getInstance(),
      orderParamStore = FlightStore.FlightOrderParamStore.getInstance(); //用户的订单参数信息           
    //用户信息
    var userStore = CommonStore.UserStore.getInstance(), userInfo = userStore.getUser();
    var flightTicketChangeForm = FlightStore.FlightTicketChangeForm.getInstance();
    var default_data = {};
    var View = BasePageView.extend({
        pageid: '214398',
        tpl: html,
        homeUrl: "/html5",
        render: function () {
            this.$el.html(this.tpl);
            this.elsBox = {
                flightticketchangesucces_tpl: this.$el.find('#flightticketchangesucces_tpl'), //模板
                flightticketchangesucces_box: this.$el.find('#flightticketchangesucces_box')  //容器                

            };
            this.flightticketchangesucces_fun = _.template(this.elsBox.flightticketchangesucces_tpl.html());

        },
        renderData: function (data) {
            var self = this;
            data = data || {};
            data.oid = data.oid || "未知";
            var flightticketchangesucces_item = self.flightticketchangesucces_fun(data);
            self.elsBox.flightticketchangesucces_box.html(flightticketchangesucces_item);
        },
        backAction: function () {

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

        },
        onCreate: function () {
            this.injectHeaderView();
            this.render();
        },
        onShow: function () {
            this.setTitle('改签申请完成');
        },
        onLoad: function () {
            var self = this;
            self.turning();
            //对HeaderView设置数据
            var isShowHome = true;

            self.headerview.set({
                title: '改签申请完成',
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
                self.getData();
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
            this.elsBox.flightticketchangesucces_box.empty();
            this.hideLoading();
            this.hideWarning404();
            //this.headerview.hide();
        },
        getData: function () {
            var data = flightTicketChangeForm.get();
            this.renderData(data);

        }

    });

    return View;
});

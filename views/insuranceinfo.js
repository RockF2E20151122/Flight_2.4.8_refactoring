define(['libs', 'c', 'FlightStore', buildViewTemplatesPath('insuranceinfo.html')], function (libs, c, FlightStore, html) {
    var flightDetailsStore = FlightStore.FlightDetailsStore.getInstance(); //获取航班详细信息Storage
    var View = c.view.extend({
        pageid: 214280,
        tpl: html,
        render: function () {
            this.viewdata.req = this.request;
            this.$el.html(this.tpl);
            this.els = {
                insure_info: this.$el.find('.flight'),
                insure_info_tpl: this.$el.find('#insure_info_tpl')
            };
            this.elHTML = _.template(this.els.insure_info_tpl.html());
        },
        events: { 'click #js_return': 'backToOrder' },
        onCreate: function () {
            //update caofu 2013-08-05
            var flightDetailsData = flightDetailsStore.get();
            if (!flightDetailsData || !flightDetailsData.insurances || flightDetailsData.insurances.length <= 0) {
                //如果localstrage失效，则返回
                this.backToOrder();
                return;
            }
            this.render();
            this.wantBuyInsure = true;
        },
        //数据加载阶段
        onLoad: function () {
            this.hideLoading();
            //update caofu  2013-08-05
            var flightDetailsData = flightDetailsStore.get();
            this.els.insure_info.empty();
            if (!flightDetailsData || !flightDetailsData.insurances || flightDetailsData.insurances.length <= 0) {
                this.backToOrder();
                return;
            }
            this.render();
            this.updatePage();
            this.turning();
        },
        //调用turning方法时触发
        onShow: function () {
            //update caofu  2013-08-05
            var flightDetailsData = flightDetailsStore.get();
            if (flightDetailsData && flightDetailsData.insurances && flightDetailsData.insurances.length > 0) {
                this.render();
                this.updatePage();
            } else {
                this.backToOrder();
                return;
            }
        },
        updatePage: function () {
            var flightDetailsData = flightDetailsStore.get();
            this.els.insure_info.html(this.elHTML(flightDetailsData.insurances[0]));
            var price = (+flightDetailsData.insurances[0].price);
            if (price == 30) {
                //直联
                $("#insure1").hide();
            } else {
                //普通
                $("#insure2").hide();
            }
        },
        onHide: function () {
        },
        backToOrder: function () {
            this.forward('bookinginfo');
        }
    });
    return View;
});

/// <summary>
/// 机票订单消费券返现说明页 creator:caofu; createtime:2013-07-29
/// </summary>
define(['libs', 'c', 'CommonStore', 'FlightStore', 'FlightModel', buildViewTemplatesPath('coupons.html')], function (libs, c, CommonStore, FlightStore, FlightModels, html) {
    var flightDetailsStore = FlightStore.FlightDetailsStore.getInstance(); //获取航班详细信息Storage
    var View = c.view.extend({
        tpl: html,
        flightDetailsData: flightDetailsStore.get(),
        render: function () {
            if (!this.flightDetailsData) {
                this.forward('#bookinginfo');
                return;
            }
            this.hideLoading();
            this.$el.html(this.tpl);
            //this.$el.find('#rbtDay').html(this.flightDetailsData.rebateDur);
        },
        onCreate: function () {
            if (!this.flightDetailsData) {
                this.forward('#bookinginfo');
                return;
            }
        },
        onLoad: function () {
            this.showLoading();
            this.render();
            this.turning();
        },
        events: { 'click #js_return': 'backAction' },
        backAction: function () {
            this.back();
        }
    });
    return View;
});
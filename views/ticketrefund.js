define(['libs', 'c', 'CommonStore', 'FlightStore', 'FlightModel', 'cBasePageView', 'cUtility', 'cWidgetFactory', 'cWidgetGuider'],
function (libs, c, CommonStore, FlightStore, FlightModel, BasePageView, cUtility, WidgetFactory) {

    var cui = c.ui,
     cbase = c.base, 
     salesStore = CommonStore.SalesObjectStore.getInstance(),
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
      expressStatusSearchModel = FlightModel.ExpressStatusSearchModel.getInstance();

    var userStore = CommonStore.UserStore.getInstance(), userInfo = userStore.getUser();
    var View = BasePageView.extend({
        pageid: '',
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

                var oid = self.orderID.get().Id;
                appUrl = "/flight_inland_refund?c1=" + oid +
                  "&UserID=" + userStore.getUser().LoginName +
                  "&extendSourceID=" + sourceid;
            }
            return appUrl;
        },
        erroJump: function () {
            var self = this;
            self.showToast("订单查询失败。", 1, function () {
                self.jump('/webapp/flight/index.html');
            });
        },
        getFlightOrderDetail: function (oid) {
            var self = this;
            self.showLoading();

            flightOrderDetailModel.setParam('id', oid);
            flightOrderDetailModel.excute(function (data) {
                self.hideLoading();
                if (data != null) {
                    if (data["passengers"] != null && data["passengers"].length == 0) {//乘客信息获取不到,返回机票首页 
                        self.erroJump();
                        return false;
                    }

                    if (data.tripType) {
                        if (data.tripType == 1) {
                            self.jump("/webapp/flight/index.html#ticketrefundsingle");
                        } else {
                            self.jump("/webapp/flight/index.html#ticketrefundmultiple");
                        }
                    }

                } else {
                    self.erroJump();
                }
            }, function (er) {
                self.hideLoading();
                self.erroJump();
            });

        },
        onCreate: function () {

        },
        onLoad: function () {
            var self = this;
            self.turning();
            self.showLoading();

            userInfo = userStore.getUser();
            var jumpurl = '/webapp/flight/index.html';
            if (userInfo && userInfo.Auth) {
                if (this.request.query.oid) {
                    orderParamStore.setAttr({ Id: this.request.query.oid, 'url': "flight_order_list" });
                    self.getFlightOrderDetail(this.request.query.oid);


                } else {
                    self.jump(jumpurl);
                }
            } else {
                jumpurl = "/webapp/myctrip/#account/login?from=" + encodeURIComponent(this.getRoot() + '#ticketrefund?oid=' + this.request.query.oid);
                self.jump(jumpurl);
            }

        },
        onShow: function () {
        },
        onHide: function () {
            this.hideLoading();
        }
    });
    return View;
});

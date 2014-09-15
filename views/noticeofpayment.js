define(['libs', 'c', 'CommonStore', 'FlightStore', 'FlightModel', 'cBasePageView', 'utility/utility.js', 'cUtilityCrypt'],
function (libs, c, CommonStore, FlightStore, FlightModel, BasePageView, utility, Crypt) {

    var paymentModel = FlightModel.PaymentModel.getInstance(), //非第三方
       flightBookingResultStore = FlightStore.FlightBookingResultStore.getInstance();

    var dataHelper = {

        // 获取支付请求参数
        getRequestData: function (key) {
            var queryString = location.hash.replace(/^.*?\?/, "").replace(/\|.*$/, "");
            var queryStringBuilder = new utility.QueryStringBuilder(queryString);
            var queryObj = queryStringBuilder.get() || {};

            dataHelper.getRequestData = function (key) {
                return key ? queryObj[key] : {
                    optype: 1,
                    orderinfo: {
                        eno: queryObj.externalNo,
                        oid: queryObj.orderID
                    },
                    btype: 101,
                    ver: 0,
                    payetype: queryObj.payType 
                  
                };
            }

            return key ? queryObj[key] : {
                optype: 1,
                orderinfo: {
                    eno: queryObj.externalNo,
                    oid: queryObj.orderID
                },
                btype: 101,
                ver: 0,
                payetype: queryObj.payType 
            };
        },

        // 支付处理 
        bookingCheck: function (param, callBack) {
            console.log(param);
            console.log(JSON.stringify(param));

            param && paymentModel.setParam(param);
            paymentModel.excute(function (data) {
                var error = false;
                callBack && callBack(error, data)
            }, function (error) {
                callBack && callBack(error);
            }, false, this, function () {

            })


        } // 支付处理 End


    };

    var viewHelper = {
        requestError: function (view, error) {
            var resultData = flightBookingResultStore.get() || {};
            error = error || {};
            resultData.errorMsg = error.resultmsg || error.msg || "支付失败,请稍后再试。";
            resultData.rc = false;
            flightBookingResultStore.set(resultData);

            var orderid = dataHelper.getRequestData('orderID');
            var url = 'orderresults?rc=1&type=flight&orderid=' + orderid  ;
            console.log("err:" + url);
             view.forward(url);
        },

        // 支付完成
        paySuccess: function (view, data) {
            var resultData = flightBookingResultStore.get() || {};
            if (data.result === 0) {
                var orderid = dataHelper.getRequestData('orderID');
                var url = 'orderresults?rc=0&type=flight&orderid=' + orderid  ;
                console.log("suc:" + url);
                 view.forward(url);
            } else {
                viewHelper.requestError(view, data);
            }

        }
    };

    var View = BasePageView.extend({
        pageid: '',
        ordervalue:null,
        onCreate: function () {

        },
        onLoad: function () {
            var self = this;
            self.showLoading();
           
            // 获取支付请求参数
            var requestParams = dataHelper.getRequestData();
            // 支付处理
            self.ordervalue = requestParams.ordervalue;
            dataHelper.bookingCheck(requestParams, function (error, data) {
                var onError = viewHelper.requestError;
                var onSuccess = viewHelper.paySuccess;
                error ? onError(self, error) : onSuccess(self, data);
                self.hideLoading();
            });

            this.turning();
        },
        onShow: function () {
        },
        onHide: function () {
            this.hideLoading();
        }
    });
    return View;
});
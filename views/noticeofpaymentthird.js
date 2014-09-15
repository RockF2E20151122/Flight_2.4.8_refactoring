define(['libs', 'c', 'CommonStore', 'FlightStore', 'FlightModel', 'cBasePageView', 'utility/utility.js', 'cUtilityCrypt'],
function (libs, c, CommonStore, FlightStore, FlightModel, BasePageView, utility, Crypt) {

    var userStore = CommonStore.UserStore.getInstance();
    var flightBookingResultStore = FlightStore.FlightBookingResultStore.getInstance();
    var paymentThirdModel = FlightModel.PaymentThirdModel.getInstance(); //第三方

    var dataHelper = {
        // 获取支付请求参数
        getRequestData: function (key) {
            var queryString = location.hash.replace(/^.*?\?/, "").replace(/\|.*$/, "");
            var queryStringBuilder = new utility.QueryStringBuilder(queryString);
            var queryObj = queryStringBuilder.get() || {};

            dataHelper.getRequestData = function (key) {
                return key ? queryObj[key] : queryObj;
            }
            return key ? queryObj[key] : queryObj;
        },

        // 支付处理 
        bookingCheck: function (param, callBack) {
            param && paymentThirdModel.setParam(param);
            paymentThirdModel.excute(function (data) {
                var error = false;
                callBack && callBack(error, data)
            }, function (error) {
                callBack && callBack(error);
            });
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
            var url = 'orderresults?rc=1&type=flight&orderid=' + orderid;
            console.log(url);
            view.forward(url);
        },
        // 绑定成功
        paySuccess: function (view, data) {
            if (data.result == 0) {
                var backURL = dataHelper.getRequestData("backUrl");
                console.log(backURL);
                viewHelper.jumpToPay(view, data);
            } else {
                viewHelper.requestError(view, data);
            }
        },
        // 第二次跳轉至支付頁面
        jumpToPay: function (view, data) {
            var resultData = flightBookingResultStore.get() || {};
            var queryObj = dataHelper.getRequestData();
            var backURL = queryObj.backUrl;
            backURL = decodeURIComponent(backURL);
            var auth = userStore.getUser().Auth;
            var orderid = dataHelper.getRequestData('orderID');
            var tsback = location.origin + '/webapp/flight/#orderresults?rc=0&type=flight&orderid=' + orderid;
            var tpback = location.origin + '/webapp/flight/#orderresults?rc=2&type=flight&orderid=' + orderid;
            var requestData = new utility.QueryStringBuilder();
            requestData.set('saveID', queryObj.saveID);
            requestData.set('orderID', queryObj.orderID);
            requestData.set('billNo', queryObj.billNo);
            requestData.set('externalNo', queryObj.externalNo);
            requestData.set('errorCode', queryObj.errorCode);
            requestData.set('auth', auth);
            requestData.set('tsBack', tsback);
            requestData.set('tpBack', tpback);
            backURL += '&' + requestData.toString();
            console.log(backURL);
            view.jump(backURL);
        }
    };

    var View = BasePageView.extend({
        pageid: '',
        onCreate: function () {
        },
        onLoad: function () {
            var self = this;
            self.showLoading();
            // 获取支付请求参数
            var queryObj = dataHelper.getRequestData();
            var requestParams = {
                optype: 1,
                orderinfo: {
                    eno: queryObj.externalNo,
                    oid: queryObj.orderID
                },
                btype: 101,
                ver: 0,
                payetype: queryObj.payType

            };
            // 支付处理
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

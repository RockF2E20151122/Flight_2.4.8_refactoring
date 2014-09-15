/// <summary>
/// 机票订单提交结果页 creator:caofu; createtime:2013-07-23
/// </summary>
define(['cSales', 'libs', 'c', 'CommonStore', 'FlightStore', 'FlightModel', 'CPageModel', 'CPageStore', buildViewTemplatesPath('orderresults.html')], function (cSales, libs, c, CommonStore, FlightStore, FlightModels, CPageModel, CPageStore, html) {
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
    userStore = CommonStore.UserStore.getInstance(), //用户信息
    
    XiaoMiModel = FlightModels.XiaoMiModel.getInstance();
    //建行
    var flightCCBStore = FlightStore.FlightCCBStore.getInstance();

    var salesStore = CommonStore.SalesObjectStore.getInstance();
    var flightBookingResultStore = FlightStore.FlightBookingResultStore.getInstance();
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
            //更新电话号码
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
            // orderDetailStore.remove();
            orderListStore.remove();
            this.hideLoading();
            if ($('#headerview').length > 0) {
                $('#headerview').show();
            }
        },
        render: function () {

            //--------------清理store-----------//
            selFlightInfoStore.remove();
            //  需要记住联系方式
            var contact = flightOrderStore.getAttr('contact');
            flightOrderStore.remove();
            flightOrderStore.setAttr('contact', contact);

            flightDetailsStore.remove();
            airportDeliveryStore.remove();
            selfAddressStore.remove();
            returnPageStore.remove();
            orderDetailStore.remove();
            //--------------清理store-----------//


            //--------------渲染模板------------------------//
            this.$el.html(this.tpl);
            this.elsBox = {
                infobox_tpl: this.$el.find('#infotpl'), //模板

                infobox_box: this.$el.find('#infobox')//模板容器
            };
            this.infoboxtplfun = _.template(this.elsBox.infobox_tpl.html());
            //--------------渲染模板------------------------//

        },
        updatePage: function (callback) {

            userInfo = userStore ? userStore.getUser() : null;

            var _sales = salesStore.get();
            if (_sales && _sales.sid && (+_sales.sid == 1575 || +_sales.sid == 1867)) {
                this.$el.find('#js_home').hide();
                this.$el.find('#footer').hide();
                if (this.footer)
                    this.footer.hide();
                this.hasAd = false;
            }


            var masterOid = parseInt(this.getQuery('orderid')); //(主)订单号
            var rc = this.getQuery('rc'); // 订单结果
            
            var ErrorCode = this.getQuery('ErrorCode');
            if (ErrorCode && ErrorCode > 0) {
                rc = ErrorCode;
                if (this.getQuery('ErrorMessage')) {
                    data.errorMsg = this.getQuery('ErrorMessage');
                }
            }

            var data = flightBookingResultStore.get() || {};
            data.rc = rc;
            data.orderId = masterOid;

          //推送小米接口
          if(data.rc == 0) {
            //如果是小米登录，则传入token、mac_key、url
            var _sales = JSON.parse(window.localStorage.getItem('SALES')),   //获取sale store
                requestParams = {};
            if(_sales && _sales['data'] && +parseInt(_sales['data'].sourceid) == 1575) {
              var XIAOMI_TOKEN = JSON.parse(window.localStorage.getItem('XIAOMI_TOKEN'));
              if(XIAOMI_TOKEN) {
                requestParams.appk = "5311722679795";
                requestParams.clid = "2882303761517226795";
                requestParams.actk = XIAOMI_TOKEN.access_token;
                requestParams.mcky = XIAOMI_TOKEN.mac_key;
                requestParams.oridurl = 'http://'+window.location.host + '/webapp/fltintl/#fltintlorderdetail?oid=';
                requestParams.orid = masterOid;
                requestParams.btype = 101;  //101是国内，102是国际
                XiaoMiModel.setParam(requestParams);

                XiaoMiModel.excute(function(data) {
                  console.log('xiaomi:', data);
                }, function(){

                }, this. false);

              }

            }



          }

            if (userInfo && userInfo.Auth && masterOid) {//登入用户（包含匿名登入）
                data.user = userInfo;
                data._sales = _sales;
                if (flightCCBStore.getAttr("isCCB")) {
                    data["isCCB"] = true;
                } else {
                    data["isCCB"] = false;
                }

                var price = data["amt"];//订单价格
                if (this.getQuery('price') && this.getQuery('price')>0) {
                    price = parseInt(this.getQuery('price'));
                    flightBookingResultStore.setAttr("amt", price);
                }
                data.price = price;

                var paytype = data["paytype"];
                if (this.getQuery('paytype') != null && this.getQuery('paytype')>0) {
                    paytype = this.getQuery('paytype');
                    flightBookingResultStore.setAttr("paytype", paytype);
                    data["paytype"] = paytype;
                }


                var order = {};
                for (var i = 0; i < data["orders"].length; i++) {
                    var o = data["orders"][i];
                    if (o["master"] && o["master"] == true) {
                        order = o;
                        break;
                    }
                }

                if (data["rebinf"] != null) {
                    var rebinf = data["rebinf"];
                    data.ext = rebinf["rebtcode"];
                    data.days = rebinf["rebtday"];

                    if (rebinf && rebinf["rebtday"] && +rebinf["rebtday"] > 0 && !userInfo.IsNonUser) {
                        var os = window.navigator.userAgent;
                        var app = 'http://weixin.qq.com/m';
                        if (os) {
                            os = os.toLowerCase();
                            if (os.indexOf('iphone') > -1 || os.indexOf('ios') > -1) { app = 'https://itunes.apple.com/cn/app/id414478124?mt=8&ls=1'; }
                        }
                        data.app = app;
                    }
                }
                var item = this.infoboxtplfun(data);
                this.elsBox.infobox_box.html(item);


            } else {//非登入，
                var self = this;
                if (rc == 0) {
                    this.showHeadWarning('订单完成', "您的订单已提交成功，请返回至我的携程进行订单查询", function () {
                        self.backAction(); this.hide();
                        returnPageStore.remove();
                        self.hideLoading();
                    });
                } else {
                    var item = this.infoboxtplfun(data);
                    this.elsBox.infobox_box.html(item);
                }
            }
            callback.call(this);
        },
        events: {
            'click #js_return': 'backAction', //返回
            'click #js_home': 'backHome', //返回首页
            'click .flight-icon-wxfx': 'rebateAction', //申请返现按钮
            'click .orderid': 'viewOrder', //查看订单详情
            'click #reg': 'regAction'//前往注册
        },
        backAction: function () {
            userInfo = userStore ? userStore.getUser() : null;
            if (userInfo && userInfo.IsNonUser) {
                userStore.remove();
            }
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
            } else if (flightCCBStore.getAttr("isCCB")) {
                this.jump('/webapp/mkt/ccb/');
            } else {
                this.jump('/html5/', true);
            }
        },
        rebateAction: function (e) {//返现
            var target = $(e.currentTarget);
            var data = flightBookingResultStore.get() || {};
            var rebinf = data["rebinf"];
            var self = this;
            //1.设置弹出框
            this.fxAlert = new c.ui.Alert({
                title: '返现提示',
                message: '1.在微信众查找“携程旅行网”加关注</br>2.在聊天输入框中输入验证码“' + rebinf["rebtcode"] + '”后发送',
                buttons: [
                     { text: '确定', click: function () { this.hide(); } },
                      { text: '去下载', click: function () {
                          var os = window.navigator.userAgent;
                          if (os) {
                              os = os.toLowerCase();
                              var androidAppstore = 'http://weixin.qq.com/m',
                             iosAppstore = 'https://itunes.apple.com/cn/app/id414478124?mt=8&ls=1';
                              if (os.indexOf('android') > -1) { this.hide(); self.jump(androidAppstore); }
                              else if (os.indexOf('iphone') > -1) { this.hide(); self.jump(iosAppstore) }
                              else { this.hide(); }

                          } else {
                              this.hide();
                          }
                      }
                      }
                ]
            });
            this.fxAlert.show();
        },
        viewOrder: function (e) {
            var orderid = $(e.currentTarget).attr('data-id');
            userInfo = userStore ? userStore.getUser() : null;
            if (orderid && userInfo && userInfo.Auth) {
                //记录用户选定的订单号及基本订单信息
                this.showLoading();
                var data = { Id: orderid, url: "/webapp/flight/index.html#orderresults?orderid=" + orderid };
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

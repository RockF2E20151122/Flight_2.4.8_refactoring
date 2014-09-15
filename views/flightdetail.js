/// <summary>
/// 机票详情页 creator:caofu; createtime:2013-07-23
/// </summary>
define(['libs', 'c', 'CommonStore', 'FlightStore', 'FlightModel', buildViewTemplatesPath('flightdetail.html')], function (libs, c, CommonStore, FlightStore, FlightModels, html) {
    var selFlightStore = FlightStore.FlightSelectedInfo.getInstance(), //获取用户选择的航班信息存储对象Storage
        flightDetailModel = FlightModels.FlightDetailModel.getInstance(), //航班详情数据Model
        flightDetailsStore = FlightStore.FlightDetailsStore.getInstance(), //获取航班详细信息Storage
        flightSearchStore = FlightStore.FlightSearchStore.getInstance(), //航班查询Storage
        selFlightInfoStore = FlightStore.FlightSelectedInfo.getInstance(), //用户选择的航班信息
        userStore = CommonStore.UserStore.getInstance(), //用户信息
        cbase = c.base;
    var View = c.view.extend({
        tpl: html,
        pageid: '212005',
        events: {
            'click #js_return': 'backAction' //返回订单填写页
        },
        render: function () {
            this.showLoading();
            this.$el.html(this.tpl);
            this.elsBox = {
                infobox_tpl: this.$el.find('#flightdetailtpl'), //航班详情模板
                infobox_box: this.$el.find('#flightInfo') //航班详情模板容器
            };
            this.infoboxtplfun = _.template(this.elsBox.infobox_tpl.html());
        },
        onCreate: function () {
            var flightSearchData = flightSearchStore ? flightSearchStore.get() : null; //获取Storage存储的航班查询条件
            if (!flightSearchData) {
                //未获取到用户选择的航班信息，则返回机票查询页
                this.forward('index', true);
                return;
            }
            var selFlightInfoData = selFlightStore ? selFlightStore.get() : null; //从Storage获取用户选择的航班信息
            if (!selFlightInfoData) {
                //若未获取到用户选择的航班信息及航班详情信息，则返回订单填写页
                this.forward('#bookinginfo');
                return;
            }
            this.render();
        },
        onShow: function () {
            //设置page title
            this.setTitle('携程旅行网手机触屏版-航班详情');
        },
        onLoad: function () {
            var selFlightInfoData = selFlightStore ? selFlightStore.get() : null; //从Storage获取用户选择的航班信息
            var flightSearchData = flightSearchStore ? flightSearchStore.get() : null; //获取Storage存储的航班查询条件
            if (!flightSearchData) {
                //未获取到用户选择的航班信息，则返回机票查询页
                this.forward('index', true);
                return;
            }
            if (!selFlightInfoData) {
                //若未获取到用户选择的航班信息及航班详情信息，则返回订单填写页
                this.forward('#bookinginfo');
                return;
            }
            userInfo = userStore ? userStore.getUser() : null;
            this.render();
            this.elsBox.infobox_box.empty();
            var items = [];
            var item1 =
                {
                    "aCtyCode": flightSearchData.items[0].aCtyCode, //到达城市三字码
                    "class": selFlightInfoData.depart.cabin.class, //去程舱位 - 大舱位;0:Y(经济舱);2:C(商务舱);3:F(头等舱)
                    "dCtyCode": flightSearchData.items[0].dCtyCode, //出发城市三字码
                    "dDate": selFlightInfoData.depart.flight.dTime, //出发时间
                    "flightNo": selFlightInfoData.depart.flight.flightNo, //去程航班号
                    "price": selFlightInfoData.depart.cabin.price, //去程航班舱位价格
                    "productType": selFlightInfoData.depart.cabin.productType, //产品类型
                    "subclass": selFlightInfoData.depart.cabin.subClass//产品类型
                };
            items.push(item1);
            var tripType = 1;
            //如果包含返程，则添加返程查询条件
            if (selFlightInfoData.arrive && selFlightInfoData.arrive.cabin && flightSearchData.tripType && (+flightSearchData.tripType) > 1) {
                tripType = 2;
                var item2 =
                {
                    "aCtyCode": flightSearchData.items[0].dCtyCode, //到达城市三字码
                    "class": selFlightInfoData.arrive.cabin.class, //去程舱位 - 大舱位;0:Y(经济舱);2:C(商务舱);3:F(头等舱)
                    "dCtyCode": flightSearchData.items[0].aCtyCode, //出发城市三字码
                    "dDate": selFlightInfoData.arrive.flight.dTime, //出发时间
                    "flightNo": selFlightInfoData.arrive.flight.flightNo, //去程航班号
                    "price": selFlightInfoData.arrive.cabin.price, //去程航班舱位价格
                    "productType": selFlightInfoData.arrive.cabin.productType, //产品类型
                    "subclass": selFlightInfoData.arrive.cabin.subClass//产品类型
                };
                items.push(item2);
            }
            flightDetailModel.setParam('items', items);
            flightDetailModel.setParam('ticketIssueCty', flightSearchData.ticketIssueCty);
            flightDetailModel.setParam('tripType', tripType); //查询类型，单程或者往返
            flightDetailModel.getHead().setAttr('auth', '');
            if (userInfo) {
                if (userInfo.VipGrade) {
                    flightDetailModel.setParam('ugrade', userInfo.VipGrade);
                }
                if (userInfo.Auth) {
                    flightDetailModel.getHead().setAttr('auth', userInfo.Auth);
                }
            }
            flightDetailModel.setParam('ver', 0);
            this.updatePage(function () {
                this.hideLoading();
            });
            this.turning();
        },
        updatePage: function (callback) {
            //1.绑定航班信息
            this.getFlightDetail();
            //this.elsBox.infobox_box.html(this.infoboxtplfun(selFlightInfoData));
            callback.call(this);
        },
        backAction: function () {
            this.forward('#bookinginfo');
        },
        getFlightDetail: function () {
            //获取航班详细信息
            flightDetailModel.excute(function (data) {
                this.hideLoading();
                if (!data) {
                    this.showMessage('抱歉，数据加载失败，请重试!');
                    return;
                }
                this.appendList(data);
            }, function (err) {
                //this.showMessage((err.msg ? err.msg : '啊哦,数据加载出错了!'));
                var msg = err.msg ? err.msg : '啊哦,数据加载出错了!';
                var self = this;
                this.showHeadWarning('航班详情', msg, function () {
                    self.backAction();
                });
                this.hideLoading();
            }, false, this);
        },
        appendList: function (data) {
            //模板数据渲染
            var flightDetailsData = flightDetailsStore.get();
            data.cDate = cbase.Date;
            data.flightSearch = flightSearchStore.get().items[0];
            var selFlightInfoData = selFlightInfoStore.get(); //获取Storage存储的用户选择的航班
            data.selectedFlight = selFlightInfoData;
            flightDetailsData = data;
            var item = this.infoboxtplfun(data);
            this.elsBox.infobox_box.html(item);
            this.hideLoading();
        }
    });
    return View;
});
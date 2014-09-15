/// <summary>
/// 机票订单填写 creator:caofu; createtime:2013-07-23
/// </summary>
define(['cSales', 'cWidgetMember', 'vFlightInfo', 'vPassenger', 'vVouchers', 'vPayment', 'vOrder',
     //add by rhhu
    'vInsurance',
    //add by rhhu
    'vTravelPackages',
    'vDataControl', 'widgetHidden',
    'libs', 'c', 'cUI', 'MultipleScrollList', 'adLoad',
    'CommonStore', 'flight/utility/utility', 'FlightStore', 'FlightModel', 'CPageModel',
    'CPageStore', 'InvoiceStore', buildViewTemplatesPath('../modules/bookingInfo/templates/index.html'), 'cUtilityCrypt',
    'cWidgetFactory', 'relationship', 'cWidgetCalendar'/*, '../debug/console'*/],

    function (cSales, cWidgetMember, vFlightInfo, vPassenger, vVouchers, vPayment, vOrder, vInsurance, vTravelPackages,
        vDataControl, widgetHidden,
        libs, c, cUI, MultipleScrollList, MyLoad,
        CommonStore, Futility, FlightStore, FlightModels, CPageModel,
        CPageStore, InvoiceStore, html, Crypt,
        WidgetFactory, relationship, cWidgetCalendar/*, console*/) {

        window.__isRequireBookininfoSucc = true;
        var Member = WidgetFactory.create('Member');
        var View;
        var flightDetailModel = FlightModels.FlightDetailModel.getInstance(), //航班详情数据Model
            flightSearchStore = FlightStore.FlightSearchStore.getInstance(), //航班查询Storage
            flightDetailsStore = FlightStore.FlightDetailsStore.getInstance(), //获取航班详细信息Storage

           selFlightInfoStore = FlightStore.FlightSelectedInfo.getInstance(), //用户选择的航班信息
            passengerQueryStore = CPageStore.passengerQueryStore.getInstance(), //用户选择的乘机人
            passengerEditModel = CPageModel.passengerEditModel.getInstance(),
            passengerEditStore = CPageStore.passengerEditStore.getInstance(), //设置需要修改的乘机人Storage
            isBookingEditStore = CPageStore.isBookingEditStore.getInstance(), //是否booking页内是否可编辑常旅
            postCityStore = CPageStore.PostCityStore.getInstance(),
            postCityModel = CPageModel.PostCityModel.getInstance(),
            flightOrderStore = FlightStore.FlightOrderInfoStore.getInstance(), //航班订单信息Storage
            flightOrderSumbitModel = FlightModels.FlightOrderSumbitModel.getInstance(), //订单数据Model
            flightDeliveryStore = FlightStore.FlightPickTicketSelectStore.getInstance(), //航班订单配送信息Storage
            postAddressStorage = CPageStore.CustomerAddrStore.getInstance(), //航班订单邮寄配送信息Storage
            airportDeliveryStore = FlightStore.zqInAirportDateAndAddressStore.getInstance(), //航班订单机场自取配送信息Storage
            userStore = CommonStore.UserStore.getInstance(), //用户信息
            userInfo = userStore ? userStore.getUser() : null,
            salesStore = CommonStore.SalesObjectStore.getInstance(),
            unionStore = CommonStore.UnionStore.getInstance(),
            cbase = c.base,
            passPageTypeStore = CPageStore.passPageTypeStore.getInstance(),
            passengerQueryModel = CPageModel.passengerQueryModel.getInstance(),
            flightListStore = FlightStore.FlightListStore.getInstance(),
            addrListModel = CPageModel.CustomerAddrQueryModel.getInstance(),
            addrListStore = CPageStore.CustomerAddrListStore.getInstance(),
            addressStore = CPageStore.AddressStore.getInstance(),
            Calendar = WidgetFactory.create('Calendar'),
            Guider = WidgetFactory.create('Guider'),
            flightPickTicketModel = FlightModels.FlightPickTicketModel.getInstance(), //配送方式请求
            flightPickTicketStore = FlightStore.FlightPickTicketStore.getInstance(), //配送方式请求返回数据的store
            addrOprModel = CPageModel.CustomerAddrEditModel.getInstance(), //常用地址编辑model
            zqInAirportSelectStore = FlightStore.zqInAirportSelectStore.getInstance(),
            selAddrStore = CPageStore.SelectAddrStore.getInstance(), //选择省市Store
            cabinParamStore = FlightStore.FlightCabinParamStore.getInstance(), //所选的机票信息，用于查询舱位
            cabinStore = FlightStore.FlightCabinStore.getInstance(), //舱位信息
            orderCreateStore = FlightStore.OrderCreateStore.getInstance(),  //创建订单后保存信息store
            invoiceURLStore = InvoiceStore.InvoiceURLStore.getInstance(),
            invoiceTitleStore = InvoiceStore.Flight_InvoiceTitle.getInstance(),    //调用发票公共选取返回抬头的store
            _this = null,
            mask = null,
            globalMask = null,
            invoice_switch = null,
            coupons_switch = null, // 消费券启用开关
            flightOrderCreateModel = FlightModels.FlightOrderCreateModel.getInstance(),
            customerCouponModel = FlightModels.CustomerCouponModel.getInstance(),
            customerCouponStore = FlightStore.CustomerCouponStore.getInstance(),
            RepeatOrderCheckModel = FlightModels.RepeatOrderCheckModel.getInstance(),       //重复订单model
            repeatOrderCheckStore = FlightStore.RepeatOrderCheckStore.getInstance(),        //重复订单store 
            addrCheckModel = FlightModels.AddrCheckModel.getInstance(), //重复地址免费查询
            UBTKey = "h5.flt.booking",
            packageSelectStore = FlightStore.PackageSelectStore.getInstance(),
            mdTransStore = FlightStore.MdTransStore.getInstance(),
            mdStore = FlightStore.MdBookingStore.getInstance(),
            ShowLoginStore = CPageStore.ShowLoginStore.getInstance();

        //发票缓存(add by rhhu)
        var flightOrderInfoInviceStore = FlightStore.FlightOrderInfoInviceStore.getInstance();
        var flightBookingResultStore = FlightStore.FlightBookingResultStore.getInstance();

        //建行合作临时存放
        var flightCCBStore = FlightStore.FlightCCBStore.getInstance();
        var myLoad = new MyLoad();                                       //don't move into child modules
        var Mask = new c.base.Class(c.ui.Layer, {
            __propertys__: function () {
                var self = this;
                this.contentDom;
                this.mask = new c.ui.Mask();
                this.mask.addEvent('onShow', function () {
                    $(window).bind('resize', this.onResize);
                    this.onResize();
                    var scope = this;
                    this.root.bind('click', function () {
                        scope.hide();
                        scope.root.unbind('click');
                        self.hide();
                    });

                });
            },
            initialize: function ($super, opts) {
                $super({
                    onCreate: function () { },
                    onShow: function () {
                        for (var k in opts) this[k] = opts[k];
                        this.mask.show();
                        this.setzIndexTop();
                        if (typeof this.html == 'string') this.html = $(this.html);
                        this.contentDom.html(this.html);
                        if (this.closeDom) {
                            this.contentDom.find(this.closeDom).on('click', function () {
                                mask && mask.hide();
                            });
                        }
                    },
                    onHide: function () {
                        this.mask && this.mask.hide();
                    }
                });

            }
        });
        View = c.view.extend({
            pageid: '214279',
            tpl: html,
            vFlightInfo: null,
            vPassenger: null,
            vVouchers: null,
            vPayment: null,
            vOrder: null,

            //add by rhhu
            vInsurance: null,
            //add by rhhu
            vTravelPackages: null,

            render: function () {
                this.showLoading();
                this.$el.html(this.tpl);
                this.elsBox = {
                    infobox_box: this.$el.find('#flightInfo'), //航班详情模板容器
                    insure_tpl: this.$el.find('#insure_tpl'), //保险模板
                    insure_box: this.$el.find('#insure'), //保险模板容器
                    coupons_tpl: this.$el.find('#couponstpl'), //消费券模板
                    coupons_box: this.$el.find('#couponsbox'), //消费券容器
                    pay_tpl: this.$el.find('#paytpl'), //支付信息模板
                    pay_box: this.$el.find('#paybox'), //支付信息容器
                    hfb_tpl: this.$el.find('#hfbtpl'), //惠飞保信息模板
                    hfb_box: this.$el.find('#hfb_box'), //惠飞保信息容器
                    delivery_tpl: this.$el.find("#deliverytpl"), //配送方式模板
                    delivery_box: this.$el.find("#deliverybox"), //配送方式容器
                    deliverytpl_tab: this.$el.find("#deliverytpl_tab"), // 配送方式选项
                    deliverytpl_mail_1: this.$el.find("#deliverytpl_mail_1"), // 无常用地址时的模板
                    deliverytpl_mail_2: this.$el.find("#deliverytpl_mail_2"), // 有常用地址时候的模板
                    deliverytpl_zq: this.$el.find("#deliverytpl_zq"), // 机场自取的模板
                    lxtc_box: this.$el.find('#lxtc_box'), //旅行套餐模版容器
                    lxtc_tpl: this.$el.find('#lxtctpl'), //旅行套餐的模版
                    notice_box: this.$el.find('#notice_box'), //国内公告模版容器
                    notice_tpl: this.$el.find('#notice_tpl'), //国内公告模版
                    package_tpl: this.$el.find("#packageTmp"), //套餐二选一模板
                    package_box: this.$el.find("#package"),//套餐二选容器
                    error_tips: this.$el.find('.error-tips'), // 错误提示信息
                    orderDetail: this.$el.find("#order-detail"),
                    orderDetail_tpl: this.$el.find("#order-detail-tpl"),
                };
                this.couponstplfun = _.template(this.elsBox.coupons_tpl.html());
                // this.lxtctplfun = _.template(this.elsBox.lxtc_tpl.html());
                this.noticetplfun = _.template(this.elsBox.notice_tpl.html());
                this.paytplfun = _.template(this.elsBox.pay_tpl.html());
                this.packagefun = _.template(this.elsBox.package_tpl.html());
                this.orderDetailtplfun = _.template(this.elsBox.orderDetail_tpl.html());
            },
            stores: {
                flightSearchStore: flightSearchStore,               //航班查询Storage
                flightDetailsStore: flightDetailsStore,             //获取航班详细信息Storage
                selFlightInfoStore: selFlightInfoStore,             //用户选择的航班信息
                passengerQueryStore: passengerQueryStore,           //用户选择的乘机人
                passengerEditStore: passengerEditStore,             //设置需要修改的乘机人Storage
                isBookingEditStore: isBookingEditStore,             //是否booking页内是否可编辑常旅
                postCityStore: postCityStore,
                flightOrderStore: flightOrderStore,                 //航班订单信息Storage
                flightDeliveryStore: flightDeliveryStore,           //航班订单配送信息Storage
                flightOrderInfoInviceStore: flightOrderInfoInviceStore,           //机票发票store
                postAddressStorage: postAddressStorage,             //航班订单邮寄配送信息Storage
                airportDeliveryStore: airportDeliveryStore,         //航班订单机场自取配送信息Storage
                userStore: userStore,                               //用户信息
                salesStore: salesStore,
                unionStore: unionStore,
                passPageTypeStore: passPageTypeStore,
                flightListStore: flightListStore,
                addrListStore: addrListStore,
                addressStore: addressStore,
                flightPickTicketStore: flightPickTicketStore,       //配送方式请求返回数据的store
                zqInAirportSelectStore: zqInAirportSelectStore,
                selAddrStore: selAddrStore,                         //选择省市Store
                cabinParamStore: cabinParamStore,                   //所选的机票信息，用于查询舱位
                cabinStore: cabinStore,                             //舱位信息
                orderCreateStore: orderCreateStore,                 //创建订单后保存信息store
                invoiceURLStore: invoiceURLStore,
                invoiceTitleStore: invoiceTitleStore,               //调用发票公共选取返回抬头的store
                customerCouponStore: customerCouponStore,
                repeatOrderCheckStore: repeatOrderCheckStore,        //重复订单store 
                packageSelectStore: packageSelectStore,
                mdTransStore: mdTransStore,
                mdStore: mdStore,
                ShowLoginStore: ShowLoginStore
            },
            models: {
                flightOrderCreateModel: flightOrderCreateModel,
                flightDetailModel: flightDetailModel,               //航班详情数据Model
                passengerEditModel: passengerEditModel,
                postCityModel: postCityModel,
                flightOrderSumbitModel: flightOrderSumbitModel,     //订单数据Model
                passengerQueryModel: passengerQueryModel,
                addrListModel: addrListModel,
                flightPickTicketModel: flightPickTicketModel,       //配送方式请求
                addrOprModel: addrOprModel,                         //常用地址编辑model
                customerCouponModel: customerCouponModel,
                RepeatOrderCheckModel: RepeatOrderCheckModel,       //重复订单model
                addrCheckModel: addrCheckModel,                     //重复地址免费查询
            },
            events: {
                'click #js_return': 'backAction', //返回列表页
                'click div[data-rbtType]': 'showRebate', //插烂返现说明
                'click #paybtn .j_btn': 'beforePayAction', //提交订单                        //flightDetailsStore, passengerQueryStore, mdStore, postAddressStorage, userStore, flightDeliveryStore
                //'click .flight-loginline': 'bookLogin', //登录
                'input #linkTel': 'setContact', //保存用户输入的联系人 
                'click #addPassenger .flight-labq': 'readmeAction',//姓名帮助
                'click .jsDelivery': 'selDelivery', //选择配送方式
                'click #jsViewCoupons': 'viewCoupons', //查看消费券使用说明                                                  //flightDetailsStore
                'click .j_refundPolicy': 'fanBoxAction', //查看返现信息
                //'click .flight-bkinfo-tgq .f-r': 'tgBoxAction', //查看退改签
                'click .js_del_tab': 'showDelListUI', //配送方式
                //            'click .js_del_cost .flight-psf i': 'selectPaymentType', // 选择快递费用方式
                'click #js_addrList': 'AddrListAction', //选择地址
                'click #date-picker': 'calendarAction', //取票日期                                                                    //airportDeliveryStore
                'click #done-address': 'zqinairselect', //取票柜台
                'click #selectCity': 'selectCityAction', //选择城市
                'click #date-zqtime': 'showZqTimeUI', //取票时间                                                                        //airportDeliveryStore
                'click #jsinsure': 'viewInsure', //保险说明
                'change #js_invoice_title': 'inTitleChangeWrp', //发票抬头更改                // userStore, flightOrderInfoInviceStore, flightOrderStore    //don't move outside
                'click .flight-icon-arrrht': 'showinTitleList', //‘+’号，跳转发票抬头列表                 //userStore, invoiceURLStore

                'focusout #linkTel': 'telInputFinish',
                'touchstart input': 'touchStartAction', // 处理Android手机上点击不灵敏问题
                'click #package .flight-arrrht': 'packageSelect',
                'focusin input': 'hideErrorTips',
                'click .j_PackageNotice': 'toggletips',
                'click .j_AnnouncementNotice': 'toggleNotice',
                'click #travalPackageDesc': 'forwardToTravalPackage',       //don't move into child modules
                'click #paybtn': 'orderDetailAction'
            },
            onCreate: function () {
                _this = this;
                var selFlightInfoData = selFlightInfoStore.get();
                var flightSearchData = flightSearchStore.get(); //获取Storage存储的航班查询条件
                // flightOrderStore.setAttr('auth',userInfo.Auth); //将用户标识加入订单填写信息store
                this.render();

                this.$el.on('focus', 'input', function () {
                    _this.$el.find('.js_fixed').addClass('pos-rl');
                    $('.flight-header-blank').hide();  //暂时解决未登录占位符，input  focus时样式不对
                }).on('focusout', 'input', function () {
                    _this.$el.find('.js_fixed').removeClass('pos-rl');
                    $('.flight-header-blank').show(); //暂时解决未登录占位符，input  focus时样式不对
                });
            },
            onLoad: function (prevPage) {

                DataControl = (typeof DataControl === 'undefined') ? new vDataControl(this) : DataControl;
                //get all of child views:
                var commonArgus = {
                    viewPort: this.$el,
                    parentView: this
                };
                this.vFlightInfo = this.vFlightInfo || new vFlightInfo(_.extend({}, commonArgus, {
                    personalArgu: 'vFlightInfo'
                }));
                this.vPassenger = this.vPassenger || new vPassenger(_.extend({}, commonArgus, {
                    personalArgu: 'vPassenger'
                }));
                this.vVouchers = this.vVouchers || new vVouchers(_.extend({}, commonArgus, {
                    personalArgu: 'vVouchers'
                }));
                //add by rhhu
                this.vInsurance = this.vInsurance || new vInsurance(_.extend({}, commonArgus, {
                    personalArgu: 'vInsurance'
                }));
                //add by rhhu
                this.vTravelPackages = this.vTravelPackages || new vTravelPackages(_.extend({}, commonArgus, {
                    personalArgu: 'vTravelPackages'
                }));
                //埋点类
                this.widgetHidden = this.widgetHidden || new widgetHidden(_.extend({}, commonArgus, {
                    personalArgu: 'vHidden'
                }));

                this.vPayment = this.vPayment || new vPayment(_.extend({}, commonArgus, {
                    personalArgu: 'vPayment'
                }));
                this.vOrder = this.vOrder || new vOrder(_.extend({}, commonArgus, {
                    personalArgu: 'vOrder'
                }));

                this.fireInterfaceEvents();
                var _this = this;
                _this.turning();
                if (this.vFlightInfo.render()) {
                    return;
                }


                this.widgetHidden.onLoad();             //埋点，获取列表页的部分信息
                _this.showLoading();
                if (!_this.uid) {
                    if (userStore.isLogin()) {
                        var user = userStore.getUser();
                        _this.uid = user.UserID;
                    } else {
                        _this.uid = c.utility.getGuid();
                    }
                };
                //营销查询              XXXX
                if (!this.SEOQuery()) {
                    this.forward("#index");
                    return;
                }
                //flightinfo
                var marketSearch = function (selFlightInfoStore, flightSearchStore, flightDetailModel, salesStore, cbase, userStore, _this) {
                    var selFlightInfoData = selFlightInfoStore.get(),
                        flightSearchData = flightSearchStore.get(); //获取Storage存储的航班查询条件
                    if (!selFlightInfoData || !flightSearchData || !flightSearchData.items) {
                        //未获取到用户选择的航班信息，则返回机票查询页
                        _this.hideLoading(); //非渲染
                        _this.showAlert();
                        return false;
                    }

                    var tripType = 1;
                    var prdid = selFlightInfoData.depart.cabin.pid;
                    if (selFlightInfoData.arrive && selFlightInfoData.arrive.cabin && flightSearchData.tripType && (+flightSearchData.tripType) > 1) {
                        tripType = 2;
                        prdid = selFlightInfoData.depart.cabin.pid + "," + selFlightInfoData.arrive.cabin.pid;
                    }
                    flightDetailModel.setParam("prdid", prdid);
                    flightDetailModel.setParam('polid', '0');
                    flightDetailModel.setParam('triptype', tripType); //查询类型，单程或者往返
                }(selFlightInfoStore, flightSearchStore, flightDetailModel, salesStore, cbase, userStore, _this);

                var fn01 = function (userStore, flightDetailModel, flightDeliveryStore, selFlightInfoStore, flightSearchStore) {
                    var userInfo = userStore.getUser();
                    if (userInfo) {
                        if (userInfo.VipGrade) {
                            flightDetailModel.setParam('ugrade', userInfo.VipGrade);
                        }
                        if (userInfo.Auth) {
                            flightDetailModel.getHead().setAttr('auth', userInfo.Auth);
                        }
                    }
                    flightDetailModel.setParam('ver', 0);
                    var flightDeliveryData = flightDeliveryStore.get() || { type: 1 };

                    _this.updateDelList(function () {
                        _this.updatePage(function () {
                            //_this.hideLoading();

                            //                    _this.turning();
                            _this.$el.parents("body").find("#dl_app").hide();  // 强行将底部广告隐藏 add by mmx

                            //从订单列表页或详细页过来则显示重复订单
                            if (prevPage == "flightorderdetail" || prevPage == "flightorderlist") {
                                _this.repeatAlert && _this.repeatAlert.show();
                            }

                        });
                    }, selFlightInfoStore, flightSearchStore);
                }(userStore, flightDetailModel, flightDeliveryStore, selFlightInfoStore, flightSearchStore);

                // 重复订单提示
                var tips = function (localStorage, repeatOrderCheckStore, _this) {
                    var repeatOrderAlert = localStorage.getItem('__REPEAT_ORDER');
                    var repeatOrderInfo = repeatOrderCheckStore.get();

                    if (repeatOrderAlert == 'true' && repeatOrderInfo) {
                        var msg = repeatOrderInfo.msg;
                        var repeatOrder = repeatOrderInfo.repeatOrder;
                        _this.repeatAlert = new c.ui.Alert({
                            title: '重复订单提醒',
                            message: msg,
                            buttons: [
                                 {
                                     text: '取消',
                                     click: function () {
                                         this.hide();
                                         localStorage.setItem('__REPEAT_ORDER', false);
                                         repeatOrderCheckStore.remove();
                                     }
                                 },
                                {
                                    text: '查看订单',
                                    click: function () {
                                        //有多个重复订单时
                                        if (repeatOrder && repeatOrder.length > 1) {
                                            _this.jump("/webapp/myctrip/#orders/flightorderlist?from=" + encodeURIComponent('/webapp/flight/#bookinginfo'));
                                        } else {
                                            _this.jump("/webapp/flight/#flightorderdetail?from=" + encodeURIComponent('/webapp/flight/#bookinginfo') + "&&oid=" + repeatOrder[0]);
                                        }
                                        this.hide();
                                        localStorage.setItem('__REPEAT_ORDER', true);
                                        // console.log(repeatOrder)
                                    }
                                },
                                {
                                    text: '继续预订',
                                    click: function () {
                                        this.hide();
                                        _this.isRepeatOrder = true;
                                        _this.payAction();
                                        localStorage.setItem('__REPEAT_ORDER', false);
                                        repeatOrderCheckStore.remove();
                                    }
                                }
                            ]
                        });
                        _this.repeatAlert.show();
                    }
                }(localStorage, repeatOrderCheckStore, _this);

                this.getSalesObj(CommonStore);

                //建行
                var fnBankJh = function (flightCCBStore, _this) {
                    if (flightCCBStore.getAttr("isCCB")) {
                        _this.$el.find("#js_flight-top").hide();
                        _this.$el.find(".flight-loginline-fixed").hide();
                        _this.$el.find(".flight-loginline").hide();
                    }
                }(flightCCBStore, _this);
            },
            SEOQuery: function () {
                //获取url参数
                var dcity = this.getQuery('dcity'),
                    acity = this.getQuery('acity'),
                    ddate = this.getQuery('ddate'),
                    flight = this.getQuery('flight'),
                    vclass = this.getQuery('class'),
                    subclass = this.getQuery('subclass'),
                    price = this.getQuery('price'),
                    producttype = +this.getQuery('producttype') || 0,
                    allianceid = this.getQuery('allianceid'),
                    ouid = this.getQuery('ouid'),
                    sid = this.getQuery('sid'),
                    date = this.getServerDate(),
                    dateStr = date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate();

                //判断参数是否符合要求
                if (!dcity || dcity === true || !acity || acity === true || !ddate || ddate === true || !flight || flight === true || !vclass || vclass === true || !subclass || subclass === true || !price || price === true || !producttype || (c.base.Date.parse(ddate).valueOf() < c.base.Date.parse(dateStr).valueOf())) {
                    return false;
                }
                //参数符合规则
                //ddate = c.base.Date.format(ddate, 'Y/m/d');
                //判断是否包含分销联盟参数
                if (allianceid && allianceid != true && sid && sid != true && +allianceid > 0 && +sid > 0) {
                    if (!ouid || ouid == true) {
                        ouid = '';
                    }
                    unionStore.set({
                        'AllianceID': allianceid,
                        'OUID': ouid,
                        'SID': sid
                    });
                }
                // NA = 0 = (未定义); Normal = 1 = (普通); SingleTrip = 2 = (提前预售); RoundTrip = 3 = (往返特打包); AirHotel = 4 = (特机); Corperation = 5 = (商旅); OPRound = 6 = (往返折上折); OPSingle = 7 = (单程折上折产品, 直减); OLDMAN = 8 = (老年特); YOUNGMAN = 9 = (青年特); Transit = 10 = (中转联程); SingleRule = 11 = (规则运价)
                switch (producttype) {
                    case 0:
                        producttype = "NA";
                        break;
                    case 1:
                        producttype = "Normal";
                        break;
                    case 2:
                        producttype = "SingleTrip";
                        break;
                    case 3:
                        producttype = "RoundTrip";
                        break;
                    case 4:
                        producttype = "AirHotel";
                        break;
                    case 5:
                        producttype = "Corperation";
                        break;
                    case 6:
                        producttype = "OPRound";
                        break;
                    case 7:
                        producttype = "OPSingle";
                        break;
                    case 8:
                        producttype = "OLDMAN";
                        break;
                    case 9:
                        producttype = "YOUNGMAN";
                        break;
                    case 10:
                        producttype = "Transit";
                        break;
                    case 11:
                        producttype = "SingleRule";
                        break;
                }
                //拼接地址栏参数
                var pid = {
                    "fno": flight.toUpperCase(), //去程航班号
                    "ddate": ddate, //出发时间
                    "dcity": dcity.toUpperCase(), //出发城市三字码
                    "acity": acity.toUpperCase(), //到达城市三字码
                    "pty": producttype, //产品类型
                    "grade": subclass.toUpperCase(), //去程舱位 - 大舱位;0:Y(经济舱);2:C(商务舱);3:F(头等舱)，
                    "price": +price, //去程航班舱位价格
                    "rebate": 0, //返现价格
                    "stype": null,
                    "cut": 1,
                    "flag": 0
                };
                selFlightInfoStore.setAttr("depart",
                    {
                        cabin: {
                            pid: JSON.stringify(pid)
                        },
                        rebateAmt: 0
                    });

                return true;
            },
            EVENTS: {
                DETAILCOMPLETE: 'flightDetailComplete',
                PASSENGERSCOMPLETE: 'passengersComplete',
                INSURANCERENDER: 'insuranceRender',
                SWITCHINSURETRIGGER: 'switchInsureTrigger',
                TOGGLEPACKAGEDESC: 'togglePackageDesc',
                UPDATEPACKAGETPL: 'updatePackageTpl',
                UPDATEORDERPRICE: 'updateOrderPrice',
                hasChildrenOrBaby: 'hasChildrenOrBaby'
            },
            hasChildrenOrBaby: function (p) {
                return this.vPassenger.hasChildrenOrBaby(p);
            },
            //personal events as below
            fireInterfaceEvents: function () {
                this.on(this.EVENTS.SWITCHINSURETRIGGER, this.switchInsure.bind(this));
                this.on(this.EVENTS.UPDATEORDERPRICE, this.updateOrderPrice.bind(this));
            },
            // 更新价格唯方法，其它方法均要废弃 重要！！！！！
            updateOrderPrice: function () {
                var orderPrice = this.vPayment[this.vPayment.EVENTS.ACCOUNTTOTALPRICE]();
                var $totalPrice = $('#paybox .fs');
                var totalPrice = $totalPrice.data('amt');

                $totalPrice.data('amt', orderPrice);
                $totalPrice.text(orderPrice > 0 ? orderPrice : '----');
            },

            //调用turning方法时触发
            onShow: function () {

                this.setTitle('机票预订');
            },
            getSalesObj: function (CommonStore) {
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
                    cSales.getSalesObject(sales || sourceid, $.proxy(function (data) {              //TODO: bug here, where is the cSales
                        cSales.replaceContent(self.$el);
                    }, this));
                }
            },
            onHide: function () {
                this.hideHeadWarning();
                this.hideLoading(); //非渲染
                if (!userStore.isLogin()) {
                    $("header").removeClass("pos-ab");
                }
                $('#flightBox').hide();
                $('#paybox').hide();
                myLoad.hide();
            },
            updatePage: function (callback) {           //can't be deleted ,used by vPassenger
                var that = this,
                    psgersData = {};

                DataControl.reqFlags.DETAIL = false;
                DataControl.reqFlags.PASSENGERS = false;
                DataControl.reqFlags.HASPASSENGER = false;
                DataControl.reqFlags.PASSENGERSFAIL = false;
                //1.绑定航班信息
                //发detail 请求 
                that.vFlightInfo[that.vFlightInfo.EVENTS.GETFLIGHTDETAIL](function (data) {
                    that.trigger(that.EVENTS.DETAILCOMPLETE, psgersData, data, DataControl.reqFlags);
                    DataControl.reqFlags.DETAIL = true;
                    callback && callback();
                    if (DataControl.reqFlags.PASSENGERS) {
                        _this.hideLoading();
                    }
                });

                //判断是否已登录，进行不同情况的页面展示
                var _this = this;
                if (userStore.isLogin()) {
                    this.UserID = userStore.getUser().UserID;
                    passengerQueryStore.setLifeTime('60M');
                    passengerQueryModel.setParam('UserId', this.UserID);
                    _this.showLoading();
                    passengerQueryModel.excute(function (data) {
                        that.trigger(that.EVENTS.PASSENGERSCOMPLETE, psgersData, data, DataControl.reqFlags);
                        DataControl.reqFlags.PASSENGERS = true;
                        if (DataControl.reqFlags.DETAIL) {
                            _this.hideLoading();
                        }
                    }, function (err) {
                        DataControl.reqFlags.PASSENGERSFAIL = true;
                        that.trigger(that.EVENTS.PASSENGERSCOMPLETE, psgersData, err, DataControl.reqFlags);
                        if (DataControl.reqFlags.DETAIL) {
                            _this.hideLoading();
                        }
                    }, false, this);
                } else {
                    this.UserID = this.UserID || c.utility.getGuid();
                    this.trigger(this.EVENTS.PASSENGERSCOMPLETE, psgersData, null, DataControl.reqFlags);
                    DataControl.reqFlags.PASSENGERS = true;
                    if (DataControl.reqFlags.DETAIL) {
                        _this.hideLoading();
                    }
                }

                var fn = function (userStore,
                flightOrderStore,
                passengerQueryStore,
                    flightCCBStore, _this) {
                    var userInfo = userStore.getUser();
                    //若用户已经登录且无联系人信息，用户信息中的姓名和电话绑定在联系人中
                    if (userInfo && userInfo.IsNonUser == false) {
                        _this.$el.find('#linkTel').val((userInfo.Mobile ? userInfo.Mobile : ""));
                    }
                    //常用联系人  XXXX
                    var flightOrderData = flightOrderStore.get();
                    if (flightOrderData && flightOrderData.contact) {
                        var contact = flightOrderData.contact;

                        if (contact.mphone && contact.mphone.trim().length > 0) {
                            _this.$el.find('#linkTel').val(contact.mphone.trim());
                        }
                    }

                    if (flightCCBStore.getAttr("isCCB")) {          //建行支持，荣华 seo
                        $(".flight-loginline").hide();
                    } else {
                        //if ($("#js_flight-top").length > 0) {       //
                        //    //顶部登录横条固定
                        //    $(window).scroll(function () {
                        //        var flightTop = $("#js_flight-top");
                        //        if (flightTop.length) {
                        //            var height1 = $("#js_flight-top").offset().top - $(window).scrollTop();
                        //            if (height1 <= 0) {
                        //                $(".flight-loginline-fixed").removeClass("pos-rl");
                        //            }
                        //            if (height1 > 0) {
                        //                $(".flight-loginline-fixed").addClass("pos-rl");
                        //            }
                        //        }
                        //    });
                        //}
                    }
                    //登录情况下头部固定
                    //if (!userStore.isLogin()) {
                    //    $("header").addClass("pos-ab");
                    //}
                }(userStore,
                flightOrderStore,
                passengerQueryStore,
                flightCCBStore, _this);
            },
            toggleNotice: function () {
                $('.j_AnnouncementNotice').toggleClass("flight-htauto");
                $('.j_AnnouncementNotice').children(".flight-arrdn5").toggleClass("flight-arrup5");
            },
            toggletips: function (e) {
                $('.j_PackageNotice').toggleClass("flight-htauto");
                $('.j_PackageNotice').children(".flight-arrdn3").toggleClass("flight-arrup3");
            },
            //don't move into child modules
            backAction: function (shareTrip) {
                var userInfo = userStore.getUser(),
                    flightDetailsData = flightDetailsStore.get(),
                    flightOrderData = flightOrderStore.get();
                //userStore、flightDetailsStore、flightOrderStore、mdStore、selAddrStore、passengerEditStore、airportDeliveryStore、
                //flightPickTicketStore、flightListStore :  these stores can not move into child modules
                flightOrderData = flightOrderData ? flightOrderData : {};
                //清除历史记录 保险信息，配送信息, 航班信息
                flightOrderStore.setAttr('delivery', null);
                flightOrderStore.setAttr('flightInfos', null);
                flightOrderStore.setAttr('insurance', null);
                flightOrderStore.setAttr('order', null);
                flightOrderStore.setAttr('selInsure', '1');

                var backUrl = '#list';
                if (shareTrip && +shareTrip > 0) {
                    if (flightDetailsData && flightDetailsData.items && flightDetailsData.items.length > 1) {
                        //判断是否包含共享航班
                        //表示去除包含共享航班，则返回去程列表页
                        backUrl = +shareTrip == 1 ? '#list' : "#backlist";
                    }
                    //移除保存的航班详情数据
                    flightDetailsStore.remove();
                    _this.back(backUrl);
                    try {
                        mdStore.setAttr('IsReturn', true);  //埋点IsReturn
                        this.widgetHidden.mdSubmit();
                    } catch (e) {
                        console.log('埋点', 'backAction()');
                    }
                    return;
                }
                this.backAlert = new c.ui.Alert({
                    title: '提示信息',
                    message: '您的订单尚未完成，确定要离开吗？',
                    buttons: [{
                        text: '取消',
                        click: function () {
                            this.hide();
                            try {
                                mdStore.setAttr('IsReturn', true); //埋点IsReturn
                            } catch (e) {
                                console.log('埋点', 'backAction()');
                            }
                        }
                    }, {
                        text: '确定',
                        click: function () {
                            this.hide();
                            //                        _this.showLoading();
                            //若是单程，则返回去程列表页
                            if (flightDetailsData && flightDetailsData.items && flightDetailsData.items.length > 1) {
                                backUrl = "#backlist";
                            }
                            _this.hideLoading(); //非渲染
                            selAddrStore.remove();
                            passengerEditStore.remove();
                            airportDeliveryStore.remove();
                            flightPickTicketStore.remove();

                            _this.repeatAlert = false;
                            setTimeout(function () {

                                if (!flightListStore.get() && window.localStorage.length === 3) {
                                    _this.back('index');
                                } else {
                                    _this.back(backUrl);
                                }
                                try {
                                    mdStore.setAttr('IsReturn', true);  //埋点IsReturn
                                    _this.widgetHidden.mdSubmit();
                                } catch (e) {
                                    console.log('埋点', 'backAction()');
                                }
                            }, 200);
                        }
                    }]
                });
                this.backAlert.show();
            },
            forwardToTravalPackage: function () {
                this.forward("#travalpackagesdesc");
            },
            bookLogin: function () {
                mdStore, flightOrderStore;

                mdStore.setAttr('IsClickLogin', true); //埋点IsClickLogin
                //若未登录，则点击按钮就进行登录
                flightOrderStore.setAttr('selInsure', '1');
                if (!userStore.isLogin()) {
                    this.showLoading();
                    Member.memberLogin({
                        param: "from=" + encodeURIComponent('/webapp/flight/#bookinginfo') + '&t=1',
                    });
                    //window.location.href = '/webapp/myctrip/#account/login?t=1&from=' + encodeURIComponent(this.getRoot() + '#bookinginfo');
                }
            },
            //this function should be a plugin.
            //passenger
            readmeAction: function () {         //common             //TODO:
                var html = [
                    '<div class="flight-windows">',
                    '<div class="flight-windows-hd">姓名填写说明<i class="flight-icon-close"></i></div>',
                    ' <div class="flight-windows-bd">',
                    ' <p>1）乘客姓名必须与登机时所用证件上的名字一致；持护照登机的外宾，须按护照上的顺序填写且不区分大小写。</p>',
                    ' <p>2）姓名中包含生僻字或者繁体字，请从生僻字开始之后的中文都用拼音代替，如：王喆敏，请填写”王zhemin"</p>',
                    ' <p>3）姓名过长时请使用缩写，如：”买买提不拉多娜萨日娜阿诺凡“ 简写为 ”买买提不拉多娜萨日娜阿“</p>',
                    '</div>',
                    '</div>'
                ].join('');
                html = $(html);

                if (!mask) {
                    mask = new Mask({
                        html: html, // 弹窗html
                        closeDom: '.flight-windows' // 弹窗关闭按钮
                    });
                }
                mask.show();

                //var html = [
                //    '<h4>姓名填写说明</h4>',
                //    '<div class="flight-mask-h4cnt">',
                //    '<p>1）乘客姓名必须与登机时所用证件上的名字一致；持护照登机的外宾，须按护照上的顺序填写且不区分大小写。</p>',
                //    '<p>2）姓名中包含生僻字或者繁体字，请从生僻字开始之后的中文都用拼音代替，如：王喆敏，请填写”王zhemin"</p>',
                //    '<p>3）姓名过长时请使用缩写，如：”买买提不拉多娜萨日娜阿诺凡“ 简写为 ”买买提不拉多娜萨日娜阿“</p>',
                //    '</div>'
                //].join('');

                //Futility.popUp(this.$el, html);
            },
            orderDetailAction: function (e) {
                var ticketsCnt = this.vPassenger.getTicketsCount(passengerQueryStore);
                var isPaybtn = $(e.target).hasClass('j_btn');
                if (View.isShowLoad || isPaybtn || (!ticketsCnt[0] && !ticketsCnt[1] && !ticketsCnt[2])) {
                    return;
                }
                // 组装相应数据结构用来渲染价格清单模板
                var flightDetailData = flightDetailsStore.get();
                var items = flightDetailsStore.getAttr('items');
                var selInsure = flightOrderStore.getAttr('selInsure');
                var insure_detail = this.$el.find('#insure_detail');
                var needDeliveryCost = !!(flightDeliveryStore.getAttr('type') == 32 && flightDeliveryStore.getAttr('paytype') == 2);
                var couponBalance = flightDetailsStore.getAttr('flightDetailsStore.setAttr');
                var user = userStore.getUser();
                var orderDetailData = {
                    items: flightDetailsStore.getAttr('items'),
                    ticketsCnt: ticketsCnt,
                    insurance: (selInsure && flightDetailData.insurances && flightDetailData.insurances.length) ? { amount: insure_detail.data('unitprice'), count: parseInt(insure_detail.data('pcount')) * parseInt(insure_detail.data('mininsure')) } : null,
                    delivery: needDeliveryCost ? { amount: 10, count: 1 } : null,
                    coupon: null,
                    reduce: null
                };
                var hideOrderDetail = function (evt) {
                    if (!$(evt.target).hasClass('j_orderDetails')) {
                        _this.elsBox.orderDetail.hide().html('');
                        $('#order-detail-mask').hide();
                        payBox.css('z-index', 999);
                        $('.j_orderDetails').removeClass('money-btn-detailon');
                    }
                };

                if (flightOrderStore.getAttr('selCoupons') && couponBalance && +couponBalance > 0 && user && user.IsNonUser == false && (+items[0].policy.rebateAmt > 0 || (items.length > 1 && +items[1].policy.rebateAmt > 0))) {
                    orderDetailData.coupon = { amount: parseInt(items[0].policy.rebateAmt), count: orderDetailData.ticketsCnt[0] };
                    orderDetailData.coupon += items.length > 1 ? parseInt(items[1].policy.rebateAmt) : 0;
                }

                $('body').unbind('click', hideOrderDetail).bind('click', hideOrderDetail);
                var payBox = $('#paybtn');
                var payZindex = parseInt(payBox.css('z-index'));

                if (this.elsBox.orderDetail.html()) {
                    _this.elsBox.orderDetail.hide().html('');
                    $('#order-detail-mask').hide();
                    payBox.css('z-index', payZindex - 4000);
                    $('.j_orderDetails').removeClass('money-btn-detailon');

                } else {
                    this.elsBox.orderDetail.html(this.orderDetailtplfun(orderDetailData));
                    this.elsBox.orderDetail.show();

                    $('#order-detail-mask').show();
                    payBox.css('z-index', payZindex + 4000);
                    $('.j_orderDetails').addClass('money-btn-detailon');
                }

                e.stopImmediatePropagation();
            },
            // 显示错误提示信息
            showErrorTips: function (errorType, errorMessage, id, scrolFlag) {
                scrolFlag = typeof scrolFlag === 'undefined' ? false : scrolFlag;
                errorType = errorType || DataControl.errorType;
                errorMessage = errorMessage || DataControl.errorMessage;

                id = typeof id === 'undefined' ? '' : id;
                var selector = id ? 'li[data-id="' + id + '"] ' + errorType : errorType;
                Futility.showTip(DataControl.tipIconType || DataControl.TIPICONS.RED, selector, errorMessage, scrolFlag);
            },
            hideErrorTips: function (selector) {
                if (selector && selector.currentTarget) {
                    $(selector.currentTarget).parent().find('.form-tips').hide();
                } else {
                    $(selector).parent().find('.form-tips').hide();
                }
            },
            touchStartAction: function (e) {
                var pageY = e.changedTouches[0].pageY;
                $(e.currentTarget).bind('touchend', function (e2) {
                    if (Math.abs(pageY - e2.changedTouches[0].pageY) <= 10) {
                        $(e.currentTarget).focus();
                        $(e.currentTarget).unbind('touchend');
                    }
                });
            },
            /*
            *查看保险信息
            */
            viewInsure: function (e) {          //insure
                // update by rhhu 
                var url = '#insuranceinfo!' + $(e.currentTarget).attr('data-typeid');
                _this.vInsurance.viewInsure(url);
            },
            /*
            * 选择配送方式
            * */
            selDelivery: function (e) {     //Vouchers
                //flightDetailsStore
                //this.showAlert
                var flightDetailsData = flightDetailsStore.get();
                if (!flightDetailsData) {
                    this.showAlert();
                    return;
                }
                this.forward('#zqInPickTicketSelect');
            },
            /**
            * 保险switch按钮回调
            */
            switchInsure: function (_this) {
                var $this = this;
                var insure_detail = $this.$el.find('#insure_detail'),
                    insure_detail_i = insure_detail.find('em i'),
                    isSelInsure = _this.getStatus() ? 1 : 0,
                    validSelCount = passengerQueryStore.getAttr('validSelCount');

                if (isSelInsure && (+flightOrderStore.getAttr('selInsure') != isSelInsure)) { //open 
                    insure_detail.data('pcount', validSelCount);
                    insure_detail_i.html(insure_detail.data('pcount') * insure_detail.data('mininsure'));
                } else if (!isSelInsure && (+flightOrderStore.getAttr('selInsure') != isSelInsure)) {
                    insure_detail_i.html(0);
                }

                flightOrderStore.setAttr('selInsure', isSelInsure);
                this.updateOrderPrice();
                mdStore.setAttr('IsCancelInsurance', !isSelInsure);    //埋点IsCancelInsurance

                this.vTravelPackages.togglePackageDesc(isSelInsure);
            },
            /*
            * 模板数据渲染
            * */
            renderList: function (data) {//mutil
                var flightDeliveryData = flightDeliveryStore.get(this.UserID) || { type: 1 };
                var paytype = flightDeliveryData.paytype;
                var fee = 0;

                var UserID = this.UserID,
                    DelItemsData = this.DelItemsData;
                if (!DelItemsData.length) {//增加配送方式的容错处理 郑开文 2014-8-26 bug：0056112
                    flightDeliveryData = { type: 1 };
                    flightDeliveryStore.setAttr('type', 1, _this.UserID);
                }
                var fn = function (passengerQueryStore, flightOrderStore, mdStore, flightDeliveryStore, postAddressStorage, airportDeliveryStore,
                    UserID, DelItemsData, data, _this) {
                    if (DelItemsData && DelItemsData.length) {
                        fee = DelItemsData[0] ? DelItemsData[0].exinfo.fee : fee;
                        var supportDel = DelItemsData.some(function (v) {
                            // Update paytype
                            if (flightDeliveryData.type == v.type && v.exinfo && v.exinfo.pays) {
                                if (v.exinfo.pays.length < 2 && (!v.exinfo.pays[0] || (v.exinfo.pays[0] && v.exinfo.pays[0].paytype != 0))) { // 加入收快递费10元钱
                                    v.exinfo.pays.push({ paytype: 0, amount: 0 });
                                }
                                var supportPaytype = v.exinfo.pays.some(function (pay) {
                                    if (pay.paytype == 2 || pay.paytype == 0) {
                                        fee = DelItemsData[0].exinfo.fee; // 收费快递费用
                                    }
                                    return pay.paytype == flightDeliveryData.paytype;
                                });
                                if (!supportPaytype) { // Store 里的paytype 在pays里匹配不到则重新设置paytype，否则保持paytype不变
                                    flightDeliveryStore.setAttr('paytype', _this.getPayType(v.exinfo.pays));
                                    flightDeliveryData = flightDeliveryStore.get(_this.UserID);
                                }
                            }
                            return flightDeliveryData.type == v.type;
                        });
                        if (!supportDel) {
                            flightDeliveryData = { type: 1 };
                            flightDeliveryStore.setAttr('type', 1, _this.UserID);
                        }
                    }

                    var postType = +flightDeliveryData.type;
                    //postAddressStorage
                    var postAddressData = postType == 2 ? postAddressStorage.get(_this.UserID) : postType == 16 ? airportDeliveryStore.get() : null;
                    var delivery = {
                        fee: (postType == 32 && (flightDeliveryData.paytype == 2 || flightDeliveryData.paytype == 0)) ? fee : 0,
                        sendFee: fee, // 快递费用
                        type: postType
                    };

                    data.post = delivery;
                    flightDeliveryStore.setAttr('deliveryInfo', delivery); //  保存配送方式及费用
                }(passengerQueryStore, flightOrderStore, mdStore, flightDeliveryStore, postAddressStorage, airportDeliveryStore,
                UserID, DelItemsData, data, this);

                _this.vFlightInfo.renderList(data);

                //update by rhhu (绑定保险模板)
                _this.vInsurance.render(data);

                var tempDeliverytplfun = this.vVouchers.deliverytplfun;
                var tempDeltabfun = _this.vVouchers.deltabfun;
                invoice_switch;
                var tempDelcostfun = _this.vVouchers.delcostfun;
                var increaseOrderPrice = _this.increaseOrderPrice;

                this.vVouchers.renderInvoice(DelItemsData, _this, cUI, data, flightDeliveryData, tempDeliverytplfun, paytype,
                    flightDeliveryStore, userStore, postAddressStorage, selAddrStore, addrCheckModel,
                            tempDelcostfun, tempDeltabfun, invoice_switch);

                this.vVouchers.updateInvoiceBox(invoiceTitleStore, passengerQueryStore, flightOrderInfoInviceStore, userStore, flightDetailsStore, flightOrderStore, _this);

                var flightOrderData = flightOrderStore.get() || {};
                var functions = function (DelItemsData, _this, cUI, data, flightDeliveryData, tempDeliverytplfun, paytype, c, cbase, Calendar,
                    flightDeliveryStore, flightSearchStore, passengerQueryStore, flightDetailsStore, zqInAirportSelectStore, selFlightInfoStore, airportDeliveryStore,
                    postAddressStorage, userStore, addrListStore, selAddrStore, addrListModel,
                    tempDelcostfun) {
                    if (flightDeliveryData.type == 16 || (DelItemsData.length == 1 && DelItemsData[0].type == 16)) {
                        flightDeliveryData.type = 16;
                        // flightDeliveryStore.setAttr('type', 16, this.UserID);
                        _this.$el.find('#invoice_switch').attr('data-type', 16);
                        _this.vVouchers.updateZqAir(_this, c, cbase, Calendar,
                            flightSearchStore, flightDetailsStore, zqInAirportSelectStore, selFlightInfoStore, airportDeliveryStore); //更新机场自取模板
                    } else {
                        if (DelItemsData.length) {
                            _this.vVouchers.updateAddrList(postAddressStorage, userStore, addrListStore, flightDeliveryStore, selAddrStore, addrListModel); //更新邮寄地址模板
                        }
                    }
                    // update by rhhu (add flightOrderData)
                    flightOrderData = flightOrderData ? flightOrderData : {};
                    if ((+data.flag & 4) != 4) {
                        var insure_switch = new cUI.cuiSwitch({
                            rootBox: _this.$el.find('#insure_switch'),
                            // update by rhhu (add check flightOrderData has selInsure)
                            checked: (flightOrderData["selInsure"]) ? flightOrderData["selInsure"] : false,
                            changed: function () {
                                _this.switchInsure(this);
                            }
                        });
                        if (data.insurances && data.insurances.length && flightOrderData.selInsure) { // 根据保险开关来显示或隐藏保险说明链接
                            $('#package-desc a:nth-of-type\(1\)').show();
                        } else {
                            $('#package-desc a:nth-of-type\(1\)').hide();
                        }
                    }

                }(DelItemsData, _this, cUI, data, flightDeliveryData, tempDeliverytplfun, paytype, c, cbase, Calendar,
                    flightDeliveryStore, flightSearchStore, passengerQueryStore, flightDetailsStore, zqInAirportSelectStore, selFlightInfoStore, airportDeliveryStore,
                    postAddressStorage, userStore, addrListStore, selAddrStore, addrListModel,
                    tempDelcostfun);

                //查询消费券并绑定
                var tempCouponstplfun = this.couponstplfun;

                this.QueryCustomerCoupon(userStore, passengerQueryStore, flightOrderStore, flightDetailsStore,
                    customerCouponModel, _this, tempCouponstplfun, data);

                // update by rhhu  旅行套餐  
                _this.vTravelPackages.render(data, packageSelectStore, passengerQueryStore);


                data.hasTravalPackage ? _this.$el.find('#package-desc').removeClass('js_hide') : '';

                //add旅行套餐信息 wyren@ctrip.com 2014.4.1
                //this.elsBox.lxtc_box.html(this.lxtctplfun(data));
                // 公告
                this.elsBox.notice_box.html(this.noticetplfun(data));
                //绑定消费券
                //            this.elsBox.coupons_box.html(this.couponstplfun(data));
                //绑定支付信息
                data.payAmt = _this.vPayment.accountTotalPrice();
                _this.elsBox.pay_box.html(_this.paytplfun(data)).show();
                _this.$el.find('#flightBox').show();
                //_this.hideLoading();
                //建行
                if (flightCCBStore.getAttr("isCCB")) {
                    _this.$el.find("#js_flight-top").hide();
                    _this.$el.find(".flight-loginline-fixed").hide();
                    _this.$el.find(".flight-loginline").hide();
                }
            },
            /**
            * 重复地址判定
            */
            repeatAddrCheck: function (userStore, postAddressStorage, selAddrStore, addrCheckModel, cb, _this) { //报销凭证
                //userStore, postAddressStorage, selAddrStore, addrCheckModel
                if (userStore.isLogin()) { //登录用户才做重复地址判断
                    var addrInfo = userStore.isLogin() ? postAddressStorage.get() : selAddrStore.get(); //省市区信息
                    // console.log('重复地址判断updateDelv',addrInfo);
                    var cname = '';
                    cname += addrInfo.prvnName ? addrInfo.prvnName + ';' : ';';
                    cname += addrInfo.ctyName ? addrInfo.ctyName + ';' : ';';
                    cname += addrInfo.dstrName ? addrInfo.dstrName : '';
                    addrCheckModel.setParam({
                        'cname': cname
                    });
                    _this.showLoading();
                    addrCheckModel.excute(function (data) {
                        _this.hideLoading();                        //TODO:check it
                        cb(data.rc);
                    }, function (err) {
                        _this.hideLoading();
                        //console.error('重复地址判断updateDelv', err.message);
                        cb(0);
                    }, true, _this);
                } else {
                    cb(0);  //传0表示一定要付费
                }
            },
            //计算套餐或者礼品卡的总价
            getInsureOrLipingTotalPrice: function (flightDetailsStore, packageSelectStore, passengerQueryStore, pcount) {
                //flightDetailsStore, packageSelectStore, passengerQueryStore
                var data = flightDetailsStore.get();
                var pkgtype = packageSelectStore.get(this.uid).pkgtype;
                var passengerinfo = passengerQueryStore.get();
                //旅行套餐二选一渲染,隐藏原先的保险模板
                if (data.ispackage && data.pkglist.length) {
                    var pkgs = data.pkglist.filter(function (pkg, index) {
                        return pkg.basicinfo.pkgtype == pkgtype;
                    });
                    if (pkgs.length) {
                        var mins = pkgs[0].packageinfo.psgs.filter(function (psg, idex) {
                            return psg.psgtype == 1;
                        });
                        pkgs[0].count = (mins.length ? +mins[0].min : 1) * pcount;
                        return pkgs[0].count * +pkgs[0].price
                    }
                }
                else {
                    return 0;
                }
            },

            //查询消费券余额
            QueryCustomerCoupon: function (userStore, passengerQueryStore, flightOrderStore, flightDetailsStore,
                customerCouponModel, _this, tempCouponstplfun, detaildata) {         //Coupon
                // coupons_switch
                if (!userStore.isLogin()) {
                    return;
                }
                var pcount = 0;
                var passengerInfo = passengerQueryStore.get();
                if (passengerInfo && passengerInfo.passengers) {
                    $.each(passengerInfo.passengers, function (index, p) {
                        if (p.selected == 1 && (p.ticketType == 1)) {
                            pcount++;
                        }
                    });
                }
                if (!detaildata.user) {
                    detaildata.user = userInfo;
                }

                var flightOrderData = flightOrderStore.get() || {};
                if (!detaildata.order) {
                    detaildata.order = flightOrderData;
                }

                detaildata.CRCount = pcount;
                customerCouponModel.excute(function (data) {
                    if (data.amt >= 0) {
                        detaildata.couponBalance = data.amt;
                        flightDetailsStore.setAttr("couponBalance", data.amt);
                        _this.renderCouponBox(detaildata);
                    }
                }, function (error) {
                    detaildata.couponBalance = 0;
                    flightDetailsStore.setAttr("couponBalance", 0);
                    _this.renderCouponBox(detaildata);
                }, true, this);

            },
            renderCouponBox: function (detaildata) {
                if (detaildata && detaildata.couponBalance && +detaildata.couponBalance > 0 && detaildata.user && detaildata.user.IsNonUser == false && (+detaildata.items[0].policy.rebateAmt > 0 || (detaildata.items.length > 1 && +detaildata.items[1].policy.rebateAmt > 0))) {
                    _this.elsBox.coupons_box.html(_this.couponstplfun(detaildata));
                    coupons_switch = new cUI.cuiSwitch({
                        rootBox: _this.$el.find('#coupons_switch'),
                        checked: !!(detaildata.order && detaildata.order.selCoupons && (+detaildata.order.selCoupons) > 0),
                        changed: function () {
                            _this.couponsSwitchAction(flightOrderStore, this); //是否使用消费券返现
                        }
                    });
                } else {
                    _this.elsBox.coupons_box.html('');
                }
            },
            //XXXX
            showRebate: function (e) {
                var target = $(e.currentTarget);
                var amt = target.attr('data-rbt'),
                    rbtType = target.attr('data-rbtType');
                if (amt && +amt > 0) {
                    var $rbtDesc = target.find('span.jsArrow');
                    if ($rbtDesc.hasClass('sjTop')) {
                        target.find('p.jsrbt' + rbtType).show();
                        $rbtDesc.addClass('sjBottom');
                        $rbtDesc.removeClass('sjTop');
                    } else {
                        target.find('p.jsrbt' + rbtType).hide();
                        $rbtDesc.removeClass('sjBottom');
                        $rbtDesc.addClass('sjTop');
                    }
                }
            },
            //flightinfo
            fanBoxAction: function (e) { //查看返现信息
                if (View.isShowLoad) {
                    return;
                }
                var info = $('.j_refundPolicyTips').html();
                Futility.popUp(this.$el, info);
            },
            //flightinfo
            tgBoxAction: function (e) { //查看退改签                     //flight info
                //mdStore
                if (View.isShowLoad) {
                    return;
                }
                var target = $(e.currentTarget),
                    rmk = target.siblings('.flight-pnttips'),
                    tipbox = target.prev('.flight-rtntips');

                if (target.hasClass('flight-arrdown')) {
                    if (!tipbox.hasClass("js_hide")) {
                        tipbox.addClass("js_hide");
                    }
                    target.removeClass('flight-arrdown');
                    target.text('收起退改签');
                    target.addClass('flight-arrup');
                    rmk.show();
                } else if (target.hasClass('flight-arrup')) {
                    target.text('查看退改签');
                    target.removeClass('flight-arrup');
                    target.addClass('flight-arrdown');
                    rmk.hide();
                }
                mdStore.setAttr('IsCheckTGQ', true);    //埋点IsCheckTGQ
            },
            // 使用消费券返现
            //flightinfo
            couponsSwitchAction: function (flightOrderStore, _this) {
                //flightOrderStore
                var isSelCoupons = 0;

                flightOrderData = flightOrderStore.get();
                flightOrderData = flightOrderData ? flightOrderData : {};

                if (_this.getStatus()) {
                    isSelCoupons = 1;
                }

                flightOrderStore.setAttr('selCoupons', isSelCoupons);
            },
            //报销凭证开关
            updateDelList: function (cb, selFlightInfoStore, flightSearchStore) { //获取配送方式信息 
                var param = this.vVouchers.PickTicketParam(selFlightInfoStore, flightSearchStore);
                param.polid = flightDetailModel.getParamStore().get().polid;
                flightPickTicketModel.setParam(param);
                this.DelItemsData = [];
                flightPickTicketModel.excute(function (data) {
                    this.DelItemsData = this.vVouchers.getCurrentItems(data);
                    cb && cb();
                }, function (e) {
                    if (invoice_switch) {
                        invoice_switch.changed = function () {
                            _this.$el.find('#invoice_switch .cui-switch').removeClass('current');
                            _this.$el.find('#invoice_switch .cui-switch-bg').removeClass('current');
                        };
                    }
                    var d = { "deliveries": [] };
                    this.DelItemsData = this.vVouchers.getCurrentItems(d);

                    cb && cb();

                }, false, this);
            },
            //报销凭证
            getPayType: function (pays) {
                //this.DelItemsData
                if (typeof pays === 'undefined') {
                    if (this.DelItemsData && this.DelItemsData[0] && this.DelItemsData[0].exinfo) {
                        pays = this.DelItemsData[0].exinfo.pays || [];
                    }
                }
                return pays.length ? pays[0].paytype : 0;
            },
            //报销凭证
            getExInfoByPayType: function (flightDeliveryStore, paytype, pays) {
                //flightDeliveryStore
                var payInfo = null;
                pays = pays || flightDeliveryStore.getAttr('pays') || [];

                $(pays).each(function (index, pay) {
                    if (pay.paytype == paytype) {
                        payInfo = pay;
                        return false;
                    }
                });
                return payInfo;
            },
            // 报销凭证  vVouchers.js
            showDelListUI: function (e) { //选择配送方式UI
                //postAddressStorage, userStore, addrListStore, flightDeliveryStore, selAddrStore,addrListModel
                var target = $(e.currentTarget);
                var flightDeliveryData = flightDeliveryStore.get(this.UserID) || {
                    type: 1
                };
                var index = 0;
                if (this.DelItemsData.length <= 1) return;
                _.each(this.DelItemsData, function (n, m) {
                    if (n.type == flightDeliveryData.type) {
                        index = m;
                    }
                });
                var DelList = new c.ui.ScrollRadioList({
                    title: '配送方式',
                    index: index,
                    data: this.DelItemsData,
                    itemClick: function (item) {
                        _this.$el.find(".js_del_tab span.flight-section-sp1").text(item.key);
                        var preType = flightDeliveryStore.getAttr('type');
                        var deliveryInfo = flightDeliveryStore.getAttr('deliveryInfo');
                        var paytype = flightDeliveryStore.getAttr('paytype');

                        flightDeliveryStore.setAttr('type', item.type, this.UserID);
                        _this.trigger(_this.EVENTS.UPDATEORDERPRICE);
                        _this.$el.find("#invoice_switch").data("type", item.type);
                        if (item.type == 16) { // 机场自取
                            //_this, c, cbase, Calendar,
                            //flightSearchStore, flightDetailsStore, zqInAirportSelectStore, selFlightInfoStore, airportDeliveryStore
                            _this.vVouchers.updateZqAir(_this, c, cbase, Calendar,
                flightSearchStore, flightDetailsStore, zqInAirportSelectStore, selFlightInfoStore, airportDeliveryStore);
                            postAddressStorage.setAttr("edit", 0, this.UserID);
                        } else {
                            _this.vVouchers.updateAddrList(postAddressStorage, userStore, addrListStore, flightDeliveryStore, selAddrStore, addrListModel);
                        }
                        if (item.type != 32) { // 快递方式
                            $(".js_del_cost .flight-bxinfo-box").hide();
                            $('#gift-card-tips').hide();
                        } else {
                            $(".js_del_cost .flight-bxinfo-box").show();
                            $(".js_del_cost .flight-bxinfo-box").removeClass('js_hide');
                            $('#gift-card-tips').show();
                        }
                    }
                });
                DelList.show();
            },
            AddrListAction: function () { //选择邮寄地址          vVouchers
                var addrListModel = CPageModel.CustomerAddrQueryModel.getInstance();
                addressStore.setCurrent(this.UserID, {
                    success: '/webapp/flight/#bookinginfo',
                    defeated: '/webapp/flight/#bookinginfo'
                }, 'CustomerAddrStore:setAddr', 'CustomerAddrStore:get');

                if (userStore.isLogin()) {
                    addrListModel.excute(function (data) {
                        if (!_.isArray(data.addrs) || !data.addrs.length) {			//当返回的数据格式有问题时
                            postAddressStorage.setAttr("opr", 1);
                            postAddressStorage.set(postAddressStorage.get(), this.UserID)
                            this.jump('/webapp/fpage/#addressinfo?from=bookinginfo')
                        }
                        else {
                            this.jump('/webapp/fpage/#addresslist')
                        }
                    }, function (data) {
                        postAddressStorage.setAttr("opr", 1);
                        postAddressStorage.set(postAddressStorage.get(), this.UserID)
                        this.jump('/webapp/fpage/#addressinfo')
                    }, true, this);

                }
                else {
                    postAddressStorage.setAttr("opr", 1);
                    postAddressStorage.set(postAddressStorage.get(), this.UserID)
                    this.jump('/webapp/fpage/#addressinfo?from=bookinginfo')
                }
            },
            selectCityAction: function () { //城市地区选择            vVouchers
                //postAddressStorage
                //selAddrStore
                //postCityStore
                //postCityModel
                //this ,MultipleScrollList
                var selData = postAddressStorage.get(this.UserID);
                selAddrStore.set({
                    'prvnId': selData.prvnId,
                    'prvnName': selData.prvnName,
                    'prvn': selData.prvnName,
                    'ctyId': selData.ctyId,
                    'ctyName': selData.ctyName,
                    'cty': selData.ctyName,
                    'dstrId': selData.dstrId,
                    'dstrName': selData.dstrName,
                    'dstr': selData.dstrName
                }, this.UserID);

                var self = this;
                var data = postCityStore.get();
                if (!data) {
                    this.showLoading();
                    postCityModel.excute(function (data) {
                        postCityStore.set(data);
                        complete.call(self);
                    }, function (e) {
                        this.showMessage('网络连接失败,请稍候重试');
                        this.hideLoading();
                    }, true, this);
                } else {
                    complete.call(this);
                }
                //postCityStore
                function complete() {
                    this.hideLoading();
                    var provinces = postCityStore.get();
                    var citiesOfPrvn = provinces[0].citys;
                    var contriesOfCity = citiesOfPrvn[0].contries;
                    var selProvice = provinces[0];
                    var getItemIndexById = function (id, attr, list) {
                        var index = 0;
                        _.each(list, function (item, i) {
                            if (item[attr] == id) {
                                index = i;
                                return false;
                            }
                        });

                        return index;
                    };
                    var prvnIndex = 1, cityIndex = 1, contryIndex = 0;
                    if (selData.prvnId) {
                        prvnIndex = getItemIndexById(selData.prvnId, 'treeKey', provinces);
                        selProvice = provinces[prvnIndex];
                        citiesOfPrvn = selProvice.citys;
                        cityIndex = getItemIndexById(selData.ctyId, 'treeKey', citiesOfPrvn);
                        contriesOfCity = citiesOfPrvn[cityIndex].contries;
                        contryIndex = getItemIndexById(selData.dstrId, 'treeKey', contriesOfCity);
                    }
                    provinces.forEach(function (item, index) {
                        item.key = item.prvn;
                        item.value = item.name;
                    });
                    citiesOfPrvn.forEach(function (item, index) {
                        item.key = item.cty;
                        item.value = item.name;
                    });
                    contriesOfCity.forEach(function (item, index) {
                        item.key = item.treeKey;
                        item.value = item.name;
                    });
                    var provinceChange = function (item) {
                        citiesOfPrvn = item.citys;
                        contriesOfCity = item.citys[0].contries;
                        mutipleScrollList.updateScrollListByIndex(1, citiesOfPrvn);
                        mutipleScrollList.updateScrollListByIndex(2, contriesOfCity);
                    };
                    var cityChange = function (item) {
                        contriesOfCity = item.contries;
                        mutipleScrollList.updateScrollListByIndex(2, contriesOfCity);
                    };
                    var contryChange = function (item) { };
                    var mutipleScrollList = new MultipleScrollList({
                        title: '选择所在地区',
                        data: [provinces, citiesOfPrvn, contriesOfCity],
                        index: [prvnIndex, cityIndex, contryIndex],
                        changed: [
                            provinceChange,
                            cityChange,
                            contryChange
                        ],
                        disItemNum: 4,
                        cancel: '取消',
                        ok: '确定',
                        okClick: function (items) {
                            $('#selectCity .flight-listsim3-table > span').html(items[0].name + '' + items[1].name + '' + items[2].name);
                            postAddressStorage.setAttr('prvnId', items[0].prvn, _this.UserID);
                            postAddressStorage.setAttr('prvnName', items[0].name, _this.UserID);
                            postAddressStorage.setAttr('ctyId', items[1].cty, _this.UserID);
                            postAddressStorage.setAttr('ctyName', items[1].name, _this.UserID);
                            postAddressStorage.setAttr('dstrId', items[2].id, _this.UserID);
                            postAddressStorage.setAttr('dstrName', items[2].name, _this.UserID);
                        }.bind(this)
                    });
                    mutipleScrollList.show();
                }
            },

            //发票抬头输入事件
            inTitleChangeWrp: function () { // vVouchers
                _this.vVouchers.inTitleChange(userStore, flightOrderInfoInviceStore, flightOrderStore, Futility.hideTip);
            },
            //点击进入发票抬头选择列表
            showinTitleList: function () {
                if (userStore.isLogin()) {    //已登录 进入发票抬头列表页
                    //this.jump('/webapp/invoice/d.html#invoicelist?businesstype=flight');
                    /*配置回调*/
                    invoiceURLStore.setCurrent(
                        'invinfo.addr',                                             //标识
                        {
                            success: '/webapp/flight/#bookinginfo',                   //设置返回时的地址
                            defeated: '/webapp/flight/#bookinginfo'                    //设置完成时的地址
                        }, '', '', 'flight');
                    this.jump('/webapp/invoice/index.html#select?businesstype=flight');
                } else {  //未登录 跳到登录页面
                    this.showLoading();
                    window.location.href = '/webapp/myctrip/#account/login?t=1&from=' + encodeURIComponent(this.getRoot() + '#bookinginfo');
                }
            },
            //XXXX
            showCalendarUI: function (airportDeliveryStore, Calendar, _this) { //日历控件UI
                var selectedDate = airportDeliveryStore.getAttr("time");
                _this.calendar = new Calendar({
                    date: {
                        start: {
                            title: function (date, sformat) {
                                return sformat(
                                    date);
                            },
                            value: selectedDate
                        }
                    },
                    title: '取票日期',
                    Months: 6,
                    callback: function (date) {
                        _this.zqTimeObj.defaHourList = _this.zqPrintDetail(_this.zqTimeObj.validDate, date);            //XXX:zqTimeObj
                        if (_this.zqTimeObj.defaHourList.length > 0) {
                            var defaHour = _this.zqTimeObj.defaHourList[_this.zqTimeObj.defaHourList.length - 1];
                            date.setHours(defaHour.slice(0, 2), defaHour.slice(3));
                        }
                        airportDeliveryStore.setAttr("time", date.toString());
                        _this.zqTimeObj.selectDate = date;

                        //_this, c, cbase, Calendar,
                        //flightSearchStore, flightDetailsStore, zqInAirportSelectStore, selFlightInfoStore, airportDeliveryStore
                        _this.vVouchers.updateZqAir(_this, c, cbase, Calendar,
                            flightSearchStore, flightDetailsStore, zqInAirportSelectStore, selFlightInfoStore, airportDeliveryStore);
                        _this.$el.show();
                        this.hide();
                        window.scrollTo(0, _this.scrollPosY);
                    },
                    onHide: function () {
                        _this.$el.show();
                    },
                    classNames: 'calen-cls'
                });
            },

            showZqTimeUI: function (e) { //选择取票时间UI
                //_this.zqTimeObj
                //airportDeliveryStore
                var target = $(e.currentTarget);
                var index = 0,
                    HourData = [],
                    defaHour = c.base.Date.parse(_this.zqTimeObj.selectDate.toString()).format("H:i");
                _.each(this.zqTimeObj.defaHourList, function (n, m) {
                    HourData.push({
                        key: m,
                        val: n
                    });
                    if (defaHour == n) {
                        index = m;
                    }
                });

                var DelList = new c.ui.ScrollRadioList({
                    title: '取票时间',
                    index: index,
                    data: HourData,
                    itemClick: function (item) {
                        _this.zqTimeObj.selectDate.setHours(item.val.slice(0, 2), item.val.slice(3));
                        _this.$el.find("#date-zqtime span").html(item.val);
                        airportDeliveryStore.setAttr("time", _this.zqTimeObj.selectDate.toString(), this.citykey);
                    }
                });
                DelList.show();
            },
            //XXXX
            calendarAction: function () { //日历选择
                //airportDeliveryStore, Calendar, _this
                if (this.calendar || this.showCalendarUI(airportDeliveryStore, Calendar, _this)) {
                    //this._updateSelectDate();
                    this.calendar.update({
                        'validStartDate': new Date(this.zqTimeObj.validDate[0][0]),
                        'validEndDate': new Date(this.zqTimeObj.validDate[this.zqTimeObj.validDate.length - 1][1])
                    });
                    this.scrollPosY = $(window).scrollTop();
                    window.scrollTo(0, 0)
                    this.$el.hide();
                    this.calendar.show();
                }
            },

            //voucher
            zqinairselect: function () { //机场自取柜台选择
                this.forward('zqInAirportSelect');
            },
            //XXXX
            zqPrintDetail: function (interval, ticketsDate) {
                if (typeof ticketsDate === "string") {
                    ticketsDate = new Date(ticketsDate);
                }
                var len = interval.length,
                    date = [], us, i = 0, bool = true,
                    mouth = ticketsDate.getMonth();
                day = ticketsDate.getDate();
                if (!len) return date;
                for (; i < len; i++) {
                    var set = interval[i];
                    for (var k = 0, le = set.length; k < le; k++) {
                        if (set[k].getMonth() === mouth && set[k].getDate() === day) {
                            us = set;
                            break;
                        }
                    }
                }

                if (!us) return date;
                var star = us[0],
                    end = us[1],
                    starTime = star.getTime(),
                    endTime = end.getTime(),
                    endminu = end.getMinutes(),
                    endhour = end.getHours();
                while (starTime <= endTime) {
                    var newDate = new Date(starTime),
                        hours = newDate.getHours(),
                        minutes = newDate.getMinutes();
                    if (bool) {
                        bool = false;
                        if (minutes) {
                            minutes > 30 ? newDate = new Date(starTime = starTime + (60 - minutes) * 60 * 1000) : newDate = new Date(starTime = starTime + (30 - minutes) * 60 * 1000);
                            hours = newDate.getHours(), minutes = newDate.getMinutes();
                        }
                    }
                    starTime = starTime + (1000 * 60 * 30);
                    date.push((hours < 10 ? "0" + hours : hours) + ':' + (!minutes ? '00' : minutes));
                }
                return date;
            },
            //手机号
            setContact: function (e) {          //
                //flightOrderStore
                var flightOrderData = flightOrderStore.get();
                flightOrderData = flightOrderData ? flightOrderData : {};
                var contact = flightOrderData.contact ? flightOrderData.contact : {};
                //1.若用户填写了联系人或联系手机号码，则记录下来
                var target = $(e.currentTarget);
                var value = target.val().trim();

                contact.mphone = value; //记录联系人电话
                flightOrderStore.setAttr('contact', contact);
            },
            /*消费券说明*/
            viewCoupons: function (e) {         //Coupon
                //flightDetailsStore
                //_this.hideLoading(), this.showAlert();
                var flightDetailsData = flightDetailsStore.get();
                if (flightDetailsData) {
                    this.forward('#coupons');
                } else {
                    _this.hideLoading(); //非渲染
                    this.showAlert();
                    return;
                }
            },
            //multi
            beforePayAction: function () {              // 分到每个模块的check里面
                //postAddressStorage, flightDetailsStore, userStore, flightDeliveryStore
                //DataControl,
                //addrOprModel
                // 更新passengers 埋点信息
                try {
                    //passengerQueryStore, mdStore, showToast
                    this.vPassenger.setPassengersMDInfo();
                } catch (e) {
                    console.log('beforePayAction: 设置乘机人埋点信息异常');
                }

                var detail = flightDetailsStore.get();
                if (detail && detail.items && detail.items.length > 1) {
                    var firstDate = detail.items[0].basicInfo.dTime;
                    var secondDate = detail.items[1].basicInfo.dTime;
                    if (new Date(firstDate) >= new Date(secondDate)) {
                        this.showAlert("不能提交返程比去程更早起飞的航班组合", false);
                        return;
                    }
                }
                // 报销凭证地址校验
                var selData = postAddressStorage.get(userStore.isLogin() ? this.UserID : '');
                var flightDeliveryType = flightDeliveryStore.getAttr("type");
                if (this.DelItemsData.length && flightDeliveryType && (flightDeliveryType == 2 || flightDeliveryType == 32)) {

                    if (!this.vVouchers.verifyAddrInput(Futility.showTip, mdStore, selData.recipient, selData.addr, selData.zip)) {
                        mdStore.increaseCntByKey('NextStepNotPassClick'); //埋点NextStepNotPassClick
                        return;
                    }
                    if (userStore.isLogin()) { //如果登陆保存常用地址
                        addrOprModel.setParam(selData);
                        addrOprModel.excute(function (data) {
                            console.log(data);
                        }, function (error) { console.log(error) });
                    }
                }
                //flightDetailsStore, passengerQueryStore, DataControl, flightDetailsStore, passengerQueryStore
                if (this.vPassenger.beforePayValidate() && this.vPassenger.checkSupportCards(flightDetailsStore, passengerQueryStore, DataControl) && this.vPassenger.checkMinPassenger(flightDetailsStore, passengerQueryStore)) {
                    if (flightDetailsStore.get() && flightDetailsStore.get().needinv) {
                        //发票抬头验证，若为“空”则弹出提示 wyren@ctrip.com 2014-4-2
                        var flightDeliveryData = flightDeliveryStore.get(this.UserID) || { type: 1 };
                        if (!(+flightDeliveryData.type <= 1)) {   //报销凭证打开状态
                            if (this.$el.find('#js_invoice_title').val() == '') {
                                //this.showToast('请填写发票抬头');
                                Futility.showTip(DataControl.TIPICONS.RED, '#js_invoice_title', '请填写发票抬头', true);
                                mdStore.increaseCntByKey('NextStepNotPassClick'); //埋点NextStepNotPassClick
                                return false;
                            }
                        }
                    }

                    if (detail.ispackage && packageSelectStore.getAttr("pkgtype", this.UserID) == 2 && !userStore.isLogin()) {
                        this.showAlert("会员才可以使用礼品卡，请先登录", false);
                        return;
                    }

                    this.payAction();
                } else {
                    mdStore.increaseCntByKey('NextStepNotPassClick'); //埋点NextStepNotPassClick
                }
            },
            sendUbt: function () {                      //hidden
                if (window.$_bf && window.$_bf.loaded == true) {
                    var pageId = 225001;

                    if (typeof window['__bfi'] == 'undefined') { //一个页面只需要判断一次
                        window['__bfi'] = [];
                    }

                    window.__bfi.push(["_asynRefresh", {
                        page_id: pageId,
                        orderid: _orderID
                    }]);

                    window.$_bf['asynRefresh']({
                        page_id: pageId,
                        orderid: _orderID
                    });

                } else {
                    setTimeout($.proxy(this.sendUbt, this), 300);
                }
            },
            /*转入支付2.0*/
            //
            jumpToPaymentV2: function (data) {          //payment
                var self = this;
                flightBookingResultStore.set(data);

                var getRam = function (n) {
                    // cUtility.getGuid();
                    var rnd = "";
                    for (var i = 0; i < n; i++)
                        rnd += Math.floor(Math.random() * 10);
                    return rnd;
                };

                if (data["rc"] == 0) {//成功

                    var bustype = 101; //国内机票

                    var order = {};

                    for (var i = 0; i < data["orders"].length; i++) {
                        var o = data["orders"][i];
                        if (o["master"] && o["master"] == true) {
                            order = o;
                        }
                    }

                    var oid = order["oid"];
                    var currency = order["currency"];
                    var price = data["amt"] || 0;
                    var extno = data["extno"] || "";
                    var title = "";
                    var auth = data["head"]["auth"];
                    var rid = getRam(19); //(+new Date) + ""; //data["rid"] || "0";


                    // 生成 token
                    var tokenObj = {
                        "oid": oid,
                        "bustype": "101",
                        "from": location.href,
                        "sback": location.origin + "/webapp/flight/#orderresults?rc=0&type=flight&orderid=" + oid,
                        "eback": location.origin + "/webapp/flight/#orderresults?rc=1&type=flight&orderid=" + oid,
                        "rback": location.origin + "/webapp/flight/#orderresults?rc=2&type=flight&orderid=" + oid,
                        "auth": userStore.getUser().Auth,
                        "title": "机票订单",
                        "currency": currency,
                        "amount": price,
                        "extno": extno,
                        "islogin": userStore.isNonUser() ? 1 : 0,
                        "requestid": rid
                    };

                    var delivery = flightDeliveryStore.get(this.UserID);

                    if (data["needInvoice"] == true) {
                        tokenObj["needInvoice"] = data["needInvoice"];
                        tokenObj["invoiceDeliveryFee"] = (+delivery.type == 32 && (delivery.paytype == 0 || delivery.paytype == 2)) ? delivery.deliveryInfo.sendFee : 0;
                        tokenObj["includeInTotalPrice"] = true;
                    }

                    var token = Crypt.Base64.encode(JSON.stringify(tokenObj));

                    // 构建支付URL
                    var host = location.host;
                    var paymentURL = "https://secure.ctrip.com/webapp/payment2/index.html#index?";

                    if (host.match(/^(localhost|172\.16|127\.0)/i)) {
                        //本地环境
                        paymentURL = "https://secure.fws.qa.nt.ctripcorp.com/webapp/payment2/index.html#index?";
                    } else if (host.match(/^m.fat/i) || host.match((/^m.test/i))) {
                        //测试环境
                        paymentURL = "https://secure.fws.qa.nt.ctripcorp.com/webapp/payment2/index.html#index?";
                    } else if (host.match(/^m\.uat\.qa/i)) {
                        // UAT 环境
                        paymentURL = "https://secure.uat.sh.ctriptravel.com/webapp/payment2/index.html#index?";
                    } else if (host.match(/10.\8/ig)) {
                        // 堡垒环境（需要改Hosts）
                        // 10.8.5.10 secure.ctrip.com
                        // 10.8.5.25 wpg.ctrip.com
                        paymentURL = "https://10.8.5.10/webapp/payment2/index.html#index?"
                    } else {
                        // 生产环境
                        //paymentURL = "https://secure.ctrip.com/webapp/payment2/index.html#index?";
                        paymentURL = "https://secure.ctrip.com/webapp/payment2/index.html#index?"
                    }

                    paymentURL += "oid=" + oid + "&bustype=101" + "&token=" + token;

                    //----------------------------建行合作-----------------------------------//

                    if (flightCCBStore.getAttr("isCCB")) {
                        // 构建扩展信息
                        var osType = flightCCBStore.get().osType;
                        var osVersion = flightCCBStore.get().osVer;
                        var extendObj = {
                            "osType": osType,
                            "osVersion": osVersion,
                            "payWayWhiteList": "EB_CCB"
                        };

                        var extend = Crypt.Base64.encode(JSON.stringify(extendObj));
                        paymentURL += "&extend=" + extend;
                    }

                    //----------------------------建行合作-----------------------------------//
                    try {
                        var masterOid = data.orders[0].oid,
                            orderData = {};
                        orderData["dcity"] = flightSearchData.items[0].dcityName,
                        orderData["acity"] = flightSearchData.items[0].acityName,
                        orderData["wanfan"] = flightSearchData.items.length === 1 ? false : true;
                        orderCreateStore.set(orderData, masterOid);
                    } catch (err) {
                        console.log('orderCreateStore设置错误：', err.msg);
                    }
                    passengerEditStore.remove();

                    if (isBookingEditStore.getAttr("Edit")) {
                        isBookingEditStore.remove();
                        passengerQueryStore.remove();
                    }

                    airportDeliveryStore.remove();
                    self.jump(paymentURL);
                } else { //不成功
                    self.showToast('支付失败，请稍后再试');

                }
            },
            checkMobileNumber: function (el) {
                var _this = this;
                var linkTel = $(el || '#linkTel').val().trim();
                if (linkTel.length <= 0) {
                    //_this.showToast('请填写手机号码。');
                    _this.showErrorTips('#linkTel', '请填写手机号码', undefined, false);
                    mdStore.increaseCntByKey('NextStepNotPassClick'); //埋点NextStepNotPassClick
                    return false;
                }
                if (linkTel.length < 11) {
                    //_this.showToast('请填写正确的手机号码');
                    _this.showErrorTips('#linkTel', '请填写正确的手机号码', undefined, false);
                    mdStore.increaseCntByKey('NextStepNotPassClick'); //埋点NextStepNotPassClick
                    return false;
                }
                if (!c.utility.validate.isMobile(linkTel)) {
                    //_this.showToast('请填写正确的手机号码');
                    _this.showErrorTips('#linkTel', '请填写正确的手机号码', undefined, false);
                    mdStore.increaseCntByKey('NextStepNotPassClick'); //埋点NextStepNotPassClick
                    return false;
                } else {
                    _this.hideErrorTips('#linkTel');
                    $('#linkTel').removeClass('highlight');
                }
                return true;
            },
            /*提交订单*/
            //multi
            payAction: function () {
                var _this = this,
                    passengersinfo,
                    contact,
                    pcount = passengerQueryStore.getAttr('selCount'),
                    segs_orderCreate;

                var flightDetailsData = flightDetailsStore.get(),
                    selFlightInfoData = selFlightInfoStore.get(),
                    flightSearchData = flightSearchStore.get();
                //不符合条件提示
                //1. long time not be used。
                if (!flightDetailsData || !flightDetailsData.items || !selFlightInfoData || !selFlightInfoData.depart || !flightSearchData || !flightSearchData.items) {
                    _this.hideLoading(); //非渲染

                    _this.showAlert('对不起，由于您长时间未操作，订单已失效，请重新查询预订！');
                    mdStore.increaseCntByKey('NextStepNotPassClick'); //埋点NextStepNotPassClick
                    return;
                }

                //2. already sold out.
                var userInfo = userStore.getUser(),
                    target = _this.$el.find("#paybtn em.fs"),
                    rebateAmt = 0;
                var amt = target.data('amt');
                if (!amt || +amt <= 0) {
                    _this.showAlert('抱歉，您选择的价格舱位已售完，请重新查询选择其它价格舱位预订。', false);
                    mdStore.increaseCntByKey('NextStepNotPassClick'); //埋点NextStepNotPassClick
                    return;
                }

                //3. 验证是否填写联系人
                if (!_this.checkMobileNumber()) {
                    return false;
                }
                var passengerInfo = passengerQueryStore.get();
                var psgInfo = _this.vPassenger.savePassengers(); // 保存乘机人至后台

                var passengers = psgInfo.passengers;
                var adultTicketCnt = psgInfo.adultTicketCnt;

                pcount = psgInfo.pcount;
                passengersinfo = flightOrderStore.getAttr("passengersinfo") || [];

                var cnameList = _.compact(_.pluck(passengers, 'name'));
                var cnameFilter = Futility.isRepeatName(cnameList);

                /*5. 重复姓名判断  */
                if (cnameFilter) {
                    _this.showAlert('两名乘机人姓名相同：' + cnameFilter + '，请分2张订单提交', false);
                    return;
                }

                /*6. 重复订单 */
                var RepeatUrl = "Flight/Domestic/Order/RepeatOrderCheck",
                    RepeatData = {};
                if (!_this.isRepeatOrder && userStore.isLogin() && relationship[RepeatUrl] && typeof relationship[RepeatUrl].mappingRequest === "function") {

                    RepeatData = relationship[RepeatUrl].mappingRequest(passengers, flightDetailsData);
                    RepeatData.timeout = 300;
                    RepeatOrderCheckModel.setParam(RepeatData);
                    _this.vOrder.fnCheckRepeatOrder(); //TODO:
                }

                //非会员直接跳过重复订单检测
                if (userStore.isLogin()) {
                    if (!_this.isRepeatOrder) return;
                }

                if (this.vOrder.checkTicketAmount(passengers)) {
                    return;
                }

                _this.showLoading(true);
                var flightOrderData = flightOrderStore.get();
                flightOrderData = flightOrderData ? flightOrderData : {};

                if (flightOrderData.selCoupons && +flightOrderData.selCoupons > 0) {
                    rebateAmt = $('#coupons_switch').attr('data-rbt');
                    flightOrderStore.setAttr('IsNeedFan', 1);
                }

                //联系人信息
                contact = flightOrderData.contact ? flightOrderData.contact : {};
                contact.mphone = $('#linkTel').val().trim();
                flightOrderStore.setAttr('contact', contact);

                //订单信息
                var order = flightOrderData.order ? flightOrderData.order : {};
                if (userInfo && userInfo.Auth) {
                    flightOrderStore.setAttr('auth', userInfo.Auth);
                    flightOrderStore.setAttr('IsNonUser', userInfo.IsNonUser);
                    flightOrderStore.setAttr('ugrade', userInfo.VipGrade);
                } else {
                    flightOrderStore.setAttr('auth', '');
                    flightOrderStore.setAttr('IsNonUser', true);
                    flightOrderStore.setAttr('ugrade', 0);
                    flightOrderStore.setAttr('RebateAmount', 0);
                    flightOrderStore.setAttr('IsNeedFan', 0);
                    rebateAmt = 0;
                }

                var flightOrderData = flightOrderStore.get();
                var flightInfos = [];
                var snno = _this.getQuery('snno');                        //渠道过来，带上营销参数
                flightOrderStore.setAttr('preBookExt', snno);
                flightOrderStore.setAttr('AllianceID', '');
                flightOrderStore.setAttr('SID', '');
                flightOrderStore.setAttr('OUID', '');
                order.oid = '';
                order.price = amt;
                order.payType = 1;
                order.issue = true;
                order.rebateAmt = rebateAmt;
                order.flag = flightDetailsData.flag;                      //XXX
                var flightDeliveryData = flightDeliveryStore.get(_this.UserID) || { type: 1 }; //默认不需要配送
                order.deliveryType = flightDeliveryData.type;
                flightOrderStore.setAttr('order', order);
                //保险信息

                //update by rhhu
                var bxQty = _this.vInsurance.getBxQty();
                var sels = _this.vInsurance.getSels();
                var _s = +flightOrderData.selInsure > 0 ? +flightOrderData.selInsure : sels;
                var isSelBX = +_s > 0;
                var insurance = {};
                if (isSelBX && flightDetailsData.insurances && flightDetailsData.insurances.length > 0 && bxQty && +bxQty > 0) {
                    // update by rhhu (insurance & set store)
                    _this.vInsurance.setInsuranceIntoFlightOrderStore(bxQty);

                    //航班信息
                    var flightInfos = [];
                    var item1;

                    var tripType = 1;
                    var selFlightInfoData = selFlightInfoStore.get();
                    item1 = {
                        "no": flightDetailsData.items[0].basicInfo.flightNo, //去程航班号
                        "class": flightDetailsData.items[0].policy.class, //去程舱位 - 大舱位;0:Y(经济舱);2:C(商务舱);3:F(头等舱)
                        "subclass": flightDetailsData.items[0].policy.subclass, //子舱位
                        "dCtyCode": flightDetailsData.items[0].basicInfo.dCtyCode, //出发城市三字码
                        "dCtyId": flightDetailsData.items[0].basicInfo.dCtyId, //出发城市编号
                        "aCtyCode": flightDetailsData.items[0].basicInfo.aCtyCode, //到达城市三字码
                        "aCtyId": flightDetailsData.items[0].basicInfo.aCtyId, //到达城市编号
                        "dPortCode": flightDetailsData.items[0].basicInfo.dPortCode,
                        "aPortCode": flightDetailsData.items[0].basicInfo.aPortCode,
                        "dDate": flightDetailsData.items[0].basicInfo.dTime, //出发时间
                        "aDate": flightDetailsData.items[0].basicInfo.aTime,
                        "ext": flightDetailsData.items[0].ext,
                        "price": flightDetailsData.items[0].policy.price, //去程航班舱位价格
                        "productType": flightDetailsData.items[0].policy.productType //产品类型
                    };
                    flightInfos.push(item1);
                    //如果包含返程，则添加返程查询条件
                    if (selFlightInfoData.arrive && flightDetailsData.items.length > 1 && selFlightInfoData.arrive.cabin && flightSearchData.tripType && (+flightSearchData.tripType) > 1) {
                        tripType = 2;
                        var item2 = {
                            "no": flightDetailsData.items[1].basicInfo.flightNo, //去程航班号
                            "class": flightDetailsData.items[1].policy.class, //去程舱位 - 大舱位;0:Y(经济舱);2:C(商务舱);3:F(头等舱)
                            "subclass": flightDetailsData.items[1].policy.subclass, //子舱位
                            "dCtyCode": flightDetailsData.items[1].basicInfo.dCtyCode, //出发城市三字码
                            "dCtyId": flightDetailsData.items[1].basicInfo.dCtyId, //出发城市编号
                            "aCtyCode": flightDetailsData.items[1].basicInfo.aCtyCode, //到达城市三字码
                            "aCtyId": flightDetailsData.items[1].basicInfo.aCtyId, //到达城市编号
                            "dPortCode": flightDetailsData.items[1].basicInfo.dPortCode,
                            "aPortCode": flightDetailsData.items[1].basicInfo.aPortCode,
                            "dDate": flightDetailsData.items[1].basicInfo.dTime, //出发时间
                            "aDate": flightDetailsData.items[1].basicInfo.aTime,
                            "ext": flightDetailsData.items[1].ext,
                            "price": flightDetailsData.items[1].policy.price, //去程航班舱位价格
                            "productType": flightDetailsData.items[1].policy.productType //产品类型
                        };
                        flightInfos.push(item2);
                    }
                    flightOrderStore.setAttr('flightInfos', flightInfos);
                    flightOrderStore.setAttr('tripType', tripType);
                    flightOrderStore.setAttr('passengers', passengers);
                    if (passengersinfo) {
                        flightOrderStore.setAttr('passengersinfo', passengersinfo);
                    }

                    //配送信息
                    if (+order.deliveryType != 1) {
                        var postAddressData = +order.deliveryType == 2 ? postAddressStorage.get() : +order.deliveryType == 16 ? airportDeliveryStore.get() : null; //
                        var delivery = {};
                        delivery.ticketIssueCty = flightDetailsData.items[0].basicInfo.dCtyCode; //出发城市三字码
                        delivery.date = item1.dDate;
                        if (postAddressData) {
                            if (+order.deliveryType == 2) {
                                //邮寄
                                delivery.dstr = postAddressData.dstrId;
                                delivery.addrId = postAddressData.inforId;
                                delivery.addr = postAddressData.addr;
                                delivery.fee = postAddressData.sndFee && +postAddressData.sndFee > 0 ? (+postAddressData.sndFee) : 0;
                                delivery.bspet = {
                                    recipient: postAddressData.recipient,
                                    prvn: postAddressData.prvnName,
                                    cty: postAddressData.ctyName,
                                    dstr: postAddressData.dstrName,
                                    zip: postAddressData.zip
                                };
                            }

                            if (+order.deliveryType == 16) {
                                //机场自取
                                delivery.site = postAddressData.site; //柜台所属票点
                                var f = new Date(postAddressData.time);
                                var nDate = cbase.Date.format(f, 'Y-m-d  H:i:s');
                                delivery.date = nDate; //最早送 / 取票时间
                                delivery.port = postAddressData.port; //取票机场三字码,机场自取时必须
                                delivery.fee = postAddressData.fee && +postAddressData.fee > 0 ? (+postAddressData.fee) : 0;
                                delivery.dstr = postAddressData.dstr;
                                delivery.addrId = postAddressData.id;
                                delivery.addr = postAddressData.name;
                            }

                            if (+order.deliveryType == 32) {
                                // 快递
                                delivery.fee = postAddressData.fee && +postAddressData.fee > 0 ? (+postAddressData.fee) : 0;
                                delivery.dstr = postAddressData.dstr;
                                delivery.addrId = postAddressData.id;
                                delivery.addr = postAddressData.name;
                                delivery.bspet = {
                                    recipient: postAddressData.recipient,
                                    prvn: postAddressData.prvnName,
                                    cty: postAddressData.ctyName,
                                    dstr: postAddressData.dstrName,
                                    zip: postAddressData.zip
                                };
                            }
                        }
                        flightOrderStore.setAttr('delivery', delivery);
                    } else {
                        flightOrderStore.removeAttr('delivery');
                    }
                } else {
                    flightOrderStore.removeAttr('delivery');
                }

                var _sales = salesStore.get(),
                    unionData = unionStore.get();

                if (_sales && _sales.sid) {                                     //XXX
                    flightOrderStore.setAttr('sourceId', _sales.sid);
                } else {
                    flightOrderStore.setAttr('sourceId', '');
                }

                if (unionData && unionData.AllianceID && unionData.SID) {
                    flightOrderStore.setAttr('AllianceID', unionData.AllianceID);
                    flightOrderStore.setAttr('OUID', unionData.OUID);
                    flightOrderStore.setAttr('SID', unionData.SID);
                }

                flightOrderSumbitModel.setParamStore(flightOrderStore);
                var data = flightOrderStore.get();
                //amt = _this.accountTotalPrice(pcount, flightDetailsData); //计算总价格

                amt = _this.vPayment.accountTotalPrice();
                var queryparam = _this.getOrderCreateParam(amt, pcount, bxQty); //拼接下单参数
                amt = queryparam.oinfo.price;
                userInfo = userStore.getUser();
                //埋点
                try {
                    var pas = postAddressStorage.get(_this.UserID);
                    if (pas.prvnName !== '') {
                        mdStore.setAttr('IsDeliveryArea', true); //埋点IsDeliveryArea
                    }
                    _this.widgetHidden.mdSubmit();
                } catch (e) {
                    console.log('埋点', 'payAction');
                }

                /*非登入用户*/
                if (!userStore.isLogin()) {
                    $.ajax({
                        url: '/html5/Account/NonUserLogin',
                        data: contact.mphone,
                        type: 'post',
                        dataType: 'json',
                        timeout: 200000,
                        success: function (dataLogin) {

                            if (dataLogin && +dataLogin.ServerCode == 1) {
                                if (dataLogin.Data.IsNonUser == true) {
                                    dataLogin.Data.LoginToken = '';
                                }
                                userStore.removeUser();
                                userStore.setUser({
                                    "UserID": dataLogin.Data.UserID,
                                    "IsNonUser": true,
                                    "LoginToken": "",
                                    "LoginName": null,
                                    "Auth": dataLogin.Data.Auth,
                                    "ExpiredTime": null
                                });

                                _this.orderCreate(queryparam, amt, adultTicketCnt);
                            } else {
                                _this.hideLoading();
                                _this.showAlert('提交订单失败，请重新提交！', false);
                            }
                        },
                        error: function (err) {
                            _this.hideLoading();
                            _this.showAlert('提交订单失败，请重新提交！', false);
                        }
                    });
                } else {
                    /*登入用户*/
                    _this.orderCreate(queryparam, amt, adultTicketCnt);
                }
            },
            /*OPEN API 提交订单*/
            //multi
            orderCreate: function (queryparam, amt, pcount) {           //下单
                flightOrderCreateModel.setParam(queryparam);
                var flightDetailsData = flightDetailsStore.get();
                var flightType = queryparam.oinfo.triptype; //1单程 2往返程
                flightOrderCreateModel.excute(function (data) {
                    _this.hideLoading();
                    console.log(data);
                    data.dcityName = flightDetailsData.items[0].basicInfo.dcname;
                    data.acityName = flightDetailsData.items[0].basicInfo.acname;
                    var flightDeliveryData = flightDeliveryStore.get(this.UserID) || { type: 1 }; //默认不需要配送

                    data.needInvoice = flightDeliveryData.type != 1;
                    data.isK = flightDetailsData.items[0].basicInfo.IsK || false;
                    if (flightDetailsData.items.length > 1) {
                        data.isK = data.isK || (flightDetailsData.items[1].basicInfo.IsK ? flightDetailsData.items[1].basicInfo.IsK : false);
                    }

                    data.tripType = flightType;

                    if (data.rc == 0) {//成功
                        //###############下单埋点######################//
                        try {
                            var order = {};
                            for (var i = 0; i < data["orders"].length; i++) {
                                var o = data["orders"][i];
                                if (o["master"] && o["master"] == true) {
                                    order = o;
                                }
                            }
                            var oid = order["oid"];
                            _orderID = oid;

                            this.sendUbt();


                        } catch (e) {

                        }
                        //###############下单埋点######################//
                        if (data.patarc == 2) {//pata检测结果有变化
                            /*0 = PATA无结果
                            1 = PATA无变化
                            2 = 价格有变化*/
                            var title = "<strong>航司实时价格调整确认</strong></br>";
                            var message = ""; //pata提示内容
                            if (flightType == 1) {//单程
                                var price = flightDetailsData.items[0].policy.price;
                                message = _this.vPayment[_this.vPayment.EVENTS.FORMATPATAMESSAGE](data.priinfos[0].chapri, price, "");
                                if (message) {
                                    amt += (data.priinfos[0].chapri - price) * pcount;
                                }
                            }
                            else {
                                for (var i = 0; i < data.priinfos.length; i++) {
                                    var p = data.priinfos[i];
                                    var price = flightDetailsData.items[p.segno - 1].policy.price;
                                    var p = data.priinfos[i];
                                    var msg = "";
                                    if (p.segno == 1) {
                                        msg = _this.vPayment[_this.vPayment.EVENTS.FORMATPATAMESSAGE](data.priinfos[i].chapri, price, "第一程");
                                    }
                                    else {
                                        msg = _this.vPayment[_this.vPayment.EVENTS.FORMATPATAMESSAGE](data.priinfos[i].chapri, price, "第二程");
                                    }
                                    if (msg) {
                                        message += msg;
                                        amt += (data.priinfos[i].chapri - price) * pcount;
                                    }
                                }
                            }

                            data["amt"] = amt;

                            if (message) {
                                message = title + message + "<strong >调整后订单总额：&yen;" + amt + "</strong>";
                                _this.alert = new cUI.Alert({
                                    title: '提示信息',
                                    message: message,
                                    buttons: [{
                                        text: '不接受',
                                        click: function () {
                                            flightSearchStore.setAttr("fullCabin", true);
                                            this.hide();
                                            _this.back("list");
                                        }
                                    },
                                    {
                                        text: '接受',
                                        click: function () {
                                            this.hide();
                                            // _this.showToast(data.rmsg);
                                            _this.jumpToPaymentV2(data);
                                        }
                                    }]
                                });
                                _this.alert.show();
                            }
                        } else {
                            data["amt"] = amt;
                            _this.jumpToPaymentV2(data);
                        }
                    } else if (data.rc == 1) {
                        _this.showToast(data.rmsg);
                    }
                }, function (error) {
                    _this.hideLoading();
                    if (+error.head.errcode == 1005) {
                        _this.showAlert("用户信息已过期，请重新登录！", false);
                    }
                    else {
                        _this.showAlert(error.rmsg || error.msg, false);
                    }
                    console.log(error);
                }, false, this);
            },
            //拼接open api 下单的参数
            //next step
            getOrderCreateParam: function (amt, pcount, bxQty) {//common functions
                var param = {
                    ver: 0,
                    hver: '',//当前ABTEST版本信息
                    optype: 0, //0=Create=创建订单/1=Modify_Unsub=修改未提交订单(订单还未提交时的修改)/2=Modify_sub=修改已提交订单(已提交订单时修改，只有暂改立时需要，目前不支持暂改立)
                    oinfo: {}, //订单信息
                    segs: [], //行程列表
                    prices: [], //价格信息
                    prolst: [], //活动信息，目前暂时只支持保险
                    pkglst: [], //用户选择的套餐
                    needinvoice: false, //是否需要发票
                    invoices: [], //发票信息(如果有发票类型需求，需要增加)
                    continfo: {}, //联系人信息
                    delinfo: {}, //配送信息
                    psgs: [], //乘客信息
                    psgsettings: [], //乘客产品关系
                    misc: {
                        pos: {
                            "ctype": 3,
                            "lati": 31.22013,
                            "longi": 121.358315
                        }

                    }//用户信息
                };

                //ABTEST版本信息
                var abtestinfo = $("#ab_testing_tracker").val();
                try {
                    param.hver = 'v2.4.8-' + (abtestinfo ? abtestinfo.split(':')[abtestinfo.split(':').length - 1].substring(0, 1) : '');
                } catch (e) {
                    param.hver = 'v2.4.8';
                }


                //var fn = (function(passengerQueryStore,flightDetailsStore,selFlightInfoStore,flightSearchStore,packageSelectStore,userStore,flightOrderInfoInviceStore) {
                var passengerInfo = passengerQueryStore.get();
                var CRCount = 0; //返现数量，只计算成人票种
                if (passengerInfo && passengerInfo.passengers) {
                    $.each(passengerInfo.passengers, function (index, p) {
                        if (p.selected == 1 && (p.ticketType == 1)) {
                            CRCount++;
                        }
                    });
                }


                var flightDetailsData =
                        flightDetailsStore.get(),
                    originData = flightDetailsData.originData,
                    selFlightInfoData = selFlightInfoStore.get(),
                    flightSearchData = flightSearchStore.get(); //获取Storage存储的航班查询条件
                if (selFlightInfoData.arrive && flightDetailsData.items.length > 1 && selFlightInfoData.arrive.cabin && flightSearchData.tripType && (+flightSearchData.tripType) > 1) {
                    param.oinfo.triptype = 2; //往返
                }
                else {
                    param.oinfo.triptype = 1; //单程
                }
                if (userStore.isLogin()) {//是否非会员预定
                    param.oinfo.annoy = false;
                }
                else {
                    param.oinfo.annoy = true;
                }

                param.oinfo.chkno = originData.pols[0].chkno; //pata检测结果
                param.oinfo.price = amt; //订单总金额，票价 + 税（机建） + 燃油 + 保险 + 礼品卡 + 配送
                segs_orderCreate = { segno: 0, prdid: originData.prdid, polid: "" };

                var pkgtype = packageSelectStore.get(this.uid).pkgtype; //二选一套餐类型
                var rebateifno = null; //返现信息
                var rebateAmount = 0; //返现总额
                for (var i = 0; i < originData.segs.length; i++) {
                    var seg = originData.segs[i]; //航程信息
                    var policy = originData.pols[i]; //政策信息
                    if (i == 0) {
                        segs_orderCreate.polid = policy.polid;
                    }

                    var prices = policy.prices; //价格信息
                    for (var k = 0; k < prices.length; k++) {
                        var price = prices[k];
                        param.prices.push({ segno: i + 1, psgtype: price.psgtype, price: price.price, fuel: price.fuel, tax: price.tax }); //价格信息
                    }
                    var promos = policy.promos; //活动信息
                    for (var n = 0; n < promos.length; n++) {
                        var pro = promos[n];
                        var count = 0;
                        var promosprice = pro.price;
                        if (pro.promotype > 5) { // 过滤掉服务端不接受的promotion type(此字段也是服务端下发的：（)
                            continue;
                        }
                        /*1=Rebate=返现
                         2=Promote=促销
                         3=Gift=礼品
                         4=Meal=餐饮
                         5=Package=旅行套餐
                         6=Insurance=惠飞宝*/
                        if (pro.promotype == 1) {
                            if (!flightOrderStore.getAttr('selCoupons') || CRCount <= 0) {
                                break;
                            }
                            promosprice = flightDetailsData["items"][i]["policy"]["rebateAmt"]; //返现从航班列表带入 modify by kwzheng 2014-6-18
                            rebateAmount += CRCount * promosprice;
                            rebateifno = { promoctgy: pro.promoctgy, promoid: pro.promoid, promotype: pro.promotype, currency: pro.currency, price: 0, cnt: 1, amount: 0 };
                        }
                        else {
                            count = pcount;
                            var amount = count * promosprice;

                            param.prolst.push({ promoctgy: pro.promoctgy, promoid: pro.promoid, promotype: pro.promotype, currency: pro.currency, price: promosprice, cnt: count, amount: amount });
                        }
                    }
                    if (i == 0) {
                        // update by rhhu
                        param = _this.vTravelPackages.setPaymentParam(policy, param);

                    }
                }
                //往返程合并返现为一条活动记录 add by kwzheng 2014-6-18
                if (rebateifno != null) {
                    //如果消费券余额小于返现金额，则取消费券余额作为返现金额 modify by zhengkw 2014-6-19
                    if (+flightDetailsData.couponBalance < rebateAmount) {
                        rebateAmount = +flightDetailsData.couponBalance || 0;
                    }
                    rebateifno.price = rebateAmount;
                    rebateifno.amount = rebateAmount;
                    param.prolst.push(rebateifno);
                }
                param.needinvoice = flightDetailsData.needinv; //是否需要发票
                if (param.needinvoice) {
                    var userid = userStore.isLogin() ? userStore.getUser().UserID : this.UserID;
                    var iinfo = flightOrderInfoInviceStore.getAttr(userid);
                    var title = "";
                    if (iinfo) {
                        title = iinfo.title;
                    }
                    var invoiceinfo = flightOrderInfoInviceStore.getAttr("invoiceinfo", userid) || {};
                    param.invoices = [{ invtype: invoiceinfo.intype ? +invoiceinfo.intype : 1, title: title, body: "" }];

                }
                //})(passengerQueryStore,flightDetailsStore,selFlightInfoStore,flightSearchStore,packageSelectStore,userStore,flightOrderInfoInviceStore);

                //var fn = (function(_this,flightOrderStore,unionStore,flightDeliveryStore) {
                //发票信息-----------------------------------------------待确认
                var flightOrderData = flightOrderStore.get() || {};

                //营销渠道信息
                var unionData = unionStore.get();
                if (unionData && unionData.AllianceID > 0 && unionData.SID > 0) {
                    param.misc.allianceInfo = {};
                    param.misc.allianceInfo.id = flightOrderData.AllianceID;
                    param.misc.allianceInfo.ouid = flightOrderData.OUID || '';
                    param.misc.allianceInfo.sid = flightOrderData.SID;
                }
                param.continfo.name = null; //联系人名称-----------------------------待确认
                if (flightOrderData.contact) {
                    param.continfo.phone = flightOrderData.contact.mphone;
                }
                var flightDeliveryData = flightDeliveryStore.get(this.UserID) || { type: 1 }; //默认不需要配送
                param.delinfo.delvtype = flightDeliveryData.type;

                if (flightDeliveryData.type == 32) {
                    var paytype = flightDeliveryStore.getAttr('paytype');
                    var payInfo = _this.getExInfoByPayType(flightDeliveryStore, paytype);
                    var fee = flightDeliveryData.deliveryInfo.fee || flightDeliveryData.deliveryInfo.sendFee;
                    if (paytype == 2 || paytype == 0) {
                        param.delinfo.fee = fee;
                        //param.oinfo.price += fee; // 配送费
                    }

                    param.delinfo.extinfo = {
                        "paytype": paytype == -1 ? 2 : paytype,
                        "amount": paytype == -1 ? 0 : payInfo.amount
                    };
                } else {
                    param.delinfo.extinfo = null;
                }

                //配送信息
                if (flightDeliveryData.type != 1) {
                    var postAddressData = (+flightDeliveryData.type == 2 || +flightDeliveryData.type == 32) ? postAddressStorage.get(this.UserID) : +flightDeliveryData.type == 16 ? airportDeliveryStore.get() : null; //
                    var delvadd = {};
                    if (postAddressData) {
                        if (+flightDeliveryData.type == 2 || +flightDeliveryData.type == 32) {
                            //邮寄
                            param.delinfo.sendadd = { recver: postAddressData.recipient, phone: param.continfo.phone, province: postAddressData.prvnName, city: postAddressData.ctyName, zone: postAddressData.dstrName, addr: postAddressData.addr, post: postAddressData.zip };
                        }
                        if (+flightDeliveryData.type == 16) {
                            var f = new Date(postAddressData.time);
                            var nDate = cbase.Date.format(f, 'Y-m-d  H:i:s');
                            //机场自取
                            param.delinfo.delvadd = { siteid: postAddressData.id, ssiteid: postAddressData.site, addr: postAddressData.name };
                            param.delinfo.senddate = nDate;
                        }
                    }
                }
                //})(_this,flightOrderStore,unionStore,flightDeliveryStore);
                //var fn = (function(_this,Futility,passengerInfo,c,param,DataControl){
                //乘机人信息列表
                var self = _this;
                var name = '';
                var isCname = false;
                for (var i in passengerInfo.passengers) {
                    var p = passengerInfo.passengers[i];
                    if (+p.selected == 1) {
                        var formatBirth = null;
                        if (+p.defaIdCard.type == 1) {
                            formatBirth = c.base.Date.parse(Futility.getBirth(p.defaIdCard.no)).format('Y-m-d');
                        }
                        else {
                            formatBirth = c.base.Date.parse(p.birth).format('Y-m-d');
                        }

                        param.psgs.push({
                            psgid: p.inforId.toString().substr(0, 9),
                            psgname: p.language == 'CN' ? p.cname : p.ename,
                            psgnamen: p.ename,
                            psgtype: DataControl.getPsgType(0, p),
                            birth: formatBirth,
                            cnum: p.defaIdCard.no,
                            ctype: p.defaIdCard.type,
                            gender: p.gender,
                            nation: p.natl,
                            ffpinfo: []
                        });
                        param.psgsettings.push({ segno: 0, psgid: p.inforId.toString().substr(0, 9), tkttype: p.ticketType > 0 ? p.ticketType : 1 });
                    }
                }

                param.segs.push(segs_orderCreate);

                //})(_this,Futility,passengerInfo,c,param,DataControl);

                return param;
            },
            //hidden
            telInputFinish: function (e) {
                var linkTel = $.trim($(e.target).val());

                this.checkMobileNumber(e.target);

                if (linkTel === '') {
                    mdStore.setAttr('IsContactPhone', false); //埋点IsContactPhone
                } else {
                    mdStore.setAttr('IsContactPhone', true); //埋点IsContactPhone
                }
                mdStore.setAttr('ContactPhonePass', !!c.utility.validate.isMobile(linkTel)); //埋点ContactPhonePass
            },
            updateTotalPrice: function (curTicketType, preTicketType) {
                this.vPayment[this.vPayment.EVENTS.UPDATETOTALPRICE](curTicketType, preTicketType);
            },
            //套餐二选一
            packageSelect: function () { //common functions

                var _this = this;

                var fn = (function (flightDetailsStore, _this) {
                    var flightDetailsData = flightDetailsStore.get();
                    if (flightDetailsData) {
                        _this.forward("packageselect");
                    } else {
                        _this.hideLoading(); //非渲染
                        _this.showAlert();
                        return;
                    }
                })(flightDetailsStore, _this);


            },
            //can't be moved ,used by flight info
            showAlert: function (msg, isBack) { //common functions
                isBack = typeof isBack === 'undefined' ? true : isBack;
                this.alert = new cUI.Alert({
                    title: '提示信息',
                    message: msg ? msg : '对不起，由于您长时间未操作，订单已失效，请重新查询预订！',
                    buttons: [{
                        text: '知道了',
                        click: function () {
                            if (isBack) {
                                _this.backAction(1);
                                _this.hideLoading();
                            }
                            this.hide();

                        }
                    }
                    ]
                });
                this.alert.show();
            },
            //can't be deleted. used by vPassenger
            showLoading: function (isMask) { //common functions
                View.isShowLoad = true;
                myLoad.show();

                if (isMask) {
                    globalMask = globalMask || new Mask();
                    globalMask.show();
                }
            },
            hideLoading: function (isMask) { //common functions
                myLoad.hide();
                View.isShowLoad = false;
                isMask && globalMask ? globalMask.hide() : '';
            }
        });
        View.isShowLoad = false;
        return View;
    });

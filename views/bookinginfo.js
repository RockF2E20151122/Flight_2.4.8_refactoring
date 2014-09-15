/// <summary>
/// 机票订单填写 creator:caofu; createtime:2013-07-23
/// </summary>
define(['cSales', 'cWidgetMember', 'vFlightInfo', 'vVoucherRender', 'vPayment',
    'vInsurance',
    'vTravelPackages',
    'vDataControl', 'widgetHidden',
    'libs', 'c', 'cUI', 'MultipleScrollList', 'adLoad',
    'CommonStore', 'flight/utility/utility', 'FlightStore', 'FlightModel', 'CPageModel', 
    'CPageStore', 'InvoiceStore', buildViewTemplatesPath('../modules/bookingInfo/templates/index.html'), 'cUtilityCrypt',
    'cWidgetFactory', 'cWidgetCalendar'/*, '../debug/console'*/],

    function (cSales, cWidgetMember, vFlightInfo, vVoucherRender, vPayment, vInsurance, vTravelPackages,
        vDataControl, widgetHidden,
        libs, c, cUI, MultipleScrollList, MyLoad, 
        CommonStore, Futility, FlightStore, FlightModels, CPageModel, 
        CPageStore, InvoiceStore, html, Crypt, 
        WidgetFactory, cWidgetCalendar/*, console*/) {

    var View;
    var flightDetailModel = FlightModels.FlightDetailModel.getInstance(), //航班详情数据Model
        passengerEditModel = CPageModel.passengerEditModel.getInstance(),           //Move out
        postCityModel = CPageModel.PostCityModel.getInstance(),
        flightOrderSumbitModel = FlightModels.FlightOrderSumbitModel.getInstance(), //订单数据Model
        passengerQueryModel = CPageModel.passengerQueryModel.getInstance(),
        addrListModel = CPageModel.CustomerAddrQueryModel.getInstance(),
        flightPickTicketModel = FlightModels.FlightPickTicketModel.getInstance(), //配送方式请求
        addrOprModel = CPageModel.CustomerAddrEditModel.getInstance(), //常用地址编辑model
        flightOrderCreateModel = FlightModels.FlightOrderCreateModel.getInstance(),
        customerCouponModel = FlightModels.CustomerCouponModel.getInstance(),
        RepeatOrderCheckModel = FlightModels.RepeatOrderCheckModel.getInstance(),       //重复订单model
        addrCheckModel = FlightModels.AddrCheckModel.getInstance(), //重复地址免费查询
        
        flightSearchStore = FlightStore.FlightSearchStore.getInstance(), //航班查询Storage
        flightDetailsStore = FlightStore.FlightDetailsStore.getInstance(), //获取航班详细信息Storage
        selFlightInfoStore = FlightStore.FlightSelectedInfo.getInstance(), //用户选择的航班信息
        passengerQueryStore = CPageStore.passengerQueryStore.getInstance(), //用户选择的乘机人
        passengerEditStore = CPageStore.passengerEditStore.getInstance(), //设置需要修改的乘机人Storage
        isBookingEditStore = CPageStore.isBookingEditStore.getInstance(), //是否booking页内是否可编辑常旅
        postCityStore = CPageStore.PostCityStore.getInstance(),
        flightOrderStore = FlightStore.FlightOrderInfoStore.getInstance(), //航班订单信息Storage
        flightDeliveryStore = FlightStore.FlightPickTicketSelectStore.getInstance(), //航班订单配送信息Storage
        postAddressStorage = CPageStore.CustomerAddrStore.getInstance(), //航班订单邮寄配送信息Storage
        airportDeliveryStore = FlightStore.zqInAirportDateAndAddressStore.getInstance(), //航班订单机场自取配送信息Storage
        userStore = CommonStore.UserStore.getInstance(), //用户信息
        salesStore = CommonStore.SalesObjectStore.getInstance(),
        unionStore = CommonStore.UnionStore.getInstance(),
        passPageTypeStore = CPageStore.passPageTypeStore.getInstance(),
        flightListStore = FlightStore.FlightListStore.getInstance(),
        addrListStore = CPageStore.CustomerAddrListStore.getInstance(),
        addressStore = CPageStore.AddressStore.getInstance(),
        flightPickTicketStore = FlightStore.FlightPickTicketStore.getInstance(), //配送方式请求返回数据的store
        zqInAirportSelectStore = FlightStore.zqInAirportSelectStore.getInstance(),
        selAddrStore = CPageStore.SelectAddrStore.getInstance(), //选择省市Store
        cabinParamStore = FlightStore.FlightCabinParamStore.getInstance(), //所选的机票信息，用于查询舱位
        cabinStore = FlightStore.FlightCabinStore.getInstance(), //舱位信息
        orderCreateStore = FlightStore.OrderCreateStore.getInstance(),  //创建订单后保存信息store
        invoiceURLStore = InvoiceStore.InvoiceURLStore.getInstance(),
        invoiceTitleStore = InvoiceStore.Flight_InvoiceTitle.getInstance(),    //调用发票公共选取返回抬头的store
        customerCouponStore = FlightStore.CustomerCouponStore.getInstance(),
        repeatOrderCheckStore = FlightStore.RepeatOrderCheckStore.getInstance(),        //重复订单store 
        packageSelectStore = FlightStore.PackageSelectStore.getInstance(),
        mdTransStore = FlightStore.MdTransStore.getInstance(),
        mdStore = FlightStore.MdBookingStore.getInstance(),
        ShowLoginStore = CPageStore.ShowLoginStore.getInstance(),
        flightOrderInfoInviceStore = FlightStore.FlightOrderInfoInviceStore.getInstance(),
        flightBookingResultStore = FlightStore.FlightBookingResultStore.getInstance(),
        //建行合作临时存放
        flightCCBStore = FlightStore.FlightCCBStore.getInstance(),
        //widgets
        Calendar = WidgetFactory.create('Calendar'),
        Guider = WidgetFactory.create('Guider'),
        userInfo = userStore ? userStore.getUser() : null,
        cbase = c.base,
        
        mask = null,
        globalMask = null,
        invoice_switch = null,
        UBTKey = "h5.flt.booking";

    //发票缓存(add by rhhu)
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
        
        calendar: null,
        widgetHidden: null,
        isRepeatOrder: null,
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
            'click #jsinsure': 'viewInsure', //保险说明
          
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
            me = this;
            var selFlightInfoData = selFlightInfoStore.get();
            var flightSearchData = flightSearchStore.get(); //获取Storage存储的航班查询条件
            // flightOrderStore.setAttr('auth',userInfo.Auth); //将用户标识加入订单填写信息store
            this.render();

            this.$el.on('focus', 'input', function () {
                me.$el.find('.js_fixed').addClass('pos-rl');
                $('.flight-header-blank').hide();  //暂时解决未登录占位符，input  focus时样式不对
            }).on('focusout', 'input', function () {
                me.$el.find('.js_fixed').removeClass('pos-rl');
                $('.flight-header-blank').show(); //暂时解决未登录占位符，input  focus时样式不对
            });
        },
        /**
         * add child modules .
         * @param: oArgu.childModuleName    must
         * @param: 
         */
        i_setAssociation: function(oArgu){
            for(var i=0; i<oArgu.associations.length; i++){
                var childName = oArgu.associations[i].name;
                if(this[childName] )continue;
                var constructor = oArgu.associations[i].constructor;
                if(!childName || !constructor ){
                    throw 'param error, you must prepare the param first!'; continue;
                }
                this[childName] = new constructor( _.extend({}, { parentView: this
                                                                    }, oArgu.associations[i].argu) );    //argu: 私有chuancha
            }
        },
        onLoad: function (prevPage) {
            var me = this; 
            DataControl = (typeof DataControl === 'undefined') ? new vDataControl(this) : DataControl;
            var oParam = {
                associations: [ { name : 'vFlightInfo', constructor: vFlightInfo, argu:{ parentConstructor: View } },       //parentConstructor: 指的
                                //{ name: 'vPassenger', constructor: vPassenger } ,
                                { name: 'vVouchers', constructor: vVoucherRender } ,
                                { name: 'vInsurance', constructor: vInsurance} ,
                                { name: 'vTravelPackages', constructor: vTravelPackages } ,
                                { name: 'widgetHidden', constructor: widgetHidden } ,
                                { name: 'vPayment', constructor: vPayment } 
                                //,{ name: 'vOrder', constructor: vOrder }
                ]
            };
            this.i_setAssociation(oParam);    // get all child modules
            
            this._listeningMessages_();     // bind interfaces
            me.turning();
            
            if( this.vFlightInfo.render()) return;
            
            this.widgetHidden.onLoad();             //埋点，获取列表页的部分信息
            me.showLoading();
            var userInfo = userStore.getUser();
            if (!me.uid) {
                if (userStore.isLogin()) {
                    me.uid = userInfo.UserID;
                } else {
                    me.uid = c.utility.getGuid();
                }
            };
            
            var selFlightInfoData = selFlightInfoStore.get(),
                flightSearchData = flightSearchStore.get();                                     //获取Storage存储的航班查询条件
            if (!selFlightInfoData || !flightSearchData || !flightSearchData.items ||!selFlightInfoData.depart) {           //未获取到用户选择的航班信息，则返回机票查询页
                me.hideLoading(); //非渲染
                me.showAlert();
                return false;
            }
            
            this.setFlightDetailModelParams(selFlightInfoData, flightSearchData, userInfo);         //给 FlightDetailModel 设置param
            var fnCallback = function(){
                me.updateDelList( prevPage );
            };
            
            Futility.getAssociationByModuleName.bind(me)( 'vPassenger', ['vPassengerRender'], fnCallback );
            
            this.setRepeatAlert();                      // 重复订单提示
            this.getSalesObj(CommonStore);

            //建行
            if (flightCCBStore.getAttr("isCCB")) {
                me.$el.find("#js_flight-top").hide();
                me.$el.find(".flight-loginline-fixed").hide();
                me.$el.find(".flight-loginline").hide();
            }
        },
        updateDelList: function (prevPage) { //获取配送方式信息 
            var me = this;
            var param = me.vVouchers.PickTicketParam();
            param.polid = flightDetailModel.getParamStore().get().polid;
            flightPickTicketModel.setParam(param);
            me.DelItemsData = [];
            
            me.$el.parents("body").find("#dl_app").hide();
            
            var callback = function(){
                me.updatePage( Futility.createCallback.bind(me)( me.showRepeatOrder, prevPage  ) );
            };
            
            flightPickTicketModel.excute(function (data) {
                me.DelItemsData = me.vVouchers.getCurrentItems(data);
                callback();
            }, function (e) {
                if (invoice_switch) {
                    invoice_switch.changed = function () {
                        me.$el.find('#invoice_switch .cui-switch').removeClass('current');
                        me.$el.find('#invoice_switch .cui-switch-bg').removeClass('current');
                    };
                }
                var d = { "deliveries": [] };
                me.DelItemsData = me.vVouchers.getCurrentItems(d);
                callback();

            }, false, me);
        },
        showRepeatOrder: function(prevPage){        //强行将底部广告隐藏
            var me = this;
            if (prevPage == "flightorderdetail" || prevPage == "flightorderlist") {         //从订单列表页或详细页过来则显示重复订单
                me.repeatAlert && me.repeatAlert.show();
            }
        },
        setRepeatAlert: function(){
            var me = this;
            var repeatOrderAlert = localStorage.getItem('__REPEAT_ORDER');
            var repeatOrderInfo = repeatOrderCheckStore.get();
            if (repeatOrderAlert == 'true' && repeatOrderInfo) {
                var msg = repeatOrderInfo.msg;
                var repeatOrder = repeatOrderInfo.repeatOrder;
                me.i_RepeatOrderAlert( repeatOrder );
            }
        },
        i_RepeatOrderAlert: function(repeatOrder){
            var me = this;
            me.repeatAlert = new c.ui.Alert({
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
                    },{
                        text: '查看订单',
                        click: function () {
                            //有多个重复订单时
                            if (repeatOrder && repeatOrder.length > 1) {
                                me.jump("/webapp/myctrip/#orders/flightorderlist?from=" + encodeURIComponent('/webapp/flight/#bookinginfo'));
                            } else {
                                me.jump("/webapp/flight/#flightorderdetail?from=" + encodeURIComponent('/webapp/flight/#bookinginfo') + "&&oid=" + repeatOrder[0]);
                            }
                            this.hide();
                            localStorage.setItem('__REPEAT_ORDER', true);
                        }
                    },{
                        text: '继续预订',
                        click: function () {
                            this.hide();
                            me.isRepeatOrder = true;
                            me.payAction();
                            localStorage.setItem('__REPEAT_ORDER', false);
                            repeatOrderCheckStore.remove();
                        }
                    }
                ]
            });
            me.repeatAlert.show();
        },
        setFlightDetailModelParams: function(selFlightInfoData, flightSearchData, userInfo ){
            var tripType = 1;
            var prdid = selFlightInfoData.depart.cabin.pid;
            if (selFlightInfoData.arrive && selFlightInfoData.arrive.cabin && flightSearchData.tripType && (+flightSearchData.tripType) > 1) {
                tripType = 2;
                prdid = selFlightInfoData.depart.cabin.pid + "," + selFlightInfoData.arrive.cabin.pid;
            }
            flightDetailModel.setParam("prdid", prdid);
            flightDetailModel.setParam('polid', '0');
            flightDetailModel.setParam('triptype', tripType); //查询类型，单程或者往返
            
            if (userInfo) {
                if (userInfo.VipGrade) {
                    flightDetailModel.setParam('ugrade', userInfo.VipGrade);
                }
                if (userInfo.Auth) {
                    flightDetailModel.getHead().setAttr('auth', userInfo.Auth);
                }
            }
            flightDetailModel.setParam('ver', 0);
        },
        EVENTS: {
            DETAILCOMPLETE: 'flightDetailComplete',
            PASSENGERSCOMPLETE: 'passengersComplete',
            INSURANCERENDER: 'insuranceRender',
            SWITCHINSURETRIGGER: 'switchInsureTrigger',
            TOGGLEPACKAGEDESC: 'togglePackageDesc',
            UPDATEPACKAGETPL: 'updatePackageTpl', 
            UPDATEORDERPRICE: 'updateOrderPrice'
        },
        i_hasChildrenOrBaby: function () {           //passenger
            var FlightDetailsStore = this.stores.flightDetailsStore.get();
            var b = false;
            var me = this;
            $(FlightDetailsStore.items).each(function (index, item) {
                var babyPolicy = item.policy.babyPolicy;
                var childPolicy = item.policy.childPolicy;
                if (Futility.isNull(babyPolicy) && Futility.isNull(childPolicy) ) {
                    b = true;
                }
            });
            return b;
        },
        //personal events as below
        _listeningMessages_: function () {
            this.on(this.EVENTS.SWITCHINSURETRIGGER, this.switchInsure );
            this.on(this.EVENTS.UPDATEORDERPRICE, this.updateOrderPrice );
        },
        updateOrderPrice: function () {                 // 更新价格唯方法，其它方法均要废弃 重要！！！！！
            var orderPrice = this.vPayment.i_accountTotalPrice();
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
            var me = this;
            var sales = me.getQuery('sales'),                           //XXX: getQuery
            sourceid = me.getQuery('sourceid');

            var _sales = CommonStore.SalesStore.getInstance().get();
            if (_sales != null) {
                if (sourceid == null && sales == null) {
                    sourceid = _sales["sourceid"];
                }
            }
            if (sales || sourceid) {
                cSales.getSalesObject(sales || sourceid, $.proxy(function (data) {
                    cSales.replaceContent(me.$el);
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
        updatePage: function (callback) {
            var me = this,
                psgersData = {};

            DataControl.reqFlags.DETAIL = false;
            DataControl.reqFlags.PASSENGERS = false;
            DataControl.reqFlags.HASPASSENGER = false;
            DataControl.reqFlags.PASSENGERSFAIL = false;
            //1.绑定航班信息
            //发detail 请求 
            me.vFlightInfo.i_getFlightDetail(
                function (data) {
                    me.trigger(me.EVENTS.DETAILCOMPLETE, psgersData, data, DataControl.reqFlags);
                    DataControl.reqFlags.DETAIL = true;
                    callback && callback();
                    if (DataControl.reqFlags.PASSENGERS) {
                        me.hideLoading();
                    }
            });
            //判断是否已登录，进行不同情况的页面展示
            var fnHide = function(){
                if (DataControl.reqFlags.DETAIL) {
                    me.hideLoading();
                }
            };
            if (userStore.isLogin()) {
                me.UserID = userStore.getUser().UserID;
                passengerQueryStore.setLifeTime('60M');
                passengerQueryModel.setParam('UserId', me.UserID);
                me.showLoading();
                
                passengerQueryModel.excute(function (data) {
                    me.trigger(me.EVENTS.PASSENGERSCOMPLETE, psgersData, data, DataControl.reqFlags);
                    DataControl.reqFlags.PASSENGERS = true;
                    fnHide();
                }, function (err) {
                    DataControl.reqFlags.PASSENGERSFAIL = true;
                    me.trigger(me.EVENTS.PASSENGERSCOMPLETE, psgersData, err, DataControl.reqFlags);
                    fnHide();
                }, false, me);
            } else {
                me.UserID = me.UserID || c.utility.getGuid();
                me.trigger(me.EVENTS.PASSENGERSCOMPLETE, psgersData, null, DataControl.reqFlags);
                DataControl.reqFlags.PASSENGERS = true;
                fnHide();
            }
            
            me.fnSetContactMobile();

            if (flightCCBStore.getAttr("isCCB")) {          //建行支持，荣华 seo
                $(".flight-loginline").hide();
            }
        },
        fnSetContactMobile: function(){
            var me = this;
            var userInfo = userStore.getUser();
            //若用户已经登录且无联系人信息，用户信息中的姓名和电话绑定在联系人中
            if (userInfo && userInfo.IsNonUser == false) {
                me.$el.find('#linkTel').val((userInfo.Mobile ? userInfo.Mobile : ""));
            }
            //设置联系人手机号
            var flightOrderData = flightOrderStore.get();
            if (flightOrderData && flightOrderData.contact) {
                var contact = flightOrderData.contact;

                if (contact.mphone && contact.mphone.trim().length > 0) {
                    me.$el.find('#linkTel').val(contact.mphone.trim());
                }
            }
        },
        toggleNotice: function () {
            $('.j_AnnouncementNotice').toggleClass("flight-htauto");
            $('.j_AnnouncementNotice').children(".flight-arrdn5").toggleClass("flight-arrup5");
        },
        toggletips: function (e) {
            $('.j_PackageNotice').toggleClass("flight-htauto");
            $('.j_PackageNotice').children(".flight-arrdn3").toggleClass("flight-arrup3");
        },
        deleteHistoryBeforeGoBack: function(){  //清除历史记录 保险信息，配送信息, 航班信息
            var flightOrderData = flightOrderStore.get();
                
            flightOrderData = flightOrderData ? flightOrderData : {};
            //清除历史记录 保险信息，配送信息, 航班信息
            flightOrderStore.setAttr('delivery', null);
            flightOrderStore.setAttr('flightInfos', null);
            flightOrderStore.setAttr('insurance', null);
            flightOrderStore.setAttr('order', null);
            flightOrderStore.setAttr('selInsure', '1');
        },
        //don't move into child modules
        backAction: function (shareTrip) {
            var me = this,
                flightDetailsData = flightDetailsStore.get() ;
            me.deleteHistoryBeforeGoBack();
            var backUrl = '#list';
            if (shareTrip && +shareTrip > 0) {
                if (flightDetailsData && flightDetailsData.items && flightDetailsData.items.length > 1) {
                    //判断是否包含共享航班
                    //表示去除包含共享航班，则返回去程列表页
                    backUrl = +shareTrip == 1 ? '#list' : "#backlist";
                }
                //移除保存的航班详情数据
                flightDetailsStore.remove();
                me.back(backUrl);
                me.widgetHidden.goBack();               // 埋点IsReturn
                return;
            }
            me.giveUpAlert(backUrl, flightDetailsData);
        },
        giveUpAlert: function(backUrl, flightDetailsData){
            var me = this, backAlert = new c.ui.Alert({
                title: '提示信息',
                message: '您的订单尚未完成，确定要离开吗？',
                buttons: [{
                    text: '取消',
                    click: function () {
                        this.hide();
                        me.widgetHidden.goBack();       // 埋点IsReturn
                    }
                }, {
                    text: '确定',
                    click: function () {
                        this.hide();
                        //若是单程，则返回去程列表页
                        if (flightDetailsData && flightDetailsData.items && flightDetailsData.items.length > 1) {
                            backUrl = "#backlist";
                        }
                        me.hideLoading(); //非渲染
                        selAddrStore.remove();
                        passengerEditStore.remove();
                        airportDeliveryStore.remove();
                        flightPickTicketStore.remove();

                        me.repeatAlert = false;
                        setTimeout(function () {
                            if (!flightListStore.get() && window.localStorage.length === 3) {
                                me.back('index');
                            } else {
                                me.back(backUrl);
                            }
                            me.widgetHidden.goBack();   // 埋点IsReturn
                        }, 200);
                    }
                }]
            });
            backAlert.show();
        },
        forwardToTravalPackage: function () {
            this.forward("#travalpackagesdesc");
        },
        //passenger
        readmeAction: function () {         //common             //TODO:
            var html = ['<div class="flight-windows">',
                        '<div class="flight-windows-hd">姓名填写说明<i class="flight-icon-close"></i></div>',
                        ' <div class="flight-windows-bd">',
                        ' <p>1）乘客姓名必须与登机时所用证件上的名字一致；持护照登机的外宾，须按护照上的顺序填写且不区分大小写。</p>',
                        ' <p>2）姓名中包含生僻字或者繁体字，请从生僻字开始之后的中文都用拼音代替，如：王喆敏，请填写”王zhemin"</p>',
                        ' <p>3）姓名过长时请使用缩写，如：”买买提不拉多娜萨日娜阿诺凡“ 简写为 ”买买提不拉多娜萨日娜阿“</p>',
                        '</div>',
                        '</div>' ].join('');
            html = $(html);
            if (!mask) {
                mask = new Mask({
                    html: html, // 弹窗html
                    closeDom: '.flight-windows' // 弹窗关闭按钮
                });
            }
            mask.show();
        },
        orderDetailAction: function (e) {
            var me = this;
            var ticketsCnt = me.vPassenger.getTicketsCount(passengerQueryStore);
            var isPaybtn = $(e.target).hasClass('j_btn');
            if (View.isShowLoad || isPaybtn || (!ticketsCnt[0] && !ticketsCnt[1] && !ticketsCnt[2])) {
                return;
            }
            // 组装相应数据结构用来渲染价格清单模板
            var flightDetailData = flightDetailsStore.get();
            var items = flightDetailsStore.getAttr('items');
            var selInsure = flightOrderStore.getAttr('selInsure');
            var insure_detail = me.$el.find('#insure_detail');
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
            if (flightOrderStore.getAttr('selCoupons') && couponBalance && +couponBalance > 0 && user && user.IsNonUser == false && (+items[0].policy.rebateAmt > 0 || (items.length > 1 && +items[1].policy.rebateAmt > 0))) {
                orderDetailData.coupon = { amount: parseInt(items[0].policy.rebateAmt), count: orderDetailData.ticketsCnt[0] };
                orderDetailData.coupon += items.length > 1 ? parseInt(items[1].policy.rebateAmt) : 0;
            }
            $('body').off('click.bookingInfo.hideOrderDetail').on('click.bookingInfo.hideOrderDetail','#order-detail', Futility.createCallback(me.fnToggleAction, orderDetailData, 999) );
            
            me.fnToggleAction( orderDetailData );
            e.stopImmediatePropagation();
        },
        fnToggleAction: function( orderDetailData, zindex ){
            var nodeOrderDetails = $('.j_orderDetails');
            var mask = $('#order-detail-mask');
            var b = nodeOrderDetails.hasClass('money-btn-detailon');
            var payBox = $('#paybtn');
            var payZindex = parseInt(payBox.css('z-index'));
            if(b){
                me.elsBox.orderDetail.hide().html('');
                typeof zindex != 'undefined'? payBox.css('z-index', zindex): payBox.css('z-index', payZindex - 4000);
            }else{
                me.elsBox.orderDetail.html(me.orderDetailtplfun(orderDetailData||'')).show();
                typeof zindex != 'undefined'? payBox.css('z-index', zindex): payBox.css('z-index', payZindex + 4000);
            }
            mask.toggle();
            nodeOrderDetails.toggleClass('money-btn-detailon');
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
        viewInsure: function (e) {          // 查看保险信息
            // update by rhhu 
            var url = '#insuranceinfo!' + $(e.currentTarget).attr('data-typeid');
            this.vInsurance.viewInsure(url);
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
        switchInsure: function (scope) {
            var $this = this;
            var insure_detail = $this.$el.find('#insure_detail'),
                insure_detail_i = insure_detail.find('em i'),
                isSelInsure = scope.getStatus() ? 1 : 0,
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
        fnAdjustData: function(DelItemsData, flightDeliveryData ){         //non of the main business
            var me = this;
            var fee = DelItemsData[0] ? DelItemsData[0].exinfo.fee : 0;
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
                        flightDeliveryStore.setAttr('paytype', me.i_getPayType(v.exinfo.pays));
                        flightDeliveryData = flightDeliveryStore.get(me.UserID);
                    }
                }
                return flightDeliveryData.type == v.type;
            });
            if (!supportDel) {
                flightDeliveryData = { type: 1 };
                flightDeliveryStore.setAttr('type', 1, me.UserID);
            }
            return {
                flightDeliveryData: flightDeliveryData ,
                fee : fee
            };
        },
        /*
        * 模板数据渲染
        * */
        renderList: function (data) {
            var me = this;
            var flightDeliveryData = flightDeliveryStore.get(me.UserID) || { type: 1 };
            var paytype = flightDeliveryData.paytype;
            var DelItemsData = me.DelItemsData;
            var fee;
            if (!DelItemsData.length) {//增加配送方式的容错处理 郑开文 2014-8-26 bug：0056112      XXX
                flightDeliveryData = { type: 1 };
                flightDeliveryStore.setAttr('type', 1, me.UserID);
            } else if (DelItemsData && DelItemsData.length) {
                var adjustedData = me.fnAdjustData(DelItemsData, flightDeliveryData );
                flightDeliveryData = adjustedData.flightDeliveryData;
                fee = adjustedData.fee;
            }

            var postType = +flightDeliveryData.type;
            var postAddressData = postType == 2 ? postAddressStorage.get(me.UserID) : postType == 16 ? airportDeliveryStore.get() : null;
            var delivery = {
                fee: (postType == 32 && (flightDeliveryData.paytype == 2 || flightDeliveryData.paytype == 0)) ? fee : 0,
                sendFee: fee, // 快递费用
                type: postType
            };
            flightDeliveryStore.setAttr('deliveryInfo', delivery); //  保存配送方式及费用
            
            data.post = delivery;
            me.vFlightInfo.renderList(data);
            me.vInsurance.render(data);                            //update by rhhu (绑定保险模板)
            me.vVouchers.renderInvoice(DelItemsData, data, flightDeliveryData, paytype, invoice_switch);
            me.contextWeaver(DelItemsData, data, flightDeliveryData, paytype);

            //查询消费券并绑定
            me.i_QueryCustomerCoupon( data);
            // update by rhhu  旅行套餐  
            me.vTravelPackages.render(data, packageSelectStore, passengerQueryStore);
            // 公告
            me.elsBox.notice_box.html(this.noticetplfun(data));
            //绑定消费券
            // this.elsBox.coupons_box.html(this.couponstplfun(data));
            //绑定支付信息
            data.payAmt = me.vPayment.i_accountTotalPrice();
            me.elsBox.pay_box.html(me.paytplfun(data)).show();
            me.$el.find('#flightBox').show();
            //建行
            if (flightCCBStore.getAttr("isCCB")) {
                me.$el.find("#js_flight-top").hide();
                me.$el.find(".flight-loginline-fixed").hide();
                me.$el.find(".flight-loginline").hide();
            }
        },
        contextWeaver: function (DelItemsData, data, flightDeliveryData, paytype ) {
            var me = this;
            if (flightDeliveryData.type == 16 || (DelItemsData.length == 1 && DelItemsData[0].type == 16)) {
                flightDeliveryData.type = 16;
                me.$el.find('#invoice_switch').attr('data-type', 16);
                var fnCallback = function(){
                    me.vVouchers.i_updateZqAir( ); //更新机场自取模板
                };
                me.vVouchers._loadDependences_(vVoucherRender, ['vVoucherTask'], fnCallback );
            } else {
                if (DelItemsData.length) {
                    me.vVouchers.updateAddrList(); //更新邮寄地址模板
                }
            }
            var flightOrderData = flightOrderStore.get() || {};
            if ((+data.flag & 4) != 4) {
                var insure_switch = new cUI.cuiSwitch({
                    rootBox: me.$el.find('#insure_switch'),
                    // update by rhhu (add check flightOrderData has selInsure)
                    checked: (flightOrderData["selInsure"]) ? flightOrderData["selInsure"] : false,
                    changed: function () {
                        me.switchInsure(this);
                    }
                });
                if (data.insurances && data.insurances.length && flightOrderData.selInsure) { // 根据保险开关来显示或隐藏保险说明链接
                    $('#package-desc a:nth-of-type\(1\)').show();
                } else {
                    $('#package-desc a:nth-of-type\(1\)').hide();
                }
            }
        },
        //查询消费券余额
        i_QueryCustomerCoupon: function (detaildata) {         //Coupon
            if (!userStore.isLogin()) {
                return;
            }
            var me = this;
            var tempCouponstplfun = me.couponstplfun;
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
            if (!detaildata.order) {
                detaildata.order = flightOrderStore.get() || {};;
            }
            detaildata.CRCount = pcount;
            customerCouponModel.excute(function (data) {
                if (data.amt >= 0) {
                    detaildata.couponBalance = data.amt;
                    flightDetailsStore.setAttr("couponBalance", data.amt);
                    me.renderCouponBox(detaildata);
                }
            }, function (error) {
                detaildata.couponBalance = 0;
                flightDetailsStore.setAttr("couponBalance", 0);
                me.renderCouponBox(detaildata);
            }, true, me);

        },
        renderCouponBox: function (detaildata) {
            var me = this;
            if (detaildata && detaildata.couponBalance && +detaildata.couponBalance > 0 && detaildata.user && detaildata.user.IsNonUser == false && (+detaildata.items[0].policy.rebateAmt > 0 || (detaildata.items.length > 1 && +detaildata.items[1].policy.rebateAmt > 0))) {
                me.elsBox.coupons_box.html(me.couponstplfun(detaildata));
                var coupons_switch = new cUI.cuiSwitch({        // 消费券启用开关
                    rootBox: me.$el.find('#coupons_switch'),
                    checked: !!(detaildata.order && detaildata.order.selCoupons && (+detaildata.order.selCoupons) > 0),
                    changed: function () {
                        me.couponsSwitchAction(this); //是否使用消费券返现
                    }
                });
            } else {
                me.elsBox.coupons_box.html('');
            }
        },
        showRebate: function (e) {                      //XXX
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
        // 使用消费券返现
        couponsSwitchAction: function (scope) {
            //flightOrderStore
            var isSelCoupons = 0;
            flightOrderData = flightOrderStore.get();
            flightOrderData = flightOrderData ? flightOrderData : {};
            if (scope.getStatus()) {
                isSelCoupons = 1;
            }
            flightOrderStore.setAttr('selCoupons', isSelCoupons);
        },
        //报销凭证
        i_getPayType: function (pays) {
            if (typeof pays === 'undefined') {
                if (this.DelItemsData && this.DelItemsData[0] && this.DelItemsData[0].exinfo) {
                    pays = this.DelItemsData[0].exinfo.pays || [];
                }
            }
            return pays.length ? pays[0].paytype : 0;
        },
        //报销凭证
        getExInfoByPayType: function (paytype, pays) {
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
        setContact: function (e) {                  //手机号
            var flightOrderData = flightOrderStore.get()||{};
            var contact = flightOrderData.contact ? flightOrderData.contact : {};
            //1.若用户填写了联系人或联系手机号码，则记录下来
            var target = $(e.currentTarget);
            var value = target.val().trim();
            contact.mphone = value; //记录联系人电话
            flightOrderStore.setAttr('contact', contact);
        },
        /*消费券说明*/
        viewCoupons: function (e) {         //Coupon
            var flightDetailsData = flightDetailsStore.get();
            if (flightDetailsData) {
                this.forward('#coupons');
            } else {
                this.hideLoading(); //非渲染
                this.showAlert();
                return;
            }
        },
        beforePayAction: function () {              // 分到每个模块的check里面
            // 更新passengers 埋点信息
            this.widgetHidden.setPassengersMDInfo();
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
            if ( this.vPassenger.beforePayValidate() &&
                 this.vPassenger.checkSupportCards(flightDetailsStore, passengerQueryStore, DataControl)&& 
                 this.vPassenger.checkMinPassenger(flightDetailsStore, passengerQueryStore)) {
                if (flightDetailsStore.get() && flightDetailsStore.get().needinv) {     //needinv XXX
                    var flightDeliveryData = flightDeliveryStore.get(this.UserID) || { type: 1 }; //发票抬头验证，若为“空”则弹出提示 wyren@ctrip.com 2014-4-2
                    if (!(+flightDeliveryData.type <= 1)) {   //报销凭证打开状态
                        if (this.$el.find('#js_invoice_title').val() == '') {
                            Futility.showTip(DataControl.TIPICONS.RED, '#js_invoice_title', '请填写发票抬头', true);
                            mdStore.increaseCntByKey('NextStepNotPassClick'); //埋点NextStepNotPassClick
                            return false;
                }}}
                if (detail.ispackage && packageSelectStore.getAttr("pkgtype", this.UserID) == 2 && !userStore.isLogin()) {
                    this.showAlert("会员才可以使用礼品卡，请先登录", false);
                    return;
                }
                this.payAction();
            } else {
                mdStore.increaseCntByKey('NextStepNotPassClick'); //埋点NextStepNotPassClick
            }
        },
        buildToken: function(data){// 生成 token
            var bustype = 101; //国内机票
            var order = {};
            var getRam = function (n) {                // cUtility.getGuid();
                var rnd = "";
                for (var i = 0; i < n; i++)
                    rnd += Math.floor(Math.random() * 10);
                return rnd;
            };
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
            var auth = data["head"]["auth"];
            var rid = getRam(19); //(+new Date) + ""; //data["rid"] || "0";
            var tokenObj = {
                "oid": oid,
                "bustype": bustype,
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
            var delivery = flightDeliveryStore.get(me.UserID);
            if (data["needInvoice"] == true) {
                tokenObj["needInvoice"] = data["needInvoice"];
                tokenObj["invoiceDeliveryFee"] = (+delivery.type == 32 && (delivery.paytype == 0 || delivery.paytype == 2)) ? delivery.deliveryInfo.sendFee : 0;
                tokenObj["includeInTotalPrice"] = true;
            }
            
            return { 
                token:Crypt.Base64.encode(JSON.stringify(tokenObj)),
                oid: oid
            };
        },
        /*转入支付2.0*/ //TODO: test 
        jumpToPaymentV2: function (data) {              //payment
            var me = this;
            flightBookingResultStore.set(data);
            if (data["rc"] == 0) {                      //成功
                var buildTokenResult = me.buildToken(data);
                var paymentURL = Futility.buildUrl(buildTokenResult);
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
                me.jump(paymentURL);
            } else { //不成功
                me.showToast('支付失败，请稍后再试');
            }
        },
        i_savePassengers: function(){
            return this.vPassenger.savePassengers();
        },
        i_getBxQty: function(){
            return this.vInsurance.getBxQty();
        },
        i_getSels: function(){
            return this.vInsurance.getSels();
        },
        i_setInsuranceIntoFlightOrderStore: function(bxQty){
            this.vInsurance.setInsuranceIntoFlightOrderStore(bxQty);
        },
        /*提交订单*/
        payAction: function () {
            var me = this,
                pcount = passengerQueryStore.getAttr('selCount') ;
            var flightDetailsData = flightDetailsStore.get();
            //  1-5
            var fnCallback = function(){
                var verification = me.vOrder.i_verifications(),
                    adultTicketCnt = verification.adultTicketCnt;
                if( verification.bBool ){ //vary verifications before pay
                    return ;
                }
                var passengers = verification.passengers;
                /*6. 重复订单 */
                var RepeatUrl = "Flight/Domestic/Order/RepeatOrderCheck",
                    RepeatData = {};
                if (!me.isRepeatOrder && userStore.isLogin() ) {
                    RepeatData = RepeatOrderCheckModel.mappingRequest(passengers, flightDetailsData); 
                    RepeatData.timeout = 300;
                    RepeatOrderCheckModel.setParam(RepeatData);
                    me.vOrder.fnCheckRepeatOrder(); //TODO:
                }
    
                //非会员直接跳过重复订单检测
                if (userStore.isLogin()) {
                    if (!me.isRepeatOrder) return;
                }
                if (this.vOrder.i_checkTicketAmount(passengers)) {
                    return;
                }
                me.showLoading(true);
                
                var setFlightOrderStoreResult = me.vOrder.i_setFlightOrderStore(); 
                var contact = setFlightOrderStoreResult.contact;
                var order = setFlightOrderStoreResult.order;
                
                me.vOrder.i_setFlightOrderStoreAsParam(flightDetailsData, passengers, order);
                
                var data = flightOrderStore.get();
                
                var amt = me.vPayment.i_accountTotalPrice();
                var bxQty = me.vInsurance.getBxQty();
                var queryparam = me.getOrderCreateParam(amt, pcount, bxQty); //拼接下单参数
                
                amt = queryparam.oinfo.price;
                userInfo = userStore.getUser();
                //埋点
                me.widgetHidden.mdPayAction();
    
                /*非登入用户*/
                if (!userStore.isLogin()) {
                    me.strLogin(contact, queryparam, amt, adultTicketCnt);
                } else {                /*登入用户*/
                    me.orderCreate(queryparam, amt, adultTicketCnt);
                }
            };
            Futility.getAssociationByModuleName.bind(me)( 'vOrder', ['vOrder'], fnCallback );
        },
        strLogin: function(contact, queryparam, amt, adultTicketCnt ){
            var me = this;
            $.ajax({
                url : '/html5/Account/NonUserLogin',
                data : contact.mphone,
                type : 'post',
                dataType : 'json',
                timeout : 200000,
                success : function(dataLogin) {
                    if (dataLogin && +dataLogin.ServerCode == 1) {
                        if (dataLogin.Data.IsNonUser == true) {
                            dataLogin.Data.LoginToken = '';
                        }
                        userStore.removeUser();
                        userStore.setUser({
                            "UserID" : dataLogin.Data.UserID,
                            "IsNonUser" : true,
                            "LoginToken" : "",
                            "LoginName" : null,
                            "Auth" : dataLogin.Data.Auth,
                            "ExpiredTime" : null
                        });
                        me.orderCreate(queryparam, amt, adultTicketCnt);
                    } else {
                        me.hideLoading();
                        me.showAlert('提交订单失败，请重新提交！', false);
                    }
                },
                error : function(err) {
                    me.hideLoading();
                    me.showAlert('提交订单失败，请重新提交！', false);
                }
            });
        },
        /*OPEN API 提交订单*/
        orderCreate: function (queryparam, amt, pcount) {           //下单
            flightOrderCreateModel.setParam(queryparam);
            var me = this;
            var flightDetailsData = flightDetailsStore.get();
            var flightType = queryparam.oinfo.triptype; //1单程 2往返程
            flightOrderCreateModel.excute(function (data) {
                me.hideLoading();
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

                if (data.rc == 0) {                     //成功
                    me.widgetHidden.MDsendUBT(data);            //下单埋点
                    if (data.patarc == 2) { //pata检测结果有变化 
                        /*0 = PATA无结果
                        1 = PATA无变化
                        2 = 价格有变化*/
                        var title = "<strong>航司实时价格调整确认</strong></br>";
                        var message = ""; //pata提示内容
                        if (flightType == 1) {          //单程
                            var price = flightDetailsData.items[0].policy.price;
                            message = me.vPayment.i_formatPataMessage(data.priinfos[0].chapri, price, "");
                            if (message) {
                                amt += (data.priinfos[0].chapri - price) * pcount;
                            }
                        } else {
                            for (var i = 0; i < data.priinfos.length; i++) {
                                var p = data.priinfos[i];
                                var price = flightDetailsData.items[p.segno - 1].policy.price;
                                var p = data.priinfos[i];
                                var msg = "";
                                if (p.segno == 1) {
                                    msg = me.vPayment.i_formatPataMessage(data.priinfos[i].chapri, price, "第一程");
                                } else {
                                    msg = me.vPayment.i_formatPataMessage(data.priinfos[i].chapri, price, "第二程");
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
                            me.alert = new cUI.Alert({
                                title: '提示信息',
                                message: message,
                                buttons: [{
                                    text: '不接受',
                                    click: function () {
                                        flightSearchStore.setAttr("fullCabin", true);
                                        this.hide();
                                        me.back("list");
                                    }
                                }, {
                                    text: '接受',
                                    click: function () {
                                        this.hide();
                                        me.jumpToPaymentV2(data);
                                    }
                                }]
                            });
                            me.alert.show();
                        }
                    } else {
                        data["amt"] = amt;
                        me.jumpToPaymentV2(data);
                    }
                } else if (data.rc == 1) {
                    me.showToast(data.rmsg);
                }
            }, function (error) {
                me.hideLoading();
                if (+error.head.errcode == 1005) {
                    me.showAlert("用户信息已过期，请重新登录！", false);
                } else {
                    me.showAlert(error.rmsg || error.msg, false);
                }
                console.log(error);
            }, false, me);
        },
        //拼接open api 下单的参数
        //next step
        getOrderCreateParam: function (amt, pcount, bxQty) {//common functions
            var me = this;
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
            var abtestinfo = $("#ab_testing_tracker").val();            //ABTEST版本信息
            try {
                param.hver = 'v2.4.8-' + (abtestinfo ? abtestinfo.split(':')[abtestinfo.split(':').length - 1].substring(0, 1) : '');
            } catch (e) {
                param.hver = 'v2.4.8';
            }

            //var fn = (function(passengerQueryStore,flightDetailsStore,selFlightInfoStore,flightSearchStore,packageSelectStore,userStore,flightOrderInfoInviceStore) {
            var passengerInfo = passengerQueryStore.get();
            var CRCount = 0; //返现数量，只计算成人票种

            if (passengerInfo && passengerInfo.passengers) {
                $.each(passengerInfo.passengers, function(index, p) {
                    if (p.selected == 1 && (p.ticketType == 1)) {
                        CRCount++;
                    }
                });
            }
            var flightDetailsData = flightDetailsStore.get(), 
                selFlightInfoData = selFlightInfoStore.get(),
                originData = flightDetailsData.originData, 
                flightSearchData = flightSearchStore.get();
            //获取Storage存储的航班查询条件
            if (selFlightInfoData.arrive && flightDetailsData.items.length > 1 && selFlightInfoData.arrive.cabin && flightSearchData.tripType && (+flightSearchData.tripType) > 1) {
                param.oinfo.triptype = 2;                //往返
            } else {
                param.oinfo.triptype = 1;                //单程
            }
            if (userStore.isLogin()) {//是否非会员预定
                param.oinfo.annoy = false;
            } else {
                param.oinfo.annoy = true;
            }

            param.oinfo.chkno = originData.pols[0].chkno;
            //pata检测结果
            param.oinfo.price = amt;
// end of the param.oinfo;
            
            var pkgtype = packageSelectStore.get(this.uid).pkgtype;
            //二选一套餐类型
            var rebateAmount = 0;
            //返现总额
            var adjustInCycleResult = me.adjustInCycle( rebateAmount, param, CRCount, flightDetailsData );
            var segs_orderCreate = adjustInCycleResult.segs_orderCreate,
                rebateAmount = adjustInCycleResult.rebateAmount,
                rebateifno = adjustInCycleResult.rebateifno;
                
            param = adjustInCycleResult.param;
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
            param.needinvoice = flightDetailsData.needinv;
            //是否需要发票
            param = me.paramNeedinvoice(param);
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
            param = me.paramDelinfoExtinfo(param, flightDeliveryData);
            //配送信息
            param = me.paramDeliveryInfo(param, flightDeliveryData);
            param = me.paramPsgsPsgsettingsSegs(param);         //乘机人信息列表
            param.segs.push(segs_orderCreate); 
            return param;
        },
        paramDelinfoExtinfo: function(param, flightDeliveryData){
            param.delinfo.delvtype = flightDeliveryData.type;
            
            if (flightDeliveryData.type == 32) {
                var paytype = flightDeliveryStore.getAttr('paytype');
                var payInfo = this.getExInfoByPayType( paytype);
                var fee = flightDeliveryData.deliveryInfo.fee || flightDeliveryData.deliveryInfo.sendFee;
                if (paytype == 2 || paytype == 0) {
                    param.delinfo.fee = fee;
                }

                param.delinfo.extinfo = {
                    "paytype" : paytype == -1 ? 2 : paytype,
                    "amount" : paytype == -1 ? 0 : payInfo.amount
                };
            } else {
                param.delinfo.extinfo = null;
            }
            return param;
        },
        paramDeliveryInfo: function(param, flightDeliveryData){//配送信息
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
            return param;
        },
        paramPsgsPsgsettingsSegs: function(param){//乘机人信息列表
            var passengerInfo = passengerQueryStore.get();
            for (var i in passengerInfo.passengers) {
                var p = passengerInfo.passengers[i];
                if (+p.selected == 1) {
                    var formatBirth = null;
                    if (+p.defaIdCard.type == 1) {
                        formatBirth = c.base.Date.parse(Futility.getBirth(p.defaIdCard.no)).format('Y-m-d');
                    } else {
                        formatBirth = c.base.Date.parse(p.birth).format('Y-m-d');
                    }

                    param.psgs.push({
                        psgid : p.inforId.toString().substr(0, 9),
                        psgname : p.language == 'CN' ? p.cname : p.ename,
                        psgnamen : p.ename,
                        psgtype : DataControl.getPsgType(0, p),
                        birth : formatBirth,
                        cnum : p.defaIdCard.no,
                        ctype : p.defaIdCard.type,
                        gender : p.gender,
                        nation : p.natl,
                        ffpinfo : []
                    });
                    param.psgsettings.push({
                        segno : 0,
                        psgid : p.inforId.toString().substr(0, 9),
                        tkttype : p.ticketType > 0 ? p.ticketType : 1
                    });
                }
            }
            return param;
        },
        paramNeedinvoice: function(param){
            if (param.needinvoice) {
                var userid = userStore.isLogin() ? userStore.getUser().UserID : this.UserID;
                var iinfo = flightOrderInfoInviceStore.getAttr(userid);
                var title = "";
                if (iinfo) {
                    title = iinfo.title;
                }
                var invoiceinfo = flightOrderInfoInviceStore.getAttr("invoiceinfo", userid) || {};
                param.invoices = [{
                    invtype : invoiceinfo.intype ? +invoiceinfo.intype : 1,
                    title : title,
                    body : ""
                }];
            }
            return param;
        },
        adjustInCycle: function( rebateAmount, param, CRCount, flightDetailsData ){
            var me = this;
            var originData = flightDetailsData.originData;
            var rebateifno = null;             //返现信息
            //订单总金额，票价 + 税（机建） + 燃油 + 保险 + 礼品卡 + 配送
            var segs_orderCreate = {
                segno : 0,
                prdid : originData.prdid,
                polid : "" ,
                rebateifno: rebateifno
            };
            for (var i = 0; i < originData.segs.length; i++) {
                var seg = originData.segs[i];
                //航程信息
                var policy = originData.pols[i];
                //政策信息
                if (i == 0) {
                    segs_orderCreate.polid = policy.polid;
                }

                var prices = policy.prices;
                //价格信息
                for (var k = 0; k < prices.length; k++) {
                    var price = prices[k];
                    param.prices.push({
                        segno : i + 1,
                        psgtype : price.psgtype,
                        price : price.price,
                        fuel : price.fuel,
                        tax : price.tax
                    });
                    //价格信息
                }
                var promos = policy.promos;
                //活动信息
                for (var n = 0; n < promos.length; n++) {
                    var pro = promos[n];
                    var count = 0;
                    var promosprice = pro.price;
                    if (pro.promotype > 5) {// 过滤掉服务端不接受的promotion type(此字段也是服务端下发的：（)
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
                        promosprice = flightDetailsData["items"][i]["policy"]["rebateAmt"];
                        //返现从航班列表带入 modify by kwzheng 2014-6-18
                        rebateAmount += CRCount * promosprice;
                        rebateifno = {
                            promoctgy : pro.promoctgy,
                            promoid : pro.promoid,
                            promotype : pro.promotype,
                            currency : pro.currency,
                            price : 0,
                            cnt : 1,
                            amount : 0
                        };
                    } else {
                        count = pcount;
                        var amount = count * promosprice;

                        param.prolst.push({
                            promoctgy : pro.promoctgy,
                            promoid : pro.promoid,
                            promotype : pro.promotype,
                            currency : pro.currency,
                            price : promosprice,
                            cnt : count,
                            amount : amount
                        });
                    }
                }
                if (i == 0) {                    // update by rhhu
                    param = me.vTravelPackages.i_setPaymentParam(policy, param);
                }
            }
            return {
                segs_orderCreate: segs_orderCreate,
                param: param ,
                rebateAmount: rebateAmount,
                rebateifno: rebateifno
            };
        },
        //hidden
        telInputFinish: function (e) {
            var linkTel = $.trim($(e.target).val());
                Futility.i_checkMobileNumber.bind(this)(e.target);
                
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
            var flightDetailsData = flightDetailsStore.get();
            if (flightDetailsData) {
                this.forward("packageselect");
            } else {
                this.hideLoading(); //非渲染
                this.showAlert();
                return;
            }
        },
        showAlert: function (msg, isBack) { //common functions
            var me = this;
            isBack = typeof isBack === 'undefined' ? true : isBack;
            me.alert = new cUI.Alert({
                title: '提示信息',
                message: msg ? msg : '对不起，由于您长时间未操作，订单已失效，请重新查询预订！',
                buttons: [{
                    text: '知道了',
                    click: function () {
                        if (isBack) {
                            me.backAction(1);
                            me.hideLoading();
                        }
                        this.hide();
                    }
                }]
            });
            me.alert.show();
        },
        showLoading: function (isMask) { //interface ,using
            View.isShowLoad = true;
            myLoad.show();
            if (isMask) {
                globalMask = globalMask || new Mask();
                globalMask.show();
            }
        },
        /**
         * can't be removed. used by all children.
 * @param {Object} isMask
         */
        hideLoading: function (isMask) { //common functions
            myLoad.hide();
            View.isShowLoad = false;
            isMask && globalMask ? globalMask.hide() : '';
        },
        i_isShowLoad: function(){
            return View.isShowLoad ;
        }
    });
    View.isShowLoad = false;
    window.__isRequireBookininfoSucc = true;
    
    return View;
    
});
requirejs.onError = function (err) {
    console.log(err.requireType);
    if (err.requireType === 'timeout') {
        console.log('modules: ' + err.requireModules);
    }
    throw err;
};
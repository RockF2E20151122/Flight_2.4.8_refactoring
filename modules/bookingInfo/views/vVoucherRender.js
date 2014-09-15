"use strict";
//requirejs.config({
//    paths: {
//        mVouchers: 'flight/modules/bookingInfo/models/c.mVouchers',
//        sFlight: 'flight/modules/bookingInfo/models/sFlight',
//        vVouchersCorporater: 'flight/modules/bookingInfo/views/vVouchersCorporater'

//    }
//});

define('vVoucherRender',['vSupperChild','libs', 'c', 'cUI'
  , 'CommonStore', 'FlightStore'
  , buildViewTemplatesPath('../modules/bookingInfo/templates/tVoucher.html'), 'cWidgetFactory', 'cWidgetCalendar'],
    function (vSupperChild,libs, c, cUI,
             CommonStore, FlightStore,
             html, WidgetFactory) {

        var addrListModel,
            cbase = c.base;

        var vVoucherRender = new c.base.Class(vSupperChild, {
            _init_: function(){
                this.Calendar = WidgetFactory.create('Calendar');       //notice: the parentView.calendar in the main view.
                this.$el = this.opts.parentView.$el;
                this.data = this.opts.data;
                this.$el.append(html);
                this.render(); // 获取容器和template
            },
            render: function () {
                this.elsBox = {
                    delivery_tpl: this.$el.find("#deliverytpl"), //配送方式模板
                    deliverytpl_tab: this.$el.find("#deliverytpl_tab"), // 配送方式选项
                    deliverytpl_cost: this.$el.find("#deliverytpl_cost"), //配送费用选项
                    deliverytpl_mail_1: this.$el.find("#deliverytpl_mail_1"), // 无常用地址时的模板
                    deliverytpl_mail_2: this.$el.find("#deliverytpl_mail_2"), // 有常用地址时候的模板
                    deliverytpl_zq: this.$el.find("#deliverytpl_zq"), // 机场自取的模板
                    invoiceboxtpl: this.$el.find("#invoice_box") //发票的模版
                };

                this.deliverytplfun = _.template(this.elsBox.delivery_tpl.html());
                this.delmailfun_1 = _.template(this.elsBox.deliverytpl_mail_1.html());
                this.delmailfun_2 = _.template(this.elsBox.deliverytpl_mail_2.html());
                this.delzqfun = _.template(this.elsBox.deliverytpl_zq.html());
                this.deltabfun = _.template(this.elsBox.deliverytpl_tab.html());
                this.delcostfun = _.template(this.elsBox.deliverytpl_cost.html());
                this.invoiceboxfun = _.template(this.elsBox.invoiceboxtpl.html());
            },
            _fireEvents_: function () {
                // 选择快递费用方式
                $(this.$el).off('click.vVouchers.eflight').on('click.vVouchers.eflight', '.flight-bxinfo-kdf dd', this.selectPaymentType.bind(this)); // 选择快递费用方式
                $(this.$el).off('click.vVouchers.eintype').on('click.vVouchers.eintype', '#intype', this.changeInvoiceType.bind(this)); // 选择报销凭证类型
                $(this.$el).off('click.vVouchers.ejs_addrList').on('click.vVouchers.ejs_addrList', '#js_addrList', this.AddrListAction.bind(this)); //选择邮寄地址
                $(this.$el).off('click.vVouchers.ejs_del_tab').on('click.vVouchers.ejs_del_tab', '.js_del_tab', this.showDelListUI.bind(this)); //配送方式
                $(this.$el).off('click.vVouchers.edoneAddres').on('click.vVouchers.edoneAddres', '#done-address', this.zqinairselect.bind(this)); //取票柜台
                $(this.$el).off('click.vVouchers.edatePicker').on('click.vVouchers.edatePicker', '#date-picker', this.calendarAction.bind(this)); //取票日期
                $(this.$el).off('click.vVouchers.edateZqtime').on('click.vVouchers.edateZqtime', '#date-zqtime', this.showZqTimeUI.bind(this)); //取票时间 
                
                //not be tested functionalities: TODO:test
                $(this.$el).off('click.vVouchers.eselectCity').on('click.vVouchers.eselectCity', '#selectCity', this.selectCityAction.bind(this)); //选择城市           //TODO: j_
                //'change #js_invoice_title': 'inTitleChangeWrp'
                $(this.$el).off('click.vVouchers.ejs_invoice_title').on('click.vVouchers.ejs_invoice_title', '#js_invoice_title', this.inTitleChange.bind(this)); //发票抬头更改
                //'click .flight-icon-arrrht': 'showinTitleList'
                $(this.$el).off('click.vVouchers.eflightIconArrrht').on('click.vVouchers.eflightIconArrrht', '.flight-icon-arrrht', this.showinTitleList.bind(this)); //‘+’号，跳转发票抬头列表
            },

            /*
             *  选择快递费用方式
             */
            selectPaymentType: function (e) {
                var flightDeliveryStore = this.stores.flightDeliveryStore;
                var target = $(e.currentTarget);
                var paytype = 1;
                var prePaytype = flightDeliveryStore.getAttr('paytype');
                if (!target.hasClass('flight-bxinfo-kdf-current')) {
                    target.addClass('flight-bxinfo-kdf-current');
                    target.siblings('dd').removeClass('flight-bxinfo-kdf-current');
                    paytype = parseInt(target.data('paytype'));
                    flightDeliveryStore.setAttr('paytype', paytype);
                    var deliveryInfo = flightDeliveryStore.getAttr('deliveryInfo');
                    this.parentView.trigger(this.parentView.EVENTS.UPDATEORDERPRICE);
                }
            },
            /*
            渲染报销凭证开关模板
            */
            renderInvoice: function (DelItemsData, data, flightDeliveryData, paytype,
                                    invoice_switch) {
                var me = this;
                var parent = this.parentView;
                var tempDeliverytplfun = this.deliverytplfun ,
                    tempDelcostfun = this.delcostfun ,
                    tempDeltabfun = this.deltabfun;
                
                var flightDeliveryStore = this.stores.flightDeliveryStore,
                    userStore = this.stores.userStore ;
                    
                //报销凭证开关切换事件
                flightDeliveryData.len = DelItemsData.length; //配送方式的种类
                flightDeliveryData.needinv = data.needinv;  //&64==64则渲染发票抬头，否则表示不支持发票
                parent.elsBox.delivery_box.html(tempDeliverytplfun(flightDeliveryData));
                if (flightDeliveryData.type == 32) {
                    $('#gift-card-tips').show();
                }
                invoice_switch = new cUI.cuiSwitch({
                    rootBox: parent.$el.find('#invoice_switch'),
                    checked: DelItemsData.length ? !(!flightDeliveryData.type || (+flightDeliveryData.type) <= 1) : false,
                    changed: function () {
                        var plugSwitch = this;
                        var fnCallback = function(){
                            me.reimbursementAction( plugSwitch);
                            parent.models.postCityModel.excute(function (data) {
                                //postCityStore.set(data)
                            }, function (e) {
                            }, false, plugSwitch);
                        };
                        me._loadDependences_(vVoucherRender, ['vVoucherTask'], fnCallback );
                    }
                });
                if (DelItemsData.length && !(!flightDeliveryData.type || (+flightDeliveryData.type) <= 1)) {
                    parent.models.postCityModel.excute(function (data) {
                        //postCityStore.set(data)
                    }, function (e) {
                    }, false, this);
                }
                if (DelItemsData.length) {// 配送方式服务出错的情况下关闭报销凭证
                    parent.$el.find(".js_del_tab").html(tempDeltabfun(flightDeliveryData)); //配送方式

                    if (DelItemsData && DelItemsData.length && DelItemsData[0].type == 32) { // 配送方式有快递
                        var callback = function (rc) {
                            if (DelItemsData[0].exinfo.pays.length < 2 && (!DelItemsData[0].exinfo.pays[0] || (DelItemsData[0].exinfo.pays[0] && DelItemsData[0].exinfo.pays[0].paytype != 0))) { // 加入收快递费10元钱
                                DelItemsData[0].exinfo.pays.push({ paytype: 0, amount: 0 });
                            }
                            flightDeliveryStore.setAttr('pays', DelItemsData[0].exinfo.pays, parent.UserID);
                            flightDeliveryData = flightDeliveryStore.get(parent.UserID);
                            flightDeliveryData.rc = rc;
                            flightDeliveryStore.setAttr('rc', rc);
                            flightDeliveryData.paytype = (rc == 0) ? ((flightDeliveryData.paytype == -1 || typeof flightDeliveryData.paytype === 'undefined') ? parent.i_getPayType() : flightDeliveryData.paytype) : -1; // 免费
                            flightDeliveryStore.setAttr('paytype', flightDeliveryData.paytype);
                            flightDeliveryData.islogin = userStore.isLogin();
                            flightDeliveryData.fee = DelItemsData[0].exinfo.fee;
                            flightDeliveryData.isLogin = userStore.isLogin();//判断是否已登录,用于1000积分兑换下面一行字的控制显示 add by zhengkw 2014-08-13
                            parent.$el.find(".js_del_cost").html(tempDelcostfun(flightDeliveryData)); // 配送费用选项
                            me.parentView.trigger(me.parentView.EVENTS.UPDATEORDERPRICE);
                        };
                        //重复地址判断
                        me.repeatAddrCheck( callback);
                    }
                }
                me.updateInvoiceBox();
            },
            updateInvoiceBox: function () {
                var parent = this.parentView,
                    invoiceTitleStore = this.stores.invoiceTitleStore,
                    passengerQueryStore = this.stores.passengerQueryStore,
                    flightOrderInfoInviceStore = this.stores.flightOrderInfoInviceStore,
                    userStore = this.stores.userStore,
                    flightDetailsStore = this.stores.flightDetailsStore,
                    flightOrderStore = this.stores.flightOrderStore;
                    
                var invoiceInfoData = {};
                var userid = userStore.isLogin() ? userStore.getUser().UserID : null;
                var fds = flightDetailsStore.get();
                if (fds != null && fds["needinv"]) { //支持发票
                    invoiceInfoData = this.QueryInvoiceInfoData(invoiceTitleStore, flightOrderInfoInviceStore, flightOrderStore, 
                        passengerQueryStore, invoiceInfoData, userid, flightDetailsStore);
                        
                    flightOrderStore.setAttr('iinfo', invoiceInfoData);
                    parent.$el.find('#js_invoice_box').html(this.invoiceboxfun(invoiceInfoData));
                }
            },
            /**
            * 重复地址判定
            */
            repeatAddrCheck: function ( cb) { //报销凭证
                var userStore = this.stores.userStore,
                    postAddressStorage = this.stores.postAddressStorage,
                    selAddrStore = this.stores.selAddrStore,
                    addrCheckModel = this.models.addrCheckModel;

                var _this = this.parentView;
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

            /*
            报销凭证校验,统一采用报错机制和方法 modify by zhengkw 2014-8-13
            used by beforePayAction;
            */
            verifyAddrInput: function (showTip, mdStore, recipient, addr, zip) { //邮寄地址效验
                recipient = $.trim(recipient);
                addr = addr.replace(/[\s]/g, '');
                zip = $.trim(zip);

                var rln = recipient.length;
                var result = true;
                if (rln == 0) {
                    result = false;
                }
                mdStore.setAttr('IsWriteAddressee', true);  //埋点IsWriteAddressee
                if ((recipient.match(/^[a-z0-9]+$/i) && (rln < 4 || rln > 20)) ||
                    (recipient.match(/[\u4e00-\u9fa5]/) && (rln < 1 || rln > 10))) {
                    result = false;
                }

                if (addr.length == 0) {
                    result = false;
                }

                mdStore.setAttr('IsDeliveryAddress', true); //埋点IsDeliveryAddress
                if ((addr.match(/^[a-z0-9]+$/i) && addr.length > 100) ||
                    (addr.match(/[\u4e00-\u9fa5]/) && addr.length > 50)) {
                    result = false;
                }
                if (zip.length == 0) {
                    result = false;
                }
                mdStore.setAttr('IsDeliveryPostCode', true); //埋点IsDeliveryPostCode
                var postreg = /^[0-9]\d{5}$/;
                if (!postreg.test(zip)) {
                    result = false;
                }
                if (!result) {
                    console.log('DataControl.TIPICONS.Blue')
                    showTip(DataControl.TIPICONS.RED, '#js_addrList>span', '请选择报销凭证的配送地址', true);
                    return false;
                }

                return result;
            },

            PickTicketParam: function ( ) {//vVouchers
                //配送方式请求参数
                var selFlightInfoData = this.stores.selFlightInfoStore.get(),
                    searchInfo = this.stores.flightSearchStore.get();
                var param = {};
                //param.ticketIssueCty = searchInfo.items[0].dCtyCode;
                param.triptype = searchInfo.tripType;
                param.ver = 0;
                param.prdid = selFlightInfoData.depart.cabin.pid;
                return param;
            },
            /*
            */
            getCurrentItems: function (data) { //配送方式的数据处理
                var d = data.deliveries || [];
                var sortPays = function (pays) {
                    var temp = null;
                    pays = pays || [];
                    _.sortBy(pays, function (item) {
                        return item.paytype;
                    });
                    var diamondUserPay = _.filter(pays, function (pay) {
                        return pay.paytype == 3;
                    })[0];

                    if (diamondUserPay) {
                        temp = pays[0];
                        pays[0] = diamondUserPay;
                        pays[pays.length - 1] = temp;
                    }

                    pays = _.filter(pays, function (pay) {
                        return pay.paytype != 0;
                    });
                };
                for (var i = 0, len = d.length; i < len; i++) {
                    switch (d[i].type) {
                        case 32:
                            d[i].key = "快递";
                            d[i].index = 0;
                            sortPays(d[i].exinfo.pays); // // Sort pays (3, 1, 2, 0)
                            break;
                        case 2:
                            d[i].key = "邮寄";
                            d[i].index = 1;
                            break;
                        case 16:
                            d[i].key = "机场自取";
                            d[i].index = 2;
                            break;
                        default:
                            d.splice(i, 1);
                            i--;
                            len = d.length;
                            break;
                    }
                }
                return _.sortBy(d, function (n) {
                    return n.index;
                });
            },
            //vVouchers
            inTitleChange: function (e) { //发票抬头输入框change存入store
                //发票模块信息 wyren@ctrip.com 2014.3.27
                var userStore = this.stores.userStore, 
                    flightOrderInfoInviceStore = this.stores.flightOrderInfoInviceStore,
                    flightOrderStore = this.stores.flightOrderStore ;
                var iinfo = {};
                var userid = userStore.isLogin() ? userStore.getUser().UserID : this.parentView.UserID;
                iinfo.title = $('#js_invoice_title') ? $('#js_invoice_title').val() : '';
                flightOrderInfoInviceStore.setAttr(userid, iinfo);
                flightOrderStore.setAttr('iinfo', iinfo);
                if (iinfo.title.length) {
                    Futility.hideTip('#js_invoice_title');
                }
            },
            /*
            *切换报销凭证类型
            */
            changeInvoiceType: function () {

                if (!this.stores.flightDetailsStore.get()) {
                    this.parentView.showAlert();
                    return;
                }
                this.invoiceinfo = this.stores.flightDetailsStore.getAttr('invoiceinfo') || [];
                if (this.invoiceinfo.length == 1) {
                    return;
                }
                var selectinvocie = this.stores.flightOrderInfoInviceStore.getAttr('invoiceinfo') || {};
                var index = 0;
                for (var i in this.invoiceinfo) {
                    this.invoiceinfo[i].key = this.invoiceinfo[i].inname;
                    this.invoiceinfo[i].index = i;
                    if (selectinvocie.intype == this.invoiceinfo[i].intype) {
                        index = i;
                    }
                }

                var _this = this;
                var intypeList = new c.ui.ScrollRadioList({
                    title: '凭证类型',
                    index: index,
                    data: this.invoiceinfo,
                    itemClick: function (item) {
                        _this.$el.find("#intype").text(item.key);
                        _this.$el.find("#intype").data('intype', item.index);
                        _this.stores.flightOrderInfoInviceStore.setAttr('invoiceinfo', { intype: item.intype, inname: item.key, len: _this.invoiceinfo.length });
                    }
                });
                intypeList.show();
            },
            showDelListUI: function( e){
                var DelItemsData = this.parentView.DelItemsData;
                if (DelItemsData.length <= 1) return;
                var me = this;
                var index = 0;
                var flightDeliveryStore = me.stores.flightDeliveryStore;
                var flightDeliveryData = flightDeliveryStore.get(this.UserID) || {
                    type: 1
                };
                _.each( DelItemsData, function (n, m) {
                    if (n.type == flightDeliveryData.type) {
                        index = m;
                    }
                });
                var DelList = new c.ui.ScrollRadioList({
                    title: '配送方式',
                    index: index,
                    data: DelItemsData,
                    itemClick: function (item) {
                        me.$el.find(".js_del_tab span.flight-section-sp1").text(item.key);
                        var preType = flightDeliveryStore.getAttr('type');
                        var deliveryInfo = flightDeliveryStore.getAttr('deliveryInfo');
                        var paytype = flightDeliveryStore.getAttr('paytype');
                    
                        flightDeliveryStore.setAttr('type', item.type, me.parentView.UserID);
                        me.parentView.trigger(me.parentView.EVENTS.UPDATEORDERPRICE);
                        me.$el.find("#invoice_switch").data("type", item.type);
                        if (item.type == 16) {                                          // 机场自取
                            me.i_updateZqAir();
                            me.stores.postAddressStorage.setAttr("edit", 0, me.parentView.UserID);
                        } else {
                            me.updateAddrList();
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
            zqinairselect: function () { //机场自取柜台选择
                this.parentView.forward('zqInAirportSelect');
            },
            calendarAction: function () { //日历选择
                var me = this;
                var parent = me.parentView;
                var fnCallback = function(){
                    if (parent.calendar || me.i_showCalendarUI()) {
                        //this._updateSelectDate();
                        parent.calendar.update({
                            'validStartDate': new Date(parent.zqTimeObj.validDate[0][0]),
                            'validEndDate': new Date(parent.zqTimeObj.validDate[parent.zqTimeObj.validDate.length - 1][1])
                        });
                        parent.scrollPosY = $(window).scrollTop();
                        window.scrollTo(0, 0);
                        parent.$el.hide();
                        parent.calendar.show();
                    }
                };
                //vVoucherRender, vVoucherTask
                me._loadDependences_(vVoucherRender, ['vVoucherTask'], fnCallback );
            },
            showZqTimeUI: function (e) { //选择取票时间UI
                var me = this, parent = me.parentView;
                var target = $(e.currentTarget);
                var index = 0,
                    HourData = [],
                    defaHour = c.base.Date.parse(parent.zqTimeObj.selectDate.toString()).format("H:i");
                _.each(parent.zqTimeObj.defaHourList, function (n, m) {
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
                        parent.zqTimeObj.selectDate.setHours(item.val.slice(0, 2), item.val.slice(3));
                        parent.$el.find("#date-zqtime span").html(item.val);
                        me.stores.airportDeliveryStore.setAttr("time", parent.zqTimeObj.selectDate.toString(), this.citykey);
                    }
                });
                DelList.show();
            },
            AddrListAction: function () {
                var me = this;
                var addrListModel = me.models.addrListModel;
                var postAddressStorage= me.stores.postAddressStorage;
                me.stores.addressStore.setCurrent(
                    me.parentView.UserID,
                    {   success: '/webapp/flight/#bookinginfo',
                        defeated: '/webapp/flight/#bookinginfo'
                    }, 
                    'CustomerAddrStore:setAddr', 
                    'CustomerAddrStore:get'
                );
                if (me.stores.userStore.isLogin()) {
                    addrListModel.excute(function (data) {
                        if (!_.isArray(data.addrs) || !data.addrs.length) {         //当返回的数据格式有问题时
                            postAddressStorage.setAttr("opr", 1);
                            postAddressStorage.set(postAddressStorage.get(), me.parentView.UserID);
                            me.parentView.jump('/webapp/fpage/#addressinfo?from=bookinginfo');
                        }
                        else {
                            me.parentView.jump('/webapp/fpage/#addresslist');
                    }
                    }, function (data) {
                        postAddressStorage.setAttr("opr", 1);
                        postAddressStorage.set(postAddressStorage.get(), me.parentView.UserID);
                        me.parentView.jump('/webapp/fpage/#addressinfo');
                    }, true, me.parentView);
    
                } else {
                    postAddressStorage.setAttr("opr", 1);
                    postAddressStorage.set(postAddressStorage.get(), me.parentView.UserID);
                    me.parentView.jump('/webapp/fpage/#addressinfo?from=bookinginfo');
                }
            },
            selectCityAction: function () { //城市地区选择
                var me = this;
                var UserID = me.parentView.UserID;
                var postAddressStorage = me.stores.postAddressStorage;
                var selData = postAddressStorage.get(UserID);
                me.stores.selAddrStore.set({
                    'prvnId': selData.prvnId,
                    'prvnName': selData.prvnName,
                    'prvn': selData.prvnName,
                    'ctyId': selData.ctyId,
                    'ctyName': selData.ctyName,
                    'cty': selData.ctyName,
                    'dstrId': selData.dstrId,
                    'dstrName': selData.dstrName,
                    'dstr': selData.dstrName
                }, UserID);
    
                var postCityStore = me.stores.postCityStore;
                var data = postCityStore.get();
                var complete = function() {
                    me.parentView.hideLoading();
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
                            postAddressStorage.setAttr('prvnId', items[0].prvn, UserID);
                            postAddressStorage.setAttr('prvnName', items[0].name, UserID);
                            postAddressStorage.setAttr('ctyId', items[1].cty, UserID);
                            postAddressStorage.setAttr('ctyName', items[1].name, UserID);
                            postAddressStorage.setAttr('dstrId', items[2].id, UserID);
                            postAddressStorage.setAttr('dstrName', items[2].name, UserID);
                        }//.bind(me.parentView)     XXX: who done this?
                    });
                    mutipleScrollList.show();
                };
                if (!data) {
                    me.parentView.showLoading();
                    me.models.postCityModel.excute(function (data) {
                        postCityStore.set(data);
                        complete();
                    }, function (e) {
                        me.parentView.showMessage('网络连接失败,请稍候重试');
                        me.parentView.hideLoading();
                    }, true, me.parentView);
                } else {
                    complete();
                }
            },
            //点击进入发票抬头选择列表
            showinTitleList: function () {
                if (this.stores.userStore.isLogin()) {    //已登录 进入发票抬头列表页
                    /*配置回调*/
                    this.stores.invoiceURLStore.setCurrent(
                        'invinfo.addr',                                             //标识
                        {   success: '/webapp/flight/#bookinginfo',                   //设置返回时的地址
                            defeated: '/webapp/flight/#bookinginfo'                    //设置完成时的地址
                        },
                        '',
                        '',
                    'flight');
                    this.jump('/webapp/invoice/index.html#select?businesstype=flight');
                } else {  //未登录 跳到登录页面
                    this.parentView.showLoading();
                    window.location.href = '/webapp/myctrip/#account/login?t=1&from=' + encodeURIComponent(this.parentView.getRoot() + '#bookinginfo');
                }
            },
            /**
             * 配送地址逻辑判断
             * change-v2.4.8: 无论会员还是非会员都跳转到fpage中统一进行地址的编辑和选择，去除以前在页面填写配送地址的方式 modify by zhengkw 2014-8-11
            */
            updateAddrList: function () {
                var stores = this.stores;
                var postAddressStorage = stores.postAddressStorage, 
                    userStore = stores.userStore, 
                    addrListStore = stores.addrListStore, 
                    flightDeliveryStore = stores.flightDeliveryStore, 
                    selAddrStore = stores.selAddrStore, 
                    addrListModel = this.models.addrListModel;
                //获取会员常用地址列表
                if (userStore.isLogin()) {
                    addrListModel.excute(function (data) {
                        addrListStore.setAttr('UserId', this.UserID, addrListStore.getTag());
                        this.renderDelBox( );
                    }, function (data) {
                        this.renderDelBox( );
                    }, true, this);
                } else {
                    //非会员跳转fpage-addressinfo页面填写地址
                    this.renderDelBox( );
                }
            },
            /**
             * 渲染配送地址模板
            */
            renderDelBox: function ( ) {
                var me = this;
                var postAddressStorage = me.stores.postAddressStorage;
                var userStore = me.stores.userStore; 
                var addrListStore = me.stores.addrListStore; 
                var flightDeliveryStore = me.stores.flightDeliveryStore; 
                var tempDelmailfun_2 = this.delmailfun_2;
                var selData = postAddressStorage.get(this.parentView.uid);
                if (selData.inforId == 0) {
                    selData.clazz = 'm_colorb';
                } else {
                    selData.clazz = '';
                }
                var addrListData = addrListStore.get();
                if (!userStore.isLogin() && addrListData && addrListData.UserId) {
                    addrListStore.remove();
                    addrListData = addrListStore.get();
                }
                //会员
                if (addrListData && addrListData.addrs && addrListData.addrs.length > 0) {
                    //如果记忆的上一次选择地址不在常用地址list中，则删除store edit by wyren@ctrip.com 2014-4-29
                    var addrExist = addrListData.addrs.some(function (v) {
                        return v.inforId == selData.inforId || selData.inforId == 0;
                    });
                    if (!addrExist) {
                        selData.prvnName = '';
                        selData.ctyName = '';
                        selData.dstrName = '';
                        selData.addr = '';
                        selData.recipient = '';
                        selData.zip = '';
                        postAddressStorage.remove();
    
                        // 如果在常用地址未返回之前做了重复地址验证，但是此常用地址已被删除，则纠正验证
                        var flightDeliveryData = flightDeliveryStore.get();
                        var deliveryInfo = flightDeliveryStore.getAttr('deliveryInfo');
                        if (flightDeliveryData.rc == 1) {
                            flightDeliveryData.rc = 0;
                            flightDeliveryData.paytype = me.parentView.i_getPayType();
                            flightDeliveryStore.setAttr('paytype', flightDeliveryData.paytype);
                            flightDeliveryData.fee = deliveryInfo.sendFee;
                            me.$el.find(".js_del_cost").html(me.delcostfun(flightDeliveryData)); // 配送费用选项
                            me.parentView.trigger(me.parentView.EVENTS.UPDATEORDERPRICE);
                        }
                    }
                    this.$el.find(".js_del_box").html(tempDelmailfun_2(selData));
                }
                    //非会员
                else {
                    var addr = me.stores.selAddrStore.get(me.parentView.uid);
                    if (addr.prvnName && addr.ctyName && addr.dstrName) {
                        selData.prvnId = addr.prvnId;
                        selData.prvnName = addr.prvnName;
                        selData.ctyId = addr.ctyId;
                        selData.ctyName = addr.ctyName;
                        selData.dstrId = addr.dstrId;
                        selData.dstrName = addr.dstrName;
                    }
                    postAddressStorage.set(selData, this.parentView.uid);
                    this.$el.find(".js_del_box").html(tempDelmailfun_2(selData));
                }
    
            }
        });
        // vVoucherRender = c.base.implement(vVoucherRender, vVoucherTask);

        return vVoucherRender;
    });

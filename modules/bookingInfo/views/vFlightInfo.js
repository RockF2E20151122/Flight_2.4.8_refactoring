"use strict";

//requirejs.config({
//    paths : {
//        mFlight: 'flight/modules/bookingInfo/models/mFlight'
//        ,sFlight: 'flight/modules/bookingInfo/models/sFlight'
//    }
//});
define('vFlightInfo',[ 'vSupperChild','cWidgetMember', 'cWidgetFactory', 'c', 'libs', 'cUI', 'flight/utility/utility',
    buildViewTemplatesPath('../modules/bookingInfo/templates/tFlight.html')],
function ( vSupperChild,cWidgetMember, cWidgetFactory, c, libs, cUI, Futility,
    sTemp ) {
        
    var S = {
        FC: '退改签',
        set: '旅行套餐:',
        instruction: '套餐说明',
        FcAndInstruction: '套餐及退改签说明',
        NOTICKET: '抱歉，您选择的价格舱位已售完，请重新查询选择其它价格舱位预订。'
    };
    
    var cbase = c.base;
    var Member = cWidgetFactory.create('Member');
    var FlightInfo = new c.base.Class( vSupperChild, {
        _setBoxes_: function(){
            this.flightInfoBox = this.viewPort.find('#flightInfo'); //航班详情模板容器
        },
        _setTemplate_: function () {
            this.viewPort.append(sTemp);
            this.j_flightInfoOneway_tpl = _.template(this.viewPort.find('.j_flightInfoOneway_tpl').html());
            this.j_flightInfoReturn_tpl = _.template(this.viewPort.find('.j_flightInfoReturn_tpl').html()); 
            this.j_childrenAndBaby_tpl = _.template(this.viewPort.find('.j_childrenAndBaby_tpl').html()); 
        },
        EVENTS: {
            render: 'render'
        },
        _fireEvents_: function(){
            $(this.viewPort).off('click.vFlightInfo.ej_refundPolicy').on('click.vFlightInfo.ej_refundPolicy', '.j_refundPolicy', this.fanBoxAction.bind(this)); //查看返现信息
        },
        render: function(){
            var selectedFlight = this.stores.selFlightInfoStore.get();
            if(!selectedFlight){
                this.parentView.showAlert();
                return true;
            }
            var data = this.initFlightInfoData();
            this.setHtml(data);
        },
        setHtml: function(data){
            this.flightInfoBox.empty();
            var sHtml ;
            if(!data || !data.items){
                return this.parentView.back('#list'); 
            }
            var basicInfo = data.items[0].basicInfo;
            
            //TODO:
            var dcity = this.stores.flightSearchStore.getSearchDetails(0, 'dcityName'),
                acity = this.stores.flightSearchStore.getSearchDetails(0, 'acityName');
            if(data.items.length>1){
                $('.j_flightTitle').removeClass('flight-h1twoline').html((basicInfo.dcname||dcity) +'-'+ (basicInfo.acname||acity));
                sHtml =  this.j_flightInfoReturn_tpl(data);
            }else{
                $('.j_flightTitle').removeClass('flight-h1twoline').addClass('flight-h1twoline').html((basicInfo.dcname||dcity) +'-'+ (basicInfo.acname||acity) +'<br />'+ '<span>'+ basicInfo.aname + basicInfo.flightNo + '</span>');
                sHtml =  this.j_flightInfoOneway_tpl(data);
            }
            
            this.flightInfoBox.html(sHtml);
            var _this = this;
            
            var j_RC = this.viewPort.find('.j_RC');      //the 退改签  button
            var j_policy = this.viewPort.find('.j_policy');
            if(data.items.length>1){
                if(data.items[0].bIsPackage && data.items[1].bIsPackage){
                    j_RC.html(S.instruction);
                }else if(data.items[0].bIsPackage || data.items[1].bIsPackage){
                    j_RC.html(S.FcAndInstruction);
                }
            }else if(data.items[0].bIsPackage ){
                j_RC.html(S.instruction);
                j_policy.html(S.set);
            }
            j_policy.removeClass('js_hide');                //退改签 button 左边的文本 显示出来
            
            this.viewPort.find('.flight-loginline').on('click', _this.bookLogin.bind(_this));
            j_RC.on('click', _this.tgBoxAction.bind(_this));
        },
        bookLogin: function () {
            this.stores.mdStore.setAttr('IsClickLogin', true); //埋点IsClickLogin
            //若未登录，则点击按钮就进行登录
            this.stores.flightOrderStore.setAttr('selInsure', '1');
            if (!this.stores.userStore.isLogin()) {
                this.parentView.showLoading();
                Member.memberLogin({
                    param: "from=" + encodeURIComponent('/webapp/flight/#bookinginfo') + '&t=1',
                });
                //window.location.href = '/webapp/myctrip/#account/login?t=1&from=' + encodeURIComponent(this.opts.parentView.getRoot() + '#bookinginfo');    
            }
        },
        renderList: function(data){
            var me = this;
            var flightOrderData = me.stores.flightOrderStore.get();
            var userInfo = me.stores.userStore.getUser();
            flightOrderData = flightOrderData ? flightOrderData : {};
            data.cDate = cbase.Date;
            data.order = flightOrderData;
            
            var flightSearchData = me.stores.flightSearchStore.get(); //获取Storage存储的航班查询条件
            var selFlightInfoData = me.stores.selFlightInfoStore.get(); //获取Storage存储的用户选择的航班
            
            data.selectedFlight = selFlightInfoData;
            data.flightSearch = flightSearchData.items[0];
            data.user = userInfo;
            //小米黄页合作，隐藏非会员登录按钮
            var _sales = me.stores.salesStore.get();
            data._sales = _sales;
            //绑定航班详情模板
            this.setHtml(data);
        },
        // 初始化航班信息数据
        initFlightInfoData: function ( ) {
            var me = this;
            var selectedFlight = me.stores.selFlightInfoStore.get();
            var flightInfoData = {
                items: [], 
                _sales: me.stores.salesStore.get(),
                pCount: 1, 
                cDate: cbase.Date, 
                selectedFlight: selectedFlight, 
                flightSearch: me.stores.flightSearchStore.getAttr('items')[0],
                user: me.stores.userStore.getUser()
            };
            var items = [];
            var depart = selectedFlight.depart||{};
            
            var arrive = selectedFlight.arrive;
            var flights = [depart, arrive];
            var length = arrive ? 2 : 1;

            for (var i = 0; i < length; i++) {
                items[i] = {
                    "basicInfo": {
                        "aCtyCode": flights[i].flight.aPortCode, 
                        "aCtyId": null, 
                        "aPortCode": flights[i].flight.aPortCode, 
                        "aTerminal": flights[i].flight.aTerminal, 
                        "aTime": flights[i].flight.aTime,
                        "aaname": flights[i].flight.aaname, 
                        "acname": "", 
                        "agreementId": "", 
                        "airlineCode": flights[i].flight.airlineCode, 
                        "aname": flights[i].flight.aname, 
                        "channel": "", 
                        "ctinfo": flights[i].flight.ctinfo, 
                        "dCtyCode": "BJS", 
                        "dCtyId": "1", 
                        "dPortCode": flights[i].flight.dPortCode, 
                        "dTerminal": flights[i].flight.dTerminal, 
                        "dTime": flights[i].flight.dTime,
                        "daname": flights[i].flight.daname, 
                        "dcname": "", 
                        "flag": flights[i].flight.flag, 
                        "flightNo": flights[i].flight.flightNo, 
                        "planeType": flights[i].flight.planeType, 
                        "puncRate": flights[i].flight.puncRate, 
                        "polid": flights[i].cabin.pid
                    }, 
                    "ext": "", 
                    "policy": {
                        "isAddChd": null, 
                        "activityBM": "", 
                        "babyPolicy": null, 
                        "cardTypes": "", 
                        "childPolicy": null, 
                        "isApplyChild": true, 
                        "class": flights[i].cabin.class, 
                        "classForDisp": flights[i].cabin.classForDisp, 
                        "discount": flights[i].cabin.discount, 
                        "price": flights[i].cabin.price, 
                        "sPrice": flights[i].cabin.price, 
                        "fuelCost": '', 
                        "tax": '', 
                        "minNum": 1, 
                        "payments": [ ], 
                        "productType": null, 
                        "qty": 10, 
                        "subclass": flights[i].cabin.subClass, 
                        "subclassForDisp": null
                    }, 
                    "proRmk": "", 
                    "rmk": {
                        "notice": "", 
                        "ticketTitle": "", 
                        "ticketBody": "", 
                        "refNote": "", 
                        "rerNote": "", 
                        "endNote": "", 
                        "ext": null, 
                        "specialClass": null
                    }, 
                    "routingIdx": "", 
                    "stopCities": flights[i].flight.stopCities, 
                    "prodRmk": ""
                };
            }
            flightInfoData.items = items;

            return flightInfoData;
        },
        fanBoxAction: function(e) { //查看返现信息
            if (this.parentView.i_isShowLoad()) return;   //this.parentView.__proto__.constructor.isShowLoad: __proto__ can be used in only a few browsers except IE
            var info = $('.j_refundPolicyTips').html();
            Futility.popUp(this.viewPort, info);
        },
        tgBoxAction: function (e) { //查看退改签
            this.stores.mdStore.setAttr('IsCheckTGQ', true);    //埋点IsCheckTGQ

            if (this.parentView.i_isShowLoad()) {
                return ;
            }
            
            if(this.parentView.i_hasChildrenOrBaby()){
                this.addBabyAndChildrenTips(false);
            }else{
                this.addBabyAndChildrenTips(true);
            }
            var target = $(e.currentTarget),
                pnttips = $('.flight-pnttips').html(),
                rtntips = $('.flight-rtntips').html();
                
            var rmk = target.siblings('.flight-pnttips'),
                tipbox = target.siblings('.flight-rtntips'); //
                
            var sHtml = pnttips +'<p>'+ rtntips +'</p><br />';
            
            Futility.popUp(this.viewPort, sHtml); 
            return;
        },
        addBabyAndChildrenTips: function(argu){
            if(argu){
                if( this.viewPort.find('.flight-pnttips').find('.j_childrenAndBaby').length>0)return;
                this.viewPort.find('.flight-pnttips').append(this.j_childrenAndBaby_tpl());
            }else{
                this.viewPort.find('.flight-pnttips').find('.j_childrenAndBaby').remove();
            }
        },
        //获取航班详tgBoxAction细信息
        i_getFlightDetail: function(callback ){
            var me = this, parent = me.parentView ; 
            var passengerQueryStore = me.stores.passengerQueryStore ; 
            me.models.flightDetailModel.excute(function (data) {
                if (!data || !data.items || !data.items.length) {
                    parent.alert = new cUI.Alert({
                        title: '提示信息',
                        message: S.NOTICKET,
                        buttons: [{
                            text: '知道了',
                            click: function () {
                                this.hide();
                                return;
                            }
                        }]
                    });
                    parent.alert.show();
                    return;
                } else {
                    var selFlightInfoData = me.stores.selFlightInfoStore.get();
                    data["items"][0]["policy"]["rebateAmt"] = selFlightInfoData["depart"]["cabin"]["rebateAmt"] || 0; //去程
                    if (data["items"].length > 1) {
                        data["items"][1]["policy"]["rebateAmt"] = selFlightInfoData["arrive"]["cabin"]["rebateAmt"] || 0; //返程
                    }
                }

                var passengersInfo = passengerQueryStore.get();
                DataControl.updatePassengersTicketType(passengersInfo); // 更新所有登机人的TicketType
                parent.trigger(parent.EVENTS.FILTERPASSENGERS, (passengersInfo ? passengersInfo.passengers : null));
                
                var selPassengers = DataControl.getSelectedPassengers();
                data.passengers = selPassengers;
                data.pCount = selPassengers.length;

                passengerQueryStore.setAttr('validSelCount', data.pCount);

                callback && callback(data);

                parent.renderList(data);
                //TODO:
                me.viewPort.find('.j_hd').removeClass('js_hide');
                parent.hideLoading();

            }, function (err) {
                //console.log(err);
                var msg = err.msg ? err.msg : '啊哦,数据加载出错了!';
                if (err.res == 30001) {
                    parent.alert = new cUI.Alert({
                        title: '提示信息',
                        message: S.NOTICKET,
                        buttons: [{
                            text: '知道了',
                            click: function () {
                                this.hide();
                                me.stores.flightSearchStore.setAttr("fullCabin", true);
                                parent.back("list");
                                return;
                            }
                        }]
                    });
                    parent.alert.show();
                }
                else {
                    parent.showAlert(msg);
                }
                parent.hideLoading();
            }, false, me);
        }
    });
    
    return FlightInfo;
});
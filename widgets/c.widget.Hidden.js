define(function(require) {

    var c = require('c');
    var Futility = require('flight/utility/utility');
    var UBTKey = "h5.flt.booking";
    var classHidden = function(opts) {
        this.opts = $.extend(true, {}, opts);
        this.parentView = this.opts.parentView;
        this.stores = this.parentView.stores;
        this.mdStore = this.stores.mdstore;
    };
    classHidden.prototype = {
        setPassengersMDInfo : function() {          // 更新passengers 埋点信息        used the global variables: DataControl、Futility
            var me = this;
            var showToast = me.parentView.showToast;
            try {
                var passengers = me.stores.passengerQueryStore.getAttr('passengers');
                var selPassengers = _.filter(passengers, function(p) {
                    return p.selected == 1;
                });
                var passengersInfo = this.stores.mdStore.getAttr('passengers') || {};
                var credentialsType = 1;
                var delfCard = {};
                var names = [];
                _.each(selPassengers, function(p, index) {
                    delfCard = p.defaIdCard || delfCard;
                    credentialsType = p.defaIdCard ? p.defaIdCard.type : 1;
                    //  默认身份证
                    if (p.defaIdCard && credentialsType == 1) {
                        delfCard.birth = Futility.getBirth(p.defaIdCard.no);
                    }
                    names = typeof p.ename !== 'undefined' ? p.ename.split('/') : ['', ''];
                    passengersInfo[p.inforId] = passengersInfo[p.inforId] || {
                        'IsPassengerName' : '',
                        'PassengerNamePass' : '',
                        'CredentialsType' : '',
                        'IsCredentialsNO' : '',
                        'CredentialsNOPass' : ''
                    };
                    passengersInfo[p.inforId]['IsPassengerName'] += passengersInfo[p.inforId]['IsPassengerName'] == '' ? (!!p.ename || !!p.cname) : (',' + (!!p.ename || !!p.cname));
                    passengersInfo[p.inforId]['PassengerNamePass'] += passengersInfo[p.inforId]['PassengerNamePass'] == '' ? Futility.validateName(me.parentView, showToast, p.cname, names[0], names[1], credentialsType, false, p.inforId) : ',' + Futility.validateName(me.parentView, showToast, p.cname, names[0], name[1], credentialsType, false, p.inforId);
                    passengersInfo[p.inforId]['CredentialsType'] += passengersInfo[p.inforId]['CredentialsType'] == '' ? DataControl.idCardTypeSort[credentialsType].name : ',' + DataControl.idCardTypeSort[credentialsType].name;
                    passengersInfo[p.inforId]['IsCredentialsNO'] += passengersInfo[p.inforId]['IsCredentialsNO'] == '' ? !!(p.defaIdCard && p.defaIdCard.no) : ',' + !!(p.defaIdCard && p.defaIdCard.no);
                    passengersInfo[p.inforId]['CredentialsNOPass'] += passengersInfo[p.inforId]['CredentialsNOPass'] == '' ? Futility.validateCard(showToast, credentialsType, delfCard, p.birth, false) : ',' + Futility.validateCard(showToast, credentialsType, delfCard, p.birth, false);
                });
                me.stores.mdStore.setAttr('passengers', passengersInfo);
                
            
            } catch (e) {
                console.log('beforePayAction: 设置乘机人埋点信息异常');
            }
        },
        onLoad : function() {//埋点，获取列表页的部分信息
            var stores = this.stores;
            var mdTransStore = stores.mdTransStore, userStore = stores.userStore, mdStore = stores.mdStore, flightOrderStore = stores.flightOrderStore, flightDeliveryStore = stores.flightDeliveryStore;
            try {
                var ts = mdTransStore.get();
                if (ts && ts.dObj) {
                    var fns = ts.dObj.fns, scs = ts.dObj.scs, at = ts.dObj.at;
                    if (ts.aObj) {
                        fns += ',' + ts.aObj.fns;
                        scs += ',' + ts.aObj.scs;
                        at += ',' + ts.aObj.at;
                    }
                    mdStore.setAttr('FlightNoSequence', fns);
                    //埋点FlightNoSequence
                    mdStore.setAttr('SubClassSequence', scs);
                    //埋点SubClassSequence
                    mdStore.setAttr('ActiveType', at);
                    //埋点ActiveType
                }
                mdStore.setAttr('IsLoginNow', !!userStore.isLogin());
                //埋点IsLoginNow
                mdStore.setAttr('IsCancelInsurance', !flightOrderStore.getAttr('selInsure'));
                //埋点IsCancelInsurance
                var flightOrderData = flightOrderStore.get();
                if (flightOrderData && flightOrderData.contact && flightOrderData.contact.mphone) {
                    mdStore.setAttr('IsContactPhone', true);
                    //埋点IsContactPhone
                }
                if (flightDeliveryStore.getAttr('type') !== 1) {
                    mdStore.setAttr('IsNeedSegment', true);
                    //埋点IsNeedSegment
                    mdStore.setAttr('IsDeliveryType', true);
                    //埋点IsDeliveryType
                }
            } catch (e) {
                console.log('埋点', 'onLoad()');
            }
        },
        mdSubmit : function() {// submit
            var mdStore = this.stores.mdStore;
            var mdTransStore = this.stores.mdTransStore;
            var passengerInfo = mdStore.getAttr('passengers');
            var i = 1;

            for (var key in passengerInfo) {
                mdStore.setAttr('IsPassengerName' + i, passengerInfo[key].IsPassengerName);
                mdStore.setAttr('PassengerNamePass' + i, passengerInfo[key].PassengerNamePass);
                mdStore.setAttr('CredentialsType' + i, passengerInfo[key].CredentialsType);
                mdStore.setAttr('IsCredentialsNO' + i, passengerInfo[key].IsCredentialsNO);
                mdStore.setAttr('CredentialsNOPass' + i, passengerInfo[key].CredentialsNOPass);
                i++;
            }

            mdStore.setAttr('passengers', i - 1);
            Futility.sendUbt(UBTKey, mdStore.get());
            mdStore.remove();
            mdTransStore.remove();

        },
        goBack : function() {
            var me = this;
            try {
                me.mdStore.setAttr('IsReturn', true);
                //埋点IsReturn
                me.mdSubmit();
            } catch (e) {
                console.log('埋点', 'backAction()');
            }
        },
        mdPayAction: function(){
            try {
                var pas = this.postAddressStorage.get(_this.UserID);
                if (pas.prvnName !== '') {
                    this.mdStore.setAttr('IsDeliveryArea', true); //埋点IsDeliveryArea
                }
                this.mdSubmit();
            } catch (e) {
                console.log('埋点', 'payAction');
            }
        },
        sendUbt: function (_orderID) {                      //hidden
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
        MDsendUBT: function(data){
            try {
                var order = {};
                for (var i = 0; i < data["orders"].length; i++) {
                    var o = data["orders"][i];
                    if (o["master"] && o["master"] == true) {
                        order = o;
                    }
                }
                var oid = order["oid"];
                var _orderID = oid;
                this.sendUbt(_orderID);
            } catch (e) {
                console.log('fuck');
            }
        }
    };
    return classHidden;
});

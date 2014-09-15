define(['cStore','CommonStore', 'cBase', 'cUtility'], 
function (AbstractStore, CommonStore, cBase, cUtility) {

    var S = {};
    S.FlightSelectedInfo = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'U_FLIGHT_SELECTEDINFO';  //this.key = 'FLIGHT_SELECTED_INFO';
            this.lifeTime = '1H';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    
    S.FlightSearchStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'S_FLIGHT_AirTicket';  //this.key = 'FLIGHT_SEARCH';
            this.lifeTime = '1D';
            this.defaultData = {
                'tabtype': 1,
                'ver': 0,
                'tripType': 1,
                'ticketIssueCty': 'SHA',
                'flag': 0,
                'pageIdx': 1,
                'passengerType': 1,
                'items': [{
                    "dCtyCode": "BJS",
                    "dCtyId": 1,
                    "dcityName": "北京",
                    "dkey": 3,
                    "aCtyCode": "SHA",
                    "aCtyId": 2,
                    "acityName": "上海",
                    "akey": 2
                }],
                '_items': [{
                    "dCtyCode": "BJS",
                    "dCtyId": 1,
                    "dcityName": "北京",
                    "dkey": 3,
                    "aCtyCode": "SHA",
                    "aCtyId": 2,
                    "acityName": "上海",
                    "akey": 2
                }],
                'class': 0,
                'depart-sorttype': 'time',
                'depart-orderby': 'asc',
                'arrive-sorttype': 'time',
                'arrive-orderby': 'asc',
                'calendarendtime': (new cBase.Date(cUtility.getServerDate())).addMonth(5).format('Y/m/d H:i:s'),
                'submittime': 0,
                'fullCabin':false
            };
        },
        initialize: function ($super, options) {
            $super(options);
        },
        setSearchDetails: function (key, name, value) {
            var items = this.getAttr('_items') || [],
                item = items[key] || {};
            item[name] = value;
            items[key] = item;
            this.setAttr('_items', items);
        },
        getSearchDetails: function (key, name) {
            var items = this.getAttr('_items')
            items = items && items[key] || {};
            return items[name];
        },
        removeSearchDetails: function (key) {
            var items = this.getAttr('_items') || [];
            if (key && items[key]) {
                items.splice(key, 1);
                this.setAttr('_items', items);
            }
        },
        setCurSearchDetails: function (keys) {
            keys = keys || [];
            var _items = this.getAttr('_items') || [],
                items = [];
            for (var i = 0, len = keys.length; i < len; i++) {
                if (_items[keys[i]]) {
                    items[keys[i]] = _items[keys[i]];
                }
            }
            if (items.length) this.setAttr('items', items);
        },
        saveToFltintlSearch: function () {
            var data = this.get(), fdata = {}, fileds = { passengerType: true, calendarendtime: true, ver: true, tripType: true, 'class': true, sortRule: true, sortType: true, pageIdx: true, shoppingIdx: true, policyIdx: true, ext: true, segments: true, flightType: true, flag: true, airlineCode: true, tabtype: true };
            for (var i in fileds) {
                switch (i) {
                    case 'ver':
                    case 'tripType':
                    case 'class':
                    case 'ext':
                    case 'tabtype':
                    case 'calendarendtime':
                    case 'passengerType':
                        fdata[i] = data[i];
                        break;
                    case 'sortRule':
                        fdata[i] = 1;
                        break;
                    case 'pageIdx':
                        fdata[i] = 1;
                        break;
                    case 'shoppingIdx':
                        fdata[i] = -1;
                        break;
                    case 'policyIdx':
                        fdata[i] = -1;
                        break;
                    case 'segments':
                        fdata[i] = (function (items) {
                            var fitem = [], item;
                            for (var i = 0, l = items.length; i < l; i++) {
                                item = {};
                                item.dCty = items[i].dCtyCode;
                                item.aCty = items[i].aCtyCode;
                                item.dDate = items[i].date;
                                item.dcityName = items[i].dcityName;
                                item.acityName = items[i].acityName;
                                fitem.push(item);
                            }
                            return fitem;
                        })(data['_items'] || []);
                        break;
                    case 'flightType':
                        fdata[i] = 7;
                        break;
                    case 'flag':
                        fdata[i] = data[i];
                        break;
                    case 'airlineCode':
                        fdata[i] = '';
                        break;
                }
            }
            //console.log(JSON.stringify(fdata));
            S.FltintlSearchStore.getInstance().set(fdata);
        }
    });
    
    S.SalesObjectStore = CommonStore.SalesObjectStore;
    S.UserStore = CommonStore.UserStore;
        //当前用户选中的航班数据（add by caof）
    S.FlightDetailsStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'U_FLIGHT_USERSELECTDETAILS';  //this.key = 'FLIGHT_DETAILS';
            this.lifeTime = '30M';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //订单填写信息（add by caof）
    S.FlightOrderInfoStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'F_FLIGHT_ORDERINFO';  //this.key = 'FLIGHT_ORDERINFO';
            this.lifeTime = '30M'; //缓存15分钟，离开机票列表页时清除
            this.isUserData = true;
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
//填写页埋点store
    S.MdBookingStore = new cBase.Class(AbstractStore,{
        __propertys__: function () {
            this.key = 'MD_Booking';
            this.lifeTime = '150M'; //缓存150分钟
            this.isUserData = false;
            this.defaultData = {
                FlightNoSequence: '', //航班位置
                SubClassSequence: '', //子舱第一或最后
                ActiveType: '', //活动类型
                IsReturn: false, //是否返回
                IsClickLogin: false, //是否点击登录
                IsLoginNow: false, //是否登陆
                IsChangeSubClass: false, //是否点击修改舱位
                IsCheckTGQ: false, //是否点击退改签
                // IsPassengerName: false, //是否输入登机人姓名
                // PassengerNamePass: false, //姓名是否验证通过
                // CredentialsType: '', //证件类型
                // IsCredentialsNO: false, //是否输入证件号
                // CredentialsNOPass: false, //证件号是否验通
                MorePassengerClick: 0, //添加更多登机人次数
                IsContactPhone: false, //是否填写手机
                ContactPhonePass: false, //手机验证是否通过
                IsCancelInsurance: false, //是否取消保险
                IsNeedSegment: false, //是否需要报销凭证
                IsDeliveryType: false, //是否选择报销配送方式
                IsWriteAddressee: false, //是否填写报销收件人
                IsDeliveryArea: false, //是否选择报销所在地区
                IsDeliveryAddress: false, //是否填写报销详细地址
                IsDeliveryPostCode: false, //是否填写报销邮编
                NextStepNotPassClick: 0 //下一步未通过次数
            };
        },
        addOpValue: function(key, op) {
            var val = this.getAttr(key);
            val += val === '' ? op : ',' + op;
            this.setAttr(key, val);
        },
        increaseCntByKey: function(key) {
            var support = [
                'MorePassengerClick',
                'NextStepNotPassClick'
            ].some(function(v) {
                return key === v;
            });
            if (support) {
                var cnt = parseInt(this.getAttr(key) || 0);
                this.setAttr(key, ++cnt);
            }
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    return S;
});
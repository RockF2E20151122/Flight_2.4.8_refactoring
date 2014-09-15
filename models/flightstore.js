define(['cStore', 'cBase', 'cUtility'], function (AbstractStore, cBase, cUtility) {
    var S = {};
    /**
    *  机票搜索页store
    */
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
    //用于保存页面中常用的参数
    S.FlightSearchSubjoinStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'S_FLIGHT_SUBJOIN';  //this.key = 'FLIGHT_SEARCH_SUBJOIN';
            this.lifeTime = '1D';
            this.defaultData = {
                'depart-sorttype': 'price',
                'depart-orderby': 'asc',
                'arrive-sorttype': 'price',
                'arrive-orderby': 'asc'
            };
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    /**
    *  国际机票搜索页store
    */
    S.FltintlSearchStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'S_FLIGHT_INTLAirTicket';  //this.key = 'FLTINTL_SEARCH';
            this.lifeTime = '1D';
            this.defaultData = {
                "airlineCode": "",
                "ext": "",
                "flag": 0,
                "flightType": 7,
                "sortRule": 1,
                "sortType": 2,
                "pageIdx": 1,
                "policyIdx": -1,
                "class": 0,
                "segments": [{
                    "aPort": "",
                    "aCty": "TYO",
                    "dPort": "",
                    "dCty": "SHA",
                    "dDate": "2013/8/15  0:00:00"
                }],
                "ver": 0,
                "shoppingIdx": -1,
                "tripType": 1,
                "passengerType": 1
            };
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    /**
    * 机票列表页model
    */
    S.FlightListStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            //this.lifeTime = '1M';
            //列表页优化
            this.lifeTime = '5M';
            this.key = 'P_FLIGHT_TicketList';  //this.key = 'FLIGHT_LIST';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });


    //国际机票城市列表数据
    S.FlightInterCityListStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'P_FLIGHT_InterCityList';  //this.key = 'FLIGHT_INTER_CITY_LIST';
            this.lifeTime = '15D';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });



    //机票城市列表数据
    S.FlightCityListStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'P_FLIGHT_CITYLIST';  //this.key = 'FLIGHT_CITY_LIST';
            this.lifeTime = '15D';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    S.zqInCityStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'zqInCityInfo';
            this.lifeTime = '1D';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });


    S.zqInCityDateStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'U_FLIGHT_oneselfInCityDateStore';  //this.key = 'zqInCityDateStore';
            this.lifeTime = '1D';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    S.LastInCitySelectDateTime = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'U_FLIGHT_LastInCitySelectDateTime';  //this.key = 'LastInCitySelectDateTime';
            this.lifeTime = '1D';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    S.LastzqInAirportSelectDateTime = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'U_FLIGHT_LastzqInAirportSelectDateTime';  //this.key = 'LastzqInAirportSelectDateTime';
            this.lifeTime = '30M';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });


    S.zqInAirportStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'zqInAirportInfo';
            this.lifeTime = '30M';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    S.zqInAirportDateStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'U_FLIGHT_zqInAirportDateStore';  //this.key = 'zqInAirportDateStore';
            this.lifeTime = '30M';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    S.zqInAirportDateAndAddressStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'U_FLIGHT_zqInAirportDateAndAddressStore'; //this.key = 'zqInAirportDateAndAddressStore';
            this.lifeTime = '30M';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    S.zqInCityDateAndAddressStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'U_FLIGHT_zqInCityDateAndAddressStore';  //this.key = 'zqInCityDateAndAddressStore';
            this.lifeTime = '30M';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });


    S.zqInCitySelectStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'U_FLIGHT_zqInCitySelectStore';  //this.key = 'zqInCitySelectStore';
            this.lifeTime = '1D';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    S.zqInAirportSelectStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'U_FLIGHT_zqInAirportSelectStore';  //this.key = 'zqInAirportSelectStore';
            this.lifeTime = '30M';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
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
    //当前用户选中的航班数据（add by caof）
    S.FlightDetailParamStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'U_FLIGHT_DETAILSPARAM';  //this.key = 'FLIGHT_DETAILS_PARAM';
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
    //用户机票订单列表 （add by caof）
    S.FlightOrderListStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'U_FLIGHT_ORDERLIST';  //this.key = 'USER_FLIGHT_ORDERLIST';
            this.lifeTime = '3M'; //缓存1分钟，离开机票订单列表页时清除
            this.isUserData = true; //若用户更换帐号后，自动清除 add by caof
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //用户机票订单详情 （add by caof）
    S.FlightOrderDetailStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'U_FLIGHT_ORDERDETAIL';  //this.key = 'USER_FLIGHT_ORDERDETAIL';
            this.lifeTime = '30M'; //缓存30分钟，离开机票订单详情页时清除
            this.isUserData = true; //若用户更换帐号后，自动清除 add by caof
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    // 重复订单信息 (Add by zy)
    S.RepeatOrderCheckStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'U_FLIGHT_REPEAT_ORDER';  //this.key = 'USER_FLIGHT_ORDERDETAIL';
            this.lifeTime = '30M'; //缓存30分钟，离开机票订单详情页时清除
            this.isUserData = true; //若用户更换帐号后，自动清除 add by caof
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //用户机票订单退改签查询信息 (add by Teller)
    S.FlightTicketRefundChangeStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'U_FLIGHT_TICKETREFUNDCHANGE';
            this.lifeTime = '30M'; //缓存30分钟，离开机票订单改签页时清除
            this.isUserData = true; //若用户更换帐号后，自动清除
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });



    //用户机票订单改签提交内容 (add by Teller)
    S.FlightTicketChangeForm = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'F_FLIGHT_TICKETCHANGE';
            this.lifeTime = '30M'; //缓存30分钟，离开机票订单改签页时清除
            this.isUserData = true; //若用户更换帐号后，自动清除
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });


    //用户机票订单退票提交内容 (add by Air)
    S.FlightTicketRefundFormStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'F_FLIGHT_TICKETREFUND';
            this.lifeTime = '30M'; //缓存30分钟，离开机票订单退票页时清除
            this.isUserData = true; //若用户更换帐号后，自动清除
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });


    //用户订单参数（add by caof）
    S.FlightOrderParamStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'USER_FLIGHT_ORDERPARAM';
            this.lifeTime = '15M'; //缓存15分钟，离开机票订单详情页时清除
            this.isUserData = true;
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //用户从机票订单详情返回时，判断跳转至哪页 （add by caof）
    S.OrderDetailReturnPage = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'U_FLIGHT_RETURNPAGE';  //this.key = 'FLIGHT_RETURNPAGE';
            this.lifeTime = '15M';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //被选中机票数据
    S.FlightSelectedInfo = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'U_FLIGHT_SELECTEDINFO';  //this.key = 'FLIGHT_SELECTED_INFO';
            this.lifeTime = '1H';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //配送方式store
    S.FlightPickTicketSelectStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'U_FLIGHT_PICKTICKETSELECT';  //this.key = 'FLIGHT_PICK_TICKET_SELECT';
            this.lifeTime = '15D';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    // S.FlightPickTicketSelectStore2 = new cBase.Class(AbstractStore, {
    //     __propertys__: function() {
    //         this.key = 'U_FLIGHT_PICKTICKETSELECT_2';
    //         this.lifeTime = '15D';
    //     },
    //     initialize: function($super, options) {
    //         $super(options);
    //     }
    // });
    //航空公司数据store
    S.FlightAirlineStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'P_FLIGHT_AIRLINE';  //this.key = 'FLIGHT_AIRLINE';
            this.lifeTime = '15D';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //机型数据数据store
    S.FlightAircraftStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'P_FLIGHT_AIRCTRAFT';  //this.key = 'FLIGHT_AIRCTRAFT';
            this.lifeTime = '15D';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //筛选页起飞时段数据
    S.FlightTakeOfTimeStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'P_FLIGHT_ENUM_TAKETIME'; // this.key = 'FLIGHT_ENUM_TAKETIME';
            this.lifeTime = '1D';
            this.defaultData = [
                {
                    title: '全天',
                    start: null,
                    end: null,
                    value: ''
                },
                {
                    title: '00:00-05:59',
                    start: '00:00',
                    end: '05:59',
                    value: '00:00-05:59'
                },
                {
                    title: '06:00-11:59',
                    start: '06:00',
                    end: '11:59',
                    value: '06:00-11:59'
                },
                {
                    title: '12:00-17:59',
                    start: '12:00',
                    end: '17:59',
                    value: '12:00-17:59'
                },
                {
                    title: '18:00-23:59',
                    start: '18:00',
                    end: '23:59',
                    value: '18:00-23:59'
                }
            ];
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //舱位选择项store
    S.FlightCabinStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'P_FLIGHT_ENUM_CABINS'; // this.key = 'FLIGHT_ENUM_CABINS';
            this.lifeTime = '1D';
            this.defaultData = [
                {
                    title: '不限', //将"无限"更改为"不限" update caof
                    value: ''
                },
                {
                    title: '经济舱',
                    value: '0'
                },
                {
                    title: '公务/头等舱',
                    value: '3'
                }
            ];
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //机票筛选页
    S.FlightFilterStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'P_FLIGHT_LIST_FILTER'; // this.key = 'FLIGHT_LIST_FILTER';
            this.lifeTime = '1D';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //机票配送方式store
    S.FlightPickTicketStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'P_FLIGHT_PICK_TICKET';  //this.key = 'FLIGHT_PICK_TICKET';
            this.lifeTime = '1D';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //配送方式参数store
    S.FlightPickTicketParamStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'P_FLIGHT_PICK_TICKET_PARAM'; //this.key = 'FLIGHT_PICK_TICKET_PARAM';
            this.lifeTime = '1D';
            this.defaultData = {
                "ticketIssueCty": "BJS",
                "tripType": 1,
                "ver": 0,
                "items": []
            };
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //机票列表页顶部panel的消失时间
    S.FlightAdTimeOutStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'FLIGHT_AD_TIMEOUT';
            this.lifeTime = '24H';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    //    //机票90天低价日历的去程时间
    //    S.FlightLowestOnwardTimeStore = new cBase.Class(AbstractStore, {
    //        __propertys__: function () {
    //            this.key = 'FLIGHT_ONWARD_TIME';
    //            this.lifeTime = '1H';
    //        },
    //        initialize: function ($super, options) {
    //            $super(options);
    //        }
    //    });

    /**
    * 90天低价store
    */
    S.LowestPriceSearchStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.lifeTime = '24H';
            this.key = 'FLIGHT_LOWEST_PRICE';
            this.defaultData = {
                "ver": 0,
                "aCty": 'SHA',
                "dCty": 'BJS'
            };
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    /**
    *  临时store
    */
    S.TempSaveDataStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.lifeTime = '1D';
            this.key = 'FLIGHT_TempSaveData';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //航班舱位数据,用于国内机票修改舱位（add by kwzheng）
    S.FlightCabinListStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'U_FLIGHT_CabinList';
            this.lifeTime = '30M';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    //航班舱位查询的条件（add by kwzheng）
    S.FlightCabinParamStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'U_FLIGHT_CabinParam';
            this.lifeTime = '30M';
            this.defaultData = {
                "flag": "0",
                "ext": ''
            };
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //值机数据（add by jianhua_h）
    S.FlightSelectSeatStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'P_FLIGHT_SELECTSEAT';
            this.lifeTime = '2M';
            this.defaultData = {

            };
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //提交值机数据（add by jianhua_h）
    S.FlightSubmitCheckinStore = new cBase.Class(AbstractStore, {
      __propertys__: function () {
        this.key = 'P_FLIGHT_SUBMITCHECKIN';
        this.lifeTime = '2M';
        this.defaultData = {

        };
      },
      initialize: function ($super, options) {
        $super(options);
      }
    });
    //值机查询参数(add by wyren)
    S.CheckinParamStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'F_CHECKIN_PARAM';
            this.lifeTime = '30M';
            this.defaultData = {
                card: null, cardType: 1, cardName: '身份证', airCode: null, airName: null, tel: null,tno:null, cards: [{ id: 1, name: '身份证'}]
            };
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //值机查询结果数据(add by wyren)
    S.CheckinResultStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'F_CHECKIN_RESULT';
            this.lifeTime = '30M';
            this.defaultData = {

            };
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
	//选座可值机航班查询_列表结果(add by mmx)
	S.CheckinListStore = new cBase.Class(AbstractStore,{
		__propertys__: function () {
		  this.key = 'FLIGHT_CHECKIN_LIST';
		  this.lifeTime = '30M';
		  this.defaultData = {

		  };
		},
		initialize: function ($super, options) {
		  $super(options);
		},
		getCurCheckInfo: function (options) {
			
            var fcinfos = this.getAttr('fcinfos') || [],
				_fcinfos = {}, 
				_ciplst = [];
			
            for (var i = 0, len = fcinfos.length; i < len; i++) {
				if(fcinfos[i].oid == options.oid && fcinfos[i].dacode == options.dacode){
					_fcinfos = fcinfos[i];
					if(!_.has(options, "index"))return _fcinfos;
					
					_ciplst.push(fcinfos[i].ciplst[options.index])
					
					_fcinfos.ciplst = _ciplst;
					return _fcinfos;
					
				}
            }
            
        },
	});

	//获取航司的值机协议_查询参数(add by mmx)
	S.CheckinSearchParamStore = new cBase.Class(AbstractStore,{
	__propertys__: function () {
	  this.key = 'FLIGHT_CHECKIN_SEARCH_PARAM';
	  this.lifeTime = '30M';
	  this.defaultData = {

	  };
	},
	initialize: function ($super, options) {
	  $super(options);
	}
	});
  
	//值机及取消值机的相关登机人信息
	S.CheckPassengerStore = new cBase.Class(AbstractStore, {
		__propertys__: function () {
			this.key = 'FLIGHT_CHECK_PASSENGER';  
			this.lifeTime = '1H';
		},
		initialize: function ($super, options) {
			$super(options);
		}
		
	});
    //非携程可值机航班结果数据(add by wyren)
    S.CheckinSegmentStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'F_CHECKIN_SEGMENT';  
            this.lifeTime = '1M';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

  //值机取消值机结果
	S.CancelCheckResultStore = new cBase.Class(AbstractStore, {
		__propertys__: function () {
			this.key = 'FLIGHT_CANCEL_CHECK_RESULT';  
			this.lifeTime = '5M';
		},
		initialize: function ($super, options) {
			$super(options);
		}
		
	});


    //订单填写信息(发票)
    S.FlightOrderInfoInviceStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'F_FLIGHT_ORDERINFO_INVOICE';   
            this.lifeTime = '30D'; //缓存15分钟，离开机票列表页时清除
            this.isUserData = true;
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    S.FlightCancelCheckStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'FLIGHT_CANCEL_CHECK';  
            this.lifeTime = '1H';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    S.FlightOrderBookingStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'FLIGHT_ORDER_BOOKING';  
            this.lifeTime = '1H';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    }); 

     //支持值机的航空公司列表
   S.CheckinAirListStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'FLIGHT_CHECK_AirList';  
            this.lifeTime = '1D';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    S.CustomerCouponStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'FLIGHT_CUSTOMER_COUPON';  
            this.lifeTime = '5M';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });



   //  订单结果
    S.FlightBookingResultStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'U_FLIGHT_BOOKING_RESULT';
            this.lifeTime = '1D';
            this.isUserData = true; //若用户更换帐号后，自动清除
            this.defaultData = {
                oid: 0,
                rc: false,
                rmsg: '',
                scode: '',
                sexpire: '',
                extno: ''
            };
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    //生成订单的结果stroe
    S.OrderCreateStore= new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'F_ORDER_CREATE_RESULT';   
            this.lifeTime = '150M'; //缓存150分钟
            this.isUserData = true;
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

      //生成订单的结果stroe
    S.PackageSelectStore= new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'U_FLIGHT_PackageSelectInfo';   
            this.lifeTime = '150M'; //缓存150分钟
            this.defaultData={pkgtype:1};
            this.isUserData = true;
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });



    //查询页埋点store
    S.MdIndexStore = new cBase.Class(AbstractStore,{
        __propertys__: function () {
            this.key = 'MD_Index';   
            this.lifeTime = '150M'; //缓存150分钟
            this.isUserData = false;
            this.defaultData = {
                IsReturn: false, //是否返回
                OWClick: 0, //单程点击数
                RTClick: 0, //往返点击数
                DCity: '', //出发城市
                ACity: '', //到达城市
                ChangeCityClick: 0, //切换城市点击数
                FlightType: '', //单程还是往返
                DTime: '', //去成日起
                ATime: '', //返程日期
                IsQuery: false, //是否点击查询
                IsService: false, //是否点击机票服务
                IsFlightSituation: false, //是否点击航班动态
                IsChooseSeat: false //是否点击值机
            };
        },
        increaseCntByKey: function(key) {
            var support = [
                'OWClick',
                'RTClick',
                'ChangeCityClick'
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
    //列表页埋点store
    S.MdListStore = new cBase.Class(AbstractStore,{
        __propertys__: function () {
            this.key = 'MD_List';
            this.lifeTime = '150M'; //缓存150分钟
            this.isUserData = false;
            this.defaultData = {
                DCity: '', //出发城市
                ACity: '', //到达城市
                FlightType: '', //单程还是返程
                DTime: '', //去程日期
                ATime: '', //返程日期
                IsReturn: false, //点击返回
                DateQuery: '', //点击前后低价
                SortWay: '', //排序方式
                IsFilter: false, //筛选
                FlightNoSequence: '', //航班位置
                MoreClassSequence: '', //下拉详细航班位置
                SubClass: '', //点击仓位：经济Y、头等F、公务C
                SubClassSequence: 1, //子舱第一或最后
                ActiveType: '' //活动类型
            };
        },
        addOpValue: function(key, op) {
            var support = [
                'SortWay',
                'MoreClassSequence'
            ].some(function(v) {
                return key === v;
            });
            if (support) {
                var val = this.getAttr(key);
                val += val === '' ? op : ',' + op;
                this.setAttr(key, val);
            }
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //将列表页部分信息转移到填写页的临时store
    S.MdTransStore= new cBase.Class(AbstractStore,{
        __propertys__: function () {
            this.key = 'MD_Trans';
            this.lifeTime = '150M'; //缓存150分钟
            this.isUserData = false;
            this.defaultData ={

            }
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

    // 临时store存建行 信息
    S.FlightCCBStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'E_CCB_SALES';
            this.lifeTime = '99D'; //缓存99天
            this.isUserData = false;
            this.defaultData = {

            }
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    //低价日历信息
    S.FlightLowestPriceStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'FlightLowestPriceStore';
            this.lifeTime = '2M'; //缓存时间
            this.isUserData = false;
            this.defaultData = {

            }
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

  return S;
})

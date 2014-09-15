define(['cBase', 'FlightStore', 'mapping', 'cAjax', 'BusinessModel'],

function (cBase, FlightStore, Mapping, cAjax, BusinessModel) {
    
    var findItemByKey = function (items, value, key) {
        var result = {};
        $(items).each(function (index, item) {
            if (value == item[key]) {
                result = item;
                return false;
            }
        });

        return result;
    };
    
    var F = {};
    /**
    * 提交取消值机model
    */

    F.CheckInCancelSubmitModel = new cBase.Class(BusinessModel, {
        __propertys__: function () {
            this.url = '/Flight/Domestic/CheckIn/CheckInCancelSubmit';
            this.method = 'POST';
            this.param = {
                ver: 99,     //版本
                oid: 0      //订单号
            };

            this.isUserData = true;
        },
        initialize: function ($super, options) {
            $super(options);
        },
        formatParam: function (store) {
            var p = {
                aucde: store["aucde"],
                oid: store["oid"],      //订单号
                fcsinf: { //航班信息
                    fno: store["fno"], // //航班号
                    dcode: store["dacode"], //出发机场
                    acode: store["aacode"], //到达机场
                    ddate: store["depdat"], //出发时间
                    setno: store["ciplst"][0]["setno"]   //座位 35B
                },
                psginf: {
                    ctype: store["ciplst"][0]["ctype"], //证件类型
                    cno: store["ciplst"][0]["cno"], //证件号码
                    tno: store["ciplst"][0]["tno"], //票号
                    psgname: store["ciplst"][0]["psgnam"], //旅客姓名（中文）
                    phone: store["ciplst"][0]["phone"]  //手机号码
                }
            };
            this.param = p;
        }
    });
    /**
    * 获取验证码model
    */

    F.GetAuthCodeModel = new cBase.Class(BusinessModel, {
        __propertys__: function () {
            this.url = '/Flight/Domestic/CheckIn/AuthCodeSearch';
            this.method = 'POST';
            this.param = {
                ver: 99,     //版本
                oid: 0,      //订单号
                fcsinf: { //航班信息
                    fno: 0, // //航班号
                    dcode: 0, //出发机场
                    acode: 0, //到达机场
                    ddate: "2005/12/12", //出发时间
                    setno: 0   //座位 35B
                },
                psginf: {
                    ctype: 0, //证件类型
                    cno: 0, //证件号码
                    tno: 0, //票号
                    psgname: "", //旅客姓名（中文）
                    phone: ""  //手机号码
                }
            }
            this.isUserData = true;
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });




    /**
    * 取消 订单model
    */
    F.OrderCancelModel = new cBase.Class(BusinessModel, {
        __propertys__: function () {
            this.url = '/Basic/Order/Cancel'; //服务功能	订单取消
            this.method = 'POST';
            this.param = {
                ver: 99,     //版本
                oid: 0,      //订单号
                //  reason:"",//取消订单原因
                biztype: 3 //订单类型
                //  flag:"",// 标识域
                //  ext: ""//扩展字段
            }
            this.isUserData = true;
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });


    /**
    * 机票城市列表model
    */
    F.FlightCityListModel = new cBase.Class(BusinessModel, {
        __propertys__: function () {
            this.url = '/Data/AirportCity';
            this.method = 'GET';
            this.param = {
                ver: 99
            };
            this.dataformat = function (data) {
                var d = data.cities || [], result = {};
                if (d.length) {
                    for (var i = 0, len = d.length; i < len; i++) {
                        result[d[i].portCode] = d[i];
                    }
                }
                data.cities2 = result;
                return data;
            };


            this.result = FlightStore.FlightCityListStore.getInstance();
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    /**
    * 国际机票城市列表model
    */
    F.FlightInterCityListModel = new cBase.Class(BusinessModel, {
        __propertys__: function () {
            this.url = '/Data/InternationalCity';
            this.method = 'GET';
            this.param = {
                dataVer: 0,
                ver: 0,
                type: 64
            };
            this.dataformat = function (data) {
                var d = data.cities || [], groupChar = {}, arr, hit = {}, ht, hotCity = [];
                if (d.length) {
                    for (var i = 0, len = d.length; i < len; i++) {
                        arr = groupChar[d[i].einitial] = groupChar[d[i].einitial] || [];
                        ht = hit[d[i].einitial] = hit[d[i].einitial] || {};
                        if (!ht[d[i].code + '' + d[i].flag]) {
                            if ((d[i].flag & 64) == 64) {
                                hotCity.push(d[i]);
                            } else {
                                arr.push(d[i]);
                            }
                            ht[d[i].code + '' + d[i].flag] = true;
                        }
                    }
                }
                for (var i in groupChar) {
                    groupChar[i].sort(function (a, b) {
                        return a.hotFlag - b.hotFlag;
                    });
                }
                hotCity.sort(function (a, b) { return a.hotFlag - b.hotFlag; });
                data.cities2 = groupChar;
                data.hotcity = hotCity;
                return data;
            };
            this.result = FlightStore.FlightInterCityListStore.getInstance();
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    //航班详情Model (add by caof)
    F.FlightDetailModel = new cBase.Class(BusinessModel, {
        __propertys__: function () {
            this.url = '/Flight/Domestic/FlightDetailV2/Query';
            this.method = 'POST';
            this.param = FlightStore.FlightDetailParamStore.getInstance();
            this.result = FlightStore.FlightDetailsStore.getInstance();

            $(originData.pols).each(function (index, item) {
                var priceinfo = findItemByKey(item.prices, psgType, 'psgtype'),
                    frinfo = findItemByKey(item.frinfo, psgType, 'psgtype'),
                    rebateInfo = findItemByKey(item.promos, 1, 'promotype'),
                    note = findItemByKey(item.notes, 5, 'notetype'), // 购票限制
                    kNote = findItemByKey(item.notes, 4, 'notetype'), // K位说明
                    cabin = {
                        class: item.grades[0].grade,
                        classForDisp: item.grades[0].dplclass,
                        discount: priceinfo.discount,
                        flag: (kNote.notes && kNote.notes[0]) ? (kNote.notes[0].desc || kNote.notes[0].notes) : "", // K位航班
                        fuelCost: priceinfo.fuel,
                        price: priceinfo.price,
                        tax: priceinfo.tax,
                        rebateAmt: rebateInfo.price || 0,
                        rebateRmk: (rebateInfo.promodates && rebateInfo.promodates[0]) ? rebateInfo.promodates[0].rmk : "",
                        giftCardInfo: findItemByKey(item.pkginfo, 2, 'pkgtype'),
                        promos: item.promos,
                        pkginfo: item.pkginfo,
                        polid: item.polid,
                        rmk: {
                            endNote: frinfo.end,
                            ext: null,
                            notice: "",
                            refNote: frinfo.refnote,
                            rerNote: frinfo.rer,
                            specialClass: "", // 新API中无，目前没用到
                            ticketBody: "", // 新API中无，目前没用到
                            ticketRmk: (note.notes && note.notes[0]) ? (note.notes[0].desc || note.notes[0].notes) : "", // 购票限制说明
                            ticketTitle: note.notetit || ""
                        }
                    };

                cabinsData.cabins.push(cabin);
            });

            return cabinsData;
        }
    });

    //订单提交Model (add by caof)
    F.FlightOrderSumbitModel = new cBase.Class(BusinessModel, {
        __propertys__: function () {
            this.url = '/html5/Flight/AddFlightOrder';
            this.method = 'POST';
            this.param = { dataVer: 99, ver: 99 };
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //用户机票订单列表Model (add by caof)
    F.FlightOrderListModel = new cBase.Class(BusinessModel, {
        __propertys__: function () {
            this.url = '/Flight/Domestic/OrderList/Query';
            this.method = 'POST';
            this.param = { dataVer: 99, ver: 99 };
            this.result = FlightStore.FlightOrderListStore.getInstance();
            this.isUserData = true;
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //用户机票订单详情Model (add by caof)
    F.FlightOrderDetailModel = new cBase.Class(BusinessModel, {
        __propertys__: function () {
            this.url = '/Flight/Domestic/Order/Query';
            this.method = 'POST';
            this.param = { dataVer: 99, ver: 99 };
            this.result = FlightStore.FlightOrderDetailStore.getInstance();
            this.isUserData = true;
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //机票退改签查询Model (add by Teller)
    F.FlightTicketRefundChangeModel = new cBase.Class(BusinessModel, {
        __propertys__: function () {
            this.url = '/Flight/Domestic/Ticket/RefundChangeStatus/Query';
            this.result = FlightStore.FlightTicketRefundChangeStore.getInstance();
            this.method = 'POST';
            this.param = {};
            this.isUserData = true;
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    //机票改签申请Model (add by Teller)
    F.FlightTicketChangeModel = new cBase.Class(BusinessModel, {
        __propertys__: function () {
            this.url = '/Flight/Domestic/Ticket/Change';
            this.method = 'POST';
            this.param = {};
            this.isUserData = true;
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    //机票退票申请Model (add by Air)
    F.FlightTicketRefundModel = new cBase.Class(BusinessModel, {
        __propertys__: function () {
            this.url = '/Flight/Domestic/Ticket/Refund';
            this.method = 'POST';
            this.param = {};
            this.isUserData = true;
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });


    /**
    * 机票列表页model
    */
    F.FlightListModel = new cBase.Class(BusinessModel, {
        __propertys__: function () {
            this.url = '/Flight/Domestic/FlightList/Query';
            this.param = FlightStore.FlightSearchStore.getInstance();
            this.result = FlightStore.FlightListStore.getInstance();
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    // 机票基础数据
    /**
    * 航空公司数据model
    */
    F.FlightAirlineModel = new cBase.Class(BusinessModel, {
        __propertys__: function () {
            this.url = '/Data/Airline?ver=1';
            this.method = 'GET';
            this.param = {};
            this.result = FlightStore.FlightAirlineStore.getInstance();
            this.dataformat = function (data) {
                var d = data.airlines || [], result = {};
                if (d.length) {
                    for (var i = 0, len = d.length; i < len; i++) {
                        result[d[i].code] = d[i];
                    }
                }
                return result;
            };
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    /**
    * 机型数据model
    */
    F.FlightAircraftModel = new cBase.Class(BusinessModel, {
        __propertys__: function () {
            this.url = '/Data/Aircraft?ver=1';
            this.method = 'GET';
            this.param = {};
            this.result = FlightStore.FlightAircraftStore.getInstance();
            this.dataformat = function (data) {
                var d = data.aircrafts || [], result = {};
                if (d.length) {
                    for (var i = 0, len = d.length; i < len; i++) {
                        result[d[i].type] = d[i];
                    }
                }
                return result;
            };
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    /**
    * 航班配送方式model
    */
    F.FlightPickTicketModel = new cBase.Class(BusinessModel, {
        __propertys__: function () {
            this.url = '/Flight/Domestic/DeliveryV2/Query';
            //this.param = FlightStore.FlightPickTicketParamStore.getInstance();
            this.param = {};
            this.result = FlightStore.FlightPickTicketStore.getInstance();
            this.isUserData = true;
        },
        initialize: function ($super, options) {
            $super(options);
        },
        setFlightNo: function (no) {
            var o = this.param.get();
            item = o.items && o.items[0] || {};
            item['flightNo'] = no;
            o.items = [item];
            this.param.set(o);
        }
    });
    //机票退改签查询Model (add by Teller)
    F.FlightTicketRefundChangeModel = new cBase.Class(BusinessModel, {
        __propertys__: function () {
            this.url = '/Flight/Domestic/Ticket/RefundChangeStatus/Query';
            this.result = FlightStore.FlightTicketRefundChangeStore.getInstance();
            this.method = 'POST';
            this.param = {};
            this.isUserData = true;
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    //机票改签申请Model (add by Teller)
    F.FlightTicketChangeModel = new cBase.Class(BusinessModel, {
        __propertys__: function () {
            this.url = '/Flight/Domestic/Ticket/Change';
            this.method = 'POST';
            this.param = {};
            this.isUserData = true;
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    //机票快递信息Model (add by Teller)
    F.ExpressStatusSearchModel = new cBase.Class(BusinessModel, {
        __propertys__: function () {
            this.url = '/customer/Express/status/query';
            this.method = 'POST';
            this.param = {};
            this.isUserData = true;
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    //90天低价机票Model (add by huangjianhua)
    F.LowestPriceSearchModel = new cBase.Class(BusinessModel, {
        __propertys__: function () {
            this.url = '/Flight/Domestic/Flight/LowestPrice/Query';
            this.method = 'POST';
            this.param = FlightStore.LowestPriceSearchStore.getInstance();
            this.result = FlightStore.FlightLowestPriceStore.getInstance();
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    //值机Model
    F.SelectSeatModel = new cBase.Class(BusinessModel, {
        __propertys__: function () {
            this.url = '/Flight/Domestic/ModelFigure/Query';
            this.method = 'POST';
            this.param = {};
            this.result = FlightStore.FlightSelectSeatStore.getInstance();
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });


    //航司的值机协议Model(add by wyren)
    F.CheckinSearchModel = new cBase.Class(BusinessModel, {
        __propertys__: function () {
            this.url = '/Flight/Domestic/CheckIn/AircraftRulesSearch';
            this.method = 'POST';
            this.param = FlightStore.CheckinSearchParamStore.getInstance();
            this.result = FlightStore.CheckinResultStore.getInstance();
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });


    //选座可值机航班查询_列表(add by mmx)
    F.CheckinListModel = new cBase.Class(BusinessModel, {
        __propertys__: function () {
            this.url = '/Flight/Domestic/CheckIn/CheckInListSearch';
            this.method = 'POST';
            this.param = { "ver": 0 };
            this.result = FlightStore.CheckinListStore.getInstance();
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });



    //选座提交(add by wyren)
    F.SeatSubmitModel = new cBase.Class(BusinessModel, {
        __propertys__: function () {
            this.url = '/Flight/Domestic/Seat/Submit';
            this.method = 'POST';
            this.param = {};
            // this.result=FlightStore.CheckinListStore.getInstance();
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
    //非携程可值机航班查询(add by wyren)
    F.CheckinSegmentModel = new cBase.Class(BusinessModel, {
        __propertys__: function () {
            this.url = '/Flight/Domestic/CheckIn/CheckInSegmentSearch';
            this.method = 'POST';
            this.param = {};
            this.result = FlightStore.CheckinSegmentStore.getInstance();
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    //值机提交Model
    F.SubmitCheckinModel = new cBase.Class(BusinessModel, {
        __propertys__: function () {
            this.url = '/Flight/Domestic/CheckIn/CheckInSubmit';
            this.method = 'POST';
            this.param = {
                /*  "fcsinf":{
                "acode":"TAO",
                "dcode":"HGH",
                "ddate":"2014-5-9 21:45:00",
                "fno":"SC4646",
                "setno":"12E"
                },
                "oid":1209707191,
                "psginf":{
                "cno":"DHVCH",
                "ctype":2,
                "phone":"15601939999",
                "psgname":"值机二",
                "tno":null
                },
                "ver":0*/
            };
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });


    //可值机航空公司
    F.CheckAirListModel = new cBase.Class(BusinessModel, {
        __propertys__: function () {
            this.url = '/Flight/Domestic/CheckIn/AircraftRulesSearch';
            this.method = 'POST';
            this.param = {
            };
            this.result = FlightStore.CheckinAirListStore.getInstance();
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    //机票下单
    F.OrderCreateModel = new cBase.Class(BusinessModel, {
        __propertys__: function () {
            this.url = '/Flight/Domestic/Order/OrderCreate';
            this.method = 'POST';
            this.param = {};
            this.isUserData = true;
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    //国内消费券余额
    F.CustomerCouponModel = new cBase.Class(BusinessModel, {
        __propertys__: function () {
            this.method = 'POST';
            this.param = { ver: 1, pageIdx: 1, flag: 1 };
            this.isUserData = true;
            this.result = FlightStore.CustomerCouponStore.getInstance();
            var self = this;
            this.buildurl = function () {
                return self.protocol + "://" + self.getdomain().domain + "/" + self.getdomain().path + "/customer/coupon/query";
            }
        },
        initialize: function ($super, options) {
            $super(options);
        },
        //判断环境
        getdomain: function (host) {
            var host = host || window.location.host;
            if (host.match(/^m\.ctrip\.com/i) || host.match(/^secure\.ctrip\.com/i)) {
                //生产环境
                domain = 'm.ctrip.com';
                path = 'restapi';
            } else if (host.match(/^(localhost|172\.16|127\.0)/i) || window.DEBUG_MODE) {
                //本地环境 data from testu
                domain = 'm.fat19.qa.nt.ctripcorp.com';
                path = 'restapi.common';
            } else if (host.match(/^10\.8\.2\.111/i) || host.match(/^10\.8\.5\.10/i)) {
                //堡垒环境
                domain = 'm.ctrip.com';
                path = 'restapi';
            } else if (host.match(/^m\.uat\.qa\.ctripcorp\.com/i)) {
                //测试环境 uat
                domain = 'm.uat.qa.ctripcorp.com';
                path = 'restapi';
            } else if (host.match(/^m\.fat/i) || host.match(/^waptest\.ctrip|^210\.13\.100\.191/i) || host.match(/^wapsecuretest\.ctrip|^210\.13\.100\.191/i) || window.DEBUG_MODE) {
                //测试环境 fat waptest; data from testu
                domain = 'm.fat19.qa.nt.ctripcorp.com';
                path = 'restapi.common';
            } else {
                //默认生产环境
                domain = 'm.ctrip.com';
                path = 'restapi';
            }
            return {
                domain: domain,
                path: path
            };

        }
    });

    //机票下单(非第三方)
    F.PaymentModel = new cBase.Class(BusinessModel, {
        __propertys__: function () {
            this.url = '/Flight/Domestic/Order/OrderSubmit';
            this.method = 'POST';
            this.param = {
                "ver": 0
            };
            this.isUserData = true;

        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    //机票下单( 第三方)
    F.PaymentThirdModel = new cBase.Class(BusinessModel, {
        __propertys__: function () {
            this.url = '/Flight/Domestic/Order/OrderSubmit';
            this.method = 'POST';
            this.param = {
                "ver": 0
            };
            this.isUserData = true;

        },
        initialize: function ($super, options) {
            $super(options);
        }
    });


    //继续支付
    F.PaymentThirdPartySignatureForFlightSearch = new cBase.Class(BusinessModel, {
        __propertys__: function () {
            // this.url = '/Flight/Domestic/Payment/PaymentThirdPartySignatureForFlightSearch';

            // domain = "secure.fat18.qa.nt.ctripcorp.com";
            // path = "restapi";
            this.method = 'POST';
            this.param = {
                "ver": 1
            };
            // this.usehead = false;
            this.isUserData = true;
            var self = this;
            this.buildurl = function () {
                return self.getdomain().protocol + "://" + self.getdomain().domain + "/" + self.getdomain().path + "/Flight/International/PaymentRelationChange/Query";
            };


        },
        initialize: function ($super, options) {
            $super(options);
        },
        //判断环境
        getdomain: function (host) {
            var protocol = "http";
            var domain = "m.ctrip.com";
            var path = "restapi";
            var host = host || window.location.host;
            //生产
            if (host.match(/^m\.ctrip\.com/i) || host.match(/^secure\.ctrip\.com/i)) {
                protocol = "http";
                domain = 'm.ctrip.com';
                path = "restapi";
            }
                //堡垒
            else if (host.match(/^10\.8\.2\.111/i) || host.match(/^10\.8\.5\.10/i)) {
                protocol = "http";
                domain = 'm.ctrip.com';
                path = 'restapi';
                //domain = 'ws.mobile.flight.ctripcorp.com';
                //path = 'FlightWirelessApi';

            }
            else if (host.match(/^m\.uat\.qa\.nt\.ctripcorp\.com/i)) {
                //测试环境 uat
                domain = 'ws.mobile.flight.uat.ctripcorp.com';
                path = 'FlightWirelessApi';
            }
                //本地
            else if (host.match(/^(localhost|172\.16|127\.0)/i)) {
                protocol = "http";
                domain = '172.16.156.70:88';
                path = "restapi";

            }
                //测试
            else if (host.match(/^m\.fat/i)) {
                protocol = "http";
                domain = 'ws.mobile.flight.fat36.qa.nt.ctripcorp.com';
                path = 'FlightWirelessApi';
            }
            else {
                protocol = "http",
                domain = 'm.ctrip.com';
                path = "restapi";
            }
            return {
                protocol: protocol,
                domain: domain,
                path: path
            };

        }
    });

    //重复订单
    F.RepeatOrderCheckModel = new cBase.Class(BusinessModel, {
        __propertys__: function () {
            this.url = '/Flight/Domestic/Order/RepeatOrderCheck';
            this.method = 'POST';
            this.param = {
                "ver": 0
            };
            this.result = FlightStore.RepeatOrderCheckStore.getInstance();
            this.isUserData = true;
        },
        initialize: function ($super, options) {
            $super(options);
        },
        mappingRequest: function (passengers, flightDetailsData) {
            var requestData = {
                "pinfo":[],
                "finfo":[],
                "ver" : 0
            };
            passengers && passengers.forEach(function (item, index) {
                var pinfo = {
                    "cnum": item.passportNo, // 证件号码
                    "ctype": item.passportType, // 证件类型  
                    "nation": item.natl,
                    "psgid": item.id, // 就是inforId (必须)
                    "psgname": item.name,
                };
                requestData.pinfo.push(pinfo);
            });
            flightDetailsData && flightDetailsData.items.forEach(function (item, index) {
                var finfo = {
                    "dcity":item.basicInfo.dCtyCode,
                    "dcityid":item.basicInfo.dCtyId,
                    "ddate": item.basicInfo.dTime
                };
                requestData.finfo.push(finfo);
            });
            return requestData;
        }
    });

    // 航班动态列表
    F.FlightVarListModel = new cBase.Class(BusinessModel, {
        __propertys__: function () {
            this.url = '/Flight/Domestic/FlightVarList/Query';
            this.method = 'POST';
            this.param = {
                "queryType": 2,
                "ver": 0
            };
            this.isUserData = true;

        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    //小米黄页
    F.XiaoMiModel = new cBase.Class(BusinessModel, {
        /*     buildurl: function() {
               return 'http://172.16.156.89/restful/Flight/International/Miui/Push'
             },*/
        __propertys__: function () {
            this.url = '/Flight/International/Miui/Push';
            this.method = 'POST';
            this.param = {
                "ver": 0
            };

        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    /********************************
    * @description:  非会员匿名登录 
    * @author:       rhhu
    */
    F.NonmemberLoginModel = new cBase.Class(BusinessModel, {
        __propertys__: function () {
            this.url = '/User/Nonmember/Login';
            this.method = 'POST';
            this.param = {};
            this.isUserData = true;
            this.protocol = 'https';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    //重复地址判断
    F.AddrCheckModel = new cBase.Class(BusinessModel, {
        __propertys__: function () {
            this.url = '/Flight/Domestic/Delivery/AddressCheck';
            this.method = 'POST';
            this.param = {
                "ver": 0
            };
            this.isUserData = true;
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    //航班详情Model (add by caof)
    F.FlightDetailModel = new cBase.Class(BusinessModel, {
        __propertys__: function () {
            this.url = '/Flight/Domestic/FlightDetailV2/Query';
            this.method = 'POST';
            this.param = FlightStore.FlightDetailParamStore.getInstance();
            this.result = FlightStore.FlightDetailsStore.getInstance();

            this.isUserData = true;
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    //OPEN API 2.0 订单提交(add by kwzheng 2014-5-19)
    F.FlightOrderCreateModel = new cBase.Class(BusinessModel, {
        __propertys__: function () {
            this.url = '/Flight/Domestic/Order/OrderCreate';
            this.param = {};
            this.method = 'POST';
            //this.result = FlightStore.OrderCreateStore.getInstance();
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    //航班舱位Model (add by kwzheng)
    F.FlightCabinModel = new cBase.Class(BusinessModel, {
        __propertys__: function () {
            this.url = '/Flight/Domestic/FlightDetailV2/Query';
            this.method = 'POST';
            this.param = FlightStore.FlightDetailParamStore.getInstance();
            this.result = FlightStore.FlightCabinListStore.getInstance();
            this.dataformat = this.formatData;
        },
        initialize: function ($super, options) {
            $super(options);
        },
        formatData: function (data) {
            var psgType = FlightStore.FlightSearchStore.getInstance().getAttr("passengerType"),
                originData = data.originData;
            cabinsData = {
                head: originData.head,
                cabins: [],
                ext: null,
                flag: 0
            };

            $(originData.pols).each(function (index, item) {
                var priceinfo = findItemByKey(item.prices, psgType, 'psgtype'),
                    frinfo = findItemByKey(item.frinfo, psgType, 'psgtype'),
                    rebateInfo = findItemByKey(item.promos, 1, 'promotype'),
                    note = findItemByKey(item.notes, 5, 'notetype'), // 购票限制
                    kNote = findItemByKey(item.notes, 4, 'notetype'), // K位说明
                    cabin = {
                        class: item.grades[0].grade,
                        classForDisp: item.grades[0].dplclass,
                        discount: priceinfo.discount,
                        flag: (kNote.notes && kNote.notes[0]) ? (kNote.notes[0].desc || kNote.notes[0].notes) : "", // K位航班
                        fuelCost: priceinfo.fuel,
                        price: priceinfo.price,
                        tax: priceinfo.tax,
                        rebateAmt: rebateInfo.price || 0,
                        rebateRmk: (rebateInfo.promodates && rebateInfo.promodates[0]) ? rebateInfo.promodates[0].rmk : "",
                        giftCardInfo: findItemByKey(item.pkginfo, 2, 'pkgtype'),
                        promos: item.promos,
                        pkginfo: item.pkginfo,
                        polid: item.polid,
                        rmk: {
                            endNote: frinfo.end,
                            ext: null,
                            notice: "",
                            refNote: frinfo.refnote,
                            rerNote: frinfo.rer,
                            specialClass: "", // 新API中无，目前没用到
                            ticketBody: "", // 新API中无，目前没用到
                            ticketRmk: (note.notes && note.notes[0]) ? (note.notes[0].desc || note.notes[0].notes) : "", // 购票限制说明
                            ticketTitle: note.notetit || ""
                        }
                    };

                cabinsData.cabins.push(cabin);
            });

            return cabinsData;
        }
    });

    //订单提交Model (add by caof)
    F.FlightOrderSumbitModel = new cBase.Class(BusinessModel, {
        __propertys__: function () {
            this.url = '/html5/Flight/AddFlightOrder';
            this.method = 'POST';
            this.param = { dataVer: 99, ver: 99 };
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    return F;

});
define({
    'Flight/Domestic/DeliveryV2/Query': {
        // payments:'',	//信用卡限制列表
        deliveries: function (newData) {	//配送方式列表
            if (!newData.deliverys) {
                return [];
            }
            return (newData.deliverys || []).map(function (new_delvy) {
                var old_delvy = {};
                old_delvy.type = new_delvy.dtype; //类型
                old_delvy.name = new_delvy.dname;
                old_delvy.exinfo = new_delvy.exinfo;
                // old_delvy.payType='',	//可支持的支付方式
                // old_delvy.bankType='',//第三方支付支持的网银
                var n = 0;
                old_delvy.addrs = new_delvy.slst ? new_delvy.slst.map(function (new_addr) {	//配送地址列表
                    var old_addr = {};
                    old_addr.id = new_addr.siteid; //室内自取：地址ID；机场自取：票台ID
                    old_addr.name = new_addr.sitename; //室内配送行政区名称。。。
                    var btime = ""; //modify  by zhengkw 2014-5-29 修改时间格式为0800
                    if (new_addr.stime != null) {
                        var hours = new Date(new_addr.stime).getHours().toString();
                        btime += hours.length < 2 ? "0" + hours : hours;
                        var minutes = new Date(new_addr.stime).getMinutes().toString();
                        btime += minutes.length < 2 ? "0" + minutes : minutes;
                    }
                    old_addr.btime = btime; //开始时间
                    var etime = ""; //modify  by zhengkw 2014-5-29 修改时间格式为0800
                    if (new_addr.etime != null) {
                        var hours = new Date(new_addr.etime).getHours().toString();
                        etime += hours.length < 2 ? "0" + hours : hours;
                        var minutes = new Date(new_addr.etime).getMinutes().toString();
                        etime += minutes.length < 2 ? "0" + minutes : minutes;
                    }
                    old_addr.etime = etime; //结束时间
                    // old_addr.flag='';//标记位
                    // old_addr.port='';//取票机场三字码
                    old_addr.dstr = new_addr.siteid; //行政区ID
                    old_addr.site = new_addr.exinfo.ssiteid; //柜台所属票点
                    old_addr.ext = new_addr.extinfo; //扩展字段
                    // old_addr.rule='';//送票规则
                    old_addr.fee = new_addr.exinfo.fee; //配送费
                    // old_addr.bankOrder='';//第三方支付网银排序
                    // old_addr.bankAdUrl='';//第三方支付网银的广告URL
                    old_addr.index = n;
                    n = n + 1;
                    return old_addr;
                }) : null;

                return old_delvy;
            });
        }
    },
    'Flight/Domestic/FlightDetailV2/Query': function (data) {
        if (data.items && data.items.length) {
            return data;
        }
        var translae = {
            availTM: 0, //可用游票余额--------------------------------------新API 无
            couponBalance: 0, //该用户消费券余额--------------------------------------新API 无
            ext: null, //扩展字段，|符合分隔。第一个字段为预订位用的SnNo
            flag: null, //状态位(位操作); 1:是否可订, 2:该会员是否需要担保; 4:是否强制购买保险; 8:普通航班是否需要预订位; 16:是否需要跳转到第一程列表并刷新;32:触发往返返现城市不一致的只允许去程返现的规则，是否弹框--------------------------------------新API 无，很重要
            insurances: [], //保险列表
            items: [], //航班详情记录数
            notice: null, //公告，不为空时显示
            rebateDur: 0, //返现期限--------------------------------------待确认
            strategy: {}, //控制策略--------------------------------------待确认
            needinv: null, //是否支持发票
            originData: null,
            ispackage:null,
            hasTravalPackage: false,
            pkglist: [],//是否为旅行套餐,
            invoiceinfo:[]
        };

        //公告 notetype=1 为公告
        if (data.notes && data.notes.length) {
            for (var i = 0; i < data.notes.length; i++) {
                var note = data.notes[i];
                if (note.notetype == 1 && note.notes && note.notes.length) {
                    translae.notice = note.notes[0].notes;
                }

            }
        }
        
        //var segs_orderCreate = { segno: 0, prdid: poliddata.segs.prdid, polid: null };
        //航班基本信息
        for (var i = 0; i < data.segs.length; i++) {
            var seg = data.segs[i]; //航程信息
            var policy = data.pols[i]; //政策信息
            var item = {
                basicInfo: {}, //航班基本信息
                ext: "", //扩展字段, 客户端在提交订单时上传此字段
                policy: {}, //政策
                proRmk: "", //套餐说明
                rmk: {}, //退改签
                routingIdx: "", //路由索引(预留)
                stopCities: []//经停信息
            };

            var basinfo = seg.flgs[0].basinfo; //基本信息
            var aportinfo = seg.flgs[0].aportinfo; //到达信息
            var dportinfo = seg.flgs[0].dportinfo; //起飞信息
            var dateinfo = seg.flgs[0].dateinfo; //出发日期
            var craftinfo = seg.flgs[0].craftinfo; //机型信息
            var stopinfo = seg.flgs[0].stopinfo; //经停信息


            //基本信息
            item.basicInfo.aCtyCode = aportinfo.city; //到达城市三字码
            item.basicInfo.aCtyId = null; //到达城市ID--------------------------------------新API 无
            item.basicInfo.aPortCode = aportinfo.aport//到达机场三字码;
            item.basicInfo.aTerminal = aportinfo.bsname; //到达机场航站楼

            item.basicInfo.aTime = dateinfo.adate; //到达日期
            item.basicInfo.aaname = aportinfo.aportsname; //到达机场名称
            item.basicInfo.acname = aportinfo.cityname; //到达城市
            item.basicInfo.agreementId = ""; //直连产品ID--------------------------------------新API 无
            item.basicInfo.airlineCode = basinfo.aircode; //航空公司二字码
            item.basicInfo.aname = basinfo.airsname; //航空公司名称
            item.basicInfo.channel = ""; //航空公司服务渠道号(直连使用)--------------------------------------新API 无
            item.basicInfo.ctinfo = {}; //机型信息
            item.basicInfo.ctinfo.ckind = craftinfo.kind == 1 ? 'L' : craftinfo.kind == 2 ? 'M' : craftinfo.kind == 3 ? 'S' : 'Unknow'; //机型，如中型机。。待转换 原先为M，现在为2
            item.basicInfo.ctinfo.ctname = craftinfo.cname; //飞机名称 波音 783
            item.basicInfo.ctinfo.maxs = craftinfo.max; //最大座位数
            item.basicInfo.ctinfo.mins = craftinfo.min; //最小座位数
            item.basicInfo.ctinfo.wlvl = ""; //未知--------------------------------------新API 无

            item.basicInfo.dCtyCode = dportinfo.city; //出发城市三字码
            item.basicInfo.dCtyId = dportinfo.cityid; //出发城市ID--------------------------------------新API 无
            item.basicInfo.dPortCode = dportinfo.aport; //出发机场三字码
            item.basicInfo.dTerminal = dportinfo.bsname; //出发机场航站楼
            item.basicInfo.dTime = dateinfo.ddate; //出发日期
            item.basicInfo.daname = dportinfo.aportsname; //出机场名称
            item.basicInfo.dcname = dportinfo.cityname; //出发城市名称

            item.basicInfo.flag = null; //舱位状态(位操作);1:飞人航班; 2:K位舱位;4:直连舱位; 8:限本地出票; 32:是否共享资源--------------------------------------新API 无
            item.basicInfo.flightNo = basinfo.flgno; //航班号
            item.basicInfo.planeType = craftinfo.craft; //机型名称
            item.basicInfo.puncRate = dateinfo.prate; //准点率
            item.basicInfo.polid = policy.polid;
            //经停信息
            if (stopinfo.isstop) {
                for (var j = 0; j < stopinfo.citys.length; j++) {
                    var stopcity = stopinfo.citys[j];
                    item.stopCities.push({
                        name: stopcity.cityname, //经停城市名,--------------------------------------新API 无
                        aTime: null, //到达时间，新API只有耗时，暂时设置耗时值--------------------------------------新API 无
                        dTime: null, //出发时间 --------------------------------------新API 无
                        Time: stopcity.StopTime
                    });
                }
            }

            //政策信息
            item.policy.isAddChd = null; //儿童订成人票，姓名后是否加CHD 0：否； 1：是--------------------------------------新API 无
            item.policy.activityBM = ""; //活动产品类型--------------------------------------待确认
            item.policy.babyPolicy = null; //婴儿票政策,空表示不支持,--------------------------------------新API 无
            item.policy.cardTypes = policy.salepolinfo.cards; //支持的证件ID列表，多个使用逗号,分隔，空字符串表示不限制
            item.policy.childPolicy = null; //儿童票政策,空表示不支持,--------------------------------------新API 无
            //是否支持发票，往返程取第一层
            if (i == 0) {
                translae.needinv = policy.needinv;
                translae.invoiceinfo = policy.invoiceinfo || [];
            }
            item.policy.isApplyChild = null; //是否允许儿童购买成人票  --------------------------------------新API 无
            var grades = policy.grades[0]; //舱位信息
            item.policy.class = grades.grade; //0=Y=经济舱；1=S=超级经济舱；2=C=公务舱；3=F=头等舱；9=CF=公务舱+头等舱（不使用）
            item.policy.classForDisp = grades.dplclass; //特殊舱位，1:高端; 2:超值; 3:豪华----------------------------------新API 无
            var prices = policy.prices; //价格信息 --------------------------------------待确认
            for (var k = 0; k < prices.length; k++) {//--------------------------------------待确认
                var price = prices[k];
                if (price.psgtype == 1) {//暂时用成人的价格作为机票价，
                    /*0=Unknow=未知
                    1=Adult=成人
                    2=Child=儿童
                    3=Baby=婴儿
                    4=Old=老人*/
                    item.policy.discount = price.discount; //折扣率
                    item.policy.price = price.price; //价格,即票价
                    item.policy.sPrice = price.stand; //全价
                    item.policy.fuelCost = price.fuel; //燃油费
                    item.policy.tax = price.tax; //税/机建
                    item.policy.isApplyChild = price.appchild; //是否支持儿童购买成人票
                }
                else if (price.psgtype == 3) {
                    item.policy.babyPolicy = item.policy.babyPolicy || {};
                    item.policy.babyPolicy.fuelCost = price.fuel; //燃油费--------------------------------------新API 无
                    item.policy.babyPolicy.isApply = true; //是否支持儿童票--------------------------------------新API 无
                    item.policy.babyPolicy.price = price.price; //价格--------------------------------------新API 无
                    item.policy.babyPolicy.tax = price.tax; //税费--------------------------------------新API 无
                }
                else if (price.psgtype == 2) {
                    item.policy.childPolicy = item.policy.childPolicy || {};
                    item.policy.childPolicy.fuelCost = price.fuel; //燃油费--------------------------------------新API 无
                    item.policy.childPolicy.isApply = true; //是否支持儿童票--------------------------------------新API 无
                    item.policy.childPolicy.price = price.price; //价格--------------------------------------新API 无
                    item.policy.childPolicy.tax = price.tax; //税费--------------------------------------新API 无
                }
            }

            item.policy.minNum = policy.salepolinfo.mintkt; //当前航班限制的最少出行人， 0表示不限制--------------------------------------待确认

            var pkginfo = policy.pkginfo; //套餐信息 包括保险、礼品卡以及乘客显示
            for (var l = 0; l < pkginfo.length; l++) {
                var pkg = pkginfo[l];
                var minNum = 0;
                if (pkg.packageinfo && pkg.packageinfo.psgs && pkg.packageinfo.psgs.length) {//购票限制
                    for (var m = 0; m < pkg.packageinfo.psgs.length; m++) {
                        var psg = pkg.packageinfo.psgs[m];
                        if (psg.psgtype == 1) {
                            minNum = psg.min; //V2.4.3暂时是不支持儿童和婴儿，目前暂时以成人类型的最小购票数目作为该航班保险的最少购买份数，--------------------------------------待确认
                            break;
                        }
                    }

                }
                if (pkg.basicinfo && pkg.basicinfo.pkgtype == 1 && i == 0) {//转换保险信息--------------------------------------待确认,很重要
                    var insurance = {};
                    insurance.amt = null;
                    insurance.type = null; //保险类型; 1:(T)行意险; 2:(D)行延险; 4:惠飞宝--------------------------------------新API 无
                    insurance.ext = null; //扩展字段, 客户端在提交订单时上传此字段--------------------------------------新API 无
                    insurance.min = minNum; //保险最少购买份数
                    insurance.price = pkg.price; //保险价格--------------------------------------待确认
                    insurance.productId = null; //SOA保险老系统产品编号ProductId--------------------------------------新API 无
                    insurance.rmk = null; //保险备注--------------------------------------新API 无
                    insurance.salesRmk = null; //保险销售备注--------------------------------------新API 无
                    insurance.sites = null; //支持该保险的票点，分号分隔--------------------------------------新API 无
                    insurance.typeId = pkg.basicinfo.pkgid; //险种编号TypeId在,直连保险只用这个字段
                    insurance.url = pkg.basicinfo.pkgdescurl; //保险说明跳转地址，统一和APP保持一致
                    translae.insurances.push(insurance);
                }
            }

            if (i==0) {//旅行套餐二选一,取第一程,同时包含礼品卡和保险套餐的才能认为是二选一套餐
                 var insure=pkginfo.filter(function(p,index){
                    return p.basicinfo.pkgtype==1;
                 });
                var lp=pkginfo.filter(function(p,index){
                   return p.basicinfo.pkgtype==2;
                });
                if (insure.length&&lp.length) {
                     translae.ispackage=true;
                     translae.pkglist=pkginfo;
                }
            }

            item.policy.payments = []; //信用卡限制列表;仅仅适用于不需要报销凭证 --------------------------------------新API 无
            item.policy.productType = null; //产品类型--------------------------------------新API 无
            item.policy.qty = policy.quantity; //舱位数量

            var promos = policy.promos; //活动信息
            for (var n = 0; n < promos.length; n++) {
                var pro = promos[n];
                /*1=Rebate=返现
                2=Promote=促销
                3=Gift=礼品
                4=Meal=餐饮
                5=Package=旅行套餐
                6=Insurance=惠飞宝*/
                switch (pro.promotype) {
                    case 1:
                        item.policy.rebateAmt = pro.price; //最多可使用消费券金额，返现金额, 0表示不返现--------------------------------------待确认
                        if (pro.promodates && pro.promodates.length) {
                            item.policy.rebateAmtDescription = pro.promodates[0].rmk
                        }
                        break;
                    case 6: //惠飞宝套餐必须绑定保险
                        translae.flag = 7;
                        break;
                    case 3: //送礼品卡
                        item.policy.gift = pro.price; //礼品卡
                        if (pro.promodates && pro.promodates.length) {
                            item.policy.giftDescription = pro.promodates[0].rmk
                        }
                    case 4: // 有餐饮
                        item.basicInfo.hasMeal = true;
                        break;
                    case 5: // 旅行套餐
                        translae.hasTravalPackage = true;
                        item.bIsPackage = true;
                        break;
                }
            }

            item.policy.subclass = null; //子舱位(预定用)--------------------------------------新API 无
            item.policy.subclassForDisp = null; //子舱位(显示用)--------------------------------------新API 无
            item.prodRmk = "";
            var pnotes = policy.notes;
            for (var o = 0; o < pnotes.length; o++) {
                var pnote = pnotes[o];
                switch (pnote.notetype) {
                    /*1=精选舱位说明
                    2=惠飞宝说明（统一显示二选一套餐说明）
                    3=套餐政策说明
                    4=K位说明
                    5=购票限制
                    6=付款说明文案
                    7=惠选机票说明文案
                    8=惠选机票特点说明文案
                    9=预定注意事项*/ 
                    case 2:
                        item.prodRmk = pnote.notes[0].notes; //套餐说明
                        break;
                    case 3:
                        item.prodRmk = pnote.notes[0].notes; //套餐说明
                        break;
                    case 5:
                        item.rmk.ticketRmk = pnote.notes[0].notes; //购票限制说明
                        break;
                    case 4:
                        item.basicInfo.IsK = true; //是否K位航班
                        break;
                }
            }


            var frinfo = policy.frinfo; //退改签信息,暂时用承认的退改签作为航班的退改签信息--------------------------------------待确认
            for (var p = 0; p < frinfo.length; p++) {
                var fri = frinfo[p];
                if (fri.psgtype == 1) {
                    /*0=Unknow=未知
                    1=Adult=成人
                    2=Child=儿童
                    3=Baby=婴儿
                    4=Old=老人*/
                    item.rmk.notice = ""; //公告信息，不为空时请展示
                    item.rmk.ticketTitle = ""; //自定义标题--------------------------------------新API 无
                    item.rmk.ticketBody = ""; //自定义标题内容--------------------------------------新API 无
                    item.rmk.refNote = fri.refnote; //退票条件说明
                    item.rmk.rerNote = fri.rer; //更改条件说明
                    item.rmk.endNote = fri.end; //签转条件说明
                    item.rmk.ext = null; //扩展字段，预留
                    item.rmk.specialClass = null; //K位说明，客户端直接展示--------------------------------------新API 无

                }
                else if (fri.psgtype == 3) {
                    if (item.policy.babyPolicy != null) { // 处理有退改签政策无价格问题
                        item.policy.babyPolicy = item.policy.babyPolicy || {};
                        item.policy.babyPolicy.refRerEndNote = {}; //退改签说明信息--------------------------------------新API 无
                        item.policy.babyPolicy.refRerEndNote.endNote = fri.end; //签转条件说明--------------------------------------新API 无
                        item.policy.babyPolicy.refRerEndNote.refNote = fri.refnote; //退票条件说明--------------------------------------新API 无
                        item.policy.babyPolicy.refRerEndNote.rerNote = fri.rer; //更改条件说明--------------------------------------新API 无
                    }
                }
                else if (fri.psgtype == 2) {
                    if (item.policy.childPolicy != null) { // 处理有退改签政策无价格问题
                        item.policy.childPolicy = item.policy.childPolicy || {};
                        item.policy.childPolicy.refRerEndNote = {}; //退改签说明信息--------------------------------------新API 无
                        item.policy.childPolicy.refRerEndNote.endNote = fri.end; //签转条件说明--------------------------------------新API 无
                        item.policy.childPolicy.refRerEndNote.refNote = fri.refnote; //退票条件说明--------------------------------------新API 无
                        item.policy.childPolicy.refRerEndNote.rerNote = fri.rer; //更改条件说明--------------------------------------新API 无
                    }
                }
            }


            if (seg.segno == 1) {//去程
                translae.items.unshift(item);
            }
            else {
                translae.items.push(item);
            }
        }
        translae.originData = data;
        return translae;
    },
    // 航班动态列表
    'Flight/Domestic/FlightVarList/Query': {
        Data: function (data) {
            var list = [];
            if (data && data.items) {
                $(data.items).each(function (index, item) {
                    var flightItem = {
                        ActualArriveTime: formatTime(item.aaTime),
                        ActualDepartTime: formatTime(item.adTime),
                        AirCompanyName: item.airlineName,
                        ArriveAirportCode: item.aPort,
                        ArriveAirportName: "", // 新API 无
                        ArriveTerminal: item.aTerminal,
                        DepartAirportCode: item.dPort,
                        DepartAirportName: "", // 新API 无
                        DepartTerminal: item.dTerminal,
                        EstimateArriveTime: formatTime(item.eaTime),
                        EstimateDeparTime: formatTime(item.edTime),
                        FlightNo: item.flightNo,
                        PlanArriveTime: formatTime(item.paTime),
                        PlanDepartTime: formatTime(item.pdTime),
                        StatusRemark: item.status,
                        StopAirport: item.stopPort,
                        StopCity: item.stopCty,
                        // 新增字段
                        puncRate: item.puncRate,
                        AirlineCode: item.airlineCode,
                        ActualArriveDate: item.aaDate,
                        ActualDepartDate: item.adDate,
                        AZone: item.azone,
                        DZone: item.dzone,
                        DStpe: item.dstpe,
                        eaDate: item.eaDate,
                        edDate: item.edDate,
                        interval: item.interval,
                        sDate: item.sDate,
                        pdDate: item.pdDate,
                        paDate: item.paDate,
                        fTime: item.fTime,
                        fcTime: item.fcTime,
                        plane: item.airmodel,
                        planeAge: item.planage,
                        cftkind: item.cftkind, // 大 中 小
                        follow: false,
                        borgate:item.borgate//登机口 add by kwzheng 2014-6-16
                    };
                    list.push(flightItem);
                });

                function formatTime(time) {
                    return !time ? '--:--' : time.slice(0, 2) + ":" + time.slice(2);
                }

                return list;
            }
        },
        Message: null,
        Query: null,
        ServerCode: 1
    },
	// 订单创建
    'Flight/Domestic/Order/RepeatOrderCheck': {
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
    }
});

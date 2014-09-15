define('vDataControl',[
  'FlightStore',
  'CPageStore',
  'c',
  'flight/utility/utility'
], function(
    FlightStore,
    CPageStore,
    c,
    Utility
    ) {

    var flightDetailsStore = FlightStore.FlightDetailsStore.getInstance(), //获取航班详细信息Storage
        passengerQueryStore = CPageStore.passengerQueryStore.getInstance(), //用户选择的登机人
        passengerEditStore = CPageStore.passengerEditStore.getInstance(), //设置需要修改的登机人Storage
        PSGTYPE = { ADULT: 1, CHILD: 2, BABY: 3, NEWBORN: 4 };

    var lowerThan14Day = function (serverDate, birthStr, age) {
        birthStr = c.base.Date.parse(birthStr);
        birthStr = c.base.Date.format(birthStr, 'Y/m/d');
        var lastFlyDate = serverDate.getTime();
        var birthDate = new Date(birthStr.replace(/-/g, '/')).getTime();
        return (lastFlyDate - birthDate) / (60 * 60 * 24 * 1000) <= 14 ? true : false;
    };
    var DataControl = function DataControl(_this) {
        this._this= _this;
    };

  // Edit by Michael.Lee
  DataControl.prototype = {
    passengerData: {},
    PassEditData: {}, //登记人编辑数据
    reqFlags: {
        DETAIL: false,
        PASSENGERS: false,
        HASPASSENGER: false
    },
    errorType: null, //错误类型，如name，birth，no等
    errorMessage: null, //错误提示信息
    tipIconType: '', // 提示信息类型 blue red
    TIPICONS: {
        BLUE: 'flight-errtips-blue',
        RED: 'flight-errtips-red'
    },
    errorInfo: null, //每个登机人的错误类型集合，[.js_no,.js_name]
    allErrorInfo: [], //所有错误信息的集合，用于刷新页面的时候继续保持原有错误信息的高亮
    //declined

    loadPassEditStore: function () { //加载当前常旅编辑信息

      var passengerEdit = passengerEditStore.get();

      if (passengerEdit.birth) {
        passengerEdit.birth = c.base.Date.parse(passengerEdit.birth).format('Ymd');
      }

      var newIdCardsDict = this.idCardsDict();
      //按顺序给证件赋值
      for (var i = 0; i < newIdCardsDict.length; i++) {
        newIdCardsDict[i].no = '';
        newIdCardsDict[i].opr = 1;
        newIdCardsDict[i].flag = 2;
        newIdCardsDict[i].expiryDate = "2099/1/1";
        for (var j = 0; j < passengerEdit.idcards.length; j++) {
          if (newIdCardsDict[i].type == passengerEdit.idcards[j].type) {
            for (var attr in passengerEdit.idcards[j]) {
              newIdCardsDict[i][attr] = passengerEdit.idcards[j][attr];
            }
          }
        }
      }

      passengerEdit.idcards = newIdCardsDict;
      if (passengerEdit.defaIdCard.type == 1) { //如果是身份证
          passengerEdit.idcards[0].no = Utility.formatCardNo(passengerEdit.idcards[0].no)
          passengerEdit.defaIdCard.no = Utility.formatCardNo(passengerEdit.defaIdCard.no)
      }
      for (var attr in passengerEdit) {
        this.PassEditData[attr] = passengerEdit[attr];
      }
      for (var attr in this.PassEditData) {
        this.PassEditData[attr] = typeof (passengerEdit[attr] != undefined) ? passengerEdit[attr] : null;
      }

    },
    savePassEditStore: function () { //保存当前常旅编辑信息
      if (!c.utility.validate.isEmptyObject(this.PassEditData)) {
        var newPassEditData = {};
        this.PassEditData.selected = 1;
        for (var attr in this.PassEditData) {
          newPassEditData[attr] = this.PassEditData[attr];
        }
        newPassEditData.idcards = [];
        newPassEditData.defaIdCard.no = newPassEditData.defaIdCard.no.replace(/\s/g, "")
        newPassEditData.idcards[0] = newPassEditData.defaIdCard;
        if (newPassEditData.birth) {
          newPassEditData.birth = c.base.Date.parse(newPassEditData.birth).format('Y-m-d')
        }
        passengerEditStore.set(newPassEditData);
      }
    },
    //can't be deleted ,used by vPassenger
    deletePsgById: function (id) {
      var passengerInfo = passengerQueryStore.get();
      var selCount = passengerQueryStore.getAttr('selCount');

      if (passengerInfo && passengerInfo.passengers) {
        _.each(passengerInfo.passengers, function (p, i) {
          if (p.inforId == id) {
            passengerInfo.passengers.splice(i, 1);
            selCount--;
            return false;
          }
        });
      }

      passengerQueryStore.setAttr('passengers', passengerInfo.passengers);
      passengerQueryStore.setAttr('selCount', selCount);
    },
    getPsgById: function (id) {
      var passengers = passengerQueryStore.getAttr('passengers');
      var psg = null;

      if (passengers) {
        _.each(passengers, function (p, i) {
          if (p.inforId == id) {
            psg = p;
            return false;
          }
        });
      }

      return psg;
    },
    getBirth: function (passenger) {
      var birth = '';
      if (passenger.defaIdCard.type != 1) {
        birth = passenger.birth;
      } else {
        birth = passenger.defaIdCard.no ? passenger.defaIdCard.no.substring(6, 14) : '';
      }

      return birth;
    },
    getAge: function (birthStr, firstFlyDay) {
      birthStr = c.base.Date.parse(birthStr);
      birthStr = c.base.Date.format(birthStr, 'Ymd');

      firstFlyDay = typeof firstFlyDay === 'undefined' ? true : false;
      var myDate, firstFlyDate;
      var items = flightDetailsStore.getAttr('items'); //航班详情store
      try {
        myDate = items.length > 1 ? items[1].basicInfo.dTime : items[0].basicInfo.dTime; // 取最后一程起飞时间来计算年龄
        firstFlyDate = items[0].basicInfo.dTime;
        // 处理在移动设备上，日期格式的问题
        myDate = (myDate || '').replace(/-/g, '/');
        myDate = new Date(myDate);

        firstFlyDate = (firstFlyDate || '').replace(/-/g, '/');
        firstFlyDate = new Date(firstFlyDate);
        console.log('flyDate', myDate);
      } catch (e) {
        myDate = this._this.getServerDate();
        firstFlyDate = this._this.getServerDate();
        console.log('GetAge Exception: myData->', myDate);
      }

      var month = myDate.getMonth() + 1;
      var day = myDate.getDate();
      var age = myDate.getFullYear() - birthStr.substring(0, 4) - 1;
      if (birthStr.substring(4, 6) < month || birthStr.substring(4, 6) == month && birthStr.substring(6, 8) <= day) {
        age++;
      }

      age = lowerThan14Day(firstFlyDate, birthStr, age) ? -2 : age; // 小于14天不能登机，age记为-2

      return age;
    },

    getPsgType: function (age, p) {
      if (p) {
        var birth = p.defaIdCard && p.defaIdCard.type == 1 ? Utility.getBirth(p.defaIdCard.no) : p.birth;
        if (birth != '') {
          age = this.getAge(birth);
        } else {
          return PSGTYPE.ADULT;
        }
      }

      return age >= 12 ? PSGTYPE.ADULT : (age >= 2 ? PSGTYPE.CHILD : PSGTYPE.BABY); ;
    },
    getSelectedPassengers: function () {        //TODO: to be moved into passenger
      var passengerInfo = passengerQueryStore.get();
      var psgType = PSGTYPE.ADULT;
      var selPassengers = [];
      //hasInvalidPsger = false;
      if (passengerInfo && passengerInfo.passengers) {
        for (var i in passengerInfo.passengers) {
          var p = passengerInfo.passengers[i];
          psgType = this.getPsgType(null, p);
          if (+p.selected == 1) {
            //selPassengers.push(p);
            if ((!this.isSupportChild() && psgType == PSGTYPE.CHILD) || (!this.isSupportBaby() && psgType == PSGTYPE.BABY)) { // 不算价格
              continue;
            } else {
                selPassengers.push(p);
            }
          }
        }
      }

      return selPassengers;
    },
    updatePassengersTicketType: function (psgersData) {
      if (!psgersData) {
        return false;
      }
      var passengers = psgersData.passengers || [];
      var policy = psgersData.policy || flightDetailsStore.getAttr('items')[0].policy;
      var childCanBuyAdult = policy.isApplyChild;
      var hasChildTicket = this.hasChildTicket();
      var hasBabyTicket = this.hasBabyTicket();
      var babyCanBuyChild = hasChildTicket && policy.childPolicy.isApply;
      var ticketAmt = this.getTicketAmtByType(PSGTYPE.ADULT);
      var childTicketAmt = this.getTicketAmtByType(PSGTYPE.CHILD);
      var babyTicketAmt = this.getTicketAmtByType(PSGTYPE.BABY);
      var isChildLTA = hasChildTicket ? (ticketAmt > childTicketAmt ? true : false) : false;
      var isBabyLTC = hasBabyTicket ? ((hasChildTicket && (childTicketAmt > babyTicketAmt) || !hasChildTicket) ? true : false) : false;
      var isBabyLTA = hasBabyTicket ? (ticketAmt > babyTicketAmt ? true : false) : false;
      var psgType = PSGTYPE.ADULT;

      var scope = this;

      $(passengers).each(function (index, p) {
        psgType = scope.getPsgType(null, p);
        if (psgType != PSGTYPE.ADULT) {
          if (psgType == PSGTYPE.CHILD) {
            // 如果有默认票类型，且可够买则不去取最优票价
            if (p.ticketType == PSGTYPE.ADULT && childCanBuyAdult || p.ticketType == PSGTYPE.CHILD && hasChildTicket) {
              // Continue; Do nothing
            } else {
              if (!hasChildTicket) {
                p.ticketType = childCanBuyAdult ? PSGTYPE.ADULT : -1;
              } else { // 比较儿童票与成人票的价格，取低价票
                if (childCanBuyAdult) {
                  p.ticketType = isChildLTA ? PSGTYPE.CHILD : PSGTYPE.ADULT;
                } else { // 儿童不能购买成人票
                  p.ticketType = PSGTYPE.CHILD;
                }
              }
            }

          } else if (psgType == PSGTYPE.BABY) {
            // 如果有默认票类型，且可够买则不去取最优票价
            if (p.ticketType == PSGTYPE.ADULT && childCanBuyAdult || p.ticketType == PSGTYPE.CHILD && babyCanBuyChild || p.ticketType == PSGTYPE.BABY && hasBabyTicket) {
              // continue; Do nothing
            } else {
              if (!hasBabyTicket) { // 没有婴儿票,取儿童和成人中的低价票
                  p.ticketType = hasChildTicket && babyCanBuyChild ? (isChildLTA ? PSGTYPE.CHILD : (childCanBuyAdult ? PSGTYPE.ADULT : PSGTYPE.CHILD)) : (childCanBuyAdult ? PSGTYPE.ADULT : -1);
              } else { // 有婴儿票，取三者之中的低票价
                if (hasChildTicket && childCanBuyAdult) {
                  if (babyCanBuyChild) { // 婴儿可以买儿童票
                    p.ticketType = isChildLTA ? (isBabyLTC ? PSGTYPE.BABY : PSGTYPE.CHILD) : (isBabyLTA ? PSGTYPE.BABY : PSGTYPE.ADULT);
                  } else { // 婴儿不可以买儿童票
                    p.ticketType = isBabyLTA ? PSGTYPE.BABY : PSGTYPE.ADULT;
                  }
                } else if (hasChildTicket) { // 婴儿不能买成人票,取婴儿和儿童中低价票
                  p.ticketType = babyCanBuyChild ? (isBabyLTC ? PSGTYPE.BABY : PSGTYPE.CHILD) : PSGTYPE.BABY;
                } else if (childCanBuyAdult) { // 婴儿不能买儿童票，取婴儿和成人中低价票
                  p.ticketType = isBabyLTA ? PSGTYPE.BABY : PSGTYPE.ADULT;
                } else {
                  p.ticketType = PSGTYPE.BABY;
                }
              }
            }
          }
        } else {
          p.ticketType = PSGTYPE.ADULT;
        }
      });
      passengerQueryStore.setAttr('passengers', passengers);
    },
    getTicketPolicy: function (ticketType, index) {
        index = index || 0; // 去或返 0 去, 1 返
        var items = flightDetailsStore.getAttr('items');
        var policy = items[index].policy;
        var result = null;

        switch (ticketType) {
            case -1: // 无选中票类型时（儿童或婴儿），不计算价格所以设置为0 方便计算
                result = { price: 0, fuelCost: 0, tax: 0 };
                break;
            case 1:
                result = policy;
                break;
            case 2:
                result = policy.childPolicy
                break;
            case 3:
                result = policy.babyPolicy
                break;
            default:
                result = policy;
                break;
        }
        return result;
    },
    getTicketAmtByType: function (ticketType) {
      var items = flightDetailsStore.getAttr('items'),
          policy = this.getTicketPolicy(ticketType),
          ticketAmt = 0;

      if (policy) {
        ticketAmt += policy.price + policy.fuelCost + policy.tax;
        if (items.length > 1) {
          policy = this.getTicketPolicy(ticketType, 1);
          if (policy) {
            ticketAmt += policy.price + policy.fuelCost + policy.tax;
          }
        }
      } else {
        ticketAmt = null;
      }

      return ticketAmt;
    },
    isSupportChild: function () {
      var items = flightDetailsStore.getAttr('items'); //航班详情store
      var policy = items[0].policy;
      return policy.isApplyChild || policy.childPolicy;
    },
    isSupportBaby: function () {
      var items = flightDetailsStore.getAttr('items'); //航班详情store
      var policy = items[0].policy;
      return policy.isApplyChild || (policy.childPolicy && policy.childPolicy.isApply) || policy.babyPolicy;
    },
    hasChildTicket: function () {
      var items = flightDetailsStore.getAttr('items'); //航班详情store
      var policy = items[0].policy;
      return !!policy.childPolicy;
    },
    hasBabyTicket: function () {
      var items = flightDetailsStore.getAttr('items'); //航班详情store
      var policy = items[0].policy;
      return !!policy.babyPolicy;
    },
    babyCanBuyChildTicket: function () {
      var items = flightDetailsStore.getAttr('items'); //航班详情store
      var policy = items[0].policy;
      return policy.childPolicy && policy.childPolicy.isApply;
    },
    idCardsDict: function () {
      return [ //用于证件选择
        {
          type: 1,
          name: '身份证'
        }, {
          type: 2,
          name: '护照'
        }, {
          type: 8,
          name: '台胞证'
        }, {
          type: 7,
          name: '回乡证'
        }, {
          type: 4,
          name: '军人证'
        }, {
          type: 10,
          name: '港澳通行证'
        },
        {
          type: 25,
          name: '户口簿'
        },
        {
          type: 27,
          name: '出生证明'
        },
        {
          type: 99,
          name: '其它'
        }
      ];
    },
    childBabyBuyTicketDesc: {
      'title': '儿童婴儿购票说明',
      'lines': [
        '<p>1.航班起飞当日出生未满14天的婴儿，请至航空公司柜台申请购买机票</p>',
        '<p>2.婴儿/儿童年龄区分：婴儿：14天-2周岁；儿童：2-12周岁（按航班起飞当日的实际年龄区分）</p>',
        '<p>3.婴儿票价格：航线标准价的10%，不收机建费及燃油费。（注：婴儿票无座。如需座位，可选择购买儿童票或成人票）</p>',
        '<p>4.儿童票价格：航线标准价的50%，不收机建费，燃油费为成人的50%</p>',
        '<p>5.儿童、婴儿须由成人陪同登机。儿童如单独乘机，需直接至航空公司柜台申请购买机票</p>',
        '<p>6.儿童婴儿购票可用证件：身份证、护照、户口簿、出生证明等</p>',
        '<p>7.儿童婴儿购票可同时购买1份航意险</p>',
        '<p>8. 部分成人价格允许儿童婴儿购买，根据航空公司公布的成人价格政策确定儿童婴儿是否允许购买成人票。</p>',
      ]
    }
  };

  return DataControl;
});

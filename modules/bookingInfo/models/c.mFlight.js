define(['cBase', 'FlightStore', 'mapping', 'cAjax','BusinessModel'], 
function( cBase, FlightStore, Mapping, cAjax, BusinessModel){
  var F = {};

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

      function findItemByKey(items, value, key) {
        var result = {};
        $(items).each(function (index, item) {
          if (value == item[key]) {
            result = item;
            return false;
          }
        });

        return result;
      }

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

"use strict";

define('vInsurance',[
    'c', 'vSupperChild',
    'libs',
    buildViewTemplatesPath('../modules/bookingInfo/templates/tInsurance.html')
],
function (
    c,vSupperChild,
    libs,
    tempHtml
    ) {
    
    var Insurance = new c.base.Class( vSupperChild, {
        _setBoxes_: function () {
            this.insureInfoBox = this.viewPort.find('#insure'); 
        },
        _setTemplate_: function () {
            this.viewPort.append(tempHtml);
            this.insureBoxtplfun = _.template(this.viewPort.find("#insure_tpl").html());
        },
        _listeningMessages_: function(){
            this.parentView.on(this.parentView.EVENTS.INSURANCERENDER, this.render.bind(this));
        },
        render: function (data,bol) {
            var flightOrderData = this.stores.flightOrderStore.get();
            flightOrderData = flightOrderData ? flightOrderData : {};
            if (bol) {
                this.setHtml(data, false);
            } else {
                var selInsure = typeof flightOrderData.selInsure == "undefined" ? 1 : flightOrderData.selInsure && +flightOrderData.selInsure > -1 ? flightOrderData.selInsure : 0;
                data["selInsure"] = selInsure;
                this.setHtml(data, true);
            }
        },
        setInsuranceIntoFlightOrderStore: function (bxQty) {
            var flightOrderData = this.stores.flightOrderStore.get();
            var flightDetailsData = this.stores.flightDetailsStore.get();
            var insurance = {};
            if (  flightOrderData.selInsure && +flightOrderData.selInsure > 0 ) {
                var bx = flightDetailsData.insurances[0];
                insurance.type = bx.type;
                insurance.typeId = bx.typeId;
                insurance.productId = bx.productId;
                insurance.cInsurances = bxQty;  
                insurance.price = bx.price;
            }
            this.stores.flightOrderStore.setAttr('insurance', insurance);
        },
        getSels: function () {
            var sels = 0;
            if (this.viewPort.find('#insure_must').length > 0) {
               sels = $('#insure_must') && $('#insure_must').attr('data-selInsure') ? +$('#insure_must').attr('data-selInsure') : 0;
            }
            return sels;
        },
        getBxQty: function () {
            var bxQty = 0;
            if (this.viewPort.find('#insure_detail em i').length > 0) {
                bxQty = this.viewPort.find('#insure_detail em i').html();
            }
            return bxQty;
        },
        viewInsure: function (url) {
            var flightDetailsData = this.stores.flightDetailsStore.get();
            if (!flightDetailsData) {
                this.parentView.showAlert();
                return;
            }
            if (flightDetailsData.insurances[0].url) {
                this.parentView.jump(flightDetailsData.insurances[0].url);
            } else {
                this.parentView.forward(url);
            }
        },
        hideBox: function () {
            this.insureInfoBox.hide();
        },
        showBox:function () {
            this.insureInfoBox.show();
         },
        setHtml: function (data,bol) {
            var self = this;
            if (data) {
                var strHtml = this.insureBoxtplfun(data);
                this.insureInfoBox.html(strHtml);
                //this.insureInfoBox.find(".flight-labq").bind("click", $.proxy(self.showReadMe, self));

               if (bol){ 
                 if (data.insurances && data.insurances.length) {
                    $("#insuranceLink > a").attr('href', data.insurances[0].url);
                 }
               }
            }
        } 
    });

    
    return Insurance;
});
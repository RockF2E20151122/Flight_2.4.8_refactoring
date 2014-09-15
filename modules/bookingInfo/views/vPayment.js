"use strict";

define('vPayment',['vSupperChild','libs', 'c', 'cUI', 'flight/utility/utility'],
function(vSupperChild, libs, c, cUI, Utility ) {

    var cbase = c.base;

    var Payment = new c.base.Class( vSupperChild, {
        //格式化PATA提醒消息
        i_formatPataMessage : function(chapri, oldprice, triptype) {
            var message = "";
            if (chapri - oldprice > 50) {//上调大于50提醒，如果小于50不提醒
                message += triptype + "机票价格上调为：&yen;" + chapri + "</br>";
            } else if (chapri - oldprice < 0) {//下调提醒
                message += triptype + "机票价格下调为：&yen;" + chapri + "</br>";
            }
            return message;
        },
       
        // 计算订单总价方法，统一调用此方法
        i_accountTotalPrice: function () {
            var totalprice = 0,
                policy = null,
                ticketType = 1,
                passengers = this.stores.passengerQueryStore.getAttr('passengers') || [],
                pcount = this.stores.passengerQueryStore.getAttr('validSelCount'),
                detailData = this.stores.flightDetailsStore.get(),
                flightOrderStore = this.stores.flightOrderStore,
                packageSelectStore = this.stores.packageSelectStore,
                flightDeliveryData = this.stores.flightDeliveryStore.get(this.parentView.UserID) || { type: 1 }; //默认不需要配送
            

            var validSelCount = _.filter(passengers, function (p) {
                return p.selected == 1 && p.ticketType != -1;
            }).length;
            this.stores.passengerQueryStore.setAttr('validSelCount', validSelCount);
            pcount = this.stores.passengerQueryStore.getAttr('validSelCount');

            if (!detailData || !detailData.items || !detailData.items.length) { // Store 过期
                this.parentView.showAlert();
                return 0;
            }

            //机票价格
            for (var i = 0; i < detailData.items.length; i++) {
                var item = detailData.items[i];
                
                for (var j = 0, length = passengers.length; j < length; j++) {
                    ticketType = typeof passengers[j].ticketType != 'undefined' ? passengers[j].ticketType : 1;
                    policy = DataControl.getTicketPolicy(ticketType, i);

                    if (+passengers[j].selected == 1) {
                        //totalprice += policy.price + policy.fuelCost + policy.tax;
                        totalprice = Utility.add(totalprice, policy.price, policy.fuelCost, policy.tax);
                    }
                }
            }

            //保险
            if (+flightOrderStore.getAttr('selInsure') && !detailData.ispackage && detailData.insurances && detailData.insurances.length) { //open
                //totalprice += pcount * detailData.insurances[0].min * detailData.insurances[0].price; //保险价格=人数*最少购买保险数*保险价格
                totalprice = Utility.add(totalprice, Utility.mul(pcount, detailData.insurances[0].min, detailData.insurances[0].price));
            };

            //套餐二选一价格
            if (detailData.ispackage && detailData.pkglist && detailData.pkglist.length) {
                //totalprice += this.getInsureOrLipingTotalPrice(pcount);
                totalprice = Utility.add(totalprice, this.getInsureOrLipingTotalPrice(pcount));
            }

            //配递费
            if (flightDeliveryData.type == 32) { // 快递
                var paytype = this.stores.flightDeliveryStore.getAttr('paytype');
                var fee = flightDeliveryData.deliveryInfo.fee || flightDeliveryData.deliveryInfo.sendFee;
                if (paytype == 2 || paytype == 0) { // 2: 10元礼品卡, 0: 10元无礼品卡
                    //totalprice += fee;
                    totalprice = Utility.add(totalprice, fee);
                }
            }

            return totalprice;
        },
        //计算套餐或者礼品卡的总价
        getInsureOrLipingTotalPrice: function (pcount) {
            var data = this.stores.flightDetailsStore.get();
            var pkgtype = this.stores.packageSelectStore.get(this.parentView.uid).pkgtype;
            var passengerinfo = this.stores.passengerQueryStore.get();

            //旅行套餐二选一渲染,隐藏原先的保险模板
            if (data.ispackage && data.pkglist.length) {
                var pkgs = data.pkglist.filter(function (pkg, index) {
                    return pkg.basicinfo.pkgtype == pkgtype;
                });

                if (pkgs.length) {
                    var mins = pkgs[0].packageinfo.psgs.filter(function (psg, idex) {
                        return psg.psgtype == 1;
                    });

                    pkgs[0].count = (mins.length ? +mins[0].min : 1) * pcount;
                    return Utility.mul(pkgs[0].count, +pkgs[0].price);
                }
            } else {
                return 0;
            }
        }
    });

    return Payment;
});

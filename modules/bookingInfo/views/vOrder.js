define('vOrder', ['vSupperChild'], 
function(vSupperChild) {
    var c = require('c');
    var Futility = require('flight/utility/utility');
    var Order = new c.base.Class( vSupperChild, {
        i_setFlightOrderStore : function() {
            var me = this;
            var rebateAmt = 0;
            var contact;
            var flightOrderStore = me.stores.flightOrderStore;
            var flightOrderData = flightOrderStore.get() || {};
            var userInfo = me.stores.userStore.getUser();
            var amt = me.viewPort.find("#paybtn em.fs").data('amt');

            if (flightOrderData.selCoupons && +flightOrderData.selCoupons > 0) {
                rebateAmt = $('#coupons_switch').attr('data-rbt');
                flightOrderStore.setAttr('IsNeedFan', 1);
            }
            //联系人信息
            contact = flightOrderData.contact ? flightOrderData.contact : {};
            contact.mphone = $('#linkTel').val().trim();
            flightOrderStore.setAttr('contact', contact);

            //订单信息
            var order = flightOrderData.order ? flightOrderData.order : {};
            if (userInfo && userInfo.Auth) {
                flightOrderStore.setAttr('auth', userInfo.Auth);
                flightOrderStore.setAttr('IsNonUser', userInfo.IsNonUser);
                flightOrderStore.setAttr('ugrade', userInfo.VipGrade);
            } else {
                flightOrderStore.setAttr('auth', '');
                flightOrderStore.setAttr('IsNonUser', true);
                flightOrderStore.setAttr('ugrade', 0);
                flightOrderStore.setAttr('RebateAmount', 0);
                flightOrderStore.setAttr('IsNeedFan', 0);
                rebateAmt = 0;
            }

            var snno = me.parentView.getQuery('snno');
            //渠道过来，带上营销参数
            flightOrderStore.setAttr('preBookExt', snno);
            flightOrderStore.setAttr('AllianceID', '');
            flightOrderStore.setAttr('SID', '');
            flightOrderStore.setAttr('OUID', '');
            order.oid = '';
            order.price = amt;
            order.payType = 1;
            order.issue = true;
            order.rebateAmt = rebateAmt;
            order.flag = me.stores.flightDetailsStore.get().flag;
            //XXX
            var flightDeliveryData = me.stores.flightDeliveryStore.get(me.parentView.UserID) || {
                type : 1
            };
            //默认不需要配送
            order.deliveryType = flightDeliveryData.type;
            flightOrderStore.setAttr('order', order);
            return {
                contact : contact,
                order : order
            };
        },
        i_verifications : function() {
            var me = this, parent = me.parentView;
            var bBool = null;
            var flightDetailsData = me.stores.flightDetailsStore.get(), selFlightInfoData = me.stores.selFlightInfoStore.get(), flightSearchData = me.stores.flightSearchStore.get();
            //不符合条件提示
            //1. long time not be used。
            if (!flightDetailsData || !flightDetailsData.items || !selFlightInfoData || !selFlightInfoData.depart || !flightSearchData || !flightSearchData.items) {
                parent.hideLoading();
                //非渲染
                parent.showAlert('对不起，由于您长时间未操作，订单已失效，请重新查询预订！');
                me.stores.mdStore.increaseCntByKey('NextStepNotPassClick');
                //埋点NextStepNotPassClick
                bBool = true;
            }
            //2. already sold out.
            var target = parent.$el.find("#paybtn em.fs");

            var amt = target.data('amt');
            if (!amt || +amt <= 0) {
                parent.showAlert('抱歉，您选择的价格舱位已售完，请重新查询选择其它价格舱位预订。', false);
                me.store.mdStore.increaseCntByKey('NextStepNotPassClick');
                //埋点NextStepNotPassClick
                bBool = true;
            }

            //3. 验证是否填写联系人
            if (!Futility.i_checkMobileNumber()) {
                bBool = true;
            }
            var passengerInfo = me.stores.passengerQueryStore.get();
            var psgInfo = parent.i_savePassengers();
            // 保存乘机人至后台

            var passengers = psgInfo.passengers;
            pcount = psgInfo.pcount;
            var cnameList = _.compact(_.pluck(passengers, 'name'));
            var cnameFilter = Futility.isRepeatName(cnameList);
            /*5. 重复姓名判断  */
            if (cnameFilter) {
                me.showAlert('两名乘机人姓名相同：' + cnameFilter + '，请分2张订单提交', false);
                bBool = true;
            }
            return {
                bBool : bBool,
                passengers : passengers,
                adultTicketCnt : psgInfo.adultTicketCnt
            };
        },
        fnCheckRepeatOrder : function() {
            var RepeatOrderCheckModel = this.models.RepeatOrderCheckModel;
            var repeatOrderCheckStore = this.stores.repeatOrderCheckStore;
            var _this = this;

            RepeatOrderCheckModel.getDataWithSync(function(data) {
                var msg, repeatOrder, temp;
                if (data.rc) {//有重复
                    msg = data.rmsg;
                    temp = msg.split(",");
                    //提取重复order id
                    repeatOrder = temp.length && temp.map(function(item, index) {
                        var result = item.match(/\d/g);
                        if (result && result.length) {
                            return result.join("");
                        }
                    }).filter(function(item) {
                        return item;
                    });

                    repeatOrderCheckStore.set({
                        msg : msg,
                        repeatOrder : repeatOrder
                    }, _this.parentView.UserID);
                    _this.parentView.isRepeatOrder = false;
                    _this.parentView.i_RepeatOrderAlert(repeatOrder);
                } else {
                    _this.parentView.isRepeatOrder = true;
                }
            }, function(e) {
                _this.parentView.hideLoading();
                //TODO;
                _this.parentView.isRepeatOrder = true;
                if (e && e.msg) {
                    _this.parentView.showToast(e.msg, 2, function() {
                    });
                } else {
                    _this.parentView.showToast('数据加载失败', 2, function() {
                    });
                }
            }, true);
        },
        i_checkTicketAmount : function(passengers) {
            var mdStore = this.stores.mdStore, flightDetailsStore = this.stores.flightDetailsStore;
            var flightDetailsData = flightDetailsStore.get();

            var minQty = flightDetailsData.items[0].policy.qty;

            if (flightDetailsData.items.length > 1) {
                if ((+minQty) > (+flightDetailsData.items[1].policy.qty)) {
                    minQty = flightDetailsData.items[1].policy.qty;
                }
            }

            if (+minQty <= 0) {
                this.parentView.showAlert('抱歉，您选择的价格舱位已售完，请重新查询选择其它价格舱位预订。', false);
                //TODO;
                mdStore.increaseCntByKey('NextStepNotPassClick');
                //埋点NextStepNotPassClick
                return true;
            }

            if ((+minQty) < passengers.length) {
                this.parentView.showAlert('很抱歉，机票数量有限，最多只能添加' + minQty + '名乘机人', false);
                //TODO;
                mdStore.increaseCntByKey('NextStepNotPassClick');
                //埋点NextStepNotPassClick
                return true;
            }
        },
        i_setFlightOrderStoreAsParam : function(flightDetailsData, passengers, order) {
            var me = this, parent = me.parentView;
            var flightOrderStore = me.stores.flightOrderStore;
            var flightOrderData = flightOrderStore.get() || {};
            //保险信息
            //update by rhhu
            var bxQty = parent.i_getBxQty();
            var sels = parent.i_getSels();
            var _s = +flightOrderData.selInsure > 0 ? +flightOrderData.selInsure : sels;
            var isSelBX = +_s > 0;
            var insurance = {};
            if (isSelBX && flightDetailsData.insurances && flightDetailsData.insurances.length > 0 && bxQty && +bxQty > 0) {
                // update by rhhu (insurance & set store)
                parent.i_setInsuranceIntoFlightOrderStore(bxQty);
                //航班信息
                var flightInfos = [];
                var item1;
                var tripType = 1;
                var selFlightInfoData = me.stores.selFlightInfoStore.get();
                var item00 = flightDetailsData.items[0];
                item1 = {
                    "no" : item00.basicInfo.flightNo, //去程航班号
                    "class" : item00.policy.class, //去程舱位 - 大舱位;0:Y(经济舱);2:C(商务舱);3:F(头等舱)
                    "subclass" : item00.policy.subclass, //子舱位
                    "dCtyCode" : item00.basicInfo.dCtyCode, //出发城市三字码
                    "dCtyId" : item00.basicInfo.dCtyId, //出发城市编号
                    "aCtyCode" : item00.basicInfo.aCtyCode, //到达城市三字码
                    "aCtyId" : item00.basicInfo.aCtyId, //到达城市编号
                    "dPortCode" : item00.basicInfo.dPortCode,
                    "aPortCode" : item00.basicInfo.aPortCode,
                    "dDate" : item00.basicInfo.dTime, //出发时间
                    "aDate" : item00.basicInfo.aTime,
                    "ext" : item00.ext,
                    "price" : item00.policy.price, //去程航班舱位价格
                    "productType" : item00.policy.productType //产品类型
                };
                flightInfos.push(item1);
                //如果包含返程，则添加返程查询条件
                var flightSearchData = me.stores.flightSearchStore.get();
                if (selFlightInfoData.arrive && flightDetailsData.items.length > 1 && selFlightInfoData.arrive.cabin && flightSearchData.tripType && (+flightSearchData.tripType) > 1) {
                    tripType = 2;
                    var item01 = flightDetailsData.items[1];
                    var item2 = {
                        "no" : item01.basicInfo.flightNo, //去程航班号
                        "class" : item01.policy.class, //去程舱位 - 大舱位;0:Y(经济舱);2:C(商务舱);3:F(头等舱)
                        "subclass" : item01.policy.subclass, //子舱位
                        "dCtyCode" : item01.basicInfo.dCtyCode, //出发城市三字码
                        "dCtyId" : item01.basicInfo.dCtyId, //出发城市编号
                        "aCtyCode" : item01.basicInfo.aCtyCode, //到达城市三字码
                        "aCtyId" : item01.basicInfo.aCtyId, //到达城市编号
                        "dPortCode" : item01.basicInfo.dPortCode,
                        "aPortCode" : item01.basicInfo.aPortCode,
                        "dDate" : item01.basicInfo.dTime, //出发时间
                        "aDate" : item01.basicInfo.aTime,
                        "ext" : item01.ext,
                        "price" : item01.policy.price, //去程航班舱位价格
                        "productType" : item01.policy.productType //产品类型
                    };
                    flightInfos.push(item2);
                }
                flightOrderStore.setAttr('flightInfos', flightInfos);
                flightOrderStore.setAttr('tripType', tripType);
                flightOrderStore.setAttr('passengers', passengers);
                var passengersinfo = flightOrderStore.getAttr("passengersinfo") || [];
                flightOrderStore.setAttr('passengersinfo', passengersinfo);

                if (+order.deliveryType != 1) {//配送信息
                    var postAddressData = +order.deliveryType == 2 ? me.stores.postAddressStorage.get() : +order.deliveryType == 16 ? me.stores.airportDeliveryStore.get() : null;
                    var delivery = {};
                    delivery.ticketIssueCty = flightDetailsData.items[0].basicInfo.dCtyCode;
                    //出发城市三字码
                    delivery.date = item1.dDate;
                    if (postAddressData) {
                        if (+order.deliveryType == 2) {
                            //邮寄
                            delivery.dstr = postAddressData.dstrId;
                            delivery.addrId = postAddressData.inforId;
                            delivery.addr = postAddressData.addr;
                            delivery.fee = postAddressData.sndFee && +postAddressData.sndFee > 0 ? (+postAddressData.sndFee) : 0;
                            delivery.bspet = {
                                recipient : postAddressData.recipient,
                                prvn : postAddressData.prvnName,
                                cty : postAddressData.ctyName,
                                dstr : postAddressData.dstrName,
                                zip : postAddressData.zip
                            };
                        }

                        if (+order.deliveryType == 16) {
                            //机场自取
                            delivery.site = postAddressData.site;
                            //柜台所属票点
                            var f = new Date(postAddressData.time);
                            var nDate = c.base.Date.format(f, 'Y-m-d  H:i:s');
                            delivery.date = nDate;
                            //最早送 / 取票时间
                            delivery.port = postAddressData.port;
                            //取票机场三字码,机场自取时必须
                            delivery.fee = postAddressData.fee && +postAddressData.fee > 0 ? (+postAddressData.fee) : 0;
                            delivery.dstr = postAddressData.dstr;
                            delivery.addrId = postAddressData.id;
                            delivery.addr = postAddressData.name;
                        }

                        if (+order.deliveryType == 32) {
                            // 快递
                            delivery.fee = postAddressData.fee && +postAddressData.fee > 0 ? (+postAddressData.fee) : 0;
                            delivery.dstr = postAddressData.dstr;
                            delivery.addrId = postAddressData.id;
                            delivery.addr = postAddressData.name;
                            delivery.bspet = {
                                recipient : postAddressData.recipient,
                                prvn : postAddressData.prvnName,
                                cty : postAddressData.ctyName,
                                dstr : postAddressData.dstrName,
                                zip : postAddressData.zip
                            };
                        }
                    }
                    flightOrderStore.setAttr('delivery', delivery);
                } else {
                    flightOrderStore.removeAttr('delivery');
                }
            } else {
                flightOrderStore.removeAttr('delivery');
            }

            var _sales = me.stores.salesStore.get();

            if (_sales && _sales.sid) {//XXX
                flightOrderStore.setAttr('sourceId', _sales.sid);
            } else {
                flightOrderStore.setAttr('sourceId', '');
            }

            var unionData = me.stores.unionStore.get();
            if (unionData && unionData.AllianceID && unionData.SID) {
                flightOrderStore.setAttr('AllianceID', unionData.AllianceID);
                flightOrderStore.setAttr('OUID', unionData.OUID);
                flightOrderStore.setAttr('SID', unionData.SID);
            }

            me.models.flightOrderSumbitModel.setParamStore(flightOrderStore);
        }
    });

    return Order;
}); 
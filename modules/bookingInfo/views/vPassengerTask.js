

define('vPassengerTask',['c'], function(c) {
    
    var Futility = require('flight/utility/utility');
    
    /**
     * interface Class 
     */
    return {
        onInputLogPass: function (Futility) {
            var me = this;
            this.parentView.$el.find('.js_firstName').on('focusout', function () {
                var iforId = $(this).parents("li[data-Id]").attr("data-Id");
                var ename = '';

                //获取正在编辑的登机人信息
                $(this).val($(this).val().toUpperCase());
                DataControl.PassEditData = me.getPassengerById(iforId, me.stores.passengerQueryStore);
                DataControl.PassEditData.firstName = $(this).val();
                me.stores.passengerEditStore.setAttr("firstName", DataControl.PassEditData.firstName);
                ename = (DataControl.PassEditData.firstName || DataControl.PassEditData.lastName) ? (DataControl.PassEditData.firstName || '') + '/' + (DataControl.PassEditData.lastName || '') : '';
                DataControl.PassEditData.ename = ename;
                me.stores.passengerEditStore.setAttr("ename", ename);
                //重新赋值到store中，保证信息是实时的
                me.setPassengerById(me.stores.passengerQueryStore, iforId, DataControl.PassEditData);
                
                // 校验
                var valid = Futility.validateFirstName(me.parentView.showErrorTips, DataControl.PassEditData.firstName, true, iforId);
                if (valid) {
                    me.parentView.hideErrorTips('li[data-Id="' + iforId + '"] .js_firstName');
                }
            });

            this.parentView.$el.find('.js_lastName').on('focusout', function () {
                var iforId = $(this).parents("li[data-Id]").attr("data-Id");
                var ename = '';
                $(this).val($(this).val().toUpperCase());
                //获取正在编辑的登机人信息
                DataControl.PassEditData = me.getPassengerById(iforId, me.stores.passengerQueryStore);
                DataControl.PassEditData.lastName = $(this).val();
                ename = (DataControl.PassEditData.firstName || DataControl.PassEditData.lastName) ? (DataControl.PassEditData.firstName || '') + '/' + (DataControl.PassEditData.lastName || '') : '';
                DataControl.PassEditData.ename = ename;
                me.stores.passengerEditStore.setAttr("ename", ename);
                me.stores.passengerEditStore.setAttr("lastName", DataControl.PassEditData.lastName);

                //重新赋值到store中，保证信息是实时的
                me.setPassengerById(me.stores.passengerQueryStore, iforId, DataControl.PassEditData);

                var valid = Futility.validateLastName(me.parentView.showErrorTips, DataControl.PassEditData.firstName, DataControl.PassEditData.lastName, iforId);
                if (valid) {
                    me.parentView.hideErrorTips('li[data-Id="' + iforId + '"] .js_lastName');
                }
            });
            
            this.parentView.$el.find('input.js_newName,input.js_firstName,input.js_lastName,input.js_no,input.js_birth').unbind('focusin').bind('focusin', this.setCurrentEditPsg.bind(this));

            c.ui.InputClear(this.parentView.$el.find('#addPassenger input[type="text"],#addPassenger input[type="tel"],#addPassenger input[type="number"]'), null, null, {
                top: 20, right: 0
            }, true);
            c.ui.InputClear(this.parentView.$el.find('#addPassenger input.js_firstName,#addPassenger input.js_newName'), null, null, {
                top: 20, right: 85
            }, true);
        },
        
        //设置store中登机人信息
        setPassengerById: function (passengerQueryStore, inforId, passenger) {
            var passengerInfo = passengerQueryStore.get();
            if (passengerInfo && passengerInfo.passengers.length) {
                for (var i in passengerInfo.passengers) {
                    if (passengerInfo.passengers[i].inforId == inforId) {
                        passengerInfo.passengers[i] = passenger;
                        break;
                    }
                }
            }
            passengerQueryStore.setAttr('passengers', passengerInfo.passengers);
        },
        /*获取当前正在编辑的登机人信息*/
        getPassengerById: function (inforId, passengerQueryStore) {
            var result = null;
            var passengerInfo = passengerQueryStore.get();
            if (passengerInfo && passengerInfo.passengers.length) {
                for (var i in passengerInfo.passengers) {
                    if (passengerInfo.passengers[i].inforId == inforId) {
                        result = passengerInfo.passengers[i];
                        break;
                    }
                }
            };
            return result || {};
        },
        //初始化登机人编辑模板
        addPassengerTpl: function (passengerEditStore, passengerQueryStore, isNew, isAddAction) {        //passenger
            var _this = this;
            this.needDelIcon = isAddAction ? true : false;
            if (!passengerEditStore.get() || isNew) {
                passengerEditStore.set({
                    "opr": 1,
                    "flightType": 1,
                    "birth": "",
                    "biztype": 4,
                    "cname": "",
                    "email": "",
                    "ename": "",
                    'firstName': '',
                    'lastName': '',
                    "flag": 0,
                    "gender": 2,
                    "idcards": [{
                        "opr": 1,
                        "flag": 2,
                        "no": "",
                        "expiryDate": "2099/1/1",
                        "type": 1,
                        "choose": true
                    }],
                    "inforId": 0,
                    "mphone": "",
                    "fmphone": "",
                    "natl": "CN",
                    "natlName": "中国大陆",
                    "ver": 1,
                    "defaIdCard": {
                        "opr": 1,
                        "flag": 2,
                        "no": "",
                        "expiryDate": "2099/1/1",
                        "type": 1,
                        "name": "身份证"
                    },
                    'ticketType': 1,
                    'selected': 1,
                    'edit': true,
                    'empty': true,
                    'language': 'CN' // 姓名标记，'CN':中文 'EN': 英文
                });
            }
            DataControl.loadPassEditStore();

            var passengerInfo = passengerQueryStore.get() || {};
            passengerInfo.passengers = passengerInfo.passengers || [];
            var gInforId = Math.abs((this.parentView.getServerDate()).getTime()) + Math.round(Math.random() * 1e8);            // getServerDate should in the utils
            DataControl.PassEditData.inforId = gInforId;
            passengerEditStore.setAttr('inforId', gInforId);
            passengerInfo.passengers.push(DataControl.PassEditData);
            passengerQueryStore.setAttr('passengers', passengerInfo.passengers, passengerQueryStore.getTag());
            passengerQueryStore.setAttr('flightType', '1');
            if (passengerInfo && passengerInfo.passengers) {
                var _pCount = 0;
                for (var i in passengerInfo.passengers) {
                    var p = passengerInfo.passengers[i];
                    if (+p.selected == 1) {
                        _pCount += 1;
                    }
                }
                var tag = passengerQueryStore.getTag();
                passengerQueryStore.setAttr("selCount", _pCount, tag);
            }
            this.onInputLogPass();
        },
        finishBirthAction: function (e) {
            var that = this;
            var iforId = $(e.target).parents("li[data-Id]").attr("data-Id");
            DataControl.PassEditData = that.getPassengerById(iforId, that.stores.passengerQueryStore);
            var previousBirth = DataControl.getBirth(DataControl.PassEditData);
            //DataControl.PassEditData.birth = $.trim($(this).val());
            DataControl.PassEditData.birth = $(e.target).data('key') + '';
            that.stores.passengerEditStore.setAttr("birth", DataControl.PassEditData.birth);
            //重新赋值到store中，保证信息是实时的
            that.setPassengerById(that.stores.passengerQueryStore, iforId, DataControl.PassEditData);
            //实时校验
            var result = Futility.checkPassenger(that.parentView, that.parentView.showErrorTips, DataControl.PassEditData, 'birth', iforId, true);
            var tag = "#addPassenger li[data-Id='" + iforId + "'] .js_birth";
            if (result) {
                // Add logic about wheather the passenger is child (zy)
                that.toggleTicketType(DataControl.PassEditData.birth, tag, previousBirth, Futility);
                DataControl.PassEditData = that.getPassengerById(iforId, that.stores.passengerQueryStore);

                var age = DataControl.getAge(DataControl.PassEditData.birth);
                var psgType = DataControl.getPsgType(age);
                var childOrBabyText = (psgType == 2 ? '儿童' : '婴儿');

                if (DataControl.PassEditData.ticketType != -1) { // 不可购买儿童婴儿票提示信息
                    that.parentView.hideErrorTips('li[data-Id="' + iforId + '"] .js_birth');

                    if (psgType != 1) {
                        var policy = that.stores.flightDetailsStore.getAttr('items')[0].policy;
                        var adultTicketDis = !policy.isApplyChild;
                        var childTicketDis = !policy.childPolicy;
                        var babyTicketDis = !policy.babyPolicy;
                        var msg = '';

                        if (adultTicketDis || (psgType == 2 && childTicketDis) || (psgType == 3 && babyTicketDis)) {
                            msg = adultTicketDis ? '该价格不支持' + childOrBabyText + '购买成人票' : '该价格不支持购买' + childOrBabyText + '票';
                            Futility.showTip(DataControl.TIPICONS.BLUE, 'li[data-id="' + iforId + '"] .js_birth', msg, false);
                        } else {
                            that.parentView.hideErrorTips('li[data-Id="' + iforId + '"] .js_birth');
                        }
                    }
                } else {
                    Futility.showTip(DataControl.TIPICONS.RED, 'li[data-id="' + iforId + '"] .js_birth', '该价格' + childOrBabyText + '不可订，请选择其他舱位', false);
                }
            }
        },
        // 显示或隐藏票种选择区域 zy
        toggleTicketType: function (birth, tag, previousBirth, Futility) { //passenger
            var PSGTYPE = { ADULT: 1, CHILD: 2, BABY: 3, NEWBORN: 4 },
                age = DataControl.getAge(birth),
                prePsgType = 1,
                psgType = DataControl.getPsgType(age),
                babyTicket = null,
                items = this.stores.flightDetailsStore.getAttr('items'),
                policy = items && items.length > 0 ? items[0].policy : this.parentView.showAlert(),
                childCanBuy = DataControl.isSupportChild(),
                babyCanBuy = DataControl.isSupportBaby(),
                passengerInfo = this.stores.passengerQueryStore.get(),
                $targetLi = $(tag).closest('li[data-id]'),
                inforId = $targetLi.data('id'),
                $ticketTypeList = $targetLi.find('.flight-iptetp'),
                psgidx = $ticketTypeList.data('psgidx'),
                $selectedType = $ticketTypeList.find('.flight-iptetp-current'),
                preSelectType = $selectedType.length ? parseInt($selectedType.data('type')) : -1; // -1 未选中任何票，即买不了票（儿童或婴儿）

            previousBirth = Futility.testBirth(this.parentView.showToast, previousBirth) ? previousBirth : null;
            if (previousBirth) { // 之前有填写生日且合法
                prePsgType = DataControl.getPsgType(DataControl.getAge(previousBirth));
            }

            if (prePsgType != psgType || !previousBirth) {
                if (psgType == PSGTYPE.ADULT) {
                    $ticketTypeList.parent().hide();
                    $(".flight-tips-etp2").hide();
                    Futility.hideTip('li[data-id="' + inforId + '"] .js_birth');
                    this.selectTicketType(null, $ticketTypeList.find('span:nth-child(1)')[0]);// 默认选择成人票
                } else {
                    if ((psgType === PSGTYPE.CHILD && !childCanBuy) || (psgType === PSGTYPE.BABY && !babyCanBuy)) {
                        var errorText = '该价格' + psgType === PSGTYPE.CHILD ? '儿童' : '婴儿' + '不可订，请选择其他舱位';

                        Futility.showTip(DataControl.TIPICONS.RED, 'li[data-id="' + inforId + '"] .js_birth', errorText, false);
                        passengerInfo.passengers[psgidx].ticketType = -1;
                        $ticketTypeList.find('span').each(function (index, el) {
                            $(el).removeClass('flight-iptetp-current');
                        });
                        this.stores.passengerQueryStore.setAttr('passengers', passengerInfo.passengers);
                        this.updatePassengerInfoHeader(this.stores.flightDetailsStore, this.stores.userStore, this.stores.passengerQueryStore);
                        this.parentView.trigger(this.parentView.EVENTS.UPDATEORDERPRICE);
                    } else {
                        var showTicketFlags = this.getTicketsVisibleStatus(psgType);
                        this.updateTicketStatus($ticketTypeList, showTicketFlags);

                        var ticketType = this.findLowPriceTicketByPsgType(psgType);
                        if (ticketType != -1) {
                            this.selectTicketType(null, $ticketTypeList.find('span:nth-child(' + ticketType + ')')[0]);// 默认选择成人票
                        }
                    }

                    this.showWithAdultTip(this.stores.passengerQueryStore);
                }
            }
        },
        getTicketsVisibleStatus: function (psgType, ticketType) {
            var ADULT = 1, CHILD = 2, BABY = 3;
            var items = this.stores.flightDetailsStore.getAttr('items');
            var policy = items[0].policy;
            var canBuyAdultTicket = !!policy.isApplyChild;
            var hasChildTicket = !!policy.childPolicy;
            var hasBabyTicket = !!policy.babyPolicy;

            var childCanBuy = hasChildTicket || canBuyAdultTicket;
            var babyBuyChild = !!(policy.childPolicy && policy.childPolicy.isApply);
            var babyCanBuy = hasBabyTicket || babyBuyChild || canBuyAdultTicket;

            var isShowBaby = (psgType == BABY && hasBabyTicket);
            var isShowChild = (psgType == BABY && babyBuyChild) || (psgType == CHILD && hasChildTicket);
            var isShowAdult = canBuyAdultTicket && (isShowBaby || isShowChild);
            var showStatus = [isShowAdult, isShowChild, isShowBaby];

            return typeof ticketType === 'undefined' ? showStatus : showStatus[ticketType - 1];
        },
        updateTicketStatus: function ($ticketTypeList, showTicketFlags) {
            if (showTicketFlags[0] || showTicketFlags[1] || showTicketFlags[2]) {
                $ticketTypeList.parent().show();
            }

            $ticketTypeList.find('span').each(function (i, el) {
                $(el).toggle(showTicketFlags[i]);
            });
        },
        
        hasChildOrBaby: function (passengers) {         //passenger
            var psgType;
            var birth = '';
            var PSGTYPE = { ADULT: 1, CHILD: 2, BABY: 3, NEWBORN: 4 };
            var that = this;
            var hasChild = false;
            $(passengers).each(function (index, item) {
                if (item.selected == 1) {
                    if (item.defaIdCard && item.defaIdCard.type == 1 && item.defaIdCard.no) {
                        birth = Futility.getBirth(item.defaIdCard.no) || '';                        //XXX birth isn't global ?
                    } else {
                        birth = item.birth;
                    }

                    if (birth) {
                        psgType = DataControl.getPsgType(DataControl.getAge(birth));           //XXX psgType is global?
                        if (psgType == PSGTYPE.CHILD || psgType == PSGTYPE.BABY) {
                            hasChild = true;
                        }
                    }
                }
            });
            return hasChild;
        },
        /**
        * @Summary  获得乘机人前面是否需要删除图标
        * @param    passengers 国内所有选中的乘机人
        * @return   bool
        */
        getDelIconFlag: function (passengers) {
            var selPassegners = _.filter(passengers, function (p, index) {
                return p.selected == 1;
            });

            if (selPassegners.length == 1 && selPassegners[0] && selPassegners[0].defaIdCard) {
                if (selPassegners[0].defaIdCard.type == 1) {
                    this.needDelIcon = !(!selPassegners[0].cname && !selPassegners[0].defaIdCard.no);
                } else {
                    this.needDelIcon = !(!selPassegners[0].cname && !selPassegners[0].firstName && !selPassegners[0].lastName && !selPassegners[0].defaIdCard.no && !selPassegners[0].birth);
                }
            }

            return this.needDelIcon;
        },
        /**
        * @Summary  获取常旅失败处理
        * @param    psgersData  渲染乘机人模板数据（引用传递）
        * @param    reqFlags    请求数据的是否完成标志位
        * @return   void
        */
        passengersResponseFailHandler: function (psgersData, reqFlags) {
            // 请求失败处理
            var passengerInfo = this.stores.passengerQueryStore.get();

            this.stores.isBookingEditStore.setAttr('Edit', true, this.parentView.UserID);
            if (passengerInfo && passengerInfo.passengers && passengerInfo.passengers.length) {
                var selCount = _.filter(passengerInfo.passengers, function (p) {
                    return p.selected == 1;
                }).length;
                this.stores.passengerQueryStore.setAttr('selCount', selCount);
            } else {
                this.stores.passengerQueryStore.setAttr('passengers', []);console.log('fuck , line 274');
                this.stores.passengerQueryStore.setAttr('selCount', 0);
                this.addPassengerTpl(this.stores.passengerEditStore, this.stores.passengerQueryStore, true);
            }

            passengerInfo = this.stores.passengerQueryStore.get();
            psgersData = $.extend(psgersData, passengerInfo);
            reqFlags.PASSENGERS = true;

            if (reqFlags.DETAIL) {
                this.setHtmlAddPassenger(psgersData);
                this.showWithAdultTip(this.stores.passengerQueryStore, psgersData.passengers);          //passenger
                DataControl.passegnersTplData = psgersData;
            }
            Futility.showAddBtn(this.stores.passengerQueryStore);
        },
        
        watchIsSpace: function (id) { //监控输入框是否有空                                       //passenger
            var $psgContainer = $("#addPassenger > li[data-id='" + id + "']");
            if ($('#cname-container-' + id).css('display') == 'none') { // 检验英文名
                return !!($psgContainer.find('.js_firstName').val() || $psgContainer.find('.js_lastName').val() || $psgContainer.find('.js_no').val() || $psgContainer.find('.js_birth').val());
            } else { // 检验中文名
                return !!($psgContainer.find('.js_newName').val() || $psgContainer.find('.js_no').val());
            }
        },
        // 删除乘机人确认
        deletePsgConfirm: function (cb, passengerId) {
            var that = this;
            var backAlert = new c.ui.Alert({
                title: '提示信息',
                message: '您确定要删除当前乘机人信息吗？',
                buttons: [{
                    text: '取消',
                    click: function () {
                        this.hide();
                    }
                }, {
                    text: '确定',
                    click: function () {
                        this.hide();
                        that.parentView.showLoading();
                        try {
                            // 删除埋点store里的信息
                            var mdPassengersInfo = that.stores.mdStore.getAttr('passengers');
                            if (mdPassengersInfo && mdPassengersInfo[passengerId]) {
                                delete mdPassengersInfo[passengerId];
                            }
                            that.stores.mdStore.setAttr('passengers', mdPassengersInfo);
                        } catch (e) {
                            console.log('PassengerDelete: 删除相关乘机人的埋点信息异常');
                        }

                        cb && cb();
                    }
                }]
            });
            backAlert.show();
        },
        // 清除乘机人信息
        clearPassengerInfo: function (e, id) {
            var passenger = DataControl.getPsgById(id);
            var $pasgContainer = $(e.currentTarget).closest("li[data-id='" + id + "']");
            var preTicketType = passenger.ticketType;

            if (passenger) {
                passenger.cname = '';
                passenger.firstName = '';
                passenger.lastName = '';
                passenger.birth = '';
                passenger.defaIdCard.no = '';
                passenger.empty = true;
                passenger.ticketType = 1;
                $pasgContainer.find('.flight-iptetp').find('span').each(function (index, li) {
                    $(li).removeClass('flight-iptetp-current');
                    index == 0 ? $(li).addClass('flight-iptetp-current') : '';
                });
                this.setPassengerById(this.stores.passengerQueryStore, id, passenger);
                $pasgContainer.find('.js_newName').val('');
                $pasgContainer.find('.js_firstName').val('');
                $pasgContainer.find('.js_lastName').val('');
                $pasgContainer.find('.js_no').val('');
                $pasgContainer.find('.js_birth').val('');
                $pasgContainer.find('.flight-iptetp').parent().hide();
                $pasgContainer.find('.flight-ipt-etp3').hide();
                $('#flightBox .flight .flight-tips-etp2').hide();
                $pasgContainer.find('.form-tips').hide();
                $pasgContainer.find('.js_del_icon').remove();
                $pasgContainer.addClass('flight-psinfo-fstps');
      
                this.parentView.trigger(this.parentView.EVENTS.UPDATEORDERPRICE);
                this.updatePassengerInfoHeader();
            }
        },
        handleErrorInfo: function (birth) {
            var that = this;
            var age = DataControl.getAge(birth);
            var psgType = DataControl.getPsgType(age);
            var childOrBabyText = (psgType == 2 ? '儿童' : '婴儿');
            var iforId = DataControl.PassEditData.inforId;

            if (DataControl.PassEditData.ticketType == -1) { // 不可购买儿童婴儿票提示信息
                that.parentView.hideErrorTips('li[data-Id="' + iforId + '"] .js_no');

                if (psgType != 1) {
                    Futility.showTip(DataControl.TIPICONS.RED, 'li[data-id="' + iforId + '"] .js_birth', '该价格' + childOrBabyText + '不可订，请选择其他舱位', false);
                }
            }
        },
        idCardFocusOutHandler: function (target) {
            var iforId = $(target).closest("li[data-Id]").attr("data-Id");
            var $val = $(target).val().replace(/\s/g, "");
            var isAlert = true;

            DataControl.PassEditData = this.getPassengerById(iforId, this.stores.passengerQueryStore);
            this.parentView.$el.find('#sel_idCard-' + iforId + ' option').eq($(target).data("index")).data("no", $val);
            DataControl.PassEditData.idcards[$(target).data("index")].no = $val;
            DataControl.PassEditData.defaIdCard.no = $val;
            this.stores.passengerEditStore.setAttr("idcards", DataControl.PassEditData.idcards)
            this.stores.passengerEditStore.setAttr("defaIdCard", DataControl.PassEditData.defaIdCard);

            if (DataControl.PassEditData.defaIdCard.type == 1) {
                var $val = $(target).val().replace(/\s/g, "");
                $(target).val(Futility.formatCardNo($val));
            }

            //重新赋值到store中，保证信息是实时的
            this.setPassengerById(this.stores.passengerQueryStore, iforId, DataControl.PassEditData);
            //实时校验
            var result = Futility.checkPassenger(this.parentView, this.parentView.showErrorTips, DataControl.PassEditData, 'defaIdCard', iforId, isAlert);
            var tag = "#addPassenger > li[data-Id='" + iforId + "'] .js_no";

            if (result) {
                // Add logic about wheather the passenger is child(If the card type is idCard) (zy)
                if (DataControl.PassEditData.defaIdCard.type == 1) {
                    this.toggleTicketType(Futility.getBirth($val), tag, null, Futility);

                    // 更新生日
                    DataControl.PassEditData.birth = Futility.getBirth($val);
                    this.stores.passengerEditStore.setAttr("birth", DataControl.PassEditData.birth);
                    //重新赋值到store中，保证信息是实时的
                    this.setPassengerById(this.stores.passengerQueryStore, iforId, DataControl.PassEditData);
                    $("#addPassenger li[data-id='" + iforId + "'] .js_birth").val(DataControl.PassEditData.birth);
                }
            }
        },
        /**
        * @Summary  根据乘机人类型取得相应的最低价的票
        * @param    psgType  乘机人类型 1： 成人， 2： 儿童， 3： 婴儿
        * @return int 票类型 1： 成人票， 2： 儿童票 3： 婴儿票， -1： 买不了票
        */
        findLowPriceTicketByPsgType: function (psgType) {
            var stores = this.parentView.stores;
            var items = stores.flightDetailsStore.getAttr('items');
            var policy = items[0].policy;
            var ADULT = 1, CHILD = 2, BABY = 3;
            var ticketAmt = DataControl.getTicketAmtByType(ADULT);
            var childTicketAmt = DataControl.getTicketAmtByType(CHILD);
            var babyTicketAmt = DataControl.getTicketAmtByType(BABY);

            if (psgType == CHILD) {
                if (policy.childPolicy) {
                    return ticketAmt > childTicketAmt ? CHILD : (policy.isApplyChild ? ADULT : CHILD);
                } else {
                    return policy.isApplyChild ? ADULT : -1;
                }
            } else if (psgType == BABY) {
                if (policy.babyPolicy) {
                    if (policy.isApplyChild) {
                        if (policy.childPolicy && policy.childPolicy.isApply) {
                            return ticketAmt > babyTicketAmt ?
                                    (babyTicketAmt > childTicketAmt ? CHILD : BABY) :
                                    (ticketAmt > childTicketAmt ? CHILD : ADULT);
                        } else {
                            return ticketAmt > babyTicketAmt ? BABY : ADULT;
                        }
                    } else {
                        if (policy.childPolicy && policy.childPolicy.isApply) {
                            return childTicketAmt > babyTicketAmt ? BABY : CHILD;
                        } else {
                            return BABY;
                        }
                    }
                } else {
                    if (policy.isApplyChild) {
                        if (policy.childPolicy && policy.childPolicy.isApply) {
                            return ticketAmt > childTicketAmt ? CHILD : ADULT;
                        } else {
                            return ADULT;
                        }
                    } else {
                        if (policy.childPolicy && policy.childPolicy.isApply) {
                            return CHILD;
                        } else {
                            return -1; // 不支持婴儿票
                        }
                    }
                }
            }

            return ADULT;
        },
        /*===================  验证相关逻辑开始  ==============*/

        /*
        * 点击下一步开始进行乘机人信息的校验
        * 除了已登录且有常旅的情况，其他的都校验
        * */
        beforePayValidate: function () {
            var that = this;
            var stores = this.stores;
            var passengerInfo = stores.passengerQueryStore.get();
            var needValidateInputs = !(stores.userStore.isLogin() && !stores.isBookingEditStore.getAttr('Edit', this.parentView.UserID));
            var allError = [];
            var errorItem = [];
            var tag = "";
            var selcount = 0;
            var psgType = PSGTYPE.ADULT;
            var psgTypeCount = { 1: 0, 2: 0, 3: 0 }; // ADULT, CHILD, BABY
            var flights = stores.flightDetailsStore.getAttr('items') || [];
            var age = 0;
            var isAlert = true;
            var passengers = passengerInfo.passengers || [];

            $.each(passengers, function (index, p) {
                errorItem = [];
                if (+p.selected == 1) {
                    selcount += 1;
                    var result = needValidateInputs ? Futility.checkPassenger(that.parentView, that.parentView.showErrorTips, p, 'cname', p.inforId, isAlert) : true;
                    if (!result) {
                        errorItem.push({
                            className: DataControl.errorType,
                            errorMessage: DataControl.errorMessage
                        });
                    }
                    result = needValidateInputs ? Futility.checkPassenger(that.parentView, that.parentView.showErrorTips, p, 'defaIdCard', p.inforId, isAlert) : true;
                    if (!result) {
                        errorItem.push({
                            className: DataControl.errorType,
                            errorMessage: DataControl.errorMessage
                        });
                    }
                    if (+p.defaIdCard.type != 1) { // 证件类不为身份证
                        result = needValidateInputs ? Futility.checkPassenger(that.parentView, that.parentView.showErrorTips, p, 'defaIdCard', p.inforId, isAlert) : true;
                        if (!result) {
                            errorItem.push({
                                className: DataControl.errorType,
                                errorMessage: DataControl.errorMessage
                            });
                        }

                        result = needValidateInputs ? Futility.checkPassenger(that.parentView, that.parentView.showErrorTips, p, 'birth', p.inforId, isAlert) : true;
                        if (!result) {
                            errorItem.push({
                                className: DataControl.errorType,
                                errorMessage: DataControl.errorMessage
                            });
                        }

                        if (result) {
                            age = DataControl.getAge(p.birth);
                            if (p.defaIdCard.type == 25 && age >= 16) {
                                DataControl.errorType = '.js_birth';
                                DataControl.errorMessage = '年龄已满16周岁，不能使用户口簿';
                                errorItem.push({
                                    className: DataControl.errorType,
                                    errorMessage: DataControl.errorMessage
                                });
                                result = false;
                            }
                            if (p.defaIdCard.type == 27 && age >= 12) {
                                DataControl.errorType = '.js_birth';
                                DataControl.errorMessage = '年龄已满12周岁，不能使用出生证明';
                                errorItem.push({
                                    className: DataControl.errorType,
                                    errorMessage: DataControl.errorMessage
                                });
                                result = false;
                            }

                            if (flights.length > 1 && !that.validateSecondFlyTicketType(p, errorItem)) {
                                result = false;
                            }
                            if (!that.validateAllowChildBuy(p, errorItem)) {
                                result = false;
                            }

                            if (result) {
                                psgType = p.ticketType > 0 ? p.ticketType : 1; //DataControl.getPsgType(DataControl.getAge(p.birth));
                                psgTypeCount[psgType]++;
                            }
                        }
                    } else { // 证件类型为身份证
                        var result = needValidateInputs ? Futility.checkPassenger(that.parentView, that.parentView.showErrorTips, p, 'defaIdCard', p.inforId, isAlert) : true;
                        if (!result) {
                            errorItem.push({
                                className: DataControl.errorType,
                                errorMessage: DataControl.errorMessage
                            });
                        } else {
                            if (flights.length > 1 && !that.validateSecondFlyTicketType(p, errorItem)) {
                                result = false;
                            }
                            if (!that.validateAllowChildBuy(p, errorItem)) {
                                result = false;
                            }

                            if (result) {
                                psgType = p.ticketType > 0 ? p.ticketType : 1; //DataControl.getPsgType(DataControl.getAge(that.getBirth(p.defaIdCard.no)));
                                psgTypeCount[psgType]++;
                            }
                        }
                    }
                }

                if (errorItem.length) {
                    allError.push({
                        errorInforId: p.inforId,
                        errorInfo: errorItem
                    });
                }
            });

            if (allError.length) {
                $.each(allError, function (index, error) {
                    $.each(error.errorInfo, function (i, er) {
                        that.parentView.showErrorTips(er.className, er.errorMessage, error.errorInforId, false);
                    });
                });

                if (!that.stores.userStore.isLogin() || (that.stores.userStore.isLogin() && that.stores.isBookingEditStore.getAttr('Edit', that.parentView.UserID))) {
                    that.parentView.showErrorTips(allError[0].errorInfo[0].className, allError[0].errorInfo[0].errorMessage, allError[0].errorInforId, true);
                } else {
                    Futility.showTip(DataControl.tipIconType || DataControl.TIPICONS.RED, 'li[data-id="' + allError[0].errorInforId  + '"] .flight-listsim3-table', allError[0].errorInfo[0].errorMessage, true);
                }
                
                return false;
            }

            // 1. 乘机人不能为空，如果乘机人人数0，则弹出拦截提示
            if (selcount <= 0) {
                that.parentView.showAlert('请选择乘机人', false);
                return false;
            }

            // 2. 所有航班均不支持儿童票+婴儿票订单，如果订单填写页同时选择了儿童票和婴儿票，则弹出拦截提示
            if (psgTypeCount[PSGTYPE.CHILD] && psgTypeCount[PSGTYPE.BABY]) {
                that.parentView.showAlert('儿童票和婴儿票请分2张订单提交', false);
                return false;
            }

            // 7. 判断婴儿票数量，订单填写页选择的乘机人中，婴儿票数量必须<=成人票的数量，如果婴儿票数量>成人票数量，则弹出拦截提示
            if (psgTypeCount[PSGTYPE.BABY] > psgTypeCount[PSGTYPE.ADULT]) {
                that.parentView.showAlert('一位成人只能带一位婴儿，请继续添加成人乘客', false);
                return false;
            }

            //验证选择的乘机人是否超过9位
            if (selcount > 9) {
                that.parentView.showAlert('最多选择9位乘机人', false);
                that.stores.mdStore.increaseCntByKey('NextStepNotPassClick'); //埋点NextStepNotPassClick
                return;
            }

            return true;
        },
        /**
        * @Summary  验证儿童（或婴儿）第二程起飞日时，年龄是否已为成人（或儿童）
        * @param    p 乘机人实体对象
        * @return   bool
        */
        validateSecondFlyTicketType: function (p, errorItem) {
            var birth = p.defaIdCard.type != 1 ? p.birth : Futility.getBirth(p.defaIdCard.no),
                psgType = DataControl.getPsgType(DataControl.getAge(birth));

            if (psgType !== PSGTYPE.ADULT && (p.ticketType && p.ticketType !== 1)) {
                if (psgType !== DataControl.getPsgType(DataControl.getAge(birth, false))) {
                    if (psgType === PSGTYPE.CHILD && p.ticketType === 2) { //儿童买儿童票，但是第二程起飞是，该儿童已是成人
                        that.parentView.showAlert('【' + (p.cname || p.ename) + '】第二程起飞当日已满12岁，不能购买儿童票。如仍需购买儿童票，两程须分开预订，或可拨打携程客服电话预订400-008-6666。', false);
                        return false;
                    } else if (psgType === PSGTYPE.BABY && p.ticketType === 3) { // 婴儿买婴儿票，但是第二程起飞是，该婴儿已是儿童
                        this.parentView.showAlert('【' + (p.cname || p.ename) + '】第二程起飞当日已满2岁，不能许购买婴儿票。如仍需购买婴儿票，两程须分开预订，或可拨打携程客服电话预订400-008-6666。', false);
                        return false;
                    }
                }
            }

            return true;
        },
        /**
        * @Summary  验证儿童或婴儿是否能够买票
        * @param    p 乘机人实体对象
        * @return   bool
        */
        validateAllowChildBuy: function (p, errorItem) {
            var stores = this.stores;
            var psgType = 1;
            var birth = p.defaIdCard.type != 1 ? p.birth : Futility.getBirth(p.defaIdCard.no);

            if (birth) {
                psgType = DataControl.getPsgType(DataControl.getAge(birth));
            }

            if (psgType === PSGTYPE.CHILD || psgType === PSGTYPE.BABY) {
                var flights = stores.flightDetailsStore.getAttr('items');
                var ticketType = p.ticketType ? p.ticketType : 1;
                var canBuyAdultTicket = flights[0].policy.isApplyChild;
                var canBuyChildTicket = !!flights[0].policy.childPolicy;
                var canBuyBabyTicket = !!flights[0].policy.babyPolicy;
                var invalid = false;

                if (ticketType === 1) {
                    invalid = !canBuyAdultTicket;
                } else if (ticketType === 2) {
                    if (psgType === PSGTYPE.CHILD) {
                        invalid = !canBuyChildTicket;
                    } else {
                        invalid = (!canBuyChildTicket || canBuyChildTicket && !flights[0].policy.childPolicy.isApply);
                    }
                } else if (ticketType === 3) {
                    invalid = psgType === PSGTYPE.CHILD || (psgType === PSGTYPE.BABY && !canBuyBabyTicket);
                } else if (ticketType == -1) {
                    invalid = true;
                }

                if (invalid) {
                    DataControl.errorType = p.defaIdCard.type == 1 ? '.js_no' : '.js_birth';
                    DataControl.errorMessage = '该价格' + (psgType === PSGTYPE.CHILD ? '儿童' : '婴儿') + '不可订，请选择其他舱位';
                    errorItem.push({
                        className: DataControl.errorType,
                        errorMessage: DataControl.errorMessage
                    });
                    return false;
                }
            }

            return true;
        },
        /**
        * 乘机人证件限制验证
        * add wyren@ctrip.com 2014-4-4
        */
        checkSupportCards: function (flightDetailsStore, passengerQueryStore, DataControl) {            //passenger
            var intersection = function (arr1, arr2) {
                var result = [];
                arr1.forEach(function (v1, i, arr) {
                    arr2.forEach(function (v2, i, arr) {
                        if (v1 == v2) {
                            result.push(v2);
                        }
                    });
                });
                return result;
            };
            var flightDetailItems = [],
                passengers = [],
                sprtCidsArrs = [],
                sprtCids = [],    //支持的证件id
                limitCids = ['1', '2', '8', '7', '4', '10', '21', '20', '11', '99'],   //限制的证件id
                sprtCNames = [],  //支持的证件name
                idcDict = DataControl.idCardsDict();

            flightDetailsStore.get() && flightDetailsStore.get().items && (flightDetailItems = flightDetailsStore.get().items);
            passengerQueryStore.get() && passengerQueryStore.get().passengers && (passengers = passengerQueryStore.get().passengers);
            //根据详情store里的items的支持cardid来获取每个item的支持cardid，存入sprtCidsArrs，[[],[]...]
            flightDetailItems.forEach(function (_item, i, arr) {
                //cardTypes为空：没有限制  跳过继续
                if (_item.policy.cardTypes != "") {
                    sprtCidsArrs.push(_item.policy.cardTypes.split(','));
                }
            });
            //取sprtCidsArrs的各个数组元素（支持cardid）的交集，若没有则弹框提示
            if (sprtCidsArrs.length > 0) {
                sprtCids = sprtCidsArrs[0];
                sprtCidsArrs.forEach(function (scArr, i, arr) {
                    sprtCids = intersection(sprtCids, scArr);
                });
                if (sprtCids.length == 0) {
                    this.parentView.showAlert('证件不符合航班需求，请重新选择航班', false);
                    return false;
                } else {
                    //获得支持证件的名称
                    for (var scid_index in sprtCids) {
                        for (var idcD_index in idcDict) {
                            if (idcDict[idcD_index].type.toString() == sprtCids[scid_index]) {
                                sprtCNames.push(idcDict[idcD_index].name);
                            }
                        }
                    }
                    //根据支持的id来修正限制证件的id
                    sprtCids.forEach(function (scid, i, arr) {
                        for (var n = 0; n < limitCids.length; n++) {
                            if (limitCids[n] == scid) {
                                limitCids.splice(n, 1);
                                n--;
                            }
                        }
                    });
                    //乘机人循环验证
                    for (var p_index in passengers) {
                        var p = passengers[p_index];
                        if (+p.selected == 1) {
                            var cardType = p.defaIdCard.type;
                            for (var limit_index in limitCids) {
                                if (cardType == limitCids[limit_index]) {
                                    this.parentView.showAlert('您选择的航班只能使用' + sprtCNames.join(',') + '进行预订，请修改乘机人的证件', false);
                                    return false;
                                }
                            }
                        }
                    }
                    return true;
                }
            } else {  //没有证件限制
                return true;
            }
        },
        /**
        * 最少乘机人限制验证
        * add wyren@ctrip.com 2014-4-7
        */
        checkMinPassenger: function (flightDetailsStore, passengerQueryStore) {//passenger
            var passengers = [],
                flightDetailItems = [],
                min_num = 0,
                passenger_num = 0;

            flightDetailsStore.get() && flightDetailsStore.get().items && (flightDetailItems = flightDetailsStore.get().items);
            passengerQueryStore.get() && passengerQueryStore.get().passengers && (passengers = passengerQueryStore.get().passengers);

            //获取（多次）航班中的最小乘客人数
            if (flightDetailItems.length == 0) {
                this.parentView.showAlert();
                return false;
            }
            min_num = flightDetailItems.reduce(function (x, _items) {
                var mNum = _items.policy.minNum;
                return mNum > x ? mNum : x;
            }, flightDetailItems[0].policy.minNum);

            for (var p_index in passengers) {
                var p = passengers[p_index];
                if (+p.selected == 1) {
                    passenger_num++;
                }
            }
            var amt = this.parentView.$el.find("#paybtn em.fs").data('amt');

            if (passenger_num >= min_num) {
                return true;
            } else {
                this.parentView.showAlert('本航班至少需要选择' + min_num + '位成人票乘客才能下单，您也可以选择其他舱位预订', false);
                return false;
            }
        }
    };
});
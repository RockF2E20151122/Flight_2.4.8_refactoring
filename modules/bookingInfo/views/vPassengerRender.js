"use strict";
//requirejs.config({
//    paths : {
//        mPassenger: 'flight/modules/bookingInfo/models/c.mPassenger',
//        vCorporater1: 'flight/modules/bookingInfo/views/vPassengerCorporater1'
//    }
//});

define('vPassengerRender',[/*'flight/debug/console',*/ 'c', 'libs', 'vSupperChild', 'flight/utility/utility', 'MultipleScrollList',
    buildViewTemplatesPath('../modules/bookingInfo/templates/tPassenger.html') ],
function (/*console, */c, libs, vSupperChild, Futility, MultipleScrollList, tPassenger ) {
    
    var PSGTYPE = { ADULT: 1, CHILD: 2, BABY: 3, NEWBORN: 4 };
    
    var vPassengerRender = new c.base.Class( vSupperChild, {
        EVENTS:{
            hasChildrenOrBaby: 'hasChildrenOrBaby'
        },
        _setBoxes_: function(){
            this.addPassengerBox = this.viewPort.find('#addPassenger');
            this.passengerInfoBox = this.viewPort.find('#passengerInfo');                //乘机人模板容器
            this.passengerInfoHeader = this.viewPort.find("#passenger-info-header");    // 乘机人信息头
        },
        _setTemplate_: function(){
            this.viewPort.append(tPassenger);
            this.passengerInfoHeaderFun = _.template(this.viewPort.find('#passenger-info-header-tpl').html());
            this.addPassengerTplFun = _.template(this.viewPort.find('#addPassenger_tpl').html());              //addPassengerfun
            this.passengerInfofun = _.template(this.viewPort.find('#passengerInfotpl').html());
        },
        _listeningMessages_: function(){
            // 订阅回调事件
            this.parentView.on(this.parentView.EVENTS.DETAILCOMPLETE, this.flightDetailCalback.bind(this));
            this.parentView.on(this.parentView.EVENTS.PASSENGERSCOMPLETE, this.passengersCallback.bind(this));
            this.parentView.on(this.parentView.EVENTS.savePassengers, this.savePassengers.bind(this));
        },
        _init_: function(argus){
            this.needDelIcon = true; // 显示删除icon 
        },
        setHtmlPassengerInfo: function (data) {
            var sHtml = this.passengerInfofun(data);
            this.passengerInfoBox.empty();
            this.passengerInfoBox.html(sHtml);
            this.addPassengerBox.hide();
            this.updatePassengerInfoHeader();
        },
        setHtmlAddPassenger: function (data) {
            data.needDelIcon = this.getDelIconFlag(data.passengers || []);
            data.selCount = this.stores.passengerQueryStore.getAttr('selCount');
            var sHtml = this.addPassengerTplFun(data);
            this.addPassengerBox.empty();
            this.addPassengerBox.html(sHtml);
            this.passengerInfoBox.hide();
            this.updatePassengerInfoHeader();
            //为每个乘机人信息注入监听事件
            this.eventsRegistration();

            // 调整清除'X'位置
            $('li[id|=cname-container]').each(function (i) {
                if ($(this).find('.flight-langswt').length > 0) {
                    if ($(this).find('.flight-langswt').css('display') == 'none') {
                        $(this).find('.cui-focus-close').css('right', '20px');
                    } else {
                        $(this).find('.cui-focus-close').css('right', '85px');
                    }
                }
            });
        },
        eventsRegistration: function(){
            var me = this;
            var isAlert = true;
            this.parentView.$el.find('.js_newName').on('focusout', function () {
                var element = this;
                var fnCallback = function(){
                    var iforId = $(element).parents("li[data-Id]").attr("data-Id");
    
                    //获取正在编辑的登机人信息
                    DataControl.PassEditData = me.getPassengerById(iforId, me.stores.passengerQueryStore);
    
                    DataControl.PassEditData.cname = $(element).val().replace(/\s/g, '');
                    me.stores.passengerEditStore.setAttr("cname", DataControl.PassEditData.cname);
    
                    //重新赋值到store中，保证信息是实时的
                    me.setPassengerById(me.stores.passengerQueryStore, iforId, DataControl.PassEditData);
    
                    // 校验
                    var valid = Futility.validateName(me.parentView, me.parentView.showErrorTips, DataControl.PassEditData.cname, '', '', DataControl.PassEditData.defaIdCard.type, true, iforId);
                    if (valid) {
                        me.parentView.hideErrorTips('li[data-Id="' + iforId + '"] .js_newName');
                    }
                };
                me._loadDependences_( vPassengerRender, ['vPassengerTask'], fnCallback );
            });
            this.parentView.$el.find('.js_no').on('focusout', function () {
                var element = this;
                var fnCallback = function(){
                    var iforId = $(element).parents("li[data-Id]").attr("data-Id");
                    DataControl.PassEditData = me.getPassengerById(iforId, me.stores.passengerQueryStore);
                    var $val = DataControl.PassEditData.defaIdCard.type == 2 ? $.trim($(element).val() || '') : $(element).val().replace(/\s/g, ""); // 护照规则变动导致
    
                    me.parentView.$el.find('#sel_idCard option').eq($(element).data("index")).data("no", $val);
                    DataControl.PassEditData.idcards[$(element).data("index")].no = $val;
                    DataControl.PassEditData.defaIdCard.no = $val;
                    me.stores.passengerEditStore.setAttr("idcards", DataControl.PassEditData.idcards);
                    me.stores.passengerEditStore.setAttr("defaIdCard", DataControl.PassEditData.defaIdCard);
    
                    if (DataControl.PassEditData.defaIdCard.type == 1) {
                        $(element).val(Futility.formatCardNo($val));
                    }
    
                    //重新赋值到store中，保证信息是实时的
                    me.setPassengerById(me.stores.passengerQueryStore, iforId, DataControl.PassEditData);
    
                    //实时校验
                    var result = Futility.checkPassenger(me.parentView, me.parentView.showErrorTips, DataControl.PassEditData, 'defaIdCard', iforId, isAlert);
                    var tag = "#addPassenger li[data-Id='" + iforId + "'] .js_no";
    
                    if (result) {
                        // 如果是身份证则需更新store中的出生日期,并做UI上相应的处理
                        if (DataControl.PassEditData.defaIdCard.type == 1) {
                            
                            me.toggleTicketType(Futility.getBirth($val), tag, null, Futility);
                            DataControl.PassEditData = me.getPassengerById(iforId, me.stores.passengerQueryStore);
                            // 更新生日
                            DataControl.PassEditData.birth = Futility.getBirth($val);
                            me.stores.passengerEditStore.setAttr("birth", DataControl.PassEditData.birth);
                            //重新赋值到store中，保证信息是实时的
                            me.setPassengerById(me.stores.passengerQueryStore, iforId, DataControl.PassEditData);
    
                            var $birth = $("#addPassenger > li[data-id='" + iforId + "'] .js_birth");
                            $birth.val(Futility.formatBirth(DataControl.PassEditData.birth));
                            $birth.data(key, DataControl.PassEditData.birth);
                        }
                        
                        if (DataControl.PassEditData.defaIdCard.type == 2) {
                            Futility.showTip(DataControl.TIPICONS.BLUE, 'li[data-id="' + iforId + '"] .js_no', '请确保姓名、证件号与护照一致', false);
                        } else if (DataControl.PassEditData.defaIdCard.type == 1) {
                            var age = DataControl.getAge(DataControl.PassEditData.birth);
                            var psgType = DataControl.getPsgType(age);
                            var childOrBabyText = (psgType == 2 ? '儿童' : '婴儿');
    
                            if (DataControl.PassEditData.ticketType != -1) { // 不可购买儿童婴儿票提示信息
                                me.parentView.hideErrorTips('li[data-Id="' + iforId + '"] .js_no');
    
                                if (psgType != 1) {
                                    var policy = me.stores.flightDetailsStore.getAttr('items')[0].policy;
                                    var adultTicketDis = !policy.isApplyChild;
                                    var childTicketDis = !policy.childPolicy;
                                    var babyTicketDis = !policy.babyPolicy;
                                    var msg = '';
    
                                    if (adultTicketDis || (psgType == 2 && childTicketDis) || (psgType == 3 && babyTicketDis)) {
                                        msg = adultTicketDis ? '该价格不支持' + childOrBabyText + '购买成人票' : '该价格不支持购买' + childOrBabyText + '票';
                                        Futility.showTip(DataControl.TIPICONS.BLUE, 'li[data-id="' + iforId + '"] .js_no', msg, false);
                                    } else {
                                        me.parentView.hideErrorTips('li[data-Id="' + iforId + '"] .js_no');
                                    }
                                }
                            } else {
                                Futility.showTip(DataControl.TIPICONS.RED, 'li[data-id="' + iforId + '"] .js_no', '该价格' + childOrBabyText + '不可订，请选择其他舱位', false);
                            }
                        } else {
                            me.parentView.hideErrorTips('li[data-Id="' + iforId + '"] .js_no');
                        }
                    }
                };
                me._loadDependences_( vPassengerRender, ['vPassengerTask'], fnCallback );
            });
        },
        /**
        * @Summary  航班详情信息响应后的处理函数
        * @param    psgersData  渲染乘机人模板数据（引用传递）
        * @param    response    请求返回的航班详情信息数据
        * @param    reqFlags    请求数据的是否完成标志位
        * @return   void
        */
        flightDetailCalback: function (psgersData, response, reqFlags) {            console.log('flightDetailCalback');
            var items = this.stores.flightDetailsStore.getAttr('items'),
                policy = items[0].policy,
                supportChild = policy.isApplyChild || policy.childPolicy,
                supportBaby = policy.isApplyChild || (policy.childPolicy && policy.childPolicy.isApply) || policy.babyPolicy;

            psgersData = $.extend(true, psgersData, { policy: policy, getAge: DataControl.getAge, generatePriceStr: this.generatePriceStr.bind(this) });
            psgersData.supportChild = supportChild;
            psgersData.supportBaby = supportBaby;
            this.stores.passengerQueryStore.setAttr("firstFlyDate", items[0].basicInfo.dTime); // 编辑乘客页面用到最后一程起飞时间来计算年龄
            this.stores.passengerQueryStore.setAttr("lastFlyDate", items.length > 1 ? items[1].basicInfo.dTime : items[0].basicInfo.dTime); // 编辑乘客页面用到最后一程起飞时间来计算年龄

            if (reqFlags.PASSENGERS) {
                var passengerInfo = this.stores.passengerQueryStore.get();
                // 重新设置票的类型,如果修改了仓位，可能相应的儿童婴儿票没有，而之前选的是儿童或婴儿票，这是就需要设置为成人票
                DataControl.updatePassengersTicketType(psgersData); console.log('fuck , line 150');
                psgersData = $.extend(psgersData, { needDelIcon: this.needDelIcon });
                if (reqFlags.HASPASSENGER) {
                    this.setHtmlPassengerInfo(psgersData);
                } else {
                    this.setHtmlAddPassenger(psgersData);
                }
             
                this.showWithAdultTip(this.stores.passengerQueryStore, psgersData.passengers);
            }
        },
/**
        * @Summary  常旅（乘机人）信息响应后的处理
        * @param    psgersData  渲染乘机人模板数据（引用传递）
        * @param    data        请求返回的常旅（乘机人）信息数据
        * @param    reqFlags    请求数据的是否完成标志位
        * @return   void
        */
        passengersCallback: function (psgersData, data, reqFlags) {             console.log('passengersCallback');
            var me = this;
            if (this.stores.userStore.isLogin()) {
                if (reqFlags.PASSENGERSFAIL) {
                    this.passengersResponseFailHandler(psgersData, reqFlags);
                    return;
                }
                var store = this.models.passengerQueryModel.getResultStore();
                store.setAttr('UserId', this.parentView.UserID, store.getTag());
                var passengerInfo = store.get();
                me.filterPassengers(passengerInfo.passengers);

                var selCount = _.filter(passengerInfo.passengers, function (p) {
                    return p.selected == 1;
                }).length;
                this.stores.passengerQueryStore.setAttr('selCount', selCount);
                passengerInfo = this.stores.passengerQueryStore.get();

                //国内-已登录-有常旅（排除无常旅，手动添加的情况）
                if (passengerInfo.passengers && passengerInfo.passengers.length) {
                    this.stores.isBookingEditStore.setAttr('Edit', false, this.parentView.UserID);
                    psgersData = $.extend(true, psgersData, passengerInfo);
                    reqFlags.PASSENGERS = true;
                    reqFlags.HASPASSENGER = true;

                    if (reqFlags.DETAIL) {
                        // 重新设置票的类型,如果修改了仓位，可能相应的儿童婴儿票没有，而之前选的是儿童或婴儿票，这是就需要设置为成人票
                        DataControl.updatePassengersTicketType(psgersData); console.log('fuck , line 195');
                        this.setHtmlPassengerInfo(psgersData);
                        this.showWithAdultTip(this.stores.passengerQueryStore, psgersData.passengers);
                    }
                } else { //国内-已登录-无常旅，则初始化一个空的乘机人编辑模板，并且隐藏选择乘机人按钮
                    this.stores.isBookingEditStore.setAttr('Edit', true, this.parentView.UserID);
                    this.stores.flightOrderStore.setAttr('passengersinfo', [])
                    this.addPassengerTpl(this.stores.passengerEditStore, this.stores.passengerQueryStore, true);
                }

                if (this.stores.isBookingEditStore.getAttr('Edit', this.parentView.UserID)) {
                    passengerInfo = this.stores.passengerQueryStore.get();
                    psgersData = $.extend(true, psgersData, passengerInfo);
                    reqFlags.PASSENGERS = true;

                    if (reqFlags.DETAIL) {
                        DataControl.updatePassengersTicketType(psgersData);console.log('fuck , line 211');
                        psgersData = $.extend(psgersData, { needDelIcon: this.needDelIcon});
                        this.setHtmlAddPassenger(psgersData);
                        this.showWithAdultTip(this.stores.passengerQueryStore, psgersData.passengers);          //passenger
                    }
                    Futility.showAddBtn(this.stores.passengerQueryStore);
                } else {
                    this.passengerInfoBox.addClass('mb10');
                    this.parentView.$el.find('#js_addPass_btn').hide();
                }
            } else {
                this.stores.passengerQueryStore.setLifeTime('365D');
                var passengerInfo = this.stores.passengerQueryStore.get();
                var selCount = 0;
                
                if (passengerInfo && passengerInfo.passengers) {
                    me.filterPassengers(passengerInfo.passengers);
                    selCount = _.filter(passengerInfo.passengers, function (p) {
                        return p.selected == 1;
                    }).length;
                }

                this.stores.passengerQueryStore.setAttr('selCount', selCount);

                if (!passengerInfo || passengerInfo.UserId) {
                    this.stores.passengerQueryStore.remove();
                    passengerInfo = this.stores.passengerQueryStore.get() || {};
                }

                //国内-未登录-无记忆上一次，增加一个空的可以编辑模板
                if (!passengerInfo.passengers || !selCount) {
                    this.addPassengerTpl(this.stores.passengerEditStore, this.stores.passengerQueryStore, true);
                    passengerInfo = this.stores.passengerQueryStore.get();
                }
                psgersData = $.extend(psgersData, passengerInfo);

                if (reqFlags.DETAIL) {
                    // 重新设置票的类型,如果修改了仓位，可能相应的儿童婴儿票没有，而之前选的是儿童或婴儿票，这是就需要设置为成人票
                    DataControl.updatePassengersTicketType(psgersData);console.log('fuck , line 249');
                    this.setHtmlAddPassenger(psgersData);
                    this.showWithAdultTip(this.stores.passengerQueryStore, psgersData.passengers);
                    this.updatePassengerInfoHeader(this.stores.flightDetailsStore, this.stores.userStore, this.stores.passengerQueryStore);
                }
                Futility.showAddBtn(this.stores.passengerQueryStore);
            }
        },
        filterPassengers: function (passengers) {
            if (passengers) {
                _.each(passengers, function (p, i) {
                    if (p.cname == '携程客户') {
                        passengers.splice(i, 1);
                        return false;
                    } else { // 设置姓名的语言标志
                        if (!p.language && p.selected == 1) {
                            var isIdCard = (typeof p.defaIdCard == "undefined") || !p.defaIdCard || p.defaIdCard.type == 1;
                            p.language = (isIdCard || p.cname || !p.ename) ? 'CN' : 'EN';
                        }
                    }
                });

                this.stores.passengerQueryStore.setAttr('passengers', passengers);
            }
        },
        /*===================  验证相关逻辑结束  ==============*/
        savePassengers: function () {
            var pcount = 0;
            var adultTicketCnt = 0;
            var passengers = [];
            var passengerInfo = this.stores.passengerQueryStore.get();
            var passengerEditModel = this.models.passengerEditModel;
            var passengersinfo = this.stores.flightOrderStore.getAttr("passengersinfo") || [];
            
            for (var i in passengerInfo.passengers) {
                var p = passengerInfo.passengers[i];

                if (+p.selected == 1) {
                    var formatBirth = null;

                    pcount++;
                    adultTicketCnt += p.ticketType == 1 ? 1 : 0; // 价格的变动只是正对成人票价，儿童及婴儿的票价是不变的

                    if (+p.defaIdCard.type == 1) {
                        formatBirth = c.base.Date.parse(Futility.getBirth(p.defaIdCard.no)).format('Y-m-d');
                    } else {
                        formatBirth = c.base.Date.parse(p.birth).format('Y-m-d');
                    }

                    if (passengersinfo && !this.hasExistPassenger(passengersinfo, p)) {
                        if (this.stores.userStore.isLogin()) {
                            var newP = $.extend({}, p);
                            newP.birth = formatBirth;
                            if (this.stores.isBookingEditStore.getAttr('Edit', this.parentView.UserID)) {
                                // 将新增的乘客存到后台
                                passengerEditModel.setParam("opr", newP.opr);
                                passengerEditModel.setParam("birth", newP.birth);
                                passengerEditModel.setParam("biztype", newP.biztype);
                                passengerEditModel.setParam("cname", newP.cname);
                                passengerEditModel.setParam("email", newP.email);
                                passengerEditModel.setParam("ename", newP.ename || (newP.firstName + '/' + newP.lastName));
                                passengerEditModel.setParam("flag", newP.flag);
                                passengerEditModel.setParam("gender", newP.gender);
                                passengerEditModel.setParam("idcards", newP.idcards);
                                passengerEditModel.setParam("mphone", newP.mphone);
                                passengerEditModel.setParam("fmphone", newP.fmphone);
                                passengerEditModel.setParam("natl", newP.natl);
                                passengerEditModel.setParam("ver", newP.ver);
                                passengerEditModel.setParam("defaIdCard", newP.defaIdCard);
                                passengerEditModel.setParam("natlName", newP.natlName);
                                passengerEditModel.setParam("flightType", newP.flightType);
                                passengerEditModel.excute(function (data) {
                                    newP.inforId = data.inforId; // 保存成功后根据后台返回更新id
                                    passengersinfo.push(newP);
                                }, function (e) {
                                    console.log('Save passenger failed', newP, e);
                                }, true, this);
                            }
                        }
                        passengers.push({
                            id: p.inforId,
                            name: this.getCardName(p),
                            birth: formatBirth,
                            passportNo: p.defaIdCard.no,
                            passportType: p.defaIdCard.type,
                            phone: p.mphone ? p.mphone : "",
                            gender: p.gender,
                            natl: p.natl
                        });
                    }
                }
            }

            return {
                pcount: pcount,
                adultTicketCnt: adultTicketCnt,
                passengers: passengers
            };
        },
        // 绑定事件
        _fireEvents_: function () {
            $(this.viewPort).off('click.vPassenger.ejs_addPass_btn').on('click.vPassenger.ejs_addPass_btn', '#js_addPass_btn', this.addPassengerAction.bind(this) );
            $(this.viewPort).off('touchend.vPassenger.ejs_del_icon').on('touchend.vPassenger.ejs_del_icon', '.js_del_icon', this.deleteEditPassenger.bind(this) );
            $(this.viewPort).off('click.vPassenger.eflight_arrdown').on('click.vPassenger.eflight_arrdown', 
                                                                        '#addPassenger .flight-infoinput-pdl .flight-arrdown', this.IdCardListAction.bind(this) ); // 切换证件
            $(this.viewPort).off('click.vPassenger.eflight_iptetp_span').on('click.vPassenger.eflight_iptetp_span', '.flight-iptetp > span', this.selectTicketType.bind(this) );// 选择票类型
            $(this.viewPort).off('click.vPassenger.eflightTipsEtp2_close').on('click.vPassenger.eflightTipsEtp2_close', '.flight-tips-etp2 .close', this.closeWithAdultTips );
            $(this.viewPort).off('click.vPassenger.epassengerInfo_flightInfodel2').on('click.vPassenger.epassengerInfo_flightInfodel2', '#passengerInfo .flight-infodel2', this.passengerDelete.bind(this) );
            //已登录
            $(this.viewPort).off('click.vPassenger.epassengerInfo_flightListsim3TableUl').on('click.vPassenger.epassengerInfo_flightListsim3TableUl', '#passengerInfo .flight-listsim3-table ul', this.passengerEdit.bind(this) );
            //编辑乘机人信息
            $(this.viewPort).off('click.vPassenger.ejs_selectPass_btn').on('click.vPassenger.ejs_selectPass_btn', '#js_selectPass_btn', this.passengerSelect.bind(this) );
            //添加乘机人
            $(this.viewPort).off('keyup.vPassenger.ejs_enName').on('keyup.vPassenger.ejs_enName', '.js_enName', this.enameLiveChange );
            $(this.viewPort).off('click.vPassenger.eflightLangswt_em').on('click.vPassenger.eflightLangswt_em', '.flight-langswt > em', this.switchLanguageAction.bind(this) );
            $(this.viewPort).off('click.vPassenger.eaddPassenger_li').on('click.vPassenger.eaddPassenger_li', '#addPassenger > li', this.setCurrentEditPsg.bind(this) );
            // 设置乘机人右上角的图标高亮，表示当前编辑
            // 处理android手机上点击input不灵敏的问题 //FIXIT
            $(this.viewPort).off('touchstart.vPassenger.eaddPassenger_input').on('touchstart.vPassenger.eaddPassenger_input', '#addPassenger input', function (e) {
                var pageY = e.changedTouches[0].pageY;
                $(e.currentTarget).bind('touchend', function (e2) {
                    if (Math.abs(pageY - e2.changedTouches[0].pageY) <= 20) {
                        $(e.currentTarget).focus();
                        $(e.currentTarget).unbind('touchend');
                    }
                });
            });
            $(this.viewPort).off('click.vPassenger.eaddPassenger_js_birth').on('click.vPassenger.eaddPassenger_js_birth', '#addPassenger .js_birth', this.selectBirthAction.bind(this) );
            // 弹出生日选择控件
            var fnCallback = function(){
            }, me =this;
            this.parentView.$el.find('.j_passenger').unbind('click').bind('click', function(){
                me._loadDependences_( vPassengerRender, ['vPassengerTask'], fnCallback );
            });
        },
        //添加乘机人,不进行信息的校验
        addPassengerAction: function (e) {
            var items = this.stores.flightDetailsStore.getAttr('items'),
                minQty = items[0].policy.qty;
            var me = this;

            var fnCallback = function(){
                me.onInputLogPass(Futility);
                if (+me.stores.passengerQueryStore.getAttr('selCount') >= minQty) {
                    me.parentView.showAlert('很抱歉，因票量有限，最多只能添加' + minQty + '名乘机人', false);
                } else {
                    //初始化一个空的编辑人模板
                    me.addPassengerTpl(me.stores.passengerEditStore, me.stores.passengerQueryStore, true, true);
                    //刷新页面，根据store中的人员重新绘制乘机人模板
                    me.parentView.updatePage();
                }
                me.stores.mdStore.increaseCntByKey('MorePassengerClick'); //埋点MorePassengerClick
            };
            me._loadDependences_( vPassengerRender, ['vPassengerTask'], fnCallback );
        },
        // 删除正在编辑的乘机人
        deleteEditPassenger: function (e) {
            //passengerQueryStore, mdStore, DataControl
            var me = this;
            var fnCallback = function(){
                var parentView = me.parentView;
                var showLoading = parentView.showLoading;
                var selCount = parseInt(me.stores.passengerQueryStore.getAttr('selCount'));
                var id = $(e.currentTarget).data('id');
                var callback = function(){
                    DataControl.deletePsgById(id);
                    parentView.updatePage();
                };
    
                if (me.watchIsSpace(id)) {
                    if (selCount > 1) {
                        me.deletePsgConfirm(callback, id);
                    } else {
                        me.clearPassengerInfo(e, id );
                    }
                } else {
                    if (selCount > 1) {
                        callback();
                    }
                }
            };
            me._loadDependences_( vPassengerRender, ['vPassengerTask'], fnCallback );
        },
        //证件类型初始化
        IdCardListAction: function (e) { //ScrollRadioList初始化
            var me = this;
            var stores = this.parentView.stores;
            var iforId = $(e.currentTarget).attr('data-Id');
            var $cardLi = $(e.currentTarget).closest("li[data-id='" + iforId + "']");
            
            var fnCallback = function(){
                DataControl.PassEditData = me.getPassengerById(iforId, stores.passengerQueryStore);
                var select_ops = $('#sel_idCard-' + iforId + ' option');
                var js_no = $cardLi.find('.js_no');
                var js_blk_birth = $cardLi.find('.js_birth').closest('li');
                var data = [];
                var index = 0;
                var idcards = DataControl.PassEditData.idcards;
    
                for (var i = 0, len = select_ops.length; i < len; i++) {
                    var tmp = {}, opt = $(select_ops[i]);
                    if (opt.attr('selected')) index = i;
                    tmp.key = opt.val();
                    tmp.val = opt.html();
    
                    // tmp['data-no'] = opt.attr('data-no');
                    if (idcards[i]) {
                        tmp['data-no'] = idcards[i].no;
                    } else {
                        tmp['data-no'] = "";
                    }
    
                    tmp['inforId'] = iforId;
                    data.push(tmp);
                }
    
                var select = $('#sel_idCard-' + iforId);
                var title = $cardLi.find('label.flight-arrdown');
                var idCardList = new c.ui.ScrollRadioList({
                    title: '选择证件',
                    index: index,
                    data: data,
                    itemClick: function (item) {
                        var cNamereg = /^[\u4e00-\u9fa5]$/,
                            js_newName = $.trim($cardLi.find('.js_newName').val()),
                            cnameContainer = $cardLi.find('.js_canme-container'),
                            enameContainer = $cardLi.find('.js_ename-container'),
                            preCardType = $cardLi.find('input.js_no').data('type'),
                            lanSwitch = cnameContainer.find('.flight-langswt');
    
                        DataControl.PassEditData = me.getPassengerById(item['inforId'], stores.passengerQueryStore);
    
                        if (item.key === "1") { //当是身份证的时候
                            js_blk_birth.hide();
                            DataControl.PassEditData.cname = js_newName.replace(/\s/g, '');
                            js_no.val(Futility.formatCardNo(item['data-no']));
                            cnameContainer.show();
                            enameContainer.hide();
                            lanSwitch.hide();
                            cnameContainer.find('.cui-focus-close').css('right', '20px');
                            DataControl.PassEditData.language = 'CN';
                            me.setPassengerById(stores.passengerQueryStore, item['inforId'], DataControl.PassEditData);
                        } else {
                            js_blk_birth.show();
                            js_no.val(item['data-no']);
                            lanSwitch.show();
                            cnameContainer.find('.cui-focus-close').css('right', '85px');
                        }
    
                        $cardLi.find('input.js_no').data('type', item.key);
                        // 25(户口本age < 16 ) / 27（出生证明age < 12）
                        // 解决从户口薄或出生证明切换到身份证时，UI没有及时刷新问题
                        var $ticketTypeList = $cardLi.find('.flight-iptetp');
                        var $selctedType = $ticketTypeList.find('span.flight-iptetp-current');
                        if ((preCardType == 25 || preCardType == 27) && item.key != preCardType) {
                            if (DataControl.PassEditData.birth && Futility.testBirth(DataControl.PassEditData.birth)) {
                                var age = DataControl.getAge(DataControl.PassEditData.birth);
                                var psgType = DataControl.getPsgType(age);
                                var preTicketType = $selctedType.length ? parseInt($selctedType.data('type')) : -1; // -1 表示，未选中任何票类型即该乘机人买不了票（儿童或婴儿），
                                var ticketType = me.findLowPriceTicketByPsgType(psgType);
    
                                if (ticketType != -1) {
                                    me.selectTicketType(null, $ticketTypeList.find('span:nth-child(' + ticketType + ')')[0], true);// 默认选择成人票
                                    $ticketTypeList.parent().siblings(".flight-ipt-etp3").hide();
                                    me.parentView.hideErrorTips('li[data-id="' + iforId  + ' .js_birth"]');
                                    ticketType != 1 ? $ticketTypeList.parent().show() : $ticketTypeList.parent().hide();
                                } else {
                                    $ticketTypeList.parent().hide();
                                    $ticketTypeList.parent().siblings(".flight-ipt-etp3").show();
                                }
                            }
                        }
    
                        stores.passengerEditStore.setAttr("cname", DataControl.PassEditData.cname);
                        stores.passengerEditStore.setAttr("ename", DataControl.PassEditData.ename);
    
                        select.val(item.key);
    
                        title.html((item.val.length > 4 ? item.val.substring(0, 4) : item.val));
                        js_no.data("index", item.index);
                        js_no.focus();
                        for (var i = 0; i < DataControl.PassEditData.idcards.length; i++) {
                            DataControl.PassEditData.idcards[i].choose = false;
                        }
                        DataControl.PassEditData.idcards[item.index].choose = true;
                        DataControl.PassEditData.defaIdCard = DataControl.PassEditData.idcards[item.index];
                        me.setPassengerById(stores.passengerQueryStore, item['inforId'], DataControl.PassEditData);
    
                        if (item.key == "1" && Futility.validateCard(me.parentView.showErrroTips, 1, DataControl.PassEditData.defaIdCard, '', false)) {
                            // 如果身份证合法则根据身份证号码提取生日且更新UI
                            me.idCardFocusOutHandler(js_no[0]);
                        } else {
                            js_no.focus();
                        }
    
                        me.parentView.hideErrorTips('li[data-id="' + iforId + '"] .form-tips');
    
                        me.handleErrorInfo(DataControl.PassEditData.birth);
                    }
                });
                idCardList.show();
            };
            me._loadDependences_( vPassengerRender, ['vPassengerTask'], fnCallback );
        },
        // 选择机票类型 (zy)
        selectTicketType: function (e, currentTarget) { //passenger
            var target = currentTarget ? $(currentTarget) : $(e.currentTarget);
            var passengersStoreData = this.stores.passengerQueryStore.get() || {};
            var passengers = passengersStoreData.passengers || [];
            var psgIndex = parseInt(target.parent().data('psgidx'));
            var ticketType = parseInt(target.data('type'));

            if (!target.hasClass('flight-iptetp-current')) { // 点击已选中的票不做任何处理
                target.siblings('span').removeClass('flight-iptetp-current'); // 移除选中项的样式

                // 设置选中票种类型参数到passenger对象中
                passengers[psgIndex].ticketType = ticketType; // 改登记人选择的票类型（-1: 未选择 1 成人 2 儿童 3 婴儿）
                this.setPassengerById(this.stores.passengerQueryStore, passengers[psgIndex].inforId, passengers[psgIndex]);

                if (passengers[psgIndex].edit) {
                    DataControl.PassEditData.ticketType = passengers[psgIndex].ticketType;
                    this.stores.passengerEditStore.setAttr('ticketType', ticketType);
                }

                target.addClass('flight-iptetp-current'); // 标记当前选中票为选中
                this.showWithAdultTip(this.stores.passengerQueryStore, passengers);
                this.updatePassengerInfoHeader(this.stores.flightDetailsStore, this.stores.userStore, this.stores.passengerQueryStore);

                // 更新订单总价格
                this.parentView.trigger(this.parentView.EVENTS.UPDATEORDERPRICE);

                // TODO Use event to notice parent view do something
                var detailData = this.stores.flightDetailsStore.get();
                this.parentView.i_QueryCustomerCoupon( detailData); //刷新消费券，儿童和婴儿不参加返现add by zhengkw 2014-6-23
            }
        },
        //关闭12岁成人陪同提示
        closeWithAdultTips: function () {
            $('.flight-tips-etp2').addClass('close_animate');

            //动画结束后自动隐藏，解决双边框问题
            document.querySelector('.flight-tips-etp2').addEventListener('webkitAnimationEnd', function () {
                $('.close_animate').hide();
            }, false);
        },
        /*
        *删除乘机人
        */
        passengerDelete: function (e) {
            //passengerQueryStore
            //mdStore
            var me = this;
            var stores = this.parentView.stores;
            var passengerInfo = stores.passengerQueryStore.get();
            //1.提示用户确定要删除吗？
            var target = $(e.currentTarget);
            var passengerId = target.attr('data-id'),
                pIndex = target.attr('data-index');

            if (!passengerId || !passengerInfo || !pIndex || +pIndex < 0) {
                this.parentView.showAlert();
                return;
            }

            var selected = $.grep(passengerInfo.passengers, function (value, index) {
                return value.selected == '1';
            });
            
            var backAlert = new c.ui.Alert({
                title: '提示信息',
                message: '您确定要删除该乘机人吗？',
                buttons: [{
                    text: '取消',
                    click: function () {
                        this.hide();
                    }
                }, {
                    text: '确定',
                    click: function () {
                        this.hide();
                        me.parentView.showLoading();
                        try {
                            // 删除埋点store里的信息
                            var mdPassengersInfo = stores.mdStore.getAttr('passengers');
                            if (mdPassengersInfo[passengerId]) {
                                delete mdPassengersInfo[passengerId];
                            }
                            stores.mdStore.setAttr('passengers', mdPassengersInfo);
                        } catch (e) {
                            //console.log('PassengerDelete: 删除相关乘机人的埋点信息异常');
                        }//TODO: finally release the reference

                        //2.从Storage中移除对应的乘机人信息
                        var selP = passengerInfo.passengers[pIndex];
                        if (selP && selP.inforId == passengerId) {
                            selP.selected = 0;
                            //passengerInfo.passengers.splice(pIndex, 1)
                            passengerInfo.selCount -= 1;
                        }
                        DataControl.updatePassengersTicketType(passengerInfo);console.log('fuck , line 809');
                        var tag = stores.passengerQueryStore.getTag();
                        DataControl.updatePassengersTicketType(passengerInfo);console.log('fuck , line 809');
                        stores.passengerQueryStore.set(passengerInfo, tag);
                        me.parentView.updatePage(function () {
                            me.parentView.hideLoading(); //非渲染
                        });
                    }
                }]
            });

            backAlert.show();
        },
        /*
        *编辑乘机人
        */
        passengerEdit: function (e) {
            var stores = this.stores;
            var target = $(e.currentTarget);
            var inforId = target.data('id'),
                pIndex = target.attr('data-index');
            if (!inforId || +inforId <= 0) {
                this.parentView.showToast('请选择您要修改的乘机人。');
                return;
            }
            var passengerInfo = stores.passengerQueryStore.get();
            if (!passengerInfo || !passengerInfo.passengers || +passengerInfo.selCount <= 0) {
                this.parentView.showToast('请选择您要修改的乘机人。');
                return;
            }
            this.parentView.showLoading();
            var passengerEditData = passengerInfo.passengers[pIndex];
            var tag = stores.passengerEditStore.getTag();
            var policy = stores.flightDetailsStore.getAttr('items')[0].policy;
            stores.passengerEditStore.set(passengerEditData, tag);
            stores.passengerEditStore.setAttr('backurl', null);
            stores.passengerEditStore.setAttr('opr', 4);
            stores.passPageTypeStore.setAttr('type', 1);
            stores.passPageTypeStore.setAttr('passengerType', DataControl.getPsgType(null, passengerEditData));
            stores.passPageTypeStore.setAttr('hasChildTicket', !!policy.childPolicy);
            stores.passPageTypeStore.setAttr('hasBabyTicket', !!policy.babyPolicy);
            stores.passPageTypeStore.setAttr('babyCanBuyChildTicket', !!(policy.childPolicy && policy.childPolicy.isApply));

            // Set the ticket type to -1 so that it will update the ticket type after back to bookinginfo page
            passengerEditData.ticketType = -1;
            stores.passengerEditStore.setAttr('ticketType', -1);
            this.setPassengerById(stores.passengerQueryStore, passengerEditData.inforId, passengerEditData);

            var items = stores.flightDetailsStore.getAttr('items'); //航班详情store
            stores.passPageTypeStore.setAttr('firstFlyDate', items.length > 1 ? items[1].basicInfo.dTime : items[0].basicInfo.dTime); // 编辑乘客页面用到最后一程起飞时间来计算年龄
            //前往乘机人编辑页面,传当前选择的乘机人索引
            this.parentView.jump('/webapp/fpage/index.html#passengerEdit!' + $(e.currentTarget).attr('data-id'));
        },
        /*
        *选择乘机人
        */
        passengerSelect: function (e) {
            var stores = this.stores;
            var flightDetailsData = stores.flightDetailsStore.get();
            if (!flightDetailsData) {
                this.parentView.showAlert();
                return;
            }
            stores.passPageTypeStore.setAttr('type', 1);
            stores.passPageTypeStore.setAttr('passengerType', 1);
            var items = stores.flightDetailsStore.getAttr('items'); //航班详情store
            stores.passPageTypeStore.setAttr('firstFlyDate', items.length > 1 ? items[1].basicInfo.dTime : items[0].basicInfo.dTime); // 编辑乘客页面用到最后一程起飞时间来计算年龄

            //var tag = passengerQueryStore.getTag();
            //passengerQueryStore.setAttr('flightType', 1, tag)
            //前往乘机人编辑页面,传当前选择的航班号,若用户为会员，则前往乘机人选择页面，否则前往乘机人添加页面
            this.parentView.$el.find('.js_newName').off('focusout');
            this.parentView.jump('/webapp/fpage/#passengerSelect!' + $(e.currentTarget).attr('data-id'));
        },
        enameLiveChange: function (e) {     //passenger
            var $target = $(e.currentTarget),
                value = $target.val() || '';

            if (value && /[a-z]/.test(value.substring(0, 1))) { // 如果第一个字符是大写则不转换
                $target.val(value.toUpperCase());
            }
        },
        // 切换中英文姓名
        switchLanguageAction: function (e) {
            var lan = $(e.currentTarget).data('lan'),
                $targetLi = $(e.currentTarget).closest('li[data-id]'),
                id = $targetLi.data('id'),
                cnameContainer = $targetLi.find('.js_canme-container'),
                enameContainer = $targetLi.find('.js_ename-container'),
                p = this.getPassengerById(id, this.stores.passengerQueryStore),
                isIdCard = (p.defaIdCard && p.defaIdCard.type == 1) ? true : false;

            if (!isIdCard && !$(e.currentTarget).hasClass('flight-langswt-selected')) {
                if (lan == 'CN') {
                    cnameContainer.show();
                    enameContainer.hide();
                } else {
                    cnameContainer.hide();
                    enameContainer.show();
                }
            }
            if (isIdCard) {
                cnameContainer.find('.flight-langswt').hide();
                cnameContainer.find('.cui-focus-close').css('right', '20px');
            } else {
                cnameContainer.find('.flight-langswt').show();
                cnameContainer.find('.cui-focus-close').css('right', '85px');
            }
            DataControl.PassEditData = this.getPassengerById(id, this.stores.passengerQueryStore);
            DataControl.PassEditData.language = lan;
            this.setPassengerById(this.stores.passengerQueryStore, id, DataControl.PassEditData);
        },
        // 设置当前正在编辑的乘机人
        setCurrentEditPsg: function (e) {
            try {
                if ($(e.currentTarget).data('id')) { // 事件源是li
                    $(e.currentTarget).siblings('li').find('.flight-psinfo-no').removeClass('flight-psinfo-no-current');
                    $(e.currentTarget).find('.flight-psinfo-no').addClass('flight-psinfo-no-current');
                } else { // 事件源不是li, input focus in
                    $(e.target).closest('li[data-id]').siblings('li').find('.flight-psinfo-no').removeClass('flight-psinfo-no-current');
                    $(e.target).closest('li[data-id]').find('.flight-psinfo-no').addClass('flight-psinfo-no-current');
                }
            } catch (e) {
                console.log('Dom has been delete!!!');
            }
        },
        // 选择出生日期
        selectBirthAction: function (e) {
            var me = this;
            var birthInput = $(e.currentTarget);
            var birth = birthInput.data('key') + '';
            var isValidBirth = /^(19[0-9]{2}|20[01]{1}\d{1})(0[1-9]{1}|1[0-2]{1})(0[1-9]{1}|[12]\d{1}|3[01]{1})$/.test(birth);
            var psgId = birthInput.closest('li[data-id]').data('id');
            var currentYear = new Date().getFullYear();
            var year = isValidBirth ? (+birth.substring(0, 4) - (currentYear - 80)) : (1980 - (currentYear - 80));
            var month = isValidBirth ? +birth.substring(4, 6) - 1 : 0;
            var day = isValidBirth ? +birth.substring(6, 8) - 1 : 0;
            var dateItems = Futility.getDateItems();
            var yearChange = function (item) {
                //处理2月天数问题
                var year = +item.key;
                var month = +mutipleScrollList.getItemByIndex(1).key;
                var day = +mutipleScrollList.getItemByIndex(2).key;
                var days = Futility.getDayItem(year, month);
                var selectedDay = day <= days.length ? day - 1 : days.length - 1;

                if (month == 2) {
                    mutipleScrollList.updateScrollListByIndex(2, days, selectedDay);
                }
            };
            var monthChange = function (item) {
                //处理2月天数问题
                var year = +mutipleScrollList.getItemByIndex(0).key,
                    month = +item.key,
                    day = +mutipleScrollList.getItemByIndex(2).key,
                    days = Futility.getDayItem(year, month),
                    selectedDay = day <= days.length ? day - 1 : days.length - 1;

                mutipleScrollList.updateScrollListByIndex(2, days, selectedDay);
            };
            var mutipleScrollList = new MultipleScrollList({
                title: '选择出生日期',
                data: dateItems,
                index: [year, month, day],
                changed: [yearChange, monthChange, null],
                disItemNum: 4,
                cancel: '取消',
                ok: '确定',
                className: 'flight-date-box',
                okClick: function (items) {
                    birthInput.val(items[0].name + items[1].name + items[2].name);
                    birthInput.data('key', items[0].key + items[1].key + items[2].key);
                    me.finishBirthAction(e);
                }.bind(this)
            });

            mutipleScrollList.show();
        },
        showWithAdultTip: function (passengerQueryStore, passengers) {
            passengers = passengers || passengerQueryStore.get().passengers;
            if (this.hasAdultWith(passengers)) {
                $(".flight-tips-etp2").hide();
            } else {
                $(".flight-tips-etp2").show().removeClass('close_animate');
            }
        },
        hasAdultWith: function (passengers) {           //passenger
            var me = this;
            var hasAdult = false;
            var hasChild = false;
            var psgType;
            var PSGTYPE = { ADULT: 1, CHILD: 2, BABY: 3, NEWBORN: 4 };
            var birth = '';
            passengers = passengers || [];
            $(passengers).each(function (index, item) {
                if (item.selected == 1) {  //国内1为选中； 国际2为选中
                    if (item.ticketType == PSGTYPE.ADULT) {
                        hasAdult = true;
                        return false;
                    } else if (item.ticketType == PSGTYPE.CHILD || item.ticketType == PSGTYPE.BABY) {
                        hasChild = true;
                }
            }
            });
            return hasAdult || !hasChild;
        },
        /*
        * @Summary 统计各种票的数量
        * @param ticketType int(1,2,3) option
        *    票类型，成人，儿童，婴儿, 如果不传票类型则返回各种票的数量，数组表示 ,否则返回特定类型票的数量
        * @return [int, int, int] or int
        */
        getTicketsCount: function () {
            var passengerQueryStore = this.stores.passengerQueryStore;
            var passengers = passengerQueryStore.getAttr('passengers') || [],
                ticketsCntArr = [0, 0, 0],
                ticketCnt = 0;
            _.each(passengers, function (p) {
                if (p.selected == 1) {
                    ticketsCntArr[p.ticketType - 1]++;
                }
            });
            return ticketsCntArr;
        },
        // 更新乘机人头部信息
        updatePassengerInfoHeader: function () {
            var stores = this.stores;
            var items = stores.flightDetailsStore.getAttr('items'), //航班详情store
            policy = items[0].policy,
            supportChild = policy.isApplyChild || policy.childPolicy,
            supportBaby = policy.isApplyChild || (policy.childPolicy && policy.childPolicy.isApply) || policy.babyPolicy,
            isLogin = stores.userStore.isLogin(),
            passengers = stores.passengerQueryStore.getAttr('passengers'),
            showSelBtn = !isLogin ? false : !stores.isBookingEditStore.getAttr("Edit", this.parentView.UserID); 
            
            var data = {
                ticketsCnt: this.getTicketsCount(stores.passengerQueryStore), 
                supportChild: supportChild, 
                supportBaby: supportBaby, 
                showSelBtn: showSelBtn
            };
            var template = this.passengerInfoHeaderFun;
            this.passengerInfoHeader.html(template(data));
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
        * @Summary  根据票类型取得相应票价的字符串
        * @param    policyType string ('', 'childPolicy', 'babyPolicy')
        * @return   string ¥1200
        */
        generatePriceStr: function (policyType) {
            //往返的话有2程。"childPolicy","babyPolicy"
            var items = this.stores.flightDetailsStore.getAttr('items'), totalPrice = 0, totalTax = 0, totalFuelCost = 0;

            items.forEach(function (item) {
                if (policyType) {
                    totalPrice += item.policy[policyType] ? item.policy[policyType].price : 0;
                    totalTax += item.policy[policyType] ? item.policy[policyType].tax : 0;
                    totalFuelCost += item.policy[policyType] ? item.policy[policyType].fuelCost : 0;
                } else {
                    totalPrice += item.policy.price;
                    totalTax += item.policy.tax;
                    totalFuelCost += item.policy.fuelCost;
                }
            });
            return '¥' + (totalPrice + totalTax + totalFuelCost);
        },
        hasExistPassenger: function (arr, p) {      //passenger
            var result = false;
            $.each(arr, function (index, item) {
                if (item.inforId == p.inforId) {
                    result = true;
                    return false;
                }
            });
            return result;
        },
        getCardName: function (p) {
            if (p.defaIdCard.type == 1) {
                return p.cname;
            }

            return p.language == 'CN' ? p.cname : p.ename || (p.firstName + '/' + p.lastName);
        }
    });
    
    //vPassengerRender = c.base.implement(vPassengerRender, vPassengerTask );
    return vPassengerRender;
    
});

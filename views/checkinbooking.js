define(['libs', 'c', 'cBasePageView', 'CommonStore', 'cMultipleDate', 'FlightModel', 'FlightStore', buildViewTemplatesPath('checkinbooking.html')], function (libs, c, cBasePageView, CommonStore, cMultipleDate, FlightModel, FlightStore, html) {
    var cui = c.ui, cBase = c.base, salesStore = CommonStore.SalesObjectStore.getInstance, utility = c.utility;
    userStore = CommonStore.UserStore.getInstance(), //用户信息
    userInfo = userStore ? userStore.getUser() : null,
    flightAirlineModel = FlightModel.FlightAirlineModel.getInstance(),
    checkinParamStore = FlightStore.CheckinParamStore.getInstance(),
    checkPassengerStore = FlightStore.CheckPassengerStore.getInstance(),
    checkinListStore = FlightStore.CheckinListStore.getInstance(),
    checkAirListModel = FlightModel.CheckAirListModel.getInstance();
    _this = null;
    var View = cBasePageView.extend({
        pageid: '',
        tpl: html,
        ariLineData: null, //航空公司数据
        uid: null, //用户ID
        passengerData: null, //值机参数
        render: function () {
            this.viewdata.req = this.request;
            this.$el.html(this.tpl);
            this.els = {
                contentBox: this.$el.find("#content"),
                contentTpl: this.$el.find("#contentTpl")
            };
            this.content = _.template(this.els.contentTpl.html());
        },
        events: {
            'click #AirName': 'selectFlightAir', //选择航空公司
            'click #CardType': 'changeCard', //切换证件
            'click #CheckinButton': 'checkIn', //办理值机
            'click #CheckinRule': 'checkinRule', //值机协议,
            'click #CheckinNotice': 'checkinNotice', //值机须知,
            'click #HazardNotice': 'hazardNotice', //危险品公告,
            'click .flight-footer li': 'ToNextPage', //底部跳转
            'click #js_return': 'backAction'

        },

        //首次记载view，创建view
        onCreate: function () {
            //页面需要的静态资源
            this.render();

        },
        //加载数据时
        onLoad: function (refer) {
            this.hasChange = false;
            if (refer != "checkinprotocol") {
                checkinParamStore.setAttr('hasChange', false);
            }
            //根据是否会员切换不同的契约地址
            checkAirListModel.url = userStore.isLogin() ? "/Flight/Domestic/CheckIn/AircraftRulesSearch" : "/Flight/Domestic/CheckIn/NonMemberAircraftRulesSearch";
            this.baseDataModel = new cMultipleDate({
                'models': {
                    'CheckAirListModel': checkAirListModel
                }
            });

            _this = this;
            //获取记忆上一次的数据，区分会员和非会员
            if (!this.uid) {
                if (userStore.isLogin()) {
                    var user = userStore.getUser();
                    this.uid = user.UserID;
                } else {
                    this.uid = c.utility.getGuid();
                }
            }

            this.passengerData = checkPassengerStore.get() || {};
            /*初始化store*/
            this.initParamStore();
            this.updatePage(function () {

                this.hideLoading();
                this.turning();
            })



        },
        //调用turning方法时触发
        onShow: function () {

        },
        onHide: function (toViewName) {
            this.hideLoading();

        },
        /*回退*/
        backAction: function () {
            if (userStore.isLogin()) {
                if (!checkPassengerStore.get() && (!checkinListStore.get() || !checkinListStore.get().fcinfos || !checkinListStore.get().fcinfos.length)) {
                    this.showAlert(function () { _this.forward('index') });

                } else if (checkinListStore.get() && checkinListStore.get().fcinfos && checkinListStore.get().fcinfos.length) {
                    this.showAlert(function () { _this.back('CheckInList') });
                }


            } else {
                this.showAlert(function () { _this.back('checkin') });

            }

        },
        showAlert: function (callback) {
            if (checkinParamStore.getAttr('hasChange') == true) {
                this.backAlert = new c.ui.Alert({
                    title: '提示信息',
                    message: '填写尚未完成，确定要离开吗？',
                    buttons: [{
                        text: '取消',
                        click: function () {
                            this.hide();
                        }
                    }, {
                        text: '确定',
                        click: function () {
                            this.hide();
                            _this.hideLoading(); //非渲染
                            callback();

                        }
                    }]
                });
                this.backAlert.show();
            }
            else {
                callback();
            }


        },

        /*初始化页面，请求航空公司数据*/
        updatePage: function (callback) {
            this.showLoading();
            var airName = null;
            /*当没有航空公司时按照PRD要求提示用户*/
            this.baseDataModel.excute(function (data) {
                this.ariLineData = data.CheckAirListModel;
                if (!this.ariLineData.aplst || this.ariLineData.aplst.length == 0) {
                    this.ruleAlert = new c.ui.Alert({
                        message: '抱歉，在线值机临时关闭，请稍候再试。',
                        buttons: [
                          {
                              text: '知道了',
                              click: function () {
                                  this.hide();
                                  _this.backAction();
                              }
                          }
                         ]
                    });
                    this.ruleAlert.show();
                    this.hideLoading();
                    return;
                }
                //根据航空公司的编号获取航空公司名称
                var airname = null;
                for (var i = 0; i < this.ariLineData.aplst.length; i++) {
                    if (checkinParamStore.getAttr('airCode') == this.ariLineData.aplst[i].alcode) {
                        airname = this.ariLineData.aplst[i].alname
                    }
                }
                checkinParamStore.setAttr("airName", airname);
                this.els.contentBox.html(this.content(checkinParamStore.get()));
                //如果是从航班列表下点击“不在携程买的机票，点此办理值机”进到值机信息填写页，则不显示该文案
                if (checkPassengerStore.get()) {
                    this.$el.find('.flight-headtips').hide();
                    this.$el.find('#CardInput').attr("disabled", "disabled");//携程订单证件号码不编辑 add by zhengkw 2014-8-19
                    this.$el.find('#AirName').removeClass("flight-arrrht");
                    this.$el.find('#CardType').removeClass("flight-arrdown");
                }
                else {
                    if (userStore.isLogin() && checkinListStore.get() && checkinListStore.get().fcinfos && checkinListStore.get().fcinfos.length) {
                        this.$el.find('.flight-headtips').hide();
                    }

                }
                /*边输入边存储事件*/
                this.onInputSave();

                c.ui.InputClear(this.$el.find('input'), null, null, {
                }, true);
                callback.call(this);
            }, function (e) {
                this.ariLineData = { FlightAirline: [] };
                // callback.call(this);
                _this.backAction();
            }, false, this);



        },

        /*切换证件类型*/
        changeCard: function (e) { //ScrollRadioList初始化
            if (checkPassengerStore.get()) {
                return;
            }

            var iforId = $(e.currentTarget).attr('data-Id');
            var select = $(e.currentTarget);
            var data = [];
            var index = 0;
            var input = $("#CardInput");
            for (var i = 0, len = this.idCardType.length; i < len; i++) {
                var tmp = {};
                if (iforId == this.idCardType[i].id) {
                    index = i;
                }
                tmp.key = this.idCardType[i].id;
                tmp.val = this.idCardType[i].name;
                data.push(tmp);
            }
            this.idCardList = new c.ui.ScrollRadioList({
                title: '请选择有效证件',
                index: index,
                data: data,
                itemClick: function (item) {//切换证件的同时显示证件的内容
                    switch (item.key) {
                        case 1: //身份证
                            input.attr("placeholder", "乘机人身份证号");
                            break;
                        case 2: //护照
                            input.attr("placeholder", "乘机人护照号");
                            break;
                        case 3: //票号
                            input.attr("placeholder", "票号13位数字");
                            break;
                    }
                    index = item.index;
                    var cards = checkinParamStore.getAttr("cards") || [];
                    select.text(item.val);
                    select.attr('data-Id', item.key);
                    checkinParamStore.setAttr("cardType", item.key);
                    checkinParamStore.setAttr("cardName", cards[index].name);
                    var no = cards[index].no ? cards[index].no : "";
                    checkinParamStore.setAttr("card", no);
                    $("#CardInput").val(no);
                }
            });
            this.idCardList.show();
        },
        /*选择航空公司*/
        selectFlightAir: function (e) {
            if (checkPassengerStore.get()) {
                return;
            }
            _this.hasChange = true;
            checkinParamStore.setAttr('hasChange', true);
            var airicon = this.$el.find("#AirName span").first();
            var airtest = this.$el.find("#AirName span").last();
            var code = $(e.target).attr("data-code");

            var index = 0;
            var data = [];
            for (var i = 0, len = this.ariLineData.aplst.length; i < len; i++) {
                var air = this.ariLineData.aplst[i];
                var tmp = {};
                if (code == air.alcode) { index = i; }
                tmp.key = air.alcode;
                tmp.val = '<span class="pubFlights_' + air.alcode + '">' + air.alname + '</span>';
                data.push(tmp);
            }
            this.airLineList = new c.ui.ScrollRadioList({
                title: '请选择航空公司',
                index: index,
                data: data,
                itemClick: function (item) {
                    $("#AirName").attr("data-code", item.key);
                    airtest.text(item.val.split('>')[1].split('<')[0]);
                    checkinParamStore.setAttr("airName", item.val.split('>')[1].split('<')[0]);
                    checkinParamStore.setAttr("airCode", item.key);
                    airicon.attr("class", 'pubFlights_' + item.key);
                }
            });
            this.airLineList.show();


        },

        /*校验信息-身份证、护照、机票号、手机、航空公司*/
        validate: function () {
            var aircode = checkinParamStore.getAttr("airCode");
            var airname = checkinParamStore.getAttr("airName");
            var tel = checkinParamStore.getAttr("tel");
            var cardType = checkinParamStore.getAttr("cardType");
            var card = checkinParamStore.getAttr("card");
            if (card) {
                card = card.replace(/\s/g, "");
            }

            if (!aircode) {
                this.showToast("请选择航空公司");
                return false;
            }

            if (cardType == 1) { //是身份证
                if (!card || !card.length) {
                    _this.showToast('请填写身份证号码');
                    if (!$("#CardInput").hasClass('highlight')) {
                        $("#CardInput").addClass('highlight')
                    }
                    $("#CardInput").focus();
                    return false;
                }
                if (card.length == 15) {
                    this.showValidateAlter('根据国家法律规定，第一代居民身份证自2013年1月1日起停止使用。请填写您的18位身份证号码。');
                    $("#CardInput").focus();
                    return false;
                }

                if (!c.utility.validate.isIdCard(card)) {
                    this.showValidateAlter('请填写正确的身份证号码!');
                    $("#CardInput").focus();
                    return false;
                }

            }
            var eNamereg = /^[A-Za-z0-9]+$/g;
            if (cardType == 2) { //护照
                if (!card || !card.length) {
                    _this.showToast('请填写护照号');
                    if (!$("#CardInput").hasClass('highlight')) {
                        $("#CardInput").addClass('highlight')
                    }
                    $("#CardInput").focus();
                    return false;
                }
                if (card.length > 20) {
                    this.showValidateAlter('请填写正确的护照号码');
                    $("#CardInput").focus();
                    return false;
                }
                if (!eNamereg.test(card)) {
                    this.showValidateAlter('证件号码只能是英文或数字');
                    $("#CardInput").focus();
                    return false;
                }
            }

            if (cardType == 3) { //机票号
                eNamereg = /^[0-9]+$/g;
                if (!card || !card.length) {
                    _this.showToast('请填写机票号');
                    if (!$("#CardInput").hasClass('highlight')) {
                        $("#CardInput").addClass('highlight')
                    }
                    $("#CardInput").focus();
                    return false;
                }
                if (card.length != 13 || !eNamereg.test(card)) {
                    this.showValidateAlter('机票号为13位数字');
                    $("#CardInput").focus();
                    return false;
                }
            }

            if (!tel) {
                _this.showToast("请输入手机号码");
                $("#tel").focus();
                if (!$("#tel").hasClass('highlight')) {
                    $("#tel").addClass('highlight')
                }
                return false;
            };
            if (tel.length < 11 || !c.utility.validate.isMobile(tel)) {
                _this.showToast('请填写正确的手机号码');
                $("#tel").focus();
                return false;
            }


            return true;

        },

        showValidateAlter: function (altermessage) {

            var alter = new c.ui.Alert({
                title: 'confirm title',
                message: altermessage, //控件信息内容，可以自定义
                buttons: [{
                    text: '知道了',
                    click: function () {
                        this.hide();
                    }
                }]
            });
            alter.show();

        },

        /*输入的同时记忆在Store*/
        onInputSave: function () {
            //身份证
            this.$el.find(".flight-zjtable").on("input", '#CardInput', function () {
                var card = $(this).val().trim();
                checkinParamStore.setAttr("card", card);
                var key = checkinParamStore.getAttr("cardType");
                var cards = checkinParamStore.getAttr("cards");
                if (cards[key - 1]) {
                    cards[key - 1].no = card;
                }
                if (card.length && $(this).hasClass('highlight')) {
                    $(this).removeClass();
                }
                checkinParamStore.setAttr("cards", cards);
            });
            //手机号码
            this.$el.find(".flight-zjtable").on("input", '#tel', function () {
                var tel = $(this).val().trim();
                if (tel.length && $(this).hasClass('highlight')) {
                    $(this).removeClass();
                }
                checkinParamStore.setAttr("tel", tel);
                if (checkPassengerStore.get() && checkPassengerStore.get().ciplst && checkPassengerStore.get().ciplst.length) {
                    var ciplst = checkPassengerStore.get().ciplst;
                    ciplst[0].phone = tel;
                    checkPassengerStore.setAttr('ciplst', ciplst);
                }

            });

            this.$el.find(".flight-zjtable").on("focus", '#CardInput', function () {
                _this.hasChange = true;
                checkinParamStore.setAttr('hasChange', true);
            });

            this.$el.find(".flight-zjtable").on("focus", '#tel', function () {
                _this.hasChange = true;
                checkinParamStore.setAttr('hasChange', true);
            });
        },
        /*办理值机*/
        checkIn: function () {
            if (this.validate()) {
                if (checkPassengerStore.get()) {
                    checkPassengerStore.setAttr("backurl", "checkinbooking");
                    this.forward('selectseat');
                }
                else {
                    this.forward('checkinselectflight');
                }

            }
        },

        /*值机协议*/
        checkinRule: function () {
            var aircode = $("#AirName").attr("data-code");
            var airname = $("#AirName").text();
            if (!aircode) {
                this.ruleAlert = new c.ui.Alert({
                    message: '请先选择航空公司，再查看值机协议',
                    buttons: [
                  {
                      text: '确认',
                      click: function () {
                          this.hide();

                      }
                  }
                ]
                });
                this.ruleAlert.show();
                return false;
            }
            checkinParamStore.setAttr("noticeType", 0);
            checkinParamStore.setAttr("alcode", aircode);
            this.forward("checkinprotocol");
        },
        /*值机须知*/
        checkinNotice: function () {
            checkinParamStore.setAttr("noticeType", 1);
            this.forward("checkinprotocol");
        },
        /*危险品公告*/
        hazardNotice: function () {
            checkinParamStore.setAttr("noticeType", 2);
            this.forward("checkinprotocol");
        },
        /*跳转*/
        ToNextPage: function (e) {
            var li = $(e.target);
            if (li.attr('id') == "flightSearch") {
                this.forward("index");
            }
            else if (li.attr('id') == "flightSchedule") {
                this.jump("/html5/Flight/Schedule/");
            }

        },

        /*初始化store，从FLIGHT_CHECK_PASSENGER获取所需的数据*/
        initParamStore: function () {
            if (checkinParamStore.getAttr('uid') != this.uid) {
                checkinParamStore.remove();
            }
            if (this.passengerData && this.passengerData.ciplst && this.passengerData.ciplst.length) {
                var passenger = this.passengerData.ciplst;
                checkinParamStore.setAttr('airCode', this.passengerData.aircde);
                if (passenger.length) {
                    switch (passenger[0].ctype) {
                        case 1:
                            checkinParamStore.setAttr('cardName', '身份证');
                            checkinParamStore.setAttr('card', passenger[0].cno);
                            break;
                        case 2:
                            checkinParamStore.setAttr('cardName', '护照');
                            checkinParamStore.setAttr('card', passenger[0].cno);
                            break;
                        case 3:
                            checkinParamStore.setAttr('cardName', '机票号');
                            checkinParamStore.setAttr('card', passenger[0].tno);
                            break;
                        default:
                            checkinParamStore.setAttr('cardName', '身份证');
                            checkinParamStore.setAttr('card', null);
                            break;

                    }
                    checkinParamStore.setAttr('cardType', passenger[0].ctype);
                    checkinParamStore.setAttr('tel', passenger[0].phone);
                }

            }

            var cards = checkinParamStore.getAttr("cards") || [];
            if (cards.length != this.idCardType.length) {
                _.each(this.idCardType, function (v, i) {
                    var isnew = true;
                    _.each(cards, function (c, index) {
                        if (c.id == v.id) {
                            isnew = false;
                            return false;
                        }
                    });
                    if (isnew) {
                        cards[i] = v;
                    }
                });
                checkinParamStore.setAttr("cards", cards);
            }
            checkinParamStore.setAttr('uid', this.uid)
        },
        /*证件类型*/
        idCardType: [
            {
                id: 1,
                name: '身份证'
            },
             {
                 id: 2,
                 name: '护照'
             },
             {
                 id: 3,
                 name: '机票号'
             }

        ]
    });
    return View;
});

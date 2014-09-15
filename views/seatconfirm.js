define(['libs', 'c', 'cUI', 'CommonStore', 'FlightStore', 'FlightModel', 'cBasePageView', buildViewTemplatesPath('seatconfirm.html'), 'cWidgetFactory'], function (libs, c, cUI, CommonStore, FlightStore, FlightModel, BasePageView, html, WidgetFactory) {
    var View;

    var seatSubmitModel = FlightModel.SeatSubmitModel.getInstance(), //选座提交请求
		checkPassengerStore = FlightStore.CheckPassengerStore.getInstance(), //上一页面存入的座位信息store
		checkinParamStore = FlightStore.CheckinParamStore.getInstance(),
		_this = null;
    View = BasePageView.extend({
        tpl: html,
        backUrl: 'selectseat', //返回Url，暂时定为退回index页
        checkinListUrl: 'checkin', //选座成功后跳的Url，暂时定为退回index页
        events: {
            'click #js_return': 'backAction',
            'click .flight-header-action': 'seatSubmitAction'
        },
        ready: function () {
            this.$el.html(this.tpl);
            this.elsBox = {
                seat_info_box: this.$el.find('#seat_info_box'),
                seat_info_tpl: this.$el.find('#seat_info_tpl')
            }
            this.seat_info_fun = _.template(this.elsBox.seat_info_tpl.html()); //座位信息模版函数
        },
        onCreate: function () {
            this.showLoading();
            // this.injectHeaderView();
            this.ready();
        },
        onLoad: function () {
            this.showLoading();
            _this = this;
            //设置HeaderView
            // this.headerview.set({
            //     title: '已选座位确认',
            //     back: true,
            //     view: _this,
            //     btn: { title: '提交', id: 'submit', classname: 'flight-header-action header_r' },
            //     events: {
            //         returnHandler: function () {
            //             _this.back(_this.backUrl);
            //         }
            //     },
            //     commit: {
            //         id: 'submit',
            //         callback: function () {
            //             _this.showLoading();
            //             _this.seatSubmitAction(); //座位提交动作
            //         }
            //     }
            // });
            // this.headerview.show();
            //-------------DataControl数据生成---------------
            DataControl.genData();
            //-------------渲染座位信息容器-----------------
            this.renderSeatInfoBox(DataControl);
            //------------呈现页面，隐藏蒙板----------------
            this.turning();
            this.hideLoading();
        },
        backAction: function() {
            this.back(_this.backUrl);
        },
        onShow: function () {
            this.setTitle('提交座位请求');
        },
        onHide: function () {
            this.elsBox.seat_info_box.empty();
            this.hideLoading();
        },
        //---------------渲染乘客座位信息---------------
        renderSeatInfoBox: function (data) {
            this.elsBox.seat_info_box.html(this.seat_info_fun(data));
        },
        //----------------座位提交动作----------------
        seatSubmitAction: function () {
            this.showLoading();
            //-----------设置请求参数-------------
            seatSubmitModel.setParam('ver', 0);
            seatSubmitModel.setParam('oid', DataControl.daCity.orderId); //订单号
            seatSubmitModel.setParam('fno', DataControl.flightCabin.flightNo); //航班号
            var seatList = [];
            for (var i = 0, len = DataControl.seatInfo.length; i < len; i++) {
                var si = DataControl.seatInfo[i],
					seat = {};
                seat.psgname = si.psgnam;
                if(si.setno){
                    // seat.srowno = si.setno.substring(0, si.setno.length - 1); //座位号
                    // seat.scolno = si.setno.substr(-1); //座位列号：A、B...
                    seat.srowno = parseInt(si.setno) + ''; //座位行号
                    seat.scolno = si.setno.replace(seat.srowno, ''); //座位列号：A、B...
                }else{
                    console.log('si.setno:null 没有座位信息');
                }
                seatList.push(seat);
            }
            seatSubmitModel.setParam('seatlst', seatList); //乘客座位信息
            //--------------开始请求-----------------
            seatSubmitModel.excute(function (data) {
                _this.hideLoading();
                if (data.rc === 1) { //座位提交 成功
                    var successAlert = new c.ui.Alert({
                        title: '提示信息',
                        message: '座位申请中<br/>稍后请登录值机查看预约选座结果',
                        buttons: [{
                            text: '确认',
                            click: function () {
                                _this.back(_this.checkinListUrl); //跳转至值机列表页
                                this.hide();
                            }
                        }]
                    });
                    successAlert.show();
                } else { //座位提交 失败
                    var faildAlert = new c.ui.Alert({
                        title: '提示信息',
                        message: '座位申请失败',
                        buttons: [{
                            text: '返回',
                            click: function () {
                                _this.back(_this.checkinListUrl); //跳转至值机列表页
                                this.hide();
                            }
                        }, {
                            text: '重试',
                            click: function () {
                                _this.back(_this.checkinListUrl); //跳转至值机列表页
                                this.hide();
                            }
                        }]
                    });
                    faildAlert.show();
                }

            }, function (err) {
                _this.hideLoading();
                var errorAlert = new c.ui.Alert({
                    title: '提示信息',
                    message: '座位申请失败',
                    buttons: [{
                        text: '返回',
                        click: function () {
                            _this.back(_this.checkinListUrl); //跳转至值机列表页
                            this.hide();
                        }
                    }, {
                        text: '重试',
                        click: function () {
                            _this.showLoading();
                            _this.seatSubmitAction(); //重新发起请求
                            this.hide();
                        }
                    }]
                });
                errorAlert.show();
            }, false, this);
        }

    });

    var DataControl = {
        daCity: {}, //出发到达城市信息
        flightCabin: {}, //航班舱位信息
        seatInfo: [], //乘客座位信息
        genData: function (data) {
            var checkPassengerData = checkPassengerStore.get();
            if (checkPassengerData) {
            	this.daCity.orderId = checkPassengerData.oid;	//订单号
                this.daCity.dCityName = checkPassengerData.depname; //出发城市
                this.daCity.aCityName = checkPassengerData.arrname; //到达城市
                this.flightCabin.airc = checkPassengerData.airname; //航空公司
                this.flightCabin.flightNo = checkPassengerData.fno; //航班号
                this.flightCabin.cabin = checkPassengerData.cfply; //舱位
                this.seatInfo = checkPassengerData.ciplst || []; //乘客数组
            }
        }
    };

    return View;

});

﻿define(['libs', 'c', 'cUI', 'CommonStore', 'FlightStore', 'FlightModel', 'cBasePageView', buildViewTemplatesPath('checkinselectflight.html'), 'cWidgetFactory'], function (libs, c, cUI, CommonStore, FlightStore, FlightModel, BasePageView, html, WidgetFactory) {
    var View;

    var checkinParamStore = FlightStore.CheckinParamStore.getInstance(),
        checkPassengerStore = FlightStore.CheckPassengerStore.getInstance(),  //值机登机人
        checkinSegmentModel = FlightModel.CheckinSegmentModel.getInstance(), //非携程可值机航班查询请求
        checkinSegmentStore = FlightStore.CheckinSegmentStore.getInstance(), //非携程可值机航班store
        _this = null;

    View = BasePageView.extend({
        tpl: html,
        backUrl: 'checkinbooking', //返回Url
        checkinSeatUrl: 'selectseat', //值机选座Url
        events: {
            'click .flight-zjxzxc': 'forwardCheckinSeat',
            'click #js_return': 'backAction'
        },
        ready: function () {
            this.$el.html(this.tpl);
            this.elsBox = {
                select_flight_box: this.$el.find('#select_flight_box'),
                select_flight_tpl: this.$el.find('#select_flight_tpl')
            }
            this.select_flight_fun = _.template(this.elsBox.select_flight_tpl.html());
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
            //     title: '选择行程',
            //     back: true,
            //     view: _this,
            //     events: {
            //         returnHandler: function () {
            //             checkinSegmentStore.remove();
            //             _this.back(_this.backUrl);
            //         }
            //     }
            // });
            // this.headerview.show();
            //----------------渲染行程列表------------------
            this.renderSelectFlight(function () {
                //------------呈现页面，隐藏蒙板----------------
                _this.turning();
                _this.hideLoading();
            });
        },
        backAction: function () {
            checkinSegmentStore.remove();
            //清空值机stroe
            checkPassengerStore.remove();
            this.back(_this.backUrl);
        },
        onShow: function () {
            this.setTitle('值机选择行程页');

        },
        onHide: function () {
            this.elsBox.select_flight_box.empty();
            this.hideLoading();
        },
        //--------------渲染选择行程页面--------------
        renderSelectFlight: function (cb) {
            //------------生成数据控制的flight数据----------------
            var checkinSegParam = {};
            checkinSegParam.ver = 0;
            checkinSegParam.alcode = checkinParamStore.getAttr('airCode');
            checkinSegParam.ctype = checkinParamStore.getAttr('cardType');
            checkinSegParam.cno = checkinParamStore.getAttr('card');
            checkinSegmentModel.setParam(checkinSegParam);
            //---------------非携程可值机查询请求---------------
            checkinSegmentModel.excute(function (data) {
                DataControl.genFlightData();
                _this.elsBox.select_flight_box.html(_this.select_flight_fun(DataControl));
                cb && cb();
            }, function (err) {
                cb && cb();
            }, false, this);


        },
        //--------------点击flight进入值机座位选座页--------------
        forwardCheckinSeat: function (evt) {
            // checkinSegmentStore.remove();
//            checkinSegmentStore.setAttr('fseglst', [{
//                "acode": "HFE",
//                "aname": "新桥",
//                "dcode": "PVG",
//                "ddate": "2014/5/28 22:00:00",
//                "dname": "浦东",
//                "fno": "MU5467",
//                "pname": "朱富贵",
//                "tno": "781-4894237746"
//            }
//            ]);

            var checkinParamData = checkinParamStore.get(),
                index = evt.currentTarget.dataset.index;
            if (checkinParamData) {
                //reset back url
                var dataset = {
                    "backurl": "checkinselectflight",
                    "ciplst": [{
                        "cno": checkinParamData.card,
                        "ctype": checkinParamData.cardType,
                        "phone": checkinParamData.tel
                    }]
                },
                obj = checkinSegmentStore.getAttr("fseglst")[index];
                if(!obj|| $.isEmptyObject(obj)){
                    console.error("data is error!");
                    return;
                }
                dataset.aacode = obj.acode;
                dataset.dacode = obj.dcode;
                dataset.depdat = obj.ddate;
                dataset.ciplst[0].psgnam = obj.pname;
                dataset.fno = obj.fno;
                dataset.arrname = obj.aname;
                dataset.oid = 0;
                dataset.depname = obj.dname;
                dataset.airname = obj.airname || "";

                checkPassengerStore.set(dataset);
            }

            //ToDo 一些数据处理
            this.showLoading();
            this.forward(this.checkinSeatUrl);
        }

    });

    var DataControl = {
        flightList: [],
        genFlightData: function () {
            this.flightList.length = 0;
            var fData = checkinSegmentStore.get();
//            var fData = JSON.parse('{"fseglst":[{"acode":"HFE","aname":"新桥","dcode":"PVG","ddate":"2014/5/28 22:00:00","dname":"浦东","fno":"MU5467","pname":"朱富贵","tno":"781-4894237746"}],"cno":"320722198805081635","ctype":1,"phone":"18682089631"}');

            if (!fData || !fData.fseglst) {
                return;
            }
            for (var i = 0, len = fData.fseglst.length; i < len; i++) {
                var fs = fData.fseglst[i],
                    f = {};
                f.flightCompany = checkinParamStore.getAttr('airName');
                f.flightDate = fs.ddate ? fs.ddate.split(' ')[0] : '';
                f.flightNo = fs.fno;
                f.dAir = fs.dname;
                f.dTime = (fs.ddate && fs.ddate.split(' ')[1]) ? fs.ddate.split(' ')[1].substring(0, 5) : '';
                f.dTer = ''; //暂不支持出发城市航站楼
                f.aAir = fs.aname;
                f.aTime = '--:--'; //暂不支持到达时间
                f.aTer = ''; //暂不支持到达城市航站楼

                this.flightList.push(f);
            }
        }
    };

    return View;

});

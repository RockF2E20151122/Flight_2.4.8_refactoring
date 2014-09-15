define(['libs', 'c', 'CommonStore', 'FlightModel', 'FlightStore', buildViewTemplatesPath('cabinlist.html')], function (libs, c, CommonStore, FlightModel, FlightStore, html) {
    var cui = c.ui, cBase = c.base, salesStore = CommonStore.SalesObjectStore.getInstance();
    var _this = null;
    var View = c.view.extend({
        pageid: '',
        hasAd: true,
        tpl: html,
        flightSearchSubjoin: FlightStore.FlightSearchSubjoinStore.getInstance(),
        flightSearchStore: FlightStore.FlightSearchStore.getInstance(),
        flightList: FlightModel.FlightListModel.getInstance(),
        flightSelectedStore: FlightStore.FlightSelectedInfo.getInstance(),
        flightOrderStore: FlightStore.FlightOrderInfoStore.getInstance(),
        flightDetailsStore: FlightStore.FlightDetailsStore.getInstance(),
        cabinParamStore: FlightStore.FlightCabinParamStore.getInstance(),
        cabinModel: FlightModel.FlightCabinModel.getInstance(),
        flightSearchStore: FlightStore.FlightSearchStore.getInstance(),
        salesStore: CommonStore.SalesObjectStore.getInstance(),
        flightType: null,
        flightDetailsData: null,
        cabinItems: null,
        render: function () {
            this.viewdata.req = this.request;
            this.$el.html(this.tpl);
            this.els = {
                cabinList: this.$el.find("#cabinList"),
                cabinListTpl: this.$el.find("#cabinListTpl")
            };
            this.cabinListTpl = _.template(this.els.cabinListTpl.html());
        },
        events: {
            'click #js_return': 'backAction',
            'click .flight-list-tablebox': 'cabinItemSelectAction', //选择舱位
            'click js_return': 'returnAction',
            'click .d2': 'rmkAction'
        },

        //首次记载view，创建view
        onCreate: function () {
            //页面需要的静态资源
            this.render();
        },
        //加载数据时
        onLoad: function (refer) {
            _this = this;
            this.updatePage();

        },
        returnAction: function () {
            this.back('bookinginfo');
        },
        //调用turning方法时触发
        onShow: function () {
            this.setTitle('选择舱位');
        },
        onHide: function (toViewName) {
            this.hideLoading();
        },
        /*选择舱位，用所选的舱位替换原先selectFlightStore中舱位的值来实现重新加载机票信息的目的*/
        cabinItemSelectAction: function (e) {
            var self = this;
            var selFlightData = this.flightSelectedStore.get();
            if (!selFlightData) {
                this.showHeadWarning('选择舱位', "由于您长时间未提交订单，数据可能已经过时，请返回重新选择航班", function () {
                    self.backAction();
                    this.hide();
                    self.hideLoading();
                });
            }
            var cur = $(e.currentTarget), target = $(e.target), key = cur.attr('data-key');
            if (target.is('.d2') || target.is('.d2 p') || target.is('.d2 .clr-000')) return;
            var cabin = this.cabinItems.cabins[key];
            var pid = null;
            switch (this.flightType) {
                case 0: //去程
                    var depart = selFlightData.depart;
                    depart.cabin.class = cabin.class;
                    depart.cabin.price = cabin.price;
                    depart.cabin.rebateAmt = cabin.rebateAmt;
                    depart.cabin.productType = cabin.productType;
                    depart.cabin.subClass = cabin.subclass;
                    depart.cabin.pid = cabin.polid;
                    this.flightSelectedStore.setAttr('depart', depart);
                    break;
                case 1: //返程
                    var arrive = selFlightData.arrive;
                    arrive.cabin.class = cabin.class;
                    arrive.cabin.price = cabin.price;
                    arrive.cabin.rebateAmt = cabin.rebateAmt;
                    arrive.cabin.productType = cabin.productType;
                    arrive.cabin.subClass = cabin.subclass;
                    arrive.cabin.pid = cabin.polid;
                    this.flightSelectedStore.setAttr('arrive', arrive);
                    break;
            }

            function getPid(oldPid, newCabin) {
                var pidObj = JSON.parse(oldPid);
                pidObj.price = newCabin.price,
                pidObj.rebate = newCabin.rebate,
                pidObj.grade = "";

                return JSON.stringify(pidObj);
            }

            this.backAction();
        },
        /*回退*/
        backAction: function () {
            this.back('bookinginfo');
        },
        /*查看退改签*/
        rmkAction: function (e) {
            var btn = $(e.currentTarget);
            var pnttips = btn.closest('li').find('.flight-list-tabletips');
            var icon = btn.find('p');

            if (pnttips.hasClass('js_hide')) {
                btn.closest('ul').find('.flight-list-tabletips').not('.js_hide').prev().find('.d2 p').removeClass('flight-arrup');
                btn.closest('ul').find('.flight-list-tabletips').not('.js_hide').prev().find('.d2 p').addClass('flight-arrdown');
                btn.closest('ul').find('.flight-list-tabletips').not('.js_hide').addClass('js_hide');
                icon.removeClass('flight-arrdown');
                icon.addClass('flight-arrup');
                pnttips.removeClass('js_hide');
            }
            else {
                icon.removeClass('flight-arrup');
                icon.addClass('flight-arrdown');
                pnttips.addClass('js_hide');
            }

        },

        /*初始化页面*/
        updatePage: function () {
            this.showLoading();
            var self = this;
            this.flightType = +this.cabinParamStore.getAttr('flightType');
            this.flightDetailsData = this.flightDetailsStore.get();
            var searchInfo = this.flightSearchStore.get();
            if (isNaN(this.flightType) || !this.flightDetailsData || !this.flightDetailsData.items || !this.flightDetailsData.items.length || !searchInfo) {
                this.showHeadWarning('选择舱位', "由于您长时间未提交订单，数据可能已经过时，请返回重新选择航班", function () {
                    self.backAction();
                    this.hide();
                    self.hideLoading();
                });
                return;
            }

            var detailParams = FlightStore.FlightDetailParamStore.getInstance().get();
            var prdid = "";
            if (this.flightType == 0) {
                var len = this.flightDetailsData.items[this.flightType].basicInfo.polid.lastIndexOf('{');
                if (len > 0) {
                    prdid = this.flightDetailsData.items[this.flightType].basicInfo.polid.substring(0, len - 1)
                }
                else {
                    prdid = this.flightDetailsData.items[this.flightType].basicInfo.polid;
                }

            }
            else {
                prdid = this.flightDetailsData.items[this.flightType].basicInfo.polid;
            }
            prdid = JSON.parse(prdid);
            prdid.stype = "L";
            var grade = this.flightDetailsData.items[this.flightType].policy.class; //子舱位grade+价格price作唯一匹配
            this.cabinModel.setParam("polid", detailParams.polid);
            this.cabinModel.setParam("prdid", JSON.stringify(prdid));

            //查询舱位，显示列表
            this.cabinModel.excute(function (data) {
                data._viewBuildSeatTitlt = _this._viewBuildSeatTitlt;
                var _sales = _this.salesStore.get();
                data._sales = _sales;
                _this.cabinItems = data;
                data.price = _this.flightDetailsData.items[this.flightType].policy.price;
                data.grade = grade;
                _this.els.cabinList.html(_this.cabinListTpl(data));
                _this.turning();
                _this.hideLoading();

            },
            function (error) {
                self.showHeadWarning('选择舱位', "查询失败，请返回重新选择", function () {
                    self.backAction();
                    this.hide();
                    self.hideLoading();
                });
            }, false, this);
        },

        renderList: function (data) {
            data._viewBuildSeatTitlt = this._viewBuildSeatTitlt;
            this.cabinItems = data;
            this.els.cabinList.html(this.cabinListTpl(data));
            this.turning();
            this.hideLoading();
        },
        __assert: function () {
            var dcity = this.flightSearchStore.getSearchDetails(0, 'dcityName'),
                acity = this.flightSearchStore.getSearchDetails(0, 'acityName');
            if (!dcity || !acity) {
                this.back('list');
                return false;
            }
            return true;
        },  /** 页面中调用方法 **/
        _viewBuildSeatTitlt: function (classForDisp, classDis) {
            var title;
            var s = (+classDis == 3) ? '头等舱' : (+classDis == 2) ? '公务舱' : '经济舱';
            if (classForDisp == 1) {
                title = '<i class="jGao">高端' + s + '</i>';
            } else if (classForDisp == 2) {
                title = '<i class="jGao">超值' + s + '</i>';
            } else if (classForDisp == 3) {
                title = '<i class="jGao">豪华' + s + '</i>';
            } else if (classForDisp == 4) {
                title = '商务舱';
            } else if (classForDisp == 5) {
                title = '头等舱';
            } else if (classForDisp == 6) {
                title = '经济舱';
            }
            else if (classForDisp == 7) {
                title = '<i >空中' + s + '</i>';
            }

            return title || s;
        }
    });
    return View;
});

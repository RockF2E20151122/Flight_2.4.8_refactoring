define(['libs', 'c', 'FlightModel', 'FlightStore', 'CommonStore', buildViewTemplatesPath('zqinairportselect.html')], function (libs, c, FlightModel, FlightStore, CommonStore, html) {
    var cBase = c.base;
    var View = c.view.extend({
        flightSearchStore: FlightStore.FlightSearchStore.getInstance(),
        flightModel: FlightModel.FlightPickTicketModel.getInstance(),
        flightSelectedStore: FlightStore.FlightSelectedInfo.getInstance(),
        flightStore: FlightStore.zqInAirportSelectStore.getInstance(),
        FlightDetailsStore: FlightStore.FlightDetailsStore.getInstance(),
        airportDeliveryStore: FlightStore.zqInAirportDateAndAddressStore.getInstance(), //航班订单机场自取配送信息
        userStore: CommonStore.UserStore.getInstance(),
        tpl: html,
        pageid: '214032',
        render: function () {
            this.$el.html(this.tpl);
            this.els = {
                listBox: this.$el.find('#cbox2'),
                listTpl: this.$el.find('#address-list2')
            };
            this.temFun = _.template(this.els.listTpl.html());
        },
        events: {
            'click .light': 'selectAddr',
            'click #js_return': 'goBack'
        },
        goBack: function () {
            this.forward('bookinginfo');
        },
        returnAddrs: function (arr, tp) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].type === tp) {
                    return arr[i].addrs;
                }
            }
        },
        selectAddr: function (e) {
            $('.light').removeClass('current');
            $(e.currentTarget).addClass('current');
            var dcity = this.flightSearchStore.getSearchDetails(0, 'dCtyCode');
            var acity = this.flightSearchStore.getSearchDetails(0, 'aCtyCode');
            var citykey = dcity + acity;
            this.flightStore.set({
                address: $.trim($(e.currentTarget).find('.address').text()),
                btime: $(e.currentTarget).find('.btime').text(),
                etime: $(e.currentTarget).find('.etime').text(),
                dstr: $(e.currentTarget).find('.dstr').text(),
                ext: $(e.currentTarget).find('.ext').text(),
                fee: $(e.currentTarget).find('.fee').text(),
                flag: $(e.currentTarget).find('.flag').text(),
                id: $(e.currentTarget).find('.id').text(),
                port: $(e.currentTarget).find('.port').text(),
                rule: $(e.currentTarget).find('.rule').text(),
                site: $(e.currentTarget).find('.site').text(),
                index: $(e.currentTarget).find('.index').text()
            }, citykey);
            if (this.airportDeliveryStore.get()) {
                this.airportDeliveryStore.setAttr('time', null);
            }
           
            this.forward('bookinginfo');
        },
        buildParam: function () {
            var selected = this.flightSelectedStore.get(),
                searchInfo = this.flightSearchStore.get();
            if (!selected) {
                this.showMessage('操作已超时,请重新选择航班');
                var self = this;
                window.setTimeout(function () {
                    self.back();
                }, 2000);
                return;
            }
            var param = {};
            param.ticketIssueCty = searchInfo.items[0].dCtyCode;
            param.tripType = searchInfo.tripType;
            param.ver = 0;
            var items = [{
                aCty: searchInfo.items[0].aCtyCode,
                dCty: searchInfo.items[0].dCtyCode,
                class: 0,
                dDate: searchInfo.items[0].date,
                flightNo: selected.depart.flight.flightNo,
                price: selected.depart.cabin.price,
                productType: selected.depart.cabin.productType,
                subClass: selected.depart.cabin.subClass
            }];
            if (param.tripType == 2 && searchInfo.items[1]) {
                items.push({
                    aCty: searchInfo.items[1].aCtyCode,
                    dCty: searchInfo.items[1].dCtyCode,
                    class: 0,
                    dDate: searchInfo.items[1].date,
                    flightNo: selected.arrive.flight.flightNo,
                    price: selected.arrive.cabin.price,
                    productType: selected.arrive.cabin.productType,
                    subClass: selected.arrive.cabin.subClass
                });
            }
            param.items = items;
            return param;
        },
        getAddress: function () {
            this.flightModel.setParam(this.buildParam());

            var self = this;
            this.showLoading();

            this.flightModel.excute(function (data) {
                self.hideLoading();
                self.els.listBox.empty();
                self.appendList(data);
            }, function () {
                this.showMessage('啊哦,可能网络有点问题,加载出错喽,重新来过吧,亲!');
                this.hideLoading();
                this.turning();
            }, false, this);
        },
        appendList: function (data) {
            if (data.deliveries.length > 0) {
                var data = this.returnAddrs(data.deliveries, 16);
                if (data) {
                    for (var j = 0; j < data.length; j++) {
                        var insurances = this.FlightDetailsStore.get();
                        //选中的状态勾选中 modify by zhengkw 2014-08-14
                        var item = this.temFun({ datas: data[j], insurance: insurances, index: j, selectindex: this.flightStore.getAttr("index") ? this.flightStore.getAttr("index") : 1 });
                        this.els.listBox.append(item);
                    }
                }
            }
            this.turning();
        },
        onCreate: function () {
            this.render();
        },
        onLoad: function () {

            this.getAddress();
        },
        onShow: function () { },
        onHide: function () { }
    });
    return View;
});

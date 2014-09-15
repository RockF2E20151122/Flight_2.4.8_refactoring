define(['libs', 'c', 'FlightModel', 'FlightStore', 'CommonStore', buildViewTemplatesPath('zqincityselect.html')], function (libs, c, FlightModel, FlightStore, CommonStore, html) {
    var cBase = c.base;
    var View = c.view.extend({
        flightModel: FlightModel.zqAddressSelectModel.getInstance(),
        flightSearchStore: FlightStore.FlightSearchStore.getInstance(),
        inCitySelectStore: FlightStore.zqInCitySelectStore.getInstance(),
        flightSelectedStore: FlightStore.FlightSelectedInfo.getInstance(),
        zqInCityDateAndAddressStore: FlightStore.zqInCityDateAndAddressStore.getInstance(),
        flightSelectedStore: FlightStore.FlightSelectedInfo.getInstance(),
        dateStorage: FlightStore.zqInCityDateStore.getInstance(),
        userStore: CommonStore.UserStore.getInstance(),
        FlightDetailsStore: FlightStore.FlightDetailsStore.getInstance(),
        deliveries: [],
        pageid: '214039',
        tpl: html,
        render: function () {
            this.$el.html(this.tpl);
            this.els = {
                listBox: this.$el.find('#cfbox'),
                listTpl: this.$el.find('#address-list')
            };
            this.temFun = _.template(this.els.listTpl.html());
        },
        returnAddrs: function (arr, tp) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].type === tp) {
                    return arr[i].addrs;
                }
            }
        },
        events: {
            'click .light': 'selectAddr',
            'click #js_return': 'goBack'
        },
        goBack: function () {
            this.back('zqincity');
        },
        selectAddr: function (e) {
            $('.light').removeClass('current');
            var dom = $(e.currentTarget);
            var dataId = dom.attr('data_id');
            for (var i = 0, ln = this.deliveries.length; i < ln; i++) {
                var obj = this.deliveries[i];
                if (dataId == obj.id) {
                    obj["address"] = obj["name"];
                    this.inCitySelectStore.set(obj, this.flightCode);
                    break;
                }
            }
            dom.addClass('current');
            this.forward('zqInCity');
        },
        getAddress: function () {
            var self = this;
            this.showLoading();
            this.flightModel.excute(function (data) {
                self.els.listBox.empty();
                self.appendList(data);
            }, function () {
                this.showMessage('啊哦,可能网络有点问题,加载出错喽,重新来过吧,亲!');
                this.hideLoading();
            }, false, this);
        },
        appendList: function (data) {
            if (data.deliveries && data.deliveries.length > 0) {
                var data = this.returnAddrs(data.deliveries, 8);
                if (data) {
                    var insurances = this.FlightDetailsStore.get();
                    for (var j = 0; j < data.length; j++) {
                        var item = this.temFun({ datas: data[j], insurance: insurances });
                        this.els.listBox.append(item);
                    }
                    this.deliveries = data;
                }
            }
            this.hideLoading();
        },
        onCreate: function () {
            this.render();
        },
        onLoad: function () {
            var selinfo = this.flightSelectedStore.get().depart;
            this.flightCode = selinfo.flight.flightNo + selinfo.cabin.price;
            this.turning();
            this.getAddress();
        },
        onShow: function () { },
        onHide: function () { }
    });
    return View;
});
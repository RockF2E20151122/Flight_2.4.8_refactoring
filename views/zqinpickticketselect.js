define(['libs', 'c', 'FlightModel', 'FlightStore', buildViewTemplatesPath('zqinpickticketselect.html')], function (libs, c, FlightModel, FlightStore, html) {
    var cui = c.ui, cBase = c.base;
    var View = c.view.extend({
        pageid: '214037',
        tpl: html,
        calendar: null,
        curTab: 1,
        flightPickTicketModel: FlightModel.FlightPickTicketModel.getInstance(),
        flightPickTicketSelectStore: FlightStore.FlightPickTicketSelectStore.getInstance(),
        flightSelectedStore: FlightStore.FlightSelectedInfo.getInstance(),
        flightSearchStore: FlightStore.FlightSearchStore.getInstance(),
        render: function () {
            this.viewdata.req = this.request;
            this.els = {};
            this.htmltplfun = _.template(this.tpl);
        },
        events: {
            'click #js_return': 'backAction',
            'click #js_listbox li': 'tapItemAction'
        },
        backAction: function () {
            this.back('bookinginfo');
        },
        /*选择配送方式*/
        tapItemAction: function (e) {
            var cur = $(e.currentTarget),
                type = cur.data('type');
            switch (type) {
                case 1:
                    cur.siblings('li').removeClass('current');
                    cur.addClass('current');
                    this.flightPickTicketSelectStore.setAttr('type', type);
                    this.back('bookinginfo');
                    break;
                case 2:
                    this.forward('postinfo');
                    break;
                case 8:
                    this.forward('zqincity');
                    break;
                case 16:
                    this.forward('zqinairport');
                    break;
            }
        },
        buildParam: function () {
            var selected = this.flightSelectedStore.get(),searchInfo = this.flightSearchStore.get();
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
        updatePage: function (callback) {
            var param = this.buildParam();
            var selected = this.flightPickTicketSelectStore.get() || { type: 1 };
            this.flightPickTicketModel.setParam(param);
            this.flightPickTicketModel.excute(function (data) {
                var items = this.getCurrentItems(data);
                this.randerPage({ items: items, selected: selected });
                callback.call(this);
            }, function (e) {
                if (e && e.msg) {
                    this.showToast(e.msg, 2);
                } else {
                    this.showToast('数据加载失败', 2);
                }
            }, false, this);

        },
        getCurrentItems: function (data) {
            var d = data.deliveries || [], result = {};
            for (var i = 0, len = d.length; i < len; i++) {
                result[d[i].type] = d[i];
            }
            return result;
        },
        randerPage: function (data) {
            this.$el.html(this.htmltplfun(data));
        },
        //首次记载view，创建view
        onCreate: function () {
            this.render();
        },
        //加载数据时
        onLoad: function () {
            this.showLoading();
            this.updatePage(function () {
                this.hideLoading();
                this.turning();
            });
        },
        //调用turning方法时触发
        onShow: function () {
            this.setTitle('选择配送方式');
        },
        onHide: function () {}
    });
    return View;
});
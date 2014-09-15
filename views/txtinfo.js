define(['libs', 'c', 'FlightStore', buildViewTemplatesPath('txtinfo.html')], function (libs, c, FlightStore, html) {
    var View = c.view.extend({
        tpl: html,
		oPageType: 0,
		passPageTypeStore : FlightStore.passPageTypeStore.getInstance(),
        render: function () {
            this.viewdata.req = this.request;
            this.$el.html(this.tpl);
            this.elsBox = {
                p_txtInfo_wrap: this.$el.find('#p_txtInfo_wrap'),
                p_txtInfo_tpl: this.$el.find('#p_txtInfo_tpl')
            };
            this.elHTML = _.template(this.elsBox.p_txtInfo_tpl.html())
        },
        events: {
            'click #js_return': 'backAction',
        },
        //首次记载view，创建view
        onCreate: function () {
            this.render();
        },
        //加载数据时
        onLoad: function () {
			this.oPageType = +this.passPageTypeStore.getAttr('type') || 0;
            this.elsBox.p_txtInfo_wrap.html(this.elHTML({type: this.oPageType}));
            this.turning();
        },
        //调用turning方法时触发
        onShow: function () {
            this.hideLoading();
        },
        //
        onHide: function () {},
        backAction: function () {
            this.showLoading();
            this.back('#passengeredit');
        }
    });
    return View;
});
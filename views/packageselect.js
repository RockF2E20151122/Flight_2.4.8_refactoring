define(['libs', 'c', 'CommonStore', 'FlightModel', 'FlightStore', 'CPageStore', buildViewTemplatesPath('packageselect.html')], function (libs, c, CommonStore, FlightModel, FlightStore, CPageStore, html) {
    var cui = c.ui, cBase = c.base, salesStore = CommonStore.SalesObjectStore.getInstance();
    var _this = null;
    var View = c.view.extend({
        pageid: '',
        hasAd: true,
        tpl: html,
        userStore: CommonStore.UserStore.getInstance(), //用户信息
        flightDetailsStore: FlightStore.FlightDetailsStore.getInstance(),
        passengerQueryStore: CPageStore.passengerQueryStore.getInstance(), //用户选择的登机人
        packageSelectStore: FlightStore.PackageSelectStore.getInstance(),
        render: function () {
            this.viewdata.req = this.request;
            this.$el.html(this.tpl);
            this.els = {
                packagelist: this.$el.find("#packageList"),
                packagetmp: this.$el.find("#packageTmp")
            };
            this.packagetmpfun = _.template(this.els.packagetmp.html());
        },
        events: {
            'click #js_return': 'backAction',
            'click .flight-list-table2 li': 'packageSelectAction', //选择舱位
            'click #liping': 'lipingAction',
            'click #insure': 'insureAction'
        },

        //首次记载view，创建view
        onCreate: function () {
            //页面需要的静态资源
            this.render();
        },
        //加载数据时
        onLoad: function (refer) {
            _this = this;
            if (!this.uid) {
                if (this.userStore.isLogin()) {
                    var user = this.userStore.getUser();
                    this.uid = user.UserID;
                } else {
                    this.uid = c.utility.getGuid();
                }
            }
            this.updatePage();

        },
        returnAction: function () {
            this.back('bookinginfo');
        },
        //调用turning方法时触发
        onShow: function () {
            this.hideLoading();
        },
        onHide: function (toViewName) {
            this.hideLoading();
        },
        /*选择套餐*/
        packageSelectAction: function (e) {
            var target = $(e.currentTarget);
            if (!target.hasClass('selected')) {
                $(".flight-list-table2 li").removeClass("selected");
                target.addClass('selected');
                this.packageSelectStore.setAttr('pkgtype', +target.data('type'), this.uid)
            }
            this.backAction();
        },
        /*回退*/
        backAction: function () {
            this.back('bookinginfo');
        },
        /*查看礼品卡说明*/
        lipingAction: function (e) {
            var url = $(e.target).data('url');
            this.forward("liping")
        },
        /*查看保险说明*/
        insureAction: function (e) {
            var url = $(e.target).data('url');
            this.jump(url);
        },

        /*初始化页面*/
        updatePage: function () {
            this.showLoading();
            var detailData = this.flightDetailsStore.get();
            detailData.selCount = this.passengerQueryStore.getAttr('validSelCount');
            detailData.pkgtype = this.packageSelectStore.getAttr('pkgtype', this.uid);
            if (detailData) {
                this.els.packagelist.html(this.packagetmpfun(detailData));
            }
            this.turning();
        }
    });
    return View;
});

define(['libs', 'c', 'cBasePageView', 'CommonStore', 'FlightModel', 'FlightStore', buildViewTemplatesPath('checkin.html')], function (libs, c, cBasePageView, CommonStore, FlightModel, FlightStore, html) {
    var cui = c.ui, cBase = c.base, salesStore = CommonStore.SalesObjectStore.getInstance,
    userStore = CommonStore.UserStore.getInstance(), //用户信息
    userInfo = userStore ? userStore.getUser() : null,
    checkinListModel = FlightModel.CheckinListModel.getInstance(),
    checkinListStore = FlightStore.CheckinListStore.getInstance(),
    checkPassengerStore = FlightStore.CheckPassengerStore.getInstance(),
    _this = null;
    var View = cBasePageView.extend({
        pageid: '',
        tpl: html,
        render: function () {
            this.viewdata.req = this.request;
            this.$el.html(this.tpl);
            this.els = {
                cabinList: this.$el.find("#cabinList")
            };

        },
        events: {
            'click #NoLogin': 'NoLogin',
            'click #Login': 'Login', //选择舱位
            'click .flight-footer li': 'ToNextPage',//底部跳转
            'click #js_return': 'backAction'
        },

        //首次记载view，创建view
        onCreate: function () {
            //页面需要的静态资源
            this.render();
            //this.injectHeaderView();
        },
        //加载数据时
        onLoad: function (refer) {
            _this = this;
            this.showLoading();
//            //设置表头内容
//            this.headerview.set({
//                title: '值机', //表头内容
//                back: true, //是否有返回按钮
//                events: {
//                    returnHandler: $.proxy(_this.backAction, _this)
//                }

//            });
//            this.headerview.show();
            if (userStore.isLogin()) {
                checkinListModel.excute(function (data) {
                    if (data.fcinfos && data.fcinfos.length) {
                        this.forward("#CheckInList");

                    }
                    else {
                        checkPassengerStore.remove();
                        this.forward("#checkinbooking");

                    }

                }, function (e) {
                    _this.hideLoading();
                    _this.back("index");
                }, true, this);

            }
            else {
                _this.hideLoading();
                _this.turning();
            }
        },
        //调用turning方法时触发
        onShow: function () {


        },
        onHide: function (toViewName) {
            this.hideLoading();

        },
        /*回退*/
        backAction: function () {
            this.jump('/html5/');

        },
        /*非会员办理*/
        NoLogin: function () {
            checkPassengerStore.remove();
            this.forward('checkinbooking');

        },
        /*会员登录*/
        Login: function () {
            this.showLoading();
            window.location.href = '/webapp/myctrip/#account/login?t=1&from=' + encodeURIComponent(this.getRoot() + '#checkin');


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

        }
    });
    return View;
});

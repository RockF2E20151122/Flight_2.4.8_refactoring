define(['libs', 'c', 'CommonStore', 'CPageModel', 'CPageStore', 'cBasePageView', buildViewTemplatesPath('addpostprovince.html')], function (libs, c, cs, CPageModel, CPageStore, BasePageView, viewhtml) {
    //用户Store
    var userStore = cs.UserStore.getInstance(),
        postCityStore = CPageStore.PostCityStore.getInstance(),
        postCityModel = CPageModel.PostCityModel.getInstance(),
        selAddrStore = CPageStore.SelectAddrStore.getInstance();
    var View = BasePageView.extend({
        render: function () {
            this.$el.html(viewhtml);
            this.els = {
                addr_list: this.$el.find('#p_add_wrap'),
                addr_list_tpl: this.$el.find('#p_add_tpl')
            };
            this.elHTML = _.template(this.els.addr_list_tpl.html());
        },
        updatePage: function (complete) {
            var self = this;
            var data = postCityStore.get();
            if (!data) {
                this.showLoading();
                postCityModel.excute(function (data) {
                    postCityStore.set(data)
                    complete.call(self);
                }, function (e) {
                    this.showMessage('网络连接失败,请稍候重试')
                    this.hideLoading();
                }, true, this);
            } else {
                complete.call(this);
            }
        },

        forwardAction: function (e) {
            var $cityDiv = $(e.currentTarget).find('.city-group-title');
            var oldPrvnId = selAddrStore.getAttr('prvnId', this.uid);
            var prvnId = $cityDiv.attr('data-prvnid'),
                prvnname = $cityDiv.attr('data-prvnname');
            //选中省改变时，把市县数据清空
            if (oldPrvnId != 0 && oldPrvnId != prvnId) {
                selAddrStore.rollback(['prvnId', 'prvnName', 'prvn', 'ctyId', 'ctyName', 'cty', 'dstrId', 'dstrName', 'dstr']);
                selAddrStore.setAttr('ctyId', "", this.uid);
                selAddrStore.setAttr('ctyName', "", this.uid);
                selAddrStore.setAttr('cty', "", this.uid);
                selAddrStore.setAttr('dstrId', "", this.uid);
                selAddrStore.setAttr('dstrName', "", this.uid);
                selAddrStore.setAttr('dstr', "", this.uid);
            }
            selAddrStore.setAttr('prvnId', prvnId, this.uid);
            selAddrStore.setAttr('prvnName', prvnname, this.uid);
            selAddrStore.setAttr('prvn', prvnname, this.uid);
            this.forward('addpostcity');
        },
        onBack: function () {
            this.data = {};
            var from = selAddrStore.getAttr("from", this.uid);
            selAddrStore.setAttr('from', "", this.uid);
            selAddrStore.rollback(['prvnId', 'prvnName', 'prvn', 'ctyId', 'ctyName', 'cty', 'dstrId', 'dstrName', 'dstr']);
            this.back('bookinginfo');
            // //add标题头手动隐藏 wyren@ctrip.com 2014-4-2
            // $('#headerview').hide();

            /*if (from == "transfer") {
            this.jump('/webapp/myctrip/#account/transfer');
            } else if (from == "flight.bookinginfo") {
            this.jump('/webapp/flight/#bookinginfo');
            } else {
            this.back('addressinfo');
            }*/

        },
        loadUser: function () {
            if (!this.uid) {
                if (userStore.isLogin()) {
                    var user = userStore.getUser();
                    this.uid = user.UserID;
                } else {
                    this.uid = c.utility.getGuid();
                }
            }
        },
        events: {
            'click li.cityli': 'forwardAction',
            'click #js_province_return':'onBack'
        },
        onCreate: function () {
            //this.injectHeaderView();
            this.render();
        },
        //数据加载阶段
        onLoad: function () {
            var self = this;
            this.loadUser();
            //对HeaderView设置数据
            // this.headerview.set({
            //     title: '选择所在地区',
            //     back: true,
            //     view: self,
            //     events: {
            //         returnHandler: $.proxy(self.onBack, self)
            //     }
            // });
            // this.headerview.show();
            // //add标题头手动显示 wyren@ctrip.com 2014-4-2
            // $('#headerview').show();
            this.updatePage(function () {
                var data = postCityStore.get();
                var rdata = {
                    'cityData': data,
                    'curPrvnName': selAddrStore.getAttr('prvnName', this.uid) || 0
                };
                this.hideLoading();
                this.els.addr_list.html(this.elHTML(rdata));
                this.changePvnFlag = false;
                this.turning();
            });
        },
        //调用turning方法时触发
        onShow: function () { },
        onHide: function () { this.hideLoading(); }
    });
    return View;
});
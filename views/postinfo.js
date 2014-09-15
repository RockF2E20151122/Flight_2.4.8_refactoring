/**
 * 邮寄地址
 */
define(['libs', 'c', 'CommonStore', 'FlightModel', 'FlightStore', 'CPageModel', 'CPageStore', buildViewTemplatesPath('postinfo.html')], function (libs, c, cs, m, s, CPageModel, CPageStore, html) {
    //od add 用户需点击完成以后才会更新配送方式
    var TYPE = 2;
    var View = c.view.extend({
        tpl: html,
        pageid: '214033',
        uid: "",
        //用户Store
        userStore: cs.UserStore.getInstance(),
        //选择地址Store
        addrStore: CPageStore.CustomerAddrStore.getInstance(),
		addressStore : CPageStore.AddressStore.getInstance(),

        flightPickTicketSelectStore: s.FlightPickTicketSelectStore.getInstance(),
        render: function () {
            this.viewdata.req = this.request;
            this.$el.html(this.tpl);
            this.els = {
                post_info: this.$el.find('.cont_pd_wrap'),
                post_info_tpl: this.$el.find('#post_info_tpl')
            };
            this.elHTML = _.template(this.els.post_info_tpl.html())
        },
        events: {
            'click #confirm': 'confirmInfo',
            'click #js_return': 'backAction',
            'click .js_arr_r': 'getAddrList'
        },
        onCreate: function () {
            if (!this.uid) {
                if (this.userStore.isLogin()) {
                    var user = this.userStore.getUser();
                    this.uid = user.UserID;
                } else {
                    this.uid = c.utility.getGuid();
                }
            }
            this.render();
        },
        //数据加载阶段
        onLoad: function () {
            var data = this.addrStore.get(this.uid);
            if (data.inforId == 0) {
                data.clazz = 'm_colorb';
            } else {
                data.clazz = '';
            }
            this.els.post_info.html(this.elHTML(data));
            this.turning();
        },
        //调用turning方法时触发
        onShow: function () {
            this.setTitle('邮寄报销凭证');
        },
        onHide: function () {},
        confirmInfo: function () {
            var param = this.addrStore.get(this.uid);
            //如果已选择地址为空,提醒选择
            if (param.inforId == 0 ) {
                this.showMessage('请填写收件人信息');
                return;
            }
            if (!param.prvnName || !param.ctyName || !param.dstrName || !param.zip) {
                this.showMessage('请完善收件人信息');
                return;
            }
            this.flightPickTicketSelectStore.setAttr('type', TYPE);
            this.back('#bookinginfo');
        },
        /**
        * 去地址选择页面
        */
        getAddrList: function () {
            var self = this;
            this.showLoading();
            //如果已登录,从server取地址列表
            /*this.passPageTypeStore.setAttr('type',1);
			this.addrStore.setAttr('opr', '4', this.uid);
			*/
			
			this.addressStore.setCurrent(this.uid, { success: '/webapp/flight/#postinfo', defeated: '/webapp/flight/#postinfo' }, 'CustomerAddrStore:setAddr', 'CustomerAddrStore:get');
						

			this.jump('/webapp/cpage/index.html#addresslist')
        },
        
        //返回
        backAction: function () {
            this.back('#zqinpickticketselect');
        }
    });
    return View;
});
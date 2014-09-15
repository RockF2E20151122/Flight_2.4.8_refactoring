/// <summary>
/// 值机协议页 creator:wyren; createtime:2014-05-4
/// </summary>
define(['libs', 'c', 'cUI', 'CommonStore', 'FlightStore', 'FlightModel', 'cBasePageView', buildViewTemplatesPath('checkinprotocol.html'), 'cWidgetFactory'], function (libs, c, cUI, CommonStore, FlightStore, FlightModel, BasePageView, html, WidgetFactory) {
    var View;
    var userStore = CommonStore.UserStore.getInstance(), //用户信息
    userInfo = userStore ? userStore.getUser() : null;
    var checkinSearchModel = FlightModel.CheckinSearchModel.getInstance(), //值机查询Model
    //invoiceType: 0-值机协议；1-值机须知；2-危险品公告
	 	checkinParamStore = FlightStore.CheckinParamStore.getInstance(), //值机查询参数Store
    // checkinResultStore = FlightStore.CheckinResultStore.getInstance(), //值机查询结果Store
		_this = null;

    View = BasePageView.extend({
        tpl: html,
        backUrl: 'checkinbooking', //退回到值机填写页
        title: '', //页面的抬头显示的标题
        checkinParamData: null,
        events: {
            'click #js_return': 'backAction'
        },
        ready: function () {
            this.$el.html(this.tpl);
            this.elsBox = {
                checkin_show_box: this.$el.find('#checkin_show_box'),
                checkin_protocol_tpl: this.$el.find('#checkin_protocol_tpl'),
                checkin_notice_tpl: this.$el.find('#checkin_notice_tpl'),
                dangerous_notice_tpl: this.$el.find('#dangerous_notice_tpl')
            }
            this.checkin_protocol_fun = _.template(this.elsBox.checkin_protocol_tpl.html());
            this.checkin_notice_fun = _.template(this.elsBox.checkin_notice_tpl.html());
            this.dangerous_notice_fun = _.template(this.elsBox.dangerous_notice_tpl.html());
        },
        onCreate: function () {
            this.showLoading();
            // this.injectHeaderView();
            this.ready();
        },
        onLoad: function () {
            this.showLoading();
            _this = this;
            //根据是否会员切换不同的契约地址
            checkinSearchModel.url = userStore.isLogin() ? "/Flight/Domestic/CheckIn/AircraftRulesSearch" : "/Flight/Domestic/CheckIn/NonMemberAircraftRulesSearch";
            this.checkinParamData = checkinParamStore.get() || { noticeType: -1 };
            switch (this.checkinParamData.noticeType) {
                case 0:
                    this.title = '值机协议';
                    break;
                case 1:
                    this.title = '值机须知';
                    break;
                case 2:
                    this.title = '危险品公告';
                    break;
                default:
                    break;
            }
            this.$el.find('.flight-header h1').html(this.title);
            //设置HeaderView
            // this.headerview.set({
            // 	title:this.title,
            // 	back:true,
            // 	home:false,
            // 	view:_this,
            // 	events:{
            // 	    returnHandler: function () {
            // 	        _this.back(_this.backUrl); 
            //             }
            // 	}
            // });
            // this.headerview.show();
            //
            this.renderCheckinbox(function () {
                //呈现页面，隐藏蒙板
                _this.turning();
                _this.hideLoading();
            });
        },
        backAction: function () {
            this.back(_this.backUrl);
        },
        renderCheckinbox: function (cb) {
            if (this.checkinParamData.noticeType === 0) { //值机协议
                checkinSearchModel.setParam(this.checkinParamData);
                checkinSearchModel.excute(function (data) {
                    if (data.aplst.length) {
                        this.elsBox.checkin_show_box.html(this.checkin_protocol_fun({ 'agrnt': data.aplst[0].agrnt.replace(/\n/g, "</br>") }));
                    }
                    cb && cb();
                }, function (err) {
                    cb && cb();
                }, false, this);

            } else if (this.checkinParamData.noticeType === 1) { //值机须知
                this.elsBox.checkin_show_box.html(this.checkin_notice_fun({}));
                cb && cb();
            } else if (this.checkinParamData.noticeType === 2) { //危险品公告
                this.elsBox.checkin_show_box.html(this.dangerous_notice_fun({}));
                cb && cb();
            } else {
                var headwarning = new c.ui.HeadWarning();
                headwarning.setTitle('提示信息', '哎呀，数据出错了！', function () {
                    _this.back(_this.backUrl);
                });
                headwarning.show(); //显示插件
            }
        },
        onShow: function () {
            this.setTitle(this.title);
        },
        onHide: function () {
            this.elsBox.checkin_show_box.empty();
            this.hideLoading();
        }
    });

    return View;
});

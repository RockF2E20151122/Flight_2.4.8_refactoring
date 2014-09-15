define(['libs', 'c', 'cUI', 'CommonStore', 'FlightStore', 'FlightModel', 'cBasePageView', buildViewTemplatesPath('checkinsuccess.html'), 'cWidgetFactory'], function(libs, c, cUI, CommonStore, FlightStore, FlightModel, BasePageView, html, WidgetFactory) {
	var View;

	var checkPassengerStore = FlightStore.CheckPassengerStore.getInstance(), 
        _this = null;
	View = BasePageView.extend({
		tpl: html,
		checkinListUrl: 'CheckInList', //暂时定为退回index页
		events: {
			'click .flight-zjtable3': 'jumpCheckinList',
			'click #js_return': 'backAction'
		},
		ready: function() {
			this.$el.html(this.tpl);
			this.elsBox = {
				checkin_success_box: this.$el.find('#checkin_success_box'),
				checkin_success_tpl: this.$el.find('#checkin_success_tpl')
			}
			this.checkin_success_fun = _.template(this.elsBox.checkin_success_tpl.html()); //值机成功模版函数
		},
		onCreate: function() {
			this.showLoading();
        	// this.injectHeaderView();
			this.ready();
		},
		onLoad: function() {
			this.showLoading();
			_this = this;
			//设置HeaderView
			// this.headerview.set({
   //              title: '值机成功',
   //              back: true,
   //              view: _this,
			// 	events: {
			// 		returnHandler: function() {
			// 		    _this.back(_this.checkinListUrl);
			// 		}
			// 	}
			// });
			// this.headerview.show();
			//------------渲染值机成功页面----------------
			this.renderSuccessBox();
			//------------呈现页面，隐藏蒙板----------------
			this.turning();
			this.hideLoading();
		},
		backAction: function() {
			this.back(this.checkinListUrl);
		},
		onShow: function() {
			this.setTitle('值机成功页');
		},
		onHide: function() {
			this.elsBox.checkin_success_box.empty();
        	this.hideLoading();
		},
		//--------------点击航班详情，跳转值机列表页--------------
     	renderSuccessBox: function () {
        	var checkPassengerData = checkPassengerStore.get(),
				data={};
			data.flightCompany = checkPassengerData.airname; //航空公司
			data.flightNo = checkPassengerData.fno; //航班号
			//data.cabin = checkPassengerData.cfply; //舱位
			data.passengerName = checkPassengerData.ciplst[0].psgnam; //乘客名
			data.currSpace = checkPassengerData.ciplst[0].currentSpace; //上(U)下(M)舱
			data.seatNo = checkPassengerData.ciplst[0].setno; //座位号
			data.cattion = checkPassengerData.cattion; //温馨提示
			this.elsBox.checkin_success_box.html(this.checkin_success_fun(data));
		},
		//--------------点击航班详情，跳转值机列表页--------------
		jumpCheckinList:function(){
			this.forward(this.checkinListUrl);
		}

	});

	return View;

});

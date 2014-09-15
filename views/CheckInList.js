define(['libs', 'c', 'CommonStore', 'FlightStore', 'FlightModel', 'cMultipleDate', 'cBasePageView', buildViewTemplatesPath('CheckInList.html'), 'cUtility', 'cWidgetFactory', 'cWidgetGuider'], function (libs, c, CommonStore, FlightStore, FlightModel, cMultipleDate, BasePageView, html, cUtility, WidgetFactory) {
	var _this = null,
		sBackUrl = "/webapp/flight/index.html#index",
		CheckinSearchModel = FlightModel.CheckinSearchModel.getInstance(),
		CheckinListModel = FlightModel.CheckinListModel.getInstance(),
		CheckinSearchParamStore = FlightStore.CheckinSearchParamStore.getInstance(),
		CheckinListStore = FlightStore.CheckinListStore.getInstance(),
		CheckInCancelSubmitModel = FlightModel.CheckInCancelSubmitModel.getInstance(),	//取消值机 Model
		CheckPassengerStore = FlightStore.CheckPassengerStore.getInstance(),			//单条订单及单条乘客信息 
		CancelCheckResultStore = FlightStore.CancelCheckResultStore.getInstance()
		
		
    var View = BasePageView.extend({
        tpl: html,		
        render: function () {
            this.viewdata.req = this.request;
			
            this.$el.html(this.tpl);
			
            this.elsBox = {
                list_wrap: this.$el.find('#list_wrap'),
                list_tpl: this.$el.find('#list_tpl')
            };
            this.elHTML = _.template(this.elsBox.list_tpl.html())
			
			
        },
		
		showView: function () {
            
           
			this.showLoading();
			if(CancelCheckResultStore.getAttr("rc") === 0){			//取消成功
				CancelCheckResultStore.remove();
				this.showMessage("已取消值机");
				
			}else if(CancelCheckResultStore.getAttr("rc") === 1){		//取消失败
				CancelCheckResultStore.remove();
				this.showToast("取消失败")
			}
			
			
			CheckinListModel.excute(function (data) {
				this.hideLoading();
				this.hideWarning404();
				
				if(data.fcinfos && data.fcinfos.length > 0){
					data.cDate = c.base.Date;
					
					this.elsBox.list_wrap.html(this.elHTML(data));
					this.turning();
				}else{
					
					this.showHeadWarning("值机","您还没有数据哦",function(){
						this.hide();
					})
					
				}
				
				
            }, function (err) {
			
				this.hideLoading();
				var msg = err.msg ? err.msg : '啊哦,数据加载出错了!';
				
				this.showHeadWarning("值机", msg, function(){
					this.hide();
				})
				
            }, true, this);
            
        },
        events: {
            'click .js_flight_tab li': 'flightTapAction',
            'click #js_return': 'backAction',
			'click span.js_checkin_btn' : 'checkInAction',
			'click span.js_checkout_btn' : 'checkOutAction',
			'click .js_unctripcheck_btn' : 'unCtripCheckAction'
        },
        //首次记载view，创建view
        onCreate: function () {	
			_this = this;
			
            this.render();
			
			
        },
        //加载数据时
        onLoad: function () {
			
			
            this.showView();
        },
		backAction: function(){
			var backurl = CancelCheckResultStore.getAttr("backurl")
			if(backurl){
				this.jump(backurl)
			}else{
				this.back("index");
			}
			
		},
        //调用turning方法时触发
        onShow: function () {
			this.setTitle("值机");
            this.hideLoading();
        },
		flightTapAction:function(e){			//底部tap跳转
			var cur = $(e.currentTarget), type = cur.data('type');
			
			 switch (type) {
                case 'index':
					this.jump(sBackUrl);
					break;

				case 'schedule':
					this.jump('/html5/Flight/Schedule/');
					break;

				case 'checkin':
					break;
			}
		},
		
		checkInAction:function(e){				//值机Btn点击动作
			var cur = $(e.currentTarget), 
				psg = cur.parents(".js_psg"),
				fcinfos = cur.parents(".js_fcinfos")

			var checkinParam = {
				"alcode"	: fcinfos.data("aircde"),			//航空公司二字码
				"chkinfo"	:{
					"acode"	: fcinfos.data("aacode"),			//到达机场三字码
					"dcode"	: fcinfos.data("dacode"),			//出发机场三字码
					"ddate"	: fcinfos.data("depdat")			//起飞时间
				},
				"oid": fcinfos.data("oid"),						//订单号
				"ver":0
				
			}
			
			CheckinSearchParamStore.set(checkinParam)
			
			var _cinsta = fcinfos.data("cinsta"),				//大状态	1,都不支持 2,可选坐 3,可值机
				_ctype = psg.data("ctype"),					//证件类型  1,身份证 2,护照 3,票号
				_tno = psg.data("tno")						//票号
			
			this.showLoading()
			CheckinSearchModel.excute(function (data) {
				
				
				if(data.cairinf && +data.cairinf.rc === 1){						//如果不可值机
					var msgArray = data.cairinf.resmsg.split("|"),
						msgTemp = "";
					
					if(msgArray && msgArray.length > 0){
						msgTemp = msgArray[1] ?  ( msgArray[0] + "<br/>" + msgArray[1] ) :	msgArray[0]
					}
					
					if(+_cinsta === 2){							//如果可选座
						
						
						//获取单条订单信息 
						var options = {
							"oid" : fcinfos.data("oid"),
							"dacode" : fcinfos.data("dacode"),
						}
						var CheckPassenger = CheckinListStore.getCurCheckInfo(options)
						
						CheckPassengerStore.set(CheckPassenger)
						
						this.forward("notimedcheckin")
						
					}else{							//不可选座，弹窗显示
						
						this.showMessage(msgTemp)
						
					}
					
				}else{								//如果是可值机
				
					if(+_ctype === 3 && ( !_tno || _tno === "" )){		//如果证件类型是票号，且票号为空的时候
						
						if(+_cinsta === 2){								//如果可选座
							
							//获取单条订单信息 
							var options = {
								"oid" : fcinfos.data("oid"),
								"dacode" : fcinfos.data("dacode"),
							}
							var CheckPassenger = CheckinListStore.getCurCheckInfo(options)
							
							CheckPassengerStore.set(CheckPassenger)
							
							this.forward("notimedcheckin")
							
						}else{											//不可选座，弹窗显示
							
							this.showMessage("您的证件不符合在线值机要求，请至机场柜台办理。")
							
						}
						this.hideLoading();
						
						return 
					}
					
					//获取单条订单及单条乘客信息 
					var options = {
						"oid" : fcinfos.data("oid"),
						"dacode" : fcinfos.data("dacode"),
						"index" : psg.data("index"),
						"psgnam" : psg.data("psgnam")
					};
					var CheckPassenger = CheckinListStore.getCurCheckInfo(options)
					CheckPassengerStore.set(CheckPassenger)
					this.forward("checkinbooking")
					
				}
				
				this.hideLoading();
				
				
            }, function (err) {
				var msg = err.msg ? err.msg : '啊哦,数据加载出错了!';
				this.hideLoading();
				this.showToast(msg)
            }, true, this);
		
		},
		checkOutAction:function(e){				//取消值机
			var cur = $(e.currentTarget), 
				fcinfos = cur.parents(".js_fcinfos"),
				psg = cur.parents(".js_psg")
				
				
			if(+fcinfos.data("ahtyp") === 3){			//不需要验证码  国航

				this.cancelAlert = new c.ui.Alert({
					title: '提示信息',
					message: '确定取消'+ psg.data("psgnam") +'值机？',
					buttons: [{
						text: '关闭',
						click: function () {
							this.hide();
						}
					},{
						text: '确定',
						click: function () {
							
							this.hide();
							var options = {
								"oid" : fcinfos.data("oid"),
								"dacode" : fcinfos.data("dacode"),
								"index" : psg.data("index"),
								"psgnam" : psg.data("psgnam")
							};
							
							var CheckPassenger = CheckinListStore.getCurCheckInfo(options)
			
							CheckInCancelSubmitModel.formatParam(CheckPassenger)
							
							CheckInCancelSubmitModel.excute(function(data){
							
								var rmsg = data.rmsg
								
								if(+data.rc === 1){		//取消失败
									if(!rmsg) rmsg = "取消"+ psg.data("psgnam") +"值机失败";
									
									_this.showToast(rmsg)
									
								}else{					//取消成功
								
									if(!rmsg) rmsg = "已取消"+ psg.data("psgnam") +"值机";
									_this.showToast(rmsg)
									_this.onLoad();
								}
								
							},function(e){
								_this.showToast("请求失败，请重试")
							
							},true,this)
							
						}
					}]
				});
				
				this.cancelAlert.show()
			}else{									//需要验证码 东航
				//获取单条订单及单条乘客信息 
				var options = {
					"oid" : fcinfos.data("oid"),
					"dacode" : fcinfos.data("dacode"),
					"index" : psg.data("index"),
					"psgnam" : psg.data("psgnam")
				};
				var CheckPassenger = CheckinListStore.getCurCheckInfo(options)
				CheckPassengerStore.set(CheckPassenger)
				this.forward("cancelCheckin")
			}
			
		
		},
		checkOutReq:function(options, onComplete, onError){					//取消值机请求
			
			
			
			
		},
		unCtripCheckAction:function(){			//非携程订单跳转
			CheckPassengerStore.remove();
			this.forward("checkinbooking")
		},

        onHide: function () {
			this.hideWarning404();
		}
    });
    return View;
});

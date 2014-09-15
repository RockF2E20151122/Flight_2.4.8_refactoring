define(['libs', 'c', 'cBasePageView', 'CommonStore', 'FlightModel', 'FlightStore', 'Validate', buildViewTemplatesPath('cancelCheckin.html'), 'cUtility', 'cWidgetFactory', 'cWidgetGuider'],
 function (libs, c, cBasePageView, CommonStore, FlightModel, FlightStore, validate, html, cUtility, WidgetFactory) {
     var cui = c.ui,
         cBase = c.base,
         salesStore = CommonStore.SalesObjectStore.getInstance, //渠道信息
         userStore = CommonStore.UserStore.getInstance(), //用户信息
         userInfo = userStore ? userStore.getUser() : null;
     var isSend = false;  //是否已按发送按钮
     var isSubmit = false; //是否已按提交按钮
     var resource = "";
     var View = cBasePageView.extend({
         pageid: '',
         tpl: html,
         checkPassengerStore: FlightStore.CheckPassengerStore.getInstance(), //从列表传递的取消值机参数
         flightCancelCheckStore: FlightStore.FlightCancelCheckStore.getInstance(),
         getAuthCodeModel: FlightModel.GetAuthCodeModel.getInstance(), //获取验证码model
         checkInCancelSubmitModel: FlightModel.CheckInCancelSubmitModel.getInstance(), //取消值机model
         flightAirlineStore: FlightStore.FlightAirlineStore.getInstance(), //航空公司store
         flightAirlineModel: FlightModel.FlightAirlineModel.getInstance(), //航空公司model
         cancelCheckResultStore: FlightStore.CancelCheckResultStore.getInstance(), //取消值机结果store
         render: function () {
             var self = this;
             this.$el.html(this.tpl);
             this.els = {
                 flight_cancel_tpl: this.$el.find('#flight_cancel_tpl'), //模板
                 flight_cancel_box: this.$el.find('#flight_cancel_box')  //容器
             };
             this.flight_cancel_fun = _.template(this.els.flight_cancel_tpl.html());
         },
         renderData: function (data) {//渲染页面
             var self = this;
             var flight_cancel_item = self.flight_cancel_fun(data);
             self.els.flight_cancel_box.html(flight_cancel_item);
         },
         passValidation: function (e) {//验证输入
             var ele = $(e.srcElement || e.target);
             var text = $.trim(ele.val());
             text = text.replace(/\D/g, "");
             ele.val(text);
         },
         getCheckCode: function (e) {//获取验证码
             if (isSend == true) return false;
             var self = this;
             //  var text = $.trim($("#jsMobilePhone").val());
             //  if (!validate.isMobile(text)) {
             //     self.showToast("请填写正确的手机号");
             //  } else {
             var data = self.flightCancelCheckStore.get();
             if (data) {
                 isSend = true;
                 var oid = data["oid"];
                 var fcsinf = data["fcsinf"];
                 var psginf = data["psginf"];
                 // psginf["phone"] = text;
                 self.getAuthCodeModel.setParam("oid", oid);
                 self.getAuthCodeModel.setParam("fcsinf", fcsinf);
                 self.getAuthCodeModel.setParam("psginf", psginf);
                 self.showLoading();
                 self.getAuthCodeModel.excute(function (d) {
                     // isSend = false;
                     self.hideLoading();
                     $("#jsGetCode").addClass('yzm2');
                     $("#jsGetCode").html("重新获取<br><em >60秒</em>");
                     if (d) {
                         if (d["rc"] == 0) {
                             self.showToast('验证码已发送', 1);
                             var i = 60;
                             resource = setInterval(function () {
                                 if (i <= 0) {
                                     $("#jsGetCode").removeClass('yzm2');
                                     $("#jsGetCode").html("获取<br/>验证码");
                                     isSend = false;
                                     clearInterval(resource);
                                     resource = "";
                                 } else {
                                     $("#jsGetCode").html("重新获取<br><em >" + i + "秒</em>");
                                 }
                                 i--;
                             }, 1000);
                         } else {
                             self.showToast('获取验证码失败，请重试', 1);
                             $("#jsGetCode").removeClass('yzm2');
                             $("#jsGetCode").html("获取<br/>验证码");
                             isSend = false;
                         }
                     }
                 }, function (e) {
                     self.hideLoading();
                     self.showToast('获取验证码失败，请重试', 1);
                     $("#jsGetCode").removeClass('yzm2');
                     $("#jsGetCode").html("获取<br/>验证码");
                     isSend = false;
                 }, false, this);
             } else {
                 self.showToast('数据请求失败', 1, function () {
                     self.back();
                 });
             }
             // }
         },
         confirmCancel: function (e) {
             var self = this;
             if (isSubmit) return false;
             $("#jsYzmLine").removeClass("highlight");
             var text = $.trim($("#jsCheckCode").val());
             if (text.length == 0) {
                 self.showToast('请输入验证码', 2);
                 $("#jsYzmLine").addClass("highlight");
                 return false;
             }
             var data = self.flightCancelCheckStore.get();
             if (data) {
                 var passenger = data["psginf"]["psgname"];
                 var msg = "确定取消" + passenger + "值机?";
                 self.cancelAlert = new cui.Alert({
                     // showTitle: true,
                     //  title: '提示信息',
                     message: msg,
                     buttons: [
                             {
                                 'text': '关闭',
                                 'click': function () { this.hide(); },
                                 'type': c.ui.Alert.STYLE_CANCEL || 'cancel'
                             },
                             {
                                 'text': '确定',
                                 'click': function () {
                                     this.hide();
                                     self.submitCancel();
                                 },
                                 'type': c.ui.Alert.STYLE_CANCELSTYLE_CONFIRM
                             }
                            ]
                 });
                 self.cancelAlert.show();
             } else {
                 self.showToast('数据请求失败', 1, function () {
                     self.back();
                 });
             }
         },
         submitCancel: function () {
             var self = this;
             var data = self.flightCancelCheckStore.get();
             if (data) {
                 isSubmit = true;
                 var oid = data["oid"];
                 var fcsinf = data["fcsinf"];
                 var psginf = data["psginf"];
                 var text = $.trim($("#jsCheckCode").val());
                 self.checkInCancelSubmitModel.setParam("oid", oid);
                 self.checkInCancelSubmitModel.setParam("fcsinf", fcsinf);
                 self.checkInCancelSubmitModel.setParam("psginf", psginf);
                 self.checkInCancelSubmitModel.setParam("aucde", text);
                 self.showLoading();
                 self.checkInCancelSubmitModel.excute(function (d) {
                     isSubmit = false;
                     self.hideLoading();
                     //  var rc = d["rc"];
                     //   console.log("取消结果:"+rc);
                     self.cancelCheckResultStore.set(d);
                     self.back("CheckInList");
                 }, function (e) {
                     isSubmit = false;
                     self.hideLoading();
                     self.showToast('数据请求失败', 1);
                 }, false, self);
             } else {
                 self.showToast('数据请求失败', 1, function () {
                     self.back();
                 });
             }
         },
         events: {
             //"input #jsMobilePhone": 'passValidation',
             "click #jsGetCode": "getCheckCode",
             "click #jsBtnSubmit": "confirmCancel",
             'click #js_return': 'backAction'
         },
         onCreate: function () {

             this.render();
         },
         formatData: function (store) {
             var p = {};
             try {
                 p = {
                     ahtyp: store["ahtyp"],
                     aucde: store["aucde"],
                     oid: store["oid"],      //订单号
                     fcsinf: { //航班信息
                         aircde: store["aircde"],
                         fno: store["fno"], // //航班号
                         dcode: store["dacode"], //出发机场
                         acode: store["aacode"], //到达机场
                         ddate: store["depdat"], //出发时间
                         setno: store["ciplst"][0]["setno"]   //座位 35B
                     },
                     psginf: {
                         ctype: store["ciplst"][0]["ctype"], //证件类型
                         cno: store["ciplst"][0]["cno"], //证件号码
                         tno: store["ciplst"][0]["tno"], //票号
                         psgname: store["ciplst"][0]["psgnam"], //旅客姓名（中文）
                         phone: store["ciplst"][0]["phone"]  //手机号码
                     }
                 }
             } catch (e) {
                 return null;
             }
             return p;
         },
         //加载数据时
         onLoad: function (refer) {
             var self = this;
             /*重置倒计时*/
             if (resource != "") {
                 clearInterval(resource);
                 resource = "";
             }
             $("#jsGetCode").removeClass('yzm2');
             $("#jsGetCode").html("获取<br/>验证码");
             isSend = false;
             self.turning();

             /*
             //################测试数据################//
             var dd = {
             "Resmsg": null,
             "aabld": null,
             "aacode": "HGH",
             "aasname": "萧山",
             "ahtyp": 3,
             "aircde": "CA",
             "arrcde": "HGH",
             "arrdat": "2014-5-22 0:05:00",
             "cfply": "经济舱",
             "cfttpe": "320",
             "cinsta": 3,
             "ciplst": [
             {
             "boksetsta": 2,
             "cno": null,
             "ctype": 3,
             "isccin": false,
             "phone": "15900742685",
             "psgnam": "阿菲非法",
             "setno": "",
             "tno": null
             }
             ],
             "dabld": null,
             "dacode": "PEK",
             "dasname": "首都",
             "depcde": "BJS",
             "depdat": "2014-5-21 22:00:00",
             "fcgrade": 0,
             "fno": "CA1708",
             "oid": 1209705289,
             "segno": 0,
             "seq": 1,
             "trptpe": 1
             };
             var p = self.formatData(dd);
             if (!self.flightCancelCheckStore.get()) {
             self.flightCancelCheckStore.set(p);
             }
             //################测试数据################//
             */

             var data = self.formatData(self.checkPassengerStore.get());
             console.log(data);
             self.flightCancelCheckStore.set(data);
             console.log(data);

             if (data) {//获取航空公司名（坑爹的，直接下发给我不就好了。还要我去查）

                 if (self.flightAirlineStore.get() == null) {//查询航空公司信息
                     self.showLoading();
                     self.flightAirlineModel.excute(function (dd) {
                         self.hideLoading();
                         if (dd) {
                             var d = self.flightAirlineStore.get();
                             var al = d[data["fcsinf"]["aircde"]];
                             data["airlineName"] = al["name"];
                         } else {
                             data["airlineName"] = "";
                         }
                         self.renderData(data);
                     }, function (e) {
                         self.hideLoading();
                         data["airlineName"] = "";
                         self.renderData(data);
                     }, false, this);
                 } else {//从已有store里读取航空公司信息
                     var d = self.flightAirlineStore.get();
                     var al = d[data["fcsinf"]["aircde"]];
                     data["airlineName"] = al["name"];
                     self.renderData(data);
                 }


             } else {
                 self.backAction(); //传递参数失效,返回值机列表
             }
         },
         onShow: function () {

         },
         onHide: function () {
             $("#jsCheckCode").val(""); //清空验证码
             this.hideLoading(); //离开页面时隐藏loading
             this.flightCancelCheckStore.remove(); //清空取消值机传递参数
             this.checkPassengerStore.remove();
             this.flightAirlineModel.abort(); //终止请求
             this.getAuthCodeModel.abort(); //终止请求
             this.checkInCancelSubmitModel.abort(); //终止请求
         },
         backAction: function () {
             this.back("CheckInList");
         }
     });
     return View;
 });

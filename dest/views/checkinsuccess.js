define(["libs","c","cUI","CommonStore","FlightStore","FlightModel","cBasePageView",buildViewTemplatesPath("checkinsuccess.html"),"cWidgetFactory"],function(a,b,c,d,e,f,g,h){var i,j=e.CheckPassengerStore.getInstance(),k=null;return i=g.extend({tpl:h,checkinListUrl:"CheckInList",events:{"click .flight-zjtable3":"jumpCheckinList","click #js_return":"backAction"},ready:function(){this.$el.html(this.tpl),this.elsBox={checkin_success_box:this.$el.find("#checkin_success_box"),checkin_success_tpl:this.$el.find("#checkin_success_tpl")},this.checkin_success_fun=_.template(this.elsBox.checkin_success_tpl.html())},onCreate:function(){this.showLoading(),this.ready()},onLoad:function(){this.showLoading(),k=this,this.renderSuccessBox(),this.turning(),this.hideLoading()},backAction:function(){this.back(this.checkinListUrl)},onShow:function(){this.setTitle("值机成功页")},onHide:function(){this.elsBox.checkin_success_box.empty(),this.hideLoading()},renderSuccessBox:function(){var a=j.get(),b={};b.flightCompany=a.airname,b.flightNo=a.fno,b.passengerName=a.ciplst[0].psgnam,b.currSpace=a.ciplst[0].currentSpace,b.seatNo=a.ciplst[0].setno,b.cattion=a.cattion,this.elsBox.checkin_success_box.html(this.checkin_success_fun(b))},jumpCheckinList:function(){this.forward(this.checkinListUrl)}})});
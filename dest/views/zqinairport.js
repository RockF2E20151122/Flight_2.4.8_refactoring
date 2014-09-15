define(["libs","c","FlightModel","FlightStore","CommonStore",buildViewTemplatesPath("zqinairport.html"),"cWidgetFactory","cWidgetCalendar"],function(a,b,c,d,e,f,g){var h=b.base,i=16,j=g.create("Calendar"),k=b.view.extend({flightModel:c.zqInAirportSelectModel.getInstance(),flightSearchStore:d.FlightSearchStore.getInstance(),flightStore:d.zqInAirportSelectStore.getInstance(),flightSelectedStore:d.FlightSelectedInfo.getInstance(),dateStorge:d.zqInAirportDateStore.getInstance(),LastzqInAirportSelectDateTime:d.LastzqInAirportSelectDateTime.getInstance(),zqInAirportDateAndAddressStore:d.zqInAirportDateAndAddressStore.getInstance(),userStore:e.UserStore.getInstance(),flightPickTicketSelectStore:d.FlightPickTicketSelectStore.getInstance(),flightDetailModel:c.FlightDetailModel.getInstance(),tpl:f,pageid:"214036",render:function(){this.viewdata.req=this.request,this.$el.html(this.tpl),this.els={}},getAddress:function(){this.flightModel.setParam(this.buildParam());this.showLoading(),this.flightModel.excute(function(a){this.hideLoading(),this.defautsAddr(a)},function(){this.showMessage("可能网络有点问题,重新加载吧!"),this.hideLoading()},!1,this)},returnAddrs:function(a,b){for(var c=0;c<a.length;c++)if(a[c].type===b)return a[c].addrs},defautsAddr:function(a){if(a.deliveries.length>0){var a=this.returnAddrs(a.deliveries,16),a=a[0],b=this.flightSearchStore.getSearchDetails(0,"dCtyCode"),c=this.flightSearchStore.getSearchDetails(0,"aCtyCode"),d=b+c;a&&this.flightStore.set({address:a.name,btime:a.btime,etime:a.etime,dstr:a.dstr,ext:a.ext,fee:a.fee,flag:a.flag,id:a.id,port:a.port,rule:a.rule,site:a.site},d),this.showStorageAddress()}},buildParam:function(){var a=this.flightSelectedStore.get(),b=this.flightSearchStore.get();if(!a){this.showMessage("操作已超时,请重新选择航班");var c=this;return void window.setTimeout(function(){c.back()},2e3)}var d={};d.ticketIssueCty=b.items[0].dCtyCode,d.tripType=b.tripType,d.ver=0;var e=[{aCty:b.items[0].aCtyCode,dCty:b.items[0].dCtyCode,"class":0,dDate:b.items[0].date,flightNo:a.depart.flight.flightNo,price:a.depart.cabin.price,productType:a.depart.cabin.productType,subClass:a.depart.cabin.subClass}];return 2==d.tripType&&b.items[1]&&e.push({aCty:b.items[1].aCtyCode,dCty:b.items[1].dCtyCode,"class":0,dDate:b.items[1].date,flightNo:a.arrive.flight.flightNo,price:a.arrive.cabin.price,productType:a.arrive.cabin.productType,subClass:a.arrive.cabin.subClass}),d.items=e,d},createCalendar:function(){var a=this;this.calendar=new j({date:{start:{title:function(a,b){return b(a)},value:this.getServerDate()}},title:"取票日期",Months:4,callback:function(b){return a.dutyBtime?(a.dateStorge.set({date:b.valueOf()}),this.hide(),void a.selectCalendarDate(a.getServerDate(),a.airTakeOff)):void a.showMessage("请选择地址")},classNames:"calen-cls"})},showStorageDate:function(){if(this.dateStorge&&this.dateStorge.get()){var a=this.dateStorge.get().date,b=h.Date.parse(a).format("Y-m-d");this.$el.find("#zq-inairport-data").text(b)}},showStorageAddress:function(){this.flightSearchStore.getSearchDetails(0,"dCtyCode"),this.flightSearchStore.getSearchDetails(0,"aCtyCode");this.flightDetailModel.excute(function(a){var b=this.flightStore.get();if(b){var c=a&&a.insurances&&a.insurances.length>0&&a.insurances[0]&&a.insurances[0].sites&&a.insurances[0].sites.indexOf(b.site)>=0;this.dutyBtime=$.trim(this.flightStore.get().btime),this.dutyEtime=$.trim(this.flightStore.get().etime),this._calculateValidDate(this.getServerDate().valueOf(),this.airTakeOff),this.initAvailableDate();var d=this.flightStore.get().address;this.$el.find("#done-address").text(d+(c?"":" (不支持保险)"))}this.initTimes(this.getServerDate(),this.airTakeOff)},function(){this.forward("list")},!1,this)},events:{"click #date-picker":"datePicker","click #zqairport-pickker":"zqairportPickker","click #js_return":"goBack","click .deduct-time":"deductTime","click .plus-time":"plusTime","click #finished":"finished"},finished:function(){if(this.flightStore.get()&&this.flightStore.get().address&&this.LastzqInAirportSelectDateTime.get()&&this.LastzqInAirportSelectDateTime.get().times){var a=this;this.zqInAirportDateAndAddressStore.set({time:a.LastzqInAirportSelectDateTime.get().times,zqInfo:a.flightStore.get()})}this.flightPickTicketSelectStore.setAttr("type",i),this.LastzqInAirportSelectDateTime.remove(),this.flightStore.remove(),this.dateStorge.remove(),this.forward("bookinginfo")},updateSelectDate:function(){},initAvailableDate:function(){var a=this.dateStorge.get();if(this.dateStorge&&a){var b=(a.date,new Date(a.date)),c=new Date(this.airTakeOff);c.setHours(0,0,0,0),b.setHours(0,0,0,0),this.compareOrderAirLeaveTime=(c-b)/864e5,this.compareOrderAirLeaveTime>=0&&this.updateSelectDate(this.compareOrderAirLeaveTime)}},deductTime:function(a){if(this.LastzqInAirportSelectDateTime&&this.LastzqInAirportSelectDateTime.get().times){var b=new Date(this.LastzqInAirportSelectDateTime.get().times),c=new Date(this.LastzqInAirportSelectDateTime.get().times),d=new Date(this.LastzqInAirportSelectDateTime.get().times),e=(new Date(this.getServerDate()),new Date(this.airTakeOff));if(!this.dutyBtime)return void this.showMessage("请选择地址");var f=this.dutyBtime.substr(0,2),g=this.dutyBtime.substr(2,4),i=this.dutyEtime.substr(0,2),j=this.dutyEtime.substr(2,4);if(b.setHours(f,g,0,0),c.setHours(i,j,0,0),e.setHours(e.getHours()-2),d.setMinutes(d.getMinutes()-30),this._isCorrect(d.getTime())){this.$el.find(".deduct-time").removeClass("num_invalid");var k=new h.Date(d).format("Y-m-d"),l=this._parseTime(d);this._setDateAndTimeToUi(k,l),this.LastzqInAirportSelectDateTime.set({times:d.valueOf()})}else $(a.currentTarget).addClass("num_invalid")}else;},plusTime:function(a){if(this.LastzqInAirportSelectDateTime&&this.LastzqInAirportSelectDateTime.get().times){var b=new Date(this.LastzqInAirportSelectDateTime.get().times),c=new Date(this.LastzqInAirportSelectDateTime.get().times),d=new Date(this.LastzqInAirportSelectDateTime.get().times),e=(new Date(this.getServerDate()),new Date(this.airTakeOff));if(!this.dutyBtime)return void this.showMessage("请选择地址");var f=this.dutyBtime.substr(0,2),g=this.dutyBtime.substr(2,4),i=this.dutyEtime.substr(0,2),j=this.dutyEtime.substr(2,4);if(b.setHours(f,g,0,0),c.setHours(i,j,0,0),e.setHours(e.getHours()-2),d.setMinutes(d.getMinutes()+30),this._isCorrect(d.getTime())){this.$el.find(".deduct-time").removeClass("num_invalid");var k=new h.Date(d).format("Y-m-d"),l=this._parseTime(d);this._setDateAndTimeToUi(k,l),this.LastzqInAirportSelectDateTime.set({times:d.valueOf()})}else $(a.currentTarget).addClass("num_invalid")}else;},_isCorrect:function(a){var b=this._getDailyAvailableTime(a),c=this._getAvailableTime(b,a);return a==c},_updateSelectDate:function(){this.calendar.update({validStartDate:new Date(this.validDate.startValidTime),validEndDate:new Date(this.validDate.endValidTime)}),this.calendar.setDate(this.LastzqInAirportSelectDateTime.get()&&this.LastzqInAirportSelectDateTime.get().times?{start:new Date(this.LastzqInAirportSelectDateTime.get().times)}:{start:new Date(this.validDate.endValidTime)})},_calculateValidDate:function(a,b){var c=a+72e5,d=b-72e5;this.validDate={startValidTime:c,endValidTime:d};var e=this._getDailyAvailableTime(c);this.validDate.startValidTime>e.endValidTime&&(this.validDate.startValidTime=e.startValidTime+864e5),e=this._getDailyAvailableTime(d),this.validDate.endValidTime<e.startValidTime&&(this.validDate.endValidTime=e.endValidTime-864e5)},_setDateAndTimeToUi:function(a,b,c){this.$el.find("#zq-inairport-data").text(a),this.$el.find(".hours").text(b),this.$el.find(".room_num i").removeClass("num_invalid"),"function"==typeof c&&c()},_setHoursAndMinutesByServer:function(a,b){var c=new Date(b),d=window.parseInt(a/100),e=window.parseInt(a)%100;return c.setHours(d,e,0,0),c.getTime()},_getDailyAvailableTime:function(a){"string"==typeof a&&(a=window.parseInt(a));var b=this._setHoursAndMinutesByServer(this.dutyBtime,a),c=this._setHoursAndMinutesByServer(this.dutyEtime,a),d={startValidTime:b,endValidTime:c};return d},_setHoursAndMinutes:function(a,b){var c=new Date(a),d=new Date(b);return d.setHours(c.getHours(),c.getMinutes()),d.getTime()},_getAvailableTime:function(a,b){var c=b;return b<a.startValidTime?c=a.startValidTime:b>a.endValidTime&&(c=a.endValidTime),c<this.validDate.startValidTime?c=this.validDate.startValidTime:c>this.validDate.endValidTime&&(c=this.validDate.endValidTime),c},_parseTime:function(a){var b=new Date(a),c=1==b.getHours().toString().length?"0"+b.getHours():b.getHours(),d=1==b.getMinutes().toString().length?"0"+b.getMinutes():b.getMinutes();return c+":"+d},_checkDateAvailable:function(a){var b=new Date(this.validDate.startValidTime),c=b.setHours(0,0,0,0);if(a&&a>=c&&a<=this.validDate.endValidTime){var d=this._getDailyAvailableTime(a);if(this.LastzqInAirportSelectDateTime.get()&&this.LastzqInAirportSelectDateTime.get().times){var e,f,g=this._setHoursAndMinutes(this.LastzqInAirportSelectDateTime.get().times,a),i=this._getAvailableTime(d,g);g==i?(e=this._parseTime(i),f=new h.Date(i).format("Y-m-d")):(i=this._getAvailableTime(d,a),e=this._parseTime(i),f=new h.Date(i).format("Y-m-d")),this._setDateAndTimeToUi(f,e),this.LastzqInAirportSelectDateTime.set({times:i})}else{var i=this._getAvailableTime(d,a),e=this._parseTime(i),f=new h.Date(i).format("Y-m-d");this._setDateAndTimeToUi(f,e),this.LastzqInAirportSelectDateTime.set({times:i})}}else{var j=this,k=function(){j.$el.find(".room_num i").addClass("num_invalid"),j.showMessage("无有效时间,请选择其它时间"),j.LastzqInAirportSelectDateTime.set({times:!1})};this._setDateAndTimeToUi("无效日期","无效",k)}},selectCalendarDate:function(){if(!this.flightStore.get()||!this.flightStore.get().address)return this.showMessage("请选择地址");var a=this.dateStorge.get().date;this._checkDateAvailable(a)},initTimes:function(){if(this.dutyBtime)if(this.$el.find(".room_num i").removeClass("num_invalid"),this.LastzqInAirportSelectDateTime.get()&&this.LastzqInAirportSelectDateTime.get().times){var a=window.parseInt(this.LastzqInAirportSelectDateTime.get().times),b=new Date(this.validDate.startValidTime),c=b.setHours(0,0,0,0);if(a&&a>=c&&a<=this.validDate.endValidTime);else var d=this._getDailyAvailableTime(a),a=this._getAvailableTime(d,a);this._checkDateAvailable(a)}else this.validDate.endValidTime&&this._checkDateAvailable(this.validDate.endValidTime)},datePicker:function(){(this.calendar||this.createCalendar())&&(this._updateSelectDate(),this.calendar.show())},goBack:function(){this.LastzqInAirportSelectDateTime.remove(),this.flightStore.remove(),this.forward("zqinpickticketselect")},zqairportPickker:function(){this.forward("zqInAirportSelect")},onCreate:function(){this.render()},onLoad:function(){if(!this.flightSelectedStore.get()||!this.flightSelectedStore.get().depart){this.showMessage("操作已超时,请重新选择航班");var a=this;return void window.setTimeout(function(){a.back("list")},2e3)}var a=this;this.airTakeOff=h.Date.parse(a.flightSelectedStore.get().depart.flight.dTime,!0);var b=new Date(this.getServerDate().valueOf()),c=b.valueOf();if(this.dateStorge.set({date:c}),this.flightStore.get()&&this.flightStore.get().address);else{var d=this.zqInAirportDateAndAddressStore.get();d&&d.zqInfo&&(this.LastzqInAirportSelectDateTime.set({times:d.time}),this.flightStore.set(d.zqInfo))}this.flightStore.get()&&this.flightStore.get().address?this.showStorageAddress():this.getAddress(),this.turning()},onShow:function(){this.setTitle("机场自取"),this.createCalendar()},onHide:function(){}});return k});
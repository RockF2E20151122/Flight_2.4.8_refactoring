define(["libs","c","FlightModel","FlightStore","CommonStore",buildViewTemplatesPath("zqincityselect.html")],function(a,b,c,d,e,f){var g=(b.base,b.view.extend({flightModel:c.zqAddressSelectModel.getInstance(),flightSearchStore:d.FlightSearchStore.getInstance(),inCitySelectStore:d.zqInCitySelectStore.getInstance(),flightSelectedStore:d.FlightSelectedInfo.getInstance(),zqInCityDateAndAddressStore:d.zqInCityDateAndAddressStore.getInstance(),flightSelectedStore:d.FlightSelectedInfo.getInstance(),dateStorage:d.zqInCityDateStore.getInstance(),userStore:e.UserStore.getInstance(),FlightDetailsStore:d.FlightDetailsStore.getInstance(),deliveries:[],pageid:"214039",tpl:f,render:function(){this.$el.html(this.tpl),this.els={listBox:this.$el.find("#cfbox"),listTpl:this.$el.find("#address-list")},this.temFun=_.template(this.els.listTpl.html())},returnAddrs:function(a,b){for(var c=0;c<a.length;c++)if(a[c].type===b)return a[c].addrs},events:{"click .light":"selectAddr","click #js_return":"goBack"},goBack:function(){this.back("zqincity")},selectAddr:function(a){$(".light").removeClass("current");for(var b=$(a.currentTarget),c=b.attr("data_id"),d=0,e=this.deliveries.length;e>d;d++){var f=this.deliveries[d];if(c==f.id){f.address=f.name,this.inCitySelectStore.set(f,this.flightCode);break}}b.addClass("current"),this.forward("zqInCity")},getAddress:function(){var a=this;this.showLoading(),this.flightModel.excute(function(b){a.els.listBox.empty(),a.appendList(b)},function(){this.showMessage("啊哦,可能网络有点问题,加载出错喽,重新来过吧,亲!"),this.hideLoading()},!1,this)},appendList:function(a){if(a.deliveries&&a.deliveries.length>0){var a=this.returnAddrs(a.deliveries,8);if(a){for(var b=this.FlightDetailsStore.get(),c=0;c<a.length;c++){var d=this.temFun({datas:a[c],insurance:b});this.els.listBox.append(d)}this.deliveries=a}}this.hideLoading()},onCreate:function(){this.render()},onLoad:function(){var a=this.flightSelectedStore.get().depart;this.flightCode=a.flight.flightNo+a.cabin.price,this.turning(),this.getAddress()},onShow:function(){},onHide:function(){}}));return g});
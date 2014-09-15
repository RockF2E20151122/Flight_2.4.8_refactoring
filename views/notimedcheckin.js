/// <summary>
/// 未到时间值机预约选座页 creator:wyren; createtime:2014-04-28
/// </summary>
define(['cSales','libs', 'c', 'cUI', 'CommonStore', 'FlightStore', 'FlightModel', 'cBasePageView', buildViewTemplatesPath('notimedcheckin.html'), 'cWidgetFactory'], function (cSales,libs, c, cUI, CommonStore, FlightStore, FlightModel, BasePageView, html, WidgetFactory) {
    var View;
    //to add 值机相关信息store
    var checkinResultStore = FlightStore.CheckinResultStore.getInstance(),
        checkPassengerStore = FlightStore.CheckPassengerStore.getInstance(),
        _this = null;

    View = BasePageView.extend({
        tpl: html,
        homeUrl: '/html5',
        backUrl: 'CheckInList',
        selectSeatUrl: 'selectseat',
        events: {
            'click #select_seat': 'selectSeat',
            'click #js_home': 'homeAction',
            'click #js_return': 'backAction'
        },
        ready: function () {
            this.$el.html(this.tpl);
            this.elsBox = {
                checkin_info_box: this.$el.find('#checkin_info_box'), //值机信息容器
                checkin_info_tpl: this.$el.find('#checkin_info_tpl') //值机信息模版
            };
            this.checkin_info_fun = _.template(this.elsBox.checkin_info_tpl.html()); //值机信息模版函数
        },
        onCreate: function () {
            this.showLoading();
            // this.injectHeaderView();
            this.ready();
        },
        onLoad: function () {
            this.showLoading();
            _this = this;
            //设置HeaderView
            // this.headerview.set({
            //     title: '值机',
            //     back: true,
            //     view: _this,
            //     tel: {
            //         number: 4000086666
            //     },
            //     home: true,
            //     events: {
            //         homeHandler: function () {
            //             _this.jump(_this.homeUrl);
            //         },
            //         returnHandler: function () {
            //             _this.back(_this.backUrl);
            //         }
            //     }
            // });
            // this.headerview.show();
            //--------------渲染值机信息页面--------------
            this.renderCheckinInfoBox();
            //呈现页面，隐藏蒙板
            this.turning();
            this.hideLoading();

          //营销电话
          this.getSalesObj();
        },
        getSalesObj: function () {
          var self = this;
          var sales = self.getQuery('sales'),
              sourceid = self.getQuery('sourceid');

          var _sales = CommonStore.SalesStore.getInstance().get();
          if (_sales != null) {
            if (sourceid == null && sales == null) {
              sourceid = _sales["sourceid"];
            }
          }
          if (sales || sourceid) {
            cSales.getSalesObject(sales || sourceid, $.proxy(function (data) {
              cSales.replaceContent(self.$el);
            }, this));
          }

        },
        homeAction:function(){
            this.jump(_this.homeUrl);
        },
        backAction:function(){
            this.back(_this.backUrl);
        },
        onShow: function () {
            this.setTitle('未到时间值机页');
        },
        onHide: function () {
            this.elsBox.checkin_info_box.empty();
            this.hideLoading();
        },
        //--------------渲染值机信息页面--------------
        renderCheckinInfoBox: function () {
            //ToDo调用store信息填充模版，渲染box
            var checkinResultData = checkinResultStore.get(),
                renderData = {},
                resmsg = checkinResultData ? checkinResultData.cairinf.resmsg.replace(/\|/g, '<br/>') : '';
            renderData.resmsg = resmsg;
            this.elsBox.checkin_info_box.html(this.checkin_info_fun(renderData));
        },
        selectSeat: function () {
            this.showLoading();
            checkPassengerStore.setAttr('backurl','notimedcheckin');
            this.forward(this.selectSeatUrl);
        }

    });

    return View;

});

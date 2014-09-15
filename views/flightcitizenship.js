define(['libs', 'c', 'FlightModel', 'FlightStore', 'cDataSource',buildViewTemplatesPath('flightcitizenship.html')], function (libs, c, FlightModel, FlightStore, cDataSource, html) {
    var passengerEditStore = FlightStore.passengerEditStore.getInstance(),
        CountryDataModel = FlightModel.CountryDataModel.getInstance(),
        CountryDataStore = FlightStore.CountryDataStore.getInstance();
    var View = c.view.extend({
        tpl: html,
        dateSource: new cDataSource(),
        render: function () {
            this.viewdata.req = this.request;
            this.$el.html(this.tpl);
            this.elsBox = {
                p_citizenship_wrap: this.$el.find('#p_citizenship_wrap'),
                p_citizenship_tpl: this.$el.find('#p_citizenship_tpl')
            };
            this.elHTML = _.template(this.elsBox.p_citizenship_tpl.html())
        },
        events: {
            'click #js_return': 'backAction',
            'click .city-group-title': 'GroupTitClick',
            'click .sub-city-box>li': 'chooseNatl'
        },
        GroupTitClick: function (e) {
            var cur = $(e.currentTarget);
            cur.parent().siblings('.cityli').find('.sub-city-box').hide();
            cur.next('.sub-city-box').toggle();
        },
        updatePage: function () {
            var _this = this;
            this.showLoading();
            CountryDataModel.excute(function (data) {
                this.dateSource.setData(data.countries);
                var visited = {}, visited2 = {};
                var passengerEdit = passengerEditStore.get();
                var datalist = this.dateSource.groupBy('einitial', function (v) {
                    var reuslt = !visited[v.id];
                    visited[v.id] = true;
                    return reuslt;
                }),
                hotCitys = this.dateSource.filter(function (n, v) {
                    var result = (v.hotFlag <= 11 || v.id == 14 ) && !visited2[v.id] ;
                    visited2[v.id] = true;
                    return result;
                }, function (a, b) { return a.hotFlag - b.hotFlag; });
                var html = this.elHTML({ keys: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), datalist: datalist, hotcitys: hotCitys ,scode: passengerEdit.natl});      
                this.elsBox.p_citizenship_wrap.html(html); 
                this.selectItem = this.elsBox.p_citizenship_wrap.find('.citylistcrt');
                this.hideLoading();
                this.turning();
            }, function (e) {

                if (e.head.errcode == 1003) {
                    //更新登录跳转地址 caof 20131108
                    window.location.href = '/webapp/myctrip/#account/login?t=1&from=' + encodeURIComponent('/webapp/flight/#passengerselect');
                }else{
                    this.showToast('数据查询失败，请重试')
                }
                this.hideLoading();
            }, false, this);

        },
        chooseNatl: function(e){
            var cur = $(e.currentTarget);
            passengerEditStore.setAttr('natl',cur.data('scode'))
            passengerEditStore.setAttr('natlName',cur.data('name'))
            this.back('passengeredit');
        },
        ShowAfter: function () {
            //显示
            var inlistbox = this.selectItem.parent();
            var titlebtu = inlistbox.prev('.city-group-title');
            var parent = inlistbox.parent();

            if (parent.length) {
                if (this.selectItem.length > 1) {
                    window.scrollTo(0, 0);
                } else {
                    titlebtu.trigger('click');
                    var t = c.ui.Tools.getElementPos(parent[0]);
                    window.scrollTo(0, t.top-60);
                }
            }
        },
        
        //首次记载view，创建view
        onCreate: function () {
            this.render();
        },
        //加载数据时
        onLoad: function () {
            this.updatePage();
        },
        //调用turning方法时触发
        onShow: function () {
            this.hideLoading();
            this.ShowAfter();
        },
        //
        onHide: function () {},
        backAction: function () {
            this.showLoading();
            this.back('#passengeredit');
        }
    });
    var DataControl = { viewdata:{}}
    return View;
});
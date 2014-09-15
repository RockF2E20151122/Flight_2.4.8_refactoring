/// <summary>
/// 用户机票订单列表 creator:caofu; createtime:2013-07-23
/// </summary>
define(['libs', 'c', 'CommonStore', 'FlightStore', 'FlightModel', buildViewTemplatesPath('orderlist.html')], function (libs, c, CommonStore, FlightStore, FlightModels, html) {
    var orderListModel = FlightModels.FlightOrderListModel.getInstance(), //订单列表数据Model
    orderListStore = FlightStore.FlightOrderListStore.getInstance(), //用户的订单列表信息
    orderDetailStore = FlightStore.FlightOrderDetailStore.getInstance(), //用户的订单详情信息
    orderParamStore = FlightStore.FlightOrderParamStore.getInstance(), //用户的订单参数信息
    userStore = CommonStore.UserStore.getInstance(), //用户信息
    returnPageStore = FlightStore.OrderDetailReturnPage.getInstance(), cbase = c.base;
    var View = c.view.extend({
        tpl: html,
        pageid: '212054',
        _onWidnowScroll: null, //滚动条事件句柄
        totalPages: null, //总页数
        isComplete: false, //是否完成
        isLoading: false,
        pageSize: 25, //每页加载数
        render: function () {
            this.$el.html(this.tpl);
            this.elsBox = {
                lstboxtpl_tpl: this.$el.find('#listboxtpl'), //订单列表模板
                lstbox: this.$el.find('#lstbox'), //订单列表容器
                noorder_tpl: this.$el.find('#emptylisttpl')//无订单提示
            };
            this.lstboxtplfun = _.template(this.elsBox.lstboxtpl_tpl.html());
        },
        events: {
            'click #js_return': 'backAction', //返回我的携程
            'click .jsdetail': 'detailAction' //查看订单详情
        },
        onShow: function () {
            this.setTitle('携程旅行网手机触屏版-机票订单');
        },
        onCreate: function () {
            userInfo = userStore ? userStore.getUser() : null;
            if (userInfo && userInfo.Auth) {
                //滚动加载下一页数据
                this._onWidnowScroll = $.proxy(this.onWindowsScroll, this);
                this.render();
            } else {
                if (orderListStore) { orderListStore.remove(); }
                if (orderDetailStore) { orderDetailStore.remove(); }
                orderParamStore.remove();
                this.jump('/webapp/myctrip/#account/login?from=' + encodeURIComponent(this.getRoot() + '#orderlist'));
            }
        },
        onLoad: function () {
            userInfo = userStore ? userStore.getUser() : null;
            this.elsBox.lstbox.empty();
            if (userInfo && userInfo.Auth) {
                orderListModel.getHead().setAttr('auth', userInfo.Auth);
                orderListModel.setParam('status', 0);
                orderListModel.setParam('pageIdx', 1);
            } else {
                if (orderListStore) { orderListStore.remove(); }
                if (orderDetailStore) { orderDetailStore.remove(); }
                orderParamStore.remove();
                this.jump('/webapp/myctrip/#account/login?from=' + encodeURIComponent(this.getRoot() + '#orderlist'));
                return;
            }
            this.turning();
            this.getOrderListData();
        },
        onHide: function () {
            $(window).unbind('scroll', this._onWidnowScroll);
            if (orderListModel) {
                orderListModel.setParam('pageIdx', 1);
            }
        },
        onWindowsScroll: function () {
            var pos = c.ui.Tools.getPageScrollPos();
            var param = orderListModel.getParam(); //获取查询参数
            var pageNum = isNaN(param.pageIdx) ? 0 : param.pageIdx; //当前页码
            if (param.pageIdx < this.totalPages && this.totalPages > 1) {
                this.isComplete = false;
            }
            if (this.totalPages && pos.pageHeight - (pos.top + pos.height) < 500 && !this.isComplete && !this.isLoading) {
                this.isLoading = true;
                if (param.pageIdx > this.totalPages) {
                    this.showToast('没有您更多的订单了', 3);
                    this.isComplete = true;
                    return;
                }
                orderListModel.setParam({
                    pageIdx: ++pageNum
                });
                this.getOrderListData();
            }
        },
        appendList: function (data) {
            var item;
            for (var i = 0; i < data.orders.length; i++) {
                data.orders[i].cDate = cbase.Date;
                item = this.lstboxtplfun(data.orders[i]);
                this.elsBox.lstbox.append(item);
            }
            this.hideLoading();
            $('.tips_tel').show();
        },
        getOrderListData: function () {
            this.showLoading();
            orderListModel.excute(function (data) {
                this.isLoading = false;
                this.hideLoading();
                if (!data) {
                    var self = this;
                    this.showHeadWarning('订单列表', '啊哦,数据加载出错了!', function () {
                        self.backAction(); this.hide();
                    });
                    $(window).unbind('scroll', this._onWidnowScroll);
                    return;
                }
                if (!data.orders || !data.orders.length) {
                    //无订单提示
                    var tip = _.template(this.elsBox.noorder_tpl.html());
                    this.elsBox.lstbox.html(tip);
                    $(window).unbind('scroll', this._onWidnowScroll);
                    return;
                }
                this.totalPages = Math.ceil(data.count / this.pageSize);
                if (this.totalPages > 1) {
                    $(window).bind('scroll', this._onWidnowScroll);
                }
                this.appendList(data);
            }, function (err) {
                this.hideLoading();
                this.isLoading = false;
                var self = this;
                var msg = err.msg ? err.msg : '啊哦,数据加载出错了!';
                this.showHeadWarning('订单列表', msg, function () {
                    self.backAction(1);
                    this.hide();
                });
                $(window).unbind('scroll', this._onWidnowScroll);
            }, true, this);
        },
        backAction: function () {
            if (orderListStore) { orderListStore.remove(); }
            if (orderDetailStore) { orderDetailStore.remove(); }
            orderParamStore.remove();
            //返回我的携程
            this.showLoading();
            window.location.href = '/webapp/myctrip/';
        },
        detailAction: function (e) {
            //查看订单详情
            userInfo = userStore ? userStore.getUser() : null;
            var orderid = $(e.currentTarget).attr('data-id');
            if (orderid && userInfo && userInfo.Auth) {
                //记录用户选定的订单号及基本订单信息
                this.showLoading();
                var data = { Id: orderid };
                orderParamStore.set(data);
                var p = { Id: 1 };
                returnPageStore.set(p);
                this.forward('orderdetail');
            }
        }
    });
    return View;
});
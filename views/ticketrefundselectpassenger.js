define(['cSales','libs', 'c', 'CommonStore', 'FlightStore', 'FlightModel', 'cBasePageView', buildViewTemplatesPath('ticketrefundselectpassenger.html'), 'cUtility', 'cWidgetFactory', 'cWidgetGuider'], function (cSales,libs, c, CommonStore, FlightStore, FlightModel, BasePageView, html, cUtility, WidgetFactory) {

    var salesStore = CommonStore.SalesObjectStore.getInstance(),
        userStore = CommonStore.UserStore.getInstance(),
        orderParamStore = FlightStore.FlightOrderParamStore.getInstance(), // 用户的订单参数信息  
        flightOrderDetailStore = FlightStore.FlightOrderDetailStore.getInstance(),
        flightTicketRefundChangeStore = FlightStore.FlightTicketRefundChangeStore.getInstance(), // 退改签查询信息
        flightTicketRefundFormStore = FlightStore.FlightTicketRefundFormStore.getInstance() // 退票申请表单内容

    var flightTicketRefundChangeModel = FlightModel.FlightTicketRefundChangeModel.getInstance(), // 机票退改签查询Model
        flightTicketRefundModel = FlightModel.FlightTicketRefundModel.getInstance();  // 机票退票申请       


    var cui = c.ui,
        cbase = c.base,
        userInfo = userStore.getUser(); //用户信息

    var PAGETITLE = '选择退票登机人';


    var dataHelper = {
        viewData: {},

        // 数字转中文，（不能超过万位）
        num2Cnum: function (n) {
            var s_n = n + "";
            var s_n_a = s_n.split("");
            var chnum_s = "";
            var units = ["", "十", "百", "千", "万"];
            var chnum = ["o", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
            var slen = s_n_a.length;
            for (i = 1; i <= slen; i++) {
                if (~ ~s_n_a[slen - i] == 0) {
                    chnum_s = chnum[~ ~s_n_a[slen - i]] + chnum_s;
                } else {
                    chnum_s = chnum[~ ~s_n_a[slen - i]] + units[i - 1] + chnum_s;
                }
            }
            chnum_s = chnum_s.replace(/(.)\1+/, "$1");
            chnum_s = chnum_s.replace(/o$/, "");
            if (chnum_s == '一十') {
                chnum_s = '十';
            }
            return chnum_s.replace("o", "零");
        },


        // 获取退改签信息
        getRefundChangeInfo: function (view, callBack) {
            var param = orderParamStore.get(); //获取查询参数
            var orderDetail = flightOrderDetailStore.get(); // 订单详情

            if (orderDetail && param && param.Id) {
                flightTicketRefundChangeModel.setParam('flag', 0);
                flightTicketRefundChangeModel.setParam('requestType', 1);
                flightTicketRefundChangeModel.setParam('oid', param.Id);
                View.backUrl = param.url || View.backUrl;

                view.showLoading();
                flightTicketRefundChangeModel.excute(function (data) {

                    view.hideLoading();

                    dataHelper.viewData = data;
                    if (data && data.head && data.head.errcode == 0) {
                        data.orderDetail = orderDetail;
                        view.renderData(data);
                    } else {
                        var msg = '数据加载失败';
                        view.showToast(msg);
                    }
                }, function (err) {
                    view.hideLoading();
                    view.showWarning404(function () {
                        location.reload();
                    });
                }, true, this, function () {
                    view.hideLoading();
                    view.showWarning404(function () {
                        location.reload();
                    });
                });
            } else {
                //view.backAction();

                var salesInfo = salesStore.get();

                if (salesInfo && salesInfo.sid && +salesInfo.sid == 1896) {
                    window.location = "map://leftClick()";
                } else {
                    view.jump(view.homeUrl);
                }
            }
        }
    };

    var View = BasePageView.extend({
        pageid: '214394',
        tpl: html,
        hasAd: true,
        homeUrl: "/html5",
        //backUrl: "filghtordermodify",
        render: function () {
            this.$el.html(this.tpl);
            this.elsBox = {
                ticketRefund_selectpassenger_tpl: this.$el.find('#ticketRefund_selectpassenger_tpl'), // 单程模板
                ticketRefund_selectpassenger_box: this.$el.find('#ticketRefund_selectpassenger_box')  //容器                
            };

            this.ticketRefund_selectpassenger_creater = _.template(this.elsBox.ticketRefund_selectpassenger_tpl.html());
        },
        renderData: function (data) {
            var self = this;
            data.cDate = cbase.Date; // 模板中使用
            var ticketRefund_item = self.ticketRefund_selectpassenger_creater(data);
            self.elsBox.ticketRefund_selectpassenger_box.html(ticketRefund_item);
        },

        backAction: function () {
            //if (orderParamStore) { orderParamStore.remove(); }
            userInfo = userStore.getUser();
            if (userInfo && userInfo.Auth) {
                this.back("ticketrefundmultiple");

            } else {
                var salesInfo = salesStore.get();

                if (salesInfo && salesInfo.sid && +salesInfo.sid == 1896) {
                    window.location = "map://leftClick()";
                } else {
                    this.jump(this.homeUrl);
                }
            }
        },
        events: {
            //"event selector": "functionname"
            "click #ticketRefund_selectpassenger_submit": "selectPassenger",
            "click .js_checkbox": "checkboxAction"
        },
        onCreate: function () {
            //orderParamStore.get() || this.jump(this.homeUrl);
            if (!orderParamStore.get()) {
                var salesInfo = salesStore.get();

                if (salesInfo && salesInfo.sid && +salesInfo.sid == 1896) {
                    window.location = "map://leftClick()";
                } else {
                    this.jump(this.homeUrl);
                }
            }
            this.injectHeaderView();
            this.render();
        },
        onShow: function () {
            this.setTitle(PAGETITLE);
        },
        onLoad: function () {
            var self = this;
            self.turning();

            //对HeaderView设置数据
            var isShowHome = true;
            var _sales = salesStore.get();
            if (_sales && _sales.sid && (+_sales.sid == 1575 || +_sales.sid == 1867)) {
                isShowHome = false;
            }
            self.headerview.set({
                title: PAGETITLE,
                back: true,
                view: self,
                tel: { number: 4000086666 },
                home: isShowHome,
                events: {
                    homeHandler: function () {
                        var salesInfo = salesStore.get();

                        if (salesInfo && salesInfo.sid && +salesInfo.sid == 1896) {
                            window.location = "map://leftClick()";
                        } else {
                            self.jump(self.homeUrl);
                        }
                    },
                    returnHandler: function () { self.backAction(); }
                }
            });


            // 将HeaderView显示出来
            self.headerview.show();
            userInfo = userStore.getUser();

            // 获取退票查询信息
            var refundInfo = flightTicketRefundChangeStore.get();

            // 退票信息超时处理
            refundInfo || self.showWarning404(function () {
                location.reload();
            });

            if (userInfo && userInfo.Auth && refundInfo) {

                // 获取航程ID
                var segId = parseInt(self.request.query.segid);
                if (!segId) {
                    self.back("ticketrefundmultiple");
                    return;
                }
                var value = dataHelper.num2Cnum(segId);

                // 获取已选择的登机人
                var refundFormData = flightTicketRefundFormStore.get() || {};
                refundFormData.segs = refundFormData.segs || [];
                refundFormData.segs[segId - 1] = refundFormData.segs[segId - 1] || {};

                var data = {
                    segId: segId,
                    cnId: value,
                    passengerInfo: refundInfo.segs[segId - 1],
                    selected: refundFormData.segs[segId - 1].psgs || []
                };
                self.renderData(data);
            } else {//用户未登入或登入失效返回首页
                if (!cUtility.isInApp()) {
                    self.jump("/webapp/myctrip/#account/login?from=" + encodeURIComponent(this.getRoot() + '#flightorderdetail'));
                } else {
                    self.showWarning404(function () {
                        location.reload();
                    });
                }
            }

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
        onHide: function () {
            this.hideLoading();
            this.hideWarning404();
            //this.headerview.hide();
        },

        // 确认选择登机人
        selectPassenger: function () {
            var self = this;
            var passengerChecked = $('#ticketRefund_selectpassenger_box .js_passenger.checkbox_b_checked');
            var segId = parseInt(self.request.query.segid) || 0; // 获取航程ID
            segId = Math.max(segId - 1, 0);

            if (passengerChecked.size() <= 0) {

                $('#ticketRefund_selectpassenger_box .js_passengerContainer').addClass("cui-input-error");
                self.showToast("请至少选择一个登机人");
            } else {
                var data = flightTicketRefundFormStore.get() || {};
                data.segs = data.segs || [];
                data.segs[segId] = data.segs[segId] || {};
                //data.segs[segId].psgs = data.segs[segId].psgs || [];
                data.segs[segId].psgs = [];
                data.segs[segId].segid = Math.max(segId + 1, 0);

                // 获取退票查询信息
                var refundInfo = flightTicketRefundChangeStore.get();

                // 退票信息超时处理
                refundInfo || self.showWarning404(function () {
                    location.reload();
                });

                passengerChecked.each(function (index, target) {
                    var passengerIndex = $(target).attr("data-passengerIndex");
                    data.segs[segId].psgs[passengerIndex] = (refundInfo.segs[segId].psgs[passengerIndex]);
                });

                // 存储当前航程所选登机人
                flightTicketRefundFormStore.setAttr(data);
                self.back("ticketrefundmultiple");

            }
        },

        checkboxAction: function (e) {
            var el = $(e.currentTarget);

            if (el.hasClass('flt_discheck')) {
                return false;
            }

            var label = el.find('label');
            var checkedClass = label.hasClass('checkbox_wrap_b') ? 'checkbox_b_checked' : 'checkbox_bs_checked';
            var action = label.hasClass(checkedClass) ? "removeClass" : "addClass";

            label[action](checkedClass);
        }
    });
    return View;
});

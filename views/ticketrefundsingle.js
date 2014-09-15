define(['cSales','libs', 'c', 'CommonStore', 'FlightStore', 'FlightModel', 'cBasePageView', buildViewTemplatesPath('ticketrefundsingle.html'), 'cUtility', 'cWidgetFactory', 'cWidgetGuider'], function (cSales, libs, c, CommonStore, FlightStore, FlightModel, BasePageView, html, cUtility, WidgetFactory) {

    /************
    *@description : store 引用
    ************/
    var salesStore = CommonStore.SalesObjectStore.getInstance(),
        userStore = CommonStore.UserStore.getInstance()

    /************
    *@description : model 引用
    ************/
    var flightTicketRefundChangeModel = FlightModel.FlightTicketRefundChangeModel.getInstance(), // 机票退改签查询Model
        orderParamStore = FlightStore.FlightOrderParamStore.getInstance(), // 用户的订单参数信息  
        flightTicketRefundModel = FlightModel.FlightTicketRefundModel.getInstance(),  // 机票退票申请       
        flightOrderDetailStore = FlightStore.FlightOrderDetailStore.getInstance();

    var cui = c.ui,
        cbase = c.base,
        userInfo = userStore.getUser(); //用户信息

    /************
    *@description : view中使用的常量
    ************/
    var viewConstant = {
        PAGETITLE: '退票申请'
    };

    var dataHelper = {

        // view 渲染使用的数据
        viewData: {},

        // 字符串生成
        stringFormat: function () {
            if (arguments.length == 0)
                return "";
            if (arguments.length == 1)
                return arguments[0];
            var reg = /{(\d+)?}/g;
            var args = arguments;
            var result = arguments[0].replace(reg, function ($0, $1) { return args[parseInt($1) + 1]; });
            return result;
        },

        // 获取退改签信息
        getRefundChangeInfo: function (view, callBack) {
            var param = orderParamStore.get(); // 获取查询参数
            var orderDetail = flightOrderDetailStore.get(); // 订单详情

            if (orderDetail && param && param.Id) {

                view.backUrl = param.url || view.backUrl;
                view.showLoading();
                flightTicketRefundChangeModel.setParam('flag', 0);
                flightTicketRefundChangeModel.setParam('reqtype', 1);
                flightTicketRefundChangeModel.setParam('oid', param.Id);

                flightTicketRefundChangeModel.excute(function (data) {

                    if (dataHelper.checkData(data)) {
                        view.hideLoading();

                        data.segs[0].psgs = dataHelper.passengerSort(data.segs[0].psgs);
                        dataHelper.viewData = data;
                        if (data && data.head && data.head.errcode == 0) {
                            data.orderDetail = orderDetail;
                            view.turning();
                            view.renderData(data);
                        } else {
                            view.showWarning404(function () {
                                location.reload();
                            });
                        }
                    } else {
                        view.hideLoading();
                        view.showWarning404(function () {
                            location.reload();
                        });
                    }
                }, function (err) {
                    view.hideLoading();
                    view.showWarning404(function () {
                        location.reload();
                    });
                }, true, view, function () {
                    view.hideLoading();
                    view.showWarning404(function () {
                        location.reload();
                    });
                });
            } else {
                view.jump(view.homeUrl);
            }
        },

        // 登记人排序
        // 服务端实现排序后，此处客户端排序方法可去除
        passengerSort: function (passengerList) {
            var passengerCount = passengerList.length;
            var result = [];
            var setIndex = function (index, passenger) {
                index = index || result.length;
                result[index] = result[index] || [];
                result[index].push(passenger);
            };

            // 票号状态显示优先级
            var orderMap = {
                "未使用": 1,
                "已退票": 4,
                "使用": 6,
                "退票申请中": 9,
                "改签申请中": 8,
                "已过期": 7,
                "退票办理中": 10,
                "已退票待退款": 11,
                "未确定": 2,
                "退票": 5
            };

            var startSort = function () {
                var targetIndex;
                var sortResult = [];
                for (var passengerIndex = 0; passengerIndex < passengerCount; passengerIndex++) {
                    var activePassenger = passengerList[passengerIndex];
                    targetIndex = orderMap[activePassenger.status];
                    setIndex(targetIndex, activePassenger);
                    activePassenger.status = dataHelper.getStatusText(activePassenger.status);
                }
                for (var orderTypeIndex = 0; orderTypeIndex < result.length; orderTypeIndex++) {
                    if (result[orderTypeIndex]) {
                        sortResult = sortResult.concat(result[orderTypeIndex]);
                    }
                }
                return sortResult
            };

            return startSort();
        },

        // 票号状态映射为前台显示文字
        getStatusText: function (key) {
            var textMap = {
                "未使用": "",
                "已退票": "已退票",
                "使用": "已使用",
                "退票申请中": "退票申请中",
                "改签申请中": "改签申请中",
                "已过期": "已过期",
                "退票办理中": "退票办理中",
                "已退票待退款": "已退票待退款",
                "未确定": "",
                "退票": "已退票"
            };
            return textMap[key] || key;
        },
        //数据检测
        checkData: function (data) {
            try {
                if (data.tktinfo && data.tktinfo.expired && data.segs) {
                    if (data.segs.length > 0) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    false;
                }
            } catch (e) {
                this.hideLoading();
                this.showToast(e.message)
                return false;
            }
        }
    };

    var View = BasePageView.extend({
        pageid: '214393',
        tpl: html,
        hasAd: true,
        homeUrl: "/html5",
        //backUrl: "filghtordermodify",
        render: function () {
            this.$el.html(this.tpl);
            this.elsBox = {
                ticketRefund_onePath_tpl: this.$el.find('#ticketRefund_onePath_tpl'), // 单程模板
                ticketRefund_box: this.$el.find('#ticketRefund_box')  //容器                
            };
            this.ticketRefund_tpl_creater = _.template(this.elsBox.ticketRefund_onePath_tpl.html());
        },
        renderData: function (data) {
            var self = this;
            data.cDate = cbase.Date; // 模板中使用
            var finfo = flightOrderDetailStore.get();
            data["flightInfos"] = finfo["flightInfos"];

            var ticketRefund_item = self.ticketRefund_tpl_creater(data);
            self.elsBox.ticketRefund_box.html(ticketRefund_item);
        },

        backAction: function () {
            //if (orderParamStore) { orderParamStore.remove(); }
            userInfo = userStore.getUser();
            if (userInfo && userInfo.Auth) {
                this.back("flightorderdetail");

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
            "click #searchlistsubmit": "showAlert",
            "click .js_checkbox": "checkboxAction"
        },
        onCreate: function () {
            orderParamStore.get() || this.jump(this.homeUrl);
            this.injectHeaderView();
            this.render();
        },
        onShow: function () {
            this.setTitle(viewConstant.PAGETITLE);
        },
        onLoad: function () {
            var self = this;
            //self.turning();

            //对HeaderView设置数据
            var isShowHome = true;
            var _sales = salesStore.get();
            if (_sales && _sales.sid && (+_sales.sid == 1575 || +_sales.sid == 1867)) {
                isShowHome = false;
            }
            self.headerview.set({
                title: viewConstant.PAGETITLE,
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

            dataHelper.getRefundChangeInfo(self, function (err, data) {
            });


//            if (userInfo && userInfo.Auth) {
//                
//            } else {//用户未登入或登入失效返回首页
//                if (!cUtility.isInApp()) {
//                    self.jump("/webapp/myctrip/#account/login?from=" + encodeURIComponent(this.getRoot() + '#flightorderdetail'));
//                } else {
//                    self.showWarning404(function () {
//                        location.reload();
//                    });
//                }
//            }

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
        },

        // 生成提示框
        popup: function () {
            var self = this;
            return new cui.Alert({
                title: '提示信息',
                message: '',
                showTitle: true,
                buttons: [
                    {
                        text: '取消',
                        click: function () {
                            this.hide();
                        },
                        type: c.ui.Alert.STYLE_CANCEL
                    },

                    {
                        text: '确认',
                        click: function () {
                            this.hide();
                            self.submit();
                        },
                        type: c.ui.Alert.STYLE_CANCELSTYLE_CONFIRM
                    }

                ]
            });
        },

        // 提交 退票申请 表单
        submit: function () {
            var self = this;
            self.showLoading();
            flightTicketRefundModel.excute(function (data) {
                self.hideLoading();
                self.forward("ticketrefundsucceed") // 提交成功后，跳转至申请完成页
            }, function (err) {
                self.hideLoading();
                self.showToast(err.msg)
            })
        },

        // 弹层确认提示
        showAlert: function () {
            var self = this;
            var passengerChecked = $('.js_passenger.checkbox_b_checked');
            var param = orderParamStore.get(); //获取查询参数

            // 组装退票申请 request 数据
            var requestParam = {
                oid: param.Id,
                flag: 0,
                segs: [],
                continfo: {
                    "comment": $("#comment").val(),
                    "name": dataHelper.viewData.tktinfo.name,
                    "phone": dataHelper.viewData.tktinfo.phone
                }
            };

            var feeForRefund = 0;
            var insamount = 0;
            var fee = 0;
            var refundremark;
            var refundtype;
            passengerChecked.each(function (index, target) {

                var activeSeg = dataHelper.viewData.segs[0]; // 单程航段信息默认取0
                var activePassenger = activeSeg.psgs[index]; // 当前乘客信息

                var requestInfo = { // 退票航段信息
                    segid: activeSeg.segid,
                    psgname: activePassenger.name,
                    svrs: []
                };

                var isRefundService = $("#js_ticketRefund_onePath_refundSVR").hasClass("checkbox_bs_checked");
                if (isRefundService) {
                    requestInfo.svrs.push({
                        svrtype: activePassenger.svrs.type,
                        svruser: activePassenger.svrs.user,
                        cnt: activePassenger.svrs.arg
                    });
                }

                if (dataHelper.viewData.tktinfo.triptype == 1 && dataHelper.viewData.segs.length > 1) {
                    for (var segskey in dataHelper.viewData.segs) {
                        requestInfo.segid = dataHelper.viewData.segs[segskey].segid;
                        requestParam.segs.push({
                            segid: dataHelper.viewData.segs[segskey].segid,
                            psgname: requestInfo.name,
                            svrs: requestInfo.svrs
                        });
                    }
                } else {
                    requestParam.segs.push(requestInfo);
                }
                feeForRefund += Math.round(activePassenger.pay.refundfee) || 0; // 计算退票费
                insamount += Math.round(activePassenger.pay.insamount) || 0; // 统计已生效保险
                fee += Math.round(activePassenger.pay.fee) || 0; // 统计外卡费
                refundremark = refundremark || activePassenger.pay.refundremark; // 退票描述
                refundtype = refundtype || activePassenger.pay.refundtype; // 退票描述

            });

            flightTicketRefundModel.setParam(requestParam);

            var stringFormat = dataHelper.stringFormat;

            // 订单详情
            var orderDetail = dataHelper.viewData.orderDetail;

            // 第一程航班信息
            var flightInfo = orderDetail.flightInfos[0];

            //处理服务器没有把收费快递按照情况二处理
            if (flightOrderDetailStore.getAttr('delivery') == '收费快递') {
                refundtype = 2;
                refundremark = refundremark ? '' : '<p>其他费用待定</p>';
            }

            var msg = [];

            switch (refundtype) {
                case 1:
                    msg.push("<div class='p10'>");
                    msg.push(stringFormat("<p>收取退票费：&yen;{0}</p>", feeForRefund));
                    insamount && msg.push(stringFormat("<p>已生效保险：&yen;{0}</p>", insamount));
                    fee && msg.push(stringFormat("<p>外卡费用：&yen;{0}</p>", fee));
                    msg.push(stringFormat("<p>收取费用总计：&yen;{0}</p>", feeForRefund + insamount + fee));
                    msg.push(stringFormat("点击确认后我们将开始为您处理退票，确认提交吗？"));
                    msg.push("</div>");
                    break;
                case 2:
                    msg.push("<div class='p10'>");
                    msg.push(stringFormat("<p>收取退票费：&yen;{0}</p>", feeForRefund));
                    insamount && msg.push(stringFormat("<p>已生效保险：&yen;{0}</p>", insamount));
                    msg.push(refundremark);
                    msg.push(stringFormat("点击确认后我们将开始为您处理退票，确认提交吗？"));
                    msg.push("</div>");
                    break;
                case 3:
                    msg.push("<div class='p10'>");
                    msg.push(refundremark);
                    msg.push(stringFormat("点击确认后我们将开始为您处理退票，确认提交吗？"));
                    msg.push("</div>");
                    break;
            }
            var popupWindow = self.popup();
            popupWindow.setViewData({
                message: msg.join(""),
                title: "提示信息"
            });

            if (passengerChecked.size() > 0) {
                popupWindow.show();
            } else {
                self.showToast("请至少选择一个登机人");
                //edit by wyren@ctrip.com 2014-4-14
                $('li.js_checkbox:not(.flt_discheck)').each(function (index, item) {
                    $(item).addClass('highlight');
                })
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

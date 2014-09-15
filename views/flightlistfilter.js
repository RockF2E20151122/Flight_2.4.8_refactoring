define(['libs', 'c', 'FlightModel', 'FlightStore', 'cMultipleDate', buildViewTemplatesPath('flightlistfilter.html')], function (libs, c, FlightModel, FlightStore, cMultipleDate, html) {
    var cui = c.ui,
        utility = c.utility;
    var View = c.view.extend({
        pageid: '212008',
        tpl: html,
        flightSearchSubjoin: FlightStore.FlightSearchSubjoinStore.getInstance(),
        flightList: FlightModel.FlightListModel.getInstance(),
        flightSearchStore: FlightStore.FlightSearchStore.getInstance(),
        flightFilterStore: FlightStore.FlightFilterStore.getInstance(),
        flightTakeOfTimeStore: FlightStore.FlightTakeOfTimeStore.getInstance(),
        flightCabinStore: FlightStore.FlightCabinStore.getInstance(),
        lastcuritem: null,
        curitem: null,
        tripType: 1,
        baseDataModel: null,
        cacheDepartFilterType: null,
        cacheArriveFilterType: null,
        basedata: null,
        menus: [
            '起飞时段',
            '舱位选择',
            '航空公司'
        ],
        render: function () {
            this.viewdata.req = this.request;
            this.$el.html(this.tpl);
            this.buildhtml = _.template(this.tpl);
        },
        buildElement: function () {
            this.els = {
                elmenus: this.$el.find('#menus'),
                elmenusli: this.$el.find('#menus li'),
                elitems: this.$el.find('#itemsbox ul'),
                elitemtpl: this.$el.find('#itemstpl'),
                elitemtpl2: this.$el.find('#itemstpl2'),
                elmenutpl: this.$el.find('#menutpl')
            };
        },
        events: {
            'click #js_return': 'backAction',
            'click #menus li': 'tapMenusAction',
            'click #itemsbox li': 'tapItemAction'
        },
        tapItemAction: function (e) {
            var cur = $(e.currentTarget), data,
                datatype = cur.attr('data-type'),
                datavalue = cur.attr('data-value');
            this.lastcuritem = cur.siblings('.choosed');
            this.curitem = cur;
            cur.siblings().removeClass('choosed');
            cur.addClass('choosed');
            this.showLoading();
            //获得所有的查询的数据
            this.checkExistData(datatype, datavalue, function () {
                tripType = this.flightSearchStore.getAttr('__tripType');
                if (tripType == 2) {
                    this.back('backlist');
                } else {
                    this.back('list');
                }
                this.hideLoading();
            }, function () {
                this.back('list');
                this.hideLoading();
            });

        },
        checkExistData: function (datatype, datavalue, succeed, error) {

            this.showLoading();
            //筛选时间和航空公司时，在本地进行筛选            
            this.flightList.excute(function (data) {
                console.log("==================================================");
                console.log(data);
                console.log("==================================================");
                var list = data.items;
                console.log(
                    this.flightSearchSubjoin.getAttr('departfilter-value'),
                    this.flightSearchSubjoin.getAttr('departfilter-type'),
                    datatype,
                    datavalue);
                switch (datatype) {
                    case '0':
                        if (datavalue.indexOf('-') > 0) {
                            var ts = datavalue.split('-'),
                                st = parseInt(ts[0].replace(':', '')),
                                dt = parseInt(ts[1].replace(':', '')),
                                regtime = /^\d{4}[-\/]\d{1,2}[-\/]\d{1,2}\s+(\d{1,2}:\d{1,2}):\d{1,2}$/i;
                            list = _.filter(list, function (d) {
                                var t = regtime.exec(d.dTime);
                                t = t && t[1];
                                var dtime = parseInt(t.replace(':', ''));
                                return st <= dtime && dtime <= dt;
                            });
                        } else {
                            this.clearCurFilter();
                            this.hideLoading();
                            succeed.call(this);
                            return;
                        }
                        break;
                    case '1':


                        if (datavalue.length) {
                            switch (this.tripType) {
                                case 1:
                                    this.flightSearchSubjoin.setAttr('departfilter-type-cabin', datavalue);
                                    break;
                                case 2:
                                    this.flightSearchSubjoin.setAttr('arrivefilter-type-cabin', datavalue);
                                    break;
                            }


                            var cldp = datavalue;

                            list = $.grep(list, function (k, i) {
                                k["cabins"] = $.grep(k["cabins"], function (n, j) {
                                    if (cldp == 3) {//头等舱 
                                        return (n["classForDisp"] === 5 || (n["class"] == 3)) || (n["classForDisp"] === 4 || (n["class"] == 2));
                                    } else if (cldp == 0) {//经济舱 比较特殊 当 classForDisp = 6 或者 class !=2 or class !=3
                                        return (n["classForDisp"] === 6 || (n["class"] != 2 && n["class"] != 3));
                                    }  else {
                                        return false;
                                    }
                                });
                                return (k["cabins"] && k["cabins"].length > 0);
                            });



                        } else {
                            switch (this.tripType) {
                                case 1:
                                    this.flightSearchSubjoin.removeAttr('departfilter-type-cabin');
                                    break;
                                case 2:
                                    this.flightSearchSubjoin.removeAttr('arrivefilter-type-cabin');
                                    break;
                            }

                            this.clearCurFilter();
                            this.hideLoading();
                            succeed.call(this);
                            return;
                        }



                        break;
                    case '2':
                        if (datavalue.length) {
                            list = _.filter(list, function (d) {
                                return datavalue === d.airlineCode;
                            });
                        } else {
                            this.clearCurFilter();
                            this.hideLoading();
                            succeed.call(this);
                            return;
                        }
                        break;
                }
                //增加判断list 防止list为null时异常 2014-1-21 caof
                if (list && list.length) {
                    //当有数据时才update type 修复过滤多次后数据为空bug
                    switch (this.tripType) {
                        case 1:
                            this.flightSearchSubjoin.setAttr('departfilter-type', this.cacheDepartFilterType);
                            break;
                        case 2:
                            this.flightSearchSubjoin.setAttr('arrivefilter-type', this.cacheArriveFilterType);
                            break;
                    }
                    this.setCurFilter(datatype, datavalue);
                    this.hideLoading();
                    succeed.call(this);
                } else {
                    this.hideLoading();
                    this.curitem && this.curitem.removeClass('choosed');
                    this.lastcuritem && this.lastcuritem.addClass('choosed');
                    this.showToast('很抱歉，未查询到您指定的航班记录，请仔细检查重新输入', 1);
                }
            }, function () {
                this.showToast('数据请求失败', 1, $.proxy(function () {
                    this.hideLoading();
                    this.curitem && this.curitem.removeClass('choosed');
                    this.lastcuritem && this.lastcuritem.addClass('choosed');
                    error && error.call(this);
                }, this));
            }, false, this);

        },
        clearCurFilter: function () {
            switch (this.tripType) {
                case 1:
                    this.flightSearchSubjoin.removeAttr('departfilter-type');
                    this.flightSearchSubjoin.removeAttr('departfilter-value');
                    this.flightSearchSubjoin.removeAttr('departfilter-type');
                    this.flightSearchSubjoin.removeAttr('departfilter-value');
                    break;
                case 2:
                    this.flightSearchSubjoin.removeAttr('arrivefilter-type');
                    this.flightSearchSubjoin.removeAttr('arrivefilter-value');
                    this.flightSearchSubjoin.removeAttr('arrivefilter-type');
                    this.flightSearchSubjoin.removeAttr('arrivefilter-value');
                    break;
            }
        },
        setCurFilter: function (datatype, datavalue) {
            switch (this.tripType) {
                case 1:
                    this.flightSearchSubjoin.setAttr('departfilter-type', datatype);
                    this.flightSearchSubjoin.setAttr('departfilter-value', datavalue);
                    this.flightSearchSubjoin.setAttr('departfilter-type', datatype);
                    this.flightSearchSubjoin.setAttr('departfilter-value', datavalue);
                    break;
                case 2:
                    this.flightSearchSubjoin.setAttr('arrivefilter-type', datatype);
                    this.flightSearchSubjoin.setAttr('arrivefilter-value', datavalue);
                    this.flightSearchSubjoin.setAttr('arrivefilter-type', datatype);
                    this.flightSearchSubjoin.setAttr('arrivefilter-value', datavalue);
                    break;
            }
        },
        tapMenusAction: function (e) {
            var cur = $(e.currentTarget), type = cur.attr('data-type');
            //点击type时将当前type存储至内部空间
            switch (this.tripType) {
                case 1:
                    this.cacheDepartFilterType = cur.attr('data-type');
                    //                    this.flightSearchSubjoin.setAttr('departfilter-type', cur.attr('data-type'));
                    break;
                case 2:
                    this.cacheArriveFilterType = cur.attr('data-type');
                    //                    this.flightSearchSubjoin.setAttr('arrivefilter-type', cur.attr('data-type'));
                    break;
            }
            this.els.elmenusli.removeClass('hover');
            cur.addClass('hover');
            this.els.elitems.hide();
            this.els.elitems.filter("[data-type='" + type + "']").show();
        },
        backAction: function () {
            switch (this.tripType) {
                case 1:
                    this.back('list');
                    break;
                case 2:
                    this.back('backlist');
                    break;
            }
        },
        buildEvent: function () {
        },
        updatePage: function (callback) {
            this.ReDrawView();
            callback.call(this);
        },
        ReDrawView: function () {
            var menuIndex = 0, selected = 0;
            switch (this.tripType) {
                case 1:
                    menuIndex = this.flightSearchSubjoin.getAttr('departfilter-type') || 0;
                    selected = this.flightSearchSubjoin.getAttr('departfilter-value') || 0;
                    break;
                case 2:
                    menuIndex = this.flightSearchSubjoin.getAttr('arrivefilter-type') || 0;
                    selected = this.flightSearchSubjoin.getAttr('arrivefilter-value') || 0;
                    break;
            }
            var viewdata = {
                menus: this.menus,
                flightTakeOfTime: this.flightTakeOfTimeStore.get(),
                flightCabin: this.flightCabinStore.get(),
                FlightAirline: this.basedata.FlightAirline,
                filtermenuIndex: menuIndex,
                filterselected: selected
            };
            this.$el.html(this.buildhtml(viewdata));
            this.buildElement();
            this.els.elitems.filter("[data-type='" + menuIndex + "']").css('display', 'block');
        },
        //首次记载view，创建view
        onCreate: function () {
            this.baseDataModel = new cMultipleDate({
                'models': {
                    'FlightAirline': FlightModel.FlightAirlineModel.getInstance()
                }
            });
            this.render();
            this.buildEvent();
        },
        //加载数据时
        onLoad: function () {
            this.tripType = this.flightSearchStore.getAttr('__tripType');
            if (this.tripType == '1') {
                this.pageid = '212008';
            } else if (this.tripType == '2') {
                this.pageid = '212010';;
            }
            this.showLoading();
            //加载基础数据
            this.baseDataModel.excute(function (data) {
                this.basedata = data;
                this.basedata.FlightAirline = utility.grep(this.basedata.FlightAirline, function (v, k) {
                    return v.countryId === 0;
                }, true).sort(function (a, b) { return a.hotFlag - b.hotFlag; });

                //更新页面
                this.updatePage(function () {
                    this.turning();
                    this.hideLoading();
                });
            }, function (e) {

            }, false, this);
        },
        //调用turning方法时触发
        onShow: function () {
            this.setTitle('筛选');
        },
        onHide: function () { this.hideLoading(); }
    });
    return View;
});

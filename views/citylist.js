define(['libs', 'c', 'FlightModel', 'cDataSource', 'FlightStore', 'cMultipleDate', buildViewTemplatesPath('citylist.html'), 'cGeoService', 'adLoad'],
    function (libs, c, FlightModel, cDataSource, FlightStore, cMultipleDate, html, cGeoService,newLoad) {
    var cui = c.ui;
    var cuiTools = cui.Tools,
        GeoLocation = cGeoService.GeoLocation;
    var newLoad = new newLoad();
    var View = c.view.extend({
        pageid: '212007',
        tpl: html,
        flightStore: FlightStore.FlightSearchStore.getInstance(),
        flightSearchSubjoin: FlightStore.FlightSearchSubjoinStore.getInstance(),
        lowestPriceSearchStore: FlightStore.LowestPriceSearchStore.getInstance(),
        FlightCityListModel: FlightModel.FlightCityListModel.getInstance(),
        FlightInterCityListModel: FlightModel.FlightInterCityListModel.getInstance(),
        isInlandLoaded: false,
        isInterLoaded: false,
        dateSource: new cDataSource(),
        selectItem: null,
        cityType: null,
        cityMode: 1,
        baseDataModel: null,
        basedata: null,
        hotcitylist: null,
        inlandcitylist: null,
        intercity: null,
        interhotcitylist: null,
        self: null,
        render: function () {
            this.viewdata.req = this.request;
            this.$el.html(this.tpl);
            this.els = {
                elflightcitylisttpl: this.$el.find('#flight-citylist-tpl'),
                elflightcitylistboxofinter: this.$el.find('#flightcitylistbox .intercity'),
                elflightcitylistboxofinland: this.$el.find('#flightcitylistbox .inlandcity'),
                elflightcitylistbox: this.$el.find('#flightcitylistbox'),
                elflightcitykeyword: this.$el.find('#flight_city_keyword'),
                elhistory_close: this.$el.find('.history_close'),
                elcitytabli: this.$el.find('.city_tab li'),
                elcitybox: this.$el.find('.citybox'),
                elinlandcity: this.$el.find('.inlandcity'),
                elintercity: this.$el.find('.intercity'),
                elintercitylisttpl: this.$el.find('#intercitylisttpl'),
                elassociate: this.$el.find('#associate'),
                eltabbox: this.$el.find('.cont_blue2')
            };
            this.cityListTplfun = _.template(this.els.elflightcitylisttpl.html());
            this.intercityListTplfun = _.template(this.els.elintercitylisttpl.html());

        },
        events: {
            'click #js_return': 'backAction',
            'click .city-group-title': 'cityGroupTitleClick',
            'input #flight_city_keyword': 'flightCityKeyWordInput',
            'focus #flight_city_keyword': 'flightCityKeyWordFocus',
            'click .city-item': 'CityItemonClick',
            'click .history_close': 'historyCloseonClick',
            'click .city_tab li': 'switchCityMode',
            'click .flight-ctsrh-cancel': 'flightCityKeyWordFocusout',
           // 'click .flight-getcity': 'geoCity',
            'click .flight-ctlts li': 'moveToCity'//滑动拼音定位城市
        },

        backAction: function () {
            this.back('index');
        },


        CityItemonClick: function (e) {
            var cur = $(e.currentTarget),
                info = cur.attr("data-info"),
                index = cur.attr("data-index"),
                code = cur.attr('data-code'),
                id = parseInt(cur.attr('data-id')),
                name = cur.attr('data-name'),
                key = cur.attr('data-key'),
                mode = cur.attr('data-mode'),
                countryid = parseInt(cur.attr('data-countryid')),
                flightType = parseInt(this.flightStore.getAttr('tabtype')),
                aportcode = cur.attr('data-aportcode') || '';

            //当选中城市为国外则默认选中国际城市
            if (countryid === 0) {
                this.flightStore.setAttr('tofltintl', 1);
                mode = 2;   //点击国内的香港也要设置
            } else {
                this.flightStore.setAttr('tofltintl', 0);
            }


            switch (this.cityType) {
                case 1:
                    this.flightStore.setAttr('dmode', mode);
                    this.flightStore.setSearchDetails(0, 'dCtyCode', code);
                    this.flightStore.setSearchDetails(0, 'dcityName', name);
                    this.flightStore.setSearchDetails(0, 'dkey', key);
                    this.flightStore.setSearchDetails(0, 'dCtyId', id);
                    this.flightStore.setSearchDetails(0, 'dDportCode', aportcode);
                    this.flightStore.setSearchDetails(1, 'aCtyCode', code);
                    this.flightStore.setSearchDetails(1, 'acityName', name);
                    this.flightStore.setSearchDetails(1, 'akey', key);
                    this.flightStore.setSearchDetails(1, 'aCtyId', id);
                    /*机场三字码*/
                    this.flightStore.setSearchDetails(1, 'aAportCode', aportcode);
                    //设置低价日历的查询store
                    this.lowestPriceSearchStore.setAttr('dCty', code);

                    var historycitys = this.flightStore.getAttr(countryid === 1 ? 'inlanddhistory' : 'interdhistory') || []
                    historycitys = historycitys.filter(function (c, i) {

                        return c && c.code !== code;
                    })
                    historycitys.unshift(JSON.parse(info));
                    if (historycitys.length > 6) {
                        historycitys.splice(6, historycitys.length)
                    }
                    this.flightStore.setAttr(countryid === 1 ? 'inlanddhistory' : 'interdhistory', historycitys)
                    break;
                case 2:
                    this.flightStore.setAttr('amode', mode);
                    this.flightStore.setSearchDetails(0, 'aCtyCode', code);
                    this.flightStore.setSearchDetails(0, 'acityName', name);
                    this.flightStore.setSearchDetails(0, 'akey', key);
                    this.flightStore.setSearchDetails(0, 'aCtyId', id);
                    this.flightStore.setSearchDetails(0, 'aAportCode', aportcode);
                    this.flightStore.setSearchDetails(1, 'dCtyCode', id);
                    this.flightStore.setSearchDetails(1, 'dcityName', name);
                    this.flightStore.setSearchDetails(1, 'dkey', key);
                    this.flightStore.setSearchDetails(1, 'dCtyId', id);
                    /*机场三字码*/
                    this.flightStore.setSearchDetails(1, 'dDportCode', aportcode);
                    //设置低价日历的查询store
                    this.lowestPriceSearchStore.setAttr('aCty', code);

                    var historycitys = this.flightStore.getAttr(countryid === 1 ? 'inlandahistory' : 'interahistory') || [];
                    historycitys = historycitys.filter(function (c, i) {
                        return c && c.code !== code;
                    })
                    historycitys.unshift(JSON.parse(info));
                    if (historycitys.length > 6) {
                        historycitys.splice(6, historycitys.length)
                    }
                    this.flightStore.setAttr(countryid === 1 ? 'inlandahistory' : 'interahistory', historycitys)
                    break;
            }
            this.flightCityKeyWordFocusout();
            this.back('index');
        },

        /*切换国内和国际列表*/
        switchCityMode: function (e) {
            var cur = $(e.currentTarget);
            this.els.elcitytabli.removeClass('cityTabCrt');
            cur.addClass('cityTabCrt');
            this.cityMode = parseInt(cur.attr('data-mode'));
            this.flightSearchSubjoin.setAttr('citymode', this.cityMode);

            switch (this.cityMode) {
                case 1:
                    this.els.elcitybox.css({ 'display': 'none' });
                    this.els.elinlandcity.css({ 'display': 'block' });
                    //if (this.$el.find("#inlandcurentcity").css("display") != "none") {
                    //    this.$el.find("#currentkey").show();
                    //}
                    var historycity = this.cityType === 1 ? this.flightStore.getAttr("inlanddhistory") : this.flightStore.getAttr("inlandahistory");
                    if (historycity && historycity.length) {
                        this.$el.find("#historykey").show();
                    }
                    else {
                        this.$el.find("#historykey").hide();
                    }
                    break;
                case 2:
                    this.els.elcitybox.css({ 'display': 'none' });
                    this.els.elintercity.css({ 'display': 'block' });
                    //this.$el.find("#currentkey").hide();
                    var historycity = this.cityType === 1 ? this.flightStore.getAttr("interdhistory") : this.flightStore.getAttr("interahistory");
                    if (historycity && historycity.length) {
                        this.$el.find("#historykey").show();
                    }
                    else {
                        this.$el.find("#historykey").hide();
                    }
                    break;
            }
            this.$el.find('.flight-ctlts').children().css('color', '');

        },
        historyCloseonClick: function () {
            this.els.elflightcitykeyword.val('');
            this.els.elflightcitykeyword.trigger('input');
        },
        cityGroupTitleClick: function (e) {
            var cur = $(e.currentTarget);
            var curul = cur.next('ul');
            curul.toggle();

        },
        //关键字搜索，
        /*
        当用户点击搜索框时，搜索框往上移 遮住头部的bar条，下面的内容也为空。同时，用户搜索时 提供联想功能。
        当用户点击"取消"时，页面恢复到原来的样式。
        */
        flightCityKeyWordInput: function (e) {

            var cur = $(e.currentTarget),
                keyword = cur.val().replace(/\.|\{|\}|\[|\]|\*|\^/img, '').toLowerCase(),
                findBox;

            setTimeout($.proxy(function () {
                if (keyword) {
                    this.els.eltabbox.hide();
                    this.els.elassociate.hide();
                    this.els.elassociate.empty();
                    this.els.elflightcitylistbox.hide();
                    var inlandlist = this.els.elinlandcity.find('.nothotcity li[data-filter*=' + keyword + ']');
                    var interlist = this.els.elintercity.find('.nothotcity li[data-filter*=' + keyword + ']');
                    inlandlist.sort(function (a, b) { return $(a).attr('data-hotflag') - $(b).attr('data-hotflag'); });
                    interlist.sort(function (a, b) { return $(a).attr('data-hotflag') - $(b).attr('data-hotflag'); });
                    var ids = {};
                    //过滤掉
                    _.each(inlandlist, $.proxy(function (el) {
                        var $el = $(el), fattr = $el.attr('data-filter').split(' ');
                        if (function () {
                            for (var i = 0, len = fattr.length; i < len; i++) {
                                if (fattr[i].indexOf(keyword) === 0) return true;
                        }
                            return false;
                        }()) {
                            var id = $el.attr('data-id');
                            if (ids[id]) {
                                this.els.elassociate.find('[data-id="' + id + '"]').remove();
                            }
                            this.els.elassociate.append(el.cloneNode(true));
                            ids[id] = true;
                        }
                    }, this));
                    _.each(interlist, $.proxy(function (el) {
                        var $el = $(el), fattr = $el.attr('data-filter').split(' ');
                        if (function () {
                            for (var i = 0, len = fattr.length; i < len; i++) {
                                if (fattr[i].indexOf(keyword) === 0) return true;
                        }
                            return false;
                        }()) {
                            var id = $el.attr('data-id');
                            if (ids[id]) {
                                this.els.elassociate.find('[data-id="' + id + '"]').remove();
                            }
                            this.els.elassociate.append(el.cloneNode(true));
                        }
                    }, this));
                    if (!this.els.elassociate.find('li').length) {
                        this.els.elassociate.html('<li class="city-item-empty">没有结果</li>');
                    }
                    this.els.elassociate.show();
                }

            }, this), 0);
        },
        /*
        点击搜索框的时候隐藏右边字母排列，同时显示取消按钮
        */
        flightCityKeyWordFocus: function (e) {
            var cur = $(e.currentTarget),
                keyword = cur.val().replace(/\.|\{|\}|\[|\]|\*|\^/img, '').toLowerCase();
            if (keyword) {
                return;
            }
            this.$el.find(".header").hide();
            this.$el.find(".flight-ctsfixed-blank").hide();
            this.$el.find("#titlediv").removeClass('flight-ctsfixed');
            this.els.eltabbox.hide();
            this.els.elassociate.hide();
            this.els.elassociate.empty();
            this.els.elflightcitylistbox.hide();
            this.$el.find('#tabtilte').hide();
            this.$el.find(".flight-ctsrh-cancel").removeClass('js_hide');
            this.$el.find(".search_wrap").addClass('withcancel');
            this.$el.find(".flight-ctltsfixed").addClass('js_hide');

        },
        /*
        焦点离开搜索框的时候显示右边字母排列
      */
        flightCityKeyWordFocusout: function () {
            this.$el.find(".header").show();
            this.$el.find("#titlediv").addClass('flight-ctsfixed');
            this.$el.find(".flight-ctsfixed-blank").show();
            this.els.eltabbox.show();
            this.els.elassociate.hide();
            this.els.elflightcitylistbox.show();
            this.$el.find('#tabtilte').show();
            this.$el.find("#flight_city_keyword").val('');
            this.$el.find(".flight-ctsrh-cancel").addClass('js_hide');
            this.$el.find(".flight-ctltsfixed").removeClass('js_hide');
            this.$el.find(".search_wrap").removeClass('withcancel');
        },

        buildEvent: function () {
            cui.InputClear(this.els.elflightcitykeyword, null, null, {
                top: 10
            });
        },
        updatePage: function (callback) {
            this.els.elcitytabli.removeClass('cityTabCrt');
            this.els.elcitytabli.each($.proxy(function (k, v) {
                var me = $(v);
                if (me.attr('data-mode') == this.cityMode) {
                    me.addClass('cityTabCrt');
                }
            }, this));

            this.loadInlandCity(function () {
                this.loadInterCity(function () {
                    switch (this.cityMode) {
                        case 1:
                            this.els.elcitybox.css({ 'display': 'none' });
                            this.els.elinlandcity.css({ 'display': 'block' });
                           // this.$el.find("#currentkey").show();

                            break;
                        case 2:
                            this.els.elcitybox.css({ 'display': 'none' });
                            this.els.elintercity.css({ 'display': 'block' });
                           // this.$el.find("#currentkey").hide();
                            break;
                    }
                    callback && callback.call(this);
                });
            });


        },
        /*
        渲染国内城市
        */
        loadInlandCity: function (callback) {
            if (!this.isInlandLoaded) {
               // this.showLoading();
                newLoad.show();
                this.FlightCityListModel.excute(function (data) {
                    this.dateSource.setData(data.cities);
                    var visited = {}, visited2 = {};

                    var datalist = this.dateSource.groupBy('initial', function (v) {
                        var reuslt = !visited[v.id];
                        visited[v.id] = true;
                        return reuslt;
                    }),
                    hotCitys = this.dateSource.filter(function (n, v) {
                        var result = ((v.flag & 16) === 16) && !visited2[v.id];
                        if (result) visited2[v.id] = true;
                        return result;
                    }, function (a, b) { return a.hotFlag - b.hotFlag; });

                    var cityid = this.cityType === 1 ? this.flightStore.getSearchDetails(0, 'dCtyCode') : this.flightStore.getSearchDetails(0, 'aCtyCode');
                    var history = this.cityType === 1 ? this.flightStore.getAttr("inlanddhistory") : this.flightStore.getAttr("inlandahistory");
                    var html = this.cityListTplfun({ keys: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), history: (history || []), datalist: datalist, hotcitys: hotCitys, cityid: cityid });
                    this.els.elinlandcity.css({ 'display': 'none' });;
                    this.els.elinlandcity.html(html);
                    this.els.elinlandcity.css({ 'display': 'block' });;
                    this.els.elflightcitykeyword.val('');
                    this.selectItem = this.els.elflightcitylistboxofinland.find('.cur-selected');
                    this.hideLoading();
                    newLoad.hide();
                    if (this.cityMode == 1) {
                        if (!history || !history.length) {
                            this.$el.find("#historykey").hide();

                        } else {
                            this.$el.find("#historykey").show();
                        }
                    }

                    callback && callback.call(this);
                    this.isInlandLoaded = true;

                }, function (e) {
                    this.hideLoading();
                    newLoad.hide();
                    this.showToast('网络错误', 2);
                }, false, this, function () {
                    this.hideLoading();
                    newLoad.hide();
                });
            }
        },
        /*
       渲染国际城市
       */
        loadInterCity: function (callback) {
            if (!this.isInterLoaded) {
                //this.showLoading();
                //newLoad.show();
                this.FlightInterCityListModel.excute(function (data) {
                    //国际列表
                    var cityid = this.cityType === 1 ? this.flightStore.getSearchDetails(0, 'dCtyCode') : this.flightStore.getSearchDetails(0, 'aCtyCode');
                    var history = this.cityType === 1 ? this.flightStore.getAttr("interdhistory") : this.flightStore.getAttr("interahistory");
                    var html = this.intercityListTplfun({ keys: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), history: history || [], data: data, cityid: cityid });
                    this.els.elintercity.css({ 'display': 'none' });;
                    this.els.elintercity.html(html);
                    this.els.elintercity.css({ 'display': 'block' });;
                    this.selectItem = this.els.elflightcitylistboxofinter.find('.cur-selected');
                    this.hideLoading();
                    newLoad.hide();
                    callback && callback.call(this);
                    this.isInterLoaded = true;
                    if (this.cityMode == 2) {
                        if (!history || !history.length) {
                            this.$el.find("#historykey").hide();
                        } else {
                            this.$el.find("#historykey").show();
                        }
                    }

                }, function (e) {
                    this.hideLoading();
                    newLoad.hide();
                    this.showToast('网络错误', 2);
                }, false, this, function () {
                    this.hideLoading();
                    newLoad.hide();
                });
            }
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
                    var t = cuiTools.getElementPos(parent[0]);
                    window.scrollTo(0, t.top - 60);
                }
            }
        },
        //首次记载view，创建view
        onCreate: function () {
            this.baseDataModel = new cMultipleDate({
                models: {
                    'FlightCityList': FlightModel.FlightCityListModel.getInstance(),
                    'FlightInterCityList': FlightModel.FlightInterCityListModel.getInstance()
                }
            });
            this.render();
            this.buildEvent();

        },
        //加载数据时
        onLoad: function () {
            self = this;
            this.cityType = ({ depart: 1, back: 2 })[this.getPath(0)];
            this.cityMode = 1;
            switch (this.cityType) {
                case 1:
                    this.cityMode = parseInt(this.flightStore.getAttr('dmode')) || 1;
                    break;
                case 2:
                    this.cityMode = parseInt(this.flightStore.getAttr('amode')) || 1;
                    break;
            }
            this.turning();
            this.updatePage(function () {
                this.hideLoading();
                newLoad.hide();
            });
            $(".flight-ctltsfixed-pd").height($(window).height() - 132);

            //document.addEventListener('touchstart', this.touchstartFunc, false);
            //document.addEventListener('touchmove', this.touchmoveFunc, false);
            //document.addEventListener('touchend', this.touchFunc, false);
        },
        /*上下滑动对应的ABCD英文字母时候跳转到对应的城市分组*/
        touchstartFunc: function (e) {
            e.preventDefault();
            var touch = e.touches[0]; //获取第一个触点  
            var x = Number(touch.pageX); //页面触点X坐标  
            var y = Number(touch.pageY); //页面触点Y坐标  
            console.log('X:' + x + ';Y:' + y);
            if ($(e.target).is('li')) {
                $(e.target).parent().children().css("color", '');
                var key = $(e.target).text();
                var grouptitle = self.$el.find('.nothotcity div[data-key="' + key + '"]');
                if (grouptitle.length) {
                    var top = grouptitle.offset().top;
                    console.log(top);
                    window.scrollTo(0, top - 48);

                }
                $(e.target).css("color", "red");
            }

        },
        touchmoveFunc: function (e) {
            e.preventDefault();
            var touch = e.touches[0]; //获取第一个触点  
            var x = Number(touch.pageX); //页面触点X坐标  
            var y = Number(touch.pageY); //页面触点Y坐标  
            console.log('moveX:' + x + ';Y:' + y);
            if ($(e.target).is('li')) {
                $(e.target).parent().children().css("color", '');
                var key = $(e.target).text();
                console.log(key);
                var grouptitle = self.$el.find('.nothotcity div[data-key="' + key + '"]');
                if (grouptitle.length) {
                    var top = grouptitle.offset().top;
                    console.log(top);
                    window.scrollTo(0, top - 48);

                }
                $(e.target).css("color", "red");
            }

        },
        /*跳转到对应城市分组的位置*/
        moveToCity: function (e) {
            var mode = this.$el.find(".cityTabCrt").attr('data-mode');
            var selector = (mode == 1 || !mode ? ".inlandcity" : ".intercity") + ' #' + (+mode == 1 || !mode ? "inland" : "inter");
            $(e.currentTarget).parent().children().css("color", '');
            var key = $(e.currentTarget).text();
            var top = 0;
            switch (key) {
                case "当前":
                    top = this.$el.find(selector + 'curentcity');
                    break;
                case "历史":
                    top = this.$el.find(selector + 'historycity');
                    break;
                case "热门":
                    top = this.$el.find(selector + 'hotcity');
                    break;
                default:
                    top = this.$el.find(selector + 'nothotcity div[data-key="' + key + '"]');
                    break;

            }
            if (top.length) {
                window.scrollTo(0, $(top).offset().top - 132);
                $(e.currentTarget).css("color", "red");
            }

        },
        //调用turning方法时触发
        onShow: function () {
            this.ShowAfter();
            this.setTitle('城市列表');
        },
        //
        onHide: function () {
            this.isInterLoaded = false;
            this.isInlandLoaded = false;
            this.els.eltabbox.show();
            this.els.elassociate.hide();
            this.els.elflightcitylistbox.show();
        },
        /*点击获取当前城市*/
        geoCity: function (e) {
            $(e.currentTarget).text("正在获取当前城市");
            var self = this;
            //this.html5geo();
            this.getPosition(true, null, this.errorgeocity);

        },



        /**
          * 定位
          * @param {boolean} noCache 不使用缓存
          * @param {function} callback 成功后的回调
          */
        getPosition: function (noCache, successcallback, errorcallback) {
            var errorhandler = null,
                self = this,
                city = null;

            noCache = noCache === false ? false : true;
            GeoLocation.ClearPosition();
            GeoLocation.Subscribe('flight/index', {
                onStart: function () {
                    this.startGeoStatus();
                },
                onComplete: function (address) {
                    var selfComplete = this;
                    var info = {};
                    var cityname = address.city.lastIndexOf('市') == address.city.length - 1 ? address.city.substring(0, address.city.length - 1) : address.city
                    var info = this.getCityByName(cityname);
                    console.log(JSON.stringify(info))
                    /*上海和北京比较特殊，需要显示2个机场，李康那边服务做了过滤，如果传入的参数中包含机场三字码，则最终的航班列表只返回改机场的航班，比如查询上海虹桥到北京，则航班列表的response只返回从上海虹桥出发的航班*/
                    if (address.city == "上海市") {
                        this.$el.find("#inlandcurentcity ul").append("<li class='city-item twoline' data-info='" + JSON.stringify(info) + "' data-countryid='1' data-mode='1' data-key='" + info.key + "' data-code='SHA' data-id='' data-name='上海'>上海</br>所有机场</li>");
                        this.$el.find("#inlandcurentcity ul").append("<li class='city-item twoline' data-info='" + JSON.stringify(info) + "' data-countryid='1' data-mode='1' data-key='" + info.key + "' data-code='SHA' data-aportcode='SHA' data-id='" + info.id + "' data-name='上海虹桥'>上海</br>虹桥机场</li>");
                        this.$el.find("#inlandcurentcity ul").append("<li class='city-item twoline' data-info='" + JSON.stringify(info) + "' data-countryid='1' data-mode='1' data-key='" + info.key + "' data-code='SHA' data-aportcode='PVG' data-id='" + info.id + "' data-name='上海浦东'>上海</br>浦东机场</li>");
                    }
                    else if (address.city == "北京市") {
                        this.$el.find("#inlandcurentcity ul").append("<li class='city-item twoline' data-info='" + JSON.stringify(info) + "' data-countryid='1' data-mode='1' data-key='" + info.key + "' data-code='BJS' data-id='" + info.id + "' data-name='北京'>北京</br>所有机场</li>");
                        this.$el.find("#inlandcurentcity ul").append("<li class='city-item twoline' data-info='" + JSON.stringify(info) + "' data-countryid='1' data-mode='1' data-key='" + info.key + "' data-code='BJS' data-aportcode='PEK' data-id='" + info.id + "' data-name='北京首都'>北京</br>首都机场</li>");
                        this.$el.find("#inlandcurentcity ul").append("<li class='city-item twoline' data-info='" + JSON.stringify(info) + "' data-countryid='1' data-mode='1' data-key='" + info.key + "' data-code='BJS' data-aportcode='NAY' data-id='" + info.id + "' data-name='北京南苑'>北京</br>南苑机场</li>");
                    }
                    else {
                        alert(address.city + JSON.stringify(info));
                        this.$el.find("#inlandcurentcity ul").append("<li class='city-item' data-mode='1' data-info='" + JSON.stringify(info) + "' data-countryid='1' data-key='" + info.key + "' data-code='" + info.code + "' data-id='" + info.id + "' data-name='" + info.name + "'>" + info.name + "</li>");
                    }
                    self.$el.find("#geocity").hide();


                },
                onError: typeof errorcallback == "function" ? errorcallback : this.geoError,
                onPosError: typeof errorcallback == "function" ? errorcallback : this.geoError
            }, this, noCache);
        },
        /*根据城市名称获取城市信息*/
        getCityByName: function (name) {
            var info = {};
            if (this.dateSource.data && this.dateSource.data.length > 0) {
                for (var i = 0; i < this.dateSource.data.length; i++) {
                    var c = this.dateSource.data[i];
                    if (c.name == name) {
                        info.name = c.name;
                        info.code = c.code;
                        info.id = c.id;
                        info.key = c.key;
                        break;
                    }
                }

            }
            return info;

        },
        /*获取城市机场后，显示到定位城市
        如果是北京或者上海，则显示北京机场、北京首都机场、北京南苑机场
        上海机场、上海虹桥机场、上海浦东机场
        */
        showGeoCoty: function (cityinfo) {
            alert('success:' + JSON.stringify(cityinfo));
            this.$el.find("#geocity").hide();
            if (cityinfo.Data && cityinfo.Data && cityinfo.Data.length) {
                if (cityinfo.Data[0].Datas[0].Code == "SHA" || cityinfo.Data[0].Datas[0].Code == "BJS") {
                    this.$el.find("#inlandcurentcity ul").append("<li class='city-item' data-mode='1' data-code='SHA' data-id='' data-name='上海'>上海</br>所有机场</li>");
                    this.$el.find("#inlandcurentcity ul").append("<li class='city-item' data-mode='1' data-code='" + cityinfo.Data[0].Datas[0].Code + "' data-id='' data-name='" + cityinfo.Data[0].Datas[0].Name + cityinfo.Data[0].Name + "'>" + cityinfo.Data[0].Datas[0].Name + "</br>" + cityinfo.Data[0].Name + "</li>");
                    this.$el.find("#inlandcurentcity ul").append("<li class='city-item' data-mode='1' data-code='" + cityinfo.Data[1].Datas[0].Code + "' data-id='' data-name='" + cityinfo.Data[1].Datas[0].Name + cityinfo.Data[1].Name + "'>" + cityinfo.Data[1].Datas[0].Name + "</br>" + cityinfo.Data[1].Name + "</li>");
                }
                else {
                    this.$el.find("#inlandcurentcity ul").append("<li class='city-item' data-mode='1' data-code='" + cityinfo.Data[0].Datas[0].Code + "' data-id='' data-name='" + cityinfo.Data[0].Datas[0].Name + "'>" + cityinfo.Data[0].Datas[0].Name + "</li>");
                }
            }

        },
        /**
        * 定位失败
        */
        geoError: function (e) {

            self.$el.find("#geocity").show();
        },
        /**
           * 开始定位状态
           */
        startGeoStatus: function () {

        },

        /**
        * 恢复定位状态
        */
        stopGeoStatus: function () {

        },
        /*点击定位后失败*/
        errorgeocity: function (e) {

            if (e.indexOf('拒绝') > 0) {
                self.$el.find("#inlandcurentcity").hide();
                self.$el.find("#currentkey").hide();
            }
            else {
                self.$el.find("#geocity").text('无法获取当前城市，请重试')
            }


        },
        html5geo: function () {
            if (window.navigator.geolocation) {
                window.navigator.geolocation.getCurrentPosition(this.locationSuccess, this.locationError, {
                    // 指示浏览器获取高精度的位置，默认为false
                    enableHighAcuracy: true,
                    // 指定获取地理位置的超时时间，默认不限时，单位为毫秒
                    timeout: 5000,
                    // 最长有效期，在重复获取地理位置时，此参数指定多久再次获取位置。
                    maximumAge: 0
                });
            } else {
                alert("Your browser does not support Geolocation!");
            }

        },


        locationError: function (error) {
            alert(JSON.stringify(error));
        },



        locationSuccess: function (position) {
            alert(position);
        }


    });
    return View;
});

define(['libs', 'c', 'CommonStore', 'CPageModel', 'CPageStore', 'cBasePageView', 'cUIBase', buildViewTemplatesPath('addpostcity.html')], function (libs, c, cs, CPageModel, CPageStore, BasePageView, cUIBase, viewhtml) {
    //用户Store
    var userStore = cs.UserStore.getInstance(),
    //选择地址Store
        addrStore = CPageStore.SelectAddrStore.getInstance(),
        cityModel = CPageModel.PostCityModel.getInstance(),
        cityStore = CPageStore.PostCityStore.getInstance();

    var View = BasePageView.extend({
        districtData: null,
        preOpenGroup: null,

        render: function () {
            this.viewdata.req = this.request;
            this.$el.html(viewhtml);
            this.els = {
                elcitylisttpl: this.$el.find('#post-citylist-tpl'),
                elcitylistbox: this.$el.find('#postcitylistbox')
            };

            this.cityListTplfun = _.template(this.els.elcitylisttpl.html());
        },

        events: {
            'click .city-group-title': 'cityGroupTitleClick',
            'click .city-item': 'cityItemonClick',
            'click #js_city_return': 'onBack'
        },

        onCreate: function () {
            //this.injectHeaderView();
            this.render();
        },

        loadUser: function () {
            if (!this.uid) {
                if (userStore.isLogin()) {
                    var user = userStore.getUser();
                    this.uid = user.UserID;
                } else {
                    this.uid = c.utility.getGuid();
                }
            }
        },

        //数据加载阶段
        onLoad: function () {
            this.loadUser();

            var self = this;
            var prvnId = addrStore.getAttr("prvnId", this.uid) || "31";
            var prvnName = addrStore.getAttr("prvnName", this.uid) || "上海市";
            var ctyName = addrStore.getAttr("ctyName", this.uid) || 0;
            this.districtData = cityStore.get();
            if (!this.districtData) {
                this.showLoading();
                cityModel.excute(function (data) {
                    self.hideLoading();
                    self.cityStore.set(data, self.uid);
                    self.districtData = data;
                    self.updatePage(prvnId);
                }, function () {
                    self.hideLoading();
                });
            } else {
                this.updatePage(prvnId);
            }
            //add采用dom方法为标题header赋值 wyren@ctrip.com 2014-4-2
            this.$el.find('h1').text(prvnName);
            // //对HeaderView设置数据
            // this.headerview.set({
            //     title: prvnName,
            //     back: true,
            //     view: self,
            //     events: {
            //         returnHandler: $.proxy(self.onBack, self)
            //     }
            // });
            // this.headerview.show();
            // //add标题头手动显示 wyren@ctrip.com 2014-4-2
            // $('#headerview').show();

            if (ctyName) {
                this.preOpenGroup = $('.citylistclick div');
            }
        },

        updatePage: function (prvnId) {
            var province = {};
            for (var i = 0, ln = this.districtData.length; i < ln; i++) {
                if (this.districtData[i].treeKey == prvnId) {
                    province = this.districtData[i];
                    break;
                }
            }

            var citys = province.citys;
            if (citys[0].name == '市辖区' || citys[0].name == '县') {
                var directDst = [];
                for (var j = 0, jln = citys.length; j < jln; j++) {
                    var city = citys[j];
                    for (var k = 0, kln = city.contries.length; k < kln; k++) {
                        contry = city.contries[k];
                        if (city.name.indexOf('县') == 0) {
                            contry.cryName = province.name;
                        } else {
                            contry.cryName = city.name;
                        }
                        directDst.push(contry)
                    }
                }
                province.citys = directDst;
                province.isDirect = true;
            } else {
                province.isDirect = false;
            }

            province.curCtyName = addrStore.getAttr('ctyName', this.uid);
            province.curDstrName = addrStore.getAttr('dstrName', this.uid);
            this.els.elcitylistbox.html(this.cityListTplfun(province));

            this.turning();
        },

        //调用turning方法时触发
        onShow: function () {
            this.setTitle('选择城市');
        },
        onHide: function () { },
        cityGroupTitleClick: function (e) {
            var cur = $(e.currentTarget);
            var pKey = cur.attr('data-pkey');
            var dKey = cur.attr('data-key');
            //var dName = cur.html();
            var dName = cur.attr('data-name');
            var li = cur.parent('li');
            var from = addrStore.getAttr("from", this.uid);

            var nextPos = cUIBase.getElementPos(cur.next()[0]);
            var winHeight = $(window).height();
            var winScrollTop = $(window).scrollTop();


            //先恢复至原始值，再赋值
            addrStore.rollback(['ctyId', 'ctyName', 'cty', 'dstrId', 'dstr', 'dstrName']);


            //如果不是直辖市
            if (!pKey) {
                //当前有打开的情况
                if (this.preOpenGroup) {
                    //点击的是已打开的分组,则将分组打开/关闭
                    if (this.preOpenGroup.attr('data-key') == cur.attr('data-key')) {
                        cur.toggleClass('newarr_up');
                        cur.toggleClass('newarr_down');
                        li.toggleClass('citylistclick');
                    } else {
                        //如果是另一个分组,关闭已打开的分组,打开新分组
                        this.preOpenGroup.removeClass('newarr_up');
                        this.preOpenGroup.addClass('newarr_down');
                        this.preOpenGroup.parent('li').removeClass('citylistclick');
                        cur.toggleClass('newarr_up');
                        cur.toggleClass('newarr_down');
                        li.toggleClass('citylistclick');
                    }
                } else {
                    //无打开的情况,打开新分组
                    cur.toggleClass('newarr_up');
                    cur.toggleClass('newarr_down');
                    li.toggleClass('citylistclick');
                }
                this.preOpenGroup = cur;

                addrStore.setAttr('ctyId', dKey, this.uid);
                addrStore.setAttr('ctyName', dName, this.uid);
                addrStore.setAttr('cty', dName, this.uid);
                addrStore.setAttr('dstrId', "", this.uid);
                addrStore.setAttr('dstrName', "", this.uid);
                addrStore.setAttr('dstr', "", this.uid);

            } else {
                addrStore.setAttr('ctyId', pKey, this.uid);
                addrStore.setAttr('ctyName', $.trim(cur.attr('data-ctyName')), this.uid);
                addrStore.setAttr('cty', $.trim(cur.attr('data-ctyName')), this.uid);
                addrStore.setAttr('dstrId', dKey, this.uid);
                addrStore.setAttr('dstrName', dName, this.uid);
                addrStore.setAttr('dstr', dName, this.uid);
                addrStore.setAttr('from', "", this.uid);
                this.back('bookinginfo');
                //如果是转账到银行卡页面过来的，则跳回转到银行卡页面 updated by zhang_f 
                /*if (from == "transfer") {
                this.jump('/webapp/myctrip/#account/transfer');
                } else if (from == "flight.bookinginfo") {
                this.jump('/webapp/flight/#bookinginfo');
                } else {
                this.forward('addressinfo');
                }*/
            }

            //alert(nextPos.top);
            //alert(winHeight);
            //alert(nextPos.top + '\n' + (winHeight + $(window).scrollTop()));

            if (Math.abs(nextPos.top - winHeight - winScrollTop) < cur.height()) {
                window.scrollTo(0, winScrollTop + cur.height());
            }
        },

        cityItemonClick: function (e) {
            var cur = $(e.currentTarget);
            var dstrId = cur.attr('data-key');
            var dstrName = cur.html();
            var from = addrStore.getAttr("from", this.uid);
            //先恢复至原始值，再赋值
            addrStore.rollback(['dstrId', 'dstrName', 'dstr']);
            addrStore.setAttr('dstrId', dstrId, this.uid);
            addrStore.setAttr('dstrName', dstrName, this.uid);
            addrStore.setAttr('dstr', dstrName, this.uid);
            //如果是转账到银行卡页面过来的，则跳回转到银行卡页面 updated by zhang_f 

            addrStore.setAttr('from', "", this.uid);
            this.back('bookinginfo');
            // //add标题头手动隐藏 wyren@ctrip.com 2014-4-2
            // $('#headerview').hide();
            /*if (from == "transfer") {

            this.jump('/webapp/myctrip/#account/transfer');
            } else if (from == "flight.bookinginfo") {
            this.jump('/webapp/flight/#bookinginfo');
            } else {
            this.forward('addressinfo');
            }*/


        },

        onBack: function () {
            addrStore.rollback(['ctyId', 'ctyName', 'cty', 'dstrId', 'dstrName', 'dstr']);
            this.back('addpostprovince');
        }

    });
    return View;
});

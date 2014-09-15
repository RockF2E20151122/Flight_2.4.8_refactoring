"use strict";

define('vTravelPackages',[
    'c', 'vSupperChild',
    'libs',
    buildViewTemplatesPath('../modules/bookingInfo/templates/tTravelPackages.html')
],
function (
    c, vSupperChild, 
    libs,
    tempHtml
    ) {

    var cbase = c.base;
      
    var Insurance = new c.base.Class( vSupperChild,{
        _setBoxes_: function () {
            this.lxtcBox = this.viewPort.find('#lxtc_box');
            this.packageBox = this.viewPort.find('#package');
            this.packageSelectBox = this.viewPort.find('#js_packageSelected');
        },
        _setTemplate_: function () {
            this.viewPort.append(tempHtml);
            this.lxtcBoxtplfun = _.template(this.viewPort.find("#lxtctpl").html());
            this.packageBoxtplfun = _.template(this.viewPort.find("#packagetpl").html());
            this.packageSelecttplfun = _.template(this.viewPort.find("#packageSelecttpl").html());
        },
        EVENTS: {
            TOGGLEPACKAGEDESC: 'togglePackageDesc',
            UPDATEPACKAGETPL: 'updatePackageTpl'
        },
        _listeningMessages_: function(){
            this.parentView.on(this.parentView.EVENTS.TOGGLEPACKAGEDESC, this.togglePackageDesc.bind(this));
            this.parentView.on(this.parentView.EVENTS.UPDATEPACKAGETPL, this.updatePackageTpl.bind(this));
        },
        i_setPaymentParam: function (policy,param) {
            if (param) {
                var flightDetailsData = this.stores.flightDetailsStore.get();
                var pkgtype = this.stores.packageSelectStore.get(this.uid).pkgtype; //二选一套餐类型
                var pkginfo = policy.pkginfo; //套餐信息 包括保险、礼品卡以及乘客显示,只取第一程
                for (var l = 0; l < pkginfo.length; l++) {
                    var pkg = pkginfo[l];
                    if (flightDetailsData.ispackage) {
                        if (pkg.basicinfo.pkgtype == pkgtype) {//套餐二选一，add by zhengkw 2014-6-24
                            var psginfo = pkg.packageinfo.psgs.filter(function (subpsg, subindex) {
                                return subpsg.psgtype == 1; //以成人的最少购买份数最为套餐中每个人的最少购买份数
                            });
                            var count = psginfo.length ? psginfo[0].min : 1;
                            param["pkglst"].push({ pkgtype: pkg.basicinfo.pkgtype, pkgsubtype: pkg.basicinfo.pkgsubtype, pkgid: pkg.basicinfo.pkgid, pkgname: pkg.basicinfo.pkgname, currency: pkg.currency, price: pkg.price, cnt: count, amount: count * pkg.price });
                        }
                    }
                    else {
                        if (pkg.basicinfo.pkgtype == 1 && this.stores.flightOrderStore.getAttr("selInsure")) {//目前h5暂时只支持保险，不支持礼品卡等 kwzheng 2014-5-21
                            var count = flightDetailsData.insurances[0].min; //这边的count是指每个人购买的分数，跟肖老师确认过，不可传中购买数。 zhengkw 2014-6-24
                            param["pkglst"].push({ pkgtype: pkg.basicinfo.pkgtype, pkgsubtype: pkg.basicinfo.pkgsubtype, pkgid: pkg.basicinfo.pkgid, pkgname: pkg.basicinfo.pkgname, currency: pkg.currency, price: pkg.price, cnt: count, amount: count * pkg.price });
                        }
                    }
                }
            }
            return param;
        },
        updatePackageTpl: function (validSelCount) {            //package
            if (DataControl.packageData) {
                DataControl.packageData.count = DataControl.packageData.min * (validSelCount || 0);
                DataControl.packageData.pkgcount = DataControl.packageData.count;
                var strHtml = this.packageBoxtplfun(DataControl.packageData);
                this.packageBox.html(strHtml);
            }
        },
        render: function (data, packageSelectStore,passengerQueryStore) {
            this.setHtml(data, packageSelectStore, passengerQueryStore);
            data.hasTravalPackage ? this.viewPort.find('#package-desc').removeClass('js_hide') : '';
        },
        togglePackageDesc: function (bol) {
            if (this.viewPort.find('#insuranceLink').length > 0) {
                if (bol) {
                    this.viewPort.find('#insuranceLink').show();
                } else {
                    this.viewPort.find('#insuranceLink').hide();
                }
            }
        },
        /*选择套餐*/
        packageSelectAction: function (e) {
            var uid = this.parentView.uid;
            var target = $(e.currentTarget);
            if (!target.hasClass('selected')) {
                $(".js_package_select").removeClass("flight-selected");
                target.addClass('flight-selected');
                
                this.packageBox.find(".flight-ins").html(target.html());
                this.packageBox.find(".flight-ins").data("type", +target.data('type'));
                this.stores.packageSelectStore.setAttr('pkgtype', +target.data('type'), uid);
            }
            this.togglePackageSelect();
            this.togglePackageDesc(+target.data('type') == 1 ? true : false);

        },
        togglePackageSelect: function () {
            this.packageSelectBox.toggle();
            if (this.packageBox.hasClass("flight-arrdown4")) {
                this.packageBox.removeClass("flight-arrdown4").addClass("flight-arrup4");
            } else {
                this.packageBox.removeClass("flight-arrup4").addClass("flight-arrdown4");
            }
        },
        setSelectHtml: function () {
            var self = this;
            var uid = this.parentView.uid;
            var detailData = this.stores.flightDetailsStore.get() || {};
            detailData["selCount"] = this.stores.passengerQueryStore.getAttr('validSelCount');
            detailData["pkgtype"] = this.stores.packageSelectStore.getAttr('pkgtype', uid);
            if (detailData) {
                
                var strHtml = this.packageSelecttplfun(detailData);
                this.packageSelectBox.html(strHtml);
                this.packageSelectBox.find(".js_package_select").bind("click", $.proxy(self.packageSelectAction, self));
            }
        },
        showReadMe: function () {
            var Mask = this.opts.Mask;
            var html = this.parentView.$el.find('#j_readMe_tpl').html();
                html = $(html);
            if (!this.parentView["mask"]) {
                this.parentView["mask"] = html;
                $("body").append(html);
                html.click(function () {
                    $(this).hide();
                });
            }
            this.parentView["mask"].show();
        },
        setHtml: function (data, packageSelectStore,passengerQueryStore) {
            var self = this;
            console.log("travel package");
            if (data) {
                var userStore = this.stores.userStore;
                var userid = userStore.isLogin() ? userStore.getUser().UserID : null;
                var detailData = null;
                var pkgtype = 1;//航意险
                if (userid != null) {//只记录登入状态下的
                    
                    pkgtype = packageSelectStore.get(userid).pkgtype || 1;
                }
                data.pkgtype = pkgtype;

               var passengerinfo = passengerQueryStore.get();
               var pkgs = []  ; 
               if (data.ispackage && data.pkglist.length) {

                   pkgs = data.pkglist.filter(function (pkg, index) {
                    return pkg.basicinfo.pkgtype == pkgtype;
                   });
                    
                   if (pkgs.length) {
 
                    // var _pdata = {};
                    // if (detailData == null) {
                        var mins = pkgs[0].packageinfo.psgs.filter(function (psg, idex) {
                            return psg.psgtype == 1;
                        });
                        pkgs[0].count = (mins.length ? mins[0].min : 1) * (passengerinfo.validSelCount || 0);
                        pkgs[0].min = mins.length ? mins[0].min : 1;

                        data.pkgcount = +pkgs[0].count;
                        data.pkgprice = +pkgs[0].price;
                        

                    /* } else {
                        
                         var pdata = detailData["pkglist"].filter(function (psg, idex) {
                              
                            return psg.basicinfo.pkgtype == pkgtype;
                         });
                         _pdata =  pdata.length ? pdata[0] : null ;

                        var mins = _pdata.packageinfo.psgs.filter(function (psg, idex) {
                             return psg.psgtype == 1;
                        });

                        var min = mins.length ? mins[0].min : 1;
                        _pdata["min"] = min;
                        _pdata["count"] = min * detailData["selCount"];

                        data.pkgcount = _pdata["count"];
                        data.pkgprice = _pdata["price"];
 
                    }*/

                   var strHtml2 = this.packageBoxtplfun(pkgs[0]);
                   
                    this.packageBox.show().html(strHtml2);

                    if (this.packageBox.find(".flight-ins").length>0 )
                    this.packageBox.find(".flight-ins").bind("click", $.proxy(self.togglePackageSelect,self));
                    if (this.packageBox.find(".flight-labq").length>0)
                    this.packageBox.find(".flight-labq").bind("click", $.proxy(self.showReadMe, self));
                     
                    this.setSelectHtml();
                    this.parentView.vInsurance.hideBox();

                    var bol = (pkgtype != 1 )?false:true;   
                    this.togglePackageDesc(bol);

                    DataControl.packageData = pkgs[0];
                  }  
                } else {
                    this.parentView.vInsurance.showBox();
                    this.packageBox.hide();
                    this.packageSelectBox.hide();
                }



               var strHtml1 = this.lxtcBoxtplfun(data);
               
                this.lxtcBox.html(strHtml1);

                if (data.hasTravalPackage) { // 去返程中任意一程有套餐则显示，套餐说明链接
                    this.viewPort.find('#package-desc').show();
                    this.viewPort.find('#flightInfo .flight-pnttips').addClass('black-text'); // 加粗退改签
                } else {
                    this.viewPort.find('#flightInfo .flight-pnttips').removeClass('black-text');
                    this.viewPort.find('#package-desc').hide();
                }
 
            }
        }
    });


    return Insurance;
});
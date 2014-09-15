define(['libs', 'c', 'CommonStore', 'fpage/widget/selectSeat/initSeat', 'FlightStore', 'FlightModel', 'cBasePageView', buildViewTemplatesPath('selectseat.html')],

  function (libs, c, CommonStore, selectSeat, FlightStore, FlightModels, BasePageView, html) {

    var  selectSeatModel = FlightModels.SelectSeatModel.getInstance(), //值机数据Model
         submitCheckinModel = FlightModels.SubmitCheckinModel.getInstance(), //值机提交Model
         selectSeatStore = FlightStore.FlightSelectSeatStore.getInstance(),  //值机store
         flightSubmitCheckinStore = FlightStore.FlightSubmitCheckinStore.getInstance(),  //值机store
         checkinParamStore = FlightStore.CheckinParamStore.getInstance(),  //值机checkin
         checkPassengerStore = FlightStore.CheckPassengerStore.getInstance(),  //值机登机人
         backurl,//返回的页面
         userStore = CommonStore.UserStore.getInstance(), //用户信息
         isCheckIn,//是否是值机，true为值机，false为预约
         _this;
      /*  var testToast = new c.ui.Toast();
        var toastContent = 'nima';
        testToast.show(
          toastContent,
          2,
          function() {
            alert('nimei');
          },
          true
        );*/
    var View = BasePageView.extend({

      render: function () {
        var data = {
          title:checkPassengerStore.getAttr('depname') + '-' + checkPassengerStore.getAttr('arrname'),
          caption:checkPassengerStore.getAttr('airname')+checkPassengerStore.getAttr('fno'),
          cfply:checkPassengerStore.getAttr('cfply')
        };
        var selectSeatHtml =this.$el.find('#selectSeatHeader').html();
        var $selectSeatHeader = _.template(selectSeatHtml);
        var selectSeatTpl = $selectSeatHeader(data);

        this.$el.find('#selectSeat').before(selectSeatTpl);
      },
      events: {
        'click #js_return':'backAction',
        'click .js_btn_submit': 'submitAction'
      },
      //返回
      backAction: function() {
        var result = this.selectSeat.getSelectInfo(),
            user = result.currentInfo;  //获取选座信息

        //如果有选座,返回时弹出确认框
        if(user.length > 0) {
          var backAlert = new c.ui.Alert({
            title: '提示信息',
            message: '所选座位尚未提交，是否确定要离开当前页面？',
            buttons: [{
              text: '取消',
              click: function () {
                this.hide();
              }
            }, {
              text: '确定',
              click: function () {
                this.hide();
                //当为预约，后退时清除已选的座位
                _this.clearSelSetno();

                //若backurl存在则跳回到预约或值机，否则跳回index
                backurl ? _this.back(backurl) : _this.back('index');
              }
            }]
          });
          backAlert.show();
        } else {
          //当为预约，后退时清除已选的座位
          _this.clearSelSetno();
          //若backurl存在则跳回到预约或值机，否则跳回index
          backurl ? this.back(backurl) : this.back('index');
        }
      },
      //当为预约，后退时清除已选的座位
      clearSelSetno:function() {
        if(!isCheckIn) {
          var ciplst = checkPassengerStore.getAttr('ciplst');
          if(!ciplst) {return;} //若木有这个属性马上return。

          for(var i= 0,len=ciplst.length;i<len;i++) {
            ciplst[i]['setno'] = '';
          }
          checkPassengerStore.setAttr('ciplst',ciplst);
        }
      },
      //提交或确应
      submitAction:function() {
        //保存旅客选择座位后的信息
        var result = this.selectSeat.getSelectInfo(),
            user = result.currentInfo;
        checkPassengerStore.setAttr('currentSpace',result.currentSpace);  //上下舱

        var ciplst = checkPassengerStore.getAttr('ciplst');
        if(user && (user.length != this.data.user.length)) {
          var subAlert = new c.ui.Alert({
            message: '还有'+ (this.data.user.length-user.length) +'人未选择座位',
            buttons: [{
              text: '确定',
              click: function () {
                this.hide();
              }
            }]
          });
          subAlert.show();
          return ;
        }

        for(var i= 0,len=user.length;i<len;i++) {
          var userSelectInfo = user[i].split('-');

          for(var j= 0,jlen=ciplst.length;j<jlen;j++) {
            //如果uindex等于选中座位信息的cno，则把选座信息赋值到selsetno
            if(ciplst[j]['uindex'] == userSelectInfo[1]) {
//              ciplst[j]['selsetno'] = userSelectInfo[2];
              ciplst[j]['setno'] = userSelectInfo[2];
            }
          }
        }
        //更新store里旅客信息
        checkPassengerStore.setAttr('ciplst', ciplst);

        if(!isCheckIn) {  //若为预约
          this.forward('seatconfirm');
        } else {  //值机
          this.selectSeat.getSelectInfo();
          submitCheckinModel.setParam({
            "fcsinf":{
              "acode":checkPassengerStore.getAttr('aacode'),
              "dcode":checkPassengerStore.getAttr('dacode'),
              "ddate":checkPassengerStore.getAttr('depdat'),
              "fno":checkPassengerStore.getAttr('fno'),
              "setno":ciplst[0]['setno']
            },
            "oid":checkPassengerStore.getAttr('oid'),
            "psginf":{
              "cno":checkPassengerStore.getAttr('ciplst')[0]['cno'],
              "ctype":checkPassengerStore.getAttr('ciplst')[0]['ctype'],
              "phone":checkPassengerStore.getAttr('ciplst')[0]['phone'],
              "psgname":checkPassengerStore.getAttr('ciplst')[0]['psgnam'],
              "tno":null
            },
            "ver":0
          });

          //值机提交
          var _this = this,
              callback = function(){
                  submitCheckinModel.excute(function(data) {
                      //rc为0值机成功
                      _this.hideLoading();
                      if(data.rc==0) {
                          checkPassengerStore.setAttr('cattion', data.cattion);
                          _this.forward('checkinsuccess');
                      } else {
                          _this.showToast('值机失败', 2, function () { });
                      }

                  }, function(e) {
                      _this.hideLoading();
                      if (e && e.msg) {
                          _this.showToast(e.msg, 2, function () {

                          });
                      } else {
                          _this.showToast('数据加载失败', 2, function () {

                          });
                      }

                  }, false, _this);
              };
          this.showLoading();
            if (!userStore.isLogin()) {
                $.ajax({
                    url: '/html5/Account/NonUserLogin',
                    data: checkPassengerStore.getAttr('ciplst')[0]['phone'],
                    type: 'post',
                    dataType: 'json',
                    timeout: 200000,
                    success: function (dataLogin) {
                        // console.log(dataLogin);
                        if (dataLogin && +dataLogin.ServerCode == 1) {
                            if (dataLogin.Data.IsNonUser == true) {
                                dataLogin.Data.LoginToken = '';
                            }
                            userStore.removeUser();
                            userStore.setUser({
                                "UserID": dataLogin.Data.UserID,
                                "IsNonUser": true,
                                "LoginToken": "",
                                "LoginName": null,
                                "Auth": dataLogin.Data.Auth,
                                "ExpiredTime": null
                            });
                            callback();
                        } else {
                            _this.showToast('用户信息过期！');
                        }
                    },
                    error: function (err) {
                        _this.showToast('用户信息过期！');
                    }
                });
            }else{
                callback();
            }
        }
      },
      //首次记载view，创建view
      onCreate: function () {
        _this = this;
      },
      //加载数据时
      onLoad: function () {
        var _this = this;
        //if is error
        if(!checkPassengerStore.get()){
            this.back('index');
            return;
        }

        //这个backurl是全局,别改成局部
        backurl = checkPassengerStore.getAttr('backurl');        //获取backurl;
        isCheckIn = (backurl=='notimedcheckin') ? false : true;

        var setSeatParam = {
          "fno": checkPassengerStore.getAttr('fno'),
          "oid": checkPassengerStore.getAttr('oid') || 0,
          "ver": 0
        };
        //如果未预约
        if(!isCheckIn) {
          setSeatParam.otyp = 1;
        } else {
          setSeatParam.otyp = 2;
          setSeatParam.paginf = {
            "cno":checkPassengerStore.getAttr('ciplst')[0]['cno'],
            "ctype":checkPassengerStore.getAttr('ciplst')[0]['ctype'],
            "phone":checkPassengerStore.getAttr('ciplst')[0]['phone'],
            "psgname":checkPassengerStore.getAttr('ciplst')[0]['psgnam']
          };
          setSeatParam.fckin = {
            "acode":checkPassengerStore.getAttr('aacode'),
            "dcode":checkPassengerStore.getAttr('dacode'),
            "ddate":checkPassengerStore.getAttr('depdat')
          };
        }

        selectSeatModel.setParam(setSeatParam);
        this.showLoading();
        selectSeatModel.excute(function(data) {
          this.data.seatChart.setcollst = data.setcollst;
//          this.data.seatChart.setcollst = this.data.setcollst;
          this.data.user =[];

          var users  = checkPassengerStore.getAttr('ciplst');

          if(users) {
            for(var i= 0,len=users.length;i<len;i++) {
              var temp = {
                'name':checkPassengerStore.getAttr('ciplst')[i]['psgnam'],
                'cno':(i+1),
//                'cno':checkPassengerStore.getAttr('ciplst')[i]['cno'],
               'setno':checkPassengerStore.getAttr('ciplst')[i]['setno'] && checkPassengerStore.getAttr('ciplst')[i]['setno'].trim()
              };

              users[i]['uindex'] = (i+1);
              this.data.user.push(temp);
            }
          }
          checkPassengerStore.setAttr('ciplst', users);

 /*         temp = {name:'xm', cno:'22' };
          this.data.user.push(temp);*/

          this.hideLoading();
          (!isCheckIn) ? (this.data.checkIn = 0) : (this.data.checkIn = 1);  //值机传1

          this.$el.html(html);
          //实例化选座组件
          this.selectSeat = new selectSeat({
            el: this.$el.find('#selectSeat'),
            data: this.data
          });

          this.render();
          this.turning();

          //是确定或提交按钮
          (!isCheckIn) ? this.$el.find('.js_btn_submit').html('确定') : this.$el.find('.js_btn_submit').html('提交');
          //TODO 姓名和横坐标，后续放到tpl里
          //显示姓名
          this.$el.find("[data-role='seatUserName']").html(users[0]['psgnam']);
          //选座横坐标位置处理
//          this.$el.find('.seat-select-area').before(this.$el.find('.seat-x-axis'));

        }, function(e) {
          if (e && e.msg) {
            setTimeout(function () {
              _this.showToast(e.msg, 0, function () {
                //若backurl存在则跳回到预约或值机，否则跳回index
                backurl ? _this.back(backurl) : _this.back('index');
              });
            }, 1000);
          } else {
            setTimeout(function () {
              _this.showToast('数据加载失败', 0, function () {
                //若backurl存在则跳回到预约或值机，否则跳回index
                backurl ? _this.back(backurl) : _this.back('index');
              });
            }, 1000);
          }
        }, true, this);
      },

      //调用turning方法时触发
      onShow: function () {
//        $('#headerview').hide();  //处理双滚动条
      },
      onHide: function () {
//        $('#headerview').show();
      },
      data: {
        "checkIn": true,
        "seatChart": {
          "head": {
            "auth": null,
            "errcode": 0
          },
          "cfttpe": "",
          "subcls": "Y"
        }
      }

    });
    return View;
  });

define(['libs', 'c', 'fpage/widget/selectSeat/initSeat', 'FlightStore', 'FlightModel', 'cBasePageView', buildViewTemplatesPath('seatTestPage.html')],

  function (libs, c, selectSeat, FlightStore, FlightModels, BasePageView, html) {

    var  selectSeatModel = FlightModels.SelectSeatModel.getInstance(), //值机数据Model
         selectSeatStore = FlightStore.FlightSelectSeatStore.getInstance();  //值机store

    var View = BasePageView.extend({
      render: function () {

      },
      events: {
        'click .cbtn': 'newInput'
      },
      testInput: function() {

//            c.ui.InputClear(this.$el.find(e.target), null, this.inTitleChange, {
//                top: 20
//            }, true);
      },
      newInput: function() {

      },

      //首次记载view，创建view
      onCreate: function () {
        console.log('123');
        this.injectHeaderView();

        this.render();
      },
      //加载数据时
      onLoad: function () {

        //对HeaderView设置数据
        this.headerview.set({
          //title: '用车城市',
          title: '测试',
          back: true,
          view: self,
          tel: null,
          home: null,
          events: {
            returnHandler: function () {
//              this.back('');
            }
          }
        });

        //将HeaderView显示出来
        this.headerview.show();

        console.log("begin");
        this.$el.html(html);
        //实例化选座组件
        this.selectSeat = new selectSeat({
          el: this.$el.find('#selectSeat'),
          data: this.data
        });

        console.log("end");
        this.render();
        this.turning();
      },
      //调用turning方法时触发
      onShow: function () {
      },
      onHide: function () {
      },
      data: {
        "user": ["张三"],
        "planeType": 22,
        "checkIn": true,
        "seatChart": {
          "head": {
            "auth": null,
            "errcode": 0
          },
          "cfttpe": "",
          "setcollst": [
            {
              "setcolno": "A",
              "setrowlst": [
                {
                  "dek": 2,
                  "srowno": "15",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "16",
                  "sts": 1
                },
                {
                  "dek": 2,
                  "srowno": "17",
                  "sts": 1
                },
                {
                  "dek": 2,
                  "srowno": "18",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "19",
                  "sts": 4
                },
                {
                  "dek": 2,
                  "srowno": "20",
                  "sts": 4
                },
                {
                  "dek": 2,
                  "srowno": "21",
                  "sts": 4
                },
                {
                  "dek": 2,
                  "srowno": "22",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "23",
                  "sts": 1
                },
                {
                  "dek": 2,
                  "srowno": "24",
                  "sts": 1
                },
                {
                  "dek": 2,
                  "srowno": "25",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "26",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "27",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "28",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "29",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "30",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "31",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "32",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "33",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "34",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "35",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "36",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "37",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "38",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "39",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "40",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "41",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "42",
                  "sts": 4
                },
                {
                  "dek": 2,
                  "srowno": "43",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "44",
                  "sts": 4
                },
                {
                  "dek": 2,
                  "srowno": "45",
                  "sts": 2
                },
                {
                  "dek": 1,
                  "srowno": "46",
                  "sts": 2
                },
                {
                  "dek": 1,
                  "srowno": "47",
                  "sts": 2
                },
                {
                  "dek": 1,
                  "srowno": "48",
                  "sts": 2
                },
                {
                  "dek": 1,
                  "srowno": "49",
                  "sts": 2
                },
                {
                  "dek": 1,
                  "srowno": "50",
                  "sts": 2
                }
              ]
            },
            {
              "setcolno": "B",
              "setrowlst": [
                {
                  "dek": 2,
                  "srowno": "15",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "16",
                  "sts": 1
                },
                {
                  "dek": 2,
                  "srowno": "17",
                  "sts": 1
                },
                {
                  "dek": 2,
                  "srowno": "18",
                  "sts": 1
                },
                {
                  "dek": 2,
                  "srowno": "19",
                  "sts": 4
                },
                {
                  "dek": 2,
                  "srowno": "20",
                  "sts": 4
                },
                {
                  "dek": 2,
                  "srowno": "21",
                  "sts": 4
                },
                {
                  "dek": 2,
                  "srowno": "22",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "23",
                  "sts": 1
                },
                {
                  "dek": 2,
                  "srowno": "24",
                  "sts": 1
                },
                {
                  "dek": 2,
                  "srowno": "25",
                  "sts": 1
                },
                {
                  "dek": 2,
                  "srowno": "26",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "27",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "28",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "29",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "30",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "31",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "32",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "33",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "34",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "35",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "36",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "37",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "38",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "39",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "40",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "41",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "42",
                  "sts": 4
                },
                {
                  "dek": 2,
                  "srowno": "43",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "44",
                  "sts": 4
                },
                {
                  "dek": 2,
                  "srowno": "45",
                  "sts": 2
                },
                {
                  "dek": 1,
                  "srowno": "46",
                  "sts": 2
                },
                {
                  "dek": 1,
                  "srowno": "47",
                  "sts": 2
                },
                {
                  "dek": 1,
                  "srowno": "48",
                  "sts": 2
                },
                {
                  "dek": 1,
                  "srowno": "49",
                  "sts": 2
                },
                {
                  "dek": 1,
                  "srowno": "50",
                  "sts": 2
                }
              ]
            },
            {
              "setcolno": "TD",
              "setrowlst": []
            },
            {
              "setcolno": "TD",
              "setrowlst": []
            },
            {
              "setcolno": "C",
              "setrowlst": [
                {
                  "dek": 2,
                  "srowno": "15",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "16",
                  "sts": 1
                },
                {
                  "dek": 2,
                  "srowno": "17",
                  "sts": 1
                },
                {
                  "dek": 2,
                  "srowno": "18",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "19",
                  "sts": 1
                },
                {
                  "dek": 2,
                  "srowno": "20",
                  "sts": 4
                },
                {
                  "dek": 2,
                  "srowno": "21",
                  "sts": 4
                },
                {
                  "dek": 2,
                  "srowno": "22",
                  "sts": 4
                },
                {
                  "dek": 2,
                  "srowno": "23",
                  "sts": 4
                },
                {
                  "dek": 2,
                  "srowno": "24",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "25",
                  "sts": 1
                },
                {
                  "dek": 2,
                  "srowno": "26",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "27",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "28",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "29",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "30",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "31",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "32",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "33",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "34",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "35",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "36",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "37",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "38",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "39",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "40",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "41",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "42",
                  "sts": 4
                },
                {
                  "dek": 2,
                  "srowno": "43",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "44",
                  "sts": 4
                },
                {
                  "dek": 2,
                  "srowno": "45",
                  "sts": 2
                },
                {
                  "dek": 1,
                  "srowno": "46",
                  "sts": 2
                },
                {
                  "dek": 1,
                  "srowno": "47",
                  "sts": 2
                },
                {
                  "dek": 1,
                  "srowno": "48",
                  "sts": 2
                },
                {
                  "dek": 1,
                  "srowno": "49",
                  "sts": 2
                },
                {
                  "dek": 1,
                  "srowno": "50",
                  "sts": 2
                }
              ]
            },
            {
              "setcolno": "D",
              "setrowlst": [
                {
                  "dek": 2,
                  "srowno": "15",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "16",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "17",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "18",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "19",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "20",
                  "sts": 4
                },
                {
                  "dek": 2,
                  "srowno": "21",
                  "sts": 4
                },
                {
                  "dek": 2,
                  "srowno": "22",
                  "sts": 4
                },
                {
                  "dek": 2,
                  "srowno": "23",
                  "sts": 4
                },
                {
                  "dek": 2,
                  "srowno": "24",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "25",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "26",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "27",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "28",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "29",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "30",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "31",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "32",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "33",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "34",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "35",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "36",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "37",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "38",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "39",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "40",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "41",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "42",
                  "sts": 4
                },
                {
                  "dek": 2,
                  "srowno": "43",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "44",
                  "sts": 4
                },
                {
                  "dek": 2,
                  "srowno": "45",
                  "sts": 2
                },
                {
                  "dek": 1,
                  "srowno": "46",
                  "sts": 2
                },
                {
                  "dek": 1,
                  "srowno": "47",
                  "sts": 2
                },
                {
                  "dek": 1,
                  "srowno": "48",
                  "sts": 2
                },
                {
                  "dek": 1,
                  "srowno": "49",
                  "sts": 2
                },
                {
                  "dek": 1,
                  "srowno": "50",
                  "sts": 2
                }
              ]
            },
            {
              "setcolno": "E",
              "setrowlst": [
                {
                  "dek": 2,
                  "srowno": "15",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "16",
                  "sts": 1
                },
                {
                  "dek": 2,
                  "srowno": "17",
                  "sts": 1
                },
                {
                  "dek": 2,
                  "srowno": "18",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "19",
                  "sts": 1
                },
                {
                  "dek": 2,
                  "srowno": "20",
                  "sts": 4
                },
                {
                  "dek": 2,
                  "srowno": "21",
                  "sts": 4
                },
                {
                  "dek": 2,
                  "srowno": "22",
                  "sts": 4
                },
                {
                  "dek": 2,
                  "srowno": "23",
                  "sts": 4
                },
                {
                  "dek": 2,
                  "srowno": "24",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "25",
                  "sts": 1
                },
                {
                  "dek": 2,
                  "srowno": "26",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "27",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "28",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "29",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "30",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "31",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "32",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "33",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "34",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "35",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "36",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "37",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "38",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "39",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "40",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "41",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "42",
                  "sts": 4
                },
                {
                  "dek": 2,
                  "srowno": "43",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "44",
                  "sts": 4
                },
                {
                  "dek": 2,
                  "srowno": "45",
                  "sts": 2
                },
                {
                  "dek": 1,
                  "srowno": "46",
                  "sts": 2
                },
                {
                  "dek": 1,
                  "srowno": "47",
                  "sts": 2
                },
                {
                  "dek": 1,
                  "srowno": "48",
                  "sts": 2
                },
                {
                  "dek": 1,
                  "srowno": "49",
                  "sts": 2
                },
                {
                  "dek": 1,
                  "srowno": "50",
                  "sts": 2
                }
              ]
            },
            {
              "setcolno": "TD",
              "setrowlst": []
            },
            {
              "setcolno": "TD",
              "setrowlst": []
            },
            {
              "setcolno": "F",
              "setrowlst": [
                {
                  "dek": 2,
                  "srowno": "15",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "16",
                  "sts": 1
                },
                {
                  "dek": 2,
                  "srowno": "17",
                  "sts": 1
                },
                {
                  "dek": 2,
                  "srowno": "18",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "19",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "20",
                  "sts": 4
                },
                {
                  "dek": 2,
                  "srowno": "21",
                  "sts": 4
                },
                {
                  "dek": 2,
                  "srowno": "22",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "23",
                  "sts": 1
                },
                {
                  "dek": 2,
                  "srowno": "24",
                  "sts": 1
                },
                {
                  "dek": 2,
                  "srowno": "25",
                  "sts": 1
                },
                {
                  "dek": 2,
                  "srowno": "26",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "27",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "28",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "29",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "30",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "31",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "32",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "33",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "34",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "35",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "36",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "37",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "38",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "39",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "40",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "41",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "42",
                  "sts": 4
                },
                {
                  "dek": 2,
                  "srowno": "43",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "44",
                  "sts": 4
                },
                {
                  "dek": 2,
                  "srowno": "45",
                  "sts": 4
                },
                {
                  "dek": 1,
                  "srowno": "46",
                  "sts": 2
                },
                {
                  "dek": 1,
                  "srowno": "47",
                  "sts": 2
                },
                {
                  "dek": 1,
                  "srowno": "48",
                  "sts": 2
                },
                {
                  "dek": 1,
                  "srowno": "49",
                  "sts": 2
                },
                {
                  "dek": 1,
                  "srowno": "50",
                  "sts": 2
                }
              ]
            },
            {
              "setcolno": "G",
              "setrowlst": [
                {
                  "dek": 2,
                  "srowno": "15",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "16",
                  "sts": 1
                },
                {
                  "dek": 2,
                  "srowno": "17",
                  "sts": 1
                },
                {
                  "dek": 2,
                  "srowno": "18",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "19",
                  "sts": 1
                },
                {
                  "dek": 2,
                  "srowno": "20",
                  "sts": 4
                },
                {
                  "dek": 2,
                  "srowno": "21",
                  "sts": 4
                },
                {
                  "dek": 2,
                  "srowno": "22",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "23",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "24",
                  "sts": 1
                },
                {
                  "dek": 2,
                  "srowno": "25",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "26",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "27",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "28",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "29",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "30",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "31",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "32",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "33",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "34",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "35",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "36",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "37",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "38",
                  "sts": 1
                },
                {
                  "dek": 2,
                  "srowno": "39",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "40",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "41",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "42",
                  "sts": 4
                },
                {
                  "dek": 2,
                  "srowno": "43",
                  "sts": 2
                },
                {
                  "dek": 2,
                  "srowno": "44",
                  "sts": 4
                },
                {
                  "dek": 2,
                  "srowno": "45",
                  "sts": 4
                },
                {
                  "dek": 1,
                  "srowno": "46",
                  "sts": 2
                },
                {
                  "dek": 1,
                  "srowno": "47",
                  "sts": 2
                },
                {
                  "dek": 1,
                  "srowno": "48",
                  "sts": 2
                },
                {
                  "dek": 1,
                  "srowno": "49",
                  "sts": 2
                },
                {
                  "dek": 1,
                  "srowno": "50",
                  "sts": 2
                }
              ]
            }
          ],
          "subcls": "Y"
        }
      }

    });
    return View;
  });

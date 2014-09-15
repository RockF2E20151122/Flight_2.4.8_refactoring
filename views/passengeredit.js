define(['libs', 'c', 'CommonStore', 'FlightModel', 'FlightStore', buildViewTemplatesPath('passengeredit.html')], function (libs, c, CommonStore, FlightModel, FlightStore, html) {
    var passengerEditStore = FlightStore.passengerEditStore.getInstance(),
        passengerEditModel = FlightModel.passengerEditModel.getInstance(),
        userStore = CommonStore.UserStore.getInstance(),
        CountryDataModel = FlightModel.CountryDataModel.getInstance(),
        CountryDataStore = FlightStore.CountryDataStore.getInstance(),
        passengerQueryStore = FlightStore.passengerQueryStore.getInstance(),
		passPageTypeStore = FlightStore.passPageTypeStore.getInstance(),
		oPageType = 0; //0: 我的携程， 1：国内，2：国际
    var _this;
    var View = c.view.extend({
        tpl: html,
        pageid: 214022,
        render: function () {

            this.$el.html(this.tpl);
            /* this.elsBox = {
                p_add_wrap: this.$el.find('#p_add_wrap'),
                p_add_tpl: this.$el.find('#p_add_tpl')
            }; */
			
			this.elsBox = {
				p_add_wrap: this.$el.find('#p_add_wrap'),
                box_01: this.$el.find('#box_01'),   //头部标题
                box_02: this.$el.find('#box_02'),	//姓名框
                box_03: this.$el.find('#box_03'),	//选择证件
                box_04: this.$el.find('#box_04'),	//其他框
                tpl_01: this.$el.find('#tpl_01'),
                tpl_02: this.$el.find('#tpl_02'),
                tpl_03: this.$el.find('#tpl_03'),
                tpl_04: this.$el.find('#tpl_04'),
            };
			
            this.elHTML_01 = _.template(this.elsBox.tpl_01.html())
            this.elHTML_02 = _.template(this.elsBox.tpl_02.html())
            this.elHTML_03 = _.template(this.elsBox.tpl_03.html())
            this.elHTML_04 = _.template(this.elsBox.tpl_04.html())
        },
        events: {
            'click #js_return': 'backAction',
            'click .doubt_ico': 'readmeAction',
            'click .rightblue': 'finishSub',
            'click .js_citizenship': 'citizenshipAction',
            'click .js_sex>i': 'changeSex'
        },
        updatePage: function (complete) {
            DataControl.loadStore();
            if (c.utility.validate.isEmptyObject(DataControl.viewdata)) {
                this.forward('#passengerselect');
                return;
            }

            this.elsBox.box_01.html(this.elHTML_01(DataControl.viewdata));
            this.elsBox.box_02.html(this.elHTML_02(DataControl.viewdata));
            this.elsBox.box_03.html(this.elHTML_03(DataControl.viewdata));
            this.elsBox.box_04.html(this.elHTML_04(DataControl.viewdata));

            this.idCardList.setElement(this.$el.find('#sel_idCard'));

            this.els = {
				js_blk_cname: this.$el.find('#js_blk_cname'),
                js_blk_ename: this.$el.find('#js_blk_ename'),
                js_blk_no: this.$el.find('#js_blk_no'),
                js_blk_birth: this.$el.find('#js_blk_birth'),
				js_newName: this.$el.find('.js_newName'),
				js_cname: this.$el.find('.js_cname'),
                js_ename: this.$el.find('.js_ename'),
                js_no: this.$el.find('.js_no'),
                js_birth: this.$el.find('.js_birth'),
				js_tit_cname: this.$el.find('.js_tit_cname')
            }
            c.ui.InputClear(this.$el.find('.js_ename'), null, null, {
                top: 12,
                right: 50
            });
			
            c.ui.InputClear(this.$el.find('.js_no,.js_birth'), null, null, {
                top: 12
            });
			
			c.ui.InputClear(this.$el.find('.js_newName'), null, null, {
                top:11,
                right:45
            });
			
            this.onInputLog();
            complete.call(this);
        },
        onCreate: function () {
            _this = this;
            this.render();
            this.intiUI();
        },

        intiUI: function () {
            var _this = this;
            this.idCardList = new c.ui.Select({
                'select': this.$el.find('#sel_idCard'),
                'title': '选择证件',
                'autocreate': true,
                'onChange': function (val, oldval, option) {
                    val[0].no = $(option).data('no');
                    val[0].index = $(option).index()
                    _this.onChangeIdCard(val[0])

                },
                'onShow': function () {
                    //_this.elsBox.p_add_wrap.hide();
                },
                'onHide': function () {
                    //_this.elsBox.p_add_wrap.show();
                },
                'protitlehandler': function (text, option) {
                    return '<div><span>' + text + '</span><span>' + $(option).data('no') + '</span></div>';
                }
            });


        },
        //数据加载阶段
        onLoad: function () {
            //加载国家数据
            this.showLoading();
            CountryDataModel.excute(function (data) {
                this.countryDate = data.citys;
                this.updatePage(function () {
                    this.hideLoading();
                    this.turning();
                });
            }, function () {
                this.showToast('数据加载失败!');
                this.hideLoading();
            }, false, this);
        },
        //调用turning方法时触发
        onShow: function () { },
        onHide: function () {},
        backAction: function () {
            this.showLoading();
            var backUrl = DataControl.viewdata.backurl;
            DataControl.viewdata = {};
            if (backUrl) {
                this.back('#' + backUrl);
            } else {
                this.back('#booking');
            }


        },
        readmeAction: function () {

            this.showLoading();
            this.forward('#txtInfo');

        },
        onChangeIdCard: function (val) {
            DataControl.viewdata.defaIdCard = DataControl.viewdata.defaIdCard || {};
            DataControl.viewdata.defaIdCard.no = val.no + '';
            DataControl.viewdata.defaIdCard.type = val.value;
            DataControl.viewdata.defaIdCard.index = val.index;
            DataControl.viewdata.defaIdCard.name = val.title;
			
            if (val.no == '') {
                DataControl.viewdata.defaIdCard.opr = 1;
            } else {
                DataControl.viewdata.defaIdCard.opr = 4;
            }

            for (var i = 0; i < DataControl.viewdata.idcards.length; i++) {
                DataControl.viewdata.idcards[i].selected = false;
                if (DataControl.viewdata.idcards[i].type == DataControl.viewdata.defaIdCard.type) {
                    DataControl.viewdata.idcards[i].selected = true;
                }
            }
			
			//this.elsBox.p_add_wrap.html(this.elHTML(DataControl.viewdata));
			//this.intiUI();
			this.elsBox.box_02.html(this.elHTML_02(DataControl.viewdata));
			this.elsBox.box_04.html(this.elHTML_04(DataControl.viewdata));
			this.onInputLog();
            DataControl.saveStore()
        },
        citizenshipAction: function () {
            this.showLoading();
            this.forward('#flightcitizenship');
        },
        finishSub: function () {
            var s_cname = DataControl.viewdata.cname,
				s_ename = DataControl.viewdata.ename,
                s_deCard = DataControl.viewdata.defaIdCard,
                s_birth = DataControl.viewdata.birth,
                s_type = DataControl.viewdata.defaIdCard.type,
                s_gender = DataControl.viewdata.gender,
                eNamereg = /^[a-z]+\/([a-z]+\s*)+$/i,
                birthReg = /^(19[0-9]{2}|20[01]{1}\d{1})(0[1-9]{1}|1[0-2]{1})(0[1-9]{1}|[12]\d{1}|3[01]{1})$/;
			if(+oPageType === 2){   //国际机票常旅
				if (!s_ename) {
					this.showToast('英文姓名不能为空');
					return false;
				}
				if (s_ename.length > 29) {
					this.showToast('英文姓名长度必须少于29个字符');
					return false;
				}

				if (!eNamereg.test(s_ename)) {
					this.showToast('英文姓名必须符合"last/first middle"格式');
					return false;
				}

				if (!s_deCard.no || !s_deCard.no.length) {
					this.showToast('请填写证件号码')
					return false;
				}
				if (s_deCard.no.length > 20) {
					this.showToast('证件号码不可多余20位')
					return false;
				}

				if (s_gender != 0 && s_gender != 1) {

					this.showToast('请选择性别');
					return false;
				}

				if (!this.testBirth(s_birth)) {
					return false;
				}
			}else{ 
				if (s_type == 1) { //是身份证
					if (!this.Card_isName(s_cname)) {
						return false;
					}
					if (!s_deCard.no || !s_deCard.no.length) {
						this.showToast('请填写证件号码')
						return false;
					}
					if (s_deCard.no.length == 15) {
						this.showToast('根据国家法律规定，第一代居民身份证自2013年1月1日起停止使用。请填写您的18位身份证号码。')
						return false;
					}
					if (!c.utility.validate.isIdCard(s_deCard.no)) {
						this.showToast('请填写正确的身份证号码!');
						return false;
					}
					if (!this.testBirth(this.getBirth(s_deCard.no))) {
						return false;
					}else{
						DataControl.viewdata.birth = this.getBirth(s_deCard.no);
					}
				}
				if (s_type != 1) { //非身份证
					var isTestFan = (s_type == 8 || s_type == 7 || s_type == 10);
					if (!this.NoCard_C_E_Name(s_cname, s_ename, isTestFan)) {
						return false;
					}
					if (!s_deCard.no || !s_deCard.no.length) {
						this.showToast('请填写证件号码')
						return false;
					}
					if (s_deCard.no.length > 20) {
						this.showToast('证件号码不可多余20位')
						return false;
					}
					if (!this.testBirth(s_birth)) {
						return false;
					}
				}
			}
			
			
            //fix 默认证件类型不能保存的bug shbzhang
            //如果没有选中类型,默认第一个证件类型
            if (!s_deCard.index) {
                var card = DataControl.viewdata.idcards[0];
                card.selected = true;
                s_deCard.index = card.index = 0;
                s_deCard.name = card.name;
                card.no = s_deCard.no;
            } else {
                DataControl.viewdata.idcards[s_deCard.index] = s_deCard;
            }


            DataControl.saveStore();
            var passengerQuery = passengerQueryStore.get();
            if (userStore.isLogin()) {
                this.showLoading();
                passengerEditModel.excute(function (data) {
                    this.hideLoading();
                    DataControl.viewdata.inforId = data.inforId;

                    DataControl.saveQueryStore();
                    DataControl.viewdata = {};
                    this.forward('#passengerSelect');
                }, function (e) {
                    this.showToast('网络连接失败请重试')
                    this.hideLoading();
                }, true, this);
            } else {
                if (DataControl.viewdata.opr == 1) {
                    var isHaveSame;
                    if (passengerQuery && passengerQuery.passengers && passengerQuery.passengers.length) {
                        isHaveSame = _.find(passengerQuery.passengers, function (k) {
                            return k.ename == DataControl.viewdata.ename;
                        })
                    }

                    if (isHaveSame) {
                        DataControl.viewdata.inforId = isHaveSame.inforId;

                    } else {
                        var gInforId = Math.abs((this.getServerDate()).getTime()) + Math.round(Math.random() * 1e8);
                        DataControl.viewdata.inforId = gInforId;
                    }

                }
                DataControl.saveStore();
                DataControl.saveQueryStore();
                DataControl.viewdata = {};
                this.forward('#passengerSelect');
            }

        },
        onInputLog: function () {
		
			this.$el.find('.js_cname').on('input', function () {
                DataControl.viewdata.cname = $(this).val().replace(/\s/g,'');
            });
			
            this.$el.find('.js_ename').on('change', function () {
                DataControl.viewdata.ename = $.trim($(this).val());
            });
			
			this.$el.find('.js_newName').on('input', function () {
                var cNamereg = /^[\u4e00-\u9fa5]$/;
                if (DataControl.viewdata.defaIdCard.type == 1) {//如果是身份证
                    DataControl.viewdata.cname = $(this).val().replace(/\s/g,'');
                } else {
                    if (cNamereg.test($.trim($(this).val()).substring(0, 1))) {
                        DataControl.viewdata.cname = $(this).val().replace(/\s/g,'');
                        DataControl.viewdata.ename = '';
                    } else {
                        DataControl.viewdata.cname = '';
                        DataControl.viewdata.ename = $.trim($(this).val());
                    }
                }
            });
			
            this.$el.find('.js_birth').on('input', function () {
                DataControl.viewdata.birth = $.trim($(this).val());
            });

            this.$el.find('.js_no').on('input', function () {
                DataControl.viewdata.defaIdCard.no = $.trim($(this).val());
            });
  
        },
        changeSex: function (e) {
            var cur = $(e.currentTarget);
            cur.addClass('current').siblings('i').removeClass('current')

            if (cur.index() == 0) {

                DataControl.viewdata.gender = 1;
            } else if (cur.index() == 1) {
                DataControl.viewdata.gender = 0;
            }
        },
		getAge: function (birthStr) {

            var myDate = this.getServerDate();
            var month = myDate.getMonth() + 1;
            var day = myDate.getDate();
            var age = myDate.getFullYear() - birthStr.substring(0, 4) - 1;
            if (birthStr.substring(4, 6) < month || birthStr.substring(4, 6) == month && birthStr.substring(6, 8) <= day) {
                age++;
            }
            return age;
        },
		Card_isName: function (str) {   //身份证
            var result = {};
            var cNamereg = /^[\u4e00-\u9fa5]{2,14}$/;
            str = str.replace(/\s/g,'');
            if (!str) {
                this.showToast('中文姓名不能为空');
                return false;
            }
            if (!cNamereg.test(str)) {
                this.showToast('请填写正确的中文姓名');
                return false;
            }
            result.cName = str;
            return result;
        },
        NoCard_C_E_Name: function (Cstr, Estr, isTestFan) { //不是身份证
            var result = {};
            Cstr = Cstr.replace(/\s/g,'');
            Estr = $.trim(Estr);
            if (!Cstr && !Estr) {
                this.showToast('中文姓名、英文姓名请至少填写一个');
                return false;
            }
            var cNamereg = /^[\u4e00-\u9fa5]{2,14}$/;
            var eNamereg = /^[a-z]+\s*\/\s*[a-z]+$/i;
            var iscName = null;
            if (isTestFan) {
                iscName = cNamereg.test(Cstr) && this.haveNoFan(Cstr)
            } else {
                iscName = cNamereg.test(Cstr)
            }
            if (!iscName) {
                if (!eNamereg.test(Estr) || Estr.length > 29) {
                    this.showToast('请填写正确的中文姓名或英文姓名');
                    return false;
                } else {
                    result.cName = Cstr;
                    result.eName = Estr;
                    return result;
                }
            } else {
                result.cName = Cstr;
                result.eName = Estr;
                return result;
            }
        },
        getBirth: function (UUserCard) {
            var birth = UUserCard.substring(6, 14);
            return birth;
        },
        testBirth: function (str) {
            str = $.trim(str);
            if (!str) {
                this.showToast('请填写出生日期');
                return false;
            }
            var birthReg = /^(19[0-9]{2}|20[01]{1}\d{1})(0[1-9]{1}|1[0-2]{1})(0[1-9]{1}|[12]\d{1}|3[01]{1})$/
            if (!birthReg.test(str)) {
                this.showToast('请输入正确的出生日期，格式如：19990909');
                return false;
            }
            if (this.getAge(str) < 12) {
                this.showToast('暂不支持预订儿童票，请拨打电话预订400-008-6666');
                return false;
            }
            return true;
        },
        haveNoFan: function (str) {
            var fanStr = '皚藹礙愛翺襖奧壩罷擺敗頒辦絆幫綁鎊謗剝飽寶報鮑輩貝鋇狽備憊繃筆畢斃閉邊編貶變辯辮鼈癟瀕濱賓擯餅撥缽鉑駁蔔補參蠶殘慚慘燦蒼艙倉滄廁側冊測層詫攙摻蟬饞讒纏鏟産闡顫場嘗長償腸廠暢鈔車徹塵陳襯撐稱懲誠騁癡遲馳恥齒熾沖蟲寵疇躊籌綢醜櫥廚鋤雛礎儲觸處傳瘡闖創錘純綽辭詞賜聰蔥囪從叢湊竄錯達帶貸擔單鄲撣膽憚誕彈當擋黨蕩檔搗島禱導盜燈鄧敵滌遞締點墊電澱釣調叠諜疊釘頂錠訂東動棟凍鬥犢獨讀賭鍍鍛斷緞兌隊對噸頓鈍奪鵝額訛惡餓兒爾餌貳發罰閥琺礬釩煩範販飯訪紡飛廢費紛墳奮憤糞豐楓鋒風瘋馮縫諷鳳膚輻撫輔賦複負訃婦縛該鈣蓋幹趕稈贛岡剛鋼綱崗臯鎬擱鴿閣鉻個給龔宮鞏貢鈎溝構購夠蠱顧剮關觀館慣貫廣規矽歸龜閨軌詭櫃貴劊輥滾鍋國過駭韓漢閡鶴賀橫轟鴻紅後壺護滬戶嘩華畫劃話懷壞歡環還緩換喚瘓煥渙黃謊揮輝毀賄穢會燴彙諱誨繪葷渾夥獲貨禍擊機積饑譏雞績緝極輯級擠幾薊劑濟計記際繼紀夾莢頰賈鉀價駕殲監堅箋間艱緘繭檢堿鹼揀撿簡儉減薦檻鑒踐賤見鍵艦劍餞漸濺澗漿蔣槳獎講醬膠澆驕嬌攪鉸矯僥腳餃繳絞轎較稭階節莖驚經頸靜鏡徑痙競淨糾廄舊駒舉據鋸懼劇鵑絹傑潔結誡屆緊錦僅謹進晉燼盡勁荊覺決訣絕鈞軍駿開凱顆殼課墾懇摳庫褲誇塊儈寬礦曠況虧巋窺饋潰擴闊蠟臘萊來賴藍欄攔籃闌蘭瀾讕攬覽懶纜爛濫撈勞澇樂鐳壘類淚籬離裏鯉禮麗厲勵礫曆瀝隸倆聯蓮連鐮憐漣簾斂臉鏈戀煉練糧涼兩輛諒療遼鐐獵臨鄰鱗凜賃齡鈴淩靈嶺領餾劉龍聾嚨籠壟攏隴樓婁摟簍蘆盧顱廬爐擄鹵虜魯賂祿錄陸驢呂鋁侶屢縷慮濾綠巒攣孿灤亂掄輪倫侖淪綸論蘿羅邏鑼籮騾駱絡媽瑪碼螞馬罵嗎買麥賣邁脈瞞饅蠻滿謾貓錨鉚貿麽黴沒鎂門悶們錳夢謎彌覓綿緬廟滅憫閩鳴銘謬謀畝鈉納難撓腦惱鬧餒膩攆撚釀鳥聶齧鑷鎳檸獰甯擰濘鈕紐膿濃農瘧諾歐鷗毆嘔漚盤龐國愛賠噴鵬騙飄頻貧蘋憑評潑頗撲鋪樸譜臍齊騎豈啓氣棄訖牽扡釺鉛遷簽謙錢鉗潛淺譴塹槍嗆牆薔強搶鍬橋喬僑翹竅竊欽親輕氫傾頃請慶瓊窮趨區軀驅齲顴權勸卻鵲讓饒擾繞熱韌認紉榮絨軟銳閏潤灑薩鰓賽傘喪騷掃澀殺紗篩曬閃陝贍繕傷賞燒紹賒攝懾設紳審嬸腎滲聲繩勝聖師獅濕詩屍時蝕實識駛勢釋飾視試壽獸樞輸書贖屬術樹豎數帥雙誰稅順說碩爍絲飼聳慫頌訟誦擻蘇訴肅雖綏歲孫損筍縮瑣鎖獺撻擡攤貪癱灘壇譚談歎湯燙濤縧騰謄銻題體屜條貼鐵廳聽烴銅統頭圖塗團頹蛻脫鴕馱駝橢窪襪彎灣頑萬網韋違圍爲濰維葦偉僞緯謂衛溫聞紋穩問甕撾蝸渦窩嗚鎢烏誣無蕪吳塢霧務誤錫犧襲習銑戲細蝦轄峽俠狹廈鍁鮮纖鹹賢銜閑顯險現獻縣餡羨憲線廂鑲鄉詳響項蕭銷曉嘯蠍協挾攜脅諧寫瀉謝鋅釁興洶鏽繡虛噓須許緒續軒懸選癬絢學勳詢尋馴訓訊遜壓鴉鴨啞亞訝閹煙鹽嚴顔閻豔厭硯彥諺驗鴦楊揚瘍陽癢養樣瑤搖堯遙窯謠藥爺頁業葉醫銥頤遺儀彜蟻藝億憶義詣議誼譯異繹蔭陰銀飲櫻嬰鷹應纓瑩螢營熒蠅穎喲擁傭癰踴詠湧優憂郵鈾猶遊誘輿魚漁娛與嶼語籲禦獄譽預馭鴛淵轅園員圓緣遠願約躍鑰嶽粵悅閱雲鄖勻隕運蘊醞暈韻雜災載攢暫贊贓髒鑿棗竈責擇則澤賊贈紮劄軋鍘閘詐齋債氈盞斬輾嶄棧戰綻張漲帳賬脹趙蟄轍鍺這貞針偵診鎮陣掙睜猙幀鄭證織職執紙摯擲幟質鍾終種腫衆謅軸皺晝驟豬諸誅燭矚囑貯鑄築駐專磚轉賺樁莊裝妝壯狀錐贅墜綴諄濁茲資漬蹤綜總縱鄒詛組鑽緻鐘麼為隻兇準啟闆裡靂餘鍊洩';
            var thisArr = str.split('')
            for (var i = 0; i < thisArr.length; i++) {
                if (fanStr.indexOf(thisArr[i]) != -1) {
                    return false;
                }
            }
            return true;
        },
		Choose_CN : function(iIndex){
			var s_cname = DataControl.viewdata.passengers[iIndex].cname,
				s_ename = DataControl.viewdata.passengers[iIndex].ename,
				s_deCard = DataControl.viewdata.passengers[iIndex].defaIdCard,
				s_birth = DataControl.viewdata.passengers[iIndex].birth;
				
			if (!s_deCard || s_deCard.no == '') {
				this.showToast('请填写证件信息');
				return false;
			}
			if (s_deCard.type && s_deCard.type == 1) { //是身份证
				if (!this.Card_isName(s_cname)) {
					return false;
				}
				if (!s_deCard.no || !s_deCard.no.length) {
					this.showToast('请填写证件号码')
					return false;
				}
				if (s_deCard.no.length == 15) {
					this.showToast('根据国家法律规定，第一代居民身份证自2013年1月1日起停止使用。请填写您的18位身份证号码。')
					return false;
				}
				if (!c.utility.validate.isIdCard(s_deCard.no)) {
					this.showToast('请填写正确的身份证号码!');
					return false;
				}
				if (!this.testBirth(this.getBirth(s_deCard.no))) {
					return false;
				}
			}
			
			if (s_deCard.type && s_deCard.type != 1) { //非身份证
				var isTestFan = (s_deCard.type == 8 || s_deCard.type == 7 || s_deCard.type == 10);
				if (!this.NoCard_C_E_Name(s_cname, s_ename, isTestFan)) {
					return false;
				}
				if (!s_deCard.no || !s_deCard.no.length) {
					this.showToast('请填写证件号码')
					return false;
				}
				if (s_deCard.no.length > 20) {
					this.showToast('证件号码不可多余20位')
					return false;
				}
				if (!this.testBirth(s_birth)) {
					return false;
				}
			}
			
			return true;
		
		},
		Choose_EN : function(iIndex){
			var s_ename = DataControl.viewdata.passengers[iIndex].ename,
				s_deCard = DataControl.viewdata.passengers[iIndex].defaIdCard,
				s_birth = DataControl.viewdata.passengers[iIndex].birth,
				s_gender =  DataControl.viewdata.passengers[iIndex].gender,
				s_natl =  DataControl.viewdata.passengers[iIndex].natl,
				eNamereg = /^[a-z]+\/([a-z]+\s*)+$/i,
				birthReg =/^(19[0-9]{2}|20[01]{1}\d{1})(0[1-9]{1}|1[0-2]{1})(0[1-9]{1}|[12]\d{1}|3[01]{1})$/;
			
			s_birth = c.base.Date.format(c.base.Date.parse(s_birth),'Ymd');
		   
			if(!s_deCard || s_deCard.no == ''){
				this.showToast('请填写证件信息');
				return false;
			}

			if(!s_ename) {
				this.showToast('英文姓名不能为空');
				return false;
			}
			if(s_ename.length>29) {
				this.showToast('英文姓名长度必须少于29个字符');
				return false;
			}
			
			if (!eNamereg.test(s_ename)) {
				this.showToast('英文姓名必须符合"last/first middle"格式');
				return false;
			}
			
			if(!s_deCard.no || !s_deCard.no.length){
				this.showToast('请填写证件号码')
				return false;
			}
			if(s_deCard.no.length > 20){
				this.showToast('证件号码不可多余20位')
				return false;
			}
			
			if(!$.trim(s_natl)){
				this.showToast('请填写国籍')
				return false;
			}
			
			if(s_gender != 0 && s_gender != 1){
				
				this.showToast('请选择性别');
				return false;
			}
			
			if(!s_birth) {
				this.showToast('请填写出生日期');
				return false;
			}
			
			if(!birthReg.test(s_birth)){
				this.showToast('请输入正确的出生日期，格式如：19990909');
				return false;
			}
			if(this.getAge(s_birth) < 12){
				this.showToast('暂不支持预订儿童票，请拨打电话预订400-008-6666');
				return false;
			}
			
			return true;
		}
    
    });

    var DataControl = {
        viewdata: {},
        loadStore: function () {

            var passengerEdit = passengerEditStore.get();
			//oPageType = +localStorage.page_type || 0;
			oPageType = +passPageTypeStore.getAttr('type') || 0;

			this.createSort();
            if (passengerEdit === null) {
                return;
            }

            if (DataControl.viewdata.inforId != passengerEdit.inforId) {

                passengerEdit.defaIdCard = passengerEdit.defaIdCard || {};

                if (passengerEdit.birth) {
                    var birthDate = c.base.Date.parse(passengerEdit.birth)
                    passengerEdit.birth = c.base.Date.format(birthDate, 'Ymd')
                }

                if (passengerEdit.opr == 1 || (passengerEdit.defaIdCard.no && passengerEdit.defaIdCard.no == '')) {
                    passengerEdit.defaIdCard.opr = 1;
                } else {
                    passengerEdit.defaIdCard.opr = 4;
                }

                if (!passengerEdit.idcards || !passengerEdit.idcards.length) {
                    passengerEdit.idcards = [];
					var defaIdType = 1;
					if( oPageType == 2) defaIdType = 2  ;
					
                    var newIdCard = { "opr": 1, "flag": 2, "no": "", "expiryDate": "2099/1/1", "type": defaIdType, "selected": true }
                    passengerEdit.idcards.push(newIdCard);
                    passengerEdit.defaIdCard = newIdCard;
                }
                //按顺序给证件赋值
                
                for (var i = 0; i < this.idCardsDict.length; i++) {
                    this.idCardsDict[i].no = '';

                    for (var j = 0; j < passengerEdit.idcards.length; j++) {
                        if (this.idCardsDict[i].type == passengerEdit.idcards[j].type) {
                            for (var attr in passengerEdit.idcards[j]) {
                                this.idCardsDict[i][attr] = passengerEdit.idcards[j][attr];
                            }
                        }
                    }
                    this.idCardsDict[i].selected = false;
                    if (passengerEdit.defaIdCard && (this.idCardsDict[i].type == passengerEdit.defaIdCard.type)) {

                        this.idCardsDict[i].selected = true;
                        this.idCardsDict[i].opr = passengerEdit.defaIdCard.opr;
                        passengerEdit.defaIdCard.index = i;
                        passengerEdit.defaIdCard.name = this.idCardsDict[i].name;
                    }

                }

                if (passengerEdit.opr == 1) {
                    passengerEdit.defaIdCard.index = 0;
                }

                passengerEdit.idcards = this.idCardsDict;

                for (var attr in passengerEdit) {
                    this.viewdata[attr] = passengerEdit[attr];
                }
                for (var attr in this.viewdata) {
                    this.viewdata[attr] = typeof (passengerEdit[attr] != undefined) ? passengerEdit[attr] : null;
                }
                this.viewdata.natlName = _this.countryDate[passengerEdit.natl] && _this.countryDate[passengerEdit.natl].name || '';
            } else {

                this.viewdata.natl = passengerEdit.natl
                this.viewdata.natlName = passengerEdit.natlName;

            }
			this.viewdata.pageType = oPageType;


        },
        saveStore: function () {

            if (!c.utility.validate.isEmptyObject(this.viewdata)) {
                var passengerEdit = {};

                for (var attr in this.viewdata) {
                    passengerEdit[attr] = this.viewdata[attr];
                }

                if (passengerEdit.birth) {
                    var birthDate = c.base.Date.parse(passengerEdit.birth)

                    passengerEdit.birth = c.base.Date.format(birthDate, 'Y-m-d')
                }

                var newIdcards = $.grep(passengerEdit.idcards, function (n, i) {
                    return n.no != '';
                })
                passengerEdit.idcards = newIdcards;
                passengerEditStore.set(passengerEdit);
            }
        },
        saveQueryStore: function () {
            if (!c.utility.validate.isEmptyObject(this.viewdata)) {
                DataControl.saveStore();
                var passengerQuery = passengerQueryStore.get();
                var passengerEdit = passengerEditStore.get();
                var isAdd = true;
                passengerEdit.selected = 2;

                if (!passengerQuery) {
                    passengerQuery = {};
                }
                if (passengerQuery && passengerQuery.passengers && passengerQuery.passengers.length) {
                    for (var i = 0; i < passengerQuery.passengers.length; i++) {

                        if (passengerQuery.passengers[i].inforId == passengerEdit.inforId) {

                            isAdd = false;

                            passengerQuery.passengers.splice(i, 1);

                            passengerQuery.passengers.unshift(passengerEdit);
                            break;
                        }
                    }

                    if (isAdd) {
                        passengerQuery.passengers.unshift(passengerEdit);
                    }

                } else {

                    passengerQuery.passengers = [];
                    passengerQuery.passengers.push(passengerEdit);

                }

                var tag = passengerQueryStore.getTag();
                passengerQueryStore.set(passengerQuery, tag);

            }
        },
		createSort: function(){
			if(oPageType == 1){

				this.idCardsDict = [
					{ type: 1, name: '身份证' },
					{ type: 2, name: '护照' },
					{ type: 8, name: '台胞证' },
					{ type: 7, name: '回乡证' },
					{ type: 4, name: '军人证' },
					{ type: 10, name: '港澳通行证' },
					{ type: 21, name: '旅行证' },
					{ type: 20, name: '外国人永久居留证' },
					{ type: 11, name: '国际海员证' },
					{ type: 99, name: '其它'}
				];
				
			}else if(oPageType == 2){
				this.idCardsDict = [
					{ type: 2, name: '护照' },
					{ type: 10, name: '港澳通行证' },
					{ type: 8, name: '台胞证' },
					{ type: 7, name: '回乡证' },
					{ type: 22, name: '台湾通行证' },
					{ type: 11, name: '国际海员证'}
				];
				
			}else{
				this.idCardsDict = [
					{ type: 1, name: '身份证' },
					{ type: 2, name: '护照' },
					{ type: 8, name: '台胞证' },
					{ type: 7, name: '回乡证' },
					{ type: 4, name: '军人证' },
					{ type: 10, name: '港澳通行证' },
					{ type: 22, name: '台湾通行证' },
					{ type: 21, name: '旅行证' },
					{ type: 20, name: '外国人永久居留证' },
					{ type: 11, name: '国际海员证' },
					{ type: 25, name: '户口簿' },
					{ type: 27, name: '出生证明' },
					{ type: 99, name: '其它'}
				];
				
			}
		}

    };


    return View;
});

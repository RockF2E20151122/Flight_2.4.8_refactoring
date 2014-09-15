define(['libs', 'c', 'CommonStore', 'FlightModel', 'FlightStore', buildViewTemplatesPath('passengerselect.html')], function (libs, c, CommonStore, FlightModel, FlightStore, html) {
    var passengerQueryModel = FlightModel.passengerQueryModel.getInstance(),
        passengerEditModel = FlightModel.passengerEditModel.getInstance(),
        passengerEditStore = FlightStore.passengerEditStore.getInstance(),
        passengerQueryStore = FlightStore.passengerQueryStore.getInstance(),
        passengerChooseStore = FlightStore.passengerChooseStore.getInstance(),
        userStore = CommonStore.UserStore.getInstance(),
		passPageTypeStore = FlightStore.passPageTypeStore.getInstance(),
		oPageType = 0; //0: 我的携程， 1：国内，2：国际
    var View = c.view.extend({
        tpl: html,
        pageid: '214031',
        render: function () {
            this.$el.html(this.tpl);
            this.elsBox = {
                p_select_wrap: this.$el.find('#p_select_wrap'),
                p_select_tpl: this.$el.find('#p_select_tpl')
            };
            this.elHTML = _.template(this.elsBox.p_select_tpl.html())
        },
        events: {
            'click #js_return': 'backAction',
            'click .js_boa_info': 'onChooseClick',
            'click #js_addPassenger': 'onPassengerAdd',
            'click .js_editBox': 'onPassengerEdit',
            'click .rightblue': 'finishAction'
        },
        updatePage: function (complete) {
			
            var _this = this;
            this.showLoading();
            if (userStore.isLogin()) {
                var UserID = userStore.getUser().UserID;
                passengerQueryStore.setLifeTime('1D');
                passengerQueryModel.setParam('UserId', UserID);
                passengerQueryModel.excute(function (data) {
                    var store = passengerQueryModel.getResultStore();

                    store.setAttr('UserId', UserID, store.getTag());
                    DataControl.loadStore();
					
                    if (DataControl.viewdata.passengers.length || !oPageType) {
                        complete.call(this);
                    } else {
                        setTimeout(function () { //防止出现两个view
                            _this.onPassengerAdd(null, true);
                        }, 30);
                    }
                }, function (e) {
                    if (e.head && e.head.errcode && e.head.errcode == 1003) {
                    //更新登录跳转地址 caof 20131108
                        window.location.href = '/webapp/myctrip/#account/login?t=1&from=' + encodeURIComponent('/webapp/flight/#passengerselect');
                    } else {
                        //this.showToast('数据查询失败，请重试')
						this.turning();
						this.showHeadWarning('选择登机人', "数据查询失败，请重试", function () {
							_this.back(); this.hide();
						});
                    }
                    this.hideLoading();
                }, false, this);

            } else {
                passengerQueryStore.setLifeTime('15D');
                var passengerQuery = passengerQueryStore.get();
                if (!passengerQuery || passengerQuery.UserId) {
                    passengerQueryStore.remove();
                    setTimeout(function () {//防止出现两个view
                        _this.onPassengerAdd(null, true);
                    }, 30)
                } else {
                    DataControl.loadStore();
                    complete.call(this);
                }
            }
        },
        onCreate: function () {
            this.render();
        },
        //数据加载阶段
        onLoad: function () {
            this.updatePage(function () {
                this.elsBox.p_select_wrap.html(this.elHTML(DataControl.viewdata));
                this.hideLoading();
                this.turning();
            });
        },
        //调用turning方法时触发
        onShow: function () { },
        onHide: function () { },
        backAction: function () {
			if(!oPageType){
				this.jump('/webapp/myctrip/');
			}else{
				for (var i = 0, le = DataControl.viewdata.passengers.length; i < le; i++) {
					if (DataControl.viewdata.passengers[i].selected == 2) {
						DataControl.viewdata.passengers[i].selected = 0;
					}
					if (DataControl.viewdata.passengers[i].selected == -1) {
						DataControl.viewdata.passengers[i].selected = 1;
					}
				}
				DataControl.saveStore();
				this.showLoading();
				oPageType == 1 ? this.back('#bookinginfo') : this.jump('/webapp/fltintl/#booking')
				
			}
        },
        finishAction: function () {

            if(!oPageType) return;

            if (DataControl.viewdata.selCount) {
                for (var i = 0, le = DataControl.viewdata.passengers.length; i < le; i++) {
                    if (DataControl.viewdata.passengers[i].selected == 2) {
                        DataControl.viewdata.passengers[i].selected = 1;
                    }
                    if (DataControl.viewdata.passengers[i].selected == -1) {
                        DataControl.viewdata.passengers[i].selected = 0;
                    }
                }
                DataControl.saveStore()
                this.showLoading();
                oPageType == 1 ? this.back('#bookinginfo') : this.jump('/webapp/fltintl/#booking')
            } else {
                this.showToast('请选择登机人');
            }
        },
        
        onChooseClick: function (e) {
		
			if(!oPageType) return;
			
            var iIndex = $(e.currentTarget).parents('li').index() - 1;
            var $boa_info = $(e.currentTarget).parents('li').find('.sel_ico');
            if ($boa_info.hasClass('mulselect_yes')) {
                $boa_info.removeClass('mulselect_yes').addClass('mulselect_no')
                DataControl.viewdata.selCount--;
                if (DataControl.viewdata.passengers[iIndex].selected == 1) {
                    DataControl.viewdata.passengers[iIndex].selected = -1;
                } else {
                    DataControl.viewdata.passengers[iIndex].selected = 0;
                }
            } else {
                if (DataControl.viewdata.selCount >= 9) {
                    this.showToast('一张订单最多添加9个登机人，如需添加更多登机人，您可以再下一张订单哦~');
                    return;
                }
                
                if(oPageType == 1 && !this.Choose_CN(iIndex)){
					return false;
				}
				if(oPageType == 2 && !this.Choose_EN(iIndex)){
					return false;
				}
				
				DataControl.viewdata.selCount++;
                $boa_info.removeClass('mulselect_no').addClass('mulselect_yes')
                if (DataControl.viewdata.passengers[iIndex].selected == 0) {
                    DataControl.viewdata.passengers[iIndex].selected = 2;
                } else {
                    DataControl.viewdata.passengers[iIndex].selected = 1;
                }
            }
            
			DataControl.saveStore();
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
		},
        
		onPassengerAdd: function (e, isSkip) {
            if (DataControl.viewdata.selCount >= 9) {
                this.showToast('一张订单最多添加9个登机人，如需添加更多登机人，您可以再下一张订单哦~');
                return;
            }
            this.showLoading();
            passengerEditStore.remove()
			var defaIdType = 1;
			if( oPageType == 2) defaIdType = 2  ;
			
            passengerEditStore.set({ "opr": 1, "birth": "", "biztype": 4, "cname": "", "email": "", "ename": "", "flag": 0, "gender": 2, "idcards": [{ "opr": 1, "flag": 2, "no": "", "expiryDate": "2099/1/1", "type": defaIdType}], "inforId": 0, "mphone": "", "fmphone": "", "natl": "", "ver": 1, "defaIdCard": { "opr": 1, "flag": 2, "no": "", "expiryDate": "2099/1/1", "type": defaIdType } })
            if (!isSkip) {
                passengerEditStore.setAttr('backurl', 'passengerSelect');
            }
            this.forward('#passengerEdit');
        },
        onPassengerEdit: function (e) {
            var iIndex = $(e.currentTarget).parents('li').index() - 1;
            if (DataControl.viewdata.selCount >= 9 && DataControl.viewdata.passengers[iIndex].selected != 1 && DataControl.viewdata.passengers[iIndex].selected != 2) {
                this.showToast('一张订单最多添加9个登机人，如需添加更多登机人，您可以再下一张订单哦~');
                return;
            }
            this.showLoading();
            var inforId = $(e.currentTarget).parent().data('id');
            DataControl.saveInforIdStore(inforId);
            passengerEditStore.setAttr('opr', 4);
            passengerEditStore.setAttr('backurl', 'passengerSelect');
            this.forward('#passengerEdit');
        },
        Card_isName: function (str) {   					//身份证
            var result = {};
            var cNamereg = /^[\u4e00-\u9fa5]{2,14}$/;
            str = str.replace(/\s/g, '');
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
            Cstr = Cstr.replace(/\s/g, '');
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
        getBirth: function (UUserCard) {        			//根据身份证号获取生日
            var birth = UUserCard.substring(6, 14);
            return birth;
        },
        testBirth: function (str) {							//检测生日
            str = $.trim(str);
            if (!str) {
                this.showToast('请填写出生日期');
                return false;
            }
            var birthDate = c.base.Date.parse(str);
            str = c.base.Date.format(birthDate, 'Ymd');
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
        getAge: function (birthStr) {						//获取年龄
            var myDate = this.getServerDate();
            var month = myDate.getMonth() + 1;
            var day = myDate.getDate();
            var age = myDate.getFullYear() - birthStr.substring(0, 4) - 1;
            if (birthStr.substring(4, 6) < month || birthStr.substring(4, 6) == month && birthStr.substring(6, 8) <= day) {
                age++;
            }
            return age;
        },
        haveNoFan: function (str) {              			//是否繁体字
            var fanStr = '皚藹礙愛翺襖奧壩罷擺敗頒辦絆幫綁鎊謗剝飽寶報鮑輩貝鋇狽備憊繃筆畢斃閉邊編貶變辯辮鼈癟瀕濱賓擯餅撥缽鉑駁蔔補參蠶殘慚慘燦蒼艙倉滄廁側冊測層詫攙摻蟬饞讒纏鏟産闡顫場嘗長償腸廠暢鈔車徹塵陳襯撐稱懲誠騁癡遲馳恥齒熾沖蟲寵疇躊籌綢醜櫥廚鋤雛礎儲觸處傳瘡闖創錘純綽辭詞賜聰蔥囪從叢湊竄錯達帶貸擔單鄲撣膽憚誕彈當擋黨蕩檔搗島禱導盜燈鄧敵滌遞締點墊電澱釣調叠諜疊釘頂錠訂東動棟凍鬥犢獨讀賭鍍鍛斷緞兌隊對噸頓鈍奪鵝額訛惡餓兒爾餌貳發罰閥琺礬釩煩範販飯訪紡飛廢費紛墳奮憤糞豐楓鋒風瘋馮縫諷鳳膚輻撫輔賦複負訃婦縛該鈣蓋幹趕稈贛岡剛鋼綱崗臯鎬擱鴿閣鉻個給龔宮鞏貢鈎溝構購夠蠱顧剮關觀館慣貫廣規矽歸龜閨軌詭櫃貴劊輥滾鍋國過駭韓漢閡鶴賀橫轟鴻紅後壺護滬戶嘩華畫劃話懷壞歡環還緩換喚瘓煥渙黃謊揮輝毀賄穢會燴彙諱誨繪葷渾夥獲貨禍擊機積饑譏雞績緝極輯級擠幾薊劑濟計記際繼紀夾莢頰賈鉀價駕殲監堅箋間艱緘繭檢堿鹼揀撿簡儉減薦檻鑒踐賤見鍵艦劍餞漸濺澗漿蔣槳獎講醬膠澆驕嬌攪鉸矯僥腳餃繳絞轎較稭階節莖驚經頸靜鏡徑痙競淨糾廄舊駒舉據鋸懼劇鵑絹傑潔結誡屆緊錦僅謹進晉燼盡勁荊覺決訣絕鈞軍駿開凱顆殼課墾懇摳庫褲誇塊儈寬礦曠況虧巋窺饋潰擴闊蠟臘萊來賴藍欄攔籃闌蘭瀾讕攬覽懶纜爛濫撈勞澇樂鐳壘類淚籬離裏鯉禮麗厲勵礫曆瀝隸倆聯蓮連鐮憐漣簾斂臉鏈戀煉練糧涼兩輛諒療遼鐐獵臨鄰鱗凜賃齡鈴淩靈嶺領餾劉龍聾嚨籠壟攏隴樓婁摟簍蘆盧顱廬爐擄鹵虜魯賂祿錄陸驢呂鋁侶屢縷慮濾綠巒攣孿灤亂掄輪倫侖淪綸論蘿羅邏鑼籮騾駱絡媽瑪碼螞馬罵嗎買麥賣邁脈瞞饅蠻滿謾貓錨鉚貿麽黴沒鎂門悶們錳夢謎彌覓綿緬廟滅憫閩鳴銘謬謀畝鈉納難撓腦惱鬧餒膩攆撚釀鳥聶齧鑷鎳檸獰甯擰濘鈕紐膿濃農瘧諾歐鷗毆嘔漚盤龐國愛賠噴鵬騙飄頻貧蘋憑評潑頗撲鋪樸譜臍齊騎豈啓氣棄訖牽扡釺鉛遷簽謙錢鉗潛淺譴塹槍嗆牆薔強搶鍬橋喬僑翹竅竊欽親輕氫傾頃請慶瓊窮趨區軀驅齲顴權勸卻鵲讓饒擾繞熱韌認紉榮絨軟銳閏潤灑薩鰓賽傘喪騷掃澀殺紗篩曬閃陝贍繕傷賞燒紹賒攝懾設紳審嬸腎滲聲繩勝聖師獅濕詩屍時蝕實識駛勢釋飾視試壽獸樞輸書贖屬術樹豎數帥雙誰稅順說碩爍絲飼聳慫頌訟誦擻蘇訴肅雖綏歲孫損筍縮瑣鎖獺撻擡攤貪癱灘壇譚談歎湯燙濤縧騰謄銻題體屜條貼鐵廳聽烴銅統頭圖塗團頹蛻脫鴕馱駝橢窪襪彎灣頑萬網韋違圍爲濰維葦偉僞緯謂衛溫聞紋穩問甕撾蝸渦窩嗚鎢烏誣無蕪吳塢霧務誤錫犧襲習銑戲細蝦轄峽俠狹廈鍁鮮纖鹹賢銜閑顯險現獻縣餡羨憲線廂鑲鄉詳響項蕭銷曉嘯蠍協挾攜脅諧寫瀉謝鋅釁興洶鏽繡虛噓須許緒續軒懸選癬絢學勳詢尋馴訓訊遜壓鴉鴨啞亞訝閹煙鹽嚴顔閻豔厭硯彥諺驗鴦楊揚瘍陽癢養樣瑤搖堯遙窯謠藥爺頁業葉醫銥頤遺儀彜蟻藝億憶義詣議誼譯異繹蔭陰銀飲櫻嬰鷹應纓瑩螢營熒蠅穎喲擁傭癰踴詠湧優憂郵鈾猶遊誘輿魚漁娛與嶼語籲禦獄譽預馭鴛淵轅園員圓緣遠願約躍鑰嶽粵悅閱雲鄖勻隕運蘊醞暈韻雜災載攢暫贊贓髒鑿棗竈責擇則澤賊贈紮劄軋鍘閘詐齋債氈盞斬輾嶄棧戰綻張漲帳賬脹趙蟄轍鍺這貞針偵診鎮陣掙睜猙幀鄭證織職執紙摯擲幟質鍾終種腫衆謅軸皺晝驟豬諸誅燭矚囑貯鑄築駐專磚轉賺樁莊裝妝壯狀錐贅墜綴諄濁茲資漬蹤綜總縱鄒詛組鑽緻鐘麼為隻兇準啟闆裡靂餘鍊洩';
            var thisArr = str.split('')
            for (var i = 0; i < thisArr.length; i++) {
                if (fanStr.indexOf(thisArr[i]) != -1) {
                    return false;
                }
            }
            return true;
        }
    
	});
    var DataControl = {
        viewdata: {},
        loadStore: function () {
			
			oPageType = +passPageTypeStore.getAttr('type') || 0;

			this.createSort();
			
            var passengerQuery = passengerQueryStore.get();
            if (passengerQuery !== null) {
                passengerQuery.selCount = 0;
                if (passengerQuery.flightType != oPageType) {
                    for (var i = 0, le = passengerQuery.passengers.length; i < le; i++) {  //证件排序
                        delete passengerQuery.passengers[i].selected;
                        delete passengerQuery.passengers[i].defaIdCard;
                    }
                }
                passengerQuery.flightType = oPageType;
                //统计已选项
                for (var i = 0, le = passengerQuery.passengers.length; i < le; i++) {  //证件排序
                    if (passengerQuery.passengers[i].selected == 1 || passengerQuery.passengers[i].selected == 2) {
                        passengerQuery.selCount++;
                    }
                    passengerQuery.passengers[i].idcards.sort(function (a, b) {
                        var asort = (DataControl.idCardTypeSort[a.type] && DataControl.idCardTypeSort[a.type].num) || 1000,
                            bsort = (DataControl.idCardTypeSort[b.type] && DataControl.idCardTypeSort[b.type].num) || 1000;
                        return asort < bsort ? -1 : (asort > bsort ? 1 : 0);
                    });
                    if (!passengerQuery.passengers[i].defaIdCard) {
                        if (passengerQuery.passengers[i].idcards && passengerQuery.passengers[i].idcards.length) {
                            var type = passengerQuery.passengers[i].idcards[0].type;
                            if (DataControl.idCardTypeSort[type]) {
                                passengerQuery.passengers[i].defaIdCard = passengerQuery.passengers[i].idcards[0];
                                passengerQuery.passengers[i].defaIdCard.name = DataControl.idCardTypeSort[type] && DataControl.idCardTypeSort[type].name;
                            } else {
                                passengerQuery.passengers[i].defaIdCard = null;
                            }
                        } else {
                            passengerQuery.passengers[i].defaIdCard = null;
                        }
                    }
                }
                for (var attr in passengerQuery) {
                    this.viewdata[attr] = passengerQuery[attr];
                }
				this.viewdata.pageType = oPageType;
            }
        },
        saveStore: function () {
            if (!c.utility.validate.isEmptyObject(this.viewdata)) {
                var passengerQuery = {};
                for (var attr in this.viewdata) {
                    passengerQuery[attr] = this.viewdata[attr];
                }
                var tag = passengerQueryStore.getTag();
                passengerQueryStore.set(passengerQuery, tag);
            }
        },
        saveInforIdStore: function (id) {
            if (!id) {
                passengerEditStore.remove()
                return;
            }
            if (!c.utility.validate.isEmptyObject(this.viewdata)) {
                for (var i = 0; i < this.viewdata.passengers.length; i++) {
                    if (this.viewdata.passengers[i].inforId == id) {
                        passengerEditStore.set(this.viewdata.passengers[i]);
                        break;
                    }
                }
            }
        },

		createSort: function(){
			if(oPageType == 1){
			
				this.idCardTypeSort = {
					1: { num: 1, name: '身份证' },
					2: { num: 2, name: '护照' },
					8: { num: 3, name: '台胞证' },
					7: { num: 4, name: '回乡证' },
					4: { num: 5, name: '军人证' },
					10: { num: 6, name: '港澳通行证' },
					21: { num: 7, name: '旅行证' },
					20: { num: 8, name: '外国人永久居留证' },
					11: { num: 9, name: '国际海员证' },
					99: { num: 10, name: '其它' }
				}
				
			}else if(oPageType == 2){
				this.idCardTypeSort = {
					2:{num:1,name:'护照'},
					10:{num:2,name:'港澳通行证'},
					8:{num:3,name:'台胞证'},
					7:{num:4,name:'回乡证'},         
					22:{num:5,name:'台湾通行证'},
					11:{num:6,name:'国际海员证'}
				}
				
			}else{
				this.idCardTypeSort = {
					1: { num: 1, name: '身份证' },
					2: { num: 2, name: '护照' },
					8: { num: 3, name: '台胞证' },
					7: { num: 4, name: '回乡证' },
					4: { num: 5, name: '军人证' },
					10: { num: 6, name: '港澳通行证' },
					22: {num:5,name:'台湾通行证'},
					21: { num: 7, name: '旅行证' },
					20: { num: 8, name: '外国人永久居留证' },
					11: { num: 9, name: '国际海员证' },
					25: { num: 10, name: '户口簿' },
					27: { num: 11, name: '出生证明' },
					99: { num: 12, name: '其它' },
				} 
				
			}
		}
    };
    return View;
});
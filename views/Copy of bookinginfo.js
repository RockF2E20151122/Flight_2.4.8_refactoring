/// <summary>
/// 机票订单填写 creator:caofu; createtime:2013-07-23
/// </summary>
define("vDataControl",["FlightStore","CPageStore","c","flight/utility/utility"],function(a,b,c,d){function e(a){this._this=a}function f(a,b){b=c.base.Date.parse(b),b=c.base.Date.format(b,"Y/m/d");var d=a.getTime(),e=new Date(b.replace(/-/g,"/")).getTime();return 14>=(d-e)/864e5?!0:!1}var g=a.FlightDetailsStore.getInstance(),h=b.passengerQueryStore.getInstance(),i=b.passengerEditStore.getInstance(),j={ADULT:1,CHILD:2,BABY:3,NEWBORN:4};return e.prototype={passengerData:{},PassEditData:{},reqFlags:{DETAIL:!1,PASSENGERS:!1,HASPASSENGER:!1},errorType:null,errorMessage:null,tipIconType:"",TIPICONS:{BLUE:"flight-errtips-blue",RED:"flight-errtips-red"},errorInfo:null,allErrorInfo:[],loadPassengger:function(){var a=h.get();if(a){if(a.selCount=0,1!=a.flightType&&userStore.isLogin())for(var b=0,c=a.passengers.length;c>b;b++)delete a.passengers[b].selected,delete a.passengers[b].defaIdCard;a.flightType="1",1==a.passengers.length&&0!=a.passengers[0].selected&&d.checkPassenger(this._this,this._this.showToast,a.passengers)&&(a.passengers[0].selected=1);for(var b=0,c=a.passengers.length;c>b;b++){if(a.passengers[b].idcards.sort(function(a,b){var c=e.idCardTypeSort[a.type]&&e.idCardTypeSort[a.type].num||1e3,d=e.idCardTypeSort[b.type]&&e.idCardTypeSort[b.type].num||1e3;return d>c?-1:c>d?1:0}),!a.passengers[b].defaIdCard)if(a.passengers[b].idcards&&a.passengers[b].idcards.length){var f=a.passengers[b].idcards[0].type;e.idCardTypeSort[f]?(a.passengers[b].defaIdCard=a.passengers[b].idcards[0],a.passengers[b].defaIdCard.name=e.idCardTypeSort[f]&&e.idCardTypeSort[f].name):a.passengers[b].defaIdCard=null}else a.passengers[b].defaIdCard=null;if(0!=a.passengers[b].selected&&userInfo&&userInfo.UserName&&(userInfo.UserName==a.passengers[b].ename||userInfo.UserName==a.passengers[b].cname)&&a.passengers[b].idcards.length>0&&a.passengers[b].defaIdCard){var g=[];g[0]=a.passengers[b],this._this.checkPassenger(g)&&(a.passengers[b].selected=1)}1==a.passengers[b].selected&&a.selCount++}for(var i in a)this.passengerData[i]=a[i];this.savePassengger()}else this.passengerData={}},savePassengger:function(){if(!c.utility.validate.isEmptyObject(this.passengerData)){var a={};for(var b in this.passengerData)a[b]=this.passengerData[b];var d=h.getTag();h.set(a,d)}},loadPassEditStore:function(){var a=i.get();a.birth&&(a.birth=c.base.Date.parse(a.birth).format("Ymd"));for(var b=this.idCardsDict(),e=0;e<b.length;e++){b[e].no="",b[e].opr=1,b[e].flag=2,b[e].expiryDate="2099/1/1";for(var f=0;f<a.idcards.length;f++)if(b[e].type==a.idcards[f].type)for(var g in a.idcards[f])b[e][g]=a.idcards[f][g]}a.idcards=b,1==a.defaIdCard.type&&(a.idcards[0].no=d.formatCardNo(a.idcards[0].no),a.defaIdCard.no=d.formatCardNo(a.defaIdCard.no));for(var g in a)this.PassEditData[g]=a[g];for(var g in this.PassEditData)this.PassEditData[g]=a[g]},savePassEditStore:function(){if(!c.utility.validate.isEmptyObject(this.PassEditData)){var a={};this.PassEditData.selected=1;for(var b in this.PassEditData)a[b]=this.PassEditData[b];a.idcards=[],a.defaIdCard.no=a.defaIdCard.no.replace(/\s/g,""),a.idcards[0]=a.defaIdCard,a.birth&&(a.birth=c.base.Date.parse(a.birth).format("Y-m-d")),i.set(a)}},saveEditInQueryStore:function(){if(!c.utility.validate.isEmptyObject(this.PassEditData)){this.savePassEditStore();var a=h.get(),b=i.get(),d=!0;a||(a={passengers:[]});for(var e=0;e<a.passengers.length;e++)if(a.passengers[e].inforId==b.inforId){d=!1,a.passengers.splice(e,1),a.passengers.push(b);break}d&&a.passengers.push(b),a.flightType=1;var f=h.getTag();h.set(a,f)}},deletePsgById:function(a){var b=h.get(),c=h.getAttr("selCount");b&&b.passengers&&_.each(b.passengers,function(d,e){return d.inforId==a?(b.passengers.splice(e,1),c--,!1):void 0}),h.setAttr("passengers",b.passengers),h.setAttr("selCount",c)},getPsgById:function(a){var b=h.getAttr("passengers"),c=null;return b&&_.each(b,function(b){return b.inforId==a?(c=b,!1):void 0}),c},handleDirtyPassegners:function(a){var b=/^[\u4e00-\u9fa5]{2,14}$/,e=/^[A-Za-z0-9]+$/g,f=[],g=!1,i=[];_.each(a,function(a,h){1!=a.selected||"undefined"!=typeof a.edit&&"undefined"!=typeof a.empty||(a.firstName="",a.lastName="",a.ename&&(a.ename.indexOf("/")>0?(f=a.ename.split("/"),a.firstName=f[0],a.lastName=f[1]):a.firstName=a.ename),a.defaIdCard&&1==a.defaIdCard.type?(a.empty=a.cname||a.defaIdCard.no?!1:!0,a.edit=a.empty?!0:!1,a.edit===!1&&(a.edit=!(a.cname&&b.test(a.cname)&&c.utility.validate.isIdCard(a.defaIdCard.no))),a.edit?i.push(h):""):(a.empty=a.cname||a.ename||a.birth?!1:!0,a.edit=a.empty?!0:!1,a.edit===!1&&(g=d.testBirth(this._this.showToast,a.birth,!1,a.defaIdCard.type),g&&(g=!!(a.defaIdCard.no&&a.defaIdCard.no<=20&&e.test(a.defaIdCard.no))),g&&(g=!!(a.ename&&b.test(a.cname)||this._this.validateFirstName(this._this.showToast,a.firstName,!1)&&this._this.validateLastName(this._this.showToast,a.lastName,!1)&&a.firstName.length+a.lastName.length<=26)),a.edit=!g),a.edit?i.push(h):""))});for(var j=1;j<i.length;j++)a.splice(j,1);h.setAttr("passengers",a)},getBirth:function(a){var b="";return b=1!=a.defaIdCard.type?a.birth:a.defaIdCard.no?a.defaIdCard.no.substring(6,14):""},getAge:function(a,b){a=c.base.Date.parse(a),a=c.base.Date.format(a,"Ymd"),b="undefined"==typeof b?!0:!1;var d,e,h=g.getAttr("items");try{d=h.length>1?h[1].basicInfo.dTime:h[0].basicInfo.dTime,e=h[0].basicInfo.dTime,d=(d||"").replace(/-/g,"/"),d=new Date(d),e=(e||"").replace(/-/g,"/"),e=new Date(e),console.log("flyDate",d)}catch(i){d=this._this.getServerDate(),e=this._this.getServerDate(),console.log("GetAge Exception: myData->",d)}var j=d.getMonth()+1,k=d.getDate(),l=d.getFullYear()-a.substring(0,4)-1;return(a.substring(4,6)<j||a.substring(4,6)==j&&a.substring(6,8)<=k)&&l++,l=f(e,a,l)?-2:l},getPsgType:function(a,b){if(b){var c=b.defaIdCard&&1==b.defaIdCard.type?d.getBirth(b.defaIdCard.no):b.birth;if(""==c)return j.ADULT;a=this.getAge(c)}return a>=12?j.ADULT:a>=2?j.CHILD:j.BABY},getSelectedPassengers:function(){var a=h.get(),b=j.ADULT,c=[];if(a&&a.passengers)for(var d in a.passengers){var e=a.passengers[d];if(b=this.getPsgType(null,e),1==+e.selected){if(!this.isSupportChild()&&b==j.CHILD||!this.isSupportBaby()&&b==j.BABY)continue;c.push(e)}}return c},updatePassengersTicketType:function(a){if(!a)return!1;var b=a.passengers||[],c=a.policy||g.getAttr("items")[0].policy,d=c.isApplyChild,e=this.hasChildTicket(),f=this.hasBabyTicket(),i=e&&c.childPolicy.isApply,k=this.getTicketAmtByType(j.ADULT),l=this.getTicketAmtByType(j.CHILD),m=this.getTicketAmtByType(j.BABY),n=e&&k>l?!0:!1,o=f&&(e&&l>m||!e)?!0:!1,p=f&&k>m?!0:!1,q=j.ADULT,r=this;$(b).each(function(a,b){q=r.getPsgType(null,b),q!=j.ADULT?q==j.CHILD?b.ticketType==j.ADULT&&d||b.ticketType==j.CHILD&&e||(b.ticketType=e?d?n?j.CHILD:j.ADULT:j.CHILD:d?j.ADULT:-1):q==j.BABY&&(b.ticketType==j.ADULT&&d||b.ticketType==j.CHILD&&i||b.ticketType==j.BABY&&f||(b.ticketType=f?e&&d?i&&n?o?j.BABY:j.CHILD:p?j.BABY:j.ADULT:e?i?o?j.BABY:j.CHILD:j.BABY:d?p?j.BABY:j.ADULT:j.BABY:e&&i?n?j.CHILD:d?j.ADULT:j.CHILD:d?j.ADULT:-1)):b.ticketType=j.ADULT}),h.setAttr("passengers",b)},getTicketPolicy:function(a,b){b=b||0;var c=g.getAttr("items"),d=c[b].policy,e=null;switch(a){case-1:e={price:0,fuelCost:0,tax:0};break;case 1:e=d;break;case 2:e=d.childPolicy;break;case 3:e=d.babyPolicy;break;default:e=d}return e},getTicketAmtByType:function(a){var b=g.getAttr("items"),c=this.getTicketPolicy(a),d=0;return c?(d+=c.price+c.fuelCost+c.tax,b.length>1&&(c=this.getTicketPolicy(a,1),c&&(d+=c.price+c.fuelCost+c.tax))):d=null,d},isSupportChild:function(){var a=g.getAttr("items"),b=a[0].policy;return b.isApplyChild||b.childPolicy},isSupportBaby:function(){var a=g.getAttr("items"),b=a[0].policy;return b.isApplyChild||b.childPolicy&&b.childPolicy.isApply||b.babyPolicy},hasChildTicket:function(){var a=g.getAttr("items"),b=a[0].policy;return!!b.childPolicy},hasBabyTicket:function(){var a=g.getAttr("items"),b=a[0].policy;return!!b.babyPolicy},babyCanBuyChildTicket:function(){var a=g.getAttr("items"),b=a[0].policy;return b.childPolicy&&b.childPolicy.isApply},verifyCard:function(a,b,d){var e=/^(19[0-9]{2}|20[01]{1}\d{1})(0[1-9]{1}|1[0-2]{1})(0[1-9]{1}|[12]\d{1}|3[01]{1})$/;if(1==a){if(18==b.length&&c.utility.validate.isIdCard(b)){var f=$.trim(b).substring(6,14);return e.test(f)&&this.getAge(f)>12}return!1}return!b.length||b.length>20?!1:8==a||7==a||10==a?this.isFan(d):!0},verify:function(a){var b=/^[\u4e00-\u9fa5]{2,14}$/,c=/^\w+\/\w+\s*\w+$/i;return!!$.trim(a)&&b.test(a)&&a.length<=29||!!$.trim(a)&&c.test(a)&&a.length<=29},isFan:function(a){for(var b="皚藹礙愛翺襖奧壩罷擺敗頒辦絆幫綁鎊謗剝飽寶報鮑輩貝鋇狽備憊繃筆畢斃閉邊編貶變辯辮鼈癟瀕濱賓擯餅撥缽鉑駁蔔補參蠶殘慚慘燦蒼艙倉滄廁側冊測層詫攙摻蟬饞讒纏鏟産闡顫場嘗長償腸廠暢鈔車徹塵陳襯撐稱懲誠騁癡遲馳恥齒熾沖蟲寵疇躊籌綢醜櫥廚鋤雛礎儲觸處傳瘡闖創錘純綽辭詞賜聰蔥囪從叢湊竄錯達帶貸擔單鄲撣膽憚誕彈當擋黨蕩檔搗島禱導盜燈鄧敵滌遞締點墊電澱釣調叠諜疊釘頂錠訂東動棟凍鬥犢獨讀賭鍍鍛斷緞兌隊對噸頓鈍奪鵝額訛惡餓兒爾餌貳發罰閥琺礬釩煩範販飯訪紡飛廢費紛墳奮憤糞豐楓鋒風瘋馮縫諷鳳膚輻撫輔賦複負訃婦縛該鈣蓋幹趕稈贛岡剛鋼綱崗臯鎬擱鴿閣鉻個給龔宮鞏貢鈎溝構購夠蠱顧剮關觀館慣貫廣規矽歸龜閨軌詭櫃貴劊輥滾鍋國過駭韓漢閡鶴賀橫轟鴻紅後壺護滬戶嘩華畫劃話懷壞歡環還緩換喚瘓煥渙黃謊揮輝毀賄穢會燴彙諱誨繪葷渾夥獲貨禍擊機積饑譏雞績緝極輯級擠幾薊劑濟計記際繼紀夾莢頰賈鉀價駕殲監堅箋間艱緘繭檢堿鹼揀撿簡儉減薦檻鑒踐賤見鍵艦劍餞漸濺澗漿蔣槳獎講醬膠澆驕嬌攪鉸矯僥腳餃繳絞轎較稭階節莖驚經頸靜鏡徑痙競淨糾廄舊駒舉據鋸懼劇鵑絹傑潔結誡屆緊錦僅謹進晉燼盡勁荊覺決訣絕鈞軍駿開凱顆殼課墾懇摳庫褲誇塊儈寬礦曠況虧巋窺饋潰擴闊蠟臘萊來賴藍欄攔籃闌蘭瀾讕攬覽懶纜爛濫撈勞澇樂鐳壘類淚籬離裏鯉禮麗厲勵礫曆瀝隸倆聯蓮連鐮憐漣簾斂臉鏈戀煉練糧涼兩輛諒療遼鐐獵臨鄰鱗凜賃齡鈴淩靈嶺領餾劉龍聾嚨籠壟攏隴樓婁摟簍蘆盧顱廬爐擄鹵虜魯賂祿錄陸驢呂鋁侶屢縷慮濾綠巒攣孿灤亂掄輪倫侖淪綸論蘿羅邏鑼籮騾駱絡媽瑪碼螞馬罵嗎買麥賣邁脈瞞饅蠻滿謾貓錨鉚貿麽黴沒鎂門悶們錳夢謎彌覓綿緬廟滅憫閩鳴銘謬謀畝鈉納難撓腦惱鬧餒膩攆撚釀鳥聶齧鑷鎳檸獰甯擰濘鈕紐膿濃農瘧諾歐鷗毆嘔漚盤龐國愛賠噴鵬騙飄頻貧蘋憑評潑頗撲鋪樸譜臍齊騎豈啓氣棄訖牽扡釺鉛遷簽謙錢鉗潛淺譴塹槍嗆牆薔強搶鍬橋喬僑翹竅竊欽親輕氫傾頃請慶瓊窮趨區軀驅齲顴權勸卻鵲讓饒擾繞熱韌認紉榮絨軟銳閏潤灑薩鰓賽傘喪騷掃澀殺紗篩曬閃陝贍繕傷賞燒紹賒攝懾設紳審嬸腎滲聲繩勝聖師獅濕詩屍時蝕實識駛勢釋飾視試壽獸樞輸書贖屬術樹豎數帥雙誰稅順說碩爍絲飼聳慫頌訟誦擻蘇訴肅雖綏歲孫損筍縮瑣鎖獺撻擡攤貪癱灘壇譚談歎湯燙濤縧騰謄銻題體屜條貼鐵廳聽烴銅統頭圖塗團頹蛻脫鴕馱駝橢窪襪彎灣頑萬網韋違圍爲濰維葦偉僞緯謂衛溫聞紋穩問甕撾蝸渦窩嗚鎢烏誣無蕪吳塢霧務誤錫犧襲習銑戲細蝦轄峽俠狹廈鍁鮮纖鹹賢銜閑顯險現獻縣餡羨憲線廂鑲鄉詳響項蕭銷曉嘯蠍協挾攜脅諧寫瀉謝鋅釁興洶鏽繡虛噓須許緒續軒懸選癬絢學勳詢尋馴訓訊遜壓鴉鴨啞亞訝閹煙鹽嚴顔閻豔厭硯彥諺驗鴦楊揚瘍陽癢養樣瑤搖堯遙窯謠藥爺頁業葉醫銥頤遺儀彜蟻藝億憶義詣議誼譯異繹蔭陰銀飲櫻嬰鷹應纓瑩螢營熒蠅穎喲擁傭癰踴詠湧優憂郵鈾猶遊誘輿魚漁娛與嶼語籲禦獄譽預馭鴛淵轅園員圓緣遠願約躍鑰嶽粵悅閱雲鄖勻隕運蘊醞暈韻雜災載攢暫贊贓髒鑿棗竈責擇則澤賊贈紮劄軋鍘閘詐齋債氈盞斬輾嶄棧戰綻張漲帳賬脹趙蟄轍鍺這貞針偵診鎮陣掙睜猙幀鄭證織職執紙摯擲幟質鍾終種腫衆謅軸皺晝驟豬諸誅燭矚囑貯鑄築駐專磚轉賺樁莊裝妝壯狀錐贅墜綴諄濁茲資漬蹤綜總縱鄒詛組鑽緻鐘麼為隻兇準啟闆裡靂餘鍊洩",c=a.split(""),d=0;d<c.length;d++){var c=a.split("");if(-1!=b.indexOf(c[d]))return!0}return!1},idCardTypeSort:{1:{num:1,name:"身份证"},2:{num:2,name:"护照"},8:{num:3,name:"台胞证"},7:{num:4,name:"回乡证"},4:{num:5,name:"军人证"},10:{num:6,name:"港澳通行证"},25:{num:8,name:"户口簿"},27:{num:9,name:"出生证明"},99:{num:10,name:"其它"}},idCardsDict:function(){return[{type:1,name:"身份证"},{type:2,name:"护照"},{type:8,name:"台胞证"},{type:7,name:"回乡证"},{type:4,name:"军人证"},{type:10,name:"港澳通行证"},{type:25,name:"户口簿"},{type:27,name:"出生证明"},{type:99,name:"其它"}]},childBabyBuyTicketDesc:{title:"儿童婴儿购票说明",lines:["<p>1.航班起飞当日出生未满14天的婴儿，请至航空公司柜台申请购买机票</p>","<p>2.婴儿/儿童年龄区分：婴儿：14天-2周岁；儿童：2-12周岁（按航班起飞当日的实际年龄区分）</p>","<p>3.婴儿票价格：航线标准价的10%，不收机建费及燃油费。（注：婴儿票无座。如需座位，可选择购买儿童票或成人票）</p>","<p>4.儿童票价格：航线标准价的50%，不收机建费，燃油费为成人的50%</p>","<p>5.儿童、婴儿须由成人陪同登机。儿童如单独乘机，需直接至航空公司柜台申请购买机票</p>","<p>6.儿童婴儿购票可用证件：身份证、护照、户口簿、出生证明等</p>","<p>7.儿童婴儿购票可同时购买1份航意险</p>","<p>8. 部分成人价格允许儿童婴儿购买，根据航空公司公布的成人价格政策确定儿童婴儿是否允许购买成人票。</p>"]}},e}),define("vFlightInfo",["cWidgetMember","cWidgetFactory","c","libs","cUI","flight/utility/utility",buildViewTemplatesPath("../modules/bookingInfo/templates/tFlight.html")],function(a,b,c,d,e,f,g){var h={FC:"退改签",set:"旅行套餐",instruction:"套餐说明",FcAndInstruction:"套餐及退改签说明",NOTICKET:"抱歉，您选择的价格舱位已售完，请重新查询选择其它价格舱位预订。"},i=c.base,j=b.create("Member"),k=new c.base.Class({__propertys__:function(){this.opts=this.opts||{},this.parentView=null},setBoxes:function(){this.flightInfoBox=this.viewPort.find("#flightInfo")},setTemplate:function(){this.viewPort.append(g),this.j_flightInfoOneway_tpl=_.template(this.viewPort.find(".j_flightInfoOneway_tpl").html()),this.j_flightInfoReturn_tpl=_.template(this.viewPort.find(".j_flightInfoReturn_tpl").html()),this.j_childrenAndBaby_tpl=_.template(this.viewPort.find(".j_childrenAndBaby_tpl").html())},changeOpts:function(a){this.opts=$.extend(!0,this.opts,a),this.viewPort=this.opts.viewPort,this.parentView=this.opts.parentView,this.stores=this.parentView.stores,this.models=this.parentView.models},initialize:function(a){this.changeOpts(a),this.setBoxes(),this.setTemplate(),this.fireEvents()},EVENTS:{render:"render"},fireEvents:function(){},render:function(){var a=this.stores.selFlightInfoStore.get();if(!a)return this.parentView.showAlert(),!0;var b=this.initFlightInfoData();this.setHtml(b)},setHtml:function(a){this.flightInfoBox.empty();var b;if(!a||!a.items)return this.parentView.back("#list");var c=a.items[0].basicInfo,d=this.stores.flightSearchStore.getSearchDetails(0,"dcityName"),e=this.stores.flightSearchStore.getSearchDetails(0,"acityName");a.items.length>1?($(".j_flightTitle").removeClass("flight-h1twoline").html((c.dcname||d)+"-"+(c.acname||e)),b=this.j_flightInfoReturn_tpl(a)):($(".j_flightTitle").removeClass("flight-h1twoline").addClass("flight-h1twoline").html((c.dcname||d)+"-"+(c.acname||e)+"<br /><span>"+c.aname+c.flightNo+"</span>"),b=this.j_flightInfoOneway_tpl(a)),this.flightInfoBox.html(b);var f=this,g=this.viewPort.find(".j_RC"),i=this.viewPort.find(".j_policy");a.items.length>1?a.items[0].bIsPackage&&a.items[1].bIsPackage?g.html(h.instruction):(a.items[0].bIsPackage||a.items[1].bIsPackage)&&g.html(h.FcAndInstruction):a.items[0].bIsPackage&&(g.html(h.instruction),i.html(h.set)),i.removeClass("js_hide"),this.viewPort.find(".flight-loginline").on("click",f.bookLogin.bind(f)),g.on("click",f.tgBoxAction.bind(f))},bookLogin:function(){this.stores.mdStore.setAttr("IsClickLogin",!0),this.stores.flightOrderStore.setAttr("selInsure","1"),this.stores.userStore.isLogin()||(this.parentView.showLoading(),j.memberLogin({param:"from="+encodeURIComponent("/webapp/flight/#bookinginfo")+"&t=1"}))},renderList:function(a){var b=this,c=b.stores.flightOrderStore.get(),d=b.stores.userStore.getUser();c=c?c:{},a.cDate=i.Date,a.order=c;var e=b.stores.flightSearchStore.get(),f=b.stores.selFlightInfoStore.get();a.selectedFlight=f,a.flightSearch=e.items[0],a.user=d;var g=b.stores.salesStore.get();a._sales=g,this.setHtml(a)},initFlightInfoData:function(){for(var a=this,b=a.stores.selFlightInfoStore.get(),c={items:[],_sales:a.stores.salesStore.get(),pCount:1,cDate:i.Date,selectedFlight:b,flightSearch:a.stores.flightSearchStore.getAttr("items")[0],user:a.stores.userStore.getUser()},d=[],e=b.depart||{},f=b.arrive,g=[e,f],h=f?2:1,j=0;h>j;j++)d[j]={basicInfo:{aCtyCode:g[j].flight.aPortCode,aCtyId:null,aPortCode:g[j].flight.aPortCode,aTerminal:g[j].flight.aTerminal,aTime:g[j].flight.aTime,aaname:g[j].flight.aaname,acname:"",agreementId:"",airlineCode:g[j].flight.airlineCode,aname:g[j].flight.aname,channel:"",ctinfo:g[j].flight.ctinfo,dCtyCode:"BJS",dCtyId:"1",dPortCode:g[j].flight.dPortCode,dTerminal:g[j].flight.dTerminal,dTime:g[j].flight.dTime,daname:g[j].flight.daname,dcname:"",flag:g[j].flight.flag,flightNo:g[j].flight.flightNo,planeType:g[j].flight.planeType,puncRate:g[j].flight.puncRate,polid:g[j].cabin.pid},ext:"",policy:{isAddChd:null,activityBM:"",babyPolicy:null,cardTypes:"",childPolicy:null,isApplyChild:!0,"class":g[j].cabin.class,classForDisp:g[j].cabin.classForDisp,discount:g[j].cabin.discount,price:g[j].cabin.price,sPrice:g[j].cabin.price,fuelCost:"",tax:"",minNum:1,payments:[],productType:null,qty:10,subclass:g[j].cabin.subClass,subclassForDisp:null},proRmk:"",rmk:{notice:"",ticketTitle:"",ticketBody:"",refNote:"",rerNote:"",endNote:"",ext:null,specialClass:null},routingIdx:"",stopCities:g[j].flight.stopCities,prodRmk:""};return c.items=d,c},tgBoxAction:function(a){if(this.stores.mdStore.setAttr("IsCheckTGQ",!0),!this.parentView.isShowLoad){this.addBabyAndChildrenTips(this.parentView.i_hasChildrenOrBaby()?!1:!0);var b=$(a.currentTarget),c=$(".flight-pnttips").html(),d=$(".flight-rtntips").html(),e=(b.siblings(".flight-pnttips"),b.siblings(".flight-rtntips"),c+"<p>"+d+"</p><br />");f.popUp(this.viewPort,e)}},addBabyAndChildrenTips:function(a){if(a){if(this.viewPort.find(".flight-pnttips").find(".j_childrenAndBaby").length>0)return;this.viewPort.find(".flight-pnttips").append(this.j_childrenAndBaby_tpl())}else this.viewPort.find(".flight-pnttips").find(".j_childrenAndBaby").remove()},i_getFlightDetail:function(a){var b=this,c=b.parentView,d=b.stores.passengerQueryStore;b.models.flightDetailModel.excute(function(f){if(!(f&&f.items&&f.items.length))return c.alert=new e.Alert({title:"提示信息",message:h.NOTICKET,buttons:[{text:"知道了",click:function(){this.hide()}}]}),void c.alert.show();var g=b.stores.selFlightInfoStore.get();f.items[0].policy.rebateAmt=g.depart.cabin.rebateAmt||0,f.items.length>1&&(f.items[1].policy.rebateAmt=g.arrive.cabin.rebateAmt||0);var i=d.get();DataControl.updatePassengersTicketType(i),c.trigger(c.EVENTS.FILTERPASSENGERS,i?i.passengers:null);var j=DataControl.getSelectedPassengers();f.passengers=j,f.pCount=j.length,d.setAttr("validSelCount",f.pCount),a&&a(f),c.renderList(f),b.viewPort.find(".j_hd").removeClass("js_hide"),c.hideLoading()},function(a){var d=a.msg?a.msg:"啊哦,数据加载出错了!";30001==a.res?(c.alert=new e.Alert({title:"提示信息",message:h.NOTICKET,buttons:[{text:"知道了",click:function(){this.hide(),b.stores.flightSearchStore.setAttr("fullCabin",!0),c.back("list")}}]}),c.alert.show()):c.showAlert(d),c.hideLoading()},!1,b)}});return k}),define("vCorporater1",["c"],function(a){var b=require("flight/utility/utility"),c={setPassengerById:function(a,b,c){var d=a.get();if(d&&d.passengers.length)for(var e in d.passengers)if(d.passengers[e].inforId==b){d.passengers[e]=c;break}a.setAttr("passengers",d.passengers)},getPassengerById:function(a,b){var c=null,d=b.get();if(d&&d.passengers.length)for(var e in d.passengers)if(d.passengers[e].inforId==a){c=d.passengers[e];break}return c||{}},filterPassengers:function(a){a&&(_.each(a,function(b,c){if("携程客户"==b.cname)return a.splice(c,1),!1;if(!b.language&&1==b.selected){var d="undefined"==typeof b.defaIdCard||!b.defaIdCard||1==b.defaIdCard.type;b.language=d||b.cname||!b.ename?"CN":"EN"}}),this.stores.passengerQueryStore.setAttr("passengers",a))},addPassengerTpl:function(a,b,c,d){this.needDelIcon=d?!0:!1,(!a.get()||c)&&a.set({opr:1,flightType:1,birth:"",biztype:4,cname:"",email:"",ename:"",firstName:"",lastName:"",flag:0,gender:2,idcards:[{opr:1,flag:2,no:"",expiryDate:"2099/1/1",type:1,choose:!0}],inforId:0,mphone:"",fmphone:"",natl:"CN",natlName:"中国大陆",ver:1,defaIdCard:{opr:1,flag:2,no:"",expiryDate:"2099/1/1",type:1,name:"身份证"},ticketType:1,selected:1,edit:!0,empty:!0,language:"CN"}),DataControl.loadPassEditStore();var e=b.get()||{};e.passengers=e.passengers||[];var f=Math.abs(this.parentView.getServerDate().getTime())+Math.round(1e8*Math.random());if(DataControl.PassEditData.inforId=f,a.setAttr("inforId",f),e.passengers.push(DataControl.PassEditData),b.setAttr("passengers",e.passengers,b.getTag()),b.setAttr("flightType","1"),e&&e.passengers){var g=0;for(var h in e.passengers){var i=e.passengers[h];1==+i.selected&&(g+=1)}var j=b.getTag();b.setAttr("selCount",g,j)}this.onInputLogPass()},onInputLogPass:function(b){var c=this,d=!0;this.parentView.$el.find(".js_newName").on("focusout",function(){var a=$(this).parents("li[data-Id]").attr("data-Id");DataControl.PassEditData=c.getPassengerById(a,c.stores.passengerQueryStore),DataControl.PassEditData.cname=$(this).val().replace(/\s/g,""),c.stores.passengerEditStore.setAttr("cname",DataControl.PassEditData.cname),c.setPassengerById(c.stores.passengerQueryStore,a,DataControl.PassEditData);var d=b.validateName(c.parentView,c.parentView.showErrorTips,DataControl.PassEditData.cname,"","",DataControl.PassEditData.defaIdCard.type,!0,a);d&&c.parentView.hideErrorTips('li[data-Id="'+a+'"] .js_newName')}),this.parentView.$el.find(".js_firstName").on("focusout",function(){var a=$(this).parents("li[data-Id]").attr("data-Id"),d="";$(this).val($(this).val().toUpperCase()),DataControl.PassEditData=c.getPassengerById(a,c.stores.passengerQueryStore),DataControl.PassEditData.firstName=$(this).val(),c.stores.passengerEditStore.setAttr("firstName",DataControl.PassEditData.firstName),d=DataControl.PassEditData.firstName||DataControl.PassEditData.lastName?(DataControl.PassEditData.firstName||"")+"/"+(DataControl.PassEditData.lastName||""):"",DataControl.PassEditData.ename=d,c.stores.passengerEditStore.setAttr("ename",d),c.setPassengerById(c.stores.passengerQueryStore,a,DataControl.PassEditData);var e=b.validateFirstName(c.parentView.showErrorTips,DataControl.PassEditData.firstName,!0,a);e&&c.parentView.hideErrorTips('li[data-Id="'+a+'"] .js_firstName')}),this.parentView.$el.find(".js_lastName").on("focusout",function(){var a=$(this).parents("li[data-Id]").attr("data-Id"),d="";$(this).val($(this).val().toUpperCase()),DataControl.PassEditData=c.getPassengerById(a,c.stores.passengerQueryStore),DataControl.PassEditData.lastName=$(this).val(),d=DataControl.PassEditData.firstName||DataControl.PassEditData.lastName?(DataControl.PassEditData.firstName||"")+"/"+(DataControl.PassEditData.lastName||""):"",DataControl.PassEditData.ename=d,c.stores.passengerEditStore.setAttr("ename",d),c.stores.passengerEditStore.setAttr("lastName",DataControl.PassEditData.lastName),c.setPassengerById(c.stores.passengerQueryStore,a,DataControl.PassEditData);var e=b.validateLastName(c.parentView.showErrorTips,DataControl.PassEditData.firstName,DataControl.PassEditData.lastName,a);e&&c.parentView.hideErrorTips('li[data-Id="'+a+'"] .js_lastName')});this.parentView.$el.find(".js_no").on("focusout",function(){var a=$(this).parents("li[data-Id]").attr("data-Id");DataControl.PassEditData=c.getPassengerById(a,c.stores.passengerQueryStore);var e=2==DataControl.PassEditData.defaIdCard.type?$.trim($(this).val()||""):$(this).val().replace(/\s/g,"");c.parentView.$el.find("#sel_idCard option").eq($(this).data("index")).data("no",e),DataControl.PassEditData.idcards[$(this).data("index")].no=e,DataControl.PassEditData.defaIdCard.no=e,c.stores.passengerEditStore.setAttr("idcards",DataControl.PassEditData.idcards),c.stores.passengerEditStore.setAttr("defaIdCard",DataControl.PassEditData.defaIdCard),1==DataControl.PassEditData.defaIdCard.type&&$(this).val(b.formatCardNo(e)),c.setPassengerById(c.stores.passengerQueryStore,a,DataControl.PassEditData);var f=b.checkPassenger(c.parentView,c.parentView.showErrorTips,DataControl.PassEditData,"defaIdCard",a,d),g="#addPassenger li[data-Id='"+a+"'] .js_no";if(f){if(1==DataControl.PassEditData.defaIdCard.type){c.toggleTicketType(b.getBirth(e),g,null,b),DataControl.PassEditData=c.getPassengerById(a,c.stores.passengerQueryStore),DataControl.PassEditData.birth=b.getBirth(e),c.stores.passengerEditStore.setAttr("birth",DataControl.PassEditData.birth),c.setPassengerById(c.stores.passengerQueryStore,a,DataControl.PassEditData);var h=$("#addPassenger > li[data-id='"+a+"'] .js_birth");h.val(b.formatBirth(DataControl.PassEditData.birth)),h.data(key,DataControl.PassEditData.birth)}if(2==DataControl.PassEditData.defaIdCard.type)b.showTip(DataControl.TIPICONS.BLUE,'li[data-id="'+a+'"] .js_no',"请确保姓名、证件号与护照一致",!1);else if(1==DataControl.PassEditData.defaIdCard.type){var i=DataControl.getAge(DataControl.PassEditData.birth),j=DataControl.getPsgType(i),k=2==j?"儿童":"婴儿";if(-1!=DataControl.PassEditData.ticketType){if(c.parentView.hideErrorTips('li[data-Id="'+a+'"] .js_no'),1!=j){var l=c.stores.flightDetailsStore.getAttr("items")[0].policy,m=!l.isApplyChild,n=!l.childPolicy,o=!l.babyPolicy,p="";m||2==j&&n||3==j&&o?(p=m?"该价格不支持"+k+"购买成人票":"该价格不支持购买"+k+"票",b.showTip(DataControl.TIPICONS.BLUE,'li[data-id="'+a+'"] .js_no',p,!1)):c.parentView.hideErrorTips('li[data-Id="'+a+'"] .js_no')}}else b.showTip(DataControl.TIPICONS.RED,'li[data-id="'+a+'"] .js_no',"该价格"+k+"不可订，请选择其他舱位",!1)}else c.parentView.hideErrorTips('li[data-Id="'+a+'"] .js_no')}}),this.parentView.$el.find("input.js_newName,input.js_firstName,input.js_lastName,input.js_no,input.js_birth").unbind("focusin").bind("focusin",this.setCurrentEditPsg.bind(this)),a.ui.InputClear(this.parentView.$el.find('#addPassenger input[type="text"],#addPassenger input[type="tel"],#addPassenger input[type="number"]'),null,null,{top:20,right:0},!0),a.ui.InputClear(this.parentView.$el.find("#addPassenger input.js_firstName,#addPassenger input.js_newName"),null,null,{top:20,right:85},!0)},finishBirthAction:function(a){var c=this,d=$(a.target).parents("li[data-Id]").attr("data-Id");DataControl.PassEditData=c.getPassengerById(d,c.stores.passengerQueryStore);var e=DataControl.getBirth(DataControl.PassEditData);DataControl.PassEditData.birth=$(a.target).data("key")+"",c.stores.passengerEditStore.setAttr("birth",DataControl.PassEditData.birth),c.setPassengerById(c.stores.passengerQueryStore,d,DataControl.PassEditData);var f=b.checkPassenger(c.parentView,c.parentView.showErrorTips,DataControl.PassEditData,"birth",d,!0),g="#addPassenger li[data-Id='"+d+"'] .js_birth";if(f){c.toggleTicketType(DataControl.PassEditData.birth,g,e,b),DataControl.PassEditData=c.getPassengerById(d,c.stores.passengerQueryStore);var h=DataControl.getAge(DataControl.PassEditData.birth),i=DataControl.getPsgType(h),j=2==i?"儿童":"婴儿";if(-1!=DataControl.PassEditData.ticketType){if(c.parentView.hideErrorTips('li[data-Id="'+d+'"] .js_birth'),1!=i){var k=c.stores.flightDetailsStore.getAttr("items")[0].policy,l=!k.isApplyChild,m=!k.childPolicy,n=!k.babyPolicy,o="";l||2==i&&m||3==i&&n?(o=l?"该价格不支持"+j+"购买成人票":"该价格不支持购买"+j+"票",b.showTip(DataControl.TIPICONS.BLUE,'li[data-id="'+d+'"] .js_birth',o,!1)):c.parentView.hideErrorTips('li[data-Id="'+d+'"] .js_birth')}}else b.showTip(DataControl.TIPICONS.RED,'li[data-id="'+d+'"] .js_birth',"该价格"+j+"不可订，请选择其他舱位",!1)}},enameLiveChange:function(a){var b=$(a.currentTarget),c=b.val()||"";c&&/[a-z]/.test(c.substring(0,1))&&b.val(c.toUpperCase())},toggleTicketType:function(a,b,c,d){{var e={ADULT:1,CHILD:2,BABY:3,NEWBORN:4},f=DataControl.getAge(a),g=1,h=DataControl.getPsgType(f),i=this.stores.flightDetailsStore.getAttr("items"),j=(i&&i.length>0?i[0].policy:this.parentView.showAlert(),DataControl.isSupportChild()),k=DataControl.isSupportBaby(),l=this.stores.passengerQueryStore.get(),m=$(b).closest("li[data-id]"),n=m.data("id"),o=m.find(".flight-iptetp"),p=o.data("psgidx"),q=o.find(".flight-iptetp-current");q.length?parseInt(q.data("type")):-1}if(c=d.testBirth(this.parentView.showToast,c)?c:null,c&&(g=DataControl.getPsgType(DataControl.getAge(c))),g!=h||!c)if(h==e.ADULT)o.parent().hide(),$(".flight-tips-etp2").hide(),d.hideTip('li[data-id="'+n+'"] .js_birth'),this.selectTicketType(null,o.find("span:nth-child(1)")[0]);else{if(h===e.CHILD&&!j||h===e.BABY&&!k){var r="该价格"+h===e.CHILD?"儿童":"婴儿不可订，请选择其他舱位";d.showTip(DataControl.TIPICONS.RED,'li[data-id="'+n+'"] .js_birth',r,!1),l.passengers[p].ticketType=-1,o.find("span").each(function(a,b){$(b).removeClass("flight-iptetp-current")}),this.stores.passengerQueryStore.setAttr("passengers",l.passengers),this.updatePassengerInfoHeader(this.stores.flightDetailsStore,this.stores.userStore,this.stores.passengerQueryStore),this.parentView.trigger(this.parentView.EVENTS.UPDATEORDERPRICE)}else{var s=this.getTicketsVisibleStatus(h);this.updateTicketStatus(o,s);var t=this.findLowPriceTicketByPsgType(h);-1!=t&&this.selectTicketType(null,o.find("span:nth-child("+t+")")[0])}this.showWithAdultTip(this.stores.passengerQueryStore)}},getTicketsVisibleStatus:function(a,b){var c=2,d=3,e=this.stores.flightDetailsStore.getAttr("items"),f=e[0].policy,g=!!f.isApplyChild,h=!!f.childPolicy,i=!!f.babyPolicy,j=!(!f.childPolicy||!f.childPolicy.isApply),k=a==d&&i,l=a==d&&j||a==c&&h,m=g&&(k||l),n=[m,l,k];return"undefined"==typeof b?n:n[b-1]},updateTicketStatus:function(a,b){(b[0]||b[1]||b[2])&&a.parent().show(),a.find("span").each(function(a,c){$(c).toggle(b[a])})},setPassengersMDInfo:function(){var a=this,c=a.parentView.showToast,d=this.stores.passengerQueryStore.getAttr("passengers"),e=_.filter(d,function(a){return 1==a.selected}),f=this.stores.mdStore.getAttr("passengers")||{},g=1,h={},i=[];_.each(e,function(d){h=d.defaIdCard||h,g=d.defaIdCard?d.defaIdCard.type:1,d.defaIdCard&&1==g&&(h.birth=b.getBirth(d.defaIdCard.no)),i="undefined"!=typeof d.ename?d.ename.split("/"):["",""],f[d.inforId]=f[d.inforId]||{IsPassengerName:"",PassengerNamePass:"",CredentialsType:"",IsCredentialsNO:"",CredentialsNOPass:""},f[d.inforId].IsPassengerName+=""==f[d.inforId].IsPassengerName?!!d.ename||!!d.cname:","+(!!d.ename||!!d.cname),f[d.inforId].PassengerNamePass+=""==f[d.inforId].PassengerNamePass?b.validateName(a.parentView,c,d.cname,i[0],i[1],g,!1,d.inforId):","+b.validateName(a.parentView,c,d.cname,i[0],name[1],g,!1,d.inforId),f[d.inforId].CredentialsType+=""==f[d.inforId].CredentialsType?DataControl.idCardTypeSort[g].name:","+DataControl.idCardTypeSort[g].name,f[d.inforId].IsCredentialsNO+=""==f[d.inforId].IsCredentialsNO?!(!d.defaIdCard||!d.defaIdCard.no):","+!(!d.defaIdCard||!d.defaIdCard.no),f[d.inforId].CredentialsNOPass+=""==f[d.inforId].CredentialsNOPass?b.validateCard(c,g,h,d.birth,!1):","+b.validateCard(c,g,h,d.birth,!1)}),a.stores.mdStore.setAttr("passengers",f)},hasChildOrBaby:function(a){var c,d="",e={ADULT:1,CHILD:2,BABY:3,NEWBORN:4},f=!1;return $(a).each(function(a,g){1==g.selected&&(d=g.defaIdCard&&1==g.defaIdCard.type&&g.defaIdCard.no?b.getBirth(g.defaIdCard.no)||"":g.birth,d&&(c=DataControl.getPsgType(DataControl.getAge(d)),(c==e.CHILD||c==e.BABY)&&(f=!0)))}),f}};return c}),define("vPassenger",["c","libs","flight/utility/utility","MultipleScrollList","vCorporater1",buildViewTemplatesPath("../modules/bookingInfo/templates/tPassenger.html")],function(a,b,c,d,e,f){var g={ADULT:1,CHILD:2,BABY:3,NEWBORN:4},h=new a.base.Class({__propertys__:function(){this.opts=this.opts||{},this.parentView=null},EVENTS:{hasChildrenOrBaby:"hasChildrenOrBaby"},changeOpts:function(a){this.opts=$.extend(!0,{},a),this.viewPort=this.opts.viewPort,this.parentView=this.opts.parentView,this.stores=this.parentView.stores,this.models=this.parentView.models},setBoxes:function(){this.addPassengerBox=this.viewPort.find("#addPassenger"),this.passengerInfoBox=this.viewPort.find("#passengerInfo"),this.passengerInfoHeader=this.viewPort.find("#passenger-info-header")},setTemplate:function(){this.viewPort.append(f),this.passengerInfoHeaderFun=_.template(this.viewPort.find("#passenger-info-header-tpl").html()),this.addPassengerTplFun=_.template(this.viewPort.find("#addPassenger_tpl").html()),this.passengerInfofun=_.template(this.viewPort.find("#passengerInfotpl").html())},fireEvents:function(){this.parentView.on(this.parentView.EVENTS.DETAILCOMPLETE,this.flightDetailCalback.bind(this)),this.parentView.on(this.parentView.EVENTS.PASSENGERSCOMPLETE,this.passengersCallback.bind(this))},initialize:function(a){this.changeOpts(a),this.setBoxes(),this.setTemplate(),this.fireEvents(),this.needDelIcon=!0},setHtmlPassengerInfo:function(a){var b=this.passengerInfofun(a);this.passengerInfoBox.empty(),this.passengerInfoBox.html(b),this.addPassengerBox.hide(),this.updatePassengerInfoHeader(),this.addEventListener()},setHtmlAddPassenger:function(a){a.needDelIcon=this.getDelIconFlag(a.passengers||[]),a.selCount=this.stores.passengerQueryStore.getAttr("selCount");var b=this.addPassengerTplFun(a);this.addPassengerBox.empty(),this.addPassengerBox.html(b),this.passengerInfoBox.hide(),this.updatePassengerInfoHeader(),this.addEventListener(),this.onInputLogPass(c),$("li[id|=cname-container]").each(function(){$(this).find(".flight-langswt").length>0&&("none"==$(this).find(".flight-langswt").css("display")?$(this).find(".cui-focus-close").css("right","20px"):$(this).find(".cui-focus-close").css("right","85px"))})},addEventListener:function(){$("#js_addPass_btn").unbind("click").bind("click",this.addPassengerAction.bind(this)),$(".js_del_icon").off("touchend").on("touchend",this.deleteEditPassenger.bind(this)),$("#addPassenger .flight-infoinput-pdl .flight-arrdown").unbind("click").bind("click",$.proxy(this.IdCardListAction,this)),$(".flight-iptetp > span").unbind("click").bind("click",this.selectTicketType.bind(this)),$(".flight-tips-etp2 .close").unbind("click").bind("click",this.closeWithAdultTips),$("#passengerInfo .flight-infodel2").unbind("click").bind("click",$.proxy(this.passengerDelete,this)),$("#passengerInfo .flight-listsim3-table ul").unbind("click").bind("click",this.passengerEdit.bind(this)),$("#js_selectPass_btn").unbind("click").bind("click",this.passengerSelect.bind(this)),$(".js_enName").unbind("keyup").bind("keyup",this.enameLiveChange),$(".flight-langswt > em").unbind("click").bind("click",this.switchLanguageAction.bind(this)),$("#addPassenger > li").unbind("click").bind("click",this.setCurrentEditPsg.bind(this)),$("#addPassenger input").unbind("touchstart").bind("touchstart",function(a){var b=a.changedTouches[0].pageY;
$(a.currentTarget).bind("touchend",function(c){Math.abs(b-c.changedTouches[0].pageY)<=20&&($(a.currentTarget).focus(),$(a.currentTarget).unbind("touchend"))})}),$("#addPassenger .js_birth").unbind("click").bind("click",this.selectBirthAction.bind(this))},getDelIconFlag:function(a){var b=_.filter(a,function(a){return 1==a.selected});return 1==b.length&&b[0]&&b[0].defaIdCard&&(this.needDelIcon=1==b[0].defaIdCard.type?!(!b[0].cname&&!b[0].defaIdCard.no):!!(b[0].cname||b[0].firstName||b[0].lastName||b[0].defaIdCard.no||b[0].birth)),this.needDelIcon},flightDetailCalback:function(a,b,c){var d=this.stores.flightDetailsStore.getAttr("items"),e=d[0].policy,f=e.isApplyChild||e.childPolicy,g=e.isApplyChild||e.childPolicy&&e.childPolicy.isApply||e.babyPolicy;if(a=$.extend(!0,a,{policy:e,getAge:DataControl.getAge,generatePriceStr:this.generatePriceStr.bind(this)}),a.supportChild=f,a.supportBaby=g,this.stores.passengerQueryStore.setAttr("firstFlyDate",d[0].basicInfo.dTime),this.stores.passengerQueryStore.setAttr("lastFlyDate",d.length>1?d[1].basicInfo.dTime:d[0].basicInfo.dTime),c.PASSENGERS){{this.stores.passengerQueryStore.get()}DataControl.updatePassengersTicketType(a),a=$.extend(a,{needDelIcon:this.needDelIcon}),c.HASPASSENGER?this.setHtmlPassengerInfo(a):this.setHtmlAddPassenger(a),this.showWithAdultTip(this.stores.passengerQueryStore,a.passengers)}},passengersCallback:function(a,b,c){var d=this;if(this.stores.userStore.isLogin()){if(c.PASSENGERSFAIL)return void this.passengersResponseFailHandler(a,c);var e=this.models.passengerQueryModel.getResultStore();e.setAttr("UserId",this.parentView.UserID,e.getTag());var f=e.get();d.filterPassengers(f.passengers);var g=_.filter(f.passengers,function(a){return 1==a.selected}).length;this.stores.passengerQueryStore.setAttr("selCount",g),f=this.stores.passengerQueryStore.get(),f.passengers&&f.passengers.length?(this.stores.isBookingEditStore.setAttr("Edit",!1,this.parentView.UserID),a=$.extend(!0,a,f),c.PASSENGERS=!0,c.HASPASSENGER=!0,c.DETAIL&&(DataControl.updatePassengersTicketType(a),this.setHtmlPassengerInfo(a),this.showWithAdultTip(this.stores.passengerQueryStore,a.passengers))):(this.stores.isBookingEditStore.setAttr("Edit",!0,this.parentView.UserID),this.stores.flightOrderStore.setAttr("passengersinfo",[]),this.addPassengerTpl(this.stores.passengerEditStore,this.stores.passengerQueryStore,!0)),this.stores.isBookingEditStore.getAttr("Edit",this.parentView.UserID)?(f=this.stores.passengerQueryStore.get(),a=$.extend(!0,a,f),c.PASSENGERS=!0,c.DETAIL&&(DataControl.updatePassengersTicketType(a),a=$.extend(a,{needDelIcon:this.needDelIcon}),this.setHtmlAddPassenger(a),this.showWithAdultTip(this.stores.passengerQueryStore,a.passengers)),this.showAddBtn()):(this.passengerInfoBox.addClass("mb10"),this.parentView.$el.find("#js_addPass_btn").hide())}else{this.stores.passengerQueryStore.setLifeTime("365D");var f=this.stores.passengerQueryStore.get(),g=0;f&&f.passengers&&(d.filterPassengers(f.passengers),g=_.filter(f.passengers,function(a){return 1==a.selected}).length),this.stores.passengerQueryStore.setAttr("selCount",g),(!f||f.UserId)&&(this.stores.passengerQueryStore.remove(),f=this.stores.passengerQueryStore.get()||{}),f.passengers&&g||(this.addPassengerTpl(this.stores.passengerEditStore,this.stores.passengerQueryStore,!0),f=this.stores.passengerQueryStore.get()),a=$.extend(a,f),c.DETAIL&&(DataControl.updatePassengersTicketType(a),this.setHtmlAddPassenger(a),this.showWithAdultTip(this.stores.passengerQueryStore,a.passengers),this.updatePassengerInfoHeader(this.stores.flightDetailsStore,this.stores.userStore,this.stores.passengerQueryStore)),this.showAddBtn()}},passengersResponseFailHandler:function(a,b){var c=this.stores.passengerQueryStore.get();if(this.stores.isBookingEditStore.setAttr("Edit",!0,this.parentView.UserID),c&&c.passengers&&c.passengers.length){var d=_.filter(c.passengers,function(a){return 1==a.selected}).length;this.stores.passengerQueryStore.setAttr("selCount",d)}else this.stores.passengerQueryStore.setAttr("passengers",[]),this.stores.passengerQueryStore.setAttr("selCount",0),this.addPassengerTpl(this.stores.passengerEditStore,this.stores.passengerQueryStore,!0);c=this.stores.passengerQueryStore.get(),a=$.extend(a,c),b.PASSENGERS=!0,b.DETAIL&&(this.setHtmlAddPassenger(a),this.showWithAdultTip(this.stores.passengerQueryStore,a.passengers),DataControl.passegnersTplData=a),this.showAddBtn()},updatePassengerInfoHeader:function(){var a=this.stores,b=a.flightDetailsStore.getAttr("items"),c=b[0].policy,d=c.isApplyChild||c.childPolicy,e=c.isApplyChild||c.childPolicy&&c.childPolicy.isApply||c.babyPolicy,f=a.userStore.isLogin(),g=(a.passengerQueryStore.getAttr("passengers"),f?!a.isBookingEditStore.getAttr("Edit",this.parentView.UserID):!1),h={ticketsCnt:this.getTicketsCount(a.passengerQueryStore),supportChild:d,supportBaby:e,showSelBtn:g},i=this.passengerInfoHeaderFun;this.passengerInfoHeader.html(i(h)),$("#js_selectPass_btn").unbind("click").bind("click",this.passengerSelect.bind(this))},getTicketsCount:function(a,b){var c=a.getAttr("passengers")||[],d=[0,0,0];return _.each(c,function(a){1==a.selected&&d[a.ticketType-1]++}),b?d[d-1]:d},addPassengerAction:function(){var a=this.stores.flightDetailsStore.getAttr("items"),b=a[0].policy.qty;+this.stores.passengerQueryStore.getAttr("selCount")>=b?this.parentView.showAlert("很抱歉，因票量有限，最多只能添加"+b+"名乘机人",!1):(this.addPassengerTpl(this.stores.passengerEditStore,this.stores.passengerQueryStore,!0,!0),this.parentView.updatePage()),this.stores.mdStore.increaseCntByKey("MorePassengerClick")},deleteEditPassenger:function(a){var b=this.parentView,c=(b.showLoading,parseInt(this.stores.passengerQueryStore.getAttr("selCount"))),d=$(a.currentTarget).data("id"),e=function(){DataControl.deletePsgById(d),b.updatePage()};this.watchIsSpace(d)?c>1?this.deletePsgConfirm(e,d):this.clearPassengerInfo(a,d):c>1&&e()},watchIsSpace:function(a){var b=$("#addPassenger > li[data-id='"+a+"']");return"none"==$("#cname-container-"+a).css("display")?!!(b.find(".js_firstName").val()||b.find(".js_lastName").val()||b.find(".js_no").val()||b.find(".js_birth").val()):!(!b.find(".js_newName").val()&&!b.find(".js_no").val())},deletePsgConfirm:function(b,c){var d=this,e=new a.ui.Alert({title:"提示信息",message:"您确定要删除当前乘机人信息吗？",buttons:[{text:"取消",click:function(){this.hide()}},{text:"确定",click:function(){this.hide(),d.parentView.showLoading();try{var a=d.stores.mdStore.getAttr("passengers");a&&a[c]&&delete a[c],d.stores.mdStore.setAttr("passengers",a)}catch(e){console.log("PassengerDelete: 删除相关乘机人的埋点信息异常")}b&&b()}}]});e.show()},clearPassengerInfo:function(a,b){{var c=DataControl.getPsgById(b),d=$(a.currentTarget).closest("li[data-id='"+b+"']");c.ticketType}c&&(c.cname="",c.firstName="",c.lastName="",c.birth="",c.defaIdCard.no="",c.empty=!0,c.ticketType=1,d.find(".flight-iptetp").find("span").each(function(a,b){$(b).removeClass("flight-iptetp-current"),0==a?$(b).addClass("flight-iptetp-current"):""}),this.setPassengerById(this.stores.passengerQueryStore,b,c),d.find(".js_newName").val(""),d.find(".js_firstName").val(""),d.find(".js_lastName").val(""),d.find(".js_no").val(""),d.find(".js_birth").val(""),d.find(".flight-iptetp").parent().hide(),d.find(".flight-ipt-etp3").hide(),$("#flightBox .flight .flight-tips-etp2").hide(),d.find(".form-tips").hide(),d.find(".js_del_icon").remove(),d.addClass("flight-psinfo-fstps"),this.parentView.trigger(this.parentView.EVENTS.UPDATEORDERPRICE),this.updatePassengerInfoHeader())},IdCardListAction:function(b){var d=this,e=this.parentView.stores,f=$(b.currentTarget).attr("data-Id"),g=$(b.currentTarget).closest("li[data-id='"+f+"']");DataControl.PassEditData=this.getPassengerById(f,e.passengerQueryStore);for(var h=$("#sel_idCard-"+f+" option"),i=g.find(".js_no"),j=g.find(".js_birth").closest("li"),k=[],l=0,m=DataControl.PassEditData.idcards,n=0,o=h.length;o>n;n++){var p={},q=$(h[n]);q.attr("selected")&&(l=n),p.key=q.val(),p.val=q.html(),p["data-no"]=m[n]?m[n].no:"",p.inforId=f,k.push(p)}var r=$("#sel_idCard-"+f),s=g.find("label.flight-arrdown"),t=new a.ui.ScrollRadioList({title:"选择证件",index:l,data:k,itemClick:function(a){var b=$.trim(g.find(".js_newName").val()),h=g.find(".js_canme-container"),k=g.find(".js_ename-container"),l=g.find("input.js_no").data("type"),m=h.find(".flight-langswt");DataControl.PassEditData=d.getPassengerById(a.inforId,e.passengerQueryStore),"1"===a.key?(j.hide(),DataControl.PassEditData.cname=b.replace(/\s/g,""),i.val(c.formatCardNo(a["data-no"])),h.show(),k.hide(),m.hide(),h.find(".cui-focus-close").css("right","20px"),DataControl.PassEditData.language="CN",d.setPassengerById(e.passengerQueryStore,a.inforId,DataControl.PassEditData)):(j.show(),i.val(a["data-no"]),m.show(),h.find(".cui-focus-close").css("right","85px")),g.find("input.js_no").data("type",a.key);var n=g.find(".flight-iptetp"),o=n.find("span.flight-iptetp-current");if((25==l||27==l)&&a.key!=l&&DataControl.PassEditData.birth&&c.testBirth(DataControl.PassEditData.birth)){var p=DataControl.getAge(DataControl.PassEditData.birth),q=DataControl.getPsgType(p),t=(o.length?parseInt(o.data("type")):-1,d.findLowPriceTicketByPsgType(q));-1!=t?(d.selectTicketType(null,n.find("span:nth-child("+t+")")[0],!0),n.parent().siblings(".flight-ipt-etp3").hide(),d.parentView.hideErrorTips('li[data-id="'+f+' .js_birth"]'),1!=t?n.parent().show():n.parent().hide()):(n.parent().hide(),n.parent().siblings(".flight-ipt-etp3").show())}e.passengerEditStore.setAttr("cname",DataControl.PassEditData.cname),e.passengerEditStore.setAttr("ename",DataControl.PassEditData.ename),r.val(a.key),s.html(a.val.length>4?a.val.substring(0,4):a.val),i.data("index",a.index),i.focus();for(var u=0;u<DataControl.PassEditData.idcards.length;u++)DataControl.PassEditData.idcards[u].choose=!1;DataControl.PassEditData.idcards[a.index].choose=!0,DataControl.PassEditData.defaIdCard=DataControl.PassEditData.idcards[a.index],d.setPassengerById(e.passengerQueryStore,a.inforId,DataControl.PassEditData),"1"==a.key&&c.validateCard(d.parentView.showErrroTips,1,DataControl.PassEditData.defaIdCard,"",!1)?d.idCardFocusOutHandler(i[0]):i.focus(),d.parentView.hideErrorTips('li[data-id="'+f+'"] .form-tips'),d.handleErrorInfo(DataControl.PassEditData.birth)}});t.show()},handleErrorInfo:function(a){var b=this,d=DataControl.getAge(a),e=DataControl.getPsgType(d),f=2==e?"儿童":"婴儿",g=DataControl.PassEditData.inforId;-1==DataControl.PassEditData.ticketType&&(b.parentView.hideErrorTips('li[data-Id="'+g+'"] .js_no'),1!=e&&c.showTip(DataControl.TIPICONS.RED,'li[data-id="'+g+'"] .js_birth',"该价格"+f+"不可订，请选择其他舱位",!1))},idCardFocusOutHandler:function(a){var b=$(a).closest("li[data-Id]").attr("data-Id"),d=$(a).val().replace(/\s/g,""),e=!0;if(DataControl.PassEditData=this.getPassengerById(b,this.stores.passengerQueryStore),this.parentView.$el.find("#sel_idCard-"+b+" option").eq($(a).data("index")).data("no",d),DataControl.PassEditData.idcards[$(a).data("index")].no=d,DataControl.PassEditData.defaIdCard.no=d,this.stores.passengerEditStore.setAttr("idcards",DataControl.PassEditData.idcards),this.stores.passengerEditStore.setAttr("defaIdCard",DataControl.PassEditData.defaIdCard),1==DataControl.PassEditData.defaIdCard.type){var d=$(a).val().replace(/\s/g,"");$(a).val(c.formatCardNo(d))}this.setPassengerById(this.stores.passengerQueryStore,b,DataControl.PassEditData);var f=c.checkPassenger(this.parentView,this.parentView.showErrorTips,DataControl.PassEditData,"defaIdCard",b,e),g="#addPassenger > li[data-Id='"+b+"'] .js_no";f&&1==DataControl.PassEditData.defaIdCard.type&&(this.toggleTicketType(c.getBirth(d),g,null,c),DataControl.PassEditData.birth=c.getBirth(d),this.stores.passengerEditStore.setAttr("birth",DataControl.PassEditData.birth),this.setPassengerById(this.stores.passengerQueryStore,b,DataControl.PassEditData),$("#addPassenger li[data-id='"+b+"'] .js_birth").val(DataControl.PassEditData.birth))},switchLanguageAction:function(a){var b=$(a.currentTarget).data("lan"),c=$(a.currentTarget).closest("li[data-id]"),d=c.data("id"),e=c.find(".js_canme-container"),f=c.find(".js_ename-container"),g=this.getPassengerById(d,this.stores.passengerQueryStore),h=g.defaIdCard&&1==g.defaIdCard.type?!0:!1;h||$(a.currentTarget).hasClass("flight-langswt-selected")||("CN"==b?(e.show(),f.hide()):(e.hide(),f.show())),h?(e.find(".flight-langswt").hide(),e.find(".cui-focus-close").css("right","20px")):(e.find(".flight-langswt").show(),e.find(".cui-focus-close").css("right","85px")),DataControl.PassEditData=this.getPassengerById(d,this.stores.passengerQueryStore),DataControl.PassEditData.language=b,this.setPassengerById(this.stores.passengerQueryStore,d,DataControl.PassEditData)},setCurrentEditPsg:function(a){try{$(a.currentTarget).data("id")?($(a.currentTarget).siblings("li").find(".flight-psinfo-no").removeClass("flight-psinfo-no-current"),$(a.currentTarget).find(".flight-psinfo-no").addClass("flight-psinfo-no-current")):($(a.target).closest("li[data-id]").siblings("li").find(".flight-psinfo-no").removeClass("flight-psinfo-no-current"),$(a.target).closest("li[data-id]").find(".flight-psinfo-no").addClass("flight-psinfo-no-current"))}catch(a){console.log("Dom has been delete!!!")}},selectTicketType:function(a,b){var c=$(b?b:a.currentTarget),d=this.stores.passengerQueryStore.get()||{},e=d.passengers||[],f=parseInt(c.parent().data("psgidx")),g=parseInt(c.data("type"));if(!c.hasClass("flight-iptetp-current")){c.siblings("span").removeClass("flight-iptetp-current"),e[f].ticketType=g,this.setPassengerById(this.stores.passengerQueryStore,e[f].inforId,e[f]),e[f].edit&&(DataControl.PassEditData.ticketType=e[f].ticketType,this.stores.passengerEditStore.setAttr("ticketType",g)),c.addClass("flight-iptetp-current"),this.showWithAdultTip(this.stores.passengerQueryStore,e),this.updatePassengerInfoHeader(this.stores.flightDetailsStore,this.stores.userStore,this.stores.passengerQueryStore),this.parentView.trigger(this.parentView.EVENTS.UPDATEORDERPRICE);var h=this.stores.flightDetailsStore.get();this.parentView.i_QueryCustomerCoupon(h)}},selectBirthAction:function(a){var b=this,e=$(a.currentTarget),f=e.data("key")+"",g=/^(19[0-9]{2}|20[01]{1}\d{1})(0[1-9]{1}|1[0-2]{1})(0[1-9]{1}|[12]\d{1}|3[01]{1})$/.test(f),h=(e.closest("li[data-id]").data("id"),(new Date).getFullYear()),i=g?+f.substring(0,4)-(h-80):1980-(h-80),j=g?+f.substring(4,6)-1:0,k=g?+f.substring(6,8)-1:0,l=c.getDateItems(),m=function(a){var b=+a.key,d=+o.getItemByIndex(1).key,e=+o.getItemByIndex(2).key,f=c.getDayItem(b,d),g=e<=f.length?e-1:f.length-1;2==d&&o.updateScrollListByIndex(2,f,g)},n=function(a){var b=+o.getItemByIndex(0).key,d=+a.key,e=+o.getItemByIndex(2).key,f=c.getDayItem(b,d),g=e<=f.length?e-1:f.length-1;o.updateScrollListByIndex(2,f,g)},o=new d({title:"选择出生日期",data:l,index:[i,j,k],changed:[m,n,null],disItemNum:4,cancel:"取消",ok:"确定",className:"flight-date-box",okClick:function(c){e.val(c[0].name+c[1].name+c[2].name),e.data("key",c[0].key+c[1].key+c[2].key),b.finishBirthAction(a)}.bind(this)});o.show()},closeWithAdultTips:function(){$(".flight-tips-etp2").addClass("close_animate"),document.querySelector(".flight-tips-etp2").addEventListener("webkitAnimationEnd",function(){$(".close_animate").hide()},!1)},passengerDelete:function(b){var c=this,d=this.parentView.stores,e=d.passengerQueryStore.get(),f=$(b.currentTarget),g=f.attr("data-id"),h=f.attr("data-index");if(!g||!e||!h||0>+h)return void this.parentView.showAlert();var i=($.grep(e.passengers,function(a){return"1"==a.selected}),new a.ui.Alert({title:"提示信息",message:"您确定要删除该乘机人吗？",buttons:[{text:"取消",click:function(){this.hide()}},{text:"确定",click:function(){this.hide(),c.parentView.showLoading();try{var a=d.mdStore.getAttr("passengers");a[g]&&delete a[g],d.mdStore.setAttr("passengers",a)}catch(b){}var f=e.passengers[h];f&&f.inforId==g&&(f.selected=0,e.selCount-=1),DataControl.updatePassengersTicketType(e);var i=d.passengerQueryStore.getTag();DataControl.updatePassengersTicketType(e),d.passengerQueryStore.set(e,i),c.parentView.updatePage(function(){c.parentView.hideLoading()})}}]}));i.show()},passengerEdit:function(a){var b=this.stores,c=$(a.currentTarget),d=c.data("id"),e=c.attr("data-index");if(!d||0>=+d)return void this.parentView.showToast("请选择您要修改的乘机人。");var f=b.passengerQueryStore.get();if(!f||!f.passengers||+f.selCount<=0)return void this.parentView.showToast("请选择您要修改的乘机人。");this.parentView.showLoading();var g=f.passengers[e],h=b.passengerEditStore.getTag(),i=b.flightDetailsStore.getAttr("items")[0].policy;b.passengerEditStore.set(g,h),b.passengerEditStore.setAttr("backurl",null),b.passengerEditStore.setAttr("opr",4),b.passPageTypeStore.setAttr("type",1),b.passPageTypeStore.setAttr("passengerType",DataControl.getPsgType(null,g)),b.passPageTypeStore.setAttr("hasChildTicket",!!i.childPolicy),b.passPageTypeStore.setAttr("hasBabyTicket",!!i.babyPolicy),b.passPageTypeStore.setAttr("babyCanBuyChildTicket",!(!i.childPolicy||!i.childPolicy.isApply)),g.ticketType=-1,b.passengerEditStore.setAttr("ticketType",-1),this.setPassengerById(b.passengerQueryStore,g.inforId,g);var j=b.flightDetailsStore.getAttr("items");b.passPageTypeStore.setAttr("firstFlyDate",j.length>1?j[1].basicInfo.dTime:j[0].basicInfo.dTime),this.parentView.jump("/webapp/fpage/index.html#passengerEdit!"+$(a.currentTarget).attr("data-id"))},passengerSelect:function(a){var b=this.stores,c=b.flightDetailsStore.get();if(!c)return void this.parentView.showAlert();b.passPageTypeStore.setAttr("type",1),b.passPageTypeStore.setAttr("passengerType",1);var d=b.flightDetailsStore.getAttr("items");b.passPageTypeStore.setAttr("firstFlyDate",d.length>1?d[1].basicInfo.dTime:d[0].basicInfo.dTime),this.parentView.$el.find(".js_newName").off("focusout"),this.parentView.jump("/webapp/fpage/#passengerSelect!"+$(a.currentTarget).attr("data-id"))},findLowPriceTicketByPsgType:function(a){var b=this.parentView.stores,c=b.flightDetailsStore.getAttr("items"),d=c[0].policy,e=1,f=2,g=3,h=DataControl.getTicketAmtByType(e),i=DataControl.getTicketAmtByType(f),j=DataControl.getTicketAmtByType(g);return a==f?d.childPolicy?h>i?f:d.isApplyChild?e:f:d.isApplyChild?e:-1:a==g?d.babyPolicy?d.isApplyChild?d.childPolicy&&d.childPolicy.isApply?h>j?j>i?f:g:h>i?f:e:h>j?g:e:d.childPolicy&&d.childPolicy.isApply?i>j?g:f:g:d.isApplyChild?d.childPolicy&&d.childPolicy.isApply&&h>i?f:e:d.childPolicy&&d.childPolicy.isApply?f:-1:e},generatePriceStr:function(a){var b=this.stores.flightDetailsStore.getAttr("items"),c=0,d=0,e=0;return b.forEach(function(b){a?(c+=b.policy[a]?b.policy[a].price:0,d+=b.policy[a]?b.policy[a].tax:0,e+=b.policy[a]?b.policy[a].fuelCost:0):(c+=b.policy.price,d+=b.policy.tax,e+=b.policy.fuelCost)}),"¥"+(c+d+e)},showAddBtn:function(){var a=this.parentView.stores,b=a.passengerQueryStore.get();b&&b.selCount>=9?($("#js_addPass_btn").hasClass("js_hide")||$("#js_addPass_btn").addClass("js_hide"),$("#WaringMessage").hasClass("js_hide")&&$("#WaringMessage").removeClass("js_hide")):($("#js_addPass_btn").hasClass("js_hide")&&$("#js_addPass_btn").removeClass("js_hide"),$("#WaringMessage").hasClass("js_hide")||$("#WaringMessage").addClass("js_hide"))},showWithAdultTip:function(a,b){b=b||a.get().passengers,this.hasAdultWith(b)?$(".flight-tips-etp2").hide():$(".flight-tips-etp2").show().removeClass("close_animate")},hasAdultWith:function(a){var b=!1,c=!1,d={ADULT:1,CHILD:2,BABY:3,NEWBORN:4};return a=a||[],$(a).each(function(a,e){if(1==e.selected){if(e.ticketType==d.ADULT)return b=!0,!1;(e.ticketType==d.CHILD||e.ticketType==d.BABY)&&(c=!0)}}),b||!c},isNull:function(a){return"object"==typeof a&&void 0==a},i_hasChildrenOrBaby:function(){var a=this.stores.flightDetailsStore.get(),b=!1,c=this;return $(a.items).each(function(a,d){var e=d.policy.babyPolicy,f=d.policy.childPolicy;c.isNull(e)&&c.isNull(f)&&(b=!0)}),b},beforePayValidate:function(){var a=this,b=this.stores,d=b.passengerQueryStore.get(),e=!(b.userStore.isLogin()&&!b.isBookingEditStore.getAttr("Edit",this.parentView.UserID)),f=[],h=[],i=0,j=g.ADULT,k={1:0,2:0,3:0},l=b.flightDetailsStore.getAttr("items")||[],m=0,n=!0,o=d.passengers||[];return $.each(o,function(b,d){if(h=[],1==+d.selected){i+=1;var g=e?c.checkPassenger(a.parentView,a.parentView.showErrorTips,d,"cname",d.inforId,n):!0;if(g||h.push({className:DataControl.errorType,errorMessage:DataControl.errorMessage}),g=e?c.checkPassenger(a.parentView,a.parentView.showErrorTips,d,"defaIdCard",d.inforId,n):!0,g||h.push({className:DataControl.errorType,errorMessage:DataControl.errorMessage}),1!=+d.defaIdCard.type)g=e?c.checkPassenger(a.parentView,a.parentView.showErrorTips,d,"defaIdCard",d.inforId,n):!0,g||h.push({className:DataControl.errorType,errorMessage:DataControl.errorMessage}),g=e?c.checkPassenger(a.parentView,a.parentView.showErrorTips,d,"birth",d.inforId,n):!0,g||h.push({className:DataControl.errorType,errorMessage:DataControl.errorMessage}),g&&(m=DataControl.getAge(d.birth),25==d.defaIdCard.type&&m>=16&&(DataControl.errorType=".js_birth",DataControl.errorMessage="年龄已满16周岁，不能使用户口簿",h.push({className:DataControl.errorType,errorMessage:DataControl.errorMessage}),g=!1),27==d.defaIdCard.type&&m>=12&&(DataControl.errorType=".js_birth",DataControl.errorMessage="年龄已满12周岁，不能使用出生证明",h.push({className:DataControl.errorType,errorMessage:DataControl.errorMessage}),g=!1),l.length>1&&!a.validateSecondFlyTicketType(d,h)&&(g=!1),a.validateAllowChildBuy(d,h)||(g=!1),g&&(j=d.ticketType>0?d.ticketType:1,k[j]++));else{var g=e?c.checkPassenger(a.parentView,a.parentView.showErrorTips,d,"defaIdCard",d.inforId,n):!0;g?(l.length>1&&!a.validateSecondFlyTicketType(d,h)&&(g=!1),a.validateAllowChildBuy(d,h)||(g=!1),g&&(j=d.ticketType>0?d.ticketType:1,k[j]++)):h.push({className:DataControl.errorType,errorMessage:DataControl.errorMessage})}}h.length&&f.push({errorInforId:d.inforId,errorInfo:h})}),f.length?($.each(f,function(b,c){$.each(c.errorInfo,function(b,d){a.parentView.showErrorTips(d.className,d.errorMessage,c.errorInforId,!1)})}),!a.stores.userStore.isLogin()||a.stores.userStore.isLogin()&&a.stores.isBookingEditStore.getAttr("Edit",a.parentView.UserID)?a.parentView.showErrorTips(f[0].errorInfo[0].className,f[0].errorInfo[0].errorMessage,f[0].errorInforId,!0):c.showTip(DataControl.tipIconType||DataControl.TIPICONS.RED,'li[data-id="'+f[0].errorInforId+'"] .flight-listsim3-table',f[0].errorInfo[0].errorMessage,!0),!1):0>=i?(a.parentView.showAlert("请选择乘机人",!1),!1):k[g.CHILD]&&k[g.BABY]?(a.parentView.showAlert("儿童票和婴儿票请分2张订单提交",!1),!1):k[g.BABY]>k[g.ADULT]?(a.parentView.showAlert("一位成人只能带一位婴儿，请继续添加成人乘客",!1),!1):i>9?(a.parentView.showAlert("最多选择9位乘机人",!1),void a.stores.mdStore.increaseCntByKey("NextStepNotPassClick")):!0},validateSecondFlyTicketType:function(a){var b=1!=a.defaIdCard.type?a.birth:c.getBirth(a.defaIdCard.no),d=DataControl.getPsgType(DataControl.getAge(b));if(d!==g.ADULT&&a.ticketType&&1!==a.ticketType&&d!==DataControl.getPsgType(DataControl.getAge(b,!1))){if(d===g.CHILD&&2===a.ticketType)return that.parentView.showAlert("【"+(a.cname||a.ename)+"】第二程起飞当日已满12岁，不能购买儿童票。如仍需购买儿童票，两程须分开预订，或可拨打携程客服电话预订400-008-6666。",!1),!1;if(d===g.BABY&&3===a.ticketType)return this.parentView.showAlert("【"+(a.cname||a.ename)+"】第二程起飞当日已满2岁，不能许购买婴儿票。如仍需购买婴儿票，两程须分开预订，或可拨打携程客服电话预订400-008-6666。",!1),!1}return!0},validateAllowChildBuy:function(a,b){var d=this.stores,e=1,f=1!=a.defaIdCard.type?a.birth:c.getBirth(a.defaIdCard.no);if(f&&(e=DataControl.getPsgType(DataControl.getAge(f))),e===g.CHILD||e===g.BABY){var h=d.flightDetailsStore.getAttr("items"),i=a.ticketType?a.ticketType:1,j=h[0].policy.isApplyChild,k=!!h[0].policy.childPolicy,l=!!h[0].policy.babyPolicy,m=!1;if(1===i?m=!j:2===i?m=e===g.CHILD?!k:!k||k&&!h[0].policy.childPolicy.isApply:3===i?m=e===g.CHILD||e===g.BABY&&!l:-1==i&&(m=!0),m)return DataControl.errorType=1==a.defaIdCard.type?".js_no":".js_birth",DataControl.errorMessage="该价格"+(e===g.CHILD?"儿童":"婴儿")+"不可订，请选择其他舱位",b.push({className:DataControl.errorType,errorMessage:DataControl.errorMessage}),!1}return!0},checkSupportCards:function(a,b,c){var d=function(a,b){var c=[];return a.forEach(function(a){b.forEach(function(b){a==b&&c.push(b)})}),c},e=[],f=[],g=[],h=[],i=["1","2","8","7","4","10","21","20","11","99"],j=[],k=c.idCardsDict();if(a.get()&&a.get().items&&(e=a.get().items),b.get()&&b.get().passengers&&(f=b.get().passengers),e.forEach(function(a){""!=a.policy.cardTypes&&g.push(a.policy.cardTypes.split(","))}),g.length>0){if(h=g[0],g.forEach(function(a){h=d(h,a)}),0==h.length)return this.parentView.showAlert("证件不符合航班需求，请重新选择航班",!1),!1;for(var l in h)for(var m in k)k[m].type.toString()==h[l]&&j.push(k[m].name);h.forEach(function(a){for(var b=0;b<i.length;b++)i[b]==a&&(i.splice(b,1),b--)});for(var n in f){var o=f[n];if(1==+o.selected){var p=o.defaIdCard.type;for(var q in i)if(p==i[q])return this.parentView.showAlert("您选择的航班只能使用"+j.join(",")+"进行预订，请修改乘机人的证件",!1),!1}}return!0}return!0},checkMinPassenger:function(a,b){var c=[],d=[],e=0,f=0;if(a.get()&&a.get().items&&(d=a.get().items),b.get()&&b.get().passengers&&(c=b.get().passengers),0==d.length)return this.parentView.showAlert(),!1;e=d.reduce(function(a,b){var c=b.policy.minNum;return c>a?c:a},d[0].policy.minNum);for(var g in c){var h=c[g];1==+h.selected&&f++}this.parentView.$el.find("#paybtn em.fs").data("amt");return f>=e?!0:(this.parentView.showAlert("本航班至少需要选择"+e+"位成人票乘客才能下单，您也可以选择其他舱位预订",!1),!1)},savePassengers:function(){var b=0,d=0,e=[],f=this.stores.passengerQueryStore.get(),g=this.models.passengerEditModel,h=this.stores.flightOrderStore.getAttr("passengersinfo")||[];for(var i in f.passengers){var j=f.passengers[i];if(1==+j.selected){var k=null;if(b++,d+=1==j.ticketType?1:0,k=1==+j.defaIdCard.type?a.base.Date.parse(c.getBirth(j.defaIdCard.no)).format("Y-m-d"):a.base.Date.parse(j.birth).format("Y-m-d"),h&&!this.hasExistPassenger(h,j)){if(this.stores.userStore.isLogin()){var l=$.extend({},j);l.birth=k,this.stores.isBookingEditStore.getAttr("Edit",this.parentView.UserID)&&(g.setParam("opr",l.opr),g.setParam("birth",l.birth),g.setParam("biztype",l.biztype),g.setParam("cname",l.cname),g.setParam("email",l.email),g.setParam("ename",l.ename||l.firstName+"/"+l.lastName),g.setParam("flag",l.flag),g.setParam("gender",l.gender),g.setParam("idcards",l.idcards),g.setParam("mphone",l.mphone),g.setParam("fmphone",l.fmphone),g.setParam("natl",l.natl),g.setParam("ver",l.ver),g.setParam("defaIdCard",l.defaIdCard),g.setParam("natlName",l.natlName),g.setParam("flightType",l.flightType),g.excute(function(a){l.inforId=a.inforId,h.push(l)},function(a){console.log("Save passenger failed",l,a)},!0,this))}e.push({id:j.inforId,name:this.getCardName(j),birth:k,passportNo:j.defaIdCard.no,passportType:j.defaIdCard.type,phone:j.mphone?j.mphone:"",gender:j.gender,natl:j.natl})}}}return{pcount:b,adultTicketCnt:d,passengers:e}},getCardName:function(a){return 1==a.defaIdCard.type?a.cname:"CN"==a.language?a.cname:a.ename||a.firstName+"/"+a.lastName},hasExistPassenger:function(a,b){var c=!1;return $.each(a,function(a,d){return d.inforId==b.inforId?(c=!0,!1):void 0}),c}});return h=a.base.implement(h,e)}),define("vVouchersCorporater",["c"],function(a){var b=a.base,c={QueryInvoiceInfoData:function(a,b,c,d,e,f,g){if(null!=a.getAttr("InvoiceTitle"))e.title=a.getAttr("InvoiceTitle"),a.remove();else if(null!=b.getAttr(f)){var h=b.getAttr(f);e.title=h.title}else if(null!=c.getAttr("iinfo")&&c.getAttr("iinfo").title)e.title=c.getAttr("iinfo").title;else{for(var i=d.get()&&d.get().passengers?d.get().passengers:[],j=[],k=0;k<i.length;k++){var l=i[k];if(1==+l.selected){j.push(l);break}}e.title=j.length>0?j[0].language?"EN"==j[0].language?j[0].ename:j[0].cname:1==j[0].defaIdCard.type?j[0].cname:j[0].ename:""}var m=b.getAttr("invoiceinfo",f);return m?(e.inname=m.inname,e.intype=m.intype,e.len=m.len):(m=g.getAttr("invoiceinfo"),e.inname=m[0].inname,e.intype=m[0].intype,e.len=m.len,this.stores.flightOrderInfoInviceStore.setAttr("invoiceinfo",{intype:m[0].intype,inname:m[0].inname,len:m.length},f)),e},reimbursementAction:function(c){{var d=this.stores.flightDeliveryStore,e=this.stores.userStore,f=this.stores.flightDetailsStore,g=this.stores.flightOrderStore,h=this.stores.postAddressStorage,i=this.stores.mdStore,j=this.stores.flightSearchStore,k=this.stores.addrListStore,l=this.stores.selAddrStore,m=this.stores.zqInAirportSelectStore,n=this.stores.selFlightInfoStore,o=this.stores.airportDeliveryStore,p=this.stores.invoiceTitleStore,q=this.stores.passengerQueryStore,r=this.stores.flightOrderInfoInviceStore,s=this.parentView.models.addrListModel,t=this.parentView,u=t.$el.find("#invoice_switch"),v=t.$el.find("#js_address_box"),d=t.stores.flightDeliveryStore,w=d.get(this.UserID)||{type:1},x=d.getAttr("paytype"),y=this.deltabfun,z=this.delzqfun,A=this.delmailfun_1;(function(a,b,d,e,f,g,h,i,j,k,l,m,n,o,s,t,v,y,B){if(t.DelItemsData){if(t.DelItemsData.length<=0)return t.showToast("该航班不支持报销凭证配送"),u.find(".cui-switch").removeClass("current"),u.find(".cui-switch-bg").removeClass("current"),void b.addClass("clahead");{d.getAttr("deliveryInfo")}if(c.getStatus())if("16"==u.data("type")||"16"==w.type)b.removeClass("clahead"),d.setAttr("type",16,t.UserID),t.$el.find(".js_del_tab").html(a({type:16,len:t.DelItemsData.length})),t.$el.find(".js_del_box").html(z()),i.setAttr("IsNeedSegment",!0),i.setAttr("IsDeliveryType",!0),t.vVouchers.updateZqAir(t,B),t.vVouchers.updateInvoiceBox(p,q,r,e,f,g,t);else if("2"==u.data("type")||"2"==w.type){var C=h.get(t.UserID);b.removeClass("clahead"),d.setAttr("type",2,t.UserID),h.setAttr("edit",1,t.UserID),t.$el.find(".js_del_tab").html(a({type:2,len:t.DelItemsData.length})),t.$el.find(".js_del_box").html(A(C)),this.updateAddrList(h,e,k,d,l,s),t.vVouchers.updateInvoiceBox(p,q,r,e,f,g,t)}else{var C=h.get(t.UserID),D=t.DelItemsData[0];if(b.removeClass("clahead"),d.setAttr("type",D.type,t.UserID),h.setAttr("edit",1,t.UserID),t.$el.find(".js_del_tab").html(this.deltabfun({type:D.type,len:t.DelItemsData.length})),t.$el.find(".js_del_box").html(A(C)),32==D.type){if($(".js_del_cost .flight-listsim3").show(),$("#gift-card-tips").show(),D.exinfo){d.setAttr("type",D.type,t.UserID),d.setAttr("deliveryInfo",{type:D.type,sendFee:D.exinfo.fee,fee:D.exinfo.fee},t.UserID);var E=_.filter(D.exinfo.pays,function(a){return a.paytype==x}).length;E||(x=t.getPayType(D.exinfo.pays),d.setAttr("paytype",x,t.UserID)),this.parentView.trigger(this.parentView.EVENTS.UPDATEORDERPRICE),d.setAttr("pays",D.exinfo.pays,t.UserID),w=d.get(t.UserID),w.islogin=e.isLogin(),w.fee=D.exinfo.fee,w.isLogin=e.isLogin(),t.$el.find(".js_del_cost").html(this.delcostfun(w))}}else $(".js_del_cost .flight-listsim3").hide(),$("#gift-card-tips").hide();this.updateAddrList(h,e,k,d,l,s),t.vVouchers.updateInvoiceBox(p,q,r,e,f,g,t)}else b.addClass("clahead"),$("#gift-card-tips").hide(),d.setAttr("type",1,t.UserID),h.setAttr("edit",0,t.UserID),this.parentView.trigger(this.parentView.EVENTS.UPDATEORDERPRICE),t.$el.find('.error-tips[data-role="delivery"]').hide();v.ui.InputClear(t.$el.find('.flight-listsim3-table input[type="text"],.flight-listsim3-table input[type="tel"]'),null,null,{top:20,right:-25},!0),$("#js_invoice_title").next(".cui-focus-close").detach(),i.setAttr("IsNeedSegment",!0),i.setAttr("IsDeliveryType",!0)}}).call(this,y,v,d,e,f,g,h,i,j,k,l,m,n,o,s,t,a,b,this.Calendar)}},updateZqAir:function(c,d){var e=this.stores,f=e.flightSearchStore,g=e.flightDetailsStore,h=e.zqInAirportSelectStore,i=e.selFlightInfoStore,j=e.airportDeliveryStore;if(c.zqTimeObj=c.zqTimeObj||{},c.DelItemsData&&c.DelItemsData.length>0){for(var k=null,l=0;l<c.DelItemsData.length;l++)16===c.DelItemsData[l].type&&(k=c.DelItemsData[l].addrs);{var m=f.getSearchDetails(0,"dCtyCode"),n=f.getSearchDetails(0,"aCtyCode"),o=g.get(),p=h.get()?h.get().index:1,q=0;i.get()}if(c.citykey=m+n,!k)return;if(_.each(k,function(a,b){a.index==p&&(q=b)}),k&&k[q]){var r=$.trim(k[q].btime),s=$.trim(k[q].etime);c.zqTimeObj.dutyBtime=a.base.Date.parse(c.getServerDate().setHours(r.slice(0,2),r.slice(2),0,0)),c.zqTimeObj.dutyEtime=a.base.Date.parse(c.getServerDate().setHours(s.slice(0,2),s.slice(2),0,0)),c.zqTimeObj.serverDate=a.base.Date.parse(c.getServerDate().toString()).addHours(2).valueOf(),c.zqTimeObj.airDate=a.base.Date.parse(o.items[0].basicInfo.dTime).addHours(-2).valueOf(),c.zqTimeObj.validDate=this.zqParseDate(b,c.zqTimeObj.serverDate,c.zqTimeObj.airDate,c.zqTimeObj.dutyBtime,c.zqTimeObj.dutyEtime),c.zqTimeObj.defaDate=c.zqTimeObj.validDate.length>0&&c.zqTimeObj.validDate[c.zqTimeObj.validDate.length-1][1];
var t="00",u="00";if(j.getAttr("time")?(c.zqTimeObj.selectDate=a.base.Date.parse(j.getAttr("time")).valueOf(),t=c.zqTimeObj.selectDate.getMinutes().toString(),u=c.zqTimeObj.selectDate.getHours().toString()):c.zqTimeObj.selectDate=c.zqTimeObj.defaDate,c.zqTimeObj.defaHourList=c.zqPrintDetail(c.zqTimeObj.validDate,c.zqTimeObj.selectDate),c.zqTimeObj.defaHourList&&c.zqTimeObj.defaHourList.length>0){var v=(u.length<2?"0"+u:u)+":"+(t.length<2?"0"+t:t);(!j.getAttr("time")||c.zqTimeObj.defaHourList.indexOf(v)<0)&&(c.zqTimeObj.defaHour=c.zqTimeObj.defaHourList[c.zqTimeObj.defaHourList.length-1],c.zqTimeObj.selectDate.setHours(c.zqTimeObj.defaHour.slice(0,2),c.zqTimeObj.defaHour.slice(3)))}var w=(o&&o.insurances&&o.insurances.length>0&&o.insurances[0]&&o.insurances[0].sites&&o.insurances[0].sites.indexOf(k[q].site)>=0,j.get(c.citykey)||{});for(var x in k[q])w[x]=k[q][x];w.time=c.zqTimeObj.selectDate.toString(),j.set(w,c.citykey),w.cDate=a.base.Date,c.$el.find(".js_del_box").html(this.delzqfun(w))}c.showCalendarUI(j,d,c)}},updateAddrList:function(){var a=this.stores,b=a.postAddressStorage,c=a.userStore,d=a.addrListStore,e=a.flightDeliveryStore,f=a.selAddrStore,g=this.models.addrListModel;c.isLogin()?g.excute(function(){d.setAttr("UserId",this.UserID,d.getTag()),this.renderDelBox(b,c,d,e,f)},function(){this.renderDelBox(b,c,d,e,f)},!0,this):this.renderDelBox(b,c,d,e,f)},renderDelBox:function(a,b,c,d,e,f){var g=this,h=this.delmailfun_2,i=a.get(this.parentView.uid);i.clazz=0==i.inforId?"m_colorb":"";var j=c.get();if(!b.isLogin()&&j&&j.UserId&&(c.remove(),j=c.get()),j&&j.addrs&&j.addrs.length>0){var k=j.addrs.some(function(a){return a.inforId==i.inforId||0==i.inforId});if(!k){i.prvnName="",i.ctyName="",i.dstrName="",i.addr="",i.recipient="",i.zip="",a.remove();var l=d.get(),m=d.getAttr("deliveryInfo");1==l.rc&&(l.rc=0,l.paytype=f.getPayType(),d.setAttr("paytype",l.paytype),l.fee=m.sendFee,f.$el.find(".js_del_cost").html(f.delcostfun(l)),g.parentView.trigger(g.parentView.EVENTS.UPDATEORDERPRICE))}this.$el.find(".js_del_box").html(h(i))}else{var n=e.get(this.parentView.uid);n.prvnName&&n.ctyName&&n.dstrName&&(i.prvnId=n.prvnId,i.prvnName=n.prvnName,i.ctyId=n.ctyId,i.ctyName=n.ctyName,i.dstrId=n.dstrId,i.dstrName=n.dstrName),a.set(i,this.parentView.uid),this.$el.find(".js_del_box").html(h(i))}},onInputLogAddr:function(a,b,c){var d=a.isLogin()?c.UserID:"";this.$el.find(".js_recipient").on("input",function(){var a=$.trim($(this).val());b.setAttr("recipient",a,d)}),this.$el.find(".js_addr").on("input",function(){var a=$.trim($(this).val());b.setAttr("addr",a,d)}),this.$el.find(".js_zip").on("input",function(){var a=$.trim($(this).val());b.setAttr("zip",a,d)})},zqParseDate:function(a,b,c,d,e){var f=b.getTime(),g=c.getTime(),h=d.getHours(),i=e.getHours(),j=d.getMinutes(),k=d.getMinutes(),l=b.getMonth()+1,m=c.getMonth()+1,n=b.getDate(),o=c.getDate(),p=b.getFullYear(),q=c.getFullYear(),r=[],s=new a.Date.parse(p+"-"+l+"-"+n+" "+h+":"+j),t=new a.Date.parse(p+"-"+l+"-"+n+" "+i+":"+k),u=s.getTime(),v=t.getTime();if(l==m&&n==o&&p==q){if(u>f&&g>v)return r.push([new Date(s),new Date(t)]),r;if(f>u&&v>f&&g>v)return r.push([b,t]),r;if(f>u&&v>f&&v>g)return r.push([b,c]),r;if(u>f&&v>g&&g>u)return r.push([d,c]),r;if(f>v&&g>v||u>f&&u>f||u>f&&u>g)return r}else{for(var w=new a.Date.parse(q+"-"+m+"-"+o+" 0:00").date.getTime()-new a.Date.parse(p+"-"+l+"-"+n+" 0:00").date.getTime(),x=Math.floor(w/864e5)+1,y=0,z=[];x>y;y++){var A=s.getTime()+864e5*y,B=t.getTime()+864e5*y;z.push([new Date(A),new Date(B)])}var C=z[0][0].getTime(),D=z[0][1].getTime(),E=z[z.length-1][0].getTime(),F=z[z.length-1][1].getTime();if(r=z.slice(),2==x){if(f>D&&E>g)return[];if(f>C&&E>g)return r.splice(r.length-1,1),r[0][0]=b,r;if(f>D)return r.splice(0,1),r[0][1]=c,r}if(f>D&&g>E&&F>g)return r.splice(0,1),r[r.length-1][1]=c,r;if(f>C&&D>f&&E>g)return r.splice(r.length-1,1),r[0][0]=b,r;if(f>D)return r.splice(0,1),r;if(E>g)return r.splice(r.length-1,1),r;if(C>f&&F>g)return r[r.length-1][1]=c,r;if(f>C&&g>F)return r[0][0]=b,r;if(f>C&&F>g)return r[0][0]=b,r[r.length-1][1]=c,r;if(C>f&&g>F)return r}}};return c}),define("vVouchers",["libs","c","cUI","CommonStore","FlightStore","vVouchersCorporater",buildViewTemplatesPath("../modules/bookingInfo/templates/tVoucher.html"),"cWidgetFactory","cWidgetCalendar"],function(a,b,c,d,e,f,g,h){var i=(b.base,h.create("Calendar"),new b.base.Class({__propertys__:function(){this.stores=null},initialize:function(a){this.opts=_.extend({},a),this.parentView=this.opts.parentView,this.stores=this.parentView.stores,this.models=this.parentView.models,this.Calendar=h.create("Calendar"),this.$el=this.opts.viewPort,this.data=this.opts.data,this.$el.append(g),this.render(),this.events()},render:function(){this.elsBox={delivery_tpl:this.$el.find("#deliverytpl"),deliverytpl_tab:this.$el.find("#deliverytpl_tab"),deliverytpl_cost:this.$el.find("#deliverytpl_cost"),deliverytpl_mail_1:this.$el.find("#deliverytpl_mail_1"),deliverytpl_mail_2:this.$el.find("#deliverytpl_mail_2"),deliverytpl_zq:this.$el.find("#deliverytpl_zq"),invoiceboxtpl:this.$el.find("#invoice_box")},this.deliverytplfun=_.template(this.elsBox.delivery_tpl.html()),this.delmailfun_1=_.template(this.elsBox.deliverytpl_mail_1.html()),this.delmailfun_2=_.template(this.elsBox.deliverytpl_mail_2.html()),this.delzqfun=_.template(this.elsBox.deliverytpl_zq.html()),this.deltabfun=_.template(this.elsBox.deliverytpl_tab.html()),this.delcostfun=_.template(this.elsBox.deliverytpl_cost.html()),this.invoiceboxfun=_.template(this.elsBox.invoiceboxtpl.html())},events:function(){$(this.$el).on("click",".flight-bxinfo-kdf dd",this.selectPaymentType.bind(this)),$(this.$el).on("click","#intype",this.changeInvoiceType.bind(this))},selectPaymentType:function(a){{var b=this.stores.flightDeliveryStore,c=$(a.currentTarget),d=1;b.getAttr("paytype")}if(!c.hasClass("flight-bxinfo-kdf-current")){c.addClass("flight-bxinfo-kdf-current"),c.siblings("dd").removeClass("flight-bxinfo-kdf-current"),d=parseInt(c.data("paytype")),b.setAttr("paytype",d);{b.getAttr("deliveryInfo")}this.parentView.trigger(this.parentView.EVENTS.UPDATEORDERPRICE)}},renderInvoice:function(a,b,d,e,f){var g=this,h=this.parentView,i=this.deliverytplfun,j=this.delcostfun,k=this.deltabfun,l=this.stores.flightDeliveryStore,m=this.stores.userStore;if(d.len=a.length,d.needinv=b.needinv,h.elsBox.delivery_box.html(i(d)),32==d.type&&$("#gift-card-tips").show(),f=new c.cuiSwitch({rootBox:h.$el.find("#invoice_switch"),checked:a.length?!(!d.type||+d.type<=1):!1,changed:function(){g.reimbursementAction(this),h.models.postCityModel.excute(function(){},function(){},!1,this)}}),!a.length||!d.type||+d.type<=1||h.models.postCityModel.excute(function(){},function(){},!1,this),a.length&&(h.$el.find(".js_del_tab").html(k(d)),a&&a.length&&32==a[0].type)){var n=function(b){a[0].exinfo.pays.length<2&&(!a[0].exinfo.pays[0]||a[0].exinfo.pays[0]&&0!=a[0].exinfo.pays[0].paytype)&&a[0].exinfo.pays.push({paytype:0,amount:0}),l.setAttr("pays",a[0].exinfo.pays,h.UserID),d=l.get(h.UserID),d.rc=b,l.setAttr("rc",b),d.paytype=0==b?-1==d.paytype||"undefined"==typeof d.paytype?h.getPayType():d.paytype:-1,l.setAttr("paytype",d.paytype),d.islogin=m.isLogin(),d.fee=a[0].exinfo.fee,d.isLogin=m.isLogin(),h.$el.find(".js_del_cost").html(j(d)),g.parentView.trigger(g.parentView.EVENTS.UPDATEORDERPRICE)};g.repeatAddrCheck(n)}g.updateInvoiceBox()},updateInvoiceBox:function(){var a=this.parentView,b=this.stores.invoiceTitleStore,c=this.stores.passengerQueryStore,d=this.stores.flightOrderInfoInviceStore,e=this.stores.userStore,f=this.stores.flightDetailsStore,g=this.stores.flightOrderStore,h={},i=e.isLogin()?e.getUser().UserID:null,j=f.get();null!=j&&j.needinv&&(h=this.QueryInvoiceInfoData(b,d,g,c,h,i,f),g.setAttr("iinfo",h),a.$el.find("#js_invoice_box").html(this.invoiceboxfun(h)))},repeatAddrCheck:function(a){var b=this.stores.userStore,c=this.stores.postAddressStorage,d=this.stores.selAddrStore,e=this.models.addrCheckModel,f=this.parentView;if(b.isLogin()){var g=b.isLogin()?c.get():d.get(),h="";h+=g.prvnName?g.prvnName+";":";",h+=g.ctyName?g.ctyName+";":";",h+=g.dstrName?g.dstrName:"",e.setParam({cname:h}),f.showLoading(),e.excute(function(b){f.hideLoading(),a(b.rc)},function(){f.hideLoading(),a(0)},!0,f)}else a(0)},verifyAddrInput:function(a,b,c,d,e){c=$.trim(c),d=d.replace(/[\s]/g,""),e=$.trim(e);var f=c.length,g=!0;0==f&&(g=!1),b.setAttr("IsWriteAddressee",!0),(c.match(/^[a-z0-9]+$/i)&&(4>f||f>20)||c.match(/[\u4e00-\u9fa5]/)&&(1>f||f>10))&&(g=!1),0==d.length&&(g=!1),b.setAttr("IsDeliveryAddress",!0),(d.match(/^[a-z0-9]+$/i)&&d.length>100||d.match(/[\u4e00-\u9fa5]/)&&d.length>50)&&(g=!1),0==e.length&&(g=!1),b.setAttr("IsDeliveryPostCode",!0);var h=/^[0-9]\d{5}$/;return h.test(e)||(g=!1),g?g:(console.log("DataControl.TIPICONS.Blue"),a(DataControl.TIPICONS.RED,"#js_addrList>span","请选择报销凭证的配送地址",!0),!1)},PickTicketParam:function(){var a=this.stores.selFlightInfoStore.get(),b=this.stores.flightSearchStore.get(),c={};return c.triptype=b.tripType,c.ver=0,c.prdid=a.depart.cabin.pid,c},getCurrentItems:function(a){for(var b=a.deliveries||[],c=function(a){var b=null;a=a||[],_.sortBy(a,function(a){return a.paytype});var c=_.filter(a,function(a){return 3==a.paytype})[0];c&&(b=a[0],a[0]=c,a[a.length-1]=b),a=_.filter(a,function(a){return 0!=a.paytype})},d=0,e=b.length;e>d;d++)switch(b[d].type){case 32:b[d].key="快递",b[d].index=0,c(b[d].exinfo.pays);break;case 2:b[d].key="邮寄",b[d].index=1;break;case 16:b[d].key="机场自取",b[d].index=2;break;default:b.splice(d,1),d--,e=b.length}return _.sortBy(b,function(a){return a.index})},inTitleChange:function(a){var b=this.stores.userStore,c=this.stores.flightOrderInfoInviceStore,d=this.stores.flightOrderStore,e={},f=b.isLogin()?b.getUser().UserID:this.parentView.UserID;e.title=$("#js_invoice_title")?$("#js_invoice_title").val():"",c.setAttr(f,e),d.setAttr("iinfo",e),e.title.length&&a("#js_invoice_title")},changeInvoiceType:function(){if(!this.stores.flightDetailsStore.get())return void this.parentView.showAlert();if(this.invoiceinfo=this.stores.flightDetailsStore.getAttr("invoiceinfo")||[],1!=this.invoiceinfo.length){var a=this.stores.flightOrderInfoInviceStore.getAttr("invoiceinfo")||{},c=0;for(var d in this.invoiceinfo)this.invoiceinfo[d].key=this.invoiceinfo[d].inname,this.invoiceinfo[d].index=d,a.intype==this.invoiceinfo[d].intype&&(c=d);var e=this,f=new b.ui.ScrollRadioList({title:"凭证类型",index:c,data:this.invoiceinfo,itemClick:function(a){e.$el.find("#intype").text(a.key),e.$el.find("#intype").data("intype",a.index),e.stores.flightOrderInfoInviceStore.setAttr("invoiceinfo",{intype:a.intype,inname:a.key,len:e.invoiceinfo.length})}});f.show()}}}));return i=b.base.implement(i,f)}),define("vInsurance",["c","libs",buildViewTemplatesPath("../modules/bookingInfo/templates/tInsurance.html")],function(a,b,c){var d=new a.base.Class({__propertys__:function(){this.opts=this.opts||{},this.parentView=null},setBoxes:function(){this.insureInfoBox=this.viewPort.find("#insure")},setTemplate:function(){this.viewPort.append(c),this.insureBoxtplfun=_.template(this.viewPort.find("#insure_tpl").html())},changeOpts:function(a){this.opts=$.extend(!0,this.opts,a),this.viewPort=this.opts.viewPort,this.parentView=this.opts.parentView,this.stores=this.parentView.stores},initialize:function(a){this.changeOpts(a),this.setBoxes(),this.setTemplate(),this.fireEvents()},fireEvents:function(){this.parentView.on(this.parentView.EVENTS.INSURANCERENDER,this.render.bind(this))},render:function(a,b){var c=this.stores.flightOrderStore.get();if(c=c?c:{},b)this.setHtml(a,!1);else{var d="undefined"==typeof c.selInsure?1:c.selInsure&&+c.selInsure>-1?c.selInsure:0;a.selInsure=d,this.setHtml(a,!0)}},showReadMe:function(){var a=(this.opts.Mask,['<div class="flight-mask"   >','<div class="flight-mask-cnt" style=" color:rgba(255, 255, 255, 1);font-size:14px; " >','<p">Я����Ʒ��</p>',"<br/>","<p>Я���������ݲ�ͬ�ĵ���ͳ�Ʊ��ʽ���ṩ���������˺����ղ�Ʒ��</p>","<p>1 ��������ƣ��»������йذ�����ͨ���������˺����ա���e·̩�������������˺����ա�̫ƽ������̫���������ձ��ϼƻ����˱������ġ�Я�̷������ǡ����������˺����գ�</p>","<p>2 ���������ƣ��������� 5 �ݣ�</p>","<br/><br/>",'<p">����������</p>',"<br/>","<p>Я���������ݲ�ͬ�ĵ���ͳ�Ʊ��ʽ���ṩ���������˺����ղ�Ʒ��</p>","<p>1 ��������ƣ��»������йذ�����ͨ���������˺����ա���e·̩�������������˺����ա�̫ƽ������̫���������ձ��ϼƻ����˱������ġ�Я�̷������ǡ����������˺����գ�</p>","<p>2 ���������ƣ��������� 5 �ݣ�</p>","<p>3 ��������Ч�ڣ�ָ��������ÿ���Գ˿���ݣ�������ӱ��������ĺϷ���ҵ��Ӫ�Ŀ��˷ɻ��Σ������س����˹��ڰ�ȫ����Ĺ涨���Գ���Ч��Ʊ��Ʊ��������˿��˷ɻ�Ͳ�ʱ�����ִ��Ʊ�������յ��뿪��˿��˷ɻ�Ͳյ��ڼ������������˺����µı������Σ���Ͳյ��ڼ������������˺����µı������Σ���Ͳյ��ڼ������������˺���</p>","</div>","</div>"].join("")),a=$(a);this.parentView.mask||(this.parentView.mask=a,$("body").append(a),a.click(function(){$(this).hide()})),this.parentView.mask.show()},setInsuranceIntoFlightOrderStore:function(a){var b=this.stores.flightOrderStore.get(),c=this.stores.flightDetailsStore.get(),d={};if(b.selInsure&&+b.selInsure>0){var e=c.insurances[0];d.type=e.type,d.typeId=e.typeId,d.productId=e.productId,d.cInsurances=a,d.price=e.price}this.stores.flightOrderStore.setAttr("insurance",d)},getSels:function(){var a=0;return this.viewPort.find("#insure_must").length>0&&(a=$("#insure_must")&&$("#insure_must").attr("data-selInsure")?+$("#insure_must").attr("data-selInsure"):0),a},getBxQty:function(){var a=0;return this.viewPort.find("#insure_detail em i").length>0&&(a=this.viewPort.find("#insure_detail em i").html()),a},viewInsure:function(a){var b=this.stores.flightDetailsStore.get();return b?void(b.insurances[0].url?this.parentView.jump(b.insurances[0].url):this.parentView.forward(a)):void this.parentView.showAlert()},setInsureDetail:function(a,b,c,d){var e=this.viewPort.find("#insure_detail");if(!b&&+c.getAttr("selInsure")&&e.length>0){var f=parseInt(e.data("pcount"))||0;e.data("pcount",f+d);var g=parseInt(e.data("unitprice"))||0,h=parseInt(e.data("mininsure"))||0;a+=g*h;var i=e.find("em i");i&&i.length>0&&i.html((f+d)*h)}return a},hideBox:function(){this.insureInfoBox.hide()},showBox:function(){this.insureInfoBox.show()},setHtml:function(a,b){if(a){var c=this.insureBoxtplfun(a);this.insureInfoBox.html(c),b&&a.insurances&&a.insurances.length&&$("#insuranceLink > a").attr("href",a.insurances[0].url)}}});return d}),define("vOrder",[],function(a){var b=(a("c"),Backbone.View.extend({EVENTS:{CHECKTICKETAMOUNT:"checkTicketAmount"},initialize:function(a){this.opts=$.extend(!0,{},a),this.viewPort=this.opts.viewPort,this.parentView=this.opts.parentView,this.stores=this.parentView.stores,this.models=this.parentView.models,this.render()},fnCheckRepeatOrder:function(){var a=this.models.RepeatOrderCheckModel,b=this.stores.repeatOrderCheckStore,c=this;a.getDataWithSync(function(a){var d,e,f;a.rc?(d=a.rmsg,f=d.split(","),e=f.length&&f.map(function(a){var b=a.match(/\d/g);return b&&b.length?b.join(""):void 0}).filter(function(a){return a}),b.set({msg:d,repeatOrder:e},c.parentView.UserID),c.parentView.isRepeatOrder=!1,c.parentView.i_RepeatOrderAlert(e)):c.parentView.isRepeatOrder=!0},function(a){c.parentView.hideLoading(),c.parentView.isRepeatOrder=!0,a&&a.msg?c.parentView.showToast(a.msg,2,function(){}):c.parentView.showToast("数据加载失败",2,function(){})},!0)},checkTicketAmount:function(a){var b=this.stores.mdStore,c=this.stores.flightDetailsStore,d=c.get(),e=d.items[0].policy.qty;return d.items.length>1&&+e>+d.items[1].policy.qty&&(e=d.items[1].policy.qty),0>=+e?(this.parentView.showAlert("抱歉，您选择的价格舱位已售完，请重新查询选择其它价格舱位预订。",!1),b.increaseCntByKey("NextStepNotPassClick"),!0):+e<a.length?(this.parentView.showAlert("很抱歉，机票数量有限，最多只能添加"+e+"名乘机人",!1),b.increaseCntByKey("NextStepNotPassClick"),!0):void 0}}));return b}),define("vPayment",["libs","c","cUI","flight/utility/utility"],function(a,b,c,d){var e=(b.base,new b.base.Class({__propertys__:function(){this.stores=null},initialize:function(a){this.opts=_.extend({},a),this.viewPort=this.opts.viewPort,this.parentView=this.opts.parentView,this.stores=this.parentView.stores},EVENTS:{FORMATPATAMESSAGE:"formatPataMessage"},formatPataMessage:function(a,b,c){var d="";return a-b>50?d+=c+"机票价格上调为：&yen;"+a+"</br>":0>a-b&&(d+=c+"机票价格下调为：&yen;"+a+"</br>"),d},i_accountTotalPrice:function(){var a=0,b=null,c=1,e=this.stores.passengerQueryStore.getAttr("passengers")||[],f=this.stores.passengerQueryStore.getAttr("validSelCount"),g=this.stores.flightDetailsStore.get(),h=this.stores.flightOrderStore,i=(this.stores.packageSelectStore,this.stores.flightDeliveryStore.get(this.parentView.UserID)||{type:1}),j=_.filter(e,function(a){return 1==a.selected&&-1!=a.ticketType}).length;if(this.stores.passengerQueryStore.setAttr("validSelCount",j),f=this.stores.passengerQueryStore.getAttr("validSelCount"),!g||!g.items||!g.items.length)return this.parentView.showAlert(),0;for(var k=0;k<g.items.length;k++)for(var l=(g.items[k],0),m=e.length;m>l;l++)c="undefined"!=typeof e[l].ticketType?e[l].ticketType:1,b=DataControl.getTicketPolicy(c,k),1==+e[l].selected&&(a=d.add(a,b.price,b.fuelCost,b.tax));if(+h.getAttr("selInsure")&&!g.ispackage&&g.insurances&&g.insurances.length&&(a=d.add(a,d.mul(f,g.insurances[0].min,g.insurances[0].price))),g.ispackage&&g.pkglist&&g.pkglist.length&&(a=d.add(a,this.getInsureOrLipingTotalPrice(f))),32==i.type){var n=this.stores.flightDeliveryStore.getAttr("paytype"),o=i.deliveryInfo.fee||i.deliveryInfo.sendFee;(2==n||0==n)&&(a=d.add(a,o))}return a},getInsureOrLipingTotalPrice:function(a){{var b=this.stores.flightDetailsStore.get(),c=this.stores.packageSelectStore.get(this.parentView.uid).pkgtype;this.stores.passengerQueryStore.get()}if(!b.ispackage||!b.pkglist.length)return 0;var e=b.pkglist.filter(function(a){return a.basicinfo.pkgtype==c});if(e.length){var f=e[0].packageinfo.psgs.filter(function(a){return 1==a.psgtype});return e[0].count=(f.length?+f[0].min:1)*a,d.mul(e[0].count,+e[0].price)}}}));return e}),define("vTravelPackages",["c","libs",buildViewTemplatesPath("../modules/bookingInfo/templates/tTravelPackages.html")],function(a,b,c){var d=(a.base,new a.base.Class({__propertys__:function(){this.opts=this.opts||{},this.parentView=null},setBoxes:function(){this.lxtcBox=this.viewPort.find("#lxtc_box"),this.packageBox=this.viewPort.find("#package"),this.packageSelectBox=this.viewPort.find("#js_packageSelected")},setTemplate:function(){this.viewPort.append(c),this.lxtcBoxtplfun=_.template(this.viewPort.find("#lxtctpl").html()),this.packageBoxtplfun=_.template(this.viewPort.find("#packagetpl").html()),this.packageSelecttplfun=_.template(this.viewPort.find("#packageSelecttpl").html())},changeOpts:function(a){this.opts=$.extend(!0,this.opts,a),this.viewPort=this.opts.viewPort,this.parentView=this.opts.parentView,this.stores=this.parentView.stores},EVENTS:{TOGGLEPACKAGEDESC:"togglePackageDesc",UPDATEPACKAGETPL:"updatePackageTpl"},initialize:function(a){this.changeOpts(a),this.setBoxes(),this.setTemplate(),this.fireEvents()},fireEvents:function(){this.parentView.on(this.parentView.EVENTS.TOGGLEPACKAGEDESC,this.togglePackageDesc.bind(this)),this.parentView.on(this.parentView.EVENTS.UPDATEPACKAGETPL,this.updatePackageTpl.bind(this))},setAmtByPackageData:function(a,b,c,d){var e=this.parentView.uid,f=null!=c.get(e)?c.get(e).pkgtype||0:0;return a&&d.packageData&&(1==f||2==f)&&(b+=d.packageData.price*d.packageData.min),b},setPaymentParam:function(a,b){if(b)for(var c=this.stores.flightDetailsStore.get(),d=this.stores.packageSelectStore.get(this.uid).pkgtype,e=a.pkginfo,f=0;f<e.length;f++){var g=e[f];if(c.ispackage){if(g.basicinfo.pkgtype==d){var h=g.packageinfo.psgs.filter(function(a){return 1==a.psgtype}),i=h.length?h[0].min:1;b.pkglst.push({pkgtype:g.basicinfo.pkgtype,pkgsubtype:g.basicinfo.pkgsubtype,pkgid:g.basicinfo.pkgid,pkgname:g.basicinfo.pkgname,currency:g.currency,price:g.price,cnt:i,amount:i*g.price})}}else if(1==g.basicinfo.pkgtype&&this.stores.flightOrderStore.getAttr("selInsure")){var i=c.insurances[0].min;b.pkglst.push({pkgtype:g.basicinfo.pkgtype,pkgsubtype:g.basicinfo.pkgsubtype,pkgid:g.basicinfo.pkgid,pkgname:g.basicinfo.pkgname,currency:g.currency,price:g.price,cnt:i,amount:i*g.price})}}return b},updatePackageTpl:function(a){if(DataControl.packageData){DataControl.packageData.count=DataControl.packageData.min*(a||0),DataControl.packageData.pkgcount=DataControl.packageData.count;var b=this.packageBoxtplfun(DataControl.packageData);this.packageBox.html(b)}},render:function(a,b,c){this.setHtml(a,b,c),a.hasTravalPackage?this.viewPort.find("#package-desc").removeClass("js_hide"):""},togglePackageDesc:function(a){this.viewPort.find("#insuranceLink").length>0&&(a?this.viewPort.find("#insuranceLink").show():this.viewPort.find("#insuranceLink").hide())},packageSelectAction:function(a){var b=this.parentView.uid,c=$(a.currentTarget);c.hasClass("selected")||($(".js_package_select").removeClass("flight-selected"),c.addClass("flight-selected"),this.packageBox.find(".flight-ins").html(c.html()),this.packageBox.find(".flight-ins").data("type",+c.data("type")),this.stores.packageSelectStore.setAttr("pkgtype",+c.data("type"),b)),this.togglePackageSelect(),this.togglePackageDesc(1==+c.data("type")?!0:!1)},togglePackageSelect:function(){this.packageSelectBox.toggle(),this.packageBox.hasClass("flight-arrdown4")?this.packageBox.removeClass("flight-arrdown4").addClass("flight-arrup4"):this.packageBox.removeClass("flight-arrup4").addClass("flight-arrdown4")},setSelectHtml:function(){var a=this,b=this.parentView.uid,c=this.stores.flightDetailsStore.get()||{};if(c.selCount=this.stores.passengerQueryStore.getAttr("validSelCount"),c.pkgtype=this.stores.packageSelectStore.getAttr("pkgtype",b),c){var d=this.packageSelecttplfun(c);this.packageSelectBox.html(d),this.packageSelectBox.find(".js_package_select").bind("click",$.proxy(a.packageSelectAction,a))}},showReadMe:function(){var a=(this.opts.Mask,['<div class="flight-mask"   >','<div class="flight-mask-cnt" style=" color:rgba(255, 255, 255, 1);font-size:14px; " >','<p">携程礼品卡</p>',"<br/>","<p>携程旅行网根据不同的地区和出票方式，提供多款航空意外伤害保险产品：</p>","<p>1 、保险名称：新华“出行关爱”交通工具意外伤害保险、“e路泰康”航空意外伤害保险、太平洋“随心太保”意外险保障计划、人保健康的”携程飞翔无忧”航空意外伤害保险；</p>","<p>2 、份数限制：购买上限 5 份；</p>","<br/><br/>",'<p">航空意外险</p>',"<br/>","<p>携程旅行网根据不同的地区和出票方式，提供多款航空意外伤害保险产品：</p>","<p>1 、保险名称：新华“出行关爱”交通工具意外伤害保险、“e路泰康”航空意外伤害保险、太平洋“随心太保”意外险保障计划、人保健康的”携程飞翔无忧”航空意外伤害保险；</p>","<p>2 、份数限制：购买上限 5 份；</p>","<p>3 、保险有效期：指被保险人每次以乘客身份，乘坐电子保单载明的合法商业运营的客运飞机班次，并遵守承运人关于安全乘坐的规定，自持有效机票检票并进入所乘客运飞机客舱时起至抵达机票载明的终点离开所乘客运飞机客舱的期间内遭受意外伤害所导致的保险责任；机客舱的期间内遭受意外伤害所导致的保险责任；机客舱的期间内遭受意外伤害所导</p>","</div>","</div>"].join("")),a=$(a);this.parentView.mask||(this.parentView.mask=a,$("body").append(a),a.click(function(){$(this).hide()})),this.parentView.mask.show()},setHtml:function(a,b,c){var d=this;if(console.log("travel package"),a){var e=this.stores.userStore,f=e.isLogin()?e.getUser().UserID:null,g=1;null!=f&&(g=b.get(f).pkgtype||1),a.pkgtype=g;var h=c.get(),i=[];if(a.ispackage&&a.pkglist.length){if(i=a.pkglist.filter(function(a){return a.basicinfo.pkgtype==g}),i.length){var j=i[0].packageinfo.psgs.filter(function(a){return 1==a.psgtype});i[0].count=(j.length?j[0].min:1)*(h.validSelCount||0),i[0].min=j.length?j[0].min:1,a.pkgcount=+i[0].count,a.pkgprice=+i[0].price;var k=this.packageBoxtplfun(i[0]);this.packageBox.show().html(k),this.packageBox.find(".flight-ins").length>0&&this.packageBox.find(".flight-ins").bind("click",$.proxy(d.togglePackageSelect,d)),this.packageBox.find(".flight-labq").length>0&&this.packageBox.find(".flight-labq").bind("click",$.proxy(d.showReadMe,d)),this.setSelectHtml(),this.parentView.vInsurance.hideBox();var l=1!=g?!1:!0;this.togglePackageDesc(l),DataControl.packageData=i[0]}}else this.parentView.vInsurance.showBox(),this.packageBox.hide(),this.packageSelectBox.hide();var m=this.lxtcBoxtplfun(a);this.lxtcBox.html(m),a.hasTravalPackage?(this.viewPort.find("#package-desc").show(),this.viewPort.find("#flightInfo .flight-pnttips").addClass("black-text")):(this.viewPort.find("#flightInfo .flight-pnttips").removeClass("black-text"),this.viewPort.find("#package-desc").hide())}}}));return d});
define(['cSales', 'cWidgetMember', 'vFlightInfo', 'vPassenger', 'vVouchers', 'vPayment', 'vOrder',
     //add by rhhu
    'vInsurance',
    //add by rhhu
    'vTravelPackages',
    'vDataControl', 'widgetHidden',
    'libs', 'c', 'cUI', 'MultipleScrollList', 'adLoad',
    'CommonStore', 'flight/utility/utility', 'FlightStore', 'FlightModel', 'CPageModel', 
    'CPageStore', 'InvoiceStore', buildViewTemplatesPath('../modules/bookingInfo/templates/index.html'), 'cUtilityCrypt',
    'cWidgetFactory', 'relationship', 'cWidgetCalendar'/*, '../debug/console'*/],

    function (cSales, cWidgetMember, vFlightInfo, vPassenger, vVouchers, vPayment, vOrder, vInsurance, vTravelPackages,
        vDataControl, widgetHidden,
        libs, c, cUI, MultipleScrollList, MyLoad, 
        CommonStore, Futility, FlightStore, FlightModels, CPageModel, 
        CPageStore, InvoiceStore, html, Crypt, 
        WidgetFactory, relationship, cWidgetCalendar/*, console*/) {

    var Member = WidgetFactory.create('Member');
    var View;
    var flightDetailModel = FlightModels.FlightDetailModel.getInstance(), //航班详情数据Model
        passengerEditModel = CPageModel.passengerEditModel.getInstance(),
        postCityModel = CPageModel.PostCityModel.getInstance(),
        flightOrderSumbitModel = FlightModels.FlightOrderSumbitModel.getInstance(), //订单数据Model
        passengerQueryModel = CPageModel.passengerQueryModel.getInstance(),
        addrListModel = CPageModel.CustomerAddrQueryModel.getInstance(),
        flightPickTicketModel = FlightModels.FlightPickTicketModel.getInstance(), //配送方式请求
        addrOprModel = CPageModel.CustomerAddrEditModel.getInstance(), //常用地址编辑model
        flightOrderCreateModel = FlightModels.FlightOrderCreateModel.getInstance(),
        customerCouponModel = FlightModels.CustomerCouponModel.getInstance(),
        RepeatOrderCheckModel = FlightModels.RepeatOrderCheckModel.getInstance(),       //重复订单model
        addrCheckModel = FlightModels.AddrCheckModel.getInstance(), //重复地址免费查询
        
        flightSearchStore = FlightStore.FlightSearchStore.getInstance(), //航班查询Storage
        flightDetailsStore = FlightStore.FlightDetailsStore.getInstance(), //获取航班详细信息Storage
        selFlightInfoStore = FlightStore.FlightSelectedInfo.getInstance(), //用户选择的航班信息
        passengerQueryStore = CPageStore.passengerQueryStore.getInstance(), //用户选择的乘机人
        passengerEditStore = CPageStore.passengerEditStore.getInstance(), //设置需要修改的乘机人Storage
        isBookingEditStore = CPageStore.isBookingEditStore.getInstance(), //是否booking页内是否可编辑常旅
        postCityStore = CPageStore.PostCityStore.getInstance(),
        flightOrderStore = FlightStore.FlightOrderInfoStore.getInstance(), //航班订单信息Storage
        flightDeliveryStore = FlightStore.FlightPickTicketSelectStore.getInstance(), //航班订单配送信息Storage
        postAddressStorage = CPageStore.CustomerAddrStore.getInstance(), //航班订单邮寄配送信息Storage
        airportDeliveryStore = FlightStore.zqInAirportDateAndAddressStore.getInstance(), //航班订单机场自取配送信息Storage
        userStore = CommonStore.UserStore.getInstance(), //用户信息
        salesStore = CommonStore.SalesObjectStore.getInstance(),
        unionStore = CommonStore.UnionStore.getInstance(),
        passPageTypeStore = CPageStore.passPageTypeStore.getInstance(),
        flightListStore = FlightStore.FlightListStore.getInstance(),
        addrListStore = CPageStore.CustomerAddrListStore.getInstance(),
        addressStore = CPageStore.AddressStore.getInstance(),
        flightPickTicketStore = FlightStore.FlightPickTicketStore.getInstance(), //配送方式请求返回数据的store
        zqInAirportSelectStore = FlightStore.zqInAirportSelectStore.getInstance(),
        selAddrStore = CPageStore.SelectAddrStore.getInstance(), //选择省市Store
        cabinParamStore = FlightStore.FlightCabinParamStore.getInstance(), //所选的机票信息，用于查询舱位
        cabinStore = FlightStore.FlightCabinStore.getInstance(), //舱位信息
        orderCreateStore = FlightStore.OrderCreateStore.getInstance(),  //创建订单后保存信息store
        invoiceURLStore = InvoiceStore.InvoiceURLStore.getInstance(),
        invoiceTitleStore = InvoiceStore.Flight_InvoiceTitle.getInstance(),    //调用发票公共选取返回抬头的store
        customerCouponStore = FlightStore.CustomerCouponStore.getInstance(),
        repeatOrderCheckStore = FlightStore.RepeatOrderCheckStore.getInstance(),        //重复订单store 
        packageSelectStore = FlightStore.PackageSelectStore.getInstance(),
        mdTransStore = FlightStore.MdTransStore.getInstance(),
        mdStore = FlightStore.MdBookingStore.getInstance(),
        ShowLoginStore = CPageStore.ShowLoginStore.getInstance(),
        flightOrderInfoInviceStore = FlightStore.FlightOrderInfoInviceStore.getInstance(),
        flightBookingResultStore = FlightStore.FlightBookingResultStore.getInstance(),
        //建行合作临时存放
        flightCCBStore = FlightStore.FlightCCBStore.getInstance(),
        //widgets
        Calendar = WidgetFactory.create('Calendar'),
        Guider = WidgetFactory.create('Guider'),
        userInfo = userStore ? userStore.getUser() : null,
        cbase = c.base,
        
        _this = null,
        mask = null,
        globalMask = null,
        invoice_switch = null,
        UBTKey = "h5.flt.booking";

    //发票缓存(add by rhhu)
    var myLoad = new MyLoad();                                       //don't move into child modules
    var Mask = new c.base.Class(c.ui.Layer, {
        __propertys__: function () {
            var self = this;
            this.contentDom;
            this.mask = new c.ui.Mask();
            this.mask.addEvent('onShow', function () {
                $(window).bind('resize', this.onResize);
                this.onResize();
                var scope = this;
                this.root.bind('click', function () {
                    scope.hide();
                    scope.root.unbind('click');
                    self.hide();
                });

            });
        },
        initialize: function ($super, opts) {
            $super({
                onCreate: function () { },
                onShow: function () {
                    for (var k in opts) this[k] = opts[k];
                    this.mask.show();
                    this.setzIndexTop();
                    if (typeof this.html == 'string') this.html = $(this.html);
                    this.contentDom.html(this.html);
                    if (this.closeDom) {
                        this.contentDom.find(this.closeDom).on('click', function () {
                            mask && mask.hide();
                        });
                    }
                },
                onHide: function () {
                    this.mask && this.mask.hide();
                }
            });

        }
    });
    View = c.view.extend({
        pageid: '214279',
        tpl: html,
        vFlightInfo: null,
        vPassenger: null,
        vVouchers: null,
        vPayment: null,
        vOrder: null,

        //add by rhhu
        vInsurance: null,
        //add by rhhu
        vTravelPackages: null,

        render: function () {
            this.showLoading();
            this.$el.html(this.tpl);
            this.elsBox = {
                infobox_box: this.$el.find('#flightInfo'), //航班详情模板容器
                insure_tpl: this.$el.find('#insure_tpl'), //保险模板
                insure_box: this.$el.find('#insure'), //保险模板容器
                coupons_tpl: this.$el.find('#couponstpl'), //消费券模板
                coupons_box: this.$el.find('#couponsbox'), //消费券容器
                pay_tpl: this.$el.find('#paytpl'), //支付信息模板
                pay_box: this.$el.find('#paybox'), //支付信息容器
                hfb_tpl: this.$el.find('#hfbtpl'), //惠飞保信息模板
                hfb_box: this.$el.find('#hfb_box'), //惠飞保信息容器
                delivery_tpl: this.$el.find("#deliverytpl"), //配送方式模板
                delivery_box: this.$el.find("#deliverybox"), //配送方式容器
                deliverytpl_tab: this.$el.find("#deliverytpl_tab"), // 配送方式选项
                deliverytpl_mail_1: this.$el.find("#deliverytpl_mail_1"), // 无常用地址时的模板
                deliverytpl_mail_2: this.$el.find("#deliverytpl_mail_2"), // 有常用地址时候的模板
                deliverytpl_zq: this.$el.find("#deliverytpl_zq"), // 机场自取的模板
                lxtc_box: this.$el.find('#lxtc_box'), //旅行套餐模版容器
                lxtc_tpl: this.$el.find('#lxtctpl'), //旅行套餐的模版
                notice_box: this.$el.find('#notice_box'), //国内公告模版容器
                notice_tpl: this.$el.find('#notice_tpl'), //国内公告模版
                package_tpl: this.$el.find("#packageTmp"), //套餐二选一模板
                package_box: this.$el.find("#package"),//套餐二选容器
                error_tips: this.$el.find('.error-tips'), // 错误提示信息
                orderDetail: this.$el.find("#order-detail"),
                orderDetail_tpl: this.$el.find("#order-detail-tpl"),
            };
            this.couponstplfun = _.template(this.elsBox.coupons_tpl.html());
            // this.lxtctplfun = _.template(this.elsBox.lxtc_tpl.html());
            this.noticetplfun = _.template(this.elsBox.notice_tpl.html());
            this.paytplfun = _.template(this.elsBox.pay_tpl.html());
            this.packagefun = _.template(this.elsBox.package_tpl.html());
            this.orderDetailtplfun = _.template(this.elsBox.orderDetail_tpl.html());
        },
        stores: {
            flightSearchStore: flightSearchStore,               //航班查询Storage
            flightDetailsStore: flightDetailsStore,             //获取航班详细信息Storage
            selFlightInfoStore: selFlightInfoStore,             //用户选择的航班信息
            passengerQueryStore: passengerQueryStore,           //用户选择的乘机人
            passengerEditStore: passengerEditStore,             //设置需要修改的乘机人Storage
            isBookingEditStore: isBookingEditStore,             //是否booking页内是否可编辑常旅
            postCityStore: postCityStore,
            flightOrderStore: flightOrderStore,                 //航班订单信息Storage
            flightDeliveryStore: flightDeliveryStore,           //航班订单配送信息Storage
            flightOrderInfoInviceStore: flightOrderInfoInviceStore,           //机票发票store
            postAddressStorage: postAddressStorage,             //航班订单邮寄配送信息Storage
            airportDeliveryStore: airportDeliveryStore,         //航班订单机场自取配送信息Storage
            userStore: userStore,                               //用户信息
            salesStore: salesStore,
            unionStore: unionStore,
            passPageTypeStore: passPageTypeStore,
            flightListStore: flightListStore,
            addrListStore: addrListStore,
            addressStore: addressStore,
            flightPickTicketStore: flightPickTicketStore,       //配送方式请求返回数据的store
            zqInAirportSelectStore: zqInAirportSelectStore,
            selAddrStore: selAddrStore,                         //选择省市Store
            cabinParamStore: cabinParamStore,                   //所选的机票信息，用于查询舱位
            cabinStore: cabinStore,                             //舱位信息
            orderCreateStore: orderCreateStore,                 //创建订单后保存信息store
            invoiceURLStore: invoiceURLStore,
            invoiceTitleStore: invoiceTitleStore,               //调用发票公共选取返回抬头的store
            customerCouponStore: customerCouponStore,
            repeatOrderCheckStore: repeatOrderCheckStore,        //重复订单store 
            packageSelectStore: packageSelectStore,
            mdTransStore: mdTransStore,
            mdStore: mdStore,
            ShowLoginStore: ShowLoginStore
        },
        models: {
            flightOrderCreateModel: flightOrderCreateModel,
            flightDetailModel: flightDetailModel,               //航班详情数据Model
            passengerEditModel: passengerEditModel,
            postCityModel: postCityModel,
            flightOrderSumbitModel: flightOrderSumbitModel,     //订单数据Model
            passengerQueryModel: passengerQueryModel,
            addrListModel: addrListModel,
            flightPickTicketModel: flightPickTicketModel,       //配送方式请求
            addrOprModel: addrOprModel,                         //常用地址编辑model
            customerCouponModel: customerCouponModel,
            RepeatOrderCheckModel: RepeatOrderCheckModel,       //重复订单model
            addrCheckModel: addrCheckModel,                     //重复地址免费查询
        },
        events: {
            'click #js_return': 'backAction', //返回列表页
            'click div[data-rbtType]': 'showRebate', //插烂返现说明
            'click #paybtn .j_btn': 'beforePayAction', //提交订单                        //flightDetailsStore, passengerQueryStore, mdStore, postAddressStorage, userStore, flightDeliveryStore
            //'click .flight-loginline': 'bookLogin', //登录
            'input #linkTel': 'setContact', //保存用户输入的联系人 
            'click #addPassenger .flight-labq': 'readmeAction',//姓名帮助
            'click .jsDelivery': 'selDelivery', //选择配送方式
            'click #jsViewCoupons': 'viewCoupons', //查看消费券使用说明                                                  //flightDetailsStore
            'click .j_refundPolicy': 'fanBoxAction', //查看返现信息
            //'click .flight-bkinfo-tgq .f-r': 'tgBoxAction', //查看退改签
            'click .js_del_tab': 'showDelListUI', //配送方式
            //            'click .js_del_cost .flight-psf i': 'selectPaymentType', // 选择快递费用方式
            'click #js_addrList': 'AddrListAction', //选择地址
            'click #date-picker': 'calendarAction', //取票日期                                                                    //airportDeliveryStore
            'click #done-address': 'zqinairselect', //取票柜台
            'click #selectCity': 'selectCityAction', //选择城市
            'click #date-zqtime': 'showZqTimeUI', //取票时间                                                                        //airportDeliveryStore
            'click #jsinsure': 'viewInsure', //保险说明
            'change #js_invoice_title': 'inTitleChangeWrp', //发票抬头更改                // userStore, flightOrderInfoInviceStore, flightOrderStore    //don't move outside
            'click .flight-icon-arrrht': 'showinTitleList', //‘+’号，跳转发票抬头列表                 //userStore, invoiceURLStore
          
            'focusout #linkTel': 'telInputFinish',
            'touchstart input': 'touchStartAction', // 处理Android手机上点击不灵敏问题
            'click #package .flight-arrrht': 'packageSelect',
            'focusin input': 'hideErrorTips',
            'click .j_PackageNotice': 'toggletips',
            'click .j_AnnouncementNotice': 'toggleNotice',
            'click #travalPackageDesc': 'forwardToTravalPackage',       //don't move into child modules
            'click #paybtn': 'orderDetailAction'
        },
        onCreate: function () {
            me = this;
            var selFlightInfoData = selFlightInfoStore.get();
            var flightSearchData = flightSearchStore.get(); //获取Storage存储的航班查询条件
            // flightOrderStore.setAttr('auth',userInfo.Auth); //将用户标识加入订单填写信息store
            this.render();

            this.$el.on('focus', 'input', function () {
                me.$el.find('.js_fixed').addClass('pos-rl');
                $('.flight-header-blank').hide();  //暂时解决未登录占位符，input  focus时样式不对
            }).on('focusout', 'input', function () {
                me.$el.find('.js_fixed').removeClass('pos-rl');
                $('.flight-header-blank').show(); //暂时解决未登录占位符，input  focus时样式不对
            });
        },
        _associationflag: null,             //TODO
        /**
         * add child modules .
         * @param: oArgu.childModuleName    must
         * @param: 
         */
        setAssociation: function(oArgu){
            if(this._associationflag) return;
            for(var i=0; i<oArgu.associations.length; i++){
                var childName = oArgu.associations[i].name;
                var constructor = oArgu.associations[i].constructor;
                if(!childName || !constructor ){
                    throw 'param error, you must prepare the param first!'; continue;
                }
                this[childName] = new constructor( _.extend({}, oArgu.common, oArgu.associations[i].argu) );
            }
        },
        onLoad: function (prevPage) {
            var me = this; 
            DataControl = (typeof DataControl === 'undefined') ? new vDataControl(this) : DataControl;
            
            var oParam = {
                common: {
                    viewPort: this.$el,
                    parentView: this
                },
                associations: [ { name : 'vFlightInfo', constructor: vFlightInfo },
                                { name: 'vPassenger', constructor: vPassenger } ,
                                { name: 'vVouchers', constructor: vVouchers } ,
                                { name: 'vInsurance', constructor: vInsurance} ,
                                { name: 'vTravelPackages', constructor: vTravelPackages } ,
                                { name: 'widgetHidden', constructor: widgetHidden } ,
                                { name: 'vPayment', constructor: vPayment } ,
                                { name: 'vOrder', constructor: vOrder }] };
                                
            this.setAssociation(oParam);    // get all child modules
            
            this.fireInterfaceEvents();     // bind interfaces
            me.turning();
            
            if( this.vFlightInfo.render()) return;
            
            this.widgetHidden.onLoad();             //埋点，获取列表页的部分信息
            me.showLoading();
            var userInfo = userStore.getUser();
            if (!me.uid) {
                if (userStore.isLogin()) {
                    me.uid = userInfo.UserID;
                } else {
                    me.uid = c.utility.getGuid();
                }
            };
            
            var selFlightInfoData = selFlightInfoStore.get(),
                flightSearchData = flightSearchStore.get();                                     //获取Storage存储的航班查询条件
            if (!selFlightInfoData || !flightSearchData || !flightSearchData.items ||!selFlightInfoData.depart) {           //未获取到用户选择的航班信息，则返回机票查询页
                me.hideLoading(); //非渲染
                me.showAlert();
                return false;
            }
            
            this.setFlightDetailModelParams(selFlightInfoData, flightSearchData, userInfo);         //给 FlightDetailModel 设置param
            
            me.updateDelList( prevPage );
            
            this.setRepeatAlert();                      // 重复订单提示
            this.getSalesObj(CommonStore);

            //建行
            if (flightCCBStore.getAttr("isCCB")) {
                me.$el.find("#js_flight-top").hide();
                me.$el.find(".flight-loginline-fixed").hide();
                me.$el.find(".flight-loginline").hide();
            }
        },
        //报销凭证开关
        updateDelList: function (prevPage) { //获取配送方式信息 
            var me = this;
            var param = me.vVouchers.PickTicketParam();
            param.polid = flightDetailModel.getParamStore().get().polid;
            flightPickTicketModel.setParam(param);
            me.DelItemsData = [];
            
            var callback = function(){
                me.updatePage( Futility.createCallback( me.hideAds.bind(me), prevPage  ) );
            };
            
            flightPickTicketModel.excute(function (data) {
                me.DelItemsData = me.vVouchers.getCurrentItems(data);
                callback();
            }, function (e) {
                if (invoice_switch) {
                    invoice_switch.changed = function () {
                        me.$el.find('#invoice_switch .cui-switch').removeClass('current');
                        me.$el.find('#invoice_switch .cui-switch-bg').removeClass('current');
                    };
                }
                var d = { "deliveries": [] };
                me.DelItemsData = me.vVouchers.getCurrentItems(d);
                callback();

            }, false, me);
        },
        hideAds: function(prevPage){
            var me = this;
            me.$el.parents("body").find("#dl_app").hide();                               // 强行将底部广告隐藏 add by mmx
            if (prevPage == "flightorderdetail" || prevPage == "flightorderlist") {         //从订单列表页或详细页过来则显示重复订单
                me.repeatAlert && me.repeatAlert.show();
            }
        },
        setRepeatAlert: function(){
            var me = this;
            var repeatOrderAlert = localStorage.getItem('__REPEAT_ORDER');
            var repeatOrderInfo = repeatOrderCheckStore.get();
            if (repeatOrderAlert == 'true' && repeatOrderInfo) {
                var msg = repeatOrderInfo.msg;
                var repeatOrder = repeatOrderInfo.repeatOrder;
                me.i_RepeatOrderAlert( repeatOrder );
            }
        },
        i_RepeatOrderAlert: function(repeatOrder){
            var me = this;
            me.repeatAlert = new c.ui.Alert({
                title: '重复订单提醒',
                message: msg,
                buttons: [
                    {
                        text: '取消',
                        click: function () {
                            this.hide();
                            localStorage.setItem('__REPEAT_ORDER', false);
                            repeatOrderCheckStore.remove();
                        }
                    },{
                        text: '查看订单',
                        click: function () {
                            //有多个重复订单时
                            if (repeatOrder && repeatOrder.length > 1) {
                                me.jump("/webapp/myctrip/#orders/flightorderlist?from=" + encodeURIComponent('/webapp/flight/#bookinginfo'));
                            } else {
                                me.jump("/webapp/flight/#flightorderdetail?from=" + encodeURIComponent('/webapp/flight/#bookinginfo') + "&&oid=" + repeatOrder[0]);
                            }
                            this.hide();
                            localStorage.setItem('__REPEAT_ORDER', true);
                        }
                    },{
                        text: '继续预订',
                        click: function () {
                            this.hide();
                            me.isRepeatOrder = true;
                            me.payAction();
                            localStorage.setItem('__REPEAT_ORDER', false);
                            repeatOrderCheckStore.remove();
                        }
                    }
                ]
            });
            me.repeatAlert.show();
        },
        setFlightDetailModelParams: function(selFlightInfoData, flightSearchData, userInfo ){
            var tripType = 1;
            var prdid = selFlightInfoData.depart.cabin.pid;
            if (selFlightInfoData.arrive && selFlightInfoData.arrive.cabin && flightSearchData.tripType && (+flightSearchData.tripType) > 1) {
                tripType = 2;
                prdid = selFlightInfoData.depart.cabin.pid + "," + selFlightInfoData.arrive.cabin.pid;
            }
            flightDetailModel.setParam("prdid", prdid);
            flightDetailModel.setParam('polid', '0');
            flightDetailModel.setParam('triptype', tripType); //查询类型，单程或者往返
            
            if (userInfo) {
                if (userInfo.VipGrade) {
                    flightDetailModel.setParam('ugrade', userInfo.VipGrade);
                }
                if (userInfo.Auth) {
                    flightDetailModel.getHead().setAttr('auth', userInfo.Auth);
                }
            }
            flightDetailModel.setParam('ver', 0);
        },
        EVENTS: {
            DETAILCOMPLETE: 'flightDetailComplete',
            PASSENGERSCOMPLETE: 'passengersComplete',
            INSURANCERENDER: 'insuranceRender',
            SWITCHINSURETRIGGER: 'switchInsureTrigger',
            TOGGLEPACKAGEDESC: 'togglePackageDesc',
            UPDATEPACKAGETPL: 'updatePackageTpl', 
            UPDATEORDERPRICE: 'updateOrderPrice'
        },
        i_hasChildrenOrBaby: function (p) {
            return this.vPassenger.i_hasChildrenOrBaby(p);
        },
        //personal events as below
        fireInterfaceEvents: function () {
            this.on(this.EVENTS.SWITCHINSURETRIGGER, this.switchInsure );
            this.on(this.EVENTS.UPDATEORDERPRICE, this.updateOrderPrice );
        },
        updateOrderPrice: function () {                 // 更新价格唯方法，其它方法均要废弃 重要！！！！！
            var orderPrice = this.vPayment.i_accountTotalPrice();
            var $totalPrice = $('#paybox .fs');
            var totalPrice = $totalPrice.data('amt');

            $totalPrice.data('amt', orderPrice);
            $totalPrice.text(orderPrice > 0 ? orderPrice : '----');
        },

        //调用turning方法时触发
        onShow: function () {
            this.setTitle('机票预订');
        },
        getSalesObj: function (CommonStore) {
            var me = this;
            var sales = me.getQuery('sales'),                           //XXX: getQuery
            sourceid = me.getQuery('sourceid');

            var _sales = CommonStore.SalesStore.getInstance().get();
            if (_sales != null) {
                if (sourceid == null && sales == null) {
                    sourceid = _sales["sourceid"];
                }
            }
            if (sales || sourceid) {
                cSales.getSalesObject(sales || sourceid, $.proxy(function (data) {
                    cSales.replaceContent(me.$el);
                }, this));
            }
        },
        onHide: function () {
            this.hideHeadWarning();
            this.hideLoading(); //非渲染
            if (!userStore.isLogin()) {
                $("header").removeClass("pos-ab");
            }
            $('#flightBox').hide();
            $('#paybox').hide();
            myLoad.hide();
        },
        updatePage: function (callback) {           //can't be deleted ,used by vPassenger
            var me = this,
                psgersData = {};

            DataControl.reqFlags.DETAIL = false;
            DataControl.reqFlags.PASSENGERS = false;
            DataControl.reqFlags.HASPASSENGER = false;
            DataControl.reqFlags.PASSENGERSFAIL = false;
            //1.绑定航班信息
            //发detail 请求 
            me.vFlightInfo.i_getFlightDetail(
                function (data) {
                    me.trigger(me.EVENTS.DETAILCOMPLETE, psgersData, data, DataControl.reqFlags);
                    DataControl.reqFlags.DETAIL = true;
                    callback && callback();
                    if (DataControl.reqFlags.PASSENGERS) {
                        me.hideLoading();
                    }
            });
                
            //判断是否已登录，进行不同情况的页面展示
            var fnHide = function(){
                if (DataControl.reqFlags.DETAIL) {
                    me.hideLoading();
                }
            };
            if (userStore.isLogin()) {
                me.UserID = userStore.getUser().UserID;
                passengerQueryStore.setLifeTime('60M');
                passengerQueryModel.setParam('UserId', me.UserID);
                me.showLoading();
                
                passengerQueryModel.excute(function (data) {
                    me.trigger(me.EVENTS.PASSENGERSCOMPLETE, psgersData, data, DataControl.reqFlags);
                    DataControl.reqFlags.PASSENGERS = true;
                    fnHide();
                }, function (err) {
                    DataControl.reqFlags.PASSENGERSFAIL = true;
                    me.trigger(me.EVENTS.PASSENGERSCOMPLETE, psgersData, err, DataControl.reqFlags);
                    fnHide();
                }, false, me);
            } else {
                me.UserID = me.UserID || c.utility.getGuid();
                me.trigger(me.EVENTS.PASSENGERSCOMPLETE, psgersData, null, DataControl.reqFlags);
                DataControl.reqFlags.PASSENGERS = true;
                fnHide();
            }
            
            me.fnSetContactMobile();

            if (flightCCBStore.getAttr("isCCB")) {          //建行支持，荣华 seo
                $(".flight-loginline").hide();
            }
        },
        fnSetContactMobile: function(){
            var me = this;
            var userInfo = userStore.getUser();
            //若用户已经登录且无联系人信息，用户信息中的姓名和电话绑定在联系人中
            if (userInfo && userInfo.IsNonUser == false) {
                me.$el.find('#linkTel').val((userInfo.Mobile ? userInfo.Mobile : ""));
            }
            //设置联系人手机号
            var flightOrderData = flightOrderStore.get();
            if (flightOrderData && flightOrderData.contact) {
                var contact = flightOrderData.contact;

                if (contact.mphone && contact.mphone.trim().length > 0) {
                    me.$el.find('#linkTel').val(contact.mphone.trim());
                }
            }
        },
        toggleNotice: function () {
            $('.j_AnnouncementNotice').toggleClass("flight-htauto");
            $('.j_AnnouncementNotice').children(".flight-arrdn5").toggleClass("flight-arrup5");
        },
        toggletips: function (e) {
            $('.j_PackageNotice').toggleClass("flight-htauto");
            $('.j_PackageNotice').children(".flight-arrdn3").toggleClass("flight-arrup3");
        },
        deleteHistoryBeforeGoBack: function(){  //清除历史记录 保险信息，配送信息, 航班信息
            var flightOrderData = flightOrderStore.get();
                
            flightOrderData = flightOrderData ? flightOrderData : {};
            //清除历史记录 保险信息，配送信息, 航班信息
            flightOrderStore.setAttr('delivery', null);
            flightOrderStore.setAttr('flightInfos', null);
            flightOrderStore.setAttr('insurance', null);
            flightOrderStore.setAttr('order', null);
            flightOrderStore.setAttr('selInsure', '1');
        },
        //don't move into child modules
        backAction: function (shareTrip) {
            var me = this,
                flightDetailsData = flightDetailsStore.get() ;
            me.deleteHistoryBeforeGoBack();
            var backUrl = '#list';
            if (shareTrip && +shareTrip > 0) {
                if (flightDetailsData && flightDetailsData.items && flightDetailsData.items.length > 1) {
                    //判断是否包含共享航班
                    //表示去除包含共享航班，则返回去程列表页
                    backUrl = +shareTrip == 1 ? '#list' : "#backlist";
                }
                //移除保存的航班详情数据
                flightDetailsStore.remove();
                me.back(backUrl);
                me.widgetHidden.goBack();               // 埋点IsReturn
                return;
            }
            me.giveUpAlert(backUrl, flightDetailsData);
        },
        giveUpAlert: function(backUrl, flightDetailsData){
            var me = this, backAlert = new c.ui.Alert({
                title: '提示信息',
                message: '您的订单尚未完成，确定要离开吗？',
                buttons: [{
                    text: '取消',
                    click: function () {
                        this.hide();
                        me.widgetHidden.goBack();       // 埋点IsReturn
                    }
                }, {
                    text: '确定',
                    click: function () {
                        this.hide();
                        //若是单程，则返回去程列表页
                        if (flightDetailsData && flightDetailsData.items && flightDetailsData.items.length > 1) {
                            backUrl = "#backlist";
                        }
                        me.hideLoading(); //非渲染
                        selAddrStore.remove();
                        passengerEditStore.remove();
                        airportDeliveryStore.remove();
                        flightPickTicketStore.remove();

                        me.repeatAlert = false;
                        setTimeout(function () {
                            if (!flightListStore.get() && window.localStorage.length === 3) {
                                me.back('index');
                            } else {
                                me.back(backUrl);
                            }
                            me.widgetHidden.goBack();   // 埋点IsReturn
                        }, 200);
                    }
                }]
            });
            backAlert.show();
        },
        forwardToTravalPackage: function () {
            this.forward("#travalpackagesdesc");
        },
        //passenger
        readmeAction: function () {         //common             //TODO:
            var html = ['<div class="flight-windows">',
                        '<div class="flight-windows-hd">姓名填写说明<i class="flight-icon-close"></i></div>',
                        ' <div class="flight-windows-bd">',
                        ' <p>1）乘客姓名必须与登机时所用证件上的名字一致；持护照登机的外宾，须按护照上的顺序填写且不区分大小写。</p>',
                        ' <p>2）姓名中包含生僻字或者繁体字，请从生僻字开始之后的中文都用拼音代替，如：王喆敏，请填写”王zhemin"</p>',
                        ' <p>3）姓名过长时请使用缩写，如：”买买提不拉多娜萨日娜阿诺凡“ 简写为 ”买买提不拉多娜萨日娜阿“</p>',
                        '</div>',
                        '</div>' ].join('');
            html = $(html);
            if (!mask) {
                mask = new Mask({
                    html: html, // 弹窗html
                    closeDom: '.flight-windows' // 弹窗关闭按钮
                });
            }
            mask.show();
        },
        orderDetailAction: function (e) {
            var me = this;
            var ticketsCnt = me.vPassenger.getTicketsCount(passengerQueryStore);
            var isPaybtn = $(e.target).hasClass('j_btn');
            if (View.isShowLoad || isPaybtn || (!ticketsCnt[0] && !ticketsCnt[1] && !ticketsCnt[2])) {
                return;
            }
            // 组装相应数据结构用来渲染价格清单模板
            var flightDetailData = flightDetailsStore.get();
            var items = flightDetailsStore.getAttr('items');
            var selInsure = flightOrderStore.getAttr('selInsure');
            var insure_detail = me.$el.find('#insure_detail');
            var needDeliveryCost = !!(flightDeliveryStore.getAttr('type') == 32 && flightDeliveryStore.getAttr('paytype') == 2);
            var couponBalance = flightDetailsStore.getAttr('flightDetailsStore.setAttr');
            var user = userStore.getUser();
            var orderDetailData = {
                items: flightDetailsStore.getAttr('items'),
                ticketsCnt: ticketsCnt,
                insurance: (selInsure && flightDetailData.insurances && flightDetailData.insurances.length) ? { amount: insure_detail.data('unitprice'), count: parseInt(insure_detail.data('pcount')) * parseInt(insure_detail.data('mininsure')) } : null,
                delivery: needDeliveryCost ? { amount: 10, count: 1 } : null,
                coupon: null,
                reduce: null
            };
            var hideOrderDetail = function (evt) {
                if (!$(evt.target).hasClass('j_orderDetails')) {
                    me.elsBox.orderDetail.hide().html('');
                    $('#order-detail-mask').hide();
                    payBox.css('z-index', 999);
                    $('.j_orderDetails').removeClass('money-btn-detailon');
                }
            };
            
            if (flightOrderStore.getAttr('selCoupons') && couponBalance && +couponBalance > 0 && user && user.IsNonUser == false && (+items[0].policy.rebateAmt > 0 || (items.length > 1 && +items[1].policy.rebateAmt > 0))) {
                orderDetailData.coupon = { amount: parseInt(items[0].policy.rebateAmt), count: orderDetailData.ticketsCnt[0] };
                orderDetailData.coupon += items.length > 1 ? parseInt(items[1].policy.rebateAmt) : 0;
            }

            $('body').unbind('click', hideOrderDetail).bind('click', hideOrderDetail);
            var payBox = $('#paybtn');
            var payZindex = parseInt(payBox.css('z-index'));
            
            if (me.elsBox.orderDetail.html()) {
                me.elsBox.orderDetail.hide().html('');
                $('#order-detail-mask').hide();
                payBox.css('z-index', payZindex - 4000);
                $('.j_orderDetails').removeClass('money-btn-detailon');

            } else {
                me.elsBox.orderDetail.html(me.orderDetailtplfun(orderDetailData));
                me.elsBox.orderDetail.show();

                $('#order-detail-mask').show();
                payBox.css('z-index', payZindex + 4000);
                $('.j_orderDetails').addClass('money-btn-detailon');
            }

            e.stopImmediatePropagation();
        },
        // 显示错误提示信息
        showErrorTips: function (errorType, errorMessage, id, scrolFlag) {
            scrolFlag = typeof scrolFlag === 'undefined' ? false : scrolFlag;
            errorType = errorType || DataControl.errorType;
            errorMessage = errorMessage || DataControl.errorMessage;

            id = typeof id === 'undefined' ? '' : id;
            var selector = id ? 'li[data-id="' + id + '"] ' + errorType : errorType;
            Futility.showTip(DataControl.tipIconType || DataControl.TIPICONS.RED, selector, errorMessage, scrolFlag);
        },
        hideErrorTips: function (selector) {
            if (selector && selector.currentTarget) {
                $(selector.currentTarget).parent().find('.form-tips').hide();
            } else {
                $(selector).parent().find('.form-tips').hide();
            }
        },
        touchStartAction: function (e) {
            var pageY = e.changedTouches[0].pageY;
            $(e.currentTarget).bind('touchend', function (e2) {
                if (Math.abs(pageY - e2.changedTouches[0].pageY) <= 10) {
                    $(e.currentTarget).focus();
                    $(e.currentTarget).unbind('touchend');
                }
            });
        },
        
        viewInsure: function (e) {          // 查看保险信息
            // update by rhhu 
            var url = '#insuranceinfo!' + $(e.currentTarget).attr('data-typeid');
            _this.vInsurance.viewInsure(url);
        },
        /*
        * 选择配送方式
        * */
        selDelivery: function (e) {     //Vouchers
            //flightDetailsStore
            //this.showAlert
            var flightDetailsData = flightDetailsStore.get();
            if (!flightDetailsData) {
                this.showAlert();
                return;
            }
            this.forward('#zqInPickTicketSelect');
        },
        /**
        * 保险switch按钮回调
        */
        switchInsure: function (_this) {
            var $this = this;
            var insure_detail = $this.$el.find('#insure_detail'),
                insure_detail_i = insure_detail.find('em i'),
                isSelInsure = _this.getStatus() ? 1 : 0,
                validSelCount = passengerQueryStore.getAttr('validSelCount');

            if (isSelInsure && (+flightOrderStore.getAttr('selInsure') != isSelInsure)) { //open 
                insure_detail.data('pcount', validSelCount);
                insure_detail_i.html(insure_detail.data('pcount') * insure_detail.data('mininsure'));
            } else if (!isSelInsure && (+flightOrderStore.getAttr('selInsure') != isSelInsure)) {
                insure_detail_i.html(0);
            }

            flightOrderStore.setAttr('selInsure', isSelInsure);
            this.updateOrderPrice();
            mdStore.setAttr('IsCancelInsurance', !isSelInsure);    //埋点IsCancelInsurance

            this.vTravelPackages.togglePackageDesc(isSelInsure);
        },
        fnAdjustData: function(DelItemsData, flightDeliveryData ){         //non of the main business
            var me = this;
            var fee = DelItemsData[0] ? DelItemsData[0].exinfo.fee : 0;
            var supportDel = DelItemsData.some(function (v) {
                // Update paytype
                if (flightDeliveryData.type == v.type && v.exinfo && v.exinfo.pays) {
                    if (v.exinfo.pays.length < 2 && (!v.exinfo.pays[0] || (v.exinfo.pays[0] && v.exinfo.pays[0].paytype != 0))) { // 加入收快递费10元钱
                        v.exinfo.pays.push({ paytype: 0, amount: 0 });
                    }
                    var supportPaytype = v.exinfo.pays.some(function (pay) {
                        if (pay.paytype == 2 || pay.paytype == 0) {
                            fee = DelItemsData[0].exinfo.fee; // 收费快递费用
                        }
                        return pay.paytype == flightDeliveryData.paytype;
                    });
                    if (!supportPaytype) { // Store 里的paytype 在pays里匹配不到则重新设置paytype，否则保持paytype不变
                        flightDeliveryStore.setAttr('paytype', me.getPayType(v.exinfo.pays));
                        flightDeliveryData = flightDeliveryStore.get(me.UserID);
                    }
                }
                return flightDeliveryData.type == v.type;
            });
            if (!supportDel) {
                flightDeliveryData = { type: 1 };
                flightDeliveryStore.setAttr('type', 1, me.UserID);
            }
            return {
                flightDeliveryData: flightDeliveryData ,
                fee : fee
            };
        },
        /*
        * 模板数据渲染
        * */
        renderList: function (data) {
            var me = this;
            var flightDeliveryData = flightDeliveryStore.get(me.UserID) || { type: 1 };
            var paytype = flightDeliveryData.paytype;
            var DelItemsData = me.DelItemsData;
                
            if (!DelItemsData.length) {//增加配送方式的容错处理 郑开文 2014-8-26 bug：0056112      XXX
                flightDeliveryData = { type: 1 };
                flightDeliveryStore.setAttr('type', 1, me.UserID);
            } else if (DelItemsData && DelItemsData.length) {
                var adjustedData = me.fnAdjustData(DelItemsData, flightDeliveryData );
                flightDeliveryData = adjustedData.flightDeliveryData;
                fee = adjustedData.fee;
            }

            var postType = +flightDeliveryData.type;
            var postAddressData = postType == 2 ? postAddressStorage.get(me.UserID) : postType == 16 ? airportDeliveryStore.get() : null;
            var delivery = {
                fee: (postType == 32 && (flightDeliveryData.paytype == 2 || flightDeliveryData.paytype == 0)) ? fee : 0,
                sendFee: fee, // 快递费用
                type: postType
            };
            flightDeliveryStore.setAttr('deliveryInfo', delivery); //  保存配送方式及费用
            
            data.post = delivery;
            me.vFlightInfo.renderList(data);
            me.vInsurance.render(data);                            //update by rhhu (绑定保险模板)
            me.vVouchers.renderInvoice(DelItemsData, data, flightDeliveryData, paytype, invoice_switch);
            me.contextWeaver(DelItemsData, data, flightDeliveryData, paytype, Calendar);

            //查询消费券并绑定
            me.i_QueryCustomerCoupon( data);
            
            // update by rhhu  旅行套餐  
            me.vTravelPackages.render(data, packageSelectStore, passengerQueryStore);
            // 公告
            me.elsBox.notice_box.html(this.noticetplfun(data));
            //绑定消费券
            //            this.elsBox.coupons_box.html(this.couponstplfun(data));
            //绑定支付信息
            data.payAmt = me.vPayment.i_accountTotalPrice();
            me.elsBox.pay_box.html(me.paytplfun(data)).show();
            me.$el.find('#flightBox').show();
            //建行
            if (flightCCBStore.getAttr("isCCB")) {
                me.$el.find("#js_flight-top").hide();
                me.$el.find(".flight-loginline-fixed").hide();
                me.$el.find(".flight-loginline").hide();
            }
        },
        contextWeaver: function (DelItemsData, data, flightDeliveryData, paytype, Calendar) {
            var me = this;
            if (flightDeliveryData.type == 16 || (DelItemsData.length == 1 && DelItemsData[0].type == 16)) {
                flightDeliveryData.type = 16;
                me.$el.find('#invoice_switch').attr('data-type', 16);
                me.vVouchers.updateZqAir(me, Calendar ); //更新机场自取模板
            } else {
                if (DelItemsData.length) {
                    me.vVouchers.updateAddrList(); //更新邮寄地址模板
                }
            }
            var flightOrderData = flightOrderStore.get() || {};
            if ((+data.flag & 4) != 4) {
                var insure_switch = new cUI.cuiSwitch({
                    rootBox: me.$el.find('#insure_switch'),
                    // update by rhhu (add check flightOrderData has selInsure)
                    checked: (flightOrderData["selInsure"]) ? flightOrderData["selInsure"] : false,
                    changed: function () {
                        me.switchInsure(this);
                    }
                });
                if (data.insurances && data.insurances.length && flightOrderData.selInsure) { // 根据保险开关来显示或隐藏保险说明链接
                    $('#package-desc a:nth-of-type\(1\)').show();
                } else {
                    $('#package-desc a:nth-of-type\(1\)').hide();
                }
            }
        },
        //查询消费券余额
        i_QueryCustomerCoupon: function (detaildata) {         //Coupon
            if (!userStore.isLogin()) {
                return;
            }
            var me = this;
            var tempCouponstplfun = me.couponstplfun;
            var pcount = 0;
            var passengerInfo = passengerQueryStore.get();
            if (passengerInfo && passengerInfo.passengers) {
                $.each(passengerInfo.passengers, function (index, p) {
                    if (p.selected == 1 && (p.ticketType == 1)) {
                        pcount++;
                    }
                });
            }
            if (!detaildata.user) {
                detaildata.user = userInfo;
            }
            if (!detaildata.order) {
                detaildata.order = flightOrderStore.get() || {};;
            }
            detaildata.CRCount = pcount;
            customerCouponModel.excute(function (data) {
                if (data.amt >= 0) {
                    detaildata.couponBalance = data.amt;
                    flightDetailsStore.setAttr("couponBalance", data.amt);
                    me.renderCouponBox(detaildata);
                }
            }, function (error) {
                detaildata.couponBalance = 0;
                flightDetailsStore.setAttr("couponBalance", 0);
                me.renderCouponBox(detaildata);
            }, true, me);

        },
        renderCouponBox: function (detaildata) {
            var me = this;
            if (detaildata && detaildata.couponBalance && +detaildata.couponBalance > 0 && detaildata.user && detaildata.user.IsNonUser == false && (+detaildata.items[0].policy.rebateAmt > 0 || (detaildata.items.length > 1 && +detaildata.items[1].policy.rebateAmt > 0))) {
                me.elsBox.coupons_box.html(me.couponstplfun(detaildata));
                var coupons_switch = new cUI.cuiSwitch({        // 消费券启用开关
                    rootBox: me.$el.find('#coupons_switch'),
                    checked: !!(detaildata.order && detaildata.order.selCoupons && (+detaildata.order.selCoupons) > 0),
                    changed: function () {
                        me.couponsSwitchAction(this); //是否使用消费券返现
                    }
                });
            } else {
                me.elsBox.coupons_box.html('');
            }
        },
        //XXX
        showRebate: function (e) {
            var target = $(e.currentTarget);
            var amt = target.attr('data-rbt'),
                rbtType = target.attr('data-rbtType');
            if (amt && +amt > 0) {
                var $rbtDesc = target.find('span.jsArrow');
                if ($rbtDesc.hasClass('sjTop')) {
                    target.find('p.jsrbt' + rbtType).show();
                    $rbtDesc.addClass('sjBottom');
                    $rbtDesc.removeClass('sjTop');
                } else {
                    target.find('p.jsrbt' + rbtType).hide();
                    $rbtDesc.removeClass('sjBottom');
                    $rbtDesc.addClass('sjTop');
                }
            }
        },
        //flightinfo
        fanBoxAction: function (e) { //查看返现信息
            if (View.isShowLoad) {
                    return;
            }
            var info = $('.j_refundPolicyTips').html();
            Futility.popUp(this.$el, info);
        },
        // 使用消费券返现
        couponsSwitchAction: function (scope) {
            //flightOrderStore
            var isSelCoupons = 0;
            flightOrderData = flightOrderStore.get();
            flightOrderData = flightOrderData ? flightOrderData : {};
            if (scope.getStatus()) {
                isSelCoupons = 1;
            }
            flightOrderStore.setAttr('selCoupons', isSelCoupons);
        },
        //报销凭证
        getPayType: function (pays) {
            //this.DelItemsData
            if (typeof pays === 'undefined') {
                if (this.DelItemsData && this.DelItemsData[0] && this.DelItemsData[0].exinfo) {
                    pays = this.DelItemsData[0].exinfo.pays || [];
                }
            }
            return pays.length ? pays[0].paytype : 0;
        },
        //报销凭证
        getExInfoByPayType: function (flightDeliveryStore, paytype, pays) {
            //flightDeliveryStore
            var payInfo = null;
            pays = pays || flightDeliveryStore.getAttr('pays') || [];

            $(pays).each(function (index, pay) {
                if (pay.paytype == paytype) {
                    payInfo = pay;
                    return false;
                }
            });
            return payInfo;
        },
        // 报销凭证  vVouchers.js
        showDelListUI: function (e) { //选择配送方式UI
            var me = this;
            var target = $(e.currentTarget);
            var flightDeliveryData = flightDeliveryStore.get(this.UserID) || {
                type: 1
            };
            var index = 0;
            if (this.DelItemsData.length <= 1) return;
            _.each(this.DelItemsData, function (n, m) {
                if (n.type == flightDeliveryData.type) {
                    index = m;
                }
            });
            var DelList = new c.ui.ScrollRadioList({
                title: '配送方式',
                index: index,
                data: this.DelItemsData,
                itemClick: function (item) {
                        _this.$el.find(".js_del_tab span.flight-section-sp1").text(item.key);
                    var preType = flightDeliveryStore.getAttr('type');
                    var deliveryInfo = flightDeliveryStore.getAttr('deliveryInfo');
                    var paytype = flightDeliveryStore.getAttr('paytype');
                
                    flightDeliveryStore.setAttr('type', item.type, this.UserID);
                    _this.trigger(_this.EVENTS.UPDATEORDERPRICE);
                    _this.$el.find("#invoice_switch").data("type", item.type);
                    if (item.type == 16) { // 机场自取
                        //_this, c, cbase, Calendar,
                            //flightSearchStore, flightDetailsStore, zqInAirportSelectStore, selFlightInfoStore, airportDeliveryStore
                        _this.vVouchers.updateZqAir(me, Calendar);
                        postAddressStorage.setAttr("edit", 0, this.UserID);
                    } else {
                        _this.vVouchers.updateAddrList();
                    }
                    if (item.type != 32) { // 快递方式
                        $(".js_del_cost .flight-bxinfo-box").hide();
                        $('#gift-card-tips').hide();
                    } else {
                        $(".js_del_cost .flight-bxinfo-box").show();
                            $(".js_del_cost .flight-bxinfo-box").removeClass('js_hide');
                        $('#gift-card-tips').show();
                    }
                }
            });
            DelList.show();
        },
        AddrListAction: function () { //选择邮寄地址          vVouchers
                var addrListModel = CPageModel.CustomerAddrQueryModel.getInstance();
            addressStore.setCurrent(this.UserID, {
                success: '/webapp/flight/#bookinginfo',
                defeated: '/webapp/flight/#bookinginfo'
            }, 'CustomerAddrStore:setAddr', 'CustomerAddrStore:get');
               
                if (userStore.isLogin()) {
                    addrListModel.excute(function (data) {
                        if (!_.isArray(data.addrs) || !data.addrs.length) {			//当返回的数据格式有问题时
                            postAddressStorage.setAttr("opr", 1);
                            postAddressStorage.set(postAddressStorage.get(), this.UserID)
                            this.jump('/webapp/fpage/#addressinfo?from=bookinginfo')
                        }
                        else {
                            this.jump('/webapp/fpage/#addresslist')
                    }
                    }, function (data) {
                        postAddressStorage.setAttr("opr", 1);
                        postAddressStorage.set(postAddressStorage.get(), this.UserID)
                        this.jump('/webapp/fpage/#addressinfo')
                    }, true, this);

                }
            else {
                    postAddressStorage.setAttr("opr", 1);
                postAddressStorage.set(postAddressStorage.get(), this.UserID)
                    this.jump('/webapp/fpage/#addressinfo?from=bookinginfo')
            }
        },
        selectCityAction: function () { //城市地区选择            vVouchers
            //postAddressStorage
            //selAddrStore
            //postCityStore
            //postCityModel
            //this ,MultipleScrollList
            var selData = postAddressStorage.get(this.UserID);
            selAddrStore.set({
                'prvnId': selData.prvnId,
                'prvnName': selData.prvnName,
                'prvn': selData.prvnName,
                'ctyId': selData.ctyId,
                'ctyName': selData.ctyName,
                'cty': selData.ctyName,
                'dstrId': selData.dstrId,
                'dstrName': selData.dstrName,
                'dstr': selData.dstrName
            }, this.UserID);

            var self = this;
            var data = postCityStore.get();
            if (!data) {
                this.showLoading();
                postCityModel.excute(function (data) {
                    postCityStore.set(data);
                    complete.call(self);
                }, function (e) {
                    this.showMessage('网络连接失败,请稍候重试');
                    this.hideLoading();
                }, true, this);
            } else {
                complete.call(this);
            }
            //postCityStore
            function complete() {
                this.hideLoading();
                var provinces = postCityStore.get();
                var citiesOfPrvn = provinces[0].citys;
                var contriesOfCity = citiesOfPrvn[0].contries;
                var selProvice = provinces[0];
                var getItemIndexById = function (id, attr, list) {
                    var index = 0;
                    _.each(list, function (item, i) {
                        if (item[attr] == id) {
                            index = i;
                            return false;
                        }
                    });

                    return index;
                };
                var prvnIndex = 1, cityIndex = 1, contryIndex = 0;
                if (selData.prvnId) {
                    prvnIndex = getItemIndexById(selData.prvnId, 'treeKey', provinces);
                    selProvice = provinces[prvnIndex];
                    citiesOfPrvn = selProvice.citys;
                    cityIndex = getItemIndexById(selData.ctyId, 'treeKey', citiesOfPrvn);
                    contriesOfCity = citiesOfPrvn[cityIndex].contries;
                    contryIndex = getItemIndexById(selData.dstrId, 'treeKey', contriesOfCity);
                }
                provinces.forEach(function (item, index) {
                    item.key = item.prvn;
                    item.value = item.name;
                });
                citiesOfPrvn.forEach(function (item, index) {
                    item.key = item.cty;
                    item.value = item.name;
                });
                contriesOfCity.forEach(function (item, index) {
                    item.key = item.treeKey;
                    item.value = item.name;
                });
                var provinceChange = function (item) {
                    citiesOfPrvn = item.citys;
                    contriesOfCity = item.citys[0].contries;
                    mutipleScrollList.updateScrollListByIndex(1, citiesOfPrvn);
                    mutipleScrollList.updateScrollListByIndex(2, contriesOfCity);
                };
                var cityChange = function (item) {
                    contriesOfCity = item.contries;
                    mutipleScrollList.updateScrollListByIndex(2, contriesOfCity);
                };
                var contryChange = function (item) { };
                var mutipleScrollList = new MultipleScrollList({
                    title: '选择所在地区',
                    data: [provinces, citiesOfPrvn, contriesOfCity],
                    index: [prvnIndex, cityIndex, contryIndex],
                    changed: [
                        provinceChange,
                        cityChange,
                        contryChange
                    ],
                    disItemNum: 4,
                    cancel: '取消',
                    ok: '确定',
                    okClick: function (items) {
                        $('#selectCity .flight-listsim3-table > span').html(items[0].name + '' + items[1].name + '' + items[2].name);
                        postAddressStorage.setAttr('prvnId', items[0].prvn, _this.UserID);
                        postAddressStorage.setAttr('prvnName', items[0].name, _this.UserID);
                        postAddressStorage.setAttr('ctyId', items[1].cty, _this.UserID);
                        postAddressStorage.setAttr('ctyName', items[1].name, _this.UserID);
                        postAddressStorage.setAttr('dstrId', items[2].id, _this.UserID);
                        postAddressStorage.setAttr('dstrName', items[2].name, _this.UserID);
                    }.bind(this)
                });
                mutipleScrollList.show();
            }
        },

            //发票抬头输入事件
            inTitleChangeWrp: function () { // vVouchers
                _this.vVouchers.inTitleChange( Futility.hideTip);
        },
            //点击进入发票抬头选择列表
        showinTitleList: function () {
            if (userStore.isLogin()) {    //已登录 进入发票抬头列表页
                //this.jump('/webapp/invoice/d.html#invoicelist?businesstype=flight');
                /*配置回调*/
                invoiceURLStore.setCurrent(
                    'invinfo.addr',                                             //标识
                    {
                    success: '/webapp/flight/#bookinginfo',                   //设置返回时的地址
                    defeated: '/webapp/flight/#bookinginfo'                    //设置完成时的地址
                }, '', '', 'flight');
                this.jump('/webapp/invoice/index.html#select?businesstype=flight');
            } else {  //未登录 跳到登录页面
                this.showLoading();
                window.location.href = '/webapp/myctrip/#account/login?t=1&from=' + encodeURIComponent(this.getRoot() + '#bookinginfo');
            }
        },
//XXXX
        showCalendarUI: function (airportDeliveryStore, Calendar, _this) { //日历控件UI
            var selectedDate = airportDeliveryStore.getAttr("time");
            _this.calendar = new Calendar({
                date: {
                    start: {
                        title: function (date, sformat) {
                            return sformat(
                                date);
                        },
                        value: selectedDate
                    }
                },
                title: '取票日期',
                Months: 6,
                callback: function (date) {
                    _this.zqTimeObj.defaHourList = _this.zqPrintDetail(_this.zqTimeObj.validDate, date);            //XXX:zqTimeObj
                    if (_this.zqTimeObj.defaHourList.length > 0) {
                        var defaHour = _this.zqTimeObj.defaHourList[_this.zqTimeObj.defaHourList.length - 1];
                        date.setHours(defaHour.slice(0, 2), defaHour.slice(3));
                    }
                    airportDeliveryStore.setAttr("time", date.toString());
                    _this.zqTimeObj.selectDate = date;

                    //_this, c, cbase, Calendar,
                        //flightSearchStore, flightDetailsStore, zqInAirportSelectStore, selFlightInfoStore, airportDeliveryStore
                    _this.vVouchers.updateZqAir(_this, Calendar );
                    _this.$el.show();
                    this.hide();
                    window.scrollTo(0, _this.scrollPosY);
                },
                onHide: function () {
                    _this.$el.show();
                },
                classNames: 'calen-cls'
            });
        },

        showZqTimeUI: function (e) { //选择取票时间UI
            //_this.zqTimeObj
            //airportDeliveryStore
            var target = $(e.currentTarget);
            var index = 0,
                HourData = [],
                defaHour = c.base.Date.parse(_this.zqTimeObj.selectDate.toString()).format("H:i");
            _.each(this.zqTimeObj.defaHourList, function (n, m) {
                HourData.push({
                    key: m,
                    val: n
                });
                if (defaHour == n) {
                    index = m;
                }
            });

            var DelList = new c.ui.ScrollRadioList({
                title: '取票时间',
                index: index,
                data: HourData,
                itemClick: function (item) {
                    _this.zqTimeObj.selectDate.setHours(item.val.slice(0, 2), item.val.slice(3));
                    _this.$el.find("#date-zqtime span").html(item.val);
                    airportDeliveryStore.setAttr("time", _this.zqTimeObj.selectDate.toString(), this.citykey);
                }
            });
            DelList.show();
        },
        //XXXX
        calendarAction: function () { //日历选择
            //airportDeliveryStore, Calendar, _this
            if (this.calendar || this.showCalendarUI(airportDeliveryStore, Calendar, _this)) {
                //this._updateSelectDate();
                this.calendar.update({
                    'validStartDate': new Date(this.zqTimeObj.validDate[0][0]),
                    'validEndDate': new Date(this.zqTimeObj.validDate[this.zqTimeObj.validDate.length - 1][1])
                });
                this.scrollPosY = $(window).scrollTop();
                window.scrollTo(0, 0)
                this.$el.hide();
                this.calendar.show();
            }
        },
        
        //voucher
        zqinairselect: function () { //机场自取柜台选择
            this.forward('zqInAirportSelect');
        },
        //XXXX
        zqPrintDetail: function (interval, ticketsDate) {
            if (typeof ticketsDate === "string") {
                ticketsDate = new Date(ticketsDate);
            }
            var len = interval.length,
                date = [], us, i = 0, bool = true,
                mouth = ticketsDate.getMonth();
            day = ticketsDate.getDate();
            if (!len) return date;
            for (; i < len; i++) {
                var set = interval[i];
                for (var k = 0, le = set.length; k < le; k++) {
                    if (set[k].getMonth() === mouth && set[k].getDate() === day) {
                        us = set;
                        break;
                    }
                }
            }

            if (!us) return date;
            var star = us[0],
                end = us[1],
                starTime = star.getTime(),
                endTime = end.getTime(),
                endminu = end.getMinutes(),
                endhour = end.getHours();
            while (starTime <= endTime) {
                var newDate = new Date(starTime),
                    hours = newDate.getHours(),
                    minutes = newDate.getMinutes();
                if (bool) {
                    bool = false;
                    if (minutes) {
                        minutes > 30 ? newDate = new Date(starTime = starTime + (60 - minutes) * 60 * 1000) : newDate = new Date(starTime = starTime + (30 - minutes) * 60 * 1000);
                        hours = newDate.getHours(), minutes = newDate.getMinutes();
                    }
                }
                starTime = starTime + (1000 * 60 * 30);
                date.push((hours < 10 ? "0" + hours : hours) + ':' + (!minutes ? '00' : minutes));
            }
            return date;
        },
        //手机号
        setContact: function (e) {          //
            //flightOrderStore
            var flightOrderData = flightOrderStore.get();
            flightOrderData = flightOrderData ? flightOrderData : {};
            var contact = flightOrderData.contact ? flightOrderData.contact : {};
            //1.若用户填写了联系人或联系手机号码，则记录下来
            var target = $(e.currentTarget);
            var value = target.val().trim();
            
            contact.mphone = value; //记录联系人电话
            flightOrderStore.setAttr('contact', contact);
        },
        /*消费券说明*/
        viewCoupons: function (e) {         //Coupon
            //flightDetailsStore
            //_this.hideLoading(), this.showAlert();
            var flightDetailsData = flightDetailsStore.get();
            if (flightDetailsData) {
                this.forward('#coupons');
            } else {
                _this.hideLoading(); //非渲染
                this.showAlert();
                return;
            }
        },
        //multi
        beforePayAction: function () {              // 分到每个模块的check里面
            //postAddressStorage, flightDetailsStore, userStore, flightDeliveryStore
            //DataControl,
            //addrOprModel
            // 更新passengers 埋点信息
            try {
                //passengerQueryStore, mdStore, showToast
                this.vPassenger.setPassengersMDInfo();
            } catch (e) {
                console.log('beforePayAction: 设置乘机人埋点信息异常');
            }

            var detail = flightDetailsStore.get();
            if (detail && detail.items && detail.items.length > 1) {
                var firstDate = detail.items[0].basicInfo.dTime;
                var secondDate = detail.items[1].basicInfo.dTime;
                if (new Date(firstDate) >= new Date(secondDate)) {
                    this.showAlert("不能提交返程比去程更早起飞的航班组合", false);
                    return;
                }
            }
            // 报销凭证地址校验
            var selData = postAddressStorage.get(userStore.isLogin() ? this.UserID : '');
            var flightDeliveryType = flightDeliveryStore.getAttr("type");
                if (this.DelItemsData.length && flightDeliveryType && (flightDeliveryType == 2 || flightDeliveryType == 32)) {
                
                    if (!this.vVouchers.verifyAddrInput(Futility.showTip, mdStore, selData.recipient, selData.addr, selData.zip)) {
                    mdStore.increaseCntByKey('NextStepNotPassClick'); //埋点NextStepNotPassClick
                    return;
                }
                if (userStore.isLogin()) { //如果登陆保存常用地址
                    addrOprModel.setParam(selData);
                    addrOprModel.excute(function (data) {
                        console.log(data);
                    }, function (error) { console.log(error) });
                }
            }
            //flightDetailsStore, passengerQueryStore, DataControl, flightDetailsStore, passengerQueryStore
            if (this.vPassenger.beforePayValidate() && this.vPassenger.checkSupportCards(flightDetailsStore, passengerQueryStore, DataControl) && this.vPassenger.checkMinPassenger(flightDetailsStore, passengerQueryStore)) {
                if (flightDetailsStore.get() && flightDetailsStore.get().needinv) {
                    //发票抬头验证，若为“空”则弹出提示 wyren@ctrip.com 2014-4-2
                    var flightDeliveryData = flightDeliveryStore.get(this.UserID) || { type: 1 };
                    if (!(+flightDeliveryData.type <= 1)) {   //报销凭证打开状态
                        if (this.$el.find('#js_invoice_title').val() == '') {
                                //this.showToast('请填写发票抬头');
                                Futility.showTip(DataControl.TIPICONS.RED, '#js_invoice_title', '请填写发票抬头', true);
                            mdStore.increaseCntByKey('NextStepNotPassClick'); //埋点NextStepNotPassClick
                            return false;
                        }
                    }
                }

                if (detail.ispackage && packageSelectStore.getAttr("pkgtype", this.UserID) == 2 && !userStore.isLogin()) {
                    this.showAlert("会员才可以使用礼品卡，请先登录", false);
                    return;
                }

                this.payAction();
            } else {
                mdStore.increaseCntByKey('NextStepNotPassClick'); //埋点NextStepNotPassClick
            }
        },
        sendUbt: function () {                      //hidden
            if (window.$_bf && window.$_bf.loaded == true) {
                var pageId = 225001;

                if (typeof window['__bfi'] == 'undefined') { //一个页面只需要判断一次
                    window['__bfi'] = [];
                }

                window.__bfi.push(["_asynRefresh", {
                    page_id: pageId,
                    orderid: _orderID
                }]);

                window.$_bf['asynRefresh']({
                    page_id: pageId,
                    orderid: _orderID
                });

            } else {
                setTimeout($.proxy(this.sendUbt, this), 300);
            }
        },
        /*转入支付2.0*/
       //
        jumpToPaymentV2: function (data) {          //payment
            var self = this;
            flightBookingResultStore.set(data);

            var getRam = function (n) {
                // cUtility.getGuid();
                var rnd = "";
                for (var i = 0; i < n; i++)
                    rnd += Math.floor(Math.random() * 10);
                return rnd;
            };

            if (data["rc"] == 0) {//成功

                var bustype = 101; //国内机票

                var order = {};

                for (var i = 0; i < data["orders"].length; i++) {
                    var o = data["orders"][i];
                    if (o["master"] && o["master"] == true) {
                        order = o;
                    }
                }

                var oid = order["oid"];
                var currency = order["currency"];
                var price = data["amt"] || 0;
                var extno = data["extno"] || "";
                var title = "";
                var auth = data["head"]["auth"];
                var rid = getRam(19); //(+new Date) + ""; //data["rid"] || "0";

                       
                // 生成 token
                var tokenObj = {
                    "oid": oid,
                    "bustype": "101",
                    "from": location.href,
                    "sback": location.origin + "/webapp/flight/#orderresults?rc=0&type=flight&orderid=" + oid,
                    "eback": location.origin + "/webapp/flight/#orderresults?rc=1&type=flight&orderid=" + oid,
                    "rback": location.origin + "/webapp/flight/#orderresults?rc=2&type=flight&orderid=" + oid,
                    "auth": userStore.getUser().Auth,
                    "title": "机票订单",
                    "currency": currency,
                    "amount": price,
                    "extno": extno,
                    "islogin": userStore.isNonUser() ? 1 : 0,
                    "requestid": rid
                };

                var delivery = flightDeliveryStore.get(this.UserID);

                if (data["needInvoice"] == true) {
                    tokenObj["needInvoice"] = data["needInvoice"];
                    tokenObj["invoiceDeliveryFee"] = (+delivery.type == 32 && (delivery.paytype == 0 || delivery.paytype == 2)) ? delivery.deliveryInfo.sendFee : 0;
                    tokenObj["includeInTotalPrice"] = true;
                }

                var token = Crypt.Base64.encode(JSON.stringify(tokenObj));

                // 构建支付URL
                var host = location.host;
                var paymentURL = "https://secure.ctrip.com/webapp/payment2/index.html#index?";

                if (host.match(/^(localhost|172\.16|127\.0)/i)) {
                    //本地环境
                        paymentURL = "https://secure.fws.qa.nt.ctripcorp.com/webapp/payment2/index.html#index?";
                } else if (host.match(/^m.fat/i) || host.match((/^m.test/i))) {
                    //测试环境
                        paymentURL = "https://secure.fws.qa.nt.ctripcorp.com/webapp/payment2/index.html#index?";
                } else if (host.match(/^m\.uat\.qa/i)) {
                    // UAT 环境
                    paymentURL = "https://secure.uat.sh.ctriptravel.com/webapp/payment2/index.html#index?";
                } else if (host.match(/10.\8/ig)) {
                    // 堡垒环境（需要改Hosts）
                    // 10.8.5.10 secure.ctrip.com
                    // 10.8.5.25 wpg.ctrip.com
                    paymentURL = "https://10.8.5.10/webapp/payment2/index.html#index?"
                } else {
                    // 生产环境
                    //paymentURL = "https://secure.ctrip.com/webapp/payment2/index.html#index?";
                    paymentURL = "https://secure.ctrip.com/webapp/payment2/index.html#index?"
                }

                paymentURL += "oid=" + oid + "&bustype=101" + "&token=" + token;

                //----------------------------建行合作-----------------------------------//

                if (flightCCBStore.getAttr("isCCB")) {
                    // 构建扩展信息
                    var osType = flightCCBStore.get().osType;
                    var osVersion = flightCCBStore.get().osVer;
                    var extendObj = {
                        "osType": osType,
                        "osVersion": osVersion,
                        "payWayWhiteList": "EB_CCB"
                    };

                    var extend = Crypt.Base64.encode(JSON.stringify(extendObj));
                    paymentURL += "&extend=" + extend;
                }

                //----------------------------建行合作-----------------------------------//
                try {
                    var masterOid = data.orders[0].oid,
                        orderData = {};
                    orderData["dcity"] = flightSearchData.items[0].dcityName,
                    orderData["acity"] = flightSearchData.items[0].acityName,
                    orderData["wanfan"] = flightSearchData.items.length === 1 ? false : true;
                    orderCreateStore.set(orderData, masterOid);
                } catch (err) {
                    console.log('orderCreateStore设置错误：', err.msg);
                }
                passengerEditStore.remove();

                if (isBookingEditStore.getAttr("Edit")) {
                    isBookingEditStore.remove();
                    passengerQueryStore.remove();
                }

                airportDeliveryStore.remove();
                self.jump(paymentURL);
            } else { //不成功
                self.showToast('支付失败，请稍后再试');

            }
        },
            checkMobileNumber: function (el) {
            var _this = this;
                var linkTel = $(el || '#linkTel').val().trim();
            if (linkTel.length <= 0) {
                //_this.showToast('请填写手机号码。');
                    _this.showErrorTips('#linkTel', '请填写手机号码', undefined, false);
                mdStore.increaseCntByKey('NextStepNotPassClick'); //埋点NextStepNotPassClick
                return false;
            }
            if (linkTel.length < 11) {
                //_this.showToast('请填写正确的手机号码');
                    _this.showErrorTips('#linkTel', '请填写正确的手机号码', undefined, false);
                mdStore.increaseCntByKey('NextStepNotPassClick'); //埋点NextStepNotPassClick
                return false;
            }
            if (!c.utility.validate.isMobile(linkTel)) {
                //_this.showToast('请填写正确的手机号码');
                    _this.showErrorTips('#linkTel', '请填写正确的手机号码', undefined, false);
                mdStore.increaseCntByKey('NextStepNotPassClick'); //埋点NextStepNotPassClick
                return false;
            } else {
                _this.hideErrorTips('#linkTel');
                $('#linkTel').removeClass('highlight');
            }
            return true;
        },
        /*提交订单*/
       //multi
        payAction: function () {
            var _this = this,
                passengersinfo,
                contact,
                pcount = passengerQueryStore.getAttr('selCount'),
                segs_orderCreate;

            var flightDetailsData = flightDetailsStore.get(),
                selFlightInfoData = selFlightInfoStore.get(),
                flightSearchData = flightSearchStore.get();
            //不符合条件提示
            //1. long time not be used。
              if (!flightDetailsData || !flightDetailsData.items || !selFlightInfoData || !selFlightInfoData.depart || !flightSearchData || !flightSearchData.items) {
                _this.hideLoading(); //非渲染

                _this.showAlert('对不起，由于您长时间未操作，订单已失效，请重新查询预订！');
                mdStore.increaseCntByKey('NextStepNotPassClick'); //埋点NextStepNotPassClick
                return;
              }

            //2. already sold out.
              var userInfo = userStore.getUser(),
                  target = _this.$el.find("#paybtn em.fs"),
                  rebateAmt = 0;
            var amt = target.data('amt');
              if (!amt || +amt <= 0) {
                  _this.showAlert('抱歉，您选择的价格舱位已售完，请重新查询选择其它价格舱位预订。', false);
                mdStore.increaseCntByKey('NextStepNotPassClick'); //埋点NextStepNotPassClick
                return;
              }

            //3. 验证是否填写联系人
                if (!_this.checkMobileNumber()) {
                return false;
            }
              var passengerInfo = passengerQueryStore.get();
            var psgInfo = _this.vPassenger.savePassengers(); // 保存乘机人至后台
            
              var passengers = psgInfo.passengers;
              var adultTicketCnt = psgInfo.adultTicketCnt;

              pcount = psgInfo.pcount;
              passengersinfo = flightOrderStore.getAttr("passengersinfo") || [];

              var cnameList = _.compact(_.pluck(passengers, 'name'));
              var cnameFilter = Futility.isRepeatName(cnameList);

            /*5. 重复姓名判断  */
            if (cnameFilter) {
                _this.showAlert('两名乘机人姓名相同：' + cnameFilter + '，请分2张订单提交', false);
                return;
            }

            /*6. 重复订单 */
            var RepeatUrl = "Flight/Domestic/Order/RepeatOrderCheck",
                RepeatData = {};
            if (!_this.isRepeatOrder && userStore.isLogin() && relationship[RepeatUrl] && typeof relationship[RepeatUrl].mappingRequest === "function") {
                
                RepeatData = relationship[RepeatUrl].mappingRequest(passengers, flightDetailsData);
                RepeatData.timeout = 300;
                RepeatOrderCheckModel.setParam(RepeatData);
                _this.vOrder.fnCheckRepeatOrder(); //TODO:
            }

            //非会员直接跳过重复订单检测
            if (userStore.isLogin()) {
                if (!_this.isRepeatOrder) return;
            }

            if (this.vOrder.checkTicketAmount(passengers)) {
                return;
            }

            _this.showLoading(true);
            var flightOrderData = flightOrderStore.get();
            flightOrderData = flightOrderData ? flightOrderData : {};

            if (flightOrderData.selCoupons && +flightOrderData.selCoupons > 0) {
              rebateAmt = $('#coupons_switch').attr('data-rbt');
              flightOrderStore.setAttr('IsNeedFan', 1);
            }

            //联系人信息
            contact = flightOrderData.contact ? flightOrderData.contact : {};
            contact.mphone = $('#linkTel').val().trim();
            flightOrderStore.setAttr('contact', contact);

            //订单信息
            var order = flightOrderData.order ? flightOrderData.order : {};
            if (userInfo && userInfo.Auth) {
              flightOrderStore.setAttr('auth', userInfo.Auth);
              flightOrderStore.setAttr('IsNonUser', userInfo.IsNonUser);
              flightOrderStore.setAttr('ugrade', userInfo.VipGrade);
            } else {
              flightOrderStore.setAttr('auth', '');
              flightOrderStore.setAttr('IsNonUser', true);
              flightOrderStore.setAttr('ugrade', 0);
              flightOrderStore.setAttr('RebateAmount', 0);
              flightOrderStore.setAttr('IsNeedFan', 0);
              rebateAmt = 0;
            }
            
            var flightOrderData = flightOrderStore.get();
            var flightInfos = [];
              var snno = _this.getQuery('snno');                        //渠道过来，带上营销参数
              flightOrderStore.setAttr('preBookExt', snno);
              flightOrderStore.setAttr('AllianceID', '');
              flightOrderStore.setAttr('SID', '');
              flightOrderStore.setAttr('OUID', '');
              order.oid = '';
              order.price = amt;
              order.payType = 1;
              order.issue = true;
              order.rebateAmt = rebateAmt;
              order.flag = flightDetailsData.flag;                      //XXX
              var flightDeliveryData = flightDeliveryStore.get(_this.UserID) || { type: 1 }; //默认不需要配送
              order.deliveryType = flightDeliveryData.type;
              flightOrderStore.setAttr('order', order);
            //保险信息

              //update by rhhu
              var bxQty = _this.vInsurance.getBxQty();
              var sels = _this.vInsurance.getSels();
              var _s = +flightOrderData.selInsure > 0 ? +flightOrderData.selInsure : sels;
              var isSelBX = +_s > 0;
              var insurance = {};
              if (isSelBX && flightDetailsData.insurances && flightDetailsData.insurances.length > 0 && bxQty && +bxQty > 0) {
                  // update by rhhu (insurance & set store)
                  _this.vInsurance.setInsuranceIntoFlightOrderStore(bxQty);

                //航班信息
                var flightInfos = [];
                var item1;
                  
                  var tripType = 1;
                  var selFlightInfoData = selFlightInfoStore.get();
                  item1 = {
                    "no": flightDetailsData.items[0].basicInfo.flightNo, //去程航班号
                    "class": flightDetailsData.items[0].policy.class, //去程舱位 - 大舱位;0:Y(经济舱);2:C(商务舱);3:F(头等舱)
                    "subclass": flightDetailsData.items[0].policy.subclass, //子舱位
                    "dCtyCode": flightDetailsData.items[0].basicInfo.dCtyCode, //出发城市三字码
                    "dCtyId": flightDetailsData.items[0].basicInfo.dCtyId, //出发城市编号
                    "aCtyCode": flightDetailsData.items[0].basicInfo.aCtyCode, //到达城市三字码
                    "aCtyId": flightDetailsData.items[0].basicInfo.aCtyId, //到达城市编号
                    "dPortCode": flightDetailsData.items[0].basicInfo.dPortCode,
                    "aPortCode": flightDetailsData.items[0].basicInfo.aPortCode,
                    "dDate": flightDetailsData.items[0].basicInfo.dTime, //出发时间
                    "aDate": flightDetailsData.items[0].basicInfo.aTime,
                    "ext": flightDetailsData.items[0].ext,
                    "price": flightDetailsData.items[0].policy.price, //去程航班舱位价格
                    "productType": flightDetailsData.items[0].policy.productType //产品类型
                  };
                  flightInfos.push(item1);
                  //如果包含返程，则添加返程查询条件
                  if (selFlightInfoData.arrive && flightDetailsData.items.length > 1 && selFlightInfoData.arrive.cabin && flightSearchData.tripType && (+flightSearchData.tripType) > 1) {
                    tripType = 2;
                    var item2 = {
                      "no": flightDetailsData.items[1].basicInfo.flightNo, //去程航班号
                      "class": flightDetailsData.items[1].policy.class, //去程舱位 - 大舱位;0:Y(经济舱);2:C(商务舱);3:F(头等舱)
                      "subclass": flightDetailsData.items[1].policy.subclass, //子舱位
                      "dCtyCode": flightDetailsData.items[1].basicInfo.dCtyCode, //出发城市三字码
                      "dCtyId": flightDetailsData.items[1].basicInfo.dCtyId, //出发城市编号
                      "aCtyCode": flightDetailsData.items[1].basicInfo.aCtyCode, //到达城市三字码
                      "aCtyId": flightDetailsData.items[1].basicInfo.aCtyId, //到达城市编号
                      "dPortCode": flightDetailsData.items[1].basicInfo.dPortCode,
                      "aPortCode": flightDetailsData.items[1].basicInfo.aPortCode,
                      "dDate": flightDetailsData.items[1].basicInfo.dTime, //出发时间
                      "aDate": flightDetailsData.items[1].basicInfo.aTime,
                      "ext": flightDetailsData.items[1].ext,
                      "price": flightDetailsData.items[1].policy.price, //去程航班舱位价格
                      "productType": flightDetailsData.items[1].policy.productType //产品类型
                    };
                    flightInfos.push(item2);
                  }
                  flightOrderStore.setAttr('flightInfos', flightInfos);
                  flightOrderStore.setAttr('tripType', tripType);
                  flightOrderStore.setAttr('passengers', passengers);
                  if (passengersinfo) {
                    flightOrderStore.setAttr('passengersinfo', passengersinfo);
                  }

                  //配送信息
                  if (+order.deliveryType != 1) {
                    var postAddressData = +order.deliveryType == 2 ? postAddressStorage.get() : +order.deliveryType == 16 ? airportDeliveryStore.get() : null; //
                    var delivery = {};
                    delivery.ticketIssueCty = flightDetailsData.items[0].basicInfo.dCtyCode; //出发城市三字码
                    delivery.date = item1.dDate;
                    if (postAddressData) {
                      if (+order.deliveryType == 2) {
                        //邮寄
                        delivery.dstr = postAddressData.dstrId;
                        delivery.addrId = postAddressData.inforId;
                        delivery.addr = postAddressData.addr;
                        delivery.fee = postAddressData.sndFee && +postAddressData.sndFee > 0 ? (+postAddressData.sndFee) : 0;
                        delivery.bspet = {
                          recipient: postAddressData.recipient,
                          prvn: postAddressData.prvnName,
                          cty: postAddressData.ctyName,
                          dstr: postAddressData.dstrName,
                          zip: postAddressData.zip
                        };
                      }

                      if (+order.deliveryType == 16) {
                        //机场自取
                        delivery.site = postAddressData.site; //柜台所属票点
                        var f = new Date(postAddressData.time);
                        var nDate = cbase.Date.format(f, 'Y-m-d  H:i:s');
                        delivery.date = nDate; //最早送 / 取票时间
                        delivery.port = postAddressData.port; //取票机场三字码,机场自取时必须
                        delivery.fee = postAddressData.fee && +postAddressData.fee > 0 ? (+postAddressData.fee) : 0;
                        delivery.dstr = postAddressData.dstr;
                        delivery.addrId = postAddressData.id;
                        delivery.addr = postAddressData.name;
                      }

                      if (+order.deliveryType == 32) {
                        // 快递
                        delivery.fee = postAddressData.fee && +postAddressData.fee > 0 ? (+postAddressData.fee) : 0;
                        delivery.dstr = postAddressData.dstr;
                        delivery.addrId = postAddressData.id;
                        delivery.addr = postAddressData.name;
                        delivery.bspet = {
                          recipient: postAddressData.recipient,
                          prvn: postAddressData.prvnName,
                          cty: postAddressData.ctyName,
                          dstr: postAddressData.dstrName,
                          zip: postAddressData.zip
                        };
                      }
                    }
                    flightOrderStore.setAttr('delivery', delivery);
                  } else {
                    flightOrderStore.removeAttr('delivery');
                  }
              } else {
                flightOrderStore.removeAttr('delivery');
              }

                var _sales = salesStore.get(),
                    unionData = unionStore.get();

                if (_sales && _sales.sid) {                                     //XXX
                  flightOrderStore.setAttr('sourceId', _sales.sid);
                } else {
                  flightOrderStore.setAttr('sourceId', '');
                }

                if (unionData && unionData.AllianceID && unionData.SID) {
                  flightOrderStore.setAttr('AllianceID', unionData.AllianceID);
                  flightOrderStore.setAttr('OUID', unionData.OUID);
                  flightOrderStore.setAttr('SID', unionData.SID);
                }

                flightOrderSumbitModel.setParamStore(flightOrderStore);
                var data = flightOrderStore.get();
                
            amt = _this.vPayment.i_accountTotalPrice();
                var queryparam = _this.getOrderCreateParam(amt, pcount, bxQty); //拼接下单参数
                amt = queryparam.oinfo.price;
                userInfo = userStore.getUser();
                //埋点
                try {
                  var pas = postAddressStorage.get(_this.UserID);
                  if (pas.prvnName !== '') {
                    mdStore.setAttr('IsDeliveryArea', true); //埋点IsDeliveryArea
                  }
                  _this.widgetHidden.mdSubmit();
                } catch (e) {
                  console.log('埋点', 'payAction');
                }

                /*非登入用户*/
                if (!userStore.isLogin()) {
                  $.ajax({
                    url: '/html5/Account/NonUserLogin',
                    data: contact.mphone,
                    type: 'post',
                    dataType: 'json',
                    timeout: 200000,
                    success: function (dataLogin) {

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

                        _this.orderCreate(queryparam, amt, adultTicketCnt);
                      } else {
                        _this.hideLoading();
                        _this.showAlert('提交订单失败，请重新提交！', false);
                      }
                    },
                    error: function (err) {
                      _this.hideLoading();
                      _this.showAlert('提交订单失败，请重新提交！', false);
                    }
                  });
                } else {
                  /*登入用户*/
                  _this.orderCreate(queryparam, amt, adultTicketCnt);
                }
        },
        /*OPEN API 提交订单*/
       //multi
        orderCreate: function (queryparam, amt, pcount) {           //下单
            flightOrderCreateModel.setParam(queryparam);
            var flightDetailsData = flightDetailsStore.get();
            var flightType = queryparam.oinfo.triptype; //1单程 2往返程
            flightOrderCreateModel.excute(function (data) {
                _this.hideLoading();
                console.log(data);
                data.dcityName = flightDetailsData.items[0].basicInfo.dcname;
                data.acityName = flightDetailsData.items[0].basicInfo.acname;
                var flightDeliveryData = flightDeliveryStore.get(this.UserID) || { type: 1 }; //默认不需要配送

                data.needInvoice = flightDeliveryData.type != 1;
                data.isK = flightDetailsData.items[0].basicInfo.IsK || false;
                if (flightDetailsData.items.length > 1) {
                    data.isK = data.isK || (flightDetailsData.items[1].basicInfo.IsK ? flightDetailsData.items[1].basicInfo.IsK : false);
                }

                data.tripType = flightType;

                if (data.rc == 0) {//成功
                    //###############下单埋点######################//
                    try {
                        var order = {};
                        for (var i = 0; i < data["orders"].length; i++) {
                            var o = data["orders"][i];
                            if (o["master"] && o["master"] == true) {
                                order = o;
                            }
                        }
                        var oid = order["oid"];
                        _orderID = oid;

                        this.sendUbt();


                    } catch (e) {

                    }
                    //###############下单埋点######################//
                    if (data.patarc == 2) {//pata检测结果有变化
                        /*0 = PATA无结果
                        1 = PATA无变化
                        2 = 价格有变化*/
                        var title = "<strong>航司实时价格调整确认</strong></br>";
                        var message = ""; //pata提示内容
                        if (flightType == 1) {//单程
                            var price = flightDetailsData.items[0].policy.price;
                            message = _this.vPayment[_this.vPayment.EVENTS.FORMATPATAMESSAGE](data.priinfos[0].chapri, price, "");
                            if (message) {
                                amt += (data.priinfos[0].chapri - price) * pcount;
                            }
                        }
                        else {
                            for (var i = 0; i < data.priinfos.length; i++) {
                                var p = data.priinfos[i];
                                var price = flightDetailsData.items[p.segno - 1].policy.price;
                                var p = data.priinfos[i];
                                var msg = "";
                                if (p.segno == 1) {
                                    msg = _this.vPayment[_this.vPayment.EVENTS.FORMATPATAMESSAGE](data.priinfos[i].chapri, price, "第一程");
                                }
                                else {
                                    msg = _this.vPayment[_this.vPayment.EVENTS.FORMATPATAMESSAGE](data.priinfos[i].chapri, price, "第二程");
                                }
                                if (msg) {
                                    message += msg;
                                    amt += (data.priinfos[i].chapri - price) * pcount;
                                }
                            }
                        }

                        data["amt"] = amt;

                        if (message) {
                            message = title + message + "<strong >调整后订单总额：&yen;" + amt + "</strong>";
                            _this.alert = new cUI.Alert({
                                title: '提示信息',
                                message: message,
                                buttons: [{
                                    text: '不接受',
                                    click: function () {
                                        flightSearchStore.setAttr("fullCabin", true);
                                        this.hide();
                                        _this.back("list");
                                    }
                                },
                                {
                                    text: '接受',
                                    click: function () {
                                        this.hide();
                                        // _this.showToast(data.rmsg);
                                        _this.jumpToPaymentV2(data);
                                    }
                                }]
                            });
                            _this.alert.show();
                    }
                    } else {
                        data["amt"] = amt;
                        _this.jumpToPaymentV2(data);
                    }
                } else if (data.rc == 1) {
                    _this.showToast(data.rmsg);
                }
            }, function (error) {
                _this.hideLoading();
                if (+error.head.errcode == 1005) {
                    _this.showAlert("用户信息已过期，请重新登录！", false);
                }
                else {
                    _this.showAlert(error.rmsg || error.msg, false);
                }
                console.log(error);
            }, false, this);
        },
        //拼接open api 下单的参数
        //next step
        getOrderCreateParam: function (amt, pcount, bxQty) {//common functions
            var param = {
                ver: 0,
                hver: '',//当前ABTEST版本信息
                optype: 0, //0=Create=创建订单/1=Modify_Unsub=修改未提交订单(订单还未提交时的修改)/2=Modify_sub=修改已提交订单(已提交订单时修改，只有暂改立时需要，目前不支持暂改立)
                oinfo: {}, //订单信息
                segs: [], //行程列表
                prices: [], //价格信息
                prolst: [], //活动信息，目前暂时只支持保险
                pkglst: [], //用户选择的套餐
                needinvoice: false, //是否需要发票
                invoices: [], //发票信息(如果有发票类型需求，需要增加)
                continfo: {}, //联系人信息
                delinfo: {}, //配送信息
                psgs: [], //乘客信息
                psgsettings: [], //乘客产品关系
                misc: {
                    pos: {
                        "ctype": 3,
                        "lati": 31.22013,
                        "longi": 121.358315
                    }

                }//用户信息
            };

            //ABTEST版本信息
            var abtestinfo = $("#ab_testing_tracker").val();
            try {
                param.hver = 'v2.4.8-' + (abtestinfo ? abtestinfo.split(':')[abtestinfo.split(':').length - 1].substring(0, 1) : '');
            } catch (e) {
                param.hver = 'v2.4.8';
            }


            //var fn = (function(passengerQueryStore,flightDetailsStore,selFlightInfoStore,flightSearchStore,packageSelectStore,userStore,flightOrderInfoInviceStore) {
                var passengerInfo = passengerQueryStore.get();
                var CRCount = 0; //返现数量，只计算成人票种
                if (passengerInfo && passengerInfo.passengers) {
                  $.each(passengerInfo.passengers, function (index, p) {
                    if (p.selected == 1 && (p.ticketType == 1)) {
                      CRCount++;
                    }
                  });
                }


                var flightDetailsData =
                        flightDetailsStore.get(),
                    originData = flightDetailsData.originData,
                    selFlightInfoData = selFlightInfoStore.get(),
                    flightSearchData = flightSearchStore.get(); //获取Storage存储的航班查询条件
                if (selFlightInfoData.arrive && flightDetailsData.items.length > 1 && selFlightInfoData.arrive.cabin && flightSearchData.tripType && (+flightSearchData.tripType) > 1) {
                  param.oinfo.triptype = 2; //往返
                }
                else {
                  param.oinfo.triptype = 1; //单程
                }
                if (userStore.isLogin()) {//是否非会员预定
                  param.oinfo.annoy = false;
                }
                else {
                  param.oinfo.annoy = true;
                }

                param.oinfo.chkno = originData.pols[0].chkno; //pata检测结果
                param.oinfo.price = amt; //订单总金额，票价 + 税（机建） + 燃油 + 保险 + 礼品卡 + 配送
                segs_orderCreate = { segno: 0, prdid: originData.prdid, polid: "" };

                var pkgtype = packageSelectStore.get(this.uid).pkgtype; //二选一套餐类型
                var rebateifno = null; //返现信息
                var rebateAmount = 0; //返现总额
                for (var i = 0; i < originData.segs.length; i++) {
                  var seg = originData.segs[i]; //航程信息
                  var policy = originData.pols[i]; //政策信息
                  if (i == 0) {
                    segs_orderCreate.polid = policy.polid;
                  }

                  var prices = policy.prices; //价格信息
                  for (var k = 0; k < prices.length; k++) {
                    var price = prices[k];
                    param.prices.push({ segno: i + 1, psgtype: price.psgtype, price: price.price, fuel: price.fuel, tax: price.tax }); //价格信息
                  }
                  var promos = policy.promos; //活动信息
                  for (var n = 0; n < promos.length; n++) {
                    var pro = promos[n];
                    var count = 0;
                    var promosprice = pro.price;
                    if (pro.promotype > 5) { // 过滤掉服务端不接受的promotion type(此字段也是服务端下发的：（)
                      continue;
                    }
                    /*1=Rebate=返现
                     2=Promote=促销
                     3=Gift=礼品
                     4=Meal=餐饮
                     5=Package=旅行套餐
                     6=Insurance=惠飞宝*/
                    if (pro.promotype == 1) {
                      if (!flightOrderStore.getAttr('selCoupons') || CRCount <= 0) {
                        break;
                      }
                      promosprice = flightDetailsData["items"][i]["policy"]["rebateAmt"]; //返现从航班列表带入 modify by kwzheng 2014-6-18
                      rebateAmount += CRCount * promosprice;
                      rebateifno = { promoctgy: pro.promoctgy, promoid: pro.promoid, promotype: pro.promotype, currency: pro.currency, price: 0, cnt: 1, amount: 0 };
                    }
                    else {
                      count = pcount;
                      var amount = count * promosprice;

                      param.prolst.push({ promoctgy: pro.promoctgy, promoid: pro.promoid, promotype: pro.promotype, currency: pro.currency, price: promosprice, cnt: count, amount: amount });
                    }
                  }
                  if (i == 0) {
                      // update by rhhu
                        param = _this.vTravelPackages.setPaymentParam(policy, param);

                  }
                }
                //往返程合并返现为一条活动记录 add by kwzheng 2014-6-18
                if (rebateifno != null) {
                  //如果消费券余额小于返现金额，则取消费券余额作为返现金额 modify by zhengkw 2014-6-19
                  if (+flightDetailsData.couponBalance < rebateAmount) {
                    rebateAmount = +flightDetailsData.couponBalance || 0;
                  }
                  rebateifno.price = rebateAmount;
                  rebateifno.amount = rebateAmount;
                  param.prolst.push(rebateifno);
                }
                param.needinvoice = flightDetailsData.needinv; //是否需要发票
                if (param.needinvoice) {
                    var userid = userStore.isLogin() ? userStore.getUser().UserID : this.UserID;
                  var iinfo = flightOrderInfoInviceStore.getAttr(userid);
                  var title = "";
                  if (iinfo) {
                    title = iinfo.title;
                  }
                    var invoiceinfo = flightOrderInfoInviceStore.getAttr("invoiceinfo", userid) || {};
                    param.invoices = [{ invtype: invoiceinfo.intype ? +invoiceinfo.intype : 1, title: title, body: "" }];

                }
            //})(passengerQueryStore,flightDetailsStore,selFlightInfoStore,flightSearchStore,packageSelectStore,userStore,flightOrderInfoInviceStore);

            //var fn = (function(_this,flightOrderStore,unionStore,flightDeliveryStore) {
                //发票信息-----------------------------------------------待确认
                var flightOrderData = flightOrderStore.get() || {};

                //营销渠道信息
                var unionData = unionStore.get();
                if (unionData && unionData.AllianceID > 0 && unionData.SID > 0) {
                  param.misc.allianceInfo = {};
                  param.misc.allianceInfo.id = flightOrderData.AllianceID;
                  param.misc.allianceInfo.ouid = flightOrderData.OUID || '';
                  param.misc.allianceInfo.sid = flightOrderData.SID;
                }
                param.continfo.name = null; //联系人名称-----------------------------待确认
                if (flightOrderData.contact) {
                  param.continfo.phone = flightOrderData.contact.mphone;
                }
                var flightDeliveryData = flightDeliveryStore.get(this.UserID) || { type: 1 }; //默认不需要配送
                param.delinfo.delvtype = flightDeliveryData.type;

                if (flightDeliveryData.type == 32) {
                  var paytype = flightDeliveryStore.getAttr('paytype');
                  var payInfo = _this.getExInfoByPayType(flightDeliveryStore, paytype);
                  var fee = flightDeliveryData.deliveryInfo.fee || flightDeliveryData.deliveryInfo.sendFee;
                  if (paytype == 2 || paytype == 0) {
                    param.delinfo.fee = fee;
                    //param.oinfo.price += fee; // 配送费
                  }

                  param.delinfo.extinfo = {
                    "paytype": paytype == -1 ? 2 : paytype,
                    "amount": paytype == -1 ? 0 : payInfo.amount
                  };
                } else {
                  param.delinfo.extinfo = null;
                }

                //配送信息
                if (flightDeliveryData.type != 1) {
                  var postAddressData = (+flightDeliveryData.type == 2 || +flightDeliveryData.type == 32) ? postAddressStorage.get(this.UserID) : +flightDeliveryData.type == 16 ? airportDeliveryStore.get() : null; //
                  var delvadd = {};
                  if (postAddressData) {
                    if (+flightDeliveryData.type == 2 || +flightDeliveryData.type == 32) {
                      //邮寄
                      param.delinfo.sendadd = { recver: postAddressData.recipient, phone: param.continfo.phone, province: postAddressData.prvnName, city: postAddressData.ctyName, zone: postAddressData.dstrName, addr: postAddressData.addr, post: postAddressData.zip };
                    }
                    if (+flightDeliveryData.type == 16) {
                      var f = new Date(postAddressData.time);
                      var nDate = cbase.Date.format(f, 'Y-m-d  H:i:s');
                      //机场自取
                      param.delinfo.delvadd = { siteid: postAddressData.id, ssiteid: postAddressData.site, addr: postAddressData.name };
                      param.delinfo.senddate = nDate;
                    }
                  }
                }
            //})(_this,flightOrderStore,unionStore,flightDeliveryStore);
           //var fn = (function(_this,Futility,passengerInfo,c,param,DataControl){
                //乘机人信息列表
               var self = _this;
               var name = '';
               var isCname = false;
               for (var i in passengerInfo.passengers) {
                 var p = passengerInfo.passengers[i];
                 if (+p.selected == 1) {
                   var formatBirth = null;
                   if (+p.defaIdCard.type == 1) {
                     formatBirth = c.base.Date.parse(Futility.getBirth(p.defaIdCard.no)).format('Y-m-d');
                   }
                   else {
                     formatBirth = c.base.Date.parse(p.birth).format('Y-m-d');
                   }

                   param.psgs.push({
                     psgid: p.inforId.toString().substr(0, 9),
                     psgname: p.language == 'CN' ? p.cname : p.ename,
                     psgnamen: p.ename,
                     psgtype: DataControl.getPsgType(0, p),
                     birth: formatBirth,
                     cnum: p.defaIdCard.no,
                     ctype: p.defaIdCard.type,
                     gender: p.gender,
                     nation: p.natl,
                     ffpinfo: []
                   });
                   param.psgsettings.push({ segno: 0, psgid: p.inforId.toString().substr(0, 9), tkttype: p.ticketType > 0 ? p.ticketType : 1 });
                 }
               }

               param.segs.push(segs_orderCreate);
               
           //})(_this,Futility,passengerInfo,c,param,DataControl);

return param;
        },
        //hidden
        telInputFinish: function (e) {
            var linkTel = $.trim($(e.target).val());
            
                this.checkMobileNumber(e.target);
            
            if (linkTel === '') {
                mdStore.setAttr('IsContactPhone', false); //埋点IsContactPhone
            } else {
                mdStore.setAttr('IsContactPhone', true); //埋点IsContactPhone
            }
            mdStore.setAttr('ContactPhonePass', !!c.utility.validate.isMobile(linkTel)); //埋点ContactPhonePass
        },
            updateTotalPrice: function (curTicketType, preTicketType) {
            this.vPayment[this.vPayment.EVENTS.UPDATETOTALPRICE](curTicketType, preTicketType);
        },
        //套餐二选一
        packageSelect: function () { //common functions

          var _this = this;

                var fn = (function (flightDetailsStore, _this) {
            var flightDetailsData = flightDetailsStore.get();
            if (flightDetailsData) {
              _this.forward("packageselect");
            } else {
              _this.hideLoading(); //非渲染
              _this.showAlert();
              return;
            }
                })(flightDetailsStore, _this);


        },
        //can't be moved ,used by flight info
        showAlert: function (msg, isBack) { //common functions
            var me = this;
            isBack = typeof isBack === 'undefined' ? true : isBack;
            me.alert = new cUI.Alert({
                title: '提示信息',
                message: msg ? msg : '对不起，由于您长时间未操作，订单已失效，请重新查询预订！',
                buttons: [{
                    text: '知道了',
                    click: function () {
                        if (isBack) {
                            me.backAction(1);
                            me.hideLoading();
                        }
                        this.hide();

                    }
                }
                ]
            });
            me.alert.show();
        },
        //can't be deleted. used by vPassenger
        showLoading: function (isMask) { //common functions
            View.isShowLoad = true;
            myLoad.show();

            if (isMask) {
                globalMask = globalMask || new Mask();
                globalMask.show();
            }
        },
        hideLoading: function (isMask) { //common functions
            myLoad.hide();
            View.isShowLoad = false;
            isMask && globalMask ? globalMask.hide() : '';
        }
    });
    View.isShowLoad = false;
    window.__isRequireBookininfoSucc = true;
    
    return View;
    
});

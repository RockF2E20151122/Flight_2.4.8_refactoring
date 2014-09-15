define(["c"],function(a){var b=require("flight/utility/utility"),c={setPassengerById:function(a,b,c){var d=a.get();if(d&&d.passengers.length)for(var e in d.passengers)if(d.passengers[e].inforId==b){d.passengers[e]=c;break}a.setAttr("passengers",d.passengers)},getPassengerById:function(a,b){var c=null,d=b.get();if(d&&d.passengers.length)for(var e in d.passengers)if(d.passengers[e].inforId==a){c=d.passengers[e];break}return c||{}},filterPassengers:function(a){a&&(_.each(a,function(b,c){if("携程客户"==b.cname)return a.splice(c,1),!1;if(!b.language&&1==b.selected){var d="undefined"==typeof b.defaIdCard||!b.defaIdCard||1==b.defaIdCard.type;b.language=d||b.cname||!b.ename?"CN":"EN"}}),this.stores.passengerQueryStore.setAttr("passengers",a))},addPassengerTpl:function(a,b,c,d){this.needDelIcon=d?!0:!1,(!a.get()||c)&&a.set({opr:1,flightType:1,birth:"",biztype:4,cname:"",email:"",ename:"",firstName:"",lastName:"",flag:0,gender:2,idcards:[{opr:1,flag:2,no:"",expiryDate:"2099/1/1",type:1,choose:!0}],inforId:0,mphone:"",fmphone:"",natl:"CN",natlName:"中国大陆",ver:1,defaIdCard:{opr:1,flag:2,no:"",expiryDate:"2099/1/1",type:1,name:"身份证"},ticketType:1,selected:1,edit:!0,empty:!0,language:"CN"}),DataControl.loadPassEditStore();var e=b.get()||{};e.passengers=e.passengers||[];var f=Math.abs(this.parentView.getServerDate().getTime())+Math.round(1e8*Math.random());if(DataControl.PassEditData.inforId=f,a.setAttr("inforId",f),e.passengers.push(DataControl.PassEditData),b.setAttr("passengers",e.passengers,b.getTag()),b.setAttr("flightType","1"),e&&e.passengers){var g=0;for(var h in e.passengers){var i=e.passengers[h];1==+i.selected&&(g+=1)}var j=b.getTag();b.setAttr("selCount",g,j)}this.onInputLogPass()},onInputLogPass:function(b){var c=this,d=!0;this.parentView.$el.find(".js_newName").on("focusout",function(){var a=$(this).parents("li[data-Id]").attr("data-Id");DataControl.PassEditData=c.getPassengerById(a,c.stores.passengerQueryStore),DataControl.PassEditData.cname=$(this).val().replace(/\s/g,""),c.stores.passengerEditStore.setAttr("cname",DataControl.PassEditData.cname),c.setPassengerById(c.stores.passengerQueryStore,a,DataControl.PassEditData);var d=b.validateName(c.parentView,c.parentView.showErrorTips,DataControl.PassEditData.cname,"","",DataControl.PassEditData.defaIdCard.type,!0,a);d&&c.parentView.hideErrorTips('li[data-Id="'+a+'"] .js_newName')}),this.parentView.$el.find(".js_firstName").on("focusout",function(){var a=$(this).parents("li[data-Id]").attr("data-Id"),d="";$(this).val($(this).val().toUpperCase()),DataControl.PassEditData=c.getPassengerById(a,c.stores.passengerQueryStore),DataControl.PassEditData.firstName=$(this).val(),c.stores.passengerEditStore.setAttr("firstName",DataControl.PassEditData.firstName),d=DataControl.PassEditData.firstName||DataControl.PassEditData.lastName?(DataControl.PassEditData.firstName||"")+"/"+(DataControl.PassEditData.lastName||""):"",DataControl.PassEditData.ename=d,c.stores.passengerEditStore.setAttr("ename",d),c.setPassengerById(c.stores.passengerQueryStore,a,DataControl.PassEditData);var e=b.validateFirstName(c.parentView.showErrorTips,DataControl.PassEditData.firstName,!0,a);e&&c.parentView.hideErrorTips('li[data-Id="'+a+'"] .js_firstName')}),this.parentView.$el.find(".js_lastName").on("focusout",function(){var a=$(this).parents("li[data-Id]").attr("data-Id"),d="";$(this).val($(this).val().toUpperCase()),DataControl.PassEditData=c.getPassengerById(a,c.stores.passengerQueryStore),DataControl.PassEditData.lastName=$(this).val(),d=DataControl.PassEditData.firstName||DataControl.PassEditData.lastName?(DataControl.PassEditData.firstName||"")+"/"+(DataControl.PassEditData.lastName||""):"",DataControl.PassEditData.ename=d,c.stores.passengerEditStore.setAttr("ename",d),c.stores.passengerEditStore.setAttr("lastName",DataControl.PassEditData.lastName),c.setPassengerById(c.stores.passengerQueryStore,a,DataControl.PassEditData);var e=b.validateLastName(c.parentView.showErrorTips,DataControl.PassEditData.firstName,DataControl.PassEditData.lastName,a);e&&c.parentView.hideErrorTips('li[data-Id="'+a+'"] .js_lastName')});this.parentView.$el.find(".js_no").on("focusout",function(){var a=$(this).parents("li[data-Id]").attr("data-Id");DataControl.PassEditData=c.getPassengerById(a,c.stores.passengerQueryStore);var e=2==DataControl.PassEditData.defaIdCard.type?$.trim($(this).val()||""):$(this).val().replace(/\s/g,"");c.parentView.$el.find("#sel_idCard option").eq($(this).data("index")).data("no",e),DataControl.PassEditData.idcards[$(this).data("index")].no=e,DataControl.PassEditData.defaIdCard.no=e,c.stores.passengerEditStore.setAttr("idcards",DataControl.PassEditData.idcards),c.stores.passengerEditStore.setAttr("defaIdCard",DataControl.PassEditData.defaIdCard),1==DataControl.PassEditData.defaIdCard.type&&$(this).val(b.formatCardNo(e)),c.setPassengerById(c.stores.passengerQueryStore,a,DataControl.PassEditData);var f=b.checkPassenger(c.parentView,c.parentView.showErrorTips,DataControl.PassEditData,"defaIdCard",a,d),g="#addPassenger li[data-Id='"+a+"'] .js_no";if(f){if(1==DataControl.PassEditData.defaIdCard.type){c.toggleTicketType(b.getBirth(e),g,null,b),DataControl.PassEditData=c.getPassengerById(a,c.stores.passengerQueryStore),DataControl.PassEditData.birth=b.getBirth(e),c.stores.passengerEditStore.setAttr("birth",DataControl.PassEditData.birth),c.setPassengerById(c.stores.passengerQueryStore,a,DataControl.PassEditData);var h=$("#addPassenger > li[data-id='"+a+"'] .js_birth");h.val(b.formatBirth(DataControl.PassEditData.birth)),h.data(key,DataControl.PassEditData.birth)}if(2==DataControl.PassEditData.defaIdCard.type)b.showTip(DataControl.TIPICONS.BLUE,'li[data-id="'+a+'"] .js_no',"请确保姓名、证件号与护照一致",!1);else if(1==DataControl.PassEditData.defaIdCard.type){var i=DataControl.getAge(DataControl.PassEditData.birth),j=DataControl.getPsgType(i),k=2==j?"儿童":"婴儿";if(-1!=DataControl.PassEditData.ticketType){if(c.parentView.hideErrorTips('li[data-Id="'+a+'"] .js_no'),1!=j){var l=c.stores.flightDetailsStore.getAttr("items")[0].policy,m=!l.isApplyChild,n=!l.childPolicy,o=!l.babyPolicy,p="";m||2==j&&n||3==j&&o?(p=m?"该价格不支持"+k+"购买成人票":"该价格不支持购买"+k+"票",b.showTip(DataControl.TIPICONS.BLUE,'li[data-id="'+a+'"] .js_no',p,!1)):c.parentView.hideErrorTips('li[data-Id="'+a+'"] .js_no')}}else b.showTip(DataControl.TIPICONS.RED,'li[data-id="'+a+'"] .js_no',"该价格"+k+"不可订，请选择其他舱位",!1)}else c.parentView.hideErrorTips('li[data-Id="'+a+'"] .js_no')}}),this.parentView.$el.find("input.js_newName,input.js_firstName,input.js_lastName,input.js_no,input.js_birth").unbind("focusin").bind("focusin",this.setCurrentEditPsg.bind(this)),a.ui.InputClear(this.parentView.$el.find('#addPassenger input[type="text"],#addPassenger input[type="tel"],#addPassenger input[type="number"]'),null,null,{top:20,right:0},!0),a.ui.InputClear(this.parentView.$el.find("#addPassenger input.js_firstName,#addPassenger input.js_newName"),null,null,{top:20,right:85},!0)},finishBirthAction:function(a){var c=this,d=$(a.target).parents("li[data-Id]").attr("data-Id");DataControl.PassEditData=c.getPassengerById(d,c.stores.passengerQueryStore);var e=DataControl.getBirth(DataControl.PassEditData);DataControl.PassEditData.birth=$(a.target).data("key")+"",c.stores.passengerEditStore.setAttr("birth",DataControl.PassEditData.birth),c.setPassengerById(c.stores.passengerQueryStore,d,DataControl.PassEditData);var f=b.checkPassenger(c.parentView,c.parentView.showErrorTips,DataControl.PassEditData,"birth",d,!0),g="#addPassenger li[data-Id='"+d+"'] .js_birth";if(f){c.toggleTicketType(DataControl.PassEditData.birth,g,e,b),DataControl.PassEditData=c.getPassengerById(d,c.stores.passengerQueryStore);var h=DataControl.getAge(DataControl.PassEditData.birth),i=DataControl.getPsgType(h),j=2==i?"儿童":"婴儿";if(-1!=DataControl.PassEditData.ticketType){if(c.parentView.hideErrorTips('li[data-Id="'+d+'"] .js_birth'),1!=i){var k=c.stores.flightDetailsStore.getAttr("items")[0].policy,l=!k.isApplyChild,m=!k.childPolicy,n=!k.babyPolicy,o="";l||2==i&&m||3==i&&n?(o=l?"该价格不支持"+j+"购买成人票":"该价格不支持购买"+j+"票",b.showTip(DataControl.TIPICONS.BLUE,'li[data-id="'+d+'"] .js_birth',o,!1)):c.parentView.hideErrorTips('li[data-Id="'+d+'"] .js_birth')}}else b.showTip(DataControl.TIPICONS.RED,'li[data-id="'+d+'"] .js_birth',"该价格"+j+"不可订，请选择其他舱位",!1)}},enameLiveChange:function(a){var b=$(a.currentTarget),c=b.val()||"";c&&/[a-z]/.test(c.substring(0,1))&&b.val(c.toUpperCase())},toggleTicketType:function(a,b,c,d){{var e={ADULT:1,CHILD:2,BABY:3,NEWBORN:4},f=DataControl.getAge(a),g=1,h=DataControl.getPsgType(f),i=this.stores.flightDetailsStore.getAttr("items"),j=(i&&i.length>0?i[0].policy:this.parentView.showAlert(),DataControl.isSupportChild()),k=DataControl.isSupportBaby(),l=this.stores.passengerQueryStore.get(),m=$(b).closest("li[data-id]"),n=m.data("id"),o=m.find(".flight-iptetp"),p=o.data("psgidx"),q=o.find(".flight-iptetp-current");q.length?parseInt(q.data("type")):-1}if(c=d.testBirth(this.parentView.showToast,c)?c:null,c&&(g=DataControl.getPsgType(DataControl.getAge(c))),g!=h||!c)if(h==e.ADULT)o.parent().hide(),$(".flight-tips-etp2").hide(),d.hideTip('li[data-id="'+n+'"] .js_birth'),this.selectTicketType(null,o.find("span:nth-child(1)")[0]);else{if(h===e.CHILD&&!j||h===e.BABY&&!k){var r="该价格"+h===e.CHILD?"儿童":"婴儿不可订，请选择其他舱位";d.showTip(DataControl.TIPICONS.RED,'li[data-id="'+n+'"] .js_birth',r,!1),l.passengers[p].ticketType=-1,o.find("span").each(function(a,b){$(b).removeClass("flight-iptetp-current")}),this.stores.passengerQueryStore.setAttr("passengers",l.passengers),this.updatePassengerInfoHeader(this.stores.flightDetailsStore,this.stores.userStore,this.stores.passengerQueryStore),this.parentView.trigger(this.parentView.EVENTS.UPDATEORDERPRICE)}else{var s=this.getTicketsVisibleStatus(h);this.updateTicketStatus(o,s);var t=this.findLowPriceTicketByPsgType(h);-1!=t&&this.selectTicketType(null,o.find("span:nth-child("+t+")")[0])}this.showWithAdultTip(this.stores.passengerQueryStore)}},getTicketsVisibleStatus:function(a,b){var c=2,d=3,e=this.stores.flightDetailsStore.getAttr("items"),f=e[0].policy,g=!!f.isApplyChild,h=!!f.childPolicy,i=!!f.babyPolicy,j=!(!f.childPolicy||!f.childPolicy.isApply),k=a==d&&i,l=a==d&&j||a==c&&h,m=g&&(k||l),n=[m,l,k];return"undefined"==typeof b?n:n[b-1]},updateTicketStatus:function(a,b){(b[0]||b[1]||b[2])&&a.parent().show(),a.find("span").each(function(a,c){$(c).toggle(b[a])})},setPassengersMDInfo:function(){var a=this,c=a.parentView.showToast,d=this.stores.passengerQueryStore.getAttr("passengers"),e=_.filter(d,function(a){return 1==a.selected}),f=this.stores.mdStore.getAttr("passengers")||{},g=1,h={},i=[];_.each(e,function(d){h=d.defaIdCard||h,g=d.defaIdCard?d.defaIdCard.type:1,d.defaIdCard&&1==g&&(h.birth=b.getBirth(d.defaIdCard.no)),i="undefined"!=typeof d.ename?d.ename.split("/"):["",""],f[d.inforId]=f[d.inforId]||{IsPassengerName:"",PassengerNamePass:"",CredentialsType:"",IsCredentialsNO:"",CredentialsNOPass:""},f[d.inforId].IsPassengerName+=""==f[d.inforId].IsPassengerName?!!d.ename||!!d.cname:","+(!!d.ename||!!d.cname),f[d.inforId].PassengerNamePass+=""==f[d.inforId].PassengerNamePass?b.validateName(a.parentView,c,d.cname,i[0],i[1],g,!1,d.inforId):","+b.validateName(a.parentView,c,d.cname,i[0],name[1],g,!1,d.inforId),f[d.inforId].CredentialsType+=""==f[d.inforId].CredentialsType?DataControl.idCardTypeSort[g].name:","+DataControl.idCardTypeSort[g].name,f[d.inforId].IsCredentialsNO+=""==f[d.inforId].IsCredentialsNO?!(!d.defaIdCard||!d.defaIdCard.no):","+!(!d.defaIdCard||!d.defaIdCard.no),f[d.inforId].CredentialsNOPass+=""==f[d.inforId].CredentialsNOPass?b.validateCard(c,g,h,d.birth,!1):","+b.validateCard(c,g,h,d.birth,!1)}),a.stores.mdStore.setAttr("passengers",f)},hasChildOrBaby:function(a){var c,d="",e={ADULT:1,CHILD:2,BABY:3,NEWBORN:4},f=!1;return $(a).each(function(a,g){1==g.selected&&(d=g.defaIdCard&&1==g.defaIdCard.type&&g.defaIdCard.no?b.getBirth(g.defaIdCard.no)||"":g.birth,d&&(c=DataControl.getPsgType(DataControl.getAge(d)),(c==e.CHILD||c==e.BABY)&&(f=!0)))}),f}};return c});
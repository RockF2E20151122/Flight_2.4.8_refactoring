/**
* @name utility
* @class [常用工具方法集合]
* @description : 常用工具方法集合
*/
define(['c'], function (c) {
    //var DataControl = new vDataControl();
    var birthReg = /^(19[0-9]{2}|20[01]{1}\d{1})(0[1-9]{1}|1[0-2]{1})(0[1-9]{1}|[12]\d{1}|3[01]{1})$/;
    
    var base = {
        isNull: function(argu){     //TODO: move into the utility
            return (typeof argu == "object" && argu == undefined);
        },
        createCallback:  function(fn, args0, args1) {
            var me = this;
            return function() {
                fn.call(me, args0, args1 );
            };
        },
        birthReg : birthReg,
        /**
        * @name NEG.base.ArrayIndexOf
        * @class [返回对象存在数组的index,不存在返回-1]
        * @param {Array} array [操作的数组]
        * @param {Object} el [查找的对象]
        * @returns {number} [返回对象存在数组的Index,不存在返回-1]
        * @example
        * NEG.base.ArrayIndexOf([1,2,3,5],3);
        * 结果：返回 2
        */
        ArrayIndexOf: Array.prototype.indexOf
                    ? function (array, el) {
                        array = [].slice.call(array, 0);
                        return array.indexOf(el);
                    }
                    : function (array, el) {
                        for (var i = array.length, isExist = false; i-- && !isExist; ) {
                            isExist = array[i] === el;
                            if (isExist) {
                                return i;
                            }
                        }
                        return i;
                    },

        QueryStringBuilder: function (baseQueryString) {
            var me = arguments.callee;
            if (!(this instanceof me)) {
                return new me(baseQueryString);
            }

            function getIndex(key) {
                key = key && key.toLowerCase();
                return base.ArrayIndexOf(keyMap, key);
            }

            var keyMap = [];
            var names = [];
            var values = [];
            var model = {};

            if (baseQueryString) {
                var collections = baseQueryString.split('&');
                if (collections) {
                    for (var i = collections.length - 1; i >= 0; i--) {
                        var keyValue = collections[i];
                        var keyValueArr = keyValue && keyValue.split('=');
                        var key = keyValueArr && keyValueArr[0];
                        var value = keyValueArr && keyValueArr[1];
                        if (key) {
                            model[key] = value;
                            set(key, value);
                        }
                    };
                }

            }

            function set(key, value) {
                if (key && value) {
                    //keyMap.push(key.toLowerCase());
                    var index = getIndex(key);
                    if (index >= 0 && index < values.length) {
                        values[index] = value;
                    } else {
                        names.push(key);
                        values.push(value);
                        keyMap.push(key.toLowerCase());
                    }
                    model[key] = value;
                }
                return value;
            }


            function get(key) {

                var result = key ? values[getIndex(key)] : model;
                return result;
                //return key ? model[key] : model;
            }

            function remove(key) {
                var _model = model;
                var index = getIndex(key);
                if (key && index > 0) {
                    delete model[key];
                    names.splice(index, 1);
                    values.splice(index, 1);
                    keyMap.splice(index, 1);
                } else {
                    model = {};
                    names = [];
                    values = [];
                    keyMap = [];
                }
            }

            var encodeURI = function (str) {
                try {
                    str = str ? decodeURIComponent(str) : '';
                } catch (e) { };

                return encodeURIComponent(str).replace(/\*/g, "%2A").replace(/-/g, "%2D").replace(/_/g, "%5F").replace(/\./g, "%2E").replace(/!/g, '%21').replace(/~/g, '%7E').replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29');
            };
            this.set = set;
            this.get = get;
            this.remove = remove;
            this.toString = function (t1, t2) {
                t1 = t1 || '=';
                t2 = t2 || '&';
                var result = [];
                for (var index = 0; index < names.length; index++) {
                    if (values[index]) {
                        result.push(encodeURI(names[index]) + t1 + encodeURI(values[index]));
                    }
                }
                return result.join(t2) || '';
            };

        },
        getDaysOfMonth: function (year, month) {
            var days = 30;

            switch (month) {
                case 1:
                case 3:
                case 5:
                case 7:
                case 8:
                case 10:
                case 12:
                    days = 31;
                    break;
                case 2:
                    days = (year % 4 === 0 && year % 100 !== 0) ? 29 : 28;
                    break;
                default:
                    days = 30;
                    break;
            }

            return days;
         
        },

        sendUbt: function (ubtKey, oParams) {
            var value = "";

            for (var key in oParams) {
                if (oParams.hasOwnProperty(key)) {
                    value += key + '=' + oParams[key] + '&';
                }
            }

            value = value ? value.substring(0, value.length - 1) : value;
            value += '&ver=20140825';

            if (window['$_bf'] && window['$_bf'].loaded === true) {
                window.$_bf.tracklog(ubtKey, value);
            } else {
                setTimeout(function () {
                    window.$_bf.tracklog(ubtKey, value);
                }, 500);
            }
        },
        /*
        * 姓名校验
        * */
        validateName: function (_this, showErrorTips, s_cname, s_firstName, s_lastName, s_type, isAlert, id) {
            DataControl.errorType = '';
            DataControl.errorMessage = '';
            var eNamereg = /^[a-z]+\s*/i,
                cNamereg = /^[\u4e00-\u9fa5]{2,14}$/,
                firstreg = /^[\u4e00-\u9fa5]$/;


            //中文姓名校验规则
            //1. 中文姓名不可少于2个汉字
            //2. 中文姓名不可多于14个汉字
            //3. 中文姓名不能填写英文、数字
            //4. 证件类型为台胞证、回乡证、港澳通行证时，不支持繁体
            if (s_type == 1) {
                if (!s_cname) {
                    DataControl.errorMessage = '请填写姓名';
                    DataControl.errorType = '.js_newName';
                    DataControl.tipIconType = DataControl.TIPICONS.RED;
                    //isAlert ? showToast.bind(_this)(DataControl.errorMessage) : '';
                    isAlert ? showErrorTips(DataControl.errorType, DataControl.errorMessage, id) : '';
                    return false;
                }
                if (!cNamereg.test(s_cname)) {
                    DataControl.errorMessage = '填写正确的中文姓名';
                    DataControl.errorType = '.js_newName';
                    DataControl.tipIconType = DataControl.TIPICONS.RED;
                    //isAlert ? showToast.bind(_this)(DataControl.errorMessage) : '';
                    isAlert ? showErrorTips(DataControl.errorType, DataControl.errorMessage, id) : '';
                    return false;
                }
            }
            //英文姓名校验规则
            //1. 英文姓名长度必须少于29个字符
            //2. 英文姓名必须符合“last/first middle”格式
            //3. 英文姓名不能填写除“/”以外的特殊字符、中文、数字
            //不符合以上条件时，均提示“请填写所持证件上的姓名”
            else {
                //台胞证、回乡证、港澳通行证时，不支持繁体
                var isTestFan = (s_type == 8 || s_type == 7 || s_type == 10);
                if (!base.NoCard_C_E_Name(showErrorTips.bind(_this), s_cname, s_firstName, s_lastName, isTestFan, s_type, isAlert, id)) {
                    return false;
                }
            }
            
            return true;
        },
        validateFirstName: function (showErrorTips, firstName, isAlert, id) {
            var firstNameReg = /^\s*[a-z]+\s*$/i;
            isAlert = typeof isAlert == 'undefined' ? true : isAlert;

            if (firstName == '') {
                DataControl.errorMessage = '请填写姓';
                DataControl.errorType = '.js_firstName';
                DataControl.tipIconType = DataControl.TIPICONS.RED;
                //isAlert ? showToast(DataControl.errorMessage) : '';
                isAlert ? showErrorTips(DataControl.errorType, DataControl.errorMessage, id) : '';
                return false;
            }

            if (!firstNameReg.test(firstName)) {
                DataControl.errorMessage = '请填写正确的英文姓氏';
                DataControl.errorType = '.js_firstName';
                DataControl.tipIconType = DataControl.TIPICONS.RED;
                //isAlert ? showToast(DataControl.errorMessage) : '';
                isAlert ? showErrorTips(DataControl.errorType, DataControl.errorMessage, id) : '';
                return false;
            }

            return true;
        },
        validateLastName: function (showErrorTips, firstName, lastName, isAlert, id) {
            var lastNameReg = /^\s*[a-z]+\s*[a-z]*\s*$/i;
            isAlert = typeof isAlert == 'undefined' ? true : isAlert;

            if (lastName == '') {
                DataControl.errorMessage = '请填写名';
                DataControl.errorType = '.js_lastName';
                DataControl.tipIconType = DataControl.TIPICONS.RED;
                //isAlert ? showToast(DataControl.errorMessage) : '';
                isAlert ? showErrorTips(DataControl.errorType, DataControl.errorMessage, id) : '';
                return false;
            }

            if (!lastNameReg.test(lastName)) {
                DataControl.errorMessage = '请填写正确的名';
                DataControl.errorType = '.js_lastName';
                DataControl.tipIconType = DataControl.TIPICONS.RED;
                //isAlert ? showToast(DataControl.errorMessage) : '';
                isAlert ? showErrorTips(DataControl.errorType, DataControl.errorMessage, id) : '';
                return false;
            }

            if ((firstName + lastName).length > 26) {
                DataControl.errorMessage = '英文姓名不能超过26个字符，如姓名过长请使用缩写，姓氏不能缩写，名可以缩写';
                DataControl.errorType = '.js_enName';
                DataControl.tipIconType = DataControl.TIPICONS.RED;
                //isAlert ? showToast(DataControl.errorMessage) : '';
                isAlert ? showErrorTips(DataControl.errorType, DataControl.errorMessage, id) : '';
                return false;
            }

            return true;
        },
        /** 
         * 根据身份证获取生日
        * */
        getBirth: function (UUserCard) {
            var birth = UUserCard.replace(/\s/g, '').substring(6, 14);
            return birth;
        },
        formatBirth: function (birth) {
            birth = birth || '';
            birth = birth + '';
            if (birth && birth.length == 8) {
                return birth.slice(0, 4) + '年' + birth.slice(4, 6) + '月' + birth.slice(6, 8) + '日';
            } else {
                return '';
            }
        },
        /*
        * 证件号码检验
                身份证
                身份证号码验证规则及验证顺序如下（与H5-2.1原有规则是一致的）
                1. 身份证号码不能为空（纯空格也视为空），否则提示：请填写证件号码
                2. 如果填写了15位身份证号码，需要拦截，并提示：根据国家法律规定，第一代居民身份证自2013年1月1日起停止使用。请填写您的18位身份证号码。
                3. 身份证号码按照国家公布的身份证校验算法校验，否则提示：请填写正确的身份证号码
                4. 证件号码需去首尾全部空格后再保存
        
                非身份证
                非身份证证件号码验证规则及验证顺序如下（比H5-2.1原有规则增加1条）
        1. 证件号码不能为空（纯空格也视为空），否则提示：请填写证件号码
        2. 证件号码去首尾全部空格后，长度<=20字符，否则提示：证件号码不可多余20位
        3. 非身份证证件号码只能是英文或数字，否则提示：证件号码只能是英文或数字
        4. 证件号码需去首尾全部空格后再保存
        */
        validateCard: function (showErrorTips, s_type, s_deCard, s_birth, isAlert, id) {
            isAlert = typeof isAlert === 'undefined' ? true : isAlert;
            DataControl.errorMessage = '';
            DataControl.errorType = '';
            if (s_type == 1) { //是身份证
                s_deCard.no = s_deCard.no.replace(/\s/g, "");
                s_deCard.birth = base.getBirth(s_deCard.no);
                if (!s_deCard.no || !s_deCard.no.length) {
                    DataControl.errorMessage = '请填写证件号码';
                    DataControl.errorType = '.js_no';
                    DataControl.tipIconType = DataControl.TIPICONS.RED;
                    //isAlert ? showToast(DataControl.errorMessage) : '';
                    isAlert ? showErrorTips(DataControl.errorType, DataControl.errorMessage, id) : '';
                    return false;
                }
                if (s_deCard.no.length == 15) {
                    DataControl.errorMessage = '根据国家法律规定，第一代居民身份证自2013年1月1日起停止使用。请填写您的18位身份证号码。';
                    DataControl.errorType = '.js_no';
                    DataControl.tipIconType = DataControl.TIPICONS.RED;
                    //isAlert ? showToast(DataControl.errorMessage) : '';
                    isAlert ? showErrorTips(DataControl.errorType, DataControl.errorMessage, id) : '';
                    return false;
                }
                if (!c.utility.validate.isIdCard(s_deCard.no)) {
                    DataControl.errorMessage = '请填写正确的身份证号码!';
                    DataControl.errorType = '.js_no';
                    DataControl.tipIconType = DataControl.TIPICONS.RED;
                    //isAlert ? showToast(DataControl.errorMessage) : '';
                    isAlert ? showErrorTips(DataControl.errorType, DataControl.errorMessage, id) : '';
                    return false;
                }

                return true;
            }
            if (s_type != 1) { //非身份证
                var eNamereg = /^[A-Za-z0-9]+$/g;
                if (!s_deCard.no || !s_deCard.no.length) {
                    DataControl.errorMessage = '请填写证件号码';
                    DataControl.errorType = '.js_no';
                    DataControl.tipIconType = DataControl.TIPICONS.RED;
                    //isAlert ? showToast(DataControl.errorMessage) : '';
                    isAlert ? showErrorTips(DataControl.errorType, DataControl.errorMessage, id) : '';
                    return false;
                }
                if (s_deCard.no.length > 20) {
                    DataControl.errorMessage = '请填写正确的护照号码';
                    DataControl.errorType = '.js_no';
                    DataControl.tipIconType = DataControl.TIPICONS.RED;
                    //isAlert ? showToast(DataControl.errorMessage) : '';
                    isAlert ? showErrorTips(DataControl.errorType, DataControl.errorMessage, id) : '';
                    return false;
                }
                if (!eNamereg.test(s_deCard.no)) {
                    DataControl.errorMessage = s_type != 2 ? '证件号码只能是英文或数字' : '请填写正确的护照号码';
                    DataControl.errorType = '.js_no';
                    DataControl.tipIconType = DataControl.TIPICONS.RED;
                    //isAlert ? showToast(DataControl.errorMessage) : '';
                    isAlert ? showErrorTips(DataControl.errorType, DataControl.errorMessage, id) : '';
                    return false;
                }
                //如果是户口簿或出生证明
                if (s_type == 25 && s_birth && DataControl.getAge(s_birth) >= 16) {
                    //isAlert ? showToast('年龄已满16岁，不允许使用户口簿') : '';
                    DataControl.errorType = '.js_birth';
                    DataControl.errorMessage = '年龄已满16岁，不允许使用户口簿';
                    DataControl.tipIconType = DataControl.TIPICONS.BLUE;
                    isAlert ? showErrorTips(DataControl.errorType, DataControl.errorMessage, id) : '';
                    return false;
                }
                if (s_type == 27 && s_birth && DataControl.getAge(s_birth) >= 12) {
                    //isAlert ? showToast('年龄已满12岁，不允许使用出生证明') : '';
                    DataControl.errorType = '.js_birth';
                    DataControl.errorMessage = '年龄已满12岁，不允许使用出生证明';
                    DataControl.tipIconType = DataControl.TIPICONS.BLUE;
                    isAlert ? showErrorTips(DataControl.errorType, DataControl.errorMessage, id) : '';
                    return false;
                }

                return true;
            }
        },
        formatCardNo: function (str) {
            str = str.replace(/\s/g, "");
            var result = [];
            result[0] = str.substring(0, 6);
            result[1] = str.substring(6, 14);
            result[2] = str.substring(14);
            return $.trim(result.join(" "));
        },
        testBirth: function (showErrorTips, str, isAlert, s_type, id) { //检查生日
            //DataControl
            str = $.trim(str || '');
            if (!str) {
                DataControl.errorType = '.js_birth';
                DataControl.errorMessage = '请填写出生日期';
                DataControl.tipIconType = DataControl.TIPICONS.RED;
                //isAlert ? showToast(DataControl.errorMessage) : '';
                isAlert ? showErrorTips(DataControl.errorType, DataControl.errorMessage, id) : '';
                return false;
            }
            if (!birthReg.test(str) || (birthReg.test(str) && !isValidDay(str))) {
                DataControl.errorType = '.js_birth';
                DataControl.errorMessage = '请输入正确的出生日期，格式如：19990909';
                DataControl.tipIconType = DataControl.TIPICONS.RED;
                //isAlert ? showToast(DataControl.errorMessage) : '';
                isAlert ? showErrorTips(DataControl.errorType, DataControl.errorMessage, id) : '';
                return false;
            }

            // 初生婴儿 小于14天（第一程起飞算），不能登机
            if (DataControl.getAge(str) == -2) {
                DataControl.errorType = '.js_birth';
                DataControl.errorMessage = '出生不满14天的婴儿不能登机';
                DataControl.tipIconType = DataControl.TIPICONS.BLUE;
                //isAlert ? showToast(DataControl.errorMessage) : '';
                isAlert ? showErrorTips(DataControl.errorType, DataControl.errorMessage, id) : '';
                return false;
            }

            //如果是户口簿或出生证明
            if (s_type == 25 && str && DataControl.getAge(str) >= 16) {
                DataControl.errorType = '.js_birth';
                DataControl.errorMessage = '年龄已满16周岁，不能使用户口簿';
                DataControl.tipIconType = DataControl.TIPICONS.BLUE;
                //showToast('年龄已满16岁，不允许使用户口簿');
                isAlert ? showErrorTips(DataControl.errorType, DataControl.errorMessage, id) : '';
                return false;
            }
            if (s_type == 27 && str && DataControl.getAge(str) >= 12) {
                DataControl.errorType = '.js_birth';
                DataControl.errorMessage = '年龄已满12周岁，不能使用出生证明';
                DataControl.tipIconType = DataControl.TIPICONS.BLUE;
                //showToast('年龄已满12岁，不允许使用出生证明');
                isAlert ? showErrorTips(DataControl.errorType, DataControl.errorMessage, id) : '';
                return false;
            }

            function isValidDay(str) {
                var month = parseInt(str.substring(4, 6), 10);
                var newMonth = new Date(c.base.Date.parse(str)).getMonth() + 1;

                return !!(month == newMonth);
            }

            return true;
        },
        /**
        * 非身份证情况下的姓名校验
        */
        NoCard_C_E_Name: function (showErrorTips, Cstr, firstName, lastName, isTestFan, s_type, isAlert, id) {
            Cstr = Cstr.replace(/\s/g, '');
            var cNamereg = /^[\u4e00-\u9fa5]{2,14}$/;
            //var eNamereg = /^[a-z|\s]+\s*\/\s*[a-z]+$/i;
            var eNamereg = /^[a-z]+\s*/i;
            var firstNameReg = /^\s*[a-z]+\s*$/i;
            var lastNameReg = /^\s*[a-z]+\s*[a-z]*\s*$/i;
            var iscName = null;
            var result = true;

            if ($('#cname-container-' + id).css('display') == 'none') { // 检验英文名 
                if (firstName == '') {
                    DataControl.errorMessage = '请填写姓';
                    DataControl.errorType = '.js_firstName';
                    //isAlert ? showToast(DataControl.errorMessage) : '';
                    isAlert ? showErrorTips(DataControl.errorType, DataControl.errorMessage, id) : '';
                    result = false;
                    //return false;
                }

                if (result && !firstNameReg.test(firstName)) {
                    DataControl.errorMessage = '请填写正确的英文姓氏';
                    DataControl.errorType = '.js_firstName';

                    //isAlert ? showToast(DataControl.errorMessage) : '';
                    isAlert ? showErrorTips(DataControl.errorType, DataControl.errorMessage, id) : '';
                    result = false;
                    //return false;
                } else if (firstName.length > 26) {
                    DataControl.errorMessage = '英文姓名不能超过26个字符，如姓名过长请使用缩写，姓氏不能缩写，名可以缩写';
                    DataControl.errorType = '.js_firstName';

                    //isAlert ? showToast(DataControl.errorMessage) : '';
                    isAlert ? showErrorTips(DataControl.errorType, DataControl.errorMessage, id) : '';
                    result = false;
                    //return false;
                }

                if (lastName == '') {
                    if (result) {
                        DataControl.errorMessage = '请填写名';
                        DataControl.errorType = '.js_lastName';
                    }

                    //isAlert ? showToast(DataControl.errorMessage) : '';
                    isAlert ? showErrorTips('.js_lastName', '请填写名', id) : '';
                    result = false;
                    //return false;
                } else if (!lastNameReg.test(lastName)) {
                    if (result) {
                        DataControl.errorMessage = '请填写正确的名';
                        DataControl.errorType = '.js_lastName';
                    }

                    //isAlert ? showToast(DataControl.errorMessage) : '';
                    isAlert ? showErrorTips('.js_lastName', '请填写正确的名', id) : '';
                    result = false;
                } else if (lastName.length > 26) {
                    DataControl.errorMessage = '英文姓名不能超过26个字符，如姓名过长请使用缩写，姓氏不能缩写，名可以缩写';
                    DataControl.errorType = '.js_lastName';

                    //isAlert ? showToast(DataControl.errorMessage) : '';
                    isAlert ? showErrorTips(DataControl.errorType, DataControl.errorMessage, id) : '';
                    result = false;
                }

                if ((firstName && firstName.length < 26) && (lastName && lastName.length < 26) && (firstName + lastName).length > 26) {
                    if (result) {
                        DataControl.errorMessage = '英文姓名不能超过26个字符，如姓名过长请使用缩写，姓氏不能缩写，名可以缩写';
                        DataControl.errorType = '.js_lastName';
                    }
                   
                   //isAlert ? showToast(DataControl.errorMessage) : '';
                    isAlert ? showErrorTips('.js_lastName', '英文姓名不能超过26个字符，如姓名过长请使用缩写，姓氏不能缩写，名可以缩写', id) : '';
                   result = false;
                   //return false;
                }
                return result;
            } else {  //检验中文名
                if (!Cstr) {
                    DataControl.errorMessage = '请填写姓名';
                    DataControl.errorType = '.js_newName';
                    //isAlert ? showToast(DataControl.errorMessage) : '';
                    isAlert ? showErrorTips(DataControl.errorType, DataControl.errorMessage, id) : '';
                    return false;
                }

                if (isTestFan) {
                    iscName = cNamereg.test(Cstr) && !DataControl.isFan(Cstr);
                } else {
                    iscName = cNamereg.test(Cstr);
                }

                if (!iscName) {
                    DataControl.errorMessage = '填写正确的中文姓名';
                    DataControl.errorType = '.js_newName';
                    //isAlert ? showToast(DataControl.errorMessage) : '';
                    isAlert ? showErrorTips(DataControl.errorType, DataControl.errorMessage, id) : '';
                    return false;
                }
            }

            return true;
        },
        /*登机人部分信息校验
        * @param passengers 要检测的登机人
        * @param propertyName 校验的属性 名称，如姓名、证件号码、生日
        * @param 当前校验的登机人的Id，配合propertyName 进行焦点的定位
        * isAlert 是否弹出浮层提示
        */
        checkPassenger: function (_this, showToast ,passengers, propertyName, inforId, isAlert) {
            var passArr = [];
            if (_.isArray(passengers)) {
                passArr = passengers;
            } else {
                passArr[0] = passengers;
            }
            var self = this;
            return _.every(passArr, function (obj) {
                var s_cname = $.trim(obj.cname),
                    s_ename = obj.ename,
                    s_firstName = obj.firstName || '',
                    s_lastName = obj.lastName || '',
                    s_deCard = obj.defaIdCard || {}, //判断是否undefined
                    s_birth = obj.birth,
                    s_type = s_deCard ? s_deCard.type : 1,
                    s_gender = obj.gender,
                    eNamereg = /^\w+\/\w+\s*\w+$/i,
                    cNamereg = /^[\u4e00-\u9fa5]{2,14}$/,
                    birthReg = /^(19[0-9]{2}|20[01]{1}\d{1})(0[1-9]{1}|1[0-2]{1})(0[1-9]{1}|[12]\d{1}|3[01]{1})$/;
                s_deCard.birth = base.getBirth(s_deCard.no);
                switch (propertyName) {
                    /*姓名校验*/ 
                    case 'firstName':
                        return base.validateFirstName(showToast, s_firstName, isAlert, inforId);
                        break;
                    case 'lastName':
                        return base.validateLastName(showToast, s_firstName, s_lastName, isAlert, inforId);
                        break;
                    case 'ename':
                    case 'cname':
                        return base.validateName(_this, showToast , s_cname, s_firstName, s_lastName, s_type, isAlert, inforId);
                        break;
                    /*证件号码校验*/ 
                    case 'defaIdCard':
                        return base.validateCard(showToast, s_type, s_deCard, s_birth, isAlert, inforId);
                        break;
                    /*生日校验*/ 
                    case 'birth':
                        return base.testBirth(showToast, s_birth, isAlert, s_type, inforId);
                        break;
                }

            });
        },

        rollMiddle: function (selecter) {
            var bodyH = $('body').height(),
            elTop = $(selecter).offset().top + $(selecter).height();

            // 判断需要显示错误提示信息的位置top是否小于中线高度
            if (elTop > bodyH / 2) {
                //document.body.scrollTop = $('body').scrollTop() + (elTop - bodyH / 2);
                document.body.scrollTop = (elTop - bodyH / 2);
            } else {
                document.body.scrollTop = 0;
            }
        },

        showTip: function (type, selecter, msg, isFlag) {
         
            var parentNode = $(selecter).parent();
            var dom = '<div class="form-tips '+ type +'">' +
                      '<i class="flight-errtips-icon"></i>'+
                      '<em>' + msg + '</em>' +
                      '</div>';
                  
            if (parentNode.find('.form-tips').length === 0) {
                parentNode.append(dom);
            } else {
                parentNode.find('.form-tips').removeClass().addClass('form-tips ' + type).show();
                parentNode.find('.form-tips em').text(msg);
            }

            // 滚动到中间
            if (isFlag) {
                base.rollMiddle(selecter);
                parentNode.find('.form-tips').addClass('twinkle');
                //$(selecter).focus();
            }
        },
        hideTip: function (selecter) {
            var parentNode = $(selecter).parent();
            parentNode.find('.form-tips').hide();
        },
        isRepeatName : function (arr) {
            var hash = {};
            var repeatName = null;

            for (var i in arr) {
                if (hash[arr[i]]) {
                    repeatName = arr[i];
                    break;
                }
                hash[arr[i]] = arr[i];
            }

            return repeatName;
        },
        /**
         * specific: the dow of  .j_singlePopup and .j_singlePopup must be available.
 * @param {Object} viewPort
         */
        popUp: function( viewPort, msg ){
            var j_popupCtn = viewPort.find('.j_singlePopup .j_popupCtn');
            var j_singlePopup = viewPort.find('.j_singlePopup');
            
            j_popupCtn.html( msg );
            var parent = j_singlePopup.removeClass('js_hide').show().on('click', function(){
                $(this).addClass('js_hide');
            });
        },
        getDateItems: function () {
            var now = new Date(),
                year = now.getFullYear(),
                years = [],
                months = [],
                days = [];

            for (var i = year - 80; i <= year; i++) {
                years.push({ key: base.formatZero(i, 4), name: i + '年' });
            }

            for (var i = 1; i <= 12; i++) {
                months.push({ key: base.formatZero(i, 2), name: i + '月', });
            }

            for (var i = 1; i <= 31; i++) {
                days.push({ key: base.formatZero(i, 2), name: i + '日' });
            }

            function formatZero(str, type) {
                str += '';
                for (var i = 0; i < type - str.length; i++) {
                    str = '0' + str;
                }

                return str;
            }

            return [years, months, days];
        },
        getDayItem: function (year, month) {
            var day = 31,
                days = [];

            switch (month) {
                case 1:
                case 3:
                case 5:
                case 7:
                case 8:
                case 10:
                case 12: // 31 天
                    day = 31;
                    break;
                case 2: // 28 或 29 天
                    day = (year % 4 == 0 && year % 100 != 0) ? 29 : 28;
                    break;
                default: // 30天
                    day = 30;
                    break;
            }

            for (var i = 1; i <= day; i++) {
                days.push({ key: base.formatZero(i, 2), name: i + '日' });
            }

            return days;
        },
        formatZero: function (str, type) {
            str += '';
            for (var i = 0; i < type - str.length; i++) {
                str = '0' + str;
            }

            return str;
        },
        // 处理JavaScript对小数运算的缺陷(650 + 320.32 = 970.3199999999999)
        add: function (arg1, arg2, argn) {
            var max = 0, r, m, sum = 0;

            for (var i = 0; i < arguments.length; i++) {
                r = this.getDecimalCount(arguments[i]);
                max = Math.max(max, r);
            }

            m = Math.pow(10, max);

            for (var j = 0; j < arguments.length; j++) {
                sum += arguments[j] * m;
            }

            return sum / m;
        },
        mul: function (num1, num2) {
            var i = 0, count = 0, max = 0, str = '', length = arguments.length, r = 1;

            for (i = 0; i < length; i++) {
                r *= Number(arguments[i].toString().replace('.', ''));
                count = this.getDecimalCount(arguments[i]);
                max += count;
            }

            return r / Math.pow(10, max);
        },
        getDecimalCount: function (num) {
            var count = 0;
            try {
                count = num.toString().split('.')[1].length;
            } catch (e) {
                count = 0;
            }
            return count;
        },
        /**
         * to reduce the first page associations
 * @param {String} name of associate partner
 * @param {Array} Array of dependence,the first one is the Class of the child, others are the modules must be loaded already。
 * @param {Function} Synchronous callback function of require
 *      for example: [ moduleName (,dependence) ]
 * notice: the dependence group must already in the require configuration.
         */
        getAssociationByModuleName: function( partnerName, aDependence, callback ){
            var me = this;
            require( aDependence, function(childConstrustor){
                var oParam = {
                    associations: [ { name: partnerName, constructor: childConstrustor } ]
                };
                me.i_setAssociation(oParam);    // get all child modules
                callback();
            });
        },
        /*超过9个人的时候隐藏按钮*/
        showAddBtn: function (passengerQueryStore) {
            //如当前乘机人已有9个，隐藏添加乘机人按钮，并显示提示语句
            var passengerInfo = passengerQueryStore.get();
            if (passengerInfo && passengerInfo.selCount >= 9) {
                if (!$("#js_addPass_btn").hasClass('js_hide')) {
                    $("#js_addPass_btn").addClass('js_hide');
                }
                if ($("#WaringMessage").hasClass('js_hide')) {
                    $("#WaringMessage").removeClass('js_hide');
                }
            } else {
                if ($("#js_addPass_btn").hasClass('js_hide')) {
                    $("#js_addPass_btn").removeClass('js_hide');
                }
                if (!$("#WaringMessage").hasClass('js_hide')) {
                    $("#WaringMessage").addClass('js_hide');
                }
            }
        },
        buildUrl: function(buildTokenResult){
            // 构建支付URL
            var host = location.host;
            var paymentURL = "https://secure.ctrip.com/webapp/payment2/index.html#index?";
            if (host.match(/^(localhost|172\.16|127\.0)/i)) {                    //本地环境
                paymentURL = "https://secure.fws.qa.nt.ctripcorp.com/webapp/payment2/index.html#index?";
            } else if (host.match(/^m.fat/i) || host.match((/^m.test/i))) {     //测试环境
                paymentURL = "https://secure.fws.qa.nt.ctripcorp.com/webapp/payment2/index.html#index?";
            } else if (host.match(/^m\.uat\.qa/i)) {                            // UAT 环境
                paymentURL = "https://secure.uat.sh.ctriptravel.com/webapp/payment2/index.html#index?";
            } else if (host.match(/10.\8/ig)) {                                 // 堡垒环境（需要改Hosts）
                // 10.8.5.10 secure.ctrip.com
                // 10.8.5.25 wpg.ctrip.com
                paymentURL = "https://10.8.5.10/webapp/payment2/index.html#index?";
            } else {                                                            // 生产环境
                paymentURL = "https://secure.ctrip.com/webapp/payment2/index.html#index?";
            }
            paymentURL += "oid=" + buildTokenResult.oid + "&bustype=101" + "&token=" + buildTokenResult.token;
            return paymentURL;
        },
        i_checkMobileNumber: function (el) {
            var me = this;
                var linkTel = $(el || '#linkTel').val().trim();
            if (linkTel.length <= 0) {
                me.showErrorTips('#linkTel', '请填写手机号码', undefined, false);
                mdStore.increaseCntByKey('NextStepNotPassClick'); //埋点NextStepNotPassClick
                return false;
            }
            if (linkTel.length < 11) {
                me.showErrorTips('#linkTel', '请填写正确的手机号码', undefined, false);
                mdStore.increaseCntByKey('NextStepNotPassClick'); //埋点NextStepNotPassClick
                return false;
            }
            if (!c.utility.validate.isMobile(linkTel)) {
                me.showErrorTips('#linkTel', '请填写正确的手机号码', undefined, false);
                mdStore.increaseCntByKey('NextStepNotPassClick'); //埋点NextStepNotPassClick
                return false;
            } else {
                me.hideErrorTips('#linkTel');
                $('#linkTel').removeClass('highlight');
            }
            return true;
        }
    };
    return base;
});

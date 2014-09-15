/*!
 * 校验组件
 * 表单项校验,包含机票现在组合的校验规则和
 * @author panyang
 * @date 2014-08-08
 */

define(['libs', 'widgetValidate'], function (libs, Validate) {
    /**
     * @des 表单项即时校验，以及ajax返回固有格式的表单项异常信息提示
     * @method 
     */

    var config = {
        email: {
            rule: ['isEmpty', 'length_10', 'isEamil'],
            msg: ['填写项为空', '长度必须为10个字符', '不是一个有效的邮箱地址']
        },
        name: {
            rule: ['isEmpty', 'length_10_20', 'isIdCard'],
            msg: ['填写项为空', '长度必须为10个字符', '不是有效身份证号码']
        }
    };

    var util = {
        isEmail: function (text) {
            var reg = /^(?:\w+\.?)*\w+@(?:\w+\.?)*\w+$/;
            return reg.test(text);
        },
        isPassword: function (text) {
            var reg = /^[a-zA-Z0-9]{6,20}$/;
            return reg.test(text);
        }
    };

    var Validate = function () {

        if (arguments.length === 2) {

            this.proess({ 'name': arguments[0], key: arguments[1] });

        } else if (_.isObject(arguments)) {

            this.proess(arguments);

        } else {
            return {'msg':'validate传参有误'}
        }


        /**
         * @des 处理
         * @method 
         */

        this.proess = function (obj) {
            
            var proessObj = config[obj.name],
                ruleArr = proessObj.rule,
                msgArr = proessObj.msg;

            if (proessObj) {

                _.map(ruleArr,function(num, key){
                    
                    if (!util[ruleArr.num]()) {

                        return util[msgArr.num];

                    } else {
                        
                        return '';
                    }

                });
                
            } else {
                return { 'msg': ''}
            }
        };

    };
    
});
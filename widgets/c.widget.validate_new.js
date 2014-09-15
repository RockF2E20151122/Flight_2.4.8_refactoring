/*!
 * У�����
 * ����У��,������Ʊ������ϵ�У������
 * @author panyang
 * @date 2014-08-08
 */

define(['libs', 'widgetValidate'], function (libs, Validate) {
    /**
     * @des ���ʱУ�飬�Լ�ajax���ع��и�ʽ�ı����쳣��Ϣ��ʾ
     * @method 
     */

    var config = {
        email: {
            rule: ['isEmpty', 'length_10', 'isEamil'],
            msg: ['��д��Ϊ��', '���ȱ���Ϊ10���ַ�', '����һ����Ч�������ַ']
        },
        name: {
            rule: ['isEmpty', 'length_10_20', 'isIdCard'],
            msg: ['��д��Ϊ��', '���ȱ���Ϊ10���ַ�', '������Ч���֤����']
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
            return {'msg':'validate��������'}
        }


        /**
         * @des ����
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
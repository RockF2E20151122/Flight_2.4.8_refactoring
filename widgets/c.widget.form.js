/*!
 * 机票表单校验
 * 表单项校验提示信息及ajax返回固有格式的表单项异常信息提示
 * @author panyang
 * @date 2013-08-06
 */

define(['libs', 'flight/widgets/c.widget.validate'], function (libs, Validate) {
    /**
     * 表单项即时校验，以及ajax返回固有格式的表单项异常信息提示
     * @method 
     * @parameter  (number)  id XXX
     *             (string)name XXX
     * @return (Object) Person XXXX
     */

    var Form = function (opts) {

        var insertDom; // 申明插入tips dom的变量

        this.config = {
            "id": "",                          // (必填)校验项dom元素id
            "type": "",                        // (必填)校验类型,具体类型在widget/c.widget.validate.js内查看
            "event": "blur",                   // (可选)提示层top的位置
            "msg": "请输入正确的信息",          // (可选)默认的提示信息
            "callback": null,                  // (可选)处理提交后返回后台校验信息的处理函数
            "customFn": null,                  // (可选)自定义处理函数
            "close": null,                     // (可选)关闭的回调函数
            "position": "absolute",            // (可选)提示层定位方式
            //"top": 0,                        // (可选)提示层top的位置
            "bottom": 0,                       // (可选)提示层bottom的位置
            "isRoll": true,                    // (可选)在ajax返回错误信息后，是否滚动到错误的表单项在屏幕中间的位置
            "showContainer": "parent",         // (可选)tips展示的容器 默认是出发表单元素的父级元素
            "insertDom": "li",                 // (可选)默认插入位置是dom元素id的第一层父级li元素内
            "triggerFlag": "false"             // 在ajax返回错误信息obj.data里会有这个参数
            ,'fnCallback': function () {

            }
        };

        // 校验是否是一个obj
        if (_.isObject(opts)) {

            var opts = _.extend(this.config, opts);
        } else {
            // throw Error
            return {
                "errMsg": "form校验传参错误"
            }
        }


        /*
         * 初始化方法
         */
        this.init = function () {
            var self = this;

            if (opts.id) {

                $('#' + opts.id).on(opts.event,this,function () {
                    self.validate(this.value);
                });

                insertDom = $('#' + opts.id).parents(opts.insertDom).eq(0);
            } else {
                return {
                    "errMsg": "表单校验传参dom元素不存在"
                }
            }
        };


        /*
         * 校验方法
         */
        this.validate = function (text) {

            // 判断type存在并且Validate有对应的方法

            if (opts.type && Validate[opts.type]) {

                if (Validate[opts.type](text)) {
                    return true;
                } else {
                    this.process();
                }
            } else {
                return {
                    "errMsg": "表单校验类型不存在"
                }
            }
        };


        /*
         * 展示tips，包括ajax去后台校验后返回的信息处理，如果有不正确项提示到对应的位置
         */
        this.process = function (obj) {

            /*
             * ajax返回的obj格式暂时为 obj = {"iRet" : 0, "data" : [{"id" : "test_input", "msg" : "用户名已存在"}]};
             */

            // var obj = { "iRet": 0, "data": [{ "id": "ttt", "msg": "用户名已存在","triggerFlag": true }]};      // 测试代码，模拟数据

            if (_.isObject(obj)) {

                // 成功处理

                if (obj.iRet === 0) {

                    for (var i = 0, len = obj.data.length; i < len; i++){

                        this.show(obj.data[i]);
                    }

                } else {

                }

                return;
            } else {

                this.show();
            }

        };


        /*
         * 展示tips
         */
        this.show = function (obj) {

            // 判断是否是ajax回调触发

            if (_.isObject(obj)) {

                _.extend(opts, obj);

                insertDom = $('#' + opts.id).parents(opts.insertDom).eq(0);
            }

            // 如果没有自定义处理函数，执行默认方法

            if (!_.isFunction(opts.customFn)) {

                // 检查提示tips dom是否存在

                if (insertDom.find('.form-tips').length === 0) {

                    insertDom.append('<div class="form-tips" style="position:' + opts.position + '; bottom:' + opts.bottom + '"><span>' + opts.msg + '</span></div>');

                } else {

                    // 滚动到中间

                    if(opts.triggerFlag){

                        this.rollMiddle(opts.id);
                    }

                    insertDom.find('.form-tips').text(opts.msg).show();

                    // 回调函数存在

                    if (_.isFunction(opts.callback)) {
                        opts.callback();
                    }
                }

            } else {
                opts.customFn();
            }
        };


        /*
         * scroll 滚动到中间，提示项底部的位置在屏幕可视区域的中线位置
         */
        this.rollMiddle = function (id) {

            var bodyH = $('body').height(),
                elTop = $('#' + id).offset().top + $('#' + id).height();

            // 判断需要显示错误提示信息的位置top是否小于中线高度

            if (elTop > bodyH / 2) {

                document.body.scrollTop = $('body').scrollTop() + (elTop - bodyH / 2);

            } else {

                document.body.scrollTop = 0;

            }

        };


        /*
        * 关闭tips
        */
        this.close = function () {
            insertDom.find('.form-tips').hide();
        };


        // 初始化
        this.init();
    };

    return Form;
});
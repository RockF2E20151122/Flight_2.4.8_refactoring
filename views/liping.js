define(['libs', 'c', buildViewTemplatesPath('liping.html')], function (libs, c, html) {
    var View = c.view.extend({
        pageid: '',
        hasAd: true,
        tpl: html,
        render: function () {
            this.viewdata.req = this.request;
            this.$el.html(this.tpl);

        },
        events: {
            'click #js_return': 'backAction'
        },

        //首次记载view，创建view
        onCreate: function () {
            //页面需要的静态资源
            this.render();
        },
        //加载数据时
        onLoad: function (refer) {
            this.turning();

        },
        //调用turning方法时触发
        onShow: function () {
            this.hideLoading();
        },
        onHide: function (toViewName) {
            this.hideLoading();
        },
        /*回退*/
        backAction: function () {
            this.back();
        }



    });
    return View;
});

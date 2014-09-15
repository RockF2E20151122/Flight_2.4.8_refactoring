define(['libs', 'c', 'cBasePageView', buildViewTemplatesPath('travalpackagesdesc.html')], function (libs, c, BasePageView, html) {
    var View = BasePageView.extend({
        tpl: html,
        events: {
            'click #js_return': 'backAction'
        },
        render: function () {
            this.$el.html(html); //载入模版
        },
        updatePage: function (complete) {
            complete.call(this);
        },
        onCreate: function () {
            this.render();
        },
        onLoad: function () {
            var that = this;
      
            this.showLoading();
            this.updatePage(function () {
                that.hideLoading();
                that.turning();
            })
        },
        backAction: function () {
            this.back();
        },
        onShow: function () { },
        onHide: function () { }
    })

    return View;
})
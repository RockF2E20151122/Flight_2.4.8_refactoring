﻿// @author zhangyou

define(['libs', 'cBase', 'cUILayer', 'cUIScrollList'], function (libs, cBase, Layer, ScrollList) {

    var options = {};

    var _config = { prefix: 'cui-' };

    var _attributes = {};
    _attributes.class = _config.prefix + 'warning';

    _attributes.onCreate = function () {
        //refactor -- use tempalte to replace
        this.root.html([
            '<div class="cui-pop-box' + ' ' + this.className + '" style="position: fixed; bottom: 0; left: 0; width: 100%;">',
            '<div class="flight-cui-hd">',
                '<div class="flight-cancel-btn">' + this.cancel + '</div>',
                '<div class="flight-center-title">' + this.title + '</div>',
                '<div class="flight-ok-btn" >' + this.ok + '</div>',
            '</div>',
            '<div class="flight-cui-bd">',
                '<div class="cui-roller scrollWrapper">',
                '</div>',
                '<p class="cui-roller-tips">',
                '' + this.tips + '</p>',

            '</div>',
            '</div>'
        ].join(''));

        this.title = this.root.find('.flight-center-title');
        this.tips = this.root.find('.cui-roller-tips');
        this.btCancel = this.root.find('.flight-cancel-btn');
        this.btOk = this.root.find('.flight-ok-btn');
        this.line = $('<div class="cui-lines">&nbsp;</div>');
        this.wrapper = this.root.find('.scrollWrapper');
        this.mask = $('<div class="cui-view cui-mask" style="position: absolute; left: 0px; top: 0px; width: 100%; height: 5000px; z-index: 2000; display: none;"><div></div></div>');
    };

    _attributes.show = function (e) {
        try {
            this.create();
            this.showAction($.proxy(function () {
                this.onShow();
                e && e.call(this);
            }, this));
        } catch (ex2) {
            //alert('show Exception!');
            //alert(ex2);
        }
    };

    _attributes.showAction = function (e) {
        this.root.show();
        this.mask.show();
        typeof e == "function" && e();
    };

    _attributes.create = function () {
        if (!this.isCreate && (this.rootBox = this.rootBox || $("body"))) {
            this.root = this.createRoot();
            this.root.hide();
            this.onCreate();
            this.rootBox.append(this.root);
            this.root.append(this.createHtml());
            this.rootBox.append(this.mask);
            this.isCreate = !0;
        }
    };

    _attributes.onShow = function () {
        var scope = this;

        //没有data的话便不进行渲染了
        if (!this.data || this.data.length == 0) return false;

        for (var i = 0, len = this.data.length; i < len; i++) {
            var param = {
                wrapper: this.wrapper,
                data: this.data[i],
                type: 'radio',
                disItemNum: this.disItemNum,
                changed: (function (i) {
                    return function (item) {
                        var changed = scope.changed[i];
                        if (typeof changed == 'function') {
                            changed.call(scope, item); //改变则触发事件
                        }
                    }
                })(i)
            }
            if (i == 0 && len == 3) {
                param.className = 'cui-roller-bd  cui-flex';
            }
            var s = new ScrollList(param);
            this.scroll.push(s);
        }

        for (var i = 0, len = this.data.length; i < len; i++) {
            this.scroll[i].setIndex(this.index[i]);
            this.scroll[i].setKey(this.key[i]);
        }

        this.wrapper.append(this.line);
        this.btOk.on('click', function () {
            var item = [];
            for (var i = 0, len = scope.scroll.length; i < len; i++) {
                item.push(scope.scroll[i].getSelected());
            }
            scope.okClick.call(scope, item); //改变则触发事件
            scope.hide();

        });

        this.btCancel.on('click', function () {
            var item = [];
            for (var i = 0, len = scope.scroll.length; i < len; i++) {
                item.push(scope.scroll[i].getSelected());
            }
            scope.cancelClick.call(scope, item); //改变则触发事件
            scope.hide();
        });
        this.setzIndexTop();

        //l_wang 测试
        //    $(window).bind('scroll', function () {
        //      window.scrollTo(0, 1);
        //    });
        this.root.bind('touchmove', function (e) {
            e.preventDefault();
        });

        this.onHashChange = function () {
            this.hide();
        }
        $(window).on('hashchange', $.proxy(this.onHashChange, this));
    };

    _attributes.hide = function () {
        this.onHide();
    };

    _attributes.onHide = function () {
        for (var i = 0, len = this.scroll.length; i < len; i++) {
            this.scroll[i].removeEvent();
        }
        this.btOk.off('click');
        this.btCancel.off('click');

        //l_wang 测试
        //    $(window).unbind('scroll');
        this.root.unbind('touchmove');
        this.root.remove();
        this.mask.remove();
        $(window).off('hashchange', $.proxy(this.onHashChange, this));
    };

    options.__propertys__ = function () {
        var scope = this;
        this.changed = [];
        this.scroll = [];
        this.data = [];
        this.index = [];
        this.key = [];
        this.disItemNum = 5;

        this.tips = '';
        this.btCancel;
        this.btOk;
        this.cancel = '取消';
        this.ok = '确定';
        this.cancelClick = function () { scope.hide() };
        this.okClick = function () { scope.hide() };
    };

    options.initialize = function ($super, opts) {
        this.setOption(function (k, v) {
            this[k] = v;
        });
        $super($.extend(_attributes, opts));
    };

    options.setTips = function (str) {
        this.tips.html(str);
    };

    options.updateScrollListByIndex = function (index, data, selectedIndex) {
        selectedIndex = typeof selectedIndex === 'undefined' ? 0 : selectedIndex;
        this.scroll[index].reload(data);
        this.scroll[index].setIndex(selectedIndex);
    };

    options.getItemByIndex = function (index) {
        return this.scroll[index].getSelected();
    };

    var MultipleScrollList = new cBase.Class(Layer, options);
    return MultipleScrollList;

});


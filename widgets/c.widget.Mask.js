define(function(require){
    
    var c = require('c');
        /**
         * param: scopeVars.mask,
         * param: scopeVars.orderDetailMask
         */
    return new c.base.Class(c.ui.Layer, {
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
        initialize: function ($super, opts ) {
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
                            // mask && mask.hide();
                            // orderDetailMask && orderDetailMask.hide();
                        });
                    }
                },
                onHide: function () {
                    this.mask && this.mask.hide();
                }
            });

        }
    });
});

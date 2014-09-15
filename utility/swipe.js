define(['libs'], function (libs) {
    (function () {

        var touchStop, touchMove, touchStart, modern = 'addEventListener' in window,

        methods = {

            on: function ($this, cb, cd) {

                $this.cjCallback = cb;
                $this.cjCalldoing = cd;
                $this.addEventListener(touchStart, startIt);

            },

            off: function ($this) {

                $this.removeEventListener(touchStart, startIt);
                $this.removeEventListener(touchMove, moveIt);
                $this.removeEventListener(touchStop, endIt);

                delete $this.cjSwipeLeft;
                delete $this.cjSwipeRight;
                delete $this.cjNewPagey;
                delete $this.cjPagey;
                delete $this.cjNowPagey;

            }

        };

        if ('ontouchend' in document) {

            touchStop = 'touchend';
            touchMove = 'touchmove';
            touchStart = 'touchstart';

        }
        else {

            touchStop = 'MSPointerUp';
            touchMove = 'MSPointerMove';
            touchStart = 'MSPointerDown';

        }

        $.fn.Swipe = function (type, cb, cd) {

            if (!modern) return;
            //return this.each(cycleEach, [type, cb]);

            cycleEach(type, cb, cd);
        };

        function cycleEach(type, cb, cd) {

            methods[type](this, cb, cd);

        }

        function startIt(event) {

            var pages = event.touches ? event.touches[0] : event;

            this.cjPagey = pages.clientY;//pages.pageY;
            this.cjNowPagey = pages.clientY;
            this.addEventListener(touchStop, endIt,false);
            this.addEventListener(touchMove, moveIt,false);

        }

        function moveIt(event) {

            var pages = event.touches ? event.touches[0] : event,
            newPagey = this.cjNewPagey = pages.clientY; //pages.pageY;
           //if (Math.abs(this.cjPageX - newPageX) <3) event.preventDefault();
            //var md = this.cjPagey - newPagey;
            var minMove = 3;
            if (Math.abs(this.cjNowPagey - newPagey) > minMove) {
                md = this.cjNowPagey - newPagey;
                this.cjCalldoing(md);
                this.cjNowPagey = newPagey;
            }  
              
        }

        function endIt() {

            this.removeEventListener(touchMove, moveIt);
            this.removeEventListener(touchStop, endIt);

            var newPagey = this.cjNewPagey,
                pagey = this.cjPagey;
            if (Math.abs(pagey - newPagey) > 3) {
                this.cjCallback(pagey > newPagey);
            } 

        }

    })();
});
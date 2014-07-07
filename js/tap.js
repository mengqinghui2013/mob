// webkit tap highlight color
// -webkit-tap-highlight-color:
// Overrides the highlight color shown when the user taps a link or a JavaScript clickable element in Safari on iPhone.
//
// This property obeys the alpha value, if specified. If you don’t specify an alpha value, Safari on iPhone applies a default alpha value to the color. To disable tap highlighting, set the alpha value to 0 (invisible). If you set the alpha value to 1.0 (opaque), the element is not visible when tapped.
// http://stackoverflow.com/questions/2851663/how-do-i-simulate-a-hover-with-a-touch-in-touch-enabled-browsers
// http://phonegap-tips.com/articles/essential-phonegap-css-webkit-tap-highlight-color.html


(function () {
    var DELAY_TIME = 15;
    var HOVER_CLASS = 'hover';
    var TIME_BEFORE_TOUCH_END = 400;


    var id;
    var $tgt, $lastTgt;
    var startX, startY;
    var diffX, diffY;
    var startTime;
    var isFinish = false;

    var touchStart = function (e) {
        startTime = now();
        startX = e.touches[0].pageX;
        startY = e.touches[0].pageY;

        $tgt = $(this);

        $lastTgt && $lastTgt.removeClass(HOVER_CLASS);
        $lastTgt = $tgt;

        id = setTimeout(function () {
            $tgt.addClass(HOVER_CLASS);
        }, DELAY_TIME);

        $tgt.on('touchmove', touchMove);

        $tgt.on('touchend', touchEnd);

    };

    var touchMove = function (e) {
        diffX = Math.abs(e.changedTouches[0].pageX - startX);
        diffY = Math.abs(e.changedTouches[0].pageY - startY);
        if (diffX > 10 || diffY > 10) {
            finish();
            $tgt.removeClass(HOVER_CLASS);
            clearTimeout(id);
        }
    };

    var touchEnd = function (e) {
        diffX = Math.abs(e.changedTouches[0].pageX - startX);
        diffY = Math.abs(e.changedTouches[0].pageY - startY);

        finish();

        $tgt.removeClass(HOVER_CLASS);

        if (diffX < 10 && diffY < 10 && now() - startTime < TIME_BEFORE_TOUCH_END) {
            setTimeout(function () {
                $tgt.removeClass(HOVER_CLASS);//解决速度太快无法清除的问题
            }, 600);
        }
    };

    var finish = function () {
        if (isFinish) return;
        isFinish = true;
        $tgt.off('touchmove').off('touchend');
    };

    var now = function () {
        return +new Date();
    };


    $(function () {
        $('.tap').on('touchstart', touchStart);
    });

})();


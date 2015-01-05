/*
 *  存在的问题：
 *      1 不够流畅
 *      2 如果宽度够宽，就不应该滚动了
 */
/*$('.slider').scrollable({
   

});*/
define([
    './var/cssVendor',
    './var/transitionDuration',
    './var/transform',
    './var/transitionEnd'
], function(cssVendor, transitionDuration, transform, transitionEnd) {
    function Scrollable(el, opts) {
        opts = $.extend(true, {
            direction: 'h',
            offset: {
                x: 0,
                y: 0
            },
            onTransitionEnd: function() {},
            oninit: function() {},
            onstart: function() {},
            onmove: function() {},
            onend: function() {},
            onresize: function() {}
        }, opts);
        this.x = opts.offset.x;
        this.y = opts.offset.y;

        this.init(el, opts);
    };

    Scrollable.prototype = {
        init: function(el, options) {
            this.options = options;
            this.wrapper = typeof el == 'string' ? document.querySelector(el) : el;
            this.slider = this.wrapper.querySelector('.slider-group');
            this.slider.style.cssText = 'position:relative;top:0;' + cssVendor + 'transition-duration:0;' + cssVendor + 'transform: translateZ(0);' + cssVendor + 'transition-timing-function:ease-out';
            window.addEventListener('resize', this, false);
            this.wrapper.addEventListener('touchstart', this, false);
            this.wrapper.addEventListener('touchmove', this, false);
            this.wrapper.addEventListener('touchend', this, false);
            this.slider.addEventListener(transitionEnd, this, false);
            this.refreshSize();
            this.options.oninit();

        },


        refreshSize: function() {
            this.wrapperWidth = this.wrapper.clientWidth;
            this.wrapperHeight = this.wrapper.clientHeight;
            this.maxX = this.wrapperWidth - this.slider.offsetWidth
            this.maxY = this.wrapperHeight - this.slider.offsetHeight;
            this.snapThreshold =
                Math.round(this.wrapperWidth * 0.15);
            this.resetPosition();
            this.options.onresize();
        },
        resetPosition: function() {
            var x = this.x,
                y = this.y;
            if (this.directionLocked == 'h') {
                if (this.x > 0) {
                    x = 0;
                }
                if (this.x < this.maxX) {
                    x = this.maxX;
                }
            }
            if (this.directionLocked == 'v') {
                if (this.y > 0) {
                    y = 0;
                }
                if (this.y < this.maxY) {
                    y = this.maxY;
                }
            }
            this.slider.style[transitionDuration] = '0ms';
            this.__pos(x, y);
        },
        destroy: function() {
            // Remove the event listeners
            window.removeEventListener('resize', this, false);
            this.wrapper.removeEventListener('touchstart', this, false);
            this.wrapper.removeEventListener('touchmove', this, false);
            this.wrapper.removeEventListener('touchend', this, false);
            this.slider.removeEventListener(transitionEnd, this, false);

        },
        handleEvent: function(e) {
            switch (e.type) {
                case 'touchstart':
                    this.__start(e);
                    break;
                case 'touchmove':
                    this.__move(e);
                    break;
                case 'touchcancel':
                case 'touchend':
                    this.__end(e);
                    break;
                case 'resize':
                    this.__resize();
                    break;
                case transitionEnd:
                case 'otransitionend':
                    this.__transitionEnd();
                    break;
            }
        },
        __resize: function() {
            this.refreshSize();
        },
        __transitionEnd: function() {
            this.options.onTransitionEnd();
        },

        __pos: function(x, y) {
            this.x = x;
            y = y || 0;
            this.y = y;

            this.slider.style[transform] = 'translate(' + x + 'px,' + y + 'px) translateZ(0)';
        },


        __start: function(e) {
            //e.preventDefault();
            if (this.initiated) return;

            var point = e.touches[0];

            this.initiated = true;
            this.moved = false;
            this.startX = this.x;
            this.startY = this.y;
            this.pointX = point.pageX;
            this.pointY = point.pageY;
            this.stepsX = 0;
            this.stepsY = 0;
            this.directionX = 0;
            this.directionY = 0;
            this.directionLocked = false;
            this.startTime = (new Date()).getTime();
            this.slider.style[transitionDuration] = '0s';

            this.options.onstart();
        },

        __move: function(e) {
            if (!this.initiated) return;

            var point = e.touches[0],
                deltaX = point.pageX - this.pointX,
                deltaY = point.pageY - this.pointY,
                timestamp = (new Date()).getTime(),
                newX, newY, distX, distY;
            this.directionLocked = this.options.direction;
            deltaX = Number(deltaX), deltaY = Number(deltaY);
            this.moved = true;
            this.pointX = point.pageX;
            this.pointY = point.pageY;
            this.stepsX += Math.abs(deltaX);
            this.stepsY += Math.abs(deltaY);
            this.directionX = deltaX > 0 ? 1 : deltaX < 0 ? -1 : 0;
            if (this.directionLocked == 'h') {
                deltaY = 0;
            } else if (this.directionLocked == 'v') {
                deltaX = 0;
            }
            newX = this.x + deltaX;
            newY = this.y + deltaY;

            if (this.stepsX < 10 && this.stepsY < 10) {
                return;
            }
            if (!this.directionLocked && this.stepsY > this.stepsX) {
                this.initiated = false;
                return;
            }
            if (this.directionLocked == 'v' && this.stepsX > 50 && this.stepsY < this.stepsX && this.options.onSwipe) {
                this.options.onSwipe(this.directionX);
                return;
            }
            if (this.directionLocked == 'h' && this.stepsY > this.stepsX) {
                /** 水平滚动，并且向上***/
                this.moved = false;
                return;
            } else {
                e.preventDefault();
                e.stopPropagation();
            }

            if ((newX > 0 || newX < this.maxX)) {
                newX = this.x + (deltaX / 2);
            }
            if (newY > 0 || newY < this.maxY) {
                newY = this.y + (deltaY / 2);
            }
            this.__pos(newX, newY);

            if (timestamp - this.startTime > 300) {
                this.startTime = timestamp;
                this.startX = this.x;
                this.startY = this.y;
            }
            this.options.onmove(newX, newY);
        },

        momentum: function(current, start, time, lowerMargin, wrapperSize, deceleration) {
            var distance = current - start,
                speed = Math.abs(distance) / time,
                destination,
                duration;

            deceleration = deceleration === undefined ? 0.0006 : deceleration;

            destination = current + (speed * speed) / (2 * deceleration) * (distance < 0 ? -1 : 1);
            duration = speed / deceleration;

            if (destination < lowerMargin) {
                destination = wrapperSize ? lowerMargin - (wrapperSize / 2.5 * (speed / 8)) : lowerMargin;
                distance = Math.abs(destination - current);
                duration = distance / speed;
            } else if (destination > 0) {
                destination = wrapperSize ? wrapperSize / 2.5 * (speed / 8) : 0;
                distance = Math.abs(current) + destination;
                duration = distance / speed;
            }

            return {
                destination: Math.round(destination),
                duration: duration
            };
        },
        __end: function(e) {
            if (!this.initiated) return;

            var point = e.changedTouches[0],
                distX = this.x,
                duration = (new Date).getTime() - this.startTime,
                distY = this.y,
                durationX = 100 * (this.x - this.startX) / this.x;
            durationY = 100 * (this.y - this.startY) / this.y;

            this.initiated = false;

            if (!this.moved) return;

            if (duration < 300) {
                momentumX = this.momentum(this.x, this.startX, duration, this.maxX, this.wrapperWidth);
                momentumY = this.momentum(this.y, this.startY, duration, this.maxY, this.wrapperHeight);
                distX = momentumX.destination;
                durationX = momentumX.duration;
                distY = momentumY.destination;
                durationY = momentumY.duration;
            }
            if (this.directionLocked == 'h') {
                distY = 0;
                if (distX > 0) {
                    distX = 0;
                }
                if (distX < this.maxX) {
                    distX = this.maxX;
                }
                if (distX < this.snapThreshold) {
                    this.slider.style[transitionDuration] = durationX + 'ms';
                    this.__pos(distX, distY);

                }
            }
            if (this.directionLocked == 'v') {
                distX = 0;
                if (distY > 0) {
                    distY = 0;
                }
                if (distY < this.maxY) {
                    distY = this.maxY;
                }
                if (distY == 0 || distY == this.maxY) {
                    this.slider.style[transitionDuration] = durationY + 'ms';
                    var that = this;
                    that.__pos(distX, distY);
                }
            }
            this.options.onend(distX, distY);
        }
    };

    /*
     * scroll  支持
     */
    var scrollableInstance = null;
    $.fn.scrollable = function(option) {
        var isMethodCall = typeof option === "string",
            args = [].slice.call(arguments, 1);
        return this.each(function() {

            if (isMethodCall) {
                scrollableInstance[option].apply(scrollableInstance, args);
            } else {
                scrollableInstance = new Scrollable(this, option);
            }
            return scrollableInstance;
        });
    }
    return Scrollable;
});
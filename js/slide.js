/**
 * @description slide依赖swipe组件,swipe组件可以自己实现，也可以使用iscroll
 * 
 *  动画轮播可以支持循环轮播，滑动播放，后续添加定时轮播
 * slide:
 *     (class)
 *      
 *
 * content:
 *     (class) 
 * 
 * methods:
 *  
 *
 * @todo 
 *   1 将代码改造成符合cmd规范的
 *   2 将swipe抽离走
 *   3 Class的方式改为引用方式
 *   4 引入requirejs作为依赖分析的工具，改造grunt进行打包压缩

 *   现在的代码比较搓，接下来要把class去掉，swipe和slide分开，代码改用amd规范，下周先把grunt的编译工具搞定
 *   代码改造一下，然后抽离swipe，
 *   具体的可以参考https://m.baidu.com/s?word=%E7%8B%82%E6%80%92&ts=8595322&t_kt=153&sa=ihr_2&ss=001&icolor=11669#|
 */

 /** class.js **/
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
  this.Class = function(){};
  Class.extend = function(prop) {
    var _super = this.prototype;
    initializing = true;
    var prototype = new this();
    initializing = false;
    for (var name in prop) {
      prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
            this._super = _super[name];
            var ret = fn.apply(this, arguments);        
            this._super = tmp;
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
    function Class() {
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
    Class.prototype = prototype;
    Class.prototype.constructor = Class;
    Class.extend = arguments.callee;
    return Class;
  };
})();

!(function() {
    var dummyStyle = document.createElement('div').style,
    vendor = (function () {
        var vendors = 't,webkitT,MozT,msT,OT'.split(','),
            t,
            i = 0,
            l = vendors.length;

        for ( ; i < l; i++ ) {
            t = vendors[i] + 'ransform';
            if ( t in dummyStyle ) {
                return vendors[i].substr(0, vendors[i].length - 1);
            }
        }

        return false;
    })(),
    cssVendor = vendor ? '-' + vendor.toLowerCase() + '-' : '',

    // Style properties
    prefixStyle = function(style) {
        if ( vendor === '' ) return style;
        style = style.charAt(0).toUpperCase() + style.substr(1);
        return vendor + style;
    },
    transitionDuration = prefixStyle('transitionDuration'),
    transform = prefixStyle('transform'),

    // Browser capabilities
    has3d = prefixStyle('perspective') in dummyStyle,
    hasTouch = 'ontouchstart' in window,
    hasTransform = !!vendor,
    hasTransitionEnd = prefixStyle('transition') in dummyStyle,

    // Helpers
    translateZ = has3d ? ' translateZ(0)' : '',

    // Events
    resizeEvent = 'onorientationchange' in window ? 'resize' : 'resize',
    startEvent = hasTouch ? 'touchstart' : 'mousedown',
    moveEvent = hasTouch ? 'touchmove' : 'mousemove',
    endEvent = hasTouch ? 'touchend' : 'mouseup',
    cancelEvent = hasTouch ? 'touchcancel' : 'mouseup',
    transitionEndEvent = (function () {
        if ( vendor === false ) return false;

        var transitionEnd = {
                ''          : 'transitionend',
                'webkit'    : 'webkitTransitionEnd',
                'Moz'       : 'transitionend',
                'O'         : 'oTransitionEnd',
                'ms'        : 'MSTransitionEnd'
            };

        return transitionEnd[vendor];
    })();

  
  var Swipe = Class.extend({
    init: function(options) {
      var i,
        div,
        el = options.el,
        className;

      this.wrapper = typeof el == 'string' ? document.querySelector(el) : el;
      this.cssVendor = cssVendor;
      this.options = {
        snapThreshold: null,
        direction: 'h',
        init: function() {},
      };
      for (var k in options) {
        this.options[k] = options[k];
      }

      this.slider = this.wrapper.querySelector('.mob-slider-group');

      this.slider.style.cssText = 'position:relative;top:0;' + cssVendor + 'transition-duration:0;' + cssVendor + 'transform: translateZ(0);' + cssVendor + 'transition-timing-function:ease-out';
      window.addEventListener(resizeEvent, this, false);
      this.wrapper.addEventListener(startEvent, this, false);
      this.wrapper.addEventListener(moveEvent, this, false);
      this.wrapper.addEventListener(endEvent, this, false);
      this.slider.addEventListener(transitionEndEvent, this, false);
      // in Opera >= 12 the transitionend event is lowercase so we register both events
      if (vendor == 'O') this.slider.addEventListener(transitionEndEvent.toLowerCase(), this, false);

      this.__init();
      this.refreshSize();
    },
    x: 0,
    y: 0,
    __init: function() {},
    onTouchStart: function(fn) {
      this.wrapper.addEventListener('swipe-touchstart', fn, false);
      this.customEvents.push(['touchstart', fn]);
    },
    refreshSize: function() {
      this.wrapperWidth = this.wrapper.clientWidth;
      this.wrapperHeight = this.wrapper.clientHeight;
      this.maxX = this.wrapperWidth - this.slider.offsetWidth
      this.maxY = this.wrapperHeight - this.slider.offsetHeight;
      this.snapThreshold =
        Math.round(this.wrapperWidth * 0.15);
      this.resetPosition();
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
      while (this.customEvents.length) {
        this.wrapper.removeEventListener('swipe-' + this.customEvents[0][0], this.customEvents[0][1], false);
        this.customEvents.shift();
      }

      // Remove the event listeners
      window.removeEventListener(resizeEvent, this, false);
      this.wrapper.removeEventListener(startEvent, this, false);
      this.wrapper.removeEventListener(moveEvent, this, false);
      this.wrapper.removeEventListener(endEvent, this, false);
      this.slider.removeEventListener(transitionEndEvent, this, false);

    },
    handleEvent: function(e) {
      switch (e.type) {
        case startEvent:
          this.__start(e);
          break;
        case moveEvent:
          this.__move(e);
          break;
        case cancelEvent:
        case endEvent:
          this.__end(e);
          break;
        case resizeEvent:
          this.__resize();
          break;
        case transitionEndEvent:
        case 'otransitionend':
          this.__transitionEnd();
          break;
      }
    },
    __resize: function() {
      this.refreshSize();
    },
    __transitionEnd: function() {},
    /**
     *
     * Pseudo private methods
     *
     */
    __pos: function(x, y) {
      this.x = x;
      y = y || 0;
      this.y = y;

      this.slider.style[transform] = 'translate(' + x + 'px,' + y + 'px)' + translateZ;
    },


    __start: function(e) {
      //e.preventDefault();
      if (this.initiated) return;

      var point = hasTouch ? e.touches[0] : e;

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
    },

    __move: function(e) {
      if (!this.initiated) return;

      var point = hasTouch ? e.touches[0] : e,
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
    },
    swipeEnd: function(distX, distY) {

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

      var point = hasTouch ? e.changedTouches[0] : e,
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
      this.swipeEnd(distX, distY);

    },
    __event: function() {}

  });

  var Slider = Swipe.extend({
    current: 1,
    __init: function() {
      this.slider = this.wrapper.querySelector('.mob-slider-group');
      this.slideItems = [].slice.call(this.slider.querySelectorAll('.mob-slider-item'), 0);
      this.options.numberOfPages = this.slideItems.length;
      this.current = this.options.current || 1;
      this.refreshSize();
      var index = this.__getIndex();
      if (this.options.loop) {
        // 前后各插入一帧
        var node = this.slideItems[0].cloneNode(true);
        node.className = node.className + ' mob-slider-repeat';
        this.slider.appendChild(node);
        node = this.slideItems[this.options.numberOfPages - 1].cloneNode(true);
        node.className = node.className + ' mob-slider-repeat';
        this.slider.insertBefore(node, this.slideItems[0]);
      }
      var cssVendor = this.cssVendor;
      this.x = -index * this.pageWidth;
      this.y = 0;
      var initTranslate = "translate(" + (-index * this.pageWidth) + "px, 0)";
      this.slider.style.cssText = 'position:relative;top:0;' + cssVendor + 'transition-duration:0;' + cssVendor + 'transform:' + initTranslate + ' translateZ(0);' + cssVendor + 'transition-timing-function:ease-out';

    },
    refreshSize: function() {
      this.wrapperWidth = this.wrapper.clientWidth;
      var width = this.wrapperWidth;
      this.slider.style.width = width * this.options.numberOfPages + 'px';
      this.slideItems.forEach(function(slide) {

        slide.style.width = width + 'px';
      });


      this.maxX = this.wrapperWidth - this.slider.offsetWidth
      this.maxY = this.wrapperHeight - this.slider.offsetHeight;
      var swipeWidth = this.options.swipeWith;
      this.pageWidth = !swipeWidth ?
        this.wrapperWidth :
        /%/.test(swipeWidth) ?
        Math.round(this.pageWidth * swipeWidth.replace('%', '') / 100) : swipeWidth;
      this.snapThreshold = this.options.snapThreshold === null ?
        Math.round(this.pageWidth * 0.15) :
        /%/.test(this.options.snapThreshold) ?
        Math.round(this.pageWidth * this.options.snapThreshold.replace('%', '') / 100) :
        this.options.snapThreshold;
    },
    resetPosition: function() {
      var index = this.__getIndex();

    },
    __resize: function() {
      this.refreshSize();
      this.slider.style[transitionDuration] = '0s';
      var index = this.__getIndex();
      this.__pos(-index * this.pageWidth);
    },
    slideTo: function(n) {
      if (n) {
        this.current = n;
        var index = this.__getIndex();
        var that = this;
        this.refreshSize();
        setTimeout(function() {
          var newX = -1 * index * that.pageWidth;
          that.__pos(newX);
          if (that.options.onSlideEnd) {
            that.options.onSlideEnd.call(that);
          }

        }, 100);
      }
    },
    swipeEnd: function(dist) {
      if (!this.options.loop && (this.x > 0 || this.x < this.maxX)) {
        dist = 0;
      }

      // Check if we exceeded the snap threshold
      if (dist && dist < this.snapThreshold) {
        this.slider.style[transitionDuration] = Math.floor(100 * dist / this.snapThreshold) + 'ms';
        var index = this.__getIndex();
        this.__pos(-index * this.pageWidth);
        return;
      }
      this.__checkPosition();


    },
    getCurrent: function() {
      return this.current;
    },
    __getIndex: function() {
      return this.options.loop ? this.current : this.current - 1;
    },
    __checkPosition: function() {
      var pageFlip,
        className,
        total = this.options.numberOfPages;

      if (this.directionX > 0) {
        if (this.options.loop) {
          this.current = (this.current + total) % (total + 1);
        } else {
          this.current = this.current == 1 ? 1 : this.current - 1;

        }

      } else {
        if (this.options.loop) {
          this.current = this.current % (total + 1) + 1;
        } else {
          this.current = this.current == total ? total : this.current + 1;

        }
      }
      var index = this.__getIndex();

      newX = -index * this.pageWidth;

      this.slider.style[transitionDuration] = Math.floor(500 * Math.abs(this.x - newX) / this.pageWidth) + 'ms';

      if (this.x == newX) {
        this.__flip();
      } else {
        this.__pos(newX);
      }
      if (this.options.onSlideEnd) {
        this.options.onSlideEnd.call(this);
      }
    },
    selectDotted: function() {

    },
    __transitionEnd: function() {
      //循环播放的话，可以动态补充两帧
      var total = this.options.numberOfPages;
      if (this.current == total + 1 || this.current == 0) {
        this.slider.style[transitionDuration] = "0ms";
        var index = this.current == 0 ? total : 1;
        this.__pos(-index * this.pageWidth);
      }

    }
  });
  return Slider;

})();

  
/* vim: set expandtab ts=4 sw=4 sts=4 tw=100: */

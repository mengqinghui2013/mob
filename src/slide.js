/*
 *  new Slider({
        el: '',

    });
    或者
    $(el).slider({
  
        current: 1,
        onSlideTo: function() {}
    });

    $(el).slider('slideTo', 5 );
 *
 *
 */

define([
  './var/cssVendor',
  './var/transitionDuration',
  './scrollable',
], function(cssVendro, Scrollable) {
  var Slide = function(el, opts) {
    var me = this;

    opts = $.extend(true, {
      current: 1,
      onSlideTo: function(current, before) {}
    }, opts);
    this.options = opts;
    this.init(el, opts);
    this.onResize();

    var index = this.getIndex();
    var offsetX = -index * this.pageWidth;

    this.instance = new Scrollable(el, {
      offset: {
        x: offsetX,
        y: 0
      },
      oninit: function() {},
      onresize: function() {
        me.onResize.call(me);
      },
      onend: function(distX, distY) {
        me.onEnd.call(me, distX, distY);
      },
      onTransitionEnd: function() {
        me.onTransitionEnd.call(me);
      },
      onmove: function() {}
    });
  };

  Slide.prototype = {
    init: function(el, opts) {
      el = typeof el === 'string' ? document.querySelector(el) : el;
      this.wrapper = el;
      this.slider = el.querySelector('.slider-group');
      this.slideItems = [].slice.call(this.slider.querySelectorAll('.slider-item'), 0);
      this.options.numberOfPages = this.slideItems.length;
      this.current = this.options.current || 1;
      if (this.options.loop) {
        // 前后各插入一帧
        var node = this.slideItems[0].cloneNode(true);
        node.className = node.className + ' slider-repeat';
        this.slider.appendChild(node);
        node = this.slideItems[this.options.numberOfPages - 1].cloneNode(true);
        node.className = node.className + ' slider-repeat';
        this.slider.insertBefore(node, this.slideItems[0]);
      }
      this.selectIndicator();
    },
    onEnd: function(dist) {
      if (!this.options.loop && (this.x > 0 || this.x < this.maxX)) {
        dist = 0;
      }
      if (dist && dist < this.snapThreshold) {
        this.slider.style[transitionDuration] = Math.floor(100 * dist / this.snapThreshold) + 'ms';
        var index = this.getIndex();
        this.instance.__pos(-index * this.pageWidth);
        return;
      }
      this.__checkPosition();
    },
    getIndex: function() {
      return this.options.loop ? this.current : this.current - 1;
    },
    __checkPosition: function() {
      var total = this.options.numberOfPages;
      if (this.instance.directionX > 0) {
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
      var index = this.getIndex();

      newX = -index * this.pageWidth;

      this.slider.style[transitionDuration] = Math.floor(500 * Math.abs(this.x - newX) / this.pageWidth) + 'ms';

      if (this.x == newX) {
      } else {
        this.instance.__pos(newX);
      }
      this.selectIndicator();
      this.options.onSlideTo.call(this);
    },
    selectIndicator: function() {
  
        var indicators = this.wrapper.querySelectorAll('.indicator'),
            index = this.getIndex();
            current = indicators[index];
          $(this.wrapper).find('.indicator-selected').removeClass('indicator-selected');
          $(current).addClass('indicator-selected');
    },
    onResize: function() {
      var width = this.wrapper.clientWidth;
      this.wrapperWidth = width;
      this.slider.style.width = width * this.options.numberOfPages + 'px';
      this.slideItems.forEach(function(slide) {
        slide.style.width = width + 'px';
      });

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
    onTransitionEnd: function() {
      var total = this.options.numberOfPages;
      if (this.current == total + 1 || this.current == 0) {
        this.slider.style[transitionDuration] = "0ms";
        this.instance.__pos(-this.getIndex() * this.pageWidth);
      }

    },
    onSlideTo: function() {

    },
    /*
     *  对外暴漏的接口
     *
     */
    slideTo: function(n) {
      if (n) {
        this.current = n;

        var me = this;

        var index = this.getIndex();
        this.onResize();
        setTimeout(function() {
          var newX = -1 * index * me.pageWidth;
          me.instance.__pos(newX);
          if (me.options.onSlideEnd) {
            me.options.onSlideEnd.call(me);
          }
        }, 100);
      }
    }

  };

  /*
   * scroll  支持
   */
  var slideInstance = null;
  $.fn.slide = function(option) {
    var isMethodCall = typeof option === "string",
      args = [].slice.call(arguments, 1);
    return this.each(function() {
      if (isMethodCall) {
        slideInstance[option].apply(slideInstance, args);
      } else {
        slideInstance = new Slide(this, option);
      }
      return scrollableInstance;
    });
  }
  return Slide;
});
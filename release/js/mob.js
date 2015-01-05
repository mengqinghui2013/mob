/*!
 * =====================================================
 * mob v0.1.0 (https://github.com/mobframe/mob)
 * Copyright 2015 Xu, Yizhi
 * Licensed under MIT 
 *
 * v0.1.0 .
 * =====================================================
 */


(function( global, factory ) {
	 // jshint ;_;

	if ( typeof module === "object" && typeof module.exports === "object" ) {
		
		module.exports = global.document ?
			factory( global, $ ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "mob requires a window with a document" );
				}
				return factory( w , $);
			};
	} else {
		factory( global,$);
	}

// Pass this if window is not defined yet
}(typeof window !== "undefined" ? window : this, function( window,  $ ) {





    var Aside = function(element) {
        var $btn = $(element);
        this.$el = $($btn.attr("href") || $btn.data("target"));
        if (this.$el.hasClass('aside-push')) {

            this.isPush = true;
            var bindEl = this.bindEl = $(this.$el.data("bind"))
            bindEl.addClass('aside-push-obj')
                .removeClass('aside-push-obj-right')
                .removeClass('aside-push-obj-left')
                .removeClass('aside-push-obj-top')
                .removeClass('aside-push-obj-bottom')

            if (this.$el.hasClass('aside-right')) {
                this.bindClass = "aside-push-obj-right"
            } else if (this.$el.hasClass('aside-left')) {
                this.bindClass = "aside-push-obj-left"
            } else if (this.$el.hasClass('aside-top')) {
                this.bindClass = "aside-push-obj-top"
            } else if (this.$el.hasClass('aside-bottom')) {
                this.bindClass = "aside-push-obj-bottom"
            }
            bindEl.addClass(this.bindClass)
        }

    }

    Aside.prototype = {
        "show": function() {
            var me = this;
            this.$el
                .removeClass("slideout")
                .addClass("show")
                .addClass("slidein")

            this._apear(this.$el)
            if (this.isPush) {
                this.bindEl.removeClass("slideout")
                    .addClass("slidein")
                    .one('click', function(e) {
                        me.hide.call(me)
                    })
                    .on('touchmove', this.bindEl, this._preventMove)

            } else { // if $el has class aside-overlay
                this._addBackdrop()
            }
        },
        "hide": function() {
            this.$el
                .removeClass("slidein")
                .addClass("slideout")
                .removeClass("show")

            this._disapear(this.$el)
            if (this.isPush) {
                this.bindEl.removeClass("slidein")
                    .addClass("slideout")
                    .off('touchmove', this.bindEl, this._preventMove)
            } else { // if $el has class aside=-overlay
                this._removeBackdrop()
            }
        },
        "toggle": function() {
            this.$el.hasClass("show") ? this.hide() : this.show();
        },
        "_disapear": function(el) {
            setTimeout(function() {
                el.addClass('disapear');
            }, 300); //trick for side bar 
        },
        "_apear": function(el) {
            el.removeClass('disapear');
        },
        "_addBackdrop": function() {
            var me = this;
            this.$el.after("<div class='aside-backdrop'></div>")
            this.$el.siblings('.aside-backdrop').one('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                this.remove();
                me.hide();
            })
        },
        "_removeBackdrop": function() {
            this.$el.siblings('.aside-backdrop').remove();
        },
        "_preventMove": function(e) {
            e.preventDefault()
        }
    }

    /*
     * ASIDE PLUGIN DEFINITION
     */

    $.fn.aside = function(option) {
        return this.each(function() {
            var aside = new Aside(this);
            if (typeof option == 'string') aside[option]();
        });
    }

    /*
     * ASIDE DATA API
     */

    $(document).on('click.data-api', '[data-aside="toggle"]', function(e) {
        e.preventDefault();
        $(this).aside('toggle');
    });

    /**
     * 弹出层和对话框的基础组件
     * 示例:
     *      $(".model").modal();
     */
    var Model = function(options) {
        var me = this;
        if (!options) return;
        if (typeof options == 'string') {
            this.el = options;
            this.$el = $(this.el);
        } else {
            this.$el = options.$el || $(options.el);
            this.confirm = options.confirm;
        }
        this.$el.find(".btn-confirm").bind("click", function() {
            if (me.confirm) {
                me.confirm.call(me, this);
            }
        });
        this.$el.find(".btn-cancel").bind("click", function() {
            me.hide();
        });
    };

    Model.prototype = {
        pos: function() {
            var dialog = this.$el.find('.modal-dialog');
            console.log(dialog);
            dialog.css({
                //top     : window.pageYOffset + (window.innerHeight - 85)*0.5 + 'px',
                //left    : (window.innerWidth - 216)*0.5 + 'px'
            })
        },
        show: function(options) {
            if (this.showed) return;
            this.pos();
            if (options && options.msg) {
                $(".dialog-tip", this.$el).text(options.msg);
            }
            this.$el.removeClass("hide").addClass("show");
            this.showed = true;
            $('body').append('<div class="modal-backdrop"></div>');
        },
        hide: function() {
            if (!this.showed) return;
            this.$el.removeClass("show").addClass("hide");
            $('.modal-backdrop').remove();
            this.showed = false;
        }
    };

    $.fn.modal = function(options) {
        var modal = new Model(options);
        return modal
    }
var vendor =  (function () {
        var dummyStyle = document.createElement('div').style,
        vendors = 't,webkitT,MozT,msT,OT'.split(','),
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
    })();
    

var cssVendor = vendor ? '-' + vendor.toLowerCase() + '-' : '';

var prefixStyle = function(style) {
        if ( vendor === '' ) return style;
        style = style.charAt(0).toUpperCase() + style.substr(1);
        return vendor + style;
    };

var transitionDuration = prefixStyle('transitionDuration');

var transform = prefixStyle('transform');

var transitionEnd = (function () {
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

/*
 *  存在的问题：
 *      1 不够流畅
 *      2 如果宽度够宽，就不应该滚动了
 */
/*$('.slider').scrollable({
   

});*/

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
}));

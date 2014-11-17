/**
 * method: 
 *
 *  - data api:
 *      data-aside = "hide|show|toggle" 
 *  - js:
 *      $(this).aside("toggle"|"show"|"hide")
 *
 * fire aside-show,aside-shown, aside-hide event 
 */

;(function ($, window, document) {
    "use strict"; 
    var Aside = function(element){
        var $btn = $(element);
        this.$el = $($btn.attr("href") || $btn.data("target"));
        if(this.$el.hasClass('aside-push')){

            this.isPush = true;
            var bindEl = this.bindEl = $(this.$el.data("bind"))
                bindEl.addClass('aside-push-obj')
                    .removeClass('aside-push-obj-right')
                    .removeClass('aside-push-obj-left')
                    .removeClass('aside-push-obj-top')
                    .removeClass('aside-push-obj-bottom')

            if (this.$el.hasClass('aside-right')){
                this.bindClass = "aside-push-obj-right"
            }else if (this.$el.hasClass('aside-left')){
                this.bindClass = "aside-push-obj-left"
            }else if (this.$el.hasClass('aside-top')){
                this.bindClass = "aside-push-obj-top"
            }else if (this.$el.hasClass('aside-bottom')){
                this.bindClass = "aside-push-obj-bottom"
            }
            bindEl.addClass(this.bindClass)
        }

    }

    Aside.prototype={
        "show": function(){
            var me = this;
            this.$el
                .removeClass("slideout")
                .addClass("show")
                .addClass("slidein")

            this._apear(this.$el)
            if(this.isPush){
                this.bindEl.removeClass("slideout")
                    .addClass("slidein")
                    .one('click', function(e){
                        me.hide.call(me)                
                    })
                    .on('touchmove', this.bindEl, this._preventMove)
         
            } else { // if $el has class aside-overlay
                this._addBackdrop() 
            }
        },
        "hide": function(){
            this.$el
                .removeClass("slidein")
                .addClass("slideout")
                .removeClass("show")

            this._disapear(this.$el)
            if(this.isPush){
                this.bindEl.removeClass("slidein")
                    .addClass("slideout")
                    .off('touchmove', this.bindEl, this._preventMove)
            }else{ // if $el has class aside=-overlay
                this._removeBackdrop()
            }
        },
        "toggle": function(){
            this.$el.hasClass("show") ? this.hide() : this.show();
        },
        "_disapear": function(el){
                setTimeout(function(){
                    el.addClass('disapear');
                },300); //trick for side bar 
        },
        "_apear": function(el){
                el.removeClass('disapear');
        },
        "_addBackdrop": function(){
            var me = this;
            this.$el.after("<div class='aside-backdrop'></div>")            
            this.$el.siblings('.aside-backdrop').one('click', function(e){
                e.preventDefault();
                e.stopPropagation();
                this.remove();
                me.hide();
            })
        },
        "_removeBackdrop": function(){
            this.$el.siblings('.aside-backdrop').remove();
        },
        "_preventMove" :function(e){
            e.preventDefault()
        }
    }

    /*
     * ASIDE PLUGIN DEFINITION
     */

    $.fn.aside = function ( option ) {
        return this.each(function () {
            var aside = new Aside(this);
            if (typeof option == 'string') aside[option]();
        });
    }

    /*
     * ASIDE DATA API
     */

    $(document).on('click.data-api', '[data-aside="toggle"]', function (e) {
        e.preventDefault();
        $(this).aside('toggle');
    });

}($, window, document));

/* vim: set expandtab ts=4 sw=4 sts=4 tw=100: */

//take a photo in the mobile phone and return the photo's image data.
//support ios safari 6+, android.

//////////////////////////////////////////// view model
;
(function(window, $){
function Snap(conf){
    var me = this;
    this.conf = conf || {};
    this.os = null;
    this.camera = new Camera();
    this.checkEnv();
    this.maskEl="#mask";
    this.action = 'vis.topgen';
    this.handlers = {
        'self.cat': function(){
            if(typeof detector != undefined){
                detector.abortCurrent();
            }
            if(this.os == 'ios'){
                $("#progress").text('猫脸识别暂不支持ios,请尝试其它功能');
            }else{
                detector.detectCats();
            }
        },
        'self.more': function(){
            if(typeof detector != undefined){
                detector.abortCurrent();
            }
            showMoreResult();
        },
        'vis.flower': function(){
            if(typeof detector != undefined){
                detector.abortCurrent();
            }
            var canvas = $("#preview").get(0);
            var imgData = canvas.toDataURL("image/jpeg"); 
            me.send(imgData);
        },
        'vis.topgen': function(){
            if(typeof detector != undefined){
                detector.abortCurrent();
            }
            var canvas = $("#preview").get(0);
            var imgData = canvas.toDataURL("image/jpeg"); 
            me.send(imgData);
        }
    }
}

Snap.prototype = {
    'snap': function(event){
        $(this.conf.snap_image).trigger('click');
    },
    'localSnap': function(event){
        $(this.conf.local_snap_image).trigger('click');
    },
    'detect': function(event, first){
        var me = this;
        this.step.snap.end();
        this.maskShow();
        this.step.detect.start();
        var img = this.camera.getImage(function(img){
            if(first){
                drawToCanvas(img);
            }
            me.handlers[me.action]();
            setTimeout(function(){
                me.maskHide();
                if(me.resultCallback){
                    me.resultCallback();
                }
            }, 1000);
        });

    },
    'checkEnv': function(){
        if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
            this.os = "ios";
        }   
    },
    'bindEvents': function(){
        var me = this,
        handling = false;
        $(this.conf.snap_btn).on('click', function(event){
            me.snap.call(me, event)
        });
        
        $(this.conf.local_snap_btn).on('click', function(event){
            me.localSnap.call(me, event)
        });

        $(this.conf.snap_image).on('change', function(event){
            me.camera.capture(event);
            me.detect.call(me, event, true);
        });

        $(this.conf.local_snap_image).on('change', function(event){
            me.camera.capture(event);
            me.detect.call(me, event, true);
        });
    },
    'bindClickTo': function(ele){
        this.conf.snap_btn = ele;
        return this;
    },
    'bindLocalSnapTo': function(ele){
        this.conf.local_snap_btn = ele;
        return this;
    },
    'setCameraInput': function(ele){
        this.conf.snap_image = ele;
        return this;
    },
    'setLocalInput': function(ele){
        this.conf.local_snap_image = ele;
        return this;
    },
    'setTabs': function(el){
        var me = this;
        $(el).on('click', function(event){
            me.action = $(this).data("action");
            me.detect(event);
        });
        return this;
    },
    'start': function(){
        this.bindEvents();
        return this;
    },
    'step': {
        'snap': {
            'start': function(){
                return this.step;
            },
            'end': function(){
                $("#camera").addClass("hide");
                return this.step;
            }
        },
        'detect': {
            'start': function(){
                $("#detect").removeClass("hide");
                return this.step;
            },
            'end': function(){
                return this.step;
            }
        }
    },
    'send': function(img){
        var options = {
            img : img
        }
        var me = this;
        $.post('/api/' + this.action , options, function(res){
            //console.log(res);
            switch(me.action){
                case 'vis.topgen':
                    showVisTopgenResult(res);
                    break;
                case 'vis.flower':
                    showVisFlowerResult(res);
                    break;
            }
        }, 'json')
    },
    'maskShow': function(){
        $(this.maskEl).show();
        return this;
    },
    'maskHide': function(){
        $(this.maskEl).hide();
        return this;
    },
    'onReady': function(callback){
        this.resultCallback = callback;
        return this;
    }
}

var createSnap = function(){
    return new Snap();
}

///////////////////////////////////////////////////// detector model

var showVisTopgenResult = function(data){
    if(!data 
        || !data.status 
        || !data.result 
        || !data.result.GENERAL_CLASS 
        || !data.result.GENERAL_CLASS.length){
        $("#progress").text('抱歉，没有找到与图片相关的内容');
    }else{
        var result = data.result.GENERAL_CLASS;
        var msg = "";
        for (var i = 0; i < result.length; i++){
            var item = result[i];
            var slices = item.name.split("-");
            for (var j = 0; j < slices.length; j++){
                var sub_item = slices[j];
                msg += "<a href='http://m.baidu.com/s?word=" + sub_item + "&st=11104i&ts=2164184&sa=ib&tn=iphone&ss=11&ix=461%25' target='_blank'>" + sub_item + '</a>';
            }
        }
        $("#progress").html('您要找的是不是：<br>' + msg);
    }
}

var showVisFlowerResult = function(data){
    if(!data 
        || !data.status 
        || !data.result 
        || !data.result.FLOWER_INFO 
        || !data.result.FLOWER_INFO.length){
        $("#progress").text('抱歉，没有找到与图片相关的花');
    }else{
        var result = data.result.FLOWER_INFO;
        var msg = "";
        var bdImgMsg = "";
        for (var i = 0; i < result.length; i++){
            var item = result[i];
            msg += "<a href='http://m.baidu.com/s?word=" + item.name + "&st=11104i&ts=2164184&sa=ib&tn=iphone&ss=11&ix=461%25' target='_blank'>" + item.name + '</a>';
            bdImgMsg += "<a href='http://m.baidu.com/img?tn=bdidxiphone#!/search/" + item.name + "' target='_blank'>" + item.name + '</a>';
        }
        $("#progress").html('<p>图片中的花可能是：</p><p>' + msg + '</p><p>看看相似图片：</p><p>' + bdImgMsg + '</p>');
    }
}

var showMoreResult = function(){
        $("#progress").html('更多功能即将上线<br>敬请期待!');
}

//////////////////////////////////////////////////////  camrea model

var Camera = function(){
    this.event = null;
}

Camera.prototype = {
    'capture': function(event){
        this.event = event;
        //this.imgType = 'image/png';
        this.imgType = 'image/jpeg';
        return this;
    },
    'getImage': function(callback){                         // @API
        return this.getImageByUrl(callback)
            || this.getImageByFileRead(callback)
    },
    'getImageByUrl': function(callback){
        var url = this.getUrl();
        var img = new Image();
        img.src = url;
        img.onload = function() {
            callback(img)
        }
        return img
    },
    'getImageByFileRead': function(){
        var file = this.getFile(this.event);
        var fileReader = new FileReader();
        var img = new Image();
        fileReader.onload = function (event) {
            img.src = event.target.result;
        };
        fileReader.readAsDataURL(file);
        return img;
    },
    'getData': function(){                     // @API
        return this.getDataByUrl() 
            || this.getDataByFileRead();
    },
    'getDataByUrl': function(){
        var canvas = this.getCanvasByUrl();
        return canvas.toDataURL(this.imgType) || null;
    },
    'getDataByFileRead': function(){
        var canvas = this.getCanvasByFileRead();
        return canvas.toDataURL(this.imgType) || null;
    },
    'getCanvas': function(){                       // @API
        return this.getCanvasByUrl() 
            || this.getCanvasByFileRead();
    },
    'getCanvasByUrl': function(){
        var file = this.getFile();
        var URL = window.URL || window.webkitURL;
        var imgURL = URL.createObjectURL(file);
        var canvas = document.createElement("canvas");
        canvas.src = imgURL;
        return canvas; 
    },
    'getCanvasByFileRead': function(){
        var file = this.getFile();
        var fileReader = new FileReader();
        var canvas = document.createElement("canvas");
        fileReader.onload = function (event) {
            canvas.src = event.target.result;
        };
        fileReader.readAsDataURL(file);
        return canvas
    },
    'getFile':function(){
        var files = this.event.target.files,
            file;
            if (files && files.length > 0) {
                file = files[0];
            }else{
                return null;
            }
        return file;         
    },
    'getUrl': function(){
        var file = this.getFile();
        var URL = window.URL || window.webkitURL;
        var imgURL = URL.createObjectURL(file);
        return imgURL;
    }
}
})(window, $);

;(function (window, document) {
    $(".aside").on("tap",function(){

    });
}(window, document));
;(function ($, window, document) {
    "use strict"; // jshint ;_;
    /**
     * 弹出层和对话框的基础组件  
     * 示例:
     *      $(".tips").modal();
     */
    $.fn.Modal = function(options){
        
    }
    /**
     * 对话框
     * 示例:
     *      $(".dialog").dialog();
     */
    $.fn.Dialog = function(options){
        var me = this;                                                                                 
        this.$el = options.el || $("#dialogPanel");                                                                  
        if (options){                                                                                  
            if (options.$el) this.$el = $(options.$el);                                                
            if (options.confirm) this.confirm = options.confirm;                                       
        }                                                                                              
        this.$el.find(".btn-confirm").bind("click",function(){                                         
            if(me.confirm){                                                                            
                me.confirm.call(me,this);                                                              
            }                                                                                          
        });                                                                                            
        this.$el.find(".btn-cancel").bind("click",function(){                                          
            me.hide();                                                                                 
        }); 
    }

    $.fn.Dialog.prototype = {                                                                         
        pos : function () {                                                                            
            this.$el.css({                                                                             
                top     : window.pageYOffset + (window.innerHeight - 85)*0.5 + 'px',                   
                left    : (window.innerWidth - 216)*0.5 + 'px'                                         
            })                                                                                         
        },                                                                                             
        show : function(options){                                                                      
            if(this.showed) return;                                                                    
            this.pos();                                                                                
            if(options.msg){                                                                           
                $(".dialog-tip",this.$el).text(options.msg);                                           
            }                                                                                          
            this.$el.addClass("show");                                                                 
            this.showed = true;                                                                        
        },                                                                                             
        hide : function(){                                                                             
            if(!this.showed) return;                                                                   
            this.$el.removeClass("show");                                                              
            this.showed = false;                                                                       
        }                                                                                              
    };          

}($, window, document));
/**
 * nav:
 *     (class)
 *     data-target href
 *
 * content:
 *     (class) tab-content tab-pane
 * 
 * methods:
 *     show
 *     activate
 *
 * @todo 
 *  动画 
 *  绑定 data-api 
 *  nav-tab 不在 tab-pane中时 nav-tab的切换
 */
;(function ($, window, document) {
    
    "use strict"; 

    /* TAB CLASS DEFINITION */
    var Tab = function (element) {
        this.element = $(element);
    }

    Tab.prototype = {
        show: function () {
            var $this = this.element,
                target_selector = $this.attr('data-target') || $this.attr('href'),
                target = target_selector ? $(target_selector) : $this,
                container = target.closest('.tab-content');

            if ( $this.hasClass('active') ) return;
                
            var previous = container.find('.tab-pane.active');
            $this.trigger('show', [previous]);
            this.activate(target, container, function () {
                $this.trigger('shown', [previous]);
            })
        },

        activate: function ( element, container, callback) {
            var $active = container.find('.tab-pane.active'),
                transition = callback && $active.hasClass('fade');
            function next() {
                $active.removeClass('active');
                element.addClass('active');
                if (transition) {
                  element[0].offsetWidth; // reflow for transition
                  element.addClass('in');
                } else {
                  element.removeClass('fade');
                }
                callback && callback();
            }
            transition ? $active.one(transition.end, next) : next();
            $active.removeClass('in');
        }
  }

 /*
  * TAB PLUGIN DEFINITION
  */
  $.fn.tab = function ( option ) {
    return this.each(function () {
      var tab = new Tab(this);
      if (typeof option == 'string') tab[option]();
    })
  }

 /*
  * TAB DATA-API
  */

  $(document).on('click.tab.data-api', '[data-toggle="tab"]', function (e) {
    e.preventDefault();
    $(this).tab('show');
  });

}($, window, document));
/* vim: set expandtab ts=4 sw=4 sts=4 tw=100: */

;(function ($, window, document) {
    "use strict"; // jshint ;_;
    /**
     * 弹出层和对话框的基础组件  
     * 示例:
     *      $(".model").modal();
     */
    var Model = function(options){
        var me = this;
        if (!options) return;
        if (typeof options == 'string'){
            this.el = options;
            this.$el = $(this.el);
        }else{
            this.$el = options.$el || $(options.el);
            this.confirm = options.confirm;                                       
        }
        this.$el.find(".btn-confirm").bind("click",function(){
            if(me.confirm){
                me.confirm.call(me,this);
            }
        }); 
        this.$el.find(".btn-cancel").bind("click",function(){
            me.hide(); 
        });
    };

    Model.prototype = {
        pos : function () {
            var dialog = this.$el.find('.modal-dialog');
            console.log(dialog);
                dialog.css({
                    //top     : window.pageYOffset + (window.innerHeight - 85)*0.5 + 'px',
                    //left    : (window.innerWidth - 216)*0.5 + 'px'
                })
        },
        show : function(options){ 
            if(this.showed) return;
            this.pos();
            if(options && options.msg){
                $(".dialog-tip",this.$el).text(options.msg);
            }
            this.$el.removeClass("hide").addClass("show");
            this.showed = true;
            $('body').append('<div class="modal-backdrop"></div>');
        }, 
        hide : function(){
            if(!this.showed) return;
            this.$el.removeClass("show").addClass("hide");
            $('.modal-backdrop').remove();
            this.showed = false;
        }
    };

    $.fn.modal = function(options){
        var modal = new Model(options);
        return modal
    }

}($, window, document));

;
(function ($, window, document) {
    "use strict"; // jshint ;_;
    var PullToRefresh = function(options){
        var me = this;
        this.heightRange = 40;
        this.animationDuration = 80;
        this.done = false;
        this.startPos = {x: 0 , y: 0};
        this.time = 0;
        this.pulledClassName = "pull-to-refresh-status-pulled";
        this.loadingClassName = "pull-to-refresh-status-loading";
        if(options){
            $.extend(this, options);
        }
        $(document).on("touchstart", function(e){
            me.onTouchstart.apply(me, [e]);
        })
        .on("touchmove", function(e){
            me.onTouchmove.apply(me, [e]);
        })
        .on("touchend", function(e){
            me.onTouchend.apply(me, [e]);
        });
    }
    
    $.extend(PullToRefresh.prototype, {
        onTouchstart: function(e){
            if (e && e.touches){
                var touch = e.touches[0];
            }else{
                return;
            }
            this.startPos = { 
                'x': touch.pageX,
                'y': touch.pageY
            }
            this.time = new Date().getTime();
            this.done = false;
        },
        onTouchmove: function(e){
            if (e && e.touches && e.touches.length > 0){
                var now = new Date().getTime();
                if ((now - this.time) < this.animationDuration){
                    return;
                }else{
                    this.time = now;
                }
                var touch = e.touches[0];
            }else{
                return;
            }
            this.pos = {
                'x': touch.pageX,
                'y': touch.pageY
            }
            var scrollY = this.pos.y - this.startPos.y
            if ( scrollY < 6) {
                return;
            }

            var top_ = parseInt(this.bind.css('top')) || 0;
            if( top_ < this.heightRange){
                this.bind.css('top', scrollY > this.heightRange ?
                        this.heightRange : scrollY);
                return;
            }else{
                this.done = true;
                $(".pull-to-refresh").addClass(this.pulledClassName)// change icon style
                return;
            }
        },
        onTouchend: function(e){
            if(this.done && this.callback){
                this.loading();
                this.callback.call(this);
            } else {
                this.cancel();
            }
        },
        loading: function(){
            $(".pull-to-refresh").removeClass(this.pulledClassName)// change icon style
                .addClass(this.loadingClassName)
        },
        back: function(){
            this.bind.css('top', 0);
            $(".pull-to-refresh").removeClass(this.pulledClassName)// change icon style       
                .removeClass(this.loadingClassName)
        },
        cancel: function(){
            this.back();
        }
    });

    $.fn.pullToRefresh = function(options){
        var callback;
        if (typeof options == "function"){
            callback = options;
        }
        var bind = this.parent('.pullable');
        options = {
            "callback": callback,
            "target": this,
            "bind": bind
        }

        var pullToRefresh = new PullToRefresh(options);
        return pullToRefresh;
    }

}($, window, document));


/**
 * nav:
 *     (class)
 *     data-target href
 *
 * content:
 *     (class) tab-content tab-pane
 * 
 * methods:
 *     show
 *     activate
 *     hide
 *
 * @todo 
 *  动画 
 *  绑定 data-api 
 *  nav-tab 不在 tab-pane中时 nav-tab的切换
 *  滑动切换
 */
;(function ($, window, document) {
    
    "use strict"; 
    var Scrollable = require('../Scrollable');
    var Slide = function(opts) {
        var el = $(opts.el);
        new Scrollable(el, {
            horizable: true
        });
    }
    Slide.prototype = {
        slideTo: function() {},
        next: function() {},
        prev: function() {},
        update: function() {},
        loadImg: function() {},

    };

    /* TAB CLASS DEFINITION */
    var Tab = function (element) {
        this.element = $(element);
    }

    Tab.prototype = {
        show: function () {
            var $this = this.element,
                target_selector = $this.attr('data-target') || $this.attr('href'),
                target = target_selector ? $(target_selector) : $this,
                container = target.closest('.tab-content');

            if ( $this.hasClass('active') ) return;
                
            var previous = container.find('.tab-pane.active');
            $this.trigger('show', [previous]);
            this.activate(target, container, function () {
                $this.trigger('shown', [previous]);
            })
        },

        activate: function ( element, container, callback) {
            var $active = container.find('.tab-pane.active'),
                transition = callback && $active.hasClass('fade');
            function next() {
                $active.removeClass('active');
                element.addClass('active');
                if (transition) {
                  element[0].offsetWidth; // reflow for transition
                  element.addClass('in');
                } else {
                  element.removeClass('fade');
                }
                callback && callback();
            }
            transition ? $active.one(transition.end, next) : next();
            $active.removeClass('in');
        }
  }

 /*
  * TAB PLUGIN DEFINITION
  */
  $.fn.tab = function ( option ) {
    return this.each(function () {
      var tab = new Tab(this);
      if (typeof option == 'string') tab[option]();
    })
  }

 /*
  * SWIPE PLUGIN
  */

 /*
  * TAB DATA-API
  */

  $(document).on('click.tab.data-api', '[data-toggle="tab"]', function (e) {
    e.preventDefault();
    $(this).tab('show');
  });

}($, window, document));

/* vim: set expandtab ts=4 sw=4 sts=4 tw=100: */

;(function(){
    "use strict";
    var SmartBar = function(){
        this.y = window.pageYOffset;  
        this.lastTime = new Date().getTime();
        this.isShow = true;
        this.intervarTime = 300; 
        var me = this;
        $(document).on("touchstart", function(e){
            me.onTouchstart.apply(me, [e])
        });
        $(window).on('scroll', function(e){
            me.handle.apply(me, [e]);
        }, false);
    };
    
    $.extend(SmartBar.prototype, {
        // Bind touch event
        onTouchstart: function(e){
            this.y = window.pageYOffset;
            if (e && e.touches){
                var touch = e.touches[0];
            }else{
                return;
            }
        },
        hide: function(){
            $('.smartbar').hide();
            this.isShow = false;
        },
        show: function(){
            $('.smartbar').show();
            this.isShow = true;
        },
        // Set function running interval.
        checkInterval: function(){
            var thisTime = new Date().getTime();
            if (thisTime - this.lastTime < this.intervarTime){
                return false;
            }
            this.lastTime = thisTime;           
            return true;
        },
        // Check if trigger hidden event
        isTriggerHidden: function(){
            return (this.moveY > 0 && this.isShow);
        },
        // Check if trigger show event
        isTriggerShow: function(){
            return (this.moveY < 0 && Math.abs(this.moveY) > 20 && !this.isShow);
        },
        // Check if action match show/hide bar condition.
        handle: function(e){
            if(!this.checkInterval()) return;    
            this.moveY = window.pageYOffset - this.y;
            if (this.isTriggerHidden()){
                this.hide();
            }else if(this.isTriggerShow()){
                this.show();
            }
        }
    });

    var smartbar = new SmartBar();

})();
/* vim: set expandtab ts=4 sw=4 sts=4 tw=100: */

/**
 * nav:
 *     (class)
 *     data-target href
 *
 * content:
 *     (class) tab-content tab-pane
 * 
 * methods:
 *     show
 *     activate
 *     hide
 *
 * @todo 
 *  动画 
 *  绑定 data-api 
 *  nav-tab 不在 tab-pane中时 nav-tab的切换
 *  滑动切换
 */
;(function ($, window, document) {
    
    "use strict"; 

    /* TAB CLASS DEFINITION */
    var Tab = function (element) {
        this.element = $(element);
    }

    Tab.prototype = {
        show: function () {
            var $this = this.element,
                target_selector = $this.attr('data-target') || $this.attr('href'),
                target = target_selector ? $(target_selector) : $this,
                container = target.closest('.tab-content');

            if ( $this.hasClass('active') ) return;
                
            var previous = container.find('.tab-pane.active');
            $this.trigger('show', [previous]);
            this.activate(target, container, function () {
                $this.trigger('shown', [previous]);
            })
        },

        activate: function ( element, container, callback) {
            var $active = container.find('.tab-pane.active'),
                transition = callback && $active.hasClass('fade');
            function next() {
                $active.removeClass('active');
                element.addClass('active');
                if (transition) {
                  element[0].offsetWidth; // reflow for transition
                  element.addClass('in');
                } else {
                  element.removeClass('fade');
                }
                callback && callback();
            }
            transition ? $active.one(transition.end, next) : next();
            $active.removeClass('in');
        }
  }

 /*
  * TAB PLUGIN DEFINITION
  */
  $.fn.tab = function ( option ) {
    return this.each(function () {
      var tab = new Tab(this);
      if (typeof option == 'string') tab[option]();
    })
  }

 /*
  * SWIPE PLUGIN
  */

 /*
  * TAB DATA-API
  */

  $(document).on('click.tab.data-api', '[data-toggle="tab"]', function (e) {
    e.preventDefault();
    $(this).tab('show');
  });

}($, window, document));

/* vim: set expandtab ts=4 sw=4 sts=4 tw=100: */

// webkit tap highlight color
// -webkit-tap-highlight-color:
// Overrides the highlight color shown when the user taps a link or a JavaScript clickable element in Safari on iPhone.
//
// This property obeys the alpha value, if specified. If you don’t specify an alpha value, Safari on iPhone applies a default alpha value to the color. To disable tap highlighting, set the alpha value to 0 (invisible). If you set the alpha value to 1.0 (opaque), the element is not visible when tapped.
// http://stackoverflow.com/questions/2851663/how-do-i-simulate-a-hover-with-a-touch-in-touch-enabled-browsers
// http://phonegap-tips.com/articles/essential-phonegap-css-webkit-tap-highlight-color.html

;(function(){
    // tap 点击延时绑定
 
    //tap highlight
    if($.os.android){
        $(".tap")
            .live('touchstart',function(){
                $(this).data('background', $(this).css('background'));
                $(this).css('background','#D9E9FF')
            }).live('touchend', function(){
                var background = $(this).data('background');
                if(background){
                    $(this).css('background',background);
                }else{
                    $(this).css('background','transparent')
                }
            })
    }

    //data api
    
    $(document).on('click.tap', '[data-url]', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var url = $(this).data('url');
        setTimeout(function(){
            location.href = url;
        },300);
    });

    $(document).on('click.tap', '[data-openurl]', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var url = $(this).data('openurl');
        setTimeout(function(){
            window.open(url);
        },300);
    });

}($, window, document));
/* vim: set expandtab ts=4 sw=4 sts=4 tw=100: */

if ($.os.iphone){
    setTimeout(function() {
        window.scrollTo(0, 0);
    },0);
}

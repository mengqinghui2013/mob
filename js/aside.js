/**
 * method: 
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

            if(this.isPush){
                this.$el.removeClass("disapear")
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

            if(this.isPush){
                this.bindEl.removeClass("slidein")
                    .addClass("slideout")
                    .off('touchmove', this.bindEl, this._preventMove)
                    var me =this
                    setTimeout(function(){
                        me.$el.addClass('disapear');
                    },300); //trick for right bar display 
            }else{ // if $el has class aside=-overlay
                this._removeBackdrop()
            }
        },
        "toggle": function(){
            this.$el.hasClass("show") ? this.hide() : this.show();
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

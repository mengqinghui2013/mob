define(function() {
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

    return Model;
});
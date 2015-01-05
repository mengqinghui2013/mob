<!-- 不循环轮播 , 不支持懒加载图片 -->
<div id="slider" class="mob-slider">
    <div class="mob-slider-group mob-slider-loop">
        <div class="mob-slider-item">
            <a href="#"><img src="http://dcloudio.github.io/mui/assets/img/shuijiao.jpg"></a>
        </div>
        <div class="mob-slider-item">
            <a href="#"><img src="http://dcloudio.github.io/mui/assets/img/muwu.jpg"></a>
        </div>
        <div class="mob-slider-item">
            <a href="#"><img src="http://dcloudio.github.io/mui/assets/img/cbd.jpg"></a>
        </div>
        <div class="mob-slider-item">
            <a href="#"><img src="http://dcloudio.github.io/mui/assets/img/yuantiao.jpg"></a>
        </div>
    </div>
    <div class="mob-slider-indicator">
        <div class="mob-indicator mob-active"></div>
        <div class="mob-indicator"></div>
        <div class="mob-indicator"></div>
        <div class="mob-indicator"></div>
    </div>
</div>
<script type="text/javascript">
    $('#slider').slide({
        loop: false,
        lazy: true
    });

</script>
define([
    './vendor'
],function( vendor) {
   return function(style) {
        if ( vendor === '' ) return style;
        style = style.charAt(0).toUpperCase() + style.substr(1);
        return vendor + style;
    };
});


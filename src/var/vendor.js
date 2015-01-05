define(function(  ) {
    return  (function () {
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
    
});
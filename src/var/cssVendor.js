define([
    './vendor'
],function( vendor) {
   return vendor ? '-' + vendor.toLowerCase() + '-' : '';
});
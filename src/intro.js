@BANNER

(function( global, factory ) {
	"use strict"; // jshint ;_;

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

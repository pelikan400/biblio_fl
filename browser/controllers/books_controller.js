define( function() {
   'use strict';

   // TODO we need access to database of books, patrons, and circulations
   
   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

    function isDigit( c )
    {
        var code = c.charCodeAt( 0 );
        var code0 = "0".charCodeAt( 0 );
        var code9 = String( "9" ).charCodeAt( 0 );
        return code >= 0 && code <= code9;
    }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

    var controller = [ '$scope', "ixoidDatabase", function BooksController( $scope, db ) {
        console.log( "BooksController initialized." );
   } ];

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      registerExports: function( angularModule ) {
         console.log( "BooksController registered." );
         angularModule.controller( 'BooksController', controller );
      }
   };
} );

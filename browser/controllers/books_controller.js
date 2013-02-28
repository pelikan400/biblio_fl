define( function() {
   'use strict';

    var controller = [ '$scope', "ixoidDatabase", function BooksController( $scope, db ) {
        console.log( "BooksController initialized." );
        $scope.$root.activeMenuId = "books";


        ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   } ];

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      registerExports: function( angularModule ) {
         console.log( "BooksController registered." );
         angularModule.controller( 'BooksController', controller );
      }
   };
} );

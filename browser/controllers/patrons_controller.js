define( function() {
   'use strict';

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   var controller = [ '$scope', "ixoidDatabase", function PatronsController( $scope, db ) {
      $scope.editablePatron = null;
      console.log( "PatronsController initialized." );
      
      $scope.editPatron = function () {
        console.log( "Hey we got a first call to editPatron" ); 
      };
   } ];

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      registerExports: function( angularModule ) {
         console.log( "PatronsController registered." );
         angularModule.controller( 'PatronsController', controller );
      }
   };
} );

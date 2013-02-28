define( function() {
   'use strict';

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   var controller = [ '$scope', "ixoidDatabase", function PatronsController( $scope, db ) {
      $scope.editablePatron = null;
      console.log( "PatronsController initialized." );
      
        $scope.$root.activeMenuId = "customers";


      ///////////////////////////////////////////////////////////////////////////////////////////////////////////
      $scope.editPatron = function () {
        console.log( "Hey we got a first call to editPatron" ); 
      };
   } ];

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      registerExports: function( angularModule ) {
         console.log( "CustomersController registered." );
         angularModule.controller( 'CustomersController', controller );
      }
   };
} );

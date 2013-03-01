define( function() {
   'use strict';

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   var controller = [ '$scope', "ixoidDatabase", function CustomersController( $scope, db ) {
      // console.log( "CustomersController initialized." );
      $scope.$root.activeMenuId = "customers";

      $scope.editableCustomer = null;

      ///////////////////////////////////////////////////////////////////////////////////////////////////////////
      $scope.editCustomer = function () {
        console.log( "Hey we got a first call to editCustomer" ); 
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

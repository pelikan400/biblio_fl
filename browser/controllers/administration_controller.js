define( function() {
   'use strict';

    var controller = [ '$scope', "ixoidDatabase", function AdministrationController( $scope, db ) {
        console.log( "AdministrationController initialized." );
        $scope.$root.activeMenuId = "administration";


        ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   } ];

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      registerExports: function( angularModule ) {
         console.log( "AdministrationController registered." );
         angularModule.controller( 'AdministrationController', controller );
      }
   };
} );

"use strict";
   
define( [], function() {
   var configuration = [ "$routeProvider", "$locationProvider", function( $routeProvider, $locationProvider ) {
      $routeProvider.when('/customers', {
         templateUrl: 'views/customers.html'
         // controller: ChapterCntl
      });
 
      // configure html5 to get links working on jsfiddle
      $locationProvider.html5Mode(true);
   }];

   ////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      registerExports: function( angularModule ) {
         console.log( "biblio routes registered." );
         angularModule.config( configuration );
      }
   };
} );

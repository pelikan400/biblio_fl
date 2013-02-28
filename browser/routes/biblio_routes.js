"use strict";
   
define( [], function() {
   var configuration = [ "$routeProvider", "$locationProvider", function( $routeProvider, $locationProvider ) {
      $routeProvider.when('/issues', {
        templateUrl: 'views/issues.html',
        controller: 'BookLoansController'
      });

      $routeProvider.when('/books', {
        templateUrl: 'views/books.html',
        controller: 'BooksController'
      });
 
      $routeProvider.when('/customers', {
        templateUrl: 'views/customers.html',
        controller: 'CustomersController'
      });
 
      $routeProvider.when('/administration', {
        templateUrl: 'views/administration.html',
        controller: 'AdministrationController'
      });
 
      $routeProvider.otherwise({ redirectTo: '/issues' } ); 

      // configure html5 to get links working on jsfiddle
      // $locationProvider.html5Mode(true);
   }];

   ////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      registerExports: function( angularModule ) {
         console.log( "biblio routes registered." );
         angularModule.config( configuration );
      }
   };
} );

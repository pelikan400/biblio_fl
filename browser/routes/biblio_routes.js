"use strict";

define( [], function() {
   var configuration = [ "$routeProvider", "$locationProvider", function( $routeProvider, $locationProvider ) {
      $routeProvider.when( '/issues', {
         templateUrl : 'views/issues.html',
         controller : 'BookLoansController'
      } );

      $routeProvider.when( '/books/:action', {
         templateUrl : 'views/book_edit.html',
         controller : 'BooksController'
      } );

      $routeProvider.when( '/books/:action/:bookId', {
         templateUrl : 'views/book_edit.html',
         controller : 'BooksController'
      } );

      $routeProvider.when( '/customers/:action', {
         templateUrl : 'views/customer_edit.html',
         controller : 'CustomersController'
      } );

      $routeProvider.when( '/customers/:action/:customerId', {
         templateUrl : 'views/customer_edit.html',
         controller : 'CustomersController'
      } );

      $routeProvider.when( '/administration', {
         templateUrl : 'views/administration.html',
         controller : 'AdministrationController'
      } );

      $routeProvider.otherwise( {
         redirectTo : '/issues'
      } );

         // configure html5 to get links working on jsfiddle
         // $locationProvider.html5Mode(true);
   } ];

   // //////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      registerExports : function( angularModule ) {
         console.log( "biblio routes registered." );
         angularModule.config( configuration );
      }
   };
} );

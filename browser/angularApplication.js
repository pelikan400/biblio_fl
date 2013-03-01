'use strict';

define( [ './controllers/application_controller', './controllers/books_controller', 
          './controllers/customers_controller', './controllers/book_loans_controller', 
          './controllers/administration_controller', 
          './services/ixoid_database', 
          './directives/util_directives', 
          './routes/biblio_routes' ], 
  function application( applicationController, booksController, 
                        customersController, bookLoansController, 
                        administrationController, 
                        ixoidDatabase, 
                        utilDirectives, 
                        biblioRoutes ) {

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   var functionArguments = Array.prototype.slice.call( arguments, 0 );
   return {
      importInto: function( angularHostModule ) {
         functionArguments.forEach( function( module ) {
            module.registerExports( angularHostModule );
         } );
      }
   };
} );


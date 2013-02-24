'use strict';

define( [ './controllers/books_controller', './controllers/patrons_controller', './controllers/book_loans_controller', './services/ixoid_database', './routes/biblio_routes' ], 
   function application( booksController, patronsController, bookLoansController, ixoidDatabase, biblioRoutes ) {

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      importInto: function( angularHostModule ) {
           [ booksController, patronsController, bookLoansController, ixoidDatabase, biblioRoutes ].forEach( function( module ) {
            console.log( module );
            module.registerExports( angularHostModule );
         } );

      }
   };
} );


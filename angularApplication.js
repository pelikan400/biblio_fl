'use strict';

define( [ './controllers/books_controller', './controllers/patrons_controller', './controllers/book_loans_controller', './services/ixoid_database' ], 
   function application( booksController, patronsController, bookLoansController, ixoidDatabase ) {

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      importInto: function( angularHostModule ) {
         console.log( ixoidDatabase );
         [ patronsController, bookLoansController, ixoidDatabase ].forEach( function( module ) {
            module.registerExports( angularHostModule );
         } );

      }
   };

} );


'use strict';

define( [ './controllers/book_loans_controller' ], function application( bookLoansController ) {

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      importInto: function( angularHostModule ) {
         [bookLoansController].forEach( function( module ) {
            module.registerExports( angularHostModule );
         } );

      }
   }

} );


'use strict';

define( [ './controllers/book_loans_controller', './services/ixoid_database' ], function application( bookLoansController, ixoidDatabase ) {

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      importInto: function( angularHostModule ) {
         console.log( ixoidDatabase );
         [ bookLoansController, ixoidDatabase ].forEach( function( module ) {
            module.registerExports( angularHostModule );
         } );

      }
   };

} );


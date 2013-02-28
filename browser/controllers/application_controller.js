'use strict';

define( function() {
    var controller = [ '$scope', "ixoidDatabase", "$q", function ApplicationController( $scope, db, q ) {
        $scope.mainMenu = [ 
          { id: "issues", name : "Ausleihen", href: "#/issues" },
          { id: "books", name : "Bücher", href: "#/books" },
          { id: "customers", name : "Kunden", href: "#/customers" },
          { id: "administration", name : "Administration", href: "#/administration", 
            submenu: [ 
             { id: "systemUsers", name : "Ausleihen", href: "#/systemUsers" },
             { id: "importBooks", name : "Bücher importieren", href: "#/importBooks" },
             { id: "barcodes", name : "Barcodes", href: "#/barcodes" }
            ]
          }
        ];
   } ];

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      registerExports: function( angularModule ) {
         console.log( "ApplicationController registered." );
         angularModule.controller( 'ApplicationController', controller );
      }
   };
} );

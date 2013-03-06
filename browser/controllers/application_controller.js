'use strict';

define( function() {
    var controller = [ '$scope', "ixoidDatabase", "$q", function ApplicationController( $scope, db, q ) {
        $scope.mainMenu = [ 
          { id: "issues", name : "Ausleihen", href: "#/issues" },
          { id: "books", name : "Bücher",
            submenu: [ 
             { id: "", name : "Liste aller ausgeliehenen Büchern", href: "#/books/listIssued" },
             { id: "", name : "Neues Buch anlegen", href: "#/books/new" }
            ]
          },
          { id: "customers", name : "Kunden", href: "#/customers/new", 
            submenu: [ 
             { id: "", name : "Liste aller Kunden", href: "#/customers/list" },
             { id: "", name : "Neuen Kunden anlegen", href: "#/customers/new" }
            ]
          },
          { id: "administration", name : "Administration",
            submenu: [ 
             { id: "systemUsers", name : "Ausleihen", href: "#/systemUsers" },
             { id: "importBooks", name : "Bücher importieren", href: "#/importBooks" },
             { id: "barcodes", name : "Barcodes", href: "#/barcodes" }
            ]
          }
        ];

        $scope.ixoidMessages = [];
   } ];

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      registerExports: function( angularModule ) {
         console.log( "ApplicationController registered." );
         angularModule.controller( 'ApplicationController', controller );
      }
   };
} );

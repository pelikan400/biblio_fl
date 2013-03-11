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
        
        $scope.errorMessage = function( msg ) {
           console.log( msg );
           $scope.ixoidMessages.push( {
              text: msg,
              type: "error"
           });
        };
        
        $scope.warningMessage = function( msg ) {
           console.log( msg );
           $scope.ixoidMessages.push( {
              text: msg,
              type: "warning"
           });
        };
        
        $scope.successMessage = function( msg ) {
           console.log( msg );
           $scope.ixoidMessages.push( {
              text: msg,
              type: "success"
           });
        };
        
        $scope.infoMessage = function( msg ) {
           console.log( msg );
           $scope.ixoidMessages.push( {
              text: msg,
              type: "success"
           });
        };
        
        $scope.retryPromiseMessage = function( msg, btnOk, btnCancel ) {
           console.log( msg );
           var deferred = q.defer();
           $scope.ixoidMessages.push( { 
              text : msg, 
              type: "warning",
              retry: function() { 
                 deferred.resolve( true );
              },
              abort: function() {
                 deferred.resolve( false );
              }
           });
           return deferred.promise;
        };
   } ];

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      registerExports: function( angularModule ) {
         console.log( "ApplicationController registered." );
         angularModule.controller( 'ApplicationController', controller );
      }
   };
} );

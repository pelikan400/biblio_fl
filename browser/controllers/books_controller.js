"use strict";

define( function() {
   'use strict';

     var controller = [ '$scope', '$routeParams', '$location', "ixoidDatabase", 
                        function BooksController( $scope, $routeParams, $location, db ) {
        console.log( "BooksController initialized." );
        $scope.$root.activeMenuId = "books";

        // console.log( "routeParams:" );
        // console.log( $routeParams );

        if( $routeParams.action == "list" ) {
          // get book list
        }
        if( $routeParams.action == "new" ) {
          $scope.editableBook = db.createBook();
          $scope.originalBarcode = $scope.editableBook.barcode;
        }
        else if( $routeParams.action == "edit" && $routeParams.bookId ) {
          db.getBookById( $routeParams.bookId ) 
          .then( function( book ) {
             $scope.editableBook = book;
             $scope.originalBarcode = $scope.editableBook.barcode;
          } );
        }

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////

        $scope.saveBook = function() {
          console.log( "Called saveBook." );
          if( $scope.originalBarcode == $scope.editableBook.barcode ) {
            $scope.editableBook.put();
            return;
          }

          if( ! db.checkBarcodeString( $scope.editableBook.barcode ) ) {
            console.log( "Fehlerhafter Barcode!" );
            $scope.ixoidMessages.push( { text: "Fehlerhafter Barcode!", type: "error" } );
            return;
          }

          var barcodeObject = db.createBarcode( $scope.editableBook.barcode, $scope.editableBook.id );
          barcodeObject.put();
          $scope.editableBook.put();
          $scope.originalBarcode = $scope.editableBook.barcode;
          $scope.ixoidMessages.push( { text: "Buch gespeichert!", type: "success" } );
        };
   } ];

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      registerExports: function( angularModule ) {
         console.log( "BooksController registered." );
         angularModule.controller( 'BooksController', controller );
      }
   };
} );

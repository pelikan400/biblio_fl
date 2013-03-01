"use strict";

define( function() {
   'use strict';

     var controller = [ '$scope', '$routeParams', '$location', "ixoidDatabase", function BooksController( $scope, $routeParams, $location, db ) {
        console.log( "BooksController initialized." );
        $scope.$root.activeMenuId = "books";

        console.log( "routeParams:" );
        console.log( $routeParams );

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

        var checkBarcodeString = function( barcodeString ) {
          if( ! barcodeString ) {
            return false;
          }
          var checksum = 0;
          var barcodeStringLength = barcodeString.length;
          var charCodeZero = "0".charCodeAt( 0 );
          var pos = 0;
          var weights = [ 1, 3 ];
          for( let i = barcodeStringLength - 1; i >= 0; --i ) {
            let c = barcodeString.charCodeAt( i ) - charCodeZero;
            let weight = c * weights[ pos % 2 ];
            checksum += weight;
            ++pos;
          }
          checksum = checksum % 10;
          console.log( "checksum of " + barcodeString + " is " + checksum );
          return checksum == 0;
        };

 
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////

        $scope.saveBook = function() {
          console.log( "Called saveBook." );
          if( $scope.originalBarcode == $scope.editableBook.barcode ) {
            $scope.editableBook.put();
            return;
          }

          if( !checkBarcodeString( $scope.editableBook.barcode ) ) {
            console.log( "Fehlerhafter Barcode!" );
            $scope.ixoidMessages.push( { text: "Fehlerhafter Barcode!", type: "error" } );
            return;
          }

          var barcodeObject = db.createBarcode( $scope.editableBook.barcode, $scope.editableBook.id );
          barcodeObject.put();
          $scope.editableBook.put();
          $scope.originalBarcode = $scope.editableBook.barcode;
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

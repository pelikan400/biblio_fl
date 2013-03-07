"use strict";

define( [ "underscore" ], function( _ ) {
   'use strict';

     var controller = [ '$scope', '$routeParams', '$location', "ixoidDatabase", 
                        function BooksController( $scope, $routeParams, $location, db ) {
        console.log( "BooksController initialized." );
        $scope.$root.activeMenuId = "books";

        // console.log( "routeParams:" );
        // console.log( $routeParams );

        $scope.bookList = null;
        $scope.bookListTitle = "";
        $scope.editableBook = null;

        if( $routeParams.action == "listIssued" ) {
            db.scanBooks( "ISSUED" )
            .then( function( bookList ) { 
                var customerIdList = [];
                $scope.bookListTitle = "Liste aller ausgeliehenen Büchern";
                $scope.bookList = bookList;
                $scope.bookList.sort( function( r1, r2 ) {
                    return r1.dueDate.getTime() - r2.dueDate.getTime();
                });
                _.each( bookList, function( book ) {
                    customerIdList.push( book.issuedBy );
                });
                db.getCustomersByIdList( customerIdList ) 
                .then( function( customers ) { 
                    _.each( customers, function( customer, idx ) {
                       $scope.bookList[ idx ].issuedByCustomer = customer;
                   }); 
                }); 
            });
        }
        else if( $routeParams.action == "list" ) {
          // get book list
        }
        else if( $routeParams.action == "new" ) {
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

         if( !$scope.editableBook.title || !$scope.editableBook.signature ) {
            $scope.ixoidMessages.push( {
               text : "Bitte Titel und Nummer angeben.",
               type : "error"
            } );
            return;
         }

          if( $scope.originalBarcode != $scope.editableBook.barcode ) {
              if( ! db.checkBarcodeString( $scope.editableBook.barcode ) ) {
                  console.log( "Fehlerhafter Barcode!" );
                  $scope.ixoidMessages.push( { text: "Fehlerhafter Barcode.", type: "error" } );
                  return;
              }
           
              // TODO: check for duplicate barcodes
              // TODO: delete old barcode
              var barcodeObject = db.createBarcode( $scope.editableBook.barcode, $scope.editableBook.id );
              barcodeObject.put();
          }

          $scope.editableBook.put();
          $scope.originalBarcode = $scope.editableBook.barcode;
          $scope.ixoidMessages.push( { text: "Buch gespeichert.", type: "success" } );
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

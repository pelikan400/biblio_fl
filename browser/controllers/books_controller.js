"use strict";

define( [ "underscore" ], function( _ ) {
   'use strict';

     var controller = [ '$scope', '$routeParams', '$location', "ixoidDatabase", "$q",
                        function BooksController( $scope, $routeParams, $location, db, q ) {
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

        var checkAndSaveBarcode = function() {
           var promiseTrue = q.when( true );
           var promiseFalse = q.when( false );
           var resetBarcodeToOldValue = function() {
              $scope.warningMessage( "Barcode wurde auf alten Wert zurückgesetzt." );
              $scope.editableBook.barcode = $scope.originalBarcode;
              return promiseFalse;
           };
           

           var deleteBarcode = function( barcodeNumber ) {
              if( !barcodeNumber ) {
                 return promiseTrue;
              }
              else {
                 return db.createBarcode( $scope.originalBarcode ).del();
              }
           };
           
           var saveBarcode = function() {
              // TODO: check for duplicate barcodes
              return db.createBarcode( $scope.editableBook.barcode ).get()
              .then( function( doc ) {
                 if( doc ) {
                    $scope.errorMessage(  "Neuer Barcode ist bereits vergeben." );
                    return resetBarcodeToOldValue();
                 }
                 else {
                    // TODO: delete old barcode
                    return  deleteBarcode( $scope.originalBarcode )
                    .then( function() {
                       if( $scope.editableBook.barcode ) {
                          return db.createBarcode( $scope.editableBook.barcode, $scope.editableBook.id ).put();
                       } else {
                          return promiseTrue;
                       }
                    });
                 }
              });
           };
           
           console.log( "original barcode: " + $scope.originalBarcode );  
           console.log( "new barcode: " + $scope.editableBook.barcode );  

           if( $scope.originalBarcode == $scope.editableBook.barcode ) {
              return promiseTrue;
           }
           
           if( $scope.editableBook.barcode ) {
              if( ! db.checkBarcodeString( $scope.editableBook.barcode ) ) {
                 $scope.errorMessage( "Fehlerhafter Barcode." );
                 return promiseFalse;
             }
             
             if( !$scope.originalBarcode ) {
                return saveBarcode();
             }
           }
           
           return $scope.retryPromiseMessage( "Barcode wirklich ändern?" )
           .then( function( result ) {
              if( result ) {
                 return saveBarcode();
              } else {
                 return resetBarcodeToOldValue();
              }
           });
        };

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////

        $scope.saveBook = function() {
         if( !$scope.editableBook.title || !$scope.editableBook.signature ) {
            $scope.errorMessage( "Bitte Titel und Nummer angeben." );
            return;
         }

          checkAndSaveBarcode()
          .then( function( result ) {
             if( result ) {
                $scope.editableBook.put();
                $scope.originalBarcode = $scope.editableBook.barcode;
                $scope.successMessage( "Buch gespeichert." );
             }
          });
        };

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////

        $scope.deleteBook = function() {
          return $scope.retryPromiseMessage( "Wollen Sie das Buch löschen wollen?" )
          .then( function( result ) {
             if( result ) {
                return db.createBarcode( $scope.editableBook.barcode ).del()
                .then( function() {
                   return $scope.editableBook.del();
                })
                .then( function() { 
                   $scope.editableBook = db.createBook();
                   $scope.originalBarcode = $scope.editableBook.barcode;
                   $scope.successMessage( "Buch wurde gelöscht." );
                   return $scope.editableBook;
                });
             } else {
                console.log( "Action aborted." );
             }
          });
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

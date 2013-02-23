define( function() {
   'use strict';

   // TODO we need access to database of books, patrons, and circulations
   
   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

    function isDigit( c )
    {
        var code = c.charCodeAt( 0 );
        var code0 = "0".charCodeAt( 0 );
        var code9 = String( "9" ).charCodeAt( 0 );
        return code >= 0 && code <= code9;
    }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

    var controller = [ '$scope', "ixoidDatabase", function BookLoansController( $scope, db ) {
        $scope.searchedBooks = null;
        $scope.issuedBooks = null;
        $scope.patron = null;
        $scope.generalInputText = "";
        console.log( "BookLoansController initialized." );

        var getIssuedBooks = function( patron ) {
           return db.getIssuedBooksByPatron( patron )
           .then( function( issuedBooks ) {
              console.log( "issuedBooks are:" );
              console.log( issuedBooks );
              $scope.issuedBooks = issuedBooks;
              return issuedBooks;
           } );
        };
        
        
        var patronAddBook = function( patron, bookId ) {
           if( !patron.books ) {
              patron.books = {};
           }
           patron.books[ bookId ] = bookId;
        };

        
        var patronRemoveBook = function( patron, bookId ) {
           if( patronHasBook( patron, bookId ) ) {
              delete patron.books[ bookId ];
           }
        };

        
        var patronHasBook = function( patron, bookId ) {
           if( !patron.books ) {
              return false;
           }
           return bookId in patron.books;
        };
        
        
        // TODO: put focus on generalInputText ?
        $scope.parseGeneralInput = function () {
            console.log( "Input is: '" + $scope.generalInputText + "'" );
            var text = $scope.generalInputText;
            if( isDigit( text ) ) {
               if( text.length < 6 || text[0] == "0" ) {
                   console.log( "Person ID detected: " + text );
                   db.getPatronByBarcode( text )
                   .then( function( patron ) {
                      $scope.patron = patron;
                      getIssuedBooks( patron );
                       return patron;
                   });
               } else {
                 // save book AND patron on every status change of the book 
                   console.log( "Book ID detected: " + text );
                   db.getBookByBarcode( text )
                   .then( function( book ) {
                     if( book ) {
                        console.log( "found book" );
                        console.log( book );
                        if( !book.issuedBy ) {
                           book.issuedBy = $scope.patron.id;
                           book.issuedStatus = "ISSUED";
                           getIssuedBooks( $scope.patron );
                        }
                        else if( book.issuedBy == $scope.patron.id ) {
                           if( book.issuedStatus == "RETURNED" ) {
                              book.issuedStatus = "ISSUED";
                           } else {
                              book.issuedStatus = "RETURNED";
                           }
                           getIssuedBooks( $scope.patron );
                        } else {
                           if( book.issuedStatus == "RETURNED" ) {
                              book.issuedStatus = "ISSUED";
                              book.issuedBy = $scope.patron.id;
                              getIssuedBooks( $scope.patron );
                           }
                           else {
                              // change the patron and set to RETURNED
                              book.issuedStatus = "RETURNED";
                              $scope.patron = db.getPatronByBarcode( book.patron.barcode )
                              .then( function( patron ) {
                                 getIssuedBooks( patron );
                                 return patron;
                              });
                           }
                        }
                     }
                   });
               };
            } else {
                if( text.charAt( 0 ) == "?" ) {
                    text = text.substring( 1 ).trim();
                }
                console.log( "Text search: '" + text + "'" );
            }

            $scope.generalInputText = "";
        };
   } ];

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      registerExports: function( angularModule ) {
         console.log( "BookLoansController registered." );
         angularModule.controller( 'BookLoansController', controller );
      }
   };
} );

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
           db.getIssuedBooksByPatron( patron )
           .then( function( issuedBooks ) {
              console.log( "issuedBooks are:" );
              console.log( issuedBooks );
              $scope.issuedBooks = issuedBooks;
              return issuedBooks;
           } );
        };
        
        
        $scope.testRestGet = function() {
           console.log( "testRestGet" );
           db.testRestGet();
        };
        
        $scope.testRestPut = function() {
           console.log( "testRestPut" );
           db.testRestPut();
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
                   console.log( "Book ID detected: " + text );
                   db.getBookByBarcode( text )
                   .then( function( book ) {
                     if( book ) {
                        console.log( "found book" );
                        if( !book.issuedBy ) {
                           book.issuedBy = $scope.patron.id;
                           book.issuedStatus = "ISSUED";
                        }
                        else if( book.issuedBy == $scope.patron.id ) {
                           if( book.issuedStatus == "RETURNED" ) {
                              book.issuedStatus = "ISSUED";
                           } else {
                              book.issuedStatus = "RETURNED";
                           }
                        } else {
                           if( book.issuedStatus == "RETURNED" ) {
                              book.issuedStatus = "ISSUED";
                              book.issuedBy = $scope.patron.id;
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
                        getIssuedBooks( $scope.patron );
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

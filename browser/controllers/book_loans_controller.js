'use strict';

define( function() {

   // TODO we need access to database of books, customers, and circulations
   
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
        $scope.customer = null;
        $scope.generalInputText = "";
        console.log( "BookLoansController initialized." );

        var getIssuedBooks = function( customer ) {
           return db.getIssuedBooksByCustomer( customer )
           .then( function( issuedBooks ) {
              console.log( "issuedBooks are:" );
              console.log( issuedBooks );
              $scope.issuedBooks = issuedBooks;
              return issuedBooks;
           } );
        };
        
        
        // TODO: put focus on generalInputText ?
        $scope.parseGeneralInput = function () {
            console.log( "Input is: '" + $scope.generalInputText + "'" );
            var text = $scope.generalInputText;
            if( isDigit( text ) ) {
               if( text.length < 6 || text[0] == "0" ) {
                   console.log( "Person ID detected: " + text );
                   db.getCustomerByBarcode( text )
                   .then( function( customer ) {
                      if( customer ) {
                         $scope.customer = customer;
                         getIssuedBooks( customer );
                         return customer;
                      }
                   });
               } else {
                 // save book AND customer on every status change of the book 
                   console.log( "Book ID detected: " + text );
                   db.getBookByBarcode( text )
                   .then( function( book ) {
                     if( book ) {
                        console.log( "found book" );
                        console.log( book );
                        if( !book.issuedBy ) {
                           book.issuedBy = $scope.customer.id;
                           book.issuedStatus = "ISSUED";
                           getIssuedBooks( $scope.customer );
                        }
                        else if( book.issuedBy == $scope.customer.id ) {
                           if( book.issuedStatus == "RETURNED" ) {
                              book.issuedStatus = "ISSUED";
                           } else {
                              book.issuedStatus = "RETURNED";
                           }
                           getIssuedBooks( $scope.customer );
                        } else {
                           if( book.issuedStatus == "RETURNED" ) {
                              book.issuedStatus = "ISSUED";
                              book.issuedBy = $scope.customer.id;
                              getIssuedBooks( $scope.customer );
                           }
                           else {
                              // change the customer and set to RETURNED
                              book.issuedStatus = "RETURNED";
                              $scope.customer = db.getCustomerByBarcode( book.customer.barcode )
                              .then( function( customer ) {
                                 getIssuedBooks( customer );
                                 return customer;
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

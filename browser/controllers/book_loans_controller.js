'use strict';

define( function() {

   // TODO we need access to database of books, customers, and circulations
   
   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

    function isDigit( c )
    {
        var code = c.charCodeAt( 0 );
        var code0 = "0".charCodeAt( 0 );
        var code9 = String( "9" ).charCodeAt( 0 );
        return code >= code0 && code <= code9;
    }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

    var controller = [ '$scope', "ixoidDatabase", "$q", function BookLoansController( $scope, db, q ) {
        $scope.searchedBooks = null;
        $scope.issuedBooks = null;
        $scope.customer = null;
        $scope.generalInputText = "";
        console.log( "BookLoansController initialized." );

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////

        var fetchIssuedBooks = function() {
          if( $scope.customer ) {
            console.log( "fetch new book list for: " + $scope.customer.id );
            console.log( $scope.customer );
            $scope.customer.getBooks()
            .then( function( books ) {
                $scope.issuedBooks = books;
                console.log( "issued books are:" );
                console.log( $scope.issuedBooks );
            });
          } else {
            console.log( "fetch new book list: no customer checked in" );
            $scope.issuedBooks = null;
          }
        };


        ///////////////////////////////////////////////////////////////////////////////////////////////////////////

        var processBook = function ( book ) {
          console.log( "book id:" + book.id );
          console.log( "issued by: " + book.issuedBy );
          if( ( ! $scope.customer ) && ( ! book.issuedStatus || book.issuedStatus == "RETURNED" ) ){
            console.log( "no customer logged in and book RETURNED or never issued" );
            // no customer logged so there is no destination 
            // TODO: show the book details in searchedBooks 
            return null;
          } else if( book.issuedStatus == "ISSUED"  ) {
            console.log( "book is ISSUED will be RETURNED" );
             // book was ISSUED and is returned now 
             // change the logged in customer to the one specified on the book
             book.issuedStatus = "RETURNED";
             book.put()
             .then( function( book ) {
                 // TODO: check for errors or database updates
                 if( book.issuedBy != $scope.customer.id ) {
                   console.log( "get the customer who ISSUED the book" );
                   return db.getCustomerById( book.issuedBy )
                     .then( function( customer ) {
                         console.log( "change checked in customer" );
                         $scope.customer = customer;
                         return customer;
                       });
                 }
                 else {
                   return $scope.customer;
                 }
               })
             .then( function() {
                 fetchIssuedBooks();
             });
           } else {
             console.log( "book is RETURNED will be ISSUED" );
             console.log( "checked in customer id: " + $scope.customer.id );
             // one customer is logged in, book was RETURNED and will be ISSUED
             if( book.issuedBy == $scope.customer.id ) {
               // special case where the book is RETURNED and ISSUED by the same person 
               // if this is done on the same day, then it is a prolongation
               // TODO: handle PROLONGATION
             } else {
             }
             
             book.issuedStatus = "ISSUED";
             var saveOldCustomer = function( oldCustomer ) {
                if( book.issuedBy ) {
                   db.getCustomerById( oldCustomer )
                   .then( function( customer ) {
                       console.log( "remove book from old customer" );
                       customer.removeBook( book.id );
                       console.log( "save old customer" );
                       return customer.put();
                   });
                }
                else {
                   console.log( "can not find old customer: " );
                   return q.when( null );
                }
             };
             
             saveOldCustomer( book.issuedBy )
             .then( function() {
                 console.log( "save book" );
                 book.issuedBy = $scope.customer.id;
                 return book.put();
             })
             .then( function() {
                 console.log( "add book to new customer" );
                 $scope.customer.addBook( book.id );
                 console.log( "save new customer" );
                 return $scope.customer.put();
             })
             .then( function() {
                 return fetchIssuedBooks();
               });
           }
        };


        // TODO: put focus on generalInputText ?
        $scope.parseGeneralInput = function () {
           console.log( "Input is: '" + $scope.generalInputText + "'" );
            // console.log( "Import dummy data" );
            // db.importDummyData();
            var text = $scope.generalInputText;
            if( isDigit( text ) ) {
               if( text.length < 6 || text[0] == "0" ) {
                   console.log( "Person ID detected: " + text );
                   db.getCustomerByBarcode( text )
                   .then( function( customer ) {
                         $scope.customer = customer;
                         fetchIssuedBooks();
                         return customer;
                   });
               } else {
                 // save book AND customer on every status change of the book 
                   console.log( "Book ID detected: " + text );
                   db.getBookByBarcode( text )
                   .then( function( book ) {
                     if( book ) {
                        console.log( "found book: " + book.title );
                        processBook( book );
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

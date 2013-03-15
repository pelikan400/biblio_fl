'use strict';

define( [ "jquery" ], function( jquery ) {
   var controller = [ '$scope', "$routeParams", "$location", "ixoidDatabase", "$q", function BookLoansController( $scope, $routeParams, $location, db, q ) {
      console.log( "BookLoansController initialized." );
      $scope.$root.activeMenuId = "issues";

      $scope.searchText = null;
      $scope.searchedBooks = null;
      $scope.issuedBooks = null;
      $scope.returnedBooks = null;
      $scope.customer = null;
      $scope.generalInputText = "";
      
      $scope.searchedCustomerText = null;
      $scope.searchedCustomers = null;
      $scope.searchedCustomersMap = null;
  
      // /////////////////////////////////////////////////////////////////////////////////////////////////////////

      $scope.showCustomerById = function( customerId ) {
         var newPath = "/issues/show/" + customerId;
         console.log( "change path to: " + newPath );
         $location.path( newPath );
      };

      // /////////////////////////////////////////////////////////////////////////////////////////////////////////

      $scope.checkInCustomerById = function( customerId ) {
         db.getCustomerById( customerId )
         .then( function( customer ) {
            console.log( "checkin customer: " );
            console.log( customer );
            if( customer ) {
               $scope.customer = customer;
               fetchIssuedBooks();
            }
         });
      };

      // /////////////////////////////////////////////////////////////////////////////////////////////////////////

      var actionRoute = function() {
         console.log( $routeParams );
         var customerId = $routeParams.customerId;
         if( $routeParams.action == "show" && customerId ) {
            console.log( "check in customer with id: " + customerId );
            $scope.checkInCustomerById( customerId );
         };
         
      };

      // /////////////////////////////////////////////////////////////////////////////////////////////////////////

      var isDigit = function( c ) {
         var code = c.charCodeAt( 0 );
         var code0 = "0".charCodeAt( 0 );
         var code9 = String( "9" ).charCodeAt( 0 );
         return code >= code0 && code <= code9;
      };

      // /////////////////////////////////////////////////////////////////////////////////////////////////////////

      var fetchIssuedBooks = function() {
         if( $scope.customer ) {
            console.log( "fetch new book list for: " + $scope.customer.id );
            console.log( $scope.customer );
            $scope.customer.getBooks().then( function( books ) {
               $scope.issuedBooks = [];
               $scope.returnedBooks = [];
               books.forEach( function( book ) {
                  if( book.isIssued() ) {
                     $scope.issuedBooks.push( book );
                  }
                  else {
                     $scope.returnedBooks.push( book );
                  }
               } );
               $scope.returnedBooks.sort( function( r1, r2 ) { 
                  if( !r1.returnDate ) {
                     return 1;
                  }
                  if( !r2.returnDate ) {
                     return -1;
                  }
                   return r2.returnDate.getTime() - r1.returnDate.getTime();
               });
               $scope.issuedBooks.sort( function( r1, r2 ) { 
                  if( !r1.returnDate ) {
                     return 1;
                  }
                  if( !r2.returnDate ) {
                     return -1;
                  }
                   return r2.issueDate.getTime() - r1.issueDate.getTime();
               });
               console.log( $scope.issuedBooks );
            } );
         }
         else {
            console.log( "fetch new book list: no customer checked in" );
            $scope.issuedBooks = null;
            $scope.returnedBooks = null;
         }
      };

      // /////////////////////////////////////////////////////////////////////////////////////////////////////////

     var searchForCustomers = function( searchText ) {
        $scope.searchedCustomerText = searchText;
        db.scanCustomers( searchText ) 
        .then( function( customerList ) {
           $scope.searchedCustomers = customerList;
           $scope.searchedCustomersMap = {};
           customerList.forEach( function( customer ) {
              $scope.searchedCustomersMap[ customer.id ] = customer; 
           });
           $scope.customer = null;
        });
     };
     
      // /////////////////////////////////////////////////////////////////////////////////////////////////////////

      var processBook = function( book, searchText ) {
         console.log( "book id:" + book.id );
         console.log( "issued by: " + book.issuedBy );
         if( book.isIssued() ) {
            console.log( "book is ISSUED  -> will be RETURNED" );
            book.returnAction();
            return book.put()
            .then( function( book ) {
               $scope.warningMessage( "'" + book.title + "' zurückgebracht." );
               // change the logged in customer to the one specified on the book
               if( !$scope.customer || book.issuedBy != $scope.customer.id ) {
                  // the customer is only needed because of createCirculation
                  return db.getCustomerById( book.issuedBy ).then( function( customer ) {
                     $scope.infoMessage( customer.barcode + ": " + customer.firstName + " " + customer.lastName + " geladen."  );
                     $scope.showCustomerById( book.issuedBy );
                     return customer;
                  } );
               }
               else {
                  fetchIssuedBooks();
                  return $scope.customer;
               }
            } )
            .then( function( customer ) {
                return db.createCirculation( book, customer ).put();
            } );
         }
         else if( !$scope.customer ) {
            console.log( "no customer logged in and book is NOT ISSUED" );
            // no customer logged so there is no destination
            $scope.searchText = searchText;
            $scope.searchedBooks = [ book ];
            return null;
         }
         else {
            $scope.errorMessage( "'" + book.title + "' ausgeliehen." );
            console.log( "book is RETURNED and will be ISSUED" );
            console.log( "checked in customer id: " + $scope.customer.id );

            var removeBookFromPreviousCustomerAndAddToCurrent = function( previousCustomerId ) {
               if( previousCustomerId && previousCustomerId != $scope.customer.id ) {
                  return db.getCustomerById( previousCustomerId ).then( function( customer ) {
                     console.log( "remove book from old customer" );
                     customer.removeBook( book.id );
                     console.log( "save old customer" );
                     return customer.put();
                  } );
               }
               else {
                  console.log( "can not find old customer: " );
                  return q.when( null );
               }
            };

            var previousCustomerId = book.issuedBy;
            book.issueAction( $scope.customer.id );
            
            console.log( "Save book" );
            return book.put()
            .then( function( book ) {
               console.log( "Create circulation." );
               return db.createCirculation( book, $scope.customer ).put();
            } )
            .then( function() {
               console.log( "remove book from previous customer." );
               return removeBookFromPreviousCustomerAndAddToCurrent( previousCustomerId ); 
            } )                  
            .then( function() {
               console.log( "add book to new customer" );
               $scope.customer.addBook( book.id );
               console.log( "save new customer" );
               $scope.infoMessage( "'" + book.title + "' ausgeliehen." );
               return $scope.customer.put();
            } )
            .then( function() {
               console.log( "fetch issued books" );
               return fetchIssuedBooks();
            } );
         }
      };

      // /////////////////////////////////////////////////////////////////////////////////////////////////////////

      $scope.parseGeneralInput = function() {
         var searchText = $scope.generalInputText.trim();
         if( isDigit( searchText ) ) {
            if( searchText.length < 6 || searchText[ 0 ] == "0" ) {
               console.log( "Person ID detected: " + searchText );
               db.getCustomerByBarcode( searchText )
               .then( function( customer ) {
                  if( customer ) {
                     $location.path( "/issues/show/" + customer.id ).replace();
                     $scope.infoMessage( customer.barcode + ": " + customer.firstName + " " + customer.lastName + " geladen."  );
                  }
                  else {
                     $location.path( "/issues" );
                     $scope.warningMessage( searchText + ": Kein Kunde mit diesem Barcode gefunden." );
                  }
                  // $scope.customer = customer;
                  // fetchIssuedBooks();
                  return customer;
               } );
            }
            else {
               // save book AND customer on every status change of the book
               console.log( "Book ID detected: " + searchText );
               db.getBookByBarcode( searchText )
               .then( function( book ) {
                  if( book ) {
                     console.log( "found book: " + book.title );
                     processBook( book, searchText );
                  }
                  else {
                     $scope.warningMessage( searchText + ": Kein Buch mit diesem Barcode gefunden." );
                  }
               } );
            }
            ;
         }
         else if( searchText.charAt( 0 ) == "+") {
            searchText = searchText.substring( 1 );
            // console.log( "Search for Persons: " + searchText );
            if( searchText.length < 3 ) {
               $scope.errorMessage( "Suchtext ist zu kurz!" );
               return;
            }
            searchForCustomers( searchText );
         } 
         else {
            // console.log( "Text search: '" + searchText + "'" );
            if( searchText.length < 3 ) {
               $scope.errorMessage( "Suchtext ist zu kurz!" );
               return;
            }
            $scope.searchText = searchText;
            db.scanBooks( searchText )
            .then( function( books ) {
               $scope.searchedBooks = books;
            } );
         }

         $scope.generalInputText = "";
      };
      
      actionRoute();
   } ];

   // /////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      registerExports : function( angularModule ) {
         console.log( "BookLoansController registered." );
         angularModule.controller( 'BookLoansController', controller );
      }
   };
} );

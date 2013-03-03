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

      console.log( $routeParams );
      var customerId = $routeParams.customerId;
      if( $routeParams.action == "show" && customerId ) {
         console.log( "check in customer with id: " + customerId );
         $scope.checkInCustomerById( customerId );
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
                  if( book.issuedStatus == "RETURNED" ) {
                     $scope.returnedBooks.push( book );
                  }
                  else {
                     $scope.issuedBooks.push( book );
                  }
               } );
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

     $scope.checkInCustomerByIndex = function( customerIndex ) {
        var customer = $scope.searchedCustomers[ customerIndex ];
        if( customer ) {
           $location.path( "#/issues/show/" + customer.id  );
        }
     };

      // /////////////////////////////////////////////////////////////////////////////////////////////////////////

      var processBook = function( book, searchText ) {
         console.log( "book id:" + book.id );
         console.log( "issued by: " + book.issuedBy );
         if( book.issuedStatus == "ISSUED" ) {
            console.log( "book is ISSUED will be RETURNED" );
            // book was ISSUED and is returned now
            // change the logged in customer to the one specified on the book
            book.issuedStatus = "RETURNED";
            book.returnDate = new Date();
            book.dueDate = null;
            book.put().then( function( book ) {
               // TODO: check for errors or database updates
               if( !$scope.customer || book.issuedBy != $scope.customer.id ) {
                  console.log( "get the customer who ISSUED the book" );
                  return db.getCustomerById( book.issuedBy ).then( function( customer ) {
                     console.log( "change checked in customer" );
                     $scope.customer = customer;
                     return customer;
                  } );
               }
               else {
                  return $scope.customer;
               }
            } ).then( function() {
               fetchIssuedBooks();
            } );
         }
         else if( !$scope.customer ) {
            console.log( "no customer logged in and book is NOT ISSUED" );
            // no customer logged so there is no destination
            // TODO: show the book details in searchedBooks
            $scope.searchText = searchText;
            $scope.searchedBooks = [ book ];
            return null;
         }
         else {
            console.log( "book is RETURNED and will be ISSUED" );
            console.log( "checked in customer id: " + $scope.customer.id );
            // one customer is logged in, book was RETURNED and will be ISSUED
            if( book.issuedBy == $scope.customer.id ) {
               book.issueCounter += 1;
               // special case where the book is RETURNED and ISSUED by the same
               // person
               // if this is done on the same day, then it is a prolongation
               // TODO: handle PROLONGATION
            }
            else {
            }

            book.issuedStatus = "ISSUED";
            book.issueDate = new Date();
            book.dueDate = book.issueDate.addDays( 14 );
            book.issueCounter = 1;
            var saveOldCustomer = function( oldCustomer ) {
               if( book.issuedBy ) {
                  return db.getCustomerById( oldCustomer ).then( function( customer ) {
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

            saveOldCustomer( book.issuedBy ).then( function() {
               console.log( "save book" );
               book.issuedBy = $scope.customer.id;
               return book.put();
            } ).then( function() {
               console.log( "add book to new customer" );
               $scope.customer.addBook( book.id );
               console.log( "save new customer" );
               return $scope.customer.put();
            } ).then( function() {
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
                  var newLocation = "/issues/show/" + customer.id;
                  console.log( "new location is: " + newLocation ); 
                  $location.path( newLocation ).replace();
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
               } );
            }
            ;
         }
         else if( searchText.charAt( 0 ) == "+") {
            searchText = searchText.substring( 1 );
            console.log( "Search for Persons: " + searchText );
            searchForCustomers( searchText );
         } 
         else {
            console.log( "Text search: '" + searchText + "'" );
            if( searchText.length < 3 ) {
               $scope.ixoidMessages.push( { text: "Suchtext ist zu kurz!", type: "error" } );
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
   } ];

   // /////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      registerExports : function( angularModule ) {
         console.log( "BookLoansController registered." );
         angularModule.controller( 'BookLoansController', controller );
      }
   };
} );

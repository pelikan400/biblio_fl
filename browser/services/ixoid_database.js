"use strict";
   
define( [ "angular", "underscore", "./restDB" ], function( angular, _, dbm ) {
   var dummyData = null;
   var books = null;
   var customers = null;
   var circulations = [];

   var service = [ "$q", "$timeout", "$http", "$resource", function( q, timeout, $http, $resource ) {
      
      ////////////////////////////////////////////////////////////////////////////////////////////////////

      
      // API proposal: 
      // createBook, updateBook, readBook, deleteBook
      // createBookBarcode, getBookBarcode, deleteBookBarcode
      // create, update, read, erase (delete is reserved)
      // book, 
      // document based
      var db = dbm.db( $http, "/db" );
      
      var dumpDummyDataIntoDatabase = function() {
         var customerPromises = [];
         customers.forEach( function( customer ) {
            customer.id = "customer-barcode-" + customer.barcode;
            customer.schoolClass = "1a";
            customer.docType = "PATRON";
            customer.maximumIssues = 1;
            customerPromises.push( db.putDocument( customer.id, customer )
               .then( function( item ) {
                  console.log( "PUT succeeded" );
                  console.log( item );
               }) 
            );
         });
         q.all( customerPromises ) 
         .then( function( result ) {
            console.log( "All PUT's succeeded" );
         });

         var bookPromises = [];
         books.forEach( function( book ) {
            book.id = "book-barcode-" + book.barcode;
            book.docType = "BOOK";
            bookPromises.push( db.putDocument( book.id, book )
               .then( function( item ) {
                  console.log( "PUT succeeded" );
                  console.log( item );
               }) 
            );
         });
         q.all( bookPromises ) 
         .then( function( result ) {
            console.log( "All PUT's succeeded" );
         });
      };
      
      
       // TODO: 
       // - only one client may access the CouchDB
       // - implement conditional PUT (use ETag)
       // - every PUT will also save meta infos 
       // - read all customers and books 
       // - hold data in localstorage
       // - synchronize data automagically every 5 minutes 
       // - synchronize on logout 
       // - mark every data as dirty on change
       // - save only marked data entry and clear the mark
       // - use SimpleDB instead of CouchDB
       // - host entire App in S3 or Cloud Storage
       // - minimize and obfuscate the javascript code 
       // - what about authentication and security (read-only vs. read-write)
            
       ////////////////////////////////////////////////////////////////////////////////////////////////////

      function randomUUID() {
         var s = [], itoh = '0123456789ABCDEF';
        
         // Make array of random hex digits. The UUID only has 32 digits in it, but we
         // allocate an extra items to make room for the '-'s we'll be inserting.
         for (var i = 0; i <36; i++) s[i] = Math.floor(Math.random()*0x10);
        
         // Conform to RFC-4122, section 4.4
         s[14] = 4;  // Set 4 high bits of time_high field to version
         s[19] = (s[19] & 0x3) | 0x8;  // Specify 2 high bits of clock sequence
        
         // Convert to hex chars
         for (var i = 0; i <36; i++) s[i] = itoh[s[i]];
        
         // Insert '-'s
         s[8] = s[13] = s[18] = s[23] = '-';
        
         return s.join('');
      }
      
      function inherit( Child, Parent ) {
         _.extend( Child.prototype, Parent.prototype );
      }
      
      ////////////////////////////////////////////////////////////////////////////////////////////////////

      function Document( id, uuid )
      {
         if( id ) {
            this.id = id;
         } 
         if( uuid ) {
            this.id += uuid; 
         }
      }
      
      
      Document.prototype.get = function() {
         // TODO: where do we hold the meta informations, like etag
         self = this;
         return db.getDocument( self.id )
         .then( function( doc ) { 
            console.log( "Document.get returned with:" );
            console.log( doc );
            if( doc ) {
               _.extend( self, doc );
               return self;
            } else {
               return null;
            }
         } );
      };
      
      
      Document.prototype.put = function() {
         self = this;
         return db.putDocument( self.id, self )
         .then( function( doc ) { 
            console.log( "Document.put returned with:" );
            console.log( doc );
            if( doc ) {
               _.extend( self, doc );
               return self;
            } else {
               return null;
            }
         } );
      };
      
      ////////////////////////////////////////////////////////////////////////////////////////////////////

      function Book( uuid ) {
         Document.call( this, Book.idPrefix, uuid );
      }
      
      _.extend( Book.prototype, Document.prototype );
      
      Book.idPrefix = "book-";
      
      ////////////////////////////////////////////////////////////////////////////////////////////////////

      function Customer( uuid ) {
         Document.call( this, Customer.idPrefix, uuid );
      }
      
      _.extend( Customer.prototype, Document.prototype );

      Customer.idPrefix = "patron-";
      
      Customer.prototype.addBook = function( bookId ) {
         if( !this.books ) {
            this.books = {};
         }
         this.books[ bookId ] = bookId;
      };

      
      Customer.prototype.removeBook = function( bookId ) {
         if( customerHasBook( this, bookId ) ) {
            delete this.books[ bookId ];
         }
      };

      
      Customer.prototype.hasBook = function( bookId ) {
         if( !this.books ) {
            return false;
         }
         return bookId in this.books;
      };
      
      
      Customer.prototype.changeBarcode = function( barcode ) {
         
      };

      ////////////////////////////////////////////////////////////////////////////////////////////////////

      var encodeBarcodeUuid = function( barcode ) {
         return "barcode-" + barcode;
      };
      
      
      var getDocument = function( Klass, uuid ) {
         return ( new Klass( uuid ) ).get();
      };
      
      
      var scanDocuments = function( Klass, searchText ) {
         var deferred = q.defer();
         db.scanDocuments( Klass.idPrefix, searchText )
         .then( function( docArray ) {
            if( docArray ) {
               var docs = [];
               docArray.forEach( function( item ) {
                  var document = new Document( item.id );
                  _.extend( document, item );
                  docs.push( document );
               });
               deferred.resolve( docs );
            } else {
               deferred.resolve( null );
            } 
         });
         return deferred.promise;
      };

      
      var getAllDocuments = function( Klass ) {
         var deferred = q.defer();
         db.scanDocuments( Klass.idPrefix, searchText )
         .then( function( docArray ) {
            if( docArray ) {
               var docs = [];
               docArray.forEach( function( item ) {
                  var document = new Klass( item.id );
                  _.extend( document, item );
                  docs.push( document );
               });
               deferred.resolve( docs );
            } else {
               deferred.resolve( null );
            } 
         });
         return deferred.promise;
      };
      
      ////////////////////////////////////////////////////////////////////////////////////////////////////

      return {
         getDocument : getDocument,
         scanDocuments : scanDocuments,
         getAllDocuments: getAllDocuments,
         
         
         scanBooks : function( searchText ) {
            return scanDocuments( Book, searchText );
         },
         getAllBooks : function() {  
            return getAllDocuments( Book );
         },
         getBookByBarcode : function( bookBarcode ) {
            return getDocument( Book, encodeBarcodeUuid( bookBarcode ) );
         },
         
         
         scanCustomers : function( searchText ) {
            return scanDocuments( Customer, searchText );
         },
         getAllCustomers : function() {  
            return getAllDocuments( Customer );
         },
         getCustomerByBarcode : function( customerBarcode ) {
            return getDocument( Customer, encodeBarcodeUuid( customerBarcode ) );
         },
         
         
         // getIssuedBooksByCustomer: function( customer ) {
         //    var deferred = q.defer();
         //    var issuedBooks = [];
         //    if( customer && customer.issuedBooks ) {
         //       allBooksPromises = [];
         //       customer.issuedBooks.forEach( function( bookKey ) {
         //          allBooksPromises.push(
         //             db.getDocument( bookKey ) 
         //             .then( function( doc ) {
         //                issuedBooks.push( doc );
         //                return doc;
         //             })
         //          );
         //       } );
         //       q.all( allBooksPromises ) 
         //       .then( function() {
         //          deferred.resolve( issuedBooks );
         //       });
         //    }
         //    else {
         //       deferred.resolve( issuedBooks );
         //    }
         //    return deferred.promise;
         // }
      };
   } ];  // service
    
    ////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      registerExports: function( angularModule ) {
         console.log( "ixoid database service registered." );
         angularModule.factory( 'ixoidDatabase', service );
      }
   };
} );

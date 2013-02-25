"use strict";
   
define( [ "angular", "underscore", "./restDB", "./dummyData" ], function( angular, _, dbm, dummyData ) {
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
       // - implement conditional PUT (use ETag)
       // - every PUT will also save meta infos 
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

      function Document( id, idPrefix )
      {
         if( id ) {
            this.id = id;
         } else {
            if( !idPrefix ) {
               idPrefix = Document.idPrefix;
            }
            this.id = idPrefix + randomUUID(); 
         }
      }
      
      Document.idPrefix = "doc-";
      
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

      function Book( id ) {
         Document.call( this, id, Book.idPrefix );
      }
      
      _.extend( Book.prototype, Document.prototype );
      
      Book.idPrefix = "book-";
      
      ////////////////////////////////////////////////////////////////////////////////////////////////////

      function Customer( id ) {
         Document.call( this, id, Customer.idPrefix );
      }
      
      _.extend( Customer.prototype, Document.prototype );

      Customer.idPrefix = "customer-";
      
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

      function Barcode( barcode ) {
         Document.call( this, Barcode.idPrefix + barcode );
      }
      
      _.extend( Barcode.prototype, Document.prototype );

      Barcode.idPrefix = "barcode-";
     
      ////////////////////////////////////////////////////////////////////////////////////////////////////

      var encodeBarcodeUuid = function( barcode ) {
         return "barcode-" + barcode;
      };
      
      
      var getDocument = function( Klass, id ) {
         return ( new Klass( id ) ).get();
      };
      
      var getDocumentByBarcode = function( Klass, barcode ) {
         return ( new Barcode( barcode ) ).get()
         .then( function( barcodeObject ) {
               if( barcodeObject ) {
                  return ( new Klass( barcodeObject.reference ) ).get()
                  .then( function( obj ) {
                     return obj;
                  });
               } else {
                  return null;
               }
         });
      };

      var setNewBarcodeForObject = function( obj, barcode ) {
         var newBarcodeObj = new Barcode( barcode );
         return newBarcodeObj.get()
         .then( function( barcodeObject ) {
               if( !barcodeObject ) {
                  newBarcodeObj.reference = obj.id;
                  return newBarcodeObj.put();
               } else {
                  return null;
               }
         });
      } 
      
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

      
      var importDummyData = function() {
         dummyData.customers.forEach( function( item ) {
            var customer = new Customer();
            _.extend( customer, item );
            customer.put();
            var barcodeObj = new Barcode( customer.barcode );
            barcodeObj.reference = customer.id;
            barcodeObj.put();
         } );
         dummyData.books.forEach( function( item ) {
            var book = new Book();
            _.extend( book, item );
            book.put();
            var barcodeObj = new Barcode( book.barcode );
            barcodeObj.reference = book.id;
            barcodeObj.put();
         } );
      }
      
      ////////////////////////////////////////////////////////////////////////////////////////////////////

      return {
         importDummyData: importDummyData,
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
            return getDocumentByBarcode( Book, bookBarcode );
         },
         
         
         scanCustomers : function( searchText ) {
            return scanDocuments( Customer, searchText );
         },
         getAllCustomers : function() {  
            return getAllDocuments( Customer );
         },
         getCustomerByBarcode : function( customerBarcode ) {
            return getDocumentByBarcode( Customer, customerBarcode );
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

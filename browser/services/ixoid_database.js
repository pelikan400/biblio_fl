"use strict";
   
define( [ "angular", "underscore", "./restDB" ], function( angular, _, dbm ) {
   var dummyData = null;
   var books = null;
   var patrons = null;
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
         var patronPromises = [];
         patrons.forEach( function( patron ) {
            patron.id = "patron-barcode-" + patron.barcode;
            patron.schoolClass = "1a";
            patron.docType = "PATRON";
            patron.maximumIssues = 1;
            patronPromises.push( db.putDocument( patron.id, patron )
               .then( function( item ) {
                  console.log( "PUT succeeded" );
                  console.log( item );
               }) 
            );
         });
         q.all( patronPromises ) 
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
       // - read all patrons and books 
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
      
      
      function Document( id, generateUuid )
      {
         this.id = id;
         if( generateUuid ) {
            this.id += "-uuid-" + randomUUID(); 
         }
      }
      
      
      Document.prototype.get = function() {
         // TODO: where do we hold the meta informations, like etag
         self = this;
         return db.getDocument( self.id )
         .then( function( doc ) { 
            if( doc ) {
               console.log( doc );
               _.expand( self, doc );
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
            if( doc ) {
               console.log( doc );
               _.expand( self, doc );
               return self;
            } else {
               return null;
            }
         } );
      };
      
      
      var encodePatronIdFromBarcode = function( barcode ) {
         return "patron-barcode-" + barcode;
      };

      
      var encodeBookIdFromBarcode = function( barcode ) {
         return "book-barcode-" + barcode;
      };
      
      
      var getDocument = function( id ) {
         return (new Document( id )).get();
      };
      
      var scanDocuments = function( idPrefix, searchText ) {
         var deferred = q.defer();
         db.scanDocuments( idPrefix, searchText )
         .then( function( docArray ) {
            if( docArray ) {
               var docs = [];
               docArray.forEach( function( item ) {
                  var document = new Document( item.id );
                  _.expand( document, item );
                  docs.push( document );
               });
               deferred.resolve( docs );
            } else {
               deferred.resolve( null );
            } 
         });
         return deferred.promise;
      };

      var getAllDocuments = function( idPrefix ) {
         var deferred = q.defer();
         db.scanDocuments( idPrefix, searchText )
         .then( function( docArray ) {
            if( docArray ) {
               var docs = [];
               docArray.forEach( function( item ) {
                  var document = new Document( item.id );
                  _.expand( document, item );
                  docs.push( document );
               });
               deferred.resolve( docs );
            } else {
               deferred.resolve( null );
            } 
         });
         return deferred.promise;
      };
      
      return {
         encodePatronIdFromBarcode : encodePatronIdFromBarcode,
         encodeBookIdFromBarcode : encodeBookIdFromBarcode,
         getDocument : getDocument,
         putDocument : putDocument,
         scanDocuments : scanDocuments,
         getAllDocuments: getAllDocuments,
         
         
         scanBooks : function( searchText ) {
            return scanDocuments( "book-", searchText );
         },
         getAllBooks : function() {  
            return getAllDocuments( "book-" );
         },
         getBookByBarcode : function( bookBarcode ) {
            return getDocument( encodeBookIdFromBarcode( bookBarcode ) );
         },
         
         
         scanPatrons : function( searchText ) {
            return scanDocuments( "patron-", searchText );
         },
         getAllPatrons : function() {  
            return getAllDocuments( "patron-" );
         },
         getPatronByBarcode : function( patronBarcode ) {
            return getDocument( encodePatronIdFromBarcode( patronBarcode ) );
         },
         
         
         // getIssuedBooksByPatron: function( patron ) {
         //    var deferred = q.defer();
         //    var issuedBooks = [];
         //    if( patron && patron.issuedBooks ) {
         //       allBooksPromises = [];
         //       patron.issuedBooks.forEach( function( bookKey ) {
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

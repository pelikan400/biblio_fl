"use strict";
   
define( [ "angular", "underscore", "./restDB" ], function( angular, _, dbm ) {
   var dummyData = null;
   var books = null;
   var patrons = null;
   var circulations = [];

   var service = [ "$q", "$timeout", "$http", "$resource", function( q, timeout, $http, $resource ) {
       ////////////////////////////////////////////////////////////////////////////////////////////////////

      var dumpDummyDataIntoDatabase = function() {
         var db = dbm.db( $http, "/db" );
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

      return {
         testRestGet : function() {
            console.log( "dbm: " );
            console.log( dbm );
            var db = dbm.db( $http, "/db" );
            console.log( "db: " );
            console.log( db );
            db.getDocument( "barcode-123456" )
            .then( function( doc ) { 
               console.log( "Hooray, we got an document after GET" );
               console.log( doc );
            } );
            
         },
         testRestPut: function() {
            var db = dbm.db( $http, "/db" );
            db.putDocument( "barcode-123456", { title: "Hello captain Jack" } )
            .then( function( doc ) { 
               console.log( "Hooray, we got an document after PUT" );
               console.log( doc );
            } );
         },
         getBooks : function() {
            var deferred = q.defer();
            timeout( function() {
               deferred.resolve( books );
            } );
            return deferred.promise;
         },
         findBooks : function( searchPattern ) {
            var deferred = q.defer();
            timeout( function() {
               deferred.resolve( books );
            } );
            return deferred.promise;
            
         },
         getBookByBarcode : function( barcode ) {
            var deferred = q.defer();
            timeout( function() {
               var found = false;
               books.forEach( function( book ) {
                  if( book.barcode == barcode ) {
                     deferred.resolve( book );
                  }
               } );
               if( !found ) {
                  deferred.resolve( null );
               }
            } );
            return deferred.promise;
         },
         getPatrons : function() {  
            var deferred = q.defer();
            timeout( function() {
               deferred.resolve( patrons );
            } );
            return deferred.promise;
         },
         getPatronByBarcode : function( patronBarcode ) {
            var patronKey = "patron-barcode-" + patronBarcode;
            var db = dbm.db( $http, "/db" );
            return db.getDocument( patronKey )
            .then( function( doc ) { 
               console.log( doc );
               return doc;
            } );
         },
         getIssuedBooksByPatron: function( patron ) {
            var deferred = q.defer();
            var issuedBooks = [];
            if( patron && patron.issuedBooks ) {
               var db = dbm.db( $http, "/db" );
               allBooksPromises = [];
               patron.issuedBooks.forEach( function( bookKey ) {
                  allBooksPromises.push(
                     db.getDocument( bookKey ) 
                     .then( function( doc ) {
                        issuedBooks.push( doc );
                        return doc;
                     })
                  );
               } );
               q.all( allBooksPromises ) 
               .then( function() {
                  deferred.resolve( issuedBooks );
               });
            }
            else {
               deferred.resolve( issuedBooks );
            }
            return deferred.promise;
         },
         getBookIssue : function( book ) {
            var deferred = q.defer();
            timeout( function() {
               var foundPatron = false;
               circulations.forEach( function( issue ) {
                  if( issue.book == book && issue.status == "ISSUED" ) {
                     deferred.resolve( issue );
                  }
               });
               if( !foundPatron ) {
                  deferred.resolve( null );
               }
            } );
            return deferred.promise;
         },
         issueBookForPatron : function( patron, book ) {
            var deferred = q.defer();
            timeout( function() {
               var issue = {
                  book: book,
                  patron: patron,
                  status: "ISSUED"
               };
               circulations.push( issue );
               if( book.issuedStatus == null || book.issuedStatus == "RETURNED" ) {
                  book.issuedBy = patron;
                  book.issueStatus = "ISSUED";
               } else {
                  book.issuedStatus = "RETURNED" ;
               }
               deferred.resolve( null );
            } );
            return deferred.promise;
         }
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

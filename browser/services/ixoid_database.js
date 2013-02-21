"use strict";
   
define( [ "angular", "underscore", "./restDB", "./dummyData" ], function( angular, _, dbm, dummyData ) {
   var books = dummyData.books;
   var patrons = dummyData.patrons;
   var circulations = [];

   var dynamoDBUrl = "";
   var dynamoDBKeyId = "";
    var  dynamoDBPSecretKey = "";
   
   var couchDBServerUrl = "http://www2.edba.de/couchdb/bibliofl";
   var service = [ "$q", "$timeout", "$http", "$resource", function( q, timeout, $http, $resource ) {
       ////////////////////////////////////////////////////////////////////////////////////////////////////

      
      var testPostBook = function() {
        var db = db.db( $http,dynamoDBUrl,dynamoDBPSecretKey, dynamoDBKeyId );

        // var couchDB = new CouchDB( couchDBServerUrl );
        // 
        // var allData = couchDB.getAllDocs()
        // .then( function( data ) { 
        //     console.log( "Got all documents from couchDB: " );
        //     console.log( data );
        // });

        // restGet( couchDBServerUrl );
          // var CouchDBResource = $resource( couchDBServerUrl );
          // var book = new CouchDBResource();
          // book.title = "Mister and Missis X";
          // var x = book.$save( function( book ) {
          //    console.log( "Book id is: " + book.id );
          // } );
          // console.log( "Saved the book" );
          // console.log( x );
          // console.log( book );
          // // get all books 
          // var books = CouchDBResource.query();
          // console.log( "Get all books" );
          // console.log( books );

          // TODO: 
          // - only one client may access the CouchDB 
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
      };
            
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
            testPostBook();
            var deferred = q.defer();
            timeout( function() {
               console.log( "get patron by barcode" );
               patrons.forEach( function( item, index ) { 
                  if( item.barcode == patronBarcode ) {
                     console.log( "found patron: " + patronBarcode );
                     console.log( item );
                     deferred.resolve( item );
                  }
               } );
            } );
            return deferred.promise;
         },
         getIssuedBooksByPatron: function( patron ) {
            var deferred = q.defer();
            timeout( function() {
               var issuedBooks = [];
               books.forEach( function( book ) {
                  if( book.issuedBy == patron ){
                     issuedBooks.push( book );
                  }
               } );
               deferred.resolve( issuedBooks );
            } );
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

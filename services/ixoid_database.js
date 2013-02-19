"use strict";
   
define( [ "angular", "underscore" ], function( angular, _ ) {
   var dummyData = {
      "patrons" : [
         {
            "firstName" : "Firas",
            "lastName" : "Ouni",
            "barcode" : "1006",
            "type" : "PUPIL"
         },
         {
            "firstName" : "Maria",
            "lastName" : "Callas",
            "barcode" : "1005",
            "type" : "PUPIL"
         },
         {
            "firstName" : "Juli",
            "lastName" : "Zeh",
            "barcode" : "1004",
            "type" : "PUPIL"
         },
         {
            "firstName" : "Elias",
            "lastName" : "Mustermann",
            "barcode" : "1003",
            "type" : "PUPIL"
         },
         {
            "firstName" : "Bernhard",
            "lastName" : "Mustermann",
            "barcode" : "1002",
            "type" : "PUPIL"
         },
         {
            "firstName" : "Sophie",
            "lastName" : "Scholl",
            "barcode" : "1001",
            "type" : "PUPIL"
         } // ,
         // {
         //    "firstName" : "",
         //    "lastName" : "",
         //    "barcode" : "",
         //    "type" : "PUPIL"
         // },
      ],
      "books" : [
         { 
            "title" : "Der Grüffelo", 
            "publisher" : "Beltz & Gelberg",
            "dateOfPublication" : "2002-02-13",
            "language" : "german",
            "isbn" : "9783407792914",
            "author" : "Axel Scheffler, Julia Donaldson",
            "barcode" : "123461",
            "signature" : ""
         },
         { 
            "title" : "Harry Potter und der Stein der Weisen (Band 1)", 
            "publisher" : "Carlsen Verlag GmbH; Auflage: 62",
            "dateOfPublication" : "1998-07-01",
            "language" : "german",
            "isbn" : "9783551551672",
            "author" : "Joanne K. Rowling",
            "barcode" : "123458",
            "signature" : ""
         },
         { 
            "title" : "Harry Potter und die Kammer des Schreckens (Band 2)", 
            "publisher" : "Carlsen Verlag GmbH; Auflage: 62",
            "dateOfPublication" : "1999-01-01",
            "language" : "german",
            "isbn" : "9783551551689",
            "author" : "Joanne K. Rowling",
            "barcode" : "123459",
            "signature" : ""
         },
         { 
            "title" : "Der große Weltraumatlas", 
            "publisher" : "cbj",
            "dateOfPublication" : "2008-09-15",
            "language" : "german",
            "isbn" : "9783570134962",
            "author" : "Dr. Mark A. Garlick",
            "barcode" : "123463",
            "signature" : ""
         },
         { 
            "title" : "Gregs Tagebuch 3 - Jetzt reicht's!", 
            "publisher" : "Bastei Lübbe (Baumhaus Taschenbuch)",
            "dateOfPublication" : "2012-12-20",
            "language" : "german",
            "isbn" : "9783843210232",
            "author" : "Jeff Kinney",
            "barcode" : "123464",
            "signature" : ""
         },
         { 
            "title" : "Gregs Tagebuch 2 - Gibt's Probleme?", 
            "publisher" : "Bastei Lübbe (Baumhaus Taschenbuch)",
            "dateOfPublication" : "2012-12-20",
            "language" : "german",
            "isbn" : "9783843200530",
            "author" : "Jeff Kinney",
            "barcode" : "123467",
            "signature" : ""
         },
         { 
            "title" : "Gregs Tagebuch 1 - Von Idioten umzingelt!", 
            "publisher" : "Bastei Lübbe (Baumhaus Taschenbuch)",
            "dateOfPublication" : "2012-12-20",
            "language" : "german",
            "isbn" : "9783843200059",
            "author" : "Jeff Kinney",
            "barcode" : "",
            "signature" : ""
         },
         { 
            "title" : "Dinosaurierlexikon", 
            "publisher" : "Dorling Kindersley Verlag",
            "dateOfPublication" : "2011-01-01",
            "language" : "german",
            "isbn" : "9783831010516",
            "author" : "Dorling Kindersley Verlag",
            "barcode" : "123460",
            "signature" : ""
         }
         // { 
         //    "title" : "", 
         //    "publisher" : "",
         //    "dateOfPublication" : "",
         //    "language" : "",
         //    "isbn" : "",
         //    "author" : "",
         //    "barcode" : "",
         //    "signature" : ""
         // },
      ]
   };

   var books = dummyData.books;
   var patrons = dummyData.patrons;
   var circulations = [];
   
   var couchDBServerUrl = "http://www2.edba.de/couchdb/biblio-fl";
   var service = [ "$q", "$timeout", "$http", "$resource", function( q, timeout, $http, $resource ) {
       function CouchDB( databaseUrl) {
         this.databaseUrl = databaseUrl;
       }

       CouchDB.prototype.getAllDocs = function() {
         var allDocsUrl = this.databaseUrl + "/_all_docs";
         return $http( { method: "GET", url: allDocsUrl } )
         .then( function( response ) {
             return response.data;
         });
       };
       
       CouchDB.prototype.getView = function() {
         var allDocsUrl = this.databaseUrl + "/_all_docs";
         return $http( { method: "GET", url: allDocsUrl } )
         .then( function( response ) {
             return response.data;
         });
       };
       
       CouchDB.prototype.createDoc = function( doc ) {
         var url = this.databaseUrl;
         return $http( { method: "POST", url: url } )
         .then( function( response ) {
             _.extend( doc, response.data );
             return response.data;
         });
       };

       CouchDB.prototype.readDoc = function( doc ) {
         var url = this.databaseUrl + "/" + id;
         return $http( { method: "GET", url: url } )
         .then( function( response ) {
             _.extend( doc, response.data );
             return response.data;
         });
       };

       CouchDB.prototype.updateDoc = function( doc ) {
         var url = this.databaseUrl + "/" + id;
         return $http( { method: "PUT", url: url } )
         .then( function( response ) {
             _.extend( doc, response.data );
             return response.data;
         });
       };

       CouchDB.prototype.deleteDoc = function( doc ) {
         var url = this.databaseUrl + "/" + id;
         return $http( { method: "DELETE", url: url } );
       };

      var testPostBook = function() {
        var couchDB = new CouchDB( couchDBServerUrl );

        var allData = couchDB.getAllDocs()
        .then( function( data ) { 
            console.log( "Got all documents from couchDB: " );
            console.log( data );
        });
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
            
      return {
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
   } ];
   
   return {
      registerExports: function( angularModule ) {
         console.log( "ixoid database service registered." );
         angularModule.factory( 'ixoidDatabase', service );
      }
   };
} );

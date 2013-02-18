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
   
    var service = [ "$q", "$timeout", "$resource", function( q, timeout, $resource ) {
      
      return {
          testPostBook : function() {
              var BookResource = $resource( "http://mx0.e11e.de:5294/biblio_fl/books" );
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
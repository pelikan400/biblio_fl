"use strict";

define( [
   "angular", "underscore", "./restDB", "./dummyData"
], function( angular, _, dbm, dummyData ) {

   var service = [
      "$q", "$timeout", "$http", "$resource", function( q, timeout, $http, $resource ) {

         var defaultDb = null;
         
         // //////////////////////////////////////////////////////////////////////////////////////////////////

         // TODO:
         // - implement conditional PUT (use ETag)
         // - every PUT will also save meta infos
         // - minimize and obfuscate the javascript code

         
         var now = function() {
            return new Date();
         };
         
         // //////////////////////////////////////////////////////////////////////////////////////////////////

         function randomUUID() {
            var s = [], itoh = '0123456789ABCDEF';

            // Make array of random hex digits. The UUID only has 32 digits in
            // it,
            // but we
            // allocate an extra items to make room for the '-'s we'll be
            // inserting.
            for( var i = 0; i < 36; i++ )
               s[ i ] = Math.floor( Math.random() * 0x10 );

            // Conform to RFC-4122, section 4.4
            s[ 14 ] = 4; // Set 4 high bits of time_high field to version
            s[ 19 ] = ( s[ 19 ] & 0x3 ) | 0x8; // Specify 2 high bits of clock
            // sequence

            // Convert to hex chars
            for( var i = 0; i < 36; i++ )
               s[ i ] = itoh[ s[ i ] ];

            // Insert '-'s
            s[ 8 ] = s[ 13 ] = s[ 18 ] = s[ 23 ] = '-';

            return s.join( '' );
         }

         
         function inherit( Child, Parent ) {
            _.extend( Child.prototype, Parent.prototype );
         }

         // //////////////////////////////////////////////////////////////////////////////////////////////////

         function Document( id, idPrefix ) {
            if( id ) {
               this.id = id;
            }
            else {
               if( !idPrefix ) {
                  idPrefix = Document.idPrefix;
               }
               this.id = idPrefix + randomUUID();
            }
         }

         Document.idPrefix = "doc-";

         Document.prototype.get = function() {
            // TODO: where do we hold the meta informations, like etag
            var self = this;
            return defaultDb.getDocument( self.id ).then( function( doc ) {
               if( doc ) {
                  _.extend( self, doc );
                  self.afterGet();
                  // console.log( self );
                  return self;
               }
               else {
                  return null;
               }
            } );
         };

         Document.prototype.put = function() {
            var self = this;
            self.lastModified = now();
            return defaultDb.putDocument( self.id, self ).then( function( doc ) {
               // console.log( "Document.put returned with:" );
               if( doc ) {
                  _.extend( self, doc );
                  // console.log( self );
                  return self;
               }
               else {
                  return null;
               }
            } );
         };

         Document.prototype.del = function() {
            var self = this;
            return defaultDb.deleteDocument( self.id ).then( function( doc ) {
               return self;
            } );
         };

         // a hook to correct objects created from JSON
         // for example Date fields
         Document.prototype.afterGet = function() {
            if( this.lastModified ) {
               this.lastModified = new Date( this.lastModified );
            }
         };

         // //////////////////////////////////////////////////////////////////////////////////////////////////

         function Barcode( barcode ) {
            Document.call( this, Barcode.idPrefix + barcode );
         }

         _.extend( Barcode.prototype, Document.prototype );

         Barcode.idPrefix = "barcode-";

         // //////////////////////////////////////////////////////////////////////////////////////////////////

         function Book( id ) {
            Document.call( this, id, Book.idPrefix );
         }

         inherit( Book, Document );

         Book.idPrefix = "book-";

         
         Book.prototype.afterGet = function() {
            if( this.dueDate ) {
               this.dueDate = new Date( this.dueDate );
            }
            if( this.returnDate ) {
               this.returnDate = new Date( this.returnDate );
            }
            if( this.issueDate ) {
               this.issueDate = new Date( this.issueDate );
            }
            
            Document.prototype.afterGet.apply( this, arguments );
         };

         
         Book.prototype.getIssuedWeeks = function() {
            var weeks = 0;
            if( this.issuedStatus == "ISSUED" && this.issueDate ) {
               var oneWeekInMilliseconds = 1000 * 3600 * 24 * 7;
               var now = new Date();
               var deltaIssued = now.getTime() - this.issueDate.getTime();
               weeks = Math.floor( deltaIssued / oneWeekInMilliseconds );
            }
            
            return weeks;
         };

         Book.prototype.ISSUED = "ISSUED";
         Book.prototype.RETURNED = "RETURNED";
         
         
         Book.prototype.isIssued = function() {
            return this.issuedStatus == this.ISSUED;
         };

         
         Book.prototype.issueAction = function( customerId ) {
            var now = new Date();
            if( !now.isSameDay( this.returnDate ) || this.issuedBy != customerId ) {
               this.issueDate = now;
            }
            this.dueDate = now.addDays( 14 );
            this.issuedStatus = this.ISSUED;
            this.issuedBy = customerId;
         };

         
         Book.prototype.returnAction = function() {
            var now = new Date();
            this.issuedStatus = this.RETURNED;
            this.returnDate = now;
            this.dueDate = null;
         };

         
         // //////////////////////////////////////////////////////////////////////////////////////////////////

         function Customer( id ) {
            Document.call( this, id, Customer.idPrefix );
            this.books = {};
         }

         inherit( Customer, Document );

         Customer.idPrefix = "customer-";

         Customer.prototype.addBook = function( bookId ) {
            if( !this.hasBook( bookId ) ) {
               this.books[ bookId ] = bookId;
            }
         };

         Customer.prototype.removeBook = function( bookId ) {
            if( this.hasBook( bookId ) ) {
               delete this.books[ bookId ];
            }
         };

         Customer.prototype.hasBook = function( bookId ) {
            return bookId in this.books;
         };

         Customer.prototype.changeBarcode = function( barcode ) {

         };

         Customer.prototype.getBooks = function() {
            // console.log( "getBooks for bookId map:" );
            // console.log( this.books );
            return getDocumentsByIdMap( Book, this.books );
         };

         Customer.prototype.schoolClassMap = {
            "0" : "keine",

            "2012a" : "1a",
            "2012b" : "1b",

            "2011a" : "2a",
            "2011b" : "2b",

            "2010a" : "3a",
            "2010b" : "3b",

            "2009a" : "4a",
            "2009b" : "4b"
         };

         // //////////////////////////////////////////////////////////////////////////////////////////////////

         function Circulation( book, customer ) {
            Document.call( this );
            this.customerId = customer.id;
            this.bookId = book.id;
            this.issuedStatus = book.issuedStatus;
            this.modificationDate = new Date();
         }

         inherit( Circulation, Document );

         Circulation.idPrefix = "circulation-";

         // //////////////////////////////////////////////////////////////////////////////////////////////////

         var getDocument = function( Klass, id ) {
            return ( new Klass( id ) ).get();
         };

         
         var getDocumentByBarcode = function( Klass, barcode ) {
            return ( new Barcode( barcode ) ).get().then( function( barcodeObject ) {
               if( barcodeObject ) {
                  return ( new Klass( barcodeObject.reference ) ).get().then( function( obj ) {
                     return obj;
                  } );
               }
               else {
                  return null;
               }
            } );
         };

         
         var scanDocuments = function( Klass, searchText, idPrefix, db ) {
            if( !db ) {
               db = defaultDb;
            }
            idPrefix = idPrefix ? idPrefix : Klass.idPrefix;
            return db.scanDocuments( idPrefix, searchText ).then( function( response ) {
               if( response ) {
                  var docs = [];
                  var docArray = response.items;
                  _.each( docArray, function( item ) {
                     var document = new Klass( item.id );
                     _.extend( document, item );
                     document.afterGet();
                     docs.push( document );
                  } );
                  return docs;
               }
               else {
                  return null;
               }
            } );
         };

         
         var getAllDocuments = function( Klass ) {
            return scanDocuments( Klass );
         };

         
         var getDocumentsByIdList = function( Klass, idList ) {
            var docPromises = [];
            if( !idList || idList.length == 0 ) {
               return q.when( null );
            }

            _.each( idList, function( id ) {
               var document = new Klass( id ).get();
               docPromises.push( document );
            } );

            return q.all( docPromises );
         };

         var getDocumentsByIdMap = function( Klass, idMap ) {
            var docPromises = [];
            if( !idMap ) {
               return q.when( null );
            }

            for( var id in idMap ) {
               var document = new Klass( id ).get();
               docPromises.push( document );
            };

            return q.all( docPromises );
         };

         var importDummyData = function() {
            _.each( dummyData.customers, function( item ) {
               var customer = new Customer();
               _.extend( customer, item );
               customer.put();
               var barcodeObj = new Barcode( customer.barcode );
               barcodeObj.reference = customer.id;
               barcodeObj.put();
            } );
            _.each( dummyData.books, function( item ) {
               var book = new Book();
               _.extend( book, item );
               book.put();
               var barcodeObj = new Barcode( book.barcode );
               barcodeObj.reference = book.id;
               barcodeObj.put();
            } );
         };

         // /////////////////////////////////////////////////////////////////////////////////////////////////////////

         var checkBarcodeString = function( barcodeString ) {
            if( !barcodeString ) {
               return false;
            }
            var barcodeStringLength = barcodeString.length;
            var checksum = 0;
            var charCodeZero = "0".charCodeAt( 0 );
            var pos = 0;
            var weights = [
               1, 3
            ];
            for( var i = barcodeStringLength - 1; i >= 0; --i ) {
               var c = barcodeString.charCodeAt( i ) - charCodeZero;
               var weight = c * weights[ pos % 2 ];
               checksum += weight;
               ++pos;
            }
            checksum = checksum % 10;
            // console.log( "checksum of " + barcodeString + " is " + checksum
            // );
            return checksum == 0;
         };

         var initializeWithLocalStorage = function() {
            var syncTimeoutMilliseconds = 15 * 1000;
            
            var dbServer = dbm.restDbOnRemoteServer( $http, "/db" );
            var dbLocalStorage = dbm.restDbOnLocalStorage( window.localStorage, q );
            defaultDb = dbServer;
            console.log( "Fill local storage" );

            var syncLocalStorage = function() {
               var conditionalPut = function( modifiedObjectsMap ) {
                  if( modifiedObjectsMap ) {
                     console.log( "synchronising write cache." );
                     return dbServer.putDocument( null, modifiedObjectsMap )
                     .then( function() { 
                        return true;
                     });
                  } else {
                     return q.when( false );
                  }
               };

               return conditionalPut( dbLocalStorage.sync() )
               .then( function( result ) { 
                  dbLocalStorage.finalizeSync();
                  var timeoutMilliseconds = result ? 20 : syncTimeoutMilliseconds;
                  timeout( syncLocalStorage, timeoutMilliseconds );
               }, function( error ) {
                  console.log( "Error while synchronizing objects. Will try again later!" );
                  timeout( syncLocalStorage, syncTimeoutMilliseconds );
               } );
            };

            
            getAllDocuments( Book )
            .then( function( documents ) {
               dbLocalStorage.load( documents );
               return getAllDocuments( Barcode );
            })
            .then( function( documents ) {
               dbLocalStorage.load( documents );
               return scanDocuments( Document, null, "config" );
            })
            .then( function( documents ) {
               dbLocalStorage.load( documents );
               return getAllDocuments( Customer );
            })
            .then( function( documents ) {
               dbLocalStorage.load( documents );
               console.log( "Filled local storage." );
               return true;
            })
            .then( function() { 
               defaultDb = dbLocalStorage;
               timeout( syncLocalStorage, syncTimeoutMilliseconds );
            });
         };

         
         // var initializeWithDirectRemoteServer = function() {
         //    var dbServer = dbm.restDbOnRemoteServer( $http, "/db" );
         //    db = dbServer;
         // };
         
         
         // initializeWithDirectRemoteServer();
         initializeWithLocalStorage();
         
         // //////////////////////////////////////////////////////////////////////////////////////////////////

         return {
            importDummyData : importDummyData,
            getDocument : getDocument,
            scanDocuments : scanDocuments,
            getAllDocuments : getAllDocuments,
            getDocumentsByIdList : getDocumentsByIdList,
            Document : Document,
            Book : Book,
            Customer : Customer,
            Circulation : Circulation,

            getRawDocument : function( id ) {
               return getDocument( Document, id );
            },
            createDocument : function( id ) {
               return new Document( id );
            },

            scanBooks : function( searchText ) {
               return scanDocuments( Book, searchText );
            },
            getAllBooks : function() {
               return getAllDocuments( Book );
            },
            getBooksByIdList : function( idList ) {
               return getDocumentsByIdList( Book, idList );
            },
            createBook : function() {
               return new Book();
            },
            getBookById : function( id ) {
               return getDocument( Book, id );
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
            getCustomersByIdList : function( idList ) {
               return getDocumentsByIdList( Customer, idList );
            },
            createCustomer : function() {
               return new Customer();
            },
            getCustomerById : function( id ) {
               return getDocument( Customer, id );
            },
            getCustomerByBarcode : function( customerBarcode ) {
               return getDocumentByBarcode( Customer, customerBarcode );
            },

            createBarcode : function( barcode, referenceId ) {
               var b = new Barcode( barcode );
               b.reference = referenceId;
               return b;
            },
            getBarcodeByBarcode : function( barcode ) {
               return new Barcode( barcode ).get();
            },
            checkBarcodeString : checkBarcodeString,
            today : function() {
               var d = new Date();
               d.setHours( 0 );
               d.setMinutes( 0 );
               d.setSeconds( 0 );
               d.setMilliseconds( 0 );
               return d;
            },

            createCirculation : function( book, customer ) {
               return new Circulation( book, customer );
            },
            getAllCirculations : function() {
               return getAllDocuments( Circulation );
            }
         };
      }
   ]; // service

   // //////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      registerExports : function( angularModule ) {
         console.log( "ixoid database service registered." );
         angularModule.factory( 'ixoidDatabase', service );
      }
   };
} );

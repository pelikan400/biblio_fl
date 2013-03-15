"use strict";

define( [ "underscore" ], function( _ ) {
   function now() {
      return new Date();
   }
   
   
   // //////////////////////////////////////////////////////////////////////////////////////////////////

   function timestamp() {
      return now().getTime();
   }
   
   
   // //////////////////////////////////////////////////////////////////////////////////////////////////

   function RestDBOnLocalStorage( ls, q ) {
      this.localStorage = ls;
      this.q = q;
      this.resetLastSyncedTimestamp();
      this.resetSyncKeyMap();
   }


   RestDBOnLocalStorage.prototype.localUnsynchronizedKeys = {
       "localStorageConfig" : "localStorageConfig"
   };


   RestDBOnLocalStorage.prototype.scanDocuments = function( idPrefix, searchText, lastModifiedTimestamp ) {
      console.log( "searching for: '" + searchText + "' on prefix: " + idPrefix );
      
      var items = [];
      for( var i = 0; i < this.localStorage.length; ++i ){
         var key = this.localStorage.key( i );
         if( key.indexOf( idPrefix ) == 0 ) {
            // objJSON = this.localStorage.getItem( key );
            // console.log( "found " + key );
            var objJSON = this.localStorage[ key ];
            if( !searchText || objJSON.indexOf( searchText ) != -1 ) {
               // console.log( "found1 " + key + " : " + objJSON );
               items.push( JSON.parse( objJSON ) );
            }
         }
      }
      return this.q.when( { items: items, page: 0 } );
   };

   
   RestDBOnLocalStorage.prototype.getDocumentSynchronous = function( id ) {
      var objJSON = this.localStorage[ id ];
      if( ! objJSON ) {
         return null;
      }
      
      return JSON.parse( objJSON );
   };

   
   RestDBOnLocalStorage.prototype.getDocument = function( id ) {
      return this.q.when( this.getDocumentSynchronous( id ) );
   }; 

   
   RestDBOnLocalStorage.prototype.putDocumentSynchronous = function( id, data ) {
      this.localStorage[ id ] = JSON.stringify( data );
      return data;
   };

   
   RestDBOnLocalStorage.prototype.putDocument = function( id, data ) {
      data.lastModifiedTimestamp = timestamp();
      return this.q.when( this.putDocumentSynchronous( id, data ) );
   };

   
   RestDBOnLocalStorage.prototype.deleteDocument = function( id ) {
      this.localStorage.removeItem( id );
      return this.q.when( null );
   };

   
   RestDBOnLocalStorage.prototype.load = function( documentArray ) {
      var self = this;
      _.each( documentArray, function( doc ) {
         self.putDocumentSynchronous( doc.id, doc );
      });
      return null;
   };

   
   
   RestDBOnLocalStorage.prototype.resetLastSyncedTimestamp = function() {
      this.lastSyncedTimestamp = timestamp();
      this.config = this.getDocumentSynchronous( "localStorageConfig" );
      if( !this.config ) {
          this.config = {}
          this.config.lastSyncedTimestamp = this.lastSyncedTimestamp;
      }
      else {
          this.lastSyncedTimestamp = this.config.lastSyncedTimestamp;
      }
   };

   
   RestDBOnLocalStorage.prototype.sync = function() {
      var self = this;
      var countLimit = 10;
      var itemMap = {};
      var modifiedItemMap = {};
      var countItems = 0;
      for( var i = 0; i < self.localStorage.length && countItems < countLimit; ++i ) {
         var key = self.localStorage.key( i );
         if( ( key in self.localUnsynchronizedKeys ) || ( key in self.syncKeyMap ) ) {
             // console.log( "Ignore key: " + key );
             continue;
         }
         var objJSON = self.localStorage[ key ];
         var obj = JSON.parse( objJSON );
         if( obj.lastModifiedTimestamp == null ) {
             console.log( "Found " + obj.lastModifiedTimestamp + " will set to " + self.lastSyncedTimestamp + " for key: " + key );
            obj.lastModifiedTimestamp = self.lastSyncedTimestamp;
            itemMap[ key ] = obj;
            self.syncKeyMap[ key ] = key;
            ++countItems;
            modifiedItemMap[ key ] = obj;
         } else if(  obj.lastModifiedTimestamp > self.lastSyncedTimestamp ) {
             console.log( " " + obj.lastModifiedTimestamp + " is later than " + self.lastSyncedTimestamp + " store key: " + key );
             itemMap[ key ] = obj;
             self.syncKeyMap[ key ] = key;
             ++countItems;
         }
      }
      
      _.each( modifiedItemMap, function( value, key ) {
         var valueStringified = JSON.stringify( value );
         self.localStorage[ key ] = valueStringified;
         console.log( "Write back modified: " + key + " : " + valueStringified );
      });
      
      if( countItems > 0 ) {
         return itemMap;
      }
      else {
         return null;
      }
   };

   RestDBOnLocalStorage.prototype.resetSyncKeyMap = function() {
      this.syncKeyMap = {};
   };

   
   RestDBOnLocalStorage.prototype.finalizeSync = function() {
      this.lastSyncedTimestamp = timestamp();
      this.config.lastSyncedTimestamp = this.lastSyncedTimestamp;
      this.putDocumentSynchronous( "localStorageConfig", this.config );
      this.resetSyncKeyMap();
   };
   
   
   // //////////////////////////////////////////////////////////////////////////////////////////////////

   function RestDB( $http, databaseUrl ) {
      this.databaseUrl = databaseUrl;
      this.$http = $http;
   }

   RestDB.prototype.scanDocuments = function( idPrefix, searchText, lastModifiedTimestamp ) {
      var url = this.databaseUrl;
      var firstQueryParameter = true;
      if( idPrefix ) {
         url += ( firstQueryParameter ? "?" : "&" ) + "p=" + idPrefix;
         firstQueryParameter = false;
      }
      if( searchText ) {
         url += ( firstQueryParameter ? "?" : "&" ) + "q=" + searchText;
         firstQueryParameter = false;
      }
      if( lastModifiedTimestamp != null ) {
         url += ( firstQueryParameter ? "?" : "&" ) + "lm=" + lastModifiedTimestamp;
         firstQueryParameter = false;
      }

      return this.$http( {
         method : "GET",
         url : url
      } ).then( function( response ) {
         // console.log( "GET response is: " );
         // console.log( response.data );
         return response.data;
      }, function( error ) {
         console.log( "GET returned with error; returning null" );
         return null;
      } );
   };

   RestDB.prototype.getDocument = function( id ) {
      var url = this.databaseUrl + "/" + id;
      return this.$http( {
         method : "GET",
         url : url
      } ).then( function( response ) {
         // console.log( "GET response is: " );
         // console.log( response.data );
         return response.data;
      }, function( error ) {
         console.log( "GET returned with error; returning null" );
         return null;
      } );
   };

   RestDB.prototype.putDocument = function( id, data ) {
      var url = this.databaseUrl;
      if( id ) {
         url += "/" + id;
      }
      // console.log( "POST on: " + url );
      return this.$http( {
         method : "POST",
         url : url,
         data : data
      } ).then( function( response ) {
         // console.log( "POST response is: " );
         // console.log( response.data );
         return response.data;
      } );
   };

   RestDB.prototype.deleteDocument = function( id ) {
      var url = this.databaseUrl + "/" + id;
      // console.log( "http DELETE  " + url );
      return this.$http( {
         method : "DELETE",
         url : url
      } );
   };

   return {
      restDbOnRemoteServer : function( $http, url ) {
         return new RestDB( $http, url );
      },
      createLocalStorage: function() {
         return new LocalStorage();
      },
      restDbOnLocalStorage : function( ls, q ) {
         return new RestDBOnLocalStorage( ls, q ); 
      } 
   };
} );

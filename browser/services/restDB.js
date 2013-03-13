"use strict";

define( [ "underscore" ], function( _ ) {
   function now() {
      return new Date();
   }
   
   // //////////////////////////////////////////////////////////////////////////////////////////////////

   function RestDBOnLocalStorage( ls, q ) {
      this.localStorage = ls;
      this.q = q;
      this.lastSynced = now();
   }

   
   RestDBOnLocalStorage.prototype.scanDocuments = function( idPrefix, searchText ) {
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
      // var objJSON = this.localStorage.getItem( id );
      var objJSON = this.localStorage[ id ];
      // console.log( "getDocument for " + id + " returned " + objJSON );
      // console.log( this.localStorage );
      
      if( ! objJSON ) {
         return null;
      }
      
      return JSON.parse( objJSON );
   };

   
   RestDBOnLocalStorage.prototype.getDocument = function( id ) {
      return this.q.when( this.getDocumentSynchronous( id ) );
   }; 
   
   RestDBOnLocalStorage.prototype.putDocumentSynchronous = function( id, data ) {
      // this.localStorage.setItem( id, JSON.stringify( data ) );
      this.localStorage[ id ] = JSON.stringify( data );
      return data;
   };

   
   RestDBOnLocalStorage.prototype.putDocument = function( id, data ) {
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

   
   
   RestDBOnLocalStorage.prototype.sync = function() {
      var countLimit = 30;
      var self = this;
      var lastSyncedTime = self.lastSynced.getTime();
      var itemMap = {};
      var modifiedItemMap = {};
      var countItems = 0;
      for( var i = 0; i < this.localStorage.length && countItems < countLimit; ++i ){
         var key = this.localStorage.key( i );
         var objJSON = this.localStorage[ key ];
         var obj = JSON.parse( objJSON );
         if( !obj.lastModified ) {
            obj.lastModified = self.lastSynced;
            itemMap[ key ] = obj;
            ++countItems;
            modifiedItemMap[ key ] = obj;
         } else {
            var lastModified = new Date( obj.lastModified );
            if( lastModified.getTime() - lastSyncedTime >= 0 ) {
               itemMap[ key ] = obj;
               ++countItems;
            }
         }
      }
      
      _.each( modifiedItemMap, function( value, key ) {
         self.localStorage[ key ] = JSON.stringify( value );
      });
      
      if( countItems > 0 ) {
         return itemMap;
      }
      else {
         return null;
      }
   };

   
   RestDBOnLocalStorage.prototype.finalizeSync = function() {
      this.lastSynced = now();
   };
   
   
   // //////////////////////////////////////////////////////////////////////////////////////////////////

   function RestDB( $http, databaseUrl ) {
      this.databaseUrl = databaseUrl;
      this.$http = $http;
   }

   RestDB.prototype.scanDocuments = function( idPrefix, searchText ) {
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
      console.log( "POST on: " + url );
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

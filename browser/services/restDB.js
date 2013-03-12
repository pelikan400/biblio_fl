"use strict";

define( [ "underscore" ], function( _ ) {
   function LocalStorage() {
      console.log( "new local storage." );
      this.store = window.localStorage;
      this.modifiedItemsMap = {};
   }
      
   
   LocalStorage.prototype.get = function( id ) {
      var objJSON = this.store.getItem( id );
      if( objJSON ) {
         return JSON.parse( objJSON );
      }
      else {
         return null;
      }
   };
   
   LocalStorage.prototype.put = function( id, obj ) {
      var objJSON = JSON.stringify( obj );
      this.store.setItem( id, objJSON );
      this.modifiedItemsMap[ id ] = id;
      return obj;
   };
   
   LocalStorage.prototype.load = function( documentArray ) {
      var self = this;
      _.each( documentArray, function( doc ) {
         self.put( doc.id, doc );
      });
   };
   
   LocalStorage.prototype.sync = function() {
      
   };

   
   // //////////////////////////////////////////////////////////////////////////////////////////////////

   function RestDBOnLocalStorage( ls, q ) {
      this.localStorage = ls;
      this.q = q;
      this.modifiedItemsMap = {};
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
      this.modifiedItemsMap[ id ] = id;
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
      var self = this;
      var unsyncedObjectsMap = {}; 
      _.each( self.modifiedItemsMap, function( value, key ) {
         unsyncedObjectsMap[ key ] = this.getDocumentSynchronous( key );
      });
      return { unsyncedObjectsMap: unsyncedObjectsMap, modifiedItemsMap: self.modifiedItemsMap };
      self.modifiedItemsMap = {};
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
      var url = this.databaseUrl + "/" + id;
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

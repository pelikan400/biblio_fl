"use strict";
   
define( [ "underscore" ], function( _ ) {
   ////////////////////////////////////////////////////////////////////////////////////////////////////

   function RestDB( $http, databaseUrl) {
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

      return this.$http( { method: "GET", url: url } )
      .then( function( response ) {
         console.log( "GET response is: " );
         console.log( response.data );
          return response.data;
      }, function( error ) {
         console.log( "GET returned with error; returning null" );
         return null;
      });
   };
   
   RestDB.prototype.getDocument = function( id ) {
      var url = this.databaseUrl + "/" + id;
      return this.$http( { method: "GET", url: url } )
      .then( function( response ) {
         console.log( "GET response is: " );
         console.log( response.data );
          return response.data;
      }, function( error ) {
         console.log( "GET returned with error; returning null" );
         return null;
      });
   };
   
   RestDB.prototype.putDocument = function( id, data ) {
      var url = this.databaseUrl + "/" + id;
      return this.$http( { method: "PUT", url: url, data: data } )
      .then( function( response ) {
          console.log( "PUT response is: " );
          console.log( response.data );
          return response.data;
      });
   };
   

   RestDB.prototype.deleteDocument = function( doc ) {
     var url = this.databaseUrl + "/" + id;
     return $http( { method: "DELETE", url: url } );
   };

    return {
        db: function( $http, url ) {
            return new RestDB( $http, url );
        }
    };
} );

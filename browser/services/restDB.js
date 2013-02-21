"use strict";
   
define( [ "underscore" ], function( _ ) {
   ////////////////////////////////////////////////////////////////////////////////////////////////////

   function RestDB( $http, databaseUrl) {
     this.databaseUrl = databaseUrl;
     this.$http = $http;
   }

   
   RestDB.prototype.getDocument = function( id ) {
      var url = this.databaseUrl + "/" + id;
      return this.$http( { method: "GET", url: url } )
      .then( function( response ) {
          return JSON.parse( response.data );
      });
   };
   
   RestDB.prototype.putDocument = function( id, data ) {
      var url = this.databaseUrl + "/" + id;
      var dataAsJson = JSON.stringify( data );
      return this.$http( { method: "PUT", url: url, data: data } )
      .then( function( response ) {
          console.log( "PUT response is: " );
          console.log( response.data );
          return response.data;
      });
   };
   
   RestDB.prototype.getAllDocs = function() {
     var allDocsUrl = this.databaseUrl + "/_all_docs";
     return $http( { method: "GET", url: allDocsUrl } )
     .then( function( response ) {
         return response.data;
     });
   };
   
   RestDB.prototype.getView = function() {
     var allDocsUrl = this.databaseUrl + "/_all_docs";
     return $http( { method: "GET", url: allDocsUrl } )
     .then( function( response ) {
         return response.data;
     });
   };
   
   RestDB.prototype.createDoc = function( doc ) {
     var url = this.databaseUrl;
     return $http( { method: "POST", url: url } )
     .then( function( response ) {
         _.extend( doc, response.data );
         return response.data;
     });
   };

   RestDB.prototype.readDoc = function( doc ) {
     var url = this.databaseUrl + "/" + id;
     return $http( { method: "GET", url: url } )
     .then( function( response ) {
         _.extend( doc, response.data );
         return response.data;
     });
   };

   RestDB.prototype.updateDoc = function( doc ) {
     var url = this.databaseUrl + "/" + id;
     return $http( { method: "PUT", url: url } )
     .then( function( response ) {
         _.extend( doc, response.data );
         return response.data;
     });
   };

   RestDB.prototype.deleteDoc = function( doc ) {
     var url = this.databaseUrl + "/" + id;
     return $http( { method: "DELETE", url: url } );
   };

    return {
        db: function( $http, url ) {
            return new RestDB( $http, url );
        }
    };
} );

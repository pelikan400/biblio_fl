"use strict";
   
define( [ "underscore" ], function( _ ) {
   ////////////////////////////////////////////////////////////////////////////////////////////////////

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

    return {
        db: function( $http, url, secretKey, keyId ) {
            return new CouchDB( $http, url, secretKey, keyId );
        }
    };
} );

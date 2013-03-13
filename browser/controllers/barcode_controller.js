'use strict';

define( [ "underscore" ], function( _ ) {
    var controller = [ '$scope', "$location", "ixoidDatabase", "$q", function BarcodeController( $scope, $location, db, q ) {
       $scope.configuration = null;
       $scope.barcodeType = "books";
       $scope.quantity = 1;
       
       db.getRawDocument( "configuration-base" )
       .then( function( configuration ) {
          if( !configuration ) {
              configuration = db.createDocument( "configuration-base" );
              _.extend( configuration, {
                counters : {
                  books: 12000, 
                  customers: 420
                },
                companyName : "Bibliothek KGS Forster Linde"
              } );
          }
          $scope.configuration = configuration;
       } );
       
       $scope.printBarcodes = function() {
          var startCounter = parseInt( $scope.configuration.counters[ $scope.barcodeType ] );
          var quantity = parseInt( $scope.quantity ); 
          // right now there is only one label sheet type
          var endCounter = startCounter + quantity * 40;
          $scope.configuration.counters[ $scope.barcodeType ] = endCounter;
          var companyName = encodeURIComponent( $scope.configuration.companyName );
          $scope.configuration.put()
          .then( function( conf ) {
              // $location.path( "/barcode?startCounter=" + startCounter + "&endCounter=" + endCounter );
              window.location = "/barcode?startCounter=" + startCounter + "&endCounter=" + endCounter + "&labelTitle=" + companyName +
                  "&computeChecksum=x";
          });
       };
   } ];

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      registerExports: function( angularModule ) {
         console.log( "BarcodeController registered." );
         angularModule.controller( 'BarcodeController', controller );
      }
   };
} );

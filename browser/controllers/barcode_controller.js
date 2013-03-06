'use strict';

define( function() {
    var controller = [ '$scope', "ixoidDatabase", "$q", function BarcodeController( $scope, db, q ) {
       $scope.configuration = null;
       $scope.barcodesType = "customers";
       
       db.getRawDocument( "configuration-base" )
       .then( function( configuration ) {
          if( !configuration ) {
             configuration = {
                counters : {
                   books: 12000, customers: 420
                },
                companyName : "Bibliothek KGS Forster Linde"
             };
          }
          $scope.configuration = configuration;
       } );
       
       $scope.printBarcodes = function() {
          var startCounter = $scope.configuration.counters[ $scope.barcodeType ];
          // right now there is only one label sheet type
          var endCounter = startCounter + 40;
          $scope.configuration.counters[ $scope.barcodeType ] = endCounter;
          $scope.configuration.put()
          .then( function( conf ) {
             $location.path( "/barcode?startCounter=" + startCounter + "&endCounter=" + endCounter );
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

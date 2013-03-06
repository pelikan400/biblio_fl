define( [ "jquery"], function( jquery ) {
   'use strict';

   // /////////////////////////////////////////////////////////////////////////////////////////////////////////

   var controller = [ '$scope', '$routeParams', '$location', "ixoidDatabase", 
                      function CustomersController( $scope, $routeParams, $location, db ) {
      // console.log( "CustomersController initialized." );
      $scope.$root.activeMenuId = "customers";

      $scope.customerList = null;
      $scope.editableCustomer = null;
      $scope.originalBarcode = null;

      if( $routeParams.action == "list" ) {
          db.getAllCustomers()
          .then( function( customerList ) {
              $scope.customerList = customerList;
              console.log( $scope.customerList );
          });
       }
       else if( $routeParams.action == "new" ) {
          $scope.editableCustomer = db.createCustomer();
          $scope.originalBarcode = $scope.editableCustomer.barcode;
       }
       else if( $routeParams.action == "edit" && $routeParams.customerId ) {
         db.getCustomerById( $routeParams.customerId ) 
         .then( function( customer ) {
            $scope.editableCustomer = customer;
            $scope.originalBarcode = $scope.editableCustomer.barcode;
         } );
       }

      // /////////////////////////////////////////////////////////////////////////////////////////////////////////
      
      $scope.editCustomer = function() {
         console.log( "Hey we got a first call to editCustomer" );
      };

      $scope.doNothing = function() {
         console.log( "called doNothing" );
      };

      // /////////////////////////////////////////////////////////////////////////////////////////////////////////

      $scope.saveCustomerAndCreateNew = function() {
         function internalSaveCustomerAndNew() {
            return $scope.editableCustomer.put()
            .then( function() {
               $scope.ixoidMessages.push( {
                  text : "Kunde gespeichert!",
                  type : "success"
               } );
               $scope.editableCustomer = db.createCustomer();
               $scope.originalBarcode = $scope.editableCustomer.barcode;
               jquery( "#firstName" ).focus();
            });
         }
         
         console.log( "called saveCustomer" );
         if( $scope.originalBarcode == $scope.editableCustomer.barcode ) {
            return internalSaveCustomerAndNew();
         }

         if( !db.checkBarcodeString( $scope.editableCustomer.barcode ) ) {
            console.log( "Fehlerhafter Barcode!" );
            $scope.ixoidMessages.push( {
               text : "Fehlerhafter Barcode!",
               type : "error"
            } );
            return;
         }

         var barcodeObject = db.createBarcode( $scope.editableCustomer.barcode, $scope.editableCustomer.id );
         barcodeObject.put();
         return internalSaveCustomerAndNew();
      };
   } ];

   // /////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      registerExports : function( angularModule ) {
         console.log( "CustomersController registered." );
         angularModule.controller( 'CustomersController', controller );
      }
   };
} );

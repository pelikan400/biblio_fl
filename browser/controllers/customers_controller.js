define( [ "jquery"], function( jquery ) {
   'use strict';

   // /////////////////////////////////////////////////////////////////////////////////////////////////////////

   var controller = [ '$scope', '$routeParams', '$location', "ixoidDatabase",  "$q",
                      function CustomersController( $scope, $routeParams, $location, db, q ) {
      // console.log( "CustomersController initialized." );
      $scope.$root.activeMenuId = "customers";

      $scope.customerList = null;
      $scope.editableCustomer = null;
      $scope.originalBarcode = null;

      var routeAction = function() {
         if( $routeParams.action == "list" ) {
            db.getAllCustomers()
            .then( function( customerList ) {
                $scope.customerList = customerList;
                console.log( $scope.customerList );
            });
         }
         else if( $routeParams.action == "new" ) {
            $scope.newCustomer();
         }
         else if( $routeParams.action == "edit" && $routeParams.customerId ) {
           db.getCustomerById( $routeParams.customerId ) 
           .then( function( customer ) {
              $scope.editableCustomer = customer;
              $scope.originalBarcode = $scope.editableCustomer.barcode;
           } );
         }
      };

      // /////////////////////////////////////////////////////////////////////////////////////////////////////////
      
      $scope.editCustomer = function() {
         console.log( "Hey we got a first call to editCustomer" );
      };

      $scope.doNothing = function() {
         console.log( "called doNothing" );
      };

      // /////////////////////////////////////////////////////////////////////////////////////////////////////////

      $scope.saveCustomerAndCreateNew = function() {
         console.log( "called saveCustomer" );

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

         if( !$scope.editableCustomer.firstName || !$scope.editableCustomer.lastName ) {
            $scope.ixoidMessages.push( {
               text : "Bitte Name und Vorname angeben!",
               type : "error"
            } );
            return;
         }

         if( $scope.originalBarcode != $scope.editableCustomer.barcode ) {
             if( !db.checkBarcodeString( $scope.editableCustomer.barcode ) ) {
                 console.log( "Fehlerhafter Barcode!" );
                 $scope.ixoidMessages.push( {
                         text : "Fehlerhafter Barcode!",
                             type : "error"
                             } );
                 return;
             }
             else {
                 // TODO: check if new barcode is already in use
                 // TODO: delete original barcode
                 var barcodeObject = db.createBarcode( $scope.editableCustomer.barcode, $scope.editableCustomer.id );
                 barcodeObject.put();
             }
         }

         return internalSaveCustomerAndNew();
      };
      
      
      
      
      
      
      
      
      
      
      
      
      ///////////////////////////////////////////////////////////////////////////////////////////////////////////

      var checkAndSaveBarcode = function() {
         var promiseTrue = q.when( true );
         var promiseFalse = q.when( false );
         var resetBarcodeToOldValue = function() {
            $scope.warningMessage( "Barcode wurde auf alten Wert zurückgesetzt." );
            $scope.editableCustomer.barcode = $scope.originalBarcode;
            return promiseFalse;
         };
         

         var deleteBarcode = function( barcodeNumber ) {
            if( !barcodeNumber ) {
               return promiseTrue;
            }
            else {
               return db.createBarcode( $scope.originalBarcode ).del();
            }
         };
         
         var saveBarcode = function() {
            // TODO: check for duplicate barcodes
            return db.createBarcode( $scope.editableCustomer.barcode ).get()
            .then( function( doc ) {
               if( doc ) {
                  $scope.errorMessage(  "Neuer Barcode ist bereits vergeben." );
                  return resetBarcodeToOldValue();
               }
               else {
                  // TODO: delete old barcode
                  return  deleteBarcode( $scope.originalBarcode )
                  .then( function() {
                     if( $scope.editableCustomer.barcode ) {
                        return db.createBarcode( $scope.editableCustomer.barcode, $scope.editableCustomer.id ).put();
                     } else {
                        return promiseTrue;
                     }
                  });
               }
            });
         };
         
         console.log( "original barcode: " + $scope.originalBarcode );  
         console.log( "new barcode: " + $scope.editableCustomer.barcode );  

         if( $scope.originalBarcode == $scope.editableCustomer.barcode ) {
            return promiseTrue;
         }
         
         if( $scope.editableCustomer.barcode ) {
            if( ( $scope.editableCustomer.barcode.length > 4 &&  $scope.editableCustomer.barcode.charAt( 0 ) != "0") || 
                ! db.checkBarcodeString( $scope.editableCustomer.barcode ) ) {
               $scope.errorMessage( "Fehlerhafter Barcode." );
               return promiseFalse;
           }
           
           if( !$scope.originalBarcode ) {
              return saveBarcode();
           }
         }
         
         return $scope.retryPromiseMessage( "Barcode wirklich ändern?" )
         .then( function( result ) {
            if( result ) {
               return saveBarcode();
            } else {
               return resetBarcodeToOldValue();
            }
         });
      };

      ///////////////////////////////////////////////////////////////////////////////////////////////////////////

      $scope.saveCustomer = function() {
         
         if( !$scope.editableCustomer.firstName || !$scope.editableCustomer.lastName ) {
            $scope.errorMessage( "Bitte Name und Vorname angeben." );
            return;
         }
  
        checkAndSaveBarcode()
        .then( function( result ) {
           if( result ) {
              $scope.editableCustomer.put();
              $scope.originalBarcode = $scope.editableCustomer.barcode;
              $scope.successMessage( "Kunde gespeichert." );
           }
        });
      };

      ///////////////////////////////////////////////////////////////////////////////////////////////////////////

      $scope.deleteCustomer = function() {
        return $scope.retryPromiseMessage( "Wollen Sie den Kunden wirklich löschen?" )
        .then( function( result ) {
           if( result ) {
              return db.createBarcode( $scope.editableCustomer.barcode ).del()
              .then( function() {
                 return $scope.editableCustomer.del();
              })
              .then( function() { 
                 $scope.editableCustomer = db.createCustomer();
                 $scope.originalBarcode = $scope.editableCustomer.barcode;
                 $scope.successMessage( "Kunde wurde gelöscht." );
                 return $scope.editableCustomer;
              });
           } else {
              console.log( "Action aborted." );
           }
        });
       };

       ///////////////////////////////////////////////////////////////////////////////////////////////////////////

       $scope.newCustomer = function() {
          $scope.editableCustomer = db.createCustomer();
          $scope.originalBarcode = $scope.editableCustomer.barcode;
       };
       
       routeAction();
   } ];

   // /////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      registerExports : function( angularModule ) {
         console.log( "CustomersController registered." );
         angularModule.controller( 'CustomersController', controller );
      }
   };
} );

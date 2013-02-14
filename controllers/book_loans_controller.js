define( function() {
   'use strict';

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

    function isDigit( c )
    {
        var code = c.charCodeAt( 0 );
        var code0 = "0".charCodeAt( 0 );
        var code9 = String( "9" ).charCodeAt( 0 );
        return code >= 0 && code <= code9;
    }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

    var controller = [ '$scope', function BookLoansController( $scope ) {
        $scope.books = [];
        $scope.selectedPerson = null;
        $scope.generalInputText = "";
        console.log( "BookLoansController initialized." );

        // TODO: put focus on generalInputText ?
        $scope.parseGeneralInput = function () {
            console.log( "Input is: '" + $scope.generalInputText + "'" );
            var text = $scope.generalInputText;
            if( isDigit( text ) ) {
               if( text.length < 6 || text[0] == "0" ) {
                   console.log( "Person ID detected: " + text );
                   $scope.books = [];
               }
               else {
                   console.log( "Book ID detected: " + text );
                   $scope.books.push( text );
               }
            }
            else {
                if( text.charAt( 0 ) == "?" ) {
                    text = text.substring( 1 ).trim();
                }
                console.log( "Text search: '" + text + "'" );
            }

            $scope.generalInputText = "";
        }
   } ];

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      registerExports: function( angularModule ) {
         console.log( "BookLoansController registered." );
         angularModule.controller( 'BookLoansController', controller );
      }
   }
} );

require.config( {
   packages : [ {
      name : 'angular',
      location : 'lib/angular'
   } ],

   paths : {
      'angular' : 'lib/angular/angular.min',
      'angular-resource' : 'lib/angular/angular-resource',
      'jquery' : 'lib/jquery/jquery-1.8.1.min',
      'underscore' : 'lib/underscore/underscore-min',
      'twitter-bootstrap' : 'lib/bootstrap/js/bootstrap',
      'sha256' : 'lib/crypto/rollups/sha256',
      'hmac-sha256' : 'lib/crypto/rollups/hmac-sha256'
   },

   shim : {
      'angular-resource' : [ 'angular' ],
      'angular' : {
         deps : [ 'jquery' ],
         exports : 'angular'
      },
      'underscore' : {
         exports : '_'
      },
      'hmac-sha256' : {
         exports : 'CryptoJS'
      },
      'sha256' : {
         deps : [ 'hmac-sha256' ],
         exports : 'CryptoJS'
      },
      'twitter-bootstrap' : [ 'jquery' ]
   }

} );

require(
   [ "jquery", "twitter-bootstrap", "underscore", "angular", "angular-resource", "angularApplication" ],
   function( jquery, bootstrap, _, angular, angularResource, angularApplication ) {

      // enrich Date with some util methods
      function enrichDate() {
         Date.prototype.clearTime = function() {
            this.setHours( 0, 0, 0, 0 );
            return this;
         };

         Date.prototype.addDays = function( numberOfDays ) {
            var millisecondsForDays = numberOfDays * 24 * 3600 * 1000;
            var x = this.getTime() + millisecondsForDays;
            return new Date( x );
         };

         Date.prototype.isSameDay = function( otherDate ) {
            if( !otherDate ) {
               return false;
            }
            var x1 = new Date( this.getTime() );
            var x2 = new Date( otherDate.getTime() );
            x1.clearTime();
            x2.clearTime();
            return x1.getTime() == x2.getTime();
         };
         
         var monthNames = [ "Januar", "Februar", 
                            "März", "April", "Mai", 
                            "Juni", "Juli", "August", 
                            "September", "Oktober", "November", 
                            "Dezember" ];
         Date.prototype.asGermanDate = function() {
           return "" + this.getDate() + ". "  + monthNames[ this.getMonth() ] + ". " + this.getFullYear();
         };
      }

      var angularModule = angular.module( "bibliothek.ixoid.de", [ 'ngResource' ] );
      angularApplication.importInto( angularModule );
      angular.bootstrap( document, [ 'bibliothek.ixoid.de' ] );
      enrichDate();
   } );

require.config( {
   packages: [
      {
         name: 'angular',
         location: 'lib/angular' 
      }
   ],

   paths: {
      'angular': 'lib/angular/angular.min',
      'angular-resource': 'lib/angular/angular-resource',
      'jquery': 'lib/jquery/jquery-1.8.1.min',
      'underscore': 'lib/underscore/underscore-min',
      'twitter-bootstrap': 'lib/bootstrap/js/bootstrap',
      'sha256' : 'lib/crypto/rollups/sha256',
      'hmac-sha256' : 'lib/crypto/rollups/hmac-sha256'
   },
   
   shim: {
      'angular-resource': [ 'angular' ],
      'angular': {
         deps: [ 'jquery' ],
         exports: 'angular'
      },
      'underscore': {
         exports: '_'
      },
      'hmac-sha256': {
         exports: 'CryptoJS'
      },
      'sha256': {
         deps: [ 'hmac-sha256' ],
         exports: 'CryptoJS'
      },
      'twitter-bootstrap': ['jquery']
  }
   
} );

require( [ "jquery", "twitter-bootstrap", "underscore", "angular",  "angular-resource", "angularApplication" ],
   function( jquery, bootstrap, _, angular, angularResource, angularApplication ) {
       var angularModule = angular.module( "bibliothek.ixoid.de", [ 'ngResource' ] );
       angularApplication.importInto( angularModule );
       angular.bootstrap( document, [ 'bibliothek.ixoid.de' ] );
   } 
);

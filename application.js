require.config( {
   packages: [
      {
         name: 'angular',
         location: 'lib/angular' 
      },
      {
         name: 'ixoid-utils',
         location: 'lib/ixoid/utils' 
      }
   ],

   paths: {
      'angular': 'lib/angular/angular',
      'jquery': 'lib/jquery/jquery-1.8.1.min',
      'underscore': 'lib/underscore/underscore-min',
      'twitter-bootstrap': 'lib/bootstrap/js/bootstrap'
   },
   
   shim: {
      'angular': {
         deps: [ 'jquery' ],
         exports: 'angular'
      },
      'underscore': {
         exports: '_'
      },
      'twitter-bootstrap': ['jquery']
  }
   
} );

require( [ "jquery", "twitter-bootstrap", "angular", "underscore" ],
   function( jquery, bootstrap, angular, _  ) {
   } 
);


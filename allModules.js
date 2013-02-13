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
      // requirejs plugins
      'text': 'lib//vendor/requirejs/text',

      // vendor
      'angular': 'lib/vendor/angular-1.0.4/angular.min',
      'angular/mocks': 'lib/vendor/angular-1.0.4/angular-mocks',
      'angular/scenario': 'lib/vendor/angular-1.0.4/angular-scenario',
      'jquery': 'lib/vendor/jquery-1.8.1.min',
      'underscore': 'lib/vendor/underscore-min',
      'twitter-bootstrap': 'lib/bootstrap/js/bootstrap.min',
      'vendor/parseUri': 'lib/vendor/parseUri-1.2.2'
   },
   
   shim: {
      'angular': {
         deps: [ 'jquery' ],
         exports: 'angular'
      },
      'select2': {
         deps: [ 'jquery' ]
      },
      'underscore': {
         exports: '_'
      },
      'angular/mocks': {
         deps: [ 'angular' ]
      },
      'angular/scenario': {
         exports: 'angular'
      },
      'vendor/spinner': {
         exports: 'Spinner'
      },
      'vendor/sha256': {
         exports: 'jsSHA'
      },
      'vendor/event_emitter': {
         exports: 'EventEmitter'
      },
      'vendor/parseUri': {
         exports: 'parseUri' 
      },
      
      'twitter-bootstrap': ['jquery']
  }
   
} );

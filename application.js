require.config( {
   packages: [
      {
         name: 'angular',
         location: 'lib/angular' 
      }
   ],

   paths: {
      'angular': 'lib/angular/angular',
      'angular-resource': 'lib/angular/angular-resource',
      'jquery': 'lib/jquery/jquery-1.8.1.min',
      'underscore': 'lib/underscore/underscore-min',
      'twitter-bootstrap': 'lib/bootstrap/js/bootstrap'
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


// angular.module('Twitter', ['ngResource']);
// 
// function TwitterCtrl($scope, $resource) {
//     $scope.twitter = $resource('http://search.twitter.com/:action',
//         {action:'search.json', q:'angularjs', callback:'JSON_CALLBACK'},
//         {get:{method:'JSONP'}});
// 
//     $scope.doSearch = function () {
//         $scope.twitterResult = $scope.twitter.get({q:$scope.searchTerm});
//     };
// }
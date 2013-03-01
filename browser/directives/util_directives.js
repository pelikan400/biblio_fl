"use strict";

define( [ "jquery", "underscore" ], function( jquery, _ ) {
   'use strict';

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   
   /**
    * Directive for displaying a message. 
    * 
    * A message is an object with the following attributes:
    * - `text`: the main text to display
    * - `heading` (optional): the heading to be displayed
    * - `actions` (optional): an array of objects { apply: function, label: String, style: 'danger'|'' }
    * - `retry` (optional): convenience shortcut for `actions: { apply: <retry> label: 'Retry action', style: 'danger' }`
    */
   var ixoidMessage  = function() {
       var messageTypeToBootstrapClass = {
          success: 'alert-success',
          error: 'alert-error',
          warning: 'alert-warning',
          info: 'alert-info'
       };

     return {
       template: '<div class="alert alert-block {{alertClass}} fade in">' +
       '<button class="close" type="button" data-ng-click="dismiss( $event )">x</button>' +
       '<h4 data-ng-show="heading != null" class="alert-heading">{{heading}}</h4>' +
       '<p>{{text}}</p>' +
       '<p ng-repeat="action in actions()">' + 
       '<button class="btn btn-{{action.style}}" data-ng-click="apply( action )">{{action.label}}</button>' +
       '</p>' +
       '</div>',
         
       scope: {
          fallbackHeading: '@heading',
          message: '=ixoidMessage'
       },
         
       link: function( scope, element, attrs ) {
         console.log( "ixoidMessage" );
         console.log( scope );
         console.log( element );
         console.log( attrs );

         function dismiss() {
           jqery( element[ 0 ] ).alert( 'close' );
           scope.$emit( 'ixoidMessage.messageDismissed', scope.message );
         }
            
         var actions = null;
         scope.actions = function() {
               
           if( actions != null ) {
             return actions;
           }
               
           actions = [];
               
           if( scope.message.actions ) {
             actions = actions.concat( scope.message.actions );
           }
               
           if( _.isFunction( scope.message.retry ) ) {
             actions.push( {
               label: 'Retry action',
                   apply: scope.message.retry,
                   style: 'danger'
                   } );
           } 
               
           return actions;
         };

         scope.apply = function( action ) {
           action.apply();
           dismiss();
         };

            
         scope.dismiss = dismiss;
            
         scope.$watch( 'message', function( message ) {
             if( message != null ) {

               scope.text = message.text || message.message;
               scope.heading = message.heading || scope.fallbackHeading;
                  
               if( message.type != null ) {
                 scope.alertClass = messageTypeToBootstrapClass[ message.type ];
               }
               else {
                 scope.alertClass = messageTypeToBootstrapClass[ attrs.ixoidMessageType ] || messageTypeToBootstrapClass.info;
               }
                  
             }
               
           } );
       }
     };
   };
            
   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   var ixoidMessages = function() {
     return {
       template: '<div data-ng-repeat="message in messages">' +
       '<div data-ixoid-message="message"></div>' +
       '</div>',
           
       scope: {
          messages: '=ixoidMessages'
       },
           
       link: function( scope, elements, attrs ) {
         console.log( "ixoidMessages" );
         console.log( scope );
         console.log( elements );
         console.log( attrs );
         scope.$on( 'ixoidMessage.messageDismissed', function( event, message ) {
             event.stopPropagation();
             var idx = scope.messages.indexOf( message );
             if( idx !== -1 ) {
               scope.messages.splice( idx, 1 );
             }
           } );
       }
     };
   };
    

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
   registerExports: function( angularModule ) {
       console.log( "Util directives registered." );
       angularModule.directive( 'ixoidMessage', ixoidMessage );
       angularModule.directive( 'ixoidMessages', ixoidMessages );
     }
   };
} );

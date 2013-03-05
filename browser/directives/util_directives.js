"use strict";

define(
   [ "jquery", "underscore" ],
   function( jquery, _ ) {

      // /////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Directive for displaying a message.
       * 
       * A message is an object with the following attributes: - `text`: the
       * main text to display - `heading` (optional): the heading to be
       * displayed - `actions` (optional): an array of objects { apply:
       * function, label: String, style: 'danger'|'' } - `retry` (optional):
       * convenience shortcut for `actions: { apply: <retry> label: 'Retry
       * action', style: 'danger' }`
       */

      var ixoidFocus = function() {
         return { link : function( scope, element, attrs ) {
            jquery( element[ 0 ] ).focus();
            console.log( "set focus" );
         } };
      };

      // /////////////////////////////////////////////////////////////////////////////////////////////////////////

      var ixoidDisableSubmitOnEnter = function() {
         return { link : function( scope, element, attrs ) {
            $( element[ 0 ] ).keydown( function( e ) {
               if( e.keyCode == 13 ) {
                  e.preventDefault();
                  return false;
               }
            } );
         } };
      };

      // /////////////////////////////////////////////////////////////////////////////////////////////////////////

      var ixoidMessage =
               [
                  "$timeout",
                  function( $timeout ) {
                     var messageTypeToBootstrapClass =
                              { success : 'alert-success', error : 'alert-error', warning : 'alert-warning',
                                 info : 'alert-info' };

                     return {
                        template : '<div class="alert alert-block {{alertClass}} fade in">'
                           + '<button class="close" type="button" data-ng-click="dismiss( $event )">x</button>'
                           + '<h4 data-ng-show="heading != null" class="alert-heading">{{heading}}</h4>'
                           + '<p>{{text}}</p>'
                           + '<p ng-repeat="action in actions()">'
                           + '<button class="btn btn-{{action.style}}" data-ng-click="apply( action )">{{action.label}}</button>'
                           + '</p>' + '</div>',

                        scope : { fallbackHeading : '@heading', message : '=ixoidMessage' },

                        link : function( scope, element, attrs ) {
                           function dismiss() {
                              jquery( element[ 0 ] ).hide();
                              // jquery( element[ 0 ] ).alert( 'close' );
                              scope.$emit( 'ixoidMessage.messageDismissed', scope.message );
                           }

                           var actions = null;
                           scope.actions =
                                    function() {

                                       if( actions != null ) {
                                          return actions;
                                       }

                                       actions = [];

                                       if( scope.message.actions ) {
                                          actions = actions.concat( scope.message.actions );
                                       }

                                       if( _.isFunction( scope.message.retry ) ) {
                                          actions.push( { label : 'Retry action',
                                             apply : scope.message.retry, style : 'danger' } );
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
                                 $timeout( scope.dismiss, 3000 );
                                 scope.text = message.text || message.message;
                                 scope.heading = message.heading || scope.fallbackHeading;

                                 if( message.type != null ) {
                                    scope.alertClass = messageTypeToBootstrapClass[ message.type ];
                                 }
                                 else {
                                    scope.alertClass =
                                             messageTypeToBootstrapClass[ attrs.ixoidMessageType ] ||
                                                messageTypeToBootstrapClass.info;
                                 }

                              }

                           } );
                        } };
                  } ];

      // /////////////////////////////////////////////////////////////////////////////////////////////////////////

      var ixoidMessages =
               function() {
                  return {
                     template : '<div data-ng-repeat="message in messages">'
                        + '<div data-ixoid-message="message"></div>' + '</div>',

                     scope : { messages : '=ixoidMessages' },

                     link : function( scope, elements, attrs ) {
                        scope.$on( 'ixoidMessage.messageDismissed', function( event, message ) {
                           event.stopPropagation();
                           var idx = scope.messages.indexOf( message );
                           if( idx !== -1 ) {
                              scope.messages.splice( idx, 1 );
                           }
                        } );
                     } };
               };

      // /////////////////////////////////////////////////////////////////////////////////////////////////////////

      var ixoidSpanOrInput = function() {
         return { template : '<span ng-show="">{{text}}</span><input ng-model="text" ng-show="text"/>',

         scope : { text : '=spanOrInput' },

         link : function( scope, elements, attrs ) {
            

         } };
      };

      // /////////////////////////////////////////////////////////////////////////////////////////////////////////

      var ixoidDropdownToggle = ['$document', '$location', '$window', function ($document, $location, $window) {
          var openElement = null, close;
          return {
          restrict: 'CA',
              link: function(scope, element, attrs) {
              scope.$watch(function dropdownTogglePathWatch(){return $location.path();}, function dropdownTogglePathWatchAction() {
                  if (close) { close(); }
                });
              
              element.parent().bind('click', function(event) {
                  if (close) { close(); }
                });
              
              element.bind('click', function(event) {
                  event.preventDefault();
                  event.stopPropagation();
                  
                  var iWasOpen = false;
                  
                  if (openElement) {
                    iWasOpen = openElement === element;
                    close();
                  }
                  
                  if (!iWasOpen){
                    element.parent().addClass('open');
                    openElement = element;
                    
                    close = function (event) {
                      if (event) {
                        event.preventDefault();
                        event.stopPropagation();
                      }
                      $document.unbind('click', close);
                      element.parent().removeClass('open');
                      close = null;
                      openElement = null;
                    };
                    
                    $document.bind('click', close);
                  }
                });
            }
          };
        }];

      // /////////////////////////////////////////////////////////////////////////////////////////////////////////

      return { registerExports : function( angularModule ) {
         console.log( "Util directives registered." );
         angularModule.directive( 'ixoidMessage', ixoidMessage );
         angularModule.directive( 'ixoidMessages', ixoidMessages );
         angularModule.directive( 'ixoidFocus', ixoidFocus );
         angularModule.directive( 'ixoidDisableSubmitOnEnter', ixoidDisableSubmitOnEnter );
         angularModule.directive( 'ixoidSpanOrInput', ixoidSpanOrInput );
         angularModule.directive( 'ixoidDropdownToggle', ixoidDropdownToggle );
      } };
   } );

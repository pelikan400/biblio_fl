var express = require( "express" );
var jade = require( "jade" );
var logger = require( "winston" );
var util = require( 'util' );

var main = function() {
   var app = express.createServer();
   
   app.use( "/", express.static( __dirname ) );
   console.log( "static dir: " + __dirname );
   app.use( express.bodyParser() );
   app.use( express.cookieParser() );
   
   app.use( express.session( { secret: "radischen" } ) );
   
   app.set( 'view engine', 'jade' );
   app.set('view options', {
      layout: false
   } );
   
   app.listen( 8090 );
   console.log( "Up and running on port 8090." );
};

// logger.debug( "dirname: " + __dirname );
process.on( 'uncaughtException', function ( err ) {
   console.log('Caught exception: ' + err.stack );
} );

 main();

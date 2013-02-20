import cherrypy

class HelloWorld( object ):
    @cherrypy.expose
    def index( self ):
        return "Hello World!"

print "CherryPy config: %s"  % cherrypy.config

cherrypy.quickstart( HelloWorld(), "", open( "cherrypy.config", "r" ) )

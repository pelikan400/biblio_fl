import cherrypy

class RestDbPage( object ):
    @cherrypy.expose
    def index( self, documentId = None ):
        print "Request is: %s" % cherrypy.request
        return "Hello database!"
    
    

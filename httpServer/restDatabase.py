import cherrypy

class Resource( object ):
   def GET( self, documentId ):
      print "GET with documentId: %s" % documentId
      return "{}"
   
   def PUT( self, documentId ):
      print "PUT with documentId: %s" % documentId
      return "{}"
   
   def OPTIONS( self, documentId ):
      print "OPTIONS"
      return "{}"

   
   @cherrypy.expose
   def index( self, documentId = None ):
       print "Request is: %s" % cherrypy.request
       return "Hello database!"
    
    

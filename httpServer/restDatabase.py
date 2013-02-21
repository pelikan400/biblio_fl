import cherrypy
import anydbm

##############################################################################################################

class BerkeleyDB: 
   def __init__( self, databaseName ) :
      self.databaseName = databaseName
      self.db = anydbm.open( self.databaseName, "c" )

   def getItem( self, itemKey ) : 
      if itemKey in self.db :
         return self.db[ itemKey ]
      else :
         return None

   def putItem( self, itemKey, item ) :
      self.db[ itemKey ] = item
      return item

   def allItems( self ) :
      data = "{ "
      first = True
      for key, value in self.db.iteritems() :
         if first : 
            first = False
         else :
            data += ","
         data += '"%s" : %s' % ( key, value )
         pass
      data += " }"
      return data

   # TODO implement scan
   # TODO can we keep the db in the session ?

   def close( self ) :
      if self.db : 
         self.db.close()
         self.db = None


##############################################################################################################


class Resource( object ):
   exposed = True

   def getDatabase( self ) :
      return BerkeleyDB( "bibliofl.db" )

   def GET( self, *args ):
      print "%s with args: %s" % ( "GET", args )
      cherrypy.response.headers[ "Content-Type" ] = "application/json"
      if len( args ) == 1 :
         itemKey = args[ 0 ]
         db = self.getDatabase()
         item = db.getItem( itemKey )
         db.close()
         if item :
            # return '{ "message" : "Hello from BerkeleyDB " }'
            return item
         else :
            cherrypy.response.status = 500
            return ""
      else :
         db = self.getDatabase()
         item = db.allItems()
         db.close()
         return item

   
   def PUT( self, *args ):
      print "%s with args: %s" % ( "PUT", args )
      cherrypy.response.headers[ "Content-Type" ] = "application/json"
      if len( args ) == 1 :
         itemKey = args[ 0 ]
         db = self.getDatabase()
         data = cherrypy.request.body.read()
         item = db.putItem( itemKey, data )
         db.close()
         return item
      else :
         cherrypy.response.status = 500
         return ""
   
   # def OPTIONS( self, *args ) :
   #    print "%s with args: %s" % ( "OPTIONS", args )
   #    return "{}"
      
   # @cherrypy.expose
   # def index( self, documentId = None ):
   #     print "Request is: %s" % cherrypy.request
   #     return "Hello database!"
    
    

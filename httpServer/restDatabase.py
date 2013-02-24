import cherrypy
import anydbm

##############################################################################################################

accessControlList = {
   "ADMIN" : { 
      "methods" : set( [ "GET", "PUT" ] ), 
      "keyFilter" : { "deny" : [] } 
   },
   "ACCOUNTER" : { 
      "methods" : set( [ "GET", "PUT" ] ), 
      "keyFilter" : { "deny" : [ "admin" ] } 
   },
   "PATRON" : { 
      "methods" : set( [ "GET" ] ), 
      "keyFilter" : { "allow" : [ "book" ] } 
   },
   "GUEST" : { 
      "methods" : set( [ "GET" ] ), 
      "keyFilter" : { "allow" : [ "book" ] } 
   }
}


##############################################################################################################


class BerkeleyDB: 
   def filterItem( self, role, method, key ):
      return True
      if not role in accessControlList :
         return False
      acl = accessControlList[ role ]
      if not "methods" in acl:
         return False
      if not method in acl[ "methods" ] :
         return False
      if not "keyFilter" in acl :
         return False
      keyFilter = acl[ "keyFilter" ]
      if "allow" in keyFilter :
         for allowKeyPrefix in keyFilter[ "allow" ] :
            if key.find( allowKeyPrefix ) == 0 :
               return True
         return False
      if "deny" in keyFilter :
         for denyKeyPrefix in keyFilter[ "deny" ] :
            if key.find( denyKeyPrefix ) == 0 :
               return False
      return True
      
   def __init__( self, databaseName ) :
      self.databaseName = databaseName
      self.db = anydbm.open( self.databaseName, "c" )

   def getItem( self, role, itemKey ) : 
      if self.filterItem( role, "GET", itemKey ) :
         if itemKey in self.db :
            return self.db[ itemKey ]
      return None

   def putItem( self, role, itemKey, item ) :
      if self.filterItem( role, "PUT", itemKey ) :
         self.db[ itemKey ] = item
         return item
      return None

   def allItems( self, role ) :
      data = "{ "
      first = True
      for key, value in self.db.iteritems() :
         if not self.filterItem( role, "GET", key ) :
            continue
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


db = BerkeleyDB( "bibliofl.db" )

##############################################################################################################


class Resource( object ):
   exposed = True

   def getDatabase( self ) :
      return BerkeleyDB( "bibliofl.db" )

   def getRole( self ):
      if not cherrypy.session.has_key( "systemUserRole" ) :
         print "system user role not found in session; setting it to GUEST"
         cherrypy.session[ "systemUserRole" ] =  "GUEST"
      role = cherrypy.session[ "systemUserRole" ]
      return role
         
         
   def GET( self, *args ):
      print "%s with args: %s" % ( "GET", args )
      cherrypy.response.headers[ "Content-Type" ] = "application/json"
      role = self.getRole()
      if len( args ) == 1 :
         itemKey = args[ 0 ]
         item = db.getItem( role, itemKey )
         if item :
            return item
      else :
         item = db.allItems()
         if item : 
            return item
      cherrypy.response.status = 500
      return ""

   
   def PUT( self, *args ):
      print "%s with args: %s" % ( "PUT", args )
      role = self.getRole()
      cherrypy.response.headers[ "Content-Type" ] = "application/json"
      if len( args ) == 1 :
         itemKey = args[ 0 ]
         data = cherrypy.request.body.read()
         item = db.putItem( role, itemKey, data )
         if item : 
            return item
      cherrypy.response.status = 500
      return ""
   
   # def OPTIONS( self, *args ) :
   #    print "%s with args: %s" % ( "OPTIONS", args )
   #    return "{}"
      
   # @cherrypy.expose
   # def index( self, documentId = None ):
   #     print "Request is: %s" % cherrypy.request
   #     return "Hello database!"
    
    

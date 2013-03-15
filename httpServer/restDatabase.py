import cherrypy
import math
import anydbm
import json
# import traceback

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
      if key == None :
         return True
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
            return unicode( self.db[ itemKey ], "UTF-8" )
      return None


   def putItem( self, role, itemKey, item ) :
      if self.filterItem( role, "PUT", itemKey ) :
         self.db[ itemKey.encode( "UTF-8" ) ] = item.encode( "UTF-8" )
         self.db.sync()
         return item
      return None


   def deleteItem( self, role, itemKey ):
      if self.filterItem( role, "DELETE", itemKey ) :
         key = itemKey.encode( "UTF-8" )
         if key in self.db :
            del self.db[ key ]
      return None


   def allItems( self, role, idPrefix, searchPattern, timestamp = None, page = 1, pageSize = 100000 ) :
      if not self.filterItem( role, "GET", None ):
         return None
      page = page - 1
      if page < 0 :
         page = 0
      beginCounter = page * pageSize
      endCounter = beginCounter + pageSize
      dataOutput = '{ "items" : [ ' 
      first = True
      itemCounter = 0
      for key, valueAscii in self.db.items() :
         if not self.filterItem( role, "GET", key ) :
            continue
         if idPrefix and key.find( idPrefix ) != 0 :
            continue
         value = unicode( valueAscii, "UTF-8" )
         data = json.loads( value )
         if searchPattern and value.find( searchPattern ) == -1 :
            continue
         if timestamp and ( "lastModifiedTimestamp" in data ) and data[ "lastModifiedTimestamp" ] < timestamp :
            continue
         if itemCounter < beginCounter :
            continue
         if itemCounter >= endCounter :
            break
         if first : 
            first = False
         else :
            dataOutput += ","
         dataOutput += '%s' % value
         itemCounter += 1
      dataOutput += ' ], '
      totalPages = int( math.ceil( float( itemCounter ) / pageSize ) )
      dataOutput += ' "page" : %s, ' % page
      dataOutput += ' "pageSize" : %s, ' % pageSize
      dataOutput += ' "totalPages" : %s }' % totalPages
      return dataOutput


   def close( self ) :
      if self.db : 
         self.db.close()
         self.db = None


db = BerkeleyDB( "db/bibliofl.db" )

##############################################################################################################

class Resource( object ):
   exposed = True

   def __init__( self ):
      self.db = db 
      
   def getDatabase( self ) :
      return BerkeleyDB( "bibliofl.db" )

   def getRole( self ):
      if not cherrypy.session.has_key( "systemUserRole" ) :
         print( "system user role not found in session; setting it to GUEST" )
         cherrypy.session[ "systemUserRole" ] =  "GUEST"
      role = cherrypy.session[ "systemUserRole" ]
      return role
         

   def setHeaders( self ) :
      pass 

   def GET( self, *args, **kwargs ):
      print( "%s with args: %s" % ( "GET", args ) )
      cherrypy.response.headers[ "Content-Type" ] = "application/json;charset=UTF-8"
      role = self.getRole()
      if len( args ) == 1 :
         itemKey = args[ 0 ]
         item = self.db.getItem( role, itemKey )
         if item :
            print "GET: data: %s" % item
            # traceback.print_stack()
            return item.encode( "UTF-8" )
      else :
         idPrefix = "p" in kwargs and kwargs[ "p" ] or None
         searchPattern = "q" in kwargs and kwargs[ "q" ] or None
         timestamp = "lm" in kwargs and int( kwargs[ "lm" ] ) or None
         item = self.db.allItems( role, idPrefix, searchPattern, timestamp = timestamp )
         if item : 
            return item.encode( "UTF-8" )
      cherrypy.response.status = 500
      return ""

   
   def expandObject( self, x1, x2 ):
      for key2, value2 in x2.items() :
         x1[ key2 ] = value2
      return x1 
       
      
   def PUT( self, *args ):
      return self.POST( *args )
   
   def postItem( self, role, key, data ):
      itemKey = key.encode( "UTF-8" )
      """ key is in unicode and data is an object"""
      itemJSON = self.db.getItem( role, itemKey )
      if itemJSON :
         item = json.loads( itemJSON )
         print "Item before expand: %s" % item
         self.expandObject( item, data )
      else :
         item = data
      print "Item after expand: %s" % item
      
      item = self.db.putItem( role, itemKey, json.dumps( item ) )
      return item.encode( "UTF-8" )
      
   
   def POST( self, *args ):
      print( "%s with args: %s" % ( "POST", args ) )
      role = self.getRole()
      cherrypy.response.headers[ "Content-Type" ] = "application/json;charset=UTF-8"
      dataAsJSON = unicode( cherrypy.request.body.read(), "UTF-8" )
      data = json.loads( dataAsJSON )
      print "PUT: Got data: %s %s" % ( "", data ) 
      if len( args ) == 1 :
         itemKey = args[ 0 ]
         # itemKey = unicode( args[ 0 ], "UTF-8"  )
         print "PUT: Got key: %s  %s" % ( itemKey, type( itemKey ) ) 
         return self.postItem( itemKey, data )
      else :
         print "type of data is: %s" % type( data )
         for key, value in data.items() :
            self.postItem( role, key, value )
         return ""
      cherrypy.response.status = 500
      return ""
   
   def DELETE( self, *args ):
      print( "%s with args: %s" % ( "DELETE", args ) )
      role = self.getRole()
      if len( args ) == 1 :
         itemKey = args[ 0 ]
         self.db.deleteItem( role, itemKey )
      return ""
         
   # def OPTIONS( self, *args ) :
   #    print( "%s with args: %s" % ( "OPTIONS", args ) )
   #    return "{}"
      
   # @cherrypy.expose
   # def index( self, documentId = None ):
   #     print( "Request is: %s" % cherrypy.request )
   #     return "Hello database!"
    
    

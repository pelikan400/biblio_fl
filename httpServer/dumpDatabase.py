import cherrypy
import anydbm
# import traceback


db = anydbm.open( "bibliofl.db", "c" )

for key, valueAscii in db.iteritems() :
    try :
        value = unicode( valueAscii, "UTF-8" )
        print "%s : %s" % ( key, value.encode( "utf-8" ) )
        if len( value ) < 4 : # fuzzy value :-)
            print "Funny value, maybe damaged"
    except :
        print "Error on key %s" % key 
        pass
        

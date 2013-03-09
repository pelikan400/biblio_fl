from optparse import OptionParser
import cherrypy
import anydbm
# import traceback


##############################################################################################################

def parseCommandLineOptions() :
    parser = OptionParser()
    parser.add_option( "--dbName", dest="dbName", type = "string", default = "bibliofl.db" )
    parser.add_option( "--bearerBar", dest="bearerBar", action="store_true", default = False )
    return parser.parse_args()

options, args = parseCommandLineOptions()

db = anydbm.open( options.dbName, "c" )

try :
    for key, valueAscii in db.items() :
        try :
            value = unicode( valueAscii, "UTF-8" )
            print "%s : %s" % ( key, value.encode( "utf-8" ) )
            if len( value ) < 4 : # fuzzy value :-)
                print "Funny value, maybe damaged"
        except :
            print "Error on key %s" % key 
            pass
except :
   print "WTF"
   raise
        

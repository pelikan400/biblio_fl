from optparse import OptionParser
import cherrypy
import anydbm
# import traceback


##############################################################################################################

def parseCommandLineOptions() :
    parser = OptionParser()
    parser.add_option( "--dbName", dest="dbName", type = "string", default = "bibliofl.db" )
    parser.add_option( "--action", dest="action", type = "string", default = "dump" )
    parser.add_option( "--key", dest="key", type = "string", default = "" )
    parser.add_option( "--loadFile", dest="loadFile", type = "string", default = "" )
    return parser.parse_args()

options, args = parseCommandLineOptions()

db = anydbm.open( options.dbName, "c" )

if action == "dump" :
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
elif action == "del" :
   pass
elif action == "load" :
   pass

        

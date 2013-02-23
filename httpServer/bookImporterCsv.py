from optparse import OptionParser

def readRecords( file ):
   for line in file :
      print line
      record = line.split( ';' )
      yield record
      
      
def parseCommandLineOptions() :
    parser = OptionParser()
    parser.add_option( "--fileName", dest="fileName", type = "string"  )
    parser.add_option( "--counter", dest="counter", type="int" )
    return parser.parse_args()


options, args = parseCommandLineOptions()
f = open( options.fileName, "r" )
for x in readRecords( f ) : 
   print "cool line: %s" % x
   


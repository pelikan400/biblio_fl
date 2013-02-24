from optparse import OptionParser
import json
import string
import barcodeLabels

barcode = barcodeLabels.BarcodeITF()

print barcode.paddWithZeroAndComputeChecksum( "100", minimumPadding = 6 )

def readRecords( file ):
   for line in file :
      # line = unicode( line, 'UTF-8' )
      line = line.strip( string.whitespace )
      # print line
      record = []
      for x in ( x.strip( '"' ) for x in line.split( ';' ) ) :
         record.append( x )
      recordMap = {}
      recordMap[ "bookNumber" ] = record[ 0 ]
      recordMap[ "signature" ] = record[ 1 ]
      recordMap[ "title" ] = record[ 2 ]
      recordMap[ "author" ] = record[ 3 ]
      recordMap[ "editor" ] = record[ 4 ]
      yield recordMap
      
      
def parseCommandLineOptions() :
    parser = OptionParser()
    parser.add_option( "--inputFileName", dest="inputFileName", type = "string"  )
    parser.add_option( "--outputFileName", dest="outputFileName", type = "string"  )
    parser.add_option( "--barcodeLinks", dest="linksFileName", type = "string"  )
    parser.add_option( "--counter", dest="counter", type="int" )
    return parser.parse_args()


def main():
    options, args = parseCommandLineOptions()
    infile = open( options.inputFileName, "r" )
    outfile = open( options.outputFileName, "w" )
    barcodeLinksFile = open( options.linksFileName, "w" )
    labelCounter = int( options.counter )
    labelsPerPage = 10000
    labelParameter = ""
    barcodeLink= "http://www.ixoid.de:8080/barcode?labels="
    firstLine = True
    for x in readRecords( infile ) :
       if firstLine :
          firstLine = False
          continue
       x[ "barcode" ] =  barcode.paddWithZeroAndComputeChecksum( "%s" % labelCounter, minimumPadding = 6 )
       print >> outfile, json.dumps( x ).encode( 'UTF-8' )
       moduloCounter = ( labelCounter - options.counter ) % labelsPerPage
       if moduloCounter != 0 :
          labelParameter += ","
       labelParameter += "%s*%s%s" % ( x[ "barcode" ], x[ "signature" ], x[ "bookNumber" ] )
       if moduloCounter == labelsPerPage -1 :
          print >> barcodeLinksFile, "%s%s" % ( barcodeLink, labelParameter )
          print >> barcodeLinksFile
          labelParameter = ""
       labelCounter += 1
    print >> barcodeLinksFile, "%s%s" % ( barcodeLink, labelParameter )
       
       
       

main()

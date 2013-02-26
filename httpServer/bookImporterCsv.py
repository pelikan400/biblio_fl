#!/usr/bin/env python
# -*- coding: utf-8 -*-


# Hällöü ßßßßßßß


from optparse import OptionParser
import json
import string
import barcodeLabels
import codecs



barcode = barcodeLabels.BarcodeITF()
barcode.computeChecksum = True

print barcode.paddWithZeroAndComputeChecksum( "100", minimumPadding = 6 )

def readRecords( file ):
   for line in file :
      line = line.strip( string.whitespace )
      # nonUnicodeLine = line.encode( "UTF-8" )
      # print type( line ), repr( line )
      # print line
      record = []
      for x in ( x.strip( '"' ) for x in line.split( ';' ) ) :
         record.append( x )
      recordMap = {}
      recordMap[ "signature" ] = record[ 1 ]
      recordMap[ "title" ] = record[ 2 ]
      recordMap[ "author" ] = record[ 3 ]
      recordMap[ "publisher" ] = record[ 4 ]
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
    infile = codecs.open( options.inputFileName, "r", encoding = "utf-8" )
    outfile = codecs.open( options.outputFileName, "w", encoding = "utf-8" )
    barcodeLinksFile = codecs.open( options.linksFileName, "w", encoding = "utf-8" )
    labelCounter = int( options.counter )
    labelsPerPage = 10000
    labelParameter = ""
    barcodeLink= "http://www.ixoid.de:8080/barcode?labels="
    firstLine = True
    print >> outfile, "var books = ["
    for x in readRecords( infile ) :
       if firstLine :
          firstLine = False
          continue
       x[ "barcode" ] =  barcode.paddWithZeroAndComputeChecksum( "%s" % labelCounter, minimumPadding = 6 )
       recordAsJson = unicode( json.dumps( x, ensure_ascii = False ) )
       print type( recordAsJson ), repr( recordAsJson )
       # print json.dumps( x ), ","
       print >> outfile, recordAsJson, ","
       moduloCounter = ( labelCounter - options.counter ) % labelsPerPage
       if moduloCounter != 0 :
          labelParameter += ","
       labelParameter += "%s*%s%s" % ( x[ "barcode" ], x[ "signature" ], "" )
       if moduloCounter == labelsPerPage -1 :
          print >> barcodeLinksFile, "%s%s" % ( barcodeLink, labelParameter )
          print >> barcodeLinksFile
          labelParameter = ""
       labelCounter += 1
    print >> barcodeLinksFile, "%s%s" % ( barcodeLink, labelParameter )
    print >> outfile, "];"
       
       
       

main()

import cherrypy
import os
from httpServer import barcodeLabels
from httpServer.restDatabase import Resource
import StringIO 
from UserDict import DictMixin

current_dir = os.path.dirname( os.path.abspath( __file__ ) )

class RootPage( object ):
    def index( self ):
        return "Hello World!"

    index.exposed = True

    # def readBarcodeOptions( self, **kwargs ) :
    def readBarcodeOptions( self, description = "", labels = "", labelSheet = "avery4780", computeChecksum = "",
                            bearerBar = "",
                            withBorderLines = "", labelTitle = "Bibliothek KGS Forster Linde", counter = "0" ) :
        options = DictMixin()
        options.description = description
        options.labelsConcaternated = labels
        options.labelSheet = labelSheet
        options.withBorderLines = bool( withBorderLines )
        options.labelTitle = labelTitle
        options.counter = int( counter )
        options.computeChecksum = bool( computeChecksum )
        options.bearerBar = bool( bearerBar )
        return options
        
    def barcode( self, **kwargs ) :
        outputFile = StringIO.StringIO()
        barcodeLabels.generateLabels( outputFile, self.readBarcodeOptions( **kwargs ) )
        # print "Response headers are: %s" % cherrypy.response.headers
        cherrypy.response.headers[ "Content-Type" ] = "application/pdf"
        return outputFile.getvalue()

    barcode.exposed = True

    db = Resource()

    db.exposed = True

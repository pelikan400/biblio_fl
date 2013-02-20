import cherrypy
import os
from httpServer import barcodeLabels
from httpServer.restDatabase import RestDbPage
import StringIO 
from UserDict import DictMixin

current_dir = os.path.dirname( os.path.abspath( __file__ ) )

class RootPage( object ):
    @cherrypy.expose
    def index( self ):
        return "Hello World!"

    @cherrypy.expose
    def barcode( self, counter = "0" ) :
        options = DictMixin()
        options.description = ""
        options.labelsConcaternated = ""
        options.labelSheet = "avery4780"
        options.withBorderLines = False
        options.labelTitle = "Bibliothek KGS Forster Linde"
        options.counter = int( counter )

        outputFile = StringIO.StringIO()
        barcodeLabels.generateLabels( outputFile, options )
        # print "Response headers are: %s" % cherrypy.response.headers
        cherrypy.response.headers[ "Content-Type" ] = "application/pdf"
        return outputFile.getvalue()

    db = RestDbPage()

    # barcode._cp_config = {'response.stream': True}

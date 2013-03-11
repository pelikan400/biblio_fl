import cherrypy
import os
from httpServer import barcodeLabels
from httpServer.restDatabase import Resource
import StringIO 
from UserDict import DictMixin

current_dir = os.path.dirname( os.path.abspath( __file__ ) )

class RootApplication( object ):

    # def readBarcodeOptions( self, **kwargs ) :
    def readBarcodeOptions( self, description = "", labels = "", labelSheet = "avery4780", computeChecksum = "",
                            bearerBar = "", symbology = "Code128",
                            withBorderLines = "", labelTitle = "Bibliothek KGS Forster Linde", 
                            startCounter = "0", endCounter = "20" ) :
        options = DictMixin()
        options.description = description
        options.labelsConcaternated = labels
        options.labelSheet = labelSheet
        options.withBorderLines = bool( withBorderLines )
        options.labelTitle = labelTitle
        print "'%s' has type %s" % ( options.labelTitle, type( options.labelTitle ) )
        options.startCounter = int( startCounter )
        options.endCounter = int( endCounter )
        options.computeChecksum = bool( computeChecksum )
        options.bearerBar = bool( bearerBar )
        options.symbology = symbology
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


userpassdict = {'forsterlinde' : 'endbrinradio' }
checkpassword = cherrypy.lib.auth_basic.checkpassword_dict( userpassdict )

# basic_auth = {'tools.auth_basic.on': True,
#               'tools.auth_basic.realm': 'earth',
#               'tools.auth_basic.checkpassword': checkpassword,
# }
# app_config = { '/' : basic_auth }


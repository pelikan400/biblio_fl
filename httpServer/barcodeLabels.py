from optparse import OptionParser
from barcodeSymbologies import Barcode, BarcodeITF, Barcode39, Barcode128, BarcodeEAN
try:
   import cairo
except:
   pass

def cmToPoints( x ) :
    return x * 72 / 2.54

pageA4WidthInPoints = cmToPoints( 21.0 )
pageA4HeightInPoints = cmToPoints( 29.7 )

##############################################################################################################

class Label( object ) : 
    barWidth = 1.0 # 0.8
    barHeight = cmToPoints( 1.0 )
    withChecksum = True

    def __init__( self, cairoContext, labelSheet, options ) :
        self.options = options
        self.withBorderLines = options.withBorderLines
        self.labelTitle = options.labelTitle
        self.labelSheet = labelSheet
        self.ctx = cairoContext
        self.ctx.set_line_width( 1 )
        self.ctx.set_source_rgb( 0, 0, 0 )
        self.barcodeSymbologies = {
           u'Code128' : Barcode128( computeChecksum = options.computeChecksum ),
           u'ITF' : BarcodeITF( computeChecksum = options.computeChecksum ),
           u'Code39' : Barcode39(),
           u'EAN' : BarcodeEAN( computeChecksum = True )
        };
        if options.symbology in self.barcodeSymbologies :
           self.barcodeRenderer = self.barcodeSymbologies[ options.symbology ]
        else: 
           print "Symbology not found: %s" % options.symbology
           self.barcodeRenderer = self.barcodeSymbologies[ u"Code128" ]

    def showText( self, x, y, text, textSize = 10, align = "center" ) :
        self.ctx.set_font_size( textSize )
        txBearing, tyBearing, tWidth, tHeight, txAdvance, tyAdvance = self.ctx.text_extents( text ) 
        textX = x
        if align == "center" :
            textX = x - txAdvance / 2
        elif align == "right" :
            textX = x - txAdvance
        self.ctx.move_to( textX, y )
        self.ctx.show_text( text )
        return textX + txAdvance
    
    def drawBar( self, x, y, isBlack, width ) :
        if isBlack: 
            x1 = x + width / 2.0
            self.ctx.move_to( x1, y )
            self.ctx.line_to( x1, y + self.barHeight )
            self.ctx.set_line_width( width )
            self.ctx.stroke()
        else :
            width = width + 0.2
        return x + width, y 

    def drawSymbolEncoding( self, x, y, symbolEncoding ) :
        isBlack = True
        o0 = ord( '0' )
        for barC in symbolEncoding :
            bw = ord( barC ) - o0
            if bw == 9 :
               bw = 2.5
            barWidth = self.barWidth * bw
            x, y = self.drawBar( x, y, isBlack, barWidth )
            isBlack = not isBlack
        return x, y

    def symbolExtent( self, symbolEncoding ) :
        isBlack = True
        symbolWidth = 0
        o0 = ord( '0' )
        for barC in symbolEncoding :
            bw = ord( barC ) - o0
            if bw == 9 :
               bw = 2.5
            barWidth = self.barWidth * bw
            symbolWidth += barWidth
            if not isBlack :
                symbolWidth += 0.2
            isBlack = not isBlack
        return symbolWidth

        
    def drawBarcode( self, centerX, centerY, text, labelNote = None  ) : 
        text, encoding = self.barcodeRenderer.encode( text )
        symbolExtent = self.symbolExtent( encoding )
        startY = centerY - self.barHeight / 2
        startX = centerX - symbolExtent / 2
        self.drawSymbolEncoding( startX, startY, encoding )
        if self.options.bearerBar :
           bearerBarExtent = self.barWidth * 3
           self.ctx.set_line_width( bearerBarExtent )
           self.ctx.move_to( startX - bearerBarExtent, startY )
           self.ctx.line_to( startX + symbolExtent + bearerBarExtent, startY )
           self.ctx.move_to( startX - bearerBarExtent, startY + self.barHeight )
           self.ctx.line_to( startX + symbolExtent + bearerBarExtent, startY + self.barHeight )
           self.ctx.stroke()
           
           
           
        textY = centerY + self.barHeight / 2 + cmToPoints( 0.5 )
        textEndX = self.showText( centerX, textY, text, textSize = 12 )
        if labelNote :
            self.showText( textEndX + cmToPoints( 0.4 ), textY, labelNote, textSize = 6, align = "left" )


    def drawBorders( self, x, y ) :
        if not self.withBorderLines :
            return
        self.ctx.set_line_width( 0.1 )
        x1 = x + 0.05
        x2 = x + self.labelSheet[ "labelWidth" ] - 0.05
        y1 = y + 0.05
        y2 = y + self.labelSheet[ "labelHeight" ] - 0.05
        self.ctx.move_to( x1, y1 )
        self.ctx.line_to( x2, y1 )
        self.ctx.line_to( x2, y2 )
        self.ctx.line_to( x1, y2 )
        self.ctx.line_to( x1, y1 )
        self.ctx.close_path()
        self.ctx.stroke()


    def drawDestinationDescription( self, text ) :
        self.showText( cmToPoints( 1 ), self.labelSheet[ "offsetY" ] - 12, text, textSize = 12, align= "left" )


    def drawLabelTitle( self, centerX, y ) :
        # centerX, centerY is the center of the text, not the center of the label
        self.showText( centerX, y + cmToPoints( 0.5 ), self.labelTitle, textSize = 6 )


    def drawLabel( self, x, y, text, labelNote = None ) : 
        # x, y is the upper left corner, the axis extends to right and down 
        self.drawBorders( x, y )
        centerX = x + self.labelSheet[ "labelWidth" ] / 2
        centerY = y + self.labelSheet[ "labelHeight" ] / 2
        self.drawLabelTitle( centerX, centerY - self.barHeight - cmToPoints( 0.3 ) )
        self.drawBarcode( centerX, centerY, text, labelNote = labelNote )


    def drawPageWithLabelsList( self, destinationDescription, labels ) :
        if not labels or len( labels ) == 0 :
            return 
        labelsLength = len( labels )
        labelsCounter = 0
        while True:
           self.drawDestinationDescription( destinationDescription )
           x = self.labelSheet[ "offsetX" ]
           for itX in range( 0, self.labelSheet[ "columns" ] ) :
               y = self.labelSheet[ "offsetY" ]
               for itY in range( 0, self.labelSheet[ "rows" ] ) :
                   label = labels[ labelsCounter ]
                   labelSplit = label.split( "*" )
                   labelText = labelSplit[ 0 ]
                   labelNote = ""
                   if len( labelSplit ) > 1 : 
                       labelNote = labelSplit[ 1 ]
                   # print "drawLabel '%s': %7.2f, %7.2f" % ( labelText, x ,y )
                   self.drawLabel( x, y, labelText, labelNote ) 
                   labelsCounter += 1
                   self.ctx.stroke()
                   if labelsCounter >= labelsLength : 
                       return
                   y += self.labelSheet[ "labelHeight" ] + self.labelSheet[ "interLabelY" ]
               x += self.labelSheet[ "labelWidth" ] + self.labelSheet[ "interLabelX" ]
           self.ctx.show_page()


    def drawPageWithCounter( self, destinationDescription, startCounter = 0, endCounter = 20 ) :
        if startCounter < 0 :
           startCounter = 0
        if endCounter < 0 :
           endCounter = startCounter + 2
        if endCounter - startCounter > 200 : 
           endCounter = startCounter + 200
        while True:
           self.drawDestinationDescription( destinationDescription )
           x = self.labelSheet[ "offsetX" ]
           for itX in range( 0, self.labelSheet[ "columns" ] ) :
              y = self.labelSheet[ "offsetY" ] 
              for itY in range( 0, self.labelSheet[ "rows" ] ) :
                   labelText = "%s" % startCounter
                   # print "drawLabel '%s': %7.2f, %7.2f" % ( labelText, x ,y )
                   self.drawLabel( x, y, labelText ) 
                   self.ctx.stroke()
                   startCounter += 1
                   if startCounter >= endCounter : 
                      return
                   y += self.labelSheet[ "labelHeight" ] + self.labelSheet[ "interLabelY" ]
              x += self.labelSheet[ "labelWidth" ] + self.labelSheet[ "interLabelX" ]
           self.ctx.show_page()


    def drawPage( self ):
        labelsTextList = None
        if self.options.labelsConcaternated :
            labelsTextList = self.options.labelsConcaternated.split( "," )
            # print "size of labelsTextList: %s" % len( labelsTextList )

        if labelsTextList and len( labelsTextList ) != 0 :
            self.drawPageWithLabelsList( self.options.description, labelsTextList )
        else:
            self.drawPageWithCounter( self.options.description, self.options.startCounter, self.options.endCounter )

##############################################################################################################

labelSheetDefinitions = {
   "test" : {
       "name" : "Test48.5 x 25.4 40 Labels",
       "labelWidth" : cmToPoints( 4.85 ),
       "labelHeight" : cmToPoints( 2.54 ),
       "interLabelX" : cmToPoints( 0.00 ),
       "interLabelY" : cmToPoints( 0.00 ),
       "offsetX" : cmToPoints( 0.80 ),
       "offsetY" : cmToPoints( 2.15 ),
       "rows" : 1,
       "columns" : 1
   },
   
   "avery8160" : {
       "name" : "Avery 8160 63.5 x 38.1 21 Labels",
       "labelWidth" : cmToPoints( 6.35 ),
       "labelHeight" : cmToPoints( 3.81 ),
       "interLabelX" : cmToPoints( 0.25 ),
       "interLabelY" : cmToPoints( 0.00 ),
       "offsetX" : cmToPoints( 0.70 ),
       "offsetY" : cmToPoints( 1.55 ),
       "rows" : 7,
       "columns" : 3
   },
   
   "avery4780" : {
       "name" : "Avery 4780 48.5 x 25.4 40 Labels",
       "labelWidth" : cmToPoints( 4.85 ),
       "labelHeight" : cmToPoints( 2.54 ),
       "interLabelX" : cmToPoints( 0.0 ),
       "interLabelY" : cmToPoints( 0.0 ),
       "offsetX" : cmToPoints( 0.8 ),
       "offsetY" : cmToPoints( 2.15 ),
       "rows" : 10,
       "columns" : 4
   },
   
   "avery3490" : {
       "name" : "Avery 3490 70.0 x 36.0 24 Labels",
       "labelWidth" : cmToPoints( 7.00 ),
       "labelHeight" : cmToPoints( 3.60 ),
       "interLabelX" : cmToPoints( 0 ),
       "interLabelY" : cmToPoints( 0 ),
       "offsetX" : cmToPoints( 0.0 ),
       "offsetY" : cmToPoints( 0.4 ),
       "rows" : 8,
       "columns" : 3
   }
}

##############################################################################################################

def parseCommandLineOptions() :
    parser = OptionParser()
    parser.add_option( "--fileName", dest="fileName", type = "string", default = "barcode.pdf" )
    parser.add_option( "--description", dest="description", type = "string", default = "" )
    parser.add_option( "--labels", dest="labelsConcaternated", type="string", default = "" )
    parser.add_option( "--labelSheet", dest="labelSheet", type="string", default = "avery4780" )
    parser.add_option( "--labelTitle", dest="labelTitle", type="string", default = "Bibliothek KGS Forster Linde" )
    parser.add_option( "--symbology", dest="symbology", type = "string", default = "Code128" )
    parser.add_option( "--withBorderLines", dest="withBorderLines", action="store_true", default = False )
    parser.add_option( "--startCounter", dest="startCounter", type="int", default = 0 )
    parser.add_option( "--endCounter", dest="endCounter", type="int", default = 0 )
    parser.add_option( "--computeChecksum", dest="computeChecksum", action="store_false", default = True )
    parser.add_option( "--bearerBar", dest="bearerBar", action="store_true", default = False )
    return parser.parse_args()

def generateLabels( destinationFile, options ) :
    labelSheetName = options.labelSheet
    labelSheet = None 
    if labelSheetName in labelSheetDefinitions : 
        labelSheet = labelSheetDefinitions[ labelSheetName ]
        pdfSurface = cairo.PDFSurface( destinationFile, pageA4WidthInPoints, pageA4HeightInPoints )
        cairoContext = cairo.Context( pdfSurface )
        label = Label( cairoContext, labelSheet, options )
        label.drawPage()
        pdfSurface.finish()


def main() :
    options, args = parseCommandLineOptions()
    destinationFile = open( options.fileName, "w" )
    generateLabels( destinationFile, options )
    destinationFile.close()


if __name__ == "__main__" :
    main()

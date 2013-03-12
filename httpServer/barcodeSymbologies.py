from optparse import OptionParser
try:
   import cairo
except:
   pass

def cmToPoints( x ) :
    return x * 72 / 2.54

pageA4WidthInPoints = cmToPoints( 21.0 )
pageA4HeightInPoints = cmToPoints( 29.7 )

##############################################################################################################

class Barcode( object ) :
    def __init__( self, computeChecksum = True ) :
       self.computeChecksum = computeChecksum
       pass

    def insertSpacesIntoText( self, text, distance = 2 ) :
        textWithSpace = ""
        textLength = len( text )
        i = 0 
        j = ( distance - ( textLength % distance ) ) % distance
        while i < textLength :
            if j != 0 and j % distance == 0 : 
                textWithSpace += " "
            textWithSpace += text[ i ]
            i += 1
            j += 1
        # print "spaces into text: '%s'" % textWithSpace 
        return textWithSpace

    def computeEanChecksum( self, text ) :
        weights = [ 1, 3 ]
        lenText = len( text )
        checksum = 0
        i = lenText % 2
        for c in text :
            x = self.numberFromDigitCharacter( c )
            checksum += x * weights[ i % 2 ]
            i += 1
        checksum = ( 10 - ( checksum % 10 ) ) % 10
        return checksum

    def numberFromDigitCharacter( self, c ):
        x = ord(c ) - ord( "0" )
        if x < 0 or x > 9 :
            x = 0
        return x

    def paddWithZeroAndComputeChecksum( self, text, minimumPadding = 4 ) :
        if self.computeChecksum : 
           newText = text.zfill( minimumPadding - 1 )
           newText += "%s" % self.computeEanChecksum( newText )
        else : 
           newText = text.zfill( minimumPadding )
        return newText

        
##############################################################################################################

class BarcodeEAN( Barcode ) :
    encodingList = [
        [
            "3211",
            "2221",
            "2122",
            "1411",
            "1132",
            "1231",
            "1114",
            "1312",
            "1213",
            "3112"
        ],
        [
            "1123",
            "1222",
            "2212",
            "1141",
            "2311",
            "1321",
            "4111",
            "2131",
            "3121",
            "2113"
        ]
    ]

    firstDigitEncodingList = [
        "000000",
        "001011",
        "001101",
        "001110",
        "010011",
        "011001",
        "011100",
        "010101",
        "010110",
        "011010"
    ]

    startPattern = "111"
    middlePattern = "11111"

    def __init__( self, computeChecksum = False ) :
       Barcode.__init__( self, computeChecksum = computeChecksum )

    def internalEncoding( self, inputText ) :
        inputTextLength = len( inputText )
        i = 0
        firstDigit = 0
        inputTextLengthHalf = inputTextLength / 2
        if inputTextLength == 13 :
            firstDigit = self.numberFromDigitCharacter( inputText[ i ] )
            i += 1 
            inputTextLengthHalf += 1
        firstDigitEncoding = self.firstDigitEncodingList[ firstDigit ]
        j = 0
        symbols = ""
        symbols += self.startPattern
        while i < inputTextLengthHalf :
            c = self.numberFromDigitCharacter( inputText[ i ] )
            x = self.numberFromDigitCharacter( firstDigitEncoding[ j ] )
            symbols += self.encodingList[ x ][ c ]
            i += 1
            j += 1
        symbols += self.middlePattern
        while i < inputTextLength :
            c = self.numberFromDigitCharacter( inputText[ i ] )
            symbols += self.encodingList[ 0 ][ c ]
            i += 1
        symbols += self.startPattern
        return symbols

    def paddWithZeroAndComputeChecksum1( self, text ) :
        lenText = len( text )
        newText = ""
        if lenText <= 7 :
            for i in range( 0, 7 - lenText ) :
                newText += "0" 
            newText += text
            newText += "%s" % self.computeEanChecksum( newText )
        elif lenText <= 12 :
            for i in range( 0, 12 - lenText ) :
                newText += "0" 
            newText += text
            newText += "%s" % self.computeEanChecksum( newText )
        else:
            raise Exception( "Can not represent '%s' as EAN Barcode" % text )
        return newText

    def encode( self, text ) :
        # the text has to contain only digits 
        if len( text ) < 8:
            text = self.paddWithZeroAndComputeChecksum( text, minimumPadding = 8 )
        else :
            text = self.paddWithZeroAndComputeChecksum( text, minimumPadding = 13 )
        return self.insertSpacesIntoText( text ), self.internalEncoding( text )

##############################################################################################################

class BarcodeITF( Barcode ) :
    encodingList = [
        "11991",
        "91119",
        "19119",
        "99111",
        "11919",
        "91911",
        "19911",
        "11199",
        "91191",
        "19191",
        "1111", # start
        "911"  # stop
    ]

    def __init__( self, computeChecksum = False ) :
       Barcode.__init__( self, computeChecksum = computeChecksum )

    def encodeSymbolPair( self, c1, c2 ) :
        symbolEncoding1 = self.encodingList[ c1 ]
        symbolEncoding2 = self.encodingList[ c2 ]
        # print "c: %s %s" % ( c, symbolEncoding )
        symbolEncodingLength = len( symbolEncoding1 )
        symbolEncoding = ""
        i = 0
        while i < symbolEncodingLength :
            symbolEncoding += symbolEncoding1[ i ] + symbolEncoding2[ i ] 
            i += 1
        return symbolEncoding 

    def internalEncode( self, symbols ) :
        encoding = ""
        encoding +=  self.encodingList[ 10 ]  # start 
        i = 0
        symbolsLength = len( symbols )
        while i < symbolsLength :
            c1 = symbols[ i ]
            i += 1
            c2 = symbols[ i ]
            i += 1
            encoding += self.encodeSymbolPair( c1, c2 )
        encoding += self.encodingList[ 11 ] # stop
        return encoding

    def partitionBase10( self, inputText, withChecksum = False ) :
        symbols = []
        text = ""
        checksum = 0
        inputTextEven = ( len( inputText ) % 2 == 0 )
        if ( withChecksum and inputTextEven ) or ( not withChecksum and not inputTextEven ) :
            inputText = "0" + inputText
        ord0 = ord( "0" )
        i = 0
        for c in inputText :
            x = ord( c ) - ord0
            if x < 0 or x > 9 : 
                x = 0
                c = "0"
            text += c 
            symbols.append( x )
            if i % 2 == 0 :
                checksum += 3 * x
            else:
                checksum += 1 * x
            i += 1
        checksum = ( 10 - ( checksum % 10 ) ) % 10
        if withChecksum : 
            text += "%s" % checksum
            symbols.append( checksum )
        return self.insertSpacesIntoText( text ), symbols

    def encode( self, inputText ) :
        # replace all non number symbols with 0 padd left if necessary and compute checksum
        text = self.paddWithZeroAndComputeChecksum( inputText, minimumPadding = 6 )
        text, symbols = self.partitionBase10( text )
        return text, self.internalEncode( symbols )


##############################################################################################################

class Barcode128( Barcode ) :
    encodingList = [
        "212222",
        "222122",
        "222221",
        "121223",
        "121322",
        "131222",
        "122213",
        "122312",
        "132212",
        "221213",
        "221312",
        "231212",
        "112232",
        "122132",
        "122231",
        "113222",
        "123122",
        "123221",
        "223211",
        "221132",
        "221231",
        "213212",
        "223112",
        "312131",
        "311222",
        "321122",
        "321221",
        "312212",
        "322112",
        "322211",
        "212123",
        "212321",
        "232121",
        "111323",
        "131123",
        "131321",
        "112313",
        "132113",
        "132311",
        "211313",
        "231113",
        "231311",
        "112133",
        "112331",
        "132131",
        "113123",
        "113321",
        "133121",
        "313121",
        "211331",
        "231131",
        "213113",
        "213311",
        "213131",
        "311123",
        "311321",
        "331121",
        "312113",
        "312311",
        "332111",
        "314111",
        "221411",
        "431111",
        "111224",
        "111422",
        "121124",
        "121421",
        "141122",
        "141221",
        "112214",
        "112412",
        "122114",
        "122411",
        "142112",
        "142211",
        "241211",
        "221114",
        "413111",
        "241112",
        "134111",
        "111242",
        "121142",
        "121241",
        "114212",
        "124112",
        "124211",
        "411212",
        "421112",
        "421211",
        "212141",
        "214121",
        "412121",
        "111143",
        "111341",
        "131141",
        "114113",
        "114311",
        "411113",
        "411311",
        "113141",
        "114131",
        "311141",
        "411131",
        "211412",
        "211214",
        "211232", # das ist das Startzeichen
        "2331112" # Stopzeichen
    ]

    def __init__( self, computeChecksum = False ) :
       Barcode.__init__( self, computeChecksum = computeChecksum )

    def internalEncode( self, symbols, startSymbol = 105 ) :
        moduloSum = 0
        encoding = ""
        encoding += self.encodingList[ startSymbol ] 
        moduloSum += startSymbol
        positionCounter = 1
        for c in symbols : 
            moduloSum += c * positionCounter
            positionCounter += 1
            encoding += self.encodingList[ c ] 
        checkSum = moduloSum % 103
        encoding += self.encodingList[ checkSum ] 
        encoding += self.encodingList[ 106 ] 
        return encoding


    def convertInputNumbersToSymbols( self, inputText ) :
        if len( inputText ) % 2 == 1:
            inputText = "0" + inputText
        symbols = []
        inputTextLength = len( inputText )
        i = 0
        ord0 = ord( "0" )
        while i < inputTextLength :
            x1 = ord( inputText[ i ] ) - ord0
            i += 1
            x2 = ord( inputText[ i ] ) - ord0
            i += 1
            x = x1 * 10 + x2
            symbols.append( x )
        return self.insertSpacesIntoText( inputText ), symbols

    def convertInputTextToSymbols( self, inputText ) :
        symbols = []
        for c in inputText :
            ordC = ord( c )
            if ordC >= 32 and ordC <=126 : 
                symbols.append( ordC - 32 )
        return self.insertSpacesIntoText( inputText ), symbols
                
    def checkIfOnlyNumbers( self, inputText ) :
        ord0 = ord( "0" )
        for c in inputText :
            x = ord( c ) - ord0
            if x < 0 or x > 9 :
                return False
        return True

    def encode( self, inputText ) :
        if self.checkIfOnlyNumbers( inputText ) :
            # text = inputText
            text = self.paddWithZeroAndComputeChecksum( inputText, minimumPadding = 4 )
            text, symbols = self.convertInputNumbersToSymbols( text )
            return text, self.internalEncode( symbols, 105 )
        else:
            text, symbols = self.convertInputTextToSymbols( inputText )
            return text, self.internalEncode( symbols, 104 )


##############################################################################################################

class Barcode39( Barcode ) :
    encodingMap = {
        "0" :  "1112212111",
        "1" :  "2112111121",
        "2" :  "1122111121",
        "3" :  "2122111111",
        "4" :  "1112211121",
        "5" :  "2112211111",
        "6" :  "1122211111",
        "7" :  "1112112121",
        "8" :  "2112112111",
        "9" :  "1122112111",
        "A" :  "2111121121",
        "B" :  "1121121121",
        "C" :  "2121121111",
        "D" :  "1111221121",
        "E" :  "2111221111",
        "F" :  "1121221111",
        "G" :  "1111122121",
        "H" :  "2111122111",
        "I" :  "1121122111",
        "J" :  "1111222111",
        "K" :  "2111111221",
        "L" :  "1121111221",
        "M" :  "2121111211",
        "N" :  "1111211221",
        "O" :  "2111211211",
        "P" :  "1121211211",
        "Q" :  "1111112221",
        "R" :  "2111112211",
        "S" :  "1121112211",
        "T" :  "1111212211",
        "U" :  "2211111121",
        "V" :  "1221111121",
        "W" :  "2221111111",
        "X" :  "1211211121",
        "Y" :  "2211211111",
        "Z" :  "1221211111",
        "-" :  "1211112121",
        "." :  "2211112111",
        " " :  "1221112111",
        "$" :  "1212121111",
        "/" :  "1212111211",
        "+" :  "1211121211",
        "%" :  "1112121211",
        "*" :  "1211212111" }
    
    def __init__( self ) : 
        Barcode.__init__( self )


    def internalEncode( self, text ) :
        encoding = ""
        for c in text : 
            encoding += self.encodingMap[ c ]
        return encoding

    def encode( self, text ) :
        text = self.paddWithZeroAndComputeChecksum( text, minimumPadding = 4 )
        return text, self.internalEncode( "*%s*" % text )





class BarcodeSymbology( object ):
   def __init__( self, minBarLength, maxBarLength, symbolSize, numberOfBars, testEvenSum = False ) :
      self.minBarLength = minBarLength
      self.maxBarLength = maxBarLength 
      self.symbolSize = symbolSize
      self.testEvenSum = testEvenSum
      self.numberOfBars = numberOfBars
      self.counter = 0


   def sumBars( self, bars ) :
      sum = 0
      i = 0
      for bar in bars :
         if i % 2 == 0 :
            sum += bar
         i += 1
      return sum 

   def testEven( self, bars ) :
      if self.sumBars( bars ) % 2 == 0 :
         # print bars
         return True
      return False
      
   def testPDF417( self, bars ) :
      m = ( ( bars[ 0 ] + bars[ 4 ] ) - ( bars[ 2 ] + bars[ 6 ] ) + 9 ) % 9 
      # if m == 0 or m == 3 or m == 6:
      if m == 6 :
         print bars
         return True
      else :
         return False

   def testBars( self, bars ) :
      return self.testEven( bars )
      # return self.testPDF417( bars ) 

   def compute( self ) :
      self.counter = 0
      bars = [0] * self.numberOfBars
      self.computeRecursive( bars, 0, 0 )
      return self.counter

   def computeRecursive( self, bars, position, symbolSize ) :
      if position == self.numberOfBars - 1 :
         x = self.symbolSize - symbolSize
         bars[ position ] = x
         if self.testBars( bars ) :
            self.counter += 1
      else :
         for x in range( self.minBarLength, self.maxBarLength + 1 ):
            bars[ position ] = x
            if symbolSize + x >= self.symbolSize :
               return 
            else :
               self.computeRecursive( bars, position + 1, symbolSize + x )  


symbology = BarcodeSymbology( 1, 8, 16, 8 )
print( "RSS ( 1, 8, 16, 8 ) %s" % symbology.compute() )

symbology = BarcodeSymbology( 1, 8, 15, 8 )
print( "RSS ( 1, 8, 16, 8 ) %s" % symbology.compute() )

symbology = BarcodeSymbology( 1, 4, 11, 6 )
print( "Code128 ( 1, 4, 11, 6 ) %s" % symbology.compute() )

# symbology = BarcodeSymbology( 1, 8, 12, 8 )
# print( "barLength( 1, 8, 12, 4 ) %s" % symbology.compute() )
# 
# symbology = BarcodeSymbology( 1, 6, 17, 8 )
# print( "barLength( 1, 6, 17, 8 ) %s" % symbology.compute() )


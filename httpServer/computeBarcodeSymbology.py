
counter = 0

def barLength( minLen, maxLen, actualSymbolSize, totalSymbolSize, depth ):
   global counter
   if depth == 1 :
      bar = totalSymbolSize - actualSymbolSize
      if bar <= maxLen :
         counter += 1
   else :
      for x in range( minLen, maxLen + 1 ):
         newSymbolSize = actualSymbolSize + x
         if newSymbolSize < totalSymbolSize :
            barLength(minLen, maxLen, newSymbolSize, totalSymbolSize, depth - 1 )  
            
counter = 0
barLength( 1, 8, 0, 12, 4 )
print( "barLength( 1, 8, 0, 12, 4 ) %s" % counter )

counter = 0
barLength( 1, 6, 0, 10, 4 )
print( "barLength( 1, 6, 0, 10, 4 ) %s" % counter )

counter = 0
barLength( 1, 8, 0, 12, 4 )
print( "barLength( 1, 8, 0, 12, 4 ) %s" % counter )

counter = 0
barLength( 1, 3, 0, 6, 4 )
print( "barLength( 1, 3, 0, 6, 4 ) %s" % counter )


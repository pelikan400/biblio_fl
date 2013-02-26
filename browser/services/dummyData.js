"use strict";
   
define( function() {
   var customers = [
      {
         "firstName" : "Firas",
         "lastName" : "Ouni",
         "barcode" : "1006",
         "type" : "PUPIL"
      },
      {
         "firstName" : "Mariä",
         "lastName" : "Calläs",
         "barcode" : "1005",
         "type" : "PUPIL"
      },
      {
         "firstName" : "Juli",
         "lastName" : "Zeh",
         "barcode" : "1004",
         "type" : "PUPIL"
      }
   ];
   
 var books = [
{"publisher": "List", "title": "Artemis Fowl - Bd.2-Die Verschwörung", "author": "Colfer, Eoin", "barcode": "100458", "signature": "FA-Col"} ,
{"publisher": "Thienemann", "title": "Jim Knopf und Lukas der Lokomotivführer", "author": "Ende, Michael", "barcode": "100496", "signature": "FA-End"} ,
{"publisher": "Thienemann", "title": "Die unendliche Geschichte", "author": "Ende, Michael", "barcode": "100502", "signature": "FA-End"} ,
{"publisher": "C. Bange", "title": "Draußen vor der Tür und ausgewählte Kurzgeschichten, Erläuterungen", "author": "Borchert, Wolfgang", "barcode": "122290", "signature": "D - Bor"}
];
   
   
   return {
      customers : customers,
      books : books
   };
} );


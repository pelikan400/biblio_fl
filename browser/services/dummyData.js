"use strict";

define( function() {
   var customers = [ {
      "firstName" : "Firas",
      "lastName" : "Ouni",
      "barcode" : "1006",
      "type" : "PUPIL"
   }, {
      "firstName" : "Mariä",
      "lastName" : "Calläs",
      "barcode" : "1005",
      "type" : "PUPIL"
   }, {
      "firstName" : "Juli",
      "lastName" : "Zeh",
      "barcode" : "1004",
      "type" : "PUPIL"
   } ];

   var books = [ {
      "donationCertificate" : "",
      "publisher" : "Xenos",
      "barcode" : "100403",
      "isbn" : "4-007204-840131",
      "author" : "Madee, Barbara",
      "antolin" : "",
      "title" : "Das große Bibi-Blocksberg Buch",
      "tags" : "Hexen / Zauberer",
      "donation" : "",
      "signature" : "A 001"
   }, {
      "donationCertificate" : "",
      "publisher" : "Oetinger",
      "barcode" : "100410",
      "isbn" : "3-7891-1954-7",
      "author" : "Maar, Paul",
      "antolin" : "ab Kl. 4",
      "title" : "Am Samstag kam das Sams zurück",
      "tags" : "Sams",
      "donation" : "",
      "signature" : "A 002"
   }, {
      "donationCertificate" : "",
      "publisher" : "Meyer",
      "barcode" : "100427",
      "isbn" : "",
      "author" : "Naoura,Salah",
      "antolin" : "",
      "title" : "Die Geschichte einer Stadt",
      "tags" : "Städte",
      "donation" : "",
      "signature" : "A 003"
   }, {
      "donationCertificate" : "",
      "publisher" : "Herold",
      "barcode" : "100434",
      "isbn" : "3-7767-0412-8",
      "author" : "Kaut, Ellis ",
      "antolin" : "",
      "title" : "Pumukel auf heißer Spur",
      "tags" : "",
      "donation" : "",
      "signature" : "A 004"
   }, {
      "donationCertificate" : "",
      "publisher" : "Karussel",
      "barcode" : "100441",
      "isbn" : "",
      "author" : "Blyton, Enid",
      "antolin" : "ab Kl. 5",
      "title" : "Abenteuer",
      "tags" : "Krimi",
      "donation" : "",
      "signature" : "A 005"
   }, ];

   return {
      customers : customers,
      books : books
   };
} );

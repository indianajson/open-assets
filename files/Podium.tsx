<?xml version="1.0" encoding="UTF-8"?>
<tileset version="1.10" tiledversion="1.11.1" name="Podium" tilewidth="32" tileheight="72" tilecount="8" columns="4">
 <tileoffset x="0" y="8"/>
 <image source="Podium.png" width="128" height="144"/>
 <tile id="0">
  <objectgroup draworder="index" id="2">
   <object id="1" x="16" y="72">
    <polygon points="0,0 -16,-8 0,-16 16,-8"/>
   </object>
  </objectgroup>
 </tile>
 <tile id="1">
  <objectgroup draworder="index" id="2">
   <object id="1" x="17" y="63">
    <polygon points="-1,9 -17,1 -1,-7 15,1"/>
   </object>
  </objectgroup>
  <animation>
   <frame tileid="1" duration="200"/>
   <frame tileid="2" duration="200"/>
   <frame tileid="3" duration="200"/>
   <frame tileid="2" duration="200"/>
  </animation>
 </tile>
 <tile id="4">
  <objectgroup draworder="index" id="2">
   <object id="1" x="16" y="72">
    <polygon points="0,0 -16,-8 0,-16 16,-8"/>
   </object>
  </objectgroup>
  <animation>
   <frame tileid="4" duration="200"/>
   <frame tileid="5" duration="200"/>
   <frame tileid="6" duration="200"/>
   <frame tileid="5" duration="200"/>
  </animation>
 </tile>
</tileset>

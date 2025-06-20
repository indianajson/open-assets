<?xml version="1.0" encoding="UTF-8"?>
<tileset version="1.10" tiledversion="1.11.2" name="ServerWarp" tilewidth="58" tileheight="30" tilecount="10" columns="5" objectalignment="top">
 <tileoffset x="0" y="2"/>
 <image source="ServerWarp.png" trans="ffffff" width="290" height="60"/>
 <tile id="0">
  <animation>
   <frame tileid="0" duration="150"/>
   <frame tileid="1" duration="150"/>
   <frame tileid="2" duration="150"/>
   <frame tileid="3" duration="150"/>
   <frame tileid="4" duration="150"/>
  </animation>
 </tile>
 <tile id="5">
  <objectgroup draworder="index" id="2">
   <object id="3" x="29" y="5">
    <polygon points="0,0 15,7 15,11 0,18 -15,11 -15,7"/>
   </object>
  </objectgroup>
  <animation>
   <frame tileid="5" duration="150"/>
   <frame tileid="6" duration="150"/>
   <frame tileid="7" duration="150"/>
   <frame tileid="8" duration="150"/>
   <frame tileid="9" duration="150"/>
  </animation>
 </tile>
</tileset>

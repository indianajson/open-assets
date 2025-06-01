<?xml version="1.0" encoding="UTF-8"?>
<tileset version="1.8" tiledversion="1.8.2" name="obstacle bandages" tilewidth="64" tileheight="128" tilecount="4" columns="4">
 <tileoffset x="0" y="16"/>
 <image source="obstacle_bandages.png" width="256" height="128"/>
 <tile id="0">
  <objectgroup draworder="index" id="2">
   <object id="1" x="32" y="128">
    <polygon points="0,0 32,-16 0,-32 -32,-16"/>
   </object>
  </objectgroup>
  <animation>
   <frame tileid="0" duration="50"/>
   <frame tileid="3" duration="25"/>
   <frame tileid="1" duration="50"/>
   <frame tileid="3" duration="25"/>
   <frame tileid="0" duration="50"/>
   <frame tileid="3" duration="25"/>
   <frame tileid="2" duration="50"/>
   <frame tileid="3" duration="25"/>
  </animation>
 </tile>
</tileset>

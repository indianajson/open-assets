<?xml version="1.0" encoding="UTF-8"?>
<tileset version="1.8" tiledversion="1.11.2" name="pumpkin data" tilewidth="26" tileheight="57" tilecount="8" columns="8" objectalignment="bottom">
 <properties>
  <property name="Solid" type="bool" value="true"/>
 </properties>
 <image source="pumpkindata.png" width="208" height="57"/>
 <tile id="0">
  <properties>
   <property name="Solid" type="bool" value="true"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" x="4" y="51" width="18" height="6">
    <ellipse/>
   </object>
  </objectgroup>
  <animation>
   <frame tileid="0" duration="100"/>
   <frame tileid="1" duration="100"/>
   <frame tileid="2" duration="100"/>
   <frame tileid="3" duration="100"/>
   <frame tileid="4" duration="100"/>
   <frame tileid="5" duration="100"/>
   <frame tileid="6" duration="100"/>
   <frame tileid="7" duration="100"/>
  </animation>
 </tile>
</tileset>

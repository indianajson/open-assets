<?xml version="1.0" encoding="UTF-8"?>
<tileset version="1.5" tiledversion="1.7.1" name="simple-graveyard-conveyers-64-40-alt" tilewidth="64" tileheight="40" tilecount="12" columns="4">
 <image source="simple-graveyard-conveyers-64-40-alt.png" width="256" height="120"/>
 <tile id="0" type="Conveyor">
  <properties>
   <property name="Direction" value="Up Left"/>
   <property name="Sound Effect" value="/server/assets/sfx/dir_tile.ogg"/>
   <property name="Speed" type="int" value="6"/>
  </properties>
  <animation>
   <frame tileid="0" duration="100"/>
   <frame tileid="4" duration="100"/>
   <frame tileid="8" duration="100"/>
  </animation>
 </tile>
 <tile id="1" type="Conveyor">
  <properties>
   <property name="Direction" value="Down Left"/>
   <property name="Sound Effect" value="/server/assets/sfx/dir_tile.ogg"/>
   <property name="Speed" type="int" value="6"/>
  </properties>
  <animation>
   <frame tileid="1" duration="100"/>
   <frame tileid="5" duration="100"/>
   <frame tileid="9" duration="100"/>
  </animation>
 </tile>
 <tile id="2">
  <animation>
   <frame tileid="2" duration="100"/>
   <frame tileid="6" duration="100"/>
   <frame tileid="10" duration="100"/>
  </animation>
 </tile>
 <tile id="3">
  <animation>
   <frame tileid="3" duration="100"/>
   <frame tileid="7" duration="100"/>
   <frame tileid="11" duration="100"/>
  </animation>
 </tile>
</tileset>

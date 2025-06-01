<?xml version="1.0" encoding="UTF-8"?>
<tileset version="1.8" tiledversion="1.8.5" name="BN4 MeteorComp" tilewidth="96" tileheight="48" tilecount="48" columns="4" objectalignment="bottom">
 <tileoffset x="-16" y="8"/>
 <image source="BN4_MeteorComp.png" width="384" height="576"/>
 <tile id="8" type="Conveyor">
  <properties>
   <property name="Direction" value="Up Left"/>
   <property name="Sound Effect" value="/server/assets/dir_tile.ogg"/>
   <property name="Speed" value="6"/>
  </properties>
  <animation>
   <frame tileid="32" duration="150"/>
   <frame tileid="33" duration="150"/>
   <frame tileid="36" duration="150"/>
   <frame tileid="37" duration="150"/>
  </animation>
 </tile>
 <tile id="10" type="Conveyor">
  <properties>
   <property name="Direction" value="Up Left"/>
   <property name="Sound Effect" value="/server/assets/dir_tile.ogg"/>
   <property name="Speed" value="6"/>
  </properties>
  <animation>
   <frame tileid="34" duration="150"/>
   <frame tileid="35" duration="150"/>
   <frame tileid="38" duration="150"/>
   <frame tileid="39" duration="150"/>
  </animation>
 </tile>
 <tile id="12" type="Conveyor">
  <properties>
   <property name="Direction" value="Down Right"/>
   <property name="Sound Effect" value="/server/assets/dir_tile.ogg"/>
   <property name="Speed" value="6"/>
  </properties>
  <animation>
   <frame tileid="40" duration="150"/>
   <frame tileid="41" duration="150"/>
   <frame tileid="44" duration="150"/>
   <frame tileid="45" duration="150"/>
  </animation>
 </tile>
 <tile id="14" type="Conveyor">
  <properties>
   <property name="Direction" value="Down Right"/>
   <property name="Sound Effect" value="/server/assets/dir_tile.ogg"/>
   <property name="Speed" value="6"/>
  </properties>
  <animation>
   <frame tileid="42" duration="150"/>
   <frame tileid="43" duration="150"/>
   <frame tileid="46" duration="150"/>
   <frame tileid="47" duration="150"/>
  </animation>
 </tile>
</tileset>

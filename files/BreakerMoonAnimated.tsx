<?xml version="1.0" encoding="UTF-8"?>
<tileset version="1.5" tiledversion="1.7.0" name="BreakerMoonAnimated" tilewidth="67" tileheight="57" tilecount="18" columns="6">
 <tileoffset x="-1" y="24"/>
 <image source="BreakerMoonAnimated.png" width="402" height="171"/>
 <tile id="0">
  <animation>
   <frame tileid="0" duration="150"/>
   <frame tileid="1" duration="150"/>
   <frame tileid="2" duration="150"/>
   <frame tileid="1" duration="150"/>
   <frame tileid="0" duration="150"/>
  </animation>
 </tile>
 <tile id="6" type="Conveyor">
  <properties>
   <property name="Direction" value="Up Right"/>
   <property name="Sound Effect" value="/server/assets/dir_tile.ogg"/>
   <property name="Speed" value="6"/>
  </properties>
  <animation>
   <frame tileid="6" duration="250"/>
   <frame tileid="7" duration="250"/>
   <frame tileid="8" duration="250"/>
  </animation>
 </tile>
 <tile id="12" type="Conveyor">
  <properties>
   <property name="Direction" value="Down Right"/>
   <property name="Sound Effect" value="/server/assets/dir_tile.ogg"/>
   <property name="Speed" value="6"/>
  </properties>
  <animation>
   <frame tileid="12" duration="250"/>
   <frame tileid="13" duration="250"/>
   <frame tileid="14" duration="250"/>
  </animation>
 </tile>
</tileset>

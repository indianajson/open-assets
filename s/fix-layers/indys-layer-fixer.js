
/* -------------------------------------------- *\
   Indy's Layer Fixer - Tiled Extension for ONB
   indianajson.github.io/open-assets/fix-layers
/* -------------------------------------------- */

function fixLayers() {
    
    // Ensure a map is open
    var map = tiled.activeAsset;
    if ((!map || !map.isTileMap)) {
        tiled.alert("Please open a Tiled map to use this action.");
        return;
    }

    objectI = 0
    tileI = 0
    for (let i in map.layers) {
        if (map.layers[i].isObjectLayer == true){
            map.layers[i].name = "Object Layer "+objectI
            offset = objectI * -16
            map.layers[i].offset.y = offset
            objectI = objectI + 1
        }
        if (map.layers[i].isTileLayer == true){
            map.layers[i].name = "Tile Layer "+tileI
            tileI = tileI + 1
            offset = objectI * -16
            map.layers[i].offset.y = offset
        }
    }
}

// Register the action and add it to the "New" menu
var action = tiled.registerAction("fixLayers", fixLayers);
action.shortcut = "Ctrl+P";
action.text = "Fix Layers for ONB ";
tiled.extendMenu("Edit", [{ action: "fixLayers", before:"AutoFill" }]);
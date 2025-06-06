let allBackgrounds = [
    {"name":"Sal's PC Comp","velx":"0.35","vely":"0.20","files":["papapc.animation","papapc.png"],"author":"K1rbYat1Na","credit":false,"game":"EXE1/BN1","preview":"papapc.animation"},
    {"name":"Clockman's Area","velx":"0.20","vely":"0.10","files":["clockman.animation","clockman.png"],"author":"K1rbYat1Na","credit":false,"game":"EXE1/BN1","preview":"clockman.animation"},
    {"name":"Dex's PC","velx":"0.10","vely":"0.05","files":["dex-pc.animation","dex-pc.png"],"author":"K1rbYat1Na","credit":false,"game":"EXE1/BN1","preview":"dex-pc.animation"},
    {"name":"Dex's PC (Battle)","velx":"0.10","vely":"0.05","files":["dex-pc-battle.animation","dex-pc-battle.png"],"author":"K1rbYat1Na","credit":false,"game":"EXE1/BN1","preview":"dex-pc-battle.animation"},
    {"name":"School Comp","velx":"0","vely":"0","files":["school-comp.png","school-comp.animation"],"author":"K1rbYat1Na","credit":false,"game":"EXE1/BN1","preview":"school-comp.animation"},   
    {"name":"Internet","velx":"0.35","vely":"0.20","files":["internet.png","internet.animation"],"author":"K1rbYat1Na","credit":false,"game":"EXE1/BN1","preview":"internet.animation"},
    {"name":"Power Plant (Battle)","velx":"0.0","vely":"0.0","files":["powerplant-battle.animation","powerplant-battle.png"],"author":"K1rbYat1Na","credit":false,"game":"EXE1/BN1","preview":"powerplant-battle.animation"},
    {"name":"Internet1 Daytime","velx":".3","vely":".15","files":["Internet1BGDaytime.png","Internet1BGDaytime.animation"],"author":["D3str0yed","BlaXun","Indiana"],"credit":false,"game":"EXE4.5","preview":"Internet1BGDaytime.animation"},
    {"name":"Generic - Green","velx":"0.455","vely":"0.245","files":["01-generic1.png","01-generic1.animation"],"author":"K1rbYat1Na","credit":false,"game":"EXE6/BN6","preview":"01-generic1.animation"},
    {"name":"Generic - Purple","velx":"0.455","vely":"0.245","files":["01-generic2.png","01-generic2.animation"],"author":"K1rbYat1Na","credit":false,"game":"EXE6/BN6","preview":"01-generic2.animation"},
    {"name":"Central Area","velx":"0.225","vely":"0.225","files":["07a-centralarea.png","07a-centralarea.animation"],"author":"K1rbYat1Na","credit":false,"game":"EXE6/BN6","preview":"07a-centralarea.animation"},
    {"name":"Seaside Area","velx":"0.225","vely":"0.225","files":["07b-seasidearea.png","07b-seasidearea.animation"],"author":"K1rbYat1Na","credit":false,"game":"EXE6/BN6","preview":"07b-seasidearea.animation"},
    {"name":"Green Area","velx":"0.225","vely":"0.225","files":["07c-greenarea.png","07c-greenarea.animation"],"author":"K1rbYat1Na","credit":false,"game":"EXE6/BN6","preview":"07c-greenarea.animation"},
    {"name":"Sky Area","velx":"0.225","vely":"0.225","files":["07d-skyarea.png","07d-skyarea.animation"],"author":"K1rbYat1Na","credit":false,"game":"EXE6/BN6","preview":"07d-skyarea.animation"},
    {"name":"Akihara Area","velx":"0.225","vely":"0.225","files":["07e-akihara.png","07e-akihara.animation"],"author":"K1rbYat1Na","credit":false,"game":"EXE6/BN6","preview":"07e-akihara.animation"},
    {"name":"Undernet","velx":"0","vely":"0","files":["08a-undernet.png","08a-undernet.animation"],"author":"K1rbYat1Na","credit":false,"game":"EXE6/BN6","preview":"08a-undernet.animation"},
    {"name":"Underground","velx":"0","vely":"0","files":["08b-underground.png","08b-underground.animation"],"author":"K1rbYat1Na","credit":false,"game":"EXE6/BN6","preview":"08b-underground.animation"},
    {"name":"Graveyard","velx":"-0.0295","vely":"0","files":["09-graveyard.animation","09-graveyard.png"],"author":"K1rbYat1Na","credit":false,"game":"EXE6/BN6","preview":"09-graveyard.animation"},
    {"name":"Aquarium Comp","velx":"0.115","vely":"0","files":["11-aquarium.png","11-aquarium.animation"],"author":"K1rbYat1Na","credit":false,"game":"EXE6/BN6","preview":"11-aquarium.animation"},
    {"name":"Weather Comp - Stormy","velx":"0.125","vely":"0.125","files":["14-weatherkunnodennou1.png","14-weatherkunnodennou1.animation"],"author":"K1rbYat1Na","credit":false,"game":"EXE6/BN6","preview":"14-weatherkunnodennou1.animation"},
    {"name":"Weather Comp - Sunny","velx":"0.125","vely":"0.125","files":["14-weatherkunnodennou2.png","14-weatherkunnodennou2.animation"],"author":"K1rbYat1Na","credit":false,"game":"EXE6/BN6","preview":"14-weatherkunnodennou2.animation"},
    {"name":"Copybot Comp","velx":"0","vely":"-0.125","files":["15-copybot.png","15-copybot.animation"],"author":"K1rbYat1Na","credit":false,"game":"EXE6/BN6","preview":"15-copybot.animation"},
    {"name":"Green's HP","velx":"0.115","vely":"0.065","files":["04-greennohp.png","04-greennohp.animation"],"author":"K1rbYat1Na","credit":false,"game":"EXE6/BN6","preview":"04-greennohp.animation"},
    {"name":"Netto's HP","velx":"0.115","vely":"0.065","files":["02-nettonohp.png","02-nettonohp.animation"],"author":"K1rbYat1Na","credit":false,"game":"EXE6/BN6","preview":"02-nettonohp.animation"},
    {"name":"Sky's HP","velx":"0.115","vely":"0.065","files":["05-skynohp.png","05-skynohp.animation"],"author":"K1rbYat1Na","credit":false,"game":"EXE6/BN6","preview":"05-skynohp.animation"},
    {"name":"Aquarium's HP","velx":"0.115","vely":"0.065","files":["03-aquariumhp.png","03-aquariumhp.animation"],"author":"K1rbYat1Na","credit":false,"game":"EXE6/BN6","preview":"03-aquariumhp.animation"},
    {"name":"","velx":"","vely":"","files":[".png",".animation"],"author":"K1rbYat1Na","credit":false,"game":"EXE6/BN6","preview":".animation"},
    {"name":"","velx":"","vely":"","files":[".png",".animation"],"author":"K1rbYat1Na","credit":false,"game":"EXE6/BN6","preview":".animation"},

/*

    {"name":"","velx":"","vely":"","files":["",""],"author":"unknown","credit":false,"game":"","preview":""},

*/
];

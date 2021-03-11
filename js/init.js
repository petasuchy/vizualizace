
// inicializace globalnich promennych
var kraje = [];
var okresy = [];
var pocetObyvatelCR = 0;
var nutsToIdMap = [];
var dataModified ="";

function drawInfo(item){
    document.getElementById("popis").innerHTML="<b>"+item.jmeno+"</b> ("+item.pocetObyvatel+" obyvatel ["+Math.round(10000*item.pocetObyvatel/pocetObyvatelCR)/100+"%])<br>Okresy ("+item.okresy.length+"):<br><ul>";
            item.okresy.forEach(function(polozka){
                document.getElementById("popis").innerHTML+="<li>"+okresy[polozka].jmeno+"</li>";
            });
            document.getElementById("popis").innerHTML+="</ul>";
}
 
function attachListeners(){
    kraje.forEach(function(item){
        document.getElementById(item.id).addEventListener('mouseenter', function(e) {
            // document.getElementById(item.id).style.fill="#ff00cc";
            document.getElementById(item.id).style["fill-opacity"]=1;
            drawInfo(item);
            
        }); 
        document.getElementById(item.id).addEventListener('mouseout', function(e) {
            document.getElementById(item.id).style["fill-opacity"]="";
            document.getElementById("popis").innerHTML="";
        });
    });
}

function loadDynamicData(jsonString){
    var json = JSON.parse(jsonString);
    kraje.forEach(function(kraj, index){
        kraj.ockovani = {celkem:0, prvniDavka: 0, druhaDavka: 0};
        nutsToIdMap[kraj.nutsKod]=index;
    });
    dataModified = json.modified;
    json.data.forEach(function(item){
        kraje[nutsToIdMap[item.kraj_nuts_kod]].ockovani.celkem+=item.celkem_davek;
        kraje[nutsToIdMap[item.kraj_nuts_kod]].ockovani.prvniDavka+=item.prvnich_davek;
        kraje[nutsToIdMap[item.kraj_nuts_kod]].ockovani.druhaDavka+=item.druhych_davek;    
    });
    attachListeners();
    animateData();    
}

function loadStaticData(jsonString){
    var json = JSON.parse(jsonString);
    kraje = json.kraje;
    okresy = json.okresy;
    pocetObyvatelCR=json.populace;
    
    // Nacteme staticka data z JSON souboru na hostingu
    fetch('https://onemocneni-aktualne.mzcr.cz/api/v2/covid-19/ockovani.json')
    .then(response => response.text())
    .then(data => loadDynamicData(data));
}

// Nacteme staticka data z JSON souboru na hostingu
fetch('data/staticData.json')
  .then(response => response.text())
  .then(data => loadStaticData(data));
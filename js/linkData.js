

/**
 * Nacita demograficka data z CSV stringu
 * @param {string} csvData - CSV string s demografickymi daty
 */
 function loadDemography(csvData){
    var data = $.csv.toObjects(csvData);
    data.forEach(function(item){
        kraje.forEach(function(kraj){
            //console.log (kraj.vuscKod, parseInt(item.vuzemi_kod)-2999);
            //if(kraj.vuscKod == (parseInt(item.vuzemi_kod)-2999)){
            if(kraj.jmeno == item.vuzemi_txt){
                pocetObyvatelCR+=parseInt(item.hodnota);
                kraj.pocetObyvatel+=parseInt(item.hodnota);
                kraj.demografie[item.vek_kod] = parseInt(item.hodnota);
            }
        });
    });
 }
 
/**
 * Z XML stringu naplni data o krajich do tabulky kraje
 * @param {string} data - XML string s daty o krajich
 */
function loadKraje(data, nacistOkresy){
    var parser, xmlDoc;
    parser = new DOMParser();
    xmlDoc = parser.parseFromString(data,"text/xml");
    var i;
    var vuscElements = xmlDoc.getElementsByTagName("Vusc");
    for (i=0; i<vuscElements.length; i++){
            var kod = parseInt(vuscElements[i].childNodes[1].childNodes[0].nodeValue);
            var nazev = vuscElements[i].childNodes[3].childNodes[0].nodeValue;
            var id = vuscElements[i].childNodes[5].childNodes[0].nodeValue;
            var nuts = vuscElements[i].childNodes[7].childNodes[0].nodeValue;
            kraje[i]={
                vuscKod: kod,
                nutsKod: nuts,
                id: id,
                jmeno: nazev,
                okresy: [],
                pocetObyvatel: 0,
                demografie: {},
            }
        }
   // console.log(kraje);
   
   // kdyz jsou nactene kraje, mam nacist i okresy?
   if (nacistOkresy){
   fetch('data/okresy.xml')
  .then(response => response.text())
  .then(data => loadOkresy(data));
  }
}

/**
 * Z XML stringu naplni data o okresech do tabulky okresy a zajisti vazby ke krajum
 * @param {string} data - XML string s daty o okresech
 */
function loadOkresy(data){
    var parser, xmlDoc;
    parser = new DOMParser();
    xmlDoc = parser.parseFromString(data,"text/xml");
    var i;
    var okresElements = xmlDoc.getElementsByTagName("Okres");
    for (i=0; i<okresElements.length; i++){
            var kod = okresElements[i].childNodes[1].childNodes[0].nodeValue;
            var nazev = okresElements[i].childNodes[3].childNodes[0].nodeValue;
            var vuscKod = parseInt(okresElements[i].childNodes[5].childNodes[0].nodeValue);
            okresy[i]={
                kod: kod,
                jmeno: nazev,
                vusc: vuscKod,
            }
            kraje.forEach(function(item){
                if(item.vuscKod == vuscKod){
                    item.okresy.push(i);
                }
            });
        }
}


// Nacteme data o krajich a okresech z XML souboru na hostingu
fetch('data/kraje.xml')
  .then(response => response.text())
  .then(data => loadKraje(data, true));
  
// Nacteme demograficka data z CSV souboru na hostingu
fetch('data/demografie.csv')
  .then(response => response.text())
  .then(data => loadDemography(data));
  
  
  //code before the pause
setTimeout(function(){
    attachListeners(kraje);
    console.log(kraje);
    console.log(okresy);
    console.log(JSON.stringify({okresy: okresy, kraje: kraje, populace: pocetObyvatelCR}));
}, 10000);  
    



// inicializace globalnich promennych
var kraje = [];
var okresy = [];
var ockovaciZaznamy = [];
var pocetObyvatelCR = 0;
var nutsToIdMap = [];
var dataModified = "";
var dateEpochString = "2020-12-27";
var dateEpoch = new Date(dateEpochString);
var problemoveOckovani = 0;
var animation = {
    reference: "",
    isRunning: false,
}

function prepareDayObject(idKraje, idDne, zaznam) {
    if (idDne <= 0) return;
    if (typeof kraje[idKraje].prubeznaSuma[idDne] === 'undefined') {
        if (typeof kraje[idKraje].prubeznaSuma[idDne - 1] === 'undefined') {
            // predchozi neexistuje, takze rekurzivne zavolam sama sebe
            prepareDayObject(idKraje, idDne - 1);
        }
        // zkopirovat
        kraje[idKraje].prubeznaSuma[idDne] = Object.assign({}, kraje[idKraje].prubeznaSuma[idDne - 1]);
        var datumZaznamu = new Date(dateEpoch.getTime());
        datumZaznamu.setDate(27 + idDne);
        var mesic = "0" + (datumZaznamu.getMonth() + 1);
        var den = "0" + datumZaznamu.getDate();
        kraje[idKraje].prubeznaSuma[idDne].datum = datumZaznamu.getFullYear() + "-" + mesic.slice(-2) + "-" + den.slice(-2);
    } else { return; }
}

/**
 * spocte pocet dnu mezi dvema daty
 * @param {Date} date1 prvni datum 
 * @param {Date} date2 druhe datum
 * @returns {number} rozdil ve dnech
 */
function countDaysBetweenDates(date1, date2) {
    var diff = Math.abs(date2.getTime() - date1.getTime()) / (1000 * 3600 * 24);
    if (diff > 500) {
        console.log(dateEpoch);
        console.log(dateEpochString);
        console.log(date1);
        console.log(date2);
    }
    return diff;
}

function attachListeners() {
    kraje.forEach(function (item) {
        document.getElementById(item.id).addEventListener('mouseenter', function (e) {
            // document.getElementById(item.id).style.fill="#ff00cc";
            document.getElementById(item.id).style["fill-opacity"] = 1;
            drawInfo(item);
            stopAnimation();
        });
        document.getElementById(item.id).addEventListener('mouseout', function (e) {
            document.getElementById(item.id).style["fill-opacity"] = "";
            document.getElementById("popis").innerHTML = "";
            startAnimation();
        });
    });
}

function prepareSums() {
    kraje.forEach(function (kraj) {
        kraj.ockovani = { celkem: 0, prvniDavka: 0, druhaDavka: 0 };
        kraj.prubeznaSuma = [];
        kraj.prubeznaSuma[0] = {
            datum: dateEpochString,
            celkem: 0,
            prvniDavka: 0,
            druhaDavka: 0,
            vakcina: [
                { nazev: "Comirnaty", suma: 0 },
                { nazev: "AstraZeneca", suma: 0 },
                { nazev: "Moderna", suma: 0 }
            ],
            vekova_skupina: [
                { nazev: "0-17", celkem: 0, prvniDavka: 0, druhaDavka: 0, vakcina: [0, 0, 0] },
                { nazev: "18-24", celkem: 0, prvniDavka: 0, druhaDavka: 0, vakcina: [0, 0, 0] },
                { nazev: "25-29", celkem: 0, prvniDavka: 0, druhaDavka: 0, vakcina: [0, 0, 0] },
                { nazev: "30-34", celkem: 0, prvniDavka: 0, druhaDavka: 0, vakcina: [0, 0, 0] },
                { nazev: "35-39", celkem: 0, prvniDavka: 0, druhaDavka: 0, vakcina: [0, 0, 0] },
                { nazev: "40-44", celkem: 0, prvniDavka: 0, druhaDavka: 0, vakcina: [0, 0, 0] },
                { nazev: "45-49", celkem: 0, prvniDavka: 0, druhaDavka: 0, vakcina: [0, 0, 0] },
                { nazev: "50-54", celkem: 0, prvniDavka: 0, druhaDavka: 0, vakcina: [0, 0, 0] },
                { nazev: "55-59", celkem: 0, prvniDavka: 0, druhaDavka: 0, vakcina: [0, 0, 0] },
                { nazev: "60-64", celkem: 0, prvniDavka: 0, druhaDavka: 0, vakcina: [0, 0, 0] },
                { nazev: "65-69", celkem: 0, prvniDavka: 0, druhaDavka: 0, vakcina: [0, 0, 0] },
                { nazev: "70-74", celkem: 0, prvniDavka: 0, druhaDavka: 0, vakcina: [0, 0, 0] },
                { nazev: "75-79", celkem: 0, prvniDavka: 0, druhaDavka: 0, vakcina: [0, 0, 0] },
                { nazev: "80+", celkem: 0, prvniDavka: 0, druhaDavka: 0, vakcina: [0, 0, 0] },
            ],
        }
    });

    ockovaciZaznamy.forEach(function (item) {
        kraje[nutsToIdMap[item.kraj_nuts_kod]].ockovani.celkem += item.celkem_davek;
        kraje[nutsToIdMap[item.kraj_nuts_kod]].ockovani.prvniDavka += item.prvnich_davek;
        kraje[nutsToIdMap[item.kraj_nuts_kod]].ockovani.druhaDavka += item.druhych_davek;
    });

    ockovaciZaznamy.forEach(function (zaznam) {
        var index = countDaysBetweenDates(dateEpoch, new Date(zaznam.datum));
        var indexVakciny;
        switch (zaznam.vakcina) {
            case "Comirnaty":
                indexVakciny = 0;
                break;
            case "COVID-19 Vaccine AstraZeneca":
                indexVakciny = 1;
                break;
            case "COVID-19 Vaccine Moderna":
                indexVakciny = 2;
                break;
            default:
                indexVakciny = -1;
                problemoveOckovani += zaznam.celkem_davek;
                console.log("Problemove ockovani: Neznama vakcina (" + zaznam.vakcina + ")");
        }
        var indexSkupiny;
        switch (zaznam.vekova_skupina) {
            case "0-17":
                indexSkupiny = 0;
                break;
            case "18-24":
                indexSkupiny = 1;
                break;
            case "25-29":
                indexSkupiny = 2;
                break;
            case "30-34":
                indexSkupiny = 3;
                break;
            case "35-39":
                indexSkupiny = 4;
                break;
            case "40-44":
                indexSkupiny = 5;
                break;
            case "45-49":
                indexSkupiny = 6;
                break;
            case "50-54":
                indexSkupiny = 7;
                break;
            case "55-59":
                indexSkupiny = 8;
                break;
            case "60-64":
                indexSkupiny = 9;
                break;
            case "65-69":
                indexSkupiny = 10;
                break;
            case "70-74":
                indexSkupiny = 11;
                break;
            case "75-79":
                indexSkupiny = 12;
                break;
            case "80+":
                indexSkupiny = 13;
                break;
            default:
                indexSkupiny = -1;
                problemoveOckovani += zaznam.celkem_davek;
                console.log("Problemove ockovani: Neznama vekova skupina (" + zaznam.vekova_skupina + ")");
        }

        if (typeof kraje[nutsToIdMap[zaznam.kraj_nuts_kod]].prubeznaSuma[index] === 'undefined') {
            prepareDayObject(nutsToIdMap[zaznam.kraj_nuts_kod], index, zaznam);
        }
        kraje[nutsToIdMap[zaznam.kraj_nuts_kod]].prubeznaSuma[index].celkem += zaznam.celkem_davek;
        kraje[nutsToIdMap[zaznam.kraj_nuts_kod]].prubeznaSuma[index].prvniDavka += zaznam.prvnich_davek;
        kraje[nutsToIdMap[zaznam.kraj_nuts_kod]].prubeznaSuma[index].druhaDavka += zaznam.druhych_davek;

        if (indexVakciny >= 0) {
            // console.log("index: " + index + ", indexVakciny: " + indexVakciny + ", zaznam.celkem_davek: " + zaznam.celkem_davek);
            kraje[nutsToIdMap[zaznam.kraj_nuts_kod]].prubeznaSuma[index].vakcina[indexVakciny].suma += zaznam.celkem_davek;
        }
        if (indexSkupiny >= 0) {
            kraje[nutsToIdMap[zaznam.kraj_nuts_kod]].prubeznaSuma[index].vekova_skupina[indexSkupiny].celkem += zaznam.celkem_davek;
            kraje[nutsToIdMap[zaznam.kraj_nuts_kod]].prubeznaSuma[index].vekova_skupina[indexSkupiny].prvniDavka += zaznam.prvnich_davek;
            kraje[nutsToIdMap[zaznam.kraj_nuts_kod]].prubeznaSuma[index].vekova_skupina[indexSkupiny].druhaDavka += zaznam.druhych_davek;
        }
        if (indexSkupiny >= 0 && indexVakciny >= 0) {
            kraje[nutsToIdMap[zaznam.kraj_nuts_kod]].prubeznaSuma[index].vekova_skupina[indexSkupiny].vakcina[indexVakciny] += zaznam.celkem_davek;
        }
    });
    //console.log(problemoveOckovani)
    console.log(kraje);
}

function initializeView() {
    prepareSums();
    attachListeners();
    animateData();
    //startAnimation();   
}

function loadDynamicData(jsonString) {
    var json = JSON.parse(jsonString);
    dataModified = json.modified;
    json.data.forEach(function (item) {
        var zaznam = {
            datum: item.datum,
            vakcina: item.vakcina,
            kraj_nuts_kod: item.kraj_nuts_kod,
            vekova_skupina: item.vekova_skupina,
            prvnich_davek: item.prvnich_davek,
            druhych_davek: item.druhych_davek,
            celkem_davek: item.celkem_davek
        }
        ockovaciZaznamy.push(zaznam);
    });
    ockovaciZaznamy.sort(function (a, b) {
        return a.datum.localeCompare(b.datum);
    });
    //console.log(ockovaciZaznamy);
    initializeView();
}

function loadStaticData(jsonString) {
    var json = JSON.parse(jsonString);
    kraje = json.kraje;
    okresy = json.okresy;
    pocetObyvatelCR = json.populace;

    kraje.forEach(function (kraj, index) {
        nutsToIdMap[kraj.nutsKod] = index;
    });

    // Nacteme staticka data z JSON souboru na hostingu
    fetch('https://onemocneni-aktualne.mzcr.cz/api/v2/covid-19/ockovani.json')
        .then(response => response.text())
        .then(data => loadDynamicData(data));
}

// jakmile je dokument nacten
$(document).ready(function () {
    // Nacteme staticka data z JSON souboru na hostingu
    fetch('data/staticData.json')
        .then(response => response.text())
        .then(data => loadStaticData(data));
});

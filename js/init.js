
// inicializace globalnich promennych
var kraje = [];
var okresy = [];
var republika;
var ockovaciZaznamy = [];
var nutsToIdMap = [];
var dataModified = "";
var dateEpochString = "2020-12-27";
var toDateString = "2020-12-27";
var dateEpoch = new Date(dateEpochString);
var toDate = new Date(toDateString);
var lastVaccineDate;
var lastVaccineDateString;
var timelineDayCount = 0;
var problemoveOckovani = 0;
var animation = {
    reference: "",
    isRunning: false,
    wasRunning: false,
}
var krajSelected = {
    status: false,
    kraj: null,
}

function prepareDayObject(idKraje, idDne) {
    if (idDne <= 0) return;
    if (typeof kraje[idKraje].prubeznaSuma[idDne] === 'undefined') {
        if (typeof kraje[idKraje].prubeznaSuma[idDne - 1] === 'undefined') {
            // predchozi neexistuje, takze rekurzivne zavolam sama sebe
            prepareDayObject(idKraje, idDne - 1);
        }
        // zkopirovat
        // kraje[idKraje].prubeznaSuma[idDne] = Object.assign({}, kraje[idKraje].prubeznaSuma[idDne - 1]);
        kraje[idKraje].prubeznaSuma[idDne] = JSON.parse(JSON.stringify(kraje[idKraje].prubeznaSuma[idDne - 1]));
        var datumZaznamu = new Date(dateEpoch.getTime());
        datumZaznamu.setDate(27 + idDne);
        var mesic = "0" + (datumZaznamu.getMonth() + 1);
        var den = "0" + datumZaznamu.getDate();
        kraje[idKraje].prubeznaSuma[idDne].datum = datumZaznamu.getFullYear() + "-" + mesic.slice(-2) + "-" + den.slice(-2);
    } else { return; }
}

function prepareDayObjectRepublika(idDne) {
    if (idDne <= 0) return;
    if (typeof republika.prubeznaSuma[idDne] === 'undefined') {
        if (typeof republika.prubeznaSuma[idDne - 1] === 'undefined') {
            // predchozi neexistuje, takze rekurzivne zavolam sama sebe
            prepareDayObjectRepublika(idDne - 1);
        }
        // zkopirovat
        // kraje[idKraje].prubeznaSuma[idDne] = Object.assign({}, kraje[idKraje].prubeznaSuma[idDne - 1]);
        republika.prubeznaSuma[idDne] = JSON.parse(JSON.stringify(republika.prubeznaSuma[idDne - 1]));
        var datumZaznamu = new Date(dateEpoch.getTime());
        datumZaznamu.setDate(27 + idDne);
        var mesic = "0" + (datumZaznamu.getMonth() + 1);
        var den = "0" + datumZaznamu.getDate();
        republika.prubeznaSuma[idDne].datum = datumZaznamu.getFullYear() + "-" + mesic.slice(-2) + "-" + den.slice(-2);
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
    return diff;
}

function dateToDateString(date) {
    var mesic = "0" + (date.getMonth() + 1);
    var den = "0" + date.getDate();
    return date.getFullYear() + "-" + mesic.slice(-2) + "-" + den.slice(-2);
}

function attachListeners() {
    // pauzovani animace mezernikem
    document.addEventListener('keydown', event => {
        if (event.code === 'Space') {
            spacebarListener();
        }
    })

    kraje.forEach(function (item) {
        document.getElementById(item.id).addEventListener('mouseenter', function (e) {
            // document.getElementById(item.id).style.fill="#ff00cc";
            document.getElementById(item.id).style["fill-opacity"] = 1;
            if (!krajSelected.status) {
                drawInfo(item);
            }
            if (animation.isRunning) {
                stopAnimation();
                animation.wasRunning = true;
            } else {
                animation.wasRunning = false;
            }
        });
        document.getElementById(item.id).addEventListener('click', function (e) {
            document.getElementById(item.id).style["fill-opacity"] = 1;
            drawInfo(item);
            if (krajSelected.status) {
                if (krajSelected.kraj.id != item.id) {
                    document.getElementById(krajSelected.kraj.id).style["fill-opacity"] = "";
                } else {
                    krajSelected.status = false;
                    krajSelected.kraj = null;
                    return;
                }
            }
            krajSelected.status = true;
            krajSelected.kraj = item;
        });
        document.getElementById(item.id).addEventListener('mouseout', function (e) {
            if (!krajSelected.status || (krajSelected.status && krajSelected.kraj.id != item.id)) {
                document.getElementById(item.id).style["fill-opacity"] = "";
            }
            if (!krajSelected.status) {
                document.getElementById("detail").style["display"] = "none";
            }
            if (animation.wasRunning) {
                startAnimation();
            }
        });
    });
}

function prepareSums() {
    // pripravime datove struktury republiky
    republika.prubeznaSuma = [];
    republika.prubeznaSuma[0] = {
        datum: dateEpochString,
        celkem: 0,
        prvniDavka: 0,
        druhaDavka: 0,
        vakcina: [
            { nazev: "Comirnaty", suma: 0, prvniDavka: 0, druhaDavka: 0 },
            { nazev: "AstraZeneca", suma: 0, prvniDavka: 0, druhaDavka: 0 },
            { nazev: "Moderna", suma: 0, prvniDavka: 0, druhaDavka: 0 }
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
            { nazev: "80", celkem: 0, prvniDavka: 0, druhaDavka: 0, vakcina: [0, 0, 0] },
        ],
    }

    // pripravime datove struktury vsech kraju
    kraje.forEach(function (kraj) {
        kraj.prubeznaSuma = [];
        kraj.prubeznaSuma[0] = {
            datum: dateEpochString,
            celkem: 0,
            prvniDavka: 0,
            druhaDavka: 0,
            vakcina: [
                { nazev: "Comirnaty", suma: 0, prvniDavka: 0, druhaDavka: 0 },
                { nazev: "AstraZeneca", suma: 0, prvniDavka: 0, druhaDavka: 0 },
                { nazev: "Moderna", suma: 0, prvniDavka: 0, druhaDavka: 0 }
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
                { nazev: "80", celkem: 0, prvniDavka: 0, druhaDavka: 0, vakcina: [0, 0, 0] },
            ],
        }
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
            // console.log("Problemove ockovani: Neznama vakcina (" + zaznam.vakcina + ")");
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
            //console.log("Problemove ockovani: Neznama vekova skupina (" + zaznam.vekova_skupina + ")");
        }

        // zkontrolujeme, jestli ockovani dokazeme priradit ke kraji
        var krajExists;
        if (zaznam.kraj_nuts_kod == "") {
            // console.log("Problemove ockovani: Neznamy kraj");
            problemoveOckovani += zaznam.celkem_davek;
            krajExists = false;
        } else {
            krajExists = true;
        }

        // zkontrolujeme, jestli uz jsou pro dany den pripraveny struktury a pripadne je pripravime
        if (krajExists && typeof kraje[nutsToIdMap[zaznam.kraj_nuts_kod]].prubeznaSuma[index] === 'undefined') {
            prepareDayObject(nutsToIdMap[zaznam.kraj_nuts_kod], index);
        }
        if (typeof republika.prubeznaSuma[index] === 'undefined') {
            prepareDayObjectRepublika(index);
        }

        // pricist pocty davek
        republika.prubeznaSuma[index].celkem += zaznam.celkem_davek;
        republika.prubeznaSuma[index].prvniDavka += zaznam.prvnich_davek;
        republika.prubeznaSuma[index].druhaDavka += zaznam.druhych_davek;
        if (krajExists) {
            kraje[nutsToIdMap[zaznam.kraj_nuts_kod]].prubeznaSuma[index].celkem += zaznam.celkem_davek;
            kraje[nutsToIdMap[zaznam.kraj_nuts_kod]].prubeznaSuma[index].prvniDavka += zaznam.prvnich_davek;
            kraje[nutsToIdMap[zaznam.kraj_nuts_kod]].prubeznaSuma[index].druhaDavka += zaznam.druhych_davek;
        }

        // pricist zaznamy vakcin
        if (indexVakciny >= 0) {
            republika.prubeznaSuma[index].vakcina[indexVakciny].suma += zaznam.celkem_davek;
            republika.prubeznaSuma[index].vakcina[indexVakciny].prvniDavka += zaznam.prvnich_davek;
            republika.prubeznaSuma[index].vakcina[indexVakciny].druhaDavka += zaznam.druhych_davek;
            if (krajExists) {
                kraje[nutsToIdMap[zaznam.kraj_nuts_kod]].prubeznaSuma[index].vakcina[indexVakciny].suma += zaznam.celkem_davek;
                kraje[nutsToIdMap[zaznam.kraj_nuts_kod]].prubeznaSuma[index].vakcina[indexVakciny].prvniDavka += zaznam.prvnich_davek;
                kraje[nutsToIdMap[zaznam.kraj_nuts_kod]].prubeznaSuma[index].vakcina[indexVakciny].druhaDavka += zaznam.druhych_davek;
            }
        }

        // pricist zaznamy vekovych skupin
        if (indexSkupiny >= 0) {
            republika.prubeznaSuma[index].vekova_skupina[indexSkupiny].celkem += zaznam.celkem_davek;
            republika.prubeznaSuma[index].vekova_skupina[indexSkupiny].prvniDavka += zaznam.prvnich_davek;
            republika.prubeznaSuma[index].vekova_skupina[indexSkupiny].druhaDavka += zaznam.druhych_davek;
            if (krajExists) {
                kraje[nutsToIdMap[zaznam.kraj_nuts_kod]].prubeznaSuma[index].vekova_skupina[indexSkupiny].celkem += zaznam.celkem_davek;
                kraje[nutsToIdMap[zaznam.kraj_nuts_kod]].prubeznaSuma[index].vekova_skupina[indexSkupiny].prvniDavka += zaznam.prvnich_davek;
                kraje[nutsToIdMap[zaznam.kraj_nuts_kod]].prubeznaSuma[index].vekova_skupina[indexSkupiny].druhaDavka += zaznam.druhych_davek;
            }
        }

        // pricist zaznamy vakcin u konkretnich vekovych skupin
        if (indexSkupiny >= 0 && indexVakciny >= 0) {
            republika.prubeznaSuma[index].vekova_skupina[indexSkupiny].vakcina[indexVakciny] += zaznam.celkem_davek;
            if (krajExists) {
                kraje[nutsToIdMap[zaznam.kraj_nuts_kod]].prubeznaSuma[index].vekova_skupina[indexSkupiny].vakcina[indexVakciny] += zaznam.celkem_davek;
            }
            
        }
    });

    // ujistime se, ze jsou vyplneny sumy pro vsechny dny a vsechny kraje (pokud se v kraji napriklad v nedeli neockovalo, chybel soucet a aplikace padala s chybou)
    var lastVaccineDateIndex = countDaysBetweenDates(dateEpoch, lastVaccineDate);
    kraje.forEach(function(kraj, idKraje){
        if (typeof kraj.prubeznaSuma[lastVaccineDateIndex] === 'undefined') {
            prepareDayObject(idKraje, lastVaccineDateIndex);
        }
    });

    //console.log(problemoveOckovani)
    //console.log(republika);
}

function initializeView() {
    prepareSums();
    attachListeners();
    toDate = new Date(dateEpochString);
    var modifiedDate = new Date(dataModified)
    document.getElementById("modified").innerHTML = modifiedDate.getDate() + ".&nbsp;" + (modifiedDate.getMonth() + 1) + ".&nbsp;" + modifiedDate.getFullYear() + "&nbsp;" + ("0" + modifiedDate.getHours()).slice(-2) + ":" + ("0" + modifiedDate.getMinutes()).slice(-2);

    drawBarvyKraju();
    startAnimation();
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
    lastVaccineDateString = ockovaciZaznamy[ockovaciZaznamy.length - 1].datum;
    lastVaccineDate = new Date(lastVaccineDateString);
    timelineDayCount = countDaysBetweenDates(lastVaccineDate, dateEpoch);
    document.getElementById("timeline").setAttribute("max", timelineDayCount);
    var mesic = "0" + (lastVaccineDate.getMonth() + 1);
    var den = "0" + lastVaccineDate.getDate();
    document.getElementById("dateInput").setAttribute("max", dateToDateString(lastVaccineDate));
    initializeView();
}

function loadStaticData(jsonString) {
    var json = JSON.parse(jsonString);
    kraje = json.kraje;
    okresy = json.okresy;
    republika = json.republika;

    kraje.forEach(function (kraj, index) {
        nutsToIdMap[kraj.nutsKod] = index;
    });

    // Nacteme dynamicka data z JSON souboru na strankach MZCR
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

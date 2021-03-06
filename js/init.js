
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
        republika.prubeznaSuma[idDne] = JSON.parse(JSON.stringify(republika.prubeznaSuma[idDne - 1]));
        var datumZaznamu = new Date(dateEpoch.getTime());
        datumZaznamu.setDate(27 + idDne);
        var mesic = "0" + (datumZaznamu.getMonth() + 1);
        var den = "0" + datumZaznamu.getDate();
        republika.prubeznaSuma[idDne].datum = datumZaznamu.getFullYear() + "-" + mesic.slice(-2) + "-" + den.slice(-2);
    } else { return; }
}

function countIncrements(subject, lastIndex) {
    // zkontrolujeme platnost indexu
    if (lastIndex < 0) return;

    // spocteme prirustky odectenim sum dvou po sobe jdoucich dni. Pro prvni den (index nula) se odecita 0.
    var i;
    for (i = 0; i <= lastIndex; i++) {
        var previousExists = typeof subject.prubeznaSuma[i - 1] === 'undefined';
        subject.prubeznaSuma[i].celkemPrirustek = subject.prubeznaSuma[i].celkem - (previousExists ? 0 : subject.prubeznaSuma[i - 1].celkem);
        subject.prubeznaSuma[i].prvniDavkaPrirustek = subject.prubeznaSuma[i].prvniDavka - (previousExists ? 0 : subject.prubeznaSuma[i - 1].prvniDavka);
        subject.prubeznaSuma[i].druhaDavkaPrirustek = subject.prubeznaSuma[i].druhaDavka - (previousExists ? 0 : subject.prubeznaSuma[i - 1].druhaDavka);
        subject.prubeznaSuma[i].vekova_skupina.forEach(function (skupina, idx) {
            skupina.celkemPrirustek = subject.prubeznaSuma[i].vekova_skupina[idx].celkem - (previousExists ? 0 : subject.prubeznaSuma[i - 1].vekova_skupina[idx].celkem);
            skupina.prvniDavkaPrirustek = subject.prubeznaSuma[i].vekova_skupina[idx].prvniDavka - (previousExists ? 0 : subject.prubeznaSuma[i - 1].vekova_skupina[idx].prvniDavka);
            skupina.druhaDavkaPrirustek = subject.prubeznaSuma[i].vekova_skupina[idx].druhaDavka - (previousExists ? 0 : subject.prubeznaSuma[i - 1].vekova_skupina[idx].druhaDavka);
        });
    }
}

/**
 * spocte pocet dnu mezi dvema daty
 * @param {Date} dt1 prvni datum 
 * @param {Date} dt2 druhe datum
 * @returns {number} rozdil ve dnech
 */
function countDaysBetweenDates(dt1, dt2) {
    var diff = Math.abs(Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) / (1000 * 60 * 60 * 24)));
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
            { nazev: "Comirnaty (Pfizer)", suma: 0, prvniDavka: 0, druhaDavka: 0 },
            { nazev: "VAXZEVRIA (AstraZeneca)", suma: 0, prvniDavka: 0, druhaDavka: 0 },
            { nazev: "Moderna", suma: 0, prvniDavka: 0, druhaDavka: 0 },
            { nazev: "Janssen (J&J)", suma: 0, prvniDavka: 0, druhaDavka: 0 }
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
        kraj.prubeznaSuma[0] = JSON.parse(JSON.stringify(republika.prubeznaSuma[0]))
    });

    ockovaciZaznamy.forEach(function (zaznam) {
        var index = countDaysBetweenDates(dateEpoch, new Date(zaznam.datum));
        var indexVakciny;
        switch (zaznam.vakcina) {
            case "Comirnaty":
                indexVakciny = 0;
                break;
            case "VAXZEVRIA":
                indexVakciny = 1;
                break;
            case "COVID-19 Vaccine Moderna":
                indexVakciny = 2;
                break;
            case "COVID-19 Vaccine Janssen":
                indexVakciny = 3;
                break;
            default:
                indexVakciny = -1;
                problemoveOckovani += zaznam.celkem_davek;
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
        }

        // zkontrolujeme, jestli ockovani dokazeme priradit ke kraji
        var krajExists;
        if (zaznam.kraj_nuts_kod == "") {
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
    kraje.forEach(function (kraj, idKraje) {
        if (typeof kraj.prubeznaSuma[lastVaccineDateIndex] === 'undefined') {
            prepareDayObject(idKraje, lastVaccineDateIndex);
            console.log("Chybi soucet pro kraj " + kraj.jmeno);
        }
    });

    // spocteme a ulozime denni prirustky
    countIncrements(republika, lastVaccineDateIndex);
    kraje.forEach(function (kraj) {
        countIncrements(kraj, lastVaccineDateIndex);
    });
    console.log(republika);
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
